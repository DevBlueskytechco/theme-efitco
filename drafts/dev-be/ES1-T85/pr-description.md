KHÔNG CHẮC: (1) lỗi mạng/abort/5xx: doc shopify.dev nói reject + storefront dispatch shopify:cart:error, nhưng CI PR #72 cho thấy reject sinh pageerror (thư viện tạo promise phái sinh không bắt) → theo phương án dự phòng của CTO: RESOLVE { cart: null, userErrors: [{ message }], warnings: [] }, không reject ở mọi nhánh. (2) Chưa thấy module CDN thật: `CartLinesUpdateEvent.createPromise()`, `CartLinesUpdateEvent.createCartFromAjaxResponse()` (static) lấy theo ticket + review CTO; thiếu hàm thì cart = null, event vẫn resolve. (3) E2E chưa chạy (sandbox không mở được trình duyệt) — chờ CI.

# ES1-T85 TE-4-BE5: product-form.js dispatch shopify:cart:lines-update (làm lại theo review PR #72)

## Thay đổi
- `assets/product-form.js`
  - Import động `https://cdn.shopify.com/storefront/standard-events.js` (cùng URL với picker/standard-events.js → 1 instance), `.catch(() => null)`.
  - `emit(body)`: chờ thư viện tối đa 500 ms, `CartLinesUpdateEvent.createPromise()`, dispatch từ `<product-form>` TRƯỚC POST: `{ action: 'add', context: 'product', lines: [{ merchandiseId: 'gid://shopify/ProductVariant/<id>', quantity }], promise }`; id/quantity từ FormData (thiếu quantity → 1). Thư viện thiếu/khác shape → bỏ event, thêm giỏ vẫn chạy.
  - `settle(ev, message, signal)`: chỉ `resolve`, không bao giờ `reject`. Kết quả CartLinesUpdateResult `{ cart, userErrors, warnings: [] }`; có signal → GET `routes.cart_url + '.js'` → `CartLinesUpdateEvent.createCartFromAjaxResponse(ajaxCart)`, lỗi → cart null.
    - 200: `theme:cart:updated` (giữ cho nội bộ) → await settle (cart mới, userErrors []) → chuyển /cart nếu page type/không có drawer. /cart.js lỗi không submit lại form.
    - 422/4xx có description: settle (giỏ hiện tại, userErrors [{ message: description }]) không await → lỗi vào role=alert ngay.
    - Mạng/5xx/abort: settle(cart null, userErrors [{ message }]) đồng bộ, không fetch → giữ fallback submit form thường (ES1-T67 AC8).
  - Headers JSON dồn vào hằng `HEADERS`.
  - Không override updateCart/openCart, không dispatch context 'standard-action' (TE-5).
- `tests/e2e/ES1-T85.spec.ts` (mới): tĩnh (≤ 8192 B, URL CDN, không bare specifier, createCartFromAjaxResponse, không `.reject(`, emit trước fetch add.js, còn fallback submit); storefront: thêm giỏ thật → listener document nhận action add, context product, target product-form, GID đúng, chưa có request add.js lúc dispatch, resolve { cart chứa variant, userErrors [], warnings [] }; 422 mock → resolve userErrors [description], lỗi ở product-form-error, không chuyển trang; route.abort → resolve cart null + 1 userError, về /cart; cả 3 kiểm 0 console error / pageerror.
- `tests/e2e/ES1-T67.spec.ts`: contract bundle 5120 → 8192 B (ADR 0006, CTO review cho phép ≤ 8192).

## Ngân sách JS (ADR 0006, cộng tay theo file)
Trang sản phẩm: header-menu 6 862 + header-sticky 1 680 + product-variant-picker 7 023 + product-form 6 757 + standard-events 888 + product-swatch 5 010 = 28 220 B ≤ 40 960.

## Tự kiểm tra
- `shopify theme check`: 50 file, 0 offense.
- `node --check assets/product-form.js` ok; `node --experimental-strip-types --check` ES1-T85/ES1-T67 spec ok.
- `wc -c assets/product-form.js` = 6 757 ≤ 8 192.
- Không đổi markup/locale.
- Playwright (ES1-T67 + ES1-T85), console, Lighthouse trên preview: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
