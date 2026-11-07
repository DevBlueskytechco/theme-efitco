KHÔNG CHẮC: không đọc được log CI run 42220842266 và không chạy được trên store (api.github.com, store bị từ chối ở mức mạng). Message dùng từ nội dung ticket. Mục 3 và 4 chưa có nguyên nhân xác nhận, chờ CI kế. Mục 5 là phán đoán của QA, đã hỏi ở ES1-T225.

# ES1-T224 — nguyên nhân 7 test đỏ, CI đủ run 42220842266 (develop 4dced52)

## Kết quả
- Bug tạo mới: 0. Không có bằng chứng lỗi code ở cả 7 mục.
- Câu hỏi: ES1-T225 (techlead), AC-H24 có bắt buộc End/Home không.
- Đã kiểm local: 161 test đạt, 0 test tĩnh đỏ. 42 skip, 760 cần store nên không chạy được. Test sửa trong T156, T179, T180, T188, T203 đều cần store, nên chỉ logic helper và CSS được kiểm local.

Mức bằng chứng:
- Tĩnh: chạy local, thấy kết quả.
- Repro: CSS thật trên trang giả hoặc server cục bộ, không phải store.
- Suy luận: chỉ đọc code và ticket.

## Bảng
| # | Test | Nguyên nhân | Bằng chứng | Xử lý | Bug | Còn phải xác nhận |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | ES1-T203:536 TC-25 | Test đếm sai. Bộ đếm chỉ so pathname, nên `https://error-analytics-sessions-production.shopifysvc.com/` bị tính là refresh | Message trong ticket; TC-01 tĩnh | `isStoreRefresh` so cả origin. Áp cho `countRefreshes` (TC-20, 24, 25, 26) và route lỗi của TC-27 | Không | TC-25 đạt trên CI, số refresh đúng 1 |
| 2 | ES1-T188:125 | Test chờ sai. networkidle không tới vì video, Shop giữ kết nối (theo ticket) | TC-08: điều kiện mới đạt khi mạng chưa yên | Chờ module nâng cấp (`aria-selected`), rồi ảnh trong màn hình của tab đầu tải xong | Không | Test đạt trên CI |
| 3 | ES1-T180:158 hàng 8 | Chưa xác nhận. Nghi trang chặn hoặc chưa tải, không nghi thiếu block | Suy luận: `templates/index.liquid:147` có block; lần tải ở 1920 và ở 360 cùng HTML; ticket không liệt kê test `AC-H5 hàng 8, 13` dùng cùng band | Dùng `gotoStore`; đổi cỡ không tải lại, bớt 1 lần tải; chờ heading có thông báo riêng nếu block thiếu | Không | Đọc lý do trên CI. Nếu ra "thiếu heading hàng 8" thì tạo bug dev-fe |
| 4 | ES1-T156:250 nojs | Chưa xác nhận. Không phải lỗi markup, CSS trong phạm vi đã thử. Nghi vượt ngân sách 30 s | R4 đạt: select, bấm, POST 302, id cuối là variant đã chọn. R5: tắt JS thì ảnh lazy tải ngay. R6: evaluate, storageState không treo | Không chờ load (domcontentloaded); timeout riêng từng bước; POST bị chặn báo Cloudflare; POST lỗi báo status | Không | Đọc bước treo trên CI. Xem mục "Giả thuyết T156" |
| 5 | ES1-T179:205 AC-H24 | Test chọn sai phím. Chromium không cuộn ngang bằng End, kể cả trên overflow-x không có CSS theme; End cuộn trang | R1, R3: scrollLeft 0, khớp message CI. R2, TC-06: ArrowRight tới hết card 4 | Đổi sang ArrowRight thật tới hết card 4, thêm assert giữ focus, trang không cuộn | Không, xem mục "Mục 5" | ES1-T225; test đạt trên store; chưa đo Firefox, Safari |
| 6 | Axe T179, T180, T182 | Màn thử thách Cloudflare, theo ticket | TC-04 tĩnh | Gộp vào ES1-T224.spec.ts, không skip, vẫn báo chặn. retries 0 cho riêng test này | Không | Số màn thử thách mỗi shard trên CI |
| 7 | ES1-T191 thứ tự bài blog | Dữ liệu store, theo ticket đã sửa | `git status` không có ES1-T191.spec.ts | Không đổi test | Không | Test đạt trên CI |

