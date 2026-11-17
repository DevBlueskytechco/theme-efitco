KHÔNG CHẮC: (1) chưa chạy trên preview (máy QA không có PREVIEW_URL, sandbox chặn) — kết quả chờ CI store-tests, chưa báo đạt; (2) store dev chưa có gift card phát hành, hết hạn, bị tắt (ES1-T298): TC-38..TC-42, TC-44 fixme theo env, phần CSS kiểm bằng fixture ("kiểm mockup", TC-43, TC-45); (3) phần JS của AC4, AC5, AC11, AC13, AC15 là ticket BE còn Open (ES1-T474, ES1-T443, ES1-T410): test fixme gắn mã, tự chạy khi nút JS gỡ `hidden`; (4) AC16 meta description: `snippets/meta-tags.liquid` chỉ in khi `page_description` có giá trị — chưa biết Shopify có trả `page_description` cho 404/password/gift card không, TC-47 sẽ trả lời; (5) AC10 "email đã đăng ký → cùng hộp thành công" phụ thuộc phản hồi form customer của Shopify, TC-28 dùng 1 email cố định để lần chạy thứ 2 trở đi là case "đã đăng ký"; (6) AC6, AC16 điểm Lighthouse đo bằng `npx lhci autorun` (TC-17, TC-49), không trong spec Playwright.

# ES1-T386 — TE-21 Trang phụ: page, contact, 404, password, gift card ở 4 mốc, mọi trạng thái
Nguồn: docs/srs.md#TE-21 AC1–AC17 (0.5; thay TE-9 AC2 0.4), bảng setting TE-21; docs/ui-spec/page.md, 404.md, password.md, gift-card.md; ticket ES1-T386, ES1-T383 (PR #243), ES1-T384 (PR #208), ES1-T407, ES1-T408; BE còn mở ES1-T410, ES1-T443, ES1-T474. Figma: không có node cho 4 màn này (ui-spec ghi "Figma: không có").
Spec: tests/e2e/ES1-T386.spec.ts. Không viết lại phần đã có: kiểm tĩnh schema, locale, hook (ES1-T383, ES1-T384, ES1-T407, ES1-T408 nhóm @static/tĩnh) và luồng submit cơ bản (ES1-T407 contact, ES1-T384 password sai). Spec này phủ phần còn thiếu: ma trận 4 mốc 360/768/1280/1920, trạng thái rỗng/lỗi/không JS/mất mạng, bàn phím, LCP, axe đủ mọi mức, AC17 hai lớp nội dung.
Phạm vi AC: `drafts/qa/ES1-T386/ac-scope.md`.

