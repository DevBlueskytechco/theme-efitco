KHÔNG CHẮC: (1) ES1-T276 (Tech Lead) chưa trả lời việc hiện số Liquid ngay trước khi JS chạy; spec đề xuất hiện ngay và luôn giữ chỗ khung (§5 K0). (2) Figma chỉ có 1 trạng thái (1:773, 3 ô, desktop); cỡ Compact, 4 ô, < 1 giờ, hết giờ là ĐỀ XUẤT lấy từ product.md §4.2 (đã chốt 10/11 theo đề xuất) cho chung cả 3 chỗ. (3) Store demo chưa có metafield `custom.sale_ends_at` trong `docs/design/demo-data.json`; BA nhập cho `figma-ativafit-lava-featured` khi dựng demo.

# UI spec: Countdown "Sale ends in" dùng chung (ES1-T291)

## Thay đổi audit (ES1-T283 A14, CTO chốt 10/11 câu 2)

| # | Trước | Sau | Nguồn |
| --- | --- | --- | --- |
| 1 | 3 bản: trang chủ 360 ô 44 số 20/600 (index-mobile-b §2); PDP 360 ô 40 số 16, ≥ 768 ô 44 số 18 (product §4.2); big offer ô 44 số 18, luôn 3 ô (marketing-popups §4) | 1 component, 2 cỡ (Compact, Regular) chọn theo bề rộng khung chứa; 3 hoặc 4 ô theo thời gian còn lại, giống nhau ở cả 3 chỗ | ticket ES1-T291; sổ 10/11 câu 2 |
| 2 | 3 nguồn ngày: setting `countdown_end` (featured), metafield `custom.sale_ends_at` (PDP), setting "Sale end date" (big offer); cùng 1 sản phẩm có thể đếm 3 mốc khác nhau | metafield sản phẩm `custom.sale_ends_at` là nguồn chính ở cả 3 chỗ; setting ngày của featured và big offer chỉ dùng khi sản phẩm không có metafield | sổ 10/11 câu 2; DESIGN/R8 (không đếm giả) |
| 3 | A11y khác nhau: featured đọc nhãn đơn vị từng ô (`visually-hidden` "hours"…), PDP ô `aria-hidden` + câu ngày giờ | mọi chỗ theo P4: `role="timer"`, ô số `aria-hidden`, 1 câu ngày giờ đầy đủ, không `aria-live` | sổ 10/11 vòng 3b P4 |

Mục đích: báo cho người mua thời điểm thật một ưu đãi kết thúc, cùng một hình và một mốc giờ ở mọi chỗ sản phẩm đó xuất hiện. Story TE-13 AC1 (featured), TE-4 (PDP), TE-9 (big offer).

Dùng ở: khối featured product trang chủ (Figma 1:759, index-mobile-b §2), buy box trang sản phẩm (product.md §4.2), thẻ big offer (marketing-popups.md §4). Quickview không có countdown (mini-cart-quickview không đặt; giữ gọn).

Mockup: `drafts/designer/ES1-T251/foundation.html` mục 16 "Sale Countdown" + `foundation-360|768|1280|1920.png`.

Thứ tự nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 > foundation > bộ kiến thức (`NN §mục`).

---

## 1. Anatomy (Figma 1:773)

Khung (`role="timer"`) · nhãn "Sale ends in" · hàng ô số (ngày) · giờ · phút · giây · câu ẩn ngày giờ kết thúc.

