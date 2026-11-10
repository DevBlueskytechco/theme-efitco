# Sổ quyết định thiết kế Efitco (CTO)

Quyết định đã chốt, không hỏi lại. Mâu thuẫn với Figma hay bộ kiến thức thì sổ này thắng; mới nhất ở trên. Thêm dòng khi CTO chốt câu hỏi `[Q]`.

## Đã chốt
- 10/11 Vòng 3b, chốt theo đề xuất: countdown đếm cả giây là thông tin thiết yếu (WCAG 2.2.2), số aria-hidden, không chuyển động, không aria-live (P4); ngày hết sale ở metafield sản phẩm `custom.sale_ends_at` (date_time), không theo biến thể, ẩn ở biến thể không có giá gạch (P5); quickview đổi biến thể không đổi URL trang nền, chỉ đổi link "View Detail" sang `?variant=` (M4); option > 10 giá trị hiện 7 + "+N", hằng chung PDP/quickview, không thành setting (M5); nghỉ 3 s giữa hai popup tự mở (MK4); thẻ Big Offer đang mở thì popup tự mở chờ, nút Big Offer không phải popup (MK5); đã đăng ký newsletter trong phiên thì bỏ before you leave bản mã 15% (MK6).
- 10/11 HỖ TRỢ 2048 BIẾN THỂ (https://www.shopify.com/blog/2048-variants), áp cho trang sản phẩm, quickview, card và mọi chỗ chọn biến thể. Bộ chọn dựng từ option và option value (tối đa 3 option, mỗi option nhiều giá trị), không dựng từ danh sách biến thể và không nhúng JSON toàn bộ biến thể. Mỗi giá trị hiện trạng thái còn hàng hoặc không tồn tại theo lựa chọn hiện tại. Đổi lựa chọn thì tải biến thể từ server (Section Rendering theo option value) và cập nhật URL, giá, ảnh, nút. Option có nhiều giá trị phải có cách hiển thị gọn: dropdown, hoặc swatch/nút thu gọn kèm "+N" mở hết; không làm vỡ bố cục ở 360. Thiết kế phải có trạng thái đang tải, hết hàng và tổ hợp không tồn tại (ES1-T253, ES1-T262).
- 10/11 Trang sản phẩm: thanh mua dính đáy có ở mọi mốc, setting "Show on desktop" MẶC ĐỊNH BẬT (P2, ES1-T253).
- 10/11 Trang sản phẩm CÓ countdown "Sale ends in" như Figma 1:773, đặt nổi bật gần giá. Ngày hết sale lấy từ dữ liệu thật của từng sản phẩm (Designer ghi nguồn trong spec, ví dụ metafield sản phẩm); không có ngày, đã hết giờ, hoặc sản phẩm không giảm giá thì ẩn. Không đếm ngược giả (P3, ES1-T253; thay đề xuất không đưa).
- 10/11 Popup marketing: before you leave BẬT cả trên mobile; mobile dùng tín hiệu cuộn ngược nhanh, không chặn nút Back bằng `history.pushState` (MK1, ES1-T263).
- 10/11 Popup marketing mặc định: newsletter BẬT, before you leave BẬT, big offer BẬT. Mỗi lúc chỉ hiện 1 popup; người dùng đóng popup đang hiện thì popup kế tiếp mới được hiện (hàng đợi), không chồng popup (MK3, ES1-T263; thay đề xuất newsletter tắt, tối đa 1 popup mỗi phiên).
- 10/11 Chốt theo đề xuất Designer, mục "Quyết định CTO cần chốt" của từng spec: trang chủ tablet/mobile H1–H6 (index-mobile-a §13, index-mobile-b §12: hero 768 tràn 4/3 không dot, 360 ẩn ảnh trang trí, bestseller 768 4 cột, thanh dính bundle 360, nút play video, xanh Bundle discount 5.41:1); sản phẩm P1 (review từ metafield rating + app block); collection C1–C3 (3 cột khi có cột lọc, drawer lọc 90%, phân trang nút tròn 52); list-collections L1–L2; cart G1–G3 (bộ − ô + 44, upsell complementary tối đa 4, panel tóm tắt tối áp cả bundle và mini cart); search S1–S3 (link type, drawer lọc mọi mốc, `pagination` chung); blog B1–B3; article A1–A3; page PG1–PG2; 404 E1; password PW1–PW2; gift card GC1; navigation N1–N3; predictive search SR1–SR3; mini cart và quickview M1–M3 (M1 kèm quy tắc 2048 biến thể ở trên).
- 10/11 (BGĐ) Gốc thiết kế duy nhất là Figma trang chủ desktop (frame 1:359, docs/figma/img, snapshot). Không dùng trang live hay ảnh chụp store dev làm gốc thiết kế. Tablet, mobile của trang chủ và mọi trang con phát triển từ ngôn ngữ Figma này.
- 10/11 (BGĐ) Hoàn thiện toàn bộ thiết kế, BGĐ duyệt xong mới sang giai đoạn Dev.
- 10/11 (BGĐ) Phạm vi SEO 100: đo trên trang chủ, collection, sản phẩm, blog, bài viết, page. /cart, /search, /account, 404, password, gift card không tính SEO (Shopify chặn index hoặc trả 404/401); mọi trang vẫn đo Accessibility, Best Practices, Performance.
- 10/11 (BGĐ) Best Practices 100: DevOps/QA đo, tách phần do theme và phần do nền tảng Shopify; không thuộc phạm vi Designer.
- 10/11 Tài khoản khách: theme dùng tài khoản mới của Shopify (đăng ký, đăng nhập do Shopify host), không thiết kế trang customers/* (bỏ ES1-T259).
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
