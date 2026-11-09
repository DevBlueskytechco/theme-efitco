---
title: Quy tắc UI nhóm 5, 6, 7 – Ghi nhớ & dùng lại (Consistency), Khả năng tiếp cận (Accessibility), Hiệu ứng thị giác nâng cao (Aesthetic-Usability)
type: Quy tắc
scope: Tính nhất quán layout/màu/typo/icon, responsive consistency, auto-fill; chuẩn WCAG; visual rhythm, imagery, eye comfort, dark mode
source: Sheet "Khả năng ghi nhớ và dùng lại", "Hiệu ứng thị giác nâng cao", "Tiêu chí nhỏ" (cột tiêu chí Hưng bổ sung – Accessibility) trong các file Excel
---

# Quy tắc UI nhóm 5 – Khả năng ghi nhớ và dùng lại (Consistency & Familiarity)

Ngữ cảnh: người dùng quay lại site hoặc dùng nhiều trang khác nhau. Mục tiêu: dễ nhớ, tạo thói quen thao tác (hỗ trợ trí nhớ dài hạn – LTM).

## 1. Layout nhất quán – button, form, menu, banner, label xuất hiện đồng nhất giữa các page

1. Dùng một grid system nhất quán.
2. Thứ bậc thị giác đồng nhất giữa các trang: nội dung quan trọng nhất luôn ở vị trí nổi bật (trên cùng, trái hoặc giữa); bố trí theo F hoặc Z pattern xuyên suốt.
3. Khoảng trắng và spacing thống nhất.
4. Nhất quán kích thước, hình dạng thành phần UI: button, form, card, banner giữ nguyên hình dạng, kích thước, padding; không thay đổi đột ngột giữa các trang.
5. Nhất quán iconography và hình ảnh: icon một phong cách (outline / filled / rounded); hình ảnh cùng phong cách, màu, chất lượng.

**Bài học audit**: các chức năng tương tự cần một logic hoạt động chung giống nhau – ví dụ video shoppable, lightbox video, popup quick view, shoppable… phải cùng cách mở/đóng.

Nguồn: Apple HIG Layout; NN/g Principles of Visual Design.

## 2. Hành vi mobile giống desktop (responsive tốt)

- Layout trên mobile, tablet, desktop giữ thứ tự và vị trí logic; không thay đổi hoàn toàn nội dung và cấu trúc.
- Tương tác và cách hiển thị giống nhau ở mọi thiết bị, chỉ khác kích thước và cách sắp xếp phù hợp màn hình.

Nguồn: NN/g Responsive Web Design.

## 3. Màu sắc, typography, iconography nhất quán giữa các trang và màn hình

- Một bảng màu cố định (primary, secondary, neutral…) trên mọi trang.
- Font, size, weight, line-height nhất quán toàn giao diện.

Nguồn: Polaris Colors; Polaris Typography.

## 4. Logo và yếu tố thương hiệu ở vị trí dễ nhớ, xuyên suốt

- Thanh điều hướng, menu chính, logo, giỏ hàng luôn cố định cùng một vị trí trên mọi trang.
- Người dùng không mất phương hướng khi chuyển trang.

## 5. Ghi nhớ thông tin đã nhập (auto-fill), lưu lịch sử thao tác

1. Auto-fill thông tin phổ biến: form (tên, email, số điện thoại, địa chỉ) hỗ trợ thuộc tính autocomplete; thông tin đã nhập được ghi nhớ và gợi ý khi quay lại.
2. Cho phép chỉnh sửa / xoá thông tin đã lưu dễ dàng, giao diện rõ.
3. Gợi ý lịch sử tìm kiếm hoặc lựa chọn trước đó trong thanh tìm kiếm / trường nhập liên quan.
4. Hoạt động ổn định trên mọi trình duyệt (Chrome, Safari, Firefox) và thiết bị.

Nguồn: Apple HIG Text Fields – Auto-fill; Polaris Form.

## 6. Nhất quán dữ liệu kỹ thuật (áp dụng theme digital)

