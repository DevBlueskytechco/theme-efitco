---
title: Bài học NN/g – Nội dung web, Link usability, Điều hướng (menu, mega menu, logo, breadcrumb, footer, IA)
type: Bài học
scope: Cách viết và tổ chức nội dung trên theme/demo; cách thiết kế link, menu, breadcrumb, footer
source: Sheet "Tài liệu nghiên cứu UIUX" mục 4 (Content on the Web), 5 (Link Usability), 6 (Web Navigation) (NGHIÊN CỨU UX_UI.xlsx); sheet "Note task"
---

# Bài học NN/g – Nội dung web, Link, Điều hướng

## A. Content on the Web

### 1. Bố cục hay nội dung có trước?
- Người dùng nhớ nội dung, không nhớ layout: sau 1 tuần 87% nhớ thông tin chính, chỉ 23% nhớ cách bố trí → ưu tiên content hierarchy hơn visual aesthetics.
- Layout tốt nhất là layout "vô hình" – người dùng tập trung hoàn toàn vào nội dung (Wikipedia tỷ lệ đọc cao hơn 5x site sáng tạo).
- Thiết kế phục vụ mental model: nút "Submit" đẹp nhưng vị trí bất thường → giảm 40% conversion.
- Quy trình 5 bước: xác định mục tiêu nội dung ("người dùng cần làm/biết gì ở trang này?") → thiết kế information architecture theo priority, không theo visual balance → áp dụng F/Z pattern cho điểm nóng → 5-second test → tinh chỉnh visual sau cùng (màu, khoảng cách hỗ trợ hierarchy, không gây nhiễu).
- E-commerce tốt: ảnh + giá + CTA trong viewport đầu; review ngay dưới fold (không giấu trong tab). Xấu: hero banner full-screen che quick links; màu nền làm description khó đọc.
- Công cụ: content-first wireframing (Balsamiq, Whimsical); eye-tracking heatmap (Hotjar); Hemingway Editor.

### 2. Mini-IA – cấu trúc thông tin trong từng module
- Progressive disclosure: ẩn advanced options; hiện field phụ khi chọn option liên quan.
- Logical grouping theo task flow, dùng card/container; lỗi thường gặp: nhóm theo technical categories.
- Consistent placement: action buttons luôn cùng vị trí; filter luôn trên cùng bảng dữ liệu (tiết kiệm 23% thời gian).
- Task-oriented labels: "Gửi phê duyệt" thay "Thao tác hệ thống".
- Checklist: mỗi screen ≤ 7 nhóm thông tin; nhãn ≤ 3 từ; visual separator giữa nhóm; action button cùng vị trí. "Mini-IA tốt nhất là khi người dùng không nhận ra nó tồn tại."

### 3. Chunking
- Chia nội dung thành khối nhỏ có ý nghĩa; não xử lý 4±1 mục cùng lúc.
- Lợi ích: tăng 47% đọc hiểu; giảm 80% lỗi form khi chia bước; cải thiện 35% tốc độ scan mobile; tăng recall sau 24 giờ.
- 5 nguyên tắc: quy tắc 7±2 (menu chính ≤ 7 mục, filter ≤ 7 options); nhóm theo ngữ cảnh (chức năng / đối tượng / tác vụ); visual hierarchy (whitespace, h2–h4, bullet/numbering); progressive disclosure ("Xem thêm" cho mô tả dài); mobile đơn giản hơn desktop (1 chunk/1 màn hình).
- Ví dụ: form 15 field → 72% bỏ dở; chia 3 chunk (Thông tin cơ bản → Xác thực → Thanh toán) → 28%. Danh mục: nhóm theo category, mỗi nhóm ≤ 6 sản phẩm, card layout.
- Checklist: đoạn ≤ 3 dòng (mobile); danh sách ≤ 7 mục; separator giữa chunk; tiêu đề chunk rõ nghĩa.

