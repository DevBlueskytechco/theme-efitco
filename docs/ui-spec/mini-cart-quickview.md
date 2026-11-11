KHÔNG CHẮC: (1) quickview chưa có story/AC trong SRS, ghi chú đơn trong drawer vượt TE-5 AC1 → hỏi BA ES1-T272; upsell drawer chờ CTO ES1-T247. (2) Ảnh store dev lệch tên (ES1-T245): efx-prod-P03 (FlexFold Adjustable Bench) là dây thừng, efx-prod-P14 (Training mat) là dây nhảy; mockup giữ URL, alt trung tính. (3) Ngưỡng freeship $500 là minh hoạ (setting `free_shipping_threshold` mặc định 0, như ES1-T255). (4) demo-data không có description, rating, tồn kho theo variant: quickview không có mô tả, tồn kho mockup tự đặt (White = quá tồn ở 5d). (5) Spec cart page ES1-T255 nằm trên nhánh khác, không đọc được; chỉ bám comment ticket. (6) Figma CTA bo 8 (1:815, 1:816), setting `button_corner_radius` mặc định 4 (DESIGN.md): mockup theo token, lệch ghi §10. (7) demo-data không có sản phẩm 3 option / 40 giá trị: khung 2b, 2c, 5g giả lập option Weight 5–200 lb, Color, Grip trên "Adjustable dumbbell pair" (P09, $259) theo ticket; tồn kho, tổ hợp không tồn tại, mã MOVE10 là minh hoạ. (8) Theme không có `sections/`: "Section Rendering theo option value" hiểu là fetch partial `quick-view` của URL sản phẩm kèm `option_values`; Tech Lead chốt cơ chế khi chia ticket BE. (9) Spec cart G3 (ES1-T255) ở nhánh khác: panel tối dựng lại từ Figma 1:718 + comment ticket T255 + chốt vòng 3b.

# UI spec: Mini cart (cart drawer) và quick view (ES1-T262, vòng 3b)

## Thay đổi audit (ES1-T284, audit ES1-T283 A1, A2, A24)

Bộ chọn biến thể quickview dùng component chung với PDP: `docs/ui-spec/variant-picker.md` (mâu thuẫn thì file đó thắng). Thay các dòng 2–4 của bảng vòng 3b.

| # | Thành phần | Vòng 3b | Audit | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | §3.1 | quy tắc bộ chọn viết riêng cho quickview | trỏ variant-picker.md; chỉ giữ phần riêng quickview (sheet cuộn, `.qv--long`, tiền tố `qv-`, URL) | ticket ES1-T284 |
| 2 | Swatch | viền lõi 20%, gạch chéo 1px | viền lõi 50% (3.36:1), gạch chéo 2px + viền nền 1px; không tồn tại thêm vòng ngoài nét đứt | variant-picker §3.2, §4 |
| 3 | Nhãn | "Show fewer" | "Show Fewer" (Title Case như "Try Again", "Add To Cart") | Sổ 07/11 |
| 4 | Đang tải (5g) | Add To Cart `aria-busy` + `aria-disabled` (xám + spinner) | Add To Cart giữ màu primary, `aria-disabled`, không spinner; skeleton giá + "Checking availability…" spinner 12 giữ nguyên | variant-picker §6 |
| 5 | Lỗi tải biến thể | `.qv__error` + "Try Again", không vẽ | cùng mẫu PDP J4: chữ đỏ + icon dưới option + nút secondary nhỏ "Try Again" 44 | variant-picker §6 |
| 6 | §5 settings | dòng "Ngưỡng thu gọn" chen giữa bảng (vỡ bảng) | chuyển ra dưới bảng | |
| 7 | Mockup | khung 2b, 2c, 5b, 5c, 5g | CSS bộ chọn đồng bộ với `ES1-T253/product.html`; 2c, 5g đổi nhãn và nút; PNG render lại | |

## Thay đổi vòng 3b

