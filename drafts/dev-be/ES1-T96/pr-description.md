KHÔNG CHẮC: (1) E2E, axe, lhci chưa chạy (phiên agent không mở được trình duyệt) → chờ CI. (2) Sau apply lấy số lượng từ `input.defaultValue`, giả định apply cập nhật thuộc tính `value` theo markup mới trong khi giữ value đang có; doc chỉ nói giữ value. Test "AC1 thêm lần 2" sẽ lộ nếu sai. (3) assets/cart-items.js thuộc ES1-T97, chưa có: lần mở đầu import 404, drawer vẫn chạy bằng form không JS (xem "Thứ tự merge").

# ES1-T96 TE-5-BE1: cart-drawer.js + thẻ script + product-form.js

## Thay đổi
- `assets/cart-drawer.js` (mới, 2812 B): custom element `cart-drawer`, chỉ gắn listener khi `data-mode="drawer"`.
  - Mở: `theme:cart:updated` (bỏ qua source `cart-items`) và click `[data-cart-link]` (delegate trên document vì partial thay link) → `partials.fetch("cart-drawer", "cart-count", { url: location.href, signal })` + `partials.apply(update)` → `showModal()`.
  - Đóng: nút đóng và Esc là native; backdrop qua `target === dialog`. Trả focus ở event `close`: opener đã lưu, opener bị gỡ hoặc disabled thì về `[data-cart-link]`.
  - Sau apply: đồng bộ `hidden` của `[data-cart-accelerated]` theo `data-item-count`; gán lại ô số lượng theo server vì apply giữ value cũ.
  - Lỗi refresh do khách bấm → `location.assign(data-cart-url)`. AbortError bỏ qua. `aria-busy` trên dialog khi tải.
  - `pageshow` persisted → refresh nền. `import(data-items-src)` lần mở đầu, không await, lỗi bỏ qua.
  - Theme editor: `shopify:block:select` mở, `shopify:block:deselect` đóng.
- `blocks/cart-drawer.liquid`: chỉ thêm 1 thẻ script type module, nằm ngoài nhánh `mode`.
- `assets/product-form.js` (6857 B): đúng 2 chỗ theo D7: điều kiện rời trang thành không có `cart-drawer dialog` hoặc chưa define `cart-drawer`; thêm `opener: submitter` vào detail. Thêm cập nhật dòng comment đầu file.
- `tests/e2e/ES1-T96.spec.ts` (mới): contract + AC1, AC6, AC8.
- `tests/e2e/TE-4.spec.ts`: consoleGuard bỏ qua log mạng "Failed to load resource" của đúng `cart-items.js`. Các test TE-4 thêm giỏ thành công (TC-304, TC-602, TC-603, TC-802, test AC9 sản phẩm 1 variant) giờ mở drawer thật, nếu không bỏ qua thì fail vì 404 cho tới khi ES1-T97 vào. Lỗi JS của file này vẫn bị bắt.

## Quyết định ngoài chữ ticket
- Click kèm Ctrl, Cmd, Shift, Alt trên cart link: giữ hành vi trình duyệt (mở tab mới), không mở drawer.
- Refresh nền bfcache lỗi: ở lại trang, không chuyển /cart; ticket chỉ nói refresh lại, tự chuyển trang khi khách vừa bấm Back là sai.
- Ô số lượng gán lại sau apply: ticket không nêu cho BE1, nhưng thêm cùng variant lần 2 sẽ hiện số cũ, sai TE-5 AC1. Có test riêng.

## Giới hạn do trần 2816 B
- Refresh nền abort một refresh đang chờ mở thì mất lần mở (bfcache trùng đúng lúc khách bấm, gần như không xảy ra).
- `data-mode="none"`: không refresh gì; cart-count có thể cũ sau bfcache ở chế độ page, như trước ticket này. Ticket chỉ yêu cầu ở drawer.
- Comment trong file tối thiểu.

## Thứ tự merge
- Merge sát sau ES1-T95 (comment dev-fe): develop hiện thêm giỏ được nhưng không chuyển /cart và không mở drawer. PR này sửa lỗi đó.
- ES1-T97 vào sau: đổi lại literal `cart-items.js` trong block (CTO đã chốt) và có thể bỏ dòng bỏ qua trong TE-4 consoleGuard + `ITEMS_ASSET` trong ES1-T96.spec.ts. Đã comment ES1-T97.
- ES1-T98 (BE3) còn 1284 B tới trần 4096.

## Ngân sách JS (D10, `wc -c`)
Trang sản phẩm: header-menu 6862 + header-sticky 1680 + standard-events 888 + variant-picker 7156 + product-form 6857 + media 4407 + recommendations 3069 + cart-drawer 2812 = 33731 B; thêm cart-items tối đa 5120 khi mở = 38851 B, dưới 40690 B của D10.

## Tự kiểm tra
- `wc -c`: cart-drawer.js 2812 ≤ 2816; product-form.js 6857 ≤ 6900.
- `shopify theme check`: 0 lỗi. `node --check` 2 file JS: ok. `node --experimental-strip-types --check` ES1-T96, TE-4 spec: ok.
- Không đổi locale, không đổi markup ngoài thẻ script.
- Playwright (ES1-T96, ES1-T67, ES1-T85, TE-4 `-g "AC8"`), console, axe, lhci trên preview: chờ CI. ES1-T67 và ES1-T85 hiện chỉ còn test tĩnh; test chuyển /cart trong TE-4 giữ nguyên skip theo `skipIfDrawer`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
