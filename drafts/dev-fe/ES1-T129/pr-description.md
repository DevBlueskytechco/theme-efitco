KHÔNG CHẮC: (1) Spec E2E, axe, Lighthouse và ảnh 3 breakpoint chưa chạy vì phiên này không có preview: chờ CI. (2) Placeholder dùng chữ trung tính "Search products, collections, and more", không dùng "Search benches, kettlebells, mats…" của predictive-search.md §7, theo ADR 0011 #3 (locale không giữ chữ mẫu theo thương hiệu). (3) `assets/modal-dialog.js` và `assets/predictive-search.js` chưa có trên develop (BE: TE-10-R2-BE2, ES1-T130): bấm icon search vẫn sang /search, spec tự gọi `showModal()`. (4) Trần base.css 49 152 B gzip develop đã vượt (51 217, [Q] ES1-T454): PR này không tăng so với develop, chưa đưa về dưới trần.

# ES1-T129 TE-8-FE2 (lượt 4): khung search popup + drawer, `<modal-dialog data-layer="search">`

Nguồn: drafts/techlead/ES1-T307/task-split.md §3 dòng ES1-T129; docs/ui-spec/predictive-search.md §1–§3, §11; ADR 0007; docs/srs.md#TE-8 AC1, AC3. Nhánh đã gộp origin/develop (có ES1-T327 mega menu #216, ES1-T313 `.drawer`/`.close-button`/`modal-dialog { display: contents }`).

## Sửa theo CI PR #222 (run 43380118667)
- nextElementSibling null: sau khi gộp develop (ES1-T327), `{% render 'predictive-search' %}` nằm liền sau `<a data-testid="header-search-link">` trong `.site-header__icons`; phần tử đầu của snippet là `<modal-dialog data-layer="search">`, không có comment/thẻ chen giữa.
- So sánh kích thước subpixel: mọi số đo hình học trong `tests/e2e/ES1-T129.spec.ts` dùng `toBeCloseTo(…, 0)` (x, y, width, height, ảnh 64×64, vị trí form khi xoá).

## Thay đổi
- `snippets/predictive-search.liquid` (viết lại):
  - Bọc `<modal-dialog data-layer="search">`; dialog `scroll-lock`, `aria-labelledby` trỏ tới h2 "Search".
  - `data-style="popup|drawer"` lấy từ tham số `style` (giá trị lạ → popup).
  - Popup: thanh `.predictive-search__bar` gồm h2 ẩn, logo (từ 80rem), form, nút đóng.
  - Drawer: class `drawer drawer--end drawer--wide`, h2 hiện với `.drawer__title`.
  - Form GET `role="search"` action `routes.search_url`, input ẩn `type`, `options[prefix]`; nút submit kính lúp đầu ô, label ẩn, input `type=search name=q` combobox (`aria-expanded=false`, `aria-controls`, `aria-autocomplete=list`, `autocomplete=off`, `autofocus`), nút xoá `type="reset"`.
  - Nút đóng trong `<form method="dialog">`.
  - Live region `role="status"` ngoài listbox; listbox `hidden` sẵn, 4 group `hidden` (products, collections, pages, articles) có `aria-labelledby` tới tiêu đề đã dịch, `data-predictive-options` rỗng; option "all" là `a role=option tabindex=-1`.
  - 2 `<template data-predictive-template>`: product (img alt rỗng 64×64, tên, giá) và link. Option là chính thẻ `a`, không bọc `li` (axe nested-interactive).
