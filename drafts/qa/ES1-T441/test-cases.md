KHÔNG CHẮC: (1) spec chưa chạy, chưa type-check: phiên QA không chạy được `npx tsc`/`npx playwright test --list` (cần quyền), không có PREVIEW_URL/STORE_PASSWORD; kết quả thật lấy từ CI e2e trên PR. (2) Store dev chưa có sản phẩm > 4 giá trị có swatch gốc được khai báo (`T337_MANY_COLORS_HANDLE` không có trong tests/e2e/store-data.json): TC-16, T-02 tự dò 5 trang đầu, không thấy thì skip có lý do, không tính đạt; đã tạo ticket hỏi dữ liệu ES1-T514. (3) `ac_coverage.py` chạy trên toàn docs/srs.md đếm cả 32 AC của TE-3 (0.16) nên đo trên file phạm vi `drafts/qa/ES1-T441/story-scope.md` (AC2, AC6, AC8, AC12, AC13 trích SRS): 5/5 = 1.00.

# ES1-T441 — TE-3: cập nhật nhóm test swatch card theo chỉ báo ES1-T337
Nguồn: docs/srs.md#TE-3 AC2 (0.3), AC6 (0.3), AC8 (0.3), AC12, AC13 (0.5); ticket ES1-T441, ES1-T337 (TE-3-R2-FE1, đã merge #207), ES1-T338 (gỡ product-swatch.js, #224); snippets/product-card.liquid:145-187, 280-342; assets/base.css:1131-1200; foundation §9, variant-picker §9 (VP2).
Spec: tests/e2e/TE-3.spec.ts (viết lại nhóm swatch), tests/e2e/ES1-T441.spec.ts (phần riêng từ drafts/dev-fe/ES1-T337/ES1-T337.spec.ts), sửa tests/e2e/ES1-T190.spec.ts, ES1-T189.spec.ts, ES1-T139.spec.ts, ES1-T229.spec.ts; xoá tests/e2e/ES1-T73.spec.ts.
Tên test bắt đầu bằng ID, chạy riêng bằng `-g "TC-16"`.

## AC trong phạm vi
- AC2: swatch là chỉ báo `aria-hidden="true"`, không nhận focus, không bấm được; tên link card có thêm số màu; swatch lấy từ option value, không lặp biến thể; số chỉ báo theo AC13.
- AC6: Tab qua card: focus thấy được trên link card (và nút Quick View khi có); swatch 32 × 16 cách 4, không phải control nên không yêu cầu vùng chạm.
- AC8: phần tử variant: ảnh, giá, link `?variant=` theo variant; swatch của variant đó ở trạng thái đang chọn (chỉ báo, không bấm).
- AC12: không JS thì card là link tới trang sản phẩm (phần swatch).
- AC13: N ≤ 4 hiện đủ N; N > 4 hiện 3 + "+{N − 3}" 14px `--color-muted`; tên link ghi tổng N; không tràn card 152px ở 360; kiểm ở 360, 768, 1280, 1920.

