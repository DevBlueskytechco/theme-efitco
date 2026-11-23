KHÔNG CHẮC: hook scope-guard chặn Designer ghi `docs/tokens.json`, `DESIGN.md`, `docs/design/figma-handoff.md`, `docs/design/CHANGELOG.md` (dù ticket ghi trong phạm vi). Bốn file chưa sửa; bản vá đúng chữ ở mục 5, chờ người có quyền áp (ticket hỏi ở mục 7). AC6 vì vậy mới đạt ở kit, màn DS, foundation.md. Màn DS chỉ chụp được trang đầy đủ (tool chụp theo selector chỉ chạy trên store dev), chưa soát từng section mới bằng ảnh cắt.

# ES1-T573 — 7 component trang chủ lên kit, token `--size-*` / `--ratio-*`, Deprecated `--space-1…8` (bản 2.1.0, đề xuất)

Nguồn: notes ES1-T567 §6.20, §8.3, §9.6; ES1-T293, T278, T279. Nhánh làm việc của Orchestrator; không commit.

## 1. AC

| AC | Kết quả | Cách kiểm |
| --- | --- | --- |
| AC1 7 class có rule ở kit, `<style>` 3 trang chủ không còn selector | Đạt | kit.css mục 13c (b1–b7). grep `^\s*\.(level-card\|stl\|hotspot\|vcard\|tcard\|specs\|faq__stat\|quiz-opt)` trong 3 `index.html` = 0 |
| AC2 foundation.html có 7 section h-* mới | Đạt | `h-level-card`, `h-stl`, `h-vcard`, `h-tcard`, `h-specs`, `h-faq-stats`, `h-quiz-opt` (35–41, `data-status="proposed"`) |
| AC3 chụp T293 1280/1920, T278/T279 360/768, lệch ≤ 2 px | Đạt (theo chiều cao trang) | Ảnh mới `_tmp/` cao đúng bằng ảnh cũ: T293 13170 / 14589; T278 8229 / 7267; T279 12197 / 10354. Nhìn toàn trang không khác. Chưa so từng pixel (không có công cụ diff ảnh trong vai) |
| AC4 grep `var(--space-[1-8])`, `var(--radius-hero)` trong trang = 0 | Đạt | 0 trong `drafts/designer/**/*.html` (trước: 383 + 1). Chỉ còn trong `.md` lịch sử (ES1-T34, T535, T567) |
| AC5 `aspect-ratio` 3 trang chủ chỉ `var(--ratio-*)` (trừ auto) | Đạt | grep `aspect-ratio\s*:\s*[^va]` = 0; kể cả inline `style` (level card trạng thái, skeleton video) |
| AC6 `:root` = `kit_root_count` = DESIGN.md = handoff §3.6; tokens.json load đạt | Một phần | `:root` kit = 170 (177 dòng `--*:` − 5 dòng trong media query − 2 dòng chú thích). foundation.html `h-token-architecture` và foundation.md §32.2 = 170. tokens.json, DESIGN.md, handoff: bản vá mục 5 (bị chặn ghi) |
| AC7 `.filter-toggle__count` 20 × 20; grep class 24 cũ = 0 | Đạt (theo CSS) | kit: `min-width` + `height` = `--count-badge-size` 20, `line-height` 20; nội dung "1" 13px + đệm 4 × 2 < 20 nên ra 20 × 20. Không thêm class biến thể 24 |

Kiểm trước PR: foundation 360 / 1280 render 0 lỗi console (133549 / 62112 px). 13 trang đổi alias + search + password + gift card chụp 360: 0 lỗi console; product, cart, search, marketing-popups cao đúng bằng ảnh cũ (18687, 11345, 12503, 14452).

## 2. Đã làm

### 2.1 kit.css (`:root` 150 → 170)

