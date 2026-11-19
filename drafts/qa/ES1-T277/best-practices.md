KHÔNG CHẮC: chưa có lhr thật. Phiên QA bị chặn mạng tới hoa-qua-nhap-khau.myshopify.com (sandbox, user denied), mcp store-dev báo thiếu STORE_PASSWORD, không có quyền gh để tải artifact `lighthouse` của CI. Mục 1–2 của ticket chờ ES1-T281. Mục 3–4 dưới đây dựa trên rà tĩnh mã theme + tính ngược điểm CI theo trọng số Lighthouse 12.1; là giả thuyết đến khi có lhr.

# ES1-T277 — Lighthouse Best Practices: nguồn trừ điểm theme / nền tảng / store dev

## 1. Trạng thái đo
| Hạng mục | Trạng thái |
| --- | --- |
| lhr theme live, 6 trang x 2 form factor | Chưa có. Chặn — ES1-T281 |
| lhr preview develop, 6 trang x 2 form factor | Chưa có. Chặn — ES1-T281 |
| Công cụ đo, phân loại | Có, đã test trên lhr giả lập (8/8 đạt): tools/run-bp.mjs, tools/classify-bp.mjs, tools/classify-bp.test.mjs |
| Rà tĩnh mã theme theo 18 audit BP | Xong (mục 4) |

Chạy khi có quyền store (tuần tự, chỉ category best-practices, không chạy lúc CI store-tests đang giữ store):
```
STORE_ORIGIN=https://hoa-qua-nhap-khau.myshopify.com STORE_PASSWORD=*** \
BP_THEMES=live,<theme id preview develop> BP_ISOLATE=1 \
node drafts/qa/ES1-T277/tools/run-bp.mjs
node drafts/qa/ES1-T277/tools/classify-bp.mjs drafts/qa/ES1-T277/lhr --md drafts/qa/ES1-T277/bp-table.md --json drafts/qa/ES1-T277/bp-table.json
```
`BP_ISOLATE=1` đo thêm biến thể `-isolated` chặn script nền tảng (shop.app, shopifysvc, /cdn/shopifycloud/, wpm, web-pixel, trekkie, /api/collect, otlp, checkout preloads, pay.shopify.com) để thấy trần điểm của riêng theme. Không chặn /cdn-cgi/ (Cloudflare) để không bị thử thách lại.
Luật phân loại: tools/classify-bp.mjs `URL_RULES`. Item không khớp luật hoặc là script inline trong HTML (theme hay content_for_header) ghi `can-xac-minh`, không đoán.

## 2. Cách Lighthouse 12.1 tính BP
Nguồn: node_modules/lighthouse/core/config/default-config.js:534–560 (lighthouse 12.1.0, đi kèm @lhci/cli 0.14 CI đang dùng). Điểm = Σ(trọng số x điểm) / Σ trọng số, audit N/A bị bỏ khỏi mẫu số, làm tròn 2 chữ số (core/scoring.js:14).

| Audit | Trọng số | Ghi chú |
| --- | --- | --- |
| is-on-https | 5 | trượt cả khi có mixed content |
| redirects-http | 1 | N/A khi URL đo bắt đầu bằng https (redirects-http.js:55) → luôn N/A trên CI |
| geolocation-on-start, notification-on-start | 1 + 1 | |
| csp-xss | 0 | không tính điểm |
| paste-preventing-inputs | 3 | |
| image-aspect-ratio, image-size-responsive | 1 + 1 | aspect ratio chỉ xét ảnh object-fit: fill |
| viewport | 1 | |
| font-size | 1 | N/A trên desktop (seo/font-size.js:251) |
| doctype, charset | 1 + 1 | |
| js-libraries, valid-source-maps | 0 | không tính điểm |
| deprecations | 5 | |
| third-party-cookies | 5 | cookie issue WarnThirdPartyPhaseout / ExcludeThirdPartyPhaseout |
| errors-in-console | 1 | |
| inspector-issues | 1 | trượt khi có bất kỳ cookie issue, mixed content, blocked-by-response, CSP issue |

Tổng 29. Mẫu số thực tế: mobile 28 (redirects-http N/A), desktop 27 (thêm font-size N/A).

## 3. Tính ngược số CI
| Form factor | BP CI | Khoảng trọng số mất | Nghiệm nguyên |
| --- | --- | --- | --- |
| mobile | 0,79 | (28 − x)/28 ∈ [0,785; 0,795) → x ∈ (5,74; 6,02] | x = 6 → 22/28 = 0,7857 → 0,79 |
| desktop | 0,78 | (27 − x)/27 ∈ [0,775; 0,785) → x ∈ (5,80; 6,08] | x = 6 → 21/27 = 0,7778 → 0,78 |

Cả 2 form factor mất đúng 6 trọng số (nếu số CI là 1 lần đo; ticket không nói rõ, xem KHÔNG CHẮC). Tổ hợp audit cho tổng 6:

