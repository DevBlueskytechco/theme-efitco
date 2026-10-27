# SRS — theme-efitco · bản 0.1 · BA · 22/10/2026

Nguồn: charter, PRD, Figma Efitco T10 (home), Skeleton AGENTS.md, Theme Store requirements (chuẩn nội bộ, mã R), Canvas requirements (22/10/2026).

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
- AC5 Given token docs/tokens.json When render Then font heading Sofia Sans Condensed qua font_picker, body Inter; chữ phụ trên nền sáng dùng `--color-muted-light` #6B6B6B (≥ 4.5:1), #999999 chỉ trên nền tối.
- AC5 Given shop bán ≥ 2 nước hoặc ngôn ngữ When render footer Then có country selector và language selector theo UX guideline Shopify; 1 nước/ngôn ngữ Then không hiện.
- AC6 Given footer When render Then có newsletter form (customer form, thông báo thành công/lỗi), menu footer default footer, social icons từ settings, payment icons từ shop.enabled_payment_types đủ màu.
- AC7 Given mọi trang When kiểm Then html lang = request.locale.iso_code, meta-tags snippet có title/description/canonical/og/twitter, page_image.

Mã R: R4 menu đa cấp, newsletter, country/language, Follow on Shop, shopify-account; R7 layout; R11 SEO; R13 social; R14–R16 settings/font/màu

### TE-2 — Block hero và rich text
Phía: FE · Ước lượng sơ bộ: 5 point (techlead chốt)

Là merchant, tôi muốn block hero (ảnh hoặc video, 2 nút, 3 bố cục) và block rich text để mở đầu trang chủ theo Figma.

- AC1 Given hero có ảnh When render Then ảnh có focal point từ image_picker, srcset, eager load ở vị trí đầu trang; có video Then dùng video setting, autoplay muted loop, có poster.
- AC2 Given bố cục chọn trái/giữa/phải When render Then nội dung căn đúng ở 1280 và 768; ở 360 luôn căn giữa theo Figma.
- AC3 Given 0, 1 hoặc 2 nút có label When render Then chỉ nút có label hiện; nút có href từ url setting; nút thứ hai kiểu secondary.
- AC4 Given chưa chọn ảnh/video When trong editor Then placeholder lifestyle image; ngoài editor Then nền màu từ setting.
- AC5 Given rich text When render Then heading, body richtext, nút tuỳ chọn, độ rộng tối đa setting; heading level chọn h1/h2.

Mã R: R3 layout; R14 settings; R17 ảnh responsive

### TE-3 — Block featured collection và product card
Phía: FE+BE · Ước lượng sơ bộ: 8 point (techlead chốt)

Là merchant, tôi muốn đặt block hiện sản phẩm của một collection trên trang chủ để khách thấy hàng nổi bật mà không vào trang collection.

- AC1 Given chọn collection When render Then hiện tối đa N sản phẩm (4–12, mặc định 8), lưới 2 cột ở 360, 3–5 cột ở 1280 theo setting.
- AC2 Given sản phẩm có ≥ 2 màu có swatch When render card Then hiện swatch (swatch.color hoặc swatch.image); chọn swatch đổi ảnh card và link biến thể, không reload; keyboard chọn được.
- AC3 Given compare_at_price > price When render Then giá gạch + badge sale với % giảm làm tròn, tính đúng với giá nhỏ.
- AC4 Given product.price_varies When render Then hiện khoảng giá min–max; có unit_price Then hiện unit price.
- AC5 Given collection rỗng hoặc chưa chọn When trong editor Then placeholder hướng dẫn; ngoài editor Then không render block.
- AC6 Given keyboard When tab qua card Then focus thấy được, ảnh có alt từ sản phẩm; touch target ≥ 24px.
- AC7 Given bật nút Xem tất cả When render Then nút link tới collection.url, vị trí theo setting.

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

Mã R: R4 discounts, selling plans, accelerated checkout; R7 cart page

### TE-6 — Trang collection: lọc, sắp xếp, phân trang
Phía: FE+BE · Ước lượng sơ bộ: 10 point (techlead chốt)

Là khách, tôi muốn lọc theo tình trạng, giá, loại, hãng, option và sắp xếp để tìm nhanh trong collection.

