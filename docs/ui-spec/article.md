KHÔNG CHẮC: Figma chỉ có trang chủ (1:359), trang bài viết dựng từ ngôn ngữ trang chủ (1:1022, 1:362, 1:1104). Không đọc được docs/ui-spec/product.md của ES1-T239 nên breadcrumb, input dựng lại từ token. Nội dung bài và 2 bình luận trong mockup là chữ ví dụ; theme lấy article.content, article.comments. Ảnh P08 trên store dev không khớp tên (ES1-T245) nên mockup không đặt ảnh sản phẩm trong bài.

# UI spec: trang bài viết (`templates/article.liquid`)

Ticket ES1-T243 · Story TE-9 AC3 (title, image, content, published_at, bình luận phân trang, form bình luận hoạt động), R7 · Mockup `drafts/designer/ES1-T243/article.html`, PNG `article-360/768/1280/1920.png`.

## Mục đích
Đọc một bài trọn vẹn, dễ quét (mục lục), chia sẻ, bình luận, rồi đọc tiếp bài khác cùng blog.

## Figma node
- 1:1022 (eyebrow, heading, card 1:1027, tag pill 1:1035): dùng cho tag bài và hàng "More From The Blog".
- 1:362 header, 1:1104 footer: dùng lại.
- Còn lại (khung đọc, mục lục, chia sẻ, bình luận, form, trạng thái): ĐỀ XUẤT.

## Anatomy
1. Header (nền sáng, Blog `aria-current`), breadcrumb Home / Blog / <title> (title cắt 1 dòng, ellipsis).
2. Đầu bài: tag pill (tag đầu, link trang tag; style 1:1035), H1 `article.title`, meta `published_at` (`time_tag`) · thời gian đọc.
3. Ảnh đầu `article.image`: eager + `fetchpriority="high"` (LCP), alt từ `article.image.alt`, `object-position` theo focal point.
4. Thân 3 cột (≥ 80rem): mục lục | `article.content` | chia sẻ dọc sticky. Dưới 80rem: 1 cột, mục lục là hộp xám trên nội dung, chia sẻ xuống cuối bài.
5. Mục lục "On This Page": sinh từ các `<h2>` trong `article.content` (Liquid split, gắn id), hiện khi có ≥ 3 h2. ĐỀ XUẤT.
6. Nội dung (rte): lead, h2, đoạn, list, blockquote, figure + figcaption, link accent.
7. Chân bài: chip tag (`article.tags`), chia sẻ: Facebook, X, Pinterest (link share mở tab mới, không JS), Email (`mailto:`), Copy link (JS, việc BE). ĐỀ XUẤT.
8. Bình luận (khi `blog.comments_enabled?`): "Comments (n)", danh sách (avatar chữ cái đầu, tên, ngày, nội dung), phân trang 10/trang `anchor: 'comments'`, form `new_comment`: Name, Email, Comment, ghi chú, nút "Post Comment".
9. Bài liên quan: `blocks/blog-posts.liquid` (giống hệt trang chủ), eyebrow "Keep reading", heading "More From The Blog", `.button--link` "View All Articles", 3 bài cùng blog trừ bài đang xem.
10. Footer.

## Settings merchant
Block mới `article-main`:
| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Show table of contents | checkbox | true | chỉ hiện khi có ≥ 3 tiêu đề h2 |
| Show share buttons | checkbox | true | |
| Show tags | checkbox | true | |
| Show reading time | checkbox | true | |
Block mới `article-comments`: không setting (bật/tắt và duyệt bình luận là setting của blog trong admin).
Block `blog-posts` (có sẵn) cho bài liên quan: Eyebrow "Keep reading", Heading "More From The Blog", Articles to show 3; thêm param `exclude` (id bài hiện tại) và `link_label` cho nút xem tất cả.

## Layout
| Width | Bố cục | Ảnh đầu | Khoảng cách |
| --- | --- | --- | --- |
| 360 | 1 cột; mục lục hộp `--color-background-alt` bo 16 padding 24 | 4/3, bo 16 | đầu bài padding 16 / 32; thân 32 / 48 |
| 768 | 1 cột; form Name + Email 2 cột | 16/9 | form padding 32 |
| 1280 | 280 \| 1fr (≤ 760) \| 280, gap 48 | 1416/600, bo 24 (như slideshow `--figma-radius-24`) | thân 64 / 120 |
| 1920 | 280 \| 760 \| 280, `space-between` trong 1416 | 1416 × 600 | như 1280 |
- H1, đầu bài, bình luận nằm ở cột giữa để mép chữ thẳng hàng với nội dung.
- Mục lục và chia sẻ sticky `inset-block-start: 104px` (header 80 + 24) từ 80rem.
- RTE: Inter 18/30, lead 20/32, h2 heading font 700 `--font-size-h2` (margin 48 / 16, `scroll-margin-block-start: 104px`), blockquote heading font `--font-size-h3` viền đầu dòng 4px foreground (accent dành cho hành động), figure bo 12 caption 14 muted-light.
- Bình luận: item lưới 44 | 1fr gap 16, phân cách viền `--color-border`; form nền alt bo 16; input cao 52, bo `--radius-input`, padding 12 / 16; textarea 160.
- Bài liên quan: như hàng trang chủ 1:1022 (card 336 × 448, gap 24, cuộn ngang dưới 64rem), padding 48 / 120.

