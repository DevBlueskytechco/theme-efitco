KHÔNG CHẮC: ticket cho chọn "thêm info" hoặc "bỏ default". Đã chọn thêm info, giữ default, để không làm đỏ gate ES1-T176 (/?view=figma). Các default mang claim hoặc tên thương hiệu ("Pick Your Kit, Save As You Go", "Fits: 2.4×2.0 m", "From the Efitco blog") đang chờ Tech Lead trả lời ở ES1-T522.

# ES1-T430: thêm info nhắc nội dung mẫu cho các setting có default chữ mẫu (AC-H33)

## Thay đổi
- `locales/en.default.schema.json`
  - Thêm `info.sample_default`: "Sample text. Replace it with your own."
  - Thêm `info.rich_text_button_label`: câu nhắc mẫu + "Leave empty to hide this button." Tách khỏi `slide_button_label` vì `button_2_label` của slideshow-slide không có default.
  - Thêm câu "Sample text. Replace it with your own." vào đầu các key info chỉ dùng cho setting có default mẫu: `bundle_builder_link`, `featured_collection_tab_label`, `multicolumn_column_heading`, `multicolumn_link_label`, `rich_text_heading_after_image`, `shop_the_look_note`, `spec_label`.
- Schema block, gắn `info` vào setting có default chữ mẫu:
  - bundle-builder: eyebrow, heading (link_label dùng key bundle_builder_link đã sửa)
  - shop-the-look: eyebrow, heading, note_text (link_label và note_title dùng key đã sửa)
  - featured-product: eyebrow, countdown_label (spec_1..4_label dùng spec_label đã sửa)
  - featured-collection: eyebrow, heading (tab_1..4_label dùng key đã sửa)
  - rich-text: heading, body; button_label chuyển sang `info.rich_text_button_label`
  - shop-by-level, blog-posts, video-carousel, multicolumn: eyebrow, heading
  - multicolumn-column: text (heading, link_label dùng key đã sửa)
  - collection-list: heading
- Không sửa: footer, quiz (ES1-T321/T406 đã bỏ default), locales/en.default.json, config/settings_data.json. Grep lại không còn "Get 15% Off", "10,000", "360+", answer freeship, r1..r4, social_, free_shipping.
- Không đổi markup, CSS hay JS. Storefront không đổi.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 9 warning (đều có sẵn trên develop, không thêm mới).
- `grep -n -B1 -E '"default": "[^"]*[A-Z ][^"]*"' blocks/`: mọi default chuỗi đều có dòng `info` ngay trên.
- Diff: 11 block + 1 locale schema. Không có file JS.
- Theme editor (hiện info), Playwright smoke/ES1-T176, Lighthouse: chờ CI. Chỉ đổi schema nên storefront không bị ảnh hưởng.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
