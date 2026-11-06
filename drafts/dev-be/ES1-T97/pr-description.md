KHÔNG CHẮC: (1) JS và spec chưa chạy lần nào: phiên agent không mở được trình duyệt, E2E, axe, lhci chờ CI. (2) `apply()` được giả định cập nhật thuộc tính `value` theo markup mới trong khi giữ value đang có; sau apply JS vẫn gán lại theo response nên số hiển thị đúng dù giả định sai, nhưng `cart-drawer.js` của ES1-T96 dựa vào giả định này. (3) `/cart/change.js` quá tồn trả 422 hay 200 giảm số lượng chưa rõ (ES1-T91 #4): làm cả 2 nhánh, chỉ test bằng mock vì store chưa có `TE5_LIMITED_HANDLE`. (4) Đếm refresh trong spec giả định partial đi bằng `fetch` tới cùng pathname với trang; nếu sai, các test đếm refresh sẽ fail dù code đúng.

# ES1-T97 TE-5-BE2: cart-items.js + thẻ script cart page

## Thay đổi
- `assets/cart-items.js` (mới, 5106 B): custom element `cart-items`, dùng chung cho drawer và /cart, khác nhau ở `data-partials`.
  - Đổi số lượng: `change` debounce 300 ms, delegate, lọc theo ô số lượng nên textarea note không bị đụng. Xoá: click `data-cart-remove`, gửi quantity 0.
  - Ghi tuần tự qua hàng đợi theo line key: `POST {data-cart-change-url}.js` JSON `{ id: key, quantity }`. Chỉ huỷ refresh.
  - Hết hàng đợi: `partials.fetch(...tên, { url: location.href, signal })` + `partials.apply(update)`, 1 lần cho cả hàng đợi. Sau đó gán lại ô số lượng theo response, đồng bộ `hidden` của accelerated, focus, status, `theme:cart:updated` source `cart-items`.
  - `aria-busy` trong suốt thời gian chạy, gỡ trong `finally`.
  - 4xx có `description`: text API vào `cart-items-error`, input lấy số từ `GET {data-cart-url}.js`, không refresh. 200 thấp hơn số yêu cầu: gán lại + `data-label-quantity-adjusted`. Mạng hoặc 5xx: về giá trị trước + `data-label-error`.
  - Focus: đổi số lượng giữ theo line key. Xoá dòng: dòng kế, dòng trước, hết dòng thì CTA rỗng (drawer) hoặc h1 (/cart).
- `blocks/cart-page.liquid`: 1 thẻ script type module.
- `blocks/cart-drawer.liquid`: về literal `{{ 'cart-items.js' | asset_url }}`, bỏ biến `items_asset` và comment (CTO chốt ES1-T102).
- `tests/e2e/ES1-T97.spec.ts` (mới): contract + AC2, AC4 chạy trên cả 2 giao diện.

## Quyết định ngoài chữ ticket
- Enter trong ô số lượng: chặn submit của nút Update đang ẩn, nếu không sẽ POST cả trang. Ticket không nêu, AC2 yêu cầu không reload.
- Trong lúc busy disable `button[form]` (Update, Checkout), trừ nút đang giữ focus, vì DoD ghi "nút bật lại" và disable nút đang focus làm mất focus. Input không disable.
- Nhập 0 coi như xoá. Ô trống, số âm, số lẻ: về số cũ, không gửi.
- Click kèm Cmd, Ctrl trên Remove: giữ hành vi trình duyệt, cùng cách với ES1-T96.
- Safari không focus link khi click: `activeElement` là body vẫn tính là focus ở dòng vừa xoá.
- Refresh lỗi sau khi ghi thành công: giỏ đã đổi nên giữ số server, báo `data-label-error`, không phát `theme:cart:updated`; lần đổi sau refresh lại.

## Giới hạn do trần 5120 B
- Ghi lỗi trong khi khách vừa sửa lại chính dòng đó: ô bị đưa về số cũ, lần sửa đó có thể mất; có thông báo lỗi.
- Dòng khác đang gõ chưa phát `change` khi response về: bị gán lại theo server.
- Line key không còn trên server: báo lỗi, không refresh, dòng vẫn hiện tới khi tải lại.
- 4xx chỉ đọc `description`, không fallback `message` như product-form.
- Không gỡ listener hay timer khi disconnect. Listener nằm trên chính phần tử, cart-items không bị gỡ ngoài theme editor.
- `input()` không dùng `CSS.escape`: line key dạng `variant:hash`, không có dấu nháy. Sẽ vỡ selector nếu Shopify đổi dạng key.
- BE3 có trần 5632 B, còn 526 B.

## Thứ tự merge
- PR #92 (ES1-T96) chưa có trên nhánh này: không có `assets/cart-drawer.js`, nên spec drawer tự mở dialog và import `data-items-src`; có file đó thì mở bằng cart link. Cần chạy lại sau khi cả 2 vào develop để kiểm luồng thật.
- Merge ES1-T97 trước hay sau ES1-T96 đều cần 1 việc: gỡ dòng bỏ qua `cart-items.js` trong consoleGuard `tests/e2e/TE-4.spec.ts` và `ITEMS_ASSET` trong `tests/e2e/ES1-T96.spec.ts`. 2 chỗ này chỉ nằm trên nhánh ES1-T96 nên chưa gỡ được ở đây.
- `blocks/cart-drawer.liquid`: ES1-T96 thêm dòng script cuối block, nhánh này sửa đầu block, không đụng nhau.
- ES1-T98 (BE3) sửa tiếp file này: dispatch `shopify:cart:lines-update` trước request.

## Ngân sách JS (D10, `wc -c`)
- `assets/cart-items.js` 5106/5120.
- Trang cart theo D10: chung 9430 + cart-items 5106 = 14536 B khi chưa có cart-drawer.js, dưới 40960 B.

## Tự kiểm tra
- `wc -c assets/cart-items.js`: 5106 ≤ 5120.
- `shopify theme check`: 0 lỗi. `node --check` JS và `node --experimental-strip-types --check` spec: ok.
- Không đổi locale, không đổi markup ngoài thẻ script và literal `data-items-src`.
- Playwright `tests/e2e/ES1-T97.spec.ts -g "AC2|AC4"` desktop + Pixel 7, console, pageerror, axe, lhci: chờ CI.
- Test quá tồn thật skip có lý do cho tới khi có `TE5_LIMITED_HANDLE` (ES1-T91 #7).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
