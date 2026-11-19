KHÔNG CHẮC: Figma 1:506 chỉ có bước 1 của quiz, không có khung kết quả nào (figma-inventory hàng 6: "bước 2/3, kết quả, rỗng" thiếu), nên mọi phần dưới là ĐỀ XUẤT có nguồn. Store dev không có sản phẩm quiz nào hết hàng: trạng thái hết hàng minh hoạ bằng ca biên "Hết hàng toàn bộ" (edge_cases, không có tag quiz). Hành vi sau Add To Cart trong popup khác TE-4 AC8 / TE-5 AC6 (mở drawer): chờ CTO câu 1.

# UI spec: Popup kết quả quiz và trang collection.quiz (ES1-T285, audit A5)

## Thay đổi audit (ES1-T283 A5)

| # | Lỗi audit | Trước | Sau (spec này) | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Không có kết quả khớp ở khổ nào | chỉ sheet "No Exact Match" 768/360 (ES1-T278) | popup có kết quả đủ 360 / 768 / 1280 / 1920: dialog L ≥ 768, bottom sheet < 768 (§2, §3) | Sổ 09/11 "Quiz: kết quả mở popup (mobile bottom sheet)"; foundation §16 cỡ L |
| 2 | Thiếu trạng thái | — | đang tìm, có kết quả, ≤ 4 kết quả, không khớp (giữ T278), lỗi, hết hàng, đang thêm / đã thêm / lỗi thêm, quick view trong popup (§5) | Ticket; foundation §18 |
| 3 | Card kết quả | `product-card` không nút | card foundation §9 + nút Quick View (ES1-T262 §4) + nút "Add To Cart" / "Choose Options" riêng của quiz (§4) | Ticket; 08 #529D |
| 4 | Trang `?view=quiz` không JS chưa thiết kế | template chỉ có h1 = tên collection + block | trang đủ header, breadcrumb, tiêu đề, câu trả lời, lưới, hành động, rỗng (§6) | Ticket; AGENTS "Works without JavaScript" |
| 5 | Heading trang `?view=quiz` nhảy bậc | h1 (collection) → h3 (results heading) → h4 (card) | h1 "Your Gear Shortlist" → h2 card | Sổ 09/11 A11y 100 (heading đúng thứ tự) |

Giữ nguyên: sheet "No Exact Match" của ES1-T278 (copy, nút, thứ bậc), quick view ES1-T262 §3, card foundation §9, khối quiz trang chủ (index-mobile-a §6).

## 1. Mục đích, nguồn

Người mua làm xong 3 bước quiz thấy ngay tối đa 4 sản phẩm khớp đủ 3 câu trả lời, thêm giỏ hoặc chọn biến thể không rời trang chủ, có đường sang danh sách đầy đủ và làm lại quiz. Story TE-11 AC3, AC-H16. Code: `blocks/quiz.liquid` (dialog `results_popup`, partial `quiz-results`), `templates/collection.quiz.liquid`, `assets/quiz-dialog.js`, `assets/quiz-finder.js`.

Đầu ra: spec này; `drafts/designer/ES1-T285/quiz-result.html`; `quiz-result-360|768|1280|1920.png`. Khung 1 cao bằng một màn hình của mốc (760 / 1024 / 820 / 1000), khung 2 là trạng thái, khung 3–4 là trang `?view=quiz`.

Dữ liệu mockup (`docs/design/demo-data.json`): Lower body · Intermediate · At the gym (tag `quiz-lower`, `quiz-intermediate`, `quiz-gym`) → 5 sản phẩm: Olympic Plate Set 100 ($289.00 / $339.00), Recovery roller ($52.00), Training Mat 12 mm ($69.00), Revllen Pro Speed Rope ($34.99 / $44.99, Color 3 giá trị), Ativafit Lava 66 lb Adjustable. Các tổ hợp đã đếm trên store dev đều có 3–5 sản phẩm, nên "không khớp" chỉ xảy ra khi store chưa gắn tag (AC-H16) hoặc merchant đổi tag.

## 2. Anatomy popup

