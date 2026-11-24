KHÔNG CHẮC: (1) markup mới theo predictive-search.md §11 làm đỏ assert cũ của tests/e2e/ES1-T129.spec.ts và ES1-T130.spec.ts (4 nhóm → 5, 2 template → 3, "View all" ra khỏi listbox, listbox không tự cuộn); đã hỏi Tech Lead ở ES1-T563, mặc định QA ES1-T131 cập nhật. (2) Chưa đo được gzip base.css: sandbox chặn gzip/node/python; raw base.css 263 435 → 281 786 B (+18 351 B raw), collection.css 27 962 → 28 305 B, cần CI/Orchestrator đo theo ADR 0013 (trần 49 152 B gzip). (3) Predictive Search API không trả số sản phẩm của collection: slot `data-predictive-meta` có sẵn, BE bỏ khi rỗng. (4) Trending dùng lại `snippets/product-card` (show_swatches false) thay card "rút gọn" §2.5: rating badge vẫn hiện nếu sản phẩm có metafield rating.

# ES1-T377 TE-8-R2-FE1: predictive search (tab, gợi ý từ khoá, card, khám phá, trạng thái) + theme setting Popular searches (FD2)

Story TE-8, AC1, AC4 (FD2); markup + CSS cho AC9–AC14 để BE1/BE3 bám. Spec: docs/ui-spec/predictive-search.md §2–§11, foundation §24.1, search.md S1/S2.

## Thay đổi

