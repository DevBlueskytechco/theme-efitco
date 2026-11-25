KHÔNG CHẮC: icon close/menu (snippets/header-icon.liquid) đặt `stroke-width="var(--icon-stroke-width)"` ở presentation attribute. Trước PR, chip lọc ở collection (`.collection-chips__chip`) và search (`.active-filters__chip`) nằm ngoài 5 scope khai 1.5 cục bộ; nếu trình duyệt thay var() trong presentation attribute thì nét X của chip đổi 1 → 1.5 (đúng kit, nhưng là đổi điểm ảnh ngoài trang AC2). Trang chủ, product không bị: mọi icon dùng biến đều trong header / `.close-button` / `.featured-product__add`.

# ES1-T540 — khai báo 40 token kit ở css-variables

Theo ES1-T567 (kit.css `:root` 150 biến). Chỉ khai báo, chưa áp vào component.

## Thay đổi

`snippets/css-variables.liquid` thêm 40 tên:
- Màu (6, alias, không thêm giá trị): `--color-success`, `--color-critical`, `--color-warning` + `-foreground` → `--color-badge-new` / `--color-sale` / `--color-accent`.
- Typography (19): `--font-size-eyebrow` clamp 14 → 16, `--font-size-h4` 1.25rem, `--font-body-weight` 500; letter-spacing body −0.01em, label −0.02em, heading −0.02em, display −0.03em (−0.04em từ 48rem), caps 0.04em; line-height sm 1.4286, label 1.5385, title 1.5556, reading 1.75, price-lg 1.4, eyebrow 1.25rem, h4 1.2, h3 1.2857, h2 1.25 (1.2222 từ 80rem), h1 1.2 (1.1667 từ 80rem), display 1.1538 (1 từ 48rem). `--line-height-heading` giữ tới ES1-T577.
- Icon (4): `--icon-size-sm/md/lg` 16/20/24px, `--icon-stroke-width` 1.5.
- Kích thước / layout (11): `--touch-target` 44px, `--control-height` 48px, `--control-height-compact` 44px, `--tab-height-desktop` 40px, `--row-height` 52px, `--count-badge-size` 20px, `--progress-height` 4px, `--meter-height` 8px, `--grid-columns` 4 / 8 (48rem) / 12 (80rem), `--content-width` (giá trị như `.block-container` cũ), `--dark-texture` (`url()` qua `asset_url` của noise-dark.png, vì style inline trong `<head>` không resolve đường dẫn tương đối theo assets/). Px hằng số, không theo `space_base`.
- 2 `@media` 48rem / 80rem trên `:root` cho grid-columns, letter-spacing-display, line-height display/h2/h1.

Xoá khai báo cục bộ:
- `assets/critical.css`: `--icon-stroke-width` ở `.site-header`, `--content-width` ở `.block-container` (giữ `--content-margin`, `--content-grid`).
- `assets/base.css`: `--icon-stroke-width` ở `.close-button` và `.localization__clear svg` (bản thứ 5, ticket ghi 4; xoá để AC1 = 0).
- `assets/collection.css` `.filter-group`, `assets/featured-product.css` `.featured-product__add`.

`--content-width` lên `:root` không đổi kết quả: biến không đăng ký nên `100%` tính tại phần tử dùng (`grid-template-columns` của `.block-container`, `.site-footer__main` nằm trong container).

Không file JS, không đổi settings_schema / locales.

## Tự kiểm tra

- `shopify theme check`: 0 lỗi; 9 warning có sẵn (quiz-step, index*.liquid), không thuộc file sửa.
- AC1: 40/40 tên có `--<tên>:` trong css-variables.liquid; `grep -rnE '[-][-](content-width|icon-stroke-width):' assets` = 0.
- Byte raw trước → sau: critical.css 10 082 → 9 931 (≤ 10 240); base.css 193 990 → 193 932; collection.css 29 050 → 29 021; featured-product.css 13 106 → 13 078; css-variables.liquid 7 243 → 9 498 (+2 255 B nguồn, inline vào mọi trang). Gzip: sandbox chặn `gzip`/python, chờ CI đo; CSS chỉ giảm byte nên không vượt trần.
- AC2 (ảnh 360 / 1280 trang chủ, product trùng pixel), AC3 (computed `:root`: 1280 `--line-height-h1` 1.1667, `--grid-columns` 12; 768 `--line-height-display` 1): chờ CI trên preview.
- Lighthouse, Playwright: chờ CI.
- Spec fixture tĩnh ES1-T365, T366, T382, T383, T323 dựng TOKENS không có `--content-width` → `.block-container` mất lưới trong fixture; đã tạo ES1-T590 cho QA thêm biến vào TOKENS (FE không sửa tests/).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
