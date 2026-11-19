KHÔNG CHẮC: (1) nhánh feature/ai-ES1-T347 không có `drafts/techlead/ES1-T307/task-split.md` và `docs/adr/0007–0010`; tên partial, hợp đồng dữ liệu, xử lý partial trùng tên nhiều instance dưới đây là ĐỀ XUẤT, hỏi Tech Lead ở ES1-T414. (2) Hành vi server của `?option_values=` (H1–H6 mục 5) chưa kiểm trên preview: sandbox agent không gọi mạng, chờ CI chạy `tests/e2e/ES1-T347.spec.ts`. (3) Dữ liệu D3 `demo-many-variants` (ES1-T282, demo-data-b2b.md) chưa biết đã tạo trên store dev chưa; spec skip có lý do khi thiếu.

# ES1-T347 · TE-4-R2-BE1 · Spike: đổi biến thể theo option value (TE-4 AC15, AC16)

Nguồn: docs/srs.md TE-4 AC2, AC5, AC12–AC17, NFR-7; docs/ui-spec/variant-picker.md §2, §4–§6, §12; docs/ui-spec/product.md §17; docs/design/decisions.md 10/11 (2048 biến thể, M4), 11/11 (VP1); AGENTS.md mục JS (partials, AbortSignal, replaceState); ADR 0002, 0006; drafts/ba/ES1-T294/demo-data-b2b.md D3.

Kết luận ngắn:
- Code hiện tại KHÔNG đạt AC16 và chỉ đạt một phần AC15: bộ chọn dựng từ JSON `product.variants` (≤ 250), tự tính trạng thái ở client, gán `id` trước khi tải xong, không khoá Add To Cart lúc chờ, không có lỗi + Try Again.
- Hướng làm: bỏ JSON biến thể; mỗi lần đổi gom `data-option-value-id` → `partials.fetch(...names, { url: <product url>?option_values=a,b,c, signal })` → `partials.apply`; bộ chọn nằm trong partial để server trả trạng thái 3 loại; biến thể đang chọn đọc từ 1 JSON nhỏ (1 biến thể) trong partial. Không cần JS biết danh sách biến thể → đúng tới 2048.
- Cần FE đổi markup trước (mục 7). BE viết lại `assets/product-variant-picker.js`, nhắm ≤ 6 144 B; sửa nhỏ `assets/product-form.js` không cần (chặn submit bằng listener capture trong picker).

## 1. AC cần đạt

- AC15: bấm giá trị → radio chọn ngay; vùng giá + tồn `aria-busy` + trạng thái tải; Add To Cart giữ màu/nhãn/bề rộng, `aria-disabled="true"`, không spinner, bấm không thêm giỏ; xong thì giá, compare_at, badge %, ảnh, tồn, nút, countdown, sticky bar, trạng thái giá trị option khác cập nhật; bấm liên tiếp chỉ áp lần cuối; PDP `?variant=` bằng replace; quickview không đổi URL nền, chỉ đổi "View Detail"; lỗi → giữ biến thể cuối đã tải, `role="alert"` + Try Again.
- AC16: sản phẩm > 250 biến thể (D3: 304 biến thể, 190 lb / Pair / Blue sau vị trí 250) → giá, tồn, ảnh, nút đúng; thêm giỏ đúng biến thể đó.

## 2. Hiện trạng (develop, đọc 11/11)

