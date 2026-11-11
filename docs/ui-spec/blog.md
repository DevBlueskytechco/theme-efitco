KHÔNG CHẮC: demo-data chỉ có title, url, image, published_at, tags của 4 bài; thiếu `blog.title`, author, excerpt, content (thời gian đọc), bình luận, bài thứ 5 (hỏi BA ở ES1-T267). Mockup dùng "Training Tips & Inspiration" (Figma 1:1022) làm tên blog, thời gian đọc lấy theo Figma 1:1022 (2, 5, 7, 5 min), excerpt bài nổi bật là chữ mẫu.

# UI spec: Trang blog (ES1-T257)

Mục đích: người mua lướt bài viết của Efitco, lọc theo chủ đề (tag) và mở đúng bài cần đọc. Story TE-9 AC3 (title, image, excerpt_or_content, published_at), TE-16 (card Figma), R7.
Template: `templates/blog.liquid` (hiện là markup Skeleton thô: h1, list 5 bài, `default_pagination`).
Figma: không có trang blog. Dùng ngôn ngữ trang chủ: block Blog posts 1:1022 (eyebrow 1:1024, heading 1:1025, card 336 × 448 1:1027, tag 1:1029, title 1:1031, read time 1:1032). Thành phần chung: `docs/ui-spec/foundation.md` (viết tắt F§).
Mockup: `drafts/designer/ES1-T257/blog.html` + `blog-360|768|1280|1920.png`. Trạng thái ở cuối file.
Spec trang bài viết: `docs/ui-spec/article.md`.

## Thay đổi audit (ES1-T283, sửa ở ES1-T287)

| # | Mã | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | A3 | phân trang: nút chữ "Newer articles"/"Older articles" + mũi tên 20 × 16, ô số vuông 44 bo `--radius-button`, trang hiện tại nền foreground | snippet `pagination` chung: Previous/Next tròn 52 chevron ("Previous page"/"Next page"), số pill 44, trang hiện tại accent, < 48rem "Page X of Y" | Sổ 10/11 S3/C3, `docs/ui-spec/pagination.md` |
| 2 | A4, câu CTO 5 | trang đầu/cuối: nút chữ `--color-muted-light` | nút tròn giữ chỗ, opacity 0.35 + `aria-disabled` | Sổ 10/11 audit (5) |
| 3 | A4 | chuỗi `blog.pagination.*` | bỏ; dùng `collections.pagination.*` chung | pagination.md §5 |

Mockup: khối "Phân trang" cuối `drafts/designer/ES1-T257/blog.html` vẽ lại (trang giữa, trang đầu, trang cuối).

## Thay đổi so với vòng 2

| # | Phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header | biến thể A nền trắng, viền dưới | thanh tối `--color-background-dark` + noise, cao 80, logo 100 × 30, menu trắng 60%, "Blog" trắng 100% + gạch chân 2px (`aria-current`); search 20, account/cart 24 | Sổ 10/11, Figma 1:362, F§3 |
| 2 | Footer | newsletter 2 cột, panel trong container, 3 social, wordmark tách hàng | markup kit vòng 3: ảnh 98 × 123 + chữ + form · panel dải rộng bo 16 · 4 social (TikTok, Instagram, YouTube, Facebook) · wordmark giữa hàng copyright và localization (cờ + USD / EN) | Figma 1:1104, F§4 |
| 3 | Card bài viết: padding nội dung | 16 mọi mốc (kit) | 16 dưới 48rem, 24 từ 48rem | Figma 1:1030 (padding 24), `assets/base.css` `.article-card__content` |
| 4 | Card bài viết: meta "ngày · thời gian đọc" | `--color-muted-on-dark` (#999) | chữ trắng `--color-background-dark-foreground`, như code | Code ES1-T174 mục 4; sổ 09/11 A11y 100 (xem §6) |
| 5 | Nền tối, tương phản | #1E1E1E, 16.7:1 | #1A1A1A, 17.4:1 (card không ảnh) | F§2 bảng tương phản |

Giữ nguyên: anatomy, lọc tag, bài nổi bật, lưới 1/2/3/4 cột, phân trang, mọi trạng thái, 3 câu CTO. Lệch còn lại với Figma (P4): gradient card bắt đầu 50% thay 63.72% theo F§10 (ĐỀ XUẤT chung của foundation, chưa chốt).

## 1. Anatomy

Thứ tự giữ nguyên ở mọi mốc (06 §2).

1. Header tối dùng chung (F§3; sổ 10/11: mọi trang một biến thể, không đè ảnh). Mục menu "Blog" có `aria-current="page"` (trắng 100% + gạch chân 2px).
2. Breadcrumb (F§5): `Home / {blog.title}`; trang lọc tag: `Home / {blog.title} / {tag}`.
3. Tiêu đề trang (F§5): eyebrow "From the Efitco blog" (Figma 1:1024, accent) · h1 `{blog.title}` · meta số bài ("4 articles"; trang tag: "2 articles tagged Diet plans").
4. Lọc chủ đề: `<nav aria-label="Blog topics">` + `<ul>` link thật tới `{blog.url}/tagged/{tag | handle}`; mục đầu "All" về `blog.url`. Dáng tab F§7, mục đang xem `aria-current="page"` (nền foreground, chữ background). Nguồn `blog.all_tags`, thứ tự chữ cái như Shopify trả.
5. Bài nổi bật (trang 1, không lọc tag, setting bật): bài mới nhất. Ảnh 4/3 bo 16 · tag pill (tag đầu) · h2 tiêu đề (link duy nhất, `::after` phủ cả khối) · excerpt (`article.excerpt_or_content | strip_html | truncatewords: 30`) · meta: ngày · thời gian đọc.
6. Lưới card: các bài còn lại, card Figma 1:1022 (snippet `article-card`): ảnh 3/4 phủ kín + gradient, tag pill accent phải trên cách 12, nội dung padding 16 (24 từ 48rem, Figma 1:1030), tiêu đề Inter 700 18/28 trắng hiện đủ, không cắt (yêu cầu Shopify §7, 11/11); dưới tiêu đề trích đoạn `article.excerpt_or_content | strip_html | truncatewords: 20` 14/22 trắng 85% (bắt buộc ở trang blog, Shopify §7 Blog: excerpt_or_content; thay quyết định B1 10/11 cho trang blog; block blog posts trang chủ giữ Figma), meta 14/500 chữ trắng "Nov 4, 2026 · 5 min read".
7. Phân trang (khi số bài > Articles per page).
8. Footer (F§4).

Không có CTA bán hàng trong trang: CTA chính duy nhất xuất hiện ở trạng thái rỗng (04 §1: mỗi section ≤ 1 CTA chính).

## 2. Settings merchant

ĐỀ XUẤT: gom phần 3–7 vào một block `blog-articles` (tự chứa, gọi trong `container` của `templates/blog.liquid`), settings phẳng (AGENTS "Keep settings flat"). Nguồn: 01 (settings hướng merchant), Figma 1:1022 (eyebrow).

| Tên (sentence case) | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Eyebrow | text | From the Efitco blog | trống thì ẩn |
| Show topic filter | checkbox | true | blog không có tag thì tự ẩn |
| Feature the newest article | checkbox | true | chỉ trang 1, không lọc tag |
| Articles per page | range | 9 | 6–24, bước 3 |
| Show excerpt | checkbox | true | chỉ ở bài nổi bật |
| Show date | checkbox | true | |
| Show reading time | checkbox | true | `article.content` rỗng thì ẩn (AC-H27) |

Blog chọn bởi Shopify (template blog), không cần setting chọn blog.
Snippet `article-card` ĐỀ XUẤT thêm 2 tham số, mặc định giữ đúng trang chủ: `heading_tag` (`h3` mặc định; trang blog truyền `h2` để heading không nhảy bậc) và `show_date` (false mặc định; trang blog truyền true, AC3 published_at). Trang chủ không đổi (Figma 1:1022 chỉ có read time).

## 3. Layout theo mốc

Lưới, lề, khoảng cách theo F§1. Mốc code: `< 48rem`, `48rem`, `64rem`, `80rem`.

| Phần | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Nội dung | 320 | 728 | 1240 | 1416 |
| Tiêu đề trang | eyebrow 16, h1 33, meta 14; padding 16 / 24 | như 360, h1 43 | h1 48; padding 24 / 32 | như 1280 |
| Lọc chủ đề | 1 hàng cuộn ngang, tràn sát mép màn (lộ tab kế), tab cao 44, cách lưới 32 | 1 hàng, cao 44 | cao 40 (Figma 1:490), cách 40 | như 1280 |
| Bài nổi bật | xếp dọc: ảnh 320 × 240 → nội dung, gap 24; h2 28 | 2 cột 7/5: ảnh 406 × 305, chữ 290, gap 32; h2 32 | 7/5: ảnh 695 × 521, gap 48; tiêu đề cỡ h1 48/58; excerpt 18 | ảnh 798 × 599 |
| Lưới card | 1 cột, 320 × 427 | 2 cột, 356 × 475 | 4 cột, 292 × 389 | 4 cột, 336 × 448 = Figma |
| Gap lưới (ngang / dọc) | 16 / 24 | 16 / 24 | 24 / 40 | 24 / 40 |
| Nổi bật → lưới | 48 | 48 | 64 | 64 |
| Lưới → phân trang | 48 | 48 | 64 | 64 |
| Cuối trang → footer | 48 | 48 | 120 | 120 |

64rem–80rem (1024): lưới 3 cột. 1920 khớp đúng card Figma 336 × 448, gap 24.
360: card 1 cột cao 427 là cố ý: tiêu đề 3 dòng 18px không đủ chỗ ở card 152 (2 cột); giữ tỉ lệ 3/4 của Figma (06 §1 nhất quán).

## 4. Trạng thái

Figma không có trạng thái nào; tất cả dưới đây là ĐỀ XUẤT theo F§18 và nguồn ghi kèm.

| Trạng thái | Khi nào | Hiển thị | Nguồn |
| --- | --- | --- | --- |
| Lọc tag | URL `/tagged/{tag}` | breadcrumb thêm tag, meta "N articles tagged {tag}", tab tag `aria-current`, không có bài nổi bật, lưới bắt đầu ngay | 04 §4 (active rõ) |
| Blog rỗng | `blog.articles_count == 0` | ẩn lọc và meta; empty state F§18: icon bài viết, h2 "No Articles Yet", câu "New training tips are on the way. Until then, find the right gear for your next session.", primary "Explore Equipment" (Figma CTA) → `routes.all_products_collection_url`, text link "Back to homepage" | AGENTS empty state (trang rỗng là nội dung), 05 §7 |
| Tag không có bài | tag trong URL không còn bài | giữ lọc; h2 "No Articles On This Topic", "Try another topic above or browse every article.", primary "View All Articles" → `blog.url` | 05 §7 |
| Không ảnh | `article.image` rỗng | card nền `--color-background-dark` (chữ 17.4:1); bài nổi bật khung 4/3 cùng màu | F§10, DESIGN Images |
| Không tag | `article.tags` rỗng | không pill | snippet hiện có |
| Không thời gian đọc | `article.content` rỗng | chỉ còn ngày | AC-H27 |
| Đang tải | chỉ khi BE làm lọc tag không tải lại trang (partial) | lưới `aria-busy`, 4 skeleton 3/4, "Loading articles" trong `role="status"` | F§18; không JS thì link tải lại trang, không có trạng thái này |
| Lỗi tải | partial lỗi | giữ lưới cũ, hộp `alert` "Couldn't load these articles" + "Try Again" (secondary), focus vào hộp | F§18 |
| Hover card | chuột | card nhấc 6px + bóng, ảnh scale 1.04, tiêu đề gạch chân (code có sẵn) | F§10 |
| Hover bài nổi bật | chuột | ảnh scale 1.04, tiêu đề gạch chân 2px | như card |
| Focus | bàn phím | outline 2px accent offset 2 trên card; bài nổi bật outline quanh cả khối (`:has(a:focus-visible)`) | F§6 |
| Phân trang | > Articles per page | xem §5 | |

Lọc tag mặc định là link thật, tải lại trang (AGENTS "Works without JavaScript"). Làm không tải lại là việc BE (ticket BE riêng nếu cần), không bắt buộc cho trang này.

## 5. Phân trang

Dùng snippet `pagination` chung, toàn bộ hình, trạng thái, A11y theo `docs/ui-spec/pagination.md` (sổ 10/11 S3/C3). Thay `default_pagination`.
- `{% paginate blog.articles by section.settings.articles_per_page, window_size: 1 %}` → `{% render 'pagination', paginate: paginate, anchor: '#blog-grid' %}`.
- Previous/Next tròn 52 chevron, `aria-label="Previous page"` / `"Next page"`; số pill 44, trang hiện tại accent; < 48rem "Page X of Y" giữa 2 nút dạt 2 mép.
- Trang đầu/cuối: nút giữ chỗ mờ 0.35 + `aria-disabled` (sổ 10/11 audit 5).
- Lưới → phân trang 48 / 64 từ 64rem (§3).
- ĐỀ XUẤT neo `#blog-grid` (id trên lưới) để sau khi tải trang mới rơi thẳng vào lưới (pagination.md §5).

## 6. Accessibility

| Cặp | Tỉ lệ | Chỗ dùng |
| --- | --- | --- |
| foreground / background | 17.4 | h1, tiêu đề bài nổi bật, tab đang xem (đảo) |
| foreground / background-alt | 15.8 | tab chưa chọn |
| muted / background | 8.45 | meta, excerpt, breadcrumb |
| accent / background | 5.01 | eyebrow |
| accent-foreground / accent | 5.01 | tag pill |
| muted-light / background | 5.33 | dấu "/" breadcrumb |
| accent-foreground / accent | 5.01 | trang hiện tại phân trang (pagination.md §7) |
| background-dark-foreground / background-dark | 17.4 | card không ảnh |
| background-dark-foreground / header tối | 17.4 | logo, icon, menu đang xem |
| menu trắng 60% / header tối | 6.93 | menu header |

Chữ trên ảnh card: tiêu đề và meta trắng nằm trên gradient tối (kit `.article-card::before`, 50% → `--color-background-dark` ở đáy, F§10). Meta ở ~93% chiều cao card, độ phủ tối ~86%: trắng đạt ≥ 4.5 kể cả ảnh trắng (L nền ≤ 0.151 → 5.2:1). `#999` của Figma 1:1032 chỉ đạt khi đáy ảnh tối, nên vòng 3 theo code (ES1-T174) dùng trắng: sổ 09/11 đặt A11y 100 là ưu tiên số 1 (lệch Figma P3, có lý do). Hướng dẫn merchant: ảnh bìa có phần dưới tối hoặc trơn.
- Heading: h1 (tên blog) → h2 (bài nổi bật, từng card) → h2 footer. Card truyền `heading_tag: 'h2'`.
- Mỗi card/bài nổi bật đúng 1 link, tên link = tiêu đề bài (18 §link mô tả đích); ảnh trang trí `alt=""` vì tiêu đề đã gọi tên link (snippet hiện có). Tag pill trong card không phải link (tránh link lồng link).
- Tab lọc: `<a>` có `aria-current="page"`, không dùng `role="tab"` (đây là điều hướng, không phải tabpanel).
- Vùng chạm: tab 44 (< 80rem) / 40 (≥ 80rem, ≥ 24 target-size), ô phân trang 44, card toàn khối; phân trang: chevron 52, số 44.
- Hàng tab cuộn ngang: `overflow-x: auto` riêng, có `padding` 3px để outline focus không bị cắt; zoom 200% không cuộn ngang cả trang.
- Ngày trong `<time datetime>`.

## 7. Lighthouse

- LCP: ảnh bài nổi bật (`loading="eager"`, `fetchpriority="high"`, 1 ảnh duy nhất, AGENTS Images). Trang lọc tag (không có bài nổi bật) và khi tắt "Feature the newest article": ảnh card đầu tiên eager + high, như hàng card đầu của collection không banner (ES1-T113). Trang 2+: như trang tag.
- Lazy: mọi ảnh card còn lại, ảnh footer (ảnh newsletter 98 × 123).
- Header tối: noise là `background-image` 1 file nhỏ đã có (`assets/noise-dark.png`), nằm trong critical.css, không tranh LCP (F§3.4).
- Ảnh: `snippets/image.liquid`, srcset 360/720/1080/1440; bài nổi bật `sizes="(min-width: 48rem) 58vw, 100vw"`, card `sizes="(min-width: 80rem) 336px, (min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw"`; width/height đủ, `object-fit: cover` (BP: đúng tỉ lệ).
- Font: Sofia Sans Condensed (eyebrow, h1, tiêu đề nổi bật) + Inter (còn lại), 2 họ, preload 1 (ADR 0003).
- JS: 0 file riêng cho trang (lọc, phân trang là link). Không có carousel trên trang blog.
- Motion: card hiện dần khi cuộn (sổ quyết định 09/11), nhưng KHÔNG áp cho ảnh/tiêu đề bài nổi bật và hàng card đầu khi chúng là LCP (reveal làm chậm LCP). Tắt khi `prefers-reduced-motion`.
- CLS: ảnh có aspect-ratio cố định, skeleton đúng tỉ lệ, phân trang disabled giữ chỗ.
- SEO: 1 h1; `<title>` "{blog.title} – Efitco", trang tag thêm "Tagged {tag}", trang 2+ thêm "Page N" (snippet `meta-tags`, kiểm lại có xử lý `current_tags`, `paginate.current_page` chưa); link card và tab là `<a href>` thật; chữ link mô tả đích; breadcrumb JSON-LD (F§5). robots.txt mặc định của Shopify chặn tổ hợp nhiều tag (`/blogs/*+*`), không chặn 1 tag; đo Lighthouse trên `/blogs/figma-blog`.
- A11y rủi ro và cách tránh: chữ trên ảnh (gradient, xem §6); tab lọc cuộn ngang làm mất focus (padding 3px); heading nhảy bậc (tham số `heading_tag`); link trùng tên (mỗi bài 1 link).
- BP: 0 lỗi console; không ảnh vỡ (không ảnh → khung tối).

## 8. Token dùng

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-background-dark(-foreground)`, `--color-muted-on-dark`, `--color-accent(-foreground)`.
Chữ: `--font-heading--family/weight/weight-display`, `--font-primary--family`, `--font-size-sm/base/lg/h2/h1`.
Khoảng cách: `--space-2..8`, `--page-margin`, dẫn xuất `--grid-gap`, `--section-gap` (F§2).
Bo góc: `--radius-card` (+ `--space-1` = 16 cho card/ảnh nổi bật như Figma), `--radius-button`, `--radius-pill`.
Motion: `--motion-slow`, `--ease-out`, `--ease-expo`. Không thêm token.

## 9. Map sang code

| Phần | Có sẵn | Cần làm (Dev FE) |
| --- | --- | --- |
| Header, footer | `.site-header*`, `.site-footer*` (F§21) | bỏ điều kiện `body:has(.slideshow)` để trang blog có header tối (việc chung F§21) |
| Card | `snippets/article-card.liquid`, `.article-card*` (padding 24 từ 48rem, meta trắng: đã đúng) | tham số `heading_tag`, `show_date`; meta 2 phần ngăn "·" |
| Tiêu đề trang, breadcrumb | — (F§21) | dùng chung theo F§5 |
| Lọc chủ đề | `.featured-collection__tab` (dáng) | `<nav>` link + `aria-current` |
| Bài nổi bật, empty state | — | mới, class theo block |
| Phân trang | `snippets/pagination.liquid` | render snippet chung, sửa snippet theo pagination.md §10 |
| Template | `templates/blog.liquid` thô | thay bằng `container` + block `blog-articles` |
| Chuỗi | `blog.*` có sẵn 7 khoá | thêm: `blog.topics_label`, `blog.all_topics`, `blog.articles_count` (one/other), `blog.tagged_count`, `blog.empty_*`, `blog.empty_tag_*`, `blog.loading` (phân trang dùng `collections.pagination.*` chung); dùng `blocks.blog_posts.read_time` có sẵn |

## 10. Quyết định CTO đã chốt (10/11)

CTO chốt cả các câu dưới đây theo đề xuất (docs/design/decisions.md, 10/11).
1. Trang blog có bài nổi bật (bài mới nhất, ảnh 4/3 + excerpt) ở trang 1, phần còn lại là card Figma 1:1022 không có excerpt; AC3 "excerpt_or_content" đáp ứng ở bài nổi bật và trang bài viết? Đề xuất: có. Card Figma giữ nhịp với trang chủ (06 §1); thêm excerpt vào card phủ ảnh làm vùng tối phải cao hơn và vỡ dáng Figma.
2. Card trên trang blog hiện "ngày · thời gian đọc" (trang chủ giữ chỉ thời gian đọc như Figma) qua tham số `show_date`? Đề xuất: có (AC3 published_at; mặc định false nên trang chủ không đổi).
3. Lưới card 1 cột ở 360 (card 320 × 427, trang dài hơn) thay vì 2 cột 152 × 203? Đề xuất: 1 cột; 2 cột làm tiêu đề 18px 3 dòng tràn vùng gradient và tag che nửa ảnh.
