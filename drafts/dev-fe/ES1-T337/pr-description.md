KHÔNG CHẮC: (1) spec ES1-T337 chưa chạy (sandbox không có trình duyệt/PREVIEW_URL; scope-guard chặn ghi tests/) → Orchestrator chép drafts/dev-fe/ES1-T337/ES1-T337.spec.ts sang tests/e2e/. (2) TE-3.spec TC-16, TC-51 sẽ đỏ trên store có card swatch vì còn kỳ vọng radio/5 swatch: QA sửa ở ES1-T441. (3) Dòng `variant.title` tắt ở bundle-builder (`show_variant_title: false`) để giữ Figma 1:636; task-split không nói rõ bundle.

# ES1-T337 TE-3-R2-FE1: product-card swatch chỉ báo, sold out, variant.title

Ticket: ES1-T337 · Story TE-3 · AC TE-3 AC2, AC6, AC8 (+ AC13 VP2) · Sau ES1-T404, ES1-T403 (đã merge).

## Thay đổi
- `snippets/product-card.liquid`
  - Bỏ `<product-swatch>` → root `<div class="product-card">`; bỏ radio, `<fieldset>`, `<template data-price-for>`, data-* cho JS swatch.
  - Bỏ vòng `for candidate in product.variants` (ADR 0008). Chỉ báo dựng từ `product.options_with_values` → `option.values`, luật chọn option giữ như ES1-T404 (VP3, chỉ `value.swatch.color/image`).
  - Hàng chỉ báo `<div class="product-card__swatches" aria-hidden="true">` + `<span class="product-card__swatch">`: không focus, không bấm (`pointer-events: none`).
  - VP2/AC13: ≤ 4 giá trị hiện hết; > 4 hiện 3 + `<span data-testid="product-card-swatch-more">+N</span>` (không còn link). Giá trị của biến thể card nằm sau vị trí 3 thì thế vào ô thứ 3 để luôn thấy (AC8).
  - `data-selected` trên swatch của biến thể card (AC8, Figma 1:186: viền accent + tick).
  - Tên link tiêu đề thêm chữ ẩn ", N colors" (locale số nhiều `products.card.color_count`).
  - Card nhận `variant` + sản phẩm > 1 biến thể: dòng `variant.title` trong link tiêu đề (`.product-card__variant`, `data-testid="product-card-variant-title"`), có ", " ẩn để tên truy cập tách rõ. Param mới `show_variant_title` (mặc định bật).
  - Sold out (sản phẩm hoặc biến thể card hết hàng): `data-sold-out` trên root → ảnh opacity 0.6 (foundation §9).
  - Bỏ param `id_prefix` (card hết input, theme check báo UnusedDocParam); giữ `data-card-link/-image/-price/-badge` vì test hiện có dùng.
- `blocks/featured-collection.liquid`, `collection-products.liquid`, `quiz.liquid`, `bundle-builder.liquid`: bỏ `id_prefix:` (featured-collection bỏ luôn `card_id_prefix`); bundle thêm `show_variant_title: false`.
- `assets/base.css`: xoá CSS swatch radio cũ (vùng bấm 44, `:checked`, `:focus-visible`, khối 80rem, `::before` box-sizing, hover scale swatch, selector `product-swatch`); một bộ rule chỉ báo cho mọi mốc: pill 32 × 16 `--space-6 × --space-4`, cách `--space-1`, bo `--radius-pill`, viền trong `--color-background`, đang chọn viền `--color-accent` + tick `--icon-tick`; "+N" 14 `--color-muted`; `.product-card__variant` 14 muted; ảnh sold out 0.6; tiêu đề `overflow-wrap: anywhere`. 0 literal màu.
- Lượt 2 (CI #207 TC-54 D7): `.product-card__swatch::after` là vùng chạm trong suốt 44 × 44 (từ 80rem: 36 × 44), canh giữa bằng `inset: calc(50% - 22px)` (đối xứng, không cần rule RTL), không đổi layout, `pointer-events: none` theo hàng. Pill giữ `::before` 32 × 16 (Figma). Dấu tick của swatch đang chọn chuyển từ `::after` sang con `<span class="product-card__swatch-tick">` (chỉ in khi `data-selected`).
- `locales/en.default.json`: `products.card.color_count` (one/other) gộp vào khối `products.card` có sẵn.

## Cho BE (TE-3-R2-BE2)
- Card không còn phần tử `product-swatch`; `assets/product-swatch.js` không còn đối tượng. Gỡ 3 thẻ script (featured-collection:278, collection-products:223, quiz:280) và file ở TE-3-R2-BE2. Không đổi JS trong PR này.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 22 warning (có sẵn, ngoài diff; warning UnusedDocParam do PR này đã gỡ).
- `gzip -c assets/base.css | wc -c`: 43 593 (trước 43 687, trần 49 152). `critical.css` không đổi: 10 067.
- `grep -n "product.variants\|product-swatch\|<input" snippets/product-card.liquid`: chỉ còn 1 dòng chú thích doc.
- Locale JSON hợp lệ, không trùng key.
- Không file JS trong diff.
- Playwright (spec ES1-T337, smoke, TE-3), Lighthouse desktop/mobile, ảnh 360/768/1280/1920 trang chủ và /collections/all: chờ CI.
- Test cần dữ liệu store (skip có lý do nếu thiếu, không coi là đạt): sản phẩm > 4 giá trị có swatch gốc (`T337_MANY_COLORS_HANDLE`), `TE3_AC8_VARIANT_ID` + `TE3_AC8_PATH`, card hết hàng có ảnh.

## Test bị ảnh hưởng (ES1-T441, QA)
- Đỏ nếu store có card swatch: TE-3 TC-16 (5 swatch + legend + link "+N"), TC-51 (Tab vào nhóm swatch).
- Tự skip vì không còn radio: TE-3 TC-10, TC-11, TC-13, TC-14, TC-17, TC-52, TC-55 phần sau đổi; ES1-T73; ES1-T190 đổi swatch; ES1-T189 swatch sau clone; ES1-T139 nhánh product-swatch.
- TE-3 TC-54 (vùng chạm `::after` ≥ 44 / ≥ 36 desktop): sửa ở lượt 2, không sửa spec. ES1-T190 "không chồng vùng bấm" đang `test.skip`; nếu bật lại thì ở 360 vùng 44 của pill cách 36 sẽ chồng nhau (vô hại vì không bấm được).
- Lỗi ES1-T96 AC8 importmap `@shopify/partial-rendering`: có sẵn trên develop (ES1-T415, PR #190), ngoài phạm vi.
- Giữ được: ES1-T190 "hình swatch 32 × 16" (pill vẽ ở `::before`), TE-3 TC-10c (tên giá trị còn trong chữ ẩn), TC-50 (mỗi card 1 link focus được).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
