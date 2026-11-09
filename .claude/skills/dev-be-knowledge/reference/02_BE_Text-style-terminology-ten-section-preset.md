# Text style, terminology, đặt tên section và preset

**Tiêu đề:** Text style, terminology, đặt tên section và preset
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx mục 1.2 "Tiêu chuẩn setting Shopify" (Style requirements, Terminology requirements, Section name guidelines, Preset name guidelines); shopify.dev Theme Store requirements mục Settings

---

## Nội dung

Mọi chuỗi merchant nhìn thấy trong theme editor (tên section, tên preset, tên category, label, info, option, button) phải theo các quy tắc dưới đây [Shopify – bắt buộc]. Reviewer kiểm tra trực tiếp trên editor.

### 1. Text style requirements

1. **Sentence case** cho tên section, preset, category: chỉ viết hoa chữ đầu và danh từ riêng (ví dụ "Facebook").
2. **Tên mô tả, không đánh số** cho setting nhiều lựa chọn hoặc section có nhiều biến thể. Ngoại lệ: màu và bảng màu.

| Dùng | Không dùng |
| - | - |
| Logo position on large screens: Middle left / Top left / Top center | Logo position on large screens: Position 1 / Position 2 / Position 3 |
| Theme sections: Collage / Image banner / Image with text | Theme sections: Image 1 / Image 2 / Image 3 |

3. **Ngôn ngữ dễ hiểu với mọi merchant**: "Horizontal position"/"Vertical position" thay cho "X position"/"Y position"; "Button label" thay cho "CTA label".
4. **American English**:

| Dùng | Không dùng |
| - | - |
| canceled | cancelled |
| catalog | catalogue |
| center, centered | centre, centred |
| color | colour |
| customize | customise |
| dialog | dialogue |
| gray | grey |
| organize | organise |

5. **Không dùng ký tự &**.
6. **Câu khẳng định, không câu hỏi**: "Use a custom logo", không "Use a custom logo?".
7. **Không lặp chủ thể**: chủ thể của section (ví dụ "slideshow") chỉ nêu một lần ở heading; không đặt "Slideshow", "Slideshow color", "Slideshow image".
8. **Câu chủ động.**
9. **Button và action bắt đầu bằng động từ.**
10. **Định dạng thông số kỹ thuật**:

| Thông số | Định dạng | Ví dụ |
| - | - | - |
| Kích thước ảnh | [số] x [số]px (required/recommended) | 64 x 64px required |
| Tỉ lệ ảnh | [số]:[số] aspect ratio (required/recommended) | 3:2 aspect ratio recommended |
| Kích thước ảnh kèm định dạng | [số] x [số]px [.định dạng] (required/recommended) | 1200 x 300px .jpg recommended |
| Số từ / ký tự | [số] words (max) | 32 words max |
| Định dạng text | Use basic HTML to format text | |

### 2. Terminology requirements

| Dùng | Không dùng |
| - | - |
| home page | homepage |
| top bar | meta-nav, search bar |
| bottom bar | below footer, legal |
| slideshow | slider |
| checkout (khi đặt tên setting) | check out |
| heading | title |
| subheading | sub-heading |
| body text | main text |
| signup | sign-up, sign up |
| favicon | shortcut icon, website icon |
| sidebar | side bar |
| button label | button name |
| social media (khi đặt tên section/setting) | social, social sharing |
| social media icons | social media buttons |
| navigation (mọi thành phần điều hướng) | menus, menu |
| main menu (điều hướng chính) | navigation, menu |
| secondary menu (điều hướng phụ) | navigation, menu |
| footer menu (menu ở footer) | navigation, menu |
| cart type (với option "drawer", "page", "modal") | Ajax, Ajaxify, Ajax cart |
| .png | PNG, png, .PNG |
| use (option có bước tiếp theo, ví dụ upload file) | show, enable |
| show (option bật/tắt hiển thị phần tử cơ bản) | use, enable |
| enable (option liên quan app/plugin hoặc thay đổi đáng kể layout) | use, show |

Lưu ý áp dụng cho các setting UX trong Dev.xlsx:
- Setting chọn kiểu mini cart: label "Cart type", option "Drawer" / "Page" / "Modal".
- Setting chọn mở menu bằng hover hay click (Dev.xlsx 6.1): đặt label mô tả, ví dụ "Open submenus on", option "Hover" / "Click" — không dùng "Mode 1/2".
- Setting bật sticky header, sticky cart: dùng "Show" nếu chỉ ẩn/hiện phần tử; dùng "Enable" nếu thay đổi đáng kể layout.

### 3. Section name guidelines

- Mỗi section có tên. Tên xuất hiện trong section picker và trong sidebar liệt kê section của template.
- Tên liên quan tới chức năng section: Header, Product list, Slideshow, Image gallery.
- Dùng đúng terminology ở mục 2.
- Tên Shopify gợi ý: Header, Featured products, Featured collections, Slideshow, Image gallery, Logo list, Newsletter, Map, Blog posts, Testimonials, Footer.

### 4. Section preset guidelines

- Preset là cấu hình định sẵn merchant dùng khi thêm section.
- Tên preset liên quan tới loại nội dung: Image and text, Map, Columns, Blog articles.
- Dùng đúng terminology.
- Preset có ảnh, video, icon phải hiển thị placeholder:

| Loại nội dung | Placeholder |
| - | - |
| Ảnh không phải product/collection; ảnh liền kề không margin | Image icon |
| Danh sách logo | Logo icon |
| Slideshow; ảnh có text chồng; ảnh full-width | Lifestyle image |
| Video | Video YouTube mặc định (https://www.youtube.com/watch?v=_9VUPq3SxOc) |

- Section và block muốn thêm được từ theme editor vào JSON template phải khai báo `presets` trong schema. File không có preset phải đưa vào JSON thủ công và không xoá được bằng editor (shopify.dev – Integrate sections and blocks).

### 5. Phân biệt với tên theme / preset theme

Tên theme và theme preset (mục Naming themes and theme presets) là quy tắc khác: 1–2 từ, dưới 30 ký tự, không trùng sản phẩm Shopify, tên công ty, ngành hàng; một preset phải mang tên theme cha. Không nhầm với preset của section.

### 6. Nghiệm thu

- Đọc toàn bộ chuỗi trong `settings_schema.json`, mọi `{% schema %}` và schema locale `en.default.schema.json`: không có &, không có câu hỏi, không có British spelling, không có "Position 1/2/3", sentence case cho tên section/preset/category.
- Đối chiếu từng từ trong bảng terminology.
- Thêm từng section từ section picker: có placeholder đúng loại.
