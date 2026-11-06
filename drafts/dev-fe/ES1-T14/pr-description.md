KHÔNG CHẮC: (1) CHƯA chạy trên preview: Playwright, axe, lhci, ảnh 360/768/1280, ui-diff đều chưa có; phiên này không chạy được Shopify CLI (sandbox chặn ghi ~/Library/Preferences, chạy ngoài sandbox bị từ chối), node_modules chưa cài. (2) Không đọc được Figma 1:362 → logo trái, nav giữa, chữ menu 14px/500, cao header 80px (suy từ inventory: header y=24, hero y=80) là suy đoán. (3) `{% partial %}` trong header khiến mọi trang phụ thuộc `agentic_editor_enabled` — đã tạo ticket question cho Tech Lead. (4) Sentinel đặt ở layout, không ở block — xem "Lệch so với ticket". (5) Diff khoảng 540 dòng > 400 do gộp FE2 + FE5 (ES1-T17) theo quyết định CTO 30/10.

# feat(blocks): header 2 cấp, drawer, sticky + trong suốt trên hero [ES1-T14]

## Làm gì
- `blocks/header.liquid`: viết lại. Setting: `logo`, `logo_width`, `menu` (default `main-menu`), `customer_account_menu`, `sticky_header` (default bật). Logo/tên shop là `<a>`, không heading.
- Nav ≥ 80rem: mục có con = `details/summary`, không con = `a`, chỉ 2 cấp. Dưới 80rem: drawer `details[scroll-lock]`, accordion `details` lồng, mở nhiều mục.
- `aria-controls` + id submenu đã render; không render `aria-expanded` tĩnh. Có `aria-current="page"` cho link hiện tại.
- Cart link trong `{% partial 'cart-count' %}`, tên từ locale có số nhiều, ẩn badge khi 0. Search = `routes.search_url`. `<shopify-account>` giữ, testid trên chính thẻ.
- `snippets/header-icon.liquid` (mới): icon menu/close/search/chevron inline.
- `assets/critical.css`: CSS header, thêm `.visually-hidden`. 9785 byte, dưới ngân sách 10 KB ADR 0003. `assets/base.css`: bỏ CSS header Skeleton, giữ placeholder editor.
- `snippets/css-variables.liquid`: thêm `--header-height` (space × 20 = 80px).
- `locales/`: key `blocks.header.*`, label + info setting mới.
- Menu rỗng: không render nav và drawer toggle; trong editor có placeholder hướng dẫn.

## Vì sao
ES1-T14 (TE-1-FE2 của task, gộp ES1-T17 TE-1-FE5). SRS TE-1 AC2 (markup, chạy không JS), AC3, AC9 (header). Spec: drafts/techlead/ES1-T11/task-split.md D2, D5, D8.

## Hợp đồng cho BE / QA / TE-2
- 16 testid: header, header-logo, header-menu, header-menu-item, header-menu-toggle, header-submenu, header-drawer-toggle, header-drawer, header-drawer-close, header-drawer-accordion-toggle, header-drawer-submenu, header-account, header-search-link, header-cart-link, header-cart-count, header-sticky-sentinel.
- `header-menu-item` dùng cả trong nav lẫn drawer (spec TC-12 đếm trong drawer).
- `header-drawer` nằm trên panel bên trong `details`, không phải trên `details` (spec cần panel ẩn khi đóng).
- BE1 (ES1-T16): gắn `aria-expanded`, hover, Esc, focus trap, nút close; thêm thẻ script `header-menu.js`. FE chưa thêm vì file chưa có.
- BE2 (ES1-T18): gắn `data-header-enhanced`, `data-scrolled` trên `.site-header`; đọc `data-sticky` để biết setting bật. Sentinel cao 80px ở đầu body.
- TE-2: đặt `data-header-overlay` trên root hero, hero nằm trong con đầu tiên của `<main>`. Hook ghi trong doc của block.

## Lệch so với ticket
- Sentinel ở `layout/theme.liquid`, không trong block: phần tử trong container sticky dính theo nên IntersectionObserver không bao giờ báo. Thêm 1 dòng layout.
- Thêm `margin-block-end: calc(-1 * var(--header-height))` trên container khi có hero: ticket chỉ nêu nền trong suốt, nhưng không kéo main lên thì chữ trắng nằm trên nền trắng, không đè hero.
- Không tạo `assets/icon-search.svg`: scope-guard chỉ cho FE ghi `assets/*.css`, nên icon nằm trong snippet.
- Không tạo `tests/e2e/ES1-T14.spec.ts` và không bỏ `fixme`: `tests/` ngoài phạm vi dev-fe; spec ES1-T5 mới ở nhánh `feature/ai-ES1-T5`, chưa vào develop.

## Hành vi cần kiểm kỹ
- Drawer không JS: khi mở, summary thành backdrop fixed, bấm ngoài panel là đóng. Nút `header-drawer-close` ẩn bằng `@media (scripting: none)`.
- TB-15: `<shopify-account>` có thể không có focus ring đo được trên host (shadow DOM). Chưa kiểm được, nếu fail cần thêm CSS.
- Logo ảnh tối trên hero: không có setting logo sáng, ticket không cho thêm setting.
- Phần trong suốt chỉ kiểm được khi TE-2 hero merge.

## Cách test
- `shopify theme check` → 33 file, 0 offense.
- Sau khi Orchestrator push `feature/ai-ES1-T14`, CI tạo preview. Lấy spec: `git show feature/ai-ES1-T5:tests/e2e/ES1-T5.spec.ts`, rồi chạy:
  `npx playwright test tests/e2e/ES1-T5.spec.ts -g "TC-05|TC-10|TC-15|TC-1[6-9]|TB-05|TB-11|TB-13|TB-15|TB-20"`
- TC-13 trở đi và TC-11 cần BE1 (`aria-expanded`). Main-menu store dev phải có mục cấp 2 và mục không con.
- Tay: tắt JS trên trang có hero → header không sticky; tắt `sticky_header` → không sticky; /collections/all, /cart, /search nền `--color-background`.
- `npx lhci autorun`.

## Ảnh (360 / 768 / 1280)
Chưa có — cần preview.

## Checklist
- [x] theme check 0 lỗi, `.theme-check.yml` không đổi
- [ ] Lighthouse: perf ≥ 96 desktop / ≥ 90 mobile, a11y ≥ 98 — chưa chạy
- [ ] Playwright, axe, ảnh, ui-diff 1:362 — chưa chạy
- [x] Không file JS trong diff
- [x] Chuỗi qua `| t`; URL qua `routes.*`
- [x] 0 màu literal, 0 `!important` trong CSS mới
- [x] KHÔNG CHẮC: xem dòng đầu

🤖 Generated with [Claude Code](https://claude.com/claude-code)
