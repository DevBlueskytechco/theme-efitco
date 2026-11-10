KHÔNG CHẮC: Figma không có trang collection (gốc duy nhất là trang chủ 1:359). demo-data không có ảnh collection, mô tả collection, danh sách sản phẩm theo collection, cấu hình filter Search & Discovery, metafield rating (đã hỏi ở ES1-T265). Mockup dùng /collections/all (36 sản phẩm = 22 figma + 14 edge_cases, thứ tự export); filter giả định Availability, Price, Color, Size, Brand; số đếm tính từ demo-data; banner minh hoạ bằng efx-col-1.jpg, không mô tả. Ảnh sản phẩm store dev lệch tên (ES1-T245).

# UI spec: Trang collection (ES1-T254, vòng 3)

Mục đích: người mua thu hẹp danh sách theo tình trạng, giá, màu, size, hãng, đổi thứ tự, sang trang, rồi vào sản phẩm. Story TE-6 (AC1–AC4), docs/srs.md#TE-6.

Template `templates/collection.liquid`: `collection-banner` → `<collection-filters class="collection-layout">` [`collection-filters` + `collection-products`]. Snippet `filter-group`, `pagination`, `product-card`.

Đầu ra:
- Spec này; spec danh sách collection: `docs/ui-spec/list-collections.md`.
- Mockup `drafts/designer/ES1-T254/collection.html` + `collection-360|768|1280|1920.png`. Trang chính ở đầu file; S1–S7 (banner có ảnh, đang lọc, drawer, sort + phân trang, ca biên card, rỗng, đang tải, lỗi) ở cuối file.

Nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 > bộ kiến thức. Thành phần lấy từ foundation vòng 3 (`docs/ui-spec/foundation.md`, `drafts/designer/_kit/kit.css`). Không dùng trang live hay ảnh chụp store làm gốc (sổ 10/11).

Figma tham chiếu: header 1:362, card sản phẩm 1:502 (trong 1:490), card collection + nút chevron 52 1:395 / 1:398, hero thẻ bo góc 1:361, footer 1:1104.

## Thay đổi audit (ES1-T283, sửa ở ES1-T287)

| # | Mã | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | A4, câu CTO 5 | trang 1 không có Previous, trang cuối không có Next; < 768 "Page X of Y" dồn trái khi thiếu nút | luôn có Previous/Next; đầu/cuối mờ 0.35 + `aria-disabled`, giữ chỗ 52 (0 CLS); "Page X of Y" luôn giữa 2 nút | Sổ 10/11 audit (5), `docs/ui-spec/pagination.md` |
| 2 | A4 | §8 tự mô tả phân trang | §8 trỏ về `pagination.md` (snippet chung) | Sổ 10/11 S3/C3 |
| 3 | A12 | S7: card cũ mờ 40%, không bấm | không làm mờ: chờ ≤ 300 ms giữ card nguyên; > 300 ms hoặc sang trang bằng JS thì lưới thành skeleton cùng số ô, cùng cỡ card, như search S5 | foundation §18 (không làm mờ chữ, AA mọi trạng thái), search.md §6 S5 |

Mockup `drafts/designer/ES1-T254/collection.html`: phân trang trang chính (1/2, Previous tắt), S4 (2/2 Next tắt; 5/9), S7 vẽ lại.

