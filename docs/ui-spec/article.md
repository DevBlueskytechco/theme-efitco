KHÔNG CHẮC: demo-data không có `article.content`, author, excerpt, bình luận (hỏi BA ở ES1-T267, gộp được với ES1-T266). Nội dung bài, tên tác giả "Efitco Team", alt ảnh bìa và 2 bình luận trong mockup là mẫu bố cục, không phải dữ liệu thật. Ảnh bìa khung 1880 ở 1920 theo cách code slideshow chừa `--page-margin`, Figma hero 1:422 là 1798.

# UI spec: Trang bài viết (ES1-T257)

Mục đích: người mua đọc trọn bài dễ chịu, biết bài thuộc chủ đề nào, để lại bình luận và đọc tiếp bài liên quan. Story TE-9 AC3 (title, image, content, published_at, comments phân trang, form comment hoạt động), R7.
Template: `templates/article.liquid` (hiện là markup Skeleton thô: ảnh, h1, meta, content, comments, form `new_comment` với `default_errors`, nút `<input type=submit>`).
Figma: không có trang bài viết. Dùng ngôn ngữ trang chủ: hero 1:422 (khung ảnh), header 1:362 (đè ảnh), block Blog posts 1:1022 (eyebrow, heading, card), FAQ 1:1057 (gạch phân cách), input 1:1104. Thành phần chung: `docs/ui-spec/foundation.md` (F§). Trang danh sách: `docs/ui-spec/blog.md`.
Mockup: `drafts/designer/ES1-T257/article.html` + `article-360|768|1280|1920.png`. Trạng thái ở cuối file.

## 1. Anatomy

1. Header biến thể B, đè ảnh bìa (sổ quyết định 09/11, F§3). Sau 80px cuộn thành biến thể C (nền trắng). Bài không ảnh bìa: biến thể A.
2. Ảnh bìa (`article.image`, LCP): khung riêng, không có chữ đè ngoài header. Dải tối trên đỉnh cho chữ header (§5).
3. Cột đọc (`46rem`, căn giữa container), gồm:
   - Breadcrumb (F§5): `Home / {blog.title} / {article.title}`; mục cuối cắt "…" 22ch / 48ch.
   - Tag pill (tag đầu, link tới trang tag, vùng chạm 44 bằng `::after`).
   - h1 `{article.title}`.
   - Meta 14 muted: ngày `<time>` · "By {article.author}" · thời gian đọc (`blocks.blog_posts.read_time`, 200 từ/phút, D8 ES1-T169).
   - Nội dung `article.content` (RTE, §4).
   - Cuối bài, gạch trên 1px border: "Topics" + mọi tag dạng tab link (F§7) · link "Back to {blog.title}" (mũi tên trái, chữ mô tả đích).
4. Bình luận (chỉ khi `blog.comments_enabled?`), gạch trên 1px border:
   - h2 "{n} Comments" (`article.comments_count`; 0 thì "Comments").
   - Danh sách `<ol>`: avatar 40 tròn nền alt chữ cái đầu (`aria-hidden`) · tên 16/600 · ngày 14 muted `<time>` · nội dung 16. Gạch giữa các mục.
   - Phân trang bình luận 10 / trang, neo `#comments` (component phân trang của blog.md §5, chữ "Earlier comments" / "Later comments").
   - Form `{% form 'new_comment', article %}`: h2 "Add a comment" (cỡ h3) · ghi chú duyệt (chỉ khi `blog.moderated?`, icon i + "Comments are reviewed before they appear.") · Name*, Email* (gợi ý "Not published."), Comment* · nút primary "Post Comment" · "* Required".
5. Bài liên quan: hàng ngang (sổ quyết định 09/11): eyebrow "From the Efitco blog" · h2 "More Training Tips" (cỡ h1 như Figma 1:1025) · nút tròn 52 next/back ở đầu khối (F§11) · `<ul>` card Figma 1:1022 (title h3) · thanh tiến trình. Nguồn: bài cùng tag đầu, thiếu thì bài mới nhất; bỏ bài đang xem; tối đa theo setting.
6. Footer (F§4).

## 2. Settings merchant

ĐỀ XUẤT: 3 block tự chứa trong `templates/article.liquid`, mỗi block một `container` (AGENTS Composition model). Nguồn: 01, Figma 1:1022.

`article-main`:

| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Show cover image | checkbox | true | tắt hoặc bài không ảnh → header nền trắng |
| Show author | checkbox | true | |
| Show date | checkbox | true | |
| Show reading time | checkbox | true | content rỗng thì ẩn |
| Show topics | checkbox | true | bài không tag thì ẩn |

