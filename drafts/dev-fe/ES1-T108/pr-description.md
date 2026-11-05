KHÔNG CHẮC: (1) chưa có preview: Liquid chưa render thật, Playwright, axe, lhci, ảnh 360/768/1280 đều chờ CI; spec chưa chạy, chưa type-check (không có tsc trong môi trường). (2) Dữ liệu ES1-T105 chưa có: test ảnh banner và collection rỗng sẽ skip tới khi có `TE6_IMAGE_COLLECTION_HANDLE`, `TE6_EMPTY_COLLECTION_HANDLE`, nên 2 phần đó của DoD chưa được kiểm trên store. (3) Figma không có trang collection: bố cục là mặc định ES1-T107, chờ Designer. (4) AGENTS.md "chỉ hero eager" và "ngoài storefront render nothing" lệch ticket: làm theo ticket, đã hỏi ở ES1-T113. (5) Số mỗi trang list-collections 24 là mặc định, chờ PO ES1-T106 #5. (6) `part.url` có giữ tham số filter không: doc không nói (ES1-T104 #5), QA kiểm sau FE2. (7) Spec ở drafts vì scope-guard chặn tests/.

# ES1-T108 TE-6-FE1: trang collection và list-collections

Ticket: ES1-T108 · AC: docs/srs.md#TE-6 AC1, AC5, AC2 phần vùng partial · Nguồn: drafts/techlead/ES1-T103/task-split.md D1, D2, D3, D4, D11, D12.

## Thay đổi
- `templates/collection.liquid`: container `collection-banner` → block `collection-banner`; container `collection-main` → thẻ `<collection-filters class="collection-layout">` → block `collection-products`.
- `blocks/collection-banner.liquid` (mới): ảnh, h1, description, 0 settings. Ảnh qua `snippets/image.liquid`, không crop, eager + fetchpriority high, cắt bằng `object-fit`.
- `blocks/collection-products.liquid` (mới): `columns_desktop` 2/3/4 (default 4), `columns_mobile` 1/2 (default 2); partial `collection-products` bọc paginate 24: số kết quả, lưới, pagination, rỗng. Card theo nhánh `item.product` như featured-collection, `heading_level: 'h2'`. `product-swatch.js` ngoài partial, luôn nạp.
- `snippets/pagination.liquid` (mới): Previous, parts, Next, `aria-current="page"`, link thường, chỉ render khi `paginate.pages` lớn hơn 1.
- `templates/list-collections.liquid`: h1, paginate 24, card ảnh hoặc `placeholder_svg_tag`, title, pagination. Bỏ `style="--grid-gap: 10px"` và phần description cũ (AC5 không có).
- `assets/base.css`: xoá `.collection-products` cũ (literal 280px), `.collections`, `.collections--compact`, `.collections--full`, `.collection-card`; thêm mục Collection page, Pagination, Collections list page, chỉ `var(--*)` và thuộc tính logical.
- `locales/`: `blocks.collection_banner`, `blocks.collection_products`, `collections.pagination`, `collections.empty`; schema `general.collection_banner|collection_products`, `labels.columns_mobile`, `info.collection_columns_*`, `options.columns`.

## Cần Orchestrator hoặc CTO áp (scope-guard chặn)
Spec: chép `drafts/dev-fe/ES1-T108/ES1-T108.spec.ts` sang `tests/e2e/ES1-T108.spec.ts`.

AGENTS.md, bảng Blocks, xếp theo thứ tự chữ cái:

```
| `collection-banner` | Collection page banner: image with focal point, h1, description. |
| `collection-products` | Collection results: `collection-products` partial, paginate 24, grid, empty message; 2 column settings. |
```

AGENTS.md, bảng Snippets:

```
| `pagination` | Previous, page parts, Next as plain links; renders when there is more than one page. |
```

## Quyết định cần soát
- Thêm `--columns-tablet` ngoài `--columns`, `--columns-mobile` của D3. Giá trị là `columns_desktop | at_most: 3` tính ở Liquid, vì chưa kiểm được `repeat(min(...))` chạy trên trình duyệt trong NFR-5. Hệ quả cho ES1-T112: flip `--columns` chỉ đổi lưới từ 80rem, ở 768 phải flip `--columns-tablet`.
- Thêm `collections.empty` cho list-collections khi store không có collection: ngoài AC5, 1 dòng chữ, không testid. Không có thì trang chỉ còn h1.
- Ảnh card list-collections `alt=""`: title trong cùng link, alt sẽ đọc 2 lần. Ảnh lazy hết theo AGENTS.md; trang này không thuộc NFR-1.
- Không có `aria-label` trên `pagination-current`: span không role không được dùng `aria-label`. Trình đọc màn hình đọc số + current page.
- `.image.collection-banner__image > img` dùng 2 class để thắng `.image > img` nằm sau trong file.

## Hợp đồng cho FE2 (ES1-T109), BE (ES1-T110, ES1-T111), QA (ES1-T112)
- Partial `collection-products`; `data-results-label` trên `collection-results`, luôn có, kể cả khi rỗng (`0 products`).
- 19 testid theo D11; `collection-filters`, `data-enhanced`, `data-label-price-invalid` là việc FE2, BE.
- `collection-product` nay ở `<li>`, vẫn trong `collection-products`, nên TE-3.spec.ts và ES1-T73.spec.ts chọn được như cũ.
- FE2: khi thêm cột filter 3/12 từ 64rem, `image_sizes` trong `blocks/collection-products.liquid` phải tính lại vì lưới hẹp đi; đang tính theo toàn bộ `max_page_width`.
- FE2: đổi `collection-empty-cta` sang `collection-empty-clear` khi có filter đang áp nằm trong khối `collection-empty`.
- TE-3.spec.ts còn `PAGE_SIZE = 20` với comment cũ: không gây lỗi (trang 24 card vẫn đi tiếp, trang 20–23 card sẽ thử thêm 1 trang rỗng rồi trả null), QA dọn khi tiện.

## Tự kiểm tra
- `shopify theme check --path .`: 58 file, 0 offense. Chạy thật.
- Locale JSON parse được, không trùng group. 19 testid đếm bằng grep, khớp D11.
- `grep -c 'style="--grid-gap' templates/list-collections.liquid`: 0. Không có `templates/*.json`. Không file JS trong diff. CSS mới không literal màu, không thuộc tính vật lý.
- Chờ CI, chưa đạt: `tests/e2e/ES1-T108.spec.ts -g "AC1|AC5|nojs"` desktop + Pixel 7; TE-3, ES1-T73, smoke; axe; 0 console error; lhci 96/90/98 trên URL collection; ảnh 360, 768, 1280.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
