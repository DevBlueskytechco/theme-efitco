KHÔNG CHẮC: chưa thử trên trang thật như ticket yêu cầu, chưa chạy spec nào trên trình duyệt: Chrome chết lúc khởi động trong sandbox (thử lại ở phiên này, không dùng mạng), agent không gọi mạng nên cũng không đọc được log CI ngoài phần ticket trích. Mục 1 có bằng chứng từ mã nguồn Playwright. Mục 2 và 4 là suy luận, chưa tận mắt thấy. Mục 3 chưa tìm ra nguyên nhân gốc. Chờ CI.

# ES1-T223: quiz-finder double click, featured-product-status, video card 4

## Kết quả theo từng dòng lỗi
| Dòng | Kết luận | Mức chắc | Sửa ở đâu |
| --- | --- | --- | --- |
| ES1-T219:44 focus | Test sai | Chắc, đọc từ mã nguồn Playwright | Spec |
| ES1-T219:53 2 request | Nhiều khả năng test đếm cả hop redirect | Suy luận | Spec |
| ES1-T158:315 status trống | Lỗi code, chưa rõ nguyên nhân gốc | Bản sửa không phụ thuộc nguyên nhân, trừ 1 trường hợp nêu dưới | `assets/product-variant-picker.js` |
| ES1-T158:710 video card 4 | Card có render, test mở trang 2 lần | Suy luận | Spec |

`assets/quiz-finder.js` không đổi. Đọc lại luồng sự kiện không thấy lỗi, nên ticket nói "bản sửa ES1-T219 chưa đúng" thì tôi chưa thấy bằng chứng cho kết luận đó. Nếu CI vẫn đỏ ở `:53` thì kết luận của tôi sai, xem mục 2.

## 1. ES1-T219:44: test sai
Comment trong spec ghi `mouse.click` với `clickCount: 2` tạo 1 lần bấm có detail 2. Sai: `node_modules/playwright-core/lib/coreBundle.js:22679` lặp `cc = 1..clickCount`, tức bấm 2 lần, detail 1 rồi 2. Lần detail 1 rơi vào chữ progress, không focus được, nên focus rời tiêu đề. Đây là hành vi đúng của trình duyệt khi bấm thường vào vùng trống, không phải lỗi double click.

Sửa helper `secondPress` thành `mouse.move`, `mouse.down({ clickCount: 2 })`, `mouse.up({ clickCount: 2 })`, đúng 1 lần bấm detail 2. Test không bị nới: vẫn đòi tiêu đề giữ focus sau lần bấm thứ 2. Đây là lỗi của chính tôi ở ES1-T219.

Không chặn focus cho cả lần bấm detail 1: như vậy mất bôi đen chữ trong form để làm vừa một test sai.

## 2. ES1-T219:53: 2 request
Đọc code: input phủ cả hàng (`assets/base.css:5907`), lần bấm 1 gọi `finish()`, lần bấm 2 có `detail > 1` nên `preventDefault` và không gọi lại. `finish()` chỉ chạy 1 lần. ES1-T139:140 và ES1-T219:25 đi cùng nhánh này và không nằm trong danh sách đỏ của ticket.

