KHÔNG CHẮC: JS và spec chưa chạy trên trình duyệt: phiên agent không mở được Chrome (sandbox chặn Mach port, chạy ngoài sandbox bị từ chối), nên chưa chạy repro R1, R2 của QA, ES1-T139:301, :347 và ES1-T218.spec.ts. Chờ CI. Log CI run 42209030471 chưa đối chiếu được (ghi trong ticket), nên chưa khẳng định 2 test đỏ trên CI chỉ do lỗi này.

# ES1-T218: quiz kẹt khi Back hoặc đổi đáp án lúc kết quả đang tải

## Nguyên nhân
`finish()` gỡ `data-quiz-count` để nhận biết lỗi partial, nhưng `root()` lại tìm phần tử theo chính thuộc tính đó. Từ lúc gỡ tới khi apply xong, `root()` trả null:
- Back: `clear()` ném lỗi `replaceChildren` trước `show()`, nên kẹt ở bước 3.
- Đổi đáp án: `finish()` lần 2 ném lỗi `removeAttribute` trước fetch, nên 0 request, `aria-busy` không được gỡ.

Đúng như QA nghi ngờ trong ticket.

## Thay đổi
- `assets/quiz-finder.js`: đặt `data-quiz-count=""` thay vì gỡ. `root()` vẫn tìm được phần tử. Nhận biết lỗi giữ nguyên: sau apply mà giá trị vẫn rỗng thì `parseInt` ra NaN, đi nhánh sang search, không nhầm với 0 sản phẩm.
- `tests/e2e/ES1-T218.spec.ts` (mới): Back khi đang tải; đổi đáp án khi đang tải; Back rồi trả lời lại; response 200 không có partial vẫn sang search.
- `drafts/dev-be/ES1-T218/logic-check.cjs` (mới): kiểm logic trên DOM giả, thư viện partial giả. Không thay được E2E.

Không đổi markup, Liquid, locale. `data-quiz-count` chỉ có quiz-finder.js đọc; base.css không dùng thuộc tính này.

## Quyết định ngoài chữ ticket
- Không giữ tham chiếu root trong biến để so sánh trước và sau apply: `apply()` có thể sửa phần tử tại chỗ thay vì thay mới, nên so sánh tham chiếu không tin được. Giá trị rỗng thì đúng trong cả 2 cách.

## Giới hạn còn lại (không đổi trong PR này)
- Back khi `partials.apply` đang chạy mà trả lời lại ngay, và response mới không có partial nhưng không ném lỗi: có thể đọc số đếm của apply cũ thay vì sang search. Ca rất hẹp, chưa đo.
- Nếu thư viện thật bỏ qua `signal`: Back vẫn về bước 2 ngay, nhưng `aria-busy` nằm trên panel đang ẩn tới khi response cũ về, và ES1-T139:301 (chờ `requestfailed`) sẽ đỏ. CI sẽ cho biết.

## Tự kiểm tra
| Mục | Kết quả |
| --- | --- |
| `logic-check.cjs` bản đã sửa | 7/7 ok |
| `logic-check.cjs` bản trước khi sửa | 3 FAIL (R1, R2, Back rồi trả lời lại), cùng lỗi `replaceChildren` như ticket; 4 ca còn lại ok |
| `shopify theme check` | 0 offense, 100 file |
| `wc -c assets/quiz-finder.js` | 4350 B; trần 4352 B (contract ES1-T139), 8192 B/file |
| `node --experimental-strip-types --check` spec | Qua |
| Locale JSON | Không đổi |
| Preview, Playwright (ES1-T139, ES1-T218, repro R1 R2), console, Lighthouse | Chờ CI |

Spec ES1-T139 không đổi. ES1-T218.spec.ts ghi `KHÔNG CHẮC` ở đầu file vì chưa chạy.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
