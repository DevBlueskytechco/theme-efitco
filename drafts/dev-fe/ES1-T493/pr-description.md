KHÔNG CHẮC: sửa tối thiểu trên template skeleton vì ES1-T128 (thay templates/search.liquid bằng blocks/search-results, PR #151) còn ở Sprint 4; khi ES1-T128 rebase sẽ đụng templates/search.liquid — giữ bản của ES1-T128, chỉ cần ô tìm không vượt khung và không còn size="50".

# ES1-T493 — /search mobile tràn ngang, view transition bị huỷ (ES1-T131-B01)

## Nguyên nhân
templates/search.liquid: `<input type="search" size="50">` không giới hạn bề rộng → ở 412px nội dung rộng hơn khung, Chromium nới layout viewport 412 → 583. `@view-transition { navigation: auto; }` trong base.css so kích thước snapshot trang cũ/mới khác nhau → huỷ transition, promise reject → pageerror `InvalidStateError: ... Viewport size changed`.

## Thay đổi
- templates/search.liquid
  - Bỏ `size="50"`; input có `id="SearchPageInput"`, class `search-page__input`, `autocomplete="off"`.
  - Thêm `<label for="SearchPageInput" class="visually-hidden">` (`search.label`) — trước đó input không có label (axe).
  - Form có class `search-page__form`.
  - `search.terms | escape` trước khi truyền vào key `_html` (`no_results_html`, `results_for_html`), theo comment CTO 05/11 ở ES1-T128.
- assets/base.css (khối /** Search page */)
  - `.search-page__form`: flex, wrap, gap `--space-2`, `max-inline-size: 100%`.
  - `.search-page__input`: `flex: 1 1 12rem`, `min-inline-size: 0`, `max-inline-size: 100%`, `box-sizing: border-box`.
  - `.search-results`: thêm `overflow-wrap: anywhere` (tiêu đề dài không khoảng trắng không đẩy ngang).
  - Chỉ token, logical properties, 0 literal màu.
- locales/en.default.json: thêm `search.label` ("Search the store") vào namespace `search` có sẵn, không trùng key.

## Test
- tests/e2e/ES1-T131.spec.ts TC-02: `test.fail` bám `SEARCH_OVERFLOW_B01 = /<input[^>]*\bsize="50"/` trên templates/search.liquid → tự gỡ vì đã bỏ `size="50"`; test phải xanh ở project mobile. Không sửa file spec (việc QA).
- Kiểm cần CI: `/search?q=a` ở 360 và 412: `document.documentElement.scrollWidth <= innerWidth`; Enter từ predictive sang /search: 0 pageerror.

## Tự kiểm tra
- shopify theme check: 0 lỗi (22 warning có sẵn ở file khác, không phải file trong diff).
- 0 file JS trong diff; không templates/*.json.
- gzip base.css: +~150 B so với trước, chưa đo được trong sandbox — chờ CI (trần tạm 57 344 B).
- Playwright ES1-T131 TC-02 mobile + desktop, axe /search, Lighthouse desktop/mobile, ảnh 360/768/1280: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
