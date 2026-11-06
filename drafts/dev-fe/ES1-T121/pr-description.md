KHÔNG CHẮC: (1) chưa có preview: chưa render lần nào, layout, Playwright, axe, lhci, ảnh 360/768/1280 đều chờ CI; spec chưa chạy, chưa type-check. (2) Chưa rõ Liquid trong chuỗi param có được chạy khi đặt vào setting type liquid không (ES1-T166, CTO), test AC5 sẽ fail nếu ra nguyên văn; shopify.dev vẫn bị từ chối. (3) `docs/checklist-theme-store.md` và Theme map AGENTS.md bị scope-guard chặn, nhờ Orchestrator áp, xem mục Tài liệu. (4) Spec ở drafts vì scope-guard chặn tests/. (5) Tổng 557 dòng theme, quá trần 400 dòng của CONVENTION, xem Hợp đồng.

# ES1-T121 TE-7-FE4: multicolumn, Custom Liquid

Ticket: ES1-T121 · AC: docs/srs.md#TE-7 AC4, AC5 · Figma không có frame · Nguồn: drafts/techlead/ES1-T114/task-split.md D1, D2, D6, D7, D8; ES1-T115 #4, ES1-T116 #7, ES1-T117 #1 (CTO chốt).

## Thay đổi
- `blocks/multicolumn.liquid` (mới): 2 settings eyebrow, heading; `ul` chứa `content`. Body rỗng: storefront không render, editor placeholder.
- `blocks/multicolumn-column.liquid` (mới): `li`, 6 settings icon, image, heading, text, link_label, link_url. Ảnh thắng icon. Link mặc định `routes.all_products_collection_url`.
- `blocks/custom-liquid.liquid` (mới): 1 setting `custom_liquid` type liquid, không default, info ghi giới hạn theo ES1-T117 #1. Không padding, không nền.
- `templates/index.liquid`: cuối trang `home-multicolumn` 3 cột `multicolumn-1..3`, `home-custom-liquid`.
- `templates/index.te7.liquid`: 2 cột icon trên cream, 3 cột ảnh, 4 cột icon trên dark, cột hỗn hợp trên sand, multicolumn rỗng, custom liquid có chữ cố định + `shop.name`, custom liquid rỗng.
- `assets/base.css`: mục Multicolumn, tăng 3 574 B (78 575 → 82 149). `critical.css` không đổi. `locales/`: `blocks.multicolumn`, `blocks.custom_liquid`, `general`, `info`, `labels`, `options.trust_icon.none`.
- 0 JS. 0 setting cột: dưới 48rem 1 cột, 48-64rem 2 cột, từ 64rem cột tự sinh nên 2, 3, 4 cột theo số dòng gọi trong template.

