KHÔNG CHẮC: settings_data.json `current` = `{}` nên lần push đầu lên store dev sẽ xoá 4 link social và free_shipping_threshold 99 đang có. Store dev phải nhập lại qua fixture ES1-T331. Trước khi có fixture, TE-1 TC-36 (social) tự skip, và thanh free shipping trong cart ẩn (ngưỡng 0).

# ES1-T401 (TS-FE1): logo, favicon toàn theme, fallback shop.name, settings_data trống

Nguồn: ticket ES1-T401, ADR 0011 mục 1 và 4, drafts/techlead/ES1-T304/task-split.md §1 D1, §3 TS-FE1. Mục Shopify 14, 13, 7. Audit C9, C10, C11, B#43.

## Thay đổi
- `config/settings_schema.json`: thêm nhóm `t:general.logo_and_favicon` ("Logo and favicon") ngay sau theme_info. Gồm `logo` (image_picker, info `t:info.theme_logo`) và `favicon` (image_picker, info "Will be scaled down to 32 x 32px").
- `config/settings_data.json`: `current` = `{}`. Đã bỏ social_tiktok/instagram/youtube/facebook_link và free_shipping_threshold.
- `blocks/header.liquid`, `blocks/footer.liquid`: logo lấy theo `block.settings.logo | default: settings.logo`. Không có logo nào thì in `<span class="site-header__logo-text">` / `<span class="site-footer__logo-text">{{ shop.name | escape }}</span>`, đây là chữ thật nên link vẫn có tên. Doc block ghi thứ tự 3 nguồn logo. Giữ nguyên testid `header-logo`, `footer-logo`.
- `snippets/logo-efitco.liquid`: xoá.
- `layout/theme.liquid`, `layout/password.liquid`: in `<link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 32, height: 32 }}">` chỉ khi `settings.favicon != blank`.
- `locales/en.default.schema.json`: thêm `general.logo_and_favicon`, `labels.favicon`, `info.favicon`, `info.theme_logo`. Sửa `info.logo` của block thành "Overrides the logo in Theme settings for this block. When both are empty, the shop name shows." Không trùng key (đã kiểm bằng object_pairs_hook).
- `assets/base.css`: xoá 3 rule `.site-header__logo-svg` / `.site-footer__logo-svg` (gồm rule 80rem). Thêm `.site-footer__logo-text { min-width: 0; overflow-wrap: anywhere; }` để tên shop dài trong footer xuống dòng. Header giữ ellipsis ở `.site-header__logo` (critical.css) theo D5. Chữ header dùng sẵn font heading và `--font-size-lg` của `.site-header__logo`. Không thêm literal màu hay cỡ chữ.
- `templates/gift_card.liquid` đã đọc `settings.logo` từ trước, giờ setting này có thật nên không phải sửa. Logo password (template) để TS-FE8 (ES1-T408) làm.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi. 22 warning đều có từ trước, nằm ở bundle-builder, featured-product, quiz-step, testimonial-item, index*.liquid, không file nào thuộc PR này. `.theme-check.yml` không đổi.
- `grep -rn "logo-efitco" blocks snippets layout templates assets` = 0. `grep -nE "social_|free_shipping" config/settings_data.json` = 0.
- `wc -c assets/critical.css` = 9 921 (≤ 10 240). `gzip -c assets/base.css | wc -c` = 41 251 (≤ 49 152, trước PR là 41 277).
- Không có file JS trong diff.
- Static test liên quan (TE-1 TC-04, ES1-T94 AC6) chưa chạy local được vì global setup cần `PREVIEW_URL`. Chờ CI.
- Chờ CI: smoke.spec.ts; `[data-testid=header-logo]` có text = shop.name khi store chưa chọn logo; `link[rel=icon]` trả 200 khi có favicon; Lighthouse desktop/mobile (perf, a11y, SEO, BP); ảnh header ở 360/1280. Figma diff header đã mask `header-logo` (figma-rows.json) nên logo dạng chữ không làm đỏ diff.

## Việc tiếp
- CTO: thêm dòng Theme map vào AGENTS.md cho setting logo/favicon toàn cục (ADR 0011, Hệ quả).
- QA ES1-T331: fixture store dev cần đặt `settings.logo` (logo Efitco), favicon, 4 link social, free_shipping_threshold 99.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
