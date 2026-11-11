KHÔNG CHẮC: (1) Figma 1:359 chỉ có 1920; mọi số 1280 là ĐỀ XUẤT suy từ lưới của chính frame (layoutGrids: 12 cột × 96, gutter 24, lề 252; 2 cột × 668, gutter 80). (2) Ảnh hero demo `efx-slide-2.jpg` khác ảnh Figma 1:422; ≥ 80rem không có lớp tối (sổ 10/11), chữ trắng 16–18 trên tông nền ~#8B8279 chỉ ~3.76:1 (đo ở `index.md` §3.2), cần ảnh có vùng nền trơn, tối sau chữ (xem §4). (3) Độ dài thanh tiến trình trong mockup là ước lượng (88 / 80 / 85%), code tính theo vị trí cuộn. (4) Mockup bỏ `loading="lazy"` để ảnh chụp đủ ảnh; theme vẫn lazy mọi ảnh trừ slide 1 (§4.2). (5) Nút nổi Big Offer không vẽ (overlay, `marketing-popups.md` §4).

# UI spec: Trang chủ desktop 1280 (ES1-T293)

Mục đích: bản trang chủ ở 1280 (laptop phổ biến, nội dung 1240) dựng riêng từ Figma 1920 trước giai đoạn Dev (sổ 10/11, audit ES1-T283 câu 1). 1920 vẫn là chính Figma; spec này nói 1280 khác 1920 ở đâu và vì sao. Story TE-17; template `templates/index.liquid`. Dưới 80rem theo `index-mobile-a.md` (ES1-T278) và `index-mobile-b.md` (ES1-T279).

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T293/index.html` (kit.css + CSS riêng ở `<style>`, một bộ CSS cho cả 1280 và 1920; 16 khối đúng thứ tự Figma; trạng thái desktop ở cuối).
- `index-1280.png` (1280 × 12889), `index-1920.png` (1920 × 14269, để đối chiếu Figma). 0 lỗi console. Không render 360/768 (thuộc ES1-T278/T279).

Thứ tự nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 > foundation (`F§n`) > bộ kiến thức (`NN §mục`).

## Thay đổi audit

| # | Mục | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Desktop 1280 | "1280/1920 là chính Figma, không vẽ lại" (index-mobile-a, -b) | có bản 1280 riêng, bảng lệch 16 khối so với 1920 | CTO 10/11 audit câu 1 |
| 2 | Chữ display ≥ 80rem | 100 cố định từ 1200 | `min(display, 6.25vw)`: 80 ở 1280, 100 từ 1600 (câu CTO 1) | §0 R2 |
| 3 | Hero ở 1280 | không định nghĩa | thẻ tràn mép bo 16, chữ mép 20, mũi tên góc dưới phải (câu CTO 2) | §1 khối 2 |
| 4 | Hàng ngang ở 1280 | không định nghĩa | card co để lộ ≥ 25% card kế; đủ chỗ thì lưới tĩnh (câu CTO 3) | §0 R4 |

## 0. Quy tắc quy đổi 1920 → 1280

| Giá trị | 1280 | 1920 | Cách tính |
| --- | --- | --- | --- |
| Nội dung / lề | 1240 / 20 | 1416 / 252 | `--content-width` (F§1) |
| Cột × gutter | 81.3 × 24 | 96 × 24 | 12 cột, `--grid-gap` |
| Lưới 2 cột (featured, why, FAQ) | 580 \| 80 \| 580 | 668 \| 80 \| 668 | `1fr 80 1fr` |
| Dải rộng (hero, panel footer) | 0 (tràn mép) | 60 | `--band-inset` (F§1) |
| Mép dải → mép nội dung | 20 | 192 | `--side − --band-inset` |
| Khoảng giữa section / tiêu đề → nội dung | 120 / 40 | 120 / 40 | `--section-gap`, `--heading-gap` |
| h2 khối / display | 48 / 80 | 48 / 100 | `--font-size-h1`; R2 |

- R1 Giữ span cột Figma, gutter giữ 24: thẻ co theo cột (level 4 cột, bestseller 3 cột, shop the look 8 + 4, bundle 7 + 5). Lý do: cùng nhịp lưới, không thêm bố cục (03 §1; 06 nhóm 5 §1).
- R2 Display (hero, intro, make fitness, why): `min(var(--font-size-display), 6.25vw)`. 1920 = 100 như Figma; 1280 = 80. Ở 100, dòng "A NATURAL PART OF YOUR" rộng 847 đè ảnh rải trái (x 20–276) của Make fitness, và H1 hero chiếm 39% chiều cao thẻ (Figma 27%) (03 §6 thứ bậc; 19 §D6).
- R3 Giá trị chạm và chữ không co: nút 52, nút tròn 52, tab 40, chữ 13–18, ô 44 đồng hồ, padding nút. Chỉ khoảng rìa, ảnh, thẻ co (`clamp(min 1280, vw, max 1920)`).
- R4 Hàng ngang tràn tới mép phải màn hình, mép trái thẳng container (Figma). 1920 Figma lộ card kế trong lề 252; ở 1280 lề chỉ 20 nên card co: `min(rộng Figma, (100vw − lề − n × 24) / (n + 0.3))` với n = số card trọn như Figma, để lộ ≥ 25% card kế (15 §5 "hiện ≥ 1.2–1.5 item"). Card không co dưới bề cần cho nội dung (video giữ 264). Đủ chỗ cho mọi card thì lưới tĩnh theo cột, ẩn nút và thanh tiến trình.
- R5 Mép trái nội dung mọi khối = mép logo (x 20 ở 1280, 252 ở 1920), kể cả chữ hero (sổ 09/11).

## 1. Bảng lệch 1280 so với 1920, từng khối

Số 1920 đọc từ node/ảnh Figma (`docs/figma/img/1-*.png`, snapshot 30/10). "Như 1920" = cùng giá trị, chỉ co theo cột.

| # | Khối (Figma) | 1920 (Figma) | 1280 | Lệch, lý do |
| --- | --- | --- | --- | --- |
| 1 | Header (1:362) | thanh 80 tối noise; logo 100 × 30; 7 mục giữa, gap 40; 3 icon | như 1920, logo x 20, menu giữa logo và icon | Không lệch (F§3) |
| 2 | Hero (1:422) | thẻ 1798 × 827 lùi 61, bo 16; chữ x 252 (rìa 191); H1 100 2 dòng; mũi tên 52 hai bên giữa dọc, cách mép thẻ 60 | thẻ 1280 × 589 tràn mép (`--band-inset` 0), bo 16; chữ x 20; H1 80; câu phụ 18; nút cách 48 (1920: 64); 2 mũi tên gộp góc dưới phải, cách đáy 24, mép phải 24, cách nhau 8 | Ở 1280 rìa thẻ → chữ chỉ 20, không đủ chỗ mũi tên 52 bên trái (cần ≥ 100 = 52 + 24 × 2); nếu giữ chỗ cũ thì mũi tên đè H1. Gộp góc dưới phải như 768 (sổ 10/11 H1). Công tắc bằng `clamp()` theo rìa, không thêm breakpoint (§2.1). Câu CTO 2. Mockup 1920: thẻ 1800 lùi 60, chữ x 252 (Figma 1798, lùi 61), P4 ≤ 2 px |
| 3 | Browse Categories (1:395) | card 336 (ảnh 336 × 220 bo 16, tên Sofia 28), gap 24; 4 trọn + 228 px card 5 trong lề | card ≈ 271 (ảnh 271 × 177), 4 trọn + 76 px (28%) card 5; nút 52 phải tiêu đề; thanh tiến trình cách 32 | Card 3 cột = 292 sẽ lấp kín 1240, card 5 nằm ngoài màn, mất dấu hiệu cuộn (R4). Nút trắng (Figma "next" cam = trạng thái hover, sổ 09/11) |
| 4 | Intro + level (1:453) | display 100 2 dòng, ảnh inline 165 × 94; cột phải 528 từ x 1140 (đoạn 16/27, link Sofia 28 cách 48); level cách 120; 3 card 456 vuông, padding 40, gradient 50% → tối | display 80 (ảnh inline 132 × 75); cột phải 528 từ x 732; 3 card 397 (4 cột), padding 32 | R1, R2. "N Products →" chỉ hiện khi rê/focus (Figma card 1 là hover) |
| 5 | Bestsellers (1:490) | eyebrow + h2 trái, 4 tab phải cùng hàng; 4 card 336 (3 cột), viền #E5E5E5 | 4 card 292; tab giữ 40 cao, hàng tiêu đề + tab rộng ~1010 < 1240 | R1 |
| 6 | Quiz (1:506) | panel 1416 × 570 bo 24, padding 60, 0 padding ngoài (cách khối trên/dưới 120); thẻ trắng 608 từ x 1000; giới thiệu 688 | panel 1240, padding 48; thẻ giữ 608 (bản đồ 152 + lựa chọn 368 như Figma); giới thiệu co còn 536 | Ticket nêu panel 1416: giữ thẻ câu hỏi nguyên kích thước (lựa chọn 80 cao, mô tả 1 dòng), phần co là cột giới thiệu (h2 "Find Your Perfect Gear" ~375 vẫn 1 dòng) |
| 7 | Shop the look (1:560) | ảnh 936 × 816 (8 cột) + cột 456 (4 cột): ô Fits 100, 4 hàng 94 (ảnh 64), panel tổng; gap 24 | ảnh 819 × 714 + cột 397; ô Fits 84, hàng 80 (ảnh 56), gap 16, hàng cách 8, panel padding 24; panel bám đáy (= đáy ảnh) | Ticket nêu 936 + 456. Giữ tỉ lệ 8 + 4 (R1); cột phải nén dọc để cao ≤ ảnh 714 (Figma cột phải = cao ảnh). Hàng 80 vẫn ≥ 44 chạm |
| 8 | Make fitness (1:625) | cao 960 (= 50vw), display 100 3 dòng, "MAKE" foreground, còn lại muted; 3 ảnh rải 280 / 200 / 187 cách mép màn 80 | cao 640 (50vw), display 80; ảnh 187 / 133 / 125 cách mép 53 (theo vw); dòng 2 x 301–979, cách ảnh trái 61, ảnh phải 115 | R2 (lý do chính của R2). Xuống dòng theo Figma: `<br>` sau "fitness" và "your" trong nội dung, không dựa `balance` |
| 9 | Bundle (1:636) | lưới 7 cột: 3 × 2 card ~256; panel 5 cột 576, padding 40 | card 222 (ảnh 198); panel 503, padding 32 | Ticket nêu 3 × 2 + panel 576: giữ 7 + 5 cột (R1); panel 503 đủ cho tên món dài nhất + giá trên 1 dòng (14px). Số liệu demo thật: 5 món $514.00, −15% $77.10, tổng $436.90 (sổ 06/11 E7) |
| 10 | Featured product (1:759) | 2 cột 668 \| 80 \| 668; ảnh 668 × 652 cream bo 16, dấu tròn 113; đáy khối 0 | 580 \| 80 \| 580; ảnh 580 × 566; mô tả 4 dòng như 1920; h2 48 vẫn 1 dòng; bảng thông số 2 cột vẫn 1 dòng mỗi hàng | R1. Cột chi tiết cao hơn ảnh ~100 (1920: ~30), chấp nhận, không sticky |
| 11 | Video demo (1:817) | card 264 (video 264 × 470 + thanh 84), 5 trọn + card 6 trong lề | card giữ 264; 4 trọn + 108 px (41%) card 5 | R4: co về 5 trọn thì card 216, tên sản phẩm còn ~132 px (cắt "…" hầu hết tên) → giữ 264, bớt 1 card trọn. Nút play 52 (sổ 10/11 H2) |
| 12 | Testimonials (1:885) | card 456 (ảnh 456 × 270), 3 trọn + 228 px card 4 | card 360 (ảnh 360 × 213); 3 trọn + 108 px (30%) card 4; tên + Verified + 5 sao vẫn 1 hàng (~275 ≤ 312) | R4 |
| 13 | Why choose (1:992) | ảnh 920 × 876 tràn trái (lề + cột 1 lưới 2 cột), chữ từ x 1000; display 100; ảnh nhỏ 202 (trên phải) và 120 (dưới phải) cách mép 80 | ảnh 600 × 571, chữ từ x 680 rộng 560; display 80; ảnh nhỏ 134 và 80 cách mép 53 | R1, R2. "WHY CHOOSE" ở 80 rộng ~363 (đến x 1043), cách ảnh nhỏ trên 51. Eyebrow xám #999 (sổ 10/11) |
| 14 | Blog (1:1022) | hàng card 336 × 448, 5 bài, card 5 trong lề | demo có 4 bài (`demo-data.json` articles): 4 card vừa khung → lưới tĩnh 4 × 292 × 389 (3 cột), không nút, không thanh tiến trình. 1920 cũng 4 × 336 vừa khít 1416 | R4 (đủ chỗ thì lưới tĩnh). 5 bài trở lên thì thành hàng ngang card ≈ 271 như khối 3 |
| 15 | FAQ (1:1057) | 2 cột 668 \| 80 \| 668; h2 607 1 dòng; ảnh 509 × 542 phải; 2 ô số 260 × 148 đè trái, cách đáy 40 | 580 \| 80 \| 580; h2 xuống 2 dòng (607 > 580); ảnh 442 × 471 (76.2%); ô số 225 × 148 (2 × 39.8%), cách đáy 40 | R1. Ô số giữ cao 148, chữ không co (R3) |
| 16 | Footer (1:1104) | newsletter 3 cột; panel lùi 60 bo 16, padding trên 120; brand + 2 menu 216; trust 4; wordmark 200 | panel tràn mép (`--band-inset` 0), nội dung x 20; wordmark 133 (`10.4vw`) | Không lệch so với foundation (F§4, kit `.site-footer*`) |

Tổng cao: 1280 ≈ 12.330 (bỏ mục trạng thái), 1920 ≈ 13.700 (Figma 13.300; dư chủ yếu do thanh tiến trình 34 × 3 và chữ hiện thật dài hơn chữ Figma, P4).

## 2. Chi tiết dựng

Anatomy, dữ liệu, trạng thái từng khối giữ như `index-mobile-a.md` §1–8 và `index-mobile-b.md` §1–8; dưới đây chỉ phần riêng ≥ 80rem.

### 2.1 Hero (1:422, 1:437)
- Thẻ: `margin-inline: var(--band-inset)`, `aspect-ratio: 1798 / 827`, bo `calc(--radius-card + --space-1)` (16), nằm ngay dưới header, cách 0 (sổ 10/11). Ảnh `cover`, focal point theo merchant.
- Nội dung: `padding-inline` = `--side − --band-inset` (20 | 192), giữa dọc; eyebrow 16/800 → 24 → H1 display (R2) → 32 → câu phụ 18/500 → `clamp(48, 3.333vw, 64)` → nút "Explore Equipment →" cao 52.
- Mũi tên (nút tròn 52, F§6): rìa = `--side − --band-inset`. Rìa ≥ 100: hai bên, giữa dọc, cách mép thẻ 60 (Figma). Rìa < 100: gộp góc dưới phải, prev `inset-inline-start: 100% − 136`, next `inset-inline-end: 24`, đáy 24. CSS mẫu (mockup): `inset-block-start: clamp(50% − 26px, (100px − rìa) × 1000, 100% − 76px)`; số × 1000 là công tắc âm/dương của `clamp()`. Rìa ≥ 100 từ màn ~1736.
- Không lớp tối ≥ 80rem (sổ 10/11, chỉ dưới 1280). Không dot (sổ 07/11). Autoplay theo setting, dừng khi rê/focus (15 §5).
- Slide 2 (1:437) cùng bố cục, chữ là `<p>` (1 h1 mỗi trang).

### 2.2 Hàng ngang (danh mục, video, review; blog khi > 4 bài)
- `<ul tabindex="0" aria-label>` + scroll-snap, `margin-inline-end: −lề`, `padding-inline-end: lề`; card theo R4: danh mục `min(336px, (100vw − lề − 96) / 4.3)`, review `min(456px, (100vw − lề − 72) / 3.3)`, video 264.
- Nút 52 ở đầu khối, căn đáy tiêu đề; đầu/cuối hàng mờ 0.35 + `aria-disabled` (sổ 10/11 câu 5 áp cho mọi bộ phân trang). Thanh tiến trình 2 px cách 32, `aria-hidden`.
- Tất cả card vừa khung: lưới tĩnh theo cột Figma, không render nút và thanh tiến trình.

### 2.3 Level card ≥ 80rem
- Nội dung đáy: nhãn 14/800, tên h3 Sofia 36 (`--font-size-h2`); hàng "N Products →" (gạch trên trắng 24%) ẩn (`max-height: 0; opacity: 0`), hiện khi `:hover` hoặc `:focus-visible` của card, 250 ms; giảm chuyển động thì hiện/ẩn tức thì. Số sản phẩm vẫn trong tên link khi ẩn (đọc "Level fitness Beginner 24 Products").
- Gradient `transparent 50% → --color-background-dark` (Figma 1:389).

### 2.4 Shop the look
- Lưới 12: ảnh `span 8` tỉ lệ 936/816; cột phải `span 4`, flex dọc, khoảng `clamp(16, 1.25vw, 24)`; ô Fits `min-height: clamp(84, 5.2vw, 100)`; hàng `min-height: clamp(80, 4.9vw, 94)`, ảnh `clamp(56, 3.333vw, 64)`; panel `margin-block-start: auto` (đáy panel = đáy ảnh), padding `clamp(24, 3.125vw − 20, 40)`.
- Dòng giảm giá: `color-mix(badge-new 55%, trắng)` 5.41:1 trên panel, cùng cách bundle (sổ 10/11 H6); Figma xanh 2.50:1.

### 2.5 Make fitness
- `min-height: 50vw`, nội dung giữa; ảnh `position: absolute` theo vw: ảnh 1 `top 12.2%, start 4.17vw, 14.6vw`; ảnh 2 `top 40%, end 4.17vw, 10.4vw`; ảnh 3 `top 68.3%, start 4.17vw, 9.75vw`. Ảnh `alt=""`, bo `--radius-card`.

### 2.6 Why choose
- Lưới `calc(lề + (nội dung − 80) / 2) 80 1fr`: ảnh ăn lề trái + nửa trái lưới 2 cột; tỉ lệ 920/876; gradient đáy 70% → tối 80%. Cột chữ giữa dọc, `padding-inline-end` = lề. Ảnh nhỏ `inset-inline-end: 4.17vw`, trên 8.9% (10.5vw), dưới 8.7% (6.25vw).

## 3. Trạng thái ≥ 80rem

Figma không có trạng thái; tất cả là ĐỀ XUẤT, cùng nội dung với `index-mobile-a.md`, `index-mobile-b.md` (skeleton tab, tab rỗng, sheet quiz → dialog ≥ 48rem, hết hàng shop the look/bundle, lỗi thêm giỏ, video lỗi, blog không ảnh). Riêng desktop, vẽ ở mục "Desktop States" cuối mockup:

| Trạng thái | Cách hiện | Nguồn |
| --- | --- | --- |
| Hero thiếu ảnh | nền `--color-background-dark`, chữ giữ, thẻ giữ tỉ lệ | DESIGN "Images" |
| Level card hover/focus | hiện hàng "N Products →", ảnh scale 1.04; focus outline accent 2 px | Figma 1:464 card 1; 05 §3 |
| Hàng ngang đầu/cuối | nút mờ 0.35 + `aria-disabled`, giữ chỗ; nút kia hover cam | sổ 09/11, 10/11 câu 5 |
| Mũi tên hero hover | nền cam, chữ trắng, scale 1.06 (F§6) | sổ 09/11 |
| Menu header | Shop, Collection mở dropdown/mega từ 80rem (F§13, `navigation.md`) | sổ 09/11 overlay |

## 4. Lighthouse

### 4.1 Accessibility (tỉ lệ tính tay như ES1-T278 §9.1)

| Chỗ | Cặp | Tỉ lệ | Kết luận |
| --- | --- | --- | --- |
| Eyebrow 16, câu phụ 18/500 hero (ảnh demo, không lớp tối) | trắng / ~#8B8279 | ~3.76 | Không đạt 4.5. axe để "incomplete" (Lighthouse không trừ), nhưng sổ 09/11 đòi AA: merchant/BA chọn ảnh tối sau vùng chữ (sổ 10/11, không thêm lớp tối ≥ 80rem). Ảnh Figma 1:422 cùng tông → cùng rủi ro |
| H1 80 hero | trắng / ~#8B8279 | ~3.76 | Đạt ≥ 3 (chữ lớn) |
| Mũi tên hero (viền trắng, nền trắng) | nút / ảnh | — | Nền nút trắng đặc, icon #1A1A1A 17.4 |
| Tên danh mục, h2 trên dải tối | trắng / #1A1A1A | 17.4 | Đạt |
| Chữ level card | trắng / gradient tối 50–100% | ≥ 4.5 với ảnh demo | Đạt ở vùng chữ (đáy) |
| Ghi chú quiz, dòng phụ panel | trắng 60% / panel #393942 | 5.27 | Đạt |
| Giảm giá panel (bundle, shop the look) | badge-new 55% + trắng / panel | 5.41 | Đạt |
| Eyebrow why, đoạn why | #999 / #1A1A1A | 6.11 | Đạt |
| Câu FAQ đóng | #4D4D4D / cream | 7.73 | Đạt |

- Vùng chạm desktop: nút 52, nút tròn 52, tab 40 × ≥ 72, link menu 44, icon header 44, hotspot 44, hàng shop the look ≥ 80, card bundle cả card, link "Browse All Setups"/"View Preset Bundles" 44 (≥ 24, F§5).
- Heading: 1 h1 (hero slide 1); h2 mỗi khối (intro 2 h2); h3 trong card. Hàng cuộn `tabindex="0"` + nhãn; tiến trình `aria-hidden`; đồng hồ `role="timer"`, số `aria-hidden`, không aria-live (sổ 10/11).
- Không có chữ < 13 (badge 13).

### 4.2 Performance (desktop ≥ 98)
- LCP: ảnh slide 1 hero, eager + `fetchpriority="high"`, `sizes="(min-width: 80rem) calc(100vw - 2 * var(--band-inset))"` → 1280 tải ~1280w (2x: 2560w), 1920 ~1800w. Ngân sách ≤ 200 KB WebP (DESIGN).
- Màn đầu 1280 × 800: header 80 + hero 589 = 669; tiêu đề "Browse Categories" ở y ~789 (vừa mép màn) → danh mục chính lộ ngay khi cuộn nhẹ (07 §A, §D).
- Mọi ảnh khác `loading="lazy"` + width/height + `aspect-ratio`; ảnh rải make fitness, why dùng `sizes` theo vw (≤ 300 px). Video chỉ poster, bấm mới tải (sổ 09/11).
- CLS: khung ảnh có tỉ lệ; tổng bundle/shop the look và đồng hồ in từ Liquid; hàng "N Products" của level card ẩn bằng `max-height` trong card có tỉ lệ cố định (không đẩy khối).
- 2 họ font (sổ 30/10). `clamp()`/`min()` thuần CSS, không JS đo bề rộng.

### 4.3 SEO
- Link mô tả đích: "Explore Equipment", "Become A Member", "Browse All Setups", "Add Setup To Cart", "Get Started Now", "View Preset Bundles", "Add Bundle To Cart", "View Detail" + phần ẩn " of {product}", "View About Us", tên danh mục, cấp độ, sản phẩm, bài viết.
- Ảnh nội dung có alt (hero, sản phẩm, ảnh shop the look, featured, why); ảnh trang trí `alt=""`.

### 4.4 Best Practices
- Mockup 0 lỗi console ở 1280 và 1920; PNG đúng bề ngang (hàng cuộn tự cắt, `overflow-x: hidden` trên body chỉ trong mockup).

## 5. Settings merchant
Không thêm setting. Dùng sẵn: slideshow (`autoplay`, `overlay_opacity` chỉ dưới 80rem), level (collection), featured collection `products_to_show` 4, blog-posts `articles_to_show`, testimonial `verified` (mặc định tắt, E9). Kích thước 1280 là hằng CSS theo lưới, không phải setting.

## 6. Việc cho Dev

| Khối | Đổi ≥ 80rem | Phía | Mức |
| --- | --- | --- | --- |
| Display (hero, intro, make fitness, why) | `min(var(--font-size-display), 6.25vw)` nếu CTO duyệt câu 1 | FE (CSS) | P3 |
| Hero | thẻ theo `--band-inset`; chữ `padding-inline` = lề − inset; mũi tên theo §2.1 | FE | P2 |
| Hàng ngang | bề card theo R4; lưới tĩnh khi vừa khung (ẩn nút, tiến trình) | FE markup/CSS + BE (module carousel báo "không cuộn được" để ẩn nút) | P2 |
| Quiz | panel = nội dung, thẻ 608 cố định, cột giới thiệu `1fr` | FE | P3 |
| Shop the look | 8 + 4 cột, cột phải nén theo §2.4, panel bám đáy | FE | P2 |
| Bundle | 7 + 5 cột; panel padding `clamp(32, …, 40)` | FE | P3 |
| Make fitness | ảnh rải theo vw, `min-height: 50vw`; locale heading có xuống dòng như Figma | FE | P3 |
| Why choose | lưới lề + nửa trái; ảnh nhỏ theo vw | FE | P3 |
| Level card | hàng "N Products" hiện khi hover/focus ≥ 80rem | FE | P3 |
| FAQ | ảnh 76.2% phải, ô số 2 × 39.8% đè trái, đáy 40 | FE | P3 |
| Ảnh hero demo | chọn ảnh có vùng tối/trơn sau chữ (AA 4.5 cho eyebrow, câu phụ) | BA / dữ liệu store | P3 |

## 7. Đề xuất cho file ngoài phạm vi ticket (không sửa)
- `drafts/designer/_kit/kit.css`: thêm `--display-fluid` (R2) và class mũi tên hero (§2.1) nếu CTO duyệt; `.card-row` thêm biến `--card` theo R4.
- `docs/ui-spec/foundation.md` §1: thêm cột 1280 cho R1–R5; §6 ghi công tắc mũi tên hero.
- `DESIGN.md` "Typography": display 80 ở 1280, 100 từ 1600.
- `docs/ui-spec/index-mobile-a.md`, `-b.md`: dòng "Desktop 1280/1920 là chính Figma" trỏ sang spec này.

## 8. Quyết định CTO đã chốt 11/11 (theo đề xuất, sổ 11/11)
1. Chữ display ≥ 80rem dùng `min(display, 6.25vw)` (80 ở 1280, 100 từ 1600, 1920 không đổi) để Make fitness không đè ảnh rải và H1 hero cân thẻ? Đề xuất: có.
2. Hero 1280: thẻ tràn mép (như panel footer, `--band-inset` 0) bo 16, chữ mép 20, mũi tên gộp góc dưới phải khi rìa < 100 (thay vì thẻ lùi 20 và chữ lùi vào cột 2, trái sổ 09/11)? Đề xuất: có.
3. Hàng ngang 1280: card co để lộ ≥ 25% card kế (danh mục ≈ 271, review 360, video giữ 264), hàng vừa khung (blog 4 bài) thành lưới tĩnh không nút? Đề xuất: có.
