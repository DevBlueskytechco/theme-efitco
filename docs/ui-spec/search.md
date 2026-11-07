# UI spec — Trang search và predictive search (ES1-T242, TE-8)

Mockup: `drafts/designer/ES1-T242/search.html`, ảnh `search-360/768/1280/1920.png` cùng thư mục.
Story: SRS TE-8 AC1 (predictive), AC2 (trang kết quả), AC3 (không JS). Mã R: R4, R7.

## 1. Mục đích
- Predictive: khách gõ từ 2 ký tự, sau 300ms thấy gợi ý product (ảnh, tên, giá), collection, page, article; điều khiển bằng ↑ ↓ Enter Esc; mobile toàn màn.
- Trang search: kết quả theo object_type (product, article, page), phân nhóm, phân trang, filter và sort như collection, thông báo khi 0 kết quả. Không JS vẫn đủ chức năng (form GET).

## 2. Figma node
Figma chỉ có trang chủ 1:359 (CTO 07/11). Trang này dựng từ thành phần trang chủ:
| Thành phần | Node | Dùng ở |
| --- | --- | --- |
| Header | 1:362 | Header nền đặc |
| Product card | 1:490, 1:502 | Lưới sản phẩm, ô gợi ý product từ 64rem |
| Tab | 1:496 | Tab loại kết quả, chip collection gợi ý |
| Link CTA | 1:462 | Hàng kết quả page |
| Blog card | 1:1022 | Thẻ article, tỉ lệ 300 / 448 |
| Footer | 1:1104 | Footer |
Mọi thứ khác là ĐỀ XUẤT.

## 3. Anatomy

### 3.1 Trang search (`templates/search.liquid`)
1. `site-header`: header trang chủ, nền đặc `--figma-1a1a1a` + noise, link `--figma-white-60`, hover trắng. ĐỀ XUẤT (quyết định 1).
2. `breadcrumb`: Home / Search. ĐỀ XUẤT.
3. `search-head`:
   - `h1` "Search" (`search.title`).
   - `search-form`: input type search (icon kính lúp trong ô, placeholder `search.placeholder`) + nút `.button` "Search" (`search.submit`). Dưới 48rem nút chỉ còn icon 52 × 52, nhãn giữ cho screen reader.
   - `search-head__count` (`search.results_for_html`, terms đậm), `role="status"`.
   - `search-tabs`: All, Products, Articles, Pages = link `routes.search_url?q=&type=`; tab hiện tại `aria-current="page"`. ĐỀ XUẤT (quyết định 2).
4. `results-group` × 3, thứ tự product → article → page, ẩn nhóm không có kết quả trên trang hiện tại. Mỗi nhóm: `h2` + link "View all" (tới tab type đó; ẩn khi đã ở tab type).
   - Products: `products-layout` = cột filter + `products-main` (toolbar: nút Filter dưới 64rem, ghi chú, select Sort by) + `product-grid` render `snippets/product-card.liquid`.
   - Articles: `article-grid` thẻ `snippets/article-card.liquid` (ảnh, gradient, tiêu đề, ngày).
   - Pages: `page-list`, mỗi hàng: tiêu đề kiểu link CTA (heading 700, `--font-size-h3`), URL tương đối màu muted, mũi tên 20 × 16.
5. `pagination` (`snippets/pagination.liquid`) khi > 20 kết quả.
6. `site-footer`: y nguyên trang chủ.

Ghi chú dữ liệu: `search.results` phân trang chung cho mọi loại; nhóm trên tab All chỉ chứa kết quả của trang hiện tại. Liquid không có số đếm theo từng type, nên tab không hiện số. Filter (`search.filters`) và sort (`search.sort_options`, `search.sort_by`) chỉ áp cho product.

### 3.2 Predictive (`snippets/predictive-search.liquid`, giữ nguyên markup và hook)
1. `dialog.predictive-search-dialog` (backdrop `--color-background-dark` 50%).
2. `predictive-search__form`: input combobox (cao 52, icon trong ô, viền foreground + outline 2px khi focus) + nút đóng 44 × 44 cùng hàng. Nút submit hiện tại (`predictive-search-submit`) giữ trong DOM; ĐỀ XUẤT đặt thành icon trong ô nhập như mockup, vẫn là button 44.
3. `predictive-search__status` (live region): "Suggestions found: 9" / "Searching…" / thông báo rỗng, lỗi.
4. `predictive-search__listbox`: group products, collections, pages, articles (giữ thứ tự DOM hiện tại).
   - Option product: ảnh (nền cream, `mix-blend-mode: darken` như card), tên, giá. ĐỀ XUẤT: giá sale màu `--color-sale` + giá gạch `--color-muted-light` (cần BE thêm compare_at_price vào template JS).
   - Option collection, page: chỉ tiêu đề.
   - Option article: ĐỀ XUẤT thêm ảnh 64 (cover) + ngày; template `link` hiện chỉ có tiêu đề, cần BE thêm `data-predictive-image`, `data-predictive-meta`.
   - ĐỀ XUẤT: phần khớp query in đậm bằng `<mark>` (không nền, weight 700).
