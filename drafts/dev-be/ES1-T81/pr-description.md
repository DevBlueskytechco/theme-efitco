KHÔNG CHẮC: (1) thẻ script trong layout/theme.liquid CHƯA thêm — scope-guard chặn dev-be ghi layout/; đã hỏi ES1-T82, dòng cần thêm ở dưới. AC12 không phụ thuộc thẻ này. (2) `createViewEventElement` và `ProductSelectEvent.createPromise()` lấy theo ticket/ES1-T77, chưa thấy module thật: cả hai có guard `typeof`, thiếu thì bỏ qua không lỗi. (3) E2E chưa chạy (sandbox không mở được trình duyệt) — chờ CI.

# ES1-T81 Bug TE-4 (CI #67): shopify:product:select không bắn

## Nguyên nhân
`assets/product-variant-picker.js` gọi `import("@shopify/standard-events")`. Theme không có import map cho specifier này → không resolve, `.catch(() => null)` nuốt lỗi → không dispatch event (CI run 41744892514, ES1-T66 AC12 tổ hợp không tồn tại).

## Thay đổi
- `assets/product-variant-picker.js`: import động thẳng `https://cdn.shopify.com/storefront/standard-events.js` (shopify.dev events, mục Loading the library). Không thêm import map (tránh đè import map Shopify cấp cho `@shopify/partial-rendering`). `emitSelect()` dùng `ProductSelectEvent.createPromise()` theo doc (ES1-T77): dispatch với `deferred.promise` rồi `deferred.resolve({ variant })`; không có `createPromise`/`resolve` thì fallback `Promise.resolve({ variant })` như cũ. Payload, target `<product-form>` không đổi.
- `assets/standard-events.js` (mới, 888 B): `export STANDARD_EVENTS_URL`, `export loadStandardEvents()` (memo 1 promise, catch → null); lúc nạp: `customElements.define('s-view-event', m.createViewEventElement())` một lần, guard `customElements.get` + try/catch. Phục vụ ES1-T76.
- Picker không import `./standard-events.js`: `asset_url` sinh `…/assets/x.js?v=…`, URL tương đối từ picker mất `?v=` → module thứ hai, thêm 1 request. Cả hai file import cùng URL CDN → module map dedupe, 1 instance thư viện, `ProductSelectEvent` là cùng 1 class.
- `tests/e2e/ES1-T66.spec.ts`: test tĩnh AC12 đổi regex từ bare specifier sang URL CDN + cấm bare specifier.
- `tests/e2e/ES1-T81.spec.ts` (mới): tĩnh (≤ 1 KB, URL CDN, guard s-view-event, không bare specifier ở mọi assets/*.js, không importmap trong layout, picker dùng createPromise, layout có đúng 1 thẻ script module); storefront (trang chủ: CDN tải + `s-view-event` defined + 0 console error; trang sản phẩm: CDN tải đúng 1 lần, `ProductSelectEvent` là function, 0 console error).

## Cần làm thêm (ES1-T82)
`layout/theme.liquid`, ngay sau `{{ content_for_header }}`:
```
    <script src="{{ 'standard-events.js' | asset_url }}" type="module"></script>
```
Chưa có dòng này: test ES1-T81 "layout" và "trang chủ s-view-event" fail; AC12 ES1-T66 vẫn chạy được.

## Ngân sách JS (ADR 0006, cộng tay theo file)
- standard-events.js 888 B ≤ 1 024; product-variant-picker.js 7 457 B ≤ 8 192.
- Trang sản phẩm (sau khi có thẻ layout): header-menu 6 862 + header-sticky 1 680 + product-variant-picker 7 457 + standard-events 888 (+ product-swatch 5 010 nếu có card) = 21 897 B ≤ 40 960. Trang khác +888 B. Thư viện CDN của Shopify không tính (không thuộc assets/).

## Tự kiểm tra
- `shopify theme check`: 49 file, 0 offense.
- `node --check` 2 file JS ok; `node --experimental-strip-types --check` 2 spec ok.
- `wc -c`: 888 / 7 457 B.
- Không còn `"@shopify/standard-events"` trong assets/*.js; không thêm import map.
- E2E (`npx playwright test tests/e2e/ES1-T81.spec.ts tests/e2e/ES1-T66.spec.ts -g "AC12|ES1-T81"`), console error, Lighthouse: chờ CI.

## Rủi ro
- CDN chặn CORS/CSP hoặc URL đổi: import fail → catch, picker vẫn chạy, không event; spec ES1-T81 trang sản phẩm lộ.
- Nếu thư viện tự define `s-view-event` khi import: guard `customElements.get` bỏ qua, không lỗi.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
