KHÔNG CHẮC: (1) trang sản phẩm nhận `?option_values=<id>,<id>` khi gọi qua `partials.fetch` (Dawn dùng tham số này với Section Rendering API; theme không có sections) — task spike TE-4-R2-BE1 kiểm trên store dev trước khi FE/BE làm; không chạy thì phương án dự phòng ở "Hệ quả"; (2) AGENTS.md dòng 384–385 và 504 lấy `snippets/variant-json.liquid` làm ví dụ cho "JS đọc dữ liệu server": quyết định này bỏ snippet đó, CTO sửa ví dụ trong AGENTS.md (scope-guard chặn agent), câu hỏi ở ticket [Q] của ES1-T307.

# 0008. Bộ chọn biến thể theo option value, tên partial theo ngữ cảnh, quickview qua template thay thế
Ngày: 2026-11-11 | Trạng thái: Đề xuất (ES1-T307, chờ CTO) | Bổ sung ADR 0002

## Bối cảnh
- Sổ 10/11 "2048 biến thể", SRS 0.4 NFR-7, TE-4 AC13–AC16, TE-3 AC10: bộ chọn dựng từ option và option value, không vòng lặp biến thể, không JSON danh sách biến thể; sản phẩm > 250 biến thể phải đúng (TE-4 AC16).
- Code develop `ce08212`: `snippets/product-variant-picker.liquid:52` render `variant-json` (lặp `product.variants`, tối đa 250); `assets/product-variant-picker.js` tìm biến thể ở client rồi `partials.fetch` với `?variant=`; `snippets/product-variant-select.liquid:27` và `snippets/product-structured-data.liquid:52` cũng lặp `product.variants`. Sai khi > 250 biến thể, HTML nặng khi nhiều biến thể.
- Quickview (TE-3 AC9–AC12, mới) cần cùng bộ chọn trên trang chủ, collection, search, popup quiz; trang chủ đã có `featured-product` dùng tên partial `product-price`, `product-buy-buttons` (ES1-T161: trùng tên khi > 1 featured product trên 1 trang). Theme có tiền lệ template thay thế `templates/product.featured-product.liquid` để fetch partial.

## Lựa chọn đã cân nhắc
- A. Giữ JSON biến thể, chỉ tăng giới hạn. Ưu: không đổi JS. Nhược: Liquid không trả quá 250 biến thể; trái sổ 10/11. Loại.
- B. Fetch JSON `/products/<handle>.js` rồi dựng giá/tồn ở client. Ưu: không cần partial. Nhược: `.js` cũng giới hạn biến thể, phải viết lại định dạng tiền, badge, countdown ở JS (lệch Liquid), store dev trả 429 cho request ngoài trình duyệt (CONVENTION.md). Loại.
- C. Gửi id option value đang chọn lên chính trang sản phẩm (`?option_values=`), server chọn biến thể, trả các partial Liquid. Ưu: Liquid là nguồn duy nhất, đúng với 2048 biến thể, 1 request cho mọi vùng. Nhược: mỗi lần đổi là 1 request (có trạng thái đang tải, VP1). Chọn.

## Quyết định
C.
1. Liquid (FE): `snippets/product-variant-picker.liquid` lặp `product.options_with_values` / `option.values`; radio `value="{{ value.id }}"`, `data-option-value-id`, trạng thái từ `value.available`, `value.exists`, `value.selected`; `data-product-url` khi `value.product_url` khác sản phẩm hiện tại (combined listing); thu gọn > 10 giá trị hiện 7 + "+N" (hằng, không setting). Tham số `id_prefix` (rỗng ở PDP, `qv-` ở quickview). Xoá `snippets/variant-json.liquid`, `snippets/product-variant-select.liquid`; JSON-LD in `Offer` của biến thể đang chọn + `AggregateOffer` (`product.price_min`, `price_max`, `variants_count`). Không còn `for variant in product.variants` ở `blocks/`, `snippets/` (trừ `bundle-builder` lấy `variants.first` khi không có biến thể còn hàng, không phải vòng lặp).
2. JS (BE, `assets/product-variant-picker.js`, ≤ 7 168 B): `change` → gom ≤ 3 id → `partials.fetch(...names, { url: <data-fetch-url>?option_values=a,b,c, signal })` → `partials.apply`; AbortController (lần bấm cuối thắng); `aria-busy` vùng giá/tồn, `aria-disabled="true"` trên Add To Cart khi chờ (VP1); `history.replaceState` `?variant=` chỉ ở PDP; lỗi: giữ biến thể cuối, `role="alert"` + nút thử lại; giá trị có `data-product-url` thì điều hướng. Phát `shopify:product:select` (AGENTS.md).
3. Tên partial theo ngữ cảnh, không trùng trên 1 trang:
   - PDP (`templates/product.liquid`): `product-options`, `product-price`, `product-countdown`, `product-buy-buttons`, `product-media`, `product-sticky-bar`, `product-pickup`, `product-selling-plans`, `product-installments` (5 tên đầu đã có hoặc thêm ở TE-4-R2-FE2).
   - Quickview: 1 partial `quick-view` trong `templates/product.quick-view.liquid`; fetch lần đầu bằng `?view=quick-view`, đổi biến thể bằng `?view=quick-view&option_values=…`; URL trang nền không đổi.
   - Featured product (trang chủ): 1 partial `featured-product` trong `templates/product.featured-product.liquid` (thay `product-price` + `product-buy-buttons`); trả lời ES1-T161: một trang thật chỉ có 1 featured product, template kiểm thử `index.te13*` không có trong gói (TE-10 AC-H34).
4. Biến thể đang mua: `product.selected_or_first_available_variant`; form chỉ gửi `<input type="hidden" name="id">`.

## Hệ quả
- Tốt: đúng với 2048 biến thể và > 250 (TE-4 AC16); HTML PDP không còn JSON biến thể; quickview, featured, PDP dùng chung 1 snippet + 1 module.
- Xấu: mỗi lần đổi option là 1 request (~1 vòng mạng); không JS chỉ mua được biến thể mặc định hoặc `?variant=` (chấp nhận theo product.md §17); `featured-product.js`, `quiz-*` đang đọc `variant-json` phải chuyển.
- Dự phòng nếu spike thất bại (partial không nhận `option_values`): giữ C nhưng thay `option_values` bằng `?variant=` lấy từ `value.variant.id` có sẵn trên từng radio của lựa chọn hiện tại (Liquid in `data-variant-id` khi `value.variant` tồn tại), tổ hợp không tồn tại thì không fetch, hiện trạng thái "unavailable" ngay. Tech Lead cập nhật ADR này, không đổi FE markup.
- Việc: spike TE-4-R2-BE1 (trước), FE TE-4-R2-FE1 (snippet), TE-4-R2-FE2 (gỡ vòng lặp, partial), BE TE-4-R2-BE2 (module); quickview TE-3-R2-FE2, TE-3-R2-BE1; CTO sửa ví dụ AGENTS.md dòng 384–385, 504 sang `data-*` trên radio.
- Đo: `grep -rn "for variant in product.variants\|variant-json\|product.variants | json" blocks snippets templates` ra 0 dòng (trừ dòng `bundle-builder.liquid:171` `variants.first`); E2E TE-4 AC13–AC16 trên sản phẩm > 250 biến thể (ES1-T298 D3); HTML PDP của sản phẩm nhiều biến thể nhất trên store dev ≤ 150 000 ký tự (Playwright `page.content().length`, không `request.get` vì 429); `wc -c assets/product-variant-picker.js` ≤ 7 168.
