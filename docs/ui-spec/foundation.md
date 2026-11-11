KHÔNG CHẮC: Figma chỉ có desktop 1920 và không có trạng thái, nên 360/768 và mọi trạng thái là ĐỀ XUẤT. Snapshot không có vector: chevron 52 lấy từ `snippets/slideshow-icon.liquid`, noise lấy từ `assets/noise-dark.png` (cả hai đã dựng theo Figma). PNG dài 12–16k px, chi tiết dưới 4px soát qua code. ES1-T291: 5 spec trỏ ở §23 (trừ countdown.md) do ticket khác tạo, chưa có trên nhánh này; mục trỏ theo tên file cố định trong ticket.

# UI spec: Foundation trang con (ES1-T251, vòng 3)

Mục đích: bộ thành phần chung cho mọi trang con và overlay (ES1-T252–T263), nhất quán với gốc duy nhất là Figma trang chủ 1:359. Story TE-9, TE-17.

Đầu ra:
- Spec này.
- `drafts/designer/_kit/kit.css`: CSS mockup. Mockup trang con nhúng `<link rel="stylesheet" href="../_kit/kit.css">`, chỉ viết thêm CSS riêng trang.
- `drafts/designer/ES1-T251/foundation.html` + `foundation-360|768|1280|1920.png`.

Thứ tự nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 > bộ kiến thức (file `NN`). Không dùng trang live hay ảnh chụp store làm gốc (ticket vòng 3).

Quy ước cho Dev FE: kit.css là mockup, không chép vào `assets/`. Theme vẫn theo AGENTS.md: logical properties, 0 màu literal, `var(--*)`, breakpoint `48rem / 64rem / 80rem`. Cột "Code hiện có" chỉ class đã có trong `assets/`.

## Thay đổi audit (ES1-T291, audit ES1-T283 A11, A13, A14, A23, A24, A28)

| # | Mục | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | §2 Panel tối | mỗi spec tự chọn màu chữ phụ / giảm giá trên `--color-background-panel`: cart, mini cart trắng 70% + badge-new 50%; bundle #B2B2B2 + badge-new 55%; shop the look trắng 60% + chữ trắng | 1 cặp dẫn xuất chung `--panel-muted` (trắng 70%, 6.56) và `--panel-saving` (badge-new 50% + trắng, 5.64), áp mọi panel tối | A13; sổ 10/11 G3 (cart.md §3) |
| 2 | §4 Footer | ghi chú "icon social #B2B2B2 → muted-on-dark (P4)"; mockup Information thiếu "Our Efitco" | icon social `--color-muted-on-dark` là quy định (kit đã đúng); Information: Our Story, Our Efitco, FAQs, Contact Us (+ 2 link chính sách) | A28; Figma 1:1104, index-mobile-b §8 |
| 3 | §6 Nút | Title Case chỉ nêu "Add To Cart" | mọi nút và link dạng nút Title Case, liệt kê nhãn lệch đang có ("Keep shopping", "Show fewer", "Try again") | A24; sổ 07/11 |
| 4 | §13 Accordion | "+ cam 24" | icon +/− cùng màu chữ câu hỏi (đóng `--color-muted`, mở `--color-foreground`), không cam | A11; Figma 1:1057, index-mobile-b §7 |
| 5 | §16 Dialog | "1 lần/phiên" | hàng đợi: mỗi lúc 1 popup, đóng popup đang hiện mới tới popup kế, nghỉ 3 s; mỗi popup tự mở tối đa 1 lần/phiên | A11; sổ 10/11 MK3, MK4 |
| 6 | §20 Lighthouse | "SEO 100 bắt buộc ở trang index" | SEO 100 đo ở 6 loại trang (chủ, collection, sản phẩm, blog, bài viết, page); BP 100 do DevOps/QA đo | A11; sổ 10/11 (BGĐ) |
| 7 | §22 | "Quyết định CTO cần chốt" 3 câu | "đã chốt (10/11)" theo đề xuất | sổ 10/11 "các câu khác vòng 3 chốt theo đề xuất" |
| 8 | §23 mới | — | mục lục thành phần dùng chung ở spec riêng: variant-picker, pagination, layers, countdown, announcement-bar, localization | ticket ES1-T291 |
| 9 | §24 mới | 2 setting "Popular searches" (header 5 cụm; search-results tối đa 6, chữ khác) | 1 theme setting chung, 1 bộ chữ mặc định, tối đa 5 cụm | A23; 05 §4 |
| 10 | Mockup | — | foundation.html: accordion theo Figma, "Our Efitco", mục 16 Sale Countdown, mục 17 Dark Panel; render lại 4 PNG | ticket ES1-T291 |

Giữ nguyên mọi mục khác của vòng 3.

## Thay đổi so với vòng 2

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header | 3 biến thể: A nền trắng viền dưới, B trong suốt đè ảnh, C đã cuộn | 1 biến thể mọi trang: thanh tối `--color-background-dark` + noise, cao 80, không đè ảnh; cuộn chỉ thêm bóng | Sổ 10/11, Figma 1:360, 1:362 |
| 2 | Logo header | 100 mobile, 140 desktop | 100 × 30 mọi mốc | Figma 1:377 |
| 3 | Menu header | chữ foreground, gap 56, gạch chân khi hover | trắng 60% (6.93:1), gap 40, hover/đang mở trắng 100%, trang hiện tại thêm gạch chân 2px | Figma 1:365 (opacity 0.6, itemSpacing 40) |
| 4 | Icon header | 3 icon 24 | search 20, account/cart 24, ô bấm 44 cách 4 (nhìn cách 24 như Figma); số giỏ trắng chữ tối | Figma 1:373 |
| 5 | Trang có ảnh lớn đầu trang | header đè ảnh | banner bo góc nằm dưới header, trong container, lớp tối ≥ 60% | Sổ 10/11; ĐỀ XUẤT §3.3 |
| 6 | Nút tròn 52 | icon mũi tên 20 × 16 | chevron 11 × 16 trong khung 52 (đúng icon slideshow) | Figma 1:398, `snippets/slideshow-icon` |
| 7 | Eyebrow nền tối | cam | xám `--color-muted-on-dark` (6.11:1); cam chỉ trên nền sáng, sand | Sổ 10/11 |
| 8 | `--color-background-dark` trong kit | #1E1E1E | #1A1A1A (mặc định `settings_schema`, = Figma 1:360, 1:1105); mọi tỉ lệ trên nền tối tính lại | `config/settings_schema.json` |
| 9 | Footer | panel trong container, bo 24, nền +4% trắng; 3 social; wordmark tách hàng | panel dải rộng (lùi tối đa 60, 1798 ở 1920), bo 16, nền +2% trắng; nền footer có noise; 4 social (TikTok, Instagram, YouTube, Facebook); tiêu đề menu Inter 700/18; link cách 16; wordmark nằm giữa hàng cuối cùng copyright và localization | Figma 1:1104–1:1192 |
| 10 | Viền input | ĐỀ XUẤT | đã chốt: nền sáng `--color-muted-light`, nền tối 100% `--color-muted-on-dark` | Sổ 09/11 |
| 11 | Toast | ĐỀ XUẤT màu | đã chốt: warning accent, success badge-new | Sổ 09/11 |
| 12 | Card sản phẩm | swatch cách 12, radio bấm được | swatch 32 × 16 cách 4, cách giá 8; là chỉ báo (`aria-hidden`), số màu đọc trong tên link | Figma 1:502; ĐỀ XUẤT §9 |
| 13 | Dropdown, mega menu | mở từ 64rem, header chuyển trắng khi mở | chỉ từ 80rem (menu ngang chỉ có từ 80rem); header vẫn tối, panel trắng ngay dưới | Sổ 10/11, `critical.css` |
| 14 | Mốc 1920 | có số | thêm cột dải rộng, footer, header theo Figma | Ticket vòng 3 |

