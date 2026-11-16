KHÔNG CHẮC: (1) Sửa lỗi CI vuốt mobile chưa kiểm được trong trình duyệt cục bộ: sandbox chặn Chromium (mach port Permission denied), chạy ngoài sandbox bị từ chối. 3 test tĩnh pass cục bộ, test hành vi chờ CI. (2) Hợp đồng ES1-T313 không có hook riêng cho nút đóng. JS đóng lớp khi bấm `[data-modal-close]` hoặc `.close-button` nằm trong dialog. Đề nghị FE đặt `data-modal-close` cho nút đóng ở các màn mới.

# ES1-T315 TE-10-R2-BE2: `assets/modal-dialog.js` (`<modal-dialog>`)

Nguồn: ADR 0007 mục 5, ADR 0010 (trần 2 048 B, tải sẵn từ layout), task-split §4 (hợp đồng TE-10-R2-FE2/BE2), foundation §15–§16, SRS TE-10 AC12, TE-3 AC10, TE-11 AC5, TE-18 AC8 (phần chung). Markup và CSS FE đã có: ES1-T313 (`.dialog`, `.drawer`, `modal-dialog { display: contents }`, chuyển động trong `prefers-reduced-motion: no-preference`) và `critical.css` (`html:has(dialog[scroll-lock][open])`).

## Thay đổi
- `assets/modal-dialog.js` (mới, 2 039 B ≤ 2 048):
  - `open(opener?)`:
    - Có `opener` thì focus vào đó; không có thì focus phần tử có id ghi ở `data-return-focus`.
    - Đóng lớp `<modal-dialog>` khác đang mở (một lớp một lúc).
    - Gọi `showModal()`: trình duyệt tự làm nền inert và giữ focus trong lớp.
    - Focus vào tiêu đề (id trong `aria-labelledby`, JS gắn `tabindex="-1"`). Có `[autofocus]` thì để focus ở phần tử đó.
    - Phát `modal:open`.
  - `close()`. Các đường đóng:
    - Nút `[data-modal-close]` hoặc `.close-button` trong dialog.
    - Chạm `::backdrop`: click có target là `<dialog>` và toạ độ nằm ngoài khung.
    - Esc và `<form method="dialog">`: native.
    - Vuốt xuống > 80 px khi viewport dưới `data-sheet-below`. Bỏ qua khi một vùng cuộn ở giữa điểm chạm và dialog đang có `scrollTop > 0`, hoặc khi vuốt ngang nhiều hơn vuốt dọc.
    - Mọi đường đóng phát `modal:close` từ sự kiện `close` của dialog.
  - Trả focus:
    - Dựa vào hành vi native: khi dialog đóng, trình duyệt trả focus về phần tử đang focus lúc gọi `showModal()`.
    - `open()` focus `opener` trước khi mở. Safari không focus nút khi bấm chuột, nên bước này vẫn cần.
    - Đổi lớp (quickview → cart): lớp cũ đóng, focus về nút mở của lớp cũ. Lớp mới mở ngay sau, nên khi lớp mới đóng focus cũng về nút đó (TE-3 AC10, quiz → quickview TE-11 AC7).
    - Popup tự mở không truyền `opener` nên focus về vị trí trước đó (TE-18 AC8).
  - Khoá cuộn: JS gắn `scroll-lock` lên `<dialog>`, CSS sẵn có trong `critical.css` làm phần còn lại. JS không viết style inline.
  - Theme editor: `shopify:block:select` ở block nằm trong lớp thì mở lớp, `deselect` thì đóng. Listener gỡ bằng AbortController ở `disconnectedCallback`; gắn lại element không để listener treo.
  - Listener `passive`. Không fetch, không import, không tạo DOM. Có guard `customElements.get`.
  - `prefers-reduced-motion`: JS không animate. Trượt, scale và fade đều là CSS FE nằm trong `no-preference`. Test kiểm 0 animation khi `reduce`.
- `tests/e2e/ES1-T315.spec.ts`: 15 test × 2 project.
  - Tĩnh: trần byte, hook, CSS khớp, layout có 1 thẻ script.
  - Fixture `page.setContent` dùng `base.css`, `critical.css` và JS thật: mở/Esc/trả focus, nút đóng, scrim, một lớp, `data-return-focus`, `autofocus` + `form method=dialog`, editor, reduce motion.
  - Mobile: vuốt sheet (đóng, ngắn, ngang, thân đang cuộn, ≥ 48rem, drawer).
  - Storefront: define trên 4 trang, 0 lỗi console.
