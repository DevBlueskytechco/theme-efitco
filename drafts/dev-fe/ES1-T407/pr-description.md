KHÔNG CHẮC: spec ES1-T407 chưa chạy trên trình duyệt (globalSetup cần PREVIEW_URL, sandbox không chạy Chromium); nhóm @static đã kiểm tay bằng script, khớp. Store dev chưa có dữ liệu TE407_* (xem cuối).

# ES1-T407 TS-FE7: blog excerpt_or_content, article thông báo comment, page.contact

Kế hoạch: drafts/techlead/ES1-T304/task-split.md §3 TS-FE7. Mục Shopify 7 Blog, 7 Article, 5/7 Page, 17. Audit B#6, #18, #24, #46.
Chỉ markup tối thiểu; giao diện đủ theo spec ở ES1-T381 (TE-20-R2-FE1), ES1-T382 (TE-20-R2-FE2), ES1-T383 (TE-21-R2-FE1).

## Thay đổi
- templates/blog.liquid: trích đoạn `article.excerpt_or_content | strip_html | truncatewords: 30` (rỗng thì không render `<p>`); ảnh qua `render 'image'` width 1200, widths `360, 540, 720, 900, 1200`, sizes `(min-width: 80rem) 1200px, 100vw`; bài đầu `eager` + `fetchpriority=high`, còn lại `lazy`; ảnh `alt=""` (tiêu đề link ngay dưới, blog.md §6). testid `blog-article`, `blog-article-excerpt`.
- templates/article.liquid: ảnh bìa widths/sizes như trên, eager + high (LCP), testid `article-cover`. Form `new_comment` (class `comment-form`, testid `comment-form`):
  - `form.posted_successfully?` → `.form-status` `role="status"` `tabindex="-1"` testid `comment-status`; `blog.moderated?` → "Thanks, your comment is in review" / "It appears here once a moderator approves it."; không duyệt → "Your comment is posted." (article.md §5).
  - `form.errors` → hộp `role="alert"` liệt kê `translated_fields` + `messages` (thay `default_errors`), lỗi inline theo trường với `aria-invalid` + `aria-describedby` (CommentAuthorError, CommentEmailError, CommentBodyError).
  - id duy nhất `CommentAuthor/Email/Body`, `autocomplete`, `required`, dấu * `aria-hidden` + "* Required"; ghi chú duyệt khi `blog.moderated?`; Email gợi ý "Not published."; nút `<button>` "Post Comment" (CTO 10/11 câu 3).
- templates/page.contact.liquid (mới): container → h1 `page.title` → `.rte` `page.content` (rỗng thì bỏ) → `{% form 'contact' %}` (class `contact-form`, testid `contact-form`): Name (`contact[name]`), Email* (`contact[email]`), Message* (`contact[body]`, gợi ý số đơn hàng), label thật, `form.errors` hộp `role="alert"` + lỗi email/body `aria-describedby`; `form.posted_successfully?` → hộp `role="status"` `tabindex="-1"` testid `contact-status` "Thanks for contacting us" + link "Continue Shopping" (`routes.all_products_collection_url`), thay form (page.md §6 S4). Không setting, không JS. Name không required theo ticket (page.md §2 ghi Name*; ES1-T383 quyết định khi làm block `contact-form`).
- locales/en.default.json: `blog.*` thêm `comment_pending_title/body`, `comment_posted`, `comment_moderated_note`, `comment_errors_title`, `comment_error_author/email/body`, `email_hint`, `required_note`; `comment_form_submit` "Post" → "Post Comment". Nhóm mới `contact.*` (name, email, message, message_hint, required_note, submit, success_title, continue_shopping, errors_title, error_email, error_body). Không trùng khoá/nhóm.
- assets/base.css (+~1,6 KB thô): class form chung tối thiểu `.form-field*`, `.form-status*`, `:is(.comment-form, .contact-form)`: input cao 44, viền `--color-muted-light` (5.33:1), hover foreground, focus outline accent 2px offset 2, lỗi viền `--color-sale` 2px + chữ; hộp trạng thái viền inline-start badge-new / sale. Chỉ token, logical properties.
- tests/e2e/ES1-T407.spec.ts: @static 4 test (đọc repo) + store 3 test.

## Hook cho BE (không có JS trong PR)
- Focus hộp sau POST: `[data-testid=comment-status]`, `[data-testid=contact-status]`, hộp lỗi `#CommentFormErrors`, `#ContactFormErrors` có `tabindex="-1"`; không JS thì Shopify đưa về neo form (`#comment_form`, `#contact_form`).
- Không `{% partial %}`.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning cũ ở index*.liquid, testimonial-item, bundle-builder, quiz-step, featured-product; không file nào của PR).
- `grep -n "excerpt_or_content" templates/blog.liquid` = 2 (1 code, 1 comment); `test -f templates/page.contact.liquid` ok.
- `gzip -c assets/base.css | wc -c` = 43 974 (≤ 49 152); critical.css không đổi (10 067).
- JSON locale parse ok, không khoá trùng (object_pairs_hook).
- Không file .js trong diff.
- Playwright smoke, spec ES1-T407 nhóm store, Lighthouse /blogs/<demo>, bài, /pages/contact, ảnh 360/768/1280: chờ CI.

## Dữ liệu store cần (QA/CTO)
- `TE407_BLOG_PATH`: blog có ≥ 1 bài không excerpt nhưng có content.
- `TE407_ARTICLE_PATH`: bài trên blog bật comment + "Comments are moderated".
- Page `/pages/contact` gán template `contact` (hoặc `TE407_CONTACT_PATH`).
Thiếu thì test store `fixme` (không tính đạt). hCaptcha `/challenge` sau submit → test skip có lý do, chạy tay và ghi lại vào PR.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
