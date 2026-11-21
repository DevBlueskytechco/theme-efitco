KHÔNG CHẮC: (1) `script[data-selected-variant]` (1 biến thể) theo spike ES1-T347 mục 4.3 và spec ES1-T347; ES1-T414 #3 đã đóng không có câu trả lời ghi lại, coi là đồng ý vì không phải JSON danh sách (NFR-7). (2) Tổ hợp không tồn tại xác định bằng `value.variant == blank` của giá trị đang chọn ở option đầu (quy tắc ES1-T253, ES1-T515), chưa kiểm trên store với `?option_values=` (spike H2) → chờ CI. (3) Tôi sửa 5 test store phụ thuộc trực tiếp markup đã xoá (select no-JS, JSON-LD offers), QA xem lại.

# ES1-T349 · TE-4-R2-FE2 · Ghi chú hợp đồng markup cho BE (TE-4-R2-BE2, ES1-T350)

Nhánh chồng: FE1 (ES1-T348, PR #281) + FE2 (ES1-T349) + BE2 (ES1-T350), merge một lượt (ES1-T515 mặc định 1). AC: NFR-7, TE-4 AC2, AC11, AC15, AC16. Nguồn: ADR 0008 mục 1, 3, 4; variant-picker.md §6, §10; product.md §17; spike ES1-T347 mục 3, 4.

## Thay đổi FE2

- `blocks/product-form.liquid`: bỏ noscript select; `has_variant_choice` dùng `product.variants_count`; tính `variant_exists`; input `name=id` chuyển vào partial `product-buy-buttons`; thêm JSON 1 biến thể, khối tồn có trạng thái tải, câu "tổ hợp không tồn tại", nút Unavailable.
- `blocks/product-info.liquid`: partial `product-price` có `data-variant-busy` + skeleton.
- `blocks/product-sticky-bar.liquid`: giá có `data-variant-busy` + skeleton; tổ hợp không tồn tại → nút disabled "Unavailable" (Choose Options + cuộn về bộ chọn là AC5 của TE-4-R2-FE6).
- `snippets/product-structured-data.liquid`: Offer của biến thể đang chọn + AggregateOffer (`price_min`, `price_max`, `variants_count`), không vòng lặp.
- Xoá `snippets/product-variant-select.liquid`; `blocks/featured-product.liquid` bỏ lệnh render nó.
- `locales/en.default.json`: thêm `products.variant.checking`, `products.variant.combination_unavailable`; bỏ `blocks.product_form.variant_label`, `variant_option`, `variant_option_sold_out` (không còn dùng).
- `assets/product.css` (ADR 0013, chỉ PDP): skeleton giá, dòng "Checking availability…", `cursor: progress` khi `aria-disabled`.
- Tests: `TE-4.spec.ts` TC-1101 (AggregateOffer), TC-251, TC-252, TC-851 (không select); `ES1-T156.spec.ts` nojs (hidden id).

## Partial PDP (ADR 0008 mục 3)

| Tên | File | Nội dung |
| --- | --- | --- |
| `product-options` | snippets/product-variant-picker.liquid | các fieldset; host `<product-variant-picker>` nằm ngoài, không bị thay |
| `product-price` | blocks/product-info.liquid | giá, ghi chú thuế/ship, skeleton |
| `product-buy-buttons` | blocks/product-form.liquid | input id, JSON 1 biến thể, tồn, câu unavailable, nút Add |
| `product-installments` | blocks/product-form.liquid | `payment_terms` |
| `product-selling-plans` | blocks/product-form.liquid | radio `selling_plan` |
| `product-pickup` | blocks/product-form.liquid | pickup |
| `product-sticky-bar` | blocks/product-sticky-bar.liquid | giá + nút thanh dính |

Chưa có: `product-countdown`, `product-media` (TE-4-R2-FE3, sau FE2). REGIONS của BE2 = 7 tên trên; ES1-T66 "contract partial" đang khoá 6 tên cũ → BE2 sửa cùng.

## Selector / data-* / testid

| Việc | Selector | Ghi chú |
| --- | --- | --- |
| Id đang chọn gửi lên | `fieldset[data-option-position] input[data-option-value-id]:checked` (trong `product-variant-picker`) | → `?option_values=a,b,c` (FE1) |
| URL nền | `product-form[data-product-url]` hoặc `location.pathname` | PDP không có `data-fetch-url` |
| Biến thể sau apply | `script[data-selected-variant]` trong `product-buy-buttons` (testid `product-selected-variant`) | `{"id","title","available","price","compare_at_price","options","featured_media"}` hoặc `null` khi tổ hợp không tồn tại |
| Id gửi giỏ | `input[name="id"]` testid `product-form-variant-id`, nay TRONG partial `product-buy-buttons` | `apply` có thể giữ value cũ → đặt lại tường minh từ JSON; `null` thì giữ id cũ (nút đã disabled) |
| Vùng tải | `[data-variant-busy]` (3 chỗ: `product-price`, `product-stock`, `product-sticky-bar-price`) | JS đặt/bỏ `aria-busy="true"`; CSS tự đổi skeleton + "Checking availability…" (`product-inventory-checking`); JS không style inline |
| Nút lúc chờ | `[data-testid=product-form-add]`, `[data-testid=product-sticky-bar-add]` | JS đặt `aria-disabled="true"`, không `aria-busy`, không đổi nhãn; chặn submit (spike mục 3: listener capture) |
| Tồn | `[data-testid=product-inventory]` `data-state` = `in_stock` / `sold_out` / `unavailable` (Liquid quyết) | JS không dựng nhãn Unavailable nữa (`data-label-unavailable` chỉ giữ cho test cũ và status) |
| Tổ hợp không tồn tại | `[data-testid=product-form-unavailable]` (id `{form_id}-unavailable`), nút có `aria-describedby` tới nó | do Liquid render trong partial |
| Lỗi đổi biến thể | `[data-testid=product-option-error]` + `[data-testid=product-option-retry]` trong fieldset vừa bấm | FE1 |
| Lỗi thêm giỏ (422) | `[data-testid=product-form-error]` | `product-form.js:14` đang lấy `[role="alert"]` đầu tiên trong `<product-form>` = alert của picker (FE1 thêm) → lỗi 422 ES1-T96 rơi sai chỗ. BE2 đổi sang `[data-testid="product-form-error"]` (hoặc `:scope > [role=alert]`). FE không đổi thứ tự DOM. |
| Status | `[data-testid=product-form-status]` role status | dùng `data-label-loading`, `data-label-loaded`, `data-label-load-error` trên host picker (FE1) |

## Việc BE2 cần sửa ngoài picker

- `assets/product-variant-picker.js`: bỏ `script[data-product-variants]`, `match()` theo tên (nguồn đỏ ES1-T158, T223, T347, TE-4).
- `assets/product-form.js`: selector lỗi 422 như trên.
- `assets/featured-product.js` + ES1-T158/T223: featured không còn JSON danh sách (D4) → theo ADR 0008 mục 3 (template `product.featured-product`, partial `featured-product`), chưa có ticket FE cho template này trong nhánh; hỏi Tech Lead nếu BE2 cần markup.
- Test ES1-T66, ES1-T87, ES1-T158, ES1-T223, TE-4.spec chọn radio theo value tên / đọc `.js` → sửa cùng BE2 (spike R4).
- AGENTS.md dòng 242, 312, 420, 539 còn nhắc `variant-json`: CTO sửa tay cùng PR (ADR 0008, ES1-T310 #2), FE không sửa.

## Tự kiểm tra

- `shopify theme check`: 0 lỗi, 22 warning có sẵn (không file nào của FE2).
- `grep -rn "for variant in product.variants\|variant-json\|product.variants | json" blocks snippets templates`: 0 dòng. Còn `variants.first` ở bundle-builder, shop-the-look-row (không phải vòng lặp, ngoài phạm vi).
- gzip: base.css 48 972 B (không đổi, ≤ 49 152); product.css 2 166 → 2 615 B (≤ 16 384).
- `npx playwright test --list`: 3 550 test / 104 file, parse được.
- Spec không cần store (config tạm không globalSetup): ES1-T347 tĩnh "NFR-7 bộ chọn không render JSON… không noscript select" hết đỏ; ES1-T66 contract partial, ES1-T67 contract, ES1-T478 (trần, prelude không trùng), ES1-T369 tĩnh: đạt. Test store: chờ CI sau BE2.
- Không file JS trong diff.
