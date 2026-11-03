KHÔNG CHẮC: (1) Figma 1:490 có tabs 4 collection, badge rating 5.0, badge New, và figma-inventory gán block 3 (1:395) + collection list 1:464 vào TE-3 — không có trong TE-3 AC1–AC8 → để ngoài task, hỏi PO ở ES1-T48; (2) param `default_collection: 'all'` trên trang chủ làm AC5 "chưa chọn" không xảy ra ở index — PO xác nhận ES1-T48 #5; (3) cách Liquid nhận diện phần tử variant trong collection đa nguồn (Editions #20, AC8) không có trong nguồn dự án → Dev FE tra shopify.dev trong FE2, dữ liệu test hỏi ES1-T48 #6; (4) gap mobile, kiểu/kích thước swatch, radius ảnh, vị trí nút Xem tất cả, Sold out badge là mặc định kỹ thuật, Designer xác nhận ở ES1-T49.

# ES1-T47 — Chia TE-3 Block featured collection và product card thành task FE/BE

Nguồn: docs/srs.md#TE-3 (AC1–AC8 + quy tắc Hết hàng), docs/figma-inventory.md block 5 (1:490), docs/figma/snapshot-1-359.json (1:490–1:505), docs/figma/img/1-490.png, DESIGN.md, docs/architecture.md, ADR 0001–0005, AGENTS.md, templates/collection.liquid (ES1-T46).
Ước lượng chốt TE-3: 11 point dev (FE 8, BE 3) + 1 task QA không point. SRS sơ bộ 8 point chưa tính snippet price dùng lại và AC8. Báo PO, không đổi phạm vi.

## Quyết định kỹ thuật

D1 Chia file:
- `snippets/product-card.liquid` + `snippets/price.liquid` (FE1) — dùng lại ở TE-4 (price), TE-6 (card), TE-11 (card). Không tách `badge` snippet: 2 badge chỉ dùng trong card, gộp tránh thêm file Sidekick phải đọc (ADR 0004).
- `blocks/featured-collection.liquid` (FE2), gọi trong `templates/index.liquid` bằng container riêng `id: 'home-featured-collection'`.
- `assets/product-swatch.js` (BE1) — tên theo docs/architecture.md.
- FE1 thay `render 'image'` trong `templates/collection.liquid` bằng `render 'product-card'` (giữ fix ES1-T46): TE-6 AC1 vốn yêu cầu "card như TE-3", và FE1 cần trang kiểm thử trước khi FE2 xong. Không làm gì khác của TE-6.

