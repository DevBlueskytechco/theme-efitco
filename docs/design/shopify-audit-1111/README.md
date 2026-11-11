# Rà soát tuân thủ Shopify Theme Store (11/11/2026)

Nguồn yêu cầu: https://shopify.dev/docs/storefronts/themes/store/requirements (đọc 11/11, tóm tắt ở `requirements.md`) và https://shopify.dev/docs/storefronts/themes/pricing-payments/accelerated-checkout.
Phạm vi: thiết kế (docs/ui-spec, mockup drafts/designer) và code develop `7e64dbb`. Bảng chi tiết từng yêu cầu (CHẶN / NÊN / ĐẠT, file:dòng):
- `A-features-pdp-cart.md`: §4 Features, §7 Layout, Product, Cart, Gift card, Password.
- `B-templates-pages-seo.md`: §5, §7 Collection, List collections, Page, Blog, Article, Search, 404, §10, §11, §13, §17, §22.
- `C-design-a11y-settings-demo.md`: §3, §8, §12, §14, §15, §16, §18, §20.

## 1. Thiết kế: đã sửa trong PR này

| # | Yêu cầu | Lỗi | Sửa |
| --- | --- | --- | --- |
| T1 | §4 accelerated checkout: không đổi màu nút có thương hiệu | cart.html vẽ Shop Pay / G Pay nền đen theme; mini cart ô nét đứt | `.brand-btn` màu thương hiệu (Shop Pay #5A31F4, G Pay đen); quy tắc foundation §27 (chỉ biến CSS chính thức: cao 25–55, bo, bóng, căn, khoảng hàng) |
| T2 | §4 Shop Pay Installments | chữ "shop Pay" khung nét đứt | logo Shop Pay tím |
| T3 | §7 Layout: payment icons full color | chip đơn sắc ở 14 mockup (Figma vẽ đơn sắc) | `.payment-icons .pi--*` màu thật; lệch Figma có chủ đích |
| T4 | §7 Gift card: Apple Wallet | nút tự vẽ nền đen theme + icon ví chung | huy hiệu "Add to Apple Wallet" chính thức (`gift-card/add-to-apple-wallet.svg`) |
| T5 | §7 Collection, Blog: title not truncated | card sản phẩm cắt 2 dòng, card bài cắt 3 dòng (foundation §9, §10, collection, nav, mini cart, predictive, quiz, bundle) | hiện đủ, xuống dòng, không cắt |
| T6 | §7 Blog: article.excerpt_or_content | card trang blog không có trích đoạn (quyết định B1 10/11) | trang blog có trích đoạn 20 từ; block blog posts trang chủ giữ Figma |
| T7 | §8 RTE nhất quán | article.md và page.md 2 kiểu khác nhau | `.rte` chung foundation §28 (cả mô tả sản phẩm, collection), h1–h6 khác nhau |
| T8 | §4 rich media trong featured product và quick view | spec chỉ có ảnh | spec thêm video, YouTube/Vimeo, 3D (mini-cart-quickview §3, index-mobile-b §2) |
| T9 | §4 Follow on Shop | thiết kế footer không có | foundation §29 + mockup footer nút tím |
| T10 | §8 không claim sai | popup newsletter "Your 15% code is on its way" khi theme không gửi mã | hiện mã từ setting Discount code ngay trong popup |

## 2. Code: chuyển Tech Lead tách task (sprint Dev đang dừng)

CHẶN: gift_card.liquid không có QR (≥ 120px); password không có logo / shop.name; featured-product lọc chỉ ảnh; footer in ảnh `efx-pay-*.png` cố định thay `shop.enabled_payment_types`; countdown demo đặt "hôm nay 23:59" (đếm giả, §8); tier giảm bundle / shop the look mặc định 10% chỉ hiển thị (§8); "Get 15% Off" cứng; "Verified" cho testimonial demo; thiếu setting favicon; logo dự phòng SVG "EFITCO" thay shop.name; social link giả trong settings_data; index.liquid nhúng handle/ảnh/metafield demo (§22); search.liquid bản Skeleton (không filter, sort, object_type); 404 thiếu ô search và link home; blog.liquid dùng `article.excerpt`; article thiếu thông báo comment thành công / chờ duyệt; thiếu template page.contact; snippets/predictive-search.liquid trỏ asset không tồn tại; h5 = h6; viền radio quiz #999 (2.85:1 < 3:1).
NÊN: menu code chỉ đọc 2 cấp (thiết kế 3); swatch dự phòng metafield `custom.swatch_colors`; Sale badge theo `compare_at_price_max`; ảnh blog/article/search thiếu sizes, lazy; template test index.te*, block hello-world, liquid-tips trong gói; nhãn setting "Title" → "Heading", "Eyebrow" → "Subheading"; theme_info trỏ docs Shopify; claim mặc định khi để trống ("Trusted by 10,000+ athletes", bảo hành, đổi trả).

## 3. Cần CTO quyết

1. ~~Kiến trúc §5~~ ĐÃ CHỐT 11/11: giữ Skeleton block-first theo chuẩn "Shopify's Skeleton Theme is the only approved codebase for Theme Store development". Template .json, section groups, section Custom Liquid ở mục 5 là tài liệu cũ cho theme sections (không hỗ trợ Canvas), không áp dụng. Các dòng mục 5 trong bảng B ghi CHẶN coi là KHÔNG ÁP DỤNG.
2. Ảnh demo có logo bên thứ ba (Nike, Gymshark, adidas, REP Fitness, Northern; video card có handle Instagram): §20 cần quyền chủ thương hiệu. Đề xuất: thay ảnh trước khi nộp (ảnh trang chủ hiện theo Figma 100%).
3. Tên theme: "Efitco" là tên theme hay tên công ty khách (§18 cấm tên công ty).
