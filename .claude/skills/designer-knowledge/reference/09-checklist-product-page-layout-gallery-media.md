---
title: Checklist Product Page (PDP) phần 1 – Layout, Cross-sell & Cross-navigation, Image Gallery, Ảnh/Video/360 (desktop + mobile)
type: Checklist
scope: Cấu trúc trang sản phẩm, thứ tự section, collapsed sections, sticky CTA, cross-sell, gallery, số lượng và loại ảnh sản phẩm, video
source: Sheet "Product page" mục 1–4, "Mobile Web Product Page" mục 1–3 (Nextsky - Bộ tiêu chí UX.xlsx); Baymard guidelines #738, #751, #753, #757, #758, #766, #784, #810–#828, #740–#779, #1129M, #1141M, #1217M, #1488M
---

# Checklist Product Page – Phần 1: Layout, Cross-sell, Gallery, Media

Ký hiệu: Must / Should / Could = mức ưu tiên; % = tỷ lệ site lớn tuân thủ (AH) hoặc vi phạm theo Baymard; Audit = trạng thái theme Purity khi đánh giá.

---

## 1. Product Page Layout

- [ ] **Vertically collapsed sections (accordion dọc)** (Must; 61.8% site vi phạm; Baymard #751)
  1. Ưu tiên mở sẵn section quan trọng ảnh hưởng quyết định mua – ví dụ "Công dụng sản phẩm" mở mặc định với mỹ phẩm.
  2. Icon rõ: "+/-" hoặc mũi tên thể hiện trạng thái collapse/expand.
  3. Không lạm dụng: tối đa 5–7 section thu gọn.
  Audit: đã có; cần mở sẵn 1 tab quan trọng; thêm title rõ hơn về công dụng chính. Mobile (#1129M): cân nhắc accordion để tiết kiệm không gian; review nội dung nào cho vào, nội dung nào không.

- [ ] **Tránh horizontal tabs làm bố cục chính PDP** (Must; 97.2% site vi phạm; #753). Không dùng [Mô tả] [Thông số] [Đánh giá] [Chính sách] dạng tab ngang; thay bằng accordion, trang dài hoặc sticky TOC. 5 lý do Baymard:
  - Tab blindness: người dùng bỏ qua tab không ở vị trí đầu; heatmap chỉ 12–18% cuộn đến vùng tab ngang.
  - Phá luồng đọc chữ F; eye-tracking: mất thêm 500ms xử lý tab.
  - Không gian: mỗi tab chỉ 3–5 từ, bị cắt ("Thông số…"); 92% trang vi phạm không đủ chỗ cho 4+ tab ở 1280px.
  - Rào cản so sánh: 73% người dùng không so sánh chính xác thông số giữa 2 tab.
  - Responsive: 89% implementation trên mobile thành dropdown (thêm 1 click) hoặc cuộn ngang.

- [ ] **"One long page" + sticky TOC** (#758; 95% site làm tốt). Trang dài phải có sticky TOC. Audit: không dùng sticky TOC mà dùng sticky add to cart; nếu làm theme digital thì xem xét TOC như Amazon.

- [ ] **One long page cho sản phẩm đơn giản, visual-first** (Must; 63.6% vi phạm; #757): thời trang, mỹ phẩm, deco. Chia 3–6 section chính, mỗi phần khi cuộn không dài quá 1 màn hình:
  1. Top-block: ảnh + tên + giá + CTA – thông tin quan trọng ở 0.5–1.5 màn hình đầu.
  2. USP bullets: lợi ích nổi bật.
  3. Product info: công dụng, mô tả ngắn (≤150 từ).
  4. Social proof (review, UGC) → tăng 18% độ tin cậy.
  5. How to use.
  6. Ingredients.
  7. Reviews + Feedback.
  8. FAQ.
  9. Cross-sell hoặc chính sách (sau Review).
  Audit: cần xem lại layout; các section đang "dính nhau", cần visual separation:
  - Block "Cam kết thương hiệu" nằm ngay dưới "See it in action" không có khoảng cách/tiêu đề → nền khác nhẹ (#F7F7F7) + tiêu đề "Cam kết từ thương hiệu".
  - "Green Tea Extract" + "Steps to Clear Skin" hai khối ảnh nền lớn không ranh giới → nền khác màu hoặc padding rõ + tiêu đề lớn từng section.
  - "Similar Products" → "Frequently Bought Together" cùng dạng grid bị hoà vào nhau → FBT thêm nền khác (#FAFAFA/kem) + headline lớn.
  - "Customer Feedback" → "Help Content" không phân cách → divider hoặc khoảng trắng lớn + tiêu đề "Hỗ trợ khách hàng – Những câu hỏi thường gặp".

- [ ] **Bắt buộc có visual anchors**: floating CTA (mobile) – nút Mua luôn hiện khi cuộn; section divider rõ – màu nền khác nhau giữa các phần. Audit: cần review.

- [ ] **Sticky CTA / sticky bar chi tiết** (#784; 50% vi phạm)
  1. Hiển thị khi người dùng cuộn qua CTA chính.
  2. Vị trí: Desktop – bottom bar (dễ thấy nhất) hoặc top bar khi giá/khuyến mãi là yếu tố quyết định; Mobile – luôn bottom bar để không che nội dung.
  3. Dễ thao tác mobile: nút ≥ 44px cao; không nhồi thông tin; font rõ, contrast cao. Audit: cần review.
  Ghi chú audit: sticky add to cart nằm trên sticky navigation, luôn show như Sephora, đi cùng số lượng (không phải lựa chọn màu); thêm giá vào button add to cart (Concept đã làm).

- [ ] **Không đặt cross-sell full-width trên nội dung quan trọng** (55.2% vi phạm; #738; mobile #738M Must). Không đặt "Bạn có thể thích", "Mua cùng với…", "Sản phẩm tương tự" phía trên ảnh sản phẩm, tên, mô tả, giá, Add to Cart. Vị trí tối ưu: (1) dưới mô tả sản phẩm; (2) sau Review; (3) cuối PDP.

- [ ] **Thứ tự cấu trúc PDP theo Baymard** (theo trình tự tâm lý; F/Z pattern: ảnh → tiêu đề → CTA):
  1. Ảnh sản phẩm → 2. Tên → 3. Giá, biến thể, đánh giá → 4. Add to Cart / CTA → 5. Mô tả ngắn (USP bullets & mô tả) → 6. Đánh giá/Review → 7. Cross-sell → 8. FAQs / Chính sách / Hỗ trợ.

- [ ] **Tiêu đề section chính xác, cụ thể** (#766; 77.4% tuân thủ; mobile #766M 80.2%). Tránh "Thông tin", "Chi tiết", "Mô tả". Tiêu đề phải: mô tả chính xác nội dung; ngôn ngữ phổ biến (không biệt ngữ); có tính hành động khi cần. Lý do: mắt chỉ dành 0.7s quyết định có đọc section không; não xử lý thông tin cụ thể nhanh hơn 40%. Audit: "Product info" → "Product Benefits & Description"; "FAQ" → "Shipping & Return FAQs"; thêm title cho các khối info bên cạnh ảnh.

- [ ] **Nội dung bị cắt ngắn dễ tìm và mở rộng** (#846): hiển thị rõ dấu hiệu bị cắt; cách mở rộng đơn giản; nhất quán mọi thiết bị.

- [ ] Mobile #1141M: tránh subpage trong PDP – PDP là 1 trang cuộn liên tục, không trang con tải lại gây mất phương hướng (Should; 83.2% AH).

## 2. Cross-sells & Cross-navigation

- [ ] **Cross-sell chỉ chứa sản phẩm thay thế** (Must; #810; 53% AH): cùng danh mục, chức năng tương tự, khác mẫu/brand/giá – dùng khi người dùng chưa chắc lựa chọn. Audit: cần sắp xếp lại data sản phẩm related.
- [ ] **Cross-sell chỉ chứa sản phẩm bổ sung** (Should; #811; 37.7% AH): phụ kiện, combo, sản phẩm hỗ trợ – mua kèm tăng giá trị đơn. Ví dụ: xem dầu gội → gợi ý dầu xả cùng dòng, không gợi ý dầu gội khác. Audit: đã có, tối ưu data "mua cùng nhau", đổi vị trí ngay dưới product như Amazon.
- [ ] **Có cả breadcrumb "phân cấp" và "lịch sử"** (Could; #828; 7.5% AH): thể hiện đường dẫn danh mục và đường dẫn từ hành vi (search, filter). Audit: breadcrumb chưa có danh mục. Mobile #1213M: breadcrumb hiện làm theo Shopify – đạt.
- [ ] **Cross-sell liên quan nhờ ma trận dữ liệu** (Could; #813; 59.3% AH): dựa nhiều yếu tố (hành vi, đặc điểm sản phẩm). Audit: chưa rõ logic; compare và bought-together do mình set, phần còn lại app làm.
- [ ] **Đủ thông tin để so sánh**: mỗi sản phẩm gợi ý có ảnh rõ, tên đầy đủ, giá, sao đánh giá, thuộc tính phân biệt chính, brand, CTA, xem chi tiết (#814).
- [ ] **Nút "Thêm vào giỏ" cho một số sản phẩm bổ sung** trong cross-sell, không cần sang trang (#821).
- [ ] **Hiển thị bảo hành / nâng cấp bảo hành** trên PDP với sản phẩm điện tử/cao cấp: block "Mua thêm bảo hành" kèm Add to Cart (Could; #819; 20% AH). Audit: cần nếu làm theme digital.
- [ ] **Danh sách sản phẩm đã xem gần đây** ở block cuối trang hoặc sidebar (Must; #827). Audit desktop: chưa có; mobile: đạt.
- [ ] Text gợi ý tôn trọng quyền lựa chọn: "Những khách hàng khác thích…", "Chúng tôi đã tìm thấy những sản phẩm khác mà bạn có thể thích!" thay vì quyết định thay khách.

## 3. Image Gallery UI

- [ ] **Luôn dùng thumbnail trong gallery trên desktop** (Should; 94%): thumbnail dưới hoặc bên cạnh ảnh chính để xem toàn bộ ảnh. Audit: setup 1 layout product dạng thumb trái hoặc bottom, show trên menu và click ở homepage ra. Mobile #774M: dùng thumbnail kể cả mobile (29.3% AH); demo chưa set.
- [ ] **Ảnh mặc định hấp dẫn, giàu thông tin** (Must; 38.5% vi phạm): rõ nét, nổi bật – ảnh đầu quyết định click và cảm nhận ban đầu.
- [ ] **Cẩn trọng khi cắt xén thumbnail** (Must; 23.2% vi phạm nghiêm trọng): nếu cắt bớt, phải có nút điều hướng rõ, không để người dùng bỏ lỡ ảnh.
- [ ] **Bao gồm tất cả ảnh sản phẩm trong gallery** (Should; 76.4%): không bỏ sót ảnh. Audit: cơ bản đạt, bổ sung thêm góc chụp.
- [ ] **Ảnh phóng to chiếm tối thiểu 80–100% trang** (Must; 39%).
- [ ] **Hover zoom thay click zoom** (Must; 63.2%). Audit: chưa có, bổ sung option hover zoom / click zoom như Glozin.
- [ ] **Gallery chiếm ≥ 50% chiều rộng trang với sản phẩm visual** (thời trang, nội thất) (Must; 65.2%).
- [ ] **Ảnh mặc định lớn + điều hướng carousel** khi có nhiều ảnh mô tả chi tiết (Must; 45.8%).
- [ ] **Thumbnail đặt dưới hoặc bên cạnh ảnh chính** – cả hai hiệu quả nếu rõ ràng (Must).
- [ ] Mobile #1217M: ảnh chính, swatch và thumbnail hiển thị trong cùng viewport đầu (Should; 36.4% AH). Audit: swatch đang ở lần cuộn thứ 2. Prestige có swatch ở viewport 1 nhưng không có thumb.
- [ ] Mobile: ảnh chính lớn, rõ, chiếm phần lớn màn hình, vuốt được, không bị che, ở trung tâm đầu trang (Rất cao; 64% vi phạm).
- [ ] Mobile #1488M: xoay ngang ảnh scale tỷ lệ, dùng object-fit cover, không kéo dãn (Must; 38.1% AH).
- [ ] Mobile: với ảnh có swatch, thumb của swatch để dưới ảnh main; sản phẩm không swatch chỉ cần show đếm.

## 4. Product Images, Videos & 360-Views

- [ ] **Ít nhất 3–5 ảnh mỗi sản phẩm** (Must; 63.6% AH; #740). Dưới 3 ảnh khiến người dùng nghi ngờ chất lượng.
- [ ] **Luôn hiển thị "In Scale"** (Must; 52.3%; #741): ảnh có vật thể so sánh (tay, người mẫu, không gian quen) để hình dung kích thước thực. Audit: chưa có / thiếu ảnh.
- [ ] **Ảnh "Feature Callout"** (Must; 28.4% AH; #747): highlight tính năng bằng mũi tên, vòng tròn, text ngắn trên ảnh hoặc bên cạnh; zoom cận cảnh chi tiết (khoá kéo, chất liệu). Phù hợp sản phẩm kỹ thuật, mỹ phẩm, thiết bị. Audit: cần review lại sản phẩm; mobile đã có đa số.
- [ ] **3–5 ảnh nhiều góc độ** (Should; 60.3%; #755): trước, sau, bên, cận cảnh. Cần để khách nhận thấy tính năng mà không phải đọc text (ví dụ ảnh bên trong túi có 2 ngăn). Prestige đang có.
- [ ] **Ảnh trên người mẫu thật** với phụ kiện, quần áo, mỹ phẩm (Must; 28.3% AH; #1193). Audit: cần review / thiếu ảnh.
- [ ] **Ảnh lifestyle** – sản phẩm trong bối cảnh thực tế, có người tương tác (Should; 30.1% AH; #744). Hơn 60% site đang bỏ lỡ. Audit: cần review bổ sung toàn bộ.
- [ ] **Ảnh "phụ kiện đi kèm"** – một ảnh chứa tất cả thứ có trong hộp: sản phẩm, sạc, cáp… (Should; 93.5% AH; #745). Audit: cần review; các theme khác đang không có.
- [ ] **Text/graphic mô tả trên một số ảnh**: chú thích "Chất liệu da bò 100%", mũi tên chỉ chi tiết, thành phần, biểu đồ (Should; #752).
- [ ] **Ảnh biến thể** (Must; 71.4% AH; #854): ảnh khác nhau tương ứng màu/size đã chọn; cân nhắc 1 ảnh chứa tất cả variant để so sánh. Audit: desktop đạt; mobile chưa có ảnh tổng hợp variant.
- [ ] **Độ phân giải cao, zoom được** (Must; 61.6%; #779): phóng to vẫn rõ kết cấu, chi tiết nhỏ, không mờ/vỡ.
- [ ] **Video sản phẩm** thể hiện chất liệu, chức năng, chuyển động (Should; 68.4%; #759). Audit: hiện 1 sản phẩm có video, video đang nằm ở block riêng.
- [ ] **Video đặt trong gallery ảnh chính**, không tách riêng (Should/Must mobile; 72.3%; #770). Tập trung thông tin, không bỏ sót video.
- [ ] **Video tải nhanh, có preview khi scrub, tiêu đề mô tả** (Must; 25%; #760). Audit mobile: chưa có bản xem trước khi tua.
- [ ] **Xem 360 độ** (Could; #761): cân nhắc với gia dụng, nội thất, trải nghiệm cao cấp. Audit: chưa có.
- [ ] Shoppable video + lightbox media: hiển thị thanh tiến trình video; chạy hết cần lặp lại; khi vuốt mới show video tiếp; lần đầu mở video show text "vuốt xuống để thấy video tiếp" (tham khảo theordinary.com); click có thanh chạy như Sephora; sticky video đang to quá, cần cho bé lại như Shopee.

## 5. Nguyên tắc NN/g cho trang sản phẩm (tham chiếu)

- Tiêu đề rõ, mô tả ngắn nhấn mạnh tính năng/lợi ích; thông số kỹ thuật (kích thước, trọng lượng, chất liệu, màu); ảnh chất lượng cao, phóng to được.
- Hiển thị sao đánh giá và nhận xét chi tiết của khách hàng.
- Nút "Thêm vào giỏ" nổi bật; giá rõ ràng kể cả khuyến mãi; thông tin thanh toán và vận chuyển.
- Responsive tốt, tải nhanh.
- Ảnh người mẫu đa dạng (độ tuổi, chủng tộc, kích cỡ, phong cách): người dùng tự tin hơn khi quyết định, tăng chuyển đổi và hình ảnh thương hiệu; giữ nhất quán cách trình bày sản phẩm.
