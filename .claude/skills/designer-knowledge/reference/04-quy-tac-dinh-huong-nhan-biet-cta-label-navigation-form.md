---
title: Quy tắc UI nhóm 2 – Định hướng & nhận biết (Discoverability): CTA, label, header, navigation, form, thông báo
type: Quy tắc
scope: Header, menu, breadcrumbs, tabs, search bar, button CTA, label, form, notification trên toàn theme
source: Sheet "Định hướng" / "Định hướng và nhận biết" (Nextsky - Bộ tiêu chí UX.xlsx; NGHIÊN CỨU UX_UI.xlsx); mục Discoverability checklist trong "Nội dung Bộ tiêu chí"
---

# Quy tắc UI nhóm 2 – Định hướng & nhận biết (Discoverability)

Ngữ cảnh: người dùng cần biết họ có thể làm gì, nên click vào đâu. Mục tiêu: dẫn hướng tốt, giảm bối rối ban đầu. Kết quả lý tưởng: thời gian tìm thấy các chức năng chính dưới 5 giây.

---

## 1. Các CTA dễ nhận ra (tối đa 5 CTA chính, tránh loạn)

1. Tối đa 5 CTA chính trên mỗi màn hình/trang.
2. Trong mỗi section chỉ có duy nhất 1 CTA chính.
3. CTA đặt tại vị trí dễ nhận diện theo mô hình quét mắt chữ "Z" hoặc "F" (top-left đến bottom-right).
4. CTA chính nằm trong tầm nhìn đầu tiên (above the fold) khi trang vừa tải.
5. Khoảng cách giữa CTA và các thành phần khác tối thiểu 24–32px để tránh nhầm khi tương tác.
6. Tương phản màu CTA đạt WCAG AA (≥ 4.5:1).
7. Kích thước nút CTA đủ lớn: cao ít nhất 44px, đặc biệt trên mobile.
8. Tránh từ chung chung như "Submit", "Click Here", "Next" nếu không đi kèm context rõ.
9. Độ dài label tốt nhất dưới 3 từ.
10. Trạng thái rõ ràng: default, hover, active (khi nhấn), disabled.

**Chuẩn button NextSky**
- Desktop: cao 56px (có thể 58 hoặc 60) × padding 2 bên 30px (Material Design: 48–56px). Nội dung trong button không quá dài, 2–3 (tối đa 4) từ. Font size 16px.
- Mobile: cao 50px × padding 2 bên 24px. Khoảng cách giữa các button 20px. Font size 16px.
- Chia lại mức độ quan trọng cao – thấp của button (primary / secondary) trên homepage.
- Đối thủ: Impact CTA 60px, padding 2 bên 40px; Concept CTA 60px, padding 2 bên 30px.

**Audit Purity**: chưa có trạng thái disabled; cần phân chia lại CTA chính/phụ trên homepage; check lại các button và label.

Nguồn: NN/g Homepage Design Principles; Polaris Button; NN/g F-Shaped Pattern.

## 2. Label dễ hiểu (Signifiers)

1. Dùng từ ngữ phổ biến, dễ hiểu; tránh thuật ngữ chuyên ngành hoặc ngôn ngữ nội bộ.
2. Label mô tả chính xác hành động/nội dung (ví dụ "Add to Cart" thay vì "Submit").
3. Độ dài lý tưởng dưới 3 từ để quét nhanh.
4. Nhãn (label) nên đặt bên trái ô input (theo xu hướng chú ý nghiêng trái).
5. Label bắt đầu bằng động từ hành động cụ thể (Buy, Subscribe, Explore, Download).
6. Tránh động từ mơ hồ như "Click", "Go", "Continue" nếu thiếu context.

**Audit**: check lại các label toàn site; một số CTA giống nhau ("Shop Now") nhưng không nói rõ dẫn đến danh mục nào → cần cụ thể hơn ("Shop Serums", "Shop Bundles"…).

Nguồn: NN/g Horizontal Attention Leans Left; Polaris Naming.

## 3. Vị trí logo, menu, giỏ hàng, tìm kiếm… dễ tìm

1. Logo đặt bên trái, luôn clickable và dẫn về trang chủ.
2. Menu chính đặt ngang phía trên hoặc dọc bên trái trên desktop.
3. Menu mobile dùng icon Hamburger rõ ràng, ở góc phải hoặc trái trên cùng.
4. Menu items dùng label rõ ràng, không dài dòng (1–3 từ/item).
5. Menu tối đa 5–7 mục chính để tránh quá tải nhận thức.
6. Icon giỏ hàng luôn ở góc phải trên cùng của header (chuẩn ngành e-commerce), có indicator số lượng mặt hàng; trên mobile touch target ít nhất 44×44px.
7. Search dùng placeholder rõ, ví dụ "Search products..." thay vì chỉ "Search". Gợi ý tốt hơn: "Search t-shirt, sweater, dress…".
8. Sticky navigation bar, chiều cao tối đa 64–80px.
9. Có trạng thái hover và active rõ ràng cho các nút điều hướng (menu, icon giỏ hàng, tìm kiếm).

**Audit Purity**: icon search 22px chưa tính size touch (chuẩn 44×44), hiện tại 40×40 → cần tăng; chưa có hover/active cho nút điều hướng; announcement bar cần check nội dung và thêm link nếu có; menu check lại nội dung và thứ tự từ trái qua phải.

