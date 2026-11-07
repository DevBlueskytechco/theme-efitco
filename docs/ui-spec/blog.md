KHÔNG CHẮC: Figma chỉ có trang chủ (1:359), trang blog dựng từ ngôn ngữ trang chủ (1:1022 blog, 1:362 header, 1:1104 footer). Không đọc được docs/ui-spec/product.md của ES1-T239 (nhánh khác) nên breadcrumb, chip, input dựng lại từ token, có thể lệch nhẹ với spec product. Tên blog trên store dev chưa rõ; excerpt trong mockup là chữ ví dụ, theme lấy article.excerpt_or_content.

# UI spec: trang blog (`templates/blog.liquid`)

Ticket ES1-T243 · Story TE-9 AC3 (title, image, excerpt_or_content, published_at), R7 · Mockup `drafts/designer/ES1-T243/blog.html`, PNG `blog-360/768/1280/1920.png`.

## Mục đích
Danh sách bài của một blog, có phân trang, lọc theo chủ đề, để khách chọn bài đọc. Cùng card với hàng blog trang chủ (Figma 1:1022) để khách nhận ra ngay.

## Figma node
- 1:1022 hàng blog trang chủ: eyebrow 1:1024, heading 1:1025, card 1:1027 (tag pill 1:1035, title 1:1037, read time 1:1038).
- 1:362 header, 1:1104 footer: dùng lại nguyên.
- Còn lại (breadcrumb, chip lọc, lưới, excerpt, ngày, phân trang, trạng thái rỗng): ĐỀ XUẤT.

## Anatomy
1. Header (blocks/header.liquid), biến thể nền sáng vì trang không có hero; mục Blog `aria-current="page"` màu accent + gạch chân 2px (ĐỀ XUẤT).
2. Breadcrumb: Home / Blog (trang tag: Home / Blog / <tag>). ĐỀ XUẤT.
3. Eyebrow: "From the Efitco blog" (setting), style 1:1024.
4. H1: `blog.title`, style 1:1025 (heading font 700, 48/58, -0.02em).
5. Chip lọc theo tag: All + `blog.all_tags`, link `blog.url` và `blog.url/tagged/<handle>`. ĐỀ XUẤT.
6. Số bài: `blog.articles_count` ("4 articles"), muted-light 14. ĐỀ XUẤT.
7. Lưới card: `snippets/article-card.liquid` (ảnh, tag đầu, title, thời gian đọc) + thêm ngày `published_at` trong dòng meta và excerpt dưới card (AC3). Title là h2 trên trang này (h1 là tên blog).
8. Phân trang: `snippets/pagination.liquid`, paginate by 12.
9. Footer (blocks/footer.liquid).

## Settings merchant (block mới `blog-articles`)
| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Eyebrow | text | From the Efitco blog | để trống thì ẩn |
| Show topic filter | checkbox | true | ẩn khi blog có < 2 tag |
| Articles per page | range | 12 | 4–24, bước 4 |
| Show excerpt | checkbox | true | |
| Show date | checkbox | true | |
| Show reading time | checkbox | true | cách tính như article-card (200 từ/phút) |
Label qua `t:` trong `locales/en.default.schema.json`, sentence case, không dùng `&`.

## Layout
Khung: `--page-width` 91rem, lề `--page-margin` 20, nội dung 1416 ở 1920.
| Width | Lưới | Card | Khoảng cách |
| --- | --- | --- | --- |
| 360 | 1 cột | 320 × 427 (3/4) | gap dọc 40; head padding 16 / 32 |
| 768 | 2 cột | 352 × 469 | gap 40 / 24 (`--space-5`) |
| 1024 | 3 cột | | |
| 1280 | 4 cột | 292 × 389 | gap 48 / 24; head padding 24 / 48 |
| 1920 | 4 cột | 336 × 448, khớp 1:1027 | như 1280 |
- Card: bo 16 (`--radius-card` + `--space-1`, như ES1-T174), nền dark khi chưa có ảnh, gradient từ dark lên (homepage 63.72%, trang blog 55% vì thêm dòng ngày: ĐỀ XUẤT). Content padding 16 (<48rem), 24 (≥48rem).
- Excerpt: margin-top 16, Inter 16/24, `--color-muted`, cắt 3 dòng (`truncatewords: 30` + line-clamp).
- Chip: cao 44, padding 0 20, bo pill, 14/600, viền `--color-border`. Dưới 64rem cuộn ngang tràn lề; từ 64rem chip và số bài cùng một hàng.
- Phân trang: ô 44 × 44, bo 8 (`--figma-radius-8` như .button), căn giữa; padding 48 (<64rem), 64 / 120 (≥64rem).
- Nhịp dọc giữa band: 48 / 120 theo DESIGN.md.