`article-comments`: không setting; bật/tắt và duyệt bình luận ở admin Shopify (Blog posts → Manage blogs). Block không render gì khi `blog.comments_enabled?` sai.

`related-articles`:

| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Eyebrow | text | From the Efitco blog | trống thì ẩn |
| Heading | text | More Training Tips | trống thì ẩn |
| Articles to show | range | 4 | 2–8 |

## 3. Layout theo mốc

| Phần | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Ảnh bìa | tràn màn 360 × 270 (4/3), không bo | 728 × 410 (16/9), bo `--radius-hero` | 1240 × 570 (1798/827, như hero) | 1880 × 865 |
| Cột đọc | 320 | 728 | 736 giữa | 736 giữa |
| Breadcrumb | cách ảnh 20 (8 + 12), 14/20 | như 360 | cách ảnh 28 (16 + 12) | như 1280 |
| h1 | 33 | 43 | 48/58 | 48/58 |
| Đầu bài → nội dung | 32 | 32 | 48 | 48 |
| Chữ nội dung | 16 / 1.7 | 16 / 1.7 | 18 / 1.7 | 18 / 1.7 |
| Cuối bài → bình luận | 48 + 48 | 48 + 48 | 48 + 48 | 48 + 48 |
| Form | 1 cột, nút full width | Name, Email 2 cột | 2 cột | 2 cột |
| Bài liên quan | card 252 × 336, lộ card kế, vuốt, không nút | card 307 × 410, có nút + tiến trình | 3 card 336 vừa khung: ẩn nút + tiến trình | như 1280 |
| Cách trên/dưới bài liên quan | 48 | 48 | 120 | 120 |

Cột đọc 46rem ≈ 65 ký tự ở chữ 18 (F§1 `max-inline-size: 65ch`, 06 §3 dòng 50–75 ký tự). Mọi phần trong cột (đầu bài, nội dung, cuối bài, bình luận) cùng mép trái; bài liên quan và footer về lại container đầy đủ.
Ảnh bìa dùng focal point của ảnh (snippet `image`); 3 tỉ lệ là cắt khác nhau của cùng 1 ảnh, không cần ảnh mobile riêng.

## 4. Nội dung bài (RTE)

ĐỀ XUẤT (06 §3 eye comfort, 03 §4, F§6 text link):
- Đoạn cách nhau 24; h2 `--font-size-h2` cách trên 48, dưới 16; h3 `--font-size-h3` cách trên 32.
- Danh sách thụt 24, cách mục 8, marker accent.
- Link trong đoạn: gạch chân 1px offset 0.2em, 500; hover accent (Lighthouse `link-in-text-block`).
- Trích dẫn: viền inline-start 4px accent, chữ heading 700 cỡ h3, không nghiêng.
- Ảnh trong bài: 100% cột, bo `--radius-card`, chú thích `figcaption` 14 muted cách 8; lazy, giữ width/height của ảnh trong RTE.
- Bảng: cuộn ngang trong khung riêng, không làm trang cuộn ngang.
- Heading trong bài bắt đầu từ h2 (merchant chọn trong editor; hướng dẫn merchant ghi rõ, vì h1 đã là tiêu đề bài).

## 5. Trạng thái

Figma không có; ĐỀ XUẤT theo F§12, F§18, nguồn kèm.

