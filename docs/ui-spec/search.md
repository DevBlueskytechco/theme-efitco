KHÔNG CHẮC: (1) demo-data không có pages, body/excerpt article, tồn kho; kết quả article/page và số đếm Availability trong mockup là minh hoạ (hỏi BA ở ES1-T266). (2) Spec collection ES1-T254 trên develop vẫn là vòng 2 (header trắng/đè ảnh, phân trang pill chữ); search dùng chung snippet `filter-group`, chip, `pagination` với collection nên khi collection lên vòng 3 cần khớp lại §3.5–§3.9. (3) Ảnh store dev lệch tên (ES1-T245): P09 là kettlebell, P03 là dây thừng, P01 là áo tạ, P18 là quấn cổ tay, P17 là tạ đơn; mockup giữ URL.

# UI spec: Trang kết quả tìm kiếm (ES1-T256, vòng 3)

Template: `templates/search.liquid`. Story TE-8 AC2, AC3 (`docs/srs.md#TE-8`). Popup tìm khi gõ (AC1) thuộc ES1-T261, không ở đây.

Mục tiêu: người mua giữ và sửa được từ khoá, thấy kết quả chia theo sản phẩm / bài viết / trang, lọc và sắp xếp sản phẩm như collection, và khi không có kết quả vẫn có đường đi tiếp.

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T256/search.html` (nhúng `../_kit/kit.css` vòng 3, CSS riêng nội tuyến) + `search-360|768|1280|1920.png`. Trang chính q=`adjustable` ở đầu; trạng thái S1–S8 sau footer.

Thứ tự nguồn: sổ quyết định CTO > ticket (ES1-T256, ES1-T127 CTO chốt 06/11) > AGENTS.md > DESIGN.md > Figma trang chủ 1:359 > foundation (ES1-T251 vòng 3) > bộ kiến thức. Figma không có trang search: mọi thứ dưới đây là ĐỀ XUẤT phát triển từ ngôn ngữ Figma trang chủ, trừ khi ghi nguồn chốt. Không dùng trang live hay ảnh chụp store làm gốc (sổ 10/11).

## Thay đổi so với vòng 2

| # | Phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header | biến thể A nền trắng viền dưới | thanh tối `--color-background-dark` + noise, cao 80, logo 100 × 30, menu trắng 60%, icon search 20 / account, cart 24; không biến thể | Sổ 10/11, Figma 1:362, foundation §3 |
| 2 | Đầu trang | h1 → form → status → hàng link loại kết quả bên dưới | từ 80rem: [h1 → form → status] trái, link loại kết quả phải, căn đáy (như tiêu đề + tab của Figma 1:490); dưới 80rem giữ xếp dọc | Figma 1:490 (Title space-between, Tabs 40) |
| 3 | Đầu nhóm Products | h2 rồi toolbar hàng riêng | từ 48rem: h2 trái, toolbar (Filter + Sort) phải cùng hàng, căn đáy; tiêu đề → lưới `--heading-gap` 24 / 40 | Figma 1:490 (itemSpacing 40) |
| 4 | Swatch card | radio bấm được, `aria-checked` | chỉ báo 32 × 16 cách 4, `aria-hidden`; số màu đọc trong tên link (", 3 colors") | foundation §9 vòng 3, Figma 1:502 |
| 5 | Phân trang | Previous/Next pill có chữ, trang hiện tại nền đen | Previous/Next = nút tròn 52 chevron (trắng viền border, rê chuột cam); trang hiện tại nền accent; < 48rem "Page X of Y" giữa 2 nút | Ticket vòng 3, sổ 09/11 nút tròn 52, Figma 1:398; ES1-T107 #6; collection §8 |
| 6 | Chip lọc đang áp | nền alt viền border | viền foreground, nền trắng, tên nhóm muted ("Color:"), hover đảo đen; chip gợi ý (S1, S2) giữ nền alt viền border | collection ES1-T254 §7 (dùng chung) |
| 7 | Nút Filter | badge số 20 nền đen | badge tròn 24 nền accent chữ 13/700 (5.01) | collection §6 |
| 8 | Sort | nhãn "Sort by" ngoài ô, ẩn < 48rem | nhãn 12/500 muted nằm trong ô phía trên giá trị, mọi mốc; select 240 từ 48rem | collection §6 (04 §5 label nổi) |
| 9 | Drawer lọc | accordion Figma 1:1057 (+ cam trái), "From/To", tiêu đề "Filter" | snippet `filter-group` của collection: summary 52, chevron phải, "N selected"; giá trị 0 muted + gạch ngang; "Min price/Max price"; tiêu đề "Filters"; chân "Clear all" + "Show N products"; dòng "1 filter applied · 3 products" | collection §5.2–5.3 (dùng chung snippet) |
| 10 | Footer | footer vòng 2 (panel trong container, 3 social) | footer vòng 3: ảnh newsletter, panel dải rộng bo 16, 4 social, wordmark giữa hàng cuối | Figma 1:1104, foundation §4 |
| 11 | Icon mũi tên | 20 × 16 nét | mũi tên đặc 16 × 14 như Figma 1:462; thẻ danh mục hover mũi tên cam + dịch 4px | foundation §6 Link CTA |
| 12 | Ảnh dòng kết quả | nền alt | nền cream (như media card Figma 1:502) | Figma 1:502 |
| 13 | SEO /search | câu hỏi CTO 3 | đã chốt: /search không tính SEO 100 (sổ 10/11); bỏ câu hỏi | Sổ 10/11 |

Giữ nguyên: nội dung, dữ liệu, 8 trạng thái S1–S8, lưới 2/3/4, Articles/Pages dạng danh sách (ES1-T127), panel S2, filter-note.

## 1. Quyết định đã chốt áp dụng

| Nguồn | Nội dung | Áp vào |
| --- | --- | --- |
| ES1-T127 #4 (CTO 06/11) | h1, form search, toolbar và lưới như collection; product card 2 / 3 / 4 cột (< 48rem / 48rem / 80rem); article, page dạng danh sách: tiêu đề + trích đoạn, article có ảnh nhỏ | §3, §5 |
| ES1-T127 #5 | 0 kết quả: thông báo + link về tất cả sản phẩm | S2 (giữ, thêm gợi ý theo ticket ES1-T256 "không kết quả (gợi ý)") |
| Sổ 10/11 header | mọi trang con: thanh tối riêng như Figma 1:362, không đè ảnh | foundation §3 |
| Sổ 10/11 SEO | /search không tính SEO 100; vẫn đo A11y, BP, Performance | §9 |
| Sổ 09/11 nút tròn 52 | trắng viền #E5E5E5, rê chuột cam | phân trang §3.9 |
| Sổ 09/11 viền ô nhập | `--color-muted-light` (5.33:1) | ô search, sort, ô giá |
| Sổ 09/11 Lighthouse | A11y/BP 100, Perf ≥ 98 / ≥ 90 | §9 |
| Sổ 09/11 eyebrow | cam accent trên nền sáng | "Need inspiration" S2 |
| Sổ 07/11 | giao diện theo Figma, dữ liệu động; card label theo Figma 1:502 | card dùng nguyên `product-card` |
| ES1-T107 #6 (CTO chấp nhận) | trang hiện tại phân trang nền accent | §3.9 |
| AGENTS empty state | search không kết quả là nội dung, hiện cho người mua | S2 |

## 2. Anatomy

Trang có từ khoá, có kết quả (mockup đầu file):
1. Header tối (foundation §3).
2. Breadcrumb: Home / Search (foundation §5).
3. `search-top`: `search-head` (h1 "Search Results" → form (ô search + nút xoá + nút Search) → dòng trạng thái "7 results for “adjustable”" `role="status"`) + `type-nav` 4 link All · Products · Articles · Pages (ĐỀ XUẤT, câu CTO 1); từ 80rem type-nav nằm phải.
4. Nhóm Products: đầu nhóm [h2 "Products" + số | toolbar (nút Filter, Sort by)] · chip bộ lọc đang áp · lưới `product-card`.
5. Nhóm Articles, nhóm Pages: h2 + số · danh sách dòng kết quả. ≥ 64rem hai nhóm đặt cạnh nhau.
6. Phân trang (khi > 1 trang).
7. Footer (foundation §4, Figma 1:1104).

Overlay: drawer Filter (S4).

## 3. Thành phần

### 3.1 Form tìm kiếm
- `<form action="{{ routes.search_url }}" method="get" role="search">`. Ô `type="search" name="q"`, giữ `search.terms` (11 §4 #346). Đổi từ khoá thì bỏ filter, sort (không gửi lại `filter.*`, `sort_by`; 11 §4 #350).
- Kích thước: cao `--control-height` (48 / 52 từ 80rem), max-width 720 (45rem), thẳng mép trái container như h1 (sổ 09/11 hero thẳng mép trái, cùng ngôn ngữ).
- Icon kính lúp 20 trong ô, inline-start 16, màu `--color-muted` (trang trí, `aria-hidden`). 04: search có kính lúp + placeholder cụ thể.
- Placeholder ĐỀ XUẤT "Search benches, dumbbells…" (11 §1: placeholder nêu loại hàng; thay `search.placeholder` hiện tại "Search articles, pages, or products"). Tối đa 24 ký tự để không cắt ở 360. Màu `--color-muted-light` 5.33:1.
- Nút xoá × 44 × 44 ở inline-end, chỉ hiện khi ô có chữ (`:placeholder-shown` ẩn), `aria-label="Clear search term"`, xoá xong focus về ô. Ẩn nút cancel mặc định của WebKit.
- Nút submit: `.button` primary. < 48rem: vuông 48 chỉ icon, chữ "Search" ẩn cho trình đọc (để ô đủ rộng cho placeholder); ≥ 48rem: chữ "Search" + padding 24.
- Label: `<label class="visually-hidden">Search products, articles, and pages</label>` (h1 ngay trên là nhãn nhìn thấy). Không `autofocus` (tránh nhảy bàn phím mobile, 06).
- Predictive search (ES1-T261) gắn vào ô này được; không vẽ ở đây.

### 3.2 Dòng trạng thái
- 16/1.5, từ khoá in đậm 600 trong ngoặc kép. Có kết quả: `search.results_for_html` ("{{ count }} results for {{ terms }}"; ĐỀ XUẤT bỏ chữ "found"). 0 kết quả: "No results for “{{ terms }}”". `min-height: 24` để không xô khi đổi chữ.
- `role="status"`: BE cập nhật sau mỗi lần lọc / sắp xếp (05 §6: có phản hồi sau filter/search).

### 3.3 Link loại kết quả (ĐỀ XUẤT, nguồn 11 §4 #393 audit "sắp xếp theo Product / Page / Blog như Prestige"; 04 §4 tab ≤ 5, nhãn 1–2 từ)
- `<nav aria-label="Result type"><ul>` 4 link: All (không `type`), Products (`type=product`), Articles (`type=article`), Pages (`type=page`), giữ `q`. Link thật, chạy không JS (AC3), không phải `role="tablist"` vì mỗi link tải trang khác.
- Style tab Figma 1:490 / foundation §7: cao 44 (40 từ 80rem), gap 8, nền `--color-background-alt`, viền `--color-border`, chữ 16/500, bo `--radius-button`; đang chọn `aria-current="page"` nền foreground chữ background (17.4:1). Padding 12 < 48rem (4 link vừa 320px), 28 từ 48rem.
- Vị trí: < 80rem dưới dòng trạng thái, cách 16; từ 80rem cột phải của `search-top` (`grid-template-columns: 1fr auto`, `align-items: end`, gap 32), như Title + Tabs space-between của Figma 1:490. Thứ tự DOM giữ nguyên (sau form).
- Không hiện số theo loại: Liquid chỉ có `search.results_count` của loại đang xem. Loại không có kết quả vẫn hiện link; vào thì thấy S2 rút gọn (chỉ thông báo + "View all results").
- Ẩn cả nav khi setting "Show article and page results" tắt.

### 3.4 Nhóm kết quả
- Mỗi nhóm `<section aria-labelledby>`; h2 heading font 28 / 32 / 36 + số kết quả nhóm trên trang hiện tại (16/500 `--color-muted`, cùng dòng baseline).
- Đầu nhóm Products (Figma 1:490): < 48rem h2 rồi toolbar, cách 16; từ 48rem `grid 1fr auto`, h2 trái, toolbar phải, căn đáy, gap 24. Đầu nhóm → nội dung 24, 40 từ 80rem (`--heading-gap`, Figma itemSpacing 40).
- Cách: đầu trang → nhóm đầu 32 (40 từ 64rem); Products → Articles/Pages 32 (40 từ 64rem).
- Thứ tự trong view All: Products → Articles → Pages (ES1-T127; sản phẩm là mục tiêu chính của e-commerce, 11 §4). Trong một trang phân trang, `search.results` (trộn loại, theo relevance) được chia nhóm bằng `result.object_type`; mỗi trang 24 kết quả (setting).
- View Products: chỉ nhóm Products. View Articles / Pages: chỉ danh sách tương ứng, không toolbar.

### 3.5 Toolbar sản phẩm
Dùng chung thành phần với collection (ES1-T254 §6), khác: search giữ nút Filter mọi mốc (không có cột lọc, câu CTO 2).
- < 48rem: 2 cột bằng nhau, gap 12: nút Filter (secondary, icon 20 + "Filter" + badge) | Sort. Cao 48.
- ≥ 48rem: [Filter auto, padding 24] [Sort 240], gap 12, nằm phải đầu nhóm. Cao 48 / 52.
- Badge số bộ lọc: tròn 24, nền accent, chữ 13/700 accent-foreground (5.01:1), chữ ẩn " filter applied"; hover nút (đảo đen) badge nền trắng chữ foreground (08 §6 #488D).
- Sort: nhãn thật "Sort by" 12/500 `--color-muted` (8.45) nằm trong ô phía trên giá trị (label nổi, 04 §5), giá trị 16/500, viền `--color-muted-light`, chevron phải, chữ dài cắt "…".
- Sort: `<select name="sort_by">` từ `search.sort_options` (Shopify search chỉ có Relevance, Price low → high, Price high → low). Không đủ 4 lựa chọn của 08 §8 #511D do Shopify; không thêm giả. Đổi giá trị: có JS refresh partial, không JS submit form (nút "Apply" ẩn khi có JS, AC3). Select native = bottom sheet hệ điều hành trên mobile (08 §7: sort dạng popup).
- Chip bộ lọc đang áp (08 §6 #488D; collection §7): `<ul aria-label="Active filters">` dưới đầu nhóm, cách 16 / lưới 24. Chip cao 44 (40 từ 80rem), padding 16 / 12, bo pill, nền trắng, viền 1px foreground, chữ 14/500: tên nhóm muted "Color:" + giá trị foreground, × 14; hover nền foreground chữ trắng (17.4). Là link `value.url_to_remove`, `aria-label="Remove filter Color: Black"`. Cuối hàng "Clear all" (text-link, URL `?q=…` không filter, giữ `sort_by`). Xuống dòng, không cuộn ngang.
- Chip gợi ý (S1, S2 "Popular searches") khác vai trò nên khác dáng: nền alt, viền border (foreground trên alt 15.8), hover đảo đen.
- Khi có filter: thêm dòng `filter-note` (icon i 16 + 14 muted) "Filters apply to products only. Clear them to see articles and pages." vì Shopify trả về chỉ sản phẩm khi có filter (BE xác nhận khi dựng).

### 3.6 Drawer Filter (S4)
- Mọi mốc là drawer trái (foundation §15: 90% / 420 / 420), giữ lưới 4 cột ở desktop như ES1-T127. Xem câu CTO 2.
- Header 72: h2 "Filters" + đóng tròn 48 ("Close filters"). Dòng đầu body "1 filter applied · 3 products" 14 muted `role="status"`.
- Nhóm = snippet `filter-group` của collection (ES1-T254 §5.2): `<details open>`, summary 52, 16/600, chevron 12 × 7 phải xoay 180°, "N selected" 14 muted khi có giá trị chọn; gạch 1px border giữa nhóm; mở sẵn, cho mở nhiều nhóm (15 §6). Không dùng accordion FAQ Figma 1:1057 (+ trái) vì filter phải chung snippet với collection. Thứ tự nhóm theo `search.filters` (08 #474D: merchant đặt Giá, Màu lên đầu).
- Giá trị: `<label>` cả hàng 44, checkbox 20 `accent-color` accent, nhãn 16, số 14 muted canh phải (08 #479D, #467D); chọn: nhãn 600; hover nhãn gạch chân. Màu: chấm 24 tròn trước nhãn, tên màu luôn hiện. Số 0: `disabled`, chữ `--color-muted` (8.45) + gạch ngang (không chỉ đổi màu). > 6 giá trị: 6 + "Show N more" (08 #470D).
- Price range: "Min price" / "Max price" 2 cột gap 12 mọi mốc, label 14/500, tiền tố "$" muted `aria-hidden`, `inputmode="decimal"`; gợi ý "Highest price is $379.99" 14 muted. Lỗi min > max: chuỗi `price_invalid` inline (foundation §12).
- Footer dính đáy (08 §7 Apply sticky): [Clear all secondary, auto] [Show N products primary, 1fr]. Có JS: chọn là lưới phía sau cập nhật ngay, N cập nhật, nút chỉ đóng drawer (08 #486D); không JS: `<form>` GET, nút là submit.
- Mở 250 / đóng 200 (foundation §19), `<dialog>` + `showModal()`, `aria-labelledby`, Escape, chạm scrim; đóng trả focus về nút Filter.

### 3.7 Lưới sản phẩm
- `snippets/product-card` không đổi (Figma 1:502, foundation §9 vòng 3). Cột 2 / 3 / 4, card 152 / 232 / 292 / 336, gap ngang 16 / 24, dọc 24 / 40 (`.product-grid`).
- Swatch: chỉ báo 32 × 16 cách 4, `aria-hidden`, không focus; tên link đọc thêm ", N colors" (foundation §9, câu CTO 2 của foundation).
- Lọc màu: ảnh card + swatch viền accent đúng màu đã lọc khi variant có ảnh riêng (08 #482D; edge case "Variant có ảnh riêng").
- Hết hàng, không ảnh, tên dài: như foundation §9.

### 3.8 Dòng kết quả article / page (ES1-T127 #4)
- `<ul class="result-list">` gạch đầu 1px border; mỗi `<li>` gạch đáy, padding 16, cao ≥ 104 (128 từ 48rem).
- Lưới `72 | 1fr` gap 16 (< 48rem), `96 | 1fr` gap 24 (≥ 48rem).
- Media: article có ảnh → `article.image` vuông, `object-fit: cover`, bo 12, `alt=""` (tên đã ở link), lazy. Article không ảnh và page → ô nền cream (như media card Figma 1:502) + icon tài liệu 28 `--color-muted`.
- Meta 13/600 uppercase tracking 0.04em `--color-muted` (8.45:1): "Article · Nov 4, 2026" (`<time>`), "Page".
- Tiêu đề h3 Inter 16 → 18 từ 48rem, 600, là link; `::after` phủ cả dòng (1 link mỗi dòng, foundation §9).
- Trích đoạn 14 muted, tối đa 2 dòng: `item.excerpt_or_content | strip_html | truncatewords: 30` (article), `page.content | strip_html | truncatewords: 30`. Rỗng thì ẩn. ĐỀ XUẤT tô đậm từ khoá bằng filter `highlight: search.terms` (`<strong>` 600, không đổi màu).
- Hover: tiêu đề gạch chân, ảnh scale 1.05 (500ms). Focus: outline 2px accent quanh cả dòng (`:focus-within`).

### 3.9 Phân trang (S7)
- `paginate search.results by 24` (setting). Dưới nhóm cuối, cách 48 (64 từ 64rem), căn giữa.
- `<nav aria-label="Pagination">`: [‹] [1] [2] … [›], gap 8.
- Previous / Next: nút tròn 52 chevron 11 × 16 (kit `.round-button`, icon `snippets/slideshow-icon` previous/next, Figma 1:398; sổ 09/11): nền trắng viền `--color-border`, hover nền accent icon trắng scale 1.06, active 0.94, focus outline accent offset 3. `aria-label="Previous page"` / `"Next page"`. Ở đầu/cuối: hiện, `aria-disabled="true"` opacity 0.35, không phải link (giữ chỗ, không nhảy bố cục).
- Số trang: pill 44, viền border, 14/500; hover viền foreground; trang hiện tại nền accent chữ trắng 700 (5.01, ES1-T107 #6), `aria-current="page"`, không phải link. Dấu … muted khi > 5 trang (`paginate.parts`).
- < 48rem: [‹] "Page 2 of 2" (14/500) [›] trải hết hàng; ẩn số trang (9 nút × 44 không vừa 320; 08 #504D; như collection §8).
- Dưới hàng: "Showing 25–37 of 37 results" 14 muted (08 #531D).
- Link thật có `href` (SEO crawl, chạy không JS). Không infinite scroll (08 #2167D); "Load more" không làm ở ticket này (giữ đồng bộ collection).

## 4. Settings merchant (block `search-results` khi tách khỏi template)

| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Results per page | range | 24 | 12–48, step 4 (Shopify paginate ≤ 50) |
| Columns on desktop | select | 4 | 3, 4 (ES1-T127 chốt 4) |
| Show filters | checkbox | true | ẩn nút Filter, chip, drawer |
| Show sorting | checkbox | true | |
| Show article and page results | checkbox | true | tắt: form gửi `type=product`, ẩn type-nav và 2 nhóm |
| Popular searches | text | Dumbbell, Bench, Kettlebell, Resistance band, Training mat | tách bằng dấu phẩy, tối đa 6; dùng ở S1, S2 |
| Suggested collections | collection_list | trống | tối đa 6; trống thì ẩn khối "Shop by category" |
| Products when no results | collection | trống | trống thì dùng `collections.all`; hiện 4 |

Label sentence case, không `&`, qua `t:` trong `locales/en.default.schema.json`. Popular searches mặc định lấy từ tên sản phẩm demo (Iron Core Kettlebell, Adjustable dumbbell pair, FlexFold Bench, Resistance Band Set, Training Mat).

## 5. Layout theo mốc

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Header | tối 80, menu 44 + logo 100 × 30 + 3 icon | như 360 | logo · 7 mục gap 40 · 3 icon | như 1280, logo x 252 |
| Nội dung | 320 | 728 | 1240 | 1416 (lề 252) |
| Header → breadcrumb | 16 | 16 | 24 | 24 |
| Breadcrumb → h1 | 8 | 8 | 12 | 12 |
| h1 | 33 | 43 | 48 | 48 |
| h1 → form → status | 16 | 16 | 24 | 24 |
| Form | 320 (ô + nút 48 icon) | 720 max | 720 max | 720 max |
| type-nav | dưới status, 4 link padding 12, cao 44 | dưới status, padding 28, cao 44 | phải, căn đáy với status, cao 40 | như 1280 |
| Đầu nhóm Products | h2 / toolbar xếp dọc | h2 trái · toolbar phải | như 768, cách lưới 40 | như 1280 |
| Toolbar | Filter 154 + Sort 154 | Filter auto + Sort 240 | như 768, cao 52 | như 1280 |
| Lưới | 2 × 152 | 3 × 232 | 4 × 292 | 4 × 336 (= Figma 1:502) |
| Articles / Pages | xếp dọc | xếp dọc | 2 cột cạnh nhau, gap 32 | như 1280 |
| Dòng kết quả | ảnh 72, tiêu đề 16 | ảnh 96, tiêu đề 18 | như 768 | như 768 |
| Phân trang | [‹ 52] Page X of Y [› 52] | [‹] số 44 [›] giữa | như 768 | như 768 |
| Drawer Filter | 90% (324) | 420 | 420 | 420 |
| S2 panel | xếp dọc, padding 24/16 | xếp dọc, padding 32 | 2 cột 5 : 7, padding 48 | như 1280 |
| Popular products | 2 × 2 | 3 (ẩn sp thứ 4) | 4 | 4 |
| Footer | foundation §4 | | | panel lùi 60, bo 16 |

Cuối `<main>`: khoảng `--section-gap` (48 / 120) trước footer.

## 6. Trạng thái

| Mã | Khi | Thiết kế | Nguồn |
| --- | --- | --- | --- |
| S1 | `search.performed` false (không `q`) | h1 "Search", form trống, "Popular searches" (chip link `?q=`), "Shop by category" (thẻ link: tên 16/600 + "N products" 14 muted + mũi tên; 1 / 2 / 3 cột). Không toolbar, không lưới | ĐỀ XUẤT 11 §4 option 2, 05 §7 |
| S2 | 0 kết quả | Giữ từ khoá trong ô; status "No results for “treadmill”"; panel nền alt bo 24: icon 72 + h2 "Nothing Matches “treadmill” Yet" + mẹo 1 câu (không đổ lỗi, 11 §5) + primary "Shop All Products" (ES1-T127 #5) + text-link "Read the FAQs" (trang FAQs nếu có); cạnh bên: popular searches + 3 collection; dưới: tiêu đề kiểu Figma 1:490 (eyebrow cam "Need inspiration" + heading "Popular Products") + 4 card (lazy). Chip và thẻ trong panel nền trắng | ES1-T127 #5, 11 §5, foundation §18, Figma 1:490 |
| S3 | Có filter | Badge số trên nút Filter, chip + Clear all, filter-note, lưới đã lọc | 08 §6, collection §7 |
| S4 | Mở Filter | §3.6 | 08 §7, foundation §15 |
| S5 | Đang refresh (JS) | Lưới `aria-busy="true"` + skeleton foundation §18 đúng ô card; spinner 16 + "Updating results…" `role="status"` dưới toolbar; toolbar vẫn dùng được | foundation §18, 05 §6 |
| S6a | Filter ra 0 sản phẩm | Giữ chip; khối viền border bo 12: h3 "No Products Match These Filters" + "Remove a filter or clear them all to see the 5 products for “adjustable”." + secondary "Clear All Filters" | 05 §7 |
| S6b | Refresh lỗi | Alert foundation §18 "We couldn't update the results" + "Check your connection, then try again. Your filters are saved." + "Try Again"; lưới cũ giữ nguyên | foundation §18 |
| S7 | > 1 trang | §3.9 | 08 #504D |
| S8 | Hover / focus | type link hover viền foreground; chip lọc và chip gợi ý hover đảo đen; số trang hover viền foreground; nút tròn hover cam, focus offset 3; thẻ danh mục hover viền foreground + mũi tên cam dịch 4; focus outline 2px accent offset 2 cho mọi link, nút, ô (header, footer tối: outline trắng); dòng kết quả outline cả dòng | foundation §3, §6, §19 |

Không JS (AC3): form search, type link, chip (link), sort + nút Apply, drawer thay bằng `<details>` mở trong trang (hoặc form GET trong drawer `<dialog>` fallback), phân trang đều là GET; S5, S6b không xảy ra.

Không có trong Shopify native: "Did you mean" / tự sửa chính tả (11 §4 #355, #358). Không thiết kế giả; popular searches thay thế (11 §4 option 2). App search bên thứ ba có thể thêm sau.

## 7. Accessibility

- Một h1; h2 cho nhóm (Products, Articles, Pages, gợi ý S1/S2, Popular Products); h3 cho tiêu đề card / dòng. Trong mockup, trạng thái dùng h3/h4 vì nằm dưới h2 của bảng trạng thái.
- Landmark: `<nav>` breadcrumb, type-nav (`aria-label="Result type"`), pagination (`aria-label="Pagination"`); form `role="search"`.
- Tên: ô search (label ẩn), nút xoá ("Clear search term"), nút submit icon ("Search" ẩn), nút Filter + badge ("Filter, 1 filter applied"), Sort (label "Sort by" thật), chip ("Remove filter Color: Black"), Previous/Next tròn ("Previous page", "Next page"), số trang ("Page 1"), đóng drawer ("Close filters"), link card có số màu (", 3 colors"). Next/Previous tắt: `role="link" aria-disabled="true"` + `aria-label`, không `href`.
- Live: dòng status, "Updating results…", dòng đầu drawer là `role="status"`; lỗi là `role="alert"`. Sau refresh không dời focus; sau "Clear all" focus về nút Filter.
- Vùng chạm: mọi link/nút ≥ 44 (pill 40 từ 80rem vẫn ≥ 24), nút chính 48 / 52, nút tròn 52, checkbox hàng 44, icon header 44. Swatch card là chỉ báo `aria-hidden`, không phải control (foundation §9), nên không có đích 16px.
- Tương phản (foundation §2, tính tay): chữ chính 17.4; muted trên trắng 8.45 (số nhóm, meta, trích đoạn, gợi ý giá, nhãn Sort, giá trị filter tắt); muted trên alt (#4D4D4D / #F4F4F4) = (0.905 + 0.05) / (0.0743 + 0.05) = 7.68 (chữ panel S2); placeholder + viền input muted-light 5.33; tab, chip gợi ý foreground trên alt 15.8; tab chọn, chip hover 17.4; badge Filter, trang hiện tại, nút primary, nút tròn hover 5.01; menu header trắng 60% trên dark 6.93; footer muted-on-dark 6.11 / panel 5.78; eyebrow cam trên trắng 5.01; icon kính lúp muted 8.45 (≥ 3 phi văn bản).
- Không chỉ dùng màu: tab chọn có nền đảo + `aria-current`; trang hiện tại nền accent + đậm + `aria-current`; giá sale có chữ ẩn "Sale price"; giá trị filter tắt có `disabled` + gạch ngang + số 0.
- Bàn phím: Tab qua form → type-nav → Filter → Sort → chip → card; drawer bẫy focus bằng `<dialog>`; Escape đóng.
- Reduced motion: tắt scale ảnh, nhấc card, drawer trượt (kit).

## 8. Token dùng

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-background-cream`, `--color-accent(-foreground)`, `--color-sale(-foreground)`, `--color-badge-new(-foreground)`, `--color-background-dark(-foreground)`, `--color-muted-on-dark` (footer).
Chữ: `--font-heading--family/weight`, `--font-primary--family`, `--font-size-xs/sm/base/lg/h3/h2/h1`, `--line-height-body/heading`.
Khoảng cách: `--space-1..8`, `--page-margin`, `--page-width`, `--header-height`. Dẫn xuất kit: `--control-height`, `--grid-gap`, `--heading-gap`, `--section-gap`, `--band-side/inset` (footer), `--dark-texture` (`assets/noise-dark.png`, header + footer), `--overlay-scrim`, `--shadow-overlay`, `--radius-dialog`.
Bo: `--radius-input`, `--radius-button`, `--radius-card`, `--radius-pill`. Motion: `--motion-fast/base/slow/accordion`, `--ease-out`.
Không token mới, không màu literal.

