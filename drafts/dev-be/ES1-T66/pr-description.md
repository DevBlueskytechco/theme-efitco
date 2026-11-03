KHÔNG CHẮC: (1) chữ ký `partials.fetch()/apply()` và (2) tên event / action Standard storefront actions không có trong nguồn dự án, phiên agent không gọi mạng nên chưa tra shopify.dev → đã gom vào 1 dòng gọi + 3 hằng đầu file, hỏi Tech Lead ở ES1-T75; (3) E2E chưa chạy (sandbox không mở được trình duyệt, không có node_modules) — chờ CI.

# ES1-T66: TE-4-BE1 product-variant-picker.js + variant-json

Ticket: ES1-T66, parent TE-4 (AC2, AC4, AC12). Nguồn: drafts/techlead/ES1-T59/task-split.md D6, D9, D10; ADR 0002, 0006; markup FE ES1-T63, ES1-T64.

## Thay đổi
- `snippets/variant-json.liquid` (mới, chỉ xuất JSON): `script type=application/json data-product-variants`, mỗi variant `id`, `options`, `available`, `featured_media` (id hoặc null), `requires_shipping`. `product.variants` tối đa 250.
- `blocks/product-form.liquid`: +2 dòng — `render 'variant-json'` đầu `<product-variant-picker>`, `<script type="module">` sau `</product-form>` (ngoài `unless has_only_default_variant` để event view vẫn bắn với sản phẩm 1 variant). Markup khác không đổi.
- `assets/product-variant-picker.js` (7 132 B), custom element `product-variant-picker`:
  - change radio `option-*` → tìm variant khớp trong JSON; cập nhật `data-available` mọi radio theo lựa chọn hiện tại (mua được khi option khác giữ nguyên).
  - Không khớp: huỷ request đang chạy, mọi `button[name=add]` thuộc form (cả sticky bar qua `button.form`) `disabled` + `data-label-unavailable`, `product-inventory` `data-state=unavailable`, đọc vào `role=status`. Không fetch.
  - Khớp: hidden `id`, `history.replaceState` `?variant=` (+ `selling_plan` nếu có radio plan khác rỗng), dispatch `theme:variant:change` {variantId, featuredMediaId} (cho BE3) + event variant chuẩn, rồi `partials.fetch(REGIONS, {url, signal})` + `partials.apply()` 1 request cho 6 partial: product-price, product-buy-buttons, product-installments, product-pickup, product-selling-plans, product-sticky-bar. AbortController huỷ request cũ; `aria-busy` trên `product-form` tới khi request mới nhất xong; sau apply chọn lại radio plan theo URL (apply giữ giá trị form) và đọc text tồn vào live region.
  - Lỗi mạng / abort: nuốt lỗi, không `console.error`, nút và giá giữ nguyên; submit vẫn gửi id mới.
  - Đổi radio `selling_plan` trong form → fetch lại như đổi variant.
  - popstate (back qua anchor thumbnail) đọc `window.location.search` `variant`; pageshow đồng bộ khi radio khôi phục lệch hidden id (bài học ES1-T73).
  - AC12: load → `shopify:product:view` {productId, variantId} trên document; đổi variant → `shopify:product:variant-change`; override `Shopify.actions.showVariant(id | gid | {variantId} | {id})` → check radio, chạy luồng trên, Promise<boolean>; variant lạ → gọi action cũ nếu có, không thì false. Tên = hằng `EVENT_VIEW`, `EVENT_VARIANT`, `ACTION_SHOW` (chờ ES1-T75).
- `tests/e2e/ES1-T66.spec.ts`: contract 6 partial (REGIONS trong JS ↔ `{% partial %}` trong blocks) + byte ≤ 7168; AC2 đổi variant còn hàng/hết hàng (giá, compare, unit, `data-state`, nút chính + sticky, `?variant=`, không navigate, `data-available`); AC2 tổ hợp không tồn tại; AC2 route.abort; AC2 axe sau đổi; AC4 selling plan → `selling_plan` trong URL; AC12 event load/đổi có variant id + `theme:variant:change`; AC12 override show variant. Tên event/action đọc từ hằng trong JS.

Partial name: product-price, product-buy-buttons, product-installments, product-pickup, product-selling-plans, product-sticky-bar (khớp {% doc %} FE).

## Tự kiểm tra
- `wc -c assets/product-variant-picker.js`: 7 132 ≤ 7 168. JS trang sản phẩm hiện tại: header-menu 6 862 + header-sticky 1 680 + 7 132 = 15 674 (D9).
- `node --check assets/product-variant-picker.js`: OK; `node --experimental-strip-types --check tests/e2e/ES1-T66.spec.ts`: OK (chưa type-check).
- `shopify theme check`: 49 file, 0 offense. Locale: không đổi.
- `npx playwright test tests/e2e/ES1-T66.spec.ts -g "AC2|AC12"` desktop + Pixel 7, 0 console error, axe: chờ CI (cần TE4_VARIANTS_HANDLE, tuỳ chọn TE4_SELLING_PLAN_HANDLE).
- `npx lhci autorun` desktop/mobile: chờ CI.

## Mở
- ES1-T75: nếu chữ ký `partials.fetch/apply` khác, E2E AC2 sẽ fail ở bước giá (catch nuốt lỗi nên không có console error) → sửa 2 dòng trong `update()`.
- route.abort: Chrome tự log "Failed to load resource: net::ERR_FAILED" (log mạng, JS không chặn được); spec bỏ qua đúng mẫu này trong test abort, vẫn bắt pageerror và lỗi khác.
- Sản phẩm 1 variant có selling plan: không có picker nên đổi plan không fetch lại / không ghi `selling_plan` vào URL (giá plan đã in sẵn trong nhãn radio). Cần thì BE2 (product-form.js) hoặc ticket riêng.
- Khi Unavailable, giá vẫn là của variant trước (không có variant để định giá).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
