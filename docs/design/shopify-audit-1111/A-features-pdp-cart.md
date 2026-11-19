# Audit A — Shopify Theme Store: mục 4 (Features) + mục 7 (Layout, Product, Cart, Gift card, Password)

Theme Efitco, repo `theme-efitco` (thư mục làm việc, nhánh develop, đọc 11/11/2026, không fetch). Chỉ đọc, không sửa.
Mức: CHẶN = vi phạm yêu cầu bắt buộc; NÊN = rủi ro bị review từ chối / thiếu trong thiết kế; ĐẠT.
Đường dẫn tương đối từ gốc repo. Spec = `docs/ui-spec/`, mockup = `drafts/designer/`.

## A. Mục 4 — Features

| # | Mục yêu cầu (số mục Shopify) | Lớp | File:dòng | Hiện trạng | Mức | Cách sửa đề xuất |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 4 Accelerated checkout, màu nút có thương hiệu không được sửa | Thiết kế | drafts/designer/ES1-T255/cart.html:143, :324 | (đã biết a) `.pay-button` nền `--color-foreground`, chữ nền: vẽ "Shop Pay", "G Pay" bằng màu theme | CHẶN (khi trình BGĐ: hình sai yêu cầu) | Thay bằng ảnh chụp nút thật của Shopify (Shop Pay tím, G Pay đen/trắng) hoặc khung trống ghi "Shopify renders – branded colors", không tô màu theme |
| 2 | 4 Accelerated checkout (mini cart) | Thiết kế | drafts/designer/ES1-T262/mini-cart-quickview.html:129, :393; docs/ui-spec/mini-cart-quickview.md:70 | (đã biết b) ô nét đứt "Accelerated checkout (Shopify renders)" đặt TRONG panel tối `--color-background-panel` | NÊN | Đưa khối accelerated ra ngoài panel tối, nền trắng như cart.md:121 (cùng lý do product-shopify-features.md:85: logo Shop Pay trên panel tối không đảm bảo 3:1, theme không đổi được màu). Spec mini cart sửa §1 mục 3 cho thống nhất với cart page |
| 3 | 4 Accelerated checkout — spec PDP, cart | Thiết kế | docs/ui-spec/product.md:184; cart.md:47, :121 | Nút branded giữ màu Shopify; chỉ style nút unbranded; cart "or pay with" ngoài panel, nền trắng, chừa min-height | ĐẠT | — |
| 4 | 4 Accelerated checkout — code | Code | blocks/product-form.liquid:360, :421-424 (default true); blocks/cart-page.liquid:82-93; blocks/cart-drawer.liquid:123-133; assets/base.css:3645-3680 | `payment_button` bật mặc định; CSS chỉ nhắm `--unbranded`; `content_for_additional_checkout_buttons` ở cart page + drawer, không đè màu | ĐẠT | — |
| 5 | 4 Discounts: dòng + toàn đơn ở cart | Thiết kế | cart.md:58, :97, :115; mini-cart-quickview.md:70, :78 | Discount dòng (icon tag + tên + -$x) và discount cấp đơn trong panel, cả cart page và mini cart | ĐẠT | — |
| 6 | 4 Discounts — code | Code | snippets/cart-lines.liquid:123-131; snippets/cart-summary.liquid:29-38 | `line_level_discount_allocations` + `cart_level_discount_applications` (dùng chung page/drawer) | ĐẠT | — |
| 7 | 4 Faceted filtering collection: availability, price, type, vendor, variant options | Thiết kế + Code | collection.md:119-129; snippets/filter-group.liquid:6-11, :37, :86 | Rẽ nhánh theo `filter.type` (list/boolean/price_range), swatch theo `value.swatch` → mọi filter S&D | ĐẠT | — |
| 8 | 4 Faceted filtering ở search | Code | templates/search.liquid:1-46 | Template search vẫn là bản Skeleton gốc: không `search.filters`, không sort, không card sản phẩm (spec search.md:37 đã thiết kế drawer lọc) | CHẶN | Dựng search theo search.md: `collection-filters`/`filter-group` với `search.filters`, sort, `product-card` (có unit price) |
| 9 | 4 Gift cards: template gift_card | Code | templates/gift_card.liquid | Có template | ĐẠT (xem mục 7 dòng 40-44) | — |
| 10 | 4 Image focal points | Thiết kế | index-mobile-a.md:209; collection.md:107; article.md:92; sổ HA2 11/11 | Focal point đặt trên file, `image_tag` xuất object-position | ĐẠT | — |
| 11 | 4 Image focal points — code | Code | snippets/image.liquid:84-94; assets/base.css:1409; blocks/image-with-text.liquid:94-120, blocks/shop-the-look*.liquid, blocks/featured-product.liquid:243 (crop: 'center') | `image_tag` có, CSS không đè object-position; nhưng nhiều chỗ cắt server `crop: 'center'` với width+height cố định | NÊN (KHÔNG CHẮC) | Kiểm trên store dev ảnh có focal lệch tâm: nếu bản cắt server bỏ qua focal thì bỏ `crop`/height, để CSS `object-fit: cover` + object-position của `image_tag` |
| 12 | 4 page_image | Code | snippets/meta-tags.liquid:41-56 | og:image từ `page_image` | ĐẠT | — |
| 13 | 4 Country + language selector theo UX guideline | Thiết kế | localization.md:43-61, :70 | Tên nước + tiền tệ "CAD $", endonym ngôn ngữ, ô tìm > 10 nước, ở footer + drawer, ẩn khi 1 nước/1 ngôn ngữ; cờ chỉ cho nước, không cho ngôn ngữ | ĐẠT | (Ghi chú: nút gộp "USD / EN" giống Horizon; chấp nhận) |
| 14 | 4 Country + language — code | Code | blocks/footer.liquid:40-48, :300-345 | `form 'localization'`, nút submit country_code/language_code, endonym | ĐẠT | — |
| 15 | 4 Multi-level menus | Thiết kế | navigation.md:51, :61, :70, :132 | Mega/dropdown + drawer 3 cấp | ĐẠT | — |
| 16 | 4 Multi-level menus — code | Code | blocks/header.liquid:75-92, :147-164 | Chỉ đọc `link.links` (2 cấp); cấp 3 bị bỏ (navigation.md:240 đã ghi) | NÊN | FE lặp thêm `child.links` theo navigation.md §2 trước khi nộp |
| 17 | 4 Newsletter form | Thiết kế + Code | foundation.md:180; blocks/footer.liquid:87-97 | `form 'customer'` + `contact[tags]=newsletter` | ĐẠT | — |
| 18 | 4 Pickup availability trên PDP | Thiết kế + Code | product-shopify-features.md §7; blocks/product-form.liquid:365-390 | Dòng trạng thái + dialog/`<details>`, `store_availabilities` | ĐẠT | — |
| 19 | 4 Related + complementary | Thiết kế + Code | product.md:69-71, §7, §9; templates/product.liquid:16-20 | 2 block `product-recommendations` intent related/complementary | ĐẠT | — |
| 20 | 4 Rich media — product template | Thiết kế + Code | product.md:105-108; drafts/designer/ES1-T253/product.html:690-704; blocks/product-media.liquid:89-209 | Video, YouTube/Vimeo, 3D (model_viewer_tag) | ĐẠT | — |
| 21 | 4 Rich media — featured product section | Thiết kế | index-mobile-b.md:142-160; mockup ES1-T279, ES1-T293 | Featured product chỉ vẽ 1 thẻ ảnh; không nói video/3D | NÊN | Thêm vào spec §2: media video/3D/YouTube như PDP (poster + Play, model "View in 3D"), trạng thái trong mockup |
| 22 | 4 Rich media — featured product code | Code | blocks/featured-product.liquid:9, :101 | `featured.media \| where: 'media_type', 'image'` → bỏ hết video/3D | CHẶN | Render mọi `media_type` bằng cùng nhánh của blocks/product-media (video, external_video, model) |
| 23 | 4 Rich media — quick view | Thiết kế | mini-cart-quickview.md:115; mockup ES1-T262/mini-cart-quickview.html (không có video/3D) | QV chỉ "ảnh chính" + thumbnail; không video/3D | CHẶN (nếu theme có QV) | Spec QV §3 mục 3: media dùng component gallery PDP (video poster + Play, 3D), thumbnail nhãn ▶/3D; vẽ 1 khung QV có video |
| 24 | 4 Search template + predictive search | Thiết kế + Code | search.md; predictive-search.md; snippets/predictive-search.liquid; templates/search.liquid | Có cả hai; template search còn thô (dòng 8) | ĐẠT (tồn tại) / xem dòng 8 | — |
| 25 | 4 Selling plans hiện ở cart | Thiết kế + Code | product-shopify-features.md:123, §11; snippets/cart-lines.liquid:88-91 | Tên plan trên dòng giỏ (page + drawer) | ĐẠT | — |
| 26 | 4 Shop Pay Installments trên PDP | Thiết kế | drafts/designer/ES1-T288/shopify-features.html:45, :279, :314, :602, :796 | (đã biết c) chữ "shop Pay" khung nét đứt, màu foreground thay logo Shopify | NÊN | Dùng ảnh banner thật của `shopify-payment-terms` (logo Shop Pay tím) hoặc ghi rõ "logo do Shopify vẽ"; không tự vẽ logo |
| 27 | 4 Shop Pay Installments — spec/code | Thiết kế + Code | product-shopify-features.md:80-86; blocks/product-form.liquid:141 | `form \| payment_terms`, theme chỉ đổi vị trí/cỡ chữ | ĐẠT | — |
| 28 | 4 Unit pricing — collection card | Thiết kế | product-shopify-features.md §3.1, §9.1 (F7); foundation.md:255-264 | Có ở spec ES1-T288 nhưng foundation §9 (card gốc) chưa cập nhật (§15 đã ghi) | NÊN | Sửa foundation §9 thêm dòng unit price 14 muted |
| 29 | 4 Unit pricing — code (card, PDP, cart) | Code | snippets/price.liquid:66-79; snippets/product-card.liquid:244; snippets/cart-lines.liquid:107-120 | `unit_price` + `unit_price_measurement` | ĐẠT | — |
| 30 | 4 Variant images | Thiết kế + Code | product.md:103; blocks/product-media.liquid:42; assets/product-variant-picker.js:164 | Ảnh variant lên đầu, đổi variant trượt tới ảnh | ĐẠT | — |
| 31 | 4 Follow on Shop — thiết kế | Thiết kế | foundation.md §4 (176-201); drafts/designer/ES1-T251/foundation.html | Spec + mockup footer không có nút Follow on Shop; không quy định vị trí, nền | NÊN | Thêm vào footer §4 (cạnh social): nút do `login_button` vẽ, giữ màu tím Shopify, không đặt viền/nền theme; vẽ ô chỗ trong mockup |
| 32 | 4 Follow on Shop — code | Code | blocks/footer.liquid:202-204; assets/base.css (không có rule `.site-footer__shop-follow`) | `shop \| login_button: action: 'follow'`, không CSS đè màu | ĐẠT | — |
| 33 | 4 Account `<shopify-account>` desktop + mobile | Thiết kế | foundation.md:144-151; navigation.md:13, :59, :135; mockup ES1-T260/navigation.html:208, :291, :361, :384 | Icon account ở header mọi mốc + "Sign In" chân drawer | ĐẠT | (NÊN nhẹ: ghi trong spec là web component Shopify, popover/avatar khi đăng nhập do Shopify vẽ) |
| 34 | 4 Account — code | Code | blocks/header.liquid:210-218; assets/base.css:7490-7497, :7767 | `<shopify-account>` trong header, không ẩn theo mốc, 24 × 24 | ĐẠT | — |
| 35 | 4 Sections Everywhere | Code | templates/*.liquid (không có .json), không có thư mục sections/ | Template .liquid + `{% block %}` của Skeleton mới | KHÔNG CHẮC (thuộc mục 5) | Agent mục 5 xác nhận với yêu cầu "template .json, JSON sections" |
| 36 | 4/7 Swatch dùng swatch.color / swatch.image | Code | snippets/product-variant-picker.liquid:68-79 (ĐẠT); snippets/product-card.liquid:131-137, :334-335 | Card dự phòng metafield `custom.swatch_colors` khi option không có swatch | NÊN | Bỏ nhánh `custom.swatch_colors` (metafield tự định nghĩa, không có ở store merchant; mục 14/22); option không có swatch thì hiện pill/không swatch như variant-picker.md VP3 |

## B. Mục 7 — Layout

| # | Mục yêu cầu | Lớp | File:dòng | Hiện trạng | Mức | Cách sửa đề xuất |
| --- | --- | --- | --- | --- | --- | --- |
| 37 | 7 Layout: payment icons full color từ `shop.enabled_payment_types` | Code | blocks/footer.liquid:348-354 | Nếu Files có `efx-pay-1.png` thì in 5 ảnh PNG cố định (`images['efx-pay-N.png']`) thay icon theo cổng thanh toán, bỏ qua setting `show_payment_icons` | CHẶN | Xoá nhánh `figma_pay`; chỉ dùng `shop.enabled_payment_types` + `payment_type_svg_tag` (đã có dòng 355-360) |
| 38 | 7 Layout: payment icons — thiết kế | Thiết kế | drafts/designer/_kit/kit.css:498; ES1-T251/foundation.html:684; ES1-T255/cart.html:320, :409; foundation.md:183 | Icon vẽ ô trắng chữ đen "DISC/MC/AMEX/PP" (đơn sắc); spec không ghi "full color" | NÊN | Mockup dùng SVG màu thật của `payment_type_svg_tag`; spec foundation §4 và cart §3.6 ghi "full color, không filter/opacity/grayscale" |
| 39 | 7 Layout: `<html lang>`, routes, content_for_header | Code | layout/theme.liquid:2, :29; layout/password.liquid:2, :14; không có URL cứng `/cart` `/search` trong assets/blocks | Đúng | ĐẠT | — |

## C. Mục 7 — Product page

| # | Mục yêu cầu | Lớp | File:dòng | Hiện trạng | Mức | Cách sửa đề xuất |
| --- | --- | --- | --- | --- | --- | --- |
| 40 | product.title không cắt (PDP) | Thiết kế + Code | product.md:118; blocks/product-info.liquid:6, :75 | h1 đủ tên | ĐẠT | — |
| 41 | product.title — thanh mua dính | Thiết kế + Code | product.md:234; ES1-T253/product.html:226; assets/base.css:3860-3870 | Tên 1 dòng ellipsis ở sticky bar | NÊN (rủi ro thấp: h1 vẫn đủ) | Cho 2 dòng hoặc ghi rõ lý do; reviewer có thể bắt "title truncated" |
| 42 | "Not truncated" áp cả card trong collection grid | Thiết kế | foundation.md:264; collection.md:164; ES1-T254/collection.html:103 (`-webkit-line-clamp: 2`) | Tên card tối đa 2 dòng "…" | CHẶN (mục 7 Collection) | Bỏ line-clamp tên card ở collection/search/related; tên xuống dòng tự nhiên (code `product-card__title` hiện không clamp — giữ) |
| 43 | (liên quan) article.title không cắt ở blog | Thiết kế + Code | foundation.md:270; blog.md:42; drafts/designer/_kit/kit.css:336; assets/base.css:5386-5398 (`line-clamp: 3`) | Tiêu đề card bài viết tối đa 3 dòng | CHẶN (mục 7 Blog — ngoài phạm vi A, báo agent Blog) | Bỏ clamp; card cao theo nội dung |
| 44 | variant.price, compare-at, unit_price, description, tên + giá trị option | Thiết kế + Code | product.md:118-133; variant-picker.md; snippets/price.liquid | Đủ; legend "Color: Black" | ĐẠT | — |
| 45 | Mọi ảnh xem được, tỉ lệ khác không vỡ; ảnh variant | Thiết kế + Code | product.md:103-108 (lightbox, contain) | Đủ | ĐẠT | — |
| 46 | cart.taxes_included | Thiết kế + Code | product.md:128; blocks/product-info.liquid:52-55 | Ghi chú thuế theo `cart.taxes_included` | ĐẠT | — |
| 47 | Option selector tách riêng; swatch.color/image | Thiết kế + Code | variant-picker.md:38-61; snippets/product-variant-picker.liquid:68-94 | Mỗi option 1 fieldset, swatch từ `value.swatch` | ĐẠT | — |
| 48 | Quantity selector; Add to cart disabled khi hết | Thiết kế + Code | product.md:248, :283 (default true); blocks/product-form.liquid:223-234, :330-351 | Đủ | ĐẠT | — |
| 49 | Variant còn hàng đầu tiên mặc định; cập nhật giá/compare/sold out | Thiết kế + Code | variant-picker.md:39; blocks/product-info.liquid:50 | `selected_or_first_available_variant` | ĐẠT | — |
| 50 | Gift card recipient (email, name, message, send_on) | Thiết kế + Code | product-shopify-features.md §6; blocks/product-form.liquid:245-317 | Đủ 4 trường + `__shopify_send_gift_card_to_customer`, send_on ≤ 90 ngày | ĐẠT | — |
| 51 | Recommendations, rich media, accelerated (default on), pickup, installments | — | xem dòng 4, 18-20, 27 | | ĐẠT | — |

## D. Mục 7 — Cart page

| # | Mục yêu cầu | Lớp | File:dòng | Hiện trạng | Mức | Cách sửa đề xuất |
| --- | --- | --- | --- | --- | --- | --- |
| 52 | Dòng: title, unit_price, image, final_price, quantity, options_with_values | Thiết kế + Code | cart.md:58, §3.1; snippets/cart-lines.liquid:42-164 | Đủ; tên cart page không cắt | ĐẠT | — |
| 53 | Title dòng ở mini cart | Thiết kế | mini-cart-quickview.md:74; ES1-T262/mini-cart-quickview.html:79 | Tên tối đa 2 dòng (clamp) | NÊN (rủi ro thấp; yêu cầu cart chỉ ghi "title") | Cân nhắc bỏ clamp cho đồng bộ quy tắc "không cắt tên sản phẩm" |
| 54 | cart.total_price, taxes_included, checkout submit, notes, empty state | Thiết kế + Code | cart.md §3.5, §3.6, §3.9, §4 State 7; snippets/cart-summary.liquid:43-51; blocks/cart-page.liquid:95-104 (`form="cart-form-page"`) | Đủ | ĐẠT | — |
| 55 | Đổi số lượng từng dòng, cập nhật làm mới mọi dòng | Thiết kế + Code | cart.md §3.2, §4 | Partial `cart-page` | ĐẠT | — |
| 56 | Automatic discounts, selling plans, accelerated (default on) | — | dòng 1, 4-6, 25 | | ĐẠT (code) / CHẶN mockup dòng 1 | — |

## E. Mục 7 — Gift card page

| # | Mục yêu cầu | Lớp | File:dòng | Hiện trạng | Mức | Cách sửa đề xuất |
| --- | --- | --- | --- | --- | --- | --- |
| 57 | Apple Wallet (huy hiệu chính thức) | Thiết kế | drafts/designer/ES1-T258/gift_card.html:59, :95, :149 | (đã biết d) nút tự chế nền foreground + icon ví chung; spec gift-card.md:1, :43 thì đúng (asset Shopify) | CHẶN (hình trình BGĐ sai) | Dùng `gift-card/add-to-apple-wallet.svg` trong mockup |
| 58 | Apple Wallet — code | Code | templates/gift_card.liquid:52-61 | Asset Shopify `add-to-apple-wallet.svg` khi `pass_url` | ĐẠT | — |
| 59 | QR ≥ 120 × 120 | Thiết kế | gift-card.md:43 (QR 144) | Đủ | ĐẠT | — |
| 60 | QR — code | Code | templates/gift_card.liquid (toàn file) | (đã biết e) không có QR, không nạp `vendor/qrcode.js` | CHẶN | Thêm `vendor/qrcode.js` (shopify_asset_url) + phần tử QR 144 từ `gift_card.qr_identifier` theo gift-card.md §2 |
| 61 | Mã + logo hoặc shop.name | Thiết kế + Code | gift-card.md:36-43; templates/gift_card.liquid:31-50 | `format_code`, logo hoặc ảnh card + h2 shop.name | ĐẠT | — |

## F. Mục 7 — Password page

| # | Mục yêu cầu | Lớp | File:dòng | Hiện trạng | Mức | Cách sửa đề xuất |
| --- | --- | --- | --- | --- | --- | --- |
| 62 | Logo hoặc shop.name, password_message, ô mật khẩu — thiết kế | Thiết kế | password.md:36-42, :83 | Logo / shop.name, message, form mật khẩu trong `<details>` (mở sẵn khi lỗi) | ĐẠT | — |
| 63 | Logo hoặc shop.name — code | Code | templates/password.liquid:3-4; layout/password.liquid:17-21 | Chỉ h1 cố định "This shop is private"; KHÔNG có logo, KHÔNG có shop.name | CHẶN | Thêm thanh logo theo password.md §2: `settings.logo` (alt shop.name) hoặc `shop.name` |
| 64 | password_message + ô nhập — code | Code | templates/password.liquid:6-24 | Có `shop.password_message`, `form 'storefront_password'`, label + input | ĐẠT | — |
