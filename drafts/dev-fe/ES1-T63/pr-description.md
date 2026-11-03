KHÔNG CHẮC: (1) snippets/meta-tags.liquid (Skeleton) đã xuất `product | structured_data` → đã xoá để trang chỉ có 1 JSON-LD Product; file nằm ngoài danh sách ticket, hỏi Tech Lead ở ES1-T72; (2) D3 nói mô tả "dưới form", body ticket đặt mô tả trong product-info (template: product-info trước product-form) → mô tả đang TRÊN form, không dùng CSS order; ES1-T72 #2; (3) Figma không có trang sản phẩm → chữ/khoảng cách là mặc định kỹ thuật (CTO chốt ES1-T61, Designer soát ui_diff sau preview); (4) market gồm thuế, sản phẩm số chưa chắc có trên hoa-qua-nhap-khau (ES1-T60 #1) → test skip có lý do; (5) spec ở drafts vì scope-guard chặn tests/, chưa chạy.

# ES1-T63 TE-4-FE2: product-info + product-sticky-bar + JSON-LD Product

Ticket: ES1-T63 · AC: docs/srs.md#TE-4 AC3 (title, vendor, description, taxes), AC5 (markup), AC9 (ẩn ghi chú vận chuyển), AC10, AC11 · Nguồn: drafts/techlead/ES1-T59/task-split.md D1, D3, D5, D10.

## Thay đổi
- `blocks/product-info.liquid` (mới, 1 setting `show_vendor` checkbox default true, không presets). Đọc `product` toàn cục, `current_variant = product.selected_or_first_available_variant`.
  - Vendor `p` (khi setting bật và có vendor) → `h1` `product.title` đầy đủ.
  - `{% partial 'product-price' %}`: `render 'price'` (product, variant: current_variant) + `product-notes`. Ghi chú thuế theo `cart.taxes_included` / `cart.duties_included`: cả 2 → `taxes_and_duties_included`, chỉ thuế → `taxes_included`, chỉ phí → `duties_included`, không → `taxes_at_checkout`. Ghi chú vận chuyển chỉ khi `current_variant.requires_shipping` (AC9): có `shop.shipping_policy.url` → `shipping_at_checkout_html` (link), không → `shipping_at_checkout`. Nằm trong partial nên BE1 refresh theo variant.
  - `product.description` (khi không rỗng), rồi `render 'product-structured-data'`.
  - Trạng thái rỗng: không có `product` → editor hiện gợi ý, storefront không render.
- `snippets/product-structured-data.liquid` (mới): `script type=application/ld+json`, `@type Product`, name, url (`request.origin` + product.url), image tối đa 5 (`image_url: width: 1200`, https), description (`strip_html`, chèn khoảng trắng trước tag để không dính chữ), brand = vendor, sku (variant hiện tại), `offers` 1 Offer/variant: price `variant.price | divided_by: 100.0`, priceCurrency `cart.currency.iso_code`, availability InStock/OutOfStock, url tuyệt đối `request.origin` + `variant.url`. Mọi giá trị qua `| json`; key rỗng (image, description, brand, sku) bỏ hẳn. Static, không nằm trong partial.
- `blocks/product-sticky-bar.liquid` (mới, không setting): root `<product-sticky-bar hidden>` (`data-form-id`), ảnh 48 × 48 trang trí (`alt=""`, lazy, featured media của variant, không có thì của product), tên 1 dòng, `{% partial 'product-sticky-bar' %}`: `render 'price'` + `button type=submit name=add form="product-form-{id}"`; hết hàng → `disabled` + Sold out (dùng lại key `blocks.product_form.*`).
- `templates/product.liquid`: bỏ h1/price/description tạm, thêm `{% block 'product-info' %}` (trong `div.product__details`, trước product-form) và `{% block 'product-sticky-bar' %}` (cuối container product-main).
- `snippets/meta-tags.liquid`: bỏ `product | structured_data` (tránh 2 Product), giữ og:price.
- `assets/base.css`: mục "Product info" (vendor sm muted uppercase, title heading `--font-size-h2`, giá `--font-size-lg`, ghi chú sm muted, mô tả line-height body) và "Product sticky bar" (fixed đáy, `z-index: 5` dưới header 10, `[hidden]` → none, từ 48rem luôn none, padding đáy theo safe-area; `html[data-sticky-bar-visible] body` thêm padding đáy dưới 48rem; nút disabled như product-form). Chỉ token css-variables; 44/48px theo `.button` / thumbnail sẵn có.
- `locales/en.default.json`: `blocks.product_info` (7 key). `en.default.schema.json`: `general.product_info`, `general.product_sticky_bar`, `labels.show_vendor`.

## Hợp đồng cho BE
- BE1 ES1-T66: partial `product-price` (root `[data-testid=product-price]`, gồm giá + ghi chú vận chuyển theo variant) và `product-sticky-bar` (giá + nút) — fetch `?variant=` rồi apply cùng 4 partial của FE3. JSON-LD không refresh.
- BE2 ES1-T67: custom element `product-sticky-bar` (root, `hidden` mặc định, `data-form-id`). Bỏ/gắn `hidden` theo IntersectionObserver trên `[data-testid=product-form-add]`, gắn/bỏ `data-sticky-bar-visible` trên `html`. Nút sticky là `type=submit form=...` → submit event nằm trên form chính, `submitter` = nút sticky. BE1 cập nhật nhãn/disabled qua partial, không cần JS riêng.

## data-testid (13 mới + giữ testid snippet price)
product-info, product-title, product-vendor, product-price, product-notes, product-note-tax, product-note-shipping, product-description, product-structured-data, product-sticky-bar, product-sticky-bar-title, product-sticky-bar-price, product-sticky-bar-add. Bên trong giữ price, price-regular, price-compare, price-range, price-unit (tiêu đề ticket ghi 15 = 13 + đếm theo task-split; danh sách body ticket là 13).

## Tự kiểm tra
- `shopify theme check --path .`: 48 file, 0 offense.
- Locale JSON parse OK, không trùng key (object_pairs_hook), gộp vào `blocks` / `general` / `labels` sẵn có.
- Không file JS trong diff.
- JSON-LD: soát tay dấu phẩy với mọi nhánh rỗng (không image/description/vendor/sku); chưa chạy Rich Results Test — chờ CI/preview.
- Spec: `drafts/dev-fe/ES1-T63/ES1-T63.spec.ts` (11 test, tên bắt đầu AC3 / AC5-markup / AC9 / AC10 / AC11; biến mới `TE4_TAX_INCLUDED_COUNTRY` cho AC10). Nhờ Orchestrator chép sang `tests/e2e/ES1-T63.spec.ts`. Chưa chạy, chưa type-check.
- Playwright desktop + Pixel 7, axe, lhci 96/90/98, Rich Results Test, ảnh 360/768/1280: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
