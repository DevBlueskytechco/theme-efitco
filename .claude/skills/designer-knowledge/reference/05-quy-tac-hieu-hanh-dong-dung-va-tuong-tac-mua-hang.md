---
title: Quy tắc UI nhóm 3 & 4 – Hiểu và hành động đúng (Understanding & Affordance) và Tương tác chính & thao tác mua hàng
type: Quy tắc
scope: Homepage 5 giây, affordance, visual hierarchy, choice overload; CTA thumb zone, tooltip, trạng thái tương tác, thông báo lỗi
source: Sheet "Understanding & Affordance" / "Hiểu và hành động đúng", "Tương tác..." / "Tương tác chính và thao tác mua hàng" (Nextsky - Bộ tiêu chí UX.xlsx; NGHIÊN CỨU UX_UI.xlsx)
---

# Quy tắc UI nhóm 3 – Hiểu và hành động đúng (Understanding & Affordance)

Ngữ cảnh: người dùng hiểu nhanh cách sử dụng và thao tác đúng. Mục tiêu: hạn chế lỗi thao tác, rối UI.

## 1. Homepage phải giúp người dùng hiểu bạn là ai (trong 5 giây)

1. Tiêu đề chính rõ ràng, hiểu ngay lập tức
   - Tiêu đề homepage ngắn gọn, trực quan, nêu rõ bạn làm gì / bán gì (tối đa 6–12 từ).
   - Font size lớn (32–64px), dễ đọc, nổi bật ngay khi vào trang.
2. Hero image hoặc video minh hoạ trực quan
   - Ảnh/video lớn đầu trang phản ánh rõ thương hiệu, sản phẩm, dịch vụ.
   - Tránh ảnh trừu tượng, không liên quan hoặc quá chung chung. Audit: cần fix lại ảnh.
3. Logo thương hiệu hiển thị rõ, dễ nhớ – đặt vị trí nổi bật nhất (góc trái trên cùng).
4. Thông tin quan trọng nhất nằm trong khu vực hiển thị đầu tiên, không cần cuộn (above the fold).

Nguồn: Polaris Content; Apple HIG Branding; NN/g Page Fold Manifesto.

## 2. Rõ ràng về các chức năng không cần giải thích

1. Dùng biểu tượng phổ biến, dễ nhận diện (common icons).
2. Label rõ, mô tả đúng chức năng, ngắn gọn (1–3 từ).
3. Affordance: nút, liên kết, thành phần tương tác phải rõ khả năng nhấp (độ nổi, shadow, hoặc đổi trạng thái khi hover). Không để người dùng phân vân "cái này có bấm được không".
4. Feedback tức thời khi tương tác.
5. Không bắt người dùng ghi nhớ chức năng (Recognition over Recall).
6. Tránh ngôn ngữ mơ hồ, khó hiểu.
7. Chức năng và thành phần sắp xếp logic.

Nguồn: NN/g Icon Usability; NN/g Recognition and Recall; Polaris Inclusive Language; Polaris Form Layout.

## 3. Phân cấp thị giác rõ ràng (Visual Hierarchy)

1. Kích thước và trọng lượng font (size & weight).
2. Màu sắc để tạo phân cấp.
3. Vị trí bố trí theo mô hình "F" hoặc "Z".
4. Khoảng trắng để phân biệt rõ.
5. Thành phần trực quan (icon, hình ảnh) hỗ trợ.
6. Nhất quán visual hierarchy trên toàn giao diện.

Nguồn: NN/g Visual Hierarchy; NN/g F-Shaped Pattern; NN/g Consistency and Standards.

## 4. Không hiện quá nhiều lựa chọn (Avoid choice overload)

