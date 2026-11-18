KHÔNG CHẮC: (1) chưa chạy trên store: phiên không có PREVIEW_URL/STORE_PASSWORD, chỉ `npx playwright test --list` biên dịch được 5 file (216 test), chưa type-check (tsc bị chặn tải). Kết quả thật lấy từ CI store-tests trên PR. (2) TE11_QUIZ_COLLECTION nằm ở store-data.json của PR #180 (commit e89f0bf, b941f69), chưa có trên nhánh này: chưa merge PR #180 thì test quiz có dữ liệu skip có lý do. (3) Chưa bật TE11_TAGS_READY: ticket ghi "đạt thì bật", chưa có run CI đạt. (4) Phần te13-featured (comment CTO 11/11) chưa sửa spec: sản phẩm của band do template FE quyết, đã hỏi Tech Lead ở ES1-T426.

# ES1-T417 — sort_by cố định cho spec đọc /collections/all + spec quiz sang /collections/te11-quiz
Nguồn: ticket ES1-T417 (CTO 11/11, ES1-T178 mục N, M phương án A); docs/srs.md#TE-3 AC2, #TE-6 AC1, #TE-11 AC2, AC3; drafts/claude-code/ES1-T178/created-data.md (nhánh PR #180); drafts/qa/ES1-T176/spec-audit.md.

