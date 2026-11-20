KHÔNG CHẮC: (1) Trong lượt này tôi sửa 1 assert ở 2 spec của FE: `tests/e2e/ES1-T384.spec.ts:56` và `tests/e2e/ES1-T408.spec.ts:38`. Cả hai assert "gift_card.liquid không có `<script`" và ghi rõ là chờ TS-BE1. Giờ assert đổi thành "đúng 2 thẻ script của TS-BE1", nếu để nguyên thì CI đỏ. (2) Phép cộng JS trang chủ sau cuộn là cộng tĩnh: 65 258 B, trần 65 536 B, chỉ còn dư 278 B. Số đo theo URL do CI ES1-T177 làm. ES1-T357 (product-media ≤ 3 072) và ES1-T344 (featured-product ≤ 1 024) sẽ nới khoảng. (3) Ticket ghi `script_tag`, nhưng filter này in ra thẻ không có `defer` (ParserBlockingScript). Vì vậy tôi viết thẻ tay `<script src="{{ 'vendor/qrcode.js' | shopify_asset_url }}" defer>`. (4) `theme:variant:change` của picker không có `productId` trong detail, và product-variant-picker.js còn dư 5 B so với trần 7 168. Nên product-media.js lấy id qua `target.closest('[data-product-id]')`. Gallery chỉ nhận event khi picker cùng `featured-product` hoặc cùng `dialog` với nó, hoặc cả hai đều không nằm trong cái nào. `dialog` là giả định cho quickview (ES1-T373, ES1-T357 kiểm lại).

# ES1-T410 TS-BE1: gift-card-qr.js, product-media.js nhiều instance, featured-product.js bỏ media, gallery featured nạp lười

Nguồn: drafts/techlead/ES1-T304/task-split.md §2 (hợp đồng), §3 TS-BE1, D3, D6; ADR 0010, ADR 0012; docs/ui-spec/gift-card.md §2, §5, §8; SRS TE-21 AC13–AC15 (TS-BE1: QR, copy, print); comment dev-fe 13/11 (hook copy/print).

## Thay đổi
- `assets/gift-card-qr.js` (mới, 1 022 B, module):
  - QR: `new QRCode([data-gift-card-qr], { text: data-identifier, width: 144, height: 144 })`. `img` nhận `alt` = `data-label` ("QR code, scan to redeem gift card"). Vẽ xong thì ẩn `[data-testid=gift-card-qr-fallback]`.
  - Thiếu `window.QRCode` (thư viện lỗi mạng): không gọi gì, giữ chữ dự phòng.
  - Thư viện ném lỗi: `catch`, khung trả về chỉ còn chữ dự phòng. Cả hai trường hợp đều 0 lỗi console.
  - Copy (có `navigator.clipboard`): gỡ `hidden` khỏi nút và chép `data-gift-card-copy`. Nhãn đổi sang `data-label-copied` trong 2 s. `[data-gift-card-status]` (role=status) đọc `data-label-status`, hết 2 s thì trả lại nhãn cũ và xoá status. Chép lỗi thì im lặng, không unhandled rejection.
  - Print: gỡ `hidden`, bấm thì gọi `window.print()`.
  - Không JS: nút Copy/Print giữ `hidden`, QR giữ chữ dự phòng.
- `templates/gift_card.liquid`: thêm 2 thẻ script trong `<head>`: `vendor/qrcode.js` (`shopify_asset_url`, `defer`) và `gift-card-qr.js` (`type="module"`). Module chạy sau thư viện vì defer và module cùng hàng đợi, theo thứ tự trong tài liệu. Comment đầu file cập nhật theo.
- `assets/product-media.js` (4 407 → 4 405 B):
  - Mọi truy vấn nằm trong `this`. List là `ul` đầu tiên. Thumbnail là `a[href^="#"][data-media-id]`, khớp cả PDP (`#ProductMedia-*`) lẫn featured (`#FeaturedMedia-*`), không còn bám testid riêng của PDP.
  - `theme:variant:change` chỉ xử lý khi product id của picker trùng `data-product-id` của gallery và cả hai cùng scope (`featured-product`/`dialog`/không có).
  - `show()` (thumbnail, đổi biến thể) dừng mọi media khác: video pause, model pause, iframe YouTube/Vimeo trả về poster. Cơ chế cũ (IO dừng media ra khỏi khung) giữ nguyên.
  - `aria-current` dùng `ariaCurrent`. Guard `customElements.get`.
