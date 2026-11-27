KHÔNG CHẮC: 3 icon đổi cỡ thật theo kit thay vì giữ số cũ (ô tìm localization 24 → 20, nút submit 404 và password 24 → 20, icon x của chip 14 → 16). Chưa đo được gzip base.css trong sandbox, chờ CI.

# ES1-T549 — FE (theo ES1-T567): icon nét 1.5, cỡ --icon-size-sm / md / lg

Nguồn: foundation.md §33, kit.css (`--icon-size-*`, `--icon-stroke-width`, `.close-button svg`, `.chip svg`, `.search-field svg`), ticket ES1-T549. Token đã khai báo ở ES1-T540 (`snippets/css-variables.liquid`).

## Nét (AC1)
- Bỏ mọi thuộc tính `stroke-width` số trên svg/path: status-icon (2 → token ×5, 1 → token ×1, 1.5 ×12), header-icon (bag 2 ×3; menu/close bỏ `stroke-width="var(...)"` vì thuộc tính trình bày SVG không nhận var(), trình duyệt bỏ qua và về 1), slideshow-icon pause/play (2), icon-trust (2 ×13, 1.3 ×2, 1.5 ×1), quiz-icon close (1.6), shop-the-look tag (2), password-hero eye (1.5), product-variant-picker caret (1.5).
- Nét lấy từ một rule ở base.css (nạp ở mọi layout kể cả password, gift_card):
  `:is(.header-icon, .status-icon, .slideshow-icon, .icon-trust, .quiz-icon, .product-option__caret, .shop-the-look__discount-icon, .password-hero__eye) { stroke-width: var(--icon-stroke-width); }`
  Path con không ghi stroke-width nên kế thừa từ svg. Icon tô đặc (search header, chevron, logo, sao, cờ, chevron 52, mũi tên CTA, send) không có stroke nên không đổi.
- header-icon: thêm class `header-icon` cho menu, close, bag (svg không có class trước đó).
- Bỏ `stroke-width` lặp: base.css `.site-footer__submit .slideshow-icon` (1.5 literal), featured-product.css `.featured-product__add svg`. Các dòng `--icon-stroke-width: 1.5` lặp ở base/collection/critical đã được ES1-T540 chuyển về css-variables.

## Cỡ (AC2, AC3)
Đổi px / `calc(var(--space-1) * N)` / `var(--space-4|5)` của rule cỡ icon sang token. `--space-*` theo setting spacing nên trước đây cỡ icon trôi theo setting; nay cố định 16/20/24.
- `--icon-size-sm` 16: `.slideshow-icon` mặc định, `.site-footer__form .status-icon`, `.localization__clear svg`, `.product-option__error-icon .status-icon` (16px), `.cart-line__step svg`, `.site-header__drawer-view-all .slideshow-icon`, `.announcement-bar__link .slideshow-icon` (critical), `.form-field__error/.comment-form__note .status-icon`, `.article-main__back .slideshow-icon` (aux), `.collection-chips__chip svg`, `.active-filters__chip svg` (14 → 16, AC3 chip 16), `.search-results__note-icon`, `.predictive-search__icon svg`, `.quiz-icon`, `.bundle-builder__discount-label .status-icon`, `.shop-the-look__discount-icon`, nhịp + / − FAQ (thanh 16).
- `--icon-size-md` 20: `.close-button svg`, `.toast__icon svg`, `.site-footer__submit .slideshow-icon`, `.cart-line__remove svg`, `.video-card__play/.video-card__toggle .slideshow-icon`, `.form-status__icon .status-icon`, `.site-header__svg-search`, `.localization__search > svg` (24 → 20, kit `.search-field > svg`), `.not-found__submit svg`, `.password-hero__submit svg` (24 → 20, kit `.button svg` / `.search-field__submit svg`), `.contact-form__submit .slideshow-icon`, `.collection-toolbar__filter .status-icon`, `.quiz__card-button svg`, `.quiz__notice-icon svg`, `.bundle-bar__alert .status-icon`; chiều ngang mũi tên `.button--link`, `.bundle-builder__submit`, `.shop-the-look__submit` (20 × 16).
- `--icon-size-lg` 24: `.site-header__icons svg:not(search)`, `.site-header svg` (critical), `shopify-account.site-header__icon`, `.site-header__account-icon`, `shopify-account::part(signed-out-avatar)`, `.alert__icon svg`, `.localization__empty svg`, `.predictive-search__notice-icon svg`, `.site-header__drawer-account svg`, `.product-media__play .slideshow-icon`, `.level-card__products .slideshow-icon` (< 80rem), `.featured-product__add svg`, cột icon FAQ.
- AC3 (1280): cart 24 (`.site-header__icons svg:not(.site-header__svg-search)` thắng `.site-header svg { width: auto }`), search 20, nút đóng drawer 20 (`.close-button svg`), chip 16.

## Giữ nguyên (ngoại lệ §33 / ngoài phạm vi)
- Chevron menu 9 × 5 (`.site-header__svg-chevron`, `.site-footer__chevron`), chevron 12 (drawer row, back, filter group), mũi tên CTA 16 × 14 (`.level-card__products .slideshow-icon` ≥ 80rem), chevron 52, sao 13 × 12, social 28, icon-trust 28/36/40/22, thumbnail badge 12, empty-state 32 trong tròn 72.
- `.site-footer__payment svg` 38 × 24 / 32 × 22: icon thanh toán full color của Shopify (§27), không phải icon nét; grep AC2 sẽ thấy `height: 24px` ở rule này, là ngoại lệ có tên.
- Icon vẽ bằng CSS: thanh + / − FAQ và x của `.product-media__close-icon` vẫn nét 2px (border / block-size), không phải svg; đổi sang 1.5 cần ticket riêng (border 1.5px làm tròn khác nhau theo DPR).
- icon-trust vẫn `stroke="#4D4D4D"` (màu cứng trong Liquid, chưa currentColor): đổi màu ảnh hưởng footer và testimonial, ngoài phạm vi ticket nét/cỡ; đề xuất ticket riêng.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 8 warning có sẵn ở `blocks/quiz-step.liquid`, `templates/index*.liquid` (không đụng).
- AC1: `git grep -nE 'stroke-width="(2|1|1\.3|1\.6)"' -- snippets blocks` = 0; không còn thuộc tính `stroke-width` nào trong blocks/snippets/templates/layout.
- AC2: không rule `svg` một dòng nào có 16/20/24px; rule nhiều dòng còn duy nhất `.site-footer__payment svg` (ngoại lệ ở trên).
- critical.css 9 941 B (≤ 10 240). base.css raw +615 B so với develop; gzip chưa đo được trong sandbox (gzip bị chặn), chờ CI kiểm ≤ 49 152 (trần tạm 57 344). aux.css, collection.css chỉ đổi tên biến, cùng độ dài ±.
- Không file JS trong diff. Không đổi markup/testid.
- Lighthouse, Playwright, ảnh 360 / 768 / 1280 so `#h-icon` (AC4): chờ CI sau khi Orchestrator push.

Theo dõi: thêm vào AGENTS.md quy ước "icon nét không ghi stroke-width trên thuộc tính SVG; thêm class svg vào rule `--icon-stroke-width` ở base.css" (Tech Lead quyết vì AGENTS.md ngoài phạm vi file FE).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