- `drafts/dev-be/ES1-T315/pw-local.config.ts`: config chạy test fixture không cần globalSetup/preview.
- `layout/theme.liquid`: thẻ `<script src="{{ 'modal-dialog.js' | asset_url }}" type="module">` sau `page-layers.js` (Orchestrator thêm ở da1f3a7, ES1-T452). Spec ES1-T415 đổi từ 3 lên 4 thẻ module.

## Lượt 2: sửa CI đỏ ở mobile (run 43372602888)
- Test lỗi: "dưới 48rem: vuốt xuống > 80px đóng…", poll timeout vì sheet không đóng.
- Nguyên nhân nằm ở spec, JS đúng. Fixture `page.setContent` thiếu `<meta name="viewport">`. Project Pixel 7 có `isMobile` nên Chromium dựng layout viewport 980px. Khi đó `matchMedia('(min-width:48rem)')` đúng ở màn 412, và JS coi đây là dialog giữa màn nên bỏ qua vuốt.
- Trên storefront không gặp lỗi này vì `snippets/meta-tags.liquid` có `width=device-width,initial-scale=1`.
- Sửa: thêm meta viewport giống layout vào `mount()`. Cùng lỗi này làm 2 test vuốt còn lại (thân đang cuộn, ≥ 48rem/drawer) trước đây pass mà không kiểm được gì; giờ chúng kiểm đúng nhánh.
- `assets/modal-dialog.js` không đổi, vẫn 2 039 B.

## Hợp đồng cho module khác và FE
- Gọi API: `document.querySelector('modal-dialog[data-layer=cart]').open(button)` và `.close()`. Không import `modal-dialog.js` (ES1-T81).
- Sự kiện `modal:open` / `modal:close` (bubbles) phát trên `<modal-dialog>`. Tên lớp đọc từ `e.target.dataset.layer`; không có `detail`, bỏ để giữ trần byte.
- FE:
  - `aria-labelledby` trỏ đúng 1 id (tiêu đề).
  - Nút đóng có `data-modal-close` (hoặc class `.close-button`).
  - Sheet có `data-sheet-below="48rem"`; drawer không đặt thuộc tính này.
  - `data-return-focus` chỉ đặt khi lớp có nút mở cố định (cart).
  - Thẻ `<dialog>` không có padding riêng: con phải phủ kín khung, để click trên chính `<dialog>` trong khung không bị coi là chạm scrim. CSS ES1-T313 hiện đúng như vậy.
  - Gợi ý: style `:focus-visible` cho `.dialog__title`, `.drawer__title` khi nhận focus.
- Module cũ (`cart-drawer.js`, `quiz-dialog.js`, `product-media.js`, `header-menu.js`) chuyển sang `<modal-dialog>` trong task màn của chúng (ADR 0007 Hệ quả).

## Ngân sách JS (wc -c)
- `modal-dialog.js`: 2 039 B (trần 2 048, ≤ 8 192).
- Chung mọi trang: 29 096 ≤ 40 960 (ADR 0006). Gồm standard-events 888, motion 6 103, page-layers 2 031, modal-dialog 2 039, header-menu 6 862, header-sticky 1 680, cart-items 5 625, cart-drawer 3 868.
- Trần nhóm chung 19 456 B của ADR 0010 chưa đạt. Phần vượt do header-menu, cart-drawer, cart-items, motion chưa rút gọn (TE-10-R2-BE3, TE-5), không do file này.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 23 warning có sẵn, không warning nào thuộc file của PR. `.theme-check.yml` không đổi.
- `wc -c assets/modal-dialog.js` = 2 039. `node --check` OK. Không có `console.`, `fetch`, `import`, `.style`, `innerHTML`.
- Playwright `--list`: 30 test. Chạy cục bộ: 3 test tĩnh (JS, CSS, layout) pass. Test trình duyệt không chạy được vì sandbox chặn Chromium.
- Playwright trên preview, Lighthouse, console: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
