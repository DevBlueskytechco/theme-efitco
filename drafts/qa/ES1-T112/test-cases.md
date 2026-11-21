KHÔNG CHẮC: (1) spec chưa chạy trên preview (phiên QA không có PREVIEW_URL/STORE_PASSWORD, lệnh env và ac_coverage.py ngoài worktree cần quyền); kết quả thật lấy từ CI e2e trên PR, chưa báo đạt. (2) Tên file theo key ES1-T112 (Orchestrator + CONVENTION.md mục Test `tests/e2e/<ticket>.spec.ts`), tiêu đề ticket ghi `tests/e2e/TE-6.spec.ts`. (3) Phạm vi theo bảng §3 ES1-T307 dòng ES1-T112 (CTO 11/11): TE-6 AC1–AC7 SRS 0.4 + phần 0.5 mà AC1, AC4, AC5 trỏ tới và quan sát được (AC10 focus/Esc/scrim, AC14 empty state, AC15 list-collections). AC8, AC9, AC11–AC13 đo kích thước đã có ở tests/e2e/ES1-T365.spec.ts, ES1-T366.spec.ts (dev), không viết trùng. (4) AC14 0.5 "request lỗi → alert role=alert + Try Again, lưới cũ giữ" và "chờ > 300 ms → skeleton + aria-busy trên lưới" mâu thuẫn ticket này ("route.abort partial thì tải cả trang") và assets/collection-filters.js hiện tại (`location.assign` khi lỗi, không clone `template[data-collection-skeleton]`): test giữ theo ticket, hỏi Tech Lead ở ES1-T525. (5) testid nút tắt: code dùng `pagination-previous-disabled`/`pagination-next-disabled`, pagination.md §10 ghi "giữ data-testid cũ"; test nhận cả hai.

