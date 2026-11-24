KHÔNG CHẮC: (1) chưa chạy trình duyệt, Playwright, `node --check` (phiên agent không có Chrome, node cần duyệt); kết quả lấy từ CI. (2) Tên lớp `SearchUpdateEvent` và khoá resolve `{productsCount}` của `shopify:search:update` suy theo CollectionUpdateEvent, ES1-T124 #3 không có nguyên văn; hỏi ở ES1-T568. (3) Số kết quả lấy từ số đứng đầu `data-results-label` vì search-results chưa có `data-results-count` (đề xuất FE ở ES1-T568).

# ES1-T380 TE-8-R2-BE2: collection-filters.js trên /search, thẻ script trong search-results

AC: docs/srs.md TE-8 AC2, AC3 (+ AC8 S5, S6b). Spec: docs/ui-spec/search.md §6, §7, §10. Kế hoạch: drafts/techlead/ES1-T307/task-split.md dòng TE-8-R2-BE2. Phụ thuộc: ES1-T110 (JS TE-6), ES1-T128 (markup search, PR #151 đã thêm lỗi S6b + focus khi phân trang).

## Thay đổi

`assets/collection-filters.js` (6 863 → 8 127 B):
- Partial theo trang: có `data-results-partial` (/search) thì fetch `search-products` + `collection-filters`; không có (collection) giữ 3 partial `collection-products`, `collection-filters`, `collection-filter-count`. /search không có region `collection-filter-count` (badge Filter nằm trong `search-products`).
- Status line: sau apply chép `data-results-label` vào `[data-testid=collection-status]` trong element, không có thì `[data-testid=search-status]` ở đầu trang (ngoài `<collection-filters>`, templates/search.liquid). textContent, không dời focus.
- Lỗi (S6b): khôi phục `data-results-label` cũ trên lưới cũ (trước đây để rỗng sau lỗi), status giữ nguyên; alert từ `template[data-results-error]` như PR #151.
- Try Again: nút nằm trong alert bị gỡ khi chạy lại → focus chuyển về nút Filter (`collection-filter-open`) thay vì rơi về body.
- `shopify:search:update` (ES1-T124 #3): khi đổi filter, sort, Clear all, chip trên trang có input `q` trong form; dispatch từ `#collection-filter-form`, detail `{ search: { query, sortKey? }, promise }`, sortKey từ `sort_by` (`relevance` → RELEVANCE, `price-*` → PRICE); promise resolve `{ productsCount }` sau apply. Không dispatch khi sang trang. Collection vẫn `shopify:collection:update` như cũ (form có `data-collection-handle`). Bỏ `productFilters` như ES1-T249. Thư viện CDN không có lớp thì bỏ qua êm.
- productsCount: số đứng đầu nhãn (nhãn search chứa từ khoá, "3 results for “66 lb”" trước đây ra 366). Collection không đổi kết quả.

`blocks/search-results.liquid`: thêm 1 `<script src="{{ 'collection-filters.js' | asset_url }}" type="module">` sau `{% endpartial %}` (ngoài partial). Không đổi markup khác. Cùng URL với thẻ trong blocks/collection-filters.liquid: module chạy 1 lần.

Không đổi: replaceState (đã có), AbortController/huỷ request cũ, `aria-busy`, giữ `<details>` đang mở, focus `[data-results-focus]` khi sang trang, không JS = form GET + popover (AC3).

Cho FE (không chặn): §10 liệt kê khoá `search.try_again`; hiện empty-state dùng `general.try_again` = "Try Again", đúng chữ. Đề xuất `data-results-count="{{ search.results_count }}"` cạnh `data-results-label` (ES1-T568).

## Ngân sách JS (ADR 0006, 0010)

- `wc -c assets/collection-filters.js` = 8 127 ≤ 8 192 (sát trần: thêm logic thì tách file).
- /search tải sẵn: standard-events 888 + motion 6 129 + page-layers 2 031 + modal-dialog 2 039 + header-menu 3 058 + header-sticky 1 680 + search-loader 256 + collection-filters 8 127 = 24 208 B ≤ 40 960. Tăng 1 264 B so với develop (collection-filters đã nạp trên /search qua block collection-filters). predictive-search.js, header-drawer.js nạp lười.
- /collections/*: chỉ +1 264 B của cùng file.

## Test

`tests/e2e/ES1-T380.spec.ts`:
- contract: 1 thẻ script trong search-results ngoài partial; `data-results-partial="search-products"` khớp `{% partial 'search-products' %}`; ≤ 8 192 B; không console/pushState; hook `data-results-label`, `data-results-focus`, `template data-results-error`, `search-status`, input `q`.
- fixture (trang giả, partials giả, thư viện event giả, không cần store): tick filter → đúng 2 partial, URL giữ q, search-status = nhãn mới, 1 event search:update {query, sortKey}, resolve {productsCount: 1} (không lẫn "66"); sort → sortKey PRICE; sang trang → không event, focus nhóm sản phẩm; lỗi → alert sau template, nhãn + status cũ, filter giữ tick, URL không đổi; Try Again → alert mất, status mới, focus nút Filter; collection → 3 partial + collection:update, không search:update.
- store /search: tick filter không tải lại, search-status = `data-results-label`, q giữ, ghi nhận event; S6b route.abort → nhãn/status giữ, Try Again cập nhật status, focus không ở body; nojs: popover + "Show N products" GET giữ q và filter.
- ES1-T131 cổng `searchJs` mở (search-results có collection-filters.js). ES1-T110 contract vẫn khớp (giữ chuỗi `"collection-filter-count"`, `customElements.get("collection-filters")`).

## Tự kiểm tra

- `shopify theme check`: 0 lỗi (9 warning sẵn có ở quiz-step, index*.liquid, không thuộc PR).
- `wc -c assets/collection-filters.js`: 8 127 B.
- Locale: không đổi.
- Playwright, preview, Lighthouse (/search, /collections/all desktop + mobile): chờ CI.
- Không console.*, không fetch tự viết, không import tĩnh module theme khác.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
