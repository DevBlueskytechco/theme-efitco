KHÔNG CHẮC: (1) Badge, đường kẻ, mũi tên hiện ở cả 3 card theo AC-H10 và mặc định ES1-T198 #2, chưa có Designer trả lời; Figma chỉ card Beginner có, card 2, 3 cần ghi sổ chênh lệch chờ CTO ký. (2) Eyebrow dùng `--color-muted` thay vì cam Figma: accent trên sand chỉ 4.03:1, muted 6.81:1 (tính theo công thức WCAG), cùng cách `image-with-text` (ES1-T116 #4); lệch màu so với Figma, cần ghi sổ chênh lệch. (3) Chữ của parent là default trong schema theo ticket; bảng BA đề xuất khoá `blocks.shop_by_level.default_*`, không dùng. (4) Ticket chỉ ghi setting `collection`, `image`; đã thêm `label` vì mẫu `default_{id}` cần setting để merchant sửa, và `title` giống `collection-card`. Không có `default_title`: bảng BA xếp 3 tên vào loại store. (5) Gradient dùng token nền tối thay #000 của Figma (0 màu literal), bỏ hiệu ứng noise. (6) Mobile là ĐỀ XUẤT của Designer (ES1-T174), chưa có người duyệt. (7) Không có `docs/figma/img/1-464.png`: đối chiếu bằng `1-453.png` và số đo snapshot. (8) `tests/e2e/ES1-T176.spec.ts` chưa có trong repo, chưa kiểm được dòng DoD về thứ tự và ngưỡng hàng 4a, 4b.

# ES1-T186 TE-15-FE2: shop by level, hàng 4b (Figma 1:464)

## Thay đổi
- `blocks/shop-by-level.liquid`: eyebrow, heading, `ul` 3 card. Gọi 1 lần, default chữ trong schema. Thân rỗng: storefront không render, editor hiện placeholder.
- `blocks/level-card.liquid`: link, ảnh, nhãn, tên, badge `products_count`, mũi tên. Setting `collection`, `image`, `label`, `title`; param `id`, `handle`, `default_label`. Không có collection: storefront không render, editor hiện placeholder.
- `templates/index.liquid`, `templates/index.figma.liquid`: thêm vào sau `rich-text`, trong cùng container `home-intro`, `figma-intro`. Không thêm container nền thứ 2. Cổng truyền `figma-level-*`.
- `templates/index.te15.liquid`: band 0 card, thiếu card cạnh rich-text, 1 card, 3 card, số ít. Dùng collection `all`, không cần dữ liệu nhập. Band số ít lấy collection đầu tiên của store có đúng 1 sản phẩm; không có thì không render và spec skip có lý do.
- `assets/base.css`: mục Shop by level. 0 màu literal, logical properties, không thêm token. `critical.css` không đổi.
- `locales/`: `blocks.level_card` (`default_label`, `placeholder`, `products_count` one, other), `blocks.shop_by_level.placeholder`, `general.level_card`, `general.shop_by_level`, `labels.level_card_*`, `labels.shop_by_level_*`, `info.level_card_*`.
- Rich-text không đổi: khoảng cách 120 giữa 2 phần là padding đáy sẵn có của `.rich-text`.

## Cỡ theo màn hình (ES1-T174)
| Màn hình | Cột | Card | Gap | Padding chữ |
| --- | --- | --- | --- | --- |
| 360 | 1 | 320 x 240 | 16 | 16 |
| 768 | 3 | 232 x 232 | 16 | 16 |
| Từ 64rem | 3 | 1/1, 456 x 456 ở 1920 | 24 | 40, đáy 20 |

Đáy 20: Figma ghi padding 40 nhưng khối chữ 117 canh giữa nên tràn, số đo thật là 20.5 (`absoluteBoundingBox` 1:470). Ở setting page width Wide, card rộng hơn 456 vì theo cột nội dung.

Gradient đặt trên khối chữ, cao 168 ở card 456 đúng như Figma (36.8%). Ở card thấp 232, 240 gradient vẫn phủ hết chữ; nếu theo % của card thì chữ nằm ngoài gradient. Tương phản chữ trên ảnh phụ thuộc ảnh merchant chọn, không đo được 1 số.

## Theme map (AGENTS.md, Orchestrator hoặc người áp, scope-guard chặn)
Thêm vào bảng Blocks:

| Block | Role |
| --- | --- |
| `level-card` | One card of `shop-by-level`: link, image, label, title, real product count; renders nothing without a collection. |
| `shop-by-level` | Shop by level row: eyebrow, heading, list of level cards; shares the band of `rich-text`. |

## Việc Orchestrator cần làm
- Chép `drafts/dev-fe/ES1-T186/ES1-T186.spec.ts` sang `tests/e2e/ES1-T186.spec.ts`.

## Tự kiểm tra
Đã chạy:
- `shopify theme check`: 92 file, 0 lỗi.
- 2 file locale parse được, không thêm group trùng.
- `wc -c assets/critical.css` = 9921, không đổi. Không file JS trong diff, không thẻ script trong 2 block.

Chưa chạy, không báo là đã kiểm (CTO 06/11, `RUN_STORE_TESTS=false`):
- `tests/e2e/ES1-T186.spec.ts`, chưa type-check; `ES1-T45.spec.ts`, `ES1-T176.spec.ts`. Toàn bộ CSS chưa được xem trên trình duyệt.
- Axe, console, Lighthouse, tràn ngang ở 360 và 768, ui_diff hàng 4a, 4b.
- `/?view=figma` chưa có 3 card cho tới khi ES1-T178 nhập `figma-level-*`.
- Ảnh 360, 768, 1280, 1920: chờ CI bật lại.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