## Quyết định cần soát
- `grid-auto-columns: minmax(0, 1fr)` thay `1fr` trong ticket: `1fr` có sàn min-content, từ dài làm các cột lệch độ rộng. `minmax(0, 1fr)` giữ cột bằng nhau, cùng cách `.site-footer__nav`.
- Cột chỉ có icon coi là rỗng: icon là trang trí, không có gì để đọc. Ticket chỉ ghi "cột rỗng không render".
- Cột rỗng trong editor dùng lại testid `multicolumn-placeholder`: D8 chốt 12 testid, không có tên riêng. Phân biệt bằng `data-multicolumn-column-id`.
- Icon mặc định `none`: 3 cột cùng 1 icon trên trang chủ dễ thành lời hứa giả (truck = giao hàng). Text mặc định hướng dẫn chọn icon hoặc ảnh. Trang chủ vì vậy chưa thấy icon tới khi merchant chọn.
- Ở 768, 3 cột thành 2 + 1: cột thứ ba đứng một mình, đúng ticket "48-64rem 2 cột".
- Ảnh tỉ lệ 3 / 2 bằng CSS, không `crop: center`: `object-fit` giữ focal point `image_tag` gắn inline (ghi chú `collection-banner` trong `base.css`), giống `testimonial-item__image`. `sizes` lấy cận trên 50vw vì block không biết số cột; 3 và 4 cột có thể tải ảnh lớn hơn cần.
- Chữ cột và link dùng màu kế thừa, không `muted`, `accent`, để không phải tính contrast riêng cho từng band. Eyebrow accent, đổi sang `muted` trên sand và `muted_on_dark` trên dark theo ES1-T116 #4; band `alt` giữ accent (4.55:1 trên #F4F4F4, DESIGN.md).
- Link không dùng `.button--link`: cỡ 28 bằng đúng heading cột 28, không còn thứ bậc. Link cỡ base 600, mũi tên `slideshow-icon`, cao từ 44px, đẩy xuống đáy cột để thẳng hàng.
- Căn lề theo `alignment` của container: icon và link đọc `--text-align`.
- Custom Liquid chỉ kiểm `!= blank` trên setting: Liquid chạy ra chuỗi rỗng vẫn còn `div` trống và band. Không `strip` vì docs không nói filter chạy được trên giá trị setting này.
- Trang chủ hiện text hướng dẫn cho khách tới khi merchant nhập: PO đã chấp nhận (ES1-T115 #4).

## Hợp đồng
12 data-testid theo D8: `multicolumn`, `multicolumn-heading`, `multicolumn-list`, `multicolumn-placeholder`, `multicolumn-column`, `multicolumn-icon`, `multicolumn-image`, `multicolumn-column-heading`, `multicolumn-text`, `multicolumn-link`, `custom-liquid`, `custom-liquid-placeholder`. Thêm `container-home-multicolumn`, `container-home-custom-liquid`. Hook phụ cho test: `data-multicolumn-id`, `data-multicolumn-column-id`, `data-custom-liquid-id`.

Quy mô: 294 dòng thêm vào file có sẵn (CSS 157, te7 100) + 3 block 263 dòng, spec 220 dòng. Không tách vì ticket gói cả 3 block.

## Rà AC5
`grep -rin "lorem" blocks locales` rỗng trên nhánh này; `git grep -il lorem` rỗng trên `feature/ai-ES1-T119`, `feature/ai-ES1-T120` (blocks, locales). Đọc default của `testimonials`, `testimonial-item`, `faq`, `faq-item`, `image-with-text`, `multicolumn`, `multicolumn-column`: toàn gợi cách dùng, trừ `faq.eyebrow` "Questions and answers", `testimonials.eyebrow` "Testimonials", `image-with-text` và cột "Shop All Products": nhãn chung, đúng thực tế, không phải số liệu hay review giả. `custom-liquid` không default theo ticket.

## Merge
Cùng sửa `templates/index.liquid` với ES1-T119, ES1-T120: dự kiến xung đột ở cuối file, giữ thứ tự `home-testimonials`, `home-why-choose`, `home-faq`, `home-multicolumn`, `home-custom-liquid` theo task-split. CSS chèn trước Gift card, band te7 chèn trước band testimonials rỗng, locale chèn chỗ khác 2 nhánh kia để tránh xung đột; chưa chạy thử merge.

## Tài liệu (scope-guard chặn, nhờ CTO hoặc Orchestrator áp)
AGENTS.md, bảng Blocks:
```
| `custom-liquid` | Merchant Liquid or HTML from one `liquid` setting; renders nothing when empty. |
| `multicolumn` | Heading and 2 to 4 columns: 1 column under 48rem, 2 from 48rem, one row from 64rem, no JavaScript. |
| `multicolumn-column` | One column of `multicolumn`: image or icon, heading, rich text, link. |
```
Hàng `icon-trust` giữ nguyên. Hàng R5.1 `docs/checklist-theme-store.md`: `git apply drafts/dev-fe/ES1-T121/checklist-theme-store.patch`, đã `git apply --check`; đổi "Chờ CI" thành Pass khi CI xanh.

## Chép file
`drafts/dev-fe/ES1-T121/ES1-T121.spec.ts` → `tests/e2e/ES1-T121.spec.ts`.

## Tự kiểm tra
- `shopify theme check --path .`: 70 file, 0 lỗi. `.theme-check.yml` không đổi.
- Locale JSON parse được, kiểm bằng script không có key trùng ở mọi cấp.
- `git diff develop --numstat -- assets`: chỉ `base.css`, không file JS. `grep -cE "#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(" assets/base.css`: 0. Đọc diff CSS: 0 thuộc tính vật lý.
- `grep -rin "lorem" blocks locales`: rỗng.
- Chờ CI, chưa đạt cho tới khi có kết quả: `npx playwright test tests/e2e/ES1-T121.spec.ts -g "AC4|AC5"` desktop + Pixel 7 (2, 3, 4 cột ở 1280, 1 cột ở 360, 2 cột ở 768, `shop.name`, trang chủ không band rỗng); axe 0 serious, 0 console error; `npx lhci autorun` từ 96 / 90 / 98 trên trang chủ; `wc -c assets/*.js` so develop; ảnh 360, 768, 1280.
- Chưa kiểm trong editor: placeholder và `request.design_mode`; không có store để mở.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
