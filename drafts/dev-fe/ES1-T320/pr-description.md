KHÔNG CHẮC: base.css lớn hơn develop (+4 457 B thô; gzip chưa đo được trong sandbox, ước +1,1 KB) — trái comment CTO 14/11. CSS drawer cũ đã xoá hết, không còn CSS header < 80rem nào khác do task này thay. Hỏi Tech Lead ở ES1-T461.

# ES1-T320 · TE-1-R2-FE3: drawer menu dưới 80rem

AC: TE-1 AC2 (dưới 80rem), AC3, AC10 (drawer). Nguồn: task-split ES1-T307 §4 hợp đồng TE-1-R2-FE3 / TE-1-R2-BE1, §6.1; navigation.md §5.2, §5.3; localization.md §4.4.

## Thay đổi
- `blocks/header.liquid`: drawer là `<modal-dialog data-layer="menu"><dialog class="drawer" aria-labelledby>` (khung `.drawer` TE-10-R2-FE2, 90% / 420). Đầu 72: tiêu đề "Menu" + `.close-button` 48. Hàng cấp 1 cao 52. Mục có con là `<details>` → panel cấp 2 `data-drawer-level="2"`, `role="group"`, "View all …" ở đầu, nhóm cấp 3 (tiêu đề nhóm là link, không `<h*>`). Chân drawer: `<shopify-account>` (Sign In) + hàng localization gộp "cờ + USD / EN ›" (chỉ phần có > 1 mục), cấp 2 localization trong `{% form 'localization' %}`, mỗi nước/ngôn ngữ là nút submit nên đổi được khi không JS, mục hiện tại `aria-current` + ✓.
- `snippets/header-drawer-head.liquid` (mới): đầu cấp 2 (Back 44, tên "Back to menu"; × 48; tiêu đề `<p>`), `hidden` tới khi BE gắn `data-drawer-enhanced`.
- `assets/base.css`: thay toàn bộ CSS drawer cũ. Không JS: summary là scrim, dialog hiện bằng CSS, cấp 2 accordion tại chỗ. `[data-drawer-enhanced]`: cấp 2 phủ cả drawer, trượt vào (`translate`, trong `prefers-reduced-motion: no-preference`), chevron xoay theo hướng, RTL bằng `:dir(rtl)`. Gộp `.site-header__mega-title` và `aria-current` với mega (bỏ bản trùng trong media 80rem). 0 literal màu, z-index qua `--layer-*`.
- `assets/critical.css`: selector focus đổi `.site-header__drawer-panel` → `.drawer` (+0 B net, 9 995 B ≤ 10 240).
- `locales/en.default.json`: `blocks.header.back`, `back_label`, `menu_title`, `sign_in`; `blocks.footer.localization_title`. Gộp vào key có sẵn, không trùng.

## Hợp đồng cho BE (TE-1-R2-BE1, `assets/header-drawer.js`)
- Host `<header-drawer hidden>` giữ nguyên; `header-menu.js` hiện tại vẫn chạy với chế độ dự phòng (details + `header-drawer-close`).
- Gắn `data-drawer-enhanced` lên `.site-header` khi nắm drawer; mở: `details.open = true` + `<modal-dialog data-layer="menu">` open, trả focus `#HeaderDrawerToggle` (`data-return-focus`).
- testid: `header-drawer`, `header-drawer-toggle`, `header-drawer-close`, `header-drawer-accordion-toggle`, `header-drawer-submenu`, `header-drawer-level`, `header-drawer-back`, `header-drawer-localization`, `header-drawer-account`, `header-drawer-country-option`, `header-drawer-language-option`. `header-drawer-promo` để TE-22-R2-FE3.
- Back: đóng `<details>` cha của level, focus về summary vừa mở. × trong đầu cấp 2 là `.close-button` → modal-dialog tự đóng; đóng thì đóng mọi cấp 2.

## Kích thước
- base.css: develop 272 729 B → 277 186 B thô (+4 457). Gzip trước/sau: chưa đo được (sandbox chặn gzip/node/python), chờ CI; develop đã 50 731 B gzip > 49 152 (ES1-T454).
- critical.css: 9 995 B.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 23 cảnh báo có sẵn ở file khác, 0 ở file của PR.
- Không file JS trong diff. Không setting mới.
- Test tĩnh/e2e hiện có bám testid drawer (TE-1.spec, ES1-T16.spec): testid giữ nguyên.
- Preview, Playwright, Lighthouse (desktop/mobile), ảnh 360/768/1280: chờ CI.
- Trạng thái: không menu → drawer không render (has_menu); không localization > 1 và tắt tài khoản → không có chân drawer.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