Nghi vấn: sự kiện `request` của Playwright phát thêm cho mỗi hop redirect. Bộ `quiz-lower+quiz-advanced+quiz-gym` đi qua tag có thể chưa gắn sản phẩm nào: ES1-T134 và ES1-T178 còn Open, `tests/e2e/store-data.json` không có `TE11_TAGS_READY`. Khi đó Shopify redirect bỏ tag (ES1-T133 #1).

Chưa xác nhận: ticket chỉ trích 1 URL, tôi không thấy URL của request thứ 2.

Sửa spec: chỉ đếm request có `redirectedFrom()` rỗng, tức request do JS gửi. Nếu JS thật sự gửi 2 lần, test vẫn đỏ. Thông báo lỗi in mọi hop để đọc được ngay trên CI.

Hệ quả cần biết: nếu tag thật sự chưa có trên store, quiz đang chạy nhánh redirect, không phải bộ rỗng thật. ES1-T178 cần xong thì AC bộ rỗng mới được kiểm đúng nghĩa.

## 3. ES1-T158:315: status trống
Chưa tìm ra nguyên nhân gốc. Đọc code cũ thì sau `apply` có gọi `announce`, và DOM giả với `apply` thành công cũng ghi status, nên DOM giả không tái lập được lỗi. Trên CI chỉ biết giá và nút đã đổi, status trống. Khả năng còn lại: `apply` ném lỗi sau khi đã đổi DOM (rơi vào `catch` im lặng), hoặc có gì đó xoá status. Tôi không phân biệt được nếu không có trình duyệt.

Sửa: status lấy từ `price_html` trong JSON của variant, ghi trong `finally`, không phụ thuộc kết quả partial. Thêm nhãn Sold out khi variant hết hàng. Nhiều block (nhánh JSON) trước đây không báo gì, nay cũng báo.
- Request bị huỷ thì không ghi: đổi nhanh chỉ báo variant cuối, không đè chữ Unavailable.
- Trang sản phẩm không có `price_html`: vẫn báo theo inventory như cũ (TE-4:853).
- Khi partial lỗi, status báo giá variant đã chọn trong lúc giá hiển thị còn là giá cũ. Hidden `id` đã là variant mới nên status đúng với thứ sẽ được thêm vào giỏ.

Bản sửa KHÔNG cứu được trường hợp có thứ khác xoá status sau khi `update` xong. Nếu CI vẫn đỏ ở `:340` thì nguyên nhân là chỗ đó.

## 4. ES1-T158:710: video card 4
Trả lời câu hỏi của ticket: card có render. `te13-video-4` có `video_id` và `video_host`, Liquid ra `card_kind = external` không cần product. Dữ liệu test không sai.

Khác biệt duy nhất so với các test AC4 không đỏ: test này `goto` 2 lần trong timeout 30 s mặc định, và comment dòng 5 của spec đã ghi store có thể chặn request lặp. Nghi vấn: hết giờ hoặc bị chặn ở lần tải thứ 2. Chưa xác nhận. Khác biệt khác đã loại: không thấy trong JS, CSS; card 4 không có product, poster, nhưng markup khung giống card 2.

Sửa: bỏ lần `goto` đầu, lưu `href` gốc bằng init script trước module, kiểm thêm đó là URL YouTube. Không nới: vẫn so `href` sau lỗi với `href` gốc.

## Thay đổi ngoài chữ ticket
- `assets/product-variant-picker.js` đổi thụt lề 2 dấu cách sang tab để có chỗ trong trần 7168 B, cả file hiện trong diff. Xem bằng `git diff -w`: 17 dòng. Tiền lệ: ES1-T189.
- Bỏ mã ticket `(ES1-T66, ES1-T158)` ở comment đầu file, cùng lý do.

## File
- `assets/product-variant-picker.js`: `sayPrice()`, ghi status trong `finally` và nhánh nhiều block.
- `tests/e2e/ES1-T219.spec.ts`: `secondPress`, đếm request.
- `tests/e2e/ES1-T158.spec.ts`: test `:710` mở trang 1 lần.
- `tests/e2e/ES1-T223.spec.ts` (mới): status đúng giá; partial lỗi; hết hàng; nhiều block.
- `drafts/dev-be/ES1-T223/logic-check.cjs` (mới): DOM giả, không thay được E2E.

Không đổi markup, Liquid, CSS, locale.

## Tự kiểm tra
| Mục | Kết quả |
| --- | --- |
| `logic-check.cjs` T223 bản đã sửa | 9/9 ok |
| `logic-check.cjs` T223 bản cũ | 6 FAIL, 3 ok. Ca `apply` thành công fail chỉ vì stub trả chữ khác, code cũ vẫn ghi status: không chứng minh được lỗi CI |
| `logic-check.cjs` T158 (chống hồi quy) | pass |
| `shopify theme check` | 0 offense, 100 file |
| `wc -c` picker | 7163 B, trần 7168 B |
| `wc -c` quiz-finder, featured-product | 4349 / 4352 B, 2290 / 2304 B, không đổi |
| `node --check`, `--experimental-strip-types --check` 3 spec | Qua |
| Locale JSON | Không đổi |
| Thử trên trang thật | KHÔNG làm được: Chrome chết lúc khởi động, không có mạng |
| ES1-T219:44, :53, ES1-T158:315, :710, ES1-T223.spec | Chờ CI |
| Preview, console, Lighthouse | Chờ CI |

🤖 Generated with [Claude Code](https://claude.com/claude-code)
