KHÔNG CHẮC: không đo được gzip base.css trong sandbox (gzip, node zlib, zip đều bị chặn quyền). Raw base.css nhánh 275 656 B so với develop 275 471 B (+185 B, sau khi đã xoá CSS list-collections cũ). Nhờ Orchestrator/CI chạy `gzip -c assets/base.css | wc -c` trên nhánh và develop; nếu gzip lớn hơn develop thì cần CTO duyệt ngoại lệ (ES1-T454) hoặc trả lại để nén tiếp.

# ES1-T367 TE-6-R2-FE4: list-collections, collection-card, base.css, locales

AC: TE-6 AC5, AC6; chi tiết theo TE-6 AC15 (SRS 0.5), `docs/ui-spec/list-collections.md` §1, §3, §4, §6. Phụ thuộc: ES1-T364 (TE-6-R2-FE1), ES1-T326 (breadcrumb/page-title, #217).

## Thay đổi

- `templates/list-collections.liquid`
  - `{% render 'breadcrumb' %}` (Home / Collections) + `{% render 'page-title' %}` h1 "Collections" + meta `collections.count` ("{n} collections", số ít/nhiều; 0 collection thì không in meta).
  - `{% paginate collections by 24, window_size: 1 %}` → `{% render 'pagination', paginate: paginate %}` (snippet chung, AC6; chỉ 1 trang thì snippet không render).
  - Card dùng chung ngôn ngữ `.collection-card` của trang chủ: `<li>` → ảnh trang trí (`alt=""`) 336:220 bo 16 → h2 chứa đúng 1 link tên, `::after` phủ cả card → `<p>` meta `collections.products_count` ("{n} products").
  - Không ảnh: ô nền `--color-background-cream` + `status-icon` name `image` 30% `--color-muted-light`, giữ tỉ lệ (CLS 0). Bỏ `placeholder_svg_tag`.
  - LCP: card 1–4 (hàng đầu ở 1280) `loading="eager"`, chỉ card 1 `fetchpriority="high"`, còn lại lazy. `image_priority` gán `nil` để snippet image không in `fetchpriority=""`.
  - 0 collection: `{% render 'empty-state' %}` h2 "No Collections Yet", 1 câu, nút primary "Shop All Products" → `routes.all_products_collection_url`.
- `blocks/collection-card.liquid` (trang chủ): đổi markup từ `<a>` bọc cả card sang h3 chứa link tên + `::after` phủ card, ảnh rỗng có icon như trên. Cùng một bộ rule `.collection-card` cho 2 trang.
- `snippets/status-icon.liquid`: thêm icon `image` (trang trí, `aria-hidden`).
- `assets/base.css`
  - Xoá toàn bộ CSS list-collections cũ: `.list-collections__title`, `__empty`, `__item`, `__card`, `__card:hover`, `__card:focus-visible`, `__image`, `__placeholder`, `__placeholder-svg`, `__card-title`; xoá `.collection-card__link > …` cũ và override `.collection-card__image` trong khối Figma.
  - `.collection-card` chung: grid, `position: relative`, biến `--collection-card-gap` / `--collection-card-title` (trang chủ giữ default 16 / h3); `::after` phủ card; hover gạch chân 2px + ảnh scale 1.04 (trong khối motion có sẵn); focus-visible outline 2px trên `::after`, list-collections dùng `--color-accent` offset 4 theo spec §4.
  - Lưới list-collections 2/3/4 cột; gap 16/32 → 24/40 từ 80rem; ảnh → tên 12 → 16 từ 80rem; tên → meta 4; tên 18 → 28 (`--font-size-h3`) từ 48rem; h1 → lưới 32 → 48 từ 64rem; lưới → phân trang 48 → 64 từ 64rem. Chỉ token, chỉ logical property, `overflow-wrap: anywhere` cho tên dài, không cắt tên.
- `locales/en.default.json`: gộp vào key `collections` có sẵn: `count`, `products_count` (one/other), `empty_heading`, `empty_cta`; `empty` đổi thành 2 câu theo spec §4. Không trùng key.
- `tests/e2e/ES1-T108.spec.ts` (theo comment CTO 16/11: spec cũ trái AC mới thì sửa, ghi AC thay): href lấy từ `list-collections-card-link` thay card; tỉ lệ ảnh 336/220 thay 336/270 (TE-6 AC15 thay ES1-T107 #7); comment nojs ghi rõ bấm card rơi vào `::after` của link.

## Hook cho QA/BE

`list-collections`, `list-collections-grid`, `list-collections-card`, `list-collections-card-image`, `list-collections-card-title`, `list-collections-card-link`, `list-collections-card-meta`, `list-collections-empty` (+ `-heading`, `-button` của empty-state), hook của `breadcrumb`, `page-title`, `pagination`. Trang chủ giữ `collection-card`, `collection-card-image`, `collection-card-title`, `collection-card-link`. Không JS, không partial (trang render server).

## Tự kiểm tra

- `shopify theme check`: 0 lỗi (115 file, 22 warning có sẵn ở bundle-builder, featured-product, quiz-step, testimonial-item, index*.liquid; không file nào của PR này).
- base.css raw: develop 275 471 B → nhánh 275 656 B (+185 B). Gzip: chưa đo được (xem KHÔNG CHẮC); develop ~50,9 KB theo CTO, trần tạm 53 248 B.
- critical.css 10 014 B ≤ 10 240 (PR không đụng).
- Không file `.js` trong diff; 0 literal màu; không `left/right`; không `z-index`.
- Spec E2E bị ảnh hưởng đã rà: ES1-T108 (sửa như trên), ES1-T184 (title 28/34 ở 1920 vẫn qua vì trang chủ không set `--collection-card-title`; bo ảnh 16 = `--radius-card` 12 + `--space-1` 4).
- Playwright, Lighthouse (desktop/mobile cho `/collections` và trang chủ), ảnh 3 breakpoint, visual diff: chờ CI. Test cần store có > 24 collection (phân trang) và collection không ảnh sẽ skip nếu store dev thiếu dữ liệu, không coi là đạt.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