1. Giới hạn số lựa chọn: chỉ hiển thị 3–5 option chính (Hick's Law).
2. Phân nhóm các lựa chọn (grouping).
3. Ưu tiên các lựa chọn chính (prioritize primary actions).

Nguồn: Polaris Action List.

---

# Quy tắc UI nhóm 4 – Tương tác chính và thao tác mua hàng

Ngữ cảnh: người dùng đang chọn sản phẩm, tương tác, thêm vào giỏ. Mục tiêu: tăng tỷ lệ chuyển đổi, tránh mất hành vi do UI khó dùng.

## 1. CTA rõ ràng, không đặt sát nhau (thumb zone)

1. Thiết kế CTA rõ, dễ nhận diện
   - Màu tương phản mạnh với background.
   - Hình dạng rõ (nút bo góc hoặc chữ nhật border-radius nhỏ).
   - Text ngắn, dùng động từ cụ thể: "Buy Now", "Add to Cart".
2. Kích thước CTA dễ tương tác (thumb zone)
   - Chiều cao tối thiểu 44–48px trở lên, đặc biệt mobile.
   - Khoảng cách giữa các nút / thành phần tương tác tối thiểu 16px để tránh nhấn nhầm.
3. Vị trí hợp lý
   - CTA above the fold hoặc rất gần khi cuộn nhẹ.
   - Theo thứ tự logic hành trình (mô hình "Z" hoặc "F").
4. CTA nhất quán xuyên suốt giao diện.
5. Thiết kế cho "one-hand use": đặt CTA trong vùng thumb zone (dễ chạm bằng ngón cái).

Nguồn: Polaris Button; NN/g Touch Target Size.

## 2. Tooltip, hover trạng thái rõ ràng

1. Nội dung tooltip ngắn gọn: tối đa 1–2 câu ngắn (3–8 từ), giải thích chính xác mục đích.
2. Feedback states rõ khi hover, click, tap vào CTA; trạng thái active thể hiện rõ (đổi màu, icon, hiệu ứng nhỏ).
3. Tooltip hiển thị nhanh, không gây phiền.
4. Vị trí tooltip gần đối tượng (ngay trên hoặc dưới), không che nội dung quan trọng.
5. Dễ đọc, tương phản cao: background đủ contrast (≥ 4.5:1), font 12–14px, padding 8–12px.
6. Hỗ trợ accessibility: truy cập được bằng bàn phím (focus states), đọc được bởi screen reader.
7. Không lạm dụng: chỉ dùng khi thực sự cần bổ sung thông tin; không dùng cho chức năng quá quen thuộc (nút Giỏ hàng, Tìm kiếm).

**Gợi ý từ audit**: hiệu ứng khi click button tham khảo Apple / Shopify pricing; khi hover submenu liên tục thì show submenu luôn, không chạy lại hiệu ứng.

Nguồn: NN/g Tooltip Guidelines; Polaris Tooltip; Polaris Accessibility.

## 3. Trạng thái tương tác rõ ràng (Hover, Active, Disabled, Selected)

1. Hover: thay đổi nhẹ màu/độ sáng khi hover nút, link, card; xuất hiện tức thì, delay dưới 200ms.
2. Active: khi nhấn, thể hiện rõ (đổi màu, độ sâu, hiệu ứng nhấn chìm nhẹ); tức thì, tạo cảm giác đã tương tác thành công.
3. Disabled: nút/link không tương tác được phải hiển thị rõ (màu nhạt hơn, contrast thấp hơn) để người dùng không mất thời gian thử.
4. Selected: khác biệt rõ với chưa chọn (đổi màu, icon, viền nổi bật).
5. Đồng nhất xuyên suốt: mọi thành phần tương tác (button, link, card, checkbox…) nhất quán về 4 trạng thái.
6. Tránh hiệu ứng quá nặng ảnh hưởng performance.

Nguồn: Polaris Interaction States; Polaris Choice List; NN/g Checkboxes vs Radio Buttons.

## 4. Thông báo lỗi rõ ràng, dễ hiểu, kèm hướng dẫn khắc phục (Clear and Friendly Error Messages)

1. Nội dung lỗi rõ, cụ thể: "Email không hợp lệ" thay vì "Lỗi nhập liệu"; tránh thuật ngữ kỹ thuật, mã lỗi.
2. Kèm hướng dẫn khắc phục cụ thể: "Vui lòng nhập địa chỉ email đầy đủ".
3. Vị trí trực quan: ngay cạnh hoặc ngay dưới trường liên quan (inline error); màu đỏ, đủ tương phản.
4. Dễ nhận biết: màu nền hoặc icon lỗi rõ; font dễ đọc 12–14px.
5. Ngôn ngữ thân thiện, hỗ trợ, không trách móc, không từ ngữ tiêu cực quá mức.
6. Xuất hiện tức thì – ngay sau khi người dùng rời khỏi trường nhập đó.
7. Nhất quán trên toàn giao diện.
8. Hỗ trợ tốt accessibility.

Nguồn: NN/g Error Message Guidelines; Polaris Error Messages; Apple HIG Alerts; Polaris Inline Error.

## 5. Constraints – ngăn lỗi từ đầu (thuộc nhóm tương tác)

- Disable nút "Thêm vào giỏ" nếu chưa chọn biến thể – tránh người dùng không hiểu vì sao không thêm được.
- Form không cho submit nếu thiếu thông tin quan trọng.
- Giới hạn chiều dài nhập ở input phù hợp để không vỡ layout.
- Validation real-time thay vì sau khi submit.
- Thông báo lỗi cụ thể, không chung chung ("lỗi xảy ra").
- Không để người dùng mất dữ liệu khi back lại trang (form checkout vẫn giữ dữ liệu).
- Đang add cart thì disable button để tránh bấm lặp nhiều lần.

## 6. Feedback & micro-interaction cho thao tác mua hàng

- Hover, click, loading rõ (Norman: Feedback).
- Thêm sản phẩm vào giỏ: có hiệu ứng / số trên icon giỏ tăng; có thể zoom icon cart; sau khi add cart show message và tự ẩn.
- Trang sản phẩm phản hồi đúng khi chọn biến thể – không delay/reload không rõ lý do.
- Trạng thái "đã chọn", "active", "hết hàng" phải rõ.
- "Không có gì xảy ra" sau một hành động = UX tệ.
- Click ảnh → hành động đúng kỳ vọng, không dẫn link khác bất ngờ.
- Mũi tên, icon, scroll hướng dẫn người dùng đúng hành vi (Mapping).

## 7. Kiểm tra như thế nào

| Tiêu chí | Cách kiểm tra |
|---|---|
| Hover, click, loading rõ | UI interaction checklist |
| Lỗi form hiện ngay, chỉ rõ vấn đề | Form test |
| Add to cart có hiệu ứng / số tăng | Quan sát phản ứng người dùng |
| Trang 404 có CTA quay lại | Test dead links |
| "Không có kết quả" có gợi ý | UX heuristic review |
| Có chỉ báo đang tải (spinner, skeleton) | PageSpeed audit + test thật |
| PDP phản hồi đúng khi chọn biến thể | QA biến thể + click-tracking |
| Trạng thái đã chọn / active / hết hàng rõ | Session replay |
| Disable nút khi chưa chọn biến thể | Functional QA |
| Form không submit khi thiếu dữ liệu | Field validation test |
| Giới hạn chiều dài input | UI QA checklist |
| Validation real-time | Form testing |
| Thông báo lỗi cụ thể | UX writing review |
| Không mất dữ liệu khi back | Browser back test |
