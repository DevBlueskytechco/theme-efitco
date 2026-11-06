KHÔNG CHẮC: không đọc được log CI run 42209030471, không chạy được trên store (api.github.com và store bị từ chối ở mức mạng). Dòng lỗi thật của từng test chưa đối chiếu. 10 dòng nhóm D chưa rõ nguyên nhân, đã hỏi ở ES1-T222.

# ES1-T217 — phân loại test đỏ, commit d5f3a3e

## Kết quả
- 32 dòng: ticket ghi "khoảng 30" và không có danh sách chính xác, nên QA tách theo từng test ticket nêu tên. ES1-T45 không ghi tên test nên chưa có dòng riêng, xem dòng 30.
- 7 dòng B đã có kết luận: 6 test đo sai đã sửa, 1 lỗi code.
- 4 dòng D là lỗi code đã tái lập: ES1-T218, ES1-T219, ES1-T220.
- 11 dòng còn lại (A và C) đã sửa nguyên nhân chung, chờ CI xác nhận.
- 10 dòng D chưa rõ nguyên nhân, không tạo bug khi chưa có bằng chứng.

Bằng chứng:
- Tĩnh: chạy local, thấy kết quả thật.
- Repro: JS, CSS thật trên trang giả, thư viện partial giả.
- Đọc code: chỉ suy luận từ mã nguồn, chưa chạy.
- Chưa rõ: chưa có đủ dữ liệu để kết luận.

## Sửa nhóm A
Đọc phân loại sơ bộ: 64 dòng 429 và 12 dòng meta-refresh là số trong ticket, QA chưa thấy log gốc.
- `support/console-guard.ts`: thêm `isResource429Log`, đi qua predicate của `watchShopPay403` mà 40 spec dùng chung. Chỉ khớp đúng log mạng của Chrome ở mức 429.
- 38 spec, mọi `new AxeBuilder`: thêm `expectNotChallenged(page)` ngay trước khi quét. Màn thử thách làm test fail với "bị Cloudflare chặn". Không tắt rule axe nào: TC-07 chứng minh meta refresh trên trang thường vẫn bị báo.
- Theme không tự có meta refresh: `snippets/meta-tags.liquid` chỉ có X-UA-Compatible. Việc 12 dòng meta-refresh đến từ màn thử thách vẫn là suy luận.

