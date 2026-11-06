KHÔNG CHẮC: chưa chạy trên store thật, DoD (TC-30) chưa đo. Trong phiên QA, store dev và cdn.shopify.com bị từ chối, nên mọi kết quả dưới đây chạy trên storefront giả (asset thật, thư viện partial, standard-events, Shopify.actions giả). Chi tiết ở mục KHÔNG CHẮC cuối file.

# ES1-T203 — mock Cart API cho T96, T97, T98 + 1 luồng mua thật + nhận biết Cloudflare
Nguồn: ticket ES1-T203, AC quy đổi ở ticket-ac.md, docs/srs.md#TE-5. Spec: tests/e2e/ES1-T203.spec.ts, ES1-T96, ES1-T97, ES1-T98. Không có Figma.

Kết quả: Đạt = pass trong phiên này. Đạt (giả) = pass trên storefront giả, cần xác nhận trên CI. Chờ CI = chưa chạy được.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | T96, T97, T98 | đọc nguồn | không cartApi, seedCart, themeAdd, skip429, page.request, route.continue, route.fetch, page.goto | [E2E] tĩnh | P1 | Đạt |
| TC-04 | AC1 | giỏ mock | add items[], change, xoá, đọc /cart.js | JSON đủ trường, có header mock, không lọt | [E2E] trang giả | P1 | Đạt |
| TC-05 | AC1 | product-form gửi multipart | thêm 2 lần cùng variant | đọc được, gộp 1 dòng | [E2E] trang giả | P1 | Đạt |
| TC-06 | AC1 | respond | 422, 500, abort, times | status đúng, giỏ không đổi, hết times về bình thường | [E2E] trang giả | P1 | Đạt |
| TC-07 | AC1 | delay, hold | request chờ | về sau khi chờ, partial là ảnh chụp lúc request tới | [E2E] trang giả | P1 | Đạt |
| TC-08 | AC1 | trang giỏ rỗng | attach, refresh, xoá hết | dựng dòng hàng, về đúng markup rỗng của trang | [E2E] trang giả | P1 | Đạt |
| TC-09 | AC1 | ô đang nhập, có focus | apply | giữ focus, giữ số đang nhập, defaultValue theo server | [E2E] trang giả | P1 | Đạt |
| TC-10 | AC1 | thư viện bị khoá, hoặc trang không rỗng | attach | fail nêu lý do | [E2E] trang giả | P2 | Đạt |
| TC-11 | AC1 | Cart API không qua mock | có response | ghi vào leaks, fixture làm test fail | [E2E] trang giả | P1 | Đạt |
| TC-14 | AC1 | markup dựng tay | so với liquid | mọi data-testid, class có trong liquid; đủ hook JS | [E2E] tĩnh | P1 | Đạt |
| TC-31 | AC1 | T96, T97, T98 | chạy trên mock, cả 2 project | pass, JS thật chạy | [E2E] storefront giả | P1 | Đạt (giả) |
| TC-32 | AC1 | 12 mutation của cart-items.js, cart-drawer.js | chạy T96, T97, T98 | test đỏ khi code hỏng | Mutation, storefront giả | P1 | Đạt (giả) 11/12, xem dưới |
| TC-20 | AC2 | trang sản phẩm thật | bấm thêm giỏ | drawer modal mở, 1 dòng, cart-count, /cart.js 1 món, event add/product | [E2E] luồng thật | P1 | Đạt (giả), chờ CI |
| TC-21 | AC2 | drawer mở | đổi số lượng | /cart/change.js thật, số, tổng, status theo server | [E2E] luồng thật | P1 | Đạt (giả), chờ CI |
| TC-22 | AC2 | sau partial thật | Esc, bấm cart link | focus về nút thêm giỏ, mở lại, số vẫn đúng | [E2E] luồng thật | P1 | Đạt (giả), chờ CI |
| TC-23 | AC2 | còn 1 dòng | xoá trong drawer | trạng thái rỗng, focus CTA, cart-count mất | [E2E] luồng thật | P1 | Đạt (giả), chờ CI |
| TC-24 | AC2 | thêm lại rồi sang /cart | đổi số, xoá | dòng do server render, focus giữ, về rỗng, focus h1 | [E2E] luồng thật | P1 | Đạt (giả), chờ CI |
| TC-25 | AC2 | trang chủ, Shopify.actions thật | getCart, updateCart | giỏ khớp, 1 refresh, 1 event standard-action, không mở, không reload | [E2E] luồng thật | P1 | Đạt (giả), chờ CI |
| TC-26 | AC2 | /cart | updateCart | partial cart-page, ô số theo server | [E2E] luồng thật | P1 | Đạt (giả), chờ CI |
| TC-27 | AC2 | partial bị abort | updateCart | không ném, giỏ vẫn đổi | [E2E] luồng thật | P2 | Đạt (giả), chờ CI |
| TC-03 | AC2 | ES1-T203.spec.ts | đọc nguồn | describe.serial, retries 0 | [E2E] tĩnh | P1 | Đạt |
| TC-12 | AC3 | màn thử thách: title, form, turnstile, iframe, chl_page | gotoStore | fail 'bị Cloudflare chặn', nói không phải lỗi code, không skip | [E2E] trang giả | P1 | Đạt |
| TC-13 | AC3 | header cf-mitigated ở trang hoặc ở fetch | gotoStore, finish | fail 'bị Cloudflare chặn' | [E2E] trang giả | P1 | Đạt |
| TC-15 | AC3 | trang thường có scripts/jsd/main.js | gotoStore | không coi là bị chặn | [E2E] trang giả | P1 | Đạt |
| TC-16 | AC3 | log từ challenge-platform và từ theme | finish | bỏ log Cloudflare, lỗi theme vẫn fail | [E2E] trang giả | P1 | Đạt |
| TC-17 | AC3 | trang trả 429 | gotoStore | chờ rồi mở lại; hết lượt fail nói rõ 429, không skip | [E2E] trang giả | P2 | Đạt |
| TC-19 | AC3 | response của luồng thật | 429, cf-mitigated, 200 | 2 loại đầu ném lỗi rõ, 200 không | [E2E] helper | P2 | Đạt |
| TC-29 | AC4 | ES1-T97 'đổi trong lúc refresh', 2 surface | chạy trên mock | pass; bỏ this.ctl?.abort() thì đỏ cả 2 surface. Không phải lỗi code cart-items.js | [E2E] storefront giả | P1 | Đạt (giả) |
| TC-02 | AC5 | T96, T97, T98 | đọc nguồn | không có test.fixme thiếu key bug | [E2E] tĩnh | P1 | Đạt |
| TC-33 | AC5 | git status | so file đổi | chỉ tests/ và drafts/qa/ES1-T203/ | Tĩnh | P1 | Đạt |
| TC-18 | AC6 | log có trang thử thách | summary429 | có cột trang_thử_thách khi khác 0, dòng cũ giữ nguyên | [E2E] helper | P1 | Đạt |
| TC-30 | AC6 | CI PR | store-tests chạy | T96, T97, T98 chạy ≥ 90%, 0 trang thử thách, 0 lần 429, luồng thật pass 2 project, [429-tong-ket] nêu số | [E2E] store dev | P1 | Chờ CI |

