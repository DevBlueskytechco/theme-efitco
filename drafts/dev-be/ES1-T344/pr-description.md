KHÔNG CHẮC: (1) PDP chưa có thẻ script sale-countdown.js vì product-info chưa render snippet (ES1-T351 chưa làm) → tách ES1-T601. (2) Featured 1 band: khung countdown không nằm trong partial nên đổi biến thể không làm mới countdown → hỏi Tech Lead ES1-T600. (3) Picker lười interaction đặt trên `.featured-product__details` thay vì `.featured-product__summary` (dòng ticket ghi) — lý do ở dưới. (4) Spec chưa chạy (không preview, không mạng): chờ CI.

# ES1-T344 TE-13-R2-BE1: sale-countdown.js, featured-product.js bỏ đếm, picker/form/quiz-dialog lười interaction

AC: TE-4 AC17, AC32, TE-13 AC1, AC-H22, AC-H23. ADR 0009 mục 3, 4; ADR 0010. Sau TE-13-R2-FE1 (ES1-T343), TE-10-R2-BE3 (ES1-T316), ES1-T410.

## Thay đổi
- `assets/sale-countdown.js` (mới, 2 041 B): define `<sale-countdown>` (guard `customElements.get`). Đọc `data-end` (epoch giây) trên khung `[data-sale-countdown]`, cập nhật `[data-countdown-value]` theo `data-countdown-unit`, ô ngày `hidden` khi < 24 giờ, `data-state` `running` → `ending` khi < 1 giờ (AC32). Một `setInterval` 1 s dùng chung cho mọi thẻ đang trong khung nhìn (IntersectionObserver), dừng khi `document.hidden` hoặc không thẻ nào hiện; hiện lại thì tính ngay từ `data-end` (không trôi giờ). Hết giờ (K3): thay nhãn + ô bằng `<span class="sale-countdown__ended">` chữ `data-label-ended`, span nhận id câu ẩn nên tên `role="timer"` là chính chữ đó; `data-state="ended"`, khung giữ (CSS min-block-size 60, min-inline-size K3), không đếm âm, không đếm lại, không tải lại trang. Trang cache cũ (data-end đã qua lúc JS chạy) → K3 ngay. Không storage, không đọc URL, không aria-live. `data-end` thiếu/sai → bỏ qua, giữ số Liquid. Thẻ mới sau `partials.apply`/swap/editor tự upgrade; `disconnectedCallback` gỡ observer.
- `assets/featured-product.js` 1 705 → 973 B: bỏ toàn bộ phần đếm (interval, observer, visibilitychange). Giữ `data-enhanced`, `swap()` (2+ band, D4); swap thêm `[data-sale-countdown-slot]` vào danh sách thay (slot luôn có ở cả 2 phía nên chỉ số khớp), có guard khi phản hồi thiếu phần tử.
- `assets/quiz-dialog.js` 1 511 → 1 645 B: nạp lười theo tương tác. Thêm nhánh "về muộn": nếu quiz-finder đã hiện kết quả trước khi file chạy thì mở popup, không đụng trạng thái rỗng/có kết quả; panel đang `aria-busy` thì mở như cũ.
- `blocks/featured-product.liquid` (chỉ thuộc tính nạp, D6 task-split ES1-T307 + doc):
  - `.featured-product__summary`: `data-lazy-module` sale-countdown.js (viewport, mọi lúc kể cả editor).
  - `.featured-product__details`: `data-lazy-module` product-variant-picker.js (giữ điều kiện cũ `has_variant_choice`, ngoài editor, không selling plan) + `data-lazy-on="interaction"`.
  - `product-form`: thêm `data-lazy-on="interaction"`.
  - Vẫn 1 thẻ script (lazy-module.js). Doc block cập nhật đoạn JS hooks và swap.
