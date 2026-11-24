KHÔNG CHẮC: (1) Dòng loại `store` lấy theo mockup; store dev (`docs/design/demo-data.json`, xuất 09/11) lệch ở bundle, video card 3 và 5, số sản phẩm level, câu trả lời FAQ 2–5, số bài blog (mục 4). Hỏi CTO ES1-T587; im lặng tới 25/11/2026 = dòng lệch che khi so ở AC-H2 tới khi store dev đổi theo mockup. (2) Handle trên store dev còn tiền tố cũ (bảng tên ở `drafts/designer/ES1-T567/notes.md` mục 5); đổi ở ES1-T574. File này gọi resource theo tên, không in handle. (3) Cột "Phần tử" là selector trong mockup HTML, không phải selector của theme; QA map sang `data-testid` của theme ở ES1-T582. (4) Bước 2, 3 của quiz không có trong mockup trang chủ.

# ES1-T571: bảng nội dung trang chủ theo section mockup (thay bảng của ES1-T173)

BA, 23/11/2026. Dùng cho TE-17 AC-H1, AC-H2, AC-H5, TE-9 AC4 (SRS 0.6).
Nguồn: `drafts/designer/ES1-T293/index.html` (mockup trang chủ, nguồn chuẩn từ CTO 21/11, ES1-T567), ảnh chụp `drafts/designer/ES1-T293/index-1280.png`, `index-1920.png`; dưới 80rem `drafts/designer/ES1-T278/`, `ES1-T279/`; `docs/design/demo-data.json`; `docs/design/content.md` §2 (sentence case, chữ HOA do CSS).

Khoá khối: giá trị `data-testid` của section trong mockup. Header và footer dùng `data-testid="header"`, `data-testid="footer"`.

