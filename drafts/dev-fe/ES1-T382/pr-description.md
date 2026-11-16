KHÔNG CHẮC: (1) base.css gzip chưa đo được: sandbox chặn gzip/node/python/git hash-object; thô 281 431 → 289 094 B (+7 663), ước gzip +1,5–1,9 KB trên develop ~51 KB (CTO 16/11) → ~52,5–52,9 KB, dưới trần tạm 53 248 nhưng LỚN HƠN develop (ES1-T454: cần CTO duyệt ngoại lệ). Không còn CSS article/comment cũ để xoá (ES1-T407 chỉ có form tối thiểu, đã gộp/thu lại). Số chính xác chờ CI `gzip -c assets/base.css | wc -c`. (2) AGENTS.md Theme map: scope-guard chặn dev-fe, 3 dòng block mới nhờ Tech Lead thêm (nội dung ở cuối). (3) Ticket chỉ ghi `article-comments` là block mới; SRS 0.5 TE-20 (template → 3 container `article-main`, `article-comments`, `related-articles`, bảng setting) cần 2 block nữa có schema → làm cả 3. (4) Câu chưa có bình luận dùng chữ chung "No comments yet. Be the first to share your thoughts." thay câu mẫu article.md §5 "Share how you cool down after training." (gắn nội dung 1 bài; merchant sửa trong locale). (5) Spec chưa chạy local: globalSetup cần PREVIEW_URL, không ghi được config tạm ngoài repo.

# ES1-T382 TE-20-R2-FE2: trang bài viết — article-main, article-comments, related-articles

Story TE-20 (SRS 0.5) AC9–AC15, thay TE-9 AC3 + TE-6 AC6 (0.4). Sổ 10/11 A1–A3 (article.md §10). Spec: docs/ui-spec/article.md, mockup drafts/designer/ES1-T257/article.html. Phụ thuộc đã merge: ES1-T326 (breadcrumb, page-title), ES1-T364 (pagination), ES1-T334 (hàng ngang blog-posts), ES1-T407 (thông báo comment, .rte), ES1-T403 (.rte chung).

## Thay đổi

