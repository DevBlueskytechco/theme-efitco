KHÔNG CHẮC: (1) 0/56 ảnh nguyên liệu đã xuất: agent không xuất được từ Figma, đường dẫn ở mục 1 là nơi lưu sau khi người xuất (ES1-T200 #2). (2) Quyền dùng ảnh: không có nguồn nào trong repo (ES1-T200 #3). (3) SVG 1:761 vẽ lại từ ảnh export vì snapshot không có đường vector: icon khớp, chữ vòng lệch vài px và máy đo không có font Inter. (4) ui_diff chưa chạy được trên storefront vì trang password (ES1-T200 #1). (5) Chưa đọc được drafts/ba/ES1-T173/home-content.md (nhánh khác, không có quyền đọc worktree), chỉ đọc tóm tắt trên ES1-T173, ES1-T198, ES1-T199: FE đối chiếu copy với bảng đó. (6) `docs/figma-inventory.md` CHƯA SỬA: scope-guard chặn, cần người áp (mục 6). (7) Tương phản tính tay theo công thức WCAG, không có Bash; công thức khớp số 3.65:1 đã chốt ở ES1-T145 #4.

# ES1-T174 — Đầu vào Designer cho TE-15, TE-16, CR-3, CR-7, quiz, ui_diff

Designer, 06/11/2026. Không sửa code, không đổi token. Figma chỉ có desktop 1920: mọi thứ ghi `ĐỀ XUẤT:` chờ Designer người duyệt.
Thứ tự nguồn khi lệch: ảnh export `docs/figma/img/` thắng snapshot (mục 6).

## 1. Ảnh nguyên liệu

Cách xuất: mở Figma, chọn node, Export PNG 2x. Lưu `docs/figma/img/material/<node>.png`, dấu `:` đổi thành `-`, dấu `;` đổi thành `_`. Xuất tay không tính hạn mức API. `docs/figma/img/<node>.png` là ảnh cả block, không dùng làm ảnh sản phẩm.
Dùng: chỉ tải lên store dev (ES1-T178). Không đưa vào `assets/`: merchant mới cài không có ảnh (CTO 06/11 11:32).
Quyền dùng: toàn bộ KHÔNG CHẮC. Inventory ghi ảnh stock, repo không có nguồn hay license. Cột "Thương hiệu" là chữ đọc được trên ảnh export, chưa soát hết.

Tổng: 55 raster + 1 SVG = 56.

| Hàng | Node | Nội dung | Cỡ Figma | Cách xuất | Thương hiệu thấy trong ảnh |
| --- | --- | --- | --- | --- | --- |
| 1, 16 | 1:377 | Logo | Chưa đọc | SVG, không phải PNG | Efitco |
| 2 | 1:422 | Nền slide 1 | 1798 × 827 | Ẩn 1:427, 1:434 rồi xuất cả group, vì ảnh gồm 2 lớp 1:423 và 1:425 | Chưa soát |
| 2 | 1:437 | Nền slide 2 | Chưa đọc | Ẩn text và nút như trên | Chưa soát |
| 3 | 1:404, 1:407, 1:410, 1:413, 1:416 | 5 ảnh collection | Rộng 336 | Xuất rectangle | TRX, Yoleo |
| 4a | 1:455 | Ảnh inline heading | 165 × 94 | Xuất rectangle | FLOW HOUSE |
| 4b | 1:469, 1:478, 1:484 | 3 ảnh trình độ | 456 × 456 | Ẩn Content và fill gradient rồi xuất frame; gradient làm bằng CSS | VERVE, PEAK |
| 5 | I1:502;4733:5183, I1:503;4733:5183, I1:504;4733:5183, I1:505;4733:5183 | 4 ảnh sản phẩm | 336 × 336 | Xuất rectangle | TRX, Revllen |
| 6 | 1:534 | Body map | 152 × 256 | Xuất rectangle, có nền #EBE6E0 và blend DARKEN | Không thấy |
| 6 | 1:539, 1:547, 1:555 | 3 thumbnail tròn | Chưa đọc | Xuất node | Không thấy |
| 7 | 1:568 | Ảnh lớn | 936 × 816 | Ẩn hotspot, xuất rectangle; có gradient viền | Chưa soát |
| 7 | 1:586, 1:593, 1:600, 1:607 | 4 ảnh row | Chưa đọc | Xuất rectangle | Chưa soát |
| 8 | 1:633, 1:634, 1:635 | 3 ảnh rải | 1:634 là 187 × 187 | Xuất rectangle | Chưa soát |
| 9 | 1:649, 1:661, 1:673, 1:686, 1:698, 1:710 | 6 ảnh sản phẩm | Chưa đọc | Xuất rectangle | TRX, Revllen |
| 10 | 1:760 | Ảnh sản phẩm | 668 × 653 | Ẩn 1:761 rồi xuất frame | Chưa soát |
| 11 | 1:842, 1:851, 1:858, 1:865, 1:872, 1:879 | 6 poster video | 264 × 470 | Xuất rectangle. Figma không có file video (ES1-T199 #3) | Chưa soát |
| 12 | 1:896, 1:921, 1:945, 1:969 | 4 ảnh review | Chưa đọc | Xuất rectangle | Chưa soát |
| 13 | 1:997, 1:998, 1:1011, 1:1012 | Ảnh chính + 2 ảnh nhỏ | Chưa đọc | Xuất rectangle. Chưa kiểm node cha có ẩn không: đối chiếu `1-992.png` trước khi xuất | Chưa soát |
| 14 | 1:1027, 1:1033, 1:1039, 1:1045, 1:1051 | 5 ảnh bài viết | 336 × 448 | Ẩn 1:1028 và 1:1030 (tương tự card khác), tắt fill gradient rồi xuất frame | GYMS... |
| 15 | 1:1094 | Ảnh FAQ | 509 × 542 | Xuất rectangle | Chưa soát |
| 16 | 1:1191 | Ảnh newsletter | 98 × 123 | Xuất rectangle | Chưa soát |

Không xuất: 1:1118 đến 1:1131 (icon thanh toán, theme dùng `payment_type_svg_tag`); 1:1113 (cờ, thuộc localization); 1:361, 1:995, 1:996, 1:920 (node ẩn); 1:389 (thừa).

## 2. SVG dấu tròn 1:761 (CR-7, hàng 10)

File: `drafts/designer/ES1-T174/seal-1-761.svg`. Ảnh đối chiếu: `drafts/designer/ES1-T174/seal-check.png` (trái Figma, giữa SVG, phải chồng lên nhau, phóng 4 lần).
FE chép vào `snippets/`, đặt inline. Dùng `<img>` thì `currentColor` không có tác dụng.

Số đo từ snapshot: khung 1:762 113 × 112, cách góc ảnh 24 (1:761 padding 24). Icon 25 × 32 tại (44, 40). Đường chữ là vòng tròn bán kính 41.85, tâm (57.18, 57.17). Chữ Inter 600, 16px, letter-spacing -0.32, UPPER, opacity 0.4.

Việc FE khi đặt inline:
- Chuỗi chữ phải qua `| t` (AGENTS.md), không để cứng. Thay nội dung `textPath`, giữ khoảng trắng bằng `&#160;`. Theo ES1-T200 #5 mặc định dùng `shop.name`.
- `id="seal-ring"` là id cố định: đổi thành id theo block nếu 1 trang có nhiều dấu.
- CSS `font-family: var(--font-primary--family)` đè thuộc tính trong file. Màu: `color: var(--color-muted-on-dark)` (ES1-T200 #4). 0 literal.
- Giữ `aria-hidden`. Dấu không bấm được, không cần touch target.

ĐỀ XUẤT: dưới 48rem dấu 72 × 71, cách góc ảnh 12. Từ 48rem đúng 113 × 112, cách góc 24.

Sai số đã thấy: icon khớp. Chữ FEATURE khớp, EFITCO và PRODUCT lệch vài px (chưa đo số) do máy đo dùng font thay thế. Ghi vào sổ ES1-T197. Muốn khớp tuyệt đối: người xuất SVG từ node 1:762 kèm outline text, khi đó chữ không dịch được.

## 3. Copy quiz bước 2, 3 (ES1-T135 #8)

Figma chỉ có bước 1. Toàn bộ bảng dưới là `ĐỀ XUẤT:`, không phải Figma.
Cách đặt: 3 lựa chọn mỗi bước như bước 1. Bước 2 dùng cùng 3 trình độ với hàng 4b. Không có body map, không có thumbnail: danh sách rộng hết (ES1-T135 #1).

| Bước | Trường | Copy | Tag |
| --- | --- | --- | --- |
| 2 | Câu hỏi | What is your training level? | |
| 2 | Câu phụ | Pick the closest match. | |
| 2 | Lựa chọn 1 | Beginner / New to regular training | `quiz-beginner` |
| 2 | Lựa chọn 2 | Intermediate / Training a few times a week | `quiz-intermediate` |
| 2 | Lựa chọn 3 | Advanced / Training for years | `quiz-advanced` |
| 3 | Câu hỏi | Where do you train? | |
| 3 | Câu phụ | Pick where you train most. | |
| 3 | Lựa chọn 1 | At home / Living room, garage or spare room | `quiz-home` |
| 3 | Lựa chọn 2 | At the gym / Shared space, full equipment | `quiz-gym` |
| 3 | Lựa chọn 3 | Outdoors / Park, yard or balcony | `quiz-outdoor` |

Bước 1 giữ Figma (1:531, 1:532, 1:541 đến 1:558): tag `quiz-upper`, `quiz-core`, `quiz-lower` theo ES1-T134.

Hệ quả:
- `quiz-intermediate` chưa có trong ES1-T134: thêm vào dữ liệu ES1-T178. `index.te11` giữ nguyên để không đổi test ES1-T138.
- Quiz khớp đủ 3 tag (ES1-T136 #5). Mỗi sản phẩm cần 3 tag, thiếu thì kết quả rỗng (AC-H16).
- "Two questions" (1:515) vẫn mâu thuẫn "Step 1 of 3": giữ nguyên văn theo ES1-T198 #1.

## 4. Mặc định mobile 360, 768

Cách làm như ES1-T116 #5, #6. Đều là `ĐỀ XUẤT:`. Chung cho cả 5 block:
- Lề 20px (`min_page_margin` mặc định), nội dung 320 ở 360, 728 ở 768. Breakpoint 48rem, 64rem, 80rem. Control từ 44px (AGENTS.md:298).
- Danh sách cuộn ngang theo mẫu `.testimonials__list` (base.css:4021): tràn tới mép bằng margin âm, `scroll-snap-type: x mandatory`, `tabindex="0"`, trang không cuộn ngang.

| Block, node | Cỡ | Cột, hàng | Cuộn | Cỡ card |
| --- | --- | --- | --- | --- |
| Collection list 1:395 | 360 | 1 hàng | Ngang, snap, ẩn nút next/back như thẻ video ES1-T154 #8 | Rộng 70vw = 252, ảnh tỉ lệ giữ như Figma, gap 16 |
| | 768 | 1 hàng, lộ ~2,3 card | Ngang, snap, hiện nút 52 × 52 | Rộng 40vw = 307, gap 16 |
| | Từ 64rem | 1 hàng | Ngang, hiện nút | 336, gap 24 |
| Shop by level 1:464 | 360 | 1 cột, xếp dọc: 3 lựa chọn cần thấy không phải vuốt | Không | 320 × 240 (4/3), gap 16, padding nội dung 16 |
| | 768 | 3 cột | Không | 232 × 232 (1/1), gap 16, padding nội dung 16 |
| | Từ 64rem | 3 cột | Không | 1/1, padding 40; 456 × 456 ở 1920 |
| Tabs featured collection 1:496 | 360 | Heading trên, hàng tab dưới | Hàng tab cuộn ngang tới mép, không snap | Lưới 2 cột, card 152, gap 16 |
| | 768 | Heading trên, hàng tab dưới | Tab vừa 1 hàng (~540 trong 728), không cuộn | Lưới 4 cột khi đúng 4 sản phẩm, card 170, gap 16 |
| | Từ 64rem | Heading trái, tab phải | Không | 4 cột; 336 ở 1920 |
| Rating, New trên card 1:503 | 360 | Rating góc phải, New hoặc % góc trái | Không | Cách mép card 8. Trên card 152: 8 + 60 + 62 + 8 còn dư 14 |
| | 768 | Như 360 | Không | Cách mép 8 trên card 170 |
| | Từ 64rem | Như Figma | Không | Cách mép 16 |
| Blog posts 1:1022 | 360 | 1 hàng | Ngang, snap, không nút (Figma không có) | 252 × 336 (3/4), gap 16, padding chữ 16 |
| | 768 | 1 hàng, lộ ~2,3 card | Ngang, snap, không nút | 307 × 410, gap 16, padding chữ 24 |
| | Từ 64rem | 1 hàng | Ngang khi tràn | 336 × 448, gap 24; thẻ thứ 5 tràn ở 1920 |

Điểm FE cần chú ý:
- Lưới hàng 5: `base.css:393` đang 3 cột từ 48rem, nên 4 sản phẩm mặc định (D7) để lại 1 card lẻ. Dùng cùng cách `.testimonials__list:has(> :nth-child(4):last-child)` (base.css:4224) cho 4 cột từ 48rem. Lưới khác số sản phẩm giữ nguyên. Thuộc ES1-T190.
- Badge: `.product-card__badge` đang cách mép `--space-4` ở mọi cỡ. Trên card 152: 16 + 60 + 62 + 16 = 154, 2 badge chồng nhau. Phải dùng `--space-2` dưới 64rem.
- Tab: hình giữ cỡ Figma, vùng bấm từ 44px bằng pseudo-element theo chiều dọc như swatch D7. Tab là link không JS (AC-H11) nên focus bàn phím tự cuộn vào khung.
- Thiếu dữ liệu: collection list, shop by level, blog posts theo AC-H9, AC-H27, ES1-T186. Dưới số card Figma: chỉ hiện số card có, không kéo giãn.
- Chữ trên ảnh blog: tương phản phụ thuộc ảnh, không đo được 1 số. ĐỀ XUẤT: dòng thời gian đọc dùng `--color-background-dark-foreground` thay xám Figma, giữ gradient 1:1027.

## 5. Badge New (CR-3, AC-H14)

Đo: chữ `#FFFFFF`, 13px, 600 trên nền `#4B824D` (I1:503;4733:5184), dạng pill 52 × 28.

| Cặp | Tương phản | Kết luận |
| --- | --- | --- |
| #FFFFFF trên #4B824D | 4.57:1 | Đạt 4.5:1, giữ màu Figma, không cần màu thay |
| #4B824D trên #F5F5F1 (nền badge so với nền card) | 4.18:1 | Trên 3:1 |
| #FFFFFF trên #BD1616 (badge sale, để so) | 6.38:1 | Đạt |
| #1A1A1A trên #FFFFFF (số rating) | 17.4:1 | Đạt. Sao #FFC107 trang trí, số là phần đọc |

Giới hạn: dư có 0.07. Chỉ dùng làm nền với chữ trắng. Không dùng làm màu chữ trên `#F4F4F4` (4.15:1) hay `#1E1E1E` (3.65:1, ES1-T145 #4).
Merchant đổi màu qua setting thì có thể mất AA, như các token khác.

Token đề xuất (FE làm 1 lần theo AGENTS.md:323, ES1-T190; ticket này không đổi token):
`badge_new_color` #4B824D → `--color-badge-new`; `badge_new_foreground_color` #FFFFFF → `--color-badge-new-foreground`. Thêm dòng vào `DESIGN.md`, `docs/tokens.json`. Không đặt tên `success`: CTO đã không nhận token success ở ES1-T145.

ĐỀ XUẤT quy tắc New: Figma không có quy tắc.
- Sản phẩm có tag `new`, viết thường đúng chữ. Không theo ngày tạo: merchant kiểm soát được và Liquid không phụ thuộc thời gian.
- Nhãn qua `| t`. Không có setting.
- Thứ tự, chỉ hiện 1 badge góc trái: Sold out > % giảm > New. Figma không có card vừa sale vừa New; AC-H14 yêu cầu sale hiện %.
- Rating độc lập, góc phải.
- Store dev: Iron Core Kettlebell 16 kg có tag `new`, không giảm giá (ES1-T178).

## 6. Sửa `docs/figma-inventory.md`

CHƯA ÁP: hook scope-guard chặn designer ghi `docs/figma-inventory.md`, không vòng qua. Nội dung sửa đủ ở `drafts/designer/ES1-T174/figma-inventory-changes.md` (hàng 3, 4, 9, 11, 13, 14, 15, và quy tắc nguồn), cần Orchestrator hoặc người áp.
Xác nhận: ảnh export thắng snapshot khi lệch. Áp cho: "Featured" (1-1022.png) thay "Freatured"; "2.4×2.0" (ES1-T198 #3); thứ tự spec hàng 10 (ES1-T198 #4). Chỉ tính node hiện: node và mọi node cha không có `visible:false`.

Phát hiện thêm ngoài danh sách ticket: hàng 14 ghi card 300 × 448, snapshot và ảnh là 336 × 448. Có trong file thay đổi, đã báo trên ES1-T191. AC-H26 cần đổi theo.

## 7. Công cụ ui_diff (D3)

Kết quả: chưa chạy được trên storefront. Chi tiết, lệnh, ảnh ở `drafts/designer/ES1-T174/ui-diff.md`. Ticket: ES1-T200 #1.

## Câu hỏi đang mở

ES1-T200 (CTO): mở khoá password cho tool, người xuất ảnh, quyền dùng ảnh, màu dấu, tên shop trên dấu. Đều có mặc định.
