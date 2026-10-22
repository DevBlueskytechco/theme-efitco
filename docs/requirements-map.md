# Ánh xạ yêu cầu Theme Store (mã R) → story · chuẩn chất lượng nội bộ

| Mã R | Nội dung | Áp dụng | Story |
| --- | --- | --- | --- |
| R1 Exclusivity | chỉ bán trên Theme Store, không credit | Tham khảo (không bán) | — |
| R2 Uniqueness / codebase | Skeleton Theme; không Dawn/Horizon | Bắt buộc phần codebase | TE-1 |
| R3 Design & UX | layout, hierarchy, consistency, settings rõ | Bắt buộc | TE-2, TE-7, mọi FE |
| R4 Features | discounts, accelerated checkout, filtering, gift card, focal point, page_image, selectors, menu đa cấp, newsletter, pickup, recommendations, rich media, predictive search, selling plans, installments, unit price, variant images, Follow on Shop, shopify-account | Bắt buộc | TE-1, TE-4, TE-5, TE-6, TE-8, TE-9 |
| R5 Templates/sections/blocks | JSON templates, section groups, app blocks | Không áp dụng cho Skeleton block-first; giữ: có Custom Liquid block | TE-7 |
| R6 Lighthouse | perf ≥ 60, a11y ≥ 90 (nội bộ 96/90/98) | Bắt buộc | TE-10 |
| R7 Pages | layout lang/routes; product; collection; list-collections; cart; page; blog; article; search; 404; gift card; password | Bắt buộc | TE-1, TE-4, TE-5, TE-6, TE-8, TE-9 |
| R8 Consistency | RTE nhất quán, script trên Shopify CDN, không app-like, không fake urgency | Bắt buộc | TE-10 |
| R9 Browser | desktop/mobile/webview list | Bắt buộc | TE-10 |
| R10 Assets | không Sass, không minified | Bắt buộc | TE-1, TE-10 |
| R11 SEO | meta snippet, rich snippets, không robots.txt.liquid | Bắt buộc | TE-1 |
| R12 Accessibility | keyboard, focus, alt, label, contrast, touch 24px, focus order, headings | Bắt buộc | mọi FE, TE-10 |
| R13 Social | icon set, OG/Twitter tags, placeholder rỗng | Bắt buộc | TE-1 |
| R14 Settings | text style, terminology, favicon, logo, link_list default, theme_info | Bắt buộc | TE-1, TE-2, TE-7 |
| R15 Font picker | font_picker, default, 4 biến thể, không custom font | Bắt buộc | TE-1 |
| R16 Color | ≥ 4 màu, background có foreground, type color | Bắt buộc | TE-1 |
| R17 Responsive images | srcset, lazy | Bắt buộc | mọi FE |
| R18 Naming | 1–2 từ, không trùng Shopify | Tham khảo (không Canvas/Sidekick trong tên) | — |
| R19 Version/release notes | version + notes | Bắt buộc (writer) | mọi sprint |
| R20 Demo store | client transfer store | Tham khảo; thay bằng ember-ai-dev dữ liệu demo | TE-9 |
| R21–R22 Docs/support | tài liệu, contact form, SLA | Tham khảo; thay bằng docs/merchant + hướng dẫn Canvas | writer |
| Canvas C1–C5 | mở được; block hiện đúng; sửa trực tiếp; Sidekick 3/10 yêu cầu; theme check sau sửa | Bắt buộc | TE-10, cuối mỗi sprint |
