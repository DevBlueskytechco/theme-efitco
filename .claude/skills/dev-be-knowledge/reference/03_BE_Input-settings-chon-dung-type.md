# Input settings: chọn đúng type và thuộc tính

**Tiêu đề:** Input settings: chọn đúng type và thuộc tính
**Loại:** Tài liệu
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx mục "Dựng (viết code) settings sử dụng đúng type của Shopify"; shopify.dev Settings, Input settings, Theme Store requirements mục Settings, Font picker, Color system

---

## Nội dung

### 1. Vì sao phải đúng type (Dev.xlsx)

Dùng đúng type giúp theme chạy mượt, tương thích hệ thống Shopify, dễ bảo trì và mở rộng; merchant thao tác dễ trong Admin; tránh lỗi tương thích khi cài đặt. Input type khai báo đúng theo schema của Shopify.

Dev.xlsx yêu cầu dùng đúng 6 nhóm tài liệu: Input settings, Style settings, Sidebar settings, Dynamic sources, Fonts, Deprecated settings. Tình trạng đối chiếu ngày 09/11/2026:
- Input settings, Sidebar settings, Dynamic sources, Fonts: còn hiệu lực (file này và file 04).
- Style settings (`/architecture/settings/style-settings`): trang trả về 404, không còn tài liệu để áp dụng.
- Deprecated settings: URL chuyển hướng sang trang Input settings, không còn trang riêng.

### 2. Vị trí khai báo

- `config/settings_schema.json`: theme settings toàn cục, đọc qua object `settings`.
- `{% schema %}` trong section: section settings (`section.settings`) và block settings (`block.settings`).
- Settings là mảng JSON `settings` gắn vào object mà nó áp dụng.

### 3. Thuộc tính chuẩn của input setting

| Thuộc tính | Mô tả | Bắt buộc |
| - | - | - |
| `type` | Loại setting | Có |
| `id` | ID để đọc giá trị | Có |
| `label` | Nhãn hiển thị trong editor | Có (Shopify Theme Store yêu cầu mọi setting có label) |
| `default` | Giá trị mặc định | Không |
| `info` | Text thông tin, hỗ trợ link dạng `[text](url)` | Không |

`visible_if` dùng để hiển thị có điều kiện (file 04).

### 4. Basic input settings

| Type | Dùng cho | Thuộc tính riêng |
| - | - | - |
| `checkbox` | Bật/tắt tính năng (ví dụ hiện announcement bar) | — |
| `number` | Số thay đổi (ví dụ số sản phẩm mỗi trang) | `placeholder` (chỉ hiện với setting trong `settings_schema.json`) |
| `radio` | Chọn một trong nhiều (ví dụ căn logo) | `options` bắt buộc: mảng `value`/`label` |
| `range` | Thanh trượt (ví dụ cỡ chữ) | `min`, `max` bắt buộc; `step` (mặc định 1); `unit` (ví dụ `px`) |
| `select` | Chọn một trong nhiều | `options` bắt buộc; `group` tuỳ chọn |
| `text` | Chuỗi ngắn (ví dụ tiêu đề) | `placeholder` (chỉ hiện trong `settings_schema.json`) |
| `textarea` | Đoạn văn bản dài | `placeholder` (chỉ hiện trong `settings_schema.json`) |

`select` hiển thị thành:
- **Dropdown** khi dùng `group`, hoặc có hơn 5 option, hoặc option quá dài.
- **SegmentedControl** khi không dùng `group`, có 2–5 option và vừa khung.

### 5. Specialized input settings

