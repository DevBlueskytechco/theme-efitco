KHÔNG CHẮC: (1) chưa có preview: spec chưa chạy, Liquid mới chỉ qua theme check, số px và ảnh 3 breakpoint chờ CI; (2) scope-guard chặn tests/ và AGENTS.md: Orchestrator chép spec, apply patch, thêm 2 hàng Theme map (bên dưới); (3) ticket ghi "Root thẻ video-card" nhưng danh sách là ul, nên root là li (có shopify_attributes), mọi hook nằm trên video-card bên trong; (4) ticket ghi "hàng sản phẩm --color-background-sand": Figma 1:845 fill ẩn, chỉ có viền sand nên làm viền, không làm nền; (5) ES1-T153 chưa xong (media-dủ-loại có video chưa xác nhận), T199 #3 chưa trả lời; (6) đường block.settings.video, video_url thật không chạy được trên preview, cần 1 lần kiểm tay trong editor (ES1-T153 #3); (7) id YouTube aqz-KE-bpKQ, Vimeo 1084537 là id công khai tôi nhớ, chưa mở được để kiểm: chỉ ở template test, chỉ dùng khi bấm hoặc theo link; sai thì link hỏng, test không đỏ.

# ES1-T157 TE-13-FE2: video carousel, hàng 11 Figma 1:817

Block mới `video-carousel` (11 settings) và `video-card` (5 settings), 18 data-testid. 0 JS: cuộn bằng scroll-snap, poster là link. Trang chủ chưa cấu hình không có band.

## Thay đổi
- `blocks/video-carousel.liquid`: eyebrow, heading có default theo Figma (D1 block 1 lần); subheading, link, 3 ô số liệu default trống vì đang ẩn trong Figma 1:826, 1:827 (comment Tech Lead). Thân rỗng: storefront không render, editor có placeholder.
- `blocks/video-card.liquid`: nguồn theo thứ tự video setting (có sources), param `video_id`/`video_host`, `video_url`. Poster lazy trong `a[data-video-poster]`, video hoặc iframe trong `template[data-video-template]`.
- `templates/index.liquid`, `templates/index.figma.liquid`: band `alt` ngay sau featured product, 8 dòng video-card. Figma cấu hình 6 nguồn, 2 thẻ không nguồn không render.
- `templates/index.te13.liquid`: 1 featured product nhiều variant + 3 band video: bộ 8, thẻ có và không nguồn, không thẻ nào có nguồn.
- `templates/index.te13-states.liquid` (mới): 5 band A-E cũ, chuyển nguyên (plan D4).
- `assets/base.css`, 2 file locale. `assets/*.js`, `critical.css`: không đổi. 0 token mới.

## Việc Orchestrator làm
1. Chép `drafts/dev-fe/ES1-T157/ES1-T157.spec.ts` sang `tests/e2e/ES1-T157.spec.ts`.
2. `git apply drafts/dev-fe/ES1-T157/tests.patch`: ES1-T156 đổi sang `?view=te13-states`; ES1-T175 thêm band video và band shop-the-look (ES1-T148 đã thêm vào template nhưng spec chưa có, phần này sửa luôn).
3. Thêm vào bảng Blocks của `AGENTS.md`:

| Block | Role |
| --- | --- |
| `video-card` | One short video of `video-carousel`: lazy poster link, video or iframe in a template tag, badge, product row. |
| `video-carousel` | Video demo row: heading, optional stats, list of `video-card` (scroll-snap, works without JavaScript); renders nothing when no card has a source. |

## Hợp đồng cho BE1 (ES1-T158)
Theo D10, thêm 1 hook: `data-video-label` trên chữ ẩn của poster, để đổi sang `data-label-error`. CSS đã có: `.video-card__poster[hidden]` ẩn poster, `.video-card[data-video-error]` ẩn play, `.video-card__media` phủ khung và nằm dưới poster. BE thêm `data-lazy-module` trên root `video-carousel` và thẻ script.

## Chênh Figma
- E6: có nút play.
- Nhãn số liệu dùng `--color-muted` (ES1-T154 #6), chỉ hiện trên template test.
- Giữ thanh cuộn mảnh vì không có nút mũi tên, nếu không chuột không cuộn được. Playwright headless ẩn thanh cuộn nên không ảnh hưởng so ảnh.
- `/`: Figma có poster, sản phẩm nhưng theme không có video mặc định (ES1-T167 Q2), nên band chỉ hiện khi merchant chọn nguồn.
- `/?view=figma`: chưa có 6 video thật (ES1-T199 #3), thẻ dùng video của `media-dủ-loại` hoặc id YouTube công khai. Video không chạy khi so ảnh nên không đổi kết quả.

## Tự kiểm tra
- `shopify theme check --path .`: 0 lỗi (97 file). Locale parse JSON được, không trùng key. `git apply --check tests.patch`: đạt. Đếm: 18 testid, 11 + 5 settings.
- `wc -c assets/critical.css` = 9921, không đổi. 0 file JS trong diff.
- Chờ CI, CHƯA kiểm: preview; `npx playwright test tests/e2e/ES1-T157.spec.ts -g "AC3-markup|AC4-markup|nojs"`, ES1-T156, TE-1, TE-3, ES1-T176 hàng 11; axe; `npx lhci autorun`; ảnh 360, 768, 1280. CTO 06/11: e2e, lighthouse đang tắt trên PR (`vars.RUN_STORE_TESTS=false`), nên PR này chỉ qua theme check và preview.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
