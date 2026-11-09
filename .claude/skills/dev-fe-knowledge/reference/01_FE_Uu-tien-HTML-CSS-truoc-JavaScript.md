# Ưu tiên HTML và CSS trước JavaScript

**Tiêu đề:** Ưu tiên HTML và CSS trước JavaScript
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev FE
**Nguồn:** Dev.xlsx mục 5.1 "Giảm thiểu việc sử dụng JavaScript"; shopify.dev Performance best practices (mục JavaScript, CSS and fonts, Essential practices); shopify.dev Accessibility best practices

---

## Nội dung

### 1. Quy tắc gốc [Nội bộ – DoD]

Trích Dev.xlsx: "Ưu tiên sử dụng HTML và CSS. JavaScript không nên lạm dụng. Thay vào đó chỉ nên sử dụng JavaScript như một sự nâng cấp tiến bộ (progressive enhancement) khi không có giải pháp khả thi nào bằng HTML hoặc CSS."

Ví dụ tham khảo team đã chọn: https://blog.logrocket.com/5-things-you-can-do-with-css-instead-of-javascript/

### 2. Vì sao (theo Shopify) [Shopify – khuyến nghị]

- JavaScript chạy trên main thread, tranh tài nguyên với việc render và phản hồi thao tác. Quá nhiều JS, tải sai thời điểm hoặc viết kém là nguyên nhân chính làm xấu INP và làm chậm LCP.
- Mục tiêu Shopify nêu: chỉ tải thứ cần, khi cần; tránh framework nặng khi Liquid và CSS làm được cùng việc.
- "Render essential content in Liquid and HTML, not JavaScript": đưa thông tin sản phẩm, nội dung hero, navigation vào JS phía client làm chậm LCP và hại SEO. Liquid render phía server trước khi trình duyệt làm gì.

### 3. Cách áp dụng cho FE

Trước khi đề xuất BE viết JS cho một hành vi, FE tự trả lời theo thứ tự:

1. Hành vi này có làm được chỉ bằng HTML native không? (Shopify yêu cầu dùng đúng phần tử native: `a` cho điều hướng, `button` cho hành động trên màn hình, `nav` cho vùng điều hướng, `table` cho dữ liệu bảng, control media native.)
2. Nếu không, có làm được bằng CSS (selector trạng thái, media query, transition) không?
3. Chỉ khi cả hai không đáp ứng, mới chuyển sang BE viết JS — và JS chỉ là lớp nâng cấp: không có JS, nội dung vẫn hiển thị đầy đủ và truy cập được.

Ghi rõ trong mô tả bàn giao cho BE: phần nào FE đã xử lý bằng HTML/CSS, phần nào thật sự cần JS và lý do.

### 4. Các trường hợp cụ thể đã có trong tài liệu Shopify

| Tình huống | Làm bằng HTML/CSS thế nào | Nguồn |
| - | - | - |
| Menu desktop và menu mobile | Một menu responsive duy nhất, đổi giao diện bằng CSS media query. Không dựng 2 menu riêng (gấp đôi DOM, hại INP) | Performance – "Merge duplicate mobile and desktop menus into one" |
| Ảnh hero khác nhau cho mobile/desktop | Dùng phần tử `<picture>` để trình duyệt chỉ tải ảnh khớp, không ẩn/hiện 2 ảnh bằng CSS | Performance – "Use the picture element…" |
| Animation | Animate bằng `transform` và `opacity`, không animate `top`, `left` hay thuộc tính layout | Performance – "Animate with transform and opacity…" |
| Ảnh hero/LCP | Dùng `<img>`, không dùng CSS `background-image` cho nội dung LCP | Performance – "Don't use CSS background-image for LCP content" |
| Nội dung chính (giá, tiêu đề, mô tả, nav) | Render sẵn trong Liquid/HTML, không để JS chèn vào sau | Performance – "Render essential content in Liquid and HTML" |

### 5. Ràng buộc accessibility khi thay JS bằng CSS [Shopify – khuyến nghị]

- Theme không được phụ thuộc vào hover chuột để nội dung hiển thị hoặc truy cập được. Dropdown mở bằng `:hover` thuần CSS là chưa đủ: vẫn phải mở được bằng bàn phím (Enter/Space trên nút mở, Esc để đóng, `aria-expanded`). Phần bàn phím và ARIA động là việc BE; FE phải dựng markup có nút mở là `button` và CSS theo `aria-expanded`.
- Không đổi ngữ cảnh đột ngột khi phần tử nhận focus.

### 6. Điều FE không làm

- Không tự thêm thư viện JS (slider, animation, lightbox) để giải quyết vấn đề giao diện.
- Không viết JS inline trong section để toggle class.
- Không chèn CSS bằng JS.

### 7. Nghiệm thu

- Mỗi component bàn giao kèm danh sách trạng thái và cách bật (class/thuộc tính) cho BE.
- Tắt JavaScript trên trình duyệt: nội dung chính của trang (sản phẩm, giá, mô tả, menu cấp 1) vẫn hiển thị.
- Lighthouse không có cảnh báo animation thuộc tính layout do CSS của FE gây ra.
