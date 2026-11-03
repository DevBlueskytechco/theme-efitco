KHÔNG CHẮC: (1) spec CHƯA chạy: sandbox không có node_modules, PREVIEW_URL, STORE_PASSWORD; npm bị chặn nên không type-check. Mới kiểm: bỏ type + `node --check` đạt. Kết quả thật chờ CI e2e trên PR. (2) Dữ liệu demo trên hoa-qua-nhap-khau (sale, giá thay đổi, unit price, ≥ 2 màu swatch, hết hàng, giá nhỏ) chưa xác minh, nên chưa biết bao nhiêu test bị skip. (3) Ticket ghi tên spec `tests/e2e/TE-3.spec.ts`, Orchestrator yêu cầu đặt theo key nên dùng `tests/e2e/ES1-T53.spec.ts`. Nội dung không phụ thuộc tên file. (4) AC5 chỉ chạy tay trong editor. AC8 thiếu collection đa nguồn (ES1-T48 #6) và cách nhận diện variant chưa chốt (ES1-T54 #1). (5) Badge sale và link "+N" sau khi đổi swatch chưa chốt (ES1-T55) nên spec không kiểm 2 điểm này.

# ES1-T53 — TE-3 Block featured collection và product card (QA1)
Nguồn: docs/srs.md#TE-3 (AC1–AC8 + quy tắc Hết hàng, mục 3), ticket ES1-T53 (2727475000000142027), drafts/techlead/ES1-T47/task-split.md (nhánh feature/ai-ES1-T47; D2–D8), PR ES1-T50 / ES1-T51 / ES1-T52, Figma node 1:490 / 1:502.
Code đọc tại commit 4737a1e (feature/ai-ES1-T53): snippets/product-card.liquid, snippets/price.liquid, blocks/featured-collection.liquid, templates/index.liquid, templates/collection.liquid, assets/product-swatch.js, assets/base.css.
Spec: tests/e2e/ES1-T53.spec.ts. Chạy trên 2 project `desktop` (Desktop Chrome) và `mobile` (Pixel 7). Trang: `/` (container-home-featured-collection, nguồn mặc định collections['all']) và `/collections/all` (phân trang 20).
Tên test bắt đầu bằng ID TC, nên chạy riêng được bằng `-g "TC-11"`.
Cột Trạng thái: chạy = chạy trên mọi store; có điều kiện = skip kèm lý do khi thiếu dữ liệu hoặc env; static = đọc file trong repo; tay = chạy tay, không có trong spec; N/A = chưa kiểm được.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | Desktop, store có ≥ 1 sản phẩm, setting mặc định (products_to_show 8, columns_desktop 4) | Mở / ở bề rộng 360, 767, 768, 1279, 1280 | Số cột `featured-collection-grid` lần lượt 2, 2, 3, 3, `EXPECT_COLUMNS_DESKTOP` (mặc định 4); grid là UL; trang không tràn ngang | E2E | P2 | chạy (chỉ desktop) |
| TC-02 | AC1 | Như TC-01 | Đếm li con của grid | Số li = min(`EXPECT_PRODUCTS_TO_SHOW` (mặc định 8), số sản phẩm của `/products.json`); mỗi li có đúng 1 `product-card` | E2E | P1 | chạy |
| TC-03 | AC1 | Project mobile Pixel 7 (412px) | Mở / | Grid 2 cột, không tràn ngang | E2E | P2 | chạy (chỉ mobile) |
| TC-04 | AC1 | Schema blocks/featured-collection.liquid | Đọc schema | `products_to_show` range 4–12 bước 1 default 8; `columns_desktop` range 3–5 default 4; `collection` kiểu collection; không có presets | static | P2 | chạy |
| TC-05 | AC1 | Heading mặc định "What People Are Buying?" | Mở / | `featured-collection-heading` là H2, có id; section `aria-labelledby` trỏ đúng id; tiêu đề card là H3 | E2E | P3 | chạy |
| TC-06 | AC1 | Như TC-01 | Đọc ảnh card đầu tiên trên / | `loading="lazy"`; `sizes` chứa `calc(1416px / <cột>)`; có `width` và `height` (chống CLS) | E2E | P3 | có điều kiện (card có ảnh) |
| TC-10 | AC2 | Card có option đầu tiên ≥ 2 value có swatch (`TE3_SWATCH_HANDLE` hoặc card đầu tìm thấy) | Mở / và /collections/all | `product-card-swatches` là FIELDSET có 1 legend khác rỗng; 2–5 radio cùng name; đúng 1 radio checked; số `product-card-swatch` = số radio; mỗi radio có `data-variant-id`, `data-variant-url` | E2E | P1 | có điều kiện |
| TC-11 | AC2 | Như TC-10 | Đọc style của label swatch | Mỗi label có `--swatch-color` hoặc `--swatch-image` (swatch.color hoặc swatch.image) | E2E | P2 | có điều kiện |
| TC-12 | AC2 | Như TC-10, JS đã nạp (`product-swatch` đã define) | Click (mobile: tap) swatch chưa chọn | Radio đó checked; `src` ảnh = `data-image-src`, alt = `data-image-alt`, currentSrc đổi theo; href tiêu đề và link ảnh = `data-variant-url`, có `?variant=<data-variant-id>`; giá = nội dung `template[data-price-for]` nếu có, không có template thì giá giữ nguyên; URL trang không đổi; 0 request document mới; width/height ảnh và chiều cao khung không đổi; 0 console error | E2E | P1 | có điều kiện |
| TC-13 | AC2 | Như TC-10 | Focus tiêu đề card, Tab, rồi ArrowRight | Tab đưa focus vào radio đang chọn trong nhóm; ArrowRight chọn radio kế tiếp; ảnh, link, giá đổi như TC-12; focus giữ trên radio mới; không reload | E2E | P1 | có điều kiện |
| TC-14 | AC2 | Như TC-12 | Gỡ card khỏi DOM rồi gắn lại, sau đó click swatch | Vẫn đổi đúng như TC-12, 0 console error (listener không mất, không nhân đôi) | E2E | P3 | có điều kiện |
| TC-15 | AC2 | Đã chọn swatch không mặc định | Bấm tiêu đề sang trang sản phẩm, rồi Back | Card khớp radio đang checked: href tiêu đề = `data-variant-url` của radio checked | E2E | P3 | có điều kiện |
| TC-16 | AC2 | Option swatch có hơn 5 value | Mở /collections/all | Hiện đúng 5 radio + `product-card-swatch-more` chữ "+N", N = số value − 5 (theo `/products/<handle>.js`); link có `tabindex="-1"`, `aria-hidden="true"`, ban đầu trỏ `/products/<handle>` | E2E | P3 | có điều kiện |
| TC-20 | AC3 | Card sale (`TE3_SALE_HANDLE` hoặc card đầu có `product-card-badge-sale`) | Mở / và /collections/all | `price-compare` là thẻ S; giá gạch > giá bán; text badge = `-N%` với N = round((gạch − bán) × 100 / gạch) tính từ giá đọc trên trang; N = 0 thì chữ "Sale" | E2E | P1 | có điều kiện |
| TC-21 | AC3 | Mọi card sale trên trang đầu /collections/all (tối đa 12) | Đối chiếu với `/products/<handle>.js` theo variant trong `?variant=` của tiêu đề | % trên badge = round-half-up số nguyên của (compare_at_price − price) × 100 / compare_at_price tính bằng cents; giá trên trang = price của variant | E2E | P1 | có điều kiện |
| TC-22 | AC3 | Sản phẩm giá nhỏ: compare_at_price dưới 1000 cents (`TE3_SMALL_PRICE_HANDLE` hoặc tự tìm trong `/products.json`) | Mở card | Badge % đúng như TC-21, không ra 0 hoặc 100 do chia nguyên | E2E | P1 | có điều kiện |
| TC-23 | AC3 | Card còn hàng, không sale | Mở /collections/all | Không có `product-card-badge-sale`, không có `price-compare`; có `price-regular` | E2E | P2 | có điều kiện |
| TC-24 | AC3 | Card sale | Đọc text truy cập của `price` (screen reader) | Có nhãn ẩn "Sale price" và "Regular price"; `price-regular` và `price-compare` không chứa nhãn | a11y | P2 | có điều kiện |
| TC-30 | AC4 | Sản phẩm `price_varies` (`TE3_VARIES_HANDLE` hoặc card đầu có `price-range`) | Mở /collections/all | `price-range` dạng "min – max", max > min; min, max khớp price_min, price_max của `.js` (sai số 1 cent) | E2E | P1 | có điều kiện |
| TC-31 | AC4 | Variant có unit price (`TE3_UNIT_PRICE_HANDLE` hoặc card đầu có `price-unit`) | Mở /collections/all | `price-unit` dạng "giá/đơn vị"; `.js` của variant có `unit_price`; có nhãn ẩn "Unit price" | E2E | P2 | có điều kiện |
| TC-32 | AC4 | Card giá không đổi theo biến thể | Mở /collections/all | Không có `price-range`; có `price-regular` | E2E | P3 | có điều kiện |
| TC-33 | AC4 | Card `price_varies` có swatch | Click swatch khác | Khoảng giá được thay bằng giá của variant (nội dung template), không còn `price-range` | E2E | P2 | có điều kiện |
| TC-40 | AC5 | Storefront (không phải editor) | Mở / | Không có `featured-collection-placeholder`; nếu có block thì grid có ≥ 1 card | E2E | P2 | chạy |
| TC-41 | AC5 | blocks/featured-collection.liquid | Đọc Liquid | Block chỉ render khi `has_products or request.design_mode`; placeholder nằm ở nhánh không có sản phẩm; chuỗi hướng dẫn qua `| t` | static | P3 | chạy |
| TC-42 | AC5 | Editor store dev, block trên trang không truyền default_collection hoặc chọn collection rỗng | Xem preview editor | Có heading, dòng hướng dẫn (`blocks.featured_collection.placeholder`) và `products_to_show` ô placeholder | UI | P2 | tay |
| TC-43 | AC5 | Như TC-42, publish preview | Mở storefront | Không có `featured-collection` trong DOM, không chừa khoảng trống | UI | P2 | tay |
| TC-44 | AC5 | Editor, trang chủ, chưa chọn collection | Xem preview | Hiện sản phẩm của collections['all'] (default_collection, ES1-T48 #5), không phải placeholder | UI | P3 | tay |
| TC-50 | AC6 | Card bất kỳ | Đọc thuộc tính link | Mọi link `aria-hidden="true"` trong card (ảnh, +N) có `tabindex="-1"`; tiêu đề là link duy nhất focus được bằng Tab | E2E | P1 | chạy |
| TC-51 | AC6 | Desktop và mobile | Tab tới tiêu đề card | Tiêu đề focused, outline khác none, dày ≥ 2px; Tab tiếp theo vào nhóm swatch (nếu có) hoặc ra khỏi card | a11y | P1 | chạy |
| TC-52 | AC6 | Card có swatch | Focus radio bằng keyboard | Label kế radio có outline khác none (focus-visible) | a11y | P2 | có điều kiện |
| TC-53 | AC6 | Mọi card có ảnh trên / và /collections/all | Đọc alt | alt khác rỗng; card đầu: alt = alt ảnh variant trong `.js`, rỗng thì = product.title | a11y | P1 | có điều kiện |
| TC-54 | AC6 | Mọi swatch, nút Xem tất cả (nếu có), tiêu đề card | Đo boundingBox | Swatch ≥ 24 × 24; nút Xem tất cả cao ≥ 24; tiêu đề ≥ 24 cao hoặc đạt ngoại lệ khoảng cách WCAG 2.5.8 (vòng 24px không chạm target khác) | a11y | P1 | chạy |
| TC-55 | AC6 | / và /collections/all | Chạy axe giới hạn trong `featured-collection` / `collection-products`, trước và sau khi đổi swatch | 0 vi phạm serious/critical cả 2 lần | a11y | P1 | chạy (phần sau đổi có điều kiện) |
| TC-56 | AC6 | Card có swatch | Đọc tên truy cập (screen reader) | Card có đúng 1 link theo role (tiêu đề), tên = product.title; nhóm radio có tên = legend; mỗi radio có tên = tên value | a11y | P1 | có điều kiện |
| TC-60 | AC7 | Setting mặc định `show_view_all` false (không đặt `EXPECT_VIEW_ALL`) | Mở / | Không có `featured-collection-view-all` | E2E | P2 | chạy |
| TC-61 | AC7 | Store đã bật nút, `EXPECT_VIEW_ALL=header` hoặc `bottom` | Mở / | Đúng 1 nút; header → nằm trong header của block, trước grid; bottom → sau grid; tên truy cập bắt đầu "View all" và chứa tên collection; cao ≥ 24 | E2E | P2 | có điều kiện |
| TC-62 | AC7 | Như TC-61 | Bấm nút | Tới pathname của collection.url (`EXPECT_VIEW_ALL_PATH`, mặc định /collections/all), status dưới 400 | E2E | P1 | có điều kiện |
| TC-63 | AC7 | Schema block | Đọc schema | `show_view_all` checkbox default false; `view_all_position` select có header và bottom, default bottom | static | P3 | chạy |
| TC-70 | AC8 | Phần tử product thường (không phải variant) trên / | So `?variant=` của tiêu đề với `.js` | Variant = biến thể còn hàng đầu tiên (selected_or_first_available_variant); radio checked là value của variant đó | E2E | P2 | chạy |
| TC-71 | AC8 | Collection đa nguồn chứa phần tử variant, block đặt collection đó (`TE3_AC8_VARIANT_ID`, `TE3_AC8_PATH`, mặc định /) | Mở trang | Card có tiêu đề `?variant=<id>`; mọi link card có `?variant=<id>`; tên file ảnh = ảnh của variant; giá = giá variant; radio checked = value của variant | E2E | P2 | có điều kiện (N/A tới khi có dữ liệu ES1-T48 #6) |
| TC-72 | AC8 | Như TC-71, card variant không mặc định | Chọn swatch khác rồi chọn lại swatch ban đầu | Link về lại `?variant=<id>` (giữ option khác của variant) | E2E | P3 | có điều kiện |

## Quy tắc Hết hàng (SRS mục 3, áp cho TE-3)
| ID | AC | Given | When | Then | Loại | Ưu tiên | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-80 | AC3 | Sản phẩm hết hàng (`TE3_SOLD_OUT_HANDLE` hoặc card đầu có badge Sold out) | Mở /collections/all | Sản phẩm vẫn có card; badge "Sold out"; không có badge sale (kể cả khi có compare_at); `.js` available false | E2E | P1 | có điều kiện |
| TC-81 | AC1 | Như TC-80, sản phẩm thuộc 8 sản phẩm đầu của collections['all'] | Mở / | Card hết hàng vẫn nằm trong grid featured collection | E2E | P2 | có điều kiện |
| TC-82 | AC1 | Card hết hàng | Kiểm nút thêm vào giỏ | N/A: card TE-3 chưa có quick add (ngoài phạm vi, ES1-T48) | UI | P3 | N/A |

## Case biên (ngoài AC)
| ID | AC | Given | When | Then | Loại | Ưu tiên | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B-01 | AC2 | Trình duyệt tắt JS | Mở /collections/all, click swatch khác | Card render đủ (ảnh, tiêu đề, giá); radio đổi checked; href tiêu đề và src ảnh giữ nguyên (NFR-4: card vẫn dùng được) | E2E | P2 | có điều kiện |
| B-02 | AC2 | Request `product-swatch.js` bị chặn (mất mạng lúc tải asset) | Mở /collections/all, click swatch | Như B-01, không vỡ layout | E2E | P2 | có điều kiện |
| B-03 | AC2 | Trang đã tải, JS đã define, chuyển offline | Click swatch khác | Link và radio vẫn đổi (không cần mạng, 0 fetch) | E2E | P3 | có điều kiện |
| B-04 | AC1 | 360px, tiêu đề sản phẩm dài | Mở / | Không tràn ngang (gộp trong TC-01) | E2E | P2 | chạy |
| B-05 | AC2 | / và /collections/all | Đọc mọi `id` trên trang | Không id trùng (id radio có prefix block/collection) | E2E | P2 | chạy |
| B-06 | AC6 | Sản phẩm không có ảnh | Mở /collections/all | `product-card-placeholder-image` có SVG; tiêu đề, giá vẫn hiện | E2E | P3 | có điều kiện |
| B-07 | AC2 | / và /collections/all | Tải trang, chờ networkidle | 0 console error, 0 pageerror (bỏ script Shopify như smoke.spec.ts) | E2E | P1 | chạy |
| B-08 | AC1 | Store có ít sản phẩm hơn products_to_show | Mở / | Số li = số sản phẩm (gộp trong TC-02 bằng min) | E2E | P3 | chạy |
| B-09 | AC6 | Theme setting `space_base` = 2 hoặc 3 (min schema là 2) | Mở /collections/all, đo swatch | Swatch vẫn ≥ 24 × 24. Đọc code: cao = `--space-5` = space × 6 → 12px / 18px, không đạt. Đã mở bug ES1-T53-01 (ES1-T58) | static | P3 | tay, FAIL theo đọc code |
| B-10 | AC2 | Editor, sửa setting block (Canvas) | Đổi products_to_show, columns_desktop | Preview cập nhật, swatch vẫn chạy sau khi block render lại | UI | P3 | tay |
| B-11 | AC6 | VoiceOver iOS / TalkBack | Đọc card sale có swatch | Đọc: tiêu đề link, "Sale price" giá, "Regular price" giá gạch, nhóm màu tên option, từng màu | a11y | P2 | tay |

## Spec dev giữ / xoá (ghi vào PR)
- Xoá `tests/e2e/ES1-T50.spec.ts`: AC2-markup → TC-10/B-05, AC3 → TC-20, AC4 → TC-30/31, sold-out → TC-80, AC6 → TC-50/51/52/54/55.
- Xoá `tests/e2e/ES1-T51.spec.ts`: AC1 360/768/1280 → TC-01/02/05/06, AC7 → TC-60/61, axe → TC-55.
- Xoá `tests/e2e/ES1-T52.spec.ts`: AC2 click/ArrowDown/axe sau đổi/nối lại DOM/console → TC-12/13/55/14/B-07.
- Giữ: không. Các file đã xoá trong working tree, Orchestrator commit cùng spec mới.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
Không hardcode handle. Không đặt env thì spec tự tìm card đầu tiên có testid tương ứng trong 5 trang đầu của /collections/all. Không tìm thấy thì skip, lý do ghi trong report.
- `TE3_SALE_HANDLE`: sản phẩm có compare_at_price > price (TE-9 AC4 "có sale").
- `TE3_SMALL_PRICE_HANDLE`: sale có compare_at dưới 10 đơn vị tiền (dưới 1000 cents), ví dụ 1.99 → 0.99.
- `TE3_VARIES_HANDLE`: các variant khác giá.
- `TE3_UNIT_PRICE_HANDLE`: variant có unit price (Shopify: unit price measurement).
- `TE3_SWATCH_HANDLE`: option Color có swatch (color hoặc image) với ≥ 2 value; nên có thêm 1 sản phẩm hơn 5 màu để chạy TC-16.
- `TE3_SOLD_OUT_HANDLE`: mọi variant tồn kho 0, không cho bán khi hết.
- `TE3_AC8_VARIANT_ID`, `TE3_AC8_PATH`: chờ ES1-T48 #6.
- `EXPECT_PRODUCTS_TO_SHOW`, `EXPECT_COLUMNS_DESKTOP`, `EXPECT_VIEW_ALL` (header|bottom), `EXPECT_VIEW_ALL_PATH`: chỉ đặt khi block trên store dev đã đổi khỏi mặc định. Preview CI dùng mặc định.

## Bug
- ES1-T53-01 = ticket ES1-T58 (P3, dev-fe): swatch dưới 24px khi `space_base` dưới 4. File drafts/qa/ES1-T53/bugs/ES1-T53-01.md.

## KHÔNG CHẮC
- Badge sale/Sold out không đổi theo swatch, và link "+N" nhận `?variant=` sau khi đổi: chờ ES1-T55. TC-12 bỏ link "+N" khỏi phép so href, không kiểm badge sau khi đổi.
- Cỡ heading 48 hay 36 (ES1-T54 #2): spec không kiểm cỡ chữ.
- TC-54: tiêu đề card là link inline, bounding box có thể thấp hơn 24px (khoảng 19px với chữ 16px). Spec áp ngoại lệ khoảng cách WCAG 2.5.8. Nếu PO muốn cứng ≥ 24px thì đổi assertion.
- axe giới hạn trong vùng TE-3, không quét toàn trang. Toàn trang đã có ở smoke.spec.ts.
