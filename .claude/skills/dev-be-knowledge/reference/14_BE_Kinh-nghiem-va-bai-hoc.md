# Kinh nghiệm và bài học khi làm BE theme Shopify

**Tiêu đề:** Kinh nghiệm và bài học khi làm BE theme Shopify
**Loại:** Kinh nghiệm
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Đối chiếu Dev.xlsx với shopify.dev (Theme Store requirements, Settings, Input settings, Theme editor integration, Performance, Testing) ngày 09/11/2026

---

## Nội dung

### 1. Tài liệu trong file nguồn đã thay đổi

Khi mở các link trong Dev.xlsx:
- Trang **Style settings** (`/architecture/settings/style-settings`) trả về 404. Không còn tài liệu "style settings" riêng để áp dụng.
- Trang **Deprecated settings** chuyển hướng sang Input settings.
- Số mục trên trang Theme Store requirements đã đổi: Settings nay là mục 14, Accessibility mục 12, Browser compatibility mục 9, Features mục 4, Templates/sections/blocks mục 5, Lighthouse mục 6.
- Một số ô có text URL đúng nhưng hyperlink thực tế trỏ sai anchor: Theme editor event, Style, Terminology, Section name, Preset name đều trỏ #basic-requirements; Footer trỏ #2-header; Home trỏ #unique-sections; Share, Local pickup, Mini cart, Product (rich media, selling plans) trỏ #gift-card-page; Desktop browser requirements trỏ BrowserStack.
- Ba dòng cuối mục 5.5 có nhãn chưa khớp nội dung: "Mini Cart, modal, or drawer" trỏ mục Unit pricing; hai dòng "Product" trỏ Rich media và Selling plans.

Bài học: tra theo tên mục trên shopify.dev. Các điểm trên nên được team cập nhật trong file gốc.

### 2. Requirement mới hơn file nguồn

Những yêu cầu bắt buộc hiện có trên shopify.dev mà Dev.xlsx chưa ghi rõ, dễ bị bỏ sót:
- Account component `<shopify-account>` trong header desktop và mobile.
- Follow on Shop qua `login_button`, không sửa màu.
- Swatch qua `swatch.color` / `swatch.image`.
- `metaobject`/`metaobject_list` chỉ dùng standard definition.
- Tương phản màu và touch target 24×24 px trong Accessibility requirements.
- Chỉ Skeleton Theme được dùng làm nền; theme dựa trên Dawn/Horizon không được nhận.

Requirements của Shopify thay đổi theo thời gian. Trước mỗi lần submit, đọc lại trang requirements.

### 3. Pass Shopify chưa phải Done

Shopify: Performance trung bình ≥ 60, Accessibility ≥ 90. Team: Performance Desktop ≥ 98, Mobile ≥ 90, Accessibility/SEO/Best Practices = 100. Đo theo ngưỡng team.

Dev.xlsx có 2 con số Desktop (tiêu đề nhóm ≥ 99, dòng chi tiết ≥ 98). Bộ kiến thức dùng ≥ 98 làm ngưỡng chặn, ≥ 99 làm mục tiêu cho tới khi team chốt.

### 4. Tính năng "giống app" bị từ chối

Shopify nêu rõ wishlist, đặt lịch hẹn, mã giảm giá cấp cart, Instagram feed là tính năng kiểu app, cần API, không được đưa vào theme. Không xây các tính năng này dù khách hàng hay yêu cầu.

### 5. Countdown, tồn kho, lượt xem: chỉ dữ liệu thật

Dev.xlsx có countdown timer trong nhóm loading animation. Shopify cấm countdown giả, số tồn kho giả, số người đang xem giả. Countdown chỉ chạy theo mốc merchant nhập và không tự reset.

### 6. JS chạy một lần là không đủ trong theme editor

Lỗi thường gặp: slider chạy trên storefront nhưng chết khi merchant thêm section trong editor, vì JS chỉ init lúc tải trang. Mọi component phải init lại ở `shopify:section:load` và dọn ở `shopify:section:unload`. Đây cũng là cách đáp ứng tiêu chí Dev.xlsx "thay đổi cài đặt mà không gặp lỗi".

### 7. Default sai làm hỏng trải nghiệm cài đặt

- `link_list` header/footer không default `main-menu`/`footer` → theme cài xong menu trống.
- Default `product`/`collection` trỏ resource chỉ có ở store demo → store mới bị trống hoặc lỗi.
- Template JSON chứa URL `shopify://` hoặc metafield tuỳ biến của demo → không chạy ở store merchant.
- Dynamic source default liên quan product đặt trong section dùng được ở trang khác → lỗi.

### 8. Giới hạn ngầm của setting

- `product_list`, `collection_list`, `article_list`: tối đa 50.
- `color_palette`: một bộ duy nhất, 2–20 màu, hex không alpha, chỉ trong `settings_schema.json`.
- `color_scheme` không dùng trong app block.
- `liquid` không truy cập `section`, `settings`, `content_for_*`, `javascript`, `stylesheet`, `schema`.
- `richtext` default không bọc `<p>`/`<ul>` → lỗi.
- `inline_richtext` không có xuống dòng.
- `placeholder` của `text`/`number`/`textarea` chỉ hiện ở `settings_schema.json`, không hiện trong section schema.

### 9. Nguyên nhân TTFB cao số một

Shopify gọi vòng lặp Liquid lồng nhau (products × variants × options, metafield trong loop) là nguyên nhân phổ biến nhất của TTFB cao. Theme nhanh với 10 sản phẩm có thể chậm với 100. Luôn đo bằng CSV performance test, không đo bằng store demo ít sản phẩm.

### 10. Quickview và featured product là "trang product thu nhỏ"

Dev.xlsx 5.4 ghi rõ test data áp dụng cho Quickview và Featured product. Shopify review kiểm tra rich media trong quick view và chạy toàn bộ test product page trên featured product (kể cả 3 section trùng cùng một sản phẩm). Logic variant picker phải tách thành component dùng chung, không nhân bản theo từng nơi, và không được dùng ID cố định khiến 2 instance cùng sản phẩm xung đột.

### 11. Text trong schema là thứ reviewer đọc đầu tiên

Lỗi text style/terminology (British spelling, &, "Slider" thay vì "Slideshow", "Ajax cart" thay vì "Cart type", "Position 1/2/3") là lỗi dễ tránh nhưng hay bị trả về. Rà toàn bộ schema theo file 02 trước khi submit.