**Có nên để link "Home" trong menu?**
- Nên để khi: đối tượng phổ thông, lớn tuổi, ít am hiểu công nghệ; logo chưa đủ nổi bật; menu còn dư chỗ; cần hỗ trợ người lần đầu truy cập.
- Không nên để khi: đối tượng trẻ, hiện đại, quen click logo về trang chủ; logo rõ ràng nổi bật; menu giới hạn 5–7 mục và muốn ưu tiên mục quan trọng khác. → Trao đổi với team rồi quyết định theo từng theme.

Nguồn: NN/g Logo Placement and Brand Recall.

## 4. Thanh điều hướng (Navigation Components)

**Tabs**
- Dùng khi số lượng nội dung từ 3–7 mục.
- Tabs nằm phía trên nội dung chính, dễ nhận diện.
- Label ngắn gọn, tối đa 1–2 từ.
- Tab đang chọn (active) luôn hiển thị nổi bật rõ ràng. Audit: xem lại để luôn có trạng thái active cho tab được chọn.
- Các tab chưa chọn vẫn phải dễ nhìn, dễ đọc – không làm mờ hoặc ẩn.

**Menu chính (Primary Navigation)**
- Menu ngang phía trên (desktop) hoặc hamburger (mobile).
- Tối đa 5–7 mục.
- Luôn hiển thị rõ ở đầu trang, không bị che.
- Mục đang chọn được highlight (active).

**Breadcrumbs**
- Nằm ngay trên tiêu đề chính hoặc nội dung chính.
- Dấu phân cách rõ, dễ hiểu (">", "/").
- Hiển thị đầy đủ, chính xác đường dẫn trang hiện tại.
- Link clickable (trừ trang hiện tại).
- Font size nhỏ hơn tiêu đề chính nhưng dễ đọc (14–16px).

**Search bar**
- Đặt cố định, rõ ràng; ưu tiên góc trên bên phải hoặc giữa trang.
- Placeholder rõ ("Search products...").
- Ô nhập đủ rộng: desktop tối thiểu 200–400px.
- Icon kính lúp đi kèm để nhận diện nhanh.

Nguồn: NN/g Tabs Used Right; Polaris Tabs; Apple HIG Segmented Controls; NN/g Menu Design; NN/g Breadcrumbs.

## 5. Biểu mẫu nhập liệu (Forms & Input Fields)

1. Label đặt trên cùng (recommended) hoặc bên trái ô nhập; rõ ràng, dễ hiểu, không thuật ngữ.
2. Không chỉ dùng placeholder thay thế hoàn toàn cho label. Gợi ý từ audit: khi nhập, label nhảy lên trên chứ không mất đi, để hỗ trợ trí nhớ ngắn hạn; thứ tự các trường không thay đổi giữa các lần.
3. Hiển thị trạng thái rõ khi ô đang được chọn (focused).
4. Trạng thái lỗi (validation errors) trực quan, màu đỏ, giải thích rõ lỗi.
5. Trạng thái disabled rõ (màu mờ hơn, cursor không tương tác).
6. Hỗ trợ tự động điền (auto-complete).
7. Layout form dễ quét nhanh (scanability).
8. Icon trong form đơn giản, thông dụng, vùng chạm 44px trên mobile, đồng nhất style, có chú thích nếu không rõ.

Nguồn: NN/g Form Design Placeholders; NN/g Web Form Design; Polaris Form.

## 6. Thông báo, cảnh báo (Notifications, Alerts, Toasts)

1. Rõ ràng về nội dung và mục đích thông báo.
2. Phân biệt rõ các loại: thông thường (info), cảnh báo (warning), lỗi (error), thành công (success).
3. Màu sắc rõ và nhất quán: Info – xanh hoặc xám; Success – xanh lá; Warning – vàng hoặc cam; Error – đỏ.

**Lưu ý hỗ trợ trí nhớ ngắn hạn (STM)**: không hiển thị thông tin quan trọng (như thông báo lỗi) rồi làm biến mất ngay (ví dụ chỉ 2 giây), vì thông tin trong STM rất mong manh. Dùng nhiều kênh (thị giác, thính giác, xúc giác) để giảm nhiễu.

**Audit**: cần tối ưu lại text thông báo.

Nguồn: Polaris Error Messages.

## 7. Modal / Dialog trực quan và không gây khó chịu

Xem chi tiết file "Quy tắc popup, drawer, overlay & motion". Nguyên tắc lõi: có nút đóng rõ, không mở chồng popup, không xuất hiện ngay khi vào trang, đóng được bằng Escape/vuốt.

---

## Checklist nhanh Discoverability

- [ ] CTA chính, menu chính, nút tìm kiếm, đăng nhập… nằm ở vị trí dễ thấy ngay khi vào trang.
- [ ] Mỗi trang ≤ 5 CTA chính; mỗi section 1 CTA chính.
- [ ] Button đạt kích thước chuẩn (desktop 56–60px cao, mobile 50px) và contrast ≥ 4.5:1.
- [ ] Icon phổ biến (giỏ hàng, kính lúp, hamburger, trái tim); icon không thông dụng phải kèm chữ.
- [ ] Label/button dễ hiểu, gần gũi, không thuật ngữ kỹ thuật.
- [ ] Menu chính < 7 mục, không mục quá dài.
- [ ] Logo trái, link về trang chủ; giỏ hàng phải, có số lượng.
- [ ] Tab/menu đang chọn có trạng thái active.
- [ ] Breadcrumb đầy đủ, clickable.
- [ ] Form có label thật, trạng thái focus/error/disabled rõ.
- [ ] Thông báo phân loại 4 kiểu, không biến mất quá nhanh.
