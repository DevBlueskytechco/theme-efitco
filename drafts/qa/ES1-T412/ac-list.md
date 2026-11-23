# ES1-T412 (TS-QA1) — danh sách AC rút từ ticket
Ticket không đánh số AC. QA đánh số theo thứ tự gạch đầu dòng trong body ES1-T412, đối chiếu drafts/techlead/ES1-T304/task-split.md §3 (DoD TS-FE1..FE9, TS-BE1) và §4, ADR 0011 Đo, ADR 0012 Đo. Đầu vào cho `ac_coverage.py`.

## Nhóm @static (đọc repo)
- AC1: templates/index.liquid + layout không `collections['`, `all_products['`, `images['`, `metafields.custom`, `23:59`, `home_demo`, `default_verified` (§22, §8).
- AC2: không còn `logo-efitco` (§14).
- AC3: config/settings_data.json không `social_`, `free_shipping` (§13, §14).
- AC4: config/settings_schema.json có `favicon`, `logo` (§14).
- AC5: `tier_*_percent` default 0 ở bundle-builder, shop-the-look (§8).
- AC6: locales không `10,000`, `15%`, `Warranty`, `aRE`, `&nbsp;` (§8, §14).
- AC7: footer không `efx-pay`/`figma_pay` (§7 Layout).
- AC8: blog dùng `excerpt_or_content` (§7 Blog).
- AC9: tồn tại templates/page.contact.liquid (§7 Page).
- AC10: không `where: 'media_type'` trong blocks/snippets/templates (§4).
- AC11: không `line-clamp`/`ellipsis` trên `.product-card__title`, `.article-card__title`, `.video-card__product-title`, `.product-sticky-bar__title` (§7).
- AC12: product-card không `swatch_colors` (§4).
- AC13: locales schema không `"Eyebrow"`, `"Title"` (§14).

## Nhóm store dev (desktop + Pixel 7 + nojs khi phù hợp)
- AC14: favicon `link[rel=icon]` trả 200 khi có (§14).
- AC15: header-logo = shop.name khi không có logo (§14).
- AC16: số footer-payment-icon = số cổng (§7 Layout).
- AC17: nút newsletter không chứa "15%" khi setting rỗng (§8).
- AC18: 404 có form search + link `/` (§7 404).
- AC19: password có logo hoặc shop.name (§7 Password).
- AC20: gift card QR ≥ 120 × 120 (§7 Gift card).
- AC21: blog có trích đoạn ở bài không excerpt (§7 Blog).
- AC22: POST comment → `[role=status]` (§7 Article).
- AC23: contact gửi lỗi/thành công (§7 Page).
- AC24: `.rte` h5 ≠ h6 computed (§8, §12).
- AC25: quiz `.quiz-option__mark` border contrast ≥ 3:1 (§12).
- AC26: tên sản phẩm dài không bị cắt (scrollHeight ≤ clientHeight, không ellipsis) (§7).
- AC27: featured product có video/3D; bấm Play nạp iframe (§4).
- AC28: focal point A#11: ảnh focal lệch tâm ở image-with-text/shop-the-look/featured, lệch thì mở bug (§4).
