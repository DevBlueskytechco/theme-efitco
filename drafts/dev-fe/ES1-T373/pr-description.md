# ES1-T373 · TE-3-R2-FE2: quick view (markup, CSS, settings, locales)

AC: TE-3 AC9, AC10, AC12 (kèm phần markup của AC14, AC15, AC16). Spec: `docs/ui-spec/mini-cart-quickview.md` §3, §3.1, §4, §6; `product-shopify-features.md` §3.1, §5.2, §10; ADR 0007, 0008, 0012. JS: TE-3-R2-BE1 (`assets/quick-view.js`), không có file JS trong diff.

## Thay đổi
- `templates/product.quick-view.liquid` (mới, `layout none`): partial `quick-view` cho `{product.url}?view=quick-view`.
  - vendor eyebrow (setting), h2 `#qv-title` tabindex -1 (đích focus khi mở lớp).
  - media đủ loại qua `snippets/product-media-item.liquid` trong `<product-media-gallery data-product-id>` (ADR 0012, không lọc `media_type`), media của biến thể đang chọn lên đầu, tối đa 8; ≥ 48rem: prev/next tròn + ≤ 5 thumbnail có badge loại media; < 48rem: dải vuốt 78% + thanh tiến trình bằng CSS scroll timeline; 1 media: 4:3, không điều hướng; 0 media: placeholder icon nền cream.
  - giá/giá gạch/badge %, unit price (qua `snippets/price`), skeleton giá khi `aria-busy`.
  - rating từ metafield `reviews.rating` (không app block).
  - bộ chọn `product-variant-picker` `id_prefix: 'qv-'`, `regions: 'quick-view'`, `fetch_url: ?view=quick-view` (ADR 0008: lặp `options_with_values`, không lặp `product.variants`).
  - selling plan radio phẳng `name="selling_plan"` (chạy không JS), tồn kho + "Checking availability…", quantity rule (min/max/step, "(N in cart)", `aria-describedby`), volume pricing trong `<details>` đóng.
  - gift card: chỉ mệnh giá, câu "Add a recipient on the product page." + link.
  - Add To Cart (disabled + "Unavailable"/"Sold out" khi không mua được) + "View Detail" (`data-quick-view-detail`).
  - Không Buy It Now, installments, pickup, countdown (AC15).
- `layout/theme.liquid`: 1 vỏ `<quick-view>` + `<modal-dialog data-layer="quick-view" data-sheet-below="48rem">` khi `settings.show_quick_view`; 3 trạng thái loading (skeleton) / error (`role="alert"`, Try again, link sản phẩm) / content (partial rỗng để `partials.apply`). Không ảnh nào tải trước lần mở đầu.
- `snippets/product-card.liquid`: `<quick-view-button data-product-url data-product-title>` + `<button type="button" aria-haspopup="dialog" aria-label="Quick View {title}">`, mọi sản phẩm kể cả 1 biến thể/hết hàng; URL theo variant card (AC8).
- `snippets/header-icon.liquid`: icon `bag_add`.
- `config/settings_schema.json`: nhóm "Product cards": `show_quick_view` (mặc định bật, có info), `show_quick_view_vendor` (mặc định bật, `visible_if`).
- `assets/base.css`: nút card (< 64rem hoặc cảm ứng: tròn 44 luôn hiện; ≥ 64rem + hover: thanh 44 hiện khi hover/focus-within, ẩn bằng opacity nên vẫn Tab tới được; `quick-view-button:not(:defined)` ẩn → AC12); vỏ + skeleton quick view (sheet < 48rem, 720 từ 48rem, 960 từ 80rem, lưới 2 cột 1:1 layout/header/gallery/info); dòng tồn "Checking availability…" và `aria-disabled` của nút chuyển từ product.css lên base.css để PDP và quick view dùng chung.
- `assets/quick-view.css` (mới, sau merge develop có ADR 0014): CSS nội dung partial quick-view (media, giá, rule, volume, hàng mua dính đáy sheet, `.qv--long`, eyebrow/discount/rating/View Detail lặp khai báo của `featured-product.css` vì file đó chỉ nạp khi block featured-product render). Nạp lười khi mở (hợp đồng BE bên dưới), không tải ở trang nào trước lần mở đầu; nhờ vậy trang chủ giữ ≤ 57 344 B. Lệch AGENTS.md "quick view ở base.css" — CTO chốt.
- `assets/product.css`: gỡ phần đã chuyển sang base.css.
- `locales/en.default.json`: `products.quick_view.*`, `products.quantity_rule.*`, `products.volume_pricing.*`; `en.default.schema.json`: `general.product_cards`, `labels.show_quick_view(_vendor)`, `info.show_quick_view`. Gộp vào key đã có, không trùng.

