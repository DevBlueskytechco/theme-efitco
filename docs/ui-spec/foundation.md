KHÔNG CHẮC: không đọc được đầu ra T239–T244 trên nhánh feature/ai-ES1-T239..T244 (agent không có git), nên chỉ tổng hợp từ comment ticket T241, T244. PNG dài bị thu nhỏ khi soát, chi tiết dưới 4px chưa kiểm bằng mắt.

# UI spec: Foundation trang con (ES1-T251)

Mục đích: bộ thành phần chung để các trang con (product, collection, cart, search, blog, trang phụ, overlay; ES1-T252–T263) ghép lại, nhất quán với trang chủ Figma 1:359. Story TE-9, TE-17.

Đầu ra:
- Spec này.
- `drafts/designer/_kit/kit.css`: CSS cho mockup. Mockup trang con nhúng `<link rel="stylesheet" href="../_kit/kit.css">`, chỉ viết thêm CSS riêng của trang.
- `drafts/designer/ES1-T251/foundation.html` + `foundation-360|768|1280|1920.png`: bảng thành phần.

Thứ tự nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 > bộ kiến thức (file `NN`). Figma chỉ có desktop 1920 và không có trạng thái nào (figma-inventory). Mọi thứ không có trong Figma ghi `ĐỀ XUẤT:` kèm nguồn.

Quy ước cho Dev FE: kit.css là mockup, không chép vào `assets/`. Theme vẫn theo AGENTS.md: logical properties, 0 màu literal, `var(--*)`, breakpoint `48rem / 64rem / 80rem`. Cột "Code hiện có" chỉ class đã có trong `assets/`, dùng lại, không viết lần hai.

---

## 1. Lưới, khoảng cách, chữ theo mốc

Mobile-first. Mốc thiết kế 360 / 768 / 1280 / 1920 ứng với breakpoint code `< 48rem`, `48rem`, `80rem`, `80rem` (+ page-width chặn ở 1456). `64rem` (1024) chỉ đổi khoảng cách section.

| Giá trị | 360 | 768 | 1280 | 1920 | Token / cách tính | Nguồn |
| --- | --- | --- | --- | --- | --- | --- |
| Lề trang | 20 | 20 | 20 | 252 (do page-width) | `--page-margin` | DESIGN Page rhythm |
| Bề rộng nội dung | 320 | 728 | 1240 | 1416 | `min(--page-width − 2×margin, 100% − 2×margin)` | Figma 1:490 x=252..1668 |
| Cột / gutter | 4 / 16 | 8 / 16 | 12 / 24 | 12 / 24 | gutter `--space-4` → `--space-5` từ 80rem | 03 §1 (mobile 4 cột, gutter 12–16; desktop 12 / 24) |
| Lưới sản phẩm | 2 × 152 | 3 × 232 | 4 × 292 | 4 × 336 | cột 2 / 3 / 4; gap ngang = gutter, gap dọc 24 → 40 từ 80rem | Figma 1:490 card 336, gap 24 |
| Card bài viết (hàng ngang) | 252 × 336 | 307 × 410 | 336 × 448 | 336 × 448 | `min(70vw, 336px)` / `min(40vw, 336px)`, tỉ lệ 3/4 | base.css `.article-card`, Figma 1:1022 |
| Khoảng giữa section | 48 | 48 | 120 | 120 | `--space-7` < 64rem, `--space-8` ≥ 64rem | DESIGN (thắng 03 §8 100/60) |
| Tiêu đề section → nội dung | 24 | 24 | 40 | 40 | `--space-5`; `--space-1 × 10` từ 80rem | Figma 1:490 (2873 → 2913) |
| Eyebrow → tiêu đề | 12 | 12 | 12 | 12 | `--space-3` | Figma 1:490 itemSpacing 12 |
| Chiều cao header | 80 | 80 | 80 | 80 | `--header-height` | DESIGN |
| Chiều cao control (nút, input) | 48 | 48 | 52 | 52 | `--space-1 × 12` / `× 13` | ĐỀ XUẤT 48 mobile: 14 §2 #1083M (CTA chính ≥ 48); 52: Figma 1:1104 |
| Vùng chạm tối thiểu | 44 | 44 | 40–44 | 40–44 | icon header 44, swatch 44, link menu 44 | AGENTS a11y, 14 §2 |
| display | 48 | 70 | 100 | 100 | `--font-size-display` | clamp tính tại mốc |
| h1 (tiêu đề trang) | 33 | 43 | 48 | 48 | `--font-size-h1`, lh 58/48 | Figma 1:495 |
| h2 | 28 | 32 | 36 | 36 | `--font-size-h2` | |
| h3 | 22 | 24 | 27 | 28 | `--font-size-h3` | |
| Body / nhỏ / badge | 16 / 14 / 13 | 16 / 14 / 13 | 16 / 14 / 13 | 16 / 14 / 13 | `--font-size-base / sm / xs` | 03 §4 body ≥ 16 |

