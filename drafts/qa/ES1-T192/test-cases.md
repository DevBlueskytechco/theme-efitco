KHÔNG CHẮC: (1) spec chưa chạy trên store: phiên QA không có PREVIEW_URL/STORE_PASSWORD, chỉ type-check bằng `playwright test --list`; kết quả thật chờ CI store-tests của PR. (2) Rounding lên, số ít "1 min read", bài không nội dung, bài không ảnh/không tag, blog 0 bài chưa có dữ liệu trên store dev: TC-09, TC-10, TC-14, TC-15, TC-16 skip có lý do tới khi xong ES1-T460 (dữ liệu, DevOps) + ES1-T459 (band `te16-edge`/`te16-zero`, FE). (5) Spec chạy cục bộ bị globalSetup dừng (thiếu PREVIEW_URL); 52 test (26 × 2 project) liệt kê được bằng `--list`; 3 test tĩnh đối chiếu tay với file repo. (3) Tên file spec theo ticket (`tests/e2e/TE-16.spec.ts`), không theo `ES1-T192.spec.ts`; test case theo key `drafts/qa/ES1-T192/`. (4) `ac_coverage.py` ở `../ai-team/checks/qa/` ngoài thư mục phiên, chưa chạy được; độ phủ kiểm tay ở cuối file.

# ES1-T192 — TE-16 Block blog posts (QA1: AC-H26, AC-H27, TE-16 AC1 phần đo)
Nguồn: docs/srs.md#TE-16 (SRS 0.5: AC1, AC-H26, AC-H27, D8), docs/srs.md#TE-17 (AC-H7, AC-H35 phần blog), ticket ES1-T192, ES1-T191 (spec dev gộp vào đây), ES1-T334 (block viết lại, PR #214), Figma node 1:1022, docs/ui-spec/index-mobile-b.md §6, docs/ui-spec/index-1280.md khối 14, drafts/ba/ES1-T173/home-content.md §3.6, tests/fixtures/home-figma.json (blog `figma-blog`).

Spec: `tests/e2e/TE-16.spec.ts`, chạy project `desktop` (Desktop Chrome 1280 × 720) và `mobile` (Pixel 7). Gộp `tests/e2e/ES1-T191.spec.ts` (spec dev ES1-T191, ticket ghi "Gộp spec dev ES1-T191"): mọi test cũ còn đúng SRS 0.5 chuyển sang TE-16.spec.ts, file cũ xoá để không trùng. Test cũ "1920 card không đổi, 336 × 448 cho 2 bài ở 1280" đã thay theo TE-16 AC1 (292 × 389) như `drafts/dev-fe/ES1-T334/spec-updates.md` §5.

Trang dùng: `/?view=figma` (band `container-figma-blog-posts`, blog `figma-blog` 5 bài), `/?view=te16` (band `te16-empty` blog không tồn tại, `te16-two` 2 bài, `te16-default` mặc định 5; `te16-edge`, `te16-zero` chờ ticket dữ liệu).

