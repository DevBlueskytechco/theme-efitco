KHÔNG CHẮC: (1) phiên này bị sandbox từ chối shopify.dev (403), chưa mở được tài liệu nào; API chia 2 nhóm ở mục "Nguồn API": nhóm CTO đã tra trong ticket và nhóm link chưa kiểm, CTO xác nhận ở ES1-T91 → yêu cầu "trích dẫn shopify.dev" của ES1-T89 mới đạt một phần; (2) cách override `Shopify.actions`, chữ ký 3 action, giá trị `action`/`context` của `CartLinesUpdateEvent` khi đổi số lượng và xoá không có trong nguồn dự án → TE-5-BE3 chặn bởi ES1-T91, không đoán; (3) Figma không có cart drawer, cart page, thanh freeship (ticket ES1-T89 ghi inventory có, thực tế chỉ có frame Homepage) → layout là mặc định kỹ thuật, hỏi ES1-T93; (4) `/cart/change.js` quá tồn trả 422 hay 200 kèm số lượng bị giảm chưa kiểm → BE2 làm cả 2 nhánh; (5) accelerated checkout nằm trong dialog đóng trên mọi trang có thể ảnh hưởng Lighthouse và chưa chắc sống qua partial → đặt ngoài partial, lhci là cổng chặn (D6); (6) ngưỡng freeship theo tiền shop, market khác tiền thì ẩn thanh; giá trị 99 lấy từ câu FAQ Figma → hỏi ES1-T92; (7) chưa có lệnh nào chạy trên store, đây là tài liệu chia task.

# ES1-T89 — Chia TE-5 Cart drawer và cart page thành task FE/BE

Nguồn: docs/srs.md#TE-5 (AC1–AC7, Editions #4, #5, #18; R4, R7), docs/figma-inventory.md, DESIGN.md, ADR 0001–0006, AGENTS.md, CONVENTION.md, ES1-T20, ES1-T60, ES1-T75, ES1-T81, ES1-T83, ES1-T85; code: assets/product-form.js, assets/product-variant-picker.js, assets/standard-events.js, snippets/price.liquid, blocks/header.liquid, templates/cart.liquid.
Ước lượng chốt TE-5: 19 point dev (FE 8, BE 11) + 1 task QA không point. SRS sơ bộ 10 point chưa tính 2 giao diện dùng chung markup, freeship, chế độ page và 3 action. Báo PO ở ES1-T92 #5, không đổi phạm vi.

## Quyết định kỹ thuật

