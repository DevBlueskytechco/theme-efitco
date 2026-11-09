---
title: Checklist Search – search box, các loại truy vấn cần hỗ trợ, autocomplete, trang kết quả, trang không có kết quả
type: Checklist
scope: Search popup/drawer trong header, autocomplete, search results page, no-result page trên desktop và mobile
source: Sheet "Search" (Nextsky - Bộ tiêu chí UX.xlsx); Baymard guidelines #333–#404, #1001, #2700, #2718, #2730; NN/g Site Searching; sheet "Note task"
---

# Checklist Search

Search đáp ứng 2 nhóm tiêu chí: Tương tác/khám phá và Hiểu – hành động đúng.

Ký hiệu: % = tỷ lệ site lớn tuân thủ/vi phạm theo Baymard; Audit = trạng thái theme Purity khi đánh giá.

---

## 1. Search box xuất hiện rõ và dễ dùng

- [ ] Có search box trong header, hiển thị placeholder. Audit: cải thiện placeholder thành "Search t-shirt, sweater, dress…" thay vì chỉ "Search".
- [ ] Ưu tiên hiển thị ô tìm kiếm đầy đủ thay vì chỉ icon kính lúp (NN/g: icon kính lúp nhận diện phổ biến nhưng không đủ rõ với người mới); kết hợp icon + nhãn "Tìm kiếm".
- [ ] Vị trí nổi bật: góc trên bên phải hoặc trung tâm đầu trang; không giấu trong menu phụ.
- [ ] Mobile: icon tìm kiếm rõ trên header hoặc đầu trang, không ẩn trong menu (Rất cao; 46% vi phạm); kích thước và vị trí dễ chạm; tối ưu lại search mobile, bỏ bớt title.
- [ ] Desktop: ô nhập đủ rộng (200–400px).

## 2. Search cần hỗ trợ tìm kiếm theo 10 loại truy vấn

