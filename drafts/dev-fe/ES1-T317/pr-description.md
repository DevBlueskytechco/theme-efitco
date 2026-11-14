KHÔNG CHẮC: chưa đạt mục tiêu gzip ≤ 49 152 B; sandbox lượt 2 chặn gzip/node/python nên số gzip sau lượt 2 là ước lượng, số chính xác chờ CI (`gzip -c assets/base.css | wc -c`).

# ES1-T317 TE-10-R2-FE3: base.css dọn CSS chết, CSS đã bị thay

Phạm vi theo CTO 14/11 (ES1-T454 a, comment 10:40): chỉ xoá selector không còn markup dùng và rule đã bị rule sau đè hết; không đổi giao diện. Không file JS, Liquid, locale trong diff. Bỏ `drafts/dev-fe/ES1-T317/scan/*` của lượt 1.

## Kích thước

| | develop | nhánh |
|---|---|---|
| base.css byte thô | 273 176 | 271 403 (−1 773) |
| base.css gzip | 50 403 (số CTO ghi) | lượt 1: 50 145 (số CTO ghi); lượt 2 ước ~50 0xx, chờ CI |
| Trần tạm | 53 248 | đạt |
| Mục tiêu DoD | 49 152 | chưa đạt |

## Đã xoá / gộp

| Selector / khối | Lý do | Cách kiểm |
|---|---|---|
| `.text`, `.text--title`, `.text--subtitle` | block Text của Skeleton không còn | token không có trong blocks/ snippets/ templates/ layout/ assets/*.js |
| `.bundle-builder__note` | markup bundle-builder không còn | như trên |
| `.shop-the-look__discount-note` | markup shop-the-look không còn | như trên |
| `.gift-card__alert-icon` (trong nhóm với `.password-hero__error::before`) | gift card mới (ES1-T384) không dùng | như trên |
| `.collection-card__media` (nhóm bo góc 80rem) | collection-card mới (ES1-T334) không có phần tử này | như trên |
| `[data-reveal='wait']`, `[data-reveal='in']` (motion v1, ES1-T235) | bị `html[data-motion] [data-reveal…]` (v2, ES1-T250) đè đủ mọi thuộc tính; data-reveal chỉ được motion.js gắn khi đã đặt `data-motion` | đọc assets/motion.js: `dataset.motion = "on"` trước `reveal()` |
| `.slideshow__arrow--next .slideshow-icon { margin: -1px }` | trùng `.slideshow__arrow .slideshow-icon { margin: -1px }` | cùng giá trị |
| `.featured-collection__tab { justify-content }` tách dòng | gộp vào rule cùng selector | — |
| Khối 80rem trang chủ (Figma 1:359): ~40 rule trùng selector tách dòng (header, footer, faq, quiz, level-card, featured-product, testimonial, bundle) | gộp vào 1 rule mỗi selector, giữ thứ tự cascade; `top/left` → `inset-block-start/inset-inline-start` | so diff từng thuộc tính |
| `.featured-product__description { max-width: 674px }` | bị rule sau `max-width: none` đè | cùng media, cùng specificity, rule sau thắng |
| `.site-header__svg-search`, `shopify-account… svg` 24px trong 80rem | trùng rule ngoài media (dòng đầu khối trang chủ) | cùng giá trị |
| `padding` 4 giá trị ở predictive search | đổi sang `padding-block`/`padding-inline` (logical, TE-14 AC4) | giá trị không đổi |

## Không xoá (đã kiểm, còn dùng)

- Header cũ trước ES1-T319/T327: phần còn trong base.css là mega menu, drawer (ES1-T327), đều có markup trong blocks/header.liquid, snippets/header-mega-group.liquid.
- Slideshow trước ES1-T332: ES1-T332 đã viết lại khối, không còn rule cũ.
- Hàng cuộn collection-list, testimonials, blog, video trước ES1-T334: ES1-T334 đã xoá lưới cũ.
- Popup quiz (`.quiz__dialog*`): blocks/quiz.liquid vẫn dùng.
- Cart drawer: ES1-T368 chưa merge, giữ.
- `product-variant-picker` noscript, `.product-option*`: snippets/product-variant-select vẫn render (ADR 0008 làm ở task khác).
- Foundation ES1-T313 (`.dialog--*`, `.toast--*`, `.skeleton*`, `.spinner`, `--panel-*`, `--layer-*`): khung dùng chung cho task sau, chưa có markup nhưng là hợp đồng.
- `block-container--*`, `slideshow-icon--*`: class dựng động từ tham số Liquid.

Muốn xuống ≤ 49 152 cần thêm ~1 KB gzip: không còn khối chết chắc chắn; phần còn lại là CSS đang dùng (cần thay bằng task cart drawer ES1-T368, variant picker ADR 0008, quiz modal-dialog) hoặc chuyển khối tinh chỉnh px 80rem sang token, đều đổi giao diện tiềm năng nên ngoài phạm vi.

## Tự kiểm tra

- `shopify theme check`: 0 lỗi (23 warning có sẵn trên develop, không thêm).
- Không file JS trong diff; chỉ `assets/base.css`.
- Không literal `top/left` mới; không màu literal mới.
- gzip base.css: chờ CI.
- E2E, preview, Lighthouse 3 breakpoint: chờ CI (yêu cầu: mọi spec xanh trên develop giữ xanh).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
