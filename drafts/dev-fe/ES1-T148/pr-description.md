KHÔNG CHẮC: (1) chưa render lần nào: không có preview, spec chưa chạy, chưa type-check; toàn bộ CSS, bố cục và số đo chưa được nhìn trên trình duyệt. (2) Thêm 15 setting ngoài "8 + 1" của ticket (6 bậc, ghi chú, 8 toạ độ hotspot): ES1-T212. (3) Bậc mặc định 4 món 10% theo mặc định ES1-T199 #2 và home-content.md 3.5, CTO chưa trả lời. (4) Hotspot dưới 64rem và mapping hotspot với row là mặc định của dev: ES1-T174 không có ghi chú cho hàng này, ES1-T211. (5) Toạ độ 4 hotspot làm tròn về số nguyên phần trăm, lệch tới 0,5% (khoảng 5 px ở 1920). (6) Form POST `id[]` nhiều input hidden chưa kiểm trên store; ES1-T169 D3 còn ghi nguyên nhân nojs của T147 chưa rõ.

# ES1-T148 TE-12-FE2: shop the look + row, dòng giảm, 4 hotspot, viền chọn (hàng 7, 1:560)

AC: TE-12 AC5 (markup), AC4 cho row, AC-H19, AC-H20 phần markup. Gộp TE-12-FE3. Không có JS: tổng, dòng giảm và tương tác hotspot chờ ES1-T149.

## Thay đổi

`blocks/shop-the-look` (mới):
- Root `bundle-form`, form POST `routes.cart_add_url`, data-* theo D11, có `data-tiers`.
- 8 setting ticket: eyebrow, heading, link_label, link_url, image, note_title, note_text, note_icon. Copy Figma là default trong schema, cùng cách bundle-builder.
- Thêm 6 setting bậc + `discount_note` cùng tên với bundle-builder, 8 range `hotspot_n_x`, `hotspot_n_y`.
- Thân rỗng: storefront không render, editor hiện placeholder. Band `home-shop-the-look` cũng biến mất.
- Ảnh trống: không có khung, không hotspot, danh sách rộng hết. Note title và text trống: ẩn cả ô. Icon trống: ẩn icon.
- Panel: số món + subtotal, dòng giảm, Total, ghi chú giảm giá, nút Add Setup To Cart, status, alert. Không có progress (1:560 không có).
- Hết hàng toàn bộ: CSS ẩn cả panel, gồm nút.

`blocks/shop-the-look-row` (mới): 1 setting product. Ảnh, tên là link, `snippets/price` với variant mặc định, input hidden `id[]` + `data-bundle-item`, `data-title`, `data-price`. Sold out: badge `products.card.sold_out`, không có input. Trống: editor placeholder, storefront không render.

`assets/base.css`: khối `.shop-the-look*`. Dưới 64rem 1 cột ảnh trên, từ 64rem 936fr + 456fr. Hotspot vùng bấm 44, chấm 20, đang chọn chấm 16 + vòng 24. Vị trí hotspot không lật theo RTL vì tính trên ảnh. Không JS: ẩn hotspot, bỏ viền chọn, ẩn số liệu.

`templates/index.liquid`: `home-shop-the-look` + 4 row, đặt giữa `home-quiz` và `home-inspiration`.
`templates/index.figma.liquid`: cùng vị trí; row lấy từ `figma-setup`, thiếu thì `collections.all`; thêm `data-setup` vào `figma-meta`. Ảnh, icon là ảnh sản phẩm, vùng ảnh che khi so.
`templates/index.te12.liquid`: thêm `te12-look` (6 row, 1 hết hàng), `te12-look-single` (1 row, không ảnh, không note), `te12-look-sold-out`, `te12-look-partial` (2 row, không bậc).

## Hook cho ES1-T149

Đã comment ES1-T149. Root và panel theo D11, thêm `data-bundle-subtotal`, `data-bundle-discount-row`, `data-bundle-discount-label`, `data-bundle-discount`. Không có `data-bundle-lines`, `data-bundle-empty`, progress, `data-label-progress*`.
- Hotspot: `button[data-hotspot="1..4"]`, ngoài form, trong root. Trạng thái: `aria-pressed`.
- Row: `li[data-look-row="1..6"]`. Trạng thái: `data-look-active`. Server render sẵn hotspot 1, row 1 đang chọn.
- `data-lazy-module` và thẻ script do ES1-T149 thêm.

