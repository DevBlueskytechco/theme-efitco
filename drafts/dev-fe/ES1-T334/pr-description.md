KHÔNG CHẮC: (1) kích thước card chưa đo trên preview: số dưới đây tính tay từ CSS (100cqi, lề 20/252, gap 16/24), bước đo cục bộ bằng chromium bị chặn quyền; chờ CI + TE-17-R2-QA1. (2) `data-static` do TE-7-R2-BE1 (ES1-T335) gắn; trước khi BE xong, hàng vừa khung vẫn hiện nút mờ 0.35 và thanh tiến trình đầy (CSS không còn đọc `data-scrollable` của scroll-extras.js). (3) Mặc định heading lấy chữ Figma ("Browse Categories", "Video demo", "Training Tips & Inspiration"...) giữ nguyên: sửa mặc định thuộc ES1-T304 (task-split D10), task này không thêm setting. (4) Quy ước "Hàng ngang" chưa vào AGENTS.md: hook scope-guard chặn dev-fe ghi AGENTS.md, đề xuất bullet ở cuối PR cho người quản trị.

# ES1-T334 — TE-7-R2-FE1: hàng ngang collection-list, testimonials, video-carousel, blog-posts

AC: TE-7 AC1 (+ AC6 phần bố cục), TE-15 AC1, AC-H8, AC-H9, TE-13 AC8 (phần hàng), AC-H21 (bề card), TE-16 AC1, AC-H26, AC-H27. Nguồn: `docs/ui-spec/index-1280.md` §0 R4, §2.2; `index-mobile-a.md` §3; `index-mobile-b.md` §0, §3, §4, §6; foundation §6, §11; sổ 11/11 HD3; task-split ES1-T307 §4 (hợp đồng FE/BE), §6.3.

## Thay đổi

- `assets/base.css`: một phần chung "3. Hàng ngang" cho 4 khối thay CSS riêng từng khối.
  - Gốc `.full-width` + `container-type: inline-size`; `--row-inset` = mép nội dung (20 ở 360/768/1280, 252 ở 1920), `--row-gap` 16 → 24 từ 80rem, `--row-card` theo mốc.
  - Danh mục, blog (hàng): `min(70cqi, 336px)` → `min(40cqi, 336px)` → từ 80rem `min(336px, (100cqi − lề − 4 × gap) / 4.3)`: 252 / 307 / 271 / 336.
  - Review: 85% nội dung → `min(40cqi, 336px)` → `min(456px, (100cqi − lề − 3 × gap) / 3.3)`: 272 / 307 / 360 / 456. Hàng ngang ở mọi mốc (bỏ lưới 2/3/4 cột và nhánh 120rem).
  - Video: 252 ở 360, 264 từ 768 (1280: 4 card + 108 px card 5).
  - Blog ≤ 4 bài: Liquid gắn `blog-posts--grid`, từ 80rem lưới tĩnh 4 cột (292 × 389 ở 1280, 336 × 448 ở 1920), không nút, không tiến trình.
  - Header `1fr auto`, nút căn đáy tiêu đề (eyebrow có thì nút span 2 hàng); nút ẩn < 48rem, `visibility: hidden` khi chưa `data-enhanced` hoặc có `data-static` (giữ chỗ, CLS 0, bỏ khỏi Tab).
  - Tiến trình cao 2 cách hàng 32 (foundation §11), absolute trong đệm đáy, hiện khi `data-enhanced` và không `data-static`; dải tối: nền trắng 12% (`color-mix`), thumb trắng; nút tròn viền trắng, focus trắng.
  - Thanh cuộn trình duyệt ẩn luôn (không đổi chiều cao khi JS nạp), chỉ hiện `@media (scripting: none)`.
  - Review < 80rem: sao xuống hàng riêng dưới tên; từ 80rem tên, Verified, sao 1 hàng (TE-7 AC6).
  - Xoá CSS cũ phần thay: `.collection-list__nav`, `.collection-list__button*` (mọi lớp: gốc, lớp 1920, review 09/11, motion), track/list riêng 4 khối, `--*-inset` riêng, card 336 cố định ở lớp ≥ 80rem (làm 1280 ra 336 thay 271), lưới testimonials 48/80/120rem, `data-scrollable`.
