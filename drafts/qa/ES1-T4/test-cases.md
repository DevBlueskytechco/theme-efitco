KHÔNG CHẮC: không đọc được ticket 2727475000000117007 (mcp__ticket__get chưa được cấp quyền) nên phạm vi lấy theo docs/srs.md#TE-1 (đủ AC1–AC7, đào sâu header AC2–AC4); Figma node announcement/header/footer trống trong figma-inventory; chưa có preview URL, markup TE-1 chưa có trên nhánh nào (header vẫn là Skeleton gốc, chưa data-testid) nên E2E chưa chạy; drafts/qa/2727475000000117005 có bản nháp cùng nội dung (untracked), cần chốt ticket nào là ticket QA.

# 2727475000000117007 — Test case TE-1 Header (khung theme và design token)
Nguồn: docs/srs.md#TE-1, ticket 2727475000000117007 (chưa đọc được), Figma node: chưa có (docs/figma-inventory.md dòng 9, 10, 20 trống)
Spec: tests/e2e/2727475000000117007.spec.ts · Mã R: R4 (menu đa cấp, newsletter, country/language, shopify-account), R7 layout, R11, R12, R13, R14–R16
Base đọc code: nhánh chore/figma-key 44b3ac4 (develop/main chưa có thay đổi TE-1)

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | Theme cài với settings_data mặc định (tokens.json đã đổ vào settings) | Mở /, /collections/all, 1 trang product, /cart | `:root` có `--color-background`, `--color-foreground`, `--color-accent`, ≥ 1 `--font-*`, `--space-*`, `--radius-*` (tên theo docs/architecture.md); computed `background-color` body = `--color-background`, `color` body = `--color-foreground` | E2E | P2 |
| TC-02 | AC1 | Repo ở commit của PR | Quét `assets/*.css` (bỏ comment) | 0 literal màu (`#hex`, `rgb(`/`hsl(` không bọc `var(`, `white`/`black`), 0 `font-family` literal, 0 `border-radius` literal khác `0`/`50%`; giá trị đi qua `var(--…)` | static | P2 |
| TC-03 | AC1 | Editor efitco-ai-dev, theme preview | Đổi setting màu nền và màu accent trong Theme settings → Colors | Preview đổi nền và accent ngay trên header, announcement, link; không file CSS nào thay đổi | UI | P2 |
| TC-04 | AC1 | Editor, setting font_picker chính | Chọn font khác trong danh sách Shopify | `--font-*` đổi theo; `<head>` có `@font-face` `font-display: swap` cho regular, bold, italic, bold italic (R15); chữ header đổi font | UI | P2 |
| TC-05 | AC1 | `config/settings_schema.json` | Đọc nhóm Colors, Typography, Layout | ≥ 4 setting `color` (R16), có màu accent, mỗi màu nền có màu chữ tương ứng; có setting khoảng cách và bo góc; mọi label dạng `t:` | static | P3 |
| TC-06 | AC2 | Desktop 1280, main-menu có ≥ 1 mục cấp 1 có con | Hover vào mục cấp 1 có con | `header-submenu` của mục đó hiện, đủ link cấp 2 đúng title/url theo menu; rê chuột ra ngoài header thì submenu ẩn | E2E | P1 |
| TC-07 | AC2 | Desktop 1280, focus trên `header-menu-toggle` của mục có con, submenu đóng | Nhấn Enter | Submenu hiện, toggle `aria-expanded="true"`, `aria-controls` = id submenu; Tab tiếp đưa focus vào link đầu trong submenu | E2E | P1 |
| TC-08 | AC2 | Như TC-07 | Nhấn Space | Submenu hiện, `aria-expanded="true"`, `window.scrollY` không đổi | E2E | P1 |
| TC-09 | AC2 | Submenu đang mở bằng keyboard, focus trong submenu | Nhấn Esc | Submenu ẩn, `aria-expanded="false"`, focus về toggle của mục đó | E2E | P1 |
| TC-10 | AC2 | Desktop, mục cấp 1 không có con | Click vào mục | Là link thường (không `aria-expanded`), điều hướng tới `link.url` | E2E | P2 |
| TC-11 | AC2 | Mobile 360 và Pixel 7 | Mở trang chủ | `header-menu` ẩn; `header-drawer-toggle` hiện, có accessible name, `aria-expanded="false"` | E2E | P1 |
| TC-12 | AC2 | Mobile, drawer đóng | Bấm `header-drawer-toggle` | `header-drawer` hiện, toggle `aria-expanded="true"`; đủ mục cấp 1 của main-menu (số mục = số mục `header-menu-item` của nav desktop) | E2E | P1 |
| TC-13 | AC2 | Drawer mở, mục cấp 1 có con | Bấm `header-drawer-accordion-toggle` 2 lần | Lần 1: `header-drawer-submenu` (id = `aria-controls`) mở, `aria-expanded="true"`, có link cấp 2; lần 2: thu lại, `aria-expanded="false"` | E2E | P1 |
| TC-14 | AC2 | Drawer mở | Nhấn Esc; mở lại rồi bấm `header-drawer-close` | Cả 2 cách: drawer ẩn, focus về `header-drawer-toggle` | E2E | P1 |
| TC-15 | AC2 | `blocks/header.liquid` schema | Đọc setting `menu` (link_list) | Có `"default": "main-menu"` để header có menu ngay khi cài (R14 link_list default); hiện Skeleton gốc chưa có default | static | P2 |
| TC-16 | AC3 | Shop bật customer accounts, desktop 1280 | Render header | Có đúng 1 `<shopify-account>` (`header-account`) hiển thị trong header | E2E | P1 |
| TC-17 | AC3 | Shop bật customer accounts, mobile 360/Pixel 7 | Render header (mở drawer nếu account nằm trong drawer) | `<shopify-account>` hiển thị và bấm được | E2E | P1 |
| TC-18 | AC3 | Giỏ có 1 variant qty 2 | Render header desktop và mobile | `header-cart-link` trỏ `routes.cart_url` (pathname kết thúc `/cart`), `header-cart-count` hiện `2`; accessible name của link chứa số lượng (text từ locale) | E2E | P1 |
| TC-19 | AC3 | Render header desktop và mobile | Đọc và bấm `header-search-link` | href pathname kết thúc `/search` (`routes.search_url`), có accessible name; bấm mở trang search | E2E | P1 |
| TC-20 | AC3 | Shop tắt customer accounts | Render header desktop và mobile | Không có `<shopify-account>`; cart link, search link vẫn đủ, hàng icon không vỡ | UI | P2 |
| TC-21 | AC4 | Setting announcement text rỗng | Render mọi trang | Không có `announcement-bar` trong DOM (không bar rỗng, không khoảng trống chiếm chỗ) | E2E | P1 |
| TC-22 | AC4 | Announcement text = "Free shipping over $50", không link | Render trang chủ desktop và mobile | `announcement-bar` hiện đúng text, đứng trước `header` trong DOM và đáy bar ≤ đỉnh header; không có `<a>` trong bar | E2E | P1 |
| TC-23 | AC4 | Text có, link announcement = /collections/all | Click `announcement-bar-link` | Điều hướng đúng URL đã chọn; link có accessible name = text bar | E2E | P2 |
| TC-24 | AC5 | Shop có ≥ 2 nước (markets) | Render footer, chọn nước khác | Có `footer-country-selector`, ≥ 2 `footer-country-option`, mỗi lựa chọn có tên nước + mã tiền tệ; chọn nước khác thì tiền tệ trên trang đổi | E2E | P2 |
| TC-25 | AC5 | Shop có ≥ 2 ngôn ngữ đã publish | Render footer, chọn ngôn ngữ thứ 2 | Có `footer-language-selector` ≥ 2 lựa chọn; chọn xong URL có tiền tố locale, `html lang` đổi theo | E2E | P2 |
| TC-26 | AC5 | Shop chỉ 1 nước và 1 ngôn ngữ | Render footer | Không có `footer-country-selector` và `footer-language-selector` | E2E | P2 |
| TC-27 | AC6 | Footer render | Nhập email hợp lệ chưa đăng ký vào `footer-newsletter-email`, submit | Form customer (`contact[tags]` chứa newsletter); sau submit URL có `customer_posted=true`, `footer-newsletter-success` hiện text từ locale | E2E | P1 |
| TC-28 | AC6 | Footer render | Tắt validate HTML5, submit `khong-phai-email` | `footer-newsletter-error` hiện lỗi từ `form.errors`, input có `aria-describedby` trỏ id lỗi, giữ giá trị đã nhập | E2E | P2 |
| TC-29 | AC6 | Setting menu footer để mặc định | Render footer; đọc schema `blocks/footer.liquid` | Schema `menu` có `"default": "footer"`; số `footer-menu-link` và title/url khớp menu footer của shop | E2E | P2 |
| TC-30 | AC6 | Social Instagram + Facebook có URL, mạng khác trống | Render footer | Đúng 2 `footer-social-link`, href = setting, mỗi link có accessible name; mạng trống không render | E2E | P2 |
| TC-31 | AC6 | Shop có payment types bật | Render footer | Số `footer-payment-icon` = số `shop.enabled_payment_types`; mỗi icon 1 SVG nhiều màu (không đơn sắc) có `<title>` | E2E | P2 |
| TC-32 | AC7 | Home, collection, product, page, search, cart ở locale mặc định (và locale 2 nếu có) | Đọc `<html>` | `lang` = `request.locale.iso_code` (đối chiếu `window.Shopify.locale`) | E2E | P1 |
| TC-33 | AC7 | Các trang như TC-32 | Đọc `<head>` | Đúng 1 `<title>` không rỗng; `link rel=canonical` URL https tuyệt đối; đủ `og:title/og:type/og:url/og:description/og:site_name`, `twitter:card/title/description`; `meta description` khi có mô tả | E2E | P1 |
| TC-34 | AC7 | Trang product có ảnh | Đọc `<head>` | `og:type=product`, `og:image:secure_url` https từ `page_image`, có `og:image:width/height`; có JSON-LD `structured_data` | E2E | P2 |

