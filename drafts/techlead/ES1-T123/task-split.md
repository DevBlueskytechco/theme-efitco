KHÔNG CHẮC: (1) sandbox từ chối shopify.dev (curl 403, 05/11), chưa mở link nào; API predictive, event search, object search là hiểu biết chung và skill cart-variant-logic, chờ ES1-T124, chặn BE1; (2) D5 chọn JSON + clone template thay partial `search-suggestions` của docs/architecture.md, chờ ES1-T124 #2 xác nhận; (3) Figma không có search mở, dropdown, mobile, trang search: bố cục là mặc định kỹ thuật, ES1-T127; (4) sau khi mở search trên trang sản phẩm, JS đã tải vượt 40 KB, ADR 0006 không tính phần này, xem D8; (5) dữ liệu store chưa biết, ES1-T125; (6) chưa chạy gì trên store; trần 256 B của loader dựa trên bản nháp đo `wc -c` 255 B, chưa chạy thử, chỉ dư 1 B; đây là tài liệu chia task.

# ES1-T123 — Chia TE-8 Tìm kiếm predictive và trang kết quả thành task FE/BE

Nguồn: docs/srs.md#TE-8 (AC1–AC3; R4, R7), docs/figma-inventory.md hàng 1, DESIGN.md, docs/architecture.md, ADR 0001–0006, AGENTS.md, CONVENTION.md; ES1-T75, ES1-T91, ES1-T104, ES1-T109, ES1-T110; drafts/techlead/ES1-T103/task-split.md (nhánh feature/ai-ES1-T103), drafts/techlead/ES1-T89/task-split.md D10 (nhánh feature/ai-ES1-T89); skill cart-variant-logic; code: templates/search.liquid, blocks/header.liquid, snippets/product-card.liquid, assets/product-recommendations.js, tests/e2e/TE-1.spec.ts.
Ước lượng chốt TE-8: 13 point dev (FE 8, BE 5) + 1 task QA không point. SRS sơ bộ 8. Báo PO ở ES1-T126 #1, không đổi phạm vi.

## Lệch so với gợi ý trong ticket ES1-T123

| Gợi ý | Làm | Lý do |
| --- | --- | --- |
| Vùng partial gợi ý, `section_id` hoặc partial | JSON + clone `template` | D5. Không có section (AGENTS.md); partial tới `/search/suggest` chưa có nguồn nào nói chạy được |
| Icon search thành nút mở dialog | Giữ thẻ `a`, JS chặn click | D6. Không JS vẫn sang `/search`, TE-1 AC3 vẫn là link |
| Search dùng chung snippet filter | Dùng chung cả block `collection-filters` + JS | D4. Form, drawer, nút Apply nằm ở block, chỉ dùng chung snippet thì nhân đôi khoảng 50 dòng |
| BE riêng cho filter search | Không có task BE thứ 2, sửa nhỏ ES1-T110 khi chưa code | D4. Thêm khoảng 128 B, tách task sẽ dưới 3 pt |

## Quyết định kỹ thuật

