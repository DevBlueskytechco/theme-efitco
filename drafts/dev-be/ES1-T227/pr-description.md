KHÔNG CHẮC: CHƯA tìm ra nguyên nhân, chưa chạy thật như ticket yêu cầu. Phiên agent không gọi mạng, Chrome không chạy được trong sandbox, nên việc chạy thật chuyển cho CI của PR này. PR này chỉ thêm phép đo, chưa sửa lỗi. Merge xong ES1-T227 chưa xong: phải đọc log CI rồi kết luận theo bảng ở mục 3.

# ES1-T227: thăm dò getCart thật, siết hàm total của TC-25

## 1. Biết gì khi chưa chạy (đọc code)
- Theme không đụng `getCart`: `assets/cart-drawer.js:52` không configure, chỉ override `openCart`, `updateCart`. Điều này chưa loại trừ hẳn theme, vì chưa có số đo.
- `/cart.js` có 2 ngay trước assert (TC-25 đạt tới dòng 552 cũ), nên giỏ Ajax đúng. Chỉ phần đọc `getCart` là chưa rõ.
- Test có điểm yếu thật: `total` trả 0 với mọi shape lạ, nên assert giỏ rỗng ở đầu TC-25 đạt với bất kỳ giá trị nào. Field `totalQuantity` chưa được đối chiếu với thư viện thật: stub của QA tự trả field này (`drafts/qa/ES1-T203/stub-server.mjs:109`), ES1-T164 không nêu shape.
- `callAction` clone qua JSON, nên getter trên prototype sẽ mất và ra `{}`, cũng thành 0.

Các điểm trên làm giả thuyết "test đọc sai" đáng kiểm trước, nhưng chưa chứng minh được, nên không sửa theo hướng đó.

## 2. Thay đổi
- `tests/e2e/ES1-T203.spec.ts`: `total` chỉ tính `null` là 0, shape lạ thì fail kèm danh sách key. Chặt hơn, không nới. Assert `getCart trả giỏ mới` giữ nguyên. Hệ quả: nếu là lỗi shape, TC-25 sẽ đỏ sớm hơn, ở assert giỏ rỗng đầu test (dòng 545 mới), thay vì dòng 559 mới (553 cũ).
- `tests/e2e/ES1-T227.spec.ts` (mới, tạm): 2 kịch bản, phiên riêng, chạy trên cả 2 project.
  - A: phiên sạch, `updateCart` rồi mới `getCart` lần đầu.
  - B: đúng trạng thái TC-25, giỏ Ajax thêm rồi xoá về rỗng, `getCart` trước và sau `updateCart`.
  - Đọc ở các mốc: ngay sau `updateCart`, sau 5 s, sau khi mở lại trang.
  - Mỗi lần đọc in 1 dòng `[ES1-T227] {json}` và có attachment: constructor, key, key sau clone JSON, mọi đường dẫn số lượng, `/cart.js` trước và sau, cookie có khớp token Ajax không, các fetch phát sinh, với GraphQL thêm errors, `data.cart` null, token gửi đi có khớp không.
  - Không in token giỏ, chỉ in true/false.
  - Cố ý không assert giá trị `getCart`: TC-25 vẫn là nơi fail. Chỉ assert `/cart.js` = 2 để phép đo có nghĩa.
- `tests/e2e/support/action-probe.ts` (mới, tạm): hàm đọc không giả định shape.

Không đổi file theme. CI của PR này vẫn sẽ đỏ ở TC-25, trừ khi lỗi tự hết. Đó là kết quả chờ đợi, không được bỏ qua hay đánh `fixme`.

## 3. Đọc log CI thế nào
Tìm `[ES1-T227]`, xem mốc `ngay sau updateCart`. Xét từ trên xuống, lấy hàng đầu tiên khớp.

| Số đo | Kết luận | Việc tiếp |
| --- | --- | --- |
| `counts` có số 2 ở đường dẫn khác, hoặc `keys` có field mà `jsonKeys` không có | Test đọc sai | Sửa `total` và `callAction` trong ES1-T203, giữ assert = 2 |
| `threw`, hoặc GraphQL có `errors`, status lỗi | Storefront API từ chối, nghi preview hoặc password | Ghi nguyên văn lỗi, hỏi CTO, không sửa theme |
| GraphQL `sentAjaxToken` hoặc `answeredAjaxToken` false, `cookieMatchesAjax` true | `getCart` đọc giỏ khác giỏ Ajax | Hành vi Shopify, hỏi CTO. Không nới assert |
| A đạt 2, B ra 0 ở mốc này | `getCart` nhớ lần đọc đầu, hoặc lỗi do giỏ đã xoá về rỗng | Xem `calls` có request mới không, rồi tách tiếp |
| Ra 0 ngay sau, ra 2 sau 5 s hoặc sau khi mở lại trang | Trễ hoặc cache | Ghi rõ, hỏi CTO trước khi cho test chờ. Test mới được `poll` nếu CTO coi đây là hành vi đúng |
| Mọi mốc ra 0 hoặc `null`, `/cart.js` = 2, không có dấu hiệu nào ở trên | `getCart` sai thật, chưa rõ phía nào | Không nới assert, mở bug kèm số đo |

Sau khi kết luận: xoá `tests/e2e/ES1-T227.spec.ts`, `support/action-probe.ts` nếu không còn dùng.

## 4. Rủi ro
- Spec và helper chưa chạy trên trình duyệt thật, có thể tự đỏ vì lỗi của chính nó. Khi đó đọc lỗi trước khi tin số đo.
- `describe.serial` dừng ở test đỏ đầu tiên, nên TC-26, TC-27 chưa chạy trong CI lần 3. Chúng có thể còn lỗi riêng, sửa TC-25 xong mới lộ. TC-27 còn cộng dồn số lượng từ 2 test trước (kỳ vọng 4).
- Bảng ở mục 3 dựa trên suy luận từ đề ticket, chưa có đối chiếu với tài liệu Shopify ngoài phần trích ở ES1-T164.
- Thêm khoảng 12 lần mở trang store dev mỗi lần CI đủ (2 test x 2 project x 3 trang), và 4 lần gọi `updateCart`. Có thể tăng rủi ro 429.

## 5. Tự kiểm tra
- [x] `node --experimental-strip-types drafts/dev-be/ES1-T227/logic-check.mjs`: đạt. Chỉ kiểm logic trên object giả: getter prototype, bọc `{ cart }`, connection, `null`, ném lỗi, tham chiếu vòng, log không lộ token, `total` mới, assert 2 còn nguyên.
- [x] `node --experimental-strip-types --check` 3 file TS: đạt. Không có `tsc`, chưa kiểm kiểu.
- [x] `shopify theme check`: 100 file, 0 lỗi.
- [x] Bundle, locale: không đổi file nào trong `assets/`, `locales/`.
- [ ] Playwright, console trên preview: chờ CI.
- [ ] Lighthouse: chờ CI, không đổi code theme.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
