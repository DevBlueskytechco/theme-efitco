KHÔNG CHẮC: ES1-T49 (Designer) chưa trả lời. Đang theo mặc định của Tech Lead: ảnh dùng `--radius-card` (8) chứ không phải 12 như Figma 1:502, swatch 32 × 16 trong vùng bấm 32 × 24, tối đa 5 swatch, badge Sold out nền foreground. Designer trả lời khác thì sửa trong CSS, không đổi markup.

# ES1-T50 — TE-3-FE1: product card + price snippet

Ticket: ES1-T50 (2727475000000144029), cha TE-3. Nguồn: docs/srs.md TE-3 AC2 (markup), AC3, AC4, AC6, AC8, quy tắc Hết hàng; Figma 1:502 (snapshot + docs/figma/img/1-490.png); DESIGN.md; drafts/techlead/ES1-T47/task-split.md D1, D2, D3, D5, D7.

## Thay đổi
- `snippets/product-card.liquid` (mới). Params trong doc: `product`, `variant` (AC8), `id_prefix`, `sizes`, `loading` (mặc định lazy), `heading_level` (mặc định h3). `card_variant = variant | default: product.selected_or_first_available_variant`; ảnh, giá, link, swatch chọn sẵn đều lấy từ card_variant.
  - Root `<product-swatch class="product-card">`. CSS cho display, BE1 định nghĩa element.
  - Link ảnh `tabindex="-1" aria-hidden="true"`; tiêu đề là link duy nhất focus được. Ảnh 1:1, nền cream, `object-fit: contain` + `mix-blend-mode: darken` như Figma. alt lấy từ ảnh, ảnh không có alt thì dùng product.title. Không có ảnh thì dùng `placeholder_svg_tag 'product-1'`.
  - Badge: Sold out khi `product.available == false` (thay chỗ badge sale). Sale khi compare_at > price; % = `(compare_at - price) * 100.0 / compare_at | round`, ra 0 thì hiện chữ "Sale".
  - Swatch: lấy option đầu tiên có `values.first.swatch` và từ 2 value trở lên. Dùng `fieldset` + `legend` ẩn; mỗi value có radio `name="<id_prefix>-<product.id>[-<variant.id>]-option"` + label pill (`swatch.image` hoặc `swatch.color` qua `--swatch-image` / `--swatch-color`). Tối đa 5; dư thì có link "+N" tới product.url.
  - AC8: khi card_variant khác variant mặc định, mỗi swatch tìm variant có value đó và giữ nguyên các option khác của card_variant. Không tìm được thì lấy variant đầu tiên có value đó. Trường hợp mặc định dùng `value.variant`.
- `snippets/price.liquid` (mới). Params `product`, `variant`, `show_range` (mặc định true). Hiện khoảng giá khi price_varies, không truyền variant và show_range khác false. Sale: giá + `<s>` giá gạch, nhãn ẩn "Sale price" / "Regular price" đặt cạnh (không nằm trong span có testid). Unit price: `price/unit`, unit = reference_value + reference_unit, bỏ reference_value khi bằng 1.
- `templates/collection.liquid`: thay `render 'image'` bằng `render 'product-card'` (id_prefix `collection`, sizes 100vw / 50vw / 25vw, 4 card đầu tải eager vì chứa ảnh LCP). Giữ fix ES1-T46.
- `assets/base.css`: thêm khối CSS Product card + `.price` + swatch, ngay dưới `.collection-products`. `.collection-products` thêm `gap`. Chỉ dùng biến token và logical properties.
- `locales/en.default.json`: thêm key `products.card.*` (`more_swatches`, `sale`, `sale_percent`, `sold_out`) và `products.price.*` (`range`, `regular_price`, `sale_price`, `unit_price`, `unit_price_value`). Không trùng key.

## Hợp đồng cho BE1 (ES1-T52) và QA
- data-testid (14): `product-card`, `product-card-image` (trên `<img>`), `product-card-title` (trên `<a>`), `product-card-badge-sale`, `product-card-badge-sold-out`, `product-card-swatches` (trên `<fieldset>`), `product-card-swatch` (trên `<label>`, tức vùng bấm 32 × 24; radio là phần tử liền trước, `label[for]`), `product-card-swatch-more`, `product-card-placeholder-image` (trên span bọc svg), `price`, `price-regular` (giá đang bán), `price-compare`, `price-range`, `price-unit`.
- Hook trên mỗi `input[type=radio]`: `data-variant-id`, `data-variant-url`, `data-image-src` (1080w), `data-image-srcset` (360/720/1080w), `data-image-alt`. Card: `img[data-card-image]`, `a[data-card-link]` (ảnh, tiêu đề, +N), `[data-card-price]`. Khi `product.price_varies`, ngay sau mỗi label có `<template data-price-for="<variant id>">` chứa price snippet của đúng variant trong `data-variant-id`.
- Partial: không có (D5). JS: không có trong diff.

## Lệch so với ticket, cần review
- Link "+N" có `tabindex="-1" aria-hidden="true"` (trùng đích với tiêu đề) để giữ tab order đúng DoD "tiêu đề + nhóm swatch".
- Badge Sale "-25%" theo Figma. Badge rating và New không làm (ngoài phạm vi, chờ ES1-T48).

## Tự kiểm tra
- `shopify theme check --path .`: 42 file, 0 offense. `.theme-check.yml` không đổi.
- `git diff -U0 assets/base.css | grep -cE '^\+.*(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()'`: 0.
- Không có file `.js` trong diff. `locales/en.default.json` là JSON hợp lệ, chỉ thêm nhánh `products`.
- Spec E2E: `drafts/dev-fe/ES1-T50/ES1-T50.spec.ts`. scope-guard chặn dev-fe ghi `tests/`, nhờ Orchestrator chép sang `tests/e2e/ES1-T50.spec.ts`. Tên test: AC2-markup, AC3, AC4, sold-out, AC6. Thiếu dữ liệu demo thì skip có lý do.
- Playwright, axe, Lighthouse (≥ 96 / 90 / 98), ảnh 360/768/1280 /collections/all: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
