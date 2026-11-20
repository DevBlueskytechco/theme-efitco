KHÔNG CHẮC: base.css gzip 53 163 B, lớn hơn develop f3fbad4 (52 542 B) 621 B. Vẫn dưới trần tạm 53 248 (ES1-T454), dư 85 B, nhưng trái quy tắc "mỗi PR không làm base.css lớn hơn develop", nên cần CTO duyệt ngoại lệ (ES1-T469, đã cập nhật số). Không còn CSS collection cũ hay chết để xoá. List-collections thuộc phạm vi TE-6-R2-FE4.

# ES1-T365 TE-6-R2-FE2: trang collection (banner, toolbar, chip, empty state)

AC: TE-6 AC1, AC3, AC6, AC7 (SRS 0.4; bản 0.5 trỏ thêm AC8, AC11–AC14).
Nguồn: docs/ui-spec/collection.md §3, §4, §6–§9; foundation §3.3, §5.
Phụ thuộc: TE-22-R2-FE1 (breadcrumb, page-title, .page-banner, #217), TE-6-R2-FE1 (pagination).

## Lượt 3: gộp develop sau #219 (ES1-T368 cart)
- PR #237 xung đột với develop ở 3 file: `assets/base.css`, `locales/en.default.json`, `snippets/status-icon.liquid`. Hai phía sửa vùng khác nhau nên không có xung đột thật. Bản gộp giữ toàn bộ thay đổi của develop và đặt phần của ticket lên trên.
  - base.css: ticket sửa mục collection (khoảng dòng 2393–3210), #219 sửa mục cart (từ dòng 5394). Đã kiểm diff: so với develop chỉ còn đúng 33 hunk của ticket; so với nhánh cũ chỉ còn đúng 91 hunk của #219.
  - status-icon: giữ 6 icon cart của #219 (truck, tag, trash, edit, minus, plus), thêm `filter` của ticket, doc param liệt kê đủ 14 tên.
  - en.default.json: `cart.*` lấy theo #219, `blocks.collection_products.*` lấy theo ticket. Không trùng key. Hai key `empty` và `empty_filtered` đã bỏ, không còn file nào dùng.
- Sau khi gộp, base.css gzip lên 53 461 B, vượt trần 53 248 (TC-08 báo đỏ). Đã bỏ các comment dài trong mục collection (không đổi rule nào), gzip xuống 53 163 B. Hai comment mốc mà TC-08 dùng để cắt mục vẫn giữ.
- Ghi chú cho Orchestrator: nhánh local `feature/ai-ES1-T365` đang trỏ vào `origin/develop` (f3fbad4), không phải `origin/feature/ai-ES1-T365` (77169fb). Lệnh `git merge` và `git apply` bị chặn, nên phần ticket được dựng lại trong working tree (lấy file bằng `git show`, gộp tay 3 file chồng nhau). Commit từ trạng thái này sẽ không fast-forward so với `origin/feature/ai-ES1-T365`, cần push kiểu force-with-lease hoặc commit merge có parent là nhánh cũ.

## Thay đổi (so với develop)
- `templates/collection.liquid`: chỉ sửa comment composition (banner → `<collection-filters>` [lọc 3/12 + kết quả 9/12]).
- `blocks/collection-banner.liquid`:
  - Không có ảnh: `snippets/breadcrumb` → `snippets/page-title` (h1 = collection.title) → mô tả `.rte`.
  - Có `collection.image`: dùng `.page-banner`, breadcrumb và h1 nằm trên ảnh. Ảnh là LCP: eager, fetchpriority high, alt rỗng, không crop phía server.
  - Mô tả ≤ 168 ký tự: từ 48rem nằm trên ảnh, dưới 48rem nằm dưới ảnh. Mô tả dài luôn nằm dưới ảnh và không bị cắt.
  - Bỏ hook `collection-banner-title`.
- `blocks/collection-products.liquid`:
  - Toolbar gồm nút Filter có icon, partial mới `collection-count` ("N products", tabindex -1) và Sort là select gốc có nhãn nằm trong ô. Collection không có sản phẩm thì ẩn toolbar. Dưới 64rem toolbar dính dưới header.
  - Chip lọc đang áp dụng nằm trong partial `collection-products`: `ul aria-label="Active filters"`, mỗi chip là link `url_to_remove`. "Clear all" giữ cách sort người mua đã chọn.
  - Empty state qua `snippets/empty-state`, có 3 loại: collection rỗng, lọc ra 0 sản phẩm, `?page=` vượt số trang (có nút "Go to page 1").
  - Phân trang dùng snippet chung, `window_size: 1`. `columns_desktop` mặc định 3.
  - Hook cho BE (ES1-T110): `data-label-updating`, `template[data-collection-updating]`, `template[data-collection-skeleton]`, `template[data-collection-error]`.
- `snippets/status-icon.liquid`: thêm icon `filter`. `snippets/empty-state.liquid`: cập nhật doc param.
- `locales/en.default.json`: gộp key mới vào `blocks.collection_products`, bỏ `empty` và `empty_filtered`.
- `assets/base.css`:
  - Xoá `.collection-banner__image`, `.collection-banner__title`, `.collection-products__count`, `.collection-products__empty`, `.collection-products__empty-text`.
  - Thêm lưới 12 cột (lọc 3, kết quả 9), toolbar, sort, chip, `.collection-banner__description--*`.
- Sửa các spec cũ trái AC mới, có ghi AC thay thế trong comment:
  - `tests/e2e/ES1-T108.spec.ts`: h1 kiểm qua `page-title-heading`. Ở 1280 có 3 cột. Collection rỗng dùng `collection-empty-button` và `collection-empty-link`, toolbar ẩn. Mô tả có 2 bản thì chỉ 1 bản hiện.
  - `tests/e2e/ES1-T109.spec.ts`: lọc ra 0 sản phẩm thì hiện `collection-empty-heading` "No Matching Products" và `collection-empty-button` "Clear filters".
- `tests/e2e/ES1-T365.spec.ts`: TC-01..13 là test tĩnh và fixture; TC-14..18 cần store.

## Hợp đồng partial và testid cho BE (ES1-T110)
- Partial: `collection-products`, `collection-count`, `collection-filter-count`. Tên cũ giữ nguyên, chỉ thêm `collection-count`.
- Mỗi lần refresh fetch cả 4 partial: `collection-products`, `collection-count`, `collection-filter-count`, `collection-filters`.
- Testid: collection-toolbar, collection-filter-open, collection-filter-count, collection-count, collection-sort, collection-sort-apply, collection-status, collection-results, collection-active-filters, collection-chip, collection-chips-clear, collection-grid, collection-product, collection-empty(-heading/-button/-link), collection-page-empty(-…), collection-error.

## Ngân sách (đo trên develop f3fbad4)
| | develop | nhánh |
|---|---|---|
| base.css gzip (zlib level 6) | 52 542 | 53 163 (+621), trần tạm 53 248 |
| base.css raw | 286 436 | 291 902 |
| critical.css | 9 995 | 9 995 (không đổi) ≤ 10 240 |

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 22 warning. Cả 22 warning nằm ở file của develop (bundle-builder, featured-product, quiz-step, testimonial-item, index*.liquid), không file nào trong diff.
- `tests/e2e/ES1-T365.spec.ts` TC-01..08 (đọc file, không cần trình duyệt): 8/8 đạt sau khi gộp, gồm TC-07 locale không trùng key và TC-08 CSS 0 literal, gzip ≤ 53 248.
- TC-09..13 (fixture 360/768/1280/1920, hover/focus): lượt này không chạy được trên máy vì sandbox chặn mở Chromium. Lượt 2 đạt 14/14. Lượt này các rule layout không đổi, chỉ bỏ comment. Chờ CI chạy lại.
- TC-14..18 (store, nojs) cần PREVIEW_URL: chờ CI. Test nào thiếu dữ liệu (TE6_IMAGE_COLLECTION_HANDLE, TE6_EMPTY_COLLECTION_HANDLE, TE6_FILTER_NO_RESULT_QUERY, collection có filter) sẽ skip có lý do, không tính là đạt. ES1-T108, ES1-T109, cùng ES1-T96, ES1-T97 của #219: chờ CI.
- Lighthouse, ảnh 3 breakpoint, visual diff: chờ CI.
- Diff không có file JS.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
