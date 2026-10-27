KHÔNG CHẮC: SRS TE-1 trùng mã AC5 (dòng 27 font/màu, dòng 28 country/language) — gắn cả 2 là AC5, cột Then ghi [AC5a]/[AC5b], hỏi BA ES1-T6. Danh sách biến token (ADR 0001 6 màu vs AC5 cần --color-muted-light) chờ Tech Lead ES1-T7. Header trong suốt đè hero, sticky, dạng localization chờ Designer ES1-T8. Markup TE-1 chưa có (header/footer vẫn Skeleton gốc, chưa data-testid → dev-fe ES1-T9), không có PREVIEW_URL → E2E chưa chạy.

# ES1-T5 (2727475000000119001) — Test case TE-1 Header (khung theme và design token)
Nguồn: docs/srs.md#TE-1, ticket ES1-T5, Figma node 1:362 (Header), 1:1104 (Newsletter + Footer), 1:363 (hero BG dưới header); token: docs/tokens.json, docs/figma-inventory.md, ADR 0001
Spec: tests/e2e/ES1-T5.spec.ts · Mã R: R4 (menu đa cấp, newsletter, country/language, shopify-account), R7 layout, R11 SEO, R12 a11y, R13 social, R14–R16
Base đọc code: develop 50f9757. Breakpoint QA: 360 / 768 / 1280 (Figma chỉ có 1920, mobile kiểm theo convention — quyết định CTO 27/10).
Phạm vi: phủ đủ AC1–AC7 (ac_coverage theo docs/srs.md#TE-1), đào sâu header AC2–AC4.

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | Theme cài với settings mặc định (tokens.json đã đổ vào settings) | Mở /, /collections/all, 1 product, /cart | `:root` có `--color-background` = #FFFFFF, `--color-foreground` = #1A1A1A, `--color-accent` = #D94610, có `--font-*`, `--space-*`, `--radius-*`; computed `background-color`/`color` của body = giá trị biến | E2E | P2 |
| TC-02 | AC1 | Repo ở commit của PR | Quét `assets/*.css` (bỏ comment) | 0 literal màu (`#hex`, `rgb(`/`hsl(` không bọc `var(`, `white`/`black`), 0 `font-family` literal, 0 `border-radius` literal khác `0`/`50%` (đo theo ADR 0001: grep `#[0-9a-f]{3,6}` ngoài css-variables) | static | P2 |
| TC-03 | AC1 | Editor efitco-ai-dev, theme preview | Theme settings → Colors: đổi màu nền và accent | Preview đổi ngay nền và màu nhấn trên header, footer, link; không file CSS nào đổi | UI | P2 |
| TC-04 | AC1 | `config/settings_schema.json` | Đọc nhóm Colors, Typography, Layout | ≥ 4 setting `color` (R16) gồm background, foreground, accent, accent_foreground, muted, border (ADR 0001); có setting space base và 3 setting radius; mọi label dạng `t:` | static | P3 |
| TC-05 | AC2 | Desktop 1280, main-menu demo 7 mục cấp 1 (Figma 1:362: Shop, Collection, Sale, Our Story, Blog, Contact, Help) | Mở trang chủ | `header-menu` hiện đủ 7 `header-menu-item` đúng thứ tự, nằm trên 1 hàng, không tràn ngang | E2E | P2 |
| TC-06 | AC2 | Desktop 1280, có mục cấp 1 có con | Hover vào mục đó | `header-submenu` của mục hiện, đủ link cấp 2 đúng title/url; rê chuột ra ngoài header thì ẩn | E2E | P1 |
| TC-07 | AC2 | Desktop, focus trên `header-menu-toggle` của mục có con, submenu đóng | Nhấn Enter | Submenu hiện, toggle `aria-expanded="true"`, `aria-controls` = id submenu; Tab tiếp vào link đầu của submenu | E2E | P1 |
| TC-08 | AC2 | Như TC-07 | Nhấn Space | Submenu hiện, `aria-expanded="true"`, `window.scrollY` không đổi | E2E | P1 |
| TC-09 | AC2 | Submenu mở bằng keyboard, focus trong submenu | Nhấn Esc | Submenu ẩn, `aria-expanded="false"`, focus về toggle | E2E | P1 |
| TC-10 | AC2 | Desktop, mục cấp 1 không con | Click | Link thường (không `aria-expanded`), điều hướng tới `link.url` | E2E | P2 |
| TC-11 | AC2 | Mobile 360 và Pixel 7 | Mở trang chủ | `header-menu` ẩn; `header-drawer-toggle` hiện, có accessible name, `aria-expanded="false"` | E2E | P1 |
| TC-12 | AC2 | Mobile, drawer đóng | Bấm `header-drawer-toggle` | `header-drawer` hiện, toggle `aria-expanded="true"`; số mục cấp 1 trong drawer = số mục main-menu | E2E | P1 |
| TC-13 | AC2 | Drawer mở, mục có con | Bấm `header-drawer-accordion-toggle` 2 lần | Lần 1 `header-drawer-submenu` (id = `aria-controls`) mở, `aria-expanded="true"`, có link cấp 2; lần 2 thu lại, `aria-expanded="false"` | E2E | P1 |
| TC-14 | AC2 | Drawer mở | Esc; mở lại rồi bấm `header-drawer-close` | Cả 2 cách: drawer ẩn, focus về `header-drawer-toggle` | E2E | P1 |
| TC-15 | AC2 | `blocks/header.liquid` schema | Đọc setting `menu` (link_list) | `"default": "main-menu"` (R14 link_list default) để có menu ngay khi cài | static | P2 |
| TC-16 | AC3 | Shop bật customer accounts, desktop 1280 | Render header | Đúng 1 `<shopify-account>` (`header-account`) hiển thị trong header | E2E | P1 |
| TC-17 | AC3 | Shop bật customer accounts, mobile 360/Pixel 7 | Render header (mở drawer nếu account nằm trong drawer) | `<shopify-account>` hiển thị, bấm được | E2E | P1 |
| TC-18 | AC3 | Giỏ có 1 variant qty 2 | Render header desktop và mobile | `header-cart-link` href pathname kết thúc `/cart` (`routes.cart_url`), `header-cart-count` = `2`; accessible name link chứa số lượng (text từ locale) | E2E | P1 |
| TC-19 | AC3 | Render header desktop và mobile | Đọc và bấm `header-search-link` | href pathname kết thúc `/search` (`routes.search_url`), có accessible name; bấm tới trang search | E2E | P1 |
| TC-20 | AC3 | Shop tắt customer accounts | Render header desktop và mobile | Không `<shopify-account>`; cart, search vẫn đủ, hàng icon không vỡ | UI | P2 |
| TC-21 | AC4 | Setting announcement text rỗng (mặc định — Figma không có bar, quyết định CTO 27/10 #5) | Cài mới / render mọi trang | Không có `announcement-bar` trong DOM, không khoảng trống chiếm chỗ trên header | E2E | P1 |
| TC-22 | AC4 | Announcement text = "Free shipping over $50", không link | Render desktop và mobile | `announcement-bar` hiện đúng text, đứng trước `header` trong DOM, đáy bar ≤ đỉnh header; không `<a>` trong bar | E2E | P1 |
| TC-23 | AC4 | Text có, link = /collections/all | Click `announcement-bar-link` | Điều hướng đúng URL; link có accessible name = text bar | E2E | P2 |
| TC-24 | AC5 | [AC5a] Settings mặc định | Render /, đọc computed font của h1/h2 và body | Heading `font-family` bắt đầu "Sofia Sans Condensed", body "Inter"; cả 2 lấy từ `font_picker` (`config/settings_schema.json` có 2 font_picker), không `@font-face` tự host trong assets | E2E | P2 |
| TC-25 | AC5 | [AC5a] Settings mặc định | Đọc `<head>` | Mỗi font_picker có `@font-face` `font-display: swap` cho regular, bold, italic, bold italic (R15); src từ fonts.shopifycdn.com | E2E | P3 |
| TC-26 | AC5 | [AC5a] Settings mặc định | Đọc `:root` và axe `color-contrast` trên header, footer | `--color-muted-light` = #6B6B6B, `--color-muted-on-dark` = #999999; 0 phần tử chữ màu #999999/#808080 trên nền sáng; axe color-contrast 0 violation | E2E | P1 |
| TC-27 | AC5 | [AC5a] Editor, font_picker heading | Chọn font khác | `--font-heading` (tên chờ ES1-T7) đổi, heading đổi font, body giữ Inter | UI | P3 |
| TC-28 | AC5 | [AC5b] Shop có ≥ 2 nước (markets) | Render footer, chọn nước khác | Có `footer-country-selector` ≥ 2 `footer-country-option`, mỗi lựa chọn có tên nước + mã tiền tệ; chọn xong tiền tệ trên trang đổi | E2E | P2 |
| TC-29 | AC5 | [AC5b] Shop có ≥ 2 ngôn ngữ publish | Render footer, chọn ngôn ngữ 2 | Có `footer-language-selector` ≥ 2 lựa chọn; chọn xong URL có tiền tố locale, `html lang` đổi | E2E | P2 |
| TC-30 | AC5 | [AC5b] Shop 1 nước và 1 ngôn ngữ | Render footer | Không có `footer-country-selector`, `footer-language-selector` | E2E | P2 |
| TC-31 | AC5 | [AC5b] Không JS, shop ≥ 2 nước | Chọn nước rồi submit form localization | Form `localization` submit về đúng `return_to`, tiền tệ đổi (NFR-4) | E2E | P3 |
| TC-32 | AC6 | Footer render | Nhập email mới hợp lệ vào `footer-newsletter-email`, submit | Form customer có `contact[tags]` chứa newsletter; URL có `customer_posted=true`, `footer-newsletter-success` hiện text từ locale | E2E | P1 |
| TC-33 | AC6 | Footer render | Tắt validate HTML5, submit `khong-phai-email` | `footer-newsletter-error` hiện lỗi từ `form.errors`; input `aria-describedby` trỏ id lỗi; giữ giá trị đã nhập | E2E | P2 |
| TC-34 | AC6 | Email đã đăng ký trước đó | Submit lại cùng email | Không crash, hiện thông báo thành công hoặc lỗi từ locale (không trang trắng, không JSON thô) | E2E | P3 |
| TC-35 | AC6 | Menu footer để mặc định | Render footer; đọc schema `blocks/footer.liquid` | Schema `menu` `"default": "footer"`; số `footer-menu-link` > 0, title/url khớp menu footer | E2E | P2 |
| TC-36 | AC6 | Social Instagram + Facebook có URL, mạng khác trống | Render footer | Đúng 2 `footer-social-link`, href = setting, accessible name có tên mạng; mạng trống không render | E2E | P2 |
| TC-37 | AC6 | Shop có payment types | Render footer | Số `footer-payment-icon` = số `shop.enabled_payment_types`; mỗi icon 1 SVG nhiều màu (không đơn sắc) có `<title>` | E2E | P2 |
| TC-38 | AC7 | Home, collection, product, page, search, cart (và locale 2 nếu có) | Đọc `<html>` | `lang` = `request.locale.iso_code` (đối chiếu `window.Shopify.locale`) | E2E | P1 |
| TC-39 | AC7 | Các trang như TC-38 | Đọc `<head>` | Đúng 1 `<title>` không rỗng; `link rel=canonical` https tuyệt đối; đủ `og:title/type/url/description/site_name`, `twitter:card/title/description`; `meta description` khi có mô tả | E2E | P1 |
| TC-40 | AC7 | Product có ảnh | Đọc `<head>` | `og:type=product`, `og:image:secure_url` https từ `page_image`, có `og:image:width/height`; có JSON-LD `structured_data` | E2E | P2 |

## Case biên (ngoài AC)
| ID | Nhóm | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TB-01 | chưa chọn resource | Setting menu header bị xoá | Render desktop, mobile | Vẫn có logo/tên shop, search, account, cart; không `<nav>` rỗng, không drawer toggle vô nghĩa, không lỗi Liquid | UI | P2 |
| TB-02 | chưa chọn resource | Menu footer xoá, không social, payment icons tắt | Render footer | Không danh sách/heading rỗng; newsletter vẫn chạy | UI | P3 |
| TB-03 | chưa chọn resource | Logo header chưa chọn (nếu có setting logo, R14) | Render header | Hiện `shop.name` dạng text link về `routes.root_url`; không `<img>` src rỗng | UI | P3 |
| TB-04 | rỗng | Announcement text chỉ khoảng trắng | Render | Như rỗng, không bar (chờ ES1-T6 #6) | UI | P3 |
| TB-05 | rỗng | Giỏ rỗng | Render header | Badge theo quyết định BA (ES1-T6 #5); accessible name cart link vẫn có nghĩa | E2E | P3 |
| TB-06 | tối đa | Main-menu 10 mục cấp 1, 1 mục 15 con, title 40 ký tự | Render 1280, 768 | `scrollWidth ≤ viewport`, dropdown không bị cắt mép phải, chữ xuống dòng gọn | UI | P2 |
| TB-07 | tối đa | Menu có cấp 3 | Render desktop và drawer | Theo BA (ES1-T6 #3); không vỡ layout, không lỗi | UI | P3 |
| TB-08 | tối đa | Giỏ 120 sản phẩm | Render header 360 | Số đếm gọn, icon không xuống dòng, accessible name đúng | UI | P3 |
| TB-09 | tối đa | Announcement 200 ký tự | Render 360 | Xuống dòng, không tràn ngang, link bấm được | UI | P3 |
| TB-10 | mất mạng / JS lỗi | Chặn `header-menu.js` (route abort) | Desktop click toggle; mobile mở drawer | Link cấp 2 và drawer vẫn truy cập được (NFR-4) | E2E | P1 |
| TB-11 | không JS | `javaScriptEnabled: false` | Như TB-10 | Truy cập được link cấp 2 desktop và mobile | E2E | P1 |
| TB-12 | mất mạng | Offline khi submit newsletter | Submit, bật mạng, submit lại | Trình duyệt báo lỗi tải; lần 2 thành công, không gửi trùng | UI | P3 |
| TB-13 | 360px | Viewport 360×780 | Mở /, /collections/all, product | Không cuộn ngang; drawer toggle, search, account, cart ≥ 24×24px; drawer cuộn được khi menu dài | E2E | P1 |
| TB-14 | 768 | Viewport 768 | Render header | Nav hoặc drawer (Dev FE suy), 7 mục không chồng chữ, không tràn | UI | P2 |
| TB-15 | keyboard | Desktop | Tab từ đầu trang tới cart | Thứ tự = DOM: (skip link) → logo → menu → search → account → cart; focus thấy được; không `tabindex > 0` | E2E | P1 |
| TB-16 | keyboard | Submenu mở bằng Enter | Tab qua hết link cấp 2 | Focus rời mục thì submenu đóng, `aria-expanded="false"` | E2E | P2 |
| TB-17 | keyboard | Drawer mở | Tab/Shift+Tab liên tục | Focus không thoát ra nội dung sau drawer; body không cuộn | E2E | P2 |
| TB-18 | screen reader | VoiceOver Safari iOS + NVDA Chrome | Duyệt header, mở dropdown, drawer, accordion, announcement, newsletter | `<nav>` có aria-label; toggle đọc collapsed/expanded; cart đọc số lượng; SVG icon `aria-hidden`; kết quả newsletter được đọc | a11y | P1 |
| TB-19 | a11y | Trang chủ: mặc định, dropdown mở (desktop), drawer mở (mobile) | axe trên announcement, header, drawer, footer | 0 violation serious/critical | E2E | P1 |
| TB-20 | a11y | Home, collection, product | Đếm h1 | Mỗi trang đúng 1 h1; tên shop trong header không là h1 trên trang có h1 riêng | E2E | P2 |
| TB-21 | contrast trên hero | Home: header trong suốt đè hero 1:363 (ảnh demo) | Đo contrast chữ menu/icon trên vùng ảnh sáng nhất | Chữ ≥ 4.5:1, icon ≥ 3:1 (axe báo incomplete trên ảnh → đo tay) — chờ ES1-T8 #1–2 | a11y | P2 |
| TB-22 | trang không hero | /collections/all, /cart, /search | Render header | Header có nền đọc được (không trong suốt trên nền trắng gây chữ trắng-trên-trắng) — chờ ES1-T8 #1 | UI | P2 |
| TB-23 | editor vs storefront | Editor (`design_mode`) | Chọn block header/announcement/footer, mở/đóng dropdown, drawer | Chọn được block (`block.shopify_attributes` ở root); không kẹt mở; storefront không có attribute editor | UI | P2 |
| TB-24 | Canvas | Canvas yum-dev, yêu cầu Sidekick #8, #9 (docs/checklist-canvas.md) | Sửa text announcement; thêm 1 mục cấp 2 menu header | Đúng kết quả; theme check 0 lỗi; cấu trúc Skeleton giữ nguyên (C4) | UI | P2 |
| TB-25 | routes / locale | Locale 2 có tiền tố (vd /fr) | Render header | Cart, search, home, account giữ tiền tố locale (`routes.*`) | E2E | P2 |
| TB-26 | i18n | HTML announcement/header/footer | Đối chiếu locale | Mọi chuỗi (aria-label, placeholder, nút, success/error) có key trong `locales/en.default.json` | static | P2 |
| TB-27 | perf | Trang chủ benchmark | lhci desktop + mobile | perf ≥ 96/90, a11y ≥ 98; `header-menu.js` ≤ 8 KB, module; 2 font không gây CLS header | perf | P2 |
| TB-28 | console | /, collection, product | Mở trang, hover menu, mở drawer | 0 console error (NFR-2) | E2E | P2 |
| TB-29 | sticky/scroll | Trang dài, dropdown mở | Cuộn xuống/lên | Theo ES1-T8 #3; dropdown đóng hoặc giữ đúng vị trí, không che nội dung vĩnh viễn | UI | P3 |
| TB-30 | trình duyệt | Webview IG/FB, Safari iOS (NFR-5) | Mở drawer, accordion, submit newsletter | Hoạt động như Chrome; không kẹt scroll-lock | UI | P3 |

## Tiền kiểm static trên develop 50f9757 (chưa có build TE-1 → không mở bug)
- TC-02 fail: `assets/base.css` dòng 5, 47–49, 59, 73, 82, 89–93 literal màu/bo góc (CSS demo hello-world, liquid-tips; hỏi ES1-T6 #8).
- TC-04 fail: settings_schema chỉ 2 color (background, foreground #333333 ≠ token #1A1A1A), không accent, không space, 1 radius.
- TC-01, TC-26 fail: css-variables chỉ có `--font-primary--*`, `--page-*`, 2 màu, `--style-border-radius-inputs`.
- TC-24 fail: 1 font_picker `type_primary_font` default `work_sans_n4` (không Inter, không heading).
- TC-15, TC-35 fail: schema `menu` header/footer không default.
- TC-05..TC-14, TC-19, TC-21..TC-23, TC-28..TC-37: chưa có markup (header là list link phẳng, không search link, không announcement; footer không newsletter/social/selector, chưa data-testid).
- TB-15/TB-19: cart link Skeleton chỉ có SVG không title + `<sup>` → accessible name rỗng; TB-20: tên shop trong `<h2>`.
- Bug mở: ES1-T5-01 (ticket ES1-T10, P2) — `shopify theme check` trên develop 1 error ValidDocParamTypes `string[]` ở blocks/liquid-tips.liquid:10, chặn job theme-check → preview/e2e/lhci. Report: drafts/qa/ES1-T5/bugs/ES1-T5-01.md.
- TC-38..TC-40: `layout/theme.liquid` + `snippets/meta-tags.liquid` đã có lang, title, canonical, og, twitter, page_image, JSON-LD → dự kiến pass.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- Menu `main-menu`: 7 mục cấp 1 theo Figma 1:362 (Shop, Collection, Sale, Our Story, Blog, Contact, Help); Shop ≥ 3 con (collection TE-9); ≥ 1 mục không con. Menu biên TB-06/TB-07: `qa-menu-max`, chỉ gán khi chạy case biên rồi trả lại.
- Menu `footer`: ≥ 3 link (Figma 1:1104: 2 cột menu).
- Customer accounts: bật (TC-16/17); tắt tạm cho TC-20 rồi bật lại.
- Announcement: mặc định rỗng (TC-21); text / text + link chạy bằng theme preview riêng; spec đọc `EXPECT_ANNOUNCEMENT=off|text|link`.
- Markets/ngôn ngữ: Figma hiện "USD / EN"; TC-28/29 cần ≥ 2 nước, ≥ 2 ngôn ngữ (`EXPECT_COUNTRIES`, `EXPECT_LANGUAGES`); TC-30 trên trạng thái 1/1.
- Social: Instagram, Facebook có URL; còn lại trống.
- Sản phẩm: variant còn hàng đầu tiên từ `/products.json` (dữ liệu TE-9), thêm giỏ qty 2.
- Newsletter: `qa+te1-<timestamp>@example.com`, mỗi lần 1 email mới; hCaptcha có thể chặn submit tự động → TC-32..34 chạy tay nếu bị chặn.
- Biến chạy: `PREVIEW_URL`, `STORE_PASSWORD`; tuỳ chọn `EXPECT_MENU_ITEMS=7`.

## Hợp đồng data-testid (đề xuất, dev-fe xác nhận ở ES1-T9)
Theo CONVENTION `<block>-<element>`. Header: `header`, `header-logo`, `header-menu`, `header-menu-item`, `header-menu-toggle`, `header-submenu`, `header-drawer-toggle`, `header-drawer`, `header-drawer-close`, `header-drawer-accordion-toggle`, `header-drawer-submenu`, `header-account` (trên `<shopify-account>`), `header-search-link`, `header-cart-link`, `header-cart-count`.
Announcement: `announcement-bar`, `announcement-bar-link`.
Footer: `footer`, `footer-menu-link`, `footer-social-link`, `footer-payment-icon`, `footer-newsletter-form`, `footer-newsletter-email`, `footer-newsletter-submit`, `footer-newsletter-success`, `footer-newsletter-error`, `footer-country-selector`, `footer-country-option`, `footer-language-selector`, `footer-language-option`.
Ngoại lệ: `<html lang>`, `<meta>`, `<link rel=canonical>`, `:root` biến CSS đọc bằng attribute/computed style.

## KHÔNG CHẮC
- ES1-T6 (BA): trùng mã AC5; phạm vi "Header" vs toàn TE-1; mục có con là link hay nút; accordion 1/nhiều; cấp 3; badge giỏ rỗng; search link vs predictive; announcement khoảng trắng; meta description fallback; CSS block demo.
- ES1-T7 (Tech Lead): danh sách và tên biến token cuối cùng (ADR 0001 6 màu vs `--color-muted-light`/`--color-muted-on-dark`); spec vào CI khi markup chưa merge; tên `header-menu.js`; trùng ES1-T3/T4/T5; chưa có ticket FE1/BE1 cho TE-1.
- ES1-T8 (Designer): header trong suốt trên trang không hero, contrast trên hero, sticky, localization gộp hay tách.
- Spec chưa type-check: không có node_modules, npm registry bị chặn trong phiên 27/10/2026.