D1 Composition:
- 2 block mới: `cart-page` (gọi trong `templates/cart.liquid`, container `id: 'cart-main'`), `cart-drawer` (gọi trong `layout/theme.liquid` sau container footer, không bọc container vì dialog nằm ngoài luồng trang, không phải band). AGENTS.md chỉ cho gọi block ở layout/template nên 2 block không gọi nhau.
- 3 snippet dùng chung: `cart-lines` (dòng hàng + trạng thái rỗng), `cart-summary` (giảm giá cấp đơn, tổng, thuế, checkout), `cart-free-shipping`. Mỗi snippet nhận `cart`, `context: 'drawer' | 'page'`. Không tách block `cart-items`/`cart-summary` như gợi ý ở ticket: dòng hàng và tổng phải refresh cùng 1 partial, block cũng không gọi được block con.
- `{% partial %}` chỉ đặt trong block, không đặt trong snippet (các partial hiện có đều nằm ở block).
- AGENTS.md (Composition model, Theme map) bắt buộc cập nhật cùng thay đổi nhưng scope-guard chặn agent ghi → FE ghi hàng cần thêm trong PR description, CTO/Orchestrator áp (ES1-T91 #6). `product-recommendations` đang thiếu dòng trong Theme map từ TE-4.

D2 Drawer (FE2):
- Root `cart-drawer` luôn render để `assets/cart-drawer.js` nạp trên mọi trang (D9 cần). `data-mode="drawer"` khi `settings.cart_type` là drawer và `template.name` khác `cart`; ngược lại `data-mode="none"`, không có thẻ dialog.
- Cấu trúc: `dialog[scroll-lock]` → đầu (h2, nút đóng, ngoài partial) → `cart-items` (2 live region, ngoài partial) → `{% partial 'cart-drawer' %}` → wrapper accelerated (ngoài partial). Dialog không nằm trong partial, nếu không `apply` sẽ làm mất trạng thái mở và focus.
- Không JS: dialog đóng, cart link là link thường tới `routes.cart_url` (NFR-4).
- Layout mặc định: dưới 48rem toàn màn; từ 48rem rộng 28rem bám `inset-inline-end`; thân cuộn, chân cố định; CSS ở `base.css`.

D3 Cart page (FE1):
- `h1` trong block. `cart-items` → `{% partial 'cart-page' %}` chứa form, dòng hàng, tóm tắt. Từ 64rem 2 cột 8/12 + 4/12 sticky, dưới đó 1 cột.
- Form `id="cart-form-{context}"` `method="post"` `action={{ routes.cart_url }}`. Không JS: `updates[]` + nút `name="update"`, `url_to_remove`, nút `name="checkout"`.
- Note: `textarea name="note"` ngoài partial, gắn bằng thuộc tính `form`, lưu khi submit, không tự lưu bằng JS (AC5 chỉ ở cart page, hỏi ES1-T92 #4).

D4 Dòng hàng và tóm tắt (FE1):
- Không dùng `snippets/price.liquid` cho line: snippet này in giá `variant`, không có `final_price`, `original_price` của line và giảm giá line; ticket gợi ý tái dùng nhưng sẽ sai AC1. Tái dùng class `price__*` và key `products.price.unit_price_value`.
- Trường: `item.image` (`snippets/image`), `item.url`, `item.product.title`, `item.options_with_values` (bỏ khi `has_only_default_variant`), `item.properties` (bỏ key bắt đầu `_`), `item.selling_plan_allocation.selling_plan.name`, `item.final_price`, `item.original_price`, `item.unit_price` + `unit_price_measurement`, `item.line_level_discount_allocations`, `item.final_line_price`, `item.quantity`, `item.key`, `item.url_to_remove`.
- Quantity: `input type=number min=0`, không nút cộng trừ, giống TE-4, chạm 44px. Tóm tắt: `cart.cart_level_discount_applications`, `cart.items_subtotal_price`, `cart.total_price`, `cart.taxes_included`.
- Rỗng (AC4): text + CTA `routes.all_products_collection_url`, không render tóm tắt.

D5 Settings và freeship (FE1):
- Nhóm Cart trong `config/settings_schema.json`: `cart_type` (select `drawer`/`page`, default `drawer`; SRS mục 3), `free_shipping_threshold` (number, default 0 là tắt, đơn vị tiền shop).
- Liquid không có tỉ giá nên `cart.currency.iso_code` khác `shop.currency` → không render thanh, không hiện số sai (R8). Chữ và `progress` tính từ `cart.total_price` so với `threshold | times: 100`, giới hạn 100%.
- `config/settings_data.json` đặt 99 (FAQ Figma: "free on orders over $99") để preview có dữ liệu; settings_data rỗng và preview đẩy theo nhánh. Chờ PO ES1-T92 #1 #2.

D6 Accelerated checkout (FE1, FE2; BE đồng bộ): `{% if additional_checkout_buttons %}{{ content_for_additional_checkout_buttons }}{% endif %}` trong wrapper NGOÀI partial, cùng lý do `payment_button` TE-4 D4 (script Shopify tự mount), không CSS đè màu. Wrapper `hidden` khi `cart.item_count` là 0; partial root có `data-item-count`, BE đồng bộ `hidden` sau `apply`. Rủi ro: drawer có mặt mọi trang → FE2 đo lhci, không đạt thì comment ES1-T91 #5, không tự bỏ nút.

D7 Drawer JS (BE1, `assets/cart-drawer.js`):
- Focus trap dùng `showModal()`, trả focus về opener đã lưu. Không tự viết trap.
- Không cần sửa luồng add: `product-form.js` đã dispatch `theme:cart:updated` (bubbles) và TE-12 sẽ dùng cùng event. `cart-drawer` nghe trên document, bỏ qua `source: 'cart-items'`, refresh 2 partial rồi mở; refresh lỗi thì sang cart page.
- 2 sửa nhỏ `product-form.js`: (a) điều kiện rời trang hiện là không có thẻ `cart-drawer`, nhưng thẻ này luôn render và script có thể lỗi → đổi thành không có `cart-drawer dialog` hoặc chưa `customElements.get('cart-drawer')`, không thì khách kẹt, không có drawer cũng không điều hướng; (b) thêm `opener: submitter` vào detail vì nút đang bị khoá khi add.
- `cart-items.js` import động ở lần mở đầu qua `data-items-src` (không import tĩnh: `?v=` nhân đôi module, ES1-T81). Lỗi import thì form không JS trong drawer vẫn chạy.

D8 Dòng hàng JS (BE2, `assets/cart-items.js`):
- Delegate trên `cart-items`, ngoài partial nên không mất listener. `POST {data-cart-change-url}.js` JSON `{ id: key, quantity }`, `id` là line key để phân biệt 2 dòng cùng variant khác properties.
- Ghi tuần tự, chỉ huỷ refresh cũ: huỷ request ghi không đảm bảo server chưa áp, đổi nhanh 2 dòng có thể mất thay đổi.
- Sau `apply` gán lại `value` input theo response vì `apply` giữ value (AGENTS.md).
- 4 nhánh: thành công; 4xx có `description` (text API vào `cart-items-error`, input về số server); 200 nhưng quantity thấp hơn yêu cầu (gán lại + `data-label-quantity-adjusted`); mạng/5xx (về giá trị cũ, `data-label-error`). Không reject, 0 pageerror.
- Xoá dòng làm mất focus → sang input dòng kế, hết dòng thì CTA rỗng hoặc h1.

D9 Actions và event (BE3, chặn bởi ES1-T91):
- Override trong `cart-drawer.js` vì file nạp mọi trang; chỉ `getCart`, `openCart`, `updateCart` (ES1-T75). `getCart` luôn fetch, không cache. `openCart`: drawer → mở; cart page → focus h1; chế độ page → điều hướng.
- SRS AC7 ghi dispatch "sau mỗi thay đổi", doc CTO tra ở ES1-T83 yêu cầu dispatch TRƯỚC request, resolve sau → theo ES1-T83. Override `updateCart` không dispatch thêm vì action tự phát context `standard-action`. Promise chỉ resolve `CartLinesUpdateResult` (ES1-T85).

D10 Ngân sách JS (ADR 0006, số đo `wc -c` ngày 05/11; đã tính cả `cart-items.js` tuy nạp động, thận trọng hơn ADR):

| Trang | File | Tổng tối đa (B) | Còn lại (B) |
| --- | --- | --- | --- |
| Chung | header-menu 6 862, header-sticky 1 680, standard-events 888 | 9 430 | — |
| TE-5 mọi trang | cart-drawer 4 096, cart-items 5 632 | 9 728 | — |
| Sản phẩm | chung + variant-picker 7 156, product-form 6 900, media 4 407, recommendations 3 069 + TE-5 | 40 690 | 270 |
| Trang chủ | chung + slideshow 8 057, product-swatch 5 010 + TE-5 | 32 225 | 8 735 |
| Cart | chung + TE-5 | 19 158 | 21 802 |

Mỗi file tối đa 8 192 B, 2 file TE-5 đều dưới trần. Nợ kỹ thuật: trang sản phẩm chỉ còn 270 B theo cách tính thận trọng, thêm JS cho trang này phải gỡ bớt; trang chủ còn 8 735 B cho TE-11, TE-12, TE-13, phải tính khi chia các story đó. Trần theo task: `cart-drawer.js` BE1 2 816 → BE3 4 096; `cart-items.js` BE2 5 120 → BE3 5 632.

D11 Hợp đồng FE → BE/QA (đổi tên phải comment ticket):
- Tên partial (3): `cart-drawer`, `cart-page`, `cart-count` (đã có ở header, giữ nguyên).
- Custom element (2, FE render thẻ, CSS `display: block`): `cart-drawer`, `cart-items`.
- `cart-drawer`: `data-mode`, `data-cart-url`, `data-items-src`. `cart-items`: `data-cart-change-url` (`routes.cart_change_url`), `data-cart-url` (`routes.cart_url`), `data-partials` (`cart-drawer cart-count` hoặc `cart-page cart-count`), `data-label-updated`, `data-label-removed`, `data-label-error`, `data-label-quantity-adjusted`.
- Hook: `data-cart-link` (link header), `data-line-key` (dòng), `data-cart-remove` (link Remove), `data-cart-update` (nút Update, CSS ẩn khi `cart-items[data-enhanced]`), `data-item-count` (root trong partial), `data-cart-accelerated` (wrapper).
- FE2 (6): `cart-drawer`, `cart-drawer-dialog`, `cart-drawer-heading`, `cart-drawer-close`, `cart-drawer-body`, `cart-drawer-accelerated`.
- FE1 (35): trang `cart-page`, `cart-page-heading`, `cart-page-body`, `cart-page-note`, `cart-page-accelerated`; chung `cart-items`, `cart-items-status` (`role=status`), `cart-items-error` (`role=alert`), `cart-form`; dòng `cart-lines`, `cart-line`, `cart-line-image`, `cart-line-title`, `cart-line-options`, `cart-line-properties`, `cart-line-selling-plan`, `cart-line-price`, `cart-line-original-price`, `cart-line-unit-price`, `cart-line-discount`, `cart-line-total`, `cart-line-quantity`, `cart-line-remove`, `cart-update`; rỗng `cart-empty`, `cart-empty-cta`; freeship `cart-free-shipping`, `cart-free-shipping-progress`, `cart-free-shipping-text`; tóm tắt `cart-discounts`, `cart-discount`, `cart-subtotal`, `cart-total`, `cart-tax-note`, `cart-checkout`.
- Mỗi trang chỉ có 1 trong 2 giao diện (`/cart` không có dialog) nên testid trong snippet không trùng trên 1 trang.
- Giữ nguyên: `header-cart-link`, `header-cart-count`, `product-form*`, `data-cart-type`.

D12 Test và dữ liệu:
- Dev viết `tests/e2e/{key}.spec.ts`, tên test bắt đầu mã AC. QA1 gộp vào `tests/e2e/TE-5.spec.ts`.
- Có sẵn `TE4_VARIANTS_HANDLE`, `TE4_SELLING_PLAN_HANDLE`, `TE4_UNIT_PRICE_HANDLE`, `TE4_SALE_SMALL_PRICE_HANDLE` trong `tests/e2e/store-data.json`. Cần thêm `TE5_LIMITED_HANDLE`, `TE5_SHOP_COUNTRY`, automatic discount (ES1-T91 #7). Thiếu → `test.skip` có lý do; 422 và giảm quantity luôn có test bằng mock.
- AC3 dùng `?country=` theo `TE5_SHOP_COUNTRY`: CI từng chạy ở market BDT (ES1-T74), khi đó thanh freeship bị ẩn đúng theo D5.
- AC6: preview chỉ có một giá trị setting → E2E flip `data-cart-type` trên DOM, `EXPECT_CART_TYPE=page` chạy thật khi có preview đặt setting đó.
- Hồi quy TE-4: sau FE1 `cart_type` mặc định drawer, test chuyển /cart đã skip theo `drawerMode` trong `tests/e2e/ES1-T67.spec.ts`; `tests/e2e/TE-4.spec.ts` (PR #80, ES1-T90) phải giữ cùng điều kiện, ghi ở comment ES1-T96.

## Bảng task

| Mã | Ticket | Phía | Pt | Tên | Giải pháp | DoD | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TE-5-FE1 | ES1-T94 | FE | 5 | templates/cart.liquid + blocks/cart-page.liquid + 3 snippet + config/settings_schema.json + config/settings_data.json + assets/base.css + locales: 2 settings, partial cart-page, note, form không JS, 35 data-testid | D1, D3, D4, D5, D6, D11 | `shopify theme check` 0; `npx playwright test tests/e2e/ES1-T94.spec.ts -g "AC1\|AC3\|AC4\|AC5\|AC6\|nojs"` pass desktop + Pixel 7; JS tắt update, remove, checkout, note đúng; axe 0 serious; lhci từ 96/90/98; ảnh 360/768/1280 | — |
| TE-5-FE2 | ES1-T95 | FE | 3 | blocks/cart-drawer.liquid + layout/theme.liquid + blocks/header.liquid + assets/base.css + locales: dialog, partial cart-drawer, accelerated checkout, 2 chế độ, hook cart link, 6 data-testid | D1, D2, D6, D11 | theme check 0; `npx playwright test tests/e2e/ES1-T95.spec.ts -g "AC1-markup\|AC6-markup\|nojs"` pass; mọi trang 1 cart-drawer, /cart không dialog; TE-1.spec.ts vẫn pass; axe 0 serious khi ép open; lhci từ 96/90/98 home, product, collection | FE1 |
| TE-5-BE1 | ES1-T96 | BE | 3 | assets/cart-drawer.js + thẻ script trong blocks/cart-drawer.liquid + assets/product-form.js: custom element cart-drawer, showModal, refresh 2 partial rồi mở, chế độ page, tối đa 2816 B | D7, D10, D11 | `wc -c` cart-drawer.js tối đa 2816, product-form.js tối đa 6900; `npx playwright test tests/e2e/ES1-T96.spec.ts -g "AC1\|AC6\|AC8"` pass; ES1-T67, ES1-T85 không hồi quy; 0 console error; axe 0 serious; lhci từ 96/90/98 | FE2 |
| TE-5-BE2 | ES1-T97 | BE | 5 | assets/cart-items.js + thẻ script trong blocks/cart-page.liquid: custom element cart-items, /cart/change.js, partial refresh, aria-busy, 422 live region, trả số server, tối đa 5120 B | D8, D10, D11 | `wc -c` tối đa 5120; `npx playwright test tests/e2e/ES1-T97.spec.ts -g "AC2\|AC4"` pass cả drawer và /cart (đổi, xoá, mock 422, mock giảm quantity, abort); focus giữ; 0 console error; axe 0 serious; lhci từ 96/90/98 | FE1, FE2 |
| TE-5-BE3 | ES1-T98 | BE | 3 | assets/cart-drawer.js + assets/cart-items.js: override getCart, openCart, updateCart, dispatch shopify:cart:lines-update khi đổi và xoá, trần 4096 B và 5632 B | D9, D10 | `wc -c` tối đa 4096 và 5632; `npx playwright test tests/e2e/ES1-T98.spec.ts -g "AC7"` pass; đúng 1 event mỗi thay đổi; doc đầu file trích link; 0 console error; lhci từ 96/90/98 | ES1-T91, BE1, BE2 |
| TE-5-QA1 | ES1-T99 | QA (e2e_from_story) | — | tests/e2e/TE-5.spec.ts + drafts/qa/ES1-T99/test-cases.md, AC1–AC7 | D11, D12 | `npx playwright test tests/e2e/TE-5.spec.ts` pass desktop + Pixel 7; mỗi AC có test chạy hoặc skip có lý do dữ liệu; axe 0 serious; 0 console error; bàn phím trong drawer | FE1, FE2, BE1, BE2, BE3 |

Ghi chú: `\|` trong bảng là `|`; lệnh nguyên văn xem body ticket con. lhci = `npx lhci autorun` (desktop từ 96, mobile từ 90, accessibility từ 98).

Ánh xạ AC: AC1 FE1 (dòng hàng, tổng) + FE2 (drawer, accelerated) + BE1 (mở sau khi thêm) · AC2 FE1 (markup) + BE2 · AC3 FE1 · AC4 FE1 + BE2 (về rỗng sau khi xoá) · AC5 FE1 · AC6 FE1 (setting) + FE2 (chế độ) + BE1 · AC7 BE3. TE-4 AC8 đóng nốt ở BE1.
Thứ tự: FE1 → FE2 → (BE1, BE2 song song) → BE3 (chờ ES1-T91) → QA1. BE1, BE2 khác file, không xung đột; FE1, FE2 cùng sửa base.css và locales nên chạy lần lượt.

## Nguồn API

CTO đã tra shopify.dev, trích trong ticket (dùng được):
- Partials `fetch`, `apply`, `refresh`, `get`, `getAll`: https://shopify.dev/docs/storefronts/themes/architecture/partials (ES1-T75)
- Tên 3 action getCart, openCart, updateCart, không có showVariant: https://shopify.dev/docs/api/storefront-events-and-actions/actions (ES1-T75)
- `shopify:cart:lines-update`, `CartLinesUpdateEvent`, `createPromise`, `createCartFromAjaxResponse`, context `standard-action`: https://shopify.dev/docs/api/storefront-events-and-actions/events/cart-lines-update (ES1-T83, ES1-T85)
- Nạp thư viện từ CDN: https://shopify.dev/docs/api/storefront-events-and-actions/events (assets/standard-events.js, ES1-T81)

Link chưa mở được trong phiên (sandbox từ chối), tên API lấy từ code hiện có hoặc skill `cart-variant-logic`, CTO xác nhận ở ES1-T91:
- `/cart/change.js`, `/cart.js`, lỗi 422: https://shopify.dev/docs/api/ajax/reference/cart
- `cart`, `line_item`, `routes`, `additional_checkout_buttons`, `content_for_additional_checkout_buttons`: https://shopify.dev/docs/api/liquid/objects/cart, https://shopify.dev/docs/api/liquid/objects/line_item, https://shopify.dev/docs/api/liquid/objects/routes, https://shopify.dev/docs/api/liquid/objects/additional_checkout_buttons, https://shopify.dev/docs/api/liquid/objects/content_for_additional_checkout_buttons

Chưa có nguồn, không code tới khi có trả lời: cách override và chữ ký action; `action`, `context`, `lines` khi đổi số lượng và xoá (ES1-T91 #1 #2 #3).

## Câu hỏi

ES1-T91 (CTO, chặn BE3): chữ ký action, event, xác nhận API, AGENTS.md, dữ liệu store · ES1-T92 (PO): ngưỡng freeship, market, ô mã giảm giá, note, point · ES1-T93 (Designer): layout mặc định, soát ui_diff sau khi có preview. ES1-T92 và ES1-T93 không chặn; trả lời khác mặc định thì sửa trong task tương ứng.

Ngoài phạm vi: ô nhập mã giảm giá, nút cộng trừ quantity, tự lưu note bằng JS, đổi ngưỡng freeship theo tỉ giá, quick add, add nhiều sản phẩm (TE-12).
