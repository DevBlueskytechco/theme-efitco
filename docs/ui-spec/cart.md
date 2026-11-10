KHÔNG CHẮC: (1) upsell chưa có AC trong TE-5, câu hỏi ES1-T247 còn mở; (2) ảnh store dev lệch tên (ES1-T245): trong mockup Training Mat 12 mm hiện kệ, Speed rope hiện áo tạ, Resistance Band Set hiện dây thừng, ô rỗng Home Starter Kit/Olympic Plate Set/Ativafit Lava hiện dây nhảy/quấn cổ tay/thảm; giữ URL; (3) demo-data không có discount tự động, selling plan, unit price, ngưỡng freeship: tên "Bundle 10% off", số tiền giảm và ngưỡng $500 trong mockup là minh hoạ; (4) Lighthouse SEO 100 trên /cart có thể không đo được vì robots.txt mặc định của Shopify chặn /cart (câu CTO 3).

# UI spec: Cart page (ES1-T255)

Mục đích: người mua xem lại giỏ, đổi số lượng, xoá, ghi chú đơn, thấy tổng tiền (giảm giá, freeship, thuế) và đi tới checkout trong ít bước nhất. Story TE-5 (AC1–AC5). Template `templates/cart.liquid` → `container` → `blocks/cart-page.liquid` (snippet `cart-free-shipping`, `cart-lines`, `cart-summary`). Mini cart (drawer) làm ở ES1-T262.

Đầu ra: spec này; `drafts/designer/ES1-T255/cart.html` (nhúng `../_kit/kit.css`); `cart-360|768|1280|1920.png`. Trạng thái ở cuối mockup (State 1–7).

Figma: không có frame cart (figma-inventory chỉ 1:359). Dùng ngôn ngữ trang chủ qua foundation (ES1-T251): header 1:362 (biến thể A nền trắng, sổ quyết định 09/11), footer 1:1104, card sản phẩm 1:502, nút 1:1104. Bố cục mặc định đã chốt ở ES1-T93 (CTO 05/11): < 64rem 1 cột, từ 64rem 8/12 + 4/12 sticky; ảnh vuông trái; freeship đầu danh sách; rỗng = text + nút. Mọi thứ khác là `ĐỀ XUẤT:` có nguồn.

Thứ tự nguồn: sổ quyết định > AGENTS.md > DESIGN.md > Figma > ES1-T93 > bộ kiến thức (file NN).

---

## 1. Anatomy

Thứ tự DOM (giữ như code, focus đi theo thứ tự này):

1. Header A (foundation §3): icon cart `aria-current="page"`, tên "Cart, 4 items".
2. Đầu trang `.cart-head`: h1 "Cart" (`cart.title`, `tabindex="-1"` cho JS đưa focus) · số món "4 items" · link "← Continue shopping" (`cart.continue_shopping`, `routes.all_products_collection_url`).
3. Live region: `cart-items-status` (visually hidden, polite) · `cart-items-error` (role alert, rỗng không chiếm chỗ).
4. Cột chính:
   a. Freeship (AC3): icon xe tải · câu còn thiếu/đã đạt · `<progress>` có `aria-labelledby` câu.
   b. Hàng tiêu đề cột (≥ 48rem, `aria-hidden`): Product · Quantity · Total.
   c. `<ul>` dòng hàng. Mỗi dòng: ảnh (link không bắt buộc) · tên (link PDP, `item.url`) · option `Color: Black` (`dl`) · thuộc tính dòng (`dl`, bỏ key bắt đầu `_`) · selling plan · đơn giá (sale đỏ + giá gạch) · unit price · discount dòng (icon tag + tên + `-$x`) · bộ số lượng · thành tiền dòng · nút xoá.
   d. Nút "Update" (chỉ khi không JS; ẩn khi `cart-items[data-enhanced]`).
   e. Ghi chú đơn (AC5): label "Order note" · textarea `name="note"` `form="cart-form-page"` · gợi ý.
