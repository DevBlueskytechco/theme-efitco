# 0009. Một component countdown "Sale ends in" cho featured product, trang sản phẩm và big offer
Ngày: 2026-11-11 | Trạng thái: Đề xuất (ES1-T307, chờ CTO)

## Bối cảnh
- Sổ 10/11 (P3–P5, audit (2)), 11/11 (CD1, CD2, ES1-T276); SRS 0.4 TE-4 AC17, TE-13 AC1, AC-H23, TE-18 AC6; `docs/ui-spec/countdown.md`. Ba nơi hiện countdown, cùng nguồn ngày: metafield sản phẩm `custom.sale_ends_at` trước, setting ngày của block sau; chỉ hiện khi ngày còn hạn, biến thể có giá gạch và còn hàng; số in sẵn bằng Liquid (CLS 0), JS chỉ cập nhật; hết giờ khi đang xem: "This sale has ended", không tự tải lại. Theme Store §8 (sổ 11/11 (7)): không đếm giả.
- Code develop `ce08212`: countdown chỉ có trong `blocks/featured-product.liquid` (dòng 105–145 tính ngày, 274–327 markup), CSS `.featured-product__countdown*` trong `assets/base.css`, đếm trong `assets/featured-product.js` (2 290 B, ẩn số tới khi JS chạy bằng `visibility: hidden`). PDP và big offer chưa có.

## Lựa chọn đã cân nhắc
- A. Mỗi nơi tự làm (copy markup + JS). Ưu: không đụng featured product. Nhược: 3 bản logic điều kiện hiện/ẩn, dễ lệch R8; 3 lần byte JS. Loại.
- B. Snippet Liquid chung + 1 module JS chung + CSS chung, cỡ theo khung chứa. Ưu: 1 nơi sửa điều kiện, đúng "một component" của sổ. Nhược: featured product phải chuyển, test cũ giữ testid. Chọn.

## Quyết định
B.
1. FE `snippets/sale-countdown.liquid` (`{% doc %}`: `product` (product), `variant` (variant), `fallback_end` (string, "YYYY-MM-DD HH:MM" giờ store), `size` (string `compact` | `regular`), `testid` (string, mặc định `sale-countdown`)). Tự quyết định in hay không theo 4 điều kiện (TE-4 AC17); không đủ thì không in gì (không chừa chỗ). Ngày: `product.metafields.custom.sale_ends_at.value` trước, `fallback_end` sau, so với `'now' | date: '%s'`. In sẵn số ngày/giờ/phút/giây (≥ 24 giờ: 4 ô, dưới: 3 ô), `<time datetime>` ẩn ngày kết thúc theo giờ store, `data-sale-countdown`, `data-end` (epoch giây), `data-state` (`running` | `ending` | `ended`), ô số `aria-hidden`, chuỗi `ended` sẵn trong `data-label-ended`. `@media (scripting: none)` ẩn khối (TE-4 AC17 không JS).
2. FE CSS chung `.sale-countdown`, `.sale-countdown__unit`, `[data-size="compact|regular"]` trong `assets/base.css`; xoá `.featured-product__countdown*` sau khi chuyển; bỏ `visibility: hidden` chờ `data-enhanced`.
3. BE `assets/sale-countdown.js` (≤ 2 048 B), custom element `<sale-countdown>` (FE bọc root của snippet bằng thẻ này): 1 `setInterval` 1 s dùng chung cho mọi thẻ trên trang, dừng khi `document.hidden`; tới 0 thì `data-state="ended"`, thay nhãn + ô bằng chữ ended, giữ khung; không đếm âm, không đếm lại. `featured-product.js` bỏ phần đếm.
4. Đổi biến thể: snippet nằm trong partial `product-countdown` (PDP), `featured-product` (trang chủ), `quick-view` không có countdown (spec quickview không có); `<sale-countdown>` mới được upgrade sau `partials.apply` (custom element tự chạy `connectedCallback`).
5. Gọi: `blocks/featured-product.liquid` (`size: 'regular'`, `testid: 'featured-product-countdown'`, `fallback_end: block.settings.<ngày>`), `blocks/product-info.liquid` (`size: 'regular'`, `testid: 'product-countdown'`, có setting `show_sale_countdown` mặc định bật), block `offer-popup` (`size: 'compact'` mọi mốc, CD1). Locale `blocks.sale_countdown.label`, `ends_on`, `ended`, `days|hours|minutes|seconds`.

## Hệ quả
- Tốt: 1 chỗ đúng R8; PDP, big offer dùng lại; số có ngay khi tải (ES1-T276), CLS 0.
- Xấu: thêm 2 048 B JS tải sẵn trên PDP và trang chủ (ADR 0010 đã tính); test TE-13 dùng class cũ phải sửa selector sang testid.
- Việc: FE `TE-13-R2-FE1` (snippet, CSS, locale, chuyển featured product); BE `TE-13-R2-BE1` (module, gỡ đếm khỏi `featured-product.js`); PDP gọi snippet ở `TE-4-R2-FE3`; big offer ở `TE-18-R2-FE2`.
- Đo: `grep -rn "featured-product__countdown" assets blocks snippets` = 0 sau chuyển; `wc -c assets/sale-countdown.js` ≤ 2 048; E2E: metafield còn < 24 giờ → 3 ô, giảm mỗi giây, F5 không reset; biến thể không giá gạch → không có `[data-sale-countdown]`; `page.clock` tua tới hết giờ → chữ "This sale has ended", kích thước khung không đổi (boundingBox trước/sau lệch 0); lhci CLS = 0 trên `/` và PDP có countdown.
