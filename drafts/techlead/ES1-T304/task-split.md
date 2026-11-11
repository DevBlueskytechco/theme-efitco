KHÔNG CHẮC: (1) nơi Shopify lưu setting của static block trong template `.liquid` khi sửa bằng editor chưa xác định (ES1-T307 KHÔNG CHẮC 6). TS-FE3, TS-FE4 bỏ nội dung demo khỏi `templates/index.liquid`, nên phải chờ spike + fixture ES1-T331. Spike thất bại thì 2 task này dừng, báo CTO. (2) `theme_documentation_url`, `theme_support_url` (C/N8) và preset mang tên theme (C11) cần tên theme, việc này CTO đang quyết ở README §3 mục 3. Đã hỏi ở ticket question (xem §6), chưa tách task code. (3) Ảnh demo có logo bên thứ ba (C12, C13) thuộc mục CTO quyết, không tách. (4) Sức chứa: +35 point FE chưa có trong kế hoạch ES1-T307, nên FE vượt sức chứa thêm (§7). Đã báo ở ES1-T311.

# ES1-T304: Tuân thủ Shopify Theme Store, tách task code theo rà soát 11/11

Nguồn: docs/design/shopify-audit-1111/README.md §2 + bảng A, B, C; docs/design/decisions.md 11/11; docs/ui-spec foundation §27–§29, gift-card, password, 404, page, article, blog; ES1-T307 task-split §2 (ranh giới), ADR 0004, ADR 0007–0010 (nhánh feature/ai-ES1-T307, Chấp nhận); code develop `ce08212`.
Không tách: mục 5 Theme Store (template .json, section groups, Custom Liquid, @app). CTO chốt 11/11 ghi trong comment ticket và decisions.md. Ba mục "Cần CTO quyết" cũng không tách.

## 1. Quyết định kỹ thuật