## Case biên (ngoài AC)
| ID | Nhóm | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TB-01 | chưa chọn resource | Setting menu header bị xoá (block.settings.menu nil) | Render storefront desktop và mobile | Header vẫn có logo/tên shop, search, account, cart; không `<nav>` rỗng, không drawer toggle vô nghĩa, không lỗi Liquid | UI | P2 |
| TB-02 | chưa chọn resource | Menu footer bị xoá, không social, payment icons tắt | Render footer | Không danh sách rỗng, không heading treo; newsletter vẫn hoạt động | UI | P3 |
| TB-03 | rỗng | Announcement text chỉ có khoảng trắng | Render | Xử lý như rỗng (không bar) — chờ BA | UI | P3 |
| TB-04 | rỗng | Giỏ rỗng | Render header | Không hiện badge "0" hoặc hiện theo quyết định BA; accessible name cart link vẫn đúng (vd "Cart, 0 items") | E2E | P3 |
| TB-05 | tối đa | Main-menu 10 mục cấp 1, 1 mục 15 con, title 40 ký tự | Render 1280, 768 | `scrollWidth ≤ viewport`, dropdown không bị cắt mép phải, chữ xuống dòng gọn | UI | P2 |
| TB-06 | tối đa | Menu có cấp 3 | Render desktop và drawer | Theo quyết định BA (bỏ hay hiện), không vỡ layout, không lỗi | UI | P3 |
| TB-07 | tối đa | Giỏ 120 sản phẩm | Render header 360 | Số đếm gọn, không đẩy icon xuống dòng, accessible name đúng số | UI | P3 |
| TB-08 | tối đa | Announcement text 200 ký tự | Render 360 | Text xuống dòng, không tràn ngang, link vẫn bấm được | UI | P3 |
| TB-09 | mất mạng / JS lỗi | Chặn `header-menu.js` (route abort) | Desktop: click toggle; mobile: mở drawer | Link cấp 2 và drawer vẫn truy cập được (NFR-4) | E2E | P1 |
| TB-10 | không JS | `javaScriptEnabled: false` | Như TB-09 | Truy cập được link cấp 2 desktop và mobile | E2E | P1 |
| TB-11 | mất mạng | Offline khi submit newsletter | Submit, bật mạng lại, submit lại | Trình duyệt báo lỗi tải trang; lần 2 thành công, không gửi trùng | UI | P3 |
| TB-12 | 360px | Viewport 360×780 | Mở /, /collections/all, product | Không cuộn ngang; drawer toggle, search, account, cart ≥ 24×24px; drawer cuộn được khi menu dài | E2E | P1 |
| TB-13 | 768 | Viewport 768 | Render header | Nav hay drawer theo Figma (chờ Designer); không chồng chữ | UI | P2 |
| TB-14 | keyboard | Desktop | Tab từ đầu trang tới cart | Thứ tự focus = DOM: (skip link) → logo → menu → search → account → cart; focus thấy được; không `tabindex > 0` | E2E | P1 |
| TB-15 | keyboard | Desktop, submenu mở bằng Enter | Tab qua hết link cấp 2 ra mục kế tiếp | Submenu đóng khi focus rời mục, `aria-expanded="false"` | E2E | P2 |
| TB-16 | keyboard | Drawer mở | Tab/Shift+Tab liên tục | Focus không thoát ra nội dung phía sau; body không cuộn khi drawer mở | E2E | P2 |
| TB-17 | screen reader | VoiceOver Safari iOS + NVDA Chrome | Duyệt header, mở dropdown, drawer, accordion | `<nav>` có aria-label; toggle đọc collapsed/expanded; cart đọc số lượng; icon SVG `aria-hidden`; announcement đọc được | a11y | P1 |
| TB-18 | a11y | Trang chủ: mặc định, dropdown mở (desktop), drawer mở (mobile) | axe trên announcement, header, drawer, footer | 0 violation serious/critical; contrast chữ menu/announcement ≥ 4.5:1 với token mặc định | E2E | P1 |
| TB-19 | a11y | Home, collection, product | Đếm h1 | Mỗi trang đúng 1 h1; tên shop trong header không là h1 trên trang có h1 riêng | E2E | P2 |
| TB-20 | editor vs storefront | Editor (`design_mode`) | Chọn block header/announcement, mở/đóng dropdown và drawer, bỏ chọn | Chọn được block (`block.shopify_attributes` ở root); dropdown/drawer không kẹt mở; storefront không có attribute editor | UI | P2 |
| TB-21 | Canvas | Canvas, yêu cầu Sidekick #8, #9 (docs/checklist-canvas.md) | Sửa text announcement; thêm 1 mục cấp 2 vào menu header | Kết quả đúng; theme check 0 lỗi; cấu trúc Skeleton giữ nguyên | UI | P2 |
| TB-22 | routes / locale | Locale 2 có tiền tố (vd /fr) | Render header | Cart, search, home, account link giữ tiền tố locale (`routes.*`) | E2E | P2 |
| TB-23 | i18n | HTML announcement/header/footer | Đối chiếu locale | Mọi chuỗi (aria-label, placeholder, nút) có key trong `locales/en.default.json`, không chuỗi cứng trong Liquid | static | P2 |
| TB-24 | perf | Trang chủ benchmark | lhci desktop + mobile | perf ≥ 96/90, a11y ≥ 98; `header-menu.js` ≤ 8 KB, `type="module"`; header không gây CLS khi nạp font/JS | perf | P2 |
| TB-25 | console | /, collection, product | Mở trang, hover menu, mở drawer | 0 console error (NFR-2) | E2E | P2 |
| TB-26 | sticky/scroll | Trang dài, dropdown mở | Cuộn xuống/lên | Theo Figma (sticky hay không, chờ Designer); dropdown đóng hoặc giữ đúng vị trí | UI | P3 |

