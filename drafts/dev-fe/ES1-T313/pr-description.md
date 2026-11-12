KHÔNG CHẮC: (1) hook scope-guard chặn dev-fe ghi AGENTS.md, nên bảng Snippets chưa có 2 dòng `empty-state`, `status-icon` (nội dung đề xuất ở cuối, Tech Lead thêm giúp); (2) 6 test trình duyệt trong tests/e2e/ES1-T313.spec.ts chưa chạy được ở máy local vì sandbox chặn Chromium, chờ CI; (3) base.css sau PR gzip 47 310 B, còn 1 842 B tới trần 49 152 cho các task CSS Sprint 2–4, cần TE-10-R2-FE3 rà CSS chết sớm hoặc các task màn xoá CSS cũ khi chuyển sang khung chung.

# TE-10-R2-FE2 (ES1-T313): khung lớp và trạng thái chung

AC: foundation §2, §6, §15–§18; SRS TE-10 AC11 (toast), AC12 (dialog, drawer, sheet, nút đóng 48), AC13 (skeleton, empty, lỗi khối); AC-H7 (focus ring, hover của control mới). Sau TE-10-R2-FE1 (#188, đã merge).

## Thay đổi

`assets/base.css`, mục mới "Khung lớp và trạng thái chung" (ngay sau mục lớp và dải đáy của FE1):
- Giá trị dẫn xuất trong `:root` (foundation §2, không phải token merchant): `--overlay-scrim` (dark 50%), `--shadow-raised`, `--shadow-overlay`, `--radius-dialog` (= card × 2), `--panel-muted` (trắng 70% trên panel, 6.56:1), `--panel-saving` (badge-new 50% + trắng, 5.64:1), kích thước `--dialog-s|m|l` (480/720/1120), `--dialog-max-block` (860), `--drawer-m|l` (420/480), `--empty-state-max` (512), `--close-button-size` (space-1 × 12 = 48), `--round-button-size` (× 13 = 52).
- `.dialog` + `.dialog--m|l`: mobile-first bottom sheet (rộng 100%, cao ≤ 88dvh, bo 2 góc trên, thanh kéo 40 × 4 bằng `::before`), từ 48rem giữa màn, cao ≤ min(860, 100dvh − 48), padding 32 → 48 từ 80rem. `__header`, `__title`, `__close` (cách góc 12 → 24), `__body` cuộn riêng (`overscroll-behavior: contain`), `__footer` (gạch trên, nút xếp dọc < 48rem, nằm phải từ 48rem). Scrim `::backdrop` = `--overlay-scrim`.
- `.drawer` + `.drawer--end`, `.drawer--wide`: 90% / 420 từ 48rem / 480 từ 80rem (wide: cart, search), header 72 + `.close-button` cách mép 12, thân cuộn riêng, chân là flex item nên focus trong thân không nằm dưới chân (TE-10 AC9). RTL: hướng trượt đảo bằng `:dir(rtl)`.
- `.close-button` 48 (icon 20, trắng viền border, rê chuột nền foreground) và `.round-button` 52 (tách từ `.carousel-nav__button`: trắng viền border, rê chuột accent, focus accent offset 3, `:disabled`/`aria-disabled` mờ 0.35, `[hidden]` ẩn trừ trong `.carousel-nav` giữ chỗ mờ như cũ).
- `.toast` + `--info|success|warning|error`: thanh màu 4px inline-start (muted / badge-new / accent / sale), icon 20, tiêu đề 16/600, mô tả 14 muted, nút đóng 44, nền trắng viền border bóng raised. `[data-closing]` mờ dần cho BE.
- `.alert` (lỗi khối): viền 1px sale, bo 12, icon 24 sale, tiêu đề 16/600, câu 14 muted, hàng nút.
- `.empty-state`: giữa, ≤ 512, icon 32 trong tròn 72 nền alt, heading cỡ h3, 1 câu muted, nút primary + text link phụ (44, gạch chân, rê chuột accent).
- `.skeleton`, `--media` (1:1), `--line` (cao 14), `--short` (40%), `.skeleton-card`; `.spinner` 24. Shimmer bằng `translate` trên `::after`, nhịp `--motion-hero`; giảm chuyển động thì đứng yên, không làm mờ chữ.
- Chuyển động (chỉ trong `prefers-reduced-motion: no-preference`): dialog fade + nhấc 24 + scale 0.97, sheet trượt từ đáy, drawer trượt từ mép, scrim fade (`@starting-style`, `overlay`/`display` allow-discrete); toast vào 8px; nút tròn hover 1.06, active 0.94. Chỉ transform/opacity.
- Xoá CSS cũ phần thay: kiểu riêng `.carousel-nav__button` (màu, kích thước, hover, focus, transition, `[hidden]`) chuyển sang `.round-button`.

`snippets/carousel-nav.liquid`: 2 nút thêm class `round-button`, giữ `carousel-nav__button*`, `data-scroll-prev|next`, testid.

`snippets/empty-state.liquid` (mới): `kind: 'empty'` (mặc định) hoặc `'error'` (`.alert`, `role="alert"`, nút secondary "Try Again"). Chuỗi do caller truyền đã qua `| t`, URL qua `routes.*`; nút empty chỉ hiện khi có cả nhãn và đích. Kiểu lỗi không có `button_url` thì là `<button data-retry>` cho script tính năng chạy lại; có `button_url` thì là link (chạy không JS, ví dụ `?view=quiz`). `heading_tag` h2/h3 để giữ thứ tự heading. Testid: `{testid}`, `-heading`, `-button`, `-link`.

`snippets/status-icon.liquid` (mới): icon trang trí `aria-hidden`, `currentColor`: info, success, warning, error, cart, search, box.

`layout/theme.liquid`: `<template data-testid="toast-template">` ngay sau `.toast-region`, 4 toast `[data-toast="info|success|warning|error"]`, role `status` (info, success) / `alert` (warning, error), icon theo loại, nút `close-button toast__close` `[data-toast-dismiss]` có chữ ẩn "Dismiss: " + `[data-toast-dismiss-title]`.

`locales/en.default.json`: nhóm mới `general` (`dismiss` "Dismiss:", `try_again` "Try Again"); không trùng nhóm có sẵn.

## Hợp đồng cho BE

- Lớp modal: `<modal-dialog data-layer="<tên>" data-sheet-below="48rem"><dialog class="dialog dialog--s|m|l" aria-labelledby="…">` hoặc `<dialog class="drawer [drawer--end] [drawer--wide]">`; `modal-dialog { display: contents }`. Mở/đóng, Esc, scrim, vuốt sheet, trả focus: `assets/modal-dialog.js` (TE-10-R2-BE2). CSS chỉ đọc `[open]`, không cần class trạng thái.
- Toast: clone `template[data-testid="toast-template"]` > `[data-toast="<loại>"]`, điền `[data-toast-title]`, `[data-toast-text]` (bỏ `hidden` khi có mô tả), chép tiêu đề vào `[data-toast-dismiss-title]`, chèn vào `.toast-region`; `[data-toast-dismiss]` gỡ; gắn `data-closing` trước khi gỡ để mờ dần (150 ms). Tự ẩn 6 s cho info/success, dừng khi hover/focus; tối đa 3.
- Lỗi khối: `[data-retry]` trong `.alert` là nút chạy lại.
- Đang tải: vùng `aria-busy="true"` + dòng `role="status"`; skeleton là markup tĩnh của từng màn.

## Ngoài phạm vi (task khác dùng lại khung này)

`--panel-muted`/`--panel-saving` mới khai báo; đổi `--bundle-panel-muted`, `--look-panel-muted` (60%) sang `--panel-muted` thuộc TE-12-R2-FE1, TE-17-R2-FE2. `.quiz__dialog*`, `.cart-drawer__dialog`, `.collection-filters__drawer`, `.product-media__dialog`, `.predictive-search-dialog` chuyển sang `.dialog`/`.drawer`/`.close-button` trong task màn của chúng (TE-11-R2-FE1, TE-5-R2-FE1, TE-6-R2-FE3, TE-4, TE-8), xoá CSS cũ trong cùng PR đó. `.slideshow__arrow`, `.collection-list__button` giữ nguyên (TE-2-R2-FE1, TE-7-R2-FE1). `empty-state` chưa có caller nên Theme Check báo OrphanedSnippet (warning); caller đầu tiên: cart drawer, collection, search, quiz.

Đề xuất 2 dòng cho bảng Snippets trong AGENTS.md (dev-fe bị chặn ghi):
- `empty-state` | Shared empty state (icon in 72 circle, heading, sentence, primary button) and error block (`kind: 'error'`, `role="alert"`, "Try Again").
- `status-icon` | Decorative status icons for toasts, alerts and empty states (info, success, warning, error, cart, search, box).

## Tự kiểm tra

- `shopify theme check`: 0 lỗi, 23 warning (22 có sẵn + 1 OrphanedSnippet `empty-state`, chờ caller).
- `gzip -c assets/base.css | wc -c`: 43 687 → 47 310 B (≤ 49 152). `wc -c assets/critical.css`: 10 067 B, không đổi.
- `grep -nE "z-index:\s*-?[0-9]" assets/*.css`: 0 dòng. Mục CSS mới: 0 màu literal, 0 thuộc tính vật lý, 0 `width`/`height`, bo góc chỉ qua `var(--radius-*)`.
- Không file JS trong diff.
- `tests/e2e/ES1-T313.spec.ts`: TC-01–TC-04 (đọc file) đạt ở local với `--config=drafts/dev-fe/ES1-T313/pw.static.config.ts`. TC-05–TC-10 (fixture `setContent` với base.css + critical.css thật: kích thước 360/768/1280, mờ 0.35, viền alert, skeleton 1:1/40%, giảm chuyển động) chờ CI vì sandbox local chặn Chromium.
- Preview, Playwright đủ bộ, Lighthouse (desktop/mobile), ảnh 3 breakpoint: chờ CI. PR không đổi markup hiển thị trừ class `round-button` trên nút hàng cuộn (giá trị cũ giữ nguyên: 52, trắng, viền #E5E5E5 = `--color-border`, hover accent), nên không dự kiến lệch visual diff trang chủ.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
