---
title: Bài học NN/g – Thiết kế tương tác web: accordion, tabs, carousel, bảng so sánh, overlay/popup, needy patterns, exit-intent, scrolling, cuộn ngang, infinite scroll, scrolljacking, scroll fading
type: Bài học
scope: Lý do và bối cảnh phía sau các quy tắc tương tác trong file 15; dùng khi cần cân nhắc có nên dùng một pattern hay không
source: Sheet "Tài liệu nghiên cứu UIUX" mục 3 "Thiết kế tương tác web" (NGHIÊN CỨU UX_UI.xlsx)
---

# Bài học NN/g – Thiết kế tương tác web

(Các con số, quy tắc triển khai cụ thể đã được chốt trong file 15 "Quy tắc popup, drawer, overlay, motion & carousel". File này giữ phần lý do, khi nào nên / không nên.)

## 1. Accordion

**Khi nên dùng**: người dùng cần tìm thông tin cụ thể (FAQ 50+ câu, chỉ quan tâm 1–2 mục; danh mục nhiều tầng điện thoại → iPhone → iPhone 15); không gian hạn chế (dashboard nhiều module, form dài có phần tuỳ chọn); cần giảm tải nhận thức – NN/g: accordion giảm 40% cảm giác choáng ngợp so với trang dài liền mạch.

**Khi không nên**: cần đọc nhiều mục liên tiếp (hướng dẫn từng bước, điều khoản quan trọng); nội dung quá ngắn (< 5 mục thì hiển thị toàn bộ tốt hơn); cần so sánh thông tin (phải mở từng cái gây mệt).

**5 nguyên tắc**: mở sẵn 1–2 mục; icon ►/▼ hoặc +/- dễ nhận hơn chữ "Mở rộng"; tiêu đề như câu hỏi/tóm tắt (✅ "Miễn phí vận chuyển khi mua từ 500K?" ❌ "Thông tin vận chuyển"); nội dung ẩn > 300 từ tách trang riêng; cho mở nhiều accordion cùng lúc – tránh đóng cái cũ khi mở cái mới.

**Mobile**: nên dùng cho danh sách dài, form nhiều trường, tiết kiệm không gian; không dùng cho nội dung đọc liên tục, thông tin buộc phải xem (điều khoản, giá), < 5 mục. Tap target ≥ 48×48px; khoảng cách đủ rộng. Lỗi cần tránh: ẩn thông tin quan trọng (giá ship, điều kiện khuyến mãi); phụ thuộc JavaScript.

**Icon accordion**: ảnh hưởng trực tiếp nhận biết – người dùng mất 0.5–1 giây xác định có mở được nếu icon không rõ; 17% người dùng mobile bỏ qua nếu icon mờ/nhỏ. Hiệu quả: mũi tên ►/▼ (hiểu ngay có nội dung ẩn, hợp mọi thiết bị); +/- (rõ với người mới, tốt cho form đa tầng, ≥ 24×24px mobile). Không dùng: ⋯ (nghĩ là menu ngữ cảnh); hình vuông/circle đơn thuần; icon quá sáng tạo (bóng đèn, dấu hỏi). Kích thước tối thiểu mobile ≥ 32×32 kể cả khoảng trống, desktop ≥ 24×24; animation xoay 90° hoặc fade 0.2–0.3s; màu nổi bật với nền; luôn đặt bên phải tiêu đề (LTR).

## 2. Tabs

Tabs cho phép chuyển giữa các phần nội dung trong cùng khu vực hiển thị.

**Khi dùng**: nội dung dài chia nhóm rõ; số nhóm ít (2–5); nhãn ngắn gọn; người dùng không cần xem đồng thời nhiều nội dung (cần so sánh → tabs không phù hợp).

**Thiết kế**: chỉ rõ tab được chọn (màu, gạch chân, icon); tab chưa chọn vẫn dễ đọc – không làm mờ/ẩn; tab gần nội dung tương ứng; một hàng tab, tránh nhiều hàng; đặt phía trên nội dung; nội dung dùng nhiều nhất ở tab đầu và mặc định; nhóm bằng card sorting.

**Lưu ý**: không trộn navigation tabs (dẫn trang khác) với in-page tabs; nhất quán kiểu dáng và hành vi trong nhóm; mobile dễ chạm; hỗ trợ bàn phím (Enter/Space); ARIA roles.

**Tabs vs Accordion**: tabs – ít nhóm nội dung dài, cần chuyển nhanh/so sánh, giữ gọn gàng, hiển thị đồng thời các tiêu đề; accordion – nhiều nhóm ngắn (FAQ), tiết kiệm không gian mobile, chỉ xem một phần tại một thời điểm. Không kết hợp cả hai trong cùng khu vực. Lưu ý PDP: Baymard khuyên tránh horizontal tabs làm bố cục chính (xem checklist PDP).

