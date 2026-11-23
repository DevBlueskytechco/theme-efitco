KHÔNG CHẮC: số dòng theo assets/base.css ở develop f173d16 (9 505 dòng); PR merge trước ES1-T565 làm lệch dòng, FE dò lại theo tên selector. Byte thô đo bằng `sed -n 'a,bp' | wc -c`, gzip chưa đo (Node bị chặn phiên này).

# ES1-T564 — selector → file đích (ADR 0014)

Quy ước:
- "phần" = tách selector list, chỉ phần tử của block đó đi.
- Khối trong `@media (min-width: 80rem)` mục "Trang chủ theo Figma" (8943–9222) và `@media (prefers-reduced-motion: no-preference)` (9250–9329, 9478–9505) phải bọc lại cùng `@media` trong file đích.
- Thứ tự trong file đích: mục chính → phần "Trang chủ theo Figma" → "Trải nghiệm mượt" → "Hàng ngang" → "Chuyển động v2". Thứ tự này giống base.css.

## ES1-T565

1. `assets/quiz.css` — nạp: `blocks/quiz.liquid`
   - 6828–7660 mục Quiz (≈ 17,1 KB thô), trừ phần `.quiz-page__breadcrumb*`.
   - 9026–9055 (@80rem Quiz).
   - 9190 `.quiz-option__input`.
   - 9237 `[data-quiz-title]:focus`.
   - motion: 9290 phần `.quiz-option`; 9295; 9296 phần `.quiz-step__bar*`; 9297 phần `.quiz-option__mark`; 9298 phần `.quiz-option:active …`.
   - 9501 `.quiz__dialog .quiz__results-item`; 9504 `@keyframes quiz-fade`.
   - Giữ base: token `--panel-muted`, `--panel-saving` (134–135), `--icon-tick`/`--icon-lock` (8936), `.dialog*`, `.product-card*`, `.empty-state*`, `.skeleton*`, `.spinner`.
   - → `assets/collection.css`: 7355 phần `.quiz-page__breadcrumb a:focus-visible`; 7406–7445 `.quiz-page__breadcrumb*`; 7620–7622 (@ trong mục Quiz) `.quiz-page__breadcrumb`. Markup ở `templates/collection.quiz.liquid:3`, template `collection`.
2. `assets/shop-the-look.css` — nạp: `blocks/shop-the-look.liquid`
   - 1782–2311 mục Shop the look + shop-the-look-row (≈ 13,0 KB thô).
   - 8987 phần `.shop-the-look__link`.
   - 9057–9072.
   - 9181 phần `.shop-the-look__eyebrow`; 9191 phần `.shop-the-look__note-title`; 9192–9193.
   - 9247 phần `.shop-the-look__submit`.
   - motion: 9290 phần `.shop-the-look-row`; 9299–9300; 9303–9305 phần `.shop-the-look__media`, `.shop-the-look__image`.
3. `assets/bundle-builder.css` — nạp: `blocks/bundle-builder.liquid`
   - 1046–1049 `.bundle-builder__item .product-card__rating` (đang nằm trong mục Product card).
   - 1405–1781 mục Bundle builder (≈ 8,7 KB thô).
   - 8987 phần `.bundle-builder__link`.
   - 9076–9101.
   - 9181 phần; 9191 phần `.bundle-builder__panel-title`; 9197.
   - 9247 phần `.bundle-builder__submit`.
   - motion: 9290–9291 phần `.bundle-builder__item`; 9296 phần `.bundle-builder__progress*`; 9297 phần `.bundle-builder__select::*`; 9298 phần `.bundle-builder__select:active::before`.
4. `assets/featured-product.css` — nạp: `blocks/featured-product.liquid`
   - 8232–8645 mục Featured product (≈ 9,4 KB thô).
   - 9103–9117.
   - 9181 phần; 9198–9211.
   - 9225 `.featured-product__seal`: `snippets/featured-product-seal` chỉ render từ `blocks/featured-product.liquid:277`.
   - 9247 phần `.featured-product__add`.
   - Giữ base: `.product-media*` (4066–4350, 9227), `.product-option*`, `.product-variant-picker*`, `.product-form*`, `.product-pickup*`, `.product-selling-plan*`, countdown chung. Dùng ở PDP và quick view (ADR 0008, 0009, 0012).
5. `assets/image-with-text.css` — nạp: `blocks/image-with-text.liquid` (index có 2 instance → 2 thẻ link, 1 lần tải)
   - 5779–6154 mục Image with text (≈ 9,8 KB thô).
   - 8988; 8998 `.block-container--dark .image-with-text__content`.
   - 9137–9138.
   - 9181 phần; 9194–9196.
   - motion: 9303–9305 phần `.image-with-text__accent*`, `.image-with-text__media*`.
   - 9474–9475 phần `.image-with-text__eyebrow`.
   - 9490–9491 `.image-with-text__heading[data-scrub] …`.

## ES1-T566

6. `assets/testimonials.css` — nạp: `blocks/testimonials.liquid`
   - 6633–6827 mục Testimonials (≈ 4,2 KB thô).
   - 8989–8990; 9125–9132.
   - Giữ base: 9133–9134 `.rating-stars*`, vì chung với product-card và featured-product.
   - 9181 phần; 9212.
   - motion: 9290–9291 phần `.testimonial-item`; 9303–9305 phần `.testimonial-item__image`.
   - Hàng ngang: 9354, 9367, 9368, 9372, 9378, 9379, 9381, 9395, 9408, 9409, 9412, 9413, 9415, 9423, 9427, 9430, 9432 phần `.testimonials*`, `.testimonial-item`.
