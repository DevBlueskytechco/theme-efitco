KHÔNG CHẮC: (1) Chưa chạy Playwright cục bộ (không node_modules, npm bị chặn, không PREVIEW_URL). Đã kiểm: bỏ type rồi `node --check` đạt cho 6 file; logic helper S-01..S-08 chạy bằng node thuần đạt. Kết quả thật chờ CI e2e trên PR. (2) Chưa đối chiếu handle với store (không quyền đọc admin); dùng nguyên văn ticket, kể cả "media-dủ-loại". Handle sai thì test fail ở `/products/<handle>.js trả 404`, không phải lỗi theme. (3) TE4_PICKUP_HANDLE, TE4_TAX_INCLUDED_COUNTRY chưa có dữ liệu → 2 test vẫn skip; đã hỏi ES1-T79. (4) Ticket ghi `env(name) = process.env[name] ?? data[name]`; helper dùng "env không rỗng" thay `??`, lý do ở mục Quyết định.

# ES1-T78: spec TE-4 đọc handle từ tests/e2e/store-data.json khi thiếu env TE4_*
Nguồn: ticket ES1-T78 (CI #66: mọi test hành vi ES1-T62/T63/T64/T66 skip vì job e2e không truyền vars.TE4_*). Story: docs/srs.md#TE-4.

## File
- tests/e2e/store-data.json: handle store dev, key theo tên biến spec đọc.
- tests/e2e/support/store-data.ts: `env(...names)`. Thứ tự: mọi tên trong env (không rỗng) → mọi tên trong store-data.json → undefined. Không nằm trong pattern *.spec.ts nên Playwright không gom.
- tests/e2e/ES1-T62/T63/T64/T66.spec.ts: khối `ENV` đọc qua `env()`. Không đổi assertion, không đổi điều kiện skip.
- tests/e2e/ES1-T78.spec.ts: S-01..S-08, không mở trình duyệt. Chặn hồi quy: spec đọc biến mà file không có, đọc thẳng process.env, sai thứ tự ưu tiên.

## Quyết định
- Env rỗng coi như thiếu. Khi CTO thêm `TE4_X: ${{ vars.TE4_X }}` vào ci.yml mà var chưa khai báo, Actions truyền "" → `??` chặn fallback file, test lại skip. Env có giá trị vẫn thắng file, đúng yêu cầu "env vẫn ưu tiên".
- Ticket ghi TE4_ONE_VARIANT_HANDLE, nhưng spec ES1-T64 đọc TE4_SINGLE_HANDLE. Theo "đúng tên các spec đang đọc", file dùng TE4_SINGLE_HANDLE.
- ES1-T62 và ES1-T66 cùng đọc TE4_VARIANTS_HANDLE nhưng cần 2 sản phẩm khác nhau. ES1-T62 AC1 `?variant=` cần variant có featured_media riêng → variant-co-ảnh-rieng. ES1-T66 cần 2 option và tổ hợp thiếu ("Mọi tổ hợp option đều có variant" → skip) → 2-option-co-tổ-hợp-khong-tồn. Một handle cho cả hai thì luôn có test skip. Vì vậy ES1-T66 đọc `env('TE4_OPTIONS_HANDLE', 'TE4_VARIANTS_HANDLE')`: env cũ TE4_VARIANTS_HANDLE vẫn chạy như trước, file cấp TE4_OPTIONS_HANDLE (tên có trong ticket).
- ES1-T66 "AC2 route.abort": `page.route` so `url.pathname.endsWith(productPath(handle))`. Handle có dấu thì pathname bị percent-encode nên không khớp, request không bị abort, test fail sai. Đã đổi thành `decodeURIComponent(url.pathname)`. Đây là bộ lọc route, không phải assertion. S-08 kiểm điều này.
- Ra soát so khớp handle khác: ES1-T66 AC12 `last.product?.handle` toBe ENV handle (payload JS trả handle chưa encode, khớp). ES1-T62 `toHaveURL(#ProductMedia-id$)` không chứa handle. `page.goto`, `page.request.get`, `fetch` trong trang tự encode path.
- Dữ liệu CTO cấp mà chưa spec nào đọc, giữ trong file cho spec sau: TE4_UNIT_PRICE_HANDLE (unit-price), TE4_SALE_SMALL_PRICE_HANDLE (sale-gia-nhỏ), TE4_SWATCH_SALE_HANDLE (sản-phẩm-co-mau-sale-va-mau-khong-sale).

## Bảng dữ liệu
| Biến | Handle | Spec đọc |
| --- | --- | --- |
| TE4_MEDIA_HANDLE | media-dủ-loại | T62 |
| TE4_VARIANTS_HANDLE | variant-co-ảnh-rieng | T62, T63, T64 (T66 khi env cũ có) |
| TE4_OPTIONS_HANDLE | 2-option-co-tổ-hợp-khong-tồn | T66 |
| TE4_NO_MEDIA_HANDLE | sản-phẩm-khong-co-media | T62 |
| TE4_SINGLE_HANDLE | sản-phẩm-chỉ-1-variant | T64 |
| TE4_SOLD_OUT_HANDLE | hết-hang-toan-bộ | T63, T64 |
| TE4_DIGITAL_HANDLE | sản-phẩm-số | T63, T64 |
| TE4_GIFT_CARD_HANDLE | gift-card-2 | T64 |
| TE4_SELLING_PLAN_HANDLE | amazing-aluminum-bag-collection10 | T64, T66 |
| TE4_PICKUP_HANDLE | chưa có (ES1-T79) | T64 |
| TE4_TAX_INCLUDED_COUNTRY | chưa có (ES1-T79) | T63 |

## Test case
| ID | AC | Given | When | Then | Loại | Ưu tiên | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S-01 | AC1 | 4 spec TE-4 đọc biến qua `env()` | Quét tên TE4_* trong `env(...)` | Mọi tên có trong store-data.json, trừ TE4_PICKUP_HANDLE, TE4_TAX_INCLUDED_COUNTRY | static | P1 | chạy (ES1-T78) |
| S-02 | AC2 | 4 spec TE-4 | Tìm `process.env.TE4_` | Không còn chỗ nào, mọi biến đi qua helper | static | P1 | chạy |
| S-03 | AC1 | store-data.json | Đọc mọi key *_HANDLE | Chuỗi không rỗng, chỉ chữ thường Unicode, số, gạch ngang | static | P2 | chạy |
| S-04 | AC2 | env TE4_MEDIA_HANDLE=tu-env | `env('TE4_MEDIA_HANDLE')` | Trả tu-env, không lấy file | unit | P1 | chạy |
| S-05 | AC2 | env TE4_MEDIA_HANDLE thiếu, "" hoặc "  " | `env('TE4_MEDIA_HANDLE')` | Trả media-dủ-loại từ file | unit | P1 | chạy |
| S-06 | AC4 | Không env, file không có key (TE4_PICKUP_HANDLE) | `env(...)` | undefined → spec skip có lý do như cũ | unit | P2 | chạy |
| S-07 | AC12 | Env chỉ có TE4_VARIANTS_HANDLE / có cả 2 / không có | `env('TE4_OPTIONS_HANDLE', 'TE4_VARIANTS_HANDLE')` | env-variants / env-options / handle OPTIONS trong file. Mọi env trước file | unit | P1 | chạy |
| S-08 | AC2 | Handle Unicode 2-option-co-tổ-hợp-khong-tồn | URL `/products/<handle>?variant=1` | pathname đã encode khác path gốc; decode rồi `endsWith(path)` đúng | unit | P2 | chạy |
| R-01 | AC1 | CI e2e trên PR, không env TE4_* | Chạy ES1-T62 | 6 test AC1 dùng media-dủ-loại chạy thật; "?variant= có featured_media" chạy với variant-co-ảnh-rieng; "không media" chạy với sản-phẩm-khong-co-media | E2E | P1 | chờ CI |
| R-02 | AC2 | Như R-01 | Chạy ES1-T64 AC2-markup + ES1-T66 AC2 | T64 dùng variant-co-ảnh-rieng (3 variant, 2 còn hàng, nojs có target); T66 dùng 2-option-co-tổ-hợp-khong-tồn, "tổ hợp không tồn tại" không skip | E2E | P1 | chờ CI |
| R-03 | AC3 | Như R-01 | Chạy ES1-T63 AC3 | title, vendor, giá, mô tả, ghi chú thuế chạy với variant-co-ảnh-rieng | E2E | P2 | chờ CI |
| R-04 | AC4 | Như R-01 | Chạy ES1-T64 AC4 + ES1-T66 AC4 | payment_button, selling plan (amazing-aluminum-bag-collection10) chạy thật; T66 AC4 skip nếu sản phẩm 1 variant (lý do có sẵn, không phải thiếu handle); pickup vẫn skip (ES1-T79) | E2E | P1 | chờ CI |
| R-05 | AC5 | Như R-01 | Chạy ES1-T63 AC5-markup | sticky bar với variant-co-ảnh-rieng, nút disabled với hết-hang-toan-bộ | E2E | P2 | chờ CI |
| R-06 | AC6 | Như R-01 | Chạy ES1-T64 AC6 + nojs gift card | gift-card-2 (requires_shipping false): 4 field, 4 properties trong /cart.js | E2E | P1 | chờ CI |
| R-07 | AC7 | ES1-T62 "AC1 khung" | Chạy với media-dủ-loại | container-product-related, container-product-complementary có trên trang; nội dung recommendations ngoài phạm vi ticket | E2E | P3 | chờ CI |
| R-08 | AC8 | Cart drawer thuộc TE-5 | - | Không spec TE-4 nào đọc handle cho AC8; ngoài phạm vi | N/A | P4 | N/A |
| R-09 | AC9 | Như R-01 | Chạy ES1-T63 AC9 + ES1-T64 AC9 | sản-phẩm-số: không product-note-shipping, không product-pickup; sản-phẩm-chỉ-1-variant: không picker | E2E | P1 | chờ CI |
| R-10 | AC10 | Không có TE4_TAX_INCLUDED_COUNTRY | Chạy ES1-T63 AC10 | Vẫn skip với lý do sẵn có; mở ES1-T79 | E2E | P3 | skip (thiếu dữ liệu) |
| R-11 | AC11 | Như R-01 | Chạy ES1-T63 AC11 | JSON-LD với variant-co-ảnh-rieng: offers đủ 3 variant, availability khớp 2 còn/1 hết | E2E | P2 | chờ CI |
| R-12 | AC12 | Như R-01 | Chạy ES1-T66 AC12 | shopify:product:select chạy với 2-option-co-tổ-hợp-khong-tồn; `product.handle` khớp handle Unicode; tổ hợp thiếu → variant null | E2E | P1 | chờ CI |
| R-13 | AC2 | Như R-01, ES1-T66 "AC2 route.abort" | Đổi option khi request ?variant= bị abort | Matcher decode pathname nên request bị abort thật; nút giữ trạng thái cũ, không lỗi JS | E2E | P1 | chờ CI |
| E-01 | AC1 | Handle trong file sai hoặc sản phẩm bị xoá / ẩn khỏi Online Store | Chạy spec | Fail ở `/products/<handle>.js trả 404` hoặc 404 trang. Đây là lỗi dữ liệu: báo CTO, không ghi bug theme, không sửa assertion | E2E | P2 | có điều kiện |
| E-02 | AC2 | CI sau này truyền env TE4_* khác file | Chạy spec | Env thắng (S-04); file không ảnh hưởng | unit | P2 | chạy (S-04) |

## Sau khi CI chạy (DoD)
- Test fail do theme: ghi bug ticket dev-fe/dev-be theo skills/bug-report kèm trace/screenshot từ playwright-report, không sửa assertion.
- Test fail do dữ liệu (E-01): comment ES1-T79.
- Đối chiếu số skip: chỉ còn skip có lý do dữ liệu (pickup, tax country, sản phẩm 1 variant cho T66 AC4 nếu đúng), không còn "thiếu TE4_*_HANDLE" cho biến đã có trong file.