- `blocks/collection-list.liquid`: nút riêng thay bằng `snippets/carousel-nav` (testid giữ `collection-list-nav/-prev/-next`), doc hook.
- `blocks/testimonials.liquid`: thêm `full-width` (hàng tràn tới mép phải), doc.
- `blocks/blog-posts.liquid`: `shown_count = articles_count | at_most: articles_to_show`, ≤ 4 → `blog-posts--grid`; doc.
- `blocks/video-carousel.liquid`: chỉ doc (hook, mốc).
- `blocks/testimonial-item.liquid`: `sizes` theo bề card mới `(min-width: 80rem) min(456px, 29vw), (min-width: 48rem) min(40vw, 336px), 76vw`.
- `snippets/carousel-progress.liquid`: `data-testid="carousel-progress"` (hợp đồng §4); `snippets/carousel-nav.liquid`: doc `data-static`, `aria-disabled`.
- `locales/en.default.json` (gộp vào key `blocks` có sẵn): "Product categories", "Previous categories", "Next categories" (TE-15 AC1); "Customer reviews" (TE-7 AC6); bỏ "Scroll sideways to see more." ở blog/video vì hàng có thể là lưới tĩnh.

## Hook cho BE (TE-7-R2-BE1, ES1-T335, đã comment)

`<scroll-buttons>` gốc: `data-enhanced`, `data-static` (vừa khung → ẩn nút + tiến trình), `data-lazy-module`; `[data-scroll-track]`, `[data-scroll-prev]`, `[data-scroll-next]`, `[data-scroll-progress]` (`--scroll-size`, `--scroll-pos`). Đầu/cuối hàng: `aria-disabled="true"` trên `.round-button` (mờ 0.35, giữ chỗ); `[hidden]` vẫn hiện mờ để tương thích scroll-buttons.js hiện tại. testid: `<prefix>-nav`, `<prefix>-prev`, `<prefix>-next`, `carousel-progress` với prefix `collection-list`, `testimonials`, `video-carousel`, `blog-posts`.

## Tự kiểm tra

- `shopify theme check`: 0 lỗi (23 warning có sẵn trên develop, không thêm mới; `.theme-check.yml` không đổi).
- `gzip -c assets/base.css | wc -c`: 47 210 (trước 47 730, trần 49 152); `wc -c assets/critical.css`: 9 917 (không đổi, ≤ 10 240).
- 0 file JS trong diff; 0 literal màu mới, 0 thuộc tính vật lý, 0 z-index số; ngoặc CSS cân.
- Không thêm setting, không thêm block/snippet; editor: placeholder 4 khối giữ nguyên, ngoài editor rỗng không render.
- Test có sẵn chạm: ES1-T184, ES1-T185, ES1-T220 bám testid `collection-list-prev/-next` (giữ nguyên) và `data-enhanced`; nút ẩn tới khi `data-enhanced` như cũ.
- Bề card tính tay (chờ đo CI): 360 danh mục 252, review 272 (lộ 52), video 252 (lộ 72), blog 252; 768 danh mục/review/blog 307, video 264; 1280 danh mục 271 (lộ 85, 31%), review 360 (lộ 108, 30%), video 264 (lộ 108, 41%), blog 4 bài 292 × 389 lưới; 1920 danh mục 336, review 456, blog 336 × 448.
- Preview, Playwright, Lighthouse (desktop/mobile), ảnh 360/768/1280/1920: chờ CI.

## Đề xuất bullet AGENTS.md (mục Styling and tokens), người quản trị thêm

- Horizontal card rows (collection list, testimonials, video carousel, blog posts) share one CSS part, "Hàng ngang" in `assets/base.css`: a `full-width` `<scroll-buttons>` root with `container-type: inline-size`, card width in `--row-card` per breakpoint (at 80rem the next card shows at least 25%), buttons from `snippets/carousel-nav`, progress line from `snippets/carousel-progress`. The script sets `data-static` when the row fits; CSS then hides buttons and progress line. A new row reuses these classes and sets only `--row-card`. Why: one row behaviour (HD3) everywhere, and no CSS copy per block.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
