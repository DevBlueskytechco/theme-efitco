KHÔNG CHẮC: Playwright, Lighthouse chưa chạy (không preview trong phiên); phép cộng byte theo trang là cộng tĩnh theo thẻ script, đo theo URL chờ CI ES1-T177.

# ES1-T338 TE-3-R2-BE2: gỡ product-swatch.js, xoá file

AC: docs/srs.md TE-3 AC2 (swatch card là chỉ báo), ADR 0010 (product-swatch 0 B). Sau ES1-T337 (PR #207: card bỏ `<product-swatch>`, radio, `data-variant-*`).

## Thay đổi
- `assets/product-swatch.js`: xoá (5 851 B). Không còn tham chiếu: card không còn host element, không file JS nào đọc hook của nó (`collection-tabs.js` không đọc swatch, đã kiểm).
- `blocks/featured-collection.liquid`: gỡ thẻ script (dòng 271 cũ) và biến `any_products` chỉ dùng cho thẻ đó; sửa dòng `{% doc %}` nhắc file.
- `blocks/collection-products.liquid`: gỡ thẻ script ngoài partial (dòng 222 cũ); sửa dòng `{% doc %}`.
- `blocks/quiz.liquid`: gỡ thẻ script (dòng 279 cũ). `quiz-dialog.js`, `lazy-module.js` giữ nguyên.
- Không đổi markup khác, partial name (`collection-products`, `quiz-results`), data-testid.

## Test
- Mới `tests/e2e/ES1-T338.spec.ts`: tĩnh (file đã xoá; grep `product-swatch` = 0 trong blocks/snippets/layout/templates/assets; thẻ script còn lại của 3 block; mọi file JS ≤ 8 192); storefront `/`, `/collections/all`, `/?view=te11` (0 request product-swatch, 0 `<product-swatch>`, element chưa define, 0 console error); card link/swatch aria-hidden; no-JS card dùng được.
- Sửa assertion đã lỗi thời do ticket này: `ES1-T189.spec.ts` "block chỉ có thẻ script lazy-module" (bỏ product-swatch khỏi danh sách), `ES1-T138.spec.ts` AC3 (đếm script product-swatch 1 → 0).
- Không đụng nhóm test radio swatch (TE-3 TC-10..17, ES1-T73, ES1-T190, ES1-T189 "swatch sau clone", ES1-T139 nhánh product-swatch, TE-3 B-02): đã tự skip vì không còn radio, QA dọn ở ES1-T441.
- Console filter trong spec bỏ qua lỗi importmap `@shopify/partial-rendering` có sẵn trên develop (ES1-T415, CTO 13/11 trên ES1-T337).

## Ngân sách JS (ADR 0010)
- `wc -c`: file chạm `assets/product-swatch.js` 5 851 → 0 (xoá). Tổng `assets/*.js` 89 550 → 83 699. File lớn nhất `slideshow.js` 8 057 ≤ 8 192.
- Chung (layout + header + cart drawer, cộng tĩnh): standard-events 888 + motion 6 103 + header-menu 6 862 + header-sticky 1 680 + cart-drawer 3 868 + page-layers 2 031 = 21 432 (không đổi bởi PR này; vượt trần 19 456 thuộc TE-22-R2-BE1, TE-1-R2-BE1).
- Trang chủ tải sẵn: −5 851 (featured-collection, quiz không còn nạp product-swatch).
- Collection (`/collections/all`), `collection.quiz`: −5 851.

## Ngoài phạm vi, ghi cho Tech Lead
- `docs/architecture.md` còn nhắc `product-swatch` (doc Tech Lead, không sửa).
- `blocks/quiz.liquid` doc dòng 18–19 ("the swatches in a card are inputs and must stay out of the form") đã lỗi thời sau ES1-T337; lý do giữ partial ngoài form vẫn đúng, FE sửa câu chữ nếu cần.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (23 warning có sẵn, 0 ở 3 file chạm).
- `grep -rn "product-swatch" blocks snippets layout templates assets config locales` = 0.
- Mọi `assets/*.js` ≤ 8 192 B.
- Không locale, schema, setting mới.
- Playwright, Lighthouse trên preview: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
