KHÔNG CHẮC: (1) 5 câu chờ CTO ở ES1-T309 (phạm vi dòng ĐỀ XUẤT trong ui-spec, bậc giảm mặc định, claim mặc định, so ảnh 1280/768/360, AC cho mục sổ 11/11 chưa vào SRS 0.4); im lặng tới 13/11/2026 thì áp mặc định ghi trong ES1-T309, bảng dưới đã viết theo mặc định đó. (2) SRS gốc là `docs/srs.md` bản 0.4 (ES1-T299 chưa chấm). (3) Không ước lượng point (vai BA); cột point trong "Ticket cần tạo" để `N point`, Tech Lead điền. (4) Phiên này không có shell: chưa chạy `vague_words.py`, `traceability.py`; đã rà tay 7 từ cấm. (5) Ticket dev "hiện có" lấy từ danh sách ticket ngày 11/11 (mcp list theo agent dev-fe, dev-be và Sprint 1); ticket ở sprint khác có thể bị sót.

# REQ-0002: phân tích tác động (BA) · ES1-T306 · 11/11/2026

## Tóm tắt

- Yêu cầu: BGĐ duyệt thiết kế theme Efitco ngày 11/11/2026 (thiết kế vòng 3, audit ES1-T283 sửa ở ES1-T284 → T294, thiết kế tuân thủ Theme Store PR #173, đã merge develop). Chuyển sang giai đoạn Dev hoàn thiện: mọi màn đã duyệt phải có ticket FE/BE/QA sẵn sàng chạy, CTO duyệt rồi triển khai.
- Áp dụng từ 11/11/2026. Từ ngày này 28 file `docs/ui-spec/*.md` trên develop là thiết kế đã duyệt; sổ `docs/design/decisions.md` (dòng 10/11, 11/11) thắng SRS khi mâu thuẫn (SRS 0.4 mục 0 đã ghi).
- Mâu thuẫn với AGENTS.md: không. Mọi spec giữ block-first, không `sections/`, không JSON template (sổ 11/11 KIẾN TRÚC, ADR 0004). Gift card giữ `{% layout none %}` đúng AGENTS.md Composition model. Trang `page.contact`, `collection.quiz` là template Liquid, đúng "Add a page type".
- Mâu thuẫn với ADR: không thấy. Ngân sách JS (ADR 0002, 0006: 8 KB mỗi file, 40 KB mỗi trang) chưa được tính lại cho phần JS mới (layers, popup, mega menu, recent searches, stepper, upsell); việc của Tech Lead (ES1-T307).
- Mâu thuẫn với SRS 0.4: có 9 điểm (mục "AC mâu thuẫn với decisions.md" dưới), nặng nhất là bậc giảm bundle mặc định (TE-12 AC1, AC-H18, AC-H19, TE-10 AC3) trái sổ 11/11 TUÂN THỦ (7) và ES1-T304; đã hỏi ES1-T309 #2.
- Khoảng trống SRS 0.4: 28 ui-spec → 18 story; 6 spec gần đủ AC (announcement-bar, localization, pagination, countdown, quiz-result, marketing-popups); 12 spec thiếu AC ở trạng thái rỗng/lỗi/đang tải hoặc ở mốc 768/1280; 7 template trang phụ (blog, article, page, contact, 404, password, gift card) chỉ có 2 dòng AC (TE-9 AC2, AC3) cho 7 spec. Đề xuất SRS 0.5 tách 2 story mới TE-19 (blog, bài viết), TE-20 (page, contact, 404, password, gift card).

## Ảnh hưởng

### Story bị ảnh hưởng
TE-1, TE-2, TE-3, TE-4, TE-5, TE-6, TE-7, TE-8, TE-9, TE-10, TE-11, TE-12, TE-13, TE-15, TE-16, TE-17, TE-18 (17/18 story; TE-14 không đổi AC, chỉ bảng block trong AGENTS.md phải cập nhật khi thêm block). Đề xuất story mới: TE-19, TE-20 (tách từ TE-9).

### Ticket bị ảnh hưởng
- Đang mở, phạm vi viết theo AC cũ, cần Tech Lead viết lại body hoặc đóng thay: ES1-T128 (search FE1, chưa có type-nav, S1, drawer mọi mốc), ES1-T129, ES1-T130 (predictive, chưa có tab, suggestions, recent, khám phá, lỗi), ES1-T110, ES1-T111 (collection BE, chưa có chip, skeleton sau 300 ms, phân trang JS), ES1-T147 (bundle FE1 "3 bậc giảm mặc định tắt", chờ ES1-T309 #2), ES1-T156 (featured product FE1 "gallery ảnh", thiếu rich media sổ 11/11 (6)), ES1-T98 (TE-5 BE3, chưa có stepper, panel), ES1-T119, ES1-T120 (TE-7 FE2, FE3).
- Mâu thuẫn AC hiện hành, đề xuất đóng: ES1-T248, ES1-T303 (bug "bấm swatch card đổi ảnh/alt"): TE-3 AC2 bản 0.3 và foundation §9 đã chốt swatch card là chỉ báo, không bấm. Test TE-3 TC-12, TC-33 đang theo AC2 cũ, QA bỏ.
- Đã đóng nhưng code lệch thiết kế đã duyệt: ES1-T190 (vùng bấm swatch 44 px, D7 bỏ ở 0.3), ES1-T118 (testimonials "lưới 1280", trái TE-7 AC1 L6 hàng ngang), ES1-T188 (tab không JS là link: giữ), ES1-T184 (danh mục 1920 only, thiếu HD3 1280).
- QA đang mở, phạm vi AC cũ: ES1-T99 (TE-5 AC1–AC7, thiếu AC8–AC10), ES1-T112 (TE-6 AC1–AC5, thiếu AC6, AC7), ES1-T131 (TE-8 AC1–AC3, AC2 đổi ở 0.4), ES1-T140 (TE-11 AC1–AC4, thiếu AC5–AC8), ES1-T151 (TE-12, chờ ES1-T309 #2), ES1-T159 (TE-13, AC1 0.3, AC2 0.4).
- Không trùng: ES1-T304 (Tech Lead, code tuân thủ Theme Store) đã có: QR gift card, logo password, rich media featured, payment icons, countdown demo, tier giảm, "Get 15% Off", Verified, favicon, logo dự phòng, social, index nhúng demo, search.liquid, 404 search + home, blog excerpt, thông báo comment, page.contact, asset predictive, h5 ≠ h6, viền radio quiz, `.rte`, không cắt tên. Bảng dưới đánh dấu "T304" ở các AC thiếu đã có task ở đó; Tech Lead (ES1-T307) không tách lại.

### Block, snippet bị ảnh hưởng (theo "Map sang code" của spec)
- Sửa: `header` (mega A/B/C, header tối mọi trang, bỏ `body:has(.slideshow)` và `data-header-overlay`), `footer` (Follow on Shop, localization gộp), `announcement-bar`, `slideshow`, `slideshow-slide`, `featured-collection`, `product-info`, `product-form`, `product-media`, `product-sticky-bar`, `product-recommendations`, `cart-drawer`, `cart-page`, `collection-filters`, `collection-products`, `search-results`, `bundle-builder`, `shop-the-look`, `featured-product`, `quiz`, `blog-posts`; snippet `product-card`, `pagination`, `predictive-search`, `filter-group`, `article-card`, `image`, `price`.
- Mới (ĐỀ XUẤT trong spec, phạm vi theo ES1-T309 #1): block `not-found`, `password-hero`, `contact-form`, `blog-articles`, `article-main`, `article-comments`, `related-articles`, `product-details`, `product-reviews`, `newsletter-popup`, `exit-popup`, `offer-popup`, `localization` (hoặc snippet), snippet `breadcrumb`, `sale-countdown`, `variant-picker`; template `page.contact.liquid`, `collection.quiz.liquid` (đã có, sửa).
- Theme settings mới: `popular_searches` (foundation §24.1). Block settings mới: xem cột "AC thiếu" và mục setting dưới.

### Skill bị ảnh hưởng
`srs-template`, `traceability-matrix`, `user-story-ac` (mục "Sửa skill" dưới). `test-case-gwt`, `playwright-theme` (QA): thêm ma trận mốc × trạng thái; không đề xuất sửa ở đây vì ngoài vai BA, ghi ở "Kiến thức cho qa".

### Agent bị ảnh hưởng
po (story mới TE-19, TE-20, thứ tự), ba (SRS 0.5), techlead (ES1-T307 tách FE/BE từ bảng dưới, đóng ticket lệch), dev-fe, dev-be, qa (TC cho AC mới), designer (3 chỗ spec tự mâu thuẫn), writer (docs/merchant cho setting mới).

### Bảng ui-spec → story → AC
Chữ viết tắt: "T304" = đã có task ở ES1-T304, không tách lại. "—" = chưa có ticket dev. AC thiếu ghi theo mặc định của ES1-T309.

| ui-spec | Story | AC có (SRS 0.4) | AC thiếu (đưa vào SRS 0.5) | Ticket dev hiện có |
| --- | --- | --- | --- | --- |
| foundation.md | TE-1, mọi FE | TE-1 AC1, AC6–AC9; TE-3 AC2 (swatch chỉ báo); TE-4 AC4 (nút thương hiệu) | §5 breadcrumb + JSON-LD BreadcrumbList ở mọi trang con; §17 toast (làn, 250/150 ms, `role`); §18 mẫu rỗng/lỗi/đang tải dùng chung (không làm mờ chữ, skeleton đúng kích thước); §24.1 setting `popular_searches` (tối đa 5 cụm, rỗng thì ẩn ở 2 chỗ); §27 nút thương hiệu ở cart, drawer, Follow on Shop, Apple Wallet (chỉ biến CSS chính thức); §28 `.rte` chung, h1–h6 khác nhau (T304); §29 Follow on Shop dưới social (R4.18 có trong mã R TE-1 nhưng 0 AC); sổ 11/11 (3) tên sản phẩm, collection, bài không cắt (T304); FD1 chữ phụ panel tối 70% | — (T304 phần .rte, không cắt tên) |
| navigation.md | TE-1 | TE-1 AC2 (cấp 2, drawer Back, không JS accordion) | Mega ≥ 80rem 3 biến thể A/B/C theo dữ liệu menu (§3), menu 3 cấp (audit README §2: code đọc 2 cấp); nhãn "View all …" theo loại link; 2 setting `menu_collection_images` (true), `menu_featured_product` (trống); mở bằng rê 150 ms, chạm ≥ 80rem; Esc trả focus; menu trống: editor có placeholder, storefront không nút menu; collection không ảnh/0 sản phẩm | — |
| announcement-bar.md | TE-1 | TE-1 AC4 (đủ) | — | — |
| localization.md | TE-1 | TE-1 AC5, AC9, AC10 (đủ) | — | — |
| layers.md | TE-10 | TE-10 AC6, AC7, AC8 | §3 focus không bị che: Tab qua footer PDP 360 khi sticky bar hiện, dòng giỏ 360 khi checkout bar hiện, card bundle 360 khi bundle bar hiện, viền focus thấy đủ (WCAG 2.4.11); §2.2 mỗi trang tối đa 1 thanh đáy; §2.4 phản hồi trong lớp modal ở vùng status của lớp; thanh đáy và teaser ẩn khi lớp có scrim mở; §2.3 hai vùng chạm dải đáy cách ≥ 16 | — |
| index.md (ES1-T252) | TE-17 | AC-H35 | Đã thay bởi index-mobile-a/b (index-mobile-a §14); không viết AC theo file này | — |
| index-mobile-a.md | TE-2, TE-3, TE-11, TE-12, TE-15, TE-17 | TE-2 AC2, AC7, AC10; TE-1 AC9; TE-11 AC4; AC-H35 | Bestseller 768 lưới 4 cột khi số sản phẩm chia hết 4, ngược lại 3 (H3); level card < 80rem hàng "N Products" luôn hiện; quiz 360 panel tràn mép; shop the look 768 lưới `1fr 280`, panel dính; make fitness 360 2 ảnh, 768 3 ảnh; intro 768 display 70 hai dòng; slideshow dưới 80rem không tự xoay dù bật autoplay (§11, xem mâu thuẫn M7); trạng thái skeleton tab, tab rỗng, lỗi thêm setup | ES1-T250 (bug trang chủ, Open) |
| index-mobile-b.md | TE-12, TE-13, TE-7, TE-16, TE-18 | TE-18 AC6 (teaser trên thanh bundle); TE-7 AC1 | §1.1 thanh dính bundle 360 (HB1): hiện khi lưới trong màn và panel chưa vào, 0 món vẫn hiện + nút disabled, 1 form, lỗi trong thanh, đang thêm busy; HB2 teaser nhấc theo `--bundle-bar-height` thật; featured product 768/360; video nút play 52; dòng giảm panel dùng `--panel-saving` | ES1-T147 (bundle FE1) |
| index-1280.md | TE-2, TE-7, TE-13, TE-15, TE-16, TE-17 | TE-2 AC7 (HD2 nút 52 góc dưới phải); TE-7 AC1 (HD3 chỉ testimonials) | HD3 cho danh mục (card ≈ 271, lộ ≥ 25% card 5), video (giữ 264), blog (4 bài vừa khung thành lưới tĩnh, không nút); level card ≥ 80rem hàng "N Products" hiện khi hover/focus, số vẫn trong tên link; đo kích thước khối 1280 theo bảng §1 lệch ≤ 2 px (ES1-T309 #4); HD1 display `min(display, 6.25vw)` kiểm bằng computed style | ES1-T184, T191 (đã đóng, chỉ 1920) |
| product.md | TE-4 | TE-4 AC1–AC5, AC7–AC11, AC17; AC5 sticky | Thứ tự khối main → complementary → reviews → related; gallery: ảnh 4:3 ở 768, tràn mép 360, gallery dính từ 64rem, lightbox Esc trả focus, không media thì placeholder; stepper số lượng 44 (− khoá ở 1); mô tả chuyển vào accordion "Features and description" (block `product-details`, 3 mục, 2 mở sẵn, Specifications ẩn dòng thiếu); hàng cam kết 3 mục (setting, link policy); block `product-reviews` (P1: tóm tắt metafield + vùng app block, không metafield và không app thì ẩn; ES1-T264); complementary dạng thẻ ngang có nút Add To Cart; related < 80rem hàng ngang; trạng thái A (hết hàng), B (tổ hợp không tồn tại + câu gợi ý), C (đang thêm), D (lỗi 422 dưới nút); 10 setting mới §12 | ES1-T65, T68, T69, T76 (đã đóng, AC1–AC12 cũ) |
| variant-picker.md | TE-4, TE-3 | TE-4 AC13–AC15; TE-3 AC2 | VP2 chấm màu card ≤ 4 hiện hết, > 4 hiện 3 + "+N"; VP3 option thiếu swatch ở vài giá trị thì cả option là pill chữ; nhãn "Show Fewer" Title Case (M4 dưới) | — |
| product-shopify-features.md | TE-4, TE-5, TE-3 | TE-4 AC4, AC6, AC9, AC18, AC19, AC20; TE-5 AC9, AC10; TE-3 AC8 | §6 form người nhận gift card: validation email, ngày gửi, lỗi theo trường; quickview gift card chỉ chọn mệnh giá + link "Add a recipient on the product page"; §3.1 unit price ở PDP, quickview, giỏ (TE-3 AC4 chỉ card); combined listing không AC (ES1-T297 #6, giữ) | — |
| countdown.md | TE-4, TE-13, TE-18 | TE-4 AC17, TE-13 AC1, TE-18 AC6 | K2 < 1 giờ: ô nền accent, không nhấp nháy, không đổi cỡ; editor: ngày sai định dạng và có cả metafield + setting thì chỉ báo trong editor | ES1-T158 (đã đóng, chưa đọc metafield: audit C2) |
| mini-cart-quickview.md | TE-3, TE-5 | TE-3 AC9–AC12; TE-5 AC1, AC2, AC8 | Mini cart: header có "View cart" + pill số món; stepper −/+ gửi sau 300 ms không bấm thêm, − khoá ở 1, + khoá sau 422; "Added to cart" không tự tắt; footer panel tối, Subtotal chỉ khi có discount cấp giỏ; câu thuế luôn hiện; gợi ý "Pairs Well With" 2 hàng (setting); giỏ rỗng có 2 hàng Bestsellers (setting); lỗi mạng "Try Again". Quickview: rich media (video, YouTube/Vimeo, 3D, sổ 11/11 (6)); setting "Show vendor in quick view"; ảnh 1 thì không chevron, không thumbnail | ES1-T95, T96, T97 (đóng), ES1-T98 (Open) |
| cart.md | TE-5 | TE-5 AC1–AC7, AC9, AC10 | Stepper 44 thay ô số (G1); dòng hết hàng sau khi thêm: badge, câu, stepper khoá, Checkout không khoá; lỗi mạng "Reload Cart"; panel Order Summary: dòng Shipping "Calculated at checkout", payment icons full color dưới Checkout; thanh checkout dính đáy < 64rem; upsell complementary ≤ 4 (G2) ẩn khi 0 kết quả/lỗi/giỏ rỗng; giỏ rỗng: lưới Bestsellers từ setting; 7 setting mới §5 | ES1-T97 (đóng) |
| collection.md | TE-6 | TE-6 AC1–AC4, AC6, AC7 | Mặc định 3 cột khi có cột lọc (C1); cột lọc ≥ 64rem, drawer 90% / 420 dưới 64rem (C2); nhóm > 6 giá trị: 6 + "Show N more"; giá trị đếm 0 disabled + gạch ngang; chip lọc đang áp + "Clear all" (link thật); toolbar dính dưới header < 64rem; số kết quả luôn hiện; banner `.page-banner` lớp tối ≥ 60%, mô tả > 3 dòng xuống dưới banner; rỗng có "Browse collections"; lọc ra 0 có "Clear filters"; cập nhật: không làm mờ, skeleton sau 300 ms; lỗi "Try Again" giữ lưới cũ; sang trang bằng JS cuộn về đầu lưới, focus số kết quả | ES1-T109 (đóng), ES1-T110, T111 (Open) |
| list-collections.md | TE-6 | TE-6 AC5, AC6 | Breadcrumb; card ảnh 336/220 bo 16 + h2 28; dòng "N products"; lưới 2/3/4 cột theo 360/768/≥1280; không ảnh: khung cream giữ tỉ lệ; rỗng "No Collections Yet" + "Shop All Products"; LCP card 1 eager + high, hàng đầu eager | — |
| pagination.md | TE-6, TE-8, TE-19 | TE-6 AC6, AC7; TE-8 AC2 | Đủ; chỉ thiếu phần JS ở collection (dòng collection.md) | ES1-T110 (Open) |
| search.md | TE-8 | TE-8 AC2, AC3 | S1 chưa có `q`: popular searches (theme setting), "Shop by category"; type-nav All/Products/Articles/Pages (link thật, `aria-current`); drawer lọc mọi mốc (S2 CTO 10/11); chip + filter-note; S2 0 kết quả: panel gợi ý + 4 Popular Products; S6a lọc ra 0; S6b lỗi refresh; nút xoá × 44; 7 setting §4 (bỏ dòng Popular searches theo foundation §24.1) | ES1-T128 (Open, T304 "search.liquid theo spec") |
| predictive-search.md | TE-8 | TE-8 AC1, AC3 | Setting Search style Popup/Drawer; tab theo nhóm có số, chạm 8 ghi "8+"; nhóm Suggestions (≤ 4 từ khoá); khám phá khi < 2 ký tự hoặc 0 kết quả: recent searches (5 mục, localStorage, "Clear"), popular searches, popular collections (setting), trending (setting); câu nhắc 1 ký tự; loading > 200 ms skeleton; lỗi/quá 5 s hộp alert + "Try Again"; nút chân đổi theo tab; 2 setting header | ES1-T129, T130 (Open), T304 (asset thiếu) |
| quiz-result.md | TE-11 | TE-11 AC3, AC5–AC8 | Default `results_popup` đổi true; default `empty_text` mới; nút submit `aria-busy` lúc mở popup | ES1-T137, T138, T139 (đóng, AC1–AC4) |
| marketing-popups.md | TE-18 | TE-18 AC1–AC9 | Nút × trên teaser ẩn N ngày (setting đã có, chưa có AC) | — (TE-18 chưa có ticket FE/BE nào) |
| blog.md | TE-9 → TE-19 | TE-9 AC3, TE-16 AC-H26/27 (trang chủ) | Lọc chủ đề (tag) là link thật, `aria-current`; bài nổi bật trang 1 (setting); card có excerpt 20 từ + ngày (sổ 11/11 (4), T304); lưới 1/2/4/4 cột; blog rỗng, tag rỗng; không ảnh: khung tối; 7 setting §2; LCP bài nổi bật hoặc card 1 | T304 (excerpt) |
| article.md | TE-9 → TE-19 | TE-9 AC3 | Ảnh bìa bo 16 dưới header, không chữ đè; meta ngày · tác giả · thời gian đọc; Topics + "Back to {blog}"; bình luận: 0 bình luận, chờ duyệt, đăng ngay, lỗi theo trường + hộp tóm tắt, nút "Post Comment" (T304 thông báo comment); bài liên quan hàng ngang (≤ setting, bỏ bài đang xem, 1 bài thì không render); 3 block, 8 setting | T304 (thông báo comment) |
| page.md | TE-9 → TE-20 | TE-9 AC2 (contact), AC5 | Page: breadcrumb, cột đọc 720, `.rte`, rỗng chỉ h1 (editor có gợi ý). Contact: template `page.contact`, 3 trường, lỗi rời trường + hộp tóm tắt, đang gửi, thành công, gửi thất bại giữ dữ liệu; aside 5 câu FAQ + link policy; 2 setting `contact-form` | T304 (page.contact) |
| 404.md | TE-9 → TE-20 | TE-9 AC2 | Block `not-found`: eyebrow, h1, câu mô tả, form search (label thật, không autofocus), "Back To Homepage", chip danh mục (link_list, ≤ 6), hàng 4 sản phẩm (collection trống thì ẩn); không popup; 4 setting | T304 (search + home) |
| password.md | TE-9 → TE-20 | TE-9 AC2 | Nền tối toàn trang; newsletter là hành động chính (PW1), form mật khẩu trong `<details>` mở sẵn khi sai; sai mật khẩu: focus vào ô, câu lỗi; email sai, đã đăng ký, thành công, đang gửi; không logo thì shop.name; setting Show newsletter tắt thì form mật khẩu mở sẵn; 4 setting | T304 (logo/shop.name) |
| gift-card.md | TE-9 → TE-20 | TE-9 AC2 | Thẻ CSS + số dư; đã dùng một phần; hết hạn / bị tắt (2 câu khác nhau, ẩn QR, Wallet, Copy); Copy Code → "Copied" 2 s + status; Print; không JS: ẩn Copy, Print, khung QR có chữ; `meta viewport`, `noindex`; không pass_url thì ẩn Wallet | T304 (QR ≥ 120) |

### AC mâu thuẫn với decisions.md
| # | AC SRS 0.4 | Sổ / spec | Đề xuất SRS 0.5 |
| --- | --- | --- | --- |
| M1 | TE-12 AC1, AC-H18, AC-H19; TE-10 AC3; mục 3 "bậc giảm 10%, 15% trong mặc định" | Sổ 11/11 TUÂN THỦ (7); audit README §2 CHẶN; ES1-T304 "tier giảm mặc định 0" | Theo ES1-T309 #2 (mặc định: 0 bậc, đo bậc trên store dev) |
| M2 | AC-H28 "Get 15% Off" cố định; AC-H5 claim mặc định | Audit README §2 ("Get 15% Off" cứng CHẶN; claim NÊN); T304 | Theo ES1-T309 #3 |
| M3 | TE-3 AC10 "ảnh"; TE-13 AC2 "gallery" | Sổ 11/11 (6): featured và quickview hiện video, YouTube/Vimeo, 3D | Sửa 2 AC: liệt kê đủ 4 loại media, bấm mới tải |
| M4 | TE-4 AC14 nhãn "Show fewer" | variant-picker, foundation §25: "Show Fewer" (Title Case nút) | Đổi nhãn trong AC14 |
| M5 | TE-1 AC2 "menu main-menu có 2 cấp" | navigation.md §3 mega A có cấp 3; audit README §2 NÊN menu 3 cấp | AC2 đổi thành tới 3 cấp |
| M6 | TE-3 AC6 + ES1-T190, T248, T303 (swatch bấm được) | Sổ CTO 10/11 M1, foundation §22 câu 2 | AC đã đúng; đóng 2 bug, gỡ TC-12, TC-33 cũ |
| M7 | TE-2 AC8 autoplay theo setting ở mọi mốc | index-mobile-a §11: dưới 80rem không tự xoay dù bật | Thêm vế "dưới 80rem không tự xoay" vào AC8 (theo ES1-T309 #1) |
| M8 | TE-9 AC3 "excerpt_or_content" không nói chỗ | Sổ 11/11 (4): card trang blog có trích đoạn, block trang chủ giữ Figma (thay B1 10/11) | Ghi rõ "trong mọi card trang blog", trang chủ không |
| M9 | requirements-map R6 "perf ≥ 60, a11y ≥ 90 (nội bộ 96/90/98)" | NFR-1 0.4 + sổ 09/11, 10/11 | Sửa map (mục dưới) |

Spec tự mâu thuẫn (Designer sửa, không đổi SRS): navigation.md §5.3 chân drawer "2 nút Currency / Language" trái LC1 sổ 11/11; collection.md §8 "> 3 màu: 3 swatch + N colors" trái VP2; figma-inventory.md hàng 1 "nền trong suốt đè hero" và "Dev FE tự suy mobile" trái sổ 10/11.

### Đề xuất cập nhật docs/requirements-map.md
| Mã R | Cột đổi | Giá trị mới |
| --- | --- | --- |
| R4 | Story | TE-1 (AC3 shopify-account, AC10 localization, Follow on Shop mới), TE-3 (quickview), TE-4 (AC17–AC20), TE-5 (AC9, AC10), TE-6, TE-8, TE-12 (AC2), TE-18 (R4.9), TE-20 (R4.4 gift card) |
| R5 | Áp dụng | Không áp dụng: sổ 11/11 KIẾN TRÚC, ADR 0004; Custom Liquid block giữ (TE-7 AC5) |
| R6 | Nội dung | Chỉ tiêu nghiệm thu NFR-1 (A11y 100, BP 100, SEO 100 ở 6 loại trang, Perf ≥ 98 desktop, ≥ 90 mobile); ngưỡng CI theo CLAUDE.md tới khi ES1-T301 chốt |
| R7 | Story | thêm TE-11 (collection.quiz), TE-19 (blog, article), TE-20 (page, contact, 404, password, gift card); bỏ TE-9 khỏi R7 sau khi tách |
| R8 | Story | TE-10, TE-12, TE-13, TE-18, TE-4 AC17; ghi nguồn sổ 11/11 (7) |
| R11 | Story | TE-1, TE-4 AC11, TE-19, TE-20 (breadcrumb JSON-LD foundation §5) |
| R12 | Story | mọi FE, TE-10 AC6–AC8, TE-18 AC8, TE-11 AC5 |
| R13 | Story | TE-1 (social rỗng mặc định, T304) |
| R14 | Story | TE-1 (favicon, T304), TE-2, TE-7; thêm cột "Bảng setting SRS" trỏ SRS 0.5 |
| R18 | Áp dụng | Tham khảo; preset cùng tên theme trong settings_data (audit C11), tên theme chờ CTO (audit README §3) |
| R20 | Story | TE-9 AC4, AC7 (dữ liệu demo), ảnh có quyền dùng (audit C13) |
| (mới) | cột | Thêm cột "ui-spec" cho mọi dòng để truy từ R → spec → story |

## Kiến thức cho _chung: thứ tự nguồn thiết kế từ 11/11

- Thiết kế đã duyệt = 28 file `docs/ui-spec/*.md` trên develop ngày 11/11/2026. Mâu thuẫn: sổ `docs/design/decisions.md` > ui-spec > SRS > figma-inventory. AGENTS.md vẫn đứng trên cả 4.
- `docs/ui-spec/index.md` (ES1-T252) đã thay bởi `index-mobile-a.md`, `index-mobile-b.md`; trang chủ 1280 ở `index-1280.md`.
- `docs/figma-inventory.md` còn 2 dòng cũ: header "trong suốt đè hero" và "Dev FE tự suy mobile". Bỏ qua 2 dòng này: header tối 80 riêng, không đè ảnh (sổ 10/11); mobile theo index-mobile-a/b.
- Dòng ĐỀ XUẤT trong ui-spec là phạm vi Dev trừ khi CTO trả lời khác ở ES1-T309 #1.

## Kiến thức cho qa: AC mới cần TC và ma trận mốc × trạng thái

- AC chưa có TC: TE-1 AC4, AC10; TE-3 AC9–AC12; TE-4 AC13–AC20; TE-5 AC8–AC10; TE-6 AC6, AC7; TE-8 AC2 (bản 0.4); TE-10 AC6–AC8; TE-11 AC5–AC8; TE-18 AC1–AC9; cộng toàn bộ AC mới của SRS 0.5.
- Mỗi AC giao diện kiểm ở 360, 768, 1280, 1920 và mỗi trạng thái spec ghi (rỗng, lỗi, đang tải, không JS). Trạng thái lỗi mạng giả bằng `route.abort` trong Playwright; không gọi Cart API thật quá ngưỡng 429 (ES1-T163, T201).
- Bỏ TE-3 TC-12, TC-33 (bấm swatch card): swatch card là chỉ báo `aria-hidden` (TE-3 AC2 0.3).
- B2B (TE-4 AC18, TE-5 AC9): store dev không bật được thì kiểm bằng mockup (ES1-T297 #1).
- AC-H3 so ảnh chỉ ở 1920; 1280/768/360 đo kích thước khối theo bảng số spec (chờ ES1-T309 #4).

## Kiến thức cho techlead: ticket lệch thiết kế đã duyệt

- Đóng ES1-T248, ES1-T303: hành vi bấm swatch card bị bỏ từ SRS 0.3.
- Viết lại body ES1-T128, T129, T130, T110, T111, T98, T147, T156 theo cột "AC thiếu" bảng trên trước khi chạy; T147 chờ ES1-T309 #2.
- ES1-T190, T118, T184, T191 đã đóng nhưng code theo AC cũ (swatch 44 px, testimonials lưới 1280, hàng ngang chỉ 1920): cần ticket FE sửa.
- TE-18 (popup marketing, 9 AC) chưa có ticket FE/BE nào; TE-1 AC4, AC10, TE-3 AC9–AC12, TE-4 AC13–AC20 cũng chưa có.
- Không tách lại các mục đã ở ES1-T304 (cột "T304").

## Kiến thức cho dev-fe: quy tắc chung áp mọi màn vòng 3

- Header tối 80 ở mọi trang: bỏ điều kiện `body:has(.slideshow)` và `[data-header-overlay]` (foundation §21).
- Swatch card: `aria-hidden="true"`, không focus, số màu nằm trong tên link card (", 3 colors"); không vùng bấm 44 px.
- Tên sản phẩm, collection, bài viết hiện đủ, không clamp, không "…" ở card, lưới, menu, mini cart, predictive.
- Nút thương hiệu (accelerated checkout, Shop Pay Installments, Follow on Shop, Apple Wallet) chỉ chỉnh bằng biến CSS chính thức (foundation §27); payment icons qua `payment_type_svg_tag`, full color.
- Trạng thái đang tải không dùng opacity trên chữ; dùng skeleton đúng kích thước + `aria-busy`.
- Mỗi lớp (dialog, drawer, popover) gắn `data-layer` để module hàng đợi popup đếm (layers.md §4).

## Kiến thức cho dev-be: hành vi chung cần 1 module

- Một module lớp (layers.md §4) quyết: popup tự mở chờ khi có lớp mở, banner consent, ô nhập đang focus; thanh đáy chỉ bật/tắt `html[data-bottom-bar]`, không đo; `--bundle-bar-height` đo bằng ResizeObserver.
- Đổi biến thể ở PDP và quickview dùng chung 1 luồng theo option value (`option_values=`), hủy request cũ bằng AbortController, chỉ áp kết quả lần bấm cuối (TE-4 AC15).
- Countdown: Liquid in số lúc render, JS chỉ đếm tiếp; trang cache đã quá hạn thì chuyển ngay "This sale has ended" (countdown.md §5).
- Stepper giỏ (drawer, cart page): gửi sau 300 ms không bấm thêm; sau 422 trả số server và khoá +.

## Kiến thức cho designer: 3 chỗ spec tự mâu thuẫn

- navigation.md §5.3 chân drawer: thay "2 nút Currency / Language" bằng 1 hàng localization gộp (LC1, localization.md §4.4).
- collection.md §8: số chấm màu card theo VP2 (≤ 4 hiện hết, > 4 hiện 3 + "+N").
- `docs/ui-spec/index.md`: thêm dòng đầu "ĐÃ THAY bởi index-mobile-a.md, index-mobile-b.md" (index-mobile-a §14).

## Kiến thức cho writer: setting mới cần tài liệu merchant

- Setting mới từ ui-spec (khi SRS 0.5 duyệt): `popular_searches` (theme), header `menu_collection_images`, `menu_featured_product`, Search style, Popular collections, Trending products; cart-page 7 setting; mini cart recommendations, empty cart products, show vendor in quick view; product-form assurance 1–3, product-details spec label 1–4; blog-articles 7, article-main 5, related-articles 3, not-found 4, password-hero 4, contact-form 2.
- TE-10 AC5 đếm "16/16 block có docs/merchant": số block tăng, SRS 0.5 đổi thành "mọi block trong Theme map AGENTS.md".

## Sửa skill srs-template: đường dẫn nháp và bảng ui-spec

Đề xuất (CTO sửa bằng PR, BA không sửa `.claude/`):
- Đổi `docs/srs-draft/<module>.md` thành `drafts/ba/<ticket>/srs.md`; hook chặn BA ghi `docs/`, Orchestrator chép sang `docs/srs.md` (đang làm vậy từ ES1-T294).
- Thêm mục bắt buộc "Bảng ui-spec → AC": mỗi file `docs/ui-spec/*.md` một dòng (ui-spec | story | AC có | AC thiếu | ticket); không file ui-spec nào không có story.
- Thêm mục "Bảng setting" gom mọi setting mới của các spec vào một bảng duy nhất mỗi story (block | setting id | label | kiểu | default | giới hạn | spec §).

## Sửa skill traceability-matrix: thêm cột ui-spec và mốc

Đề xuất:
- Đường dẫn: `drafts/ba/<ticket>/traceability.md` (như ES1-T294, T299), không `docs/traceability.md`.
- Bảng: FR/AC | Story | ui-spec § | Mốc (360/768/1280/1920) | Trạng thái (mặc định/rỗng/lỗi/đang tải/không JS) | TC | Mã R | Trạng thái. AC giao diện thiếu cột Mốc hoặc Trạng thái thì `traceability.py` báo.
- Chấp nhận mã AC-H* và TC-H* (trang chủ) bên cạnh FR-*.

## Sửa skill user-story-ac: AC giao diện ghi mốc và trạng thái

Đề xuất thêm 2 quy tắc:
- AC giao diện nêu mốc áp dụng (360, 768, 1280, 1920 hoặc "mọi mốc") và mọi trạng thái spec có (rỗng, lỗi, đang tải, không JS); thiếu thì ghi lý do.
- Story > 8 point hoặc > 12 AC thì tách (TE-9 hiện gánh 7 template trong 2 AC).

## Ticket cần tạo

- BA: SRS 0.5 phần trang chủ và sản phẩm: AC thiếu của TE-2, TE-3, TE-4, TE-7, TE-12, TE-13, TE-15, TE-16, TE-17 theo bảng ui-spec (index-mobile-a/b, index-1280, product, variant-picker, product-shopify-features, countdown, mini-cart-quickview), sửa M1, M2, M3, M4, M6, M7 theo ES1-T309 | BA | N point (techlead ước lượng)
- BA: SRS 0.5 phần khung, giỏ, collection, tìm kiếm, lớp: AC thiếu của TE-1 (foundation, navigation, Follow on Shop), TE-5 (cart, mini cart), TE-6 (collection, list-collections), TE-8 (search, predictive-search), TE-10 (layers §3), TE-11, TE-18; bảng setting gộp; sửa M5, M8 | BA | N point (techlead ước lượng)
- BA: SRS 0.5 story mới TE-19 Blog và bài viết (blog.md, article.md) và TE-20 Trang phụ: page, contact, 404, password, gift card (page.md, 404.md, password.md, gift-card.md), tách khỏi TE-9 AC2, AC3; gắn R4.4, R7.6, R7.7, R7.9, R11 | BA | N point (techlead ước lượng)
- BA: cập nhật `docs/requirements-map.md` (bảng mục Ảnh hưởng, M9) và `drafts/ba/<ticket>/traceability.md` bản 0.5 có cột ui-spec, mốc, trạng thái | BA | N point (techlead ước lượng)
- QA: test case + spec e2e cho AC chưa có TC của SRS 0.4: TE-4 AC13–AC20 (bộ chọn 2048 biến thể, countdown, B2B mockup, selling plan, pickup), desktop + Pixel 7 + nojs | QA | N point (techlead ước lượng)
- QA: test case + spec e2e TE-3 AC9–AC12 và TE-5 AC8–AC10 (quickview, ghi chú drawer, quantity rule giỏ, selling plan giỏ) | QA | N point (techlead ước lượng)
- QA: test case + spec e2e TE-18 AC1–AC9 (popup marketing, hàng đợi, consent) và TE-10 AC6–AC8 (Inbox, consent, màn thấp) | QA | N point (techlead ước lượng)
- QA: test case + spec e2e TE-1 AC4, AC10, TE-6 AC6, AC7, TE-8 AC2 (0.4), TE-11 AC5–AC8 (announcement, localization, phân trang chung, quiz popup) | QA | N point (techlead ước lượng)
- QA: test case + spec e2e cho story mới TE-19, TE-20 sau khi SRS 0.5 duyệt (blog, article, page, contact, 404, password, gift card ở 4 mốc, mọi trạng thái) | QA | N point (techlead ước lượng)
- QA: test case đo kích thước khối trang chủ ở 1280, 768, 360 theo index-1280 §1, index-mobile-a/b (sau ES1-T309 #4); bỏ TE-3 TC-12, TC-33 | QA | N point (techlead ước lượng)
