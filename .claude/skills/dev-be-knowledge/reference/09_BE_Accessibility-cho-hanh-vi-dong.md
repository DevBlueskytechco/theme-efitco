# Accessibility cho hành vi động (JavaScript)

**Tiêu đề:** Accessibility cho hành vi động (JavaScript)
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx mục 5.2 (Keyboard support, Gesture support, Navigation/Drop-down, Product information, Controls, Forms, Media, Dynamic components: Drawers and modals – Slideshows, Touch screen; Accessibility requirements; Accessibility score; Tools testing); shopify.dev Accessibility best practices; Theme Store requirements mục Accessibility

---

## Nội dung

### 1. Ngưỡng [Nội bộ – DoD]

Lighthouse Accessibility = 100 (desktop và mobile); Accessibility Insights for Web và WAVE không lỗi; W3C HTML checker pass. Shopify yêu cầu tối thiểu trung bình 90.

Markup, CSS, focus style, tương phản là phần FE. File này là phần JS BE chịu trách nhiệm.

### 2. Bàn phím [Shopify – bắt buộc + khuyến nghị]

- Mọi phần của trang dùng được bằng bàn phím, kể cả dropdown navigation (bắt buộc).
- Thứ tự focus khớp DOM (bắt buộc). JS không được dời focus lung tung hoặc đặt `tabindex` dương.
- Tab / Shift+Tab điều hướng được toàn theme.
- Không đổi ngữ cảnh đột ngột khi phần tử nhận focus (ví dụ không tự submit, không tự mở trang khi focus vào select).
- Không chức năng nào chỉ chạy bằng hover chuột.

### 3. Dropdown navigation

- Cập nhật `aria-expanded` trên nút mở theo trạng thái.
- `aria-controls` trỏ tới container submenu.
- `aria-current` cho trang/vị trí hiện tại.
- Enter và Space mở dropdown; focus giữ trên nút mở. Tab tiếp theo đi vào mục đầu của dropdown.
- Esc đóng dropdown và trả focus về nút mở.
- Không dùng `role="menu"` / `role="menuitem"`.

Áp dụng cho setting "mở menu bằng hover hoặc click" (Dev.xlsx 6.1): cả hai chế độ đều phải đáp ứng toàn bộ hành vi bàn phím ở trên.

### 4. Drawer và modal (mini cart, search canvas, quickview, popup)

- Mở: focus chuyển tới phần tử đặt tên drawer/modal.
- Trong lúc mở: focus bị giữ trong drawer/modal (focus trap).
- Esc đóng và trả focus về phần tử đã mở nó.
- Role là `dialog`.

Kết hợp Dev.xlsx 6.3 (popup không xuất hiện cùng lúc): khi quickview đóng để mở mini cart, focus phải chuyển hẳn sang mini cart; khi mini cart đóng, trả focus về phần tử hợp lý còn trên trang (nút cart hoặc nút đã kích hoạt ban đầu nếu còn tồn tại).

### 5. Slideshow

- Nội dung tự chạy phải dừng hoặc tắt được.
- Có nút next/previous.
- Video autoplay trong slideshow phải tắt tiếng.

### 6. Thông tin sản phẩm thay đổi theo variant

- Khi chọn variant làm đổi giá và tình trạng hàng, thay đổi phải được thông báo cho screen reader.
- Dùng `aria-live` cho thay đổi động của UI (giá, tình trạng, unit price, pickup).

### 7. Form và thông báo

- Lỗi trả về khi submit được thông báo cho screen reader sớm nhất có thể; focus đặt vào thông báo phản hồi.
- Thông báo lỗi rõ ràng, mô tả cụ thể.
- Input lỗi có `aria-describedby` trỏ tới container lỗi.
- Notification, lỗi, thông báo thành công được đọc to; thông tin quan trọng qua `aria-live`.

Áp dụng cho Dev.xlsx 6.4: toast thêm vào giỏ, lỗi vượt tồn kho, lỗi newsletter/contact/comment, kết quả predictive search (đang tải, không có kết quả).

### 8. Media

- Media không autoplay.
- Phát/dừng được bằng phím Space.
- Audio tự phát phải dừng được.

### 9. Gesture

- Không chặn pinch to zoom.
- Chức năng cần nhiều ngón hoặc cử chỉ phức tạp (ví dụ thao tác 3D model) phải làm được bằng một lần chạm/click.

### 10. Link và control

- `a` cho điều hướng; `button` cho hành động trên màn hình. JS không gắn click handler lên `div`/`span` để làm button.
- Link mở cửa sổ mới có cảnh báo (icon + text thay thế).

### 11. Nghiệm thu

- Rút chuột, chỉ dùng bàn phím: mở menu nhiều cấp, chọn variant, thêm giỏ, mở/đóng mini cart, quickview, search, đổi số lượng, checkout.
- Screen reader: đổi variant thì nghe được giá mới; thêm giỏ thì nghe được thông báo.
- Mở drawer: Tab không thoát ra ngoài; Esc đóng và focus trở về nút mở.
- Slideshow autoplay có nút dừng; video slideshow tắt tiếng.