## TE-3.spec.ts (viết lại)

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-10 TC-11 | AC2, AC13 | Card ≥ 2 swatch trên / và /collections/all (`TE3_SWATCH_HANDLE` hoặc tự dò, trừ `TE4_MANY_VARIANTS_HANDLE`) | Mở trang | `product-card-swatches` là DIV `aria-hidden="true"`, `pointer-events: none`; 0 `input/label/fieldset/legend/product-swatch/a/button/[tabindex]/[href]` trong hàng; card 0 role radio; có "+N" thì đúng 3 chỉ báo, không thì 2–4; đúng 1 `[data-selected]`; mỗi chỉ báo có `--swatch-color` hoặc `--swatch-image` và tên value ẩn | E2E | P1 |
| TC-18 | AC2 | Như TC-10, trên /collections/all | Bấm (desktop) hoặc chạm (Pixel 7) vào giữa 1 chỉ báo chưa chọn | `elementFromPoint` tại điểm đó không thuộc a/button/input/label/[tabindex]/radio; URL giữ, href tiêu đề giữ, chỉ báo `data-selected` giữ, src ảnh giữ; 0 console error | E2E | P1 |
| TC-15 | AC2, AC8 | Như TC-10 | Bấm tiêu đề sang trang sản phẩm (clickAndLoad), Back (expectLoaded) | Card cùng `data-product-id`: href tiêu đề và tên chỉ báo `data-selected` như lúc tải; hàng vẫn `aria-hidden` | E2E | P3 |
| TC-16 (×4 mốc) | AC2, AC13 | Sản phẩm > 4 giá trị có swatch gốc (`T337_MANY_COLORS_HANDLE` hoặc tự dò card có `product-card-swatch-more`); viewport 360, 768, 1280, 1920 | Mở /collections/all | 3 chỉ báo; "+N" là SPAN, text `+{N − 3}` với N = số giá trị option chứa các tên đang hiện (`/products/<handle>.js` fetch trong trang); "+N" font-size 14px, màu = `--color-muted`; tên link khớp `, N colors$`; 1 `data-selected`; 3 chỉ báo và "+N" cùng hàng (lệch tâm ≤ 2px), không vượt mép phải card, hàng không tràn ngang; annotation ghi bề rộng card | E2E | P1 |
| TC-51 | AC6 | Card trên / (ưu tiên card có swatch) | Focus tiêu đề (Shift+Tab, Tab), Tab tối đa 3 lần | Tiêu đề focus, outline khác none, dày ≥ 2px; không lần Tab nào vào hàng swatch; tab stop trong card sau tiêu đề chỉ được là BUTTON (Quick View, AC9); trong 3 lần phải rời card | a11y | P1 |
| TC-52 | AC2, AC6 | / và /collections/all có card swatch | Đọc mọi hàng chỉ báo; focus tiêu đề card swatch đầu rồi Tab 3 × số card swatch (tối đa 3 card) | Mọi hàng `aria-hidden="true"`; 0 phần tử con `tabIndex ≥ 0`; không lần Tab nào focus trong hàng | a11y | P1 |
| TC-54 (×4 mốc) | AC6 | Card ≥ 2 swatch trên /collections/all; viewport 360, 768, 1280, 1920 | Đo chỉ báo | Mỗi chỉ báo 32 × 16 (box và `::before`), `column-gap` hàng 4px; không đo vùng chạm `::after` | E2E | P2 |
| TC-54 | AC6 | / và /collections/all | Đo tiêu đề, nút Xem tất cả | Nút Xem tất cả cao ≥ 24; tiêu đề ≥ 24 hoặc đạt ngoại lệ khoảng cách WCAG 2.5.8 so với tiêu đề khác (chỉ báo swatch không còn là target) | a11y | P1 |
| TC-55 | AC6 | / và /collections/all | axe giới hạn trong `featured-collection` / `collection-products` | 0 vi phạm serious/critical; annotation số hàng chỉ báo trong vùng (không còn lần "sau đổi swatch") | a11y | P1 |
| TC-56 | AC2, AC6 | Card ≥ 2 swatch trên /collections/all | Đọc cây truy cập | Card đúng 1 role link, tên = `{product.title}, {N} colors` (N = số giá trị option); 0 role group, radio, radiogroup trong card | a11y | P1 |
| TC-70 | AC8 | Phần tử product trên / (ưu tiên card swatch) | So `?variant=` với `.js` | Variant = biến thể còn hàng đầu tiên; tên chỉ báo `data-selected` = value của variant đó ở option swatch | E2E | P2 |
| TC-71 | AC8 | Collection đa nguồn có phần tử variant (`TE3_AC8_VARIANT_ID`, `TE3_AC8_PATH`) | Mở trang | Như bản cũ (link, ảnh, giá theo variant); có swatch thì `data-selected` = value của variant, hàng `aria-hidden` | E2E | P2 (N/A tới khi có dữ liệu ES1-T48 #6) |
| B-01 | AC2, AC12 | Tắt JS, /collections/all | Mở trang | Card đầu có tiêu đề, giá; card swatch: href tiêu đề `/products/<handle>` (có thể `?variant=`), đúng 1 role link, hàng `aria-hidden`, 0 phần tử LEGACY, 1 `data-selected` | E2E | P2 |
| B-02 | AC2 | /collections/all có card swatch | Mở trang, chờ load | 0 request `product-swatch*.js`; 0 phần tử `<product-swatch>`; tiêu đề, giá hiện | E2E | P2 |

Bỏ (hành vi đã gỡ theo AC2 0.3 và ES1-T338): TC-12, TC-33 (bấm swatch đổi ảnh/giá), TC-13 (Tab vào radio + ArrowRight), TC-14 (gỡ/gắn lại DOM rồi đổi swatch), TC-17 (đổi swatch thì badge đổi, ES1-T57), TC-52 cũ (radio focus-visible), TC-72 (card variant đổi rồi chọn lại), B-02 cũ (chặn product-swatch.js radio vẫn chọn), B-03 (offline đổi swatch). Thân test đã xoá khỏi spec, comment ES1-T441 tại chỗ cũ.

## ES1-T441.spec.ts (từ spec ES1-T337, bỏ phần trùng TE-3)

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| S-01 | AC2 | Repo | Đọc snippets/product-card.liquid | Không `<product-swatch>`, `<input`, `<label`, `<fieldset`, `<legend`, `data-price-for`; không `for … in product.variants`; hàng `class="product-card__swatches" aria-hidden="true"`; "+N" có testid, không phải `<a>` | static | P1 |
| S-02 | AC2 | Repo | Đọc snippet + locales/en.default.json | `'products.card.color_count' \| t: count: swatch_count`; locale `{one: ", {{ count }} color", other: ", {{ count }} colors"}`; `more_swatches` = `+{{ count }}` | static | P2 |
| S-03 | AC13 | Repo | Đọc snippet | `swatch_visible = 4`, > 4 thì 3; `swatch_more = swatch_count \| minus: swatch_visible` | static | P2 |
| S-04 | AC2, AC6 | Repo | Đọc assets/base.css | Không `product-card__swatch-input`, không `product-swatch` selector, không `.product-card__swatch:hover`; `.product-card__swatches` có `pointer-events: none`; sold out ảnh `opacity: 0.6` | static | P2 |
| S-05 | AC2 | Repo | Đọc nơi gọi product-card | Không `id_prefix:`; bundle-builder có `show_swatches: false`, `show_variant_title: false` | static | P3 |
| S-06 | AC2 | Repo | Tìm file | Không có assets/product-swatch.js; 0 file .liquid trong blocks/snippets/layout/templates nhắc `product-swatch` | static | P2 |
| T-01 | AC2, AC13 | Card 2–4 swatch (`TE3_SWATCH_HANDLE` hoặc tự dò, không "+N") | So với `.js` | Tên chỉ báo = `option.values` đủ, đúng thứ tự; `data-selected` = value của variant card | E2E | P2 |
| T-02 | AC8, AC13 | Card > 4 giá trị (`T337_MANY_COLORS_HANDLE` hoặc tự dò) | So với `.js` | Value đang chọn ở vị trí ≤ 3 thì hiện 3 value đầu; > 3 thì hiện value 1, 2 và value đang chọn ở chỗ thứ 3; "+N" = `+{N − 3}`; annotation ghi nhánh đã kiểm | E2E | P2 |
| T-03 | foundation §9 (quy tắc Hết hàng SRS) | Card hết hàng (`TE3_SOLD_OUT_HANDLE` hoặc `TE4_SOLD_OUT_HANDLE`) | Mở /collections/all | Card có `data-sold-out`; badge "Sold out"; giá không rỗng; ảnh `opacity` 0.6 | E2E | P2 |
| T-04 | AC8 | `TE3_AC8_VARIANT_ID`, `TE3_AC8_PATH` | Mở trang | Sản phẩm > 1 biến thể: `product-card-variant-title` = variant.title, tên link bắt đầu `{title}, {variant.title}`; 1 biến thể: không có dòng; có swatch thì 1 `data-selected` thuộc options của variant | E2E | P2 (N/A tới khi có dữ liệu) |
| T-05 | AC8 | Card swatch, phần tử product | Mở /collections/all | Không có `product-card-variant-title` | E2E | P3 |

Bỏ so với bản ES1-T337: assertion vùng chạm `::after` ≥ 44 × 44 (36 từ 1280): trái TE-3 AC6 0.3 ("không có yêu cầu vùng chạm"). Các test store trùng TE-3 (aria-hidden + Tab rời card, ", N colors", 3 + "+N", 32 × 16 cách 4) không chép.

## Spec khác sửa theo ticket

| Spec | Test cũ | Xử lý |
| --- | --- | --- |
| ES1-T73.spec.ts | TC-1..TC-3 đồng bộ radio sau Back/reload/pageshow | Xoá file: hành vi product-swatch.js đã gỡ; Back kiểm ở TE-3 TC-15 |
| ES1-T229.spec.ts | TC-05, TC-10 đọc ES1-T73.spec.ts | Bỏ T73 khỏi danh sách; TC-10 kiểm T73 không còn và TE-3 TC-15 điều hướng qua `clickAndLoad`, `expectLoaded` |
| ES1-T190.spec.ts | "đổi swatch sang variant không badge: New còn nguyên"; 3 test.skip vùng bấm | Xoá; thêm "AC2 AC6 0.3: hàng swatch hàng 5 là chỉ báo aria-hidden, không phần tử nhận focus"; giữ đo 32 × 16 |
| ES1-T189.spec.ts | "swatch sau clone": card clone được nâng cấp, chọn màu đổi link | Viết lại: card clone ở tab 2–4 có hàng `aria-hidden`, 0 phần tử nhận focus, 1 `data-selected`; khối không có `<product-swatch>` |
| ES1-T139.spec.ts | AC3 nhánh `product-swatch` check radio đổi link | Thay: lưới kết quả 0 `<product-swatch>`, mọi hàng chỉ báo `aria-hidden`, 0 phần tử nhận focus |

## Case biên (ngoài AC)
- Rỗng: sản phẩm không có option nào mà mọi giá trị có swatch gốc (VP3) → không có hàng; TC-10/TC-52 skip có lý do khi trang không có card swatch; T-05, TC-50 vẫn chạy.
- Tối đa: > 4 giá trị (TC-16, T-02); value đang chọn ở sau vị trí 3 (T-02 nhánh chiếm chỗ thứ 3, cần dữ liệu biến thể mặc định ở vị trí ≥ 4).
- Mất mạng: không còn JS trên card → không có trạng thái lỗi/đang tải riêng; B-02 kiểm không tải product-swatch.js.
- Mobile 360: TC-16, TC-54 ở 360 (card 152px); project mobile Pixel 7 chạy TC-10, TC-18 (chạm), TC-51, TC-52.
- Keyboard: TC-51, TC-52. Screen reader: TC-56, TC-10 (aria-hidden), axe TC-55.
- Merchant chưa chọn resource: không thuộc phạm vi ticket (TE-3 AC5, TC-40/TC-41 giữ nguyên).

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- `TE3_SWATCH_HANDLE`: sản phẩm có option màu 2–4 giá trị, mọi giá trị có swatch gốc (color hoặc image).
- `T337_MANY_COLORS_HANDLE`: sản phẩm > 4 giá trị có swatch gốc; nên đặt biến thể còn hàng đầu tiên ở giá trị thứ ≥ 4 để T-02 kiểm nhánh chiếm chỗ thứ 3. Chưa có trong store-data.json → ticket hỏi ES1-T514.
- `TE3_SOLD_OUT_HANDLE` / `TE4_SOLD_OUT_HANDLE` (`hết-hang-toan-bộ` trong store-data.json).
- `TE3_AC8_VARIANT_ID`, `TE3_AC8_PATH`: chưa có (ES1-T48 #6), TC-71, T-04 skip.

## Độ phủ AC (tự đếm)
| AC | Test |
| --- | --- |
| AC2 | TC-10/11, TC-18, TC-15, TC-16, TC-52, TC-56, B-01, B-02, S-01, S-02, S-04, S-05, S-06, T-01 |
| AC6 | TC-51, TC-52, TC-54 (×4 mốc + tiêu đề), TC-55, TC-56, S-04 |
| AC8 | TC-15, TC-70, TC-71, T-02, T-04, T-05 |
| AC12 | B-01 |
| AC13 | TC-10/11, TC-16 (360/768/1280/1920), S-03, T-01, T-02 |
5/5 AC trong phạm vi có ≥ 1 test case.
