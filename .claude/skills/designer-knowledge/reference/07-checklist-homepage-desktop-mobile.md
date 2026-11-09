---
title: Checklist Homepage cho theme mới – desktop và mobile (thương hiệu, popup, product finder, điều hướng danh mục, cá nhân hoá)
type: Checklist
scope: Yêu cầu xây dựng trang chủ theme Shopify; phần desktop và phần mobile (Baymard Mobile Web Homepage, Category Navigation, Personalization)
source: Sheet "Homepage", "Mobile" (Nextsky - Bộ tiêu chí UX.xlsx); sheet "Tương tác chính" mục 5–6 (NGHIÊN CỨU UX_UI.xlsx); Baymard guideline collections qof2oe, mwlwjp, wqrbe4, y6hoo8, 8pntcb
---

# Checklist Homepage – theme mới

Mục tiêu: gây ấn tượng tích cực ngay lần đầu tương tác. Homepage có 3 nhiệm vụ: cho biết bạn là ai (5 giây), dẫn người dùng đến mục tiêu, xây dựng niềm tin.

Cách đọc: mức ưu tiên Rất cao / Cao / Trung bình; "% site" = tỷ lệ site lớn tuân thủ hoặc vi phạm theo Baymard – tỷ lệ vi phạm càng cao thì mục đó càng là điểm khác biệt nếu theme làm tốt. Mỗi mục đánh Đạt / Chưa đạt khi review bản thiết kế.

---

## A. Thẩm mỹ – ấn tượng đầu tiên (desktop)

