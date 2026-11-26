KHÔNG CHẮC: (1) gzip base.css chưa đo được (gzip/node bị chặn trong sandbox): diff +19 dòng CSS (~1 KB thô), develop 37 029 B, ước tính < 37 500 B, trần 49 152; chờ CI. (2) Bổ sung ngoài danh sách ticket nhưng cùng loại "rule hướng thiếu :dir(rtl)": 2 nút căn giữa bằng `inset-inline-start: 50%` + `translate: -50%` (lệch cả khung ở RTL), hover trượt mũi tên 3px và link submenu 4px, nudge 1px của tag bài viết. (3) Bug LTR có sẵn, chưa sửa (ngoài phạm vi): `html[data-motion] a:hover > .slideshow-icon--arrow` (3px) thắng specificity rule trượt lùi của nút back `.article-main__back` (aux.css) và `.quiz__shortlist-back`, nên mũi tên back trượt tới thay vì lùi khi bật motion.

# ES1-T550 · Nền RTL: dir trên 3 thẻ `<html>`, rule `:dir(rtl)` còn thiếu, `<bdi>` cho phần trăm / giá

Nguồn: docs/ui-spec/foundation.md §34 (điều kiện 1, 2, 4), drafts/designer/ES1-T251/foundation.html #h-rtl, drafts/designer/_kit/kit.css mục RTL (dòng 1240–1250). Chưa bật locale RTL.

## Thay đổi
snippets/text-direction.liquid (mới)
- In `rtl` khi 2 ký tự đầu `request.locale.iso_code` (downcase) thuộc `ar,he,fa,ur`, còn lại `ltr`. Danh sách chỉ nằm ở đây.

layout/theme.liquid, layout/password.liquid, templates/gift_card.liquid
- `<html lang="{{ request.locale.iso_code }}" dir="{% render 'text-direction' %}">`.

assets/base.css (đặt cạnh rule LTR tương ứng)
- `.carousel-progress__thumb:dir(rtl)`: đảo dấu translate `(1 - 1/size) * pos * 100%`, thumb chạy từ cạnh phải (kit `:dir(rtl) .carousel-progress__thumb`). Giá trị `--scroll-pos` ở RTL do JS (ES1-T557, BE).
- `.cart-line__stepper:dir(rtl) { direction: ltr; }`: giữ − số + (kit `.quantity`). Theme không có stepper khác: product-form chỉ có ô số.
- `.product-media__play:dir(rtl)`, `.video-card__toggle:dir(rtl)`: `translate: 50% -50%` (cặp với `inset-inline-start: 50%`).
- Motion: `:dir(rtl)` cho hover trượt mũi tên `.slideshow-icon--arrow` (−0.75 × space-1, đối xứng 3px; loại trừ nút back và announcement bar vì đã có rule RTL riêng) và link submenu header (−space-1).
- `.article-card__tag:dir(rtl) { translate: 1px 0; }` (đối xứng nudge −1px).

Rà icon chỉ hướng (không đổi, đã đạt): mọi mũi tên / chevron trước–sau đi qua `snippets/slideshow-icon.liquid`, đã lật bằng `.slideshow-icon--previous/next/arrow/send:dir(rtl) { scale: -1 1 }` (carousel-nav, slideshow, pagination, CTA, back); back của bài viết / quiz giữ `scale: none` ở RTL; drawer header (`.site-header__drawer-row/back` rotate), sort select (collection.css:214), mega link, announcement bar, `.button--link` đã có. Không lật: search, bag, close, menu, plus/minus, chevron xuống của accordion/footer, play/pause, sao, logo (logo chỉ đổi `object-position`).

Bọc `<bdi>` (không đổi chuỗi dịch, textContent không đổi)
- snippets/product-card.liquid: nhãn badge (`sale_percent`, `sale`, `sold_out`); không render `<bdi>` rỗng khi badge `none`.
- blocks/featured-product.liquid: `featured-product__discount` (`sale_percent` / `sale`).
- snippets/price.liquid: khoảng giá, giá hiện tại, giá gạch, đơn giá; `<bdi>` sát thẻ mở/đóng để không thêm khoảng trắng (product-variant-picker.js đọc `.price__current` textContent).
- snippets/cart-lines.liquid, snippets/cart-summary.liquid: `cart.discount_value`.
- Dấu trừ U+2212 trong `sale_percent` / `discount_value`: ES1-T579, không đổi ở đây.

## Tự kiểm tra
- AC1: `grep -c 'dir="'` = 1 ở cả 3 file; locale `en` → `dir="ltr"` (nhánh else của snippet). Render trên preview: chờ CI.
- AC4: `git grep -nE '(^|[ ;{])(left|right):|translateX\(' -- 'assets/*.css'` = 0 dòng.
- `shopify theme check`: 0 lỗi; 9 warning có sẵn ở quiz-step, index*.liquid, 0 ở file của PR.
- Không file JS trong diff; không setting, không locale mới. `wc -c assets/critical.css` = 10 082 (không đổi). gzip base.css: chờ CI (xem KHÔNG CHẮC 1).
- AC2, AC3 (đặt `document.documentElement.dir='rtl'` ở 360 / 1280: trang chủ, collection, product, cart; badge "−24%" không thành "24%−"), AC5 e2e, Lighthouse, ảnh 360 / 1280 ltr + rtl: chờ CI / QA. Carousel cuộn đúng hướng ở RTL cần ES1-T557.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
