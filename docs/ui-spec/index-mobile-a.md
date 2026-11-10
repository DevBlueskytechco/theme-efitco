KHÔNG CHẮC: (1) Figma chỉ có desktop 1920 và không có trạng thái: mọi bố cục 768/360 và mọi trạng thái là ĐỀ XUẤT phát triển từ 1:359. (2) Ảnh `efx-slide-2.jpg` trên store dev cắt sát đỉnh đầu người mẫu ở khung 4/3 và 3/4 (khác Figma 1:437 còn khoảng trống trên đầu); focal point 25% / 0% (§9.1). Tỉ lệ ảnh ~2.18:1 đo từ bản CDN `?width=960` (960 × 440), không có kích thước gốc; màu nền sau chữ ước lượng bằng mắt trên PNG, không có công cụ lấy mẫu điểm ảnh. (3) demo-data không xuất metafield `reviews.rating`: badge "★ 5.0" trên card 1 và 3 lấy theo Figma, thật thì theo metafield. (4) Giá, % giảm lấy từ demo-data nên khác số tĩnh của Figma (−24%, −17%, −22% thay −25%; tổng shop the look $1,187.98 thay $1,186.99). (5) SRS TE-2 AC2 còn ghi "360 luôn căn giữa", trái sổ quyết định 10/11 (căn trái mép 20): theo sổ, đã hỏi BA ở ES1-T280 (kèm câu rating ở (3)).

# UI spec: Trang chủ 768 và 360, phần A (ES1-T278)

## Thay đổi audit (ES1-T292, audit ES1-T283 A8, A9, A10)

| Audit | Chỗ sửa | Trước | Sau |
| --- | --- | --- | --- |
| A8 | §10, §9.2 | Ảnh hero hiện dần khi cuộn tới (900ms): trễ LCP mobile | Ảnh slide 1 hiện ngay, không reveal; chỉ chữ hero được hiện dần lúc tải (400ms, không chờ cuộn). `sizes` hero sửa theo bề rộng ảnh thật khi `cover` (291vw / 164vw), srcset tối đa 1920w |
| A9 | §9.1 | `efx-slide-2.jpg` focal 66% (360) / 70% (768): chữ đè người mẫu, điểm sáng ~2.7:1 | Giữ `efx-slide-2.jpg` (ảnh có nền phông trơn 40% trái), focal point 25% / 0% cho mọi mốc: vùng chữ 360 và 768 nằm hẳn trên phông trơn, ≥ 5.4:1; `efx-slide-1.jpg` loại (360 không có vùng trơn đủ rộng cạnh mặt người mẫu) |
| A10 | `docs/ui-spec/index.md` dòng đầu | Spec ES1-T252 (gốc live) còn hiệu lực ngầm | Ghi "ĐÃ THAY bởi index-mobile-a.md, index-mobile-b.md (10/11)"; `drafts/designer/ES1-T252/` ngoài phạm vi file, xem §14 |

Giữ nguyên các mục khác. Mockup `drafts/designer/ES1-T278/index.html` chỉ đổi thẻ ảnh hero (focal, srcset/sizes, kích thước 1920 × 880); PNG 360, 768 render lại.

### Thay đổi audit (ES1-T291, audit ES1-T283 A13)

| # | Mục | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | §7 Shop the look, panel | chữ phụ trắng 60% (5.27); dòng giảm giá chữ trắng | `--panel-muted` (6.56), `--panel-saving` (5.64) + icon tag, cặp chung foundation §2 | foundation §2; sổ 10/11 G3 |

Chỉ §7 đổi (trỏ màu). Mockup T278 render lại khi chạm khối shop the look; §6 Quiz, §9.1 ghi ở foundation §25.

Mục đích: người mua trên tablet và điện thoại hiểu Efitco bán gì ngay màn đầu, tới được danh mục, cấp độ, bestseller, quiz, combo mà không mở menu. Story TE-17 (khối thuộc TE-1, TE-2, TE-3, TE-11, TE-12, TE-7). Template `templates/index.liquid`.

Gốc duy nhất: Figma desktop 1:359 (sổ 10/11). Desktop 1280/1920 là chính Figma, không vẽ lại. Không dùng trang live hay ảnh store làm gốc; `docs/ui-spec/index.md` (ES1-T252) chỉ được nhắc ở mục 12 để Dev biết phải đổi gì.

Đầu ra:
- Spec này (khối 1–8; khối 9–16 thuộc ticket phần B).
- `drafts/designer/ES1-T278/index.html` (kit.css, đúng thứ tự trang, trạng thái ở cuối) + `index-768.png`, `index-360.png`.

Thứ tự nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 > bộ kiến thức (`NN §mục`). Thành phần chung theo `docs/ui-spec/foundation.md` (ghi `F§n`).

