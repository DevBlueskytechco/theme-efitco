KHÔNG CHẮC: (1) chưa có preview: Liquid chưa render thật, `dialog popover` chưa chạy trên trình duyệt (cổng DoD của D6), Playwright, axe, lhci, ảnh 360/768/1280 đều chờ CI; spec chưa chạy, chưa type-check. (2) Dữ liệu ES1-T105 chưa có: `/collections/all` có thể chưa bật filter, nên các test filter, giá, swatch, badge có thể skip, và phần đó của DoD chưa được kiểm trên store. (3) Figma không có trang collection: bố cục theo mặc định ES1-T107, chờ Designer. (4) Không có setting sort mặc định: mặc định của ES1-T106 #1, PO chưa trả lời. (5) Shop dùng dấu phẩy thập phân: mẫu `money_without_currency | replace: ',', ''` theo ES1-T104 sẽ cho số sai (1.234,56 thành 1.23456); ES1-T104 #2 không trả lời phần này, store dev chưa kiểm. (6) Form không JS gửi tham số giá rỗng, chấp nhận theo ES1-T104 #3, QA kiểm. (7) `part.url` có giữ filter không: chưa kiểm (ES1-T104 #5). (8) Spec ở drafts vì scope-guard chặn tests/.

# ES1-T109 TE-6-FE2: form filter GET, sort, drawer popover, badge

Ticket: ES1-T109 · AC: docs/srs.md#TE-6 AC2, AC3, AC4 phần markup, chạy không JS · Nguồn: drafts/techlead/ES1-T103/task-split.md D5, D6, D7, D11, D12; trả lời API ES1-T104.

## Thay đổi
- `blocks/collection-filters.liquid` (mới, 0 settings): `dialog popover` id `collection-filter-drawer` → form GET id `collection-filter-form`, action `collection.url` → partial `collection-filters` (các nhóm + Clear all). Nút Apply trong form, ngoài partial.
- `snippets/filter-group.liquid` (mới): rẽ theo `filter.type` (boolean, list, price_range), không đọc `collection`. Tên và giá trị lấy từ `param_name`, `value`. Swatch dùng `value.swatch`, image dùng `value.image`. `details` mở sẵn, `data-filter-param`. Count 0 và chưa active thì disabled.
- `blocks/collection-products.liquid`: thanh công cụ ngoài partial: nút mở + partial `collection-filter-count`, select `sort_by` gắn form, Apply trong `noscript`, `collection-status`. Filter đang áp và 0 kết quả: thông báo + `collection-empty-clear`. Tính lại `image_sizes` theo lưới 9/12 khi có filter.
- `templates/collection.liquid`: thêm block `collection-filters` trước `collection-products`; `data-label-price-invalid` trên thẻ `collection-filters`.
- `assets/base.css`: toolbar, drawer, filter-group, filter-option; từ 64rem lưới 3/12 + 9/12, chỉ khi có filter. `.collection-layout` đổi `gap` thành `column-gap`, vì dưới 64rem block filter không có box và `gap` sẽ thành khoảng trống.
- `locales/`: `blocks.collection_filters`, thêm key vào `blocks.collection_products`; schema `general.collection_filters`.

## Cần Orchestrator hoặc CTO áp (scope-guard chặn)
Spec: chép `drafts/dev-fe/ES1-T109/ES1-T109.spec.ts` sang `tests/e2e/ES1-T109.spec.ts`.

AGENTS.md, bảng Blocks (kiểm trước: hàng của ES1-T108 chưa có trong bảng hiện tại):

```
| `collection-filters` | Collection filter form in a popover dialog, left column from 64rem; `collection-filters` partial. |
```

Nếu giữ mô tả cũ của `collection-products` từ PR ES1-T108, sửa thành:

```
| `collection-products` | Collection toolbar (filter button, `collection-filter-count` partial, sort), `collection-products` partial, paginate 24, grid, empty message; 2 column settings. |
```

AGENTS.md, bảng Snippets:

```
| `filter-group` | One storefront filter as an open `details` group: boolean, list with swatch or image, price range. |
```

## Quyết định cần soát
- Không có filter: dialog và nút mở vẫn nằm trong DOM với `hidden`, không bỏ hẳn. Lý do: giữ form và 2 partial để BE1 luôn fetch được đủ 3 vùng; form `display: none` vẫn submit được cho select sort. Hệ quả cho QA: kiểm bằng `toBeHidden`, không dùng `toHaveCount(0)`.
- Form có `novalidate`: giá từ URL cao hơn `range_max` làm input invalid, submit bị chặn trong drawer đóng mà khách không thấy báo gì. Hệ quả: không JS thì min lớn hơn max vẫn gửi đi. Ticket không ghi thuộc tính này.
- Input giá có `step="any"`: mặc định step 1 làm `20.40` invalid.
- Số kết quả nằm dưới thanh công cụ, không nằm trong thanh như ES1-T107 #5: `collection-count` ở trong partial `collection-products`, thanh công cụ ở ngoài partial.
- Input dùng label bọc, không dùng `id` + `for`: giá trị filter có thể có dấu cách, unicode, nên không làm id an toàn được.
- `filter.label`, `value.label`, `value.value` đều qua `escape`, vì đó là dữ liệu merchant.
- Key `empty_clear` cho link rỗng do lọc. `filters_applied` có `one`, `other`.

## Hợp đồng cho BE (ES1-T110, ES1-T111), QA (ES1-T112), TE-8 (ES1-T128)
- 3 partial: `collection-products`, `collection-filters`, `collection-filter-count`; cả 3 luôn có trên trang và luôn có phần tử bên trong, kể cả khi không có filter.
- Hook trên form: `data-collection-id` là id số, không phải GID, rỗng nếu Liquid trả nil (giả định với `/collections/all`, chưa kiểm), BE tự dựng GID. `data-collection-handle`. `data-products-count` là `collection.all_products_count`, tức số trước lọc như event yêu cầu.
- BE gắn `data-enhanced` trên thẻ `collection-filters` thì nút Apply ẩn. Thẻ script của BE đặt trong `blocks/collection-filters.liquid`, ngoài partial.
- Vì form `novalidate`, BE2 phải tự chặn min lớn hơn max trước khi fetch; `reportValidity` vẫn hoạt động.
- Dialog có sẵn `scroll-lock`: `critical.css` khoá cuộn khi BE2 gọi `showModal`. Popover không JS không khoá cuộn.
- `collection-filter-count` chỉ có khi số lớn hơn 0, nội dung là đúng con số. Chữ cho trình đọc màn hình nằm cạnh nó, cùng partial.
- TE-8: `filter-group` không phụ thuộc `collection`; key chữ nằm ở `blocks.collection_filters`.

## Tự kiểm tra
- `shopify theme check --path .`: 64 file, 0 offense. Chạy thật.
- Locale JSON parse được, không trùng group. 19 testid đếm bằng grep, khớp D11. CSS thêm vào quét bằng script: 0 literal màu, 0 thuộc tính vật lý, 0 shorthand 4 giá trị. Không file JS trong diff.
- Chờ CI, chưa đạt: `tests/e2e/ES1-T109.spec.ts -g "AC2-markup|AC3-markup|AC4-markup|nojs"` desktop + Pixel 7; `ES1-T108.spec.ts`, `TE-3.spec.ts`; axe cả khi drawer mở; 0 console error; lhci 96/90/98, CLS so với FE1; ảnh 360, 768, 1280.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
