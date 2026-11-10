KHÔNG CHẮC: (1) quickview chưa có story/AC trong SRS, ghi chú đơn trong drawer vượt TE-5 AC1 → hỏi BA ES1-T272; upsell drawer chờ CTO ES1-T247. (2) Ảnh store dev lệch tên (ES1-T245): efx-prod-P03 (FlexFold Adjustable Bench) là dây thừng, efx-prod-P14 (Training mat) là dây nhảy; mockup giữ URL, alt trung tính. (3) Ngưỡng freeship $500 là minh hoạ (setting `free_shipping_threshold` mặc định 0, như ES1-T255). (4) demo-data không có description, rating, tồn kho theo variant: quickview không có mô tả, tồn kho mockup tự đặt (White = quá tồn ở 5d). (5) Spec cart page ES1-T255 nằm trên nhánh khác, không đọc được; chỉ bám comment ticket.

# UI spec: Mini cart (cart drawer) và quick view (ES1-T262)

Mục đích: người mua thêm hàng mà không rời trang. Mini cart: thấy ngay hàng vừa thêm, sửa số lượng, xoá, ghi chú, biết còn bao nhiêu tới freeship, thấy tổng và đi checkout. Quick view: chọn biến thể và thêm giỏ từ card sản phẩm, có đường sang trang sản phẩm.

Story: TE-5 AC1–AC4, AC6, AC7 (drawer); TE-4 AC8 (thêm giỏ → drawer); quickview chưa có AC (ES1-T272). Code hiện có: `blocks/cart-drawer.liquid`, `snippets/cart-lines|cart-summary|cart-free-shipping.liquid`, `snippets/product-card.liquid`, `snippets/product-variant-picker.liquid`, `blocks/product-form.liquid`.

Figma: không có frame cart hay quickview (figma-inventory: không trạng thái nào). Ngôn ngữ lấy từ Figma 1:759 (featured product: giá sale đỏ + giá gạch + badge %, nút "Add To Cart" có icon túi, link "View Detail" mũi tên), 1:502 (card), foundation ES1-T251 §6, §12, §15–§19. Mọi thứ còn lại là ĐỀ XUẤT có nguồn.

Đầu ra: spec này; `drafts/designer/ES1-T262/mini-cart-quickview.html`; `mini-cart-quickview-360|768|1280|1920.png`. Khung 1, 2 trong mockup cao bằng một màn hình thật của mốc (760 / 1024 / 820 / 1000); khung 3–5 là trạng thái.

---

## 1. Mini cart: anatomy

Drawer phải (foundation §15), `<dialog>` + `showModal()` như code.

1. Header 72 (`.overlay__header`): h2 "Cart" (heading 22–28) · pill số lượng "3 items" (13/600, nền alt) · link "View cart" (14, gạch chân, cao 44) · nút đóng tròn 48 (`.close-button`).
2. Body cuộn riêng (`overscroll-behavior: contain`), padding 16 (24 từ 48rem):
   1. Thông báo "Added to cart" (chỉ sau khi thêm giỏ; `role="status"`): viền trái 4px `--color-badge-new`, icon check, tên + biến thể.
   2. Thanh freeship (`cart-free-shipping`): icon xe 20 · câu `cart.free_shipping_remaining` (số tiền đậm) · thanh 6px bo pill, nền alt, phần đầy accent. Đạt ngưỡng: câu `cart.free_shipping_reached`, thanh + icon `--color-badge-new`.
   3. Danh sách dòng hàng `<ul>`.
   4. Ghi chú đơn `<details>` đóng sẵn: "Add order note" + icon bút; mở ra label "Order note" + textarea 96 + gợi ý.
   5. Gợi ý "Pairs Well With" (chờ ES1-T247): 2 hàng.
3. Footer dính đáy (viền trên + bóng nhẹ lên): Total (18/600) · ghi chú thuế/ship (14 muted) · nút Checkout full width có icon khoá · nút accelerated checkout (Shopify render, TE-5 AC1 bật mặc định).