### 4. 7 mẹo trình bày bulleted list
Tăng 47% khả năng scan so với đoạn dày đặc.
1. Giới hạn số mục: tối ưu 5–7, tối đa 10 (nhiều hơn dùng sub-list).
2. Mục ngắn: desktop ≤ 1 dòng, mobile ≤ 10 từ. Tốt: "Tiết kiệm 30% điện năng". Xấu: "Sản phẩm này được thiết kế để giúp bạn tiết kiệm khoảng 30% điện năng so với các model cũ".
3. Bắt đầu bằng từ khoá: "[Ưu đãi] Giảm 40% tháng 12" thay "Trong tháng 12 này, chúng tôi dành tặng ưu đãi giảm 40%".
4. Cấu trúc song song: "Tự động bật/tắt – Kết nối Bluetooth – Chống nước IP68" (không trộn "Có thể tự động bật/tắt – Bluetooth – Khả năng chống nước tốt").
5. Visual hierarchy: khoảng cách giữa các mục 1.5x line-height; giữa danh sách và nội dung khác 2x line-height; • cho danh sách thường, ▪ cho sub-item. Áp dụng: xem lại line-height của heading.
6. Tối đa 2 cấp lồng.
7. Mobile: left padding 40px → 20px; bullet 6px → 10px.
Áp dụng: sửa lại content promotion banner theo 7 mẹo này.

### 5. CTA "Get Started" và link "Learn More"
- "Get Started" không cụ thể, gây hiểu lầm phải đăng ký/cam kết, tạo rào cản. Thay bằng: "Xem bản demo", "Tải tài liệu", "Đăng ký miễn phí", "Tìm hiểu thêm" (có đối tượng cụ thể). Người dùng phải biết chính xác điều gì xảy ra khi click; kèm mô tả ngắn hỗ trợ.
- "Learn More" thiếu thông tin cụ thể; khó scan; screen reader không có ngữ cảnh. Thay bằng "Tìm hiểu về giá cả", "Xem hướng dẫn sử dụng", "Khám phá tính năng mới". Link phải đứng độc lập được, bắt đầu bằng từ khoá chính, ngắn gọn.

### 6. Hai từ đầu tiên là tín hiệu cho mắt quét
- Người dùng hiểu nội dung link/tiêu đề chỉ bằng 11 ký tự đầu. Đặt từ khoá quan trọng ở đầu; tránh "Tìm hiểu thêm", "Nhấp vào đây"; dùng "Xem hướng dẫn sử dụng", "Tải báo cáo miễn phí". A/B test tiêu đề.

### 7. Hình ảnh trang trí vs hình ảnh thông tin
- 3 loại: informational (biểu đồ, sơ đồ), functional (icon, nút), decorative (thẩm mỹ, không thông tin).
- Ảnh trang trí có thể gây hại: phân tâm, chậm tải, hiểu lầm. Dùng ảnh có mục đích; phù hợp ngữ cảnh; tối ưu hiệu suất; kiểm tra accessibility.
- Ảnh như nội dung web: người dùng tập trung vào ảnh có thông tin (ảnh sản phẩm rõ, biểu đồ, minh hoạ quy trình); ảnh trang trí bị bỏ qua; đặt ảnh gần nội dung liên quan.
- Bố cục zigzag ảnh–text: thẳng hàng hiệu quả hơn khi ảnh ít giá trị thông tin, hỗ trợ F-pattern; zigzag hấp dẫn nhưng gây phân tâm nếu ảnh chỉ trang trí; ảnh chứa thông tin quan trọng thu hút bất kể bố cục → dùng ảnh giá trị cao trong zigzag; ưu tiên thẳng hàng cho trang cần scan nhanh (danh sách sản phẩm); A/B test.

## B. Link Usability

