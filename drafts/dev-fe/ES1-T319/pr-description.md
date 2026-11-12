KHÔNG CHẮC: (1) 5 test e2e cũ khẳng định header trong suốt/nền sáng/ngưỡng sentinel 80px sẽ đỏ sau PR: tests/e2e/TE-1.spec.ts TC-41, TC-42; tests/e2e/ES1-T16.spec.ts "ngưỡng đúng 80px", "trên hero: trong suốt", "lỗi mạng header-sticky.js: header trên hero không sticky". Ngoài vai FE, đã hỏi Tech Lead ES1-T439 (QA sửa trước merge hay chấp nhận đỏ tới ES1-T325). (2) Sentinel 1px theo announcement-bar.md §4 + task-split: không có bar thì bóng hiện ngay khi cuộn > 1px (header dính từ 0), AC9 "quá 80px có bóng" vẫn đúng; xác nhận ở ES1-T439 câu 2. (3) Chuỗi skip link thêm vào `locales/en.default.json` (`blocks.header.skip_to_content`) dù task-split chỉ ghi `en.default.schema.json`: AGENTS bắt chuỗi storefront qua `| t`. (4) `blocks/slideshow.liquid` `{% doc %}` còn nhắc `data-header-overlay` (chỉ chú thích, markup không gắn hook): file của TE-2-R2-FE1, để task đó sửa.

# ES1-T319 · TE-1-R2-FE1: header tối mọi trang, announcement bar AN1/AN2, skip link, sentinel 1px

AC: TE-1 AC4, AC9, AC-H29, TE-2 AC6 (+ phần skip link, focus trắng của TE-1 AC14). Nguồn: task-split ES1-T307 D8 + §6 TE-1-R2-FE1, `docs/ui-spec/announcement-bar.md`, `docs/ui-spec/foundation.md` §2, §3.

## Thay đổi

`assets/critical.css`
- Header tối mọi trang (D8): `.site-header` `--header-background/foreground/on-foreground` = `--color-background-dark(-foreground)`, nền `var(--header-background) url('noise-dark.png')` (Figma 1:362). Bỏ 3 rule `body:has(main > :first-child [data-header-overlay])` (margin âm, không sticky khi chưa JS, nền trong suốt): header luôn trong luồng, hero/banner nằm dưới đáy header (AC-H29, TE-2 AC6).
- Focus trên thanh tối: `.site-header :focus-visible` outline `--header-foreground` (trắng); trong submenu trắng và drawer panel giữ `currentcolor`.
- Đã dính `[data-scrolled]`: chỉ thêm bóng `0 1px --space-2` foreground 24% (foundation §3.2); transition chỉ `box-shadow` `--motion-base --ease-out` (bỏ `0.2s` literal và transition nền/chữ).
- Sentinel `.header-sticky-sentinel`: 1px trong luồng, `margin-block-end: -1px` (0 CLS), thay khối absolute cao 80.
- Announcement bar (AN1/AN2): nền dark + noise liền header, gạch đáy 1px trắng 12% `color-mix`, chữ 14/500 lh 20, padding `--space-3` → cao 44; link cả câu `inline-block` padding/margin âm `--space-3` = vùng chạm 44 không tăng bar; gạch chân 1px → 2px khi hover; focus trắng offset −2 trong bar; mũi tên 16px cách `--space-2`, `vertical-align: middle` (xuống dòng theo chữ cuối).
- Skip link `.skip-link`: ẩn bằng `clip-path` khi không focus, hiện nền dark chữ trắng, `z-index: var(--layer-toast)`, logical inset.
- Chuyển CSS drawer (`.site-header__drawer*`, 57 dòng, không đổi nội dung) sang base.css để giữ trần 10 240 B; panel chỉ hiện khi mở.

