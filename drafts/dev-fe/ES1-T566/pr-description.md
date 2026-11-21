KHÔNG CHẮC: ngân sách trang chủ base + file tầng 4 không đạt. Đo thật 59 962 B, trong khi ADR 0014 mục 5 (CTO 21/11, ES1-T569) cho 57 344 B và DoD ticket ghi 53 248 B. Nén từng file mất ngữ cảnh chung. Đã hỏi Tech Lead ở ES1-T575 (nâng ngân sách / cho bỏ comment trong file tầng 4 / giữ 4 block index ở base.css). Phép so này trong tests/e2e/ES1-T565.spec.ts để test.fixme, mọi kiểm khác chạy thật.

# ES1-T566 TE-10-R2-FE10: tách CSS 6 block (testimonials, video carousel, FAQ, shop by level, multicolumn, hello world) khỏi base.css (ADR 0014)

## Thay đổi
- Mới: assets/testimonials.css, video-carousel.css, faq.css, shop-by-level.css, multicolumn.css, hello-world.css. Rule chuyển nguyên văn từ base.css theo drafts/techlead/ES1-T564/selector-map.md mục 6–11, gồm cả phần "Trang chủ theo Figma" (80rem), "Trải nghiệm mượt", "Hàng ngang", "Chuyển động v2". Giữ thứ tự, bọc lại đúng @media gốc. Đã kiểm bằng `grep -Fx`: mọi dòng trong 6 file mới có nguyên văn trong base.css develop, trừ comment đầu file và dòng tách selector list. Mọi dòng base.css develop còn ở base mới hoặc ở file block, trừ dòng tách và comment mục.
- Selector list lẫn nhiều block được tách. Phần collection-list, blog-posts, article-card, site-footer, rich-text, product-card, featured-collection giữ base.css; phần testimonials/video-carousel/faq/level-card về file block. Gồm: khung "Hàng ngang", list eyebrow 80rem, card/ảnh hover, accordion, eyebrow cam. `.rating-stars*`, `.custom-liquid--placeholder`, `.carousel-*`, `scroll-buttons` giữ base.css. `@keyframes highlight-flash` theo hello-world.css; keyframe motion-* giữ base.css.
- base.css giữ các comment mốc mà spec dùng làm điểm cắt (ADR 0014 mục 4): `/** Hello world block` (ES1-T313), `/** Shop by level (TE-15` (ES1-T184, T217), `/** Testimonials (TE-7` (TE-16 TC-28). Mỗi mốc ghi file đích.
- `.contact-form__summary:focus-visible`, `.contact-form__status:focus-visible` → aux.css. base.css còn `.form-status:focus-visible`.
- Cascade contact: faq.css nạp trong body, sau aux.css ở head. Có 4 rule 80rem đều 0,3,0 và cùng độ ưu tiên với rule contact: `.faq-item:first-child|:not(:first-child) .faq-item__summary|__question` (inset-block-start). Vì vậy aux.css đổi `.contact-aside .faq-item .faq-item__summary|__question` → `.contact-aside details.faq-item …` (0,3,1). Bố cục contact giữ như develop, không `!important`.
- 8 block thêm 1 dòng `{{ '<file>.css' | asset_url | stylesheet_tag }}` ngay trước root, trước nhánh placeholder, ngoài mọi `{% partial %}`, không preload; `{% doc %}` ghi file CSS:
  - testimonials, video-carousel, faq, shop-by-level, multicolumn, contact-aside (faq.css): bọc `if <có nội dung> or request.design_mode`, như ES1-T565. Block rỗng ngoài editor không in link nên container không ra band rỗng.
  - hello-world, liquid-tips (hello-world.css): luôn in markup nên nạp không điều kiện.
  - Doc liquid-tips: đổi chữ `{% partial %}` thành "partial region". Lý do: spec ES1-T565 đếm tag partial trước dòng link.
  - Block con (testimonial-item, video-card, faq-item, level-card, multicolumn-column) không nạp.
