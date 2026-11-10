KHÔNG CHẮC: (1) Figma 1:359 chỉ có desktop 1920 và không có trạng thái: mọi bố cục 768/360 và mọi trạng thái là ĐỀ XUẤT phát triển từ Figma. (2) Ảnh Figma 1:817 và 1:1022 xuất nền trong suốt thành đen; nền thật (trắng) đọc từ `1-359.lowres.png` và snapshot (fill của 1:819 bị ẩn). (3) Snapshot không có vector: dấu tròn "Feature Product" (1:759) và icon play vẽ lại gần đúng trong mockup; dev dùng `featured-product__seal`, `slideshow-icon` play có sẵn. (4) demo-data không có rating, read time, mô tả, specs: lấy chữ từ Figma 1:759, 1:1022 và locale (`blocks.faq_item`, `blocks.testimonial_item`, `image_with_text.why_*`); blog chỉ có 4 bài (Figma 5), đã hỏi BA ở ES1-T267. (5) Ảnh sản phẩm lệch tên (ES1-T245) nhưng trùng ảnh Figma ở bundle; không tính là lỗi bố cục.

# UI spec: Trang chủ 768 và 360, phần B (ES1-T279)

## Thay đổi audit (ES1-T286, audit ES1-T283 A6, CTO 10/11 câu 3)

| # | Chỗ | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | §1 thanh dính bundle 360 | "Mockup chưa vẽ, chờ CTO" | đã chốt (H4), vẽ đủ: hiện/ẩn, 0 món, đang thêm, lỗi; mục 1.1 | sổ 10/11 H4 |
| 2 | §1 nút Big Offer ở trang chủ 360 | chưa xét va chạm với thanh dính | nút nhấc lên trên thanh, cách 16, theo chiều cao thật của thanh; không đè | sổ 10/11 audit (3); `marketing-popups.md` §4 |
| 3 | Mockup | không có | `index.html` mục States: 2 khung 360 × 640 + 3 trạng thái thanh; PNG mới `index-360.png` 360 × 11988, `index-768.png` 768 × 10274 (thay số ở dòng Đầu ra) | ticket |
| 4 | §12 | câu 1 còn dạng hỏi | ghi đã chốt, thêm "Quyết định CTO cần chốt" | ticket |

Không đổi: bố cục lưới, card, panel, trạng thái panel, mọi khối từ §2 trở đi.

### Thay đổi audit (ES1-T291, audit ES1-T283 A14)

| # | Mục | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | §2 Featured product, đồng hồ | ô 44, số 20/600 riêng của trang chủ; ngày từ setting `countdown_end` | theo `docs/ui-spec/countdown.md`: 360 Compact (ô 40, số 16), 768 Regular (ô 44, số 18, Figma 1:773); 3/4 ô; ngày từ metafield `custom.sale_ends_at`, `countdown_end` chỉ khi sản phẩm không có metafield | sổ 10/11 câu 2; countdown.md |

Chỉ §2 đổi. Mockup T279 vẽ ô 44 / số 20 ở 360: lệch P3, sửa khi render lại khối featured. §1 bundle (màu panel) ghi ở foundation §25.

Khối: bundle builder (1:636) · featured product (1:759) · video demo (1:817) · testimonial (1:885) · why choose (1:992) · blog (1:1022) · FAQ (1:1057) · footer (1:1104).
Phần A (hero → inspiration) thuộc ES1-T278. Spec `docs/ui-spec/index.md` (ES1-T252, gốc live) không sửa; với 8 khối này, spec này thay thế phần tương ứng vì gốc là Figma (sổ 10/11 BGĐ).

