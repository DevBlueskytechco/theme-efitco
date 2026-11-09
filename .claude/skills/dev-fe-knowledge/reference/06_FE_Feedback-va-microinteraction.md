# Feedback và microinteraction

**Tiêu đề:** Feedback và microinteraction
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev FE
**Nguồn:** Dev.xlsx mục 6.4 Feedback & Microinteractions; shopify.dev Accessibility best practices (Forms, Form errors, Product information); shopify.dev Theme Store requirements (Accessibility, Consistency)

---

## Nội dung

### 1. Yêu cầu từng đối tượng [Nội bộ – DoD]

Mọi mục trong Dev.xlsx đều kèm điều kiện: mượt, tối ưu khi tải, thống nhất toàn site.

| Đối tượng | Yêu cầu Dev.xlsx | Phần FE làm |
| - | - | - |
| Buttons | Khi click hiển thị icon loading; có hiệu ứng hover | Style trạng thái loading (icon/spinner thay chữ hoặc cạnh chữ, nút không đổi kích thước) và trạng thái disabled; hover theo hệ chung (file 04) |
| Input Forms + Form Validation | Focus vào input hoặc select có border | Kiểu focus có border rõ, border input đạt tương phản 3:1; style trạng thái lỗi |
| Product card | Mượt, thống nhất | Hover/focus/loading của nút trong card theo hệ chung |
| Notifications & Toast | Hiển thị góc phải màn hình, tự ẩn sau vài giây; có thể có thanh tiến trình chạy theo số giây hiển thị | Vị trí, animation vào/ra, thanh tiến trình bằng `transform: scaleX` theo thời lượng; container có sẵn `aria-live` |
| Search Bar | Có loader khi đang tải kết quả search | Style trạng thái đang tải của vùng kết quả predictive search |
| Mini Cart | Loading trên các nút action trong mini cart; thanh progress chạy từ trái sang phải | Loading cho nút số lượng/xoá/checkout; progress bar animate từ trái sang phải |
| Popup, Modal, Canvas | Mượt, thống nhất | Theo file 05 |
| Progress Indicators | Chạy từ trái sang phải khi dữ liệu cập nhật; ví dụ thanh tiến trình mini cart chạy theo % khi update/remove item | Animate độ dài bằng `transform`; giá trị % do BE cập nhật |
| Navigation Menus | Hover hoặc click có hiệu ứng active menu | Style active + `aria-current` |

### 2. Quy tắc kỹ thuật

1. **Trạng thái loading không làm nhảy layout.** Nút giữ nguyên kích thước khi chuyển sang loading; spinner nằm trong khung sẵn có.
2. **Trạng thái do BE bật.** FE không viết JS. Mỗi trạng thái (loading, disabled, error, success) có một hook rõ ràng để BE bật/tắt.
3. **Animation chỉ dùng `transform`/`opacity`.** Progress bar dùng `scaleX` với `transform-origin` bên trái thay vì animate `width`.
4. **Thông báo phải đọc được bởi screen reader** [Shopify – khuyến nghị]: notification, lỗi, thông báo thành công được đọc to; thông tin quan trọng dùng `aria-live`. FE đặt sẵn container `aria-live` trong layout cho toast và cho vùng giá/tình trạng sản phẩm.
5. **Lỗi form** [Shopify – khuyến nghị]: thông báo rõ ràng, mô tả cụ thể; input có `aria-describedby` trỏ tới container lỗi; field bắt buộc có `required`. FE dựng sẵn container lỗi cạnh mỗi field.
6. **Không dùng màu làm tín hiệu duy nhất.** Trạng thái lỗi có thêm icon hoặc text, không chỉ đổi border đỏ.
7. **Toast tự ẩn** phải đủ lâu để đọc; thông tin quan trọng (lỗi thêm giỏ vượt tồn kho) không chỉ nằm trong toast tự biến mất mà còn hiển thị tại chỗ.

### 3. Tình huống bắt buộc phải có feedback (theo Shopify test checklist)

Các tình huống Shopify review test và FE phải có giao diện cho:
- Thêm vào giỏ vượt số lượng tồn: hiện thông báo lỗi (product page và cart).
- Newsletter, contact form, comment, password page: trạng thái lỗi và thông báo gửi thành công.
- Search không có kết quả: thông báo rõ.
- Cart rỗng: thông báo cart rỗng.
- Collection không có sản phẩm: thông báo.
- Variant hết hàng/không tồn tại: nút Add to cart và nút accelerated checkout ở trạng thái disabled hoặc thay bằng "Sold out"; selector variant gạch chéo hoặc disable option hết hàng.

### 4. Bàn giao cho BE

Danh sách hook trạng thái cho từng component: button (loading, disabled), form field (error + id container lỗi), toast (vào, ra, thời lượng), mini cart (loading từng dòng, giá trị progress), predictive search (đang tải, rỗng).

### 5. Nghiệm thu

- Bấm add to cart: nút hiện loading, không đổi kích thước, không double submit (BE khoá), sau đó mở mini cart.
- Gửi form trống: lỗi hiển thị cạnh field, có text, screen reader đọc được.
- Toast xuất hiện góc phải, thanh tiến trình chạy hết thì toast ẩn.
- Update số lượng trong mini cart: progress bar chạy từ trái sang phải tới đúng %.
