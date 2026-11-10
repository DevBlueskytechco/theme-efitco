KHÔNG CHẮC: (1) ảnh của handle `figma-ativafit-lava-adjustable` là áo tạ, không phải tạ tay (lệch tên, ES1-T245); mockup giữ đúng URL, alt trung tính. Ảnh một số sản phẩm gợi ý cũng lệch tên. (2) demo-data không có description, metafield rating, spec: mô tả, 4 dòng spec, 4.9 / 341 reviews lấy từ Figma 1:759; review mẫu lấy từ locale testimonial (Figma 1:885). (3) Nguồn dữ liệu review chưa chốt: hỏi ở ES1-T264.

# UI spec: Trang sản phẩm (ES1-T253)

Mục đích: người mua xem ảnh/video/3D, chọn biến thể và thấy giá, tồn, nút cập nhật ngay, thêm giỏ hoặc mua nhanh, đọc mô tả, thông số, review, rồi tìm sản phẩm mua kèm hoặc thay thế. Story TE-4 (AC1–AC12), `docs/srs.md#TE-4`.

Template: `templates/product.liquid`. Block hiện có: `product-media`, `product-info`, `product-form`, `product-sticky-bar`, `product-recommendations` (related, complementary).

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T253/product.html` (nhúng `../_kit/kit.css`) + `product-360|768|1280|1920.png`. Trạng thái A–I ở cuối file.

Nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma > kiến thức. Figma không có trang sản phẩm. Ngôn ngữ buy box lấy từ Featured product Figma 1:759 (trang chủ); thành phần chung theo `docs/ui-spec/foundation.md` (ES1-T251). Mọi phần không có trong Figma ghi `ĐỀ XUẤT:` kèm nguồn.

---

## 1. Thứ tự khối

| # | Khối | Block | Ghi chú |
| --- | --- | --- | --- |
| 1 | Header A (nền trắng, sticky) | `header` | Sổ quyết định 09/11; foundation §3 |
| 2 | Breadcrumb | — (foundation §5) | Home / {collection} / {product} |
| 3 | Gallery + buy box | `product-media`, `product-info`, `product-form` | §3–§6 |
| 4 | Pairs Well With | `product-recommendations` intent complementary | §7 |
| 5 | Customer Reviews | ĐỀ XUẤT block mới `product-reviews` | §8, ES1-T264 |
| 6 | You May Also Like | `product-recommendations` intent related | §9 |
| 7 | Footer | `footer` | foundation §4 |
| — | Sticky bar | `product-sticky-bar` | §10 |

ĐỀ XUẤT: đổi thứ tự template thành main → complementary → reviews → related (hiện related trước complementary). Nguồn: 09 §2 #811 audit (mua kèm ngay dưới sản phẩm), 09 §1 thứ tự Baymard (review trước cross-sell thay thế), 09 §1 audit (hai lưới sản phẩm liền nhau bị hoà vào nhau: complementary dạng hàng ngang gọn, related dạng card, review nền cream ở giữa ngăn cách).

Không dùng tab ngang cho mô tả / thông số / review (09 §1 #753). Không đặt cross-sell trên ảnh, tên, giá, nút (09 §1 #738).

## 2. Lưới theo mốc

| Giá trị | 360 | 768 | 1280 | 1920 | Token / nguồn |
| --- | --- | --- | --- | --- | --- |
| Bố cục main | 1 cột | 1 cột | 2 cột bằng nhau | 2 cột bằng nhau | Figma 1:759 media 668 / info 670 |
| Khoảng giữa 2 cột | — | — | 80 | 80 | `--space-1 × 20` (Figma itemSpacing 80); 48 ở 1024–1279 (`--space-7`) |
| Bề rộng gallery / buy box | 360 (tràn mép) / 320 | 728 / 728 | 580 / 580 | 668 / 668 | |
| Tỉ lệ ảnh chính | 1:1 | 4:3 | 1:1 | 1:1 | ĐỀ XUẤT 4:3 ở tablet để tên + giá hiện trong màn 1024 cao (09 §1 #757 top-block 0.5–1.5 màn) |
| Bo ảnh chính | 0 | 16 | 16 | 16 | `--radius-card + --space-1` (Figma 1:759 cornerRadius 16) |
| Thumbnail | 56 | 64 | 80 | 80 | gap 12; code hiện 64 cố định |
| h1 | 33 | 43 | 48 | 48 | `--font-size-h1`, lh 58/48 (Figma 1:772) |
| Giá | 22 | 24 | 27 | 28 | `--font-size-h3`, Inter 600 |
| Nút, ô số lượng | 48 | 48 | 52 | 52 | `--control-height` |
| Padding main | 8 / 48 | 8 / 48 | 24 / 120 | 24 / 120 | trên / dưới |
| Khoảng trong buy box | 24 | 24 | 24 | 24 | `--space-5` (Figma 1:769 itemSpacing 24) |

- Từ 64rem gallery dính (`position: sticky`, top = header 80 + 24), buy box cuộn. ĐỀ XUẤT thay code hiện tại (code dính cột chi tiết, xếp dọc mọi ảnh): buy box dài hơn ảnh vì có accordion, nên dính ảnh giữ ảnh trong tầm mắt khi đọc thông số (09 §3 #1217M ảnh và lựa chọn cùng viewport).
- 360: ảnh tràn mép màn (margin âm bằng `--page-margin`), không bo; thumbnail, chữ, nút giữ lề 20. ĐỀ XUẤT, 09 §3 mobile (ảnh chính lớn, chiếm phần lớn màn hình).
- 768: thiết kế riêng, không phải 360 phóng to: ảnh 4:3 rộng 728 có nút 52; hàng cam kết 3 cột; bảng thông số giá trị căn phải; hàng gợi ý cuộn ngang 2.5 card.

## 3. Gallery (`product-media`)

Anatomy: track ảnh (scroll-snap) · nút phóng to (ảnh là link tới bản 2048, icon kính lúp 44 trắng góc phải trên, chỉ trang trí) · bộ đếm "1 / 3" (pill trắng, `aria-hidden`) · nút trước/sau tròn 52 góc phải dưới (≥768) · hàng thumbnail.

- Thứ tự media: featured media của variant đang chọn trước (code đã có). Đổi variant thì track trượt tới ảnh variant (AC1).
- Nút 52: trắng viền `--color-border`, hover cam (sổ quyết định 09/11). Ở đầu/cuối: mờ 0.35 + `aria-disabled`. 360: ẩn nút, vuốt.
- Thumbnail: nền cream, viền 1px `--color-border`, bo 4 (8 từ 80rem); đang xem viền 2px foreground (ĐỀ XUẤT, code 1px: 1px foreground khó thấy khác hover); hover viền foreground. Thumbnail hiện cả trên mobile (09 §3 #774M). Video: nhãn ▶ đen góc phải dưới; 3D: nhãn "3D". Chỉ hiện khi ≥ 2 media.
- Không lặp badge giảm giá trên ảnh: -24% đặt cạnh giá (Figma 1:783; 10 §8 không lặp khuyến mãi).
- Hover ảnh desktop: con trỏ zoom-in. Không làm hover zoom ở bản này (06 §6 gợi ý; ĐỀ XUẤT để sau vì phải tải ảnh 2048 khi rê chuột, chạm Performance).
- Video (`video`): poster + nút "Play video" pill đen giữa ảnh (icon ▶ trong tròn trắng 40), `preload="none"`, không tự chạy, có `controls`. Ngoài (YouTube/Vimeo): iframe chỉ chèn khi bấm (code `<template>`). 3D (`model`): poster + nút "View in 3D", `reveal: interaction`. Mockup trạng thái E.
- Không media (`edge_cases` "Sản phẩm không có media"): 1 ô placeholder cream, icon ảnh `--color-muted-light`, không thumbnail, không nút phóng to. Trạng thái I.

Lightbox (`product-media__dialog`), trạng thái F:
- Toàn màn mọi mốc. Ngoại lệ quy tắc "không popup full-screen trên điện thoại" (15) vì là trình xem ảnh: 09 §3 ảnh phóng to chiếm 80–100%.
- ĐỀ XUẤT nền `--color-background-cream` (ảnh sản phẩm nền cream, hoà như card) thay backdrop tối 60% của code; đếm ảnh trái trên 14/600; nút đóng 48 phải trên cách mép 12; ≥768 nút 52 hai bên giữa dọc; hàng thumbnail 64 ở đáy; mobile vuốt ngang.
- Mở 300ms fade + scale 0.97, đóng 200ms (foundation §19). Escape đóng, trả focus về link ảnh đã mở. `aria-label="Zoomed image"` (code có).

## 4. Buy box: phần đầu (`product-info`)

Thứ tự (Figma 1:769 + 09 §1 thứ tự Baymard): eyebrow vendor → h1 → giá → rating → ghi chú thuế/ship.

| Phần tử | Kiểu | Màu | Nguồn |
| --- | --- | --- | --- |
| Vendor | eyebrow 16/800 uppercase, letter-spacing 0.04em | `--color-accent` (5.01) | Figma 1:771 eyebrow; sổ 09/11; setting `show_vendor` có sẵn |
| Tên | h1 heading 700, đầy đủ không cắt | foreground | Figma 1:772; AC3 |
| Giá bán | Inter 600 `--font-size-h3` | `--color-sale` khi giảm (6.38), foreground khi không | ĐỀ XUẤT cỡ ≈ tên (10 §8 #792); Figma 1:784 chỉ 16px vì là khối trang chủ |
| Giá gạch | 16/500 line-through | `--color-muted` (8.45) | Figma 1:784 (14) tăng 1 bậc theo giá |
| Badge -N% | pill 28, 13/600 | sale / sale-foreground | Figma 1:785; N tính từ compare_at_price |
| Rating | 5 sao 16 + "4.9" + vạch 1px + "341 reviews" gạch chân | sao `--color-rating`, chữ foreground | Figma 1:786; metafield `reviews.rating`, `reviews.rating_count` (như featured-product) |
| Thuế, ship | 14/400 | muted | code (`taxes_included`, `shipping_at_checkout_html`) |

- Giá, gạch, badge cùng một hàng, cách 8–12 (10 §8 gộp nhóm giá, nhãn giảm sát giá).
- Rating là 1 link tới `#reviews` (10 §10 #786), cao 44 (vùng chạm mobile). Tên đọc: "Rated 4.9 out of 5 stars, 341 reviews". Không có metafield thì ẩn cả hàng (SRS TE-13 AC2 cùng quy tắc).
- Mô tả không đặt trong phần đầu (khác Figma 1:797): mô tả dài đẩy nút ra khỏi màn đầu. Mô tả nằm trong accordion mở sẵn §6 (09 §1 #751, 10 §8 #789). Code hiện in `product.description` trước form: Dev FE chuyển xuống.
- Unit price (edge_cases "Unit price"): dòng 14 muted ngay dưới giá, "$X / 100 g" theo snippet `price` (10 §8 #817).
- Giá theo variant đổi tại chỗ qua partial `product-price` (AC2).

## 5. Buy box: form (`product-form`)

Ngăn với phần đầu bằng gạch 1px `--color-border`, padding-top 24.

Anatomy: bộ chọn option (fieldset/option) · dòng tồn kho · số lượng + Add To Cart · Buy It Now + "More payment options" · pickup (khi có) · hàng cam kết · accordion.

Bộ chọn option:
- `<fieldset>` + `<legend>` "Color: Black" (tên option 14/600 + giá trị đang chọn 14/400 muted). ĐỀ XUẤT thêm giá trị đang chọn vào legend (10 §6 #849; swatch không có chữ).
- Swatch khi `value.swatch` có màu/ảnh: tròn 44 (vùng chạm), lõi 36. Chưa chọn: viền lõi `color-mix(foreground 50%)` (ĐỀ XUẤT; code 20% chỉ ~1.5:1, swatch White trên nền trắng không thấy mép; 50% ≈ 3.4:1 đạt 1.4.11). Chọn: vòng 2px foreground ngoài lõi. Hover: viền foreground.
- Pill chữ khi không có swatch (Size, Denominations, Operating system): cao 44, min 56, padding 16, bo pill, 14/500; chưa chọn viền `--color-border`, hover viền foreground; chọn nền foreground chữ trắng (17.4). Không dùng dropdown cho size (10 §6 #850). Code có sẵn `.product-option__value`.
- Giá trị không có variant bán được: vẫn bấm được (để thấy Sold out / Unavailable); pill chữ gạch ngang + muted (8.45); swatch gạch chéo 2px foreground có viền trắng 1px. Chữ ẩn ", sold out" / ", unavailable" trong label (không chỉ dựa vào hình, 01).
- Giữ lựa chọn option khác khi đổi một option nếu còn tổ hợp (10 §6 #2712, BE).
- 1 variant hoặc chỉ default variant: không hiện bộ chọn (AC9, code có).

Tồn kho: chấm 8 + chữ 14/500 ngay trên hàng nút. ĐỀ XUẤT chấm `--color-badge-new` cho "In stock" (code đang dùng accent: cam vừa là màu nút vừa là trạng thái tốt, dễ nhầm; xanh theo quy ước success sổ 09/11 toast). Hết hàng: chấm + chữ muted "Sold out". Chữ mang nghĩa, màu chỉ phụ (01).

Số lượng + nút:
- Một hàng: ô số lượng 128 (− 44 · số 40 · + 44) + nút Add To Cart lấp phần còn lại, cách 12. Nhãn "Quantity" 14/600 phía trên ô (form có label thật). ĐỀ XUẤT stepper thay `input number` trần (12 §1 #2151D); không JS vẫn gõ số được. − khoá khi = 1.
- Ô số lượng viền `--color-muted-light` (sổ 09/11), focus viền + outline accent.
- Add To Cart: primary cam, icon túi 20 + "Add To Cart" (sổ 07/11; Figma 1:814). Cao 48 / 52, full phần còn lại.
- Buy It Now (`payment_button`, mặc định bật): full width. Nút unbranded theo `.button--secondary` (viền foreground, hover đảo đen) để Add To Cart nổi nhất (10 §8 #791). Nút có thương hiệu (Shop Pay…) giữ màu của Shopify. "More payment options" link 14 gạch chân, cao 44, giữa.
- Pickup (khi có): dưới Buy It Now, chữ 14, link "Check availability at other stores" (code có).

Hàng cam kết (ĐỀ XUẤT, 10 §9 #803, #836: thông tin ship/đổi trả gần nút): khung viền `--color-border` bo 12 padding 16; 3 mục icon 24 cam + chữ 14: "Fast Shipping" (link shipping policy), "1 Year Warranty", "90 Day Money Back" (link refund policy). Nội dung lấy từ trust bar footer Figma 1:1107, không thêm hứa hẹn mới. 360 xếp dọc, 768 và ≥1280 3 cột, 1024–1279 xếp dọc (cột hẹp).

Không có countdown "Sale ends in" (Figma 1:773) trên trang sản phẩm: xem câu hỏi CTO 3.

## 6. Accordion chi tiết (ĐỀ XUẤT block `product-details`)

Theo foundation §13 (dấu + cam bên trái như Figma 1:1057, hàng ≥ 56, `<details>`, mở được nhiều mục). Nằm cuối buy box.

| Mục | Mặc định | Nội dung |
| --- | --- | --- |
| Features and description | mở | `product.description` (rich text), `max-inline-size: 65ch` |
| Specifications | mở | bảng 4 dòng: nhãn từ setting, giá trị metafield `custom.spec_1..4` (như featured-product). Ẩn dòng thiếu; ẩn mục khi 0 dòng |
| Shipping and returns | đóng | 1 câu + "Read the shipping policy" · "Read the refund policy" (`shop.shipping_policy.url`, `shop.refund_policy.url`) |

- Tiêu đề cụ thể, không dùng "Details", "Info" (09 §1 #766). Mở sẵn 2 mục (15 §6). Phí ship không giấu: ghi chú ship đã ở dưới giá (15 §6).
- Bảng thông số theo Figma 1:798: viền 1px `--color-background-sand`, bo 8, dòng lẻ nền sand; nhãn 14 muted (dòng sand: `--color-background-sand-foreground`), giá trị 16/500 căn phải từ 48rem (360: 14, căn trái, 2 cột 40/60). `<table>` + `<th scope="row">` + caption ẩn. Luôn có đơn vị (10 §7 #857: dữ liệu merchant).

## 7. Pairs Well With (complementary)

- Tiêu đề h2 "Pairs Well With" (ĐỀ XUẤT đổi locale mặc định `heading_complementary` sang Title Case như tiêu đề section Figma). Không eyebrow.
- Thẻ gọn ngang (khác card lưới của §9 để hai khối không lẫn): viền border bo 12 padding 12; ảnh 96 nền cream; tên 16/500 link; giá; nút secondary nhỏ cao 40 "Add To Cart" (tên ẩn ": {product}").
- Lưới: 360 1 cột (4 hàng), 768 2 cột, ≥1280 4 cột. Gap = gutter.
- ĐỀ XUẤT nút thêm giỏ từng sản phẩm (09 §2 #821): cần BE (JSON recommendations + cart add). Không có nút thì thẻ chỉ là link.
- Rỗng (0 kết quả, chưa cài Search and Discovery) hoặc lỗi: ẩn cả khối (code có). Đang tải: skeleton 1 hàng đúng kích thước (trạng thái H).

## 8. Customer Reviews (ĐỀ XUẤT block `product-reviews`, ES1-T264)

Nền cream (section `--color-background-cream`), `id="reviews"` (đích của link rating).
- Trái (4/12 từ 64rem): h2 "Customer Reviews" · điểm "4.9" heading 800 `--font-size-display` · 5 sao 20 + "Based on 341 reviews" 14 muted · nút secondary "Write A Review".
- Phải (8/12): danh sách review của app; mockup dùng card trắng bo 12 padding 24: sao 16, tiêu đề Inter 18/600 (h3), nội dung muted, tên 14/600. 2 cột từ 48rem. Nút secondary "Show More Reviews" dưới danh sách.
- 360: xếp dọc, tóm tắt trên.
- Theme chỉ hiện tóm tắt từ metafield + vùng nhận app block; danh sách, lọc, ảnh khách, phân bố sao (10 §10 #749, #750, #2557) do app. Không metafield và không app: ẩn khối.
- Tương phản: số "4.9" foreground trên cream 15.9; muted trên trắng 8.45.

## 9. You May Also Like (related)

- h2 "You May Also Like" (ĐỀ XUẤT Title Case như §7) + nút 52 đầu khối (sổ 09/11 hàng ngang).
- ≥1280: lưới 4 cột card sản phẩm foundation §9 (không cuộn, ẩn nút và thanh tiến trình). 768: hàng ngang 2.5 card + nút 52 + thanh tiến trình. 360: hàng ngang card 70vw (1.3 card), ẩn nút, vuốt, thanh tiến trình.
- Setting "Columns on desktop" chỉ áp từ 80rem; info hiện tại ("Mobile shows 2 columns and tablet shows 3") phải sửa theo hàng ngang dưới 80rem.
- Card theo foundation §9 (badge -N%, New, Sold out, giá sale, "N colors"). Dữ liệu từ Product Recommendations API (AC7). Rỗng/lỗi: ẩn khối.

## 10. Sticky bar (`product-sticky-bar`)

Hiện khi nút Add To Cart chính ra khỏi màn, ẩn khi quay lại (AC5, code BE có). Fixed đáy, nền trắng, viền trên border, bóng `0 -4 16 foreground 10%`, padding đáy `env(safe-area-inset-bottom)`.

| Mốc | Nội dung | Cao |
| --- | --- | --- |
| 360 | ảnh 48 · tên 14/600 1 dòng "…" + giá sale (ẩn giá gạch) · nút "Add To Cart" (không icon, padding 16) | 72 |
| 768 | ảnh 56 · tên 16/600 + biến thể đang chọn 14 muted + giá + giá gạch · nút có icon | 80 |
| ≥1024 | như 768 + select biến thể (ĐỀ XUẤT, câu hỏi CTO 2) | 80 |

- Hết hàng / tổ hợp không có: nút disabled "Sold out" / "Unavailable" (code có).
- Đang thêm: nút loading như §11 C. Lỗi khi bấm từ thanh: toast error (foundation §17) vì vùng lỗi trong form đang khuất. Toast nằm trên thanh (cách đáy 72 + 16).
- Motion: trượt lên 250ms `--ease-out`, ẩn 200ms; chỉ transform/opacity. Không đẩy layout; body có padding đáy khi thanh hiện (code `data-sticky-bar-visible`).
- ĐỀ XUẤT ẩn thanh khi drawer giỏ, lightbox hay dialog mở (một lớp overlay một lúc, 15).

## 11. Trạng thái (mockup cuối file)

| # | Trạng thái | Thiết kế | Nguồn |
| --- | --- | --- | --- |
| A | Hết hàng toàn bộ | badge Sold out cạnh giá; swatch gạch chéo; ô số lượng khoá (nền alt, viền border); nút disabled "Sold out" (nền `--color-border`, chữ muted 6.70); dòng tồn "Sold out"; ảnh opacity 0.6; không Buy It Now | edge_cases "Hết hàng toàn bộ"; foundation §6; 05 §3 |
| B | Tổ hợp không tồn | pill L gạch ngang; nút disabled "Unavailable"; câu "This combination is unavailable. Choose another size or color." 14 muted dưới hàng nút, nối `aria-describedby` | edge_cases "2 option có tổ hợp không tồn"; 10 §6 #2709. ĐỀ XUẤT chuỗi locale mới |
| C | Đang thêm giỏ | nút giữ bề rộng, chữ trong suốt + spinner 20 trắng, `aria-busy`, không bấm lại; ô số lượng khoá; `role=status` "Adding to cart" | foundation §6; 05 §5 |
| D | Lỗi thêm giỏ | hộp `form-message--error` ngay dưới hàng nút trong `product-form-error` (role alert): "Couldn't add to cart" + câu lỗi 422 của Shopify + cách sửa; không tự ẩn; nút mở lại; số lượng giữ giá trị server | 05 §4; TE-5 AC2 |
| — | Thêm thành công | drawer giỏ mở (TE-5 AC8) hoặc sang trang giỏ theo setting; số giỏ nhảy; không toast | 05 §6; 12 §1 |
| E | Video, 3D | §3 | AC1; 09 §4 #770 |
| F | Lightbox | §3 | 09 §3 |
| G | Sticky bar + toast lỗi | §10 | AC5 |
| H | Đang tải gợi ý | skeleton card (media 1:1 + 2 dòng), shimmer 1.4s, tĩnh khi giảm chuyển động | foundation §18 |
| I | Không media | §3 | edge_cases |

Nhiều biến thể khác trong edge_cases: "Apparel More Variants" (7 màu) swatch xuống dòng, không cuộn ngang; "Sản phẩm số" (Operating system, không cần ship) ẩn dòng ship và pickup (AC9); gift card hiện form người nhận (AC6, foundation §12: label trên, viền muted-light).

Hover / focus / active (mọi phần tử): theo foundation §6–§7. Focus: outline 2px accent offset 2 (pill, swatch: viền ngoài; link ảnh: offset −4 để không bị cắt).

## 12. Settings merchant

Đã có (giữ):

| Block | Tên | Kiểu | Default |
| --- | --- | --- | --- |
| product-info | Show vendor | checkbox | true |
| product-form | Show dynamic checkout buttons | checkbox | true |
| product-recommendations | Heading | text | trống (dùng chuỗi mặc định) |
| product-recommendations | Products to show | range 2–8 | 4 |
| product-recommendations | Columns on desktop | range 2–5 | 4 |

ĐỀ XUẤT thêm (chờ Tech Lead tách ticket):

| Block | Tên | Kiểu | Default | Giới hạn / nguồn |
| --- | --- | --- | --- | --- |
| product-info | Show rating | checkbox | true | ẩn khi không metafield; 10 §10 #786 |
| product-form | Show quantity selector | checkbox | true | 10 §8 #793 |
| product-form | Show assurance list | checkbox | true | 10 §9 |
| product-form | Assurance 1–3 text | text | Fast Shipping / 1 Year Warranty / 90 Day Money Back | Figma 1:1107 |
| product-form | Assurance 1–3 link | url | shipping policy / trống / refund policy | |
| product-details | Specification 1–4 label | text | Weight range / Footprint / Materials / Assembly | Figma 1:798; metafield `custom.spec_1..4` |
| product-details | Open description by default | checkbox | true | 15 §6 |
| product-details | Show shipping and returns | checkbox | true | 10 §9 #803 |
| product-reviews | Heading | text | Customer Reviews | ES1-T264 |
| product-sticky-bar | Show on desktop | checkbox | false | câu hỏi CTO 2 |

Tên sentence case, không ký tự `&`. Không thêm setting màu (dùng token).

## 13. Accessibility

Tương phản (tính tay WCAG; L foreground 0.0103, sand 0.796, cream 0.910, accent 0.160):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| sale / background | 6.38 | giá bán, viền + icon lỗi |
| muted / background | 8.45 | giá gạch, thuế/ship, pill không bán được, gợi ý B |
| accent / background | 5.01 | eyebrow vendor, focus, icon cam kết |
| accent / cream | 4.58 | focus trong khối review |
| foreground / sand | 14.0 | giá trị và nhãn dòng sand bảng thông số |
| muted / sand | 6.81 | (không dùng: nhãn dòng sand đổi sang foreground) |
| muted / border | 6.70 | nút disabled |
| background / foreground | 17.4 | pill đang chọn, nhãn ▶/3D thumbnail |
| viền swatch 50% (#8C8C8C) / background | 3.36 | mép swatch (1.4.11) |
| sao `--color-rating` / background | ~1.6 | chỉ trang trí, nghĩa nằm ở chữ "4.9", "Rated 5 out of 5 stars" |

- Vùng chạm: swatch, pill, nút stepper 44; rating link 44; thumbnail 56–80; nút ảnh 52; đóng lightbox 48; mọi nút ≥ 40 desktop, ≥ 44 mobile (nút nhỏ 40 chỉ ở card complementary ≥768; 360 cùng 40 nhưng cách nhau ≥ 16, đạt target-size 24).
- Bàn phím: thứ tự gallery → thumbnail → option → số lượng → nút → accordion. Radio trong fieldset dùng phím mũi tên. Lightbox bẫy focus (`showModal`), Escape đóng.
- Tên: link ảnh "Open image 1 of 3 in full size"; thumbnail "Load media 2 of 4, video"; stepper "Decrease quantity for {product}"; nút gallery "Previous image"/"Next image"; nút complementary "Add To Cart: {product}"; video "Play video: {title}"; iframe có `title`.
- Live region: `product-form-status` (role status: "Adding to cart", "Added to cart") và `product-form-error` (role alert), có sẵn.
- Alt ảnh: `media.alt`, thiếu thì "{product}, image n of N" (không bịa mô tả ảnh). Thumbnail, ảnh sticky bar, ảnh card gợi ý `alt=""` (tên ở link).
- Một h1 (tên sản phẩm); h2 cho Pairs Well With, Customer Reviews, You May Also Like; h3 cho tên sản phẩm trong card và tiêu đề review.
- Zoom 200%: buy box 1 cột dưới 64rem; hàng ngang có `overflow-x` riêng.

## 14. Lighthouse

Chỉ tiêu: SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90 (sổ 09/11).

- LCP: ảnh đầu gallery (featured media của variant), `loading="eager"` + `fetchpriority="high"`, srcset 360–1800 (code). ĐỀ XUẤT sửa `sizes` theo bố cục mới: `(min-width: 80rem) min(668px, 50vw), (min-width: 64rem) 50vw, 100vw` (code đang `58vw`, tải thừa ~16% ở desktop). Không hiệu ứng reveal cho gallery, h1, giá, nút (màn đầu, chặn LCP); reveal chỉ cho tiêu đề và card từ §7 trở xuống (sổ 09/11).
- Lazy: ảnh gallery 2+, mọi thumbnail, poster video không phải media đầu, ảnh sticky bar, ảnh lightbox (gắn khi mở), ảnh swatch, ảnh complementary/related/review. Video `preload="none"`, iframe YouTube/Vimeo và model-viewer chỉ tải khi bấm.
- Font: 2 họ qua `font_picker`: Sofia Sans Condensed 700/800 (h1, h2, eyebrow, số 4.9), Inter 400/500/600 (còn lại). Không thêm weight.
- CLS: ảnh có width/height + `aspect-ratio` khung; sticky bar, toast, lightbox `position: fixed`; tồn kho/giá đổi trong cùng khung (partial thay nội dung cùng chiều cao); khối gợi ý giữ chỗ skeleton khi đang tải và nằm dưới màn đầu ở 360/768. Rủi ro: ở 1920 khối complementary có thể chạm đáy màn đầu (main ~900px) → skeleton đúng 1 hàng, ẩn khi 0 kết quả chỉ sau khi fetch xong.
- A11y rủi ro đã tránh: sao màu vàng không mang nghĩa một mình; swatch có tên ẩn và mép 3.36:1; nút disabled vẫn 6.70:1; link trong câu ("Shipping") gạch chân (link-in-text-block); bảng thông số có `th scope`; dialog có tên; không `div` bấm được.
- SEO: một h1; breadcrumb `nav` + JSON-LD BreadcrumbList; JSON-LD Product có sẵn (AC11), ĐỀ XUẤT thêm `aggregateRating` khi có metafield rating; link chữ mô tả đích ("Read the shipping policy", không "Learn more"); chữ nhỏ nhất 13 (badge).
- Best Practices: không lỗi console (mockup 0 lỗi ở 4 mốc); ảnh `object-fit: contain` không méo; không xin quyền; payment button do Shopify chèn ngoài partial.

## 15. Token dùng

Chỉ token foundation §2. Dẫn xuất: `--control-height`, `--grid-gap`, `--section-gap`, `--overlay-scrim`, `--shadow-raised`. Giá trị mới (không phải token, viết `calc()`): gap cột 80 = `--space-1 × 20`; bo ảnh 16 = `--radius-card + --space-1`; viền swatch `color-mix(--color-foreground 50%, transparent)`. Không thêm token.

## 16. Map sang code

| Phần | Code hiện có | Việc cho Dev FE (FE) / BE |
| --- | --- | --- |
| Bố cục 2 cột | `.product` 7fr/5fr, `.product__details` sticky | FE: 1fr/1fr, gap 48 → 80 từ 80rem, sticky chuyển sang media |
| Gallery | `.product-media__*` xếp dọc từ 64rem | FE: 1 ảnh + thumbnail mọi mốc, tỉ lệ 4:3 ở 48–64rem, tràn mép <48rem, đếm ảnh, nút 52 (`round-button`); BE: nút trước/sau, đồng bộ `aria-current` |
| Lightbox | `.product-media__dialog` | FE: nền cream, đếm, nút 52, thumbnail; BE: chuyển ảnh trong dialog |
| Giá, rating | `snippets/price`, `snippets/rating-stars` | FE: cỡ giá h3, badge -N%, hàng rating link `#reviews` |
| Mô tả | trong `product-info` | FE: chuyển sang accordion `product-details` |
| Option | `.product-option__value(--swatch)` | FE: legend có giá trị chọn, viền swatch 50%, vòng chọn 2px |
| Số lượng | `.product-form__quantity` | FE: markup stepper; BE: nút −/+ |
| Tồn kho | `.product-form__inventory` | FE: chấm badge-new, đặt trên hàng nút |
| Nút, Buy It Now | `.product-form__add`, `__payment-button` | FE: cùng hàng số lượng, icon túi; unbranded = secondary |
| Gợi ý | `product-recommendations` | FE: dạng gọn cho complementary, hàng ngang cho related <80rem; BE: nút thêm giỏ complementary, skeleton |
| Review | — | chờ ES1-T264 |
| Sticky bar | `product-sticky-bar` | FE: bố cục 3 mốc; BE: toast lỗi, ẩn khi overlay mở |

## 17. Quyết định CTO cần chốt

1. Khối Customer Reviews: theme làm block `product-reviews` hiện tóm tắt từ metafield `reviews.rating` + chừa chỗ app block (danh sách review do app), ẩn khi không có dữ liệu? Đề xuất: có (chi tiết ES1-T264).
2. Sticky bar có hiện trên tablet và desktop (thêm biến thể đang chọn, select biến thể từ 1024) hay chỉ mobile như AC5? Đề xuất: hiện mọi mốc, setting "Show on desktop" mặc định tắt để giữ AC5, merchant bật khi trang dài (09 §1 #784).
3. Countdown "Sale ends in" (Figma 1:773) chỉ ở khối Featured product trang chủ, không đưa lên trang sản phẩm? Đề xuất: không đưa, vì không có ngày hết sale thật cho từng sản phẩm (đếm giả là dark pattern) và nó chen giữa giá và nút (10 §8 #789).
