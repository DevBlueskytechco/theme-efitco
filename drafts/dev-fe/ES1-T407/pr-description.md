KHÔNG CHẮC: spec ES1-T407 chưa chạy trên trình duyệt (globalSetup cần PREVIEW_URL, sandbox không chạy Chromium); nhóm @static đã kiểm tay bằng script, khớp. Store dev chưa có dữ liệu TE407_* (xem cuối).

# ES1-T407 TS-FE7: blog excerpt_or_content, article thông báo comment, page.contact

Kế hoạch: drafts/techlead/ES1-T304/task-split.md §3 TS-FE7. Mục Shopify 7 Blog, 7 Article, 5/7 Page, 17. Audit B#6, #18, #24, #46.
Chỉ markup tối thiểu; giao diện đủ theo spec ở ES1-T381 (TE-20-R2-FE1), ES1-T382 (TE-20-R2-FE2), ES1-T383 (TE-21-R2-FE1).

## Thay đổi
- templates/blog.liquid: trích đoạn `article.excerpt_or_content | strip_html | truncatewords: 30` (rỗng thì không render `<p>`); ảnh qua `render 'image'` width 1200, widths `360, 540, 720, 900, 1200`, sizes `(min-width: 80rem) 1200px, 100vw`; bài đầu `eager` + `fetchpriority=high`, còn lại `lazy`; ảnh `alt=""` (tiêu đề link ngay dưới, blog.md §6). testid `blog-article`, `blog-article-excerpt`.
- templates/article.liquid: ảnh bìa widths/sizes như trên, eager + high (LCP), testid `article-cover`. Form `new_comment` (class `comment-form`, testid `comment-form`):
  - `form.posted_successfully?` → `.form-status` `role="status"` `tabindex="-1"` testid `comment-status`; `blog.moderated?` → "Thanks, your comment is in review" / "It appears here once a moderator approves it."; không duyệt → "Your comment is posted." (article.md §5).
  - `form.errors` → hộp `role="alert"` liệt kê `translated_fields` + `messages` (thay `default_errors`), lỗi inline theo trường với `aria-invalid` + `aria-describedby` (CommentAuthorError, CommentEmailError, CommentBodyError).
  - id duy nhất `CommentAuthor/Email/Body`, `autocomplete`, `required`, dấu * `aria-hidden` + "* Required"; nút `<button>` "Post Comment" (CTO 10/11 câu 3).
- templates/page.contact.liquid (mới): container → h1 `page.title` → `.rte` `page.content` (rỗng thì bỏ) → `{% form 'contact' %}` (class `contact-form`, testid `contact-form`): Name (`contact[name]`), Email* (`contact[email]`), Message* (`contact[body]`), label thật, `form.errors` hộp `role="alert"` testid `contact-errors` + lỗi email/body `aria-invalid` + `aria-describedby` (`ContactEmailError`, `ContactBodyError`); `form.posted_successfully?` → hộp `role="status"` `tabindex="-1"` testid `contact-status` "Thanks for contacting us", thay form. Không setting, không JS. Name không required theo ticket (page.md §2 ghi Name*; ES1-T383 quyết định khi làm block `contact-form`).
- locales/en.default.json: `blog.*` thêm `comment_pending_title/body`, `comment_posted`, `comment_errors_title`, `comment_error_author/email/body`, `required_note`; `comment_form_submit` "Post" → "Post Comment". Nhóm mới `contact.*` (name, email, message, required_note, submit, success_title, errors_title, error_email, error_body). Không trùng khoá/nhóm.
- assets/base.css (+~1,6 KB thô): class form chung tối thiểu `.form-field*`, `.form-status*`, `:is(.comment-form, .contact-form)`: input cao `calc(var(--space-1) * 11)` (44px), form rộng tối đa `65ch`, viền `--color-muted-light` (5.33:1), hover foreground, focus outline accent 2px offset 2, lỗi viền `--color-sale` 2px + chữ; hộp trạng thái viền inline-start badge-new / sale. Chỉ token, logical properties.
- tests/e2e/ES1-T407.spec.ts: @static 4 test (đọc repo) + store 3 test.

## Lượt 2 (sau CI #210, run 43349042951)
- Test contact `:118` đỏ "element not found": lỗi ở test, không phải markup. `Promise.all([page.waitForLoadState('load'), click])` resolve ngay vì trang cũ đã load → kiểm `/challenge` trên URL cũ rồi chờ `contact-errors` khi trang chưa điều hướng (hoặc hCaptcha invisible giữ submit / đã sang `/challenge`).
- Sửa: helper `submitAndLoad` chờ `framenavigated` khung chính (POST /contact có thể quay về đúng URL cũ nên không so URL), rồi:
  - nhánh hCaptcha: path `/challenge`, hoặc không điều hướng mà có iframe/badge hCaptcha → `test.skip` "hCaptcha chặn submit tự động: chạy tay, ghi PR" (theo mẫu TE-1 `submitNewsletter`);
  - nhánh Cloudflare: `expectNotChallenged` → fail nêu rõ bị chặn (ES1-T203);
  - không điều hướng, không hCaptcha → fail "submit không điều hướng" (lỗi form thật).
  Áp cho submit comment và 2 lần submit contact. Điền trường bằng id (`#ContactBody`, `#ContactEmail`, `#Comment*`) thay `getByLabel` để không phụ thuộc dấu `*` trong label.
- testid khớp markup: lỗi `contact-errors` (nhánh `form.errors`), thành công `contact-status` (nhánh `form.posted_successfully?`), form `contact-form`, nút `contact-submit`.
- Bỏ phần ngoài ticket (gate-reviewer): ghi chú duyệt comment, gợi ý email "Not published.", gợi ý số đơn hàng ở Message, link "Continue Shopping" sau gửi liên hệ, cùng 4 khoá locale tương ứng. Giao diện đủ để ES1-T382/ES1-T383.
- CSS: bỏ literal `44px`, `46rem` → `calc(var(--space-1) * 11)`, `65ch`.

## Hook cho BE (không có JS trong PR)
- Focus hộp sau POST: `[data-testid=comment-status]`, `[data-testid=contact-status]`, hộp lỗi `#CommentFormErrors`, `#ContactFormErrors` có `tabindex="-1"`; không JS thì Shopify đưa về neo form (`#comment_form`, `#contact_form`).
- Không `{% partial %}`.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 23 warning cũ, không file nào của PR.
- `grep -n "excerpt_or_content" templates/blog.liquid` = 2 (1 code, 1 comment); `test -f templates/page.contact.liquid` ok.
- `gzip -c assets/base.css | wc -c` = 48 011 sau gộp develop (≤ 49 152); critical.css không đổi (9 917).
- JSON locale parse ok, không khoá trùng (object_pairs_hook).
- Không file .js trong diff.
- @static: assertion kiểm tay bằng node, khớp. Playwright smoke, spec ES1-T407 nhóm store, Lighthouse /blogs/<demo>, bài, /pages/contact, ảnh 360/768/1280: chờ CI. Contact gặp hCaptcha → skip, cần chạy tay và ghi kết quả vào PR.

## Dữ liệu store cần (QA/CTO)
- `TE407_BLOG_PATH`: blog có ≥ 1 bài không excerpt nhưng có content.
- `TE407_ARTICLE_PATH`: bài trên blog bật comment + "Comments are moderated".
- Page `/pages/contact` gán template `contact` (hoặc `TE407_CONTACT_PATH`).
Thiếu thì test store `fixme` (không tính đạt). hCaptcha `/challenge` sau submit → test skip có lý do, chạy tay và ghi lại vào PR.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
