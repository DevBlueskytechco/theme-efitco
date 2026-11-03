KHÔNG CHẮC: E2E, axe, lhci chưa chạy (sandbox agent không mở được trình duyệt) — chờ CI. Badge sale và link "+N" khi đổi swatch hỏi ở ES1-T55.

# ES1-T52: TE-3-BE1 assets/product-swatch.js

Ticket: ES1-T52 (2727475000000142025), parent TE-3. Nguồn: docs/srs.md TE-3 AC2, AC6, AC8; ADR 0002, 0003; drafts/techlead/ES1-T47/task-split.md D5, D6, D7.

## Thay đổi
- `assets/product-swatch.js` (mới, 3 401 B): ES module, `customElements.define('product-swatch')` trên root card (snippets/product-card.liquid). Không fetch, không partial (D5).
  - 1 listener `change` delegate trên card (handleEvent, gỡ ở disconnectedCallback; addEventListener cùng object nên nối lại DOM không nhân đôi).
  - Radio `[data-variant-id]` checked: đổi `img[data-card-image]` (srcset trước src, alt; giữ width/height; `data-image-src` rỗng thì giữ ảnh cũ), `href` mọi `a[data-card-link]` = `data-variant-url`, `[data-card-price]` = clone `template[data-price-for="<variant id>"]` nếu có.
  - connectedCallback: radio checked khác `defaultChecked` (form restore back/forward) thì đồng bộ ảnh/link/giá.
  - Keyboard: radio gốc, không roving tabindex, không đụng focus.
  - Không đổi URL trang, không reload.
- `blocks/featured-collection.liquid`: thêm `<script type="module">` sau lưới card (chỉ khi có sản phẩm); sửa 1 dòng `{% doc %}` cũ "No script tag here".
- `templates/collection.liquid`: thêm `<script type="module">` cuối container.
- `tests/e2e/ES1-T52.spec.ts`: AC2 trên `/` và `/collections/all` — chuột chọn swatch thứ 2, ArrowDown; kiểm `src`/`currentSrc`, alt, href `?variant=<id>`, giá theo template, width/height + chiều cao khung không đổi, URL giữ nguyên, 0 request document mới, focus giữ trên radio, axe 0 serious/critical sau đổi, card nối lại DOM, 0 console error. Không có card ≥ 2 swatch thì skip có lý do.

Partial name: không có (D5). Markup FE không đổi ngoài thẻ script.

## Tự kiểm tra
- `wc -c assets/product-swatch.js`: 3 401 ≤ 8 192; tổng `assets/*.js`: 21 170 ≤ 40 960.
- `node --check assets/product-swatch.js`: OK.
- `shopify theme check`: 43 file, 0 offense.
- Locale: không đổi.
- `npx playwright test tests/e2e/ES1-T52.spec.ts -g "AC2"` desktop + mobile: chờ CI.
- 0 console error, axe sau đổi swatch: chờ CI.
- `npx lhci autorun` (≥ 96/90, a11y ≥ 98, CLS không tăng): chờ CI.

## Mở
- ES1-T55 (Tech Lead): badge sale/Sold out không đổi theo swatch; link "+N" có `data-card-link` nên cũng nhận `?variant=`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