## Case biên (ngoài AC)
- TC-28 cart_type page thật: updateCart chỉ làm mới cart-count. Skip nếu không có EXPECT_CART_TYPE=page.
- Rỗng: TC-08, ES1-T97 AC4. Tối đa, quá tồn: ES1-T97 'mock 200 giảm quantity' (cart.stock). Mất mạng: abort ở T96, T97, T98. Mobile: chạy project Pixel 7; 360px, screen reader: spec không đổi phạm vi kiểm. Keyboard: Esc, Enter, focus trong T96, T97, TC-22 đến TC-24. Merchant chưa chọn resource: không áp dụng.
- Thêm mới trong T96: mock 500 khi thêm giỏ (rơi về submit form), thêm giỏ chậm. Trong T97: POST chậm.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
TE4_VARIANTS_HANDLE (store-data.json). Luồng thật cần variant mặc định còn hàng, hết hàng thì fail nêu rõ, không skip.

## Đo trên storefront giả
- Lệnh: `npx playwright test --config=drafts/qa/ES1-T203/pw.local.config.ts` (T96, T97, T98, T163, T171, T201, T203; 2 project): 289 pass, 21 skip, 0 fail.
- Số test mỗi project: T96 21, T97 35, T98 21, tổng 77. Skip cố định: desktop 2/77 (cart_type page), mobile 3/77 (thêm backdrop dưới 48rem). Tỉ lệ chạy 97,4% và 96,1%.
- `npx playwright test --list`: 626 test, 37 file.