## Thay đổi so với vòng 2

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header | A nền trắng (không ảnh), B trong suốt đè banner | 1 biến thể: thanh tối `--color-background-dark` + noise, cao 80, logo 100 × 30, menu trắng 60%, search 20; không đè ảnh | Sổ 10/11, Figma 1:362, foundation §3 |
| 2 | Banner có ảnh | tràn màn (360) / lùi 12 bo 24, cao 360–560 gồm header, lớp tối 55% → 30% → 80% | `.page-banner`: thẻ trong container dưới header, cách 16 / 24, bo 16, cao tối thiểu 280 / 360, lớp tối 75% đáy → 60% từ giữa lên | Sổ 10/11, foundation §3.3, Figma 1:361 |
| 3 | Rủi ro chữ header trên ảnh sáng | có (55%, 3.78:1 với ảnh trắng) | hết: header nền tối riêng; chữ banner ≥ 4.56:1 với mọi ảnh | foundation §3.3 |
| 4 | Previous / Next phân trang | nút chữ "Previous" / "Next" + mũi tên, viền vuông | nút tròn 52 chevron 11 × 16 như Figma 1:398 (trắng viền `--color-border`, rê chuột cam), tên "Previous page" / "Next page" | Sổ 09/11, Figma 1:398, ticket vòng 3 |
| 5 | Số trang | vuông bo 4, 48 / 44 | tròn 44 (pill), cùng hình với chevron; trang hiện tại cam | ĐỀ XUẤT §8 |
| 6 | Swatch trên card | radio bấm được | chỉ báo `aria-hidden`, không bấm; số màu đọc trong tên link (", 3 colors") | foundation §9 vòng 3 |
| 7 | Footer | newsletter + wordmark rút gọn | đủ 3 tầng Figma 1:1104: newsletter có ảnh, panel dải rộng (social 4, 2 menu, trust 4), hàng cuối wordmark + locale + thanh toán | foundation §4 |
| 8 | Drawer nhóm Color | 3 giá trị + "Show 7 more" (lệch quy tắc 6) | 6 giá trị + "Show 4 more", khớp cột lọc | §5.2 |
| 9 | Toolbar dính | top 80 dưới header trắng | top 80 dưới header tối; gạch 1px border ngăn với nội dung | foundation §3 |

Giữ nguyên nội dung và trạng thái vòng 2: cột lọc, nhóm lọc, chip, sort, ca biên card, rỗng, đang tải, lỗi.

---

## 1. Anatomy

Theo thứ tự DOM (giữ nguyên ở mọi mốc, 06 §2):

1. Header foundation §3 (thanh tối riêng, mục "Shop" `aria-current` cho /collections/all; collection thuộc menu Collection thì gạch chân mục đó).
2. Đầu trang:
   - A (không ảnh): breadcrumb `Home / Collections / {title}` · h1 `collection.title` · mô tả `collection.description` (nếu có), trên nền trắng.
   - B (có ảnh): `.page-banner` dưới header; trong banner: breadcrumb · h1 · mô tả.
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
| Header | 80, tối + noise, menu ☰ + logo + 3 icon | như 360 | 80, menu 7 mục gap 40 | như 1280, logo x 252 |
| Nội dung | 320 | 728 | 1240 | 1416 |
| Cột lọc | drawer 90% (324) | drawer 420 | 3/12 = 292 | 3/12 = 336 |
| Cột kết quả | 320 | 728 | 9/12 = 924 | 9/12 = 1056 |
| Card (mặc định đề xuất) | 2 × 152 | 3 × 232 | 3 × 292 | 3 × 336 (= Figma 1:502) |
| Card nếu giữ 4 cột | — | — | 4 × 213 | 4 × 246 |
| Gap card ngang / dọc | 16 / 24 | 16 / 24 | 24 / 40 | 24 / 40 |
| Gap cột lọc ↔ kết quả | — | — | 24 | 24 |
| Banner (khi có ảnh) | 320 × ≥ 280 | 728 × ≥ 280 | 1240 × ≥ 360 | 1416 × ≥ 360 |

Cách tính 1280: cột 12 = (1240 − 11 × 24) / 12 = 81.3; cột lọc 3 cột + 2 gutter = 292; kết quả 9 cột + 8 gutter = 924; 3 card = (924 − 48) / 3 = 292. 1920: cột 96, kết quả 1056, 3 card 336.
ĐỀ XUẤT: code đang dùng `minmax(0, 3fr) minmax(0, 9fr)` + gap (cột lọc 304 ở 1280), đổi sang `repeat(12, minmax(0, 1fr))` + span 3 / span 9 để mép cột lọc, lưới card khớp lưới 12 cột của header/footer (03 §1, foundation §1).
Từ 64rem (1024): cột lọc 234, 3 card × 234.

