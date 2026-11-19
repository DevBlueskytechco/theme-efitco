# Shopify Theme Store requirements (đọc 11/11/2026 từ https://shopify.dev/docs/storefronts/themes/store/requirements, diễn giải)

## 1. Exclusivity
- Chỉ phân phối qua Theme Store. Không credit designer, không affiliate link trong file theme.

## 2. Uniqueness
- Khác căn bản các theme khác; art direction rõ cho header/nav, product card, media, cấu trúc trang. Skeleton là codebase duy nhất được dùng; không dựa trên Dawn/Horizon.

## 3. Design and UX (mọi điểm phải đạt)
- 3a: thiết kế có chủ đích, nhắm 1 ngành; ảnh/icon chất lượng cao, đồng bộ, không mờ/kéo giãn; bảng màu đơn giản, không làm giảm đọc.
- 3b: lưới rõ, khoảng cách nhất quán; phân cấp rõ; bố cục linh hoạt khi độ dài nội dung, số ảnh thay đổi, không khoảng trống lớn, không vỡ.
- 3c: typography nhất quán (1 cặp font); nút/link/form cùng style, size, màu, hành vi mọi nơi; settings rõ, ngôn ngữ merchant, nhóm hợp lý; theme editor merchant-first.
- 3d: điều hướng home → discovery → PDP → cart → checkout rõ; chọn option, thêm giỏ, sửa giỏ, tới checkout rõ và phản hồi ngay.
- 3e: demo store thật: sản phẩm, ảnh chuyên nghiệp, text gốc, không Lorem Ipsum/placeholder; mọi section hợp với ngành.

## 4. Features (bắt buộc)
- Sections Everywhere (OS 2.0, mục 5).
- Discounts: hiện giảm giá từng dòng và toàn đơn ở cart (bắt buộc Cart page), checkout, order.
- Accelerated checkout buttons: có ở Product page và Cart page. **Màu nút dynamic/accelerated có thương hiệu KHÔNG được sửa.** PDP bật mặc định (mục 7).
- Faceted search filtering: lọc collection và search theo availability, price, type, vendor, variant options.
- Gift cards: template gift_card.
- Image focal points: tôn trọng focal point (image_picker hoặc Files).
- page_image cho social sharing.
- Country selection (currency + country/region) và Language selection theo UX guidelines country/language selector của Shopify.
- Multi-level menus (dropdown nhiều cấp).
- Newsletter form.
- Pickup availability trên Product page (không cần thêm giỏ).
- Related product recommendations (section tự động trên PDP) và Complementary product recommendations.
- Rich product media: 3D, video, YouTube/Vimeo trong product template, featured product section, và form sản phẩm như quick view.
- Search template + predictive search.
- Selling plans: plan đã chọn hiện ở Cart page.
- Shop Pay Installments banner trên product page.
- Unit pricing: Collection, Product, Cart.
- Variant images.
- Follow on Shop: nút bằng filter login_button; **màu nút có thương hiệu KHÔNG được sửa.**
- Account component: <shopify-account> trong header, thấy được cả desktop và mobile.

## 5. Templates, sections, blocks
- Template: theme.liquid; 404, article, blog, cart, collection, index, list-collections, page, page.contact, password, product, search (.json); gift_card.liquid; settings_data, settings_schema.
- Mọi template hỗ trợ JSON sections (trừ customer accounts, gift card, checkout). Có section Custom Liquid (setting liquid) ở mọi template có section. Header/footer render trong section groups.
- Main product: block cho hầu hết phần tử (price, vendor, description…). App blocks (@app) ở main product và featured product. Block Custom Liquid ở chỗ app block hợp lý.
- Không nộp config/markets.json.

## 6. Lighthouse
- Performance trung bình ≥ 60, Accessibility trung bình ≥ 90 (product, collection, home; desktop + mobile), section có ảnh/nội dung thật.

## 7. Pages
- Layout: payment icons dùng shop.enabled_payment_types + payment_type_svg_tag/img_url, **full color**; <html lang> từ request.locale.iso_code; routes object; không sửa/parse content_for_header.
- Product: product.title (không cắt), variant.price, unit_price, compare-at, description, tên và giá trị option; mọi ảnh xem được, tỉ lệ khác không vỡ; ảnh variant khi chọn; cart.taxes_included; option tách selector riêng; quantity selector; Add to cart (disabled/thay khi hết); cập nhật giá, compare-at, sold-out theo variant; variant còn hàng đầu tiên mặc định; recommendations, rich media, accelerated checkout (bật mặc định), pickup, Shop Pay Installments; gift card gửi người nhận (form.email, form.name, form.message, send_on); swatch hiện màu hex/ảnh qua swatch.color, swatch.image.
- Collection: title (không cắt), description, image; lưới có title (không cắt, link), price, images, unit_price, ≥ 1 media; không vỡ với tỉ lệ ảnh khác nhau; Sale badge/compare_at_price_max; sắp xếp; thông báo rỗng; price_varies hiện khoảng giá; phân trang hoặc lazy load.
- List collections: title (không cắt); featured_image (fallback ảnh sản phẩm đầu); phân trang/lazy load.
- Cart: dòng hàng title, unit_price, image, final_price, quantity, options_with_values; cart.total_price; taxes_included; nút checkout submit form; cập nhật số lượng làm mới mọi dòng; đổi số lượng từng dòng; thông báo rỗng; cart notes, selling plans, automatic discount codes, accelerated checkout (bật mặc định).
- Page: title, content; template contact.
- Blog: blog.title; article.title (không cắt, link), article.image, article.excerpt_or_content; phân trang/lazy.
- Article: title (không cắt), comments, published_at; comments phân trang; workflow comment chạy không cần duyệt, đủ thông báo thành công/lỗi.
- Search: thông báo không kết quả; nhiều loại (products, blogs, pages) dùng object_type; phân trang/lazy.
- 404: thông báo rõ, có search hoặc link home.
- Gift card: Apple Wallet; mã; QR ≥ 120×120; logo hoặc shop.name.
- Password: logo hoặc shop.name, shop.password_message, ô nhập mật khẩu.

