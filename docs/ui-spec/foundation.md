KHÔNG CHẮC: Figma chỉ có desktop 1920 và không có trạng thái, nên 360/768 và mọi trạng thái là ĐỀ XUẤT. Snapshot không có vector: chevron 52 lấy từ `snippets/slideshow-icon.liquid`, noise lấy từ `assets/noise-dark.png` (cả hai đã dựng theo Figma). PNG dài 12–16k px, chi tiết dưới 4px soát qua code. ES1-T291: 5 spec trỏ ở §23 (trừ countdown.md) do ticket khác tạo, chưa có trên nhánh này; mục trỏ theo tên file cố định trong ticket.

# UI spec: Foundation trang con (ES1-T251, vòng 3)

Mục đích: bộ thành phần chung cho mọi trang con và overlay (ES1-T252–T263), nhất quán với gốc duy nhất là Figma trang chủ 1:359. Story TE-9, TE-17.

Đầu ra:
- Spec này.
- `drafts/designer/_kit/kit.css`: CSS mockup. Mockup trang con nhúng `<link rel="stylesheet" href="../_kit/kit.css">`, chỉ viết thêm CSS riêng trang.
- `drafts/designer/ES1-T251/foundation.html` + `foundation-360|768|1280|1920.png`.

Thứ tự nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 > bộ kiến thức (file `NN`). Không dùng trang live hay ảnh chụp store làm gốc (ticket vòng 3).

Quy ước cho Dev FE: kit.css là mockup, không chép vào `assets/`. Theme vẫn theo AGENTS.md: logical properties, 0 màu literal, `var(--*)`, breakpoint `48rem / 64rem / 80rem`. Cột "Code hiện có" chỉ class đã có trong `assets/`.

## Thay đổi rà soát Polaris-first (ES1-T535, CTO 21/11, báo cáo `ai-team/data/design-audit/efitco-ds-polaris-2026-11-21.md`)

Quyết định từng mục: `docs/design/decisions.md` mục "CTO 21/11 — ES1-T535 (rà soát chuẩn Polaris-first)". Không thêm giá trị màu, không đổi thang chữ.

| Mã | Mục | Trước | Sau |
| --- | --- | --- | --- |
| foundations-07 | §2.1, §12, §17, §18 | thông báo mượn `--color-badge-new`, `--color-sale`, `--color-accent` | 3 role trạng thái là alias: `--color-success`, `--color-critical`, `--color-warning` (+ `-foreground`); thông báo đọc alias |
| foundations-11 | §19 | ghi 5 duration + 3 easing; kit viết tay 700ms, 1.4s | đủ 8 duration + vai trò 3 easing; spinner = `--motion-hero`, shimmer = `--motion-hero`; ngoại lệ reveal 900, hero 1400 |
| foundations-12 | §6, §30.6, pagination.md | nút tròn đầu / cuối mờ 0.35; ô màu lọc disabled mờ 0.4 | không opacity: nút tròn viền border + icon muted-light; ô màu lọc gạch chéo, nhãn muted-light |
| foundations-13 | §1, §1.3, §14 | sàn 24 từ 1280 ("icon, nav 44"); link mega 40 | `--touch-target` 44 mọi mốc cho 6 nhóm; link mega 44; bảng 6 nhóm × 4 mốc |
| foundations-15 | §2.2 | nền tối mô tả rời (`.on-dark`, `.dpanel`) | ma trận 6 scheme × 6 role kèm tương phản (chỉ tài liệu) |
| foundations-18 | §1.1 | — | ngoại lệ line-height không theo bội 4 |
| components-06 | §17, §18 | toast error / warning không giới hạn tình huống; tiêu đề không giới hạn | quy tắc chọn mẫu thông báo; tiêu đề toast success ≤ 3 từ, ≤ 24 ký tự |
| components-07 | §16 | — | ngoại lệ popup marketing tự mở |
| components-11 | §6 | — | ngoại lệ Title Case |
| components-12 | §8 | — | ngoại lệ accent cho tag bài viết |
| Mockup | foundation.html | ảnh cắt theo section chạm mép, vòng focus ở mép bị cắt | section trong `.container` có lề `--page-margin` hai bên (kit `.container > .demo-block`) |

## Thay đổi DS check (ES1-T527, báo cáo 20/11 `ai-team/data/design-audit/efitco-ds-check-2026-11-20.md`)

