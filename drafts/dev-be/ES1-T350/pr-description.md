KHÔNG CHẮC: (1) `?option_values=` qua `partials.fetch` (spike H1–H6) và qua `?view=featured-product` với sản phẩm lấy từ `block.settings.product` chưa kiểm trên store: sandbox không gọi store → chờ CI. (2) Nhiều featured product trên 1 trang (chỉ có ở template kiểm thử `index.te13-states`, ADR 0008 mục 3 trả lời ES1-T161) không dùng partial vì tên trùng: `featured-product.js` `swap()` tải `?view=featured-product&option_values=` bằng `fetch` + `DOMParser` và chỉ thay giá, JSON 1 biến thể, nút của band đó (thay đường JSON D4 đã bỏ). Tech Lead xem có chấp nhận hay cần partial `featured-product` (ADR 0008 mục 3, chưa có ticket FE). (3) BE sửa markup ngoài thẻ script: `blocks/featured-product.liquid` (JSON 1 biến thể + nút Unavailable khi tổ hợp không tồn tại) và tách JSON 1 biến thể của `blocks/product-form.liquid` ra `snippets/selected-variant-json.liquid` để 2 nơi dùng chung; FE xem lại.

# ES1-T350 · TE-4-R2-BE2 · product-variant-picker.js theo option value (ADR 0008)

Nhánh chồng: FE1 (ES1-T348, PR #281) + FE2 (ES1-T349) + BE2 (ES1-T350), merge một lượt (ES1-T515 mặc định 1). AC: TE-4 AC2, AC12–AC16, TE-3 AC10 (bộ chọn), AC-H22, NFR-7.

## Thay đổi

- `assets/product-variant-picker.js` (7 163 → 7 146 B, trần 7 168): viết lại theo spike ES1-T347 mục 3.
  - Không đọc JSON danh sách biến thể, không `match()` theo tên. Gom `data-option-value-id` của radio đang chọn → `partials.fetch(...names, { url: <trang>?option_values=a,b,c[&selling_plan], signal })` → `partials.apply`. PDP: 7 partial (`product-options` + 6 cũ); featured: `data-partials`.
  - Đang tải (AC15, VP1): `aria-busy` trên `product-form` và mọi `[data-variant-busy]`, `aria-disabled="true"` trên nút thêm giỏ (cả sticky), không đổi nhãn/màu; submit lúc đang tải bị chặn ở pha capture (trước `product-form.js`). Status "Loading [value]…".
  - Xong: id gửi giỏ, `?variant=` (replaceState, chỉ PDP), `theme:variant:change`, status "[value], [price], [availability]" đọc từ `script[data-selected-variant]` và markup server; `null` (tổ hợp không tồn tại) thì giữ id/URL, nút Unavailable do Liquid. Lần bấm cuối thắng (AbortController).
  - Lỗi: radio về biến thể cuối đã tải, id/URL/giá không đổi, `role=alert` + Try Again dưới option vừa bấm (alert lỗi trước bị xoá), Try Again gửi lại đúng lựa chọn lỗi; focus về radio đã khôi phục; status xoá "Loading…".
  - "+N" (AC14): mở/thu, focus giá trị đầu vừa hiện, giữ trạng thái mở qua apply.
  - `shopify:product:select` khi đổi option, promise resolve biến thể đã tải hoặc `null`; không bắn lúc load. Combined listing: `data-product-url` → điều hướng.
  - Form khôi phục / chọn trước khi module nạp (ES1-T158): so radio đang chọn với `defaultChecked` lúc kết nối, khác thì tải.
- `assets/featured-product.js` (2 290 → 2 282, trần 2 304): bỏ đọc JSON `variants`; thêm `swap(url, signal)` cho trang ≥ 2 featured product.
- `assets/product-form.js` (6 857 → 6 867, trần 6 900): status/lỗi 422 lấy `:scope>[role=status]`, `:scope>[role=alert]` (không lấy alert của bộ chọn, ES1-T96).
- Tổng JS tải sẵn PDP (picker + form) 14 020 → 14 013 B: không tăng (spike mục 8).
- Liquid: `snippets/selected-variant-json.liquid` (mới, 1 biến thể hoặc null); `blocks/product-form.liquid` dùng snippet; `blocks/featured-product.liquid` render snippet trong partial `product-buy-buttons`, nút Unavailable + disabled khi tổ hợp không tồn tại.
- Test (đổi cách chọn/đọc, giữ mức khẳng định): `tests/e2e/support/variant-picker.ts` (chọn theo tên trong nhãn, đọc tên đang chọn); TE-4.spec (TC-201/202/205/206/209/210/212/213/302, matcher partial `option_values`), ES1-T158 (biến thể từ `/products/<handle>.js`, giá so cents, lỗi giữ biến thể cũ, nhiều band 1 request riêng band), ES1-T223, ES1-T66 (7 partial, `option_values`), ES1-T87 (tĩnh theo hợp đồng mới), ES1-T347 (`click({ force: true })` vì Playwright coi `aria-disabled` là disabled).
  - Đổi hành vi có chủ đích theo ADR 0008: TC-205 tổ hợp không tồn tại nay có 1 request (trước: 0); TC-210 lỗi mạng giữ trạng thái đã tải (trước: id nhảy sang biến thể mới); ES1-T158 nhiều band 1 request (trước: 0, đọc JSON).

## Đối chiếu CI #281 (22 test × 2 project)

| Test đỏ | Nguyên nhân | Sửa |
| --- | --- | --- |
| ES1-T347 tĩnh NFR-7 | noscript select | FE2 |
| ES1-T347 AC15 ×3, AC16 | JS đọc JSON | picker mới; test `force` click |
| ES1-T96 lỗi 422 | `[role=alert]` đầu tiên là alert bộ chọn | product-form.js `:scope>` |
| TE-4 TC-110/201/202/204/206/209/213/214/302/404/406/409/503/1002/1203/1205 | radio theo tên, JSON | picker mới + helper chọn theo tên |
| ES1-T158 AC2 ×7, ES1-T223 ×4 | JSON `data-product-variants` không còn | featured qua partial / swap, test đọc `.js` |
| ES1-T179 D1 (flaky, qua ở retry) | không liên quan | — |

## Tự kiểm tra

- `shopify theme check`: 0 lỗi, 22 warning có sẵn (featured-product: `hide_options`, `default_countdown_end` có từ trước).
- `wc -c`: picker 7 146 ≤ 7 168; featured-product 2 282 ≤ 2 304; product-form 6 867 ≤ 6 900.
- `npx playwright test --list`: 3 550 test / 104 file.
- Spec tĩnh (config tạm không globalSetup): ES1-T66, ES1-T67, ES1-T69, ES1-T81, ES1-T85, ES1-T87, ES1-T96 contract, ES1-T158 tĩnh, ES1-T347 tĩnh: đạt.
- Test store: chờ CI.
