KHÔNG CHẮC: (1) nhóm store chưa chạy trên STORE_URL vì phiên QA không có PREVIEW_URL/STORE_PASSWORD, nên chưa báo đạt, chờ store-tests trên PR. (2) `--grep @static` hiện không chạy được nếu thiếu PREVIEW_URL, vì globalSetup tests/setup/password.ts gọi `new URL(undefined)`. Đã hỏi ở ES1-T534 mục 2. QA đã xác minh bằng config tạm không có globalSetup: 15 pass, 1 fixme. (3) AC10: snippets/product-card.liquid:225 (ảnh hover card) trái ADR 0012 Đo, đã hỏi ở ES1-T534 mục 1, TC-13 để fixme. (4) Chưa type-check bằng tsc vì lệnh bị chặn quyền trong phiên. Playwright `--list` đã biên dịch đủ 39 test.

# ES1-T412 — TS-QA1: kiểm tuân thủ Theme Store ES1-T304 (@static + store dev)
Nguồn: ticket ES1-T412; drafts/techlead/ES1-T304/task-split.md §3 (TS-QA1, DoD TS-FE1..FE9, TS-BE1), §4; docs/adr/0011 mục Đo; docs/adr/0012 mục Đo; docs/design/shopify-audit-1111 (README, A, B, C). Danh sách AC: drafts/qa/ES1-T412/ac-list.md. Không có Figma node (ticket tuân thủ).
Spec: tests/e2e/ES1-T412.spec.ts (1 file theo ticket, 2 nhóm: `ES1-T412 @static` và `ES1-T412 store — …`). Mỗi test gắn annotation `shopify`, `audit`, `task`.
Quan hệ với spec task con: ES1-T403, T404, T407, T408, T410 kiểm chi tiết từng task. File này là bộ hồi quy tuân thủ ở mức mục Shopify, giữ cho task REQ-0002 sau không làm vỡ lại. Không sửa spec task con.