7. `assets/video-carousel.css` — nạp: `blocks/video-carousel.liquid`
   - 8646–8898 mục Video carousel (≈ 6,2 KB thô).
   - 9119–9123.
   - 9181 phần.
   - 9229–9236.
   - motion: 9283–9284 phần `.video-card__poster*`; 9286 phần `.video-card__frame`; 9288–9289; 9306–9307.
   - Hàng ngang: 9354, 9367 (`.video-carousel__scroller`), 9369, 9371, 9378, 9382, 9383, 9395, 9408, 9409, 9412, 9413, 9415 (`.video-card-item`), 9424, 9427, 9430, 9454 phần video.
   - 9496 phần `.video-card`.
8. `assets/faq.css` — nạp: `blocks/faq.liquid`, `blocks/contact-aside.liquid`
   - 7990–8231 mục FAQ (≈ 5,4 KB thô).
   - 9145–9152.
   - 9181 phần `.faq__eyebrow`, `.faq__stat-label`.
   - 9214–9218; 9238.
   - motion: 9303–9305 phần `.faq__media`, `.faq__image`; 9310–9317.
   - Giữ `aux.css`: rule `.contact-aside .faq-item*` đã ở aux.css. aux.css nạp ở `<head>`, faq.css nạp sau trong body. Rule aux cùng độ ưu tiên mà muốn thắng thì phải có độ ưu tiên cao hơn: FE kiểm ảnh page.contact.
9. `assets/shop-by-level.css` — nạp: `blocks/shop-by-level.liquid`
   - 6251–6448 mục Shop by level + level-card (≈ 5,4 KB thô).
   - 9003–9011.
   - 9181 phần; 9184–9185.
   - motion: 9283–9284 phần `.level-card*`; 9286 phần `.level-card__link`; 9287.
   - 9474–9475 phần `.shop-by-level__eyebrow`.
10. `assets/multicolumn.css` — nạp: `blocks/multicolumn.liquid`
    - 7661–7817 mục Multicolumn (≈ 3,3 KB thô).
    - 9474–9475 phần `.multicolumn__eyebrow`.
11. `assets/hello-world.css` — nạp: `blocks/hello-world.liquid`, `blocks/liquid-tips.liquid`
    - 826–929 (`.welcome*`, `.highlight*`, `@keyframes highlight-flash`, ≈ 2,1 KB thô).
    - Riêng 930–934 `.product-card__view` giữ base.
12. → `assets/aux.css`: 8914–8915 phần `.contact-form__summary:focus-visible`, `.contact-form__status:focus-visible`. Phần còn lại của selector list (`.form-status*`) giữ base.

## Giữ base.css (không chuyển, lý do)

| Mục (dòng) | Lý do |
|---|---|
| 1–825 lớp, khung, toast, dialog, drawer, alert, empty-state, skeleton, spinner | component dùng chung |
| 936–1193 product card, price | featured-collection, collection, search, quiz, bundle, quick view |
| 1194–1404 featured-collection | class dùng ở collection-products, cart-page, 404; màn thứ 3–4 trang chủ |
| 2312–2530 breadcrumb, page-title, page-banner | nhiều template |
| 2531–3444 header, drawer, mega, announcement, footer | khung |
| 3445–3556 image, buttons, container | chung |
| 3557–3954 slideshow | màn đầu (LCP) |
| 3955–4038 rich-text | màn đầu trang chủ (home-intro), dùng ở template khác |
| 4039–4945 product page khung, product-media, variant picker, product-form | PDP + featured product + quick view (ADR 0013 mục 2) |
| 4946–5051 rte | chung |
| 5052–5778 cart, cart drawer | drawer mọi trang |
| 6155–6250, 9354–9435 collection-list, collection-card, Hàng ngang chung | màn thứ 2 trang chủ + list-collections |
| 6449–6632 blog-posts, article-card | article-card dùng ở blog, article, related-articles |
| 7818–7989 predictive search | header mọi trang |
| 8899–8934 form-status | product-form, contact, comment |
| 8935–9222 phần header, button, footer, product-card, price, rich-text, collection-list, featured-collection, blog | khung + chung |
| 9224–9329, 9478–9505 phần còn lại + `@keyframes motion-*` | chung |

## Ước lượng byte (thô, chưa trừ phần tách selector list)

| File | Thô mục chính | + rải rác | Gzip ước (÷ 5,4) |
|---|---|---|---|
| quiz.css | 17 149 | ≈ 3 000 | ≈ 3,7 KB |
| shop-the-look.css | 13 008 | ≈ 2 000 | ≈ 2,8 KB |
| bundle-builder.css | 8 679 | ≈ 2 800 | ≈ 2,1 KB |
| featured-product.css | 9 432 | ≈ 4 000 | ≈ 2,5 KB |
| image-with-text.css | 9 782 | ≈ 1 000 | ≈ 2,0 KB |
| testimonials.css | 4 177 | ≈ 2 000 | ≈ 1,1 KB |
| video-carousel.css | 6 211 | ≈ 2 500 | ≈ 1,6 KB |
| faq.css | 5 418 | ≈ 2 000 | ≈ 1,4 KB |
| shop-by-level.css | 5 389 | ≈ 1 200 | ≈ 1,2 KB |
| multicolumn.css | 3 308 | ≈ 150 | ≈ 0,7 KB |
| hello-world.css | 2 117 | 0 | ≈ 0,5 KB |
| Tổng rời base.css | ≈ 101 KB | | ≈ 18–20 KB → base.css ≈ 29–31 KB |

Mọi file dự kiến dưới trần 8 192 B. Index nạp 9 file (ES1-T565 5 + testimonials, video-carousel, faq, shop-by-level), tổng ước ≈ 48–50 KB. Ngân sách 53 248 B.
