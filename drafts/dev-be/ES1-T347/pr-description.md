KHÔNG CHẮC: task-split ES1-T307 và ADR 0007–0010 không có trên nhánh này; tên partial và hợp đồng markup là ĐỀ XUẤT, hỏi Tech Lead ES1-T414. Hành vi server `?option_values=` chưa kiểm trên preview (chờ CI).

# ES1-T347 · TE-4-R2-BE1 · Spike đổi biến thể theo option value (TE-4 AC15, AC16)

## Thay đổi
- `drafts/dev-be/ES1-T347/spike.md`: hiện trạng (C1–C10), luồng `partials.fetch(...names, { url: ?option_values=, signal })`, hợp đồng markup cho FE, giả thuyết H1–H6, tách việc FE/BE2, ngân sách byte, rủi ro, kế hoạch test.
- `tests/e2e/ES1-T347.spec.ts`: test đích AC15 (đang tải, bấm liên tiếp, lỗi + Try Again), AC16 (D3 `demo-many-variants`, tổ hợp sau vị trí 250 thêm giỏ đúng), tĩnh NFR-7 + contract partial. Trang/JS còn JSON biến thể → `test.fixme` có lý do; quickview fixme chờ TE-3.
- Không đổi file theme (`assets/`, `blocks/`, `snippets/`).
- Lượt 2 (CI run 43201138738, ES1-T171 TC-12): bỏ chuỗi đường dẫn Cart API khỏi message assert; lọc request vẫn qua `CART.add` (`support/cart-api.ts`). Không đổi AC.

## Phát hiện chính
- AC16 FAIL trên code hiện tại: `variant-json` lặp `product.variants` (≤ 250) → `match()` không thấy biến thể 251+ → nút "Unavailable".
- AC15 FAIL một phần: id + URL đổi trước khi tải xong; nút không `aria-disabled`, bấm lúc chờ vẫn thêm giỏ; lỗi không alert, không Try Again, radio không khôi phục.

## Byte (wc -c, không đổi)
product-variant-picker.js 7 163; product-form.js 6 857. Tổng tải sẵn PDP theo thẻ script tĩnh 43 955 B (> 40 960 ADR 0006), đã hỏi ES1-T414 #4.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn, không do PR này).
- `playwright test --list`: spec biên dịch, 18 test (9 × 2 project). Chạy thật: chờ CI (globalSetup cần mạng).
- Regex TC-12 `/\/cart\/.*\.js/` trên `tests/e2e/*.spec.ts`: 0 dòng trúng. Chạy ES1-T171 thật: chờ CI.
- Lighthouse: không áp dụng (không đổi theme), chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
