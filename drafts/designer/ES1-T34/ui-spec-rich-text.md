KHÔNG CHẮC: (1) Component icon 1:126 không có trong snapshot docs/figma/ → chỉ biết kích thước 20 × 16, chưa xác nhận hình mũi tên. (2) Chưa có docs/figma/img/1-454.png → thứ tự ảnh inline và chữ ở dòng 2 heading suy từ toạ độ, chưa nhìn ảnh. (3) Figma chỉ có desktop 1920; mọi số 360/768/1280 dưới đây là ĐỀ XUẤT. Hỏi CTO/Tech Lead ở ticket ES1-T41 (xem cuối file).

# UI spec rich-text — Figma 1:454 (trả lời ES1-T34 cho ES1-T29)

Nguồn: mcp__figma__get_node 1:454 depth 5 và 1:453 depth 1, snapshot 2026-10-30 (Figma lastModified 2026-10-28T02:48:43Z). Không gọi Figma API.

## Trả lời 6 câu hỏi

| # | Câu hỏi | Figma 1:454 | Code hiện tại | Kết luận |
| --- | --- | --- | --- | --- |
| 1 | Căn lề | Tất cả `textAlignHorizontal: LEFT`. Bố cục 2 cột: heading cột trái, body + CTA cột phải | Căn trái, 1 cột xếp dọc | Giữ căn trái, KHÔNG truyền `alignment: 'center'` → KHÔNG CHẮC 4 của ES1-T24 không còn áp dụng cho block này. Lệch ở bố cục 2 cột, không phải căn lề |
| 2 | Heading | Sofia Sans Condensed ExtraBold 800, 100px, line-height 100px (1.0), letter-spacing -4px (-0.04em), `textCase: UPPER`, #1A1A1A, style "D/H1" | `--font-size-h2` 36px, weight heading mặc định, không uppercase | Sai cỡ/weight/hoa. Dùng display 100 (có trong `type_scale`), weight 800, uppercase, -0.04em, line-height 1. Thẻ vẫn `h2` (hero giữ h1), chỉ đổi style |
| 3 | Body | Có. "Versatile equipment for home training - strength, mobility, endurance, at every level." Inter Medium 500, 16px, line-height 26px, letter-spacing -0.16px (-0.01em), #1A1A1A (= `foreground`), style "Common/Body", rộng 526, 2 dòng | Rỗng, màu kế thừa | Default `body` = `<p>Versatile equipment for home training - strength, mobility, endurance, at every level.</p>`; màu `--color-foreground` (không dùng muted) |
| 4 | Khoảng cách | Trên block 120 (padding frame 1:453). Dưới block 120 (itemSpacing 1:453 tới 1:464 "Choose Your Training Level", cùng frame). Heading → cột phải: ngang 148 (heading box 732, cột phải bắt đầu ở +880). Body → CTA: 40. Heading và cột phải canh đỉnh (heading y +2) | `padding-block: --space-7` (48), `* + *` = `--space-5` (24) | 120 = `--space-8`. 40 không có trong scale → `calc(var(--space-1) * 10)` như tiền lệ slideshow `* 9`. Cột phải có padding 10 trong Figma (Frame 853) → bỏ, chỉ là đệm auto layout; nội dung cột phải bắt đầu ở +890 |
| 5 | Icon CTA | Có: instance `icon` 1:463 (component 1:126), 20 × 16, gap 12 với chữ, canh giữa dọc. CTA KHÔNG phải nút nền cam như hero: chỉ chữ Sofia Sans Condensed Bold 700, 28px, line-height 34, letter-spacing -0.56px (-0.02em), không uppercase (giữ "Become A Member"), #1A1A1A, style "D/H4"; không fill, không padding, không radius. Hero CTA 1:433 là component khác ("CTA Button" 1:90, nền #D94610, radius 8, cao 52) | `.button` nền accent, không icon | Cần biến thể link: chữ 28px + icon 20 × 16, gap `--space-3` (12). Hình icon: KHÔNG CHẮC (1:126 không có trong snapshot); tạm dùng icon `arrow` của `slideshow-icon` nếu Tech Lead đồng ý |
| 6 | Độ rộng | Group 1:454 = 1416 × 202 = full content width (`container.max` 1416). Heading box 732 (render thực 694), cột phải 536 (nội dung 526) | `max_width` default 960 | Default `max_width` = 1416 (hợp lệ: 480 + 24 × 39). 960 làm heading 100px và cột phải không đủ chỗ |