`assets/base.css`
- Xoá `body:has(.slideshow):not(:has([data-header-overlay])) .site-header` (2 rule, `--figma-1a1a1a`).
- Menu ≥ 80rem bỏ điều kiện `body:has(.slideshow)`: mặc định `color-mix(dark-foreground 60%, dark)` (#A3A3A3, 6.93:1), hover / mở / `aria-current="page"` = `--color-background-dark-foreground`; không còn `--figma-white-60/ffffff` ở header.
- `aria-current="page"`: gạch chân 2px offset 0.45em (cũ 1px 0.3em) — không chỉ bằng màu.
- Nhận khối drawer từ critical.css (sau `.site-header__placeholder`); `.site-header__placeholder` (chỉ editor) `--color-muted-light` → `--color-muted-on-dark` (6.11:1 trên dark).
- Hover mũi tên bar: `translate --space-1` (4px), RTL âm, `:active` về 0, `--motion-fast --ease-out`, trong `prefers-reduced-motion: no-preference`; specificity thắng rule chung `html[data-motion] a:hover > .slideshow-icon--arrow` (3px, không lật RTL). Placeholder editor của bar chuyển xuống base.css.

`blocks/announcement-bar.liquid`: thêm `{% render 'slideshow-icon', name: 'arrow' %}` (aria-hidden, lật RTL bằng rule có sẵn) cuối link; `{% doc %}` ghi hành vi AN1/AN2. Không đổi setting, testid.

`blocks/header.liquid`: chỉ `{% doc %}` — bỏ mô tả `data-header-overlay`/chế độ trong suốt, sentinel 1px, `data-header-enhanced` còn do JS gắn nhưng CSS không đọc. Không đổi markup, không đụng thẻ script.

`layout/theme.liquid`: `<a class="skip-link" href="#MainContent" data-testid="skip-link">` ngay sau `<page-layers>`, trước container announcement bar; sentinel chuyển xuống giữa container bar và container header; `<main id="MainContent">`.

`locales/en.default.json`: `blocks.header.skip_to_content` "Skip to content" (gộp vào `blocks.header`).
`locales/en.default.schema.json`: `info.announcement_text` theo spec §2; `info.sticky_header` thêm "The announcement bar scrolls away."

## Cho BE / QA

- BE (`assets/header-sticky.js`, không sửa ở đây): sentinel vẫn `data-testid="header-sticky-sentinel"`, chỉ đổi vị trí/cao; logic IntersectionObserver giữ nguyên. Chú thích đầu file ("sentinel 80px", "header trong suốt") và `data-header-enhanced` đã lỗi thời, dọn khi BE chạm file.
- QA ES1-T325: testid mới `skip-link`. Bar: `announcement-bar`, `announcement-bar-link`, `announcement-bar-placeholder` giữ nguyên. Đo: bar ≥ 44 ở 4 mốc, link cao 44, bar cuộn đi, header top 0 khi đã cuộn qua bar; header nền `rgb(26, 26, 26)` + noise ở `/`, `/collections/all`, `/cart`, `/search`; Tab đầu tiên = skip link.

## Tự kiểm tra

- `shopify theme check`: 0 lỗi; 22 warning có sẵn ở 7 file không sửa (giống ES1-T312).
- `wc -c assets/critical.css`: 9 917 B ≤ 10 240 (trước 10 067). `gzip -c assets/base.css | wc -c`: 44 240 B ≤ 49 152 (trước 43 696).
- `grep -n "header-overlay\|body:has(.slideshow)" assets/*.css`: chỉ còn `body:has(.slideshow) { background }` của trang chủ 80rem (không phải header, phần TE-2/TE-17).
- Diff CSS: 0 màu literal, 0 z-index số, 0 thời gian rời, 0 thuộc tính vật lý; chỉ 1px/2px cho viền, gạch, outline.
- Không file JS trong diff; không sửa tests/.
- Preview, Playwright (smoke + TE-1, ES1-T16), Lighthouse desktop/mobile, ảnh 360/768/1280/1920 (có bar và không bar): chờ CI. 5 test cũ nêu ở KHÔNG CHẮC (1) dự kiến đỏ — chờ ES1-T439.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