---

## 1. Lưới, khoảng cách, chữ theo mốc

Mobile-first. Mốc 360 / 768 / 1280 / 1920 ứng với code `< 48rem`, `48rem`, `80rem`, `80rem` (+ page-width chặn 1456). `64rem` (1024) đổi khoảng cách section và bố cục footer.

| Giá trị | 360 | 768 | 1280 | 1920 | Token / cách tính | Nguồn |
| --- | --- | --- | --- | --- | --- | --- |
| Lề trang | 20 | 20 | 20 | 252 (do page-width) | `--page-margin` | DESIGN |
| Bề rộng nội dung | 320 | 728 | 1240 | 1416 | `min(--page-width − 2×margin, 100% − 2×margin)` | Figma x 252–1668 |
| Dải rộng (panel footer) | 360 (tràn) | 768 (tràn) | 1280 (tràn) | 1798 (lùi 60) | `--band-inset = clamp(0, side − 64, 60)` | Figma 1:1106, 1:361; base.css `.site-footer__main` |
| Cột / gutter | 4 / 16 | 8 / 16 | 12 / 24 | 12 / 24 | `--space-4` → `--space-5` từ 80rem | 03 §1 |
| Lưới sản phẩm | 2 × 152 | 3 × 232 | 4 × 292 | 4 × 336 | gap ngang = gutter, gap dọc 24 → 40 | Figma 1:490 |
| Card bài viết (hàng ngang) | 252 × 336 | 307 × 410 | 336 × 448 | 336 × 448 | `min(70vw, 336px)` / `min(40vw, 336px)`, 3/4 | Figma 1:1022 |
| Khoảng giữa section | 48 | 48 | 120 | 120 | `--space-7` < 64rem, `--space-8` | DESIGN |
| Tiêu đề section → nội dung | 24 | 24 | 40 | 40 | `--space-5`; `--space-1 × 10` từ 80rem | Figma 1:490 |
| Eyebrow → tiêu đề | 12 | 12 | 12 | 12 | `--space-3` | Figma 1:490 |
| Header | 80 | 80 | 80 | 80 | `--header-height` | Figma 1:362 |
| Control (nút, input) | 48 | 48 | 52 | 52 | `--space-1 × 12` / `× 13` | 14 §2; Figma 1:1104 |
| Vùng chạm tối thiểu | 44 | 44 | ≥ 24 (icon, nav 44) | ≥ 24 (icon, nav 44) | Sổ 09/11: ≥ 24, mobile ≥ 44 | AGENTS, 14 §2 |
| display | 48 | 70 | 100 | 100 | `--font-size-display` | clamp tại mốc |
| h1 | 33 | 43 | 48 | 48 | `--font-size-h1`, lh 58/48 | Figma 1:495 |
| h2 | 28 | 32 | 36 | 36 | `--font-size-h2` | |
| h3 | 22 | 24 | 27 | 28 | `--font-size-h3` | |
| Body / nhỏ / badge | 16 / 14 / 13 | như 360 | như 360 | như 360 | `--font-size-base / sm / xs` | 03 §4 |