| # | Chỗ | Hiện tại | Hệ quả với AC15/AC16 |
| --- | --- | --- | --- |
| C1 | `snippets/variant-json.liquid` | `{% for variant in product.variants %}` → JSON mọi biến thể | `product.variants` trả tối đa 250 → biến thể thứ 251+ không có trong JSON. Trái NFR-7. |
| C2 | `product-variant-picker.js` `match()` | tìm biến thể trong JSON theo tên giá trị | 190 lb / Pair / Blue không tìm thấy → `unavailable()` → nút "Unavailable" dù biến thể có thật: AC16 FAIL. |
| C3 | `syncAvailable()` | tự tính `data-available` từ JSON | sai với > 250 biến thể; không phân biệt hết hàng / không tồn tại (AC13). |
| C4 | `update()` | gán `idInput.value = v.id` và `replaceState` TRƯỚC khi fetch | bấm Add To Cart lúc đang tải thêm biến thể mới nhưng giá trên màn là biến thể cũ; không có `aria-disabled`: AC15 FAIL (VP1). |
| C5 | `update()` lỗi | `restore()` nút/tồn, nhưng radio, id, URL đã đổi | sau lỗi id và URL là biến thể mới, giá là biến thể cũ; không alert, không Try Again: AC15 FAIL. |
| C6 | `snippets/product-variant-picker.liquid` | nằm NGOÀI partial; radio `value="{{ value.name }}"`; `checked` so `current_variant.options[i]` | trạng thái giá trị không được server cập nhật sau đổi; radio không mang id để gửi `option_values` trực tiếp (đã có `data-option-value-id`, dùng được). |
| C7 | `blocks/product-form.liquid` | `<input type=hidden name=id>` ngoài partial | JS phải tự đặt id; không có nguồn id từ server sau đổi (hiện lấy từ JSON). |
| C8 | `snippets/product-variant-select.liquid` | noscript `<select name=id>` lặp `product.variants` | trái NFR-7 / variant-picker §2; không JS chỉ mua được biến thể đầu (product.md §17 chấp nhận). Việc FE. |
| C9 | `assets/featured-product.js` + `variant-json price_html` | ≥ 2 featured-product → đọc JSON thay partial (ES1-T169 D4) | đường này phải bỏ cùng JSON; cần hướng xử lý partial trùng tên (ES1-T414 #2). |
| C10 | sự kiện `shopify:product:select`, `theme:variant:change` | payload dựng từ JSON | đổi sang đọc JSON 1 biến thể trong partial (mục 4.3). |

Đã đúng, giữ: `AbortController` mỗi request, `aria-busy` trên `product-form`, live region `role=status`, `partials.fetch` + `apply` một lần cho nhiều vùng, `data-fetch-url` / `data-regions` cho ngữ cảnh ngoài PDP (không `replaceState`).

## 3. Luồng đề xuất (một module cho PDP, featured product, quickview)

```
change trên radio option (trong picker)
  ├─ value có data-product-url khác sản phẩm hiện tại → combined listing: PDP location.assign, quickview tải lại sản phẩm đó (ngoài AC)
  ├─ ids = [...fieldset].map(f => f.querySelector(':checked').dataset.optionValueId)
  ├─ pending(true): root[data-variant-pending], vùng giá+tồn aria-busy, nút add aria-disabled, status "Loading {value}…"
  ├─ controller?.abort(); controller = new AbortController()
  ├─ url = new URL(base); url.searchParams.set('option_values', ids.join(',')); giữ selling_plan nếu đang chọn; KHÔNG gửi variant
  ├─ update = await partials.fetch(...names, { url, signal })      // names theo ngữ cảnh
  ├─ if (controller !== this.controller) return                     // last-click-wins, thêm vào abort
  ├─ await partials.apply(update)
  ├─ v = JSON trong [data-selected-variant] (null = tổ hợp không tồn tại)
  ├─ idInput.value = v?.id ?? giữ cũ; nút đã do server render (Sold Out / Unavailable)
  ├─ PDP: v && history.replaceState(state, '', ?variant=v.id)   | quickview: link View Detail đã do partial render
  ├─ loaded = ids; xoá alert; khôi phục focus + trạng thái "+N" (AC14)
  ├─ emit shopify:product:select, theme:variant:change { variantId, featuredMediaId }
  └─ status "{value}, {price}, {availability}"
catch (không phải AbortError)
  ├─ radio về `loaded` (biến thể cuối đã áp), id/URL không đổi vì chưa đụng
  ├─ alert dưới fieldset vừa bấm: "Couldn't load {value}. Check your connection." + nút Try Again (gửi lại ids lỗi)
  └─ focus ở radio đã khôi phục nếu focus đang trong picker
finally (controller vẫn là hiện tại) → pending(false)
```

Điểm chốt:
- Không đổi `id` trước khi có kết quả (sửa C4). Bấm Add To Cart trong lúc chờ: picker nghe `submit` ở `document` pha capture, `form === this.form` và đang pending → `preventDefault()` + `stopImmediatePropagation()`; không cần import chéo `product-form.js` (ES1-T81). Nút sticky bar cùng `form=` nên cùng bị chặn.
- `apply()` giữ giá trị input cũ khi markup mới đổi (AGENTS.md) → sau apply phải đặt lại tường minh: `idInput.value`, radio `checked` theo `value.selected` server trả (đọc thuộc tính `checked` trong markup mới, hoặc `data-selected`), radio selling plan.
- Lỗi xác định: `partials.fetch` ném (mạng, 5xx) hoặc update thiếu partial tên chính (H5) → coi là lỗi.
- Không giảm request bằng debounce: AC15 yêu cầu lần cuối thắng, abort đủ; mũi tên bàn phím mỗi lần một `change` (variant-picker §7).
- Không cache kết quả theo ids ở bản đầu (đơn giản, tránh giá cũ); cân nhắc sau khi đo.

### 3.1 Ngữ cảnh

| Ngữ cảnh | URL nền | Tên partial | URL trang |
| --- | --- | --- | --- |
| PDP | `location.pathname` (giữ locale/market, AGENTS.md) | `product-options product-price product-countdown product-buy-buttons product-installments product-pickup product-selling-plans product-sticky-bar` | `replaceState ?variant=` |
| Featured product (1 block) | `data-fetch-url` | `data-regions` | không đổi |
| Featured product ≥ 2, quickview | `data-fetch-url` (`?view=<template phụ>` đề xuất) | bộ tên riêng, chờ ES1-T414 #2 | không đổi; quickview chỉ "View Detail" (partial in sẵn `?variant=`) |

Ảnh biến thể: `product-media` không là partial; giữ sự kiện `theme:variant:change` với `featuredMediaId` lấy từ JSON 1 biến thể (product-media.js, featured-product.js đã nghe).

## 4. Hợp đồng markup FE cần cấp (đề xuất, chờ ES1-T414)

4.1 Picker trong partial `product-options` (bọc nội dung bên trong `<product-variant-picker>`, thẻ host ở ngoài để element không bị thay):
- Radio: `value="{{ value.id }}"`, `data-option-value-id="{{ value.id }}"`, `checked` theo `value.selected`; `data-state="available|sold_out|unavailable"` theo `value.available` / `value.exists`; `data-product-url` khi combined listing khác sản phẩm.
- Mỗi fieldset: `data-option-position`, vùng lỗi `data-testid="product-option-error"` `role="alert"` rỗng, nút `data-testid="product-option-retry"` có `hidden`.
- Host: `data-label-loading` ("Loading [value]…"), `data-label-loaded` ("[value], [price], [availability]"), `data-label-load-error` ("Couldn't load [value]. Check your connection."). Liquid in placeholder bằng `| t: value: '[value]'`.

4.2 Partial `product-buy-buttons`: input hidden `name=id` (hoặc `data-variant-id` trên vùng), nút + dòng tồn đã đúng trạng thái 3 loại (In stock / Sold Out / Unavailable do Liquid quyết, JS không còn `data-label-unavailable` để dựng).

4.3 JSON 1 biến thể (không phải danh sách, hợp NFR-7), trong `product-buy-buttons`:
```
<script type="application/json" data-selected-variant>
  {"id":…,"title":…,"available":…,"price":…,"compare_at_price":…,"options":[…],"featured_media":…}   // hoặc null
</script>
```
Biến thể = `product.selected_or_first_available_variant`; in `null` khi tổ hợp đang chọn không tồn tại (cách nhận biết theo H2). Chỉ 1 object, không lặp `product.variants`. Dùng cho: id, sự kiện chuẩn, `featuredMediaId`, câu status.

4.4 Vùng giá + tồn có hook để JS đặt `aria-busy` và FE vẽ skeleton theo `[data-variant-pending]` trên `product-form` (JS không style inline).

4.5 Bỏ: `{% render 'variant-json' %}`, noscript `product-variant-select` lặp biến thể (C8), JSON `price_html` (C9).

## 5. Giả thuyết cần kiểm trên preview (spec ES1-T347 kiểm)

| # | Giả thuyết | Nếu sai |
| --- | --- | --- |
| H1 | `GET <product url>?option_values=a,b,c` kèm tham số của partial-rendering trả partial cho đúng biến thể, kể cả biến thể sau vị trí 250. | Hỏi Tech Lead; phương án dự phòng: `?variant=<id>` không làm được vì JS không có id (cấm JSON) → không có dự phòng tương đương. |
| H2 | Tổ hợp không tồn tại: `product.selected_variant` rỗng, `value.selected` vẫn phản ánh `option_values` đã gửi. | FE tính "không tồn tại" bằng so sánh `value.selected` từng option với `selected_or_first_available_variant.options[i]`. |
| H3 | `value.available`, `value.exists` trong response tính theo lựa chọn đã gửi. | Không có đường JS thay thế hợp NFR-7; báo CTO. |
| H4 | `partials.apply` thay đúng vùng cùng tên, không đụng thẻ host `<product-variant-picker>` nằm ngoài partial (listener giữ). | Nếu apply thay host: init lại ở `connectedCallback`, giữ `loaded` trên `product-form`. |
| H5 | 5xx / mạng hỏng: `partials.fetch` reject. | Kiểm update có đủ tên chính, thiếu thì xử như lỗi. |
| H6 | `apply` giữ `checked` cũ của radio khi markup mới đổi. | Đặt lại tường minh sau apply (đã đưa vào luồng). |

## 6. AC16 cụ thể

- Với luồng mục 3, JS không cần biết biến thể nào tồn tại: gửi 3 id giá trị, server giải. Biến thể 190 lb / Pair / Blue (D3, sau vị trí 250) đi đúng một đường như mọi biến thể → hết lỗi C2.
- `/cart/add.js` gửi `id` từ input hidden đã đặt theo JSON 1 biến thể → đúng biến thể. Kiểm: `/cart.js` có dòng `variant_title` "190 lb / Pair / Blue", giá dòng = giá đang hiện.
- 190 lb là giá trị thứ 38 / 40 của Weight → bị thu gọn sau "+N" (AC14): test bấm `product-option-more` trước nếu ô đang `hidden`.
- Trang mở thẳng `?variant=<id sau 250>`: Liquid đã render đúng (server), không phụ thuộc JS.

## 7. Tách việc đề xuất

| Việc | Phía | Nội dung | Phụ thuộc |
| --- | --- | --- | --- |
| FE | FE | mục 4: picker trong partial `product-options`, radio value id + `data-state`, vùng lỗi + Try Again, JSON 1 biến thể, id trong partial, bỏ variant-json / noscript select lặp biến thể, nhãn `data-label-*`, chuỗi locales variant-picker §10 | ES1-T414 |
| BE2 | BE | viết lại `product-variant-picker.js` theo mục 3; bỏ nhánh JSON của `featured-product.js` (theo ES1-T414 #2); cập nhật `tests/e2e/ES1-T66.spec.ts` (đang chọn radio theo `value=<tên>`, đọc `/products/<handle>.js` ≤ 250 biến thể) | FE |
| BE "+N" (AC14) | BE | file riêng nạp bằng `import()` khi có `product-option-more`; giữ trạng thái mở qua apply | FE |
| Quickview | BE | dùng chung module với `data-fetch-url`, `data-regions` | TE-3 quickview, ES1-T414 #2 |

## 8. Ngân sách byte (ADR 0006, `wc -c` 11/11)

| File | Hiện | Mục tiêu BE2 |
| --- | --- | --- |
| product-variant-picker.js | 7 163 | ≤ 6 144 (bỏ match/syncAvailable/JSON list/unavailable dựng tay; thêm pending, lỗi, retry, chặn submit) |
| product-form.js | 6 857 | không đổi |
| file "+N" (mới, lười) | — | ≤ 1 536, không tính tải sẵn |

Tổng JS tải sẵn PDP theo thẻ script tĩnh hiện tại: standard-events 888 + motion 9 161 + header-menu 6 862 + header-sticky 1 680 + cart-drawer 3 868 + product-media 4 407 + product-recommendations 3 069 + product-variant-picker 7 163 + product-form 6 857 = 43 955 B, đã vượt 40 960 (ADR 0006) và 38 408 (ADR 0010, theo kiến thức CTO); motion.js 9 161 > 8 192/file. Ngoài phạm vi spike, đã hỏi ES1-T414 #4. BE2 không được làm tăng tổng.

## 9. Rủi ro

- R1 partial trùng tên khi ≥ 2 instance (featured-product ×2, quickview trên PDP): apply theo tên sẽ ghi đè instance khác. Chặn BE2 cho các ngữ cảnh đó tới khi ES1-T414 #2 chốt; PDP một instance không bị.
- R2 partial chỉ render khi store bật agentic editor (ADR 0002): store không bật → fetch không có partial → xử như lỗi, hiện Try Again; mua biến thể mặc định vẫn được (form thường).
- R3 bỏ noscript select: không JS không đổi được biến thể (product.md §17 chấp nhận, NFR-4 cần CTO biết).
- R4 Test cũ ES1-T66, ES1-T223, TE-4.spec chọn radio theo tên và đọc `.js` ≤ 250 biến thể → sửa cùng BE2, không để CI đỏ giữa chừng (FE và BE2 merge cùng đợt hoặc FE giữ tương thích `value` tên tới khi BE2 vào).
- R5 Người dùng giữ phím mũi tên: mỗi change một request, abort liên tục; chấp nhận (store dev 429 → CI flaky, theo dõi report-429).

## 10. Kiểm thử (`tests/e2e/ES1-T347.spec.ts`)

Spec viết theo đích sau BE2; trang còn JSON biến thể (`script[data-product-variants]`) thì `test.fixme` có lý do, nên CI hiện tại không đỏ. Selector theo data-testid.
- Tĩnh: JS ≤ 8 192 B; JS không đọc `data-product-variants`, có `option_values`, có `AbortController`, không `console.`; mọi tên partial picker dùng có `{% partial %}` trong blocks/snippets (fixme tới BE2).
- AC15 đang tải: chặn response `option_values` → radio checked ngay, `product-form` `aria-busy`, nút `aria-disabled="true"`, không `aria-busy` trên nút (không spinner), bấm nút không gửi `/cart/add.js`; thả response → giá, id, `?variant=` cập nhật, `history.length` không tăng.
- AC15 bấm liên tiếp: request 1 chậm, request 2 nhanh → trạng thái cuối = lần 2 kể cả khi request 1 về sau.
- AC15 lỗi: abort request `option_values` → `product-option-error` có chữ, `product-option-retry` hiện, radio + id + URL giữ biến thể cũ, không kẹt `aria-busy`; Try Again → thành công, alert rỗng.
- AC15 quickview: skip tới khi có `quick-view` (TE-3).
- AC16: D3 (`TE4_MANY_VARIANTS_HANDLE`, mặc định `demo-many-variants`) chọn 190 lb / Pair / Blue → request mang 3 id, nút bật, thêm giỏ → `/cart.js` dòng đúng `variant_title`, giá dòng = giá hiện; HTML không có JSON biến thể và không `<select name=id>` lặp biến thể.
- Mọi test: không lỗi console theme.

Tự kiểm tra: spike không đổi file theme; `shopify theme check` / Playwright / Lighthouse: chờ CI.
