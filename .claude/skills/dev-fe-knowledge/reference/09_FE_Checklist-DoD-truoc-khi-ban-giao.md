# Checklist DoD FE trước khi bàn giao

**Tiêu đề:** Checklist DoD FE trước khi bàn giao
**Loại:** Checklist
**Áp dụng cho:** Agent Dev FE
**Nguồn:** Dev.xlsx (toàn bộ các nhóm 5.1–5.5, 6.1–6.4); shopify.dev Theme Store requirements; shopify.dev Test checklist; shopify.dev Accessibility và Performance best practices

---

## Nội dung

Đánh dấu từng mục. Một mục không đạt thì task chưa Done. Nhãn: [S] = Shopify bắt buộc, [N] = nội bộ Dev.xlsx, [K] = Shopify khuyến nghị.

### A. Điểm số (đo trên home, collection, product với dữ liệu thật)

- [ ] [N] Lighthouse Performance Desktop ≥ 98 (mục tiêu ≥ 99)
- [ ] [N] Lighthouse Performance Mobile ≥ 90
- [ ] [N] Lighthouse Accessibility = 100 desktop và mobile
- [ ] [N] Lighthouse SEO = 100 desktop và mobile
- [ ] [N] Lighthouse Best Practices = 100 desktop và mobile
- [ ] [N] Accessibility Insights for Web: không lỗi
- [ ] [N] WAVE: không lỗi
- [ ] [S] W3C HTML checker: HTML hợp lệ

### B. Hiệu năng FE

- [ ] [K] Ảnh LCP: eager, `fetchpriority="high"`, không animation, không phải CSS background
- [ ] [K] Mọi `<img>` có `width`/`height` hoặc render qua `image_tag`
- [ ] [S] Ảnh responsive (`srcset`/`sizes`), ảnh ngoài viewport đầu lazy
- [ ] [S] Ảnh tôn trọng focal point (`image_tag` + `object-fit: cover`)
- [ ] [S] Không có `.scss` / `.scss.liquid`; không có `.css` tự minify
- [ ] [S] Asset link protocol-relative, không hard-code `http`/`https`
- [ ] [K] Số stylesheet tối thiểu; CSS viewport đầu tải đồng bộ
- [ ] [K] Animation chỉ dùng `transform`/`opacity`
- [ ] [K] Một menu responsive duy nhất cho desktop/mobile
- [ ] [N] Không dùng JS cho việc HTML/CSS làm được

### C. Accessibility markup

- [ ] [S] Focus nhìn thấy trên mọi phần tử tương tác khi dùng bàn phím
- [ ] [S] Thứ tự focus khớp DOM
- [ ] [S] Mọi ảnh có `alt` (trang trí: `alt=""`)
- [ ] [S] Input có ID duy nhất, label `for` khớp
- [ ] [S] Tương phản chữ 4.5:1; chữ > 18pt, icon, border 3:1
- [ ] [S] Touch target ≥ 24×24 px; [K] control chính ≥ 44×44 px
- [ ] [S] h1–h6 khác nhau về thị giác
- [ ] [S] `<html lang="{{ request.locale.iso_code }}">`
- [ ] [K] Skip link; không `maximum-scale`/`user-scalable="no"`; không tabindex dương; không autofocus
- [ ] [K] `nav` cho vùng điều hướng; không `role="menu"`; `aria-current` cho trang hiện tại
- [ ] [K] Nút dropdown là `button` có `aria-expanded`, `aria-controls`
- [ ] [K] Giá sale có text ẩn trực quan phân biệt giá gốc/giá giảm
- [ ] [K] Container `aria-live` cho giá/tình trạng variant và toast
- [ ] [K] Form: `required`, `autocomplete`, container lỗi cho `aria-describedby`
- [ ] [K] Bảng có `caption`, `th` có `scope`
- [ ] [K] Modal/drawer có `role="dialog"` và phần tử đặt tên
- [ ] [K] Không có chức năng chỉ truy cập được bằng hover

### D. UX nội bộ (Dev.xlsx nhóm 6)

- [ ] [N] 6.1 Hover thống nhất: ảnh (product item, banner, blog), button, link, banner/slider, menu (2 chế độ hover/click), icon, product card (hiện nút, ảnh thứ hai, tên sản phẩm như link)
- [ ] [N] 6.2 Loading mượt và đồng bộ: ảnh sản phẩm, popup/modal, load more, countdown, infinite scroll, lazy image, zoom ảnh
- [ ] [N] 6.3 Chuyển trạng thái: menu active, popup/modal/canvas không chồng nhau, tab nội dung chạy từ dưới lên, search popup/canvas, mini cart canvas, quickview (popup: zoom/trái→phải; canvas: phải→trái), sticky cart, sticky header (lên hiện, xuống ẩn)
- [ ] [N] 6.4 Feedback: button loading, focus border cho input/select, toast góc phải tự ẩn + progress, loader search, loading nút mini cart, progress bar trái→phải, active menu
- [ ] [S] Countdown chỉ hiển thị mốc thật, không đếm giả

### E. Độ bền layout và trình duyệt

- [ ] [S] Chạy đúng trên Safari (2), Chrome (3), Firefox (3), Edge (2); Mobile Safari (2), Chrome Mobile (3), Samsung Internet (2); webview Instagram, Facebook, Pinterest
- [ ] [S] Responsive mọi breakpoint, không cuộn ngang
- [ ] [S] Không cắt `product.title`, `collection.title`, `article.title`, mã gift card; QR gift card ≥ 120×120 px
- [ ] [S] Grid không vỡ với ảnh 16:9, 4:3, 3:2, 1:1, dọc và ngang
- [ ] [S] Text dài (30 ký tự không khoảng trắng, 30–60 ký tự nhiều từ) không tràn
- [ ] [S] Không sửa màu nút accelerated checkout và Follow on Shop; icon thanh toán full color
- [ ] [S] Account component hiển thị ở header desktop và mobile

### F. Nhất quán giao diện

- [ ] [S] RTE (h1–h6, blockquote, ul, ol, ảnh, link) giống nhau ở blog, mô tả sản phẩm, mô tả collection, page
- [ ] [S] Typography và component tương tác nhất quán toàn site
- [ ] [S] Mỗi màu nền có màu chữ tương ứng; tối thiểu 4 màu
- [ ] [S] Font load đủ bold, italic, bold-italic qua `font_modify`
- [ ] [S] Placeholder preset đúng loại (image icon, logo icon, lifestyle image)

### G. Bàn giao cho BE

- [ ] Danh sách trạng thái + hook (class/ARIA) cho từng component động
- [ ] Biến CSS thời lượng animation để BE điều phối đóng/mở
- [ ] Ghi rõ phần đã giải quyết bằng HTML/CSS và phần cần JS
