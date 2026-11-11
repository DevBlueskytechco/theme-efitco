KHÔNG CHẮC: (1) demo-data không có quantity rule, volume pricing, selling plan, số đo unit price, cửa hàng pickup, combined listing: mọi số trong mockup cho các mục này là minh hoạ, ghi rõ trên khung; BA bổ sung dữ liệu ở ES1-T294. (2) Shop Pay Installments trên cart page: chưa xác nhận `{{ form | payment_terms }}` chạy trong form giỏ; banner PDP đặt dưới giá cần mini form `product` riêng (cách của Dawn), Tech Lead xác nhận (ES1-T295). (3) Tên trường Liquid B2B (`variant.quantity_rule`, `variant.quantity_price_breaks`, giá dòng giỏ khi áp bậc) và link card combined listing: Tech Lead đối chiếu shopify.dev trước khi tách ticket (ES1-T295). (4) Figma không có frame nào cho các tính năng này (figma-inventory chỉ có 1:759 featured product): toàn bộ là ĐỀ XUẤT phát triển từ ngôn ngữ 1:759, foundation và product.md.

# UI spec: Tính năng Shopify trên PDP, card, quickview, giỏ (ES1-T288)

## Thay đổi audit

| # | Audit | Trước (spec nào) | Spec này | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | A20 form người nhận gift card | product §11: 1 câu, không mockup | §6: checkbox, 4 trường, lỗi, bộ đếm, dòng giỏ | SRS TE-4 AC6; 01 phần B (demo có gift card) |
| 2 | A20 selling plan | code liệt kê phẳng mọi plan; không thiết kế | §4: thẻ radio theo nhóm + select tần suất, giá chính theo plan, link chính sách; PDP, QV, giỏ | TE-4 AC4, TE-5 AC5; CTO 10/11 (4) |
| 3 | A20 Shop Pay Installments | không có | §3.2: dòng banner dưới ghi chú thuế PDP; cart page dưới panel | TE-4 AC4; ticket |
| 4 | A20 pickup | product §5: 1 dòng + link; code `<details>` | §7: dòng trạng thái + dialog danh sách cửa hàng (drawer phải ≥ 768, sheet < 768), 4 trạng thái | TE-4 AC4; 15 §2 #7; 10 §9 #804 |
| 5 | A20, A21 unit price | product §4 1 dòng, cart §1 anatomy; không mockup | §3.1: cùng một dòng ở PDP, card, QV, mini cart, cart, có mockup | TE-3 AC4, TE-4 AC2; 10 §8 #817; edge_cases "Unit price" |
| 6 | A20 quantity rules + volume pricing (B2B) | không có ở spec nào | §5: dòng quy tắc, bảng giá theo số lượng, lỗi vi phạm, giới hạn đã đủ; PDP, QV, cart, mini cart | CTO 10/11 (4); ticket |
| 7 | A20 sản phẩm số | product §11 1 câu | §8: ẩn ship, pickup, mục "Fast Shipping"; không thêm câu mới | TE-4 AC9 |
| 8 | A21 card theo variant + combined listing | foundation §9 không có | §9: nhãn biến thể, swatch chọn sẵn, link `?variant=`; combined listing ở card, QV, PDP | TE-3 AC8; sổ 10/11 (2048) |

Không đổi spec khác; điểm cần sửa ở product.md, foundation.md, cart.md, mini-cart-quickview.md ghi ở §15.

