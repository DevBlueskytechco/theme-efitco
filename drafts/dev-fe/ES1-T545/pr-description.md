KHÔNG CHẮC: (1) tests/e2e/ES1-T383.spec.ts:101 đang khớp `class="alert contact-form__summary"`, sẽ đỏ vì ticket yêu cầu đổi sang `.form-message--error`; đã tạo ES1-T616 cho QA sửa regex (FE không sửa spec). (2) Ticket không có khoá locale cho chữ link tóm tắt; thêm `contact.summary_*`, `blog.comment_summary_*` theo mẫu mockup "Name: enter your name". (3) Không đo được gzip trong sandbox (gzip/pipe bị chặn), chờ CI.

# ES1-T545 FE: khối tóm tắt lỗi .form-message--error + link từng trường (contact, bình luận, gift card)

Theo ES1-T567 (P1 accessibility), foundation.html #h-form (#f-errors), kit.css `.form-message*`, foundation.md §12, product-shopify-features.md §6, decisions components-10.

## Thay đổi

assets/base.css
- Thêm `.form-message` (flex, gap 12, padding 16, viền 1px border + thanh đầu 4px, bo `--radius-input`, chữ 14/20), `--success` / `--error` đọc alias `--color-success` / `--color-critical`, icon 16 (`.status-icon`), `__body`, `__title` (16/24, foreground), `__list` (grid gap 4, margin-top 8).
- `.form-message__list a`: `min-block-size: var(--touch-target)` (44) mặc định, `var(--touch-target-min)` (24) từ `min-width: 80rem`; underline 1px, hover 2px; focus outline 2px accent offset 2. `.form-message[tabindex]:focus-visible` outline 2px accent offset 2.
- `.form-message[hidden]`, `.product-form__error:empty` → `display: none`; list không còn mục hiện thì ẩn (bỏ khoảng trống).
- Bỏ `.product-form__error:not(:empty)` cũ (viền 2px sale, nền alt). Thêm `.product-form__input[aria-invalid='true']` (viền 2px critical), `.product-form__field-error` (câu lỗi + icon), `.product-form__optional` (muted).
- Footer: block mới đặt trước footer nên `.site-footer__message` vẫn đè khung; thêm `font-size/line-height: inherit` để footer giữ cỡ chữ cũ (không đổi Figma trang chủ); `.form-message--success` của footer → `.site-footer__message.form-message--success` đọc `--color-success`.

assets/aux.css
- Bỏ `.contact-form__summary-list` + `a` 44 mọi mốc, bỏ `.contact-form__summary[hidden]` (base lo). Giữ `.contact-form__summary:focus-visible` (ES1-T565 kiểm selector này ở aux).

blocks/contact-form.liquid
- `.alert.contact-form__summary` → `.form-message.form-message--error.contact-form__summary`; icon `status-icon`, `<strong class="form-message__title">`, `ul.form-message__list`. Link "Name: enter your name" / "Email: enter an email like name@example.com" / "Message: enter a message".
- Giữ nguyên: role="alert", tabindex="-1", data-contact-summary, data-contact-summary-title, data-contact-summary-for, data-label-1..3, testid contact-errors, contact-error-summary-link. Thêm hook chung data-form-summary, data-form-summary-title, data-form-summary-for (cho form-errors.js ES1-T554).

blocks/article-comments.liquid
- `.form-status--error` → `.form-message.form-message--error`, giữ `role="alert" tabindex="-1" id="CommentFormErrors"`, testid comment-errors. Tiêu đề "Check {n} field(s)" + link `#CommentAuthor` / `#CommentEmail` / `#CommentBody` (testid comment-error-summary-link) theo lỗi.
- Khối tóm tắt, mục list, câu lỗi `#CommentAuthorError/#CommentEmailError/#CommentBodyError` luôn render, `hidden` khi hợp lệ (để ES1-T554 kiểm trước POST). Đếm lỗi theo 3 trường thật. Lỗi chung (`form`) vẫn hiện tiêu đề "Your comment wasn't posted." + câu Shopify.
- article-comments.js chọn `#CommentFormErrors, [data-testid=comment-status]` theo thứ tự DOM: status đứng trước; khi không lỗi box bị hidden nên `focus()` không làm gì → không đổi hành vi.

blocks/product-form.liquid (gift card)
- `product-form-error`: thêm `form-message form-message--error`, `tabindex="-1"`; vẫn rỗng, con trực tiếp của product-form, không khoảng trắng bên trong (`:empty` ẩn). 422 vẫn ghi textContent như cũ.
- `template[data-form-summary-template]` (chỉ khi gift card): icon + `strong[data-form-summary-title]` + `ul.form-message__list` với `li[data-form-summary-for="<form_id>-gift-email|send-on"] hidden` → `a href="#…"`; data-label-1..2 "Check {n} field(s)". BE clone vào product-form-error rồi focus.
- Câu lỗi dưới trường: `#<form_id>-gift-emailError` (data-label-required, data-label-invalid, chữ trong `[data-form-error-text]`), `#<form_id>-gift-send-onError` (khoảng ngày lấy từ min/max, `date: format: 'abbreviated_date'`). testid product-gift-card-error-email / -send-on / -summary-template / -error-link.
- Nhãn "(optional)" cho name, message, send on; gợi ý message "200 characters left"; send_on_hint theo spec.

locales/en.default.json
- `blocks.product_form.gift_card`: optional, characters_left, error_email_required, error_email, error_send_on, error_summary {one, other}; sửa send_on_hint; bỏ message_hint (không còn dùng).
- `contact.summary_name/email/body`; `blog.comment_summary_author/email/body`; bỏ `blog.comment_errors_hint` (không còn dùng).

## Hook cho BE (ES1-T554)
- Quy ước chung: `[data-form-summary]` (data-label-N), `[data-form-summary-title]`, `li[data-form-summary-for="<input id>"]`, câu lỗi `#<input id>Error`. Contact giữ thêm data-contact-summary*.
- Gift card: clone `template[data-form-summary-template]` vào `[data-testid=product-form-error]`; chọn chữ email từ data-label-required / data-label-invalid; link text = `[data-form-error-text]`.
- Không thêm JS, không thêm script, không đổi partial.

## AC
- AC1: contact sai 1 ô → "Check 1 field" + 1 link hiện; sai 2 → "Check 2 fields" + 2 link (Liquid, không JS).
- AC2: `.form-message__list a` 44 dưới 80rem (360/768), 24 từ 80rem (1280/1920).
- AC3: bình luận lỗi có link href `#CommentAuthor` / `#CommentEmail` / `#CommentBody` theo trường lỗi.
- AC4: `blocks.product_form.gift_card.error_summary.one/other` có.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (8 warning có sẵn ở quiz-step, index.figma, index — không thuộc diff).
- Không file JS trong diff. Màu chỉ token/alias, khoảng cách token, thuộc tính logical, mobile-first `min-width: 80rem`.
- gzip base.css ≤ 49 152 B (trần tạm 57 344), aux.css ≤ 16 384: chờ CI (diff base +~2,6 KB thô ≈ +0,6 KB gzip; aux −0,3 KB).
- Spec bị ảnh hưởng: ES1-T383:101 (ES1-T616). ES1-T473, ES1-T382, ES1-T385, ES1-T565, TE-4, TE-5, ES1-T67 giữ hook/regex.
- Preview, Playwright, Lighthouse, ảnh contact/article lỗi 360/1280: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