## Mutation (TC-32)
Lệnh: `npx playwright test --config=drafts/qa/ES1-T203/pw.mutant.config.ts --reporter=json --quiet`, đọc bằng `node drafts/qa/ES1-T203/mutants-report.mjs`. 11/12 bị bắt.
- Bắt được: no-abort 2, no-revert 4, no-debounce 2, parallel-writes 2, no-remove-prevent 10, no-status 8, no-emit 12, open-no-modal 9, no-restore 7, no-link-prevent 25, no-fallback 1 test đỏ.
- Lọt: no-resync (bỏ `this.sync(this.items)` sau apply trong cart-items.js). Trên mock, write đã sync trước khi apply và apply giữ số trong ô, nên dòng đó không tạo khác biệt. Chỉ thư viện thật mới có thể làm nó cần thiết, mà luồng thật không có ca server giảm số lượng. Đây là khoảng trống đã biết.

## Quyết định cần review
- Partial: 0 request partial tới store. Thay partials.fetch, partials.apply ngay trên object của thư viện thật sau khi tải trang, dựng dòng hàng từ giỏ mock. Không cache HTML store như ticket gợi ý: muốn có HTML dòng hàng phải có giỏ thật, tức thêm request Cart API; định dạng response của thư viện cũng không đọc được trong phiên này.
- Giới hạn của mock: dòng hàng dựng tay (TC-14 chỉ kiểm hook, class), apply là bản giả theo AGENTS.md, không dựng free shipping, discount, thuế. Phần thư viện thật và Liquid thật chỉ do luồng thật kiểm.
- 4 test getCart, updateCart của T98 chuyển sang luồng thật (TC-25, TC-26, TC-27, TC-28): 2 action này ghi qua Storefront API (ES1-T164), mock Cart API không tới. Thêm các bước đó ngoài 5 bước ticket liệt kê, cùng 1 phiên. Serial nên bước đầu đỏ thì các bước sau không chạy.
- Bỏ test T97 'quá tồn thật' (cần TE5_LIMITED_HANDLE, vốn luôn skip): thay bằng tồn giới hạn trong mock. Hành vi quá tồn của store thật vẫn chưa ai kiểm (ES1-T91 #4, #7).
- Trang /cart ở lần chuyển trang thứ 2 trong T96, T98 dùng trang tối giản (stubCartDocument) để giữ 1 lần tải trang thật.
- Bộ lọc Cloudflare đặt trong watchShopPay403 nên có hiệu lực cho mọi spec dùng hàm này, không chỉ T96, T97, T98.
- ES1-T201 TC-04 sửa theo: T97, T98 không còn seedCart. seedCart, themeAdd vẫn giữ cho T95, T201.

## KHÔNG CHẮC
- TC-30 và phần "Đạt (giả)": chưa thấy trên store thật. Store dev, cdn.shopify.com bị từ chối trong sandbox (user denied), không vòng qua.
- Rủi ro lớn nhất: attach giả định `partials` của thư viện thật là object gán đè được. Nếu bị khoá, mọi test T96, T97, T98 fail với thông báo 'Không thay được partials.fetch' (TC-10), không fail âm thầm. Khi đó phải đổi sang route URL thư viện.
- createCartFromAjaxResponse thật có thể không nhận JSON mock dù đã đủ trường Ajax theo hiểu biết của QA. Dấu hiệu: T98 'promise có cart' đỏ và lỗi data-label-error xuất hiện. Đọc report trước khi kết luận lỗi code.
- ES1-T97 'Expected 1 Received 0' trên store: mock kết luận logic hàng đợi đúng (TC-29), nhưng partials.fetch trên mock luôn cùng pathname nên không loại được khả năng thư viện thật gửi khác. Giả thuyết khác: /cart/change.js trả 429 nên không có refresh. Dòng log `[ES1-T203] refresh partial trên cart page: N request` trên CI trả lời câu này: N bằng 0 thì spec cũ đếm sai cách, chưa kết luận là bug.
- T95, T138, T67, TE-4 vẫn gọi Cart API thật, chung IP runner với T96, T97, T98. DoD "0 trang thử thách" có thể vẫn đỏ vì các spec đó, chúng ngoài phạm vi ticket. Mỗi test mock vẫn tải 1 trang thật. Dòng [429-tong-ket] chỉ ghi 429 và thử thách của spec dùng store-guard; spec khác vẫn ghi 429 qua cartApi.
- Accelerated checkout thật chạy trên trang có giỏ server rỗng trong khi DOM có hàng: có thể sinh log lạ. Log từ shopifycloud đã được lọc, log khác sẽ làm test đỏ.
- Dấu hiệu màn thử thách (title, phần tử) lấy theo hiểu biết chung về Cloudflare, chưa đối chiếu trang thật trong report CI #107. Không khớp thì test vẫn fail nhưng không có thông báo Cloudflare.
- TE-1.spec.ts có sẵn 2 test.fixme không kèm key bug (TC-46, TC-47): ngoài phạm vi, không đụng.
- Chưa type-check: repo không có typescript.
