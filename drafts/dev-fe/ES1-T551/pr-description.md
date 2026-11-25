KHÔNG CHẮC: `.badge--wrap` bo góc dùng `--radius-card` theo ticket (ES1-T537 chưa merge, chưa có `--radius-md`). Đây là setting của merchant, default 12 khớp kit, nhưng merchant đổi card radius thì badge wrap đổi theo. Muốn bo cố định 12 thì đổi sang `--radius-md` khi T537 merge.

# ES1-T551 FE: chuỗi dịch dài: nút nowrap mặc định, `.button--wrap` / `.badge--wrap`, bỏ khoá bề rộng CTA hero

Nguồn: kit.css `.button` (nowrap), `.button--wrap`, `.button--wrap:has(> svg)` (399–401), `.badge--wrap` (476); foundation.md §6 "Nhãn dài", §37; decisions.md patterns-17, ES1-T535 lượt 2 (4).

## Thay đổi
- `assets/base.css`
  - `.button`: thêm `white-space: nowrap`.
  - Thêm `.button--wrap { max-inline-size: 100%; padding-block: var(--space-2); white-space: normal; text-align: center; text-wrap: balance }` và `.button--wrap:has(> svg) { text-align: start; text-wrap: wrap }`.
  - Khối `@media (min-width: 80rem)`: rule `.button { padding: 13px 32px … }` đứng sau và ghi đè padding-block nên thêm `.button--wrap { padding-block: var(--space-2) }` ngay sau nó để giữ 8 như kit.
  - Thêm `.badge--wrap { max-inline-size: 100%; padding-block: var(--space-1); border-radius: var(--radius-card); white-space: normal }`.
  - `.product-card__badge`: thêm `white-space: nowrap`, `max-inline-size: calc(100% - 2 * var(--space-2))`; từ 64rem `calc(100% - 2 * var(--space-4))` (theo lề badge 8 / 16).
  - Slideshow ≥80rem: xoá `min-inline-size: var(--figma-hero-cta-width)`; nút rộng theo nhãn + padding.
- `snippets/css-variables.liquid`: xoá `--figma-hero-cta-width: 233px` và comment đi kèm.
- `blocks/quiz.liquid`: 3 nút `.quiz__card-button` (sold out, choose options, add to cart) thêm `button--wrap`. Nút add có `svg` con trực tiếp (header-icon bag) nên ăn `:has(> svg)`: chữ căn start, icon cách chữ bằng `gap` 8 của `.button`.
- `assets/quiz.css`: không phải sửa (`.quiz__card-button` chỉ đặt padding-inline, không đụng padding-block/white-space).

Token: `--space-xs` / `--space-2xs` / `--radius-md` chưa có (T536, T537 chưa merge) nên dùng `--space-2` (8) / `--space-1` (4) / `--radius-card` (default 12) như ticket cho phép. Không literal mới.

Không có file JS trong diff. JS quiz không đổi class nút (grep `className`, `button--secondary` trong `assets/*.js` = 0).

## AC
- AC1 `.button` computed `white-space: nowrap`: từ CSS, cả 360 và 1280 (rule gốc, 80rem không ghi đè white-space). Chờ CI đo computed.
- AC2 quiz card ×3 ở 360: `.button--wrap` cho chữ xuống dòng, `max-inline-size: 100%`, không cắt; icon gap 8. Chờ CI / ảnh chụp.
- AC3 hero 1280: hết sàn 233. Chờ CI chụp.
- AC4 `git grep -n 'hero-cta-width' -- assets snippets` = 0 (đã chạy grep, 0 kết quả; tests/ cũng 0).
- AC5 `.button--wrap`, `.badge--wrap` có trong base.css, giá trị khớp kit (8 / 4 / 12).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 9 warning có sẵn ở quiz-step.liquid, templates/index*.liquid (không thuộc diff).
- Kích thước: base.css 194 930 B raw, quiz.css 20 956 B raw; gzip chưa đo được (sandbox chặn lệnh gzip), diff +~0,5 KB raw. Chờ CI đo trần base.css ≤ 49 152 B gzip.
- Preview, Playwright, Lighthouse, ảnh quiz result + hero 360 / 768 / 1280 / 1920: chờ CI.
- Lưu ý review: nút giờ nowrap mặc định trên toàn theme; nút nào nằm trong khung hẹp mà nhãn dài hơn khung sẽ tràn thay vì xuống dòng. Đúng quyết định ES1-T535 (4) / foundation §37; chỗ cần xuống dòng phải thêm `.button--wrap` (ticket riêng nếu QA thấy).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
