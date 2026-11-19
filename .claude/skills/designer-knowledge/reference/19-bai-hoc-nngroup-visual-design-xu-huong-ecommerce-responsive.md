---
title: Bài học NN/g – Thiết kế trực quan web, xu hướng (tối giản, Flat 2.0, dark mode), e-commerce (list, ảnh, biến thể, filter, store locator), đa nền tảng & responsive
type: Bài học
scope: Nguyên lý thị giác và quyết định responsive cho theme; tham chiếu khi chọn hướng thẩm mỹ, breakpoint, phân bổ nội dung giữa thiết bị
source: Sheet "Tài liệu nghiên cứu UIUX" mục 8 (Web Visual Design), 9 (Web-Design Trends), 10 (Web Ecommerce), 11 (Trải nghiệm đa nền tảng) (NGHIÊN CỨU UX_UI.xlsx)
---

# Bài học NN/g – Visual design, xu hướng, e-commerce, responsive

## A. Web Visual Design

### 1. Cân bằng trong thiết kế
- Symmetry (đối xứng): yếu tố xếp đều quanh trục; cảm giác ổn định, trật tự; phù hợp site cần tin cậy, truyền thống (ngân hàng, chính phủ).
- Asymmetry (bất đối xứng): yếu tố không giống nhau nhưng tổng thể cân bằng; năng động, hiện đại; phù hợp thời trang, công nghệ.
- Radial (xuyên tâm): xếp quanh điểm trung tâm; hướng chú ý vào trung tâm; phù hợp nhấn CTA hoặc biểu tượng quan trọng.
- Chọn loại cân bằng theo cảm xúc muốn truyền tải; có thể kết hợp; test với người dùng.

### 2. 7 mẹo hình ảnh dễ nhớ (tóm tắt)
Ảnh phù hợp nội dung; tránh stock không chân thực; sản phẩm trong bối cảnh thực; ảnh gần nội dung liên quan; ảnh hỗ trợ nội dung, không chỉ trang trí; chất lượng và độ phân giải phù hợp; kiểm tra phản hồi người dùng. (Chi tiết áp dụng trong file quy tắc nhóm 7.)

### 3. 5 phương pháp trực quan cải thiện accessibility
Tương phản màu; không chỉ dựa vào màu; nổi bật yếu tố tương tác; alt text; truy cập bàn phím với focus rõ. (Chi tiết trong file quy tắc nhóm 6.)

### 4. Tương phản text trên ảnh
Tỷ lệ ≥ 4.5:1 (3:1 với chữ ≥ 18pt); overlay hoặc shadow; ảnh nền đơn giản/có vùng trống; kiểm tra bằng công cụ và trên nhiều thiết bị; tránh text trên ảnh phức tạp.

### 5. Aesthetic-Usability Effect
Giao diện đẹp được đánh giá dễ dùng hơn thực tế → tạo ấn tượng tốt, tăng chấp nhận lỗi nhỏ, nhưng che giấu vấn đề usability và làm sai lệch kết quả test. Cân bằng thẩm mỹ – chức năng; test usability thực tế; lắng nghe phản hồi.

### 6. 5-Second Test
Cho xem giao diện 5 giây rồi hỏi: Bạn nghĩ đây là trang gì? Nhớ được yếu tố nào? Sẽ làm gì tiếp? Đánh giá ấn tượng ban đầu và hiệu quả truyền đạt (tiêu đề, CTA, nội dung chính). Nhanh, rẻ, phát hiện vấn đề sớm.

### 7. Squint Test
Nheo mắt/làm mờ để chỉ còn khối màu và hình dạng chính → đánh giá yếu tố quan trọng (tiêu đề, CTA) có nổi bật; kiểm tra cân bằng; phát hiện yếu tố gây nhiễu. Không cần công cụ, làm bất cứ lúc nào; nếu yếu tố quan trọng không nổi bật → điều chỉnh kích thước, màu, vị trí. (Áp dụng audit: blur test trên Figma/Photoshop cho từng section.)

## B. Web-Design Trends

### 1. Tối giản (Minimalism)
- Nguồn gốc: Bauhaus, De Stijl, thiết kế Thuỵ Sĩ; "Less is more" (Mies van der Rohe). Trong web: phản ứng với sự lộn xộn đầu 2000s; giúp tập trung nội dung chính, cải thiện đọc và điều hướng.
- Nguyên tắc: loại bỏ yếu tố không cần thiết; khoảng trắng hiệu quả; màu hạn chế; kiểu chữ rõ.
- 5 đặc điểm: Flat design; bảng màu hạn chế (2–3 màu chính); ít UI elements; không gian âm (negative space); nội dung tối giản, rõ.

### 2. Flat design → Flat 2.0
- Flat (phổ biến ~2012: Windows 8, iOS 7, Android): 2 chiều, màu đơn giản, bỏ bóng/độ dốc. Vấn đề: thiếu signifier → người dùng không biết nút/link nào tương tác được.
- Flat 2.0: giữ tối giản nhưng thêm bóng tinh tế, viền, đổi màu khi hover để có dấu hiệu tương tác. Khuyến nghị: yếu tố tương tác luôn có dấu hiệu rõ; test usability; cân bằng thẩm mỹ – chức năng.