- D1 Logo, favicon toàn theme: ADR 0011. `config/settings_schema.json` thêm nhóm "Logo and favicon" gồm `logo` (image_picker) và `favicon` (image_picker, info "Will be scaled down to 32 x 32px"). Header và footer lấy logo theo thứ tự `block.settings.logo`, rồi `settings.logo`, rồi chữ `shop.name`. Gift card và password lấy `settings.logo`, không có thì `shop.name`. Xoá `snippets/logo-efitco.liquid`, logo Efitco chỉ là ảnh upload trên store dev. `<link rel="icon">` đặt ở `layout/theme.liquid` và `layout/password.liquid`.
- D2 Nội dung mặc định: theo ADR 0011, áp ES1-T308 #1 và D10 của ES1-T307. Theme mới cài để trống. `templates/*.liquid` và `layout/*.liquid` không được chứa handle `figma-*`, `images['efx-*']`, `all_products[...]`, metafield `custom.demo_video` hay YouTube id cứng. Block lấy nguồn từ setting của chính nó (collection, product, image_picker, video), default rỗng, editor hiện placeholder. Bậc giảm mặc định 0. Claim, cam kết, số liệu, tên shop: default rỗng, rỗng thì ẩn. Không fallback sang câu mẫu trong locale. Nội dung Figma chỉ cấu hình trên store dev qua fixture ES1-T331.
- D3 Rich media dùng chung: ADR 0012. Tách nhánh `case media.media_type` của `blocks/product-media.liquid` thành `snippets/product-media-item.liquid`. `blocks/featured-product.liquid` dùng snippet này, và quickview TE-3-R2-FE2 (ES1-T373) cũng dùng. Featured product bọc media bằng `<product-media-gallery>` như PDP, nên `assets/product-media.js` xử lý video, YouTube/Vimeo, 3D. `featured-product.js` bỏ phần media.
- D4 `.rte` chung (foundation §28): định nghĩa một lần trong `assets/base.css`. Áp cho `templates/article.liquid`, `templates/page.liquid`, `templates/page.contact.liquid`, `blocks/collection-banner.liquid` (mô tả) và mô tả sản phẩm ở `blocks/product-info.liquid`. Xoá rule riêng `.product-info__description` (base.css 3802–3824) trong cùng PR. h1–h6 khác nhau theo §28. h5/h6 gốc nằm trong `assets/critical.css` 113–116.
- D5 Không cắt tên (decisions 11/11 (3)): `grep -nE "line-clamp|text-overflow: ellipsis" assets/*.css` chỉ còn ở selector không phải tên sản phẩm, collection hay bài viết. Hiện được giữ: critical.css:241 (chữ tên shop của logo) và base.css:5374 (badge). Phải bỏ: base.css 3860–3870 (`.product-sticky-bar__title`, chuyển sang xuống dòng), 5386–5398 (`.article-card__title`), 7407–7416 (`.video-card__product-title`).
- D6 Gift card QR: dùng thư viện của Shopify `{{ 'vendor/qrcode.js' | shopify_asset_url }}`, không tự viết encoder. FE in khung `data-gift-card-qr` 144 × 144 với `data-identifier="{{ gift_card.qr_identifier }}"` và chữ dự phòng "Enter the code at checkout". BE viết `assets/gift-card-qr.js` (≤ 1 024 B) và đặt 2 thẻ script.
- D7 Predictive search trỏ tới asset chưa có: không tạo ticket mới. `assets/search-loader.js` và `assets/predictive-search.js` là đầu ra của ES1-T130 (BE, đang mở). `snippets/predictive-search.liquid` không có thẻ script nào trỏ tới file thiếu, chỉ `{% doc %}` nhắc tên. Hiện không JS thì link sang trang search vẫn chạy. ES1-T129 bỏ blocked_by "con ES1-T304 (asset thiếu)". ES1-T130 thêm DoD: 2 file tồn tại, header nạp lười theo interaction (ADR 0010), doc snippet khớp.
- D8 Template test và block mẫu (B#7, C/N9): giữ trong repo vì hơn 20 spec e2e và lhci `?view=figma` đang dùng, và AGENTS.md lấy `liquid-tips` làm ví dụ chuẩn. Gói release (R1 Canvas 28/12) loại ra bằng `scripts/theme-zip.sh`: 8 file `templates/index.*.liquid`, `blocks/hello-world.liquid`, `blocks/liquid-tips.liquid`, `assets/liquid-tips.js`. Không dùng `.shopifyignore`, vì file này chặn luôn khi push lên store dev và làm hỏng e2e.
- D9 Search (B#8, #27, #29, #46) chuyển sang ES1-T128 (ES1-T307 §2). Menu 3 cấp (A#16) chuyển sang TE-22-R2-FE2. Hai mục này không tách ở đây.
- D10 Thứ tự: task con ES1-T304 chạy trước task REQ-0002 sửa cùng file. Task REQ-0002 đang blocked_by ES1-T304 thì đổi sang task con tương ứng (§5).

## 2. Hợp đồng FE/BE

| Cặp | Custom element (FE đặt thẻ host) | Hook `data-*` | `data-testid` | Partial | Script (BE đặt) |
| --- | --- | --- | --- | --- | --- |
| TS-FE8 / TS-BE1 (gift card) | không có, BE dùng hàm module gắn vào `[data-gift-card-qr]` | `data-gift-card-qr`, `data-identifier`, `data-label` (tên ảnh QR từ `gift_card.qr_alt`) | `gift-card-qr`, `gift-card-qr-fallback`, `gift-card-code`, `gift-card-wallet` | — | `vendor/qrcode.js` (`shopify_asset_url`, defer) + `gift-card-qr.js` (`type="module"`) trong `templates/gift_card.liquid` |
| TS-FE9 / TS-BE1 (featured media) | `<product-media-gallery>` bọc media featured product, cùng thẻ với PDP | `data-media-count`, `data-product-id` (BE lọc `theme:variant:change` theo id này), `data-media-type` trên từng `li` | giữ testid PDP trong snippet (`product-media-item`, `product-media-video`, `product-media-external-video`, `product-media-external-video-template`, `product-media-model`), featured giữ `featured-product-media`, `featured-product-thumbnail` | `featured-product` (có) | `data-lazy-module` = `product-media.js`, `data-lazy-on` viewport (ADR 0010) trên root gallery featured |

## 3. Bảng task

DoD chung mọi task FE/BE (ghi vào ticket):
- `shopify theme check` 0 lỗi, `.theme-check.yml` không đổi.
- `npx playwright test tests/e2e/smoke.spec.ts` pass trên `STORE_URL`.
- `npx lhci autorun` đạt perf ≥ 96 desktop, ≥ 90 mobile, a11y ≥ 98 ở URL của task.
- FE: `wc -c assets/critical.css` ≤ 10 240 (hiện 9 921), `gzip -c assets/base.css | wc -c` ≤ 49 152 (hiện 41 277), xoá CSS cũ khi thay, không z-index số, setting chữ mới default rỗng.
- BE: `wc -c` từng file ≤ trần ghi ở task và ≤ 8 192, ghi phép cộng JS theo trang vào PR (ADR 0010), 0 console error.

| Mã | Phía | Pt | Sprint | Tên | Giải pháp | DoD riêng | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TS-FE1 | FE | 4 | S2 tuần 1 | config/settings_schema.json + config/settings_data.json + layout/theme.liquid + layout/password.liquid + blocks/header.liquid + blocks/footer.liquid (logo) + xoá snippets/logo-efitco.liquid + locales/en.default.schema.json: 2 setting toàn theme (logo, favicon), fallback shop.name, settings_data bỏ 4 link social + free_shipping_threshold | D1. Header/footer: `block.settings.logo \| default: settings.logo`, rỗng thì `<span class="site-header__logo-text">{{ shop.name \| escape }}</span>` (footer tương tự). Sửa `info.logo` cho khớp. Favicon: `{{ settings.favicon \| image_url: width: 32, height: 32 }}` + `rel="icon"`, chỉ in khi có. `settings_data.json` `current` còn `{}`. Mục 13, 14, 7 Shopify | `grep -rn "logo-efitco" blocks snippets layout templates` = 0; `grep -nE "social_\|free_shipping" config/settings_data.json` = 0; store dev chưa chọn logo: `[data-testid=header-logo]` chứa đúng `shop.name`; có favicon: `link[rel=icon]` trả 200; ảnh header 360/1280 | — |
| TS-FE2 | FE | 3 | S2 tuần 1 | blocks/footer.liquid + locales/en.default.json + locales/en.default.schema.json: xoá nhánh figma_pay (dòng 348–354), 1 setting mới newsletter_button_label, default rỗng cho description, newsletter_text, trust_text_1..4 | D2. Payment icon chỉ lấy `shop.enabled_payment_types \| payment_type_svg_tag` theo `show_payment_icons`, full color, không filter/opacity. Nút: `newsletter_button_label \| default: 'blocks.footer.newsletter_submit' \| t`, locale đổi thành "Subscribe". Heading rỗng thì không in h2, bỏ fallback `newsletter_heading_html` (15%). Trust item có text rỗng thì không in. Mục 7 Layout, 8, 14 | `grep -n "efx-pay\|figma_pay" blocks/footer.liquid` = 0; `grep -n "15%" locales/en.default.json blocks/footer.liquid` = 0; store chưa cấu hình: nút có chữ "Subscribe", số `[data-testid=footer-payment-icon]` = số cổng bật; axe footer 0 serious | TS-FE1 |
| TS-FE3 | FE | 5 | S2 tuần 2 | templates/index.liquid + layout/theme.liquid (dòng 50) + blocks/testimonial-item.liquid + blocks/featured-product.liquid (param): bỏ 25 handle figma-*, 34 images['efx-*'] (gồm efx-news ở layout), metafield custom.demo_video, YouTube aqz-KE-bpKQ, home_demo, demo_countdown_end, default_verified | D2. Template chỉ truyền `id` và cấu trúc, không truyền dữ liệu demo. Param `{% doc %}` của block (`handle`, `image`, `collection`, `product`, `default_countdown_end`, `default_verified`, `newsletter_image` ở layout) nếu đã có setting tương ứng thì bỏ param. Chưa có setting thì thêm setting cùng kiểu, default rỗng, kèm placeholder editor. Verified chỉ theo setting `verified` (mặc định tắt, sổ 06/11 E9). Countdown chỉ theo ngày thật (ADR 0009). Mục 22, 8 | `grep -nE "figma-\|efx-\|all_products\[\|demo_video\|aqz-KE-bpKQ\|23:59\|home_demo\|default_verified" templates/index.liquid layout/theme.liquid` = 0; store chưa cấu hình: trang chủ không lỗi Liquid, block rỗng không in khung; store dev đã áp fixture ES1-T331: `npx playwright test tests/e2e/ES1-T176.spec.ts` không đỏ thêm so với develop | ES1-T331 |
| TS-FE4 | FE | 4 | S2 tuần 2 | locales/en.default.json + blocks/bundle-builder.liquid + blocks/shop-the-look.liquid + blocks/slideshow-slide.liquid + blocks/faq.liquid + blocks/testimonials.liquid + templates/index.liquid (param default_*): tier_1..3_percent default 0 ở 2 block, bỏ fallback câu mẫu có claim, sửa chính tả N13 | D2. Bậc giảm default 0, tức tắt dòng giảm và tổng sau giảm (info giữ nguyên). Chuỗi có số liệu hoặc cam kết ("Trusted by 10,000+ athletes", "360+", "12 Warranty months", "$99", "90 days", "1 Year Warranty", "Efitco provides…", testimonial mẫu có tên người và sao) không còn là default hay fallback, setting rỗng thì ẩn phần tử. Sửa "We aRE about", "do i", bỏ `&nbsp;`. Mục 8, 14, 20 | `grep -nE "10,000\|360\+\|Warranty\|Money Back\|\\$99\|90 [Dd]ay\|aRE\|&nbsp;" locales/en.default.json` = 0; schema 2 block: mọi `tier_*_percent` default 0; store chưa cấu hình: bundle không có dòng "discount", tổng = tổng giá | TS-FE3 |
| TS-FE5 | FE | 5 | S2 | assets/critical.css + assets/base.css + templates/article.liquid + templates/page.liquid + blocks/collection-banner.liquid + blocks/product-info.liquid: .rte chung (h1–h6, p, ul, ol, blockquote, table, img, hr, a), h6 khác h5, bỏ cắt tên 3 chỗ, viền radio quiz | D4, D5. h5 Inter 600 18, h6 Inter 600 16 uppercase ls 0.04em (foundation §28, mục 12). Bọc output rich text bằng `<div class="rte">`. Xoá `.product-info__description` cũ. Base.css 7617 `.quiz-option__mark` viền `var(--color-muted-light)` (5.33:1). Mục 8, 12, 7 | `grep -c "\.rte" assets/base.css` ≥ 1, `grep -rn 'class="rte' templates blocks` ≥ 4 chỗ; `grep -n "product-info__description" assets/base.css` = 0; `grep -nE "line-clamp\|text-overflow: ellipsis" assets/*.css` chỉ còn critical.css:241 và badge; Playwright: computed style h5 ≠ h6 trên `.rte`; axe `color-contrast` + `non-text` quiz 0 serious | — |
| TS-FE6 | FE | 4 | S2 | snippets/product-card.liquid + locales/en.default.schema.json: swatch chỉ từ value.swatch.color/image, Sale badge theo compare_at_price_max, 11 nhãn setting theo §14 | Bỏ `custom.swatch_colors` (dòng 131–137, 334–335). Option không có swatch thì không in swatch, theo VP3. Không truyền variant: `product.compare_at_price_max > product.price_min` thì có badge "Sale". Có variant thì giữ logic hiện tại. Nhãn: `collection_card_title`, `level_card_title` "Title" thành "Heading". 8 nhãn "Eyebrow" thành "Subheading", block đã có subheading thì dùng "Text above heading". `testimonial_verified` thành "Show verified label". Không đổi id setting. Mục 4, 7, 14 | `grep -n "swatch_colors" snippets/product-card.liquid` = 0; `grep -nE "\"Eyebrow\"\|\"Title\"\|Show Verified" locales/en.default.schema.json` = 0; Playwright: sản phẩm chỉ biến thể thứ 2 sale có badge trên `/collections/all` | — |
| TS-FE7 | FE | 3 | S3 | templates/blog.liquid + templates/article.liquid + templates/page.contact.liquid (mới) + locales/en.default.json: excerpt_or_content, thông báo comment (posted/moderated), form liên hệ 3 trường, ảnh sizes + lazy | `article.excerpt_or_content \| strip_html \| truncatewords: 30` (mục 7 Blog). Article: `form.posted_successfully?` thì hộp `role="status"` `tabindex="-1"`, chuỗi theo `blog.moderated?` (article.md §7), lỗi giữ `form.errors`. `page.contact`: `{% form 'contact' %}` name, email, body, label thật, `form.posted_successfully?` + `form.errors`, `.rte` cho `page.content`, không setting mới (page.md §1 đề xuất block `contact-form` để TE-21-R2-FE1 làm). Ảnh: `image_tag` có `widths`, `sizes`, ảnh đầu blog `loading: eager`, còn lại `lazy`. Chỉ markup tối thiểu, giao diện theo spec là việc của TE-20/TE-21. Mục 7 Blog, Article, Page, 17 | `grep -n "excerpt_or_content" templates/blog.liquid` ≥ 1; `ls templates/page.contact.liquid`; Playwright: POST comment trên blog duyệt → `[role=status]` có chữ chờ duyệt; contact gửi thiếu email → lỗi, đủ → hộp thành công (hCaptcha chặn thì chạy tay, ghi PR) | TS-FE5 |
| TS-FE8 | FE | 3 | S3 | templates/404.liquid + templates/password.liquid + templates/gift_card.liquid + locales/en.default.json: 404 form search + link home, password logo/shop.name, khung QR 144 + chữ dự phòng, meta viewport gift card | 404: `<form action="{{ routes.search_url }}">` có label + `<a href="{{ routes.root_url }}">` (404.md §2 mục 4, 5). Password: `settings.logo` (alt `shop.name`) hoặc `shop.name` trên h1 (password.md §2). Gift card: khung QR theo §2 hợp đồng, ẩn khi `gift_card.expired` hoặc `enabled == false`, giữ asset Apple Wallet. Không đặt thẻ `<script>`, việc đó của BE. Mục 7 404, Password, Gift card | Playwright: `/404-xyz` có `input[type=search]` trong form tới `/search` và link `/`; trang password có `shop.name` hoặc ảnh logo; `/gift_cards/<demo>`: `[data-testid=gift-card-qr]` boundingBox ≥ 120 × 120; không JS: thấy `gift-card-qr-fallback` | TS-FE1 |
| TS-FE9 | FE | 4 | S3 | snippets/product-media-item.liquid (mới) + blocks/product-media.liquid + blocks/featured-product.liquid + assets/base.css: rich media featured product (image, video, external_video, model) | D3, ADR 0012. Snippet `{% doc %}`: `media`, `product`, `loading`, `sizes`, `widths`, `class_prefix`. Product-media gọi snippet, output PDP không đổi (giữ testid). Featured: bỏ `where: 'media_type', 'image'` (dòng 101), dùng `featured.media \| slice` ≤ 8, bọc `<product-media-gallery data-product-id>`, thumbnail nhãn ▶/3D (index-mobile-b §2). Poster cho video, không tự chạy. Mục 4 rich media | `grep -n "where: 'media_type', 'image'" blocks/featured-product.liquid` = 0; Playwright PDP `tests/e2e/ES1-T100.spec.ts` không đỏ thêm; featured product có video (store dev `media-dủ-loại` qua fixture): `[data-testid=product-media-video]` có trong `featured-product` | TS-FE3 |
| TS-BE1 | BE | 5 | S3 | assets/gift-card-qr.js (mới, ≤ 1 024 B) + 2 thẻ script trong templates/gift_card.liquid + assets/product-media.js (giữ ≤ 4 407 B) + assets/featured-product.js (bỏ phần media) + data-lazy-module trên gallery featured | D3, D6, hợp đồng §2. QR: `new QRCode(el, {text: identifier, width: 144, height: 144})`, ảnh có alt từ `data-label`, ẩn fallback khi vẽ xong. `product-media.js`: mọi truy vấn trong `this`, lọc `theme:variant:change` theo `data-product-id`, chạy được 2 instance cùng trang. `featured-product.js` bỏ xử lý `a[data-featured-media-id]` (ES1-T344 sau đó còn bỏ phần đếm). Mục 4, 7 Gift card | `wc -c assets/gift-card-qr.js` ≤ 1 024; `wc -c assets/product-media.js` ≤ 4 407; `wc -c assets/featured-product.js` < 2 290; Playwright: gift card QR là `img`/`canvas` ≥ 120 × 120; featured product bấm Play YouTube thì iframe nạp, đổi media thì video dừng; PDP đổi biến thể không làm featured đổi ảnh; trang chủ sau cuộn ≤ 65 536 B (ADR 0006) | TS-FE8, TS-FE9 |
| TS-QA1 | QA | 5 | S3 cuối | tests/e2e/<key>.spec.ts + drafts/qa/<key>/test-cases.md: kiểm tuân thủ Theme Store, 2 nhóm: tĩnh (đọc file repo, không cần store) và store dev | Nhóm tĩnh dùng `fs` đọc repo, là các grep ở DoD TS-FE1..FE9, chạy không cần `STORE_URL`, gắn tag `@static`. Nhóm store: favicon, logo fallback, payment icon, nút newsletter, 404, password, gift card QR ≥ 120, blog excerpt, comment status, contact, h5 ≠ h6, quiz contrast ≥ 3:1, không cắt tên (computed `-webkit-line-clamp: none`, `text-overflow` khác `ellipsis` trên `.product-card__title`, `.article-card__title`, `.video-card__product-title`, `.product-sticky-bar__title`), featured media video. Mỗi test ghi mục Shopify | `npx playwright test tests/e2e/<key>.spec.ts --grep @static` pass không cần store; cả file pass trên `STORE_URL`, desktop + Pixel 7, 0 skip do 429 | TS-FE7, TS-FE8, TS-BE1 |
| TS-OPS1 | DevOps | 2 | S4 | scripts/theme-zip.sh: loại 8 template index.*.liquid, blocks/hello-world, blocks/liquid-tips, assets/liquid-tips.js khỏi gói release | D8. Danh sách loại là hằng trong script, không đụng `.shopifyignore`. Mục 14, 22 | `bash scripts/theme-zip.sh` rồi `unzip -l` không có 11 file trên; `shopify theme check --path <thư mục giải nén>` 0 lỗi | ES1-T177 |

Tổng: FE 9 task / 35 point, BE 1 / 5, QA 1 / 5, DevOps 1 / 2.

## 4. Đối chiếu mục ticket với task

| Mục trong ticket ES1-T304 (mức) | Audit | Task |
| --- | --- | --- |
| gift card QR ≥ 120px (CHẶN) | A#60 | TS-FE8 + TS-BE1 |
| password logo/shop.name (CHẶN) | A#63 | TS-FE1 (settings.logo) + TS-FE8 |
| featured-product rich media (CHẶN) | A#22 | TS-FE9 + TS-BE1 |
| footer payment icons chỉ shop.enabled_payment_types (CHẶN) | A#37 | TS-FE2 |
| countdown demo bỏ "hôm nay 23:59" (CHẶN) | C1 | TS-FE3 |
| tier giảm mặc định 0 (CHẶN) | C3 | TS-FE4 |
| "Get 15% Off" thành setting (CHẶN) | C4 | TS-FE2 |
| bỏ Verified testimonial demo (CHẶN) | C6 | TS-FE3 |
| setting favicon (CHẶN) | C9 | TS-FE1 |
| logo dự phòng shop.name (CHẶN) | C10 | TS-FE1 |
| social link settings_data rỗng (CHẶN) | B#43, C11 | TS-FE1 |
| bỏ handle/ảnh/metafield demo trong index.liquid §22 (CHẶN) | B#48, #51 | TS-FE3 (+ claim ở TS-FE4) |
| search.liquid theo search.md (CHẶN) | A#8, B#27, #29 | ES1-T128 (đã chuyển, ES1-T307 §2) |
| 404 search + home (CHẶN) | B#32 | TS-FE8 |
| blog excerpt_or_content (CHẶN) | B#18 | TS-FE7 |
| article thông báo comment (CHẶN) | B#24 | TS-FE7 |
| template page.contact (CHẶN) | B#6 | TS-FE7 |
| predictive-search asset thiếu (CHẶN) | B#30 | ES1-T130 (D7) |
| h5 ≠ h6 (CHẶN) | C7, B#36 | TS-FE5 |
| viền radio quiz ≥ 3:1 (CHẶN) | C8 | TS-FE5 |
| .rte chung (CHẶN) | B#34, #35, N18 | TS-FE5 (+ page.contact ở TS-FE7) |
| không cắt tên base.css 3860, 5386–5398, 7407 (CHẶN) | B#21, #52, A#41 | TS-FE5 |
| menu 3 cấp (NÊN) | A#16 | TE-22-R2-FE2 (ES1-T327) |
| swatch.color/swatch.image (NÊN) | A#36 | TS-FE6 |
| compare_at_price_max (NÊN) | B#12 | TS-FE6 |
| ảnh sizes/lazy (NÊN) | B#46 | TS-FE7 (blog, article); ES1-T128 (search) |
| dọn template test (NÊN) | B#7, N9 | TS-OPS1 (D8) |
| nhãn setting §14 (NÊN) | N4, N5, N7 | TS-FE6 |
| claim mặc định (NÊN cao, ES1-T308 #1 bắt buộc) | N1, N2, N13 | TS-FE4 (footer ở TS-FE2) |

Không tách, ghi nợ: N14 (heading "Make fitness" đi từ 2.1:1 theo cuộn, sẽ sửa cùng TE-10-R2-BE3 `motion.js` hoặc TE-17-R2-FE2), N16 (104 chỗ `--figma-*` hex cứng, panel thiếu màu chữ, TE-10-R2-FE3 rà cuối Sprint 4), N17 (heading italic), A#11 (focal point `crop: 'center'`, QA kiểm trên store dev ở TS-QA1, lệch thì mở bug), B#39 (BlogPosting, Breadcrumb JSON-LD đã có ở TE-22-R2-FE1), N21 (QA đo hit area swatch ở TE-3-R2-QA1). Chờ CTO: C11 preset tên theme, N8 theme_info URL, N19 tên theme, C12/C13 ảnh demo có logo bên thứ ba.

## 5. Đổi blocked_by của task REQ-0002 (đang blocked_by ES1-T304)

| Ticket | Task REQ-0002 | Đổi ES1-T304 thành |
| --- | --- | --- |
| ES1-T319 | TE-1-R2-FE1 | TS-FE1 |
| ES1-T321 | TE-1-R2-FE4 | TS-FE2 (TS-FE1 đi trước) |
| ES1-T336 | TE-17-R2-FE1 | TS-FE4 (TS-FE3 đi trước) |
| ES1-T337 | TE-3-R2-FE1 | TS-FE6, TS-FE5 |
| ES1-T339 | TE-12-R2-FE1 | TS-FE4 |
| ES1-T342 | TE-17-R2-FE3 | TS-FE9 |
| ES1-T343 | TE-13-R2-FE1 | TS-FE3, TS-FE9 (cùng file featured-product) |
| ES1-T344 | TE-13-R2-BE1 | thêm TS-BE1 (cùng file featured-product.js) |
| ES1-T353 | TE-4-R2-FE5 | TS-FE5 |
| ES1-T357 | TE-4-R2-BE3 | thêm TS-BE1 (product-media.js giữ chạy nhiều instance) |
| ES1-T373 | TE-3-R2-FE2 | thêm TS-FE9 (quickview dùng `product-media-item`) |
| ES1-T381 | TE-20-R2-FE1 | TS-FE7, TS-FE5 (article-card) |
| ES1-T382 | TE-20-R2-FE2 | TS-FE7 |
| ES1-T383 | TE-21-R2-FE1 | TS-FE7 |
| ES1-T384 | TE-21-R2-FE2 | TS-FE8 |
| ES1-T387 | TE-11-R2-FE1 | TS-FE5 |
| ES1-T129 | TE-8-FE2 | bỏ (D7) |
| ES1-T130 | TE-8-BE1 | — (thêm DoD theo D7) |
| ES1-T128 | TE-8-FE1 | — (nhận B#8, #27, #29, #46: `result.object_type`, `search.filters`, sort, product-card, ảnh sizes/lazy) |

## 6. Ticket con và câu hỏi

TS-FE1 = ES1-T401 · TS-FE2 = ES1-T402 · TS-FE5 = ES1-T403 · TS-FE6 = ES1-T404 · TS-FE3 = ES1-T405 · TS-FE4 = ES1-T406 · TS-FE7 = ES1-T407 · TS-FE8 = ES1-T408 · TS-FE9 = ES1-T409 · TS-BE1 = ES1-T410 · TS-OPS1 = ES1-T411 · TS-QA1 = ES1-T412 (spec `tests/e2e/ES1-T412.spec.ts`). Tất cả có parent ES1-T304, nhãn REQ-0002.
Câu hỏi CTO: ES1-T413 hỏi `theme_documentation_url`, `theme_support_url` và preset `settings_data.json` theo tên theme (C11, N8, N19). Mặc định: giữ nguyên tới khi nộp Theme Store, không chặn task nào.
blocked_by trong ticket: ES1-T402 ← ES1-T401 · ES1-T405 ← ES1-T331 · ES1-T406 ← ES1-T405 · ES1-T407 ← ES1-T403 · ES1-T408 ← ES1-T401 · ES1-T409 ← ES1-T405 · ES1-T410 ← ES1-T408, T409 · ES1-T411 ← ES1-T177 · ES1-T412 ← ES1-T407, T408, T410.

## 7. Cập nhật bảng sprint ES1-T307 §7

| Sprint | FE thêm | BE thêm | QA thêm | DevOps |
| --- | --- | --- | --- | --- |
| Sprint 2 (16–27/11) | 25: TS-FE1, FE2 (tuần 1), TS-FE5, FE6, TS-FE3, FE4 (tuần 2, sau ES1-T331) | 0 | 0 | — |
| Sprint 3 (30/11–11/12) | 10: TS-FE7, FE8, FE9 | 5: TS-BE1 | 5: TS-QA1 | — |
| Sprint 4 (14–25/12) | 0 | 0 | 0 | 2: TS-OPS1 |

Cân lại: FE Sprint 2 thành 49 + 25 = 74, vượt khoảng 49 mỗi sprint. Đề xuất: TS-FE1..FE6 chạy trước, vì 5 task S2 của ES1-T307 đang chờ chúng (TE-1-R2-FE1, FE4, TE-17-R2-FE1, TE-3-R2-FE1, TE-12-R2-FE1). Lùi sang S3 các task trang chủ không bị chặn bởi tuân thủ: TE-7-R2-FE1, TE-2-R2-FE1 và TE-17-R2-FE1 (khoảng 12 point). Sau đó tổng FE Must Sprint 2–4 là 165 + 35 = 200, so với sức chứa khoảng 147, thiếu khoảng 53 point. BE Must 92 + 5 = 97, vẫn ≤ 107. Đã báo ES1-T311. CTO chọn giữa hai hướng: nới giờ FE, hoặc cắt theo thứ tự Should đã chốt, rồi tới TE-11 popup quiz, mở rộng TE-20, TE-6-R2-FE4. Không đề xuất cắt task CHẶN của ES1-T304.

Rủi ro: (1) ES1-T331 trễ thì TS-FE3, TS-FE4 trễ, kéo theo TE-17-R2-FE1, TE-12-R2-FE1. Dự phòng: TS-FE4 làm trước phần locale và schema tier (không đụng index.liquid), phần index làm sau. (2) Gift card thật trên store dev chưa có (gift-card.md KHÔNG CHẮC, ES1-T298), nên TS-FE8, TS-BE1, TS-QA1 kiểm QR bằng gift card do DevOps phát hành. Chưa có thì đánh dấu `test.fixme` và ghi PR. (3) Comment blog duyệt và hCaptcha contact có thể chặn tự động, khi đó chạy tay và ghi PR.