## Trạng thái
- Bình luận lỗi (`form.errors`): hộp tóm tắt `role="alert"` viền đầu 4px `--color-sale`, tiêu đề "Your comment was not posted.", list link tới từng ô lỗi; ô lỗi viền 2px sale, `aria-invalid="true"`, `aria-describedby` tới dòng lỗi (icon + chữ sale 14/500). Giá trị đã nhập giữ lại (`form.author`, `form.email`, `form.body`). ĐỀ XUẤT.
- Gửi thành công (`form.posted_successfully?`): hộp `role="status"` viền đầu `--color-badge-new`; blog có duyệt (`blog.moderated?`): "Thanks for your comment. It will appear after review." ĐỀ XUẤT.
- Đang gửi: form submit thường; nếu BE thêm JS thì nút `aria-busy="true"` + spinner có sẵn trong base.css.
- Chưa có bình luận: "No comments yet. Be the first to share your thoughts." trên form. Blog tắt bình luận: ẩn cả vùng.
- Bài không ảnh: ẩn ảnh đầu, không chừa khung.
- Bài < 3 h2: ẩn mục lục, cột trái trống ở ≥ 80rem (nội dung vẫn ở cột giữa).
- Không có bài khác: block blog-posts không render (hành vi sẵn có).
- Loading: server render, không skeleton.
- Hover: link mục lục viền đầu + chữ sang foreground; nút chia sẻ, chip đổi viền foreground; input viền foreground; card liên quan như trang chủ. Motion `--motion-fast`, trong `prefers-reduced-motion: no-preference`; cuộn anchor mượt chỉ khi không reduce.
- Focus-visible: 2px currentcolor offset 2px; input thêm viền foreground; pill và card viền accent.

## Accessibility
- Tương phản:
  - Meta, ngày bình luận, caption `#6B6B6B` trên trắng 5.33:1.
  - Ghi chú form, link mục lục `#4D4D4D`: trên trắng 8.45:1, trên `#F4F4F4` (L = 0.905) (0.955)/(0.1242) = 7.69:1.
  - Lỗi `#BD1616`: L = 0.2126·0.509 + 0.7152·0.00802 + 0.0722·0.00802 = 0.1145 → trên trắng 1.05/0.1645 = 6.38:1, trên `#F4F4F4` 0.955/0.1645 = 5.81:1.
  - Viền input `#6B6B6B` (ĐỀ XUẤT, thay `--color-border` 1.27:1 không đạt 3:1 cho ranh giới ô nhập, WCAG 1.4.11): 5.33:1 với nền ô trắng.
  - Viền thành công `#4B824D` trên trắng 4.57:1 (≥ 3:1 cho thành phần không phải chữ), luôn kèm chữ.
  - Avatar `#1A1A1A` trên sand `#EBE6E0` ≈ 13.9:1.
  - Pill tag: trắng trên accent 5.01:1.
- Touch: link mục lục, chip, nút chia sẻ, breadcrumb, ô trang 44px; input 52px.
- Keyboard: skip link → breadcrumb → tag → mục lục → nội dung → chia sẻ → bình luận → form → bài liên quan. Lỗi: focus vào hộp tóm tắt sau khi tải lại (anchor `#comments`; nếu cần focus chính xác thì BE).
- Semantics: `article`, `nav aria-labelledby` cho mục lục, `aside` chia sẻ, `section#comments`, `ol` bình luận, label thật cho mọi ô, `autocomplete="name" / "email"`, link mở tab mới ghi rõ trong aria-label.
- Alt: ảnh đầu dùng alt từ Shopify; ảnh card liên quan `alt=""`.

## Token dùng
Màu: background, foreground, muted, muted_light, border, background_alt, background_sand, background_dark, background_dark_foreground, muted_on_dark, accent, accent_foreground, sale, badge_new (chỉ viền). Font heading 700/800, primary 400–700. Cỡ xs, sm, base, lg, h3, h2, h1, wordmark. Space 1–8. Radius input, card, figma-radius-8/16/24, pill. Motion fast, slow, ease-out. Không thêm màu.

## Map block
| Phần | Hiện có | Việc |
| --- | --- | --- |
| Header, footer | blocks/header.liquid, blocks/footer.liquid | dùng lại |
| Breadcrumb | chưa có | snippet `breadcrumb.liquid` (chung với blog) |
| Đầu bài, ảnh, mục lục, nội dung, tag, chia sẻ | templates/article.liquid (markup thô) | block mới `blocks/article-main.liquid`; snippet `share-links.liquid` |
| Bình luận + form | templates/article.liquid | block mới `blocks/article-comments.liquid` (FE); Copy link và aria-busy: ticket BE riêng |
| Phân trang bình luận | snippets/pagination.liquid | dùng lại, cần hỗ trợ `anchor` |
| Bài liên quan | blocks/blog-posts.liquid | thêm param `exclude`, nút "View All Articles" |
| Locale mới | blog.* có sẵn: article_comments, comment_form_* | thêm: blog.toc_title, blog.share_title, blog.share_facebook/x/pinterest/email, blog.copy_link, blog.link_copied, blog.comments_count, blog.comment_note, blog.comment_success, blog.comment_success_moderated, blog.comment_errors_title, blog.no_comments, blog.view_all |

## Quyết định CTO cần chốt
1. Có mục lục tự sinh không? Đề xuất có, Liquid tách h2 trong article.content và gắn id, chỉ hiện khi có từ 3 h2, không scroll-spy (không JS).
2. Nút Copy link cần JS (BE)? Đề xuất giữ, thêm vào ticket BE; khi chưa có JS thì nút ẩn và vẫn còn 4 link chia sẻ không JS.
3. Chữ nút gửi bình luận: locale hiện là "Post". Đề xuất "Post Comment" theo giọng CTA Title Case của DESIGN.md, kèm ghi chú "Comments appear after review" khi blog bật duyệt.
