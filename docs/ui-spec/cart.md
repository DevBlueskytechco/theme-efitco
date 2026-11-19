KHÔNG CHẮC: (1) upsell chưa có AC trong TE-5, câu hỏi ES1-T247 còn mở; (2) ảnh store dev lệch tên (ES1-T245): trong mockup Training Mat 12 mm hiện kệ, Speed rope hiện áo tạ, Resistance Band Set hiện dây thừng, ô Home Starter Kit/Olympic Plate Set/Ativafit Lava hiện dây nhảy/quấn cổ tay/thảm; giữ URL; (3) demo-data không có discount tự động, selling plan, unit price, ngưỡng freeship: tên "Bundle discount (10%)", số tiền giảm và ngưỡng $500 trong mockup là minh hoạ (bậc 10% theo sổ 06/11 E7); (4) Figma không có frame cart: panel tóm tắt lấy từ "Your Bundle" 1:718, các phần khác phát triển từ ngôn ngữ trang chủ.

# UI spec: Cart page (ES1-T255, vòng 3)

Mục đích: người mua xem lại giỏ, đổi số lượng, xoá, ghi chú đơn, thấy tổng tiền (giảm giá, freeship, thuế) và đi tới checkout trong ít bước nhất. Story TE-5 (AC1–AC5). Template `templates/cart.liquid` → `container` → `blocks/cart-page.liquid` (snippet `cart-free-shipping`, `cart-lines`, `cart-summary`). Mini cart (drawer) làm ở ES1-T262.

Đầu ra: spec này; `drafts/designer/ES1-T255/cart.html` (nhúng `../_kit/kit.css` vòng 3); `cart-360|768|1280|1920.png`. Trạng thái ở cuối mockup (State 1–7).

Thứ tự nguồn: sổ quyết định > AGENTS.md > DESIGN.md > Figma 1:359 > ES1-T93 (bố cục mặc định CTO 05/11) > bộ kiến thức (file NN). Không dùng trang live hay ảnh store làm gốc (sổ 10/11).

Figma đối chiếu: header 1:362, panel "Your Bundle" 1:718 (tóm tắt, dòng giảm giá 1:745, thanh tiến trình + khoá 1:748, Total 1:755, CTA 1:758), badge "3 Items" 1:721, card sản phẩm 1:502, nút "Add To Cart" có icon túi 1:759, header khối + chevron 52 1:395/1:398, footer 1:1104.

## Thay đổi so với vòng 2

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header | biến thể A nền trắng viền dưới | thanh tối `--color-background-dark` + noise, cao 80, logo 100 × 30, menu trắng 60%, search 20, số giỏ pill trắng | Sổ 10/11, Figma 1:362, foundation §3 |
| 2 | Tóm tắt | nền `--color-background-alt` bo 12, h2 Sofia cỡ h3, Total Sofia cỡ h3 | panel `--color-background-panel` bo 16, padding 24/32/40; đầu panel: tiêu đề Inter 700 18/28 + badge cam "4 Items"; gạch 1px `--color-muted`; dòng Inter 500 16/26 cách 24; Total nhãn 500 16, số 700 18 | Figma 1:718, 1:719, 1:721, 1:740 |
| 3 | Chữ phụ trên panel | — | trắng 70% trên panel (6.56:1) thay #999 Figma (4.01:1, trượt AA chữ 14) | Figma 1:753; sổ 09/11 AA |
| 4 | Giảm giá | chữ đỏ `--color-sale` | xanh như "Bundle discount" Figma: dòng trên nền trắng `--color-badge-new` (4.57); trên panel `badge-new` 50% trắng (5.81) thay #4B824D (2.50) | Figma 1:746, 1:747 |
| 5 | Nút Checkout | icon khoá trước chữ | chữ + mũi tên 16 × 14 sau chữ, full width trong panel | Figma 1:758 |
| 6 | Freeship | thanh 8 bo pill, xe tải 24, câu 16 | thanh 4 bo 2 ở trên, dưới là icon khoá 12 × 16 + câu 14/500 muted, số tiền 700 foreground; hộp cream bo 16; vẫn ở đầu danh sách | Figma 1:749, 1:751; ES1-T93 |
| 7 | Nút prev/next upsell | mũi tên 20 × 16 | chevron 11 × 16 trong tròn 52, trắng viền border, hover cam | Sổ 09/11, Figma 1:398, foundation §6 |
| 8 | Nút "Add To Cart" upsell | chỉ chữ | icon túi 20 + chữ | Figma 1:759 |
| 9 | Đang cập nhật | giá dòng, Subtotal, Total mờ 40% | giữ số, không làm mờ; panel hiện "Updating cart…" (spinner + chữ, role status) thay chỗ ghi chú thuế | Foundation §18 (Lighthouse tính opacity) |
| 10 | Thanh dính đáy mobile | nền trắng | nền panel tối, cùng ngôn ngữ tóm tắt | Figma 1:718 |
| 11 | Footer | panel trong container, 3 social | foundation vòng 3: newsletter có ảnh, panel dải rộng bo 16, 4 social, wordmark giữa hàng cuối | Figma 1:1104, foundation §4 |
| 12 | Giỏ rỗng | h3 "Bestsellers" đơn | eyebrow cam "Popular right now" + h3 như header khối 1:490; nút có mũi tên | Figma 1:490, 1:758 |
| 13 | Câu CTO SEO /cart | còn mở | bỏ: đã chốt 10/11 (/cart không tính SEO) | Sổ 10/11 |

