KHÔNG CHẮC: tests/e2e/ES1-T108.spec.ts (QA) còn hợp đồng phân trang cũ, sẽ đỏ sau PR này: dòng 159 chờ `pagination-previous` count 0 ở trang 1 (nay là span `aria-disabled` giữ testid, theo pagination.md §10), dòng 161/166/271 `toHaveText('1'|'2')` trên `pagination-current` (nay có chữ ẩn "Page " → textContent "Page 1"). QA viết lại ở ES1-T112 (TE-6-QA1, AC6).

# ES1-T364 TE-6-R2-FE1: phân trang chung, base.css, locales (SRS TE-6 AC6)

Nguồn: docs/ui-spec/pagination.md §1–§10, sổ 10/11 audit (5), sổ 11/11 PG1–PG3, task-split ES1-T307 §6.5. Figma không có phân trang; nút tròn từ Figma 1:398 qua `.round-button` (ES1-T313).

## Thay đổi
- `snippets/pagination.liquid` (viết lại theo §10):
  - Previous/Next: `<a class="round-button pagination__step" aria-label="Previous page|Next page">` + `slideshow-icon` previous/next. Trang đầu/cuối: `<span role="link" aria-disabled="true" aria-label>` cùng chỗ, không `href`, không tabindex (giữ chỗ, CLS 0).
  - `li.pagination__status` "Page X of Y" (testid `pagination-status`), không `aria-hidden`.
  - `li.pagination__num` × parts: link `.pagination__page` `aria-label="Page N"`; trang hiện tại `<span aria-current="page">` + chữ ẩn "Page " (không aria-label trên span); "…" `.pagination__gap`.
  - Tham số mới: `label` tuỳ chọn (mặc định `collections.pagination.label`), `anchor` (thêm vào mọi URL, tự thêm `#` nếu thiếu), `summary` (`p.pagination__summary`, testid `pagination-summary`, chỉ search).
  - 1 trang: không render.
- `assets/base.css`: thay khối `.pagination__*` cũ (`.pagination__link` ô 44 bo `--radius-button`) bằng khối mới: mobile-first `[‹] Page X of Y [›]` 2 nút sát mép; từ 48rem ẩn status, hiện số pill 44 bo pill, chevron ↔ số 16 (gap 8 + margin-inline 8), căn giữa. Hiện tại nền/viền accent chữ accent-foreground 700; hover số viền foreground 150ms trong `(hover: hover)`; focus 2px accent offset 2; nút tắt `cursor: default; pointer-events: none`. Hover/active/focus/scale của nút tròn và reduced-motion dùng lại `.round-button` (ES1-T313). RTL: chevron đã lật bởi `.slideshow-icon--previous|next:dir(rtl)` có sẵn. Chỉ token (`--space-*`, `--radius-pill`, `--color-*`, `--motion-fast`, `--ease-out`), chỉ thuộc tính logical.
- `locales/en.default.json`: `collections.pagination.previous` "Previous page", `next` "Next page"; thêm `page_of`, `summary`, `current_prefix`; thêm `blog.comments_pagination_label` "Comment pages". Không trùng key (kiểm bằng json object_pairs_hook).

Không đổi: chỗ gọi snippet (`blocks/collection-products.liquid`, `templates/list-collections.liquid`) vẫn chạy vì `label` cũ hợp lệ; thêm `window_size: 1` và bỏ `label` thuộc TE-6-R2-FE2, TE-6-R2-FE4. search/blog/article đang dùng `default_pagination`, chuyển sang snippet ở ES1-T128 (TE-8-FE1), TE-20-R2-FE1, FE2. Không file JS trong diff.

## Hook cho BE / QA
`pagination`, `pagination-previous`, `pagination-next` (cả span tắt, kèm `aria-disabled="true"`), `pagination-status`, `pagination-page`, `pagination-current`, `pagination-summary`. BE (ES1-T110) chặn click chỉ trên `a.pagination__step, a.pagination__page`, dùng `href` server render.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (23 warning có sẵn ở file khác, không file nào của PR).
- `gzip -c assets/base.css | wc -c`: 47 739 → 48 118 B (≤ 49 152). `critical.css` không đổi (9 917 B).
- Grep `pagination__link` trong assets/blocks/snippets/templates/tests: 0.
- Lighthouse (collection, list-collections; desktop/mobile), Playwright, ảnh 360/768/1280/1920, axe: chờ CI. Store dev 14 collection → list-collections không có trang 2; collection cần ≥ 25 sản phẩm (ES1-T105 #1), thiếu thì test phân trang skip, không tính là đạt.
- E2E ES1-T108 dòng 159, 161, 166, 271 sẽ đỏ theo thiết kế mới, xem dòng KHÔNG CHẮC; chờ ES1-T112.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
