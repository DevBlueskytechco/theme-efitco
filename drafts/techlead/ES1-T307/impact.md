KHÔNG CHẮC: (1) 4 điểm kỹ thuật chờ CTO ở ES1-T310 (CSS base.css 232 695 B, sửa ví dụ variant-json trong AGENTS.md, ranh giới ES1-T304, 1 point ≈ 1,5 giờ); (2) `?option_values=` qua partial chưa kiểm trên store, spike TE-4-R2-BE1 chạy trước, ADR 0008 có dự phòng; (3) selector Shopify Inbox, API consent (layers.md ghi KHÔNG CHẮC); (4) số JS hiện tại là cộng tĩnh `wc -c`, số thật chờ CI ES1-T177; (5) ES1-T308 CTO đã chốt 11/11 (nội dung mẫu mặc định trống, store dev cấu hình Figma để đo; chưa nộp Theme Store; R1 Canvas 28/12; review chỉ rating metafield, không app block; trễ thì cắt Should) — kế hoạch đã theo; ES1-T309 #1 (BA: dòng ĐỀ XUẤT trong ui-spec là phạm vi). Im lặng tới 13/11 = nhận mặc định.

## Tóm tắt

- Yêu cầu: BGĐ duyệt thiết kế Efitco ngày 11/11/2026 (vòng 3 + sửa audit ES1-T284 → T294 + thiết kế tuân thủ Theme Store PR #173, đã ở develop `ce08212`). Chuyển sang giai đoạn DEV: mọi màn đã duyệt có ticket FE/BE/QA sẵn sàng chạy. Áp dụng từ 11/11/2026; ticket DEV bắt đầu sau khi CTO trả ES1-T308, T309, T310 (hạn mặc định 13/11), chạy từ Sprint 1 còn lại.
- Đầu ra Tech Lead: `drafts/techlead/ES1-T307/task-split.md` (71 task mới: FE 40 task 170 point, BE 23 task 87 point, QA 8 task 37 point; viết lại 8 ticket mở; đề xuất đóng 8 ticket), 4 ADR mới: `docs/adr/0007-lop-va-dai-day-man-hinh.md`, `0008-bo-chon-bien-the-theo-option-value.md`, `0009-countdown-chung.md`, `0010-phan-bo-ngan-sach-js-theo-trang.md`.
- Hiện trạng code so với thiết kế: trang chủ 1920 đã gần Figma (ES1-T250, T275 đã merge); 1280/768/360 lệch theo index-1280 §6, index-mobile-a §12, -b §11; trang con (search, blog, page, 404, password) còn bản Skeleton thô; chưa có quickview, popup marketing, countdown PDP, localization picker, mega menu, breadcrumb, `.page-banner`; header nền tối chỉ khi có `.slideshow` (base.css 7452–7478).
- Mâu thuẫn:
  - AGENTS.md dòng 384–385, 504 dùng `snippets/variant-json.liquid` làm ví dụ; sổ 10/11 (2048 biến thể), SRS NFR-7, ADR 0008 bỏ snippet này. AGENTS.md thắng theo thứ tự nguồn → CTO sửa ví dụ (ES1-T310 #2) trước khi merge TE-4-R2-FE2.
  - AGENTS.md "≤ 8 KB mỗi file", ADR 0006 "≤ 40 960 B/trang": develop đang vi phạm — `motion.js` 9 161 B; PDP tải sẵn 43 955 B. ADR 0010 phân bổ lại, không nâng trần.
  - AGENTS.md "Lighthouse accessibility ≥ 98" (CI) và SRS NFR-1 "Accessibility 100" (nghiệm thu): không mâu thuẫn, CI giữ ngưỡng CLAUDE.md tới ES1-T301 #1.
  - Skill `cart-variant-logic` dòng 5 hướng dẫn `{{ product.variants | json }}`: trái sổ 10/11, sửa skill (dưới).
  - ES1-T304 và REQ-0002 chồng ở search.liquid, menu 3 cấp: chia ranh giới (task-split §2, ES1-T310 #3).
  - Không mâu thuẫn với SRS 0.4 ngoài các mục BA đã hỏi ở ES1-T309.

## Ảnh hưởng

- Story: TE-1 (header tối, mega, drawer, footer, localization, announcement), TE-2 (hero 1280/768/360, HA1), TE-3 (card chỉ báo, quickview), TE-4 (bộ chọn 2048, PDP, countdown, selling plan, pickup, quantity rule), TE-5 (mini cart, cart page, checkout bar), TE-6 (phân trang chung, collection, list-collections), TE-7 (hàng ngang, lưới tĩnh), TE-8 (search, predictive), TE-9 (blog, article, page, 404, password, gift card), TE-10 (lớp, dải đáy, ngân sách, CSS), TE-11 (popup kết quả quiz), TE-12 (bundle 3 mốc + thanh dính 360), TE-13 (countdown chung), TE-17 (trang chủ 1280/768/360), TE-18 (popup marketing). TE-14, TE-15, TE-16 chỉ qua task hàng ngang/CSS.
- Ticket mở cần sửa body (chi tiết task-split §3): ES1-T98 (cart-drawer dùng `<modal-dialog>`, trần 3 072 B), ES1-T110 (gộp ES1-T111, phạm vi collection.md §5–§9 + chạy trang search, trần 8 192 B, 8 point), ES1-T112, ES1-T128 (nhận search.liquid từ ES1-T304, block `search-results`), ES1-T129 (khung predictive mới), ES1-T130 (lười, `<modal-dialog>`, trần 6 656 B), ES1-T131, ES1-T140, ES1-T99.
- Ticket đề xuất đóng (Orchestrator kiểm PR trước): ES1-T119, ES1-T120, ES1-T147, ES1-T156 (code đã vào qua ES1-T179, T180, T182, T158), ES1-T250, ES1-T275 (đã merge #152, #162), ES1-T248, ES1-T303 (swatch card thành chỉ báo, `product-swatch.js` gỡ khỏi card).
- ES1-T304: giữ các mục CHẶN/NÊN nhỏ; bỏ "search.liquid theo search.md" (→ ES1-T128) và "menu 3 cấp" (→ TE-1-R2-FE2). Task màn chạm cùng file thì blocked_by con ES1-T304 tương ứng (task-split §2).
- Câu hỏi Tech Lead đang mở được trả lời bởi kế hoạch này: ES1-T161 (tên partial theo ngữ cảnh, ADR 0008 mục 3), ES1-T209 (trần `scroll-buttons.js` 1 536 B, TE-7-R2-BE1), ES1-T214 (biến thể không giá gạch → không in countdown; số in bằng Liquid trong partial nên không CLS, ADR 0009), ES1-T249 (gộp vào ES1-T110 viết lại), ES1-T246 (breadcrumb TE-1-R2-FE6, filters ES1-T110). ES1-T301 trả lời riêng.
- Block: sửa header, announcement-bar, footer, slideshow, slideshow-slide, collection-list, testimonials, video-carousel, blog-posts, rich-text, level-card, shop-by-level, featured-collection, quiz, shop-the-look, shop-the-look-row, image-with-text, bundle-builder, featured-product, faq, faq-item, product-media, product-info, product-form, product-sticky-bar, product-recommendations, collection-banner, collection-products, collection-filters, collection-card, cart-drawer, cart-page. Mới: product-details, product-reviews, blog-articles, article-comments, not-found, password-hero, newsletter-popup, exit-popup, offer-popup (+ search-results ở ES1-T128). Snippet mới: breadcrumb, page-title, empty-state, sale-countdown; xoá: variant-json, product-variant-select. Template mới: product.quick-view.
- Assets JS mới: modal-dialog, page-layers, header-drawer, localization-picker, sale-countdown, product-media-lightbox, pickup-availability, quick-view, popup-queue, popup-forms. Giảm byte: motion, header-menu, cart-drawer, product-media. Gỡ khỏi card: product-swatch.
- Skill: cart-variant-logic, js-partials, task-split-fe-be, playwright-theme (dưới).
- Agent: dev-fe, dev-be, qa (task); devops (bước đo JS và gzip CSS trong CI, ES1-T177; dữ liệu ES1-T298); writer (docs/merchant cho 9 block mới + settings mới, ES1-T193); designer (không việc mới; trả lời khi spec lệch lúc dựng); CTO (sửa AGENTS.md ví dụ variant-json + Theme map, ES1-T194).

## Kiến thức cho _chung: kế hoạch DEV REQ-0002 và ADR mới

- Kế hoạch DEV duy nhất: `drafts/techlead/ES1-T307/task-split.md`. Mã task `<story>-R2-<phía><n>`. Thứ tự: nền tảng → header/footer → trang chủ → PDP → collection → cart/quickview → search → blog/trang phụ → popup.
- ADR 0007 (lớp, dải đáy), 0008 (biến thể theo option value), 0009 (countdown chung), 0010 (ngân sách JS theo trang) áp cho mọi task REQ-0002; mâu thuẫn ticket với ADR thì theo ADR và hỏi Tech Lead.
- Ranh giới ES1-T304 ở task-split §2: không làm lại mục của ES1-T304 trong task màn.

## Kiến thức cho dev-fe: lớp, thanh đáy, biến thể, countdown

- Mỗi lớp modal: `<modal-dialog data-layer="<tên>"><dialog aria-labelledby>`; tên lớp cố định: menu, search, cart, quick-view, lightbox, filter, quiz, localization, newsletter, exit, offer, pickup. Lớp không modal (mega, popover localization ≥ 48rem, thẻ big offer ≥ 48rem): `data-layer` + `aria-expanded`.
- Không viết `z-index` số: dùng `var(--layer-*)` (ADR 0007). Thanh đáy: không tự đặt padding, CSS đọc `html[data-bottom-bar]` → `--bottom-bar-height`.
- Không `for variant in product.variants`, không `variant-json`, không `<select>` liệt kê biến thể ở bất kỳ block/snippet nào (ADR 0008). Bộ chọn lặp `option.values`, radio `value="{{ value.id }}"`.
- Countdown chỉ qua `{% render 'sale-countdown' %}` (ADR 0009); không tự in countdown trong block.
- Thẻ `<script>` và `data-lazy-module` / `data-lazy-on` là việc BE; FE đặt thẻ host custom element, `data-testid`, partial theo bảng hợp đồng task-split §4.
- Xoá CSS cũ của phần mình thay trong cùng PR; trần base.css gzip ≤ 49 152 B (đo `gzip -c assets/base.css | wc -c`).

## Kiến thức cho dev-be: ngân sách JS và module chung

- Trần theo ADR 0010: chung mọi trang ≤ 19 456 B, PDP tải sẵn ≤ 38 408 B; mỗi file ≤ 8 192 B. PR ghi `wc -c` từng file chạm và phép cộng theo trang.
- Không `import` tĩnh module theme khác (ES1-T81); dùng element API: `document.querySelector('modal-dialog[data-layer=cart]').open()`, sự kiện `modal:open/close`, `layers:idle`.
- Đổi biến thể: `partials.fetch(...names, { url: fetchUrl + '?option_values=' + ids, signal })` (ADR 0008); PDP mới `replaceState`; quickview không đổi URL trang nền.
- Thanh đáy: chỉ module sở hữu gắn `html[data-bottom-bar="product|cart|bundle"]`, không đo chiều cao.
- Phần không cần lúc tải nạp lười: `data-lazy-on="interaction"` (khi bấm/rê/focus) hoặc viewport (`lazy-module.js`).

## Kiến thức cho qa: kiểm lớp, ngân sách, biến thể

- Mỗi spec màn REQ-0002 kiểm 4 mốc 360/768/1280/1920 + nojs; lớp mở thì `html[data-layer-open]`, thanh đáy và teaser ẩn.
- Ngân sách JS: dùng `performance.getEntriesByType('resource')` lọc `/assets/` + `.js`, tải sẵn ≤ 40 960 B, sau cuộn ≤ 65 536 B (ADR 0006, 0010) trên `/`, PDP, `/collections/all`, `/cart`.
- Biến thể: HTML PDP không chứa `data-product-variants`, không `<select name="id">`; sản phẩm > 250 biến thể (ES1-T298 D3) chọn tổ hợp sau vị trí 250 đúng giá/tồn.
- Countdown: `page.clock` tua; khung không đổi kích thước khi hết giờ.
- Consent, Inbox: giả lập bằng `page.addInitScript` theo API BE ghi ở `{% doc %}` của `page-layers` (TE-10-R2-BE1).

## Kiến thức cho devops: đo JS theo URL và gzip CSS trong CI

- ES1-T177 thêm 2 phép đo chặn merge: JS theme tải sẵn ≤ 40 960 B, sau cuộn ≤ 65 536 B trên 5 URL (`/`, PDP demo, `/collections/all`, `/cart`, `/search?q=bench`); `gzip -c assets/base.css | wc -c` ≤ 49 152 (cảnh báo, chặn khi CTO chốt ES1-T310 #1).
- Kiểm `grep -nE "z-index:\s*-?[0-9]" assets/*.css` = 0 sau khi TE-10-R2-FE1 merge (ADR 0007).

## Kiến thức cho techlead: rà PR giai đoạn REQ-0002

- Chặn ngay PR có: vòng lặp `product.variants` (trừ `bundle-builder` lấy `variants.first`), z-index số, file JS > 8 192 B, lớp modal không qua `<modal-dialog>`, countdown ngoài snippet chung, CSS cũ không xoá khi thay.
- Sau spike TE-4-R2-BE1: cập nhật ADR 0008 (chấp nhận hoặc dự phòng) trước khi TE-4-R2-FE1 vào review.

## Sửa skill cart-variant-logic: bỏ JSON biến thể, chọn biến thể theo option value

Dòng "Variant" thay bằng: "Variant: không dùng `product.variants | json` hay JSON biến thể (sổ 10/11, 2048 biến thể, NFR-7, ADR 0008). Bộ chọn render từ `option.values` (radio `value.id`, trạng thái `value.available`/`value.exists`/`value.selected`). Đổi lựa chọn → gom id option value → `partials.fetch(...names, { url: <product url>?option_values=id1,id2,id3, signal })` → `partials.apply`; server trả giá, tồn, nút, ảnh, countdown, sticky bar. PDP `history.replaceState` `?variant=`; quickview không đổi URL trang nền. Đang tải: Add To Cart `aria-disabled`, không spinner." Dòng "Predictive search": thêm "nạp lười khi bấm; trần 6 656 B (ADR 0010)".

## Sửa skill js-partials: module chung lớp, nạp lười, tên partial theo ngữ cảnh

Thêm 4 dòng: (1) "Lớp modal: dùng `<modal-dialog>` có sẵn (`open()`/`close()`, sự kiện `modal:open/close`), không tự viết Esc/scrim/focus; trạng thái lớp đọc `html[data-layer-open]` và sự kiện `layers:idle` (ADR 0007)." (2) "Không `import` tĩnh module theme khác (ES1-T81); giao tiếp qua element API và CustomEvent." (3) "Nạp lười: `data-lazy-module` + `data-lazy-on="interaction"` cho phần chỉ cần khi tương tác; ngân sách theo trang ADR 0010." (4) "Tên partial không trùng trên một trang: PDP nhiều partial `product-*`; quickview 1 partial `quick-view`; featured product 1 partial `featured-product` (ADR 0008)." Sửa dòng "Web Component" bỏ ví dụ `product-swatch` (gỡ khỏi card) thay bằng `sale-countdown`.

## Sửa skill task-split-fe-be: ghi trần JS và hợp đồng đủ trường

Thêm: "DoD task BE ghi trần byte từng file chạm và phép cộng theo trang theo ADR 0010; task FE ghi trần `critical.css` 10 240 B và base.css gzip. Bảng hợp đồng FE/BE bắt buộc 6 cột: custom element (ai đặt thẻ host), hook `data-*`, `data-testid`, partial, tên lớp `data-layer`, thanh đáy `data-bottom-bar`. Thẻ `<script>` và `data-lazy-module`/`data-lazy-on` trong block thuộc task BE." Sửa "≤ 8 point" thành "3–5 point (≈ ≤ 1 ngày), tối đa 8 khi CTO cho".

## Sửa skill playwright-theme: đo JS theo trang, lớp, countdown

Thêm: "Đo JS: `performance.getEntriesByType('resource')` lọc `/assets/*.js`, cộng `transferSize` lúc tải và sau cuộn hết trang. Lớp: kiểm `html[data-layer-open]`, focus trả về nút mở, Esc, `::backdrop`. Countdown: `page.clock.install()` rồi `runFor`. Không `request.get` JSON storefront (429, CONVENTION.md)."

## Ticket cần tạo

- TE-10-R2-FE1: assets/base.css + critical.css + layout/theme.liquid, 8 biến --layer-*, thay 14 z-index số, html[data-bottom-bar], scroll-padding, max-height 30rem, thẻ page-layers + toast-region; AC TE-10 AC6, AC8; sau —; FE, 4 point
- TE-10-R2-FE2: assets/base.css + snippets/empty-state.liquid + locales, CSS dialog S/M/L, sheet, drawer, close 48, round-button 52, toast, alert, skeleton, panel-muted/saving; AC foundation §15–§18, AC-H7; sau TE-10-R2-FE1; FE, 4 point
- TE-1-R2-FE6: snippets/breadcrumb.liquid + page-title.liquid + base.css .page-banner, JSON-LD BreadcrumbList; AC TE-1 AC7, R11; sau TE-10-R2-FE2; FE, 3 point
- TE-10-R2-FE3: assets/base.css, xoá CSS chết, 44 thuộc tính vật lý sang logical, gzip ≤ 49 152 B; AC TE-14 AC4, NFR-1; sau task FE trang chủ + PDP; FE, 3 point
- TE-10-R2-BE1: assets/page-layers.js ≤ 2 048 B, đếm lớp, consent, Inbox, layers:idle; AC TE-10 AC6, AC7; sau TE-10-R2-FE1; BE, 3 point
- TE-10-R2-BE2: assets/modal-dialog.js ≤ 2 048 B + thẻ script layout, open/close, Esc, backdrop, vuốt sheet, trả focus; AC TE-3 AC10, TE-11 AC5, TE-18 AC8; sau TE-10-R2-FE2; BE, 3 point
- TE-10-R2-BE3: assets/motion.js 9 161 → ≤ 6 144 B + lazy-module.js data-lazy-on interaction ≤ 768 B, bỏ reveal hero; AC AC-H31, TE-2 AC10; sau —; BE, 3 point
- TE-1-R2-FE1: critical.css + base.css + blocks/header + announcement-bar + layout, header tối mọi trang, announcement AN1/AN2, skip link, sentinel 1px; AC TE-1 AC4, AC9, AC-H29; sau TE-10-R2-FE1, con ES1-T304 logo; FE, 4 point
- TE-1-R2-FE2: blocks/header + base.css + locales, mega panel A/B/C, cấp 3, scrim, 2 setting menu, 8 testid; AC TE-1 AC2 (≥ 80rem); sau TE-1-R2-FE1; FE, 5 point
- TE-1-R2-FE3: blocks/header + base.css + locales, drawer modal-dialog 90%/420, cấp 2 + Back, details không JS, Sign In + hàng localization; AC TE-1 AC2, AC3, AC10; sau TE-10-R2-FE2, TE-1-R2-FE2; FE, 5 point
- TE-1-R2-FE4: blocks/footer + base.css + locales, 3 tầng × 4 mốc, accordion 360, trạng thái input, Follow on Shop; AC TE-1 AC6, AC-H28; sau TE-1-R2-FE1, con ES1-T304 payment icons; FE, 4 point
- TE-1-R2-FE5: blocks/footer + header + base.css + locales, nút gộp, popover 2 cột, sheet 2 tab, ô tìm > 10 nước, 9 testid; AC TE-1 AC5, AC10; sau TE-1-R2-FE4, FE3; FE, 4 point
- TE-1-R2-BE1: assets/header-menu.js ≤ 3 072 B + header-drawer.js ≤ 4 096 B lười, mega bàn phím, drawer cấp 2; AC TE-1 AC2, AC10; sau TE-1-R2-FE2, FE3, TE-10-R2-BE2; BE, 5 point
- TE-1-R2-BE2: assets/localization-picker.js ≤ 4 096 B lười, tab, lọc nước, chọn là submit; AC TE-1 AC10; sau TE-1-R2-FE5; BE, 3 point
- TE-1-R2-QA1: tests/e2e header, menu, footer, localization, announcement, tài khoản 4 mốc + nojs; AC TE-1 AC2–AC6, AC9, AC10, AC-H28, AC-H29; sau TE-1-R2-BE1, BE2; QA, 5 point
- TE-2-R2-FE1: blocks/slideshow + slideshow-slide + critical.css + templates/index, hero 1280/768/360, overlay 30, focal, display fluid, chữ hiện dần CSS; AC TE-2 AC2, AC6, AC7, AC10; sau TE-10-R2-FE1, TE-1-R2-FE1; FE, 5 point
- TE-2-R2-BE1: assets/slideshow.js ≤ 8 192 B, chấm 360 aria-current, inert, vuốt, autoplay dừng; AC TE-2 AC7–AC9; sau TE-2-R2-FE1; BE, 3 point
- TE-7-R2-FE1: blocks/collection-list + testimonials + video-carousel + blog-posts + base.css, bề card R4 1280, testimonials hàng ngang, lưới tĩnh data-static; AC TE-7 AC1, AC-H8, H9, H21, H24, H26, H27; sau TE-10-R2-FE2; FE, 5 point
- TE-7-R2-BE1: assets/scroll-buttons.js ≤ 1 536 B, data-static khi không cuộn, passive + AbortController; AC TE-7 AC1; sau TE-7-R2-FE1; BE, 3 point
- TE-17-R2-FE1: blocks/rich-text + level-card + shop-by-level + featured-collection + base.css, intro 768, level dưới 80rem, bestseller 768 4 cột; AC AC-H10, AC-H11, TE-3 AC1, AC-H35; sau TE-10-R2-FE1, con ES1-T304 index demo; FE, 4 point
- TE-3-R2-FE1: snippets/product-card + base.css + locales, swatch chỉ báo aria-hidden, ", N colors", 3 + "+N", bỏ thẻ product-swatch; AC TE-3 AC2, AC6, AC8; sau con ES1-T304 swatch/không cắt tên; FE, 3 point
- TE-3-R2-BE2: gỡ assets/product-swatch.js khỏi featured-collection:278, collection-products:223, quiz:280; AC TE-3 AC2, ADR 0010; sau TE-3-R2-FE1; BE, 3 point
- TE-17-R2-FE2: blocks/quiz + shop-the-look + shop-the-look-row + image-with-text + base.css + locales, quiz 1280/360, shop the look 8+4 và 768, make fitness ảnh rải; AC TE-11 AC4, TE-12 AC5, AC-H19, H20, H35; sau TE-10-R2-FE2; FE, 5 point
- TE-12-R2-FE1: blocks/bundle-builder + base.css + locales, 7+5 / 3 cột / 2 cột, thanh dính 360 hidden, tổng Liquid; AC TE-12 AC1, AC-H18, HB1; sau TE-10-R2-FE1, con ES1-T304 tier 0; FE, 4 point
- TE-12-R2-BE1: assets/bundle-form.js ≤ 7 168 B, IntersectionObserver thanh 360, data-bottom-bar bundle, --bundle-bar-height; AC TE-12 AC1, AC3, HB1, HB2; sau TE-12-R2-FE1, TE-10-R2-BE1; BE, 3 point
- TE-17-R2-FE3: blocks/featured-product + image-with-text (why) + faq + faq-item + base.css + locales, 3 mốc, partial featured-product; AC TE-13 AC2, AC-H22, TE-7 AC2, AC3; sau con ES1-T304 rich media; FE, 4 point
- TE-13-R2-FE1: snippets/sale-countdown.liquid + blocks/featured-product + base.css + locales, component chung ADR 0009, xoá .featured-product__countdown*; AC TE-4 AC17, TE-13 AC1, AC-H23; sau con ES1-T304 countdown demo; FE, 4 point
- TE-13-R2-BE1: assets/sale-countdown.js ≤ 2 048 B + featured-product.js ≤ 1 024 B + lười interaction featured/quiz; AC TE-4 AC17, TE-13 AC1, AC-H22, H23; sau TE-13-R2-FE1, TE-10-R2-BE3; BE, 3 point
- TE-17-R2-QA1: tests/e2e trang chủ 1280, đo 16 khối theo index-1280 §1 lệch ≤ 2 px; AC AC-H1–H4 (1280), TE-2 AC7, TE-7 AC1; sau task FE 6.2; QA, 5 point
- TE-17-R2-QA2: tests/e2e trang chủ 768/360, thanh bundle, teaser, JS sau cuộn; AC AC-H35, AC-H31, TE-2 AC2, AC7, AC10, HB1, HB2; sau TE-12-R2-BE1, TE-2-R2-BE1; QA, 5 point
- TE-4-R2-BE1: spike drafts/dev-be/<ticket>/spike.md, partials.fetch với ?option_values= trên sản phẩm > 250 biến thể; AC TE-4 AC15, AC16; sau —; BE, 3 point
- TE-4-R2-FE1: snippets/product-variant-picker + base.css + locales, option value, 3 trạng thái, 7 + "+N", swatch 36/72, VP3, id_prefix, partial product-options; AC TE-4 AC13, AC14, NFR-7; sau TE-4-R2-BE1; FE, 5 point
- TE-4-R2-FE2: blocks/product-form + product-info + product-sticky-bar + snippets/product-structured-data, xoá variant-json + product-variant-select, 7 partial PDP, VP1; AC NFR-7, TE-4 AC2, AC11, AC15, AC16; sau TE-4-R2-FE1, ES1-T310 #2; FE, 4 point
- TE-4-R2-BE2: assets/product-variant-picker.js ≤ 7 168 B, fetch option_values, AbortController, aria-busy, replaceState, lỗi + retry; AC TE-4 AC2, AC12–AC16, AC-H22; sau TE-4-R2-FE2; BE, 5 point
- TE-4-R2-FE3: templates/product + blocks/product-media + product-info + base.css + locales, thứ tự khối, breadcrumb, gallery, lightbox, giá/rating, countdown; AC TE-4 AC1, AC3, AC17; sau TE-1-R2-FE6, TE-13-R2-FE1, TE-4-R2-FE2; FE, 5 point
- TE-4-R2-FE4: blocks/product-form + base.css + locales, stepper, tồn, nút + icon, Buy It Now secondary, biến CSS accelerated, assurance 7 setting; AC TE-4 AC2, AC3, AC4; sau TE-4-R2-FE2; FE, 4 point
- TE-4-R2-FE5: blocks/product-details + product-reviews (mới) + product-recommendations + templates/product + base.css + locales, accordion 3 mục, tóm tắt rating, complementary gọn, related hàng ngang; AC TE-4 AC3, AC7, P1; sau con ES1-T304 .rte, TE-4-R2-FE3; FE, 5 point
- TE-4-R2-FE6: blocks/product-form + base.css + locales, selling plan thẻ + select tần suất, pickup dòng + dialog + details; AC TE-4 AC4, AC9, AC19, AC20; sau TE-4-R2-FE4; FE, 4 point
- TE-4-R2-FE7: blocks/product-form + base.css + locales, quantity rule, bảng volume pricing, gift card 2 cột + lỗi; AC TE-4 AC6, AC18; sau TE-4-R2-FE4; FE, 4 point
- TE-4-R2-FE8: blocks/product-sticky-bar + base.css + locales, 3 bố cục, Sold out, Choose Options, show_on_desktop true; AC TE-4 AC5; sau TE-4-R2-FE2; FE, 3 point
- TE-4-R2-BE3: assets/product-media.js ≤ 3 072 B + product-media-lightbox.js ≤ 2 048 B lười; AC TE-4 AC1; sau TE-4-R2-FE3, TE-10-R2-BE2; BE, 3 point
- TE-4-R2-BE4: assets/product-form.js ≤ 7 168 B, stepper, sticky bar data-bottom-bar product, Choose Options cuộn + focus, toast lỗi; AC TE-4 AC5, AC8, AC15; sau TE-4-R2-FE4, FE8, TE-10-R2-BE1; BE, 4 point
- TE-4-R2-BE5: assets/pickup-availability.js ≤ 2 048 B lười + product-recommendations.js ≤ 3 072 B lười viewport, nút thêm complementary; AC TE-4 AC7, AC20; sau TE-4-R2-FE5, FE6; BE, 4 point
- TE-4-R2-BE6: assets/product-form.js, selling plan đổi giá chính, quantity rule bước/min/max/lỗi; AC TE-4 AC18, AC19; sau TE-4-R2-BE4, FE6, FE7; BE, 4 point
- TE-4-R2-QA1: tests/e2e bộ chọn biến thể, > 250 biến thể, bấm liên tiếp, lỗi mạng; AC TE-4 AC13–AC16, NFR-7; sau TE-4-R2-BE2; QA, 4 point
- TE-4-R2-QA2: tests/e2e PDP còn lại 4 mốc, B2B mockup; AC TE-4 AC1–AC12, AC17–AC20; sau TE-4-R2-BE3..BE6; QA, 5 point
- TE-6-R2-FE1: snippets/pagination + base.css + locales, nút tròn 52, đầu/cuối aria-disabled, Page X of Y; AC TE-6 AC6; sau TE-10-R2-FE2; FE, 3 point
- TE-6-R2-FE2: templates/collection + blocks/collection-banner + collection-products + base.css + locales, page-banner, 3/9, toolbar dính, chip, empty, ?page= vượt; AC TE-6 AC1, AC3, AC6, AC7; sau TE-1-R2-FE6, TE-6-R2-FE1; FE, 5 point
- TE-6-R2-FE3: blocks/collection-filters + snippets/filter-group + base.css + locales, N selected, Show N more, drawer filter + chân dính; AC TE-6 AC2, AC4; sau TE-10-R2-FE2; FE, 4 point
- TE-6-R2-FE4: templates/list-collections + blocks/collection-card + base.css + locales, breadcrumb, card 336/220, phân trang; AC TE-6 AC5, AC6; sau TE-6-R2-FE1, TE-1-R2-FE6; FE, 3 point
- TE-5-R2-FE1: blocks/cart-drawer + snippets/cart-lines + cart-free-shipping + cart-summary + base.css + locales, mini cart theo spec, ghi chú details, Added status; AC TE-5 AC1–AC4, AC8, AC10; sau TE-10-R2-FE2; FE, 5 point
- TE-5-R2-FE2: blocks/cart-page + snippets/cart-lines + cart-summary + base.css + locales, lưới 5 cột, panel dính, thanh checkout hidden, empty, quantity rule dòng; AC TE-5 AC5, AC9, AC10; sau TE-5-R2-FE1; FE, 5 point
- TE-5-R2-BE1: assets/cart-items.js ≤ 7 168 B, stepper, quantity rule, ghi chú lưu, Updating, thanh checkout data-bottom-bar cart; AC TE-5 AC2, AC5, AC8, AC9; sau TE-5-R2-FE1, FE2, TE-10-R2-BE1; BE, 5 point
- TE-3-R2-FE2: templates/product.quick-view.liquid (mới) + snippets/product-card + layout + config/settings_schema + base.css + locales, nút Quick View, dialog M/sheet, partial quick-view rich media; AC TE-3 AC9, AC10, AC12; sau TE-4-R2-FE1, TE-3-R2-FE1; FE, 5 point
- TE-3-R2-BE1: assets/quick-view.js ≤ 6 144 B lười, fetch ?view=quick-view, loading/error, thêm giỏ theo cart_type, chế độ nhúng quiz; AC TE-3 AC10, AC11, TE-11 AC7; sau TE-3-R2-FE2, TE-4-R2-BE2, TE-10-R2-BE2; BE, 5 point
- TE-3-R2-QA1: tests/e2e quickview trang chủ, collection, search, sheet, nojs; AC TE-3 AC9–AC12; sau TE-3-R2-BE1; QA, 4 point
- TE-8-R2-FE1: snippets/predictive-search + config/settings_schema popular_searches + blocks/search-results + base.css + locales, 5 tab, queries, khám phá, recent, empty/error/skeleton; AC TE-8 AC1, FD2; sau ES1-T129, ES1-T128; FE, 4 point
- TE-8-R2-BE1: assets/predictive-search.js ≤ 6 656 B, tab, queries, recent localStorage 5, trạng thái; AC TE-8 AC1; sau ES1-T130, TE-8-R2-FE1; BE, 4 point
- TE-8-R2-BE2: assets/collection-filters.js + thẻ script blocks/search-results, partial search-products/search-filters, replaceState; AC TE-8 AC2, AC3; sau ES1-T110, ES1-T128; BE, 3 point
- TE-9-R2-FE1: blocks/blog-articles (mới) + templates/blog + snippets/article-card + base.css + locales, nav chủ đề, bài nổi bật, phân trang; AC TE-9 AC3, B1–B3; sau con ES1-T304 excerpt, TE-6-R2-FE1; FE, 5 point
- TE-9-R2-FE2: blocks/article-comments (mới) + templates/article + base.css + locales, ảnh bìa, bài liên quan, bình luận Comment pages; AC TE-9 AC3, TE-6 AC6; sau con ES1-T304 comment, TE-6-R2-FE1, TE-7-R2-FE1; FE, 5 point
- TE-9-R2-FE3: templates/page + page.contact + base.css + locales, tiêu đề, .rte, PG1–PG2, form liên hệ; AC TE-9 AC2, R7.6; sau con ES1-T304 page.contact, .rte; FE, 3 point
- TE-9-R2-FE4: blocks/not-found + password-hero (mới) + templates/404 + password + gift_card + base.css + locales, theo 404.md, password.md, gift-card.md; AC TE-9 AC2, R7.9; sau con ES1-T304 QR, logo, 404; FE, 5 point
- TE-9-R2-QA1: tests/e2e blog, article, page, contact, 404, password, gift card; AC TE-9 AC2, AC3, AC5, TE-6 AC6; sau TE-9-R2-FE1..FE4; QA, 4 point
- TE-18-R2-FE1: blocks/newsletter-popup + exit-popup (mới) + layout + base.css + locales, 10 setting, form customer, 3 trạng thái, nội dung giỏ/mã; AC TE-18 AC1, AC4, AC5, AC7–AC9; sau TE-10-R2-FE2, ES1-T301 #2; FE, 5 point
- TE-18-R2-FE2: blocks/offer-popup (mới) + layout + base.css + locales, teaser theo --bottom-bar-height, thẻ popover/sheet, countdown compact; AC TE-18 AC6; sau TE-13-R2-FE1, TE-10-R2-FE1; FE, 4 point
- TE-18-R2-BE1: assets/popup-queue.js ≤ 1 536 B, trigger, hàng đợi, nghỉ 3 s, tần suất, consent; AC TE-18 AC1–AC3, TE-10 AC7; sau TE-18-R2-FE1, TE-10-R2-BE1; BE, 5 point
- TE-18-R2-BE2: assets/popup-forms.js ≤ 4 096 B lười, gửi newsletter, already subscribed, copy mã, teaser mở thẻ; AC TE-18 AC6, AC7; sau TE-18-R2-BE1, FE2; BE, 5 point
- TE-18-R2-QA1: tests/e2e popup + lớp 360/1280, page.clock, Inbox + consent giả lập; AC TE-18 AC1–AC9, TE-10 AC6–AC8; sau TE-18-R2-BE2; QA, 5 point
- TE-11-R2-FE1: blocks/quiz + templates/collection.quiz + base.css + locales, popup kết quả L/sheet, skeleton, đếm, empty, lỗi, khung quickview nhúng, trang ?view=quiz; AC TE-11 AC3, AC5, AC8; sau con ES1-T304 viền radio, TE-10-R2-FE2; FE, 5 point
- TE-11-R2-BE1: assets/quiz-dialog.js + quiz-finder.js ≤ 4 608 B mỗi file lười, Add To Cart giữ popup, QZ2 quickview nhúng, Retake; AC TE-11 AC3, AC5–AC7; sau TE-11-R2-FE1, TE-3-R2-BE1; BE, 5 point
