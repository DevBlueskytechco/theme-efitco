KHÔNG CHẮC: spec E2E chưa chạy trên trình duyệt (sandbox chặn Chromium); scope-guard chặn dev-fe ghi tests/ nên spec để ở drafts/dev-fe/ES1-T403/ES1-T403.spec.ts, cần Orchestrator/QA chép sang tests/e2e/ES1-T403.spec.ts. Thẻ bài viết, video card có tên dài sẽ cao hơn các thẻ khác (hệ quả của decisions 11/11 (3)), cần xem ảnh CI.

# ES1-T403 TS-FE5: .rte chung, h5 ≠ h6, không cắt tên, viền radio quiz ≥ 3:1

Kế hoạch: drafts/techlead/ES1-T304/task-split.md §3 TS-FE5, D4, D5. Spec: docs/ui-spec/foundation.md §28. Mục Shopify 7, 8, 12.

## Thay đổi
- assets/critical.css: h4–h6 dùng `--font-primary--family` 600, lh 1.4; h4 = base × 1.25 (20), h5 `--font-size-lg` (18), h6 `--font-size-base` (16) uppercase, ls 0.04em. Áp cho heading ngoài `.rte` (repo không có `<h4>`–`<h6>` trong blocks/snippets/templates nên không đổi giao diện hiện có).
- assets/base.css:
  - Thêm `.rte` một lần (thay chỗ `.product-info__description*` cũ, đã xoá): khoảng khối `--space-4`; p/ul/ol 65ch, lh 1.7; h2/h3 theo token; margin trên h2 `--space-7`, h3–h6 `--space-6`, dưới heading `--space-3`; link gạch chân 1px offset 0.2em, 500, hover accent; ul/ol thụt `--space-5`, gap `--space-2`, marker muted; blockquote viền inline-start `--space-1` accent, heading 700 cỡ h3, cite/footer 14/500 muted; img full cột bo `--radius-card`; figcaption 14 muted; table `display:block; overflow-x:auto`, ô viền `--color-border`; hr 1px border, cách `--space-7`.
  - `.product-sticky-bar__title`: bỏ overflow/ellipsis/nowrap, xuống dòng (`overflow-wrap: anywhere`).
  - `.article-card__title`: bỏ `-webkit-box`/line-clamp 3. `.article-card__link` `overflow: hidden` → `overflow: clip`: không còn là scroll container nên aspect-ratio 3/4 là chiều cao tối thiểu, tên dài làm card cao thêm thay vì bị cắt; bo góc ảnh vẫn được clip.
  - `.video-card__product-title`: bỏ overflow/ellipsis/nowrap.
  - `.quiz-option__mark` (khối Figma ~7617): viền `--figma-999999` (2.85:1) → `--color-muted-light` (5.33:1), khớp rule gốc ~5952.
- templates/article.liquid: `<div class="rte" data-testid="article-content">` quanh `article.content`.
- templates/page.liquid: `<div class="rte" data-testid="page-content">` quanh `page.content`, ẩn khi rỗng.
- blocks/collection-banner.liquid: mô tả thêm class `rte` (giữ testid `collection-banner-description`).
- blocks/product-info.liquid: `product-info__description` → `rte` (giữ testid `product-description`).
- Không đổi JS, không thêm setting/locale, không thêm token.

## Hook cho QA (TS-QA1 ES1-T412)
- testid mới: `article-content`, `page-content`.
- Store dev cần 1 page có h5, h6 trong nội dung; đặt `TE403_PAGE_PATH` (vd `/pages/rte-demo`). Thiếu thì test store h5/h6 skip, không coi là đạt.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn ở index*.liquid, testimonial-item, bundle-builder, quiz-step, featured-product; không file nào của PR này).
- `wc -c assets/critical.css` = 10 206 (≤ 10 240). `gzip -c assets/base.css | wc -c` = 41 656 (≤ 49 152).
- `grep -rn 'class="rte' templates blocks | wc -l` = 4. `grep -n "product-info__description" assets/base.css` = 0. `grep -c "\.rte" assets/base.css` = 19.
- `grep -nE "line-clamp|text-overflow: ellipsis" assets/*.css`: còn critical.css (tên shop logo) và base.css `.article-card__tag` (badge).
- 0 màu literal, 0 thuộc tính vật lý trong phần sửa.
- Spec drafts/dev-fe/ES1-T403/ES1-T403.spec.ts: 3 test tĩnh đọc file pass cục bộ; test computed style (fixture setContent) và test store (h5/h6 page, axe color-contrast + tỉ lệ viền quiz ≥ 3:1) chờ CI.
- Playwright smoke, Lighthouse (article, page, PDP, collection, trang chủ quiz), ảnh 360/1280 article, sticky bar, video card: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