- AC1 Given collection When render Then title, description, image (focal), lưới 2/3/4 cột theo setting, mỗi card như TE-3; paginate 24; thông báo khi rỗng.
- AC2 Given collection.filters When render Then faceted filter: availability, price range, product type, vendor, variant options (swatch nếu có); áp dụng cập nhật URL + partial collection-products/collection-filters không reload; không JS vẫn submit form được.
- AC3 Given sort_options When chọn Then URL sort_by cập nhật, danh sách refresh; sort mặc định theo setting.
- AC4 Given mobile 360 When Then filter trong drawer, nút Lọc có badge số filter đang áp; keyboard đóng/mở.
- AC5 Given list-collections When render Then title + collection.featured_image, phân trang.

Mã R: R4 faceted search filtering; R7 collection, collection list

### TE-7 — Block nội dung: testimonials, FAQ, image with text, multicolumn
Phía: FE · Ước lượng sơ bộ: 8 point (techlead chốt)

Là merchant, tôi muốn 4 block nội dung để kể chuyện thương hiệu đúng bố cục Figma.

- AC1 Given testimonials có 1–6 mục When render Then carousel ở 360, lưới ở 1280; mỗi mục quote, tên, sao (0–5), ảnh tuỳ chọn.
- AC2 Given FAQ có 1–10 mục When render Then accordion: button có aria-expanded/aria-controls, Enter/Space mở, một hoặc nhiều mở theo setting.
- AC3 Given image with text When render Then ảnh trái/phải theo setting, ở 360 ảnh trên; heading, richtext, nút.
- AC4 Given multicolumn 2–4 cột When render Then icon/ảnh, heading, text, link mỗi cột; 360 xếp 1 cột.
- AC5 Given mọi block When chưa có nội dung Then default text gợi cách dùng, không Lorem Ipsum; có Custom Liquid block với setting type liquid.

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

- AC1 Given settings_data.json When cài mới Then trang chủ 16 block đúng thứ tự docs/figma-inventory.md, text mặc định có nghĩa (không Lorem Ipsum), không resource default trỏ tới thứ không tồn tại.
- AC2 Given 404 When Then thông báo rõ + search + link home; password Then logo/shop.name, password_message, form; page.contact Then form name/email/message có validation và thông báo; gift_card Then QR ≥ 120px, mã, Apple Wallet, logo.
- AC3 Given blog/article When Then title, image, excerpt_or_content, published_at, comments phân trang, form comment hoạt động.
- AC4 Given store hoa-qua-nhap-khau (efitco-ai-dev) When Then có dữ liệu demo: 24 sản phẩm (có sale, hết hàng, nhiều biến thể, gift card), 4 collection, 3 bài blog, ảnh tự do bản quyền.

Mã R: R7 404/password/page/blog/article/gift card; R14 default; R18 preset cùng tên theme

### TE-10 — Chuẩn chất lượng và sẵn sàng Canvas
Phía: FE+BE+QA · Ước lượng sơ bộ: 8 point (techlead chốt)

Là CTO, tôi muốn theme đạt ngưỡng chất lượng đo được và chạy đúng trong Canvas trước khi lên store thật.

- AC1 Given home/product/collection với dữ liệu benchmark When chạy lhci Then performance ≥ 96 desktop, ≥ 90 mobile; accessibility ≥ 98; CI chặn merge khi dưới ngưỡng.
- AC2 Given toàn bộ repo When theme check Then 0 lỗi, .theme-check.yml không override; không console error trên 8 trang; không Sass, không minified, không robots.txt.liquid.
- AC3 Given checklist Theme Store nội bộ When chạy Then nhóm bắt buộc (R4, R6–R17) pass 100%; nhóm tham khảo ghi N/A.
- AC4 Given zip upload lên yum-dev (store người, đã có Canvas) When checklist Canvas Then 5 bước pass; 10 yêu cầu Sidekick mẫu cho ra theme check 0 lỗi và cấu trúc không đổi.
- AC5 Given tài liệu merchant When kiểm Then 16/16 block có docs/merchant, có hướng dẫn nâng cấp theme trong Canvas.

Mã R: R6 Lighthouse; R8 nhất quán; R9 trình duyệt; R10 assets; R12 a11y; Canvas 5 bước

### TE-11 — Block product finder quiz
Phía: FE1 markup/CSS + BE1 JS · Ước lượng sơ bộ: 8 point (techlead chốt) · Figma 1:506

Là khách mua, tôi muốn trả lời 3 câu hỏi để nhận tối đa 4 sản phẩm khớp tag đã chọn, không cần đăng ký.