Quy tắc:
- Thứ tự nội dung giữ nguyên giữa các mốc, chỉ đổi số cột (06 §2).
- Đoạn văn dài (mô tả, bài viết) tối đa 65–75 ký tự: `max-inline-size: 65ch` (06 §7.3).
- Zoom 200% không tràn ngang: mọi hàng cuộn ngang có `overflow-x: auto` riêng, không cuộn cả trang (03, 14 #1096M).

## 2. Token dùng

Chỉ token trong `snippets/css-variables.liquid`. Không thêm token.

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt(-foreground)`, `--color-background-cream(-foreground)`, `--color-background-sand(-foreground)`, `--color-background-dark(-foreground)`, `--color-background-panel`, `--color-muted-on-dark`, `--color-accent(-foreground)`, `--color-accent-on-sand`, `--color-sale(-foreground)`, `--color-badge-new(-foreground)`, `--color-rating`.
Chữ: `--font-heading--family/weight/weight-display`, `--font-primary--family`, `--font-size-xs..wordmark`, `--line-height-body/heading`.
Khoảng cách: `--space-1..8`, `--touch-target-min`, `--page-width`, `--page-margin`, `--header-height`.
Bo góc: `--radius-input`, `--radius-button`, `--radius-card`, `--radius-hero`, `--radius-pill`.
Motion: `--motion-fast/base/slow/accordion/reveal`, `--ease-out`, `--ease-in-out`, `--ease-expo`.

Không dùng `--figma-*` cho thành phần mới: đó là alias trang chủ. Tương đương: `--figma-e5e5e5` = `--color-border`, `--figma-1a1a1a` = `--color-foreground`, `--figma-ffffff` = `--color-background`, `--figma-radius-24` = `calc(var(--radius-card) * 2)`.

Giá trị dẫn xuất (không phải token mới; viết thẳng `calc()` hoặc custom property cục bộ trong class block, như `--swatch-hit` đang có):

| Tên trong kit | Giá trị | Dùng cho |
| --- | --- | --- |
| `--section-gap` | `--space-7` → `--space-8` từ 64rem | padding-block section |
| `--heading-gap` | `--space-5` → `--space-1 × 10` từ 80rem | header section → nội dung |
| `--grid-gap` | `--space-4` → `--space-5` từ 80rem | gutter |
| `--control-height` | `--space-1 × 12` → `× 13` từ 80rem | nút, input, select |
| `--overlay-scrim` | `color-mix(--color-background-dark 50%, transparent)` | nền mờ drawer, dialog, mega menu (critical.css `.site-header__drawer[open] > summary`) |
| `--shadow-raised` | `0 8 24 color-mix(--color-foreground 12%)` | dropdown, toast |
| `--shadow-overlay` | `0 32 80 color-mix(--color-foreground 28%)` | drawer, dialog (base.css `.quiz__dialog`) |
| `--radius-dialog` | `calc(var(--radius-card) * 2)` = 24 | dialog, sheet, panel footer |

Bảng tương phản (tính tay theo WCAG, L = độ sáng tương đối):

| Cặp | Tỉ lệ | Dùng được cho |
| --- | --- | --- |
| foreground / background | 17.4 | mọi chữ |
| foreground / background-alt | 15.8 | chữ, tab chưa chọn |
| foreground / cream | 15.9 | card sản phẩm |
| muted / background | 8.45 | chữ phụ, breadcrumb, giá gạch |
| muted / sand | 6.81 | chữ phụ trên sand |
| muted-light / background | 5.33 | placeholder, dấu phân cách, viền input (ĐỀ XUẤT) |
| accent-foreground / accent | 5.01 | nút primary, tag |
| accent / background | 5.01 | eyebrow, focus ring |
| accent / background-alt | 4.55 | eyebrow trên alt |
| accent-on-sand / sand | ~4.8 | eyebrow trên sand (CTO 09/11) |
| sale-foreground / sale | 6.38 | badge sale; sale / background 6.38 cho giá, lỗi |
| badge-new-foreground / badge-new | 4.57 | badge New; thanh toast success |
| background-dark-foreground / background-dark | 16.7 | footer |
| muted-on-dark / background-dark | 5.85 | chữ phụ footer |
| background-dark-foreground / panel | 11.4 | panel |
| muted / border (nút disabled) | 6.70 | chữ nút disabled vẫn đọc được |
| accent / background-dark | 3.48 | chỉ chữ lớn (Get 15% Off) |
| border / background | 1.26 | chỉ trang trí, không làm viền nhận diện control |

## 3. Header trang con

Figma 1:362 (desktop, trong suốt đè hero). Code: `blocks/header.liquid`, `.site-header*` trong `assets/critical.css`.

Anatomy: nút menu (mobile) · logo (link về trang chủ) · menu chính 7 mục (Shop ▾, Collection ▾, Sale, Our Story, Blog, Contact, Help) · icon search · icon account · icon cart + số lượng.

Biến thể:

| Biến thể | Khi nào | Nền / chữ | Ghi chú |
| --- | --- | --- | --- |
| A. Mặc định | trang con không có ảnh lớn đầu trang (product, cart, search, page, 404, account) | `--color-background` / `--color-foreground`, viền dưới 1px `--color-border` | sticky; code đã có (critical.css `.site-header`) |
| B. Đè ảnh | template có ảnh lớn ngay đầu `<main>` (collection có banner, article có ảnh bìa) | trong suốt, chữ `--color-background-dark-foreground` | dùng lại `[data-header-overlay]`; ảnh phải có overlay ≥ 30% như hero |
| C. Đã cuộn | A hoặc B sau 80px | như A, bỏ viền, bóng `0 1 8 color-mix(foreground 12%)` | `[data-scrolled]` đã có |

Theo mốc:
- 360, 768: [menu 44] [logo 100 × 30] … [search 44][account 44][cart 44]. Account giữ trên mobile (07 §E). Menu mở drawer trái (§15).
- 1280, 1920: logo 140 trái, menu giữa (gap 56, chữ 16/500), 3 icon phải. Mục có ▾ mở dropdown/mega (§14).

Trạng thái: link hover gạch chân 1px offset 0.35em; trang hiện tại `aria-current="page"` gạch chân 2px (ĐỀ XUẤT, 04 §3.9: mục đang chọn phải rõ). Icon hover scale 1.08 (base.css). Focus: outline 2px accent offset 2. Cart count nhảy khi thêm hàng (base.css `[data-bump]`).

A11y + Lighthouse: `<header>` + `<nav aria-label>`; icon chỉ có tên qua `aria-label` ("Cart, 2 items" — số trong tên, không chỉ trong badge `aria-hidden`); vùng chạm 44; skip link "Skip to content" trước header; logo là `<a>` có tên. Header nằm trong critical.css (≤ 10 KB). Sticky bằng CSS, không đổi chiều cao khi cuộn (0 CLS).

ĐỀ XUẤT trả lời câu mở trong sổ quyết định (header trang con nền tối hay trắng): dùng A (nền trắng) làm mặc định, B cho trang có ảnh đầu trang. Lý do:
1. Figma 1:362 không có header nền tối: header trong suốt đè ảnh hero 1:363, phần tối là ảnh + overlay (figma-inventory hàng 1). Trang con không có hero thì "nền tối" là một dải màu mới, cần setting nền header mới; ticket cấm đổi token.
2. Trang chủ sau 80px cuộn đã chuyển sang nền trắng (critical.css `.site-header[data-scrolled]`). A là đúng trạng thái người mua đã thấy ở trang chủ, 0 CSS mới; logo, menu, giỏ cùng chỗ trên mọi trang (06 §4).
3. Chữ menu 17.4:1, breadcrumb và h1 nằm ngay dưới trên cùng nền trắng; không có dải tối đè lên nội dung chính (03 §6, 14 #290D).
4. Trang có ảnh lớn (B) vẫn giữ cảm giác trang chủ mà không thêm biến thể.
Bản T241 chọn một hướng, T244 hướng ngược lại (sổ quyết định); không đọc được lý do chi tiết trên nhánh.

## 4. Footer

Figma 1:1104, giống hệt trên mọi trang có `layout/theme.liquid` (password và gift card không có). Code: `blocks/footer.liquid`, `.site-footer*`.

Anatomy: newsletter (ảnh nhỏ, tiêu đề "Get 15% Off Your First Order" phần nhấn cam, mô tả, input email + nút "Get 15% Off", ghi chú) · panel bo 24 (logo, mô tả, social; 2 cột menu Shop, Information) · trust bar 4 icon · wordmark EFITCO · copyright, localization USD / EN, icon thanh toán.

Theo mốc:
- 360: newsletter xếp dọc, input + nút xuống dòng (nút full width); 2 menu thành `<details>` (accordion, tap 52); trust 2 × 2; wordmark 64.
- 768: như 360, trust 4 cột, panel padding 48 / 32.
- 1280, 1920: newsletter 2 cột; input liền nút; 2 menu mở sẵn; panel padding 120 / 200 (Figma).

ĐỀ XUẤT:
- Thêm link "Shipping policy", "Refund policy" vào menu Information, URL từ `shop.policies` (14 #252D Must; SRS TE-9 AC5). Figma không có.
- Viền input footer: Figma `muted-on-dark` 50% chỉ đạt 2.49:1 trên nền tối (< 3:1 của WCAG 1.4.11). Đề xuất 100% `--color-muted-on-dark` (5.85). Xem câu hỏi CTO 2.
- Focus trên nền tối: outline màu `--color-background-dark-foreground` (accent trên dark 3.48, vẫn ≥ 3 nhưng kém rõ).

Lỗi / thành công form newsletter: theo §12 nhưng trên nền tối chữ lỗi dùng `--color-background-dark-foreground` + icon ! (chỉ icon và viền ô màu sale), vì chữ sale trên dark chỉ ~2.6:1 (L sale 0.1145, L dark 0.0130). Code hiện tại `.site-footer__invalid` đang tô chữ `--color-sale`: lỗi AA khi trạng thái lỗi hiện. ĐỀ XUẤT, nguồn 05 §4, 06.

## 5. Breadcrumb và tiêu đề trang

ĐỀ XUẤT (Figma không có; 04 §4 Breadcrumbs).

Anatomy: `<nav aria-label="Breadcrumb"><ol>` · các `<li><a>` · mục cuối `<span aria-current="page">` · dấu "/" bằng CSS `::before` (không đọc lên).
- Chữ 14/20 (`--font-size-sm`), link `--color-muted` (8.45), mục cuối `--color-foreground` 500, dấu phân cách `--color-muted-light`.
- Link cao 44 (vùng chạm), padding-block-start 16 → 24 từ 64rem. Mục cuối cắt "…" ở 22ch (mobile) / 48ch.
- Hover: link sang foreground + gạch chân. Focus: outline accent.
- Trang không có breadcrumb: trang chủ, cart, 404, password. Collection: Home / Collections / {collection}. Product: Home / {collection nếu có} / {product}. Article: Home / {blog} / {article}.
- SEO: JSON-LD `BreadcrumbList` (1 khối, BE/FE bàn ở ticket trang), URL qua `routes.*`.

Tiêu đề trang: eyebrow (tuỳ trang, accent 16/800 uppercase) → h1 `--font-size-h1` → meta (số sản phẩm, ngày đăng) 14 muted. Padding 16 / 48, từ 64rem 24 / 64. Một h1 mỗi trang.

## 6. Nút

| Loại | Kích thước | Màu | Code hiện có | Nguồn |
| --- | --- | --- | --- | --- |
| Primary | cao 48 (52 từ 80rem), padding-inline 32, chữ 16/600, bo `--radius-button` | nền accent, chữ accent-foreground (5.01) | `.button` | DESIGN, Figma 1:1104 CTA 52 |
| Secondary | như primary, viền 1px currentColor | nền trong suốt, chữ foreground; trên dark chữ trắng | `.button--secondary` | DESIGN |
| Link CTA | cao 44, heading 700 28/34, mũi tên 20 × 16 | currentColor | `.button--link` | Figma 1:462 |
| Text link | inline, gạch chân 1px offset 0.2em | inherit, hover accent | — (ĐỀ XUẤT) | 06 §6, Lighthouse `link-in-text-block` |
| Tròn 52 (next/back) | 52 × 52, icon 20 × 16 | trắng, viền `--color-border`, icon foreground; hover nền accent, icon trắng | `.carousel-nav__button`, `.collection-list__button` | Sổ quyết định 09/11 |
| Đóng 48 | 48 × 48 tròn, icon 20 | trắng viền border; hover nền foreground, icon trắng | `.quiz__dialog-close` | base.css, 15 §1 (≥ 48 mobile) |
| Icon header | 44 × 44, icon 24 | currentColor | `.site-header__icon` | critical.css |
| Back (trong drawer) | 44 cao, icon 16, chữ 14 muted | nhỏ và nhạt hơn nút đóng | — (ĐỀ XUẤT) | 14 §3 |

Trạng thái (mọi nút; Figma không có, theo code + ĐỀ XUẤT 05 §3):
- Hover < 200ms: primary nền `color-mix(accent 88%, foreground)`, nhấc 1px + bóng (base.css); secondary đảo nền foreground; tròn 52 cam + scale 1.06.
- Active: scale 0.98 (tròn 0.94).
- Focus: outline 2px `--color-accent` offset 2 (tròn offset 3); chỉ `:focus-visible`.
- Disabled (ĐỀ XUẤT, code chưa có): nền `--color-border`, chữ `--color-muted` (6.70), không bóng, `cursor: not-allowed`; secondary disabled viền border, chữ muted-light. Nút tròn ở đầu/cuối hàng: opacity 0.35, `aria-disabled` (code đã có).
- Loading: `aria-busy="true"`, chữ trong suốt, spinner 20 trắng ở giữa, bề rộng giữ nguyên (0 CLS), chữ ẩn "Adding" cho screen reader; nút không bấm lại được (05 §5).
- Sold out: nút primary disabled, chữ "Sold out" (chuỗi Shopify).

Quy tắc dùng: 1 primary mỗi section, ≤ 5 primary mỗi trang (04 §1). Nhãn 2–4 từ, Title Case, mở bằng động từ (DESIGN CTA); chuỗi thương mại theo locale ("Add To Cart" theo sổ quyết định 07/11). Hai nút cạnh nhau cách 16 (12 trong hàng nút dialog), mobile xếp dọc cách 12–20 (04 §1).

Lighthouse: `<button>` cho hành động, `<a href>` cho điều hướng (crawlable, SEO); mọi nút icon có `aria-label` (button-name); không dùng `<div>` bấm được.

## 7. Tab

Figma 1:490: cao 40, padding 7 / 28, gap 8, chữ 16/500.
- Chưa chọn: nền `--color-background-alt`, viền `--color-border`, chữ foreground (15.8). Đang chọn: nền foreground, chữ background. Hover: viền foreground.
- Mobile/tablet: cao 44, một hàng cuộn ngang, không xuống dòng (04 §4, 15 §6). ≤ 5 tab, nhãn 1–2 từ.
- `role="tablist"`/`tab`/`tabpanel`, `aria-selected`, phím ←/→. Panel ẩn dùng `hidden` (code `featured-collection`). Không trộn tab với accordion cùng khu (15 §6).
- Code: `.featured-collection__tab`.

## 8. Badge

| Badge | Nền / chữ | Tỉ lệ | Khi nào |
| --- | --- | --- | --- |
| -N% | sale / sale-foreground | 6.38 | có compare_at_price > price, N làm tròn từ dữ liệu |
| New | badge-new / badge-new-foreground | 4.57 | tag `new` |
| Sold out | foreground / background | 17.4 | mọi variant hết hàng |
| Tag bài viết | accent / accent-foreground | 5.01 | tag đầu tiên của article |
| Rating | background, viền background-alt, sao rating + chữ foreground | 17.4 | có metafield rating |

Pill cao 28, padding 12, chữ 13/600, bo `--radius-pill`. Ưu tiên một góc: Sold out > -N% > New (base.css). Chữ, không chỉ màu (01). Rating có chữ ẩn "out of 5 stars". Code: `.product-card__badge`, `.product-card__rating`, `.article-card__tag`.

## 9. Card sản phẩm

Figma 1:502 (trong 1:490). Snippet `product-card`. Dữ liệu động từ Shopify (sổ quyết định 07/11).

Anatomy: media 1:1 (nền cream, bo 12, ảnh `contain` + `mix-blend-mode: darken`) · badge trái trên · rating phải trên · tiêu đề 16/500 lh 26 · giá (sale đỏ + giá gạch 14 muted) · swatch 32 × 16 (vùng bấm 44) hoặc "N colors".
- Khoảng: media → info 8, title → price 4, badge cách mép 8 (< 64rem) / 16.
- Kích thước theo mốc: 152 / 232 / 292 / 336.
- Hover: card nhấc 4px, ảnh scale 1.04 (hoặc đổi ảnh 2 nếu có), tiêu đề gạch chân. Focus: outline trên link tiêu đề. Swatch chọn: viền accent 2px.
- Hết hàng: badge Sold out, ảnh opacity 0.6 (ĐỀ XUẤT, 05 §3 sold-out phải rõ), giá giữ nguyên.
- Không ảnh (`edge_cases` "Sản phẩm không có media"): placeholder SVG `--color-muted-light` trên cream, không ảnh vỡ (DESIGN Images).
- Tên dài: tối đa 2 dòng, cắt "…" (ĐỀ XUẤT, giữ hàng đều).
- Đang tải: skeleton §18.

A11y + Lighthouse: một link duy nhất (tiêu đề, `::after` phủ card), ảnh alt = alt Shopify hoặc tên sản phẩm; `<img>` có width/height; chỉ hàng card đầu của collection không banner được eager (AGENTS Images), còn lại lazy; giá có chữ ẩn "Sale price"/"Regular price"; swatch là radio có tên màu.

## 10. Card bài viết

Figma 1:1022. Code `.article-card`.
Anatomy: ảnh nền 3/4 phủ kín, bo 16 (`--radius-card` + 4) · gradient tối từ 50% → đáy (code đang 63.72%) · tag pill accent phải trên cách 12 · tiêu đề Inter 700 18/28 trắng, tối đa 3 dòng · meta 14/500 (ngày đăng; Figma ghi thời gian đọc nhưng dữ liệu demo không có trường này).
- Hover: card nhấc 6px + bóng, ảnh scale 1.04, tiêu đề gạch chân. Focus: outline accent.
- Không ảnh: nền `--color-background-dark`, chữ vẫn đọc được (16.7).
ĐỀ XUẤT: gradient bắt đầu 50% thay 63.72% để tiêu đề 3 dòng luôn nằm trên vùng tối (06 text over images; 14 #290D). Ảnh là trang trí, `alt=""`, tên đọc từ tiêu đề trong link.

## 11. Hàng ngang + thanh tiến trình

Sổ quyết định 09/11: nút next/back ở đầu khối (cùng hàng tiêu đề, phải), thanh tiến trình mảnh dưới hàng, không thanh cuộn trình duyệt, mobile ẩn nút và vuốt.
- Header khối: lưới `1fr auto`, nút căn đáy với tiêu đề, gap nút 8.
- Track: `scroll-snap-type: x mandatory`, card snap start, card kế tiếp lộ ra (15 §5: ≥ 1.2 item; mỗi item ≤ 80% viewport).
- Thanh tiến trình: cao 2, cách hàng 32, nền `--color-border`, thumb `--color-foreground`; trên dark nền trắng 12% + thumb trắng. Thumb rộng = tỉ lệ nhìn thấy, trượt theo vị trí cuộn.
- Ở đầu/cuối: nút mờ 0.35, không biến mất (code).
- Không JS: hàng vẫn cuộn bằng tay, thanh cuộn hiện (code `scroll-buttons:not([data-enhanced])`).
- Code: `scroll-buttons`, `.carousel-nav`, `.carousel-progress`. Thanh tiến trình `aria-hidden` (trang trí); hàng là `<ul>` có `aria-label`.

## 12. Input và form lỗi

Figma chỉ có input email footer 1:1104. Phần còn lại ĐỀ XUẤT theo 04 §5, 05 §4–5.

Anatomy: label (14/600, phía trên, cách 8) · dấu * đỏ cho bắt buộc + `required` · input / select / textarea · gợi ý (14 muted) · lỗi (14/500 sale + icon 16).
- Input cao `--control-height` (48 / 52), padding-inline 16, bo `--radius-input`, chữ 16 (không zoom iOS). Textarea cao 144. Select có chevron.
- Viền mặc định: ĐỀ XUẤT `--color-muted-light` (5.33) thay `--color-border` (1.26) để nhận ra ô nhập (WCAG 1.4.11); xem câu hỏi CTO 2. Hover: viền foreground.
- Focus: viền accent + outline 2px accent offset −1 (theo `.site-footer__field:focus-within`).
- Lỗi: hiện khi rời trường hoặc khi submit; viền sale 2px; câu nói rõ cách sửa ("Enter an email like name@example.com."); `aria-invalid="true"` + `aria-describedby` trỏ tới lỗi. Submit lỗi: hộp tóm tắt đầu form `role="alert"` ("Check 1 field") và focus về trường lỗi đầu tiên.
- Disabled: nền background-alt, viền border, chữ muted-light, `cursor: not-allowed`.
- Thành công: hộp viền trái 4px badge-new + icon check + chữ foreground, `role="status"`.
- Checkbox / radio: ô 20, cả nhãn bấm được, hàng cao 44, `accent-color: var(--color-accent)`.
- Form 2 cột từ 48rem, 1 cột ở 360; khoảng giữa trường 24.

A11y + Lighthouse: mọi trường có `<label for>` thật (label, select-name), `autocomplete` (name, email, tel, street-address…), không chặn dán (Best Practices `paste-preventing-inputs`), không dùng placeholder thay label, nút submit không gọi là "Submit" (04 §2).

## 13. Accordion

Figma 1:1057 (FAQ): dấu + cam 24 bên trái câu hỏi, gạch phân cách 1px border, câu hỏi 18/600 (16 dưới 80rem). Figma thắng 15 §6 (icon bên phải).
- `<details>/<summary>`, chạy không JS; mở sẵn mục đầu; cho mở nhiều mục (15 §6).
- Hàng cao ≥ 56, vùng chạm cả hàng. Mở: + đổi thành −, nội dung trượt `--motion-accordion`.
- Nội dung thụt bằng icon + gap (40), chữ muted.
- Không giấu phí ship, điều kiện khuyến mãi trong accordion đóng (15 §6).
- Code: `.faq-item`, `.site-footer__disclosure`.

## 14. Dropdown và mega menu

Figma: chỉ có chevron trên Shop, Collection (1:362). ĐỀ XUẤT theo 14 §1, 05 §2.
- Dropdown (Collection): panel trắng, viền border, bo 12, bóng raised, rộng ≥ 224, link cao 44 padding 24, hover chữ accent. Code `.site-header__submenu`.
- Mega menu (Shop, từ 64rem): full bề ngang nội dung, ngay dưới header, padding 40; 2–3 cột link (tiêu đề cột 14/600 uppercase muted) + 1 card ảnh (collection/sản phẩm nổi bật, ảnh lazy). Link đầu cột là "View all products" (14 §1: link "Xem tất cả" đặt đầu). Nền trang phía dưới phủ scrim 50%.
- Mở: hover (desktop) hoặc click/Enter; rê sang mục khác thì đổi nội dung ngay, không chạy lại hiệu ứng (05 §2); đóng bằng Escape, rời chuột, click ngoài. Hiệu ứng `motion-drop` 250ms.
- Mobile: không có mega; mục cha trong drawer menu mở cấp 2 (§15).
- A11y: trigger `<details><summary>` hoặc `<button aria-expanded aria-controls>`; danh sách `<ul>`; không bẫy focus.

## 15. Drawer

Theo 15 §2 (chuẩn NextSky), 14 §3; code `.site-header__drawer`, `.cart-drawer__dialog`.

| Drawer | Hướng | Rộng 360 / 768 / 1280+ | Nội dung |
| --- | --- | --- | --- |
| Menu | trái | 90% / 420 / — | menu 2 cấp, account, localization |
| Filter (collection) | trái | 90% / 420 / 420 | nhóm filter, nút Apply + Clear ở chân |
| Cart | phải | 90% / 420 / 480 | dòng hàng, tổng, Checkout |
| Search | phải | 90% / 420 / 480 | ô tìm, gợi ý, kết quả nhanh |

Anatomy: header cao 72 (tiêu đề h2 heading 28, nút đóng 48 ở inline-end, cách mép 12) · body cuộn riêng (`overscroll-behavior: contain`) · footer dính đáy (nút chính full width) · scrim `--overlay-scrim`.
- Cao toàn màn hình mọi mốc; mobile chiếm 90% để thấy nền phía sau (đóng bằng chạm scrim).
- Cấp 2 trong menu: trượt ngang trong cùng drawer, nút Back (nhỏ hơn ×) ở inline-start header (14 §3, 15 §7).
- Mở 250ms `--ease-out`, đóng 200ms (`calc(var(--motion-base) * 0.8)`), chỉ transform + opacity (15 §4).
- Đóng: ×, Escape, chạm scrim; trả focus về nút mở.
- A11y: `<dialog>` + `showModal()` (bẫy focus, inert nền sẵn), `aria-labelledby` tiêu đề (aria-dialog-name); khoá cuộn body. Không JS: menu dùng `<details>` (code), cart link sang `routes.cart_url`.
- Lighthouse: nội dung drawer không render ảnh eager; ảnh trong cart drawer lazy, có width/height.

## 16. Dialog và bottom sheet

Theo 15 §1–2, sổ quyết định 09/11 (quiz: popup, mobile bottom sheet); code `.quiz__dialog`.

| Cỡ | ≥ 768 | < 768 |
| --- | --- | --- |
| S (xác nhận, chọn variant, size chart ngắn) | 480 | bottom sheet |
| M (quick view, ask a question) | 720 | bottom sheet |
| L (quiz kết quả, lightbox có nội dung) | 1120 | bottom sheet |

- Desktop / tablet: giữa màn, bo `--radius-dialog` (24), padding 32 (768) / 48 (1280+), cao tối đa `min(860, 100dvh − 48)`, nút đóng 48 cách góc 24.
- Mobile: dính đáy, rộng 100%, cao tối đa 88dvh, bo 2 góc trên, thanh kéo 40 × 4 ở giữa đỉnh, nút đóng cách góc 12; vuốt xuống để đóng (15 §2); hàng nút xếp dọc, nút chính dưới cùng (ngón cái).
- Tiêu đề h2 heading 800 (28–40), có `padding-inline-end` chừa nút đóng. Nội dung < 50 từ với popup marketing (15 §1).
- Hàng nút: phải, cách nội dung 32, gạch trên 1px border.
- Motion: mở 300ms (`calc(var(--motion-base) * 1.2)`) fade + nhấc 24 + scale 0.97; đóng 200ms; mobile trượt từ đáy (base.css quiz).
- Quy tắc: một lớp popup một lúc; không popup khi vừa vào trang (chờ ≥ 5–10s hoặc cuộn 50–60%); không popup ở 404; không confirmshaming; tối đa 1 lần/phiên cho popup marketing (15 §1).
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`, Escape đóng, focus vào phần tử đầu tiên có nghĩa, trả focus khi đóng.

## 17. Toast

ĐỀ XUẤT (Figma không có; 04 §6, 05 §6, 14 #1097M).
- Vị trí: mobile dính đáy cách mép 16 (full width trừ lề); ≥ 768 góc dưới inline-end cách 24, rộng 400. `position: fixed` nên 0 CLS.
- Anatomy: thanh màu 4px inline-start · icon 20 · tiêu đề 16/600 + mô tả 14 · nút đóng 44.
- Nền trắng, viền border, bóng raised. 4 loại cố định:

| Loại | Thanh + icon | Icon | role | Tự ẩn |
| --- | --- | --- | --- | --- |
| info | `--color-muted` (8.45) | i trong tròn | status | 6s, dừng khi hover/focus |
| success | `--color-badge-new` (4.57) | check | status | 6s, dừng khi hover/focus |
| warning | `--color-accent` (5.01) | tam giác ! | alert | không, đóng tay |
| error | `--color-sale` (6.38) | ! trong tròn | alert | không, đóng tay |

- Màu thanh/icon chỉ là tín hiệu phụ; loại đọc được từ icon + chữ (01, 06). Không tắt sau ~2s (04 §6).
- Dùng sau: thêm giỏ, cập nhật giỏ, lỗi mạng, newsletter. Tối đa 3 toast chồng, mới nhất ở dưới.
- Câu hỏi CTO 3 về màu warning.

## 18. Trạng thái rỗng, lỗi, đang tải

ĐỀ XUẤT (Figma không có; 05 §6–7, 14 #928M). Dùng chung cho mọi trang; trang cụ thể chỉ đổi chữ và CTA.

Đang tải:
- Skeleton: khối `--color-background-alt` cùng kích thước nội dung thật (card: media 1:1 + 2 dòng 14, dòng 2 rộng 40%), shimmer sang `--color-background` 1.4s; reduced motion thì tĩnh. Đặt đúng chỗ nội dung sẽ hiện (0 CLS).
- Vùng đang cập nhật: `aria-busy="true"`; câu thông báo trong `role="status"` (vd "Updating cart…") + spinner 24 cạnh vùng đổi.
- Nút: §6 loading.

Rỗng (giỏ rỗng, search không kết quả, collection rỗng, chưa có đơn):
- Căn giữa, rộng ≤ 512: icon 32 trong tròn 72 nền alt · h2/h3 nói rõ ("Your Cart Is Empty") · 1 câu gợi ý · primary CTA cụ thể ("Shop Bestsellers") + text link phụ ("Browse collections").
- Search không kết quả thêm gợi ý từ khoá / collection (05 §7). Trang rỗng là nội dung, hiện cho người mua (AGENTS empty state).

Lỗi:
- Section/khối: hộp viền 1px sale, bo 12, icon ! 24 sale, tiêu đề 16/600, câu cách xử lý 14 muted, nút secondary "Try Again"; `role="alert"`.
- Trường form: §12. Thao tác nền (thêm giỏ thất bại): toast error §17.
- 404: không popup, có search + link trang chủ (TE-9 AC2).

## 19. Motion

Token: `--motion-fast` 150 (hover nhỏ, swatch), `--motion-base` 250 (màu nút, drawer mở, dropdown), `--motion-slow` 500 (ảnh scale, card nhấc), `--motion-accordion` 350, `--motion-reveal` 900 (hiện dần khi cuộn), easing `--ease-out` (vào), `--ease-in-out` (accordion), `--ease-expo` (reveal, dialog).

| Thành phần | Vào | Ra | Thuộc tính |
| --- | --- | --- | --- |
| Hover nút, link, tab | 150–250 | 150–250 | màu, translate, scale |
| Dropdown / mega | 250 drop 8px | 150 | opacity, translate |
| Drawer | 250 | 200 | translate, scrim opacity |
| Dialog | 300 | 200 | opacity, translate, scale |
| Bottom sheet | 300 trượt từ đáy | 200 | translate |
| Accordion | 350 | 350 | block-size, opacity |
| Toast | 250 trượt lên 8px | 150 fade | opacity, translate |
| Reveal khi cuộn (tiêu đề, card, ảnh lớn) | 900, lệch 80ms/card | không chạy lại | opacity, translate, clip-path |

- Chỉ transform / opacity / clip-path (sổ quyết định 09/11; 15 §3). Reveal chạy 1 lần, chỉ tiêu đề, card, ảnh chính, CTA; không cho đoạn văn dài.
- `prefers-reduced-motion: reduce`: tắt toàn bộ, nội dung hiện ngay (AGENTS).
- Reveal 900ms dài hơn mức < 500ms của 15 §3 / 22 §13: theo quyết định CTO 09/11 (đã code ES1-T250), không đổi.
- Accordion 350 dài hơn 200–300 của 15 §6: token có sẵn, giữ.

## 20. Ràng buộc Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

Chung cho mọi trang ghép từ foundation:
- A11y: tương phản theo §2 (không dùng `--color-border` hay accent trên dark cho chữ nhỏ); mọi `<button>`/`<a>` icon có tên; mọi trường có label; một `<main>`, một h1, heading không nhảy bậc; danh sách là `<ul>/<ol>`; `role="tablist"` đủ tab/tabpanel; dialog có tên; link trong đoạn văn gạch chân (link-in-text-block); vùng chạm ≥ 24 (target-size) và ≥ 44 cho control; `html lang`; không `user-scalable=no`; skip link.
- SEO: `<title>` + meta description mỗi template; link là `<a href>` thật (không `javascript:`); chữ link mô tả đích (không "Click here", "Learn more" trần — 04 §2, 07 §D); ảnh có alt; breadcrumb JSON-LD; canonical (snippet `meta-tags`).
- Best Practices: 0 lỗi console; ảnh đúng tỉ lệ (`object-fit`, không kéo méo) và đủ độ phân giải (`image` snippet srcset 360–1440); không chặn dán vào input; không xin quyền khi tải trang; không thư viện có lỗ hổng.
- Performance: chỉ 1 ảnh eager + `fetchpriority="high"` mỗi trang (LCP; AGENTS Images); mọi ảnh khác lazy, có width/height; skeleton giữ chỗ; toast, drawer, dialog, header sticky không đẩy layout; font `swap`, preload 1 font; header, breadcrumb, tiêu đề trang, nút ở critical.css (≤ 10 KB), còn lại base.css; JS mỗi file ≤ 8 KB, trang ≤ 40 KB; animation chỉ transform/opacity.

## 21. Map sang code hiện có

| Thành phần | Class / file đã có | Thiếu (ticket trang làm) |
| --- | --- | --- |
| Header A/B/C | `.site-header`, `[data-header-overlay]`, `[data-scrolled]` (critical.css) | viền dưới 1px ở biến thể A; `aria-current` cho menu |
| Footer | `.site-footer*` | link policy; viền input 100% |
| Nút | `.button`, `.button--secondary`, `.button--link`, `[aria-busy]` | style `:disabled`; cao 48 dưới 80rem (code 44) |
| Nút tròn, tiến trình | `.carousel-nav__button`, `.carousel-progress`, `scroll-buttons` | — |
| Tab | `.featured-collection__tab` | — |
| Card sản phẩm, giá, badge | `snippets/product-card`, `snippets/price`, `.product-card__*` | ảnh mờ khi sold out; clamp 2 dòng tên |
| Card bài viết | `.article-card*` | gradient 50% |
| Accordion | `.faq-item`, `.site-footer__disclosure` | — |
| Dropdown | `.site-header__submenu` | mega menu |
| Drawer | `.site-header__drawer*`, `.cart-drawer__dialog` | header/footer drawer chung, filter, search |
| Dialog | `.quiz__dialog`, `.quiz__dialog-close` | tách thành class chung cho mọi popup |
| Breadcrumb, toast, empty, alert, skeleton chung | — | tạo mới theo §5, §17, §18 |

Settings merchant: foundation không thêm setting. Thành phần mới đọc token có sẵn; setting riêng (vd bật breadcrumb) do ticket trang đề xuất.

## 22. Quyết định CTO cần chốt

1. Header trang con: chốt nền trắng (biến thể A) làm mặc định và biến thể đè ảnh (B) cho trang có ảnh lớn đầu trang? Đề xuất: có (lý do §3).
2. Viền input nền sáng dùng `--color-muted-light` (5.33:1) thay `--color-border` (1.26:1), và viền input footer dùng 100% `--color-muted-on-dark` (5.85) thay 50% (2.49), để đạt WCAG 1.4.11? Đề xuất: có; Lighthouse không đo tiêu chí này nhưng axe/QA thủ công sẽ bắt, và không cần token mới.
3. Toast warning dùng `--color-accent` cho thanh màu + icon (ngoại lệ "accent chỉ cho hành động" trong DESIGN.md, như eyebrow 09/11), success dùng `--color-badge-new` cho thanh + icon (không làm màu chữ)? Đề xuất: có; theme không có token vàng/cam riêng và ticket cấm thêm token.
