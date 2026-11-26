KHÔNG CHẮC: (1) nhóm store chưa chạy (phiên QA không có PREVIEW_URL/STORE_PASSWORD, chưa có PR cho store-tests); chỉ TC-30..32 chạy local, 3/3 pass. (2) Số đo AC-H37 SRS lệch docs/ui-spec/index-1280.md sau ES1-T567 ở 7 ô ảnh; spec mặc định theo SRS, hỏi ES1-T611. (3) Blog: fixture 5 bài, AC-H37 ghi 4 card; hỏi ES1-T611. (4) Spec chưa type-check bằng tsc (lệnh bị chặn chờ duyệt); `playwright --list` nạp được 17 test.

# ES1-T345 — TE-17-R2-QA1: trang chủ 1280 trên store dev đã áp fixture
Nguồn: docs/srs.md#TE-17 (AC-H1–AC-H5, AC-H37, AC-H36), docs/srs.md#TE-2 AC7, docs/srs.md#TE-7 AC1, drafts/techlead/ES1-T307/task-split.md D10 + dòng TE-17-R2-QA1, docs/ui-spec/index-1280.md §0–§2, ticket ES1-T345, mockup drafts/designer/ES1-T293/index.html (1280).
Spec: tests/e2e/ES1-T345.spec.ts. Fixture: tests/fixtures/home-figma.json (ES1-T331). Mọi TC store chạy project desktop, viewport 1280 × 800, `prefers-reduced-motion: reduce`.
Phạm vi: 1280. 1920 giữ ES1-T176 (so ảnh AC-H3); 360/768 thuộc TE-17-R2-QA2. AC-H3 ở 1280 đo bằng bảng số AC-H37 (ES1-T309 #4, không so pixel).
Không trùng: ES1-T331 (fixture khớp schema, marker 4 mốc, TC-20 text/href/testid theme mới cài), ES1-T341/T342 (FE đo từng khối trên `?view=te7`, `?view=te13-states`).

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC-H1 | `/` trên store dev đã áp fixture ES1-T331, 1280 × 800 | đọc 16 testid hàng theo fixture.rows (header → footer), lấy y | 16 hàng đều hiện, cao > 40; y tăng dần đúng thứ tự inventory; `main [data-testid^=container-]` không có testid ngoài 16 hàng | E2E | P1 |
| TC-02 | AC-H2 | như TC-01 | lấy mọi setting text/textarea/richtext/inline_richtext của block trong fixture (trừ `*_tag` quiz, `countdown_label` khi chưa có đồng hồ = giá trị động E8; footer chỉ khi setting footer đã áp, ES1-T402), bỏ thẻ HTML, gộp khoảng trắng | mỗi chuỗi có trong textContent của đúng hàng (testid hàng), so không phân biệt hoa thường (= sau text-transform); danh sách thiếu = [] | E2E | P1 |
| TC-03 | AC-H3, AC-H37 | như TC-01 | đo bounding box (toạ độ trang) 1 lần mở trang, expect.soft từng ô | lệch ≤ 2 px: nội dung x 20 rộng 1240; hero track x 0, 1280 × 589, bo 16, heading x 20, nút next 52 cách phải 24, cách đáy 24, prev–next cách 8 cùng hàng; collection-card 271, ảnh 271 × 177; level-card 397; product-card bestseller 292; quiz 1240, quiz-form 608; shop-the-look-image 819 × 714, rows 397, note cao 84, row cao 80; make fitness cao 640; bundle item 222, panel 503; featured ảnh x 20, 580 × 566, title x 680; video-card 264; testimonial-item 360, ảnh 360 × 213; why ảnh 600 × 571; blog 4 bài 292 × 389 (≥ 5 bài: ≈ 271, annotation); faq-image 442 × 471, faq-stat-1 225 × 148; trang không cuộn ngang | UI | P1 |
| TC-04 | AC-H4 | như TC-01 | đọc computed style | display hero, intro, make fitness, why: font-size 80, line-height 80 (HD1, R2); h2 7 khối 48/56; nút tròn slideshow/collection/testimonials/video 52 × 52; tab bestseller cao 40 (R3); eyebrow why = màu token `--color-muted-on-dark` đã resolve; chữ trong `main` ≤ 2 họ font (sổ 30/10) | UI | P2 |
| TC-05 | AC-H5 | như TC-01 | đọc text hàng 2, 4, 10, 15 và body | slide 1 chứa "Trusted by 10,000+ athletes"; faq-stat-1 "360+", faq-stat-2 "12"; level-card-count "24 Products"; rating count "341"; body innerText 0 lần "Add a ", "Customer name", "Lorem ipsum" | E2E | P1 |
| TC-06 | AC7 | TE-2; fixture 2 slide, 1280, JS bật | đọc điều khiển; bấm Next; focus Previous + Enter | slideshow-next, -prev hiện, có tên truy cập; slideshow-dots ẩn; ban đầu slide 1 không inert, slide 2 inert; sau Next slide 1 inert, slide 2 không inert và x slide 2 = x track ± 2; Enter trên Previous về slide 1; autoplay mặc định tắt nên slideshow-pause ẩn | E2E | P1 |
| TC-07 | AC7 | TE-2 không JS; như TC-06, `javaScriptEnabled: false` | đọc style track, cuộn track tới cuối | track `scroll-snap-type` trục x, `overflow-x` auto/scroll; mũi tên ẩn; slide 2 không inert; sau cuộn slide 2 vào khung ± 2 | E2E | P1 |
| TC-08 | AC1 | TE-7; testimonials 4 mục (fixture), 1280 | cuộn tới khối, chờ `data-enhanced`; đọc hàng; rê Next; bấm Next | 4 card cùng 1 hàng, 3 trọn + card 4 lộ ≥ 25%; list `scrollbar-width: none` hoặc không chiếm chiều cao; không `data-static`; nav nằm trên hàng (đầu khối); next 52, nền rgb(255,255,255), viền rgb(229,229,229) (#E5E5E5); prev `aria-disabled="true"` ở đầu hàng; carousel-progress hiện, cao ≤ 4; hover next nền = `--color-accent`; bấm Next scrollLeft > 0, prev `aria-disabled="false"` | E2E | P1 |
| TC-09 | AC1 | TE-7, R4 index-1280; như TC-01 | đo hàng danh mục, video ở scrollLeft 0 | danh mục 4 card trọn + card 5 lộ ≥ 25%, card 271; video 4 trọn + card 5 lộ ≥ 25%, card giữ 264; cả 2 không `data-static` | UI | P2 |
| TC-10 | AC1 | TE-7 hàng vừa khung; blog fixture; testimonials bỏ còn 1 mục trong DOM rồi đổi bề viewport 1279 → 1280 để ResizeObserver chạy lại (dựng trạng thái, không đổi setting store) | đọc root, nav, progress | blog ≤ 4 bài: `data-static`, nút và progress ẩn (≥ 5 bài: hàng ngang, annotation, ES1-T611); testimonials 1 mục: `data-static`, prev/next ẩn, progress ẩn | E2E | P2 |
| TC-11 | AC1 | TE-7 a11y; như TC-08 | focus list, phím End; chạy axe trên container hero, collection-list, testimonials | list `tabindex="0"`, có tên truy cập; progress `aria-hidden="true"`; End cuộn scrollLeft > 0; axe 0 violation serious/critical | a11y | P2 |
| TC-12 | AC7, AC1 | TE-2 AC7 + TE-7 AC1 mất mạng; `page.route` abort `assets/slideshow.js`, `assets/scroll-buttons.js` | mở `/`, cuộn hero và hàng review | mũi tên hero ẩn, track hero vẫn cuộn ngang; testimonials không `data-enhanced`, nút ẩn, card giữ 360, bàn phím End vẫn cuộn | E2E | P2 |
| TC-13 | AC1 | TE-7 không JS; JS tắt | đọc hàng review | nút ẩn; 3 card trọn + card 4 lộ ≥ 25%; card 360 | E2E | P2 |
| TC-20 | AC3 | D10, AC-H36 phần 1280; theme preview không áp fixture (`FRESH_THEME_ID`), 1280 | mở `/?preview_theme_id=…`, cuộn hết 16 hàng | HTML 0 link `/collections|products|blogs/figma-*`, 0 ảnh `efx-*.jpg|png|svg|webp`; text 0 chuỗi trong fixture.fresh_install.forbidden_text (claim, "Add a ", "Customer name"); 0 bundle/shop-the-look discount row, 0 testimonial-verified, 0 featured-product-countdown; 0 phần tử `*-heading|-eyebrow|-body|-button` rỗng mà vẫn render; 0 console error (bỏ qua monorail, otlp, web-pixels, trekkie, shop.app, Cloudflare, 429) | E2E | P1 |
| TC-30 | AC3 | D10; repo (tĩnh) | đọc templates/index.liquid bỏ comment/doc | 0 handle `'figma-*'`, 0 `efx-*`, 0 `images[`; 0 chuỗi claim | tĩnh | P1 |
| TC-31 | AC3 | D10; repo (tĩnh) | đọc locales/en.default.json | 0 chuỗi "Trusted by 10,000+", "360+", "12 Warranty", "Get 15% Off", "1 Year Warranty" | tĩnh | P1 |
| TC-32 | AC3 | D10; repo (tĩnh) | đọc schema mọi blocks/*.liquid | `tier_n_percent` default 0 hoặc không có; không default chữ nào chứa chuỗi claim | tĩnh | P1 |

AC3 trong cột AC là TE-10 AC3 (R8 nội dung mẫu), mục TE-17 của SRS dẫn chiếu cho D10 ("R8 (AC-H5, AC-H36, xem TE-10 AC3)").
Ánh xạ AC → TC: AC-H1 TC-01 · AC-H2 TC-02 · AC-H3 TC-03 · AC-H4 TC-04 · AC-H5 TC-05 · AC-H37 TC-03 · TE-2 AC7 TC-06, TC-07, TC-12 · TE-7 AC1 TC-08..TC-13 · D10 TC-20, TC-30..TC-32.

## Case biên (ngoài AC)
- Rỗng: TC-10 (hàng 1 review → lưới tĩnh), TC-20 (theme mới cài, setting chữ rỗng không render khung).
- Tối đa: TC-09 (hàng 5 danh mục, 6 video vượt khung → lộ card kế); blog ≥ 5 bài ở TC-03/TC-10.
- Mất mạng: TC-12 (route.abort 2 module JS).
- 360px: ngoài phạm vi, TE-17-R2-QA2 (AC-H38, chấm hero 44 × 44, vuốt).
- Keyboard: TC-06 (Enter trên Previous), TC-11 (End trên hàng review), TC-12.
- Screen reader: TC-06 (tên truy cập mũi tên, inert slide ẩn), TC-11 (nhãn list, progress aria-hidden, axe).
- Không JS: TC-07, TC-13.
- Editor (`design_mode`) vs storefront: placeholder chỉ trong editor; TC-05, TC-20 kiểm storefront 0 chữ hướng dẫn. Editor không tự động hoá được (ES1-T428: editor cổ điển không hiện block của templates/index.liquid).
- Merchant chưa chọn resource: TC-20 (theme mới cài, không collection/product/blog nào được chọn).
- Store chưa áp fixture: mọi TC store `test.skip` có lý do qua `skipUnlessFixture` (2 sentinel), không báo đạt.
- Footer chưa áp setting layout (ES1-T402, ES1-T428): TC-02 bỏ footer, ghi annotation `footer-fixture-pending`.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- Fixture tests/fixtures/home-figma.json: collection `figma-cat-*` (5), `figma-level-*` (3), `figma-tab-*` (4), `figma-bundle`, `figma-setup`; sản phẩm `figma-ativafit-lava-featured` (metafield reviews.rating 4.9, rating_count 341, custom.spec_1..4, custom.sale_ends_at now+23h); blog `figma-blog` 5 bài; ảnh `efx-*` trên Content > Files; 2 slide, 4 review, 5 FAQ.
- Theme không fixture: biến `FRESH_THEME_ID` (preview push từ repo, không áp fixture, drafts/qa/ES1-T331/content-fixture.md mục 5).
- Chạy tĩnh local: `npx playwright test -c drafts/qa/ES1-T345/static.config.ts -g "@static"`.
- Chạy store: `PREVIEW_URL=… STORE_PASSWORD=… [FRESH_THEME_ID=…] [AC_H37_SOURCE=t567] npx playwright test tests/e2e/ES1-T345.spec.ts --project=desktop`.

## KHÔNG CHẮC
- AC-H37 SRS và index-1280.md sau ES1-T567 lệch ở 7 ô: hero 589/640, ảnh danh mục 177/180, shop the look 714/819, featured 566/580, review 213/203, why 571/600, FAQ 442 × 471/435. ES1-T580 (PR #323, chưa merge) đổi CSS sang ES1-T567: merge rồi thì TC-03 đỏ ở 7 ô cho tới khi SRS chốt. Hỏi BA ES1-T611; `AC_H37_SOURCE=t567` đổi bộ số, không nới ngưỡng.
- Blog: fixture articles_to_show 5, AC-H37 "4 card 292 × 389"; spec đo theo số bài thực tế (annotation). Hỏi ES1-T611.
- TC-04 h2 48/56: lấy theo index-1280 §0 "h2 khối 48/56" cho 7 heading; quiz, shop the look, bundle chưa đưa vào vì ui-spec không ghi riêng cỡ h2 ở 1280.
- TE-2 AC7 vuốt (cảm ứng) không kiểm ở 1280 desktop; thuộc TE-17-R2-QA2 (360, project mobile).