| # | Thành phần | Vòng 3 | Vòng 3b | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Footer drawer | trắng, viền trên + bóng, Total 18/600, Checkout icon khoá | panel tối `--color-background-panel` bo 16, cách mép 12 (16 từ 48rem), padding 24/32; Total Inter 500 16 + số 700 18 trắng; chữ phụ trắng 70% (6.54); discount xanh nhạt (5.84) có icon tag; vạch chia `--color-muted`; Checkout cao 52 + mũi tên 16 × 14; focus viền trắng | Ticket 3b mục 3 (cart G3), Figma 1:718, 1:722, 1:758 |
| 2 | Giá trị option | 1 kiểu "không bán được" (gạch) | 3 kiểu theo lựa chọn hiện tại: còn hàng · hết hàng (gạch chữ, muted) · không tồn tại (gạch + viền nét đứt `--color-muted-light`); swatch gạch chéo, không tồn tại thêm viền nét đứt; tên ẩn ", sold out" / ", unavailable" | Ticket 3b mục 1, sổ 10/11 (2048) |
| 3 | Option nhiều giá trị | không có | > 10 giá trị: lưới ô 72, hiện 7 + nút "+N" (2 hàng ở mọi mốc), mở tại chỗ, "Show fewer" thu lại; giá trị đang chọn luôn nằm trong 7 ô | Ticket 3b mục 1; 10 §6 #850 (nút, không dropdown) |
| 4 | Đổi option | không vẽ | khung 5g: lựa chọn nhảy ngay, giá thành skeleton, "Checking availability…", Add To Cart `aria-busy`; tải biến thể từ server theo option value | Ticket 3b mục 1; 05 §5 |
| 5 | Quick view dài | không có | 3 option / mở hết: dialog và sheet cuộn bên trong, hàng mua dính đáy (≥ 48rem khi BE gắn `.qv--long`), nút đóng dính | Ticket 3b mục 1 (ca biên 360 phải cuộn, Add To Cart luôn thấy) |
| 6 | Mockup | khung 1–5 | thêm khung 2b (3 option, thu gọn), 2c (mở hết, đã cuộn), 5g (đang tải biến thể); 4e có discount + focus | Ticket 3b |
| 7 | Bàn giao Dev | không có | §3.1: dữ liệu từ `product.options_with_values` / option value, không lặp `product.variants`, không nhúng JSON biến thể | Ticket 3b mục 1 |
| 8 | §11 | 3 câu chờ chốt | "Quyết định CTO đã chốt (10/11)": M1, M2, M3, G3, 2048; 2 câu mới | Ticket 3b mục 2 |

Giữ nguyên: drawer (trừ footer), nút Quick View, quick view vòng 3, mọi trạng thái cũ.

## Thay đổi so với vòng 2

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header sau scrim | override logo, search 24, menu không chevron | nguyên kit vòng 3: thanh tối `--color-background-dark` + noise, cao 80, logo 100 × 30, menu trắng 60% có chevron Shop/Collection, search 20 | Sổ 10/11, Figma 1:362, foundation §3 |
| 2 | Badge -N% quick view | góc trái trên ảnh | cùng hàng giá: sale · gạch · badge, cách 8 | Figma 1:783 |
| 3 | Tiêu đề quick view | Sofia 800 | Sofia 700, ls −0.02em, lh 58/48 | Figma 1:772 |
| 4 | Ảnh quick view | bo 12 | bo 16 (`--radius-card + --space-1`) | Figma 1:759 |
| 5 | Hàng mua quick view | stepper + Add To Cart; link chữ "View Full Details →" bên dưới | hàng "Quantity" riêng; hàng mua = "Add To Cart" (accent, icon túi 24) + "View Detail" (nút xám `--color-border`, mũi tên 16 × 14), cách 12; mobile cả hàng dính đáy sheet | Figma 1:814–1:816 |
| 6 | Điều hướng ảnh quick view | chỉ thumbnail | thêm cặp chevron tròn 52 góc phải dưới ảnh (≥ 48rem), đầu dãy `aria-disabled` | Sổ 09/11 (mọi carousel), foundation §6 |
| 7 | Card sản phẩm (nền khung 2, khung 3) | không swatch | swatch 32 × 16 `aria-hidden`, số màu trong tên link | Figma 1:502, foundation §9 |
| 8 | Khoảng cách khối info quick view | 16 mọi mốc | 16 < 80rem, 24 từ 80rem; hàng mua cách 40 | Figma 1:768, 1:769 |

Giữ nguyên: drawer, mọi trạng thái, settings, câu hỏi BA/CTO đang mở.

Mục đích: người mua thêm hàng mà không rời trang. Mini cart: thấy ngay hàng vừa thêm, sửa số lượng, xoá, ghi chú, biết còn bao nhiêu tới freeship, thấy tổng và đi checkout. Quick view: chọn biến thể và thêm giỏ từ card sản phẩm, có đường sang trang sản phẩm.

Story: TE-5 AC1–AC4, AC6, AC7 (drawer); TE-4 AC8 (thêm giỏ → drawer); quickview chưa có AC (ES1-T272). Code hiện có: `blocks/cart-drawer.liquid`, `snippets/cart-lines|cart-summary|cart-free-shipping.liquid`, `snippets/product-card.liquid`, `snippets/product-variant-picker.liquid`, `blocks/product-form.liquid`.

