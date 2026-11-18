KHÔNG CHẮC: theme check còn 1 lỗi MissingAsset vì assets/cart-checkout-bar.js chưa có (BE tạo ở PR #255, ES1-T370). FE không tạo file JS rỗng tạm vì fe-be-boundary + hook scope-guard cấm Dev FE ghi assets/*.js. Đã hỏi Tech Lead ES1-T500 (A: BE commit stub lên nhánh này; B: merge chung PR #255; C: BE tự thêm thẻ script).

# ES1-T498 · TE-5-R2-FE3 (ES1-T490 phương án B): host <cart-checkout-bar> trên trang giỏ

## Thay đổi
Diff chỉ `blocks/cart-page.liquid`, không CSS, không JS.
- Bọc `aside.cart-sticky-checkout` bằng `<cart-checkout-bar data-testid="cart-checkout-bar">`, vẫn trong `{% partial 'cart-page' %}` và trong cùng điều kiện `cart.item_count > 0 and block.settings.show_sticky_checkout`. Giữ nguyên class, testid, `hidden`, aria-label, nút `name="checkout" form="cart-form-page"` của aside.
- Thêm `<script src="{{ 'cart-checkout-bar.js' | asset_url }}" type="module" defer></script>` cạnh script cart-items.js, ngoài partial: chỉ nạp khi block cart-page render, refresh partial không chèn lại script.
- `{% doc %}` ghi hợp đồng cho BE (ES1-T370):
  - host `<cart-checkout-bar>` nằm trong partial nên mỗi lần refresh bị thay, `connectedCallback` chạy lại;
  - dưới 64rem BE gắn IntersectionObserver vào `.cart-summary--page`: panel ra khỏi khung nhìn thì bỏ `hidden` trên aside và đặt `html[data-bottom-bar="cart"]`; panel vào lại khung nhìn hoặc host bị gỡ (disconnect) thì trả `hidden` và gỡ thuộc tính;
  - từ 64rem CSS luôn ẩn thanh (`.cart-sticky-checkout { display: none }`);
  - `cart-items.js` không xử lý thanh này.
  - Thêm `cart-checkout-bar` vào danh sách test hook.

## Giao diện
Không đổi. Host không có CSS. Aside vẫn `position: fixed`, nên host chỉ là một grid item rỗng, cao 0, nằm trong `.cart-page__items`. Grid này không có `gap` và host không có margin, nên không đẩy hàng nào. Các selector cũ vẫn khớp: `.cart-sticky-checkout[hidden]`, `html:is([data-layer-open],[data-consent]) .cart-sticky-checkout` (selector hậu duệ), `.cart-sticky-checkout` @64rem.
Tắt JS thì aside vẫn `hidden`, hành vi giống trước khi sửa. Checkout vẫn đi qua nút trong summary.

## Hook cho BE / QA
- Custom element: `cart-checkout-bar` (BE `customElements.define("cart-checkout-bar", …)`).
- Testid: `cart-checkout-bar` (host, mới), `cart-sticky-checkout`, `cart-sticky-checkout-total`, `cart-sticky-checkout-button` (giữ).
- Partial: `cart-page` (không đổi; `data-partials="cart-page cart-count"` giữ).
- Thuộc tính trang: `html[data-bottom-bar="cart"]` → `--bottom-bar-height` (CSS có sẵn).

## Tự kiểm tra
- `shopify theme check`: 1 lỗi MissingAsset `assets/cart-checkout-bar.js` (blocks/cart-page.liquid:196). Lỗi này hết khi có file JS (ES1-T500). Không còn lỗi nào khác; 22 warning là warning có sẵn, không thuộc file này.
- Spec tĩnh liên quan vẫn khớp, đã đọc lại bằng regex/chuỗi chứ chưa chạy. ES1-T97 kiểm đúng 1 thẻ script `cart-items.js` có dạng literal. ES1-T369 kiểm thứ tự `<cart-items>` → heading → status, `data-partials`, đúng 1 testid `cart-checkout`. ES1-T98 kiểm `class="cart-page"` đứng trước h1 có tabindex -1.
- Không file JS trong diff; locale không đổi.
- TE-5 AC9: hành vi không đổi; thanh vẫn chỉ hiện khi BE gỡ `hidden`.
- Playwright, Lighthouse (/cart desktop, mobile), ảnh 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