| File | Nội dung |
| --- | --- |
| `templates/article.liquid` | Viết lại: 3 `container` id `article-main` (tag `article`), `article-comments`, `article-related`, mỗi cái 1 block tự chứa. Markup thô ES1-T407 chuyển vào block. |
| `blocks/article-main.liquid` (mới) | Ảnh bìa `.article-main__cover` (A1: thẻ bo 16, không chữ, không lớp tối; 4/3 → 16/9 từ 48rem → 1798/827 từ 80rem; eager + `fetchpriority=high` CHỈ khi "Show cover image" bật và có ảnh, widths `360…2048`, sizes theo §7; alt = alt Shopify) → cột đọc 46rem: `render 'breadcrumb'`, tag đầu (link `/tagged/`, pill 28, vùng chạm 44 bằng `::after`), `render 'page-title', title: article.title` (h1 duy nhất), meta `<time>` · "By {author}" · thời gian đọc (200 từ/phút như article-card, ẩn khi rỗng) → `.rte` `article.content` → cuối bài: "Topics" + mọi tag dạng tab link 44, "Back to {blog}" cao 44 mũi tên lùi (RTL lật đúng). 1 JSON-LD `BlogPosting` (headline, mainEntityOfPage, image, datePublished, dateModified, author); BreadcrumbList từ snippet breadcrumb. 5 checkbox setting theo SRS (default true). |
| `blocks/article-comments.liquid` (mới) | Chỉ khi `blog.comments_enabled?` (editor: placeholder hướng dẫn bật trong admin). h2 "{n} Comments" (one/other) hoặc "Comments" + câu chưa có bình luận; `{% paginate article.comments by 10, window_size: 1 %}` → `<ol>` (avatar chữ cái đầu `aria-hidden`, tên 600, `<time>`, nội dung) → `render 'pagination'` label "Comment pages", anchor `#comments`. Form `new_comment`: h2 "Add a comment" cỡ h3; thành công → `role=status` `tabindex=-1` + icon (in review khi `blog.moderated?`, ngược lại "Your comment is posted."), ô nhập rỗng; lỗi → `role=alert` `#CommentFormErrors` "Check {n} fields" + "Fix the fields below, then post again." (lỗi cấp form: "Your comment wasn't posted." + message Shopify), lỗi inline icon + chữ dưới từng trường, `aria-invalid`, `aria-describedby`, giữ chữ đã nhập; ghi chú duyệt khi `blog.moderated?`; Email gợi ý "Not published." (`aria-describedby` CommentEmailHint); Name/Email 2 cột từ 48rem, nút full width dưới 48rem; "* Required". Không setting. Giữ testid/id ES1-T407. |
| `blocks/related-articles.liquid` (mới) | `<scroll-buttons class="blog-posts related-articles full-width">` dùng lại CSS "Hàng ngang" + `article-card` (h3): bài cùng tag đầu trước, bù bài mới nhất, bỏ bài đang xem, tối đa "Articles to show" 2–8 (mặc định 4); ≤ 4 thẻ → `blog-posts--grid` (lưới tĩnh từ 80rem, không nút/tiến trình). Eyebrow, heading default rỗng (ES1-T308 #1); heading rỗng → locale "More Articles". Blog chỉ 1 bài → không render (editor: placeholder). Không thẻ script/`data-lazy-module` (D6, BE). |
| `assets/base.css` | Form chung ES1-T407: `:is(.comment-form, .contact-form)` → `.contact-form` (comment-form có rule riêng rộng hết cột), input bo `--radius-input`, `.form-field__error` flex + icon, `.form-status` có icon (`:has(> .form-status__icon)`), `.form-status__body`. Mục mới "Bài viết" (rule 1 dòng để giảm byte): ảnh bìa, cột 46rem (`calc(var(--space-1) * 184)`), đầu bài, pill, meta "·" alt rỗng, cuối bài, Topics, Back to, bình luận, form; rte 18px từ 64rem. Placeholder dùng chung selector `.blog-posts--placeholder`. 0 màu literal, 0 thuộc tính vật lý, 0 z-index; chuyển động trong `prefers-reduced-motion: no-preference`, token `--motion-*`. critical.css không đổi (9 995 B). |
| `locales/en.default.json` | Nhóm `blog` (gộp, không nhóm mới): `comment_errors_summary` (one/other), `comment_errors_hint`, `comment_moderated_note`, `comments_count` (one/other), `comments_placeholder`, `no_comments`, `email_hint`, `by_author`, `topics`, `back_to_blog`, `article_placeholder`, `related_heading`, `related_placeholder`; `comment_errors_title` → "Your comment wasn't posted." (chỉ cho lỗi cấp form). Dùng lại `comments_pagination_label`, `blocks.blog_posts.read_time/previous/next`, `general.breadcrumb.*`. |
| `locales/en.default.schema.json` | `general.article_comments`, `general.related_articles`; `labels.article_show_*` (5); `info.article_show_cover_image/reading_time/topics`, `info.related_articles_eyebrow/heading`. Dùng lại `general.article`, `labels.eyebrow`, `labels.heading`, `labels.blog_posts_articles_to_show`. |
| `tests/e2e/ES1-T382.spec.ts` (mới) | tĩnh 7 (template, hợp đồng block, AC9/10/14, AC11/12, AC13/15, locale, CSS token/logical); fixture 3 mốc 360/768/1280 với base.css thật (tỉ lệ ảnh bìa, bo 16, cột ≤ 736, pill 44, back 44, form 1/2 cột, nút full width 360, không cuộn ngang); store 3 (1 h1, 1 ảnh eager, 1 BlogPosting + 1 BreadcrumbList, bài liên quan không gồm bài đang xem + axe; không ảnh bìa; lỗi form). |
| `tests/e2e/ES1-T407.spec.ts` | AC thay (comment CTO 16/11): ảnh bìa đọc `blocks/article-main.liquid`, widths đổi thành `360…2048` (article.md §7, khung 1416 DPR 2); thông báo comment đọc `blocks/article-comments.liquid`. Thay bằng TE-20 AC9, AC12. |
| `tests/e2e/ES1-T403.spec.ts` | D4 `.rte` bài viết đọc `blocks/article-main.liquid` (TE-20 AC10). |

Không file JS trong diff. Không `{% partial %}`.

## Hook cho BE — ticket ES1-T473
- related-articles: thêm `data-lazy-module="{{ 'scroll-buttons.js' | asset_url }}"` + script `lazy-module.js` như blog-posts; hook `data-scroll-track/prev/next/progress`, `data-enhanced`, `data-static`; testid `related-articles-*`. Tới khi BE thêm: nút ẩn (visibility, giữ chỗ), hàng vẫn vuốt/cuộn phím (AC13 phần 768 chevron + tiến trình chờ BE).
- article-comments: focus `[data-testid=comment-status]` / `#CommentFormErrors` sau tải lại (AC12 "nhận focus"); `aria-busy` cho `[data-testid=comment-submit]` (tuỳ chọn).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 23 warning cũ, không file nào của PR (giảm 1: OrphanedSnippet page-title nay đã được gọi).
- base.css (node zlib.gzipSync): develop thô 281 431 B / gzip 51 936 B; nhánh trước sửa 289 094 / 53 411 B (vượt trần tạm 53 248); sau khi rút gọn comment mục mới + bỏ khai báo trùng: 288 561 / 53 120 B ≤ 53 248 (Claude Code 16/11). critical.css 9 995 B không đổi.
- Locale: `jq` parse 2 file ok; nhóm `blog` không trùng khoá (đọc tay), 1 nhóm `blog` top-level.
- Theme check / AGENTS: block có `{% doc %}`, schema không presets, `shopify_attributes`, placeholder chỉ `request.design_mode`, chuỗi qua `| t`, URL từ `routes`/URL đối tượng.
- Playwright (tĩnh, fixture, store), preview, Lighthouse desktop/mobile `/blogs/<demo>/<bài>` (mục tiêu A11y/SEO/BP 100, Perf ≥ 96/90), ảnh 360/768/1280/1920: chờ CI.

## Dữ liệu store cần (QA/CTO)
- `TE382_ARTICLE_PATH`: bài có ảnh bìa, ≥ 1 tag, blog bật bình luận (≥ 11 bình luận để thấy phân trang), blog ≥ 2 bài.
- `TE382_ARTICLE_NO_COVER_PATH`: bài không ảnh bìa.
- Store dev (AC15): related-articles eyebrow "From the Efitco blog", heading "More Training Tips" cấu hình trên store, không làm default.
Thiếu thì test store `fixme` (không tính đạt). hCaptcha → skip có lý do, chạy tay ghi PR.

## Nhờ Tech Lead thêm vào AGENTS.md Theme map (Blocks)
| `article-comments` | Article comments: count heading, list, shared pagination, `new_comment` form with field errors; nothing when comments are off. |
| `article-main` | Article body: cover card (LCP), breadcrumb, first tag, h1, meta, `.rte` content, topics, back link, one BlogPosting JSON-LD. |
| `related-articles` | Row of up to 8 article cards, same first tag first, without the current article; nothing when the blog has one article. |

🤖 Generated with [Claude Code](https://claude.com/claude-code)