Thứ tự trong `<dialog>`:
1. Nút đóng 48 (foundation §6), góc trên inline-end.
2. Tiêu đề h3 "Your Gear Shortlist" (heading 800, `--font-size-h2`, `tabindex="-1"`, đích focus khi mở). h3 vì dialog nằm trong khối quiz sau h2 "Find Your Perfect Gear" (heading-order theo DOM).
3. Câu trả lời: `<ul aria-label="Your answers">` 3 pill chỉ đọc: nền sand, chữ foreground 14/500, dấu tick accent 16, cao 32, cách 8. Lấy nhãn của lựa chọn đã chọn (JS đọc từ `label` đã checked). Lý do: người mua thấy kết quả dựa trên gì (05 §6 phản hồi; ĐỀ XUẤT, nguồn Figma 1:506 trạng thái chọn = nền sand).
4. Dòng đếm `role="status"`, 14 muted: "5 products match all 3 answers. Showing the top 4." (≤ 4: "3 products match all 3 answers."). Nguồn số: `collection.products_count` của URL tag.
5. Lưới tối đa 4 card (`limit: 4`, SRS TE-11 AC3; hằng, không thành setting).
6. Chân dính đáy, gạch trên 1px border: primary "View All 5 Matches →" (link) + secondary "Retake Quiz" (button). ≤ 4 kết quả: primary đổi thành "Shop All Equipment →" (link `results_url`).

Thứ tự ưu tiên CTA: 1 primary mỗi lớp (04 §1); nút card là secondary.

## 3. Kích thước theo mốc

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Khung | bottom sheet rộng 100%, cao ≤ 88dvh, bo 24 hai góc trên, thanh kéo 40 × 4 | dialog L giữa màn, rộng 728 (100% − 2 × 20), bo 24, cao ≤ min(860, 100dvh − 48) | dialog L 1120 | 1120 (không giãn) |
| Padding thân | 32 / 16 / 24 (trên / ngang / dưới) | 32 | 48 / 48 / 32 | như 1280 |
| Nút đóng | 48, cách mép 12 | cách 24 | cách 24 | cách 24 |
| Lưới | 2 cột, card 158, gap 24 / 12 | 4 cột, card 154, gap 24 / 16 | 4 cột, card 238, gap 24 | như 1280 |
| Cuộn | thân cuộn trong sheet (`overscroll-behavior: contain`), chân dính đáy | thân cuộn nếu thấp hơn nội dung | thường không cuộn (~720 < 772) | không cuộn |
| Chân | nút xếp dọc full, primary dưới cùng, padding 16 | 1 hàng căn inline-end, cách 12, padding 24 / 32 | padding 24 / 48 | như 1280 |

Lý do 768 dùng 4 cột 154 thay 2 × 2: một hàng, popup không phải cuộn trên tablet; 154 bằng card 360 của foundation §1 nên nút 44 "Add To Cart" vẫn vừa (mockup khung 1 bản 768). 360 dùng 2 × 2 như lưới collection (foundation §1), không dùng hàng cuộn ngang trong sheet để vuốt xuống đóng không xung đột vuốt ngang (15 §2).

## 4. Card kết quả