## Trạng thái
- Rỗng (`blog.articles_count == 0`): ẩn chip, số bài, phân trang; hộp `--color-background-alt` bo 16: h2 "No Articles Yet", câu dẫn, nút `.button` "Explore Equipment" tới `routes.all_products_collection_url`. ĐỀ XUẤT.
- Trang tag 0 bài: "No Articles In “<tag>”", `.button--link` "View All Articles" tới `blog.url`. ĐỀ XUẤT.
- Lỗi: trang render server, không có lỗi riêng. Ảnh hỏng/thiếu: card giữ nền dark, chữ trắng vẫn đọc được.
- Loading: không có (server render). Ảnh card đầu `loading="eager"` + `fetchpriority="high"` (LCP), còn lại lazy. Không skeleton.
- Hover: ảnh `scale: 1.04` `--motion-slow` `--ease-out` (ux-motion: card hover phóng ảnh), title gạch chân; chip và ô trang đổi viền sang foreground `--motion-fast`. Tất cả trong `prefers-reduced-motion: no-preference`.
- Focus-visible: card viền accent 2px offset 2px (có sẵn trong base.css), chip viền accent, ô trang viền currentcolor.
- Active chip/trang: nền accent, chữ accent-foreground, `aria-current="page"`.

## Accessibility
- Tương phản (WCAG 2.x, L = độ sáng tương đối; số có sẵn lấy từ DESIGN.md):
  - Meta, số bài, breadcrumb `#6B6B6B` trên trắng 5.33:1.
  - Excerpt `#4D4D4D` trên trắng: L = 0.0742 → (1.05)/(0.1242) = 8.45:1.
  - Eyebrow và chữ accent `#C8400E` trên trắng 5.01:1; chữ trắng trên chip/pill/ô trang accent 5.01:1 (13px 600 đạt AA).
  - Chữ trắng trên ảnh: gradient dark như trang chủ (ES1-T174 đã duyệt).
  - Viền chip/ô trang `#E5E5E5` 1.27:1: không cần đạt 3:1 vì chữ trong ô nhận diện được control; trạng thái current không chỉ dựa vào màu (có nền đặc + `aria-current`).
- Touch: chip, ô trang, link breadcrumb, icon header ≥ 44px.
- Keyboard: thứ tự breadcrumb → chip → card → phân trang; không bẫy focus; không JS.
- Semantics: `nav aria-label="Breadcrumb"`, `nav aria-label` cho bộ lọc và phân trang (`collections.pagination.*` đổi sang key blog), `ul role="list"`, `<time datetime>`.
- Alt: ảnh card `alt=""` (title đã đặt tên link), như article-card hiện có.

## Token dùng
Màu: background, foreground, muted, muted_light, border, background_alt, background_dark, background_dark_foreground, muted_on_dark, accent, accent_foreground. Font: heading (700, 800), primary (400–700). Cỡ: xs, sm, base, lg, h2, h1, h3 (button--link), wordmark. Space 1–8. Radius: input, figma-radius-8/16/24, pill. Motion: fast, slow, ease-out. Không thêm màu.

## Map block
| Phần | Hiện có | Việc |
| --- | --- | --- |
| Header, footer | blocks/header.liquid, blocks/footer.liquid | dùng lại; header nhận aria-current cho link Blog |
| Breadcrumb | chưa có | snippet mới `breadcrumb.liquid` (dùng chung product/collection; khớp với ES1-T239 khi merge) |
| Đầu trang + chip + lưới + phân trang + rỗng | templates/blog.liquid (markup thô) | block mới `blocks/blog-articles.liquid`, template chỉ gọi container + block |
| Card | snippets/article-card.liquid | thêm param `heading_tag` (h2/h3), `show_date`, `excerpt`, `loading` |
| Phân trang | snippets/pagination.liquid | dùng lại, truyền label `blog.pagination_label` |
| Locale mới | | blog.filter_label, blog.all_articles, blog.articles_count (one/other), blog.empty_title, blog.empty_text, blog.tag_empty_title, blog.view_all, blog.pagination_label, general.breadcrumb |
JS: không cần.

## Quyết định CTO cần chốt
1. Trang 1 có bài nổi bật khổ lớn hay lưới đều? Đề xuất lưới đều 4 cột như mockup: cùng card trang chủ, 4 bài thật lấp đúng một hàng 1416.
2. Bật lọc theo tag mặc định? Đề xuất bật, tự ẩn khi blog có dưới 2 tag; link thường, không JS.
3. Số bài mỗi trang? Đề xuất 12 (chia hết cho 4/3/2/1 cột, không hàng lẻ).