Figma: không có frame cart hay quickview (figma-inventory: không trạng thái nào). Ngôn ngữ lấy từ Figma 1:759 (featured product: giá sale đỏ + giá gạch + badge %, nút "Add To Cart" có icon túi, link "View Detail" mũi tên), 1:502 (card), foundation ES1-T251 §6, §12, §15–§19. Mọi thứ còn lại là ĐỀ XUẤT có nguồn.

Đầu ra: spec này; `drafts/designer/ES1-T262/mini-cart-quickview.html`; `mini-cart-quickview-360|768|1280|1920.png`. Khung 1, 2, 2b, 2c trong mockup cao bằng một màn hình thật của mốc (760 / 1024 / 820 / 1000); 2b (360) và 2c (mọi mốc) mô phỏng sheet/dialog đã cuộn; khung 3–5 là trạng thái.

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
3. Footer dính đáy = panel tối (vòng 3b, cart G3, Figma 1:718): nền `--color-background-panel`, bo `--radius-card + --space-1` (16), cách mép drawer 12 (< 48rem) / 16, padding 24 / 32, chữ `--color-background-dark-foreground`. Thứ tự: [Subtotal 14/500 trắng 70% · từng discount: icon tag 14 + mã, số "-$x" xanh nhạt 14/500 · vạch 1px `--color-muted`] (chỉ khi có discount cấp giỏ) · Total: nhãn Inter 500 16, số Inter 700 18 (Figma 1:756, 1:757) · "Taxes and shipping calculated at checkout." 14 trắng 70% · nút Checkout full width cao 52, chữ + mũi tên 16 × 14 bên phải (Figma 1:758) · accelerated checkout (Shopify render, TE-5 AC1 bật mặc định). Focus trong panel: outline 2px trắng. Màu trộn bằng `color-mix` từ token có sẵn, không thêm token: chữ phụ `color-mix(dark-foreground 70%, panel)`, xanh `color-mix(badge-new 50%, dark-foreground)`.
   Nút accelerated trong panel tối: Shopify vẽ, giữ màu thương hiệu (Shop Pay tím, G Pay đen), không ô nét đứt, không viền thêm (foundation §27).

Dòng hàng (`.cd-line`):
- Ảnh 72 (< 48rem) / 96, nền cream, bo 8, `contain` + `mix-blend-mode: darken` như card; link ẩn khỏi tab (`tabindex="-1" aria-hidden`), chỉ tiêu đề là link.
- Hàng trên: tiêu đề 16/500, hiện đủ, không cắt, link PDP (12 §1: tên là link) · nút thùng rác 44 (12 §1 audit: remove lên đầu, icon thùng rác).
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
- Drawer phải 90% trên mobile thay vì bottom sheet: foundation §15 đã chọn; 15 §2 #2 cho cả 2 option. Chạm scrim 10% bên trái để đóng. Đã chốt M2 (10/11).
- "View cart" lên header thay vì dưới nút Checkout: 12 §1 #62.3% (luôn có đường tới giỏ) và 12 §8; để ở footer làm footer 360 cao ~300 (body chỉ còn 1 dòng hàng, đã thử ở nháp).
- Checkout dùng mũi tên như Figma 1:758 thay icon khoá của vòng 3 (vòng 3b, cùng panel cart G3); tín hiệu bảo mật ở checkout Shopify. Panel 360 cao ~236 (Total 28, ghi chú 22, nút 52, accelerated 44, padding), body còn ≥ 1,5 dòng hàng.
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
2. Đầu: eyebrow vendor (accent, Sofia 16/800 uppercase ls 0.04em, Figma 1:771) · cách 12 · h2 tên sản phẩm Sofia 700 (`--font-heading--weight`), `--font-size-h2`, ls −0.02em (Figma 1:772 là 48/58; dialog dùng h2 36 vì cột chỉ 408), chừa 56 bên phải cho nút đóng.
3. Media (Shopify §4 rich product media, 11/11: quick view phải hiện video, YouTube/Vimeo, 3D như PDP; dùng chung product-media: poster + nút play 52, 3D poster + nút "View in 3D", bấm mới tải; thumbnail có icon loại media): ảnh chính 1:1 nền cream bo 16 `contain` (Figma 1:759) · cặp chevron tròn 52 (`.round-button`, kit) góc phải dưới cách 16, cách nhau 8: trắng viền border, rê chuột cam; ở ảnh đầu/cuối `aria-disabled` opacity 0.35 (code `.carousel-nav__button`) · thumbnail 64 (72 từ 80rem) bo 8, đang chọn viền 2px foreground, tối đa 5. Mobile: dải ảnh vuốt (mỗi ảnh 78% bề ngang, lộ ảnh sau, 15 §5) + thanh tiến trình mảnh, không chevron, không thumbnail (sổ 09/11).
4. Giá (Figma 1:783, hàng cao 28, cách 8): sale 18/600 đỏ · compare-at 16 gạch muted · badge -N% (pill 28, kit `.badge--sale`). Không lặp badge trên ảnh. Không giá sale: giá foreground, không badge. `price_varies`: giá theo biến thể đang chọn.
5. Rating (chỉ khi có metafield `reviews.rating`, như card AC-H13): sao 14 + "(4.9)" + gạch đứng + "341 reviews" 14 muted (Figma 1:786, cách giá 8).
6. Mô tả (chỉ khi có): Inter 16/500 lh 26 muted (Figma 1:797), cắt 3 dòng "…". Demo-data không có.
7. Option (tối đa 3): mỗi option một `<fieldset>` + legend "Color: Black" (giá trị đang chọn ghi trong legend). Màu có `swatch` → tròn 44; còn lại pill 44 (code `.product-option__value`). Trạng thái từng giá trị và option nhiều giá trị: §3.1.
8. Tình trạng: chấm 8 + "In stock" / "Sold out" / "Unavailable" 14.
9. Số lượng: label thật "Quantity" 14/600 + stepper 44 (hàng riêng; Figma 1:814 không có ô số, giữ chức năng vòng 2).
10. Hàng mua (Figma 1:814, cách khối trên 40 từ 80rem): "Add To Cart" primary, icon túi 24, padding 32 · cách 12 · "View Detail" nút xám: nền `--color-border`, chữ foreground 16/600 (13.8:1), mũi tên 16 × 14; là `<a href>` tới PDP, tên ẩn "of {product}". Hover View Detail: nền foreground chữ trắng, mũi tên dịch 4 (ĐỀ XUẤT, foundation §6 secondary hover). < 80rem padding 16 để 2 nút vừa 1 hàng ở cột 316 (155 + 12 + 142).

