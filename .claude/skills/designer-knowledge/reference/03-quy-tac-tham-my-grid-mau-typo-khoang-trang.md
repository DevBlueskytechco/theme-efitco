---
title: Quy tắc UI nhóm 1 – Thẩm mỹ: grid, hình ảnh, màu sắc, typography, icon, thứ bậc thị giác, tương phản, khoảng trắng
type: Quy tắc
scope: Áp dụng cho toàn bộ giao diện theme (desktop + mobile), là nhóm tiêu chí "ấn tượng đầu tiên"
source: Sheet "Thẩm mỹ" (Nextsky - Bộ tiêu chí UX.xlsx; NGHIÊN CỨU UX_UI.xlsx); cột đối thủ Impact/Concept; nguồn Apple HIG, NN/g, Polaris
---

# Quy tắc UI nhóm 1 – Thẩm mỹ (Aesthetics)

Ngữ cảnh: người dùng mở trang web lần đầu (homepage, landing page). Mục tiêu: tạo niềm tin và thu hút ngay từ cái nhìn đầu tiên. Kiểm tra bằng 5-second test và squint test (nheo mắt).

---

## 1. Grid và hệ thống lưới, bố cục gọn gàng, cân đối

**Yêu cầu**
1. Dùng spacing theo bội số 4 hoặc 8 (4pt / 8pt spacing system) để đảm bảo consistency và dễ quản lý.
   - Margin và padding phổ biến: 8, 16, 24, 32, 40, 48, 56, 64px.
   - Gutter giữa các thành phần UI nhất quán, thường 16–24px.
   - Container margin (lề trái/phải tổng thể trang): tối thiểu 16–24px trên mobile, 32–64px trên desktop.
   - Grid phổ biến: 12-column system.
2. Áp dụng 3–5 breakpoints là đủ (mobile, tablet, desktop). Mốc tham khảo: iPhone 375px, iPad 768px, laptop 1024px+.
3. Bố cục phải giúp người dùng hiểu rõ thứ tự ưu tiên nội dung ngay từ cái nhìn đầu tiên (Visual Hierarchy), áp dụng nguyên tắc Gestalt.

**Chuẩn NextSky đang áp dụng (quyết định sau audit)**
- Desktop: container 1440 / 12 column / gutter 24px.
- Mobile: 4 column / gutter 12–16px / margin (lề) 20px.

**Tham chiếu đối thủ**
- Impact: desktop container 1600 / 12 column / gutter 24px; mobile 4 column / gutter 20px / margin 20px.
- Concept: desktop container 1900 / 12 column / gutter 24px; mobile 4 column / gutter 12px / margin 20px.

Nguồn: Apple HIG Layout; NN/g Responsive Web Design; NN/g Visual Hierarchy; NN/g Principles of Visual Design.

## 2. Hình ảnh liên quan đến nội dung truyền tải

**Yêu cầu**
1. Ảnh chất lượng cao, phản ánh đúng thông điệp và thương hiệu.
2. Cân nhắc kỹ yếu tố nhân vật, cảm xúc, hành động trong ảnh để phù hợp bối cảnh sử dụng.
3. Áp dụng nhất quán phong cách hình ảnh (minimalism, realism, illustration…).
4. Ảnh đầu tiên người dùng thấy phải là ảnh chụp sản phẩm thực tế hoặc lifestyle gắn với thương hiệu.
5. Banner mang tone màu và thông điệp thương hiệu.
6. Nhất quán phong cách ảnh trên toàn homepage.
7. Giao diện tổng thể thể hiện bản sắc thương hiệu.

**Bài học từ audit**: fix lại banner slideshow; fix lại thông điệp text + hình ảnh của tất cả ảnh homepage; tránh dùng ảnh stock vì không chân thật.

Nguồn: NN/g Photos as Web Content; NN/g Product Photos on Listing Pages.

## 3. Màu sắc

**Yêu cầu**
1. Tạo hệ thống màu rõ ràng: primary, secondary, tertiary và neutral.
2. Độ tương phản đạt WCAG AA trở lên, tối thiểu 4.5:1.
3. Màu phải có mục đích cụ thể: màu nổi bật cho CTA, màu trung tính cho văn bản.

**Chuẩn áp dụng / gợi ý**
- Xử lý lại hệ thống màu primary, secondary cho text heading, body, button; phân cấp lại button CTA.
- Gợi ý màu heading tham chiếu: Material #1c1b1d; Apple HIG #1d1d1f; Polaris Shopify #1c1e1e.
- Button "Buy now" nên dùng màu nổi bật (ví dụ đỏ) – nhưng lưu ý ở Buy section, Add to Cart mới là hành động chính (xem file PDP).

**Tham chiếu đối thủ**
- Impact: heading #1a1a1a; body #1a1a1a giảm opacity 30% (0.7).
- Concept: heading #171717; body #171717.

Nguồn: NN/g Low Contrast; Apple HIG Color; Polaris Using color; Polaris Colors.

## 4. Font chữ: dễ đọc, size, line-height