---

## 1. Anatomy

Thứ tự DOM (giữ như code, focus đi theo thứ tự này):

1. Header tối (foundation §3): icon cart `aria-current="page"`, tên "Cart, 4 items".
2. Đầu trang `.cart-head` (không breadcrumb, foundation §5): h1 "Cart" (`tabindex="-1"` cho JS đưa focus) · số món "4 items" · link "← Continue shopping" (`routes.all_products_collection_url`).
3. Live region: `cart-items-status` (ẩn, polite) · `cart-items-error` (role alert, rỗng không chiếm chỗ).
4. Cột chính:
   a. Freeship (AC3): thanh `<progress>` (tên từ câu) · icon khoá + câu còn thiếu / icon check + câu đã đạt.
   b. Hàng tiêu đề cột (≥ 48rem, `aria-hidden`): Product · Quantity · Total.
   c. `<ul>` dòng hàng: ảnh · tên (link PDP) · option `dl` · thuộc tính dòng (bỏ key `_`) · selling plan · đơn giá (sale đỏ + giá gạch) · unit price · discount dòng (icon tag + tên + `-$x`, xanh) · bộ số lượng · thành tiền · nút xoá.
   d. Nút "Update" (chỉ khi không JS).
   e. Ghi chú đơn (AC5).
5. Cột tóm tắt (sticky ≥ 64rem): panel tối: đầu panel (h2 "Order Summary" + badge "4 Items") · Subtotal · discount cấp đơn · Shipping "Calculated at checkout" · Total · ghi chú thuế · Checkout → · "Secure checkout" + icon thanh toán.
6. Accelerated checkout (`content_for_additional_checkout_buttons`, ngoài partial): "or pay with" + nút Shopify.
7. Upsell (ĐỀ XUẤT, ES1-T247): eyebrow "Complete your setup" · h2 "You May Also Need" · chevron 52 (768–1279) · 4 card + "Add To Cart" · thanh tiến trình (< 80rem).
8. Footer (foundation §4).

## 2. Layout theo mốc

