# SRS — theme-efitco · bản 0.2 · BA · 06/11/2026 (bản 0.1: 22/10/2026)

Nguồn: charter, PRD, Figma Efitco T10 (home), Skeleton AGENTS.md, Theme Store requirements (chuẩn nội bộ, mã R), Canvas requirements (22/10/2026). Bản 0.2: ES1-T173, theo ES1-T167, T168, T169 và CTO duyệt 06/11. AC-H* có mã TC-H* tương ứng; bảng nội dung theo node ở `drafts/ba/ES1-T173/home-content.md`.

## 0. Thuật ngữ
Block = đơn vị giao diện trong `blocks/` của Skeleton (thay cho section). Template = `templates/*.liquid` compose block. Partial = vùng HTML refresh không reload. Canvas = nơi merchant sửa theme; Sidekick = agent sửa file theme.

## 1. Yêu cầu phi chức năng
- NFR-1 Lighthouse home/product/collection: performance ≥ 96 desktop, ≥ 90 mobile; accessibility ≥ 98 (Theme Store tối thiểu 60/90).
- NFR-2 theme check 0 lỗi, không override; không console error.
- NFR-3 Kiến trúc đúng AGENTS.md; mọi thay đổi Sidekick làm vẫn giữ cấu trúc.
- NFR-4 Mọi tương tác có fallback không JS (form submit).
- NFR-5 Trình duyệt: Safari 2 bản, Chrome 3, Firefox 3, Edge 2; mobile Safari/Chrome/Samsung; webview IG/FB/Pinterest.
- NFR-6 Không phụ thuộc app; không script ngoài Shopify CDN.

## 2. Module và story

### TE-1 — Khung theme và design token
Phía: FE · Ước lượng sơ bộ: 8 point (techlead chốt)

Là merchant, tôi muốn theme có header 2 cấp, footer, announcement bar và màu/chữ theo Efitco T10 để mọi trang nhất quán ngay khi cài.

- AC1 Given tokens.json từ Figma When render bất kỳ trang Then màu nền/chữ/accent, font chính, khoảng cách, bo góc lấy từ settings (css-variables), không hardcode trong CSS.
- AC2 Given menu main-menu có 2 cấp When mở header desktop Then cấp 2 hiện dropdown, mở bằng hover và keyboard (Enter/Space, Esc đóng); mobile Then drawer có accordion.
- AC3 Given shop bật customer accounts When render header desktop và mobile Then có <shopify-account>, cart link có số lượng, search link.
- AC4 Given setting announcement text rỗng (mặc định — Figma không có announcement bar) When render Then không có announcement bar; có text Then bar hiện trên header, có link tuỳ chọn.
- AC5 Given shop bán ≥ 2 nước hoặc ngôn ngữ When render footer Then có country selector và language selector theo UX guideline Shopify; 1 nước/ngôn ngữ Then không hiện.
- AC6 Given footer When render Then có newsletter form (customer form, thông báo thành công/lỗi), menu footer default footer, social icons từ settings, payment icons từ shop.enabled_payment_types đủ màu.
- AC7 Given mọi trang When kiểm Then html lang = request.locale.iso_code, meta-tags snippet có title/description/canonical/og/twitter, page_image.
- AC8 Given token docs/tokens.json When render Then font heading Sofia Sans Condensed qua font_picker, body Inter; chữ phụ trên nền sáng dùng `--color-muted-light` #6B6B6B (≥ 4.5:1), #999999 chỉ trên nền tối.
- AC9 (trả lời ES1-T8, Designer 30/10) Given trang chủ có hero ở đầu When render header Then header trong suốt đè lên hero, chữ/icon trắng; trang không có hero Then nền `--color-background`, chữ `--color-foreground`. Given hero có ảnh When render Then lớp phủ đen theo setting `overlay_opacity` (mặc định 30%) để chữ đạt AA. Given cuộn quá 80px When header sticky (setting `sticky_header`, mặc định bật) Then nền trắng, bóng nhẹ, chữ `--color-foreground`. Given footer When render localization Then 1 nút gộp "USD / EN" mở 2 danh sách country và language (thay cách tách 2 selector ở AC5).
- AC-H28 (TC-H28, hàng 16) Given footer mặc định When render 1920 Then đủ: logo, mô tả, ảnh newsletter nếu đã chọn, heading 2 màu đạt AA, nút "Get 15% Off" + icon, "No spam. Unsubscribe anytime.", đúng 1:1104.
- AC-H29 (TC-H29, hàng 1, 2; story TE-1, TE-2) Given hero thật trên `/` When ở đầu trang và cuộn quá 80px Then header trong suốt chữ trắng, rồi nền trắng chữ foreground; bật lại TE-1 TC-46, TC-47.

Mã R: R4 menu đa cấp, newsletter, country/language, Follow on Shop, shopify-account; R7 layout; R11 SEO; R13 social; R14–R16 settings/font/màu

### TE-2 — Block slideshow (hero) và rich text
Phía: FE + BE (JS slideshow) · Ước lượng sơ bộ: 8 point (techlead chốt) · Figma 1:422, 1:437, 1:453 · CTO 31/10: làm slideshow như thiết kế

