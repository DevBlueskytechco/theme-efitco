KHÔNG CHẮC: (1) chưa chạy Playwright, preview, Lighthouse (phiên BE không có trình duyệt, không gọi mạng): chờ CI. (2) JS tìm lưới bằng `fieldset` và panel bằng `[role=group]` trong `<bundle-form>`, vì doc của `blocks/bundle-builder.liquid` không có hook `data-*` riêng cho lưới, panel; FE muốn đổi markup thì giữ 2 phần tử này hoặc thêm hook và báo BE. (3) `--bundle-bar-height` đo bằng `offsetHeight` lúc thanh hiện và lúc ghi lỗi, không dùng ResizeObserver: ResizeObserver làm file vượt trần 7 168 B. Thanh chỉ đổi chiều cao khi có hoặc hết ô lỗi, nên đo 2 lúc đó là đủ (ui-spec ghi ResizeObserver là gợi ý, AC7 chỉ yêu cầu "chiều cao đo thật").

# ES1-T340 TE-12-R2-BE1: bundle-form.js, thanh dính bundle < 48rem

Ticket: ES1-T340 · story TE-12 · AC TE-12 AC1, AC3, AC6 (HB1), AC7 (HB2) · sau ES1-T339 (FE1, #294), ES1-T314 (page-layers)

## Thay đổi

`assets/bundle-form.js` (5 491 → 7 159 B, trần 7 168 B theo ADR 0010 "bundle-form (gồm bundle bar 360)"):
- Thanh dính (AC6, index-mobile-b.md §1.1): một IntersectionObserver cho lưới (`fieldset`) và panel (`[role=group]`), `rootMargin: 0px 0px -72px`, không nghe scroll. Thanh hiện khi lưới đang trong màn và mép trên panel còn dưới đỉnh thanh. Thanh ẩn khi lưới chưa vào màn, khi mép trên panel đã lên vùng trên thanh, hoặc khi đã cuộn qua hết khối. Từ 48rem không có thanh (`matchMedia`).
  - Thanh hiện: gỡ `hidden`, `inert = false`, gắn `html[data-bottom-bar="bundle"]`; CSS FE lo phần hiện và trượt (reduced motion do CSS). Thanh ẩn: `inert = true`, chỉ gỡ `data-bottom-bar` khi giá trị đang là `bundle`.
  - Focus đang ở trong thanh thì thanh vẫn hiện; `focusout` tính lại trạng thái.
  - Trang có 2 bundle (`?view=te12`): thanh nào hiện thì ẩn (`hidden`) thanh của bundle kia, mỗi lúc chỉ 1 thanh.
- Số món và tổng trên thanh (`data-bundle-bar-count`, `data-bundle-bar-total`) lấy từ cùng hàm `update()` với panel.
- 0 món: nút panel và nút thanh có `disabled` thật (CTO 21/11, comment ticket; AC6, AC8).
- Đang thêm: cả 2 nút cùng `disabled` và `aria-busy="true"`; khi xong thì gỡ (AC6).
- Nút thanh có `type=submit form=…` nên gửi cùng form của panel: cùng một handler `submit`, 1 POST `/cart/add.js` với `items[]` (AC3). `opener` trong `theme:cart:updated` là nút được bấm (`e.submitter`); cart-drawer.js mở drawer và refresh qua partial như cũ.
- Lỗi (AC6): `role="alert"` chỉ có chữ ở 1 nơi. Thanh đang hiện thì lỗi vào `data-bundle-bar-error`, thanh ẩn thì vào `data-bundle-error`. Thanh hiện, ẩn thì lỗi chuyển theo. Đổi lựa chọn hoặc bấm lại thì xoá lỗi.
- AC7 (HB2): lúc thanh hiện và lúc ghi lỗi, ghi chiều cao thật của thanh vào `--bundle-bar-height` trên `:root`. `base.css` dẫn biến này sang `--bottom-bar-height` cho toast, teaser và Inbox.
- `data-done` trên `data-bundle-progress-text` bật, tắt theo bậc cao nhất (theo doc block; trước đây chỉ Liquid in).
- Guard `customElements.get("bundle-form")`. `disconnectedCallback` huỷ listener, request, observer và gỡ `data-bottom-bar` (khi editor render lại block).
- Gỡ header `X-Requested-With` và `Accept` để file vừa trần; `/cart/add.js` vẫn nhận JSON qua `Content-Type` và trả JSON như cũ.

Tests:
- Thêm `tests/e2e/ES1-T340.spec.ts`, gồm:
  - Kiểm tĩnh: trần byte, hook thanh khớp markup, chỉ gắn `bundle`, 1 thẻ script.
  - 0 món: `toBeDisabled` cho nút panel và nút thanh.
  - Desktop không có thanh.
  - Mobile:
    - thanh ẩn lúc tải;
    - thanh hiện khi lưới vào màn, ẩn khi panel vào màn hoặc đã qua khối;
    - số món, tổng trên thanh khớp panel;
    - focus trong thanh thì thanh vẫn hiện;
    - `--bundle-bar-height` bằng chiều cao đo được;
    - dialog modal làm thanh ẩn;
    - 2 bundle thì chỉ 1 thanh.
  - Mock cart:
    - nút thanh gửi 1 POST, busy trên cả 2 nút, opener là nút thanh;
    - 422 khi thanh hiện: lỗi trong thanh, thanh cao lên;
    - 500 khi thanh ẩn: lỗi dưới panel.
  - Không JS: thanh không hiện.
- `tests/e2e/ES1-T149.spec.ts`: trần 5 504 → 7 168 B, ghi lý do ES1-T340 và ADR 0010.

Không sửa markup, CSS, locale (FE ES1-T339 đã có đủ hook).

## Ngân sách JS (ADR 0010)

| File | Trước | Sau | Trần |
| --- | --- | --- | --- |
| assets/bundle-form.js | 5 491 | 7 159 | 7 168 |

- Trang chủ, tải sẵn: không đổi, vì bundle-form nạp lười qua `data-lazy-module` + `lazy-module.js`, rootMargin 200px.
- Trang chủ, sau cuộn: +1 668 B. Ước ADR 0010 ≈ 48 651 đã tính bundle-form ở trần 7 168, nên vẫn ≤ 65 536.
- Trang khác không tải bundle-form.

## Tự kiểm tra

- `wc -c assets/bundle-form.js` = 7 159 ≤ 7 168 (≤ 8 192).
- `shopify theme check`: 0 lỗi; 8 warning có sẵn ở 3 file ngoài ticket.
- Grep file JS:
  - 0 `console.`, `innerHTML`, `import` tĩnh, `"scroll"`, `properties`/`attributes`/`discounts`;
  - đủ hook ES1-T149 (`("count"` … `("line-price"`) và hook thanh (`("bar"`, `("bar-count"`, `("bar-total"`, `("bar-submit"`, `("bar-error"`);
  - `this.emit(items)` đứng trước `cartAddUrl`.
- `blocks/bundle-builder.liquid` vẫn có đúng 1 thẻ `<script>` (lazy-module).
- `npx playwright test --list`: ES1-T340 + ES1-T149 parse được, tổng 84 test.
- Playwright trên preview, console error, Lighthouse desktop/mobile trang chủ: chờ CI.

## Cho QA (TE-17-R2-QA2, TE-10-R2-QA1)

- Thanh chỉ hiện sau khi cuộn tới lưới bundle ở < 48rem; lúc tải trang không hiện (CLS 0).
- Trên `?view=te12` có 2 bundle; spec dùng bundle đầu (`container-te12-bundle`).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
