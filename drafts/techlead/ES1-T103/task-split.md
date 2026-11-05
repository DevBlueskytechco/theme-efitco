KHÔNG CHẮC: (1) phiên này bị sandbox từ chối shopify.dev (403), chưa mở được link nào, nên yêu cầu "trích dẫn shopify.dev" của ES1-T103 mới đạt một phần; API chia 3 nhóm ở mục "Nguồn API", CTO xác nhận phần còn thiếu ở ES1-T104, FE2 bị chặn bởi ticket này; (2) AC3 "sort mặc định theo setting" không làm được phía server theo hiểu biết hiện tại (chưa kiểm doc) → đề xuất dùng `collection.default_sort_by`, không thêm setting, PO chốt ở ES1-T106 #1; (3) Figma không có trang collection → bố cục ở D2, D3, D4, D6 là mặc định kỹ thuật, Designer xác nhận ở ES1-T107; (4) `dialog` có thuộc tính `popover` rồi nâng lên `showModal` (D6) chưa chạy thử, nhóm E2E chỉ có Chromium → DoD FE2, BE2 là cổng chặn, có phương án dự phòng trong D6; (5) dữ liệu store (từ 25 sản phẩm, filter đã bật, swatch) chưa biết có trên hoa-qua-nhap-khau → ES1-T105, thiếu thì test skip có lý do; (6) chưa có lệnh nào chạy trên store, đây là tài liệu chia task.

# ES1-T103 — Chia TE-6 Trang collection: lọc, sắp xếp, phân trang thành task FE/BE

Nguồn: docs/srs.md#TE-6 (AC1–AC5, mục 3; R4, R7), docs/figma-inventory.md (không có trang collection), DESIGN.md, docs/architecture.md, ADR 0001–0006, AGENTS.md, CONVENTION.md, ES1-T75, ES1-T100, ES1-T101; drafts/techlead/ES1-T89/task-split.md (nhánh feature/ai-ES1-T89); code: templates/collection.liquid, templates/list-collections.liquid, blocks/featured-collection.liquid, snippets/product-card.liquid, snippets/image.liquid, assets/product-variant-picker.js, assets/header-menu.js.
Ước lượng chốt TE-6: 18 point dev (FE 10, BE 8) + 1 task QA không point. SRS sơ bộ 10 point chưa tính drawer, 3 kiểu filter và list-collections. Báo PO ở ES1-T106 #2, không đổi phạm vi.

## Lệch so với gợi ý trong ticket ES1-T103

| Gợi ý | Làm | Lý do |
| --- | --- | --- |
| `templates/collection.json`, `list-collections.json` | Sửa `templates/collection.liquid`, `templates/list-collections.liquid` | AGENTS.md cấm JSON template, AGENTS.md thắng ticket |
| Sort mặc định theo setting | Không có setting, dùng `collection.default_sort_by` | D5, chờ PO ES1-T106 #1 |
| 2 partial `collection-products`, `collection-filters` | Thêm partial thứ 3 `collection-filter-count` | Badge nằm trong nút mở, ngoài 2 vùng kia; D7 |
| Tái dùng header-drawer (dialog, focus trap) | Không tái dùng | Drawer header là `details`, nội dung bị ẩn khi đóng, không làm cột trái desktop được; mẫu showModal nằm ở TE-5 D7; D6 |
| Tái dùng `tests/e2e/support/product-data.ts` | QA1 `blocked_by` ES1-T100 | File chỉ có trên nhánh ES1-T100, PR #82 chưa merge |

## Quyết định kỹ thuật

