KHÔNG CHẮC: (1) 4 điểm chờ CTO ở ES1-T422, AC đã viết theo MẶC ĐỊNH: setting chữ default rỗng, heading rỗng thì dùng chuỗi locale; breadcrumb mục cuối cắt theo foundation §5; upsell drawer (TE-19 AC9) chưa có task R2, sau R1; breadcrumb sản phẩm không collection là Home / {product}. (2) Không đọc được `drafts/techlead/ES1-T307/task-split.md` (nhánh khác); mã task R2 lấy từ tiêu đề ticket ES1-T326–T330, T371, T372, T376, T381–T386, T403, T407, T408, T410. (3) Dữ liệu store dev (blog ≥ 10 bài, bài > 10 bình luận, page contact, password, gift card đã phát hành, main-menu 3 cấp, ảnh collection) chờ ES1-T298. (4) Không có shell: chưa chạy `vague_words.py`, `traceability.py`; rà tay. (5) File này là phần story mới của SRS 0.5; Orchestrator ghép vào `docs/srs.md` cùng ES1-T394 (REQ2-BA1), ES1-T395 (REQ2-BA2); hook chặn BA ghi `docs/`.

# SRS 0.5 — story mới TE-19, TE-20, TE-21, TE-22 · BA · 11/11/2026 · ES1-T396 (REQ2-BA3)

Nguồn: REQ-0002; ES1-T307 (story mới, mã task R2), ES1-T308 #1 (nội dung mẫu trống), #4 (Should cắt trước), ES1-T309 #1 (mọi ĐỀ XUẤT trong ui-spec là phạm vi), ES1-T311 (cắt TE-20 mở rộng nếu thiếu giờ FE), ES1-T247 (upsell = TE-19); `docs/design/decisions.md` (10/11 G2, B1–B3, A1–A3, PG1–PG2, E1, PW1–PW2, GC1, N1–N3; 11/11 tuân thủ Shopify (3), (4), (5)); ui-spec: `cart.md` §3.8, §5; `mini-cart-quickview.md` §1, §2, §5; `blog.md`; `article.md`; `page.md`; `404.md`; `password.md`; `gift-card.md`; `navigation.md`; `foundation.md` §3.3, §5, §10–§12, §18, §28; `pagination.md`.

