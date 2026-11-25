KHÔNG CHẮC: phạm vi BE1 không vừa 6 912 B tổng (1 file đủ phạm vi = 12 441 B, vượt cả 8 192/file). Đã tách lõi `predictive-search.js` 6 908 B + `predictive-search-results.js` 6 779 B (import() lười); tổng lười predictive 13 687 B > 6 912 của ADR 0010. Hỏi Tech Lead ES1-T610 (ngân sách, URL module không ?v=, chỗ cho BE3 recent).

# ES1-T378 TE-8-R2-BE1: predictive search — tab, gợi ý từ khoá, trạng thái, nút chân

AC: TE-8 AC1 (docs/srs.md). Spec: docs/ui-spec/predictive-search.md §2, §4, §6, §8, §13. Hook: `{% doc %}` snippets/predictive-search.liquid (ES1-T377, PR #303). Sau: ES1-T130, ES1-T377.

## Thay đổi

- `assets/predictive-search.js` (lõi, ES1-T130 viết lại):
  - `resources[type]=query,product,collection,article,page` (nhóm Suggestions).
  - Hook theo bảng `HOOKS` (combobox, listbox, status, tablist, nút chân, hint, skeleton, spinner, empty, error, discover).
  - 1 ký tự: hint + `aria-describedby="PredictiveSearchHint"` + khám phá; 0 / ≥ 2 ký tự gỡ.
  - Tải lần đầu (list đang ẩn): skeleton, spinner, `aria-busy` trên listbox, status `data-label-loading`, nút chân hiện với `?q=`. Lần sau: giữ kết quả cũ, chỉ spinner (§6).
  - Quá 5 s: abort, coi như lỗi. Lỗi mạng / status không ok (cả 429): hộp `data-predictive-error` (role=alert), nút chân vẫn mở trang kết quả, không retry tự động. `[data-retry]`: focus về ô, gọi lại ngay.
  - Click delegate: tab → module results; `[data-predictive-query]` (option từ khoá, chip popular) → điền ô, gợi ý ngay, không rời trang; Enter trên option từ khoá đi cùng đường (click).
  - ↑/↓ bỏ qua option đang ẩn (giới hạn tab All, nhóm của tab khác).
  - `[data-predictive-terms]` điền từ khoá (hộp rỗng, dòng no-products, câu lỗi).
  - CSS tầng 5 giữ hợp đồng ADR 0014 §8: 1 `<link>`, skeleton tới `load`/`error`; giờ skeleton giữ tiếp nếu request đầu còn chạy.
  - `import(new URL('predictive-search-results.js', import.meta.url))` khi connect, song song CSS; lỗi tải → hộp lỗi, form GET vẫn chạy.
- `assets/predictive-search-results.js` (mới, ES module, export `render`, `tab`, `foot`, `arrow`):
  - Clone `<template>` query / product / link, chỉ `textContent`. Từ khoá: phần đã gõ trong `<mark>`, gắn `data-predictive-query`.
  - Sản phẩm: giá `data-money-format`; `compare_at_price_max > price` → `data-on-sale`, giá gạch, badge `-N%`, nhãn ẩn `data-label-sale-price`; `available: false` → `data-unavailable`, "Sold out". srcset 64/128/250/480 (hàng 64, card 250 theo `sizes` của FE), src width 64.
  - Bài viết: ngày `published_at` theo `<html lang>`, `dateStyle: medium`; nhóm khác gỡ meta (API không trả số sản phẩm collection). Không ảnh: gỡ `<img>`.
  - Tab: ẩn tab nhóm 0, số `[data-predictive-count]` (8 = limit → "8+"); giữ tab khi gõ tiếp, tab về 0 thì về All; `data-tab` trên `<predictive-search>`, `aria-selected`, roving tabindex, tabpanel `aria-labelledby`. Tab All: 4 từ khoá, 4 sản phẩm, 3 mỗi nhóm khác (`hidden` trên option thừa); tab khác: 1 nhóm, đủ 8. ←/→ cuộn vòng, đổi chiều khi RTL. Đổi tab không gọi server.
  - Trạng thái: 0 kết quả → hộp rỗng, ẩn tab, khám phá; 0 sản phẩm → khám phá + dòng `data-predictive-no-products` (khi nhóm khác có kết quả).
  - Nút chân: All "View all results for “q”" (FormData form); tab Products "View all products for “q”" + `type=product`; 0 kết quả `data-label-shop-all` → `data-shop-all-url`. Chữ vào `[data-predictive-all-label]`, giữ icon mũi tên.
- Không đổi markup FE, không thêm thẻ script; không localStorage (recent là TE-8-R2-BE3).

## Lệch spec / chọn khi không rõ

- Skeleton hiện ngay khi request đầu bắt đầu, không chờ 200 ms (§6 ghi "> 200ms"): thiếu byte trong lõi.
- `aria-busy` đặt trên listbox (ES1-T130.spec kiểm), không trên thân (§6 ghi thân).
- Badge `-N%` ghép số trong JS, không có `data-label-*` cho định dạng này trong snippet.
- Collection không có meta "N products": Predictive Search API không trả số sản phẩm.
- Chip / từ khoá: chặn mọi click (cả Ctrl/Cmd click) để chạy gợi ý tại chỗ theo §4.

## Test

- `tests/e2e/ES1-T378.spec.ts` (mới): tĩnh (trần byte 2 file, mọi hook `data-predictive-*` JS dùng có trong snippet, nhãn `data-*`, không innerHTML/partial/console/localStorage, import cùng thư mục, không thẻ script cho results); mock: results chỉ tải sau khi mở + 1 link CSS, hint, tải lần đầu/lần sau, tab (data-tab, roving, aria-labelledby, 8+, ↑ bỏ option ẩn, ← cuộn vòng), `<mark>` + Enter trên từ khoá, sale/badge/sold out, ngày bài viết, 0 kết quả + no-products, lỗi 500 + Try again, results lỗi tải, axe tab Products + hộp lỗi.
- `tests/e2e/ES1-T130.spec.ts`: contract đọc cả 2 file; `resources[type]` có `query`.
- `tests/e2e/ES1-T496.spec.ts`: trang giả phục vụ thêm `predictive-search-results.js` (trước đó 404 → không vẽ được option).
- ES1-T131 (QA) không sửa: cổng `tabs`, `states`, `css` sẽ mở với PR này.

## Ngân sách JS (wc -c)

| File | Byte | Trần | Nạp |
| --- | --- | --- | --- |
| assets/search-loader.js | 256 | 256 | tải sẵn, mọi trang (không đổi) |
| assets/predictive-search.js | 6 908 | 6 912 | lười, khi bấm icon search |
| assets/predictive-search-results.js | 6 779 | 8 192 | lười, import() từ lõi khi connect |

Tải sẵn mọi trang: +0 B. Lười theo tương tác (không tính trần sau cuộn, ADR 0010): predictive 6 874 → 13 687 B (+6 813), vượt phân bổ 6 912 — chờ ES1-T610.

## Tự kiểm tra

- `shopify theme check`: 0 lỗi (9 warning có sẵn, không thuộc file PR).
- `wc -c`: 6 908 / 6 912; 6 779 / 8 192; search-loader 256 / 256.
- grep `innerHTML|insertAdjacentHTML|partials|section_id|console.|dispatchEvent|localStorage` trên 2 file: 0 dòng.
- Locale: không đổi.
- `node --check`, Playwright (ES1-T378, ES1-T130, ES1-T131, ES1-T496, ES1-T386 TC-20, TE-1), axe, Lighthouse: chờ CI (sandbox chặn node/trình duyệt).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
