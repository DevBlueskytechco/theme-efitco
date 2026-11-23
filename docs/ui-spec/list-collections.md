KHÔNG CHẮC: trang danh sách collection phát triển từ `.collection-card` trang chủ (không có bản dựng riêng trước mockup này). demo-data không có ảnh collection (image rỗng cả 14): mockup dùng efx-col-1..5 (5 danh mục trang chủ) và efx-lvl-1..3 (Beginner, Intermediate, Advanced; ghép theo thứ tự, chưa kiểm) để minh hoạ, 6 collection còn lại hiện ca không ảnh. Trên storefront `collection.featured_image` rơi về ảnh sản phẩm đầu nếu collection không có ảnh. Hỏi ở ES1-T265.

# UI spec: Trang danh sách collection (ES1-T254, vòng 3)

Mục đích: người mua thấy mọi danh mục, chọn một danh mục để vào trang collection. Story TE-6 AC5 (title + `collection.featured_image`, phân trang).

Template `templates/list-collections.liquid` (markup trực tiếp, `paginate collections by 24`, snippet `pagination`). Mockup `drafts/designer/ES1-T254/list-collections.html` + `list-collections-360|768|1280|1920.png`; trạng thái L1 (phân trang), L2 (rỗng) cuối file.

Nguồn: sổ quyết định CTO > kit + mockup (`drafts/designer/**`, nguồn chuẩn CTO 21/11) > DESIGN.md > AGENTS.md > bộ kiến thức; thành phần từ foundation vòng 3 (`docs/ui-spec/foundation.md`, `drafts/designer/_kit/kit.css`).

## Thay đổi audit (ES1-T283, sửa ở ES1-T287)

| # | Mã | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | A4, câu CTO 5 | trang 1 ẩn Previous, "Page 1 of 2" dồn trái | Previous giữ chỗ mờ 0.35 + `aria-disabled`; "Page X of Y" giữa 2 nút | Sổ 10/11 audit (5), `docs/ui-spec/pagination.md` |
| 2 | A4 | §4 trỏ về collection.md §8 | §4 trỏ về `pagination.md` (snippet chung) | Sổ 10/11 S3/C3 |

Mockup `drafts/designer/ES1-T254/list-collections.html` L1 vẽ lại.

## Thay đổi so với vòng 2

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header | A nền trắng, viền dưới | thanh tối `--color-background-dark` + noise, cao 80, logo 100 × 30, menu trắng 60% (mục "Collection" trắng 100% + gạch chân), search 20 | Sổ 10/11, foundation §3 |
| 2 | Breadcrumb, h1 | trên nền trắng ngay dưới header trắng | giữ trên nền trắng, cách header tối 16 / 24 | foundation §5 |
| 3 | Next trong phân trang | nút chữ "Next" + mũi tên | nút tròn 52 chevron, số trang pill 44 | Sổ 09/11, collection.md §8 |
| 4 | Footer | rút gọn | đủ 3 tầng (kit §4) | foundation §4 |
| 5 | Card | card collection trang chủ | giữ bố cục; ảnh 3 / 2 (336 × 224 ở 1920; THAY 21/11, ES1-T567: trước 336 / 220. Chuẩn: Carbon aspect ratio 3:2) bo 16, ảnh → tên 16, tên Sofia 700 28/36 ls −0.02em; chữ foreground thay trắng vì nền trang trắng | Kit (`drafts/designer/_kit/kit.css`) |

Giữ nguyên nội dung, thứ tự collection và trạng thái vòng 2.

## 1. Anatomy

Header foundation §3 (mục menu "Collection" `aria-current="page"`) · breadcrumb `Home / Collections` · h1 "Collections" + meta "14 collections" · lưới card · phân trang · footer foundation §4.

