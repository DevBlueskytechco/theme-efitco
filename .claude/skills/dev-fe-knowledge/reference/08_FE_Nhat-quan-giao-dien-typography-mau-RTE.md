# Nhất quán giao diện: typography, màu, nội dung RTE

**Tiêu đề:** Nhất quán giao diện: typography, màu, nội dung RTE
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev FE
**Nguồn:** shopify.dev Theme Store requirements (Theme design and UX, Consistency and functionality, Accessibility, Color system, Font picker, Social media, Section preset guidelines); shopify.dev Test checklist; Dev.xlsx nhóm "Trải nghiệm người dùng" (yêu cầu "thống nhất toàn site")

---

## Nội dung

### 1. Thiết kế và bố cục [Shopify – bắt buộc – Theme design and UX]

Theme phải đạt mọi checkpoint sau, thiếu một mục là reject:

- **Ảnh, đồ hoạ, icon chất lượng chuyên nghiệp**: rõ nét, đúng kích thước, nhất quán; không mờ, kéo giãn, vỡ điểm ảnh hay kiểu clipart.
- **Bảng màu đơn giản, hài hoà**: màu không xung đột, không làm giảm khả năng đọc.
- **Cấu trúc trang theo grid logic**: spacing và căn lề giữa section và block có chủ đích, nhất quán.
- **Phân cấp nội dung rõ**: dùng kích thước, màu, tương phản, vị trí để dẫn mắt tới phần quan trọng trước; thông tin phụ nhỏ hơn, nhạt hơn.
- **Typography nhất quán**: không dùng quá nhiều font; cặp font bổ trợ nhau và dùng thống nhất mọi nơi.
- **Thiết kế tương tác nhất quán**: button, link, form cùng style, kích thước, màu, hành vi ở mọi nơi.

### 2. Nội dung từ Rich Text Editor (RTE) [Shopify – bắt buộc – Consistency and functionality]

- Nội dung do RTE sinh ra (`h1`–`h6`, `blockquote`, `ul`, `ol`) phải hiển thị nhất quán trên mọi template.
- Style của nội dung RTE thống nhất giữa bài blog, mô tả sản phẩm, mô tả collection.
- Ảnh chèn trong RTE phải hiển thị đúng như trong trình soạn thảo (Test checklist – product description, article, page).
- Link trong RTE có style cho thấy là bấm được (Test checklist áp dụng cho mọi section có text).

Cách làm: một bộ style RTE duy nhất (class bọc nội dung RTE) dùng cho mọi nơi output `product.description`, `collection.description`, `article.content`, `page.content`, setting `richtext`.

### 3. Heading [Shopify – bắt buộc – Accessibility]

- `h1`–`h6` khác nhau về thị giác.
- Heading dùng cho cấu trúc, không dùng để tạo cỡ chữ (best practice). Muốn chữ to dùng class typography, giữ đúng cấp heading.

### 4. Hệ màu [Shopify – bắt buộc – Color system]

- Tối thiểu 4 màu.
- Mọi setting màu nền đều có setting màu chữ (foreground) tương ứng.
- Setting màu dùng `type: color` (phần schema do BE làm).

Phía FE: mọi thành phần lấy màu từ biến CSS sinh từ color scheme/setting, không hard-code màu trong CSS component. Mỗi cặp nền–chữ trong scheme mặc định đạt tương phản 4.5:1 (chữ thường) và 3:1 (chữ lớn, icon, border input).

### 5. Font [Shopify – bắt buộc – Font picker]

- Mọi font lấy từ setting `font_picker`; không nhúng custom font.
- Load đủ bold, italic, bold-italic cho mỗi font qua `font_modify`.
- Font mặc định và font trong preset phải là font đang available trong thư viện Shopify (không dùng font đã deprecated — danh sách tại https://shopify.dev/docs/storefronts/themes/architecture/settings/fonts#deprecated-fonts).

### 6. Social media [Shopify – bắt buộc]

- Có bộ icon social media cho merchant chọn.
- Placeholder text của social media để trống.

### 7. Placeholder cho preset [Shopify – Section preset guidelines]

Khi preset có ảnh, video, icon mà merchant chưa thêm media, hiển thị placeholder:

| Loại nội dung | Placeholder |
| - | - |
| Ảnh không phải product/collection; ảnh liền kề không margin | Image icon |
| Danh sách logo | Logo icon |
| Slideshow, ảnh có text chồng lên, ảnh full-width | Lifestyle image |
| Video | Video YouTube mặc định của Shopify |

FE style placeholder đúng khung như ảnh thật để layout preset nhìn giống khi đã có nội dung.

### 8. Thống nhất toàn site [Nội bộ – DoD]

Dev.xlsx lặp lại ở mọi mục UX yêu cầu "phù hợp và thống nhất toàn site". Áp dụng bằng design token:
- Token màu (từ color scheme), token font (từ font_picker), token spacing, token radius, token shadow, token animation (duration, easing).
- Component dùng token, không dùng giá trị cứng.

### 9. Nghiệm thu

- Một bài blog, một mô tả sản phẩm, một mô tả collection cùng chứa h1–h6, blockquote, ul, ol, ảnh, link: hiển thị giống nhau.
- Đổi color scheme của một section: mọi chữ, icon, border trong section đổi theo, vẫn đạt tương phản.
- Grep CSS không còn mã màu cứng trong component (trừ màu thương hiệu bắt buộc giữ nguyên của nút checkout/Follow on Shop vốn không do theme style).
