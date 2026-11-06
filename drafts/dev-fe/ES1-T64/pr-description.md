KHÔNG CHẮC: (1) Figma không có trang sản phẩm → pill radio, quantity native, gift card/selling plan/pickup là mặc định kỹ thuật ES1-T59 D4 (CTO chốt ở ES1-T61, Designer soát ui_diff sau preview); (2) hidden id + noscript select cùng name=id: chưa kiểm được trên store là "id cuối thắng" — test `nojs` sai variant thì đổi hidden sang `disabled` và comment ES1-T66; (3) data-cart-type mặc định `drawer` theo ticket; CTO ES1-T60 nói TE-4 về cart page tới khi có TE-5 — BE2 đã chuyển /cart khi chưa có `cart-drawer` nên kết quả như nhau; (4) spec E2E ở drafts vì scope-guard chặn tests/; chưa chạy trên preview, dữ liệu gift card / selling plan / pickup / digital chưa chắc có trên store (ES1-T60 #1).

# ES1-T64 TE-4-FE3: blocks/product-form.liquid

Ticket: ES1-T64 · AC: docs/srs.md#TE-4 AC2 (markup, first available), AC3 (option, quantity), AC4, AC6, AC9 (pickup, 1 variant), quy tắc Hết hàng · Nguồn: drafts/techlead/ES1-T59/task-split.md D4, D10, D11.

## Thay đổi
- `blocks/product-form.liquid` (mới, 1 setting `show_dynamic_checkout` checkbox default true, không presets). Đọc `product` toàn cục, `current_variant = product.selected_or_first_available_variant`.
  - Root `<product-form>` + `block.shopify_attributes`: `data-product-id`, `data-product-url`, `data-cart-add-url` (`routes.cart_add_url`), `data-cart-url` (`routes.cart_url`), `data-cart-type` (`settings.cart_type | default: 'drawer'`), `data-label-add`, `data-label-sold-out`, `data-label-unavailable`.
  - Picker `<product-variant-picker>` ngoài form, không render khi `has_only_default_variant`. Mỗi option 1 `fieldset` + `legend`; value = `label` bọc `input radio name="option-{position}"` (visually-hidden) + chữ pill; swatch (`value.swatch.color/image` → `--swatch-color/--swatch-image`) thì ô tròn, tên ẩn. `checked` theo `current_variant.options[i]`, `data-available="{{ value.available }}"`, `data-option-value-id`. Ẩn bằng `@media (scripting: none)`.
  - Form `{% form 'product', product, id: 'product-form-{id}' %}`: hidden `name=id` = current variant; `noscript` → `select name=id` mọi variant ("title – giá", hết hàng disabled "title – Sold out").
  - `{% partial 'product-installments' %}`: `form | payment_terms`.
  - `{% partial 'product-selling-plans' %}`: khi có `selling_plan_groups`; radio `name=selling_plan`, One-time purchase value rỗng trừ khi `requires_selling_plan`; giá từ `current_variant.selling_plan_allocations` (có compare gạch); chọn sẵn `selected_selling_plan`, requires_selling_plan mà chưa chọn → plan đầu. Tên group hiện khi từ 2 group.
  - Quantity `input number name=quantity min=1 value=1` + label, không +/−.
  - Gift card (`product.gift_card?`): checkbox `properties[__shopify_send_gift_card_to_customer]` value on; `properties[Recipient email]` email, `properties[Recipient name]`, `properties[Message]` textarea maxlength 200, `properties[Send on]` date min hôm nay / max +90 ngày (giờ shop). Không `required` (field ẩn sẽ chặn submit). Hiện bằng `:has(:checked)`.
  - `{% partial 'product-buy-buttons' %}`: `p[data-state=in_stock|sold_out]` In stock / Sold out + `button type=submit name=add` Add to cart; hết hàng `disabled` + Sold out.
  - `form | payment_button` khi setting bật, trong form, NGOÀI partial, không CSS màu.
  - `{% partial 'product-pickup' %}` (ngoài form): chỉ khi `requires_shipping` và có `store_availabilities | where: 'pick_up_enabled'`; location đầu + trạng thái + `pick_up_time`; từ 2 location → `details` liệt kê phần còn lại (tên, trạng thái, giờ, `format_address`).
  - Live region rỗng: `role=status aria-live=polite` (visually-hidden), `role=alert` (chỉ có nền/viền khi có text).
  - Trạng thái rỗng: không có `product` → editor hiện gợi ý, storefront không render.
- `templates/product.liquid`: +1 dòng `{% block 'product-form' %}{% endblock %}` trong `div.product__details` (sau price tạm, trước description theo D3).
- `assets/base.css`: mục "Product form". Pill 44px bo `--radius-pill`, checked đảo màu foreground/background, `data-available=false` gạch chữ / gạch chéo swatch; input 44px viền `--color-border`; nút add full width 52px, disabled nền `--color-background-alt`; checkbox/radio từ `--touch-target-min`; summary pickup từ 24px. Chỉ token css-variables (44/52px theo `.button`, footer).
- `locales/en.default.json`: gộp `blocks.product_form` (+ `gift_card`, `pickup`). `en.default.schema.json`: `general.product_form`, `labels.show_dynamic_checkout`, `info.show_dynamic_checkout`.

## Hợp đồng cho BE
- BE1 ES1-T66 (`assets/product-variant-picker.js`, `snippets/variant-json.liquid`, thẻ script trong block này): custom element `product-variant-picker` (`data-form-id`, `data-product-url`); radio `input[name^="option-"]` trong `fieldset[data-testid=product-option][data-option-position]`, cập nhật `data-available`; hidden `[data-testid=product-form-variant-id]`. Partial: `product-installments`, `product-selling-plans`, `product-buy-buttons`, `product-pickup` (+ `product-price`, `product-sticky-bar` của FE2). Unavailable: đặt `product-inventory[data-state=unavailable]` + text `data-label-unavailable`, nút `disabled` + `.product-form__add-label`.
- BE2 ES1-T67 (`assets/product-form.js`): root `product-form` (`aria-busy` có CSS), form `#product-form-{id}`, live region `product-form-status` / `product-form-error`, gift card `.product-gift-card__fields` (bật/tắt `disabled`, thêm `properties[__shopify_offset]`).

## data-testid (22)
product-form, product-variant-picker, product-option, product-option-value (label bọc radio), product-form-variant-id, product-variant-select, product-quantity, product-selling-plans, product-selling-plan (label bọc radio), product-gift-card-toggle (checkbox), product-gift-card-email, product-gift-card-name, product-gift-card-message, product-gift-card-send-on, product-inventory, product-form-add, product-payment-button, product-installments, product-pickup, product-pickup-details, product-form-status, product-form-error.

## Tự kiểm tra
- `shopify theme check --path .`: 45 file, 0 offense.
- Locale JSON parse OK, không trùng key (kiểm bằng object_pairs_hook), key gộp vào `blocks` / `general` / `labels` / `info` sẵn có.
- Không file JS trong diff.
- Spec: `drafts/dev-fe/ES1-T64/ES1-T64.spec.ts` (15 test, tên bắt đầu AC2-markup / AC4 / AC6 / AC9 / nojs; nhờ Orchestrator chép sang `tests/e2e/ES1-T64.spec.ts`). Chưa chạy, chưa type-check.
- Playwright desktop + Pixel 7, nojs cart.js, axe, touch target, lhci 96/90/98, ảnh 360/768/1280: chờ CI.
- Lưu ý tạm thời: tới khi BE1 merge, bật JS mà đổi radio thì hidden id chưa đổi (thêm giỏ variant mặc định); không JS thì select chạy đúng.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
