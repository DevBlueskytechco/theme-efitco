KHÔNG CHẮC: (1) ticket yêu cầu bỏ param `{% doc %}` dữ liệu khi block đã có setting, nhưng `handle` (collection-card, level-card, blog-posts), `default_tab_2..4_collection` (featured-collection), `video_id`/`video_host` (video-card) đang được index.te13/te15/te16/figma dùng, mà ticket cấm sửa index.*.liquid và DoD yêu cầu ES1-T176 (`/?view=figma`) không đỏ thêm. Giữ các param này, doc ghi "Test templates only", hỏi Tech Lead ở ES1-T444. (2) image-with-text layout split không ảnh vẫn in khung tối trên storefront (thiết kế có chủ đích, spec ES1-T120 kiểm). Với why-choose trên theme mới cài, khung này còn tới khi TS-FE4 làm rỗng chữ mẫu. Không sửa trong PR này.

# ES1-T405 TS-FE3: index.liquid và theme.liquid không còn tài nguyên demo (ADR 0011 mục 2; Theme Store §22, §8)

Ticket: ES1-T405 (parent ES1-T304, task-split §3 TS-FE3). Chặn bởi ES1-T331 (fixture đã merge #196).

## Thay đổi
- `templates/index.liquid`: xoá 114 dòng dữ liệu demo: 25 handle `figma-*`, `all_products[...]`, 34 `images['efx-*']`, `media-dủ-loại`, `metafields.custom.demo_video`, YouTube `aqz-KE-bpKQ`, `home_demo`, countdown "hôm nay 23:59", fallback `collections.all`. Mọi thẻ `{% block %}` chỉ còn `id` và tham số cấu trúc: `tag`, `background`, `layout`, `priority`, `step`, `total`, `look_row`, `open`, `results_popup`, `preselect`, `hide_options`, `overlay_opacity`. Bỏ toạ độ hotspot theo ảnh demo, block dùng default schema, fixture đặt lại. Chữ mẫu `default_*` giữ nguyên vì thuộc TS-FE4 (ES1-T406).
- `layout/theme.liquid`: bỏ `newsletter_image: images['efx-news.jpg']`. Footer vốn đọc `block.settings.newsletter_image`.
- `blocks/testimonial-item.liquid`: Verified chỉ theo setting `verified` (mặc định tắt, E9). Bỏ nhánh `default_verified`.
- `blocks/featured-product.liquid`: countdown chỉ đọc setting `countdown_end` (ngày thật, ADR 0009). Bỏ `default_countdown_end`. Doc thêm `@param hide_options`.
- `blocks/featured-collection.liquid`, `blocks/bundle-builder.liquid`: bỏ param `default_collection` vì không template nào dùng, nguồn chỉ còn setting `collection`. Bundle-builder thêm doc `@param preselect`.
- `blocks/collection-card.liquid`, `level-card.liquid`, `blog-posts.liquid`, `featured-collection.liquid` (`default_tab_N_collection`): doc ghi "Test templates only (ADR 0011)", `@example` bỏ handle.
- Không đổi schema, locale, CSS. Không file JS.

## Theme mới cài (chưa có fixture)
Mọi block nguồn rỗng tự ẩn trên storefront và hiện placeholder trong editor; logic này đã có sẵn, PR không đổi:
- Không in gì: collection-list, shop-by-level, featured-collection, shop-the-look, bundle-builder, featured-product, video-carousel (8 card không nguồn), blog-posts, FAQ cột ảnh.
- `container` không có body thì không in band.
- Testimonials vẫn hiện chữ mẫu, không ảnh, không sản phẩm, không Verified. Phần chữ mẫu thuộc TS-FE4.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi. Warning giảm từ 22 (develop) xuống 9: 7 dòng `UnrecognizedBlockArguments` của index.figma/te12 có từ trước, cộng `default_checked` ở quiz-step.
- `grep -nE "figma-|efx-|all_products\[|demo_video|aqz-KE-bpKQ|23:59|home_demo|default_verified" templates/index.liquid layout/theme.liquid`: 0 dòng.
- Grep ADR 0011 (`collections\['|all_products\['|images\['|metafields\.custom|23:59|home_demo` trên templates/layout, trừ index.*): 0 dòng.
- `npx playwright test -c drafts/qa/ES1-T331/tools/static.config.ts -g "Fixture tĩnh"`: 6/6 pass. TC-05 trước đây skip, giờ chạy thật.
- Không file `.js` trong diff.
- Preview, `ES1-T176.spec.ts`, `smoke.spec.ts`, Lighthouse, ảnh trang chủ 1280 trước/sau fixture: chờ CI. Lần đo sau fixture cần DevOps áp `tests/fixtures/home-figma.json` (ES1-T428).

## Spec bị ảnh hưởng
Ticket QA ES1-T445.
- Đỏ cả khi đã áp fixture, vì E9 tắt Verified: `ES1-T118.spec.ts:211` và `ES1-T179.spec.ts:62` kỳ vọng `testimonial-verified` = 4.
- Đỏ khi chưa áp fixture, xanh lại sau fixture: `TE-3.spec.ts:217` (featured-collection trên `/`), ES1-T147, T148, T156, T157, T175, T182, T183, T188, T235 (đọc dữ liệu trang chủ). ADR 0011 phần Hệ quả đã ghi trước điều này.
- `/?view=figma` không còn Verified và countdown giả, vì block không đọc `default_verified`/`default_countdown_end` nữa.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