# ES1-T112 — TE-6 Trang collection: lọc, sắp xếp, phân trang + list-collections
Nguồn: docs/srs.md#TE-6 (AC1–AC7 bản 0.4, phần 0.5 của AC1/AC4/AC5 → AC10, AC14, AC15), mục 3 (Hết hàng; collection mobile 2 cột), docs/ui-spec/pagination.md §3, §4, §7, docs/ui-spec/collection.md, docs/ui-spec/list-collections.md, drafts/techlead/ES1-T307/task-split.md §3 dòng ES1-T112, ticket ES1-T112 (comment CTO 06/11 ngân sách JS, dev-fe 13/11 hook phân trang). Figma: collection không có node riêng (ui-spec ghi), không so ảnh.
Spec: tests/e2e/ES1-T112.spec.ts (gộp ES1-T108, ES1-T109, ES1-T110 theo ticket; ES1-T111 gộp vào T110 theo §3). Chạy: `PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T112.spec.ts` (project desktop + mobile Pixel 7).
Mốc: 360, 768, 1280, 1920 đổi bằng setViewportSize trong test (cả 2 project); nojs = `javaScriptEnabled: false` (NFR-4).

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | collection có sản phẩm (TE6_COLLECTION_HANDLE, thiếu thì /collections/all) | mở trang | HTTP 200; đúng 1 h1 = tên collection (`page-title-heading` trong `collection-banner`); 0 console error, 0 pageerror; axe 0 serious/critical trong `main` | E2E/a11y | P1 |
| TC-02 | AC1 | collection có ảnh (TE6_IMAGE_COLLECTION_HANDLE) | mở trang | ảnh banner `loading=eager`, `fetchpriority=high`, `object-fit: cover`, URL không `crop=`; có `style` thì là `object-position` (focal); đúng 1 mô tả hiện; mọi ảnh card lazy | E2E/perf | P2 |
| TC-03 | AC1 | collection không ảnh | mở trang | `columns_desktop` card đầu eager, còn lại lazy (card thiếu ảnh bỏ qua) | E2E/perf | P3 |
| TC-04 | AC1 | collection có sản phẩm, default "Columns on desktop" 3, "Columns on mobile" 2 | xem ở 360, 768, 1280, 1920 | số cột lưới 2 / 3 / 3 / 3; ≤ 24 card; mỗi `collection-product` chứa đúng 1 `product-card` (TE-3) có tiêu đề h2; số kết quả không rỗng và bằng `data-results-label`; không cuộn ngang ở mọi mốc | E2E | P1 |
| TC-05 | AC1 | preview chỉ có giá trị default của setting cột | đổi `--columns` 2/4 ở 1280, 1920 và `--columns-mobile` 1 ở 360 trên DOM | lưới ra đúng 2/4 cột và 1 cột (CSS chạy theo setting); ảnh chụp đổi setting thật trong editor là bằng chứng tay | E2E | P3 |
| TC-06 | AC1, mục 3 | collection có sản phẩm hết hàng (sort created-descending, tối đa 5 trang) | duyệt trang | card hết hàng vẫn hiện, có badge `product-card-badge-sold-out` chữ không rỗng | E2E | P2 |
| TC-07 | AC1, AC14 (0.5) | collection 0 sản phẩm (TE6_EMPTY_COLLECTION_HANDLE) | mở trang | khối `collection-empty` h2 "No Products Here Yet", nút "Shop All Products" → `/collections/all`, link "Browse collections" → `/collections`; không lưới, không phân trang, toolbar ẩn (không Filter, không Sort); axe sạch | E2E/a11y | P2 |
| TC-08 | AC2 | collection có filter (Search and Discovery) | xem markup ở 1280 | form `method=get` `action` = đường dẫn collection; mỗi nhóm `<details open>` có `data-filter-param` `filter.*`; mỗi giá trị `<label>` chứa checkbox `name` `filter.*`, value không rỗng; đếm 0 chưa chọn thì `disabled` | E2E | P2 |
| TC-09 | AC2 | collection có filter kiểu swatch | xem ở 1280 | chấm ≥ 24 × 24, input vẫn là checkbox | E2E | P3 |
| TC-10 | AC2 | collection có filter giá | xem ở 1280 | 2 input number có label thật, `min=0`, `step=any`, `max` = range_max, name `filter.v.price.gte/lte` | E2E | P3 |
| TC-11 | AC2 | có JS, collection có filter | tick 1 giá trị (request giữ 400 ms) | `<collection-filters>` có `aria-busy=true` trong lúc chờ rồi gỡ; URL có `name=value`, không `page`; không điều hướng (mốc window còn); request là fetch cùng pathname (partial); giá trị vẫn tick; "Clear all" hiện; live region `collection-status` = `data-results-label` (có số) | E2E | P1 |
| TC-12 | AC2 | có JS, đã áp 1 filter | bấm "Clear all" trong form | URL không còn `filter.*`, 0 input tick, badge mất, không điều hướng | E2E | P2 |
| TC-13 | AC2 | có JS, request partial chậm 1 s | tick A, tick B, bỏ A liên tiếp | ≥ 2 request cũ bị huỷ; URL và ô tick chỉ còn B (kết quả cuối) | E2E | P1 |
| TC-14 | AC2 | URL do JS tạo sau khi lọc | mở thẳng URL đó (tải trang) | cùng số kết quả, cùng thứ tự link card, cùng số ô tick | E2E | P2 |
| TC-15 | AC2 | có JS, partial bị `route.abort` | tick 1 giá trị | trang tải lại cả trang tới URL có filter (mốc window mất), giá trị tick đúng; 0 pageerror | E2E (lỗi mạng) | P1 |
| TC-16 | AC2, AC4 | `collection-filters.js` bị `route.abort`, 360 | bấm Filter, tick 1 giá trị, bấm "Show N products"; mở lại, bấm × | drawer mở như popover gốc; submit GET tới URL có filter; × đóng được; 0 pageerror | E2E (lỗi mạng) | P1 |
| TC-17 | AC2 | có JS, filter giá, 360 | điền Max = nửa range_max, bấm "Show N products" | URL có `filter.v.price.lte`; giá thấp nhất của 3 card đầu (đọc qua fetch trong trang, support/product-data.ts) ≤ Max khi market có `Shopify.currency.rate` = 1 | E2E | P2 |
| TC-18 | AC2 | có JS, đã lọc | quét axe | 0 serious/critical trong `main` | a11y | P1 |
| TC-19 | AC2 | không JS, 1280, có filter | tick 1 giá trị, bấm Apply | URL có tham số, số kết quả không tăng, giá trị tick giữ; "Clear all" về URL không query, 0 tick | E2E nojs | P1 |
| TC-20 | AC2 | không JS, có filter giá | điền min 0, max nửa range, Apply | URL có 2 tham số giá, ô max giữ giá trị, số kết quả không tăng | E2E nojs | P2 |
| TC-21 | AC2, AC14 (0.5) | không JS, TE6_FILTER_NO_RESULT_QUERY | mở URL lọc ra 0 | `collection-empty` h2 "No Matching Products", nút "Clear filters" về URL không filter, không link "Browse collections" | E2E nojs | P2 |
| TC-22 | AC3 | URL không có `sort_by` | mở trang | select `sort_by` có label thật "Sort by", ≥ 2 lựa chọn, đúng 1 option `selected`; thứ tự card giống hệt khi mở `?sort_by=<option selected>` (sort chọn sẵn = `collection.default_sort_by`, không theo theme setting, ES1-T106 #1) | E2E | P1 |
| TC-23 | AC3 | URL có `?sort_by=X` | mở trang | select hiện X | E2E | P2 |
| TC-24 | AC3 | có JS, đã áp 1 filter (nếu có) | đổi Sort (ưu tiên price) | URL `sort_by` cập nhật, thứ tự card đổi, filter giữ, không điều hướng, không nút "Apply sort" | E2E | P1 |
| TC-25 | AC3 | không JS | chọn sort khác, bấm "Apply sort"; rồi lọc + sort | URL có `sort_by`, select giữ giá trị; filter đang áp vẫn trong URL | E2E nojs | P1 |
| TC-26 | AC4 | 360 và 768 (dưới 64rem), có filter | xem toolbar | nút Filter hiện, cao ≥ 44; drawer ẩn; form không nằm trong luồng trang | E2E | P1 |
| TC-27 | AC4 | 1280 và 1920 | xem trang | form là cột trái (tĩnh), không nút Filter, không nút đóng; mép phải form ≤ mép trái lưới; axe sạch | E2E | P2 |
| TC-28 | AC4, AC10 (0.5) | có JS, 360 | Tab tới nút Filter, nhấn Enter | drawer là `dialog:modal` (không còn `popover`), `html[data-layer-open]`; focus vào h2 "Filters" (aria-labelledby); axe 0 serious trong drawer | E2E/a11y/keyboard | P1 |
| TC-29 | AC4 | drawer đang mở | nhấn Tab 30 lần | không phần tử ngoài drawer nhận focus | keyboard | P1 |
| TC-30 | AC4 | drawer đang mở | nhấn Esc; mở lại và chạm scrim; mở lại và bấm × | drawer đóng, focus về nút Filter, `html[data-layer-open]` gỡ | keyboard | P1 |
| TC-31 | AC4 | có JS, 360 | tick 1 giá trị trong drawer | drawer vẫn mở; badge "1", nút Filter có tên chứa "1 filter applied"; nút chân "Show N products" có N = số kết quả; bấm nút đó: drawer đóng, không request mới, focus về nút Filter | E2E | P1 |
| TC-32 | AC4 | không JS, 360 | bấm Filter, bấm ×; bấm Filter, tick, bấm "Show N products" | drawer mở/đóng bằng popover; sau submit badge "1", tên nút có "1"; drawer đóng (trang mới) | E2E nojs | P1 |
| TC-33 | AC4 | không JS, 360, filter giá | tick 1 giá trị + điền max, submit | badge "2" | E2E nojs | P3 |
| TC-34 | AC4 | collection không có filter | xem ở 360 | không nút Filter, drawer ẩn, Sort vẫn gắn form | E2E | P3 |
| TC-35 | AC5, AC15 (0.5) | /collections | mở trang | HTTP 200; breadcrumb (`breadcrumb-current` "Collections"); đúng 1 h1 "Collections" + meta "{n} collections" (n = số card khi 1 trang); ≤ 24 card; mỗi card: ảnh hoặc ô placeholder tỉ lệ 336:220, h2 tên, dòng "{n} product(s)", đúng 1 link `/collections/…`; 0 console error; axe sạch | E2E/a11y | P1 |
| TC-36 | AC5, AC15 (0.5) | /collections | xem ở 360, 768, 1280, 1920 | lưới 2 / 3 / 4 / 4 cột; không cuộn ngang | E2E | P2 |
| TC-37 | AC5, AC15 (0.5) | /collections | xem `loading` ảnh | 4 card đầu eager, chỉ card 1 `fetchpriority=high`, card sau lazy | perf | P3 |
| TC-38 | AC5, AC6 | /collections | đếm card | < 24 card thì không `pagination`; > 24 thì Next là link `?page=2` | E2E | P2 |
| TC-39 | AC5 | không JS | bấm giữa card | tới trang collection (h1 hiện) | E2E nojs | P2 |
| TC-40 | AC6 | /collections/all (> 24 sản phẩm), ở 1280 | mở trang 1 | `<nav>` tên "Pagination"; Previous là `span[role=link][aria-disabled=true]` không `href`, `tabIndex` -1, opacity 0.35, vẫn hiện; Next là link tên "Next page" `?page=2`, 52 × 52; trang hiện tại `aria-current=page` không là link, text "1"; số trang hiện, "Page X of Y" ẩn | E2E/a11y | P1 |
| TC-41 | AC6 | /collections/all, 360 và 768 | mở trang 1 | 360: số trang ẩn, `pagination-status` "Page 1 of N" hiện; 768: số trang hiện (vùng chạm ≥ 44), status ẩn; 1920 như 1280 | E2E | P1 |
| TC-42 | AC6 | /collections/all trang cuối (`?page=N`) | mở | Next là span tắt (`aria-disabled`, không href), Previous là link "Previous page" | E2E | P2 |
| TC-43 | AC6 | trang 1 và trang 2 | so vị trí nút Previous | hộp nút Previous (tắt ở trang 1, link ở trang 2) cùng x, y, rộng, cao (±1 px, giữ chỗ CLS 0) | E2E | P2 |
| TC-44 | AC6 | có JS | bấm Next | URL `page=2` đúng href, không điều hướng, lưới đổi, current "2", focus vào vùng kết quả (`collection-results`/`collection-count`), vùng kết quả trong viewport, sort giữ | E2E | P1 |
| TC-45 | AC6 | có JS, đã lọc ra > 24 | bấm Next | filter giữ trong URL và ô tick | E2E | P2 |
| TC-46 | AC6 | không JS | bấm Next | trang 2 tải bằng link thường, current "2", có card | E2E nojs | P1 |
| TC-47 | AC6 | collection ≤ 24 sản phẩm hoặc list-collections 1 trang | mở | không render `pagination` | E2E | P2 |
| TC-48 | AC6 | trang 2 | quét axe trong `pagination` | 0 serious/critical | a11y | P2 |
| TC-49 | AC7 | /collections/all?page=9999 | mở (có JS và không JS) | HTTP 200; `collection-page-empty` h2 "No Products on This Page", nút "Go to page 1" tới URL trang 1 của collection; không lưới, không phân trang; bấm nút → có card; axe sạch | E2E | P1 |
| TC-50 | AC7 | /collections?page=9999 | mở | HTTP 200; h1 "Collections"; có link "Go to page 1" tới /collections (trang 1) — dự kiến đỏ, xem bugs/BUG-ES1-T112-01.md và KHÔNG CHẮC #6 | E2E | P3 |
| TC-51 | AC2 (contract) | repo | đọc file | 3 tên partial `collection-products`, `collection-filters`, `collection-filter-count` có trong JS và Liquid; `collection-filters.js` ≤ 8 192 B; script nằm ngoài partial; không `pushState`; `customElements.get` trước define | tĩnh | P2 |
| TC-52 | AC4 (contract) | trang fixture không store | mở drawer, bấm "Show N products" khi đã áp / chưa áp, ×, Esc | đã áp: chỉ đóng, 0 fetch; chưa áp: fetch đúng 1 lần rồi đóng, URL `?filter.v.a=1`; focus về nút Filter; trang không drawer: 0 pageerror | tĩnh | P2 |
| TC-53 | NFR (CTO 06/11) | /collections/all và collection chính, có JS | tải trang, cuộn hết | tổng transferSize JS theme `/assets/*.js` lúc tải ≤ 40 960 B, sau cuộn ≤ 65 536 B | perf | P2 |

## Case biên (ngoài AC)
- Rỗng: TC-07 (collection 0 sản phẩm), TC-21 (lọc ra 0), TC-49 (`?page=` vượt), list-collections 0 collection: không dựng được trên store dev (14 collection) → không test, chỉ kiểm tĩnh ở ES1-T365 TC-06.
- Tối đa: ≤ 24 card mỗi trang (TC-04, TC-35); trang cuối (TC-42); `?page=9999` (TC-49, TC-50).
- Mất mạng: TC-15 (partial abort → tải cả trang), TC-16 (JS abort → popover + form GET), TC-13 (đổi nhanh, request cũ huỷ).
- 360px: TC-04, TC-16, TC-26, TC-28–TC-33, TC-36, TC-41; không cuộn ngang (TC-04, TC-36).
- Keyboard: TC-28 (Enter mở, focus tiêu đề), TC-29 (Tab không thoát drawer), TC-30 (Esc, scrim, ×; focus về nút Filter), TC-40 (nút tắt không vào thứ tự Tab).
- Screen reader: live region `collection-status` có số sau lọc (TC-11), tên nút Filter có "N filter(s) applied" (TC-31), `aria-current` trang hiện tại, tên `<nav>` (TC-40), `aria-disabled` (TC-40, TC-42), axe ở collection có hàng, rỗng, sau lọc, drawer mở, list-collections, `?page=` vượt.
- Editor (`design_mode`) vs storefront: block dùng ngoài template collection chỉ hiện gợi ý trong editor — không dựng được qua Playwright storefront, kiểm tay trong editor (ghi vào báo cáo).
- Merchant chưa chọn resource: collection không filter (Search and Discovery tắt) → TC-34; collection không ảnh → TC-03.
- Console: mọi test đi qua `watchStore` (0 console error, 0 pageerror; bỏ qua script nền tảng Shopify, 429, Cloudflare; test abort mạng cho phép log "Failed to load resource").
- Hồi quy /collections/all: `npx playwright test tests/e2e/TE-3.spec.ts tests/e2e/TE-1.spec.ts` (DoD ticket) — chạy trên CI cùng PR.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
Đọc qua tests/e2e/support/store-data.ts (env trước, rồi tests/e2e/store-data.json):
| Biến | Giá trị hiện tại | Dùng ở | Thiếu thì |
| --- | --- | --- | --- |
| TE6_COLLECTION_HANDLE | te6-filter | TC-01, TC-04, TC-05, TC-08–TC-34 | /collections/all |
| TE6_EMPTY_COLLECTION_HANDLE | te6-empty | TC-07 | skip "Thiếu TE6_EMPTY_COLLECTION_HANDLE (ES1-T105 #4)" |
| TE6_IMAGE_COLLECTION_HANDLE | te6-image | TC-02 | skip "Thiếu TE6_IMAGE_COLLECTION_HANDLE (ES1-T105 #5)" |
| TE6_FILTER_NO_RESULT_QUERY | filter.v.price.gte=5000 | TC-21 | skip "Thiếu TE6_FILTER_NO_RESULT_QUERY (ES1-T105 #3)" |
- /collections/all: 2 065 sản phẩm (ES1-T417) → luôn > 24, dùng cho mọi test phân trang (TC-40–TC-46, TC-49).
- /collections: 14 collection (pagination.md §6) → TC-47 kiểm "không phân trang"; TC-38 nhánh > 24 skip.
- Sản phẩm hết hàng: TE4 hết hàng toàn bộ, tìm theo `sort_by=created-descending` (ES1-T417).

Skip có lý do dữ liệu (không tính là fail, mỗi AC vẫn có test chạy không skip):
| Test | Điều kiện skip | AC vẫn có test chạy |
| --- | --- | --- |
| TC-02 | thiếu TE6_IMAGE_COLLECTION_HANDLE | AC1: TC-01, TC-04 |
| TC-03 | collection chính có ảnh banner | AC1: TC-01 |
| TC-06 | không thấy hết hàng trong 5 trang | AC1: TC-01 |
| TC-07 | thiếu TE6_EMPTY_COLLECTION_HANDLE | AC1: TC-01 |
| TC-08–TC-21, TC-26–TC-33 | trang không có `collection-filter-group` (Search and Discovery tắt) | AC2: TC-51, TC-52 tĩnh; AC4: TC-34 |
| TC-09 | không filter swatch | AC2: TC-08 |
| TC-10, TC-17, TC-20, TC-33 | không filter giá | AC2: TC-08, TC-11 |
| TC-13 | < 2 giá trị lọc | AC2: TC-11 |
| TC-17 (so giá) | `Shopify.currency.rate` ≠ 1 (runner ở market khác) | AC2: URL vẫn kiểm |
| TC-21 | thiếu TE6_FILTER_NO_RESULT_QUERY | AC2: TC-19 |
| TC-24 | < 2 sản phẩm | AC3: TC-22 |
| TC-38 nhánh > 24 | store ≤ 24 collection | AC5: TC-35 |
| TC-45 | kết quả lọc ≤ 24 | AC6: TC-44 |

## Truy vết AC → TC
| AC | TC |
| --- | --- |
| AC1 | TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-07 |
| AC2 | TC-08–TC-21, TC-51 |
| AC3 | TC-22–TC-25 |
| AC4 | TC-16, TC-26–TC-34, TC-52 |
| AC5 | TC-35–TC-39 |
| AC6 | TC-38, TC-40–TC-48 |
| AC7 | TC-49, TC-50 |

## KHÔNG CHẮC
1. Spec chưa chạy (xem dòng đầu). Hồi quy TE-1, TE-3 chưa chạy.
2. AC14 0.5 (skeleton > 300 ms, alert lỗi + Try Again) trái ticket (lỗi → tải cả trang) và chưa có trong collection-filters.js; TC-15 giữ theo ticket. Hỏi Tech Lead ES1-T525.
3. AC8–AC13 chưa có TC trong file này (đo ở ES1-T365, ES1-T366 của dev); cần chủ QA cho phần đó.
4. TC-22 suy ra `default_sort_by` từ thứ tự card (không đọc được admin); câu "theo setting" đã chốt ở SRS AC3 (PO 06/11, ES1-T106): không setting theme.
5. TC-17: Shopify lọc giá theo tiền nào khi market khác tiền shop chưa rõ (ES1-T104 #2 ghi đơn vị chính của shop) → chỉ so khi rate = 1.
6. TC-50: AC7 nêu chung "danh sách" (AC6 kể cả list-collections), templates/list-collections.liquid chưa có nhánh `?page=` vượt (chỉ "No Collections Yet" khi `paginate.items == 0`, mà `paginate.items` là tổng) → trang vượt ra lưới rỗng, không "Go to page 1". Test viết theo Then đầy đủ; bug nháp drafts/qa/ES1-T112/bugs/BUG-ES1-T112-01.md (P3), tạo ticket khi CI đỏ và Tech Lead xác nhận phạm vi.
8. Đã chạy: `npx playwright test -c drafts/qa/ES1-T112/pw-static.config.ts -g contract` → TC-51 pass desktop + mobile; TC-52 không chạy được (sandbox phiên QA chặn khởi động Chromium). `npx playwright test tests/e2e/ES1-T112.spec.ts --list`: 110 test (55 × 2 project), biên dịch đạt.
7. ES1-T108/T109/T110.spec.ts đã gộp vào ES1-T112.spec.ts và xoá (ticket "Gộp spec dev ES1-T108..ES1-T111 thành 1 file"); test ES1-T110 "swatch trên card đổi ảnh" bỏ vì swatch card là chỉ báo `aria-hidden` (TE-3 AC2 0.3).
