KHÔNG CHẮC: (1) foundation.md, kit.css đọc từ working tree, agent không có git nên không xác nhận đã vào develop. (2) Ảnh mockup lấy từ Files store dev theo tên trong `templates/index.liquid` (`files/efx-*.jpg`), tải được nhưng không có trong demo-data.json. (3) demo-data.json không có thời gian đọc bài viết: card blog trong mockup hiện ngày đăng. (4) Một số ảnh sản phẩm chưa khớp tên (ES1-T245), dùng nguyên URL. (5) Ticket ghi 2 tên `index-768.html`, `index-360.html` nhưng mục Đầu ra đòi 1 file responsive: nộp 1 file `index.html`, PNG `index-768.png`, `index-360.png` là 2 bản đó. (6) PNG dài bị thu nhỏ khi soát: đã soát từng đoạn 360/768/1280 bằng cách tạm ẩn khối, chi tiết dưới 4px chưa kiểm bằng mắt.

# UI spec: Trang chủ 360 / 768 / 1280 / 1920 (ES1-T252)

Mục đích: người mua trên điện thoại và tablet hiểu Efitco bán gì trong màn đầu, vào được danh mục, sản phẩm bán chạy, quiz, combo, bài viết mà không mở menu; mọi khối đạt chỉ tiêu Lighthouse (sổ quyết định 09/11). Story TE-17 (AC-H1, H35), TE-1..TE-16.
Template: `templates/index.liquid`. Figma: frame 1:359, chỉ có desktop 1920 (figma-inventory). Mọi thứ ở 360/768 là thiết kế suy ra, ghi `ĐỀ XUẤT:` khi Figma, foundation và code chưa có.

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T252/index.html`: 1 file responsive, nhúng `../_kit/kit.css`; header, 16 khối, footer; trạng thái ở cuối file.
- `drafts/designer/ES1-T252/index-360.png`, `index-768.png`, `index-1280.png`, `index-1920.png`.

Thứ tự nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 > foundation (ES1-T251) > bộ kiến thức (file `NN`). Thành phần chung (nút, tab, badge, card, accordion, drawer, dialog, toast, skeleton) theo `docs/ui-spec/foundation.md`, spec này không nhắc lại.
Desktop 1280/1920: Figma là chuẩn, mockup desktop chỉ để đối chiếu nhịp; mục 5 ghi các chỗ desktop phải chỉnh để đạt Lighthouse.

---

## 1. Quy tắc chung theo mốc

| Giá trị | 360 | 768 | 1280 | 1920 | Nguồn |
| --- | --- | --- | --- | --- | --- |
| Lề / nội dung | 20 / 320 | 20 / 728 | 20 / 1240 | 252 / 1416 | foundation §1 |
| Khoảng giữa khối (padding band) | 48 | 48 | 120 | 120 | DESIGN Page rhythm |
| Tiêu đề khối → nội dung | 24 | 24 | 40 | 40 | foundation §1 |
| Tiêu đề khối (h2, cỡ `--font-size-h1`) | 33 | 43 | 48 | 48 | foundation §1 |
| Chữ display (hero, intro, banner, why) | 48 | 70 | 100* | 100 | `--font-size-display`; *banner 1280 xem §3.8 |
| Nút chính | cao 48 | 48 | 52 | 52 | foundation §6 |
| Hàng cuộn ngang | vuốt, ẩn nút, có thanh tiến trình | nút 52 ở đầu khối + thanh tiến trình | như 768 | như 768 | sổ quyết định 09/11 |

Quy tắc:
- Giữ đủ 16 khối, đúng thứ tự Figma ở mọi mốc (AC-H1; 06 §2). Chỉ đổi số cột, chuyển sang hàng cuộn, hoặc ẩn ảnh trang trí.
- Hàng cuộn ngang tràn tới mép màn hình, card đầu thẳng mép container, card kế lộ ra (15 §5: ≥ 1.2 item, mỗi item ≤ 80% viewport). `scroll-padding-inline` phải tính bằng vw, không dùng `%` (trong scroll container `%` tính theo chính nó, card đầu sẽ bị snap dính mép màn hình; lỗi đã gặp khi dựng mockup).
- Trang không cuộn ngang ở 360/768/1280/1920 (đã kiểm: PNG đúng bề ngang viewport).
- Vùng chạm mobile ≥ 44 cho mọi control (bảng §4.3).
- Chuyển động: theo foundation §19. ĐỀ XUẤT: không reveal hero (màn đầu) để không trễ LCP (mục 4.1).

## 2. Bảng tổng: khối nào đổi bố cục

| # | Khối (node) | 360 | 768 | ≥ 1280 (Figma) |
| --- | --- | --- | --- | --- |
| 1 | Header 1:362 | menu · logo 100 · search · account · cart | như 360 | logo 140, menu 7 mục giữa, 3 icon |
| 2 | Hero 1:422 | ảnh tràn 4/5, không bo; chữ dưới đáy; dot 44 | ảnh tràn 4/3; chữ giữa trái; 2 nút 52 góc dưới phải | khung bo 12, chữ giữa trái, mũi tên 2 bên |
| 3 | Browse Categories 1:395 | hàng cuộn, card 252 | hàng cuộn, card 307, có nút | card 336 |
| 4a | Intro 1:454 | 1 cột: heading → mô tả → link | 1 cột | 2 cột |
| 4b | Shop by level 1:464 | 1 cột, card 4/3 xếp dọc | 3 cột vuông | 3 cột 456 |
| 5 | Bestsellers 1:490 | tab cuộn ngang; lưới 2 × 2 | tab 1 hàng; lưới 4 cột | tiêu đề trái, tab phải |
| 6 | Quiz 1:506 | intro trên, thẻ câu hỏi dưới; ẩn body map | như 360 nhưng hiện body map | 2 cột |
| 7 | Shop the look 1:560 | ảnh → kích thước → 4 hàng → tổng | ảnh 16/10 rộng hết; dưới 2 cột: hàng \| tổng | ảnh trái, cột phải |
| 8 | Inspiration 1:625 | heading giữa → câu → nút → 3 ảnh xếp so le | như 360, ảnh lớn hơn | 3 ảnh rải 2 bên |
| 9 | Bundle 1:636 | lưới 2 cột; panel dưới | lưới 3 cột; panel dưới | lưới + panel phải |
| 10 | Featured product 1:759 | ảnh 1/1 → thông tin; 2 nút xếp dọc | ảnh 4/3 → thông tin; 2 nút 1 hàng | 2 cột |
| 11 | Video 1:817 | hàng cuộn, card 72vw (≤ 264) | card 264, có nút | card 264 |
| 12 | Testimonial 1:885 | hàng cuộn, card 84vw (≤ 340) | card 340, có nút | card 456 |
| 13 | Why choose 1:992 | ảnh 4/3 trên, chữ dưới; ẩn 2 ảnh nhỏ | 2 cột 1:1, ẩn 2 ảnh nhỏ | 2 cột + 2 ảnh nhỏ |
| 14 | Blog 1:1022 | hàng cuộn, card 252 × 336 | card 307 × 410, có nút | 336 × 448 |
| 15 | FAQ 1:1057 | accordion → ảnh → 2 ô số 2 cột | accordion → ảnh \| 2 ô xếp dọc | 2 cột, ô số đè mép ảnh |
| 16 | Footer 1:1104 | theo foundation §4 | theo foundation §4 | Figma |

## 3. Từng khối

Ghi chú "Code" = class/hành vi đang có trong `assets/base.css`, `assets/critical.css` (đọc 09/11). "FE" = việc Dev FE cần đổi để khớp spec.

### 3.1 Header (1:362)

Anatomy, trạng thái, a11y: foundation §3, biến thể B (đè ảnh) ở đầu trang, C sau 80px cuộn.
- 360/768: [menu 44][logo 100 × 30] … [search 44][account 44][cart 44 + số]. Menu mở drawer trái 90% / 420 (foundation §15). Không mega menu dưới 64rem.
- Chữ, icon trắng đè ảnh: hero có dải tối trên cùng 45% (§3.2) để icon đạt ≥ 3:1 trên ảnh sáng.
- Từ 80rem: mép logo = mép chữ hero = mép khối dưới (sổ quyết định 09/11). ĐỀ XUẤT (mockup): khung hero lùi `max(0, min(3.2vw, mép container − 24))`, nên ở 1280 hero tràn hết bề ngang, ở 1920 lùi 61 như Figma. Lý do: ở 1280 lề container 20 < 41 (3.2vw), logo trắng sẽ nằm ngoài khung ảnh, trên nền trắng (đã thấy khi dựng mockup). FE kiểm `critical.css` ở 1280–1440.

### 3.2 Hero / slideshow (1:422, 1:437)

Anatomy: ảnh slide · eyebrow "Trusted by 10,000+ athletes" (trắng như Figma) · h1 display 2 dòng "Level Up / Your Fitness" · câu phụ · nút "Explore Equipment →" · điều khiển (dot hoặc 2 nút 52).

| | 360 | 768 | ≥ 1280 |
| --- | --- | --- | --- |
| Khung | tràn màn, không bo, 4/5 (360 × 450) | tràn màn, không bo, 4/3 (768 × 576) | 1798/827, bo 12, lùi theo §3.1 |
| Vị trí chữ | đáy, padding-block-end 60 | giữa trái, rộng ≤ 30ch | giữa trái |
| H1 | 48, 2 dòng | 70 | 100 |
| Điều khiển | dot 44 × 44 (chấm 16 × 8), giữa đáy | 2 nút 52 góc dưới phải, cách mép 20/24 | mũi tên 2 bên (≥ 100rem); 80–100rem như 768 |
| Lớp tối (ĐỀ XUẤT) | dọc: 45% → 15% (16%) → 65% (28%) → 85% (đáy) | ngang: 80% → 72% (35%) → 55% (55%) → 0 (80%) + dải trên 40% | ngang: 60% → 30% (40%) → 0 (60%) |

- Mobile theo sổ quyết định 07/11 (ảnh tràn, không bo, không mũi tên, dot 44). Code đã có (`base.css` "Mobile (ảnh review 15)").
- 768: ĐỀ XUẤT dùng nút 52 thay dot vì 768 có cả màn cảm ứng lẫn cửa sổ desktop hẹp; đặt góc dưới phải để không đè chữ (căn trái cùng mép logo). Nguồn: 14 §4, 15 §5.
- Không autoplay trên mobile (07 §D, 14 §4). Slide có setting `video`: dưới 48rem chỉ hiện ảnh poster, không tự chạy (sổ quyết định 09/11 Performance).
- Tương phản: xem §4.2. Lớp tối là CSS, không phải ảnh.
- Thiếu ảnh: nền `--color-background-dark`, chữ trắng 16.7:1 (DESIGN Images).
- Settings: ĐỀ XUẤT thêm `mobile_image` (Mobile image, image_picker, mặc định trống = dùng `image`) cho slide: ảnh ngang 1798/827 cắt 4/5 mất chủ thể (19 §D6 "Big pictures small screens"). Không chặn ticket: thiếu thì dùng focal point của `image`.

### 3.3 Browse Categories (1:395), band tối

- Header khối: h2 "Browse Categories" + nút 52 (≥ 48rem). Không eyebrow (Figma).
- Card: ảnh 336/220 bo 16, alt rỗng; tên h3 28/34 (22 ở 360) trắng; cả card là 1 link.
- 360: card `min(70vw, 336)` = 252, gap 16, lộ 1/4 card thứ 2. 768: `min(40vw, 336)` = 307. Thanh tiến trình cách 32.
- Code khớp (ES1-T174, ES1-T250). Ít hơn 5 collection: hiện số card có, không kéo giãn (AC-H9).

### 3.4 Intro + Shop by level (1:453), band sand

- Intro: h2 display "Everything You Need [ảnh] to Train." Ảnh inline 1.65em × 0.94em, alt rỗng; ở 360 ảnh rơi xuống đầu dòng 3 (để `text-wrap` chia, không `<br>` cứng). Mô tả `--color-muted` (6.81:1 trên sand). Link CTA "Become A Member →" cao 44.
- 360/768: 1 cột; từ 64rem 2 cột (code `.rich-text`).
- Shop by level: eyebrow `--color-accent-on-sand`, h2. Card ảnh + lớp tối + "Level Fitness" 14 + tên + hàng "N Products →".
  - 360: 1 cột 320 × 240 (4/3), gap 16 (ES1-T174, code). 768: 3 cột vuông 232. Từ 80rem padding chữ 40.
  - ĐỀ XUẤT: hàng "24 Products →" và vạch kẻ luôn hiện khi `(hover: none)` hoặc dưới 64rem. Figma chỉ hiện ở card đang hover (Beginner); màn cảm ứng không có hover nên số sản phẩm không bao giờ thấy (05 §2 affordance; 14 §4).
  - ĐỀ XUẤT lớp tối: trong suốt tới 30%, 80% ở 65%, 90% ở đáy (code đang theo Figma 1:469 cao 36.8%). Chữ "Level Fitness" 14px nằm ở ~62% chiều cao card 4/3: lớp Figma ở đó chỉ ~37%, ảnh sáng thì < 4.5:1.
  - Số sản phẩm lấy `collection.products_count` (24 / 12 / 10 theo demo-data).

### 3.5 Bestsellers (1:490)

- Header: eyebrow, h2, hàng tab. Dưới 64rem tab nằm dưới tiêu đề (code ES1-T174).
- 360: tab cuộn ngang tới mép, cao 44; lưới 2 cột card 152, gap 24 / 16. 768: tab vừa 1 hàng; lưới 4 cột (đúng 4 sản phẩm mặc định D7, code).
- Card: foundation §9. Dữ liệu demo: Ativafit Lava 66 lb Adjustable $379.99 / $499.99 (-24%), Iron Core Kettlebell 16 kg $119.00 (New), FlexFold Adjustable Bench $189.99 / $229.00 (-17%), Revllen Pro Speed Rope $34.99 / $44.99 (-22%). Figma ghi -25% cả 3: % tính từ dữ liệu (sổ quyết định 07/11).
- Rating "5.0" chỉ hiện khi có metafield (SRS Q2); mockup giữ trên card 1, 3 như Figma.
- ĐỀ XUẤT: link "View all products in {collection}" dưới lưới ở mọi mốc (locale `featured_collection.view_all_suffix` đã có). Nguồn 07 §G "Nút Xem tất cả sản phẩm không cần mở menu", 04 §2.
- Trạng thái: đổi tab → skeleton 2/4 card + `aria-busy` + "Loading {tab} products…" (`role=status`); tab rỗng → empty state "No products in this collection yet." + "Shop All Products" (mockup cuối file).

### 3.6 Quiz (1:506), panel `--color-background-panel`

- Intro: pill accent "Our most-loved feature", h2 "Find Your Perfect Gear", câu phụ 18, 2 ý (20 seconds, No sign-up required) icon 18.
- Thẻ câu hỏi trắng bo 16: thanh tiến trình 4px + "Step 1 of 3", h3 câu hỏi, gợi ý 14 muted, body map 152 × 256, 3 lựa chọn (thumb 44 tròn, nhãn 18/600, mô tả 14, vòng chọn 24).
- 360: panel padding 32/16/16, intro trên, thẻ dưới; body map ẩn (code `display: none` dưới 48rem, ảnh lazy không tải). Lựa chọn cao ≥ 72, cả hàng là vùng bấm.
- 768: panel padding 40; thẻ có body map trái + lựa chọn phải. Từ 64rem 2 cột.
- Đang chọn: nền sand, vòng accent có dấu check (không chỉ màu). Focus: outline accent trên cả hàng.
- Kết quả: popup (≥ 48rem dialog L 1120; < 48rem bottom sheet) theo sổ quyết định 09/11, code `.quiz__dialog`. Rỗng: chuỗi `quiz.empty_text` + nút "Browse the collection". Mockup cuối file.
- 0 nút "Next" ở bước 1: Figma không có, giữ theo code (chọn là sang bước).

### 3.7 Shop the look (1:560)

- Header: eyebrow "Shop this setup", h2, link "Browse All Setups" (dưới tiêu đề ở 360, bên phải từ 48rem).
- Ảnh có 4 hotspot: chấm 20 trong vùng bấm 44, viền tối + quầng sáng (code). Đang chọn: chấm đặc 24.
- Ô "Fits: 2.4×2.0 m / Folds flat when you're done." nền sand. 4 hàng sản phẩm (thumb 64, tên, giá; hàng chọn viền accent 2px). Tổng trên panel: "4 items", "Setup Discount (10%)", "Total", nút "Add Setup To Cart →".
- Dữ liệu (collection `figma-setup`): 379.99 + 189.99 + 549.00 + 69.00 = $1,187.98; giảm 10% = −$118.80; tổng $1,069.18. Figma ghi $1,186.99: số trong theme tính từ dữ liệu.
- 360: 1 cột: ảnh 936/816 → ô kích thước → 4 hàng → tổng.
- 768 ĐỀ XUẤT: ảnh rộng hết 16/10; dưới chia 2 cột: trái ô kích thước + 4 hàng, phải panel tổng (sticky trong khối). Lý do: xếp 1 cột ở 728 để nút "Add Setup To Cart" cách ảnh > 1 màn hình; 2 cột giữ tổng tiền ngay cạnh danh sách (05 §1 CTA gần nội dung; 19 §D1 tablet tận dụng bề ngang). Code hiện 1 cột tới 64rem (ES1-T145 #6): FE.
- Không dòng ghi chú giảm giá dưới tổng (sổ quyết định 07/11).
- Đang thêm: nút `aria-busy` + spinner, giữ bề rộng. Lỗi: alert §18 foundation với chuỗi `shop_the_look.error`. Hết hàng toàn bộ: nút disabled (code).

### 3.8 Inspiration banner (1:625), band sand

- h2 display căn giữa: "Make" màu `--color-background-sand-foreground`, phần còn lại `--color-muted` (CR-7). Câu 18/700 muted. Nút "Get Started Now →".
- 360/768 ĐỀ XUẤT: 3 ảnh xếp 1 hàng so le dưới nút (96/120/80 ở 360; 152/200/120 ở 768), `aria-hidden`, lazy. Giữ ý "ảnh rải" của Figma mà không đè chữ. Code hiện xếp hàng đều, 12.5rem mỗi ảnh: FE đổi cỡ và lệch dọc.
- Từ 80rem: ảnh rải theo mép màn hình, cách mép 4.2vw (Figma 80/1920), cỡ theo vw (15.2 / 10.8 / 10.2vw). Heading `min(--font-size-display, 5.2vw)` (66px ở 1280). Lý do: ở 1280 heading 100px rộng ~900, ảnh 292 sẽ đè chữ; mockup ban đầu tràn ngang 57px vì ảnh đặt âm ngoài container.

### 3.9 Bundle builder (1:636), band cream

- Header: eyebrow, h2, link "View Preset Bundles".
- Tile: thẻ trắng bo 12, ảnh cream 1/1, tên 16/500, giá; vòng chọn 22 góc phải trên (trang trí, input phủ cả thẻ). Đang chọn: viền accent 2px + vòng accent có check.
- Panel "Your Bundle" + pill số món, dòng món, Subtotal, "Bundle discount (N%)", thanh tiến trình, ổ khoá + "Add 1 more item to unlock 15% off", Total, nút "Add Bundle To Cart →".
- Bậc giảm theo setting mặc định: 2 món 10%, 3 món 15% (E7). Mockup ở trạng thái 2 món: $259.00 + $69.00 = $328.00, −$32.80, tổng $295.20. Chữ giảm giá trên panel dùng chữ sáng (code ES1-T145 #4), không dùng xanh Figma.
- 360: lưới 2 cột (tile 152), panel dưới. 768: 3 cột, panel dưới. Từ 64rem panel phải.
- ĐỀ XUẤT (< 64rem, cần BE): thanh dính đáy "N Items · Total · Add Bundle To Cart" khi panel ngoài màn hình, ẩn khi panel đã thấy. Lý do: ở 360 panel nằm dưới 6 tile (~1100px), người mua chọn món mà không thấy tổng thay đổi (05 §6 phản hồi tức thì; 14 #1097M). `position: fixed` nên 0 CLS. Mockup cuối file. Không làm thì vẫn đạt Lighthouse.
- Trạng thái: rỗng (0 Items, câu `bundle_builder.empty`, nút disabled), tile hết hàng (badge Sold out, ảnh 0.6, input disabled), lỗi thêm giỏ (alert, chuỗi `bundle_builder.error`).

### 3.10 Featured product (1:759)

- Ảnh cream bo 12, dấu tròn 1:761 (72 ở 360, cách góc 12; 113 từ 48rem, cách 24 — ES1-T174 §2).
- Thông tin: eyebrow "Featured product · Free weights", h2, đồng hồ "Sale ends in 22 36 28" (ô 44), giá sale + giá gạch + badge -24%, sao + (4.9) + 341 reviews, mô tả, bảng 4 thông số (dòng lẻ sand), "Add To Cart" (icon túi) + "View Detail →".
- 360: ảnh 1/1 → thông tin; 2 nút xếp dọc full width, cách 12 (04 §1 mobile). Bảng: nhãn 38%, giá trị căn phải, cho xuống dòng.
- 768 ĐỀ XUẤT: ảnh 4/3 (ảnh `contain` trên cream, không cắt sản phẩm) để thông tin và nút lên gần màn đầu khối; 2 nút 1 hàng. Code hiện 1/1 tới 64rem: FE.
- "View Detail" thêm phần ẩn " of {product}" trong link (tên đọc được giữ đầu bằng chữ thấy được, không lệch label-in-name).
- Hết giờ sale: ẩn đồng hồ (R8, code). Đang thêm: nút loading. Hết hàng: "Sold out" disabled (foundation §6).

### 3.11 Video demo (1:817)

- Header: eyebrow "Video demo", h2, nút 52. Card: poster 264/470 + nút play 56 giữa (E6) + hàng sản phẩm 84 (thumb 52 tròn, tên 1 dòng, giá).
- 360: card `min(72vw, 264)` = 259, lộ ~20% card kế. 768 trở lên 264.
- Không tự phát, không tải video trước khi bấm (mục 4). Nền khối trắng (ảnh export đen là nền trong suốt).
- ĐỀ XUẤT trạng thái lỗi: thẻ nền tối, icon !, "This video can't play right now." + link tới sản phẩm (chuỗi mới, Figma không có; 05 §4). Mockup cuối file.

### 3.12 Testimonials (1:885), band cream

- Card trắng bo 12: ảnh 456/270, tên + sao (`role=img` "Rated 5 out of 5"), tiêu đề 18/700, quote muted, gạch, sản phẩm đính kèm (thumb 56, tên, giá). Verified tắt mặc định (E9).
- 360: hàng cuộn, card `min(84vw, 340)` = 302. 768: card 340, nút 52 + thanh tiến trình. 1280+: 456.
- FE: code đang lưới 2 cột ở 48rem, 3 cột ở 80rem. Sổ quyết định 09/11 xếp testimonial vào "hàng ngang" có nút + thanh tiến trình: đổi thành hàng cuộn ở mọi mốc.

### 3.13 Why choose (1:992), band tối

- 360: ảnh 4/3 tràn màn trên, gradient đáy hoà vào nền; chữ dưới: eyebrow, h2 display 48 "Why Choose Efitco?", đoạn văn `--color-muted-on-dark` (5.85), nút "View About Us →". Ẩn 2 ảnh nhỏ (trang trí, alt rỗng, không tải).
- 768: 2 cột 1:1, ảnh cao ≥ 560 tràn mép trái, chữ phải căn giữa dọc. Vẫn ẩn 2 ảnh nhỏ (không đủ chỗ cạnh h2 70px).
- 1280+: Figma 920 | 1000, 2 ảnh nhỏ.
- Eyebrow "We are about" trên nền tối: xem §4.2 và câu hỏi CTO 2.

### 3.14 Blog (1:1022)

- Card: foundation §10. Header có nút 52 + thanh tiến trình (sổ quyết định 09/11; code đã có từ ES1-T250).
- 360: 252 × 336; 768: 307 × 410; 1280+: 336 × 448.
- Dữ liệu: 4 bài (Figma 5) → hiện 4, không kéo giãn (AC-H27). Dòng meta: thời gian đọc tính trong Liquid; mockup hiện ngày đăng vì demo-data không có nội dung bài.

### 3.15 FAQ + số liệu (1:1057), band cream

- Accordion foundation §13 (+ cam bên trái, hàng ≥ 56, mở sẵn câu 1, cho mở nhiều).
- 360: accordion → ảnh 509/542 → 2 ô số cạnh nhau (152 mỗi ô, padding 16, số 28). ĐỀ XUẤT: code đang xuống 1 ô mỗi hàng khi < 10rem (160); giảm ngưỡng còn 9rem để 2 ô vẫn 1 hàng ở 360, nội dung ô ("360+", "Home gym gear in stock.") vừa 120. FE.
- 768 ĐỀ XUẤT: accordion rộng hết; dưới là ảnh vuông (7fr) + 2 ô xếp dọc (5fr). Code xếp dọc toàn bộ tới 64rem: FE.
- Ô accent: chữ trắng trên accent 5.01; ô tối: chữ trắng 17.4.

### 3.16 Footer (1:1104)

Theo foundation §4 (newsletter xếp dọc ở 360, 2 menu là accordion, trust 2 × 2 ở 360 / 4 cột ở 768, wordmark, đáy). Viền ô email 100% `--color-muted-on-dark` (sổ quyết định 09/11). Link "Shipping policy", "Refund policy" trong Information (foundation ĐỀ XUẤT).
- FE: `.site-footer__input` đang 14px từ 48rem; giữ 16 ở mọi mốc (foundation §12, không zoom iOS/iPadOS).
- Ảnh nhỏ newsletter: chỉ hiện khi merchant chọn (code); mockup không có ảnh vì demo-data không có.
- Lỗi/thành công: chữ trắng + icon (không chữ sale trên nền tối, foundation §4). Mockup cuối file.

## 4. Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

### 4.1 Performance

- Phần tử LCP: ảnh slide 1 của hero ở mọi mốc (360 × 450 mobile, 768 × 576 tablet, 1798 × 827 desktop). `loading="eager"`, `fetchpriority="high"`, srcset 360/720/1080/1440, `sizes="100vw"` (< 80rem). ≤ 200 KB WebP (ADR 0003).
- Không reveal, không clip-path mở dần trên hero và chữ hero ở màn đầu: phần tử `opacity: 0` hoặc bị cắt không được tính LCP cho tới khi hiện, LCP trễ thêm 900ms (`--motion-reveal`). Reveal chỉ cho khối dưới màn đầu (ĐỀ XUẤT; 15 §3 "chỉ tiêu đề/ảnh chính/CTA", 22 §13).
- Lazy: mọi ảnh còn lại, gồm slide 2, ảnh danh mục, intro inline, level, sản phẩm, body map, thumb quiz, ảnh shop the look, ảnh rải, poster video, ảnh review, why, blog, FAQ, ảnh newsletter. Ảnh ẩn bằng `display: none` dưới 48rem (body map, 2 ảnh nhỏ why) không tải.
- Video: poster là `<img>` lazy; iframe/`<video>` chỉ tạo khi bấm play. Slide hero có video: dưới 48rem chỉ poster.
- Font: 2 họ (Sofia Sans Condensed 700/800, Inter 400/500/600/700) qua `font_picker`, `font-display: swap`; preload duy nhất Sofia 800 (chữ h1 hero ở màn đầu).
- CLS 0: hero có `aspect-ratio` theo mốc; mọi `<img>` có width/height; đồng hồ, số tổng bundle/shop the look giữ chỗ (code); header đè bằng `position: absolute`; thanh dính đáy bundle (nếu làm) `position: fixed`.
- JS: các module khối (slideshow, carousel, quiz, bundle, shop the look, video, countdown, tab) nạp lười theo `data-lazy-module` khi khối gần viewport (code).

### 4.2 Accessibility

Tính tay theo WCAG, L = độ sáng tương đối, tỉ lệ = (L1 + 0.05) / (L2 + 0.05).

| Chỗ | Cặp | Tỉ lệ | Kết luận |
| --- | --- | --- | --- |
| Chữ hero desktop, overlay 0 (template đang đặt `overlay_opacity: 0`) | trắng / nền ảnh Figma ~#8B8279 (L 0.229) | 1.05 / 0.279 = 3.77 | Chỉ đạt chữ lớn; eyebrow 16/800 và câu phụ 18 KHÔNG đạt 4.5 |
| Chữ hero desktop, lớp tối 20% | trắng / mix 20% #1E1E1E (L 0.159) | 5.02 | Đạt. Lớp ĐỀ XUẤT ≥ 27% tại vùng chữ (§3.2) |
| Chữ hero mobile, lớp 65% trên ảnh trắng xấu nhất | trắng / #6D6D6D (L 0.152) | 5.20 | Đạt từ 28% chiều cao trở xuống (eyebrow bắt đầu ~29%) |
| Chữ hero tablet, lớp ≥ 72% (vùng chữ nhỏ ≤ 35% bề ngang) | trắng / ≤ #5A5A5A | ≥ 6.5 | Đạt; h1 tới 49% bề ngang có lớp ~60% → 4.43, đạt chữ lớn |
| Eyebrow "We are about" trên nền tối | accent #C8400E (L 0.160) / #1E1E1E (L 0.013) | 3.33–3.48 | KHÔNG đạt cho chữ 16px → Lighthouse `color-contrast` fail (nền đặc, axe đo được). Câu hỏi CTO 2 |
| Đề xuất accent trên tối | `color-mix(accent 75%, --color-background-dark-foreground)` ≈ #D6704A (L 0.264) / #1E1E1E | 4.98 | Đạt |
| Eyebrow trên cream (bundle, testimonial, FAQ) | accent / #F5F5F1 (L 0.911) | 4.58 | Đạt (sát ngưỡng; merchant đổi màu có thể mất) |
| Chữ phụ panel quiz, shop the look, bundle | mix 60% trắng / #393942 | 5.28 | Đạt (DESIGN) |
| Trust bar footer | #999 / panel footer ~#262626 | 5.34 | Đạt |

Rủi ro khác và cách thiết kế đã tránh:
- Chữ trên ảnh: axe đánh dấu "incomplete" (không đo được nền ảnh) nên Lighthouse không bắt; sổ quyết định 09/11 vẫn đòi AA → lớp tối CSS ở hero, level card (§3.4), card blog (foundation §10).
- Tên riêng cho mọi control: nút 52 ("Previous collections", "Next videos"…), dot ("Go to slide 1"), hotspot ("Show product 1 in this setup"), play ("Play video: {product}"), icon header ("Cart, 2 items"), social, localization, swatch (tên màu).
- Một h1 (hero slide 1; slide 2 dùng h2 hoặc `<p>`), h2 mỗi khối, h3 trong card; không nhảy bậc. Card là 1 link (`::after` phủ), ảnh card alt rỗng khi tên đã là link.
- Vùng chạm 360: icon header 44, dot 44, tab 44, swatch 44 (`::after`), hotspot 44, play 56, lựa chọn quiz ≥ 72, tile bundle cả thẻ, hàng accordion 56, link footer 44, nút 48. Nhỏ nhất là 44.
- Chữ nhỏ nhất 13 (badge, `--font-size-xs`) ≥ 12. Body 16 ở mọi mốc.
- Hàng cuộn: `<ul aria-label>` + `tabindex="0"` (scrollable-region-focusable); thanh tiến trình `aria-hidden`.
- Đồng hồ: `role="timer"` + nhãn đầy đủ; không đọc lên mỗi giây.
- Tab: `role=tablist/tab/tabpanel`, `aria-selected`.
- Không có popup mở lúc tải trang ở trang chủ (newsletter, before-you-leave theo ticket overlay).

### 4.3 SEO

- Chữ link mô tả đích: "Explore Equipment", "Become A Member", "Browse All Setups", "View Preset Bundles", "Get Started Now", "View About Us"; "View Detail" có phần ẩn tên sản phẩm; card blog dùng tiêu đề bài làm link. Không "Read more", "Learn more" đứng một mình.
- Ảnh nội dung có alt (sản phẩm = tên; hero, shop the look, why = mô tả từ alt Shopify); ảnh trang trí `alt=""`.
- Link thật `<a href>` qua `routes.*`; tab là `<button>` nhưng có link "View all" crawl được (ĐỀ XUẤT §3.5).

### 4.4 Best Practices

- YouTube: dùng `youtube-nocookie.com`, chỉ chèn iframe khi bấm play. Iframe YouTube nạp sẵn đặt cookie bên thứ ba và có lỗi console → mất điểm "Uses third-party cookies" / "Browser errors".
- Ảnh đúng tỉ lệ: mọi khung có `aspect-ratio` + `object-fit`; ảnh sản phẩm `contain`, ảnh lifestyle `cover`.
- 0 lỗi console ở 4 mốc mockup (render_mockup).

## 5. Desktop (1280, 1920): chỉ chỗ chỉnh để đạt Lighthouse

1. Hero: thêm lớp tối (§3.2, §4.2). Template đang `overlay_opacity: 0`; DESIGN mặc định 30%. Câu hỏi CTO 1.
2. Eyebrow trên nền tối (Why choose): đổi màu (§4.2). Câu hỏi CTO 2.
3. Không reveal hero (§4.1).
4. Iframe video chỉ khi bấm, nocookie (§4.4).
5. Hero 1280–1440: khung không lùi vào trong mép logo (§3.1), tránh logo/icon trắng trên nền trắng (lỗi tương phản thật, axe đo được vì nền đặc).

## 6. Settings merchant

Không đổi setting có sẵn. ĐỀ XUẤT thêm (chờ duyệt, không chặn FE):

| Block | Tên (sentence case) | Kiểu | Mặc định | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| slideshow-slide | Mobile image | image_picker | trống (dùng Image) | chỉ dùng dưới 48rem | 19 §D6 |
| slideshow-slide | Overlay opacity (có sẵn) | range | 30 (template trang chủ đang ghi 0) | 0–80 | DESIGN Images |
| container | Show on mobile | checkbox | bật | ẩn dưới 48rem | 07 §D; câu hỏi CTO 3 |

## 7. Trạng thái (mockup cuối file)

Featured collection đang tải và tab rỗng; card hết hàng (`Hết hàng toàn bộ`, $1,000.00, Sold out), card không ảnh (`Sản phẩm không có media`, $34.00); bundle rỗng, tile hết hàng, lỗi thêm giỏ, thanh tổng dính đáy; nút thêm giỏ đang chạy; video lỗi; newsletter lỗi và thành công trên nền tối; quiz kết quả (bottom sheet ở 360, dialog từ 768) và câu kết quả rỗng. Tất cả ĐỀ XUẤT theo foundation §6, §12, §16, §18; Figma không có trạng thái (figma-inventory).

## 8. Việc FE (lệch giữa code 09/11 và spec)

| Khối | Đổi | Mức |
| --- | --- | --- |
| Hero | Lớp tối theo mốc; 768 nút 52 góc dưới phải; khung 80–100rem không lùi quá mép container | P2 (A11y) |
| Why choose | Màu eyebrow trên nền tối | P2 (Lighthouse fail) |
| Testimonial | Hàng cuộn + nút + thanh tiến trình ở mọi mốc (đang lưới 2/3 cột) | P2 (sổ quyết định 09/11) |
| Shop the look | 768: ảnh 16/10 + 2 cột | P2 |
| FAQ | 360: 2 ô số 1 hàng (ngưỡng 9rem); 768: ảnh + ô số 2 cột | P3 |
| Featured product | 768: ảnh 4/3, 2 nút 1 hàng | P3 |
| Inspiration | 360/768 ảnh so le; 80rem ảnh theo mép màn hình, heading ≤ 5.2vw | P3 |
| Level card | Hàng "N Products" luôn hiện khi không hover; lớp tối 30% → 80% (65%) → 90% | P3 |
| Footer | Ô email 16px ở mọi mốc | P3 |
| Hàng cuộn | `scroll-padding-inline` tính bằng vw (kiểm lại các hàng hiện có) | P3 |
| Bundle | Thanh tổng dính đáy < 64rem (FE1 markup + BE1 JS, nếu CTO nhận) | ĐỀ XUẤT |

## 9. Quyết định CTO cần chốt

1. Hero: thêm lớp tối CSS (mobile dọc 65–85% vùng chữ, tablet ngang 80% → 0, desktop ngang 60% → 0) thay `overlay_opacity: 0` hiện tại, chấp nhận ảnh desktop tối hơn Figma ở nửa trái? Đề xuất: có; nền ảnh Figma chỉ cho 3.77:1, eyebrow và câu phụ không đạt AA (sổ quyết định 09/11 đòi AA cả chữ trên ảnh).
2. Eyebrow trên nền tối dùng màu dẫn xuất `color-mix(in srgb, var(--color-accent) 75%, var(--color-background-dark-foreground))` (4.98:1), cùng cách `--color-accent-on-sand`? Đề xuất: có; accent hiện 3.3–3.5:1 làm Lighthouse A11y < 100 trên trang chủ.
3. Trang chủ 360 dài ~17.700px với 16 khối; thêm setting "Show on mobile" cho container (mặc định bật, demo giữ đủ 16 khối) để merchant rút còn 5–6 khối như 07 §D? Đề xuất: có, chỉ thêm setting, không đổi mặc định.
