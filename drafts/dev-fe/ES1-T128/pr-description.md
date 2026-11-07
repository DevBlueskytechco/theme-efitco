KHÔNG CHẮC: (1) chưa chạy preview, Playwright, axe, lhci trong sandbox, mọi kiểm tra trên store chờ CI; (2) ES1-T125 chưa có TE8_*: spec dùng q=a và chuỗi ngẫu nhiên cho 0 kết quả, test cần filter, trang 2 skip có lý do; (3) Shopify có escape tham số nội suy trong key _html không: docs không nói (ES1-T124 #5), đã escape trước, nếu Shopify cũng escape thì thấy `&amp;` và test "q có dấu và &" sẽ đỏ; (4) Figma không có trang search, bố cục theo mặc định ES1-T127 #4 #5 (CTO đã chấp nhận), không có visual diff Figma.

# ES1-T128 TE-8-FE1: trang search nhóm theo object_type, paginate 24, filter + sort dùng chung TE-6

AC: docs/srs.md#TE-8 AC2, AC3. Spec: drafts/techlead/ES1-T123/task-split.md D1, D2, D3, D4, D9; ES1-T124 #4 #5, ES1-T126 #2, ES1-T127.

## Thay đổi

- `templates/search.liquid`: container `search-header` (h1 + form GET role search, label ẩn, input ẩn `type=product,article,page`, `options[prefix]=last`). Chỉ khi `search.performed`: container `search-main` gồm `<collection-filters class="collection-layout" data-results-partial="search-results">` bọc block `collection-filters` (truyền `filters: search.filters`, `action_url: routes.search_url`, `clear_url`, body là input ẩn q, type, options[prefix]) và block `search-results`. `clear_url` = search_url + q, type, options[prefix] qua `url_encode`. Type của form filter và clear_url theo `search.types` hiện tại (link quiz `type=product` vẫn chỉ product), rỗng thì về mặc định.
- `blocks/collection-filters.liquid`: thêm param `filters`, `action_url`, `clear_url`, `{{ content }}` trong form. Có `action_url` thì đọc param; không có thì đọc `collection` như cũ. `data-collection-id/handle/products-count` chỉ render ở chế độ collection. Đếm filter qua `snippets/filter-count`. Trang collection: markup không đổi (trừ href Clear all qua `escape`, collection.url không có ký tự cần escape). Phần đuôi file (sau `</dialog>`) không đụng: patch ES1-T110 (thẻ script) vẫn `git apply --check` OK.
- `blocks/search-results.liquid` (mới): toolbar ngoài partial (nút mở drawer + partial `collection-filter-count`, `sort-select`, `collection-status`); partial `search-results` bọc `paginate search.results by 24`, root `data-results-label`; 3 nhóm theo `result.object_type` thứ tự product, article, page trong trang hiện tại, nhóm rỗng không render; h2 nhóm, product dùng `product-card` (`heading_level: 'h3'`, `card_context: 'search'`, 4 card đầu trang 1 eager), article: ảnh 6rem nếu có + tiêu đề + trích đoạn 30 từ, page: tiêu đề + trích đoạn; pagination ES1-T108; 0 kết quả: thông báo có từ khoá + link `routes.all_products_collection_url`; có filter và 0 kết quả: thông báo không khớp + `collection-empty-clear` tới clear_url (giữ q). `product-swatch.js` ngoài partial. Ngoài `search.performed`: hint trong editor, storefront không render.
- `snippets/filter-count.liquid` (mới): 1 quy tắc đếm (active_values + 1 khi price_range có min/max), mặc định ra badge; `count_only: true` in số để block `capture`. Thay 3 bản đếm trùng ở collection-filters, collection-products, search-results.
- `snippets/sort-select.liquid` (mới): select `collection-sort` gắn `form="collection-filter-form"` + Apply trong noscript, từ code ES1-T109. `blocks/collection-products` gọi lại, markup ra giống hệt.
- `snippets/product-card.liquid`: `card_context: 'search'` → view event context `search` (ES1-T75).
- An toàn: `search.terms | escape` trước khi vào `search.no_results_html`, `search.results_for_html` (trước đây truyền thẳng). `results_for_html` thành plural one/other.
- `assets/base.css`: xoá CSS cũ `.search-results` grid + `.prev, .page, .next`; thêm khối "Trang search": header, form (input 44px, focus đổi viền có transition trong `prefers-reduced-motion: no-preference`), nhóm, danh sách article/page (link 44px). Toolbar, lưới card (2/3/4 cột), drawer, rỗng dùng lại class TE-6. Chỉ token từ css-variables, 0 màu literal.
- Locales: `blocks.search_results.*` (mới), `search.input_label`, `search.*_html` có ngoặc kép; schema `general.search_results`.

## Hợp đồng FE → BE/QA (D9)

- Partial: `search-results` (mới); `collection-filters`, `collection-filter-count` (giữ tên TE-6).
- Hook: `data-results-partial="search-results"` trên `<collection-filters>`; `data-results-label` trên root trong partial. Form search không có `data-collection-handle` → JS bỏ qua `shopify:collection:update` (đã khớp code ES1-T110: `this.dataset.resultsPartial || "collection-products"`, `if (!d?.collectionHandle) return`).
- 14 testid mới: `search-title`, `search-form`, `search-input`, `search-submit`, `search-results`, `search-results-toolbar`, `search-results-count`, `search-results-group` (`data-object-type`), `search-results-group-heading`, `search-results-product`, `search-results-article`, `search-results-page`, `search-results-empty`, `search-results-empty-cta`.
- Dùng lại: `collection-status`, `collection-sort`, `collection-sort-apply`, `collection-filter-*`, `collection-empty-clear`, `pagination-*`.
- `shopify:search:update` (ES1-T124 #3): ngoài FE1, Tech Lead đã ghi là ticket riêng cho `collection-filters.js`.

## Theme map AGENTS.md (CTO hoặc Orchestrator áp, ES1-T91 #6)

Blocks, thêm hàng:
| `search-results` | Search page results: toolbar shared with the collection page, `search-results` partial, paginate 24, groups by `object_type`, empty states. |

Nếu bảng đã có hàng `collection-filters` thì sửa Role: `Storefront filter form and drawer for collection.filters, or the filters, action_url and clear_url params on the search page; collection-filters partial.`

Snippets, thêm hàng:
| `filter-count` | Number of filters applied: toolbar badge, or the number only with `count_only` for `capture`. |
| `sort-select` | Sort select bound to `collection-filter-form`, Apply button in noscript. |

## Cần Orchestrator chép

- `drafts/dev-fe/ES1-T128/ES1-T128.spec.ts` → `tests/e2e/ES1-T128.spec.ts` (scope-guard chặn tests/).
- `drafts/dev-fe/ES1-T128/ES1-T138.spec.ts.patch` → `git apply`: ES1-T138 "nojs AC1 submit sang search" bám `.search-result a` của markup cũ, đổi sang `search-results-product` > `product-card-title`. `git apply --check` OK.

## Tự kiểm tra

- `shopify theme check --path .`: 0 lỗi, 22 warning có sẵn ở 7 file không đụng (bundle-builder, featured-product, quiz-step, testimonial-item, index*). Không có `templates/*.json`.
- Không file JS trong diff. Không `{% stylesheet %}`/`{% javascript %}`, chuỗi qua `| t`, URL qua `routes.*`.
- Locale JSON: key mới gộp vào `blocks` và `search` đã có, không trùng.
- `npx playwright test tests/e2e/ES1-T128.spec.ts -g "AC2|AC3|nojs"` desktop + Pixel 7: chờ CI.
- TE-1, TE-3, ES1-T108, ES1-T109 (trang collection không đổi): chờ CI.
- axe 0 serious trên /search có kết quả, drawer mở, 0 kết quả: có trong spec, chờ CI.
- lhci 96/90/98 trên URL CI (không có URL search, D10), ảnh 360, 768, 1280: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
