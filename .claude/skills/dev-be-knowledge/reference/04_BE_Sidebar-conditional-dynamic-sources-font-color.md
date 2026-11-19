# Sidebar settings, conditional settings, dynamic sources, font, color

**Tiêu đề:** Sidebar settings, conditional settings, dynamic sources, font, color
**Loại:** Tài liệu
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx mục "Dựng settings sử dụng đúng type" (Sidebar settings, Dynamic sources, Fonts); shopify.dev Settings, Sidebar settings, Dynamic data sources, Fonts; Theme Store requirements mục Font picker, Color system

---

## Nội dung

### 1. Sidebar settings

Sidebar setting không giữ giá trị, merchant không cấu hình được. Dùng để tổ chức và giải thích input settings — công cụ chính để đạt tiêu chí "trực quan, không rối mắt" của Dev.xlsx 1.1.

| Type | Thuộc tính | Dùng khi |
| - | - | - |
| `header` | `type`, `content` (bắt buộc); `info` (tuỳ chọn) | Chia nhóm setting trong một section/theme settings |
| `paragraph` | `type`, `content` (bắt buộc) | Giải thích cách dùng một nhóm setting |

`info` của input setting và `header` hỗ trợ link dạng `[Learn more](url)`.

Quy tắc dùng:
- Section có hơn một nhóm chức năng (layout, nội dung, màu) → mỗi nhóm một `header`.
- Setting có hệ quả không hiển nhiên → thêm `info` hoặc `paragraph`.

### 2. Conditional settings (`visible_if`)

```json
"visible_if": "{{ block.settings.layout_style == 'flex' }}"
```

Hỗ trợ `visible_if`:
- Mọi basic input settings.
- Mọi sidebar settings.
- Specialized: `color`, `color_background`, `color_scheme`, `font_picker`, `html`, `image_picker`, `inline_richtext`, `link_list`, `liquid`, `richtext`, `text_alignment`, `url`, `video`, `video_url`.

Giới hạn: không truy cập runtime context hay giá trị đã resolve của dynamic source. Chỉ kiểm tra được setting có dynamic source có giá trị hay không, không điều kiện theo giá trị nó resolve ra.

Ứng dụng: setting phụ (ví dụ thời gian autoplay) chỉ hiện khi setting chính (autoplay) bật. Giảm số setting merchant nhìn thấy cùng lúc.

### 3. Dynamic sources

Cho phép merchant nối input setting với dữ liệu từ product, collection, blog, page, article, metafield, metaobject trong theme editor.

- Không có cho general theme settings; chỉ cho setting của section/block trong JSON template.
- Nguồn khả dụng tuỳ ngữ cảnh: section nằm trong product template → metafield/thuộc tính của product cho setting section và block; section có setting `collection` → dữ liệu collection; block có setting `product` → dữ liệu product đó cho block; metaobject có storefront visibility → dùng được cho mọi setting.

Thuộc tính resource có sẵn:

| Resource | Thuộc tính |
| - | - |
| product | title, vendor, description, url, featured_image, collections |
| collection | title, image, description, url, products |
| page | title, url, content |
| article | title, url, author, content, excerpt, comments_count, image |
| blog | title, url |

Tương thích setting ↔ metafield:

| Setting | Metafield |
| - | - |
| `article` | article_reference |
| `collection` | collection_reference |
| `collection_list` | list.collection_reference |
| `color` | color |
| `image_picker` | file_reference |
| `page` | page_reference |
| `product` | product_reference |
| `product_list` | list.product_reference |
| `richtext` | single_line_text_field, list.single_line_text_field, multi_line_text_field, rich_text_field, number_integer, number_decimal, date, date_time, weight, volume, dimension, rating, money, link |
| `inline_richtext` | như `richtext` nhưng không có multi_line_text_field, rich_text_field |
| `text` | single_line_text_field, list.single_line_text_field, number_integer, number_decimal, date, date_time, weight, volume, dimension, rating, money |
| `url` | url |
| `video` | file_reference (phải nhận file video) |
| `metaobject` | metaobject_reference (cùng metaobject type với schema) |
| `metaobject_list` | list.metaobject_reference (cùng metaobject type với schema) |

Default trỏ tới dynamic source, ví dụ `"default": "Featuring: {{ product.title }}"`:
- Chỉ dùng khi section/block được render ở ngữ cảnh có giá trị đó. Không dùng default liên quan product cho section render được ở template không phải product hoặc không có setting `product`.
- Áp dụng cả cho giá trị trong `presets`.
- Không được thêm Liquid khác ngoài tham chiếu trực tiếp, nếu không sẽ lỗi.

Giới hạn số dynamic source:

| Phạm vi | Giới hạn |
| - | - |
| Một JSON template | 100 |
| General theme settings | 100 |
| Một section group | 100 |
| Một setting | 50 |
| Một static section | 50 |

Lợi ích theo Dev.xlsx 1.1 "Tính linh hoạt": merchant tự hiển thị metafield (thông số, chất liệu, hướng dẫn) mà không cần dev viết code mới.

### 4. Font

Theme Store [Shopify – bắt buộc – Font picker]:
1. Mọi font dùng setting type `font_picker`.
2. Có font mặc định, ví dụ `"default": "work_sans_n6"`.
3. Font trong default và preset phải là font đang available trong thư viện Shopify.
4. CSS load bold, italic, bold-italic cho mỗi font bằng `font_modify`.
5. Không nhận custom font.

Cách dùng thư viện font Shopify:
- `font_picker` trả về object `font`.
- `font_face`: in `@font-face` mặc định.
- `font_url`: lấy URL CDN để tự viết `@font-face`.
- `font_modify`: lấy biến thể cùng họ (bold, italic).

Thư viện gồm system font và một phần Google Fonts, có WOFF và WOFF2. System font không cần tải nên nhanh hơn; merchant chọn ở nhóm System fonts.

Font deprecated: Shopify đã loại một số font (ví dụ Avenir Next → Figtree, Century Gothic → Poppins). Không dùng handle font deprecated trong default/preset. Danh sách đầy đủ: https://shopify.dev/docs/storefronts/themes/architecture/settings/fonts#deprecated-fonts

### 5. Color system [Shopify – bắt buộc]

- Tối thiểu 4 màu.
- Mọi setting màu nền có setting màu chữ tương ứng.
- Setting màu dùng `type: color`.

Liên quan: `color_scheme_group` chỉ khai báo trong `settings_schema.json`; `color_scheme` gán scheme cho section/block; `color_palette` một bộ duy nhất, 2–20 màu hex không alpha.

### 6. Nghiệm thu

- Mỗi section có nhiều nhóm setting dùng `header`; setting phụ dùng `visible_if`.
- Section nằm trên product template cho phép nối metafield vào setting text/richtext/image.
- Không có default dynamic source ở section dùng được ngoài product template.
- Font default là handle còn available; CSS có đủ 3 biến thể qua `font_modify`.
- Mỗi màu nền có màu chữ đi kèm.
