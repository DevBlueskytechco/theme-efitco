KHÔNG CHẮC: (1) Figma không có search mở, dropdown, mobile; bố cục theo mặc định ES1-T127 #1-#3, Designer chưa xác nhận. (2) `type=product,article,page` và `options[prefix]=last` là mặc định D1, chờ ES1-T124 #4. (3) Spec, axe, lhci, ảnh chưa chạy: phiên này không có preview, chờ CI. Rule axe chỉ đối chiếu bằng cách đọc node_modules/axe-core/axe.js.

# ES1-T129 TE-8-FE2: markup dialog search

Nguồn: docs/srs.md#TE-8 AC1, AC3; drafts/techlead/ES1-T123/task-split.md D6, D7, D9; ES1-T127.

## Thay đổi
- `snippets/predictive-search.liquid` (mới): thẻ `dialog[scroll-lock]`, `predictive-search`, form GET, input combobox, live region, listbox 4 nhóm, 2 thẻ template, nút đóng trong form `method="dialog"`.
- `blocks/header.liquid`: thêm `aria-haspopup="dialog"` cho `header-search-link`, render snippet ngay sau link. Không có `data-search-src`, thẻ script: thuộc BE1.
- `assets/base.css`: khối `predictive-search*`. Dưới 48rem phủ đủ viewport, 100dvh, form cố định, listbox cuộn. Từ 48rem panel neo mép trên, rộng theo `--page-width`, tối đa 80dvh. Option từ 44px; `aria-selected="true"` có nền và outline; backdrop dùng `color-mix`.
- `locales/en.default.json`: `blocks.predictive_search` (13 key).
- `assets/critical.css` không đổi (9 921 B). Không có file JS trong diff.

## Hợp đồng cho BE1 (ES1-T130)
- Dialog là `nextElementSibling` của `header-search-link`.
- Trên `predictive-search`: `data-url`, `data-money-format`, `data-label-count` (`%n`), `data-label-empty` (`%s`), `data-label-all` (`%s`).
- `data-predictive-group` (products, collections, pages, articles), `data-predictive-options`, `data-predictive-template` (product, link).
- Hook thêm so với D9, nằm trong thẻ template: `data-predictive-image`, `data-predictive-title`, `data-predictive-price`.
- Partial: không có.
- Testid (11): `predictive-search`, `predictive-search-dialog`, `predictive-search-close`, `predictive-search-form`, `predictive-search-input`, `predictive-search-submit`, `predictive-search-listbox`, `predictive-search-group`, `predictive-search-option`, `predictive-search-all`, `predictive-search-status`.

## Lệch so với ticket
- Thêm `aria-label` cho listbox (key `listbox_label`): ticket không ghi, ARIA yêu cầu listbox có tên.
- Dòng `predictive-search-all` có sẵn chữ `view_all`: option không tên sẽ dính axe `aria-toggle-field-name` khi list mở. BE1 ghi đè bằng `data-label-all`.
- Thêm `aria-selected="false"` sẵn trên option để BE1 chỉ cần đổi giá trị.
- Live region hiện chữ thấy được (không visually-hidden): BE1 ghi `data-label-empty` vào đây và khách cần đọc được thông báo 0 kết quả.

## AGENTS.md Theme map (scope-guard chặn dev-fe, CTO hoặc Orchestrator áp)
Bảng Snippets, thêm sau `product-structured-data`:
`| `predictive-search` | Header search dialog: GET form, combobox input, suggestion groups and templates for `assets/predictive-search.js`. |`

## Test
Spec ở `drafts/dev-fe/ES1-T129/ES1-T129.spec.ts`; scope-guard chặn ghi tests/, Orchestrator chép sang `tests/e2e/ES1-T129.spec.ts`. Chưa type-check.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (56 file). Chạy lại sau mọi sửa.
- `wc -c assets/critical.css`: 9 921 B, không đổi.
- Spec `-g "AC1-markup|AC3"` desktop + Pixel 7: chờ CI.
- `tests/e2e/TE-1.spec.ts` (TC-19 vẫn sang /search, 0 console error): chờ CI.
- axe khi dialog mở và có option mẫu: chờ CI. Spec chỉ quét trong dialog vì phần còn lại của trang là inert.
- Lighthouse 96/90/98, CLS, ảnh 360, 768, 1280: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
