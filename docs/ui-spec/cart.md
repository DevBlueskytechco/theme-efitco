KHÔNG CHẮC: (1) Upsell không có AC trong TE-5 → hỏi CTO ở ES1-T247, phần upsell là ĐỀ XUẤT. (2) Không đọc được docs/ui-spec/product.md và drafts/designer/ES1-T239/ trên nhánh origin/feature/ai-ES1-T239 (không có git trong công cụ Designer), nên chưa đối chiếu được stepper, breadcrumb và header của trang con với trang product. (3) Màn PNG không cắt nhỏ được để soi chi tiết 360 (Read thu nhỏ ảnh dài), mới soi được bố cục tổng.

# UI spec: Cart page và cart drawer (TE-5)

Ticket ES1-T241. Mockup: `drafts/designer/ES1-T241/cart.html`, PNG `cart-360.png`, `cart-768.png`, `cart-1280.png`, `cart-1920.png`.

## Mục đích

Khách xem và sửa giỏ không reload, thấy giảm giá, ngưỡng freeship, ghi chú đơn (chỉ ở page), rồi checkout. Giữ nguyên luồng TE-5 AC1–AC7: drawer mặc định, `cart_type = page` thì đi sang trang cart, không JS vẫn update và checkout bằng form.

## Figma node

Figma không có cart (chỉ có frame 1:359). Mọi bố cục ở đây là ĐỀ XUẤT dựng bằng component sẵn có của trang chủ:

| Phần cart | Mượn từ Figma | Ghi chú |
| --- | --- | --- |
| Header, footer | 1:362, 1:1104 | Dùng lại nguyên, khung 1416 trong 1920 |
| Panel tổng tiền | panel 1:611 (shop the look), 1:718 (bundle) | Nền #393942, bo 16, padding 40, title 18/28 700, dòng phụ #B2B2B2 14/22 |
| Badge số lượng trong drawer | `bundle-builder__count` (1:636) | Pill accent 28 cao, 13/20 600 |
| Hộp freeship | `shop-the-look__note` (1:560) + `bundle-builder__progress` (1:636) | Nền sand, bo 8, padding 24; thanh 4px bo 2 |
| Dòng upsell trong drawer | hàng sản phẩm 1:560 | Ảnh 67 × 67, viền 1px, bo 8 |
| Card upsell trên page | product card 1:502 | Ảnh 1:1 bo 12 nền cream, badge -N%, giá sale |
| Heading, eyebrow upsell | 1:495 | Heading 48/58 Sofia 700, eyebrow 16/20 800 accent uppercase |
| Nút | CTA Button (9 instance) | `.button`: 52 cao, bo 8 từ 80rem; 44, bo 4 dưới 80rem (đúng code hiện tại) |

## Anatomy

Cart page (`templates/cart.liquid` → container `cart-main` → `blocks/cart-page`):

1. `breadcrumb`: Home / Cart. ĐỀ XUẤT (theme chưa có breadcrumb; ticket yêu cầu dùng lại breadcrumb trang con).
2. `cart-page__heading` h1 "Cart" + `cart-page__count` "4 items" (ĐỀ XUẤT, key mới `cart.item_count` có pluralize one/other).
3. `cart-items__error` role alert (có sẵn), chỉ hiện khi có text.
4. `cart-free-shipping` (snippet có sẵn): icon truck 52 (36 dưới 80rem), text, thanh tiến độ.
5. `cart-lines` (snippet có sẵn), mỗi `cart-line`: ảnh, tiêu đề link, options `dl`, properties, selling plan, giá (sale + gạch), discount dòng, `quantity` (stepper ĐỀ XUẤT), Remove, line total.
6. `cart-update` (có sẵn, ẩn khi `data-enhanced`).
7. `cart-page__note`: label "Order note" + textarea (có sẵn).
8. `cart-summary` (snippet có sẵn) trong panel tối: title "Order summary" (ĐỀ XUẤT, key mới `cart.summary_title`), Subtotal, discount cấp đơn, Total, ghi chú thuế, nút Checkout.
9. `cart-page__accelerated`: nút Shopify render, dưới panel.
10. `cart-upsell` (ĐỀ XUẤT, ES1-T247): eyebrow, heading, lưới product card + nút "Add To Cart" secondary.

Cart drawer (`blocks/cart-drawer`, dialog):

