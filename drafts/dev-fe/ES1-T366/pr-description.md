KHÔNG CHẮC: (1) task-split ghi "Show N products" đọc partial `collection-filter-count`; tên partial đó đã dùng cho badge trong `collection-products`, không đặt trùng được, nên chân drawer (status, Clear all, Show N products) nằm trong partial `collection-filters` cùng các nhóm: 1 lần refresh cập nhật hết. BE ES1-T110 xác nhận. (2) Không JS drawer vẫn mở bằng `popover`; có JS BE mở bằng `showModal` qua `<modal-dialog data-layer="filter">` (`showModal` lỗi nếu popover đang mở: gỡ thuộc tính `popover` khi nâng cấp). (3) Thêm chuỗi `show_less` ("Show less") cho trạng thái mở của "Show N more", collection.md §9 không liệt kê. (4) Chưa thêm `filter-option` vào bảng Snippets của AGENTS.md (filter-group cũng chưa có; hook chặn dev-fe sửa AGENTS.md).

# ES1-T366 TE-6-R2-FE3: collection-filters, filter-group, base.css, locales

AC: SRS TE-6 AC2, AC4 (0.5 → AC9, AC10). Spec: docs/ui-spec/collection.md §5, §10, §11. Plan: drafts/techlead/ES1-T307/task-split.md (TE-6-R2-FE3).

## Thay đổi

blocks/collection-filters.liquid
- `<modal-dialog data-layer="filter">` > `<dialog class="drawer collection-filters__drawer" popover>`: dùng `.drawer` chung của TE-10-R2-FE2 (90% ở 360, 420 từ 48rem, header 72, `.close-button` 48 "Close filters").
- Partial `collection-filters` gồm `.drawer__body` (dòng `role="status"` "N filters applied · M products", nhóm lọc) + `.drawer__footer` dính đáy: "Clear all" secondary (chỉ khi có filter, giữ `sort_by`) + "Show M products" primary (`type="submit"`, M = `collection.products_count`).
- Bỏ nút "Apply" cũ và thuộc tính `scroll-lock`. Form, id, data-* cho BE giữ nguyên.
- Từ 64rem cùng dialog là cột trái tĩnh: tiêu đề h2 gạch dưới 1px foreground, không nút đóng, không dòng status; chân giữ Clear all, nút submit chỉ hiện khi không JS (`collection-filters[data-enhanced]` ẩn).

snippets/filter-group.liquid
- Summary cao 52, "N selected" 14 muted (list, boolean), chevron 12 xoay 180° (250ms, chỉ khi không giảm chuyển động).
- Nhóm > 6 giá trị: 6 đầu + `<details class="filter-group__more">` lồng "Show N more" / "Show less", chữ ẩn "{nhóm} options", cao 44, mở sẵn khi giá trị ẩn đang chọn. Chạy không JS. Ngưỡng 6 là hằng trong code.
- Giá: `<label for>` thật 14/500 trên ô, khung có tiền tố `cart.currency.symbol` `aria-hidden` (rộng theo ký hiệu), viền `--color-muted-light`, gợi ý "Highest price is {giá}" (`aria-describedby`), câu lỗi `price_invalid` + icon (`hidden` sẵn). BE bật lỗi: bỏ `hidden`, `aria-invalid="true"` + thêm id lỗi vào `aria-describedby` → CSS viền 2px `--color-sale`.

snippets/filter-option.liquid (mới)
- 1 giá trị = `<label>` cả hàng 44, checkbox 20 `accent-color`, swatch 24 (checkbox trong suốt nằm trên) + tên màu luôn hiện, số đếm canh cuối. Tách ra để 2 vòng (6 đầu, phần "Show more") dùng chung, không mở/đóng thẻ trong nhánh Liquid.

assets/base.css
- `.drawer` chung nhận `:popover-open` như `[open]` (hiển thị, trượt vào, `@starting-style`), để drawer lọc không JS dùng đúng khung chung.
- Thay toàn bộ CSS drawer lọc + nhóm lọc cũ (khung 100% / 28rem, nút đóng riêng, Apply sticky, checkbox 24) bằng mục "Lọc collection" mới: chọn → nhãn 600; đếm 0 → disabled, muted, gạch ngang; hover nhãn gạch chân; swatch chọn = vòng 2px nền + 2px accent, focus outline accent offset 4; focus checkbox outline accent.
- 0 literal màu, 0 thuộc tính vật lý, 0 z-index số.

locales/en.default.json (`blocks.collection_filters`)
- Thêm `selected`, `show_more`, `show_less`, `show_more_label`, `price_highest`, `show_results` (one/other), `status`. Bỏ `apply`. Dòng status ghép từ `blocks.collection_products.filters_applied` + `results_count` có sẵn.

tests/e2e/ES1-T366.spec.ts (mới)
- Tĩnh (fixture + base.css thật): TC-01 quét CSS, TC-02 hợp đồng markup/locale, TC-03 360 (drawer 324, header ≥ 72, đóng 48, chân sát đáy, summary 52, dòng ≥ 44, checkbox 20, swatch 24), TC-04 trạng thái giá trị, TC-05 768 (420), TC-06 1280 cột tĩnh + `data-enhanced`, TC-07 "Show N more" không JS, TC-08 lỗi giá.
- Store: "N selected", status, "Show N products", Clear all giữ `sort_by`; nhóm > 6; nojs 360 drawer + submit. Skip khi store dev không có filter / không có nhóm > 6 giá trị (ES1-T105 #2): skip không tính là đạt.

## Hook cho BE (ES1-T110)
- Lớp: `<modal-dialog data-layer="filter">`, dialog `#collection-filter-drawer`, mở từ `collection-filter-open`, đóng ×/Esc/scrim, trả focus về nút Filter; "Show N products" (`collection-filter-apply`) đóng drawer khi lọc đã áp.
- Partial `collection-filters`: status, nhóm, Clear all, Show N products. Partial `collection-filter-count` (badge) không đổi.
- Lỗi giá: `#filter-<param>-error` (vd `#filter-filter-v-price-error`), `aria-invalid`, `aria-describedby`.
- `data-enhanced` trên `<collection-filters>`: từ 64rem ẩn nút submit, ẩn chân khi không có Clear all.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 23 warning (bằng trước khi sửa, không warning mới ở file của ticket).
- `gzip -c assets/base.css | wc -c`: 47 739 → 48 344 B (≤ 49 152). `critical.css` 9 917 B, không đổi.
- Không file JS trong diff. Locale JSON hợp lệ, không trùng key.
- Không đổi `blocks/collection-products.liquid`, `templates/collection.liquid` (TE-6-R2-FE2). Các test ES1-T109 vẫn khớp hook: `collection-filter-apply` là submit, `collection-filter-clear` chỉ có khi đã lọc, mọi `collection-filter-group` mở, option là `<label>` có `.filter-option__count`.
- Playwright (tĩnh + store), Lighthouse collection desktop/mobile, ảnh 360/768/1280: chờ CI. Sandbox chặn chạy Chromium ở local; global setup cần `PREVIEW_URL`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
