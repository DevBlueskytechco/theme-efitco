KHÔNG CHẮC: axe chỉ báo selector `.shopify-payment-button__button`; theme chỉ style nút unbranded + link "More payment options". Nếu store dev bật ví có thương hiệu (Shop Pay, PayPal) và axe vẫn báo trên nút đó thì không sửa bằng CSS theme được (màu do Shopify/brand quy định, AC4) → cần QA/CTO quyết định loại trừ selector.

# ES1-T80 Bug TE-4 (CI #67): poster video lazy/alt, nút đóng zoom, picker 1 variant, contrast payment button

Nguồn: CI PR #67 run 41744892514, dữ liệu thật từ tests/e2e/store-data.json (nhánh feature/ai-ES1-T78).

## Thay đổi
1. `blocks/product-media.liquid` — media `video`: bỏ `video_tag` (không cho đặt thuộc tính lên img fallback), dựng `<video controls playsinline preload="none" poster>` + `<source>` từ `media.sources` + img fallback qua `image_url | image_tag`:
   - `loading` theo quy tắc chung: media đầu `eager` + `fetchpriority="high"`, còn lại `lazy` (ES1-T62 AC1 LCP).
   - `alt` = `media.alt`, trống thì `product.title` (axe `image-alt: video > img`).
   - `widths: '1440'` → URL img trùng URL poster, không tải 2 lần.
2. `blocks/product-media.liquid` — nút `product-media-zoom-close`: thay chữ `visually-hidden` bằng `aria-label` (`blocks.product_media.close | t`). Lý do: dialog đóng (`display: none`) lúc tải, tên lấy từ nội dung ẩn bị tính rỗng.
3. `blocks/product-form.liquid` — biến `has_variant_choice` = false khi `product.has_only_default_variant` hoặc `product.variants.size == 1`. Áp cho `product-variant-picker` (gồm `variant-json` + thẻ script `product-variant-picker.js`) và noscript select. Input hidden `name=id` giữ nguyên (ES1-T64 AC9).
4. `assets/base.css` — `.product-form__payment-button .shopify-payment-button__button--unbranded`: nền `--color-foreground`, chữ `--color-background` (cùng tỉ lệ tương phản như chữ thân, AA), `--radius-button`, cao 52px như nút Add to cart; hover đảo màu; focus ring 2px; disabled giống `.product-form__add:disabled`. Link `.shopify-payment-button__more-options` màu `--color-foreground`. 2 class để thắng CSS Shopify kể cả `:hover:not([disabled])`. Nút ví có thương hiệu không đụng. Thêm `.product-media__video-fallback` (block, 100%).

Không file JS trong diff. Không thêm locale key (dùng lại `blocks.product_media.close`). Không thêm setting.

## Tự kiểm tra
- `shopify theme check --path .`: 49 file, 0 lỗi.
- Test liên quan (chạy trên CI sau merge, chờ CI): ES1-T62 "AC1 LCP", "AC1 zoom link … nút đóng có sẵn", "AC1 axe"; ES1-T64 "AC9 1 variant", "AC2-markup … axe 0 serious".
- Preview, Playwright, Lighthouse, ảnh 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