- `blocks/quiz.liquid`: bỏ `<script src=quiz-dialog.js>`; form `quiz-form` có `data-lazy-module` quiz-dialog.js + `data-lazy-on="interaction"` khi `results_popup`. Còn 1 thẻ script (lazy-module.js). Doc cập nhật.
- Test: `tests/e2e/ES1-T344.spec.ts` (mới). Sửa test cũ mâu thuẫn hành vi mới: `ES1-T338.spec.ts` (quiz còn 1 thẻ script), `ES1-T158.spec.ts` (openCountdown chờ `sale-countdown` define; 2 test hết giờ đổi từ `hidden` sang K3 theo ADR 0009/TE-4 AC17).

## Vì sao picker gắn trên details, không trên summary
Picker `display: none` tới khi defined (base.css). Summary chỉ chứa giá, rating, mô tả: không có phần tử focus được. Gắn `interaction` lên summary thì người dùng chỉ bàn phím không bao giờ kích hoạt focusin → bộ chọn không bao giờ hiện. Details chứa product-form (nút mua, View Detail) nên Tab tới nút mua là nạp picker. Regex test ES1-T158 AC3 vẫn khớp.

## Ngân sách JS (wc -c)
| File | Trước | Sau | Trần | Cách nạp |
| --- | --- | --- | --- | --- |
| sale-countdown.js | — | 2 041 | 2 048 | lười viewport (trang chủ); PDP: ES1-T601 |
| featured-product.js | 1 705 | 973 | 1 024 | lười viewport |
| quiz-dialog.js | 1 511 | 1 645 | ≤ 8 192 (lười interaction, ngoài trần sau cuộn) | lười interaction |
| lazy-module.js | 765 | 765 | 768 | không đổi |
| product-variant-picker.js / product-form.js | 7 130 / 6 867 | không đổi | 7 168 | featured: viewport → interaction |

Cộng tĩnh trang chủ (fixture Figma: hide_options, có quiz popup, 1 featured):
- Tải sẵn: − 1 511 (quiz-dialog ra khỏi thẻ script).
- Sau cuộn: featured-product − 732, sale-countdown + 2 041, product-form − 6 867 (sang interaction) = − 5 558 B. Có picker (template test): thêm − 7 130.
- PDP: chưa đổi ở PR này; ES1-T601 thêm 2 041 (ước ADR 0010 đã tính, 38 408).

## Hợp đồng
- Hook snippet (FE ES1-T343): `sale-countdown`, `data-sale-countdown`, `data-end`, `data-state`, `data-label-ended`, `aria-labelledby`, `data-countdown-unit`, `data-countdown-value`, class `sale-countdown__ended` (CSS có sẵn base.css). Không đổi markup snippet.
- Partial: không đổi tên; featured regions vẫn `product-options product-price product-buy-buttons`.
- data-testid giữ nguyên: `featured-product-countdown*`, `quiz-form`, `quiz-dialog`.

## Rủi ro
- Lần tương tác đầu với featured/quiz trễ 1 vòng mạng (ADR 0010 chấp nhận). Không JS / module chưa về: form vẫn mua biến thể hiện tại, quiz vẫn sang trang search.
- Picker hiện ra sau hover (không phải input rời rạc) có thể tính CLS field; Lighthouse lab không hover nên không ảnh hưởng điểm lab. Trang chủ Figma hide_options nên không có picker.
- K3: khung xuống 2 dòng (container hẹp, nhãn dài) thì chiều cao K3 có thể nhỏ hơn lúc chạy — CSS FE.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (9 warning có sẵn ở quiz-step, index*.liquid, không đụng).
- `wc -c`: sale-countdown 2 041 ≤ 2 048; featured-product 973 ≤ 1 024; quiz-dialog 1 645; mọi file ≤ 8 192.
- Không console.*, không storage, không fetch mới; guard customElements; 1 thẻ script/khối giữ nguyên.
- Locale: không đổi.
- E2E (`ES1-T344`, `ES1-T158`, `ES1-T338`), console 0 lỗi, Lighthouse `/` và `/?view=te13-states` (CLS 0): chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