Là merchant, tôi muốn block slideshow (mỗi slide: ảnh hoặc video, 2 nút, 3 bố cục) và block rich text để mở đầu trang chủ theo Figma.

- AC1 Given hero có ảnh When render Then ảnh có focal point từ image_picker, srcset, eager load ở vị trí đầu trang; có video Then dùng video setting, autoplay muted loop, có poster.
- AC2 Given bố cục chọn trái/giữa/phải When render Then nội dung căn đúng ở 1280 và 768; ở 360 luôn căn giữa theo Figma.
- AC3 Given 0, 1 hoặc 2 nút có label When render Then chỉ nút có label hiện; nút có href từ url setting; nút thứ hai kiểu secondary.
- AC4 Given chưa chọn ảnh/video When trong editor Then placeholder lifestyle image; ngoài editor Then nền màu từ setting.
- AC5 Given rich text When render Then heading, body richtext, nút tuỳ chọn, độ rộng tối đa setting; heading level chọn h1/h2.
- AC6 Given slideshow có 1–5 slide (block con `slide`, mỗi slide theo AC1–AC4) When render Then chỉ slide đầu là LCP: ảnh slide 1 eager + fetchpriority high, slide sau lazy; 1 slide Then ẩn nút trái/phải và chấm. Root slideshow mang `data-header-overlay` khi đứng đầu trang (TE-1 AC9).
- AC7 Given ≥ 2 slide When người dùng bấm nút trái/phải, chấm, hoặc vuốt (cảm ứng) Then chuyển slide, chấm hiện slide đang xem (`aria-current`), slide ẩn có `inert`; không JS Then các slide cuộn ngang bằng scroll-snap, vẫn xem được hết.
- AC8 Given setting autoplay bật (mặc định tắt) When chạy Then đổi slide theo khoảng thời gian setting (3–10 s), có nút tạm dừng, dừng khi hover/focus và khi `prefers-reduced-motion: reduce`; không reset vòng lặp giả.
- AC9 Given trình đọc màn hình When vào slideshow Then root `role="region"` + `aria-roledescription="carousel"` + `aria-label`; mỗi slide `role="group"` + `aria-roledescription="slide"` + nhãn "n / tổng"; nút có tên truy cập.

Mã R: R3 layout; R12 a11y carousel; R14 settings; R17 ảnh responsive; R6 Lighthouse (LCP slide 1)

### TE-3 — Block featured collection và product card
Phía: FE+BE · Ước lượng sơ bộ: 8 point (techlead chốt)

Là merchant, tôi muốn đặt block hiện sản phẩm của một collection trên trang chủ để khách thấy hàng nổi bật mà không vào trang collection.

- AC1 Given chọn collection When render Then hiện tối đa N sản phẩm (4–12, mặc định 4 theo Figma, D7 của ES1-T169), lưới 2 cột ở 360, 3–5 cột ở 1280 theo setting.
- AC2 Given sản phẩm có ≥ 2 màu có swatch When render card Then hiện swatch (swatch.color hoặc swatch.image); chọn swatch đổi ảnh card và link biến thể, không reload; keyboard chọn được.
- AC3 Given compare_at_price > price When render Then giá gạch + badge sale với % giảm làm tròn, tính đúng với giá nhỏ.
- AC4 Given product.price_varies When render Then hiện khoảng giá min–max; có unit_price Then hiện unit price.
- AC5 Given collection rỗng hoặc chưa chọn When trong editor Then placeholder hướng dẫn; ngoài editor Then không render block.
- AC6 Given keyboard When tab qua card Then focus thấy được, ảnh có alt từ sản phẩm; touch target ≥ 44px; hình swatch giữ kích thước Figma, vùng bấm swatch ≥ 44px (D7 của ES1-T169, AGENTS.md).
- AC7 Given bật nút Xem tất cả When render Then nút link tới collection.url, vị trí theo setting.

