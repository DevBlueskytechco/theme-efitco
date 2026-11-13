KHÔNG CHẮC: (1) Spec E2E, axe, Lighthouse và ảnh 3 breakpoint chưa chạy vì phiên này không có preview: chờ CI. (2) Placeholder dùng chữ trung tính "Search products, collections, and more", không dùng "Search benches, kettlebells, mats…" của predictive-search.md §7, theo ADR 0011 #3: locale không giữ chữ mẫu theo thương hiệu. (3) `assets/modal-dialog.js` và `assets/predictive-search.js` chưa có trên develop (BE: TE-10-R2-BE2, ES1-T130). Vì vậy khi có JS, bấm icon search vẫn sang /search, và spec tự gọi `showModal()`. (4) Spec mới nằm ở `drafts/dev-fe/ES1-T129/ES1-T129.spec.ts` vì scope-guard chặn dev-fe ghi tests/. Orchestrator cần chép đè lên `tests/e2e/ES1-T129.spec.ts`; spec cũ sẽ fail vì nextElementSibling bây giờ là `modal-dialog`.

# ES1-T129 TE-8-FE2 (lượt 2): khung search popup + drawer, `<modal-dialog data-layer="search">`

Nguồn: drafts/techlead/ES1-T307/task-split.md §3 dòng ES1-T129; docs/ui-spec/predictive-search.md §1–§3, §11; ADR 0007; docs/srs.md#TE-8 AC1, AC3. PR #86 đã đóng mà không merge, nên lượt này làm lại trên develop mới (có ES1-T313: `.drawer`, `.close-button`, `--overlay-scrim`, `modal-dialog { display: contents }`).

## Thay đổi
- `snippets/predictive-search.liquid` (viết lại):
  - Bọc `<modal-dialog data-layer="search">`. Dialog dùng `aria-labelledby` trỏ tới h2 "Search", thay cho `aria-label`.
  - `data-style="popup|drawer"` lấy từ tham số `style`.
  - Popup: thanh `.predictive-search__bar` gồm h2 ẩn, logo (từ 80rem), form và nút đóng 48.
  - Drawer: thêm class `drawer drawer--end drawer--wide`, h2 hiện ra với class `.drawer__title`.
  - Form GET: nút submit kính lúp ở đầu ô, label ẩn, input combobox, nút xoá `type="reset"` (`predictive-search-clear`).
  - Listbox gồm 4 nhóm, dựng bằng vòng lặp. Giữ nguyên 2 thẻ template, live region, option "all" và mọi hook `data-predictive-*` cũ.
- `blocks/header.liquid`:
  - Thêm setting `search_style` (select, Popup/Drawer, default popup), theo predictive-search.md §5.
  - Truyền `style`, `logo`, `logo_width` vào snippet. Doc comment cập nhật hợp đồng nextElementSibling.
- `assets/base.css`: thay toàn bộ khối `.predictive-search*` cũ.
  - Popup dưới 48rem phủ đủ màn 100dvh. Từ 48rem là dải trên, rộng 100%, cao ≤ 80dvh, bo 2 góc dưới.
  - Thanh tối dùng nền `--color-background-dark` + `noise-dark.png`, cao `--header-height`.
  - Từ 80rem chia lưới 12: logo cột 1–3, ô cột 4–11, nút đóng cột 12.
  - Lề trong khớp lưới nội dung của header (`--search-gutter`).
  - Ô kiểu nền tối: viền `--color-muted-on-dark`; hover viền trắng; focus outline 2px trắng.
  - Drawer: viền ô `--color-muted-light`, focus accent. Dùng lại `.drawer` và chuyển động chung.
  - Nút đóng popup: nền trong suốt, viền trắng 24%; hover nền trắng, icon tối.
  - Nút xoá ẩn khi `:placeholder-shown`. Ẩn nút cancel native của `type=search`.
  - Tiêu đề nhóm 14/600 uppercase `--color-muted`. Option cao ≥ 44; `aria-selected` có nền alt + outline 2px foreground.
  - Popup trượt 24px + mờ dần trong `prefers-reduced-motion: no-preference`, dùng `@starting-style`.
  - Chỉ dùng thuộc tính logical, 0 literal màu, 0 `z-index`.
- `locales/en.default.json`: thêm `blocks.predictive_search.clear` và `placeholder`.
- `locales/en.default.schema.json`: thêm `labels.search_style`, `options.search_style.popup|drawer`.

## Hợp đồng cho BE (ES1-T130, TE-10-R2-BE2)
- `header-search-link.nextElementSibling` là `<modal-dialog data-layer="search">`; `firstElementChild` là `<dialog data-testid="predictive-search-dialog">`. Mở/đóng, Esc, backdrop và trả focus do `modal-dialog.js` lo (ADR 0007 #5).
- Trên `<predictive-search>` giữ nguyên các thuộc tính `data-url`, `data-money-format`, `data-label-count` (`%n`), `data-label-empty` (`%s`), `data-label-all` (`%s`).
- Giữ nguyên `data-predictive-group` (products, collections, pages, articles), `data-predictive-options`, `data-predictive-template` (product, link), và trong template: `data-predictive-image`, `data-predictive-title`, `data-predictive-price`.
- Nút xoá là reset native. BE nghe sự kiện `reset` của form để đưa focus về input và xoá gợi ý.
- Partial: không có.
- Testid (12): `predictive-search`, `predictive-search-dialog`, `predictive-search-close`, `predictive-search-form`, `predictive-search-input`, `predictive-search-submit`, `predictive-search-clear` (mới), `predictive-search-listbox`, `predictive-search-group`, `predictive-search-option`, `predictive-search-all`, `predictive-search-status`.

## Ngoài phạm vi (chuyển cho TE-8-R2-FE1 theo task-split §3)
Tab, nhóm queries, card 4 cột, "View all" ra chân, khối khám phá, 0 kết quả, lỗi, skeleton/spinner và setting `popular_searches`.

## AGENTS.md Theme map (scope-guard chặn dev-fe; CTO hoặc Orchestrator áp)
Trong bảng Snippets, thêm sau `product-structured-data`:
`| `predictive-search` | Header search layer in <modal-dialog data-layer="search">: popup or drawer, GET form, combobox input, suggestion groups and templates for `assets/predictive-search.js`. |`

## Test
`drafts/dev-fe/ES1-T129/ES1-T129.spec.ts`, cần chép đè `tests/e2e/ES1-T129.spec.ts`:
- Spec dùng `reducedMotion: 'reduce'` để đo hình học sau transition (rút kinh nghiệm từ ES1-T313 TC-05).
- Thêm test nút xoá, test thứ tự kính lúp → input → xoá → đóng ở 360, thanh tối 80 + noise, lưới 12 ở 1280, và biến thể drawer 90% mép inline-end (giả lập class như Liquid in ra).
- Test popup tự skip khi store đặt `search_style` là drawer.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (109 file). 23 warning là warning cũ của develop, không có file nào của PR này.
- `gzip -c assets/base.css | wc -c`: 48 716 (≤ 49 152). `wc -c assets/critical.css`: 9 917, không đổi.
- Locale JSON hợp lệ, không trùng key. Không có file JS trong diff.
- Spec `-g "AC1-markup|AC3"` desktop + Pixel 7, TE-1 TC-19, axe khi dialog mở, Lighthouse 96/90/98, CLS và ảnh 360/768/1280: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