- Token mới: `--size-1000` 40, `-1100` 44, `-1200` 48, `-1300` 52, `-1400` 56, `-1600` 64, `-1800` 72, `-2000` 80, `-2400` 96; `--ratio-1-1 / 2-1 / 3-2 / 4-3 / 3-4 / 16-9 / 9-16`; `--display-fluid` (chuyển từ `:root` của ES1-T293); `--logo-width` 100, `--logo-height` 30; `--quantity-compact-width` 130.
- Tên thang kích thước: body ticket viết `--size-*` 40…96; foundation.md §32.1 cấm đặt tên theo giá trị nên dùng bậc như `--space-050 / 150` (100 = 4px). CTO chốt ở mục 8.
- Deprecated (chú thích tại chỗ, giữ biến): `--space-1…8`, `--radius-hero`.
- Mục 13c mới: (a) `.icon-button` (từ mini-cart-quickview, thêm trạng thái disabled), `.link-button` (từ marketing-popups, thêm line-height 20), `.sheet-handle` + `--mobile` (thay `::before` viết tay ở quiz-result, localization), `.filter-toggle__count` (từ search, 24 → 20); (b) 7 component trang chủ, mobile-first.
- Mọi `aspect-ratio` còn viết số trong kit (mega promo, product card, article card, skeleton, option tile, collection card, `.media`) đọc `--ratio-*`; giá trị không đổi.
- `.site-header__logo svg` đọc `--logo-width` / `--logo-height`.

### 2.2 Trang

| File | Đổi |
| --- | --- |
| ES1-T293/index.html | Gỡ rule `.level-card*`, `.quiz-opt*`, `.stl__*`, `.stl-row`, `.hotspot`, `.specs`, `.vcard*`, `.tcard*`, `.faq__stat*`; gỡ `--display-fluid`, `--pad-fluid` khỏi `:root` trang; `aspect-ratio` → token. Markup shop the look: `.g12` → `.stl`, `.stl__side` → `.stl__body`, bọc fits + rows trong `.stl__list`, panel thêm `.stl__summary` |
| ES1-T278/index.html | Gỡ `.level-card*`, `.quiz-opt*`, `.stl__*`, `.hotspot`, `.stl-row` (cả trong `@48rem`); `aspect-ratio` hero → token. Markup: bọc media + body trong `.stl`, `div` → `.stl__list` |
| ES1-T279/index.html | Gỡ `.specs*`, `.vcard*` (cả `--error`), `.tcard*`, `.faq__stat*` (cả trong `@48rem`); `aspect-ratio` → token (kể cả skeleton video inline) |
| 13 trang (foundation, product, collection, cart, navigation, predictive-search, mini-cart-quickview, marketing-popups, quiz-result, pagination, shopify-features, announcement-bar, localization) | `var(--space-1…8)` → tên chính (1→2xs, 2→xs, 3→sm, 4→md, 5→xl, 6→2xl, 7→4xl, 8→7xl); marketing-popups `var(--radius-hero)` → `var(--radius-md)` |
| search.html | Gỡ `.filter-toggle__count` (lên kit, 20) |
| mini-cart-quickview.html | Gỡ `.icon-button` (lên kit) |
| marketing-popups.html | Gỡ `.link-button` (lên kit); `.code__value` letter-spacing 0.06em → `--letter-spacing-caps` 0.04em |
| quiz-result.html, localization.html | Tay nắm sheet: class kit `.sheet-handle` (`--mobile` cho quiz-result) thay `::before` viết tay; số đo giữ 40 × 4, cách đỉnh 8 |
| password.html, gift_card.html | Logo đọc `--logo-width` / `--logo-height` |
| cart.html | Cột Quantity đọc `--quantity-compact-width` |

### 2.3 Màn DS (foundation.html)

- 7 section 35–41 (số đo, trạng thái, Nên / Không nên); 3 icon thêm vào sprite (`i-play`, `i-verified`, `i-ruler`); CSS trang chỉ thêm khung mẫu `.hp-*`, `.icon-16`.
- `h-token-architecture`: đếm 170, thêm hàng Size scale 9, Aspect ratio 7; Typography 35; Component 10; ghi Deprecated ở Space, Radius. `h-media`: popup đọc `--radius-md`.

### 2.4 foundation.md

Đầu file (bản 2.1.0 đề xuất + mục "Thay đổi ES1-T573"); §1.2 (alias Deprecated, 3 token component mới, bảng thang kích thước); §32.1 (ngoại lệ tên `--ratio-*`); §32.2, §32.3 (170, 89 chưa có trong code); §36 (token tỉ lệ, `.media`, bo card video / testimonial sửa theo kit: video 12, testimonial 16); §39 (7 dòng Đề xuất, đếm 50 section); §40 (2.1.0); §41 mới (7 component).