- AC8 (Editions Fall '26 #20) Given collection đa nguồn có phần tử là variant When render card Then ảnh, giá, link ?variant= theo đúng variant đó, swatch chọn sẵn variant đó.
- AC-H11 (TC-H11, hàng 5) Given 4 tab gắn 4 collection When bấm hoặc dùng bàn phím đổi tab Then lưới đổi không reload, tab chọn có trạng thái chọn đọc được bởi trình đọc màn hình; không JS thì 4 tab là link tới collection.
- AC-H12 (TC-H12, hàng 5) Given tab có collection rỗng When chọn Then hiện thông báo rỗng, không còn card của tab trước.
- AC-H13 (TC-H13, hàng 5) Given sản phẩm có metafield rating When render card Then hiện sao + số; không có metafield thì không có badge.
- AC-H14 (TC-H14, hàng 5) Given sản phẩm thoả quy tắc New (CR-3) When render card Then badge New đạt 4.5:1; đang sale thì hiện badge % như Figma, quy tắc ưu tiên do CR-3 chốt.

Mã R: R7 collection (giá, unit price, ảnh); R7 product swatch; R12 a11y; R17

### TE-4 — Trang sản phẩm
Phía: FE+BE · Ước lượng sơ bộ: 13 point (techlead chốt)

Là khách, tôi muốn xem ảnh/video, chọn biến thể thấy giá và tồn cập nhật, thêm vào giỏ và checkout nhanh trên mobile.

- AC1 Given sản phẩm có media When render Then gallery hiện ảnh, video, 3D model (media filters), thumbnail, zoom ảnh; biến thể chọn đổi sang featured_media của biến thể.
- AC2 Given chọn option When đổi Then giá, compare_at, unit price, trạng thái tồn, nút Add to cart (disable khi hết/không tồn tại), URL ?variant= cập nhật không reload; first available variant load mặc định.
- AC3 Given render Then hiện product.title đầy đủ, description, vendor (tuỳ setting), option names/values, cart.taxes_included thông báo khi có, số lượng chọn được.
- AC4 Given shop bật When render Then có accelerated checkout (payment_button, bật mặc định, màu không đổi), Shop Pay Installments banner, pickup availability, selling plan selector nếu có.
- AC5 Given cuộn xuống trên mobile When nút chính ra khỏi màn Then sticky bar hiện tên, giá, nút Add to cart.
- AC6 Given gift card product When render Then form recipient (email, name, message, send_on).
- AC7 Given cuối trang When render Then block related products và complementary products từ Product Recommendations API.
- AC8 Given thêm giỏ thành công When Then cart drawer mở (TE-5) hoặc chuyển cart page theo setting.

- AC9 (Editions #14) Given variant.requires_shipping = false (sản phẩm số, bán quyền truy cập) When render Then ẩn pickup availability và thông báo vận chuyển; sản phẩm 1 variant không hiện bộ chọn option.
- AC10 (Editions #16) Given market có giá đã gồm thuế/phí (cart.taxes_included, cart.duties_included) When render giá Then hiện ghi chú tương ứng qua locale, theo từng market.
- AC11 (Editions #28) Given trang sản phẩm When render Then có structured data Product (JSON-LD: name, image, offers theo variant, availability, price, priceCurrency, brand).
- AC12 (Editions #5, BE) Given trang sản phẩm load hoặc đổi variant When Then dispatch event chuẩn `shopify:product:view` / variant theo tài liệu Standard storefront actions; override action show variant để UI đổi đúng variant.
Mã R: R4 rich media, pickup, installments, recommendations, selling plans, variant images; R7 product page

### TE-5 — Cart drawer và cart page
Phía: BE+FE · Ước lượng sơ bộ: 10 point (techlead chốt)

Là khách, tôi muốn sửa giỏ không reload, thấy giảm giá, ghi chú đơn và ngưỡng freeship để checkout tự tin.

- AC1 Given thêm giỏ When thành công Then drawer mở, có line items (title, ảnh, options_with_values, unit_price, final_price, quantity, discount), tổng, nút checkout, accelerated checkout bật mặc định.
- AC2 Given đổi số lượng hoặc xoá When Then partial cart-drawer + cart-count refresh, tổng đúng, giữ focus, aria-busy khi tải; lỗi 422 (quá tồn) hiện thông báo từ API trong live region và số lượng về giá trị server.
- AC3 Given setting ngưỡng freeship When tổng < ngưỡng Then thanh tiến độ + text còn thiếu; ≥ ngưỡng Then thông báo đạt.
- AC4 Given giỏ rỗng When Then thông báo + nút tiếp tục mua; cart.taxes_included thông báo khi có.
- AC5 Given cart page (templates/cart.liquid) When render Then đủ như drawer + cart note textarea + selling plan hiện + mã giảm giá tự động hiện; không JS vẫn update/checkout được bằng form.
- AC6 Given setting cart type page When thêm giỏ Then chuyển cart page thay vì mở drawer.

- AC7 (Editions #4, #5, #18, BE) Given agent hoặc app gọi `Shopify.actions` (add to cart, update cart lines, openCart) When Then theme override: openCart mở cart drawer (không sang trang cart), cart drawer + cart-count refresh từ dữ liệu cart thật qua partial (không cache client), dispatch `shopify:cart:lines-update` sau mỗi thay đổi do theme gây ra.
Mã R: R4 discounts, selling plans, accelerated checkout; R7 cart page

### TE-6 — Trang collection: lọc, sắp xếp, phân trang
Phía: FE+BE · Ước lượng sơ bộ: 10 point (techlead chốt)

Là khách, tôi muốn lọc theo tình trạng, giá, loại, hãng, option và sắp xếp để tìm nhanh trong collection.

- AC1 Given collection When render Then title, description, image (focal), lưới 2/3/4 cột theo setting, mỗi card như TE-3; paginate 24; thông báo khi rỗng.
- AC2 Given collection.filters When render Then faceted filter: availability, price range, product type, vendor, variant options (swatch nếu có); áp dụng cập nhật URL + partial collection-products/collection-filters không reload; không JS vẫn submit form được.
- AC3 Given sort_options When chọn Then URL sort_by cập nhật, danh sách refresh; sort mặc định là sort của collection trong admin (collection.default_sort_by), không có theme setting (PO 06/11, ES1-T106).
- AC4 Given mobile 360 When Then filter trong drawer, nút Lọc có badge số filter đang áp; keyboard đóng/mở.
- AC5 Given list-collections When render Then title + collection.featured_image, phân trang.

Mã R: R4 faceted search filtering; R7 collection, collection list

### TE-7 — Block nội dung: testimonials, FAQ, image with text, multicolumn
Phía: FE · Ước lượng sơ bộ: 8 point (techlead chốt)

Là merchant, tôi muốn 4 block nội dung để kể chuyện thương hiệu đúng bố cục Figma.

- AC1 Given testimonials có 1–6 mục When render Then carousel ở 360, lưới ở 1280; mỗi mục quote, tên, sao (0–5), ảnh tuỳ chọn.
- AC2 Given FAQ có 1–10 mục When render Then disclosure dùng được bằng bàn phím (Enter/Space mở), trình đọc màn hình đọc được trạng thái mở/đóng (details/summary, không JS — PO 06/11, ES1-T115), một hoặc nhiều mở theo setting.
- AC3 Given image with text When render Then ảnh trái/phải theo setting, ở 360 ảnh trên; heading, richtext, nút.
- AC4 Given multicolumn 2–4 cột When render Then icon/ảnh, heading, text, link mỗi cột; 360 xếp 1 cột.
- AC5 (CTO 06/11 11:14) Given mọi block When merchant chưa nhập nội dung Then hiện nội dung Figma theo bảng nội dung (AC-H5), không Lorem Ipsum; block Custom Liquid với setting type liquid vẫn có trong theme, không gọi trong `templates/index.liquid` (CR-5).
- AC-H24 (TC-H24, hàng 12) Given 4 card, viewport 1920 When render Then 4 card rộng 456px, card 4 tràn như Figma, cuộn bằng chuột và bàn phím tới hết card 4; khác biệt theo cỡ màn do Designer ghi (CR-8).
- AC-H25 (TC-H25, hàng 12) Given mặc định When render Then 4 review đúng 1:885 (card 2 là 4 sao), Verified tắt, ngoại lệ E9 có trong sổ.

Mã R: R3 consistency; R5 Custom Liquid; R12 a11y; R14 settings

### TE-8 — Tìm kiếm predictive và trang kết quả
Phía: BE+FE · Ước lượng sơ bộ: 8 point (techlead chốt)

Là khách, tôi muốn gõ và thấy gợi ý sản phẩm/collection/trang, rồi trang kết quả có lọc, để tìm nhanh.

- AC1 Given gõ ≥ 2 ký tự When 300ms Then gợi ý product (ảnh, tên, giá), collection, page, article từ predictive_search_url; ↑↓ Enter Esc; role listbox; mobile full màn.
- AC2 Given trang search When render Then kết quả theo object_type (product, article, page) phân nhóm, phân trang, filter như collection, thông báo khi 0 kết quả.
- AC3 Given không JS When submit Then trang search hoạt động đầy đủ.

Mã R: R4 search + predictive; R7 search page

### TE-9 — Preset mặc định, trang phụ và nội dung demo
Phía: FE · Ước lượng sơ bộ: 5 point (techlead chốt)

Là merchant, tôi muốn cài theme là có trang chủ hoàn chỉnh và các trang phụ đúng chuẩn để không bắt đầu từ trống.

- AC1 (CTO 06/11 11:14) Given theme mới cài When mở `/` Then thứ tự block theo AC-H1, copy và số liệu mặc định theo AC-H5, không Lorem Ipsum, không resource default trỏ tới thứ không tồn tại.
- AC2 Given 404 When Then thông báo rõ + search + link home; password Then logo/shop.name, password_message, form; page.contact Then form name/email/message có validation và thông báo; gift_card Then QR ≥ 120px, mã, Apple Wallet, logo.
- AC3 Given blog/article When Then title, image, excerpt_or_content, published_at, comments phân trang, form comment hoạt động.
- AC4 Given store hoa-qua-nhap-khau (efitco-ai-dev) When kiểm Then có dữ liệu Figma theo `drafts/ba/ES1-T173/home-content.md` mục 3: 24 sản phẩm, 12 collection handle `figma-*` cho hàng 3, 4b, 5, tag quiz, metafield rating và spec, discount tự động 10%, 15%, 5 bài blog, menu, tên shop Efitco; handle và dữ liệu trong `tests/e2e/store-data.json` không đổi; ảnh demo chỉ dùng trên store dev, quyền dùng ghi ở ES1-T174.

- AC5 (Editions #25) Given shop.policies When render footer/trang phụ Then link chính sách lấy từ shop.policies, không nhập tay URL.
- AC6 (Editions #27) Given chưa chọn logo/màu trong theme When render Then dùng shop.brand (logo, màu chính) làm mặc định nếu có.
Mã R: R7 404/password/page/blog/article/gift card; R14 default; R18 preset cùng tên theme

### TE-10 — Chuẩn chất lượng và sẵn sàng Canvas
Phía: FE+BE+QA · Ước lượng sơ bộ: 8 point (techlead chốt)

Là CTO, tôi muốn theme đạt ngưỡng chất lượng đo được và chạy đúng trong Canvas trước khi lên store thật.

- AC1 Given home/product/collection với dữ liệu benchmark When chạy lhci Then performance ≥ 96 desktop, ≥ 90 mobile; accessibility ≥ 98; CI chặn merge khi dưới ngưỡng.
- AC2 Given toàn bộ repo When theme check Then 0 lỗi, .theme-check.yml không override; không console error trên 8 trang; không Sass, không minified, không robots.txt.liquid.
- AC3 Given checklist Theme Store nội bộ When chạy Then nhóm bắt buộc (R4, R6–R17) pass 100%; nhóm tham khảo ghi N/A. R8 với nội dung mẫu (CTO 06/11 11:14, 11:15): copy, số liệu, review, bậc giảm mặc định tính đạt khi có đủ AC-H33 và ghi chú giảm giá ở AC-H18, H19; khi nộp Theme Store cần thêm demo store và ghi là nội dung mẫu.
- AC4 Given zip upload lên yum-dev (store người, đã có Canvas) When checklist Canvas Then 5 bước pass; 10 yêu cầu Sidekick mẫu cho ra theme check 0 lỗi và cấu trúc không đổi.
- AC5 Given tài liệu merchant When kiểm Then 16/16 block có docs/merchant, có hướng dẫn nâng cấp theme trong Canvas.

- AC6 (Editions #6, #17, #30, #40, QA) Given Chrome có WebMCP và inspector của `shopify theme dev` When gọi add_to_cart, update_cart_lines, show_variant Then UI theme (drawer, cart-count, variant) cập nhật đúng, 0 console error; nút dynamic checkout không vỡ layout với Apple Pay QR trên Chrome/Edge/Firefox; widget Shopify Inbox không che sticky add-to-cart, back-to-top, cart drawer ở 360 và 1280; header/account không dùng customer.has_account làm điều kiện hiển thị.
- AC-H30 (TC-H30) Given `/` hoặc URL đại diện có đủ 16 block và ảnh When chạy lhci desktop và mobile Then performance ≥ 96 và ≥ 90, accessibility ≥ 98; CI chặn merge khi dưới ngưỡng.
- AC-H31 (TC-H31) Given `/` đủ 16 block When tải xong, rồi cuộn hết trang Then JS tải sẵn ≤ 40 960 B, tổng sau cuộn ≤ 65 536 B; vượt thì chặn merge. Tính cả tabs và block mới.
- AC-H32 (TC-H32) Given spec của story P0 trên store dev đủ dữ liệu When chạy E2E Then 0 test skip do 429 hoặc thiếu dữ liệu.
- AC-H33 (TC-H33) Given tài liệu merchant When kiểm Then có mục bắt buộc trước publish: thay nội dung mẫu, tạo discount thật khớp bậc giảm, gắn tag quiz, chỉ bật Verified khi đã xác thực; mỗi block có dòng info nhắc nội dung mẫu.
- AC-H34 (TC-H34) Given zip giao bằng `scripts/theme-zip.sh` When liệt kê file Then 0 file `templates/index.te*` (grep hiện chưa thấy loại trừ).

Mã R: R6 Lighthouse; R8 nhất quán; R9 trình duyệt; R10 assets; R12 a11y; Canvas 5 bước

### TE-11 — Block product finder quiz
Phía: FE1 markup/CSS + BE1 JS · Ước lượng sơ bộ: 8 point (techlead chốt) · Figma 1:506

Là khách mua, tôi muốn trả lời 3 câu hỏi để nhận tối đa 4 sản phẩm khớp tag đã chọn, không cần đăng ký.

- AC1 Given block có 3 bước cấu hình bằng block con `quiz-step` (câu hỏi, 2–4 lựa chọn, mỗi lựa chọn gắn 1 tag sản phẩm) When render Then hiện bước 1, thanh tiến độ "Step 1 of 3"; không JS thì hiện cả 3 bước dạng form, nút Submit tới trang search với tag đã chọn.
- AC2 Given chọn lựa chọn ở bước n When bấm Then sang bước n+1, tiến độ cập nhật, nút Back quay lại giữ lựa chọn cũ; bàn phím Tab/Enter/Space chọn được, focus chuyển vào tiêu đề bước mới.
- AC3 Given hoàn tất bước 3 When có ≥ 1 sản phẩm khớp tag Then hiện tối đa 4 product card (snippet product-card) lấy qua `{% partial %}`; 0 sản phẩm Then hiện text rỗng cấu hình được + link tới collection mặc định.
- AC4 (ES1-T136 #6) Given màn hình < 48rem When render Then body map ẩn, chỉ còn danh sách lựa chọn, touch target ≥ 44px.
- AC-H15 (TC-H15, hàng 6) Given theme mới cài When mở `/` Then quiz theo Q1 (mục 3); copy bước 1 đúng 1:506 gồm "Our most-loved feature", "20 seconds".
- AC-H16 (TC-H16, hàng 6) Given store chưa gắn tag khớp quiz When hoàn tất 3 bước Then hiện text rỗng và link collection, 0 console error; tài liệu merchant nêu cần gắn tag.
- AC-H17 (TC-H17, hàng 6) Given CR-10 được duyệt, từ 48rem When bấm vùng trên body map Then chọn đúng lựa chọn Upper body, Core hoặc Lower body như bấm danh sách, dùng được bằng bàn phím.

Mã R: R12 a11y; R8 không app-like (logic gọn trong theme, không gọi dịch vụ ngoài)

### TE-12 — Block bundle builder và shop the look
Phía: FE1 markup/CSS + BE1 JS · Ước lượng sơ bộ: 13 point (techlead chốt) · Figma 1:636, 1:560

Là khách mua, tôi muốn chọn nhiều sản phẩm và thêm vào giỏ một lần, thấy tổng tiền và mức giảm theo số lượng.

- AC1 (CTO 06/11 11:15) Given bundle builder nhận 1 collection (tối đa 9 sản phẩm) và bảng bậc giảm cấu hình bằng setting, mặc định 2 món 10%, 3 món 15% When chọn/bỏ sản phẩm Then panel "Your Bundle" cập nhật danh sách, tạm tính, mức giảm, tổng, thanh tiến độ theo AC-H18; luôn có ghi chú giảm giá chỉ áp dụng khi có discount tự động.
- AC2 Given giảm theo bậc When hiển thị Then chỉ là hiển thị — giảm thật áp ở checkout bằng Shopify automatic discount do merchant tạo; tài liệu merchant ghi rõ; không tự tính giá trong cart.
- AC3 Given bấm "Add Bundle To Cart" / "Add Setup To Cart" When thành công Then gọi `/cart/add.js` với `items[]` một lần, cart drawer (TE-5) mở và refresh qua partial; lỗi 422 (hết hàng) Then báo tên sản phẩm lỗi, không thêm phần còn lại.
- AC4 Given sản phẩm hết hàng When render Then thẻ disabled, có nhãn Sold out, không chọn được.
- AC5 (CR-6) Given shop the look (1:560) When render Then ảnh + tối đa 6 product row (block con), tổng tiền cộng giá variant mặc định, dòng giảm và hotspot theo AC-H19, AC-H20, dùng chung JS add nhiều sản phẩm với bundle builder.
- AC-H18 (TC-H18, hàng 9) Given mặc định chưa đổi và block có sản phẩm When chọn 1, 2, 3 món Then lần lượt: "còn 1 món để đạt 10%"; dòng giảm 10%; dòng giảm 15% và trạng thái đạt bậc cao nhất; luôn có ghi chú giảm giá chỉ áp dụng khi có discount tự động.
- AC-H19 (TC-H19, hàng 7) Given CR-6 được duyệt When render shop the look Then có thẻ "Fits", dòng giảm và ghi chú cùng quy tắc AC-H18, tổng trừ đúng số tiền giảm tính từ giá thật, row hết hàng không tính vào tổng. KHÔNG CHẮC: Figma 4 món ghi 10%, bậc AC-H18 ra 15%; mặc định theo Figma 10%, chờ ES1-T199 #2.
- AC-H20 (TC-H20, hàng 7) Given CR-6 được duyệt, 4 hotspot When hover, focus hoặc bấm hotspot Then row tương ứng có viền accent; bấm row thì hotspot tương ứng ở trạng thái chọn; dưới 64rem theo mặc định Designer ghi mới.

Mã R: R8 giảm giá thật do discount tự động, có ghi chú; R12 a11y

### TE-13 — Block featured product có countdown và video demo carousel
Phía: FE1 markup/CSS + BE1 JS · Ước lượng sơ bộ: 8 point (techlead chốt) · Figma 1:759, 1:817

Là merchant, tôi muốn làm nổi bật 1 sản phẩm đang khuyến mãi có thời hạn và cho khách xem video ngắn sản phẩm đang dùng.

- AC1 Given featured product chọn 1 sản phẩm + setting ngày giờ kết thúc khuyến mãi When còn hạn và sản phẩm có giá gạch (compare at price > price) và còn hàng Then hiện countdown ngày/giờ/phút/giây theo giờ store (PO 06/11, ES1-T155 #2); hết hạn hoặc không nhập ngày Then ẩn hẳn countdown (không reset, không đếm giả — R8).
- AC2 Given featured product When render Then gallery, giá/giá gạch/% giảm, rating (metafield reviews nếu có, không có thì ẩn), bảng spec 4 dòng từ metafield, Add to cart + View detail; dùng chung logic variant TE-4.
- AC3 Given video carousel nhận tối đa 8 block con `video-card` (Shopify video hoặc URL YouTube/Vimeo + 1 sản phẩm) When render Then video lazy (chỉ tải khi vào viewport), poster có sẵn, bấm mới chạy, không tự chạy kể cả tắt tiếng (ES1-T155 #4); 3 ô số liệu là text setting, mặc định trống và không hiện vì 1:827 ẩn trong Figma (Q5, mục 3).
- AC4 Given video lỗi tải When render Then hiện poster + link sản phẩm, không vỡ layout.
- AC5 Given Lighthouse trang chủ When có 2 block này Then vẫn đạt ngưỡng TE-10 (≥ 96 desktop, ≥ 90 mobile).
- AC-H21 (TC-H21, hàng 11) Given mặc định When render 1920 Then 6 thẻ 264 × 554, đúng copy 1:817, không có 3 ô số liệu, link, nhãn (theo Q5); poster hiển thị, bấm mới chạy.
- AC-H22 (TC-H22, hàng 10) Given featured product trên `/` có JS When đổi variant Then giá, nút, ảnh cập nhật không reload; Add to cart mở drawer, số giỏ tăng đúng.
- AC-H23 (TC-H23, hàng 10) Given store dev, ngày kết thúc dưới 24 giờ When render `/` Then ô ngày ẩn, 3 ô giờ phút giây giảm mỗi giây, F5 không reset; quá hạn thì ẩn countdown.

Mã R: R8 không fake urgency; R6 Lighthouse; R12 a11y

### TE-14 — Sẵn sàng cho Sidekick, Canvas và agent (Editions Fall '26)
Phía: FE (docs + Liquid) · Ước lượng sơ bộ: 5 point (techlead chốt) · Nguồn: Báo cáo Editions Fall '26 checklist mục 1, 2, 10

Là CTO, tôi muốn theme có hướng dẫn máy đọc được và quy ước sẵn cho RTL để Sidekick trong Canvas và agent sửa theme không phá kiến trúc.

- AC1 Given gốc theme When kiểm Then có `AGENTS.md` (viết lại theo outline Shopify cho base theme Canvas: non-negotiables, composition model, block/snippet contracts, styling và tokens, JavaScript, translations, decision guide; mỗi quy tắc có lý do) ≤ 50 KB, đúng tên viết hoa; liệt kê đủ block hiện có.
- AC2 Given gốc theme When kiểm Then có `DESIGN.md` ghi ý đồ thiết kế Efitco: token (màu, font, khoảng cách, bo góc) lấy từ docs/tokens.json, nhịp trang, quy tắc ảnh, giọng chữ CTA, các quyết định CTO (accent #C8400E AA, xám #6B6B6B) ≤ 50 KB.
- AC3 Given 10 yêu cầu Sidekick mẫu của checklist Canvas When chạy trên yum-dev Then Sidekick đọc 2 file và kết quả qua theme check 0 lỗi, giữ cấu trúc block-first.
- AC4 Given mọi CSS trong assets/ When kiểm Then dùng logical properties (margin-inline, padding-inline-start, inset-inline-*, text-align: start/end) thay left/right, để bật RTL sau không phải viết lại; icon mũi tên/slider đảo bằng `:dir(rtl)`.

Mã R: Canvas 5 bước; R8 nhất quán; Editions Fall '26 #1, #2, #10

### TE-15 — Block collection list và shop by level
Phía: FE + BE (next/back) · Ước lượng: 10 point theo plan ES1-T169 (FE1 4, BE1 3, FE2 3) · Figma 1:395, 1:464 · CR-2

Là khách, tôi muốn thấy 5 danh mục và 3 trình độ tập ngay dưới hero để vào đúng collection từ trang chủ.

- AC-H8 (TC-H8, hàng 3) Given block có 5 collection When render 1920 Then 5 card 336 × 270 đúng tên; bấm next/back cuộn 1 card; card link tới đúng collection.
- AC-H9 (TC-H9, hàng 3) Given dưới 5 collection hoặc 0 collection When render Then chỉ hiện số card có, ẩn next/back khi không còn gì để cuộn; 0 collection thì storefront không render.
- AC-H10 (TC-H10, hàng 4b) Given 3 card trình độ gắn collection When render Then badge số sản phẩm bằng `products_count` của collection, số ít nhiều đúng locale; store dev có 24 sản phẩm để khớp "24 Products". KHÔNG CHẮC: Figma chỉ card Beginner có node số sản phẩm, xem ES1-T198 #2.

Mã R: R3, R14 (AC-H1, H2 áp chung); R12 a11y; R7 collection

### TE-16 — Block blog posts
Phía: FE · Ước lượng: 4 point theo plan ES1-T169 · Figma 1:1022 · CR-4

Là khách, tôi muốn thấy 5 bài blog trên trang chủ kèm nhãn và thời gian đọc để chọn bài từ trang chủ.

- AC-H26 (TC-H26, hàng 14) Given blog có từ 5 bài When render 1920 Then 5 card 300 × 448, ảnh, nhãn, tiêu đề, thời gian đọc; card link tới đúng bài; từ 5 card tràn thì cuộn được.
- AC-H27 (TC-H27, hàng 14) Given blog dưới 5 bài hoặc không có nguồn thời gian đọc When render Then hiện số bài có, ẩn dòng thời gian đọc; 0 bài thì storefront không render.

Thời gian đọc: tính trong Liquid từ số từ của bài, 200 từ/phút (D8 của ES1-T169).
Mã R: R3, R14 (AC-H1, H2 áp chung); R12 a11y; R7 blog

### TE-17 — Trang chủ giống Figma: nội dung mặc định, dữ liệu store dev, cổng đo
Phía: FE + QA + DevOps + Designer · Ước lượng: 25 point dev theo plan ES1-T169 (FE0 3, FE1a 6, FE1b 5, FE1c 6, FE2 5) · Figma 1:359 · CR-1

Là CTO, tôi muốn `/` trên store dev giống Figma và merchant mới cài thấy sẵn copy, số liệu Figma để đo được yêu cầu "giống 100% Figma" (CTO 06/11 11:12, 11:14).

- AC-H1 (TC-H1) Given `/` trên store dev đủ dữ liệu When đọc thứ tự block trong DOM Then đúng 16 hàng inventory theo y, 0 block ngoài danh sách.
- AC-H2 (TC-H2) Given bảng nội dung lấy từ node hiện trong Figma When so từng chuỗi với text block đã bỏ khoảng trắng thừa, so sau `text-transform` Then khớp 100%, trừ giá trị động đã che và ngoại lệ đã ký.
- AC-H3 (TC-H3) Given viewport 1920, cùng scale với ảnh export, vùng động đã che When so từng block với ảnh node Then kích thước block lệch tối đa 2 px, số pixel khác tối đa 1%, sổ chênh lệch 0 mục mở.
- AC-H4 (TC-H4) Given từng giá trị font, cỡ chữ, màu, bo góc, khoảng cách của node When đọc computed style Then bằng giá trị Figma, trừ ngoại lệ đã ký.
- AC-H5 (TC-H5) Given theme mới cài, chưa mở editor When mở `/` Then copy và số liệu Figma của các hàng đã có setting chữ hiển thị, gồm "360+" ở hàng 15 và "Trusted by 10,000+ athletes" ở hàng 2; 0 chữ "Add a", "Customer name" hướng dẫn.
- AC-H6 (TC-H6, tay trên editor) Given merchant sửa 1 setting chữ trong editor When lưu và mở `/` Then giá trị merchant hiển thị thay mặc định, ở cả block lặp (faq-item, testimonial-item, quiz-step, 2 image-with-text).
- AC-H7 (TC-H7) Given từng control tương tác trên `/` When focus bằng bàn phím và hover Then có focus ring theo DESIGN.md, đổi trạng thái hover nếu control có quy định; axe 0 serious, 0 console error.
- AC-H35 (TC-H35) Given `/` ở 360 và 768 When đo từng block Then không tràn ngang, control ≥ 44px, không chồng chữ, theo ES1-T116 #5, #6, ES1-T135 #4, ES1-T145 #1, #6, ES1-T154 #2, #8; TE-15, TE-16, CR-3 có mặc định Designer ghi trước khi làm.

Ngưỡng 2 px, 1% chờ hiệu chuẩn ở cổng G1; chỉ CTO nới được. Chỉ so node có bản thân và mọi node cha không `visible:false`; ảnh export thắng snapshot khi lệch.
Mã R: R3, R14 (AC-H1, H2); R8 (AC-H5, xem TE-10 AC3); R12 (AC-H7, H35)

## 3. Quyết định đã chốt (CTO 27/10/2026, trước là câu hỏi mở)
- Hết hàng: sản phẩm vẫn hiện trong featured collection, bundle, shop the look, collection, kèm badge "Sold out"; nút thêm vào giỏ disabled. Áp cho TE-3, TE-4, TE-6, TE-12.
- Cart: mặc định drawer (TE-5); setting `cart_type` cho đổi sang page.
- Collection mobile: mặc định 2 cột (TE-6); setting cho chọn 1 hoặc 2.
- Tên theme: Efitco (CTO 22/10).

Chốt CTO 06/11/2026 (ES1-T167, T168, T169):
- Trang chủ giống 100% Figma trên store dev là yêu cầu bắt buộc. Copy, số liệu, review mẫu, tên khách, sao, bậc giảm bundle 10%, 15% kèm ghi chú nằm trong mặc định của theme; Verified tắt. Thay ES1-T115 #2, T136 #8, T146 #2, T155 #8.
- Merchant mới cài không có sẵn ảnh, video, countdown. Cổng PR đo qua `?view=figma`, nghiệm thu trên `/`.
- Duyệt 10 CR của ES1-T167. Ngoại lệ so với Figma: E1–E9 của ES1-T167 mục 2.4, thêm E10 (số mẫu 1:560), E11 ("Add to cart" theo AGENTS.md), mở rộng E7 (bậc giảm 5% của 1:636).
- Mặc định Q1–Q6 của ES1-T168: Q1 bundle dùng collection `all`, quiz hiện đủ và kết quả rỗng khi chưa có tag, featured product và shop the look ẩn tới khi chọn sản phẩm. Q2 rating và 4 giá trị spec hàng 10 lấy từ metafield, nhãn spec là mặc định. Q3 giữ nguyên văn copy Figma kể cả lỗi, Designer sửa Figma thì đổi theo. Q4 wordmark, copyright dùng `shop.name`. Q5 hàng 11 không hiện 3 ô số liệu. Q6 thêm E10, E11, mở rộng E7.
- D7 của ES1-T169: mặc định `products_to_show` 4; vùng bấm swatch 44px.
