KHÔNG CHẮC: Figma không có trang collection (chỉ trang chủ 1:359). demo-data không có ảnh collection, danh sách sản phẩm theo collection, cấu hình filter Search & Discovery, metafield rating (hỏi ở ES1-T265). Mockup dùng /collections/all (36 sản phẩm = 22 figma + 14 edge_cases, thứ tự export), filter giả định Availability, Price, Color, Size, Brand; số đếm tính từ demo-data; banner minh hoạ bằng efx-col-1.jpg. Ảnh sản phẩm store dev lệch tên (ES1-T245).

# UI spec: Trang collection (ES1-T254)

Mục đích: người mua thu hẹp danh sách theo tình trạng, giá, màu, size, hãng, đổi thứ tự, sang trang, rồi vào sản phẩm. Story TE-6 (AC1–AC4), docs/srs.md#TE-6.

Template `templates/collection.liquid`: `collection-banner` → `<collection-filters class="collection-layout">` [`collection-filters` + `collection-products`]. Snippet `filter-group`, `pagination`, `product-card`.

Đầu ra:
- Spec này; spec danh sách collection: `docs/ui-spec/list-collections.md`.
- Mockup `drafts/designer/ES1-T254/collection.html` + `collection-360|768|1280|1920.png`. Trang chính ở đầu file; S1–S7 (banner có ảnh, đang lọc, drawer, sort + phân trang, ca biên card, rỗng, đang tải, lỗi) ở cuối file.

Nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma > bộ kiến thức. Thành phần dùng lại foundation (`docs/ui-spec/foundation.md`, `drafts/designer/_kit/kit.css`). CTO 06/11 đã chấp nhận bố cục mặc định ES1-T107 #1–#7; mục nào spec này đổi đều ghi lý do (quyết định mới hơn hoặc ĐỀ XUẤT + câu hỏi CTO).

Figma tham chiếu: card sản phẩm 1:502 (trong 1:490), card collection 1:395/1:404, hero + header đè ảnh 1:362/1:422, footer 1:1104.

---

## 1. Anatomy

Theo thứ tự DOM (giữ nguyên ở mọi mốc, 06 §2):

1. Header: biến thể A (nền trắng) khi `collection.image` rỗng; biến thể B (đè ảnh) khi có ảnh (sổ quyết định 09/11, foundation §3).
2. Đầu trang:
   - A (không ảnh): breadcrumb `Home / Collections / {title}` · h1 `collection.title` · mô tả `collection.description` (nếu có).
   - B (có ảnh): banner ảnh + overlay; trong banner: breadcrumb · h1 · mô tả.
3. Bố cục kết quả `collection-layout`:
   - Cột lọc (từ 64rem) = drawer (dưới 64rem), cùng một `<dialog>`/form: tiêu đề "Filters" (h2) · nhóm lọc `<details>` · nút chân drawer.
   - Cột kết quả: thanh công cụ (nút Filter + badge · số kết quả · Sort by) · hàng chip lọc đang áp · lưới card · phân trang.
4. Footer foundation §4.

## 2. Settings merchant

Không thêm setting. Dùng setting có sẵn:

| Block | Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- | --- |
| collection-products | Columns on desktop | select | 4 (ĐỀ XUẤT 3, câu hỏi CTO 1) | 2, 3, 4; từ 48rem tối đa 3 |
| collection-products | Columns on mobile | select | 2 | 1, 2 (SRS: mặc định 2) |
| collection-banner | — | — | — | ảnh, tiêu đề, mô tả lấy từ admin collection |
| collection-filters | — | — | — | filter bật trong app Search & Discovery; sort mặc định = `collection.default_sort_by` (ES1-T106) |

