---
title: Checklist Customer Account, Order Tracking & Returns – dropdown tài khoản, dashboard, địa chỉ/thanh toán/newsletter, theo dõi đơn, đổi trả (desktop + mobile)
type: Checklist
scope: Khu vực tài khoản khách hàng, trang đơn hàng, email trạng thái, luồng trả hàng
source: Sheet "Customer Account", "Order Tracking & Returns", "Mobile" (phần Order tracking mobile – Baymard lbxiks) (Nextsky - Bộ tiêu chí UX.xlsx); Baymard guidelines #862–#925
---

# Checklist Customer Account, Order Tracking & Returns

Ghi chú: nhiều tính năng account/order của Shopify phải qua app hoặc Backend (BE) – ghi rõ để Designer biết giới hạn khi thiết kế.

---

## 1. Account Drop-Down & Sign In

- [ ] #886D Đặt dropdown Account ở góc trên bên phải – vị trí tiêu chuẩn người dùng mong đợi (Should; 5.9% AH). Audit: theme hiện chỉ là button dẫn tới page account, không có dropdown; mobile không có.
- [ ] #876D Dropdown chứa 5–7 tính năng quan trọng hay dùng: thông tin cá nhân, lịch sử đơn, quản lý thanh toán, đăng xuất…; tính năng ít dùng ẩn vào trang tài khoản (Should; <5% AH). Audit: chưa có trạng thái đăng nhập.
- [ ] #871D Dropdown phân cấp rõ: chia 2–3 nhóm chức năng ("Tài khoản", "Đơn hàng", "Cài đặt") (Should; 23.9% AH).
- [ ] #887D Cho đăng nhập trực tiếp trong dropdown (email + mật khẩu) (Low; 10%). Nhiều site lớn và theme vẫn dẫn tới page riêng – đạt.
- [ ] #879D Sau đăng nhập, chuyển về trang đang xem trước đó; nếu không xác định được thì về homepage. Sau reset password, tự đăng nhập và chuyển tới trang xác nhận, không bắt đăng nhập lại (Should; 39.8% AH). Audit: hiện sau đăng nhập dẫn tới page account.
- [ ] #889D Kiểm tra email có tồn tại trước khi gửi link reset và thông báo rõ (Could; 22.9% AH). Audit: hiện chỉ gửi thông báo chung kể cả mail không có; cần check Shopify có hỗ trợ không.
- [ ] #882D Hiển thị rõ trạng thái "đăng nhập một phần" (soft sign-in): nếu cần thêm bước xác thực, thông báo rõ và đặt link hoàn thành đăng ký (Low; 73.9%) – đạt.

## 2. Account Dashboard

- [ ] #865D Đường dẫn đến TẤT CẢ tính năng tài khoản trên dashboard, nhóm thành mục chính ("đơn hàng", "địa chỉ"…) (Should; 23% AH). Audit: cần review.
- [ ] #870D Card trên dashboard nhất quán bố cục và phong cách (Could; 60% AH) – đạt.
- [ ] #874D Không hiển thị / giảm nhấn mạnh quảng cáo trên dashboard, tập trung tiện ích (Should; 58.6% AH) – đạt.
- [ ] #866D Nếu dùng sidebar navigation: vị trí cố định; đủ rộng, cách content chính; style tương phản; icon + label rõ; highlight mục hiện tại; collapse/expand được (Should; 56.3% AH). Audit: không có sidebar navigation, cần review.
- [ ] #863D Dashboard icon-based nếu > 15 tính năng (Could; 70.6% AH). Shopify không cung cấp nhiều tính năng account nên không cần.
- [ ] #873D Làm nổi bật đơn hàng gần đây trên dashboard: vị trí đầu page/sidebar; hiển thị mã đơn, trạng thái, ảnh sản phẩm, nút xem chi tiết (Could; 19.7% AH). Audit: chưa có.

## 3. Your Account: địa chỉ, thanh toán, newsletter

