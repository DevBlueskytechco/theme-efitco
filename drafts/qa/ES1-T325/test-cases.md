KHÔNG CHẮC: spec chưa chạy trong phiên viết (không có PREVIEW_URL, STORE_PASSWORD, Chromium bị sandbox chặn) → kết quả lấy từ CI store-tests của PR, chưa báo đạt. Các điểm chưa chắc khác ở mục KHÔNG CHẮC cuối file.

# ES1-T325 — TE-1-R2-QA1: header tối, drawer, announcement, footer, localization, tài khoản
Nguồn: docs/srs.md#TE-1 (bản 0.5: AC2 phần drawer, AC3, AC4, AC5, AC6, AC9, AC10, AC-H28, AC-H29), ticket ES1-T325, kế hoạch drafts/techlead/ES1-T307/task-split.md (TE-1-R2-QA1), ui-spec navigation.md, announcement-bar.md, localization.md, foundation.md §3, §4. Phạm vi AC: `drafts/qa/ES1-T325/ac-scope.md`.
Spec: `tests/e2e/ES1-T325.spec.ts`. Phụ thuộc: ES1-T323 (TE-1-R2-BE1, header-drawer.js), ES1-T324 (TE-1-R2-BE2, localization-picker.js).

Không lặp spec có sẵn:
- ES1-T323.spec.ts, ES1-T324.spec.ts: hành vi JS chi tiết trên fixture (nạp lười, trần byte, vuốt, inert, ô tìm bỏ dấu, phím ↑↓, đang đổi, theme editor). Spec này kiểm tích hợp trên storefront ở 4 mốc + không JS.
- ES1-T330.spec.ts: từ 80rem (mega) và cấp 3 drawer (TE-22 AC4).
- TE-1.spec.ts (ES1-T23): TC-32 newsletter gửi thật, TC-33 lỗi từ server, TC-18 số lượng giỏ sau /cart/add. Bản viết lại ở đây thay cho TE-1 TC-13, TC-22, TC-23, TC-28–TC-30, TC-45 (drawer trượt + Back, announcement, localization), TC-46/TC-47 (fixme) → TC-22, TC-35; TC-42 bỏ (SRS AC-H29). Xoá các test cũ trong TE-1.spec.ts là việc riêng (ticket này chỉ ghi file ES1-T325).

