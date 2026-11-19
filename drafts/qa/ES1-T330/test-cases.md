KHÔNG CHẮC: (1) spec chưa chạy trên trình duyệt: lượt agent không có STORE_PASSWORD (store-dev screenshot báo "vẫn ở trang password"), Chromium bị sandbox chặn như ES1-T326/T329; kết quả chờ CI store-tests của PR. (2) TE-22-R2-FE3 (ES1-T328) bị CTO CẮT khỏi R1 11/11 → TE-22 AC5, phần ảnh 56/hàng 72 của AC4, phần card của AC14 chỉ kiểm khi FE3 vào code (spec tự phát hiện `menu_featured_product` trong blocks/header.liquid), nay skip có lý do. (3) Breadcrumb mới gắn ở article (ES1-T382) và list-collections; collection (TE-6-R2-FE2), product (TE-4-R2-FE3), blog (TE-20-R2-FE1), page (TE-21), search (ES1-T128), `?view=quiz` (ES1-T387, PR #223 chưa merge) chưa gọi snippet → TC-32..TC-39 skip có lý do theo từng template tới khi task gắn; spec tự bật khi template/block có `render 'breadcrumb'`. Search: body ES1-T128 chưa ghi breadcrumb dù ES1-T436 #1 nói Tech Lead thêm — hỏi ES1-T483. (4) Kỳ vọng `?view=quiz` lấy nguyên văn SRS "Your Gear Shortlist"; locale hiện `blocks.quiz.results_heading` = "Your shortlist" → TC-39 sẽ đỏ khi template gắn nếu không đổi chuỗi. (5) Banner (AC11) không có testid `page-banner`; spec lấy banner bằng `closest('.page-banner')` từ testid `breadcrumb`.

# ES1-T330 — TE-22-R2-QA1: mega A/B/C bàn phím + Esc, cấp 3, scrim, breadcrumb + JSON-LD
Nguồn: docs/srs.md#TE-22 (0.5) AC1–AC14, docs/srs.md#TE-1 AC2, AC7; docs/ui-spec/navigation.md §2–§9; docs/ui-spec/foundation.md §3.3, §5; ticket ES1-T330, task-split ES1-T307 §6.2; ES1-T436 (breadcrumb search, list-collections, ?view=quiz); ES1-T328 (FE3 cắt R1).
Phạm vi AC: drafts/qa/ES1-T330/ac-scope.md. Spec: tests/e2e/ES1-T330.spec.ts.
Cột AC: số AC của TE-22 (ac-scope AC-TE22-n); hàng có `[TE-1 ACn]` đầu cột Given là AC của TE-1 (ac-scope AC-TE1-n).
Không lặp: ES1-T329.spec.ts (hover mở, đổi mục + data-mega-instant, rê scrim đóng, bấm scrim, Enter/Space/Esc, Tab hết panel, lỗi mạng header-menu.js, drawer nạp lười + focus "Menu"), ES1-T323.spec.ts (drawer cấp 2 trượt + Back trên fixture), ES1-T326.spec.ts (snippet breadcrumb tĩnh, CSS banner trên fixture), TE-1.spec.ts TC-38–40 (lang, meta). TC ghi "đã có" trỏ test đó; spec ES1-T330 chỉ viết phần còn thiếu.
Mốc: mega 1280 + 1920 (từ 80rem); drawer 360 + 768; breadcrumb AC10 ở 360/768/1280/1920; nojs cho AC1, AC4, TE-1 AC2.

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | 1280 và 1920, main-menu có mục mega (data-mega) | rê chuột lên trigger mục mega | panel hiện, đỉnh panel = đáy header (±1px); header cao 80, màu nền không đổi so với trước khi mở; trigger `aria-expanded="true"`, màu = `--color-background-dark-foreground`; chevron `rotate: 180deg`; scrim hiện, đỉnh = đáy header, nền alpha 0.5 | E2E | P1 |
| TC-02 | AC1 | 1280, panel đóng | focus trigger, nhấn Space | panel mở, `aria-expanded="true"`, trang không cuộn (scrollY giữ) (Enter mở, Space đóng, Esc trả focus: đã có ES1-T329 "bàn phím") | E2E | P1 |
| TC-03 | AC1 | 1280, panel mục mega đang mở bằng hover | rê sang mục cấp 1 không có con | panel đóng, `aria-expanded="false"` (đổi sang mục cha khác, không chạy lại hiệu ứng: đã có ES1-T329 "rê sang mục mega khác") | E2E | P2 |
| TC-04 | AC1 | 1280, panel mở bằng bấm | bấm lại trigger; mở lại, focus link đầu panel rồi Shift+Tab 2 lần | bấm lại: panel đóng; Shift+Tab lần 1 về trigger, panel vẫn mở (không bẫy); lần 2 ra ngoài thì panel đóng (Esc, bấm scrim, rê scrim, Tab ra: đã có ES1-T329) | E2E | P1 |
| TC-05 | AC1 | 1280, thiết bị cảm ứng (hasTouch) | chạm trigger; chạm lại | chạm 1 mở panel; chạm 2 đóng; không mở do pointerover touch | E2E | P2 |
| TC-06 | AC1 | 1280, JS tắt | bấm trigger; bấm lại; mở lại rồi bấm scrim | bấm mở panel, link panel hiện; bấm lại đóng; bấm scrim đóng | E2E nojs | P1 |
| TC-07 | AC2 | trang `/` từ 80rem, menu có mục có con | đọc `data-mega` trên `details` cấp 1 và dữ liệu cùng mục trong drawer (cùng link_list) | có con có cấp 3 → `columns`; mọi con là URL `/collections/{handle}`, không cấp 3 → `tiles`; còn lại → không `data-mega` (C); không setting từng mục | E2E | P1 |
| TC-08 | AC2 | mục kiểu A | mở panel | cột 1 bắt đầu bằng link "View all …"; con không cấp 3 ngay sau trong cột 1 đúng thứ tự; mỗi cột có tiêu đề link (có id) + `ul[aria-labelledby]`; số cột = số con có cấp 3; 4 cột đầu cùng hàng, cột 5 trở đi y lớn hơn | E2E | P1 |
| TC-09 | AC2 | mục kiểu B | mở panel | tiêu đề panel = tên mục cha; có link "View all …"; mỗi ô có tên + "{n} Product(s)"; số ô = số con trong drawer; 5 ô đầu cùng hàng, ô 6–10 xuống hàng 2 | E2E | P1 |
| TC-10 | AC2 | mục kiểu C | bấm trigger | `ul` `header-submenu` hiện; mục không có `header-mega-panel`, `header-scrim` | E2E | P2 |
| TC-11 | AC2 | 1280 × 560, mục mega nhiều link nhất | mở panel | đáy panel ≤ đáy viewport; nội dung dài hơn thì `overflow-y` auto, cuộn được (scrollTop đổi); số link trong panel = số link cùng mục trong drawer (không cắt) | E2E | P2 |
| TC-12 | AC3 | HTML header (desktop + drawer) | đọc mọi link "View all …" | `/collections/all` → "View all products" hoặc "View all {tên}"; `/collections` → "View all collections"; khác → "View all {tên mục cha}"; không link nào chữ đúng "View all" | E2E | P1 |
| TC-13 | AC4 | 360 và 768, có JS, menu có mục có cấp 3 | mở drawer, chạm mục có cấp 3 | cấp 2 hiện: tiêu đề cấp 2 = tên mục; hàng "View all …" cao ≥ 52; tiêu đề nhóm là link cao ≥ 44; link cấp 3 cao ≥ 48; 0 thẻ h* trong drawer; drawer không tràn ngang | E2E | P1 |
| TC-14 | AC4 | dưới 80rem, mục kiểu B, FE3 có trong code | mở cấp 2 | hàng collection cao 72, ảnh 56 × 56 (skip: FE3 cắt R1) | E2E | P3 |
| TC-15 | AC4, AC5 | dưới 80rem, setting "Featured product in menu" có sản phẩm | mở cấp 2 kiểu A tương ứng | `header-drawer-promo` ở cuối cấp 2 (skip: FE3 cắt R1) | E2E | P3 |
| TC-16 | AC4 | 360, JS tắt | bấm nút menu, bấm mục có cấp 3 | accordion mở tại chỗ, hiện đủ link cấp 2 + cấp 3; nút Back không hiện | E2E nojs | P1 |
| TC-17 | AC5 | FE3 có trong code, setting có sản phẩm | mở panel kiểu A đầu tiên | 1 `header-mega-promo`: ảnh, eyebrow "Featured", tên đủ, giá; giảm thì badge; hết hàng "Sold out" + ảnh opacity 0.6 (skip: FE3 cắt R1) | E2E | P3 |
| TC-18 | AC5 | theme hiện tại, setting trống / chưa có | mở panel kiểu A | 0 `header-mega-promo`, 0 `header-drawer-promo`; lưới cột 4 track phủ đủ bề rộng vùng nội dung (không chừa cột card) | E2E | P2 |
| TC-19 | AC5 | FE3 có trong code, "Show collection images in menu" tắt | mở mục toàn collection | panel kiểu C, drawer hàng không ảnh (skip: FE3 cắt R1; cần đổi setting trên store dev) | E2E | P3 |
| TC-20 | AC5 | FE3 có trong code, collection không ảnh / 0 sản phẩm | mở kiểu B | ô nền cream + icon, không ẩn; "0 Products" (skip: FE3 cắt R1) | E2E | P3 |
| TC-21 | AC6 | `/` 1280 và 360 | tải trang, chưa tương tác | mọi `details` trong header đóng; mọi `img` trong nav/drawer có `loading="lazy"`, width, height, không fetchpriority; 0 request ảnh menu trước khi mở | E2E perf | P1 |
| TC-22 | AC6 | HTML server của `/` | parse response, đếm `a[href]` trong `header-menu` | số link HTML server = số link DOM khi đóng; mọi link cấp 3 của drawer có trong nav desktop | E2E SEO | P1 |
| TC-23 | AC6 | `/` và `/collections/all`, 1280 | đọc LCP; mở panel bằng hover, đo layout-shift | phần tử LCP không nằm trong `header`; tổng layout-shift khi mở panel = 0 | E2E perf | P2 |
| TC-24 | AC7 | HTML header | đọc ngữ nghĩa | đúng 1 `nav[aria-label="Main menu"]` và 1 `nav[aria-label="Mobile menu"]`; header 0 thẻ h1–h6; mọi `ul[aria-labelledby]` trỏ phần tử tồn tại, không là h*; `aria-controls` của trigger trỏ id tồn tại | a11y | P1 |
| TC-25 | AC7 | 1280, panel đóng | focus trigger đầu, Tab; rồi mở bằng Enter, Tab hết link panel, Tab thêm 1 | panel đóng: Tab sang mục cấp 1 kế tiếp, không vào link panel; panel mở: sau link cuối focus ở mục cấp 1 kế tiếp | a11y | P1 |
| TC-26 | AC7 | mở trang là đích của 1 link cấp 2/3 trong menu | mở panel chứa link đó | link có `aria-current="page"`, gạch chân, độ dày 2px | a11y | P2 |
| TC-27 | AC7 | 1280 | Tab tới trigger trên thanh tối | outline solid 2px, màu = `--color-background-dark-foreground` | a11y | P2 |
| TC-28 | AC7 | 1280 | đo trigger/link cấp 1 và link trong panel (A, B, C) | mục cấp 1 cao ≥ 44; link trong panel cao ≥ 40 (BUG ES1-T330-B01 / ES1-T482: cấp 1 24–26, dropdown C 36) | a11y | P3 |
| TC-29 | AC7 | 1280, `prefers-reduced-motion: reduce` | mở panel, rê link panel | panel không animation, `translate`/`transform`/`scale` none; link hover không dịch | a11y | P2 |
| TC-30 | AC7 | 1280 panel A mở; 360 drawer cấp 2 mở | axe | 0 vi phạm serious/critical trong header | a11y | P1 |
| TC-31 | AC8 | blocks/header.liquid (kiểm mockup: không làm trống main-menu store dev) | đọc Liquid | nút menu, drawer, nav nằm trong `{% if has_menu %}`; placeholder `blocks.header.menu_placeholder` chỉ trong `{% elsif request.design_mode %}`; logo + icon ngoài nhánh; locale có chuỗi | tĩnh | P2 |
| TC-32 | AC9 | `/collections/all` (template collection) | render | breadcrumb `Home / Collections / {h1}`; Home → `/`, Collections → `/collections` | E2E | P1 |
| TC-33 | AC9 | sản phẩm TE1_PRODUCT_HANDLE | mở `/collections/all/products/{h}` và `/products/{h}` | trong collection: `Home / {tên collection} / {sản phẩm}`, mục giữa → `/collections/all`; qua /products/: `Home / {sản phẩm}` | E2E | P1 |
| TC-34 | AC9 | blog của bài viết mẫu, tag của bài | mở blog, mở trang tag | blog `Home / {blog}`; tag `Home / {blog} / {tag}`, mục giữa → URL blog | E2E | P1 |
| TC-35 | AC9 | bài viết (TE330/TE382/TE407_ARTICLE_PATH hoặc link bài đầu trên `/`) | mở bài | `Home / {blog} / {bài}`, mục giữa → URL blog | E2E | P1 |
| TC-36 | AC9 | page TE403_PAGE_PATH | mở | `Home / {page}` | E2E | P1 |
| TC-37 | AC9 | `/search` và `/search?q=a` | mở | `Home / Search` | E2E | P2 |
| TC-38 | AC9 | `/collections` | mở | `Home / Collections` | E2E | P2 |
| TC-39 | AC9 | `/collections/{TE11_QUIZ_COLLECTION}?view=quiz` | mở | `Home / Your Gear Shortlist` | E2E | P2 |
| TC-40 | AC9 | mọi trang TC-32..39 | đọc breadcrumb | `nav[aria-label="Breadcrumb"] > ol`; mục cuối `span[aria-current="page"]`, không link; mục khác là link; link cao ≥ 44; chữ 14px; link màu `--color-muted` (trắng khi trong banner) | E2E a11y | P1 |
| TC-41 | AC9, AC12 | `/`, `/cart`, 404 (`/pages/es1-t330-khong-ton-tai`); password, gift card (tĩnh) | mở / đọc template | 0 `nav[aria-label="Breadcrumb"]`, 0 BreadcrumbList; templates password, gift_card, 404 và layout password không gọi breadcrumb | E2E + tĩnh | P1 |
| TC-42 | AC10 | trang có breadcrumb (bài viết, không có thì `/collections`), tên cuối + h1 thay bằng chuỗi 64 ký tự qua `page.route` (HTML thật + CSS thật) | render 360, 768, 1280, 1920 | mục cuối đủ chuỗi, `text-overflow` không ellipsis, không `nowrap`, mép phải ≤ viewport, `scrollWidth` ≤ viewport, 360 cao > 1 dòng; h1 đủ chuỗi | E2E UI | P1 |
| TC-43 | AC11 | collection có ảnh (TE330_BANNER_COLLECTION_PATH), breadcrumb nằm trong `.page-banner` | render 360 và 1280 | cách đáy header 16 / 24; cao ≥ 280 / 360; bo 16; link breadcrumb, mục cuối, h1 trắng; `::after` gradient 0.75 → 0.6; ảnh `loading="eager"` + `fetchpriority="high"` (tương phản ảnh trắng: đã có ES1-T326 TC-09) | E2E UI | P2 |
| TC-44 | AC12, AC10 | mọi trang TC-32..39 có breadcrumb | parse mọi `script[type="application/ld+json"]` | parse không lỗi; đúng 1 `BreadcrumbList`, `@context` schema.org; số mục = số mục hiển thị; position 1..n; name = chữ hiển thị (đủ tên); item mục 1..n−1 = URL tuyệt đối của link; mục cuối không item hoặc = URL trang | E2E SEO | P1 |
| TC-45 | AC12 | trang TC-41 | parse JSON-LD | 0 `BreadcrumbList` (gộp vào test TC-41) | E2E SEO | P1 |
| TC-46 | AC12 | URL preview của collection, product, article | dán vào Rich Results Test (thủ công, ghi kết quả vào ticket) | Breadcrumbs hợp lệ, 0 lỗi | thủ công | P2 |
| TC-47 | AC13 | collection, blog, page, article | render | đúng 1 h1; có `page-title` thì eyebrow trước h1, h1 trước meta (thứ tự DOM) | E2E | P2 |
| TC-48 | AC14 | repo (theme mới cài) | đọc header.liquid, snippets header-*, settings_schema | setting `menu` default `main-menu`; `menu_featured_product` nếu có thì không default; 0 chuỗi `figma-` trong code header | tĩnh | P1 |
| TC-49 | AC14 | store dev đã cấu hình menu ES1-T298 (Shop, Collection) | đọc nav 1280 | Shop `data-mega="columns"`; Collection `data-mega="tiles"` có 5 ô; card ở Shop chỉ kiểm khi FE3 có (skip nếu menu chưa cấu hình) | E2E | P2 |
| TC-50 | AC2 | [TE-1 AC2] 768, có JS, mục có cấp 3 | mở drawer, chạm mục; chạm Back | cấp 2 hiện, focus `header-drawer-back` (tên "Back to menu", cao ≥ 44); Back → cấp 2 ẩn, focus về hàng vừa mở (360 fixture đã có ES1-T323; focus "Menu" khi mở đã có ES1-T329) | E2E | P1 |
| TC-51 | AC2 | [TE-1 AC2] JS tắt dưới 80rem | bấm mục có con | accordion tại chỗ, không Back (chạy chung test TC-16) | E2E nojs | P1 |
| TC-52 | AC7 | [TE-1 AC7] collection, product, article (trang có breadcrumb) | đọc head | `html[lang]` khớp `^[a-z]{2}`; đúng 1 canonical; có `<title>`, meta description, `og:title`, `og:url`, `twitter:card` (đầy đủ: đã có TE-1 TC-38–40) | SEO | P2 |

## Case biên (ngoài AC)

| ID | Biên | Given | When | Then | Spec |
| --- | --- | --- | --- | --- | --- |
| B-01 | rỗng | snippet breadcrumb với `current_title` rỗng | render | không nav, không JSON-LD (nhánh `has_trail and current_title != blank`) | tĩnh |
| B-02 | tối đa | tên cuối 1 token 64 ký tự không khoảng trắng | render 360 | xuống dòng (overflow-wrap), không tràn ngang | E2E |
| B-03 | mất mạng | `header-menu.js` abort / `header-drawer.js` abort | bấm trigger / nút menu | panel, drawer vẫn mở (đã có ES1-T329) | ref |
| B-04 | 360px | drawer 360 | mở cấp 2 có cấp 3 | drawer không tràn ngang (trong TC-13) | E2E |
| B-05 | bàn phím | Space trên trigger | nhấn | không cuộn trang (TC-02) | E2E |
| B-06 | screen reader | trigger mega | đọc thuộc tính | `aria-controls` trỏ id tồn tại (TC-24) | E2E |
| B-07 | editor vs storefront | menu trống | design_mode | placeholder chỉ ở editor (TC-31) | tĩnh |
| B-08 | merchant chưa chọn resource | setting `menu` chưa chọn / "Featured product in menu" trống | render | không nav, không nút menu (TC-31); không card (TC-18) | tĩnh + E2E |
| B-09 | JSON-LD hỏng | mọi khối ld+json của trang có breadcrumb | JSON.parse | không khối nào lỗi (TC-44) | E2E |
| B-10 | ký tự đặc biệt | tên có `&`, `"` | render | text breadcrumb = name JSON-LD (escape HTML, `json` filter), so chữ trong TC-44 khi store có dữ liệu | E2E |

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- main-menu 3 cấp theo ES1-T298/ES1-T271: Shop (/collections/all) > Categories, Training Level, Featured (có cấp 3) → A; Collection (/collections) > 5 `figma-cat-*` → B; Sale, Our Story, Blog, Contact, Help không con. Thiếu mục mega thì test hành vi skip có lý do.
- Sản phẩm: `TE1_PRODUCT_HANDLE` = figma-iron-core-kettlebell (tests/e2e/store-data.json); collection `all`.
- Page: `TE403_PAGE_PATH` = /pages/te403-rte.
- Bài viết: env `TE330_ARTICLE_PATH` → `TE382_ARTICLE_PATH` → `TE407_ARTICLE_PATH` → link `/blogs/{blog}/{bài}` đầu tiên trên `/`. Tag: link `/tagged/` đầu tiên trên trang bài.
- Quiz: `TE11_QUIZ_COLLECTION`. Banner: `TE330_BANNER_COLLECTION_PATH` (collection có ảnh); thiếu thì TC-43 skip.
- FE3 chưa có → TC-14, TC-15, TC-17, TC-19, TC-20 và phần card TC-49 skip.

## Kết quả lượt này
- Chưa chạy Playwright (xem KHÔNG CHẮC). Kỳ vọng theo đọc code: TC-28 ĐỎ (bug ES1-T330-B01); TC-32..34, TC-36, TC-37, TC-39 skip tới khi template gắn breadcrumb; TC-14/15/17/19/20 skip (FE3 cắt).
- Bug: drafts/qa/ES1-T330/bugs/ES1-T330-B01.md → ticket ES1-T482 (dev-fe, P3).
- Câu hỏi: ES1-T483 (Tech Lead) — breadcrumb search chưa thuộc task; chuỗi `?view=quiz`.
- Đã chạy: `npx playwright test ES1-T330.spec.ts --config=drafts/qa/ES1-T330/pw-static.config.mjs` → 4 tĩnh đạt (TC-31, TC-41 tĩnh, TC-48, B-01), 54 skip vì không có PREVIEW_URL; `--list` toàn file 116 test biên dịch OK.

## KHÔNG CHẮC
Xem dòng đầu file.
