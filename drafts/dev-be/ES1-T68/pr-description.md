KHÔNG CHẮC: (1) shape JSON /recommendations/products.json giả định giống /products/<handle>.js (price/compare_at_price cents, variants[].available, media[].width/height/media_type, featured_image URL), chưa gọi được store trong phiên; (2) data-money-format = shop.money_format, còn Liquid `| money` theo tiền market đang xem → store nhiều tiền tệ có thể lệch, store dev 1 tiền tệ thì khớp; (3) E2E, Lighthouse chưa chạy (không có trình duyệt local) → chờ CI.

# ES1-T68 TE-4-BE4: product-recommendations.js

Ticket: ES1-T68 (TE-4 AC7). Nguồn: drafts/techlead/ES1-T59/task-split.md D7, D9, D10; markup FE ES1-T65.

## Thay đổi
- `assets/product-recommendations.js` (3069 B, trần 3072 theo ticket, 3184 theo CTO ES1-T88): custom element `product-recommendations` (root FE4).
  - IntersectionObserver rootMargin 200px trên `parentElement` (root `hidden` = display none, không có box nên không observe được chính nó). Gần viewport mới fetch `{data-url}.json?product_id=&limit=&intent=` → không chặn LCP.
  - Có `[data-recommendations-placeholder]` (design_mode) → không fetch.
  - Mỗi sản phẩm clone `template[data-recommendations-template]`: href `[data-card-link]`, tiêu đề, ảnh `featured_image` + srcset 360/720/1080 (`&width=`, không vượt width gốc) + width/height từ media ảnh đầu, không ảnh thì gỡ img; giá theo variant còn hàng đầu tiên (= selected_or_first_available_variant trang đích), `price--on-sale` + `price__current--sale` + giá gạch khi compare_at_price > price; badge Sold out khi `available === false`.
  - Tiền: `data-money-format`, bỏ thẻ HTML trong format, hỗ trợ `amount`, `amount_no_decimals`, `amount_with_comma_separator`, `amount_no_decimals_with_comma_separator` (key khác rơi về `amount`).
  - Có kết quả → `replaceChildren` vào list, bỏ `hidden`. 0 kết quả, HTTP lỗi, abort, JSON hỏng → giữ hidden, không log.
  - disconnectedCallback: ngắt observer, abort fetch (editor re-render).
- `blocks/product-recommendations.liquid`: thêm 1 `<script type="module">` sau root, trong nhánh `product != blank or request.design_mode`. 2 block cùng trang dùng chung URL asset → module chạy 1 lần; define có guard. Không đổi markup FE khác.
- `tests/e2e/ES1-T68.spec.ts`: contract tĩnh (≤ 3072 B, 1 script module, hook JS có trong block), related thật (card, query, ảnh, giá card = giá trang đích), complementary thật (0 → hidden / có → hiện), route.abort / 0 kết quả / 500 / JSON hỏng → 2 khối hidden 0 console error, mock sale + sold out (giá khớp Liquid, cùng định dạng, width/height từ JSON), request recommendations không trước LCP.

Không có partial, không locale mới, không live region (nội dung không do thao tác người dùng, khối hidden tới khi có dữ liệu).

## Tự kiểm tra
- `wc -c assets/product-recommendations.js`: 3069 (≤ 3072).
- `node --check assets/product-recommendations.js`: ok; hàm money thử tay 4 định dạng × 0/99/123456/123456789: đúng.
- `node --experimental-strip-types --check tests/e2e/ES1-T68.spec.ts`: ok.
- `shopify theme check`: 51 files, 0 offenses.
- `npx playwright test tests/e2e/ES1-T68.spec.ts -g "AC7"`: chờ CI.
- `npx lhci autorun` (96/90/98, request recommendations sau LCP): chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