1. `cart-drawer__head`: h2 "Cart" Sofia 28/34 + badge số lượng (ĐỀ XUẤT) + nút đóng 44 × 44.
2. `cart-drawer__main` (cuộn): lỗi, freeship, dòng hàng, upsell 2 hàng (ĐỀ XUẤT).
3. `cart-drawer__foot` (ghim chân): panel #393942 bo 16 hai góc trên; Subtotal, discount, Total, thuế, Checkout, accelerated 2 cột. Không có title "Order summary" trong drawer.
4. Không có ghi chú đơn trong drawer (AC5 chỉ yêu cầu ở page).

## Settings merchant

| Tên | Kiểu | Default | Giới hạn | Trạng thái |
| --- | --- | --- | --- | --- |
| Cart type | select (Drawer, Page) | Drawer | — | Có sẵn `cart_type` |
| Free shipping threshold | number | 0 (ẩn thanh) | Tiền tệ của shop | Có sẵn `free_shipping_threshold` |
| Show recommendations | checkbox | true | — | ĐỀ XUẤT, block setting `show_recommendations` của block upsell |
| Eyebrow | text | You may also like | — | ĐỀ XUẤT |
| Heading | text | Complete Your Setup | — | ĐỀ XUẤT |
| Products to show | range | 4 | 2–4, bước 1 (drawer luôn 2) | ĐỀ XUẤT |

Không thêm setting màu: panel dùng màu sẵn có (`--figma-393942` = `background_panel`).

## Layout

Lề trang 20, khung `min(1416px, 100% - 40px)`. Breakpoint theo AGENTS.md: 48rem, 64rem, 80rem.

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Khung nội dung | 320 | 728 | 1240 | 1416 |
| Cột | 1 | 1 | 936fr / 456fr, gap 24 (từ 64rem) | 936 / 456, gap 24 |
| Thứ tự | freeship, dòng hàng, panel tổng, accelerated, note | như 360 | trái: freeship, dòng hàng, note; phải: panel sticky top 96 + accelerated | như 1280 |
| Dòng hàng | lưới 96 / 1fr / auto: hàng 1 ảnh + chi tiết; hàng 2 stepper + Remove (trái), line total (phải) | 120 / 1fr / 132 / 96: ảnh, chi tiết, stepper với Remove bên dưới, line total | như 768 | như 768 |
| Padding dòng | 24 trên dưới, kẻ 1px #E5E5E5 | 24 | 24 | 24 |
| Panel tổng | padding 24, bo 12 | 24, bo 12 | 40, bo 16, gap 24 | 40, bo 16 |
| Freeship | padding 16, icon 36, chữ 14/22 | 16 | padding 24, icon 52, chữ 16/26 | như 1280 |
| Band upsell | padding 48, lưới 2 cột (gap 12 × 24) | 48, 3 cột, ẩn card thứ 4 | 120, 4 cột, gap 24 | 120, 4 cột |
| Breadcrumb → h1 → nội dung | 24 / 12 / 24 | 24 / 12 / 32 | 32 / 12 / 40 | 32 / 12 / 40 |
| Drawer | rộng toàn màn | 448 (28rem, có sẵn) | 448 | 448 |

Heading h1 dùng `--font-size-h1` clamp(32 → 48). Đáy trang cart → band upsell 48 / 120.

## Trạng thái

Dòng trạng thái nằm cuối mockup, mục 1–6.

