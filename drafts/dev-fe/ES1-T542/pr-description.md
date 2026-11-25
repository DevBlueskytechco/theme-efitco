KHÔNG CHẮC: mục "Dropdown/mega: ra fast 150" chưa làm — mega/submenu đóng bằng <details> nên đóng tức thì, hiện không có transition ra để đổi; muốn có exit cần ::details-content/allow-discrete, ngoài phạm vi 2 điểm này. Phạm vi ticket ghi base.css, nhưng AC1 grep assets/*.css nên sửa thêm 2 literal ở hello-world.css, image-with-text.css.

# ES1-T542: bỏ thời lượng viết số trong CSS, đóng dialog / drawer / toast dùng --motion-fast

Theo ES1-T567 (foundation.md §19: ra 200 → fast 150; vào 300 → base 250; lệch 80 → stagger 60). Token có sẵn ở snippets/css-variables.liquid dòng 119–129, không thêm token.

## Thay đổi
assets/base.css
- `.button--link .slideshow-icon`: `translate 0.2s ease-out` → `var(--motion-base) var(--ease-out)`.
- `.video-card__play`: `opacity 0.2s` → `var(--motion-fast) var(--ease-out)`.
- `.button[aria-busy='true']::after`: `motion-spin 700ms` → `var(--motion-hero)` (1 vòng 1.4s, giống `.spinner`).
- `[data-testid='header-cart-link'][data-bump]`: `500ms` → `var(--motion-slow)`.
- `[data-reveal]` transition-delay: `* 80ms` → `* var(--motion-stagger)` (60ms).
- `.dialog:not([open])`, `.drawer:not([open], :popover-open)` và `::backdrop` của chúng: thêm `transition-duration: var(--motion-fast)` → đóng 150ms; mở giữ `--motion-base` 250ms (rule chung `.dialog, .drawer`).
- Toast: `.toast[data-closing]` đã dùng `--motion-fast` từ trước, giữ nguyên.

assets/hello-world.css
- `.highlight-description--flash`: `0.6s ease-out` → `var(--motion-slow) var(--ease-out)`.

assets/image-with-text.css
- scrub `.motion-word`: `color 120ms linear` → `var(--motion-fast) linear` (giữ linear vì bám tiến độ cuộn).

Giữ nguyên: reveal 900 (`--motion-reveal`), hero 1400, khối `prefers-reduced-motion: reduce` (base.css 2830 vẫn `transition: none`).

Không file JS, Liquid, locale trong diff. Ngoài phạm vi: setTimeout 700 ở scroll-extras.js, ngưỡng 500ms chỉ báo tải (ES1-T555, BE).

## Tự kiểm tra
- AC1: `grep -nE '(transition|animation)[^;]*[0-9.]+m?s\b' assets/*.css` = 0 dòng; `grep -nE '80ms|700ms|0\.2s|0\.6s' assets/*.css` = 0 dòng.
- shopify theme check: 0 lỗi (9 warning có sẵn trên develop, không thêm).
- base.css: +1 dòng, thay literal bằng var() — gzip tăng vài chục byte so với 37 029 B develop, dưới trần 49 152 B (lệnh gzip bị sandbox chặn, CI đo lại).
- AC2 (computed transition-duration đóng 0.15s / mở 0.25s ở 1280), AC3 (spinner 1.4s, reveal lệch 60ms), AC4 (reduced-motion), Lighthouse, ảnh 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