ĐỀ XUẤT (08 #470D, §7 "≤ 7 options"): nhóm list hiện 6 giá trị đầu, còn lại sau nút "Show N more". Ngưỡng 6 cố định trong code, không làm setting.

## 3. Lưới và kích thước theo mốc

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Nội dung | 320 | 728 | 1240 | 1416 |
| Cột lọc | drawer 90% (324) | drawer 420 | 3/12 = 292 | 3/12 = 336 |
| Cột kết quả | 320 | 728 | 9/12 = 924 | 9/12 = 1056 |
| Card (mặc định đề xuất) | 2 × 152 | 3 × 232 | 3 × 292 | 3 × 336 (= Figma 1:502) |
| Card nếu giữ 4 cột | — | — | 4 × 213 | 4 × 246 |
| Gap card ngang / dọc | 16 / 24 | 16 / 24 | 24 / 40 | 24 / 40 |
| Gap cột lọc ↔ kết quả | — | — | 24 | 24 |
| Header | 80, A hoặc B | 80 | 80 | 80 |

Cách tính 1280: cột 12 = (1240 − 11 × 24) / 12 = 81.3; cột lọc 3 cột + 2 gutter = 292; kết quả 9 cột + 8 gutter = 924; 3 card = (924 − 48) / 3 = 292. 1920: cột 96, kết quả 1056, 3 card 336.
ĐỀ XUẤT: code đang dùng `minmax(0, 3fr) minmax(0, 9fr)` + gap (cột lọc 304 ở 1280), đổi sang `repeat(12, minmax(0, 1fr))` + span 3 / span 9 để mép cột lọc, lưới card khớp lưới 12 cột của header/footer (03 §1, foundation §1).
Từ 64rem (1024): cột lọc 234, 3 card × 234.

Khoảng cách dọc: breadcrumb → h1 8 (12 từ 64rem), h1 → thanh công cụ 24 (32 từ 64rem), thanh công cụ → chip 16, chip/thanh công cụ → lưới 24, lưới → phân trang 48 (64 từ 80rem), phân trang → footer `--section-gap` 48 / 120.

## 4. Đầu trang

### 4A. Không ảnh (mockup trang chính)
Theo foundation §5: breadcrumb 14, h1 `--font-size-h1` (33 / 43 / 48 / 48), mô tả body 16 `--color-muted` (8.45:1), `max-inline-size: 65ch` (06 §7.3). Mô tả rich text: link trong mô tả gạch chân (Lighthouse link-in-text-block).

### 4B. Có ảnh: banner + header đè ảnh (S1)
Sổ quyết định 09/11 thắng ES1-T107 #1 (06/11: chữ dưới ảnh): header đè ảnh như trang chủ, nên chữ nằm trên ảnh.

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Cao banner (gồm 80 header) | 360 | 400 | 480 | 560 |
| Lùi mép / bo | 0 / 0 (tràn màn như hero mobile, sổ 07/11) | 12 / 24 | 12 / 24 | 12 / 24 |
| Đệm đáy khối chữ | 32 | 32 | 48 | 48 |

- Ảnh `object-fit: cover`, focal point của admin (`image_tag` gắn object-position).
- Khối chữ thẳng mép trái logo/container (sổ 09/11 "nội dung hero thẳng mép trái"): banner lùi 12 nên khối chữ rộng `min(page-width − 2 × margin, 100% − 2 × (margin − 12))`.
- Breadcrumb, h1, mô tả màu `--color-background-dark-foreground`. Mô tả tối đa 56ch, tối đa 3 dòng trên ảnh; dài hơn thì ĐỀ XUẤT đưa mô tả xuống dưới banner (nền trắng) thay vì cắt chữ. 360: mô tả luôn dưới banner (ảnh thấp, 06 text over images).
- Overlay (ĐỀ XUẤT, 06 §6 "text over images", 14 #290D): gradient `--color-background-dark` 55% ở đỉnh (vùng header) → 30% ở 30% chiều cao → 70% từ 55% → 80% ở đáy. Chữ chỉ đặt trong vùng ≥ 70%.
  Tính tương phản chữ trắng: điểm ảnh sau overlay = (1 − a)·g + a·30. Chữ trắng 4.5:1 cần L nền ≤ 0.183, tức sRGB ≤ 118.
  - Vùng chữ a = 0.70: ảnh trắng tuyệt đối (g = 255) → 97.5 → L 0.121 → 6.15:1. Đạt với mọi ảnh.
  - Vùng header a = 0.55: đạt 4.5:1 khi đỉnh ảnh g ≤ 227 (#E3E3E3); ảnh trắng tuyệt đối còn 3.78:1. Rủi ro ghi ở §12.
- Không ảnh nào khác eager trên trang khi có banner (ảnh banner là LCP).

## 5. Cột lọc và drawer lọc

Một `<dialog id="collection-filter-drawer">` + form GET (code hiện có). Dưới 64rem là drawer, từ 64rem là cột trái tĩnh.

### 5.1 Cột lọc (≥ 64rem)
- Tiêu đề "Filters": h2, heading 700, `--font-size-h3`; gạch dưới 1px `--color-foreground`, cùng hàng và cùng đường gạch với thanh công cụ bên phải (mockup 1280).
- Không sticky (cột dài hơn màn hình khi mở nhiều nhóm; sticky + cuộn riêng làm khó bàn phím).
- Không có filter nào (`collection.filters` rỗng): không có cột, lưới chiếm 12/12 (code đã có).

### 5.2 Nhóm lọc (`snippets/filter-group`)
- `<details open>`, summary cao 52, chữ 16/600, chevron 12 × 7 bên phải xoay 180° khi mở (15 §6: icon bên phải). Gạch 1px `--color-border` giữa nhóm.
- ĐỀ XUẤT: summary có "N selected" 14 muted khi nhóm có giá trị đang chọn (08 #488D: thấy rõ đang lọc gì kể cả khi nhóm đóng).
- Thứ tự nhóm do merchant xếp trong Search & Discovery; hướng dẫn merchant đặt Price, Color, Size, Brand, Availability lên đầu (08 #474D).
- Dòng giá trị: `<label>` cả hàng, cao 44, checkbox 20 `accent-color: --color-accent`, nhãn 16, số đếm 14 muted canh phải (08 #467D, #479D). Chọn: tick cam + nhãn 600. Hover: nhãn gạch chân. Focus: outline 2px accent trên checkbox.
- Giá trị đếm 0 chưa chọn: `disabled`, chữ `--color-muted` (8.45) + gạch ngang chữ, không chỉ đổi màu (01, 06) (code có `disabled`, thêm gạch ngang).
- Swatch (`presentation: swatch`): tròn 24 viền 20% foreground, màu/ảnh từ `value.swatch`; chọn = vòng 2px nền + 2px accent; focus outline accent offset 4. Checkbox thật nằm trên, trong suốt (code có). Nhãn tên màu luôn hiện cạnh swatch (08 #450D, 01: không chỉ màu).
- Nhóm > 6 giá trị: 6 đầu + "Show N more" (16/600 gạch chân, cao 44). ĐỀ XUẤT làm bằng `<details>` lồng (không JS): summary là nút, giá trị 7+ trong body; chữ ẩn "{{ filter.label }} options" để tên nút rõ.
- Giá (`price_range`): 2 ô "Min price" / "Max price" 2 cột, gap 12, label thật trên ô (14/500), tiền tố "$" (`--color-muted`, `aria-hidden`; ký hiệu lấy từ tiền tệ shop), viền `--color-muted-light` (sổ 09/11), placeholder 0 và giá trần. Gợi ý "Highest price is $1,000.00" 14 muted. Không slider (ES1-T107 #4, 08 #416D nhập tay).
  Lỗi min > max: chuỗi có sẵn `price_invalid`, hiện ngay dưới 2 ô khi rời ô (05 §4), viền sale 2px, `aria-invalid` + `aria-describedby`, không gửi request (BE ES1-T111 đã kiểm).

### 5.3 Drawer (< 64rem, S3)
- Trái, rộng 90% ở 360, 420 từ 48rem (foundation §15; 08 §7 "filter drawer trái 90% có icon x"). Code đang 100% / 28rem: câu hỏi CTO 2.
- Header 72: "Filters" h2 + nút đóng tròn 48 (foundation §6), cách mép 12.
- Body cuộn riêng; dòng đầu "N filters applied · M products" 14 muted (`role="status"`).
- Chân dính đáy (08 §7 "Áp dụng sticky", Rất cao): `[Clear all]` secondary (rộng theo chữ) + `[Show M products]` primary (phần còn lại). M cập nhật theo kết quả. Có JS: lọc áp ngay phía sau, nút primary chỉ đóng drawer và đưa focus về nút Filter. Không JS: nút primary là submit (thay nút "Apply" hiện có; code đang ẩn Apply khi `data-enhanced`, ĐỀ XUẤT giữ nút với nhãn mới).
- Mở 250ms trượt trái, đóng 200ms; đóng bằng ×, Escape, chạm scrim (foundation §15).

## 6. Thanh công cụ

| | 360 | 768 | 1280 / 1920 |
| --- | --- | --- | --- |
| Hàng 1 | [Filter (badge)] auto · [Sort] phần còn lại | [Filter] · số kết quả · [Sort 240] | số kết quả · [Sort 240] |
| Hàng 2 | số kết quả | — | — |
| Dính | dính dưới header (top 80), nền trắng, gạch 1px border tràn màn | như 360 | không dính; gạch 1px foreground |

- Nút Filter: secondary, cao 48 / 52, icon lọc 20 + "Filter" + badge số filter đang áp (tròn 24, nền accent, chữ 13/700 accent-foreground 5.01:1) + chữ ẩn "N filters applied" (code có). Hover nút secondary đảo đen, badge đổi nền trắng chữ đen. Ẩn khi không có filter (code có), ẩn từ 64rem.
- Số kết quả: "**36** products" 14, số 600 foreground, chữ muted. ĐỀ XUẤT: luôn hiện cả mobile (08 #531D). Code đang để số trong partial `collection-products` (dưới thanh công cụ); đặt cùng hàng Sort bằng CSS (vd `display: contents` cho vùng kết quả + grid area) hoặc partial nhỏ riêng trong thanh công cụ (FE/BE chọn, live region `collection-status` giữ nguyên).
- Sort: `<select>` gốc (picker hệ điều hành trên mobile; 08 §7 "sort dạng popup" được đáp ứng bởi picker), nhãn thật "Sort by" 12/500 muted nằm trong ô phía trên giá trị (04 §5 label nổi), giá trị 16/500 (không zoom iOS), cao `--control-height`, viền `--color-muted-light` (sổ 09/11; code đang `--color-border`), chevron phải, chữ dài cắt "…". Tuỳ chọn và tên do Shopify trả (`collection.sort_options`; 08 #513D "Price, low to high" đạt sẵn). Giá trị đang chọn hiện trong ô (08 #521D). Hover viền foreground; focus viền + outline accent.
- Không JS: nút "Apply sort" trong `<noscript>` (code có).

## 7. Chip lọc đang áp (S2)

ĐỀ XUẤT (08 #488D Cao, mobile Rất cao; ticket yêu cầu). Code chưa có.
- Vị trí: ngay dưới thanh công cụ, trên lưới; nằm trong partial `collection-products` để cập nhật cùng kết quả.
- `<ul aria-label="Active filters">`; mỗi chip là `<a href="{{ value.url_to_remove }}">` (giá: `filter.url_to_remove`), chạy không JS.
- Chip: pill cao 44 (40 từ 80rem), padding 16 / 12, viền 1px foreground, chữ 14/500; tên nhóm `--color-muted` ("Color:"), giá trị foreground; × 14. Tên đọc: "Remove filter Color: Black". Giá: "Price: $50–$400".
- Hover: nền foreground, chữ trắng (17.4:1). Focus: outline 2px accent offset 2.
- Cuối hàng: text link "Clear all" (cao 44) → `collection.url` giữ `sort_by`.
- Xuống dòng khi nhiều chip (không cuộn ngang, giữ zoom 200%).

## 8. Lưới card, phân trang

- Card = foundation §9 (Figma 1:502). Tiêu đề card h2 (code `heading_level: 'h2'`), tối đa 2 dòng. Badge một góc: Sold out > -N% > New. Giá luôn hiện kể cả hết hàng (08 #452D). Swatch tối đa 3 + "N colors" khi nhiều hơn (foundation).
- Ca biên (S5, edge_cases): hết hàng toàn bộ → Sold out + ảnh 0.6; không media → placeholder; "Sale giá nhỏ" $0.99 / $1.99 → -50%; compare_at ($100) thấp hơn giá ($200) → không badge, không giá gạch; gift card → "From $10.00" (khoảng giá variant).
- Phân trang 24 / trang (SRS AC1; giữ số trang thay Load more: link thật cho SEO và chạy không JS, 08 #2167D tránh infinite scroll).

| | < 768 | ≥ 768 |
| --- | --- | --- |
| Bố cục | `[← Previous]  Page 1 of 2  [Next →]` trải hết hàng | `[← Previous] 1 … 4 [5] 6 … 9 [Next →]` canh giữa |
| Nút | cao 48, chữ 16 | 44 × 44, chữ 14 |
| Previous / Next | chữ + mũi tên 18 × 14, chữ ẩn " page" | như < 768 |

- Trang hiện tại: nền accent, chữ trắng 700, `aria-current="page"` (ES1-T107 #6 CTO chấp nhận). Link: viền `--color-border`, hover viền foreground, focus outline accent. Dấu "…" muted, không phải link.
- ĐỀ XUẤT "Page X of Y" dưới 768 (08 #504D "dễ bấm trên mobile"): 9 nút × 44 không vừa 320.
- Trang 1 không có Previous, trang cuối không có Next (code). Sang trang: cuộn về đầu lưới, focus vào h1 hoặc số kết quả (BE nếu chặn link).

## 9. Trạng thái

| Trạng thái | Thiết kế | Nguồn |
| --- | --- | --- |
| Collection rỗng (S6) | empty-state foundation §18: icon hộp trong tròn 72 · h2 "No Products Here Yet" · câu "No products in this collection yet. Browse all our gear or pick another category." · primary "Shop All Products" (`routes.all_products_collection_url`) + text link "Browse collections" (`routes.collections_url`). Thanh công cụ ẩn Filter/Sort khi `all_products_count` = 0. | AGENTS empty state, 05 §7; code có câu + CTA (đang secondary) |
| Lọc không ra (S6) | chip vẫn hiện để bỏ từng lọc · icon lọc · h2 "No Matching Products" · "No products match these filters. Remove a filter or widen the price range." · primary "Clear filters". | 05 §7 "không kết quả có gợi ý" |
| Đang cập nhật (S7) | `aria-busy="true"` trên vùng kết quả; card cũ mờ 40%, không bấm; chỗ số kết quả đổi thành spinner 20 + "Updating products…" (`role="status"`). Nhảy trang chưa có card: skeleton cùng kích thước card. Không đổi chiều cao (0 CLS). | foundation §18, 05 §6 |
| Lỗi tải (S7) | alert foundation §18 trên lưới: icon ! sale · "We couldn't update the products" · "Check your connection, then try again. Your filters are kept." · secondary "Try Again". Lưới cũ giữ nguyên. `role="alert"`. | foundation §18, 05 §4 |
| Lỗi giá (S3) | §5.2 | 05 §4 |
| Hover / focus / active | card nhấc 4 + ảnh 1.04 (foundation §9); chip đảo đen; link trang viền đen; select viền đen; mọi focus outline 2px accent | foundation §6, sổ 07/11 |
| Không JS | form GET + chip/phân trang/Clear all là link; drawer là popover gốc (code); "Show N products" submit | SRS AC2 |

Chuỗi mới (ĐỀ XUẤT, `locales/en.default.json`, key theo code): `blocks.collection_products.empty_heading`, `empty_hint`, `empty_filtered_heading`, `empty_filtered_hint`, `browse_collections`, `active_filters`, `remove_filter` ("Remove filter {{ label }}: {{ value }}"), `updating`, `error_heading`, `error_text`, `retry`; `blocks.collection_filters.show_results` (số ít/nhiều), `show_more` ("Show {{ count }} more"), `show_more_label` ("{{ label }} options"), `selected` ("{{ count }} selected"), `price_highest`; `collections.pagination.page_of` ("Page {{ current }} of {{ total }}"). Có sẵn: `filter`, `sort_label`, `results_count`, `filters_applied`, `clear_all`, `price_min`, `price_max`, `price_invalid`, `empty`, `empty_filtered`, `empty_cta`, `empty_clear`.

## 10. Accessibility

Tương phản (L tính tay, foundation §2):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| foreground / background | 17.4 | nhãn lọc, chip, giá, số trang |
| muted / background | 8.45 | số đếm, "Sort by" 12px, số kết quả, chữ disabled, "Page X of Y" |
| muted-light / background | 5.33 | viền select, ô giá (WCAG 1.4.11 ≥ 3) |
| accent-foreground / accent | 5.01 | badge số lọc, trang hiện tại, nút Show N products |
| background / foreground | 17.4 | chip hover |
| sale / background | 6.38 | lỗi giá, giá sale |
| trắng / banner vùng chữ (overlay ≥ 70%) | ≥ 6.15 | breadcrumb, h1, mô tả trên ảnh |

- Vùng chạm: dòng lọc 44, summary 52, chip 44 (40 desktop), nút trang 48 / 44, nút Filter, Sort 48 / 52, đóng drawer 48, swatch 24 trong hàng nhãn 44 (target-size ≥ 24).
- Bàn phím: Tab qua nhóm (summary Enter/Space), checkbox Space; drawer `showModal()` bẫy focus, Escape đóng, trả focus về nút Filter (AC4); chip là link; select gốc.
- Screen reader: số kết quả trong live region `collection-status` sau mỗi lần lọc ("10 products"); badge số `aria-hidden` + chữ ẩn; chip có tên đầy đủ; nút "Show 4 more" có chữ ẩn tên nhóm; Previous/Next có " page"; số trang có `aria-label="Page 2"` (code).
- Heading: h1 tên collection → h2 "Filters" → h2 tên card (code) → h2 tiêu đề trạng thái rỗng (mockup S5, S6 dùng h3 chỉ vì nằm trong khối demo có h2). Breadcrumb `<nav aria-label="Breadcrumb">`.
- Không chỉ dùng màu: chọn = tick/vòng + chữ đậm + chip; disabled = thuộc tính + gạch ngang; lỗi = icon + chữ.
- Ảnh: card alt = alt Shopify hoặc tên sản phẩm; ảnh banner `alt=""` (h1 ngay trên ảnh đã nói tên; ĐỀ XUẤT, tránh đọc lặp).

## 11. Motion

Chỉ transform/opacity (sổ 09/11). Drawer 250 / 200; chevron nhóm xoay 250; chip hover 150; lưới mờ khi cập nhật opacity 250; card reveal khi cuộn chỉ cho trang tải lần đầu, không chạy lại sau khi lọc (tránh nháy). `prefers-reduced-motion`: tắt hết.

## 12. Lighthouse

Chỉ tiêu: SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90 (sổ 09/11).
- LCP:
  - B (có ảnh): ảnh banner, eager + `fetchpriority="high"`, `srcset` 360–1920, `sizes` = `100vw` dưới 48rem và `calc(100vw - 24px)` từ 48rem (code đang `min(100vw, max_page_width)` → ảnh 1920 nhỏ hơn bề rộng banner tràn màn ở 1920: ĐỀ XUẤT sửa sizes). Mọi card lazy (code có).
  - A (không ảnh): card đầu (ảnh sản phẩm) hoặc h1. Card hàng đầu eager, chỉ card 1 có `fetchpriority="high"`; từ hàng 2 lazy (foundation §9). Với 3 cột desktop: 3 eager (code đang lấy `columns_desktop`, tự đúng khi đổi default).
- Ảnh lazy: card hàng 2+, swatch ảnh trong nhóm lọc (`presentation: image`), mọi ảnh trong drawer.
- Font: Sofia Sans Condensed (h1, "Filters", tiêu đề trạng thái), Inter (còn lại). 2 họ, qua font_picker.
- A11y đã tránh: label thật cho Sort và ô giá (select-name, label); dialog có tên (`aria-labelledby`); badge số không phải tên duy nhất; chip/nút có tên riêng; không heading nhảy bậc; target-size đủ; không chữ xám trên `--color-border`.
- Rủi ro A11y: chữ header trên banner (overlay 55%) có thể dưới 4.5:1 nếu đỉnh ảnh gần trắng (§4B). axe không chấm chữ trên ảnh nền (kết quả "incomplete") nên không mất điểm Lighthouse, nhưng là lỗi AA thật: tài liệu merchant ghi "dùng ảnh có vùng trên tối hoặc trung tính"; header chuyển nền trắng sau 80px cuộn (foundation biến thể C).
- SEO: một h1; phân trang và chip là `<a href>` thật; chữ link mô tả đích ("Next page", "Remove filter Color: Black", "Shop All Products"); chữ nhỏ nhất 12 (nhãn Sort); canonical theo snippet `meta-tags` (URL có `filter.*`, `sort_by` không thành trang trùng).
- Best Practices: 0 lỗi console (mockup 0 lỗi ở 4 mốc); ảnh `object-fit` không méo; ô giá không chặn dán.
- Performance/CLS: thanh công cụ dính bằng CSS; chip, trạng thái cập nhật, lỗi nằm trong vùng kết quả và giữ chỗ (lưới cũ giữ nguyên chiều cao); drawer `position: fixed`; "Show N more" chỉ mở khi bấm.

## 13. Map sang code (cho Dev FE/BE)

| Hạng mục | Hiện có | Cần đổi (ticket FE/BE) |
| --- | --- | --- |
| Banner | ảnh trên, chữ dưới, 4/3 → 16/5 | biến thể B: chữ trên ảnh, overlay §4B, header `[data-header-overlay]`, cao 360/400/480/560, lùi 12 bo 24 từ 48rem; sizes |
| Bố cục | 3fr / 9fr | 12 cột span 3 / 9; default 3 cột (câu hỏi 1) |
| Nhóm lọc | details, checkbox 24, chevron | summary 52 + "N selected"; disabled gạch ngang; "Show N more" bằng details lồng; ô giá tiền tố + gợi ý + viền muted-light |
| Drawer | 100% / 28rem, nút Apply ẩn khi có JS | 90% / 420 (câu hỏi 2); chân dính Clear all + Show N products |
| Thanh công cụ | Filter + Sort; số kết quả trong partial | dính dưới header < 64rem; số kết quả cùng hàng; Sort nhãn nổi, viền muted-light |
| Chip | — | mới trong partial `collection-products` |
| Phân trang | Previous / số / Next, 44 | < 48rem "Page X of Y" + nút 48; mũi tên |
| Rỗng / lỗi / tải | câu + nút secondary | empty-state đầy đủ, alert, aria-busy (BE) |

## 14. Quyết định CTO cần chốt

1. Khi có cột lọc, đổi mặc định "Columns on desktop" từ 4 sang 3 để card 292 (1280) / 336 (1920) đúng cỡ Figma 1:502, thay vì 213 / 246? Đề xuất: có (§3; 08 #2272D ảnh lớn).
2. Drawer lọc trên mobile rộng 90% (thấy nền, chạm nền để đóng; foundation §15, kiến thức 15 §1 và 08 §7) thay toàn màn như ES1-T107 #3? Đề xuất: có.
3. Banner có ảnh: chấp nhận overlay cố định (55% đỉnh, 70–80% vùng chữ) và không thêm setting độ tối, với rủi ro chữ header trên ảnh đỉnh gần trắng (§12)? Đề xuất: có; thêm setting sau nếu merchant cần.