| Tổ hợp | Khả năng | Lý do |
| --- | --- | --- |
| H1: third-party-cookies (5) + inspector-issues (1) | Cao nhất | Cookie bên thứ ba sinh cookie issue nên luôn kéo inspector-issues trượt theo; tổng đúng 6, mọi audit khác đạt |
| H2: deprecations (5) + 1 audit trọng số 1 (errors-in-console hoặc inspector-issues) | Có thể | Theme không dùng API deprecated (mục 4); nếu đúng thì nguồn là script ngoài theme |
| H3: paste-preventing-inputs (3) + 3 audit trọng số 1 | Loại | Theme không chặn paste (grep onpaste, 'paste' trong blocks/snippets/templates/layout/assets: 0 kết quả) |
| H4: 6 audit trọng số 1 | Gần như loại | doctype, viewport đạt theo mã; geolocation, notification không có trong theme |
| Có is-on-https (5) | Loại cho trang theme | grep `http://` trong theme: 0 kết quả (trừ namespace w3.org); trang Shopify luôn https |

## 4. Từng audit: nguồn khả dĩ, bằng chứng, cách sửa
Cột "Dự kiến" là kết luận từ rà mã, chưa phải số đo.

| Audit | Trọng số | Dự kiến | Nguồn nếu trượt | Bằng chứng trong theme | Cách sửa (phía) |
| --- | --- | --- | --- | --- | --- |
| is-on-https | 5 | Đạt | nền tảng (https), theme nếu có ảnh/script http:// | không có `http://` trong blocks, snippets, templates, layout, assets, config, locales | — |
| redirects-http | 1 | N/A | — | URL đo là https | — |
| geolocation-on-start | 1 | Đạt | store dev (app) | assets/*.js không gọi navigator.geolocation | — |
| notification-on-start | 1 | Đạt | store dev (app) | không gọi Notification.requestPermission | — |
| paste-preventing-inputs | 3 | Đạt | theme | không có onpaste / listener 'paste' | — |
| image-aspect-ratio | 1 | Đạt (rủi ro thấp) | theme | critical.css:20–26 `img { max-width: 100%; height: auto }`, base.css:2512 `.image > img { width: 100%; height: auto }` giữ tỉ lệ; 32 chỗ object-fit (bị audit bỏ qua) | Nếu trượt: ảnh có width/height CSS cố định mà object-fit: fill → thêm object-fit: cover hoặc crop đúng tỉ lệ trong image_url (FE, assets/base.css hoặc block) |
| image-size-responsive | 1 | Chưa biết | theme | snippets/image.liquid: widths mặc định 360, 720, 1080, 1440; sizes mặc định 100vw. Ảnh sản phẩm, gift card, predictive search dùng `<img>` thủ công (product-media.liquid:279, product-recommendations.liquid:129, predictive-search.liquid:163, gift_card.liquid:39, 54) | Nếu trượt: tăng widths / sửa sizes đúng bề rộng hiển thị ở DPR 1.75 (mobile) cho block được nêu trong lhr (FE) |
| viewport | 1 | Đạt | theme | snippets/meta-tags.liquid:3 `width=device-width,initial-scale=1` | — |
| font-size (mobile) | 1 | Đạt | theme | css-variables.liquid:47 nhỏ nhất `--font-size-xs: 0.8125rem` (13 px); chỉ base.css:7842 `.site-header__cart-count` 10 px, rất ít text | — |
| doctype | 1 | Đạt | theme | layout/theme.liquid:1, layout/password.liquid:1 `<!doctype html>` | — |
| charset | 1 | Đạt nhờ header HTTP (rủi ro) | theme | `<meta charset>` ở snippets/meta-tags.liquid:1 nhưng render sau css-variables (94 biến CSS + @font-face) ở layout/theme.liquid:5 → 27 và password.liquid:5 → 12, nên nằm ngoài 1024 byte đầu. Audit đạt khi header Content-Type có charset (charset.js:62–68) — Shopify thường gửi, chưa xác minh | Phòng ngừa: đưa `<meta charset="utf-8">` lên dòng đầu `<head>` ở layout/theme.liquid và layout/password.liquid (FE). Chưa tạo bug: chưa có lhr chứng minh trượt |
| deprecations | 5 | Đạt phần theme | nền tảng hoặc app | assets/*.js không có unload/beforeunload listener, document.write, document.domain, DOMSubtreeModified, DOMNodeInserted, showModalDialog | Nếu lhr chỉ ra asset theme (/cdn/shop/t/<id>/assets/) → BE sửa file JS đó |
| third-party-cookies | 5 | Nghi trượt (H1) | nền tảng, kích hoạt qua filter Liquid theme gọi | Không có iframe bên thứ ba lúc tải: video-card và product-media để iframe trong `<template>` (video-card.liquid:12, product-media.liquid:191), YouTube dùng youtube-nocookie. Theme gọi 3 filter sinh component Shopify có thể tải shop.app: `content_for_additional_checkout_buttons` trong cart drawer trên mọi trang (cart-drawer.liquid:123–132, layout/theme.liquid:54; giỏ rỗng chỉ `hidden`, component vẫn trong DOM), `form \| payment_button` trên trang sản phẩm (product-form.liquid:358–360, show_dynamic_checkout mặc định true), `shop \| login_button: action: 'follow'` ở footer (footer.liquid:202–203, khi follow_on_shop?) | Cookie từ shop.app / pay.shopify.com là nền tảng, theme không sửa được cookie. Theme chỉ giảm được bằng cách không render component khi chưa cần (vd. accelerated checkout chỉ render khi giỏ có hàng, BE refresh partial khi thêm hàng) — đổi hành vi tính năng ES1-T95, cần Tech Lead/PO quyết, không phải "sửa lỗi". Đo TC-22 (giỏ rỗng vs có hàng) để biết component ẩn có phát cookie không |
| errors-in-console | 1 | Có thể trượt | nền tảng / store dev | assets/*.js không có console.error; `throw` chỉ ở nhánh lỗi mạng (bundle-form.js:119, product-form.js:111, cart-items.js:138). Nguồn đã gặp ở lượt trước (tests/e2e/support/console-guard.ts): shop.app 403 trên IP CI (ES1-T171), script thử thách Cloudflare (ES1-T203), tài nguyên trả 429 (ES1-T217) | Nếu lhr chỉ ra asset theme → BE; còn lại không thuộc theme |
| inspector-issues | 1 | Trượt theo H1 | theo nguồn cookie issue | không có mixed content, không đặt CSP trong theme | Theo third-party-cookies |
| csp-xss, js-libraries, valid-source-maps | 0 | — | — | không ảnh hưởng điểm | — |

## 5. Kết luận
- Rà mã: không thấy audit BP nào có nguồn trong theme đủ làm mất điểm. Mục duy nhất do theme có thể sửa là rủi ro charset (hiện được header HTTP che, 0 điểm thực mất nếu header đúng).
- Số CI mất đúng 6 trọng số trên cả desktop và mobile; mọi tổ hợp khả dĩ (H1, H2) chứa 1 audit trọng số 5 (third-party-cookies hoặc deprecations) mà theme không có mã gây ra.
- Điểm BP tối đa nếu sửa hết phần do theme (giả thuyết, chờ lhr):
  - H1 (cookie bên thứ ba từ component Shopify): giữ nguyên 0,79 mobile / 0,78 desktop.
  - H2 với audit trọng số 1 là của theme: tối đa 23/28 = 0,82 mobile, 22/27 = 0,81 desktop. Với 1 điểm lẻ cũng ngoài theme: giữ nguyên.
- BP 100 không đạt được bằng sửa theme trên store có Shop Pay / accelerated checkout / Shop follow đang bật, trừ khi bỏ hoặc hoãn render các component nền tảng đó (đánh đổi tính năng, cần quyết định sản phẩm).
- Đề xuất chỉ tiêu để BGĐ chọn (QA không chốt): (a) BP = 100 trên biến thể `-isolated` (chặn script nền tảng), hoặc (b) BP ≥ 0,78 với điều kiện bảng classify-bp không có dòng nguồn `theme`.
- Chất lượng: NO-GO cho việc chốt "BP 100" làm chỉ tiêu nghiệm thu trên store dev hiện tại. Chốt lại sau khi ES1-T281 có lhr và bp-table.md.

## 6. Việc tiếp theo
1. ES1-T281 (DevOps): chạy run-bp.mjs hoặc chép artifact lighthouse CI vào drafts/qa/ES1-T277/lhr/.
2. QA chạy classify-bp.mjs, thay mục 4–5 bằng số đo, tạo bug cho từng item nguồn `theme` theo skills/bug-report.
3. Mục `can-xac-minh` (script inline): mở HTML, đối chiếu với Liquid theme và content_for_header.

## File
- drafts/qa/ES1-T277/best-practices.md (file này)
- drafts/qa/ES1-T277/ticket-ac.md, test-cases.md
- drafts/qa/ES1-T277/tools/run-bp.mjs: đo tuần tự, chỉ store dev, ghi lhr/<theme>-<formFactor>-<trang>[-isolated].json
- drafts/qa/ES1-T277/tools/classify-bp.mjs: bảng audit trượt + phân loại + điểm tối đa
- drafts/qa/ES1-T277/tools/classify-bp.test.mjs, tools/fixtures/GIA-LAP-mobile-home.json: lhr giả lập, không phải số đo
- drafts/qa/ES1-T277/lhr/: chưa có (chờ ES1-T281)
