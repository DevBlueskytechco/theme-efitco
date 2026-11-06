KHÔNG CHẮC: (1) Khoảng cách swatch lệch Figma: bước 36 thành 44, vì vùng bấm 44 không chồng nhau thì bước tối thiểu là 44. Hàng 3 swatch rộng 120 thay vì 104, hình 32 x 16 giữ nguyên. Visual diff có thể báo ở vùng này. (2) Quy tắc tag `new` là ĐỀ XUẤT của ES1-T174 (Figma không có quy tắc). Bảng ES1-T173 ghi "tag New", `contains` phân biệt hoa thường, nên ES1-T178 phải tạo đúng `new`; đã comment ticket đó. (3) Chưa chạy trên preview: mọi số đo dưới đây tính từ CSS, không phải đo thật.

# ES1-T190 TE-3-FE5: badge rating, badge New, mặc định 4 sản phẩm, vùng bấm swatch 44 px (D7)

Plan ES1-T169 #31, D7, CR-3. AC-H13, AC-H14, TE-3 AC6. Không JS, không quick add.

## Thay đổi
- `snippets/product-card`:
  - Rating: đọc `reviews.rating`, quy về thang 5 như `featured-product`. Không có metafield thì không có badge, không có giá trị mặc định. Sao và số `aria-hidden`, chữ ẩn qua `products.card.rating_label`. Hook: `product-card-rating`, `product-card-rating-value`.
  - New: tag `new`, phần tử riêng `product-card-badge-new`, không có `data-card-badge`.
- `assets/base.css`:
  - Thứ tự Sold out > % > New bằng CSS: `[data-card-badge]:not([hidden]) ~ .product-card__badge--new`. `product-swatch.js` coi mọi giá trị ngoài sale, sold_out là none và ẩn badge, nên New không đi qua `data-badge`. Đổi swatch sang variant sale hay hết hàng thì New tự ẩn, không sửa JS.
  - Badge cách mép 8 dưới 64rem, 16 từ 64rem (ES1-T174). Rating padding 8 dưới 64rem, 12 từ 64rem: "Sold out" + rating ước tính 8 + 76 + 62 + 8 = 154 > card 152.
  - Swatch: `::after` 44 x 44, label 32 x 24 và pill 32 x 16 không đổi. Gap 20 / 12, nên vùng bấm chỉ chạm nhau.
  - Lưới: đúng 4 card thì 4 cột từ 48rem; từ 80rem vẫn theo `columns_desktop`.
  - Ẩn rating trong `.bundle-builder__item`: góc đó là vòng chọn.
- `blocks/featured-collection`: `products_to_show` default 4.
- Token theo AGENTS.md:323: `badge_new_color` #4B824D, `badge_new_foreground_color` #FFFFFF, thêm `settings_schema`, `css-variables`, locale schema.
- Locale: `products.card.new`, `products.card.rating_label`.

## Tương phản
Đo lại bằng công thức WCAG, khớp ES1-T174: trắng trên #4B824D 4.57:1; #4B824D trên #F5F5F1 4.18:1.

## Orchestrator cần áp (scope-guard chặn dev-fe)
Chạy cả 3 patch trong cùng PR, rồi chép spec:
- `git apply drafts/dev-fe/ES1-T190/TE-3.spec.patch`: LIMIT 4, TC-01 (đúng 4 card thì 4 cột từ 768 đến 1279), TC-04, TC-54 (đo `::after` từ 44), tên TC-81.
- `git apply drafts/dev-fe/ES1-T190/DESIGN.md.patch`
- `git apply drafts/dev-fe/ES1-T190/tokens.json.patch`
- `cp drafts/dev-fe/ES1-T190/ES1-T190.spec.ts tests/e2e/ES1-T190.spec.ts`

Số dòng trong ticket (TE-3.spec:426, 769, 918) đã lệch 3 dòng; đã sửa đúng 429, 772, 921.

## Tự kiểm tra
Đã chạy:
- `shopify theme check`: 92 file, 0 lỗi.
- `git apply --check` 3 patch: đạt.
- Không file JS trong diff; `assets/critical.css` giống develop.
- JSON locale, settings parse được. Dòng CSS thêm mới: 0 literal màu, 0 thuộc tính vật lý.

Chưa chạy, chờ CI (e2e, lighthouse đang tắt theo CTO 06/11, `RUN_STORE_TESTS=false`):
- Playwright ES1-T190, TE-3, ES1-T189; axe; console; lhci; ảnh 360, 768, 1280, 1920. Spec chưa type-check.
- Spec cần dữ liệu ES1-T178 (P01, P02, P04): thiếu thì skip có lý do. Bảng ES1-T173 không có sản phẩm vừa New vừa sale, nên thứ tự ưu tiên kiểm bằng cách đổi DOM; muốn kiểm dữ liệu thật thì đặt `T190_NEW_SALE_HANDLE`.
- `tests/e2e/ES1-T176.spec.ts` chưa có trong repo; ticket đó làm cuối theo CTO, hàng DoD này chưa kiểm được.

## Ghi chú cho reviewer
- Snippet dùng chung nên rating, New hiện ở mọi nơi render `product-card` (collection, quiz...). `product-recommendations` có markup riêng do JS điền nên chưa có; không có AC, không làm.
- Sao dùng `--color-rating` #FFC107 theo DESIGN.md; Figma ghi #F6C110.
- Link "+N" vẫn cao 24: ngoài ticket, đang `tabindex="-1"` + `aria-hidden`, nhưng vẫn bấm được bằng cảm ứng.
- Vùng bấm tràn 6 ngang, 10 dọc ra ngoài label. Dọc đè 2 px đáy giá (không tương tác), dưới nằm trong gap lưới.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