5. `predictive-search__all`: "View all results for “dumbbell”" + mũi tên, hàng 56 cao, kẻ trên.

## 4. Settings merchant (tất cả ĐỀ XUẤT, chờ CTO và Tech Lead)
| Tên | Kiểu | Default | Giới hạn | Nơi |
| --- | --- | --- | --- | --- |
| Search suggestions menu | link_list | trống | Trống thì không hiện khối gợi ý | Theme settings, nhóm Search (dùng chung header và trang search) |
| Show predictive search | checkbox | true | Tắt thì icon chỉ là link tới trang search | Theme settings, nhóm Search |
| Results per page | range | 20 | 12–48, bước 4 | Block search-results |
| Show filters | checkbox | true | Chỉ có tác dụng khi shop có filter (Search & Discovery) | Block search-results |
| Show sort | checkbox | true | | Block search-results |
Không có setting màu riêng: màu theo token theme.

## 5. Layout
Breakpoint mobile-first: 48rem (768), 64rem (1024), 80rem (1280). 1920 = khung Figma, content 1416 (`--page-width` 91rem, `--page-margin` 20).

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Header | menu + logo + 3 icon, cao `--header-height` 80 | như 360 | nav giữa (vị trí như trang chủ), 3 icon | như 1280 |
| Form search | full width, nút icon 52 | max 696, nút chữ | như 768 | như 768 |
| Tab | cuộn ngang, tràn ra mép màn hình, padding ngang 24 | padding 28 | như 768 | như 768 |
| Products | 2 cột, gap 24 / 16 (card 152); filter là drawer qua nút "Filter" | 3 cột, gap 40 / 24; drawer | lưới 4 cột gap 24: cột 1 filter, cột 2–4 card (card 277) | như 1280, card 336 = Figma 1:502 |
| Articles | 1 hàng cuộn ngang, thẻ 78%, scroll-snap | 3 cột | 4 cột (cùng lưới card) | 4 cột, thẻ 336 × 502 |
| Pages | 1 cột | 1 cột | 2 cột gap 24 | 2 cột |
| Predictive | toàn màn (`100dvh`), list cuộn | panel trên cùng, rộng page-width, max 80dvh, bo đáy `--radius-card`, list 1 cột | lưới 4 cột: products chiếm 3 cột (4 ô dạng card, ảnh 1:1 bo 12), cột 4: collections, pages, articles | như 1280, ô product ~246 |

Khoảng cách dọc: breadcrumb trên `--space-4`; head → nhóm đầu `--space-7`; giữa nhóm 48 dưới 64rem, 80 từ 64rem (`calc(var(--space-1) * 20)`), có kẻ `--color-border`; heading nhóm → nội dung 24 / 40; cuối main 48 / 120 (`--space-7` / `--space-8`). Predictive: padding ngang `--page-margin`, khối `--space-4`/`--space-5`, gap option `--space-1`.

