KHÔNG CHẮC: (1) ảnh của sản phẩm Ativafit Lava 66 lb Adjustable (handle trên store dev còn tiền tố cũ) là áo tạ, không phải tạ tay (lệch tên, ES1-T245); mockup giữ đúng URL, alt trung tính. Ảnh một số sản phẩm gợi ý cũng lệch tên. (2) demo-data không có description, metafield rating, spec: mô tả, 4 dòng spec, 4.9 / 341 reviews lấy theo khối featured product trang chủ; review mẫu lấy từ chữ khối testimonial trang chủ. (3) Review: CTO chốt 10/11 (metafield rating + app block); app cụ thể vẫn chờ ES1-T264. (4) nút CTA bo 4 theo token `--radius-button` (mặc định `button_corner_radius` = 4): mockup giữ token, không ngoại lệ; ghi chú cũ cho foundation (ES1-T251), không đổi token ở trang này. (5) demo-data chưa có sản phẩm 3 option / 40 giá trị và metafield `custom.sale_ends_at`: trạng thái J và K dùng dữ liệu mẫu ghi rõ trên mockup; hỏi CTO ở ES1-T282. (6) Partial name mới (`product-options`, `product-countdown`, `product-buy-buttons`) là ĐỀ XUẤT; architecture.md hiện chỉ liệt kê `product-media`, `product-price`.

# UI spec: Trang sản phẩm (ES1-T253, vòng 3b)

## Thay đổi audit (ES1-T284, audit ES1-T283 A1, A2, A24)

Bộ chọn biến thể chuyển thành component chung PDP / quickview / card: `docs/ui-spec/variant-picker.md`. Mâu thuẫn giữa file này và variant-picker.md thì variant-picker.md thắng. Thay các dòng 1–3 của bảng vòng 3b.

| # | Thành phần | Vòng 3b | Audit | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Ngưỡng thu gọn | > 12 giá trị, 11 + "+N" | > 10 giá trị, 7 + "+N", hằng chung | Sổ 10/11 M5; variant-picker §5 |
| 2 | Setting "Options with many values" | Buttons, collapsed / Dropdown | bỏ (§12); không dropdown, mockup bỏ J3 dropdown | Sổ M5 |
| 3 | Tổ hợp không tồn tại | viền đứt, không gạch | gạch chữ + viền đứt (swatch: gạch chéo + vòng đứt), như quickview | variant-picker §4 |
| 4 | Nút "+N" | pill trắng viền foreground | pill nền alt viền muted-light + caret, ô thứ 8 | variant-picker §5 |
| 5 | Focus sau khi mở | ở lại nút "Show fewer" cuối danh sách | vào giá trị đầu tiên vừa hiện; "Show fewer" ô cuối lưới, thu lại về "+N" | variant-picker §5 |
| 6 | Đang tải | spinner legend + skeleton giá và tồn + nút spinner | skeleton giá + "Checking availability…" có spinner 12 + nút giữ màu `aria-disabled` | variant-picker §6 |
| 7 | Lỗi tải | chữ đỏ + nút chữ "Try again" | chữ đỏ + icon + nút secondary nhỏ "Try again" cao 44 | variant-picker §6 |
| 8 | Nhãn nút | "Sold out", "Try again" | Sentence case: "Sold out", "Try again", "Show fewer", "Choose options" | CTO 21/11 (ES1-T567), thay sổ 07/11 |
| 9 | Khung J | J1 11 + "+29", J2 mở + tải, J3 dropdown + lỗi | J0 bảng trạng thái, J1 7 + "+33", J2 mở hết + focus, J3 đang tải, J4 lỗi | ticket ES1-T284 |
| 10 | §17 dữ liệu | in 11 + "+N" | trỏ variant-picker §2, §5, §12; giữ phần riêng PDP (partial, JSON-LD) | |

## Thay đổi vòng 3b

| # | Thành phần | Vòng 3 | Vòng 3b | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Bộ chọn option | pill/swatch, gạch ngang chung cho hết hàng và không tồn tại | dựng từ `product.options_with_values` (≤ 3 option, mỗi option nhiều giá trị), không lặp `product.variants`, không nhúng JSON biến thể; 3 trạng thái mỗi giá trị: còn hàng / hết hàng (gạch ngang) / tổ hợp không tồn tại (viền đứt); đổi lựa chọn tải biến thể từ server theo option value, cập nhật URL, giá, ảnh, nút | CTO 10/11 mục 1; shopify.com/blog/2048-variants; §5.1, §17 |
| 2 | Option nhiều giá trị | không có | > 12 giá trị: lưới ô 72, hiện 11 + nút "+N" mở hết tại chỗ, "Show fewer" thu lại; setting chuyển sang dropdown; không vỡ ở 360 (4 ô/hàng) | CTO 10/11 mục 1; 10 §6 #850 |
| 3 | Đang tải / lỗi khi đổi lựa chọn | không có | spinner 16 trong legend, skeleton phủ giá và tồn, nút Add to cart `aria-busy`; lỗi đỏ + icon + "Try again", lựa chọn quay về biến thể cuối đã tải | CTO 10/11 mục 1; 05 §5 |
| 4 | Sticky bar | mọi mốc, "Show on desktop" mặc định tắt, ≥1024 có select biến thể | mọi mốc, mặc định BẬT; bỏ select biến thể (trái quy tắc 2048), ≥1024 thêm ô số lượng; lựa chọn không mua được thì nút "Choose options"; mockup có thanh dính thật ở đáy cả 4 mốc | CTO 10/11 mục 2 (P2); 09 §1 #784 |
| 5 | Countdown "Sale ends in" | không đưa lên trang | có, giữa tên và giá (CTO 10/11); ngày từ metafield `custom.sale_ends_at` (date_time); ẩn khi không ngày, quá hạn lúc render, không giảm giá, hết hàng; trạng thái ≥ 24 giờ, < 1 giờ (ô cam), hết giờ khi đang xem, không countdown | CTO 10/11 mục 3 (P3); TE-13 AC1 |
| 6 | Review | đề xuất, chờ CTO | chốt: tóm tắt từ metafield rating + vùng app block, ẩn khi không dữ liệu | CTO 10/11 mục 4 (P1) |
| 7 | JSON-LD Product | offers theo variant (AC11) | ĐỀ XUẤT offers chỉ biến thể đang chọn + `AggregateOffer` (`price_min`/`price_max`), không lặp mọi biến thể | 2048 variants; §17 |
| 8 | Mục cuối spec | "Quyết định CTO cần chốt" | "Quyết định CTO đã chốt (10/11)" + 2 câu mới | ticket vòng 3b |

