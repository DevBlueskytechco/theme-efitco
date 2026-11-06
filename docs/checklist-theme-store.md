# Checklist chuẩn chất lượng theo Theme Store requirements (đọc 22/10/2026)

Chạy cuối mỗi sprint trên preview develop. Fail → bug gắn mã R.

| Mã | Nội dung | Áp dụng | Pass/Fail/N/A | Bằng chứng |
| --- | --- | --- | --- | --- |
| R2 | Codebase Skeleton; không Dawn/Horizon; README ghi sha | Bắt buộc |  |  |
| R3.1 | Layout theo grid, hierarchy rõ, linh hoạt khi nội dung đổi | Bắt buộc |  |  |
| R3.2 | Settings nhóm logic, ngôn ngữ merchant | Bắt buộc |  |  |
| R4.1 | Discounts hiện ở cart (item + order) | Bắt buộc |  |  |
| R4.2 | Accelerated checkout product + cart, bật mặc định, màu nguyên | Bắt buộc |  |  |
| R4.3 | Faceted filtering collection + search | Bắt buộc |  |  |
| R4.4 | Gift card template + recipient form | Bắt buộc |  |  |
| R4.5 | Image focal point | Bắt buộc |  |  |
| R4.6 | page_image social | Bắt buộc |  |  |
| R4.7 | Country + language selector theo UX guideline | Bắt buộc |  |  |
| R4.8 | Menu đa cấp | Bắt buộc |  |  |
| R4.9 | Newsletter form | Bắt buộc |  |  |
| R4.10 | Pickup availability | Bắt buộc |  |  |
| R4.11 | Related + complementary products | Bắt buộc |  |  |
| R4.12 | Rich media 3D/video | Bắt buộc |  |  |
| R4.13 | Search template + predictive search | Bắt buộc |  |  |
| R4.14 | Selling plans ở cart | Bắt buộc |  |  |
| R4.15 | Shop Pay Installments | Bắt buộc |  |  |
| R4.16 | Unit price collection/product/cart | Bắt buộc |  |  |
| R4.17 | Variant images | Bắt buộc |  |  |
| R4.18 | Follow on Shop | Bắt buộc |  |  |
| R4.19 | shopify-account header desktop + mobile | Bắt buộc |  |  |
| R5.1 | Custom Liquid block (type liquid) | Bắt buộc |  |  |
| R5.2 | JSON templates / section groups / app blocks | N/A Skeleton |  |  |
| R6.1 | Lighthouse perf ≥ 96 desktop / 90 mobile (Shopify 60) | Bắt buộc |  |  |
| R6.2 | Lighthouse a11y ≥ 98 (Shopify 90) | Bắt buộc |  |  |
| R7.1 | lang=request.locale.iso_code; routes; content_for_header nguyên | Bắt buộc |  |  |
| R7.2 | Product page: title, price, unit, compare_at, description, options, taxes_included, first available, callback | Bắt buộc |  |  |
| R7.3 | Collection: title/description/image, grid không vỡ, sale badge, sort, rỗng, price_varies, paginate | Bắt buộc |  |  |
| R7.4 | List collections: title, featured_image, paginate | Bắt buộc |  |  |
| R7.5 | Cart: line_item fields, total, taxes_included, checkout, refresh, qty, rỗng, note, selling plan, discount codes | Bắt buộc |  |  |
| R7.6 | Page + contact alternate | Bắt buộc |  |  |
| R7.7 | Blog/article: title, image, excerpt_or_content, published_at, comments paginate | Bắt buộc |  |  |
| R7.8 | Search: rỗng, object_type, paginate | Bắt buộc |  |  |
| R7.9 | 404; gift card QR ≥120, Apple Wallet; password | Bắt buộc |  |  |
| R8 | RTE nhất quán; script Shopify CDN; không app-like; không fake urgency; protocol-relative | Bắt buộc |  |  |
| R9 | Trình duyệt desktop/mobile/webview | Bắt buộc |  |  |
| R10 | Không Sass; không minified | Bắt buộc |  |  |
| R11 | SEO meta snippet; rich snippets; không robots.txt.liquid | Bắt buộc |  |  |
| R12 | Keyboard; focus; alt; label; contrast; touch 24px; focus order; headings | Bắt buộc |  |  |
| R13 | Social icons; OG/Twitter; placeholder rỗng | Bắt buộc |  |  |
| R14 | Settings text style, terminology, favicon, logo, link_list default, theme_info, editor events | Bắt buộc |  |  |
| R15 | font_picker, default, 4 biến thể, không custom | Bắt buộc |  |  |
| R16 | ≥ 4 màu, foreground cho background | Bắt buộc |  |  |
| R17 | srcset/sizes, lazy | Bắt buộc |  |  |
| R18 | Tên 1–2 từ, không Shopify/Canvas/Sidekick | Tham khảo |  |  |
| R19 | Version + release notes | Bắt buộc |  |  |
| R20 | Demo store | Thay bằng hoa-qua-nhap-khau (efitco-ai-dev) |  |  |
| R21–22 | Docs + contact form + SLA | Thay bằng docs/merchant |  |  |