## 3. Carousel

**Lợi ích**: tiết kiệm không gian; giải quyết xung đột nội bộ (các bộ phận chia sẻ không gian homepage).
**Hạn chế**: người dùng thường bỏ qua, đặc biệt slide sau; hiểu sai về tổ chức nếu chỉ xem một slide không đại diện.
**Khi dùng hero image tĩnh thay carousel**: cần tập trung thông điệp; tránh phân tán.
**Hướng dẫn**: hạn chế tự chuyển slide – người dùng kiểm soát; điều khiển rõ; slide đầu chứa nội dung quan trọng nhất. Đánh giá sự cần thiết; A/B test với ảnh tĩnh; tối ưu mobile.
**Mobile**: vấn đề khả năng khám phá (không nhận ra carousel nếu thiếu dot/mũi tên; có thể cuộn qua trước khi slide đổi) và truy cập tuần tự (phải duyệt từng mục) → người dùng phải tiếp cận mục cuối trong 3–4 bước; nội dung quan trọng ở đầu; chỉ báo rõ; điều khiển vuốt/chạm triển khai đúng.

## 4. Bảng so sánh

Cột = sản phẩm/dịch vụ, hàng = thuộc tính. Hữu ích khi quyết định dựa trên so sánh nhiều thuộc tính của ít lựa chọn: thiết bị điện tử, ô tô, dịch vụ, cấp thành viên, gói giá, tính năng app, học phí, địa điểm.
**Không dùng** khi quá nhiều lựa chọn/thuộc tính; người dùng không cần so sánh chi tiết; danh sách/mô tả hiệu quả hơn.
**Loại**: tĩnh (cố định) và động (người dùng chọn/filter để so sánh).
**3 quy tắc**: Đơn giản (chỉ thuộc tính quan trọng); Nhất quán (định dạng, đơn vị, diễn đạt); Đầy đủ thông tin (chính xác, không mơ hồ).
**Lưu ý**: 3–5 mục so sánh; làm nổi bật khác biệt; tập trung thông tin quyết định; ngôn ngữ đơn giản; mobile khoá tiêu đề hoặc cho chọn xem một phần dữ liệu.

## 5. Overlays / Lightbox

Overlay (lightbox, modal) xuất hiện trên nội dung chính. Lạm dụng gây: gián đoạn luồng (bất ngờ, không liên quan); khó điều hướng/đóng; ảnh hưởng accessibility (bàn phím, thiết bị hỗ trợ).
**Khi dùng**: xác nhận hành động không hoàn tác (xoá dữ liệu); thu thập thông tin cần thiết trước khi tiếp tục; cảnh báo khẩn.
**Nguyên tắc**: nút đóng rõ ("X"/"Đóng"); đóng bằng Escape, điều hướng bằng bàn phím; vị trí dễ nhìn (trung tâm); không dùng cho nội dung dài/phức tạp – dùng trang riêng. Đánh giá sự cần thiết; A/B test với trang riêng; tối ưu mobile.

## 6. 10 xu hướng popup gây khó chịu & giải pháp

1. Entry popup (hiện ngay khi load) → đợi 5–10 giây hoặc khi scroll.
2. Sign-up wall chặn nội dung → cho xem trước, chỉ yêu cầu login khi cần (lưu dữ liệu).
3. Full-page interstitial (đặc biệt mobile) → banner nhỏ hoặc tích hợp tự nhiên.
4. Scroll hijacking để hiện popup → không can thiệp điều hướng.
5. Stacked modals → 1 lớp, 1 nhiệm vụ/ngữ cảnh.
6. Khó đóng (× nhỏ, mờ, không hoạt động) → nút đóng dễ thấy, dễ nhấn, nhất là mobile.
7. Nội dung không liên quan → personalize theo hành vi.
8. Làm mờ nền quá mức → giảm độ mờ hoặc viền rõ.
9. Popup trên trang 404 → ưu tiên hướng về trang chủ/tìm kiếm.
10. Hỏi feedback quá sớm → chỉ sau khi hoàn thành tác vụ quan trọng.

**Thay thế**: inline elements (form cuối bài, section đăng ký); trigger theo ngữ cảnh (exit-intent, đọc xong nội dung, scroll 60–80%, xem 3 sản phẩm); non-modal (banner, tooltip).
**Nguyên tắc**: KISS; đúng thời điểm – trigger theo hành vi không theo thời gian; dễ thoát – đóng trong 1 lần nhấn; tối ưu mobile. Popup cần tiêu đề rõ, nội dung < 50 từ, CTA cụ thể.
**Ví dụ trang bán hàng**: thay popup giảm giá ngay khi vào → banner nhỏ sau khi xem 3 sản phẩm; popup đăng ký → form đơn giản cuối trang khi scroll 80%.