Card (cùng ngôn ngữ `.collection-card` trang chủ):
- Ảnh 3 / 2 (Chuẩn: Carbon aspect ratio 3:2), bo 16 (`--radius-card` + 4), `object-fit: cover`, nền `--color-background-panel` khi đang tải.
- Tiêu đề: h2, heading 700, 28 / 36 từ 48rem (`--font-size-h3`), 18 dưới 48rem; letter-spacing −0.02em. Trang chủ đặt card trên dải tối chữ trắng; trang này nền trắng nên chữ `--color-foreground` (17.4:1).
- ĐỀ XUẤT meta "N products" 14 `--color-muted` (`collection.products_count`, số ít/nhiều): giúp chọn đúng danh mục, giống badge số sản phẩm card trình độ trang chủ (TE-15 AC-H10; 08 #531D).
- Một link duy nhất (tiêu đề, `::after` phủ card).

## 2. Settings merchant

Không có (template không có block setting). Thứ tự collection: Shopify trả theo tên A–Z. Ảnh: admin collection.

## 3. Layout theo mốc

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Header | 80, ☰ + logo + 3 icon | như 360 | 80, menu 7 mục | như 1280 |
| Cột | 2 | 3 | 4 | 4 |
| Card | 152 (ảnh 152 × 101) | 232 (232 × 155) | 292 (292 × 195) | 336 (336 × 224) |
| Gap ngang / dọc | 16 / 32 | 16 / 32 | 24 / 40 | 24 / 40 (ngang 24 = `--grid-gap`) |
| Ảnh → tiêu đề / tiêu đề → meta | 12 / 4 | 12 / 4 | 16 / 4 | 16 / 4 |
| h1 → lưới | 32 | 32 | 48 | 48 |

Cột 2 / 3 / 4 theo ES1-T107 #7 (CTO 06/11). Lưới → footer `--section-gap`.

## 4. Trạng thái

- Hover: ảnh scale 1.04 (500ms), tiêu đề gạch chân 2px (như `.collection-card` trang chủ). Focus: outline 2px accent offset 4 bao cả card (trên `::after`). Active: theo link.
- Không ảnh: nền `--color-background-cream`, icon ảnh 30% `--color-muted-light`, giữ tỉ lệ 3 / 2 (0 CLS). Code dùng `placeholder_svg_tag 'collection-1'`; ĐỀ XUẤT icon trung tính như card sản phẩm (foundation §9).
- Rỗng (L2): empty-state foundation §18: h2 "No collections yet" · "No collections to show yet. Browse every product in the store instead." (câu đầu là `collections.empty` có sẵn) · primary "Shop all products" (`routes.all_products_collection_url`).
- Phân trang (L1): snippet `pagination` chung theo `docs/ui-spec/pagination.md`: `{% paginate collections by 24, window_size: 1 %}` → `{% render 'pagination', paginate: paginate %}`. Previous/Next tròn 52 chevron (`aria-label="Previous page"` / `"Next page"`); ≥ 768 số trang pill 44, trang hiện tại accent; < 768 "Page X of Y" giữa 2 nút. Trang đầu/cuối: nút giữ chỗ, cặp màu disabled (viền `--color-border`, icon `--color-muted-light`, không opacity; sổ 21/11) + `aria-disabled` (sổ 10/11 audit 5). Store dev 14 collection nên không hiện.
- Đang tải / lỗi: không có (trang render server, không JS).

Chuỗi mới (ĐỀ XUẤT): `collections.count` ("{{ count }} collections"), `collections.products_count` ("{{ count }} products", số ít/nhiều), `collections.empty_heading`, `collections.empty_hint`, `collections.empty_cta`; phân trang dùng chuỗi chung `collections.pagination.*` (pagination.md §5).

## 5. Accessibility

- Tương phản: tiêu đề foreground / background 17.4; meta muted 8.45; focus accent / background 5.01; menu header trắng 60% / #1A1A1A 6.93; chevron foreground 17.4 (viền nút chỉ trang trí).
- Ảnh trang trí `alt=""` (tên đọc từ tiêu đề, code có `decorative: true`).
- Heading: h1 "Collections" → h2 tên từng collection.
- Vùng chạm: cả card (≥ 152 × 160); Next 52.
- Tên trùng trên store dev ("Accessories" × 2, collection phụ trợ trang chủ, handle còn tiền tố cũ): ghi ở ES1-T265 để store demo ẩn collection phụ khỏi Online Store hoặc đổi tên, tránh 2 link cùng chữ khác đích (WCAG 2.4.4).

## 6. Lighthouse

- LCP: ảnh card đầu. Card hàng đầu (2 / 3 / 4 theo mốc) eager, chỉ card 1 `fetchpriority="high"`; còn lại lazy, có width/height. ĐỀ XUẤT `sizes`: `(min-width: 80rem) 336px, (min-width: 48rem) 33vw, 50vw`.
- Font: Sofia Sans Condensed (h1, tiêu đề card, wordmark), Inter (meta, breadcrumb, menu).
- Header: noise là `background-image` nhỏ có sẵn trong critical.css, không chặn LCP.
- SEO (sổ 10/11: trang này không thuộc 6 loại trang đo SEO, vẫn thiết kế để đạt): một h1; card là `<a href>` với chữ là tên collection; meta description; Next có tên mô tả đích.
- A11y: không control nhỏ hơn 24; heading đúng bậc; mọi icon có tên.
- BP: ảnh `cover` không méo, tỉ lệ cố định; mockup 0 lỗi console ở 4 mốc.

## 7. Map sang code

| Hiện có | Cần đổi |
| --- | --- |
| header trắng trên trang không có `.slideshow` | nền tối mọi trang (foundation §21) |
| ảnh 336 / 270 bo 12, tiêu đề 18 dưới, placeholder SVG Shopify | ảnh 3 / 2 bo 16, tiêu đề heading 28 (câu hỏi 1), meta số sản phẩm, placeholder icon, focus bao card |
| không breadcrumb, h1 đứng một mình | breadcrumb + meta số collection (foundation §5) |
| phân trang chữ | snippet `pagination` sửa theo pagination.md §10 |

## 8. Quyết định CTO đã chốt (10/11)

CTO chốt cả các câu dưới đây theo đề xuất (docs/design/decisions.md, 10/11).
1. Card danh sách collection dùng ảnh 3 / 2 + tiêu đề heading 28 bên dưới như card collection trang chủ, thay ảnh 336 / 270 trong ES1-T107 #7? Đề xuất: có, một danh mục trông giống nhau ở trang chủ và trang danh sách (06 §1).
2. Thêm dòng "N products" dưới tên collection? Đề xuất: có (TE-15 card trình độ đã có số sản phẩm).

## Cập nhật 21/11 (ES1-T567, CTO 21/11)

- Nguồn chuẩn là mockup HTML + `drafts/designer/_kit/kit.css`; Designer dựng lại bản vẽ từ mockup. Số trong spec lệch mockup thì mockup thắng.
- Nhãn nút và link dạng nút: sentence case, mở bằng động từ, không dấu câu (Chuẩn: Polaris Button), thay Title Case 07/11. Tiêu đề section, dialog / drawer, empty state, tab, link menu cũng sentence case (CTO 21/11 lượt 2); tên sản phẩm, collection, bài viết theo dữ liệu, tên riêng và viết tắt giữ. "Checkout" giữ một chữ (thuật ngữ, CTO 21/11 lượt 2; content.md §4).
- Line-height theo bội 4 qua token kit: 16/24 (`--line-height-body`), 14/20 (`--line-height-sm`), 13/20 (`--line-height-label`), 18/28 (`--line-height-title`), h1 40/48 → 48/56, h3 28/36, h4 20/24. Trang không viết line-height bằng số.
- Ảnh card collection 3 / 2 (Chuẩn: Carbon aspect ratio 3:2), thay 336 / 220; tên card dưới 48rem 20/24 (`--font-size-h4` + `--line-height-h4`), từ 48rem 28/36. Cần FE: tỉ lệ ảnh card collection trong snippet.
