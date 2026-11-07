KHÔNG CHẮC: DoD số test chạy thật (TC-20) chưa đo được. Phiên QA bị chặn store dev, chưa spec TE-5 nào chạy trên store sau khi sửa. Giả thuyết clear là nguyên nhân chính của 429 cũng chỉ CI mới xác nhận được. Chi tiết ở mục cuối.

# ES1-T201 — test giỏ hàng chạy thật, giảm request Cart API
Nguồn: ticket ES1-T201, AC quy đổi ở ticket-ac.md. Spec: tests/e2e/ES1-T201.spec.ts. Không có Figma.

Kết quả: Đạt = đã chạy và pass trong phiên này. Chờ CI = chưa chạy được.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | state.json do globalSetup sinh trên CI | đọc cookies | không có cookie tên cart | [E2E] tĩnh | P1 | Chờ CI (skip cục bộ vì chưa có state.json) |
| TC-02 | AC1 | tests/setup/password.ts | đọc nguồn | xoá cookie cart trước khi lưu state, trả teardown | [E2E] tĩnh | P1 | Đạt |
| TC-03 | AC1 | mọi spec trừ ES1-T163, ES1-T201 | đọc nguồn | không còn gọi clear giỏ | [E2E] tĩnh | P1 | Đạt |
| TC-04 | AC2 | ES1-T97, ES1-T98 | đọc nguồn | dùng seedCart, không fetch /cart.js chỉ để lấy key | [E2E] tĩnh | P1 | Đạt |
| TC-06 | AC2 | seed 2 dòng, rồi seed test sau | seedCart | 1 request add với items[]; lần sau không mở lại trang sản phẩm | [E2E] helper | P1 | Đạt |
| TC-07 | AC2 | add trả 422 | seedCart | test fail, không skip | [E2E] helper | P1 | Đạt |
| TC-19 | AC2 | trang giả có 2 dòng hàng | lineKeys | đúng line key, đúng thứ tự | [E2E] Chromium, trang giả | P1 | Đạt |
| TC-08 | AC3 | không có Retry-After, hoặc Retry-After lớn | retryDelayMs | 2, 4, 8 s; tổng ≤ 15 s; hết ngân sách trả 0 | [E2E] helper | P1 | Đạt |
| TC-09 | AC3 | theme nhận 429 rồi 200 | themeAdd | mở lại trang, bấm lại, không skip | [E2E] helper | P1 | Đạt |
| TC-10 | AC3 | theme nhận 429 mọi lần | themeAdd | tối đa 4 lần bấm, skip "429 sau 4 lần thử" | [E2E] helper | P1 | Đạt |
| TC-11 | AC3 | theme nhận 422 | themeAdd | không mở lại trang | [E2E] helper | P2 | Đạt |
| TC-18 | AC3 | trang giả fetch thật, POST lần đầu 429 | themeAdd | POST 2 lần, tải trang 2 lần | [E2E] Chromium, trang giả | P1 | Đạt |
| TC-13 | AC4 | log nhiều spec | summary429 | từng spec, dòng tổng, sắp theo tên | [E2E] helper | P1 | Đạt |
| TC-14 | AC4 | log rỗng | summary429 | báo không có 429 | [E2E] helper | P2 | Đạt |
| TC-15 | AC4 | CI, spec TE-5 có skip | summary429 | có annotation warning, chỉ khi có skip | [E2E] helper | P1 | Đạt |
| TC-16 | AC4 | dòng tổng kết | so với regex của e2e-429-count.sh | không bị đếm trùng | [E2E] helper | P2 | Đạt |
| TC-17 | AC4 | có file log, rồi đường dẫn hỏng | record429, printSummary429 | spec thật được tính, spec helper bị bỏ, không lỗi | [E2E] helper | P2 | Đạt |
| TC-21 | AC4 | teardown-probe: globalSetup thật, 1 worker | playwright test | worker ghi được log, tổng kết in cuối lượt chạy | Probe | P1 | Đạt |
| TC-20 | AC5 | CI PR của nhánh này | store-tests chạy | T96 ≥ 15/19, T97 ≥ 25/35, T98 ≥ 18/25 chạy thật ở ít nhất 1 project; ghi số cả 2 project | [E2E] store dev | P1 | Chờ CI |
| TC-22 | AC6 | TC-20 lộ lỗi cart-drawer.js, cart-items.js | QA đọc report | tạo bug dev-be, test.fixme kèm key bug | Quy trình | P1 | Chờ CI, chưa có lỗi nào được ghi nhận |
| TC-05 | AC7 | store-tests.yml, cart-api.ts | đọc nguồn | workflow giữ --shard; helper không route.fetch | [E2E] tĩnh | P1 | Đạt, git status không có file này |
| TC-23 | AC7 | repo | playwright test --list | nạp đủ | Tĩnh | P1 | Đạt, 36 file; 1188 test trước khi thêm TC-18, TC-19 |