Sai số đo: ≤ 2 px (SRS 0.5, ES1-T309 #4). Đo trong 1 lần `evaluate` (ES1-T172).

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC-H26 | Store dev có blog `figma-blog` 5 bài (fixture ES1-T331), viewport 1920 × 1080 | Mở `/?view=figma`, đọc band `container-figma-blog-posts` | Đúng 5 `article-card`, mỗi card 336 × 448 (±2); eyebrow "From the Efitco blog", h2 "Training Tips & Inspiration"; 0 console error | E2E | P1 |
| TC-02 | AC-H26 | Như TC-01 | Đọc từng card | Mỗi card có `article-card-image` chứa `img` có `src`, `alt=""`, `loading="lazy"`; `article-card-tag`, `article-card-title`, `article-card-read-time` hiện, khớp bảng A1–A5 (tiêu đề, tag, "N min read") theo handle | E2E | P1 |
| TC-03 | AC-H26 | Như TC-01 | Đọc `href` của `article-card-link`; bấm card đầu | Tập href = 5 handle của `figma-blog` (`/blogs/figma-blog/<handle>`); bấm thì URL tới đúng bài và `article-content` hiện | E2E | P1 |
| TC-04 | AC-H26 | Như TC-01 | Đo `blog-posts-list` | `scrollWidth > clientWidth`, `overflow-x: auto`, card 5 vượt mép phải list; đặt `scrollLeft` tối đa thì card 5 nằm trong khung list; trang không tràn ngang (`documentElement.scrollWidth ≤ clientWidth`) | E2E | P1 |
| TC-05 | AC-H26 | Như TC-01, có JS | Bấm `blog-posts-next` | `scrollLeft` của list tăng; `blog-posts-prev` hiện sau khi đã cuộn | E2E | P2 |
| TC-06 | AC-H27 | Band `te16-two` (`articles_to_show: 2`, blog 5 bài) | Mở `/?view=te16` | Đúng 2 card; ở 1280 lưới tĩnh 4 cột card 292 × 389, ở 1920 card 336 × 448 (không giãn lấp chỗ trống), `display: grid`, `blog-posts-nav` và `carousel-progress` ẩn | E2E | P1 |
| TC-07 | AC-H27 | Band `te16-empty`: handle blog không tồn tại (merchant chưa chọn blog, không có handle hợp lệ) | Mở `/?view=te16` | 0 `container-te16-empty`, 0 `blog-posts` trong band, 0 `blog-posts-placeholder` trên storefront; 0 console error | E2E | P1 |
| TC-08 | AC-H27, D8 | Bảng BA §3.6: A1 400 từ, A2 1 000, A3 1 200, A4 1 400, A5 1 000 | Đọc `article-card-read-time` theo handle | "2 min read", "5 min read", "6 min read", "7 min read", "5 min read" | E2E | P1 |
| TC-09 | AC-H27, D8 | Blog `te16-edge` bài `te16-round-up` 201 từ | Mở `/?view=te16`, band `te16-edge` | "2 min read" (làm tròn lên, không phải 1). Skip tới khi có dữ liệu | E2E | P1 |
| TC-10 | AC-H27, D8 | Blog `te16-edge` bài `te16-one-minute` 150 từ | Như TC-09 | "1 min read" (dạng `one` của locale `blocks.blog_posts.read_time`). Skip tới khi có dữ liệu | E2E | P2 |
| TC-11 | AC-H27, D8 | Repo | Đọc `snippets/article-card.liquid`, `locales/en.default.json` | Công thức `plus: 199 \| divided_by: 200` (làm tròn lên, 200 từ/phút); dòng thời gian đọc chỉ in khi `read_minutes > 0`; locale có `read_time.one`, `read_time.other` đều chứa `{{ count }}` | Tĩnh | P2 |
| TC-12 | AC1 | Band `figma-blog-posts` 5 bài | Viewport 360 × 800 | Card đầu 252 × 336 (±2); card 2 bắt đầu trước mép phải 360 (thấy mép card kế); `blog-posts-nav` không hiện; list cuộn ngang được; trang không tràn ngang | E2E | P1 |
| TC-13 | AC1 | Như TC-12 | Viewport 768 × 1024, có JS | Card 307 × 410 (±2); nút `blog-posts-prev`/`blog-posts-next` có `aria-label` "Previous articles"/"Next articles", cỡ 52 × 52 (±2, ≥ 44); `carousel-progress` hiện; trang không tràn ngang | E2E | P1 |
| TC-14 | AC1 | Như TC-12 | Viewport 1280 × 800, có JS | Card 271 (±2) × 361; phần thấy của card 5 trong viewport ≥ 25% bề card; `blog-posts-next` hiện; `carousel-progress` hiện | E2E | P1 |
| TC-15 | AC1, AC-H27 | Band `te16-edge` 4 bài | Viewport 1280 / 1920 | Đúng 4 card = số bài có; lưới tĩnh 292 × 389 / 336 × 448, nút và tiến trình ẩn. Skip tới khi có dữ liệu | E2E | P2 |
| TC-16 | AC1 | Mọi band có bài | 360, 768, 1280, 1920 | Tiêu đề hiện đủ: `scrollHeight ≤ clientHeight + 1`, `text-overflow` không `ellipsis`, `-webkit-line-clamp` `none`, text không chứa "…" | E2E | P2 |

## Case biên (ngoài AC)

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-17 | AC-H27 | Blog `te16-edge` bài `te16-no-content` (content rỗng) | Mở band `te16-edge` | Card có tiêu đề, 0 `article-card-read-time` (ẩn dòng, không in "0 min read"). Skip tới khi có dữ liệu | E2E | P1 |
| TC-18 | AC1 | Blog `te16-edge` bài `te16-no-image` (không ảnh, không tag) | Mở band `te16-edge` 1920 | 0 `article-card-image`, 0 `article-card-tag`; card cùng cỡ card có ảnh; nền link khác `transparent` (`--color-background-dark`); tiêu đề hiện. Skip tới khi có dữ liệu | E2E | P2 |
| TC-19 | AC-H27 | Blog `te16-zero` tồn tại, 0 bài | Mở `/?view=te16` | 0 `container-te16-zero`, 0 card, 0 placeholder. Skip tới khi có dữ liệu | E2E | P1 |
| TC-20 | AC-H26 | Mất mạng ảnh: `page.route` abort mọi request `image` | Mở `/?view=figma` 1920 | 5 card vẫn 336 × 448, tiêu đề và thời gian đọc hiện, nền card không trong suốt; 0 pageerror | E2E | P2 |
| TC-21 | AC-H26 | Bàn phím, desktop 1920, có JS | Focus h2 band, Tab tới khi vào `blog-posts-list` (≤ 3 lần); ArrowRight × 3; Tab | List nhận focus; `scrollLeft > 0` sau mũi tên; Tab tiếp theo focus `article-card-link` đầu, có outline (`outline-style` ≠ none). Skip ở Pixel 7: không có bàn phím vật lý | E2E/a11y | P1 |
| TC-22 | AC-H26 | Không JS (`javaScriptEnabled: false`), 1920 | Như TC-21 | Như TC-21 (bàn phím chạy không cần JS) | E2E/a11y | P1 |
| TC-23 | AC-H26, AC1 | Không JS | 360, 768, 1280, 1920 trên `figma-blog-posts`; 1280, 1920 trên `te16-two` | Cỡ card, số card, `display` list, `overflow-x`, `tabindex="0"`, `aria-label` giống bảng có JS (TC-01, TC-06, TC-12–TC-14); nút và tiến trình không hiện (thay bằng thanh cuộn); trang không tràn ngang | E2E | P1 |
| TC-24 | AC-H26 | Screen reader (cây a11y) | Đọc band `figma-blog-posts` | `getByRole('list', { name: 'Blog articles' })` có 5 `listitem`; mỗi card đúng 1 link, tên link chứa tiêu đề bài; ảnh `alt=""` | a11y | P1 |
| TC-25 | AC-H7 | `/?view=figma`, `/?view=te16` | axe trên band blog | 0 violation serious/critical | a11y | P1 |
| TC-26 | AC-H35 | 360 và 768 | Đo từng card | Hộp `article-card-tag` không giao `article-card-title`; title không giao `read-time`; eyebrow/h2 không giao `blog-posts-nav`; control nút ≥ 44 | E2E | P1 |
| TC-27 | AC-H26 | Repo | Đọc `templates/index.liquid`, `templates/index.figma.liquid` | `blog-posts` đứng ngay trước `faq` (hàng 14 trước hàng 15) | Tĩnh | P2 |
| TC-28 | AC-H26 | Repo | Đọc `blocks/blog-posts.liquid`, `snippets/article-card.liquid`, mục CSS Blog posts | Block chỉ nạp `lazy-module.js` + `data-lazy-module` `scroll-buttons.js`; snippet 0 script; mục CSS blog 0 màu literal, 0 thuộc tính vật lý | Tĩnh | P3 |
| TC-29 | AC-H27 | Editor (`design_mode`), blog chưa chọn | Mở block trong editor | Hiện `blog-posts-placeholder` "Blog posts are hidden. Select a blog…" | Tay | P3 |

TC-29 kiểm tay trên editor store dev: Playwright không mở được theme editor (cần đăng nhập admin). Không có E2E.

## Ma trận mốc × trạng thái

| Trạng thái | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| 5 bài, có JS | TC-12 | TC-13 | TC-14 | TC-01–TC-05 |
| 5 bài, không JS | TC-23 | TC-23 | TC-23 | TC-22, TC-23 |
| Dưới 5 bài | — (hàng ngang như 5 bài) | — | TC-06, TC-15 | TC-06, TC-15 |
| Rỗng (0 bài / không blog) | TC-07, TC-19 (theo viewport project) | — | TC-07, TC-19 | — |
| Lỗi (mất ảnh) | — | — | — | TC-20 |
| Đang tải | Không kiểm: ui-spec §6 ghi skeleton 3:4 nhưng block render server-side, không có trạng thái tải riêng ngoài ảnh lazy (TC-20 thay) | | | |

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))

