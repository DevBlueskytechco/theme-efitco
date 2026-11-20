KHÔNG CHẮC: DoD ghi `grep -rn "where: 'media_type'" blocks snippets templates` = 0; featured-product = 0 nhưng toàn repo còn 5 chỗ không thuộc gallery (snippets/product-card.liquid:225 ảnh hover card, templates/index.te13.liquid:32-33, templates/index.figma.liquid:50-51 template test). task-split §3 chỉ đo trong featured-product. Đã hỏi Tech Lead: ES1-T523.

# ES1-T409 TS-FE9: rich media featured product (ADR 0012)

## Thay đổi
- `snippets/product-media-item.liquid` (mới): nhánh `case media.media_type` tách từ `blocks/product-media.liquid`. `{% doc %}` params: `media`, `product`, `loading`, `sizes`, `widths`, `class_prefix` (mặc định `product-media`) như ticket; thêm 3 param tuỳ chọn: `zoom` (boolean, mặc định true; featured truyền false vì không có dialog zoom, ảnh không thành link sang file 2048), `index`, `total` (tên link zoom "Open image N of M", PDP cần vì thứ tự media đã đảo theo biến thể). `loading: 'eager'` tự thêm `fetchpriority="high"` (giữ đúng quy tắc LCP PDP). Video: poster, `preload="none"`, `controls`, không autoplay. External: poster + link YouTube/Vimeo, iframe trong `<template>`. Model: `model_viewer_tag` reveal interaction trên ảnh preview. Testid giữ như PDP.
- `blocks/product-media.liquid`: `<li>` giữ nguyên (id, data-media-id, data-media-type, --media-ratio, testid), nội dung gọi snippet. Output PDP không đổi về markup/class/testid; thêm `data-product-id="{{ product.id }}"` trên `<product-media-gallery>` để BE (TS-BE1) lọc `theme:variant:change` theo id — nếu PDP không có thuộc tính này thì bộ lọc của BE sẽ bỏ qua cả PDP.
- `blocks/featured-product.liquid`: bỏ `featured.media | where: 'media_type', 'image'`; vòng `for media in featured.media limit: 8`, `media_total = featured.media.size | at_most: 8`. `div.featured-product__gallery` → `<product-media-gallery class="featured-product__gallery" data-product-id data-media-count>`. Mỗi `li` thêm `data-media-id`, `data-media-type` (giữ `data-featured-media-id`, id `FeaturedMedia-*` cho `featured-product.js` hiện tại tới khi TS-BE1 gỡ). Thumbnail: ảnh từ `media.preview_image`; video/external có nhãn ▶, model có nhãn "3D" (aria-hidden), tên link theo loại ("Show video N of M", "Show 3D model N of M", "Show image N of M"). Giữ testid `featured-product-media`, `featured-product-media-item`, `featured-product-thumbnail`. Không đặt `<script>`/`data-lazy-module` (BE, TS-BE1).
- `assets/base.css`: video/external/model trong `.featured-product__media-item` lấp khung 668/653 (block-size 100%, aspect-ratio auto, video object-fit contain); ảnh featured giữ `mix-blend-mode: normal` (không đổi màu so với trước, snippet gắn class `product-media__image` có darken); `.featured-product__thumbnail` position relative cho nhãn; `.product-media__thumbnail-badge--text` cho nhãn "3D" (token `--font-size-xs`, `--radius-input`, `--line-height-body`). 0 literal màu/px mới. Không xoá CSS cũ: class `featured-product__*` vẫn dùng hết.
- `locales/en.default.json` (gộp vào `blocks.featured_product`): thêm `badge_model`, `thumbnail_video_label`, `thumbnail_model_label`; `media_label` "Product images…" → "Product media…", `thumbnails_label` → "Product media thumbnails".

## Hook cho BE (TS-BE1)
- Root gallery featured: `product-media-gallery.featured-product__gallery[data-product-id][data-media-count]`, list `[data-testid=featured-product-media]`, item `li[data-media-id][data-media-type]`, thumbnail `a[data-testid=featured-product-thumbnail][data-media-id]`. `assets/product-media.js` hiện tìm `[data-testid=product-media-list]` và `[data-testid=product-media-thumbnail]` → BE cần đổi selector (vd `ul` đầu / `a[data-media-id]`) khi gắn `data-lazy-module` + `data-lazy-on` viewport lên gallery featured.
- Trong item: `product-media-external-video` (a) + `product-media-external-video-template`, `product-media-video`, `product-media-model` như PDP. Featured không có `dialog` và không có `product-media-zoom-link`.
- Tới khi TS-BE1 merge: không JS cho featured gallery → bấm poster YouTube/Vimeo mở trang YouTube/Vimeo (fallback không JS), video Shopify phát bằng controls gốc, model hiện poster + model-viewer reveal interaction.

## Ảnh hưởng test
- `tests/e2e/ES1-T156.spec.ts` "AC2 gallery: chỉ ảnh…": tiêu đề lỗi thời (giờ có video/3D); điều kiện vẫn đúng: mỗi item 1 `img` lazy (video: img fallback trong `<video>`; external/model: poster), `data-featured-media-id` còn, href thumbnail = `#id` item. QA cập nhật tiêu đề (TS-QA1).
- `tests/e2e/ES1-T158.spec.ts` thumbnail/scroll: giữ `a[data-featured-media-id]`, `ul` đầu trong featured vẫn là media list.
- PDP `ES1-T69`, `TE-4`, `ES1-T100`: markup item không đổi; chỉ thêm `data-product-id` trên root.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (9 warning có sẵn ở bundle-builder/quiz-step/index*.liquid, không thuộc file PR).
- `grep -n "where: 'media_type', 'image'" blocks/featured-product.liquid` = 0; `grep -rn "where: 'media_type'" blocks snippets templates` = 5 (xem KHÔNG CHẮC, ES1-T523).
- `grep -c "render 'product-media-item'"`: product-media.liquid 1, featured-product.liquid 1.
- Không file JS trong diff; không `<script>`/`data-lazy-module` mới.
- gzip base.css: chờ CI (lệnh gzip bị sandbox chặn trong lượt này; thêm ~0,6 KB raw, ước < 250 B gzip).
- Playwright `ES1-T100.spec.ts`, `smoke.spec.ts`, featured có video (fixture ES1-T331: `[data-testid=featured-product] [data-testid=product-media-video]`): chờ CI. Test cần store dev (TE13_VIDEO_READY) skip thì không tính đạt.
- Lighthouse `/` và PDP (≥ 96/90/98, LCP không đổi — featured media vẫn lazy, PDP media đầu vẫn eager + fetchpriority high): chờ CI.
- Ảnh 3 breakpoint 360/768/1280: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
