---
title: Checklist Site-wide features & nguyên tắc mobile cơ bản – header/footer, overlay tĩnh, live chat, Core Web Vitals, touch target, loading, cuộn ngang
type: Checklist
scope: Các tính năng dùng chung toàn site và chuẩn mobile áp dụng cho mọi trang
source: Sheet "Site-Wide Features" (desktop + Mobile) (Nextsky - Bộ tiêu chí UX.xlsx); sheet "Note task" (vị trí icon, vùng chạm an toàn); Baymard #607D, #252D, #250D, #290D, #284D, #931D, #940D, #1498D, #1204D, #1206D, #2128D, #788D, #1705D, #2337D, #928M, #930M, #1097M, #1094M, #1083M, #1095M, #1142M, #1096M
---

# Checklist Site-wide features & nguyên tắc mobile cơ bản

Ký hiệu: Must/Should = ưu tiên; AH = tỷ lệ site lớn tuân thủ cao (Baymard); Audit = trạng thái theme Purity.

---

## 1. Site-wide (desktop)

- [ ] #607D **Làm nổi bật link giỏ hàng trong header**: độ tương phản cao; kích thước và vị trí hợp lý; hiển thị số lượng sản phẩm (Must; 90% AH) – đạt.
- [ ] #252D **Luôn có link trực tiếp "Return Policy" và "Shipping Info" ở footer** (Must; 61% AH) – đạt.
- [ ] #250D **Nhóm link footer thành các phần ngữ nghĩa riêng** (Must; 92.4% AH) – đạt. Ghi chú audit: move newsletter lên đầu footer.
- [ ] #290D **Text overlay trên ảnh phải đọc được** – đảm bảo tương phản (Must; 64.7% AH) – đạt.
- [ ] #284D **Dùng ưu đãi tĩnh thay overlay xuất hiện khi load trang** cho khuyến mãi site (Must; 62.9%) – đạt; đã có section như announcement bar.
- [ ] #931D **Chỉ yêu cầu thông tin vị trí khi người dùng truy cập tính năng cần vị trí** (Should) – đạt.
- [ ] #940D **Tránh live chat tự mở; cẩn trọng với sticky chat trên mobile** (Should; 46.6% AH): button live chat đặt dưới cùng bên phải; không tự hiện popup trong 30s đầu; dựa trên scroll behavior – cuộn được một khoảng mới hiện button. Audit: theme không có live chat nhưng có popup tương tự → đối chiếu để style và setup trigger tương tự.
- [ ] #1498D **Kiểm thử thường xuyên UI bugs & quirks; dùng progressive enhancement** (Should; 66.9% AH) – đạt.
- [ ] #1204D **Largest Contentful Paint (LCP)**: nội dung chính hiển thị nhanh (Should; 47.4% AH) – đạt.
- [ ] #1206D **Cumulative Layout Shift (CLS)**: giảm thiểu layout shift (Should; 40.2% AH) – đạt.
- [ ] #2128D **Interaction to Next Paint (INP) < 200ms** (Should; 61.6% AH) – đạt.
- [ ] #788D **Tránh yêu cầu phản hồi không do người dùng khởi tạo** (popup khảo sát, "bạn có muốn cung cấp phản hồi không") (Should; 69.6% AH) – đạt.
- [ ] #1705D **Link tới FAQs ở footer** (Should; 57.6% AH) – đạt.
- [ ] #2337D **Không dùng footnotes** kiểu [1] [2] như tài liệu Word/PDF (Should; 69.5% AH) – đạt.
- [ ] HTTPS, badge bảo mật & thanh toán hiển thị (trust).
- [ ] Mega menu: nếu trang hiện tại vẫn hiển thị ở nền thì làm mờ/thêm background đen; thêm link "Xem tất cả" (mobile và desktop), thông minh hơn khi đặt ở đầu danh sách.
- [ ] Mobile menu: dùng hiệu ứng chuyển đổi tiết kiệm, tránh phân tâm (nguyên tắc 14/17 của NN/g menu design). Audit: hiệu ứng đóng mobile khi mở sub đang lỗi; xem lại submenu mobile.

## 2. Mobile – chuẩn chung

- [ ] #928M **Luôn có loading indicator trên mobile** khi tải nội dung (Should; 22% AH): spinner hoặc skeleton cho tải nhanh; progress bar cho tải lâu (ảnh/video); vị trí gần khu vực nội dung thay đổi (ví dụ top của danh sách sản phẩm khi lọc). Audit: chưa có skeleton cho image product card khi tải chậm.
- [ ] #930M **Giảm thiểu quảng cáo cài app** (popup/banner) trên mobile (Should; 83.2% AH) – đạt.
- [ ] #1097M **Thông báo xác nhận cho hành động duyệt sản phẩm**: phản hồi sau add to cart, search, filter, click load more (Should; 83.2% AH) – đạt.
- [ ] #1094M **Khoảng cách tối thiểu giữa các phần tử chạm được** (≥ 2mm) (Should; 21.9% AH): giữa các button/link 48px; giữa các phần tử trong danh sách 24px + padding; checkbox/radio 72px – đạt.
- [ ] #1083M **Kích thước vùng chạm tối thiểu 7×7mm** (Should; 16.1% AH): nút chính (CTA) 48×48px; nút phụ 40×40px; phần tử điều hướng 44×44px; input checkbox/radio 40×40px + padding – đạt.
- [ ] #1095M **Tối ưu toàn bộ trang & nội dung cho mobile**: font-size ≥ 16px cho body text (Should; 73.5% AH) – đạt.
- [ ] #1142M **Luôn hỗ trợ phóng to/thu nhỏ bằng cử chỉ chạm**: độ phân giải ảnh đủ cho zoom 2x (Should; 65.6% AH) – đạt.
- [ ] #1096M **Tránh khu vực cuộn ngang quá cao trên mobile** (Should; 40.3% AH) – đạt.