## 6. Trạng thái
Tất cả trạng thái dưới đây là ĐỀ XUẤT (Figma không có). Khung P1–P4, S1–S5 ở cuối mockup.
| Mã | Trạng thái | Hiển thị |
| --- | --- | --- |
| P1 | Predictive, query < 2 ký tự | "Popular collections" + chip (style tab) từ Search suggestions menu; menu trống thì chỉ còn ô nhập |
| P2 | Predictive, đang tải | Skeleton đúng bố cục kết quả (4 ô product, 2 dòng collection), shimmer chỉ khi `prefers-reduced-motion: no-preference`; status "Searching…"; listbox `aria-busy` |
| P3 | Predictive, 0 gợi ý | `blocks.predictive_search.empty` (có sẵn) + dòng phụ + chip; ẩn "View all" |
| P4 | Predictive, lỗi fetch | Icon cảnh báo `--color-sale`, "Suggestions are unavailable right now", "Press Enter to see all results."; giữ "View all" |
| S1 | Trang search, chưa có query (`search.performed` false) | h1, form, chip gợi ý |
| S2 | Trang search, 0 kết quả | `search.no_results_html` (có sẵn) dạng heading 28, 2 mẹo, chip, nút "Continue Shopping" → `routes.all_products_collection_url` |
| S3 | Đang lọc, sort, đổi trang (BE refresh partial) | Lưới thay bằng skeleton card, filter mờ 50% và không bấm, `aria-busy="true"` trên vùng kết quả |
| S4 | Refresh partial lỗi | Giữ kết quả cũ, `role="alert"` viền `--color-sale`: "Couldn’t update the results. Reload the page" (link GET đủ tham số) |
| S5 | Phân trang | Ô 44 × 44, bo `--radius-button`, trang hiện tại nền foreground; prev/next là mũi tên có nhãn ẩn; giữ q, type, filter, sort |
| Hover | Card | Ảnh scale 1.04 `--motion-slow`; tiêu đề gạch chân |
| Hover | Option predictive | Nền `--color-background-alt` `--motion-fast` |
| Selected | Option bằng phím | Nền alt + outline 2px foreground inset (giữ CSS hiện tại) |
| Focus | Mọi phần tử tương tác | Outline 2px currentColor, offset 2px; input: viền foreground + outline 2px |
| Popup | Mở, đóng | ĐỀ XUẤT: backdrop fade + panel trượt 8px và fade, `--motion-base` `--ease-out`, trong `prefers-reduced-motion: no-preference` |

Locale mới (ĐỀ XUẤT, `locales/en.default.json`): `search.tabs.all|products|articles|pages`, `search.view_all`, `search.group_products|articles|pages`, `search.suggested`, `search.no_results_tips` (2 dòng), `search.continue_shopping`, `search.update_error`, `search.reload`, `search.sort_label`, `search.filter`, `blocks.predictive_search.loading` ("Searching…"), `blocks.predictive_search.error`, `blocks.predictive_search.error_hint`, `blocks.predictive_search.empty_hint`, `blocks.predictive_search.suggested` ("Popular collections"), `general.breadcrumb.home`.

## 7. Accessibility
Tương phản (tính tay theo công thức WCAG, L = 0.2126R + 0.7152G + 0.0722B tuyến tính):
| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| #1A1A1A / #FFFFFF | 17.4 | Chữ chính, focus ring |
| #4D4D4D / #FFFFFF | 8.45 | Count, URL page, meta, group title predictive |
| #4D4D4D / #F4F4F4 | 7.68 | Meta trong option đang hover |
| #6B6B6B / #FFFFFF | 5.33 | Placeholder, giá gạch, ô disabled |
| #BD1616 / #FFFFFF | 6.38 | Giá sale; chữ trắng trên badge sale 6.38 |
| #FFFFFF / #C8400E | 5.01 | Nút Search |
| #1A1A1A / #F4F4F4 | 15.8 | Tab thường, chip |
| #FFFFFF / #1A1A1A | 17.4 | Tab đang chọn, header, footer |
| white 60% trên #1A1A1A (#A3A3A3) | 6.9 | Nav header |
| #999999 / #1A1A1A | 6.11 | Chữ phụ footer |
| #C8400E / #1A1A1A | 3.48 | "Get 15% off" footer, ≥ 24px, chỉ đạt AA chữ lớn (như trang chủ) |
| #FFFFFF trên ảnh article | ≥ 4.0 trường hợp ảnh trắng sau gradient | Rủi ro: gradient `--color-background-dark` 90% → trong suốt ở 55%, như blog card trang chủ. QA đo trên ảnh thật; dưới 4.5 thì tăng điểm dừng gradient |
| Viền input #E5E5E5 / #FFFFFF | 1.26 | ĐỀ XUẤT: nhận diện ô bằng icon + nút cạnh bên; nếu cần đạt 1.4.11 (3:1) thì viền `--color-muted-light` (5.33) |
Không dùng ngoại lệ mới ngoài `tests/e2e/support/figma-exceptions.json`.

Touch: mọi link, nút, option, checkbox row, tab (40 + `::before` 44), trang phân trang ≥ 44 × 44 ở mọi breakpoint.

