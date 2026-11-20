KHÔNG CHẮC: (1) trần byte: ticket ghi 7168, comment Tech Lead 7296, task-split ES1-T307 §3 (CTO 11/11, gộp T111 vào T110) ghi 8192 — theo 8192 (spec ES1-T110 contract cũng 8192); file 8147 B, còn 45 B, TE-8-R2-BE2 (search) nếu thêm code vào file này phải tách module. (2) Ticket ghi setCustomValidity + reportValidity + data-label-price-invalid; markup FE mới hơn (snippets/filter-group.liquid {% doc %}, collection.md §5.2) chốt lỗi inline #<group>-error + aria-invalid + aria-describedby, hiện khi rời ô — làm theo markup, không reportValidity (tránh bong bóng trùng). (3) Comment CTO 06/11 "sửa cents → đơn vị chính trong BE2" là Liquid (phạm vi FE): đã tạo ES1-T524 cho Dev FE, BE không chạm.

# ES1-T111 TE-6-BE2: drawer filter bàn phím, đóng khi lên desktop, ô giá debounce + kiểm min/max

Gộp vào ES1-T110 (CTO 11/11). Phần drawer showModal, trả focus, nút ×/Esc/scrim đã có từ PR #150 (collection-filters.js + modal-dialog.js); PR này bổ sung phần còn thiếu.

## Thay đổi
- `assets/collection-filters.js` (6135 → 8147 B)
  - Ô giá (`collection-filter-price-min|max`): nghe `input`, debounce 400 ms rồi áp qua luồng BE1 (`go` → partials.fetch 3 vùng). Gõ phím mới huỷ request đang bay (AbortController của BE1) nên gõ nhanh chỉ 1 request hoàn tất. URL không đổi so với trạng thái đang hiện thì không fetch.
  - Enter trên ô giá: `preventDefault` (không implicit submit, vì submit "Show N products" đóng drawer) và áp ngay, huỷ timer.
  - min > max: không fetch (debounce, Enter, submit, đổi filter khác đều chặn). Lỗi hiện khi rời ô / Enter / submit / đổi filter: bỏ `hidden` ở `collection-filter-price-error`, `aria-invalid="true"` + thêm id lỗi vào `aria-describedby` của 2 ô; hợp lệ lại thì gỡ ngay khi gõ. Form `novalidate` nên tự chặn (CTO 06/11 #1).
  - Ô rỗng bỏ khỏi URL (url() của BE1); sau apply `sync()` đồng bộ value theo server.
  - `matchMedia("(min-width: 64rem)")` change: đang mở modal mà nút Filter ẩn (CSS ẩn từ 64rem) thì `close()`, cột trái không kẹt top layer. Điều kiện theo nút Filter hiện/ẩn chứ không cứng 64rem, nên trang search (drawer mọi mốc, decisions S2) không bị đóng nhầm.
  - Theme editor: `shopify:block:select` trên block chứa drawer mở drawer khi nút Filter hiện (< 64rem), `deselect` đóng. modal-dialog.js chỉ bắt select từ block nằm trong nó, block collection-filters bọc ngoài nên phải xử lý ở đây.
  - `show()` chỉ mở modal khi nút Filter đang hiện.
  - Sau apply: nếu phần tử đang focus bị thay (apply thường giữ focus) thì focus phần tử cùng id, không có thì nút ×.
  - Dọn listener (mq, document shopify:block:*) và timer ở disconnectedCallback.
- `tests/e2e/ES1-T111.spec.ts` mới.

Không đổi markup, không thêm thẻ script. Không JS / script lỗi: popover native + form GET như cũ (test route.abort).

## Ngân sách JS (ADR 0010)
- `wc -c assets/collection-filters.js` = 8147 (trần 8192)
- Trang collection, file chạm + liên quan: collection-filters.js 8147 + modal-dialog.js 2039 + lazy-module.js 765 = 10 951 B; tăng +2012 B so với develop. Tổng trang theo bảng D10 cộng thêm phần chung: chờ CI/Tech Lead đối chiếu.

## Test
`tests/e2e/ES1-T111.spec.ts`
- store: AC4 360 Enter mở modal, Tab không ra phần tử trang, Esc đóng, focus về nút Filter; lọc trong drawer giữ mở, badge 1, axe 0 serious khi drawer mở; 360 → 1280 hết modal, form hiện cột trái; route.abort collection-filters.js thì popover mở và form submit. AC2-price min+max có 2 tham số, card một giá nằm trong khoảng, xoá ô thì tham số mất; min > max không request, lỗi + aria-invalid, sửa thì gỡ và áp; gõ nhanh 1 request hoàn tất, focus giữ ở ô.
- contract (fixture, không cần store): hook Liquid khớp, ≤ 8192 B, không console; debounce 1 fetch, Enter áp ngay, ô rỗng bỏ khỏi URL; min > max không fetch kể cả Enter/submit/đổi checkbox, aria-describedby "hint err" → "hint"; 360 → 1280 đóng modal; block select/deselect; gõ giá trong drawer không đóng drawer.

## Tự kiểm tra
- shopify theme check: 0 lỗi (9 warning có sẵn ở file khác).
- wc -c 8147 ≤ 8192; không console.*; không pushState; locale không đổi.
- node --check: không chạy được trong phiên (cần duyệt lệnh), đã đọc lại thủ công.
- Playwright ES1-T111 + ES1-T110, axe, Lighthouse (desktop ≥ 96, mobile ≥ 90, a11y ≥ 98) trên preview: chờ CI.

## Cho Orchestrator
File sửa: assets/collection-filters.js. File mới: tests/e2e/ES1-T111.spec.ts, drafts/dev-be/ES1-T111/pr-description.md. Ticket mới: ES1-T524 (FE, Liquid cents).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