### 3. Dark mode vs light mode
- Light: hiệu suất thị giác tốt hơn với người thị lực bình thường; đọc nhanh, chính xác hơn (đen trên trắng > trắng trên đen).
- Dark: dễ chịu với người đục thuỷ tinh thể, nhạy sáng; tiết kiệm pin OLED; giảm ánh sáng xanh. Nhược: giảm hiệu suất đọc, nhất là chữ nhỏ; khó dùng nơi sáng mạnh.
- Người dùng thích dark mode vì thẩm mỹ/giảm mỏi mắt nhưng không thiết yếu; thiết lập ở cấp hệ điều hành và mong app tôn trọng. Vấn đề cần tránh: không theo cài đặt hệ thống; không kiểm tra thiết kế ở dark mode (chữ khó đọc, màu sai); không có tuỳ chọn chuyển đổi.
- Khuyến nghị: cung cấp tuỳ chọn; tuân theo hệ thống; tối ưu màu/tương phản/kiểu chữ cho từng chế độ; kiểm tra cả hai.

## C. Web Ecommerce

### 1. Homepage, category page, listing page
- Homepage: ấn tượng đầu, giới thiệu thương hiệu, dẫn đến khu vực quan trọng; tập trung ưu đãi nổi bật, sản phẩm mới, bộ sưu tập, chiến dịch; cập nhật thường xuyên.
- Listing page: hiển thị sản phẩm theo danh mục; dễ duyệt, so sánh; có lọc/sắp xếp; ảnh chất lượng, giá và tên nổi bật; tải nhanh; thông tin ngắn gọn.
- Trang danh mục truyền thống (phân cấp rõ, dễ duyệt nhưng có thể quá tải) vs kết hợp (list + filter + search + sản phẩm liên quan; linh hoạt hơn nhưng cần test kỹ).

### 2. Giải phẫu một mục trong danh sách (list entry)
Tiêu đề/tên (quan trọng nhất); mô tả ngắn; hình ảnh/icon; thông tin bổ sung (giá, đánh giá). Nguyên tắc: nhất quán cấu trúc mọi mục để so sánh; rõ ràng, tránh thuật ngữ; tương thích thiết bị; scannability. Test với người dùng thực, tối ưu mobile, cập nhật thông tin.

### 3. 6 mẹo ảnh sản phẩm trên listing page
1. Ảnh lớn, rõ, độ phân giải cao, chiếm phần lớn không gian; ảnh nhỏ/mờ giảm tin tưởng.
2. Nhất quán phong cách: cùng nền, ánh sáng, góc chụp.
3. Ảnh cụ thể, chi tiết: chất liệu, màu, kích thước; tránh ảnh mơ hồ.
4. Hover state: phóng to hoặc đổi góc nhìn khi di chuột.
5. Đa dạng góc: trước, sau, bên; ảnh trong bối cảnh thực tế.
6. Tối ưu mobile: tải nhanh, không quá nặng.

### 4. Bán sản phẩm nhiều biến thể
Mỗi sản phẩm khác biệt (áo sơ mi vs áo phông) có trang riêng; biến thể (màu, size) trong cùng một trang với lựa chọn rõ; ảnh đại diện từng biến thể; thông tin chi tiết từng biến thể (kích thước, chất liệu, bảo quản); tồn kho theo từng biến thể để không chọn cái đã hết.

### 5. Thay thế phân trang
Infinite scroll (liền mạch nhưng khó định vị, không phù hợp mọi nội dung); Load More (người dùng kiểm soát, phù hợp danh sách dài); phân trang tích hợp trong cuộn dài (giữ định vị). Lưu ý: khả năng tìm/điều hướng tới sản phẩm cụ thể; hiệu suất tải; phản hồi người dùng.

### 6. Người mẫu đa dạng
Người dùng thấy người mẫu tương đồng (ngoại hình, tuổi, chủng tộc, kích cỡ) → dễ liên hệ, tin tưởng, tự tin quyết định; tăng chuyển đổi, hình ảnh thương hiệu tích cực, mở rộng khách hàng. Áp dụng demo: thêm nhiều màu da, tạng người; nhất quán cách trình bày.

### 7. Filter theo ý định người dùng
Khám phá → filter rõ, dễ duyệt; tìm cụ thể → thu hẹp nhanh. Tránh gián đoạn: không reload quá sớm/đổi vị trí trang khi lọc; phản hồi ngay khi chọn/bỏ filter; tối ưu mobile.
Danh mục và giá trị filter hữu ích: phù hợp đặc điểm sản phẩm; dễ dự đoán; không thuật ngữ chuyên ngành; ưu tiên hợp lý (phổ biến/quan trọng trước); nhóm filter liên quan; giá trị rõ không nhầm lẫn; cập nhật theo phản hồi.

