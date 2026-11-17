KHÔNG CHẮC: (1) `cart-drawer.js` 3 910 B: đạt DoD ticket (≤ 4 096), không đạt trần ADR 0010 / task-split ES1-T307 §3 (3 072). Muốn xuống 3 072 phải bỏ ít nhất 2 hành vi đang có test hoặc AC. Đã hỏi Tech Lead ở ES1-T476, đang theo 4 096. (2) SRS TE-5 AC15 ghi "mở drawer focus vào nút đóng", nhưng `<modal-dialog>` focus h2 "Cart" vì nút đóng không có `autofocus` (markup FE). Đang giữ hành vi của modal-dialog; câu hỏi gộp trong ES1-T476. (3) Phiên agent không chạy được node, tsc, trình duyệt: JS và spec chưa chạy lần nào, cú pháp chờ CI.

# ES1-T98 TE-5-BE3 (lượt 2, REQ-0002): cart drawer qua `<modal-dialog>`, "Added to cart", giữ override `Shopify.actions`

Phạm vi theo task-split ES1-T307 §3 (CTO 11/11). PR #97 đóng không merge, bản này làm lại trên develop `f3fbad4`, đã có ES1-T368 markup và ES1-T315 modal-dialog.

## Thay đổi
- `assets/cart-drawer.js` (3 868 → 3 910 B)
  - Lớp: bỏ `showModal()`, xử lý bấm backdrop và nghe `close` của dialog. Giờ gọi `<modal-dialog>.open(opener)` / `.close()` qua element API, không import tĩnh (ES1-T81, ADR 0007 #5). Nghe `modal:close` để ẩn "Added to cart" và trả focus khi opener bị gỡ hoặc disabled (ví dụ nút add bị partial biến thể thay).
  - "Added to cart": sau khi thêm giỏ (`theme:cart:updated` có `detail.item`), mở drawer rồi ghi "{product_title} · {variant_title}" vào `[data-cart-added-item]` và gỡ `hidden` của `[data-cart-added]`. Phản hồi `{ items }` (bundle) thì nối bằng ", ". Không có timer. Ẩn khi: drawer đóng, mở bằng icon giỏ hoặc `openCart`, `cart-items` đổi giỏ xong (event `source: "cart-items"`).
  - Theme editor: `shopify:block:select/deselect` trên chính `<cart-drawer>`. modal-dialog không bắt được vì `<cart-drawer>` là cha của nó, nên gọi `open()` / `close()` từ đây.
  - Override giữ nguyên hành vi: `openCart.configure` (drawer: refresh rồi mở, URL không đổi; ở /cart: focus h1; chế độ page: sang `data-cart-url`). `updateCart.configure`: `defaultHandler()` → refresh partial → trả kết quả, không phát thêm event (ES1-T83). Không đụng `getCart`, vì action này không configure được (ES1-T164 #1).
  - Thời điểm configure (ES1-T164 #4): thử ngay, rồi thử lại ở `load`. Bỏ import CDN `standard-events.js` khỏi drawer vì drawer không dispatch.
  - Listener dùng AbortController, dọn ở `disconnectedCallback`.
  - `<modal-dialog>` chưa define (script lỗi): `show()` ném lỗi trong `try` của `refresh()`, rơi về `location.assign(cart_url)`, không có pageerror.
- `assets/cart-items.js`: không đổi (5 625 B). Event `shopify:cart:lines-update` update/remove đã có từ lượt 1.
- `tests/e2e/ES1-T98.spec.ts`
  - Contract ADR 0007: có `modal-dialog`, `.open(opener)`, `.close()`, `modal:close`; không còn `showModal`/`keydown`/`getBoundingClientRect`; hook Added to cart khớp `blocks/cart-drawer.liquid`; drawer không nạp CDN events.
  - Describe mới "Added to cart, `<modal-dialog>`":
    - thêm giỏ: role=status hiện tên, cart-count khớp, focus trong dialog;
    - không tự ẩn sau 2,5 s; Esc thì ẩn và focus về nút add; mở lại bằng icon thì vẫn ẩn;
    - đổi số lượng thì ẩn, drawer giữ mở;
    - nút đóng phát đúng `modal:open:cart`, `modal:close:cart`; chạm scrim thì đóng (≥ 768);
    - `openCart` không hiện box;
    - abort `modal-dialog.js`: thêm giỏ chuyển /cart.
- `tests/e2e/ES1-T96.spec.ts`: contract tên partial nhận cả `document` lẫn alias `d`.

## Cho FE (không sửa trong PR này)
- AC15 focus nút đóng: nếu Tech Lead chốt theo SRS thì thêm `autofocus` vào `cart-drawer-close` (ES1-T476 #2).
- Doc `blocks/cart-drawer.liquid` ghi "the close button uses form method=dialog": vẫn đúng. modal-dialog còn bắt `.close-button`, nên hai đường cùng đóng một lần, event `close` chỉ phát 1 lần.

## Ngân sách JS (`wc -c`, cộng tĩnh theo thẻ script)
| Trang | develop | PR | Trần |
| --- | --- | --- | --- |
| Chung (standard-events 888, motion 6 103, page-layers 2 031, modal-dialog 2 039, header-menu 6 862, header-sticky 1 680, cart-drawer) | 23 471 | 23 513 (+42) | 19 456 (ADR 0010; header-menu, motion chưa giảm ở task riêng) |
| /cart (chung + cart-items 5 625) | 29 096 | 29 138 | 40 960 |
| PDP (chung + variant-picker 7 163, product-form 6 857, product-media 4 407) | 41 898 | 41 940 | 40 960 (đã vượt trên develop; giảm ở các task PDP theo ADR 0010) |
Nếu các file khác đạt trần ADR 0010, tổng chung = 18 952 − 3 072 + 3 910 = 19 790, vượt 19 456 là 334 B (ES1-T476).

## Tự kiểm tra
- `wc -c`: cart-drawer.js 3 910 ≤ 4 096 (DoD ticket), > 3 072 (ADR 0010, đã hỏi ES1-T476). cart-items.js 5 625 ≤ 5 632.
- `shopify theme check`: 117 file, 0 lỗi. 25 warning có sẵn, không nằm ở file trong PR.
- Không đổi markup, locale, CSS. Không console.*, không fetch tự viết trong drawer, không import tĩnh module theme.
- `node --check`, `tsc`: phiên agent bị chặn lệnh, chờ CI.
- Playwright `tests/e2e/ES1-T98.spec.ts` (AC7 + Added to cart) desktop + Pixel 7, hồi quy ES1-T96, T97, T95, T203, T314, T315, TE-4, console/pageerror, lhci: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