## Thay đổi so với vòng 2

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header | A nền trắng viền dưới, sticky | thanh tối `--color-background-dark` + noise, cao 80, logo 100 × 30, menu trắng 60%, search 20 / account, cart 24; sticky, không đè ảnh | Sổ 10/11; foundation §3 |
| 2 | Nút trước/sau 52 (gallery, lightbox, You May Also Like) | icon mũi tên 20 × 16 | chevron 11 × 16 trong khung 52 (`slideshow-icon` previous/next); trắng viền border, hover cam | Sổ 09/11; foundation §6 |
| 3 | Gallery dính | top = header trắng 80 + 24 | giữ 80 + 24, header tối sticky cùng cao (không đổi số) | foundation §3.1 |
| 4 | Hàng rating | "4.9" foreground + "341 reviews" gạch chân | "(4.9)" + vạch + "341 reviews" chữ muted 14; gạch chân + foreground khi hover | Kit (`drafts/designer/_kit/kit.css`) |
| 5 | Card review | sao trên, tiêu đề 600, tên cuối card, bo 12 | hàng đầu tên (trái) + sao (phải), tiêu đề Inter 18/700, quote 16/28 muted, bo 16; bỏ ảnh và sản phẩm đính kèm của testimonial | Kit (`drafts/designer/_kit/kit.css`) |
| 6 | Footer | newsletter 2 cột, 3 social, wordmark tách hàng | theo foundation vòng 3: ảnh 96 × 120 + chữ + form, panel dải rộng bo 16, 4 social, wordmark giữa hàng cuối với copyright và localization | foundation §4 |
| 7 | Lựa chọn thiết kế ghi nhận | — | Nút bo 4 (token `--radius-button`); nền xám #E5E5E5 không dùng cho Buy it now vì trùng nút disabled foundation §6; quote #808080 (3.95:1) đổi `--color-muted`; dấu tròn "Feature Product" là trang trí khối trang chủ, không đưa lên gallery | Kit (`drafts/designer/_kit/kit.css`) |

Giữ nguyên nội dung, bố cục 2 cột, accordion, trạng thái A–I và settings của vòng 2. Vòng 3b giữ toàn bộ vòng 3, chỉ sửa các mục trong bảng "Thay đổi vòng 3b"; thêm trạng thái J (2048 biến thể) và K (countdown).

Mục đích: người mua xem ảnh/video/3D, chọn biến thể và thấy giá, tồn, nút cập nhật ngay, thêm giỏ hoặc mua nhanh, đọc mô tả, thông số, review, rồi tìm sản phẩm mua kèm hoặc thay thế. Story TE-4 (AC1–AC12), `docs/srs.md#TE-4`.

