KHÔNG CHẮC: (1) JS và spec chưa chạy trên trình duyệt: phiên agent không có trình duyệt, chỉ chạy logic với DOM giả trong Node. E2E, axe, console, lhci chưa chạy vì CTO 06/11 tắt e2e, lighthouse trên CI tới khi trang chủ xong (vars.RUN_STORE_TESTS=false); PR này chỉ qua theme-check và preview, chưa được coi là đã kiểm. (2) DoD "422 thật không đổi /cart.js" chưa kiểm: docs không nói items[] có nguyên tử không (ES1-T143 #1). Giỏ có thêm món thì AC3 không đạt bằng API này, phải báo Tech Lead đổi D6. (3) AC3 báo tên: ES1-T143 #2 ghi description có thể không còn tên; đang hiện nguyên description, không ghép tên, đã báo ES1-T213 #1. (4) File không thụt lề để vào trần, lệch quy ước đọc được, ES1-T213 #3.

# ES1-T149 TE-12-BE1: bundle-form

## Thay đổi
- `assets/bundle-form.js` (mới, 5491/5504 B): 1 custom element `bundle-form` cho cả bundle builder và shop the look, thiếu hook thì bỏ qua. Nạp qua `data-lazy-module`.
  - Panel: đọc input đang chọn (checkbox checked và không disabled, hidden luôn tính), render rồi mới đặt `data-enhanced`; đọc lại ở `pageshow`. Dòng panel clone template, gán `textContent`.
  - Tiền: `Intl.NumberFormat` theo `data-locale`, `data-currency`, giá trị chia 100. Bậc: sắp xếp, trùng ngưỡng lấy percent cao hơn; giảm làm tròn, chỉ hiển thị (AC2).
  - Live region: số món và total, debounce 300 ms, không đổi focus. Lúc nâng cấp không báo.
  - Add: đúng 1 POST `items[]`, chỉ `id` và `quantity`, gộp id trùng. `CartLinesUpdateEvent` dispatch trước request, context `product` (ES1-T143 #5), chỉ resolve. Không có thư viện sau 500 ms: bỏ event, vẫn thêm giỏ.
  - Thành công: `theme:cart:updated` với source `bundle-form`, opener là nút submit; ES1-T96 mở drawer. Rời trang cùng điều kiện ES1-T96. Giữ lựa chọn.
  - Lỗi: 4xx có description hiện nguyên văn; mạng, 5xx, 4xx không description hiện `data-label-error`. Không submit lại, không reject. Khoá nút, `aria-busy`, abort khi disconnected.
  - Hotspot (AC-H20): hover, focus, bấm hotspot đặt `data-look-active` cho row cùng số; bấm hotspot hoặc row đặt `aria-pressed`.
- `blocks/bundle-builder.liquid`, `blocks/shop-the-look.liquid`: chỉ thêm `data-lazy-module`, thẻ script `lazy-module.js`, sửa `{% doc %}`. Không đổi tên hook.
- `tests/e2e/ES1-T149.spec.ts` (mới): tĩnh; panel, hotspot; thêm giỏ bằng `cart-mock` (0 request Cart API tới store); 1 luồng thật mỗi project gồm add thật và 422 thật.
- `drafts/dev-be/ES1-T149/bundle-form.readable.js`: bản có thụt lề, comment, cùng token với asset, không nạp lên store. `logic-check.cjs`: kiểm logic bằng DOM giả.

## Lệch ticket
1. File không thụt lề, không dòng trống, 1 dòng comment; bỏ guard `customElements.get` vì module chỉ chạy 1 lần theo URL. Bản có thụt lề tab, không comment đo được 5793 B, vượt trần 289 B. Sửa asset thì sửa bản readable, rồi bỏ thụt lề, comment. ES1-T213 #3.
2. Rời hover, focus khỏi hotspot thì viền row giữ nguyên, không về row đang chọn, nên viền và hotspot đang chọn có thể khác số. Trả về tốn khoảng 150 B. ES1-T213 #4.
3. 422 resolve userErrors và vẫn GET `/cart.js` để có cart, cùng cách `product-form.js`. Nhánh mạng, 5xx không gọi thêm request, cart null. GET này không gửi header `Accept`, `X-Requested-With`: `/cart.js` trả JSON theo đuôi file (chưa đo trên store).
4. `data.description` kiểm truthy, không kiểm kiểu string như `product-form.js`, để tiết kiệm byte.

## Quyết định ngoài chữ ticket
- 0 món mà submit (Enter trong checkbox khi CSS ẩn nút): chặn, không gửi. Nút chỉ `visibility: hidden` nên form vẫn submit được.
- Focus: nút bị disabled làm mất focus thì trả về nút khi `activeElement` là body, cùng cách `product-form.js`. Drawer đang mở giữ focus của nó.
- Bấm row cũng chuyển viền về row đó, để 2 trạng thái không lệch. Row 5, 6 không có hotspot: không hotspot nào được chọn.
- Thẻ script và `data-lazy-module` render cả trong theme editor theo ticket. Editor render lại block trước khi module nạp thì panel chưa hiện tới khi tải lại khung, không lỗi (như ES1-T185).

## Rủi ro đã biết
- Quá tồn với quantity lớn hơn 1 (2 row cùng variant) có thể thêm một phần + 422 (ES1-T143 #3). Ticket yêu cầu 422 không dispatch nên cart-count lệch tới lần refresh sau. ES1-T213 #2.
- Phân tích CLS, chưa đo: lúc nâng cấp, dòng giảm đang giữ chỗ chuyển sang `hidden` nên panel co 1 dòng khi chưa đủ bậc. Từ 64rem panel nằm cạnh lưới, thường thấp hơn lưới nên không đẩy nội dung; dưới 64rem panel ở dưới lưới và thường còn ngoài viewport khi module nạp. Danh sách ngắn có thể gây shift nhỏ.
- `findLast` và `ariaBusy` cần trình duyệt mới (cùng thời với `:has` mà block đang dùng); chưa đối chiếu danh sách trình duyệt của dự án.

## Ngân sách JS (plan ES1-T169 D6 thay bảng D10, `wc -c`)
| Nhóm | Thành phần | B | Trần |
| --- | --- | --- | --- |
| Tải sẵn | Không thêm script tĩnh: `lazy-module.js` 379 B đã tính trong D6 | Không đổi | 40 960 |
| File này | `assets/bundle-form.js`, số thật | 5 491 | 5 504, còn 13 |
| Sau cuộn | D6 tính bundle-form 5 504; theo số thật giảm 13 B | 31 036 | |
| Tổng | D6 64 710, theo số thật giảm 13 B | 64 697 | 65 536, còn 839 |

Số D6 là số kế hoạch; bước đo thật của ES1-T177 chưa làm (T176, T177 làm cuối theo CTO 06/11).

## Tự kiểm tra
- `wc -c assets/bundle-form.js`: 5491 ≤ 5504. `node --check`: ok. `node --experimental-strip-types --check tests/e2e/ES1-T149.spec.ts`: ok. Spec chưa type-check (không có `tsc`).
- `shopify theme check`: 94 file, 0 lỗi. Không đổi locale, không đổi CSS.
- `node drafts/dev-be/ES1-T149/logic-check.cjs`: pass. Phủ bậc, tiền, progress, debounce, gộp id, thứ tự event, 422, mạng, 5xx, abort, không thư viện, không bậc, hotspot, bfcache. DOM giả không có layout, selector thật, thư viện event thật, nên không thay được E2E. Lượt chạy đầu bắt được 1 lỗi đã sửa: trùng ngưỡng làm text progress lấy percent thấp hơn.
- Không có partial nên không có contract tên partial; contract hook có test tĩnh trong spec, chưa chạy.
- Chờ CI, đang tắt theo CTO 06/11, chưa kiểm: `npx playwright test tests/e2e/ES1-T149.spec.ts -g "AC1|AC2|AC3|AC5"` desktop + Pixel 7; ES1-T147, ES1-T148, TE-3 spec; axe; console; 422 thật; `npx lhci autorun`; CLS.

## Việc cho Orchestrator
ES1-T148 đã nhờ thêm 2 hàng Theme map vào `AGENTS.md`; hiện `AGENTS.md` chưa có `bundle`, `shop-the-look`. Không thuộc ticket này, không sửa ở đây.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
