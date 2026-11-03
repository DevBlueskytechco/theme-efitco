KHÔNG CHẮC: (1) Figma không có trang sản phẩm → layout là mặc định kỹ thuật ES1-T59 D1/D2, chờ Designer ES1-T61; (2) lighthouserc*.json không sửa được (phạm vi devops, JSON không đọc env) → ES1-T71 cho DevOps đặt vars.BENCH_PRODUCT = handle TE4_VARIANTS_HANDLE; (3) spec E2E ở drafts vì scope-guard chặn tests/; (4) chưa chạy trên preview, chưa có dữ liệu TE4_MEDIA_HANDLE (ES1-T60 #1).

# ES1-T62 TE-4-FE1: khung trang sản phẩm + gallery product-media

Ticket: ES1-T62 · AC: docs/srs.md#TE-4 AC1 (markup) · Nguồn: drafts/techlead/ES1-T59/task-split.md D1, D2, D10, D11 (commit 1465b42) + comment techlead (template external video).

## Thay đổi
- `templates/product.liquid`: viết lại. 3 container `product-main` / `product-related` / `product-complementary` (testid `container-*` do block container sinh). Trong product-main: `div.product` (lưới) → `{% block 'product-media' %}` + `div.product__details`. Bỏ markup Skeleton cũ (select variant, input text quantity, form). Tạm giữ h1 title + `render 'price'` + description trong `product__details` để trang không trống giữa các lần merge; ES1-T63 / ES1-T64 thay các dòng này bằng block của mình.
- `blocks/product-media.liquid` (mới, 0 setting, không presets): root `<product-media-gallery>` + `block.shopify_attributes`.
  - Thứ tự: `selected_or_first_available_variant.featured_media` đầu, phần còn lại `product.media | reject: 'id'` (không trùng).
  - `li#ProductMedia-{id}` + `data-media-id` + `data-media-type` + `--media-ratio`.
  - image: `snippets/image.liquid` bọc `a href=image_url width 2048` (zoom chạy không JS); media đầu `loading=eager fetchpriority=high`, còn lại lazy; sizes `(min-width: 64rem) 58vw, 100vw`.
  - video: `video_tag` controls, `preload: 'none'`, poster `image_size: '1440x'`.
  - external_video: poster + link URL gốc YouTube/Vimeo + `<template data-testid=product-media-external-video-template data-media-id>` chứa `external_video_url: autoplay | external_video_tag` (có title). Không iframe trong DOM lúc tải.
  - model: ảnh preview (decorative) + `model_viewer_tag` reveal interaction phủ lên; BE3 nạp UI qua `Shopify.loadFeatures`.
  - Không media: 1 ô `placeholder_svg_tag 'product-1'`.
  - Thumbnail khi từ 2 media: `a href="#ProductMedia-{id}"`, ảnh 160 crop, nhãn ẩn "Load media N of M", badge play cho video/external. Không render `aria-current`.
  - Zoom: 1 `dialog[scroll-lock]` trống (đã có rule khoá cuộn ở critical.css) + `form method=dialog` nút đóng (đóng được không JS) + `img hidden` không src (width/height 2048 giữ chỗ cho theme check; BE3 đặt src/alt/width/height rồi bỏ hidden).
- `assets/base.css`: `.product` lưới 1 cột → `7fr 5fr` từ 64rem, `product__details` sticky top `header-height + space-6` (header sticky mặc định bật nên cộng header so với D1 `--space-6`). Gallery: flex ngang scroll-snap dưới 64rem (thanh cuộn hiện khi `scripting: none`), xếp dọc từ 64rem; nền cream + `mix-blend-mode: darken` như product card; `scroll-margin-block-start` để anchor không bị header che; thumbnail 64×64; dialog full màn, backdrop dark 60%. Chỉ dùng token css-variables.
- `locales/en.default.json`: gộp `blocks.product_media` (close, label, load_media, play_external, thumbnails_label, zoom, zoom_dialog_label). `en.default.schema.json`: `general.product_media`.

## Hợp đồng cho BE3 (ES1-T69)
- Custom element `product-media-gallery`; item `li[data-media-id][data-media-type]`; thumbnail `a[data-testid=product-media-thumbnail][data-media-id]` (BE gắn `aria-current`, CSS đã có style `[aria-current='true']`).
- External: `a[data-testid=product-media-external-video][data-media-id]` + `template[data-testid=product-media-external-video-template][data-media-id]` cùng li.
- Dialog `#ProductMediaZoom-{block.id}` (testid product-media-zoom-dialog), ảnh `product-media-zoom-image`, nút `product-media-zoom-close`. Zoom link `product-media-zoom-link` href = ảnh 2048.
- Thẻ `<script type="module">` cho product-media.js: BE3 thêm trong block.

## data-testid (17 + template)
container-product-main, container-product-related, container-product-complementary, product-media, product-media-list, product-media-item, product-media-image, product-media-video, product-media-external-video, product-media-external-video-template, product-media-model, product-media-placeholder, product-media-thumbnails, product-media-thumbnail, product-media-zoom-link, product-media-zoom-dialog, product-media-zoom-image, product-media-zoom-close.

## Tự kiểm tra
- `shopify theme check --path .`: 44 file, 0 offense.
- Locale JSON parse OK, key gộp vào `blocks` sẵn có, không trùng.
- Không file JS trong diff.
- Spec: `drafts/dev-fe/ES1-T62/ES1-T62.spec.ts` (8 test, tên bắt đầu "AC1"; nhờ Orchestrator chép sang `tests/e2e/ES1-T62.spec.ts`). Chưa chạy, chưa type-check.
- Playwright desktop + Pixel 7, axe, lhci 96/90/98, LCP media đầu, ảnh 360/768/1280: chờ CI. lhci trang sản phẩm cần ES1-T71 (BENCH_PRODUCT).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