## Tiền kiểm trên code hiện tại (chore/figma-key 44b3ac4, chưa có build TE-1 nên không mở bug)
- TC-02 fail: `assets/base.css` dòng 5, 47, 48, 49, 59, 73, 82, 89–93 literal màu/bo góc (CSS block demo hello-world, liquid-tips).
- TC-05 fail: settings_schema chỉ 2 color (background, foreground), không accent.
- TC-01 fail: css-variables chỉ có `--font-primary--*`, `--style-border-radius-inputs`, không `--color-accent`, `--space-*`, `--radius-*`.
- TC-15 fail: header schema `menu` không default; TC-29 fail: footer schema `menu` không default.
- TC-06..TC-14, TC-19, TC-21..TC-31: chưa có markup (header chỉ list link phẳng, không search link, không announcement, footer không newsletter/social/selector).
- TC-18: cart link Skeleton chỉ có SVG không title + `<sup>` số → accessible name rỗng; TB-19: tên shop trong `<h2>`.
- TC-32..TC-34: `layout/theme.liquid` và `snippets/meta-tags.liquid` đã có lang, title, canonical, og, twitter, page_image, JSON-LD → dự kiến pass.

## Dữ liệu test (efitco-ai-dev)
- Menu `main-menu`: ≥ 4 mục cấp 1; mục "Shop" ≥ 3 con (collection TE-9); ≥ 1 mục không con. Menu biên TB-05/TB-06 tạo riêng `qa-menu-max`, chỉ gán khi chạy case biên rồi trả lại.
- Menu `footer`: menu mặc định của shop, ≥ 3 link.
- Customer accounts: bật (TC-16/17); tắt tạm cho TC-20 rồi bật lại.
- Announcement: 3 trạng thái rỗng / text / text + link, chạy bằng theme preview riêng hoặc đổi setting; spec đọc `EXPECT_ANNOUNCEMENT=off|text|link`.
- Markets/ngôn ngữ: ≥ 2 nước, ≥ 2 ngôn ngữ cho TC-24/25 (`EXPECT_COUNTRIES`, `EXPECT_LANGUAGES`); TC-26 trên trạng thái 1/1.
- Social: Instagram, Facebook có URL; còn lại trống.
- Sản phẩm: variant còn hàng đầu tiên từ `/products.json` (dữ liệu demo TE-9), thêm giỏ qty 2.
- Newsletter: `qa+te1-<timestamp>@example.com`, mỗi lần chạy 1 email mới.
- Biến chạy: `PREVIEW_URL`, `STORE_PASSWORD`.

