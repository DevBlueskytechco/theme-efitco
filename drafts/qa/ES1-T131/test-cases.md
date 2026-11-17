KHÔNG CHẮC: (1) Spec chưa chạy (phiên viết không có preview, trình duyệt, node); kết quả thật lấy từ CI store-tests của PR. (2) Phần lớn phần code cần kiểm chưa merge vào develop (17/11): trang search ES1-T128 (PR #151, ai-review), JS lọc ES1-T110 + ES1-T380, tab/khám phá/trạng thái ES1-T377 + ES1-T378, recent ES1-T379 (Should). Spec bật từng nhóm theo file có trong repo (bảng "Cổng"); thiếu thì skip có lý do, `TE8_STRICT=1` thì fail. (3) Khoá TE8_* chưa có trong tests/e2e/store-data.json (ES1-T125 đã đóng, chưa ghi khoá): TE8_QUERY_NONE dùng mặc định CTO gợi ý `zzqx-no-result-te8`; TE8_QUERY_FILTER, TE8_QUERY_PAGED dùng `a` (như TE-1) và skip khi trang không có filter hoặc không đủ 2 trang; TE8_QUERY_ALL thiếu thì skip. (4) testid: ui-spec search.md §10 (`search-filter-toggle`, `search-sort`, `filter-drawer`) khác ES1-T128 (giữ `collection-filter-open`, `collection-sort`, `collection-filter-drawer`): spec nhận cả hai. Khối khám phá, popular searches, câu nhắc 1 ký tự, filter-note chưa có testid trong hợp đồng: spec dùng tên đề xuất, đã hỏi dev-fe ở ES1-T484. (5) Ticket (05/11) ghi "route.abort partial thì tải cả trang"; SRS 0.5 TE-8 AC8 S6b ghi alert "We couldn't update the results" + "Try Again", lưới cũ giữ. Theo CTO 11/11 (phần cũ trái bảng thì bỏ) spec kiểm theo SRS 0.5. (6) Popular searches trên store dev: fixture TE-17-R2-QA0 chưa có `popular_searches`; test cấu hình đọc env TE8_POPULAR_SEARCHES, thiếu thì skip.

# ES1-T131 — TE-8 Tìm kiếm predictive và trang kết quả

Nguồn: docs/srs.md#TE-8 (0.5: AC1, AC2, AC3, AC4, AC7, AC8 phần S2/S6a/S6b, AC10, AC11, AC12, AC13), docs/srs.md#TE-6 (AC6, AC10, AC12, AC14 dùng chung), docs/ui-spec/search.md §3, §6, §10, docs/ui-spec/predictive-search.md §2, §4, §6, §11, drafts/techlead/ES1-T307/task-split.md §3 dòng ES1-T131 và §6.7, ticket ES1-T131, ES1-T125 (dữ liệu), ES1-T124 #4, ES1-T104 #5. Figma: không có trang search (search.md §1, mọi phần là ĐỀ XUẤT đã chốt 10/11).

Spec: `tests/e2e/ES1-T131.spec.ts` (ticket chỉ định tên theo key ES1-T131 thay cho TE-8.spec.ts). Không trùng `tests/e2e/ES1-T130.spec.ts` (debounce, huỷ request, ↑↓ Enter Esc, nút xoá, lỗi tải module, trần byte): các TC dưới ghi "ES1-T130" ở cột Loại là đã có test ở file đó, spec này không viết lại.

Phạm vi theo §3 ES1-T307: thêm tab, popular searches (FD2), 0 kết quả, lỗi + retry, "Showing x–y of z", drawer lọc mọi mốc; recent searches chỉ khi TE-8-R2-BE3 không bị cắt; gộp dòng QA #4 ES1-T306 phần TE-8 AC2. Ngoài phạm vi (chỉ phủ phần liên quan): AC5 chỉ TC-50; AC6 chỉ phân trang, dòng Showing, lưới cột (TC-27, TC-28, TC-33); AC9, AC14 phần đã có ở ES1-T130.spec.ts + axe TC-04; kích thước overlay theo mốc, LCP overlay, bố cục Articles/Pages để task QA layout sau.

## Cổng (spec tự bật theo repo)

| Cổng | Điều kiện trong repo | Task |
| --- | --- | --- |
| searchPage | có `blocks/search-results.liquid` | ES1-T128 |
| searchJs | `blocks/search-results.liquid` nạp `collection-filters.js` và có `assets/collection-filters.js` | ES1-T110, ES1-T380 |
| tabs | snippet có `predictive-search-tabs`, JS có xử lý tab | ES1-T377, ES1-T378 |
| discover | snippet có `data-predictive-discover` | ES1-T377 |
| states | snippet có `predictive-search-error` và `predictive-search-empty`, JS nhắc tới 1 trong 2 | ES1-T377, ES1-T378 |
| recent | `assets/predictive-search.js` dùng `localStorage` | ES1-T379 (Should, cắt trước) |
| popularSetting | `config/settings_schema.json` có `popular_searches` | ES1-T377 |

## Test case

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | store dev, TE8_QUERY_ALL có product, collection, page, article | mở icon search, gõ từ khoá | 4 nhóm hiện; option product có ảnh (srcset width=64), tên, giá có số; ↓ rồi Enter mở đúng href của option | E2E | P1 |
| TC-02 | AC1, AC2 | trang chủ có JS | mở overlay, gõ từ khoá ≥ 2 ký tự, Enter khi chưa chọn option | sang /search, `q` giữ đúng, ô tìm của trang kết quả giữ từ khoá; 0 console error | E2E | P1 |
| TC-03 | AC9 | overlay mở | gõ 1 ký tự / gõ nhanh 3 ký tự / ↑↓ / Esc 2 bước / nút xoá / request cũ / 360 popup toàn màn / combobox | (cả AC1) đã phủ ở ES1-T130.spec.ts (không viết lại); kích thước overlay 768–1920 và LCP overlay (phần còn lại của AC9, AC14) ngoài phạm vi ES1-T131 | ES1-T130 | P1 |
| TC-04 | AC14 | overlay có list mở, có tab (mock) | axe trong dialog | 0 violation serious/critical (DoD, cả AC1, AC10) | a11y | P1 |
| TC-05 | AC10 | mock: 4 từ khoá, 8 sản phẩm, 2 collection, 0 page, 1 bài | gõ "bench" | `role="tablist"` có All + Products "8+" + Collections 2 + Articles 1; không tab Pages; All `aria-selected="true"` | E2E | P1 |
| TC-06 | AC10 | như TC-05 | bấm tab Products, rồi ←/→, Enter, Space | không request gợi ý mới; tab Products chỉ nhóm products, tới 8 option; nút chân "View all products for" href có `q=bench` và `type=product`; ←/→ đổi `aria-selected` | E2E | P1 |
| TC-07 | AC10 | đang chọn tab Collections | gõ tiếp, server còn collection; gõ tiếp, server 0 collection | tab Collections giữ; rồi về All | E2E | P2 |
| TC-08 | AC10 | như TC-05, tab All | đếm option mỗi nhóm | từ khoá ≤ 4, sản phẩm ≤ 4, collection ≤ 3, bài ≤ 3; từ khoá có `<mark>` hoặc phần đậm | E2E | P2 |
| TC-09 | AC10 | có nhóm Suggestions | bấm 1 từ khoá gợi ý | ô tìm = từ khoá đó, request gợi ý mới với `q` đó, URL trang không đổi | E2E | P2 |
| TC-10 | AC10 | mock có sản phẩm hết hàng | gõ | request có `resources[options][unavailable_products]=last`; option hết hàng có chữ "Sold out" | E2E | P3 |
| TC-11 | AC10 | mock như TC-05, viewport 360/768/1280/1920 | mở tab Products | lưới 2/4/5/5 cột (đếm vị trí x hàng đầu); trang không cuộn ngang | UI | P2 |
| TC-12 | AC4 | repo | đọc `config/settings_schema.json`, `blocks/header.liquid`, `blocks/search-results.liquid` | `popular_searches` kiểu text, default rỗng hoặc không có default; header, search-results không có setting cùng id | static | P1 |
| TC-13 | AC4 | store dev đã cấu hình 5 cụm (env TE8_POPULAR_SEARCHES) | mở overlay, ô trống | khối Popular searches có đúng các chip theo thứ tự, tối đa 5; mỗi chip `<a href>` tới /search?q={cụm}; cao 44 (40 từ 80rem) | E2E | P2 |
| TC-14 | AC4 | như TC-13, có JS | bấm chip trong overlay | chữ vào ô, có request gợi ý `q={cụm}`, URL không đổi | E2E | P2 |
| TC-15 | AC4 | như TC-13 | mở /search không `q` và /search?q=TE8_QUERY_NONE | khối Popular searches có cùng chip | E2E | P2 |
| TC-16 | AC4 | env cấu hình 6 cụm | mở overlay | chỉ 5 chip đầu | E2E | P3 |
| TC-17 | AC11 | overlay mở, ô trống | — | khối khám phá hiện; không tablist; không nút chân; mọi khối con đang hiện có ≥ 1 link (không khung rỗng khi merchant chưa chọn nguồn) | E2E | P1 |
| TC-18 | AC11 | overlay mở | gõ 1 ký tự | câu "Type at least 2 characters to see suggestions." hiện, id nằm trong `aria-describedby` của ô; 0 request gợi ý | E2E | P2 |
| TC-19 | AC11 | mock mọi nhóm 0 | gõ "zzqx" | không tablist; hộp `predictive-search-empty` chứa "No results for" + từ khoá; khối khám phá dưới hộp; nút chân "Shop All Products" tới /collections/all | E2E | P1 |
| TC-20 | AC11 | mock 0 sản phẩm, 2 bài | gõ | không tab Products; có dòng "No products match" + từ khoá | E2E | P2 |
| TC-21 | AC12 | mock lần đầu chậm 1,5 s | gõ "bench" | sau 200 ms: phần tử thân `aria-busy="true"`, status "Loading suggestions…", nút chân hiện, href có `q=bench`; khi về: hết `aria-busy` | E2E | P2 |
| TC-22 | AC12 | đã có kết quả "bench", request kế chậm | gõ thêm | kết quả cũ vẫn hiện tới khi có mới; sau đó chỉ kết quả mới | E2E | P2 |
| TC-23 | AC12 | mock 500 rồi abort | gõ | hộp `predictive-search-error` `role="alert"` "Suggestions are unavailable right now" + nút "Try Again"; bấm Try Again (server đã lành) thì có request mới và kết quả hiện, hộp lỗi ẩn; 0 console error ngoài log mạng do test gây | E2E | P1 |
| TC-24 | AC12 | mock chậm 6 s | gõ | sau ≤ 5 s + biên: hộp lỗi hiện; Enter vẫn mở /search?q | E2E | P2 |
| TC-25 | AC13 | cổng recent, localStorage sạch | submit 6 từ khoá khác nhau (1 từ lặp), mở overlay ô trống | khối recent có 5 chip, mới nhất đầu, không trùng; nút tên "Clear recent searches" xoá hết, khối ẩn | E2E | P3 |
| TC-26 | AC13 | cổng recent, localStorage ném lỗi | mở overlay, submit | không khối recent, 0 console error | E2E | P3 |
| TC-27 | AC2, AC6 | searchPage, TE8_QUERY_ALL | mở /search?q= | 1 h1; nhóm theo thứ tự Products → Articles → Pages (vị trí DOM); nhóm có h2; nhóm sản phẩm dùng `product-card` | E2E | P1 |
| TC-28 | AC2, AC6 | searchPage, từ khoá > 1 trang | mở trang 1 rồi Next | `<nav>` phân trang; dòng `pagination-summary` "Showing 1–y of z results", y − 1 + 1 = số kết quả trên trang; trang 2 bắt đầu y + 1; z khớp số ở dòng trạng thái | E2E | P1 |
| TC-29 | AC2 | /collections/all > 1 trang | mở | không có `pagination-summary` (dòng tóm tắt chỉ ở search) | E2E | P2 |
| TC-30 | AC2 | searchPage | mở /search?q=TE8_QUERY_NONE | dòng trạng thái "No results for"; `search-empty` có h2 "Nothing Matches" + từ khoá, link "Shop All Products" tới /collections/all; không lưới | E2E | P1 |
| TC-31 | AC2 | searchPage, q = `<img src=x onerror=alert(1)>` | mở | chữ hiện như văn bản, không thẻ img mới trong trang, 0 pageerror | E2E | P1 |
| TC-32 | AC2 | searchPage | axe trên /search có kết quả, 0 kết quả, drawer lọc mở | 0 serious/critical; 0 console error | a11y | P1 |
| TC-33 | AC6 | searchPage, viewport 360/768/1280/1920 | mở /search có kết quả | lưới sản phẩm 2/3/4/4 cột; không cuộn ngang | UI | P2 |
| TC-34 | AC2, AC7 | searchJs, trang có filter | mở drawer, tick 1 giá trị | không tải lại trang (0 navigation document); URL giữ `q`, `type`, thêm `filter.*` (replaceState); có request partial; dòng drawer "1 filter applied"; nút Filter có số 1 | E2E | P1 |
| TC-35 | AC2, AC7 | searchJs | đổi Sort | URL có `sort_by` mới, giữ `q`; không navigation; có request partial | E2E | P1 |
| TC-36 | AC2, AC7 | searchJs, filter có > 1 trang kết quả | tick filter, bấm Next | URL có `page=2` + `filter.*` + `q`; không navigation; focus nằm trong vùng kết quả / dòng trạng thái | E2E | P1 |
| TC-37 | AC2 | searchPage, filter + sort đang áp, > 1 trang | đọc href phân trang | mọi href (Next, số trang) giữ `filter.*`, `sort_by`, `q`, `type` (ES1-T104 #5) | E2E | P1 |
| TC-38 | AC7 | searchJs, 1 filter đang áp | bấm Clear all | mọi checkbox bỏ tick; URL giữ `q`, không còn `filter.*` | E2E | P1 |
| TC-39 | AC8 | searchJs | chặn request partial (route.abort), tick filter | `search-error` `role="alert"` "We couldn't update the results" + "Try Again"; số card cũ giữ; checkbox vẫn tick; bỏ chặn, bấm Try Again thì hết alert | E2E | P1 |
| TC-40 | AC2 | searchJs | tick filter, sort, sang trang | không có event `shopify:collection:update` (ES1-T110 chỉ dispatch khi có hook collection); ghi lại có hay không `shopify:search:update` | E2E | P2 |
| TC-41 | AC7 | searchPage, 1 filter áp qua URL | mở | dòng `search-filter-note` "Filters apply to products only…"; ghi lại nhóm Articles/Pages còn hay mất (so ES1-T124 #4) vào annotation | E2E | P2 |
| TC-42 | AC7 | searchPage, viewport 360/768/1280/1920 | bấm nút Filter | drawer trái rộng 324 (90%) ở 360, 420 từ 768 (±2); h2 "Filters"; nút đóng tên "Close filters"; dòng `role="status"`; Esc đóng, focus về nút Filter | UI | P1 |
| TC-43 | AC8 | searchPage | mở /search?q=…&type=product&filter.v.price.gte=99999999 | chip vẫn hiện; h3 "No Products Match These Filters" + "Clear All Filters" | E2E | P2 |
| TC-44 | AC3 | JS tắt | trang chủ bấm icon search | là link sang /search; submit form q ra kết quả có `q` | nojs | P1 |
| TC-45 | AC3 | JS tắt, trang có filter | mở drawer (popover), tick, bấm "Show N products" | URL có `filter.*`, giữ `q`; dòng drawer "1 filter applied" | nojs | P1 |
| TC-46 | AC3 | JS tắt | chọn Sort, bấm Apply | URL có `sort_by`, giữ `q` | nojs | P1 |
| TC-47 | AC3 | JS tắt, > 1 trang | bấm Next | URL `page=2`, giữ `q`; trang 2 có `pagination-current` = 2 | nojs | P1 |
| TC-48 | AC3 | JS tắt | /search?q=TE8_QUERY_NONE | `search-empty` hiện, link "Shop All Products" | nojs | P2 |
| TC-49 | AC3, AC4, AC13 | JS tắt | mở /search không `q` | chip popular (nếu cấu hình) là link chạy được; không khối recent | nojs | P3 |
| TC-50 | AC5 | searchPage, URL có `filter.*` và `sort_by` | đổi từ khoá trong form trang search rồi gửi | URL mới có `q` mới, không `filter.*`, không `sort_by`; `search-type-nav` có 4 link giữ `q`, đúng 1 link `aria-current="page"` | E2E | P2 |

## Case biên (ngoài AC)

| ID | Nhóm | Given | When | Then |
| --- | --- | --- | --- | --- |
| B-01 | tối đa | q dài 200 ký tự | mở /search?q= | không cuộn ngang ở 360, form giữ đủ chữ |
| B-02 | ký tự đặc biệt | q = `tạ & bench` | mở /search | chữ hiện đúng, không thấy `&amp;` |
| B-03 | trang vượt | /search?q=a&page=999 | mở | không trang trắng: có empty state hoặc link "Go to page 1" (TE-6 AC7) |
| B-04 | mất mạng | predictive, route.abort | gõ | như TC-23 |
| B-05 | 360 | Pixel 7 project chạy toàn bộ nhóm JS và nojs | — | như desktop |
| B-06 | keyboard | tab, Esc drawer | — | TC-06, TC-42 |
| B-07 | screen reader | live region | — | status `role="status"` (TC-21, TC-34), alert `role="alert"` (TC-23, TC-39) |
| B-08 | merchant chưa chọn resource | Popular collections, Trending products trống | ô trống | TC-17: không khung rỗng |
| B-09 | editor | `design_mode` | — | không kiểm: trang search không có hint editor riêng; theme editor nằm ngoài store-tests |

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))

| Khoá | Giá trị | Nguồn | Thiếu thì |
| --- | --- | --- | --- |
| TE8_QUERY_ALL | chưa có | ES1-T125 | TC-01, TC-27 skip |
| TE8_QUERY_PAGED | chưa có, dùng `a` | ES1-T125, TE-1 | TC-28, TC-47 skip nếu < 2 trang |
| TE8_QUERY_FILTER | chưa có, dùng `a` | ES1-T125, ES1-T105 #2 | TC-34..TC-43, TC-45 skip nếu không có filter |
| TE8_QUERY_NONE | `zzqx-no-result-te8` mặc định | ES1-T125 (CTO) | — |
| TE8_POPULAR_SEARCHES | chưa có (5 cụm Figma theo SRS AC4) | SRS TE-8 AC4, fixture TE-17-R2-QA0 | TC-13..TC-16, TC-49 skip |

Trạng thái rỗng, lỗi, đang tải của overlay dựng bằng `page.route` trên `/search/suggest.json`; lỗi refresh trang search bằng `route.abort` request partial; không gọi Cart API.

## KHÔNG CHẮC

- Xem dòng đầu file. Câu hỏi testid: ES1-T484 (dev-fe).
- ES1-T130.spec.ts test "lỗi abort/429: list ẩn, không retry" sẽ trái AC12 khi ES1-T378 merge (phải hiện hộp lỗi + Try Again): cần sửa cùng lượt ES1-T378.