Theo mốc:

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Kiểu | bottom sheet, cao tối đa 88% | dialog giữa | dialog giữa | dialog giữa |
| Rộng | 100% | 720 | 960 | 960 |
| Bố cục | 1 cột: tên → ảnh vuốt → giá → option → tồn → số lượng → hàng mua (Add To Cart + View Detail) dính đáy | 2 cột 1:1, gap 24; ảnh 316, chevron 52 | 2 cột, gap 48; ảnh 408, chevron 52 | như 1280 |
| Padding | 32 / 16 / 20 | 32 | 48 | 48 |

ĐỀ XUẤT:
- 960 từ 80rem thay 720 của foundation §16 (M): ở 720 ảnh chỉ 316 trên màn 1280+, nhỏ hơn card 336 trong lưới phía sau; 960 cho ảnh 408, vẫn nhỏ hơn L 1120 và không cần cuộn với 1 option (cao ~590 < 820).
- Mobile: tên lên đầu sheet (chung hàng nút đóng, vùng vuốt xuống gồm cả header, 15 §2); hàng "Add To Cart + View Detail" giữ đúng cặp Figma 1:814, dính đáy sheet (vùng ngón cái, 05 §1.5), cao 48, padding 16; stepper nằm trong nội dung ngay trên.
- Chevron 52 trên ảnh quick view (≥ 48rem): sổ 09/11 "nút next/back tròn 52 mọi carousel"; thumbnail vẫn giữ để nhảy thẳng tới ảnh. Mobile chỉ vuốt + thanh tiến trình (sổ 09/11).
- "View Detail" dùng nút xám như Figma 1:816 chứ không phải `.button--secondary` viền của foundation §6: khối featured product là chỗ duy nhất Figma có nút phụ đặt cạnh CTA chính. Rủi ro: nút disabled (nền border, chữ muted 6.70) cùng nền với nút xám; phân biệt bằng chữ ("Sold Out"/"Unavailable"), chữ muted và `cursor: not-allowed` (khung 5b, 5c).
- Không có nút dynamic checkout (Buy it now) trong quickview: 1 CTA chính mỗi lớp (04 §1); thanh toán nhanh có ở drawer ngay sau khi thêm.
- Gift card: quickview chỉ chọn mệnh giá; form người nhận (TE-4 AC6) chỉ ở PDP, có câu "Add a recipient on the product page." + link.
- 1 ảnh: dải mobile 1 ảnh full bề ngang, tỉ lệ 4:3 (không cần lộ ảnh sau, bộ chọn lên gần hơn), không thanh tiến trình; ≥ 48rem không chevron, không thumbnail (khung 2b).

## 3.1 Bộ chọn biến thể theo option value (2048 biến thể, chốt 10/11)