Testid: 26, gồm đủ 19 của D11, thêm 7: `shop-the-look-hotspot`, `-panel`, `-subtotal`, `-discount-row`, `-discount`, `-discount-note`, `-row-placeholder`. `shop-the-look-note` là ô Fits, ghi chú giảm giá là `-discount-note`.

## Hàng Theme map cho AGENTS.md

Scope-guard chặn dev-fe ghi AGENTS.md. Orchestrator thêm vào bảng Blocks:

```
| `shop-the-look` | Image with hotspots, Fits note, product rows, totals panel; add many products in one form. |
| `shop-the-look-row` | One product row of `shop-the-look`: image, title, price, hidden variant input, Sold out badge. |
```

## Khác ticket

- Comment Tech Lead thắng body: có `data-tiers`, dòng giảm, hotspot, viền chọn.
- Đặt trước `home-inspiration`, không sát `home-bundle-builder`: inventory hàng 7 y 4027, hàng 8 y 5125. Vẫn đúng "trước home-bundle-builder".
- Ô Fits chữ phụ `--color-muted` #4D4D4D, 6.81:1 trên sand theo DESIGN.md. Dòng giảm dùng chữ sáng + dấu trừ, không xanh (ES1-T145 #4).
- Nền panel `--color-background-panel` (ES1-T183). Chữ phụ pha 60%, 5.28:1, cùng công thức bundle.
- Icon Fits giữ image_picker theo ES1-T145 #7: `/` mới cài không có icon và vòng tròn trắng. Danh sách ảnh ES1-T174 không có 1:576, 1:578.
- Ghi chú giảm giá không có trong Figma: cột phải cao hơn khoảng 45 px ở 1920, ảnh kéo theo (ước lượng, chưa đo). Chờ sổ chênh lệch ES1-T197.

## Giới hạn còn lại

- Chưa có `assets/bundle-form.js`: số món, subtotal, dòng giảm, Total chưa hiện; hover, bấm hotspot chưa có tác dụng. Hotspot vẫn hiện khi có JS mà module chưa nạp.
- Tối đa 6 row do số dòng gọi trong template; `/` gọi 4, thêm row phải sửa template.
- Row 5, 6 không có hotspot. Merchant đổi ảnh phải tự chỉnh 8 toạ độ, không có nút tắt hotspot.
- `/` không có shop the look tới khi chọn sản phẩm (D1). Lighthouse trên `/` không đo được block này.

## Việc của Orchestrator trước khi push

Scope-guard chặn dev-fe ghi `tests/`, `AGENTS.md`:

```
cp drafts/dev-fe/ES1-T148/ES1-T148.spec.ts tests/e2e/ES1-T148.spec.ts
```

Thêm 2 hàng Theme map ở trên vào `AGENTS.md`.

## Tự kiểm tra

Đã chạy:
- `shopify theme check`: 94 file, 0 lỗi; `.theme-check.yml` không đổi.
- Script: locale 0 khoá trùng, mọi `t:` và `| t` của 2 block có khoá; schema không trùng id; khối CSS mới không có property vật lý; màu literal chỉ có 2 mã trong comment, đã bỏ tay, không chạy lại script. Script đã xoá.
- `git diff`: `assets/*.js`, `assets/critical.css` không đổi; `critical.css` 9921 B. Không file JS trong diff.

Chưa chạy, chưa đạt DoD (CTO 06/11, `RUN_STORE_TESTS=false`, spec viết kèm chưa chạy trên CI):
- `npx playwright test tests/e2e/ES1-T148.spec.ts`, TE-1, TE-3, ES1-T147.
- `tests/e2e/ES1-T176.spec.ts` hàng 7: file chưa có, T176 làm cuối.
- axe, console, `npx lhci autorun`.
- Ảnh 360, 768, 1280: chờ CI preview.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