| # | Loại truy vấn | Ví dụ | Benchmark |
|---|---|---|---|
| 1 | Loại sản phẩm | "shoes", "foundation", "jacket" | 73.5% tuân thủ cao (#2730) |
| 2 | Mục đích sử dụng | "wedding gift", "for oily skin" | 46.8% tuân thủ thấp (#2700) |
| 3 | Từ đồng nghĩa | "couch" = "sofa" | #2718 |
| 4 | Tên sản phẩm chính xác | "UltraSoft White T-Shirt" | 70.6% tuân thủ cao (#333) |
| 5 | Đặc điểm / tính năng | "black dress", "wireless", "organic" | 35.5% chỉ filter sau khi vào danh mục; 30.4% cho search trực tiếp (#340) |
| 6 | Sản phẩm tương thích | "case for iPhone 13" | 47.1% tuân thủ cao (#341) |
| 7 | Viết tắt / ký hiệu | "USB-C", "HDMI 2.1" | 37.2% tuân thủ cao (#344) |
| 8 | Tính chủ quan | "elegant", "comfortable", "sexy" | 84.6% tuân thủ cao (#399) |
| 9 | Triệu chứng / vấn đề | "acne", "bloating", "dry hands" | 50.8% tuân thủ cao (#338) |
| 10 | Nội dung không phải sản phẩm (page) | "shipping info", "warranty" | Audit: đạt |

## 3. Autocomplete – gợi ý nhanh khi gõ

- [ ] Gợi ý từ khoá mở rộng khi mới gõ một phần (77.6% site làm tốt; #359).
- [ ] Không gây chậm, giật, nhấp nháy UI khi autocomplete hoạt động (chỉ 34.8% làm tốt; #404). Audit: load nhanh nhưng gợi ý đôi khi không đồng nhất (nhập "ta" → hiển thị "table" rồi biến mất) → tối ưu hiệu suất, giới hạn ≤ 5 kết quả gợi ý đầu, tránh hình động hoặc ảnh tải chậm.
- [ ] Gợi ý phạm vi danh mục kèm từ khoá (scope): "table → Dining Tables"; thêm danh mục con kèm icon ("chair (Furniture)") (#361). Giúp đi đúng collection ngay từ gợi ý đầu. Triển khai: gắn metadata danh mục cho từ khoá phổ biến. Audit: thiếu.
- [ ] Phân biệt rõ gợi ý từ khoá và gợi ý sản phẩm (88.9% tuân thủ; #356): "White shirt" → 🔍 "white shirt for men" / 🛍️ [ảnh + tên sản phẩm]; dùng label "Suggestions" vs "Products" hoặc icon 🔍 / 🛒. Audit: đạt.
- [ ] Chọn gợi ý bằng bàn phím (mũi tên xuống) phải copy đúng từ vào search field (36.7% vi phạm nặng; #369). Nếu không, nhấn Enter ra kết quả sai. Audit: đạt.
- [ ] Loại bỏ gợi ý thừa / không liên quan (#368).
- [ ] Gợi ý nhanh và có thể dự đoán: phản hồi gần như ngay lập tức, không delay/giật (81.7% đạt; #363). Audit: đạt.
- [ ] Gợi ý phù hợp cả khi gõ sai chính tả nhẹ: "snikers" → "sneakers" (#1001). Rất quan trọng trên mobile vì dễ gõ sai. Kỹ thuật: fuzzy match (Levenshtein distance), synonym dictionary hoặc AI-based typo correction.

## 4. Search form và trang kết quả

- [ ] Giữ nguyên từ khoá trên trang kết quả (32.4% site không làm được; #346) – để dễ sửa lỗi, đổi từ khoá nhỏ, biết đang tìm gì. Cực kỳ quan trọng cho UX continuity. Audit: đạt.
- [ ] Cho phép giới hạn tìm kiếm trong danh mục hiện tại (#343). Nên làm nếu danh mục sâu hoặc khách duyệt theo context (thời trang, nội thất, mỹ phẩm). Audit: chưa có.
- [ ] Xoá bộ lọc và sort khi resubmit cùng từ khoá (93.8% làm đúng; #350). Hành vi rất phổ biến nhưng dễ bị bỏ qua. Audit: đạt.
- [ ] Gợi ý truy vấn thay thế khi kết quả không phù hợp hoặc quá ít: "Did you mean: sneakers?", "Try searching for: black shoes" (70.3% vi phạm; #358). Audit: chưa có. Option 1: đưa từ khoá liên quan; Option 2: section "Bạn có thể quan tâm" với từ khoá phổ biến.
- [ ] Tự động sửa lỗi chính tả: "snikers" → tự sửa "sneakers" + thông báo rõ "Showing results for sneakers" (chỉ 20.4% làm tốt, 42.3% vi phạm cao; #355). Kỹ thuật: Elasticsearch fuzzy search. Audit: chưa có.
- [ ] Hiển thị màu sản phẩm khớp từ khoá: tìm theo màu thì ảnh đại diện trong kết quả phải đúng màu đó (67% làm đúng; #386). Audit: đạt.
- [ ] Bộ lọc theo danh mục ngay từ kết quả tìm kiếm: tìm "cream" → lọc theo loại da, dung tích; tìm "jeans" → size, fit (51.4% làm tốt; #376).
- [ ] Bộ lọc liên quan đến từ khoá: tìm "shoes" không thấy filter "skin concern" (63.7% tốt; #402).
- [ ] Sắp xếp kết quả theo logic kép với từ khoá rộng ("cream"): không chỉ độ liên quan mà còn mức phổ biến, lượt click, rating (#393). Audit: sắp xếp kết quả rõ ràng theo Product / Page / Blog như prestige-theme-allure.myshopify.com/search?q=all; logic trả kết quả hiện chưa rõ.

## 5. Trang "Không có kết quả" (No results)

- [ ] Thông báo rõ rằng không có kết quả phù hợp – để người dùng biết hệ thống đã xử lý.
- [ ] Cung cấp gợi ý tiếp tục hành trình (67.3% site không làm tốt; #362):
  - Gợi ý từ khoá khác / từ khoá liên quan, phổ biến.
  - Danh mục sản phẩm phổ biến, link về danh mục chính hoặc trang chủ.
  - Bài blog hoặc hướng dẫn liên quan.
  - Mẹo cải thiện truy vấn.
- [ ] Không làm người dùng cảm thấy bị đổ lỗi: dùng "Không có kết quả phù hợp với truy vấn của bạn" thay vì "Không tìm thấy vì bạn đã nhập sai".
- [ ] Audit: Purity chưa có → custom thêm search no result.

## 6. Nguyên lý nền (NN/g) khi thiết kế search

- Tìm kiếm không đủ – phải kết hợp điều hướng: search yêu cầu biết chính xác từ khoá, tăng gánh nặng ghi nhớ, chi phí tương tác cao hơn duyệt; nhiều người thiếu kỹ năng tìm kiếm (không dùng toán tử, không đổi chiến lược khi thất bại). Điều hướng giảm gánh nặng nhớ, hỗ trợ người chưa rõ mục tiêu, cho bối cảnh.
- Keyword foraging: người dùng tìm bằng từ không chính xác trước ("giày đen" → "giày quân đội" → "combat boots"; "hoa hồng xù màu hồng" → "hoa mẫu đơn") vì không biết thuật ngữ, mô tả theo hình ảnh/chức năng, khác biệt ngôn ngữ ("eggplant"/"aubergine"). → Dùng ngôn ngữ phổ thông; phân tích từ khoá người dùng thực tế; mô tả sản phẩm theo nhiều cách (hình thức, chức năng, cảm nhận); search xử lý được truy vấn không chính xác.
- Gợi ý tìm kiếm: liên quan chặt với nội dung site; ưu tiên gợi ý phổ biến; định dạng dễ đọc, không giống kết quả tìm kiếm; hỗ trợ từ khoá hay gõ sai hoặc nhiều cách diễn đạt.
- Tình hình e-commerce search: gợi ý tự động thông minh theo ngữ nghĩa; facets/bộ lọc hiệu quả; tối ưu mobile.
- Cung cấp hướng dẫn/mẹo tìm kiếm khi cần; giao diện đơn giản; nội dung chất lượng để kết quả hữu ích.

## 7. Popup / drawer search trên mobile (benchmark đối thủ)

Kết luận NextSky: search mobile dạng drawer từ phải sang 90%, có header, có icon x, background đen. Tham khảo: Eurus popup từ trên xuống; Flow drawer trên xuống full màn từ header; Be Yours/Baseline popup float khi chưa search, full màn khi search; Empire popup dưới lên full màn; Sahara/Mr Parker nằm trong menu. Chi tiết xem file quy tắc popup & drawer.