- `assets/featured-product.js` (2 290 → 1 755 B): bỏ `a[data-featured-media-id]`, click thumbnail, `show()`, `aria-current` thumbnail. Gallery giờ do product-media.js lo. Giữ countdown, `data-enhanced` và giá/nút theo JSON khi trang có ≥ 2 block (ES1-T169 D4). `disconnectedCallback` gỡ thêm listener `visibilitychange` (trước đây bị rò).
- `blocks/featured-product.liquid`: `<product-media-gallery>` thêm `data-lazy-module="{{ 'product-media.js' | asset_url }}"`, mặc định nạp khi gần viewport, rootMargin 200px (ADR 0010). Không thêm thẻ script vì lazy-module.js đã có. Sửa 1 dòng `{% doc %}` vốn ghi "no data-lazy-module yet".
- `tests/e2e/ES1-T410.spec.ts` (mới):
  - @static: trần byte, 2 thẻ script gift card, hook, scope truy vấn, lazy-module.
  - Featured: không có thẻ script product-media; Play YouTube thì iframe nạp, đổi media thì iframe về poster; bộ chọn giả PDP cùng id không đổi featured, bộ chọn của featured thì đổi; 2 featured trên te13-states độc lập.
  - PDP: bộ chọn trong dialog không đổi PDP; product-form PDP đổi; thumbnail aria-current.
  - Gift card: QR ≥ 120 có tên, copy 2 s, print, qrcode.js bị abort.
- `tests/e2e/ES1-T384.spec.ts`, `tests/e2e/ES1-T408.spec.ts`: assert "không script" đổi thành "đúng 2 thẻ script TS-BE1" (xem KHÔNG CHẮC 1).

## Hợp đồng (giữ nguyên)
- Testid PDP và featured giữ nguyên. Custom element `product-media-gallery`, `featured-product` giữ nguyên. Partial `product-price`, `product-buy-buttons` không đổi.
- Hook gift card: `data-gift-card-qr`, `data-identifier`, `data-label`, `gift-card-qr-fallback`, `data-gift-card-copy`, `data-label-copied`, `data-label-status`, `data-gift-card-status`, `data-gift-card-print`.

## Ngân sách JS (`wc -c`)
- File chạm: gift-card-qr.js 1 022 (≤ 1 024), product-media.js 4 405 (≤ 4 407), featured-product.js 1 755 (< 2 290). Mọi file assets/*.js ≤ 8 192 (lớn nhất slideshow 7 925).
- Gift card: JS theme 1 022 B, cộng `vendor/qrcode.js` từ CDN Shopify (không tính vào theme).
- PDP: không đổi (product-media −2 B).
- Trang chủ, cộng tĩnh, header sticky bật, featured `hide_options` nên không có picker:
  - Tải sẵn: standard-events 888 + motion 6 129 + page-layers 2 031 + modal-dialog 2 039 + header-menu 3 058 + search-loader 256 + header-sticky 1 680 + cart-drawer 3 910 + slideshow 7 925 + quiz-dialog 1 511 + lazy-module 765 = 30 192 B (≤ 40 960).
  - Sau cuộn, cộng thêm: scroll-buttons 1 536 + scroll-extras 3 135 + collection-tabs 1 528 + quiz-finder 4 349 + bundle-form 5 491 + featured-product 1 755 + product-media 4 405 + product-form 6 857 + video-carousel 3 216 + motion-scrub 2 794 = 35 066 B.
  - Tổng sau cuộn 65 258 B (≤ 65 536, dư 278). Trước PR là 61 388; PR thêm 3 870.
  - Không tính phần nạp khi tương tác: header-drawer, predictive-search, cart-items.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi. 9 warning có sẵn ở quiz-step, index.liquid, index.figma, index.te12, không thuộc file nào của PR.
- `wc -c`: như mục ngân sách. Không `console.*`, không storage, không fetch tự viết, không URL tuyệt đối trong 3 file JS.
- Playwright tĩnh (config tạm không globalSetup, đã xoá): 19/19 pass. Gồm ES1-T410 @static ×5, ES1-T69 contract, ES1-T158 tĩnh ×3, ES1-T384 @static ×6, ES1-T408 @static ×4.
- Playwright store (featured, PDP, gift card), `tests/e2e/ES1-T100.spec.ts`, ES1-T69, ES1-T158 AC2 thumbnail/variant, smoke: chờ CI.
  - Gift card cần `TS_GIFT_CARD_URL` (ES1-T298), chưa có thì `test.fixme`, không tính là đạt.
  - Featured có YouTube: store chưa cấu hình thì test chèn item `external_video` theo đúng markup snippet.
- Lighthouse `/`, PDP, gift card (≥ 96/90/98), 0 console error trên preview: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
