KHÔNG CHẮC: (1) event cart chuẩn Standard storefront sau add to cart chưa có tên/constructor trong nguồn dự án (SRS TE-5 AC7 chỉ nêu `shopify:cart:lines-update`, ES1-T75 không có) → chưa dispatch, chỉ `theme:cart:updated`; hỏi CTO ES1-T83 (kèm việc override updateCart/openCart thuộc ES1-T67 hay TE-5); (2) không có locale "Added to cart" → JS đọc `data-label-added`, chưa có thì không ghi product-form-status; hỏi Tech Lead ES1-T84; (3) E2E chưa chạy (sandbox không mở được trình duyệt) — chờ CI.

# feat(product): product-form.js add to cart .js, lỗi 422, sticky bar, gift card [ES1-T67]

## Làm gì
- `assets/product-form.js` (5 082 B), 2 custom element, ES module, không import:
  - `product-form` (root FE3): bắt `submit` của `form#product-form-{data-product-id}` (cả nút sticky qua `form=`), `preventDefault`, `POST {data-cart-add-url}.js` với `FormData(form)` (id, quantity, properties, selling_plan; bỏ `selling_plan` rỗng), header `Accept: application/json`, `X-Requested-With`, AbortController (abort khi disconnect).
    - Đang gửi: mọi `button[name=add]` thuộc form (chính + sticky) `disabled` + `aria-busy="true"`, chặn submit lặp; xong trả về trạng thái trước đó, focus lại nút đã bấm nếu focus rơi về body.
    - OK: dispatch `theme:cart:updated` (bubbles, detail `{ source: "product-form", item }` = response cart/add.js) cho TE-5; `data-label-added` có thì ghi vào `product-form-status`; `data-cart-type` = `page` hoặc DOM không có `cart-drawer` → `location.assign(data-cart-url)` (nút giữ khoá tới khi rời trang, bfcache `pageshow persisted` mở khoá); còn lại để TE-5 mở drawer.
    - Lỗi có JSON (422 và 4xx khác): chuỗi `description` (không có thì `message`) vào `product-form-error` (`role=alert`), nút về trạng thái cũ; lỗi cũ xoá trước mỗi lần gửi.
    - Lỗi mạng hoặc lỗi không có JSON: `HTMLFormElement.prototype.submit` → POST thường tới `/cart/add` (đường không JS), không console error.
    - Gift card (AC6): checkbox `properties[__shopify_send_gift_card_to_customer]` bỏ tick → `fieldset.product-gift-card__fields` `disabled` (4 field + offset không gửi); tick → bật. Thêm `input hidden name="properties[__shopify_offset]"` = `new Date().getTimezoneOffset()` trong fieldset (một lần). Đồng bộ lại khi `pageshow`.
  - `product-sticky-bar` (root FE2): chỉ chạy khi `matchMedia("(max-width: 47.99rem)")` (khớp base.css), đổi breakpoint thì bật/tắt lại. `IntersectionObserver` trên `button[name=add]` trong form chính: nút ra khỏi màn ở phía trên (`bottom <= 0`) → bỏ `hidden` + `data-sticky-bar-visible` trên `html`; nút quay lại → ẩn + bỏ thuộc tính. `MutationObserver` trên form để observe lại nút khi partial `product-buy-buttons` thay node. Không scroll listener. Desktop: luôn `hidden`.
- `blocks/product-form.liquid`: +1 dòng `<script src="{{ 'product-form.js' | asset_url }}" type="module"></script>` cuối `<product-form>` (ngoài `has_variant_choice`, sản phẩm 1 variant vẫn có JS). Markup khác không đổi. Sticky bar không có thẻ script riêng; module defer nên `product-sticky-bar` (sau form trong DOM) được upgrade.
- `tests/e2e/ES1-T67.spec.ts`: contract tĩnh (byte ≤ 5120, đúng 1 thẻ script, tên custom element, data hook/selector JS có trong markup, media query khớp base.css, không scroll listener); AC8 thêm thật → /cart + `theme:cart:updated` + /cart.js có variant; AC8 mock 422 (nút disabled + aria-busy khi chờ, text API trong product-form-error, nút bật lại, không navigate, lỗi cũ được thay); AC8 route.abort → fallback /cart; AC5 390px cuộn qua nút → sticky hiện (title, price, add) + attr html, cuộn về → ẩn; AC5 nút sticky gửi form chính (mock, id + quantity); AC5 1280px không hiện; AC6 bỏ tick không gửi Recipient/Message/Send on/offset; AC6 tick gửi 4 field + offset bằng múi giờ trình duyệt.

## Vì sao
ES1-T67 (parent TE-4): AC5, AC6 (JS phụ), AC8. Nguồn: drafts/techlead/ES1-T59/task-split.md D5, D8, D9, D10; ADR 0002, 0006; markup ES1-T63 (sticky bar), ES1-T64 (form). Không làm cart drawer (TE-5).

Ngân sách JS trang sản phẩm (ADR 0006, D9): header-menu 6 862 + header-sticky 1 680 + product-variant-picker 7 083 (7 457 sau ES1-T81) + product-form 5 082 = 20 707 B (21 081 B), dưới trần 30 046 của TE-4 trước BE3/BE4.

## Cách test
```
PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... [TE4_SINGLE_HANDLE=...] [TE4_GIFT_CARD_HANDLE=...] \
  npx playwright test tests/e2e/ES1-T67.spec.ts -g "AC5|AC6|AC8"
```
Preview URL / theme_id: chờ CI sau khi Orchestrator push. Thiếu handle → test skip có lý do. Test AC8 thật dọn giỏ bằng `/cart/clear.js` trước và sau.

## Ảnh (360 / 768 / 1280)
Không đổi UI tĩnh; sticky bar hiện/ẩn ở 390 và không hiện ở 1280 do E2E kiểm. Ảnh: chờ CI.

## Checklist
- [x] theme check 0 lỗi (49 file, 0 offense)
- [ ] Lighthouse: perf ≥ 96 desktop / ≥ 90 mobile, a11y ≥ 98, CLS không tăng — chờ CI
- [x] Không file ngoài phía của tôi (BE: assets/product-form.js, thẻ script, tests/)
- [x] Chuỗi qua | t; URL qua routes.* (JS chỉ đọc data-cart-add-url / data-cart-url từ Liquid routes)
- [x] KHÔNG CHẮC: xem dòng đầu (ES1-T83, ES1-T84)

## Tự kiểm tra
- `wc -c assets/product-form.js`: 5 082 ≤ 5 120 (còn 38 B; thêm event chuẩn ở ES1-T83 có thể cần nới trần).
- `node --check assets/product-form.js`: OK; `node --experimental-strip-types --check tests/e2e/ES1-T67.spec.ts`: OK (chưa type-check, chưa có node_modules).
- `shopify theme check`: 0 offense. Locale: không đổi, không trùng key.
- E2E desktop + Pixel 7, 0 console error, lhci: chờ CI.

## Mở
- Fallback submit thường khi lỗi mạng/5xx không JSON: nếu server đã thêm mà response lỗi, giỏ có thể +1 lần. Chấp nhận để giữ đường không JS.
- Khoá nút lưu trạng thái `disabled` trước khi gửi; nếu khách đổi variant trong lúc chờ và partial thay nút thì nút mới theo server, nút cũ đã rời DOM.
- route.abort / fulfill 422: Chrome log "Failed to load resource"; spec bỏ qua đúng mẫu này trong các test lỗi.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
