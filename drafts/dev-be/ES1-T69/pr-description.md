KHÔNG CHẮC: (1) chưa chạy trình duyệt trong phiên (sandbox), E2E/axe/lhci chờ CI; (2) `Shopify.loadFeatures([{ name: 'model-viewer-ui', version: '1.0' }])` + `new Shopify.ModelViewerUI(modelViewer)` theo cách Dawn dùng, không có trong nguồn dự án và chưa đối chiếu shopify.dev (hỏi ES1-T88); (3) ngân sách D9 chỉ đạt nếu product-recommendations.js (ES1-T68) giữ trần 3072 B, vì product-form.js đang 6757 B (D9 cho phép 5120).

# ES1-T69 TE-4-BE3: assets/product-media.js

AC: docs/srs.md#TE-4 AC1 (zoom, video, 3D, đổi variant sang featured_media), NFR-6. Thiết kế: drafts/techlead/ES1-T59/task-split.md D2, D6, D9, D10.

## Thay đổi
- `assets/product-media.js` (4407 B, mới): custom element `product-media-gallery` (root FE1 ES1-T62).
  - Zoom: chặn click `product-media-zoom-link` (bỏ qua khi có phím bổ trợ hoặc chuột giữa → trình duyệt mở tab), gắn `src` = href (ảnh 2048), `alt`, `width` 2048, `height` theo tỉ lệ ảnh gốc vào `product-media-zoom-image`, bỏ `hidden`, `showModal()`. Esc (cancel gốc) và `product-media-zoom-close` (form method=dialog) đóng; sự kiện `close` trả focus về link (`preventScroll`). Không JS: link mở ảnh lớn như cũ.
  - Thumbnail: 1 IntersectionObserver trên các `li` của `product-media-list`, media có tỉ lệ hiện lớn nhất → `aria-current="true"` trên thumbnail tương ứng (chỉ 1). Bấm thumbnail: `preventDefault` (hash không đổi), cuộn list ngang (dưới 64rem) hoặc trang (xếp dọc từ 64rem); `smooth`, `auto` khi `prefers-reduced-motion: reduce`.
  - Rời khung (không còn giao): `video.pause()` nếu đang phát; `ModelViewerUI.pause()`; iframe external thay lại bằng poster (dừng phát, bấm lại thì gắn lại iframe cũ).
  - External video: bấm `product-media-external-video` → clone phần tử đầu trong `template` cùng `li` (external_video_tag FE1), thay poster, focus iframe. Không có request YouTube/Vimeo trước khi bấm.
  - 3D: `li` model vào khung lần đầu → `Shopify.loadFeatures` model-viewer-ui (Shopify CDN, content_for_header), `onLoad` lỗi thì bỏ qua, không retry.
  - `theme:variant:change` (BE1 ES1-T66, bubbles từ product-variant-picker, nghe ở document): cuộn tới `li[data-media-id=featuredMediaId]` như bấm thumbnail; dưới 64rem chỉ cuộn list, không cuộn trang; không đụng focus. `featuredMediaId` null hoặc không có trong list → bỏ qua.
- `blocks/product-media.liquid`: thêm 1 thẻ `<script src="{{ 'product-media.js' | asset_url }}" type="module">` trong nhánh có media (cạnh dialog). Không đổi markup khác.
- `tests/e2e/ES1-T69.spec.ts` (mới): contract (≤ 6144 B, 1 thẻ script, testid JS dùng có trong block, không URL tuyệt đối trong JS, tổng D9 ≤ 30046) + 6 test AC1: zoom/Esc/nút đóng/focus + axe dialog, thumbnail aria-current, video pause (giả lập `paused` vì Chromium Playwright không phát H.264), external video không request trước khi bấm + iframe + focus, 3D model-viewer từ Shopify CDN, đổi variant cuộn tới featured_media + không cướp focus. Mọi test theo dõi console error/pageerror.

## Ngân sách JS trang sản phẩm (D9)
header-menu 6862 + header-sticky 1680 + product-variant-picker 7156 + product-form 6757 + product-media 4407 + product-recommendations (chưa có, tính trần 3072) = 29934 ≤ 30046. Thực tải hiện tại (chưa có recommendations): 26862 + standard-events.js 888 (layout, ngoài bảng D9).

## Tự kiểm tra
- `shopify theme check`: 50 file, 0 offense.
- `node --check assets/product-media.js`: OK; `wc -c assets/product-media.js`: 4407 (≤ 6144, ≤ 8192).
- `node --experimental-strip-types --check tests/e2e/ES1-T69.spec.ts`: OK.
- Locale: không đổi.
- `npx playwright test tests/e2e/ES1-T69.spec.ts -g "AC1"` desktop + Pixel 7, 0 console error, axe dialog, `npx lhci autorun`: chờ CI (dữ liệu TE4_MEDIA_HANDLE / TE4_VARIANTS_HANDLE từ tests/e2e/store-data.json).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