Mốc: 360, 768, 1280, 1920 bằng `setViewportSize` ở project desktop (cao 900; 1920 cao 1080). Dưới 80rem = 360, 768; dưới 48rem = 360. Project mobile (Pixel 7, cảm ứng) chỉ chạy TC-05 chạm thật.

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC2 | Có JS, 360 và 768, main-menu có mục | Chạm nút menu `header-drawer-toggle` | `header-drawer` mở modal ở cấp 1, `aria-expanded="true"`, `html[data-layer-open]`; phần tử focus là tiêu đề "Menu" (id = `aria-labelledby` của dialog), không phải nút đóng; Tab lần 1 tới `header-drawer-close` | E2E/a11y | P1 |
| TC-02 | AC2 | Drawer mở, có mục cấp 2, 360 và 768 | Chạm `header-drawer-accordion-toggle` đầu tiên | `header-drawer-level` của mục hiện, phủ cả bề ngang drawer (cùng drawer, không lớp mới: 1 `dialog:modal`); có `header-drawer-back` tên "Back to menu", cao ≥ 44, đang focus; có nút "Close menu" trong đầu cấp 2. Bấm Back: cấp 2 ẩn, focus về mục vừa mở | E2E/a11y | P1 |
| TC-03 | AC2 | Drawer mở, 360 và 768 | Đóng lần lượt bằng nút đóng, Esc, chạm scrim (vùng ngoài drawer) | Mỗi lần drawer hết modal, focus về nút menu, `aria-expanded="false"`, `html` không còn `data-layer-open` | E2E/a11y | P1 |
| TC-04 | AC2 | Không JS, 360 và 768 | Bấm nút menu, bấm mục có cấp 2 | Drawer hiện bằng CSS; `header-drawer-submenu` mở tại chỗ (accordion `<details>`), không có Back hiển thị | E2E nojs | P1 |
| TC-05 | AC2 | Project mobile (cảm ứng), 360 | Chạm (tap) nút menu, chạm mục có cấp 2, chạm Back | Như TC-01, TC-02 với sự kiện chạm thật | E2E | P2 |
| TC-06 | AC3 | Shop bật customer accounts, 4 mốc, `/` | Render header | `header-account` là `<shopify-account>`, hiện; `header-cart-link` href `/cart`, tên "Cart, {n} item(s)"; `header-search-link` href `/search`, tên "Search". Dưới 80rem chân drawer có `header-drawer-account` trỏ `/account`, `/account/login` hoặc `/customer_authentication/redirect` (`routes.account_login_url` khi bật customer accounts mới) | E2E | P1 |
| TC-07 | AC3 | Repo theme | Đọc `templates/` | Không có thư mục `templates/customers/`, không file `templates/customers*` | Tĩnh | P1 |
| TC-08 | AC3 | Store dev bật customer accounts mới | GET `/account/login` không theo chuyển hướng | 3xx, `Location` trỏ dịch vụ tài khoản của Shopify (shopify.com/…/account, `customer_authentication` hoặc `*.account.myshopify.com`), không phải trang theme | E2E | P2 |
| TC-09 | AC4 | Text announcement rỗng (mặc định store dev, `EXPECT_ANNOUNCEMENT` không đặt hoặc `off`) | Mở `/` ở 4 mốc | Không có `announcement-bar`, không có `announcement-bar-placeholder` trên storefront | E2E | P1 |
| TC-10 | AC4 | Có text (store dev có bar, hoặc chèn markup đúng hợp đồng `blocks/announcement-bar.liquid` vào container trước sentinel — kiểm fixture) | Render `/` ở 4 mốc | Bar nằm trên header, đáy bar sát đỉnh header (≤ 1px); nền = `--color-background-dark`, noise (`border-image-source` chứa `noise-dark`) như header; cao ≥ 44 | E2E | P1 |
| TC-11 | AC4 | Có text + link / có text không link, 4 mốc | Render | Có link: đúng 1 `announcement-bar-link`, chữ link = cả câu của bar, hộp link cao ≥ 44. Không link: bar không có `<a>` | E2E | P2 |
| TC-12 | AC4 | Bar có text | Render, đọc schema | Bar không có nút (không nút đóng), đúng 1 câu `<p>` (không xoay); schema chỉ có `text`, `link`, không setting kiểu color; `text` không default | E2E/Tĩnh | P2 |
| TC-13 | AC4 | Bar có text, `sticky_header` bật, 4 mốc | Cuộn quá chiều cao bar + 120px | Bar cuộn khỏi màn (đáy ≤ 0, `position` không sticky/fixed); header dính đỉnh (top 0), cao 80 | E2E | P1 |
| TC-14 | AC4 | Trang password, gift card | Đọc `layout/password.liquid`, `templates/gift_card.liquid` | Không gọi `announcement-bar`; gift card dùng `{% layout none %}` | Tĩnh | P2 |
| TC-15 | AC5 | Store dev bán ≥ 2 nước hoặc ≥ 2 ngôn ngữ (18 nước, en + fr), 4 mốc | Render footer; dưới 80rem mở drawer | Footer có đúng 1 `footer-localization-toggle` (cờ + "USD / EN"); dưới 80rem chân drawer có `header-drawer-localization` | E2E | P1 |
| TC-16 | AC5 | 1 nước và 1 ngôn ngữ (kiểm tĩnh — store dev không có dữ liệu này) | Đọc footer.liquid, header.liquid | Control chỉ render khi `available_countries.size > 1` hoặc `available_languages.size > 1`; chữ nút chỉ phần có > 1 mục | Tĩnh | P2 |
| TC-17 | AC6 | Footer, 4 mốc | Render | Form newsletter là customer form (`action` /contact, `form_type` customer, `contact[tags]` newsletter, ô email có tên truy cập); menu footer có link (schema default `footer`); social link (nếu có) http(s) + tên; payment icons trong list "Payment methods", svg nhiều màu, không filter; trang không tràn ngang | E2E | P1 |
| TC-18 | AC6 | Shopify trả trang sau khi gửi newsletter thành công (`?customer_posted=true`), 360 và 1280 | Mở trang | `footer-newsletter-success` hiện, `role="status"`, class `form-message--success`. Lỗi từ server: TE-1.spec.ts TC-33 | E2E | P2 |
| TC-19 | AC6 | Schema footer | Đọc schema | `menu` default `footer`, `show_payment_icons` default true; icon qua `payment_type_svg_tag` từ `shop.enabled_payment_types` | Tĩnh | P3 |
| TC-20 | AC9 | Mọi trang: `/`, `/collections/all`, sản phẩm, `/cart`, `/search?q=a`, 404 ở 360 và 1280; `/` ở 768, 1920 | Render | Header cao 80 (±1), nền `--color-background-dark`, noise, chữ `--color-background-dark-foreground`; đỉnh `<main>` ≥ đáy header (không đè) | E2E | P1 |
| TC-21 | AC9 | `sticky_header` bật, `/`, 4 mốc | Cuộn 200px | Header top 0, cao 80, `data-scrolled`, có bóng, nền không đổi; tổng layout shift có nguồn là header = 0 | E2E/perf | P1 |
| TC-22 | AC9 | Hero có ảnh trên `/` (TC-47 cũ viết lại) | Render 4 mốc; đọc schema | 360, 768: lớp tối hiện, alpha = `overlay_opacity` của slide; 1280, 1920: lớp tối `display: none`; schema `overlay_opacity` default 30 | E2E/Tĩnh | P2 |
| TC-23 | AC9 | Localization hiện theo AC5, 4 mốc | Render footer; dưới 80rem mở drawer | Footer đúng 1 form localization, 1 nút gộp; không có nút tên "Currency" hay "Language" ở footer và drawer | E2E | P1 |
| TC-24 | AC10 | 768, 1280, 1920, có JS | Bấm nút gộp footer | Panel hiện dạng popover (không `:modal`), 2 cột "Country/region" và "Language" cạnh nhau, không tab hiện; Esc đóng, focus về nút gộp | E2E | P1 |
| TC-25 | AC10 | 360, có JS | Bấm nút gộp footer | Panel là bottom sheet modal (đáy sát mép dưới, rộng hết màn), 2 tab; chọn tab Language thì danh sách ngôn ngữ hiện, nước ẩn; nút đóng trả focus về nút gộp | E2E | P1 |
| TC-26 | AC10 | Chỉ 1 danh sách có > 1 mục (kiểm tĩnh + fixture ES1-T324) | Đọc localization-lists.liquid | Tab chỉ render khi cả 2 danh sách có > 1 mục; ô tìm chỉ khi > 10 nước | Tĩnh | P2 |
| TC-27 | AC10 | Drawer mở, 360 và 768 | Chạm hàng localization ở chân drawer | Cấp 2 (`header-drawer-level` trong `header-drawer-localization`) hiện trong cùng drawer, focus Back; chỉ 1 `dialog:modal`, panel footer không mở; Back về hàng localization | E2E | P1 |
| TC-28 | AC10 | Store dev > 10 nước (18), 360 và 1280 | Mở danh sách nước, gõ "can" | Ô tìm `footer-country-search` hiện; danh sách còn ít hơn tổng, mọi mục hiện chứa "can"; hàng nước không có ảnh cờ | E2E | P2 |
| TC-29 | AC10 | 1280, có JS | Mở popover, bấm nước khác (`TE1_COUNTRY_TARGET`, mặc định CA) | Không có nút Apply, mọi mục là nút submit; mục hiện tại có `aria-current="true"` + dấu ✓ (`::before` có nội dung); bấm là POST `/localization` ngay; sau tải lại mục mới có `aria-current`, nút gộp đổi mã tiền | E2E | P1 |
| TC-30 | AC10 | 360, có JS, drawer | Chạm hàng localization, tab Language, chọn `TE1_LANGUAGE_TARGET` (fr) | POST `/localization`; trang tải lại `html[lang]` = fr, đường dẫn có tiền tố `/fr` | E2E | P1 |
| TC-31 | AC10 | Không JS | 1280: bấm nút gộp footer, bấm nước khác; 360: mở drawer, mở hàng localization, bấm ngôn ngữ khác | Form localization gửi được; nước mới có `aria-current`; `html[lang]` đổi | E2E nojs | P1 |
| TC-32 | AC-H28 | Store dev đã cấu hình (fixture ES1-T331 áp, setting footer đã áp), 1920 | Render footer | Có logo, mô tả, ảnh newsletter, heading có phần nhấn khác màu, mỗi màu đạt AA trên nền footer; nút "Get 15% off" (không phân biệt hoa thường) + icon svg; "No spam. Unsubscribe anytime." | E2E | P1 |
| TC-33 | AC-H28 | Theme mới cài (`FRESH_THEME_ID`), 4 mốc | Render footer | Không có "Get 15% off" (không phân biệt hoa thường); nút newsletter = chuỗi locale; mô tả, heading, chữ newsletter, trust rỗng thì không render; không link social mẫu | E2E | P1 |
| TC-34 | AC-H28 | Repo theme | Đọc blocks/footer.liquid, locales/*.json, schema | Không có "15% off" viết cứng; `newsletter_button_label` không default; nút đọc setting rồi mới tới locale | Tĩnh | P1 |
| TC-35 | AC-H29 | Hero thật trên `/`, 4 mốc | Ở đầu trang; cuộn 200px | Header cao 80, nền tối; đáy header ≤ đỉnh `slideshow` (không chồng); sau khi cuộn nền và chiều cao header không đổi | E2E | P1 |

## Case biên (ngoài AC)
| ID | Nhóm | Given | When | Then | Ưu tiên |
| --- | --- | --- | --- | --- | --- |
| TB-01 | 360px | `/` ở 360 | Render, cuộn tới footer | `scrollWidth` ≤ 360 (header, footer không tràn ngang) | P2 |
| TB-02 | Mất mạng | `header-drawer.js` bị abort, 360 | Bấm nút menu, bấm mục cấp 2 | Drawer vẫn mở bằng `<details>`, cấp 2 accordion tại chỗ; 0 pageerror | P1 |
| TB-03 | Mất mạng | `localization-picker.js`, `localization-list.js` bị abort, 1280 | Bấm nút gộp | Panel vẫn mở (details), mục nước là nút submit hiện được | P1 |
| TB-04 | Mất mạng | Popover đang mở, trình duyệt offline, 1280 | Bấm nước khác | `footer-localization-error` hiện, `role="alert"`; online lại thì trang vẫn dùng được | P2 |
| TB-05 | Bàn phím | 360, có JS | Tab từ đầu trang tới nút menu, Enter | Drawer mở, focus tiêu đề "Menu" | P1 |
| TB-06 | Screen reader | 360 drawer mở cấp 2; 360 sheet mở; 1280 popover mở; header + footer đóng ở 4 mốc | axe | 0 vi phạm serious/critical | P1 |
| TB-07 | Editor vs storefront | Storefront | Render | Không có `announcement-bar-placeholder`, không chữ placeholder menu header | P3 |
| TB-08 | Merchant chưa chọn resource | Menu header, menu footer rỗng (kiểm tĩnh) | Đọc header.liquid, footer.liquid | Header không render drawer + nav khi `menu.links.size` = 0; footer không render `<nav>` khi menu rỗng; placeholder chỉ trong `request.design_mode` | P2 |
| TB-09 | Console | 360 và 1280 | Mở/đóng drawer, cấp 2, popover/sheet localization | 0 console error của theme (bỏ qua script nền tảng Shopify) | P2 |

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- main-menu có mục có cấp 2 (ES1-T271); thiếu thì TC-01..TC-05, TC-27 skip có lý do.
- Markets: 18 nước, ngôn ngữ en + fr (ES1-T298 mục 18, ES1-T434). `TE1_COUNTRY_TARGET`=CA, `TE1_LANGUAGE_TARGET`=fr, `TE1_PRODUCT_HANDLE` từ tests/e2e/store-data.json.
- Announcement: store dev để trống (mockup trang chủ không có bar). Trạng thái có text kiểm bằng chèn markup đúng hợp đồng block (kiểm fixture); khi store có bar đặt `EXPECT_ANNOUNCEMENT=text|link` để đo bar thật.
- AC-H28 store dev: fixture ES1-T331 (`tests/fixtures/home-figma.json`, khối footer hàng 16). Theme mới cài: biến `FRESH_THEME_ID` (theme push từ repo, không áp fixture).
- Customer accounts mới bật trên store dev.

## Kết quả chạy trong phiên
- Nhóm tĩnh (`--config=drafts/qa/ES1-T325/pw-static.config.mjs -g "ES1-T325 tĩnh"`): 9/9 đạt (TC-07, TC-12, TC-14, TC-16, TC-19, TC-22 schema, TC-26, TC-34, TB-08).
- `--list`: 91 test (gồm skip theo project), biên dịch được. Chưa chạy `tsc` (lệnh cần duyệt trong phiên).
- Nhóm storefront, cảm ứng, không JS: chưa chạy (không có PREVIEW_URL/STORE_PASSWORD, sandbox chặn Chromium) → chờ CI. Chưa có bug nên `bugs/` trống.
- `ac_coverage.py ac-scope.md test-cases.md`: 7/7 = 1.00 (script chỉ nhận AC số); AC-H28 (TC-32, TC-33, TC-34), AC-H29 (TC-35) đối chiếu tay.

## KHÔNG CHẮC
1. Spec chưa chạy; chờ CI store-tests (PR). Không báo đạt.
2. AC-H28 cần ảnh newsletter và logo, nhưng fixture ES1-T331 để `logo: null`, `newsletter_image: null` và preview không đặt được setting footer trong layout (ES1-T181, ES1-T428/ES1-T177). TC-32 fail phần ảnh khi setting footer đã áp mà thiếu ảnh. Đã hỏi Tech Lead: ES1-T603 (gồm cả #3, #4 dưới đây).
3. SRS 0.5 (21/11) ghi nút "Get 15% off" (sentence case), fixture còn "Get 15% Off": TC-32, TC-33 so không phân biệt hoa thường.
4. Lớp tối hero chưa có `data-testid` (`.slideshow__overlay` trong blocks/slideshow-slide.liquid): TC-22 đọc trong `evaluate` dưới `slideshow`; đề nghị thêm `data-testid="slideshow-overlay"` trong ES1-T603.
5. TC-08: định dạng `Location` của customer accounts mới (shopify.com/<id>/account hay `customer_authentication`) đọc theo tài liệu Shopify, chưa đo trên store dev.
6. TC-18: giả định Liquid `form.posted_successfully?` đúng khi URL có `customer_posted=true`; nếu không render thì test skip có lý do, phần gửi thật ở TE-1 TC-32.
7. Ngoài AC ticket: locale `blocks.header.sign_in` "Sign In", `blocks.footer.try_again` "Try Again" lệch content.md (sentence case, CTO 21/11) — thuộc việc đổi chuỗi theo ES1-T567, không tạo bug ở đây.

## CI store-tests run 45228503580 (PR #332) — phân loại lỗi
Không có bug theme; 3 lỗi đều do spec, đã sửa spec (không nới assert):
- TC-03 AC2 360 + 768 (scrim): đo `boundingBox` drawer ngay sau `showModal` khi drawer còn trượt vào (`translate`, base.css `.drawer`), mép phải đo được nhỏ hơn thật → cú chạm `mép + 12` rơi vào drawer khi chuyển động xong (768 flaky, 360 đỏ). Sửa: chờ `getAnimations().finished` rồi chạm `width − 6` (drawer 90% ở 360, `--drawer-m` từ 48rem, luôn để lại scrim bên phải). modal-dialog.js đóng khi chạm ngoài hộp dialog — đúng navigation.md.
- TC-06 AC3 360 + 768: link tài khoản chân drawer là `routes.account_login_url`; store dev bật customer accounts mới nên Shopify render `/customer_authentication/redirect`, spec chỉ nhận `/account(/login)`. Sửa regex nhận thêm đường này (đúng hành vi nền tảng, cùng giả định TC-08).
- TC-27 AC10 360 + 768: `first().or(first())` khớp cả nút nước và nút ngôn ngữ → strict mode violation. Sửa: `.or(...).filter({ visible: true }).first()`.
- Bug: không có.