Quy ước: "×4" = chạy ở 360, 768, 1280, 1920 (cao 900) bằng `setViewportSize`, project desktop; project mobile (Pixel 7) chạy nhóm B-09. Selector `data-testid`; phần tử chưa có testid bám role/text, đã xin thêm ở ES1-T489. Bug đã biết dùng `test.fail` gắn mã bug (đỏ lại khi đã sửa → gỡ).

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | page template mặc định có nội dung (`TE383_PAGE_PATH` hoặc `TE403_PAGE_PATH`) | mở ×4 | `breadcrumb` có "Home" và `breadcrumb-current` = h1; đúng 1 h1; `page-content` có class `rte`; cột `page` rộng 720 ±1 căn giữa ở 768/1280/1920, ở 360 = 360 − 2 × lề; đoạn đầu font 16px, line-height 27.2px (1.7), rộng ≤ 65ch; 0 `page-empty-hint` | E2E | P2 |
| TC-02 | AC1 | page nội dung rỗng (`TE386_EMPTY_PAGE_PATH`) | mở ở 360 và 1280 | đúng 1 h1; 0 `page-content`; 0 `page-empty-hint` (storefront) | E2E | P3 |
| TC-03 | AC1 | `templates/page.liquid`, `page.contact.liquid` | đọc nguồn | câu gợi ý `page-empty-hint` chỉ trong nhánh `request.design_mode`; nhánh `page.content != blank` bọc `.rte` | Tĩnh | P3 |
| TC-04 | AC2 | page có bảng rộng, ảnh, link trong đoạn | mở ở 360 × 800 và 640 × 400 (1280 phóng 200%) | `scrollWidth ≤ clientWidth` của trang; bảng rộng hơn cột có khung cuộn riêng (`overflow-x` auto/scroll, `scrollWidth > clientWidth` của khung); link trong `p` gạch chân; mọi `img` trong `page-content` `loading="lazy"` | E2E | P2 |
| TC-05 | AC3 | page gán `page.contact` (`TE383_CONTACT_PATH`, mặc định `/pages/contact`) | mở ×4 | thứ tự DOM `breadcrumb` → `page-title-heading` → `page-content` (nếu có) → `contact-form` → `contact-aside` (nếu có); 1 h1; `contact-form-heading` khác rỗng; "* Required fields"; đúng 3 control (2 input + textarea), không phone/subject; `#ContactBody` describedby `ContactBodyHint` chứa "order number"; `contact-submit` = "Send Message" | E2E | P1 |
| TC-06 | AC3 | như TC-05 | đo khối ×4 | 360: Name, Email, Message xếp dọc; 768: 1 cột trang (aside dưới form), Name/Email cùng hàng, Message cả hàng; 1280, 1920: aside (nếu có) cùng hàng với form, mép trái aside = cột 9 của lưới 12 (gap 24) ±2, rộng form = 7 cột ±2; không cuộn ngang mọi mốc | E2E | P2 |
| TC-07 | AC3 | contact có aside, 1280 và 1920, cao 700 | cuộn tới giữa form | `contact-aside` `position: sticky`; khoảng cách đỉnh aside tới đỉnh viewport = 104 ±2 khi đang dính | E2E | P3 |
| TC-08 | AC3 | contact có aside | tải, rồi Tab tới summary câu 2, Enter | câu 1 `open` sẵn; câu 2 mở, câu 1 vẫn mở (mở nhiều); `aside` có tên = `contact-aside-heading`; mỗi `contact-aside-policy` href `/policies/` | E2E | P2 |
| TC-09 | AC3 | contact, setting "Show privacy note" mặc định bật | mở | shop có privacy policy: `contact-privacy` có link `/policies/privacy-policy`; không có: 0 `contact-privacy` (ghi annotation) | E2E | P3 |
| TC-10 | AC4 | contact, đường không JS (form POST thường, bỏ kiểm trình duyệt bằng `noValidate`) | gửi form rỗng 1 lần, rồi đo ×4 trên trang trả về | `contact-errors` hiện, `role=alert`, chữ "Check {n} field(s)" với n = số link hiện (Shopify chỉ trả lỗi trường nó kiểm phía server, chắc chắn có Email; trường được trả ghi annotation); link tới đúng `#ContactName`/`#ContactEmail`/`#ContactBody`; mỗi ô Shopify trả lỗi `aria-invalid=true`, `aria-describedby` chứa id câu lỗi; 3 câu "Enter your name.", "Enter an email like name@example.com.", "Enter a message." có icon svg; viền ô = màu `--color-sale` + box-shadow inset 1px (tổng 2px); bấm link tóm tắt → focus vào ô tương ứng. hCaptcha chặn → skip có lý do | E2E | P1 |
| TC-11 | AC4 | contact có JS tăng cường (ES1-T474) | rời Email đang sai; bấm gửi khi Name trống | câu lỗi Email hiện ngay; tóm tắt nhận focus. Chưa có ES1-T474: fixme | E2E | P2 |
| TC-12 | AC5 | contact | gửi đủ 3 trường hợp lệ (1 lần, 1280) | `contact-status` `role=status`, "Thanks for contacting us"; 0 `#ContactName`, `#ContactEmail`, `#ContactBody` (thay form); `contact-continue` "Continue Shopping" class `button--secondary`. Focus vào hộp: fixme ES1-T474 mục 4 | E2E | P1 |
| TC-13 | AC5 | `blocks/contact-form.liquid` | đọc nguồn; kiểm tay trên store khi hCaptcha thất bại | nhánh `form.errors contains 'form'` in `.alert` `role=alert` "Your message wasn't sent" + câu cách xử lý; value các ô giữ `form.*` | Tĩnh + tay | P3 |
| TC-14 | AC5 | contact có JS (ES1-T474) | gửi hợp lệ, chặn POST bằng `route` treo | nút `aria-busy=true`, bề rộng không đổi; 3 ô `readonly`; `contact-live` = "Sending your message…". Chưa có ES1-T474: fixme | E2E | P3 |
| TC-15 | AC6 | page và contact | mở ×4 | mọi ô có `label[for]`; Name `autocomplete=name`, Email `autocomplete=email` `type=email`; cao ô Name, Email, nút ≥ 48 (< 1024) / ≥ 52 (≥ 1024); summary aside ≥ 56; axe 0 vi phạm mọi mức trong `main` | E2E/a11y | P1 |
| TC-16 | AC6 | JS tắt | mở page và contact ở 360 và 1280 | đủ h1, `page-content`, `contact-form` `method=post`, action chứa `/contact`; summary aside bấm mở được; không cuộn ngang | E2E | P2 |
| TC-17 | AC6 | page, contact | `npx lhci autorun` desktop + mobile | Performance ≥ 96/90 (CI), A11y, BP 100, SEO 100 | Perf (CI) | P2 |
| TC-18 | AC7 | `/pages/es1-t386-khong-co` | mở ×4; `page.clock` chạy 60 s | HTTP 404; 0 `breadcrumb`; eyebrow "Error 404"; 1 h1 `not-found-heading` khác rỗng; câu mô tả khác rỗng; `not-found-search` `role=search`, `method=get`, action `/search`, label "Search the store", input `name=q` `type=search`; `not-found-search-submit` tên "Search"; `not-found-home` "Back To Homepage" href `/`; activeElement không phải ô tìm; 0 `dialog[open]`, `html` không `data-layer-open` | E2E | P1 |
| TC-19 | AC7 | 360 × 640 | mở 404 | đáy của eyebrow, h1, mô tả, ô tìm, nút về trang chủ ≤ 640; không cuộn ngang | E2E | P2 |
| TC-20 | AC7 | 404 ở 1280 | gõ "du" vào ô tìm | có request `/search/suggest` và listbox gợi ý hiện (TE-8 AC1). Bug ES1-T486: `test.fail` | E2E | P3 |
| TC-21 | AC7 | 404 ở 360 và 1280 | Tab từ đầu `main` | thứ tự focus: ô tìm → nút Search → Back To Homepage; khung ô có outline khi focus; gõ "a" + Enter → `/search?q=a` | E2E | P2 |
| TC-22 | AC8 | 404 | mở ×4 | menu trống: 0 `not-found-categories`; có menu: `nav` có tên, trong `ul`, ≤ 6 `not-found-category`, mỗi cái cao ≥ 44; link `/collections/` có số "N product(s)" | E2E | P2 |
| TC-23 | AC8 | 404 | mở ×4 | chưa chọn collection: 0 `container-not-found-products` có sản phẩm, khối `not-found` vẫn đủ h1, ô tìm, nút home; đã chọn: `featured-collection-heading` là h2, `featured-collection-view-all` href kết thúc `/collections/all`, 4–8 `product-card`, mọi ảnh card `loading=lazy` | E2E | P2 |
| TC-24 | AC8, AC16 | 404 | mở ×4, đọc LCP (PerformanceObserver) | phần tử LCP là `h1` `not-found-heading` hoặc nằm trong nó | perf | P2 |
| TC-25 | AC9 | context không cookie mở khoá, `/password?preview_theme_id` | mở ×4 | `body.template-password`, nền `--color-background-dark` + `background-image` noise; 0 `header`, `footer`, `announcement-bar` testid; `password-logo` cao 80 ±1, không chứa `a`, có `img[alt]` khác rỗng hoặc chữ; đúng 1 h1; `em` trong h1 (nếu có) màu `--color-accent`; chân có "Are you the store owner?" + link "Log in here" href `/admin` + link Powered by Shopify | E2E | P1 |
| TC-26 | AC10 | như TC-25, Show newsletter bật | mở ×4 | thứ tự DOM `password-newsletter` → "Have a password?" → `password-details`; label "Email" hiện; `password-newsletter-submit` "Notify Me"; ghi chú "No spam. Unsubscribe anytime."; `password-details` đóng; mở: label "Password" `for=PasswordInput`, `autocomplete=current-password`, `password-submit` "Enter Store"; 360 ô email và nút xếp dọc, ≥ 768 cùng hàng | E2E | P1 |
| TC-27 | AC10 | password, 360 và 1280 | gõ "abc" vào ô email rồi Tab | câu "Enter an email like name@example.com." hiện, màu chữ = foreground tối (trắng), có icon (`::before` "!"); ô viền 2px | E2E | P2 |
| TC-28 | AC10 | password, 1280, email cố định `qa+es1-t386@example.com` | gửi form newsletter | `password-newsletter-success` `role=status` "You're on the list", 0 ô email; lần chạy sau (đã đăng ký) cùng kết quả. Tag `newsletter`, `password-page` trên khách: kiểm tay trong admin. hCaptcha → skip có lý do | E2E + tay | P2 |
| TC-29 | AC10 | preview có Show newsletter tắt | mở | 0 `password-newsletter`, 0 dải "Have a password?", `password-details` `open`. Preview đang bật: skip có lý do | E2E | P3 |
| TC-30 | AC10, AC11 | JS tắt | mở password ở 360 và 1280 | 2 form `method=post`; summary bấm mở details (gốc trình duyệt); `password-toggle` không hiện; gửi sai mật khẩu → trang tải lại có `password-error` | E2E | P2 |
| TC-31 | AC11 | password | gửi mật khẩu sai 1 lần, đo ×4 trên trang trả về | `password-details` `open`; `password-input` `aria-invalid=true`, describedby `PasswordError`, viền 2px màu `--color-sale`; `password-error` = "That password is incorrect. Check the spelling and try again.", chữ trắng, icon | E2E | P1 |
| TC-32 | AC11 | như TC-31 | trang tải lại | activeElement là `#PasswordInput`. Bug ES1-T488: `test.fail` | a11y | P3 |
| TC-33 | AC11 | password, `STORE_PASSWORD` có | nhập đúng, Enter Store | rời `/password`, thấy `header` storefront | E2E | P1 |
| TC-34 | AC11 | password có JS (ES1-T443) | mở details, bấm `password-toggle` | nút hiện, 44 × ≥ 44, tên "Show password" `aria-pressed=false` → "Hide password" `aria-pressed=true`, ô `type=text`; bấm lại về cũ. Nút còn `hidden`: fixme ES1-T443 | E2E | P3 |
| TC-35 | AC12 | password ×4 | mở | có ảnh: `password-media img` `alt=""`, `loading=eager`, khung bo 16; < 1024 media nằm dưới `password-heading` (y lớn hơn), ≥ 1024 media bên phải cột nội dung, đỉnh media ≥ đáy thanh 80; ≥ 1024 `fetchpriority=high`. Không ảnh: ≥ 1024 media là thẻ nền trắng 6% (`background-color` có alpha), < 768 media `display: none` | E2E | P2 |
| TC-36 | AC12 | password có ảnh, 360 và 768 | mở | img không có `fetchpriority=high`. Bug ES1-T487: `test.fail` | perf | P3 |
| TC-37 | AC12 | password 360 và 1280 | đọc màu chữ phụ; Tab tới ô email | ghi chú, dải, chân màu `--color-muted-on-dark`; outline focus 2px màu `--color-background-dark-foreground` | a11y | P2 |
| TC-38 | AC13 | gift card còn hiệu lực (`TS_GIFT_CARD_URL`) | mở ×4 | 1 `meta[name=viewport]`, `meta[name=robots][content=noindex]`; thanh 80; `gift-card-logo` là `a` href `/`, cao ≥ 44; 1 h1; `gift-card-card` không `img` nào ngoài logo; `gift-card-balance` có số tiền; `gift-card-code` khác rỗng; `gift-card-wallet` chỉ khi có, ảnh từ `gift-card/add-to-apple-wallet.svg`, cao ≥ 44; `gift-card-start` "Start Shopping" href `/`; 0 `header`/`footer`/`announcement-bar` testid theme; < 1024 thẻ trên panel, ≥ 1024 thẻ trái panel phải | E2E | P1 |
| TC-39 | AC13 | như TC-38, có JS | mở 360 và 1280 | `gift-card-qr` ≥ 120 × 120; trong có `img`/`canvas` tên "QR code, scan to redeem gift card"; fallback ẩn. QR chưa vẽ: fixme ES1-T410 | E2E | P1 |
| TC-40 | AC13 | gift card dùng một phần (`TE386_GIFT_CARD_PARTIAL_URL`) | mở | `gift-card-balance` chứa "initial value" | E2E | P2 |
| TC-41 | AC14 | gift card hết hạn (`TE386_GIFT_CARD_EXPIRED_URL`) | mở ×4 | `gift-card-card` `filter` grayscale; số dư trong `s`; pill "Expired"; `gift-card-alert` `role=alert` "This gift card has expired" + "It expired on"; có icon svg; 0 `gift-card-qr`, `gift-card-wallet`, `gift-card-copy`; `gift-card-contact` "Contact Us" `button--secondary`; `gift-card-code` hiện | E2E | P1 |
| TC-42 | AC14 | gift card bị tắt (`TE386_GIFT_CARD_DISABLED_URL`) | mở 360 và 1280 | như TC-41 nhưng câu "This gift card is no longer active" | E2E | P2 |
| TC-43 | AC14 | fixture dựng từ class của `templates/gift_card.liquid` + base.css thật ("kiểm mockup") ; nguồn template | đo ×4; đọc nguồn | thẻ inactive `filter: grayscale(1)`, `s` gạch; alert có icon; nguồn: QR trong `unless expired or enabled == false`, Wallet và Copy chỉ trong nhánh còn hiệu lực, Contact trong nhánh inactive | Tĩnh + mockup | P2 |
| TC-44 | AC15 | gift card có JS (ES1-T410), 1280 | bấm `gift-card-copy` (`page.clock`) | clipboard = mã; nhãn "Copied" ; status "Gift card code copied"; sau 2 s nhãn về "Copy Code". Nút còn `hidden`: fixme ES1-T410 | E2E | P2 |
| TC-45 | AC15 | gift card (store nếu có, fixture luôn chạy) | `emulateMedia({ media: 'print' })` | thanh trên, `gift-card-copy`, nhóm hành động `display:none`; thẻ nền trắng (`--color-background`), chữ `--color-foreground`; `gift-card-code`, `gift-card-qr` vẫn hiện | E2E + mockup | P2 |
| TC-46 | AC15 | gift card còn hiệu lực; JS tắt, và JS bật nhưng `route.abort` `qrcode.js`, `gift-card-qr.js` | mở ×4 | không thấy `gift-card-copy`, `gift-card-print`; `gift-card-qr` 144 × 144 ±1 giữ `gift-card-qr-fallback` "Enter the code at checkout"; 0 console error theme (đã bỏ log request bị abort) | E2E | P1 |
| TC-47 | AC16 | 404, password, gift card | mở ×4 | axe 0 vi phạm mọi mức (proxy Accessibility 100); `<title>` khác rỗng; có `meta[name=description]` | a11y | P1 |
| TC-48 | AC16 | password, gift card | mở ×4, đọc LCP | password: ≥ 1024 có ảnh → LCP là `img` trong `password-media`; < 1024 → LCP là/trong `password-heading`; gift card: LCP không phải `img` lớn (là chữ trong `gift-card-balance` hoặc h1) | perf | P2 |
| TC-49 | AC16 | 404, password, gift card | `npx lhci autorun` | A11y 100, BP 100, Performance NFR-1; SEO không tính | Perf (CI) | P2 |
| TC-50 | AC17 | repo (theme mới cài) | đọc nguồn | 5 template + block `not-found`, `password-hero`, `contact-form`, `contact-aside` không `figma-`; heading, text, eyebrow, image, category_menu không default; `faq-item` trong `page.contact` không truyền câu hỏi; `featured-collection` 404 không truyền collection | Tĩnh | P1 |
| TC-51 | AC17 | store theo `TE386_STORE_STATE=new` | mở contact, 404, password | contact: heading "Send Us A Message" (locale), 0 `contact-aside`; 404: h1 "Page Not Found", mô tả locale, 0 `not-found-categories`, 0 `product-card`; password: h1 "Opening Soon" (locale), không eyebrow, 0 `img` trong `password-media`. Biến khác `new`: skip có lý do | E2E | P2 |
| TC-52 | AC17 | store theo `TE386_STORE_STATE=configured` (fixture TE-17-R2-QA0) | mở contact, 404, password | contact: "Send Us A Message", 5 `faq-item`; 404: 5 `not-found-category` href `/collections/figma-cat-*` có số, 4 `product-card`; password: eyebrow "Opening Soon", h1 "Level Up Your Fitness", `em` "Your Fitness" màu accent, có `img` | E2E | P2 |