## Bảng
| # | Test | Nhóm | Nguyên nhân | Xử lý | Bằng chứng |
| --- | --- | --- | --- | --- | --- |
| 1 | ES1-T156:223 AC2 axe, console | A | Log 429, màn thử thách | Sửa chung | Đọc code, chờ CI |
| 2 | ES1-T157:211 AC3-markup axe, console | A | Như trên | Sửa chung | Đọc code, chờ CI |
| 3 | ES1-T158:750 AC3 đang chạy axe, console | A | Như trên | Sửa chung | Đọc code, chờ CI |
| 4 | ES1-T179:252 axe, console | A | Như trên | Sửa chung | Đọc code, chờ CI |
| 5 | ES1-T180:251 axe, console | A | Như trên | Sửa chung | Đọc code, chờ CI |
| 6 | ES1-T181:97 axe footer, console | A | Như trên | Sửa chung | Đọc code, chờ CI |
| 7 | ES1-T182:176 axe, console | A | Như trên | Sửa chung | Đọc code, chờ CI |
| 8 | ES1-T183:194 axe, console | A | Như trên | Sửa chung | Đọc code, chờ CI |
| 9 | ES1-T184:103 console, axe | A | Như trên | Sửa chung | Đọc code, chờ CI |
| 10 | ES1-T94:199 CSS cart | B, test đo sai | Vùng cắt tới Gift card nên ăn cả block mới; các mã màu đều nằm trong comment của block khác | Cắt tới Image with text, TC-04 quét toàn file | Tĩnh, xanh |
| 11 | ES1-T95:181 CSS drawer | B, test đo sai | Như dòng 10 | Như dòng 10 | Tĩnh, xanh |
| 12 | ES1-T184:55 CSS block | B, test đo sai | Vùng cắt tới Testimonials nên ăn cả block sau | Cắt tới Shop by level, bỏ comment | Tĩnh, xanh |
| 13 | ES1-T186:66 CSS block | B, test đo sai | Vùng cắt tới Testimonials, comment có #000 | Cắt tới Blog posts, bỏ comment | Tĩnh, xanh |
| 14 | ES1-T189:102 trần, không fetch, hook | B, test đo sai | Regex khớp chữ "no fetch" ở comment dòng 1, code không fetch | Bỏ dòng comment trước khi kiểm | Tĩnh, xanh |
| 15 | ES1-T190:44 schema, token | B, lỗi code | DESIGN.md và docs/tokens.json thiếu badge_new, 2 patch chưa áp | Bug ES1-T221, giữ đỏ | Tĩnh, đỏ đúng |
| 16 | ES1-T171:137 TC-12 đường dẫn Cart API | B, test đo sai | T149, T158 ghi thẳng /cart/add.js | Đổi sang `CART.add`, `CART_GLOB.add` | Tĩnh, xanh |
| 17 | ES1-T175:64 12 band | C, không đúng như sơ bộ | Spec đã được cập nhật ở T184, T191; thứ tự template khớp ROWS khi đọc. Assert còn lại có thể đỏ là `errors` với log 429 | Không sửa assert, nhận sửa chung của nhóm A | Đọc code, chờ CI |
| 18 | ES1-T175:119 / không có multicolumn | C, không đúng như sơ bộ | index.liquid không gọi 2 block này (test tĩnh xanh), nên assert có thể đỏ là `errors` với log 429 | Như dòng 17 | Tĩnh một phần, chờ CI |
| 19 | ES1-T139:140 double click | D, lỗi code | Focus ở input bước sau, không ở tiêu đề | Bug ES1-T219, giữ đỏ | Repro R3 |
| 20 | ES1-T139:301 đổi nhanh bước cuối | D, lỗi code | `root()` null sau khi xoá data-quiz-count: 0 request mới, kẹt aria-busy | Bug ES1-T218, giữ đỏ | Repro R2 |
| 21 | ES1-T139:347 Back khi đang tải | D, lỗi code | Cùng nguyên nhân: Back ném lỗi, kẹt ở bước 3 | Bug ES1-T218, giữ đỏ | Repro R1 |
| 22 | ES1-T156:250 nojs select + POST | D, chưa rõ | Đã loại giả thuyết evaluateAll khi tắt JS (R8). Có thể do store khi POST không JS | Giữ nguyên | Chưa rõ |
| 23 | ES1-T158:315 AC-H22 đổi variant | D, chưa rõ | Test có `errors` nên 429 có thể là một phần; "giá trống" trong ticket chưa giải thích được | Giữ nguyên | Chưa rõ |
| 24 | ES1-T158:486 band B JSON | D, chưa rõ | Code return trước fetch khi có từ 2 block. Có thể band không render vì thiếu dữ liệu, chưa kiểm được | Giữ nguyên | Chưa rõ |
| 25 | ES1-T158:690 lỗi video | D, chưa rõ | JS đạt trên trang giả (R7). Test có `errors` và axe nên có thể là A | Giữ nguyên, nhận sửa chung | Repro R7 đạt |
| 26 | ES1-T158:710 không product | D, chưa rõ | JS đạt trên trang giả (R7). Lỗi trên store chưa giải thích được | Giữ nguyên | Repro R7 đạt |
| 27 | ES1-T185:224 nút focus bị ẩn | D, lỗi code | Focus rơi về body khi nút tự ẩn | Bug ES1-T220, giữ đỏ | Repro R4, R4b |
| 28 | ES1-T191:138 5 card | D, chưa rõ | CSS tính ra 336 x 448. Test có `errors` nên có thể là A, hoặc thiếu dữ liệu blog | Giữ nguyên, nhận sửa chung | Chưa rõ |
| 29 | ES1-T203:536 TC-25 refresh lặp | D, chưa rõ | Code gọi refresh 1 lần. Bộ đếm tính mọi fetch cùng pathname `/`, nên có thể đếm nhầm, nhưng không biết số thật | Giữ nguyên | Chưa rõ |
| 30 | TE-1:713 TB-05, và test ES1-T45 không rõ tên | D, chưa rõ | Timeout. TB-05 chỉ có goto và 2 assert, testid đúng; nghi store chậm | Giữ nguyên | Chưa rõ |
| 31 | ES1-T179 AC-H24 (:180, :205 hoặc :223) | D, chưa rõ | Ticket không nói test nào. CSS thật đạt đo 1920, 1280 trên cả 2 project (R5, R6), khác markup thật có thể là nguyên nhân | Giữ nguyên | Repro R5, R6 đạt |
| 32 | ES1-T180:158 hàng 8 xuống dòng | D, chưa rõ | Nghi đếm dòng trước khi font về | Thêm chờ document.fonts.ready | Giả thuyết, chờ CI |

## Khác với phân loại sơ bộ
- C không phải "spec cũ": ES1-T175 đã được cập nhật theo block mới.
- ES1-T189 không phải lỗi code: JS không fetch, regex khớp chữ trong comment.
- T94, T95, T184, T186 không có màu literal thật: toàn bộ mã màu trong base.css nằm trong comment.

## Bug đã tạo
| Key | File | Test | Agent | Mức |
| --- | --- | --- | --- | --- |
| ES1-T218 | assets/quiz-finder.js | ES1-T139:301, :347 | dev-be | P3 |
| ES1-T219 | assets/quiz-finder.js | ES1-T139:140 | dev-be | P4 |
| ES1-T220 | assets/scroll-buttons.js | ES1-T185:224 | dev-be | P3 |
| ES1-T221 | DESIGN.md, docs/tokens.json | ES1-T190:44 | dev-fe | P4 |

Công cụ tạo ticket không có trường priority, nên cả 4 bug đang là `none`. Ticket yêu cầu high: cần đặt tay.
Không dùng test.fixme: 3 bug khách thấy được, ES1-T221 giữ đỏ vì fixme sẽ che phần còn lại của test.

## Chạy lại
- Danh sách: `npx playwright test --list`
- Tĩnh: `npx playwright test --config=drafts/qa/ES1-T217/pw.static.config.ts`, rồi `node drafts/qa/ES1-T217/static-summary.mjs drafts/qa/ES1-T217/static-result.json`
- Repro: `npx playwright test --config=drafts/qa/ES1-T217/pw.repro.config.ts`
- Cả 2 config cần chạy ngoài sandbox để mở được Chromium.