- `config/settings_schema.json`: nhóm mới "Search" (`t:general.search`), setting `popular_searches` (text, không default → theme mới cài trống, ES1-T308 #1). Không có setting cùng tên ở header block hay block `search-results` (AC4).
- `snippets/popular-searches.liquid` (mới): đọc `settings.popular_searches`, tách dấu phẩy, bỏ cụm rỗng, tối đa 5 cụm; rỗng thì không render gì. Chip là `<a href="{{ routes.search_url }}?q=…">` (chạy không JS) + `data-predictive-query` cho JS điền ô. Dùng ở overlay (h3), trang search S1 và S2 (h2).
- `templates/search.liquid`: S1 (chưa có `q`) render Popular searches dưới đầu trang.
- `blocks/search-results.liquid`: S2 (0 kết quả) render Popular searches dưới empty state.
- `blocks/header.liquid`: thêm setting `popular_collections` (collection_list, limit 4) và `trending_products` (collection), truyền vào snippet; doc cập nhật.
- `snippets/predictive-search.liquid`:
  - tablist `predictive-search-tabs` (5 tab `data-predictive-tab` all/products/collections/articles/pages, `[data-predictive-count]`, roving tabindex, `hidden` tới khi có kết quả), thân là `role="tabpanel"` `#PredictiveSearchPanel` (phần duy nhất cuộn).
  - nhóm `queries` + `template[data-predictive-template="query"]` (phần đã gõ trong `<mark>` 400, phần thêm 600); thứ tự nhóm Suggestions → Products → Collections → Articles → Pages (§2.5).
  - template product: media 1:1 cream, badge `-N%` (`.product-card__badge` sale), giá + giá gạch + nhãn ẩn Sale/Regular, "Sold out" bằng chữ; option `data-on-sale`, `data-unavailable` (ảnh 0.6). Template link: icon lưới/trang theo nhóm, ảnh bài 64 × 48, `data-predictive-meta`.
  - câu nhắc < 2 ký tự `#PredictiveSearchHint`, spinner trong ô, skeleton, hộp 0 kết quả `predictive-search-empty`, alert lỗi `predictive-search-error` (empty-state kind error, nút `data-retry`).
  - khối khám phá `data-predictive-discover` ngoài listbox: Recent (`data-predictive-recent`, hidden, template chip), Popular searches, Popular collections (tên + "N products"), Trending now (4 product-card, ảnh lazy trong dialog đóng), dòng "No products match".
  - chân: `role="status"` + nút primary `predictive-search-all` (ra khỏi listbox, nhãn trong `data-predictive-all-label` + mũi tên).
  - root thêm `data-label-products`, `data-label-shop-all`, `data-shop-all-url`, `data-label-loading`, `data-label-sale-price`, `data-label-regular-price`.
- `snippets/status-icon.liquid`: icon `grid`.
- CSS tách 2 file (CTO 23/11, ADR 0014 mục 8 tầng 5 overlay nạp lười). `assets/base.css` giữ phần vẽ đầu khi mở: vỏ dialog popup / drawer, thanh ô tìm (logo, form, nút xoá, spinner, nút đóng), guard `[hidden]`, thân cuộn + skeleton, status ẩn, 2 rule hiện / ẩn nút "View all" theo listbox. Chip `.search-chip` / `.popular-searches` chỉ dùng ở trang search và lớp search: bản trang search ở `collection.css`, bản trong lớp (`.predictive-search .search-chip`) ở `predictive-search.css`. `assets/predictive-search.css` (mới, 3 072 B gzip ≤ 8 192): phần còn lại — trạng thái thuần CSS (ô trống → khám phá hiện, không tab/nút chân; listbox hiện → nút chân hiện, chạy cả với predictive-search.js hiện tại); tab Figma 1:490 cao 44 / 40 từ 80rem, bắt đầu cột 4 ở popup 1280; bố cục tab All 1 cột / 3|5 / 3|9 + 4 card; tab Products lưới 2/4/5 (`data-tab="products"`); khám phá 1 cột / 3|5 / 3|9, trending 2/4; chân sticky (status ẩn mắt < 48rem và ở drawer); chip `.search-chip` 44 / 40 từ 80rem; fade 150ms + hover trong `prefers-reduced-motion: no-preference`. Chỉ token, logical properties, không z-index.
- Hợp đồng nạp cho BE ES1-T378: `data-stylesheet="{{ 'predictive-search.css' | asset_url }}"` trên `<predictive-search>`; lần mở / hover / focus đầu thêm 1 `<link rel="stylesheet">` vào `<head>` (không preload, không lặp cùng href), giữ skeleton tới `load` (lỗi vẫn hiện) rồi hiện kết quả / khám phá — giống `<quick-view>` PR #301. Chưa có JS nạp: nội dung còn `[hidden]`, khối khám phá chưa hiện, popup không vỡ.
- `assets/collection.css`: khoảng cách khối Popular searches ở trang search (S1, S2).
- `locales/en.default.json`: `blocks.predictive_search.*` thêm 16 key theo §7 (placeholder mới, `all` có ngoặc kép); `search.popular_searches` (một key dùng chung overlay + trang search thay `blocks.predictive_search.popular_searches` để snippet dùng chung). `locales/en.default.schema.json`: label + info 3 setting.

Không file JS trong diff.

## Hợp đồng cho BE (TE-8-R2-BE1, BE3) — ghi trong `{% doc %}` snippet

- Bật/tắt bằng `[hidden]`: tablist, tab, hint (+ `aria-describedby` trên input), spinner, skeleton, empty, error, discover, recent, no-products, nút chân.
- `data-tab="<key>"` trên `<predictive-search>` (không có = all); cập nhật `aria-labelledby` của tabpanel.
- `[data-predictive-terms]` trong hộp 0 kết quả / lỗi / no-products: điền textContent.
- Nút chân: đổi chữ `data-predictive-all-label` (giữ mũi tên), href; 0 kết quả dùng `data-label-shop-all` + `data-shop-all-url`.
- srcset ảnh sản phẩm tới 480 (card 213–250 px); `sizes` đã là `auto, (min-width: 80rem) 250px, 64px` (popup).
- predictive-search.js hiện tại vẫn chạy: nhóm queries rỗng thì ẩn, nút chân hiện bằng CSS; nó ghi đè textContent nút chân (mất mũi tên) tới khi BE1 sửa.

## Test id mới

predictive-search-tabs, predictive-search-tab, predictive-search-body, predictive-search-hint, predictive-search-skeleton, predictive-search-empty(-heading), predictive-search-error(-heading, -button), predictive-search-discover, predictive-search-recent, predictive-search-popular(-chip), predictive-search-popular-collections, predictive-search-trending, search-popular(-chip).

## Tự kiểm tra

- `shopify theme check`: 0 lỗi; 9 warning có sẵn ở templates/index*.liquid (UnrecognizedBlockArguments), không file nào của PR. `.theme-check.yml` không đổi.
- Locale JSON: không trùng key (gộp vào `blocks.predictive_search`, `search`, `labels`, `info`).
- `wc -c assets/critical.css` 10 082 (không đổi). Node zlib.gzipSync (sau merge develop): base.css 38 841 (develop 38 607, +234 cho vỏ + skeleton), trang chủ base + 5 file tầng 4 = 57 258 ≤ 57 344, predictive-search.css 3 072 ≤ 8 192, collection.css 5 549 ≤ 16 384.
- Spec: ES1-T565 thêm kiểm tầng 5 (trần, data-stylesheet, không stylesheet_tag, không prelude trùng; quick-view.css khi có); ES1-T129 `fillListbox` nạp CSS theo đúng hợp đồng BE trước khi đo; ES1-T131 cổng `css` (ES1-T378) cho test tab và popular searches.
- Không literal màu/bo góc/font (TE-1 TC-02), không `left/right/top/bottom`, không `z-index` số.
- Setting mới không default; theme mới cài: overlay và trang search không có khối Popular searches; header không chọn collection → không khối Popular collections/Trending (khám phá không có khung rỗng).
- Lighthouse, Playwright (ES1-T129, ES1-T130, ES1-T131, smoke), ảnh 360/768/1280/1920, axe khi mở overlay: chờ CI sau khi Orchestrator push. Dự kiến đỏ ở ES1-T129/T130 các case nêu ở ES1-T563.
- LCP: dialog đóng (`display: none`), mọi ảnh trong overlay lazy → không ảnh nào tải khi chưa mở (AC14).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