## 3. Lệch chủ ý

| Chỗ | Trước | Sau | Mốc ảnh hưởng | Lý do |
| --- | --- | --- | --- | --- |
| `.vcard__play` focus | offset −4 chỉ ở T279 | −4 mọi mốc | Chỉ khi focus, 1280 / 1920 | Một định nghĩa; vòng focus ngoài bị `overflow: hidden` cắt |
| `.level-card__title` | T278 không khai letter-spacing (lấy từ `h3`) | khai `--letter-spacing-heading` | 0 px (thẻ `h3` đã có) | Thẻ `span` ở khung trạng thái giống thẻ thật |
| `.filter-toggle__count` | 24 × 24 (đọc `--space-xl`) | 20 × 20 (`--count-badge-size`) | search 360 / 768 (nút Filter không đổi cao) | Ticket; space token không dùng cho kích thước |
| `.code__value` | 0.06em | 0.04em | marketing-popups, mã giảm giá hẹp lại vài px | Ticket; số ngoài token |
| `.link-button` | line-height kế thừa 24 | 20 (14/20) | 0 px (cao tối thiểu 44 giữ) | Chữ 14 đi với dòng 20 (§1.1) |
| `.icon-button` | không có disabled | disabled muted-light, không nền | Chỉ trạng thái mới | Đủ trạng thái (§38) |
| foundation.md §36 | video bo 16, testimonial bo 12 | video 12, testimonial 16 | Tài liệu | Sửa theo kit / mockup (nguồn chuẩn) |

## 4. Giữ ở trang (bố cục section)

`.hero*`, `.mf*`, `.quiz*` (trừ `.quiz-opt`), `.fp*`, `.why*`, `.bpanel*`, `.intro*`, `.level-grid`, `.row`, `.g12`, `.shead`, `.faq`, `.faq__aside`, `.faq__image`, `.video` / `.reviews` (`--card`), `.dpanel__row--saving > :first-child` (T278 / T279). Không đụng ES1-T252 (lịch sử): file này vẫn tự định nghĩa class cũ và ghi đè kit (CSS trang nạp sau).

## 5. Bản vá cho file ngoài phạm vi ghi của Designer agent

### 5.1 `docs/tokens.json`

