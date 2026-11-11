# 0012. Một snippet media sản phẩm cho PDP, featured product và quickview (rich media)
Ngày: 2026-11-11 | Trạng thái: Đề xuất (ES1-T304, chờ CTO duyệt) | Bổ sung ADR 0008 (quickview template), ADR 0010 (ngân sách JS)

## Bối cảnh
- Theme Store mục 4 yêu cầu rich media (video, YouTube/Vimeo, 3D) ở product template, featured product và quick view. Decisions 11/11 (6) và audit A#22, A#23 đã ghi yêu cầu này.
- Code develop `ce08212`:
  - `blocks/product-media.liquid` (298 dòng) đã render đủ 4 loại `media_type`. Gallery là `<product-media-gallery>`, JS trong `assets/product-media.js` (4 407 B), lắng `theme:variant:change` trên `document`.
  - `blocks/featured-product.liquid:101` lọc `featured.media | where: 'media_type', 'image'`, nên video và 3D bị bỏ. Thumbnail do `assets/featured-product.js` (2 290 B) xử lý.
  - Quickview (TE-3-R2-FE2, ES1-T373) sắp dựng template `product.quick-view` (ADR 0008).
- Ngân sách (ADR 0010): `featured-product.js` sẽ giảm xuống ≤ 1 024 B (ES1-T344), `product-media.js` xuống ≤ 3 072 B (TE-4-R2-BE3). Trang chủ sau cuộn tối đa 65 536 B. Ước hiện tại khoảng 48 651 B.

## Lựa chọn đã cân nhắc
- A. Featured product tự render video/3D và tự thêm JS phát video vào `featured-product.js`. Ưu: không đụng PDP. Nhược: 2 bản markup media, `featured-product.js` vượt 1 024 B, trái ES1-T344. Quickview phải làm bản thứ 3. Loại.
- B. Tách nhánh media thành `snippets/product-media-item.liquid`, 3 nơi gọi chung. Featured và quickview bọc bằng `<product-media-gallery>`, `product-media.js` chạy nhiều instance, nạp lười. Ưu: 1 markup, 1 JS, đúng mục 4 ở cả 3 nơi. `featured-product.js` nhỏ đi. Nhược: `product-media.js` phải sửa để chạy nhiều instance, trang chủ thêm khoảng 4 KB JS khi cuộn tới. Chọn.

## Quyết định
B.
1. FE tạo `snippets/product-media-item.liquid` (`{% doc %}`: `media` (media), `product` (product), `loading` (string), `sizes` (string), `widths` (string), `class_prefix` (string, mặc định `product-media`)). Snippet render image, video (poster, `preload="none"`, không tự chạy), external_video (poster + `<template>` iframe), model (`model_viewer_tag` trên ảnh preview). Testid giữ như PDP.
2. `blocks/product-media.liquid`, `blocks/featured-product.liquid` và template `product.quick-view` gọi snippet trong vòng `for media in …media`. Không lọc theo `media_type`. Featured và quickview có tối đa 8 media.
3. Featured product bọc media bằng `<product-media-gallery data-product-id="{{ featured.id }}">`. BE đặt `data-lazy-module` cho `product-media.js`, nạp khi gallery vào viewport (ADR 0010).
4. BE sửa `product-media.js`: mọi truy vấn trong `this`, `theme:variant:change` chỉ xử lý khi `detail` trùng `data-product-id`. `featured-product.js` bỏ phần media.
5. Chỉ thêm snippet, không thêm block mới. CTO thêm dòng `product-media-item` vào Theme map AGENTS.md.

## Hệ quả
- Tốt: đạt mục 4 rich media ở featured product (TS-FE9, TS-BE1) và quickview (ES1-T373 dùng lại). `featured-product.js` giảm byte trước ES1-T344.
- Xấu: trang chủ thêm `product-media.js` nạp lười (4 407 B, còn khoảng 3 072 B sau TE-4-R2-BE3), tức khoảng 53 KB sau cuộn, vẫn ≤ 65 536. PDP phải chạy lại e2e media.
- Việc:
  - FE: TS-FE9 (snippet, featured).
  - BE: TS-BE1 (`product-media.js` nhiều instance, lazy, gỡ media khỏi `featured-product.js`). TE-4-R2-BE3 (ES1-T357) giữ chạy nhiều instance khi giảm byte.
  - FE: TE-3-R2-FE2 (ES1-T373) gọi snippet.
- Đo:
  - `grep -rn "where: 'media_type'" blocks snippets templates`: bằng 0.
  - `grep -c "render 'product-media-item'" blocks/product-media.liquid blocks/featured-product.liquid`: ≥ 1 mỗi file.
  - `wc -c assets/product-media.js` ≤ 4 407 (≤ 3 072 sau ES1-T357). `wc -c assets/featured-product.js` < 2 290.
  - E2E: featured có YouTube thì bấm Play nạp iframe. Đổi biến thể PDP không đổi ảnh featured. `tests/e2e/ES1-T100.spec.ts` không đỏ thêm.
  - CI ES1-T177: trang chủ sau cuộn ≤ 65 536 B.