### 8. Tình hình e-commerce search
Tìm kiếm dễ và chính xác hơn nhờ gợi ý tự động và facets; tìm kiếm ngữ nghĩa hiểu ý định; search trong app mobile ngày càng quan trọng. Khuyến nghị: gợi ý tự động thông minh theo ngữ nghĩa; filter hiệu quả (giá, brand, đánh giá); tối ưu mobile.

### 9. Store locator
Người dùng vẫn cần link tìm cửa hàng: dễ truy cập, không rời trang hiện tại. Đặt link dễ thấy; kết quả có địa chỉ, số điện thoại, giờ mở cửa, dịch vụ; mượt trên mobile.

## D. Trải nghiệm đa nền tảng & Responsive

### 1. Thiết kế cho 3 (5) màn hình – transmedia
- Mobile: màn nhỏ, dùng ngắn, chạm; nội dung cô đọng, chức năng chính dễ truy cập (thông báo, tìm nhanh).
- Tablet: cân bằng, phù hợp đa phương tiện, tận dụng không gian lớn hơn.
- TV: màn lớn, khoảng cách xa, remote; tập trung hình ảnh/video, hạn chế text.
- Nguyên tắc: nhất quán thương hiệu và flow xuyên thiết bị; tối ưu theo ngữ cảnh (mobile: check-in, thanh toán nhanh; TV: giải trí); chuyển đổi mượt giữa thiết bị. Cần user research hành vi từng thiết bị; adaptive design.

### 2. Thiết bị lớn được ưa chuộng cho nhiệm vụ quan trọng
- Lợi thế màn lớn: hiển thị nhiều thông tin (so sánh, tài liệu dài), ít cuộn; thao tác chuột/bàn phím ít lỗi, dễ nhập liệu phức tạp; tập trung tốt hơn.
- Người dùng chọn màn lớn khi: tác vụ phức tạp (thanh toán hoá đơn, đặt vé máy bay, nghiên cứu y tế/giáo dục); đa nhiệm; trải nghiệm hình ảnh (bản đồ, đồ hoạ, video).
- Hạn chế điện thoại: khó kiểm soát lỗi (nhấn nhầm khi thanh toán); "tunnel vision" – chỉ tập trung một phần, bỏ qua bối cảnh.

### 3. Responsive Web Design (RWD)
- 3 nguyên tắc: Fluid grids (đơn vị % thay pixel; 3 cột desktop → 1 cột mobile); Flexible images (max-width: 100%, tự thu/crop); Media queries (quy tắc CSS theo kích thước; ẩn menu phức tạp trên mobile).
- Lợi ích: 1 bộ code, dễ bảo trì; SEO (Google ưu tiên responsive); nhất quán thương hiệu.
- Thách thức: hiệu suất (ảnh desktop lớn không cần cho mobile); khác biệt ngữ cảnh (mobile ưu tiên nút khác, ví dụ "Gọi ngay").
- Mobile-first; test đa thiết bị (Chrome DevTools, thực tế); nén ảnh, lazy loading, giảm HTTP requests.

### 4. Breakpoints
- Là ngưỡng kích thước màn hình nơi bố cục thay đổi (768px tablet, 1024px desktop).
- Không nên dựa trên thiết bị cụ thể (iPhone 375, iPad 768) – hơn 24.000 kích cỡ màn hình, nhanh lỗi thời. Nên dựa trên nội dung (content-defined): thêm breakpoint khi bố cục vỡ (chữ tràn, nút quá gần, ảnh méo/crop sai).
- Quy trình: bắt đầu mobile-first → mở rộng viewport đến khi giao diện vỡ → đặt breakpoint → lặp đến desktop.
- Nguyên tắc: 3–5 breakpoints; dùng min-width thay max-width; ưu tiên trải nghiệm thực tế; test với dữ liệu thật.
- Checklist: xác định thành phần dễ vỡ nhất (navigation, images, forms); test ≥ 5 kích cỡ phổ biến; khoảng cách giữa các breakpoint ≥ 100px; kiểm tra hiệu suất sau mỗi lần thêm.
- Sai lầm: quá nhiều breakpoint (khó bảo trì); chỉ dựa thiết bị; bỏ qua trải nghiệm.

### 5. Scaling user interfaces – quy tắc 80/20
- 80% nội dung giống nhau giữa các phiên bản; 20% điều chỉnh theo ngữ cảnh thiết bị.
- 3 cấp ưu tiên: chức năng cốt lõi (luôn hiển thị); tính năng phụ (adaptive); nội dung thứ cấp (có thể ẩn).

### 6. Câu hỏi khi làm responsive (Don't Make Me Think)
- Người dùng thực sự cần gì khi dùng mobile? Cái gì không cần trên mobile? Cái gì đưa xuống sâu hơn hoặc ẩn?
- Có lúc mobile phải khác hẳn desktop, nhưng giữ branding, terminology nhất quán để không bối rối.
- Hình ảnh lớn trên màn nhỏ: xoá, thay đổi kích thước hoặc sắp xếp lại (NN/g Big Pictures Small Screens). Lưu ý tác động tiêu cực của mobile-first lên desktop – content dispersion (NN/g) – không để desktop quá thưa, lãng phí không gian.