Component chung với PDP (ES1-T253) và chỉ báo card: toàn bộ quy tắc ở `docs/ui-spec/variant-picker.md` — dữ liệu theo option value (§2), pill và swatch chuẩn Shopify (§3), 3 trạng thái giá trị + đang chọn, hover, focus (§4), option > 10 giá trị hiện 7 + "+N" / "Show Fewer", focus vào giá trị đầu vừa hiện (§5), đang tải, xong, lỗi "Try Again" (§6), a11y (§7), chuỗi (§10), bàn giao và lệch code (§12). Không lặp lại ở đây. Mockup khung 2, 2b, 2c, 5b, 5c, 5g.

Phần riêng của quickview:
- Bề rộng vùng chứa: 320 (sheet 360) / 316 / 408 / 408 → lưới thu gọn 4 / 4 / 5 / 5 ô mỗi hàng, 7 + "+N" luôn đúng 2 hàng (variant-picker §5). Legend cách giá trị 8, fieldset cách nhau 16 (< 80rem) / 24.
- 360 bottom sheet: 3 option + mở hết 40 giá trị → sheet cuộn bên trong (`overscroll-behavior: contain`), hàng "Add To Cart + View Detail" dính đáy, nút đóng dính trên (khung 2c). Sau khi mở "+N", focus vào giá trị đầu vừa hiện; sheet cuộn để giá trị đó nằm trên hàng mua dính (`scroll-padding-block-end` = cao hàng mua). ≥ 48rem: dialog vượt `100dvh − 48` thì BE gắn `.qv--long` → hàng mua dính đáy cột phải, nền trắng, vạch trên.
- Đang tải (khung 5g, variant-picker §6): skeleton giá cao 28, "Checking availability…" + spinner 12, Add To Cart giữ màu primary + `aria-disabled`, "View Detail" vẫn dùng được (href cũ tới khi xong). Xong: ảnh nhảy tới ảnh của biến thể (dải mobile / ảnh chính), `href` "View Detail" đổi `?variant=`.
- Lỗi tải: cùng mẫu PDP J4 (chữ đỏ + icon dưới option + "Try Again"), không vẽ lại trong mockup quickview.
- URL: quickview không đổi URL trang đang đứng (collection, trang chủ): chỉ đổi `href` của "View Detail" sang `?variant={id}` và input `id` của form (sổ 10/11 M4).
- Id: mọi id tiền tố `qv-`; radio `name="qv-{product.id}-{option.position}"`, `value="{value.id}"` (snippet chung, tham số `id_prefix: 'qv-'`).
- BE: fetch URL sản phẩm kèm `option_values=id1,id2,id3` và partial `quick-view` → thay vùng giá, tồn, bộ chọn, nút, ảnh.
- Không JS: quickview không mở (card là link PDP).

## 4. Quick view: nút mở trên card

Figma 1:502 không có (figma-inventory hàng 5 liệt "quick add" là thiếu). ĐỀ XUẤT, nguồn 08 #529D (quick view), 06 §1 (cùng cách mở/đóng), sổ quyết định 06/11 (trang chủ giống Figma 100%).

- ≥ 64rem và `(hover: hover)`: lúc nghỉ không thấy gì (card y Figma). Rê chuột card hoặc focus vào nút: nút "Quick View" trượt lên ở đáy ảnh, cách mép 16, cao 44, nền trắng viền border, chữ 14/600 + icon túi có dấu +; hover nút đảo nền foreground chữ trắng. 250ms opacity + translate 8.
- < 64rem hoặc màn chạm: nút tròn 44 icon túi + ở góc phải dưới ảnh, cách 8, luôn hiện (không có hover trên điện thoại).
- Tên: chữ "Quick View" + tên sản phẩm ẩn ("Quick View FlexFold Adjustable Bench"); mobile chỉ icon nên toàn bộ tên ẩn. Tên chứa chữ hiển thị (WCAG 2.5.3).
- Nút nằm trên lớp link phủ card (`z-index` trên `::after`); bấm nút không mở PDP.
- Một hành vi cho mọi sản phẩm, kể cả 1 biến thể (06 §1, 15 §7: chức năng giống nhau cùng cách mở). Đã chốt M1 (10/11).
- "Nút chọn nhanh" trên card chính là nút Quick View này: mở quickview với bộ chọn §3.1 (cùng PDP), không có bộ chọn riêng trên card. Card không lặp `product.variants` (§3.1 bàn giao).
- Sản phẩm hết hàng toàn bộ: vẫn hiện nút (quickview báo Sold out, có link PDP).
- Không JS: ẩn nút (`quick-view-button:not(:defined)`), card vẫn là link PDP.

