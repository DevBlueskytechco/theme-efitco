KHÔNG CHẮC: heading newsletter giờ là text 1 màu, mất phần cam "Get 15% Off" của Figma 1:1148 khi store dev nhập chữ qua fixture ES1-T331; tests/e2e/ES1-T181.spec.ts (dòng 38, 41, 74–76) sẽ đỏ trên store chưa cấu hình. Đã hỏi Tech Lead ở ES1-T437.

# ES1-T402 (TS-FE2): footer bỏ dữ liệu Figma, default rỗng, nút Subscribe

Kế hoạch: drafts/techlead/ES1-T304/task-split.md §3 TS-FE2, ADR 0011 mục 3. Mục Shopify 7 Layout, 8, 14. Audit A#37, C4, N2.

## Thay đổi
- blocks/footer.liquid
  - Xoá nhánh `figma_pay` / `images['efx-pay-N.png']`. Payment icon chỉ còn `shop.enabled_payment_types | payment_type_svg_tag`, theo `show_payment_icons`, full color (không filter/opacity).
  - Setting mới `newsletter_button_label` (text, không default). Nút = setting, rỗng thì `'blocks.footer.newsletter_submit' | t` = "Subscribe".
  - `newsletter_heading` rỗng: không in `h2` (bỏ fallback `newsletter_heading_html`). Heading và text cùng rỗng: không in `div.site-footer__newsletter`, form vẫn hiện.
  - `newsletter_text`, `description`, `trust_text_1..4`: bỏ default. Rỗng thì ẩn (logic ẩn đã có; trust item rỗng không in, cả 4 rỗng thì không in `ul`, editor hiện placeholder `trust_placeholder`).
  - Thêm `data-testid="footer-newsletter-text"`. `{% doc %}` cập nhật.
- locales/en.default.json: xoá `blocks.footer.newsletter_heading_html`; `newsletter_submit` "Get 15% Off" → "Subscribe".
- locales/en.default.schema.json: `labels.newsletter_button_label` "Button label"; `info.newsletter_button_label`, `info.footer_hide_empty`. Gộp vào nhóm `labels`/`info` sẵn có, không trùng key.
- assets/base.css: `.site-footer__payment--images img` → `.site-footer__payment svg` (giữ 32 × 22 ở ≥ 80rem như Figma); xoá 2 rule chết `.site-footer__newsletter-heading span` (E3 cũ và "7. Get 15% Off").

Không file JS trong diff. `assets/motion.js` chỉ dùng `.site-footer__newsletter-image` và `#footer-newsletter`, không đổi.

## Hook cho QA / BE
- `[data-testid=footer-newsletter-submit]` chữ "Subscribe" khi store chưa cấu hình.
- `[data-testid=footer-payment-icon]` count = `shop.enabled_payment_types.size` khi bật `show_payment_icons`.
- `[data-testid=footer-newsletter-heading]`, `footer-newsletter-text`, `footer-description` không có trong DOM khi setting rỗng.

## Ảnh hưởng
- tests/e2e/ES1-T181.spec.ts kỳ vọng chữ Figma cứng → cần sửa theo fixture ES1-T331 (việc QA, ES1-T437).
- Store dev phải nhập heading, text, description, trust 1..4, button label qua fixture ES1-T331 để đo visual diff trang chủ.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn, không thuộc footer/locales).
- `grep -n "efx-pay\|figma_pay" blocks/footer.liquid` = 0; `grep -n "15%" locales/en.default.json blocks/footer.liquid` = 0.
- JSON locale parse ok, không key trùng.
- `gzip -c assets/base.css | wc -c` = 41 116 (≤ 49 152); `wc -c assets/critical.css` = 9 921 (≤ 10 240).
- smoke.spec.ts, axe footer, Lighthouse desktop/mobile, ảnh footer 360/768/1280: chờ CI.
