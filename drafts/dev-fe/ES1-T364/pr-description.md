KHÔNG CHẮC: hook nút tắt và vị trí chữ ẩn "Page " lệch docs/ui-spec/pagination.md §10 (dòng 140–147) để khớp e2e ES1-T108 theo comment CTO 13/11; đã hỏi Tech Lead ở ES1-T455. CSS `.pagination__summary` chưa có (trần base.css), làm cùng ES1-T128.

# ES1-T364 TE-6-R2-FE1: phân trang chung, base.css, locales (SRS TE-6 AC6)

Nguồn: docs/ui-spec/pagination.md §1–§10, sổ 10/11 audit (5), sổ 11/11 PG1–PG3, task-split ES1-T307 §6.5. Figma không có phân trang; nút tròn từ Figma 1:398 qua `.round-button` (ES1-T313).

## Lượt 3 (sửa CI run 43395797366 + trần base.css)
- Trang 1 không còn `pagination-previous`: span tắt đổi testid sang `pagination-previous-disabled` / `pagination-next-disabled` (vẫn `role="link" aria-disabled="true"` + `aria-label`, giữ chỗ CLS 0).
- `pagination-current` có text đúng số trang ("1", "2"): chữ ẩn "Page " chuyển ra ngoài span, cùng `li` (trình đọc vẫn nghe "Page 2, current page").
- base.css viết gọn lại để không tăng so với develop (xem Tự kiểm tra). Bỏ `.pagination__summary` (chưa nơi nào truyền `summary`; CSS đi cùng ES1-T128 khi search dùng snippet), bỏ padding ngang pill (min 44 đủ cho số ≤ 5 chữ số), focus dùng `:focus-visible` toàn cục (2px currentcolor offset 2), transition/hover gộp vào khối `.round-button` có sẵn (border-color `--motion-base` thay vì `--motion-fast`).

## Thay đổi
- `snippets/pagination.liquid` (viết lại theo §10):
  - Previous/Next: `<a class="round-button pagination__step" aria-label="Previous page|Next page">` + `slideshow-icon`. Trang đầu/cuối: `<span role="link" aria-disabled="true" aria-label>` cùng chỗ, không `href`, không tabindex.
  - `li.pagination__status` "Page X of Y" (testid `pagination-status`), không `aria-hidden`.
  - `li.pagination__num` × parts: link `.pagination__page` `aria-label="Page N"`; trang hiện tại `<span class="visually-hidden">Page </span><span class="pagination__page" aria-current="page">N</span>`; "…" `.pagination__gap`.
  - Tham số: `label` tuỳ chọn (mặc định `collections.pagination.label`), `anchor` (thêm vào mọi URL, tự thêm `#`), `summary` (`p.pagination__summary`, chỉ search).
  - 1 trang: không render.
- `assets/base.css`: thay khối `.pagination__link` cũ. Mobile-first `[‹] Page X of Y [›]`, 2 nút sát mép (`.pagination__status { margin-inline: auto }`); từ 48rem ẩn status, hiện số pill 44 bo `--radius-pill`, chevron ↔ số 16 (gap 8 + margin 8), căn giữa. Hiện tại nền/viền accent, chữ accent-foreground 700; hover viền foreground trong `(hover: hover)`; transition trong `prefers-reduced-motion: no-preference`. Chỉ token + 44px chạm như khối cũ, chỉ thuộc tính logical.
- `locales/en.default.json`: `collections.pagination.previous` "Previous page", `next` "Next page"; thêm `page_of`, `summary`, `current_prefix`; thêm `blog.comments_pagination_label`. Không trùng key.

Không đổi chỗ gọi snippet (`blocks/collection-products.liquid`, `templates/list-collections.liquid`); `window_size: 1` thuộc TE-6-R2-FE2/FE4. search/blog/article còn `default_pagination`, chuyển ở ES1-T128, TE-20-R2-FE1/FE2. Không file JS trong diff.

## Hook cho BE / QA
`pagination`, `pagination-previous`, `pagination-next` (chỉ link), `pagination-previous-disabled`, `pagination-next-disabled` (span tắt), `pagination-status`, `pagination-page`, `pagination-current` (text = số trang), `pagination-summary`. BE (ES1-T110) chặn click trên `a.pagination__step, a.pagination__page`, dùng `href` server render.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (23 warning có sẵn ở 8 file khác, không file nào của PR).
- `gzip -c assets/base.css | wc -c`: develop 51 217 → nhánh 51 215 B (không tăng; trần 49 152 đã vượt từ develop, xem ES1-T454). `critical.css` 10 014 B, không đổi.
- Locale: parse với object_pairs_hook, không trùng key. Grep `pagination__link`: 0.
- E2E ES1-T108 AC1/nojs: đối chiếu tĩnh dòng 159–171, 271 khớp markup mới; chạy thật chờ CI. Collection cần ≥ 25 sản phẩm (ES1-T105 #1), thiếu thì skip, không tính đạt.
- Lighthouse (collection, list-collections; desktop/mobile), axe, ảnh 360/768/1280/1920: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