## 9. Lighthouse

- LCP: < 48rem và ≥ 48rem đều là ảnh card sản phẩm đầu tiên (ở 360 card 1 nằm y ≈ 520, trong màn đầu 640) hoặc h1 nếu ảnh nhỏ hơn. Chỉ ảnh card 1 `loading="eager"` + `fetchpriority="high"`, `sizes` theo cột (50vw / 33vw / 25vw, tối đa 336px). Không kết quả (S2) và chưa có từ khoá (S1): LCP là chữ (h1 / h2), mọi ảnh lazy.
- Lazy: card 2 trở đi, ảnh article, 4 card Popular Products, ảnh newsletter footer. Mọi `<img>` có width/height qua `snippets/image` (0 CLS). Noise header/footer là `background-image` 1 file nhỏ đã có, không chặn LCP (foundation §3.4).
- Font: Sofia Sans Condensed 700 (h1, h2) và 800 (eyebrow, footer), Inter 400/500/600/700; 2 họ, preload 1 (ADR 0003), `font-display: swap`.
- CLS: header sticky bằng CSS, cao 80 cố định; dòng status cao cố định 24; skeleton cùng ô card; chip render từ server (không chèn bằng JS sau tải); nút Previous/Next tắt vẫn giữ chỗ 52; drawer `position: fixed`.
- JS: trang chạy không JS; JS BE cho drawer + refresh partial ≤ 8 KB.
- A11y rủi ro đã tránh: label ô search, nút icon có tên, `aria-current` cho type link và trang, heading không nhảy bậc, chip tên riêng, vùng chạm 44.
- A11y rủi ro còn lại (dữ liệu, không phải thiết kế): tên sản phẩm trùng trên store dev (2 "FlexFold Adjustable Bench", 2 "Ativafit Lava 66 lb Adjustable") cho link cùng chữ khác URL; axe `identical-links-same-purpose` (best-practice, Lighthouse không tính điểm) có thể cảnh báo. Đã đề xuất đổi tên ở ES1-T266.
- SEO: `<title>` "Search results for “{{ terms }}” – {{ shop.name }}", meta description từ `meta-tags`; chữ link mô tả đích ("Shop All Products", "Read the FAQs", tên collection); ảnh có alt; chữ nhỏ nhất 12 (nhãn Sort). /search không tính SEO 100 (sổ 10/11, Shopify `robots.txt` chặn /search); vẫn giữ các điểm trên để không lỗi khi đo thử. Không sửa `robots.txt.liquid`.
- Best Practices: ảnh `object-fit: contain` (card) / `cover` (dòng) không méo, srcset đủ 2x; không chặn dán vào ô; 0 lỗi console (mockup render 0 lỗi ở 4 mốc).