Quy tắc: thứ tự nội dung giữ nguyên giữa mốc (06 §2); đoạn dài `max-inline-size: 65ch` (06 §7.3); zoom 200% không tràn ngang, hàng cuộn ngang có `overflow-x` riêng (14 #1096M).

## 2. Token dùng

Chỉ token trong `snippets/css-variables.liquid`, không thêm token.

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt(-foreground)`, `--color-background-cream(-foreground)`, `--color-background-sand(-foreground)`, `--color-background-dark(-foreground)`, `--color-background-panel`, `--color-muted-on-dark`, `--color-accent(-foreground)`, `--color-accent-on-sand`, `--color-sale(-foreground)`, `--color-badge-new(-foreground)`, `--color-rating`.
Chữ: `--font-heading--family/weight/weight-display`, `--font-primary--family`, `--font-size-xs..wordmark`, `--line-height-body/heading`.
Khoảng cách: `--space-1..8`, `--touch-target-min`, `--page-width`, `--page-margin`, `--header-height`. Bo góc: `--radius-input/button/card/hero/pill`. Motion: `--motion-fast/base/slow/accordion/reveal`, `--ease-out/in-out/expo`.
Asset: `assets/noise-dark.png` (đang dùng ở base.css cho header trang chủ và footer) là lớp noise của mọi nền tối.

Không dùng `--figma-*` cho thành phần mới. Tương đương: `--figma-1a1a1a` = `--color-background-dark` (mặc định #1A1A1A), `--figma-e5e5e5` = `--color-border`, `--figma-white-60` = `color-mix(--color-background-dark-foreground 60%, --color-background-dark)`.

Giá trị dẫn xuất (không phải token, viết `calc()` hoặc custom property cục bộ):

| Tên trong kit | Giá trị | Dùng cho |
| --- | --- | --- |
| `--section-gap` | `--space-7` → `--space-8` từ 64rem | padding-block section |
| `--heading-gap` | `--space-5` → `--space-1 × 10` từ 80rem | header section → nội dung |
| `--grid-gap` | `--space-4` → `--space-5` từ 80rem | gutter |
| `--control-height` | `--space-1 × 12` → `× 13` từ 80rem | nút, input, select |
| `--band-side`, `--band-inset` | `(100% − content) / 2`; `max(0, min(60, side − 64))` | panel footer, dải rộng |
| `--dark-texture` | `url(noise-dark.png)` | header, footer, section tối |
| `--overlay-scrim` | `color-mix(--color-background-dark 50%, transparent)` | drawer, dialog, mega |
| `--shadow-raised` | `0 8 24 color-mix(--color-foreground 12%)` | dropdown, toast |
| `--shadow-overlay` | `0 32 80 color-mix(--color-foreground 28%)` | drawer, dialog |
| `--radius-dialog` | `--radius-card × 2` = 24 | dialog, sheet |
| `--panel-muted` | `color-mix(in srgb, var(--color-background-dark-foreground) 70%, var(--color-background-panel))` ≈ #C4C4C6 | chữ phụ trên panel tối: dòng hàng, Subtotal, ghi chú thuế, đếm món, ghi chú quiz |
| `--panel-saving` | `color-mix(in srgb, var(--color-badge-new) 50%, var(--color-background-dark-foreground))` ≈ #A3BDA4 | dòng giảm giá trên panel tối, luôn kèm icon tag 16 + dấu "−" |

Panel tối (G3, sổ 10/11): mọi khối nền `--color-background-panel` (tóm tắt cart, chân mini cart, "Your Bundle", panel shop the look, quiz) dùng đúng cặp trên. Chữ chính và tổng: `--color-background-dark-foreground` (11.4). Không dùng #999 / `--color-muted-on-dark` (4.01), #B2B2B2, trắng 60%, xanh Figma #4B824D (2.50) hay chữ trắng cho dòng giảm giá. Focus trên panel: outline trắng. Thay đổi chữ phụ trắng 60% → 70% và #B2B2B2 → 70% là lệch Figma có chủ đích (nhất quán, AA); spec bundle, shop the look, quiz trỏ về đây.

Bảng tương phản (WCAG, L tính tay; dark = #1A1A1A, L 0.0103):

| Cặp | Tỉ lệ | Dùng cho |
| --- | --- | --- |
| foreground / background | 17.4 | mọi chữ |
| foreground / background-alt | 15.8 | tab chưa chọn |
| foreground / cream | 15.9 | card sản phẩm |
| muted / background | 8.45 | chữ phụ, breadcrumb, giá gạch |
| muted / sand | 6.81 | chữ phụ trên sand |
| muted-light / background | 5.33 | placeholder, viền input |
| accent-foreground / accent | 5.01 | nút primary, tag |
| accent / background | 5.01 | eyebrow, focus ring |
| accent / background-alt | 4.55 | eyebrow trên alt |
| accent-on-sand / sand | ~4.8 | eyebrow trên sand |
| sale-foreground / sale | 6.38 | badge sale; giá sale, lỗi trên nền sáng |
| badge-new-foreground / badge-new | 4.57 | badge New, toast success |
| background-dark-foreground / dark | 17.4 | chữ header, footer |
| menu trắng 60% (#A3A3A3) / dark | 6.93 | menu header (Figma) |
| muted-on-dark / dark | 6.11 | eyebrow tối, link footer, placeholder, viền input tối |
| muted-on-dark / panel footer (#1F1F1F) | 5.78 | link, trust trong panel |
| background-dark-foreground / panel | 11.4 | chữ chính, tổng trên mọi panel tối |
| `--panel-muted` (L 0.553) / panel (#393942, L 0.042) | 6.56 | chữ phụ panel tối |
| `--panel-saving` (L 0.469) / panel | 5.64 | giảm giá panel tối (badge-new mặc định #467A48; spec cũ ghi 5.81–5.84 vì tính với xanh Figma #4B824D) |
| muted / border (nút disabled) | 6.70 | chữ nút disabled |
| accent / dark | 3.48 | chỉ chữ lớn ("Get 15% Off"), focus không dùng |
| sale / dark | 2.73 | KHÔNG dùng cho chữ; lỗi trên nền tối dùng chữ trắng + icon đỏ |
| border / background | 1.26 | chỉ trang trí |

## 3. Header mọi trang

Nguồn: sổ 10/11 (header trang chủ và trang con là thanh tối riêng, không đè ảnh), Figma 1:362 trên nền 1:360. Code: `blocks/header.liquid`, `.site-header*` (`critical.css`), nền tối hiện chỉ áp cho trang có `.slideshow` (base.css dòng 7452–7458): ticket trang bỏ điều kiện đó.

### 3.1 Anatomy và kích thước

Nút menu (< 80rem) · logo (link về trang chủ) · menu chính 7 mục (Shop ▾, Collection ▾, Sale, Our Story, Blog, Contact, Help) · search · account · cart + số lượng.

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Nền | `--color-background-dark` + noise, cao 80, không viền | như 360 | như 360 | như 360 |
| Trái | menu 44 (lùi −12) + logo 100 × 30 | như 360 | logo 100 × 30 | logo tại x 252 |
| Giữa | — | — | 7 mục, gap 40, Inter 16/500, ls −0.04em, chevron 9 × 5 cách 4 | như 1280 |
| Phải | search 20, account 24, cart 24, ô 44 liền nhau | như 360 | ô 44 cách 4 (nhìn icon cách 24) | như 1280 |
| Số giỏ | pill 18, nền trắng, chữ dark 13/700, góc trên phải icon | | | |

### 3.2 Trạng thái

- Link menu: mặc định trắng 60% (6.93:1); hover, `aria-expanded="true"` trắng 100%, chevron xoay 180°; trang hiện tại (`aria-current="page"`) trắng 100% + gạch chân 2px offset 0.45em (ĐỀ XUẤT, 04 §3.9: mục đang chọn phải rõ, không chỉ bằng màu).
- Icon: hover scale 1.08 (base.css). Số giỏ nhảy khi thêm hàng (`[data-bump]`).
- Focus: outline 2px `--color-background-dark-foreground` offset 2 (accent trên dark 3.48, kém rõ).
- Đã cuộn (`[data-scrolled]`): giữ nguyên nền, thêm bóng `0 1 8 color-mix(foreground 24%)`. Không đổi chiều cao (0 CLS).
- Dropdown / mega mở: header giữ tối; panel trắng ngay dưới đáy header (§14).

### 3.3 Trang có ảnh lớn đầu trang (collection có banner, article có ảnh bìa)

ĐỀ XUẤT (sổ 10/11 cấm đè ảnh; hình thức theo hero 1:361 là thẻ bo góc dưới header):
- `.page-banner`: thẻ trong container, cách header 16 (24 từ 64rem), bo 16 (`--radius-card + --space-1`), cao tối thiểu 280 / 360 từ 64rem, ảnh `cover`.
- Lớp tối gradient 75% đáy → 60% từ giữa lên: điểm sáng nhất vẫn ≥ 60%, chữ trắng trên ảnh trắng = 4.56:1 (L nền 0.180). Khác hero (30% theo sổ 10/11) vì banner trang con là ảnh merchant tự chọn, không duyệt từng ảnh; xem câu CTO 1.
- Nội dung đáy trái, padding 32 / 24 (48 từ 64rem): breadcrumb trắng, eyebrow trắng (xám #999 trên ảnh chỉ ~2.3:1), h1 trắng.
- Ảnh banner là LCP: eager + `fetchpriority="high"`, width/height, srcset.

### 3.4 A11y, Lighthouse

`<header>` + `<nav aria-label="Main">`; icon có `aria-label` ("Cart, 2 items": số nằm trong tên, badge `aria-hidden`); vùng chạm 44; skip link trước header; logo `<a>` có tên. Header ở critical.css (≤ 10 KB): noise là `background-image` 1 file nhỏ đã có, không chặn LCP. Sticky bằng CSS, 0 CLS.

Câu hỏi mở vòng 2 (header trang con tối hay trắng): đã chốt 10/11, tối. Đề xuất nền trắng của vòng 2 bị huỷ.

## 4. Footer

Figma 1:1104, giống hệt trên mọi trang có `layout/theme.liquid` (password, gift card không có). Code: `blocks/footer.liquid`, `.site-footer*`.

Anatomy (3 tầng trên nền `--color-background-dark` + noise, 1:1105):
1. Newsletter (container): ảnh 98 × 123 bo 8 có 2 thẻ 78 × 99 phía sau (1:1188) · tiêu đề h2 Sofia 800 uppercase, "Get 15% Off" cam (chữ lớn 3.48 ≥ 3, sổ 09/11) · mô tả muted-on-dark · form: input + nút "Get 15% Off" có icon gửi · ghi chú "No spam. Unsubscribe anytime."
2. Panel dải rộng (1:1106): nền `color-mix(white 2%)` (Figma #333 20% trên #1A1A1A = #1F1F1F), bo 16, padding trên 48 → 120 từ 80rem, dưới 24. Trong panel: logo 86 × 26 · mô tả (16/27, max 456) · 4 social 28 (ô 44) · 2 cột menu Shop, Information (tiêu đề Inter 700 18/27, tiêu đề → link 32, link cách 16) · trust bar 4 mục (icon 32 + chữ 14/500), gạch trên 1px trắng 12%.
3. Hàng cuối: copyright 14/500 trái · wordmark "EFITCO" Sofia 800 `--font-size-wordmark` (200 ở 1920) lh 0.9 ls −0.04em giữa · localization (cờ tròn 26 + "USD / EN" + chevron) và 5 icon thanh toán phải; copyright và phải căn đáy theo wordmark.

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Newsletter | xếp dọc: ảnh, chữ, form; nút full width | ảnh + chữ 2 cột, form dưới full | 3 cột ảnh · chữ · form (≤ 496), input liền nút | như 1280, x form 1170 |
| Panel | tràn mép, padding ngang 20 | tràn mép, padding 20 | tràn mép, nội dung thẳng container | lùi 60, bo 16, nội dung thẳng x 252 |
| Menu | `<details>` accordion, hàng 52, link 44 | 2 cột mở sẵn, link 26 cách 16 | brand trái, 2 cột 216 phải gap 24 | như 1280 |
| Trust | 2 × 2 | 4 cột | 4 cột | 4 cột |
| Hàng cuối | wordmark 64 trên, rồi locale + thanh toán, rồi copyright (giữa) | wordmark 80 | 3 cột, wordmark 133 | wordmark 200 |

Trạng thái và form:
- Link menu, social: muted-on-dark → hover trắng (Figma: "Portable Fitness" trắng là hover). Focus outline trắng.
- Input: viền 100% `--color-muted-on-dark` (6.11, sổ 09/11), hover viền trắng, focus outline trắng 2px.
- Lỗi: viền đỏ 2px, câu lỗi CHỮ TRẮNG + icon đỏ (sale trên dark 2.73:1 trượt AA). Code `.site-footer__invalid` đang tô chữ `--color-sale`: cần sửa.
- Thành công: hộp `form-message--success` trên nền tối (chữ trắng, thanh badge-new).
- Menu Information theo Figma 1:1104: Our Story, Our Efitco, FAQs, Contact Us. ĐỀ XUẤT: thêm "Shipping policy", "Refund policy" cuối danh sách, URL `shop.policies` (14 #252D; TE-9 AC5). Figma không có. Là dữ liệu menu, không đổi giao diện.
- Icon social: `--color-muted-on-dark` (6.11), hover trắng. Figma #B2B2B2 không có token, không dùng (kit.css `.site-footer__social a` đã đúng).

A11y: menu tiêu đề không dùng `<h*>` ở desktop nếu làm lệch heading-order (dùng `<p>`/`summary`); wordmark `aria-hidden` (trang trí, không lặp tên); social có tên "Efitco on Instagram"; thanh toán `aria-label="Payment methods"`; input có label ẩn + `autocomplete="email"`.

## 5. Breadcrumb và tiêu đề trang

ĐỀ XUẤT (Figma không có; 04 §4).
- `<nav aria-label="Breadcrumb"><ol>`, mục cuối `<span aria-current="page">`, dấu "/" bằng `::before`.
- Chữ 14/20, link `--color-muted` (8.45), mục cuối foreground 500, dấu `--color-muted-light`. Link cao 44. Padding trên 16 → 24 từ 64rem (header tối phía trên, breadcrumb trên nền trắng). Mục cuối cắt "…" ở 22ch / 48ch.
- Hover: foreground + gạch chân. Focus: outline accent.
- Không có trên: trang chủ, cart, 404, password. Collection: Home / Collections / {collection}. Product: Home / {collection} / {product}. Article: Home / {blog} / {article}. Trong banner (§3.3): chữ trắng.
- SEO: JSON-LD `BreadcrumbList`, URL qua `routes.*`.

Tiêu đề trang: eyebrow (accent 16/800 uppercase) → h1 → meta 14 muted. Padding 16 / 48, từ 64rem 24 / 64. Một h1 mỗi trang.

## 6. Nút

| Loại | Kích thước | Màu | Code hiện có | Nguồn |
| --- | --- | --- | --- | --- |
| Primary | cao 48 (52 từ 80rem), padding 32, 16/600, bo `--radius-button` | nền accent, chữ trắng (5.01) | `.button` | DESIGN, Figma 1:1104 |
| Secondary | như primary, viền 1px currentColor | trong suốt, chữ foreground; trên dark chữ trắng | `.button--secondary` | DESIGN |
| Link CTA | cao 44, heading 700 28/34, mũi tên 16 × 14 | currentColor | `.button--link` | Figma 1:462 |
| Text link | inline, gạch chân 1px offset 0.2em | inherit, hover accent | — (ĐỀ XUẤT) | 06 §6, `link-in-text-block` |
| Chevron tròn 52 (prev/next) | 52 × 52, chevron 11 × 16 giữa (`slideshow-icon` previous/next), 2 nút cách 8 | nền trắng, viền `--color-border`, icon foreground; hover nền accent, icon trắng; trên nền tối viền trắng (không thấy viền, như Figma) | `.carousel-nav__button`, `.collection-list__button`, `.slideshow__arrow` | Sổ 09/11, Figma 1:398 |
| Đóng 48 | tròn 48, icon 20 | trắng viền border; hover nền foreground | `.quiz__dialog-close` | 15 §1 |
| Icon header | ô 44, icon 20/24 | trắng | `.site-header__icon` | Figma 1:373 |
| Back (drawer) | cao 44, icon 16, chữ 14 muted | nhỏ, nhạt hơn × | — (ĐỀ XUẤT) | 14 §3 |

Trạng thái (Figma không có; code + ĐỀ XUẤT 05 §3):
- Hover < 200ms: primary `color-mix(accent 88%, foreground)` + nhấc 1px + bóng; secondary đảo nền foreground; chevron cam + scale 1.06.
- Active: scale 0.98 (tròn 0.94). Focus: outline 2px accent offset 2 (tròn 3), chỉ `:focus-visible`; trên nền tối outline trắng.
- Disabled: nền `--color-border`, chữ `--color-muted` (6.70), `cursor: not-allowed`. Chevron ở đầu/cuối hàng: opacity 0.35 + `aria-disabled` (code).
- Loading: `aria-busy="true"`, chữ trong suốt, spinner 20, giữ bề rộng, chữ ẩn "Adding".
- Sold out: primary disabled, chữ "Sold out".

Quy tắc: 1 primary mỗi section, ≤ 5 mỗi trang (04 §1); nhãn 2–4 từ Title Case mở bằng động từ ("Add To Cart", sổ 07/11), áp cho mọi `<button>` và link dạng nút (kể cả nút đóng có chữ, nút "+N"/thu gọn, nút thử lại): "Keep Shopping", "Show Fewer", "Try Again", "Continue Shopping". Text link trong câu, link menu, link chính sách giữ chữ theo dữ liệu ("Shipping policy"). Nhãn đang lệch: "Keep shopping" (marketing-popups §3), "Show fewer" (mini-cart-quickview §3.1), "Try again" (product §5.1 J3): sửa theo §24 đề xuất trỏ; hai nút cách 16, mobile xếp dọc cách 12–20. `<button>` cho hành động, `<a href>` cho điều hướng; nút icon có `aria-label`.

## 7. Tab

Figma 1:490: cao 40, padding 7 / 28, gap 8, 16/500, bo 4.
- Chưa chọn: nền alt, viền border, chữ foreground (15.8). Đang chọn: nền foreground, chữ trắng. Hover: viền foreground.
- < 80rem: cao 44, một hàng cuộn ngang. ≤ 5 tab, nhãn 1–2 từ.
- `role="tablist"`/`tab`/`tabpanel`, `aria-selected`, phím ←/→, panel ẩn `hidden`. Code `.featured-collection__tab`.

## 8. Badge

| Badge | Nền / chữ | Tỉ lệ | Khi nào |
| --- | --- | --- | --- |
| -N% | sale / trắng | 6.38 | compare_at_price > price |
| New | badge-new / trắng | 4.57 | tag `new` |
| Sold out | foreground / trắng | 17.4 | mọi variant hết hàng |
| Tag bài viết | accent / trắng | 5.01 | tag đầu của article |
| Rating | trắng, viền alt, sao rating + chữ foreground | 17.4 | có metafield rating |

Pill cao 28, padding 12, 13/600, bo pill. Ưu tiên góc: Sold out > -N% > New. Rating có chữ ẩn "out of 5 stars". Code `.product-card__badge`, `.product-card__rating`, `.article-card__tag`.

## 9. Card sản phẩm

Figma 1:502 (component 1:213). Snippet `product-card`. Dữ liệu động (sổ 07/11).

Anatomy: media 1:1 nền cream bo 12, KHÔNG viền, ảnh `contain` + `mix-blend-mode: darken` · hàng badge padding 16 (8 dưới 64rem), trái badge, phải rating · tiêu đề Inter 16/500 lh 26 ls −0.01em · giá (sale đỏ 16/500 + giá gạch 14 muted, cách 8) · swatch.
- Khoảng: media → tiêu đề 8, tiêu đề → giá 4, giá → swatch 8; swatch 32 × 16 bo 8, cách 4.
- Kích thước: 152 / 232 / 292 / 336.
- Hover: card nhấc 4px, ảnh scale 1.04 (hoặc ảnh 2), tiêu đề gạch chân. Focus: outline trên link tiêu đề.
- ĐỀ XUẤT swatch (câu CTO 2): swatch trên card là chỉ báo, `aria-hidden`, không bấm, không focus; tên link đọc thêm ", 3 colors". Lý do: Figma swatch 32 × 16 cách 4 không thể thành vùng chạm 44 trên mobile (sổ 09/11) mà không phá bố cục; chọn màu ở trang sản phẩm / quickview. Desktop rê chuột lên swatch đổi ảnh card là tăng cường, không bắt buộc.
- Hết hàng: badge Sold out, ảnh opacity 0.6 (05 §3), giá giữ. Không ảnh: placeholder SVG `--color-muted-light` trên cream. Tên dài: tối đa 2 dòng, cắt "…". Đang tải: §18.

A11y + Lighthouse: một link (tiêu đề, `::after` phủ card), ảnh alt = alt Shopify hoặc tên sản phẩm, `<img>` có width/height, chỉ hàng đầu collection không banner được eager, giá có chữ ẩn "Sale price"/"Regular price".

## 10. Card bài viết

Figma 1:1022. Code `.article-card`. Ảnh 3/4 phủ kín bo 16 · gradient tối 50% → đáy · tag accent phải trên cách 12 · tiêu đề Inter 700 18/28 trắng tối đa 3 dòng · meta 14/500.
- Hover: nhấc 6px + bóng, ảnh scale 1.04, tiêu đề gạch chân. Focus outline accent. Không ảnh: nền dark (17.4).
- ĐỀ XUẤT: gradient bắt đầu 50% (code 63.72%) để tiêu đề 3 dòng luôn trên vùng tối (06; 14 #290D). Ảnh `alt=""`, tên đọc từ tiêu đề.

## 11. Hàng ngang + thanh tiến trình

Sổ 09/11: next/back ở đầu khối, thanh tiến trình mảnh, không thanh cuộn trình duyệt, mobile ẩn nút và vuốt.
- Header khối `1fr auto`, nút căn đáy với tiêu đề, cách 8 (Figma 1:395).
- Track `scroll-snap-type: x mandatory`, lộ card kế (15 §5).
- Thanh tiến trình cao 2, cách hàng 32, nền border, thumb foreground; trên nền tối nền trắng 12% + thumb trắng. `aria-hidden`.
- Trên nền tối (Figma 1:395 "Browse Categories" nằm trên dải #1A1A1A): eyebrow xám, chevron trắng, hover cam.
- Không JS: hàng vẫn cuộn tay (`scroll-buttons:not([data-enhanced])`). Code `scroll-buttons`, `.carousel-nav`, `.carousel-progress`.

## 12. Input và form lỗi

Figma chỉ có input footer 1:1104; còn lại ĐỀ XUẤT theo 04 §5, 05 §4–5.
- Label 14/600 phía trên cách 8 · `*` đỏ + `required` · input/select/textarea · gợi ý 14 muted · lỗi 14/500 sale + icon 16.
- Input cao `--control-height`, padding 16, bo `--radius-input`, chữ 16. Textarea 144. Select có chevron.
- Viền: nền sáng `--color-muted-light` (5.33), nền tối `--color-muted-on-dark` (6.11) (sổ 09/11). Hover foreground (tối: trắng). Focus viền accent + outline 2px offset −1 (tối: trắng).
- Lỗi: hiện khi rời trường hoặc submit; viền sale 2px; câu nói cách sửa; `aria-invalid` + `aria-describedby`; tóm tắt đầu form `role="alert"` + focus trường lỗi đầu. Trên nền tối chữ lỗi trắng (§4).
- Disabled: nền alt, viền border, chữ muted-light. Thành công: hộp viền trái 4px badge-new + icon, `role="status"`.
- Checkbox/radio 20, cả nhãn bấm, hàng 44, `accent-color: var(--color-accent)`. Form 2 cột từ 48rem, cách 24.

Lighthouse: `<label for>` thật, `autocomplete`, không chặn dán, không placeholder thay label, nút không ghi "Submit".

## 13. Accordion

Figma 1:1057: icon +/− 24 bên trái, cùng màu chữ câu hỏi (mục đóng `--color-muted` 8.45 trên trắng, 7.73 trên cream; mục mở `--color-foreground`), KHÔNG cam; gạch 1px border; câu hỏi 18/600 (16 dưới 80rem). Figma thắng 15 §6 (icon phải). Icon đổi + → − khi mở, không xoay. ĐỀ XUẤT (05 §3, Figma không có hover): hover câu đóng thì chữ và icon foreground; focus outline accent quanh summary. `<details>/<summary>`, mở sẵn mục đầu, cho mở nhiều mục; hàng ≥ 56; nội dung thụt 40, chữ muted; `--motion-accordion`. Không giấu phí ship, điều kiện KM. Code `.faq-item`, `.site-footer__disclosure`.

## 14. Dropdown và mega menu

Figma chỉ có chevron Shop, Collection (1:362). ĐỀ XUẤT theo 14 §1, 05 §2. Chỉ từ 80rem (menu ngang chỉ có từ 80rem; < 80rem dùng drawer §15).
- Header giữ tối khi mở; mục đang mở trắng 100%, chevron xoay; trang hiện tại vẫn gạch chân. Thay nội dung "header chuyển trắng khi mở" trong `docs/ui-spec/navigation.md` (ES1-T260) cho khớp sổ 10/11.
- Dropdown (Collection): panel trắng, viền border, bo 12, bóng raised, rộng ≥ 224, link 44 padding 24, hover chữ accent. Code `.site-header__submenu`.
- Mega (Shop): full bề ngang ngay dưới header (top 80), nền trắng, padding 40; 2–3 cột link (tiêu đề 14/600 uppercase muted) + 1 ô ảnh (lazy, tải khi mở, sổ 09/11). Link đầu cột "View all products". Scrim 50% phía dưới.
- Mở: hover hoặc click/Enter; đổi mục không chạy lại hiệu ứng; đóng Escape, rời chuột, click ngoài. 250ms drop 8px.
- A11y: `<details><summary>` hoặc `<button aria-expanded aria-controls>`; tiêu đề cột không dùng `<h*>`.

## 15. Drawer

15 §2, 14 §3; code `.site-header__drawer`, `.cart-drawer__dialog`.

| Drawer | Hướng | Rộng 360 / 768 / 1280+ | Nội dung |
| --- | --- | --- | --- |
| Menu | trái | 90% / 420 / — | menu 2 cấp, account, localization |
| Filter | trái | 90% / 420 / 420 | nhóm filter, Apply + Clear ở chân |
| Cart | phải | 90% / 420 / 480 | dòng hàng, tổng, Checkout |
| Search | phải | 90% / 420 / 480 | ô tìm, gợi ý, kết quả nhanh |

- Header drawer 72 (tiêu đề heading 22–28, × 48 cách mép 12) · body cuộn riêng (`overscroll-behavior: contain`) · footer dính đáy (nút chính full width) · scrim `--overlay-scrim`. Nền drawer trắng (header trang tối không lặp vào drawer).
- Cao toàn màn; mobile 90% để chạm scrim đóng. Cấp 2 trượt ngang, Back nhỏ hơn × (14 §3).
- Mở 250ms `--ease-out`, đóng 200ms; chỉ transform + opacity. Đóng: ×, Escape, scrim; trả focus.
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`; khoá cuộn. Không JS: menu `<details>`, cart link `routes.cart_url`. Ảnh trong drawer lazy, có width/height.

## 16. Dialog và bottom sheet

15 §1–2, sổ 09/11 (quiz popup, mobile bottom sheet); code `.quiz__dialog`.

| Cỡ | ≥ 768 | < 768 |
| --- | --- | --- |
| S (xác nhận, chọn variant) | 480 | bottom sheet |
| M (quick view, ask a question) | 720 | bottom sheet |
| L (kết quả quiz, lightbox) | 1120 | bottom sheet |

- ≥ 768: giữa màn, bo 24, padding 32 (48 từ 1280), cao ≤ `min(860, 100dvh − 48)`, × 48 cách góc 24.
- < 768: dính đáy, rộng 100%, cao ≤ 88dvh, bo 2 góc trên, thanh kéo 40 × 4, × cách góc 12, vuốt xuống đóng; nút xếp dọc, chính dưới cùng.
- Tiêu đề h2 heading 800 (28–40), chừa chỗ ×; popup marketing dùng Sofia 700 theo Figma 1:1148 (marketing-popups). Popup marketing < 50 từ. Hàng nút phải, cách 32, gạch trên.
- Motion: mở 300ms fade + nhấc 24 + scale 0.97; đóng 200ms; mobile trượt từ đáy.
- Quy tắc: một lớp một lúc, hàng đợi: popup đang hiện đóng thì popup kế mới hiện, nghỉ 3 s giữa hai popup tự mở (sổ 10/11 MK3, MK4); thẻ big offer đang mở thì popup tự mở chờ (MK5); mỗi popup tự mở tối đa 1 lần/phiên, cộng số ngày theo setting (không phải "1 popup/phiên" cho cả theme); không mở lúc tải trang (chờ thời gian/cuộn/ý định rời, sổ 09/11); không ở 404; không confirmshaming (15 §1). Chi tiết hàng đợi: marketing-popups.md §1.2; thứ tự lớp và vùng đáy: layers.md (§23).
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`, Escape, focus phần tử đầu, trả focus.

## 17. Toast

Sổ 09/11 đã chốt màu. Vị trí: mobile đáy cách 16 full width; ≥ 768 góc dưới inline-end cách 24, rộng 400; `position: fixed` (0 CLS). Thanh màu 4px · icon 20 · tiêu đề 16/600 + mô tả 14 · nút đóng 44 có tên riêng ("Dismiss: Added to cart"). Nền trắng, viền border, bóng raised.

| Loại | Thanh + icon | Icon | role | Tự ẩn |
| --- | --- | --- | --- | --- |
| info | `--color-muted` | i | status | 6s, dừng khi hover/focus |
| success | `--color-badge-new` | check | status | 6s, dừng khi hover/focus |
| warning | `--color-accent` | tam giác ! | alert | không |
| error | `--color-sale` | ! tròn | alert | không |

Màu chỉ là tín hiệu phụ, loại đọc từ icon + chữ. Tối đa 3 toast chồng.

## 18. Trạng thái rỗng, lỗi, đang tải

ĐỀ XUẤT (Figma không có; 05 §6–7, 14 #928M).
- Đang tải: skeleton `--color-background-alt` đúng kích thước nội dung (card: media 1:1 + 2 dòng 14, dòng 2 rộng 40%), shimmer 1.4s, tĩnh khi giảm chuyển động; vùng đổi `aria-busy` + `role="status"` + spinner 24. Không làm mờ chữ (Lighthouse color-contrast tính opacity).
- Rỗng: giữa, ≤ 512: icon 32 trong tròn 72 nền alt · h2/h3 rõ ("Your Cart Is Empty") · 1 câu gợi ý · primary cụ thể ("Shop Bestsellers") + text link phụ. Search không kết quả thêm gợi ý (05 §7).
- Lỗi khối: viền 1px sale, bo 12, icon 24 sale, tiêu đề 16/600, câu xử lý 14 muted, secondary "Try Again", `role="alert"`. Trường: §12. Thao tác nền: toast error. 404: không popup, có search + link trang chủ (TE-9 AC2).

## 19. Motion

Token: `--motion-fast` 150, `--motion-base` 250, `--motion-slow` 500, `--motion-accordion` 350, `--motion-reveal` 900; `--ease-out` (vào), `--ease-in-out` (accordion), `--ease-expo` (reveal, dialog).

| Thành phần | Vào | Ra | Thuộc tính |
| --- | --- | --- | --- |
| Hover nút, link, tab, menu header | 150–250 | 150–250 | màu, translate, scale |
| Dropdown / mega | 250 drop 8px | 150 | opacity, translate |
| Drawer | 250 | 200 | translate, scrim opacity |
| Dialog | 300 | 200 | opacity, translate, scale |
| Bottom sheet | 300 từ đáy | 200 | translate |
| Accordion | 350 | 350 | block-size, opacity |
| Toast | 250 lên 8px | 150 | opacity, translate |
| Bóng header khi cuộn | 250 | 250 | box-shadow (1 phần tử, không layout) |
| Reveal khi cuộn | 900, lệch 80ms/card | không lặp | opacity, translate, clip-path |

Chỉ transform / opacity / clip-path (sổ 09/11); reveal 1 lần, chỉ tiêu đề, card, ảnh chính, CTA; `prefers-reduced-motion: reduce` tắt hết. Reveal 900 và accordion 350 dài hơn 15 §3/§6: theo token và quyết định CTO 09/11, giữ.

## 20. Ràng buộc Lighthouse

Chỉ tiêu (sổ 09/11, phạm vi theo sổ 10/11 BGĐ): A11y 100 desktop và mobile ở mọi trang; Performance desktop ≥ 98, mobile ≥ 90 ở mọi trang; SEO 100 đo ở trang chủ, collection, sản phẩm, blog, bài viết, page (cart, search, account, 404, password, gift card không tính SEO vì Shopify chặn index hoặc trả 404/401, nhưng vẫn giữ quy tắc SEO dưới đây); Best Practices 100 do DevOps/QA đo, tách phần theme và phần nền tảng, ngoài phạm vi Designer (thiết kế vẫn giữ các quy tắc BP dưới đây).
- A11y: tương phản theo §2 (không dùng border, accent trên dark, sale trên dark cho chữ nhỏ); mọi nút/link icon có tên riêng; mọi trường có label; một `<main>`, một h1, heading không nhảy bậc (tiêu đề cột menu/footer không dùng `<h*>` nếu lệch bậc); danh sách `<ul>/<ol>`; tablist đủ; dialog có tên; link trong đoạn văn gạch chân; vùng chạm ≥ 24, control mobile ≥ 44; swatch card `aria-hidden` (không có control 16px); skip link; không thuộc tính ARIA trên phần tử không role.
- SEO: `<title>` + meta description; link `<a href>` thật; chữ link mô tả đích; ảnh có alt; breadcrumb JSON-LD; canonical (`meta-tags`); chữ ≥ 12px.
- Best Practices: 0 lỗi console; ảnh đúng tỉ lệ và độ phân giải (`image` snippet srcset); không chặn dán; không xin quyền khi tải.
- Performance: 1 ảnh eager + `fetchpriority="high"` mỗi trang (hero, banner, hoặc ảnh sản phẩm đầu); ảnh khác lazy có width/height; ảnh mega/popup tải khi mở; skeleton giữ chỗ; toast, drawer, dialog, header không đẩy layout; tối đa 2 họ font, `swap`; header (gồm noise) + breadcrumb + tiêu đề trang + nút ở critical.css (≤ 10 KB); JS mỗi file ≤ 8 KB, trang ≤ 40 KB; animation chỉ transform/opacity.

## 21. Map sang code hiện có

| Thành phần | Class / file đã có | Thiếu (ticket trang làm) |
| --- | --- | --- |
| Header | `.site-header`, `[data-scrolled]`, base.css 7452–7497 (nền tối, logo 100, gap 40, icon 20/24) | bỏ điều kiện `body:has(.slideshow)` để mọi trang tối; bỏ `[data-header-overlay]` (không đè ảnh); `aria-current` gạch chân; focus trắng |
| Banner trang con | — | `.page-banner` §3.3 |
| Footer | `.site-footer*`, `.site-footer__main` (dải rộng, bo 16, noise) | link policy; viền input 100% muted-on-dark; chữ lỗi trắng |
| Nút | `.button`, `.button--secondary`, `.button--link`, `[aria-busy]` | `:disabled`; cao 48 dưới 80rem |
| Chevron 52, tiến trình | `.carousel-nav__button`, `.collection-list__button`, `snippets/slideshow-icon`, `.carousel-progress`, `scroll-buttons` | — |
| Tab | `.featured-collection__tab` | — |
| Card sản phẩm, giá, badge | `snippets/product-card`, `snippets/price`, `.product-card__*` | swatch `aria-hidden` + số màu trong tên link; ảnh mờ khi sold out; clamp 2 dòng |
| Card bài viết | `.article-card*` | gradient 50% |
| Accordion | `.faq-item`, `.site-footer__disclosure` | — |
| Dropdown | `.site-header__submenu` | mega menu |
| Drawer | `.site-header__drawer*`, `.cart-drawer__dialog` | khung drawer chung, filter, search |
| Dialog | `.quiz__dialog`, `.quiz__dialog-close` | class chung cho mọi popup |
| Breadcrumb, toast, empty, alert, skeleton | — | tạo mới §5, §17, §18 |
| Panel tối | `.cart-summary`; `.bundle-builder__panel` có `--bundle-panel-muted` trắng 60% (base.css 747) | 1 cặp `--panel-muted` 70%, `--panel-saving` cho cart, mini cart, bundle, shop the look, quiz (§2); đổi `--bundle-panel-muted` 60% → 70% |
| Accordion | `.faq-item` | icon +/− `currentColor`, câu đóng `--color-muted` (§13) |

Settings merchant: foundation dùng `background_dark_color` có sẵn cho header và footer; thêm 1 theme setting "Popular searches" (§24.1).

## 22. Quyết định CTO đã chốt (10/11)

CTO chốt cả 3 câu theo đề xuất (sổ 10/11: các câu khác vòng 3 chốt theo đề xuất trong spec).
1. Banner trang con (collection, ảnh bìa bài viết): thẻ bo 16 trong container dưới header, lớp tối ≥ 60% (khác hero 30%) để chữ trắng AA với mọi ảnh merchant chọn: có (§3.3).
2. Swatch trên card sản phẩm là chỉ báo không bấm (`aria-hidden`, số màu đọc trong tên link), chọn màu ở trang sản phẩm/quickview: có (§9).
3. Mở mega menu/dropdown header giữ tối, mục đang mở trắng 100% + chevron xoay: có (§14, navigation.md đã theo).

## 23. Thành phần dùng chung ở spec riêng

Tên file cố định; spec chưa có là do ticket khác đang tạo (audit ES1-T283 §3). Trang con và overlay trỏ về các file này, không mô tả lại.

| Thành phần | Spec | Nội dung chính | Ticket audit |
| --- | --- | --- | --- |
| Bộ chọn biến thể | `docs/ui-spec/variant-picker.md` | dựng từ option value (2048 biến thể), 3 trạng thái giá trị, > 10 giá trị hiện 7 + "+N" (hằng chung, sổ 10/11 M5), "Show Fewer", đang tải, lỗi "Try Again"; PDP, quickview, card | T1 (A1, A2) |
| Phân trang | `docs/ui-spec/pagination.md` | snippet `pagination` chung, nút tròn 52 (§6), trang hiện tại accent, đầu/cuối giữ nút mờ 0.35 + `aria-disabled` (sổ 10/11 câu 5) | T2 (A3, A4) |
| Lớp và vùng đáy | `docs/ui-spec/layers.md` | thứ tự z và vùng đáy (sticky ATC, cart bar, bundle bar, teaser Big Offer, toast, Inbox, banner consent), `scroll-padding` cho header 80 và thanh đáy, danh sách lớp cho hàng đợi popup (§16) | T7 (A15–A17, A22) |
| Countdown "Sale ends in" | `docs/ui-spec/countdown.md` | 1 component cho featured product, PDP, big offer; Compact/Regular theo khung chứa; 3/4 ô; nguồn ngày metafield `custom.sale_ends_at` trước, setting sau (sổ 10/11 câu 2); A11y theo P4 | T8 (A14), ticket này |
| Announcement bar | `docs/ui-spec/announcement-bar.md` | thanh trên header tối 80, link, đóng, rỗng thì ẩn (SRS TE-1 AC4) | T6 (A18) |
| Chọn quốc gia / ngôn ngữ | `docs/ui-spec/localization.md` | 1 nút gộp "USD / EN" ở footer (§4) và drawer menu (§15), popover desktop, sheet mobile, ô tìm khi nhiều nước, ẩn khi 1 nước/ngôn ngữ (SRS TE-1 AC5, AC9) | T6 (A19) |

## 24. Settings dùng chung toàn theme

### 24.1 Popular searches (A23)

Một setting trong theme settings (`config/settings_schema.json`, nhóm "Search"), đọc ở cả search overlay (predictive-search.md §5, trạng thái rỗng và 0 kết quả) và trang search (search.md S1, S2). Bỏ setting cùng tên trong header block và block `search-results`.

| Tên | id | Kiểu | Default | Giới hạn | Info (sentence case) |
| --- | --- | --- | --- | --- | --- |
| Popular searches | `popular_searches` | text | Adjustable bench, Dumbbell, Kettlebell, Resistance band, Training mat | tối đa 5 cụm (05 §4: 3–5 lựa chọn), phân cách dấu phẩy, mỗi cụm ≤ 3 từ; cụm thứ 6 trở đi bỏ qua; rỗng thì ẩn khối "Popular searches" ở cả 2 chỗ | "Up to 5 terms, separated by commas. Shown in the search popup and on the search page before a search and when nothing is found. Leave empty to hide." |

Default: từ chung, mỗi cụm khớp sản phẩm thật trong demo-data (FlexFold Adjustable Bench, Adjustable dumbbell pair, Iron Core Kettlebell 16 kg, Resistance Band Set, Training Mat 12 mm), nên chip nào cũng ra kết quả. Chip là link `routes.search_url?q=`; overlay bấm chip thì chạy gợi ý tại chỗ (predictive-search §4).

## 25. Đề xuất trỏ cho spec ngoài phạm vi ES1-T291 (không sửa ở ticket này)

| File | Mục | Sửa |
| --- | --- | --- |
| `search.md` | §4 | bỏ dòng "Popular searches" khỏi settings block `search-results`, ghi "theo foundation §24.1"; §4 dòng chữ mặc định "Iron Core Kettlebell…" bỏ; mockup T256 S1, S2 đổi chip theo default mới khi render lại |
| `marketing-popups.md` | §3, §4 | nhãn "Keep shopping" → "Keep Shopping" (§6); thanh đếm ngược big offer trỏ countdown.md (cỡ Compact, 3/4 ô, nguồn ngày metafield trước); setting "Sale end date" chỉ dùng khi không có metafield; dữ liệu mockup "`default_countdown_end`" → "`custom.sale_ends_at`" |
| `product.md` | §4.2, §18, §5.1 | bảng cỡ countdown trỏ countdown.md §2 (giá trị giữ nguyên = Compact/Regular); §18 "khác nguồn ngày" → "cùng nguồn ngày, countdown.md §4"; "Try again" → "Try Again" (gộp ticket T1 bộ chọn biến thể) |
| `mini-cart-quickview.md` | §1, §3.1, bảng tương phản | "Show fewer" → "Show Fewer"; số 6.54 / 5.84 → 6.56 / 5.64 theo §2 (cùng công thức, token badge-new mặc định) |
| `cart.md` | §3 dòng 124–125, bảng tương phản | giữ công thức (đã là gốc); số `--panel-saving` 5.81 (#A5C1A6) → 5.64 (#A3BDA4) vì token mặc định #467A48 |
| `index-mobile-b.md` | §1 Bundle, §9 bảng tương phản, §12 câu 3 | dòng hàng panel #B2B2B2 (5.39) → `--panel-muted` (6.56); dòng giảm giá badge-new 55% (5.41) → `--panel-saving` (5.64) + icon tag; mockup T279 render lại khi chạm khối bundle |
| `index-mobile-a.md` | §6 Quiz, §9.1 dòng "Ghi chú quiz, dòng phụ panel" | trắng 60% (5.27) → `--panel-muted` (6.56); §7 đã sửa trong ticket này |
| `page.md` | aside FAQ | icon accordion theo §13 mới (không cam); PNG T258 render lại khi chạm trang |
| `collection.md` | §9 S7 | (A12, ngoài ticket này) "card cũ mờ 40%" trái §18 "không làm mờ chữ" |

## 26. Quyết định CTO đã chốt 11/11 (theo đề xuất, sổ 11/11)

1. Chữ phụ trên mọi panel tối đổi về trắng 70% (6.56) kể cả chỗ Figma vẽ #B2B2B2 (bundle) và trắng 60% (shop the look, quiz) để một cặp màu toàn theme? Đề xuất: có (§2).
2. "Popular searches" chuyển thành theme setting duy nhất, tối đa 5 cụm, bỏ setting ở header block và block search-results? Đề xuất: có (§24.1).
