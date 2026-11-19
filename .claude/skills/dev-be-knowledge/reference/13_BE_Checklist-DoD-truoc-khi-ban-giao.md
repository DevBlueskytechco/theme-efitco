# Checklist DoD BE trước khi bàn giao

**Tiêu đề:** Checklist DoD BE trước khi bàn giao
**Loại:** Checklist
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx (Settings 1.1–1.2, Dựng settings đúng type, 5.1–5.5, 6.1–6.4); shopify.dev Theme Store requirements; shopify.dev Settings; shopify.dev Performance, Accessibility best practices; shopify.dev Test checklist

---

## Nội dung

Một mục không đạt thì task chưa Done. Nhãn: [S] Shopify bắt buộc, [N] nội bộ Dev.xlsx, [K] Shopify khuyến nghị.

### A. Settings

- [ ] [N] Settings đã nghiên cứu và đưa lên file theo định dạng quy định (Google Sheet nội bộ)
- [ ] [N] Merchant đổi được mọi nội dung, màu, font, ảnh, link qua editor, không cần sửa Liquid/CSS/JS
- [ ] [N] Setting nhóm bằng `header`, có `info`/`paragraph` khi cần, setting phụ dùng `visible_if`
- [ ] [N][S] Đổi setting: preview cập nhật ngay, không lỗi
- [ ] [S] Mọi setting có `label`; label/info đúng ngữ pháp, chính tả
- [ ] [S] Default nội dung chỉ dẫn cách dùng, không Lorem Ipsum, không nội dung demo
- [ ] [S] Có favicon; logo nhận mọi tỉ lệ; có `theme_info`
- [ ] [S] `link_list` header default `main-menu`, footer default `footer`
- [ ] [S] Default resource trỏ tới resource tồn tại; `.json` không chứa resource riêng của demo store
- [ ] [S] `metaobject`/`metaobject_list` chỉ dùng standard definition
- [ ] [S] Text style: sentence case, không đánh số option, American English, không &, không câu hỏi, không lặp chủ thể, chủ động, button bắt đầu bằng động từ, định dạng thông số đúng mẫu
- [ ] [S] Terminology đúng bảng Shopify
- [ ] [S] Tên section theo chức năng; tên preset theo nội dung; placeholder preset đúng loại
- [ ] [S] Không thêm/sửa setting Custom CSS của platform
- [ ] Giá trị setting rỗng được kiểm tra `blank` trước khi output

### B. Setting types

- [ ] [N] Dùng đúng type Shopify: màu → `color`; font → `font_picker` có default còn available; menu → `link_list`; ảnh → `image_picker`; resource → type resource
- [ ] [S] CSS load đủ bold, italic, bold-italic qua `font_modify`; không custom font
- [ ] [S] Tối thiểu 4 màu; mỗi màu nền có màu chữ
- [ ] `richtext` default bọc `<p>`/`<ul>`; `range` có `min`/`max`; `video_url` có `accept`
- [ ] Không vượt giới hạn dynamic source (100/template, 100/theme settings, 100/section group, 50/setting, 50/static section)

### C. Theme editor

- [ ] [S] Mọi section/block có JS xử lý `shopify:section:load/unload`; `select`/`deselect` cho slideshow, popup, drawer, tab, mega menu
- [ ] Block có `{{ block.shopify_attributes }}`; section/block cần thêm từ editor có `presets`
- [ ] [S] Không JS can thiệp tính năng native trong editor/admin

### D. Tính năng và template

- [ ] [S] Đủ template: `theme.liquid`, 404, article, blog, cart, collection, index, list-collections, page, page.contact, password, product, search (JSON), `gift_card.liquid`, `settings_data.json`, `settings_schema.json`
- [ ] [S] Không có `config/markets.json`, `robots.txt.liquid`
- [ ] [S] Custom Liquid section trên mọi template; Custom Liquid block; header/footer là section group
- [ ] [S] Main product chia block; app block ở main product và featured product
- [ ] [S] Đủ tính năng: discounts (cart), accelerated checkout (product, cart, bật mặc định), faceted filtering (collection, search), gift card, focal point, `page_image`, country/language selector, multi-level menu, newsletter, pickup (product), related + complementary recommendations, rich media (product, featured product, quickview), search + predictive search, selling plans (cart), Shop Pay Installments (product), unit pricing (collection, product, cart), variant images, Follow on Shop, `<shopify-account>`
- [ ] [S] Dữ liệu từng trang đúng file 07 (product, collection, collection list, cart, page, blog, article, search, 404, gift card, password)
- [ ] [S] `lang` trên `<html>`; `routes` cho URL; không parse `content_for_header`; icon thanh toán qua `enabled_payment_types`
- [ ] [S] SEO metadata (title, description, canonical); rich product snippet; Open Graph, Twitter card
- [ ] [S] Link domain Shopify có `rel="nofollow"`; asset protocol-relative; script host trên Shopify
- [ ] [S] Không Sass, không `.css`/`.js` tự minify
- [ ] [S] Không chức năng phụ thuộc app, không tính năng kiểu app, không dữ liệu giả, không credit/affiliate

### E. Hiệu năng

- [ ] [N] Performance Desktop ≥ 98 (mục tiêu ≥ 99), Mobile ≥ 90; [N] SEO, Best Practices = 100
- [ ] [N] JS chỉ dùng khi HTML/CSS không làm được; nội dung chính render bằng Liquid
- [ ] [K] Không loop lồng products × variants; metafield ngoài loop; `limit`/`paginate` cho mảng
- [ ] [K] Script không quan trọng `defer`; JS component load khi tương tác; handler scroll throttle/passive/rAF
- [ ] [K] Dialog/drawer nạp nội dung khi mở; cập nhật động qua Section Rendering API
- [ ] [K] Truyền `section.index` để phân biệt section trên/dưới màn hình đầu

### F. Accessibility (phần JS)

- [ ] [N] Accessibility = 100; Accessibility Insights và WAVE không lỗi
- [ ] [S] Toàn trang dùng được bằng bàn phím, kể cả dropdown
- [ ] [K] Dropdown: `aria-expanded`, Enter/Space mở, Esc đóng trả focus
- [ ] [K] Drawer/modal: focus vào tiêu đề, focus trap, Esc đóng trả focus, `role="dialog"`
- [ ] [K] Thay đổi giá/tình trạng theo variant qua `aria-live`; lỗi form có `aria-describedby`, được đọc
- [ ] [K] Slideshow dừng được; media không autoplay, Space play/pause

### G. UX (Dev.xlsx nhóm 6)

- [ ] [N] Setting mở menu bằng hover/click; menu active
- [ ] [N] Popup/modal/canvas không chồng nhau (quickview đóng rồi mini cart mới mở)
- [ ] [N] Quickview popup/canvas; mini cart canvas; search popup/canvas; tab show/hide
- [ ] [N] Sticky header (lên hiện, xuống ẩn); sticky cart (qua khối sản phẩm thì hiện)
- [ ] [N] Button loading; toast góc phải tự ẩn; loader search; loading nút mini cart; progress bar theo %
- [ ] [N] Load more, infinite scroll, lazy image, zoom mượt
- [ ] [S] Countdown chỉ dùng mốc thật

### H. Test

- [ ] [N] Dữ liệu test đủ theo file 11
- [ ] [N] Pass toàn bộ file 12 trong editor và storefront, kể cả quickview và featured product
- [ ] [S] Chạy đúng trên đủ trình duyệt desktop, mobile và webview
