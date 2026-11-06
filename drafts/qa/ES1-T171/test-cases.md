KHÔNG CHẮC: chưa chạy trên store. Sandbox từ chối hoa-qua-nhap-khau.myshopify.com (user denied) và ticket không có preview URL, nên AC3, AC5, AC9, AC10 chờ CI. D3 CHƯA KẾT LUẬN được là lỗi test hay lỗi thật của form name=id[]. Chưa type-check: repo không có typescript.

# ES1-T171 — TE-10-QA2: dựng lại CI xanh
Nguồn: ticket ES1-T171, drafts/techlead/ES1-T169/home-sprint-plan.md mục 1, AC quy đổi ở ticket-ac.md. Spec: tests/e2e/ES1-T171.spec.ts. Không có Figma.

Kết quả: Đạt = đã chạy và pass trong phiên này. Đạt (stub) = pass trên trang giả cục bộ, chưa trên store. Chờ CI = chưa chạy được.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC2 | Đã thấy 403 từ https://shop.app/ | Log 403 @ chrome-error:// | Bỏ qua | [E2E] helper | P1 | Đạt |
| TC-02 | AC2 | Chưa thấy response shop.app | Log 403 @ chrome-error:// | Không bỏ qua | [E2E] helper | P1 | Đạt |
| TC-03 | AC2 | 403 từ host khác, host giả shop.app.evil.test, hoặc shop.app trả 404 | Log 403 @ chrome-error:// | Không bỏ qua | [E2E] helper | P1 | Đạt |
| TC-04 | AC2 | Đã thấy 403 từ shop.app | 403 của theme, 500 chrome-error, warning, lỗi JS | Không bỏ qua | [E2E] helper | P1 | Đạt |
| TC-05 | AC2 | Chromium thật, iframe shop.app giả trả 403 + X-Frame-Options | Tải trang | 0 lỗi | [E2E] browser | P1 | Đạt, 20/20 lần |
| TC-06 | AC2 | Chromium thật, iframe host khác trả 403 | Tải trang | Vẫn báo lỗi 403 @ chrome-error:// | [E2E] browser | P1 | Đạt, 20/20 lần |
| TC-07 | AC2 | Iframe shop.app 403 và trang ném lỗi JS | Tải trang | Lỗi JS vẫn còn | [E2E] browser | P1 | Đạt, 20/20 lần |
| TC-08 | AC3 | URL đầy đủ, 429 rồi 200 | fetchRetry429 | Thử lại, không ép method, trả 200 | [E2E] helper | P1 | Đạt |
| TC-09 | AC3 | Đích trả 404 | fetchRetry429 | Không thử lại, trả 404 để test assert | [E2E] helper | P2 | Đạt |
| TC-10 | AC4 | calc trên var, calc có px/rem, giá trị cứng | HARDCODED_RADIUS | calc trên token qua; calc(var(--a) + 4px), 8px bị bắt | [E2E] tĩnh | P1 | Đạt |
| TC-11 | AC4 | assets/base.css hiện tại | HARDCODED_RADIUS | 0 dòng vi phạm | [E2E] tĩnh | P1 | Đạt |
| TC-12 | AC8 | tests/e2e/*.spec.ts | Tìm /cart/.*\.js | 0 dòng | [E2E] tĩnh | P1 | Đạt |
| TC-13 | AC2 | Spec có console guard đếm mọi lỗi | Đọc nguồn | Đều gọi watchShopPay403 | [E2E] tĩnh | P1 | Đạt |
| TC-14 | AC1 | ES1-T30.spec.ts | Đọc nguồn | Không có route.fetch | [E2E] tĩnh | P1 | Đạt |
| R-01 | AC1 | Trang giả dùng assets/slideshow.js và base.css thật, autoplay tắt | Chạy ES1-T30 cả 2 project | 27 pass, 1 skip chủ đích (hover trên mobile); 7 test dùng enableAutoplay: desktop 7, mobile 6 | Hồi quy | P1 | Đạt (stub) |
| R-02 | AC1 | Preview store | Chạy ES1-T30 | 7 test autoplay chạy thật, không gặp trang bot protection | Hồi quy | P1 | Chờ CI |
| R-03 | AC2 | Preview store | ES1-T73 x3, ES1-T81 x2, TE-3 B-05, TC-12 | Hết đỏ do 403 Shop Pay | Hồi quy | P1 | Chờ CI |
| R-04 | AC3 | Preview store trả 429 | ES1-T45 TC-06, ES1-T147, ES1-T156 | Thử lại; hết lượt thì skip có lý do, có log | Hồi quy | P1 | Chờ CI |
| R-05 | AC4 | Repo hiện tại | TE-1 TC-02 thật | Pass, base.css không đổi | Hồi quy | P1 | Đạt |
| R-06 | AC5 | Preview, tắt JS, 2 món còn hàng | Chọn 2 món, submit form name=id[] | Tới /cart, giỏ đúng 2 món quantity 1 | Hồi quy | P1 | Chờ CI |
| R-07 | AC6 | git status | Xem file đổi | Chỉ tests/ và drafts/qa/; ES1-T120.spec.ts chỉ thêm bộ lọc 403, AC3 360 giữ nguyên | Tĩnh | P1 | Đạt |
| R-08 | AC7 | Repo | playwright test --list | 1154 test trong 35 file, không lỗi nạp | Tĩnh | P1 | Đạt |
| R-09 | AC3, AC8 | ES1-T163 (cartApi sau khi tách fetchRetry429) | Chạy spec | Toàn bộ pass, log 429 đúng dạng script đếm | Hồi quy | P1 | Đạt |
| R-10 | AC9 | PR của ticket | CI store-tests | e2e xanh | CI | P1 | Chờ CI |
| R-11 | AC10 | Log CI | Lọc dòng "trả 429" | Mỗi dòng skip có tên file spec | CI | P2 | Chờ CI (đã thấy định dạng cục bộ) |

## Case biên (ngoài AC)
- Mất mạng, rỗng, tối đa, 360px, keyboard, screen reader, merchant chưa chọn resource: ticket chỉ sửa hạ tầng test, không đổi màn hình. Các case này giữ nguyên ở spec gốc.
- enableAutoplay khi block mất hook data-autoplay: không tự thêm thuộc tính, nên autoplay không bật và test fail. Đọc code, chưa chạy ca này.
- Thứ tự response và console: bộ lọc xét tại thời điểm có log, cần response đến trước. Probe và 60 lần chạy cục bộ đều đúng thứ tự, TE-4 dùng cách này từ trước. Nếu đảo trên CI thì test đỏ giả, không che lỗi.

## Bằng chứng đã tái lập
- probe-403.spec.ts: iframe 403 có X-Frame-Options hoặc CSP frame-ancestors mới cho đúng log "status of 403 ()" @ chrome-error://chromewebdata/. 403 không có 2 header đó log tại https://shop.app/... Chưa đối chiếu với header thật của shop.app.
- Lần chạy đầu trên stub có 2 fail ở "next, prev, chấm": stub thiếu token --space-5 nên chấm rộng 0. Lỗi của stub, thêm token thì pass.

## D3: ES1-T147 nojs AC1
- Đã sửa 2 điểm yếu của test: waitForLoadState('domcontentloaded') trả về ngay vì trang cũ đã tải xong, nên đổi sang chờ URL /cart rồi poll giỏ tối đa 15 s; đọc giỏ qua readCartNoScript thay vì page.request.
- Markup: form POST routes.cart_add_url, checkbox name="id[]" (blocks/bundle-builder.liquid:143, :190).
- Chưa có kết luận. Nếu R-06 đỏ với thông báo "form name=id[] không thêm món nào vào giỏ" hoặc sai danh sách món thì đó là lỗi thật: tạo bug P2 trả ES1-T147, kèm ES1-T148 vì dùng chung cách này. Chưa tạo bug vì chưa có bằng chứng.

## Thay đổi ngoài danh sách trong ticket
- ES1-T98: chuyển sang cartApi và hằng CART để đạt DoD grep. Test getCart đổi POST từ fetch trong trang sang cartApi. Bỏ skip 429 tự viết.
- ES1-T147, ES1-T156: bỏ bước clear cuối test. Context mới và đã clear đầu test, còn nếu giữ thì 429 ở bước dọn sẽ biến test đã pass thành skip.
- ES1-T45 hasDirRtlRule: dùng fetchRetry429, vì 429 trước đây bị hiểu nhầm là "chưa có rule RTL".
- Bộ lọc áp cho cả 25 spec có console guard đếm mọi lỗi, không chỉ trang sản phẩm, vì iframe nằm trong cart drawer ở mọi trang. ES1-T16, ES1-T30 chỉ đếm lỗi của đúng file JS nên không áp.
- support/cart-api.ts, product-data.ts: dòng log skip 429 thêm tên file spec cho AC10.
- ES1-T120 AC3 360 không sửa, theo ticket.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
Không cần dữ liệu mới. ES1-T171.spec.ts không gọi store. R-06 cần ít nhất 2 sản phẩm còn hàng trong collection của /?view=te12.

## Chạy cục bộ
Cần chạy ngoài sandbox vì Chromium và cổng cục bộ bị chặn:
- npx playwright test --config=drafts/qa/ES1-T171/pw.local.config.ts --project=desktop -g "TC-02 AC1 CSS|ES1-T171|ES1-T163"
- npx playwright test --config=drafts/qa/ES1-T171/pw.t30.config.ts

## KHÔNG CHẮC
- GO/NO-GO: NO-GO cho tới khi R-10 xanh. Cổng G0 cần 2 run xanh liên tiếp trên develop.
- Số skip do 429 theo spec: chưa có, phải đọc từ log CI.
- Stub không có Shopify.designMode, video, header thật. R-01 chứng minh cơ chế enableAutoplay, không thay R-02.
- Log của 403 từ shop.app thật mới đọc qua ticket, chưa tự đọc log CI vì api.github.com bị chặn.