## 10. Map sang code và hook cho BE

| Phần | Hiện có | Cần |
| --- | --- | --- |
| Template | `templates/search.liquid` (h1, form, list trộn, `paginate 20`, `default_pagination`) | FE: tách block `search-results` (đầu trang, type-nav, nhóm, phân trang) + gọi `product-card`; paginate 24 |
| Card | `snippets/product-card`, `snippets/price` | dùng lại |
| Header | `blocks/header.liquid`, nền tối hiện chỉ khi có `.slideshow` | việc của ticket foundation/header: bỏ điều kiện để mọi trang tối (foundation §21) |
| Filter / sort / chip / phân trang | collection: `snippets/filter-group`, `snippets/pagination` (ES1-T109 / ES1-T254) | dùng chung; nguồn `search.filters`, `search.sort_options`, `search.sort_by`; Previous/Next dùng `snippets/slideshow-icon` + class nút tròn 52 (`.carousel-nav__button`) |
| Drawer, alert, skeleton, breadcrumb | kit / foundation §15, §18, §5 | dùng lại |
| Dòng kết quả, type-nav, panel S2 | chưa có | FE tạo mới theo §3 |

`data-testid`: `search-head`, `search-form`, `search-status`, `search-type-nav`, `search-products`, `search-filter-toggle`, `search-sort`, `search-active-filters`, `search-product-grid`, `search-articles`, `search-pages`, `search-pagination`, `search-empty`, `search-error`, `filter-drawer`.
Partial (BE): `search-products` (toolbar + chip + lưới + phân trang + status), `search-filters` (thân drawer). Sau refresh dispatch sự kiện theo AGENTS (search change) và `history.replaceState` URL.

