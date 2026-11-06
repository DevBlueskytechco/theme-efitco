KHÔNG CHẮC: bản sửa chưa chạy trên trình duyệt. Chrome chết ở Mach port trong sandbox, chạy ngoài sandbox bị từ chối, nên repro R4, R4b của QA chưa chạy được ở phiên này. Nguyên nhân là suy luận từ nhật ký R4b trong ticket, chưa đo trực tiếp. Nếu CI vẫn đỏ ở ES1-T185:224 thì nguyên nhân khác, cần đọc lại nhật ký R4b sau bản sửa.

# ES1-T220: nút next/back tự ẩn làm focus rơi về body

## Nguyên nhân
Theo nghi ngờ của QA, chưa đo trực tiếp. `s()` gán `hidden` rồi mới đọc `document.activeElement.hidden`. Nhật ký R4b ghi `focusout` của nút prev và không có `focusin`, sau đó `activeElement` là BODY. Nhiều khả năng lúc đọc thì `activeElement` đã là body, `body.hidden` là false nên `focus()` không chạy.

Ghi chú ES1-T185 chỉ tránh đọc layout sau khi ghi `hidden`, chưa tránh đọc `activeElement` sau khi ghi. PR này sửa chỗ đó.

## Thay đổi
- `assets/scroll-buttons.js`: lưu `document.activeElement` vào `a` trước khi gán `hidden`, sau đó xét `a.hidden`. Áp dụng cho cả 2 đầu vì dùng chung một dòng.
- `assets/scroll-buttons.js`: bỏ 7 dấu chấm phẩy cuối dòng (ASI an toàn) để giữ đúng trần 768 B của ES1-T185. Không đổi logic khác. `const a..., x...;` và `t.onscroll = s;` phải giữ dấu chấm phẩy vì dòng sau mở đầu bằng `[` và `(`.
- `tests/e2e/ES1-T220.spec.ts` (mới): back tự ẩn, next tự ẩn (QA chưa đo riêng nhánh này), bấm tiếp bằng Enter sau khi chuyển focus, reduced-motion, chuột, không cướp focus khi focus ở khung cuộn, giữ focus khi nút còn hiện, thứ tự đọc trong file và trần byte.
- `drafts/dev-be/ES1-T220/logic-check.cjs` (mới): DOM giả, không thay được E2E.

Không đổi markup, Liquid, CSS, locale. Spec ES1-T185 không đổi, test `:224` dùng làm nghiệm thu.

## Giới hạn của bằng chứng
`logic-check.cjs` chạy 2 giả định về thời điểm mất focus:
- `ngay` (activeElement thành body ngay khi gán `hidden`, khớp nhật ký R4b): bản cũ đỏ đúng 2 ca nút tự ẩn, bản mới xanh.
- `tre` (activeElement giữ tới lượt render, cách đọc focus fixup của HTML spec): cả bản cũ và bản mới đều xanh.

Giả định `ngay` do tôi đặt theo nhật ký, DOM giả không chứng minh Chrome làm vậy. Nếu Chrome thật theo `tre` thì bản cũ đáng lẽ không lỗi, tức nguyên nhân nằm chỗ khác và bản sửa này có thể chưa đủ. Chỉ R4b và ES1-T185:224 trên trình duyệt mới kết luận được.

## Giới hạn còn lại (không đổi trong PR này)
- Cả 2 nút cùng ẩn khi đang focus (đổi cỡ màn hình tới mức không tràn): focus vẫn mất, đã chấp nhận ở ES1-T185.
- File không còn dư byte: 768/768 B. Sửa tiếp gần như chắc phải xin nâng trần; ES1-T209 vẫn đang mở.

## Tự kiểm tra
| Mục | Kết quả |
| --- | --- |
| `wc -c assets/scroll-buttons.js` | 768 B; trần 768 B (contract ES1-T185), 8192 B/file |
| `logic-check.cjs` bản đã sửa | 14/14 ok (7 ca × 2 giả định) |
| `logic-check.cjs` bản trước khi sửa | 2 FAIL ở giả định `ngay`; giả định `tre` xanh hết |
| `shopify theme check` | 0 offense, 100 file |
| `node --check` JS, `node --experimental-strip-types --check` spec | Qua; spec chưa type-check (không có `tsc`) |
| Locale JSON | Không đổi |
| Repro R4, R4b của QA, desktop | Không chạy được: Chrome chết ở Mach port |
| Preview, Playwright ES1-T185, ES1-T220, console, Lighthouse | Chờ CI |

🤖 Generated with [Claude Code](https://claude.com/claude-code)