## 8. Consistency and functionality
- RTE (h1–h6, blockquote, ul, ol) nhất quán mọi template, khớp mô tả blog/product/collection.
- Script host trên Shopify (trừ thư viện bên thứ ba được duyệt). Không JS can thiệp tính năng Shopify trong editor/admin.
- Link tới domain Shopify có rel="nofollow". Asset URL protocol-relative.
- Không tính năng phụ thuộc app; không tính năng kiểu app cần API (wishlist, đặt lịch, mã giảm giá cấp giỏ, Instagram feed).
- **Không claim gây hiểu lầm: không urgency/scarcity giả (countdown giả, số tồn giả, số người xem).**

## 9. Browser: Safari 2 bản mới nhất, Chrome/Firefox 3, Edge 2; mobile responsive, iOS Safari 2, Chrome mobile 3, Samsung Internet 2; webview Instagram/Facebook/Pinterest.
## 10. Assets: không Sass; không CSS/JS minified (trừ ES6, thư viện bên thứ ba).
## 11. SEO: snippet meta (title, description, canonical); structured data sản phẩm; không robots.txt.liquid.

## 12. Accessibility
- Bàn phím mọi phần (kể cả dropdown nav); focus thấy rõ; mọi ảnh có alt; input có id duy nhất, label for; HTML hợp lệ; tương phản 4.5:1 chữ thân, 3:1 chữ > 18pt và thành phần phi chữ (viền, icon); thứ tự focus theo DOM; vùng bấm ≥ 24×24 CSS px; h1–h6 khác nhau về hình.

## 13. Social media: bộ icon social để chọn; Open Graph + Twitter card; placeholder social để trống.

## 14. Settings
- Nhãn và info đúng chính tả; default giải thích cách dùng, không Lorem/demo content; có favicon; logo ngang/dọc; mọi setting có label; link_list header/footer mặc định main-menu/footer; default resource phải tồn tại; metaobject chỉ standard definitions; có theme_info.
- Thay đổi editor hiện ở preview (request.design_mode).
- Text: sentence case cho tên section/preset/category; tên mô tả, không đánh số; ngôn ngữ merchant ("Button label" không "CTA label"); American English; không "&"; câu khẳng định không hỏi; không lặp chủ thể section trong mỗi nhãn; active voice, nút bắt đầu bằng động từ; định dạng thông số ("N x Npx", "N:N aspect ratio", "N words max").
- Thuật ngữ: home page; top bar; bottom bar; slideshow (không slider); checkout; heading (không title); subheading; body text; signup; favicon; sidebar; button label; social media; social media icons; navigation; main menu/secondary menu/footer menu; cart type (drawer/page/modal); .png; "use"/"show"/"enable".
- Tên section theo chức năng (Header, Featured products, Slideshow, Image gallery, Logo list, Newsletter, Blog posts, Testimonials, Footer…); preset theo loại nội dung; placeholder preset: Image icon, Logo icon, Lifestyle image, YouTube ID mặc định.

## 15. Font picker: mọi font qua font_picker; có font mặc định; font hiện hành; nạp bold/italic/bold-italic bằng font_modify; không custom font.
## 16. Color system: ≥ 4 màu; mỗi màu nền có màu chữ tương ứng; type "color".
## 17. Responsive images; chỉ tải ảnh khi cần.
## 18. Tên theme/preset: không giống sản phẩm Shopify, không tên công ty, không chung chung (Performance, Mobile…), không tên ngành (Fashion…), 1–2 từ < 30 ký tự; 1 preset mang tên theme; trạng thái cài đặt khớp demo (layout, màu, typography).
## 19. Version + release notes.
## 20. Demo store: client transfer store; Bogus Gateway/Shopify Payments test; text thật; powered_by_link không đổi; không affiliate; rel nofollow; **không chữ/nút nhúng trong ảnh** (trừ sản phẩm vật lý, infographic, badge, ảnh Instagram); không GIF động giả tính năng; không app (trừ review/translation miễn phí); có quyền mọi asset (brand cần phép chủ thương hiệu). Khuyến nghị: có sản phẩm sale, sold out, nhiều variant, gift card.
## 21. Documentation + contact form (họ tên, email, store URL, mô tả, upload, auto-responder…).
## 22. Support: trả lời ≤ 2 ngày làm việc; .json không chứa tài nguyên riêng demo (metafield custom, shopify:// URL); link_list mặc định main-menu/footer; default resource tồn tại mọi store.