- [ ] Hero sắp theo F/Z pattern: heading – ảnh – CTA theo đường quét mắt.
- [ ] Ảnh đầu tiên người dùng thấy là ảnh chụp sản phẩm thực tế hoặc lifestyle gắn với thương hiệu; không dùng ảnh stock (Baymard #238D).
- [ ] Banner mang tone màu, font và thông điệp thương hiệu.
- [ ] Ảnh trên homepage nhất quán về ánh sáng, tone màu, bố cục; ảnh chụp riêng, phông nền phù hợp; đa góc, chất lượng cao.
- [ ] Icon và đồ hoạ tuỳ chỉnh theo phong cách thương hiệu (tự vẽ hoặc chỉnh từ nguồn mở).
- [ ] Người dùng nhận diện được thương hiệu sau 5 giây nhìn homepage mà không cần logo; màu, font, bố cục đồng bộ trên mọi ảnh. Đo bằng 5-second test, user impression survey.
- [ ] Phân chia rõ CTA chính và CTA phụ trên toàn homepage; mỗi section 1 CTA chính; cả trang ≤ 5 CTA chính.
- [ ] Khối social proof / review và khối shoppable có thứ bậc thị giác rõ, không dày đặc item.

## B. Popup và quảng cáo trên homepage

- [ ] Không popup ngay khi vào trang: hiển thị sau vài giây hoặc khi người dùng scroll quá 50–60% (Baymard qof2oe/240). Kiểm tra bằng logic code.
- [ ] Khối khuyến mãi dùng cùng hệ màu, typography, layout → nhìn như một phần tự nhiên của homepage.
- [ ] Không để khuyến mãi/overlay che CTA chính: CTA "Mua ngay", "Xem danh mục" nằm trong viewport đầu. Cách kiểm tra: mở trên laptop 1366×768 và iPhone X; DevTools → Inspect → bounding box của CTA và banner overlay.
- [ ] Không để banner đẩy toàn bộ sản phẩm xuống: người dùng thấy sản phẩm trong 3 giây đầu (above-the-fold). Cách kiểm tra: DevTools → Responsive mode ở 1440×900 và 390×844.
- [ ] Khuyến mãi site-wide dùng dạng tĩnh (announcement bar, section) thay overlay khi load trang (Baymard #284D, Must).

## C. Công cụ hướng dẫn (wizard / product finder / quiz) tại homepage

- [ ] Tích hợp trực tiếp trên homepage (Baymard #249D). Trên mobile ẩn ảnh để giữ ngắn gọn.
- [ ] Câu hỏi đơn giản, dễ trả lời; có cảm giác được tư vấn, không giống filter.
- [ ] Giao diện trực quan, không yêu cầu kỹ thuật:
  - 1–2 câu hướng dẫn nhẹ trước dropdown, ví dụ "Tell us about your skin in 2 quick steps — we'll find your perfect match."
  - CTA hấp dẫn, cụ thể: "Find My Routine"; CTA thứ 2: "Still unsure? Message our Experts →".
  - Có icon hoặc hình ảnh trong dropdown; nội dung ngắn trên mobile.
- [ ] Không gián đoạn trải nghiệm khi chuyển sang collection: hiện loading message thân thiện ("Matching your routine..."); trên collection hiển thị block tóm tắt kết quả ("Your Routine for Dry + Dark Spots") hoặc show lại phần chọn với lựa chọn cũ; có đường quay lại làm lại quiz.
- [ ] Kết quả dựa trên lựa chọn cá nhân: collection nhận lựa chọn của khách, có thể show lại quiz.

---

## D. Mobile Web Homepage (Baymard qof2oe)

- [ ] Không carousel tự xoay trên trang chủ mobile (Cao; 52% site vi phạm). Thay bằng các section riêng xếp dọc (image_with_text, featured_collection, rich_text); có option hiển thị 3 khối liên tiếp thay slideshow; mỗi chiến dịch/ưu đãi là một khối riêng có ảnh + CTA; người dùng kiểm soát thủ công.
- [ ] Link trên homepage mobile mô tả chính xác nội dung, không chỉ "Xem thêm" (Cao; 72% vi phạm).
- [ ] Hiển thị đa dạng loại sản phẩm chính (Thời trang, Mỹ phẩm, Phụ kiện, Giày…) ngay từ đầu (Cao; 74% vi phạm).
- [ ] Quảng cáo không che sản phẩm/thông tin quan trọng; đóng/ẩn dễ (Rất cao; 78% vi phạm).
- [ ] Nhấn mạnh danh mục sản phẩm chính (Cao; 65% vi phạm).
- [ ] Đường dẫn trực tiếp đến danh mục chính ngay trên homepage (không ẩn trong menu), dạng ảnh hoặc icon; không bắt cuộn quá 3–4 lần (Rất cao; 28% vi phạm).
- [ ] Giới hạn 5–6 section chính trên mobile: Banner/Hero; Danh mục chính; Bộ sưu tập nổi bật; Ưu đãi hiện tại; Social proof/đánh giá. Có setting ẩn section trên mobile, không show hết như desktop (Cao; 28% vi phạm).
- [ ] Nhiều section mục tiêu rõ (danh mục, sản phẩm nổi bật, khuyến mãi) có CTA để đi sâu vào site (Cao; 25% vi phạm).
- [ ] Nút "Back to Top" hiện sau khi cuộn > 2 màn hình / 3–5 section, dễ bấm, không che nội dung (Trung bình–Cao; 32–35% vi phạm).

## E. Mobile – Phân loại danh mục (mwlwjp)

- [ ] Có đường dẫn rõ để bắt đầu duyệt sản phẩm: danh mục, bộ sưu tập nổi bật, CTA khám phá. Mọi section category đều có ảnh + CTA cụ thể (View All / Explore more) (Cao; 31% vi phạm).
- [ ] Hiển thị 2–3 nhóm sản phẩm chính để hiểu phạm vi bán hàng (Trung bình–Cao; 30% vi phạm).
- [ ] Phần phụ (blog, brand story…) dễ lướt qua, không cản trở hành vi mua (Trung bình–Cao; 30% vi phạm).
- [ ] Icon/link rõ đến "Tài khoản của tôi" trên header mobile (Trung bình–Cao; 30% vi phạm).
- [ ] Ít nhất 1 section rõ cho Mới về / Bán chạy / Đang khuyến mãi (Cao; 30% vi phạm).
- [ ] Không "false bottom": không block giống footer giữa trang; người dùng biết còn nội dung bên dưới (Trung bình; 22% vi phạm).
- [ ] Nội dung xây dựng niềm tin: cam kết thương hiệu, chính sách hỗ trợ, review thực tế, logo đối tác; section đánh giá ngắn gọn (Trung bình–Cao; 38% vi phạm).
- [ ] Truyền tải phạm vi catalog: link "Xem tất cả", "Khám phá thêm" hoặc slider danh mục (Trung bình–Cao; 30% vi phạm).
- [ ] Không chỉ tập trung 1 dòng sản phẩm: chia nhóm "Bán chạy", "Danh mục nổi bật", "Theo công dụng" (Cao; 28% vi phạm).

## F. Mobile – Điều hướng chính (wqrbe4)

- [ ] Cuộn dọc tự nhiên toàn trang; section có thể slider ngang nhưng không cuộn ngang/hai chiều toàn trang (Rất cao; 15% vi phạm).
- [ ] Không trình bày danh sách sản phẩm cùng một kiểu (same image size, layout, CTA): chia nhóm rõ, mỗi nhóm có tiêu đề, bố cục biến đổi nhẹ (Trung bình–Cao; 18% vi phạm).
- [ ] Nhiều entry point đến sản phẩm: danh mục, nổi bật, khuyến mãi, bộ sưu tập (Cao; 25% vi phạm).
- [ ] Không danh sách sản phẩm kiểu "cửa hàng đầy đủ" không phân nhóm (Cao; 18% vi phạm).
- [ ] Hiển thị ít nhất 3–6 sản phẩm thật với ảnh, giá, CTA; không chỉ banner và category (Cao; 14% vi phạm).

## G. Mobile – Liên kết đến các loại trang (y6hoo8)

- [ ] Homepage điều hướng được đến danh mục, sản phẩm, tài khoản, giới thiệu, blog (Cao; 38% vi phạm). Có section blog trên homepage mobile (2–3 bài mới nhất, ví dụ "Tips chăm sóc da") – không chỉ để blog trong menu vì user ít mở menu.
- [ ] Link/section đến nội dung hỗ trợ ngoài sản phẩm: blog, câu chuyện thương hiệu, chính sách, hướng dẫn (Trung bình–Cao; 52% vi phạm). Có thể dùng banner nhỏ "Xem bí quyết chăm da".
- [ ] Nếu có khuyến mãi: nút/link/banner dễ thấy dẫn đến trang Sale (Cao; 32% vi phạm) – block "Ưu đãi đặc biệt hôm nay" sau banner chính hoặc announcement bar "Giảm giá đến 30% – [Xem ngay]".
- [ ] Nút/section "Xem tất cả sản phẩm" không cần mở menu (Cao; 32% vi phạm).
- [ ] Nếu có quiz / product finder / routine builder: homepage hiển thị rõ, chạy mượt (Cao; 24% vi phạm).

## H. Mobile – Cá nhân hoá (8pntcb)

- [ ] Nếu site có khả năng cá nhân hoá (login, hành vi, địa lý): có block "Gợi ý cho bạn" (Trung bình; 22% vi phạm).
- [ ] Ghi rõ nhãn khi nội dung là cá nhân hoá: "Gợi ý cho bạn", "Được chọn riêng cho bạn" (Trung bình; 10% vi phạm).
- [ ] Không gắn nhãn "for you" cho nội dung không cá nhân hoá (Trung bình–Cao; 34% vi phạm).
- [ ] Hiển thị sản phẩm người dùng từng xem/tương tác phải ghi lý do: "Đã xem gần đây", "Trong giỏ của bạn", "Bạn đã quan tâm đến…" (Trung bình–Cao; 11% vi phạm). Theme cần có section Recently Viewed.
- [ ] Section "Recently Viewed" ẩn hẳn hoặc thay nội dung khác khi không có dữ liệu (Trung bình; 28% vi phạm).
- [ ] Cá nhân hoá chỉ là một phần homepage, không lấn át (Trung bình–Cao; 34% vi phạm).
- [ ] Vị trí nội dung cá nhân hoá tương ứng giá trị: liên quan cao → đặt cao; gợi ý chung → giữa hoặc gần cuối (Trung bình; 73% vi phạm).
- [ ] Block cá nhân hoá nổi bật, phân biệt rõ: tiêu đề rõ, icon, bố trí khác biệt (Trung bình–Cao; 87% vi phạm).
- [ ] Section "Mua theo danh mục" có hình ảnh/link trực tiếp đến category chính (Rất cao; 39% vi phạm).
- [ ] Icon tìm kiếm rõ trên header/đầu trang, không ẩn trong menu (Rất cao; 46% vi phạm).

## I. Bottom navigation và nút quay lại (mobile)

- [ ] Bottom navigation (nếu dùng): tối đa 5 mục (icon + chữ), ưu tiên chức năng chính.
- [ ] Không ẩn mục quan trọng trong hamburger menu.
- [ ] Nút "Quay lại" tuân thủ nền tảng (iOS: nút trên màn hình; Android: nút vật lý).

---

## Nguyên tắc homepage từ NN/g (áp dụng khi thiết kế)

- Tagline rõ + hình ảnh sản phẩm/dịch vụ chính → trả lời "bạn là ai" trong 5 giây.
- Nhu cầu người dùng lên đầu: search nổi bật; menu nhóm theo tác vụ phổ biến.
- Giảm tải thông tin: visual hierarchy, chia section rõ (navigation, banner, sản phẩm, tin tức).
- CTA màu tương phản, chữ cụ thể ("Đăng ký miễn phí" thay "Bắt đầu"); tối đa 3–4 CTA chính; > 5 CTA phải tối giản.
- Thiết kế cho 5 loại người dùng: mục tiêu rõ (dẫn thẳng trang con); tìm kiếm (ô search dễ thấy); khám phá (gợi ý nổi bật); quay lại (quick links: lịch sử đơn, tài khoản); không quan tâm (banner giữ chân: ưu đãi, video).
- Tối ưu mobile & tốc độ: ảnh nén; nút/input ≥ 48×48px.
- Homepage cần: hiển thị những gì người dùng đang tìm và những gì tạm thời chưa cần; hướng dẫn bắt đầu từ đâu; tạo uy tín. Dù có nhiều traffic nhất, không nhồi nhét thông tin.
