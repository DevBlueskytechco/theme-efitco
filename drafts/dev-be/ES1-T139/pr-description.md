KHÔNG CHẮC: (1) JS và spec chưa chạy lần nào: phiên agent không có trình duyệt, E2E, axe, console, lhci chờ CI; CTO 06/11 tắt e2e, lighthouse trên CI tới khi trang chủ xong (vars.RUN_STORE_TESTS=false), nên PR này chỉ qua theme-check và preview, chưa được coi là đã kiểm. (2) Hành vi `partials.fetch` khi server trả 500 hoặc response không có partial chưa rõ (ném lỗi hay trả update rỗng): JS xử lý được cả 2 hướng, xem "Quyết định". (3) Ẩn 1 bước bằng `show_item` thì kết quả luôn rỗng vì `required_tags: 3` cố định: hỏi Tech Lead ở ES1-T207, mặc định không đổi.

# ES1-T139 TE-11-BE1: lazy-module + quiz-finder

## Thay đổi
- `assets/lazy-module.js` (mới, 379/384 B): quét `[data-lazy-module]`, IntersectionObserver rootMargin 200px, import động URL trong thuộc tính, lỗi import thì im lặng (form vẫn dùng được). Không biết gì về quiz.
- `assets/quiz-finder.js` (mới, 4352/4352 B, không còn byte dư): custom element `quiz-finder`.
  - Khi kết nối: đổi input thành radio, tên riêng theo bước, giữ checked, tới bước đầu chưa trả lời, đặt `data-enhanced`.
  - Sang bước: click, chạm, vùng body map, Enter, Space. Phím mũi tên chỉ đổi lựa chọn.
  - Mỗi lần đổi bước: `data-active`, focus h3, ghi `Step n of 3` vào status.
  - Back: quay 1 bước, giữ lựa chọn, huỷ request, ẩn và xoá kết quả; ẩn nút ở bước 1.
  - Xong bước cuối: `partials.fetch("quiz-results", { url, signal })` rồi `apply`, URL `{data-results-url}/{a}+{b}+{c}?view={data-results-view}`. 1 AbortController, `aria-busy` trên `data-quiz-results-panel`, gỡ trong finally.
  - Có kết quả: status từ `data-label-results`. 0 kết quả: hiện `data-quiz-empty`, status là text rỗng. Focus tiêu đề vùng kết quả.
  - Lỗi: trả input về checkbox `filter.p.tag` rồi `form.submit()`, cùng URL với đường không JS. Không retry.
- `blocks/quiz.liquid`: thẻ script `lazy-module.js`, thuộc tính `data-lazy-module`, cả 2 không render trong editor và với `results_view`; thêm dòng vào `{% doc %}`. Không đổi markup khác.
- `tests/e2e/ES1-T139.spec.ts` (mới).
- `tests/e2e/ES1-T137.spec.ts`: 3 test chỉ đúng trước khi nâng cấp (quiz ở đầu `?view=te11` nên module nạp ngay) nay chặn file module, thay cho `isEnhanced` vốn có race. Test bỏ chọn trước đây skip khi đã nâng cấp, nay chạy thật.

## Quyết định ngoài chữ ticket
- Không dùng `event.detail > 0` để nhận biết pointer. Lý do: comment ES1-T183, click label chuyển tiếp có `detail` tuỳ trình duyệt. Thay bằng: mọi click trên option đều sang bước, trừ click do phím mũi tên sinh ra (cờ đặt ở keydown, xoá ở click). Kết quả đúng như ticket yêu cầu, và không kẹt khi trình đọc màn hình kích hoạt radio với `detail` 0 trên mobile (không có Enter, không có nút Next). Đoạn về `detail` của trình đọc màn hình là suy luận, chưa đo.
- JS không đặt trạng thái cho vùng body map: CSS `:has` đã đồng bộ (comment ES1-T183). Bấm vùng đi chung đường click option.
- Thêm ngoài ticket: chặn click thứ 2 của double click (`detail > 1` trên label). Không chặn thì click thứ 2 rơi vào bước sau và chọn hộ khách.
- Nhận biết lỗi partial: gỡ `data-quiz-count` trước khi fetch, sau `apply` không có lại thì coi là lỗi, sang search. Nhờ vậy không phụ thuộc `partials.fetch` có ném lỗi với 500 hay không, và không nhầm với 0 kết quả.
- Panel kết quả chỉ hiện sau `apply`, không hiện trong lúc tải: tránh nhảy bố cục 2 lần. Trong lúc tải chỉ có `aria-busy`, chưa có chỉ báo nhìn thấy được vì base.css không có style cho trạng thái này; mạng chậm thì khách không thấy gì tới khi có kết quả. Cần thì mở ticket FE.
- `.quiz-step__count` là class, không phải hook trong D9: đọc chữ `Step n of 3` từ đó vì không được đổi markup.

## Giới hạn do trần byte
- Không có `disconnectedCallback`: phần tử không bị gỡ trên storefront, editor không nạp JS. Listener nằm trên form con nên không rò. Nếu sau này gỡ động thì request đang chạy không bị huỷ.
- Sau khi sang search do lỗi, quay lại bằng bfcache thì reload trang thay vì khôi phục, vì input đã về checkbox.
- Reload trang: trình duyệt có thể không khôi phục lựa chọn nếu khôi phục sau khi module đổi `name`, `type`; khách làm lại từ đầu, không kẹt. Chưa đo.
- `partials.apply` đang chạy mà khách đổi lựa chọn ở bước cuối: không huỷ được apply, lần sau ghi đè.
- Comment đã rút gọn, file sát trần: thêm logic phải gỡ bớt hoặc xin nâng trần.

## Ngân sách JS (D8, ADR 0006, `wc -c`)
| Trang | Thành phần | Tổng (B) | Trần 40 960 |
| --- | --- | --- | --- |
| Trang chủ, tải sẵn | nền 31 990 + lazy-module 379 | 32 369 | còn 8 591 |
| Trang chủ, sau khi cuộn tới quiz | + quiz-finder 4 352 | 36 721 | trần sau cuộn 65 536 (ADR 0006 bổ sung), còn 28 815 |
| Sản phẩm, collection, cart, search | Không đổi | — | — |

Nền 31 990 cộng tay theo thẻ script: standard-events, header-menu, header-sticky, slideshow, product-swatch, cart-drawer, cart-items. Khác số 32 481 của D8 vì đo lại trên develop hiện tại. Số sau cuộn mới tính riêng phần quiz, chưa cộng JS nạp động của TE-8, TE-12, TE-13.

## Tự kiểm tra
- `wc -c`: lazy-module.js 379 ≤ 384, quiz-finder.js 4352 ≤ 4352.
- `shopify theme check`: 87 file, 0 lỗi. `node --check` 2 file JS, `node --experimental-strip-types --check` ES1-T139, ES1-T137: ok.
- Không đổi locale. Không đổi markup ngoài thẻ script và `data-lazy-module`.
- Contract tên partial `quiz-results`: có test trong spec, chưa chạy; đã đối chiếu tay với `blocks/quiz.liquid`.
- `npx playwright test tests/e2e/ES1-T139.spec.ts -g "AC2|AC3"` desktop + Pixel 7, hồi quy ES1-T137, ES1-T138, ES1-T183, TE-3, axe, console, lhci: chờ CI, đang tắt theo CTO 06/11, chưa kiểm.
- Test cần card, gồm swatch sau `apply`, skip khi `TE11_TAGS_READY` chưa true (ES1-T134 còn mở).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
