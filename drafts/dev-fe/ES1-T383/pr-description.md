KHÔNG CHẮC: số gzip base.css chưa đo được cục bộ (sandbox chặn gzip/node -e/git archive trong lượt này); chỉ có byte thô. Số gzip lấy từ CI, ES1-T326 TC-05 (`gzipSync(base.css) ≤ 53 248`).

# ES1-T383 TE-21-R2-FE1: page, page.contact, base.css, locales

AC: TE-21 AC1–AC6 (SRS 0.5, thay TE-9 AC2), R7.6. Nguồn: docs/ui-spec/page.md §1–§9, sổ 10/11 PG1–PG2, foundation §6, §12; accordion theo Figma 1:1057 (faq trang chủ).

## Thay đổi
- `templates/page.liquid`: `.page-reading` (cột 720 căn giữa từ 48rem), `{% render 'breadcrumb' %}`, `{% render 'page-title' %}` (1 h1), `page.content` trong `.rte`, ảnh nội dung `loading="lazy" decoding="async"`. Rỗng: chỉ h1; editor có câu gợi ý `page.empty_hint`, storefront không.
- `templates/page.contact.liquid`: DOM breadcrumb → h1 → intro `.rte` → `contact-form` → `contact-aside` (5 `faq-item`, câu 1 `open: true`, không câu mẫu — ES1-T308 #1). Bỏ form inline của ES1-T407.
- `blocks/contact-form.liquid` (mới): h2 (setting `heading` rỗng → locale), "* Required fields", đúng 3 trường Name*/Email*/Message* (hint số đơn hàng), `label for`, `autocomplete` name/email, `type="email"`; câu privacy link `shop.privacy_policy` (setting `show_privacy_note`, ẩn khi shop không có policy); nút primary "Send Message". Trạng thái Liquid: lỗi trường (aria-invalid + aria-describedby + icon + câu sửa), tóm tắt `role="alert"` "Check {n} field(s)" có link tới trường, lỗi chung `.alert` giữ dữ liệu, thành công `role="status"` + "Continue Shopping" (`routes.all_products_collection_url`). Không JS vẫn gửi được.
- `blocks/contact-aside.liquid` (mới): `<aside aria-labelledby>`, eyebrow, h2, `faq-item` `<details>` (mở nhiều câu), link Shipping/Refund policy từ `shop.*_policy`. Không câu hỏi: storefront không render, editor có placeholder.
- `assets/base.css`: form chung (§12) — ô 48 → 52 từ 64rem, textarea 144, lỗi viền inset 2px (không xô chữ), readonly/disabled, transition trong `prefers-reduced-motion: no-preference`; bỏ `.contact-form` khỏi selector form tối thiểu ES1-T407 (thay bằng `.contact-form__form`); thêm khối page/contact cuối file (lưới 12 cột từ 80rem, form 1–7, aside 9–12 sticky `--sticky-top + --space-5` = 104; aside summary ≥ 56, chữ đáp án `--color-muted` 7.68:1 trên alt). Chỉ token, logical properties, 0 màu literal, 0 z-index.
- `snippets/slideshow-icon.liquid`: icon `send` bỏ `<clipPath id="clip0_0_138">` (id trùng khi icon xuất hiện >1 lần, W3C/axe).
- `locales/en.default.json`: `blocks.contact_form`, `blocks.contact_aside`, `contact.*` (hint, privacy_html, sending, success_text, continue_shopping, check_fields one/other, error_name, error_form_*), `page.empty_hint`; xoá `contact.errors_title` (không còn dùng). Gộp vào nhóm đã có, không trùng key.
- `locales/en.default.schema.json`: `general.contact_form`, `general.contact_aside`, `info.contact_form_*`, `labels.contact_form_show_privacy_note`.
- `tests/e2e/ES1-T383.spec.ts` (mới): tĩnh AC1–AC6 + store AC1–AC6. `tests/e2e/ES1-T407.spec.ts`: AC thay — form chuyển sang `blocks/contact-form.liquid`, template gọi block; kiểm form trên block, `.rte` trên template.

## Hook cho BE (ES1-T474)
`form[data-contact-form]` + `data-label-sending`, `[data-contact-live]`, `[data-contact-summary]` + `data-label-1..3` + `[data-contact-summary-title]`, `li[data-contact-summary-for]`, `#ContactNameError/#ContactEmailError/#ContactBodyError`, `#ContactBodyHint`, `.contact-form__status`. JS lo: lỗi khi rời trường, focus tóm tắt/hộp thành công sau tải lại, `aria-busy` + `readonly` khi gửi (TE-21 AC4, AC5 phần có JS). Không file JS trong diff.

## Ngân sách CSS
- base.css thô: develop 281 431 B → nhánh 288 345 B (+6 914 B).
- gzip: develop ~51 KB (CTO 16/11) → chờ CI ES1-T326 TC-05 (trần tạm 53 248 B, ES1-T454; trần mới chờ ES1-T472).
- critical.css: 9 995 B (≤ 10 240, không đổi).
- CSS cũ thay thế đã xoá: `.contact-form` trong selector form ES1-T407, các giá trị ô/viền lỗi cũ (ghi đè tại chỗ, không thêm khối song song).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 23 cảnh báo ở 8 file khác (index*, bundle-builder, featured-product, quiz-step, testimonial-item, empty-state), 0 trong file của PR.
- Không file `assets/*.js` trong diff; không `{% stylesheet %}`/`{% javascript %}`, không presets.
- Playwright (ES1-T383, ES1-T407, ES1-T326 TC-05): chờ CI (globalSetup cần PREVIEW_URL). AC4 đường không JS có thể skip nếu hCaptcha chặn submit tự động — test tự ghi lý do skip, không coi là đạt.
- Lighthouse page, page.contact (desktop/mobile), ảnh 3 breakpoint 360/768/1280, visual diff: chờ CI.
- Dữ liệu store: `TE383_CONTACT_PATH` (mặc định `/pages/contact`, gán template `page.contact`; thiếu → fixme), `TE383_PAGE_PATH` (page mặc định có bảng/ảnh/link), câu hỏi faq-item trên store dev (fixture TE-17-R2-QA0; thiếu → test aside skip). Test skip/fixme vì thiếu dữ liệu không tính là đạt.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
