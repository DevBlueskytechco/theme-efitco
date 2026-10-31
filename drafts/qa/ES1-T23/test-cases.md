KHÔNG CHẮC: spec CHƯA chạy lần nào. Không có node_modules, PREVIEW_URL, STORE_PASSWORD; npm và api.github.com bị từ chối trong phiên nên không type-check và không đọc được log CI. Chỉ đã kiểm: bỏ type + `node --check` đạt, regex TC-02 chạy cục bộ trên assets/*.css 0 vi phạm. DoD "CI e2e xanh" chưa xác nhận. Dữ liệu store (menu 2 cấp, social, nhiều nước, customer accounts, payment) chưa biết, nên chưa biết bao nhiêu test bị skip.

# ES1-T23 (2727475000000133014) — E2E TE-1 trên develop
Nguồn: docs/srs.md#TE-1 (AC1..AC9), ticket ES1-T23, nhánh origin/feature/ai-ES1-T5 (spec + test case gốc), Figma 1:362 (Header), 1:1104 (Newsletter + Footer); token: docs/tokens.json
Spec: tests/e2e/ES1-T23.spec.ts (đặt theo key ticket theo yêu cầu giao việc; body ticket ghi TE-1.spec.ts, xem KHÔNG CHẮC). Base đọc code: develop 2b1f0ff.
Tự động: E2E/static có trong spec. UI/a11y tay: chạy tay, không có trong spec. Cột Trạng thái: chạy = chạy mọi store; có điều kiện = skip khi thiếu dữ liệu; fixme = chờ; tay = thủ công.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | Theme settings mặc định | Mở /, /collections/all, /cart, 1 product | `--color-background/foreground/accent` khớp docs/tokens.json; có `--font-*`, `--space-*`, `--radius-*`; nền/chữ body = token | E2E | P2 | chạy (product có điều kiện) |
| TC-02 | AC1 | Repo ở commit của PR | Quét assets/*.css bỏ comment | 0 literal màu, 0 font-family literal, 0 border-radius literal khác 0/50% | static | P2 | chạy |
| TC-03 | AC1 | Editor store dev | Đổi màu nền và accent | Preview đổi trên header, footer; không file CSS nào đổi | UI | P2 | tay |
| TC-04 | AC1 | config/settings_schema.json | Đọc nhóm Colors, Layout | ≥ 4 color gồm background, foreground, accent, muted, border; có space; ≥ 3 radius; mọi label `t:` | static | P3 | chạy |
| TC-05 | AC2 | Desktop 1280, main-menu có mục | Mở trang chủ | `header-menu-item` trên 1 hàng, không tràn ngang; khớp `EXPECT_MENU_ITEMS` nếu đặt | E2E | P2 | có điều kiện |
| TC-06 | AC2 | Desktop, có mục cấp 2 | Hover mục đó | `header-submenu` hiện, có link, `aria-expanded="true"` | E2E | P1 | có điều kiện |
| TC-07 | AC2 | Focus trên toggle, submenu đóng | Enter, rồi Tab | Submenu hiện, `aria-expanded="true"`, `aria-controls` = id submenu; focus vào submenu | E2E | P1 | có điều kiện |
| TC-08 | AC2 | Như TC-07 | Space | Submenu hiện, scrollY không đổi | E2E | P1 | có điều kiện |
| TC-09 | AC2 | Submenu mở bằng keyboard, focus trong submenu | Esc | Submenu ẩn, `aria-expanded="false"`, focus về toggle | E2E | P1 | có điều kiện |
| TC-10 | AC2 | Desktop, mục không con | Click | Link thường, không `aria-expanded`, điều hướng tới url | E2E | P2 | có điều kiện |
| TC-11 | AC2 | Mobile 360 và Pixel 7 | Mở trang chủ | `header-menu` ẩn; drawer toggle hiện, có tên, `aria-expanded="false"` | E2E | P1 | có điều kiện |
| TC-12 | AC2 | Drawer đóng | Bấm toggle | Drawer hiện, `aria-expanded="true"`, số mục drawer = số mục nav | E2E | P1 | có điều kiện |
| TC-13 | AC2 | Drawer mở, có mục cấp 2 | Bấm accordion 2 lần | Lần 1 `header-drawer-submenu` mở có link; lần 2 thu lại, aria-expanded đồng bộ | E2E | P1 | có điều kiện |
| TC-14 | AC2 | Drawer mở | Esc; mở lại, bấm close | Cả 2: drawer ẩn, focus về toggle | E2E | P1 | có điều kiện |
| TC-15 | AC2 | Schema blocks/header.liquid | Đọc setting menu | link_list, default main-menu | static | P2 | chạy |
| TC-16 | AC3 | Bật customer accounts, desktop | Render header | Đúng 1 `shopify-account` hiển thị | E2E | P1 | có điều kiện |
| TC-17 | AC3 | Bật customer accounts, mobile | Render header | `shopify-account` hiển thị | E2E | P1 | có điều kiện |
| TC-18 | AC3 | Giỏ có variant qty 2 | Render header desktop, mobile | Cart link tới /cart, count = 2, tên link chứa số lượng | E2E | P1 | có điều kiện |
| TC-19 | AC3 | Render header desktop, mobile | Đọc và bấm search link | Pathname /search, có tên, tới trang search | E2E | P1 | chạy |
| TC-20 | AC3 | Tắt customer accounts | Render header | Không `shopify-account`, icon không vỡ | UI | P2 | tay |
| TC-21 | AC4 | Text rỗng (mặc định) | Render /, /collections/all | Không có `announcement-bar` trong DOM | E2E | P1 | chạy |
| TC-21b | AC4 | Schema block, layout/theme.liquid | Đọc file | text không default, link kiểu url, block bar đứng trước header | static | P2 | chạy |
| TC-22 | AC4 | Có text, không link (`EXPECT_ANNOUNCEMENT=text`) | Render | Bar hiện đúng, trên header, không có `a` | E2E | P1 | có điều kiện |
| TC-23 | AC4 | Có text + link (`EXPECT_ANNOUNCEMENT=link`) | Click link | Điều hướng đúng, tên link = text bar | E2E | P2 | có điều kiện |
| TC-28 | AC5 | ≥ 2 nước | Chọn nước khác ở /collections/all | Lựa chọn có mã tiền tệ; sau submit nước mới `aria-current`, ở lại trang | E2E | P2 | có điều kiện |
| TC-29 | AC5 | ≥ 2 ngôn ngữ | Chọn ngôn ngữ khác | `html lang` đổi, URL có tiền tố locale | E2E | P2 | có điều kiện |
| TC-30 | AC5 | Trạng thái store bất kỳ | Render footer | Selector hiện thì ≥ 2 lựa chọn; ẩn thì 0 lựa chọn; không selector thì không form localization | E2E | P2 | chạy |
| TC-32a | AC6 | Footer render | Đọc form | `contact[tags]` có newsletter, email có tên + type email, nút có tên | E2E | P1 | chạy |
| TC-32 | AC6 | Footer render | Nhập email mới, submit | `customer_posted=true`, `footer-newsletter-success` có text | E2E | P1 | có điều kiện (hCaptcha) |
| TC-33 | AC6 | Bỏ validate HTML5 | Submit email sai | `footer-newsletter-error` có text, `aria-describedby` trỏ id lỗi, giữ giá trị | E2E | P2 | có điều kiện (hCaptcha) |
| TC-34 | AC6 | Email đã đăng ký | Submit lại | Không crash, có thông báo từ locale | E2E | P3 | tay |
| TC-35 | AC6 | Menu footer mặc định | Render footer; đọc schema | Schema default footer; link có text và href | E2E | P2 | schema chạy, link có điều kiện |
| TC-36 | AC6 | Có URL social | Render footer | Link href http(s), có tên mạng | E2E | P2 | có điều kiện |
| TC-37 | AC6 | Có payment type | Render footer | Mỗi icon 1 SVG có title, nhiều màu | E2E | P2 | có điều kiện |
| TC-38 | AC7 | /, collection, search, cart, product | Đọc html | `lang` = `Shopify.locale` | E2E | P1 | chạy |
| TC-39 | AC7 | Như TC-38 | Đọc head | 1 title, canonical https, đủ og + twitter | E2E | P1 | chạy |
| TC-40 | AC7 | Product có ảnh, mô tả | Đọc head | og:type product, JSON-LD, og:image https + size, meta description | E2E | P2 | có điều kiện |
| TC-24 | AC8 | Settings mặc định | Đọc computed font; đọc schema | Heading Sofia Sans Condensed, body Inter, ≥ 2 font_picker, không tự host | E2E | P2 | chạy |
| TC-25 | AC8 | Settings mặc định | Đọc @font-face | Inter ≥ 4 biến thể; heading có; tất cả swap, từ Shopify CDN | E2E | P3 | chạy |
| TC-25b | AC8 | Settings mặc định | Đọc @font-face | Heading ≥ 4 biến thể theo R15 | E2E | P3 | fixme, chờ ES1-T25 |
| TC-26 | AC8 | Settings mặc định | Đọc biến; quét phần tử có chữ | `--color-muted-light` #6B6B6B, `--color-muted-on-dark` #999999; 0 chữ #999999 trên nền sáng | E2E | P1 | chạy |
| TC-27 | AC8 | Editor, font_picker heading | Chọn font khác | Heading đổi, body giữ Inter | UI | P3 | tay |
| TC-41 | AC9 | Trang không hero: collection, cart, search | Render header | Nền = background, chữ = foreground | E2E | P1 | chạy |
| TC-42 | AC9 | Hero giả lập bằng hook `data-header-overlay` | Render, cuộn 100px | Chữ trắng, main chui dưới header; cuộn thì chữ foreground | E2E | P1 | chạy nếu sticky bật |
| TC-43 | AC9 | sticky_header bật | Cuộn 100px | Header dính đỉnh (y = 0), có bóng, chữ foreground; ở đầu trang không bóng | E2E | P1 | chạy nếu sticky bật |
| TC-44 | AC9 | Schema blocks/header.liquid | Đọc sticky_header | checkbox, default true | static | P2 | chạy |
| TC-45 | AC9 | ≥ 2 nước hoặc ngôn ngữ | Bấm nút gộp | 1 summary dạng "USD / EN"; danh sách ẩn, mở ra sau khi bấm | E2E | P2 | có điều kiện |
| TC-31 | AC9 | Không JS, ≥ 2 nước | Mở summary, chọn nước | Submit qua form, nước mới `aria-current`, ở lại trang (NFR-4) | E2E | P3 | có điều kiện |
| TC-46 | AC9 | Hero thật TE-2 ở đầu trang chủ | Render | Header trong suốt, chữ trắng | E2E | P1 | fixme, chờ TE-2 |
| TC-47 | AC9 | Hero có ảnh | Render | Lớp phủ đen theo `overlay_opacity` mặc định 30%, chữ đạt AA | E2E | P1 | fixme, chờ TE-2 |

Test chạy trên mọi store cho từng AC: AC1 TC-01/02/04, AC2 TC-15 (static; hành vi cần menu 2 cấp), AC3 TC-19, AC4 TC-21, AC5 TC-30, AC6 TC-32a, AC7 TC-38/39, AC8 TC-24/25/26, AC9 TC-41/44.
Lưu ý AC2: nếu store chưa có menu, chỉ còn test static chạy thật; ES1-T16.spec.ts cũng cần menu 2 cấp nên dữ liệu này phải có để AC2 đạt nghĩa.

## Không lặp (đã có ở spec khác)
- ES1-T16.spec.ts: hover đóng khi rời header, mở mục này đóng mục kia, Esc khi hover, host custom element, TB-17 focus trap, trap accordion, backdrop, resize, data-scrolled, ngưỡng 80px, nền trong suốt trên hero giả lập, lỗi mạng header-sticky.js.
- smoke.spec.ts: status, console khi tải trang, axe trạng thái mặc định trên 5 trang. Do đó bỏ axe mặc định ở TB-19 và axe color-contrast ở TC-26.

## Thay đổi so với ES1-T5
- Đánh lại AC: TC-24..27 từ AC5 sang AC8; TC-28..30 giữ AC5; TC-31 sang AC9; thêm TC-41..47 cho AC9.
- Bỏ toàn bộ fixme khỏi phần đã có markup; chỉ giữ TC-25b, TC-46, TC-47 kèm lý do.
- TC-02: sửa regex. Bản cũ `\s*(?!var\()` cho `\s*` lùi về 0 ký tự nên báo sai mọi dòng `font-family: var(...)`.
- TC-01, TC-26: đọc giá trị từ docs/tokens.json. Bản cũ ghi cứng accent #D94610, token hiện là #C8400E.
- TC-11..14: tách accordion thành TC-13 để skip riêng khi menu 1 cấp; bỏ đếm link trong drawer (menu toàn mục có con sẽ báo sai).
- TC-25: bản cũ đòi heading ≥ 4 biến thể, tách thành TC-25b chờ ES1-T25.
- TC-26: thêm quét phần tử thật cho vế "#999999 chỉ trên nền tối".
- TC-31: mở summary trước khi click option (yêu cầu ticket); so `aria-current` thay cookie.
- TC-32, TC-33: skip khi bị hCaptcha chuyển sang /challenge; thêm TC-32a chạy thật.
- TC-38: bỏ /pages/contact (không phải store nào cũng có, theo smoke.spec.ts); product chọn loại có ảnh và mô tả.
- TB-15: đo focus xuyên shadow root; không kiểm vòng focus nếu shadow root của `shopify-account` đóng.
- TB-28: lọc lỗi console ngoài theme như smoke.spec.ts.
- Dữ liệu store: `expect` thành `test.skip` có điều kiện theo yêu cầu ticket; bỏ `EXPECT_COUNTRIES`, `EXPECT_LANGUAGES`.

## Case biên (ngoài AC)
| ID | Nhóm | Given | When | Then | Loại | Ưu tiên | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TB-01 | chưa chọn resource | Setting menu header bị xoá | Render | Vẫn có logo, search, cart; không nav rỗng, không drawer toggle | UI | P2 | tay |
| TB-02 | chưa chọn resource | Menu footer xoá, không social, tắt payment | Render footer | Không danh sách rỗng; newsletter vẫn chạy | UI | P3 | tay |
| TB-03 | chưa chọn resource | Chưa chọn logo | Render header | `shop.name` dạng text link về home | UI | P3 | tay |
| TB-04 | rỗng | Announcement chỉ có khoảng trắng | Render | Không có bar | UI | P3 | tay |
| TB-05 | rỗng | Giỏ rỗng | Render header | Không badge, cart link có tên | E2E | P3 | chạy |
| TB-06 | tối đa | 10 mục cấp 1, 1 mục 15 con, title 40 ký tự | Render 1280 | Không tràn, dropdown không bị cắt | UI | P2 | tay |
| TB-08 | tối đa | Giỏ 120 sản phẩm | Render 360 | Số đếm gọn, icon không xuống dòng | UI | P3 | tay |
| TB-09 | tối đa | Announcement 200 ký tự | Render 360 | Xuống dòng, không tràn | UI | P3 | tay |
| TB-10 | mất mạng | Chặn header-menu.js | Click toggle, mở drawer | Vẫn dùng được menu (NFR-4) | E2E | P1 | có điều kiện |
| TB-11 | không JS | JS tắt | Như TB-10 | Link cấp 2 truy cập được | E2E | P1 | có điều kiện |
| TB-12 | mất mạng | Offline khi submit newsletter | Submit, bật mạng, submit lại | Không gửi trùng | UI | P3 | tay |
| TB-13 | 360px | Viewport 360×780 | Mở /, collection, product | Không cuộn ngang; toggle, search, account, cart ≥ 24px | E2E | P1 | chạy |
| TB-15 | keyboard | Desktop | Tab tới cart | Logo trước search, search trước cuối; focus thấy được; không tabindex > 0. `shopify-account` shadow đóng thì kiểm tay | E2E | P1 | chạy |
| TB-16 | keyboard | Submenu mở bằng Enter | Tab qua hết link | Rời mục thì đóng | E2E | P2 | có điều kiện |
| TB-17 | keyboard | Drawer mở | Tab/Shift+Tab | Không thoát drawer | E2E | P2 | ES1-T16.spec.ts |
| TB-18 | screen reader | VoiceOver iOS, NVDA Chrome | Duyệt header, drawer, newsletter | Toggle đọc trạng thái, cart đọc số lượng, kết quả form được đọc | a11y | P1 | tay |
| TB-19 | a11y | Dropdown mở, drawer mở | axe trên header, footer | 0 serious/critical | E2E | P1 | có điều kiện |
| TB-20 | a11y | Home, collection, product | Đếm h1 | Đúng 1 h1, không nằm trong header | E2E | P2 | chạy |
| TB-21 | contrast hero | Hero thật ảnh sáng | Đo tay chữ menu | ≥ 4.5:1, icon ≥ 3:1 | a11y | P2 | tay, chờ TE-2 |
| TB-23 | editor vs storefront | Editor | Chọn block, mở dropdown, drawer | Chọn được block; placeholder chỉ trong editor | UI | P2 | tay |
| TB-24 | Canvas | Canvas, yêu cầu Sidekick #8, #9 | Sửa announcement, thêm mục menu | Kết quả đúng, theme check 0 lỗi | UI | P2 | tay |
| TB-25 | routes | Locale có tiền tố | Render header | Link giữ tiền tố | E2E | P2 | tay |
| TB-26 | i18n | HTML header, footer | Đối chiếu locale | Mọi chuỗi có key | static | P2 | tay |
| TB-27 | perf | Trang chủ | lhci | ≥ 96/90, a11y ≥ 98 | perf | P2 | CI lighthouse |
| TB-28 | console | / | Hover menu, mở drawer | 0 console error của theme | E2E | P2 | có điều kiện |
| TB-29 | sticky | Dropdown mở | Cuộn | Dropdown không che nội dung vĩnh viễn | UI | P3 | tay |
| TB-30 | trình duyệt | Webview IG/FB, Safari iOS | Mở drawer, submit newsletter | Không kẹt scroll-lock | UI | P3 | tay |

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- `main-menu`: cần ≥ 1 mục có con, ≥ 1 mục không con. Thiếu thì AC2 chỉ còn static.
- Sản phẩm: lấy từ /products.json, ưu tiên còn hàng có ảnh và mô tả.
- Announcement: mặc định rỗng; TC-22/23 cần theme preview riêng + `EXPECT_ANNOUNCEMENT`.
- Newsletter: `qa+es1t23-<project>-<timestamp>@example.com`, mỗi lần chạy CI tạo thêm customer trên store dev.
- Biến chạy: `PREVIEW_URL`, `STORE_PASSWORD`; tuỳ chọn `EXPECT_MENU_ITEMS`, `EXPECT_ANNOUNCEMENT`.

## KHÔNG CHẮC
- Tên file: body ticket ghi tests/e2e/TE-1.spec.ts, yêu cầu giao việc ghi đặt theo key nên dùng tests/e2e/ES1-T23.spec.ts. Cần đổi thì chỉ đổi tên file.
- ES1-T25 (Tech Lead): R15 "4 biến thể" có áp cho font heading không. Heading hiện có 2 biến thể (700, 800). Chưa mở bug.
- ES1-T26 (dev-fe): nút gộp localization chưa có data-testid; helper `localization()` tạm tìm theo form + summary, lệch quy tắc chỉ dùng testid.
- TC-33: chưa xác nhận Shopify trả lỗi customer form về URL nào và có giữ `form.email` không.
- TB-15: chưa biết `shopify-account` dùng shadow root mở hay đóng; nếu đóng, vòng focus của nó phải kiểm tay.
- Không có bug mới: chưa chạy nên chưa có fail thật. ES1-T10 đã đóng (devops 30/10: lỗi giả của CLI cũ).
