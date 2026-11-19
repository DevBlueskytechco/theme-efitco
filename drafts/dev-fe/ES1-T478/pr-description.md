KHÔNG CHẮC: (1) AGENTS.md, docs/architecture.md:10, drafts/techlead/ES1-T307/task-split.md:110/:119 bị scope-guard chặn dev-fe; nội dung sửa sẵn ở drafts/dev-fe/ES1-T478/docs-patch.md, CTO/Orchestrator áp trước merge. (2) Spec fixture (page.setContent, Chromium) không chạy được trong sandbox phiên dev-fe; đã sửa theo đọc code, chờ CI.

# ES1-T478 TE-10 FE: tách CSS theo template (ADR 0013, CTO ES1-T472 a)

## Thay đổi
- `assets/base.css`: còn token/khung chung (header, footer, drawer menu, cart drawer, modal, toast, nút, form, product card, breadcrumb/page-title, pagination) + toàn bộ block trang chủ. Giữ ở base theo DoD Tech Lead ES1-T479: quick view, product-media, variant picker, product-form, sale-countdown, cart-lines, cart-summary, cart-free-shipping.
- `assets/product.css` (mới): product-info, product-sticky-bar, product-recommendations.
- `assets/collection.css` (mới): collection page, toolbar, lọc (collection-filters), list collections, search page.
- `assets/cart.css` (mới): phần riêng trang /cart (cart-page, cart-summary--page, cart-sticky-checkout, cart-lines__head).
- `assets/aux.css` (mới): blog, gift card, 404, password, form chung trang phụ (contact, comment), article.
- `layout/theme.liquid`: 1 `{%- case template.name -%}` ngay sau base.css: `product` → product.css; `collection`, `search`, `list-collections` → collection.css; `cart` → cart.css; `404`, `page`, `blog`, `article`, `password` → aux.css. Không preload.
- `layout/password.liquid`, `templates/gift_card.liquid`: aux.css ngay sau base.css, không preload.
- Không đổi critical.css, không file JS trong diff.

## Bảng gzip (Node zlib.gzipSync mức mặc định)
| File | Thô trước | Gzip trước | Thô sau | Gzip sau | Trần |
|---|---|---|---|---|---|
| base.css | 317 541 | 57 154 | 257 148 | 47 798 | 49 152 |
| product.css | — | — | 6 794 | 2 149 | 16 384 |
| collection.css | — | — | 11 773 | 2 876 | 16 384 |
| cart.css | — | — | 6 285 | 1 623 | 16 384 |
| aux.css | — | — | 37 375 | 6 734 | 16 384 |
| critical.css (thô) | 10 082 | 3 102 | 10 082 | 3 102 | 10 240 thô |

"Trước" = origin/develop tại thời điểm làm. Tổng CSS gzip mỗi trang (base + file template): home 47 798 (−9 356), PDP 49 947, collection/search 50 674, cart 49 421, trang phụ 54 532; mọi trang đều nhỏ hơn 57 154 trước đó.

## Spec
- `tests/e2e/ES1-T478.spec.ts` (tĩnh): trần gzip base/4 file template/critical; 1 case template.name sau base.css, mỗi file đúng 1 lần, không preload, đúng nhóm; password + gift card nạp aux.css ngay sau base.css; không prelude trùng giữa base.css và file template hay giữa 2 file template.
- Sửa spec đọc `assets/base.css` cho rule đã chuyển:
  - ES1-T326: mốc END → `.pagination__list {` (Collection page đã chuyển), trần 57 344 → 49 152.
  - ES1-T366: mục lọc đọc từ collection.css, fixture nạp base + collection.css, kiểm drawer cũ trên cả 2 file.
  - ES1-T369: cartCss = mục Cart ở base + cart.css, fixture nạp cart.css, trần base 57 344 → 49 152, thêm cart.css ≤ 16 384.
  - ES1-T381: quét base + aux.css. ES1-T382: mục article đọc aux.css, fixture thêm aux.css. ES1-T383, ES1-T386: fixture thêm aux.css.
  - ES1-T384: QR gift card đọc aux.css, rule cũ ES1-T408 kiểm cả base + aux. ES1-T67: sticky bar đọc product.css. ES1-T403: product-info__description kiểm base + product.css, D5 quét cả 4 file template.
  - ES1-T387, ES1-T466: trần tạm 57 344 → 49 152 (comment ES1-T472).
  - ES1-T217 TC-04/05, ES1-T171 TC-11: quét base + 4 file template (giữ độ phủ literal màu, margin/padding vật lý, bo góc).
- ES1-T326.spec.ts:126 đã sửa 53248/57344 → 49152 theo DoD Tech Lead.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn ở bundle-builder, featured-product, quiz-step, testimonial-item, index*.liquid; không file nào thuộc diff). `.theme-check.yml` không đổi.
- Spec tĩnh (không trình duyệt) chạy local: ES1-T478 4/4 xanh; ES1-T217, T171, T326, T366, T369, T381, T382, T383, T384, T386, T387, T403, T466, T67: 75 passed, 0 lỗi expect. Test fixture/store cần Chromium: sandbox chặn mở trình duyệt → chờ CI.
- Rủi ro cần CI xác nhận: rule chuyển sang file template nay đứng sau toàn bộ base.css trong cascade; spec ES1-T478 chặn prelude trùng, còn ảnh 3 breakpoint/visual diff chờ CI.
- Lighthouse (/, 1 PDP, 1 collection, /cart, /pages/contact): chờ CI. DoD: home không giảm so với develop; trang còn lại không giảm quá 2 điểm mobile.
- File nháp lượt 1 (b01..b12.css, base.before.css, measure.spec.ts, playwright.*.config.ts) đã xoá.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
