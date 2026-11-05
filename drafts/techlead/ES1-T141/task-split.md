KHÔNG CHẮC: (1) sandbox từ chối shopify.dev (05/11, 403), chưa mở link nào; `/cart/add.js` items[] có nguyên tử không, 422 có tên sản phẩm không, trường form POST nhiều variant, context event là hiểu biết chung hoặc mặc định, chờ ES1-T143, chặn BE1; (2) "shop.money_format không theo market" là suy luận từ ES1-T74, chưa có nguồn, chờ ES1-T143 #6; (3) Figma chỉ có desktop, không có panel rỗng, Sold out, mobile: mặc định kỹ thuật, ES1-T145; (4) D2, D5 lệch hoặc bỏ phần có trong Figma (dòng Setup Discount, hotspot) và đặt bậc giảm mặc định tắt: PO xác nhận ES1-T146; (5) trần 5120 B của bundle-form.js là ước lượng từ assets/product-form.js, chưa viết thử; sau khi nạp động, tổng JS trang chủ vượt 40 960 B (D10), cần CTO biết; (6) chưa chạy gì trên store, đây là tài liệu chia task.

# ES1-T141 — Chia TE-12 Block bundle builder và shop the look thành task FE/BE

Nguồn: docs/srs.md#TE-12 (AC1–AC5; R8, R12) và mục 3 (hết hàng), docs/figma-inventory.md hàng 7, 9, docs/figma/snapshot-1-359.json node 1:560, 1:636, docs/figma/img/1-560.png, 1-636.png, DESIGN.md (bundle discount phải khớp discount thật), ADR 0001–0006, AGENTS.md, CONVENTION.md; ES1-T75, ES1-T81, ES1-T83, ES1-T85, ES1-T91, ES1-T95, ES1-T96, ES1-T117, ES1-T118, ES1-T137, ES1-T139; drafts/techlead/ES1-T132/task-split.md D5, D8 (nhánh feature/ai-ES1-T132); code: snippets/product-card.liquid, snippets/price.liquid, assets/product-form.js, assets/standard-events.js, assets/product-recommendations.js.
Ước lượng chốt TE-12: 13 point dev (FE 8, BE 5), bằng SRS sơ bộ 13; thêm 1 task QA và 1 task tài liệu merchant không point. Báo PO ở ES1-T146 #1.

## Lệch so với gợi ý trong ticket ES1-T141

| Gợi ý | Làm | Lý do |
| --- | --- | --- |
| BE chọn updateCart hay /cart/add.js | /cart/add.js items[] + dispatch CartLinesUpdateEvent | D6 |
| blocked_by ES1-T96..T98 | Chỉ ES1-T96 | T97 là cart-items, T98 là override Shopify.actions; BE1 không dùng cả hai (D6) |
| Bảng bậc qua block con hoặc setting | 3 bậc phẳng, 6 settings, mặc định tắt | D2 |
| Chỉ FE, BE, QA | Thêm TE-12-DOC1 cho writer | AC2 bắt buộc tài liệu merchant; scope-guard chỉ cho writer ghi docs/merchant |
| Tổng shop the look trong FE2 | Tổng do JS cộng, FE2 chỉ xuất data-price | D5: parent không đọc được con |

## Quyết định kỹ thuật

D1 Composition:

```liquid
{% block 'container', id: 'home-shop-the-look', tag: 'div' %}
  {% block 'shop-the-look', id: 'shop-the-look' %}
    {% block 'shop-the-look-row', id: 'look-row-1' %}{% endblock %}
    ...
  {% endblock %}
{% endblock %}

{% block 'container', id: 'home-bundle-builder', tag: 'div', background: 'cream' %}
  {% block 'bundle-builder', id: 'bundle-builder' %}{% endblock %}
{% endblock %}
```

- Bundle builder tự chứa: sản phẩm đến từ 1 collection (AC1). Shop the look có con: AC5 ghi block con.
- Thân rỗng và band rỗng: như ES1-T137 D1, cần `content | strip` của PR #85 (ES1-T118). PR #85 chưa merge thì mục "không có band rỗng" ghi chưa đạt, báo Orchestrator. Không sửa lại `blocks/container`.
- FE1, FE2 cùng sửa `templates/index.liquid` với PR #85, #87 và TE-7, TE-11 còn mở: Orchestrator rebase theo thứ tự merge, thứ tự band theo docs/figma-inventory.md.