- [ ] #893D Luôn có nút "Áp dụng"/Apply khi đổi thông tin tài khoản – dưới form hoặc bên phải trường, nổi bật hơn nút Huỷ; có phản hồi sau khi áp dụng (message, icon, disable button) (Must; 11.1% AH). Audit: chưa có thông báo khi thay đổi thành công.
- [ ] #916D Phân biệt rõ "Thêm địa chỉ mới" và "Sửa địa chỉ hiện tại" (Could; 14.4% AH) – đạt.
- [ ] #888D Tránh nhãn "Sổ địa chỉ" (Address Book) vì khách không hiểu; đặt theo chức năng: "Địa chỉ giao hàng", "Quản lý địa chỉ" + icon (Should; 67.6% AH) – đạt.
- [ ] #904D Cho đặt "Địa chỉ mặc định" ngay tại trang danh sách địa chỉ, không phải vào từng địa chỉ sửa (Should; 43% AH). Audit: chưa có.
- [ ] #919D Luồng "View → Edit → Confirm" khi cập nhật số thẻ – Shopify mỗi lần thanh toán nhập lại nên không cần.
- [ ] #896D Tái sử dụng địa chỉ đã lưu khi thêm phương thức thanh toán (Should; 64.6% AH) – đạt.
- [ ] #908D Chọn tần suất nhận newsletter; #911D "Unsubscribe All" khi nhiều newsletter; #918D thuật ngữ quản lý newsletter dễ phân biệt; #917D unsubscribe từng loại dễ dùng (Low) – Shopify theme không hỗ trợ, cần app.
- [ ] #891D Luôn xác nhận thành công/thất bại khi thay đổi dữ liệu tài khoản (Should; 27.8%). Audit: cần thông báo khi đổi địa chỉ thành công.
- [ ] #902D Thông báo xác nhận kèm bước tiếp theo hợp lý: xác nhận rõ đã thành công; hướng dẫn bước tiếp; giảm hoang mang (Could; 6.4% AH). Audit: review lại các toast sau hành động.

## 4. Account-Wide Navigation, Structure & Information

- [ ] #883D Phân cấp thông tin logic, styling phản ánh thứ tự ưu tiên và quan hệ cha–con (Could; 59.1% AH). Audit: cần review.
- [ ] #881D Điều hướng khu vực tài khoản nhất quán: vị trí cố định (sidebar trái hoặc header ngang); cấu trúc thứ bậc; màu, font, size, spacing; hover/active/focus (Could; 47.5% AH) – đạt.
- [ ] #892D Mỗi tính năng một đường dẫn riêng, không chồng chéo route hoặc một UI đảm nhiệm 2 chức năng (Should; 41.9% AH) – đạt.
- [ ] #875D Không bắt nhấp qua ≥ 3 lớp menu để tới chức năng (Should; <1% AH) – đạt.
- [ ] #880D Giải thích tính năng mới/đặc thù: tooltip, help text; link tài liệu/FAQ; ví dụ hoặc quick tour (Should; 76.6% AH). Hiện chưa có tính năng account mới nên chưa cần.
- [ ] #885D Courtesy navigation (link phụ ở header trên cùng hoặc footer) nên gồm: Theo dõi đơn hàng + 1–2 tính năng phổ biến (Lịch sử mua, Yêu thích, Phiếu quà tặng) (Should; 70% AH). Audit: cần review để thêm.
- [ ] #923D Help Center / FAQ dễ tiếp cận, giúp người dùng tự giải quyết (Should) – đạt.

## 5. Order & Order Tracking

