KHÔNG CHẮC: (1) chưa chạy preview, Playwright, axe, lhci trong sandbox, mọi kiểm tra trên store chờ CI; (2) ES1-T125 chưa có TE8_*: spec dùng q=a và chuỗi ngẫu nhiên cho 0 kết quả, test cần filter, trang 2 skip có lý do; (3) Shopify có escape tham số nội suy trong key _html không: docs không nói (ES1-T124 #5), đã escape trước, nếu Shopify cũng escape thì thấy `&amp;` và test "q có dấu và &" sẽ đỏ; (4) Figma không có trang search, bố cục theo mặc định ES1-T127 #4 #5 (CTO đã chấp nhận), không có visual diff Figma; (5) TC-43 (S6a): nếu Shopify trả `search.filters` rỗng khi filter giá ra 0 kết quả thì trang rơi vào S2, không có chip — cần chạy trên store.

# ES1-T128 TE-8-FE1: trang search nhóm theo object_type, paginate 24, filter + sort dùng chung TE-6

AC: docs/srs.md#TE-8 AC2, AC3. Spec: drafts/techlead/ES1-T123/task-split.md D1, D2, D3, D4, D9; ES1-T124 #4 #5, ES1-T126 #2, ES1-T127.

## Thay đổi

- `templates/search.liquid`: container `search-header` (h1 + form GET role search, label ẩn, input ẩn `type=product,article,page`, `options[prefix]=last`). Chỉ khi `search.performed`: container `search-main` gồm `<collection-filters class="collection-layout" data-results-partial="search-results">` bọc block `collection-filters` (truyền `filters: search.filters`, `action_url: routes.search_url`, `clear_url`, body là input ẩn q, type, options[prefix]) và block `search-results`. `clear_url` = search_url + q, type, options[prefix] qua `url_encode`. Type của form filter và clear_url theo `search.types` hiện tại (link quiz `type=product` vẫn chỉ product), rỗng thì về mặc định.
- `blocks/collection-filters.liquid`: thêm param `filters`, `action_url`, `clear_url`, `{{ content }}` trong form. Có `action_url` thì đọc param; không có thì đọc `collection` như cũ. `data-collection-id/handle/products-count` chỉ render ở chế độ collection. Đếm filter qua `snippets/filter-count`. Trang collection: markup không đổi (trừ href Clear all qua `escape`, collection.url không có ký tự cần escape). Phần đuôi file (sau `</dialog>`) không đụng: patch ES1-T110 (thẻ script) vẫn `git apply --check` OK.
- `blocks/search-results.liquid` (mới): toolbar ngoài partial (nút mở drawer + partial `collection-filter-count`, `sort-select`, `collection-status`); partial `search-results` bọc `paginate search.results by 24`, root `data-results-label`; 3 nhóm theo `result.object_type` thứ tự product, article, page trong trang hiện tại, nhóm rỗng không render; h2 nhóm, product dùng `product-card` (`heading_level: 'h3'`, `card_context: 'search'`, 4 card đầu trang 1 eager), article: ảnh 6rem nếu có + tiêu đề + trích đoạn 30 từ, page: tiêu đề + trích đoạn; pagination ES1-T108; 0 kết quả: thông báo có từ khoá + link `routes.all_products_collection_url`; có filter và 0 kết quả: thông báo không khớp + `collection-empty-clear` tới clear_url (giữ q). Không thẻ script (product-swatch.js đã gỡ ở ES1-T338). Ngoài `search.performed`: hint trong editor, storefront không render.
- `snippets/filter-count.liquid` (mới): 1 quy tắc đếm (active_values + 1 khi price_range có min/max), mặc định ra badge; `count_only: true` in số để block `capture`. Thay 3 bản đếm trùng ở collection-filters, collection-products, search-results.
- `snippets/sort-select.liquid` (mới): select `collection-sort` gắn `form="collection-filter-form"` + Apply trong noscript, từ code ES1-T109. `blocks/collection-products` gọi lại, markup ra giống hệt.
- `snippets/product-card.liquid`: `card_context: 'search'` → view event context `search` (ES1-T75).
- An toàn: `search.terms | escape` trước khi vào `search.no_results_html`, `search.results_for_html` (trước đây truyền thẳng). `results_for_html` thành plural one/other.
- `assets/collection.css` (ADR 0013, sau ES1-T478; nạp ở template search): xoá CSS cũ `.search-page__*`, `.search-results` grid + `.prev, .page, .next`; thêm khối "Trang search" (giữ chống tràn ngang ES1-T493): header, form (input 44px, focus đổi viền có transition trong `prefers-reduced-motion: no-preference`), nhóm, danh sách article/page (link 44px). Toolbar, lưới card (2/3/4 cột), drawer, rỗng dùng lại class TE-6. Chỉ token từ css-variables, 0 màu literal.
- Locales: `blocks.search_results.*` (mới), `search.input_label`, `search.*_html` có ngoặc kép; schema `general.search_results`.

## Hợp đồng FE → BE/QA (search.md §10, thay D9 sau khi gộp develop)

- Partial: `search-products` (đổi từ `search-results`, theo ES1-T307 §3): nhóm Products (toolbar, chip, note, lưới hoặc S6a), Articles, Pages, phân trang. `collection-filters` giữ tên TE-6. Partial `collection-filter-count` không còn trên search (toolbar nằm trong `search-products`, partial không lồng nhau); collection giữ nguyên. Partial `search-filters` (§10) chưa làm: block `collection-filters` dùng chung, tên partial cố định.
- Hook: `data-results-partial="search-products"` trên `<collection-filters class="collection-layout collection-layout--drawer">`; `data-results-label` (chữ thuần, đã escape 1 lần cho attribute) trên root trong partial → BE chép vào `search-status` sau refresh. Không còn `collection-status` ẩn trên search (dòng `search-status` `role="status"` hiện, ở đầu trang ngoài partial).
- Testid (search.md §10, ES1-T131): `search-head`, `search-form`, `search-status`, `search-type-nav`, `search-products`, `search-product-grid`, `search-active-filters` (+ `-chip`, `-clear`), `search-filter-note`, `search-filtered-empty` (+ `-heading`, `-button`), `search-articles`, `search-pages`, `search-pagination`, `search-empty` (+ `-heading`, `-button`); giữ `search-title`, `search-input`, `search-submit`, `search-results`. Bỏ `search-results-toolbar`, `-count`, `-group`, `-group-heading`, `-product`, `-article`, `-page`, `-empty`, `-empty-cta`.
- Giữ tên TE-6 (BE ES1-T110 bám): `collection-filter-open`, `collection-filter-count`, `collection-sort`, `collection-sort-apply`, `collection-filter-drawer` và các hook `collection-filter-*`, `pagination-*` (thêm `pagination-summary` chỉ ở search). ES1-T131 nhận cả hai tên (`search-filter-toggle` | `collection-filter-open`, `search-sort` | `collection-sort`, `filter-drawer` | `collection-filter-drawer`).
- `shopify:search:update` (ES1-T124 #3): ticket BE riêng (TE-8-R2-BE2).

## Theme map AGENTS.md (CTO hoặc Orchestrator áp, ES1-T91 #6)

Blocks, thêm hàng:
| `search-results` | Search page results: toolbar shared with the collection page, `search-results` partial, paginate 24, groups by `object_type`, empty states. |

Nếu bảng đã có hàng `collection-filters` thì sửa Role: `Storefront filter form and drawer for collection.filters, or the filters, action_url and clear_url params on the search page; collection-filters partial.`

Snippets, thêm hàng:
| `filter-count` | Number of filters applied: toolbar badge, or the number only with `count_only` for `capture`. |
| `sort-select` | Sort select bound to `collection-filter-form`, Apply button in noscript. |
| `active-filters` | Chips of the filters in use (links to url_to_remove) and Clear all. |

## Cần Orchestrator chép

- `drafts/dev-fe/ES1-T128/ES1-T128.spec.ts` → `tests/e2e/ES1-T128.spec.ts` (scope-guard chặn tests/).
- `drafts/dev-fe/ES1-T128/ES1-T138.spec.ts.patch`: đã áp vào `tests/e2e/ES1-T138.spec.ts`; ES1-T138 "nojs AC1 submit sang search" bám `search-product-grid` > `product-card-title`.

## Vòng sửa sau gộp develop (ES1-T478, khớp ES1-T131)

Sau khi gộp develop, `blocks/search-results.liquid` có mặt nên `tests/e2e/ES1-T131.spec.ts` (QA) hết skip; spec bám testid, chữ, trạng thái của `docs/ui-spec/search.md` §3, §6, §10. Đã sửa:
- `templates/search.liquid`: breadcrumb Home / Search; `search-top` = [`search-head`: h1 "Search Results" (chưa tìm: "Search"), form (kính lúp trong ô, viền muted-light, < 48rem nút vuông chỉ icon, tên "Search" vẫn đọc), dòng `search-status` `role="status"` "N results for “q”" / "No results for “q”"] + `search-type-nav` 4 link All · Products · Articles · Pages giữ q, `aria-current="page"` theo `search.types`. Link All gửi `type=product,article,page` + `options[prefix]=last` như form (spec ghi "không type"; giữ để kết quả All giống submit form, ES1-T124 #4).
- `blocks/search-results.liquid`: viết lại theo §3.4–§3.9: section có h2 + số kết quả nhóm; Products = [h2 | toolbar] + chip + filter-note + lưới / S6a; Articles, Pages = danh sách dòng (ô media cream + icon, meta "Article · ngày" / "Page", h3 link phủ cả dòng, trích đoạn), cạnh nhau từ 64rem; phân trang `window_size: 1` + dòng "Showing x–y of z results"; S2 `empty-state` "Nothing Matches “q” Yet" + Shop All Products; trang vượt số trang: `empty-state` + "Go to page 1". Ảnh card: chỉ card đầu trang 1 eager (§9).
- `snippets/active-filters.liquid` (mới): chip link `url_to_remove` (list/boolean mỗi giá trị 1 chip, price_range 1 chip "min – max"), tên "Remove filter Color: Black", cuối hàng Clear all.
- `assets/collection.css`: drawer lọc mọi mốc cho search (`.collection-layout--drawer`; các rule cột trái từ 64rem chỉ áp `.collection-layout:not(.collection-layout--drawer)`, collection không đổi), lưới 2/3/4 cả bề ngang, CSS search mới (type-nav, chip, dòng kết quả, đầu nhóm). collection.css 4 333 B gzip (trần 16 384).
- Locales `search.*` theo §10 (results_title, type_*, filter_note, no_results_title_html, shop_all, filtered_empty_*, clear_all_filters, page_empty_*, first_page, article_label, page_label, active_filters, remove_filter, clear_all); bỏ `blocks.search_results.empty_*` không còn dùng; `results_for_html` bỏ chữ "found".

Chưa làm (ghi rõ lý do):
- S1 / S2 "Popular searches", "Shop by category", "Popular Products" (TC-15, TC-49): cần setting `popular_searches` của ES1-T377 và setting block §4 (suggested collections, products when no results); ES1-T131 skip theo cổng `popularSetting`.
- S5 skeleton "Updating results…", S6b `search-error` alert + Try Again (TC-39), focus sau refresh (TC-36), JS lọc/sort không tải lại (TC-34, TC-35, TC-38): việc BE TE-8-R2-BE2 / ES1-T380 (`collection-filters.js` + thẻ script trong block); ES1-T131 skip theo cổng `searchJs`. FE không thêm JS.
- Nút xoá × trong ô (§3.1, "xoá xong focus về ô"): cần JS, để BE; không thêm `type="reset"` vì reset trả về từ khoá cũ.
- Partial `search-filters` cho thân drawer (§10): block `collection-filters` dùng chung giữ partial `collection-filters`.
- Settings block §4 (results per page, columns, show filters/sorting, show article and page results): ngoài phạm vi sửa ES1-T131; paginate cố định 24.

## Tự kiểm tra

- `shopify theme check --path .`: 0 lỗi, 22 warning có sẵn ở 7 file không đụng (bundle-builder, featured-product, quiz-step, testimonial-item, index*). Không có `templates/*.json`.
- Không file JS trong diff. Không `{% stylesheet %}`/`{% javascript %}`, chuỗi qua `| t`, URL qua `routes.*`.
- Locale JSON: key mới gộp vào `blocks` và `search` đã có, không trùng.
- `npx playwright test tests/e2e/ES1-T128.spec.ts -g "AC2|AC3|nojs"` desktop + Pixel 7: chờ CI.
- TE-1, TE-3, ES1-T108, ES1-T109 (trang collection không đổi): chờ CI.
- axe 0 serious trên /search có kết quả, drawer mở, 0 kết quả: có trong spec, chờ CI.
- lhci 96/90/98 trên URL CI (không có URL search, D10), ảnh 360, 768, 1280: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
