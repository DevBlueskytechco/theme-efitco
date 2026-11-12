KHÔNG CHẮC: (1) selector nút Shopify Inbox `#ShopifyChat, #dummy-chat-button-iframe` chưa đo trên store dev (layers.md, ADR 0007 ghi KHÔNG CHẮC); BE xác nhận ở TE-10-R2-BE1, sửa thì sửa cùng lúc `data-inbox-selector` trong `layout/theme.liquid` và rule `html[data-inbox] :is(...)` trong `assets/base.css`. (2) Teaser Big Offer chưa có markup; CSS bám class `.offer-popup__teaser`, TE-18-R2-FE2 phải dùng đúng tên này (TE-10-R2-FE3 không xoá như CSS chết). (3) AGENTS.md chưa có dòng "z-index chỉ qua `--layer-*`" (ngoài phạm vi file FE): đề xuất Tech Lead thêm vào mục Styling and tokens, nguồn ADR 0007 mục 1.

# ES1-T312 · TE-10-R2-FE1: thang lớp, dải đáy, scroll-padding, màn thấp

AC: TE-10 AC6 (phần CSS), AC8 (CSS), NFR-1. ADR 0007 mục 1–4, 6, 7. Spec: `docs/ui-spec/layers.md` §1–§3, §2.5, §8.

## Thay đổi

`assets/base.css` (khối mới đầu file "Lớp và dải đáy màn hình"):
- `:root` 8 biến `--layer-content 1 / sticky 4 / bottom-bar 5 / header 10 / floating 15 / scrim 20 / overlay 21 / toast 30` + `--edge` (16 → 24 từ 48rem), `--sticky-top`, `--bottom-bar-height`, `--inbox-clearance` (mặc định 0).
- `html[data-bottom-bar="product|cart|bundle"]` → `--bottom-bar-height` = 72 + `env(safe-area-inset-bottom)`; product từ 48rem = 80 + safe area. Viết bằng `--space-1 * 18 / 20`, không px literal.
- Giữ song song `html[data-sticky-bar-visible]` (product-form.js hiện tại): 72 dưới 48rem, 0 từ 48rem (thanh cũ `display: none` từ 48rem).
- `body { padding-block-end: var(--bottom-bar-height) }`: thay rule cũ `html[data-sticky-bar-visible] body { padding-block-end: calc(44px + space-3 * 2) }` (đã xoá).
- `html` `scroll-padding-block-start: --sticky-top + space-4`, `scroll-padding-block-end: --bottom-bar-height + --consent-height + space-4` (WCAG 2.4.11). `--sticky-top` = `--header-height` khi có `.site-header[data-sticky]`. Xoá `scroll-margin-block-start` của `.product-media__item` (trùng, cộng dồn với scroll-padding).
- `html[data-layer-open]` / `html[data-consent]` → `.product-sticky-bar`, `.offer-popup__teaser` `visibility: hidden` + opacity + translate (ra khỏi thứ tự Tab, body giữ padding nên 0 CLS).
- `html[data-inbox]` → `--inbox-clearance` 72; nút Inbox dịch lên `translate: 0 -var(--bottom-bar-height)`.
- `@media (max-height: 30rem)`: `--sticky-top` 0, teaser `display: none`; thanh mua giữ.
- `.toast-region`: fixed, `--edge` mọi phía, < 48rem full width, từ 48rem inline-end rộng `min(25rem, ...)`, z `--layer-toast`, dịch `translate` theo `--bottom-bar-height + --inbox-clearance + --consent-height`, `pointer-events: none` trên vùng (con bật lại).
- Chuyển động: translate/opacity `--motion-base --ease-out` chỉ trong `prefers-reduced-motion: no-preference`.
- 11 `z-index` literal → `var(--layer-content)`, `calc(var(--layer-content) + 1)` (video badge), `var(--layer-bottom-bar)` (sticky bar).

`assets/critical.css`:
- 3 `z-index` literal → `--layer-content`, `calc(--layer-content + 1)` (drawer panel trong ngữ cảnh header), `--layer-header`.
- `@media (max-height: 30rem)`: `.block-container:has(> .site-header[data-sticky])` về `position: relative` (header thôi dính, TE-10 AC8).
- Rút comment Skeleton của `.block-container` để giữ ngân sách byte.

`layout/theme.liquid`:
- `<page-layers data-testid="page-layers" data-inbox-selector="...">` ngay sau `<body>` (không thẻ script, BE thêm).
- `<div class="toast-region" data-testid="toast-region" aria-live="polite">` cuối `<body>` sau cart drawer (layers §8 thứ tự DOM).

## Hợp đồng cho BE (TE-10-R2-BE1, TE-4-R2-BE4, TE-12-R2-BE1, TE-5-R2-BE1)

| Hook | Ai gắn | CSS làm gì |
| --- | --- | --- |
| `html[data-bottom-bar="product\|cart\|bundle"]` | module sở hữu thanh, không đo | `--bottom-bar-height`, body padding, scroll-padding, toast/Inbox dịch lên |
| `html[data-sticky-bar-visible]` | product-form.js hiện tại | như `product` dưới 48rem; bỏ sau khi QA chuyển test |
| `html[data-layer-open]` | page-layers.js | ẩn thanh đáy, teaser |
| `html[data-consent]` + `--consent-height` trên `html` | page-layers.js (ResizeObserver) | ẩn thanh đáy, teaser; toast + scroll-padding cộng `--consent-height` |
| `html[data-inbox]` | page-layers.js theo `data-inbox-selector` | `--inbox-clearance` 72, dịch nút Inbox |
| `[data-testid="toast-region"]` | JS chèn toast; cảnh báo/lỗi mang `role="alert"` | vị trí, z, dịch |

Phần HTML/CSS đã xử lý: thang z, chiều cao thanh, padding, scroll-padding, ẩn/hiện theo cờ, màn thấp, vị trí toast. Phần cần JS: chỉ bật/tắt các thuộc tính trên `html` và đo `--consent-height` (không có API CSS cho banner Shopify).

## Tự kiểm tra

- `shopify theme check`: 0 lỗi; 22 warning có sẵn ở 7 file không sửa (bundle-builder, featured-product, quiz-step, testimonial-item, index*.liquid).
- `grep -nE "z-index:\s*-?[0-9]" assets/*.css`: 0 dòng (trước 14).
- `wc -c assets/critical.css`: 9 782 B ≤ 10 240 (trước 9 921).
- `gzip -c assets/base.css | wc -c`: 42 715 B ≤ 49 152 (trước 41 277).
- Quét tĩnh như ES1-T217 TC-04/TC-05, TE-1 TC-02: 0 màu literal, 0 margin/padding vật lý, 0 bo góc hardcode; `@media (max-width: 47.99rem)` vẫn còn trong base.css (ES1-T67).
- Không file JS trong diff.
- Preview, Playwright, Lighthouse (desktop/mobile), ảnh 360/768/1280: chờ CI. Cần xem: PDP 360 thanh mua hiện → body padding 72 (trước 68), footer không bị che; viewport 640 × 400 header không dính; axe 0 lỗi với `page-layers` rỗng và `toast-region` rỗng.
- E2E TE-10 AC6–AC8 là TE-10-R2-QA1 (Sprint 3); AC6 phần Inbox cần store bật Shopify Inbox + page-layers.js, AC7 cần BE1.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