D1 Composition trang search (FE1):
- `templates/search.liquid`: container `id: 'search-header'` gồm `h1` + form. Chỉ khi `search.performed`: container `id: 'search-main'` gồm thẻ `collection-filters` (`class="collection-layout"`, `data-results-partial="search-results"`) bọc block `collection-filters` + block `search-results`.
- Thẻ custom element nằm ở template vì bọc 2 block, giống TE-6 D1. `{% partial %}` chỉ đặt trong block (TE-6 D1).
- Form GET: input `q`, input ẩn `type` = `product,article,page`, input ẩn `options[prefix]` = `last`. Hai giá trị ẩn là mặc định, chờ ES1-T124 #4.
- AGENTS.md Theme map: FE ghi hàng cần thêm trong PR description, CTO hoặc Orchestrator áp (ES1-T91 #6).

D2 Nhóm và phân trang (FE1):
- Partial `search-results` bọc `{% paginate search.results by 24 %}`. Lọc theo `result.object_type` trong trang hiện tại, thứ tự product, article, page; nhóm rỗng không có tiêu đề.
- `search.results` là 1 danh sách trộn, không có số đếm riêng từng loại, nên phân nhóm chỉ đúng trong 1 trang. Không làm tab theo `type` vì tab sẽ cần bỏ loại khác khỏi kết quả. PO xác nhận ES1-T126 #2.
- Product: `snippets/product-card` (`heading_level: 'h3'`, `card_context: 'search'`). Thêm nhánh `search` vào `view_context` của card: ES1-T75 liệt kê context `search`, code hiện rơi về `collection`. `product-swatch.js` nạp ngoài partial.
- Article: ảnh nếu có, tiêu đề, trích đoạn. Page: tiêu đề, trích đoạn. Không dùng `highlight`, ngoài AC.
- `snippets/pagination.liquid` của ES1-T108. Bỏ `default_pagination` và CSS `.search-results .prev` cũ.

D3 Trạng thái và an toàn (FE1):
- 0 kết quả: thông báo + link `routes.all_products_collection_url`. Có filter và 0 kết quả: thông báo không khớp + link xoá filter, giữ `q`. Hiện cho khách vì là kết quả trang (lập luận TE-6 D3; ES1-T113 đang hỏi quy tắc này cho collection, trả lời khác thì sửa cả 2).
- Lỗi đang có: `templates/search.liquid` truyền `search.terms` thẳng vào 2 key đuôi `_html`. FE1 escape trước; ES1-T124 #5 xác nhận. Nếu Shopify đã escape thì sẽ thành escape 2 lần, DoD bắt bằng từ khoá có dấu và thương mại.

D4 Filter trang search dùng lại TE-6:
- FE1 thêm vào block `collection-filters`: param `filters`, `action_url`, `clear_url` (mặc định từ `collection`), đầu ra `{{ content }}` trong form để template truyền input ẩn. Hook `data-collection-*` chỉ render khi có `collection`. Tên block giữ nguyên vì đổi sẽ phá TE-6.
- Tách `snippets/sort-select.liquid`, `snippets/filter-count.liquid` từ ES1-T109. Nút mở drawer + partial `collection-filter-count` viết lại trong block `search-results` vì partial không đặt trong snippet; chấp nhận khoảng 5 dòng trùng.
- Testid JS bám vào giữ nguyên tên `collection-*`, `pagination-*` trên trang search (D9).
- ES1-T110 thêm khi code (đã comment): tên vùng kết quả từ `data-results-partial`; focus theo `data-results-label`; event `shopify:collection:update` chỉ khi form có `data-collection-handle`. FE1 chỉ `blocked_by` ES1-T108, ES1-T109, vì markup chạy được không JS. QA1 chờ ES1-T110, ES1-T111 và là nơi kiểm JS trên `/search`.

D5 Nguồn gợi ý: JSON + clone template (BE1):

| Lựa chọn | Ưu | Nhược | Kết luận |
| --- | --- | --- | --- |
| `section_id` + HTML | Mẫu chuẩn của Shopify | Cần section, AGENTS.md cấm | Loại |
| Partial `search-suggestions` trên `/search/suggest` | Liquid là nguồn duy nhất, đúng docs/architecture.md | Không có nguồn nói `/search/suggest` render template không section; `predictive_search` có thể chỉ có trong section | Loại, trừ khi ES1-T124 #2 nói chạy được |
| `?view=predictive` với object `search` | Dùng được partial | `search` không có collection, trái AC1 "từ predictive_search_url" | Loại |
| JSON + clone `template` | Đã có mẫu `product-recommendations.js`; không phụ thuộc `agentic_editor_enabled` | Định dạng tiền và ảnh ở client | Chọn |

- Tham số dự kiến theo skill cart-variant-logic, thêm `article` cho AC1: `q`, `resources[type]=product,collection,page,article`, `resources[limit]=4`. Tên trường JSON lấy từ ES1-T124 #1, không đoán.
- Không có partial ở predictive nên không có tên partial cho BE. docs/architecture.md dòng partial cần bỏ `search-suggestions`: Tech Lead sửa khi ES1-T124 #2 chốt.
- Chuỗi có giá trị động dùng chỗ giữ chỗ cố định: `{{ 'blocks.predictive_search.count' | t: number: '%n' }}`, `all` và `empty` dùng `terms: '%s'`. Liquid không plural được theo số ở client nên câu viết không cần plural.

D6 Mở dialog (FE2 markup, BE1 hành vi):
- Giữ thẻ `a` `header-search-link`. Chọn so với 2 phương án khác:

| Lựa chọn | Không JS | JS trên mọi trang | Kết luận |
| --- | --- | --- | --- |
| `button` + `dialog popover` | Mở được, cần form trong dialog | 0 B nhưng không biết lúc nào mở để nạp JS | Loại, đổi link thành nút trái TE-1 AC3 |
| `a` + chạy JS rồi mới mở dialog | Sang `/search` | Có độ trễ mạng trước khi mở | Loại |
| `a` + loader mở dialog ngay, nạp JS sau | Sang `/search` | Loader tối đa 256 B | Chọn |

- Loader mở dialog trước, nạp `predictive-search.js` sau. Khách gõ được ngay; import lỗi thì dialog vẫn là form GET. Module phải đọc giá trị input đã có khi kết nối.
- Delegate trên `window` để sống qua render lại của editor. Bỏ qua khi có Ctrl, Cmd, Shift.
- `showModal` cho focus trap, Esc, top layer, trả focus có sẵn. Input có `autofocus`. `dialog[scroll-lock]` đã có khoá cuộn ở `assets/critical.css`.
- Hệ quả: TE-1 TC-19 (click rồi chờ sang `/search`) sai sau BE1. BE1 sửa test: có JS thì mở dialog, JS tắt thì sang `/search`. FE2 chưa có `data-search-src` nên TC-19 vẫn pass.
- `data-search-src` và thẻ script do BE1 thêm cùng file JS, vì `asset_url` trỏ file chưa có có thể làm theme check báo lỗi.

D7 Combobox (FE2 markup, BE1 hành vi):
- Focus luôn ở input, dùng `aria-activedescendant`. Option là chính thẻ `a role="option" tabindex="-1"`: `li` chứa link trong listbox là lỗi axe `nested-interactive`.
- `div role="listbox"` > 4 `div role="group"` (products, collections, pages, articles, theo thứ tự AC1), mỗi nhóm `aria-labelledby` tiêu đề đã dịch > `data-predictive-options`. Cuối list là dòng `predictive-search-all`.
- Esc 2 bước, Enter không chọn thì submit: ES1-T126 #3, #5. Sản phẩm hết hàng: ES1-T126 #4.
- Lỗi mạng, 429: ẩn list, form vẫn submit. Không retry.
- Event: chờ ES1-T124 #3. Nếu có event cho đổi filter trên trang search thì Tech Lead tạo ticket riêng cho `collection-filters.js`, không gộp vào BE1 vì khác file và khác `blocked_by`.

D8 Ngân sách JS (ADR 0006, `wc -c` 05/11, trần theo task, tính cả `cart-items.js` như TE-5 D10):

| Trang | Thành phần | Tối đa (B) | Còn lại (B) |
| --- | --- | --- | --- |
| Sản phẩm | TE-5 D10 40 690 + loader 256 | 40 946 | 14 |
| Trang chủ | TE-5 D10 32 225 + loader 256 | 32 481 | 8 479 |
| Cart | TE-5 D10 19 158 + loader 256 | 19 414 | 21 546 |
| Collection | TE-6 D10 31 336 + loader 256 + collection-filters thêm 128 | 31 720 | 9 240 |
| Search | chung 9 430 + TE-5 9 728 + loader 256 + product-swatch 5 010 + collection-filters 7 296 | 31 720 | 9 240 |

- `predictive-search.js` tối đa 6 656 B, không thuộc bảng: nạp động sau click, không có trong thẻ script hay import tĩnh (định nghĩa ADR 0006).
- Sau khi mở search: trang search 38 376 B. Trang sản phẩm 47 602 B theo cách thận trọng, 41 970 B nếu bỏ `cart-items.js` nạp động. Vượt 40 960 B sau tương tác của khách; Lighthouse không đo phần này, ADR 0006 không cấm. Ghi rõ để CTO biết, không viết lại ADR.
- Trang sản phẩm chỉ còn 14 B theo cách thận trọng: TE-11..13 không đụng; task sau thêm JS toàn trang phải gỡ bớt.

D9 Hợp đồng FE → BE/QA (đổi tên phải comment ticket):
- Partial: `search-results` (mới); `collection-filters`, `collection-filter-count` (TE-6). Predictive: không có.
- Custom element: `predictive-search` (mới, FE2 render thẻ trong dialog, file `assets/predictive-search.js`, BE1 định nghĩa); `collection-filters` (TE-6, FE1 render thẻ trong template).
- Hook predictive: trên link `data-search-src` (BE1); trên `predictive-search`: `data-url`, `data-money-format`, `data-label-count`, `data-label-empty`, `data-label-all`; `data-predictive-group`, `data-predictive-options`, `data-predictive-template` (`product`, `link`). Dialog là phần tử liền sau link.
- Hook trang search: `data-results-partial` (thẻ `collection-filters`), `data-results-label` (root trong partial).
- FE1 (14 mới): `search-title`, `search-form`, `search-input`, `search-submit`, `search-results`, `search-results-toolbar`, `search-results-count`, `search-results-group` (`data-object-type`), `search-results-group-heading`, `search-results-product`, `search-results-article`, `search-results-page`, `search-results-empty`, `search-results-empty-cta`.
- FE1 dùng lại: `collection-status`, `collection-sort`, `collection-sort-apply`, `collection-filter-*`, `collection-empty-clear`, `pagination-*`.
- FE2 (11 mới): `predictive-search`, `predictive-search-dialog`, `predictive-search-close`, `predictive-search-form`, `predictive-search-input`, `predictive-search-submit`, `predictive-search-listbox`, `predictive-search-group`, `predictive-search-option`, `predictive-search-all`, `predictive-search-status`. Giữ `header-search-link`.

D10 Test và dữ liệu:
- Dev viết `tests/e2e/{key}.spec.ts`, tên test bắt đầu mã AC. dev-fe bị scope-guard chặn ghi tests/ thì nộp ở drafts, Orchestrator chép (như ES1-T94). QA1 gộp vào `tests/e2e/TE-8.spec.ts`.
- Từ khoá trong `tests/e2e/store-data.json`: `TE8_QUERY_ALL`, `TE8_QUERY_PAGED`, `TE8_QUERY_FILTER`, `TE8_QUERY_NONE` (ES1-T125). Thiếu thì skip có lý do. TE-1 đang dùng `q=a`.
- lhci không có URL search; NFR-1 chỉ yêu cầu home, product, collection nên không thêm. Trang search kiểm bằng axe. Loader đi vào cả 3 URL CI nên lhci vẫn là cổng cho BE1.

## Bảng task

| Mã | Ticket | Phía | Pt | Tên | Giải pháp | DoD | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TE-8-FE1 | ES1-T128 | FE | 5 | templates/search + blocks/search-results + blocks/collection-filters + 2 snippet sort-select, filter-count + product-card + base.css + locales: nhóm theo object_type, paginate 24, filter + sort dùng chung TE-6, 0 kết quả, không JS, 14 data-testid | D1, D2, D3, D4, D9 | `shopify theme check` 0; `npx playwright test tests/e2e/ES1-T128.spec.ts -g "AC2\|AC3\|nojs"` pass desktop + Pixel 7; q chứa thẻ HTML hiển thị như chữ; TE-1, TE-3, ES1-T108, ES1-T109 pass; axe 0 serious; lhci từ 96/90/98; ảnh 360/768/1280 | ES1-T108, ES1-T109 |
| TE-8-FE2 | ES1-T129 | FE | 3 | blocks/header + snippets/predictive-search + base.css + locales: dialog sau link search, form GET, input combobox, 4 nhóm listbox, 2 template, full màn dưới 48rem, 11 data-testid | D6, D7, D9 | theme check 0; critical.css không đổi; `npx playwright test tests/e2e/ES1-T129.spec.ts -g "AC1-markup\|AC3"` pass; JS tắt link sang /search; TE-1 pass; axe 0 serious kể cả option mẫu; lhci từ 96/90/98, CLS không đổi; ảnh 360/768/1280 | — |
| TE-8-BE1 | ES1-T130 | BE | 5 | assets/search-loader.js + assets/predictive-search.js + thẻ script trong blocks/header + TE-1 TC-19: 1 custom element, nạp khi click, debounce 300ms, từ 2 ký tự, JSON + clone template, combobox, AbortController, trần 256 B và 6656 B | D5, D6, D7, D8, D9 | `wc -c` tối đa 256 và 6656; `npx playwright test tests/e2e/ES1-T130.spec.ts -g "AC1"` pass (không tải JS trước click, 1 request sau 300ms, huỷ request cũ, bàn phím, Esc 2 bước, abort và 429 không lỗi); TE-1, ES1-T129 pass; axe 0 serious; lhci từ 96/90/98; bảng D8 trong PR | ES1-T124, FE2 |
| TE-8-QA1 | ES1-T131 | QA (e2e_from_story) | — | tests/e2e/TE-8.spec.ts + drafts/qa/ES1-T131/test-cases.md, AC1–AC3, filter trang search, desktop + Pixel 7, nhóm nojs | D4, D9, D10 | `npx playwright test tests/e2e/TE-8.spec.ts` pass desktop + Pixel 7; mỗi AC có test chạy hoặc skip có lý do; axe 0 serious; 0 console error; TE-1, TE-3, TE-6 pass | ES1-T110, ES1-T111, FE1, FE2, BE1 |

Ghi chú: `\|` trong bảng là `|`; lệnh nguyên văn xem body ticket con. lhci = `npx lhci autorun` (desktop từ 96, mobile từ 90, accessibility từ 98).

Ánh xạ AC: AC1 FE2 (khung, mobile full màn) + BE1 (gợi ý, bàn phím) · AC2 FE1 (nhóm, phân trang, filter, 0 kết quả) + ES1-T110, ES1-T111 (lọc không reload) · AC3 FE1 + FE2 (form GET, link).
Thứ tự: FE2 → BE1 (chờ ES1-T124) độc lập với FE1. ES1-T108 → ES1-T109 → FE1. ES1-T110, ES1-T111 → QA1. FE1, FE2 cùng sửa base.css và locales nhưng thêm khối riêng, conflict nhỏ, có thể song song.

## Nguồn API

CTO đã tra trong ticket, dùng được:
- Partials `fetch`, `apply`; context `search` của `standard_event_data`: https://shopify.dev/docs/storefronts/themes/architecture/partials, https://shopify.dev/docs/api/storefront-events-and-actions/events/product-view (ES1-T75)
- `paginate` by 1–250, tham số filter theo `param_name`, giá tiền chính và cents: https://shopify.dev/docs/api/liquid/tags/paginate, https://shopify.dev/docs/storefronts/themes/navigation-search/filtering/storefront-filtering (ES1-T104)
- `shopify:collection:update` dispatch từ form filter của collection: https://shopify.dev/docs/api/storefront-events-and-actions/events/collection-update (ES1-T104)

Chưa mở được (403), CTO xác nhận ở ES1-T124:
- Predictive search Ajax: https://shopify.dev/docs/api/ajax/reference/predictive-search — chặn BE1
- Object `predictive_search`: https://shopify.dev/docs/api/liquid/objects/predictive_search — chặn BE1
- Event chuẩn cho search: https://shopify.dev/docs/api/storefront-events-and-actions/events — chặn BE1
- Object `search` (`filters`, `sort_options`, `sort_by`, `default_sort_by`, `types`, `terms`, `performed`, `results_count`), `result.object_type`: https://shopify.dev/docs/api/liquid/objects/search — không chặn, FE1 có mặc định, DoD kiểm trên preview
- Escape tham số `t` với key `_html`: https://shopify.dev/docs/storefronts/themes/architecture/locales/storefront-locale-files — không chặn

Web platform (`showModal`, `autofocus` trong dialog, dynamic import cross-origin) không thuộc shopify.dev, kiểm bằng DoD FE2, BE1.

## Câu hỏi

- ES1-T124 (CTO): API. Chặn BE1.
- ES1-T125 (CTO): dữ liệu store. Không chặn.
- ES1-T126 (PO): ước lượng, phân nhóm, Esc, hết hàng, Enter. Không chặn, có mặc định.
- ES1-T127 (Designer): bố cục thiếu Figma. Không chặn, có mặc định.

Ngoài phạm vi: gợi ý `queries`, tab theo loại, highlight từ khoá, lịch sử tìm kiếm, tài liệu merchant block mới (TE-10 AC5).