## 0. Khung chung 768 / 360

| Giá trị | 360 | 768 | Nguồn |
| --- | --- | --- | --- |
| Lề trang / nội dung | 20 / 320 | 20 / 728 | F§1 |
| Khoảng giữa section | 48 | 48 | F§1 (`--section-gap`) |
| Tiêu đề → nội dung | 24 | 24 | F§1 (`--heading-gap`) |
| Eyebrow → tiêu đề | 12 | 12 | Figma 1:465 itemSpacing 12 |
| display / h2 / h3 | 48 / 28 / 22 | 70 / 32 / 24 | F§1 (clamp) |
| Vùng chạm tối thiểu | 44 | 44 | Sổ 09/11, 14 §2 #1083M |
| Thứ tự khối | như Figma | như Figma | 06 §2 |

Nền theo Figma: header + hero + Browse Categories nằm trên dải tối `--color-background-dark` có noise (1:360); intro và Make fitness nền sand `--color-background-sand` (#EBE6E0, 1:453, 1:625); bestseller, shop the look nền trắng; quiz là panel `--color-background-panel` (#393942, 1:506).

---

## 1. Header (Figma 1:362)

Anatomy: nút menu · logo (link trang chủ) · search · account · cart + số lượng.

| | 360 | 768 |
| --- | --- | --- |
| Thanh | `--color-background-dark` + noise, cao 80, sticky, không đè ảnh (sổ 10/11) | như 360 |
| Trái | menu 44 (lùi −12 để icon thẳng mép 20) + logo 100 × 30 | như 360 |
| Phải | search 20, account 24, cart 24; ô 44 liền nhau, ô cuối lùi −12 | như 360 |
| Menu 7 mục | drawer trái (F§15), không hiện ngang | như 360 (menu ngang chỉ từ 80rem, F§14) |

Trạng thái: F§3.2 (icon hover scale 1.08; focus outline trắng 2px; đã cuộn thêm bóng, không đổi cao). Số giỏ `aria-hidden`, số nằm trong tên ("Cart, 2 items").
Settings: dùng sẵn `logo`, `logo_width`, `menu`, `customer_account_menu`, `sticky_header`. Không thêm.

## 2. Hero / slideshow (Figma 1:422 slide 1, 1:437 slide 2)

Figma desktop: thẻ 1798 × 827 bo 24 ngay dưới header (y 80, cách 0), lùi 60 mỗi bên trên dải tối; chữ thẳng x 252 (mép container); eyebrow Sofia 800 16 uppercase, H1 Sofia 800 100 uppercase ls −4% 2 dòng, câu phụ, 1 nút accent "Explore Equipment →"; 2 nút tròn 52 cách mép thẻ 60, giữa cạnh; không dot.

Anatomy: ảnh (LCP) · lớp tối · eyebrow · H1 · câu phụ · nút chính · điều khiển slide.

| | 360 | 768 |
| --- | --- | --- |
| Khung | tràn màn 360 × 480 (3/4), không bo (sổ 07/11) | ĐỀ XUẤT: tràn màn 768 × 576 (4/3), không bo (câu CTO 1) |
| Lớp tối | 30% `--color-background-dark` (sổ 10/11) | 30% |
| Nội dung | căn trái mép 20 (sổ 10/11), đáy khung, padding trên 32 dưới 60 | căn trái mép 20, giữa dọc, rộng ≤ 448 |
| Khoảng | eyebrow → H1 → câu phụ 12; câu phụ → nút 24 | 16; câu phụ → nút 28 |
| Chữ | eyebrow 16, H1 display 48 (2 dòng, ~226 rộng), câu phụ 16/26 500 tối đa 30ch | eyebrow 16, H1 70, câu phụ 16/26 |
| Nút | "Explore Equipment →" cao 48 | cao 48 |
| Điều khiển | 2 dot 44 × 44 (chấm 12), đáy trái, chấm đầu thẳng mép 20; không mũi tên (sổ 07/11) | 2 nút tròn 52 (F§6) góc dưới phải, cách đáy 24, mép 20, cách nhau 8; không dot |
| Ảnh | `object-fit: cover`, theo focal point merchant (TE-2 AC1) | như 360 |

Lý do 768 tràn màn: ở 768 `--band-inset` = 0 (F§1, dải rộng tràn mép như panel footer), nên thẻ không còn lùi so với container như Figma; nếu giữ thẻ trong container thì chữ phải lùi vào trong thẻ, lệch mép logo và khối dưới (trái sổ 09/11 "nội dung hero thẳng mép trái container"). Hai nút ở góc dưới phải để không chồng chữ; tablet là màn chạm nhưng có chỗ, giữ mũi tên như desktop (14 §4).

Trạng thái (ĐỀ XUẤT):
- Không có ảnh: nền `--color-background-dark`, chữ giữ (mockup "Hero: image missing").
- 1 slide: ẩn dot / mũi tên.
- Autoplay (setting `autoplay` có sẵn): dưới 80rem không tự xoay dù bật (07 §D "không carousel tự xoay trên mobile"; 14 §4).
- Đang chuyển slide: chỉ opacity/transform, 500ms; giảm chuyển động thì đổi tức thì.
- Focus: dot/nút outline trắng 2px offset 2 trên ảnh.

A11y: section `aria-roledescription="carousel"` + `aria-label`; dot "Show slide 1 of 2" + `aria-current`; mũi tên "Previous slide"/"Next slide"; chỉ slide 1 có `<h1>`, slide 2 dùng `<p>` cùng kiểu (một h1 mỗi trang).

## 3. Browse Categories (Figma 1:395)

Figma: trên dải tối; h2 trắng "Browse Categories" Sofia 700 48; 2 nút tròn 52 phải; 5 card: ảnh 336 × 220 bo 16 + tên Sofia 700 28 trắng; hàng tràn phải.

| | 360 | 768 |
| --- | --- | --- |
| Header | h2 28, không eyebrow (Figma không có) | h2 32 + 2 nút 52 căn đáy (F§11) |
| Card | rộng `min(70vw, 336)` = 252, ảnh 252 × 165 (336/220) bo 16 | `min(40vw, 336)` = 307, ảnh 307 × 201 |
| Ảnh → tên | 12; tên h3 22 | 12; tên h3 24 |
| Hàng | gap 16, mép trái container, tràn tới mép phải màn, scroll-snap, lộ ~1/4 card kế (15 §5) | lộ ~1/3 card thứ 3 |
| Điều khiển | ẩn nút, vuốt; thanh tiến trình 2px cách 32 (sổ 09/11) | nút 52 + thanh tiến trình |

Trên nền tối: nút tròn nền trắng (viền trắng, F§6), hover cam; thanh tiến trình trắng 12% / thumb trắng (F§11).
Trạng thái: hover ảnh scale 1.04 + tên gạch chân; focus outline trắng quanh card; đầu/cuối hàng nút mờ 0.35 + `aria-disabled`. ĐỀ XUẤT: < 3 collection thì bỏ nút và thanh tiến trình, card xếp lưới tĩnh; 0 collection thì không render khối; collection không ảnh thì ô nền `--color-background-panel` + tên.
A11y: `<ul aria-label="Product categories" tabindex="0">`; mỗi card 1 link, tên link = tên collection, ảnh `alt=""`; nút "Previous categories"/"Next categories".

## 4. Intro + Shop by level (Figma 1:453)

Figma: nền sand, padding 120; trái tiêu đề display 100 uppercase ls −4 "Everything You Need [ảnh 165 × 94 bo 8] to Train." 2 dòng; phải đoạn 16 + link CTA "Become A Member →" (Sofia 28, `.button--link`); cách 120 xuống "SHOP BY LEVEL" + h2 48 "Choose Your Training Level"; 3 card 456 × 456 bo 16, gradient đen 0 → 80% từ 63% xuống đáy, nhãn "LEVEL FITNESS", tên Sofia 36, hover hiện gạch + "24 Products →" (card 1 trong Figma là trạng thái hover).

| | 360 | 768 |
| --- | --- | --- |
| Tiêu đề | display 48, `text-wrap: balance`, 3 dòng; ảnh inline 1.65em × 0.94em (79 × 45) bo 8 | display 70, 2 dòng như Figma; ảnh 116 × 66 |
| Đoạn + link | xếp dưới tiêu đề, cách 24; đoạn → link 12; đoạn ≤ 34rem | 1 hàng: đoạn `1fr` trái, link phải căn đáy, cách 32 |
| Intro → level | 48 | 48 |
| Level | 1 cột, card 320 × 240 (4/3), cách 12 | 3 cột 232 × 232 (1/1 như Figma), cách 16 |
| Nội dung card | padding 24 / 24 / 16; nhãn 14 Sofia 800; tên h3 22; hàng "N Products →" luôn hiện, cao 44, gạch trên trắng 24% | padding 16; tên 24 |
| Gradient | ĐỀ XUẤT: 0 → 85% từ 35% (Figma 63%) dưới 80rem | như 360 |

Lý do: màn chạm không có hover nên số sản phẩm luôn hiện (05 §3, 14 §4); card 232 có khối chữ cao ~110 = 47% card, gradient bắt đầu 63% sẽ để nhãn trên ảnh không phủ (06 "Văn bản trên hình ảnh"; 14 #290D). 360 dùng 4/3 thay 1/1 để 3 card không chiếm 1000px (19 §D6; 03 §8). Ảnh `object-position` 50% 15% giữ đầu người.
Số sản phẩm động: `collection.products_count` (demo: 24 / 12 / 10).
Trạng thái: hover ảnh 1.04; focus outline accent quanh card. Collection trống: ẩn hàng số sản phẩm, giữ card. < 3 card: lưới giữ cột, card co theo.
A11y: tiêu đề display là `<h2>` (h1 là hero); ảnh inline `alt=""`; eyebrow `--color-accent-on-sand`; link card đọc "Level fitness Beginner 24 Products".

## 5. Bestsellers (Figma 1:490)

Figma: eyebrow "BESTSELLERS" accent, h2 48 "What People Are Buying?", 4 tab phải (All, Weight, Portable Fitness, Accessories; cao 40, F§7); 4 card 336 (F§9).

| | 360 | 768 |
| --- | --- | --- |
| Header | eyebrow + h2 | eyebrow + h2 (h2 + 4 tab ~800 > 728 nên tab xuống hàng) |
| Tab | 1 hàng cuộn ngang, cao 44, tràn mép phải để lộ tab bị cắt (cuộn được) | 1 hàng đủ 4 tab (~470), cao 44 |
| Tab → lưới | 24 | 24 |
| Lưới | 2 cột 152, gap 16 ngang / 24 dọc | ĐỀ XUẤT: 4 cột 170, gap 16 (câu CTO 3) |
| Card | F§9: badge inset 8; tên 2 dòng tối đa; giá sale + giá gạch xuống dòng khi hẹp; swatch 32 × 16 | như 360 |

Lý do 4 cột: khối mặc định 4 sản phẩm (TE-3 AC1); 3 cột (F§1 lưới collection) để lẻ 1 card hàng 2 và khối cao gấp đôi. 4 × 170 vẫn rộng hơn card 152 của 360. Nếu merchant đặt `products_to_show` không chia hết cho 4 thì 3 cột.
Dữ liệu demo: P01 −24% ★5.0, P02 New, P03 −17% ★5.0, P04 −22%; swatch theo option Color (Black, Gray, White).
Trạng thái (ĐỀ XUẤT, F§18): đổi tab → lưới `aria-busy`, skeleton đúng số card + spinner + "Loading Weight products" (`role="status"`); tab rỗng → icon + "Nothing In Accessories Yet" + 1 câu + nút "Shop All Products"; tab không có collection → ẩn tab. Card hết hàng: badge Sold out, ảnh 0.6.
A11y: `role="tablist"/"tab"/"tabpanel"`, ←/→ đổi tab, tab chưa chọn `tabindex="-1"`; card 1 link, tên đọc thêm ", 3 colors"; swatch `aria-hidden` (F§9, câu CTO 2 của foundation); giá có "Sale price"/"Regular price" ẩn.

## 6. Quiz (Figma 1:506)

Kết quả quiz (popup sau bước 3, mọi mốc): `docs/ui-spec/quiz-result.md` (ES1-T285).

Figma: panel #393942 1416 × 570 bo 24, padding 60; trái pill accent "● Our most-loved feature", h2 48 trắng "Find Your Perfect Gear", câu phụ, 2 ghi chú icon (20 seconds, No sign-up required); phải thẻ trắng 608 × 450 bo 16: thanh tiến độ accent 1/3 + "Step 1 of 3", h3 "Where do you want to focus?", gợi ý, body map 152 × 256 nền sand bo 12, 3 lựa chọn 80 cao (ảnh tròn 44, tên 18/600, mô tả 14, radio phải; chọn: nền sand + dấu check cam).

| | 360 | 768 |
| --- | --- | --- |
| Panel | ĐỀ XUẤT: tràn mép, không bo, padding 48 / 20 | thẻ trong container 728, bo 24, padding 40 / 32 |
| Phần giới thiệu | xếp trên thẻ: pill → h2 28 → câu phụ → ghi chú (gap 12; ghi chú xuống dòng khi hẹp) | như 360, h2 32 |
| Thẻ câu hỏi | dưới, cách 32; 320 rộng, padding 24 / 16, bo 16 | 664 rộng, padding 24 |
| Body map | ẨN (07 §C "trên mobile ẩn ảnh để giữ ngắn gọn") | 152 cột trái, cao bằng cột lựa chọn |
| Lựa chọn | cả hàng, cao ≥ 72, padding 12 / 16, cách 8 | cao 80 như Figma |

Lý do panel tràn mép ở 360: panel + thẻ trắng lồng nhau trong lề 20 chỉ còn 256 cho lựa chọn; tràn mép giữ thẻ 320 và mô tả 1 dòng (19 §D6). Cùng cách hero 360.
Luồng (TE-11): chọn lựa chọn → sang bước 2, thanh tiến độ cập nhật, focus vào tiêu đề bước mới; kết quả mở popup, < 768 bottom sheet (sổ 09/11; F§16 cỡ L). Không JS: 3 bước hiện dạng form (TE-11 AC1).
Trạng thái (ĐỀ XUẤT): hover lựa chọn viền foreground; focus outline accent quanh cả hàng; đang tìm kết quả: nút trong sheet `aria-busy` + "Matching your gear" (07 §C); không khớp (`empty_text`): sheet "No Exact Match" + nút "Change My Answers" (chính) và "Shop All Equipment" (phụ).
A11y: `<fieldset>` + `<legend>` = câu hỏi, radio thật (ẩn hình, giữ focus), dấu chọn có cả check (không chỉ màu); thanh tiến độ `role="progressbar"` + nhãn; ảnh lựa chọn và body map `alt=""` (nhãn đã đủ).
Settings: dùng sẵn `eyebrow`, `heading`, `subheading`, `note_1`, `note_2`, `collection`, `results_popup`, `empty_text`.

## 7. Shop the look (Figma 1:560)

Figma: eyebrow "SHOP THIS SETUP", h2 48, link "Browse All Setups" phải; ảnh 936 × 816 bo 16 với 4 điểm nóng; cột phải 456: ô "Fits: 2.4×2.0 m" nền sand, 4 hàng sản phẩm (ảnh 64, tên, giá; hàng đang chọn viền cam), panel #393942 bo 16: số món, giảm 10%, tổng, nút "Add Setup To Cart →".

| | 360 | 768 |
| --- | --- | --- |
| Header | eyebrow + h2 28 (2 dòng); link dưới h2, cao 44, gạch chân | eyebrow + h2 32 trái, link phải căn đáy |
| Ảnh | 320 × 279 (giữ 936/816 để điểm nóng đúng vị trí), bo 16 | 728 × 635 |
| Dưới ảnh | 1 cột, cách 24: ô Fits → 4 hàng (cách 12) → panel | ĐỀ XUẤT: lưới `1fr 280`, gap 16: trái ô Fits + 4 hàng, phải panel `position: sticky` (top 80 + 16) |
| Hàng | 64 + tên/giá, padding 12, bo 8; đang chọn viền 2px accent | như 360 |
| Panel | padding 24; dòng 14/500 `--panel-muted` (foundation §2, 6.56); tổng 18/700 trắng; nút full cao 48, cách 16 | như 360 |

Lý do 768: nút "Add Setup To Cart" đưa lên ngang danh sách, gần ảnh (05 nhóm 4 §1.3 "CTA rất gần khi cuộn nhẹ"; 19 §D1 tablet tận dụng bề ngang). Panel dính trong khối, không ra ngoài khối.
Không có dòng ghi chú giảm giá dưới panel (sổ 07/11). Màu panel theo cặp chung của foundation §2 (panel tối G3, sổ 10/11): chữ phụ `--panel-muted`, dòng giảm giá `--panel-saving` (5.64) + icon tag 16 + dấu "−" (xanh Figma chỉ 2.50:1 trên panel; thay chữ trắng của vòng 3 / code ES1-T145 #4 để cùng cart, mini cart, bundle). Bảng §9.1 dòng "dòng phụ panel trắng 60%" không còn áp cho shop the look.
Trạng thái (ĐỀ XUẤT): bấm điểm nóng → hàng tương ứng viền cam + cuộn tới hàng (360); hàng hết hàng: badge Sold out, ảnh 0.6, không tính vào tổng, số món giảm; tất cả hết hàng: ẩn panel (code đã có); đang thêm: nút `aria-busy` + spinner, giữ bề rộng; lỗi thêm giỏ: hộp lỗi `role="alert"` "Setup Not Added" + "Try Again"; thành công: mở mini cart (TE-5). Tổng nên in sẵn từ Liquid để không có ô trống trước khi JS chạy (như ĐỀ XUẤT ES1-T252 §1 khối 7).
A11y: điểm nóng 44 × 44 (chấm 20), tên "Show {product} in the list", `aria-pressed`; hàng: 1 link (tên sản phẩm), ảnh `alt=""`; panel `aria-live="polite"` cho tổng; link "Browse All Setups" mô tả đích.

## 8. Make fitness / inspiration (Figma 1:625)

Figma: nền sand, cao 960; giữa: tiêu đề display 100 uppercase, "MAKE" màu foreground, phần còn lại `--color-muted` (#4D4D4D), 3 dòng; câu phụ 18/600 muted; nút accent "Get Started Now →"; 3 ảnh rải bo 12: trên trái 292, giữa phải 208, dưới trái 195.

| | 360 | 768 |
| --- | --- | --- |
| Padding | 48 | 64 |
| Ảnh | hàng trên: ảnh 1 112 trái, ảnh 2 88 phải (lệch xuống 40); ĐỀ XUẤT: ẩn ảnh 3 | ảnh 1 160 trái, ảnh 2 128 phải (lệch xuống 64), ảnh 3 104 đáy trái ngang nút (cách đáy 64) |
| Chữ | dưới ảnh 32, căn giữa; display 48, 4 dòng, balance | dưới ảnh 24; display 70, 3 dòng, rộng ≤ 15ch |
| Câu phụ | 16/600 muted, ≤ 34ch | 18/600, ≤ 30ch (2 dòng, không chạm ảnh 3) |
| Nút | cách câu phụ 36, cao 48 | như 360 |

Lý do: giữ bố cục "rải" của Figma (ảnh không đè chữ) thay vì hàng ảnh đều; 360 bỏ ảnh 3 vì chỉ trang trí và chỗ trống duy nhất là cạnh nút (cạnh nút cần ≥ 24, 04 §1.5; 19 §D6 "hình ảnh lớn trên màn nhỏ: xoá").
Trạng thái: thiếu ảnh nào thì bỏ ô đó, chữ giữ nguyên; không có nút nếu `button_label` rỗng.
A11y: ảnh `alt=""` (trang trí), tiêu đề `<h2>` một khối, màu 2 tông chỉ là nhấn (không mang nghĩa).

---

## 9. Lighthouse

### 9.1 Accessibility (tính tay: L sRGB tuyến tính, (L1 + 0.05) / (L2 + 0.05))

| Chỗ | Cặp | Tỉ lệ | Kết luận |
| --- | --- | --- | --- |
| Chữ hero 360/768, lớp 30% trên phông trơn `efx-slide-2.jpg` #8B8279 | trắng / #69635C (L 0.127) | 5.93 | Đạt |
| Như trên, điểm sáng nhất của phông trong vùng chữ (#908A80) | trắng / #6D6861 (L 0.141) | 5.49 | Đạt; vùng chữ không chạm da, tóc, dây áo (focal 25% / 0%, dưới) |
| Dot hero 360, nút 52 hero 768 (phi chữ) | trắng / phông như trên | ≥ 5.4 | Đạt ≥ 3 |

Ảnh hero (sổ 10/11 "thiếu AA thì chọn ảnh nền trơn, không tăng lớp tối"), sửa ES1-T292:
- File: `efx-slide-2.jpg` (slide 1, như Figma 1:422). Phông trơn chiếm ~40% bên trái ảnh, người mẫu từ ~40% sang phải (mặt 40–53% ngang, 0–36% dọc; tay trái 45–53% ngang, 43–100% dọc).
- Focal point: x 25%, y 0% (đặt trên file trong Admin, Shopify xuất `object-position`); y không ảnh hưởng ở 360/768 vì ảnh rộng hơn khung, khớp theo chiều cao.
- 360 (khung 360 × 480, ảnh hiện 1047 rộng): cửa sổ thấy 16–51% ngang ảnh; khối chữ x 20–300 = 18–45% ảnh, dọc 32–88%, chỉ trên phông; mặt người mẫu ở mép phải khung.
- 768 (khung 768 × 576, ảnh hiện 1257 rộng): cửa sổ 10–71%; khối chữ x 20–415 = 11–43% ảnh, dọc 21–79%, chỉ trên phông; người mẫu, dây áo, tay ở nửa phải.
- Loại `efx-slide-1.jpg` cho slide 1: phông trơn chỉ 0–29% ngang, mặt ở 49–63%; khung 360 (34% bề ngang ảnh) không thể vừa thấy mặt vừa để chữ trên phông.
- Lớp tối giữ 30%, không tăng. Ảnh khác merchant thay vào: cần vùng trơn ≥ 45% ngang bên trái (ghi trong `info` setting ảnh, §14).
| Tên danh mục, h2 trên dải tối | trắng / #1A1A1A | 17.4 | Đạt |
| Tiêu đề intro, tên lựa chọn quiz đang chọn | #1A1A1A / sand (L 0.796) | 14.0 | Đạt |
| Đoạn phụ trên sand (Make fitness, mô tả lựa chọn đang chọn) | #4D4D4D / sand | 6.81 | Đạt |
| Eyebrow sand | `--color-accent-on-sand` / sand | ~4.8 | Đạt (F§2) |
| Eyebrow trắng, mô tả quiz, giá gạch | accent / trắng; #4D4D4D / trắng | 5.01; 8.45 | Đạt |
| Chữ trên panel #393942 (quiz, shop the look) | trắng / panel (L 0.042) | 11.4 | Đạt |
| Ghi chú quiz, dòng phụ panel | trắng 60% (#B0B0B3, L 0.435) / panel | 5.27 | Đạt |
| Pill quiz, nút chính | trắng / accent | 5.01 | Đạt |
| Check cam trên sand (phi chữ) | accent / sand | 4.04 | Đạt ≥ 3 |
| Viền radio | #6B6B6B / trắng | 5.33 | Đạt ≥ 3 |
| Chữ card level trên gradient | trắng / ảnh tối + 50–85% dark | ≥ 4.5 với ảnh demo | Ảnh sáng ở đáy có rủi ro: dùng ảnh tối phần dưới như Figma |

- Vùng chạm 360: icon header 44, dot 44, tab 44, hàng số sản phẩm level 44, lựa chọn quiz ≥ 72, điểm nóng 44, link "Browse All Setups" và "Become A Member" 44, nút 48; khoảng giữa control ≥ 8 (14 §3).
- Heading: 1 h1 (hero slide 1); h2 mỗi khối (intro có 2 h2: tiêu đề display và "Choose Your Training Level"); h3 trong card và câu hỏi quiz.
- Hàng cuộn có `tabindex="0"` + nhãn; thanh tiến trình `aria-hidden`.
- Không làm mờ chữ khi loading (Lighthouse tính opacity).

### 9.2 Performance
- LCP: ảnh slide 1 (`efx-slide-2.jpg`) eager + `fetchpriority="high"`, hiện ngay khi tải, không reveal (§10). Ảnh `cover` khớp theo chiều cao nên rộng hơn khung: `sizes="(min-width: 80rem) 100vw, (min-width: 48rem) 164vw, 291vw"` (360: 480 × 2.18 = 1047 = 291vw; 768: 576 × 2.18 = 1257 = 164vw); srcset 1080, 1600, 1920w, không vượt 1920 (giới hạn dung lượng LCP mobile). Sửa ES1-T292: `sizes="100vw"` cũ tải ảnh hẹp hơn chỗ hiện, mờ ở DPR 2. Slide 2 lazy.
- Mọi ảnh dưới màn đầu `loading="lazy"` + width/height; ảnh ẩn ở 360 (body map, ảnh 3 Make fitness) là lazy + `display: none` nên không tải.
- Màn đầu 360: header 80 + hero 480 = 560, tiêu đề Browse Categories ở ~608 (thấy được trên máy 360 × 740): danh mục chính lộ ngay (07 §D "đường dẫn danh mục chính trên homepage").
- CLS: mọi ảnh có `aspect-ratio`; tổng shop the look in từ Liquid; panel sticky không đổi layout.
- 2 họ font (sổ 30/10); không video ở màn đầu mobile.

### 9.3 SEO
- Chữ link mô tả đích: "Explore Equipment", "Become A Member", "Browse All Setups", "Add Setup To Cart", "Get Started Now", tên danh mục, tên cấp độ, tên sản phẩm.
- Ảnh nội dung có alt (hero, sản phẩm, ảnh shop the look); ảnh trang trí `alt=""`. Chữ nhỏ nhất 13 (badge) ≥ 12.

### 9.4 Best Practices
- Mockup 0 lỗi console ở 360 và 768; PNG đúng bề ngang viewport (không tràn ngang; hàng cuộn tự cắt).

## 10. Motion
Theo sổ 09/11 và F§19, sửa ES1-T292 (audit A8):
- Màn đầu (header, hero): ảnh slide 1 và lớp tối KHÔNG có hiệu ứng vào (không opacity, clip-path, scale), hiện ngay khi tải: ảnh là LCP, reveal làm trễ LCP mobile (chỉ tiêu ≥ 90, sổ 09/11). Cùng cách `product.md` §14, `blog.md` §7, `article.md`.
- Chữ hero (eyebrow, H1, câu phụ, nút): ĐỀ XUẤT hiện dần ngay lúc tải, không chờ cuộn: opacity 0 → 1 + translate 16px → 0, 400ms, lệch 60ms, ease-out; xong trước 700ms (15 §1 "100–500ms"; 15 §3 chỉ tiêu đề, ảnh chính, CTA). Không áp cho ảnh.
- Chuyển slide: opacity 500ms, chỉ khi người dùng bấm (§2).
- Từ Browse Categories trở xuống: tiêu đề, card hiện dần khi cuộn tới (900ms, lệch 80ms/card, 1 lần).
- Hover 150–250ms; tab đổi lưới fade 250ms; chỉ transform/opacity/clip-path; tắt khi `prefers-reduced-motion` (chữ hero hiện ngay).

## 11. Settings merchant
Không thêm setting. Dùng có sẵn; chỉ đổi mặc định trong template:

| Block | Setting | Default | Ghi chú |
| --- | --- | --- | --- |
| Slideshow slide | Overlay opacity (`overlay_opacity`) | 30 (template, đang 0) | Chỉ áp dưới 80rem (sổ 10/11) |
| Slideshow | Autoplay (`autoplay`) | giữ | Dưới 80rem không tự xoay dù bật (ĐỀ XUẤT, 07 §D) |
| Slideshow slide | Content alignment (`content_alignment`) | giữ | Dưới 48rem luôn căn trái (sổ 10/11) |
| Featured collection | Products to show (`products_to_show`) | 4 | 768: 4 cột khi chia hết cho 4, ngược lại 3 |

## 12. Việc cho Dev (so với mô tả hiện trạng trong `docs/ui-spec/index.md`, ES1-T252)

| Khối | Đổi | Phía | Mức |
| --- | --- | --- | --- |
| Hero 768 | Thẻ 728 bo 12 → tràn màn 4/3 không bo; chữ mép 20 (đang x 112); 2 nút 52 góc dưới phải (đang giữa cạnh); bỏ dot | FE | P2 |
| Hero 360 | Căn trái mép 20 (sổ 10/11); dot đáy trái | FE | P2 |
| Hero 768/360 | `overlay_opacity: 30` | FE (template) | P3 |
| Intro 768 | Tiêu đề display 70 hai dòng như Figma (đang 1 dòng cỡ nhỏ); đoạn + link một hàng | FE | P3 |
| Level < 80rem | Gradient từ 35%; "N Products →" luôn hiện | FE | P3 |
| Quiz 360 | Panel tràn mép (body map đã ẩn) | FE | P3 |
| Shop the look 768 | Lưới `1fr 280` dưới ảnh, panel sticky | FE | P2 |
| Make fitness | Ảnh rải (360: 2 ảnh hàng trên, 768: 3 ảnh) thay hàng 3 ảnh đều | FE | P3 |
| Trạng thái | Skeleton tab, tab rỗng, sheet quiz không khớp, lỗi thêm setup | FE markup + BE JS | P3 |

## 13. Quyết định CTO đã chốt (10/11)

CTO chốt cả các câu dưới đây theo đề xuất (docs/design/decisions.md, 10/11).
1. Hero 768 tràn màn 4/3 không bo, chữ mép 20, 2 nút 52 góc dưới phải, không dot (thay thẻ bo trong container chữ lùi vào)? Đề xuất: có (§2).
2. 360 ẩn ảnh trang trí để khối ngắn: body map quiz và ảnh thứ 3 Make fitness, panel quiz tràn mép? Đề xuất: có (§6, §8; 07 §C, 19 §D6).
3. Bestseller 768 lưới 4 cột 170 (1 hàng như Figma) thay 3 cột của foundation khi số sản phẩm chia hết cho 4? Đề xuất: có (§5).

## 14. Đề xuất cho file ngoài phạm vi ES1-T292 (không sửa ở ticket này)

| File | Đề xuất | Phía |
| --- | --- | --- |
| Admin store dev, Content > Files `efx-slide-2.jpg` | Đặt focal point 25% / 0% | DevOps người (store dev) |
| `blocks/slideshow-slide.liquid` | Ảnh xuất `object-position` từ `image.presentation.focal_point` (kiểm `image_tag`); `sizes` như §9.2; không class reveal trên ảnh slide 1; `info` setting ảnh: "Keep the left 45% plain behind the text" | FE |
| `templates/index.liquid` | `overlay_opacity: 30` cho slide 1, 2 (đã có ở §12) | FE |
| `assets/*.js` (reveal) | Bỏ quan sát reveal cho ảnh hero; chữ hero chạy lúc tải, không chờ IntersectionObserver | BE |
| `drafts/designer/ES1-T252/` | Xoá hoặc thêm `README` "ĐÃ THAY bởi ES1-T278" để không lẫn | Orchestrator |
| 1280 (ticket trang chủ 1280 riêng) | Kiểm focal 25% ở khung thẻ 1280: thẻ gần tỉ lệ ảnh nên lệch nhỏ, chữ vẫn trên phông | Designer |

## 15. Quyết định CTO cần chốt

1. Chữ hero hiện dần lúc tải 400ms hay hiện ngay hoàn toàn? Đề xuất: hiện dần 400ms (§10), ảnh luôn hiện ngay.
2. Focal point hero đặt trên file ảnh (Admin) hay thêm setting `image_position` cho slide? Đề xuất: focal point trên file, không thêm setting (Shopify có sẵn, merchant quen).
