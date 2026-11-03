KHÔNG CHẮC: (1) chữ ký constructor `ProductSelectEvent` chưa có trong câu trả lời ES1-T75 (chỉ có tên, import, payload) → giả định `new ProductSelectEvent({ product, selectedOptions, promise })`, gọi trong try/catch; (2) `@shopify/standard-events` có được import map của storefront cung cấp như `@shopify/partial-rendering` không → import động `import()` + catch, thiếu module thì picker vẫn chạy, chỉ không có event; (3) option `signal` của `partials.fetch` chưa có trong doc → vẫn truyền, bắt AbortError; đã hỏi ES1-T77; (4) E2E chưa chạy (sandbox không mở được trình duyệt) — chờ CI.

# ES1-T66: TE-4-BE1 product-variant-picker.js + variant-json (làm lại sau review CTO PR #65)

Ticket: ES1-T66, parent TE-4 (AC2, AC4, AC12). Nguồn: drafts/techlead/ES1-T59/task-split.md D6, D9, D10; ADR 0002, 0006; markup FE ES1-T63, ES1-T64; trả lời ES1-T75 (CTO, shopify.dev 2026-11-03).

## Sửa theo review PR #65
- (a) `partials.fetch(...REGIONS, { url: url.toString(), signal })` — tên partial truyền rời; `partials.apply(update)`.
- (b) Bỏ event tự đặt `shopify:product:variant-change` → `shopify:product:select` qua `ProductSelectEvent` (`@shopify/standard-events`), dispatch từ `<product-form>` (phần tử product chứa picker). Payload: `product {id: gid://shopify/Product/…, title, handle}`, `selectedOptions [{name, value}]`, `promise` resolve `{variant}` (id GID, title, availableForSale, price {amount, currencyCode}, selectedOptions) hoặc `{variant: null}` khi tổ hợp không tồn tại. Tra cứu variant đồng bộ từ JSON nên promise resolve ngay, không reject.
- (c) Bỏ override `Shopify.actions.showVariant` và dispatch `shopify:product:view` (view là `<s-view-event>` phía FE, ES1-T76).
- Giữ nguyên luồng giá/tồn/nút/URL `?variant=`/Unavailable/selling plan.

## Thay đổi
- `snippets/variant-json.liquid` (mới, chỉ xuất JSON): `script type=application/json data-product-variants` = `{ product {id, title, handle}, options (tên option), currency (cart.currency.iso_code), variants [{id, title, options, available, price (cents), featured_media, requires_shipping}] }`. Thêm title/price/options/currency so với bản trước để dựng payload event chuẩn.
- `blocks/product-form.liquid`: +2 dòng, cả hai trong `unless product.has_only_default_variant` — `render 'variant-json'` đầu `<product-variant-picker>`, `<script type="module">` ngay sau `</product-variant-picker>`. Sản phẩm 1 variant không tải JS (không còn event view cần bắn). Markup khác không đổi.
- `assets/product-variant-picker.js` (7 083 B), custom element `product-variant-picker`:
  - change radio `option-*` → tìm variant trong JSON; cập nhật `data-available` mọi radio theo lựa chọn hiện tại; dispatch `shopify:product:select`.
  - Không khớp: huỷ request đang chạy, mọi `button[name=add]` thuộc form (cả sticky bar) `disabled` + `data-label-unavailable`, `product-inventory` `data-state=unavailable`, đọc vào `role=status`. Không fetch.
  - Khớp: hidden `id`, `history.replaceState` `?variant=` (+ `selling_plan` nếu radio plan khác rỗng), `theme:variant:change` {variantId, featuredMediaId} (BE3), rồi 1 request `partials.fetch` cho 6 partial: product-price, product-buy-buttons, product-installments, product-pickup, product-selling-plans, product-sticky-bar. AbortController huỷ request cũ; `aria-busy` trên `product-form` tới khi request mới nhất xong; sau apply chọn lại radio plan, đọc text tồn vào live region.
  - Lỗi mạng / abort: nuốt lỗi, không console error, nút và giá giữ nguyên.
  - Đổi radio `selling_plan` → fetch lại như đổi variant (không dispatch select: không phải option).
  - popstate đọc `window.location.search` `variant` → chọn radio + luồng trên (có dispatch select); pageshow đồng bộ khi bfcache khôi phục radio lệch hidden id (bài học ES1-T73).
  - `@shopify/standard-events` import động lúc nạp module, `.catch(() => null)`.
- `tests/e2e/ES1-T66.spec.ts`: contract 6 partial + byte ≤ 7168; AC2 (đổi variant còn/hết hàng, tổ hợp không tồn tại, route.abort, axe); AC4 selling plan; AC12 `shopify:product:select` có product GID + handle, selectedOptions khớp option, promise → variant GID / availableForSale / price, target `PRODUCT-FORM`, không dispatch lúc load; AC12 tổ hợp không tồn tại → `{variant: null}`; kiểm tĩnh JS không còn `Shopify.actions` / `showVariant` / `shopify:product:view`, có `partials.fetch(...REGIONS,`. Listener dùng capture trên document (bắt cả khi event không bubble), đọc payload ở event hoặc `detail`.

Partial name: product-price, product-buy-buttons, product-installments, product-pickup, product-selling-plans, product-sticky-bar (khớp {% doc %} FE, grep blocks/).

## Tự kiểm tra
- `wc -c assets/product-variant-picker.js`: 7 083 ≤ 7 168.
- `node --check assets/product-variant-picker.js`: OK; `node --experimental-strip-types --check tests/e2e/ES1-T66.spec.ts`: OK (chưa type-check).
- `shopify theme check`: 49 file, 0 offense. Locale: không đổi.
- `npx playwright test tests/e2e/ES1-T66.spec.ts -g "AC2|AC12"` desktop + Pixel 7, 0 console error, axe: chờ CI (cần TE4_VARIANTS_HANDLE, tuỳ chọn TE4_SELLING_PLAN_HANDLE).
- `npx lhci autorun` desktop/mobile: chờ CI.

## Mở
- Nếu constructor `ProductSelectEvent` khác giả định: try/catch nuốt lỗi, AC12 E2E fail ở bước poll event (không có console error) → sửa 1 dòng trong `emitSelect()`.
- `price.amount` = cents / 100, `toFixed(2)` (chuỗi decimal kiểu MoneyV2).
- route.abort: Chrome tự log "Failed to load resource: net::ERR_FAILED"; spec bỏ qua đúng mẫu này trong test abort.
- Khi Unavailable, giá vẫn là của variant trước.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