- Không đổi markup, class, data-*, testid, partial, custom element. 0 file JS.
- Spec:
  - ES1-T565: thêm 6 file vào PARENTS, 5 block con vào CHILDREN, MOVED gồm 11 block, BASE_MAX 40 960. Thêm test focus contact-form ở aux, highlight-flash, rule contact-aside 0,3,1.
  - Hạ trần base 40 960 ở ES1-T478 (+ BLOCK_FILES 11 file trong kiểm prelude trùng), ES1-T326, T365, T369, T387.
  - ES1-T157, T186: đọc video-carousel.css, shop-by-level.css cả file; base.css không còn class.
  - ES1-T383: fixture nạp faq.css trong body sau aux.css.
  - ES1-T403: D5 quét thêm 6 file.
  - ES1-T224: trang giả thêm link testimonials.css trước root.
  - ES1-T217 TC-04/05: quét thêm 11 file block để rule rời base.css vẫn được kiểm.

## Kích thước (zlib.gzipSync mặc định, B)
| File | develop thô | develop gzip | sau thô | sau gzip | trần |
|---|---|---|---|---|---|
| base.css | 191 187 | 37 029 | 157 732 | 31 892 | 40 960 |
| critical.css | 10 082 | 3 102 | 10 082 | 3 102 | 10 240 thô |
| aux.css | 37 376 | 6 736 | 37 822 | 6 920 | 16 384 |
| collection.css | 29 050 | 5 336 | 29 050 | 5 336 | 16 384 |
| testimonials.css | – | – | 7 995 | 2 222 | 8 192 |
| video-carousel.css | – | – | 10 569 | 2 916 | 8 192 |
| faq.css | – | – | 7 813 | 2 278 | 8 192 |
| shop-by-level.css | – | – | 7 001 | 2 229 | 8 192 |
| multicolumn.css | – | – | 3 635 | 1 208 | 8 192 |
| hello-world.css | – | – | 2 218 | 814 | 8 192 |
| Trang chủ: base + 9 file tầng 4 | – | 55 454 | – | 59 962 | 57 344 ADR / 53 248 ticket (không đạt, ES1-T575) |

- Số file tầng 4 ở index: 9 (≤ 10).
- Trang không có 6 block này (PDP, collection, cart, trang phụ trừ contact): CSS chặn render giảm 5 137 B gzip. /pages/contact tải thêm faq.css 2 278 B trong body.
- Comment chiếm ~30 % gzip của file block. Bỏ comment 4 file ở index thì tổng ≈ 57 091 B. Chưa làm vì là tự minify, chờ ES1-T575.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 9 warning có sẵn (UnrecognizedBlockArguments ở templates/index*.liquid), không file nào trong diff.
- Spec tĩnh chạy cục bộ, project desktop, config drafts/dev-fe/ES1-T565/static.config.ts (bỏ globalSetup vì không có PREVIEW_URL): 26 pass, 1 skip (fixme ngân sách trang chủ). Gồm ES1-T565 (8), ES1-T478 (4), phần tĩnh của ES1-T157, T186, T403 (D5, C8), T326 TC-05, T365, T369, T387, T217 TC-04/05/06, TE-16 TC-28.
- Test cần trình duyệt chờ CI: fixture ES1-T383, T224, T313, T326/T365/T369 bố cục, và toàn bộ test store. Chromium không khởi động trong sandbox agent (mach_port Permission denied).
- Ảnh index 360/768/1280/1920 và page.contact 360/1280 trước/sau (reducedMotion), `npx lhci autorun` 5 URL ADR 0013: chờ CI.
- Theme editor store dev (thêm 1 faq, 1 testimonials có style ngay không reload): chưa kiểm, agent không mở editor. Người review kiểm tay; sai thì áp dự phòng ADR 0014 mục 3.
- drafts/dev-fe/ES1-T566/measure.spec.ts, measure.config.ts: công cụ đo cục bộ (`npx playwright test --config drafts/dev-fe/ES1-T566/measure.config.ts`).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
