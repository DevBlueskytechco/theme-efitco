ES1-T56 TE-3-FE3: badge sale theo variant, link +N không đổi variant, bo góc card 12, heading featured-collection 48, sale + khoảng giá

Nguồn: CTO chốt ES1-T49, ES1-T54, ES1-T55 (3/11) + bổ sung từ CI #54.

## Thay đổi
- snippets/product-card.liquid
  - Mỗi radio swatch (khi có variant) thêm `data-badge` (sale | sold_out | none) và `data-badge-label` (chuỗi đã dịch qua `| t`: `-N%` làm tròn theo variant đó, 0% thì `Sale`, hết hàng thì `Sold out`, none thì rỗng).
  - Badge luôn render 1 phần tử `<span class="product-card__badge" data-card-badge data-badge="…">`, `hidden` khi none. data-testid theo trạng thái: `product-card-badge-sale` / `product-card-badge-sold-out` / `product-card-badge` (none) → test TC-20..24, TC-80 giữ nguyên.
  - Quy tắc badge (card và swatch dùng chung): sold_out khi product hoặc variant không available; sale khi compare_at_price > price.
  - Link "+N": bỏ `data-card-link`, giữ `href = product.url`.
  - `{% doc %}` cập nhật hợp đồng hook.
- snippets/price.liquid: `price_varies` + variant card sale → vẫn khoảng giá (`price-range`, AC4) + nhãn ẩn `products.price.sale_price`, nhãn ẩn `regular_price`, `<s data-testid="price-compare">` = compare_at_price của variant card; root có `price--on-sale` (AC3).
- assets/base.css: style badge theo `[data-badge='sale' | 'sold_out']` thay class modifier (BE chỉ cần đổi attribute), thêm `.product-card__badge[hidden] { display: none; }`. Không thêm giá trị hardcode.
- config/settings_schema.json: `card_corner_radius` default 8 → 12 (Figma 1:502). CSS vẫn `var(--radius-card)`.
- Heading featured-collection: đã là `var(--font-size-h1)` (48, Figma 1:495), không đổi code.

## Cần Orchestrator apply (scope-guard chặn dev-fe)
- `drafts/dev-fe/ES1-T56/DESIGN.md.patch`: Type scale 48 `--font-size-h1` = h1 + heading block section (Figma 1:495), bỏ "block headings" ở dòng 36; bảng Corner radius card 8 → 12. `git apply --check` OK.
- `drafts/dev-fe/ES1-T56/TE-3.spec.ts.patch`: bỏ `test.fixme` TC-25. Sửa luôn bộ lọc: bản cũ lấy card khoảng giá đầu tiên bất kể sale → sẽ fail nếu card đó không sale; bản mới lọc card có cả `price-range` và `product-card-badge-sale`, kiểm thêm thẻ S, class `price--on-sale`, giá gạch = compare_at_price variant từ .js. QA xem lại. `git apply --check` OK.

## Hook cho BE (TE-3-BE2)
- Badge: `[data-card-badge]` trong card. Khi chọn swatch: copy `input.dataset.badge` → `badge.dataset.badge`, text = `data-badge-label`, `hidden` khi none, data-testid = `product-card-badge-sale` | `product-card-badge-sold-out` | `product-card-badge`.
- `a[data-card-link]` giờ chỉ còn ảnh + tiêu đề; "+N" không bị đổi href.
- Không file JS trong diff.

## Giả định
- sold_out theo variant (swatch variant hết hàng → Sold out) vì ticket liệt kê sold_out là giá trị của từng swatch. Card mặc định dùng selected_or_first_available_variant nên hành vi lúc load không đổi so với trước.

## Tự kiểm tra
- `shopify theme check --path .`: 43 file, 0 lỗi.
- `grep -c 'data-badge' snippets/product-card.liquid` = 8 (≥ 2).
- `data-card-link` chỉ còn trên link ảnh và tiêu đề; link +N không có.
- E2E (TE-1 TC-02, TE-3), Lighthouse, ảnh 3 breakpoint, visual diff: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
