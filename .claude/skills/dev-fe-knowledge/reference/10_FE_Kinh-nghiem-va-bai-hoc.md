# Kinh nghiệm và bài học khi làm FE theme Shopify

**Tiêu đề:** Kinh nghiệm và bài học khi làm FE theme Shopify
**Loại:** Kinh nghiệm
**Áp dụng cho:** Agent Dev FE
**Nguồn:** Đối chiếu Dev.xlsx với shopify.dev (Theme Store requirements, Performance best practices, Accessibility best practices, Test checklist) ngày 09/11/2026

---

## Nội dung

### 1. Hiệu ứng đẹp nhưng không được đánh đổi LCP

Dev.xlsx muốn ảnh sản phẩm, popup, banner có hiệu ứng tải mượt. Shopify xếp 3 lỗi sau vào nhóm ảnh hưởng LCP mức High:
- lazy-load ảnh LCP;
- giấu ảnh LCP sau fade-in/reveal;
- dùng CSS background-image cho hero.

Bài học: hiệu ứng xuất hiện chỉ áp cho nội dung ngoài viewport đầu. Ảnh hero/ảnh sản phẩm chính hiện ngay, không animation. Như vậy vừa giữ được DoD UX vừa giữ được DoD Performance (Desktop ≥ 98, Mobile ≥ 90).

### 2. Ngưỡng nội bộ cao hơn Shopify rất nhiều

Shopify chỉ yêu cầu trung bình Performance ≥ 60 và Accessibility ≥ 90. Team yêu cầu Performance Desktop ≥ 98, Mobile ≥ 90, Accessibility/SEO/Best Practices = 100. Pass Shopify chưa phải Done. Luôn đo theo ngưỡng nội bộ.

Trong Dev.xlsx có 2 con số cho Desktop: dòng tiêu đề nhóm ghi "≥ 99", dòng chi tiết ghi "≥ 98". Bộ kiến thức này dùng ≥ 98 làm ngưỡng chặn và ≥ 99 làm mục tiêu cho tới khi team chốt lại.

### 3. Danh sách accessibility trong file nguồn chưa đủ

Dev.xlsx liệt kê 7 accessibility requirement. Trang requirements hiện tại của Shopify có 9 mục, thêm:
- tương phản chữ 4.5:1 (chữ > 18pt, border, icon 3:1);
- touch target tối thiểu 24×24 CSS px.

Hai mục này là bắt buộc, theme thiếu sẽ bị reject.

### 4. Ba con số touch target khác nhau, đừng nhầm

| Con số | Ở đâu | Tính chất |
| - | - | - |
| 24×24 CSS px | Theme Store requirements – Accessibility | Bắt buộc, tối thiểu |
| 44×44 px | Accessibility best practices – Touch screen | Khuyến nghị cho control chính |
| 48×48 px | Performance best practices – Mobile experience | Khuyến nghị cho phần tử tương tác trên mobile |

Làm theo 44×44 cho control chính để an toàn với cả Lighthouse lẫn reviewer.

### 5. Countdown timer dễ thành vi phạm

Dev.xlsx có mục loading animation cho Countdown timer. Shopify cấm "fictitious countdown timers" (cùng với số tồn kho giả, số người đang xem giả). Countdown chỉ được hiển thị hạn thật do merchant nhập. Không làm demo kiểu đếm lại khi reload.

### 6. Hover không phải là cách duy nhất

Shopify ghi rõ theme không được phụ thuộc hover để hiển thị/truy cập nội dung. Product card ẩn nút "Add to cart" chỉ hiện khi hover sẽ fail trên mobile và với người dùng bàn phím. Nút phải hiện khi focus và có cách bấm trên cảm ứng.

### 7. Hiệu ứng không làm theme "khác biệt"

Shopify coi chỉnh animation/transition, spacing, màu, font, gradient, hiệu ứng nền là thay đổi bề ngoài, không tính là khác biệt khi xét uniqueness. Khác biệt phải nằm ở cấu trúc: hệ header/navigation, product card, cách xử lý media, cấu trúc trang.

### 8. Đừng tin hoàn toàn vào anchor trong file nguồn

Khi đối chiếu Dev.xlsx với shopify.dev:
- Số mục trên trang requirements đã đổi: Accessibility (file ghi #11) nay là mục 12; Browser compatibility (file ghi #8) nay là mục 9; Features (file ghi #3) nay là mục 4.
- Trang "Style settings" (`/architecture/settings/style-settings`) trả về 404.
- Một số ô có text URL đúng nhưng hyperlink thật trỏ sai anchor (ví dụ Theme editor event / Style / Terminology / Section name / Preset name đều trỏ về #basic-requirements; Footer trỏ về #2-header; Home trỏ về #unique-sections; share/local pickup/unit pricing/rich media/selling plans trỏ về #gift-card-page).

Bài học: tra theo tên mục trên shopify.dev, không bấm thẳng link trong file.

### 9. Component ẩn vẫn tốn DOM

Cart drawer, filter panel, mega menu, quickview nằm sẵn trong DOM dù đóng, làm DOM phình và hại INP. Shopify khuyến nghị chỉ dựng nội dung khi mở. FE thiết kế markup tách khung và nội dung để BE nạp nội dung sau.

### 10. Hai menu = gấp đôi DOM

Dựng riêng menu desktop và menu mobile là lỗi phổ biến. Shopify khuyến nghị một menu, đổi giao diện bằng media query.

### 11. Test bằng dữ liệu biên, không test bằng dữ liệu demo đẹp

Reviewer Shopify dùng tên 30 ký tự không khoảng trắng, menu 10+ mục 3 cấp, ảnh 4 tỉ lệ, 25 section trên trang chủ, sản phẩm 100 variant, sản phẩm không ảnh. Layout chỉ đẹp với dữ liệu demo là chưa xong. Import CSV test của Shopify (xem tài liệu Testing assets) trước khi tự nghiệm thu.

### 12. Màu thương hiệu của nút checkout và Follow on Shop

CSS reset hoặc style button chung dễ vô tình đè lên nút accelerated checkout và Follow on Shop. Shopify cấm sửa màu các nút này. Selector style button chung phải loại trừ các phần tử này.