- **Một liên kết là một lời hứa**: link chung chung ("Click here") gây khó; link mô tả ("Hướng dẫn iPhone 13") tăng điều hướng, UX, SEO. Dùng link 2–5 từ mô tả rõ nội dung đích; từ khoá chính đầu link, nổi bật (màu, gạch chân); nội dung đích khớp link.
- **Trực quan hoá liên kết**: gạch chân là tiêu chuẩn vàng cho link văn bản, không dùng cho nội dung không phải link; màu khác biệt (thường xanh dương), tương phản cao, không dùng màu đã dùng cho text thường; hover/active/visited rõ; không dùng gạch chân/màu link cho nội dung không nhấp được; đồng nhất toàn site; mobile tăng vùng chạm, gạch chân rõ.
- **Beyond blue links – yếu tố nhấp được dễ nhận biết**: vùng nhấp tối thiểu 44×44px; dấu hiệu trực quan (gạch chân, viền rõ, màu tương phản, hover/active); nhãn cụ thể ("Thêm vào giỏ hàng" thay "Tiếp tục"/"OK"); đồng nhất kiểu dáng; không dùng kiểu nút/link cho yếu tố không nhấp được. A/B test kích thước (44 vs 60px) và màu.
- **Đổi màu link đã truy cập**: giúp định hướng (biết trang đã xem, tránh lặp/bỏ sót); giảm tải nhận thức; hiệu quả với trang nhiều link (kết quả tìm kiếm, danh sách sản phẩm). Chưa truy cập xanh dương, đã truy cập tím hoặc xám; đủ tương phản. Áp dụng theme: thêm style :visited cho thẻ a.

## C. Web Navigation

### 1. 17 nguyên tắc thiết kế menu
1. Hiển thị điều hướng trên màn hình lớn. 2. Đặt menu ở vị trí quen thuộc (đầu trang hoặc bên trái). 3. Màu link tương phản với nền. 4. Không ẩn menu sau icon/nút trên màn lớn. 5. Ngôn ngữ rõ, dễ hiểu. 6. Sắp xếp mục theo thứ tự hợp lý – quan trọng ở đầu hoặc cuối. 7. Nhóm và tiêu đề để tổ chức. 8. Dễ dùng trên mobile, hỗ trợ cảm ứng. 9. Icon nhất quán. 10. Phản hồi khi tương tác (đổi màu, trạng thái chọn). 11. Truy cập bằng bàn phím. 12. Tránh dropdown nhiều cấp. 13. Menu hiển thị nhanh, không trễ. 14. Hiệu ứng chuyển đổi tiết kiệm. 15. Test trên nhiều trình duyệt, thiết bị. 16. Có tìm kiếm nếu menu nhiều mục. 17. Kiểm tra và cập nhật menu thường xuyên.
Áp dụng theme: menu chính < 7 mục, không viết chung chung ("Sản phẩm 1, 2, 3"), có thể dùng mega menu; logo luôn link về trang chủ; có breadcrumbs và sticky header.

### 2. Mega menu
- Lợi ích: thấy toàn bộ cấu trúc nội dung cùng lúc; giảm số click; tăng khám phá; tổ chức nội dung phức tạp.
- Thiết kế: nhóm mục liên quan, tiêu đề rõ; ảnh/icon tiết kiệm – chỉ khi hỗ trợ hiểu; truy cập bằng bàn phím, tương thích screen reader; mobile chuyển sang accordion hoặc trượt ngang.
- Sai lầm: quá tải thông tin; thiếu nhất quán; không test đa thiết bị.
- Dùng khi: nhiều danh mục/sản phẩm (e-commerce); cần hiện nhiều tuỳ chọn; muốn tăng khám phá.
- Áp dụng theme: khi mở mega menu, làm mờ/thêm background đen cho trang nền; thêm link "Xem tất cả" ở đầu danh sách (cả mobile và desktop).

### 3. Vị trí logo
- Logo góc trên bên trái: người dùng nhớ logo cao hơn 89% so với bên phải; là nơi họ mong đợi để quay về trang chủ.
- Logo ở giữa: khó quay về trang chủ gấp 6 lần; giảm ghi nhớ thương hiệu. Tránh đặt logo giữa hoặc phải.
- Luôn link logo về trang chủ.