| Trạng thái | Thiết kế | Nguồn |
| --- | --- | --- |
| Giỏ rỗng (page, drawer) | Hộp cream bo 16 (page), không nền (drawer): icon túi 52, "Your cart is empty." Sofia 36, nút "Continue shopping", ghi chú thuế nếu có | AC4. Icon, hộp: ĐỀ XUẤT. Không có upsell vì recommendations cần sản phẩm gốc |
| Lỗi 422 quá tồn | Thông báo API nguyên văn trong `cart-items__error` (nền #F4F4F4, viền đầu 2px sale, bo 0 8 8 0); stepper dòng lỗi viền sale, nút + tắt; số về giá trị server | AC2. Viền stepper + nút tắt: ĐỀ XUẤT |
| Dòng hết hàng | Badge "Sold out" (pill #1A1A1A chữ trắng, 28 cao) dưới giá; nút + tắt; Remove vẫn dùng được | ĐỀ XUẤT, điều kiện `item.variant.available == false`, key có sẵn `products.card.sold_out` |
| Đang cập nhật | `aria-busy` trên cart-items; ô số giữ giá trị mới; dòng đang đổi hiện spinner 16 accent chỗ Remove; line total, Subtotal, Total thành skeleton cùng chiều cao; Checkout spinner (`.button[aria-busy]` có sẵn) | AC2 + skill ux-motion. Không đổi kích thước khung |
| Đạt freeship | Thanh đầy, text `cart.free_shipping_reached` | AC3 |
| Giảm giá tự động | Dòng: `cart-line__discount` màu sale; đơn: hàng trong panel "Tên −$X" | AC1, AC5 |
| Selling plan | Dòng 14/22 #4D4D4D dưới tiêu đề | AC5 |
| Upsell đang tải, 0 kết quả, lỗi | Ẩn cả khối, không skeleton (khối nằm dưới nếp gấp, không gây CLS phía trên) | ĐỀ XUẤT |
| Không JS | Stepper −/+ ẩn, còn input number + nút Update + link Remove; drawer không mở, link giỏ sang trang cart | AC5, code hiện tại |
| Hover | `.button` nhấc 1px + bóng, active scale 0.98 (có sẵn); stepper viền #1A1A1A; Remove chữ #1A1A1A; tiêu đề gạch chân; card upsell phóng ảnh như product card | skill ux-motion |
| Focus | Viền 2px accent offset 2 (có sẵn `.button:focus-visible`); trên panel tối viền trắng; input số offset -2 trong stepper; textarea viền #1A1A1A + vòng accent | DESIGN.md |
| Disabled | opacity 0.55, cursor not-allowed (có sẵn) | skill ux-motion |

Chuyển động: drawer trượt + backdrop fade `--motion-base` (có sẵn dòng 7953); stepper và skeleton chỉ dùng opacity; tất cả trong `prefers-reduced-motion: no-preference`.

## Accessibility

Tương phản (công thức WCAG, L theo sRGB):

| Cặp | Tỉ lệ | Dùng cho |
| --- | --- | --- |
| #1A1A1A / #FFFFFF | 17.4 | Chữ chính, line total |
| #4D4D4D / #FFFFFF | 8.45 | Options, Remove, breadcrumb, giá gạch |
| #BD1616 / #FFFFFF | 6.39 | Giá sale, discount dòng, viền stepper lỗi (≥ 3) |
| #FFFFFF / #C8400E | 5.01 | Checkout, badge số, eyebrow accent trên trắng |
| #FFFFFF / #393942 | 11.4 | Total, giá trị trong panel |
| #B2B2B2 / #393942 | 5.39 | Nhãn Subtotal, ghi chú thuế trong panel |
| #1A1A1A / #EBE6E0 | 14.1 | Text freeship |
| #C8400E / #FFFFFF (thanh trên track trắng) | 5.01 | Thanh freeship (≥ 3) |
| #4D4D4D / #F5F5F1 | 8.0 | Ghi chú thuế ở giỏ rỗng |
| #999999 / #1A1A1A | 6.1 | Footer, header trang con |
| #6B6B6B / #FFFFFF | 5.33 | Nút stepper disabled, chú thích |

Không thêm màu mới. Không dùng ngoại lệ trong `figma-exceptions.json`.

- Vùng chạm: nút stepper 44 × 44, input 44 × 42 trong viền 44, Remove 44 cao, nút đóng 44, nút + upsell drawer 44, Checkout 44 (52 từ 80rem).
- Keyboard: Tab theo DOM; stepper là 2 `button` + input number, Enter/Space trên nút; input gõ số rồi rời ô mới gửi (BE). Esc đóng dialog (native). Focus trả về link giỏ khi đóng.
- Tên đọc: nút stepper "Decrease quantity for {title}" / "Increase quantity for {title}" (key mới `cart.decrease_label`, `cart.increase_label`); input giữ `cart.quantity_label`; Remove giữ `cart.remove_label`; nút upsell "Add {title} to cart" (key mới).
- Live region: `cart-items-status` đọc "Cart updated." / "Item removed from cart."; lỗi đọc qua role alert.
- Ảnh dòng hàng và card: link ảnh `aria-hidden` + `tabindex -1`, alt rỗng vì tiêu đề là link cùng đích (như product card).
- Một h1 mỗi trang. Panel title h2, heading upsell h2, h2 drawer có sẵn.

## Token dùng

`--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-accent`, `--color-accent-foreground`, `--color-sale`, `--color-muted-on-dark`, `--color-background-dark`; `--figma-393942`, `--figma-4d4d4d`, `--figma-b2b2b2`, `--figma-ebe6e0`, `--figma-f5f5f1`, `--figma-1a1a1a`, `--figma-white-12`, `--figma-white-60`; `--figma-radius-2/4/8/12/16/18/999`; `--radius-input`, `--radius-button`, `--radius-card`; `--font-heading--*`, `--font-primary--*`, `--font-size-h1/h2/lg/base/sm/xs`; `--space-*`; `--motion-fast`, `--motion-base`, `--ease-out`. Không token mới.

## Map sang block, snippet

| Phần | File | Việc |
| --- | --- | --- |
| Trang | `templates/cart.liquid` | Thêm container band upsell sau `cart-main` (nếu CTO chốt upsell) |
| Breadcrumb, đếm item, title panel | `blocks/cart-page.liquid` | FE: markup + key locale mới |
| Panel tối, lưới 936/456, freeship sand | `assets/base.css` mục Cart (4017–4361) | FE: thay layout mặc định ES1-T93 bằng spec này |
| Dòng hàng, stepper, badge hết hàng, giá gạch compare_at | `snippets/cart-lines.liquid` | FE: thêm 2 nút stepper (ẩn khi chưa `data-enhanced`), badge; BE: JS bấm −/+ |
| Giá gạch cho hàng sale | `snippets/cart-lines.liquid` | Hiện tại chỉ gạch `original_price` (giảm giá dòng). Mockup gạch `item.variant.compare_at_price` như product card: ĐỀ XUẤT, cần FE thêm nhánh |
| Ghi chú thuế khi giỏ rỗng | `snippets/cart-lines.liquid` | AC4 ghi "taxes_included thông báo khi có" nhưng `cart-summary` không render khi rỗng → lệch AC4, FE thêm dòng thuế vào nhánh rỗng |
| Drawer head badge, foot panel | `blocks/cart-drawer.liquid` + CSS 4363–4519 | FE |
| Upsell | Block mới `cart-recommendations` hoặc mở rộng `product-recommendations` nhận `product_id` từ dòng đầu | FE + BE, chờ ES1-T247 |
| Header trang con nền tối | `assets/base.css` dòng 7452, 7458 | FE: bỏ điều kiện `body:has(.slideshow)` nếu CTO chốt mục 2 |

Hook giữ nguyên: mọi `data-testid` trong `cart-page`, `cart-drawer`, `cart-lines`, `cart-summary`, `cart-free-shipping`; partial `cart-page`, `cart-drawer`, `cart-count`. Hook mới: `cart-line-decrease`, `cart-line-increase`, `cart-line-sold-out`, `cart-item-count`, `cart-recommendations`, `cart-recommendations-add`.

## Dữ liệu mẫu trong mockup

3 dòng thật: Compact Power Rack R3 $549.00 × 1, FlexFold Adjustable Bench $189.00 (gạch $229.00) × 1, Revllen Pro Speed Rope $34.99 (gạch $44.99) × 2 = $69.98. Subtotal $807.98. Ngưỡng freeship mẫu $1,000 → còn $192.02 (80.8%). Option "Color: Black", giảm giá "Member 10% off", "Bundle 10% off", gói "Delivered every month", ghi chú đơn, nút Shop Pay/PayPal là ví dụ minh hoạ; dữ liệu thật đến từ Shopify. Ảnh newsletter ở footer tạm dùng ảnh bài viết efx-blog-1 (ảnh thật do merchant chọn). Ảnh sản phẩm dùng đúng URL trong ticket, một số không khớp tên (ES1-T245).

## Quyết định CTO cần chốt

1. Upsell (ES1-T247): làm hay không, intent nào? ĐỀ XUẤT: làm, intent complementary theo sản phẩm dòng đầu, page 4 card, drawer 2 hàng, ẩn khi 0 kết quả; thêm AC8 cho TE-5.
2. Header trang con (cart, product, collection): nền tối #1A1A1A + noise như trang chủ hay nền trắng như code hiện tại? ĐỀ XUẤT: nền tối, cùng ngôn ngữ trang chủ và footer, chữ menu trắng 60% (6.9:1).
3. Đổi số lượng: stepper −/+ quanh ô số hay giữ ô number trần như code hiện tại? ĐỀ XUẤT: stepper 3 × 44, nút do JS bật (`data-enhanced`), không JS còn ô number + Update, cùng control với product form để trang product dùng chung.