## Mục 5: vì sao không tạo bug
Ticket ghi "nếu test đúng thì tạo bug dev-fe, không nới test". QA kết luận test chưa đúng:
- AC-H24 chỉ ghi "cuộn bằng chuột và bàn phím tới hết card 4", không nêu End.
- CSS không thể làm End cuộn ngang, nên bug dev-fe không có cách sửa trong phạm vi FE. Muốn có End phải viết JS, thuộc phía BE.
- Test mới chặt hơn ở phần tới hết card 4: trước đây dùng `scrollTo` bằng JS, nay dùng phím thật.

Điểm người review cần xem: test không còn kiểm End. Nếu Tech Lead coi End là bắt buộc, ES1-T225 ghi cách xử lý. Người dùng bấm End trong danh sách sẽ bị cuộn xuống cuối trang; đó là hành vi mặc định của Chromium.

## Giả thuyết T156
"Timeout 30 s" chỉ có thể từ bước không có timeout riêng, vì `expect` tự fail sau 5 s. Đọc code còn lại: goto, selectOption, click, waitForURL, readCartNoScript.
- Khác TE-4:1685 (cùng luồng, ticket không báo đỏ) ở chỗ trang có 5 band. R5 cho thấy tắt JS thì ảnh lazy tải ngay, nên load của `/?view=te13-states` có thể lâu hơn nhiều. Chưa đo được thời gian thật trên store.
- Regex cũ `/\/cart/` khớp cả `/cart/add` (R7), nên POST bị thử thách sẽ qua bước chờ và chỉ fail ở bước đọc giỏ. Bước này không giải thích timeout, nhưng là lỗ hổng của test, đã sửa.
- Sau khi sửa, CI sẽ báo 1 trong các dạng: "bị Cloudflare chặn"; "POST /cart/add" kèm status; timeout của `click`, `waitForResponse`, `waitForURL`. Lỗi code thì tạo bug dev-fe theo đúng bước đó.
- Nếu test đạt, chỉ chứng minh test không còn timeout, chưa chứng minh giả thuyết ảnh lazy.

## Thay đổi đáng chú ý ngoài 7 mục
- `support/product-data.ts`: `readCartNoScript` gọi thêm `expectNotChallenged`. Hàm này dùng chung cho T94, T100, T147, T148, T156, TE-4. Test helper ES1-T100:117 vẫn đạt.
- `support/store-guard.ts`: `gotoStore` nhận thêm `waitUntil`, mặc định không đổi. Thêm `isStoreRefresh`.
- Mới: `support/page-ready.ts`.
- Test axe gộp dùng `watchStore`. Bộ lọc này bỏ qua thêm log `shopifysvc.com` so với `watchConsole` cũ, và báo đủ vi phạm của cả 2 trang thay vì dừng ở trang đầu.
- Gộp axe bớt 4 lần tải trang mỗi project (6 còn 2), chưa tính retry. Hơn 30 spec khác vẫn có test axe riêng, nên số màn thử thách có thể vẫn cao; chưa đo được.

## Cùng rủi ro, chưa sửa
`ES1-T189.spec.ts:195` và `TE-3.spec.ts:560` vẫn dùng networkidle. Ticket không nêu 2 test này nên giữ nguyên. T189:195 mở cùng trang `/?view=figma` với T188, nên có thể đỏ cùng nguyên nhân.

## Chạy lại
- Tĩnh toàn bộ: `npx playwright test --config=drafts/qa/ES1-T224/pw.static.config.ts`, rồi `node drafts/qa/ES1-T217/static-summary.mjs drafts/qa/ES1-T224/static-result.json`
- Test của ticket không cần store: `npx playwright test --config=drafts/qa/ES1-T224/pw.t224.config.ts`
- Repro: `npx playwright test --config=drafts/qa/ES1-T224/pw.repro.config.ts`
- Cả 3 cần chạy ngoài sandbox để mở được Chromium.
