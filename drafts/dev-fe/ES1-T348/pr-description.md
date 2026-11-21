KHÔNG CHẮC: (1) Markup mới (radio value = option value id, không JSON biến thể) làm `assets/product-variant-picker.js`, `assets/featured-product.js` hiện tại hết tìm được biến thể → đổi option hiện Unavailable tới khi TE-4-R2-BE2 merge; test CI đỏ theo dự kiến (mục "Test bị ảnh hưởng"). Hỏi Tech Lead ES1-T515, mặc định: giữ PR mở, merge cùng đợt FE2 + BE2 (spike ES1-T347 R4). (2) ADR 0008 ghi `value.exists`; snippet dùng `value.variant == blank` cho "không tồn tại" (quy tắc CTO 2048 biến thể, spec ES1-T253), hỏi cùng ES1-T515. (3) gzip base.css chưa đo được trong sandbox (lệnh gzip cần duyệt) → chờ CI; raw +5 432 B.

# ES1-T348 · TE-4-R2-FE1 · Bộ chọn biến thể theo option value

AC: TE-4 AC13, AC14, NFR-7. Nguồn: ADR 0008 mục 1; docs/ui-spec/variant-picker.md §2–§8, §10, §12; task-split ES1-T307 §4 (hợp đồng FE/BE), dòng TE-4-R2-FE1; spike drafts/dev-be/ES1-T347/spike.md mục 4; sổ 10/11 M5, 11/11 VP3.

## Thay đổi

- `snippets/product-variant-picker.liquid` viết lại:
  - Chỉ lặp `product.options_with_values` / `option.values`. Không `product.variants`, không JSON, không `<select>`.
  - Radio `value` = `data-option-value-id` = `value.id`; `checked` theo `value.selected`; `data-state` available | sold_out | unavailable; giữ `data-available`; `data-variant-id` khi có `value.variant`; `data-product-url` khi combined listing trỏ sản phẩm khác.
  - 3 trạng thái (AC13): hết hàng = gạch chữ + ẩn ", sold out"; không tồn tại = gạch chữ + viền đứt + ẩn ", unavailable"; mọi giá trị chọn được (không disabled, không opacity).
  - Legend "Tên: giá trị đang chọn" (`[data-option-selected]` cho BE).
  - Swatch chỉ khi mọi giá trị có swatch (VP3), ảnh `<img>` 36 srcset 36/72 lazy, màu qua `--swatch-color`.
  - > 10 giá trị (AC14): in đủ DOM, từ giá trị 8 có `hidden`, giá trị đang chọn sau vị trí 7 thay ô 7; nút "+N" ở ô 8 (`aria-expanded="false"`, `aria-controls`), giữ cả nhãn "+N" và "Show Fewer" (+ chữ ẩn), CSS chọn theo `aria-expanded`. Hằng 10 / 7 trong snippet.
  - Mỗi fieldset: vùng lỗi `role="alert"` rỗng + nút "Try Again" `hidden` + icon cảnh báo (hiện khi alert có chữ).
  - Tham số `id_prefix` (rỗng PDP, `qv-` quickview): id nhóm, id lỗi, name radio = `{id_prefix}{form_id}-option-{position}` (không trùng nhóm radio giữa 2 bộ chọn trên 1 trang).
  - Không `fetch_url` (PDP): fieldset bọc trong `{% partial 'product-options' %}` bên trong thẻ host. Có `fetch_url` (featured, quickview): không partial lồng, partial của ngữ cảnh bọc (ADR 0008 mục 3).
  - Host: `data-partials` (+ `data-regions` cùng giá trị tới khi BE2 bỏ), `data-label-loading`, `data-label-loaded`, `data-label-load-error` có chỗ giữ `[value]`, `[price]`, `[availability]`.
  - Bỏ tham số `current_variant` (trạng thái lấy từ option value).
- `snippets/variant-json.liquid`: xoá (không còn nơi gọi, OrphanedSnippet).
- `blocks/product-form.liquid`, `blocks/featured-product.liquid`: chỉ bỏ đối số `current_variant` ở lệnh render bộ chọn. Phần còn lại (product-variant-select, input id trong partial, 7 partial PDP, doc) là TE-4-R2-FE2.
- `assets/base.css`: thay khối `.product-option*` cũ (cùng chỗ, không để CSS chết): legend, pill 44 × ≥ 56, lưới thu gọn `minmax(72px, 1fr)`, 3 trạng thái, đang chọn, hover, focus accent 2px offset 2, swatch 44/36 viền lõi 50%, gạch chéo 2px + viền nền 1px, vòng đứt, nút "+N" / "Show Fewer" (span 2 cột khi mở, caret lật), khối lỗi + Try Again cao 44, transition màu `--motion-fast` `--ease-out` trong `prefers-reduced-motion: no-preference`. 0 literal màu, logical properties.
- `locales/en.default.json`: nhóm mới `products.variant` (9 key theo variant-picker §10). `general.try_again` đã có, dùng lại.

## Hợp đồng cho BE (TE-4-R2-BE2)

- Chọn: `fieldset[data-option-position] input[data-option-value-id]:checked` → `option_values`.
- "+N": `button[data-option-more]` → bỏ `hidden` mọi `[data-testid=product-option-value]` trong `#aria-controls`, `aria-expanded="true"`, focus giá trị đầu vừa hiện; thu lại: in lại `hidden` theo luật (6 đầu + đang chọn, hoặc 7 đầu).
- Lỗi: điền chữ vào `[data-testid=product-option-error]` của fieldset vừa bấm, bỏ `hidden` của `[data-testid=product-option-retry]`; xong thì làm rỗng + `hidden` lại.
- Partial PDP: `product-options` (trong host, host không bị thay khi apply).
- Đang tải (skeleton giá, dòng tồn, `aria-disabled` nút): markup/CSS ở FE2/FE4, ngoài ticket này.

## Test bị ảnh hưởng (đỏ dự kiến tới FE2 + BE2)

- `tests/e2e/ES1-T347.spec.ts` "NFR-7: bộ chọn không render JSON…": hết fixme, fail ở `product-form` còn `'product-variant-select'` (FE2 xoá).
- Store: ES1-T66, ES1-T87, ES1-T158, ES1-T223, TE-4.spec (chọn radio theo value tên, JS cũ đọc JSON) và ES1-T156 (no-JS select featured). Không sửa test (việc QA/BE2).

## Tự kiểm tra

- `shopify theme check`: 0 lỗi, 22 warning có sẵn (không thêm; warning OrphanedSnippet variant-json đã hết do xoá file).
- `grep -rn "for variant in product.variants\|variant-json\|product.variants | json" blocks snippets templates`: còn 2 dòng, đều phạm vi FE2 (`product-structured-data.liquid:52`, `product-variant-select.liquid:27`); bộ chọn 0 dòng.
- Không file JS trong diff.
- `wc -c assets/base.css` 257 148 → 262 580; gzip ≤ 57 344 (trần tạm tới ES1-T478): chờ CI.
- Preview, Playwright, Lighthouse (PDP desktop/mobile), ảnh 360/768/1280: chờ CI sau push. Dữ liệu > 10 giá trị và > 250 biến thể (D3 `demo-many-variants`) phụ thuộc store dev ES1-T298; thiếu thì test skip, không tính đạt.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
