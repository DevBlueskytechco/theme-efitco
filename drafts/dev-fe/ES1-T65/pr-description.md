KHÔNG CHẮC: (1) Figma không có trang sản phẩm → heading, lưới, card rút gọn là mặc định kỹ thuật ES1-T59 D7 / ES1-T61 #7 (CTO chốt, Designer soát ui_diff sau preview); (2) "heading default theo locale": schema `default` không đổi được theo intent → setting `heading` để trống, Liquid fallback `blocks.product_recommendations.heading_related` / `heading_complementary` (info ghi rõ); (3) không SSR được recommendations nên ngoài editor root luôn `hidden` tới khi BE4 ES1-T68 merge — trước đó 2 khối không hiện trên storefront; (4) complementary chỉ có dữ liệu khi cấu hình Search and Discovery (ES1-T60 #2, CTO tạo dữ liệu demo); (5) spec ở drafts vì scope-guard chặn tests/, chưa chạy.

# ES1-T65 TE-4-FE4: blocks/product-recommendations.liquid

Ticket: ES1-T65 · AC: docs/srs.md#TE-4 AC7 (markup) · Nguồn: drafts/techlead/ES1-T59/task-split.md D1, D7, D10, D11; ES1-T61 #7; ES1-T68 (hợp đồng BE4).

## Thay đổi
- `blocks/product-recommendations.liquid` (mới, không presets). Đọc `product` toàn cục. Param: `id` (static id, dùng cho id heading), `intent` (`related` | `complementary`, khác → `related`; param template, không phải setting).
  - Root `<product-recommendations>` + `block.shopify_attributes`, `hidden` ngoài editor; `data-intent`, `data-url="{{ routes.product_recommendations_url }}"`, `data-product-id`, `data-limit` (= products_to_show), `data-money-format="{{ shop.money_format | escape }}"`; `style="--columns; --columns-tablet"`.
  - `h2` heading (setting hoặc locale theo intent); `ul role=list aria-labelledby=heading` rỗng (`[data-recommendations-list]`).
  - `<template data-recommendations-template>`: 1 `li` > `.product-card` rút gọn: link ảnh (`tabindex=-1 aria-hidden`) + `img` `width/height=1080`, `loading=lazy`, `sizes` theo cột, `alt=""`; badge `data-badge=sold_out` `hidden` chữ locale Sold out; `h3` > link tiêu đề; `.price` với nhãn ẩn Regular price / Sale price + giá gạch (CSS đổi nhãn theo `price--on-sale`, như snippets/price.liquid). Không swatch.
  - Editor (`request.design_mode`): root không hidden, `[data-recommendations-placeholder]` gồm câu hướng dẫn locale theo intent + `products_to_show` ô placeholder SVG.
  - Trạng thái rỗng: không có `product` → chỉ render trong editor. Lỗi / 0 kết quả: giữ `hidden` (BE4).
  - 3 settings: `heading` (text, trống = mặc định locale), `products_to_show` (range 2–8, default 4), `columns_desktop` (range 2–5, default 4).
- `templates/product.liquid`: container `product-related` → `{% block 'product-recommendations', id: 'product-recommendations-related', intent: 'related' %}`, container `product-complementary` → `id: 'product-recommendations-complementary', intent: 'complementary'`.
- `assets/base.css`: mục "Product recommendations". Heading như featured-collection (`--font-size-h1`, 58/48), lưới 2 cột → `--columns-tablet` (tối đa 3) từ 48rem → `--columns` từ 80rem, gap/padding như featured-collection; `[hidden]` → none; `ul:empty` → none; card dùng lại `.product-card*`. Chỉ token css-variables.
- `locales/en.default.json`: `blocks.product_recommendations` (heading_related, heading_complementary, placeholder_related, placeholder_complementary); dùng lại `products.card.sold_out`, `products.price.*`. `en.default.schema.json`: `general.product_recommendations`, `info.product_recommendations_heading`, `info.product_recommendations_columns`; dùng lại `labels.heading/products_to_show/columns_desktop`.

## Hợp đồng cho BE4 (ES1-T68)
- Thêm 1 `<script type="module">` cho `assets/product-recommendations.js` trong block. Không fetch khi có `[data-recommendations-placeholder]`.
- Fetch `data-url + '.json?product_id=' + data-product-id + '&limit=' + data-limit + '&intent=' + data-intent`. Clone `template[data-recommendations-template].content` vào `[data-recommendations-list]`:
  - `[data-card-link]` (2 thẻ a) → href; `[data-card-title]` → text tiêu đề;
  - `img[data-card-image]` → src/srcset, width/height từ JSON (giữ `sizes`, `loading`); không có ảnh → xoá img;
  - `.price[data-card-price]`: sale → thêm class `price--on-sale`; `[data-card-price-current]` / `[data-card-price-compare]` → tiền theo `data-money-format`;
  - `[data-card-sold-out]` → bỏ `hidden` khi `available` false.
- Có kết quả → bỏ `hidden` root; 0 kết quả / lỗi → giữ.

## data-testid (9)
product-recommendations, product-recommendations-heading, product-recommendations-list, product-recommendations-template, product-recommendations-placeholder, product-recommendations-card, product-recommendations-card-title, product-recommendations-card-price, product-recommendations-card-sold-out.

## Tự kiểm tra
- `shopify theme check --path .`: 51 file, 0 offense.
- Locale JSON parse OK, không trùng key (object_pairs_hook), key gộp vào `blocks` / `general` / `info` sẵn có.
- Không file JS trong diff.
- Spec: `drafts/dev-fe/ES1-T65/ES1-T65.spec.ts` (2 test `AC7-markup`, context tắt JS; nhờ Orchestrator chép sang `tests/e2e/ES1-T65.spec.ts`). Chưa chạy, chưa type-check.
- Playwright, lhci 96/90/98, ảnh 3 breakpoint: chờ CI. Placeholder trong theme editor (ảnh chụp): chờ kiểm tay trên preview.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
