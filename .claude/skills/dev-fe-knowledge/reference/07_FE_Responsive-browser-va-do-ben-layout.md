# Responsive, tương thích trình duyệt và độ bền layout

**Tiêu đề:** Responsive, tương thích trình duyệt và độ bền layout
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev FE
**Nguồn:** Dev.xlsx mục 5.3 Browser compatibility, 5.5 Test checklist; shopify.dev Theme Store requirements (Theme design and UX, Pages, Browser compatibility, Features); shopify.dev Test checklist

---

## Nội dung

### 1. Trình duyệt phải hỗ trợ [Shopify – bắt buộc]

Layout, trải nghiệm duyệt và thao tác mua hàng phải chạy trên:

Desktop
- Safari: 2 bản mới nhất trên Mac
- Chrome: 3 bản mới nhất trên Mac và PC
- Firefox: 3 bản mới nhất trên Mac và PC
- Edge: 2 bản mới nhất trên PC

Mobile (theme bắt buộc responsive)
- Mobile Safari: 2 bản mới nhất trên iOS
- Chrome Mobile: 3 bản mới nhất trên Android và iOS
- Samsung Internet: 2 bản mới nhất trên Android

Webview trong ứng dụng (duyệt và mua hàng phải chạy)
- Instagram, Facebook, Pinterest: bản mới nhất trên Android và iOS

Dev.xlsx ghi chú luồng chức năng phải chạy tương thích trên các môi trường này; hyperlink trong file dẫn tới BrowserStack (https://www.browserstack.com/) làm công cụ test.

Quy tắc FE: không dùng tính năng CSS chưa được hỗ trợ trên toàn bộ danh sách trên, trừ khi có fallback không làm vỡ layout.

### 2. Layout chịu được nội dung thay đổi [Shopify – bắt buộc – Theme design and UX]

"Flexible layouts that look intentional": layout vẫn cân đối, gọn khi độ dài nội dung, số ảnh, lượng text thay đổi; không có khoảng trống vụng, vùng trắng lớn, hay layout vỡ.

Bộ dữ liệu biên Shopify dùng khi review (lấy từ Test checklist) — FE phải dựng CSS chịu được:

| Loại nội dung | Giá trị test |
| - | - |
| Tên store (fallback khi không có logo) | 30–40 ký tự không khoảng trắng; có dấu gạch nối |
| Logo | Tỉ lệ 16:9, 4:3, 3:2, 1:1, dọc và ngang; PNG nền trong suốt; logo co giãn đúng |
| Menu | 10+ mục; 1, 2, 3 cấp; tiêu đề mỗi cấp dài 30–60 ký tự; mega menu nếu có |
| Footer | 5 cột/khối hoặc tối đa; nhiều menu; 10+ mục; tiêu đề 30–60 ký tự; đủ mọi social link |
| Ảnh section | 2048px (retina), 1024px (widescreen); tỉ lệ 16:9, 4:3, 3:2, 1:1, dọc và ngang, 72ppi |
| Heading/subheading | Subheading 60 ký tự; text một dòng 60–100 ký tự |
| Rich text | 1, 2, 3 lần xuống dòng; đoạn 40–50 từ; nhiều đoạn tối thiểu 1000 ký tự (page: 3000) |
| Button label | Một từ 30 ký tự không khoảng trắng; nhiều từ 30 ký tự |
| Tiêu đề sản phẩm/collection/blog | Một từ 30 ký tự không khoảng trắng; nhiều từ 30–60 ký tự |
| Vendor | Một từ 30 ký tự không khoảng trắng; nhiều từ 30–60 ký tự |
| Tag/filter | Tag một từ 30 ký tự; danh sách 20+ tag |
| Password message | 500+ ký tự |
| Announcement bar | 60–100 ký tự hoặc giới hạn tối đa |
| Trang chủ | Tới 25 section; 3 slideshow; 5 featured product (3 cái trùng sản phẩm); 3 featured collection; 3 image with text |
| Cart | Đủ sản phẩm để cart phải cuộn |
| Product | 100 variant; sản phẩm không có ảnh; media hỗn hợp (ảnh, video, 3D, AR, MP4) |

Kỹ thuật CSS bắt buộc từ đó:
- Từ dài không khoảng trắng phải được ngắt dòng, không tràn khung.
- Grid sản phẩm, blog, collection không vỡ khi ảnh khác tỉ lệ [Shopify – bắt buộc ở Collection page requirements].
- Mọi ảnh khác tỉ lệ ở trang sản phẩm đều xem được, không vỡ layout [Shopify – bắt buộc ở Product page requirements].

### 3. Hiển thị không được cắt [Shopify – bắt buộc – Pages]

- `product.title` không bị cắt (trang sản phẩm và grid collection).
- `collection.title` không bị cắt (collection page, collection list page).
- `article.title` không bị cắt (blog, article).
- Mã gift card không bị cắt; QR code tối thiểu 120×120 px.
- Tiêu đề navigation hiển thị đủ.

Không dùng `text-overflow: ellipsis` hoặc line-clamp cho các trường trên.

### 4. Thành phần có màu thương hiệu – không được sửa [Shopify – bắt buộc]

- Màu nút dynamic checkout / accelerated checkout: không được sửa.
- Màu nút Follow on Shop: không được sửa.
- Icon phương thức thanh toán phải full color.

CSS của theme không được ghi đè style của các phần tử này.

### 5. Thành phần phải hiển thị ở cả desktop và mobile [Shopify – bắt buộc]

- Account component `<shopify-account>` trong header: hiển thị ở header desktop và header mobile.
- Search box hoặc link tới search.
- Selector country/currency và language khi store bán đa thị trường, theo UX guidelines của Shopify.

### 6. Responsive và hiệu năng [Shopify – khuyến nghị]

- Một menu dùng chung cho mọi màn hình, đổi giao diện bằng media query.
- Không có nội dung rộng hơn viewport.
- Touch target ≥ 44×44 px cho control chính (xem file 03).
- Không chặn zoom trong thẻ viewport.

### 7. Nghiệm thu

- Test trên đủ trình duyệt mục 1 (BrowserStack hoặc thiết bị thật), gồm webview Instagram/Facebook/Pinterest.
- Nạp bộ dữ liệu biên mục 2: không có text tràn, không có grid lệch, không có chữ bị cắt ở các trường mục 3.
- Không có thanh cuộn ngang ở bất kỳ breakpoint nào.