| Trạng thái | Khi nào | Hiển thị | Nguồn |
| --- | --- | --- | --- |
| Không ảnh bìa | `article.image` rỗng hoặc tắt setting | header A nền trắng; cột đọc bắt đầu ngay dưới header; LCP là h1 | sổ quyết định 09/11 |
| Không tag | | không pill, không "Topics" | |
| Chưa có bình luận | `comments_count == 0` | h2 "Comments" + "No comments yet. Share how you cool down after training." (chữ merchant sửa trong locale) + form | 05 §7 |
| Bình luận chờ duyệt | `form.posted_successfully?` và `blog.moderated?` | hộp success F§12 đầu form, `role="status"`, nhận focus (`tabindex="-1"`): "Thanks, your comment is in review" / "It appears here once a moderator approves it."; ô nhập rỗng | 05 §6, 04 §6 (không tự ẩn) |
| Đăng ngay | thành công, blog không duyệt | hộp success "Your comment is posted.", bình luận mới cuối danh sách | |
| Lỗi gửi | `form.errors` | hộp tóm tắt `role="alert"` "Check {n} fields" + lỗi inline dưới từng trường (đỏ + icon, `aria-invalid`, `aria-describedby`); giữ chữ đã nhập; focus hộp tóm tắt. Thay `default_errors`. Câu theo trường: Name "Enter your name.", Email "Enter an email like name@example.com.", Comment "Write a comment before posting." | 05 §4, F§12 |
| Đang gửi | sau bấm, có JS | nút `aria-busy`, spinner, bề rộng giữ nguyên, không bấm lại; không JS thì form gửi thường | 05 §5, F§6 |
| Lỗi mạng / captcha | chỉ khi BE gửi bằng JS | toast error F§17 "Couldn't post your comment", giữ chữ | F§17 |
| Bình luận tắt | `comments_enabled?` sai | không render khu bình luận | AC3 |
| Bài liên quan thiếu | blog chỉ 1 bài | không render khối; 1–2 bài: hiện số có, ẩn nút + tiến trình (như AC-H9) | |
| Hover | | card như blog.md; tag pill tối hơn 12%; link "Back to…" gạch chân + mũi tên lùi 4px; tab "Topics" viền foreground | F§6, F§7 |
| Focus | | outline 2px accent offset 2; input viền + outline accent (F§12) | |

Bình luận dùng form chuẩn Shopify: không cần JS, sau POST trang tải lại về `#comments`.

## 6. Accessibility

| Cặp | Tỉ lệ | Chỗ dùng |
| --- | --- | --- |
| foreground / background | 17.4 | h1, nội dung, tên người bình luận |
| muted / background | 8.45 | meta, ngày, ghi chú, gợi ý |
| accent-foreground / accent | 5.01 | tag pill, nút Post Comment |
| sale / background | 6.38 | lỗi inline |
| muted-light / background | 5.33 | viền ô nhập (sổ quyết định 09/11), dấu "/" |
| background-dark-foreground / dải tối 85% trên ảnh | ≥ 4.98 | chữ header đè ảnh bìa |

Dải tối trên ảnh bìa: `--color-background-dark` 85% từ đỉnh tới 0.75 × `--header-height` (60px), mờ về 0 ở 2 × header-height. Ảnh trắng tệ nhất: L nền = 0.15 × 1 + 0.85 × 0.013 = 0.161 → (1 + 0.05) / (0.161 + 0.05) = 4.98:1, đạt AA cho menu 16px và icon. Không đặt chữ khác lên ảnh (tiêu đề nằm dưới ảnh, 06 text over images).
- Heading: h1 tiêu đề → h2 trong bài → h2 "Comments" → h2 "Add a comment" → h2 "More Training Tips" → h3 card → h2 footer.
- Ảnh bìa có alt = alt Shopify của ảnh (không rỗng: ảnh mang nội dung bài); ảnh card liên quan `alt=""` (tên ở tiêu đề link).
- Form: `<label for>` thật, `autocomplete="name"`, `"email"`, `required` + dấu * `aria-hidden` + chú thích "* Required"; không chặn dán; nút là `<button type="submit">` có chữ "Post Comment" (không "Submit").
- Breadcrumb cuối `aria-current="page"`; tag link tên = tên tag.
- Vùng chạm: tag pill 28 cao, vùng chạm 44 bằng `::after`; tab Topics 44; link "Back to…" cao 44; nút 48/52; nút tròn 52.
- Chữ ≥ 14 ở mọi chỗ (SEO ≥ 12).

## 7. Lighthouse

