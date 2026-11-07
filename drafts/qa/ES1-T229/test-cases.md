KHÔNG CHẮC: chưa chạy trên store và chưa đọc log CI trực tiếp (phiên QA không dùng store). Shape getCart lấy từ ticket ES1-T229 và kết luận CTO trên ES1-T227. Dòng "Chờ CI" chưa có kết quả thật. Chưa type-check (repo không có typescript).

# ES1-T229 — ES1-T203 đọc đúng shape getCart, ES1-T189 lọc request ngoài theme, gỡ spec thăm dò, nhận diện Cloudflare
Nguồn: ticket ES1-T229, AC quy đổi ở ticket-ac.md. Spec: tests/e2e/ES1-T229.spec.ts. Repro: drafts/qa/ES1-T229/pw.repro.config.ts, cf-stub.mjs; kết quả từng test: repro-summary.txt. Không có Figma.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | { cart: { totalQuantity } }, { cart: null }, null, 2 shape cũ | actionCartCount | đúng số, giỏ chưa có là 0 | [E2E] logic | P1 | Đạt |
| TC-02 | AC1 | 11 shape lạ: {}, { cart: {} }, số dạng chuỗi, số âm, mảng, undefined... | actionCartCount | ném lỗi, không tính là 0 | [E2E] logic | P1 | Đạt |
| TC-03 | AC1 | cart có id | lỗi shape | chỉ in key, không in dữ liệu giỏ | [E2E] logic | P2 | Đạt |
| TC-04 | AC1 | ES1-T203.spec.ts | đọc mã nguồn | TC-25 dùng helper, giữ assert 0 trước và 2 sau updateCart | [E2E] tĩnh | P1 | Đạt |
| TC-19 | AC1 | luồng mua thật | chạy ES1-T203 TC-25 | getCart trả 2, giỏ khớp /cart.js | [E2E] store | P1 | Chờ CI |
| TC-05 | AC2 | tests/e2e | kiểm file, import | không còn 2 file thăm dò, không spec nào import | [E2E] tĩnh | P1 | Đạt |
| TC-20 | AC2 | note.md | đọc | kết luận 2 dòng | review | P2 | Đạt |
| TC-06 | AC3 | 9 URL dữ liệu tab cùng origin, có locale, section_id, sections | isTabDataRequest | được tính | [E2E] logic | P1 | Đạt |
| TC-07 | AC3 | 13 URL: otlp-http, login_with_shop, challenges.cloudflare.com, /api/collect, /cdn-cgi, ảnh CDN... | isTabDataRequest | bị bỏ | [E2E] logic | P1 | Đạt |
| TC-08 | AC3 | trang giả, fetch ngoài, iframe | watchTabDataRequests | nhiễu không tính; fetch, XHR dữ liệu tab, tải lại có tính | [E2E] trang giả | P1 | Đạt |
| TC-09 | AC3 | ES1-T189.spec.ts | đọc mã nguồn | dùng bộ lọc mới, vẫn assert rỗng | [E2E] tĩnh | P2 | Đạt |
| TC-21 | AC3 | collection-tabs.js thật, mỗi lần bấm có nhiễu (repro ok) | chạy đúng test 'bấm' của T189 | đạt | repro | P1 | Đạt |
| TC-22 | AC3 | như TC-21, thêm fetch dữ liệu tab (repro tabfetch) | chạy đúng test 'bấm' của T189 | đỏ, chỉ nêu request đó | repro | P1 | Đạt |
| TC-23 | AC3 | /?view=figma, 4 tab | chạy ES1-T189 'bấm' | đạt trên store | [E2E] store | P1 | Chờ CI |
| TC-10 | AC4 | T73, T94, T95 | đọc mã nguồn | không còn page.goto, reload, goBack thiếu guard | [E2E] tĩnh | P1 | Đạt |
| TC-11 | AC4 | bật, tắt JS, POST bị thử thách | clickAndLoad | nêu Cloudflare dưới 10 s | [E2E] trang giả | P1 | Đạt |
| TC-12 | AC4 | bật, tắt JS, link bị thử thách, có header hoặc chỉ title | clickAndLoad | nêu Cloudflare | [E2E] trang giả | P1 | Đạt |
| TC-13 | AC4 | trang thường có jsd, checkout có Turnstile | clickAndLoad | không báo chặn nhầm | [E2E] trang giả | P1 | Đạt |
| TC-14 | AC4 | checkout trả cf-mitigated | clickAndLoad | nêu Cloudflare | [E2E] trang giả | P2 | Đạt |
| TC-15 | AC4 | trang mới trả 429 | clickAndLoad | nói 429, không nói Cloudflare | [E2E] trang giả | P2 | Đạt |
| TC-16 | AC4 | reload bị chặn, response null | expectLoaded | nêu Cloudflare, null không ném | [E2E] trang giả | P2 | Đạt |
| TC-17 | AC4 | nút không điều hướng | clickAndLoad | hết giờ 20 s, không nói Cloudflare | [E2E] trang giả | P2 | Đạt |
| TC-18 | AC4 | JSON qua APIRequestContext có cf-mitigated | getJson, requireJson | nêu Cloudflare thay vì trả 403 | [E2E] logic | P2 | Đạt |
| TC-24 | AC4 | server chặn hết, hoặc chỉ /products, GET /cart, POST /cart và /cart/change, lần GET 2 của /collections/all | chạy đúng T73 TC-1, TC-2, T94 nojs x3, T95 markup x6, nojs | 25 lượt đều fail 'bị Cloudflare chặn', 23 lượt dưới 1 s, 2 lượt 15 s, 0 skip, 0 timeout | repro | P1 | Đạt |
| TC-25 | AC4 | server không chặn, gồm POST 302 thật | chạy đúng T73 TC-1, TC-2, T94 nojs x3, T95 nojs | 6 lượt đạt, không báo chặn nhầm | repro | P1 | Đạt |
| TC-26 | AC4 | store thật | chạy T73, T94, T95 | đạt, hoặc báo 'bị Cloudflare chặn' | [E2E] store | P1 | Chờ CI |
| TC-27 | AC5 | git diff tests/e2e | tìm dòng thêm có CART., cartApi(, /cart.js, updateCart | 0 dòng; ES1-T229.spec.ts chỉ dùng trang giả | lệnh | P1 | Đạt |
| TC-28 | AC6 | toàn bộ spec, project desktop | chạy không có store | 0 test tĩnh đỏ | lệnh | P1 | Đạt, 218 đạt, 61 skip, 768 cần store |
| TC-29 | AC6 | toàn bộ spec | playwright --list | nạp đủ, không lỗi import vòng | lệnh | P1 | Đạt, 2094 test, 63 file |
| TC-30 | AC6 | ES1-T229.spec.ts, 2 project | chạy local | 70 đạt, 40 skip (kiểm nguồn chỉ chạy desktop) | lệnh | P1 | Đạt |

## Không chạy được local
Mọi test cần store: ES1-T203 luồng thật (TC-25 trở đi), ES1-T189 trên /?view=figma thật, T73, T94, T95 trên store. Store không dùng trong phiên QA. Repro chỉ chứng minh test phản ứng đúng với server giả; server giả không chứng minh theme thật đạt.

## Case biên (ngoài AC)
- Rỗng: { cart: null }, null tính là 0 (TC-01). Object rỗng thì fail (TC-02).
- Mất mạng: không có case riêng. clickAndLoad hết giờ 20 s và không nêu Cloudflare (TC-17).
- Mobile 360: helper chạy cả project Pixel 7 trong ES1-T229.spec.ts. Repro chỉ chạy Desktop Chrome.
- Keyboard, screen reader, merchant chưa chọn resource: không áp dụng, ticket chỉ sửa test.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
Không cần dữ liệu mới. Repro dùng handle giả stub-product.

## Quyết định cần review
- Đổi hết page.goto trong T94, T95 sang gotoStore, kể cả test ngoài nojs, markup: cùng file, cùng shard, cùng lỗi. Khi store trả 429, các test này thử lại 2, 4, 8 s rồi fail nói rõ 429.
- T73: trước đây store trả status từ 400 thì swatchCard trả null và test bị skip. Giờ 403 Cloudflare, 429 đều fail. Lỗi status khác không có card vẫn skip như cũ.
- T94 nojs đổi sang domcontentloaded (ES1-T224: tắt JS thì Chromium tải cả ảnh lazy).
- support/http.ts: getJson trả thêm challenged. Không đổi số lần thử lại, nên bị chặn ở /products/x.js mất 15 s rồi mới báo.
- Bộ lọc T189 là allowlist: fetch dữ liệu tab qua đường khác, ví dụ Storefront GraphQL, không bị đếm. Test tĩnh của T189 vẫn cấm fetch, XMLHttpRequest, partials trong collection-tabs.js.
- T189: các test khác dùng goToFigma chưa qua store-guard, ngoài phạm vi ticket. Status 403 vẫn fail ở assert HTTP, không skip.

## KHÔNG CHẮC
- drafts/dev-be/ES1-T227/logic-check.mjs import action-probe.ts nên không chạy được nữa. Scope-guard của QA không cho sửa drafts/dev-be, file vẫn giữ.
- Shopify có thể trả shape khác cho giỏ rỗng; actionCartCount nhận cả null, { cart: null }, { cart: { totalQuantity: 0 } }. Lượt đầu TC-25 trên CI sẽ xác nhận.
