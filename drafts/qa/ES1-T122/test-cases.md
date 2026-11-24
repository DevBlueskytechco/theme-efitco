KHÔNG CHẮC: spec chưa chạy trong phiên viết (không có PREVIEW_URL, STORE_PASSWORD; lệnh npx playwright cần duyệt) → kết quả lấy từ CI store-tests của PR, chưa báo đạt. Các điểm chưa chắc khác ở mục KHÔNG CHẮC cuối file.

# ES1-T122 — TE-7-QA1: 4 block nội dung (testimonials, FAQ, image with text, multicolumn) và Custom Liquid
Nguồn: docs/srs.md#TE-7 (bản 0.5: AC1–AC7), ticket ES1-T122 (body + comment techlead 05/11, 06/11; comment CTO 11/11 "viết test theo SRS 0.5/ui-spec mới"), drafts/techlead/ES1-T307/task-split.md (TE-7-R2-FE1, BE1, TE-17-R2-FE3, D10), docs/ui-spec/index-mobile-a.md §8, index-mobile-b.md §4, §5, §7, docs/design/decisions.md (foundations-12: disabled không dùng opacity), ADR 0011 mục 3. Phạm vi AC: `drafts/qa/ES1-T122/ac-scope.md`.
Spec: `tests/e2e/ES1-T122.spec.ts` (tên theo key ticket, Orchestrator chỉ định; body ticket ghi TE-7.spec.ts). Nhóm tĩnh chạy không cần store: `drafts/qa/ES1-T122/pw-static.config.mjs`.

Gộp (ticket: "gộp spec dev ES1-T118..ES1-T121 thành 1 file"): ES1-T122.spec.ts là spec cấp story, kiểm mỗi AC ở 4 mốc + Pixel 7 + không JS. Không xoá ES1-T118..T121 trong lượt này (file của ticket khác, đang là regression trên develop). Chi tiết số đo đã có thì không lặp:
- ES1-T342.spec.ts: why 360/768/1280 (360 × 360, 768 × 576, ảnh nhỏ 168/100), FAQ 360/768/1280 (ô số 142/285/225, ảnh 320/553/442). TE-7 AC7 phần số đo.
- ES1-T179.spec.ts: AC-H24 (1920, 4 card 456, bàn phím tới hết card 4), AC-H25 (fixture, 4 review, card 2 có 4 sao, Verified tắt). Không đưa vào ac-scope của ticket này.
- ES1-T335.spec.ts: hành vi scroll-buttons.js (ResizeObserver, RTL, listener, focus rời nút tắt).
- ES1-T180.spec.ts: copy hàng 8, 13 (AC-H5). Lưu ý: ES1-T180 "AC-H5 hàng 8, 13 chưa cấu hình: đúng bảng ES1-T173" trái TE-7 AC5 (0.5) → xem BUG-ES1-T122-01.
Đề xuất (không làm ở đây): sau khi ES1-T122 xanh trên CI, Tech Lead xoá test trùng trong ES1-T118..T121 để giảm request.