## 5. Settings merchant

| Tên (sentence case) | Kiểu | Default | Giới hạn / ghi chú | Trạng thái |
| --- | --- | --- | --- | --- |
| Cart type | select: Drawer, Page | Drawer | có sẵn (`cart_type`) | có |
| Free shipping threshold | number | 0 | 0 = ẩn thanh (code) | có |
| Show order note | checkbox | true | drawer + cart page cùng `cart.note`; `<details>` đóng sẵn | Chốt M3 (10/11); AC chờ ES1-T272 |
| Show product recommendations | checkbox | true | 2 sản phẩm, complementary của dòng đầu | ĐỀ XUẤT (chờ ES1-T247) |
| Recommendations heading | text | Pairs Well With | ≤ 30 ký tự | ĐỀ XUẤT |
| Empty cart products | collection | trống | trống → chỉ empty state, không hàng gợi ý | ĐỀ XUẤT (12 §1 Must giỏ trống) |
| Show quick view button | checkbox | true | nhóm Product cards | Chốt M1 (10/11); AC chờ ES1-T272 |
| Show vendor in quick view | checkbox | true | eyebrow | ĐỀ XUẤT |

Ngưỡng thu gọn option (> 10 giá trị, hiện 7 + "+N") là hằng trong snippet bộ chọn, không thành setting (sổ M5, variant-picker §11).

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
| Có discount cấp giỏ (4e) | panel: Subtotal → mã (icon tag, xanh nhạt) → vạch → Total; focus Checkout viền trắng | TE-5 AC5; cart G3 |
| Ghi chú mở (4e) | label thật, textarea 96, gợi ý "Saved with your order. N characters left." | 04 §5; TE-5 AC5 |
| Gợi ý đang tải (4f) | 2 hàng skeleton đúng kích thước (64 ảnh, 2 dòng, nút 44); 0 kết quả hoặc lỗi → ẩn cả khối | foundation §18; ES1-T247 |
| Hover / focus | tiêu đề gạch chân; thùng rác nền alt + chữ foreground; ô stepper nền alt; focus outline 2px accent (stepper: viền accent cả cụm) | foundation §6 |

Quick view:

| Trạng thái | Thiết kế | Nguồn |
| --- | --- | --- |
| Đang tải (5a) | dialog mở ngay khi bấm, skeleton: tên, ảnh vuông, giá, 3 swatch, nút; "Loading product…" status | foundation §18; sổ 09/11 ảnh popup tải khi mở |
| Mặc định | khung 2 | |
| 3 option, option > 10 giá trị (2b, 2c) | thu 7 + "+N"; mở hết tại chỗ, sheet/dialog cuộn, hàng mua + nút đóng dính | §3.1; ticket 3b |
| Đang tải biến thể (5g) | giá skeleton, "Checking availability…" + spinner 12, Add To Cart giữ màu `aria-disabled` (không spinner), lựa chọn đổi ngay | §3.1; variant-picker §6 |
| Lỗi tải biến thể | giữ biến thể cũ + chữ đỏ, icon dưới option + "Try Again" (mẫu PDP J4, không vẽ riêng) | variant-picker §6 |
| Biến thể hết hàng (5b) | giá + badge Sold out; mọi option gạch (kiểu hết hàng §3.1); chấm muted "Sold out"; stepper + nút disabled "Sold Out"; "View Detail" vẫn dùng được | code product-form; 05 §3, §5 |
| Tổ hợp không tồn tại (5c) | option đang chọn gạch + viền nét đứt (kiểu không tồn tại §3.1); "Unavailable"; nút disabled "Unavailable"; khung 5c vẽ thêm hover "View Detail" | code `data-label-unavailable` |
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
| foreground / border | 13.8 | nút xám "View Detail" (Figma 1:816) |
| foreground / background (chevron 52), accent-foreground / accent (hover) | 17.4 / 5.01 | chevron ảnh quick view |
| muted-light / background | 5.33 | viền stepper, −/+ disabled (sổ 09/11 viền ô nhập), viền nét đứt giá trị không tồn tại, viền "+N" |
| foreground / alt | 15.8 | chữ nút "+N" |
| trắng / panel (L 0.0419) | 11.4 | Total, nhãn footer |
| trắng 70% trộn panel (L 0.551) / panel | 6.54 | Subtotal, ghi chú thuế, chữ accelerated |
| badge-new 50% trộn trắng (L 0.487) / panel | 5.84 | discount trong panel |
| accent-foreground / accent trên panel | 5.01 | Checkout (viền nút/panel 2.28: nút nhận diện bằng chữ, 1.4.11 không áp) |
| muted-light / alt | (0.954 / 0.197) = 4.84 | icon −/+ trong stepper disabled |
| accent / alt (thanh freeship) | 4.55 | phi chữ ≥ 3 |
| badge-new / alt (thanh đạt) | ~4.15 | phi chữ ≥ 3 |
| foreground / background (badge Sold out) | 17.4 | |