## 7. Needy design patterns (5 mẫu gây phiền)

- Permission begging: xin quyền (vị trí, thông báo) khi mở app → chỉ hỏi khi cần tính năng; giải thích lợi ích trước.
- Disguised ads: nút "Tải xuống" giả, "Bài viết liên quan" là quảng cáo → tách biệt, dán nhãn; không "Skip ad" quá nhỏ.
- Subscription nagging: nhắc đăng ký nhiều lần dù đã từ chối → tối đa 1 lần/phiên; lưu trạng thái bằng cookie; nút "Tôi không quan tâm" rõ.
- Confirmshaming: "Không, tôi không muốn tiết kiệm tiền" → từ ngữ trung lập "Không, cảm ơn".
- Fake urgency: "chỉ còn 1 phút" không thật → chỉ dùng khi thật; không đếm ngược vô hạn.
Nguyên tắc: User Control (quyền từ chối/tắt); Transparency (rõ mục đích: "Chúng tôi cần vị trí để hiển thị nhà hàng gần bạn"); Frequency Capping (≤ 1 lần/ngày).

## 8. Exit-intent popup

Hiện khi phát hiện người dùng chuẩn bị rời (chuột lên thanh địa chỉ, tab mới). Mục đích giữ chân bằng ưu đãi/CTA ("Bạn muốn rời đi? Nhận ngay 10% giảm giá!").
**Ưu**: tăng chuyển đổi với đúng đối tượng (đã xem sản phẩm chưa mua); giảm thoát.
**Rủi ro**: phiền khi vô tình di chuột ra ngoài → kết hợp nhiều tín hiệu (thời gian, scroll); nội dung chung chung ("Đăng ký newsletter") khi người dùng tìm thông tin cụ thể → personalize ("Bạn muốn lưu giỏ hàng trước khi thoát?"); làm chậm đóng trang, khó chịu mobile → tránh mobile hoặc tối ưu load.
**Nên dùng**: người dùng đã tương tác tích cực (> 3 sản phẩm, > 2 phút); giá trị rõ (ưu đãi có điều kiện, checklist tải miễn phí); desktop.
**Tránh**: trang nội dung dài (blog, tin tức); người mới vào < 10 giây; mobile/tablet.
**Thiết kế**: tiêu đề + CTA ngắn ("Thoát? Giỏ hàng của bạn vẫn được lưu!"); nút × rõ, không bắt nhập email để thoát; trigger thông minh (scroll 70%, inactive 30 giây).

## 9. Scrolling & scrollbars

95% người dùng cuộn dọc ngay khi truy cập; 70% lượt truy cập từ mobile, cuộn bằng tay chủ đạo.
**5 nguyên tắc**: luôn hiển thị scrollbar (ẩn như macOS khiến không biết độ dài trang; hiện mờ khi không dùng; đủ rộng ≥ 10px desktop); tránh scroll hijacking (chỉ custom khi thật cần như trình chiếu ảnh ngang; test cả desktop/mobile); ưu tiên cuộn dọc (ngoại lệ: gallery ảnh, timeline/biểu đồ, bảng so sánh); infinite scroll phù hợp nội dung không kết thúc/khám phá – pagination tốt hơn khi cần định vị (kết quả tìm kiếm) hoặc có điểm dừng tự nhiên (danh mục trang 1/10); tín hiệu cuộn (mũi tên, "Scroll down", gradient fade, một phần nội dung "lửng" cuối màn hình đầu).
**Mobile**: khoảng cách interactive element ≥ 40px; tránh scroll lồng (ngang trong dọc); không đổi tốc độ cuộn.
**Sai lầm**: ẩn scrollbar để "sạch"; kết hợp scroll hijacking + popup (cuộn → popup → mất vị trí đọc); quên test đa trình duyệt.

## 10. Cuộn ngang (horizontal scrolling)

Trái thói quen cuộn dọc; chỉ 16% người dùng desktop tự phát hiện cuộn ngang khi không có gợi ý trực quan.
**Nên dùng**: gallery ảnh/video (product thumbnails; peek item tiếp theo; mũi tên/dot); bảng dữ liệu (cố định hàng/cột tiêu đề; màu phân biệt dòng); timeline (mũi tên nối mốc; rõ điểm đầu/cuối); mobile-first (thẻ credit card dạng cuộn ngang; swipe tự nhiên; 3–5 item visible); feature showcase (progress indicator bước 1/5; nhảy đến slide bất kỳ).
**4 sai lầm**: ẩn thanh cuộn ngang (84% không phát hiện nội dung ẩn → luôn hiện scrollbar hoặc arrow); kết hợp ngang + dọc cùng trang (tách section, dùng tab); item quá rộng (không vượt 80% viewport width); scroll jacking (chỉ kích hoạt cuộn ngang khi hover/touch khu vực cụ thể).
**Visual affordance**: ít nhất 2 trong: mũi tên; một phần item tiếp theo ló vào viewport; dots; scrollbar luôn hiển thị. Mobile: ưu tiên swipe; snap-to; touch target ≥ 48px.
**Tránh**: nội dung dài đọc liên tục; form nhiều trường; trang chủ cần truyền thông điệp ngay.

