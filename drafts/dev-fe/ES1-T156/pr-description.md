KHÔNG CHẮC: (1) chưa có preview: parse `date` (chuỗi có offset, chuỗi sai trả gì), `all_products` với handle có dấu, param object vào `block.settings.product`, metafield rating đều chưa chạy thật; Playwright, axe, lhci, ảnh 360/768/1280 chờ CI; spec chưa chạy, chưa type-check. (2) `/?view=te13` có 5 block nên trùng tên partial trên 1 trang, docs chưa nói hành vi: ES1-T161, nếu Liquid báo lỗi thì trang test hỏng. (3) Lệch D11 ở index.te13, thêm icon ngoài danh sách ticket, xem Quyết định. (4) Spec ở drafts vì scope-guard chặn tests/.

# ES1-T156 TE-13-FE1: featured product

Ticket: ES1-T156 · AC: docs/srs.md#TE-13 AC1 (markup), AC2 · Figma 1:759 · Nguồn: drafts/techlead/ES1-T142/task-split.md D1, D2, D3, D4, D5, D9, D10, D11; CTO 06/11: ES1-T152 #5, ES1-T155 #2.

## Thay đổi
- `blocks/featured-product.liquid` (mới): 8 settings, gallery ảnh, giá + % giảm, rating, spec 4 dòng, khung countdown, form. Product trống: storefront không render, editor hiện placeholder.
- `snippets/product-variant-picker.liquid`, `snippets/product-variant-select.liquid` (mới): tách từ `blocks/product-form.liquid`, thêm param `fetch_url`, `regions`. Không truyền thì 0 thuộc tính mới. Thẻ script của trang sản phẩm giữ trong `blocks/product-form`.
- `templates/product.featured-product.liquid` (mới): cho JS fetch 2 partial cùng markup.
- `templates/index.liquid`: container `home-featured-product`, tag div, đứng trước testimonials theo Figma. Bundle builder chưa có trên develop, khi TE-12 merge band đó đứng trước band này.
- `templates/index.te13.liquid` (mới): 5 band, FE2 thêm phần mình.
- `snippets/header-icon.liquid`: thêm case `bag`.
- `assets/base.css`: mục Featured product, tăng 8 483 B (67 269 → 75 752). `critical.css` 9 921 B không đổi. `locales/`: `blocks.featured_product`, `general`, `labels`, `info`.
- 0 file JS, không thêm thẻ script, không thêm `data-lazy-module`: BE1 làm.

## Quyết định cần soát
- Điều kiện countdown theo CTO: còn hạn VÀ `selected_or_first_available_variant.compare_at_price > price` VÀ `product.available`.
- Kiểm định dạng ngày gồm 3 bước: đúng 16 ký tự và 4 dấu ngăn đúng vị trí, phần còn lại toàn chữ số, `date: '%s'` trả về số. Không so khứ hồi bằng `%Y-%m-%d %H:%M` vì sẽ báo sai khi đổi giờ mùa hè.
- Lệch D11: C là hết hàng có ngày còn hạn thay vì không ngày, để kiểm được luật hết hàng của CTO. Thêm E `TE4_SWATCH_SALE_HANDLE` không ngày cho ca trống: sản phẩm có sale mà không ngày mới chứng minh được ca này. QA ES1-T159 đọc theo 5 band này.
- B, D có thể không sale, khi đó "0 countdown" đúng vì lý do khác với ca đang kiểm. Muốn chắc thì cần 2 sản phẩm sale thêm hoặc xác nhận dữ liệu.
- `te13-meta` trong band tiêu đề chứa `data-expected-end`, tính bằng epoch bỏ phần giây, độc lập với công thức của block. Lệch 3 600 giây được chấp nhận khi đổi giờ mùa hè rơi vào 48 giờ tới.
- Thêm hook `data-countdown-value` trên số của từng ô, không đổi hook D10. Đã comment ES1-T158.
- Icon túi trên Add to cart: ticket không ghi, Figma 1:815 có. Thêm 1 case vào `header-icon`, chỉ hiện khi còn hàng. Icon vẽ tay gần giống, không lấy từ vector Figma.
- View Detail: `button--secondary` nhưng nền `--color-border` (trùng màu Figma), không viền.
- Bo góc: khung ảnh, countdown, bảng dùng `--radius-card` (12), ô số và nút dùng `--radius-button` (4). Figma 16 và 8, không thêm token theo ticket.
- Từ 64rem không có khoảng dưới, đúng Figma: band video 1:819 bắt đầu ngay tại 7974. Ảnh chạm band kế: xem ảnh CI, nếu xấu thì Designer quyết. Dưới 64rem có `--space-7` hai đầu.
- Dưới 48rem nhãn countdown nằm trên, hàng ô dưới (ES1-T154 #2).
- Chưa có BE1: có JS thì picker chưa defined nên bị CSS ẩn, select chỉ hiện khi tắt JS. Sản phẩm nhiều variant trên `/?view=te13` chỉ mua được variant mặc định tới khi ES1-T158 merge. Khung countdown cũng không hiện tới lúc đó. Trang chủ chưa cấu hình không bị ảnh hưởng.
- Form id theo product id nên 2 block cùng sản phẩm trên 1 trang không hỗ trợ (D3).

## Hợp đồng
23 data-testid theo D10, đủ cả 23. Hook, partial, template: giữ nguyên D10. `data-regions` cách nhau 1 dấu cách.

## Theme map AGENTS.md (scope-guard chặn, nhờ CTO hoặc Orchestrator áp)
Bảng Blocks:
```
| `featured-product` | One highlighted product: image gallery, countdown frame, price, rating, spec table, buy form; `product-price`, `product-buy-buttons` partials. |
```
Bảng Snippets:
```
| `product-variant-picker` | Variant radios and variant JSON in the `product-variant-picker` element; optional fetch URL and regions. |
| `product-variant-select` | Noscript variant select for the product form. |
```
Hàng `header-icon`: thêm `bag`.

## Chép file
`drafts/dev-fe/ES1-T156/ES1-T156.spec.ts` → `tests/e2e/ES1-T156.spec.ts`.

## Tự kiểm tra
- `shopify theme check --path .`: 67 file, 0 lỗi. `.theme-check.yml` không đổi.
- Locale JSON parse được, gộp vào group có sẵn.
- `git diff develop` không có `assets/*.js`, không có `assets/critical.css`; 0 hex, rgb, hsl mới, 0 thuộc tính vật lý mới trong CSS.
- Chờ CI, chưa đạt cho tới khi có kết quả: `npx playwright test tests/e2e/ES1-T156.spec.ts -g "AC1-markup|AC2|nojs"` desktop + Pixel 7; `tests/e2e/TE-4.spec.ts`, `TE-1.spec.ts`, `TE-3.spec.ts`; axe 0 serious trên `/?view=te13`; 0 console error; `npx lhci autorun` từ 96 / 90 / 98; ảnh 360, 768, 1280.
- Test có metafield skip tới khi có `TE13_METAFIELDS_READY` (ES1-T153 còn mở).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