AC của ticket (đánh số để đo phủ):
- AC1: TE-3.spec.ts, ES1-T73.spec.ts, ES1-T108.spec.ts đọc /collections/all với sort_by=created-descending cố định; có comment mã ticket.
- AC2: ES1-T138 (MANY/ONE/NONE) và ES1-T139 đọc /collections/<TE11_QUIZ_COLLECTION>; kiểm 3 bộ nhiều ≥ 5, một = 1, rỗng = 0.
- AC3: không skip do dữ liệu khi store-data đủ (TE11_QUIZ_COLLECTION, TE11_TAGS_READY); thiếu thì skip nêu rõ cờ và ticket.
- AC4: te13-featured: chốt sản phẩm cho từng ca test te13, rồi mới publish lại và bật TE13_METAFIELDS_READY (comment CTO 11/11).

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-1 | AC1 | Store dev 2065 sản phẩm, sản phẩm TE4 tạo 03/11 | TE-3 findCard/badgeSwatchCard duyệt `/collections/all?sort_by=created-descending&page=n` (n ≤ 5) | Thấy card TE4 (sale, swatch, không ảnh) trong 5 trang đầu, test không skip "Không thấy sản phẩm" | E2E regression | P1 |
| TC-2 | AC1 | Như TC-1 | TE-3 cardsOn(ALL) và B-01 nojs mở trang đầu `?sort_by=created-descending` | Trang đầu có sản phẩm test mới nhất (sale, khoảng giá, swatch) | E2E regression | P2 |
| TC-3 | AC1 | Như TC-1 | ES1-T73 swatchCard duyệt `?sort_by=created-descending&page=n` | Tìm được card ≥ 2 swatch, TC-1..TC-3 ES1-T73 không skip | E2E regression | P1 |
| TC-4 | AC1 | TE6_COLLECTION_HANDLE = te6-filter (PR #180) có thể không chứa sản phẩm hết hàng | ES1-T108 "AC1 sold out" duyệt MAIN rồi /collections/all, đều sort_by=created-descending | Thấy badge sold out của hết-hang-toan-bộ; chỉ skip khi cả 2 nguồn không có | E2E regression | P1 |
| TC-5 | AC1 | Diff spec | Đọc lại mỗi chỗ đổi | Có comment `ES1-T417` ở hằng SORT/allPage và tại từng lời gọi | Review tĩnh | P3 |
| TC-6 | AC2 | te11-quiz: 7 sản phẩm, upper+beginner+home gắn 5 sp | ES1-T138 mở `/collections/te11-quiz/quiz-upper+quiz-beginner+quiz-home` (template mặc định) rồi `?view=quiz` | Lưới mặc định ≥ 5 card; view quiz 4 card, data-quiz-count 4 | E2E | P1 |
| TC-7 | AC2 | core+beginner+home gắn 1 sp (collection5) | ES1-T138 mở bộ một, mặc định rồi view quiz | Lưới mặc định 1 card; view quiz 1 card, data-quiz-count 1 | E2E | P1 |
| TC-8 | AC2 | lower+advanced+gym: không sp nào trong te11-quiz (collection4 có lower+advanced+home) | ES1-T138 mở bộ rỗng view quiz | 200, 0 card, quiz-empty hiện, CTA trỏ /collections/te11-quiz | E2E | P1 |
| TC-9 | AC2 | Block trang chủ còn trỏ /collections/all tới ES1-T387 | ES1-T139 "AC3 có dữ liệu": page.route đổi đoạn collection của request kết quả sang te11-quiz | 4 card, status theo data-label-results với n = 4, swatch chạy sau apply | E2E | P1 |
| TC-10 | AC2 | Như TC-9 | ES1-T139 "AC3 URL kết quả" | pathname = pathname(data-results-url) + `/quiz-lower+quiz-advanced+quiz-gym`, view=quiz; qua cả trước và sau ES1-T387 | E2E | P2 |
| TC-11 | AC2 | Như TC-9 | ES1-T138 "hook cho BE1" | data-results-url khớp `/collections/(all\|te11-quiz)$` | E2E | P2 |
| TC-12 | AC2 | Trang kết quả riêng | ES1-T139 "AC2 trang kết quả riêng" mở `/collections/te11-quiz?view=quiz` | Không tải quiz-finder.js, lazy-module.js; không có data-lazy-module | E2E | P2 |
| TC-13 | AC3 | store-data.json chưa có TE11_QUIZ_COLLECTION hoặc TE11_TAGS_READY | Chạy ES1-T138, ES1-T139 | Test cần dữ liệu skip với lý do nêu cờ + ES1-T134/T178/T417; test không cần dữ liệu (UNUSED_TAGS, NO_TAGS, route rỗng, abort, 500) vẫn chạy | E2E | P2 |
| TC-14 | AC3 | te11-quiz bị đổi dữ liệu (thêm/bớt tag) | ES1-T138 TC-6/TC-7 kiểm lưới mặc định trước | Fail nêu "≥ 5 / = 1 sản phẩm (ES1-T178)", không skip, không báo nhầm lỗi theme | E2E | P2 |
| TC-15 | AC3 | Sau merge PR #180 + ticket này | CI store-tests chạy TE-3, ES1-T73, ES1-T108, ES1-T138, ES1-T139 với env TE11_TAGS_READY=true | 0 skip do dữ liệu; đạt thì bật TE11_TAGS_READY = "true" trong store-data.json (PR riêng hoặc vào PR này) | CI | P1 |
| TC-16 | AC4 | te13-featured gỡ khỏi Online Store | Đối chiếu bảng "Dữ liệu te13" bên dưới | Mỗi ca te13 có sản phẩm chốt; ca xung đột band te13-a chờ ES1-T426 | Review tĩnh | P1 |

## Case biên (ngoài AC)
- sort_by trên trang 2+: URL `?sort_by=created-descending&page=n`, không lặp `?` (allPage).
- Sản phẩm mới hơn TE4 (24 figma-*, te12-sold-out, te13-featured, ~2 sp ES1-T178) chiếm ≤ 2 trang 20 card: TE4 vẫn trong MAX_PAGES = 5.
- ES1-T108 MAIN = ALL khi thiếu TE6_COLLECTION_HANDLE: Set khử trùng, không duyệt 2 lần.
- encodeURIComponent handle collection; escape regex cho CTA/data-results-url.
- Mất mạng / 500 / chậm của kết quả quiz: giữ nguyên ES1-T139 (route.abort, fulfill 500, gate) — không phụ thuộc collection.
- Không JS: ES1-T138 "nojs AC3" giữ /collections/all?view=quiz (không cần dữ liệu); B-01 TE-3 dùng trang đầu sort cố định.
- Mốc 360/768/1280/1920: ticket không đổi layout; mốc theo project Playwright (desktop, mobile Pixel 7) như spec gốc.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
te11-quiz (created-data.md, PR #180):

| Sản phẩm | Tag quiz | upper+beginner+home | core+beginner+home | lower+advanced+gym |
| --- | --- | --- | --- | --- |
| amazing-ice-sunglasses-collection10..6 (5 sp) | quiz-upper, quiz-beginner, quiz-home | có | | |
| amazing-ice-sunglasses-collection5 | quiz-core, quiz-beginner, quiz-home | | có | |
| amazing-ice-sunglasses-collection4 | quiz-lower, quiz-advanced, quiz-home | | | (thiếu gym) |
| Tổng | | 5 | 1 | 0 |

Dữ liệu te13 (AC4, đọc template, chưa chạy):

| Ca test | Trang/band | Sản phẩm cần | Hiện tại khi te13-featured publish |
| --- | --- | --- | --- |
| ES1-T158 AC2 AC-H22 đổi variant :315, abort :345, thêm giỏ :362, picker giữ :405, price_html :441, ảnh riêng :476 | /?view=te13 te13-a | variant-co-ảnh-rieng (TE4_VARIANTS_HANDLE) | te13-featured → ảnh riêng / hết hàng không có → đỏ hoặc skip |
| ES1-T223 1 block :41, :49, :59 (variant hết hàng) | /?view=te13 te13-a | variant-co-ảnh-rieng | như trên |
| ES1-T158 openCountdown :128 | /?view=te13 te13-a | sản phẩm có giá gạch (te13-featured) | xung đột với 2 dòng trên |
| ES1-T156 AC1-markup :42, AC2 % giảm :88 | /?view=te13-states te13-a | sale-gia-nhỏ hoặc te13-featured | cả hai đều sale |
| ES1-T156 AC2 metafield :172 | /?view=te13-states te13-a | te13-featured (4.9/341, spec_1/2/4) | cần te13-featured |
| ES1-T156 AC2 hết hàng :118 | /?view=te13-states te13-c | hết-hang-toan-bộ | không phụ thuộc te13-featured (theo template); cần log CI để xác định vì sao đỏ |
| ES1-T223 nhiều block :68, ES1-T158 band B :489 | /?view=te13-states te13-b | variant-co-ảnh-rieng | không phụ thuộc |

Kết luận AC4: spec không chọn được sản phẩm của band; đề xuất FE tách band (te13-a = variant-co-ảnh-rieng; te13-states thêm te13-f = te13-featured) ở ES1-T426. Chưa publish lại te13-featured, chưa bật TE13_METAFIELDS_READY.

## KHÔNG CHẮC
- Thứ tự created-descending giả định 2065 sản phẩm nền tạo trước 03/11; nếu nhập thêm hàng loạt sau 03/11 thì TE4 có thể ra ngoài 5 trang — CI sẽ lộ ra bằng skip có tên handle.
- ES1-T138/T139 vẫn kiểm vùng kết quả inline; SRS 0.4 chuyển kết quả quiz thành dialog (ES1-T138/T139 thuộc danh sách spec lỗi thời) — ngoài phạm vi ticket này.
- ES1-T108:159 (Previous ở trang 2 phải hiện, aria-disabled) và TE-3 B-01..B-03 (swatch radio) lỗi thời theo SRS 0.4 — ngoài phạm vi, không sửa.
