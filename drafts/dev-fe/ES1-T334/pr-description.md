KHÔNG CHẮC: (0) CI run 43367444316: spec ES1-T118:93, ES1-T179:209, :221, ES1-T184:136 trái AC mới (bảng dưới); dev-fe không ghi được tests/, đề xuất sửa ở `drafts/dev-fe/ES1-T334/spec-updates.md`, hỏi ES1-T456. (1) kích thước card chưa đo trên preview: số dưới đây tính tay từ CSS (100cqi, lề 20/252, gap 16/24); chờ CI + TE-17-R2-QA1. (2) `data-static` do TE-7-R2-BE1 (ES1-T335) gắn; trước khi BE xong, hàng vừa khung ẩn nút (scroll-buttons.js gắn `hidden` cả 2) nhưng thanh tiến trình vẫn hiện đầy. (3) Mặc định heading lấy chữ Figma ("Browse Categories", "Video demo", "Training Tips & Inspiration"...) giữ nguyên: sửa mặc định thuộc ES1-T304 (task-split D10), task này không thêm setting. (4) Quy ước "Hàng ngang" chưa vào AGENTS.md: hook scope-guard chặn dev-fe ghi AGENTS.md, đề xuất bullet ở cuối PR cho người quản trị.

# ES1-T334 — TE-7-R2-FE1: hàng ngang collection-list, testimonials, video-carousel, blog-posts

AC: TE-7 AC1 (+ AC6 phần bố cục), TE-15 AC1, AC-H8, AC-H9, TE-13 AC8 (phần hàng), AC-H21 (bề card), TE-16 AC1, AC-H26, AC-H27. Nguồn: `docs/ui-spec/index-1280.md` §0 R4, §2.2; `index-mobile-a.md` §3; `index-mobile-b.md` §0, §3, §4, §6; foundation §6, §11; sổ 11/11 HD3; task-split ES1-T307 §4 (hợp đồng FE/BE), §6.3.

## Lượt 3 (CI PR #214 run 43367444316)

| Đỏ | Nguyên nhân | Xử lý |
|---|---|---|
| ES1-T184 "hidden thắng display của nút", ES1-T185 ẩn nút đầu/cuối và khi không tràn, ES1-T220 nút đang focus tự ẩn | CSS lượt 2 hiện `.round-button[hidden]` mờ 0.35 | Sửa CSS: `.carousel-nav .round-button[hidden]` → `visibility: hidden` (ẩn, bỏ khỏi Tab, giữ chỗ để nút kia không nhảy). Không đổi spec. `aria-disabled` 0.35 (TE-7 AC6, TE-15 AC1) chờ ES1-T335 đổi JS |
| ES1-T118:93 testimonials 768 2 cột, 1280 lưới 3/4 cột | AC đổi: TE-7 AC1 (0.4, HD3) hàng ngang mọi mốc; AC6 card 307 / 360 + ≥ 25% card 4 | Giữ code; đề xuất sửa spec (spec-updates.md §1) |
| ES1-T179:209 AC-H24 1280 lưới 4 cột | AC đổi: TE-7 AC6 (1280: 360, 3 card + ≥ 25% card 4) | Đề xuất §2 |
| ES1-T179:221 CR-8 1920 6 mục vẫn lưới | AC đổi: TE-7 AC1 (lưới tĩnh chỉ khi vừa khung; 6 × 456 không vừa) | Đề xuất §3 |
| ES1-T184:136 1280 card 336 | AC đổi: TE-15 AC1 card 271 (R4 index-1280 §0), đo 270.7 | Đề xuất §4 |

Thêm: px cứng phần "Hàng ngang" (336/456/264/2) → token `--row-card-max`, `--row-card-review-max`, `--row-card-video`, `--row-progress-size` trong khối biến component đầu base.css.

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

`<scroll-buttons>` gốc: `data-enhanced`, `data-static` (vừa khung → ẩn nút + tiến trình), `data-lazy-module`; `[data-scroll-track]`, `[data-scroll-prev]`, `[data-scroll-next]`, `[data-scroll-progress]` (`--scroll-size`, `--scroll-pos`). Đầu/cuối hàng: `aria-disabled="true"` trên `.round-button` (mờ 0.35, giữ chỗ); `[hidden]` (scroll-buttons.js hiện tại) ẩn bằng `visibility`, giữ chỗ; khi đổi sang `aria-disabled`, spec ES1-T185/T220 đổi `toBeHidden` ở đầu/cuối cùng PR BE. testid: `<prefix>-nav`, `<prefix>-prev`, `<prefix>-next`, `carousel-progress` với prefix `collection-list`, `testimonials`, `video-carousel`, `blog-posts`.

## Tự kiểm tra

- `shopify theme check`: 0 lỗi (23 warning có sẵn trên develop, không thêm mới; `.theme-check.yml` không đổi).
- `gzip -c assets/base.css | wc -c`: origin/develop 51 217 → nhánh 50 864 (−353; trần 49 152 đã vượt trên develop, ES1-T454); `wc -c assets/critical.css`: 10 014 (không đổi so với develop, ≤ 10 240).
- 0 file JS trong diff; 0 literal màu mới, 0 thuộc tính vật lý, 0 z-index số; ngoặc CSS cân.
- Không thêm setting, không thêm block/snippet; editor: placeholder 4 khối giữ nguyên, ngoài editor rỗng không render.
- Test có sẵn chạm: ES1-T184, ES1-T185, ES1-T220 bám testid `collection-list-prev/-next` (giữ nguyên), `data-enhanced`, `[hidden]` → ẩn (visibility); nút ẩn tới khi `data-enhanced` như cũ. ES1-T118, ES1-T179, ES1-T184 bảng cỡ: chờ áp spec-updates.md (ES1-T456).
- Bề card tính tay (chờ đo CI): 360 danh mục 252, review 272 (lộ 52), video 252 (lộ 72), blog 252; 768 danh mục/review/blog 307, video 264; 1280 danh mục 271 (lộ 85, 31%), review 360 (lộ 108, 30%), video 264 (lộ 108, 41%), blog 4 bài 292 × 389 lưới; 1920 danh mục 336, review 456, blog 336 × 448.
- Preview, Playwright, Lighthouse (desktop/mobile), ảnh 360/768/1280/1920: chờ CI.

## Đề xuất bullet AGENTS.md (mục Styling and tokens), người quản trị thêm

- Horizontal card rows (collection list, testimonials, video carousel, blog posts) share one CSS part, "Hàng ngang" in `assets/base.css`: a `full-width` `<scroll-buttons>` root with `container-type: inline-size`, card width in `--row-card` per breakpoint (at 80rem the next card shows at least 25%), buttons from `snippets/carousel-nav`, progress line from `snippets/carousel-progress`. The script sets `data-static` when the row fits; CSS then hides buttons and progress line. A new row reuses these classes and sets only `--row-card`. Why: one row behaviour (HD3) everywhere, and no CSS copy per block.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
