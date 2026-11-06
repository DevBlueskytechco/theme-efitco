KHÔNG CHẮC: E2E chưa chạy (sandbox agent không mở được trình duyệt, không có node_modules) — chờ CI. Thời điểm trình duyệt khôi phục form khác nhau giữa engine; fix dựa vào pageshow luôn bắn sau khi khôi phục (sau load khi tải mới, persisted khi bfcache).

# ES1-T73: Bug TE-3 AC2, Back từ trang sản phẩm thì link card không khớp swatch đang chọn

Ticket: ES1-T73, parent TE-3. Nguồn: CI PR #62 run 41611440083, `tests/e2e/TE-3.spec.ts` TC-15 fail desktop + mobile.

## Nguyên nhân
`connectedCallback` chỉ kiểm radio checked ≠ defaultChecked một lần; trình duyệt khôi phục form sau đó và không bắn `change`, nên href/ảnh/giá/badge giữ variant mặc định.

## Thay đổi
- `assets/product-swatch.js` (5 010 B):
  - Tách `sync()`: radio checked không phải defaultChecked thì `select()` (ảnh, mọi `a[data-card-link]`, giá, badge).
  - `connectedCallback`: `sync()` như cũ + `window.addEventListener('pageshow', this)`; `handleEvent` nhận `pageshow` thì `sync()` lại. Bao cả tải mới (pageshow sau load) lẫn bfcache (persisted).
  - `disconnectedCallback` gỡ listener `pageshow`. Dùng chung handler object nên card di chuyển trong DOM không nhân đôi listener.
  - Không fetch, không partial, không đổi markup FE.
- `tests/e2e/ES1-T73.spec.ts` (mới, card ≥ 2 swatch trên `/collections/all` hoặc `TE3_SWATCH_HANDLE`, không có thì skip):
  - TC-1: chọn swatch khác → bấm tiêu đề → Back → mọi `a[data-card-link]`, tiêu đề, ảnh khớp radio checked; 0 console error.
  - TC-2: chọn swatch → reload → link khớp radio checked (dù trình duyệt có khôi phục hay không).
  - TC-3: tất định, đổi `checked` không qua `change` rồi bắn `pageshow` → link, ảnh đồng bộ.
- TC-15 trong `tests/e2e/TE-3.spec.ts` không đổi; là tiêu chí DoD.

Partial name: không có.

## Tự kiểm tra
- `wc -c assets/product-swatch.js`: 5 010 ≤ 8 192; tổng `assets/*.js`: 22 779.
- `node --check assets/product-swatch.js`: OK; `node --experimental-strip-types --check tests/e2e/ES1-T73.spec.ts`: OK (chưa type-check, không có node_modules).
- `shopify theme check`: 45 file, 0 offense.
- Locale: không đổi.
- `npx playwright test tests/e2e/TE-3.spec.ts -g 'TC-15'` và `tests/e2e/ES1-T73.spec.ts` desktop + mobile: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