## Case biên (ngoài AC)

| ID | Nhóm | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| B-01 | tối đa | 404 menu > 6 link | mở | ≤ 6 `not-found-category` (TC-22, nguồn `limit: 6`) | E2E | P3 |
| B-02 | tối đa | featured-collection 404 | đọc schema/template | Products to show range 4–8; lưới ≤ 8 card (TC-23) | Tĩnh | P3 |
| B-03 | mất mạng | contact, 404: `route.abort` mọi `/assets/*.js` | mở ở 360; 404 gõ "a" + Enter | trang đủ nội dung, form contact là POST thường; 404 sang `/search?q=a` | E2E | P2 |
| B-04 | keyboard | contact 1280 | Tab từ `#ContactName` | Name → Email → Message → (link privacy) → Send Message; không nhảy sang aside trước nút gửi | E2E | P2 |
| B-05 | screen reader | contact, 404, password | đọc accessible name | aside tên = h2; form search tên "Search the store"; nút kính lúp "Search"; summary "Enter Using Password"; logo password `alt` = shop.name | a11y | P2 |
| B-06 | zoom 200% | contact ở 640 × 400 | mở | không cuộn ngang | E2E | P2 |
| B-07 | editor vs storefront | mọi trang store | mở storefront | 0 `page-empty-hint`, `contact-aside-placeholder`, `not-found-categories-placeholder`, `faq-item-placeholder` | E2E | P3 |
| B-08 | chưa chọn resource | logo trống | mở password, gift card | `password-logo`/`gift-card-logo` là chữ shop.name (TC-25, TC-38 nhánh else) | E2E | P3 |
| B-09 | thiết bị thật 360 | project mobile (Pixel 7) | mở contact, 404, password | không cuộn ngang; nút chính ≥ 48 | E2E | P2 |
| B-10 | tên dài | page tiêu đề 120 ký tự | mở | h1, breadcrumb không cắt (TE-10 AC14) — kiểm tay khi có page dữ liệu | tay | P4 |

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))

