KHÔNG CHẮC: (1) `labels.eyebrow` dùng chung cho quiz (đã có Subheading) và 5 block khác → đặt "Text above heading" cho cả nhóm, không thêm key mới; (2) store dev có thể đang tô swatch card bằng metafield `custom.swatch_colors` → sau PR các card đó mất swatch cho tới khi option value có swatch gốc; (3) TC-21 `tests/e2e/TE-3.spec.ts` cần QA sửa (xem dưới).

# ES1-T404 TS-FE6: product-card swatch gốc, Sale theo compare_at_price_max, nhãn setting §14

Kế hoạch: `drafts/techlead/ES1-T304/task-split.md` §3 TS-FE6. Audit A#36, B#12, N4, N5, N7. Mục Shopify 4, 7, 14.

## Thay đổi

`snippets/product-card.liquid`
- Bỏ metafield `custom.swatch_colors` (khai báo + nhánh `style`). Swatch chỉ từ `value.swatch.image` / `value.swatch.color`.
- Chọn option swatch: option đầu tiên có > 1 giá trị và MỌI giá trị có `swatch.color` hoặc `swatch.image`; thiếu ở 1 giá trị thì card không in swatch (VP3, decisions.md 11/11). Trước đây chỉ kiểm giá trị đầu.
- Badge: không truyền `variant`, biến thể card không sale, `product.compare_at_price_max > product.price_min` → `data-badge="sale"`, chữ "Sale" (`products.card.sale`). Biến thể card đang sale giữ `-N%`. Có `variant` → giữ logic theo variant.
- Swatch của biến thể card lặp lại badge card khi badge riêng là `none`, để chọn lại swatch mặc định (assets/product-swatch.js copy `data-badge`) trả đúng badge lúc tải. Swatch khác giữ quy tắc theo variant.
- `{% doc %}` cập nhật quy tắc badge, swatch. Không đổi testid, hook JS, markup, CSS.
- Không đụng vòng `for candidate in product.variants` (AC8, ADR 0008) — thuộc ES1-T337 TE-3-R2-FE1.

`locales/en.default.schema.json` (mục `labels`, không đổi id)
- `collection_card_title`, `level_card_title`: Title → Heading.
- `blog_posts_eyebrow`, `image_with_text_eyebrow`, `multicolumn_eyebrow`, `shop_by_level_eyebrow`, `testimonials_eyebrow`: Eyebrow → Subheading.
- `slide_eyebrow` (slideshow-slide có `subheading`), `video_carousel_eyebrow` (video-carousel có `subheading`), `eyebrow` (dùng chung: quiz có `quiz_subheading`, bundle-builder, shop-the-look, featured-collection, featured-product, faq): Eyebrow → Text above heading.
- `testimonial_verified`: Show Verified label → Show verified label.
- Đã quét mọi block: không block nào có 2 setting cùng nhãn "Subheading"/"Heading" sau đổi.

## Đề xuất cho QA (không sửa, ngoài vai)
`tests/e2e/TE-3.spec.ts` TC-21 lọc card có `product-card-badge-sale` và giả định biến thể card có `compare_at > price`. Card Sale cấp sản phẩm (giá không đổi, chỉ biến thể khác sale) sẽ làm đỏ. Sửa: trong vòng lặp, nếu `!(v.compare_at_price > v.price)` thì `expect(badge).toHaveText('Sale')`, `expect(p.variants.some(x => (x.compare_at_price ?? 0) > x.price)).toBe(true)` rồi `continue`.

## Spec E2E
`drafts/dev-fe/ES1-T404/ES1-T404.spec.ts` → Orchestrator chép sang `tests/e2e/ES1-T404.spec.ts` (scope-guard chặn dev-fe ghi `tests/`).
- `@static`: không còn `swatch_colors`; có `value.swatch.color/image`; điều kiện `compare_at_price_max`; 11 nhãn.
- Store: sản phẩm chỉ biến thể khác mặc định sale → badge Sale trên `/collections/all`; swatch checked có `data-badge="sale"`. Dữ liệu: `T404_SALE_SECOND_HANDLE` hoặc tự tìm trong `/products.json`; không có thì skip có lý do (không tính đạt).
- Store: mọi `product-card-swatch` có `--swatch-color` hoặc `--swatch-image`; không có card swatch thì skip.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn ở templates/index*, testimonial-item, bundle-builder, quiz-step, featured-product; không file nào trong diff).
- `grep -n "swatch_colors" snippets/product-card.liquid` = 0; `grep -nE '"Eyebrow"|"Title"|Show Verified' locales/en.default.schema.json` = 0.
- Locale JSON hợp lệ, không trùng key.
- Không file JS, không CSS trong diff; ngân sách base.css/critical.css không đổi.
- Playwright (ES1-T404, smoke, TE-3), Lighthouse desktop/mobile `/collections/all` và trang chủ, ảnh 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