| Type | Dùng cho | Ghi chú quan trọng |
| - | - | - |
| `article` | Chọn 1 bài viết | Có thể rỗng → kiểm tra `blank` |
| `article_list` | Chọn nhiều bài viết | `limit` tối đa và mặc định 50; chỉ bài đã publish |
| `blog` | Chọn 1 blog | |
| `collection` | Chọn 1 collection | Kích hoạt dynamic source của collection cho section/block |
| `collection_list` | Chọn nhiều collection | `limit` tối đa và mặc định 50 |
| `color` | Màu | `placeholder` cho gợi ý vai trò màu. Theme Store: setting màu phải dùng `type: color` |
| `color_background` | Thuộc tính CSS background | Không hỗ trợ thuộc tính background liên quan ảnh |
| `color_palette` | Bộ màu đặt tên dùng chung cho `color`/`color_background` | Chỉ 1 palette mỗi theme, chỉ trong `settings_schema.json`; chỉ hỗ trợ `id`; `default` là object key–hex (không alpha), 2–20 màu; không hỗ trợ `label`, `info`, `visible_if` |
| `color_scheme` | Chọn color scheme cho section, block, theme settings | Không hỗ trợ trong app block |
| `color_scheme_group` | Định nghĩa các color scheme | Chỉ trong `settings_schema.json`; gồm `header`, `color`, `color_background`; có thuộc tính `role` |
| `font_picker` | Chọn font từ thư viện Shopify | Trả về object `font`; Theme Store bắt buộc mọi font dùng type này và có `default` |
| `html` | HTML tuỳ biến | `placeholder` |
| `image_picker` | Chọn ảnh (logo, favicon, slideshow) | Merchant nhập alt và focal point; render bằng `image_tag` để áp focal point |
| `inline_richtext` | Text định dạng không bọc `<p>` | Chỉ bold, italic, link; không hỗ trợ `<br />` |
| `link_list` | Chọn menu | Trong Header/Footer bắt buộc `default` = `main-menu` hoặc `footer` |
| `liquid` | HTML + Liquid giới hạn; tích hợp app | Không truy cập `layout`, `content_for_header`, `content_for_layout`, `content_for_index`, `section`, `javascript`, `stylesheet`, `schema`, `settings`. Truy cập được global object, object của template, tag/filter chuẩn. Giá trị không dịch được bằng Translate & Adapt |
| `metaobject` | Chọn 1 metaobject entry | Theme Store: chỉ standard definition |
| `metaobject_list` | Chọn nhiều metaobject entry | Theme Store: chỉ standard definition |
| `page` | Chọn 1 page | |
| `product` | Chọn 1 sản phẩm | Default phải là sản phẩm tồn tại; kích hoạt dynamic source của product cho block |
| `product_list` | Chọn nhiều sản phẩm | `limit` tối đa và mặc định 50; chỉ sản phẩm publish lên online store, status active |
| `richtext` | Text định dạng nhiều dòng | Bold, italic, underline (phím tắt), link, paragraph, unordered list. Nếu có `default`: top-level chỉ `<p>` hoặc `<ul>`, sai sẽ lỗi |
| `text_alignment` | Căn lề bằng SegmentedControl có icon | Giá trị `left`, `center`, `right`; mặc định `left` |
| `url` | URL ngoài hoặc đường dẫn tương đối, có picker resource | Trả về chuỗi URL hoặc `nil` khi trống |
| `video` | Video trong Files của Admin | |
| `video_url` | URL YouTube/Vimeo | `accept` bắt buộc: `youtube`, `vimeo` hoặc cả hai; đọc được `.id`, `.type` |

### 6. Quy tắc chọn type [Shopify – bắt buộc ở các mục liên quan]

- Màu → `color` (không dùng `text` nhập mã màu).
- Font → `font_picker` (không nhận custom font).
- Menu → `link_list`.
- Ảnh → `image_picker` (không dùng `url`/`text` dán link ảnh) để có alt, focal point, CDN.
- Video Shopify → `video`; YouTube/Vimeo → `video_url`.
- Chọn sản phẩm/collection/bài viết → type resource tương ứng, không nhập handle bằng `text`.
- Insertion point cho app → Custom Liquid section/block với type `liquid` (bắt buộc ở Theme Store, xem file 06).
- Chọn một trong 2–5 lựa chọn ngắn → `select` (hiển thị SegmentedControl) hoặc `radio`; nhiều hơn 5 → `select` dropdown.
- Setting `richtext` có default → bọc bằng `<p>` hoặc `<ul>`.

### 7. Legacy resource setting

Trước đây setting resource trả về handle, phải tra qua `all_products[settings.product]`. Hiện tại trả về object. Khi gặp code cũ dùng handle, chuyển sang dùng object trực tiếp và kiểm tra `blank`.

### 8. Nghiệm thu

- Mọi setting có `type`, `id`, `label` hợp lệ; theme check/upload không báo lỗi schema.
- Không còn setting màu dạng text, font dạng select tự định nghĩa, ảnh dạng URL.
- `link_list` header/footer default đúng; resource default trỏ tới resource tồn tại.
- `metaobject`/`metaobject_list` chỉ dùng standard definition.