Dòng hàng (`.cd-line`):
- Ảnh 72 (< 48rem) / 96, nền cream, bo 8, `contain` + `mix-blend-mode: darken` như card; link ẩn khỏi tab (`tabindex="-1" aria-hidden`), chỉ tiêu đề là link.
- Hàng trên: tiêu đề 16/500, tối đa 2 dòng, link PDP (12 §1: tên là link) · nút thùng rác 44 (12 §1 audit: remove lên đầu, icon thùng rác).
- Option "Color: Black" 14 muted (giá trị foreground); properties, selling plan như code.
- Giá đơn vị: sale `--color-sale` + compare-at gạch 14 muted; discount dòng (code có) 14 sale.
- Hàng dưới: stepper − [n] + (44 cao, mỗi ô 44) · tổng dòng 16/600 căn phải.

Theo mốc:

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Rộng drawer | 90% (324) | 420 | 480 | 480 |
| Ảnh dòng | 72 | 96 | 96 | 96 |
| Padding body / footer | 16 / 16 | 24 / 24 | 24 / 24 | 24 / 24 |
| Thấy được không cuộn (màn 760 / 1024 / 820 / 1000) | thông báo, freeship, 1,5 dòng | 2 dòng, ghi chú, 1 gợi ý | 2 dòng | 2 dòng, ghi chú, gợi ý |

360: 324 − 32 = 292; cột phải 292 − 72 − 12 = 208 = stepper 132 + 8 + tổng "$379.99" ~62 (vừa 1 hàng; bản 80px ở nháp đầu bị rớt dòng). Thứ tự nội dung giống nhau ở mọi mốc (06 §2).

