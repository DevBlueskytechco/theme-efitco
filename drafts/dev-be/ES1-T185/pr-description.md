KHÔNG CHẮC: (1) JS và spec chưa chạy trên trình duyệt: phiên agent không có trình duyệt, chỉ chạy logic với DOM giả trong Node; E2E, axe, console, lhci chưa chạy vì CTO 06/11 tắt e2e, lighthouse trên CI tới khi trang chủ xong (vars.RUN_STORE_TESTS=false), PR này chỉ qua theme-check và preview, chưa được coi là đã kiểm. (2) Trần 768 B không chứa nổi đúng chữ ticket, phải lệch 5 điểm ở mục "Lệch ticket", hỏi Tech Lead ở ES1-T209; mặc định giữ bản này.

# ES1-T185 TE-15-BE1: scroll-buttons

## Thay đổi
- `assets/scroll-buttons.js` (mới, 768/768 B, không còn byte dư): custom element `scroll-buttons`, nạp qua `data-lazy-module`. Không biết gì về collection, không fetch.
  - Next, back: `scrollBy` đúng 1 card; reduced-motion thì `auto`, còn lại `smooth`.
  - Ẩn nút bằng `hidden` khi hết cuộn; tính lại khi scroll và qua `ResizeObserver`. Đặt `data-enhanced` sau lần tính đầu.
  - Nút đang focus bị ẩn thì focus sang nút còn lại.
  - Khi disconnected: ngắt `ResizeObserver`.
- `blocks/collection-list.liquid`: `data-lazy-module` trên root, thẻ script `lazy-module.js` trong root, sửa `{% doc %}`. Không đổi tên hook, không đổi markup khác.
- `tests/e2e/ES1-T185.spec.ts` (mới).
- `tests/e2e/ES1-T184.spec.ts`: test tĩnh đổi từ "không có thẻ script" sang "script chỉ có lazy-module"; 3 test trạng thái trước nâng cấp nay chặn file module, vì `/?view=te15` nạp module ngay và module đổi `data-enhanced`, `hidden`.
- `drafts/dev-be/ES1-T185/scroll-buttons.literal.js`: bản so sánh cho ES1-T209, không nạp lên store.

## Lệch ticket (do trần 768 B, ES1-T209)
Bản đúng chữ ticket đo được 1331 B (`drafts/dev-be/ES1-T185/scroll-buttons.literal.js`, không tính dòng ghi chú đầu).
1. Scroll dùng `t.onscroll`, không có `passive`. Sự kiện scroll không cancelable nên passive không đổi hành vi (suy luận, chưa đo).
2. Không gỡ handler khi disconnected, chỉ ngắt `ResizeObserver`. Handler thuộc tính nằm trên phần tử con, gắn lại thì ghi đè nên không nhân đôi. Phần tử đã gỡ mà bị gọi `click()` vẫn chạy handler, `scrollBy` trên phần tử đã gỡ không có tác dụng.
3. Bước cuộn là `offsetLeft` card 2 trừ card 1, thay vì rộng card đầu cộng gap. Cùng số, trừ làm tròn (768: 323 so với 323.2); scroll-snap kéo về đúng card (chưa đo). Danh sách chỉ 1 mục mà vẫn tràn thì bấm nút sẽ lỗi; block này không gặp vì 1 card không tràn và nút không hiện dưới 48rem. Block khác dùng lại phải để ý.
4. Không hỗ trợ RTL: `scrollLeft` âm làm back luôn ẩn, next đi sai chiều. Theme chưa có locale RTL.
5. File không thụt lề, không comment, tên biến 1 chữ, bỏ 2 dấu chấm phẩy: khó đọc hơn quy ước "không minify, đọc được". Không có guard thiếu hook: thiếu hook thì `pageerror`.

## Quyết định ngoài chữ ticket
- Thêm chuyển focus khi nút đang focus bị ẩn. Ticket không ghi, nhưng thiếu thì khách dùng bàn phím rơi về body khi tới đầu hoặc cuối. Cả 2 nút cùng ẩn (đang focus mà đổi cỡ màn hình tới mức không tràn) thì focus vẫn mất, chấp nhận.
- Đọc `scrollWidth`, `clientWidth` trước khi ghi `hidden`, ghi 2 nút cùng lúc: đọc layout sau khi ghi có thể làm trình duyệt bỏ focus trước khi kịp đọc `activeElement` (chưa đo, viết theo hướng an toàn).
- Thẻ script và `data-lazy-module` có render trong theme editor, khác `blocks/quiz`: ticket không cấm, và merchant thấy nút giống storefront. Editor render lại block trước khi module nạp thì nút ẩn tới khi tải lại khung, không lỗi.
- Bấm nhanh 2 lần trong lúc đang smooth có thể chỉ cuộn 1 card, do `scrollBy` tính từ vị trí hiện tại và snap kéo về card gần nhất. Không đủ byte để xử lý, chưa đo.

## Ngân sách JS (plan ES1-T169 D6, `wc -c`)
| Nhóm | File | B | Trần |
| --- | --- | --- | --- |
| Tải sẵn theo D6 | nền 26 365, lazy-module 384, search-loader 256 | 27 005 | 40 960, còn 13 955 |
| Sau cuộn theo D6 | gồm scroll-buttons, tính theo trần 768, số thật 768 | 31 049 | |
| Mở search | predictive-search | 6 656 | |
| Tổng | Không đổi so với D6 | 64 710 | 65 536, còn 826 |

- Hàng 3 ở y 1027 (1920) nên desktop thường nạp module ngay khi tải trang, Lighthouse có thể thấy file này. Nếu tính vào tải sẵn: 27 005 + 768 = 27 773, vẫn dưới 40 960.
- Số D6 là số kế hoạch, có file chưa có. Bước đo thật của ES1-T177 chưa làm (T176, T177 làm cuối theo CTO 06/11).

## Tự kiểm tra
- `wc -c assets/scroll-buttons.js`: 768 ≤ 768.
- `shopify theme check`: 90 file, 0 lỗi. `node --check` JS, `node --experimental-strip-types --check` ES1-T185, ES1-T184: ok.
- Chạy logic với DOM giả trong Node: ẩn nút ở đầu, cuối, không tràn; bước cuộn; behavior; chuyển focus; `data-enhanced`; ngắt observer: pass. Không có layout thật, không thay được E2E.
- Không đổi locale. Không có partial nên không có contract tên partial; contract hook có test tĩnh trong spec, chưa chạy.
- `npx playwright test tests/e2e/ES1-T185.spec.ts tests/e2e/ES1-T184.spec.ts` desktop + Pixel 7, axe, console, CLS khi nâng cấp, `npx lhci autorun`, bước đo JS ES1-T177: chờ CI, đang tắt theo CTO 06/11, chưa kiểm.
- Spec chưa type-check (không có `tsc`). Test bấm nút đặt viewport 1024 ở cả 2 project vì nút không hiện dưới 48rem. Test "xa viewport" sửa HTML qua `page.route` để đẩy danh sách xuống, không thêm template.

## Việc cho Orchestrator
`AGENTS.md` Theme map chưa có dòng `collection-list`, `collection-card` mà ES1-T184 nhờ áp. Không thuộc ticket này, không sửa ở đây.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