5. Cột tóm tắt (sticky ≥ 64rem): h2 "Order Summary" · Subtotal · discount cấp đơn (mỗi dòng 1 discount) · Shipping "Calculated at checkout" · Total · ghi chú thuế · nút Checkout (icon khoá) · "Secure checkout" + icon thanh toán.
6. Accelerated checkout (`content_for_additional_checkout_buttons`, ngoài partial): chữ "or pay with" + nút Shopify vẽ.
7. Upsell (ĐỀ XUẤT, ES1-T247): eyebrow "Complete your setup" · h2 "You May Also Need" · nút tròn 52 (768–1279) · 4 card sản phẩm + nút "Add To Cart" phụ · thanh tiến trình (< 80rem).
8. Footer (foundation §4).

## 2. Layout theo mốc

| Giá trị | 360 | 768 | 1280 | 1920 | Token / nguồn |
| --- | --- | --- | --- | --- | --- |
| Nội dung | 320 | 728 | 1240 | 1416 | `--content-width` |
| Đầu trang padding | 24 / 24 | 24 / 24 | 32 / 40 | 32 / 40 | `--space-5`; `--space-6` / `--space-1 × 10` từ 64rem |
| h1 | 33 | 43 | 48 | 48 | `--font-size-h1` |
| Cột | 1 | 1 | 795 + 397, gap 48 | 912 + 456, gap 48 | 8fr / 4fr, `--space-7` (ES1-T93 #2, base.css) |
| Dòng hàng (cột) | 88 · 1fr · auto | 120 · 1fr · 138 · 96 · 44 | như 768 | như 768 | ảnh `--space-1 × 22` / `× 30` |
| Gap trong dòng | 12 | 16 | 24 | 24 | `--space-3` / `--space-4` / `--space-5` từ 80rem |
| Cột tên + option | ~136 | ~268 | ~301 | ~418 | còn lại |
| Padding dọc dòng | 24 | 24 | 24 | 24 | `--space-5`, gạch 1px `--color-border` |
| Bộ số lượng | 138 × 44 | 138 × 44 | 138 × 44 | 138 × 44 | nút 44, ô 48 |
| Tóm tắt padding | 24 | 24 | 32 | 32 | `--space-5` → `--space-6` từ 80rem |
| Tóm tắt sticky | — | — | top 96 | top 96 | `--header-height + --space-4` |
| Checkout cao | 48 | 48 | 52 | 52 | `--control-height` |
| Upsell | hàng ngang, card 45% (144) | hàng ngang, 3.25 card (209) + nút 52 | lưới 4 × 292 | lưới 4 × 336 | foundation §11, §9 |
| Khoảng trước upsell | 48 | 48 | 120 | 120 | `--section-gap` |

Sắp xếp:
- 360/768: đầu trang → freeship → dòng hàng → ghi chú → tóm tắt → accelerated → upsell. Mobile: dòng 1 ảnh | tên, option, giá | xoá; dòng 2 ảnh | bộ số lượng | thành tiền. Xoá ở góc trên phải (12 §1 audit: nút remove lên đầu, icon thùng rác).
- 1280/1920: ảnh | thông tin | số lượng | thành tiền | xoá trên một hàng, căn đỉnh; thành tiền canh phải thẳng cột "Total". Tóm tắt sticky bên phải trong tầm nhìn đầu (12 §1 Must "tóm tắt desktop bên phải, above the fold").
- Không lệch thứ tự đọc giữa các mốc (06 §2).

## 3. Thành phần chi tiết

### 3.1 Dòng hàng
- Ảnh: vuông, nền `--color-background-cream`, `object-fit: contain` + `mix-blend-mode: darken`, bo `--radius-card` (như card 1:502). ĐỀ XUẤT thay `--radius-input` + nền tối hiện tại để ảnh cart cùng ngôn ngữ card trang chủ (06 §1, 12 #620D thumbnail lớn).
- Không ảnh (edge case "Sản phẩm không có media"): icon ảnh `--color-muted-light` giữa nền cream (foundation §9). Code đang tô `--color-background-dark`: ĐỀ XUẤT đổi.
- Tên: Inter 16/500 lh 1.5, không giới hạn dòng (tên là thông tin chính; mobile tối đa ~3 dòng với dữ liệu demo), hover gạch chân offset 0.2em.
- Option, thuộc tính: 14, nhãn `--color-muted` (8.45), giá trị foreground; mỗi cặp một dòng.
- Giá: mobile 14, ≥ 48rem 16. Có giảm: giá mới `--color-sale` + giá gạch 14 muted.
  - ĐỀ XUẤT: khi không có discount dòng mà `item.variant.compare_at_price > item.final_price`, gạch `compare_at_price` (Revllen $34.99 ~~$44.99~~). Code chỉ so `original_price` nên giá sale từ compare-at không hiện (12 §1 audit "design lại giá đã giảm dễ nhận biết"; dữ liệu thật từ Shopify, không đổi giá).
- Discount dòng (AC5): icon tag 14 + "Tên (-$x)" chữ `--color-sale` 14/500. Chữ + icon, không chỉ màu (01).
- Thành tiền: 16/600, canh phải; có discount dòng thì thêm giá gốc gạch 14 dưới.
- Hết hàng (State 4, edge case "Hết hàng toàn bộ", `item.variant.available == false`): badge "Sold out" (foundation §8), ảnh opacity 0.6, câu `--color-sale` + icon "This item sold out after you added it. Remove it before checkout.", bộ số lượng disabled, xoá vẫn bấm. Không khoá Checkout (Shopify checkout tự xử lý; không đổi luồng). Nguồn: 12 §1 "sản phẩm hết hàng sau khi để lâu", 05 §6 "hết hàng phải rõ". ĐỀ XUẤT.

### 3.2 Bộ số lượng (ĐỀ XUẤT, câu CTO 1)
- `[−][ô số][+]`, cao 44, viền `--color-muted-light` (sổ quyết định 09/11 viền ô nhập), bo `--radius-input`; nút 44 × 44 icon 14; ô 48 chữ 16/500, ẩn spinner native.
- − disabled (`aria-disabled`) ở số 1: giảm về 0 làm bằng nút xoá, tránh xoá nhầm (05 §5 constraints). + disabled khi JS biết đã chạm tồn (422).
- Hover nút: nền `--color-background-alt`; hover cả bộ: viền foreground. Focus: outline 2px accent offset −2 trên nút/ô. Đang cập nhật: số thành spinner 18, hai nút disabled.
- Không JS: chỉ hiện ô số (`name="updates[]"`) + nút "Update"; nút − + render `hidden`, JS bỏ `hidden` khi gắn `data-enhanced`.
- Nguồn: 12 #2151D (Should; mobile 56% vi phạm), 05 §1 vùng chạm ≥ 44. Trái mặc định ES1-T93 #3 (ô số native) nên cần CTO chốt.

### 3.3 Nút xoá
- Icon thùng rác 20 trong vùng 44 × 44 tròn, `--color-muted`; hover nền alt + icon `--color-sale`; focus outline accent. `<a href="{{ item.url_to_remove }}">` giữ như code (chạy không JS), `aria-label` "Remove {title}" (`cart.remove_label`).
- ĐỀ XUẤT thay link chữ "Remove" (12 §1 audit: icon thùng rác quen thuộc, đặt lên đầu dòng).

### 3.4 Freeship (AC3)
- Hộp nền `--color-background-cream`, bo `--radius-card`, padding 16 (24 ngang từ 48rem); icon xe tải 24 + câu 16 (`cart.free_shipping_remaining`, số tiền đậm 600); thanh 8px bo pill, nền `color-mix(foreground 10%)`, phần đầy `--color-accent`.
- Đạt ngưỡng: icon check + `cart.free_shipping_reached`, thanh đầy (State 6). Đổi icon + chữ, không chỉ đổi màu.
- Ẩn khi `free_shipping_threshold` = 0 (mặc định), giỏ rỗng, hoặc tiền tệ khác shop (code). Store dev hiện ngưỡng 0 nên bar không hiện; mockup dùng 500 minh hoạ.
- ĐỀ XUẤT nền cream + icon thay chữ trơn (12 #2320D: freeship là động lực, phải thấy ngay).

### 3.5 Ghi chú đơn (AC5)
- Field foundation §12: label "Order note" 14/600 trên ô, textarea cao 120 (`--space-1 × 30`), viền `--color-muted-light`, gợi ý 14 muted "Optional. Delivery instructions or a gift message." nối `aria-describedby`. Luôn mở (không giấu trong accordion: AC5 yêu cầu textarea, và người cần ghi chú phải thấy).
- Lưu khi submit form (code). Ẩn khi giỏ rỗng (CSS `:has([data-item-count='0'])`, code).

### 3.6 Tóm tắt
- Nền `--color-background-alt`, bo `--radius-card`. h2 "Order Summary" heading 700 cỡ `--font-size-h3`. ĐỀ XUẤT thêm h2 để heading không nhảy bậc từ h1 sang h2 của upsell và để screen reader nhảy tới tổng (06 a11y).
- Dòng: Subtotal (`items_subtotal_price`) · discount cấp đơn (icon tag + tên, số `--color-sale` 500) · Shipping "Calculated at checkout" (14 muted). ĐỀ XUẤT dòng Shipping: 12 §1 Must "chi phí vận chuyển trước thanh toán", theme không tính được phí nên nói rõ tính ở checkout.
- Total: gạch trên 1px border, nhãn 18/600, số heading 700 `--font-size-h3` (số lớn nhất trang, gần nút Checkout; 12 #732D).
- Ghi chú: thuế đã gồm (AC4, code) hoặc ĐỀ XUẤT mặc định "Taxes and shipping calculated at checkout." khi không gồm thuế (người mua biết tổng chưa phải số cuối).
- Checkout: primary full width, icon khoá 20 trước chữ `cart.checkout`. Dưới: icon khiên + "Secure checkout" và icon thanh toán từ `shop.enabled_payment_types` (`payment_type_svg_tag`). ĐỀ XUẤT, 12 §1 Must "hiển thị thanh toán bảo mật", "liệt kê hình thức thanh toán".
- Accelerated: chữ "or pay with" giữa 2 gạch, nút Shopify vẽ; khối chừa `min-height` = `--control-height` để không xô layout khi script gắn nút.

### 3.7 Thanh checkout dính đáy mobile (ĐỀ XUẤT, State 6)
- < 64rem, khi khối tóm tắt ra khỏi màn hình: thanh trắng dính đáy, gạch trên border + bóng nhẹ, padding 12 / lề trang + `env(safe-area-inset-bottom)`; trái "Total" 14 muted + số 18/600, phải nút Checkout (flex 1, cao 48, icon khoá).
- Ẩn khi tóm tắt đã thấy (IntersectionObserver, ticket BE) và khi giỏ rỗng. Không JS: không hiện. `position: fixed` nên 0 CLS; thêm `padding-block-end` cho `<main>` bằng chiều cao thanh để không che nội dung cuối.
- Nguồn: 12 §1 Must "giữ nút thanh toán luôn hiển thị", 12 §8 mobile, 05 §1 thumb zone.

### 3.8 Upsell (ĐỀ XUẤT, phụ thuộc ES1-T247)
- Nguồn dữ liệu theo ES1-T247: Shopify product recommendations, intent complementary, gốc là dòng đầu; 0 kết quả hoặc lỗi thì ẩn cả khối; giỏ rỗng không có upsell.
- Card foundation §9 (không badge rating) + nút `button--secondary` cao 44 full width "Add To Cart" (sổ quyết định 07/11), `aria-label` "Add {title} to cart". Chỉ sản phẩm 1 variant có nút thêm; nhiều variant: nút "Choose Options" dẫn PDP. Nút nằm trên lớp link card (`z-index: 1`).
- Nằm dưới khu giỏ, cách `--section-gap`: phụ, không lấn tóm tắt (12 #600, #2139D "tránh quảng cáo quá nổi bật", tối đa 4).
- 360: hàng vuốt, 2 card + mép card 3, thanh tiến trình; 768: 3.25 card + nút 52 đầu khối; ≥ 1280: lưới 4, ẩn nút và thanh (sổ quyết định 09/11 hàng ngang).
- Thêm thành công: partial `cart-page` + `cart-count` refresh, dòng mới xuất hiện trong danh sách, toast success (foundation §17); sản phẩm vừa thêm rời khỏi upsell (12 #600 audit).
- Đang tải: skeleton 4 card đúng kích thước (foundation §18).

### 3.9 Giỏ rỗng (AC4, State 1)
- h1 "Cart" giữ. Khối rỗng foundation §18: icon túi 32 trong tròn 72 nền alt · h2 "Your Cart Is Empty" (`cart.empty`) · 1 câu gợi ý · primary "Continue Shopping" (`cart.continue_shopping`) + text link "Browse collections" (`routes.collections_url`).
- ĐỀ XUẤT dưới khối: h2 "Bestsellers" + lưới 4 card từ setting collection (ẩn khi để trống). Nguồn 12 §1 Must "động lực mua hàng cho giỏ trống". Mockup lấy 4 sản phẩm sale thật của /collections/all.
- Không freeship, tóm tắt, ghi chú, accelerated (code đã ẩn).
- Câu thuế khi rỗng: AC4 ghi "cart.taxes_included thông báo khi có" nhưng giỏ rỗng không có tổng để gắn câu thuế; giữ như code (không hiện), ghi chú cho QA.

## 4. Trạng thái

| Trạng thái | Hiển thị | Nguồn |
| --- | --- | --- |
| Đang cập nhật (State 2) | `cart-items[aria-busy]`; ô số của dòng đang đổi thành spinner, − + disabled; giá dòng, Subtotal, Total mờ 0.4 tại chỗ; Checkout `aria-disabled` tới khi partial về; status ẩn đọc "Cart updated." | AC2, foundation §18, 05 §5 |
| Lỗi 422 (State 3) | alert foundation §18 đầu danh sách: câu API đậm + `cart.quantity_adjusted`; ô số về giá trị server; focus giữ ở ô | AC2 |
| Lỗi mạng (State 3) | alert `cart.error` + link phụ "Reload Cart" (`routes.cart_url`, chạy không JS) | ĐỀ XUẤT, 05 §4 lỗi phải có cách sửa |
| Hết hàng | §3.1 | 12 §1, 05 §6 |
| Discount (State 5, 6) | dòng + cấp đơn | AC5 |
| Đạt freeship (State 6) | §3.4 | AC3 |
| Không JS (State 7) | ô số + Update, xoá là link, Checkout là submit `name="checkout"` | AC5 |
| Rỗng (State 1) | §3.9 | AC4 |
| Hover / focus / disabled / loading | State 7: stepper, xoá, link tên, link quay lại, Checkout (hover tối 12% + nhấc 1px; focus outline accent; loading spinner trắng; disabled nền border chữ muted 6.70) | foundation §6, 05 §3 |

Code hiện có `.cart-items__error` (viền trái 2px sale trên nền alt): ĐỀ XUẤT đổi sang `.alert` foundation §18 (icon + viền đủ 4 cạnh) để mọi lỗi section cùng một kiểu (06 §1).

## 5. Settings merchant

Có sẵn (theme settings, không đổi): `cart_type` Cart type (drawer/page, default drawer); `free_shipping_threshold` Free shipping threshold (number, default 0 = ẩn).

ĐỀ XUẤT thêm vào schema `cart-page` (label sentence case, `t:` trong `en.default.schema.json`):

| Tên | Kiểu | Default | Giới hạn / ghi chú | Nguồn |
| --- | --- | --- | --- | --- |
| Show recommendations | checkbox | true | chỉ khi ES1-T247 duyệt | 12 #578D |
| Recommendations eyebrow | text | Complete your setup | trống thì ẩn | foundation §1 |
| Recommendations heading | text | You May Also Need | | |
| Products to show | range | 4 | 2–4, bước 1 | 12 #578D tối đa 4 |
| Show recommendations on mobile | checkbox | true | | 12 #578D audit |
| Empty cart collection | collection | trống | trống thì không có lưới Bestsellers | 12 §1 Must giỏ trống |
| Show sticky checkout bar on mobile | checkbox | true | | 12 §1 Must |

Không thêm setting ẩn ghi chú (AC5 bắt buộc có).

Locale mới (ĐỀ XUẤT, `en.default.json` nhóm `cart`): `item_count` (one/other "{{ count }} item(s)"), `summary_title` "Order Summary", `shipping` "Shipping", `shipping_at_checkout` "Calculated at checkout", `taxes_and_shipping_at_checkout` "Taxes and shipping calculated at checkout.", `note_hint`, `decrease_label` "Decrease quantity for {{ title }}", `increase_label` "Increase quantity for {{ title }}", `secure_checkout` "Secure checkout", `express_divider` "or pay with", `line_sold_out`, `empty_hint`, `browse_collections` "Browse collections", `reload` "Reload Cart", `add_label` "Add {{ title }} to cart". ĐỀ XUẤT đổi `continue_shopping` thành "Continue Shopping" khi dùng trên nút (Title Case như "Add To Cart", sổ quyết định 07/11; DESIGN CTA voice); link chữ đầu trang giữ sentence case thì cần key riêng — Dev FE chọn một, ghi trong PR.

## 6. Accessibility

Tương phản (tính tay WCAG, L tương đối; bảng gốc foundation §2):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| foreground / background | 17.4 | tên, thành tiền, số lượng |
| muted / background | 8.45 | nhãn option, gợi ý, nút xoá |
| muted (#4D4D4D, L 0.0742) / alt (#F4F4F4, L 0.9047) | 7.69 | Shipping, ghi chú thuế trong tóm tắt |
| foreground / cream | 15.9 | câu freeship |
| sale / background | 6.38 | giá sale, discount, câu hết hàng |
| sale (L 0.1145) / alt | 5.80 | discount trong tóm tắt |
| accent-foreground / accent | 5.01 | Checkout |
| muted-light / background | 5.33 | viền bộ số lượng, textarea (≥ 3:1 WCAG 1.4.11) |
| accent (L 0.160) / nền thanh freeship (~#DFDFDB, L ~0.73) | 3.7 | phần đầy thanh (đồ hoạ ≥ 3:1) |
| muted / border (Checkout disabled) | 6.70 | |
| background / foreground (badge Sold out, nút accelerated mẫu) | 17.4 | |

- Vùng chạm: stepper 44 × 44 mỗi nút, xoá 44, link quay lại cao 44, Checkout 48/52, nút upsell 44. Hai control gần nhất (− và ô số) dính nhau nhưng mỗi cái đủ 44 (target-size đạt).
- Bàn phím: thứ tự tên → − → ô → + → xoá theo dòng; Enter trong ô số submit form (không JS) hoặc JS cập nhật khi blur/Enter. Sau xoá: focus về tên dòng kế, hoặc h1 khi giỏ rỗng (code có `tabindex="-1"`).
- Tên: mỗi nút −/+/xoá/Add có tên chứa tên sản phẩm (không trùng tên giữa các dòng, Lighthouse/axe). Ô số có `<label>` ẩn (`cart.quantity_label`).
- Hàng tiêu đề cột `aria-hidden` (danh sách là `<ul>`, mỗi dòng đã tự mô tả); thành tiền có chữ ẩn "Line total"; giá có "Sale price"/"Regular price".
- Live region: status (polite) đọc kết quả đổi số/xoá; alert đọc lỗi. `aria-busy` trên vùng đổi.
- `<progress>` có tên từ câu freeship. Heading: h1 Cart → h2 Order Summary → h2 You May Also Need → h3 tên card; giỏ rỗng h1 → h2 Your Cart Is Empty → h2 Bestsellers.
- Không dùng chỉ màu: hết hàng có badge + câu + icon; discount có icon tag; freeship đạt đổi icon + chữ.
- Reduced motion: tắt spinner xoay (giữ vòng tĩnh + chữ "Updating cart…"), tắt nhấc card.

## 7. Token dùng

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt(-foreground)`, `--color-background-cream(-foreground)`, `--color-accent(-foreground)`, `--color-sale`, `--color-rating` (không dùng). Chữ: `--font-heading--family/weight`, `--font-primary--family`, `--font-size-xs/sm/base/lg/h3/h2/h1`. Khoảng: `--space-1..8`, `--page-margin`, `--header-height`. Bo: `--radius-input`, `--radius-button`, `--radius-card`, `--radius-pill`. Motion: `--motion-fast/base`, `--ease-out`. Dẫn xuất foundation: `--section-gap`, `--grid-gap`, `--control-height`, `--shadow-raised`. Không token mới, không hex.

## 8. Lighthouse

- LCP: trang không có ảnh lớn. Có hàng: phần tử LCP dự kiến là khối chữ (câu freeship hoặc tóm tắt) hoặc ảnh dòng đầu 120 × 120 (desktop). Ảnh dòng 1 `loading="eager"` (không `fetchpriority`); dòng 2 trở đi `lazy`. Giỏ rỗng: LCP là khối rỗng (chữ). Tất cả `<img>` có width/height, srcset 96/120/192/240 (`cart-lines` đã có).
- Lazy: ảnh dòng ≥ 2, ảnh upsell, ảnh lưới Bestsellers. Upsell nạp sau khi trang tải (JS), giữ chỗ bằng skeleton để 0 CLS.
- Font: Sofia Sans Condensed 700 (h1, h2, số Total), Inter 400/500/600 (còn lại); 2 họ qua `font_picker`, `font-display: swap`, preload Inter.
- CLS: accelerated checkout chừa `min-height`; live region lỗi rỗng không chiếm chỗ (code); thanh dính đáy `position: fixed`; trạng thái đang cập nhật chỉ đổi opacity.
- JS: stepper, upsell add, thanh dính đáy thuộc BE (`assets/cart-items.js` hoặc file mới ≤ 8 KB). Không thư viện ngoài.
- A11y rủi ro và cách tránh: nút icon không tên → mọi nút có `aria-label` chứa tên sản phẩm; tên nút trùng giữa các dòng → kèm tên sản phẩm; ô số thiếu label → label ẩn; heading nhảy bậc → h2 Order Summary; chữ xám nhạt trên alt → dùng `--color-muted` (7.69), không dùng `--color-muted-light` trên alt cho chữ nhỏ ngoài placeholder; vùng chạm → 44.
- SEO rủi ro: `<title>` "Cart – {shop}", meta description từ `meta-tags`; link "Continue shopping" có href thật. robots.txt mặc định Shopify `Disallow: /cart` → audit "is-crawlable" có thể trừ điểm SEO trên /cart (câu CTO 3).
- Best Practices: ảnh `contain` không méo; 0 lỗi console (mockup 0 lỗi ở 4 mốc).

## 9. Map sang code

| Phần | Code hiện có | Việc Dev FE (markup/CSS) | Việc BE (JS) |
| --- | --- | --- | --- |
| Đầu trang | h1 `cart-page__heading` | số món, link quay lại | — |
| Freeship | `cart-free-shipping` | hộp cream + icon, thanh pill | — |
| Dòng hàng | `cart-lines`, `.cart-line*` | lưới 5 cột ≥ 48rem, ảnh cream bo card, giá gạch compare-at, hàng tiêu đề cột, câu hết hàng, xoá icon 44, viền ô số `--color-muted-light` (code đang `--color-border`, trái sổ quyết định 09/11), focus accent (code `currentcolor`) | — |
| Bộ số lượng | ô number | nút −/+ `hidden` + `data-testid` `cart-line-decrease/increase` | gắn −/+, disabled ở 1, khi 422 |
| Ghi chú | `cart-page__note` | gợi ý + `aria-describedby`, viền muted-light | — |
| Tóm tắt | `cart-summary` | h2, dòng Shipping, câu thuế mặc định, icon khoá, payment icons | `aria-disabled` Checkout khi busy |
| Accelerated | `cart-page__accelerated` | "or pay with", `min-height` | — |
| Thanh dính đáy | — | markup `hidden` + `data-testid="cart-sticky-checkout"` | IntersectionObserver |
| Lỗi | `.cart-items__error` | kiểu `.alert` | điền câu API (có) |
| Rỗng | `.cart-empty` | icon, h2, gợi ý, link phụ, lưới collection | — |
| Upsell | — | block/snippet mới sau khi ES1-T247 chốt | fetch recommendations, add |

Chuyển động: giá và tổng đổi số không animate; dòng bị xoá mờ dần 200ms rồi partial thay (chỉ opacity); toast 250 / 150 (foundation §19).

## 10. Quyết định CTO cần chốt

1. Đổi ô số native (mặc định ES1-T93 #3) sang bộ − ô + 44px cho cart page và drawer? Đề xuất: có; 12 #2151D, mobile 56% site vi phạm, không đổi luồng (vẫn `updates[]`, không JS vẫn chạy), cần 1 ticket BE nhỏ cho nút.
2. Upsell trong cart page (ES1-T247 chưa trả lời): làm theo §3.8, intent complementary, tối đa 4, nằm dưới khu giỏ? Đề xuất: có, kèm thanh checkout dính đáy mobile §3.7 trong cùng đợt BE.
3. /cart bị robots.txt mặc định của Shopify chặn nên SEO 100 có thể không đạt trên trang này: loại /cart khỏi phép đo SEO (vẫn đo A11y, BP, Performance)? Đề xuất: có; sửa robots.txt để mở /cart là trái khuyến nghị của Shopify và đưa trang giỏ vào chỉ mục.