- Blog `figma-blog` 5 bài A1–A5 (`drafts/ba/ES1-T173/home-content.md` §3.6; `tests/fixtures/home-figma.json` `store_data.blog`), số từ bội 200, mỗi bài có ảnh và 1 tag. Thiếu thì TC-01–TC-06, TC-08, TC-12–TC-14, TC-16, TC-20–TC-26 skip với lý do "store chưa có blog figma-blog đủ bài (ES1-T178, fixture ES1-T331)".
- Chưa có (ES1-T460 dữ liệu, ES1-T459 band): blog `te16-edge` 4 bài — `te16-one-minute` 150 từ, có ảnh, tag; `te16-round-up` 201 từ, có ảnh, tag; `te16-no-content` content rỗng, có ảnh, tag; `te16-no-image` 200 từ, không ảnh, không tag. Blog `te16-zero` 0 bài. Band `te16-edge` (handle `te16-edge`) và `te16-zero` (handle `te16-zero`) trong `templates/index.te16.liquid`. Thiếu thì TC-09, TC-10, TC-15, TC-17, TC-18, TC-19 skip có lý do.

## Skip có lý do dữ liệu

| TC | Lý do | Mở khi |
| --- | --- | --- |
| TC-09, TC-10, TC-15, TC-17, TC-18 | Store dev không có bài 150 / 201 từ, content rỗng, không ảnh/tag; `figma-blog` toàn bội 200 nên không phân biệt làm tròn lên với làm tròn thường | Ticket dữ liệu DevOps + band FE `te16-edge` xong |
| TC-19 | Không có blog tồn tại nhưng 0 bài (TC-07 chỉ phủ "không có blog") | Như trên, blog `te16-zero` |
| TC-21 (mobile) | Pixel 7 không có bàn phím vật lý; chạy ở desktop | — |
| TC-29 | Cần theme editor | Kiểm tay |

## Độ phủ AC (kiểm tay, chờ ac_coverage.py)

| AC | TC |
| --- | --- |
| TE-16 AC1 | TC-12, TC-13, TC-14, TC-15, TC-16, TC-18, TC-23 |
| TE-16 AC-H26 | TC-01, TC-02, TC-03, TC-04, TC-05, TC-20, TC-21, TC-22, TC-24, TC-27, TC-28 |
| TE-16 AC-H27 | TC-06, TC-07, TC-08, TC-09, TC-10, TC-11, TC-17, TC-19, TC-29 |

3/3 AC của TE-16 có TC (100%). Thêm AC-H7 (TC-25), AC-H35 (TC-26) phần hàng 14.

## Regression theo DoD ticket

`npx playwright test tests/e2e/TE-1.spec.ts tests/e2e/TE-3.spec.ts tests/e2e/ES1-T176.spec.ts` và `npx lhci autorun` (/ và /?view=figma: desktop ≥ 96, mobile ≥ 90, a11y ≥ 98): chạy trên CI store-tests của PR, chưa chạy trong phiên QA (không có biến store). Không báo đạt.