D2 Bậc giảm (FE1):

| Lựa chọn | Ưu | Nhược | Kết luận |
| --- | --- | --- | --- |
| 3 bậc phẳng `tier_n_quantity`, `tier_n_percent` | Đúng AC1 "bằng setting"; Sidekick đọc được; đủ 12 settings của skill | Cứng 3 bậc | Chọn |
| Block con `bundle-tier` | Không giới hạn số bậc | Thêm file; parent không đọc được con, phải qua DOM; thêm 1 dòng template cho mỗi bậc | Loại |
| 1 text `2:10,3:15` | 1 setting | Merchant dễ sai cú pháp, editor không kiểm được | Loại |

- Mặc định percent bằng 0 ở cả 3 bậc, block không tự có % giảm. Theme không biết merchant đã tạo discount chưa; để sẵn số 10, 15 là giảm giả (R8, DESIGN.md "bundle discounts shown in the theme must match a real automatic discount"). Heading mặc định không có chữ Save, copy Figma chỉ nằm ở `index.te12`. ES1-T146 #2.
- Liquid chỉ xuất `data-tiers="2:10,3:15"`, không tính giá. JS tự sắp xếp, trùng ngưỡng lấy percent cao hơn; không kiểm trong Liquid.
- Text theo AC1: `Add %n more to get %p% off`, không cần số nhiều. Figma ghi `unlock`, AC thắng.