## 3. Vùng chạm an toàn & vị trí icon (chuẩn tổng hợp)

**Kích thước touch target**
- ≥ 24×24px theo WCAG 2.5.5 AAA; ≥ 44×44px theo WCAG 2.1 2.5.5 Level AA (khuyến nghị phổ biến).
- Giao diện cảm ứng ngày nay: ít nhất 27×27px cho link/icon nhỏ trong vùng nội dung; ít nhất 44×44px cho icon ở đầu và cuối trang.
- Khoảng cách giữa các mục tiêu ≥ 8px để tránh chạm nhầm.
- Thumb-friendly: khoảng cách giữa các interactive element ≥ 40px (NN/g scrolling).

**Khoảng cách icon tới mép màn hình**
| Tiêu chuẩn | Khoảng cách tối thiểu với viền |
|---|---|
| Apple HIG | ≥ 16pt (~16px) |
| Google Material | ≥ 8dp (~8px) |
| NN/g UX audit | ≥ 8–12px tuỳ mức quan trọng |

Quy tắc NextSky: icon nhỏ cách mép ít nhất 8–12px hoặc đặt vùng trung tâm; tất cả icon X trên drawer, popup cách mép trên/trái/phải ít nhất 12px; icon back (menu) màu và kích thước bé hơn icon X.

**Vị trí nút theo pattern**
| Thành phần | Pattern | Nút đóng |
|---|---|---|
| Hamburger menu | Slide từ trái | Đóng ở góc trái (phù hợp vị trí xuất hiện, dòng chảy thị giác) |
| Cart (slide-in) | Slide từ phải | Đóng ở góc phải |

| Nút | Vị trí UX chuẩn | Khi nào dùng |
|---|---|---|
| ← Back | Góc trái trên | Quay về 1 cấp trong cấu trúc (menu, view) |
| ✕ Close | Góc phải trên | Đóng toàn bộ (menu, cart, modal, popup) |

**Gesture mobile**: vuốt phải để quay lại (iOS); vuốt trái để xoá hoặc mở tính năng phụ.

## 4. Desktop vs Mobile – bảng so sánh nhanh cho carousel/tương tác

| Tiêu chí | Desktop UX | Mobile UX |
|---|---|---|
| Điều hướng chính | Nút ← → | Vuốt (swipe) |
| Hiển thị dot (pagination) | Có, rõ ràng | Có, nổi bật hơn |
| Auto-play | Có thể có (5–7s) | KHÔNG KHUYẾN KHÍCH |
| Hover pause | Nên có | Không áp dụng |
| Chuyển động | Nhẹ, không giật | Mượt, hỗ trợ swipe |
| Tap target | ≥ 40×40px | ≥ 44×44px |
| Ảnh & text | Cân đối, không giấu | Ngắn gọn, dễ đọc |

## 5. Hiệu suất (áp dụng chung)

- Load < 2.5s; Core Web Vitals (LCP, CLS, INP/FID) đạt chuẩn.
- Lazy load ảnh; preload thông minh; nén ảnh; giảm HTTP requests cho mobile; tránh ảnh lớn desktop tải trên mobile.
- Mobile-first: thiết kế từ màn nhỏ rồi mở rộng; dùng min-width cho breakpoints; 3–5 breakpoints; breakpoint theo nội dung (khi layout vỡ: chữ tràn, nút quá gần, ảnh méo) thay vì theo thiết bị; khoảng cách giữa các breakpoint ≥ 100px; test ít nhất 5 kích cỡ màn hình.
- Quy tắc 80/20 đa thiết bị: 80% nội dung giống nhau, 20% điều chỉnh theo ngữ cảnh; 3 cấp ưu tiên – chức năng cốt lõi (luôn hiển thị), tính năng phụ (adaptive), nội dung thứ cấp (có thể ẩn).
- Tối ưu ảnh/asset, giao diện tiết kiệm năng lượng, cân nhắc system fonts để giảm dung lượng.

## 6. Tương thích

- Cross-browser: Chrome, Safari, Firefox; scrollbar hiển thị khác nhau giữa trình duyệt – phải test.
- Cross-platform: giao diện thống nhất trên thiết bị; tôn trọng cài đặt hệ điều hành (dark mode).
- App compatibility: kiểm tra với các app phổ biến merchant hay dùng, đảm bảo không xung đột config.