D1 Composition:
- 3 block mới: `collection-banner`, `collection-filters`, `collection-products`. 2 snippet mới: `pagination`, `filter-group`.
- `templates/collection.liquid`: container `id: 'collection-banner'` → block `collection-banner`. Container `id: 'collection-main'` → thẻ `collection-filters` viết trực tiếp trong template (`class="collection-layout"`) → block `collection-filters` + block `collection-products`. Custom element nằm ở template vì phải bọc cả 2 block, mà block không gọi được block.
- Từ 64rem `collection-layout` là lưới 3/12 + 9/12. Dưới 64rem 1 cột, filter trong drawer.
- `{% partial %}` chỉ đặt trong block, không đặt trong snippet (giống TE-5 D1).
- AGENTS.md (Theme map) bắt buộc cập nhật cùng thay đổi nhưng scope-guard chặn agent ghi → FE ghi hàng cần thêm trong PR description, CTO hoặc Orchestrator áp (như ES1-T91 #6).

D2 Banner (FE1):
- `h1` `collection.title`, `collection.description`, `collection.image`. Chỉ dùng `collection.image`, không dùng `featured_image`, để không lấy ảnh sản phẩm làm banner.
- Render qua `snippets/image.liquid` KHÔNG truyền `crop`; cắt bằng CSS `object-fit: cover`. Lý do: `image_tag` tự áp focal point bằng `object-position` (doc `focal_point`), crop server sẽ làm mất tác dụng.
- Có ảnh: `loading: 'eager'`, `fetchpriority: 'high'` vì là LCP. Mặc định tỉ lệ 16/5 từ 48rem, 4/3 dưới 48rem (ES1-T107 #1). 0 settings.

D3 Lưới, phân trang, rỗng (FE1):
- Block `collection-products`: `columns_desktop` (select 2/3/4, default 4), `columns_mobile` (select 1/2, default 2; SRS mục 3). Dưới 48rem theo mobile, từ 48rem tối đa 3 cột, từ 80rem theo desktop. Giá trị xuất ra `--columns`, `--columns-mobile` trên root.
- Partial `collection-products` bọc `{% paginate collection.products by 24 %}`: số kết quả, lưới, pagination, rỗng. Root trong partial có `data-results-label` (chuỗi đã dịch).
- Card: nhánh `item.product` giống `blocks/featured-collection.liquid` (TE-3 AC8), `heading_level: 'h2'` vì trang không có h2 khác. Hết hàng: badge Sold out đã có trong card (SRS mục 3), không cần thêm.
- `product-swatch.js` nạp ngoài partial và luôn nạp, vì lưới có thể đổi từ rỗng sang có hàng.
- Ảnh: có banner thì mọi card lazy. Không banner thì hàng đầu eager theo `columns_desktop` (giữ lý do LCP trong template hiện tại), còn lại lazy.
- Rỗng (`paginate.items` là 0): thông báo cho khách ngoài cả editor. Quy tắc AGENTS.md "ngoài storefront render nothing" áp cho block thiếu cấu hình; đây là kết quả trang, AC1 yêu cầu thông báo. Không có filter đang áp: CTA `routes.all_products_collection_url`. Có filter đang áp (FE2): thông báo không khớp + link Clear. Tránh `all_products_count` để bớt 1 API chưa kiểm.
- `snippets/pagination.liquid`: Previous, các `part` (`is_link`, `title`, `url`), Next, `aria-current="page"`, chỉ render khi `paginate.pages` lớn hơn 1. Thay `default_pagination` vì filter đó không cho gắn testid và hook.

D4 list-collections (FE1, gộp vì dưới 3 pt nếu tách, dùng chung `pagination`):
- Markup trực tiếp trong template (AGENTS.md: markup 1 trang không cần thêm tầng). `h1`, `{% paginate collections by 24 %}` (ES1-T104 #5, ES1-T106 #5), card `featured_image` tỉ lệ 336/270 (DESIGN.md), thiếu ảnh dùng `placeholder_svg_tag`, title, pagination.
- Xoá `style="--grid-gap: 10px"` và `--collection-card-size: 280px` (literal, vi phạm "No hardcoded design values"). Lưới 2/3/4 cột theo 48rem, 80rem.

D5 Form filter và sort (FE2, chạy không JS, NFR-4):
- Form `id="collection-filter-form"` `method="get"` `action="{{ collection.url }}"`, ngoài partial để giữ listener. Partial `collection-filters` bọc các nhóm filter bên trong form.
- `snippets/filter-group.liquid` nhận `filter`, không đọc `collection`, để TE-8 AC2 dùng lại với filter của search.
- Rẽ theo `filter.type`, không rẽ theo tên: `boolean` (`true_value`, `false_value`), `list` (`values`), `price_range` (`min_value`, `max_value`, `range_max`). Availability, vendor, product type, option đều đi qua 3 nhánh này theo cấu hình Search and Discovery. Không hard code tên tham số: dùng `param_name` + `value`.
- `filter.presentation`: swatch dùng `value.swatch.color` hoặc `value.swatch.image`; image dùng `value.image`; còn lại chữ. Không dùng `value.display` (deprecated trong doc).
- Input checkbox native + label + `count`; `count` 0 và chưa `active` thì `disabled`. Mỗi nhóm là `details` mở sẵn, `data-filter-param`.
- Sort: `select name="sort_by"` ở thanh công cụ, gắn form bằng thuộc tính `form`, ngoài partial. Option từ `collection.sort_options` (`name`, `value`). `selected` theo `collection.sort_by`, không có thì `collection.default_sort_by`. Nút Apply của sort trong `noscript`.
- Sort mặc định: không thêm setting. Liquid không đặt được thứ tự toàn collection từ theme setting: `sort_by` là tham số URL, filter `sort` chỉ sắp trong 1 trang nên sai khi phân trang. Làm bằng JS phải tải lần 2 sau khi vào trang, không chạy khi tắt JS (NFR-4), tốn LCP và CLS. Chờ PO ES1-T106 #1.
- Không có filter (`collection.filters` rỗng): vẫn render form để sort chạy, ẩn drawer và nút mở.
- Không làm thẻ tóm tắt filter đang áp (ngoài AC, ES1-T106 #4). Link Clear all `collection.url`, chỉ hiện khi có filter đang áp.

D6 Drawer (FE2 markup, BE2 nâng cấp):
- Chọn: `dialog popover` + nút `popovertarget`.

| Lựa chọn | Không JS / script lỗi | Cột trái desktop | Focus trap | Kết luận |
| --- | --- | --- | --- | --- |
| `details` như header | Chạy | Không được, nội dung ẩn khi đóng | JS tự viết | Loại |
| `dialog` + `showModal` như cart drawer | Không mở được; phải hiện form trong luồng rồi JS ẩn đi, gây CLS | Được, CSS đè display | Native | Loại |
| `dialog popover`, JS nâng lên `showModal` | Chạy, popover native | Được, CSS đè display | Native khi có JS | Chọn |

- Từ 64rem CSS đè `display: block; position: static`, ẩn nút mở và nút đóng. `base.css` là stylesheet chặn render nên không nháy.
- Dialog ngoài partial, nếu không `apply` làm mất trạng thái mở (giống TE-5 D2).
- Nút mở chứa partial `collection-filter-count`. Số badge = tổng `active_values.size` + 1 nếu `price_range` có `min_value.value` hoặc `max_value.value`.
- Dự phòng nếu DoD FE2/BE2 cho thấy `dialog` không kết hợp được `popover` trên trình duyệt trong NFR-5: `div popover` + lớp phủ, BE2 gắn `inert` cho phần còn lại. Comment ES1-T103, không tự đổi sang `@media (scripting: none)`.
- Rủi ro chấp nhận: trình duyệt quá cũ không có popover và tắt JS thì không mở được drawer, sort và lưới vẫn dùng được.

D7 URL và vùng cập nhật (BE1):
- 3 partial trong 1 request để luôn đồng bộ (AGENTS.md): `collection-products`, `collection-filters`, `collection-filter-count`.
- `history.replaceState` theo AGENTS.md mục JavaScript và skill `cart-variant-logic`. Không `pushState`: gợi ý "history" trong ticket không đủ để đổi quy tắc. Hệ quả ghi ở ES1-T106 #3.
- Không JS: form GET và link `part.url` thường. Đọc state lại từ URL do server render nên deep link đúng sẵn.

D8 Luồng BE1 (`assets/collection-filters.js`):
- Delegate trên thẻ `collection-filters`, ngoài partial. URL từ `FormData` của form trên `location.pathname`, bỏ giá trị rỗng, không giữ `page`. Link dùng `href` server render, không tự ghép.
- Sau `apply` đồng bộ tay vì `apply` giữ form value (AGENTS.md): `checked = defaultChecked`, `value = defaultValue`, select sort theo URL. Thiếu bước này Clear all vẫn để checkbox tick, đây là lỗi dễ sót nhất của task.
- `replaceState` sau khi fetch thành công. Khôi phục `details` theo `data-filter-param`. `aria-busy` gỡ trong `finally`. Copy `data-results-label` vào `collection-status`, nằm ngoài partial nên trình đọc màn hình đọc được.
- Lỗi không phải abort: `location.assign(url)`. Phân trang: cuộn và focus về `collection-products`, tôn trọng `prefers-reduced-motion`. Đổi filter: không đổi focus.

D9 BE2 (cùng file, chạy sau BE1):
- Drawer: chặn popover, `showModal`, trả focus khi event `close`, đóng khi lên 64rem, `shopify:block:select` trong editor.
- Giá: debounce 400 ms, Enter áp ngay, min lớn hơn max thì không fetch + `setCustomValidity` với `data-label-price-invalid`. Đơn vị theo ES1-T104 #2.

D10 Ngân sách JS (ADR 0006, `wc -c` ngày 05/11, tính cả `cart-items.js` nạp động như TE-5 D10):

| Trang collection | Tối đa (B) |
| --- | --- |
| Chung: header-menu 6 862, header-sticky 1 680, standard-events 888 | 9 430 |
| TE-5 mọi trang: cart-drawer 4 096, cart-items 5 632 | 9 728 |
| product-swatch | 5 010 |
| collection-filters: BE1 5 120 → BE2 7 168 | 7 168 |
| Tổng | 31 336 |
| Còn lại trên 40 960 | 9 624 |

Không đụng trang sản phẩm (còn 270 B) và trang chủ (còn 8 735 B): `collection-filters.js` chỉ nạp từ block `collection-filters`.

D11 Hợp đồng FE → BE/QA (đổi tên phải comment ticket):
- Tên partial (3): `collection-products`, `collection-filters`, `collection-filter-count`.
- Custom element (1, FE render thẻ trong template): `collection-filters`, file `assets/collection-filters.js` (khớp docs/architecture.md). Thuộc tính: `data-enhanced` (BE gắn, CSS ẩn nút Apply), `data-label-price-invalid`, `aria-busy` (BE).
- Hook: `data-results-label` (root trong partial `collection-products`), `data-filter-param` (nhóm filter), form `id="collection-filter-form"`, dialog `id="collection-filter-drawer"`.
- FE1 (19): banner `collection-banner`, `collection-banner-title`, `collection-banner-description`, `collection-banner-image`; lưới `collection-products` (giữ nguyên, TE-3.spec.ts, ES1-T73.spec.ts đang dùng), `collection-results`, `collection-count`, `collection-grid`, `collection-product` (giữ nguyên), `collection-empty`, `collection-empty-cta`; phân trang `pagination`, `pagination-previous`, `pagination-next`, `pagination-page`, `pagination-current`; danh sách `list-collections`, `list-collections-card`, `list-collections-card-title`.
- FE2 (19): thanh công cụ `collection-toolbar`, `collection-filter-open`, `collection-filter-count`, `collection-sort`, `collection-sort-apply`, `collection-status` (`role=status`); filter `collection-filters`, `collection-filter-form`, `collection-filter-drawer`, `collection-filter-close`, `collection-filter-group`, `collection-filter-option`, `collection-filter-input`, `collection-filter-swatch`, `collection-filter-price-min`, `collection-filter-price-max`, `collection-filter-apply`, `collection-filter-clear`; rỗng do lọc `collection-empty-clear`.

D12 Test và dữ liệu:
- Dev viết `tests/e2e/{key}.spec.ts`, tên test bắt đầu mã AC. dev-fe bị scope-guard chặn ghi tests/ thì nộp ở drafts, Orchestrator chép (như ES1-T94). QA1 gộp vào `tests/e2e/TE-6.spec.ts`.
- Handle trong `tests/e2e/store-data.json` qua `support/store-data.ts`, không cần sửa ci.yml: `TE6_COLLECTION_HANDLE`, `TE6_EMPTY_COLLECTION_HANDLE`, `TE6_IMAGE_COLLECTION_HANDLE`, `TE6_FILTER_NO_RESULT_QUERY` (ES1-T105). Thiếu → dùng `/collections/all`, test cần filter skip có lý do.
- Preview không có giá trị block setting (settings_data rỗng) nên chỉ thấy default 4/2 cột. QA flip `--columns` trên DOM để kiểm CSS, đổi setting thật là bằng chứng tay.
- lhci: `vars.BENCH_COLLECTION` trong ci.yml đã có, trỏ tới `TE6_COLLECTION_HANDLE` (ES1-T105 #7).
- Hồi quy: TE-1, TE-3, ES1-T73, smoke đều đi qua `/collections/all`; paginate đổi từ 20 sang 24 không ảnh hưởng vì các spec duyệt theo `?page=`.

## Bảng task

| Mã | Ticket | Phía | Pt | Tên | Giải pháp | DoD | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TE-6-FE1 | ES1-T108 | FE | 5 | templates/collection.liquid + templates/list-collections.liquid + 2 block collection-banner, collection-products + snippets/pagination.liquid + assets/base.css + locales: 2 settings cột, paginate 24, partial collection-products, rỗng, 19 data-testid | D1, D2, D3, D4, D11 | `shopify theme check` 0; `npx playwright test tests/e2e/ES1-T108.spec.ts -g "AC1\|AC5\|nojs"` pass desktop + Pixel 7; TE-3, ES1-T73, smoke pass; không có templates/*.json; axe 0 serious; lhci từ 96/90/98; ảnh 360/768/1280 | — |
| TE-6-FE2 | ES1-T109 | FE | 5 | blocks/collection-filters.liquid + snippets/filter-group.liquid + blocks/collection-products.liquid + templates/collection.liquid + assets/base.css + locales: form GET 3 kiểu filter + swatch, sort, drawer dialog popover, badge, 2 partial, 19 data-testid | D5, D6, D7, D11 | theme check 0; `npx playwright test tests/e2e/ES1-T109.spec.ts -g "AC2-markup\|AC3-markup\|AC4-markup\|nojs"` pass; JS tắt: filter, giá, sort, drawer 360 chạy đủ; ES1-T108, TE-3 pass; axe 0 serious cả drawer mở; lhci từ 96/90/98, CLS không đổi so với FE1 | ES1-T104, FE1 |
| TE-6-BE1 | ES1-T110 | BE | 5 | assets/collection-filters.js + thẻ script trong blocks/collection-filters.liquid: 1 custom element, áp filter, sort, phân trang qua 3 partial, replaceState, AbortController, aria-busy, live region, tối đa 5120 B | D7, D8, D10, D11 | `wc -c` tối đa 5120; `npx playwright test tests/e2e/ES1-T110.spec.ts -g "AC1\|AC2\|AC3"` pass (không navigate, Clear all bỏ tick, đổi nhanh chỉ còn kết quả cuối, abort → tải cả trang, swatch vẫn chạy sau apply); 0 console error; axe 0 serious sau apply; lhci từ 96/90/98 | FE1, FE2 |
| TE-6-BE2 | ES1-T111 | BE | 3 | assets/collection-filters.js: nâng drawer lên showModal, trả focus, đóng khi lên desktop, input giá debounce + kiểm min max, trần 7168 B | D6, D9, D10, D11 | `wc -c` tối đa 7168; `npx playwright test tests/e2e/ES1-T111.spec.ts -g "AC2-price\|AC4"` pass (Tab không thoát, Esc đóng, focus về nút mở, abort script → popover vẫn chạy, min lớn hơn max không gửi request); ES1-T110 pass; axe 0 serious; lhci từ 96/90/98 | BE1 |
| TE-6-QA1 | ES1-T112 | QA (e2e_from_story) | — | tests/e2e/TE-6.spec.ts + drafts/qa/ES1-T112/test-cases.md, AC1–AC5, desktop + Pixel 7, nhóm nojs | D11, D12 | `npx playwright test tests/e2e/TE-6.spec.ts` pass desktop + Pixel 7; mỗi AC có test chạy hoặc skip có lý do dữ liệu; axe 0 serious; 0 console error; TE-1, TE-3 pass | ES1-T100, FE1, FE2, BE1, BE2 |

Ghi chú: `\|` trong bảng là `|`; lệnh nguyên văn xem body ticket con. lhci = `npx lhci autorun` (desktop từ 96, mobile từ 90, accessibility từ 98). Hai sửa nhỏ nằm ở comment ticket: ES1-T108 (selector CSS cũ), ES1-T109 (`data-label-price-invalid` thay `data-label-error`).

Ánh xạ AC: AC1 FE1 (banner, lưới, paginate 24, rỗng) + BE1 (phân trang không reload) · AC2 FE2 (form, 3 kiểu filter, swatch, không JS) + FE1 (vùng partial) + BE1 (URL, partial) + BE2 (giá) · AC3 FE2 (select, default) + BE1 · AC4 FE2 (drawer, badge) + BE2 (bàn phím) · AC5 FE1.
Thứ tự: FE1 → FE2 (chờ ES1-T104) → BE1 → BE2 → QA1 (chờ ES1-T100). FE1, FE2 cùng sửa `blocks/collection-products.liquid`, `base.css`, locales nên chạy lần lượt; BE1, BE2 cùng file nên chạy lần lượt.

## Nguồn API

Doc đã đọc: dữ liệu `dist/data/objects.json` kèm Shopify CLI 4.9.5 cài trên máy (đúng bản CI ghim, ES1-T32), chép từ doc Liquid. Đọc được 1 lần rồi các lần đọc file ngoài repo sau đó bị chặn, nên dừng, không vòng. Link là link doc tương ứng, chưa mở:
- `filter`: `param_name`, `label`, `operator`, `type`, `active_values`, `inactive_values`, `values`, `false_value`, `true_value`, `max_value`, `min_value`, `range_max`, `url_to_remove`, `presentation` — https://shopify.dev/docs/api/liquid/objects/filter
- `filter_value`: `param_name`, `value`, `active`, `count`, `label`, `url_to_add`, `url_to_remove`, `swatch`, `image`; `display` deprecated — https://shopify.dev/docs/api/liquid/objects/filter_value
- `paginate`: `page_size`, `current_offset`, `current_page`, `items`, `parts`, `next`, `previous`, `pages`, `page_param`; `part`: `is_link`, `title`, `url` — https://shopify.dev/docs/api/liquid/objects/paginate
- `sort_option`: `name`, `value` — https://shopify.dev/docs/api/liquid/objects/sort_option
- `swatch`: `color`, `image`; `focal_point` + `image_tag` tự áp `object-position` — https://shopify.dev/docs/api/liquid/objects/focal_point

CTO đã tra trong ticket, dùng được:
- Partials `fetch`, `apply`, `refresh`: https://shopify.dev/docs/storefronts/themes/architecture/partials (ES1-T75)

Chưa kiểm, tên lấy từ SRS, skill hoặc hiểu biết chung, CTO xác nhận ở ES1-T104:
- `collection.filters`, `sort_options`, `sort_by`, `default_sort_by`, `image`: https://shopify.dev/docs/api/liquid/objects/collection
- Mẫu form GET, tên tham số, đơn vị giá, tham số rỗng, giới hạn filter: https://shopify.dev/docs/storefronts/themes/navigation-search/filtering
- Thẻ `paginate`, trần `by`, `paginate collections`: https://shopify.dev/docs/api/liquid/tags/paginate
- Event chuẩn cho đổi filter, sort: https://shopify.dev/docs/api/storefront-events-and-actions/events

Web platform (`popover`, `popovertarget`, `showModal`) không thuộc shopify.dev, kiểm bằng DoD FE2, BE2.

## Câu hỏi

- ES1-T104 (CTO): API còn thiếu. Chặn FE2 và các task sau.
- ES1-T105 (CTO): dữ liệu store. Không chặn.
- ES1-T106 (PO): sort mặc định, ước lượng, Back khi lọc, thẻ filter, số collection mỗi trang. Không chặn, có mặc định.
- ES1-T107 (Designer): bố cục thiếu Figma. Không chặn, có mặc định.

Ngoài phạm vi: filter trang search (TE-8 AC2, dùng lại `snippets/filter-group.liquid`), thẻ filter đang áp, slider giá, quick add, tài liệu merchant 3 block mới (TE-10 AC5).