Khoảng cách dọc: header → breadcrumb 16 (24 từ 64rem), breadcrumb → h1 8 (12 từ 64rem), h1 → thanh công cụ 24 (32 từ 64rem), banner → thanh công cụ 24 (32 từ 64rem), thanh công cụ → chip 16, chip/thanh công cụ → lưới 24, lưới → phân trang 48 (64 từ 80rem), phân trang → footer `--section-gap` 48 / 120.

## 4. Đầu trang

### 4A. Không ảnh (mockup trang chính)
Theo foundation §5: breadcrumb 14 trên nền trắng ngay dưới header tối, h1 `--font-size-h1` (33 / 43 / 48 / 48), mô tả body 16 `--color-muted` (8.45:1), `max-inline-size: 65ch` (06 §7.3). Link trong mô tả gạch chân (Lighthouse link-in-text-block).

### 4B. Có ảnh: `.page-banner` dưới header (S1)
Sổ 10/11: header trang con luôn là thanh tối riêng, không đè ảnh, kể cả trang có banner. Hình thức theo hero Figma 1:361 (thẻ bo góc dưới header), chi tiết ở foundation §3.3.

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Bề rộng / vị trí | 320, trong container | 728 | 1240 | 1416 (x 252, thẳng logo) |
| Cách header | 16 | 16 | 24 | 24 |
| Cao tối thiểu | 280 | 280 | 360 | 360 |
| Bo góc | 16 | 16 | 16 | 16 |
| Đệm khối chữ | 32 / 24 | 32 / 24 | 48 | 48 |

- Ảnh `object-fit: cover`, focal point của admin (`image_tag` gắn object-position).
- Khối chữ đáy trái: breadcrumb trắng · h1 trắng · mô tả trắng tối đa 56ch, tối đa 3 dòng. Mô tả dài hơn: ĐỀ XUẤT đưa xuống dưới banner (nền trắng, muted) thay vì cắt chữ (06 "text over images"). 360: mô tả luôn dưới banner.
- Lớp tối (foundation §3.3): gradient `--color-background-dark` 75% ở đáy → 60% từ giữa lên. Chữ trắng trên ảnh trắng tuyệt đối sau lớp 60%: L nền 0.180 → 4.56:1; vùng đáy 75% → ≥ 7.3:1. Đạt AA với mọi ảnh merchant chọn.
- Không ảnh nào khác eager khi có banner (ảnh banner là LCP).

## 5. Cột lọc và drawer lọc

Một `<dialog id="collection-filter-drawer">` + form GET (code hiện có). Dưới 64rem là drawer, từ 64rem là cột trái tĩnh.

### 5.1 Cột lọc (≥ 64rem)
- Tiêu đề "Filters": h2, heading 700, `--font-size-h3`; gạch dưới 1px `--color-foreground`, cùng hàng và cùng đường gạch với thanh công cụ bên phải.
- Không sticky (cột dài hơn màn hình khi mở nhiều nhóm; sticky + cuộn riêng làm khó bàn phím).
- Không có filter nào (`collection.filters` rỗng): không có cột, lưới chiếm 12/12 (code đã có).