Template: `templates/product.liquid`. Block hiện có: `product-media`, `product-info`, `product-form`, `product-sticky-bar`, `product-recommendations` (related, complementary).

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T253/product.html` (nhúng `../_kit/kit.css`) + `product-360|768|1280|1920.png`. Trạng thái A–I ở cuối file.
- Bộ chọn biến thể chung: `docs/ui-spec/variant-picker.md` (ES1-T284). Tính năng Shopify trên buy box (pickup, unit price, selling plan, B2B, installments, gift card…): `docs/ui-spec/product-shopify-features.md` (ES1-T288). Đồng hồ: `docs/ui-spec/countdown.md`.

Nguồn: sổ quyết định CTO > kit + mockup (`drafts/designer/**`, nguồn chuẩn CTO 21/11) > DESIGN.md > AGENTS.md > kiến thức. Ngôn ngữ buy box lấy từ khối Featured product trang chủ; thành phần chung theo `docs/ui-spec/foundation.md` (ES1-T251). Mọi phần không có ở trang chủ ghi `ĐỀ XUẤT:` kèm nguồn.

---

## 1. Thứ tự khối

| # | Khối | Block | Ghi chú |
| --- | --- | --- | --- |
| 1 | Header tối (#1A1A1A + noise, cao 80, sticky, không đè ảnh) | `header` | Sổ quyết định 10/11; foundation §3 |
| 2 | Breadcrumb | — (foundation §5) | Home / {collection} / {product} |
| 3 | Gallery + buy box (có countdown khi có sale có hạn) | `product-media`, `product-info`, `product-form` | §3–§6 |
| 4 | Pairs Well With | `product-recommendations` intent complementary | §7 |
| 5 | Customer Reviews | block mới `product-reviews` (CTO chốt 10/11) | §8, ES1-T264 |
| 6 | You May Also Like | `product-recommendations` intent related | §9 |
| 7 | Footer | `footer` | foundation §4 |
| — | Sticky bar | `product-sticky-bar` | §10 |

ĐỀ XUẤT: đổi thứ tự template thành main → complementary → reviews → related (hiện related trước complementary). Nguồn: 09 §2 #811 audit (mua kèm ngay dưới sản phẩm), 09 §1 thứ tự Baymard (review trước cross-sell thay thế), 09 §1 audit (hai lưới sản phẩm liền nhau bị hoà vào nhau: complementary dạng hàng ngang gọn, related dạng card, review nền cream ở giữa ngăn cách).

Không dùng tab ngang cho mô tả / thông số / review (09 §1 #753). Không đặt cross-sell trên ảnh, tên, giá, nút (09 §1 #738).

## 2. Lưới theo mốc

| Giá trị | 360 | 768 | 1280 | 1920 | Token / nguồn |
| --- | --- | --- | --- | --- | --- |
| Bố cục main | 1 cột | 1 cột | 2 cột bằng nhau | 2 cột bằng nhau | 2 cột bằng nhau (lưới 12 cột: 6 + 6) |
| Khoảng giữa 2 cột | — | — | 80 | 80 | `--space-6xl` 80 (Chuẩn: Polaris React space 80px); 40 ở 1024–1279 (`--space-3xl`) |
| Bề rộng gallery / buy box | 360 (tràn mép) / 320 | 728 / 728 | 580 / 580 | 668 / 668 | |
| Tỉ lệ ảnh chính | 1:1 | 4:3 | 1:1 | 1:1 | ĐỀ XUẤT 4:3 ở tablet để tên + giá hiện trong màn 1024 cao (09 §1 #757 top-block 0.5–1.5 màn) |
| Bo ảnh chính | 0 | 16 | 16 | 16 | `--radius-card + --space-1` (`--radius-panel`) |
| Thumbnail | 56 | 64 | 80 | 80 | gap 12; code hiện 64 cố định |
| h1 | 33 | 43 | 48 | 48 | `--font-size-h1` + `--line-height-h1` (40/48 → 48/56, bội 4; THAY 21/11, ES1-T567) |
| Giá | 22 | 24 | 27 | 28 | `--font-size-h3`, Inter 600 |
| Nút, ô số lượng | 48 | 48 | 52 | 52 | `--control-height` |
| Padding main | 8 / 48 | 8 / 48 | 24 / 120 | 24 / 120 | trên / dưới |
| Khoảng trong buy box | 24 | 24 | 24 | 24 | `--space-xl` 24 |

- Từ 64rem gallery dính (`position: sticky`, top = header 80 + 24), buy box cuộn. ĐỀ XUẤT thay code hiện tại (code dính cột chi tiết, xếp dọc mọi ảnh): buy box dài hơn ảnh vì có accordion, nên dính ảnh giữ ảnh trong tầm mắt khi đọc thông số (09 §3 #1217M ảnh và lựa chọn cùng viewport).
- 360: ảnh tràn mép màn (margin âm bằng `--page-margin`), không bo; thumbnail, chữ, nút giữ lề 20. ĐỀ XUẤT, 09 §3 mobile (ảnh chính lớn, chiếm phần lớn màn hình).
- 768: thiết kế riêng, không phải 360 phóng to: ảnh 4:3 rộng 728 có nút 52; hàng cam kết 3 cột; bảng thông số giá trị căn phải; hàng gợi ý cuộn ngang 2.5 card.

## 3. Gallery (`product-media`)

Anatomy: track ảnh (scroll-snap) · nút phóng to (ảnh là link tới bản 2048, icon kính lúp 44 trắng góc phải trên, chỉ trang trí) · bộ đếm "1 / 3" (pill trắng, `aria-hidden`) · nút trước/sau tròn 52 góc phải dưới (≥768) · hàng thumbnail.

- Thứ tự media: featured media của variant đang chọn trước (code đã có). Đổi variant thì track trượt tới ảnh variant (AC1).
- Nút 52: chevron 11 × 16 (`snippets/slideshow-icon`), trắng viền `--color-border`, hover nền cam icon trắng + scale 1.06 (sổ quyết định 09/11). Hai nút cách 8. Ở đầu/cuối: cặp màu disabled (viền `--color-border`, icon `--color-muted-light`, không opacity; sổ 21/11) + `aria-disabled`. 360: ẩn nút, vuốt.
- Thumbnail: nền cream, viền 1px `--color-border`, bo 4 (8 từ 80rem); đang xem viền 2px foreground (ĐỀ XUẤT, code 1px: 1px foreground khó thấy khác hover); hover viền foreground. Thumbnail hiện cả trên mobile (09 §3 #774M). Video: nhãn ▶ đen góc phải dưới; 3D: nhãn "3D". Chỉ hiện khi ≥ 2 media.
- Không lặp badge giảm giá trên ảnh: -24% đặt cạnh giá (10 §8 không lặp khuyến mãi).
- Hover ảnh desktop: con trỏ zoom-in. Không làm hover zoom ở bản này (06 §6 gợi ý; ĐỀ XUẤT để sau vì phải tải ảnh 2048 khi rê chuột, chạm Performance).
- Video (`video`): poster + nút "Play video" pill đen giữa ảnh (icon ▶ trong tròn trắng 40), `preload="none"`, không tự chạy, có `controls`. Ngoài (YouTube/Vimeo): iframe chỉ chèn khi bấm (code `<template>`). 3D (`model`): poster + nút "View in 3D", `reveal: interaction`. Mockup trạng thái E.
- Không media (`edge_cases` "Sản phẩm không có media"): 1 ô placeholder cream, icon ảnh `--color-muted-light`, không thumbnail, không nút phóng to. Trạng thái I.

Lightbox (`product-media__dialog`), trạng thái F:
- Toàn màn mọi mốc. Ngoại lệ quy tắc "không popup full-screen trên điện thoại" (15) vì là trình xem ảnh: 09 §3 ảnh phóng to chiếm 80–100%.
- ĐỀ XUẤT nền `--color-background-cream` (ảnh sản phẩm nền cream, hoà như card) thay backdrop tối 60% của code; đếm ảnh trái trên 14/600; nút đóng 48 phải trên cách mép 12; ≥768 nút 52 hai bên giữa dọc; hàng thumbnail 64 ở đáy; mobile vuốt ngang.
- Mở 300ms fade + scale 0.97, đóng 200ms (foundation §19). Escape đóng, trả focus về link ảnh đã mở. `aria-label="Zoomed image"` (code có).

## 4. Buy box: phần đầu (`product-info`)

Thứ tự (CTO 10/11 + 09 §1 thứ tự Baymard): eyebrow vendor → h1 → countdown (khi có, §4.2) → giá → rating → ghi chú thuế/ship.

| Phần tử | Kiểu | Màu | Nguồn |
| --- | --- | --- | --- |
| Vendor | eyebrow 16/800 uppercase, letter-spacing 0.04em | `--color-accent` (5.01) | Eyebrow accent (role Brand), sổ 09/11; setting `show_vendor` có sẵn |
| Tên | h1 heading 700, đầy đủ không cắt | foreground | AC3 |
| Giá bán | Inter 600 `--font-size-h3` | `--color-sale` khi giảm (6.38), foreground khi không | ĐỀ XUẤT cỡ ≈ tên (10 §8 #792) chỉ 16px vì là khối trang chủ |
| Giá gạch | 16/500 line-through | `--color-muted` (8.45) | tăng 1 bậc theo giá bán |
| Badge -N% | pill 28, 13/600 | sale / sale-foreground | N tính từ compare_at_price |
| Rating | 5 sao 16 + "(4.9)" + vạch 1px + "341 reviews", 14/400 | sao `--color-rating`, chữ `--color-muted` (8.45); hover "341 reviews" foreground + gạch chân | metafield `reviews.rating`, `reviews.rating_count` (như featured-product) |
| Thuế, ship | 14/400 | muted | code (`taxes_included`, `shipping_at_checkout_html`) |

- Giá, gạch, badge cùng một hàng, cách 8–12 (10 §8 gộp nhóm giá, nhãn giảm sát giá).
- Rating là 1 link tới `#reviews` (10 §10 #786), cao 44 (vùng chạm mobile). Tên đọc: "Rated 4.9 out of 5 stars, 341 reviews". Không có metafield thì ẩn cả hàng (SRS TE-13 AC2 cùng quy tắc).
- Mô tả không đặt trong phần đầu (khác khối featured product trang chủ): mô tả dài đẩy nút ra khỏi màn đầu. Mô tả nằm trong accordion mở sẵn §6 (09 §1 #751, 10 §8 #789). Code hiện in `product.description` trước form: Dev FE chuyển xuống.
- Unit price (edge_cases "Unit price"): dòng 14 muted ngay dưới giá, "$X / 100 g" theo snippet `price` (10 §8 #817).
- Giá theo variant đổi tại chỗ qua partial `product-price` (AC2).

### 4.2 Countdown "Sale ends in" (vòng 3b, CTO chốt 10/11)

Hình cùng kiểu khối featured product trang chủ (ES1-T252, `docs/ui-spec/index.md`): khung nền `--color-background-dark` bo 8, cao 60, chữ "Sale ends in" Inter 16/500 trắng, ô số bo 8 viền `color-mix(--color-background-dark-foreground 12%, --color-background-dark)` (≈ #333), số Inter 700 `tabular-nums`. Không thêm nhãn đơn vị (giữ như trang chủ).

| Giá trị | 360 | 768 | 1280 / 1920 |
| --- | --- | --- | --- |
| Padding ngang khung | 16 | 24 | 24 |
| Ô số | 40 × 40, số 16 | 44 × 44, số 18 | 44 × 44, số 18 |
| Khoảng giữa ô | 4 | 12 | 12 |
| Rộng tối đa (4 ô) | 311 ≤ 320 | 368 | 368 |

Dữ liệu (không đếm ngược giả, 15 §1 fake urgency, R8):
- ĐỀ XUẤT metafield sản phẩm `custom.sale_ends_at`, kiểu `date_time` (cùng namespace `custom` với `custom.spec_1..4`). Merchant nhập ngày giờ kết thúc sale thật của sản phẩm. Countdown chỉ hiển thị, không đổi giá: merchant phải tự kết thúc giá gạch đúng giờ (ghi trong info của setting).
- Hiện khi đủ 4 điều kiện: có metafield; ngày còn trong tương lai lúc render; variant đang chọn có `compare_at_price > price`; variant còn hàng. Thiếu một điều kiện: Liquid không in khối, không chừa chỗ (K4). Đổi variant: partial `product-countdown` trả lại khối hoặc rỗng (cùng lúc với giá).
- Ô ngày chỉ hiện khi còn ≥ 24 giờ (4 ô: ngày, giờ, phút, giây, K1); dưới 24 giờ 3 ô giờ, phút, giây (22 · 36 · 28, như TE-13 AC1).
- Sắp hết (< 1 giờ, K2): ô nền `--color-accent`, số trắng (5.01:1). Không nhấp nháy, không đổi kích thước. ĐỀ XUẤT, nguồn 05 §3 (trạng thái rõ), sổ 09/11 (cam cho phần nhấn).
- Hết giờ khi đang xem (K3): giữ khung 60, thay ô số bằng chữ "This sale has ended" (trắng 60%, 6.93:1). Không ẩn khối để không xô bố cục (CLS). Tải lại trang thì Liquid không in khối. ĐỀ XUẤT, nguồn 06 (CLS), foundation §18.
- Số in từ Liquid lúc render, JS chỉ đếm tiếp (như trang chủ, ES1-T276). JS kiểm lại khi tải: nếu trang được cache và đã quá hạn thì chuyển ngay sang K3.

Accessibility:
- `<p role="timer">`: ô số `aria-hidden="true"`; chữ ẩn "Sale ends on November 11, 2026 at 11:59 PM EST" (ngày giờ đầy đủ theo giờ store, qua `| date` + locale). Không `aria-live`, không đọc từng giây.
- Tương phản: trắng / #1A1A1A 17.4; trắng / accent 5.01; viền ô chỉ trang trí.
- Không chạy chuyển động; chỉ đổi số. Giảm chuyển động: vẫn đổi số (đây là thông tin, không phải hiệu ứng). Rủi ro WCAG 2.2.2 (nội dung tự cập nhật): câu CTO 1 §19.

## 5. Buy box: form (`product-form`)

Ngăn với phần đầu bằng gạch 1px `--color-border`, padding-top 24.

Anatomy: bộ chọn option (fieldset/option) · dòng tồn kho · số lượng + Add to cart · Buy it now + "More payment options" · pickup (khi có) · hàng cam kết · accordion.

### 5.1 Bộ chọn option (component chung, ES1-T284)

Toàn bộ quy tắc ở `docs/ui-spec/variant-picker.md`: dữ liệu theo option value (§2), pill và swatch chuẩn Shopify (§3), 3 trạng thái giá trị + đang chọn, hover, focus (§4), option > 10 giá trị hiện 7 + "+N" và "Show fewer" (§5), đang tải, xong, lỗi "Try again" (§6), a11y (§7). Không lặp lại ở đây. Mockup khung J.

Phần riêng của trang sản phẩm:
- Vị trí: đầu `product-form`, trên dòng tồn; fieldset cách nhau 24, legend cách giá trị 12.
- Bề rộng vùng chứa = buy box: 320 / 728 / 580 / 668 → lưới thu gọn 4 / 9 / 7 / 8 ô mỗi hàng (variant-picker §5). Dữ liệu mẫu J (ES1-T282): Weight 40 giá trị → 7 + "+33" (≤ 2 hàng ở mọi mốc).
- Đổi lựa chọn (AC2) cập nhật thêm countdown (§4.2, ẩn cùng khối giá khi đang tải), gallery (featured media của biến thể, AC1), sticky bar (§10); URL `?variant=` bằng `history.replaceState`.
- Kết quả không mua được: nút "Sold out" / "Unavailable" disabled, câu gợi ý trạng thái B; sticky bar "Choose options" (§10).
- Partial PDP và JSON-LD: §17.
- 1 biến thể hoặc chỉ default variant: không hiện bộ chọn (AC9, code có).

Tồn kho: chấm 8 + chữ 14/500 ngay trên hàng nút. ĐỀ XUẤT chấm `--color-badge-new` cho "In stock" (code đang dùng accent: cam vừa là màu nút vừa là trạng thái tốt, dễ nhầm; xanh theo quy ước success sổ 09/11 toast). Hết hàng: chấm + chữ muted "Sold out". Chữ mang nghĩa, màu chỉ phụ (01).

Số lượng + nút:
- Một hàng: ô số lượng 128 (− 44 · số 40 · + 44) + nút Add to cart lấp phần còn lại, cách 12. Nhãn "Quantity" 14/600 phía trên ô (form có label thật). ĐỀ XUẤT stepper thay `input number` trần (12 §1 #2151D); không JS vẫn gõ số được. − khoá khi = 1.
- Ô số lượng viền `--color-muted-light` (sổ 09/11), focus viền + outline accent.
- Add to cart: primary cam, icon túi 20 + "Add to cart" (sentence case, CTO 21/11). Cao 48 / 52, full phần còn lại.
- Nút thanh toán nhanh có thương hiệu (Shop Pay, Apple Pay, G Pay, PayPal) do Shopify chọn và vẽ: giữ nguyên màu, theme chỉ chỉnh chiều cao/bo qua biến CSS chính thức (foundation §27).
- Buy it now (`payment_button`, mặc định bật): full width. Nút unbranded theo `.button--secondary` (viền foreground, hover đảo đen) để Add to cart nổi nhất (10 §8 #791). Nút có thương hiệu (Shop Pay…) giữ màu của Shopify. "More payment options" link 14 gạch chân, cao 44, giữa.
- Pickup (khi có): dưới Buy it now, chữ 14, link "Check availability at other stores" (code có).

Hàng cam kết (ĐỀ XUẤT, 10 §9 #803, #836: thông tin ship/đổi trả gần nút): khung viền `--color-border` bo 12 padding 16; 3 mục icon 24 cam + chữ 14: "Fast Shipping" (link shipping policy), "1 Year Warranty", "90 Day Money Back" (link refund policy). Nội dung lấy từ trust bar footer, không thêm hứa hẹn mới. 360 xếp dọc, 768 và ≥1280 3 cột, 1024–1279 xếp dọc (cột hẹp).

Countdown "Sale ends in" ở phần đầu buy box, xem §4.2.

## 6. Accordion chi tiết (ĐỀ XUẤT block `product-details`)

Theo foundation §13 (dấu + cam bên trái , hàng ≥ 56, `<details>`, mở được nhiều mục). Nằm cuối buy box.

| Mục | Mặc định | Nội dung |
| --- | --- | --- |
| Features and description | mở | `product.description` (rich text), `max-inline-size: 65ch` |
| Specifications | mở | bảng 4 dòng: nhãn từ setting, giá trị metafield `custom.spec_1..4` (như featured-product). Ẩn dòng thiếu; ẩn mục khi 0 dòng |
| Shipping and returns | đóng | 1 câu + "Read the shipping policy" · "Read the refund policy" (`shop.shipping_policy.url`, `shop.refund_policy.url`) |

- Tiêu đề cụ thể, không dùng "Details", "Info" (09 §1 #766). Mở sẵn 2 mục (15 §6). Phí ship không giấu: ghi chú ship đã ở dưới giá (15 §6).
- Bảng thông số = `.data-table--striped` của kit: viền 1px `--color-background-sand`, bo 8, dòng lẻ nền sand; nhãn 14 muted (dòng sand: `--color-background-sand-foreground`), giá trị 16/500 căn phải từ 48rem (360: 14, căn trái, 2 cột 40/60). `<table>` + `<th scope="row">` + caption ẩn. Luôn có đơn vị (10 §7 #857: dữ liệu merchant).

## 7. Pairs Well With (complementary)

- Tiêu đề h2 "Pairs Well With" (ĐỀ XUẤT đổi locale mặc định `heading_complementary` sang Title Case như các tiêu đề section khác; tiêu đề giữ Title Case, chờ CTO). Không eyebrow.
- Thẻ gọn ngang (khác card lưới của §9 để hai khối không lẫn): viền border bo 12 padding 12; ảnh 96 nền cream; tên 16/500 link; giá; nút secondary nhỏ cao 40 "Add to cart" (tên ẩn ": {product}").
- Lưới: 360 1 cột (4 hàng), 768 2 cột, ≥1280 4 cột. Gap = gutter.
- ĐỀ XUẤT nút thêm giỏ từng sản phẩm (09 §2 #821): cần BE (JSON recommendations + cart add). Không có nút thì thẻ chỉ là link.
- Rỗng (0 kết quả, chưa cài Search and Discovery) hoặc lỗi: ẩn cả khối (code có). Đang tải: skeleton 1 hàng đúng kích thước (trạng thái H).

## 8. Customer Reviews (block `product-reviews`, CTO chốt 10/11; app cụ thể ES1-T264)

Nền cream (section `--color-background-cream`), `id="reviews"` (đích của link rating).
- Trái (4/12 từ 64rem): h2 "Customer Reviews" · điểm "4.9" heading 800 `--font-size-display` · 5 sao 20 + "Based on 341 reviews" 14 muted · nút secondary "Write a review".
- Phải (8/12): danh sách review của app; mockup dùng thân card testimonial trang chủ: card trắng bo 16 padding 24 · hàng đầu tên 16/400 trái + sao 16 phải · tiêu đề Inter 18/700 (h3) · quote 16/28 `--color-muted` (AA 8.45:1; xám #808080 chỉ 3.95:1, không dùng). Bỏ ảnh và sản phẩm đính kèm (đang ở chính trang sản phẩm). Badge Verified mặc định tắt (sổ 06/11, E9). 2 cột từ 48rem. Nút secondary "Show more reviews" dưới danh sách.
- 360: xếp dọc, tóm tắt trên.
- Theme chỉ hiện tóm tắt từ metafield + vùng nhận app block; danh sách, lọc, ảnh khách, phân bố sao (10 §10 #749, #750, #2557) do app. Không metafield và không app: ẩn khối.
- Tương phản: số "4.9" foreground trên cream 15.9; muted trên trắng 8.45.

## 9. You May Also Like (related)

- h2 "You May Also Like" (ĐỀ XUẤT Title Case như §7) + nút 52 đầu khối (sổ 09/11 hàng ngang).
- ≥1280: lưới 4 cột card sản phẩm foundation §9 (không cuộn, ẩn nút và thanh tiến trình). 768: hàng ngang 2.5 card + nút 52 + thanh tiến trình. 360: hàng ngang card 70vw (1.3 card), ẩn nút, vuốt, thanh tiến trình.
- Setting "Columns on desktop" chỉ áp từ 80rem; info hiện tại ("Mobile shows 2 columns and tablet shows 3") phải sửa theo hàng ngang dưới 80rem.
- Card theo foundation §9 (badge -N%, New, Sold out, giá sale, "N colors"). Dữ liệu từ Product Recommendations API (AC7). Rỗng/lỗi: ẩn khối.

## 10. Sticky bar (`product-sticky-bar`)

Thanh mua dính đáy ở MỌI mốc; setting "Show on desktop" mặc định BẬT (CTO 10/11, P2). Mockup: thanh thật fixed ở đáy cả 4 PNG (360, 768, 1280, 1920) + khung trạng thái G. Hiện khi nút Add to cart chính ra khỏi màn, ẩn khi quay lại (AC5, code BE có). Desktop đặt đáy (09 §1 #784: bottom bar dễ thấy nhất, không che header). Fixed đáy, nền trắng, viền trên border, bóng `0 -4 16 foreground 10%`, padding đáy `env(safe-area-inset-bottom)`.

| Mốc | Nội dung | Cao |
| --- | --- | --- |
| 360 | ảnh 48 · tên 14/600 1 dòng "…" + giá sale (ẩn giá gạch) · nút "Add to cart" (không icon, padding 16) | 72 |
| 768 | ảnh 56 · tên 16/600 + biến thể đang chọn 14 muted (`variant.title`, vd "Black / Pair / 45 lb") + giá + giá gạch · nút có icon | 80 |
| ≥1024 | như 768 + ô số lượng 48 (đồng bộ với ô trong form) | 80 |

- Vòng 3b bỏ select biến thể ở ≥1024: select cần danh sách biến thể, trái quy tắc 2048. Thay bằng ô số lượng (09 §1 #784 ghi chú audit: "đi cùng số lượng, không phải lựa chọn màu").
- Hết hàng: nút disabled "Sold out". Lựa chọn hiện tại là tổ hợp không tồn tại hoặc chưa đủ option: nút secondary "Choose options", bấm cuộn mượt về bộ chọn và focus option đầu tiên chưa hợp lệ (ĐỀ XUẤT, 05 §3: không để nút chết mà không chỉ cách sửa). Dòng biến thể ghi "Gold / L · Unavailable".
- Đang thêm: nút loading như §11 C. Lỗi khi bấm từ thanh: toast error (foundation §17) vì vùng lỗi trong form đang khuất. Toast nằm trên thanh (cách đáy 72 + 16).
- Motion: trượt lên 250ms `--ease-out`, ẩn 200ms; chỉ transform/opacity. Không đẩy layout; body có padding đáy khi thanh hiện (code `data-sticky-bar-visible`).
- ĐỀ XUẤT ẩn thanh khi drawer giỏ, lightbox hay dialog mở (một lớp overlay một lúc, 15).

## 11. Trạng thái (mockup cuối file)

| # | Trạng thái | Thiết kế | Nguồn |
| --- | --- | --- | --- |
| A | Hết hàng toàn bộ | badge Sold out cạnh giá; swatch gạch chéo; ô số lượng khoá (nền alt, viền border); nút disabled "Sold out" (nền `--color-border`, chữ muted 6.70); dòng tồn "Sold out"; ảnh opacity 0.6; không Buy it now | edge_cases "Hết hàng toàn bộ"; foundation §6; 05 §3 |
| B | Tổ hợp không tồn | pill L gạch chữ + viền đứt, chữ muted (variant-picker §4, như quickview 5c); nút disabled "Unavailable"; câu "This combination is unavailable. Choose another size or color." 14 muted dưới hàng nút, nối `aria-describedby` | edge_cases "2 option có tổ hợp không tồn"; 10 §6 #2709. ĐỀ XUẤT chuỗi locale mới |
| C | Đang thêm giỏ | nút giữ bề rộng, chữ trong suốt + spinner 20 trắng, `aria-busy`, không bấm lại; ô số lượng khoá; `role=status` "Adding to cart" | foundation §6; 05 §5 |
| D | Lỗi thêm giỏ | hộp `form-message--error` ngay dưới hàng nút trong `product-form-error` (role alert): "Couldn't add to cart" + câu lỗi 422 của Shopify + cách sửa; không tự ẩn; nút mở lại; số lượng giữ giá trị server | 05 §4; TE-5 AC2 |
| — | Thêm thành công | drawer giỏ mở (TE-5 AC8) hoặc sang trang giỏ theo setting; số giỏ nhảy; không toast | 05 §6; 12 §1 |
| E | Video, 3D | §3 | AC1; 09 §4 #770 |
| F | Lightbox | §3 | 09 §3 |
| G | Sticky bar + toast lỗi; "Choose options" | §10 | AC5; CTO 10/11 P2 |
| H | Đang tải gợi ý | skeleton card (media 1:1 + 2 dòng), shimmer 1.4s, tĩnh khi giảm chuyển động | foundation §18 |
| I | Không media | §3 | edge_cases |
| J | 3 option, Weight 40 giá trị (dữ liệu mẫu, ES1-T282) | J0 bảng trạng thái giá trị (pill, swatch: còn, hết, không tồn tại, đang chọn, hover, focus); J1 thu gọn 7 + "+33", giá trị chọn 45 lb ở ô 7, Gray hết hàng; J2 mở hết 40 giá trị, focus "35 lb" (giá trị đầu vừa hiện), "Show fewer" ô cuối; J3 đang tải sau khi chọn Single (skeleton giá, "Checking availability…", nút giữ màu); J4 lỗi tải, quay về Pair, "Try again" | §5.1; variant-picker §4–§6; sổ M5 |
| K | Countdown | K1 ≥ 24 giờ (4 ô); K2 < 1 giờ (ô cam); K3 hết giờ khi đang xem; K4 không countdown, không chừa chỗ. Trang chính: 3 ô 22 · 36 · 28 | §4.2 |

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
| product-info | Show sale countdown | checkbox | true | info: "Uses the product metafield custom.sale_ends_at. Hidden when the date has passed, the variant has no compare-at price, or is sold out. The countdown does not end the sale." §4.2 |
| product-form | Show quantity selector | checkbox | true | 10 §8 #793 |
| product-form | Show assurance list | checkbox | true | 10 §9 |
| product-form | Assurance 1–3 text | text | Fast Shipping / 1 Year Warranty / 90 Day Money Back | Kit (`drafts/designer/_kit/kit.css`) |
| product-form | Assurance 1–3 link | url | shipping policy / trống / refund policy | |
| product-details | Specification 1–4 label | text | Weight range / Footprint / Materials / Assembly | metafield `custom.spec_1..4` |
| product-details | Open description by default | checkbox | true | 15 §6 |
| product-details | Show shipping and returns | checkbox | true | 10 §9 #803 |
| product-reviews | Heading | text | Customer Reviews | ES1-T264 |
| product-sticky-bar | Show on desktop | checkbox | true | CTO chốt 10/11 (P2) |

Tên sentence case, không ký tự `&`. Không thêm setting màu (dùng token). Bộ chọn biến thể không có setting: ngưỡng > 10 / hiện 7 là hằng chung (sổ M5, variant-picker §11); setting "Options with many values" của vòng 3b đã bỏ.

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
| trắng / `--color-background-dark` | 17.4 | chữ và số countdown |
| trắng / accent | 5.01 | số countdown < 1 giờ |
| trắng 60% / `--color-background-dark` | 6.93 | "This sale has ended" |
| viền đứt `--color-muted-light` / background | 5.33 | pill tổ hợp không tồn tại (1.4.11) |

- Vùng chạm: swatch, pill, nút stepper 44; rating link 44; thumbnail 56–80; nút ảnh 52; đóng lightbox 48; mọi nút ≥ 40 desktop, ≥ 44 mobile (nút nhỏ 40 chỉ ở card complementary ≥768; 360 cùng 40 nhưng cách nhau ≥ 16, đạt target-size 24).
- Bàn phím: thứ tự gallery → thumbnail → option → số lượng → nút → accordion. Radio trong fieldset dùng phím mũi tên. Lightbox bẫy focus (`showModal`), Escape đóng.
- Tên: link ảnh "Open image 1 of 3 in full size"; thumbnail "Load media 2 of 4, video"; stepper "Decrease quantity for {product}"; nút gallery "Previous image"/"Next image"; nút complementary "Add to cart: {product}"; video "Play video: {title}"; iframe có `title`.
- Live region: `product-form-status` (role status: "Adding to cart", "Added to cart", vòng 3b thêm "Loading {value}") và `product-form-error` (role alert), có sẵn. Lỗi tải biến thể: role alert ngay dưới option.
- Countdown: `role="timer"` không aria-live, số aria-hidden, câu ngày giờ đầy đủ (§4.2). Bộ chọn biến thể ("+N", focus sau khi mở, live region đang tải/lỗi): variant-picker §7.
- Alt ảnh: `media.alt`, thiếu thì "{product}, image n of N" (không bịa mô tả ảnh). Thumbnail, ảnh sticky bar, ảnh card gợi ý `alt=""` (tên ở link).
- Một h1 (tên sản phẩm); h2 cho Pairs Well With, Customer Reviews, You May Also Like; h3 cho tên sản phẩm trong card và tiêu đề review.
- Zoom 200%: buy box 1 cột dưới 64rem; hàng ngang có `overflow-x` riêng.

## 14. Lighthouse

Chỉ tiêu: SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90 (sổ 09/11). Trang sản phẩm nằm trong phạm vi SEO 100 (sổ 10/11).

- Header tối: noise là `background-image` 1 file nhỏ có sẵn (`assets/noise-dark.png`) trong critical.css, không phải ứng viên LCP; menu trắng 60% 6.9:1, focus trắng (foundation §3.4). Ảnh footer 96 × 120 lazy.

- LCP: ảnh đầu gallery (featured media của variant), `loading="eager"` + `fetchpriority="high"`, srcset 360–1800 (code). ĐỀ XUẤT sửa `sizes` theo bố cục mới: `(min-width: 80rem) min(668px, 50vw), (min-width: 64rem) 50vw, 100vw` (code đang `58vw`, tải thừa ~16% ở desktop). Không hiệu ứng reveal cho gallery, h1, giá, nút (màn đầu, chặn LCP); reveal chỉ cho tiêu đề và card từ §7 trở xuống (sổ 09/11).
- Lazy: ảnh gallery 2+, mọi thumbnail, poster video không phải media đầu, ảnh sticky bar, ảnh lightbox (gắn khi mở), ảnh swatch, ảnh complementary/related/review. Video `preload="none"`, iframe YouTube/Vimeo và model-viewer chỉ tải khi bấm.
- Font: 2 họ qua `font_picker`: Sofia Sans Condensed 700/800 (h1, h2, eyebrow, số 4.9), Inter 400/500/600 (còn lại). Không thêm weight.
- 2048 biến thể: HTML không chứa JSON hay `<option>` của mọi biến thể (trang 150–2048 biến thể không phình HTML, TBT không tăng); mỗi lần đổi lựa chọn chỉ tải partial của biến thể đó.
- Countdown: số in từ Liquid nên khung có kích thước thật ngay lần vẽ đầu (không CLS khi JS chạy); ô `tabular-nums`, min-width cố định; hết giờ khi đang xem giữ khung (K3). Không phải ứng viên LCP (chữ nhỏ, ảnh gallery lớn hơn).
- Sticky bar mọi mốc: `position: fixed`, ảnh 56 lazy, không đẩy layout (0 CLS); body chừa padding đáy khi thanh hiện để không che footer.
- CLS: ảnh có width/height + `aspect-ratio` khung; sticky bar, toast, lightbox `position: fixed`; tồn kho/giá đổi trong cùng khung (partial thay nội dung cùng chiều cao); khối gợi ý giữ chỗ skeleton khi đang tải và nằm dưới màn đầu ở 360/768. Rủi ro: ở 1920 khối complementary có thể chạm đáy màn đầu (main ~900px) → skeleton đúng 1 hàng, ẩn khi 0 kết quả chỉ sau khi fetch xong.
- A11y rủi ro đã tránh: sao màu vàng không mang nghĩa một mình; swatch có tên ẩn và mép 3.36:1; nút disabled vẫn 6.70:1; link trong câu ("Shipping") gạch chân (link-in-text-block); bảng thông số có `th scope`; dialog có tên; không `div` bấm được.
- SEO: một h1; breadcrumb `nav` + JSON-LD BreadcrumbList; JSON-LD Product có sẵn (AC11), ĐỀ XUẤT thêm `aggregateRating` khi có metafield rating; offers không lặp mọi biến thể (§17); link chữ mô tả đích ("Read the shipping policy", không "Learn more"); chữ nhỏ nhất 13 (badge).
- Best Practices: không lỗi console (mockup 0 lỗi ở 4 mốc); ảnh `object-fit: contain` không méo; không xin quyền; payment button do Shopify chèn ngoài partial.

## 15. Token dùng

Chỉ token foundation §2. Dẫn xuất: `--control-height`, `--grid-gap`, `--section-gap`, `--overlay-scrim`, `--shadow-raised`. Giá trị mới (không phải token, viết `calc()`): gap cột 80 = `--space-1 × 20`; bo ảnh 16 = `--radius-card + --space-1`; viền swatch `color-mix(--color-foreground 50%, transparent)`. Không thêm token.

## 16. Map sang code

| Phần | Code hiện có | Việc cho Dev FE (FE) / BE |
| --- | --- | --- |
| Header | `.site-header`, nền tối chỉ khi `body:has(.slideshow)` | FE: theo foundation §21 (mọi trang tối); trang sản phẩm không thêm gì |
| Bố cục 2 cột | `.product` 7fr/5fr, `.product__details` sticky | FE: 1fr/1fr, gap 48 → 80 từ 80rem, sticky chuyển sang media |
| Gallery | `.product-media__*` xếp dọc từ 64rem | FE: 1 ảnh + thumbnail mọi mốc, tỉ lệ 4:3 ở 48–64rem, tràn mép <48rem, đếm ảnh, nút 52 dùng lại `.carousel-nav__button` + `snippets/slideshow-icon`; BE: nút trước/sau, đồng bộ `aria-current` |
| Lightbox | `.product-media__dialog` | FE: nền cream, đếm, nút 52, thumbnail; BE: chuyển ảnh trong dialog |
| Giá, rating | `snippets/price`, `snippets/rating-stars` | FE: cỡ giá h3, badge -N%, hàng rating link `#reviews` |
| Mô tả | trong `product-info` | FE: chuyển sang accordion `product-details` |
| Option | `snippets/product-variant-picker.liquid`, `.product-option__value(--swatch)` | theo variant-picker §12 (snippet chung PDP/quickview, bảng lệch code); PDP thêm partial §17 |
| Countdown | — (featured-product có countdown setting, trang chủ) | FE: khối `product-countdown` trong `product-info`, dùng lại markup/CSS countdown của featured product; BE: đếm tiếp, chuyển K3 khi hết giờ, nằm trong partial đổi variant |
| Số lượng | `.product-form__quantity` | FE: markup stepper; BE: nút −/+ |
| Tồn kho | `.product-form__inventory` | FE: chấm badge-new, đặt trên hàng nút |
| Nút, Buy it now | `.product-form__add`, `__payment-button` | FE: cùng hàng số lượng, icon túi; unbranded = secondary |
| Gợi ý | `product-recommendations` | FE: dạng gọn cho complementary, hàng ngang cho related <80rem; BE: nút thêm giỏ complementary, skeleton |
| Review | — | FE: block `product-reviews` (CTO chốt); app cụ thể chờ ES1-T264 |
| Sticky bar | `product-sticky-bar` | FE: bố cục 3 mốc, bỏ select biến thể, ô số lượng ≥1024, "Choose options"; `show_on_desktop` default true; BE: toast lỗi, ẩn khi overlay mở, đồng bộ số lượng, cuộn về bộ chọn |

## 17. Bàn giao Dev: biến thể (2048 variants)

Nguồn: CTO 10/11 mục 1; shopify.com/blog/2048-variants. KHÔNG CHẮC phần tên partial và tham số: Tech Lead đối chiếu shopify.dev trước khi tách ticket FE/BE.

Dữ liệu (Liquid, FE):
- Bộ chọn: snippet chung `product-variant-picker`, dữ liệu, thu gọn > 10 / 7 + "+N", thuộc tính `data-*`, bảng lệch code: variant-picker §2, §5, §12. Không lặp ở đây.
- KHÔNG `{% for variant in product.variants %}` ở bất kỳ đâu trên trang sản phẩm (bộ chọn, sticky bar, JSON-LD, `<select name="id">`); KHÔNG `{{ product | json }}` hay JSON danh sách biến thể (gồm `variant-json` mà snippet đang render). `product.variants` chỉ trả tối đa 250 nên vòng lặp này vừa nặng vừa sai khi > 250 biến thể.
- Biến thể đang mua: `product.selected_or_first_available_variant`. Form chỉ gửi `<input type="hidden" name="id">` của biến thể này.
- JSON-LD: offers chỉ cho biến thể đang chọn, kèm `AggregateOffer` (`lowPrice` = `product.price_min`, `highPrice` = `product.price_max`, `offerCount` = `product.variants_count`). ĐỀ XUẤT; Tech Lead xác nhận với AC11.

Luồng đổi lựa chọn (BE):
1. Gom `option_value` id đang chọn của mọi option (≤ 3), gọi trang sản phẩm với `?option_values=<id1>,<id2>,<id3>` qua partial rendering của theme (architecture.md: thay Section Rendering API vì theme không có sections). Huỷ request trước khi có lần bấm mới (AbortController).
2. Partial trả về (ĐỀ XUẤT tên): `product-options` (bộ chọn với trạng thái mới), `product-price`, `product-countdown`, `product-media` (đã có), `product-buy-buttons` (tồn + nút + id biến thể), `product-sticky-bar`.
3. Áp partial, `history.replaceState` với `?variant=<id>` (AC2), dispatch event variant chuẩn (AC12).
4. Giá trị có `data-product-url` (combined listing): điều hướng sang URL đó thay vì fetch.
5. Lỗi mạng hoặc 5xx: giữ biến thể cuối đã áp, khôi phục radio, hiện lỗi J4 (variant-picker §6). Đang tải: J3. Giữ trạng thái mở "+N" và focus sau khi áp partial (variant-picker §5, §6).
- Không JS: trang vẫn mua được biến thể mặc định; đổi option cần JS (ĐỀ XUẤT chấp nhận, như luồng partial hiện có của theme).

## 18. Ghi chú countdown cho Dev

- Liquid: `product.metafields.custom.sale_ends_at.value` so với `'now' | date: '%s'`; in số ngày/giờ/phút/giây còn lại; thêm `datetime` ISO vào `<time>` ẩn hoặc data attribute cho JS.
- Điều kiện theo variant (giá gạch, còn hàng) nên khối nằm trong partial đổi variant.
- Cùng component với countdown featured product trang chủ (TE-13), khác nguồn ngày (metafield thay setting).

## 19. Quyết định CTO đã chốt (10/11)

- Bộ chọn biến thể theo option value, hỗ trợ 2048 biến thể, không vòng lặp biến thể, không JSON biến thể; có trạng thái còn/hết/không tồn tại, đang tải, option nhiều giá trị (§5.1, §17). Option > 10 giá trị hiện 7 + "+N", hằng chung PDP/quickview, không setting (M5; variant-picker.md). Câu CTO mới của component chung (nút lúc đang tải, chỉ báo card, swatch thiếu) ở variant-picker §13.
- Sticky bar ở mọi mốc, "Show on desktop" mặc định bật (§10).
- Có countdown "Sale ends in" (CTO 10/11), ngày từ dữ liệu thật từng sản phẩm, ẩn khi không có ngày / hết giờ / không giảm giá (§4.2).
- Review: tóm tắt từ metafield rating + app block, ẩn khi không dữ liệu (§8).

Câu mới (CTO chốt 10/11 theo đề xuất, docs/design/decisions.md):
1. Countdown đếm giây là nội dung tự cập nhật (WCAG 2.2.2)? Đề xuất: giữ giây, coi là thông tin thiết yếu; số aria-hidden, không chuyển động, không aria-live.
2. Ngày hết sale đặt ở metafield sản phẩm hay từng biến thể? Đề xuất: sản phẩm `custom.sale_ends_at` (date_time), ẩn ở biến thể không có giá gạch.

## Cập nhật 21/11 (ES1-T567, CTO 21/11)

- Nguồn chuẩn là mockup HTML + `drafts/designer/_kit/kit.css`; Designer dựng lại bản vẽ từ mockup. Số trong spec lệch mockup thì mockup thắng.
- Nhãn nút và link dạng nút: sentence case, mở bằng động từ, không dấu câu (Chuẩn: Polaris Button), thay Title Case 07/11. Tiêu đề section, dialog, empty state, tab, menu giữ Title Case (chờ CTO). "Checkout" giữ một chữ (thuật ngữ content.md §4, chờ CTO).
- Line-height theo bội 4 qua token kit: 16/24 (`--line-height-body`), 14/20 (`--line-height-sm`), 13/20 (`--line-height-label`), 18/28 (`--line-height-title`), h1 40/48 → 48/56, h3 28/36, h4 20/24. Trang không viết line-height bằng số.
- Giá PDP 28/36 (`.price--xl`), skeleton giá cao 36; quote review 16/28 (`--line-height-reading`); số điểm tổng line-height 1; badge đếm trên thumbnail 24 (trước 22); vùng chạm 44 đọc `--touch-target`, icon đọc `--icon-size-*`.
- Cần FE: locale `products.product.add_to_cart`, `buy_it_now`, `sold_out`, `choose_options`, `general.try_again`, `show_fewer`, nút review về sentence case.
