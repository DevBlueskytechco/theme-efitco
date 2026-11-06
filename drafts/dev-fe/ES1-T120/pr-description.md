KHÔNG CHẮC: (1) chưa có preview: chưa render lần nào, layout, CLS, Playwright, axe, lhci, ảnh 360/768/1280 đều chờ CI; spec chưa chạy, chưa type-check. (2) Lệch câu chữ ticket: "920 + phần còn lại" và ảnh 201, 120, 280, 187, 200 hiểu là số ở khung 1920, dưới 1920 co theo vw, xem Quyết định. (3) Hộp chữ split 639 thay vì 660 của Figma. (4) Spec ở drafts vì scope-guard chặn tests/. (5) PR quá trần 400 dòng của CONVENTION nếu tính cả spec, xem Hợp đồng.

# ES1-T120 TE-7-FE3: image with text

Ticket: ES1-T120 · AC: docs/srs.md#TE-7 AC3, AC5 phần image with text · Figma 1:992, 1:625 · Nguồn: drafts/techlead/ES1-T114/task-split.md D1, D2, D5, D7, D8; ES1-T116 #1-#4, #6 (CTO chốt 06/11).

## Thay đổi
- `blocks/image-with-text.liquid` (mới): 10 settings, param template `layout` (`split` mặc định, `banner`), 0 JS.
- `split`: ảnh chính + chữ; dưới 64rem ảnh trên chữ theo DOM; `image_position` đổi cột bằng `order`. Thiếu ảnh: khung nền dark, editor có hướng dẫn. Accent 1, 2 từ 80rem, ẩn dưới 80rem. Accent 3 không render.
- `banner`: không ảnh chính, chữ căn giữa. 3 ảnh rải từ 80rem, dưới 80rem hàng 3 ảnh trên chữ. Ảnh trống không render.
- Toàn bộ chữ và ảnh trống: storefront không render (band cũng mất, D3), editor placeholder.
- `templates/index.liquid`: `home-inspiration` sand banner trước `home-testimonials`, `home-why-choose` dark sau. Mỗi block có `id` riêng.
- `templates/index.te7.liquid`: banner Figma, banner 1 ảnh + eyebrow trên sand, split trái, split phải, không ảnh chính trên sand, rỗng.
- `assets/base.css`: mục Image with text, tăng 7 629 B (70 631 → 78 260). `critical.css` không đổi. `locales/`: `blocks.image_with_text`, `general`, `labels`, `info`, `options.image_position`.

## Quyết định cần soát
- Số Figma ở khung 1920, không dùng nguyên ở 1280. Cột là tỉ lệ `920fr 1000fr`: 920px cố định chỉ còn 360px cho chữ ở 1280. Ảnh accent, lề, cỡ heading từ 80rem dùng `min(số Figma, vw)`, đúng số Figma từ 1920: ảnh 201 ở 1280 là 134. Nếu giữ 201 ở 1280, cột chữ còn khoảng 306px. Heading dùng `min(var(--font-size-display), 5.208vw)`, cùng cách `rich-text`.
- Hộp chữ split 639 thay vì 660: dừng đúng mép ảnh accent 1 để chữ dài không đè ảnh. Ở 1920 body có thể xuống dòng khác Figma 1 từ.
- `image_position: right`: accent nằm ở mép inline-end của cột chữ, không phải của band, nếu không sẽ đè lên ảnh chính. Với ảnh trái thì hai mép trùng nhau.
- `::before` giữ tỉ lệ 920 / 876, ảnh `position: absolute`: chỗ cho ảnh có trước khi ảnh tải, chữ dài thì ảnh cao theo band.
- Có thêm gradient đáy ảnh chính theo Figma 1:998, dùng `--color-background-dark`. Ticket không nhắc, ảnh export có.
- Viền focus nút: `.button` dùng `currentcolor` là chữ trắng, không thấy trên sand; block đặt lại theo band.
- Heading banner `max-inline-size: 8.8em` để ra 3 dòng như Figma. Setting là 1 dòng nên chỗ ngắt dòng có thể khác Figma.
- Default theo D7: "Add a short label", "Add a heading", text hướng dẫn, "Shop All Products" (đúng link mặc định). Trang chủ chưa giống Figma tới khi merchant nhập; band dark hiện khung trống bên cạnh chữ.
- Không làm USP, heading 1 màu, eyebrow và body theo ES1-T116 #1, #3, #4. Nút dùng `--radius-button` (default 4), Figma 8.

## Hợp đồng
10 data-testid theo D8: `image-with-text`, `image-with-text-image`, `image-with-text-accent`, `image-with-text-eyebrow`, `image-with-text-heading`, `image-with-text-body`, `image-with-text-button`, `image-with-text-placeholder`, `image-with-text-image-placeholder`, `image-with-text-content`. Thêm `container-home-inspiration`, `container-home-why-choose`. Hook phụ cho test: `data-image-with-text-id`, class `image-with-text__accent--1/2/3`. Storefront vẫn có `image-with-text-image-placeholder` (khung dark), chữ hướng dẫn chỉ có trong editor.

Quy mô: theme 413 dòng thêm vào file có sẵn + block 277 dòng, spec 279 dòng. Không tách vì ticket gói 1 block; CSS chiếm 301 dòng.

## Merge
Cùng sửa `templates/index.liquid` với ES1-T119 (`home-faq`): dự kiến xung đột ở cuối file, giữ thứ tự `home-testimonials`, `home-why-choose`, `home-faq` theo task-split. CSS chèn trước mục Testimonials, band te7 chèn trước testimonials để tránh chỗ FE2 thêm; chưa chạy thử merge.

## Tài liệu (scope-guard chặn, nhờ CTO hoặc Orchestrator áp)
AGENTS.md, bảng Blocks:
```
| `image-with-text` | Text with images: split layout (main image left or right) or centered banner with 3 scattered images; `layout` is a template parameter. |
```
DESIGN.md, bảng Images (ES1-T39 đã chốt tỉ lệ theo Figma):
```
| Image with text, main image | 920 / 876, full column height | Figma 1:998 |
| Image with text, accent images | 1 / 1 (201, 120 on split; 280, 187, 200 on banner, at 1920) | Figma 1:1011, 1:1012, 1:633, 1:634, 1:635 |
```
DESIGN.md, bảng Color tokens (ES1-T116 #2): cream bỏ "Inspiration banner"; sand thêm "Inspiration banner". `docs/figma-inventory.md` hàng 8: nền #EBE6E0 thay #F5F5F1; hàng 13: bỏ 3 USP (visible false).

## Chép file
`drafts/dev-fe/ES1-T120/ES1-T120.spec.ts` → `tests/e2e/ES1-T120.spec.ts`.

## Tự kiểm tra
- `shopify theme check --path .`: 64 file, 0 lỗi. `.theme-check.yml` không đổi.
- Locale JSON parse được, gộp vào group có sẵn.
- `git diff develop -- "assets/*.js"` rỗng. `grep -cE "#[0-9a-fA-F]{3,8}" assets/base.css`: 0 trước và sau. Đọc diff CSS: 0 `rgb`, `hsl`, 0 thuộc tính vật lý (`inset: 0` cả 4 phía).
- Chờ CI, chưa đạt cho tới khi có kết quả: `npx playwright test tests/e2e/ES1-T120.spec.ts -g "AC3|AC5"` desktop + Pixel 7; axe 0 serious, 0 color-contrast trên sand và dark; 0 console error; `npx lhci autorun` từ 96 / 90 / 98, LCP vẫn hero, CLS không tăng; `wc -c assets/*.js` so develop; ảnh 360, 768, 1280.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