- [ ] #895D Trạng thái "Cancellation Requested"; gợi ý sản phẩm thay thế khi khách huỷ (Low; 84% AH) – huỷ order phải qua app.
- [ ] #914D Huỷ đơn dễ tìm trong email trạng thái, tổng quan đơn, footer (Low; 18.4% AH) – qua app.
- [ ] #907D Tích hợp toàn bộ thông tin tracking vào site (Should; 48.9% AH). Audit: review kết hợp BE.
- [ ] #924D Hướng dẫn cá nhân hoá cho người cần giúp bắt đầu quản lý đơn (Could; 32.6% AH). Chưa có.
- [ ] #906D Filter trạng thái đơn (theo trạng thái, thời gian, loại đơn) cho khách mua nhiều (Could; 17% AH). Chưa có.
- [ ] #878D Đường dẫn nổi bật tới tính năng đơn hàng trong email trạng thái (Low) – FE không can thiệp email.
- [ ] #909D Giảm nhấn mạnh trường "Lý do huỷ" (Low) – theme không có huỷ order.
- [ ] #925D Thông tin cơ bản và cập nhật động cho item trong danh sách đơn (Low; 10.2% AH) – đã hiển thị cơ bản.
- [ ] #915D Nút "In đơn" / "Tải hoá đơn" trên trang chi tiết đơn (Low; 53.1% AH) – theme không hỗ trợ. Mobile: nên có "Xem hoá đơn"/"Tải PDF" hoặc in được từ trình duyệt (82% site vi phạm).
- [ ] #913D Trang tracking gồm: thông tin cơ bản, vận chuyển, sản phẩm trong đơn, button mua lại (Could; 45.5% AH). Audit: chưa có section sản phẩm liên quan để upsell.
- [ ] #912D Cấu trúc và style trang theo dõi đơn trực quan, phù hợp Shopify (Could; 54.8% AH). Audit: page order còn cơ bản, cần style bổ sung.
- [ ] #905D Guest order tracking cho người mua không đăng nhập (Low; 21.9% AH) – cần trao đổi BE.
- [ ] #884D Cá nhân hoá PDP cho người đã đăng nhập (giá thành viên, lịch sử mua) (Low; <5% AH) – trao đổi BE.
- [ ] #910D Nhiều đường vào tracking: header (account), footer, checkout & thank you page, email xác nhận, popup (Could; 61.2% AH). Audit: sau đăng nhập, icon account trên header dẫn tới order tracking.

## 6. Order tracking trên mobile (Baymard lbxiks)

- [ ] Trang theo dõi đơn dễ truy cập từ trang xác nhận, email, khu vực tài khoản; không yêu cầu đăng nhập bắt buộc (Cao; 78% vi phạm).
- [ ] Hiển thị đầy đủ: mã đơn, sản phẩm, địa chỉ giao, thanh toán, trạng thái, dự kiến giao (Rất cao; 84% vi phạm).
- [ ] Email đơn hàng tối ưu mobile: tiêu đề rõ, thông tin quan trọng đầu, CTA rõ "Theo dõi đơn hàng" (Cao; 76% vi phạm).
- [ ] Trạng thái hiện tại nổi bật, cập nhật thời gian thực nếu có, ngôn ngữ đơn giản (Rất cao; 78% vi phạm).
- [ ] Chủ động gửi email/SMS sau mỗi thay đổi trạng thái, có link tracking (Rất cao; 80% vi phạm).
- [ ] Xem chi tiết đơn từ link email/trang xác nhận mà không phải đăng nhập lại (Rất cao; 77% vi phạm).
- [ ] Người đã đăng nhập truy cập "Lịch sử đơn hàng" dễ trong menu tài khoản (Cao; 71% vi phạm).
- [ ] Nút "Mua lại" cho từng sản phẩm hoặc toàn đơn từ lịch sử/chi tiết đơn (Trung bình–Cao; 83% vi phạm).
- [ ] Nút liên hệ hỗ trợ rõ ngay trên trang đơn, ưu tiên hỗ trợ theo đơn cụ thể (Rất cao; 79% vi phạm). Audit: Purity (Shopify default) không có → thêm block "Bạn cần giúp?" gắn sẵn mã đơn vào form liên hệ/link hỗ trợ.
- [ ] Link chính sách đổi/trả và huỷ đơn trên trang đơn; nếu sản phẩm không được đổi trả phải hiển thị rõ (Cao; 82% vi phạm). Audit: chưa có → thêm link ở footer hoặc trong từng đơn; dùng app hoặc snippet chèn vào trang đơn.
- [ ] Ngày giao hàng dự kiến trên trang đơn, gần trạng thái (Rất cao; 84% vi phạm). Audit: Shopify default không hiển thị → tích hợp app vận chuyển hoặc tuỳ chỉnh Liquid.

## 7. Order Returns

- [ ] #894D Luồng trả hàng online trên website ngoài nhãn in sẵn (Low; 15.2% AH) – theme chưa có.
- [ ] #920D Công khai chi phí trả hàng (Low; 21.2% AH) – theme chưa có.
- [ ] #868D Lựa chọn mặc định thông minh trong luồng trả hàng (Low; 82.4% AH) – cần thảo luận.
- [ ] #867D In và email nhãn vận chuyển (Low; 15.2% AH) – thảo luận khả năng can thiệp email.
- [ ] #922D Cập nhật trạng thái đơn theo các mốc hoàn trả quan trọng (Low; 47.1% AH) – thảo luận.
