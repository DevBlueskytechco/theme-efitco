KHÔNG CHẮC: base.css gzip 53 234 B, dưới trần tạm 53 248 nhưng lớn hơn develop 52 542 (+692 B). Quy tắc "mỗi PR không làm base.css lớn hơn develop" cần ngoại lệ CTO; hướng xử lý chờ CTO [Q] ES1-T472 (tách CSS theo template / nâng trần / giữ trần cứng).

# ES1-T369 TE-5-R2-FE2: cart page (cart-page, cart-lines, cart-summary, base.css, locales)

Story TE-5, AC5, AC9, AC10 (thêm phần trang giỏ của AC11–AC19 theo docs/ui-spec/cart.md). Sau TE-5-R2-FE1 (ES1-T368, #219). Phần JS (thanh dính, đồng bộ accelerated, lỗi dòng) là TE-5-R2-BE1.

## Thay đổi
- blocks/cart-page.liquid: 1 lưới trên `cart-items`; đầu trang h1 · số món · link "Continue shopping" (dùng class Text link chung `.empty-state__link`); partial `cart-page` gồm free shipping, dòng hàng, panel tóm tắt, Bestsellers khi giỏ rỗng (setting `empty_cart_collection`, default rỗng), thanh checkout dính `aside.cart-sticky-checkout` render `hidden` (setting `show_sticky_checkout`, default true). Accelerated + divider "or pay with" và ghi chú đơn (AC5, luôn mở, `aria-describedby` hint) nằm ngoài partial. Schema không presets, nhãn `t:`.
- snippets/cart-lines.liquid: hàng tiêu đề bảng `aria-hidden` (≥ 48rem); quantity rule rút gọn Min/Max/Increments, `step`/`max` chỉ khi có rule, `min="0"` giữ cho xoá dòng (AC9); dòng "Volume pricing applied" (AC10); lỗi dòng `hidden` + `aria-describedby`; giá gạch thành tiền. Không lặp `product.variants` (ADR 0008).
- snippets/cart-summary.liquid: biến thể `context: 'page'`: đầu panel h2 "Order Summary" + badge số món, Shipping "Calculated at checkout", Secure checkout + icon thanh toán (`payment_type_svg_tag`) chỉ ở page.
- snippets/status-icon.liquid: thêm icon `lock`.
- assets/base.css: CSS trang giỏ theo cart.md (360 / 768 / 1280 / 1920), panel tối dùng chung `--panel-muted`/`--panel-saving` với drawer; xoá CSS drawer trùng (grid-areas dòng hàng, màu panel trong footer) vì nay là mặc định chung của cart-line / cart-summary. Thanh dính ẩn khi có lớp mở (`html[data-layer-open]`), z-index qua `--layer-bottom-bar`.
- locales: key mới gộp vào nhóm `cart` sẵn có (không trùng key); schema locale cho 2 setting mới.
- tests/e2e/ES1-T369.spec.ts: hợp đồng tĩnh (partial, testid, schema, locale, CSS token/logical/z-index, trần gzip) + bố cục fixture với base.css thật ở 360 / 768 / 1280.

## Hook cho BE (TE-5-R2-BE1)
- Partial: `cart-page` (`data-partials="cart-page cart-count"` trên `cart-items`).
- Thanh dính: `data-testid="cart-sticky-checkout"`, bỏ `hidden` dưới 64rem khi panel ra khỏi màn, đặt `html[data-bottom-bar="cart"]`.
- Dòng: `data-quantity-rule`, `data-quantity-min/max/step`, `data-cart-line-error`, testid `cart-line-error`, `cart-line-quantity-rule`, `cart-line-volume`.
- `data-label-updating` ("Updating cart…"); accelerated `data-cart-accelerated` đồng bộ `hidden` theo `data-item-count`.

## base.css gzip
| | raw | gzip |
|---|---|---|
| develop (origin/develop) | 286 436 | 52 542 |
| nhánh lượt 1 | 292 679 | 53 387 (vượt trần 139 B) |
| nhánh lượt 2 (PR này) | 291 732 | 53 234 |

Lượt 2 cắt 153 B gzip: gộp reset list/margin, gộp `[hidden]`, link quay lại dùng `.empty-state__link`, tổng ở thanh dính dùng `.cart-summary__muted`/`.cart-summary__total`, bỏ comment, gộp rule 64rem. critical.css không đổi (9 995 B).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 25 warning có sẵn ở file khác (bundle-builder, featured-product, quiz-step, testimonial-item, breadcrumb, empty-state, page-title, templates/index*), 0 ở file của ticket.
- Không file JS trong diff.
- ES1-T369.spec.ts chạy local (config tạm, không preview): 6/6 test tĩnh đạt (gồm gzip 53 234 ≤ 53 248). 4 test bố cục fixture không chạy được local (sandbox chặn Chromium) → chờ CI.
- RTL: mũi tên "Continue shopping" dùng `rotate: 180deg` cộng với lật RTL sẵn có của `.slideshow-icon--arrow` → LTR chỉ trái, RTL chỉ phải; chỉ logical properties.
- Preview, Playwright E2E trên store, Lighthouse (desktop/mobile, trang /cart), ảnh 3 breakpoint: chờ CI. Test cần dữ liệu store (B2B quantity rule, volume pricing) có thể skip nếu store dev thiếu dữ liệu — không tính là đạt.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
