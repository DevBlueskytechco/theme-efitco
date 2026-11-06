KHÔNG CHẮC: JS và spec chưa chạy trên trình duyệt: Chrome bị sandbox chặn (Mach port), repro R3 của QA chết lúc khởi động trình duyệt. Việc preventDefault ở mousedown giữ được focus mới chỉ suy luận từ hành vi chuẩn, DOM giả trong logic-check tự giả định điều này. Chờ CI chạy ES1-T139:140, ES1-T219.spec.ts và R3.

# ES1-T219: double click để focus ở input bước sau

## Nguyên nhân
Đúng như QA nghi ngờ. Click lần 1 sang bước mới và focus tiêu đề. Lần bấm 2 rơi vào input của bước mới nằm dưới con trỏ, trình duyệt chuyển focus ngay từ mousedown. Code cũ chỉ preventDefault ở click nên chặn được việc chọn hộ, không chặn được focus.

## Thay đổi
- `assets/quiz-finder.js`: nghe thêm `mousedown` trên form, `detail > 1` thì preventDefault. Nhánh này đứng trước logic click nên mousedown không chạy Back hay `next()`.
- `assets/quiz-finder.js`: rút comment để giữ trần 4352 B. Không đổi logic. Đổi tên biến vòng lặp `type` thành `t`.
- `tests/e2e/ES1-T219.spec.ts` (mới): double click bước 1; bấm thường sau double click; lần bấm 2 rơi ngoài lựa chọn; double click bước cuối; bấm thường Back.
- `drafts/dev-be/ES1-T219/logic-check.cjs` (mới): kiểm logic trên DOM giả. Không thay được E2E.

Không đổi markup, Liquid, CSS, locale. Spec ES1-T139 không đổi, test `:140` dùng làm nghiệm thu.

## Quyết định ngoài chữ ticket
- Chặn ở mousedown thay vì focus lại tiêu đề ở click. Focus lại ở click sẽ cướp focus khỏi tiêu đề kết quả khi double click bước cuối mà kết quả về trước lần bấm 2.
- Chặn trên cả form, không chỉ `label`: bước mới có bố cục khác thì lần bấm 2 có thể rơi vào khe giữa các hàng hoặc subheading, khi đó focus về body. Đổi lại không double click chọn từ được trong tiêu đề, subheading của quiz. Kéo chuột bôi đen vẫn được; khu vực kết quả nằm ngoài form nên không ảnh hưởng.

## Giới hạn còn lại (không đổi trong PR này)
- Double click Back ở bước 3 lùi 2 bước: nhánh Back không xét `detail`. AC2 ghi Back quay lại nhưng không nói double click. Chưa tái lập trên trình duyệt, kết luận từ đọc code.
- Double click Back ở bước 2: Back ẩn sau click 1, lần bấm 2 có thể rơi ra ngoài form thì focus về body. Chưa đo.
- Không còn dư byte: 4349/4352 B. Sửa tiếp file này gần như chắc phải xin nâng trần.

## Tự kiểm tra
| Mục | Kết quả |
| --- | --- |
| `logic-check.cjs` T219 bản đã sửa | 6/6 ok |
| `logic-check.cjs` T219 bản trước khi sửa | 2 FAIL (focus ở input bước 2; focus về body); 4 ca còn lại ok |
| `logic-check.cjs` T218 (chống hồi quy) | 7/7 ok |
| `shopify theme check` | 0 offense, 100 file |
| `wc -c assets/quiz-finder.js` | 4349 B; trần 4352 B (contract ES1-T139), 8192 B/file |
| `node --experimental-strip-types --check` spec | Qua |
| Locale JSON | Không đổi |
| Repro R3 của QA, desktop | Không chạy được: Chrome chết ở Mach port trong sandbox |
| Preview, Playwright, console, Lighthouse | Chờ CI |

🤖 Generated with [Claude Code](https://claude.com/claude-code)
