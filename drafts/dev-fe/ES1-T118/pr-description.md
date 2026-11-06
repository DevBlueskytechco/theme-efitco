KHÔNG CHẮC: (1) chưa có preview: `?view=te7`, param object và param chuỗi rỗng vào `block.settings` (ES1-T117 #2, #3), `strip` trên `content` (ES1-T117 #5) đều chưa chạy thật; Playwright, axe, lhci, ảnh 360/768/1280 chờ CI; spec chưa chạy, chưa type-check. (2) Lệch ticket: `ul` dùng `role="list"` thay `role="group"`, xem Quyết định. (3) Bo góc card dùng `--radius-card` (default 12), Figma 16. (4) Spec ở drafts vì scope-guard chặn tests/. (5) Mặc định theo ES1-T115, ES1-T116 đang chờ PO, Designer.

# ES1-T118 TE-7-FE1: testimonials

Ticket: ES1-T118 · AC: docs/srs.md#TE-7 AC1, AC5 phần testimonials · Figma 1:885 · Nguồn: drafts/techlead/ES1-T114/task-split.md D1, D2, D3, D7, D8.

## Thay đổi
- `blocks/testimonials.liquid` (mới): eyebrow, heading, `ul` chứa `content`. Body rỗng: storefront không render, editor hiện placeholder.
- `blocks/testimonial-item.liquid` (mới): `li`, 7 settings author, verified, rating, title, quote, image, product. Quote và author đều trống: storefront không render, editor hiện placeholder.
- `snippets/rating-stars.liquid` (mới): `role="img"`, tên "Rated X out of 5", 5 SVG `aria-hidden`; rating 0 hiện 5 sao rỗng.
- `snippets/icon-trust.liquid`: thêm case `check`, màu `currentColor`.
- `blocks/container.liquid`: body rỗng và không `design_mode` thì không render band (D3).
- `templates/index.liquid`: container `home-testimonials`, cream, 4 mục. `templates/index.te7.liquid` (mới): 4 mục Figma, 1 mục, 6 mục (sao 0-5, không ảnh, không product, không title, không author), mục rỗng.
- `assets/base.css`: mục Testimonials, tăng 5 382 B (57 499 → 62 881). `critical.css` không đổi. `locales/`: `blocks.testimonials`, `general`, `labels`, `info`.
- 0 JS, không dùng `assets/slideshow.js`.

## Quyết định cần soát
- `role="list"` thay `role="group"` trên `ul`: ticket ghi role group, nhưng axe rule `listitem` (impact serious) báo lỗi mọi `li` khi cha có role khác `list` (`node_modules/axe-core/axe.js`, `listitemEvaluate`), trái DoD "axe 0 serious". Không dùng div bọc mang role group: phím mũi tên chỉ cuộn được khi focus nằm trên chính phần tử cuộn hoặc bên trong nó, nên wrapper phải là scroller và `testimonials-list` hết cuộn. Giữ `tabindex="0"`, `aria-label`; tên truy cập vẫn đủ. Spec này không assert role của list; `tests/e2e/TE-7.spec.ts` của QA ES1-T122 chưa có, đã comment để QA không assert `role="group"`.
- `tabindex="0"` vẫn còn từ 48rem, khi lưới không cuộn: thêm 1 điểm dừng Tab. Không JS thì CSS không gỡ được.
- Mục duy nhất ở dưới 48rem rộng 100% thay vì 85%, vì không có card kế để lộ.
- Đường kẻ là `border-block-start` của hàng product, nên không có product thì mất cả hai. Hàng product đẩy xuống đáy card để các card cùng hàng thẳng đường kẻ.
- Không có fallback `product` trong block: trên trang sản phẩm biến global `product` sẽ gán review nhầm sản phẩm.
- Ảnh review lấy alt từ Shopify; thumbnail product decorative, tên product nằm ngay cạnh.
- Lưới 4 cột ở 1280: card khoảng 290px, hàng tên + Verified + sao xuống dòng bằng flex-wrap. Xem ảnh CI 1280.
- Band rỗng theo D3 áp cho mọi template: announcement bar rỗng giờ cũng mất thẻ container.

## Hợp đồng
15 data-testid theo D8: `testimonials`, `testimonials-heading`, `testimonials-list`, `testimonials-placeholder`, `testimonial-item`, `testimonial-image`, `testimonial-author`, `testimonial-verified`, `testimonial-rating`, `testimonial-title`, `testimonial-quote`, `testimonial-product`, `testimonial-product-link`, `testimonial-product-price`, `testimonial-placeholder`. Thêm `container-home-testimonials`. Hook phụ cho test: `data-testimonial-id`, `data-testimonials-id`.

FE2-4 thêm band của mình vào `templates/index.te7.liquid`; band `te7-title` giữ h1 của template.

## Theme map AGENTS.md (scope-guard chặn, nhờ CTO hoặc Orchestrator áp)
Bảng Blocks:
```
| `testimonial-item` | One review of `testimonials`: image, author, Verified, stars, title, quote, product. |
| `testimonials` | Customer reviews: scroll-snap list under 48rem, grid from 48rem, no JavaScript. |
```
Bảng Snippets:
```
| `rating-stars` | Five stars for a rating from 0 to 5, with one accessible name. |
```
Hàng `container` nên thêm: "renders nothing on the storefront when its body is empty". Hàng `icon-trust` giữ nguyên.

## Chép file
`drafts/dev-fe/ES1-T118/ES1-T118.spec.ts` → `tests/e2e/ES1-T118.spec.ts`.

## Tự kiểm tra
- `shopify theme check --path .`: 59 file, 0 lỗi. `.theme-check.yml` không đổi.
- Locale JSON parse được, không thêm group trùng.
- `git diff develop -- 'assets/*.js'` rỗng; 0 hex, rgb, hsl mới, 0 margin/padding vật lý trong CSS mới.
- Chờ CI, chưa đạt cho tới khi có kết quả: `?view=te7` trả template mới; `npx playwright test tests/e2e/ES1-T118.spec.ts -g "AC1|AC5"` desktop + Pixel 7; TE-1.spec + TE-3.spec; axe 0 serious trên `/?view=te7` và `/`; 0 console error; `npx lhci autorun` từ 96 / 90 / 98; ảnh 360, 768, 1280.
- Nếu `?view=te7` không chạy: comment ES1-T117, báo Tech Lead trước khi làm FE2-4. Nếu test "có ảnh và product" skip: chụp editor làm bằng chứng tay.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