- Vùng chạm: nút đóng 48; thùng rác, −, +, ô số, View cart, Quick View, swatch, pill, thumbnail 64–72, Add / Choose 44; Checkout, Add To Cart 48–52. Hai nút cạnh nhau cách ≥ 8 trong cụm, cụm cách 12–16.
- Tên: mọi nút icon có tên riêng kèm tên sản phẩm: "Remove {title}" (`cart.remove_label` có sẵn), "Decrease quantity for {title}", "Increase quantity for {title}", ô số `cart.quantity_label`; "Add" / "Choose" có phần ẩn "{title} to cart" / "options for {title}"; "Quick View" + tên; thumbnail "Show image 2 of 3"; chevron "Previous image" / "Next image"; "View Detail" + "of {title}"; ô số có `<label>` "Quantity" thật. Không có 2 link/nút cùng tên khác đích.
- Bàn phím: drawer, dialog dùng `showModal()` (bẫy focus, Escape đóng, nền inert); mở thì focus vào nút đóng (drawer) / tiêu đề (quickview, `tabindex="-1"`); đóng thì trả focus về nút mở. Thumbnail, option là radio/nút đi bằng Tab, ←/→ trong nhóm radio.
- Live region: `cart-items-status` (status) và `cart-items-error` (alert) có sẵn; quickview thêm 1 status + 1 alert.
- Heading: drawer h2 → "Pairs Well With" h3; quickview h2. Không nhảy bậc.
- Màu không đứng một mình: hết hàng có chữ "Sold out", lỗi có icon + câu, đạt freeship có câu.
- Reduced motion: tắt trượt, fade; spinner vẫn quay chậm thì giữ (chỉ báo trạng thái) hoặc thay bằng chữ status.

## 8. Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

- LCP: overlay không bao giờ là LCP (đóng khi tải trang). LCP vẫn là ảnh lớn đầu trang của template đang mở.
- Ảnh lazy: mọi ảnh drawer (dòng hàng 96–192w, gợi ý 64–128w) `loading="lazy"` + width/height; dialog đóng là `display: none` nên không tải tới khi mở. Quickview: không có DOM lúc tải trang; markup + ảnh fetch khi bấm (sổ 09/11 "ảnh trong menu/popup tải khi mở"), ảnh chính `sizes="(min-width: 80rem) 408px, (min-width: 48rem) 316px, 78vw"`, thumbnail 72–144w.
- Font: Inter + Sofia Sans Condensed (2 họ, sổ 30/10); không font mới, không icon font (SVG nội tuyến).
- JS: quickview là module riêng, import khi bấm lần đầu (như `data-items-src` của cart-drawer); không tăng JS lúc tải trang. Không JSON biến thể trong HTML (2048 biến thể × dữ liệu làm phình DOM, chạm Performance); đổi option chỉ tải 1 partial.
- DOM: option 40 giá trị = 40 radio + 1 nút; giá trị ẩn sau "+N" vẫn trong DOM (`hidden`), không fetch thêm khi mở.
- CLS: drawer, dialog `position: fixed`; nút Quick View `position: absolute` trong ảnh card; skeleton đúng kích thước.
- Rủi ro A11y và cách tránh:
  - Nút Quick View ẩn bằng opacity trên desktop: vẫn trong cây a11y, có tên, focus thì hiện; không dùng `visibility: hidden` (Tab bỏ qua) hay `display: none`.
  - `aria-dialog-name`: cả 2 dialog có `aria-labelledby`.
  - Trùng id khi quickview mở trên PDP của cùng sản phẩm (form `product-form-{id}`): quickview dùng tiền tố `qv-` cho mọi id.
  - Chữ mờ khi cập nhật: không dùng opacity cho chữ (color-contrast tính cả opacity).
  - `label` cho ô số và textarea ghi chú: label thật (ẩn với ô số).
  - `target-size`: mọi control ≥ 44.
- SEO: overlay không có link "Read more"/"Click here"; link là `<a href>` thật (tiêu đề dòng hàng, View cart, View Detail + tên ẩn sản phẩm); nút Quick View là `<button>`, không cản crawler đi qua link card. Chữ ≥ 12 (nhỏ nhất 13 ở pill).
- Best Practices: không lỗi console (render 4 mốc 0 lỗi); ảnh `object-fit: contain`, không kéo méo; ô số và textarea không chặn dán.