Mục tiêu: trên tablet và điện thoại, người mua tự ghép combo có giảm giá, mua nhanh sản phẩm deal, xem video và review thật, hiểu Efitco là ai, đọc bài, hỏi đáp, đăng ký nhận ưu đãi, mà vẫn đúng ngôn ngữ Figma desktop. Story TE-17.

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T279/index.html` (nhúng `../_kit/kit.css`, chỉ 8 khối, đúng thứ tự trang; trạng thái ở cuối).
- `drafts/designer/ES1-T279/index-768.png` (768 × 9099), `index-360.png` (360 × 9847). PNG đúng bề ngang viewport (không tràn ngang), 0 lỗi console.

Thứ tự nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 > foundation (ES1-T251) > bộ kiến thức (`NN §mục`).
Mốc: 360 = `< 48rem`; 768 = `48rem` tới `< 80rem` (bố cục 768 giữ tới 1279). Desktop ≥ 80rem là Figma, không vẽ lại.

## 0. Quy tắc chung 768 / 360

| | 360 | 768 | Nguồn |
| --- | --- | --- | --- |
| Lề, bề rộng nội dung | 20 / 320 | 20 / 728 | foundation §1 |
| Khoảng giữa section (padding trên, dưới) | 48 | 48 | `--section-gap` |
| Eyebrow → tiêu đề / tiêu đề → nội dung | 12 / 24 | 12 / 24 | Figma 1:490, foundation §1 |
| h2 khối | 28 | 32 | `--font-size-h2` |
| Gap card | 16 | 16 | `--grid-gap` |
| Hàng ngang | ẩn nút, vuốt; lộ card kế | nút 52 ở đầu khối, căn đáy tiêu đề | sổ 09/11 |
| Thanh tiến trình | cao 2, cách hàng 32 | như 360 | sổ 09/11, foundation §11 |
| Hàng ngang tràn mép | mép trái thẳng container, tràn tới mép phải màn hình | như 360 | Figma 1:817, 1:885, 1:1022 (card cuối bị cắt ở mép 1920) |
| Vùng chạm | ≥ 44 | ≥ 44 (tablet là màn chạm) | sổ 09/11; 14 §3 |

Màu nền theo Figma: bundle cream `--color-background-cream`, featured trắng, video trắng, testimonial cream, why tối + noise, blog trắng, FAQ cream (1:1057 fill #F5F5F1), footer tối + noise. Thứ tự khối, chữ, ảnh giữ như Figma (06 nhóm 5 §2).

## 1. Bundle builder (Figma 1:636)

Figma desktop: header (eyebrow "Build your bundle", h2 "Pick Your Kit, Save As You Go", link "View Preset Bundles" phải) · lưới 3 × 2 card trắng ~254 × 317 bo 12 (ảnh 1:1 cream bo 8, dấu chọn tròn 20 góc trên phải, tên, giá) · panel "Your Bundle" 576 × 657 nền `--color-background-panel` bo 16 bên phải.

| | 360 | 768 |
| --- | --- | --- |
| Header | eyebrow, h2, link "View Preset Bundles" xếp dọc, link cao 44 | `1fr auto`: link bên phải căn đáy h2 (như Figma) |
| Lưới | 2 cột 152, gap 16, 3 hàng | 3 cột 232, gap 16, 2 hàng (giữ bố cục 3 × 2 của Figma) |
| Card | padding 8, ảnh 136, dấu chọn 24 cách góc 8; tên 16/500 tối đa 2 dòng; giá 16/500 | padding 12, ảnh 208, dấu 24 cách góc 12 |
| Panel | dưới lưới cách 32; 1 cột; padding 24; bo 16 | dưới lưới cách 32; ĐỀ XUẤT 2 cột 316 + 316, gap 32: trái tiêu đề + đếm + danh sách, phải tạm tính → nút; padding 32 |
| Nút | "Add Bundle To Cart" full, cao 48 | như 360 |

- ĐỀ XUẤT panel 2 cột ở 768 (19 §D1 tablet tận dụng không gian; 05 nhóm 4 §1.3 CTA gần khi cuộn nhẹ): panel thấp ~260 thay ~430, nút gần lưới hơn.
- Danh sách trong panel: < 80rem hiện hết dòng, không cuộn trong khung (code desktop `block-size: 146px; overflow-y: auto` chỉ giữ ≥ 80rem); chữ 14 màu Figma #B2B2B2 (`--figma-b2b2b2` có sẵn, 5.39:1 trên panel). Mockup dùng trắng 70% (6.5:1), lệch P4.
- ĐỀ XUẤT dòng giảm giá: Figma xanh (#4B824D ~ `--color-badge-new`) trên panel chỉ 2.50:1, trượt AA. Dùng `color-mix(in srgb, var(--color-badge-new) 55%, var(--color-background-dark-foreground))` = 5.41:1 (cùng cách `--color-accent-on-sand`). Câu CTO 3.
- Số liệu luôn tính thật (sổ 06/11 E7): demo chọn sẵn 5 món (`preselect ,1,2,3,5,6,`) → $514.00, giảm 15% −$77.10, tổng $436.90, thanh đầy, ghi chú "You reached 15% off" (icon check). Figma vẽ "3 Items / 5%" là chữ mẫu, không theo.
- Không dòng ghi chú giảm giá dưới khối (sổ 07/11).
- 360: nút panel ở ~1.350 px tính từ đầu khối (3 hàng card + panel) nên có thanh dính đáy (CTO chốt 10/11 H4), chi tiết ở mục 1.1.

Trạng thái (Figma không có; ĐỀ XUẤT theo 05 nhóm 4 §3, §6):
- Card chọn: dấu tròn nền accent + tick trắng; chưa chọn: tròn trắng viền `--color-muted-light` (5.33:1, ≥ 3 cho thành phần không phải chữ). Hover: nhấc 2px + bóng raised. Focus: outline accent bao card (`:has(input:focus-visible)`).
- 2 món (bậc kế): giảm 10%, thanh 66%, icon khoá + "Add 1 more item to unlock 15% off" (locale `progress_one`).
- Rỗng: "Select products to build your bundle." (locale `empty`), nút disabled.
- Hết hàng: card badge "Sold out", ảnh mờ 0.6, không có dấu chọn, input disabled, tên "Speed rope is sold out" (locale `item_sold_out`).
- Đang thêm: nút `aria-busy` + spinner, giữ bề rộng. Lỗi: alert dưới panel, chữ locale `error`, `role="alert"`.
- Không JS: Liquid in sẵn tạm tính, giảm, tổng theo món chọn sẵn (đã nêu ở `index.md` §5, giữ).

A11y: mỗi card là `<label>` bọc checkbox thật (tên "Add {title} to bundle"), cả card là vùng chạm (≥ 152 × 230); `<fieldset>` + legend ẩn; panel `role="group"` có tên; dòng trạng thái ẩn `role="status"` ("5 selected, total $436.90"). Settings giữ như schema (`eyebrow`, `heading`, `link_label`, `link_url`, `collection`, `tier_1..3_quantity/percent` mặc định 2/10, 3/15, 5/0), không thêm.

### 1.1 Thanh dính bundle và nút Big Offer (chỉ < 48rem; ES1-T286)

Mockup: `drafts/designer/ES1-T279/index.html` mục States, khung "Mobile 360 × 640" (2 khung) + "Sticky bar states". Figma không có (desktop panel nằm cạnh lưới); mọi chi tiết dưới đây là phát triển từ panel Figma 1:636, CTO đã chốt có thanh (H4).

Anatomy (`data-testid="bundle-sticky-bar"`, in trong khối bundle ngay sau `<form>`, thuộc tính `hidden` sẵn):
1. Thanh `position: fixed` đáy màn, tràn 360, nền `--color-background-panel` (cùng panel), bo 16 hai góc trên (= panel), bóng hướng lên `0 -8px 24px foreground 16%`, padding 12 / 20 / 12 + `env(safe-area-inset-bottom)`. Cao 72 (nút 48 + 12 × 2).
2. Trái, 2 dòng: "{n} Items" Inter 14/500 trắng 70% trộn panel (locale `count_one` / `count_other`: "1 Item", "5 Items") · trên tổng "{total}" Inter 18/700 trắng, số tabular; chữ ẩn "Total" (locale `total`) đứng trước số. Ticket ghi "{n} Items · {total}" 1 dòng: ĐỀ XUẤT xếp 2 dòng, bỏ dấu "·", vì 1 dòng ở 320 chỉ còn ~126 px cạnh nút (đo mockup: "5 Items · $436.90" đã xuống dòng, giá "$1,234.56" càng không vừa). Tổng là số sau giảm (cùng dòng Total của panel).
3. Phải: nút primary "Add Bundle To Cart" (locale `submit`) cao 48, padding 16, không icon, `type="submit" form="bundle-form-{{ block.id }}"` (mockup `bundle-form`; id theo block để không trùng): gửi đúng form của panel, không cần JS riêng cho việc gửi.

Hiện / ẩn (BE, IntersectionObserver, không nghe scroll):

| Điều kiện | Thanh |
| --- | --- |
| Viewport ≥ 48rem | không có (`display: none`); 768 panel 2 cột đã gần lưới |
| Lưới chưa vào màn (đang ở khối trên) | ẩn |
| Lưới trong màn, mép trên panel chưa qua vạch đỉnh thanh (rootMargin panel `0px 0px -72px 0px`) | hiện (`.is-visible`) |
| Mép trên panel vào vùng trên thanh | ẩn (thanh không bao giờ che panel) |
| Đã cuộn qua hết khối (lưới và panel ở trên màn) | ẩn |
| Focus đang trong thanh | giữ hiện tới khi focus rời (không làm mất focus) |
| Không JS | giữ `hidden`; nút panel vẫn gửi form |

Chuyển động: vào trượt từ đáy 250 ms `--ease-out`, ra 150 ms; chỉ `translate` (+ `visibility` sau khi ra); `prefers-reduced-motion` tắt trượt, hiện/ẩn tức thì (15 §Motion; sổ 09/11 chuyển động). Thanh `position: fixed` nên không xô bố cục (CLS 0).

Trạng thái (Figma không có; ĐỀ XUẤT theo 05 nhóm 4 §3, §6; 14 #1097M phản hồi khi chọn món):

| Trạng thái | Thanh | Ghi chú |
| --- | --- | --- |
| Mặc định (demo chọn sẵn 5) | "5 Items" / "$436.90" + nút | số đổi ngay khi tích/bỏ card, không hiệu ứng số |
| 0 món | "0 Items" / "$0.00" + nút `disabled` (nền `--color-border`, chữ `--color-muted`, 6.71:1) | thanh vẫn hiện để người mua thấy số tăng khi chọn; giống quy tắc nút panel |
| 1 món | "1 Item" (`count_one`) | — |
| Đang thêm | nút `aria-busy="true"` + spinner trắng, giữ bề rộng; nút panel busy cùng lúc (chung form) | — |
| Lỗi | ô cảnh báo trong thanh, trên hàng nút: nền trắng, viền 1px `--color-sale`, bo 8, padding 8 / 12, icon cảnh báo 20 `--color-sale`, chữ 14/20 foreground, locale `error`; thanh cao lên (~150 ở 360) | đỏ trực tiếp trên panel chỉ 1.79:1 nên không dùng; ô biến mất khi người mua đổi lựa chọn hoặc bấm lại |
| Thành công | theo luồng thêm giỏ hiện có của bundle (không đổi ở ticket này) | — |

Thông báo cho trình đọc màn hình: thanh không phải live region (dòng `role="status"` của panel đã đọc "5 selected, total $436.90"; 2 nơi đọc là trùng). Lỗi: chỉ 1 nơi có `role="alert"`: thanh khi thanh đang hiện, ngược lại alert dưới panel (§1 trạng thái lỗi).

Nút Big Offer (teaser, `marketing-popups.md` §4) trên trang chủ 360:
- Mặc định góc dưới trái cách 16 (+ safe area), như ES1-T263.
- Thanh hiện: nút nhấc lên đúng chiều cao thanh, đáy nút cách đỉnh thanh 16 (`translate: 0 calc(var(--bundle-bar-height, 72px) * -1)`; BE đo chiều cao thật bằng ResizeObserver ghi `--bundle-bar-height` lên `:root`, nên khi thanh cao lên vì lỗi nút vẫn không đè). Trượt cùng nhịp 250 ms, reduced motion tắt.
- Thanh ẩn: nút về cách đáy 16.
- Setting "Position" = Right cũng nhấc như trên. Từ 768 không có thanh, nút giữ vị trí ES1-T263.
- Khoảng cách 16 giữa 2 vùng chạm (04 §1 thumb zone ≥ 16; 14 #1094M). Lớp: thanh `z-index` 14, nút 15, toast 30, dialog/drawer trên cùng; mở thẻ big offer (sheet modal) hay drawer giỏ thì thanh và nút nằm dưới scrim, `inert`.
- PDP và cart không có nút (sổ 10/11 audit (3)), ngoài phạm vi trang này.

Tương phản và vùng chạm:

| Chỗ | Cặp | Tỉ lệ |
| --- | --- | --- |
| Tổng | trắng / panel #393942 | 11.43 |
| "{n} Items" | trắng 70% trộn panel / panel | 6.5 |
| Chữ nút | trắng / accent #C8400E | 5.01 |
| Nút disabled | #4D4D4D / #E5E5E5 | 6.71 |
| Chữ lỗi / icon, viền lỗi | #1A1A1A / trắng; #BD1616 / trắng | 17.4; 6.38 |
| Focus trong thanh | outline 2px trắng / panel | 11.43 |
| Teaser | trắng / #1A1A1A | 17.4 (ES1-T263) |

Vùng chạm: nút thanh 48 cao × ~182; nút teaser 48, × teaser 44 × 48; cách nhau 16. Chữ nhỏ nhất 14.

Việc FE / BE (theo `fe-be-boundary.md`): FE1 markup thanh (in sẵn `hidden`, `data-testid="bundle-sticky-bar"`, `form="bundle-form"`, ô lỗi rỗng giữ trong markup) + CSS thanh và luật nhấc teaser (`:root:has(.bundle-bar.is-visible) .offer-teaser`); BE1 IntersectionObserver (lưới, panel), cập nhật số/tổng từ cùng hàm tính của panel, `--bundle-bar-height`, busy/lỗi dùng chung với nút panel. Không thêm setting.

## 2. Featured product (Figma 1:759)

Figma desktop: 2 cột; trái thẻ ảnh 668 × ~652 nền cream viền nhạt bo 16, dấu tròn "Efitco · Feature Product" 113 góc trên trái; phải eyebrow "Featured Product · Free Weights", h2 48, đồng hồ nền #1A1A1A ("Sale ends in" + 3 ô 44), giá sale + giá gạch + badge -24%, sao (4.9) | 341 reviews, mô tả, bảng 4 thông số xen kẽ sand/trắng, 2 nút "Add To Cart" (accent, icon túi) + "View Detail" (nền xám nhạt viền, mũi tên).

| | 360 | 768 |
| --- | --- | --- |
| Bố cục | 1 cột: ảnh → chi tiết, gap 32 | 1 cột: ảnh → chi tiết, gap 32 |
| Ảnh | 320 × 320 (1:1), sản phẩm `contain` padding 8% | ĐỀ XUẤT 728 × 546 (4:3): nút "Add To Cart" lên sớm ~180 px so với 1:1 (05 nhóm 4 §1.3); ảnh `contain` nên không cắt sản phẩm |
| Dấu tròn | 72, cách góc 16 | 88, cách góc 24 |
| Tiêu đề | `--font-size-h1` 33 | 43 |
| Đồng hồ | countdown.md cỡ Compact (khung chứa 320 < 368): ô 40, số 16, 3 ô rộng 267 / 4 ô 311 | countdown.md cỡ Regular (Figma 1:773): ô 44, số 18, 3 ô 311 / 4 ô 367 |
| Bảng thông số | mỗi hàng xếp dọc: nhãn 14 muted trên, giá trị 16/500 dưới (giá trị dài "Cast iron core, reinforced rubber" không vừa 2 cột ở 320) | 2 cột như Figma: nhãn trái, giá trị phải, padding 12 / 24 |
| Nút | xếp dọc full, primary trên, cách 12 | 1 hàng theo nội dung, cách 12 |

- Đồng hồ: component chung `docs/ui-spec/countdown.md` (kích thước §2, số ô §3, nguồn ngày và điều kiện hiện §4, trạng thái K0–K4 §5, A11y §7). Nguồn ngày: metafield `custom.sale_ends_at` của sản phẩm; setting `countdown_end` chỉ dùng khi sản phẩm không có metafield (sổ 10/11 câu 2). Vị trí giữ như Figma: giữa h2 và hàng giá. Không mô tả lại ở đây.
- "View Detail" có phần ẩn " of {product}" (SEO, link mô tả đích).
- Trạng thái: hết hàng → giá thường + badge Sold out, nút primary disabled chữ "Sold out", "View Detail" vẫn bấm được; không có rating → ẩn hàng sao; không có giá gạch → ẩn badge.
- Settings giữ như schema (`product`, `eyebrow`, `countdown_label`, `countdown_end` dự phòng, `spec_1..4_label`); info `countdown_end` đổi theo countdown.md §6.

## 3. Video demo (Figma 1:817)

Figma desktop: nền trắng; eyebrow "Video demo", h2 "See Real Equipment In Action, Before You Buy"; hàng card 264 × 554 gap 24 (video 9:16 264 × 470 + thanh sản phẩm 84: ảnh tròn 60, tên 16/500, giá), card thứ 6 cắt ở mép phải. Figma không vẽ nút next/back, không vẽ nút play.

| | 360 | 768 |
| --- | --- | --- |
| Header | eyebrow + h2 (2 dòng), không nút | `1fr auto`, nút 52 "Previous videos"/"Next videos" căn đáy h2 |
| Card | 252: video 252 × 448 + thanh 76 | 264 như Figma: video 264 × 469 + thanh 76 |
| Lộ card | 1 card + 72 px card kế (1.3 card) | 2 card + 188 px card 3 (2.7 card) |
| Thanh sản phẩm | ảnh tròn 48 nền cream, tên 1 dòng cắt "…", giá | như 360 |
| Tiến trình | thumb 21% | thumb 45% |

- Nút next/back + thanh tiến trình theo sổ 09/11 (Figma không có).
- ĐỀ XUẤT nút play 52 giữa poster (nền trắng 92%, tam giác foreground; hover cam): code `video-card__play` đã có; Figma không vẽ, nhưng thiếu dấu hiệu bấm thì người dùng không biết là video (05 nhóm 3 §2). Câu CTO 2.
- Không tự chạy: chỉ poster `efx-pos-N.jpg` lazy; bấm mới tải video/iframe và phát tại chỗ (sổ 09/11 Performance). Đang phát: nút thành "Pause video: {title}".
- Thanh sản phẩm là 1 link tới sản phẩm (`::after` phủ thanh, cao 76 ≥ 44), tách khỏi nút play.
- Trạng thái: lỗi phát → nền tối, icon cảnh báo trắng, "Video unavailable. View {title}" (locale `error_product`); đang tải → skeleton 9:16; card không nguồn không in (như template).

## 4. Testimonial (Figma 1:885)

Figma desktop: nền cream; eyebrow "Testimonial", h2 "What Our Customers Say?"; hàng card trắng 456 × 552 bo 16 (ảnh 456 × 270, padding 24: tên + Verified + sao phải, tiêu đề 20/700, câu trích muted, gạch, sản phẩm ảnh tròn 64 + tên + giá); card 4 cắt ở mép.

| | 360 | 768 |
| --- | --- | --- |
| Hàng | hàng ngang, card 272, lộ 52 px card kế; ẩn nút | hàng ngang, card 307 (cùng blog), lộ ~100 px card 3; nút 52 "Previous reviews"/"Next reviews" |
| Ảnh | 272 × 161 (456/270) | 307 × 182 |
| Thân card | padding 24; tên 16/500 + "Verified" (icon xanh + chữ 14 `--color-muted-light`); sao xuống hàng riêng dưới tên; tiêu đề Inter 18/700; câu trích 16/27 muted; sản phẩm ảnh tròn 56 | như 360 |
| Tiến trình | thumb 30% | thumb 59% |

- Hàng ngang thay lưới 2 × 2 (sổ 09/11 "testimonial là hàng ngang").
- ĐỀ XUẤT sao xuống hàng riêng < 80rem: tên + Verified + 5 sao cần ~275 px, card 307 chỉ còn 259 sau padding (Figma đặt sao phải cùng hàng ở 456).
- Card cao bằng nhau trong hàng; câu trích dài đẩy sản phẩm xuống đáy (flex).
- Verified theo setting (`verified`, mặc định tắt, E9; store demo bật). Không có ảnh: card bắt đầu từ thân. Không sản phẩm: bỏ gạch và hàng sản phẩm.
- A11y: sao `role="img"` "5 out of 5 stars"; `<ul aria-label="Customer reviews" tabindex="0">`; tên sản phẩm là link (phủ hàng sản phẩm, cao ≥ 56).

## 5. Why choose (Figma 1:992)

Figma desktop: chia đôi; trái ảnh 960 × 876 tràn mép, gradient tối ở đáy; phải nền tối, eyebrow "We are about" (Figma cam), display "WHY CHOOSE / EFITCO?" 2 dòng, đoạn văn xám, nút "View About Us →", 2 ảnh nhỏ trang trí (210 góc trên phải, 125 góc dưới phải) bo 12.

| | 360 | 768 |
| --- | --- | --- |
| Ảnh | trên, tràn 360 × 360 (1:1), gradient trong suốt 55% → nền tối đáy | trên, tràn 768 × 576 (4:3), như 360 |
| Nội dung | container, padding trên 8 dưới 48; eyebrow xám, display 48 2 dòng, đoạn văn, nút theo nội dung | padding phải 200 chừa ảnh nhỏ; display 70 2 dòng |
| Ảnh nhỏ | ẩn cả 2 | ảnh 1 168 × 168 góc phải, đè mép đáy ảnh lớn 40; ảnh 2 100 × 100 góc dưới phải cách 32 / 48 |

- Eyebrow trên nền tối: xám `--color-muted-on-dark` (6.11:1), không cam (sổ 10/11, ngoại lệ dòng 09/11). Lệch Figma có chủ đích.
- ĐỀ XUẤT ẩn 2 ảnh nhỏ ở 360: chỉ trang trí, không đủ chỗ cạnh tiêu đề 48 (19 §D5 nội dung thứ cấp có thể ẩn; §D6). `display: none` nên không tải.
- Thứ tự ảnh → chữ giữ như Figma (trái → phải thành trên → dưới, 06 nhóm 5 §2).
- ĐỀ XUẤT locale `why_text_html`: bỏ `<br>` và `&nbsp;` đôi (ở 320–528 px gây ngắt dòng lạ). P4, FE.
- Đoạn văn `--color-muted-on-dark` 6.11:1 (Figma xám sáng hơn, không có token, P4). Nút accent 5.01:1, focus outline trắng.

## 6. Blog (Figma 1:1022)

Figma desktop: nền trắng; eyebrow "From the Efitco blog", h2 "Training Tips & Inspiration"; hàng card 336 × 448 gap 24 (ảnh phủ bo 16, gradient đáy, tag accent góc trên phải, tiêu đề 18/700 trắng, "N min read"). Không có nút, không link "View all".

| | 360 | 768 |
| --- | --- | --- |
| Header | eyebrow + h2, không nút | nút 52 "Previous articles"/"Next articles" |
| Card | 252 × 336, lộ 72 px card kế | 307 × 410, lộ ~100 px card 3 |
| Tiến trình | thumb 32% | thumb 59% |

- Card theo foundation §10 (gradient từ 50%, cả card là link, tiêu đề tối đa 3 dòng). Dữ liệu: 4 bài trong `figma-blog`, mới nhất trước; read time lấy Figma (2, 5, 7, 5).
- Không thêm link "View all" (Figma không có); 07 §G muốn đường vào blog → menu header có "Blog", đủ.
- Trạng thái: không ảnh → nền tối (17.4:1); đang tải → skeleton 3:4; blog rỗng → khối không in (như code).

## 7. FAQ (Figma 1:1057)

Figma desktop: nền cream; cột trái 668: eyebrow "Questions and Answers", h2, accordion 5 câu (mục 1 mở, icon −/+ bên trái); phải nhóm 668 × 542: ảnh 509 × 542 bo 16 lệch phải, 2 ô số 260 × ~148 (cam "Products 360+", tối "Warranty 12") đè đáy trái ảnh, tràn ra trái.

| | 360 | 768 |
| --- | --- | --- |
| Bố cục | accordion → nhóm ảnh, cách 32 | accordion → nhóm ảnh, cách 40 |
| Accordion | rộng 320; câu hỏi 16/600; hàng ≥ 56; trả lời thụt 40 | rộng 728 |
| Ảnh | 320 × 341 (509/542) | giữ bố cục Figma: ảnh rộng 76% (553 × 589) lệch phải |
| Ô số | 2 ô 142, gap 12, đè đáy ảnh 48, lùi vào 12 mỗi bên; số 40 | 2 ô trong khung 80% (582), mỗi ô 285, gap 12, cách đáy ảnh 7.5%, mép trái 0 (như Figma); số 48 |

- Icon +/−: Figma vẽ cùng màu chữ câu hỏi (mục mở foreground, mục đóng `--color-muted`), không cam. foundation §13 ghi "+ cam": lệch, theo Figma (P4, sửa foundation §13 khi FE dựng).
- Chữ câu đóng `--color-muted` (#4D4D4D, 7.73:1 trên cream), mở foreground (15.9:1).
- Locale `q3_question` "do i" → "do I" (P4, đã nêu ở `index.md`).
- `allow_multiple` theo setting; mở sẵn câu 1 (15 §6). Ảnh `alt=""` (trang trí), lazy.

## 8. Footer (Figma 1:1104)

Theo foundation §4 (kit.css `.site-footer*`), không đổi:
- 360: newsletter xếp dọc (ảnh 98 × 123 có 2 thẻ sau, tiêu đề "Get 15% Off Your First Order", mô tả, ô email + nút full), panel tràn mép, menu Shop / Information là accordion đóng (hàng 52, link 44), trust 2 × 2, wordmark "EFITCO" 64 trên cùng hàng cuối, rồi locale + thanh toán, rồi copyright.
- 768: ảnh + chữ 2 cột, form dưới full; menu 2 cột mở sẵn, link cách 16; trust 4 cột; wordmark 80.
- Menu Information theo Figma: Our Story, Our Efitco, FAQs, Contact Us; ĐỀ XUẤT thêm "Shipping policy", "Refund policy" (14 §1, foundation §4; dữ liệu menu, không đổi giao diện). foundation.html đang thiếu "Our Efitco": mockup này theo Figma.

## 9. Lighthouse (sổ 09/11: SEO, A11y, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

Performance:
- Cả 8 khối dưới màn đầu: mọi ảnh `loading="lazy"` có width/height, `srcset` theo bề card (bundle 136/208, featured 320/728, poster 252/264, review 272/307, why 360/768, blog 252/307, FAQ 320/553). Ảnh nhỏ why ẩn ở 360 không tải.
- Video không tự chạy, không tải trước; iframe/`<video>` chỉ tạo khi bấm play.
- Đồng hồ và tổng bundle in từ Liquid: ô giữ đúng nội dung, không nhảy khi JS chạy (CLS 0).
- Hàng ngang dùng CSS scroll-snap; JS chỉ cho nút và thanh tiến trình (module carousel có sẵn, không thêm JS mới).

Accessibility (tỉ lệ tính tay: L sRGB → tuyến tính, (L1 + 0.05) / (L2 + 0.05)):

| Chỗ | Cặp | Tỉ lệ |
| --- | --- | --- |
| Chữ trắng trên panel bundle | #FFF / #393942 (L 0.0419) | 11.43 |
| Dòng hàng trong panel | #B2B2B2 (L 0.445) / panel | 5.39 |
| Dòng hàng nếu dùng #999 | #999 (L 0.318) / panel | 4.01 (không dùng) |
| Giảm giá, màu Figma | #4B824D (L 0.180) / panel | 2.50 (trượt) |
| Giảm giá, ĐỀ XUẤT | badge-new 55% + trắng (L 0.447) / panel | 5.41 |
| Count pill, nút | trắng / accent #C8400E | 5.01 |
| Dấu chọn chưa chọn | viền #6B6B6B / trắng | 5.33 (≥ 3, non-text) |
| Nhãn thông số | #4D4D4D / sand | 6.81 |
| Verified | #6B6B6B / trắng | 5.33 |
| Giá sale | #BD1616 / trắng | 6.38 |
| Eyebrow why, đoạn văn why | #999 / #1A1A1A | 6.11 |
| Câu FAQ đóng / trả lời | #4D4D4D / cream #F5F5F1 (L 0.910) | 7.73 |
| Chữ trên ô số FAQ | trắng / accent; trắng / dark | 5.01; 17.4 |

- Vùng chạm 360: card bundle cả card, link "View Preset Bundles" 44, nút 48, play cả poster, link sản phẩm video 76, link sản phẩm review ≥ 56, card blog cả card, hàng accordion ≥ 56, footer theo foundation. 768: thêm nút 52.
- Hàng cuộn: `<ul aria-label tabindex="0">`; nút có tên riêng; tiến trình `aria-hidden`; nút ở đầu/cuối hàng `aria-disabled` + opacity 0.35.
- Heading: h2 mỗi khối; h3 cho "Your Bundle", tiêu đề review, tiêu đề bài viết. Không nhảy bậc.
- Không ARIA trên phần tử không role: panel bundle có `role="group"`.

SEO: link mô tả đích ("View Preset Bundles", "Add Bundle To Cart", "View Detail" + phần ẩn, "View About Us", tiêu đề bài, tên sản phẩm); ảnh nội dung có alt (sản phẩm bundle, featured, why), ảnh trang trí `alt=""`; chữ nhỏ nhất 13 (badge).

Best Practices: mockup 0 lỗi console ở 360 và 768; ảnh khung có `aspect-ratio` + `object-fit`, sản phẩm `contain`.

## 10. Settings merchant

Không thêm setting. Dùng setting có sẵn: bundle (`eyebrow`, `heading`, `link_label`, `link_url`, `collection`, `tier_*`), featured (`product`, `eyebrow`, `countdown_label`, `countdown_end`, `spec_1..4_label`), video card (`video`, `video_url`, `poster`, `product`, `badge`), testimonial item (`author`, `verified`, `rating`, `title`, `quote`, `image`, `product`), image-with-text (`eyebrow`, `heading`, `body`, `button_label`, `button_url`, `image`, `image_position`, `accent_image_1..2`), blog-posts (`eyebrow`, `heading`, `blog`, `articles_to_show`), FAQ (`eyebrow`, `heading`, `allow_multiple`, `image`, `show_stat_*`, `stat_*`).

## 11. Việc FE / BE

| Khối | Đổi < 80rem | Phía | Mức |
| --- | --- | --- | --- |
| Bundle | 768 lưới 3 cột, panel 2 cột; 360 lưới 2 cột; danh sách panel không cuộn; màu dòng giảm giá AA | FE | P2 / P3 |
| Bundle | Thanh dính đáy 360 nếu CTO duyệt (câu 1) | FE markup + BE JS (IntersectionObserver) | P3 |
| Featured | 768 ảnh 4:3; 360 bảng thông số xếp dọc, nút xếp dọc; đồng hồ hiện số Liquid (ES1-T276) | FE + BE | P3 |
| Video | Card 252 / 264, nút đầu khối 768, play 52 nếu CTO duyệt (câu 2) | FE | P3 |
| Testimonial | Hàng ngang + nút + tiến trình thay lưới 2 × 2; sao xuống hàng | FE (dùng module carousel có sẵn) | P2 |
| Why | Ảnh trên 4:3 / 1:1, gradient đáy; ảnh nhỏ 768 vị trí mới, ẩn ở 360; locale bỏ `<br>`, `&nbsp;` | FE | P3 / P4 |
| Blog | Card 252 / 307, nút đầu khối 768 | FE | P3 |
| FAQ | 768 giữ bố cục Figma (ảnh 76% phải, ô số đè trái); 360 ô số đè đáy ảnh; icon +/− theo màu chữ | FE | P3 / P4 |
| Footer | Theo foundation §4; menu demo thêm 2 link chính sách | FE + dữ liệu store | P3 |

## 12. Quyết định CTO đã chốt (10/11)

CTO chốt cả các câu dưới đây theo đề xuất (docs/design/decisions.md, 10/11).
1. Bundle 360: thanh dính đáy ("{n} Items" / "{total}" + "Add Bundle To Cart") khi lưới trong màn và panel chưa vào. Đã chốt: có (H4); đã vẽ, mục 1.1. Audit 10/11 (3): trang chủ 360 nút Big Offer nằm trên thanh, không đè (mục 1.1).
2. Video card: thêm nút play 52 giữa poster (code đã có, Figma không vẽ) để người dùng biết bấm được, phát tại chỗ, không tự chạy? Đề xuất: có.
3. Dòng "Bundle discount" trong panel: đổi xanh Figma (2.50:1, trượt AA) sang `color-mix(badge-new 55%, trắng)` 5.41:1? Đề xuất: có, cùng cách `--color-accent-on-sand`.

Đề xuất sửa file ngoài phạm vi ES1-T286 (không sửa ở ticket này):
- §11 dòng "Thanh dính đáy 360 nếu CTO duyệt (câu 1)" → bỏ "nếu CTO duyệt", trỏ mục 1.1; dòng Đầu ra đầu spec đổi kích thước PNG (360 × 11988, 768 × 10274).
- `docs/ui-spec/marketing-popups.md` §4 "Không đè": thêm "thanh dính bundle trang chủ < 48rem → teaser nhấc theo `--bundle-bar-height`" và `kit.css` `.offer-teaser` thêm luật nhấc chung.
- `kit.css` / foundation §17: `.toast-region` < 48rem cũng nhấc theo `--bundle-bar-height` khi thanh hiện (toast đang ở đáy cách 16 sẽ đè thanh).

## Quyết định CTO cần chốt (ES1-T286)

1. Thanh hiện cả khi 0 món (nút disabled) hay chỉ khi ≥ 1 món? Đề xuất: hiện cả 0 món, để thấy số tăng khi chọn (14 #1097M).
2. Toast < 48rem khi thanh bundle hiện: nhấc lên trên thanh như nút Big Offer? Đề xuất: có, cùng biến `--bundle-bar-height` (foundation §17).
