KHÔNG CHẮC: AC11 ghi form ≤ 496px, Figma 1:1150 rộng 498.3 → dùng 31rem (496), lệch Figma 2px (trong ngưỡng ES1-T309 #4). Social giữ ô bấm 44 ở 1280/1920 (bỏ override Figma làm ô bấm < 44), nhịp icon lệch Figma vài px. gzip base.css chưa đo được trong sandbox (gzip/node bị chặn), chờ CI.

# ES1-T321 · TE-1-R2-FE4: footer 3 tầng × 4 mốc, form, Follow on Shop

AC: SRS TE-1 AC6, AC11, AC12 (phần markup/CSS), AC-H28 (store dev), R4.18. Spec: docs/ui-spec/foundation.md §4, §12, §27, §29.

## Thay đổi
blocks/footer.liquid
- Menu cột: `<details class="site-footer__menu">` đóng sẵn (< 48rem, hàng 52, link 44) + tiêu đề `<p class="site-footer__column-heading">` (từ 48rem); bỏ `<h2>` tiêu đề cột. testid `footer-menu-column`, `footer-menu-toggle`.
- Lỗi client `#footer-newsletter-invalid`: chữ trắng + `status-icon` error đỏ. Lỗi server `#footer-newsletter-error` (`role="alert"`): icon + chữ trắng. Thành công: hộp `form-message form-message--success` trong `role="status"`, icon success.
- Wordmark `aria-hidden="true"` (testid `footer-wordmark`); Follow on Shop testid `footer-shop-follow`, không rule màu nào cho nút.
- Social: tên truy cập "{shop} on {network}".
- Hàng cuối: DOM theo thứ tự 360 (wordmark → localization + thanh toán → copyright); từ 80rem grid đặt copyright trái, wordmark giữa, commerce phải. testid `footer-copyright`.
- Docblock cập nhật.

assets/base.css (chỉ phần footer)
- Nền tối + noise mọi mốc (trước chỉ ≥ 80rem); focus trong footer outline 2px trắng.
- Input: viền 100% `--color-muted-on-dark`, hover trắng, lỗi viền sale 2px (bóng trong, không đổi kích thước); bỏ outline accent trên `.site-footer__field`.
- Nút newsletter rộng hết cột < 48rem; form ≤ 31rem từ 80rem; 768 có ảnh thì form rộng hết hàng.
- Menu `<details>` < 48rem; từ 48rem `@supports selector(::details-content)` ép mở, ẩn summary, hiện tiêu đề; trình duyệt chưa hỗ trợ giữ accordion.
- Trust 2 × 2 < 48rem, 4 cột từ 48rem (80rem giữ bước Figma 1:1193); gạch trên trắng 12%.
- Follow group: cột, căn đầu dòng, cách 16.
- Xoá override cũ: link "Portable Fitness" trắng giả hover, social đầu trắng, social #B2B2B2 + ô bấm auto, `--figma-999999`/`--figma-white-12` ở footer, rule `.site-footer__invalid` chữ sale và focus accent cũ.

locales/en.default.json: `blocks.footer.social_link` (gộp vào `blocks.footer`).

Không đổi: setting schema, default rỗng (ES1-T402, ES1-T308 #1); không có "Get 15% Off" trong code/locale; payment icons `payment_type_svg_tag` full color, `aria-label="Payment methods"`.

## Hook cho BE
- ES1-T516: `assets/motion.js` gắn/gỡ `aria-describedby="footer-newsletter-invalid"` cùng `aria-invalid` (AC12). Hook có sẵn: form `#footer-newsletter[data-invalid]`.
- `.site-footer__disclosure` vẫn là riêng localization (motion.js chọn phần tử đầu tiên); menu dùng class khác.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn ở file khác, 0 ở footer).
- `wc -c assets/critical.css` = 10 082 ≤ 10 240 (không đổi). base.css 259 730 B raw; gzip: chờ CI (lần đo trước 44 240, diff +~1.5 KB raw).
- Diff CSS: 0 literal màu, 0 z-index số, thời gian qua `--motion-*`, chỉ logical properties.
- Không file JS trong diff.
- Preview, Playwright (TE-1 TC-32/33/35/36/37, ES1-T316 bản tin, ES1-T181 AC-H28 cần fixture store dev), axe, Lighthouse, ảnh 360/768/1280/1920: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
