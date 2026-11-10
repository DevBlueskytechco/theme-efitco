KHÔNG CHẮC: Figma không có trang danh sách collection; card lấy theo card collection trang chủ Figma 1:395/1:404. demo-data không có ảnh collection (image rỗng cả 14): mockup dùng efx-col-1..5 (5 danh mục trang chủ) và efx-lvl-1..3 (Beginner, Intermediate, Advanced; ghép theo thứ tự, chưa kiểm) để minh hoạ, 6 collection còn lại hiện ca không ảnh. Trên storefront `collection.featured_image` sẽ rơi về ảnh sản phẩm đầu nếu collection không có ảnh. Hỏi ở ES1-T265.

# UI spec: Trang danh sách collection (ES1-T254)

Mục đích: người mua thấy mọi danh mục, chọn một danh mục để vào trang collection. Story TE-6 AC5 (title + `collection.featured_image`, phân trang).

Template `templates/list-collections.liquid` (markup trực tiếp, `paginate collections by 24`, snippet `pagination`). Mockup `drafts/designer/ES1-T254/list-collections.html` + `list-collections-360|768|1280|1920.png`; trạng thái L1 (phân trang), L2 (rỗng) cuối file.

## 1. Anatomy

Header A (nền trắng, foundation §3; mục menu "Collection" `aria-current`) · breadcrumb `Home / Collections` · h1 "Collections" + meta "14 collections" · lưới card · phân trang · footer.

Card (Figma 1:395 / 1:404, cùng ngôn ngữ `.collection-card` trang chủ):
- Ảnh 336 / 220, bo 16 (`--radius-card` + 4), `object-fit: cover`, nền `--color-background-panel` khi đang tải.
- Tiêu đề: h2, heading 700, 28 / 34 từ 48rem (`--font-size-h3`), 18 dưới 48rem; letter-spacing −0.02em.
- ĐỀ XUẤT meta "N products" 14 `--color-muted` (`collection.products_count`, số ít/nhiều): giúp chọn đúng danh mục, giống badge số sản phẩm card trình độ trang chủ (TE-15 AC-H10; 08 #531D).
- Một link duy nhất (tiêu đề, `::after` phủ card).

## 2. Settings merchant

Không có (template không có block setting). Thứ tự collection: Shopify trả theo tên A–Z. Ảnh: admin collection.

## 3. Layout theo mốc

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Cột | 2 | 3 | 4 | 4 |
| Card | 152 (ảnh 152 × 100) | 232 (232 × 152) | 292 (292 × 191) | 336 (336 × 220 = Figma) |
| Gap ngang / dọc | 16 / 32 | 16 / 32 | 24 / 40 | 24 / 40 |
| Ảnh → tiêu đề / tiêu đề → meta | 12 / 4 | 12 / 4 | 16 / 4 | 16 / 4 |
| h1 → lưới | 32 | 32 | 48 | 48 |

Cột 2 / 3 / 4 theo ES1-T107 #7 (CTO 06/11). Lưới → footer `--section-gap`.

## 4. Trạng thái

- Hover: ảnh scale 1.04 (500ms), tiêu đề gạch chân 2px (như `.collection-card` trang chủ). Focus: outline 2px accent offset 4 bao cả card (trên `::after`). Active: theo link.
- Không ảnh: nền `--color-background-cream`, icon ảnh 30% `--color-muted-light`, giữ tỉ lệ 336/220 (0 CLS). Code hiện dùng `placeholder_svg_tag 'collection-1'` (minh hoạ Shopify), ĐỀ XUẤT dùng icon trung tính như card sản phẩm (foundation §9) để trang không lẫn hình minh hoạ.
- Rỗng (L2): empty-state foundation §18: h2 "No Collections Yet" · "No collections to show yet. Browse every product in the store instead." (câu đầu là chuỗi có sẵn `collections.empty`) · primary "Shop All Products" (`routes.all_products_collection_url`).
- Phân trang (L1): như `docs/ui-spec/collection.md` §8 (< 768 "Page X of Y"; ≥ 768 số trang). Store dev 14 collection nên không hiện.
- Đang tải / lỗi: không có (trang render server, không JS).

Chuỗi mới (ĐỀ XUẤT): `collections.count` ("{{ count }} collections"), `collections.products_count` ("{{ count }} products", số ít/nhiều), `collections.empty_heading`, `collections.empty_hint`, `collections.empty_cta`; dùng chung `collections.pagination.page_of` với trang collection.

## 5. Accessibility

- Tương phản: tiêu đề foreground / background 17.4; meta muted 8.45; focus accent / background 5.01.
- Ảnh trang trí `alt=""` (tên đọc từ tiêu đề, code có `decorative: true`).
- Heading: h1 "Collections" → h2 tên từng collection.
- Vùng chạm: cả card (≥ 152 × 160).
- Tên trùng trên store dev ("Accessories" × 2, collection phụ trợ trang chủ figma-tab-*, figma-level-*): không phải lỗi giao diện; ghi ở ES1-T265 để store demo ẩn collection phụ khỏi kênh Online Store hoặc đổi tên, tránh 2 link cùng chữ khác đích (WCAG 2.4.4).

## 6. Lighthouse

- LCP: ảnh card đầu. Card hàng đầu (2 / 3 / 4 theo mốc) eager, chỉ card 1 `fetchpriority="high"`; còn lại lazy, có width/height. ĐỀ XUẤT `sizes`: `(min-width: 80rem) 336px, (min-width: 48rem) 33vw, 50vw` (code có gần đúng).
- Font: Sofia Sans Condensed (h1, tiêu đề card), Inter (meta, breadcrumb).
- SEO: một h1; card là `<a href>` với chữ là tên collection; meta description template.
- BP: ảnh `cover` không méo, tỉ lệ cố định.

## 7. Map sang code

| Hiện có | Cần đổi |
| --- | --- |
| ảnh 336 / 270 bo 12, tiêu đề 18 dưới, placeholder SVG Shopify | ảnh 336 / 220 bo 16, tiêu đề heading 28 (câu hỏi CTO 1), meta số sản phẩm, placeholder icon, focus bao card |
| không breadcrumb, h1 đứng một mình | breadcrumb + meta số collection (foundation §5) |

## 8. Quyết định CTO cần chốt

1. Card danh sách collection dùng ảnh 336 / 220 + tiêu đề heading 28 bên dưới như card trang chủ Figma 1:404 (cả card 336 × 270 gồm tiêu đề), thay ảnh 336 / 270 trong ES1-T107 #7 (đọc nhầm 270 là cao ảnh)? Đề xuất: có, để một danh mục trông giống nhau ở trang chủ và trang danh sách (06 §1).
2. Thêm dòng "N products" dưới tên collection? Đề xuất: có (TE-15 card trình độ đã có số sản phẩm).