Dữ liệu: biến thể chạy trên `/?view=te7` (templates/index.te7.liquid, ảnh/sản phẩm từ `collections.all`); trang chủ `/` chạy 2 nhánh: store dev đã áp fixture ES1-T331 (sentinel `support/home-fixture.ts`) hoặc theme mới cài (`FRESH_THEME_ID`, hoặc `/` khi chưa áp fixture). Ca thiếu ảnh/sản phẩm thì `test.skip` có lý do, không coi là đạt.
Mốc: 360, 768, 1280, 1920 bằng `setViewportSize` ở project desktop (cao 900; 1920 cao 1080), `reducedMotion: reduce` khi đo. Project mobile (Pixel 7, 412 px, cảm ứng) chạy nhóm "Pixel 7" và nhóm không JS. Sai số đo 2 px (ES1-T309 #4).
Mọi test có trang: 0 console error, 0 pageerror (afterEach; bỏ qua script nền tảng Shopify monorail, web-pixels, shop.app, otlp-http, 429 tài nguyên — ES1-T121 AC4).
Bug đã biết chạy `test.fail(true, '<ticket bug>')`: bug sửa xong test báo "unexpected pass" → bỏ dòng test.fail.

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | `/?view=te7`, band `te7-testimonials` (4 mục), `-one` (1), `-six` (6); 360, 768, 1280, 1920 | Render | Đúng 4 / 1 / 6 `testimonial-item`; mọi card cùng 1 hàng (top lệch ≤ 1); `testimonials-list` display flex, nowrap, overflow-x auto, `scrollbar-width: none` (không thanh cuộn trình duyệt); trang không cuộn ngang | E2E | P1 |
| TC-02 | AC1 | Như TC-01, 768, 1280, 1920, có JS | Cuộn tới band, chờ `data-enhanced` | `testimonials-prev`, `-next` hiện, 52 × 52 (±1), tên "Previous reviews" / "Next reviews", nằm ở đầu khối (đáy nút ≤ đỉnh hàng); nút bật: nền `--color-background`, viền `--color-border` (#E5E5E5); rê chuột nút next (desktop) → nền `--color-accent`; `carousel-progress` hiện, cao ≤ 4 | E2E | P1 |
| TC-03 | AC1 | 360, có JS | Cuộn tới band, cuộn hàng sang phải | `testimonials-nav` không hiện; `carousel-progress` hiện; `--scroll-pos` của thanh tiến trình tăng sau khi cuộn | E2E | P1 |
| TC-04 | AC1 | 1280, band 4 mục và 6 mục | Đo card | 3 card đầu nằm trọn trong 1280; card 4 lộ ≥ 25% bề rộng card và không trọn | E2E | P1 |
| TC-05 | AC1 | Band 1 mục (hàng vừa khung), 4 mốc, có JS | Chờ `data-enhanced` | Gốc `testimonials` có `data-static`; nút prev/next không hiện, không vào thứ tự Tab; `carousel-progress` không hiện | E2E | P1 |
| TC-06 | AC1 | Band 4 mục, 6 mục | Đọc từng mục | Mỗi mục có quote hoặc tên; sao `role="img"` 5 svg `aria-hidden`; số sao đầy 0 (`te7-six-1`), 4 (`te7-figma-2`), 5 (`te7-figma-1`); ảnh tuỳ chọn: `te7-six-2` không `testimonial-image`, `te7-figma-1` có | E2E | P2 |
| TC-07 | AC1 | Pixel 7 (cảm ứng), có JS | Vuốt ngang 220 px trên hàng (CDP `Input.dispatchTouchEvent`: touchStart, 10 touchMove, touchEnd; điểm chạm phải nằm trong hàng) | `scrollLeft` > 0; nút không hiện; thanh tiến trình hiện | E2E | P1 |
| TC-08 | AC2 | `/?view=te7`, FAQ 1, 3, 5, 10 câu | Render | Đúng 1 / 3 / 5 / 10 `faq-item`; mỗi mục là `<details>`, câu hỏi là `<summary>` chứa `<h3>`; câu không có trả lời không có `faq-answer` | E2E | P1 |
| TC-09 | AC2 | 360, 1280, có JS | Tab tới câu 3 (Tab thật từ phần tử trước), Enter, Enter, Space, Space | Câu hỏi nhận focus, `:focus-visible`, outline ≠ none, dày > 0; Enter mở, Enter đóng, Space mở, Space đóng | E2E/a11y | P1 |
| TC-10 | AC2 | Có JS | Đọc cây accessibility Chromium (CDP) trước và sau khi mở câu 2 | Câu 1 `expanded=true`, câu 2 `false`; sau khi mở câu 2: câu 1 `false`, câu 2 `true`; tên nút là chữ câu hỏi | a11y | P1 |
| TC-11 | AC2 | `allow_multiple` tắt (`te7-faq`) / bật (`te7-faq-multiple`) | Mở câu 2 | Tắt: chỉ 1 `details[open]`, mọi câu cùng `name`; bật: câu 1 và 2 cùng mở, không `name` | E2E | P1 |
| TC-12 | AC2 | Không JS (desktop 1280 và Pixel 7) | Bấm câu 2, Enter/Space câu 3, bấm câu 2 band nhiều mở | Như TC-09, TC-11 | E2E nojs | P1 |
| TC-13 | AC3 | `te7-iwt-left`, `te7-iwt-right`, 1280, 1920 | Render | Left: ảnh chính bên trái chữ (mép phải ảnh ≤ mép trái chữ); right: ảnh bên phải chữ | E2E | P1 |
| TC-14 | AC3 | Như TC-13, 360, 768 | Render | Cả left và right: ảnh trên, chữ dưới (đỉnh chữ ≥ đáy ảnh − 1); ảnh rộng bằng viewport (±2) | E2E | P1 |
| TC-15 | AC3 | `te7-iwt-left`, 4 mốc | Render | Có `image-with-text-heading` là `<h2>`, `image-with-text-body` có `<p>`, `image-with-text-button` là link hiện, href `/collections/all` (mặc định), cao ≥ 44 | E2E | P1 |
| TC-16 | AC3 | `te7-iwt-no-image` (chưa chọn ảnh chính), 1280 | Render | Không `image-with-text-image`, không `image-with-text-image-placeholder` trên storefront; khối chữ rộng ≥ 90% khối | E2E | P2 |
| TC-17 | AC4 | `te7-multicolumn-two`, `-three`, `-four`; 4 mốc | Render | 360: 1 cột (n hàng); 768: 2 cột; 1280, 1920: n cột 1 hàng; trang không cuộn ngang | E2E | P1 |
| TC-18 | AC4 | Cột icon (`te7-mc-two-1`), cột ảnh (`te7-mc-three-1`) | Render | Mỗi cột có icon hoặc ảnh (không cả hai), `multicolumn-column-heading` h3, `multicolumn-text`, `multicolumn-link` href tới `/collections/all` hoặc link đã đặt `/collections` | E2E | P1 |
| TC-19 | AC5 | Schema 8 block (`testimonials`, `testimonial-item`, `faq`, `faq-item`, `image-with-text`, `multicolumn`, `multicolumn-column`, `custom-liquid`) | Đọc setting kiểu text, textarea, richtext, inline_richtext, html, liquid | Không setting chữ nào có `default` khác rỗng (ADR 0011 mục 3: "setting chữ default rỗng, rỗng thì ẩn") — BUG-ES1-T122-02 | Tĩnh | P2 |
| TC-20 | AC5 | `templates/index.liquid`, locale, fixture `tests/fixtures/home-figma.json` | Lấy giá trị locale của mọi `default_*` truyền cho 4 block TE-7 trong index | Không giá trị nào trùng copy mockup (chữ của 4 block trong fixture), không Lorem — BUG-ES1-T122-01 | Tĩnh | P2 |
| TC-21 | AC5 | Theme mới cài (`FRESH_THEME_ID`, hoặc store chưa áp fixture), 360, 1920 | Mở `/` | Band `home-testimonials`, `home-faq` không render; 4 band TE-7 không chứa copy mockup của fixture, không "lorem", "Add a", "Customer name"; không `*-placeholder`; không `testimonial-verified` — BUG-ES1-T122-01 | E2E | P1 |
| TC-22 | AC5 | `/?view=te7` | Render band thiếu chữ | Eyebrow rỗng thì không có eyebrow (`te7-iwt-banner`: 0 `image-with-text-eyebrow`); band toàn rỗng không render: `te7-iwt-empty`, `te7-multicolumn-empty`, `te7-testimonials-empty`, `te7-faq-empty`, `te7-custom-liquid-empty`; 0 placeholder | E2E | P1 |
| TC-23 | AC5 | `blocks/custom-liquid.liquid`, `templates/index.liquid`, `/`, `/?view=te7` | Đọc schema, template; render | Schema có setting `type: liquid`; index.liquid không gọi `custom-liquid`, `multicolumn` (CR-5); `/` có 0 `custom-liquid`, 0 `multicolumn`, không band `home-custom-liquid`, `home-multicolumn`; te7: Custom Liquid in "Custom Liquid runs on {shop.name}", không còn `{{` | Tĩnh/E2E | P1 |
| TC-24 | AC6 | Band 4 mục có ảnh, 4 mốc | Đo card và ảnh | 360: 272 (ảnh 272 × 161), mép card 2 trong khung; 768: 307 (307 × 182); 1280: 360 (360 × 213); 1920: 456 (456 × 270); ±2 | E2E | P1 |
| TC-25 | AC6 | `te7-figma-1` (có Verified), 4 mốc | Đo tên, Verified, sao | 360, 768 (dưới 80rem): sao nằm hàng riêng dưới tên; 1280, 1920: tên, Verified, sao cùng 1 hàng (tâm dọc lệch ≤ 4) | E2E | P2 |
| TC-26 | AC6 | Band 4 mục, 6 mục, 4 mốc | Đo chiều cao card | Card trong 1 hàng cao bằng nhau (lệch ≤ 1) | E2E | P2 |
| TC-27 | AC6 | `te7-six-2` (không ảnh), `te7-six-3` (không sản phẩm), `te7-six-4` (không cả hai) | Render | Không ảnh: phần thân bắt đầu ở đỉnh card (≤ 1); không sản phẩm: không `testimonial-product`, không phần tử có viền trên trong thân card (không gạch ngăn) | E2E | P2 |
| TC-28 | AC6 | Sao 0, 4, 5 | Đọc tên truy cập | `role="img"`, tên "{n} out of 5 stars" — BUG-ES1-T122-04 (hiện "Rated {n} out of 5") | a11y | P3 |
| TC-29 | AC6 | 1280, band 4 mục, có JS, đầu hàng / cuối hàng | Đọc nút | Đầu hàng: prev `aria-disabled="true"`, next không; cuộn tới cuối: next `aria-disabled="true"`; nút tắt vẫn hiện, giữ chỗ | E2E/a11y | P1 |
| TC-30 | AC6 | Như TC-29 | Đọc màu nút tắt | `opacity` 1; viền `--color-border`; icon `--color-muted-light`; nền giữ `--color-background` (sổ 21/11, foundations-12) — BUG-ES1-T122-03 | E2E | P3 |
| TC-31 | AC6 | 4 mốc, band 4 mục | Tab thật tới hàng, ArrowRight | Hàng là `<ul>` `aria-label="Customer reviews"` `tabindex="0"`; hàng nhận focus, `:focus-visible`; `scrollLeft` tăng | E2E/a11y | P1 |
| TC-32 | AC7 | `te7-iwt-left` (dải tối), 360, 768 | Render | Ảnh lớn trên chữ; eyebrow màu `--color-muted-on-dark` | E2E | P1 |
| TC-33 | AC7 | `te7-iwt-left`, 360 / 768 | Cuộn tới band, chờ ảnh hiện tải xong | 360: 2 ảnh nhỏ không hiện và chưa tải (`naturalWidth` 0); 768: 2 ảnh nhỏ hiện | E2E/perf | P1 |
| TC-34 | AC7 | `te7-faq`, 360, 768 | Render; mở câu 2 | Accordion nằm trước nhóm ảnh; hàng câu hỏi ≥ 56; icon +/− cùng màu chữ câu hỏi: đóng `--color-muted`, mở `--color-foreground` | E2E | P1 |
| TC-35 | AC7 | `te7-d1-faq` (show_stat_2 tắt, có chữ mẫu), `te7-faq-one` (không ô số), `te7-faq-ten` (chỉ ô 1) | Render | Ô số chỉ render khi setting bật và có chữ: d1 có `faq-stat-1`, không `faq-stat-2`; one 0 ô; ten chỉ ô 1 | E2E | P1 |
| TC-36 | AC7 | `te7-iwt-banner` (Make fitness, 3 ảnh), 360 / 768 | Cuộn tới band, chờ ảnh | 360: đúng 2 ảnh nhỏ hiện, 1 ảnh không hiện và chưa tải; 768: 3 ảnh hiện; ảnh hiện không đè heading, body, nút; `te7-iwt-banner-one` (1 ảnh): đúng 1 ảnh render | E2E | P1 |
| TC-37 | AC7 | `blocks/image-with-text.liquid` | Đọc Liquid | Nút chỉ in trong `if button_label != blank` (`button_label` rỗng thì không có nút); ảnh nhỏ rỗng bị bỏ (`if accent_image_N != blank`) | Tĩnh | P2 |
| TC-38 | AC1, AC2, AC3, AC5 | `/`, 1280 và 360 | Render | Nhánh fixture: 4 band TE-7 có mặt theo thứ tự fixture (hàng 8 inspiration < 12 testimonials < 13 why-choose < 15 faq) và đúng vị trí giữa band hàng 7 và hàng 16; nhánh theme mới cài: chỉ band có nội dung; mọi band TE-7 có mặt đều cao > 0 và có ít nhất 1 phần tử hiện (không band trống) | E2E | P1 |
| TC-39 | AC1, AC2 | `/` và `/?view=te7`, 1280 | axe sau khi cuộn hết; FAQ đóng, rồi mở câu 2 và câu band nhiều mở | 0 vi phạm serious/critical cả hai trạng thái | a11y | P1 |
| TC-40 | AC1, AC2, AC3, AC4 | Repo; `/` và `/?view=te7` có JS, 1280 | Đọc 8 block; đo resource `/assets/*.js` lúc tải và sau cuộn hết | Tĩnh: faq, faq-item, image-with-text, multicolumn, multicolumn-column, custom-liquid, testimonial-item không `<script`, không `data-lazy-module`; testimonials chỉ `lazy-module.js` + `scroll-buttons.js`. Chạy: tên file JS ở te7 ⊆ JS ở `/` ∪ {lazy-module, scroll-buttons, scroll-extras, motion-scrub}; không file JS tên faq/testimonial/multicolumn/image-with-text/custom-liquid; `/` tải sẵn ≤ 40 960 B, sau cuộn ≤ 65 536 B (ADR 0006, 0010) | Tĩnh/perf | P1 |
| TC-41 | AC1, AC2, AC3, AC4 | Không JS (1280 và Pixel 7), `/?view=te7` | So ảnh chụp cấu trúc 4 block với nhóm có JS; bấm link | Số mục, href, trạng thái `open`, `name` giống hệt nhóm có JS; testimonials: hàng cuộn bằng ArrowRight (`scrollLeft` > 0), không nút; nút `image-with-text-button` tới `/collections/all`; `multicolumn-link` tới `/collections` | E2E nojs | P1 |

## Case biên (ngoài AC)

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TB-01 | AC1 | Mất mạng: `scroll-buttons.js` bị `route.abort`, 1280 | Mở te7, Tab vào hàng, ArrowRight | Không `data-enhanced`; nút không hiện, không vào thứ tự Tab; hàng vẫn cuộn bằng bàn phím; 0 pageerror (chỉ lỗi tải tài nguyên bị chặn được bỏ qua) | E2E | P2 |
| TB-02 | AC5 | Repo | Đọc 8 block | Placeholder (`*-placeholder`) chỉ in trong nhánh `request.design_mode`; storefront te7 0 placeholder (editor vs storefront) | Tĩnh/E2E | P2 |
| TB-03 | AC1, AC4 | Pixel 7 (412), te7 | Render | Multicolumn 1 cột; image-with-text ảnh trên chữ; FAQ chạm câu 2 thì mở, câu 1 đóng; testimonials không nút | E2E | P1 |
| TB-04 | AC1, AC2 | Tối đa: 6 review, 10 câu | Render 360 | 6 card 1 hàng cuộn được; 10 câu, mỗi hàng ≥ 56; trang không cuộn ngang | E2E | P2 |
| TB-05 | AC1, AC6 | Merchant chưa chọn resource: review không ảnh/không sản phẩm, FAQ không ảnh không số, image-with-text không ảnh chính | Render | Không khung rỗng, không ảnh hỏng (`img` không có `src` rỗng) | E2E | P2 |
Bàn phím, trình đọc màn hình, 360 nằm trong TC-09, TC-10, TC-28, TC-31, TC-03, TC-14, TC-17.

## Không kiểm ở đây (có chỗ khác)
- AC-H24 (1920, card 4 tràn, bàn phím tới hết card 4) và AC-H25 (fixture, 4 review, card 2 có 4 sao, Verified tắt): ES1-T179.spec.ts. So copy hàng 8, 12, 13, 15 trên store dev đã cấu hình: ES1-T176, ES1-T179, ES1-T180.
- Đo khối trang chủ 1280 theo index-1280 §1: TE-17-R2-QA1.
- So copy Figma trên `/` khi chưa áp fixture: bỏ (TE-7 AC5 0.5 — theme mới cài không có copy mockup).

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- `/?view=te7`: templates/index.te7.liquid, ảnh và sản phẩm là 4 sản phẩm đầu `collections.all` (cần ≥ 4 sản phẩm có ảnh; thiếu thì test đo ảnh skip có lý do).
- `/`: fixture ES1-T331 (tests/fixtures/home-figma.json) nếu đã áp; sentinel `featured-product-title`, `level-card-count`.
- Theme mới cài: `FRESH_THEME_ID=<id theme push từ repo, không fixture>` (tuỳ chọn). Không có biến và store đã áp fixture thì TC-21 skip có lý do.
- Biến môi trường: `PREVIEW_URL` (hoặc `STORE_ORIGIN`), `STORE_PASSWORD`, `FRESH_THEME_ID` (tuỳ chọn).

## Bug
- BUG-ES1-T122-01 → ES1-T604 (P3): theme mới cài, `/` hiện copy mockup ở image-with-text (inspiration, why choose) do `templates/index.liquid` truyền `default_*` từ locale; testimonials cũng nhận default_eyebrow/heading Figma (TE-7 AC5). TC-20, TC-21. Liên quan câu hỏi mở ES1-T522.
- BUG-ES1-T122-02 → ES1-T605 (P3): multicolumn, multicolumn-column có default chữ ("Add a short label", "Add a heading for these columns", "Add a short benefit", câu mẫu, "Shop All Products") (TE-7 AC5, ADR 0011 mục 3). TC-19.
- BUG-ES1-T122-03 → ES1-T606 (P3): nút tròn đầu/cuối hàng dùng `opacity: 0.35` thay cặp màu disabled (TE-7 AC6, sổ 21/11). TC-30. ES1-T313 TC-08, ES1-T335 "mờ 0.35" lỗi thời theo AC6.
- BUG-ES1-T122-04 → ES1-T607 (P4): tên sao "Rated {n} out of 5" thay "{n} out of 5 stars" (TE-7 AC6). TC-28. ES1-T118 "Rated n out of 5" cần sửa cùng.
Chi tiết: `drafts/qa/ES1-T122/bugs/BUG-ES1-T122-0N.md`. Spec chạy các TC này bằng `test.fail(true, '<ticket>')`.

## GO/NO-GO (trước khi có kết quả CI)
NO-GO chất lượng cho TE-7 tới khi: ES1-T604, ES1-T605, ES1-T606 đóng (P3, sai AC5, AC6), CI store-tests của spec này xanh ở desktop + Pixel 7. ES1-T607 (P4) không chặn.

## KHÔNG CHẮC
- Spec chưa chạy, chưa type-check (lệnh npx cần duyệt trong phiên) → chờ CI store-tests của PR. DoD "npx playwright test tests/e2e/TE-1.spec.ts tests/e2e/TE-3.spec.ts pass" chưa chạy được trong phiên này.
- "Danh sách script trang chủ giống develop trước TE-7" (DoD): không có danh sách gốc; TC-40 thay bằng: TE-7 không thêm file JS ngoài scroll-buttons.js (TE-7-R2-BE1, task-split §4) + trần ADR 0006/0010.
- AC2 "một hoặc nhiều mở theo setting": kiểm theo `details name` (ES1-T115 #1, PO 06/11).
- AC7 "Make fitness: 360 hiện ảnh 1 và 2, ảnh 3 không hiện": đánh số theo vị trí (index-mobile-a §8), block đánh số theo setting (ẩn accent_image_2). Test đếm 2 hiện + 1 ẩn không tải, không gắn số setting.
- AC6 tên sao: ui-spec product.md dùng "Rated 5 out of 5 stars", SRS TE-7 AC6 "{n} out of 5 stars": test nhận cả 2 (đuôi "{n} out of 5 stars").
- AC1 "từ 768 nút ... mặc định trắng viền #E5E5E5": so với `--color-background`, `--color-border` của theme setting (giá trị store có thể khác mặc định).
- TC-21 trên store đã áp fixture chỉ chạy khi có `FRESH_THEME_ID`.
