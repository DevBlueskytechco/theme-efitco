KHÔNG CHẮC: cart-items.js 8 189 B, vượt trần 7 168 B của ADR 0010 / task-split (≤ 8 192 trần cứng AGENTS.md). Đã hỏi Tech Lead ES1-T490 (nâng trần 8 192 hoặc tách thanh checkout ra file riêng, cần thẻ host FE). Để vừa 8 192 đã bỏ: JS tự thay chữ ghi chú thuế bằng "Updating cart…", khoá −/+/xoá từng dòng (AC18), "+ aria-disabled + câu quantity_adjusted dưới dòng sau 422" (AC11, ngoài AC ticket).

# ES1-T370 TE-5-R2-BE1: cart-items.js — stepper, quantity rule, ghi chú drawer, Updating, thanh checkout

AC: docs/srs.md TE-5 AC2, AC5, AC8, AC9 (+ phần JS của AC11, AC17, AC18 nêu trong task-split ES1-T307 §6.6). Markup: ES1-T368 (#219), ES1-T369 (#247), lớp/dải đáy ES1-T314 + ADR 0007.

## Thay đổi
`assets/cart-items.js` (5 625 → 8 189 B)
- Stepper: bỏ `hidden` khỏi `[data-cart-step]` khi gắn `data-enhanced`; MutationObserver (childList + `hidden`) hiện lại sau mọi refresh partial, kể cả refresh của cart-drawer.js. Bấm −/+ đổi số theo `data-quantity-step`, kẹp `data-quantity-min`/`max`, debounce 300 ms dùng chung timer với ô số → 1 POST với số cuối (AC11). `aria-disabled` trên nút thì bấm không làm gì; − khoá ở min (mặc định 1), + khoá ở max (AC9).
- Quantity rule (AC9): ô có `data-quantity-rule`, số ≠ 0 mà < min, > max hoặc không chia hết bước → hiện `[data-cart-line-error]` (câu rule Liquid đã in), `aria-invalid="true"`, `aria-describedby="<id>-rule <id>-error"`, không gửi. Gõ 0 vẫn xoá. Sửa đúng → ẩn lỗi, gửi.
- 422 (AC2, AC9): câu `description` của Shopify vào `role="alert"`, ô về `defaultValue` (số server), không refresh. Bỏ đọc lại `/cart.js` sau 422 (defaultValue luôn là số server lần ghi cuối).
- Ghi chú drawer (AC8): textarea `[data-note]` `change` (rời ô) → POST `{{ routes.cart_url }}/update.js` `{ note }` qua cùng hàng đợi tuần tự; lỗi → `data-label-error` trong alert, chữ giữ. Ô nằm ngoài partial nên refresh không mất chữ. Cart page không có `data-note`: lưu khi submit form (cart.md §3.5, test ES1-T97 giữ).
- Đang cập nhật (AC18): `aria-busy` trên `cart-items`; `data-label-updating` ("Updating cart…", chỉ cart page có) vào `role="status"`, xoá nếu không có kết quả; mọi `[name="checkout"]` (panel + thanh dính) `aria-disabled="true"` trong lúc ghi dòng, submit có submitter `aria-disabled` bị chặn. Lưu ghi chú không khoá Checkout (rời ô bằng cách bấm Checkout vẫn đi checkout, form gửi kèm note).
- Thanh checkout (AC17, ADR 0007 #2): IntersectionObserver trên `.cart-summary`; dưới 64rem và panel ngoài màn → bỏ `hidden` khỏi `.cart-sticky-checkout` + `html[data-bottom-bar="cart"]`; panel vào màn, từ 64rem, giỏ rỗng (không còn thanh), `cart-items` bị gỡ → `hidden` + gỡ thuộc tính (chỉ khi giá trị là `cart`, không đụng `product`/`bundle`). Không đo chiều cao. Theo dõi lại panel mới sau refresh.
- disconnectedCallback: AbortController listener, ngắt MO/IO, gỡ `data-bottom-bar="cart"`.
- Giữ nguyên: hàng đợi tuần tự, chỉ refresh bị abort, `partials.fetch(...this.dataset.partials.split(" "), { url: location.href, signal })` + `partials.apply`, CartLinesUpdateEvent (ES1-T85/T91), focus sau xoá, `theme:cart:updated`.

Tests
- Mới `tests/e2e/ES1-T370.spec.ts`: tĩnh (trần 8 192, partial, không import tĩnh/console/import.meta.url, hook Liquid khớp JS: `data-cart-step`, `data-quantity-*`, `data-cart-line-error(-text)`, `data-note` ngoài partial drawer, `data-label-updating`, `aside.cart-sticky-checkout hidden`, `name="checkout"`); hành vi trên origin giả `https://t370.test` (page.route, cart-items.js thật, thư viện partial giả qua importmap, apply thay dòng với stepper `hidden` như Liquid): −/+ hiện, − khoá ở 1, debounce 3 lần bấm → 1 POST, rule bước/min/max, ô sai không gửi + aria-invalid/describedby, gõ 0 xoá, 422, 200 bị giảm số, busy + Checkout aria-disabled chặn submit, lỗi mạng, xoá không điều hướng, ghi chú lưu khi rời ô + giữ chữ khi refresh + lỗi lưu, drawer không gắn data-bottom-bar, thanh dính 360/1280, panel mới sau refresh, gỡ element. 0 lỗi console ở các test chính.
- Sửa `tests/e2e/ES1-T97.spec.ts`, `ES1-T98.spec.ts`: trần byte 5 632 → 8 192 (ghi chú ES1-T370). `cart-checkout` `toBeDisabled` lúc busy vẫn đúng vì Playwright tính `aria-disabled`.

## Byte (wc -c)
- cart-items.js 8 189 (≤ 8 192; trần ADR 0010 7 168: KHÔNG CHẮC, ES1-T490).
- /cart tải sẵn: standard-events 888 + motion 6 129 + header-menu 3 068 + header-sticky 1 680 + modal-dialog 2 039 + page-layers 2 031 + cart-drawer 3 910 + cart-items 8 189 = 27 934 ≤ 40 960.
- Trang khác: cart-items.js chỉ import khi mở drawer lần đầu (data-items-src), không đổi tải sẵn.

## Việc cho FE (không sửa markup trong PR này)
- "Updating cart…" thay chỗ ghi chú thuế (cart.md §4): JS chỉ ghi vào `role="status"` ẩn; FE hiện chữ bằng CSS khi `cart-items[aria-busy='true']` (vd 1 span `cart.updating` cạnh `.cart-summary__note`).
- Drawer chưa có `data-label-updating` → status drawer không đọc "Updating cart…" (mini-cart-quickview §6 4b).
- Lỗi mạng: nút "Try Again" (drawer) / "Reload Cart" (cart page) và tiêu đề `cart.update_error_title` chưa có markup (AC18).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 22 warning có sẵn (không file nào của ticket; PR không sửa Liquid).
- `wc -c assets/cart-items.js` = 8 189 ≤ 8 192. Không console.*, không import tĩnh module theme, guard `customElements.get`.
- `npx playwright test --list` 3 spec: biên dịch được (164 test). `node --check`: không chạy được trong sandbox (cần quyền).
- Playwright (ES1-T370, ES1-T97, ES1-T98, ES1-T95, ES1-T96), Lighthouse /cart, console trên preview: chờ CI (global setup cần PREVIEW_URL).
- Contract partial: tên `cart-page`, `cart-count`, `cart-drawer`, `cart-drawer-count`, `cart-drawer-footer` đọc từ `data-partials`, không đổi.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
