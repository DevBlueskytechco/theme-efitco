KHÔNG CHẮC: (1) header-drawer.js (ES1-T323, TE-1-R2-BE1) chưa làm; để header-menu.js về ≤ 3 072 B mà drawer không mất Esc/focus trap, phần drawer cũ được chuyển nguyên sang assets/header-drawer.js (3 010 B, nạp lười) — ES1-T323 viết lại trên file này (trượt cấp 2, Back, <modal-dialog>). (2) Hook data-mega-enhanced / data-mega-instant theo PR #216, câu hỏi ES1-T450 chưa có trả lời → dùng mặc định "giữ như PR ES1-T327". (3) Spec chưa chạy: chờ CI.

# ES1-T329 TE-22-R2-BE1: header-menu.js 6 862 → 3 064 B, mega từ 80rem

AC: TE-1 AC2 (từ 80rem) → TE-22; navigation.md §6, §8; ADR 0007 #6, ADR 0010 (header-menu ≤ 3 072, header-drawer ≤ 4 096 lười khi bấm nút menu). Sau TE-22-R2-FE2 (#216).

## Thay đổi
- `assets/header-menu.js` (viết lại, 3 064 B): chỉ mega A/B + dropdown C trong `[data-testid="header-menu"]`.
  - Hover chuột 150 ms (`pointerType === "mouse"`), bắt bằng `pointerover` ủy quyền trên header: mục cha → mở; mục không con → đóng; logo/icon → giữ; `header-scrim` → tính là rời header.
  - Enter/Space: native `<summary>`. Esc: đóng, trả focus về trigger nếu focus đang trong panel. Tab ra ngoài panel (focusout) → đóng. Panel không bẫy focus (disclosure).
  - `aria-expanded` đồng bộ trên mọi `<summary>` trong header lúc tải (gồm drawer, để có trạng thái trước khi nạp header-drawer.js) và theo `toggle` cho nav; `summary[data-layer="mega"][aria-expanded="true"]` → page-layers gắn `html[data-layer-open]`.
  - Gắn `data-mega-enhanced` lên root header → CSS #216 bật `pointer-events` cho scrim; bấm scrim đóng (scrim nằm trong summary, native).
  - `data-mega-instant`: gắn trước khi mở khi rê từ mục đang mở sang mục khác (bỏ animation mở, navigation.md §6); chỉ gỡ khi mọi mục đã đóng — gỡ lúc panel đang hiện sẽ đổi `animation: none` → `motion-drop` và chạy lại hiệu ứng.
  - Nút menu (`header-drawer-toggle`): `pointerenter`/`focusin`/`touchstart` lần đầu → `import(new URL("header-drawer.js", import.meta.url))` (cùng cách motion.js nạp motion-scrub.js). Lỗi mạng → bỏ cache promise, lần chạm sau thử lại; drawer vẫn chạy bằng `<details>`.
  - Bỏ `mount()` tạo phần tử: host `<header-menu>`/`<header-drawer>` đã có trong markup (ES1-T22); JS chỉ define có guard.
- `assets/header-drawer.js` (mới, 3 010 B, lười): class drawer chuyển từ header-menu.js, không đổi hành vi (Esc, ×, focus trap bỏ accordion đóng, đóng khi lên 80rem, trả focus về nút menu). Thêm: module nạp sau khi drawer đã mở (chạm nhanh) → `connectedCallback` đồng bộ `aria-expanded` và đưa focus vào nút đóng.
- Không đổi markup FE, không thêm thẻ `<script>` (header-drawer.js nạp bằng `import()` từ module có sẵn).
- `tests/e2e/ES1-T329.spec.ts` (mới); `tests/e2e/ES1-T16.spec.ts`: test resize chờ `customElements.get('header-drawer')` trước khi đổi viewport (nạp lười), bộ lọc console thêm `header-drawer`.

## Ngân sách JS (`wc -c`)
| File | Trước | Sau | Trần | Nạp |
| --- | --- | --- | --- | --- |
| header-menu.js | 6 862 | 3 064 | 3 072 | header, tải sẵn |
| header-drawer.js | — | 3 010 | 4 096 | lười, chạm nút menu |

Chung mọi trang tải sẵn: standard-events 888 + motion 6 103 + page-layers 2 031 + modal-dialog 2 039 + header-menu 3 064 + header-sticky 1 680 + cart-drawer 3 868 = 19 673 B (trước 23 471, −3 798). Trần 19 456 còn vượt 217 B do cart-drawer.js 3 868 > 3 072 (việc của ES1-T98); khi cart-drawer về 3 072 → 18 877 B.
Mobile sau khi chạm nút menu: + 3 010 = 22 683 B (≤ 40 960, ADR 0006).

## Cho FE (không sửa trong PR này)
- `blocks/header.liquid` `{% doc %}` dòng 34 ghi "JS ở assets/header-menu.js, assets/header-sticky.js": thêm `assets/header-drawer.js` (nạp lười từ header-menu.js) khi FE chạm file.
- Hook `data-mega-enhanced`, `data-mega-instant` dùng đúng như doc #216; ES1-T450 đổi tên thì BE sửa theo.

## Giới hạn đã biết
- `data-mega-instant` chỉ áp khi đổi mục bằng chuột (spec §6 "rê sang mục khác"). Bấm/Enter mục khác khi đang mở thì panel mới vẫn chạy hiệu ứng mở (toggle bất đồng bộ, đặt hook sau khi vẽ thì chỉ cắt animation giữa chừng).
- Cảm ứng ≥ 80rem: không hover, chạm mở/đóng native (§6).
- Lần chạm đầu nút menu: module drawer về sau ~1 vòng mạng; trong khoảng đó Esc/focus trap chưa có, `<details>` vẫn mở/đóng được (ADR 0010 chấp nhận trễ lần đầu).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (23 warning có sẵn ở 8 file khác, không file header).
- `wc -c`: header-menu.js 3 064 ≤ 3 072; header-drawer.js 3 010 ≤ 4 096; không `console.*`, không `fetch(`, không `createElement`.
- Không đổi locale JSON, không đổi Liquid.
- Playwright (ES1-T329, ES1-T16, TE-1), Lighthouse, console trên preview: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
