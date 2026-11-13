KHÔNG CHẮC: (1) 2 hook mới data-mega-enhanced, data-mega-instant chưa có trong task-split §4, hỏi Tech Lead ES1-T450; (2) kiểu B dựng ô chữ (tên + số sản phẩm), ảnh ô + setting menu_collection_images để TE-22-R2-FE3 (ES1-T328), cũng hỏi ở ES1-T450; (3) nav từ 80rem đổi absolute → lưới, toạ độ tính lại bằng nhau (x = 50% − 303, y = 26), pixel thật chờ CI visual diff ES1-T176 hàng 1.

# ES1-T327 TE-22-R2-FE2: mega menu từ 80rem, menu 3 cấp

AC: TE-22 AC1 (phần markup/CSS), AC2 (A, B khung, C), AC3, AC6, AC7; TE-1 AC2 từ 80rem → TE-22; R4.8. Nguồn: docs/ui-spec/navigation.md §2, §3, §5.1, §6–§8, §10; task-split ES1-T307 §4, §6.2.

## Thay đổi

blocks/header.liquid
- Kiểu panel theo dữ liệu menu, không setting: có con có cấp 3 → `data-mega="columns"` (A); mọi con là `collection_link`, không cấp 3 → `data-mega="tiles"` (B); còn lại dropdown C giữ `ul.site-header__submenu`.
- A: cột 1 = "View all …" + con không có cấp 3 + nhóm đầu; mỗi nhóm sau 1 cột. Tiêu đề cột là link (không `<h*>`), `ul aria-labelledby` trỏ tiêu đề.
- B: tiêu đề panel `<p>` + "View all …" + ô collection (tên, "N Products" dùng lại `blocks.level_card.products_count`).
- "View all …" theo `link.type`: catalog → "View all products", collections → "View all collections", còn lại "View all {title}" (AC3).
- Summary mục mega: `data-layer="mega"` (lớp không modal, page-layers đếm qua aria-expanded), scrim `<span data-testid="header-scrim">` trong summary để không JS bấm là đóng.
- Drawer < 80rem: thêm cấp 3 dạng danh sách lồng trong accordion (AC4 phần không JS, link cấp 3 có trong HTML). Trượt + Back + "View all" ở drawer là TE-1-R2-FE3.
- `{% doc %}` ghi hook cho BE.

snippets/header-mega-group.liquid (mới): tiêu đề cột + danh sách cấp 3, dùng 2 chỗ trong cột A.

assets/base.css
- Khối "Mega menu từ 80rem": panel absolute full bề ngang dưới đáy header, nội dung theo `--content-grid` (1240/1416), padding 40/48, viền trên `--color-border`, `--shadow-raised`, cao tối đa `100dvh − --header-height`, cuộn riêng; A 4 cột (cột 5 xuống hàng), gap 32; B 5 ô mỗi hàng; link cao 40, tiêu đề cột 14/600 uppercase muted; trang hiện tại 600 + gạch 2px; hover accent.
- Scrim `--overlay-scrim` từ đáy header; có JS pointer-events none tới khi BE gắn `data-mega-enhanced`; `@media (scripting: none)` nhận bấm.
- Chuyển động trong `prefers-reduced-motion: no-preference`: panel `motion-drop` 250, scrim opacity (dùng lại keyframe `cart-drawer-backdrop-in`), link dịch 4 (RTL đảo), `data-mega-instant` tắt hiệu ứng khi đổi panel.
- Tinh chỉnh Figma header: nav đặt bằng lưới `calc(50% − 303px) auto 1fr` + margin đầu (80 − 28)/2 thay `position: absolute; top: 26px`; `top: 1px` của 4 mục đầu đổi thành `margin-block-start: 1px` trên mục cấp 1. Lý do: panel và scrim cần neo vào container header (full bề ngang), không tổ tiên nào được định vị.

assets/critical.css: `.site-header__submenu` → `ul.site-header__submenu` (vùng nội dung mega mang class này cho spec cũ).

locales/en.default.json: `blocks.header.view_all`, `view_all_collections`, `view_all_products` (gộp vào key `blocks.header` có sẵn).

## Hợp đồng cho BE (TE-22-R2-BE1, ES1-T329)

| Hook | Ở đâu | Ghi chú |
| --- | --- | --- |
| `data-mega="columns\|tiles"` | `<details>` cấp 1 | không có = dropdown C |
| `data-layer="mega"` + `aria-expanded` | `<summary>` mục mega | aria-controls → `HeaderSubmenu-N` |
| `header-mega-panel` | panel full bề ngang | |
| `header-mega-column` | cột A | |
| `header-scrim` | span trong summary | bấm = toggle summary khi không JS |
| `data-mega-enhanced` | root `.site-header` | BE gắn khi tự xử lý bấm scrim + rời panel → scrim nhận chuột (ES1-T450) |
| `data-mega-instant` | root `.site-header` | BE gắn khi đổi panel giữa 2 mục cha, gỡ sau (ES1-T450) |

Giữ `data-testid="header-submenu"`, `id="HeaderSubmenu-N"`, class `site-header__submenu` trên vùng nội dung mega để TE-1 TC-06/07/09, ES1-T16, ES1-T235 không đổi. header-menu.js hiện tại chạy được với markup mới (details trong nav, hover theo `header-menu-item`).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (23 warning có sẵn ở file khác, không file nào của PR).
- `wc -c assets/critical.css` 10 014 ≤ 10 240; `gzip -c assets/base.css | wc -c` 48 894 ≤ 49 152.
- Diff CSS: 0 literal màu, 0 z-index, 0 thời gian rời, chỉ logical property; px chỉ ở dòng tinh chỉnh Figma có sẵn (303). Không file JS trong diff.
- Không handle `figma-*`, không setting mới (setting ảnh/sản phẩm nổi bật là FE3).
- Preview, Playwright (smoke, TE-1, ES1-T16, ES1-T176, ES1-T235), Lighthouse desktop/mobile, ảnh 360/768/1280/1920: chờ CI.
- Spec e2e mega (A/B/C, bàn phím, scrim): TE-22-R2-QA1 (ES1-T330); cần store dev có menu 3 cấp (ES1-T298), chưa có thì test A skip vì thiếu dữ liệu.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