| ID | AC | Mục Shopify | Audit | Task | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | §22, §8 | B#48, B#51, C1, C6 | TS-FE3 (ES1-T405) | repo ở commit PR | đọc templates/index.liquid + layout/*.liquid (bỏ comment Liquid) | 0 dòng khớp `collections['`, `all_products['`, `images['`, `metafields.custom`, `23:59`, `home_demo`, `default_verified` | static | P1 |
| TC-02 | AC1 | §22 (ADR 0011 Đo) | B#48, B#51 | TS-FE3 (ES1-T405) | repo | đọc mọi templates/*.liquid trừ `index.*.liquid` (bị loại khỏi gói, D8) + layout | 0 dòng khớp danh sách TC-01, cộng `figma-`, `efx-`, `aqz-KE-bpKQ`, `demo_video`, `demo_countdown_end` | static | P1 |
| TC-03 | AC2 | §14 | C10 | TS-FE1 (ES1-T401) | repo | tìm `logo-efitco` trong blocks, snippets, layout, templates | không có file snippets/logo-efitco.liquid, 0 lời gọi | static | P1 |
| TC-04 | AC2 | §14, §7 Password, §7 Gift card | C10, A#63 | TS-FE1, TS-FE8 | repo | đọc header, footer, password-hero, gift_card | header/footer: `block.settings.logo \| default: settings.logo`, nhánh else in `<span …logo-text>{{ shop.name \| escape }}`; password và gift card: `settings.logo` alt shop.name, else chữ shop.name | static | P1 |
| TC-05 | AC3 | §13, §14 | B#43, C11 | TS-FE1 | repo | đọc config/settings_data.json | không `social_`, `free_shipping`; `current` = `{}` | static | P1 |
| TC-06 | AC4 | §14 | C9, C10 | TS-FE1 | repo | parse config/settings_schema.json, đọc 2 layout | có `logo` và `favicon` kiểu image_picker, không default; theme.liquid và password.liquid in `<link rel="icon">` 32 × 32 chỉ trong `if settings.favicon != blank` | static | P1 |
| TC-07 | AC5 | §8 | C3 | TS-FE4 (ES1-T406) | repo | parse schema bundle-builder, shop-the-look | ≥ 3 setting `tier_*_percent` mỗi block, mọi default = 0 | static | P1 |
| TC-08 | AC6 | §8, §14 | C4, N1, N2, N13 | TS-FE2, TS-FE4 | repo | đọc locales/*.json | 0 dòng khớp `10,000`, `15%`, `Warranty`, `aRE`, `&nbsp;` | static | P1 |
| TC-09 | AC7 | §7 Layout | A#37 | TS-FE2 (ES1-T402) | repo | đọc blocks/footer.liquid | không `efx-pay`, `figma_pay`, `15%`; icon in trong `for type in shop.enabled_payment_types` bằng `payment_type_svg_tag` | static | P1 |
| TC-10 | AC8 | §7 Blog | B#18 | TS-FE7 (ES1-T407), ES1-T381 | repo | đọc templates/blog.liquid → blocks/blog-articles → snippets/article-card | template gọi block blog-articles; chuỗi có `.excerpt_or_content \| strip_html \| truncatewords:`; không in `{{ article.excerpt }}` trần | static | P1 |
| TC-11 | AC9 | §7 Page | B#6 | TS-FE7 | repo | kiểm file | templates/page.contact.liquid tồn tại, template + block contact-form có `form 'contact'` | static | P1 |
| TC-12 | AC10 | §4 rich media | A#22, A#23 | TS-FE9 (ES1-T409) | repo | đọc product-media, featured-product, product-media-item, template quick-view/featured-product | 0 `where: 'media_type'`; product-media và featured-product cùng `render 'product-media-item'` | static | P1 |
| TC-13 | AC10 | §4 (ADR 0012 Đo) | A#22 | TS-FE9 | repo | quét toàn bộ blocks, snippets, templates release | 0 `where: 'media_type'`. Hiện chỉ còn snippets/product-card.liquid:225, nên fixme chờ ES1-T534 mục 1 | static | P2 |
| TC-14 | AC11 | §7 Collection, Blog | B#21, B#52, A#41, A#42 | TS-FE5 (ES1-T403) | repo | parse rule mọi assets/*.css (bỏ comment), lọc rule có selector chứa 1 trong 4 class tên | không rule nào có `line-clamp`, `text-overflow: ellipsis`, `-webkit-box-orient`, `white-space: nowrap` | static | P1 |
| TC-15 | AC12 | §4 swatch | A#36 | TS-FE6 (ES1-T404) | repo | đọc snippets/product-card.liquid | không `swatch_colors`; có `value.swatch.color` hoặc `.image` | static | P2 |
| TC-16 | AC13 | §14 nhãn | N4, N5, N7 | TS-FE6 | repo | đọc locales/en.default.schema.json | 0 giá trị `"Eyebrow"`, `"Title"` | static | P3 |
| TC-17 | AC14 | §14 favicon | C9 | TS-FE1 | trang `/` trên preview | đọc `link[rel=icon]`, GET href | ≤ 1 thẻ. Có thẻ: href chứa `width=32`, trả 200, content-type `image/*`. Không thẻ (store chưa chọn favicon): không có thẻ `href=""`, ghi annotation `data` | E2E | P1 |
| TC-18 | AC15 | §14 logo | C10 | TS-FE1 | `/`, preview không logo (setting chưa áp) | đọc `og:site_name` và `[data-testid=header-logo]`, `footer-logo` | header-logo href `/`, text = shop.name, không chữ "EFITCO"; footer-logo không ảnh thì text = shop.name. Preview có logo: aria-label = shop.name, phần không logo fixme (chạy tay) | E2E | P1 |
| TC-19 | AC15 | §14 logo, nojs | C10 | TS-FE1 | `/`, JS tắt | đọc header-logo | không ảnh thì text = shop.name, có ảnh thì aria-label = shop.name | E2E nojs | P2 |
| TC-20 | AC16 | §7 Layout | A#37 | TS-FE2 | `/`, store bật cổng thanh toán | cuộn tới footer, đọc `[data-testid=footer-payment-icon]` | HTML không `efx-pay`/`figma_pay`; mỗi li 1 svg, 0 img; filter `none`, opacity 1 (full color); title svg không trùng | E2E | P1 |
| TC-21 | AC16 | §7 Layout | A#37 | TS-FE2 | `/`, có TS_PAYMENT_ICON_COUNT | đếm icon | số icon = TS_PAYMENT_ICON_COUNT. Thiếu biến thì fixme (ES1-T534 mục 3) | E2E | P1 |
| TC-22 | AC17 | §8 | C4 | TS-FE2 | `/` | đọc `footer-newsletter-submit`, footer | nút không chứa "15%", footer không "Get 15% Off"; setting footer chưa áp (không có description/heading/text/trust) thì nút = "Subscribe" | E2E | P1 |
| TC-23 | AC18 | §7 404 | B#32 | TS-FE8 (ES1-T408) | `/es1-t412-khong-ton-tai` | mở trang | status 404; `main form[action$=/search]` có `input[type=search][name=q]` hiện, searchbox tên "Search the store"; `not-found-home` href `/` | E2E | P1 |
| TC-24 | AC18 | §7 404, nojs | B#32 | TS-FE8 | như TC-23, JS tắt | mở trang | status 404, form search và link `/` vẫn hiện | E2E nojs | P2 |
| TC-25 | AC19 | §7 Password | A#63 | TS-FE1, TS-FE8 | context mới không cookie mở khoá, `/password` + query preview | mở trang | `password-logo` hiện; có img thì alt khác rỗng, không img thì chứa shop.name; logo nằm trên h1. Store không bật mật khẩu thì fixme | E2E | P1 |
| TC-26 | AC20 | §7 Gift card | A#60 | TS-FE8, TS-BE1 (ES1-T410) | TS_GIFT_CARD_URL | mở trang | QR img/canvas hiện ≥ 120 × 120; `gift-card-code` hiện; 1 meta viewport; 0 console error theme. Thiếu URL thì fixme (ES1-T298) | E2E | P1 |
| TC-27 | AC20 | §7 Gift card, nojs | A#60 | TS-FE8 | như TC-26, JS tắt | mở trang | khung `gift-card-qr` ≥ 120 × 120, chữ dự phòng "Enter the code at checkout" | E2E nojs | P2 |
| TC-28 | AC21 | §7 Blog | B#18 | TS-FE7 | TS_BLOG_NO_EXCERPT_PATH (blog có bài không excerpt, có content) | mở blog | mọi `article-card` trong grid có `article-card-excerpt` khác rỗng. Thiếu dữ liệu thì fixme (ES1-T534 mục 3) | E2E | P1 |
| TC-29 | AC21 | §7 Blog | B#18 | TS-FE7 | /blogs/te20-paged (12 bài) | mở blog | mọi card có trích đoạn | E2E | P2 |
| TC-30 | AC22 | §7 Article | B#24 | TS-FE7 | bài trên blog MODERATED (mặc định /blogs/te20-no-tag/te20-no-tag-01) | điền tên, email, nội dung, Post Comment | trang tải lại, `comment-status` role=status tabindex=-1 chứa "Thanks, your comment is in review". hCaptcha thì skip, chạy tay ghi PR | E2E | P1 |
| TC-31 | AC23 | §7 Page | B#6 | TS-FE7 | /pages/contact gán template contact | gửi thiếu email (tắt validate trình duyệt), rồi gửi đủ | lần 1: `contact-errors` hiện, `#ContactEmail` aria-invalid=true; lần 2: `contact-status` role=status "Thanks for contacting us". hCaptcha thì skip, chạy tay | E2E | P1 |
| TC-32 | AC24 | §8, §12 | C7, B#36, B#34, B#35 | TS-FE5 (ES1-T403) | /pages/te403-rte (có h5, h6) | đọc computed font-size, text-transform, letter-spacing h5, h6 trong `.rte` | khác nhau; h6 uppercase | E2E | P1 |
| TC-33 | AC25 | §12 | C8 | TS-FE5 | /?view=te11 có quiz | tính contrast border-top-color mark chưa chọn với nền tổ tiên gần nhất | mọi mark hiện ≥ 3:1 | E2E a11y | P1 |
| TC-34 | AC26 | §7 Collection | B#21, A#42 | TS-FE5 | /collections/all | đổ tên ≈ 40 từ + 1 từ 40 ký tự vào `.product-card__title` đầu | `-webkit-line-clamp` none, `text-overflow` không ellipsis, không nowrap, scrollHeight ≤ clientHeight + 1, ngang không tràn khi overflow khác visible | E2E | P1 |
| TC-35 | AC26 | §7 Blog | B#52 | TS-FE5 | /blogs/te20-paged | như TC-34 trên `.article-card__title` | như TC-34 | E2E | P1 |
| TC-36 | AC26 | §7 | A#41 | TS-FE5 | /?view=te13 (video-card có sản phẩm), PDP variant-co-ảnh-rieng | như TC-34 trên `.video-card__product-title`, cuộn PDP rồi `.product-sticky-bar__title` | như TC-34. Sticky bar ẩn thì chỉ kiểm computed | E2E | P2 |
| TC-37 | AC27 | §4 rich media | A#22 | TS-FE9, TS-BE1 | /products/media-dủ-loại?view=featured-product (block featured-product thật) | đọc `featured-product-media-item[data-media-type]` | có ít nhất 1 loại khác image; ≤ 8 media; video không autoplay, preload none; external_video có poster; model có `product-media-model`; chưa bấm thì 0 iframe; 0 console error theme | E2E | P1 |
| TC-38 | AC27 | §4 rich media | A#22 | TS-BE1 (ES1-T410) | như TC-37, YouTube/Vimeo được giả bằng page.route | chờ define `product-media-gallery`, bấm poster external_video | item có đúng 1 iframe src embed; URL trang không đổi; 0 console error | E2E | P1 |
| TC-39 | AC28 | §4 focal point | A#11 (NÊN, KHÔNG CHẮC) | nợ ES1-T304 §4 | `/`, /?view=te12, /?view=te13 | thu ảnh trong image-with-text, shop-the-look, featured-product có `style.objectPosition` khác 50% 50% | không ảnh nào vừa lệch tâm vừa có `crop=center` trong URL. Chưa có ảnh focal lệch tâm thì fixme. Fail thì mở bug theo A#11 | E2E | P3 |

## Case biên (ngoài AC)
- Rỗng, merchant chưa chọn resource: TC-05 (`current` = `{}`), TC-06 (logo/favicon không default), TC-07 (tier 0), TC-17 (không favicon thì không in thẻ), TC-18 (không logo thì shop.name), TC-22 (setting footer rỗng thì "Subscribe").
- Tối đa: TC-34..TC-36 dùng tên dài ≈ 40 từ và 1 từ 40 ký tự, nên không phụ thuộc dữ liệu store. TC-37 giới hạn ≤ 8 media.
- Không JS: TC-19, TC-24, TC-27 (trang render server). Các AC còn lại cần JS (gallery, quiz) hoặc chỉ là computed style.
- Mất mạng: TC-38 giả embed YouTube/Vimeo bằng `page.route` fulfill. Trường hợp vendor/qrcode.js lỗi mạng đã có ở ES1-T410 (route.abort), không lặp lại.
- 360px: project mobile (Pixel 7, 412px) chạy mọi test store. Mốc 360/768/1280/1920 không bắt buộc ở ticket này (không phải spec màn REQ-0002). Bố cục từng màn thuộc spec TE-x.
- Keyboard / screen reader: TC-23 kiểm searchbox có tên truy cập. TC-18, TC-19 kiểm aria-label logo. TC-30, TC-31 kiểm role=status và aria-invalid. TC-33 kiểm tương phản non-text.
- Editor (`design_mode`) và storefront: placeholder editor không đo được trên storefront. Phần storefront không in khung rỗng đã nằm ở TC-17, TC-22.
- 429/Cloudflare: điều hướng qua `gotoStore` (thử lại theo Retry-After, fail nói rõ 429, không skip). Trang thử thách thì `expectNotChallenged` fail kèm lý do. Theo DoD: 0 skip do 429.
- Ghi dữ liệu store: TC-30 (comment chờ duyệt) và TC-31 (email contact) chỉ chạy ở project desktop để không gửi gấp đôi.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
| Khoá (env hoặc tests/e2e/store-data.json) | Giá trị | Có chưa | Test |
| --- | --- | --- | --- |
| TE4_MEDIA_HANDLE | media-dủ-loại (video + external video, TE13_VIDEO_READY) | có | TC-37, TC-38 |
| TE4_VARIANTS_HANDLE | variant-co-ảnh-rieng | có | TC-36 |
| TE403_PAGE_PATH | /pages/te403-rte | có | TC-32 |
| TE385_PAGED_BLOG_PATH | /blogs/te20-paged | có | TC-29, TC-35 |
| TE407_ARTICLE_PATH | mặc định /blogs/te20-no-tag/te20-no-tag-01 (blog MODERATED, ES1-T385) | có | TC-30 |
| TE407_CONTACT_PATH | mặc định /pages/contact | chưa xác nhận | TC-31 (fixme nếu 404) |
| TS_GIFT_CARD_URL | gift card phát hành | chưa (ES1-T298) | TC-26, TC-27 fixme |
| TS_BLOG_NO_EXCERPT_PATH | blog có bài không excerpt | chưa (bài te20-* đều có summary) | TC-28 fixme |
| TS_PAYMENT_ICON_COUNT | số cổng bật trong admin | chưa | TC-21 fixme |
| preview không logo | — | phụ thuộc fixture ES1-T331 | TC-18 fixme nếu preview có logo |
| ảnh focal lệch tâm | ảnh trong image-with-text/shop-the-look/featured có focal ≠ tâm | chưa | TC-39 fixme |
Đã hỏi người nhập dữ liệu ở ES1-T534 mục 3.

## Kết quả chạy (21/11/2026)
- `npx playwright test tests/e2e/ES1-T412.spec.ts --list --project=desktop`: 39 test, biên dịch OK.
- @static chạy bằng config tạm không có globalSetup (đã xoá file tạm sau khi chạy): 15 pass, 1 fixme (TC-13, ES1-T534 mục 1). Với playwright.config.ts gốc mà thiếu PREVIEW_URL thì lỗi globalSetup (ES1-T534 mục 2).
- Nhóm store: chưa chạy, chờ store-tests trên PR, nên chưa báo đạt.
- Bug mở: 0. Chưa có bằng chứng fail trên store. Static fail duy nhất (TC-13) là mâu thuẫn ADR với phạm vi §4, đã chuyển thành question, không phải bug.

## KHÔNG CHẮC
- ES1-T534 mục 1: product-card hover `where: 'media_type', 'image'`, chờ chốt sửa code hay sửa ADR 0012 Đo.
- ES1-T534 mục 2: globalSetup chặn `--grep @static` khi không có store; ci.yml chưa chạy @static.
- TC-21: storefront không lộ số `shop.enabled_payment_types`, nên đếm chính xác cần số liệu từ admin.
- TC-39 (A#11): Shopify có bỏ focal point khi `image_url` có `crop: 'center'` hay không thì audit ghi KHÔNG CHẮC. Test chỉ đánh dấu khi ảnh vừa có object-position lệch tâm vừa bị cắt server `crop=center`. Kết luận cuối cần ảnh thật có focal lệch tâm trên store dev.
- TC-10: ticket ghi "blog.liquid có excerpt_or_content", nhưng ES1-T381 đã chuyển markup sang blocks/blog-articles + snippets/article-card. Test kiểm cả chuỗi template → block → snippet (nhất quán với ES1-T407).
