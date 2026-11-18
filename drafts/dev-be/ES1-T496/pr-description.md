KHÔNG CHẮC: ticket gợi ý nạp qua lazy-module; lazy-module cần data-lazy-module trên form 404 (đổi markup FE) nên dùng 1 thẻ script trong nhánh show_search của block not-found. Hỏi Tech Lead ở ES1-T504. Spec chưa chạy (không trình duyệt, không node_modules) → chờ CI.

# ES1-T496 (bug ES1-T386-B01, nối FE ES1-T486): 404 ô tìm → lớp search header + gợi ý predictive (TE-21 AC7)

## Thay đổi
- `assets/search-handoff.js` (mới, 1 441 B): nghe `input` + `compositionend` ủy quyền trên document.
  - Chỉ xử lý `[name="q"]` thuộc form có `data-search-handoff`; bỏ qua khi `isComposing` (IME Telex/CJK, chờ compositionend).
  - `value.trim().length >= 2`: gán value vào `#PredictiveSearchInput` trong `modal-dialog[data-layer="search"]`, `layer.open(<input 404>)` (dialog đóng → focus về ô 404 theo khôi phục focus của `<dialog>`), đặt con trỏ cuối chữ, `import(form.dataset.searchHandoff)` (asset_url có `?v=`, ES1-T485). predictive-search.js đọc giá trị sẵn có qua connectedCallback hoặc `modal:open`.
  - < 2 ký tự, không lớp header, `open` chưa định nghĩa (modal-dialog.js chưa tải), lớp đã mở: không làm gì; form vẫn GET `/search?q=`.
  - Không focus khi tải trang, không console, không fetch, không import tĩnh. Ủy quyền trên document nên block render lại trong editor vẫn chạy, không listener treo.
- `blocks/not-found.liquid`: chỉ thêm `<script src="{{ 'search-handoff.js' | asset_url }}" type="module"></script>` ngay sau form, trong `{%- if block.settings.show_search -%}`. Không đổi markup khác, không autofocus, không `data-search-src`.
- `assets/search-loader.js`, `assets/predictive-search.js`, `assets/modal-dialog.js`: không đổi (ES1-T130, ES1-T316 giữ nguyên).
- `tests/e2e/ES1-T496.spec.ts` (mới).

## Byte (wc -c)
| File | B | Trần |
| --- | --- | --- |
| search-handoff.js (mới) | 1 441 | 1 536 (test tĩnh ES1-T496), ≤ 8 192 |
| search-loader.js | 256 | 256 (không đổi) |
| predictive-search.js | 6 598 | 6 656 (không đổi, nạp khi gõ) |

Trang 404 tải sẵn: standard-events 888 + motion 6 129 + page-layers 2 031 + modal-dialog 2 039 + header-menu 3 068 + header-sticky 1 680 + search-loader 256 + cart-drawer 3 910 + search-handoff 1 441 = 21 442 B ≤ 40 960. Theo tương tác: predictive-search 6 598.

## Test (tests/e2e/ES1-T496.spec.ts)
- Tĩnh: search-handoff.js ≤ 1 536 B; import qua dataset; not-found.liquid đúng 1 thẻ script trong nhánh show_search, không autofocus/data-search-src; search-loader.js ≤ 256 B chỉ nghe click.
- Trang giả (page.route, JS lấy từ repo, mock /search/suggest.json): TC-01 không focus/không tải predictive khi load; TC-02 1 ký tự không mở, 2 ký tự mở + gợi ý + con trỏ cuối; TC-03 khoảng trắng không tính; TC-04 Esc 1 đóng gợi ý, Esc 2 đóng lớp, focus về ô 404, gõ lại mở lại, module tải 1 lần; TC-05 IME; TC-06 không lớp header → GET /search; TC-07 modal-dialog.js không tải → GET /search; TC-08 input khác không mở.
- Storefront 1280: TC-09 gõ "du" → /search/suggest, listbox hiện, Esc ×2 focus về ô 404, 0 lỗi console.
- QA gỡ `test.fail` ở ES1-T386 TC-20; TC-21 (1 ký tự + Enter), B-03 (chặn JS) không bị ảnh hưởng.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn ở file khác, không ở file chạm).
- `wc -c`: mọi file chạm ≤ 8 192.
- Locale: không đổi.
- Playwright, preview, Lighthouse (404 không tính SEO 100, sổ 10/11): chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