1. `_version`: `"2.0.0"` → `"2.1.0"`; đầu `_version_note` thêm: "2.1.0 của ES1-T573 (minor: thêm 20 token size / ratio / display-fluid / logo / quantity-compact-width, 7 component trang chủ + 4 component nhỏ lên kit, Deprecated --space-1…8 và --radius-hero; ĐỀ XUẤT tới khi CTO duyệt)."
2. `_source_of_truth.kit_root_count`: 150 → 170. `theme_code_coverage` nối: "2.1.0 (ES1-T573) thêm 20 token chưa có trong code: 89 / 170 chưa có."
3. `kit_root_groups`: `typography` "35 (gồm 12 line-height, display_fluid)"; `space` "14 + 8 alias (Deprecated 2.1.0)"; `radius` "6 + 7 role (hero Deprecated 2.1.0)"; `component` 10; thêm `"size_scale": 9`, `"aspect_ratio": 7`; `breakpoint` "… không tính vào 170".
4. Thêm `_source_of_truth.deprecated`: `{"_note": "Deprecated ở 2.1.0 (ES1-T573), xoá ở 3.0.0. Mockup đọc 0 lần", "--space-1…8": "→ --space-2xs, xs, sm, md, xl, 2xl, 4xl, 7xl", "--radius-hero": "→ --radius-md (khung popup); hero trang chủ đọc --radius-panel"}`.
5. `space._setting`: thay "không dùng cho thành phần mới" bằng "DEPRECATED 2.1.0 (ES1-T573), xoá ở 3.0.0; mockup đọc 0 lần". `radius.roles.hero`: "md (DEPRECATED 2.1.0, xoá ở 3.0.0)".
6. `aspect_ratio._note`: thay câu cuối "Không phải custom property ở :root…" bằng "Từ 2.1.0 là custom property ở :root; aspect-ratio trong kit và mockup chỉ đọc var(--ratio-*) (trừ auto); --ratio cục bộ của .media nhận các token này". Thêm `"tokens": {"--ratio-1-1": "1 / 1", "--ratio-2-1": "2 / 1", "--ratio-3-2": "3 / 2", "--ratio-4-3": "4 / 3", "--ratio-3-4": "3 / 4", "--ratio-16-9": "16 / 9", "--ratio-9-16": "9 / 16"}` và `"level_card": {"<48rem": "4/3", ">=48rem": "1/1"}`.
7. `component`: thêm `logo_width` {100, `--logo-width`, "Thiết kế: logo thương hiệu 100 × 30, tỉ lệ 10:3; code theme đặt inline theo setting logo_width"}, `logo_height` {30, `--logo-height`}, `quantity_compact_width` {130, `--quantity-compact-width`, "Thiết kế: 44 + 40 + 44 + viền 2"}.
8. Khoá mới `size`: `_note` "Thang kích thước primitive 2.1.0 (ĐỀ XUẤT); tên theo bậc 100 = 4px như space 050 / 150, không đặt theo giá trị (foundation.md §32.1); Polaris: space token không dùng cho width / height"; `"1000": 40, "1100": 44, "1200": 48, "1300": 52, "1400": 56, "1600": 64, "1800": 72, "2000": 80, "2400": 96` (css `--size-<bậc>`).
9. Khoá mới `typography_fluid.display_fluid`: `{"css": "--display-fluid", "value": "min(var(--font-size-display), 6.25vw)", "px": {"1280": 80, ">=1600": 100}, "source": "Thiết kế: display trang chủ co theo cột từ 80rem"}`.
10. Khoá mới `homepage_components`: 7 tên → id màn DS (`h-level-card`, `h-stl`, `h-vcard`, `h-tcard`, `h-specs`, `h-faq-stats`, `h-quiz-opt`), trỏ foundation.md §41.
11. `_tiers.component`: thêm `logo_width, logo_height, quantity_compact_width` vào danh sách; `_tiers.primitive`: thêm `size`, `aspect_ratio.tokens`.

Sau khi áp: `python3 -c "import json; json.load(open('docs/tokens.json'))"`.

### 5.2 `DESIGN.md` dòng 110–114

Thay đoạn "Token groups and counts …" bằng:

> - Token groups and counts (kit `:root`, 170 variables, version 2.1.0): color 32, typography 35 (12 of them line heights, plus `--display-fluid`), space 14 + 8 deprecated aliases, radius 6 + 7 roles (`--radius-hero` deprecated), motion 8 + 3 easings, shadow 4, layer 8, icon 4, size and layout 15, component 10, size scale 9 (`--size-1000` … `--size-2400`), aspect ratio 7 (`--ratio-*`). Breakpoints (48rem, 64rem, 80rem) are constants in media queries, not variables.
> - Deprecated in 2.1.0, removed in 3.0.0: `--space-1` … `--space-8` (use `--space-2xs` … `--space-7xl`) and `--radius-hero` (use `--radius-md`). Mockups read them 0 times.
> - `aspect-ratio` reads `var(--ratio-*)` only (except `auto`).

Nếu DESIGN.md có câu "150" ở chỗ khác (mục Sources / version): đổi 170, bản 2.1.0 (đề xuất).

### 5.3 `docs/design/figma-handoff.md`