ĐỀ XUẤT:
- Drawer phải 90% trên mobile thay vì bottom sheet: foundation §15 đã chọn; 15 §2 #2 cho cả 2 option. Chạm scrim 10% bên trái để đóng. Xem câu CTO 2.
- "View cart" lên header thay vì dưới nút Checkout: 12 §1 #62.3% (luôn có đường tới giỏ) và 12 §8; để ở footer làm footer 360 cao ~300 (body chỉ còn 1 dòng hàng, đã thử ở nháp).
- Icon khoá trên Checkout: 12 §1 Must "hiển thị thanh toán được bảo mật".
- Câu "Taxes and shipping calculated at checkout." luôn hiện (12 §1 #732D, #544D); khi `cart.taxes_included` thì thay bằng câu có sẵn trong code.
- Bỏ dòng Subtotal khi không có discount cấp giỏ (chỉ còn Total); có discount: Subtotal → từng discount (sale, "-$x") → Total. Code đang luôn in cả Subtotal và Total.
- Không hiện payment icons trong drawer (đã có ở footer, 12 §1 "đạt"); giữ chỗ cho dòng hàng.

## 2. Mini cart: hành vi

- Mở: sau thêm giỏ thành công (TE-4 AC8, TE-5 AC1, AC7 openCart), hoặc bấm icon giỏ. Mở 250ms trượt từ phải, scrim fade; đóng 200ms (foundation §19). Không mở khi tải trang.
- Thông báo "Added to cart" hiện trên cùng body, không tự tắt (04 §6, không tắt sau ~2s), mất khi đóng drawer hoặc khi có thao tác khác trong giỏ. Icon giỏ header nhảy số (`[data-bump]` có sẵn).
- Không tự đóng drawer (12 §1 #601: không đóng mini cart quá sớm).
- Đổi số lượng: bấm −/+ hoặc gõ số rồi rời ô; gửi sau 300ms không bấm thêm (gộp nhiều lần bấm). − bị disable khi số lượng 1 (xoá bằng thùng rác; gõ 0 vẫn xoá như code `min="0"`). + bị disable khi API báo đã chạm tồn (sau 422).
- Xoá: dòng thu gọn 200ms (opacity + transform), status "Item removed from cart." (`cart.removed`), focus về dòng kế tiếp hoặc tiêu đề drawer nếu giỏ rỗng.
- Gợi ý: bấm "Add" → nút loading, thêm 1, refresh partial `cart-drawer` + `cart-count`; sản phẩm đã có trong giỏ thì không gợi ý lại (12 §1 #600 audit). Sản phẩm nhiều biến thể: nút "Choose" mở quickview (một lớp popup: drawer đóng trước, quickview thêm xong mở lại drawer).
- Ghi chú: lưu khi rời ô (BE, `/cart/update.js` note); không mất chữ khi refresh partial (ô nằm ngoài partial như cart page).
- Không JS: dialog đóng, icon giỏ là link `/cart` (code có).

## 3. Quick view: anatomy

Dialog cỡ M (foundation §16), `<dialog>` + `showModal()`, `aria-labelledby` tiêu đề.

1. Nút đóng tròn 48, góc phải trên cách 24 (12 mobile).
2. Đầu: eyebrow vendor (accent, 16/800 uppercase như Figma 1:759 "FEATURED PRODUCT · FREE WEIGHTS") · h2 tên sản phẩm (heading 800, `--font-size-h2`), chừa 56 bên phải cho nút đóng.
3. Media: ảnh chính 1:1 nền cream bo 12 `contain` + badge -N% góc trái trên · thumbnail 64 (72 từ 80rem) bo 8, đang chọn viền 2px foreground, tối đa 5. Mobile: dải ảnh vuốt (mỗi ảnh 78% bề ngang, lộ ảnh sau, 15 §5) + thanh tiến trình mảnh (sổ quyết định 09/11), không thumbnail.
4. Giá: sale 18/600 đỏ + compare-at 16 gạch muted; badge -N% ở ảnh (không lặp ở giá). Không giá sale: giá foreground. `price_varies`: giá theo biến thể đang chọn.
5. Rating (chỉ khi có metafield `reviews.rating`, như card AC-H13): sao 14 + "(4.9)" + gạch đứng + "341 reviews" 14 muted (Figma 1:759).
6. Mô tả (chỉ khi có): 3 dòng cắt "…", muted (Figma 1:759 có đoạn mô tả; demo-data không có).
7. Option: mỗi option một `<fieldset>` + legend "Color: Black" (giá trị đang chọn ghi trong legend). Màu có `swatch` → tròn 44; còn lại pill 44 (code `.product-option__value`). Không bán được: gạch ngang chữ / gạch chéo swatch, vẫn chọn được (code).
8. Tình trạng: chấm 8 + "In stock" / "Sold out" / "Unavailable" 14.
9. Hàng mua: stepper (44; 52 từ 80rem cho bằng nút) + "Add To Cart" primary có icon túi (Figma 1:759, sổ quyết định 07/11).
10. Link "View Full Details →" (Figma 1:759 "View Detail"), tên ẩn "of {product}".

Theo mốc:

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Kiểu | bottom sheet, cao tối đa 88% | dialog giữa | dialog giữa | dialog giữa |
| Rộng | 100% | 720 | 960 | 960 |
| Bố cục | 1 cột: tên → ảnh vuốt → giá → option → tồn → link → thanh mua dính đáy | 2 cột 1:1, gap 24; ảnh 316 | 2 cột, gap 48; ảnh 408 | như 1280 |
| Padding | 32 / 16 / 20 | 32 | 48 | 48 |

ĐỀ XUẤT:
- 960 từ 80rem thay 720 của foundation §16 (M): ở 720 ảnh chỉ 316 trên màn 1280+, nhỏ hơn card 336 trong lưới phía sau; 960 cho ảnh 408, vẫn nhỏ hơn L 1120 và không cần cuộn với 1 option (cao ~590 < 820).
- Mobile: tên lên đầu sheet (chung hàng nút đóng, vùng vuốt xuống gồm cả header, 15 §2), thanh "stepper + Add To Cart" dính đáy sheet (vùng ngón cái, 05 §1.5), link chi tiết đứng trước thanh mua.
- Không có nút dynamic checkout (Buy it now) trong quickview: 1 CTA chính mỗi lớp (04 §1); thanh toán nhanh có ở drawer ngay sau khi thêm.
- Gift card: quickview chỉ chọn mệnh giá; form người nhận (TE-4 AC6) chỉ ở PDP, có câu "Add a recipient on the product page." + link.

## 4. Quick view: nút mở trên card

Figma 1:502 không có (figma-inventory hàng 5 liệt "quick add" là thiếu). ĐỀ XUẤT, nguồn 08 #529D (quick view), 06 §1 (cùng cách mở/đóng), sổ quyết định 06/11 (trang chủ giống Figma 100%).

- ≥ 64rem và `(hover: hover)`: lúc nghỉ không thấy gì (card y Figma). Rê chuột card hoặc focus vào nút: nút "Quick View" trượt lên ở đáy ảnh, cách mép 16, cao 44, nền trắng viền border, chữ 14/600 + icon túi có dấu +; hover nút đảo nền foreground chữ trắng. 250ms opacity + translate 8.
- < 64rem hoặc màn chạm: nút tròn 44 icon túi + ở góc phải dưới ảnh, cách 8, luôn hiện (không có hover trên điện thoại).
- Tên: chữ "Quick View" + tên sản phẩm ẩn ("Quick View FlexFold Adjustable Bench"); mobile chỉ icon nên toàn bộ tên ẩn. Tên chứa chữ hiển thị (WCAG 2.5.3).
- Nút nằm trên lớp link phủ card (`z-index` trên `::after`); bấm nút không mở PDP.
- Một hành vi cho mọi sản phẩm, kể cả 1 biến thể (06 §1, 15 §7: chức năng giống nhau cùng cách mở). Xem câu CTO 1.
- Sản phẩm hết hàng toàn bộ: vẫn hiện nút (quickview báo Sold out, có link PDP).
- Không JS: ẩn nút (`quick-view-button:not(:defined)`), card vẫn là link PDP.

## 5. Settings merchant

| Tên (sentence case) | Kiểu | Default | Giới hạn / ghi chú | Trạng thái |
| --- | --- | --- | --- | --- |
| Cart type | select: Drawer, Page | Drawer | có sẵn (`cart_type`) | có |
| Free shipping threshold | number | 0 | 0 = ẩn thanh (code) | có |
| Show order note | checkbox | true | drawer + cart page cùng `cart.note` | ĐỀ XUẤT (ES1-T272) |
| Show product recommendations | checkbox | true | 2 sản phẩm, complementary của dòng đầu | ĐỀ XUẤT (chờ ES1-T247) |
| Recommendations heading | text | Pairs Well With | ≤ 30 ký tự | ĐỀ XUẤT |
| Empty cart products | collection | trống | trống → chỉ empty state, không hàng gợi ý | ĐỀ XUẤT (12 §1 Must giỏ trống) |
| Show quick view button | checkbox | true | nhóm Product cards | ĐỀ XUẤT (ES1-T272) |
| Show vendor in quick view | checkbox | true | eyebrow | ĐỀ XUẤT |

Label qua `t:` trong `locales/en.default.schema.json`, không ký tự `&`. Không thêm setting màu: drawer, dialog dùng scheme mặc định.

## 6. Trạng thái

Mockup khung 4 (mini cart), 5 (quick view). Không có trong Figma: tất cả là ĐỀ XUẤT theo foundation §18 + nguồn ghi bên cạnh.

Mini cart:

| Trạng thái | Thiết kế | Nguồn |
| --- | --- | --- |
| Thêm thành công | khung 1: drawer mở, thông báo "Added to cart" + tên · biến thể, số giỏ nhảy | 12 §1, §8; 05 §6 |
| Giỏ rỗng (4a) | empty state: icon túi trong tròn 72 · h "Your Cart Is Empty" · 1 câu · "Shop Bestsellers"; dưới là 2 hàng "Bestsellers" từ setting Empty cart products; không footer, không freeship | foundation §18; 12 §1 Must; TE-5 AC4 |
| Đang cập nhật (4b) | stepper của dòng đang đổi hiện spinner thay số, nút −/+ và thùng rác của dòng disable; tổng dòng + Total thành spinner 16; Checkout `aria-disabled` (không checkout với tổng cũ); `aria-busy` trên body; "Updating cart…" trong `role="status"` (ẩn). Không làm mờ chữ (opacity làm hỏng tương phản) | TE-5 AC2; 05 §5 |
| Lỗi 422 hết hàng (4c) | alert đầu body "1 item is sold out / Remove it to check out." `role="alert"`; dòng: ảnh mờ 0.6, badge Sold out thay stepper, câu lỗi 14/500 sale + icon dưới dòng | TE-5 AC2; 12 §1 (hết hàng khi để lâu) |
| Số lượng bị chỉnh (4c) | số về giá trị server, + disable, câu `cart.quantity_adjusted` + icon cảnh báo accent (chữ foreground) dưới dòng | TE-5 AC2; sổ quyết định 09/11 (cảnh báo dùng accent) |
| Lỗi mạng / khác (4d) | alert "We couldn't update your cart" + `cart.error` + "Try Again" (secondary); dòng giữ giá trị server; ghi chú không mất | foundation §18 |
| Đạt freeship (4e) | câu reached, thanh 100% xanh badge-new | TE-5 AC3 |
| Ghi chú mở (4e) | label thật, textarea 96, gợi ý "Saved with your order. N characters left." | 04 §5; TE-5 AC5 |
| Gợi ý đang tải (4f) | 2 hàng skeleton đúng kích thước (64 ảnh, 2 dòng, nút 44); 0 kết quả hoặc lỗi → ẩn cả khối | foundation §18; ES1-T247 |
| Hover / focus | tiêu đề gạch chân; thùng rác nền alt + chữ foreground; ô stepper nền alt; focus outline 2px accent (stepper: viền accent cả cụm) | foundation §6 |

Quick view:

| Trạng thái | Thiết kế | Nguồn |
| --- | --- | --- |
| Đang tải (5a) | dialog mở ngay khi bấm, skeleton: tên, ảnh vuông, giá, 3 swatch, nút; "Loading product…" status | foundation §18; sổ 09/11 ảnh popup tải khi mở |
| Mặc định | khung 2 | |
| Biến thể hết hàng (5b) | giá + badge Sold out; mọi option gạch; chấm muted "Sold out"; stepper + nút disabled "Sold Out"; link PDP vẫn dùng được | code product-form; 05 §3, §5 |
| Tổ hợp không tồn tại (5c) | option đang chọn gạch; "Unavailable"; nút disabled "Unavailable" | code `data-label-unavailable` |
| Đang thêm (5d) | nút `aria-busy`, spinner, cùng bề rộng; không bấm lại | foundation §6; 05 §5 |
| Lỗi 422 (5d) | câu Shopify trả về dưới hàng mua, sale 14/500 + icon, `role="alert"`; stepper viền sale `aria-invalid` | 05 §4 |
| Thêm thành công | quickview đóng (200ms) → drawer mở với thông báo (khung 1); `cart_type = page` → sang `/cart` | TE-4 AC8, TE-5 AC6; 15 §1 một lớp popup |
| Không tải được (5e) | alert "We couldn't load this product" + "Try Again" + link "View {product}" | foundation §18 |
| Không có ảnh (5f) | placeholder icon ảnh `--color-muted-light` trên cream, không thumbnail | foundation §9 |
| 1 biến thể | không fieldset option (code AC9) | TE-4 AC9 |

## 7. Accessibility

Tương phản (tính tay WCAG, số từ foundation §2; L muted-light 0.147, alt 0.904):

| Cặp | Tỉ lệ | Dùng ở |
| --- | --- | --- |
| foreground / background | 17.4 | tiêu đề, tổng, nút Quick View, icon |
| muted / background | 8.45 | option, ghi chú thuế, giá gạch |
| foreground / alt | 15.8 | pill số lượng, ô stepper hover |
| sale / background | 6.38 | giá sale, câu lỗi |
| accent-foreground / accent | 5.01 | Checkout, Add To Cart |
| muted / border | 6.70 | nút disabled (Checkout khi cập nhật, Sold Out) |
| muted-light / background | 5.33 | viền stepper, −/+ disabled (sổ 09/11 viền ô nhập) |
| muted-light / alt | (0.954 / 0.197) = 4.84 | icon −/+ trong stepper disabled |
| accent / alt (thanh freeship) | 4.55 | phi chữ ≥ 3 |
| badge-new / alt (thanh đạt) | ~4.15 | phi chữ ≥ 3 |
| foreground / background (badge Sold out) | 17.4 | |

- Vùng chạm: nút đóng 48; thùng rác, −, +, ô số, View cart, Quick View, swatch, pill, thumbnail 64–72, Add / Choose 44; Checkout, Add To Cart 48–52. Hai nút cạnh nhau cách ≥ 8 trong cụm, cụm cách 12–16.
- Tên: mọi nút icon có tên riêng kèm tên sản phẩm: "Remove {title}" (`cart.remove_label` có sẵn), "Decrease quantity for {title}", "Increase quantity for {title}", ô số `cart.quantity_label`; "Add" / "Choose" có phần ẩn "{title} to cart" / "options for {title}"; "Quick View" + tên; thumbnail "Show image 2 of 3"; "View Full Details" + "of {title}". Không có 2 link/nút cùng tên khác đích.
- Bàn phím: drawer, dialog dùng `showModal()` (bẫy focus, Escape đóng, nền inert); mở thì focus vào nút đóng (drawer) / tiêu đề (quickview, `tabindex="-1"`); đóng thì trả focus về nút mở. Thumbnail, option là radio/nút đi bằng Tab, ←/→ trong nhóm radio.
- Live region: `cart-items-status` (status) và `cart-items-error` (alert) có sẵn; quickview thêm 1 status + 1 alert.
- Heading: drawer h2 → "Pairs Well With" h3; quickview h2. Không nhảy bậc.
- Màu không đứng một mình: hết hàng có chữ "Sold out", lỗi có icon + câu, đạt freeship có câu.
- Reduced motion: tắt trượt, fade; spinner vẫn quay chậm thì giữ (chỉ báo trạng thái) hoặc thay bằng chữ status.

## 8. Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

- LCP: overlay không bao giờ là LCP (đóng khi tải trang). LCP vẫn là ảnh lớn đầu trang của template đang mở.
- Ảnh lazy: mọi ảnh drawer (dòng hàng 96–192w, gợi ý 64–128w) `loading="lazy"` + width/height; dialog đóng là `display: none` nên không tải tới khi mở. Quickview: không có DOM lúc tải trang; markup + ảnh fetch khi bấm (sổ 09/11 "ảnh trong menu/popup tải khi mở"), ảnh chính `sizes="(min-width: 80rem) 408px, (min-width: 48rem) 316px, 78vw"`, thumbnail 72–144w.
- Font: Inter + Sofia Sans Condensed (2 họ, sổ 30/10); không font mới, không icon font (SVG nội tuyến).
- JS: quickview là module riêng, import khi bấm lần đầu (như `data-items-src` của cart-drawer); không tăng JS lúc tải trang.
- CLS: drawer, dialog `position: fixed`; nút Quick View `position: absolute` trong ảnh card; skeleton đúng kích thước.
- Rủi ro A11y và cách tránh:
  - Nút Quick View ẩn bằng opacity trên desktop: vẫn trong cây a11y, có tên, focus thì hiện; không dùng `visibility: hidden` (Tab bỏ qua) hay `display: none`.
  - `aria-dialog-name`: cả 2 dialog có `aria-labelledby`.
  - Trùng id khi quickview mở trên PDP của cùng sản phẩm (form `product-form-{id}`): quickview dùng tiền tố `qv-` cho mọi id.
  - Chữ mờ khi cập nhật: không dùng opacity cho chữ (color-contrast tính cả opacity).
  - `label` cho ô số và textarea ghi chú: label thật (ẩn với ô số).
  - `target-size`: mọi control ≥ 44.
- SEO: overlay không có link "Read more"/"Click here"; link là `<a href>` thật (tiêu đề dòng hàng, View cart, View Full Details); nút Quick View là `<button>`, không cản crawler đi qua link card. Chữ ≥ 12 (nhỏ nhất 13 ở pill).
- Best Practices: không lỗi console (render 4 mốc 0 lỗi); ảnh `object-fit: contain`, không kéo méo; ô số và textarea không chặn dán.

## 9. Token và chuỗi

Token: chỉ token có sẵn (`--color-*`, `--space-*`, `--radius-*`, `--motion-*`, `--font-*`) + giá trị dẫn xuất foundation §2 (`--overlay-scrim`, `--shadow-overlay`, `--shadow-raised`, `--radius-dialog`, `--control-height`). Không thêm token. Màu swatch lấy từ `value.swatch.color` của Shopify (mockup giả lập bằng token).

Chuỗi mới (đề xuất key, Dev FE thêm vào `locales/en.default.json`): `cart.view_cart` "View cart", `cart.item_count` "{{ count }} item(s)" (one/other), `cart.added` "Added to cart", `cart.shipping_at_checkout` "Taxes and shipping calculated at checkout.", `cart.note_toggle` "Add order note", `cart.note_hint` "Saved with your order.", `cart.line_sold_out` "This item is sold out. Remove it to check out.", `cart.sold_out_summary` "{{ count }} item is sold out", `cart.update_error_title` "We couldn't update your cart", `cart.decrease_label` / `cart.increase_label` "Decrease/Increase quantity for {{ title }}", `cart.empty_heading` "Your Cart Is Empty", `cart.empty_text`, `cart.empty_cta` "Shop Bestsellers", `cart.recommendations_add` "Add", `cart.recommendations_choose` "Choose", `products.quick_view.open` "Quick View", `.close` "Close quick view", `.view_details` "View Full Details", `.image_label` "Show image {{ index }} of {{ count }}", `.loading` "Loading product…", `.load_error_title` "We couldn't load this product", `general.try_again` "Try Again". Giữ có sẵn: `cart.title`, `cart.checkout`, `cart.free_shipping_*`, `cart.quantity_*`, `cart.remove_label`, `cart.removed`, `cart.error`.

## 10. Lệch giữa code hiện tại và spec (cho Dev FE)

| Code (base.css, snippets) | Spec | Ghi chú |
| --- | --- | --- |
| Drawer 100% < 48rem, 28rem (448) từ 48rem | 90% / 420 / 480 | foundation §15 |
| Nút đóng 44 không viền, tiêu đề `--font-size-lg` | `.close-button` 48 tròn, tiêu đề h3 token | foundation §6, §15 |
| Backdrop 60% | `--overlay-scrim` 50% | foundation §2 |
| Ô số `type=number` viền `--color-border` | stepper −/+ viền `--color-muted-light` | sổ quyết định 09/11; câu stepper mở ở ES1-T93 #3 / ES1-T255 |
| Link chữ "Remove" | nút thùng rác 44 lên hàng tiêu đề | 12 §1 audit |
| Không hiện compare-at | giá sale + compare-at gạch | như ES1-T255 |
| Ảnh dòng 96 mọi mốc, ảnh nền dark khi trống | 72 / 96, nền cream, placeholder như card | foundation §9 |
| Subtotal + Total luôn hiện | Subtotal chỉ khi có discount | §1 |
| Thanh freeship cao 8, không icon | cao 6 bo pill, icon xe; đạt → xanh | §1 |
| Empty: câu + "Continue shopping" | empty state foundation §18 + Bestsellers | 12 §1 Must |
| Không có ghi chú, gợi ý, thông báo "Added to cart", quickview | thêm | ES1-T272, ES1-T247 |

Ticket tách theo `.claude/rules/fe-be-boundary.md`: FE (markup drawer + stepper, quickview dialog + nút card, locale, settings) trước, có `data-testid`; BE (stepper debounce, gợi ý fetch/add, quickview fetch + module, ghi chú lưu, focus).

## 11. Quyết định CTO cần chốt

1. Nút Quick View trên card: desktop hiện khi hover/focus (card lúc nghỉ giữ y Figma 1:502), mobile/màn chạm nút tròn 44 luôn hiện, và sản phẩm 1 biến thể vẫn mở quickview (không thêm thẳng vào giỏ)? Đề xuất: có cả ba (06 §1, 15 §7: cùng cách mở; 08 #529D).
2. Mini cart trên mobile dùng drawer phải 90% (foundation §15) thay vì bottom sheet (15 §2 #2 cho 2 option), quickview mobile là bottom sheet? Đề xuất: có; drawer cao hết màn chứa được nhiều dòng hàng + footer dính, quickview ngắn hợp sheet.
3. Ghi chú đơn trong drawer (TE-5 AC1 không có) đặt dạng `<details>` đóng sẵn trong body, chung `cart.note` với cart page, có setting tắt? Đề xuất: có; chỉ thêm 52px khi đóng, không đẩy Checkout khỏi màn hình (ES1-T272 hỏi BA thêm AC).
