# Sổ quyết định thiết kế Efitco (CTO)

Quyết định đã chốt, không hỏi lại. Mâu thuẫn với Figma hay bộ kiến thức thì sổ này thắng; mới nhất ở trên. Thêm dòng khi CTO chốt câu hỏi `[Q]`.

## Đã chốt
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
- Header trang con: nền tối như trang chủ hay nền trắng (T241 và T244 đề xuất ngược nhau).
- Ảnh một số sản phẩm trên store dev chưa khớp tên (ES1-T245).
