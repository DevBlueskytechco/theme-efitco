KHÔNG CHẮC: base.css gzip 51 854 B, lớn hơn develop 50 898 B (+956). Dưới trần tạm 53 248 (ES1-T454, CTO comment ES1-T365 16/11) nhưng trái quy tắc "mỗi PR không làm base.css lớn hơn develop" → cần CTO duyệt ngoại lệ. Không còn CSS collection cũ/chết để xoá; list-collections là phạm vi TE-6-R2-FE4.

# ES1-T365 TE-6-R2-FE2: trang collection (banner, toolbar, chip, empty state)

AC: TE-6 AC1, AC3, AC6, AC7 (SRS 0.4; 0.5 trỏ AC8, AC11–AC14). Nguồn: docs/ui-spec/collection.md §3, §4, §6–§9, foundation §3.3, §5. Phụ thuộc: TE-22-R2-FE1 (breadcrumb, page-title, .page-banner, #217), TE-6-R2-FE1 (pagination).

## Thay đổi
- `templates/collection.liquid`: chỉ sửa comment composition (banner → `<collection-filters>` [lọc 3/12 + kết quả 9/12]).
- `blocks/collection-banner.liquid`:
  - Không ảnh: `snippets/breadcrumb` → `snippets/page-title` (h1 = collection.title) → mô tả `.rte`.
  - Có `collection.image`: `.page-banner` có breadcrumb và h1 trên ảnh. Ảnh là LCP: eager, fetchpriority high, alt rỗng, không crop server.
  - Mô tả ≤ 168 ký tự nằm trên ảnh từ 48rem, dưới ảnh khi < 48rem; mô tả dài luôn nằm dưới ảnh, không cắt.
  - Bỏ hook `collection-banner-title`.
- `blocks/collection-products.liquid`:
  - Toolbar: nút Filter có icon, partial `collection-count` mới ("N products", tabindex -1), Sort là select gốc với nhãn nằm trong ô. Toolbar ẩn khi collection không có sản phẩm. Dưới 64rem toolbar dính dưới header.
  - Chip lọc đang áp nằm trong partial `collection-products`: `ul aria-label="Active filters"`, mỗi chip là link `url_to_remove`; "Clear all" giữ sort người mua đã chọn.
  - Empty state có 3 loại qua `snippets/empty-state`: collection rỗng, lọc ra 0 sản phẩm, `?page=` vượt số trang (nút "Go to page 1").
  - Phân trang dùng snippet chung, `window_size: 1`.
  - `columns_desktop` mặc định 3.
  - Hook cho BE (ES1-T110): `data-label-updating`, `template[data-collection-updating]`, `template[data-collection-skeleton]`, `template[data-collection-error]`.
- `snippets/status-icon.liquid`: thêm icon `filter`. `snippets/empty-state.liquid`: cập nhật doc param.
- `locales/en.default.json`: gộp khoá mới vào `blocks.collection_products`, bỏ `empty`, `empty_filtered`; không trùng key.
- `assets/base.css`:
  - Xoá `.collection-banner__image/__title`, `.collection-products__count/__empty/__empty-text`.
  - Thêm lưới 12 cột 3/9, toolbar, sort, chip, `.collection-banner__description--*`.
  - Lượt 2 rút gọn comment và gộp rule hover/focus/transition: gzip từ 52 327 xuống 51 854.
- Spec cũ trái AC mới, đã sửa và ghi AC thay trong comment:
  - `tests/e2e/ES1-T108.spec.ts`: h1 qua `page-title-heading`; 1280 có 3 cột; empty dùng `collection-empty-button`/`-link`, toolbar ẩn; mô tả có 2 bản thì chỉ 1 bản hiện.
  - `tests/e2e/ES1-T109.spec.ts`: lọc ra 0 sản phẩm thì hiện `collection-empty-heading` "No Matching Products" và `collection-empty-button` "Clear filters".
- `tests/e2e/ES1-T365.spec.ts`: TC-01..13 tĩnh + fixture; TC-14..18 cần store.

## Hợp đồng partial / testid cho BE (ES1-T110)
- Partial: `collection-products`, `collection-count`, `collection-filter-count` (tên không đổi, thêm `collection-count`).
- Một lần refresh fetch cả 4 partial: `collection-products`, `collection-count`, `collection-filter-count`, `collection-filters`.
- Testid: collection-toolbar, collection-filter-open, collection-filter-count, collection-count, collection-sort, collection-sort-apply, collection-status, collection-results, collection-active-filters, collection-chip, collection-chips-clear, collection-grid, collection-product, collection-empty(-heading/-button/-link), collection-page-empty(-…), collection-error.

## Ngân sách
| | develop | nhánh |
|---|---|---|
| base.css gzip (level 6) | 50 898 | 51 854 (+956), trần tạm 53 248 |
| base.css raw | 275 471 | 281 729 |
| critical.css | không đổi | 10 014 ≤ 10 240 |

## Tự kiểm tra
- `shopify theme check`: 0 lỗi. Có 22 warning, đều ở file develop (bundle-builder, featured-product, quiz-step, testimonial-item, index*.liquid), không file nào trong diff.
- `tests/e2e/ES1-T365.spec.ts` nhóm "tĩnh": 14/14 đạt trên máy. Gồm template, banner LCP, paginate, sort, chip, empty state, locale, CSS 0 literal/0 vật lý/0 z-index số, ngân sách, layout fixture 360/768/1280/1920, hover/focus.
- TC-14..18 (store, nojs) cần PREVIEW_URL: chờ CI. Các test thiếu dữ liệu (TE6_IMAGE_COLLECTION_HANDLE, TE6_EMPTY_COLLECTION_HANDLE, TE6_FILTER_NO_RESULT_QUERY, collection có filter) sẽ skip có lý do, không tính là đạt.
- ES1-T108/T109 sau khi sửa: chờ CI (cần store).
- Lighthouse, ảnh 3 breakpoint, visual diff: chờ CI.
- Không có file JS trong diff.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