### 5.2 Nhóm lọc (`snippets/filter-group`)
- `<details open>`, summary cao 52, chữ 16/600, chevron 12 × 7 bên phải xoay 180° khi mở (15 §6: icon bên phải; chevron cùng dạng chevron menu header 1:362). Gạch 1px `--color-border` giữa nhóm.
- ĐỀ XUẤT: summary có "N selected" 14 muted khi nhóm có giá trị đang chọn (08 #488D).
- Thứ tự nhóm do merchant xếp trong Search & Discovery; hướng dẫn merchant đặt Price, Color, Size, Brand, Availability lên đầu (08 #474D).
- Dòng giá trị: `<label>` cả hàng, cao 44, checkbox 20 `accent-color: --color-accent`, nhãn 16, số đếm 14 muted canh phải (08 #467D, #479D). Chọn: tick cam + nhãn 600. Hover: nhãn gạch chân. Focus: outline 2px accent trên checkbox.
- Giá trị đếm 0 chưa chọn: `disabled`, chữ `--color-muted` (8.45) + gạch ngang chữ, không chỉ đổi màu (01, 06).
- Swatch (`presentation: swatch`): tròn 24 viền 20% foreground, màu/ảnh từ `value.swatch`; chọn = vòng 2px nền + 2px accent; focus outline accent offset 4. Checkbox thật nằm trên, trong suốt. Nhãn tên màu luôn hiện cạnh swatch (08 #450D, 01: không chỉ màu).
- Nhóm > 6 giá trị: 6 đầu + "Show N more" (16/600 gạch chân, cao 44). ĐỀ XUẤT `<details>` lồng (không JS); chữ ẩn "{{ filter.label }} options". Cột lọc và drawer cùng quy tắc (Color 10 giá trị: 6 + "Show 4 more").
- Giá (`price_range`): 2 ô "Min price" / "Max price" 2 cột, gap 12, label thật trên ô (14/500), tiền tố "$" (`--color-muted`, `aria-hidden`; ký hiệu từ tiền tệ shop), viền `--color-muted-light` (sổ 09/11), placeholder 0 và giá trần. Gợi ý "Highest price is $1,000.00" 14 muted. Không slider (ES1-T107 #4, 08 #416D).
  Lỗi min > max: chuỗi có sẵn `price_invalid`, hiện ngay dưới 2 ô khi rời ô (05 §4), viền sale 2px, `aria-invalid` + `aria-describedby`, không gửi request (BE ES1-T111 đã kiểm).

### 5.3 Drawer (< 64rem, S3)
- Trái, rộng 90% ở 360, 420 từ 48rem (foundation §15; 08 §7). Code đang 100% / 28rem: câu hỏi CTO 2.
- Nền trắng (header tối không lặp vào drawer, foundation §15). Header 72: "Filters" h2 + nút đóng tròn 48 (foundation §6), cách mép 12.
- Body cuộn riêng; dòng đầu "N filters applied · M products" 14 muted (`role="status"`).
- Chân dính đáy (08 §7, Rất cao): `[Clear all]` secondary (rộng theo chữ) + `[Show M products]` primary (phần còn lại). Có JS: lọc áp ngay phía sau, nút primary đóng drawer, focus về nút Filter. Không JS: nút primary là submit (thay "Apply" hiện có; code đang ẩn Apply khi `data-enhanced`, ĐỀ XUẤT giữ nút với nhãn mới).
- Mở 250ms trượt trái, đóng 200ms; đóng bằng ×, Escape, chạm scrim (foundation §15).

## 6. Thanh công cụ

| | 360 | 768 | 1280 / 1920 |
| --- | --- | --- | --- |
| Hàng 1 | [Filter (badge)] auto · [Sort] phần còn lại | [Filter] · số kết quả · [Sort 240] | số kết quả · [Sort 240] |
| Hàng 2 | số kết quả | — | — |
| Dính | dính dưới header tối (top 80), nền trắng, gạch 1px border tràn màn | như 360 | không dính; gạch 1px foreground |

- Nút Filter: secondary, cao 48 / 52, icon lọc 20 + "Filter" + badge số filter đang áp (tròn 24, nền accent, chữ 13/700 accent-foreground 5.01:1) + chữ ẩn "N filters applied" (code có). Hover nút secondary đảo đen, badge đổi nền trắng chữ đen. Ẩn khi không có filter, ẩn từ 64rem.
- Số kết quả: "**36** products" 14, số 600 foreground, chữ muted. ĐỀ XUẤT: luôn hiện cả mobile (08 #531D). Code đang để số trong partial `collection-products`; đặt cùng hàng Sort bằng CSS (`display: contents` + grid area) hoặc partial nhỏ trong thanh công cụ (FE/BE chọn, live region `collection-status` giữ nguyên).
- Sort: `<select>` gốc (picker hệ điều hành trên mobile), nhãn thật "Sort by" 12/500 muted nằm trong ô phía trên giá trị (04 §5), giá trị 16/500 (không zoom iOS), cao `--control-height`, viền `--color-muted-light` (sổ 09/11; code đang `--color-border`), chevron phải, chữ dài cắt "…". Tuỳ chọn do Shopify trả (`collection.sort_options`; 08 #513D). Giá trị đang chọn hiện trong ô (08 #521D). Hover viền foreground; focus viền + outline accent.
- Không JS: nút "Apply sort" trong `<noscript>` (code có).

## 7. Chip lọc đang áp (S2)

ĐỀ XUẤT (08 #488D Cao, mobile Rất cao; ticket yêu cầu). Code chưa có.
- Vị trí: ngay dưới thanh công cụ, trên lưới; trong partial `collection-products` để cập nhật cùng kết quả.
- `<ul aria-label="Active filters">`; mỗi chip là `<a href="{{ value.url_to_remove }}">` (giá: `filter.url_to_remove`), chạy không JS.
- Chip: pill cao 44 (40 từ 80rem), padding 16 / 12, viền 1px foreground, chữ 14/500; tên nhóm `--color-muted` ("Color:"), giá trị foreground; × 14. Tên đọc: "Remove filter Color: Black". Giá: "Price: $50–$400".
- Hover: nền foreground, chữ trắng (17.4:1). Focus: outline 2px accent offset 2.
- Cuối hàng: text link "Clear all" (cao 44) → `collection.url` giữ `sort_by`.
- Xuống dòng khi nhiều chip (không cuộn ngang, giữ zoom 200%).

## 8. Lưới card, phân trang

- Card = foundation §9 (Figma 1:502): media 1:1 nền cream bo 12 không viền, badge góc, tiêu đề Inter 16/500 tối đa 2 dòng, giá, swatch 32 × 16 cách 4. Tiêu đề card h2 (code `heading_level: 'h2'`). Badge một góc: Sold out > -N% > New. Giá luôn hiện kể cả hết hàng (08 #452D).
- Swatch là chỉ báo (foundation §9 vòng 3): `aria-hidden`, không bấm, không focus; tên link đọc thêm ", 3 colors". Nhiều hơn 3 màu: 3 swatch + "N colors" 14 muted.
- Ca biên (S5, edge_cases): hết hàng toàn bộ → Sold out + ảnh 0.6; không media → placeholder; "Sale giá nhỏ" $0.99 / $1.99 → -50%; compare_at ($100) thấp hơn giá ($200) → không badge, không giá gạch; gift card → "From $10.00".
- Phân trang 24 / trang (SRS AC1; giữ số trang thay Load more: link thật cho SEO, chạy không JS, 08 #2167D).
- Dùng snippet `pagination` chung; hình, trạng thái, mốc, A11y theo `docs/ui-spec/pagination.md`: `{% paginate collection.products by 24, window_size: 1 %}` → `{% render 'pagination', paginate: paginate %}` (không `anchor`, không `summary`: số kết quả đã ở thanh công cụ).
- Tóm tắt: < 768 `[‹ 52]  Page 1 of 2  [› 52]` trải hết hàng; ≥ 768 `[‹]  1 … 4 (5) 6 … 9  [›]` canh giữa, chevron cách số 16. Previous/Next tròn 52 (`aria-label="Previous page"` / `"Next page"`), số pill 44, trang hiện tại accent (ES1-T107 #6).
- Trang 1 / trang cuối: Previous / Next vẫn hiện, mờ 0.35 + `aria-disabled`, không link (sổ 10/11 audit 5). Bỏ "Trang 1 không có Previous" của vòng 3.
- Sang trang có JS (BE chặn link): vùng kết quả theo S7 (skeleton), cuộn về đầu lưới, focus vào số kết quả (pagination.md §3). Không JS: tải trang mới.

## 9. Trạng thái

| Trạng thái | Thiết kế | Nguồn |
| --- | --- | --- |
| Collection rỗng (S6) | empty-state foundation §18: icon hộp trong tròn 72 · h2 "No Products Here Yet" · "No products in this collection yet. Browse all our gear or pick another category." · primary "Shop All Products" (`routes.all_products_collection_url`) + text link "Browse collections" (`routes.collections_url`). Ẩn Filter/Sort khi `all_products_count` = 0. | AGENTS empty state, 05 §7 |
| Lọc không ra (S6) | chip vẫn hiện để bỏ từng lọc · icon lọc · h2 "No Matching Products" · "No products match these filters. Remove a filter or widen the price range." · primary "Clear filters". | 05 §7 |
| Đang cập nhật (S7) | Không làm mờ card, không làm mờ chữ (foundation §18: Lighthouse color-contrast tính opacity). Ngay khi lọc/sort/xoá chip: chỗ số kết quả thành spinner 20 + "Updating products…" (`role="status"`). Chờ ≤ 300 ms: card cũ giữ nguyên độ đậm, vẫn bấm được (link sản phẩm còn đúng). Chờ > 300 ms, hoặc sang trang bằng JS: lưới `aria-busy="true"` + skeleton foundation §18 (media 1:1 + 2 dòng 14, dòng 2 rộng 40%), số ô = số card đang hiện, cùng cỡ card (0 CLS), như search S5. Thanh công cụ, chip, cột lọc vẫn dùng được. ĐỀ XUẤT ngưỡng 300 ms: tránh nháy skeleton khi phản hồi nhanh (05 §3 mục 6, 05 §6 "không delay không rõ lý do"). | foundation §18, search.md §6 S5, 05 §6 |
| Lỗi tải (S7) | alert foundation §18 trên lưới: icon ! sale · "We couldn't update the products" · "Check your connection, then try again. Your filters are kept." · secondary "Try Again". Lưới cũ giữ nguyên. `role="alert"`. | foundation §18, 05 §4 |
| Lỗi giá (S3) | §5.2 | 05 §4 |
| Hover / focus / active | card nhấc 4 + ảnh 1.04; chip đảo đen; số trang viền đen; Previous/Next cam; select viền đen; focus outline 2px accent (trên header tối outline trắng) | foundation §3, §6, sổ 07/11, 09/11 |
| Không JS | form GET + chip/phân trang/Clear all là link; drawer là popover gốc (code); "Show N products" submit | SRS AC2 |

Chuỗi mới (ĐỀ XUẤT, `locales/en.default.json`): `blocks.collection_products.empty_heading`, `empty_hint`, `empty_filtered_heading`, `empty_filtered_hint`, `browse_collections`, `active_filters`, `remove_filter` ("Remove filter {{ label }}: {{ value }}"), `updating`, `error_heading`, `error_text`, `retry`, `color_count` (", {{ count }} colors"); `blocks.collection_filters.show_results`, `show_more`, `show_more_label`, `selected`, `price_highest`. Phân trang: chuỗi chung `collections.pagination.*` (đổi `previous`/`next`, thêm `page_of`; pagination.md §5). Có sẵn: `filter`, `sort_label`, `results_count`, `filters_applied`, `clear_all`, `price_min`, `price_max`, `price_invalid`, `empty`, `empty_filtered`, `empty_cta`, `empty_clear`.

## 10. Accessibility

Tương phản (L tính tay, foundation §2):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| foreground / background | 17.4 | nhãn lọc, chip, giá, số trang, chevron |
| muted / background | 8.45 | số đếm, "Sort by" 12px, số kết quả, chữ disabled |
| muted-light / background | 5.33 | viền select, ô giá (WCAG 1.4.11 ≥ 3) |
| accent-foreground / accent | 5.01 | badge số lọc, trang hiện tại, chevron hover, nút Show N products |
| background / foreground | 17.4 | chip hover |
| sale / background | 6.38 | lỗi giá, giá sale |
| trắng / banner (lớp ≥ 60%, ảnh trắng tuyệt đối) | ≥ 4.56 | breadcrumb, h1, mô tả trên ảnh |
| trắng 60% / header #1A1A1A | 6.93 | menu header |

- Viền nút tròn `--color-border` 1.26:1 chỉ là trang trí: nút nhận diện bằng chevron foreground 17.4:1 (WCAG 1.4.11 tính icon), như Figma 1:398.
- Vùng chạm: dòng lọc 44, summary 52, chip 44 (40 desktop), Previous/Next 52, số trang 44, nút Filter, Sort 48 / 52, đóng drawer 48, swatch lọc 24 trong hàng nhãn 44.
- Bàn phím: Tab qua nhóm (summary Enter/Space), checkbox Space; drawer `showModal()` bẫy focus, Escape đóng, trả focus về nút Filter (AC4); chip là link; select gốc. Swatch card không nhận focus.
- Screen reader: số kết quả trong live region `collection-status` sau mỗi lần lọc; badge số `aria-hidden` + chữ ẩn; chip có tên đầy đủ; "Show 4 more" có chữ ẩn tên nhóm; Previous/Next có `aria-label`; số trang `aria-label="Page 2"` (code); số màu trong tên link card.
- Heading: h1 tên collection → h2 "Filters" → h2 tên card → h2 tiêu đề trạng thái rỗng (mockup S5, S6 dùng h3 vì nằm trong khối demo có h2). Breadcrumb `<nav aria-label="Breadcrumb">`.
- Không chỉ dùng màu: chọn = tick/vòng + chữ đậm + chip; disabled = thuộc tính + gạch ngang; lỗi = icon + chữ.
- Ảnh: card alt = alt Shopify hoặc tên sản phẩm; ảnh banner `alt=""` (h1 ngay trên ảnh đã nói tên; ĐỀ XUẤT, tránh đọc lặp).

## 11. Motion

Chỉ transform/opacity (sổ 09/11). Drawer 250 / 200; chevron nhóm xoay 250; chip hover 150; Previous/Next hover 250 (màu + scale); lưới không mờ khi cập nhật, skeleton shimmer 1.4s sau 300 ms (S7); card reveal khi cuộn chỉ cho trang tải lần đầu, không chạy lại sau khi lọc (tránh nháy). `prefers-reduced-motion`: tắt hết.

## 12. Lighthouse

Chỉ tiêu: SEO 100 (collection nằm trong phạm vi SEO, sổ 10/11), A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90 (sổ 09/11).
- LCP:
  - B (có ảnh): ảnh banner, eager + `fetchpriority="high"`, width/height, `srcset` 360–1920, `sizes="min(100vw - 40px, 1416px)"` (banner nằm trong container; code đang `min(100vw, max_page_width)` vẫn đủ, chỉ tải dư nhẹ). Mọi card lazy.
  - A (không ảnh): card đầu (ảnh sản phẩm). Card hàng đầu eager, chỉ card 1 `fetchpriority="high"`; từ hàng 2 lazy (foundation §9). 3 cột desktop → 3 eager (code lấy `columns_desktop`).
- Ảnh lazy: card hàng 2+, swatch ảnh trong nhóm lọc (`presentation: image`), mọi ảnh trong drawer, ảnh newsletter footer.
- Font: Sofia Sans Condensed (h1, "Filters", tiêu đề trạng thái, wordmark footer), Inter (còn lại). 2 họ, qua font_picker.
- Header tối dùng `noise-dark.png` có sẵn làm `background-image` (critical.css), không chặn LCP; chevron là SVG inline từ `snippets/slideshow-icon`.
- A11y đã tránh: label thật cho Sort và ô giá; dialog có tên (`aria-labelledby`); Previous/Next icon có tên riêng; badge số không phải tên duy nhất; swatch card `aria-hidden` (không có control 16px dưới target-size); không heading nhảy bậc; không chữ xám trên `--color-border`; chữ trên banner ≥ 4.56:1 nhờ header không còn đè ảnh.
- Rủi ro còn lại: axe chấm chữ trên ảnh nền là "incomplete" (không mất điểm) nhưng thiết kế đã đảm bảo ≥ 4.56:1 bằng lớp tối cố định.
- SEO: một h1; phân trang và chip là `<a href>` thật; tên link mô tả đích ("Next page", "Remove filter Color: Black", "Shop All Products"); chữ nhỏ nhất 12 (nhãn Sort); canonical theo `meta-tags` (URL có `filter.*`, `sort_by` không thành trang trùng); JSON-LD BreadcrumbList.
- Best Practices: 0 lỗi console (mockup 0 lỗi ở 4 mốc); ảnh `object-fit` không méo; ô giá không chặn dán.
- Performance/CLS: header và thanh công cụ dính bằng CSS, cao cố định; chip, trạng thái cập nhật, lỗi nằm trong vùng kết quả và giữ chỗ; drawer `position: fixed`; "Show N more" chỉ mở khi bấm.

## 13. Map sang code (cho Dev FE/BE)

| Hạng mục | Hiện có | Cần đổi (ticket FE/BE) |
| --- | --- | --- |
| Header | nền tối chỉ khi có `.slideshow` | nền tối mọi trang, bỏ `[data-header-overlay]` (foundation §21) |
| Banner | ảnh trên, chữ dưới, 4/3 → 16/5 | `.page-banner` foundation §3.3: thẻ trong container, cách header 16/24, bo 16, cao ≥ 280/360, chữ trên ảnh, lớp tối 75 → 60% |
| Bố cục | 3fr / 9fr | 12 cột span 3 / 9; default 3 cột (câu hỏi 1) |
| Nhóm lọc | details, checkbox 24, chevron | summary 52 + "N selected"; disabled gạch ngang; "Show N more" bằng details lồng; ô giá tiền tố + gợi ý + viền muted-light |
| Drawer | 100% / 28rem, nút Apply ẩn khi có JS | 90% / 420 (câu hỏi 2); chân dính Clear all + Show N products |
| Thanh công cụ | Filter + Sort; số kết quả trong partial | dính dưới header < 64rem; số kết quả cùng hàng; Sort nhãn nổi, viền muted-light |
| Chip | — | mới trong partial `collection-products` |
| Phân trang | Previous / số / Next chữ, 44; ẩn nút ở đầu/cuối | sửa `snippets/pagination.liquid` theo `pagination.md` §10 (dùng chung mọi trang) |
| Card | swatch radio | swatch `aria-hidden` + ", N colors" trong tên link (foundation §21) |
| Rỗng / lỗi / tải | câu + nút secondary | empty-state đầy đủ, alert, aria-busy (BE) |

## 14. Quyết định CTO đã chốt (10/11)

CTO chốt cả các câu dưới đây theo đề xuất (docs/design/decisions.md, 10/11).
1. Có cột lọc thì đổi "Columns on desktop" mặc định 4 → 3 để card 292 / 336 đúng cỡ Figma 1:502? Đề xuất: có (§3; 08 #2272D).
2. Drawer lọc mobile rộng 90% (chạm nền để đóng) thay toàn màn của ES1-T107 #3? Đề xuất: có (foundation §15; 15 §1; 08 §7).
3. Previous/Next phân trang dùng nút tròn 52 chevron như carousel Figma 1:398 (tên "Previous page"/"Next page" qua aria-label), bỏ chữ hiện trên nút? Đề xuất: có (§8; sổ 09/11 nút tròn 52 mọi điều hướng prev/next).