- Khung: nền `--color-background-dark` (không noise, Figma 1:773 fill phẳng), chữ `--color-background-dark-foreground`, bo 8 (Figma 1:773; không có token 8: `calc(var(--radius-card) - var(--space-1))`, ô số cùng bo), cao 60, rộng theo nội dung (`inline-size: fit-content; max-inline-size: 100%`), căn giữa dọc.
- Nhãn: Inter 500 16/26 ls −0.01em (Figma 1:774), một dòng.
- Ô số: vuông, bo 8, viền 1px `color-mix(in srgb, var(--color-background-dark-foreground) 12%, var(--color-background-dark))` (≈ #333 Figma 1:776), nền trong suốt; số Inter 700 `font-variant-numeric: tabular-nums`, luôn 2 chữ số (`05`), ô ngày có thể 3 chữ số, ô giãn theo số.
- Không dấu ":" giữa ô, không nhãn đơn vị nhìn thấy (Figma không có; product.md §4.2 đã chốt).

## 2. Kích thước

Hai cỡ, chọn theo bề rộng khung chứa (không theo loại trang), để 4 ô luôn vừa:

| Giá trị | Compact | Regular (Figma 1:773) |
| --- | --- | --- |
| Khi nào | khung chứa < 368 | khung chứa ≥ 368 |
| Cao khung | 60 | 60 |
| Padding ngang | 16 (`--space-4`) | 24 (`--space-5`) |
| Nhãn → ô | 16 | 16 (Figma 15, P4) |
| Ô | 40 × 40 | 44 × 44 |
| Số | Inter 700 16/24 | Inter 700 18/28 ls −0.01em |
| Khoảng giữa ô | 4 (`--space-1`) | 12 (`--space-3`) |
| Rộng 3 ô | 267 | 311 (Figma 310) |
| Rộng 4 ô | 311 | 367 |

368 = rộng 4 ô Regular làm tròn lên. Cách làm (Dev FE): `container-type: inline-size` trên phần tử bọc, `@container (min-width: 23rem)` bật Regular. Không có container query thì theo mốc: `< 48rem` Compact, `≥ 48rem` Regular, riêng thẻ big offer luôn Compact.

Kết quả theo chỗ dùng và mốc:

| Chỗ | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Featured product (trang chủ) | Compact, khung chứa 320 | Regular, 728 | Regular, cột phải (Figma 668) | Regular, Figma 1:773 |
| Buy box PDP | Compact, 320 | Regular (buy box ≥ 368, product.md §4.2) | Regular, cột buy box | Regular |
| Thẻ big offer | Compact, sheet (328) | Compact, popover 400 − padding 48 = 352 | Compact, 352 | Compact, 352 |

Big offer ≥ 768 Compact vì 4 ô Regular (367) không vừa 352; giữ một cỡ trong thẻ thay vì đổi cỡ theo số ô (câu CTO 1).

Chữ dài (nhãn merchant tự đặt, bản dịch dài): khung `flex-wrap: wrap`, nhãn lên hàng riêng, ô xuống hàng dưới, padding dọc 12, cao theo nội dung; không cắt chữ, không tràn ngang. Khuyên nhãn ≤ 16 ký tự (info của setting).

Vị trí:
- Featured product: giữa h2 và hàng giá (Figma 1:769: tiêu đề → 1:773 → giá 1:782), cách trên 16, dưới 16.
- PDP: giữa h1 và giá (product.md §4.2).
- Big offer: sau hàng giá, trước nút "Shop The Deal" (marketing-popups.md §4).

## 3. Số ô

| Thời gian còn lại | Ô | Ví dụ |
| --- | --- | --- |
| ≥ 24 giờ | 4: ngày, giờ, phút, giây | 02 · 22 · 36 · 28 |
| < 24 giờ | 3: giờ, phút, giây | 22 · 36 · 28 (Figma) |

Khi đang xem mà qua mốc 24 giờ thì ô ngày biến mất (khung co lại 1 lần trong khung đã dành, không đẩy nội dung bên dưới vì cao khung không đổi). Ngày ≥ 100 thì ô ngày 3 chữ số, ô giãn theo số.

## 4. Nguồn ngày và điều kiện hiện (sổ 10/11 câu 2, vòng 3b P5)

Thứ tự lấy ngày kết thúc:
1. `product.metafields.custom.sale_ends_at.value` (kiểu `date_time`, theo sản phẩm, không theo biến thể).
2. Chỉ khi sản phẩm không có metafield: setting ngày của khối: featured `countdown_end`, big offer "Sale end date" (định dạng `YYYY-MM-DD HH:MM`, giờ store). PDP không có setting ngày.

Một sản phẩm có metafield thì mọi chỗ đếm cùng một mốc, kể cả khi merchant đã điền setting.

Khối được in khi đủ cả 4 (thiếu một thì Liquid không in, không chừa chỗ):
- có ngày hợp lệ (bước 1 hoặc 2);
- ngày còn trong tương lai lúc render;
- biến thể đang xét có `compare_at_price > price` (featured, PDP: biến thể đang chọn; big offer: `selected_or_first_available_variant`);
- biến thể đó còn hàng.

Đổi biến thể (featured, PDP): khối countdown nằm trong partial đổi biến thể, trả lại khối hoặc rỗng cùng lúc với giá.

Countdown chỉ hiển thị, không đổi giá. Merchant tự kết thúc giá gạch đúng giờ (ghi trong info setting, §6).

## 5. Trạng thái

| Mã | Khi nào | Hiển thị | Mockup |
| --- | --- | --- | --- |
| K0 | vừa render | số Liquid in sẵn, hiện ngay; JS đếm tiếp. Khung có kích thước thật từ đầu (0 CLS). Nếu Tech Lead giữ ẩn tới khi JS chạy (ES1-T276) thì dùng `visibility: hidden` (giữ chỗ), không `display: none` | — |
| Mặc định | < 24 giờ | 3 ô | foundation mục 16 |
| K1 | ≥ 24 giờ | 4 ô | foundation mục 16 |
| K2 | < 1 giờ | ô nền `--color-accent`, viền accent, số `--color-accent-foreground` (5.01). Không nhấp nháy, không đổi cỡ. ĐỀ XUẤT: 05 §3 (trạng thái rõ), sổ 09/11 (cam cho phần nhấn) | foundation mục 16 |
| K3 | hết giờ khi đang xem | giữ khung cùng cỡ, thay nhãn + ô bằng "This sale has ended" Inter 500 16/26 trắng 60% (6.93). Featured, PDP: giá và nút giữ nguyên tới khi tải lại (giá thật do Shopify tính khi thanh toán). Big offer: thẻ đang mở giữ K3; đóng thẻ thì teaser ẩn (marketing-popups §4 "không render khi hết giờ") | foundation mục 16 |
| K4 | không ngày / quá hạn lúc render / không giá gạch / hết hàng | không in khối, không chừa chỗ | — |
| Trang cache cũ | JS tải thấy đã quá hạn | chuyển ngay K3 | — |
| Không JS | `scripting: none` | không hiện (số đứng yên là đếm giả, comment `featured-product.liquid`); khối không chiếm chỗ từ đầu nên 0 CLS | — |
| Editor: ngày sai định dạng | setting sai, không metafield | thông báo chỉ trong editor (`featured_product.countdown_invalid` có sẵn), storefront không in | — |
| Editor: có cả metafield và setting | ĐỀ XUẤT | thông báo chỉ trong editor: "This product has a sale end date in the custom.sale_ends_at metafield. The date in this setting is ignored." Nguồn: 05 §3 (phản hồi rõ cho người cấu hình) | — |

Không có trạng thái lỗi riêng: lỗi dữ liệu rơi vào K4.

## 6. Settings merchant

Không thêm setting mới. Giữ id cũ, đổi info cho đúng thứ tự nguồn ngày (sentence case, `t:` trong `locales/en.default.schema.json`).

| Khối | Tên | Kiểu | Default | Info (ĐỀ XUẤT chữ mới) |
| --- | --- | --- | --- | --- |
| featured-product | Countdown label | text | Sale ends in | "Keep it short, up to 16 characters." |
| featured-product | Sale end date and time (`countdown_end`) | text | rỗng | "Used only when the product has no sale end date in the custom.sale_ends_at metafield. Use YYYY-MM-DD HH:MM in your store's time zone. The countdown does not end the sale." |
| offer-popup | Sale end date | text | rỗng | như dòng trên |
| product-info | Show sale countdown | checkbox | true | giữ chữ product.md §16 (metafield only) |

PDP và big offer dùng nhãn "Sale ends in" từ locale (ĐỀ XUẤT key chung `sections.sale_countdown.label`), featured dùng setting `countdown_label`.

## 7. Accessibility (sổ 10/11 P4)

- Khung `role="timer"` (mặc định `aria-live="off"`): không `aria-live`, không đọc từng giây.
- Nhãn nhìn thấy và hàng ô số `aria-hidden="true"`. Tên đọc là 1 câu ẩn: "Sale ends on November 11, 2026 at 11:59 PM EST" (`visually-hidden`, chứa `<time datetime="2026-11-11T23:59:00-05:00">`, định dạng qua `| date` + locale, giờ store). Bỏ các `visually-hidden` "days/hours/…" trong từng ô của code featured hiện tại.
- K3: câu ẩn đổi thành "This sale has ended" (chính chữ nhìn thấy, không ẩn).
- Đếm giây là thông tin thiết yếu (WCAG 2.2.2, P4): không nút dừng; giảm chuyển động vẫn đổi số (không có hiệu ứng nào để tắt).
- Không phải control: không focus, không vùng chạm.
- Tương phản: trắng / #1A1A1A 17.4; trắng / accent 5.01 (K2); trắng 60% / #1A1A1A 6.93 (K3); viền ô chỉ trang trí.
- Không chỉ dùng màu: K2 vẫn là số, cam chỉ nhấn; K3 bằng chữ.

## 8. Motion

Không chuyển động: số đổi tức thì mỗi giây, không lật, không trượt (15 §3; sổ 09/11 chỉ transform/opacity). Ô ngày biến mất ở mốc 24 giờ: đổi tức thì.

## 9. Lighthouse

- CLS 0: số in từ Liquid nên khung đúng cỡ ngay lần vẽ đầu; `tabular-nums` + min-width ô cố định để số đổi không làm khung co giãn; K3 giữ khung.
- Không phải ứng viên LCP (chữ nhỏ, ảnh sản phẩm lớn hơn).
- JS: 1 module chung (BE) thay phần đếm trong `assets/featured-product.js`; 1 `setInterval` 1 s mỗi trang cho mọi countdown; dừng khi tab ẩn (`visibilitychange`), tính lại từ `data-end` khi hiện lại (không trôi giờ). ≤ 1 KB.
- Font: Inter (đã có). Không ảnh.
- SEO: câu ngày giờ là chữ thật trong HTML.
- Best Practices: 0 lỗi console khi khối không có trên trang (module tự thoát khi không tìm thấy `[data-sale-countdown]`).

## 10. Map sang code

| Phần | Hiện có | Thay đổi | Phía |
| --- | --- | --- | --- |
| Markup | trong `blocks/featured-product.liquid` (dòng 105–145 tính ngày, 274–327 markup) | ĐỀ XUẤT snippet `snippets/sale-countdown.liquid` (`{% doc %}`: `product`, `variant`, `fallback_end` text, `label` text, `testid` text mặc định `sale-countdown`). Featured truyền `testid: 'featured-product-countdown'` để giữ test cũ; PDP, big offer gọi cùng snippet | FE |
| Nguồn ngày | featured đọc setting; PDP chưa có | metafield trước, `fallback_end` sau (§4) | FE (Liquid) |
| CSS | `.featured-product__countdown*` (base.css 6909–6960, 7104, 7677–7680, 7797) | class chung `.sale-countdown`, `.sale-countdown__unit`, biến thể `[data-size]` hoặc container query (§2); bỏ `visibility: hidden` chờ `data-enhanced` nếu ES1-T276 đồng ý; giữ `@media (scripting: none) { display: none }` | FE |
| Hook JS | `data-end`, `data-countdown-unit`, `data-countdown-value` | giữ; thêm `data-sale-countdown` trên khung, `data-state="ending|ended"` cho K2/K3 | FE markup, BE JS |
| Đếm | `assets/featured-product.js` | module chung `assets/sale-countdown.js` | BE |
| Partial đổi biến thể | featured: `product-price`, `product-buy-buttons` | thêm `product-countdown` (cùng tên PDP, product.md §17) | FE + BE |
| Locale | `blocks.featured_product.countdown_*` | thêm `sections.sale_countdown.label`, `ends_on` ("Sale ends on {{ date }}"), `ended` ("This sale has ended"), `metafield_overrides` (thông báo editor); bỏ dùng `countdown_days..seconds` | FE |

Ticket con theo `.claude/rules/fe-be-boundary.md`: FE1 snippet + CSS + locale (test id ở trên đi trước), BE1 module đếm + partial.

## 11. Đề xuất trỏ (file ngoài phạm vi ES1-T291, không sửa ở đây)

- `product.md` §4.2: thay bảng cỡ bằng "theo countdown.md §2 (Compact < 368, Regular ≥ 368)"; giữ điều kiện và K1–K4 (đã khớp §4, §5); §18 dòng "khác nguồn ngày" sửa thành "cùng nguồn ngày (countdown.md §4)".
- `marketing-popups.md` §4: thanh đếm ngược "theo countdown.md, cỡ Compact, 3 hoặc 4 ô"; setting "Sale end date" chỉ dùng khi sản phẩm không có metafield; dòng dữ liệu mockup "thời gian thật của khối featured product (`default_countdown_end`)" sửa thành "`custom.sale_ends_at` của sản phẩm"; trạng thái "Đếm ngược ẩn" thêm K3 khi thẻ đang mở. Render lại PNG T263 khi sửa.
- `index-mobile-b.md` §10 Settings: ghi `countdown_end` là dự phòng (đã sửa §2 trong ticket này).

## 12. Quyết định CTO đã chốt 11/11 (theo đề xuất, sổ 11/11)

1. Thẻ big offer dùng cỡ Compact ở mọi mốc (popover 352 không đủ 4 ô Regular 367), thay vì nới popover lên 416? Đề xuất: Compact, giữ popover 400.
2. Hết giờ khi đang xem (K3): giữ khung với "This sale has ended", giá và nút giữ nguyên tới khi tải lại, không tự tải lại trang? Đề xuất: có (0 CLS, giá thật do Shopify tính khi thanh toán).