| Biến (env hoặc tests/e2e/store-data.json) | Dùng ở | Hiện có |
| --- | --- | --- |
| `TE383_PAGE_PATH` / `TE403_PAGE_PATH` | TC-01, TC-04, TC-15, TC-16 | `TE403_PAGE_PATH=/pages/te403-rte` (h5, h6); bảng rộng + ảnh: cần xác nhận, thiếu thì TC-04 bỏ phần đó có annotation |
| `TE386_EMPTY_PAGE_PATH` | TC-02 | chưa có → skip, không tính đạt |
| `TE383_CONTACT_PATH` / `TE407_CONTACT_PATH` | TC-05..TC-16, B-04, B-06 | mặc định `/pages/contact` |
| `STORE_PASSWORD`, `PREVIEW_URL` | TC-25..TC-37 | CI có |
| `TS_GIFT_CARD_URL` | TC-38, TC-39, TC-44..TC-46 | chưa có (ES1-T298) → fixme |
| `TE386_GIFT_CARD_PARTIAL_URL`, `TE386_GIFT_CARD_EXPIRED_URL`, `TE386_GIFT_CARD_DISABLED_URL` | TC-40..TC-42 | chưa có → fixme |
| `TE386_STORE_STATE` = `new` / `configured` | TC-51, TC-52 | chưa đặt → skip |

Email newsletter cố định: `qa+es1-t386@example.com` (1 khách duy nhất trên store dev). Contact gửi thành công 1 lần mỗi lượt chạy (TC-12), lỗi 1 lần (TC-10).

## Bug mở từ lượt này
- ES1-T486 (B01, P3): 404 không nối predictive search — TC-20.
- ES1-T487 (B02, P3): ảnh password `fetchpriority=high` cả dưới 64rem — TC-36.
- ES1-T488 (B03, P3): sai mật khẩu không đưa focus vào ô — TC-32.
- ES1-T489 (task dev-fe): testid còn thiếu.

## KHÔNG CHẮC
Xem dòng đầu file.
