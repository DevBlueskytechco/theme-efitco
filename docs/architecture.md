# Kiến trúc theme-efitco · Tech Lead · bản 0.1

## Nền
Skeleton Theme `a7a655e79b21e68316c228dc7e437b0b32550888`, block-first: `templates/*.liquid` là composition root → `{% block 'container' %}` → block/snippet/markup. Không `sections/`, không JSON template, không presets. Chi tiết và quy tắc: `AGENTS.md` (không bàn lại).

## Thư mục và vai trò
- `layout/theme.liquid`: header/footer trong container block, `<main>` content_for_layout, meta-tags, css-variables, critical.css inline, base.css.
- `blocks/`: 12 block trang chủ + header, footer, container, custom-liquid, product-*, cart-*, collection-*, search-*. Mỗi block tự đủ: doc, schema, shopify_attributes.
- `snippets/`: `image`, `css-variables`, `meta-tags`, `product-card`, `price`, `badge`, `icon`, `variant-json`.
- `assets/`: `base.css`, `critical.css`, mỗi tính năng JS 1 file ES module ≤ 8 KB: `product-form.js`, `product-swatch.js`, `cart-drawer.js`, `collection-filters.js`, `predictive-search.js`, `header-menu.js`, `accordion.js`.
- `templates/`: 12 template Liquid của Skeleton, mỗi cái compose block.
- `config/settings_schema.json`: theme_info, Typography, Layout, Colors (6 màu từ tokens.json), Cart, Social, Favicon. `settings_data.json`: preset mặc định.

## Luồng dữ liệu động
Không có Section Rendering API (không sections). Dùng `{% partial 'name' %}` + `@shopify/partial-rendering` cho: cart-drawer, cart-count, collection-products, collection-filters, search-suggestions, product-media, product-price. Fallback: form submit thường. Ràng buộc: partial chỉ render khi `shop.features.agentic_editor_enabled?` — store dev phải bật; nếu không, JS phát hiện lỗi 'Unknown tag' không xảy ra vì SFR; chỉ thử trên store đã bật.

## Token và màu
`tokens.json` (Designer) → settings color/font/range → `css-variables.liquid` sinh `--color-*`, `--font-*`, `--space-*`, `--radius-*`. CSS chỉ dùng biến. ADR 0001.

## JS
Web Components không framework, progressive enhancement, mỗi tính năng 1 file, nạp `type="module"` trong block cần. ADR 0002.

## Hiệu năng
Ngân sách: LCP ≤ 2.0s mobile benchmark; CSS critical inline ≤ 10 KB; JS tổng ≤ 40 KB; ảnh hero eager + fetchpriority high, còn lại lazy; font display swap, preload 1 font chính. ADR 0003.

## Canvas / Sidekick
Giữ 100% cấu trúc Skeleton để Sidekick đọc được; mỗi block có `{% doc %}` đủ để agent hiểu; settings phẳng; locale key đầy đủ. ADR 0004.

## Môi trường
yum-dev (efitco-dev) (người), hoa-qua-nhap-khau (efitco-ai-dev) (agent, preview per branch), efitco-canvas (store thật bật Canvas, chỉ DevOps người upload zip). CI: theme check → preview → lhci → playwright.