## Hợp đồng data-testid (đề xuất, chờ dev-fe xác nhận)
Theo CONVENTION `<block>-<element>`. Header: `header` (root), `header-logo`, `header-menu` (nav desktop), `header-menu-item` (li cấp 1), `header-menu-toggle` (nút disclosure mục có con), `header-submenu`, `header-drawer-toggle`, `header-drawer`, `header-drawer-close`, `header-drawer-accordion-toggle`, `header-drawer-submenu`, `header-account` (trên `<shopify-account>`), `header-search-link`, `header-cart-link`, `header-cart-count`.
Announcement: `announcement-bar`, `announcement-bar-link`.
Footer: `footer`, `footer-menu-link`, `footer-social-link`, `footer-payment-icon`, `footer-newsletter-form`, `footer-newsletter-email`, `footer-newsletter-submit`, `footer-newsletter-success`, `footer-newsletter-error`, `footer-country-selector`, `footer-country-option`, `footer-language-selector`, `footer-language-option`.
Ngoại lệ: `<html lang>`, `<meta>`, `<link rel=canonical>` trong `<head>` đọc bằng attribute selector (không gắn testid được).

## KHÔNG CHẮC
- Phạm vi ticket "Test case TE-1 Header": toàn bộ TE-1 hay chỉ header (AC2–AC4). Đang phủ AC1–AC7 để ac_coverage theo docs/srs.md#TE-1 đạt 100%.
- Trùng việc: drafts/qa/2727475000000117005/ và tests/e2e/2727475000000117005.spec.ts (untracked) cùng phạm vi; nếu 007 là ticket QA đúng thì bỏ bản 005 để CI không chạy 2 spec trùng.
- Figma node announcement/header/footer chưa có: 768 dùng nav hay drawer, sticky header, vị trí account ở mobile, trạng thái hover/focus/mở.
- AC2: mục cấp 1 có con là link điều hướng hay chỉ nút mở dropdown; spec giả định có `header-menu-toggle` riêng. Accordion drawer mở 1 hay nhiều mục; có focus trap không.
- AC3: giỏ rỗng hiện 0 hay ẩn badge; search link vào trang search hay mở predictive (TE-8).
- AC4: text chỉ khoảng trắng tính là rỗng; link bọc cả bar hay chỉ text.
- AC5: store dev hiện có bao nhiêu market/ngôn ngữ; dạng selector.
- AC6: hCaptcha của Shopify có thể chặn submit customer form tự động → TC-27/28 có thể phải chạy tay.
- AC7: home không có `shop.description` thì không có meta description — chấp nhận hay cần fallback.
- Block demo Skeleton (hello-world, liquid-tips) còn CSS hardcode → TC-02 fail tới khi dev-fe xử lý hoặc bỏ block demo.
- Spec E2E fail tới khi FE/BE TE-1 merge (job e2e CI chạy mọi spec); cần Tech Lead chốt cách gắn spec vào CI. Chưa type-check được spec (không có node_modules, npm registry bị chặn).