### 4. Breadcrumb
- Lợi ích: cung cấp bối cảnh vị trí trong cấu trúc; quay lại cấp trước không cần Back/menu; tiết kiệm click; chiếm ít không gian; hỗ trợ SEO.
- 11 nguyên tắc: hiển thị trên mọi trang có cấu trúc phân cấp; vị trí dễ thấy (trên tiêu đề hoặc dưới nav chính); phân tách rõ (>); không thay thế điều hướng chính; mọi mục (trừ cuối) có link; phản ánh đúng cấu trúc; nhãn rõ, ngắn; không chiếm nhiều không gian; mobile thiết kế lại (accordion hoặc trượt ngang); test đa trình duyệt/thiết bị; cập nhật thường xuyên.

### 5. Footer
- Simple footer: bản quyền, chính sách, điều khoản – site nhỏ, landing page.
- Fat footer: nhiều link đến danh mục, dịch vụ, công ty – site cấu trúc phức tạp.
- Contextual footer: link liên quan trực tiếp nội dung trang – trang sản phẩm, bài viết.
- Nguyên tắc: nhóm rõ; tiêu đề mô tả cho từng nhóm; nhất quán trên mọi trang; responsive.

### 6. 3 sai lầm IA (đều do mùi thông tin kém)
1. CTA mơ hồ: "Tìm hiểu thêm", "Khám phá ngay" → "Xem chi tiết về chính sách hoàn trả".
2. Ngôn ngữ song song cưỡng ép: ép mọi mục bắt đầu bằng động từ ("Khám phá sản phẩm", "Khám phá dịch vụ") → dùng "Sản phẩm", "Dịch vụ" tự nhiên.
3. Ngôn ngữ hội thoại mơ hồ: "Hãy bắt đầu hành trình của bạn" → "Đăng ký tài khoản mới".
Khuyến nghị: ngôn ngữ rõ, cụ thể; linh hoạt cách diễn đạt; kiểm tra và cập nhật ngôn ngữ thường xuyên.

## D. Nguyên tắc nội dung demo (từ Don't Make Me Think & UX for Beginners)

- Trang phải self-evident (không cần nghĩ để biết dùng) và self-explanatory (đoán được bằng quan sát).
- Đừng sáng tạo lại những gì đã quen thuộc; chỉ khác đi khi biết chắc tốt hơn và hiểu rõ giá trị cách cũ.
- Phân cấp thị giác: nổi bật thứ quan trọng; liên quan logic → liên quan thị giác; đóng gói phần cùng nhóm; làm rõ phần click được; giảm visual noise; format text/heading dễ đọc (heading khác biệt rõ, gần nội dung, đoạn ngắn, bullet).
- Hướng dẫn tính năng: tối thiểu, đúng vị trí/thời điểm, không để user bỏ lỡ.
- Giảm 50% từ → giảm tiếp 50%. Hạn chế mào đầu, chào hỏi, khách sáo, chỉ dẫn, đoạn dài khi không cần.
- Navigation phải: cho biết đang ở đâu; thấy gì có thể làm tiếp; tổng quan cấu trúc; cảm giác đáng tin, chuyên nghiệp.
- Không ép đăng ký/cung cấp thông tin quá sớm; form chỉ hỏi cái cần, mỗi câu hỏi có lý do.
- Thiết kế cho 3 nhóm hành vi: browsing, searching, discovery. CTA: "Verb + Benefit + Urgent Time/Place".
- Yếu tố tạo niềm tin: chuyên nghiệp, thành thật, rõ ràng. Thiết kế cho mọi người dùng, không chỉ một tệp.
- Thành phần có "sức nặng" hơn (tương phản màu, kích thước) thu hút chú ý; lặp lại thu hút và phá vỡ lặp lại cũng thu hút; có thể tận dụng căng thẳng thị giác nhẹ; căn chỉnh và khoảng cách thể hiện mối quan hệ; ảnh điều hướng sự chú ý sang thành phần khác.
- Cá nhân hoá: tạo cảm giác tiến triển; feedback loop và thử thách thăng tiến; thưởng khi hành động.
- Hành động tiêu cực (chờ đợi, thất vọng) được cảm nhận nặng hơn – nếu không làm mọi thứ hoàn hảo, hãy giao tiếp tốt (cho user biết điều gì đang diễn ra).