- `blocks/header.liquid`: setting `search_style` (select popup/drawer, default popup) theo predictive-search.md §5; truyền `style`, `logo`, `logo_width` vào snippet; doc comment cập nhật hợp đồng nextElementSibling. Link search giữ `href={{ routes.search_url }}` + `aria-haspopup="dialog"`, không thêm script.
- `assets/base.css`: thay toàn bộ khối `.predictive-search*` cũ bằng khối mới ngắn hơn, dùng lại `.drawer` (vị trí, backdrop, chuyển động chung, `@starting-style` trong reduced-motion no-preference).
  - Popup: `--drawer-from: 0 -space-5` nên trượt xuống. Dưới 48rem phủ đủ màn (`inset: 0 0 auto`, 100dvh của `.drawer`). Từ 48rem cao tự động ≤ 80dvh, bo 2 góc dưới.
  - Thanh popup nền `--color-background-dark` + `noise-dark.png`, cao `--header-height`; từ 80rem lưới 12: logo cột 1–3, ô cột 4–11, nút đóng cuối hàng.
  - Lề trong khớp lưới nội dung header (`--search-gutter`).
  - Viền ô: `--color-muted-on-dark` (popup) / `--color-muted-light` (drawer). Nút xoá ẩn khi `:placeholder-shown`; ẩn nút cancel native.
  - Option cao ≥ 44px; hover và `aria-selected=true` có nền `--color-background-alt`, `aria-selected` thêm outline 2px.
  - Chỉ thuộc tính logical, 0 literal màu, 0 `z-index`, nền mờ `color-mix`.
- `locales/en.default.json`: thêm `blocks.predictive_search.clear`, `placeholder` (gộp vào key `blocks.predictive_search` đã có).
- `locales/en.default.schema.json`: thêm `labels.search_style`, `options.search_style.popup|drawer`.
- `tests/e2e/ES1-T129.spec.ts`: cập nhật theo markup mới (modal-dialog), `toBeCloseTo`; bản sao ở `drafts/dev-fe/ES1-T129/ES1-T129.spec.ts`.

## Hợp đồng cho BE (ES1-T130, TE-10-R2-BE2)
- `header-search-link.nextElementSibling` là `<modal-dialog data-layer="search">`; `firstElementChild` là `<dialog data-testid="predictive-search-dialog">`. Mở/đóng, Esc, backdrop, trả focus do `modal-dialog.js` (ADR 0007 #5).
- `<predictive-search>`: `data-url` (`routes.predictive_search_url`), `data-money-format`, `data-label-count` (`%n`), `data-label-empty` (`%s`), `data-label-all` (`%s`).
- `data-predictive-group` (products, collections, pages, articles), `data-predictive-options`, `data-predictive-template` (product, link); trong template: `data-predictive-image`, `data-predictive-title`, `data-predictive-price`.
- Nút xoá là reset native; BE nghe `reset` của form để đưa focus về input và xoá gợi ý.
- Partial: không có.
- Testid (12): `predictive-search`, `predictive-search-dialog`, `predictive-search-close`, `predictive-search-form`, `predictive-search-input`, `predictive-search-submit`, `predictive-search-clear` (mới), `predictive-search-listbox`, `predictive-search-group`, `predictive-search-option`, `predictive-search-all`, `predictive-search-status`.

## Ngoài phạm vi (TE-8-R2-FE1 theo task-split §3)
Tab, nhóm queries, card 4 cột, "View all" ra chân, khối khám phá, 0 kết quả, lỗi, skeleton/spinner, setting `popular_searches`.

## AGENTS.md Theme map (scope-guard chặn dev-fe; CTO hoặc Orchestrator áp)
Bảng Snippets, thêm sau `product-structured-data`:
`| `predictive-search` | Header search layer in <modal-dialog data-layer="search">: popup or drawer, GET form, combobox input, suggestion groups and templates for `assets/predictive-search.js`. |`

## Test
- Spec dùng `reducedMotion: 'reduce'` để đo hình học sau transition.
- Có test nút xoá, thứ tự kính lúp → input → xoá → đóng ở 360, thanh tối + noise, lưới 12 ở 1280, biến thể drawer 90% mép inline-end (giả lập class như Liquid in ra). Test popup tự skip khi store đặt `search_style` là drawer.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 23 warning cũ của develop, không file nào của PR.
- `gzip -c assets/base.css | wc -c`: develop 51 217 → nhánh 51 214 (không tăng). `wc -c assets/critical.css`: 10 014, bằng develop.
- Locale JSON hợp lệ, không trùng key. Không file JS trong diff.
- Spec `-g "AC1-markup|AC3"` desktop + Pixel 7, TE-1 TC-19, axe khi dialog mở, Lighthouse (desktop/mobile), CLS, ảnh 360/768/1280: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
