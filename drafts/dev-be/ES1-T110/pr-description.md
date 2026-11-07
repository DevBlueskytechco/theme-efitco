KHÔNG CHẮC: (1) chưa chạy trên trình duyệt (phiên agent không có Chrome), Playwright chờ CI; (2) shopify:collection:update gửi thiếu productFilters vì vượt trần 5248 B, productsCount sau lọc lấy chữ số trong data-results-label vì chưa có hook số nguyên, promise không reject khi lỗi (ES1-T85: reject → pageerror); hỏi ở ES1-T249; (3) chưa biết partials.apply thay node hay morph, cách phát hiện apply rỗng dựa trên việc server luôn render lại data-results-label.

# ES1-T110 TE-6-BE1: collection-filters.js, lọc, sort, phân trang không reload

Ticket: ES1-T110 (TE-6 AC1 phân trang, AC2, AC3 phần không reload). Thiết kế: drafts/techlead/ES1-T103/task-split.md D7, D8, D10, D11; comment ES1-T104 #6, ES1-T123 D4.

## Thay đổi
- `assets/collection-filters.js` (mới, 4929 B, trần 5248): custom element `collection-filters`, guard `customElements.get`.
  - Gắn `data-enhanced` khi kết nối (CSS FE ẩn nút Apply). Delegate `change`, `submit`, `click` trên chính thẻ, ngoài partial.
  - change: chỉ control thuộc `#collection-filter-form` (gồm select sort qua thuộc tính form); bỏ qua input number (BE2) và radio swatch trên card (không thuộc form).
  - click: link trong `pagination`, `collection-filter-clear`, `collection-empty-clear`; dùng `href` server render; bỏ qua click có phím bổ trợ, nút chuột khác.
  - URL: `FormData` của form trên `location.pathname`, bỏ giá trị rỗng, không giữ `page`, không tự ghép tên tham số.
  - 1 request: `partials.fetch(results, "collection-filters", "collection-filter-count", { url, signal })` rồi `partials.apply(update)`. Tên vùng kết quả lấy từ `data-results-partial`, mặc định `collection-products` (ES1-T123 D4). 1 AbortController mỗi request, bỏ qua abort, chỉ request mới nhất được áp.
  - Sau apply: `history.replaceState` (không pushState), đặt mọi control về `defaultChecked`/`defaultValue`, select theo tham số URL, không có thì `defaultSelected`; khôi phục `details[data-filter-param]` đang mở/đóng; copy `data-results-label` vào `collection-status`.
  - Phân trang: `tabindex=-1` + focus vào phần tử `data-results-label`, cuộn tới đó (`auto` khi prefers-reduced-motion). Đổi filter không đổi focus.
  - `aria-busy="true"` trên thẻ khi tải, gỡ trong `finally` (chỉ request mới nhất).
  - Lỗi fetch hoặc apply rỗng (label vẫn trống sau apply): `location.assign(url)`. Không log console.
  - `pageshow`: bfcache với URL khác nội dung đang hiển thị thì fetch lại; còn lại đồng bộ form về trạng thái server.
  - `shopify:collection:update` (CollectionUpdateEvent, CDN standard-events) dispatch từ form khi đổi filter/sort/Clear, chỉ khi form có `data-collection-handle`: collection {id GID|null, handle, productsCount}, sortKey từ sort_by, promise resolve {productsCount} sau apply. Không dispatch khi phân trang.
- `blocks/collection-filters.liquid`: thêm `<script type="module">` ngoài partial, trong root của block. Không đổi markup khác.
- `tests/e2e/ES1-T110.spec.ts` (mới): AC1, AC2, AC3 + contract.
- `drafts/dev-be/ES1-T110/logic-check.cjs`: DOM giả, 11 nhóm kiểm logic.

## Ngân sách JS trang collection (D10)
collection-filters 4929 B, dưới mức D10 7168 B cho cả BE1 + BE2. Còn 2239 B cho BE2.

## Tự kiểm tra
- `wc -c assets/collection-filters.js`: 4929 (≤ 5248, ≤ 8192).
- `node --check assets/collection-filters.js`: ok. `node --experimental-strip-types --check tests/e2e/ES1-T110.spec.ts`: ok.
- `shopify theme check`: 0 lỗi (22 warning có sẵn ở file khác, không ở file của PR).
- `node drafts/dev-be/ES1-T110/logic-check.cjs`: 11 nhóm pass (URL từ FormData, 3 partial, replaceState sau apply, Clear all bỏ tick, đổi nhanh chỉ áp request cuối, sort theo URL, phân trang focus + không event, phím bổ trợ, swatch/number bỏ qua, lỗi mạng và apply rỗng → assign, /search không event + data-results-partial, pageshow persisted). Harness bắt được 1 lỗi thật trước khi nộp: `false?.()` ném TypeError làm phân trang tụt về tải cả trang.
- Locale: không đổi.
- Chờ CI: `npx playwright test tests/e2e/ES1-T110.spec.ts -g "AC1|AC2|AC3"` desktop + Pixel 7, TE-3.spec.ts, ES1-T108/T109 hồi quy, axe sau apply, 0 console error, lhci collection.

## Rủi ro
- Test cần filter, phân trang sau lọc, card nhiều swatch skip nếu store thiếu dữ liệu (ES1-T105).
- Test đổi nhanh giữ request 1 s bằng page.route để chắc request cũ bị huỷ; nếu Playwright không phát requestfailed cho request bị huỷ khi đang giữ route thì assert số request huỷ đỏ giả, kết quả cuối vẫn được kiểm riêng.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