D3 Thẻ sản phẩm (FE1):
- Dùng lại `snippets/product-card`, thêm 1 param `show_swatches`. Không viết card mới: badge, giá, view event đã có. Bọc card trong label là lồng phần tử tương tác (card có link), nên checkbox nằm cạnh card, label phủ vùng ảnh.
- Truyền `variant` là variant mặc định: không truyền thì `snippets/price` hiện khoảng giá, panel lại cộng 1 giá, 2 con số lệch nhau. Bỏ swatch vì swatch đổi variant của thẻ còn checkbox thì không, khách sẽ thấy 1 variant và mua variant khác (ES1-T146 #6).
- Không swatch nên không nạp `product-swatch.js`; thẻ `product-swatch` ở block này không cần nâng cấp, không thêm ngân sách.
- Tên card vẫn là link: khách cần xem sản phẩm trước khi mua (ES1-T146 #8).

D4 Panel và đường không JS:
- Không dùng partial: dữ liệu tĩnh trong `data-*`, gọi server mỗi lần tick là thừa; drawer đã do TE-5 refresh.
- Trước khi module nâng cấp và khi không JS: chỉ còn tiêu đề, ghi chú, nút. Dòng số liệu chỉ hiện khi có `data-enhanced`, không hiện số sai. Giữ chỗ bằng `min-block-size`, DoD kiểm CLS.
- Nút ẩn bằng CSS `:has` khi không có món, chạy cả khi không JS. `visibility: hidden` để giữ chỗ và bỏ khỏi thứ tự Tab. Không dùng `disabled`: ES1-T96 trả focus về opener, opener disabled thì focus nhảy khỏi block.
- Form POST thật: checkbox `name="id[]"`, `routes.cart_add_url`, chờ ES1-T143 #4, FE1 kiểm trên preview. Lỗi hết hàng ở đường này do Shopify trả.

D5 Shop the look:
- `{{ content }}` đã render xong trước khi parent chạy và con không xuất biến ra ngoài (AGENTS.md), nên Liquid không cộng được tổng. Chuyển thành 6 setting product ở parent thì cộng được nhưng trái AC5 "block con". Chọn JS cộng từ `data-price`; không JS giá từng row vẫn hiện, không có dòng tổng.
- Mỗi row có 1 input hidden, cùng cấu trúc item với bundle để JS không phân nhánh.
- Row hết hàng không có input: không tính, không gửi. SRS mục 3 ghi "nút thêm vào giỏ disabled" theo nghĩa nút của sản phẩm đó; row không có nút riêng, khoá cả nút chung thì 1 món hết hàng làm hỏng cả set. ES1-T146 #5.
- Bỏ dòng Setup Discount và hotspot: có trong Figma, không có trong AC5. ES1-T146 #3, #4.

D6 Add nhiều sản phẩm:

| Lựa chọn | Ưu | Nhược | Kết luận |
| --- | --- | --- | --- |
| `/cart/add.js` items[] + CartLinesUpdateEvent | Đúng nguyên văn AC3; 1 request; cùng mẫu đã qua CI ở `product-form.js` (ES1-T85); không phụ thuộc thời điểm có `Shopify.actions` | Phải tự dispatch event | Chọn |
| `Shopify.actions.updateCart({ lines })` | Chuẩn action, tự phát event (ES1-T91 #2) | Trái AC3; docs không nói thời điểm có sẵn, phải guard (ES1-T91 #1); trả userErrors, chưa rõ có nguyên tử; cần ES1-T98 trước | Loại |
| Nhiều request, mỗi món 1 lần | Biết chính xác món lỗi | Trái AC3 "một lần"; thêm dở dang | Loại |

- CONVENTION.md yêu cầu tương thích Standard storefront actions: "override khi theme có UI riêng" do ES1-T98 lo, "dispatch event `shopify:*`" do BE1 lo. Theme tự thêm giỏ không bắt buộc đi qua action, `product-form.js` cũng vậy.
- Mở drawer qua `theme:cart:updated` (ES1-T96 lắng nghe trên document, chỉ bỏ qua source cart-items), BE1 không gọi thẳng drawer.
- Chỉ gửi `id` và `quantity`. Không properties, attributes, discount: AC2.
- Giữ lựa chọn sau khi thành công: bỏ chọn làm nút ẩn đúng lúc drawer trả focus. ES1-T146 #7.

D7 Lỗi:
- 4xx có description: hiện nguyên văn, không refresh, không mở drawer.
- AC3 "không thêm phần còn lại" dựa trên hành vi API chưa xác nhận. BE1 kiểm thật: gửi kèm variant hết hàng, so `/cart.js` trước và sau. Sai thì dừng, Tech Lead đổi D6. Không tự viết rollback bằng `/cart/change.js`.
- Mạng lỗi hoặc 5xx: báo lỗi, KHÔNG submit form lại như `product-form.js`. Request có thể đã vào giỏ; lặp với nhiều món tệ hơn 1 món.

D8 Tiền:
- `Intl.NumberFormat(data-locale, { style: 'currency', currency: data-currency })`, giá trị chia 100. Theo ticket, cùng nguồn `cart.currency.iso_code` với `snippets/variant-json`.
- Không dùng mẫu `shop.money_format` của `product-recommendations.js`: định dạng đó gắn với tiền shop, store dev từng gặp market BDT (ES1-T74). KHÔNG CHẮC (2).
- Hệ quả: chuỗi của `Intl` có thể khác `| money` trên thẻ ở vài tiền tệ (CAD ra `CA$`). Chấp nhận, số đúng. QA so với Intl, không so chuỗi cứng.
- Làm tròn: giảm là số hiển thị, có thể lệch 1 cent so với checkout. Ghi chú `discount_note` nói rõ giảm thật áp ở checkout.

D9 Thiết kế, token (mặc định, ES1-T145):
- Panel Figma #393942 không có token → `--color-background-dark` #1E1E1E (như TE-11 D7). #999999 đạt 5.85 trên #1E1E1E, chỉ 4.01 trên #393942: đổi nền còn sửa được contrast.
- Dòng giảm #4B824D: 3.65:1 trên #1E1E1E, không đạt AA 16px, không có token xanh. Dùng `--color-background-dark-foreground` + dấu trừ, không thêm token.
- Accent Figma #D94610 → `--color-accent`, chữ trên nút 5.01:1. Thanh tiến độ phần chạy accent (3.33:1 trên #1E1E1E, đạt 3:1 cho thành phần đồ hoạ), nền `--color-muted-on-dark`. Phần trăm luôn có text kèm.
- Band bundle `cream` (#F5F5F1 khớp Figma). Ô Fits `--color-background-sand` (#EBE6E0, Figma #EAE5DF), chữ phụ `--color-muted`.
- Số liệu mẫu 1:636 không nhất quán (ES1-T145 #5), không dùng làm kỳ vọng test. Lưới Figma 6, AC tối đa 9.

D10 Ngân sách JS (ADR 0006, nền từ ES1-T132 D8):

| Trang | Thành phần | Tối đa (B) | Còn lại (B) |
| --- | --- | --- | --- |
| Trang chủ | ES1-T132 D8 32 865, TE-12 không thêm thẻ script tĩnh (`lazy-module.js` đã tính) | 32 865 | 8 095 |
| Sản phẩm | Không đổi | 40 946 | 14 |
| Collection, cart, search | Không đổi | — | — |

- `assets/bundle-form.js` tối đa 5 120 B, import động qua `lazy-module.js`, không thuộc bảng theo định nghĩa ADR 0006.
- Sau khi nạp hết: 32 865 + quiz-finder 4 096 + bundle-form 5 120 = 42 081 B, vượt trần 1 121 B nếu khách cuộn tới cả 2 block. Không vi phạm ADR 0006 về câu chữ, cùng dạng ES1-T123 D8. TE-13 còn cộng thêm. CTO quyết có siết ADR không; lhci không cuộn nên không bắt được, QA1 ghi số thật.
- 2 block chỉ đặt ở trang chủ. Đặt lên trang sản phẩm: `lazy-module.js` 384 B vượt 14 B còn lại.
- 1 file cho cả 2 block; thẻ script lazy-module trùng URL trên 1 trang, trình duyệt chỉ chạy 1 lần.

D11 Hợp đồng FE → BE/QA (đổi tên phải comment ticket):
- Custom element, file: `bundle-form`, `assets/bundle-form.js`. Template: `index.te12` (`?view=te12`, gỡ trước khi lên store thật). Không có partial riêng; drawer dùng `cart-drawer`, `cart-count` của TE-5.
- Hook trên root `bundle-form`: `data-tiers` (chỉ bundle, có thể không có), `data-cart-add-url`, `data-cart-url`, `data-cart-type`, `data-currency`, `data-locale`, `data-label-count-one`, `data-label-count-other`, `data-label-progress` (`%n`, `%p`), `data-label-progress-done` (`%p`), `data-label-discount` (`%p`), `data-label-status` (`%n`, `%t`), `data-label-error`, `data-lazy-module` (BE1). Trạng thái: `data-enhanced`.
- Hook item: `data-bundle-item`, `data-title`, `data-price`, value là variant id, name `id[]`.
- Hook panel: `data-bundle-live`, `data-bundle-count`, `data-bundle-lines`, `data-bundle-line-template`, `data-bundle-line-title`, `data-bundle-line-price`, `data-bundle-empty`, `data-bundle-subtotal`, `data-bundle-discount-row`, `data-bundle-discount-label`, `data-bundle-discount`, `data-bundle-total`, `data-bundle-progress`, `data-bundle-progress-text`, `data-bundle-submit`, `data-bundle-status`, `data-bundle-error`. Thiếu hook nào thì JS bỏ qua phần đó: shop the look chỉ có count, total, submit, status, error.
- FE1 (23 testid): `bundle-builder`, `bundle-builder-eyebrow`, `bundle-builder-heading`, `bundle-builder-link`, `bundle-builder-list`, `bundle-builder-item`, `bundle-builder-input`, `bundle-builder-panel`, `bundle-builder-count`, `bundle-builder-lines`, `bundle-builder-line`, `bundle-builder-empty`, `bundle-builder-subtotal`, `bundle-builder-discount-row`, `bundle-builder-discount`, `bundle-builder-total`, `bundle-builder-progress`, `bundle-builder-progress-text`, `bundle-builder-note`, `bundle-builder-submit`, `bundle-builder-status`, `bundle-builder-error`, `bundle-builder-placeholder`. Card giữ `product-card*`.
- FE2 (19 testid): `shop-the-look`, `shop-the-look-eyebrow`, `shop-the-look-heading`, `shop-the-look-link`, `shop-the-look-image`, `shop-the-look-note`, `shop-the-look-rows`, `shop-the-look-count`, `shop-the-look-total`, `shop-the-look-submit`, `shop-the-look-status`, `shop-the-look-error`, `shop-the-look-placeholder`, `shop-the-look-row`, `shop-the-look-row-image`, `shop-the-look-row-title`, `shop-the-look-row-price`, `shop-the-look-row-badge`, `shop-the-look-row-input`.

D12 Test và dữ liệu:
- Preview không có block settings: `/?view=te12` đặt setting bằng param, cơ chế đã chạy thật (ES1-T117, PR #85). FE1 tạo file, FE2 thêm phần mình, BE1 không sửa.
- `index.te12` (FE1): bundle 1 collection `te12-bundle` (thiếu thì `collections.all`, cờ `TE12_COLLECTION_READY` chưa true thì test cần sold out skip có lý do), bậc 2:10, 3:15, copy Figma; bundle 2 không bậc.
- `index.te12` (FE2): look 1 có 6 row, gồm `TE4_SINGLE_HANDLE`, `TE4_VARIANTS_HANDLE`, `TE4_SALE_SMALL_PRICE_HANDLE`, `TE4_SOLD_OUT_HANDLE` (`all_products[...]`, handle viết cứng vì Liquid không đọc env, lấy từ tests/e2e/store-data.json), copy Figma 1:560; look 2 có 1 row, không ảnh; look 3 chỉ row hết hàng.
- Dev viết `tests/e2e/{key}.spec.ts`, tên test bắt đầu mã AC. dev-fe bị scope-guard chặn ghi tests/ thì nộp ở drafts, Orchestrator chép. QA1 gộp vào `tests/e2e/TE-12.spec.ts`.
- Trang chủ chưa cấu hình không có 2 block nên lhci trên trang chủ không đo được tải thật. QA1 đo thêm `/?view=te12`.

## Bảng task

| Mã | Ticket | Phía | Pt | Tên | Giải pháp | DoD | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TE-12-FE1 | ES1-T147 | FE | 5 | blocks/bundle-builder + snippets/product-card + templates/index + index.te12 + base.css + locales: 12 settings, tối đa 9 thẻ checkbox, Sold out disabled, panel, 3 bậc mặc định tắt, form POST không JS, 23 data-testid | D1, D2, D3, D4, D9, D11, D12 | `shopify theme check` 0; `npx playwright test tests/e2e/ES1-T147.spec.ts -g "AC1-markup\|AC4\|nojs"` pass desktop + Pixel 7; `wc -c assets/*.js` và critical.css không đổi; TE-1, TE-3 pass; axe 0 serious; lhci từ 96/90/98; ảnh 360/768/1280 | — |
| TE-12-FE2 | ES1-T148 | FE | 3 | blocks/shop-the-look + blocks/shop-the-look-row + templates/index + index.te12 + base.css + locales: 8 + 1 settings, ảnh + tối đa 6 row, ô ghi chú, Sold out, form POST không JS, 19 data-testid | D1, D5, D9, D11, D12 | theme check 0; `npx playwright test tests/e2e/ES1-T148.spec.ts -g "AC5-markup\|AC4\|nojs"` pass; ES1-T147, TE-1, TE-3 pass; `wc -c` không đổi; axe 0 serious; lhci từ 96/90/98; ảnh 3 breakpoint | ES1-T147 |
| TE-12-BE1 | ES1-T149 | BE | 5 | assets/bundle-form.js + thẻ script trong 2 block: 1 custom element, nạp qua lazy-module, panel + bậc hiển thị, add-many 1 request, 422, mở drawer, trần 5120 B | D4, D5, D6, D7, D8, D10, D11 | `wc -c` tối đa 5120; `npx playwright test tests/e2e/ES1-T149.spec.ts -g "AC1\|AC2\|AC3\|AC5"` pass; 422 thật không đổi `/cart.js`; ES1-T147, ES1-T148, TE-3 pass; 0 pageerror; axe 0 serious; lhci từ 96/90/98; bảng D10 trong PR | ES1-T143, ES1-T147, ES1-T148, ES1-T96, ES1-T139 |
| TE-12-DOC1 | ES1-T150 | writer | — | docs/merchant/bundle-builder.md: cấu hình 2 block, tạo automatic discount khớp bậc | D2, D5 | Đủ mục bắt buộc; label khớp locales (grep); PO xác nhận | ES1-T147, ES1-T148 |
| TE-12-QA1 | ES1-T151 | QA (e2e_from_story) | — | tests/e2e/TE-12.spec.ts + drafts/qa/ES1-T151/test-cases.md, AC1–AC5, desktop + Pixel 7, nhóm nojs | D10, D11, D12 | `npx playwright test tests/e2e/TE-12.spec.ts` pass desktop + Pixel 7; mỗi AC có test chạy hoặc skip có lý do; axe 0 serious; 0 console error; TE-1, TE-3 pass; lhci thêm `/?view=te12`; ghi JS thực tải | ES1-T147, ES1-T148, ES1-T149 |

Ghi chú: `\|` trong bảng là `|`; lệnh nguyên văn xem body ticket con. lhci = `npx lhci autorun` (desktop từ 96, mobile từ 90, accessibility từ 98).

Ánh xạ AC: AC1 FE1 (markup, bậc) + BE1 (cập nhật) · AC2 FE1 (ghi chú, default) + BE1 (không gửi giá) + DOC1 · AC3 BE1 · AC4 FE1 (thẻ) + FE2 (row) · AC5 FE2 (markup) + BE1 (tổng, add).
Thứ tự: FE1 → FE2 → BE1 (chờ ES1-T143, ES1-T96, ES1-T139) → DOC1, QA1.
Rủi ro lịch: ES1-T139 chờ ES1-T138, ES1-T138 chờ ES1-T133 (CTO đã trả lời, chưa đóng). FE1, FE2 không bị ảnh hưởng.

## Nguồn API

CTO đã tra trong ticket, dùng được:
- `Shopify.actions.updateCart`, `configure`, hành vi khi không cấu hình: https://shopify.dev/docs/api/storefront-events-and-actions/actions/update-cart (ES1-T91 #1, #2; chỉ để so sánh ở D6)
- CartLinesUpdateEvent: `action`, `context`, `lines`, dispatch trước request: https://shopify.dev/docs/api/storefront-events-and-actions/events/cart-lines-update (ES1-T91 #3, ES1-T83, ES1-T85)
- `partials.fetch`, `partials.apply` (TE-5 dùng, BE1 không gọi): https://shopify.dev/docs/storefronts/themes/architecture/partials (ES1-T75)
- Alternate template `?view=`, param object vào `block.settings`: https://shopify.dev/docs/storefronts/themes/architecture/templates/alternate-templates, https://shopify.dev/docs/api/liquid/tags/block (ES1-T117, PR #85 chạy thật)
- URL CDN standard events: https://shopify.dev/docs/api/storefront-events-and-actions/events (ES1-T81)
- Quá tồn thì add.js thêm số lượng tối đa: https://shopify.dev/docs/api/ajax/reference/cart (ES1-T91 #4)

Chưa mở được, CTO xác nhận ở ES1-T143:
- `/cart/add.js` items[] nguyên tử, 422 có tên, response 200: https://shopify.dev/docs/api/ajax/reference/cart — chặn BE1
- Trường form POST nhiều variant: https://shopify.dev/docs/api/ajax/reference/cart — không chặn, FE1 kiểm trên preview
- Context của event cho block trang chủ: https://shopify.dev/docs/api/storefront-events-and-actions/events/cart-lines-update — chặn BE1
- `cart.currency.iso_code`, `request.locale.iso_code`, đơn vị giá: https://shopify.dev/docs/api/liquid/objects/cart, https://shopify.dev/docs/api/liquid/objects/request — chặn BE1

Web platform (`Intl.NumberFormat`, `:has`, import động) không thuộc shopify.dev, kiểm bằng DoD.

## Câu hỏi

- ES1-T143 (CTO): API. Chặn BE1.
- ES1-T144 (CTO): collection `te12-bundle`, automatic discount, tồn thấp. Không chặn, test skip có lý do.
- ES1-T145 (Designer): mobile, trạng thái, màu, số liệu mẫu, ô Fits. Không chặn, có mặc định.
- ES1-T146 (PO): ước lượng, bậc mặc định tắt, Setup Discount, hotspot, row hết hàng, variant, giữ lựa chọn, link. Không chặn, có mặc định.

Ngoài phạm vi: hotspot và viền row đang chọn (ES1-T146 #4), dòng giảm shop the look (ES1-T146 #3), chọn variant trong bundle (ES1-T146 #6), trang preset bundles (ES1-T146 #9), sản phẩm bắt buộc selling plan (ES1-T146 #10).