**Yêu cầu**
1. Kết hợp tối đa 2–3 kiểu chữ trong toàn giao diện.
2. Chọn font dễ đọc (sans-serif không chân dễ đọc).
3. Định nghĩa hierarchy rõ: tiêu đề lớn, nội dung vừa, caption nhỏ hơn. Body 16px.
4. Line-height lý tưởng 1.5–1.7 lần cỡ chữ. Ví dụ font 16px → line-height 24–27px. Apple khuyến nghị body text mobile tối thiểu 17pt, line-height khoảng 1.3–1.6.

**Kết quả audit Purity**: font 1 kiểu – đạt; size heading/body – đạt (body 16px); style (font weight) – cần trao đổi lại; line-height – cần trao đổi lại (1.5 nếu font 16px).

Nguồn: NN/g Typography Terms; Apple HIG Typography.

## 5. Icon, biểu tượng

**Yêu cầu**
1. Icon đơn giản, thông dụng, dễ hiểu ngay lần đầu, dễ nhận dạng khi scale nhỏ. Vùng chạm 44px trên mobile.
2. Đồng nhất style icon (outline, filled, rounded) toàn giao diện.
3. Có chú thích rõ nếu icon không rõ nghĩa trực quan.

**Audit**: cần check lại tất cả icon để đảm bảo tiêu chí.

Nguồn: NN/g Icon Usability.

## 6. Thứ bậc thị giác, điểm nhấn, căn chỉnh

**Yêu cầu**
1. Dùng visual hierarchy để dẫn mắt từ yếu tố chính sang phụ. Mắt di chuyển theo mô hình "F" hoặc "Z", tập trung vào tiêu đề và từ khoá nổi bật; người dùng ưu tiên visual scanning.
2. Dùng kích thước, trọng lượng font, màu tương phản để tạo điểm nhấn.
3. Căn chỉnh đồng đều, nhất quán theo trục ngang/dọc của grid.

**Cách kiểm tra**: check lại các section, card đã áp dụng mô hình chữ Z (landing, homepage) và chữ F (nội dung dài) chưa; trang web đã có điểm nhấn thị giác chưa (banner + text, product). Ghi chú audit: khối shoppable và review trên homepage thị giác chưa tốt, item và cart dày.

Nguồn: NN/g Zigzag Page Layout; NN/g Visual Hierarchy; Apple HIG Layout.

## 7. Tương phản chữ và nền

**Yêu cầu**
1. Luôn kiểm tra tương phản bằng WebAIM Contrast Checker hoặc Contrast Ratio (Shopify gợi ý).
2. Tránh màu chữ và nền quá gần nhau về độ sáng hoặc sắc độ.
3. Chú ý các trạng thái tương tác (hover, active, disabled) để giữ tương phản tối ưu.
4. Nên thay đổi màu cho liên kết đã truy cập (visited) – thêm style :visited vào thẻ a.

**Audit**: check lại một lượt banner, section để đảm bảo tương phản cao nhất; visited link chưa có.

Nguồn: NN/g Guidelines for Visualizing Links; NN/g Change the Color of Visited Links.

## 8. Khoảng trắng

**Yêu cầu**
1. Hệ thống spacing rõ ràng (8pt spacing; Polaris đề xuất bội số 4 hoặc 8).
2. Khoảng trắng giữa các thành phần theo Polaris: 8, 16, 24, 32, 40, 48, 56, 64px tuỳ context.
3. Khoảng trắng đủ lớn giữa các section (Polaris gợi ý ≥80–120px desktop) để người dùng dễ nhận diện nội dung khác nhau.

**Chuẩn NextSky áp dụng**

Desktop:
- Giữa các section lớn: 100px.
- Tiêu đề xuống nội dung: 40px (có thể tăng lên 50px).
- Giữa các thành phần (card): 24px.

Mobile:
- Giữa các section lớn: 60px.
- Tiêu đề xuống nội dung: 30px.
- Giữa các thành phần (card): 12–16px.
- Margin (lề): 20px.

Các thành phần khác: check header, section, banner, card, footer… xem có sát nhau không; khoảng trắng xung quanh card, button, input tối thiểu 16–24px để tăng trải nghiệm tương tác.

Nguồn: Polaris Space tokens.

---

## Tóm tắt thông số nhanh (Designer tra cứu)

| Hạng mục | Desktop | Mobile |
|---|---|---|
| Container / grid | 1440 / 12 col / gutter 24 | 4 col / gutter 12–16 / margin 20 |
| Section spacing | 100px | 60px |
| Heading → content | 40–50px | 30px |
| Card gap | 24px | 12–16px |
| Body font | 16px, line-height 1.5–1.7 | ≥16px (Apple gợi ý 17pt) |
| Số kiểu chữ | tối đa 2–3 | tối đa 2–3 |
| Tương phản | ≥ 4.5:1 (AA) | ≥ 4.5:1 (AA) |
| Vùng chạm icon | ≥ 40×40 | ≥ 44×44 |
| Breakpoints | 3–5 mốc | 3–5 mốc |