D2 Product card:
- Params doc: `product` (bắt buộc), `variant` (tuỳ chọn, AC8), `id_prefix`, `sizes`, `loading` (lazy), `heading_level` (h3). `card_variant = variant | default: product.selected_or_first_available_variant`; ảnh, giá, link `?variant=`, swatch chọn sẵn đều từ `card_variant` → AC8 không cần nhánh code riêng.
- 1 tab stop cho link sản phẩm: tiêu đề là link; link ảnh `tabindex="-1" aria-hidden="true"`. Ảnh 1:1 (Figma 336 × 336), nền `--color-background-cream` (#F5F5F1 khớp Figma), alt từ ảnh, rỗng thì `product.title`; không ảnh → `placeholder_svg_tag`.
- Badge: Sold out khi `product.available` false, thay chỗ badge sale (quy tắc Hết hàng SRS). Sale khi `compare_at_price` > `price` của `card_variant`; % = `(compare_at − price) × 100.0 / compare_at | round` (nhân 100.0 để chia số thực, đúng với giá nhỏ); ra 0 → chữ "Sale" không số.
- Price: `price_varies` và không có `variant` → `price_min – price_max`; ngược lại giá + giá gạch có nhãn ẩn cho screen reader; `unit_price_measurement` → unit price / reference. Chuỗi qua `t`.

D3 Swatch markup (FE1, không JS):
- Option đầu tiên có `values.first.swatch` khác blank và ≥ 2 values (AC2). `fieldset` + `legend` ẩn, mỗi value 1 `input type=radio` + `label` pill (`swatch.color` hoặc `swatch.image`). Radio gốc cho keyboard (Tab vào nhóm, mũi tên, Space) → BE không phải viết roving tabindex, JS nhỏ.
- Hình 32 × 16 radius pill trong vùng bấm 32 × 24 (AC6 ≥ 24px; Figma 16px không đạt). Tối đa 5, dư → "+N" link tới sản phẩm (Figma có layer ẩn "+ 2 Colors").
- Không JS: radio chỉ đổi trạng thái chọn, link card vẫn tới variant mặc định — chấp nhận, card vẫn dùng được.

D4 Block featured-collection: 7 settings `collection`, `products_to_show` (4–12, 8), `columns_desktop` (3–5, 4), `eyebrow`, `heading` (inline_richtext), `show_view_all` (false — Figma không có nút), `view_all_position` (header/bottom, bottom). Lưới ul/li CSS grid: dưới 48rem 2 cột gap `--space-4`; 48–80rem 3 cột; từ 80rem `--columns` gap `--space-5` (Figma 24). Không carousel (AC1 ghi lưới). `sizes` theo cột để ảnh không quá cỡ (ADR 0003). Nguồn: setting, blank thì `collections[default_collection]` (param không schema, template truyền `'all'`) — preview CI không có giá trị block setting, không có default thì E2E trang chủ không có gì để test và trang chủ cài mới trống (TE-9 AC1). AC5: rỗng → placeholder chỉ khi `request.design_mode`, storefront không xuất gì.

D5 Không partial cho TE-3: đổi swatch không cần server — FE xuất sẵn trên mỗi radio `data-variant-id`, `data-variant-url`, `data-image-src`, `data-image-srcset`, `data-image-alt`; card có `data-card-image`, `data-card-link`, `data-card-price`; khi `price_varies` thêm `template data-price-for="{variant_id}"` chứa price snippet của variant. Lý do: 0 request mạng, không phụ thuộc `agentic_editor_enabled` (vấn đề ES1-T20), HTML thêm khoảng 1–2 KB/card ở tối đa 5 swatch. Tên partial BE phải bám: không có.

D6 JS (ADR 0002): `assets/product-swatch.js`, custom element `product-swatch` = root của card (FE render thẻ, CSS `display: block`). 1 listener `change`/card, đổi srcset trước src, giữ width/height (CLS 0). Thẻ `script type=module` do BE thêm 1 lần trong block và collection template. Ngân sách: JS hiện 17 769 B (4 file) + tối đa 8 192 = tối đa 25 961, dưới 40 KB.

D7 data-testid (hợp đồng FE → BE/QA, đổi tên phải báo trong ticket):
- Card: `product-card`, `product-card-image`, `product-card-title`, `product-card-badge-sale`, `product-card-badge-sold-out`, `product-card-swatches`, `product-card-swatch`, `product-card-swatch-more`, `product-card-placeholder-image`.
- Price: `price`, `price-regular`, `price-compare`, `price-range`, `price-unit`.
- Block: `featured-collection`, `featured-collection-heading`, `featured-collection-grid`, `featured-collection-view-all`, `featured-collection-placeholder`; container `container-home-featured-collection`.
- BE hook (data attribute, không phải testid): xem D5.

D8 Test: dev viết `tests/e2e/<key ticket>.spec.ts`, tên test bắt đầu bằng mã AC để chạy `-g`. QA1 gộp thành `tests/e2e/TE-3.spec.ts`. Dữ liệu demo trên hoa-qua-nhap-khau (TE-9 AC4): sale, giá thay đổi, unit price, ≥ 2 màu swatch, hết hàng; thiếu thì skip có lý do.

## Bảng task

| Mã | Ticket | Phía | Pt | Tên | Giải pháp | DoD | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TE-3-FE1 | ES1-T50 | FE | 5 | snippets/product-card.liquid + snippets/price.liquid + templates/collection.liquid + assets/base.css + locales: 1 card, badge sale % và Sold out, khoảng giá, unit price, swatch radio không JS, variant AC8, 14 data-testid | D1, D2, D3, D5, D7 | `shopify theme check` 0; grep hex/rgb/hsl trong base.css 0 dòng mới; `npx playwright test tests/e2e/ES1-T50.spec.ts -g "AC3\|AC4\|AC6\|AC2-markup\|sold-out"` pass /collections/all desktop + mobile; axe 0 serious; swatch hit area ≥ 24px; lhci ≥ 96/90/98; ảnh 3 breakpoint | — |
| TE-3-FE2 | ES1-T51 | FE | 3 | blocks/featured-collection.liquid + templates/index.liquid + assets/base.css + locales: 7 settings, lưới 2/3/3–5 cột, 4–12 sản phẩm, placeholder editor, Xem tất cả 2 vị trí, 5 data-testid | D1, D4, D7; AC8 nhận diện variant theo shopify.dev | theme check 0; `npx playwright test tests/e2e/ES1-T51.spec.ts -g "AC1\|AC7"` pass ở 360/768/1280; AC5 tay trong editor; axe 0 serious; lhci ≥ 96/90/98; ảnh 3 breakpoint + so Figma 1:490 | FE1 |
| TE-3-BE1 | ES1-T52 | BE | 3 | assets/product-swatch.js + thẻ script trong featured-collection và collection template: 1 custom element, đổi ảnh + link ?variant= + giá không reload, keyboard radio, tối đa 8 KB | D5, D6 | `wc -c assets/product-swatch.js` tối đa 8192, tổng `assets/*.js` tối đa 40960; `npx playwright test tests/e2e/ES1-T52.spec.ts -g "AC2"` pass (chuột + mũi tên, không navigate); 0 console error; axe sau đổi swatch 0 serious; lhci ≥ 96/90/98, CLS không tăng; theme check 0 | FE1, FE2 |
| TE-3-QA1 | ES1-T53 | QA (e2e_from_story) | — | tests/e2e/TE-3.spec.ts + drafts/qa/ES1-T53/test-cases.md, AC1–AC8 | D7, D8; AC5 tay, AC8 theo ES1-T48 #6 | `npx playwright test tests/e2e/TE-3.spec.ts` pass desktop + Pixel 7; mỗi AC1–AC7 ≥ 1 test; axe 0 serious trước/sau đổi swatch | FE1, FE2, BE1 |

Ghi chú: `\|` trong bảng là `|`; lệnh nguyên văn xem body ticket con. lhci = `npx lhci autorun` (desktop ≥ 96, mobile ≥ 90, accessibility ≥ 98).

Ánh xạ AC: AC1 FE2 · AC2 FE1 (markup) + BE1 (đổi không reload) · AC3 FE1 · AC4 FE1 · AC5 FE2 · AC6 FE1 (focus, alt, hit area) + FE2 (lưới) · AC7 FE2 · AC8 FE1 (card theo variant) + FE2 (truyền variant) + BE1 (swatch chọn sẵn giữ đúng khi đổi). Thứ tự: FE1 → FE2 → BE1 → QA1.

Câu hỏi: ES1-T48 (PO: tabs, rating, New, collection list 1:395/1:464, default_collection, dữ liệu AC8) · ES1-T49 (Designer: gap mobile, swatch, radius ảnh, nút Xem tất cả, số swatch, Sold out). Không chặn task nào; trả lời khác mặc định thì sửa trong task tương ứng.

Ngoài phạm vi (chờ ES1-T48): tabs 1:496, badge rating, badge New (không có token màu xanh #4B824D), quick add, hover card.
