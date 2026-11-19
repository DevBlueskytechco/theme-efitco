KHÔNG CHẮC: chưa đo được base.css gzip trong phiên dev-fe (gzip/node/hash-object cần duyệt quyền). Số thô: develop 281 431 B → nhánh 288 607 B (+7 176 B). Ước +1,4–1,7 KB gzip trên develop ~51 KB, dưới trần tạm 53 248 B; số chính xác do CI đo (ES1-T326 TC kiểm `gzipSync(base.css) ≤ 53 248`). Trần chính thức chờ CTO ở ES1-T472.

# ES1-T381 TE-20-R2-FE1: trang blog (blog-articles, article-card, base.css, locales)

AC: TE-20 AC1–AC8 (SRS 0.5, thay TE-9 AC3 của 0.4); blog.md §1–§7; sổ 10/11 B1–B3; sổ 11/11 (3), (4).

## Thay đổi
- `templates/blog.liquid`: chỉ còn `container` id `blog-main` → block `blog-articles`. Bỏ markup thô của ES1-T407 (h1, div, `default_pagination`); markup cũ không có class/CSS riêng nên không có CSS cũ để xoá.
- `blocks/blog-articles.liquid` (mới): breadcrumb (`snippets/breadcrumb`) → eyebrow, h1 `blog.title`, dòng số bài (`snippets/page-title`) → nav chủ đề → bài nổi bật → lưới `article-card` → `snippets/pagination` neo `#blog-grid`.
  - Nav chủ đề: `<nav aria-label="Blog topics">`, link thật "All" + mỗi tag `{blog.url}/tagged/{handle}`, `aria-current="page"` so theo handle; không `role="tab"`; ẩn khi tắt setting hoặc blog không tag; không JS vẫn lọc bằng link.
  - Bài nổi bật: bài mới nhất, chỉ trang 1, không lọc tag, ≥ 2 bài, setting bật. Ảnh 4/3, tag đầu, h2 là link duy nhất (`::after` phủ khối), `excerpt_or_content | strip_html | truncatewords: 30`, meta ngày · thời gian đọc.
  - LCP (AC6): ảnh bài nổi bật là ảnh eager + `fetchpriority="high"` duy nhất; không có bài nổi bật thì ảnh card đầu; còn lại lazy.
  - Rỗng (AC4): blog 0 bài → không nav, không số bài, `empty-state` "No Articles Yet" + "Explore Equipment" (`routes.all_products_collection_url`) + "Back to homepage" (`routes.root_url`). Tag không còn bài → giữ nav, "No Articles On This Topic" + "View All Articles" (`blog.url`).
  - Không có `blog` (block đặt ngoài template blog): chỉ hiện hướng dẫn khi `request.design_mode`.
  - Settings đúng bảng SRS TE-20: eyebrow (rỗng), show_topic_filter, feature_newest, articles_per_page (6–24, bước 3, 9), show_excerpt, show_date, show_reading_time. Không presets.
- `snippets/article-card.liquid`: tham số tuỳ chọn `heading_tag` ('h2' ở trang blog), `show_date`, `show_read_time`, `show_excerpt` (20 từ), `sizes`, `loading`, `fetchpriority`. Meta "{ngày} · {N} min read" với `<time datetime>`, dấu chấm vẽ bằng CSS (`content: '·' / ''`). Không tham số → card trang chủ giữ nguyên (AC8: h3, không ngày, không excerpt).
- `snippets/status-icon.liquid`: thêm icon 'article', 'tag' cho empty state; `snippets/empty-state.liquid`: cập nhật doc tham số icon.
- `assets/base.css`: mục "Blog page" (nav chủ đề, bài nổi bật, lưới 1/2/3/4 cột ở 360/768/64rem/80rem, gradient card đậm hơn cho trích đoạn, vùng chạm nav 44px dưới 80rem, 40px từ 80rem). Override `#999` của read-time (khối Figma cuối file) thu về `.blog-posts .article-card__read-time` để không làm meta trang blog thành xám trên nền tối. Chỉ token, logical properties, chuyển động trong `prefers-reduced-motion: no-preference`. critical.css không đổi (9 995 B).
- `locales/en.default.json`: gộp vào nhóm `blog` có sẵn (placeholder, topics_label, all_topics, articles_count, tagged_count, empty_*). `en.default.schema.json`: `general.blog_articles`, labels, info mới; không trùng key.
- Spec: `tests/e2e/ES1-T381.spec.ts` (mới, tĩnh + store); `tests/e2e/ES1-T407.spec.ts` sửa 2 test blog theo CTO 16/11 — AC thay: TE-20 AC1 (nổi bật 30 từ), AC2 (card 20 từ), AC6 (ảnh LCP). Ghi chú AC thay ở đầu file và trên từng test.

## Hook cho BE (không có JS trong PR)
- Lưới `#blog-grid`, `data-testid`: blog-articles, blog-articles-topics, blog-articles-topic, blog-articles-featured(-link, -excerpt, -meta), blog-articles-grid, blog-articles-empty(-heading, -button, -link), blog-articles-placeholder; card: article-card(-excerpt, -meta, -date, -read-time).
- Chưa có partial; nếu sau này lọc tag không tải lại trang (blog.md §4 loading/lỗi) thì BE bọc `#blog-grid`.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 22 cảnh báo đều ở file ngoài ticket (bundle-builder, featured-product, quiz-step, testimonial-item, index*.liquid), 0 ở file của PR.
- CSS mục blog: 0 literal màu, 0 thuộc tính vật lý (quy tắc ES1-T191), bo góc qua token (css-lint HARDCODED_RADIUS), không line-clamp/ellipsis ở tiêu đề, trích đoạn (ES1-T403 D5).
- Không file JS trong diff; không `<script>`, `data-lazy-module` trong block/snippet.
- base.css: xem dòng KHÔNG CHẮC đầu file; chờ CI đo gzip.
- Playwright, Lighthouse (desktop/mobile trang blog, trang tag), ảnh 360/768/1280: chờ CI.
- Test store cần dữ liệu, thiếu thì `fixme` (không tính đạt): `TE381_BLOG_PATH` (blog ≥ 2 bài, có tag, có ảnh), `TE381_TAG_PATH`, `TE381_EMPTY_TAG_PATH`, `TE381_PAGED_BLOG_PATH` (> 9 bài).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
