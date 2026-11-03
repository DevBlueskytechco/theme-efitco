ES1-T46 — Fix TB-13: /collections/all tràn ngang ở 360px

Nguyên nhân
`.collection-products` dùng `repeat(auto-fill, minmax(500px, 1fr))` (mặc định Skeleton) → ô tối thiểu 500px, scrollWidth 520 > 360.

Thay đổi
- assets/base.css: `.collection-products` khai báo `--collection-card-size: 280px` (cùng giá trị `.collections--full`, không có token size chung trong css-variables) và đổi cột thành `repeat(auto-fill, minmax(min(var(--collection-card-size), 100%), 1fr))`, cùng pattern `.collections`.
- templates/collection.liquid: thêm `data-testid="collection-products"` cho lưới, `data-testid="collection-product"` cho thẻ sản phẩm.
- Không đổi gap, markup khác, không JS.

Kỳ vọng
- 360px: 1 cột, ô co về 100% container → scrollWidth <= 360. Ảnh đã có `img { max-width: 100% }` trong critical.css.
- 1280px: nhiều cột (~4 cột với ô 280px, tùy page margin).

Tự kiểm tra
- shopify theme check: 40 files, 0 offenses.
- Không file JS trong diff.
- TB-13 (tests/e2e/TE-1.spec.ts, PR #49), Playwright 360/1280, Lighthouse, ảnh 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