- LCP: ảnh bìa (`loading="eager"`, `fetchpriority="high"`, ≤ 200 KB WebP như hero, ADR 0003). `sizes="(min-width: 48rem) calc(100vw - 40px), 100vw"`, srcset tới 1920 (bổ sung 1920 cho khung 1880; snippet hiện tới 1440 → ĐỀ XUẤT Dev FE kiểm độ nét ở 1920, BP "image-size-responsive"). Không ảnh bìa: LCP là h1, không có ảnh eager nào.
- Lazy: ảnh trong nội dung bài, card bài liên quan, ảnh footer.
- Font: Sofia Sans Condensed (h1, h2, trích dẫn) + Inter; 2 họ, preload 1.
- JS: trang chạy không JS; chỉ hàng bài liên quan dùng `scroll-buttons` sẵn có (đã tính trong ngân sách trang chủ); spinner nút gửi là tuỳ chọn BE.
- Motion: ảnh bìa và đầu bài hiện ngay (không reveal, tránh trễ LCP); reveal khi cuộn chỉ cho card bài liên quan và tiêu đề khối; tắt khi giảm chuyển động.
- CLS: khung ảnh bìa có aspect-ratio; header đè ảnh là absolute nên không đẩy nội dung; hộp lỗi/thành công chỉ xuất hiện sau tải lại trang.
- SEO: `<title>` "{article.title} – Efitco"; meta description = `article.excerpt_or_content | strip_html | truncate: 160` (snippet `meta-tags`); 1 h1; link "Back to {blog.title}", tag, card đều mô tả đích; ĐỀ XUẤT JSON-LD `BlogPosting` (headline, image, datePublished, author) + `BreadcrumbList` trong 1 snippet mới, chỉ 1 khối mỗi loại (SEO structured data phải hợp lệ khi có).
- A11y rủi ro và cách tránh: chữ header trên ảnh (dải 85%); heading trong RTE do merchant nhập (hướng dẫn bắt đầu h2); lỗi form chỉ bằng màu (có icon + chữ); link trong đoạn không gạch chân (gạch sẵn).
- BP: Shopify có thể gắn hCaptcha cho form bình luận (KHÔNG CHẮC: tuỳ cài đặt chống spam của store); script bên thứ ba có thể ghi cảnh báo console hoặc cookie bên thứ ba. Đo Lighthouse trên bài có form và ghi lại; nếu trừ điểm, hỏi CTO tắt hCaptcha trên store demo.

## 8. Token dùng

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-background-dark(-foreground)`, `--color-muted-on-dark`, `--color-accent(-foreground)`, `--color-sale`, `--color-badge-new`.
Chữ: `--font-heading--family/weight/weight-display`, `--font-primary--family`, `--font-size-sm/base/lg/h3/h2/h1`.
Khoảng cách: `--space-1..8`, `--header-height`, `--page-margin`, dẫn xuất `--section-gap`, `--control-height`.
Bo góc: `--radius-hero`, `--radius-card`, `--radius-input`, `--radius-button`, `--radius-pill`.
Motion: `--motion-base`, `--motion-slow`, `--ease-out`. Không thêm token.

## 9. Map sang code

| Phần | Có sẵn | Cần làm |
| --- | --- | --- |
| Header đè ảnh | `[data-header-overlay]`, `[data-scrolled]` | bật cho template article khi có ảnh bìa; dải tối 85% |
| Ảnh bìa | `snippets/image.liquid`, khung `.slideshow` | class riêng `article-hero`, `priority` |
| Breadcrumb, form, nút, toast | F§5, F§6, F§12, F§17 | dùng chung |
| Card liên quan + hàng ngang | `article-card`, `scroll-buttons`, `.carousel-progress` | logic chọn bài cùng tag (Liquid) |
| Bình luận | markup thô trong template | block `article-comments`, lỗi theo trường, hộp thành công |
| Chuỗi | `blog.article_comments`, `comment_form_*`, `article_metadata_html` | sửa `comment_form_submit` "Post" → "Post Comment" (câu CTO 3); thêm `blog.comments_count` (one/other), `blog.no_comments`, `blog.comment_moderated_note`, `blog.comment_pending_*`, `blog.comment_posted`, `blog.comment_errors_summary`, `blog.comment_error_author/email/body`, `blog.email_hint`, `blog.required_note`, `blog.topics`, `blog.back_to_blog` ("Back to {{ blog }}"), `blog.related_*`; nhãn breadcrumb dùng chung F§5 |

## 10. Quyết định CTO cần chốt

1. Ảnh bìa bài viết không có chữ đè (chỉ header), tiêu đề và meta nằm dưới ảnh ở mọi mốc? Đề xuất: có. Chữ đè ảnh tuỳ ảnh merchant tải lên không đảm bảo AA (06 text over images); tiêu đề dưới ảnh giữ cùng thứ tự ở 360/768/1280 (06 §2) và LCP chỉ còn 1 ảnh.
2. Dải tối 85% trên đỉnh ảnh bìa (cao 2 × header, mờ dần) để chữ header trắng đạt 4.98:1 với mọi ảnh, thay vì overlay 30% phủ cả ảnh như hero (F§3 B)? Đề xuất: có; ảnh phần dưới giữ màu thật, header luôn đọc được.
3. Đổi chữ nút gửi bình luận từ "Post" (locale hiện tại) thành "Post Comment", và ô Email ghi "Not published."? Đề xuất: có; nhãn nói rõ hành động (04 §2, DESIGN CTA Title Case), câu gợi ý giảm lo ngại lộ email.