- AC1 Given block có 3 bước cấu hình bằng block con `quiz-step` (câu hỏi, 2–4 lựa chọn, mỗi lựa chọn gắn 1 tag sản phẩm) When render Then hiện bước 1, thanh tiến độ "Step 1 of 3"; không JS thì hiện cả 3 bước dạng form, nút Submit tới trang search với tag đã chọn.
- AC2 Given chọn lựa chọn ở bước n When bấm Then sang bước n+1, tiến độ cập nhật, nút Back quay lại giữ lựa chọn cũ; bàn phím Tab/Enter/Space chọn được, focus chuyển vào tiêu đề bước mới.
- AC3 Given hoàn tất bước 3 When có ≥ 1 sản phẩm khớp tag Then hiện tối đa 4 product card (snippet product-card) lấy qua `{% partial %}`; 0 sản phẩm Then hiện text rỗng cấu hình được + link tới collection mặc định.
- AC4 Given mobile < 750px When render Then body map ẩn, chỉ còn danh sách lựa chọn, touch target ≥ 44px.

Mã R: R12 a11y; R8 không app-like (logic gọn trong theme, không gọi dịch vụ ngoài)

### TE-12 — Block bundle builder và shop the look
Phía: FE1 markup/CSS + BE1 JS · Ước lượng sơ bộ: 13 point (techlead chốt) · Figma 1:636, 1:560

Là khách mua, tôi muốn chọn nhiều sản phẩm và thêm vào giỏ một lần, thấy tổng tiền và mức giảm theo số lượng.

- AC1 Given bundle builder nhận 1 collection (tối đa 9 sản phẩm) và bảng bậc giảm (vd 2 món 10%, 3 món 15%) cấu hình bằng setting When chọn/bỏ sản phẩm Then panel "Your Bundle" cập nhật danh sách, tạm tính, mức giảm, tổng, thanh tiến độ "add N more to get X% off".
- AC2 Given giảm theo bậc When hiển thị Then chỉ là hiển thị — giảm thật áp ở checkout bằng Shopify automatic discount do merchant tạo; tài liệu merchant ghi rõ; không tự tính giá trong cart.
- AC3 Given bấm "Add Bundle To Cart" / "Add Setup To Cart" When thành công Then gọi `/cart/add.js` với `items[]` một lần, cart drawer (TE-5) mở và refresh qua partial; lỗi 422 (hết hàng) Then báo tên sản phẩm lỗi, không thêm phần còn lại.
- AC4 Given sản phẩm hết hàng When render Then thẻ disabled, có nhãn Sold out, không chọn được.
- AC5 Given shop the look (1:560) When render Then ảnh + tối đa 6 product row (block con), tổng tiền cộng giá variant mặc định, dùng chung JS add nhiều sản phẩm với bundle builder.

Mã R: R8 không fake giảm giá; R12 a11y

### TE-13 — Block featured product có countdown và video demo carousel
Phía: FE1 markup/CSS + BE1 JS · Ước lượng sơ bộ: 8 point (techlead chốt) · Figma 1:759, 1:817

Là merchant, tôi muốn làm nổi bật 1 sản phẩm đang khuyến mãi có thời hạn và cho khách xem video ngắn sản phẩm đang dùng.

- AC1 Given featured product chọn 1 sản phẩm + setting ngày giờ kết thúc khuyến mãi When còn hạn Then hiện countdown ngày/giờ/phút/giây theo giờ store; hết hạn hoặc không nhập ngày Then ẩn hẳn countdown (không reset, không đếm giả — R8).
- AC2 Given featured product When render Then gallery, giá/giá gạch/% giảm, rating (metafield reviews nếu có, không có thì ẩn), bảng spec 4 dòng từ metafield, Add to cart + View detail; dùng chung logic variant TE-4.
- AC3 Given video carousel nhận tối đa 8 block con `video-card` (Shopify video hoặc URL YouTube/Vimeo + 1 sản phẩm) When render Then video lazy (chỉ tải khi vào viewport), poster có sẵn, không autoplay có tiếng; 3 ô số liệu là text setting.
- AC4 Given video lỗi tải When render Then hiện poster + link sản phẩm, không vỡ layout.
- AC5 Given Lighthouse trang chủ When có 2 block này Then vẫn đạt ngưỡng TE-10 (≥ 96 desktop, ≥ 90 mobile).

Mã R: R8 không fake urgency; R6 Lighthouse; R12 a11y

## 3. Câu hỏi mở (KHÔNG CHẮC)
- SKU/variant: sản phẩm hết hàng ẩn khỏi featured collection hay hiện badge Sold out? Mặc định: hiện badge.
- Cart mặc định drawer hay page? Mặc định: drawer, setting đổi.
- Số cột collection mobile mặc định? Mặc định: 2.
- Tên theme chính thức.
