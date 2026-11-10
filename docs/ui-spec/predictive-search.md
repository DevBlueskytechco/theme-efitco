KHÔNG CHẮC: (1) demo-data không có từ khoá gợi ý (`queries` của predictive search), từ khoá phổ biến, pages, excerpt bài viết; gợi ý từ khoá trong mockup suy từ tên sản phẩm/collection thật, pages bỏ trống (đã hỏi BA ở ES1-T266, bổ sung comment). (2) Ảnh sản phẩm store dev lệch tên (ES1-T245): "FlexFold Adjustable Bench" ra dây thừng, "Training mat" ra dây nhảy; mockup giữ đúng URL. (3) Search page spec ES1-T256 nằm trên nhánh khác, không đọc được; phần nối sang trang /search chỉ theo SRS TE-8 AC2.

# UI spec: Search overlay (ES1-T261)

Mục đích: người mua gõ 2 ký tự là thấy gợi ý từ khoá, sản phẩm (ảnh, tên, giá), collection, bài viết, trang; chuyển nhóm bằng tab; 0 kết quả vẫn có đường đi tiếp; Enter hoặc nút chân mở trang kết quả. Story TE-8 AC1, AC3 (docs/srs.md#TE-8). Quyết định CTO 09/11: search popup (khi gõ, không có sản phẩm, tab canvas) + search tab, đủ 360 / 768 / 1280 / 1920.

Figma: không có. Header 1:362 chỉ có icon search (figma-inventory hàng 1, "search mở" là trạng thái chưa vẽ). Mọi thứ dưới đây là `ĐỀ XUẤT:` theo ngôn ngữ trang chủ 1:359 + foundation (docs/ui-spec/foundation.md), trừ chỗ ghi "code hiện có".

Đầu ra:
- Spec này.
- Mockup `drafts/designer/ES1-T261/predictive-search.html` (nhúng `../_kit/kit.css`), PNG `predictive-search-360|768|1280|1920.png`. Mỗi khung là một màn hình thiết bị ở mốc đang xem. Khung: 1 popup khi gõ (tab All), 2 search tab (tab Products), 3 không có sản phẩm, 4 tab canvas (drawer), 5 rỗng (< 2 ký tự), 6 đang tải, 7 lỗi, 8 ca biên.

Code hiện có: `snippets/predictive-search.liquid` (dialog sau link `header-search-link`, form GET, combobox + listbox, nhóm products/collections/pages/articles, `<template>` product/link), `assets/base.css` `.predictive-search*` (mobile full màn, ≥ 48rem dải trên cùng rộng `--page-width`, cao tối đa 80dvh). `assets/predictive-search.js`, `assets/search-loader.js` chưa có trên nhánh này (BE). Spec giữ mọi `data-testid`, hook `data-predictive-*` trong `{% doc %}` của snippet; chỗ đổi ghi ở §11.

---

## 1. Kiểu hiển thị (setting Search style)

| Kiểu | 360 | 768 | 1280 / 1920 | Nguồn |
| --- | --- | --- | --- | --- |
| Popup (mặc định) | toàn màn, trượt từ trên | dải từ trên, rộng 100%, cao ≤ 80% viewport, bo 2 góc dưới `--radius-card` | như 768; hàng đầu cao 80 thay chỗ header (logo · ô tìm · nút đóng) | code hiện có; SRS TE-8 AC1 "mobile full màn"; ticket "trượt từ trên" |
| Drawer ("tab canvas") | cạnh phải, rộng 90% | 420 | 480 | ĐỀ XUẤT: 15 §2 #4 (search drawer phải 90%), foundation §15 |

- Popup trên desktop thay chỗ header: logo, ô tìm, nút đóng cùng hàng cao `--header-height` (80) để mắt không phải tìm lại vị trí (06 §4). Ô tìm bắt đầu ở cột 4 của lưới 12, thẳng với cột nội dung chính bên dưới.
- Drawer có tiêu đề nhìn thấy "Search" (h2 heading 28, như `.overlay__title`) + nút đóng 48; popup có h2 "Search" ẩn (tên dialog) vì ô tìm đã là tiêu điểm. Cả hai là `<dialog>` có tên (sổ quyết định 09/11: popup là dialog có tiêu đề và nút đóng).
- Một nội dung, hai khung: cùng nhóm, thứ tự, tab, trạng thái; chỉ khác bố cục (§3). Chức năng giống nhau mở/đóng như nhau (06 §1, 15 §7).

## 2. Anatomy

1. Scrim: `--overlay-scrim` (dark 50%), chạm để đóng.
2. Hàng đầu (popup): logo (≥ 80rem, link về trang chủ) · form tìm · nút đóng. Drawer: hàng tiêu đề (h2 "Search" + nút đóng) rồi hàng form.
3. Form tìm (`role="search"`, GET `routes.search_url`): nút submit kính lúp 44 ở đầu ô · `<label>` ẩn "Search products, collections, pages, or articles" (code) · input `type=search`, combobox · nút xoá × 44 (chỉ khi có chữ) / spinner 20 (đang tải).
4. Hàng tab (≥ 2 ký tự và có kết quả): All · Products n · Collections n · Articles n · Pages n. Chỉ hiện tab có kết quả.
5. Thân (cuộn riêng): listbox gồm các nhóm theo thứ tự DOM Suggestions → Products → Collections → Articles → Pages.
   - Suggestions: tối đa 4 từ khoá, icon kính lúp 16, phần người mua đã gõ chữ thường 400, phần gợi ý thêm 600.
   - Products: tối đa 4 ở tab All; ảnh, tên (tối đa 2 dòng), giá (sale đỏ + giá gạch), "Sold out" bằng chữ.
   - Collections: icon lưới 16, tên, "N products" (14 muted) ở cuối hàng.
   - Articles: ảnh 64 × 48 bo 4, tiêu đề 2 dòng, ngày đăng 14 muted.
   - Pages: icon trang 16, tên.
6. Chân (dính đáy khung): dòng trạng thái `role="status"` (14 muted; ẩn mắt dưới 48rem và trong drawer, vẫn đọc) · nút primary "View all results for “q”" + mũi tên.
7. Khám phá (< 2 ký tự, hoặc 0 kết quả): Recent searches (chip + "Clear") · Popular searches (chip) · Popular collections (link + số sản phẩm) · Trending now (4 card).

## 3. Bố cục theo mốc

Token theo foundation §1. Khoảng cách viết bằng `--space-*`.

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Khung | toàn màn | dải trên, ≤ 80% cao | dải trên, ≤ 80% cao | như 1280, nội dung 1416 |
| Hàng đầu | ô tìm + đóng 48, padding 12 | như 360 | lưới 12: logo cột 1–3, ô cột 4–11, đóng cột 12; cao 80 | như 1280 |
| Ô tìm | cao 48, chữ 16 | cao 48, chữ 16 | cao 52, chữ 18 | như 1280 |
| Tab | cao 44, cuộn ngang, tab kế lộ ra | cao 44 | cao 40, bắt đầu cột 4 | như 1280 |
| Tab All | 1 cột: gợi ý → sản phẩm dạng hàng (ảnh 64) → collection → bài viết | lưới 8: trái 3 cột (gợi ý, collection, bài viết, trang), phải 5 cột sản phẩm dạng hàng | lưới 12: trái 3 cột, phải 9 cột 4 card (213 rộng) | 4 card 246 rộng |
| Tab Products | lưới 2 card | lưới 4 card | lưới 5 card | lưới 5 card |
| Tab Collections / Articles / Pages | danh sách 1 cột | danh sách 1 cột, rộng 100% | như 768 | như 768 |
| Khám phá | 1 cột: chip, collection, trending 2 cột | trái 3 / phải 5 cột, trending 2 cột | trái 3 / phải 9 cột, trending 4 cột | như 1280 |
| Chân | nút full width, cao 48 | trạng thái trái, nút phải | như 768, nút cao 52 | như 1280 |
| Drawer | 90%, 1 cột như 360, nút chân full width | 420 | 480 | 480 |

Khoảng cách: thân padding `--space-5` (24) / `--space-6` (32) từ 80rem; giữa các nhóm `--space-6`; tiêu đề nhóm → nội dung `--space-2`; hàng option cao 44; hàng sản phẩm cao 80; card gap `--space-5`; chân padding `--space-3`.

Thứ tự tab bàn phím và phím mũi tên theo DOM (gợi ý → sản phẩm → collection → bài viết); desktop nhìn theo hình chữ Z (trái trên → phải → trái dưới). Mobile thứ tự nhìn trùng DOM (06 §2).

Chiều cao khung popup ≤ 80% viewport (code): hàng đầu và chân cố định, chỉ thân cuộn (`overscroll-behavior: contain`). Nội dung dài hơn thì hàng cuối cắt ngang làm tín hiệu còn nữa (22 §9).

## 4. Hành vi

- Mở: click icon search header (link thật tới `routes.search_url`, không JS thì vào trang kết quả, TE-8 AC3). Focus vào ô tìm, giữ chữ đã gõ lần trước trong cùng trang.
- Gõ: < 2 ký tự hiện khám phá + câu nhắc; ≥ 2 ký tự chờ 300ms rồi gọi (TE-8 AC1). Huỷ request cũ bằng AbortController (AGENTS JavaScript).
- Một request cho mọi loại: `resources[type]=query,product,collection,article,page`, `resources[limit]=8`, `resources[limit_scope]=each`, `resources[options][unavailable_products]=last`. Tab All hiện 4 sản phẩm, 4 từ khoá, 3 mỗi nhóm khác; tab riêng hiện tới 8.
- Số trên tab = số gợi ý trả về, không phải tổng thật (predictive search không trả tổng). Đủ 8 thì ghi "8+". Xem câu CTO 2.
- Tab: click / Enter / Space chọn; ←/→ chuyển tab; tab chưa chọn vẫn đọc rõ (04 §4). Đổi tab không gọi lại server, chỉ lọc nhóm đã có. Tab chọn được nhớ khi gõ tiếp; tab đó về 0 thì quay về All.
- Phím trong ô: ↓/↑ đi qua option (vòng qua mọi nhóm), `aria-activedescendant`; Enter trên option mở link; Enter không chọn gì thì submit form (trang kết quả). Chọn từ khoá bằng phím thì chép từ khoá vào ô (11 §3 #369). Esc: đóng dialog, trả focus về icon search.
- Nút chân: tab All "View all results for “q”" (`routes.search_url?q=`); tab Products "View all products for “q”" (thêm `type=product`); 0 kết quả "Shop All Products" (`routes.all_products_collection_url`).
- Click từ khoá gợi ý / chip: điền vào ô và chạy gợi ý ngay (không rời trang); click sản phẩm / collection / bài viết / trang: đi tới URL.
- Recent searches: lưu 5 từ khoá gần nhất khi submit hoặc chọn gợi ý, trong `localStorage`; "Clear" xoá hết. Không JS thì không có khối này. ĐỀ XUẤT: 06 §5.3 (gợi ý lịch sử tìm kiếm).
- Khoá cuộn trang nền khi mở (`scroll-lock` đã có).

## 5. Settings merchant (ĐỀ XUẤT, header block)

| Tên | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- |
| Search style | select: Popup, Drawer | Popup | — | ticket (popup + tab canvas), 15 §2 |
| Popular searches | text | Adjustable bench, Kettlebell, Resistance band, Training mat, Power rack | tối đa 5 từ, phân cách dấu phẩy; rỗng thì ẩn khối | 11 §5 (gợi ý từ khoá phổ biến), 05 §4 (3–5 lựa chọn) |
| Popular collections | collection_list | rỗng (demo: Free Weights, Benches & Racks, Functional Training, Recovery & Mobility) | tối đa 4; rỗng thì ẩn khối | 11 §5 (link danh mục phổ biến) |
| Trending products | collection | rỗng (demo: All, `figma-tab-all`) | 4 sản phẩm đầu; rỗng thì ẩn khối | 11 §5, 07 (người dùng khám phá) |

Default "Popular searches" lấy từ tên sản phẩm thật trong demo-data. Không thêm setting màu, cỡ: đọc token có sẵn. Label sentence case, `t:` key trong `locales/en.default.schema.json`.

## 6. Trạng thái

| Trạng thái | Khi nào | Hiện gì | Khung mockup |
| --- | --- | --- | --- |
| Rỗng | vừa mở, ô trống | khám phá (§2.7), không tab, không chân | 5 (không câu nhắc) |
| Chưa đủ 2 ký tự | 1 ký tự | khám phá + câu nhắc "Type at least 2 characters to see suggestions." (icon i, 14 muted), `aria-describedby` từ input | 5 |
| Đang tải lần đầu | request > 200ms | spinner 20 thay nút xoá; skeleton đúng chỗ nội dung (dòng gợi ý; card 1:1 + 2 dòng ở desktop, hàng ảnh 64 ở dưới 80rem); thân `aria-busy="true"`; status ẩn "Loading suggestions…"; nút chân vẫn bấm được | 6 |
| Đang tải lần sau | gõ tiếp khi đã có kết quả | giữ kết quả cũ tới khi có mới, chỉ spinner trong ô; không làm mờ, không nhảy (11 §3 #404) | — |
| Có kết quả | ≥ 1 gợi ý | tab + nhóm + chân; status "4 products and 1 collection found" | 1, 2, 4 |
| Không có sản phẩm, có nội dung khác | products 0, articles/pages > 0 | tab Products ẩn; tab All: các nhóm có kết quả + dòng "No products match “q”." trên khối Trending now | — (ĐỀ XUẤT) |
| 0 kết quả | mọi nhóm 0 | ẩn tab; hộp báo (nền alt, icon kính lúp 24): "No results for “q”" 18/600 + "Check the spelling, or try a more general word such as “bench” or “band”." 14 muted; dưới là khám phá; nút chân "Shop All Products" | 3 |
| Lỗi | mạng lỗi, 5xx, quá 5s | hộp `.alert` (viền sale, icon ! sale): "Suggestions are unavailable right now" + "Check your connection and try again, or press Enter to see all results for “q”." + nút secondary "Try Again"; `role="alert"`; nút chân vẫn mở trang kết quả | 7 |
| Hover option | chuột | nền `--color-background-alt`, < 150ms | 1 (card 1) |
| Option đang chọn (phím) | `aria-selected="true"` | nền alt + viền trong 2px `--color-foreground`; card desktop: viền ngoài 2px offset 4 + gạch chân tên | 1 ("adjustable bench") |
| Focus ô tìm | `:focus-within` | viền + outline 2px `--color-accent` (foundation §12) | 5, 6 |
| Tab hover / chọn | | foundation §7 (viền foreground / nền foreground chữ trắng) | 2 |
| Chip hover | | viền foreground | 5 ("bench") |

Câu chữ không đổ lỗi cho người mua (11 §5). Không bịa "Did you mean": predictive search không trả sửa chính tả.

Ca biên (demo-data `edge_cases`, khung 8):
- Không ảnh ("Sản phẩm không có media"): placeholder icon ảnh `--color-muted-light` trên cream, không ảnh vỡ (DESIGN Images).
- Hết hàng ("Hết hàng toàn bộ"): xếp cuối (`unavailable_products=last`), ảnh opacity 0.6, chữ "· Sold out" 14 muted cạnh giá (không chỉ dùng màu, 01).
- Giá sale nhỏ ("Sale giá nhỏ" $0.99 / $1.99): giữ định dạng tiền `shop.money_format`.
- Tên dài: cắt 2 dòng "…".
- Từ khoá dài: chữ trong nút chân xuống 2 dòng, không tràn (khung 4 ở 360).
- Tên trùng ("FlexFold Adjustable Bench" ×2): dữ liệu thật, giữ; đã nêu ở ES1-T266.

## 7. Chữ (locale, ĐỀ XUẤT thêm vào `blocks.predictive_search`)

Đã có: `input_label`, `dialog_label`, `close`, `submit`, `group_products`, `group_collections`, `group_pages`, `group_articles`, `listbox_label`, `count`, `empty`, `all` ("View all results for {{ terms }}").

Thêm: `placeholder` "Search benches, kettlebells, mats…" (04 §3.7, 11 §1: placeholder cụ thể; label thật giữ `input_label`), `clear` "Clear search", `tabs_label` "Result types", `tab_all` "All", `group_queries` "Suggestions", `view_products` "View all products for {{ terms }}", `min_chars` "Type at least 2 characters to see suggestions.", `loading` "Loading suggestions…", `error_title` "Suggestions are unavailable right now", `error_body` "Check your connection and try again, or press Enter to see all results for {{ terms }}.", `retry` "Try Again", `no_results_title` "No results for {{ terms }}", `no_results_hint` "Check the spelling, or try a more general word such as “bench” or “band”.", `no_products` "No products match {{ terms }}.", `recent` "Recent searches", `clear_recent` "Clear", `clear_recent_label` "Clear recent searches", `popular_searches` "Popular searches", `popular_collections` "Popular collections", `trending` "Trending now", `shop_all` "Shop All Products", `products_count` one/other "{{ count }} product(s)", `sold_out` dùng `products.product.sold_out` có sẵn nếu có.

`empty` hiện là "No suggestions for {{ terms }}": thay bằng `no_results_title` cho hộp báo; giữ `empty` cho status đọc lên.

## 8. Accessibility

- `<dialog>` + `showModal()` (bẫy focus, nền inert), `aria-labelledby` → h2 "Search" (ẩn ở popup, hiện ở drawer). Nút đóng 48 có `aria-label` "Close search" (code). Esc đóng, trả focus về icon search.
- Combobox: input `role="combobox"` `aria-expanded` `aria-controls` `aria-autocomplete="list"` `aria-activedescendant` (code). Option là chính `<a role="option">`, nhóm là `role="group"` + tiêu đề `<div>` (không heading trong listbox, ghi chú trong snippet).
- Tab nằm ngoài listbox: `role="tablist"` (`aria-label` "Result types") → `role="tab"` `aria-selected` `aria-controls` → khung thân là `role="tabpanel"` `aria-labelledby` tab đang chọn, chứa listbox. Roving tabindex trong tablist.
- Khám phá và hộp 0 kết quả nằm ngoài listbox: link thường trong `<ul>`, tiêu đề khối là heading cấp dưới h2 của dialog.
- Live region `role="status"` luôn có trong DOM (code: không `display:none`), đọc số kết quả, "Loading suggestions…", câu 0 kết quả. Lỗi `role="alert"`.
- Tên riêng mỗi nút: submit "Search", xoá "Clear search", đóng "Close search", "Clear" có chữ ẩn "recent searches". Giá có chữ ẩn "Sale price" / "Regular price" (foundation §9).
- Ảnh trong option `alt=""` (tên đọc từ text option, tránh đọc 2 lần); có `width`/`height`.
- Vùng chạm: option 44 cao, hàng sản phẩm 80, tab 44 (40 desktop), chip 44 (40 desktop), nút trong ô 44, đóng 48 (15 §1: ≥ 48 mobile). Hai vùng chạm cạnh nhau cách ≥ 8 và tổng ≥ 44 (target-size).
- Tương phản (WCAG, foundation §2 + tính thêm trên nền alt, L alt = 0.9046):

| Cặp | Tỉ lệ |
| --- | --- |
| chữ option / tên sản phẩm `--color-foreground` trên trắng; trên alt (hover) | 17.4; 15.8 |
| tiêu đề nhóm, meta "6 products", ngày, status `--color-muted` trên trắng; trên alt | 8.45; 7.69 |
| placeholder `--color-muted-light` / trắng | 5.33 |
| viền ô tìm `--color-muted-light` (sổ quyết định 09/11) | 5.33 (≥ 3) |
| giá sale `--color-sale` trên trắng; trên alt | 6.38; 5.80 |
| tab chọn: background / foreground | 17.4 |
| chip: foreground / alt | 15.8 |
| nút primary chữ / accent | 5.01 |
| outline focus accent / trắng; viền option chọn foreground | 5.01; 17.4 |
| icon kính lúp, lưới, trang `--color-muted` (đồ hoạ) | 8.45 |

- Không chỉ dùng màu: sale có giá gạch, hết hàng có chữ, lỗi có icon + chữ, tab chọn đổi nền và `aria-selected`.
- Zoom 200% / 320px: tab cuộn ngang trong hàng, nút chân xuống dòng, không tràn ngang trang.
- `prefers-reduced-motion`: tắt trượt, mở/đóng tức thì.

## 9. Motion

| Thành phần | Vào | Ra | Thuộc tính | Nguồn |
| --- | --- | --- | --- | --- |
| Popup | 300ms `--ease-out`, trượt 24px từ trên + opacity | 200ms | translate, opacity | foundation §19 (dialog 300/200), 15 §3.7 |
| Drawer | 250ms trượt từ inline-end | 200ms | translate | foundation §15, 15 §4 |
| Scrim | 250ms | 200ms | opacity | |
| Kết quả mới | 150ms fade | — | opacity | 11 §3 (không giật) |
| Hover option, chip, tab | 150ms | 150ms | màu nền, viền | 05 §3 (< 200ms) |
| Ảnh card desktop hover | 500ms scale 1.04 | | transform | foundation §9 |

Không animate chiều cao khung khi số kết quả đổi (tránh xô lệch): khung cao theo nội dung, đổi tức thì.

## 10. Lighthouse

- LCP: overlay không bao giờ là LCP. Dialog đóng lúc tải trang (`display: none`), không ảnh nào trong dialog tải; LCP vẫn là ảnh đầu trang của template (hero / banner). Không mở search tự động.
- Ảnh lazy: mọi ảnh trong overlay. Ảnh kết quả do JS tạo từ `<template>` sau khi gõ (code). Ảnh "Trending now" render bằng `snippets/image.liquid` với `loading="lazy"` bên trong dialog đóng, hoặc trong `<template>` chèn khi mở (sổ quyết định 09/11: ảnh trong popup tải khi mở); `sizes` 64px (hàng) / `(min-width: 80rem) 250px, 50vw` (card); srcset tới 480. Có `width`/`height` → 0 CLS.
- Font: Inter (body, ô tìm, option) + Sofia Sans Condensed (h2 drawer). Không font mới.
- JS: `predictive-search.js` ≤ 8 KB gồm tab + recent searches; tải module khi trang tải nhưng chỉ fetch khi gõ; trang ≤ 40 KB. Nếu vượt 8 KB: tách recent searches thành module nạp khi mở.
- CLS: overlay `position: fixed` trên trang, không đẩy layout; skeleton đúng kích thước nội dung; chân và hàng đầu cố định.
- A11y (Lighthouse chỉ đo trạng thái tải, dialog đóng; QA axe khi mở): rủi ro `aria-required-children` (heading/link không option trong listbox) → khám phá, hộp 0 kết quả, nút "View all" để ngoài listbox; `nested-interactive` → option là `<a>`, không bọc; `aria-dialog-name` → h2; `button-name` → mọi nút icon có `aria-label`; `color-contrast` → bảng §8; `label` → `<label for>` thật; `target-size` → §8.
- SEO: link trong overlay là `<a href>` thật qua `routes.*`; chữ mô tả đích ("View all results for “bench”", tên sản phẩm), không "Click here". Overlay không đổi `<title>`/meta. Trang `/search` bị robots.txt Shopify chặn: không ảnh hưởng SEO trang đang đứng.
- Best Practices: 0 lỗi console (AbortError bỏ qua), không chặn dán vào ô tìm, `autocomplete="off"` chỉ trên ô tìm (gợi ý riêng), ảnh `object-fit: contain` không méo.

## 11. Map sang code (cho Dev FE / BE)

| Phần | Hiện có | Thay đổi đề xuất | Phía |
| --- | --- | --- | --- |
| Khung | `.predictive-search-dialog` full màn / dải trên ≥ 48rem | thêm hàng logo + lưới 12 ≥ 80rem; biến thể drawer `[data-style="drawer"]`; h2 ẩn + `aria-labelledby` thay `aria-label` | FE |
| Form | input 44, viền `--color-border`, submit icon ở cuối | ô cao `--control-height`, viền `--color-muted-light` (sổ 09/11), submit kính lúp đầu ô, nút xoá `data-testid="predictive-search-clear"`, placeholder mới | FE |
| Tab | — | tablist `data-testid="predictive-search-tabs"`, tab `data-predictive-tab="all|products|collections|articles|pages"`, tabpanel bọc listbox; dùng `.tab` + biến thể nhỏ | FE markup, BE logic |
| Nhóm từ khoá | — | group `data-predictive-group="queries"`, template `data-predictive-template="query"` (`<mark>` phần khớp) | FE + BE |
| Sản phẩm | hàng ảnh 64 | ≥ 80rem trong popup tab All thành card 1:1 (4 cột), tab Products lưới 2/4/5 | FE |
| "View all" | option cuối trong listbox | chuyển ra chân, `.button`, giữ `data-testid="predictive-search-all"`; nhãn đổi theo tab | FE + BE |
| Khám phá | — | khối `data-predictive-discover` ngoài listbox, đọc 3 setting §5; recent `data-predictive-recent` | FE markup, BE recent |
| 0 kết quả, lỗi, loading | status text | hộp `data-testid="predictive-search-empty"`, `data-testid="predictive-search-error"` + nút retry, skeleton | FE markup, BE bật/tắt |
| Group title | 13 `--color-muted-light` | 14/600 uppercase `--color-muted` (đồng bộ `.mega__title`) | FE |

Ticket con theo `.claude/rules/fe-be-boundary.md`: FE1 markup + CSS (test id ở trên đi trước), BE1 JS (tab, query group, recent, loading/error, nhãn nút chân).

## 12. Token dùng

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-background-cream`, `--color-accent(-foreground)`, `--color-sale`, `--overlay-scrim`. Chữ: `--font-primary--family`, `--font-heading--family/weight`, `--font-size-sm/base/lg/h3`. Khoảng cách: `--space-1..6`, `--control-height`, `--header-height`, `--grid-gap`, `--page-width`, `--page-margin`. Bo: `--radius-input`, `--radius-card`, `--radius-pill`. Motion: `--motion-fast/base/slow`, `--ease-out`. Bóng: `--shadow-overlay`. Không token mới.

## 13. Quyết định CTO cần chốt

1. Mobile 360 kiểu mặc định là popup toàn màn (SRS TE-8 AC1, code hiện có) hay drawer phải 90% (15 §2, foundation §15)? Đề xuất: giữ toàn màn cho kiểu Popup (mặc định), drawer 90% là kiểu thứ hai qua setting "Search style"; foundation §15 ghi rõ drawer search chỉ áp khi chọn Drawer.
2. Số trên tab: predictive search không trả tổng, chỉ trả tối đa `limit` gợi ý mỗi loại. Hiện số gợi ý (đủ 8 ghi "8+") hay bỏ số? Đề xuất: hiện số, "8+" khi chạm giới hạn; tổng thật nằm ở trang /search.
3. Thêm 3 setting header (Popular searches, Popular collections, Trending products) cho trạng thái rỗng và 0 kết quả? Đề xuất: có; rỗng thì ẩn khối, demo điền dữ liệu thật; không có khối này thì trạng thái 0 kết quả không đạt 11 §5.
