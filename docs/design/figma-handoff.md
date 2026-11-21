# Handoff: dựng lại file Figma từ mockup Efitco

Cho Designer người. Lập ở ES1-T567 (CTO 21/11). Bản design system 2.0.0 (CTO chốt số bản 21/11 lượt 2).

Quy tắc gốc: mockup HTML là NGUỒN CHUẨN. File Figma mới được dựng TỪ mockup, không theo chiều ngược lại. Khi Figma và mockup lệch nhau: mockup thắng, sửa Figma. Muốn đổi thiết kế: đề xuất trên mockup (ticket Designer), CTO chốt, kit đổi trước, Figma chép sau.

Không mang gì từ file Figma cũ ("Efitco Theme Final / Design System 2", khung trang chủ desktop) sang file mới: không copy frame, style, variable, tên layer. File cũ lưu trữ, không còn là căn cứ. Ảnh và logo lấy từ URL / SVG đang dùng trong mockup.

## 1. Nguồn và cách xem

| Thứ | Ở đâu |
| --- | --- |
| Mockup sống (xem trên trình duyệt, đổi bề rộng cửa sổ để xem 4 khổ) | Artifact claude.ai `CTjTBzFkfDEHcPBGstiK2p` (https://claude.ai/artifact/CTjTBzFkfDEHcPBGstiK2p) |
| Token và component (nguồn chuẩn) | `drafts/designer/_kit/kit.css`: `:root` (150 biến) và các khối component |
| Màn Design System | `drafts/designer/ES1-T251/foundation.html`: 43 section, mỗi section một `id="h-*"` |
| Token máy đọc (để nhập variable) | `docs/tokens.json` |
| Giải thích, anatomy, a11y | `docs/ui-spec/foundation.md`, `DESIGN.md`, `docs/ui-spec/<trang>.md` |
| Quy tắc chữ | `docs/design/content.md` |
| Quyết định CTO | `docs/design/decisions.md` |

- Mở file HTML tại máy bằng trình duyệt (cần mạng để tải font Google và ảnh). Đo số bằng DevTools: tab Computed cho cỡ, dòng, khoảng cách; ô `:root` cho giá trị biến.
- 4 khổ thiết kế: 360, 768, 1280, 1920 (CTO 09/11). Breakpoint trong CSS: 48rem (768), 64rem (1024, chỉ đổi khoảng cách section và bố cục footer), 80rem (1280). Ở 1920 nội dung dừng ở 1416, lề hai bên 252.
- Link bài viết trong mockup (`/blogs/training/<handle>`) là handle ĐÍCH sau khi DevOps đổi handle trên store dev; `docs/design/demo-data.json` (sinh tự động, không sửa tay) còn handle có tiền tố cũ nên đến khi đổi xong link không mở được trên store dev. DevOps đổi handle rồi chạy lại `ai-team/ops/export_demo_data.py`. Khi dựng lại chỉ cần chữ và ảnh của card, không cần link.
- Ảnh PNG cạnh mỗi file HTML (`<trang>-360|768|1280|1920.png`) là ảnh chụp để so nhanh; khi PNG và HTML lệch thì HTML thắng. PNG của mọi trang đã chụp lại ở bản 2.0.0 (21/11).
- Trạng thái (hover, focus, disabled, loading, error) được vẽ tĩnh trong màn DS bằng class `.is-hover`, `.is-focus`, `.is-disabled`, `.is-pending`… và thuộc tính `aria-*`: không cần rê chuột để thấy.

## 2. Thứ tự làm

1. Variables và styles từ `docs/tokens.json` (§3–§5). Xong bước này mới vẽ.
2. Component từ màn DS, theo từng section `h-*` với đủ variant, state, size (§6).
3. Pattern: khối ghép từ nhiều component (§7).
4. Trang ở 4 khổ 360 / 768 / 1280 / 1920 (§8), chỉ dùng instance của component và pattern.
5. Nghiệm thu theo checklist §10.

Không vẽ trang trước khi có component; không tách (detach) instance trong trang.

## 3. Token → Figma variable

Tên variable = tên biến CSS bỏ `--`, đổi dấu `-` phân nhóm thành `/`. Ví dụ `--color-background-dark-foreground` → `color/background-dark-foreground`; `--space-xl` → `space/xl`. Ba collection theo ba tầng của kit: `Primitives` → `Semantic` → `Component`. Variable tầng sau là alias của tầng trước, không gõ lại số.

### 3.1 Collection `Primitives` (1 mode)

Màu (kiểu Color). Giữ nguyên giá trị, đây là bảng màu thương hiệu.

| Variable | Giá trị | Biến CSS |
| --- | --- | --- |
| `color/background` | #FFFFFF | `--color-background` |
| `color/foreground` | #1A1A1A | `--color-foreground` |
| `color/muted` | #4D4D4D | `--color-muted` |
| `color/muted-light` | #6B6B6B | `--color-muted-light` |
| `color/border` | #E5E5E5 | `--color-border` |
| `color/background-alt` · `color/background-alt-foreground` | #F4F4F5 · #1A1A1A | `--color-background-alt(-foreground)` |
| `color/background-cream` · `color/background-cream-foreground` | #F5F5F1 · #1A1A1A | `--color-background-cream(-foreground)` |
| `color/background-sand` · `color/background-sand-foreground` | #EBE6E0 · #1A1A1A | `--color-background-sand(-foreground)` |
| `color/background-dark` · `color/background-dark-foreground` | #1A1A1A · #FFFFFF | `--color-background-dark(-foreground)` |
| `color/background-panel` | #393942 | `--color-background-panel` |
| `color/muted-on-dark` | #999999 | `--color-muted-on-dark` |
| `color/accent` · `color/accent-foreground` | #C8400E · #FFFFFF | `--color-accent(-foreground)` |
| `color/sale` · `color/sale-foreground` | #BD1616 · #FFFFFF | `--color-sale(-foreground)` |
| `color/badge-new` · `color/badge-new-foreground` | #4B824D · #FFFFFF | `--color-badge-new(-foreground)` |
| `color/rating` | #FFC107 | `--color-rating` |

Khoảng cách (kiểu Number, px). Chỉ dùng cho padding, gap (auto layout), margin.

| Variable | Giá trị | Variable | Giá trị |
| --- | --- | --- | --- |
| `space/050` | 2 | `space/xl` | 24 |
| `space/2xs` | 4 | `space/2xl` | 32 |
| `space/150` | 6 | `space/3xl` | 40 |
| `space/xs` | 8 | `space/4xl` | 48 |
| `space/sm` | 12 | `space/5xl` | 64 |
| `space/md` | 16 | `space/6xl` | 80 |
| `space/lg` | 20 | `space/7xl` | 128 |

Không tạo variable cho `--space-1…8` (alias của code theme). 2 và 6 là bậc nửa bước, chỉ cho gap icon.

Bo góc (Number): `radius/xs` 4 · `radius/sm` 8 · `radius/md` 12 · `radius/lg` 16 · `radius/xl` 20 · `radius/pill` 999.

Icon (Number): `icon/size-sm` 16 · `icon/size-md` 20 · `icon/size-lg` 24 · `icon/stroke-width` 1.5.

Cỡ chữ và họ chữ (Number, String), mode xem §3.4: `font/family-heading` "Sofia Sans Condensed" · `font/family-primary` "Inter" · `font/size-xs` 13 · `font/size-sm` 14 · `font/size-base` 16 · `font/size-lg` 18 · `font/size-h4` 20 · `font/size-h3` 28.

Thời lượng (Number, ms; để ghi chú prototype): `motion/fast` 150 · `motion/base` 250 · `motion/accordion` 350 · `motion/enter` 400 · `motion/slow` 500 · `motion/reveal` 900 · `motion/stagger` 60 · `motion/hero` 1400.

### 3.2 Collection `Semantic` (alias về `Primitives`)

| Variable | Kiểu | Trỏ về / giá trị | Biến CSS |
| --- | --- | --- | --- |
| `color/success` · `color/success-foreground` | Color | `color/badge-new` · `color/badge-new-foreground` | `--color-success(-foreground)` |
| `color/critical` · `color/critical-foreground` | Color | `color/sale` · `color/sale-foreground` | `--color-critical(-foreground)` |
| `color/warning` · `color/warning-foreground` | Color | `color/accent` · `color/accent-foreground` | `--color-warning(-foreground)` |
| `color/accent-on-sand` | Color | #B73C0F (accent 90% + foreground) | `--color-accent-on-sand` |
| `color/panel-muted` | Color | #C4C4C6 (trắng 70% trên panel) | `--panel-muted` |
| `color/panel-saving` | Color | #A5C0A6 (badge-new 50% + trắng) | `--panel-saving` |
| `color/overlay-scrim` | Color | #1A1A1A 50% | `--overlay-scrim` |
| `color/header-link` | Color | #A3A3A3 (trắng 60% trên nền tối, 6.9:1) | màu `.site-header__link` (color-mix trong kit, không có biến riêng) |
| `radius/input` · `radius/button` | Number | `radius/xs` | `--radius-input`, `--radius-button` |
| `radius/card` · `radius/hero` | Number | `radius/md` | `--radius-card`, `--radius-hero` |
| `radius/swatch` | Number | `radius/sm` | `--radius-swatch` |
| `radius/panel` | Number | `radius/lg` | `--radius-panel` |
| `radius/dialog` | Number | `radius/xl` | `--radius-dialog` |
| `size/touch-target` · `size/touch-target-min` | Number | 44 · 24 | `--touch-target`, `--touch-target-min` |
| `size/control-height-compact` | Number | 44 | `--control-height-compact` |
| `size/header-height` | Number | 80 | `--header-height` |
| `size/page-margin` | Number | `space/lg` (20) | `--page-margin` |
| `size/content-max` | Number | 1416 | `--page-width` 91rem − 2 × 20 |

Figma variable không chứa được phép `color-mix()`: ba màu dẫn xuất và scrim nhập giá trị đã tính như bảng; khi màu gốc đổi phải tính lại (ghi chú trong mô tả variable).

### 3.3 Collection `Scheme` (6 mode: Light, Alt, Cream, Sand, Dark, Panel)

Sáu nền của theme dùng chung một bộ role (foundation.md §2.2, màn `h-dark`). Đặt mode trên frame section để chữ, viền, focus đổi theo nền.

| Variable | Light | Alt | Cream | Sand | Dark | Panel |
| --- | --- | --- | --- | --- | --- | --- |
| `scheme/background` | background | background-alt | background-cream | background-sand | background-dark | background-panel |
| `scheme/text` | foreground | background-alt-foreground | background-cream-foreground | background-sand-foreground | background-dark-foreground | background-dark-foreground |
| `scheme/text-subdued` | muted | muted | muted | muted | muted-on-dark | panel-muted |
| `scheme/text-tertiary` | muted-light | muted-light | muted-light | (không dùng: lấy muted) | muted-on-dark | panel-muted |
| `scheme/border` | border | border | border | border | trắng 12% | muted |
| `scheme/field-border` | muted-light | muted-light | muted-light | muted-light (4.30, đủ 3:1 cho viền) | muted-on-dark | theo mockup `h-panel` |
| `scheme/focus` | accent | accent | accent | accent | background-dark-foreground | background-dark-foreground |
| `scheme/eyebrow` | accent | accent | accent | accent-on-sand | muted-on-dark | muted-on-dark |

Nền Dark có thêm lớp nhiễu `assets/noise-dark.png` (fill ảnh, tile) phủ trên màu nền: header, footer, section tối.

### 3.4 Collection `Breakpoint` (3 mode: Mobile 360, Tablet 768, Desktop 1280)

Giá trị đổi theo khổ. Khổ 1920 dùng mode Desktop; chỉ khung ngoài rộng hơn.

| Variable | Kiểu | Mobile 360 | Tablet 768 | Desktop 1280 | Biến CSS |
| --- | --- | --- | --- | --- | --- |
| `layout/grid-columns` | Number | 4 | 8 | 12 | `--grid-columns` |
| `layout/grid-gap` | Number | 12 | 16 | 24 | `--grid-gap` |
| `layout/section-gap` | Number | 48 | 48 | 128 | `--section-gap` (đổi ở 1024) |
| `layout/heading-gap` | Number | 24 | 24 | 40 | `--heading-gap` |
| `layout/band-inset` | Number | 0 | 0 | 0 (64 ở 1920) | `--band-inset` |
| `size/control-height` | Number | 48 | 48 | 48 | `--control-height` (48 mọi mốc, CTO 21/11 lượt 2) |
| `size/tab-height` | Number | 44 | 44 | 40 | `--control-height-compact` → `--tab-height-desktop` |
| `font/size-display` | Number | 52 | 73 | 100 | `--font-size-display` |
| `font/size-h1` | Number | 40 | 44 | 48 | `--font-size-h1` |
| `font/size-h2` | Number | 32 | 34 | 36 | `--font-size-h2` |
| `font/size-eyebrow` | Number | 14 | 15 | 16 | `--font-size-eyebrow` |
| `font/line-display` | Number | 60 | 73 | 100 | `--line-height-display` × cỡ |
| `font/line-h1` | Number | 48 | 52 | 56 | `--line-height-h1` × cỡ |
| `font/line-h2` | Number | 40 | 42 | 44 | `--line-height-h2` × cỡ |
| `font/size-wordmark` | Number | 64 | 80 | 133 (200 ở 1920) | `--font-size-wordmark` |

- `layout/band-inset` và wordmark ở 1920: tạo thêm mode thứ tư "Wide 1920" nếu gói Figma cho 4 mode; nếu không thì ghi đè tại khung 1920.
- Cỡ ở 768 là giá trị nội suy của `clamp()`, làm tròn px. Hai đầu 360 và 1280 là số chuẩn; lấy số 768 thật bằng DevTools nếu cần chính xác hơn 1px.

### 3.5 Collection `Component` (1 mode)

| Variable | Giá trị | Biến CSS | Component |
| --- | --- | --- | --- |
| `tab/padding-inline` | `space/xl` (24) | `--tab-padding-inline` | Tab |
| `tab/height-desktop` | 40 | `--tab-height-desktop` | Tab, Chip từ 1280 |
| `row/height` | 52 | `--row-height` | Hàng drawer menu, footer accordion, facet summary |
| `round-button/size` | 52 | `--round-button-size` | Nút tròn carousel, phân trang |
| `count-badge/size` | 20 | `--count-badge-size` | Số đếm giỏ ở header |
| `progress/height` | 4 | `--progress-height` | Thanh tiến trình carousel |
| `meter/height` | 8 | `--meter-height` | Meter freeship, mục tiêu |
| `thumb/bar` · `thumb/default` · `thumb/search` · `thumb/cart` | 48 · 56 · 64 · 80 | `--thumb-size` (cục bộ) | Thumbnail |

Kích thước (rộng, cao) không gắn variable `space/*`: dùng `size/*` hoặc variable của component.

### 3.6 Token chỉ nằm trong style, và token không tạo variable

`:root` của kit có 150 biến: 106 thành variable (§3.1–§3.5), 22 chỉ nằm trong text style / effect style, 22 không tạo. Không tự đặt thêm variable cho hai nhóm dưới.

Chỉ nằm trong style (22):

| Biến CSS | Giá trị | Thể hiện trong Figma |
| --- | --- | --- |
| `--font-heading--weight` · `--font-heading--weight-display` | 700 · 800 | Text style §4: Bold cho `Heading/*`; ExtraBold cho `Display`, `Eyebrow`, `Wordmark` |
| `--font-body-weight` · `--font-primary--weight` | 500 · 400 | Text style §4: Medium cho `Body*`, `Price`; Regular cho `Form/*` |
| `--letter-spacing-body` · `-label` · `-heading` · `-display` · `-caps` | −0.01em · −0.02em · −0.02em · −0.03em · 0.04em | Cột "Giãn chữ" của text style §4 (−1% · −2% · −2% · −3% · +4%) |
| `--line-height-body` · `-sm` · `-label` · `-title` · `-reading` · `-price-lg` · `-eyebrow` · `-h4` · `-h3` | 1.5 · 1.4286 · 1.5385 · 1.5556 · 1.75 · 1.4 · 1.25rem (dòng cố định 20) · 1.2 · 1.2857 | Cột "Cỡ / dòng" của text style §4, nhập px (24 · 20 · 20 · 28 · 28 · 28 · 20 · 24 · 36). Ba bậc đổi theo khổ (display, h1, h2) là variable `font/line-*` ở §3.4 |
| `--shadow-none` · `--shadow-raised` · `--shadow-overlay` · `--shadow-bar` | xem §5 | Effect style §5 |

Không tạo (22):

| Biến CSS | Giá trị | Lý do | Thể hiện trong Figma |
| --- | --- | --- | --- |
| `--space-1…8` (8 biến) | alias của `--space-2xs…7xl` | Alias cho code theme | Dùng `space/*` |
| `--layer-content` · `-sticky` · `-bottom-bar` · `-header` · `-floating` · `-scrim` · `-overlay` · `-toast` | 1 · 4 · 5 · 10 · 15 · 20 · 21 · 30 | Figma không có z-index | Thứ tự layer trong khung theo đúng thứ tự này (toast trên cùng); ghi chú ở trang tài liệu "Layers" (`docs/ui-spec/layers.md`) |
| `--ease-out` · `--ease-in-out` · `--ease-expo` | cubic-bezier(0.22, 1, 0.36, 1) · (0.65, 0, 0.35, 1) · (0.16, 1, 0.3, 1) | Figma variable không chứa đường cong | Ghi chú prototype cạnh `motion/*` (màn `h-motion`); nhập Custom bezier khi dựng prototype |
| `--content-width` · `--band-side` | công thức `min()` / `calc()` | Giá trị tính theo khung | Đã thay bằng `size/content-max` (1416) và `layout/band-inset`; lề còn lại do layout grid §5 |
| `--dark-texture` | ảnh `assets/noise-dark.png` | Không phải số hay màu | Fill ảnh (tile) của mode Dark, §3.3 |

## 4. Text styles

Tên style = tên kiểu. Dòng ghi px (Figma không nhận line-height không đơn vị theo token; nhập px ở hai đầu, gắn variable `font/line-*` cho display, h1, h2).

| Style | Font | Cỡ / dòng 360 | Cỡ / dòng 1280 | Giãn chữ | Viết hoa | Class kit |
| --- | --- | --- | --- | --- | --- | --- |
| `Display` | Sofia Sans Condensed ExtraBold 800 | 52 / 60 | 100 / 100 | −3% (−4% từ 768) | UPPER | `.display` |
| `Heading/H1` | Sofia Sans Condensed Bold 700 | 40 / 48 | 48 / 56 | −2% | theo chuỗi | `h1`, `.h1` |
| `Heading/H2` | Sofia Sans Condensed Bold 700 | 32 / 40 | 36 / 44 | −2% | theo chuỗi | `.h2` |
| `Heading/H3` | Sofia Sans Condensed Bold 700 | 28 / 36 | 28 / 36 | −2% | theo chuỗi | `.h3` |
| `Heading/H4` | Sofia Sans Condensed Bold 700 | 20 / 24 | 20 / 24 | −2% | theo chuỗi | `.h4` |
| `Eyebrow` | Sofia Sans Condensed ExtraBold 800 | 14 / 20 | 16 / 20 | +4% | UPPER | `.eyebrow` |
| `Title` | Inter Bold 700 | 18 / 28 | 18 / 28 | −1% | — | `.text-title` |
| `Body` | Inter Medium 500 | 16 / 24 | 16 / 24 | −1% | — | `body` |
| `Body/Reading` | Inter Medium 500 | 16 / 28 | 16 / 28 | −1% | — | `.rte`, mô tả footer |
| `Body/Small` | Inter Medium 500 | 14 / 20 | 14 / 20 | 0 | — | `.text-small` |
| `Form/Value` | Inter Regular 400 | 16 / 24 | 16 / 24 | −1% | — | giá trị trong `.field__input` |
| `Form/Hint` | Inter Regular 400 | 14 / 20 | 14 / 20 | 0 | — | gợi ý, lỗi trường |
| `Label` | Inter SemiBold 600 | 13 / 20 | 13 / 20 | −2% | — | `.text-label`, `.badge` |
| `Button` | Inter SemiBold 600 | 16 / 24 | 16 / 24 | −1% | sentence case | `.button` |
| `Button/Small` | Inter SemiBold 600 | 14 / 20 | 14 / 20 | −1% | sentence case | `.button--small` |
| `Group label` | Inter SemiBold 600 | 14 / 20 | 14 / 20 | +4% | UPPER | `.group-label` |
| `Price` | Inter Medium 500, tabular numbers | 16 / 24 | 16 / 24 | −1% | — | `.price` |
| `Price/Large` | Inter Bold 700, tabular numbers | 20 / 28 | 20 / 28 | −1% | — | `.price--lg` |
| `Price/XL` | Inter SemiBold 600, tabular numbers | 28 / 36 | 28 / 36 | −1% | — | `.price--xl` |
| `Wordmark` | Sofia Sans Condensed ExtraBold 800 | 64 / 0.9 | 133 (200 ở 1920) / 0.9 | −4% | UPPER | `.site-footer__wordmark` |

- Chữ HOA: gõ thường trong layer, bật Case = Upper trong style (giống CSS `text-transform`). Không gõ tay chữ HOA.
- Link CTA `.button--link` dùng `Heading/H3`. Tiêu đề popup marketing dùng kiểu display theo mockup marketing-popups.
- Nhãn nút gõ sentence case ("Add to cart"). Tiêu đề trang, section, dialog / drawer, empty state, tab, link menu cũng sentence case (CTO 21/11 lượt 2); tên sản phẩm, collection, bài viết theo dữ liệu. Chữ HOA (display, eyebrow, nhãn nhóm, tiêu đề popup marketing) đặt bằng thuộc tính Case = UPPER của text style, chữ gõ vẫn sentence case. Badge giảm giá gõ dấu trừ U+2212 ("−24%"). Chép đúng chuỗi trong mockup, không tự đổi.

## 5. Effect styles, lưới

| Style | Giá trị | Biến CSS | Dùng |
| --- | --- | --- | --- |
| `Shadow/Raised` | Drop shadow 0 8 24, #1A1A1A 12% | `--shadow-raised` | Dropdown, popover, toast, teaser; nút hover, card bài viết hover, header đã cuộn |
| `Shadow/Overlay` | 0 32 80, #1A1A1A 28% | `--shadow-overlay` | Drawer, dialog, bottom sheet |
| `Shadow/Bar` | 0 −4 24, #1A1A1A 10% | `--shadow-bar` | Thanh dính đáy |
| (không bóng) | — | `--shadow-none` | Card, panel, alert, bảng trong trang |

Layout grid style: `Grid/360` 4 cột, gutter 12, lề 20 · `Grid/768` 8 cột, gutter 16, lề 20 · `Grid/1280` 12 cột, gutter 24, lề 20 · `Grid/1920` 12 cột, gutter 24, lề 252 (nội dung 1416). Dải rộng ở 1920 (hero trang chủ, panel footer): lùi 64 mỗi bên, rộng 1792.

## 6. Component và ma trận variant / state

Mỗi dòng = một component set trong Figma, lấy từ section `h-*` của `foundation.html`. Property: `Variant` (kiểu), `Size`, `State`, và boolean cho phần tuỳ chọn. State lấy đúng những ô có nhãn trong màn DS. "Scheme" = có bản trên nền tối (đặt mode Dark / Panel của collection `Scheme`).

### 6.1 Nền tảng (trang tài liệu trong Figma, không phải component)

| Section | Trang Figma | Nội dung |
| --- | --- | --- |
| `h-grid` | Foundations / Grid | Lưới 4 khổ, vùng chạm 44 cho 6 nhóm |
| `h-type` | Foundations / Type | 12 kiểu + giá, bảng line-height từng bậc |
| `h-color` | Foundations / Color | 22 màu, 3 dẫn xuất, 6 alias trạng thái, tỉ lệ tương phản |
| `h-spacing-radius` | Foundations / Spacing, Radius | 14 bậc khoảng cách, 6 bậc bo, bo lồng nhau |
| `h-elevation-layers` | Foundations / Elevation | 4 bóng, 8 lớp |
| `h-motion` | Foundations / Motion | 8 thời lượng, 3 easing (ghi chú, không dựng) |
| `h-icon` | Foundations / Icons | 24 icon, khung 20, vùng an toàn 16, nét 1.5, 3 cỡ |
| `h-token-architecture` | Foundations / Tokens | 3 tầng, nguồn chuẩn |
| `h-rtl` | Foundations / RTL | Cái gì lật, cái gì giữ |
| `h-dark` | Foundations / Schemes | Ma trận 6 scheme × role |
| `h-content` | Foundations / Content | Bảng viết hoa, câu lỗi, thuật ngữ |

### 6.2 Component

| Section | Component (class kit) | Variant | Size | State | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| `h-button` | `Button` (`.button`) | Primary · Secondary · Tertiary · Link (`--link`) · On dark (`--on-dark`) | Default 48 · Small 44 · Full (`--full`) · Icon only (`--icon-only`) | Default · Hover · Focus · Active · Disabled · Loading (`aria-busy`) · Pending (`.is-pending`) | Boolean: Icon trước nhãn (`.button__icon`), Wrap (`--wrap`). Padding ngang 32 (small 16), bo 4 |
| `h-button` | `Round button` (`.round-button`) | Previous · Next | 52 | Default · Hover · Focus · Disabled; Scheme Light, Dark | Chevron 11 × 16 |
| `h-button` | `Close button` (`.close-button`) | — | 48 | Default · Hover · Focus | Icon close 20 |
| `h-tabs` | `Tab` (`.tab`) | — | 44 (360, 768) · 40 (1280) | Selected · Default · Hover · Focus · Disabled | Padding ngang 24, bo 4; `Tabs` = hàng cuộn ngang, gap 8 |
| `h-chip` | `Chip` (`.chip`) | Suggestion · Selectable · Removable (`--remove`) | 44 · 40 (1280) | Default · Hover · Focus · Selected (`aria-pressed`) · Disabled | Bo 4, 14 / 500; `Chip list` tự xuống dòng |
| `h-badge` | `Badge` (`.badge`) | Sale · New · Sold out · Tag (trung tính) · Neutral · Outline (nền tối) | 28 | — | Bo pill, padding 12, Label 13 / 20. Boolean Wrap. Rating badge ở `h-price-rating` |
| `h-product` | `Product card` (`.product-card`) | Default · Sale · Sold out · Không ảnh | Theo cột lưới | Default · Hover · Focus | Media 1 / 1 cream bo 12; badge, rating, tên, giá, swatch (≤ 4 hoặc 3 + "+N") |
| `h-media` | `Media` (`.media`) | Contain · Cover · Panel · Dark · Placeholder | Tỉ lệ 1/1, 2/1, 3/2, 4/3, 16/9, 9/16, 3/4 | Loaded · Loading (skeleton) · Missing | Property `Ratio` |
| `h-media` | `Thumbnail` (`.thumb`) | — | Bar 48 · Default 56 · Search 64 · Cart 80 | Có ảnh · Không ảnh | Vuông, cream, bo 8 |
| `h-collection-card` | `Collection card` (`.collection-card`) | Light · Dark · Menu | Ảnh 3 / 2 (Menu 4 / 3) | Default · Hover · Focus · Không ảnh | Bo 16 (Menu 12) |
| `h-collection-card` | `Category link` (`.category-link`) | — | Cao 56 | Default · Hover · Focus | Viền border bo 12, mũi tên 16 |
| `h-article` | `Article card` (`.article-card`) | Có ảnh · Không ảnh (`--no-image`) | 3 / 4 | Default · Hover · Focus | Bo 16, gradient tối nửa dưới, tag trung tính góc trên |
| `h-article` | `Card row` + `Carousel nav` + `Carousel progress` | — | — | Đầu hàng (Previous disabled) · Giữa · Cuối | Thanh 4, bo pill; Scheme Light, Dark |
| `h-form` | `Field` (`.field`, `.field__input`) | Text · Textarea · Select · Compact 44 | 48 · 44 | Default · Hover · Focus · Filled · Error (`aria-invalid`) · Disabled | Label trên, hint / lỗi dưới (icon 16) |
| `h-form` | `Choice` (`.choice`) | Checkbox · Radio | Ô 20, hàng 44 | Unchecked · Checked · Focus · Disabled | |
| `h-form` | `Form message` (`.form-message`) | Error · Warning · Success | — | Inline (`--inline`) · Summary (danh sách link) | |
| `h-input-group` | `Input group` (`.input-group`) | Search (có chữ, nút xoá) · Email attached · Password attached | 48 | Default · Focus · Error; Scheme Light, On dark | Dưới 768: nút chỉ icon hoặc xếp dọc (`--stack-mobile`) |
| `h-listbox` | `Listbox` (`.listbox`) | — | Hàng 44 | Default · Hover · Selected · Focus · Disabled | Bo 12, Shadow/Raised |
| `h-acc` | `Accordion` (`.accordion`) | Default · Facet (xem `h-facets`) | Hàng ≥ 56 | Closed · Open · Hover · Focus | Icon + / − 24 bên trái |
| `h-facets` | `Facet group` (`.facet`) | List · Swatch (`.facet-swatch`) · Price range | Hàng 52 | Closed · Open · "N selected"; swatch Selected · Disabled | |
| `h-selectable-option` | `Option card` (`.option-card`) | Row · Tile (`--tile`) | — | Default · Hover · Focus · Selected (`.is-selected`) · Disabled | Chọn = viền accent 2 + check tròn 24 |
| `h-variant-picker` | `Variant pill` (`.variant-pill`) | — | ≥ 56 × 44 | Default · Hover · Focus · Selected · Sold out · Unavailable | Bo pill |
| `h-variant-picker` | `Variant swatch` (`.variant-swatch`) | — | 44 × 44 | Default · Focus · Selected · Sold out · Unavailable | `Variant more` "+N"; khối Đang tải, Lỗi tải, Dòng tồn (`.stock-line` low / out) |
| `h-quantity` | `Quantity` (`.quantity`) | — | Default 48 · Compact 44 | Default · Focus · Min (− disabled) · Max (+ disabled) | Số bảng (tabular) |
| `h-price-rating` | `Price` (`.price`) | Regular · Sale + giá gạch · From | Default · Large · XL | — | |
| `h-price-rating` | `Rating` (`.rating`) | Sao + số · Badge trên card | — | — | Sao 14 × 13 |
| `h-data-table` | `Data table` (`.data-table`) | Default · Striped · Stack (dưới 768) · Has current | — | — | Bo 12; bảng rộng cuộn ngang trong khung |
| `h-progress` | `Meter` (`.meter`, `.meter-box`) | — | Thanh 8 | Đang chạy · Đạt (`--done`) | Hộp cream bo 16 |
| `h-sticky-bar` | `Buy bar` (`.buy-bar`) | PDP · Cart · Bundle | Cao 72 (360) · 80 (từ 768) | Default · Disabled (0 món) | Nền trắng, Shadow/Bar |
| `h-sticky-bar` | `Teaser` (`.teaser`) · `Popover card` (`.popover-card`) | — | — | Đóng · Mở | Bo 12, Shadow/Raised |
| `h-toast` | `Toast` (`.toast`) | Success · Info · Warning · Error | Cao tối thiểu 44 | Có nút đóng · Có action | Đệm dọc 12, 14 / 20 |
| `h-drawer` | `Drawer` (`.drawer`) | Start (menu, filter) · End (cart, search) · Wide 480 (1280) | — | Mở | Header 72, thân cuộn, chân dính; `Scrim` |
| `h-dialog` | `Dialog` (`.dialog`) | S · M · M wide 960 · L · Bottom sheet (dưới 768) | — | Mở | Bo 20; padding 32 (48 từ 1280); tiêu đề thường hoặc HOA (`--caps`, chỉ popup marketing) |
| `h-state` | `Empty state` (`.empty-state`) | In page · Framed · Compact | — | — | `Status icon` tròn 72 |
| `h-state` | `Skeleton` (`.skeleton`) · `Spinner` (`.spinner`) | Line · Media · Card · Spinner 20 / xs | — | — | Hiện sau 500 ms |
| `h-alert` | `Alert` (`.alert`) | Info · Success · Warning · Error | Section · Page (`--page`) | Có nút đóng · Có action | Error không đóng được |
| `h-rte` | `Rich text` (`.rte`) | — | Cột đọc 720 | — | h2–h6, đoạn 16 / 28, list, blockquote, bảng, ảnh |
| `h-pagination` | `Pagination` (`.pagination`) | Số trang · Previous / Next | Nút tròn 52 | Trang đầu · Giữa · Trang cuối · Current | |
| `h-countdown` | `Sale countdown` (`.sale-countdown`) | Regular · Compact | — | Đang đếm · Ended (`--ended`) | Số bảng |
| `h-panel` | `Dark panel` (`.dpanel`) | Default (đệm 24) · Large (đệm 32 / 40) | — | — | Scheme Panel; dòng tổng, dòng giảm giá + icon tag |
| `h-title` | `Breadcrumb` (`.breadcrumb`) · `Page title` (`.page-title`) | — | — | Dài (cắt "…" mục giữa ở 360) | |
| `h-banner` | `Page banner` (`.page-banner`) | Có ảnh · Không ảnh | Cao tối thiểu 360 từ 1024 | — | Bo 16, lớp tối gradient |

Nút và icon có thương hiệu (accelerated checkout Shop Pay / Apple Pay / G Pay / PayPal, Follow on Shop, Apple Wallet, icon thanh toán): vẽ đúng màu và hình của hãng như mockup, đặt trong trang `Brand assets`, không gắn variable của theme (CTO 11/11).

## 7. Pattern (ghép từ component)

| Pattern | Nguồn | Khổ khác nhau |
| --- | --- | --- |
| Header (`h-header`) | `foundation.html`, `ES1-T260/navigation.html` | 360 / 768: logo + icon + hamburger; 1280+: menu ngang (gap 40), dropdown, mega menu + scrim. Biến thể Scrolled (thêm bóng) |
| Announcement bar | `ES1-T289/announcement-bar.html` | Liền header, nền tối |
| Menu drawer, mega menu | `ES1-T260/navigation.html` | Drawer dưới 1280; mega từ 1280 |
| Footer | cuối mọi trang mockup, `foundation.md` §4 | 360 xếp dọc + accordion; 768 2 cột; 1280 3 cột; 1920 panel lùi 64 |
| Section header (eyebrow + tiêu đề + link / nút tròn) | `.section-header`, `--split` | Nút tròn ẩn dưới 768 |
| Hàng ngang + tiến trình | `h-article` | Vuốt ở 360; nút tròn từ 768 |
| Search overlay | `ES1-T261/predictive-search.html` | Popup dưới header |
| Mini cart, quick view | `ES1-T262/mini-cart-quickview.html` | Drawer End; quick view dialog M wide từ 1280, bottom sheet dưới 768 |
| Marketing popups (newsletter, before you leave, big offer) | `ES1-T263/marketing-popups.html` | Dialog; bottom sheet dưới 768 |
| Localization | `ES1-T289/localization.html` | Popover 2 cột từ 768; bottom sheet 2 tab dưới 768 |
| Pagination | `ES1-T287/pagination.html` | |
| Quiz result | `ES1-T285/quiz-result.html` | Dialog; bottom sheet dưới 768 |
| Shopify features (selling plan, pickup, volume pricing, quantity rules) | `ES1-T288/shopify-features.html` | |

### 7.1 Pattern riêng trang chủ (chưa nằm trong kit)

Sáu pattern dưới chỉ có ở trang chủ và CSS của chúng còn nằm trong file trang (lặp ở 2–3 file), chưa lên `kit.css` (còn mở, notes ES1-T567 mục 8). Để dựng một nguồn duy nhất: dựng component theo file ghi ở cột "Nguồn", khổ còn lại là variant của cùng component.

| Pattern | Class | Nguồn 1280 / 1920 | Nguồn 360 / 768 | Ghi chú |
| --- | --- | --- | --- | --- |
| Level card | `.level-card` | ES1-T293 `#container-home-intro` | ES1-T278 | Tỉ lệ 4/3 ở 360, 1/1 ở 768 (ES1-T278); trạng thái chép theo mockup |
| Shop the look: ảnh + hotspot + danh sách món | `.stl__*`, `.hotspot` | ES1-T293 `#container-home-shop-the-look` | ES1-T278 | Trạng thái hotspot và row chép theo mockup |
| Video card | `.vcard` | ES1-T293 `#container-home-video-carousel` | ES1-T279 | Tỉ lệ 9/16; trạng thái chép theo mockup |
| Testimonial card | `.tcard` | ES1-T293 `#container-home-testimonials` | ES1-T279 | Chép theo mockup |
| Bảng thông số featured product | `.specs` | ES1-T293 `#container-home-featured-product` | ES1-T279 | — |
| Ô số liệu FAQ | `.faq__stat` | ES1-T293 `#container-home-faq` | ES1-T279 | — |

## 8. Trang (4 khổ mỗi trang)

| Trang | File mockup | Spec |
| --- | --- | --- |
| Trang chủ 1280, 1920 | `ES1-T293/index.html` | `index-1280.md`, `index.md` |
| Trang chủ 768, 360 (header → inspiration banner) | `ES1-T278/index.html` | `index-mobile-a.md` |
| Trang chủ 768, 360 (bundle → footer) | `ES1-T279/index.html` | `index-mobile-b.md` |
| Sản phẩm | `ES1-T253/product.html` | `product.md`, `variant-picker.md`, `product-shopify-features.md` |
| Collection · List collections | `ES1-T254/collection.html` · `list-collections.html` | `collection.md`, `list-collections.md` |
| Cart | `ES1-T255/cart.html` | `cart.md` |
| Search | `ES1-T256/search.html` | `search.md` |
| Blog · Article | `ES1-T257/blog.html` · `article.html` | `blog.md`, `article.md` |
| Page (contact) · 404 · Password · Gift card | `ES1-T258/page.html` · `404.html` · `password.html` · `gift_card.html` | `page.md`, `404.md`, `password.md`, `gift-card.md` |

- Một trang Figma cho mỗi template; trong trang 4 frame đặt cạnh nhau, tên `<template> / 360`, `/ 768`, `/ 1280`, `/ 1920`. Trạng thái (giỏ trống, không kết quả, lỗi) là frame riêng cùng trang: `cart / 360 / empty`.
- Giữ đúng bố cục và thứ tự khối của mockup. Không đổi tên file, không đổi `id` section.
- Ảnh: tải đúng URL đang dùng trong mockup; không thay ảnh. Khung ảnh giữ tỉ lệ của bộ có tên (§6.2 Media).
- Bỏ qua `ES1-T252` và `ES1-T174` (bản so cũ, không thuộc bộ mockup).

## 9. Quy ước đặt tên

| Thứ | Quy ước | Ví dụ |
| --- | --- | --- |
| Variable | Tên biến CSS bỏ `--`, nhóm cách bằng `/` | `--radius-card` → `radius/card` |
| Component set | Tên block BEM của kit, viết hoa chữ đầu, tiếng Anh | `.product-card` → `Product card` |
| Property variant | Tên modifier BEM | `.button--secondary` → `Variant=Secondary`; `.button--small` → `Size=Small` |
| Property state | Giá trị cố định: Default, Hover, Focus, Active, Selected, Disabled, Loading, Error, Open | `.is-hover` → `State=Hover`; `aria-invalid` → `State=Error` |
| Layer trong component | Tên element BEM (phần sau `__`), chữ thường | `.product-card__media` → `media`; `.button__label` → `label` |
| Text style | Tên kiểu ở §4 | `Heading/H2` |
| Effect style | `Shadow/<bậc>` | `Shadow/Raised` |
| Trang | `<template> / <khổ> [/ <trạng thái>]` | `product / 1280`, `cart / 360 / empty` |
| Mô tả component | Dòng đầu ghi class kit và section nguồn | `.badge · foundation.html#h-badge` |

Không đặt tên theo giá trị (`Gray 500`, `Orange`), không dùng tên style hay tên biến của file cũ. Mỗi component ghi link tới section mockup trong phần Description để Dev tra ngược.

## 10. Checklist nghiệm thu "Figma khớp mockup"

Mockup thắng khi lệch. Người nghiệm thu: CTO (hoặc Designer agent chạy so ảnh).

Token
- [ ] Đủ 5 collection; số variable màu, khoảng cách, bo, cỡ khớp `docs/tokens.json` bản 2.0.0.
- [ ] Không có màu, số khoảng cách, bo góc gõ tay trong component (mọi fill, gap, padding, radius gắn variable).
- [ ] Không còn style / variable / tên layer nào của file cũ.

Component
- [ ] Mỗi section `h-*` ở §6.2 có component set tương ứng, đủ variant, size, state của bảng.
- [ ] Đặt cạnh ảnh chụp section ở 360 và 1280: cỡ, dòng, khoảng cách, bo, màu khớp, lệch tối đa 1px.
- [ ] Line-height mọi text style là bội 4 ở 360 và 1280 (trừ display từ 768 và wordmark).
- [ ] Vùng chạm 44 cho 6 nhóm: link menu chính, submit form, cart, hamburger, đóng modal / drawer, chọn variant.
- [ ] Disabled dùng cặp màu, không dùng opacity. Focus có vòng 2px (accent trên nền sáng, trắng trên nền tối).
- [ ] Tag bài viết trung tính; accent chỉ ở nút chính, eyebrow, phần nhấn heading, warning.
- [ ] Nhãn nút, heading, tiêu đề dialog / drawer, tab, link menu sentence case; chuỗi chép đúng mockup.
- [ ] Control (button, input, select, stepper) cao 48 ở cả 4 khổ; nút tròn và hàng danh sách 52.

Trang
- [ ] Mỗi template có đủ 4 frame 360 / 768 / 1280 / 1920; thứ tự khối và bố cục khớp mockup.
- [ ] Chồng frame lên ảnh chụp mockup cùng khổ (opacity 50%): khối không lệch quá 4px theo chiều dọc ở cuối trang, 1px trong từng khối.
- [ ] Lưới: 4 / 8 / 12 cột, gutter 12 / 16 / 24, lề 20; nội dung 1416 ở 1920; dải rộng 1792 ở 1920.
- [ ] Khoảng section 48 (360, 768) và 128 (1280, 1920).
- [ ] Tỉ lệ ảnh thuộc bộ có tên; ảnh sản phẩm contain trên cream, ảnh đời sống cover.
- [ ] Trang chỉ dùng instance, không detach; trạng thái rỗng / lỗi có frame riêng.

Khi phát hiện mockup có lỗi (không phải Figma lệch): không sửa trong Figma. Ghi vào ticket Designer; kit / mockup sửa trước, Figma chép sau.

## 11. Còn mở ảnh hưởng tới file Figma

CTO đã chốt 21/11 lượt 2 (`docs/design/decisions.md` mục "CTO 21/11 lượt 2 — ES1-T567"), mockup đã đổi theo:
- Heading, tiêu đề dialog / drawer, empty state, tab, link menu: sentence case.
- Control 48 ở mọi mốc (bỏ 52 từ 1280); padding section desktop 128; body weight 500 giữ (bản sắc thương hiệu).
- Chỉ báo tải hiện sau 500 ms; badge giảm giá "−24%" (U+2212); nút big offer "View offer".
- Số bản 2.0.0.

Còn mở (không chặn việc dựng lại): component riêng trang chủ chưa lên kit (§7.1); thang kích thước `--size-*` và token tỉ lệ ảnh chưa có trong kit (`drafts/designer/ES1-T567/notes.md` mục 8.3).