Quy ước chung cho 4 story:
- AC đánh dấu "(0.5)" là mới trong bản này. Mã R theo `docs/checklist-theme-store.md`.
- Nội dung mẫu (ES1-T308 #1): AC "theme mới cài" kiểm theme sạch (setting chữ rỗng, không handle `figma-*`, không sản phẩm/collection chọn sẵn); AC "store dev đã cấu hình" kiểm nội dung theo spec do fixture TE-17-R2-QA0 (ES1-T331) đặt trên hoa-qua-nhap-khau (efitco-ai-dev).
- Mốc đo: 360, 768, 1280, 1920 (sổ 09/11). Lighthouse theo NFR-1; SEO chỉ tính ở blog, article, page (sổ 10/11).
- Không JS: mọi luồng chính (thêm giỏ, lọc tag, gửi bình luận, gửi liên hệ, mật khẩu, menu) chạy bằng link/form (NFR-4).

Ưu tiên (ES1-T308 #4, ES1-T310 #4, ES1-T311): TE-19 Should, cắt cuối trong nhóm Should (sau TE-18, mega ảnh/sản phẩm, B2B, recent searches). TE-20 Must; phần mở rộng (nav chủ đề, bài nổi bật, bài liên quan: AC1 phần bài nổi bật, AC3, AC13) cắt thứ 2 nếu thiếu giờ FE. TE-21 Must, cuối Sprint 4. TE-22 Must; AC5 (ảnh danh mục, sản phẩm nổi bật trong menu) là Should, TE-22-R2-FE3.

---

### TE-19 — Upsell giỏ hàng (0.5, mới)
Phía: FE1 markup/CSS (TE-19-R2-FE1, ES1-T371) + BE1 JS (TE-19-R2-BE1, ES1-T372) + QA1 (TE-19-R2-QA1, ES1-T376) · Ước lượng: techlead (task-split ES1-T307) · Ưu tiên: Should · Nguồn: ES1-T247, sổ 10/11 G2 (complementary, tối đa 4), `cart.md` §3.8, §5, §6; `mini-cart-quickview.md` §1, §2, §5 (drawer, chờ ES1-T422 #3)

Là khách đang xem giỏ, tôi muốn thấy tối đa 4 sản phẩm dùng kèm với hàng trong giỏ và thêm vào giỏ ngay tại trang giỏ, để không phải quay lại collection tìm phụ kiện.

- AC1 (0.5) Given cart page có ≥ 1 dòng hàng, setting "Show recommendations" bật, Product Recommendations API intent complementary trả ≥ 1 sản phẩm cho sản phẩm của dòng đầu When trang tải xong Then dưới khu giỏ (sau accelerated checkout, cách `--section-gap`: 48 ở 360 và 768, 120 ở 1280 và 1920) có khối upsell: eyebrow (chỉ khi setting eyebrow không rỗng), h2, tối đa N card (N = "Products to show", 2–4, mặc định 4); không card nào là sản phẩm đã có trong giỏ; card theo foundation §9 (như TE-3), tên sản phẩm hiện đủ, không cắt.
- AC2 (0.5) Given một trong các điều kiện: API trả 0 sản phẩm, API lỗi, giỏ rỗng, setting "Show recommendations" tắt When render Then không có khối upsell, không chừa chỗ cho khối (skeleton đã hiện thì gỡ sau khi tải xong). Given setting "Show recommendations on mobile" tắt When viewport dưới 48rem Then không có khối upsell.
- AC3 (0.5, `cart.md` §2, §3.8; sổ 09/11 hàng ngang) Given khối upsell có 4 card When đo Then 360: hàng vuốt, thấy 2 card và mép card 3, có thanh tiến trình, không chevron; 768: thấy 3 card và 25% card 4, có 2 chevron tròn 52px ở đầu khối và thanh tiến trình; 1280: lưới 4 card rộng 292px, không chevron, không thanh tiến trình; 1920: lưới 4 card rộng 336px. Hàng vừa khung, không còn card để cuộn Then không chevron, không thanh tiến trình (HD3).
- AC4 (0.5) Given card của sản phẩm 1 biến thể còn hàng When bấm "Add To Cart" (icon túi + chữ, cao 44px, tên truy cập "Add {tên sản phẩm} to cart") Then thêm 1 đơn vị biến thể đó vào giỏ. Có JS Then nút ở trạng thái đang thêm (`aria-busy`, giữ bề rộng), sau khi thêm: danh sách dòng hàng, tổng tiền và số giỏ ở header cập nhật không tải lại trang, có dòng mới, toast thành công (foundation §17), card vừa thêm rời khối upsell, sự kiện `shopify:cart:lines-update` được dispatch (TE-5 AC7). Không JS Then form gửi thêm giỏ, trang `/cart` tải lại có dòng mới. Lỗi 422 Then câu lỗi Shopify trả về hiện dưới nút trong `role="alert"`, giỏ không đổi.
- AC5 (0.5) Given card của sản phẩm nhiều biến thể When render Then nút là link "Choose Options" tới trang sản phẩm, cao 44px, tên truy cập có tên sản phẩm.
- AC6 (0.5, `cart.md` §3.8, §8) Given cart page có hàng When trang tải Then khối upsell nạp sau khi trang hiển thị, giữ chỗ bằng skeleton 4 card đúng kích thước card (CLS do khối = 0); ảnh card `loading="lazy"` có width/height; phần tử LCP của trang không thuộc khối upsell.
- AC7 (0.5, `cart.md` §6) Given trình đọc màn hình và bàn phím When duyệt cart page Then thứ tự heading: h1 "Cart" → h2 tóm tắt đơn → h2 khối upsell → h3 tên card; mỗi nút thêm giỏ và link "Choose Options" có tên riêng chứa tên sản phẩm; chevron có tên truy cập, ở đầu/cuối hàng `aria-disabled="true"`; vùng chạm nút 44px, chevron 52px; focus thấy được.
- AC8 (0.5, ES1-T308 #1, ES1-T422 #1) Given theme mới cài When mở cart page có hàng và API trả sản phẩm Then setting eyebrow và heading rỗng: không có eyebrow, h2 dùng chuỗi locale của theme. Given store dev đã cấu hình (eyebrow "Complete your setup", heading "You May Also Need") When mở cart page Then hiện đúng 2 chuỗi đó.
- AC9 (0.5, `mini-cart-quickview.md` §1.2.5, §2; chưa có task R2, sau R1 theo mặc định ES1-T422 #3) Given cart drawer mở, giỏ ≥ 1 dòng, setting "Show product recommendations" của drawer bật When API complementary của dòng đầu trả ≥ 1 sản phẩm chưa có trong giỏ Then sau mục ghi chú đơn có h3 (setting heading, rỗng dùng chuỗi locale) và tối đa 2 hàng sản phẩm (ảnh 64, tên, giá, nút 44px). Sản phẩm 1 biến thể: nút "Add" thêm 1, drawer và số giỏ cập nhật không tải lại. Sản phẩm nhiều biến thể: nút "Choose" đóng drawer rồi mở quickview (TE-3 AC10); thêm giỏ xong drawer mở lại; tại mỗi thời điểm chỉ 1 lớp mở. Đang tải Then 2 hàng skeleton đúng kích thước; 0 kết quả hoặc lỗi Then không có khối.

Settings (0.5; label sentence case, `t:` trong `locales/en.default.schema.json`):

| Block | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| cart-upsell (cart page) | Show recommendations | checkbox | true | tắt thì không render khối | `cart.md` §5, G2 |
| cart-upsell | Recommendations eyebrow | text | rỗng | rỗng thì ẩn; store dev "Complete your setup" | `cart.md` §5; ES1-T308 #1; ES1-T422 #1 |
| cart-upsell | Recommendations heading | text | rỗng | rỗng thì dùng chuỗi locale; store dev "You May Also Need" | như trên |
| cart-upsell | Products to show | range | 4 | 2–4, bước 1 | `cart.md` §5, G2 |
| cart-upsell | Show recommendations on mobile | checkbox | true | tắt thì không có khối dưới 48rem | `cart.md` §5 |
| cart-drawer | Show product recommendations | checkbox | true | 2 sản phẩm; AC9 sau R1 | `mini-cart-quickview.md` §5; ES1-T422 #3 |
| cart-drawer | Recommendations heading | text | rỗng | ≤ 30 ký tự; rỗng dùng chuỗi locale; store dev "Pairs Well With" | như trên; ES1-T422 #1 |

Không thêm setting chọn intent: intent complementary cố định (G2). Setting "Empty cart collection", "Show sticky checkout bar on mobile" của `cart.md` §5 thuộc TE-5 (ES1-T395).

Mã R: R4.11 complementary products; R7.5 cart; R12 (AC7); R17 (AC6); R6.1 Lighthouse (AC6)

---

### TE-20 — Blog và bài viết (0.5, mới; thay TE-9 AC3)
Phía: FE (TE-20-R2-FE1 ES1-T381, TE-20-R2-FE2 ES1-T382; phần tuân thủ TS-FE5 ES1-T403, TS-FE7 ES1-T407) + QA1 (TE-20-R2-QA1, ES1-T385) · Ước lượng: techlead · Ưu tiên: Must; AC3, phần bài nổi bật của AC1, AC13 cắt được theo ES1-T311 · Nguồn: `blog.md`, `article.md`, sổ 10/11 B1–B3, A1–A3, sổ 11/11 tuân thủ (3), (4), (5), PG1

Là khách, tôi muốn xem danh sách bài theo chủ đề, đọc trọn một bài, để lại bình luận và mở tiếp bài liên quan, để tìm được hướng dẫn tập luyện mà không rời store.

Trang blog (`templates/blog.liquid` → `container` → block `blog-articles`):

- AC1 (0.5, `blog.md` §1) Given blog có ≥ 2 bài, đang ở trang 1, không lọc tag, setting "Feature the newest article" bật When mở blog Then thứ tự: breadcrumb `Home / {blog.title}` (TE-22 AC9); eyebrow (chỉ khi setting không rỗng); h1 `{blog.title}`; dòng số bài ("N articles", số ít/nhiều theo locale); nav chủ đề (AC3); bài nổi bật là bài mới nhất: ảnh 4/3 bo 16, tag đầu, h2 tiêu đề là link duy nhất của khối, `excerpt_or_content` bỏ HTML tối đa 30 từ (setting "Show excerpt"), meta ngày · thời gian đọc; lưới card các bài còn lại; phân trang (AC5).
- AC2 (0.5, sổ 11/11 (3), (4); `blog.md` §1.6, §3) Given trang blog When render lưới card Then mỗi card: ảnh 3/4 bo 16 có gradient tối, tag đầu (không là link), tiêu đề h2 hiện đủ (không `line-clamp`, không "…"), `excerpt_or_content` bỏ HTML tối đa 20 từ, meta "{ngày} · {N} min read" (ngày theo "Show date", thời gian đọc theo "Show reading time", 200 từ/phút, D8); mỗi card đúng 1 link, tên link = tiêu đề bài. Lưới: 1 cột ở 360 (card 320 × 427), 2 cột ở 768, 3 cột từ 64rem tới dưới 80rem, 4 cột từ 80rem (292 × 389 ở 1280, 336 × 448 ở 1920). Bài không ảnh Then nền `--color-background-dark`, chữ 17.4:1. Bài không tag Then không pill. `article.content` rỗng Then chỉ còn ngày.
- AC3 (0.5, `blog.md` §1.4, §4) Given blog có ≥ 1 tag và setting "Show topic filter" bật When render Then `<nav aria-label="Blog topics">` chứa link "All" (tới `blog.url`) và mỗi tag 1 link `<a href>` tới trang tag; mục đang xem có `aria-current="page"`, không dùng `role="tab"`. Given bấm 1 tag When trang tag tải Then breadcrumb thêm tag, meta "N articles tagged {tag}", không có bài nổi bật, lưới bắt đầu ngay sau nav. Không JS Then lọc bằng link, kết quả như có JS. Blog không có tag Then không render nav. Ở 360 nav là 1 hàng cuộn ngang, trang không cuộn ngang kể cả zoom 200%.
- AC4 (0.5, `blog.md` §4) Given blog 0 bài When render Then không nav, không dòng số bài; khối rỗng: h2 "No Articles Yet", 1 câu gợi ý, nút primary "Explore Equipment" tới `routes.all_products_collection_url`, link "Back to homepage". Given trang tag không còn bài Then giữ nav, h2 "No Articles On This Topic", nút primary "View All Articles" tới `blog.url`. Given setting "Feature the newest article" tắt, hoặc trang ≥ 2 Then không có bài nổi bật.
- AC5 (0.5, TE-6 AC6, `blog.md` §5) Given số bài > "Articles per page" (6–24, bước 3, mặc định 9) When render Then phân trang theo TE-6 AC6 (snippet chung), link trang mang neo `#blog-grid`; 1 trang Then không render phân trang.
- AC6 (0.5, `blog.md` §7) Given trang blog When đo Lighthouse desktop và mobile Then đạt NFR-1 (SEO 100); có bài nổi bật Then ảnh bài nổi bật là ảnh duy nhất `loading="eager"` + `fetchpriority="high"`; trang tag, trang ≥ 2 hoặc tắt bài nổi bật Then ảnh card đầu eager + high; mọi ảnh khác lazy, có width/height; 0 file JS riêng của trang; ảnh và tiêu đề của phần tử LCP không có hiệu ứng hiện dần. `<title>` gồm `{blog.title}`, trang tag thêm "Tagged {tag}", trang ≥ 2 thêm "Page N".
- AC7 (0.5, `blog.md` §6) Given trình đọc màn hình When duyệt blog Then đúng 1 h1, bài nổi bật và card là h2 (snippet card nhận `heading_tag: 'h2'`); ngày trong `<time datetime>`; vùng chạm link chủ đề 44px dưới 80rem, 40px từ 80rem; chữ trên ảnh card ≥ 4.5:1 với ảnh nền trắng.
- AC8 (0.5, `blog.md` §2, §10 #2) Given block blog posts trang chủ (TE-16) When render sau thay đổi snippet card Then card trang chủ không đổi: không ngày, không excerpt, tiêu đề h3, đúng AC-H26, AC-H27.

Trang bài viết (`templates/article.liquid` → 3 `container`: `article-main`, `article-comments`, `related-articles`):

- AC9 (0.5, sổ 10/11 A1; `article.md` §1, §3) Given bài có ảnh, setting "Show cover image" bật When render Then ảnh bìa là thẻ bo 16 dưới header, không chữ và không lớp tối đè lên ảnh; khung 320 × 240 ở 360, 728 × 410 ở 768, 1240 × 570 ở 1280, 1416 × 651 ở 1920; ảnh `loading="eager"` + `fetchpriority="high"`, alt = alt ảnh trong Shopify. Given bài không ảnh hoặc setting tắt Then không khung ảnh, cột đọc bắt đầu ngay dưới header, không ảnh nào eager.
- AC10 (0.5, `article.md` §1.3, §4; sổ 11/11 (5)) Given bài viết When render Then cột đọc rộng tối đa 46rem (736px từ 1280) gồm: breadcrumb `Home / {blog.title} / {article.title}`; tag đầu là link tới trang tag (vùng chạm 44px); h1 tiêu đề; meta: ngày (`Show date`) · "By {article.author}" (`Show author`) · thời gian đọc (`Show reading time`, ẩn khi content rỗng); `article.content` trong `.rte` chung; cuối bài "Topics" + mọi tag dạng link (`Show topics`, bài không tag thì ẩn) và link "Back to {blog.title}" cao 44px.
- AC11 (0.5, `article.md` §1.4; TE-6 AC6, PG1) Given `blog.comments_enabled?` sai When render Then không có khu bình luận. Given bật When render Then h2 "{n} Comments" (0 bình luận: h2 "Comments" + câu chưa có bình luận); danh sách `<ol>` mỗi mục tên, ngày `<time>`, nội dung; > 10 bình luận Then phân trang 10 mục/trang theo TE-6 AC6, `<nav>` tên "Comment pages", link mang neo `#comments`.
- AC12 (0.5, sổ 10/11 A3, sổ 11/11 audit B #24; `article.md` §5) Given form bình luận (Name*, Email* gợi ý "Not published.", Comment*, nút "Post Comment") When gửi Then: thiếu hoặc sai trường → hộp tóm tắt `role="alert"` "Check {n} fields" nhận focus, câu lỗi dưới từng trường (`aria-invalid`, `aria-describedby`), giữ chữ đã nhập; thành công và `blog.moderated?` → hộp `role="status"` "Thanks, your comment is in review" nhận focus, ô nhập rỗng; thành công, blog không duyệt → hộp "Your comment is posted." và bình luận mới ở cuối danh sách. Blog có duyệt Then trên form có câu "Comments are reviewed before they appear.". Không JS Then form gửi và trang tải lại về `#comments` với cùng kết quả. Mọi trường có `<label for>`, `autocomplete` name/email.
- AC13 (0.5, sổ 09/11 hàng ngang, HD3; `article.md` §1.5, §3) Given blog có ≥ 2 bài When render bài viết Then khối bài liên quan: eyebrow (setting, rỗng thì ẩn), h2 (setting, rỗng dùng chuỗi locale), tối đa N card (setting "Articles to show" 2–8, mặc định 4), không gồm bài đang xem; chọn bài cùng tag đầu, thiếu thì bù bài mới nhất. 360: vuốt, thấy mép card kế, không chevron; 768: chevron 52px ở đầu khối + thanh tiến trình; hàng vừa khung Then lưới tĩnh, không chevron, không thanh tiến trình. Blog chỉ có 1 bài Then không render khối. Tiêu đề card hiện đủ, card là h3.
- AC14 (0.5, `article.md` §7; R11) Given bài viết When kiểm HTML Then `<title>` "{article.title}", meta description = `excerpt_or_content` bỏ HTML, tối đa 160 ký tự; đúng 1 khối JSON-LD `BlogPosting` (headline, image, datePublished, author) và đúng 1 khối `BreadcrumbList` (TE-22 AC12); Rich Results Test 0 lỗi. Given đo Lighthouse Then đạt NFR-1 (SEO 100); có ảnh bìa Then ảnh bìa là LCP; không ảnh bìa Then LCP là h1.
- AC15 (0.5, ES1-T308 #1, ES1-T422 #1) Given theme mới cài When mở blog và bài viết Then eyebrow blog, eyebrow và heading bài liên quan rỗng: không eyebrow, h2 bài liên quan dùng chuỗi locale; không chuỗi chứa tên thương hiệu cứng. Given store dev đã cấu hình When mở `/blogs/{blog demo}` và 1 bài Then eyebrow "From the Efitco blog", heading "More Training Tips" hiển thị đúng.

Settings (0.5):

| Block | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| blog-articles | Eyebrow | text | rỗng | rỗng thì ẩn; store dev "From the Efitco blog" | `blog.md` §2; ES1-T308 #1 |
| blog-articles | Show topic filter | checkbox | true | blog không tag thì tự ẩn | `blog.md` §2 |
| blog-articles | Feature the newest article | checkbox | true | chỉ trang 1, không lọc tag | `blog.md` §2, B1 |
| blog-articles | Articles per page | range | 9 | 6–24, bước 3 | `blog.md` §2 |
| blog-articles | Show excerpt | checkbox | true | chỉ bài nổi bật; card trang blog luôn có excerpt (sổ 11/11 (4)) | `blog.md` §1.6, §2 |
| blog-articles | Show date | checkbox | true | | `blog.md` §2, B2 |
| blog-articles | Show reading time | checkbox | true | content rỗng thì ẩn | `blog.md` §2 |
| article-main | Show cover image | checkbox | true | tắt thì LCP là h1 | `article.md` §2 |
| article-main | Show author | checkbox | true | | `article.md` §2 |
| article-main | Show date | checkbox | true | | `article.md` §2 |
| article-main | Show reading time | checkbox | true | content rỗng thì ẩn | `article.md` §2 |
| article-main | Show topics | checkbox | true | bài không tag thì ẩn | `article.md` §2 |
| related-articles | Eyebrow | text | rỗng | rỗng thì ẩn; store dev "From the Efitco blog" | `article.md` §2; ES1-T422 #1 |
| related-articles | Heading | text | rỗng | rỗng dùng chuỗi locale; store dev "More Training Tips" | như trên |
| related-articles | Articles to show | range | 4 | 2–8 | `article.md` §2 |

`article-comments` không có setting: bật/tắt, duyệt bình luận ở admin Shopify. Snippet `article-card` thêm 2 tham số (không phải setting): `heading_tag` (mặc định h3), `show_date` (mặc định false).

Mã R: R7.7 blog/article (title, image, excerpt_or_content, published_at, comments paginate); R8 RTE nhất quán (AC10); R11 SEO, rich snippets (AC6, AC14); R12 (AC3, AC7, AC12, AC13); R17 (AC6, AC9); R6.1, R6.2 (AC6, AC14)

---

### TE-21 — Trang phụ: page, contact, 404, password, gift card (0.5, mới; thay TE-9 AC2)
Phía: FE (TE-21-R2-FE1 ES1-T383, TE-21-R2-FE2 ES1-T384; phần tuân thủ TS-FE7 ES1-T407, TS-FE8 ES1-T408) + BE (TS-BE1 ES1-T410: QR, copy, print gift card) + QA1 (TE-21-R2-QA1, ES1-T386) · Ước lượng: techlead · Ưu tiên: Must, cuối Sprint 4 · Nguồn: `page.md`, `404.md`, `password.md`, `gift-card.md`, sổ 10/11 PG1–PG2 (page), E1, PW1–PW2, GC1; audit shopify-audit-1111 B #6, #32

Là khách, tôi muốn trang nội dung đọc được trên mọi màn, gửi được câu hỏi qua form liên hệ, đi tiếp được khi vào link hỏng, để lại email khi store đang khoá và dùng được gift card đã nhận.

Page và contact:

- AC1 (0.5, `page.md` §2, §4; PG2 10/11) Given page dùng template mặc định When render Then breadcrumb `Home / {page.title}` (TE-22 AC9), đúng 1 h1, `page.content` trong `.rte` chung; cột đọc rộng 720px căn giữa từ 768, đoạn văn ≤ 65ch, cỡ chữ 16 lh 1.7. Given `page.content` rỗng Then chỉ có h1, không khung `.rte` rỗng; trong theme editor có câu gợi ý cho merchant, storefront không có câu đó.
- AC2 (0.5, sổ 11/11 (5); `page.md` §5) Given nội dung page có bảng rộng, ảnh, link trong đoạn When xem ở 360 và zoom 200% Then trang không cuộn ngang (bảng cuộn ngang trong khung riêng); link trong đoạn có gạch chân; ảnh trong nội dung `loading="lazy"`.
- AC3 (0.5, PG1 10/11; audit B #6; `page.md` §1, §2, §4) Given page gán template `page.contact` When render Then thứ tự DOM: breadcrumb, h1, intro (`page.content` trong `.rte`), form, aside. Form: h2 + câu "* Required fields"; đúng 3 trường Name*, Email*, Message* (Message có gợi ý số đơn hàng), không phone, không subject; câu quyền riêng tư có link privacy policy (khi setting "Show privacy note" bật và shop có privacy policy); nút primary "Send Message". Aside (khi ≥ 1 `faq-item` có câu hỏi): eyebrow, h2, accordion `<details>` câu đầu mở sẵn, cho mở nhiều câu, link "Shipping policy", "Refund policy" từ `shop.policies` (TE-9 AC5). Bố cục: 1 cột ở 360 và 768 (Name, Email 2 cột từ 768); từ 1280 lưới 12 cột, form cột 1–7, aside cột 9–12 dính cách đỉnh 104px.
- AC4 (0.5, `page.md` §6 S2) Given form liên hệ When rời một trường sai hoặc bấm gửi Then trường sai có viền 2px màu lỗi, icon và câu sửa ("Enter your name.", "Enter an email like name@example.com.", "Enter a message."), `aria-invalid="true"`, `aria-describedby` trỏ câu lỗi. Bấm gửi khi có lỗi Then hộp tóm tắt `role="alert"` "Check {n} fields" có link tới từng trường, nhận focus. Không JS Then form gửi được, lỗi do Shopify trả hiện cùng vị trí.
- AC5 (0.5, `page.md` §6 S3–S6) Given gửi form hợp lệ When Shopify nhận Then hộp thành công "Thanks for contacting us" thay form, nhận focus, có nút secondary "Continue Shopping". Given Shopify trả lỗi chung Then `.alert` "Your message wasn't sent" + cách xử lý, giữ dữ liệu đã nhập. Có JS, đang gửi Then nút `aria-busy`, giữ bề rộng, trường `readonly`.
- AC6 (0.5, `page.md` §7, §9) Given page và contact When đo Lighthouse Then đạt NFR-1 kể cả SEO 100; mọi trường có `<label for>`, `autocomplete` name/email, `type="email"`; vùng chạm input và nút 48px dưới 64rem, 52px từ 64rem; summary accordion cao ≥ 56px; không JS bắt buộc trên 2 template.

404:

- AC7 (0.5, E1 10/11; audit B #32; `404.md` §2, §4) Given URL không tồn tại When mở Then Shopify trả HTTP 404; trang không có breadcrumb, không popup tự mở (TE-18 AC4); khối chính: eyebrow "Error 404", h1 (setting Heading, rỗng dùng chuỗi locale), câu mô tả (setting Text, rỗng dùng chuỗi locale), form tìm kiếm `role="search"` GET tới `routes.search_url` (label "Search the store", nút kính lúp tên "Search"), nút primary "Back To Homepage" tới `routes.root_url`; ô tìm không tự nhận focus. Ở 360 × 640 thấy không cuộn: eyebrow, h1, câu mô tả, ô tìm, nút về trang chủ. Gõ ≥ 2 ký tự vào ô Then gợi ý predictive như TE-8 AC1.
- AC8 (0.5, `404.md` §3, §5) Given setting "Category menu" (link_list) trống When render Then không có hàng link danh mục. Given đã chọn menu Then tối đa 6 link dạng tab cao 44px trong `<ul>` có nhãn; link tới collection kèm số sản phẩm. Given block `featured-collection` của 404 chưa chọn collection Then không có section sản phẩm, khối chính giữ đủ. Given đã chọn Then eyebrow, h2, link "View All Products" tới `routes.all_products_collection_url`, lưới N card (4–8, mặc định 4) theo TE-3; ảnh card lazy; LCP là h1.

Password:

- AC9 (0.5, PW2 10/11; `password.md` §1, §2) Given store bật mật khẩu storefront When khách mở bất kỳ URL Then layout password: nền `--color-background-dark` + noise toàn trang, không header, footer, announcement bar (TE-1 AC4); thanh trên cao 80px có logo (`settings.logo`, alt = `shop.name`, không là link) hoặc `shop.name` dạng chữ khi chưa có logo; eyebrow (setting, rỗng thì ẩn); h1 (setting Heading inline richtext, phần `<em>` màu accent, rỗng dùng chuỗi locale); `shop.password_message` (rỗng thì bỏ đoạn); chân trang có "Are you the store owner? Log in here" và "Powered by Shopify". Đúng 1 h1.
- AC10 (0.5, PW1 10/11; `password.md` §2, §5) Given setting "Show newsletter" bật When render Then form email (label "Email" hiển thị, nút "Notify Me", ghi chú "No spam. Unsubscribe anytime.") là hành động đầu; dưới là dải "Have a password?" và `<details>` "Enter Using Password" đóng sẵn chứa ô mật khẩu (label thật, `autocomplete="current-password"`) và nút "Enter Store". Given gửi email hợp lệ Then hộp `role="status"` "You're on the list" thay form, khách hàng được tạo trong admin có tag `newsletter`, `password-page`; email đã đăng ký Then cùng hộp thành công; email sai Then câu lỗi chữ trắng + icon dưới ô. Given setting tắt Then không form email, không dải "Have a password?", form mật khẩu mở sẵn. Không JS Then cả 2 form gửi được.
- AC11 (0.5, `password.md` §5) Given nhập sai mật khẩu When gửi Then trang tải lại với `<details>` mở sẵn, ô viền 2px màu lỗi, câu "That password is incorrect. Check the spelling and try again." chữ trắng + icon, focus vào ô. Nhập đúng Then vào storefront. Có JS Then nút mắt 44px "Show password" (`aria-pressed`) đổi sang "Hide password" và hiện chữ mật khẩu; không JS Then không có nút mắt.
- AC12 (0.5, `password.md` §4, §8) Given setting Image đã chọn When render Then ảnh là thẻ bo 16 dưới thanh 80px, `alt=""`; từ 64rem ảnh eager + `fetchpriority="high"`; dưới 64rem ảnh nằm sau nội dung, eager, không `fetchpriority`. Given chưa chọn ảnh Then từ 64rem là thẻ nền trắng 6% trên nền tối, dưới 48rem không có thẻ. Chữ phụ trên nền tối dùng `--color-muted-on-dark` (6.11:1), focus là outline trắng 2px.

Gift card (`templates/gift_card.liquid`, `{% layout none %}`):

- AC13 (0.5, GC1 10/11; R7.9; `gift-card.md` §1, §2) Given gift card còn hiệu lực When mở link gift card Then `<head>` có `meta viewport`, `meta robots noindex`; thanh trên 80px có logo (hoặc `shop.name` chữ) là link về shop, vùng chạm 44px; h1; thẻ dựng bằng CSS (không ảnh): số dư `gift_card.balance | money`, khi số dư < giá trị ban đầu thì thêm "of {giá trị ban đầu} initial value"; mã `gift_card.code | format_code`; QR ≥ 120 × 120px (thiết kế 144) có tên truy cập "QR code, scan to redeem gift card"; dòng Expires khi có hạn; nút Apple Wallet là asset Shopify `gift-card/add-to-apple-wallet.svg`, cao ≥ 44px, chỉ khi có `gift_card.pass_url`, không đổi màu; nút primary "Start Shopping" tới shop. Không announcement bar, không header, không footer theme.
- AC14 (0.5, `gift-card.md` §5) Given `gift_card.expired` hoặc `gift_card.enabled` = false When mở Then thẻ chuyển xám, số dư gạch, pill "Expired"; `.alert` có câu riêng cho hết hạn (kèm ngày hết hạn) và câu riêng cho bị tắt ("This gift card is no longer active"); không QR, không Apple Wallet, không Copy Code; có nút secondary "Contact Us"; mã vẫn hiện. Trạng thái báo bằng chữ + icon, không chỉ bằng màu xám.
- AC15 (0.5, GC1; `gift-card.md` §5) Given có JS When bấm "Copy Code" Then mã vào clipboard, nhãn nút đổi "Copied" + icon trong 2 s rồi về lại, `role="status"` đọc "Gift card code copied". Bấm "Print Gift Card" Then mở hộp in; bản in nền trắng, chữ đen, không nút, giữ mã và QR. Given không JS hoặc script QR tải lỗi Then không nút Copy, Print; khung QR 144px giữ chữ "Enter the code at checkout"; 0 lỗi console.

Chung:

- AC16 (0.5, NFR-1, sổ 10/11 phạm vi SEO) Given 404, password, gift card When đo Lighthouse Then Accessibility 100, Best Practices 100, Performance theo NFR-1; không tính SEO; vẫn có `<title>` và meta description qua `meta-tags`. LCP: 404 là h1; password từ 64rem là ảnh (nếu có), dưới 64rem là h1; gift card là số dư hoặc h1, không ảnh lớn.
- AC17 (0.5, ES1-T308 #1, ES1-T422 #1) Given theme mới cài When mở contact, 404, password Then: heading form liên hệ, heading và câu mô tả 404, heading password dùng chuỗi locale; eyebrow password rỗng (ẩn); `faq-item` của contact không có câu hỏi (không aside); "Category menu" và collection của 404 trống (không hàng link, không section sản phẩm); ảnh password trống; không handle `figma-*` trong 5 template. Given store dev đã cấu hình When mở lại Then: contact có heading "Send Us A Message" và 5 câu FAQ; 404 có 5 link `figma-cat-*` kèm số sản phẩm và lưới 4 sản phẩm; password có eyebrow "Opening Soon", heading "Level Up Your Fitness" (phần "Your Fitness" màu accent) và ảnh.

Settings (0.5):

| Block | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| contact-form | Heading | text | rỗng | rỗng dùng chuỗi locale; store dev "Send Us A Message" | `page.md` §3; ES1-T422 #1 |
| contact-form | Show privacy note | checkbox | true | shop không có privacy policy thì ẩn câu | `page.md` §3; TE-9 AC5 |
| faq-item (đã có, dùng trong aside contact) | Question, Answer | text, richtext | rỗng (TS-FE4 ES1-T406) | 0 câu hỏi thì không aside | `page.md` §3 |
| not-found | Heading | text | rỗng | rỗng dùng chuỗi locale | `404.md` §3 |
| not-found | Text | textarea | rỗng | rỗng dùng chuỗi locale; gợi ý ≤ 160 ký tự | `404.md` §3; ES1-T422 #1 |
| not-found | Show search | checkbox | true | | `404.md` §3 |
| not-found | Category menu | link_list | trống | tối đa 6 link; trống thì ẩn | `404.md` §3 |
| featured-collection (404) | Collection | collection | trống | trống thì không section | `404.md` §3, E1 |
| featured-collection (404) | Products to show | range | 4 | 4–8 | `404.md` §3 |
| password-hero | Eyebrow | text | rỗng | rỗng thì ẩn; store dev "Opening Soon" | `password.md` §3; ES1-T422 #1 |
| password-hero | Heading | inline_richtext | rỗng | `<em>` màu accent; rỗng dùng chuỗi locale; store dev "Level Up <em>Your Fitness</em>" | `password.md` §3 |
| password-hero | Image | image_picker | trống | ảnh ngang ≥ 1440px | `password.md` §3 |
| password-hero | Show newsletter | checkbox | true | tắt thì form mật khẩu mở sẵn | `password.md` §3, PW1 |

Page mặc định và gift card không có setting mới (gift card dùng `settings.logo`). Không thêm setting màu: nền password dùng `background_dark_color` có sẵn.

Mã R: R7.6 page + contact (AC1–AC6); R7.9 404, password, gift card QR ≥ 120 + Apple Wallet (AC7–AC15); R4.4 gift card template (AC13–AC15); R4.9 newsletter (AC10); R8 RTE nhất quán (AC2); R12 (AC3–AC6, AC9–AC11, AC13–AC15); R6.1, R6.2, R11 (AC6, AC16); R17 (AC8, AC12)

---

### TE-22 — Điều hướng mở rộng: menu 3 cấp, mega menu, breadcrumb (0.5, mới; tách từ TE-1 AC2 phần từ 80rem)
Phía: FE (TE-22-R2-FE1 ES1-T326 breadcrumb + tiêu đề trang + banner; TE-22-R2-FE2 ES1-T327 mega từ 80rem; TE-22-R2-FE3 ES1-T328 ảnh danh mục + sản phẩm nổi bật, Should) + BE1 (TE-22-R2-BE1, ES1-T329) + QA1 (TE-22-R2-QA1, ES1-T330) · Ước lượng: techlead · Ưu tiên: Must; AC5 Should · Nguồn: `navigation.md` (N1–N3 10/11), `foundation.md` §3.3, §5, §14; ES1-T310 #3

Là khách, tôi muốn mở một lần là thấy toàn bộ danh mục 3 cấp của store và luôn biết mình đang ở đâu trong cây trang, để đi thẳng tới collection hoặc quay lại cấp trên trong 1 thao tác.

Mega menu (từ 80rem) và cấp 3 trong drawer:

- AC1 (0.5, thay phần từ 80rem của TE-1 AC2; `navigation.md` §6) Given main-menu có mục cha có con When từ 80rem rê chuột lên mục cha 150 ms, hoặc bấm, Enter, Space trên trigger Then panel mở ngay dưới header (đỉnh panel = đáy header 80px), header giữ nền tối và chiều cao 80px; mục đang mở trắng 100% + chevron xoay 180°, `aria-expanded="true"`; scrim 50% phủ trang từ đáy header. Rê sang mục cha khác Then nội dung đổi, không chạy lại hiệu ứng mở; rê sang mục không có con Then panel đóng. Đóng bằng: rời header và panel 150 ms, Esc (focus về trigger), bấm scrim, bấm lại trigger, Tab ra khỏi panel; panel không bẫy focus. Màn cảm ứng từ 80rem Then chạm để mở/đóng. Không JS Then bấm trigger mở, bấm lại đóng.
- AC2 (0.5, N3 10/11; `navigation.md` §3) Given dữ liệu mục cha When mở panel từ 80rem Then kiểu panel chọn theo dữ liệu, không có setting từng mục: (A) có ≥ 1 con có cấp 3 → cột link: mỗi cột có tiêu đề (link cấp 2) và danh sách link cấp 3, link "View all …" đứng đầu cột 1, con không có cấp 3 đặt ngay sau "View all …" trong cột 1, tối đa 3 cột khi có card sản phẩm và 4 cột khi không có, cột thứ 5 trở đi xuống hàng; (B) mọi con là collection, không cấp 3, setting "Show collection images in menu" bật → tiêu đề panel, link "View all collections", ô collection (ảnh, tên, số sản phẩm) 5 ô mỗi hàng, 6–10 ô xuống hàng 2; (C) còn lại → dropdown nhỏ. Panel cao tối đa `100dvh − 80px`, nội dung dài hơn thì panel cuộn riêng. Theme không cắt bớt link.
- AC3 (0.5, sổ 09/11 SEO; `navigation.md` §3) Given panel hoặc cấp 2 drawer có link "View all …" When render Then nhãn theo loại link cha: catalog → "View all products"; danh sách collections → "View all collections"; collection và loại khác → "View all {tên mục}"; không có link nào chỉ ghi "View all".
- AC4 (0.5, N1 10/11; `navigation.md` §2, §5.3; cơ chế trượt + Back giữ ở TE-1 AC2) Given dưới 80rem, menu có cấp 3 When mở cấp 2 trong drawer Then cấp 2 có: tiêu đề cấp 2, hàng "View all …" cao 52px, mỗi con có cấp 3 là 1 nhóm (tiêu đề nhóm là link cao 44px, link cấp 3 cao 48px); kiểu B Then hàng collection cao 72px có ảnh 56px; card sản phẩm nổi bật (AC5) ở cuối cấp 2 tương ứng. Không JS Then accordion `<details>` tại chỗ hiện đủ link cấp 2 và cấp 3.
- AC5 (0.5, Should, N2 10/11, TE-22-R2-FE3) Given setting "Featured product in menu" đã chọn sản phẩm When mở panel kiểu A đầu tiên (từ 80rem) hoặc cấp 2 tương ứng trong drawer Then có 1 card: ảnh, badge giảm khi compare_at_price > price, eyebrow "Featured", tên hiện đủ, giá; sản phẩm hết hàng Then badge "Sold out", ảnh mờ 60%, giá giữ. Setting trống Then không card, cột giãn đủ bề rộng. Given "Show collection images in menu" tắt Then panel kiểu B thành kiểu C (từ 80rem) và hàng collection trong drawer không ảnh. Collection không ảnh Then ô nền cream + icon ảnh, không ẩn mục; collection 0 sản phẩm Then hiện "0 Products".
- AC6 (0.5, sổ 09/11 ảnh menu tải khi mở; `navigation.md` §9) Given trang bất kỳ When tải Then panel và drawer đóng; mọi ảnh trong menu `loading="lazy"`, có width/height, không tải trước khi panel hoặc cấp 2 mở, không ảnh nào eager; mọi link menu (cả cấp 3) là `<a href>` có trong HTML khi đóng; phần tử LCP của trang không thuộc menu; CLS do mở menu = 0.
- AC7 (0.5, `navigation.md` §8) Given bàn phím và trình đọc màn hình When duyệt menu Then `<nav aria-label="Main menu">` (desktop) và `<nav aria-label="Mobile menu">` (drawer) có tên khác nhau; tiêu đề cột và tiêu đề nhóm không dùng thẻ `<h*>`, danh sách link là `<ul>` có `aria-labelledby` trỏ tiêu đề; thứ tự Tab: trigger → link trong panel theo cột trái sang phải, trên xuống → card → mục cha kế tiếp; panel đóng thì link bên trong không nhận focus; trang hiện tại có `aria-current="page"` + gạch chân 2px; focus trên thanh tối là outline trắng 2px; vùng chạm mục menu 44px, link trong panel ≥ 40px; `prefers-reduced-motion: reduce` Then không translate, không scale.
- AC8 (0.5, `navigation.md` §7) Given menu main-menu trống When trong theme editor Then thanh header có chữ placeholder hướng dẫn. Given storefront Then không có menu, không có nút menu; logo bên trái, icon bên phải.

Breadcrumb và tiêu đề trang:

- AC9 (0.5, `foundation.md` §5; TE-1 AC7 SEO) Given trang collection, sản phẩm, blog, trang tag blog, bài viết, page When render Then dưới header có `<nav aria-label="Breadcrumb"><ol>`: collection `Home / Collections / {collection}`; sản phẩm mở trong collection `Home / {collection} / {product}`, sản phẩm mở qua `/products/` `Home / {product}` (ES1-T422 #4); blog `Home / {blog}`; trang tag `Home / {blog} / {tag}`; bài viết `Home / {blog} / {article}`; page `Home / {page}`. Mục cuối là `<span aria-current="page">`, không là link; các mục khác là link có URL dựng từ `routes.*` và URL của đối tượng; link cao 44px; chữ 14px, link `--color-muted` (8.45:1). Given trang chủ, cart, search, list-collections, 404, password, gift card Then không có breadcrumb.
- AC10 (0.5, `foundation.md` §5; ES1-T422 #2) Given mục cuối dài hơn 22 ký tự (dưới 48rem) hoặc 48 ký tự (từ 48rem) When render Then mục cuối cắt "…"; h1 của trang hiện đủ tên; JSON-LD (AC12) mang tên đầy đủ.
- AC11 (0.5, `foundation.md` §3.3; TE-22-R2-FE1) Given collection có ảnh banner When render Then banner là thẻ bo 16 dưới header (cách 16px, 24px từ 64rem), cao tối thiểu 280px (360px từ 64rem); breadcrumb, eyebrow, h1 chữ trắng ở đáy trái trên lớp tối gradient 75% ở đáy → 60% từ giữa lên; chữ trắng đạt ≥ 4.5:1 cả khi ảnh trắng; ảnh banner eager + `fetchpriority="high"`. Bài viết không áp lớp này (TE-20 AC9).
- AC12 (0.5, R11; `foundation.md` §5) Given trang có breadcrumb When kiểm HTML Then có đúng 1 khối JSON-LD `BreadcrumbList`, số mục, thứ tự, tên và URL khớp breadcrumb hiển thị (mục cuối có tên đầy đủ); Rich Results Test 0 lỗi; trang không có breadcrumb Then không có `BreadcrumbList`.
- AC13 (0.5, `foundation.md` §5) Given trang có tiêu đề (collection, blog, page, article) When render Then thứ tự eyebrow (nếu có) → h1 → meta; đúng 1 h1 mỗi trang.
- AC14 (0.5, ES1-T308 #1) Given theme mới cài When kiểm header Then setting "Featured product in menu" trống, không handle `figma-*` trong code header, menu mặc định là link_list `main-menu`. Given store dev đã cấu hình menu 3 cấp (ES1-T298: Shop > Categories, Training Level, Featured; Collection > 5 collection `figma-cat-*` có ảnh) và sản phẩm nổi bật When mở Shop và Collection từ 80rem Then Shop là kiểu A có card, Collection là kiểu B có 5 ô ảnh.

Settings (0.5):

| Block | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| header | `menu_collection_images` "Show collection images in menu" | checkbox | true | tắt: B thành C, drawer không ảnh | N2 10/11; `navigation.md` §4 |
| header | `menu_featured_product` "Featured product in menu" | product | trống | trống thì không card; store dev chọn sản phẩm demo | N2 10/11; `navigation.md` §4; ES1-T308 #1 |

Không đổi setting header hiện có (`logo`, `logo_width`, `menu`, `customer_account_menu`, `sticky_header`). Breadcrumb không có setting. Chữ cố định qua locale `blocks.header.*` (`navigation.md` §4).

Mã R: R4.8 menu đa cấp (AC1–AC4); R11 rich snippets (AC12); R12 (AC1, AC7, AC9, AC11); R14 link_list default (AC14); R17 (AC6); R6.1 (AC6, AC11)

---

## Sửa AC cũ do tách story (0.5)

- TE-1 AC2: bỏ câu "Given menu main-menu có 2 cấp When mở header từ 80rem Then cấp 2 mở bằng hover và keyboard…", thay bằng "từ 80rem: theo TE-22 AC1–AC3". Giữ nguyên phần dưới 80rem (drawer trượt cấp 2, Back, không JS accordion). Mã R TE-1: R4.8 ghi "(drawer; mega xem TE-22)".
- TE-1 AC7: giữ nguyên (html lang, meta-tags). Structured data breadcrumb ở TE-22 AC12.
- TE-9 AC2: thay bằng "Trang 404, password, page, contact, gift card: theo TE-21". TE-9 AC3: thay bằng "Blog và bài viết: theo TE-20". TE-9 giữ AC1, AC4–AC7. Mã R TE-9 bỏ R4.4 (phần template gift card), R7.6, R7.7, R7.9 (chuyển TE-20, TE-21); form người nhận gift card vẫn ở TE-4 AC6.
- TE-6 AC6: câu "bình luận bài viết" giữ; TE-20 AC5, AC11 trỏ về.
- Mục 3 "Quyết định đã chốt" thêm dòng: "Chốt CTO 11/11 (ES1-T307, ES1-T308, ES1-T309 #1, ES1-T311) đưa vào 0.5: story TE-19 upsell giỏ hàng, TE-20 blog và bài viết, TE-21 trang phụ, TE-22 điều hướng mở rộng; ĐỀ XUẤT trong ui-spec là phạm vi; nội dung mẫu trống."

## Definition of Ready

| Story | AC GWT đủ | ui-spec + sổ | Dữ liệu store dev | Câu hỏi mở | Task R2 | Ready |
| --- | --- | --- | --- | --- | --- | --- |
| TE-19 | 9 AC | cart.md §3.8, G2 | giỏ có sản phẩm có complementary (Search & Discovery) — ES1-T298 | ES1-T422 #1, #3 (mặc định có) | FE1, BE1, QA1 (AC1–AC8); AC9 chưa có task | Có, AC9 sau R1 |
| TE-20 | 15 AC | blog.md, article.md, B1–B3, A1–A3, 11/11 (3)(4)(5) | blog ≥ 10 bài có tag, tác giả, excerpt, bài không ảnh; bài > 10 bình luận; blog có duyệt — ES1-T298 #4 (T267) | ES1-T422 #1 | FE1, FE2, QA1, TS-FE5, TS-FE7 | Có, chờ dữ liệu cho QA |
| TE-21 | 17 AC | page.md, 404.md, password.md, gift-card.md | page contact, privacy/shipping/refund policy, mật khẩu storefront, gift card đã phát hành, hết hạn, bị tắt — ES1-T298 #4 (T268) | ES1-T422 #1 | FE1, FE2, QA1, TS-FE7, TS-FE8, TS-BE1 | Có, chờ dữ liệu cho QA |
| TE-22 | 14 AC | navigation.md, foundation §3.3, §5, N1–N3 | main-menu 3 cấp, ảnh 5 collection `figma-cat-*` — ES1-T298 #4 (T271) | ES1-T422 #2, #4 | FE1, FE2, FE3 (Should), BE1, QA1 | Có |
