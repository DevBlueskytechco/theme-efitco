KHÔNG CHẮC: (1) chưa có preview: `?view=te12`, param `collection` vào `block.settings`, form POST `id[]` (ES1-T143 #4, docs không có câu nguyên văn) chưa chạy thật; Playwright, axe, lhci, ảnh 360/768/1280 chờ CI; spec chưa chạy, chưa type-check. Nếu `id[]` không đạt: đổi theo ES1-T143 #4 và comment ticket. (2) DoD "không có band rỗng" CHƯA ĐẠT: `blocks/container` bỏ band rỗng nằm ở PR #85 (ES1-T118), chưa merge; trang chủ còn 1 `div` rỗng `container-home-bundle-builder` tới khi rebase. (3) Mặc định theo ES1-T145, ES1-T146 đang chờ Designer, PO. (4) Ca hết hàng và giới hạn đúng 9 cần collection `te12-bundle` (ES1-T144 chưa có); thiếu thì dùng `collections.all`, test hết hàng skip có lý do. (5) Spec ở drafts vì scope-guard chặn tests/. (6) Giữa task, phiên khác chuyển worktree sang `develop` và pull: nhánh ticket đã fast-forward lên `c886ca0` (có TE-6 #84, ES1-T100 #82). Không có commit nào của ticket này trên `develop`, Orchestrator kiểm lại khi commit.

# ES1-T147 TE-12-FE1: bundle builder markup + CSS

Ticket: ES1-T147 · AC: docs/srs.md#TE-12 AC1 (markup panel), AC2 (ghi chú, default), AC4 · Figma 1:636 · Nguồn: drafts/techlead/ES1-T141/task-split.md D1, D2, D3, D4, D9, D11, D12.

## Thay đổi
- `blocks/bundle-builder.liquid` (mới): tự chứa, 12 settings, root `bundle-form` bọc form POST tới `routes.cart_add_url`. Tối đa 9 mục, checkbox `id[]` là anh em của card. Panel Your Bundle. Chưa chọn collection hoặc collection rỗng: storefront không render, editor hiện placeholder. 0 thẻ script.
- `snippets/product-card.liquid`: thêm param `show_swatches`, `false` thì không render fieldset swatch. Mặc định giữ nguyên.
- `templates/index.liquid`: container `home-bundle-builder`, tag div, background cream, không đặt setting qua param.
- `templates/index.te12.liquid` (mới): `?view=te12`. Bundle 1 bậc 2:10, 3:15, copy Figma; bundle 2 không bậc. Gỡ trước khi lên store thật.
- `assets/base.css`: mục bundle builder, tăng 8 742 B (61 867 → 70 609). `critical.css` không đổi.
- `locales/`: `blocks.bundle_builder`, `general`, `info`, `labels`.

## Quyết định cần soát
- Input không dùng `visually-hidden`: nằm đúng trên vòng chọn, `opacity: 0`, `z-index` trên label. Bản clip 1px bị label che nên `locator.check()` của Playwright không bấm được, BE1 và QA1 sẽ vướng. Vùng bấm đủ 44px vẫn là label.
- Tên card có `z-index: 1`: label vuông theo chiều rộng thẻ nên lấn khoảng 4px vào dòng tên. Tên vẫn bấm được.
- Mục hết hàng vẫn giữ label để input có tên cho axe; không dùng `pointer-events: none`, bấm vào không có tác dụng vì input disabled và không rời trang. Ảnh của mục hết hàng vì thế không dẫn tới trang sản phẩm, tên thì có.
- Dấu trừ của dòng giảm do CSS thêm (`:not(:empty)::before`). **BE1 chỉ ghi số tiền, không ghi dấu**, nếu không sẽ thành 2 dấu.
- Dòng giảm không có `hidden` ban đầu, BE1 đặt `hidden` khi chưa đạt bậc; `.bundle-builder [hidden]` đã thắng `display: flex`.
- Live region `role="status"` ẩn trực quan (panel đã hiện số liệu), là `div` vì `p:empty` bị ẩn trong critical.css. Thanh tiến độ `aria-hidden`, thông tin nằm ở chữ.
- Ngoài ticket: xử lý item là variant trong collection nhiều nguồn (`item.product`), cùng logic `featured-collection`. Không có thì input mất `value`.
- Không thêm icon: dấu tick vẽ bằng `clip-path`, không thêm snippet. Bỏ icon khoá của Figma ở dòng tiến độ: khi đạt bậc cao nhất icon khoá sẽ sai nghĩa, JS không có hook đổi icon. Cần thì Designer trả lời ở ES1-T145.
- Bo góc thẻ và panel `calc(var(--radius-card) + var(--space-1))` = 16 như Figma ở mặc định, không thêm token. Đường kẻ dùng `color-mix` từ `--color-muted-on-dark`.
- Lệch Figma theo D9, ES1-T145: nền panel `--color-background-dark`, dòng giảm không xanh, gap lưới panel 32 thay 33. Heading mặc định `Pick Your Kit` không có chữ Save (ES1-T146 #2), copy Figma chỉ ở `index.te12`.
- `index.liquid`, `base.css`, locale đụng cùng chỗ với PR #85, #87: Orchestrator rebase theo thứ tự merge. Band đang đứng sau featured collection, thứ tự cuối theo docs/figma-inventory.md (D1).

## Hợp đồng
23 data-testid theo D11, đủ danh sách; đã đếm trong file. Card giữ `product-card*`. Thêm `container-home-bundle-builder`, `container-te12-bundle`, `container-te12-bundle-no-tiers`.

Hook cho BE1 (ES1-T149) đúng D11, liệt kê trong `{% doc %}` của block. Custom element `bundle-form` chưa có định nghĩa. BE1 thêm `data-lazy-module` + thẻ script. `data-bundle-progress` nhận `--bundle-progress`. `template[data-bundle-line-template]` là anh em của `ul[data-bundle-lines]`, không nằm trong `ul`.

FE2 (ES1-T148) thêm phần shop the look vào `index.te12`.

## Theme map AGENTS.md (scope-guard chặn, nhờ CTO hoặc Orchestrator áp)
Bảng Blocks:
```
| `bundle-builder` | Bundle builder: up to 9 selectable product cards from one collection, Your Bundle panel, display-only discount tiers; POST form works without JavaScript. |
```
Hàng `product-card` trong bảng Snippets không đổi.

## Chép file
`drafts/dev-fe/ES1-T147/ES1-T147.spec.ts` → `tests/e2e/ES1-T147.spec.ts`.

## Tự kiểm tra
- `shopify theme check --path .`: 60 file, 0 lỗi. `.theme-check.yml` không đổi.
- Locale JSON parse được, gộp vào group có sẵn. 12 settings, 23 data-testid đếm trong file.
- `git diff HEAD -- 'assets/*.js' assets/critical.css config layout` rỗng; 0 file JS trong diff; 0 hex, rgb, hsl, 0 thuộc tính vật lý trong CSS mới.
- Chờ CI, chưa đạt cho tới khi có kết quả: `npx playwright test tests/e2e/ES1-T147.spec.ts -g "AC1-markup|AC4|nojs"` desktop + Pixel 7; nhóm nojs `/cart.js` 2 món quantity 1; TE-1.spec + TE-3.spec; axe 0 serious trên `/?view=te12` và `/`; 0 console error; `npx lhci autorun` từ 96 / 90 / 98; ảnh 360, 768, 1280; visual diff Figma.
- Chưa đạt: "không có band rỗng", chờ rebase PR #85, báo Orchestrator.
- Không kiểm được qua CI, cần xem tay trong editor: placeholder khi chưa chọn collection.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