## Case biên (ngoài AC)
- TC-12 mất mạng: lỗi kết nối được ném ra cho test fail, không skip nhầm. Đạt.
- Rỗng: log rỗng TC-14. Tối đa: Retry-After 60 TC-08.
- Hồi quy helper: ES1-T163 và ES1-T171 chạy lại, gồm phần Chromium và cổng cục bộ. Tổng 46 test: 45 pass, 1 skip (TC-01).
- Mobile 360px, keyboard, screen reader, merchant chưa chọn resource: không áp dụng, ticket chỉ đổi test, không đổi UI.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
Spec ES1-T201 không gọi store. TC-20 dùng dữ liệu sẵn có của T96, T97, T98.

## Đo DoD trên CI
- Tổng test mỗi project: T96 19, T97 35, T98 25 (--list).
- Skip do 429 theo spec: dòng `[429-tong-ket]` cuối mỗi job e2e, cộng 2 shard của cùng project.
- Skip mọi lý do: `gh run view <run> --log`, đếm dòng list reporter dạng `-  N [desktop] › tests/e2e/ES1-T97.spec.ts`. Chạy thật = tổng trừ số này.
- Skip cố định không do 429: T96 tối đa 18 desktop, 17 mobile (cart_type page, backdrop dưới 48rem); T97 tối đa 33 (thiếu TE5_LIMITED_HANDLE, 2 test); T98 tối đa 24 (cart_type page). Vẫn trên ngưỡng DoD.

## Quyết định cần review
- Bỏ hẳn clear, không giữ dạng "clear khi có cookie": mỗi test có context mới. globalSetup xoá cookie cart nếu có, nên giỏ rỗng không phụ thuộc Shopify có đặt cookie lúc tải trang hay không. Không có test nào cần giỏ rỗng sau khi thêm, nên không phải tạo context mới.
- Phạm vi rộng hơn T94-T98: bỏ clear cả ở TE-4 (14 chỗ, đều ở đầu hoặc cuối test), TE-1, ES1-T147, ES1-T156. Đều là bước thừa cùng loại, và TE-4 có 12 skip trong bằng chứng của ticket.
- Hành vi helper đổi với mọi caller, gồm ES1-T45: từ tối đa 2 lần chờ sang 3 lần (2, 4, 8 s), Retry-After nhỏ hơn mức của lượt thì lấy mức của lượt. Đã sửa ES1-T163 TC-03, TC-05 theo. Khi store 429 kéo dài, mỗi test tốn thêm tới 14 s.
- themeAdd (T96, T98): nút thêm giỏ do theme gửi POST, nên 429 phải mở lại trang rồi bấm lại. Không dùng route.fetch vì bị bot protection (ES1-T171).
- T96 test bfcache: đổi POST fetch trong trang sang cartApi, tránh Cloudflare challenge (CI #82).
- seedCart cache variant id theo worker và bỏ page.goto trang sản phẩm trước khi add. Test sau gọi add khi trang còn about:blank, dùng cookie từ state.json. T95 vốn đã gọi add trước khi mở trang; market của giỏ theo cách này chưa được kiểm trên store.
- T97, T98 không còn fetch /cart.js chỉ để lấy key; /cart.js vẫn là chuẩn so sánh trong expectTotals và các assert số lượng.
- Tổng kết in qua hàm globalSetup trả về, vì ticket chỉ cho sửa tests/. Annotation warning không làm job đỏ, gate không đổi.

## KHÔNG CHẮC
- TC-20: chưa đo. Store dev bị từ chối trong sandbox (user denied), không vòng qua. Nếu Shopify giới hạn cả /cart/add.js theo IP lâu hơn 15 s thì T97, T98 vẫn skip nhiều do seed qua add; dòng `[429-tong-ket]` sẽ cho thấy.
- TC-01: chưa thấy state.json thật. Chưa xác minh được bằng dữ liệu thật rằng cookie cart không có; log `[state]` trong globalSetup và TC-01 sẽ trả lời trên CI. Có hay không thì globalSetup vẫn xoá trước khi lưu.
- Rủi ro đỏ thay vì skip: T97, T98 có đường bấm trực tiếp không qua helper (nút Remove, setQuantity kèm poll). Theme nhận 429 ở đó thì test fail sau retry, không skip. TE-4 bấm nút thêm giỏ cũng chưa qua themeAdd. Trước đây các test này không chạy tới bước đó. Đọc report trước khi kết luận là bug code.
- Chưa type-check: repo không có typescript. Mới kiểm nạp spec qua --list và chạy phần helper.
- Hook thật của T96, T97, T98 (line key trên store, drawer sau seed) chỉ được kiểm trên trang giả.
