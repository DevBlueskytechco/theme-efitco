KHÔNG CHẮC: số dòng ngoại lệ AC1 trong ticket (base.css:2949 `.slideshow__track`, :2398 newsletter) lệch với develop hiện tại (3162, 2321); hai chỗ còn lại đúng là 2 dòng ticket loại trừ, giữ nguyên. gzip bị sandbox chặn, chưa đo số byte gzip (diff chỉ làm file ngắn đi).

# ES1-T537 FE: thang bo góc 4/8/12/16/20 + vai trò panel/swatch/dialog

Theo ES1-T567 (kit.css :root 114–128, foundation.md §1.2 "Bo góc", "Bo góc lồng nhau", bảng radius lẻ).

## Thay đổi
- `snippets/css-variables.liquid`: thêm 8 token: `--radius-xs` 4, `-sm` 8, `-md` 12, `-lg` 16, `-xl` 20 (hằng số), `--radius-swatch: var(--radius-sm)`, `--radius-panel: var(--radius-lg)`, `--radius-dialog: var(--radius-xl)`. Giữ `--radius-input/button/card/hero` theo setting và `--radius-pill`.
- `assets/base.css`: xoá `--radius-dialog: calc(var(--radius-card) * 2)` khỏi `:root` khung lớp → dialog, bottom sheet (base.css 261–262, 349) giờ bo 20 thay 24.
- 25 chỗ `calc(var(--radius-card) …)` (gồm khai báo `--radius-dialog` đã xoá):
  - `+ var(--space-1)` (16) → `var(--radius-panel)`, 17 chỗ: `.page-banner`, `.site-footer__main`, `.cart-drawer__footer`, `.collection-card > .collection-card__image`, `.collection-card__link::after`, `.level-card__link`, `--article-card-radius` (base.css); `.blog-articles__featured(-media)`, `.article-main__cover`, `.contact-aside` (aux.css); `.cart-summary--page`, `.cart-page .cart-free-shipping` (cart.css); `.bundle-builder__item`, `.bundle-builder__panel`; `.shop-the-look__media`, `.shop-the-look__panel`; `.quiz__form`.
  - `- var(--space-1)` (8), 6 chỗ: thumb → `--radius-swatch` (`.cart-line__media, .cart-drawer__bestseller-media`, `.shop-the-look-row__thumb`); khối khác → `--radius-sm` (`.site-footer__newsletter-media::before/::after`, `.site-footer__newsletter-image`, `.shop-the-look__note`, `.shop-the-look-row`).
  - `* 2` (24): `--radius-dialog` base.css (xoá, dùng token mới); `.quiz` ≥ 48rem là panel lớn trong trang → `--radius-xl` 20.
- `.featured-collection__tab` `calc(var(--radius-button) * 2)` → `var(--radius-sm)`.

Bo lồng đúng §1.2: thumb dòng giỏ 8 trong drawer/panel; card 12 trong panel 16; panel 16 trong dialog 20.

Không file JS trong diff. Ngoài phạm vi: `var(--figma-radius-*)` (ES1-T538), `.slideshow__track` + hero 16 (ES1-T576), khoảng cách (ES1-T536).

## Lưu ý hành vi
- Trước đây các bo dẫn xuất chạy theo setting `card_corner_radius` và `space_base`; nay là hằng số theo thang (đúng foundation §1.2: "Không viết calc(radius + space)"). Merchant đổi `card_corner_radius` chỉ còn ảnh hưởng card.

## Tự kiểm tra
- AC1: `grep -n "calc(var(--radius-" assets/*.css` còn 2 dòng: base.css:2321 `margin-inline-start: calc(var(--radius-input) * -1)` (lề, không phải bo) và base.css:3162 `.slideshow__track` (ES1-T576). Đạt.
- AC2: css-variables có 8 token mới; `grep -- "--radius-dialog:" assets/` = 0. Đạt.
- `shopify theme check`: 0 lỗi (9 warning có sẵn ở block Liquid, không thuộc diff).
- tests/e2e/ES1-T171 TC-10/11 (regex bo hardcode): giá trị mới đều là `var(--radius-*)`, không vi phạm.
- Kích thước raw sau sửa: base.css 193 702 B (giảm so với trước), cart.css 6 241, bundle-builder 13 992, shop-the-look 15 987, quiz 20 956, aux 37 733; critical.css 10 082 ≤ 10 240 (không đụng). gzip: chờ CI (sandbox chặn gzip).
- AC3 computed 1280 / 360 (dialog quick view, localization, sheet 20; card bài viết, panel footer 16; thumb giỏ 8), AC4 ảnh 360/1280 so #h-dialog/#h-panel, Lighthouse, Playwright: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