## Hợp đồng cho BE (TE-3-R2-BE1)
- Card: `<quick-view-button>` (custom element), `data-product-url`, `data-product-title`, testid `product-card-quick-view`.
- Vỏ: `<quick-view data-label-loading data-label-error data-label-view-product="View [title]" data-stylesheet>`; `data-stylesheet` = URL `quick-view.css`: lần mở đầu BE thêm 1 `<link rel="stylesheet">` vào `<head>` (không preload, không lặp), chờ `load` (lỗi vẫn hiện) rồi mới bỏ `hidden` ở `[data-quick-view-content]`, trong lúc chờ giữ skeleton; `[data-quick-view-body]`, `[data-quick-view-status]` (role status), `[data-quick-view-loading]` / `[data-quick-view-error]` / `[data-quick-view-content]` đổi bằng `hidden`; `[data-retry]`, `[data-quick-view-link]` + `[data-quick-view-link-label]`. BE đặt `aria-labelledby` của dialog = `qv-loading-title` | `qv-error-title` | `qv-title`, `aria-busy` trên body.
- Partial: `quick-view`; `[data-variant-busy]` (giá, tồn) nhận `aria-busy`; nút thêm nhận `aria-disabled`; `data-media-prev/next`, thumbnail `a[data-media-id]`, `data-selected-media-id`; input số lượng `data-quantity-min/-max/-step/-in-cart`; `.qv--long` trên dialog khi nội dung dài.
- `product-form` giữ cùng hook với `blocks/product-form` (role status / role alert là con trực tiếp) để `assets/product-form.js` chạy không sửa.
- Testid: quick-view, quick-view-dialog, quick-view-close, quick-view-status, quick-view-loading, quick-view-error, quick-view-retry, quick-view-error-link, quick-view-product, quick-view-vendor, quick-view-title, quick-view-media(-item|-placeholder|-prev|-next), quick-view-thumbnail, quick-view-price, quick-view-discount, quick-view-rating, quick-view-form, quick-view-selling-plans, quick-view-variant-id, quick-view-stock, quick-view-inventory, quick-view-unavailable, quick-view-quantity, quick-view-quantity-rules, quick-view-volume-pricing, quick-view-gift-card-note, quick-view-add, quick-view-detail, quick-view-form-status, quick-view-form-error.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 9 cảnh báo có sẵn ở `blocks/quiz-step.liquid`, `templates/index*.liquid`, không thuộc file của PR.
- Không file `.js` trong diff; không `z-index` số (dùng `--layer-content`), không literal màu, chỉ logical properties, thời gian dùng `--motion-base`/`--ease-out` trong `prefers-reduced-motion: no-preference`; token dùng đều khai báo sẵn.
- `critical.css` không đổi (10 082 B ≤ 10 240). Gzip (Node `zlib.gzipSync`, sau merge develop): base.css 38 308 ≤ 49 152 (develop 37 029, +1 279); quick-view.css 2 705 ≤ 8 192; trang chủ base + 5 file tầng 4 = 56 733 ≤ 57 344 (thêm cả base quick view cũ thì 58 356, vượt).
- Không JS: nút Quick View ẩn (`:not(:defined)`), card là link (AC12); dialog không mở.
- Preview, Playwright (TE-3-R2-QA1), Lighthouse desktop/mobile, ảnh 360/768/1280: chờ CI. Luồng mở/tải/lỗi/thêm giỏ cần BE TE-3-R2-BE1; test cần store có sản phẩm nhiều media, selling plan, quantity rule (B2B) sẽ skip nếu store dev thiếu dữ liệu, không tính là đạt.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