## 9. Token và chuỗi

Token: chỉ token có sẵn (`--color-*`, `--space-*`, `--radius-*`, `--motion-*`, `--font-*`) + giá trị dẫn xuất foundation §2 (`--overlay-scrim`, `--shadow-overlay`, `--shadow-raised`, `--radius-dialog`, `--control-height`). Không thêm token. Màu swatch lấy từ `value.swatch.color` của Shopify (mockup giả lập bằng token).

Chuỗi mới (đề xuất key, Dev FE thêm vào `locales/en.default.json`): `cart.view_cart` "View cart", `cart.item_count` "{{ count }} item(s)" (one/other), `cart.added` "Added to cart", `cart.shipping_at_checkout` "Taxes and shipping calculated at checkout.", `cart.note_toggle` "Add order note", `cart.note_hint` "Saved with your order.", `cart.line_sold_out` "This item is sold out. Remove it to check out.", `cart.sold_out_summary` "{{ count }} item is sold out", `cart.update_error_title` "We couldn't update your cart", `cart.decrease_label` / `cart.increase_label` "Decrease/Increase quantity for {{ title }}", `cart.empty_heading` "Your Cart Is Empty", `cart.empty_text`, `cart.empty_cta` "Shop Bestsellers", `cart.recommendations_add` "Add", `cart.recommendations_choose` "Choose", `products.quick_view.open` "Quick View", `.close` "Close quick view", `.view_detail` "View Detail" (Figma 1:816), `.previous_image` "Previous image", `.next_image` "Next image", `.quantity` "Quantity", `.image_label` "Show image {{ index }} of {{ count }}", `.loading` "Loading product…", `.load_error_title` "We couldn't load this product", `general.try_again` "Try Again". Bộ chọn biến thể (`products.variant.*`: hậu tố ẩn, "+N", "Show Fewer", "Checking availability…", "Loading {{ value }}…", lỗi tải): variant-picker §10. Vòng 3b: `cart.subtotal` (có sẵn trong code), `cart.discount_label` ẩn "Discount". Giữ có sẵn: `cart.title`, `cart.checkout`, `cart.free_shipping_*`, `cart.quantity_*`, `cart.remove_label`, `cart.removed`, `cart.error`.

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
| `--radius-button` 4 (setting `button_corner_radius`) | Figma CTA bo 8 (1:815, 1:816) | P3; mockup theo token, không đổi token; chỉnh default setting là việc của ticket foundation |
| Footer drawer trắng, Subtotal + Total luôn hiện | panel tối `--color-background-panel` (§1, cart G3) | vòng 3b |
| `snippets/product-variant-picker.liquid`: cần đối chiếu Dev có lặp `product.variants` / nhúng JSON biến thể không | bộ chọn từ `option.values` (§3.1), 3 trạng thái giá trị, thu gọn > 10 | sổ 10/11 (2048); Tech Lead soát khi chia ticket |
| Nền header tối chỉ khi có `.slideshow` | header tối mọi trang, kể cả trang đang mở drawer/quick view | foundation §3, §21 |

Ticket tách theo `.claude/rules/fe-be-boundary.md`: FE (markup drawer + stepper, quickview dialog + nút card, locale, settings) trước, có `data-testid`; BE (stepper debounce, gợi ý fetch/add, quickview fetch + module, ghi chú lưu, focus).

## 11. Quyết định CTO đã chốt (10/11)

- M1: nút Quick View desktop hiện khi hover/focus, mobile nút tròn 44 luôn hiện, sản phẩm 1 biến thể vẫn mở quickview (§4).
- M2: mini cart mobile là drawer phải 90%, quickview mobile là bottom sheet (§1, §3).
- M3: ghi chú đơn trong drawer dạng `<details>` đóng sẵn, có setting tắt (§1, §5).
- G3: footer mini cart là panel tối như cart (chữ phụ trắng 70%, xanh giảm giá nhạt) (§1).
- 2048 biến thể: bộ chọn từ option value, 3 trạng thái giá trị, tải biến thể từ server, thu gọn "+N", có trạng thái đang tải (§3.1).

Câu mới (CTO chốt 10/11 theo đề xuất, docs/design/decisions.md):
1. Quickview đổi biến thể không đổi URL trang nền, chỉ đổi link "View Detail" sang `?variant=`? Đề xuất: có (Back vẫn về collection; PDP mới `replaceState`).
2. Ngưỡng thu gọn: option > 10 giá trị thì hiện 7 + "+N", hằng chung PDP/quickview, không thành setting? Đề xuất: có (đúng 2 hàng ở mọi mốc, 10 §6 #850).
