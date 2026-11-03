KHÔNG CHẮC: E2E chưa chạy (sandbox agent không mở được trình duyệt, không có node_modules) — chờ CI. Ticket ghi "class modifier", nhưng {% doc %} của snippets/product-card.liquid (ES1-T56) và assets/base.css style theo [data-badge], nên JS đổi data-badge, không đổi class.

# ES1-T57: TE-3-BE2 product-swatch.js đổi badge sale/sold out theo swatch

Ticket: ES1-T57, parent TE-3. Nguồn: CTO chốt ES1-T55; hook FE ở ES1-T56 (`data-card-badge`, radio `data-badge`, `data-badge-label`).

## Thay đổi
- `assets/product-swatch.js` (4 438 B): `select()` gọi thêm `swapBadge(data-badge, data-badge-label)` trên `[data-card-badge]`:
  - sale | sold_out: `data-badge` = giá trị radio, text = `data-badge-label`, bỏ `hidden`, `data-testid` = `product-card-badge-sale` | `product-card-badge-sold-out`.
  - none (hoặc giá trị lạ): `data-badge="none"`, text rỗng, `hidden`, `data-testid="product-card-badge"`.
  - Radio không có `data-badge`: giữ badge hiện tại.
  - Không fetch, không partial. Áp dụng cả lúc khôi phục form back/forward (connectedCallback → select).
- `tests/e2e/TE-3.spec.ts` (theo comment CTO: ES1-T52.spec.ts đã gộp vào TE-3.spec.ts):
  - `expectBadge()` gọi trong `expectSwapped()` → TC-12, TC-13, TC-14 kiểm thêm badge sau khi đổi swatch (bỏ qua nếu radio không có `data-badge`).
  - TC-17 mới: tìm card có 2 swatch khác badge trên `/collections/all` (tối đa 5 trang, hoặc env `TE3_BADGE_SWATCH_HANDLE`), đổi swatch → badge khớp radio và khớp `/products/<handle>.js` (sold out / -N% / Sale / ẩn), chọn lại → về badge ban đầu, 0 console error. Store thiếu dữ liệu thì skip có lý do.

Markup FE không đổi. Partial name: không có.

## Tự kiểm tra
- `wc -c assets/product-swatch.js`: 4 438 ≤ 8 192; tổng `assets/*.js`: 22 207.
- `node --check assets/product-swatch.js`: OK; `node --experimental-strip-types --check tests/e2e/TE-3.spec.ts`: OK (chưa type-check, không có node_modules).
- `shopify theme check`: 43 file, 0 offense.
- Locale: không đổi.
- `npx playwright test tests/e2e/TE-3.spec.ts` desktop + mobile: chờ CI.
- 0 console error, axe sau đổi swatch (TC-55): chờ CI.

## Mở
- drafts/qa/ES1-T53/test-cases.md dòng 97 vẫn ghi "badge không đổi theo swatch, chờ ES1-T55": QA cập nhật, thêm TC-17.
- Store dev cần 1 sản phẩm có màu sale và màu không sale / hết hàng để TC-17 không skip (dữ liệu TE-9).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