Loại dòng:
- `copy`: chữ giao diện; theme mới cài không có (setting rỗng hoặc chuỗi locale theo ES1-T308 #1, ES1-T422 #1), store dev đã cấu hình phải khớp (fixture TE-17-R2-QA0, ES1-T331).
- `store`: dữ liệu Shopify (tên, giá sản phẩm, collection, bài viết, menu).
- `động`: tính từ dữ liệu thật (số tiền, phần trăm, số đếm, đồng hồ); che khi so ở AC-H2.
- `ảnh`: ảnh, video; chỉ trên store dev.

Cờ ở cột Ghi chú:
- `TT`: mockup để chữ nguồn sentence case, CSS hiện HOA (`text-transform`). So sau `text-transform` (AC-H2).
- `Q3`: giữ nguyên văn copy demo kể cả lỗi (Q3 ES1-T168).
- `E<n>`: ngoại lệ đã ký (ES1-T167 mục 2.4, ES1-T168 Q6).

## 1. Thứ tự 16 khối (AC-H1)

| Hàng | Khối | `data-testid` | Story |
| --- | --- | --- | --- |
| 1 | Header | `header` | TE-1 |
| 2 | Hero slideshow | `container-home-hero` | TE-2 |
| 3 | Browse categories | `container-home-collection-list` | TE-15 |
| 4a, 4b | Intro + shop by level | `container-home-intro` | TE-2 (rich text), TE-15 |
| 5 | Bestsellers | `container-home-featured-collection` | TE-3 |
| 6 | Quiz | `container-home-quiz` | TE-11 |
| 7 | Shop the look | `container-home-shop-the-look` | TE-12 |
| 8 | Make fitness | `container-home-inspiration` | TE-7 |
| 9 | Bundle builder | `container-home-bundle-builder` | TE-12 |
| 10 | Featured product | `container-home-featured-product` | TE-13 |
| 11 | Video demo | `container-home-video-carousel` | TE-13 |
| 12 | Testimonials | `container-home-testimonials` | TE-7 |
| 13 | Why choose | `container-home-why-choose` | TE-7 |
| 14 | Blog posts | `container-home-blog-posts` | TE-16 |
| 15 | FAQ + số liệu | `container-home-faq` | TE-7 |
| 16 | Newsletter, footer, trust | `footer` | TE-1 |

16 dòng trong bảng = header + 14 section `container-home-*` + footer (hàng 4a, 4b chung 1 section). Mục "Desktop states" cuối mockup là trạng thái mẫu, không thuộc trang.

## 2. Bảng nội dung theo khối (AC-H2)

### Hàng 1: `header`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.site-header__menu` mục 1–7 | store | Shop · Collection · Sale · Our story · Blog · Contact · Help | Menu `main-menu`; Shop, Collection có cấp 2 (TE-22 AC14) |
| `.site-header__logo` | ảnh | Logo Efitco | Chọn trong editor; trống thì `shop.name` (TE-1 AC13) |
| Icon cart, tên truy cập | động | Cart, 2 items | Số theo giỏ |

### Hàng 2: `container-home-hero`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.hero__eyebrow` | copy | Trusted by 10,000+ athletes | TT; AC-H5 |
| `h1.display` | copy | Level up⏎your fitness | TT; xuống dòng cố định |
| `.hero__sub` | copy | Upgrade your journey with Efitco gear made for every workout. | |
| `.button` | copy | Explore equipment | Có icon mũi tên |
| `.hero__img` | ảnh | Ảnh slide (alt "Athlete lifting a chrome dumbbell") | Slide 2 cùng chữ, khác ảnh |

### Hàng 3: `container-home-collection-list`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `h2#cat-h` | copy | Browse categories | |
| `.collection-card__title` 1–5 | store | Free Weights · Functional Training · Benches & Racks · Recovery & Mobility · Accessories | Tên collection, giữ hoa theo dữ liệu |
| `.collection-card__media img` 1–5 | ảnh | Ảnh 5 collection (3/2) | Ảnh collection trên store |

### Hàng 4a: `container-home-intro` (rich text)

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `h2#intro-h` | copy | Everything you⏎need [ảnh] to train. | TT; ảnh inline giữa câu; so bỏ khoảng trắng thừa |
| `.intro__aside p` | copy | Versatile equipment for home training - strength, mobility, endurance, at every level. | Q3 (dấu "-") |
| `.button--link` | copy | Become a member | Có icon mũi tên |
| `.intro__img` | ảnh | Ảnh inline | |

### Hàng 4b: `container-home-intro` (shop by level)

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.level .eyebrow` | copy | Shop by level | TT |
| `.level h2` | copy | Choose your training level | |
| `.level-card__label` × 3 | copy | Level fitness | TT |
| `.level-card__title` 1–3 | store | Beginner · Intermediate · Advanced | Tên collection |
| `.level-card__foot` 1–3 | động | 24 products · 12 products · 10 products | `products_count`; lệch store dev (mục 4) |
| `.level-card img` 1–3 | ảnh | Ảnh 3 card | |

### Hàng 5: `container-home-featured-collection`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.shead .eyebrow` | copy | Bestsellers | TT |
| `h2#best-h` | copy | What people are buying? | |
| `.tab` 1–4 | store | All · Weight · Portable Fitness · Accessories | Tên collection gắn tab |
| Card 1 | store | Ativafit Lava 66 lb Adjustable · $379.99 · $499.99 | rating 5.0 (metafield) |
| Card 1 badge | động | −24% | U+2212 (TE-3 AC3) |
| Card 2 | store | Iron Core Kettlebell 16 kg · $119.00 | badge New |
| Card 2 badge | copy | New | |
| Card 3 | store | FlexFold Adjustable Bench · $189.99 · $229.00 | rating 5.0 |
| Card 3 badge | động | −17% | |
| Card 4 | store | Revllen Pro Speed Rope · $34.99 · $44.99 | |
| Card 4 badge | động | −22% | |
| Swatch, tên ẩn ", 3 colors" | động | 3 màu mỗi card | Chỉ báo (TE-3 AC2) |
| `.product-card__media img` 1–4 | ảnh | Ảnh 4 sản phẩm | |

### Hàng 6: `container-home-quiz`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.quiz__intro .badge` | copy | Our most-loved feature | AC-H15 |
| `h2#quiz-h` | copy | Find your perfect gear | |
| `.quiz__intro p` | copy | Two questions. One shortlist. | Q3 (lệch "Step 1 of 3", CR-10) |
| `.quiz__notes` 1–2 | copy | 20 seconds · No sign-up required | AC-H15 |
| `.quiz__progress span` | động | Step 1 of 3 | |
| `h3#quiz-q1` | copy | Where do you want to focus? | |
| `.quiz__hint` | copy | Tap the body map or pick from the list. | AC-H17 |
| Lựa chọn 1 | copy | Upper body · Shoulders, arms, chest | tag `quiz-upper` |
| Lựa chọn 2 | copy | Core · Abs, stability, balance | tag `quiz-core` |
| Lựa chọn 3 | copy | Lower body · Legs, glutes, calves | tag `quiz-lower` |
| `.quiz__map`, `.quiz-opt__thumb` 1–3 | ảnh | Body map, 3 ảnh lựa chọn | |
| Bước 2, 3 | copy | không có trong mockup | KHÔNG CHẮC (4) |

### Hàng 7: `container-home-shop-the-look`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.shead .eyebrow` | copy | Shop this setup | TT |
| `h2#stl-h` | copy | A complete corner gym, itemised | Q3 (chính tả Anh Anh) |
| `.section-link` | copy | Browse all setups | |
| `.stl__fits b` | copy | Fits: 2.4×2.0 m | |
| `.stl__fits span` | copy | Folds flat when you're done. | |
| Row 1–4 | store | Ativafit Lava 66 lb $379.99 · FlexFold Bench $189.99 · Compact Power Rack R3 $549.00 · Training Mat 12 mm $69.00 | |
| Panel số món, tạm tính | động | 4 items · $1,187.98 | |
| Panel dòng giảm | động | Setup discount (10%) · −$118.80 | Chỉ khi có bậc + discount thật (AC-H19); U+2212 |
| Panel tổng | động | Total · $1,069.18 | |
| `.button--full` | copy | Add setup to cart | Có icon mũi tên |
| Hotspot 1–4, tên truy cập | động | Show {tên row} in the list | |
| `.stl__media img` | ảnh | Ảnh setup (1/1) | |

### Hàng 8: `container-home-inspiration`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `h2#mf-h` | copy | Make fitness⏎a natural part of your⏎everyday life ! | TT; Q3 (dấu cách trước "!"); "Make" màu đậm riêng |
| `.mf__sub` | copy | Just simple, effective workouts you can do anytime at home | |
| `.button` | copy | Get started now | Có icon mũi tên |
| `.mf__img` 1–3 | ảnh | 3 ảnh rải | |

### Hàng 9: `container-home-bundle-builder`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.shead .eyebrow` | copy | Build your bundle | TT |
| `h2#bundle-h` | copy | Pick your kit, save as you go | |
| `.section-link` | copy | View preset bundles | |
| Card 1–6 | store | Kettlebell 16 kg $259.00 · Battle rope $89.00 · Medicine ball 4 lb $45.00 · Weighted vest $34.00 · Sandbag 10 lb $52.00 · Speed rope $69.00 | Lệch store dev (mục 4) |
| `h3#bpanel-h` | copy | Your bundle | |
| Badge số món | động | 5 items | |
| Dòng món trong panel | động | theo món đang chọn | E7 |
| Subtotal | động | Subtotal · $514.00 | Nhãn "Subtotal" là copy |
| Dòng giảm | động | Bundle discount (15%) · −$77.10 | Chỉ khi có bậc (TE-12 AC1, AC-H18); U+2212 |
| Ghi chú đạt bậc | động | You reached 15% off | |
| Tổng | động | Total · $436.90 | |
| `button[type=submit]` | copy | Add bundle to cart | Có icon mũi tên |

### Hàng 10: `container-home-featured-product`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.fp__details .eyebrow` | copy | Featured product · Free Weights | TT; "Free Weights" là tên collection |
| `h2#fp-h` | store | Ativafit Lava 66 lb Adjustable | |
| `.sale-countdown__label` | copy | Sale ends in | |
| Ô đếm ngược | động | 22 · 36 · 28 | E8; hạn dưới 24 giờ để hiện 3 ô (AC-H23) |
| Giá | store | $379.99 · $499.99 | |
| Badge | động | −24% | U+2212 |
| Rating | store | (4.9) · 341 reviews | metafield `reviews.rating`, `reviews.rating_count` |
| `.fp__desc` | store | 11 to 66 lb in seconds. One pair replaces a whole rack of fixed dumbbells - and takes up less floor space than a shoebox. No plates to swap, no waiting between sets, just one dial and go. Fifteen pairs of dumbbells living quietly in the corner - and your room stays a room. | Mô tả sản phẩm |
| Spec nhãn 1–4 | copy | Weight range · Footprint · Materials · Assembly | |
| Spec giá trị 1–4 | store | 11 – 66 lb per hand · 0.18 m² — fits under a desk · Cast iron core, reinforced rubber · None — ready out of the box | metafield `custom.spec_1`–`custom.spec_4` |
| Nút 1 | copy | Add to cart | icon túi |
| Nút 2 | copy | View details | chữ ẩn " of {tên sản phẩm}" |
| `.fp__seal` | ảnh | Dấu tròn "Efitco · Feature product ·" | SVG, chữ trong SVG (notes ES1-T567 §10.4) |
| `.fp__media img` | ảnh | Ảnh sản phẩm (1/1) | |

### Hàng 11: `container-home-video-carousel`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.shead .eyebrow` | copy | Video demo | TT |
| `h2#video-h` | copy | See real equipment in action, before you buy | |
| Card 1 | store | Ativafit Lava 66 lb · $379.99 · $499.99 | |
| Card 2 | store | Compact Power Rack · $549.00 | |
| Card 3 | store | Adjustable dumbbell pair · $259.00 | Lệch store dev (mục 4) |
| Card 4 | store | Home Starter Kit · $399.00 · $512.00 | |
| Card 5 | store | Iron Core Kettlebell 16 kg · $119.00 | Lệch store dev (mục 4) |
| Card 6 | store | Resistance Band Set · $45.00 | |
| Nút play, tên truy cập | động | Play video: {tên sản phẩm} | |
| Poster 1–6, thumbnail 1–6 | ảnh | 6 poster 9/16, 6 ảnh sản phẩm | File video chỉ trên store dev |

3 ô số liệu: không có trong mockup (Q5, TE-13 AC3).

### Hàng 12: `container-home-testimonials`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.shead .eyebrow` | copy | Testimonial | TT |
| `h2#t-h` | copy | What our customers say? | Q3 |
| Card 1 | copy | E. Johnson · 5 sao · Versatile gear for all exercises · High quality equipment that doesn't break the bank. I am very impressed with the overall durability. | Sản phẩm: Ativafit Lava 66 lb $379.99 $499.99 (store) |
| Card 2 | copy | S. Williams · 4 sao · Folds away in seconds · The rack folds flat against the wall. My garage is a garage again between sessions. | Sản phẩm: Compact Power Rack R3 $549.00 |
| Card 3 | copy | M. Anderson · 5 sao · Smooth every single rep · The dial switches weight fast, no jamming at all. Saves an entire corner of my room. | Sản phẩm: FlexFold Adjustable Bench $189.00 $229.00 |
| Card 4 | copy | J. Miller · 5 sao · Worth every penny · Spins so smoothly, no tangling even at high speed. Best rope I have owned. | Sản phẩm: Revllen Pro Speed Rope $34.99 $44.99 |
| `.tcard__verified` × 4 | copy | Verified | E9: mặc định tắt; store dev bật theo fixture (AC-H25) |
| `.tcard img` 1–4 | ảnh | 4 ảnh (16/9) | |

### Hàng 13: `container-home-why-choose`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.why__content .eyebrow` | copy | We are about | TT |
| `h2#why-h` | copy | Why choose⏎Efitco? | TT |
| `.why__body` | copy | Affordable, high-quality fitness gear that supports beginners to elite athletes. We design for the home first — equipment that folds, stacks or disappears when you're done, so your living room stays a living room between sessions. | |
| `.button` | copy | View about us | Có icon mũi tên |
| `.why__media img`, `.why__accent img` 1–2 | ảnh | Ảnh lớn (1/1), 2 ảnh nhỏ | |

### Hàng 14: `container-home-blog-posts`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.shead .eyebrow` | copy | From the Efitco blog | TT |
| `h2#blog-h` | copy | Training tips & inspiration | |
| Card 1 | store | Diet plans · What to eat before and after a heavy session | `/blogs/training/eat-before-after-session` |
| Card 1 meta | động | 7 min read | 200 từ/phút (D8) |
| Card 2 | store | Featured · Set up a perfect home gym in just 15m² | |
| Card 2 meta | động | 5 min read | |
| Card 3 | store | Exercises · How to stretch properly after training | |
| Card 3 meta | động | 2 min read | |
| Card 4 | store | Diet plans · Rubber vs urethane: which plates last longer | |
| Card 4 meta | động | 5 min read | |
| `.article-card img` 1–4 | ảnh | Ảnh 4 bài (3/4) | 4 bài: lưới tĩnh (TE-16 AC1) |

### Hàng 15: `container-home-faq`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.section-header .eyebrow` | copy | Questions and answers | TT |
| `h2#faq-h` | copy | We're proud to be the best at training | |
| Câu 1 (mở sẵn) | copy | How long does shipping take? · Orders ship within one business day. Standard delivery is 2-4 business days across the continental US, and shipping is free on orders over $99. | |
| Câu 2 | copy | Are adjustable dumbbells easy for beginners? · Yes. The dial changes the weight in seconds, from 11 to 66 lb per hand. | Câu trả lời lệch store dev (mục 4) |
| Câu 3 | copy | How much floor space do I actually need? · A pair of adjustable dumbbells takes just 0.18 m² and fits under a desk. | như trên |
| Câu 4 | copy | Does equipment arrive assembled? · Adjustable dumbbells arrive ready to use, with no assembly needed. | như trên |
| Câu 5 | copy | What's covered by the warranty? · Every item comes with a 12-month warranty. | như trên |
| Ô số 1 | copy | Products · 360+ · Home gym gear in stock. | TT nhãn; "360+" AC-H5 |
| Ô số 2 | copy | Warranty · 12 · Months on every item. | TT nhãn |
| `.faq__image` | ảnh | Ảnh phải | |

### Hàng 16: `footer`

| Phần tử | Loại | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| `.site-footer__newsletter h2` | copy | Get 15% off your first order | "Get 15% off" màu accent (`span`) |
| `.site-footer__newsletter p` | copy | Get expert training tips, early access to gear, and exclusive offers - plus up to 15% off for subscribers. | |
| `label[for=nl-email]` | copy | Email | |
| Nút newsletter | copy | Get 15% off | setting `newsletter_button_label` (AC-H28) |
| `.site-footer__note` | copy | No spam. Unsubscribe anytime. | |
| `.site-footer__brand p` | copy | Efitco provides premium fitness accessories dedicated to supporting your journey as you conquer every health and bodybuilding goal with confidence. | |
| Menu "Shop" | store | Weight · Portable Fitness · Benches & Racks · Accessories | Menu `footer` |
| Menu "Information" | store | Our story · Our Efitco · FAQs · Contact us · Shipping policy · Refund policy | CTO 23/11 (ES1-T567); store dev đổi ở ES1-T574 |
| `.shop-follow` | động | Follow on Shop | Shopify vẽ, chỉ khi shop bật Shop (TE-1 AC11) |
| `.site-footer__trust` 1–4 | copy | 1 year warranty · Fast shipping · Premium quality · 90 day money back | |
| Copyright | động | © 2026 Efitco, Powered by Shopify | `shop.name`, năm thực |
| Wordmark | động | Efitco | `shop.name`, TT |
| Localization | động | USD / EN | Theo market |
| Icon thanh toán | động | 5 icon | `shop.enabled_payment_types` |
| Ảnh newsletter, logo, 4 icon social | ảnh | — | Link social đặt ở Theme settings |

## 3. Dữ liệu store dev (TE-9 AC4)

Nguồn danh sách đầy đủ: `docs/design/demo-data.json` (store hoa-qua-nhap-khau, xuất 09/11/2026), sau ES1-T574 xuất lại không còn tiền tố cũ. Không đổi handle và dữ liệu trong `tests/e2e/store-data.json`.

| Nhóm | Nội dung | Dùng ở hàng |
| --- | --- | --- |
| Sản phẩm | 24 sản phẩm demo (tên ở mục 2) + nhóm edge case của TE-9 AC7 | 5, 7, 9, 10, 11, 12 |
| Collection danh mục | Free Weights, Functional Training, Benches & Racks, Recovery & Mobility, Accessories | 3 |
| Collection trình độ | Beginner, Intermediate, Advanced | 4b |
| Collection tab | All, Weight, Portable Fitness, Accessories | 5 |
| Collection bundle, setup | Bundle (6 sản phẩm hàng 9), Setup (4 sản phẩm hàng 7) | 7, 9 |
| Tag quiz | `quiz-upper`, `quiz-core`, `quiz-lower`, `quiz-beginner`, `quiz-advanced`, `quiz-home`, `quiz-gym` | 6 |
| Metafield | `reviews.rating`, `reviews.rating_count`, `custom.spec_1`–`custom.spec_4`, `custom.sale_ends_at` | 5, 10 |
| Discount tự động | bundle 2 món 10%, bundle 3 món 15%, setup 4 món 10% (tên không tiền tố sau ES1-T574) | 7, 9 |
| Blog | blog training (`/blogs/training/…`), 4 bài ở hàng 14 | 14 |
| Menu | `main-menu` hàng 1; `footer` hàng 16 | 1, 16 |
| Tên shop | Efitco | 16 |

## 4. Lệch mockup ↔ store dev (ES1-T587)

| Hàng | Mockup | Store dev (`demo-data.json` 09/11) |
| --- | --- | --- |
| 4b | 24 · 12 · 10 products | theo `products_count` của 3 collection trình độ |
| 9 | Kettlebell 16 kg, Battle rope, Medicine ball 4 lb, Weighted vest, Sandbag 10 lb, Speed rope | Adjustable dumbbell pair, Foldable bench, Resistance band set, Speed rope, Recovery roller, Training mat |
| 11 | card 3 Adjustable dumbbell pair $259.00; card 5 Iron Core Kettlebell 16 kg $119.00 | card 3 Olympic Plate Set 100; card 5 Recovery Roller Pro |
| 15 | câu trả lời 2–5 riêng | 1 câu trả lời dùng chung |
| 14 | 4 bài | 4 bài; SRS TE-9 AC4 ghi 5 bài |
| 16 | menu Information 6 mục sentence case | đổi ở ES1-T574 |

Mặc định tới khi CTO trả lời: dòng lệch che khi so ở AC-H2; dòng khớp so đủ.

## 5. Đổi so với bảng ES1-T173

- Khoá khối: `data-testid` của section mockup thay mã phần tử bản vẽ cũ; 0 mã phần tử cũ trong file.
- Chữ sentence case theo mockup (CTO 21/11 lượt 2): heading, eyebrow, nút ("Explore equipment", "Become a member", "Add setup to cart", "Add bundle to cart", "View details", "Get started now", "View about us").
- Bỏ cột "Khoá đề xuất": khoá locale và setting là việc FE (ES1-T578).
- Bỏ dòng "Discount applies when an automatic discount is active." (sổ 07/11, L3: không ghi chú giảm giá).
- Số mới theo mockup: shop the look $1,187.98 · −$118.80 · $1,069.18 (E10 cũ hết lệch); bundle 5 món $514.00 · −$77.10 · $436.90; blog 4 bài; level 24 / 12 / 10.
- Dấu trừ U+2212 ở badge và tiền giảm.
