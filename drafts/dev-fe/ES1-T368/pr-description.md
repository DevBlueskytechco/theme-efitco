KHÔNG CHẮC: (0) sau khi gộp develop, `gzip -c assets/base.css | wc -c` = 51 388, develop = 50 805 (+583 B), chưa đạt yêu cầu CTO "không lớn hơn develop"; đã bỏ hết comment, focus trùng, gộp rule trong mục Cart; phần còn lại là CSS AC (drawer mới, stepper, freeship, empty + bestsellers). Muốn về ≤ develop phải xoá CSS của mục khác (dialog/skeleton/spinner chưa dùng, comment toàn file) — ngoài phạm vi, chờ ES1-T454 / T317; (1) thêm 2 partial `cart-drawer-count`, `cart-drawer-footer` ngoài hợp đồng task-split §4 để ghi chú nằm ngoài partial (mini-cart-quickview §2, SRS TE-5 AC8), hỏi Tech Lead ES1-T453, im lặng = nhận; (2) tests/e2e/ES1-T95.spec.ts còn assert thiết kế cũ (rộng 100%/448, `data-partials`, `cart-checkout` trong `cart-drawer-body`, schema không settings): đỏ theo thiết kế, ES1-T99 viết lại (ES1-T453 #2); (3) copy `cart.empty_text` tự đặt (ES1-T453 #3); (4) tên biến `--shopify-accelerated-checkout-*` chưa đo trên preview.

# ES1-T368 TE-5-R2-FE1: cart drawer theo mini-cart-quickview (vòng 3b)

AC: TE-5 AC1, AC2 (markup), AC3, AC4, AC8, AC10; khung AC15, phần dòng AC11/AC12, AC16 (biến CSS), AC19 (drawer). Spec: docs/ui-spec/mini-cart-quickview.md §1, §2, §5, §9, §10; foundation §15, §18; layers (ADR 0007).

## Thay đổi

blocks/cart-drawer.liquid
- `<modal-dialog data-layer="cart">` bọc `<dialog class="drawer drawer--end drawer--wide">`: 90% / 420 (≥ 48rem) / 480 (≥ 80rem), scrim `--overlay-scrim` 50%, trượt từ CSS chung TE-10-R2-FE2. Giữ `id`, `scroll-lock`, `aria-labelledby`, mọi testid cũ.
- Header 72: h2 "Cart" + pill "{n} items" (partial `cart-drawer-count`, ẩn khi rỗng) + link "View cart" cao 44 tới `routes.cart_url` + `.close-button` 48 (form method dialog).
- Thân cuộn riêng (padding 16 / 24): vùng "Added to cart" `role="status"` (`cart-drawer-added`, hộp `data-cart-added` hidden, BE điền `data-cart-added-item`) → partial `cart-drawer` (freeship, dòng hàng hoặc empty state + tối đa 2 sản phẩm từ setting) → ghi chú `<details>` đóng sẵn ngoài partial (`cart-drawer-note`, textarea `data-note` name note form cart-form-drawer, label thật, gợi ý `aria-describedby`).
- Chân: panel tối `--color-background-panel` bo 16, cách mép 12 / 16, padding 24 / 32; partial `cart-drawer-footer` (cart-summary) + accelerated ngoài partial. CSS ẩn chân khi không có summary.
- Schema: `show_order_note` (checkbox, default true theo SRS), `empty_cart_products` (collection, trống).

snippets/cart-lines.liquid (chung drawer/page)
- Ảnh trong link `tabindex="-1" aria-hidden="true"`, alt rỗng, nền cream, contain + darken, bo 8; drawer 72 / 96 (srcset 72–192w), page giữ 96 / 120. Không ảnh: icon box muted-light.
- Option "Name: value", selling plan (AC10, giá dòng là giá theo plan), giá: có discount → final sale + original gạch (`cart-line-original-price` giữ); không discount mà compare-at (variant hoặc selling plan) > final → sale + compare gạch (`cart-line-compare-price` mới).
- Discount dòng: icon tag + chữ ẩn "Discount" + tên + "-{x}".
- Stepper: nút − / + `hidden` (BE gỡ), `aria-label` "Decrease/Increase quantity for {title}", `aria-controls` ô số, − `aria-disabled="true"` khi số lượng 1, hook `data-cart-step="-1"|"1"`; ô số giữ nguyên (`updates[]`, min 0, form). DOM: tên → − → ô → + → xoá (AC11).
- Xoá: icon thùng rác 44, `aria-label` "Remove {title}", vẫn `<a href=url_to_remove>` + `data-cart-remove`. Drawer đặt lên hàng tên bằng grid area.
- Empty state theo `.empty-state` (foundation §18): icon túi trong tròn 72, h2 "Your Cart Is Empty", 1 câu, drawer "Shop Bestsellers" (collection setting hoặc all products `?sort_by=best-selling`), page "Continue Shopping" + "Browse collections". Giữ `.cart-empty` + `cart-empty-cta` (cart-items.js focus `.cart-empty a`).

snippets/cart-summary.liquid
- Drawer: Subtotal + vạch chỉ khi có discount cấp giỏ; page giữ Subtotal. Discount: icon tag + tên, số "-{x}". Câu thuế luôn hiện (`cart.shipping_at_checkout` khi không gồm thuế). Checkout + mũi tên 16 × 14; drawer cao 52. Thêm testid `cart-summary`.

snippets/cart-free-shipping.liquid
- Icon xe 20 + câu "Spend **{x}** more to unlock free shipping" (`_html`); đạt: icon check + "Free shipping unlocked.", thanh + icon badge-new (`cart-free-shipping--reached`). Thanh 6px bo pill nền alt. Ngưỡng 0 / giỏ rỗng / khác tiền shop: không render (như cũ).

snippets/status-icon.liquid: thêm truck, tag, trash, edit, minus, plus.

assets/base.css
- Viết lại mục `/** Cart (TE-5` và `/** Cart drawer (TE-5` (giữ mốc cắt của test). Xoá CSS drawer cũ: `.cart-drawer__dialog` (100% / 28rem, scrim 60%, keyframes `cart-drawer-in`), `.cart-drawer__close`, `.cart-drawer__head/heading`, `.cart-drawer__form`, `.cart-empty__text`, 6 dòng motion `.cart-drawer__dialog` trong khối motion. Cart page giữ bố cục cũ, selector lưới chuyển sang `.cart-page .cart-line*` (FE2 làm tiếp).
- Accelerated: chỉ `--shopify-accelerated-checkout-button-block-size` (44), `-border-radius` (`--radius-button`), `-row-gap`; không màu/viền/filter.
- Panel: chữ phụ `--panel-muted`, discount `--panel-saving`, vạch `--color-muted`, focus outline trắng 2px.
- Hover/transition trong `prefers-reduced-motion: no-preference`, chỉ màu/viền/rotate với `--motion-*`.
- Lượt 2 (gộp develop a7cd8e8: T332, T327, T415, T384): giữ toàn bộ thay đổi develop, đặt phần ticket lên trên. Xung đột duy nhất `locales/en.default.schema.json` (not_found_*, password_* của T384 + show_order_note, empty_cart_products) — giữ cả hai. Mục Cart: bỏ comment thường (mốc `/** Cart (TE-5` và `/** Cart drawer (TE-5` giữ), bỏ outline accent riêng để dùng `:focus-visible` chung (2px currentColor, offset 2), gộp rule icon flex, `transition-*` tách thuộc tính. Khôi phục `@keyframes cart-drawer-backdrop-in`: lượt 1 xoá cùng CSS drawer cũ nhưng scrim menu header (`.site-header__scrim`) vẫn dùng.

locales
- en.default.json `cart`: thêm added, bestsellers, browse_collections, decrease_label, increase_label, discount_label, empty_cta, empty_heading, empty_text, free_shipping_remaining_html, item_count (one/other), note_hint, note_toggle, shipping_at_checkout, view_cart; đổi free_shipping_reached "Free shipping unlocked.", continue_shopping "Continue Shopping"; bỏ free_shipping_remaining, remove (không còn dùng). Không trùng key.
- en.default.schema.json: labels/info show_order_note, empty_cart_products.

Không có file JS trong diff.

## Hợp đồng cho BE (ES1-T98, TE-5-R2-BE1)

- Partial: `cart-drawer`, `cart-drawer-count`, `cart-drawer-footer`, `cart-count` (đọc từ `data-partials`, JS hiện tại chạy không cần sửa).
- `role="status"` thứ nhất trong `<cart-items>` vẫn là `cart-items-status`, `role="alert"` thứ nhất vẫn là `cart-items-error` (cart-items.js `say()`).
- Added: `[data-cart-added]` (hidden) + `[data-cart-added-item]` ("{title} · {variant}"); ẩn lại khi đóng drawer hoặc thao tác khác, không hẹn giờ.
- Stepper: gỡ `hidden` trên `[data-cart-step]`, CSS tự thu ô số về 48 và bỏ mũi tên; `aria-disabled` − ở 1, + sau 422.
- Ghi chú: `textarea[data-note]` lưu khi `change`; ngoài partial nên refresh không mất chữ, không đóng `<details>`.
- Focus mở drawer vào `cart-drawer-close`; layer `data-layer="cart"` cho page-layers / modal-dialog.

## Ngoài phạm vi ticket (đã có AC, task khác)
AC9 quantity rule + volume (FE2/FE7), AC12 gift card recipient, AC13 sold out + alert, AC17 thanh dính, AC18 "Updating cart…" + alert lỗi mạng, upsell TE-19; cart page bố cục AC14 (TE-5-R2-FE2).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 23 warning có sẵn (testimonial-item, bundle-builder), 0 offense ở file đã sửa; `.theme-check.yml` không đổi.
- `gzip -c assets/base.css | wc -c` = 51 388; develop 50 805 (+583, xem KHÔNG CHẮC (0)); trần ES1-T310 49 152 develop đã vượt (ES1-T454). `wc -c assets/critical.css` = 10 014 ≤ 10 240 (không đổi so với develop).
- Khoá i18n: mọi `| t` và `t:` trong cart-drawer, cart-lines, cart-summary, cart-free-shipping, templates/cart có trong locale; 0 key trùng; key bỏ (`cart.remove`, `cart.free_shipping_remaining`) không còn chỗ dùng sau khi gộp.
- Quét tĩnh base.css (regex của ES1-T217 TC-04/05/06, ES1-T171 TC-11, ES1-T94/T95 mục CSS): 0 màu literal, 0 margin/padding/inset vật lý, 0 bo góc cứng, 0 `z-index` số, mốc cắt đúng thứ tự, có reduced-motion.
- Setting mới: `show_order_note` default true theo SRS bảng TE-5; `empty_cart_products` trống.
- Playwright (`smoke`, ES1-T94..T98, ES1-T203), Lighthouse desktop/mobile, axe khi ép open, ảnh 360/768/1280/1920 drawer có hàng / rỗng / freeship / discount: chờ CI (global setup cần PREVIEW_URL, không chạy được ở máy agent). Dự kiến ES1-T95 đỏ ở các assert nêu trong KHÔNG CHẮC (2).
- Test cần dữ liệu store (TE4_VARIANTS_HANDLE, discount cấp giỏ, selling plan, free_shipping_threshold > 0 trên store dev): skip nếu thiếu, không coi là đạt.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
