KHÔNG CHẮC: (1) spec chưa chạy trên preview trong phiên viết (không có PREVIEW_URL/STORE_PASSWORD) → kết quả thật chờ CI store-tests của PR, chưa báo đạt; (2) tên spec theo ticket `tests/e2e/TE-5.spec.ts` (như TE-3/TE-4.spec.ts), không tạo thêm `ES1-T99.spec.ts`; (3) spec dev ES1-T94..T98 chưa xoá: ES1-T203 TC-01/TC-02/TC-14 đọc T96–T98 và support/cart-mock.ts — xoá cần Tech Lead đổi ES1-T203 trước (ghi trong báo cáo); (4) AC9 kiểm mockup trên dòng thật (store dev chưa có B2B, ES1-T298 D1, ES1-T297 #1); (5) AC3 nhánh có ngưỡng và AC6 nhánh `cart_type` page thật phụ thuộc setting của preview.

# ES1-T99 — TE-5 Cart drawer và cart page (AC1–AC10, thanh checkout < 64rem)
Nguồn: docs/srs.md#TE-5 AC1–AC10, AC17 (khung AC15, rỗng AC19 khi AC1/AC4 trỏ tới); ticket ES1-T99; drafts/techlead/ES1-T307/task-split.md §3 dòng ES1-T99, §6.6; ADR 0007 (lớp `<modal-dialog>`), ADR 0010. Figma: cart không có node trong docs/figma-inventory.md (thiết kế theo docs/ui-spec/cart.md, mini-cart-quickview.md).
Spec: `tests/e2e/TE-5.spec.ts` — tên test bắt đầu `AC<n> TC-<id>`; nhóm không JS có chữ `nojs`. Project: desktop (Desktop Chrome) + mobile (Pixel 7).
Phạm vi AC cho `ac_coverage.py`: `drafts/qa/ES1-T99/ac-scope.md`.

Cách dựng dữ liệu (cột Loại):
- Mock: `support/cart-mock.ts` — trang + JS thật, Cart API và partial giả trong bộ nhớ, 0 request Cart API tới store. Dùng cho lỗi (422, 200 giảm số, `route.abort`), event, bàn phím.
- Thật: giỏ seed bằng 1 request `/cart/add.js` `items[]` (support/cart-api.ts, thử lại 429), HTML Liquid thật, so tiền với `/cart.js` lấy bằng fetch trong trang (ES1-T74).
- Tĩnh: đọc file theme.

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | PDP `TE4_VARIANTS_HANDLE`, cart_type drawer, giỏ rỗng (mock) | bấm Add to cart | dialog `:modal` mở, URL không đổi; focus ở h2 "Cart" (AC15); 1 `cart-line` đúng variant; `header-cart-count` = item_count; "Added to cart" + tên trong `role="status"`; Checkout trong `cart-drawer-footer`; accelerated (nếu shop bật) không hidden; axe 0 serious/critical trong dialog | E2E mock | P1 |
| TC-02 | AC1 | giỏ thật 1 dòng × 2 (`TE4_VARIANTS_HANDLE`) | mở drawer bằng icon giỏ | dòng có tên là link `/products/`, ảnh, option (đủ giá trị `options_with_values`, không có khi default variant), giá = `final_price`, giá gạch khi `original_price` ≠ `final_price`, ô số = quantity, thành tiền = `final_line_price`, Total = `total_price`; Checkout `form=cart-form-drawer`; Subtotal chỉ khi có discount cấp giỏ (AC15); accelerated không hidden nếu có | E2E thật | P1 |
| TC-03 | AC1 | giỏ thật 1 dòng `TE4_UNIT_PRICE_HANDLE` có `unit_price_measurement` | mở drawer | `cart-line-unit-price` hiện; không có số đo thì skip có lý do | E2E thật | P3 |
| TC-04 | AC1 | giỏ thật 3 sản phẩm của collection `te12-bundle` (automatic discount 2 món 10%, 3 món 15%, `TE12_DISCOUNT_READY`) | mở drawer; mở `/cart` | số `cart-line-discount` mỗi dòng = `line_level_discount_allocations`; số `cart-discount` = `cart_level_discount_applications`; drawer có Subtotal khi có discount cấp giỏ; Total = `total_price` ở cả 2 nơi (AC5 mã giảm tự động) | E2E thật | P2 |
| TC-05 | AC1 | PDP, `/cart/add.js` mock 422 | bấm Add to cart | drawer không mở, câu lỗi API trong `product-form-error`, giỏ không đổi, không rời trang | E2E mock | P2 |
| TC-06 | AC2 | drawer và `/cart`, giỏ mock 1 dòng × 1 | đổi ô số thành 2 (giữ POST) | trong lúc chờ: `cart-items` `aria-busy="true"`, Checkout `aria-disabled="true"`; xong: hết busy, ô = 2, focus giữ ở ô, Total và `header-cart-count` theo `/cart.js`, status `cart.updated`, đúng 1 refresh partial, không reload; axe 0 serious sau đổi | E2E mock | P1 |
| TC-07 | AC2 | drawer và `/cart`, giỏ mock 2 dòng | bấm xoá dòng đầu | còn 1 dòng, focus về ô số dòng còn lại, Total theo `/cart.js`, status `cart.removed`, không điều hướng theo link | E2E mock | P1 |
| TC-08 | AC2 | drawer và `/cart`, `/cart/change.js` mock 422 | đổi số thành 99 | câu `description` của API trong `cart-items-error` (`role="alert"`), ô về 1 (server), focus giữ, không refresh partial | E2E mock | P1 |
| TC-09 | AC2 | drawer và `/cart`, mock 200 nhưng server chỉ còn 2 | đổi số thành 5 | ô = 2, status `cart.quantity_adjusted`, alert rỗng, `/cart.js` = 2 | E2E mock | P1 |
| TC-10 | AC2 | drawer và `/cart`, `/cart/change.js` `route.abort` | đổi số thành 2 | alert = `data-label-error`, ô về 1, Checkout không còn `aria-disabled="true"`; mạng lại → đổi lại được, alert rỗng | E2E mock | P1 |
| TC-11 | AC2 | giỏ thật 1 dòng × 1, drawer và `/cart` | bấm + (stepper Liquid thật) | đúng 1 POST `/cart/change.js` quantity 2; ô = 2; thành tiền, Total, `header-cart-count` khớp `/cart.js`; focus vẫn trong dòng đó | E2E thật | P1 |
| TC-12 | AC3 | theme mới cài | đọc `config/settings_schema.json`, `config/settings_data.json`, snippet | `free_shipping_threshold` number default 0, settings_data không ghi đè; snippet không render khi ngưỡng 0 hoặc giỏ rỗng | Tĩnh | P2 |
| TC-13 | AC3 | giỏ thật 1 dòng, preview có ngưỡng > tổng | mở `/cart`, mở drawer | `<progress>` có `aria-labelledby` trỏ tới câu, value < max; câu "Spend {x} more to unlock free shipping", số tiền trong `<strong>`, x = max − total; `/cart`: khối đứng trước `cart-lines`; drawer: khối sau vùng "Added to cart". Preview ngưỡng 0 hoặc tiền khác shop → skip có lý do | E2E thật | P2 |
| TC-14 | AC3 | như TC-13, đổi số lượng tới ≥ ngưỡng (≤ 20 món) | mở `/cart` | value = max, câu "Free shipping unlocked.", class `cart-free-shipping--reached` (icon đổi, không chỉ màu) | E2E thật | P2 |
| TC-15 | AC3 | giỏ rỗng | mở `/cart`, mở drawer | không có `cart-free-shipping` | E2E thật | P2 |
| TC-16 | AC4 | giỏ rỗng | mở `/cart` | h1 "Cart"; khối rỗng h2 "Your Cart Is Empty"; "Continue Shopping" → `/collections/all`; "Browse collections" → `/collections`; không summary, Checkout, câu thuế, freeship, thanh checkout; ghi chú và accelerated ẩn; axe 0 serious/critical | E2E thật | P1 |
| TC-17 | AC4 | giỏ rỗng, `/` | bấm icon giỏ | drawer mở, khối rỗng h2 "Your Cart Is Empty", nút "Shop Bestsellers"; chân panel, pill, freeship không hiện; gợi ý ≤ 2 khi merchant chọn `empty_cart_products`, không chọn thì không có; axe trong dialog | E2E thật | P1 |
| TC-18 | AC4 | giỏ thật 1 dòng, `TE4_TAX_INCLUDED_COUNTRY` | mở `/cart?country=<nước>` | `cart-tax-note` = "Taxes included." hoặc "Taxes and duties included."; market mặc định: câu thuế là 1 trong 4 câu locale | E2E thật | P2 |
| TC-19 | AC5 | giỏ thật 1 dòng | mở `/cart` | dòng đủ trường như TC-02; −/+ hiện, Update ẩn (`data-enhanced`); h2 "Order Summary", Subtotal = `items_subtotal_price`, Total = `total_price`; textarea `name=note` có label "Order note", `aria-describedby` tới gợi ý, `form=cart-form-page`; Checkout `form=cart-form-page`; accelerated không hidden nếu có; axe 0 serious/critical | E2E thật | P1 |
| TC-20 | AC5 | nojs, giỏ thật 1 dòng | `/cart`: sửa ô số = 2, gõ ghi chú, bấm Update | −/+ không hiện, Update hiện; sau tải lại `/cart.js` quantity 2, note đúng chữ, textarea giữ chữ | E2E nojs | P1 |
| TC-21 | AC5 | nojs, giỏ thật 1 dòng | bấm xoá (link `url_to_remove`) | trang tải lại, khối rỗng, `/cart.js` item_count 0 | E2E nojs | P1 |
| TC-22 | AC5 | nojs, giỏ thật 1 dòng | gõ ghi chú, bấm Checkout | sang `/checkouts/…`, `/cart.js` note đúng chữ | E2E nojs | P1 |
| TC-23 | AC6 | PDP, flip `data-cart-type="page"` trên `product-form` (mock) | bấm Add to cart | chuyển `/cart`, giỏ có hàng, không mở dialog | E2E mock | P1 |
| TC-24 | AC6 | preview đặt `cart_type` page + `EXPECT_CART_TYPE=page` | mở `/`, PDP; bấm Add to cart | không có dialog, `cart-drawer` `data-mode="none"`, thêm giỏ chuyển `/cart`. Không có preview như vậy → skip, bằng chứng ảnh chụp tay đính vào ticket | E2E thật | P2 |
| TC-25 | AC6 | Add To Cart trong popup kết quả quiz | — | ngoại lệ thuộc TE-11 AC6, không kiểm ở file này | Tham chiếu | P3 |
| TC-26 | AC7 | `/` đã tải với giỏ rỗng; giỏ đổi phía server (Cart API, ngoài theme) | gọi `Shopify.actions.openCart()` | drawer mở (không sang `/cart`, URL giữ), có 1 dòng từ server, `header-cart-count` = 1 (không cache client), focus ở h2; Esc → đóng, focus về icon giỏ | E2E thật | P1 |
| TC-27 | AC7 | `/`, giỏ rỗng, `Shopify.actions` đã configure | gọi `updateCart({ lines: [{ merchandiseId, quantity: 1 }] })` | `header-cart-count` = 1, `cart-drawer-body` `data-item-count` = 1 (refresh partial), drawer không tự mở, `/cart.js` item_count 1, không reload | E2E thật | P1 |
| TC-28 | AC7 | drawer và `/cart`, giỏ mock 1 dòng, thư viện standard-events đã nạp | đổi số thành 2 | đúng 1 `shopify:cart:lines-update` trên `cart-items`: action `update`, context `dialog`/`cart`, lines `[{ id: key, quantity: 2 }]`, dispatch trước POST, promise resolve có cart, userErrors rỗng | E2E mock | P1 |
| TC-29 | AC7 | drawer và `/cart`, giỏ mock 2 dòng | bấm xoá | 1 event action `remove`, quantity 0, promise có cart | E2E mock | P1 |
| TC-30 | AC7 | drawer và `/cart`, mock 422 | đổi số thành 99 | 1 event, promise resolve (không reject) cart null + userErrors = câu API | E2E mock | P2 |
| TC-31 | AC7 | `/`, flip `cart-drawer` `data-mode="none"` (mock) | gọi `openCart()` | chuyển `/cart` | E2E mock | P2 |
| TC-32 | AC8 | giỏ thật 1 dòng, `show_order_note` bật (mặc định) | mở drawer | `cart-drawer-note` là `<details>` không `open`; mở ra có label "Order note" gắn textarea `name=note` `form=cart-form-drawer` | E2E thật | P1 |
| TC-33 | AC8 | như TC-32 | gõ ghi chú, rời ô | 1 POST `/cart/update.js`; `/cart.js` note = chữ đã gõ; mở `/cart`: `cart-page-note` cùng chữ (cùng `cart.note`) | E2E thật | P1 |
| TC-34 | AC8 | drawer mock 1 dòng, details mở, đang gõ chưa rời ô | đổi số lượng → refresh partial | textarea giữ nguyên chữ, details vẫn mở | E2E mock | P1 |
| TC-35 | AC8 | theme mới cài; preview tắt setting (`EXPECT_ORDER_NOTE=off`) | đọc schema; mở drawer | schema `show_order_note` checkbox default true, Liquid bọc details trong `if block.settings.show_order_note`; preview tắt → không có `cart-drawer-note` (thiếu preview tắt → skip) | Tĩnh + E2E | P2 |
| TC-36 | AC9 | snippet `cart-lines.liquid` | đọc file | có 3 key rút gọn Min/Max/Increments, input có `step`, `data-quantity-rule/min/max/step`, `aria-describedby` dòng quy tắc; − `aria-disabled` khi quantity ≤ min | Tĩnh | P2 |
| TC-37 | AC9 | kiểm mockup: `/cart` thật, dòng × 6, gắn quy tắc Min 6 · Increments of 6 · Max 18 vào dòng (đúng hook Liquid) | bấm −; bấm + 2 lần | − `aria-disabled`, bấm không gửi; + → 12 → 18, + `aria-disabled` ở 18; đúng 1 POST quantity 18 (debounce); mock 422 → câu server trong alert, ô về 6 | E2E mockup | P1 |
| TC-38 | AC9 | kiểm mockup như TC-37 | gõ 7, rời ô | câu lỗi dưới dòng hiện, ô `aria-invalid="true"`, `aria-describedby` gồm id câu lỗi, 0 POST | E2E mockup | P1 |
| TC-39 | AC9 | B2B thật `TE5_QUANTITY_RULE_HANDLE` (ES1-T298 D1) | mở `/cart` và drawer | dòng quy tắc hiện, chỉ phần áp dụng; ô có `step`. Thiếu dữ liệu → skip có lý do | E2E thật | P2 |
| TC-40 | AC9 | volume pricing thật `TE5_VOLUME_HANDLE` × số đạt bậc | mở `/cart` | "Volume pricing applied". Thiếu dữ liệu → skip (markup kiểm ở ES1-T369) | E2E thật | P3 |
| TC-41 | AC10 | giỏ thật 1 dòng `TE4_SELLING_PLAN_HANDLE` mua theo plan | mở drawer; mở `/cart` | `cart-line-selling-plan` = tên plan; giá dòng = `selling_plan_allocation.price` = `final_price` | E2E thật | P1 |
| TC-42 | AC17 | giỏ thật 3 dòng, `/cart` ở 360 và 768 (desktop), Pixel 7 (mobile), sticky bật (mặc định) | cuộn tới cuối trang (panel ngoài màn) | `<aside>` "Cart total and checkout" hiện, `html[data-bottom-bar="cart"]`, Total = `total_price`, Checkout cao 48, thanh cao ≥ 72; footer không bị thanh che | E2E thật | P1 |
| TC-43 | AC17 | như TC-42 | cuộn panel vào màn | thanh ẩn, gỡ `data-bottom-bar` | E2E thật | P1 |
| TC-44 | AC17 | giỏ thật, `/cart` 1280 và 1920 | cuộn hết trang | thanh không hiện, không `data-bottom-bar` | E2E thật | P2 |
| TC-45 | AC17 | nojs, giỏ thật, 360 | cuộn hết trang | thanh `hidden`, không hiện | E2E nojs | P2 |
| TC-46 | AC17 | giỏ rỗng | mở `/cart` | không có `cart-checkout-bar` (gộp vào TC-16) | E2E thật | P2 |

## Case biên (ngoài AC)

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| B-01 | AC1 | drawer mở (mock, mở bằng icon giỏ) — keyboard | Tab và Shift+Tab 15 lần | focus không ra ngoài dialog; Esc đóng, focus về icon giỏ | a11y | P1 |
| B-02 | AC1 | drawer mở sau thêm giỏ từ PDP (mock) | bấm nút đóng | đóng, focus về nút Add to cart | a11y | P1 |
| B-03 | AC1 | mock, 360/768/1280/1920 (desktop) | mở drawer | Checkout và dòng hàng nằm trong viewport, không cuộn ngang; ảnh đính kèm | UI | P2 |
| B-04 | AC1 | `cart-drawer.js` `route.abort` (mất mạng) | bấm Add to cart | chuyển `/cart`, giỏ có hàng | E2E mock | P2 |
| B-05 | AC2 | `cart-items.js` `route.abort` trên `/cart` | tải trang | không `data-enhanced`, Update hiện, xoá vẫn là link | E2E mock | P2 |
| B-06 | AC1 | theme editor (`design_mode`) | phát `shopify:block:select` / `deselect` trên `cart-drawer` | dialog mở / đóng | E2E mock | P3 |
| B-07 | AC8 | `/cart/update.js` `route.abort` | rời ô ghi chú drawer | alert `data-label-error`, chữ giữ nguyên | E2E mock | P2 |
| B-08 | AC4 | merchant chưa chọn `empty_cart_products` / `empty_cart_collection` | giỏ rỗng | không gợi ý (gộp TC-16, TC-17) | E2E thật | P3 |
| B-09 | mọi AC | mọi test | — | 0 console error (trừ nguồn nền tảng Shopify trong `store-guard.ts`), 0 pageerror | E2E | P1 |

Screen reader: live region `role="status"`/`role="alert"` kiểm ở TC-06..TC-10, TC-37; tên truy cập nút ở TC-01 (h2), B-01. Mobile 360 ở B-03, TC-42, TC-45; Pixel 7 chạy toàn bộ spec.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
Env thắng `tests/e2e/store-data.json` (ES1-T78).
- `TE4_VARIANTS_HANDLE` (variant-co-ảnh-rieng), fallback `TE4_SINGLE_HANDLE`: TC-01..TC-24, TC-26..TC-34, TC-42..TC-46. Variant mặc định hết hàng → skip.
- `TE4_UNIT_PRICE_HANDLE` (unit-price): TC-03.
- `TE12_DISCOUNT_READY` + collection `te12-bundle` (ES1-T178): TC-04; giỏ không có discount → skip có lý do.
- `TE4_TAX_INCLUDED_COUNTRY` (US): TC-18.
- `TE4_SELLING_PLAN_HANDLE` (amazing-aluminum-bag-collection10): TC-41; variant không có plan → skip.
- `TE5_QUANTITY_RULE_HANDLE`, `TE5_VOLUME_HANDLE`: chưa có (B2B D1, ES1-T298) → TC-39, TC-40 skip; AC9 đạt bằng mockup TC-37, TC-38.
- `EXPECT_CART_TYPE=page`: chỉ đặt khi preview có `cart_type` page (TC-24); `EXPECT_ORDER_NOTE=off`: chỉ đặt khi preview tắt ghi chú (TC-35).
- `free_shipping_threshold` của preview: 0 → TC-13, TC-14 skip có lý do (nhánh 0 đạt qua TC-12, TC-15).

## Gộp spec dev
TE-5.spec.ts là bản nghiệm thu QA theo AC, gộp hành vi của ES1-T94 (cart page, nojs), ES1-T95 (markup drawer), ES1-T96 (mở drawer, cart_type), ES1-T97 (đổi/xoá, lỗi), ES1-T98 (Shopify.actions, event). Contract tĩnh byte/hook, đo kích thước AC15 và hành vi JS trên origin giả (ES1-T369, ES1-T370) giữ ở spec dev, không chép lại.

## KHÔNG CHẮC
- Spec chưa chạy trên store trong phiên viết; kết quả lấy từ CI store-tests của PR.
- Xoá ES1-T94..T98 phụ thuộc ES1-T203 (đọc nguồn T96–T98) và ES1-T201 TC-04: đã hỏi Tech Lead ở ES1-T505 (mặc định giữ).
- Trong drawer, `cart-items` không có `data-label-updating` → status lúc đang ghi rỗng ("Updating cart…" chỉ có ở cart page). Thuộc AC18 (ngoài phạm vi ticket), không assert ở đây.