- Thông tin cốt lõi (chất liệu, kích thước, tính năng) xuất hiện cả trong mô tả sản phẩm và bảng thông số (Baymard #858D).
- Bảng thông số dễ đọc: chia cột rõ, nhóm logic (#835D).
- Chuẩn hoá thông số từ nhiều nhà cung cấp về cùng định dạng, thuật ngữ, đơn vị (#839D).

---

# Quy tắc UI nhóm 6 – Khả năng tiếp cận (Accessibility)

Ngữ cảnh: người dùng khuyết tật nhẹ, thiết bị cũ, mắt kém màu. Mục tiêu: tăng khả năng sử dụng cho mọi người. Đạt chuẩn WCAG, ADA (bắt buộc với Shopify Theme Store – xem DoD).

**Tiêu chí**
- Độ tương phản đáp ứng WCAG AA: 3:1 cho văn bản lớn, 4.5:1 cho văn bản nhỏ.
- Font size body không nhỏ hơn 16px (desktop) hoặc 14px (mobile).
- Line-height tối thiểu 1.5 lần font-size.
- Không dùng màu đơn lẻ để truyền đạt ý nghĩa / trạng thái – kết hợp icon, mẫu, văn bản.
- Chữ mô tả (alt text) cho hình ảnh.
- Nút, liên kết, thành phần tương tác tối thiểu 44×44px (mobile) hoặc 40×40px (desktop).
- Giao diện đáp ứng tốt khi zoom 200% mà không vỡ bố cục.
- Trường form có label rõ ràng.
- Thông báo lỗi cụ thể, dễ nhận biết, khắc phục nhanh.
- Liên kết, nút, yếu tố tương tác dễ nhận biết qua chỉ dẫn trực quan: gạch chân, viền, đổi màu khi hover.
- Điều hướng được bằng bàn phím hoặc không chuột; hiển thị rõ vị trí focus khi di chuyển qua các yếu tố tương tác.
- Tương thích screen reader; hỗ trợ người khiếm thính (phụ đề video).

**5 phương pháp trực quan cải thiện accessibility (NN/g)**
1. Tương phản màu phù hợp.
2. Không chỉ dựa vào màu để truyền thông tin.
3. Làm nổi bật yếu tố tương tác.
4. Alt text cho hình ảnh.
5. Đảm bảo truy cập bằng bàn phím.

**Văn bản trên hình ảnh (text over images)**
- Tỷ lệ tương phản ít nhất 4.5:1 (3:1 với ký tự lớn ≥ 18pt).
- Dùng lớp phủ (overlay) màu hoặc bóng (shadow) cho văn bản.
- Chọn ảnh nền đơn giản hoặc có vùng trống để đặt chữ; tránh ảnh nhiều chi tiết, màu gần màu chữ.
- Kiểm tra bằng công cụ và trên nhiều thiết bị.

---

# Quy tắc UI nhóm 7 – Hiệu ứng thị giác nâng cao (Aesthetic-Usability)

Ngữ cảnh: làm đẹp giao diện nhưng không hy sinh usability. Mục tiêu: tăng thiện cảm, thẩm mỹ mà không đánh đổi trải nghiệm.

## 1. Visual rhythm – bố cục nhịp nhàng

1. Hệ thống grid và spacing nhất quán (12-column) để nội dung phân bổ hài hoà; khoảng cách đồng nhất, dễ chịu khi lướt mắt.
2. Tạo nhịp điệu bằng kích thước, hình dạng, màu: thành phần quan trọng to, màu nổi; thành phần thứ cấp nhỏ, màu nhẹ.
3. Tận dụng khoảng trắng để cân bằng, cho mắt nghỉ; tránh dày đặc nội dung.
4. Hình ảnh và đồ hoạ phân bổ đều, kích thước đồng đều hoặc tỷ lệ nhất quán.
5. Hiệu ứng và chuyển động nhất quán về tốc độ, độ mượt.

Nguồn: Polaris Grid; NN/g Visual Hierarchy; Apple HIG Motion.

## 2. Hình ảnh dễ nhớ, dễ hiểu (7 tips NN/g)

1. Relevant: minh hoạ trực tiếp nội dung/sản phẩm; tránh ảnh trừu tượng, chung chung.
2. High-quality: rõ nét, độ phân giải cao, không mờ/pixel/méo; tối ưu định dạng WebP/JPEG/PNG để tải nhanh.
3. Real people: ưu tiên người thật, cảm xúc tự nhiên; tránh ảnh stock cứng nhắc.
4. Consistent style: cùng phong cách (lifestyle, minimal, vibrant, monochrome), màu, ánh sáng, cách xử lý.
5. Memorable: ảnh độc đáo, nhận diện thương hiệu cao; tránh ảnh quá phổ biến gây nhàm.
6. Hiển thị sản phẩm trong bối cảnh thực tế.
7. Đặt ảnh gần nội dung liên quan; ảnh hỗ trợ nội dung, không chỉ trang trí; kiểm tra phản hồi người dùng.

Nguồn: NN/g Photos as Web Content; NN/g 7 Tips for Memorable Imagery.

## 3. Tránh mỏi mắt khi dùng lâu (Eye Comfort)

1. Tương phản phù hợp: ≥ 4.5:1 nhưng tránh quá mạnh hoặc quá thấp.
2. Chữ tối thiểu 16px cho nội dung chính; sans-serif rõ ràng (Helvetica, Roboto, San Francisco).
3. Line-height 1.5–1.7 lần cỡ chữ.
4. Chiều dài dòng 50–75 ký tự.
5. Bảng màu dịu, hạn chế màu quá chói/quá sáng trên diện tích rộng; tránh quá nhiều xanh lam.

Nguồn: NN/g Low Contrast; Polaris Accessibility; Apple HIG Typography; Polaris Typography; Polaris Colors.

## 4. Hỗ trợ Dark Mode

1. Bảng màu dark mode dùng tone tối nhưng không pure black (#000000) – ví dụ #121212, #1F1F1F; chữ off-white, xám nhạt.
2. Kiểm tra ảnh, icon, đồ hoạ hiển thị rõ trong dark mode, đủ tương phản.
3. Tuân theo cài đặt hệ thống của người dùng; cung cấp tuỳ chọn chuyển đổi; kiểm tra kỹ cả 2 chế độ.
4. Lưu ý: light mode cho hiệu suất đọc tốt hơn với người thị lực bình thường; dark mode có lợi với người nhạy sáng, tiết kiệm pin OLED, giảm ánh sáng xanh.

Nguồn: NN/g Dark Mode; NN/g Dark Mode Users & Issues; Polaris Colors.

## 5. Flat / Flat 2.0

- Thiết kế phẳng thiếu dấu hiệu trực quan khiến người dùng không biết yếu tố nào tương tác được.
- Flat 2.0: giữ tối giản nhưng thêm bóng đổ tinh tế, viền, đổi màu khi hover để có signifier rõ.
- Nguyên tắc: yếu tố tương tác luôn có dấu hiệu rõ; cân bằng thẩm mỹ – chức năng.

## 6. Hover zoom thay cho click zoom (gallery sản phẩm)

Ưu tiên phóng to ảnh khi hover thay vì click – nhanh và tự nhiên hơn trên desktop. Audit Purity: chưa có, cần bổ sung option hover zoom hoặc click zoom (tham khảo Glozin).

## 7. Hiệu ứng thẩm mỹ – khả dụng (Aesthetic-Usability Effect)

Người dùng đánh giá giao diện đẹp là dễ dùng hơn, dù thực tế không phải vậy. Lợi: ấn tượng tích cực ban đầu, người dùng kiên nhẫn hơn với lỗi nhỏ. Rủi ro: che giấu vấn đề usability, làm sai lệch kết quả test. → Cân bằng thẩm mỹ và chức năng; luôn test usability với người dùng thật; không tin hoàn toàn vào phản hồi "đẹp".
