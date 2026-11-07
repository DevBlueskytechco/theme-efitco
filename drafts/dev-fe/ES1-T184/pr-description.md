KHÔNG CHẮC: (1) Card không có `default_title` dù ticket ghi mẫu `default_{id}`: bảng ES1-T173 xếp 5 tên vào loại "store", không có khoá locale, và card chỉ render khi có collection; tên mẫu sẽ dán sai tên lên collection của merchant. Thứ tự tên: setting `title`, rồi tên collection. (2) `/?view=figma` chưa có band hàng 3 cho tới khi ES1-T178 nhập `figma-cat-*`: card không rơi về `collections.all` vì tên và link chính là thứ cần kiểm. (3) Lệch nền 1:360 #1A1A1A so với token #1E1E1E, và band hero chưa nền tối: hỏi ở ES1-T208, đã làm theo mặc định ghi trong ticket đó. (4) Figma không có component 1:54, 1:59 trong snapshot: chevron 20px đo từ `1-395.png` (nét 8.5 x 15.5). (5) Mobile là ĐỀ XUẤT của Designer (ES1-T174), chưa có người duyệt. (6) `tests/e2e/ES1-T176.spec.ts` chưa có trong repo.

# ES1-T184 TE-15-FE1: collection list, hàng 3 (Figma 1:395)

## Thay đổi
- `blocks/collection-list.liquid`: heading, 2 nút, `ul` cuộn ngang. Gọi 1 lần, default chữ trong schema. Thân rỗng: storefront không render, editor hiện placeholder.
- `blocks/collection-card.liquid`: link, ảnh, tên. Setting `collection`, `title`, `image`; param `handle`. Không có collection: storefront không render, editor hiện placeholder.
- `templates/index.liquid`, `templates/index.figma.liquid`: band nền `dark` ngay sau slideshow. Cổng truyền `figma-cat-*`.
- `templates/index.te15.liquid`: band 0, 1, 5 card, dùng collection `all` nên không cần dữ liệu nhập.
- `assets/base.css`: mục Collection list. 0 màu literal, logical properties. `critical.css` không đổi.
- `locales/`: `blocks.collection_list`, `general.collection_list`, `labels.collection_card_*`, `labels.collection_list_heading`, `info.collection_card_*`.

## Cỡ theo màn hình
| Màn hình | Card | Gap | Nút |
| --- | --- | --- | --- |
| 360 | 252 (`70vw`) | 16 | Không có |
| 768 | 307 (`40vw`) | 16 | 52 x 52 khi có `data-enhanced` |
| Từ 64rem | 336 | 24 | 52 x 52 khi có `data-enhanced` |

Ảnh 336 / 220, bo 16, cách tên 16, tên 34: tổng 270. Band tràn tới mép, nên ở 1920 card 5 bị cắt ở mép phải như Figma.

## Hook cho BE (ES1-T185)
- Custom element `scroll-buttons` đã là thẻ gốc; CSS không phụ thuộc element đã defined.
- `data-enhanced` gắn trên thẻ gốc. `data-scroll-track` trên `ul`, `data-scroll-prev`, `data-scroll-next` trên 2 nút.
- Ẩn từng nút bằng thuộc tính `hidden`, CSS đã xử lý. Khung nút giữ chỗ bằng `visibility`, nên hiện nút không gây layout shift.
- BE thêm `data-lazy-module` và thẻ script: `asset_url` tới file chưa có là lỗi MissingAsset, nên FE chưa ghi. Mẫu ở `blocks/quiz.liquid`.
- Tới khi ES1-T185 merge: chuột không có nút và thanh cuộn ẩn (giống slideshow). Vẫn cuộn được bằng bàn phím, cảm ứng, trackpad, Shift + lăn chuột; `scripting: none` thì hiện thanh cuộn.

## Theme map (AGENTS.md, Orchestrator hoặc người áp, scope-guard chặn)
Thêm vào bảng Blocks:

| Block | Role |
| --- | --- |
| `collection-card` | One card of `collection-list`: link, image, title; renders nothing without a collection. |
| `collection-list` | Browse Categories row: heading, back and next buttons, horizontal scroll-snap list. |

## Việc Orchestrator cần làm
- Chép `drafts/dev-fe/ES1-T184/ES1-T184.spec.ts` sang `tests/e2e/ES1-T184.spec.ts`.
- `git apply drafts/dev-fe/ES1-T184/ES1-T175.spec.patch`: test thứ tự band của ES1-T175 biết band mới, và không fail khi store chưa có `figma-cat-*`. Đã `git apply --check`.

## Tự kiểm tra
Đã chạy:
- `shopify theme check`: 90 file, 0 lỗi.
- 2 file locale parse được, không thêm group trùng.
- `wc -c assets/critical.css` = 9921, không đổi. Không file JS trong diff, không thẻ script trong block.

Chưa chạy, không báo là đã kiểm (CTO 06/11, `RUN_STORE_TESTS=false`):
- `tests/e2e/ES1-T184.spec.ts`, chưa type-check. Toàn bộ CSS chưa được xem trên trình duyệt.
- Axe, Lighthouse, tràn ngang ở 360 và 768, ui_diff hàng 3.
- Ảnh 360, 768, 1280, 1920: chờ CI bật lại.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