Bàn phím và ARIA:
- Input `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` trỏ option đang chọn; option là `<a role="option">`, group title là `div` (giữ quy tắc axe trong snippet).
- ↑ ↓ di chuyển qua option kể cả "View all"; Enter mở option hoặc gửi form; Esc đóng dialog, focus về icon search ở header. Nút đóng luôn bấm được bằng Tab.
- Status `role="status"` báo số gợi ý, đang tải, rỗng, lỗi.
- Trang search: 1 `h1`; `h2` cho nhóm; `h3` cho tên card; tab là `nav aria-label` + `aria-current`; breadcrumb `nav aria-label="Breadcrumb"`, mục cuối `aria-current="page"`.
- Ảnh product alt = alt ảnh hoặc tên sản phẩm (như product-card); ảnh trong option và article card `alt=""` vì tên đã là chữ của link.
- Không JS: form GET tới `routes.search_url`, filter form GET, sort submit qua nút (như collection), phân trang là link.

## 8. Token dùng
Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-background-cream`, `--color-background-dark`, `--color-background-dark-foreground`, `--color-background-panel`, `--color-muted-on-dark`, `--color-accent`, `--color-accent-foreground`, `--color-sale`, `--color-sale-foreground`, `--figma-1a1a1a`, `--figma-white-12`, `--figma-white-60`. Không màu mới.
Chữ: `--font-heading--family` (Sofia Sans Condensed 700/800), `--font-primary--family` (Inter 400/500/600/700); cỡ `--font-size-xs|sm|base|lg|h3|h2|h1|wordmark`.
Khoảng: `--space-1..8`, `--page-width`, `--page-margin`, `--header-height`.
Bo: `--radius-input`, `--radius-button`, `--radius-card`, `--radius-pill`, `--figma-radius-8` (tab, option, thumbnail 64), `--figma-radius-16` (footer panel).
Chuyển động: `--motion-fast`, `--motion-base`, `--motion-slow`, `--ease-out`.

## 9. Map sang code
| Phần | Hiện có | Cần làm |
| --- | --- | --- |
| Template | `templates/search.liquid` markup tối thiểu | FE: thành composition root: container → breadcrumb → `search-header` → `search-results` |
| Header, footer | `blocks/header.liquid`, footer trang chủ | FE: nền đặc trên trang không có slideshow (quyết định 1) |
| Breadcrumb | Không có | FE: `snippets/breadcrumb.liquid` (ĐỀ XUẤT, dùng lại cho trang khác) |
| Form, count, tab | Trong template | FE: block mới `blocks/search-header.liquid` |
| Kết quả nhóm | Trong template | FE: block mới `blocks/search-results.liquid` (settings mục 4), có partial cho BE refresh |
| Product card | `snippets/product-card.liquid` | Dùng nguyên; Dev xác nhận `card_context` cho search (hiện chỉ collection, recommendation) |
| Article card | `snippets/article-card.liquid` | Dùng lại, kiểm tỉ lệ 300 / 448 |
| Filter | `blocks/collection-filters.liquid` + `snippets/filter-group.liquid` | Block đọc global `collection`; cần nguồn `search.filters` (Tech Lead chọn: tổng quát hoá block hay block `search-filters` mới dùng `filter-group`) |
| Sort | Select trong `blocks/collection-products.liquid` | Tách hoặc lặp theo `search.sort_options` |
| Phân trang | `snippets/pagination.liquid` | Dùng lại, style S5 |
| Predictive markup | `snippets/predictive-search.liquid` | FE: CSS theo mục 5–6; markup giữ hook. BE: loading/lỗi/rỗng, compare price, ảnh + ngày article, `<mark>` |
| Predictive JS | `assets/predictive-search.js`, `assets/search-loader.js` | BE |
| Setting | Không | FE: `config/settings_schema.json` nhóm Search (sau khi CTO chốt) |

## 10. Quyết định CTO cần chốt
1. Header trên trang không có hero (search và trang con): ĐỀ XUẤT nền đặc `--figma-1a1a1a` + noise như trang chủ sau khi cuộn, chữ trắng, để mọi trang cùng một header. Phương án khác: nền trắng chữ đen.
2. Cách phân loại kết quả: ĐỀ XUẤT tab All / Products / Articles / Pages (link `type=`) + trên All chia 3 nhóm, filter chỉ ở nhóm Products. Phương án khác: chỉ chia nhóm, không tab (ít click hơn nhưng phân trang trộn loại khó hiểu).
3. Gợi ý khi query rỗng và khi 0 kết quả: ĐỀ XUẤT 1 setting link_list "Search suggestions menu" dùng chung cho predictive (P1, P3) và trang search (S1, S2), mặc định trống = không hiện. Phương án khác: không có gợi ý, chỉ thông báo.
