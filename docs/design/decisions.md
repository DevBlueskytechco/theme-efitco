# Sổ quyết định thiết kế Efitco (CTO)

Quyết định đã chốt, không hỏi lại. Mâu thuẫn với Figma hay bộ kiến thức thì sổ này thắng; mới nhất ở trên. Thêm dòng khi CTO chốt câu hỏi `[Q]`.

## Đã chốt
- 10/11 Hero 768 và 360: lớp tối 30% (overlay_opacity 30, chỉ dưới 1280; desktop giữ như Figma). Cần đạt hết AA thì chọn ảnh có vùng nền trơn sau chữ, không tăng lớp tối (ES1-T252).
- 10/11 Hero 360: chữ căn trái, cùng mép 20 với các khối dưới (thay căn giữa của bản 07/11) (ES1-T252).
- 10/11 Eyebrow trên nền tối (vd Why choose): giữ xám như live (#999, 5.85:1). Cam chỉ dùng trên nền sáng và sand; ngoại lệ của dòng eyebrow 09/11 (ES1-T252).
- 10/11 Header trang chủ: thanh tối riêng cao 80px trên dải nền #1A1A1A có noise (Figma 1:362), hero là thẻ bo góc nằm dưới header, KHÔNG đè ảnh. Sửa nhận định sai của ES1-T251.
- 10/11 Header trang con giống trang chủ: luôn là thanh tối riêng (#1A1A1A có noise, như Figma 1:362), không đè ảnh, kể cả trang có banner hay ảnh bìa lớn. Thay quyết định 09/11 (nền trắng, đè ảnh khi có ảnh lớn).
- 09/11 Viền ô nhập: nền sáng dùng `--color-muted-light` (5.33:1), footer nền tối dùng `--color-muted-on-dark` (5.85:1); không dùng `--color-border` cho ô nhập (ES1-T251).
- 09/11 Toast: cảnh báo dùng cam accent, thành công dùng `--color-badge-new`, không thêm token (ngoại lệ của quy tắc accent chỉ cho hành động, ES1-T251).
- 09/11 CHỈ TIÊU NGHIỆM THU (ưu tiên số 1, đo Lighthouse trên demo): SEO 100, Accessibility 100, Best Practices 100 cả desktop và mobile; Performance desktop ≥98, mobile ≥90. Mọi thiết kế phải đạt được khi dựng. Hệ quả cho thiết kế:
  - A11y: chữ AA ở mọi nơi (kể cả trạng thái hover, placeholder, chữ trên ảnh), focus nhìn thấy, vùng chạm ≥24px (mobile ≥44px), mỗi link/nút có tên riêng, heading đúng thứ tự, form có label, popup là dialog có tiêu đề và nút đóng.
  - SEO: chữ link mô tả đích (không để "Read more", "Learn more", "Click here" đứng một mình), ảnh có alt, chữ ≥12px.
  - Performance: màn đầu 1 ảnh lớn (LCP), không video tự chạy ở màn đầu mobile, tối đa 2 họ font, ảnh trong menu/popup tải khi mở; popup marketing không mở lúc tải trang (chờ thời gian, cuộn hoặc ý định rời trang), chừa chỗ để không xô lệch bố cục.
  - Best Practices: ảnh đúng tỉ lệ và độ phân giải, không hiệu ứng gây lỗi console.
- 09/11 Mọi trang và overlay thiết kế đủ 3 phiên bản: desktop (1280, 1920), tablet (768), mobile (360); kể cả trang chủ (Figma chỉ có desktop).
- 09/11 Overlay cần có: popup newsletter, popup before you leave, mega menu, search popup (khi gõ, không có sản phẩm, tab canvas), search tab, popup mini cart, quickview, popup offer (hover big offer).
- 09/11 Eyebrow (sub heading) màu cam accent như Figma; trên nền sand dùng `--color-accent-on-sand` (AA). Thay E3.
- 09/11 Nút next/back tròn 52px: mặc định trắng viền #E5E5E5, rê chuột mới cam. Mọi carousel.
- 09/11 Hàng ngang (video, testimonial, blog, danh mục): next/back ở đầu khối + thanh tiến trình mảnh; không dùng thanh cuộn trình duyệt; mobile ẩn nút, vuốt.
- 09/11 Quiz: kết quả mở popup (mobile bottom sheet), không bung ra trong trang.
- 09/11 Chữ lớn có phần nhấn ("Get 15% Off") màu cam; chữ lớn chỉ cần 3:1.
- 09/11 Nội dung hero thẳng mép trái container (cùng mép logo và khối dưới).
- 09/11 Chuyển động: chữ và card hiện dần khi cuộn tới, ảnh lớn mở dần; chỉ transform/opacity/clip-path; tắt khi giảm chuyển động.
- 07/11 Giao diện theo Figma, dữ liệu luôn lấy động từ Shopify (giá, ảnh, tên, badge).
- 07/11 Chữ nút thêm giỏ: "Add To Cart" (Title Case như Figma).
- 07/11 Giữ ngoại lệ AA trong `tests/e2e/support/figma-exceptions.json` (E1 accent #C8400E thay #D94610; E2 xám #6B6B6B trên nền sáng).
- 07/11 Không dòng ghi chú giảm giá dưới bundle và shop the look.
- 07/11 Hero desktop không thanh chỉ báo slide, chỉ mũi tên; mobile ảnh tràn màn, không bo góc, không mũi tên, dot 44×44.
- 07/11 Trạng thái hover theo Figma; card label: font, cỡ, màu như Figma, logic theo dữ liệu.
- 07/11 Trải nghiệm mượt theo checklist trai_nghiem.xlsx (skill ux-motion).
- 06/11 Trang chủ giống 100% Figma frame 1:359 là mục tiêu số 1.
- 06/11 Badge Verified mặc định tắt (E9); bậc giảm bundle 10%, 15% tính thật (E7).
- 30/10 Font: heading Sofia Sans Condensed, body Inter, chỉ qua font_picker, không tự nhúng font (R15).

## Chưa chốt (ghi ĐỀ XUẤT, không tự quyết)
- Ảnh một số sản phẩm trên store dev chưa khớp tên (ES1-T245).
