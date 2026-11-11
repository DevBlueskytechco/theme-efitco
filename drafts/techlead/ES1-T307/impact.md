KHÔNG CHẮC: (1) FE Must 165 point > sức chứa ~147 point Sprint 2–4 kể cả khi cắt hết Should → hỏi CTO ES1-T311 (im lặng tới 13/11 = mặc định: nới giờ FE charter ~27 giờ; không nới thì cắt TE-11 popup quiz → mở rộng TE-20 → TE-6-R2-FE4); (2) ES1-T304 chưa tách task, point chưa trừ vào sức chứa; (3) `?option_values=` qua `partials.fetch` chưa kiểm trên store, spike TE-4-R2-BE1 đầu Sprint 2, ADR 0008 có dự phòng; (4) selector Shopify Inbox, API consent (layers.md ghi KHÔNG CHẮC), BE xác nhận ở TE-10-R2-BE1; (5) số JS hiện tại là cộng tĩnh `wc -c`, số thật chờ CI ES1-T177; (6) nơi lưu setting static block trong template `.liquid` khi sửa bằng editor chưa có trong AGENTS.md/ADR → spike + fixture TE-17-R2-QA0 trước khi đo "giống Figma" trên store dev (ES1-T308 #1); (7) AC story mới TE-19..TE-22 chưa có mã tới SRS 0.5 (REQ2-BA3).

## Tóm tắt

- Yêu cầu: BGĐ duyệt thiết kế Efitco ngày 11/11/2026 (vòng 3 + sửa audit ES1-T284 → T294 + thiết kế tuân thủ Theme Store PR #173, đã ở develop `ce08212`). Chuyển sang DEV: mọi màn đã duyệt có ticket FE/BE/QA sẵn sàng chạy. Áp dụng từ 11/11/2026; ticket DEV chạy Sprint 2 (16–27/11), Sprint 3 (30/11–11/12), Sprint 4 (14–25/12); R1 lên Canvas tuần 11 (28/12), chưa nộp Theme Store nhưng đạt chuẩn Theme Store nội bộ (ES1-T308 #2).
- Quyết định CTO đã áp (lượt 2):
  - ES1-T308: theme mới cài để trống nội dung mẫu, store dev cấu hình Figma để đo; review PDP chỉ rating metafield, không app block; trễ thì cắt Should.
  - ES1-T309: dòng ĐỀ XUẤT trong ui-spec là phạm vi; bậc giảm mặc định 0; "Get 15% Off" setting default rỗng; đo khối 1280/768/360 lệch ≤ 2 px; AC cho VP2, VP3, HB1, HB2, FD2, HD3.
  - ES1-T310: 1 file base.css, gzip ≤ 49 152 B; CTO sửa ví dụ `variant-json` trong AGENTS.md cùng PR TE-4-R2-FE2; ranh giới ES1-T304 theo mặc định; 1 point ≈ 1,5 giờ, task 3–5 point.
  - ADR 0007 (lớp, dải đáy, `<modal-dialog>`), 0008 (bộ chọn biến thể theo option value, partial theo ngữ cảnh, quickview template), 0009 (countdown chung), 0010 (ngân sách JS theo trang): Chấp nhận.
  - Story mới: TE-19 Upsell giỏ hàng; TE-20 Blog và bài viết (gồm mở rộng); TE-21 Trang phụ: page, contact, 404, password, gift card; TE-22 Điều hướng mở rộng: menu 3 cấp, mega menu, breadcrumb.
- Đầu ra: `drafts/techlead/ES1-T307/task-split.md` — 86 task mới (FE 42 / 175 point, BE 27 / 95, QA 13 / 50, BA 4 / 18), mỗi task một phía, 3–5 point, có story, sprint, file, AC, phụ thuộc, DoD lệnh; viết lại 9 ticket mở; đề xuất đóng 9 ticket.
- Hiện trạng code so với thiết kế: trang chủ 1920 gần Figma (ES1-T250, T275 đã merge); 1280/768/360 lệch theo index-1280 §6, index-mobile-a §12, -b §11; search, blog, page, 404, password còn bản Skeleton thô; chưa có quickview, upsell, popup marketing, countdown PDP, localization picker, mega menu, breadcrumb, `.page-banner`; header tối chỉ khi có `.slideshow` (base.css 7452–7478).
- Vi phạm/sát trần trên develop: `motion.js` 9 161 B > 8 192; PDP tải sẵn 43 955 B > 40 960; trang chủ sau cuộn ≈ 73 126 B > 65 536; base.css 232 695 B (gzip 41 277). ADR 0010 đưa về dưới trần (TE-10-R2-BE3, TE-22-R2-BE1, TE-1-R2-BE1, TE-3-R2-BE2, TE-13-R2-BE1).
- Mâu thuẫn còn lại:
  - Sức chứa FE (ES1-T311).
  - AGENTS.md ví dụ `variant-json`: đã chốt CTO sửa (ES1-T310 #2), TE-4-R2-FE2 không merge trước PR sửa AGENTS.md.
  - Skill `cart-variant-logic` hướng dẫn `{{ product.variants | json }}`: trái ADR 0008, sửa skill (dưới).
  - SRS 0.4 còn AC nội dung mẫu "theme mới cài" và gộp blog/trang phụ trong TE-9: SRS 0.5 sửa (REQ2-BA1, BA3).

## Ảnh hưởng

- Story: TE-1 (header tối, drawer, footer, localization, announcement), TE-2 (hero 1280/768/360, HA1), TE-3 (card chỉ báo, quickview), TE-4 (bộ chọn 2048, PDP, countdown, selling plan, pickup, gift card; B2B Should), TE-5 (mini cart, cart page, checkout bar), TE-6 (phân trang chung, collection, list-collections), TE-7 (hàng ngang, lưới tĩnh), TE-8 (search, predictive; recent Should), TE-10 (lớp, dải đáy, ngân sách, CSS), TE-11 (popup kết quả quiz), TE-12 (bundle 3 mốc + thanh 360, bậc giảm mặc định 0), TE-13 (countdown chung), TE-17 (trang chủ 1280/768/360, fixture store dev), TE-18 (popup marketing, Should); mới TE-19 (upsell, Should), TE-20 (blog/article), TE-21 (trang phụ), TE-22 (mega, menu 3 cấp, breadcrumb). TE-9 còn nội dung mặc định/preset; TE-14, TE-15, TE-16 chỉ qua task hàng ngang/CSS.
- Ticket mở sửa body (task-split §3): ES1-T98 (S4, 3), ES1-T110 gộp ES1-T111 (S4, 8), ES1-T112, ES1-T128 (S4, 5, nhận search.liquid từ ES1-T304), ES1-T129 (S4, 3), ES1-T130 (S4, 5; recent tách TE-8-R2-BE3), ES1-T131, ES1-T140, ES1-T99.
- Ticket đề xuất đóng (Orchestrator kiểm PR trước): ES1-T119, ES1-T120, ES1-T147, ES1-T156 (code đã vào qua ES1-T179, T180, T182, T158), ES1-T250, ES1-T275 (merge #152, #162), ES1-T248, ES1-T303 (swatch card thành chỉ báo), ES1-T247 (upsell thành story TE-19).
- ES1-T304: giữ mục CHẶN/NÊN nhỏ; "search.liquid" → ES1-T128, "menu 3 cấp" → TE-22-R2-FE2; task chạm cùng file blocked_by con ES1-T304 (task-split §2). Khi ES1-T304 tách xong, Tech Lead trừ point vào bảng sprint.
- Câu hỏi Tech Lead đang mở được trả lời bởi kế hoạch: ES1-T161 (partial theo ngữ cảnh, ADR 0008), ES1-T209 (`scroll-buttons.js` ≤ 1 536 B), ES1-T214 (không giá gạch → không countdown, ADR 0009), ES1-T249 (gộp ES1-T110), ES1-T246 (breadcrumb TE-22-R2-FE1, filters ES1-T110).
- Block sửa: header, announcement-bar, footer, slideshow, slideshow-slide, collection-list, testimonials, video-carousel, blog-posts, rich-text, level-card, shop-by-level, featured-collection, quiz, shop-the-look, shop-the-look-row, image-with-text, bundle-builder, featured-product, faq, faq-item, product-media, product-info, product-form, product-sticky-bar, product-recommendations, collection-banner, collection-products, collection-filters, collection-card, cart-drawer, cart-page. Block mới: product-details, product-reviews, blog-articles, article-comments, not-found, password-hero, newsletter-popup, exit-popup, offer-popup (+ search-results ở ES1-T128). Snippet mới: breadcrumb, page-title, empty-state, sale-countdown, cart-upsell; xoá: variant-json, product-variant-select. Template mới: product.quick-view.
- Assets JS mới: modal-dialog, page-layers, header-drawer, localization-picker, sale-countdown, product-media-lightbox, pickup-availability, quick-view, popup-queue, popup-forms. Giảm byte: motion, header-menu, cart-drawer, product-media. Gỡ khỏi card: product-swatch. Nâng trần: product-recommendations 3 072 → 4 096 (upsell, ADR 0010 đã ghi).
- Skill: cart-variant-logic, js-partials, task-split-fe-be, playwright-theme (dưới).
- Agent: dev-fe, dev-be, qa (task); ba (REQ2-BA1..BA4, SRS 0.5); po (PRD 0.2, charter 0.2 ngân sách giờ FE theo ES1-T311, kế hoạch release R1 — giữ ở ES1-T305, không lặp ở đây); devops (đo JS theo URL, gzip CSS trong CI ES1-T177; nối fixture TE-17-R2-QA0 vào preview nếu cần; dữ liệu ES1-T298); writer (docs merchant cho 9 block mới + settings mới, ES1-T193); CTO (sửa AGENTS.md ví dụ variant-json + Theme map, ES1-T194; trả ES1-T311).

## Kiến thức cho _chung: kế hoạch DEV REQ-0002, story mới, nội dung mẫu

- Kế hoạch DEV duy nhất: `drafts/techlead/ES1-T307/task-split.md`. Mã task `<story>-R2-<phía><n>`, BA `REQ2-BA<n>`. Sprint 2 (16–27/11), Sprint 3 (30/11–11/12), Sprint 4 (14–25/12), R1 Canvas 28/12.
- Story mới: TE-19 Upsell giỏ hàng; TE-20 Blog và bài viết; TE-21 Trang phụ (page, contact, 404, password, gift card); TE-22 Điều hướng mở rộng (menu 3 cấp, mega menu, breadcrumb). Không dùng đánh số TE-19/TE-20/TE-21 cũ trong đề xuất PO ES1-T305, BA ES1-T306.
- ADR 0007–0010 đã Chấp nhận, áp cho mọi task REQ-0002; ticket mâu thuẫn ADR thì theo ADR và hỏi Tech Lead.
- Nội dung mẫu (ES1-T308 #1): theme mới cài trống — setting chữ/claim/mã giảm default rỗng, bậc giảm 0, không handle `figma-*`; nội dung Figma chỉ cấu hình trên store dev (fixture TE-17-R2-QA0).
- Should cắt trước khi trễ, theo thứ tự: TE-18 → mega ảnh/sản phẩm (TE-22-R2-FE3) → B2B quantity rule + volume (TE-4-R2-FE7, BE7) → recent searches (TE-8-R2-BE3) → TE-19. Trang phụ giữ, cuối Sprint 4.

## Kiến thức cho dev-fe: lớp, thanh đáy, biến thể, countdown, default rỗng

- Mỗi lớp modal: `<modal-dialog data-layer="<tên>"><dialog aria-labelledby>`; tên lớp cố định: menu, search, cart, quick-view, lightbox, filter, quiz, localization, newsletter, exit, offer, pickup. Lớp không modal (mega, popover localization ≥ 48rem, thẻ big offer ≥ 48rem): `data-layer` + `aria-expanded`.
- Không viết `z-index` số: `var(--layer-*)` (ADR 0007). Thanh đáy: CSS đọc `html[data-bottom-bar]` → `--bottom-bar-height`.
- Không `for variant in product.variants`, không `variant-json`, không `<select>` liệt kê biến thể (ADR 0008). Bộ chọn lặp `option.values`, radio `value="{{ value.id }}"`.
- Countdown chỉ qua `{% render 'sale-countdown' %}` (ADR 0009).
- Thẻ `<script>`, `data-lazy-module`, `data-lazy-on` là việc BE; FE đặt thẻ host custom element, `data-testid`, partial theo hợp đồng task-split §4.
- Setting chữ/claim mới: `default` rỗng, khối ẩn khi rỗng; không lấy chữ Figma làm default (ES1-T308 #1).
- Xoá CSS cũ của phần mình thay trong cùng PR; DoD: `gzip -c assets/base.css | wc -c` ≤ 49 152, `wc -c assets/critical.css` ≤ 10 240.

## Kiến thức cho dev-be: ngân sách JS và module chung

- Trần ADR 0010: chung mọi trang ≤ 19 456 B, PDP tải sẵn ≤ 38 408 B; mỗi file ≤ 8 192 B. PR ghi `wc -c` từng file chạm và phép cộng theo trang.
- Không `import` tĩnh module theme khác (ES1-T81); dùng element API: `document.querySelector('modal-dialog[data-layer=cart]').open()`, sự kiện `modal:open/close`, `layers:idle`.
- Đổi biến thể: `partials.fetch(...names, { url: fetchUrl + '?option_values=' + ids, signal })` (ADR 0008); PDP `replaceState`; quickview không đổi URL trang nền.
- Thanh đáy: chỉ module sở hữu gắn `html[data-bottom-bar="product|cart|bundle"]`, không đo chiều cao.
- Upsell cart dùng lại `product-recommendations.js` (`data-context="cart"`, ≤ 4 096 B, lười viewport); không tạo file JS mới cho upsell.

## Kiến thức cho qa: kiểm lớp, ngân sách, biến thể, nội dung mẫu

- Mỗi spec màn REQ-0002 kiểm 4 mốc 360/768/1280/1920 + nojs; lớp mở thì `html[data-layer-open]`, thanh đáy và teaser ẩn.
- Ngân sách JS: `performance.getEntriesByType('resource')` lọc `/assets/` + `.js`, tải sẵn ≤ 40 960 B, sau cuộn ≤ 65 536 B (ADR 0006, 0010) trên `/`, PDP, `/collections/all`, `/cart`.
- Biến thể: HTML PDP không chứa JSON biến thể, không `<select name="id">`; sản phẩm > 250 biến thể (ES1-T298 D3) chọn tổ hợp sau vị trí 250 đúng giá/tồn.
- Nội dung mẫu: AC-H1..H5, AC-H18, AC-H19, AC-H28 đo trên store dev đã áp fixture TE-17-R2-QA0; theme mới cài kiểm ngược lại (không claim, không bậc giảm, không handle demo).
- Đo khối 1280/768/360 theo bảng số index-1280 §1, index-mobile-a/b, lệch ≤ 2 px, không so pixel mockup (ES1-T309 #4).
- Task QA ghi rõ AC chỉ kiểm khi task Should tương ứng không bị cắt (TE-4 AC18, recent searches, mega ảnh, TE-18, TE-19).

## Kiến thức cho ba: SRS 0.5 theo quyết định 11/11

- Đánh số story theo CTO 11/11: TE-19 Upsell giỏ hàng, TE-20 Blog và bài viết, TE-21 Trang phụ, TE-22 Điều hướng mở rộng (tách khỏi TE-9 AC2, AC3 và TE-1 AC2, AC7).
- AC nội dung mẫu đổi Given sang "store dev đã cấu hình" (ES1-T308 #1); thêm AC ngược "theme mới cài: không claim, bậc giảm 0".
- Mã task R2 trong task-split dùng để map traceability 0.5 (REQ2-BA4).

## Kiến thức cho devops: đo JS theo URL, gzip CSS, fixture store dev

- ES1-T177: JS theme tải sẵn ≤ 40 960 B, sau cuộn ≤ 65 536 B trên 5 URL (`/`, PDP demo, `/collections/all`, `/cart`, `/search?q=bench`); `gzip -c assets/base.css | wc -c` ≤ 49 152 chặn merge (ES1-T310 #1).
- `grep -nE "z-index:\s*-?[0-9]" assets/*.css` = 0 sau khi TE-10-R2-FE1 merge (ADR 0007).
- Sau TE-17-R2-QA0: nếu fixture nội dung Figma cần áp lên preview theme thì thêm bước vào `scripts/preview-push.sh` (store `SHOPIFY_FLAG_STORE` duy nhất).

## Kiến thức cho techlead: rà PR giai đoạn REQ-0002

- Chặn ngay PR có: vòng lặp `product.variants` (trừ `bundle-builder` lấy `variants.first`), z-index số, file JS > 8 192 B, lớp modal không qua `<modal-dialog>`, countdown ngoài snippet chung, CSS cũ không xoá khi thay, setting chữ/claim default lấy chữ Figma.
- Sau spike TE-4-R2-BE1: cập nhật ADR 0008 (chấp nhận hoặc dự phòng) trước khi TE-4-R2-FE1 vào review. Sau TE-17-R2-QA0: ghi kết quả nơi lưu setting static block vào task-split.
- Khi ES1-T304 tách xong hoặc ES1-T311 có trả lời: cập nhật bảng sprint task-split §7.

## Sửa skill cart-variant-logic: bỏ JSON biến thể, chọn biến thể theo option value

Dòng "Variant" thay bằng: "Variant: không dùng `product.variants | json` hay JSON biến thể (sổ 10/11, 2048 biến thể, NFR-7, ADR 0008). Bộ chọn render từ `option.values` (radio `value.id`, trạng thái `value.available`/`value.exists`/`value.selected`). Đổi lựa chọn → gom id option value → `partials.fetch(...names, { url: <product url>?option_values=id1,id2,id3, signal })` → `partials.apply`; server trả giá, tồn, nút, ảnh, countdown, sticky bar. PDP `history.replaceState` `?variant=`; quickview không đổi URL trang nền. Đang tải: Add To Cart `aria-disabled`, không spinner." Dòng "Predictive search": thêm "nạp lười khi bấm; trần 6 656 B (ADR 0010)". Thêm dòng "Upsell cart: `product-recommendations.js` `data-context="cart"`, intent complementary, gốc dòng đầu, tối đa 4, thêm → refresh `cart-page` + `cart-count`".

## Sửa skill js-partials: module chung lớp, nạp lười, tên partial theo ngữ cảnh

Thêm 4 dòng: (1) "Lớp modal: dùng `<modal-dialog>` có sẵn (`open()`/`close()`, sự kiện `modal:open/close`), không tự viết Esc/scrim/focus; trạng thái lớp đọc `html[data-layer-open]` và sự kiện `layers:idle` (ADR 0007)." (2) "Không `import` tĩnh module theme khác (ES1-T81); giao tiếp qua element API và CustomEvent." (3) "Nạp lười: `data-lazy-module` + `data-lazy-on="interaction"` cho phần chỉ cần khi tương tác; ngân sách theo trang ADR 0010." (4) "Tên partial không trùng trên một trang: PDP nhiều partial `product-*`; quickview 1 partial `quick-view`; featured product 1 partial `featured-product` (ADR 0008)." Sửa dòng "Web Component" bỏ ví dụ `product-swatch` thay bằng `sale-countdown`.

## Sửa skill task-split-fe-be: ghi trần JS, hợp đồng đủ trường, Should tách riêng

Thêm: "DoD task BE ghi trần byte từng file chạm và phép cộng theo trang theo ADR 0010; task FE ghi trần `critical.css` 10 240 B và base.css gzip 49 152 B. Bảng hợp đồng FE/BE bắt buộc 6 cột: custom element (ai đặt thẻ host), hook `data-*`, `data-testid`, partial, lớp `data-layer` / thanh đáy `data-bottom-bar`. Thẻ `<script>` và `data-lazy-module`/`data-lazy-on` trong block thuộc task BE. Phần Should tách task riêng để cắt không đụng task Must; mỗi task ghi story, sprint, Should." Sửa "≤ 8 point" thành "3–5 point (≈ ≤ 1 ngày, 1 point ≈ 1,5 giờ, ES1-T310 #4)".

## Sửa skill playwright-theme: đo JS theo trang, lớp, countdown, fixture nội dung

Thêm: "Đo JS: `performance.getEntriesByType('resource')` lọc `/assets/*.js`, cộng `transferSize` lúc tải và sau cuộn hết trang. Lớp: kiểm `html[data-layer-open]`, focus trả về nút mở, Esc, `::backdrop`. Countdown: `page.clock.install()` rồi `runFor`. AC nội dung Figma chỉ chạy khi store dev đã áp fixture (TE-17-R2-QA0), không thì `test.skip` có lý do. Không `request.get` JSON storefront (429, CONVENTION.md)."

## Ticket cần tạo

Định dạng: tên: file chính; AC | phía | point | story | sprint | [Should] | sau (blocked_by). Chi tiết việc, hợp đồng, DoD ở task-split §1–§6. Câu hỏi đã tạo: ES1-T311 (sức chứa FE).

- TE-10-R2-FE1: base.css, critical.css, theme; AC TE-10 AC6, AC8 (CSS), NFR-1 | FE | 4 point | story TE-10 | Sprint 2 | sau: —
- TE-10-R2-FE2: base.css, empty-state (mới), en.default.json; AC foundation §2, §6, §15–§18; AC-H7 | FE | 4 point | story TE-10 | Sprint 2 | sau: TE-10-R2-FE1
- TE-10-R2-BE1: page-layers.js (mới, ≤ 2 048 B), thẻ do FE đặt; AC TE-10 AC6, AC7 | BE | 3 point | story TE-10 | Sprint 2 | sau: TE-10-R2-FE1
- TE-10-R2-BE2: modal-dialog.js (mới, ≤ 2 048 B), thẻ script trong theme; AC TE-3 AC10, TE-11 AC5, TE-18 AC8 (phần chung) | BE | 3 point | story TE-10 | Sprint 2 | sau: TE-10-R2-FE2
- TE-10-R2-BE3: motion.js 9 161 → ≤ 6 144 B, lazy-module.js ≤ 768 B; AC AC-H31, TE-2 AC10, ADR 0006/0010 | BE | 3 point | story TE-10 | Sprint 2 | sau: —
- TE-10-R2-FE3: base.css; AC TE-14 AC4, NFR-1, ES1-T310 #1 | FE | 3 point | story TE-10 | Sprint 4 | sau: TE-4-R2-FE8, TE-6-R2-FE2, TE-5-R2-FE2
- TE-10-R2-QA1: ma trận lớp layers.md §6 (không popup), Inbox, consent, max-height 30rem; AC TE-10 AC6–AC8 | QA | 4 point | story TE-10 | Sprint 3 | sau: TE-10-R2-BE1, TE-12-R2-BE1, TE-4-R2-BE4
- TE-1-R2-FE1: critical.css, base.css, header, announcement-bar, theme, en.default.schema.json; AC TE-1 AC4, AC9, AC-H29, TE-2 AC6 | FE | 4 point | story TE-1 | Sprint 2 | sau: TE-10-R2-FE1, con ES1-T304 (logo dự phòng, favicon)
- TE-1-R2-FE3: header, base.css, locales; AC TE-1 AC2 (dưới 80rem), AC3, AC10 (drawer) | FE | 5 point | story TE-1 | Sprint 2 | sau: TE-10-R2-FE2, TE-22-R2-FE2 (cùng file)
- TE-1-R2-FE4: footer, base.css, locales; AC TE-1 AC6, AC-H28 (store dev), R4.18 | FE | 4 point | story TE-1 | Sprint 2 | sau: TE-1-R2-FE1, con ES1-T304 (payment icons, Get 15% Off)
- TE-1-R2-FE5: footer, header, base.css, locales; AC TE-1 AC5, AC10 | FE | 4 point | story TE-1 | Sprint 3 | sau: TE-1-R2-FE4, TE-1-R2-FE3
- TE-1-R2-BE1: header-drawer.js (mới, ≤ 4 096 B, lười interaction); AC TE-1 AC2 (drawer), AC10 | BE | 3 point | story TE-1 | Sprint 2 | sau: TE-1-R2-FE3, TE-10-R2-BE2
- TE-1-R2-BE2: localization-picker.js (mới, ≤ 4 096 B, lười interaction); AC TE-1 AC10 | BE | 3 point | story TE-1 | Sprint 3 | sau: TE-1-R2-FE5, TE-10-R2-BE2
- TE-1-R2-QA1: header tối, drawer, announcement, footer, localization, tài khoản; AC TE-1 AC2 (drawer), AC3–AC6, AC9, AC10, AC-H28, AC-H29 | QA | 4 point | story TE-1 | Sprint 3 | sau: TE-1-R2-BE1, TE-1-R2-BE2
- TE-22-R2-FE1: breadcrumb (mới, JSON-LD BreadcrumbList), page-title (mới), base.css (.page-banner, lớp tối 75 → 60%); AC TE-1 AC7 (0.4) → TE-22 (0.5), R11, foundation §3.3, §5 | FE | 3 point | story TE-22 | Sprint 2 | sau: TE-10-R2-FE2
- TE-22-R2-FE2: header, base.css, locales; AC TE-1 AC2 (từ 80rem) → TE-22 (0.5), R4.8 | FE | 4 point | story TE-22 | Sprint 2 | sau: TE-1-R2-FE1
- TE-22-R2-FE3: header, settings_schema.json, base.css, locales; AC navigation.md N2, N3 → TE-22 (0.5) | FE | 3 point | story TE-22 | Sprint 4 | Should | sau: TE-22-R2-FE2, TE-1-R2-FE3
- TE-22-R2-BE1: header-menu.js 6 862 → ≤ 3 072 B; AC TE-1 AC2 (từ 80rem) → TE-22 | BE | 3 point | story TE-22 | Sprint 2 | sau: TE-22-R2-FE2
- TE-22-R2-QA1: mega A/B/C bàn phím + Esc, cấp 3, scrim, breadcrumb 3 dạng + JSON-LD; AC TE-1 AC2, AC7 (0.4) → TE-22 (0.5) | QA | 3 point | story TE-22 | Sprint 3 | sau: TE-22-R2-BE1, TE-22-R2-FE1
- TE-17-R2-QA0: spike, fixture nội dung Figma cho store dev (D10); nơi lưu setting static block index.liquid, tests/fixtures/, để đo AC-H1..H5, AC-H18, AC-H19, AC-H28 | QA | 3 point | story TE-17 | Sprint 2 | sau: —
- TE-2-R2-FE1: slideshow, slideshow-slide, critical.css, index; AC TE-2 AC2, AC6, AC7, AC10, AC-H29 | FE | 5 point | story TE-2 | Sprint 2 | sau: TE-10-R2-FE1, TE-1-R2-FE1
- TE-2-R2-BE1: slideshow.js (giữ ≤ 8 057 B); AC TE-2 AC7–AC9 | BE | 3 point | story TE-2 | Sprint 2 | sau: TE-2-R2-FE1
- TE-7-R2-FE1: collection-list, testimonials, video-carousel, blog-posts, base.css; AC TE-7 AC1, AC-H8, AC-H9, AC-H21, AC-H24, AC-H26, AC-H27 | FE | 5 point | story TE-7 | Sprint 2 | sau: TE-10-R2-FE2
- TE-7-R2-BE1: scroll-buttons.js (768 → ≤ 1 536 B, trả lời ES1-T209); AC TE-7 AC1 | BE | 3 point | story TE-7 | Sprint 2 | sau: TE-7-R2-FE1
- TE-17-R2-FE1: rich-text, level-card, shop-by-level, featured-collection, base.css; AC AC-H10, TE-3 AC1, AC-H11, AC-H35 | FE | 4 point | story TE-17 | Sprint 2 | sau: TE-10-R2-FE1, con ES1-T304 (index.liquid demo)
- TE-3-R2-FE1: product-card, base.css, locales; AC TE-3 AC2, AC6, AC8 | FE | 3 point | story TE-3 | Sprint 2 | sau: con ES1-T304 (swatch.color/image, compare_at_price_max, không cắt tên)
- TE-3-R2-BE2: gỡ product-swatch.js khỏi featured-collection:278, collection-products:223, quiz:280, xoá file; AC TE-3 AC2, ADR 0010 | BE | 3 point | story TE-3 | Sprint 2 | sau: TE-3-R2-FE1
- TE-12-R2-FE1: bundle-builder, base.css, locales; AC TE-12 AC1, AC-H18 (store dev), HB1 | FE | 4 point | story TE-12 | Sprint 2 | sau: TE-10-R2-FE1, con ES1-T304 (tier mặc định 0)
- TE-12-R2-BE1: bundle-form.js (5 491 → ≤ 7 168 B, lười viewport); AC TE-12 AC1, AC3, HB1, HB2 | BE | 3 point | story TE-12 | Sprint 2 | sau: TE-12-R2-FE1, TE-10-R2-BE1
- TE-17-R2-FE2: quiz, shop-the-look, shop-the-look-row, image-with-text, base.css, locales; AC TE-11 AC4, TE-12 AC5, AC-H19 (store dev), AC-H20, AC-H35 | FE | 5 point | story TE-17 | Sprint 3 | sau: TE-10-R2-FE2
- TE-17-R2-FE3: featured-product, image-with-text (why), faq, faq-item, base.css, locales; AC TE-13 AC2, AC-H22, TE-7 AC2, AC3 | FE | 4 point | story TE-17 | Sprint 3 | sau: con ES1-T304 (featured rich media)
- TE-13-R2-FE1: sale-countdown (mới), featured-product, base.css, locales; AC TE-4 AC17, TE-13 AC1, AC-H23 | FE | 4 point | story TE-13 | Sprint 3 | sau: con ES1-T304 (countdown demo), TE-17-R2-FE3 (cùng file)
- TE-13-R2-BE1: sale-countdown.js (mới, ≤ 2 048 B, lười viewport trang chủ, tải sẵn PDP), featured-product.js (bỏ đếm, ≤ 1 024 B), data-lazy-on="interaction" cho picker/form trong featured-product:333, 392, quiz-dialog.js (quiz:277) sang lười interaction; AC TE-4 AC17, TE-13 AC1, AC-H22, AC-H23 | BE | 3 point | story TE-13 | Sprint 3 | sau: TE-13-R2-FE1, TE-10-R2-BE3
- TE-17-R2-QA1: trang chủ 1280 trên store dev đã cấu hình fixture; AC AC-H1–AC-H5 (1280), TE-2 AC7, TE-7 AC1, D10 | QA | 5 point | story TE-17 | Sprint 3 | sau: TE-17-R2-QA0, TE-17-R2-FE1..FE3, TE-12-R2-FE1, TE-13-R2-FE1
- TE-17-R2-QA2: trang chủ 768/360; AC AC-H35, AC-H31, TE-2 AC2, AC7, AC10 | QA | 5 point | story TE-17 | Sprint 3 | sau: TE-17-R2-QA0, TE-12-R2-BE1, TE-2-R2-BE1
- TE-4-R2-BE1: drafts/dev-be/<ticket>/spike.md; AC TE-4 AC15, AC16 | BE | 3 point | story TE-4 | Sprint 2 | sau: —
- TE-4-R2-FE1: product-variant-picker, base.css, locales; AC TE-4 AC13, AC14, NFR-7 | FE | 5 point | story TE-4 | Sprint 3 | sau: TE-4-R2-BE1
- TE-4-R2-FE2: product-form, product-info, product-sticky-bar, product-structured-data, xoá variant-json, product-variant-select; AC NFR-7, TE-4 AC2, AC11, AC15, AC16 | FE | 4 point | story TE-4 | Sprint 3 | sau: TE-4-R2-FE1
- TE-4-R2-BE2: product-variant-picker.js (≤ 7 168 B); AC TE-4 AC2, AC12–AC16, TE-3 AC10 (bộ chọn), AC-H22 | BE | 5 point | story TE-4 | Sprint 3 | sau: TE-4-R2-FE2
- TE-4-R2-FE3: product, product-media, product-info, base.css, locales; AC TE-4 AC1, AC3, AC17 | FE | 5 point | story TE-4 | Sprint 3 | sau: TE-22-R2-FE1, TE-13-R2-FE1, TE-4-R2-FE2
- TE-4-R2-FE4: product-form, base.css, locales; AC TE-4 AC2, AC3, AC4 | FE | 4 point | story TE-4 | Sprint 3 | sau: TE-4-R2-FE2
- TE-4-R2-FE5: product-details (mới), product-reviews (mới), product-recommendations, product, base.css, locales; AC TE-4 AC3, AC7, P1 | FE | 5 point | story TE-4 | Sprint 3 | sau: con ES1-T304 (.rte), TE-4-R2-FE3
- TE-4-R2-FE6: product-form, base.css, locales; AC TE-4 AC4, AC6 (gift card), AC9, AC19, AC20 | FE | 5 point | story TE-4 | Sprint 3 | sau: TE-4-R2-FE4
- TE-4-R2-FE7: product-form, base.css, locales; AC TE-4 AC18 | FE | 3 point | story TE-4 | Sprint 4 | Should | sau: TE-4-R2-FE6
- TE-4-R2-FE8: product-sticky-bar, base.css, locales; AC TE-4 AC5 | FE | 3 point | story TE-4 | Sprint 3 | sau: TE-4-R2-FE2
- TE-4-R2-BE3: product-media.js (4 407 → ≤ 3 072 B), product-media-lightbox.js (mới, ≤ 2 048 B, lười interaction); AC TE-4 AC1 | BE | 3 point | story TE-4 | Sprint 3 | sau: TE-4-R2-FE3, TE-10-R2-BE2
- TE-4-R2-BE4: product-form.js (≤ 7 168 B); AC TE-4 AC5, AC8, AC15 (nút) | BE | 4 point | story TE-4 | Sprint 3 | sau: TE-4-R2-FE4, TE-4-R2-FE8, TE-10-R2-BE1
- TE-4-R2-BE5: pickup-availability.js (mới, ≤ 2 048 B, lười interaction), product-recommendations.js (≤ 3 072 B, lười viewport); AC TE-4 AC7, AC20 | BE | 4 point | story TE-4 | Sprint 3 | sau: TE-4-R2-FE5, TE-4-R2-FE6
- TE-4-R2-BE6: product-form.js; AC TE-4 AC19 | BE | 3 point | story TE-4 | Sprint 3 | sau: TE-4-R2-BE4, TE-4-R2-FE6
- TE-4-R2-BE7: product-form.js (vẫn ≤ 7 168 B); AC TE-4 AC18 | BE | 3 point | story TE-4 | Sprint 4 | Should | sau: TE-4-R2-BE6, TE-4-R2-FE7
- TE-4-R2-QA1: bộ chọn biến thể; AC TE-4 AC13–AC16, NFR-7, > 250 biến thể | QA | 4 point | story TE-4 | Sprint 3 | sau: TE-4-R2-BE2
- TE-4-R2-QA2: PDP còn lại; AC TE-4 AC1–AC12, AC17, AC19, AC20 (AC18 nếu BE7 không cắt) | QA | 5 point | story TE-4 | Sprint 4 | sau: TE-4-R2-BE3..BE6
- TE-6-R2-FE1: pagination, base.css, locales; AC TE-6 AC6 | FE | 3 point | story TE-6 | Sprint 4 | sau: TE-10-R2-FE2
- TE-6-R2-FE2: collection, collection-banner, collection-products, base.css, locales; AC TE-6 AC1, AC3, AC6, AC7 | FE | 5 point | story TE-6 | Sprint 4 | sau: TE-22-R2-FE1, TE-6-R2-FE1
- TE-6-R2-FE3: collection-filters, filter-group, base.css, locales; AC TE-6 AC2, AC4 | FE | 4 point | story TE-6 | Sprint 4 | sau: TE-10-R2-FE2
- TE-6-R2-FE4: list-collections, collection-card, base.css, locales; AC TE-6 AC5, AC6 | FE | 3 point | story TE-6 | Sprint 4 | sau: TE-6-R2-FE1, TE-22-R2-FE1
- TE-5-R2-FE1: cart-drawer, cart-lines, cart-free-shipping, cart-summary, base.css, locales; AC TE-5 AC1–AC4, AC8, AC10 | FE | 5 point | story TE-5 | Sprint 4 | sau: TE-10-R2-FE2
- TE-5-R2-FE2: cart-page, cart-lines, cart-summary, base.css, locales; AC TE-5 AC5, AC9, AC10 | FE | 5 point | story TE-5 | Sprint 4 | sau: TE-5-R2-FE1
- TE-5-R2-BE1: cart-items.js (5 625 → ≤ 7 168 B); AC TE-5 AC2, AC5, AC8, AC9 | BE | 5 point | story TE-5 | Sprint 4 | sau: TE-5-R2-FE1, TE-5-R2-FE2, TE-10-R2-BE1
- TE-19-R2-FE1: cart-upsell (mới), cart-page, base.css, locales; AC TE-19 (0.5), G2 sổ 10/11 | FE | 3 point | story TE-19 | Sprint 4 | Should | sau: TE-5-R2-FE2, REQ2-BA3
- TE-19-R2-BE1: product-recommendations.js (3 072 → ≤ 4 096 B, lười viewport, ADR 0010); AC TE-19 (0.5) | BE | 3 point | story TE-19 | Sprint 4 | Should | sau: TE-19-R2-FE1, TE-4-R2-BE5, TE-5-R2-BE1
- TE-3-R2-FE2: product.quick-view (mới), product-card, theme, settings_schema.json, base.css, locales; AC TE-3 AC9, AC10, AC12 | FE | 5 point | story TE-3 | Sprint 4 | sau: TE-4-R2-FE1, TE-3-R2-FE1
- TE-3-R2-BE1: quick-view.js (mới, ≤ 6 144 B, lười interaction); AC TE-3 AC10, AC11, TE-11 AC7 | BE | 5 point | story TE-3 | Sprint 4 | sau: TE-3-R2-FE2, TE-4-R2-BE2, TE-10-R2-BE2
- TE-3-R2-QA1: quickview từ trang chủ, collection, search; AC TE-3 AC9–AC12 | QA | 4 point | story TE-3 | Sprint 4 | sau: TE-3-R2-BE1
- TE-19-R2-QA1: upsell cart page; AC TE-19 (0.5) | QA | 3 point | story TE-19 | Sprint 4 | Should | sau: TE-19-R2-BE1
- TE-8-R2-FE1: predictive-search, settings_schema.json (nhóm Search, popular_searches default rỗng, FD2), search-results, base.css, locales; AC TE-8 AC1, FD2 | FE | 4 point | story TE-8 | Sprint 4 | sau: ES1-T129, ES1-T128
- TE-8-R2-BE1: predictive-search.js (≤ 6 656 B tổng sau ES1-T130); AC TE-8 AC1 | BE | 3 point | story TE-8 | Sprint 4 | sau: ES1-T130, TE-8-R2-FE1
- TE-8-R2-BE3: predictive-search.js (vẫn ≤ 6 656 B); AC TE-8 AC1 (recent) | BE | 3 point | story TE-8 | Sprint 4 | Should | sau: TE-8-R2-BE1
- TE-8-R2-BE2: collection-filters.js, thẻ script trong search-results; AC TE-8 AC2, AC3 | BE | 3 point | story TE-8 | Sprint 4 | sau: ES1-T110, ES1-T128
- TE-20-R2-FE1: blog-articles (mới), blog, article-card, base.css, locales; AC TE-9 AC3 (0.4) → TE-20 (0.5), B1–B3 | FE | 5 point | story TE-20 | Sprint 4 | sau: con ES1-T304 (excerpt_or_content), TE-6-R2-FE1, REQ2-BA3
- TE-20-R2-FE2: article-comments (mới), article, base.css, locales; AC TE-9 AC3, TE-6 AC6 (0.4) → TE-20 (0.5), A1–A3 | FE | 5 point | story TE-20 | Sprint 4 | sau: con ES1-T304 (thông báo comment, .rte), TE-6-R2-FE1, TE-7-R2-FE1, REQ2-BA3
- TE-21-R2-FE1: page, page.contact, base.css, locales; AC TE-9 AC2 (0.4) → TE-21 (0.5), R7.6 | FE | 3 point | story TE-21 | Sprint 4 | sau: con ES1-T304 (page.contact, .rte), REQ2-BA3
- TE-21-R2-FE2: not-found (mới), password-hero (mới), 404, password, gift_card, base.css, locales; AC TE-9 AC2 (0.4) → TE-21 (0.5), R7.9 | FE | 5 point | story TE-21 | Sprint 4 | sau: con ES1-T304 (QR, logo, 404 search), REQ2-BA3
- TE-20-R2-QA1: blog, article; AC TE-9 AC3, TE-6 AC6 (0.4) → TE-20 (0.5) | QA | 3 point | story TE-20 | Sprint 4 | sau: TE-20-R2-FE1, TE-20-R2-FE2
- TE-21-R2-QA1: page, contact, 404, password, gift card ở 4 mốc, mọi trạng thái; AC TE-9 AC2 (0.4) → TE-21 (0.5) | QA | 3 point | story TE-21 | Sprint 4 | sau: TE-21-R2-FE1, TE-21-R2-FE2
- TE-11-R2-FE1: quiz, collection.quiz, base.css, locales; AC TE-11 AC3, AC5, AC8 | FE | 5 point | story TE-11 | Sprint 4 | sau: con ES1-T304 (viền radio), TE-10-R2-FE2
- TE-11-R2-BE1: quiz-dialog.js, quiz-finder.js (mỗi file ≤ 4 608 B, lười interaction); AC TE-11 AC3, AC5–AC7 | BE | 5 point | story TE-11 | Sprint 4 | sau: TE-11-R2-FE1, TE-3-R2-BE1
- TE-18-R2-FE1: newsletter-popup, exit-popup (mới), theme, base.css, locales, en.default.schema.json; AC TE-18 AC1, AC4, AC5, AC7–AC9 | FE | 5 point | story TE-18 | Sprint 4 | Should | sau: TE-10-R2-FE2
- TE-18-R2-FE2: offer-popup (mới), theme, base.css, locales; AC TE-18 AC6 | FE | 4 point | story TE-18 | Sprint 4 | Should | sau: TE-13-R2-FE1, TE-10-R2-FE1
- TE-18-R2-BE1: popup-queue.js (mới, ≤ 1 536 B tải sẵn trên trang có popup); AC TE-18 AC1–AC3, TE-10 AC7 | BE | 5 point | story TE-18 | Sprint 4 | Should | sau: TE-18-R2-FE1, TE-10-R2-BE1
- TE-18-R2-BE2: popup-forms.js (mới, ≤ 4 096 B, lười); AC TE-18 AC6, AC7 | BE | 5 point | story TE-18 | Sprint 4 | Should | sau: TE-18-R2-BE1, TE-18-R2-FE2
- TE-18-R2-QA1: popup; AC TE-18 AC1–AC9 | QA | 4 point | story TE-18 | Sprint 4 | Should | sau: TE-18-R2-BE2
- REQ2-BA1: docs/srs.md 0.5 phần trang chủ và sản phẩm; AC thiếu theo ES1-T306, Given store dev (ES1-T308 #1), đo khối ≤ 2 px (ES1-T309 #4), VP2, VP3, HB1, HB2, HD3 | BA | 5 point | story TE-2, TE-3, TE-4, TE-7, TE-12, TE-13, TE-15, TE-16, TE-17 | Sprint 2 | sau: —
- REQ2-BA2: docs/srs.md 0.5 phần khung, giỏ, collection, tìm kiếm, lớp; Follow on Shop, favicon, FD2, layers §3, không cắt tên, .rte, TE-18 AC7 | BA | 5 point | story TE-1, TE-5, TE-6, TE-8, TE-10, TE-11, TE-18 | Sprint 2 | sau: —
- REQ2-BA3: docs/srs.md 0.5 story mới (đánh số CTO 11/11): TE-19 upsell giỏ hàng, TE-20 blog và bài viết, TE-21 trang phụ, TE-22 điều hướng mở rộng; user story + AC GWT + bảng setting | BA | 5 point | story TE-19, TE-20, TE-21, TE-22 | Sprint 2 | sau: —
- REQ2-BA4: docs/requirements-map.md (R5 theo ES1-T308 #3, R6 theo NFR-1, cột Story thêm TE-11..TE-22, R19 writer), drafts/ba/<ticket>/traceability.md bản 0.5 có cột ui-spec, mốc, trạng thái, mã task R2 | BA | 3 point | story TE-1..TE-22 | Sprint 2 | sau: REQ2-BA1, REQ2-BA2, REQ2-BA3