Mục đích: Theme Store yêu cầu theme hiển thị đúng các tính năng thương mại của Shopify. Spec này gom chúng thành một bộ thành phần dùng chung cho trang sản phẩm (PDP), card, quickview (QV), mini cart và cart page. Mỗi thành phần chỉ hiện khi Shopify có dữ liệu; không có dữ liệu thì không in gì, không chừa chỗ.

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T288/shopify-features.html` (nhúng `../_kit/kit.css`) + `shopify-features-360|768|1280|1920.png`. Khung F1–F9 theo khối, trùng số mục: F1 §3, F2 §4, F3 §5, F4 §7, F5 §6, F6 §8, F7 §9, F8 QV, F9 giỏ.

Nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma > bộ kiến thức. Ngôn ngữ buy box lấy từ product.md (ES1-T253) và Figma 1:759. Thành phần nền theo foundation (§6 nút, §8 badge, §12 form, §15 drawer, §16 dialog, §18 trạng thái).

---

## 1. Vị trí trong buy box PDP

Thứ tự (bổ sung vào product.md §4–§5, giữ phần còn lại):

| # | Phần tử | Block | Mục |
| --- | --- | --- | --- |
| 1 | Vendor, h1, countdown | product-info | product §4 |
| 2 | Giá → **unit price** → rating → ghi chú thuế/ship → **Shop Pay Installments** | product-info | §3 |
| 3 | Bộ chọn option | product-form | product §5.1 |
| 4 | **Purchase options (selling plan)** | product-form | §4 |
| 5 | **Volume pricing** (B2B) | product-form | §5 |
| 6 | Quantity (**N in cart**) + Add To Cart → **dòng quy tắc / lỗi số lượng** | product-form | §5 |
| 7 | **Form người nhận gift card** | product-form | §6 |
| 8 | Buy It Now + "More payment options" | product-form | product §5 |
| 9 | **Pickup** | product-form | §7 |
| 10 | Hàng cam kết, accordion | product-form, product-details | product §5–§6 |

Lý do thứ tự: thông tin giá (unit price, trả góp) nằm sát giá (10 §8 "gộp mọi thông tin giá vào 1 nhóm"); selling plan, volume pricing là lựa chọn ảnh hưởng giá nên đứng trước số lượng; quy tắc số lượng sát ô số lượng (05 §4 lỗi ngay dưới trường); gift card là thông tin bổ sung cho dòng hàng, trước nút thanh toán nhanh; pickup là thông tin giao hàng sau nút (10 §9 #804 gần khu vực mua).

Bề rộng buy box: 320 (360) / 728 (768) / 580 (1280) / 668 (1920), như product §2. Mọi thành phần dưới đây co theo bề rộng này, không cuộn ngang.

## 2. Quy tắc chung

- Chỉ hiện khi có dữ liệu; Liquid không in phần tử rỗng (AGENTS.md empty state: storefront không thấy khung trống).
- Mọi chữ qua `| t` (chuỗi mới §13). Không chữ nhúng ảnh.
- Mọi phần đổi theo biến thể nằm trong partial đổi biến thể (product §17): `product-price` (giá, unit price), `product-selling-plans`, `product-buy-buttons` (số lượng, quy tắc, bảng giá), `product-pickup`. Installments do Shopify tự cập nhật theo `variant-id`.
- Không làm mờ chữ khi đang tải (Lighthouse tính opacity); dùng skeleton cùng kích thước (foundation §18).
- Không chỉ dùng màu: trạng thái luôn có icon + chữ.

## 3. Thông tin giá

### 3.1 Unit price (F1, F7, F8, F9)

Dữ liệu: `variant.unit_price` + `variant.unit_price_measurement` (đã có trong `snippets/price`); dòng giỏ `item.unit_price`, `item.unit_price_measurement` (đã có trong `snippets/cart-lines`). Chuỗi có sẵn `products.price.unit_price_value` "{{ price }}/{{ unit }}" → "$4.68/kg".

| Nơi | Vị trí | Kiểu |
| --- | --- | --- |
| PDP | dòng riêng ngay dưới hàng giá, trước rating | 14/400 `--color-muted` (8.45) |
| Card | dòng riêng dưới giá, trước swatch | 14/400 muted; 1 dòng |
| QV | dưới hàng giá | như PDP |
| Mini cart | dưới giá đơn vị của dòng | 14 muted |
| Cart page | dưới giá đơn vị (cột thông tin), không lặp ở cột thành tiền | 14 muted |
| Sticky bar | không hiện (chỗ hẹp; giá đầy đủ ở buy box) | — |

- Dòng riêng (`.price__unit` `flex-basis: 100%`) thay vì cùng hàng giá: hàng giá ở 360 đã có giá sale + gạch + badge, thêm unit price sẽ rớt dòng lộn xộn. ĐỀ XUẤT, nguồn 10 §8 #817, 03 (nhóm thông tin rõ).
- Chữ ẩn "Unit price" trước số (code có).
- Biến thể không có `unit_price_measurement`: không in dòng.

### 3.2 Shop Pay Installments (F1, F9)

Shopify vẽ banner (`{{ form | payment_terms }}` → `shopify-payment-terms`): "Pay in 4 interest-free installments of $58.50 with Shop Pay Learn more". Theme chỉ chỉnh vị trí, cỡ chữ, màu chữ kế thừa; logo và link "Learn more" (mở dialog của Shopify) do Shopify.

- PDP: dòng cuối nhóm giá, dưới ghi chú thuế/ship, cách 4. Chữ 14 `--color-muted` (8.45), lh 22. ĐỀ XUẤT dời khỏi vị trí hiện tại trong form (sau bộ chọn option): đặt sát giá như hướng dẫn Shopify, dùng 1 mini form `product` chỉ chứa `id` + `payment_terms` trong product-info (KHÔNG CHẮC (2)). Nguồn 10 §8 gộp nhóm giá.
- Chừa `min-height: 22px` cho dòng để banner gắn sau khi script Shopify chạy không xô bố cục (CLS). Shop không bật Installments hoặc giá ngoài khoảng hỗ trợ: Shopify không vẽ chữ, còn lại khoảng 22 trong nhóm giá (chấp nhận, không gây lệch).
- Đổi biến thể: Shopify tự cập nhật theo input `id`; không cần partial.
- Cart page: ĐỀ XUẤT 1 dòng dưới panel tóm tắt, trên khối accelerated checkout, nền trắng, căn giữa, 14 muted (KHÔNG CHẮC (2)). Không đặt trong panel tối: logo Shop Pay tím trên `--color-background-panel` không đảm bảo 3:1, và theme không đổi được màu logo. Mini cart: không hiện (chỗ hẹp, 1 CTA mỗi lớp; trả góp đã có ở PDP và cart page).
- QV: không hiện (QV không có Buy It Now, giữ 1 CTA, mini-cart-quickview §3).

## 4. Purchase options: selling plan (F2, F8, F9)

Dữ liệu: `product.selling_plan_groups` → `group.selling_plans`; giá từ `current_variant.selling_plan_allocations` (`allocation.price`, `allocation.compare_at_price`, `allocation.per_delivery_price`); `selling_plan.name`, `selling_plan.description`, `selling_plan.price_adjustments`; `product.requires_selling_plan`; `product.selected_selling_plan`; `shop.subscription_policy`. Chỉ hiện khi `product.selling_plan_groups.size > 0`.

Anatomy (fieldset `product-selling-plans`, legend "Purchase options" 14/600):
1. Thẻ radio, mỗi thẻ một lựa chọn cấp nhóm, xếp dọc, cách 8:
   - "One-time purchase" (không có khi `requires_selling_plan`).
   - Mỗi `selling_plan_group` một thẻ, tên nhóm (vd "Subscribe and save").
2. Thẻ: viền 1px `--color-border`, bo `--radius-card` (12), padding 16, cao ≥ 64; radio 20 (`accent-color` accent) · tên 16/600 · giá phải 16/600 (sale nếu `allocation.compare_at_price > allocation.price`, kèm giá gạch 14 muted). Thẻ nhóm có badge `.badge--sale` "Save 10%" cạnh tên khi plan có `price_adjustments` kiểu phần trăm (số lấy từ plan đang chọn; kiểu số tiền thì "Save $4.50"). Không có giảm: không badge.
3. Thẻ đang chọn: viền 2px foreground (bù padding 1px, không xô), nền trắng. Hover thẻ chưa chọn: viền foreground. Focus: outline 2px accent offset 2 trên thẻ.
4. Trong thẻ nhóm đang chọn (mở ra bên dưới tên, cùng thẻ):
   - Nhóm có > 1 plan: select "Delivery frequency" (field foundation §12, label thật 14/600, cao 44 trong thẻ, chữ 16 để iOS không zoom), mỗi option là `plan.name` ("Delivery every 1 month, 10% off"). < 48rem thân thẻ tràn hết bề rộng thẻ (select 288 ở 360); tên plan dài hơn ô bị cắt ở trạng thái đóng, danh sách mở của trình duyệt hiện đủ. 1 plan: không select, tên plan in 14 muted.
   - `plan.description` (nếu có) 14 muted, tối đa 3 dòng.
   - Plan trả trước nhiều lần giao (`per_delivery_price != price`): dòng 14 muted "$40.50 per delivery".
5. Dưới fieldset: link "Read the subscription policy" 14, gạch chân, cao 44 (`shop.subscription_policy.url`); chỉ khi có lựa chọn subscription và shop có chính sách. Chữ link mô tả đích (SEO 100, sổ 09/11).

Hành vi:
- Mặc định chọn `product.selected_selling_plan`, không có thì "One-time purchase", `requires_selling_plan` thì plan đầu của nhóm đầu (code có).
- ĐỀ XUẤT giá chính (hàng giá §3, sticky bar) đổi theo plan đang chọn: giá = `allocation.price`, giá gạch = `variant.price` khi thấp hơn, badge -N% tính lại. Không đổi thì người mua thấy 2 giá khác nhau cho cùng lựa chọn (10 §8 không lặp khuyến mãi, 05 §5 phản hồi). Đổi tại chỗ, không fetch (giá đã có trong `data-*` của từng thẻ).
- Đổi biến thể: partial `product-selling-plans` trả lại giá theo biến thể mới, giữ plan đang chọn theo `plan.id` (BE).
- Nút vẫn "Add To Cart" (sổ 07/11), không đổi thành "Subscribe".
- Form gửi: radio "One-time purchase" mang `name="selling_plan" value=""`; radio nhóm không mang `name`; select tần suất của nhóm mang `name="selling_plan"` và chỉ bật khi radio nhóm của nó được chọn (JS đổi `disabled`). Nhóm chỉ 1 plan: radio nhóm mang thẳng `name="selling_plan" value="{plan.id}"`.
- Không JS: in mọi plan thành radio phẳng `name="selling_plan"` như code hiện tại (vẫn mua đúng plan); bản thẻ nhóm + select là tăng cường khi có `data-enhanced` (AGENTS.md progressive enhancement).

Trạng thái (mockup F2):
| # | Trạng thái | Thiết kế |
| --- | --- | --- |
| S1 | One-time chọn (mặc định) | thẻ 1 viền 2px; thẻ nhóm đóng, hiện "from $40.50" 14 muted + badge Save 10% |
| S2 | Subscription chọn | thẻ nhóm mở: select tần suất, mô tả; giá chính $40.50 + gạch $45.00 + badge -10% |
| S3 | Chỉ bán subscription | không thẻ One-time; câu "This product is sold as a subscription." 14 muted dưới legend |
| S4 | Đổi biến thể đang tải | giá trên các thẻ skeleton (cao 22), radio vẫn bấm được |
| — | Không có selling plan | không in fieldset |

QV (F8): cùng component, thẻ cao ≥ 56, padding 12; select tần suất như PDP; giữ link chính sách (minh bạch điều khoản định kỳ, 15 §1 transparency).
Card: không thêm nhãn subscription (card giữ Figma 1:502). Sản phẩm `requires_selling_plan`: nút Quick View mở QV ở S3; card không có nút thêm nhanh riêng.
Mini cart, cart (F9): dưới option, icon lặp 14 + `selling_plan_allocation.selling_plan.name` 14 muted (code có tên, thêm icon); giá dòng `allocation.price` + gạch giá một lần (14 muted) khi rẻ hơn.

## 5. Quantity rules + volume pricing (B2B) (F3, F8, F9)

Dữ liệu (KHÔNG CHẮC (3)): `variant.quantity_rule.min`, `.max`, `.increment`; `variant.quantity_price_breaks` (`minimum_quantity`, `price`), `variant.quantity_price_breaks_configured?`; số đã trong giỏ: tổng `quantity` các dòng `cart.items` cùng `variant_id`. Khách B2C: quy tắc mặc định (min 1, bước 1, không max) → không in gì. Chỉ khách B2B thuộc catalog có quy tắc mới thấy.

### 5.1 PDP

1. Volume pricing (khi `quantity_price_breaks_configured?`), đứng trước hàng số lượng:
   - `<table>` caption "Volume pricing" 14/600 (caption hiển thị, không ẩn); 2 cột "Quantity" | "Price", th 14/600 foreground, sentence case. Dòng 1 là giá gốc của biến thể ở `min` ("6+  $69.00/ea"), các dòng sau là từng bậc ("24+  $64.00/ea", "60+  $59.00/ea").
   - Khung viền 1px `--color-border`, bo 12, dòng cao 44, padding 0 16, vạch giữa dòng 1px border; giá căn phải `tabular-nums`.
   - Bậc hiện hành (theo số trong ô + số trong giỏ): nền `--color-background-cream`, chữ 600, icon check 16 trước số lượng, chữ ẩn "Current price". Đổi khi đổi số lượng (JS tính từ `data-*`, không fetch).
   - > 3 bậc: hiện 3 bậc đầu, phần còn lại trong `<details>` "Show all 5 price breaks" (link 14 gạch chân, cao 44) dưới bảng.
   - Không ghi % tiết kiệm trong bảng (không bịa cách tính; giá mỗi bậc đã rõ).
2. Hàng số lượng: label "Quantity" 14/600 + "(12 in cart)" 14 muted khi > 0. Stepper (product §5: 44 · 40 · 44) mặc định = `min`, −/+ nhảy `increment`; − khoá ở `min`; + khoá khi số + trong giỏ = `max`. Input có `min`, `max`, `step` thật (không JS vẫn được trình duyệt kiểm).
3. Dòng quy tắc ngay dưới hàng số lượng + nút, cách 8: icon info 16 muted + "Minimum of 6 · Maximum of 120 · Increments of 6" 14 muted; chỉ in phần áp dụng (min > 1, có max, bước > 1). `id` dòng này nối `aria-describedby` của ô số.

Vi phạm (05 §4: lỗi ngay dưới trường, nói cách sửa; hiện khi rời ô hoặc khi bấm Add To Cart):
| # | Ca | Hiển thị |
| --- | --- | --- |
| Q2 | Gõ số không hợp lệ (dưới min, không chia hết bước, quá max) | dòng quy tắc đổi thành lỗi: icon ! 16 + "Enter a multiple of 6 between 6 and 108." 14/500 `--color-sale` (6.38); max trong câu = max − số trong giỏ; ô số viền sale + `aria-invalid`; bấm Add To Cart: không gửi, focus ô số, `product-form-error` đọc câu lỗi. Nút KHÔNG khoá (khoá thì người mua không biết vì sao, 05 §3) |
| Q3 | Trong giỏ đã đủ max | stepper khoá (nền alt), dòng: icon info + "You have the maximum of 120 in your cart." + link "View cart" (`routes.cart_url`); Add To Cart disabled, nhãn giữ "Add To Cart" (chữ muted 6.70 trên border) |
| Q4 | Server 422 (quy tắc đổi giữa chừng, tồn kho) | câu lỗi của Shopify trong `product-form-error` (product §11 D), số lượng về giá trị server |

ĐỀ XUẤT không tự làm tròn số khi rời ô: tự đổi số người mua gõ là đổi dữ liệu ngầm (16 Norman: phản hồi rõ, người dùng kiểm soát). Câu lỗi đã nêu khoảng hợp lệ.

### 5.2 QV
Dòng quy tắc như PDP dưới stepper. Volume pricing: `<details>` đóng sẵn "Volume pricing available" (14/600 + caret) chứa cùng bảng; QV không đủ chỗ cho bảng mở sẵn ở 360. Lỗi như PDP trong `.qv__error`.

### 5.3 Mini cart, cart page
- Dưới tên/option của dòng: "Min 6 · Increments of 6" 14 muted (bản rút gọn, bỏ max nếu không có).
- Stepper bước `increment`; − khoá ở `min` (xoá bằng thùng rác như cart §3.3); + khoá khi = max.
- Dòng đang hưởng bậc giá: icon tag 14 `--color-badge-new` (đồ hoạ 4.57) + "Volume pricing applied" 14 muted, dưới giá đơn vị (giá đơn vị đã là giá bậc). Không dùng xanh làm màu chữ (DESIGN.md: badge_new không làm màu chữ). KHÔNG CHẮC (3) cách nhận biết dòng đang hưởng bậc.
- Gõ số sai rồi rời ô: lỗi dưới dòng như Q2, không gửi update; 422: lỗi cart §4 State 3.

## 6. Form người nhận gift card (F5)

Chỉ PDP khi `product.gift_card?` (QV chỉ chọn mệnh giá + câu trỏ về PDP, mini-cart-quickview §3, giữ). Code đã có trường và thuộc tính Shopify (`properties[__shopify_send_gift_card_to_customer]`, `Recipient email`, `Recipient name`, `Message`, `Send on`, `__shopify_offset` do JS); spec này thêm hình, lỗi, bố cục.

Anatomy (sau hàng số lượng, trước Buy It Now):
1. Checkbox `.choice` 20 trong hàng 44: "I want to send this as a gift" 16/500. Mặc định không chọn.
2. Chọn: fieldset hiện ngay bên dưới (không animate chiều cao; chỉ opacity 150ms), viền trái 2px `--color-border`, padding-inline-start 16, cách 16. Legend ẩn "Recipient information" (code có). Trường (field foundation §12, viền `--color-muted-light`):
   - Recipient email `*` (`type=email`, `required` khi chọn, `autocomplete="off"`).
   - Recipient name "(optional)".
   - Message "(optional)": textarea 4 dòng, `maxlength=200`; gợi ý dưới "200 characters left" cập nhật khi gõ (không aria-live từng ký tự; chỉ đọc khi còn 20 qua status).
   - Send on "(optional)": `type=date`, `min` hôm nay, `max` +90 ngày; gợi ý "Leave blank to send right after checkout, or choose a date up to 90 days from today."
3. Bố cục: 360 1 cột; ≥ 768 email | name 2 cột (gap 16), message full, send on nửa cột. Ở 1280 (580) mỗi cột 274.
4. Bỏ chọn: ẩn fieldset, trường `disabled` (không gửi), giữ chữ đã gõ nếu chọn lại.

Lỗi (hiện khi rời trường và khi bấm Add To Cart; foundation §12):
| Trường | Ca | Câu |
| --- | --- | --- |
| Email | trống khi đã chọn | "Enter the recipient's email address." |
| Email | sai dạng | "Enter an email address like name@example.com." |
| Send on | ngoài khoảng | "Choose a date between Nov 10, 2026 and Feb 8, 2027." (ngày theo `min`/`max`) |
| Message | chạm 200 | không lỗi; gợi ý "0 characters left" chữ foreground 600 |
| Server 422 | Shopify trả lỗi thuộc tính | câu Shopify trong `product-form-error`; đánh dấu trường nếu khớp tên |

Bấm Add To Cart khi có lỗi: không gửi, focus trường lỗi đầu, `product-form-error` đọc "Check the recipient details." (tóm tắt). Trường lỗi viền sale 2px + `aria-invalid` + `aria-describedby` tới câu lỗi.

Sản phẩm gift card không cần ship (`requires_shipping` false): ẩn ghi chú ship, pickup, mục "Fast Shipping" như §8.

Mini cart, cart page (F9): dòng gift card hiện "To: Alex Tran (alex@example.com)" · "Sends on Nov 24, 2026" · lời nhắn 1 dòng "…" (14 muted), thay vì in thô 4 thuộc tính (code in mọi property không bắt đầu `_`). ĐỀ XUẤT, 12 §1 (thông tin dòng hàng đầy đủ, gọn).

## 7. Pickup availability (F4)

Dữ liệu: `current_variant.store_availabilities | where: 'pick_up_enabled'` → `available`, `pick_up_time`, `location.name`, `location.address` (`| format_address`), `location.address.phone`. Chỉ khi `current_variant.requires_shipping` và có ≥ 1 địa điểm bật pickup (code có điều kiện).

### 7.1 Dòng trong buy box (dưới Buy It Now, cách 24)
- Icon 20 trái · cột chữ: dòng 1 14/500 foreground · dòng 2 14 muted · nút mở dialog.
- P1 còn pickup ở địa điểm đầu: icon check trong tròn `--color-badge-new` (đồ hoạ 4.57), "Pickup available at **Efitco Saigon Centre**", dòng 2 `pick_up_time` ("Usually ready in 24 hours").
- P2 địa điểm đầu không có: icon × trong tròn viền `--color-muted-light`, "Pickup currently unavailable at **Efitco Saigon Centre**", không dòng 2.
- Nút: "Check availability at other stores" khi ≥ 2 địa điểm; "View store information" khi 1 địa điểm. `<button>` kiểu text-link 14/500 gạch chân, cao 44, `aria-haspopup="dialog"`.
- P0 không địa điểm bật pickup / sản phẩm số / gift card: không in khối.
- Đổi biến thể: partial `product-pickup`; đang tải: skeleton 2 dòng cao 44.

### 7.2 Dialog danh sách cửa hàng
Theo 15 §2 #7: ≥ 768 drawer phải (foundation §15: 420 ở 768, 480 từ 80rem), < 768 bottom sheet (foundation §16, cao ≤ 88dvh, thanh kéo). `<dialog>` + `showModal()`.
- Header 72: h2 "Pickup availability" (overlay title) + nút đóng 48 "Close pickup availability".
- Dưới header: ảnh 64 nền cream bo 8 (`alt=""`, lazy, tải khi mở) · tên sản phẩm 16/600 · biến thể 14 muted ("Black").
- `<ul>` địa điểm, mỗi mục padding 16 0, vạch 1px border: tên 16/600 · trạng thái icon 16 + chữ 14/500 ("Pickup available, usually ready in 24 hours" / "Pickup currently unavailable") · địa chỉ 14 muted (`format_address`, `<address>`) · điện thoại: link `tel:` 14/500 gạch chân, cao 44, tên đọc "Call Efitco Saigon Centre". Thiếu điện thoại: không in.
- Thứ tự: giữ thứ tự Shopify trả (theo cấu hình địa điểm của merchant); ĐỀ XUẤT không tự sắp lại (không có vị trí người mua, không xin quyền vị trí: 15 §1 needy patterns, BP 100).
- Đóng: ×, Escape, scrim (drawer), vuốt xuống (sheet); trả focus về nút mở. Mở 250ms trượt, đóng 200ms (foundation §19).
- Không JS: giữ `<details>` inline như code (summary = chữ nút), danh sách bung dưới dòng.

## 8. Sản phẩm số (F6)

`current_variant.requires_shipping == false` (edge_cases "Sản phẩm số": Operating system iOS / Fire OS / FreeBSD, $343.00):
- Ẩn: câu "Shipping calculated at checkout." (giữ câu thuế), khối pickup, mục "Fast Shipping" trong hàng cam kết (còn 2 mục: 1 Year Warranty, 90 Day Money Back; 768 và ≥ 1280 chia 2 cột).
- Giữ: bộ chọn option, số lượng (ẩn nếu merchant tắt "Show quantity selector", product §12), Buy It Now.
- Không thêm câu mới kiểu "Digital delivery" (AC9 chỉ yêu cầu ẩn; không có nguồn nội dung).
- Giỏ: freeship bar vẫn tính theo tổng giỏ (code), không đổi.

## 9. Card theo variant + combined listing (F7)

Theo foundation §9 (Figma 1:502) và quyết định swatch card là chỉ báo (ES1-T294 cập nhật TE-3 AC2/AC6).

### 9.1 Card theo variant (TE-3 AC8: collection đa nguồn có phần tử là variant)
`snippets/product-card` nhận `variant` (code có):
- Ảnh `variant.featured_image`, giá và badge theo variant, link `variant.url` (`?variant=`), swatch của giá trị variant chọn sẵn (viền accent như `.swatch.is-selected`).
- ĐỀ XUẤT nhãn biến thể: dòng 14 muted `variant.title` ("Gray") giữa tên và giá, 1 dòng "…". Lý do: 2 card cùng sản phẩm đứng cạnh nhau trong lưới (vd Revllen Black và Gray) phải phân biệt được bằng chữ, không chỉ bằng ảnh/màu (01 không chỉ dùng màu; 06 §1 nhất quán dữ liệu). Card thường (không truyền `variant`) không có dòng này, giữ Figma.
- Tên link đọc "Revllen Pro Speed Rope, Gray, 3 colors".
- Unit price dưới giá nếu có (§3.1).

### 9.2 Combined listing
Sản phẩm cha gộp nhiều sản phẩm con; mỗi giá trị option có thể có `value.product_url` riêng (product §17).
- Card: hiện như card thường của sản phẩm cha (ảnh, khoảng giá `price_min – price_max` nếu khác nhau, swatch chỉ báo các giá trị). Link: URL sản phẩm con của giá trị đang chọn mặc định (KHÔNG CHẮC (3), Tech Lead xác nhận nguồn URL).
- QV: chọn giá trị có `product_url` khác sản phẩm đang xem → QV tải lại nội dung của sản phẩm con trong cùng dialog (skeleton như QV 5a ở cột info và ảnh), dialog không đóng, focus giữ trên giá trị vừa chọn; "View Detail" trỏ sang sản phẩm con. Không đổi URL trang nền (sổ 10/11 M4).
- PDP: chọn giá trị như vậy → điều hướng sang trang sản phẩm con (product §17 bước 4). ĐỀ XUẤT giữ radio (nhóm bàn phím liền mạch với các giá trị khác), BE điều hướng; thêm chữ ẩn ", opens another page" để người dùng trình đọc biết trang sẽ đổi (WCAG 3.2.2: thay đổi ngữ cảnh khi chọn phải báo trước).

## 10. Quickview (F8)

Không vẽ lại QV (mini-cart-quickview §3). Bổ sung trong cột info, đúng thứ tự PDP §1: giá → unit price → [option] → Purchase options (§4, thẻ gọn) → Volume pricing `<details>` đóng (§5.2) → Quantity (N in cart) → dòng quy tắc → hàng mua. Không installments, không pickup, không form gift card (đã chốt ở mini-cart-quickview §3). Mobile sheet: hàng mua vẫn dính đáy; phần thêm làm sheet dài hơn → cuộn trong sheet (mini-cart-quickview §3.1).

## 11. Giỏ: dòng hàng (F9)

Thứ tự trong cột thông tin của dòng (cart §3.1, mini-cart-quickview §1): tên → option → selling plan (icon lặp) → thuộc tính gift card (§6) → giá đơn vị (sale + gạch) → unit price → "Volume pricing applied" → quy tắc số lượng → [stepper, thành tiền] → lỗi dòng.
- Chữ 14 cho mọi dòng phụ; mini cart giữ 14 (không xuống 13: chữ thân phải ≥ 14 để đọc trên 360).
- Cart page: Shop Pay Installments dưới panel (§3.2).
- Lỗi quy tắc số lượng của dòng: câu sale + icon dưới dòng (như Q2), ô số `aria-invalid`.

## 12. Settings merchant

Không thêm setting. Các tính năng này do dữ liệu Shopify bật/tắt (merchant cấu hình trong Admin: Shop Pay, Selling plans app, B2B catalog, Locations, Gift card, Unit price). Theme Store coi chúng là bắt buộc hiển thị khi có dữ liệu, nên không có công tắc tắt trong theme (AGENTS.md "add only settings the design needs").

Giữ setting có sẵn: product-form "Show dynamic checkout buttons" (true). Liên quan product §12 (ĐỀ XUẤT ở đó): "Show quantity selector" — khi tắt mà biến thể có quantity rule (min > 1) thì vẫn hiện stepper (không thể mua đúng quy tắc nếu ẩn); ghi vào info của setting: "Always shown when B2B quantity rules apply."

## 13. Chuỗi mới (ĐỀ XUẤT key, Dev FE thêm vào `locales/en.default.json`)

- `blocks.product_form.quantity_in_cart` "({{ quantity }} in cart)"
- `blocks.product_form.quantity_rules.min` "Minimum of {{ min }}", `.max` "Maximum of {{ max }}", `.increment` "Increments of {{ increment }}", `.error` "Enter a multiple of {{ increment }} between {{ min }} and {{ max }}.", `.limit_reached` "You have the maximum of {{ max }} in your cart."
- `blocks.product_form.volume_pricing.title` "Volume pricing", `.available` "Volume pricing available", `.quantity` "Quantity", `.price` "Price", `.tier` "{{ quantity }}+", `.each` "{{ price }}/ea", `.current` "Current price", `.show_all` "Show all {{ count }} price breaks"
- `blocks.product_form.selling_plan.save_percent` "Save {{ percent }}%", `.save_amount` "Save {{ amount }}", `.from` "from {{ price }}", `.frequency` "Delivery frequency", `.per_delivery` "{{ price }} per delivery", `.subscription_only` "This product is sold as a subscription.", `.policy` "Read the subscription policy"
- `blocks.product_form.pickup.view_store` "View store information", `.dialog_title` "Pickup availability", `.close` "Close pickup availability", `.call` "Call {{ location }}"; sửa `pickup.available` thành "Pickup available, usually ready in {{ time }}" khi có thời gian (giữ bản không thời gian)
- `blocks.product_form.gift_card.optional` "(optional)", `.characters_left` "{{ count }} characters left", `.error_email_required` "Enter the recipient's email address.", `.error_email` "Enter an email address like name@example.com.", `.error_send_on` "Choose a date between {{ start }} and {{ end }}.", `.error_summary` "Check the recipient details."; sửa `send_on_hint` "Leave blank to send right after checkout, or choose a date up to {{ days }} days from today."
- `cart.quantity_rule_short` "Min {{ min }} · Increments of {{ increment }}", `cart.volume_pricing_applied` "Volume pricing applied", `cart.gift_card_to` "To: {{ name }} ({{ email }})", `cart.gift_card_send_on` "Sends on {{ date }}"
- `products.product.opens_other_product` ", opens another page" (chữ ẩn combined listing)

Copy American English, sentence case cho chữ thân; nhãn nút giữ Title Case (sổ 07/11).

## 14. Accessibility và Lighthouse

Tương phản (tính tay, số theo foundation §2, product §13):
| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| muted / background | 8.45 | unit price, dòng quy tắc, mô tả plan, installments, địa chỉ cửa hàng, thuộc tính gift card |
| foreground / cream | 15.9 | bậc giá hiện hành |
| sale / background | 6.38 | lỗi số lượng, lỗi trường gift card, giá plan giảm |
| sale-foreground / sale | 6.38 | badge "Save 10%" |
| foreground / background (viền thẻ chọn 2px) | 17.4 | thẻ selling plan đang chọn |
| border / background (viền thẻ chưa chọn) | 1.26 | chỉ trang trí; radio 20 accent 5.01 mang trạng thái (1.4.11) |
| badge-new / background | 4.57 | icon check pickup, icon tag volume (đồ hoạ ≥ 3) |
| muted-light / background | 5.33 | viền ô nhập gift card, icon × pickup (viền trái fieldset gift card dùng border 1.26, chỉ trang trí) |
| muted / border | 6.70 | Add To Cart disabled (Q3) |
| accent / background | 5.01 | focus, radio |

- Vùng chạm: thẻ selling plan ≥ 56 (cả thẻ là label); radio/checkbox trong hàng 44; nút pickup, link chính sách, "Show all … price breaks", "View cart", link điện thoại 44; stepper 44; đóng dialog 48.
- Tên: fieldset + legend cho Purchase options; select có label thật; bảng volume có caption + `th scope="col"`; dòng hiện hành có chữ ẩn; stepper "Decrease quantity for {product}" (product §13); dialog pickup `aria-labelledby`; link điện thoại có tên địa điểm; checkbox gift card có label bọc.
- Live region: đổi plan → status "Subscribe and save selected, $40.50"; đổi số lượng sang bậc mới → status "$64.00 each at 24+"; lỗi trường không dùng live region (aria-describedby + focus khi submit), tóm tắt qua `product-form-error` (role alert, có sẵn).
- Bàn phím: thẻ plan là nhóm radio (mũi tên); select chỉ trong thẻ đang chọn (thẻ khác `disabled`, không vào Tab); dialog pickup bẫy focus, Escape đóng.
- Không chỉ màu: bậc hiện hành có icon check + chữ ẩn; pickup có icon khác hình (check / ×) + chữ; lỗi có icon + câu.
- WCAG 3.2.2: chọn giá trị combined listing đổi trang có chữ ẩn báo trước (§9.2).

Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90):
- LCP không đổi (ảnh gallery đầu). Không thành phần nào ở đây là ảnh lớn.
- CLS: installments chừa 22px; pickup, selling plan, bảng volume in từ Liquid (có kích thước ngay lần vẽ đầu); đổi biến thể thay nội dung cùng chiều cao + skeleton; dialog `fixed`.
- Lazy: ảnh 64 trong dialog pickup chỉ tải khi mở (`loading="lazy"` trong dialog đóng = không tải). Không ảnh mới ở card, giỏ.
- JS: installments là script Shopify (ngoài ngân sách theme, không tránh được khi bật AC4). Phần theme: đổi giá theo plan, bậc hiện hành, đếm ký tự, mở dialog pickup: gộp vào `product-form.js` hiện có hoặc 1 module ≤ 8 KB; không JSON biến thể (sổ 10/11 2048): giá plan và bậc lấy từ `data-*` của biến thể đang chọn.
- Font: 2 họ, không thêm weight (Inter 400/500/600, Sofia 700 cho tiêu đề dialog).
- SEO: link chữ mô tả đích ("Read the subscription policy", "Check availability at other stores", "View cart"); không "Learn more" của theme (chữ "Learn more" trong banner là của Shopify, nằm trong shadow DOM). Chữ nhỏ nhất 13 (badge).
- BP: không xin quyền vị trí; date input native; 0 lỗi console (mockup 4 mốc).

## 15. Đề xuất sửa ở spec khác (không sửa trong ticket này)

| File | Mục | Sửa |
| --- | --- | --- |
| docs/ui-spec/product.md | §4 | thêm installments cuối nhóm giá (mini form), unit price dòng riêng; trỏ §3 spec này |
| docs/ui-spec/product.md | §5 | thêm Purchase options, Volume pricing, (N in cart), dòng quy tắc, form gift card, pickup dialog theo thứ tự §1 spec này; "Pickup (khi có)" thay bằng trỏ §7 |
| docs/ui-spec/product.md | §11 | câu "gift card hiện form người nhận" và "Sản phẩm số" trỏ §6, §8; thêm trạng thái S1–S4, Q2–Q4, P0–P2 |
| docs/ui-spec/product.md | §12 | info "Show quantity selector" như §12 spec này |
| docs/ui-spec/foundation.md | §9 | card: dòng unit price 14 muted dưới giá; dòng `variant.title` khi card theo variant |
| docs/ui-spec/mini-cart-quickview.md | §1 dòng hàng, §3 QV | thứ tự dòng phụ §11; QV thêm §10 |
| docs/ui-spec/cart.md | §3.1, §3.6 | dòng phụ §11; installments dưới panel §3.2; gift card thuộc tính gọn §6 |
| blocks/product-form.liquid (Tech Lead) | noscript select | đang lặp mọi biến thể (`product-variant-select`), trái sổ 10/11 (2048) |
| snippets/product-card.liquid (Tech Lead) | swatch | đang lặp `product.variants` để tìm biến thể swatch, trái sổ 10/11 (2048); dùng `value.variant` |

## 16. Map sang code

| Phần | Code hiện có | FE | BE |
| --- | --- | --- | --- |
| Unit price | `snippets/price` `.price__unit`, `cart-lines` | `flex-basis: 100%`, 14 muted; card, QV | — |
| Installments | partial `product-installments` trong form | mini form trong product-info dưới ghi chú thuế, `min-height` 22; cart page dưới panel | — |
| Selling plan | partial `product-selling-plans` radio phẳng | thẻ theo nhóm, select tần suất, badge, link chính sách, `data-*` giá | giá chính theo plan, giữ plan khi đổi biến thể, status |
| Quantity rules, volume | input number `min=1` | `min/max/step` từ `quantity_rule`, label in cart, bảng volume, dòng quy tắc, lỗi; giỏ: dòng rút gọn | stepper theo bước, bậc hiện hành, kiểm khi rời ô/submit, Q3 |
| Gift card | trường có sẵn, `:has(:checked)` | bố cục 2 cột, optional, lỗi, gợi ý mới; giỏ: thuộc tính gọn | kiểm trường, đếm ký tự, `__shopify_offset` (có) |
| Pickup | partial `product-pickup` + `<details>` | dòng icon, nút, `<dialog>` drawer/sheet, `<details>` cho không JS | mở/đóng dialog, focus |
| Sản phẩm số | `requires_shipping` ở product-info, pickup | ẩn "Fast Shipping" | — |
| Card variant | `product-card` param `variant` | dòng `variant.title`, tên link | — |
| Combined listing | — | `data-product-url`, chữ ẩn | PDP điều hướng; QV tải lại sản phẩm con |

Tách ticket theo `.claude/rules/fe-be-boundary.md`: FE trước (markup, `data-testid`: `product-volume-pricing`, `product-quantity-rules`, `product-selling-plan-frequency`, `product-subscription-policy`, `product-pickup-open`, `product-pickup-dialog`, `product-gift-card-error-*`, `cart-line-quantity-rule`, `cart-line-volume`), BE sau.

## 17. Quyết định CTO đã chốt 11/11 (theo đề xuất, sổ 11/11)

1. Selling plan dùng thẻ radio theo nhóm + select tần suất, giá chính đổi theo plan đang chọn (thay radio phẳng mọi plan của code)? Đề xuất: có (§4).
2. Pickup mở dialog (drawer phải ≥ 768, bottom sheet < 768), giữ `<details>` chỉ khi không JS? Đề xuất: có (§7, 15 §2 #7).
3. Vi phạm quantity rule: Add To Cart vẫn bật, kiểm khi rời ô và khi bấm (lỗi inline + focus ô số), chỉ khoá khi giỏ đã đủ max? Đề xuất: có (§5.1).