Nguồn chuẩn token: Figma "Efitco Theme Final / Design System 2" trừ ngoại lệ ở sổ quyết định (accent #C8400E, muted-light #6B6B6B). Quyết định từng mục: `docs/design/decisions.md` mục "CTO 20/11 — ES1-T527 (DS check)".

| Mã | Mục | Trước | Sau |
| --- | --- | --- | --- |
| V01 | §2 badge_new | settings #467A48, kit/Figma #4B824D, `--panel-saving` tính theo #467A48 (5.64) | #4B824D mọi nguồn; `--panel-saving` #A5C0A6 5.82 (settings_schema: việc FE) |
| V02 | §1.1 thang chữ | mobile display 48, h1 33, h2 28, h3 22; không h4; lh heading 1.1 | theo Figma M/H*, D/H*: display 52→100, h1 40→48, h2 32→36, h3 28, h4 20 (mới), eyebrow 14→16; lh 1.2 |
| V03 | §2 background_dark | tokens.json, DESIGN #1E1E1E 5.85 | #1A1A1A, muted-on-dark 6.11 |
| V04 | §1.2 bo góc | card 8 trong tokens.json; 16 = calc; dialog 24 | thang xs 4 / sm 8 / md 12 / lg 16 / xl 20 / pill; vai trò `--radius-panel` 16, `--radius-dialog` 20 |
| V05 | §1.1 body | Inter 400 16/24 | Inter 500 16/26 −1%; body small 500 14/22; label 600 13/20; ô nhập giữ 16/400 |
| V06 | §1, §1.2 | 8 bậc, không 20/40/56/64; gutter 16/24; section mobile 48; thanh carousel 2 | tên 2xs…7xl (Figma Space/4…64 + 80, 120); gutter 12/16/24; section 56/120; carousel 4; meter 8 |
| V07 | DESIGN.md | lỗi thời (header đè hero, nút 44, focus currentColor, 19 màu) | đồng bộ, trỏ về file này |
| V08, V14, V23, V26, V38–V41, V46, V48, V55 | §30 | chưa có màn DS | thêm component + màn DS ở foundation.html |
| V09–V12 | §6, §12, §9, §10, §13 | thiếu active/loading/focus, ô form cao không đều | ma trận trạng thái có nhãn; ô cao cố định, lưới căn đỉnh |
| V13 | §15 | chân cart drawer trắng | panel tối nổi `.overlay__footer--panel` (G3) |
| V15 | §31 | không màn elevation/layer | `--shadow-*`, `--layer-*` vào kit + màn DS |
| V16 | foundation.html | không do/don't | khối Nên / Không nên + setting id dưới mỗi component |
| V17 | §2 | accent_on_sand literal #000, chưa đăng ký | dẫn xuất `color-mix(accent 90%, foreground)` #B73C0F 4.62, ghi tokens.json |
| V18 | §2 | alt #F4F4F4; màu chỉ có ở Figma | alt #F4F4F5; #142521, #CEC2BD, #666666, #CCCCCC không thành token |
| V20 | §5 | breadcrumb xuống 2 dòng | 1 dòng, mục cuối co + "…", < 48rem mục giữa cắt 10ch |
| V21, V40 | §6, §12 | control 40/44 tự chế | `--control-height-compact` 44, `.button--small`, `.field__input--compact` |
| V22 | §9 | swatch card viền accent, "5 colors" | swatch không trạng thái chọn; > 4 màu = 3 + "+N" |
| V37, V53, V54, V57 | kit | accordion cam; `.rte`, pagination, chip, empty-state, search field chép ở trang | sửa trong kit, gom vào kit mục 13b; trang không định nghĩa lại |

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
| Cột / gutter | 4 / 12 | 8 / 16 | 12 / 24 | 12 / 24 | `--grid-gap` = `--space-sm` → `--space-md` từ 48rem → `--space-xl` từ 80rem | Figma DS2 mobile gap 12; Figma 1:490 |
| Lưới sản phẩm | 2 × 154 | 3 × 232 | 4 × 292 | 4 × 336 | gap ngang = gutter, gap dọc 24 → 40 | Figma 1:490 |
| Card bài viết (hàng ngang) | 252 × 336 | 307 × 410 | 336 × 448 | 336 × 448 | `min(70vw, 336px)` / `min(40vw, 336px)`, 3/4 | Figma 1:1022 |
| Khoảng giữa section | 56 | 56 | 120 | 120 | `--section-gap` = `--space-4xl` < 64rem, `--space-7xl` | Figma DS2 mobile 56–64 |
| Tiêu đề section → nội dung | 24 | 24 | 40 | 40 | `--space-5`; `--space-1 × 10` từ 80rem | Figma 1:490 |
| Eyebrow → tiêu đề | 12 | 12 | 12 | 12 | `--space-3` | Figma 1:490 |
| Header | 80 | 80 | 80 | 80 | `--header-height` | Figma 1:362 |
| Control (nút, input) / compact | 48 / 44 | 48 / 44 | 52 / 44 | 52 / 44 | `--control-height`, `--control-height-compact` | 14 §2; Figma 1:1104 |
| Vùng chạm, sàn mọi control | 44 | 44 | ≥ 24 | ≥ 24 | `--touch-target-min` 24. Sổ 09/11: ≥ 24, mobile ≥ 44 | AGENTS, 14 §2 |
| Vùng chạm, 6 nhóm chính (§1.3) | 44 | 44 | 44 | 44 | `--touch-target` 44 | Sổ 21/11 (foundations-13) |
| display | 52 | 73 | 100 | 100 | `--font-size-display`, lh 62 → 1 | Figma M/H1, D/H1 |
| h1 | 40 | 44 | 48 | 48 | `--font-size-h1`, lh 1.2 | Figma M/H2, D/H2 |
| h2 | 32 | 34 | 36 | 36 | `--font-size-h2`, lh 1.2 | Figma M/H3, D/H3 |
| h3 | 28 | 28 | 28 | 28 | `--font-size-h3`, lh 1.2 | Figma M/H4, D/H4 |
| h4 | 20 | 20 | 20 | 20 | `--font-size-h4`, lh 1.2 | Figma M/H5, D/H5 |
| eyebrow | 14 | 15 | 16 | 16 | `--font-size-eyebrow` | Figma M/H6, D/H6 |
| Body / nhỏ / label | 16/26 / 14/22 / 13/20 | như 360 | như 360 | như 360 | `--font-size-base / sm / xs`, body 500 | Figma Common/* |

Quy tắc: thứ tự nội dung giữ nguyên giữa mốc (06 §2); đoạn dài `max-inline-size: 65ch` (06 §7.3); zoom 200% không tràn ngang, hàng cuộn ngang có `overflow-x` riêng (14 #1096M).

### 1.1 Thang chữ (Figma Design System 2, ES1-T527 V02, V05)

| Figma | Token / class | 360 | 1280+ | Font |
| --- | --- | --- | --- | --- |
| M/H1 → D/H1 | `--font-size-display`, `.display` | 52/62 −3% | 100/100 −4% | Sofia 800 UPPER |
| M/H2 → D/H2 | `--font-size-h1`, `h1`, `.h1` | 40/48 | 48/58 | Sofia 700 −2% |
| M/H3 → D/H3 | `--font-size-h2`, `.h2` | 32/38 | 36/44 | Sofia 700 −2% |
| M/H4 = D/H4 | `--font-size-h3`, `.h3` | 28/34 | 28/34 | Sofia 700 −2% |
| M/H5 = D/H5 | `--font-size-h4`, `.h4` | 20/24 | 20/24 | Sofia 700 −2% |
| M/H6 → D/H6 | `--font-size-eyebrow`, `.eyebrow` | 14/16 | 16/20 | Sofia 800 UPPER +4% |
| Common/Title | `.text-title` | 18/28 | 18/28 | Inter 700 −1% |
| Common/Body | `body` | 16/26 | 16/26 | Inter 500 −1% |
| Common/Body small | `.text-small` | 14/22 | 14/22 | Inter 500 |
| Common/Form | `.field__input` (giá trị 16 để iOS không phóng to), hint 14/22 | | | Inter 400 |
| Common/Label | `.text-label`, badge | 13/20 | 13/20 | Inter 600 −2% |
| Common/Button | `.button` | 16/26 | 16/26 | Inter 600 −1% |
| — | `.group-label` (nhãn nhóm overlay, V76) | 14/22 | 14/22 | Inter 600 UPPER +4% muted |

Giữa 360 và 1280 cỡ heading nội suy bằng `clamp()`. HD1 (sổ 11/11, display hero `min(display, 6.25vw)` từ 80rem) là luật trang chủ, không đổi token.

Ngoại lệ line-height (sổ 21/11, foundations-18): line-height giữ theo Figma Design System 2, KHÔNG theo bội 4 của Polaris (12, 16, 20, 24, 28, 32, 40, 48). Các dòng không chia hết cho 4: 62 (display 360), 58 (h1 1280), 38 (h2 360), 34 (h3), 26 (body, button), 22 (body small, form, group label). Thang chữ không đổi (V02, V05; BGĐ 10/11 Figma là gốc); không tự "làm tròn" về 24 / 28. Chú thích cùng nội dung ở màn `h-type`.

### 1.2 Khoảng cách và bo góc (V04, V06)

Khoảng cách: `--space-2xs` 4, `xs` 8, `sm` 12, `md` 16, `lg` 20, `xl` 24, `2xl` 32, `3xl` 40, `4xl` 56, `5xl` 64 (Figma Space/4…64), `6xl` 80, `7xl` 120 (tầng desktop). `--space-1…8` giữ làm alias cho code theme; 48 (`--space-7`) ngoài thang Figma, chỉ cho control.

Bo góc: `--radius-xs` 4 (input, nút, chip, tab), `sm` 8 (swatch, thumb), `md` 12 (card, dropdown, popover, bảng), `lg` 16 (`--radius-panel`: banner, card bài viết, card collection, panel footer, panel tối, hộp meter, panel trong trang), `xl` 20 (`--radius-dialog`), `pill`. Không viết `calc(radius + space)`.

### 1.3 Vùng chạm 44 cho 6 nhóm (sổ 21/11, foundations-13; màn `h-grid`)

Hai token: `--touch-target-min` 24 là sàn mọi control (sổ 09/11; dưới 48rem control vẫn ≥ 44), `--touch-target` 44 áp MỌI MỐC cho đúng 6 nhóm dưới đây. Số = rộng × cao vùng chạm thật (px), đo trên kit.

| Nhóm | Component | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- | --- |
| 1 · Link menu chính | `.site-header__link`, hàng drawer, `.mega__col a`, `.dropdown a` | hàng drawer cao 52, hết ngang | hàng drawer cao 52, hết ngang | link ≥ 44 × 44 (chữ rộng 30–84, vùng chạm nở tới 44); mega, dropdown cao 44 | như 1280 |
| 2 · Submit form | `.search-field__submit`; `.button` (Add To Cart) | 44 × 44; 156 × 48 | 44 × 44; 156 × 48 | 44 × 44; 156 × 52 | 44 × 44; 156 × 52 |
| 3 · Cart | `.site-header__icon` | 44 × 44 | 44 × 44 | 44 × 44 | 44 × 44 |
| 4 · Hamburger | `.site-header__menu-toggle` | 44 × 44 | 44 × 44 | ẩn (menu ngang) | ẩn (menu ngang) |
| 5 · Đóng modal / drawer | `.close-button` | 48 × 48 | 48 × 48 | 48 × 48 | 48 × 48 |
| 6 · Chọn variant | `.variant-pill`, `.variant-swatch`, `.variant-more` | pill ≥ 56 × 44; swatch 44 × 44 | như 360 | như 360 | như 360 |

- Link menu ngắn (Sale, Blog, Help) có chữ hẹp hơn 44: vùng chạm nở đều hai bên tới 44 bằng `::after`, khoảng cách 40 giữa các mục giữ theo Figma 1:365 (bố cục không đổi).
- Link mega 40 → 44 cao (mỗi hàng link cao thêm 4). `.button` cao 48 / 52 và luôn rộng hơn 44 nhờ đệm ngang 32 × 2, không đặt `min-inline-size`.
- Component đọc `var(--touch-target)` (`min-block-size`, `min-inline-size` hoặc `inline-size` / `block-size`), không viết 44px.
- Ngoài 6 nhóm giữ sàn 24: tab 40 từ 1280 (§7), chip 40 từ 80rem (§30.1). Swatch trên card sản phẩm 36 × 24 không phải control: chỉ báo không bấm, `aria-hidden` (CTO 10/11, §22 câu 2, §9) nên không tính vào nhóm 6 "chọn variant"; chọn màu bằng `.variant-swatch` 44 × 44.
- Hàng drawer menu cao 52 (`.nav-row`) hiện định nghĩa ở mockup navigation (ES1-T260), chưa có trong kit.

## 2. Token dùng

Token màu trong `snippets/css-variables.liquid` + 3 màu dẫn xuất ghi ở `docs/tokens.json` `color_derived` (không setting): `--color-accent-on-sand`, `--panel-muted`, `--panel-saving`.

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt(-foreground)`, `--color-background-cream(-foreground)`, `--color-background-sand(-foreground)`, `--color-background-dark(-foreground)`, `--color-background-panel`, `--color-muted-on-dark`, `--color-accent(-foreground)`, `--color-accent-on-sand`, `--color-sale(-foreground)`, `--color-badge-new(-foreground)`, `--color-rating`. Role trạng thái (alias, §2.1): `--color-success(-foreground)`, `--color-warning(-foreground)`, `--color-critical(-foreground)`.
Chữ: `--font-heading--family/weight/weight-display`, `--font-primary--family`, `--font-size-xs..wordmark`, `--line-height-body/heading`.
Khoảng cách: `--space-1..8`, `--space-2xs..7xl`, `--touch-target-min`, `--touch-target`, `--page-width`, `--page-margin`, `--header-height`, `--control-height(-compact)`. Bo góc: `--radius-xs/sm/md/lg/xl/pill`, vai trò `--radius-input/button/card/hero/swatch/panel/dialog`. Elevation: `--shadow-none/raised/overlay/bar`, `--overlay-scrim`. Lớp: `--layer-*` (§31). Motion: `--motion-fast/base/slow/accordion/reveal/enter/stagger/hero`, `--ease-out/in-out/expo` (§19).
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
| `--radius-dialog` | `--radius-xl` = 20 (Figma Radius/20; trước 24) | dialog, sheet |
| `--panel-muted` | `color-mix(in srgb, var(--color-background-dark-foreground) 70%, var(--color-background-panel))` ≈ #C4C4C6 | chữ phụ trên panel tối: dòng hàng, Subtotal, ghi chú thuế, đếm món, ghi chú quiz |
| `--panel-saving` | `color-mix(in srgb, var(--color-badge-new) 50%, var(--color-background-dark-foreground))` ≈ #A5C0A6 (badge-new #4B824D) | dòng giảm giá trên panel tối, luôn kèm icon tag 16 + dấu "−" (U+2212), số tiền `white-space: nowrap` |

Panel tối (G3, sổ 10/11): mọi khối nền `--color-background-panel` (tóm tắt cart, chân mini cart, "Your Bundle", panel shop the look, quiz) dùng đúng cặp trên. Chữ chính và tổng: `--color-background-dark-foreground` (11.4). Không dùng #999 / `--color-muted-on-dark` (4.01), #B2B2B2, trắng 60%, xanh Figma #4B824D (2.50) hay chữ trắng cho dòng giảm giá. Focus trên panel: outline trắng. Thay đổi chữ phụ trắng 60% → 70% và #B2B2B2 → 70% là lệch Figma có chủ đích (nhất quán, AA); spec bundle, shop the look, quiz trỏ về đây.

Không dùng màu chỉ có trong Figma (V18): #142521 (Brand/Xanh nhấn), #CEC2BD (Be line), #666666 (Gray/1, thay bằng muted-light #6B6B6B), #CCCCCC (White/2, thay bằng `--panel-muted`), #333333, #808080, #B2B2B2.

Bảng tương phản (WCAG, L tính tay; dark = #1A1A1A, L 0.0103):

| Cặp | Tỉ lệ | Dùng cho |
| --- | --- | --- |
| foreground / background | 17.4 | mọi chữ |
| foreground / background-alt (#F4F4F5) | 15.8 | tab chưa chọn, chip, nút tertiary |
| foreground / cream | 15.9 | card sản phẩm |
| muted / background | 8.45 | chữ phụ, breadcrumb, giá gạch |
| muted / sand | 6.81 | chữ phụ trên sand |
| muted-light / background | 5.33 | placeholder, viền input |
| accent-foreground / accent | 5.01 | nút primary, tag |
| accent / background | 5.01 | eyebrow, focus ring |
| accent / background-alt | 4.55 | eyebrow trên alt |
| accent-on-sand (#B73C0F) / sand | 4.62 | eyebrow trên sand |
| sale-foreground / sale | 6.38 | badge sale; giá sale, lỗi trên nền sáng |
| badge-new-foreground / badge-new | 4.57 | badge New, toast success |
| background-dark-foreground / dark | 17.4 | chữ header, footer |
| menu trắng 60% (#A3A3A3) / dark | 6.93 | menu header (Figma) |
| muted-on-dark / dark | 6.11 | eyebrow tối, link footer, placeholder, viền input tối |
| muted-on-dark / panel footer (#1F1F1F) | 5.78 | link, trust trong panel |
| background-dark-foreground / panel | 11.4 | chữ chính, tổng trên mọi panel tối |
| `--panel-muted` (L 0.553) / panel (#393942, L 0.042) | 6.56 | chữ phụ panel tối |
| `--panel-saving` (#A5C0A6) / panel | 5.82 | giảm giá panel tối (badge-new #4B824D theo Figma, V01) |
| muted / border (nút disabled) | 6.70 | chữ nút disabled |
| accent / dark | 3.48 | chỉ chữ lớn ("Get 15% Off"), focus không dùng |
| sale / dark | 2.73 | KHÔNG dùng cho chữ; lỗi trên nền tối dùng chữ trắng + icon đỏ |
| border / background | 1.26 | chỉ trang trí |

### 2.1 Role trạng thái (sổ 21/11, foundations-07; màn `h-color` nhóm "Status")

Alias trỏ về token sẵn có: không setting, không giá trị màu mới. Đổi `badge_new_color`, `sale_color`, `accent_color` thì role đổi theo.

| Role | Alias | Trỏ về | Tương phản | Dùng cho |
| --- | --- | --- | --- | --- |
| Success | `--color-success`, `--color-success-foreground` | `--color-badge-new` #4B824D, `--color-badge-new-foreground` | chữ trắng trên nền 4.57; icon, viền trên trắng 4.57 | toast success, form message success, status icon, meter đạt |
| Warning | `--color-warning`, `--color-warning-foreground` | `--color-accent` #C8400E, `--color-accent-foreground` | chữ trắng trên nền 5.01; icon, viền trên trắng 5.01 | toast warning, form message warning |
| Critical | `--color-critical`, `--color-critical-foreground` | `--color-sale` #BD1616, `--color-sale-foreground` | chữ trắng trên nền 6.38; chữ lỗi trên trắng 6.38 | toast error, form message error, alert, `.field__error`, `.variant-option__error`, viền `aria-invalid` (ô nhập, checkbox / radio, quantity, ô footer, ô on-dark) |

- Info không có alias: dùng `--color-muted` (8.45).
- Role trạng thái chỉ cho thông báo. Badge (-N%, New), giá sale, nút, chấm tồn kho, `--panel-saving` vẫn đọc token gốc.
- Chữ nội dung thông báo giữ foreground; màu role nằm ở thanh, viền, icon và luôn kèm icon + chữ (màu không là tín hiệu duy nhất).
- Trên nền tối: chữ lỗi trắng + icon critical (sale trên dark 2.73, §4).

### 2.2 Color scheme × role (sổ 21/11, foundations-15; màn `h-dark` "12b. Color Schemes And Roles", chi tiết panel ở `h-panel`)

6 nền là 6 scheme dùng chung một bộ role. Component đọc role theo ngữ cảnh (`.section--*`, `.on-dark`, `.dpanel`), không tự đặt màu. Hiện chỉ là tài liệu: chưa có setting `color_scheme`, giá trị màu không đổi. Tên token bỏ tiền tố `--color-`; số = tương phản với nền của scheme (WCAG).

| Scheme (class) | Background | Text | Text subdued | Border | Focus | Link |
| --- | --- | --- | --- | --- | --- | --- |
| Light (`body`) | `background` #FFFFFF | `foreground` 17.4 | `muted` 8.45; `muted-light` 5.33 | `border` 1.26 trang trí; viền ô nhập `muted-light` 5.33 | `accent` 5.01 | foreground gạch chân 17.4; hover `accent` 5.01 |
| Alt (`.section--alt`) | `background-alt` #F4F4F5 | `background-alt-foreground` 15.8 | `muted` 7.69; `muted-light` 4.85 | `border` 1.15 trang trí | `accent` 4.55 | foreground gạch chân 15.8; hover `accent` 4.55 |
| Cream (`.section--cream`) | `background-cream` #F5F5F1 | `background-cream-foreground` 15.9 | `muted` 7.73; `muted-light` 4.88 | `border` 1.15 trang trí | `accent` 4.58 | foreground gạch chân 15.9; hover `accent` 4.58 |
| Sand (`.section--sand`) | `background-sand` #EBE6E0 | `background-sand-foreground` 14.0 | `muted` 6.81; KHÔNG `muted-light` (4.30) | `border` 1.02 trang trí | `accent` 4.03 | foreground gạch chân 14.0; eyebrow `accent-on-sand` 4.62; hover `accent` 4.03 (dưới 4.5, còn mở) |
| Dark (`.section--dark`, `.on-dark`) | `background-dark` #1A1A1A + noise | `background-dark-foreground` 17.4 | `muted-on-dark` 6.11 | trắng 12% trang trí; viền ô nhập `muted-on-dark` 6.11 | trắng 17.4; KHÔNG `accent` (3.48) | trắng gạch chân 17.4; hover gạch 2px, không đổi màu |
| Panel (`.dpanel`) | `background-panel` #393942 | `background-dark-foreground` 11.4 | `--panel-muted` 6.56; KHÔNG `muted-on-dark` (4.01) | `muted` 1.35 trang trí (vạch tổng) | trắng 11.4 | trắng gạch chân 11.4; giảm giá `--panel-saving` 5.82 |

- Không mang chữ phụ của scheme này sang scheme khác (`muted-light` trên sand, `muted-on-dark` trên panel); không focus accent trên nền tối.
- Focus chỉ cần 3:1 (WCAG 1.4.11): accent trên sand 4.03 đạt. Link hover accent trên sand 4.03 dưới 4.5 cho chữ thường: còn mở, đề xuất dùng `--color-accent-on-sand` (4.62, token sẵn có) cho hover link trên sand, chờ CTO.

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
- Chữ 14/20, link `--color-muted` (8.45), mục cuối foreground 500, dấu `--color-muted-light`. Link cao 44. Padding trên 16 → 24 từ 64rem (header tối phía trên, breadcrumb trên nền trắng). LUÔN 1 dòng (`nowrap`, V20): mục cuối co lại (`min-width: 0`) và cắt "…", tối đa 48ch từ 64rem; < 48rem mục giữa cũng cắt ở 10ch; không dòng nào bắt đầu bằng "/".
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
| Tertiary (V23) | như primary | nền alt, viền 1px muted-light (4.85), chữ foreground; hover đảo đen; disabled = nền border, không viền đậm | `.button--tertiary` (kit) | thay nút "View Detail" nền xám (Figma 1:816) |
| Small (V40) | cao 44 mọi mốc, padding 16, 14/600, icon 16 | theo primary/secondary/tertiary | `.button--small` (kit) | card, gợi ý giỏ, lỗi inline "Try Again", accelerated drawer |
| Icon + nhãn (V58) | icon 20 trước chữ cách 8 | theo biến thể | `.button__icon` (kit) | Send Message, Notify Me, Copy Code |
| Chỉ icon | vuông bằng control (44 khi small), `aria-label` | theo biến thể | `.button--icon-only` (kit) | submit tìm kiếm < 48rem |
| Secondary trên nền tối (V58) | như secondary | viền + chữ trắng; hover nền trắng chữ dark; focus trắng; disabled viền trắng 30% chữ muted-on-dark | `.button--on-dark`, `.on-dark .button--secondary` (kit) | password, gift card, panel tối |
| Text link | inline, gạch chân 1px offset 0.2em | inherit, hover accent | `.text-link` | 06 §6, `link-in-text-block` |
| Link đầu section (V29) | 16/600 gạch chân + mũi tên 16 × 14 | inherit, hover mũi tên dịch 4 | `.section-link` (kit) | "Browse All Setups" |
| Chevron tròn 52 (prev/next) | 52 × 52, chevron 11 × 16 giữa (`slideshow-icon` previous/next), 2 nút cách 8 | nền trắng, viền `--color-border`, icon foreground; hover nền accent, icon trắng; trên nền tối viền trắng (không thấy viền, như Figma) | `.carousel-nav__button`, `.collection-list__button`, `.slideshow__arrow` | Sổ 09/11, Figma 1:398 |
| Đóng 48 | tròn 48, icon 20 | trắng viền border; hover nền foreground | `.quiz__dialog-close` | 15 §1 |
| Icon header | ô 44, icon 20/24 | trắng | `.site-header__icon` | Figma 1:373 |
| Back (drawer) | cao 44, icon 16, chữ 14 muted | nhỏ, nhạt hơn × | — (ĐỀ XUẤT) | 14 §3 |

Trạng thái (Figma không có; code + ĐỀ XUẤT 05 §3):
- Hover < 200ms: primary `color-mix(accent 88%, foreground)` + nhấc 1px + bóng; secondary đảo nền foreground; chevron cam + scale 1.06.
- Active: scale 0.98 (tròn 0.94). Focus: outline 2px accent offset 2 (tròn 3), chỉ `:focus-visible`; trên nền tối outline trắng.
- Disabled: LUÔN là cặp màu riêng, không dùng opacity (sổ 21/11, foundations-12). Nút: nền `--color-border`, chữ `--color-muted` (6.70), `cursor: not-allowed`. Chevron tròn 52 ở đầu/cuối hàng và phân trang: `aria-disabled`, viền `--color-border`, icon `--color-muted-light` (5.33 trên trắng), nền giữ, không hover, không scale, `cursor: not-allowed` (icon tắt so với icon bật 3.27:1); trên nền tối (`.section--dark`, `.on-dark`): nền trong suốt, viền + icon `--color-muted-on-dark` (6.11), vì nút bật ở đó là đĩa trắng; nút vẫn giữ chỗ (0 CLS). Tab, chip disabled: chữ muted-light, viền border. Ô màu lọc disabled: §30.6. Ảnh sản phẩm hết hàng 0.6 (§9) là ảnh, không phải control, giữ.
- Loading: `aria-busy="true"`, chữ trong suốt, spinner 20 (trắng trên primary, foreground trên secondary/tertiary), giữ bề rộng, chữ ẩn "Adding".
- Mọi biến thể đủ 6 ô có nhãn trên foundation.html §9 (V09). Tab có thêm focus và disabled (nền trắng, chữ muted-light).
- Sold out: primary disabled, chữ "Sold out".

Quy tắc: 1 primary mỗi section, ≤ 5 mỗi trang (04 §1); nhãn 2–4 từ Title Case mở bằng động từ ("Add To Cart", sổ 07/11), áp cho mọi `<button>` và link dạng nút (kể cả nút đóng có chữ, nút "+N"/thu gọn, nút thử lại): "Keep Shopping", "Show Fewer", "Try Again", "Continue Shopping". Text link trong câu, link menu, link chính sách giữ chữ theo dữ liệu ("Shipping policy"). Nhãn đang lệch: "Keep shopping" (marketing-popups §3), "Show fewer" (mini-cart-quickview §3.1), "Try again" (product §5.1 J3): sửa theo §24 đề xuất trỏ; hai nút cách 16, mobile xếp dọc cách 12–20. Ngoại lệ Title Case (sổ 21/11, components-11): Polaris dùng sentence case cho nhãn nút ("Add menu item"); Efitco giữ Title Case theo Figma và sổ 07/11 là ngoại lệ thương hiệu đã chốt, không đổi; phần còn lại của chuẩn đã theo (mở bằng động từ, không mạo từ thừa, không dấu câu). `<button>` cho hành động, `<a href>` cho điều hướng; nút icon có `aria-label`.

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

Ngoại lệ accent (sổ 21/11, components-12): tag bài viết `.badge--tag` (Figma 1:1022) giữ nền accent dù accent chỉ mang nghĩa hành động và Polaris không dùng màu để chỉ danh mục; cùng nhóm ngoại lệ với eyebrow (sổ 09/11) và toast warning (sổ 09/11). Badge danh mục khác không dùng accent. Chú thích cùng nội dung ở màn `h-badge`.

Pill cao 28, padding 12, 13/600, bo pill. Ưu tiên góc: Sold out > -N% > New. Biến thể viền trên nền tối `.badge--outline` chỉ cho gift card ("Gift card", "Expired", V63). Không badge có chấm, cao 30, chữ 14 (V33: dùng badge tag chuẩn).

Sold out một quy tắc (V67): card/dòng có ảnh = badge Sold out + ảnh 0.6; dòng không ảnh (gợi ý chữ) = "· Sold out" 14 muted sau giá; nút = primary disabled nhãn "Sold Out"; dòng tồn = chấm muted + "Sold out" (`.stock-line--out`). Rating có chữ ẩn "out of 5 stars". Code `.product-card__badge`, `.product-card__rating`, `.article-card__tag`.

## 9. Card sản phẩm

Figma 1:502 (component 1:213). Snippet `product-card`. Dữ liệu động (sổ 07/11).

Anatomy: media 1:1 nền cream bo 12, KHÔNG viền, ảnh `contain` + `mix-blend-mode: darken` · hàng badge padding 16 (8 dưới 64rem), trái badge, phải rating · tiêu đề Inter 16/500 lh 26 ls −0.01em · giá (sale đỏ 16/500 + giá gạch 14 muted, cách 8) · swatch.
- Khoảng: media → tiêu đề 8, tiêu đề → giá 4, giá → swatch 8; swatch 32 × 16 bo 8, cách 4.
- Kích thước: 152 / 232 / 292 / 336.
- Hover: card nhấc 4px, ảnh scale 1.04 (hoặc ảnh 2), tiêu đề gạch chân. Focus (V12): vòng accent 2 offset 8 quanh cả card (`:has(a:focus-visible)`), không outline trên chữ tiêu đề.
- Swatch card (V22, V43): không có trạng thái chọn (không viền accent); ≤ 4 màu hiện hết, > 4 màu hiện 3 + "+N" (`.swatch-more`, VP2). Ảnh luôn `contain` trong khung bo 12 kể cả ảnh ngang (V49).
- ĐỀ XUẤT swatch (câu CTO 2): swatch trên card là chỉ báo, `aria-hidden`, không bấm, không focus; tên link đọc thêm ", 3 colors". Lý do: Figma swatch 32 × 16 cách 4 không thể thành vùng chạm 44 trên mobile (sổ 09/11) mà không phá bố cục; chọn màu ở trang sản phẩm / quickview. Desktop rê chuột lên swatch đổi ảnh card là tăng cường, không bắt buộc.
- Hết hàng: badge Sold out, ảnh opacity 0.6 (05 §3), giá giữ. Không ảnh: placeholder SVG `--color-muted-light` trên cream. Tên dài: hiện đủ, xuống dòng, không cắt (yêu cầu Shopify §7, 11/11): product.title not truncated; card cùng hàng căn đỉnh, giá theo ngay dưới tên. Đang tải: §18.

A11y + Lighthouse: một link (tiêu đề, `::after` phủ card), ảnh alt = alt Shopify hoặc tên sản phẩm, `<img>` có width/height, chỉ hàng đầu collection không banner được eager, giá có chữ ẩn "Sale price"/"Regular price".

## 10. Card bài viết

Figma 1:1022. Code `.article-card`. Ảnh 3/4 phủ kín bo 16 (`--radius-panel`) · gradient tối 50% → đáy · tag accent phải trên cách 12 · tiêu đề Inter 700 18/28 trắng hiện đủ, không cắt (yêu cầu Shopify §7, 11/11) · meta 14/500.
- Hover: nhấc 6px + bóng, ảnh scale 1.04, tiêu đề gạch chân. Focus outline accent offset 2 (trắng trên nền tối). Không ảnh: `.article-card--no-image`, nền dark (17.4), không gradient.
- ĐỀ XUẤT: gradient bắt đầu 50% (code 63.72%) để tiêu đề 3 dòng luôn trên vùng tối (06; 14 #290D). Ảnh `alt=""`, tên đọc từ tiêu đề.

## 11. Hàng ngang + thanh tiến trình

Sổ 09/11: next/back ở đầu khối, thanh tiến trình mảnh, không thanh cuộn trình duyệt, mobile ẩn nút và vuốt.
- Header khối `1fr auto`, nút căn đáy với tiêu đề, cách 8 (Figma 1:395).
- Track `scroll-snap-type: x mandatory`, lộ card kế (15 §5).
- Thanh tiến trình cao 4 bo pill (Figma 1:359 "Line" h 4, V06), cách hàng 32, nền border, thumb foreground; trên nền tối nền trắng 12% + thumb trắng. `aria-hidden`.
- Trên nền tối (Figma 1:395 "Browse Categories" nằm trên dải #1A1A1A): eyebrow xám, chevron trắng, hover cam.
- Không JS: hàng vẫn cuộn tay (`scroll-buttons:not([data-enhanced])`). Code `scroll-buttons`, `.carousel-nav`, `.carousel-progress`.

## 12. Input và form lỗi

Figma chỉ có input footer 1:1104; còn lại ĐỀ XUẤT theo 04 §5, 05 §4–5.
- Label 14/600 phía trên cách 8 · `*` đỏ + `required` · input/select/textarea · gợi ý 14 muted · lỗi 14/500 `--color-critical` + icon 16.
- Input cao CỐ ĐỊNH `--control-height` (`block-size`, V11), padding 16, bo `--radius-input`, chữ 16/400. Lưới form `align-content: start` để ô cạnh ô lỗi không cao lên. Compact 44 `.field__input--compact` (ô tìm nước, khoảng giá). Textarea 144; compact 96 chỉ ghi chú đơn mini cart (V50, V70). Select có chevron; mở = listbox §30.10.
- Viền: nền sáng `--color-muted-light` (5.33), nền tối `--color-muted-on-dark` (6.11) (sổ 09/11). Hover foreground (tối: trắng). Focus viền accent + outline 2px offset −1 (tối: trắng).
- Lỗi: hiện khi rời trường hoặc submit; viền `--color-critical` 2px; câu nói cách sửa; `aria-invalid` + `aria-describedby`; tóm tắt đầu form `role="alert"` + focus trường lỗi đầu. Trên nền tối chữ lỗi trắng (§4).
- Disabled: nền alt, viền border, chữ muted-light. Thành công: hộp viền trái 4px `--color-success` + icon, `role="status"`. Cảnh báo (đã tự chỉnh, vd số lượng bị đổi): `.form-message--warning`, thanh + icon `--color-warning`, chữ foreground.
- Checkbox/radio 20, cả nhãn bấm, hàng 44, `accent-color: var(--color-accent)`; trạng thái: chưa chọn, chọn, focus, disabled (chữ muted-light), lỗi (viền `--color-critical` + câu lỗi) (V10). Form 2 cột từ 48rem, cách 24.
- Select nhãn nổi 12px trong ô (collection/search "Sort by") không thuộc DS (V47): nhãn 14 trên ô hoặc ẩn trực quan.

Lighthouse: `<label for>` thật, `autocomplete`, không chặn dán, không placeholder thay label, nút không ghi "Submit".

## 13. Accordion

Figma 1:1057: icon +/− 24 bên trái, cùng màu chữ câu hỏi (mục đóng `--color-muted` 8.45 trên trắng, 7.73 trên cream; mục mở `--color-foreground`), KHÔNG cam; gạch 1px border; câu hỏi 18/600 (16 dưới 80rem). Figma thắng 15 §6 (icon phải). Icon đổi + → − khi mở, không xoay. ĐỀ XUẤT (05 §3, Figma không có hover): hover câu đóng thì chữ và icon foreground; focus outline accent quanh summary. `<details>/<summary>`, mở sẵn mục đầu, cho mở nhiều mục; hàng ≥ 56; nội dung thụt 40, chữ muted; `--motion-accordion`. Không giấu phí ship, điều kiện KM. Code `.faq-item`, `.site-footer__disclosure`.

## 14. Dropdown và mega menu

Figma chỉ có chevron Shop, Collection (1:362). ĐỀ XUẤT theo 14 §1, 05 §2. Chỉ từ 80rem (menu ngang chỉ có từ 80rem; < 80rem dùng drawer §15).
- Header giữ tối khi mở; mục đang mở trắng 100%, chevron xoay; trang hiện tại vẫn gạch chân. Thay nội dung "header chuyển trắng khi mở" trong `docs/ui-spec/navigation.md` (ES1-T260) cho khớp sổ 10/11.
- Dropdown (Collection): panel trắng, viền border, bo 12, bóng raised, rộng ≥ 224, link 44 padding 24, hover chữ accent. Code `.site-header__submenu`.
- Mega (Shop): full bề ngang ngay dưới header (top 80), nền trắng, padding 40; 2–3 cột link cao 44 (`--touch-target`, trước 40; sổ 21/11) (tiêu đề 14/600 uppercase muted) + 1 ô ảnh (lazy, tải khi mở, sổ 09/11). Link đầu cột "View all products". Scrim 50% phía dưới.
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

- Cart drawer (G3, V13): header "Your Cart" + pill số món + ×; chân là panel tối nổi `.overlay__footer--panel` (lùi 16, bo 16, padding 20, `--panel-muted`, `--panel-saving`): Subtotal, giảm giá, Total, Checkout, link "View Cart". Menu drawer: chân là hàng localization gộp (LC1) + "Sign In" secondary có icon.
- Header drawer 72 (tiêu đề heading 22–28, × 48 cách mép 12) · body cuộn riêng (`overscroll-behavior: contain`) · footer dính đáy (nút chính full width) · scrim `--overlay-scrim`. Nền drawer trắng (header trang tối không lặp vào drawer).
- Cao toàn màn; mobile 90% để chạm scrim đóng. Cấp 2 trượt ngang, Back nhỏ hơn × (14 §3).
- Mở `--motion-base` 250 `--ease-out`, đóng `--motion-fast` 150 (sổ 21/11, §19: thời lượng theo token); chỉ transform + opacity. Đóng: ×, Escape, scrim; trả focus.
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`; mở thì focus vào tiêu đề drawer (đích `aria-labelledby`), không vào × (CTO 17/11, ADR 0007 #5); ngoại lệ drawer Search: focus ô tìm (predictive-search §4, SRS TE-8 AC9); khoá cuộn. Không JS: menu `<details>`, cart link `routes.cart_url`. Ảnh trong drawer lazy, có width/height.

## 16. Dialog và bottom sheet

15 §1–2, sổ 09/11 (quiz popup, mobile bottom sheet); code `.quiz__dialog`.

| Cỡ | ≥ 768 | < 768 |
| --- | --- | --- |
| S (xác nhận, chọn variant) | 480 | bottom sheet |
| M (quick view, ask a question) | 720 | bottom sheet |
| M-wide (quick view từ 80rem, V69) | 960 | bottom sheet |
| L (kết quả quiz, lightbox) | 1120 | bottom sheet |

- ≥ 768: giữa màn, bo 20 (`--radius-dialog`, Figma Radius/20, V04), padding 32 (48 từ 1280), cao ≤ `min(860, 100dvh − 48)`, × 48 cách góc 24.
- < 768: dính đáy, rộng 100%, cao ≤ 88dvh, bo 2 góc trên, thanh kéo 40 × 4, × cách góc 12, vuốt xuống đóng; nút xếp dọc, chính dưới cùng.
- Tiêu đề h2 heading 800 (28–40), chừa chỗ ×; popup marketing dùng Sofia 700 theo Figma 1:1148 (marketing-popups). Popup marketing < 50 từ. Hàng nút phải, cách 32, gạch trên. Thứ tự (V66): secondary rồi primary (primary cuối, bên phải); < 768 xếp dọc, primary trên (DOM giữ secondary trước, `column-reverse`). Popup marketing dùng text link thay secondary cho nút từ chối ("No Thanks", "Keep Shopping"), không confirmshaming. Tiêu đề Title Case; UPPER (`.dialog__title--caps`) chỉ popup marketing theo Figma 1:1146 (V75). Icon trạng thái tròn 72, icon 32 (`.status-icon`), như empty state.
- Motion: mở `--motion-base` 250 fade + nhấc 24 + scale 0.97; đóng `--motion-fast` 150; mobile trượt từ đáy (sổ 21/11, §19: thời lượng theo token).
- Quy tắc: một lớp một lúc, hàng đợi: popup đang hiện đóng thì popup kế mới hiện, nghỉ 3 s giữa hai popup tự mở (sổ 10/11 MK3, MK4); thẻ big offer đang mở thì popup tự mở chờ (MK5); mỗi popup tự mở tối đa 1 lần/phiên, cộng số ngày theo setting (không phải "1 popup/phiên" cho cả theme); không mở lúc tải trang (chờ thời gian/cuộn/ý định rời, sổ 09/11); không ở 404; không confirmshaming (15 §1). Chi tiết hàng đợi: marketing-popups.md §1.2; thứ tự lớp và vùng đáy: layers.md (§23).
- Ngoại lệ popup marketing (sổ 10/11 MK1, MK3, MK4; ghi nhận 21/11, components-07): nguyên tắc chuẩn (Polaris, Carbon) là modal chỉ mở do người dùng. Ba popup marketing (newsletter, before you leave, big offer) mặc định bật và TỰ MỞ: đây là ngoại lệ đã chốt, không đảo. Rào bắt buộc: không mở lúc tải trang; mỗi lúc 1 popup (hàng đợi); nghỉ 3 s giữa hai popup tự mở; mỗi popup tự mở tối đa 1 lần / phiên; không ở 404; không confirmshaming. Mọi dialog khác (quick view, xác nhận, chọn variant, quiz, pickup) chỉ mở sau thao tác người dùng; không thêm popup tự mở thứ tư. Chú thích cùng nội dung ở màn `h-dialog`.
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`, Escape; mở thì focus vào tiêu đề (đích `aria-labelledby`), không vào × hay phần tử đầu (CTO 17/11, ADR 0007 #5; SRS TE-10 AC12); trả focus.

## 17. Toast

Sổ 09/11 đã chốt màu và 4 loại; sổ 21/11 (components-06, foundations-07) thêm quy tắc chọn mẫu, giới hạn tiêu đề, và đổi sang alias trạng thái (giá trị màu giữ). Vị trí: mobile đáy cách 16 full width; ≥ 768 góc dưới inline-end cách 24, rộng 400; `position: fixed` (0 CLS). Thanh màu 4px · icon 20 · tiêu đề 16/600 + mô tả 14 · nút đóng 44 có tên riêng ("Dismiss: Added to cart"). Nền trắng, viền border, bóng raised.

| Loại | Thanh + icon | Icon | role | Tự ẩn |
| --- | --- | --- | --- | --- |
| info | `--color-muted` | i | status | 6s, dừng khi hover/focus |
| success | `--color-success` (= badge-new) | check | status | 6s, dừng khi hover/focus |
| warning | `--color-warning` (= accent) | tam giác ! | alert | không, đóng tay |
| error | `--color-critical` (= sale) | ! tròn | alert | không, đóng tay |

Màu chỉ là tín hiệu phụ, loại đọc từ icon + chữ. Tối đa 3 toast chồng.

Chọn mẫu thông báo (sổ 21/11; màn `h-toast` bảng "Chọn mẫu thông báo"):

| Tình huống | Mẫu | Ví dụ |
| --- | --- | --- |
| Xác nhận ngắn sau thao tác thành công, tin trung tính | toast success / info, `role="status"`, tự ẩn 6s | "Added to cart", "Link copied", "Filters updated" |
| Lỗi tại chỗ: trường sai, submit form, 422 thêm giỏ, khối không tải được | `.field__error`; `.form-message--error` (thêm `--inline` dưới nút / dòng); `.alert` | "Enter an email like name@example.com." |
| Cảnh báo tại chỗ: số lượng bị đổi, gần hết hàng | `.form-message--warning` (thêm `--inline` trong dòng giỏ) | "Quantity changed to 2. Only 2 left." |
| Thao tác nền ngoài tầm nhìn thất bại hoặc cần lưu ý (mất kết nối, đồng bộ giỏ, thêm giỏ từ thanh dính khi form khuất) | toast error / warning, `role="alert"`, đóng tay | "Connection lost", "Price updated" |

- Toast error / warning KHÔNG dùng cho lỗi trường, lỗi submit hay 422 ngay tại nút: các ca đó theo §18 "Chọn component lỗi" (V45).
- Giới hạn độ dài: tiêu đề toast success ≤ 3 từ VÀ ≤ 24 ký tự (1 dòng ở 360); mô tả mọi toast ≤ 2 dòng. Đạt: "Added to cart" (13), "Discount applied" (16), "Link copied" (11). Không đạt: "Your item has been added to the cart successfully" (9 từ, 49 ký tự). Chi tiết (tên sản phẩm, giá) đặt ở dòng mô tả.
- ĐỀ XUẤT (chờ CTO, chưa chốt; hướng dẫn nội dung patterns-08 quyết): tiêu đề toast là câu trạng thái nên viết sentence case ("Added to cart"), không phải nhãn nút Title Case (§6).

## 18. Trạng thái rỗng, lỗi, đang tải

ĐỀ XUẤT (Figma không có; 05 §6–7, 14 #928M).
- Đang tải: skeleton `--color-background-alt` đúng kích thước nội dung (card: media 1:1 + 2 dòng 14, dòng 2 rộng 40%), shimmer 1 vòng `--motion-hero` (1400) `linear`, tĩnh khi giảm chuyển động; vùng đổi `aria-busy` + `role="status"` + spinner 24. Không làm mờ chữ (Lighthouse color-contrast tính opacity).
- Rỗng (V54), một component 3 biến thể: `.empty-state` trong trang (không khung: blog không bài, search S6), `--framed` trong khung viền bo 12 (giỏ trống, lọc rỗng), `--compact` cho panel hẹp (popup tìm, drawer: căn trái, icon 24 inline, tiêu đề 16/600, nền alt bo 12). Slot phụ `.empty-state__slot` cho chip gợi ý / link danh mục. Không dùng bo 24 nền alt cho panel trong trang (V59). Bản giữa: ≤ 512, icon 32 trong tròn 72 nền alt · h2/h3 rõ ("Your Cart Is Empty") · 1 câu gợi ý · primary cụ thể ("Shop Bestsellers") + text link phụ. Search không kết quả thêm gợi ý (05 §7).
- Lỗi khối: viền 1px `--color-critical`, bo 12, icon 24 `--color-critical`, tiêu đề 16/600, câu xử lý 14 muted, small secondary "Try Again", `role="alert"`.
- Chọn component lỗi (V45): trường sai → `.field__error`; submit form → `.form-message--error` đầu form; hành động tại chỗ thất bại (422 thêm giỏ PDP/quick view, cập nhật dòng giỏ cart/mini cart) → `.form-message--error.form-message--inline` ngay dưới nút/dòng, `role="alert"`, cùng một kiểu ở PDP và cart; khối không tải được → `.alert`; cảnh báo tại chỗ (số lượng bị đổi) → `.form-message--warning`; thao tác nền ngoài tầm nhìn → toast error / warning (chỉ ca này, §17).
- Spinner 24 mặc định (V61); 20 trong nút; 12 (`.spinner--xs`) chỉ dòng tồn variant picker. Một vòng quay = `var(--motion-hero)` 1400 `linear` cho cả spinner rời và spinner trong nút (khớp `spinner-turn` của theme). Trường: §12. Thao tác nền: toast error. 404: không popup, có search + link trang chủ (TE-9 AC2).

## 19. Motion

Đủ 8 duration + 3 easing, khớp `snippets/css-variables.liquid` (sổ 21/11, foundations-11; màn `h-motion`). Component không viết thời lượng bằng số; giá trị `0.01ms` trong khối `prefers-reduced-motion` là giá trị tắt, không phải token.

| Token | ms | Vai trò |
| --- | --- | --- |
| `--motion-stagger` | 60 | độ lệch giữa các phần tử vào nối tiếp (× thứ tự): dòng chữ hero, card reveal |
| `--motion-fast` | 150 | hover màu, ra (exit) |
| `--motion-base` | 250 | drawer, dropdown, toast, chevron |
| `--motion-accordion` | 350 | accordion, facet mở / đóng |
| `--motion-enter` | 400 | chữ hero vào (HA1 11/11), phần tử vào lần đầu |
| `--motion-slow` | 500 | card nhấc, ảnh scale, meter |
| `--motion-reveal` | 900 | hiện dần khi cuộn tới, lệch `--motion-stagger` 60 mỗi card · ngoại lệ |
| `--motion-hero` | 1400 | vòng lặp tải: 1 vòng spinner, 1 vòng shimmer skeleton · ngoại lệ |

| Easing | Curve | Vai trò |
| --- | --- | --- |
| `--ease-out` | cubic-bezier(0.22, 1, 0.36, 1) | tương tác người dùng: hover, nhấn, mở drawer / dropdown / toast |
| `--ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1) | chuyển do hệ thống, đổi kích thước: accordion, facet, meter |
| `--ease-expo` | cubic-bezier(0.16, 1, 0.3, 1) | vào màn nhấn mạnh: reveal khi cuộn, dialog, hero |
| `linear` | từ khoá CSS, không phải token | chỉ vòng lặp tải: spinner, shimmer |

Ngoại lệ (sổ 09/11, 21/11): `--motion-reveal` 900 và `--motion-hero` 1400 vượt khung 500ms của Polaris, GIỮ. Chỉ dùng cho hiện dần khi cuộn và vòng lặp tải; phản hồi thao tác người dùng luôn ≤ 500.

Mọi số trong bảng là giá trị của một trong 8 token (fast 150, base 250, accordion 350, reveal 900, stagger 60).

| Thành phần | Vào | Ra | Thuộc tính |
| --- | --- | --- | --- |
| Hover nút, link, tab, menu header | fast 150 – base 250 | fast 150 – base 250 | màu, translate, scale |
| Dropdown / mega | base 250 drop 8px | fast 150 | opacity, translate |
| Drawer | base 250 | fast 150 | translate, scrim opacity |
| Dialog | base 250 | fast 150 | opacity, translate, scale |
| Bottom sheet | base 250 từ đáy | fast 150 | translate |
| Accordion | accordion 350 | accordion 350 | block-size, opacity |
| Toast | base 250 lên 8px | fast 150 | opacity, translate |
| Bóng header khi cuộn | base 250 | base 250 | box-shadow (1 phần tử, không layout) |
| Reveal khi cuộn | reveal 900, lệch stagger 60 mỗi card | không lặp | opacity, translate, clip-path |

Quy về token ở lượt soát ES1-T535 (foundations-11 "thay literal bằng token"): ra 200 → fast 150; dialog / bottom sheet vào 300 → base 250; lệch reveal 80 → stagger 60. Không thêm token.

Chỉ transform / opacity / clip-path (sổ 09/11); reveal 1 lần, chỉ tiêu đề, card, ảnh chính, CTA; `prefers-reduced-motion: reduce` tắt hết. Reveal 900 và accordion 350 dài hơn 15 §3/§6: theo token và quyết định CTO 09/11, giữ.

## 20. Ràng buộc Lighthouse

Chỉ tiêu (sổ 09/11, phạm vi theo sổ 10/11 BGĐ): A11y 100 desktop và mobile ở mọi trang; Performance desktop ≥ 98, mobile ≥ 90 ở mọi trang; SEO 100 đo ở trang chủ, collection, sản phẩm, blog, bài viết, page (cart, search, account, 404, password, gift card không tính SEO vì Shopify chặn index hoặc trả 404/401, nhưng vẫn giữ quy tắc SEO dưới đây); Best Practices 100 do DevOps/QA đo, tách phần theme và phần nền tảng, ngoài phạm vi Designer (thiết kế vẫn giữ các quy tắc BP dưới đây).
- A11y: tương phản theo §2 (không dùng border, accent trên dark, sale trên dark cho chữ nhỏ); mọi nút/link icon có tên riêng; mọi trường có label; một `<main>`, một h1, heading không nhảy bậc (tiêu đề cột menu/footer không dùng `<h*>` nếu lệch bậc); danh sách `<ul>/<ol>`; tablist đủ; dialog có tên; link trong đoạn văn gạch chân; vùng chạm ≥ 24, control mobile ≥ 44, 6 nhóm chính 44 mọi mốc (§1.3); disabled không dùng opacity (§6); swatch card `aria-hidden` (không có control 16px); skip link; không thuộc tính ARIA trên phần tử không role.
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
| Phân trang | `docs/ui-spec/pagination.md` | snippet `pagination` chung, nút tròn 52 (§6), trang hiện tại accent, đầu/cuối giữ nút + `aria-disabled`, hiện bằng cặp màu disabled không opacity (sổ 10/11 câu 5, sổ 21/11) | T2 (A3, A4) |
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

LỊCH SỬ (ES1-T291, 11/11): số `--panel-saving` 5.64 / #A3BDA4 trong bảng dưới tính theo badge-new cũ #467A48. Từ ES1-T527 V01 badge-new = #4B824D nên `--panel-saving` = #A5C0A6, 5.82:1 (§2); cart.md, index-mobile-a.md đã sửa số theo.

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

## 27. Nút và icon có thương hiệu (yêu cầu Shopify Theme Store §4, §7, CTO 11/11)

Nguồn: https://shopify.dev/docs/storefronts/themes/store/requirements ("The branded dynamic and accelerator checkout button colors must not be modified"; Follow on Shop cùng quy tắc; payment icons full color; gift card Apple Wallet) và https://shopify.dev/docs/storefronts/themes/pricing-payments/accelerated-checkout.

| Thành phần | Ai vẽ | Theme được chỉnh | Theme KHÔNG được |
| --- | --- | --- | --- |
| Accelerated checkout PDP (`{{ form \| payment_button }}`) và cart / drawer (`content_for_additional_checkout_buttons`) | Shopify (Shop Pay tím #5A31F4, Apple Pay đen, G Pay đen, PayPal vàng…) | chỉ biến CSS chính thức: `--shopify-accelerated-checkout-button-block-size` (25–55, đề xuất 52 PDP, 48 cart, 44 drawer), `-border-radius` (= `--radius-button`), `-box-shadow` (none), `-inline-alignment`, `-row-gap`, `-button-inline-size` (cart), skeleton (`--color-background-alt`); vị trí, khoảng cách của khối bao | màu nền, màu chữ, logo, viền, filter/opacity, selector vào HTML bên trong (shadow DOM đóng) |
| Nút unbranded "Buy it now" (`.shopify-payment-button__button--unbranded`) | Shopify, không thương hiệu | được theo nút theme (`button--secondary`, product §5) | — |
| Shop Pay Installments (`{{ form \| payment_terms }}`) | Shopify (logo shop Pay tím) | vị trí, cỡ/màu chữ thường của câu | màu logo Shop Pay |
| Follow on Shop (`{{ shop \| login_button: action: 'follow' }}`) | Shopify (nút tím) | vị trí | màu nút |
| Icon thanh toán (`shop.enabled_payment_types` + `payment_type_svg_tag`) | Shopify, FULL COLOR | kích thước, khoảng cách | đơn sắc, grayscale, đổi màu (Figma vẽ chip đơn sắc: lệch Figma có chủ đích) |
| Apple Wallet (gift card, `gift-card/add-to-apple-wallet.svg \| shopify_asset_url`) | huy hiệu chính thức Apple | vị trí, cao ≥ 44 giữ tỉ lệ | màu, chữ, vẽ lại nút |

Nền tối (panel #393942, footer, drawer): đặt nút có thương hiệu nguyên màu, không viền/lớp phủ thêm. Mockup minh hoạ bằng màu thương hiệu thật (`kit.css` `.brand-btn`, `.brand-shoppay`, `.apple-wallet`, `.payment-icons .pi--*`), không vẽ nút theo màu theme, không ô nét đứt.

## 28. Rich text chung `.rte` (Shopify §8, CTO 11/11)

Một component cho mọi nội dung merchant: mô tả sản phẩm, mô tả collection, nội dung page, bài viết, block rich text. Thay §4 article.md và §5 page.md.
- Một bản duy nhất trong kit (V53): `.rte` + cột đọc `.reading-column` 720 (45rem) cho article và page. Đoạn 16, lh 1.7, `max-width: 65ch`, khoảng giữa khối 16; không tăng lên 18 ở desktop (article.md dòng 85 sửa theo).
- h2 `--font-size-h2`, h3 `--font-size-h3`, h4 Sofia 700 20/24 (`--font-size-h4`, Figma D/H5), h5 Inter 600 18, h6 Inter 600 16 uppercase ls 0.04em (6 cấp khác nhau về hình, Shopify §12); khoảng trên heading 48 (h2), 32 (h3–h6), dưới 12.
- Link: gạch chân 1px offset 0.2em, 500; hover accent.
- ul/ol thụt 24, gap 8, marker `--color-muted`.
- blockquote: viền inline-start 4px accent, chữ heading 700 cỡ h3, không nghiêng, không nền, nguồn 14/500 muted. Trích đánh giá nền sand không thuộc `.rte` (page agent dùng blockquote chuẩn).
- Ảnh full cột bo `--radius-card` (`.rte figure { margin: 0 }`, V60), chú thích 14 muted; bảng `.rte table { display: block; overflow-x: auto; }`; `hr` 1px border cách 48.

## 29. Footer: Follow on Shop (Shopify §4, CTO 11/11)

Nút `{{ shop | login_button: action: 'follow' }}` (Shopify vẽ, tím, §27) dưới hàng social media icons, căn trái, cách 16; chỉ hiện khi shop bật Shop. Không đổi màu.

## 30. Component dùng chung bổ sung (ES1-T527)

Tất cả ở `drafts/designer/_kit/kit.css` mục 13b, hình ở `drafts/designer/ES1-T251/foundation.html` (section id ghi trong ngoặc). Trang KHÔNG định nghĩa lại các selector này (V57); phép kiểm đề xuất: grep selector của kit trong `<style>` của file trang = 0.

1. Chip (V41, `h-chip`): bo 4 như component Figma "Tabs = chip lọc danh mục"; cao 44 / 40 từ 80rem; 14/500. `.chip` gợi ý (nền alt viền border), `.chip[aria-pressed=true]` chọn được (nền đen), `.chip--remove` bộ lọc đang áp (nền trắng viền đen, × 16, tên ẩn "Remove filter: Color Black"). Trạng thái default/hover/focus/selected/disabled. Bo pill chỉ dành cho variant pill.
2. Selectable option (V26, `h-selectable-option`): `.option-card` (hàng) và `.option-card--tile` (thẻ có ảnh) bọc radio/checkbox thật; chọn = viền accent 2 inset + check tròn accent 22. Quiz, bundle, shop the look dùng chung; không nền sand làm trạng thái chọn.
3. Variant picker (V39, `h-variant-picker`): theo variant-picker.md; `.variant-pill`, `.variant-swatch`, `.variant-more`, `.variant-option__error`, `.stock-line`. Dialog "Choose A Color", quiz 2F, quick view dùng đúng component này.
4. Quantity stepper (V38, `h-quantity`): `.quantity` − ô + không vạch ngăn, viền muted-light; cao control (PDP, quick view), `--compact` 44 (cart, mini cart, dòng F9). Trạng thái hover, focus, min/max disabled, loading, lỗi quantity rule.
5. Giá + rating (V08, `h-price-rating`): `.price`, `.price--lg`, `.price__from`, `.price__unit`, `.price__save`, `.rating`.
6. Facet group (V42, `h-facets`): `.facet` (details) biến thể accordion cho bộ lọc: tiêu đề 16/600, "N selected", chevron phải, hàng 52; `.facet__range` khoảng giá compact 44. Chỉ trong drawer/cột lọc. Ô màu lọc `.facet-swatch` hết kết quả (input `disabled` hoặc `.is-disabled`): gạch chéo 2px foreground viền trắng xoay −45° qua ô, ô giữ nguyên màu, nhãn hàng `.choice` muted-light (5.33), `cursor: not-allowed`; không làm mờ (sổ 21/11, foundations-12).
7. Collection card (V14, `h-collection-card`): `.collection-card` ảnh 336/220 bo 16, tên Sofia 700 28, số SP 14 muted; `--dark` (Browse Categories trên dải tối, focus trắng), `--menu` (mega, 4/3 bo 12, tên 16/600). Đủ default/hover/focus/không ảnh.
8. Link danh mục (V56): `.category-link` thẻ viền bo 12, tên 16/600, số SP 14, mũi tên; search S1/S2 và 404 dùng chung.
9. Input group + search field (V55, `h-input-group`): `.input-group`, `.search-field` (icon trái, nút xoá 44), `.input-group--attached` (email, password). Nút submit luôn primary; chữ từ 48rem, icon dưới 48rem.
10. Listbox option (V68, `h-listbox`): `.listbox__option` hàng 44, hover nền alt, active-descendant nền alt + outline accent inset, hiện tại 600 + ✓. Không viền foreground.
11. Data table (V46, `h-data-table`): `.data-table` (tiêu đề cột nền alt), `--striped` (sọc sand, Specifications), `.data-table__row--current` (cream + ✓, volume pricing).
12. Progress meter (V48, `h-progress`): `.meter-box` cream bo 16 + `.meter` cao 8 bo pill track border, fill accent, `--done` `--color-success` (= badge-new); `role="progressbar"` + câu chữ.
13. Thanh dính đáy, teaser, popover (V34, V71, `h-sticky-bar`): `.buy-bar` 72 / 80, z `--layer-bottom-bar`, `--shadow-bar`; `.teaser` pill tối 48 z 15; `.popover-card` bo 12 shadow-raised 400 z 21 (không bo 20/24).
14. Dòng sản phẩm gọn (V30): `.product-row` thumb 56 cream bo 8, tên 16/500, giá; placeholder khi thiếu ảnh.
15. Nhãn nhóm (V76): `.group-label` 14/600 UPPER muted.
16. Panel tối (V25): `.dpanel*`, `.saving` vào kit; dòng giảm giá luôn icon tag + U+2212 + nowrap.
17. Rich text, phân trang, empty state: §28, pagination.md, §18 (đã gom vào kit). `.rte table` rộng hết cột (display table, ô xuống dòng); bảng nhiều cột bọc `.table-wrap`.
18. Bổ sung vòng 2 (kit_gaps các trang, decisions.md CTO 20/11 "Vòng 2"): `.button.is-pending` (VP1, `h-button`); `.alert__actions` + nút Try Again small căn trái (`h-state`); `.dialog--s` 2 nút chia đều ≥ 768 (`h-dialog`); `.dpanel--lg` 32/40, `.dpanel__row--plain`, Total đứng đầu không gạch (`h-panel`, `h-drawer`); `.facet-swatch` tròn 24 (`h-facets`); `.data-table--fluid`, `--striped` không min-width, thụt đều khi có hàng hiện tại (`h-data-table`); `.article-card` lề 24 từ 768, meta trắng "·", `.is-hover` (`h-article`); `.field__input--on-dark`, `.search-field--on-dark`, `.search-field__submit` + spinner trong ô (`h-input-group`); `.form-message--warning` (`h-form`); `.drawer-loc` hàng localization cuối danh sách cấp 1 (`h-drawer`); `a.product-row` không gạch chân; `.variant-pill` nowrap; `.badge` không giãn trong grid; `.price--xl` PDP 28/600 (`h-price-rating`); `.sale-countdown*` vào kit (`h-countdown`); helper mockup `.site-header--static`.
19. Breadcrumb (§5): `ol` không `overflow:hidden` (cắt vòng focus); "…" do mục cuối / mục giữa tự cắt.

## 31. Elevation, lớp, motion (V15, `h-elevation-layers`, `h-motion`)

- Bóng: `--shadow-none` (card, panel trong trang), `--shadow-raised` (dropdown, popover, toast, teaser), `--shadow-overlay` (drawer, dialog, sheet), `--shadow-bar` (thanh đáy, hướng lên). Scrim `--overlay-scrim` 50% dark. Không bóng tự chế trong trang.
- Lớp: `--layer-content` 1, `--layer-sticky` 4, `--layer-bottom-bar` 5, `--layer-header` 10, `--layer-floating` 15, `--layer-scrim` 20, `--layer-overlay` 21, `--layer-toast` 30 (layers.md §1, nay là token trong kit; code theme: FE thêm vào base.css).
- Motion: §19. Figma chưa có effect style: Designer người tạo effect style theo 4 bóng trên (V15, V18).