Card foundation §9 (media 1:1 nền cream bo 12, badge, tiêu đề 16/500 hiện đủ, không cắt, giá, swatch chỉ báo `aria-hidden`), thêm:
- Nút Quick View trên ảnh: nguyên ES1-T262 §4 (≥ 64rem hover: thanh 44 trượt lên; < 64rem / màn chạm: tròn 44 góc dưới). Đã chốt M1: mọi card cùng hành vi.
- Nút dưới card (chỉ trong quiz, ĐỀ XUẤT, nguồn ticket + 08 #529D, 05 §5): secondary full width, cao 44, chữ 14/600, padding 12, icon túi + 20; `margin-block-start: auto` để các nút thẳng hàng; `z-index` trên link phủ card.
  - Sản phẩm 1 biến thể còn hàng: "Add To Cart" (sổ 07/11), tên đọc "Add To Cart: {title}".
  - Sản phẩm nhiều biến thể: "Choose Options", tên đọc "Choose Options for {title}"; mở quick view trong popup (§5 trạng thái 2f). Không thêm biến thể mặc định vào giỏ (sổ 10/11, 2048 biến thể: bộ chọn từ option).
  - Hết hàng toàn bộ: "Sold Out" disabled (foundation §6), badge Sold out, ảnh 0.6.
- Thứ tự sản phẩm (ĐỀ XUẤT, 08 #2369D): còn hàng trước, hết hàng chỉ để lấp cho đủ 4. Liquid lặp 2 lượt trên `collection.products`, không cần JS.
- Không JS (trang §6): "Add To Cart" là `<form method="post" action="{{ routes.cart_add_url }}">` + `id` biến thể đầu còn hàng (Shopify chuyển sang /cart); "Choose Options" là link `product.url`; nút Quick View ẩn khi chưa định nghĩa custom element (ES1-T262 §4).

## 5. Trạng thái

Mockup khung 2. Figma không có: ĐỀ XUẤT theo nguồn ghi bên cạnh.

| # | Trạng thái | Thiết kế | Nguồn |
| --- | --- | --- | --- |
| 1 | Có kết quả | khung 1 | TE-11 AC3 |
| 2a | Đang tìm | popup mở ngay khi bấm "See My Shortlist" (không đợi mạng): tiêu đề + câu trả lời đã có; dòng đếm thay bằng spinner 20 + "Matching your gear…" (`role="status"`); lưới skeleton đúng số cột (media 1:1, 2 dòng, nút 44); chỉ "Retake Quiz" ở chân; thân `aria-busy`. Nút Submit `aria-busy` trong lúc mở | foundation §18; index-mobile-a §6 ("Matching your gear") |
| 2b | Không khớp | nguyên ES1-T278: h "No Exact Match", 1 câu, "Shop All Equipment" (secondary) + "Change My Answers" (primary, đóng popup, về bước 1, focus tiêu đề bước 1). ≥ 768 dialog S 480, < 768 sheet | ES1-T278; AC-H16 |
| 2c | Lỗi tải | tiêu đề giữ; hộp lỗi foundation §18 `role="alert"`: "We Couldn't Load Your Matches" / "Check your connection, then try again. Your answers are saved." + "Try Again" (secondary, tải lại partial) + link chữ "Open my shortlist as a page" (URL `?view=quiz`, chạy không JS); chân "Retake Quiz" | foundation §18; 05 §4 (nói cách sửa) |
| 2d | Card hết hàng | badge Sold out, ảnh 0.6, nút disabled "Sold Out", giá giữ; tên đọc thêm ", sold out" | foundation §9; 08 #2369D |
| 2d | Đang thêm | nút `aria-busy`, spinner, giữ bề rộng, không bấm lại; chữ ẩn ", adding" | foundation §6; 05 §5 |
| 2d | Đã thêm | ĐỀ XUẤT (câu CTO 1): popup ở lại; nút đổi "Added" + check badge-new viền badge-new 3 s rồi về "Add To Cart"; dòng thông báo đầu thân (mẫu cd-notice ES1-T262: thanh 4px badge-new, "Added to cart" + tên, link "View cart" 44) `role="status"`; số giỏ header nhảy | 05 §6; sổ 09/11 toast success = badge-new; 15 §1 một lớp popup |
| 2d | Lỗi thêm (422) | câu Shopify trả về dưới nút, 14/500 sale + icon 16, `role="alert"`; nút về bình thường | 05 §4; ES1-T262 5d |
| 2e | ≤ 4 kết quả | không "View All"; primary "Shop All Equipment →"; lưới giữ số cột, card căn đầu dòng | 04 §1 (không CTA vô nghĩa) |
| 2f | Choose Options / Quick View | thay nội dung trong cùng dialog (không mở lớp thứ 2): thanh trên có "Back to shortlist" (back-button 44, chữ 14 muted, nhỏ hơn ×) + ×; thân = quick view ES1-T262 §3 (ảnh, tên h3, giá + badge, bộ chọn option, "Add To Cart" + "View Detail"). Thêm xong: về lưới với thông báo 2d | 15 §1, 22 §6 #5 (không chồng modal); 06 §1 (cùng quick view); câu CTO 2 |
| — | Ít hơn 3 tag trên URL | Shopify bỏ tag không tồn tại → code tính 0 kết quả → 2b | code `required_tags` (ES1-T133 #1) |
| — | Không ảnh | placeholder foundation §9 | foundation §9 |

Hover / focus: card nhấc 4px, ảnh 1.04, tiêu đề gạch chân (foundation §9); nút secondary đảo nền foreground; focus outline 2px accent offset 2 (foundation §6). Pill câu trả lời không có hover (không bấm được).

Motion (foundation §19): dialog mở 300 fade + nhấc 24 + scale 0.97, đóng 200; sheet trượt từ đáy 300 / 200, vuốt xuống đóng; skeleton → card đổi opacity 250; 2f thân trượt ngang 24 + fade 250, Back chiều ngược lại. Chỉ transform / opacity; `prefers-reduced-motion` tắt hết.

Tương tác: mở bằng hành động của người mua (submit), không phải popup marketing; trong lúc mở, popup marketing tự mở phải chờ (sổ 10/11 hàng đợi, mỗi lúc 1 popup). Đóng: ×, Escape, scrim, vuốt xuống (< 768). "Retake Quiz": đóng popup, xoá lựa chọn, về bước 1, focus tiêu đề bước 1. Đóng bằng × giữ lựa chọn, focus về nút "See My Shortlist".

## 6. Trang `?view=quiz` (templates/collection.quiz.liquid)

URL: `/collections/{handle}/{tag}+{tag}+{tag}?view=quiz`. Vai trò: (a) nguồn partial `quiz-results` cho JS; (b) trang tự đứng khi mở link chia sẻ, khi popup lỗi (2c), khi JS hỏng. Không thay luồng không JS của form quiz (form GET sang search với `filter.p.tag`, TE-11 AC1).

Anatomy (mockup khung 3, 4):
1. Header foundation §3 (thanh tối, noise).
2. Breadcrumb foundation §5: Home / Your Gear Shortlist.
3. Tiêu đề trang foundation §5: eyebrow accent "Product finder" → h1 "Your Gear Shortlist" → meta 16 muted "5 products match all 3 answers. Showing the top 4.". Thay h1 = `collection.title` hiện có ("Products" ở collection all, không nói gì về kết quả).
4. Hàng câu trả lời: "Your answers:" 14 muted + 3 pill sand + link chữ "Retake the quiz" (44, `routes.root_url` + `#home-quiz`). Không có nhãn lựa chọn ở template này (setting nằm ở `templates/index.liquid`), nên pill hiện tên tag bỏ tiền tố `quiz-`, viết hoa chữ đầu ("Lower", "Intermediate", "Gym"). ĐỀ XUẤT, câu CTO 3.
5. Lưới card §4: 2 cột 152 / 4 cột 170 / 4 × 292 / 4 × 336; gap như collection (foundation §1). 768 dùng 4 cột theo chốt H3 (index-mobile-a §13: 4 sản phẩm → 4 cột). Card h2.
6. Hàng hành động căn giữa, cách lưới 48: primary "View All 5 Matches →" + secondary "Retake Quiz" (link); < 768 xếp dọc full, cách 12. ≤ 4 kết quả: primary "Shop All Equipment →".
7. Footer foundation §4.

Rỗng (khung 4): tiêu đề trang giữ; khối rỗng foundation §18: icon hộp trong tròn 72, h2 "No Exact Match", câu ES1-T278, primary "Change My Answers" (link về quiz trang chủ) + secondary "Shop All Equipment". Khoảng trên dưới 48.

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Lề / nội dung | 20 / 320 | 20 / 728 | 20 / 1240 | 252 / 1416 |
| h1 | 33 | 43 | 48 | 48 |
| Lưới | 2 × 152, gap 24 / 16 | 4 × 170, gap 24 / 16 | 4 × 292, gap 40 / 24 | 4 × 336 |
| Hành động | dọc full | 1 hàng giữa | 1 hàng giữa | 1 hàng giữa |

SEO, Performance: `<title>` "Your Gear Shortlist – {shop}"; canonical là URL tag không query (Shopify `canonical_url` bỏ `?view`); ảnh card đầu eager + `fetchpriority="high"` (LCP, AGENTS: hàng card đầu khi không banner), còn lại lazy; không JS bắt buộc.

## 7. Settings merchant

Không thêm setting. Dùng sẵn của `quiz`:

| Tên (sentence case) | Kiểu | Default | Ghi chú |
| --- | --- | --- | --- |
| Results popup (`results_popup`) | checkbox | ĐỀ XUẤT đổi `false` → `true` | sổ 09/11 đã chốt popup; template trang chủ đang truyền `true` |
| Collection (`collection`) | collection | trống | đích "Shop All Equipment" khi ≤ 4 hoặc 0 kết quả; trống → `routes.all_products_collection_url` |
| Empty text (`empty_text`) | text | ĐỀ XUẤT "We could not find gear for every answer. Change one answer or browse all equipment." | copy ES1-T278, thay câu hiện tại |

Số sản phẩm tối đa (4) là hằng theo TE-11 AC3, không thành setting (AGENTS "add only settings the design needs").

## 8. Accessibility

Tương phản (số foundation §2, index-mobile-a §11):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| foreground / background | 17.4 | tiêu đề, tên card, nút secondary, "Added" |
| muted / background | 8.45 | dòng đếm, giá gạch, "Back to shortlist", "Your answers:" |
| foreground / sand | 14.0 | chữ pill câu trả lời |
| accent / sand (tick, phi chữ) | 4.04 | ≥ 3 |
| sale / background | 6.38 | giá sale, lỗi thêm giỏ |
| sale-foreground / sale | 6.38 | badge -N% |
| background / foreground | 17.4 | badge Sold out |
| accent-foreground / accent | 5.01 | nút primary |
| muted-light / background | 5.33 | chữ nút secondary disabled "Sold Out" |
| badge-new / background (viền, icon) | 4.57 | "Added", thanh thông báo (phi chữ ≥ 3) |

- Vùng chạm: × 48; nút card, Quick View, Back, "View cart", "Retake the quiz" 44; primary / secondary chân 48 (52 từ 80rem). Pill, swatch không tương tác.
- Dialog: `<dialog>` + `showModal()` (bẫy focus, nền inert), `aria-labelledby` = tiêu đề, `aria-describedby` = dòng đếm; mở thì focus tiêu đề (`data-quiz-title` có sẵn), đóng trả focus nút mở. 2f: focus tiêu đề quick view; Back trả focus về nút "Choose Options" của card đó.
- Live region: dòng đếm `role="status"` báo "5 products match…" khi kết quả về; thông báo "Added to cart" status; lỗi `role="alert"`. Không làm mờ chữ khi tải (Lighthouse tính opacity).
- Tên riêng: mỗi nút card kèm tên sản phẩm (chữ ẩn); không có 2 link cùng tên khác đích ("View All 5 Matches" và "Shop All Equipment" không cùng lúc).
- Heading: popup h3 → card h4 (code hiện có, đúng thứ tự sau h2 khối quiz); trang h1 → card h2 (sửa, xem §9).
- Không chỉ dùng màu: hết hàng có chữ "Sold out"; đã thêm có chữ "Added" + icon; câu trả lời có tick + chữ.

## 9. Bàn giao Dev (không sửa file trong ticket này)

| Việc | File | Phía |
| --- | --- | --- |
| Popup: tiêu đề "Your Gear Shortlist", pill câu trả lời, dòng đếm status, chân "View All N Matches" / "Shop All Equipment" + "Retake Quiz"; bỏ khối `quiz__empty` cũ, dùng markup 2b | `blocks/quiz.liquid`, `locales/en.default.json` (`blocks.quiz.*`) | FE |
| Card quiz: nút dưới card (form add / link Choose Options / Sold Out), thứ tự còn hàng trước, `sizes` "(min-width: 80rem) 238px, (min-width: 48rem) 154px, 50vw" (thay "25vw, 50vw") | `blocks/quiz.liquid`, `snippets/product-card.liquid` (tham số mới, chỉ quiz dùng) | FE |
| Trang `?view=quiz`: h1 "Your Gear Shortlist" thay `collection.title`, eyebrow, meta đếm, pill từ `current_tags`, hành động, card h2, rỗng §6; ảnh đầu eager | `templates/collection.quiz.liquid`, `blocks/quiz.liquid` (`results_view`) | FE |
| Schema: `results_popup` default true; `empty_text` default copy T278 | `blocks/quiz.liquid`, locale schema | FE |
| JS: mở popup ngay + skeleton, lỗi + Try Again, add to cart trong popup (status, giữ popup), quick view thay nội dung + Back, Retake, chặn popup marketing khi đang mở | `assets/quiz-dialog.js`, `assets/quiz-finder.js` (+ dùng lại quick view ES1-T262) | BE |

## 10. Quyết định CTO đã chốt 11/11 (theo đề xuất, sổ 11/11)

1. Add To Cart trong popup quiz giữ popup mở (nút "Added" + thông báo + số giỏ nhảy) thay vì đóng popup mở mini cart như TE-4 AC8 / TE-5 AC6, để người mua thêm tiếp từ shortlist? Đề xuất: có (§5 2d; 15 §1 một lớp popup).
2. "Choose Options" / Quick View từ popup quiz thay nội dung trong cùng dialog, có "Back to shortlist", không mở lớp popup thứ hai? Đề xuất: có (§5 2f; 22 §6 #5).
3. "View All N Matches" dẫn tới collection lọc đủ 3 tag (template collection mặc định, đủ danh sách), còn trang `?view=quiz` hiện pill bằng tên tag bỏ tiền tố `quiz-`? Đề xuất: có (§2, §6).
