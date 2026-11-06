KHÔNG CHẮC: (1) chưa có preview: chưa render Liquid thật, Playwright, axe, lhci, ảnh 360/768/1280 đều chờ CI; spec chưa chạy, chưa type-check. (2) Lưới cart-page giả định `{% partial %}` không sinh thẻ bọc (không có nguồn trong repo xác nhận); nếu có thẻ bọc, từ 64rem dòng hàng và tóm tắt sẽ xếp chồng 1 cột, xem ảnh CI 1280. (3) Figma không có cart: layout là mặc định ES1-T93, chờ Designer soát. (4) Accelerated checkout không gửi form nên không lưu note: AC5/ES1-T92 #4 chưa nói, đã hỏi ở comment ES1-T92. (5) Ngưỡng 99 trong settings_data chờ PO ES1-T92 #1. (6) Spec ở drafts vì scope-guard chặn tests/.

# ES1-T94 TE-5-FE1: cart page

Ticket: ES1-T94 · AC: docs/srs.md#TE-5 AC1, AC3, AC4, AC5, AC6 (setting) · Nguồn: drafts/techlead/ES1-T89/task-split.md D1, D3, D4, D5, D6, D11, D12.

## Thay đổi
- `templates/cart.liquid`: chỉ gọi `cart-page` trong container `id: 'cart-main'`.
- `blocks/cart-page.liquid` (mới): h1, `<cart-items>` chứa 2 live region, partial `cart-page` (form `cart-form-page`, freeship, dòng hàng, tóm tắt), wrapper accelerated và note ngoài partial.
- `snippets/cart-lines.liquid` (mới): dòng hàng, trạng thái rỗng, nút Update. Không dùng `snippets/price.liquid` (D4).
- `snippets/cart-summary.liquid` (mới): subtotal, giảm giá cấp đơn, total, ghi chú thuế/duty, checkout. Giỏ rỗng không render.
- `snippets/cart-free-shipping.liquid` (mới): text + `<progress>`. Tắt khi ngưỡng 0, giỏ rỗng, hoặc `cart.currency.iso_code` khác `shop.currency`.
- `config/settings_schema.json`: nhóm Cart, `cart_type` (default drawer), `free_shipping_threshold` (default 0). `config/settings_data.json`: ngưỡng 99.
- `assets/base.css`: mục Cart; `locales/`: nhóm `cart`, `general.cart_page`, `labels`, `info`, `options.cart_type`.

## Quyết định cần soát
- Ảnh dòng hàng không gắn link: title đã link cùng URL; ảnh thiếu alt mà có link sẽ thành link không tên (axe serious).
- Thứ tự DOM = thứ tự nhìn ở dưới 64rem: dòng hàng, tóm tắt, accelerated, note. Đặt accelerated ngay sau Checkout và không để note nằm trên nút wallet, vì khách điền note rồi bấm wallet sẽ mất note mà không biết. Đổi: note xuống cuối trang mobile.
- Từ 64rem: hàng 1 dòng hàng + tóm tắt sticky, hàng 2 note + accelerated. Sticky bị giới hạn trong ô lưới, không gộp được tóm tắt (trong partial) với accelerated (ngoài partial) vào 1 wrapper; khi cuộn hết hàng 1 tóm tắt gặp đúng accelerated.
- Ghi chú thuế chỉ hiện khi `taxes_included` hoặc `duties_included` (AC4 "khi có"); không thêm "Taxes calculated at checkout" như trang sản phẩm.
- `@param {object} cart`: theme check từ chối `{cart}` (ValidDocParamTypes).
- `updates[]`, Update, Checkout đều có thuộc tính `form`, nên FE2 đặt snippet ở đâu trong dialog cũng được, miễn có form `cart-form-drawer`.

## Hợp đồng cho BE (ES1-T97) và FE2 (ES1-T95)
- Partial `cart-page`; `cart-items`: `data-cart-change-url`, `data-cart-url`, `data-partials="cart-page cart-count"`, `data-label-updated|removed|error|quantity-adjusted`. Hook: `data-line-key`, `data-cart-remove`, `data-cart-update`, `data-item-count`, `data-cart-accelerated`.
- Textarea note và wrapper accelerated nằm trong `cart-items`, ngoài partial: listener `change` phải lọc theo input số lượng (`name="updates[]"`), không bắt mọi change.
- Note tự ẩn khi `data-item-count="0"` bằng CSS, BE chỉ đồng bộ `hidden` của accelerated.
- h1 có `tabindex="-1"` để nhận focus khi xoá dòng cuối.
- Enter trong ô số lượng là submit form thường (Update là nút mặc định, kể cả khi CSS ẩn): chặn `submit` nếu muốn đi qua `/cart/change.js`.
- CSS đã có `cart-items[data-enhanced] [data-cart-update]` và `cart-items[aria-busy='true']`.

## Cần Orchestrator / CTO áp
- `drafts/dev-fe/ES1-T94/ES1-T94.spec.ts` → `tests/e2e/ES1-T94.spec.ts`.
- AGENTS.md (ES1-T91 #6), Theme map, bảng Blocks: `| \`cart-page\` | Cart page: lines, free shipping, summary, note, accelerated checkout; \`cart-page\` partial. |`
- AGENTS.md, bảng Snippets:
  - `| \`cart-free-shipping\` | Free shipping progress bar and message. |`
  - `| \`cart-lines\` | Cart line items and the empty cart state. |`
  - `| \`cart-summary\` | Cart totals, tax note, checkout button. |`
- Chỉ add đúng các file ở mục Thay đổi và spec: giữa task, worktree dùng chung từng sang `feature/ai-ES1-T70` kèm thay đổi `tests/e2e/*` không thuộc ticket này; lúc nộp đã về đúng `feature/ai-ES1-T94` và các thay đổi đó không còn.

## data-testid (35)
cart-page, cart-page-heading, cart-page-body, cart-page-note, cart-page-accelerated, cart-items, cart-items-status, cart-items-error, cart-form, cart-lines, cart-line, cart-line-image, cart-line-title, cart-line-options, cart-line-properties, cart-line-selling-plan, cart-line-price, cart-line-original-price, cart-line-unit-price, cart-line-discount, cart-line-total, cart-line-quantity, cart-line-remove, cart-update, cart-empty, cart-empty-cta, cart-free-shipping, cart-free-shipping-progress, cart-free-shipping-text, cart-discounts, cart-discount, cart-subtotal, cart-total, cart-tax-note, cart-checkout.

## Tự kiểm tra
- Đã chạy: `shopify theme check --path .`: 55 file, 0 offense.
- Đã chạy (script): locale và settings_schema không trùng key; settings_data parse được; 35/35 testid khớp D11; mọi key `cart.*` đều có và đều được dùng; mục CSS Cart 0 literal màu, 0 thuộc tính vật lý.
- Không có file JS trong diff.
- Chờ CI, chưa đạt: `npx playwright test tests/e2e/ES1-T94.spec.ts -g "AC1|AC3|AC4|AC5|AC6|nojs"` desktop + Pixel 7; JS tắt (Update, Remove, Checkout, note); axe; `npx lhci autorun` 96/90/98; ảnh 360, 768, 1280.
- Spec sẽ skip có lý do: AC3 khi thiếu `TE5_SHOP_COUNTRY` (ES1-T91 #7, hiện chưa có trong store-data.json, nên AC3 chưa được kiểm tới khi có biến); giảm giá chỉ so số lượng với /cart.js, store dev chưa có automatic discount.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
