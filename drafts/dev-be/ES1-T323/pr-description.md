KHÔNG CHẮC: (1) Khi mở drawer, focus vào tiêu đề "Menu" theo `<modal-dialog>` (ADR 0007 #5), không vào nút đóng như navigation.md §6 ghi (đó là mô tả code cũ). Đã hỏi ES1-T471, mặc định giữ tiêu đề. (2) PR #228 (ES1-T329) chưa merge, cũng sửa `header-menu.js` và tạo `header-drawer.js`. Gộp thì `header-menu.js` lấy bản #228 (đã có cùng cách nạp lười), `header-drawer.js` lấy bản này (ES1-T471). (3) Spec chưa chạy (sandbox không có Chromium, PREVIEW_URL), chờ CI.

# ES1-T323 TE-1-R2-BE1: header-drawer.js (mới, 3 953 B ≤ 4 096, nạp lười khi chạm nút menu)

AC: TE-1 AC2 (drawer dưới 80rem: cấp 2 trượt, Back "Back to menu", focus Back, Back trả focus về mục vừa mở; không JS là accordion), TE-1 AC10 (hàng localization mở thành cấp 2 trong cùng drawer, có Back, không mở lớp thứ hai). Nguồn: navigation.md §2, §6; ADR 0007 #5, ADR 0010. Làm sau TE-1-R2-FE3 (#230, markup + CSS) và TE-10-R2-BE2 (#218, modal-dialog.js).

## Thay đổi
- `assets/header-drawer.js` (mới, 3 953 B): `<header-drawer>` nắm drawer theo hợp đồng `{% doc %}` của `blocks/header.liquid`.
  - Đợi `customElements.whenDefined("modal-dialog")` xong mới gắn `data-drawer-enhanced` lên header. Từ đó, bấm nút menu (click, Enter, Space) chạy `preventDefault`, mở `details.open = true` rồi gọi `<modal-dialog data-layer="menu">.open(summary)`. Esc, scrim, × (`.close-button`), khoá cuộn, trả focus về nút menu và focus tiêu đề đều do modal-dialog lo; file này không tự viết lại.
  - `modal:close`: chờ `dialog.getAnimations()` xong rồi mới gập mọi cấp 2 và `details`, để hiệu ứng trượt ra 250 ms vẫn chạy. Nếu mở lại trong lúc đang chờ thì bỏ qua bước gập. Lần mở sau luôn về cấp 1.
  - Cấp 2 (`details` có `[data-drawer-level]`, gồm cả hàng localization): khi `toggle` mở, mọi phần tử anh em từ panel cấp 2 lên tới `<dialog>` được gắn `inert` (cấp 1, đầu drawer, chân drawer), rồi focus vào `header-drawer-back`. Back gỡ `inert`, focus về summary vừa mở, gập cấp 2. × trong đầu cấp 2 đóng cả drawer (modal-dialog).
  - Tab vòng trong cấp đang hiện: lọc phần tử focus được, bỏ `[inert]` và `checkVisibility()` false. `showModal` tự nó không vòng (navigation.md §6, ES1-T16 TB-17).
  - Vuốt về mép mở > 80px, ngang nhiều hơn dọc thì đóng (RTL lật chiều; navigation.md §6 ĐỀ XUẤT, còn ngân sách nên làm).
  - Lên ≥ 80rem thì đóng và gập (`matchMedia` change).
  - Nạp lười: người dùng có thể đã mở `<details>` (bản CSS) trước khi module về. Lúc nâng cấp, file gập accordion đã mở rồi `open()` để thành modal.
  - `aria-expanded` đồng bộ cho mọi `<summary>` trong drawer (toggle bắt ở pha capture).
  - `disconnectedCallback` gỡ listener, gỡ `inert`, gỡ `data-drawer-enhanced`. Nhờ vậy khi theme editor render lại header, CSS quay về bản `<details>`.
- `assets/header-menu.js` (6 862 → 4 934 B): bỏ class `HeaderDrawer` và `mount("header-drawer")`. Thêm nạp lười `import(new URL("header-drawer.js", import.meta.url))` khi `pointerenter` / `focusin` / `touchstart` nút menu, giống cách `motion.js` nạp `motion-scrub.js` và giống PR #228. Nếu tải lỗi thì bỏ promise để lần chạm sau thử lại. Sync `aria-expanded` của drawer ngay lúc tải. Không thêm thẻ `<script>`. Phần mega và dropdown giữ nguyên (việc của ES1-T329).
- Không đổi Liquid, CSS, locale.
- Test:
  - `tests/e2e/ES1-T323.spec.ts` (mới) có 3 phần: tĩnh; hành vi trên fixture (origin giả `https://theme.test`, `page.route` phục vụ `assets/` thật nên kiểm được cả đường `import.meta.url`); storefront mobile.
  - `tests/e2e/ES1-T16.spec.ts`: TB-17 assert focus tiêu đề thay cho nút đóng. Test resize chờ `data-drawer-enhanced`. Bộ lọc console thêm `header-drawer`.
  - `tests/e2e/TE-1.spec.ts` TC-13: chờ `data-drawer-enhanced`; có JS thì về cấp 1 bằng Back, vì hàng cấp 1 đã inert và bị cấp 2 phủ.

## Ngân sách JS (`wc -c`)
| File | Trước | Sau | Trần | Nạp |
| --- | --- | --- | --- | --- |
| header-drawer.js | — | 3 953 | 4 096 | lười, khi chạm hoặc focus nút menu |
| header-menu.js | 6 862 | 4 934 | 8 192 file (ADR 0010: 3 072, ES1-T329) | header, tải sẵn |

- Chung mọi trang tải sẵn: standard-events 888 + motion 6 103 + page-layers 2 031 + modal-dialog 2 039 + header-menu 4 934 + header-sticky 1 680 + cart-drawer 3 868 = 21 543 B (trước 23 471, giảm 1 928).
- Trần chung ADR 0010 là 19 456, còn vượt vì header-menu (ES1-T329 đưa về 3 064 thì còn 19 673) và cart-drawer 3 868 > 3 072 (ES1-T98).
- Mobile sau khi chạm nút menu: 21 543 + 3 953 = 25 496 B, dưới 40 960 (ADR 0006).

## Cho FE (không sửa trong PR này)
- `blocks/header.liquid` `{% doc %}` dòng 36 ghi "JS ở assets/header-menu.js, assets/header-sticky.js". Khi chạm file, thêm `assets/header-drawer.js` (nạp lười từ header-menu.js).
- Nếu muốn mở drawer thì focus nút đóng (ES1-T471): thêm `autofocus` vào `header-drawer-close`, JS không cần đổi.

## Giới hạn đã biết
- Lần chạm đầu: module về sau khoảng 1 vòng mạng. Trong lúc đó drawer chạy bằng `<details>` + CSS (accordion, chưa có Back). Khi nâng cấp, drawer chạy lại hiệu ứng trượt vào 1 lần.
- Từ cấp 2 về cấp 1 bằng Back thì không có hiệu ứng ra; CSS chỉ có hiệu ứng vào cấp 2.
- `header-drawer.js` nạp qua `new URL(..., import.meta.url)` nên không có `?v=`. Cache theo CDN Shopify, giống `motion-scrub.js` và `scroll-extras.js`.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (25 warning có sẵn ở 10 file khác, không có file nào của PR).
- `wc -c`: header-drawer.js 3 953 ≤ 4 096; header-menu.js 4 934 ≤ 8 192. Không `console.*`, `fetch(`, `innerHTML`, `.style`, `showModal`, Esc tự viết trong header-drawer.js; guard `customElements.get`.
- Không thẻ `<script>` header-drawer.js trong `blocks/ snippets/ layout/ templates/`; không đổi locale JSON.
- `node --check`: sandbox chặn, chưa chạy. Playwright (ES1-T323, ES1-T16, TE-1), Lighthouse, console trên preview: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