Chuỗi mới (`locales/en.default.json`, nhóm `search`): `results_title` "Search Results", `placeholder` (đổi), `clear` "Clear search term", `type_nav_label`, `type_all/products/articles/pages`, `filter`, `filters_applied` (one/other), `sort_by`, `remove_filter`, `clear_all`, `filter_note`, `no_results_title`, `no_results_text`, `shop_all`, `popular_searches`, `shop_by_category`, `popular_products`, `filtered_empty_title/text`, `clear_all_filters`, `updating`, `update_error_title/text`, `try_again`, `pagination_label/previous/next/page/summary`, `article_label`, `page_label`, `show_results` (one/other).

## 11. Dữ liệu mockup

- q=`adjustable`: 5 sản phẩm khớp tên trong demo-data (2 FlexFold Adjustable Bench, 2 Ativafit Lava 66 lb Adjustable, Adjustable dumbbell pair); % giảm tính từ compare_at (17%, 24%). Article "Set up a perfect home gym in just 15m²" và page FAQs là minh hoạ khớp qua body (KHÔNG CHẮC, ES1-T266); trích đoạn FAQs lấy từ locale `faq_item` của theme.
- S1, S2 collection: 5 collection `figma-cat-*` với `products_count` thật. Popular Products: Iron Core Kettlebell 16 kg (tag new), Revllen Pro Speed Rope (-22%), Olympic Plate Set 100 (-15%), Compact Power Rack.
- S3: 3 sản phẩm có màu Black. S4 số đếm Color tính từ options (Black 3, Gray 3, White 2); Availability 5/0 giả định (không có tồn kho). S6a: White + $0–$100 ra 0 thật (2 sản phẩm White đều > $100). S7: q=`efitco` theo vendor (22 + 14 + page Our Efitco = 37), KHÔNG CHẮC cách Shopify tách từ "efitco-ai-dev".
- Tên trang Our Story, Our Efitco, FAQs, Contact Us: Figma 1:1104 menu Information.

## 12. Quyết định CTO đã chốt (10/11)

CTO chốt cả các câu dưới đây theo đề xuất (docs/design/decisions.md, 10/11).
1. Thêm link All / Products / Articles / Pages (tham số `type`, link thật, kiểu tab Figma 1:490, nằm phải tiêu đề từ 1280)? Đề xuất: có, người tìm trang chính sách không phải cuộn qua 24 sản phẩm (11 §4 #393).
2. Search dùng drawer lọc ở mọi mốc (giữ 4 cột ES1-T127) dù collection có cột lọc trái từ 1024? Đề xuất: có, chung snippet `filter-group`, chỉ khác vỏ.
3. Previous/Next phân trang là nút tròn 52 chevron (như carousel Figma 1:398) cho cả search và collection (snippet `pagination` chung)? Đề xuất: có, một kiểu nút prev/next toàn theme.