- §1 dòng 14: "(150 biến)" → "(170 biến, 2.1.0)".
- §3.1 Primitives: thêm nhóm `size/1000` 40 · `size/1100` 44 · `size/1200` 48 · `size/1300` 52 · `size/1400` 56 · `size/1600` 64 · `size/1800` 72 · `size/2000` 80 · `size/2400` 96 (Number).
- §3.5 Component: thêm 3 hàng `logo/width` 100 `--logo-width` Logo header; `logo/height` 30 `--logo-height`; `quantity/compact-width` 130 `--quantity-compact-width` Stepper gọn.
- §3.6 câu đầu: "`:root` của kit có 170 biến: 118 thành variable (§3.1–§3.5; 2.1.0 thêm 9 `size/*` + 3 component), 22 chỉ nằm trong text style / effect style, 30 không tạo." Bảng "Không tạo" đổi tiêu đề "(30)", hàng `--space-1…8` thêm "Deprecated 2.1.0, xoá 3.0.0", thêm 2 hàng: `--ratio-*` (7) | `1 / 1` … `9 / 16` | Figma không có variable tỉ lệ | Khung ảnh khoá tỉ lệ (Constrain proportions) đúng bộ tên, ghi tên tỉ lệ trong tên layer; `--display-fluid` | `min(display, 6.25vw)` | Công thức theo khung | Text style `Display` mode Desktop 1280 = 80, 1920 = 100.
- §7.1 tiêu đề "(chưa nằm trong kit)" → "(kit 2.1.0, ES1-T573)"; đoạn dẫn: "Bảy pattern dưới là component của kit (mục 13c), một định nghĩa mobile-first; màn DS section 35–41. Dựng mỗi pattern một component, variant theo khổ 360 / 768 / 1280." Cột "Nguồn 1280 / 1920" và "Nguồn 360 / 768" thay bằng một cột "Màn DS": `h-level-card`, `h-stl`, `h-vcard`, `h-tcard`, `h-specs`, `h-faq-stats`; thêm hàng "Câu trả lời quiz | `.option-card.quiz-opt` | `h-quiz-opt` | thumb 44, cao 72 / 80".
- §11 dòng 405: bỏ câu "component riêng trang chủ chưa lên kit … chưa có trong kit"; thay "Đã lên kit ở 2.1.0 (ES1-T573)".

### 5.4 `docs/design/CHANGELOG.md`

- Dòng "Bản hiện tại": "**2.0.0** … ; **2.1.0** đề xuất (ES1-T573, chờ CTO duyệt)".
- Thêm trên mục 2.0.0:

> ### 2.1.0 — đề xuất — 23/11/2026 — ES1-T573
>
> Minor: thêm token và component, không xoá gì. Chi tiết: `drafts/designer/ES1-T573/notes.md`.
>
> Thêm: 20 token `:root` (150 → 170): `--size-1000…2400` (9), `--ratio-*` (7), `--display-fluid`, `--logo-width`, `--logo-height`, `--quantity-compact-width`. Component kit: `.level-card`, `.stl` / `.stl__*` / `.stl-row` / `.hotspot`, `.vcard` (+ `--error`), `.tcard`, `.specs`, `.faq__stats` / `.faq__stat*`, `.option-card.quiz-opt`, `.icon-button`, `.link-button`, `.sheet-handle` (+ `--mobile`), `.filter-toggle__count`. Màn DS: section 35–41.
>
> Deprecated (xoá ở 3.0.0): `--space-1…8`, `--radius-hero`.
>
> Sửa giá trị: `.filter-toggle__count` 24 → 20 (`--count-badge-size`); `.code__value` letter-spacing 0.06em → 0.04em (`--letter-spacing-caps`).
>
> Không đổi: số đo 7 component ở mọi mốc (ảnh 6 khổ trang chủ cao bằng bản trước từng px).

## 6. Cần FE (ngoài phạm vi, ES1-T548, T576, T580)

- Thêm 20 token vào `snippets/css-variables.liquid`; `aspect-ratio` trong `blocks/*` đọc `--ratio-*`.
- Đối chiếu class kit 13c với block hiện có (`level-card`, `video-card`, `shop-the-look*`, `featured-product`, `quiz`, `testimonials`, `faq`); số đếm bộ lọc 20.
- Thay `--space-1…8` trong `assets/*.css` trước bản 3.0.0.

## 7. Ticket

Hỏi áp bản vá mục 5 (scope-guard chặn Designer ghi 4 file): tạo ở lượt này, xem link trong comment ticket ES1-T573.

## 8. Quyết định CTO cần chốt

1. Tên thang kích thước `--size-1000…2400` (bậc) hay `--size-40…96` (theo body ticket). ĐỀ XUẤT: bậc (nguồn: foundation.md §32.1 "không đặt tên theo giá trị"; quy ước `--space-050 / 150` của kit).
2. Duyệt 2.1.0 và 7 section Đề xuất. ĐỀ XUẤT: duyệt; giữ nhãn Đề xuất tới khi FE dựng.
3. Số đếm bộ lọc 20: số 2 chữ số rộng 28. ĐỀ XUẤT: chấp nhận (notes ES1-T567 §8.3: một token số đếm cho giỏ và bộ lọc).