## Phát hiện ngoài 6 câu hỏi

- Nền: frame 1:453 fill #EBE6E0 (r 0.9207 g 0.9013 b 0.8771), bao cả 1:454 và 1:464. Màu này dùng nhiều lần trong snapshot nhưng KHÔNG có trong `docs/tokens.json` lẫn `figma-inventory.md`. Contrast #1A1A1A trên #EBE6E0 = 14.0:1 (đạt AAA). Cần thêm token (ĐỀ XUẤT `background_sand` #EBE6E0 + `background_sand_foreground` #1A1A1A) → hỏi ES1-T41. Container dùng chung 2 block → nền đặt ở container, không ở rich-text.
- Ảnh inline trong heading: 1:455 RECTANGLE image fill, 165 × 94, radius 8 (= `radius.card`), toạ độ so với heading: x +195, y +99 (nằm trong dòng 2, gần đủ cao dòng 100). Chuỗi heading có 17 dấu cách giữa "Need" và "to Train." để chừa chỗ ảnh. Code chưa có ảnh này. ĐỀ XUẤT (chưa có setting trong SRS, không tự thêm): setting `image_picker` "Inline image", để trống thì không hiện; dựng bằng phần tử inline thật, không dùng chuỗi dấu cách. Chờ ES1-T41.

## Mục đích

Khối giới thiệu ngắn giữa hero/collection và "Choose Your Training Level": heading lớn + 1 đoạn mô tả + link "Become A Member".

## Anatomy (desktop 1920, gốc toạ độ = mép trái content x 252, đỉnh y 1635)

1. `rich-text` (root, 1416 × 202, grid 2 cột).
2. `rich-text-heading` — cột trái, 732 rộng, 2 dòng × 100. Dòng 1 "EVERYTHING YOU NEED", dòng 2 "TO TRAIN." + ảnh inline.
3. Ảnh inline (chưa có trong code, ĐỀ XUẤT) — 165 × 94, radius 8.
4. Cột phải — bắt đầu x +890, rộng 526, xếp dọc gap 40.
5. `rich-text-body` — 526 rộng, 2 dòng.
6. `rich-text-button` — link chữ 28px + icon 20 × 16, gap 12, cao 34.

## Settings merchant

| Tên (sentence case) | id | Kiểu | Default theo Figma | Ghi chú |
| --- | --- | --- | --- | --- |
| Heading | heading | text | Everything You Need to Train. | Đúng như code |
| Heading level | heading_level | select h1/h2 | h2 | Đúng như code |
| Body | body | richtext | `<p>Versatile equipment for home training - strength, mobility, endurance, at every level.</p>` | Code đang rỗng → đổi |
| Button label | button_label | text | Become A Member | Đúng như code |
| Button link | button_url | url | (trống → all products) | Figma không có link, giữ code |
| Max width | max_width | range 480–1416 step 24 px | 1416 | Code 960 → đổi |
| ĐỀ XUẤT: Inline image | image | image_picker | trống | Chờ ES1-T41, không tự thêm |

## Layout

