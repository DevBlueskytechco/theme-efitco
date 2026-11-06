KHÔNG CHẮC: (1) docs/tokens.json bị scope-guard chặn với dev-fe → patch ở drafts/dev-fe/ES1-T44/tokens.json.patch (`git apply --check` ok), Orchestrator apply. (2) data-testid="rich-text-inline-image" nằm trên span bọc img, không trên img: `image_tag` với tham số có gạch nối (`data-testid:`) chưa chắc parse được lúc chạy, không dám đưa vào. QA dùng `[data-testid="rich-text-inline-image"] img`. (3) Heading 100px vừa 2 dòng trong cột 732 tính theo số Figma (dòng 2 render 694); metric font thật chưa đo, chờ ảnh CI.

# ES1-T44 TE-2-FE3: rich-text 2 cột, nền sand, ảnh inline, CTA link + mũi tên (Figma 1:454)

Nguồn: ADR 0005 (quyết định 1-5), drafts/designer/ES1-T34/ui-spec-rich-text.md, ticket ES1-T44 + comment Tech Lead/CTO 02/11 (ES1-T42 chốt làm ảnh inline).

## Thay đổi
- config/settings_schema.json: nhóm Colors thêm `background_sand_color` #EBE6E0, `background_sand_foreground_color` #1A1A1A (info nhắc dùng muted, không muted_light). Tổng 19 màu.
- snippets/css-variables.liquid: `--color-background-sand`, `--color-background-sand-foreground`.
- docs/tokens.json: KHÔNG sửa trực tiếp (scope-guard), xem patch.
- blocks/container.liquid: `@param background` (alt/cream/sand/dark, giá trị khác bỏ qua) → class `block-container--<giá trị>`; `@param id` khai trong doc (tiền lệ slideshow-slide) và in `data-testid="container-<id>"` khi có id. Không thêm setting.
- templates/index.liquid: `{% block 'container', id: 'home-intro', background: 'sand' %}` bọc rich-text.
- snippets/image.liquid: 3 param tuỳ chọn `inline` (wrapper span, hợp lệ trong h2), `decorative` (alt=""), `testid`. Mọi nhánh truyền `alt: tag_alt` (= image.alt, hành vi cũ không đổi).
- blocks/rich-text.liquid:
  - Setting mới `inline_image` (image_picker), `heading_after_image` (text, default "to Train."); `heading` default "Everything You Need"; `body` default 1 đoạn theo ui-spec; `max_width` default 1416.
  - Heading = heading + ảnh (render 'image', inline, decorative, width 330, widths 165/330, lazy) + heading_after_image trong 1 thẻ h1/h2. Giữa các phần là dấu cách thật → textContent chuẩn hoá = "Everything You Need to Train.". Không ảnh: nối bằng 1 dấu cách.
  - Body + CTA gói trong `.rich-text__content` (cột phải).
  - CTA `class="button button--link"`, nhãn trong `.button__label`, sau đó `slideshow-icon` name arrow (aria-hidden, focusable false sẵn trong snippet).
  - Rỗng: heading/ảnh/body/nút đều trống → placeholder trong editor, storefront không render (giữ nguyên).
- assets/base.css:
  - `.block-container--alt/cream/sand/dark`: background-color + color foreground theo token.
  - `.button.button--link`: không nền/border/padding/radius, min-height 44px (2 class để thắng `.button { min-height: 52px }` ở 80rem), gap `--space-3`, font heading `--font-heading--weight` (700), `--font-size-h3`, line-height 34/28, -0.02em, color currentcolor. Icon 20 × 16 (`--space-1 * 5` × `--space-4`). Hover: gạch chân `.button__label`, icon dịch `--space-1`; RTL lật icon `scale: -1 1` và dịch ngược; `prefers-reduced-motion: reduce` tắt dịch + transition. Focus dùng lại `.button:focus-visible`.
  - Rich text: bỏ rule `* + *` cũ; grid; heading 800 uppercase -0.04em line-height 1, 48px (3rem) dưới 64rem; ảnh inline inline-block, block-size 0.94em, aspect-ratio 165/94, radius `--radius-card`, object-fit cover.

## Breakpoint (Tech Lead yêu cầu ghi số)
- 1 cột dưới 64rem (1024px); 2 cột `minmax(0, 732fr) minmax(0, 526fr)` từ 64rem. Gap cột `max(--space-7, 11.16%)` (158/1416).
- Heading 2 cột: `min(--font-size-display, (100cqi - gap) / 12.58)` với `.rich-text` là container `inline-size`. Cỡ chữ = cột trái / 7.32em (hộp Figma 732 ở 100px, dòng dài nhất 6.94em) → 100px ở 1416, ~89px ở 1280, ~69px ở 1024; dòng heading không tràn cột ở mọi bề rộng ≥ 64rem. Chọn 1024 thay vì 769: ở 769 cột phải chỉ ~270px, chữ ~51px, gần bằng 1 cột.
- padding-block `--space-7` dưới 64rem, `--space-8` từ 64rem; body → CTA `--space-5` / `calc(var(--space-1) * 10)`; heading → cột phải (1 cột) `--space-5`. Theo ui-spec 768/1280.

## Lệch so với ticket/ADR (có lý do)
- Ảnh inline: `margin-inline` 0 thay 0.2em. Khoảng 2 bên ảnh là dấu cách thật (DoD bắt textContent có dấu cách giữa "Need" và "to"); cộng thêm 0.2em sẽ thành ~0.4em, lệch Figma (~20px mỗi bên ở 100px).
- Ảnh inline `vertical-align: top` thay `middle`: Figma ảnh nằm y +99 trong dòng 2 (100-200) → canh đỉnh; `middle` đẩy ảnh xuống và nới line box.
- Thêm `data-testid="container-home-intro"` để QA lấy container cho getComputedStyle (ngoài 5 testid ticket nêu).

## data-testid
rich-text, rich-text-heading, rich-text-body, rich-text-button (giữ); rich-text-inline-image (mới, trên span bọc img); container-home-intro (mới).

## Không có JS
Diff không có file .js. Không partial mới.

## Tự kiểm tra
- `shopify theme check --path .`: 40 file, 0 offense. `.theme-check.yml` không đổi.
- `grep -nE '#[0-9a-fA-F]{3,8}\b' assets/*.css`: 0 dòng.
- Locale/schema JSON parse ok, không trùng key (thêm vào `labels`/`info` có sẵn).
- 19 setting màu trong settings_schema.
- Store dev (getComputedStyle rgb(235, 230, 224), textContent heading, alt="", CTA ≥ 44px, aria-hidden icon): chờ CI.
- Lighthouse (a11y ≥ 98, 0 color-contrast; perf 96/90), ảnh 1920 so 1-453.lowres.png, 3 breakpoint: chờ CI.
- Merchant cần chọn ảnh cho `inline_image` trên store dev (static block, chưa có ảnh mặc định) để so ảnh Figma.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
