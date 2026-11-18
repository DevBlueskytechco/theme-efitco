KHÔNG CHẮC: (1) bảng ADR 0010 + task-split chưa sửa trong PR: hook chặn dev-be ghi `docs/adr/`, `drafts/techlead/`; bản sửa ở `drafts/dev-be/ES1-T370/adr-0010-task-split.md`, hỏi Tech Lead ES1-T503. (2) Playwright hành vi chưa chạy được ở local (sandbox chặn Chromium); chờ CI. (3) `drafts/dev-be/ES1-T370/pw-out/` là output lần chạy local hỏng (không xoá được trong sandbox): Orchestrator đừng commit thư mục này.

# ES1-T370 TE-5-R2-BE1: cart-items.js ≤ 7 168 B + cart-checkout-bar.js (ES1-T490 B)

AC: docs/srs.md TE-5 AC2, AC5, AC8, AC9 (+ phần JS của AC11, AC17, AC18 theo task-split ES1-T307). Markup: ES1-T368, ES1-T369, host `<cart-checkout-bar>` ES1-T498 (#266). Lượt 2 theo CTO 18/11: ES1-T490 phương án B, ES1-T500 C.

## Thay đổi
`assets/cart-items.js` (develop 5 625 → 7 149 B, ≤ 7 168 ADR 0010)
- Bỏ toàn bộ phần thanh checkout (IntersectionObserver, `data-bottom-bar`): chuyển sang `cart-checkout-bar.js`.
- Stepper: bỏ `hidden` khỏi `[data-cart-step]`; MutationObserver (childList + `hidden`) hiện lại sau mọi refresh, kể cả refresh của cart-drawer.js. −/+ dùng `stepDown()/stepUp()` native (input có `step`/`max` của rule, step base `min="0"`): bám bước, kẹp max; kẹp min theo `data-quantity-min`. Debounce 300 ms chung với ô số → 1 POST với số cuối (AC11).
- Quantity rule (AC9): − `aria-disabled` ở min, + ở max. Rời ô: số ≠ 0 mà < min hoặc `validity` sai (lệch bước, > max) → hiện `[data-cart-line-error]`, `aria-invalid="true"`, `aria-describedby="<id>-rule <id>-error"`, không gửi. Gõ 0 vẫn xoá. Sửa đúng → ẩn lỗi, gửi.
- 422 (AC2, AC9): `description` của Shopify vào `role="alert"`, ô về `defaultValue` (số server), không refresh.
- Ghi chú drawer (AC8): `[data-note]` `change` → POST `{{ routes.cart_url }}/update.js` `{ note }` cùng hàng đợi; lỗi → `data-label-error`; ô ngoài partial nên refresh không mất chữ.
- Đang cập nhật (AC18): `aria-busy` trên `cart-items`; "Updating cart…" (`data-label-updating`) vào `role="status"`, cuối lượt ghi đè bằng kết quả (hoặc rỗng); mọi `[name="checkout"]` `aria-disabled="true"`, submit từ nút đó bị chặn. Mới (CTO "nếu còn chỗ"): dòng đang ghi `aria-busy="true"`, −/+ và xoá của dòng `aria-disabled="true"`, bấm không làm gì (link xoá không điều hướng); `finally` mở lại mọi dòng, −/+ tính lại theo số server.
- Gọn để vừa trần: bỏ AbortController listener (cùng listener object, thêm lại không trùng), `sync` duyệt theo `items`, status viết 1 chỗ trong `finally`. Giữ: hàng đợi tuần tự, chỉ refresh bị abort, `partials.fetch(...this.dataset.partials.split(" "), { url: location.href, signal })` + `partials.apply`, `sync` sau apply (apply giữ value input), CartLinesUpdateEvent (ES1-T85/T91), focus sau xoá, `theme:cart:updated`.

`assets/cart-checkout-bar.js` (mới, 998 B, ≤ 1 024)
- `<cart-checkout-bar>` (host FE ES1-T498, trong partial `cart-page`): IntersectionObserver trên `.cart-summary--page` trong cùng vùng partial; dưới 64rem và panel ngoài màn → bỏ `hidden` aside + `html[data-bottom-bar="cart"]`; panel vào màn, ≥ 64rem (nghe `change` của matchMedia), host bị gỡ (refresh, giỏ rỗng, editor) → `hidden` + gỡ thuộc tính chỉ khi giá trị là `cart`. Không đo chiều cao (ADR 0007 #2). Guard `customElements.get`.

`blocks/cart-page.liquid`: thêm `<script src="{{ 'cart-checkout-bar.js' | asset_url }}" type="module" defer></script>` cạnh script cart-items.js, ngoài partial (ES1-T500 C). Không đổi markup khác.

Tests
- `tests/e2e/ES1-T370.spec.ts`: trần 7 168 / 1 024; không import tĩnh, console, đo layout ở cả 2 file; cart-items.js không còn `bottomBar`/IntersectionObserver; host `<cart-checkout-bar>` bọc aside trong partial; 1 thẻ script bar ngoài partial. Fixture có host + script bar. Mới: dòng bận (aria-busy, −/+/xoá aria-disabled, bấm không gửi, không điều hướng), 422 mở lại dòng, refresh thay host + panel, 360 → 1280 → 360, gỡ host, bar 404 thì cart-items vẫn chạy. Click phần tử `aria-disabled` dùng `force` (Playwright coi là disabled).
- `ES1-T97.spec.ts`, `ES1-T98.spec.ts`: bỏ nâng trần 8 192; trần cart-items.js 7 168 theo ADR 0010 (develop đang 5 632).
- `drafts/dev-be/ES1-T370/pw-fixture.config.mjs`: config chạy spec fixture không cần PREVIEW_URL (`npx playwright test -c drafts/dev-be/ES1-T370/pw-fixture.config.mjs ES1-T370`).

## Byte (wc -c)
- cart-items.js 7 149 (≤ 7 168); cart-checkout-bar.js 998 (≤ 1 024).
- /cart tải sẵn: standard-events 888 + motion 6 129 + header-menu 3 068 + header-sticky 1 680 + modal-dialog 2 039 + page-layers 2 031 + cart-drawer 3 910 + cart-items 7 149 + cart-checkout-bar 998 = 27 892 ≤ 40 960.
- Trang khác: không đổi (cart-items.js chỉ import khi mở drawer; bar chỉ ở cart page).

## Việc cho FE
- Spinner ô số dòng đang đổi (AC18): CSS trên `.cart-line[aria-busy="true"]`; −/+/xoá đã có `aria-disabled`.
- "Updating cart…" thay chỗ ghi chú thuế (cart.md §4): JS chỉ ghi `role="status"` ẩn; FE hiện bằng CSS khi `cart-items[aria-busy="true"]`.
- Drawer chưa có `data-label-updating`.
- Lỗi mạng: "We couldn't update your cart" + "Reload Cart"/"Try Again" (AC18) chưa có markup.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 22 warning có sẵn ở 7 file không thuộc ticket.
- `wc -c`: cart-items.js 7 149, cart-checkout-bar.js 998. Không console.*, không import tĩnh module theme.
- `npx playwright test --list` (ES1-T370, T97, T98): biên dịch được, 170 test. Chạy local: 2 test tĩnh ES1-T370 pass; 20 test hành vi không khởi động được Chromium trong sandbox.
- Playwright trên preview, Lighthouse /cart, console: chờ CI. `node --check`: sandbox không cho chạy.
- Contract partial: `cart-page`, `cart-count` (+ drawer `cart-drawer`, `cart-drawer-count`, `cart-drawer-footer`) đọc từ `data-partials`, không đổi.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