| Breakpoint | Bố cục | Heading | Body / CTA | Khoảng cách |
| --- | --- | --- | --- | --- |
| 1920 (Figma) | 2 cột 732 / 526, khoảng giữa 158 tính tới nội dung cột phải (148 + đệm 10), canh đỉnh | 100 / 1.0 / 800 / uppercase / -0.04em | Body 16/26 500; CTA 28/34 700 + icon 20 × 16 | Trên/dưới 120 (`--space-8`); body→CTA 40 |
| 1280 | ĐỀ XUẤT: giữ 2 cột tỉ lệ `732fr 526fr`, gap `clamp(var(--space-7), 8.2vw, 158px)` | ĐỀ XUẤT: `clamp(48px, 6.95vw, 100px)` (~89px) để "EVERYTHING YOU NEED" vẫn 1 dòng | Như 1920 | Như 1920 |
| 768 | ĐỀ XUẤT: 1 cột, heading trên, cột phải dưới, gap `--space-5` | ĐỀ XUẤT: 48 (`type_scale`), line-height 1 | Body 16/26; CTA 28/34 | Trên/dưới `--space-7` (48); body→CTA `--space-5` |
| 360 | ĐỀ XUẤT: như 768 | ĐỀ XUẤT: 48, cho phép xuống 3 dòng | Body 16/26; CTA ĐỀ XUẤT 28 giữ nguyên (1 dòng vừa ~175 + 32 icon) | Như 768 |

Ảnh inline (nếu duyệt): ≥1280 giữ tỉ lệ 165 × 94 theo cỡ chữ (cao ≈ 0.94em); ≤768 ĐỀ XUẤT ẩn hoặc thu theo em — Designer người chốt.

## Trạng thái

- Rỗng: Figma không có. Code hiện tại (heading, body, button đều trống → editor hiện placeholder, storefront không render) giữ nguyên.
- Lỗi / loading: không áp dụng (nội dung tĩnh).
- Hover CTA: Figma không có. ĐỀ XUẤT: gạch chân chữ, icon dịch phải 4px (`--space-1`), `prefers-reduced-motion` thì không dịch.
- Focus CTA: Figma không có. ĐỀ XUẤT: giống `.button:focus-visible` (outline 2px currentcolor, offset 2px).

## Accessibility

- Contrast: #1A1A1A trên #EBE6E0 = 14.0:1; trên #FFFFFF (nếu chưa có token nền) = 17.4:1. Đạt.
- Touch: CTA cao 34 ≥ 24. ĐỀ XUẤT `min-height: 44px` để thống nhất `.button`.
- Icon CTA: trang trí, `aria-hidden="true"`, `focusable="false"`; nhãn link chỉ là `button_label`.
- Heading uppercase làm bằng CSS `text-transform`, không đổi chuỗi (screen reader đọc đúng).
- Ảnh inline (nếu có): trang trí → `alt=""`; nếu merchant cần mô tả thì lấy `image.alt`.
- Không dùng chuỗi dấu cách để chừa chỗ ảnh (screen reader và wrap khác nhau giữa trình duyệt).

## Token dùng

`--color-foreground` #1A1A1A; nền ĐỀ XUẤT `--color-background-sand` #EBE6E0 (chưa có); `--font-heading` 800 và 700; `--font-body` 500; cỡ 100 / 28 / 16 (`type_scale`); `--space-8` 120, `--space-3` 12, `--space-1` × 10 = 40; `--radius-card` 8 (ảnh inline).

## Lệch code hiện tại so với Figma (để Dev FE sửa ở ES1-T29)

| Mức | Hạng mục | Code | Figma |
| --- | --- | --- | --- |
| P2 | Bố cục | 1 cột xếp dọc | 2 cột heading / (body + CTA) |
| P2 | Kiểu CTA | `.button` nền accent | Link chữ 28px + icon 20 × 16 |
| P2 | Body | Rỗng | Có 1 đoạn (bảng trên) |
| P2 | max_width default | 960 | 1416 |
| P2 | Ảnh inline heading | Không có | 165 × 94 radius 8 (chờ ES1-T41) |
| P3 | Heading | 36px, weight mặc định, thường | 100px, 800, uppercase, -0.04em, lh 1 |
| P3 | Khoảng cách | 48 trên/dưới, 24 giữa | 120 trên/dưới, 40 body→CTA |
| P3 | Nền | Kế thừa (#FFFFFF) | #EBE6E0 ở container (chờ token) |