| Giá trị | 360 | 768 | 1280 | 1920 | Token / nguồn |
| --- | --- | --- | --- | --- | --- |
| Header | 80, menu ☰ + logo + 3 icon | như 360 | 80, menu 7 mục gap 40 | như 1280, logo x 252 | foundation §3 |
| Nội dung | 320 | 728 | 1240 | 1416 | `--content-width` |
| Đầu trang padding | 24 / 24 | 24 / 24 | 32 / 40 | 32 / 40 | `--space-5`; `--space-6` / `--space-1 × 10` từ 64rem |
| h1 | 33 | 43 | 48 | 48 | `--font-size-h1` |
| Cột | 1 | 1 | 795 + 397, gap 48 | 912 + 456, gap 48 | 8fr / 4fr, `--space-7` (ES1-T93 #2) |
| Dòng hàng (cột) | 88 · 1fr · auto | 120 · 1fr · 138 · 96 · 44 | như 768 | như 768 | `--space-1 × 22` / `× 30` |
| Gap trong dòng | 12 | 16 | 24 | 24 | `--space-3` / `--space-4` / `--space-5` từ 80rem |
| Freeship padding | 16 | 24 | 24 | 24 | `--space-4` → `--space-5` |
| Bộ số lượng | 138 × 44 | 138 × 44 | 138 × 44 | 138 × 44 | nút 44, ô 48 |
| Panel tóm tắt padding | 24 | 32 | 40 | 40 | Figma 1:718 padding 40; `--space-5/6`, `--space-1 × 10` |
| Panel bo / gap | 16 / 24 | 16 / 24 | 16 / 24 | 16 / 24 | `--radius-card + --space-1`; `--space-5` (Figma itemSpacing 24) |
| Panel sticky | — | — | top 96 | top 96 | `--header-height + --space-4` |
| Checkout cao | 48 | 48 | 52 | 52 | `--control-height` (Figma 52) |
| Upsell | hàng vuốt, card 45% | 3.25 card + chevron 52 | lưới 4 × 292 | lưới 4 × 336 | foundation §9, §11 |
| Khoảng trước upsell | 48 | 48 | 120 | 120 | `--section-gap` |

Sắp xếp:
- 360/768: đầu trang → freeship → dòng hàng → ghi chú → panel tóm tắt → accelerated → upsell. Mobile: dòng 1 ảnh | tên, option, giá | xoá; dòng 2 ảnh | bộ số lượng | thành tiền. Xoá góc trên phải (12 §1 audit: icon thùng rác, đặt lên đầu).
- 1280/1920: ảnh | thông tin | số lượng | thành tiền | xoá một hàng, căn đỉnh; thành tiền thẳng cột "Total". Panel sticky bên phải trong tầm nhìn đầu (12 §1 Must "tóm tắt desktop bên phải, above the fold").
- 768 có chủ đích: 5 cột như desktop (đủ 728) nhưng panel xuống dưới full width để Total và Checkout không bị ép 240px; chevron 52 hiện ở upsell.
- Thứ tự đọc giữ nguyên giữa các mốc (06 §2).

## 3. Thành phần chi tiết

### 3.1 Dòng hàng
- Ảnh: vuông, nền `--color-background-cream`, `object-fit: contain` + `mix-blend-mode: darken`, bo `--radius-card` (như media card 1:502). ĐỀ XUẤT thay `--radius-input` + nền tối hiện tại trong code (06 §1 nhất quán).
- Không ảnh: icon ảnh `--color-muted-light` trên cream (foundation §9). Code đang tô `--color-background-dark`: ĐỀ XUẤT đổi.
- Tên: Inter 16/500 lh 26 ls −0.01em như tiêu đề card 1:502, không cắt dòng; hover gạch chân offset 0.2em.
- Option, thuộc tính: 14, nhãn `--color-muted` (8.45), giá trị foreground.
- Giá: mobile 14, ≥ 48rem 16/500. Có giảm: giá mới `--color-sale` + giá gạch 14 muted (như 1:759 "$379.99 ~~$499.99~~").
  - ĐỀ XUẤT: khi không có discount dòng mà `item.variant.compare_at_price > item.final_price`, gạch `compare_at_price` (Revllen $34.99 ~~$44.99~~). Code chỉ so `original_price` nên giá sale từ compare-at không hiện (12 §1 audit "giá đã giảm dễ nhận biết").
- Discount dòng (AC5): icon tag 14 + "Bundle discount (10%) -$23.80" 14/500 `--color-badge-new` (4.57). Màu xanh theo Figma 1:746; có icon + dấu trừ, không chỉ màu (01).
- Thành tiền: 16/600, canh phải; có discount dòng thì thêm giá gốc gạch 14.
- Hết hàng (State 4, `item.variant.available == false`): badge Sold out (foundation §8), ảnh opacity 0.6, câu `--color-sale` + icon "This item sold out after you added it. Remove it before checkout.", bộ số lượng disabled, xoá vẫn bấm. Không khoá Checkout (Shopify checkout tự xử lý). ĐỀ XUẤT, nguồn 12 §1, 05 §6.

### 3.2 Bộ số lượng (ĐỀ XUẤT, câu CTO 1)
- `[−][ô số][+]`, cao 44, viền `--color-muted-light` (sổ 09/11), bo `--radius-input`; nút 44 × 44 icon 14; ô 48 chữ 16/500, ẩn spinner native.
- − disabled (`aria-disabled`, icon muted-light 45%) ở số 1: giảm về 0 bằng nút xoá. + disabled khi đã chạm tồn (422).
- Hover nút: nền alt; hover cả bộ: viền foreground. Focus: outline 2px accent offset −2. Đang cập nhật: số thành spinner 18, hai nút disabled.
- Không JS: chỉ ô số (`name="updates[]"`) + nút "Update"; nút − + render `hidden`, JS bỏ `hidden` khi gắn `data-enhanced`.
- Figma không có stepper (1:759 chỉ có Add To Cart). Nguồn 12 #2151D, 05 §1 vùng chạm ≥ 44. Trái mặc định ES1-T93 #3 (ô số native) nên cần CTO chốt.

### 3.3 Nút xoá
- Icon thùng rác 20 trong vùng 44 × 44 tròn, `--color-muted`; hover nền alt + icon `--color-sale`; focus outline accent. `<a href="{{ item.url_to_remove }}">` (chạy không JS), `aria-label` "Remove {title}". ĐỀ XUẤT thay link chữ "Remove" (12 §1 audit).

### 3.4 Freeship (AC3)
- Hộp cream bo 16, padding 16 (24 từ 48rem), gap 12. Trên: `<progress>` cao 4 bo 2, nền `--color-border`, phần đầy `--color-accent` (Figma 1:749: thanh 4, bo 2, cam). Dưới: icon khoá 12 × 16 + câu 14/500 lh 22 `--color-muted`, số tiền 700 foreground (Figma 1:751 "Add 1 more item to unlock 15% off", cùng giọng: "Spend $38.01 more to unlock free shipping").
- Đạt ngưỡng (State 6): thanh đầy, icon check `--color-badge-new` + "**Free shipping unlocked.** Your order qualifies." Đổi icon + chữ, không chỉ màu.
- Vị trí đầu danh sách giữ theo ES1-T93 (mobile thấy trước dòng hàng). Không đặt trong panel để tránh lặp.
- Ẩn khi `free_shipping_threshold` = 0 (mặc định), giỏ rỗng, hoặc tiền tệ khác shop (code). Store dev ngưỡng 0; mockup dùng 500 minh hoạ.
- Locale: đổi `cart.free_shipping_remaining` thành "Spend {{ amount }} more to unlock free shipping" và `free_shipping_reached` như trên (ĐỀ XUẤT, giọng Figma 1:753).

### 3.5 Ghi chú đơn (AC5)
- Field foundation §12: label "Order note" 14/600 · textarea cao 120 · viền `--color-muted-light` · gợi ý 14 muted "Optional. Delivery instructions or a gift message." nối `aria-describedby`. Luôn mở (AC5).
- Lưu khi submit form (code). Ẩn khi giỏ rỗng (code).

### 3.6 Panel tóm tắt (Figma 1:718)
- Nền `--color-background-panel` (#393942 = Figma 1:718), chữ `--color-background-dark-foreground` (11.4), bo 16, padding 24 / 32 / 40, gap 24.
- Đầu panel (1:719): h2 "Order Summary" Inter 700 18/28 ls −0.01em (không dùng Sofia: theo Figma "Your Bundle") + badge `.badge--tag` "4 Items" (pill 28, 13/600, accent, 5.01; Figma 1:721). Gạch dưới 1px `--color-muted` (Figma Line 68 #4D4D4D), cách 24.
- Dòng (1:740): Inter 500 16/26 ls −0.01em, cách 24. Subtotal trắng · discount cấp đơn: icon tag 16 + tên, số `-$46.20`, màu `--panel-saving` · Shipping: nhãn trắng, giá trị "Calculated at checkout" 14 `--panel-muted`. ĐỀ XUẤT dòng Shipping: 12 §1 Must "chi phí vận chuyển trước thanh toán".
- Total (1:755): gạch trên 1px muted, padding trên 24; nhãn 500 16, số 700 18 (Figma). Không phóng to hơn Figma.
- Ghi chú thuế 14/22 `--panel-muted`: thuế đã gồm (AC4, code) hoặc ĐỀ XUẤT mặc định "Taxes and shipping calculated at checkout.".
- Checkout (1:758): primary full width, chữ `cart.checkout` + mũi tên 16 × 14 sau chữ, cao `--control-height`. Bo `--radius-button` (4) theo kit; Figma 8 (P4, giữ token foundation).
- Dưới nút: icon khiên 18 + "Secure checkout" 14 `--panel-muted` và icon thanh toán (`shop.enabled_payment_types`, `payment_type_svg_tag`, nền trắng). ĐỀ XUẤT, 12 §1 Must.
- Focus trong panel: outline trắng 2px (accent trên panel chỉ 2.28:1, giống quy tắc header/footer tối).
- Không liệt kê lại sản phẩm trong panel (khác 1:723): dòng hàng đã ở cột trái, lặp làm dài trang mobile.
- Nút accelerated có thương hiệu giữ nguyên màu Shopify (Shop Pay tím, G Pay đen…), chỉ chỉnh chiều cao/bo qua biến CSS (foundation §27); icon thanh toán full color.
- Accelerated: "or pay with" giữa 2 gạch (nền trắng, ngoài panel), nút Shopify vẽ; khối chừa `min-height` = control + 32 để không xô layout khi script gắn nút.

Màu dẫn xuất trên panel (không phải token mới, `color-mix` trên token như menu header 60% của foundation §2):
- `--panel-muted` = `color-mix(in srgb, var(--color-background-dark-foreground) 70%, var(--color-background-panel))` ≈ #C4C4C6, 6.56:1.
- `--panel-saving` = `color-mix(in srgb, var(--color-badge-new) 50%, var(--color-background-dark-foreground))` ≈ #A5C1A6, 5.81:1.

### 3.7 Thanh checkout dính đáy mobile (ĐỀ XUẤT, State 6)
- < 64rem, khi panel tóm tắt ra khỏi màn hình: thanh nền panel dính đáy, bóng trên, padding 12 / lề trang + `env(safe-area-inset-bottom)`; trái "Total" 14 `--panel-muted` + số 18/700 trắng, phải nút Checkout → (flex 1, cao 48).
- Ẩn khi panel đã thấy (IntersectionObserver, ticket BE) và khi giỏ rỗng; không JS không hiện. `position: fixed` (0 CLS), `<main>` thêm `padding-block-end` bằng chiều cao thanh.
- Nguồn: 12 §1 Must "giữ nút thanh toán luôn hiển thị", 05 §1 thumb zone.

### 3.8 Upsell (ĐỀ XUẤT, phụ thuộc ES1-T247)
- Dữ liệu: Shopify product recommendations, intent complementary, gốc là dòng đầu; 0 kết quả hoặc lỗi thì ẩn cả khối; giỏ rỗng không có upsell.
- Header khối như 1:395/1:490: eyebrow cam 16/800 uppercase, h2, chevron 52 bên phải căn đáy, cách 8 (foundation §11).
- Card foundation §9 (Figma 1:502) + `button--secondary` cao 44 full width: icon túi 20 + "Add To Cart" (sổ 07/11, icon theo 1:759), `aria-label` "Add {title} to cart". Sản phẩm nhiều variant: "Choose Options" dẫn PDP. Nút trên lớp link card (`z-index: 1`).
- Dưới khu giỏ, cách `--section-gap`; tối đa 4 (12 #600, #2139D).
- 360: vuốt, 2 card + mép card 3, thanh tiến trình, ẩn chevron; 768: 3.25 card + chevron 52; ≥ 1280: lưới 4, ẩn chevron và thanh (sổ 09/11).
- Thêm thành công: partial `cart-page` + `cart-count` refresh, dòng mới xuất hiện, toast success (foundation §17); sản phẩm vừa thêm rời upsell.
- Đang tải: skeleton 4 card (foundation §18).

### 3.9 Giỏ rỗng (AC4, State 1)
- h1 "Cart" giữ. Khối rỗng foundation §18: icon túi 32 trong tròn 72 nền alt · h2 "Your Cart Is Empty" · 1 câu gợi ý · primary "Continue Shopping →" + text link "Browse collections" (`routes.collections_url`).
- ĐỀ XUẤT dưới khối: eyebrow "Popular right now" + h2 "Bestsellers" + lưới 4 card từ setting collection (ẩn khi trống). Nguồn 12 §1 Must "động lực mua hàng cho giỏ trống"; header khối như 1:490.
- Không freeship, panel, ghi chú, accelerated (code đã ẩn). Câu thuế không hiện khi rỗng (không có tổng), ghi chú cho QA.

## 4. Trạng thái

| Trạng thái | Hiển thị | Nguồn |
| --- | --- | --- |
| Đang cập nhật (State 2) | `cart-items[aria-busy]`; ô số dòng đang đổi thành spinner, − + disabled; số tiền giữ nguyên tới khi partial về (không làm mờ); panel: dòng "Updating cart…" (spinner 18 + chữ 14, role status) thay chỗ ghi chú thuế, cùng chiều cao; Checkout `aria-disabled` | AC2, foundation §18 |
| Lỗi 422 (State 3) | `.alert` đầu danh sách: câu API đậm + `cart.quantity_adjusted`; ô số về giá trị server; focus giữ ở ô | AC2 |
| Lỗi mạng (State 3) | `.alert` `cart.error` + secondary "Reload Cart" (`routes.cart_url`) | ĐỀ XUẤT, 05 §4 |
| Hết hàng (State 4) | §3.1 | 12 §1, 05 §6 |
| Biến thể dòng (State 5) | gift card, không ảnh, sale nhỏ, 2 option, discount dòng | edge_cases demo-data |
| Discount, thuế gồm, đạt freeship (State 6) | §3.6, §3.4 | AC3, AC4, AC5 |
| Không JS (State 7) | ô số + Update, xoá là link, Checkout là submit `name="checkout"` | AC5 |
| Rỗng (State 1) | §3.9 | AC4 |
| Hover / focus / disabled / loading (State 7) | stepper, xoá, link tên, link quay lại, chevron 52, Checkout trên panel (hover tối 12% + nhấc 1px; focus outline trắng; loading spinner trắng; disabled nền border chữ muted 6.70) | foundation §6, 05 §3 |

Code hiện có `.cart-items__error` (viền trái 2px sale): ĐỀ XUẤT đổi sang `.alert` foundation §18.

## 5. Settings merchant

Có sẵn (không đổi): `cart_type` Cart type (drawer/page, default drawer); `free_shipping_threshold` Free shipping threshold (number, default 0 = ẩn). Màu panel dùng `--color-background-panel` có sẵn trong `css-variables`.

ĐỀ XUẤT thêm vào schema `cart-page` (label sentence case, `t:` trong `en.default.schema.json`):

| Tên | Kiểu | Default | Giới hạn / ghi chú | Nguồn |
| --- | --- | --- | --- | --- |
| Show recommendations | checkbox | true | chỉ khi ES1-T247 duyệt | 12 #578D |
| Recommendations eyebrow | text | Complete your setup | trống thì ẩn | foundation §1 |
| Recommendations heading | text | You May Also Need | | |
| Products to show | range | 4 | 2–4, bước 1 | 12 #578D |
| Show recommendations on mobile | checkbox | true | | 12 #578D audit |
| Empty cart collection | collection | trống | trống thì không có lưới Bestsellers | 12 §1 Must |
| Show sticky checkout bar on mobile | checkbox | true | | 12 §1 Must |

Không thêm setting ẩn ghi chú (AC5 bắt buộc).

Locale mới (ĐỀ XUẤT, nhóm `cart`): `item_count` (one/other "{{ count }} Item(s)" cho badge, "{{ count }} item(s)" cho đầu trang), `summary_title` "Order Summary", `shipping` "Shipping", `shipping_at_checkout` "Calculated at checkout", `taxes_and_shipping_at_checkout`, `updating` "Updating cart…", `note_hint`, `decrease_label` / `increase_label` "Decrease/Increase quantity for {{ title }}", `secure_checkout` "Secure checkout", `express_divider` "or pay with", `line_sold_out`, `empty_hint`, `empty_eyebrow` "Popular right now", `browse_collections`, `reload` "Reload Cart", `add_label` "Add {{ title }} to cart". `continue_shopping` dùng cả link đầu trang (sentence case) và nút rỗng (Title Case): Dev FE tách 2 key, ghi trong PR.

## 6. Accessibility

Tương phản (WCAG, L tính tay; bảng gốc foundation §2):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| foreground / background | 17.4 | tên, thành tiền, số lượng |
| muted / background | 8.45 | nhãn option, gợi ý, nút xoá |
| muted (L 0.0742) / cream (L 0.913) | 7.75 | câu freeship |
| sale / background | 6.38 | giá sale, câu hết hàng |
| badge-new (#4B824D, L 0.180) / background | 4.57 | discount dòng 14/500 |
| dark-foreground / panel (#393942, L 0.0419) | 11.4 | chữ panel, Total |
| `--panel-muted` (~#C4C4C6, L 0.553) / panel | 6.56 | Shipping, ghi chú thuế, Secure checkout, "Updating cart…", nhãn Total thanh đáy |
| `--panel-saving` (~#A5C1A6, L 0.484) / panel | 5.81 | discount trong panel |
| (Figma #999 / panel) | 4.01 | không dùng, trượt AA chữ 14 |
| (Figma #4B824D / panel) | 2.50 | không dùng |
| accent-foreground / accent | 5.01 | Checkout, badge "4 Items" |
| dark-foreground / panel (outline focus) | 11.4 | focus trong panel; accent / panel 2.28 không dùng |
| accent (L 0.160) / `--color-border` (L 0.784) | 3.97 | phần đầy thanh freeship (đồ hoạ ≥ 3:1) |
| muted-light / background | 5.33 | viền bộ số lượng, textarea |
| muted / border | 6.70 | Checkout disabled |

- Vùng chạm: stepper 44 mỗi nút, xoá 44, link quay lại cao 44, Checkout 48/52, nút upsell 44, chevron 52.
- Bàn phím: tên → − → ô → + → xoá theo dòng; sau xoá focus về tên dòng kế hoặc h1 khi rỗng.
- Tên: −/+/xoá/Add chứa tên sản phẩm (không trùng giữa các dòng). Ô số có `<label>` ẩn.
- Hàng tiêu đề cột `aria-hidden`; thành tiền có chữ ẩn "Line total"; giá có "Sale price"/"Regular price". Badge "4 Items" là chữ thường trong panel (không cần `aria-hidden`).
- Live region: status đọc kết quả đổi số/xoá; alert đọc lỗi; `aria-busy` trên vùng đổi.
- Heading: h1 Cart → h2 Order Summary → h2 You May Also Need → h3 tên card; rỗng: h1 → h2 Your Cart Is Empty → h2 Bestsellers.
- Không chỉ dùng màu: hết hàng có badge + câu + icon; discount có icon tag + dấu trừ; freeship đạt đổi icon + chữ.
- Reduced motion: spinner đứng yên (kit), tắt nhấc card.

## 7. Token dùng

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-background-cream(-foreground)`, `--color-background-dark(-foreground)`, `--color-background-panel`, `--color-muted-on-dark` (footer), `--color-accent(-foreground)`, `--color-sale`, `--color-badge-new`. Chữ: `--font-heading--family/weight`, `--font-primary--family`, `--font-size-xs/sm/base/lg/h3/h2/h1/wordmark`. Khoảng: `--space-1..8`, `--page-margin`, `--header-height`. Bo: `--radius-input`, `--radius-button`, `--radius-card`, `--radius-pill`. Motion: `--motion-fast/base`, `--ease-out`. Dẫn xuất: `--section-gap`, `--grid-gap`, `--control-height`, `--dark-texture`, `--panel-muted`, `--panel-saving` (color-mix trên token). Không token mới, không hex.

## 8. Lighthouse

- SEO: /cart không tính SEO (sổ 10/11). Vẫn giữ `<title>` "Cart – {shop}", meta description, link có href thật, ảnh có alt, chữ ≥ 12 (nhỏ nhất 13 ở badge, hàng tiêu đề cột).
- LCP: không có ảnh lớn. Có hàng: LCP dự kiến là h1 hoặc khối chữ panel (desktop) / dòng đầu (mobile). Ảnh dòng 1 `loading="eager"` 120 × 120, không `fetchpriority` (không phải ảnh lớn); dòng 2 trở đi `lazy`. Rỗng: LCP là khối rỗng (chữ). Mọi `<img>` có width/height, srcset 96/120/192/240 (`cart-lines` đã có).
- Lazy: ảnh dòng ≥ 2, ảnh upsell, lưới Bestsellers, ảnh newsletter footer. Upsell nạp sau tải trang, giữ chỗ bằng skeleton (0 CLS).
- Font: Sofia Sans Condensed 700/800 (h1, h2 upsell, eyebrow, wordmark), Inter 400/500/600/700 (còn lại, gồm tiêu đề panel); 2 họ qua `font_picker`, `swap`.
- CLS: accelerated chừa `min-height`; live region lỗi rỗng không chiếm chỗ; thanh dính đáy `fixed`; "Updating cart…" thay chỗ ghi chú thuế cùng chiều cao; header sticky CSS, noise là `background-image` nhỏ đã có.
- A11y rủi ro và cách tránh: chữ #999/xanh Figma trên panel trượt AA → màu dẫn xuất 6.56 / 5.81; focus accent trên panel không thấy → outline trắng; làm mờ số khi cập nhật bị tính contrast → không làm mờ; nút icon không tên → `aria-label` có tên sản phẩm; heading nhảy bậc → h2 Order Summary.
- Best Practices: ảnh `contain` không méo; 0 lỗi console (mockup 0 lỗi ở 4 mốc).
- JS: stepper, upsell add, thanh dính đáy thuộc BE (`assets/cart-items.js` hoặc file mới ≤ 8 KB).

## 9. Map sang code

| Phần | Code hiện có | Việc Dev FE (markup/CSS) | Việc BE (JS) |
| --- | --- | --- | --- |
| Header | `.site-header`, base.css nền tối chỉ khi có `.slideshow` | theo ticket header foundation (bỏ điều kiện) | — |
| Đầu trang | h1 `cart-page__heading` | số món, link quay lại có mũi tên 16 × 14 | — |
| Freeship | `cart-free-shipping` | hộp cream bo 16, thanh 4 bo 2 trên, icon khoá + câu 14 dưới; locale mới | — |
| Dòng hàng | `cart-lines`, `.cart-line*` | lưới 5 cột ≥ 48rem, ảnh cream bo card, compare-at, hàng tiêu đề cột, câu hết hàng, xoá icon 44, discount xanh, viền ô số `--color-muted-light` (code `--color-border`, trái sổ 09/11), focus accent | — |
| Bộ số lượng | ô number | nút −/+ `hidden` + `data-testid` `cart-line-decrease/increase` | gắn −/+, disabled ở 1, khi 422 |
| Ghi chú | `cart-page__note` | gợi ý + `aria-describedby`, viền muted-light | — |
| Tóm tắt | `cart-summary` | panel `--color-background-panel` + đầu panel (h2 Inter 18 + badge số món), Shipping, câu thuế mặc định, Checkout + mũi tên, payment icons, màu dẫn xuất, focus trắng | dòng "Updating cart…", `aria-disabled` Checkout khi busy |
| Accelerated | `cart-page__accelerated` | "or pay with", `min-height` | — |
| Thanh dính đáy | — | markup `hidden` + `data-testid="cart-sticky-checkout"`, nền panel | IntersectionObserver |
| Lỗi | `.cart-items__error` | kiểu `.alert` | điền câu API (có) |
| Rỗng | `.cart-empty` | icon, h2, gợi ý, link phụ, eyebrow + lưới collection | — |
| Upsell | — | block/snippet mới sau ES1-T247; chevron `snippets/slideshow-icon`, `.carousel-nav__button` | fetch recommendations, add |

Chuyển động: số tiền không animate; dòng bị xoá mờ dần 200ms rồi partial thay (chỉ opacity); thanh freeship đổi `value` không animate width (không phải transform); toast 250 / 150 (foundation §19).

## 10. Quyết định CTO đã chốt (10/11)

CTO chốt cả các câu dưới đây theo đề xuất (docs/design/decisions.md, 10/11).
1. Đổi ô số native (mặc định ES1-T93 #3) sang bộ − ô + 44px cho cart page và drawer? Đề xuất: có (12 #2151D; không đổi luồng, vẫn `updates[]`, cần 1 ticket BE nhỏ).
2. Upsell trong cart page (ES1-T247 chưa trả lời): làm theo §3.8, intent complementary, tối đa 4, dưới khu giỏ, cùng đợt BE với thanh dính đáy §3.7? Đề xuất: có.
3. Tóm tắt dùng panel tối như "Your Bundle" 1:718, chữ phụ trắng 70% (6.56) và xanh giảm giá nhạt (5.81) thay #999 (4.01) và #4B824D (2.50) của Figma để đạt AA? Đề xuất: có, áp cả cho bundle builder trang chủ và mini cart ES1-T262.
