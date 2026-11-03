KHÔNG CHẮC: (1) AC8 — sandbox không vào được shopify.dev, nên block nhận diện phần tử variant bằng `item.product != blank`. Chưa kiểm được trên collection đa nguồn thật, đã hỏi ở ES1-T54, dữ liệu test ở ES1-T48 #6. (2) Heading dùng cỡ 48 (`--font-size-h1`) cho khớp Figma 1:495, trong khi DESIGN.md ghi block heading là h2 36, đã hỏi ở ES1-T54. (3) Vị trí nút Xem tất cả và gap mobile đang theo mặc định của Tech Lead, chờ Designer trả lời ES1-T49.

# ES1-T51 — TE-3-FE2: block featured collection

Ticket: ES1-T51 (2727475000000140034), cha TE-3, blocked_by ES1-T50 (đã merge #51). Nguồn: docs/srs.md TE-3 AC1, AC5, AC7, AC8; Figma 1:490–1:496 (snapshot + docs/figma/img/1-490.png); DESIGN.md; AGENTS.md; ADR 0004; drafts/techlead/ES1-T47/task-split.md D1, D3, D4, D7, D8.

## Thay đổi
- `blocks/featured-collection.liquid` (mới).
  - Doc có `id` (dùng làm id cho heading, dùng trong aria-labelledby) và `default_collection`. Không khai `@param content` vì khai mà không dùng thì bị UnusedDocParam; doc ghi bằng văn xuôi là caller để body trống. Schema không có presets. `block.shopify_attributes` đặt trên root `<section>`.
  - 7 settings: `collection`, `products_to_show` (range 4–12, bước 1, mặc định 8), `columns_desktop` (range 3–5, mặc định 4), `eyebrow` (text, mặc định Bestsellers), `heading` (inline_richtext, mặc định What People Are Buying?), `show_view_all` (mặc định false), `view_all_position` (header / bottom, mặc định bottom).
  - Nguồn: `block.settings.collection`, nếu blank thì dùng `collections[default_collection]`.
  - AC5: không có nguồn hoặc `products_count == 0` thì trong editor (`request.design_mode`) hiện heading, dòng hướng dẫn (`blocks.featured_collection.placeholder`) và `products_to_show` ô `placeholder_svg_tag` (product-1..6). Ngoài editor không render gì.
  - Lưới: `ul role=list` > `li` > `render 'product-card'` với `id_prefix: block.id`, `sizes: '(min-width: 1280px) calc(1416px / <cols>), (min-width: 768px) 33vw, 50vw'`, `loading: 'lazy'`. Số cột desktop truyền qua `style="--columns: N"`.
  - AC8: phần tử có `item.product` thì render `product: item.product, variant: item`, còn lại `product: item`. Card (ES1-T50) đã lấy ảnh, giá, link `?variant=` và swatch chọn sẵn theo variant.
  - AC7: link `button button--secondary` tới `source.url`, chữ hiện "View all", kèm phần ẩn " products in <collection>" để tên link không trùng nhau. Vị trí `header` (trong `.featured-collection__header`, cạnh heading, chỗ tabs của Figma) hoặc `bottom` (dưới lưới, căn giữa). Chỉ hiện khi có sản phẩm.
  - Không có thẻ script; BE1 (ES1-T52) thêm.
- `templates/index.liquid`: thêm `{% block 'container', id: 'home-featured-collection', tag: 'div' %}` > `{% block 'featured-collection', id: 'featured-collection', default_collection: 'all' %}`. Container để `tag: 'div'` vì block đã là `<section aria-labelledby>`, tránh section lồng section.
- `assets/base.css`: thêm khối Featured collection sau CSS swatch.
  - Padding-block `--space-7`, từ 64rem là `--space-8` (120 theo Figma).
  - Khoảng heading → lưới `--space-5`, từ 64rem là 40 (`--space-1` × 10).
  - Lưới 2 cột gap `--space-4`; từ 48rem 3 cột; từ 80rem `repeat(var(--columns), …)` gap `--space-5` (24 theo Figma).
  - Eyebrow: heading font, weight 800, 16/20, uppercase, màu `--color-accent`.
  - Heading 48/58, letter-spacing -0.02em.
  - Chỉ dùng token và logical properties.
- `locales/en.default.json`: thêm `blocks.featured_collection.{placeholder, view_all, view_all_suffix}`, gộp vào key `blocks` đã có.
- `locales/en.default.schema.json`:
  - `general.featured_collection`
  - `info.{columns_desktop, featured_collection_collection}`
  - `labels.{collection, columns_desktop, eyebrow, heading, products_to_show, show_view_all, view_all_position}`
  - `options.view_all_position.{header, bottom}`

## Hợp đồng cho BE1 / QA
- data-testid (5):
  - `featured-collection`: root section, có cả lúc ở trạng thái placeholder trong editor.
  - `featured-collection-heading`: h2.
  - `featured-collection-grid`: ul.
  - `featured-collection-view-all`: a.
  - `featured-collection-placeholder`: wrapper hướng dẫn + lưới placeholder, chỉ có trong editor.
- Container: `container-home-featured-collection`.
- Partial: không có (D5). BE1 thêm `<script type="module">` cho product-swatch trong block này.

## Lệch so với ticket / Figma
- Không làm tabs 1:496, badge rating, badge New (ngoài phạm vi, chờ ES1-T48).
- Heading cỡ 48 theo Figma, không theo bảng DESIGN.md (36), xem ES1-T54.
- Hết sản phẩm sau `limit` thì không hiện thêm gì; không làm phân trang.

## Tự kiểm tra
- `shopify theme check --path .`: 43 file, 0 offense. `.theme-check.yml` không đổi.
- `git diff -U0 assets/base.css | grep -cE '^\+.*(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()'`: 0.
- Locale: JSON hợp lệ, đã kiểm trùng key bằng object_pairs_hook: 0.
- Diff không có file `.js`.
- Spec E2E nằm ở `drafts/dev-fe/ES1-T51/ES1-T51.spec.ts`, nhờ Orchestrator chép sang `tests/e2e/ES1-T51.spec.ts` (scope-guard chặn `tests/`). Có test AC1 cho 360/768/1280 (đo cột bằng `grid-template-columns`; số li = min(8, `/products.json`)), AC7 (`EXPECT_VIEW_ALL=header|bottom`, mặc định kiểm không có nút) và axe trên block.
- Chờ CI: Playwright, axe trên /, Lighthouse (≥ 96 / 90 / 98), ảnh 360/768/1280 và ảnh so Figma 1:490.
- AC5: kiểm tay trong editor preview (collection rỗng có placeholder, storefront không có block) — chưa chạy, cần preview.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