## 11. Infinite scrolling

Tự tải thêm khi cuộn đến cuối, không điểm dừng.
**Nên**: mạng xã hội (khám phá liên tục); gallery ảnh (Pinterest, Unsplash – serendipity); tìm kiếm khám phá không mục tiêu cụ thể; dashboard dữ liệu thời gian thực.
**Tránh**: nội dung có điểm kết thúc rõ (trang e-commerce 20 item → pagination/Load More); trang cần footer quan trọng (footer không bao giờ thấy → sticky footer/anchor); ứng dụng cần "lưu vị trí" (truyện dài, tài liệu → chương/bookmark); mobile kết nối yếu (tốn data, lag → giới hạn số item); trang quảng cáo theo impression (ad cuối trang không hiện → chèn ad unit cách cố định).
**3 lỗi phổ biến**: không "emergency stop" (thêm Pause/Back to Top); thiếu progress indicator ("Đã tải 50+ items"); phá tính năng browser – không lưu vị trí scroll khi quay lại (dùng History API / session storage).
**Triển khai**: desktop – scrollbar dài + tiêu đề section, keyboard shortcut; mobile – swipe mượt, pre-load khi còn cách đáy 300px; SEO – crawler index được, structured data phân trang ảo.
**E-commerce**: Load More thay infinite scroll cho danh mục; infinite scroll chỉ cho "Sản phẩm bạn có thể thích". Infinite scroll là dao hai lưỡi – dùng khi nội dung không kết thúc, người dùng ở trạng thái khám phá, đã giải quyết footer & performance.

## 12. Scrolljacking

Ghi đè hành vi cuộn mặc định bằng hiệu ứng/đường dẫn cuộn tùy chỉnh (storytelling, trình diễn sản phẩm).
**3 vấn đề**: mất kiểm soát (không ước lượng độ dài, không nhảy đến vị trí, không điều chỉnh tốc độ); khó khăn thể chất (parallax quá mức gây chóng mặt, mỏi mắt); xung đột thói quen – 92% người dùng bối rối khi scroll không như mong đợi.
**4 trường hợp chấp nhận**: landing sản phẩm cao cấp (iPhone/MacBook); storytelling tuyến tính (báo cáo thường niên); portfolio sáng tạo (đối tượng muốn "wow"); VR/AR preview (cảnh báo trước).
**5 nguyên tắc an toàn**: opt-out ("Skip Animation"); giữ scrollbar; tốc độ ≤ 3 giây/hiệu ứng, không delay input; Page Up/Down vẫn hoạt động; test mobile – nhẹ (< 2MB), ổn định FPS.
**Thay thế**: progressive disclosure khi cuộn tự nhiên; anchor links; hover-triggered animation. Đa số website nên ưu tiên cuộn tự nhiên, tải nhanh, người dùng kiểm soát hoàn toàn.

## 13. Scroll fading

Hiệu ứng mờ/zoom/slide nội dung khi cuộn; mục đích kể chuyện, nhấn mạnh, giảm cảm giác tĩnh.
**Ưu**: hướng dẫn người dùng (text mờ dần để tập trung ảnh); giảm tải nhận thức (hiện từng phần); tăng tính tương tác.
**Nhược**: phân tâm nếu phức tạp; ảnh hưởng hiệu suất mobile; khó kiểm soát – người dùng muốn xem nhanh bị buộc chờ.
**4 nguyên tắc**: tinh giản (chỉ tiêu đề, ảnh, CTA; không toàn trang); tốc độ < 0.5 giây; dự đoán được (text mờ → ảnh hiện); tương thích (@supports fallback; tắt khi prefers-reduced-motion).
**Công cụ**: AOS, ScrollMagic; CSS @keyframes + scroll-snap; IntersectionObserver API.
**Nên**: landing sản phẩm cao cấp; storytelling; tutorial từng bước. **Tránh**: trang nội dung dài; người dùng lớn tuổi hoặc ưu tiên tốc độ; thiết bị yếu. Ưu tiên mục đích rõ (không chỉ vì "đẹp"), tải nhanh, nhất quán mọi thiết bị.
