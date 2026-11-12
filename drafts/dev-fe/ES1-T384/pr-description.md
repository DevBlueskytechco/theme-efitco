KHÔNG CHẮC: (1) tests/setup/password.ts và scripts/lhci-auth.js điền ô mật khẩu khi ô đang ẩn trong `<details>` đóng. Hai script này chạy trên theme live, nên sẽ hỏng khi theme live có bản này: đã tạo ES1-T442 (QA), cần merge trước hoặc cùng PR này. (2) AC12 yêu cầu dưới 64rem không có `fetchpriority`, nhưng một `<img>` không đổi được thuộc tính theo viewport, nên ảnh password để `fetchpriority="high"` ở mọi mốc (LCP mobile vẫn là h1). (3) Email đã đăng ký: Shopify trả `form.errors`, theme hiện `default_errors`. Hộp thành công "You're on the list" chỉ hiện khi `posted_successfully?`, vì không nhận ra lỗi "đã đăng ký" mà không phụ thuộc ngôn ngữ. (4) AGENTS.md Theme map chưa có 2 dòng `not-found`, `password-hero`: scope-guard chặn FE sửa AGENTS.md, nhờ Tech Lead thêm.

# ES1-T384 · TE-21-R2-FE2: 404, password, gift card theo ui-spec

Story TE-21 (SRS 0.5), thay TE-9 AC2 (0.4). Mã R: R7.9 (AC7–AC15), R4.4 (AC13–AC15), R4.9 (AC10), R12 (AC9–AC11, AC13–AC15), R17 (AC8, AC12), R6.1, R6.2, R11 (AC16).
Nguồn: docs/ui-spec/404.md, password.md, gift-card.md; mockup drafts/designer/ES1-T258/*-1280.png; decisions.md 10/11 (E1, PW1–PW2, GC1; SEO không tính cho 3 trang).

## Thay đổi

- `blocks/not-found.liquid` (mới), dùng cho AC7, AC8. Eyebrow "Error 404", h1 lấy từ setting Heading (rỗng thì dùng locale "Page Not Found"), câu mô tả lấy từ setting Text (rỗng thì dùng locale). Form `role="search"` gửi GET tới `routes.search_url`, có label thật, nút kính lúp `aria-label="Search"`, không autofocus. Nút primary "Back To Homepage" trỏ `routes.root_url`. Hàng link danh mục lấy từ setting "Category menu" (link_list), tối đa 6 link, cao 44, link collection kèm "N products" (pluralize). Menu rỗng thì storefront không có hàng này, trong editor hiện câu hướng dẫn. Setting đúng bảng SRS: heading/text default rỗng, show_search true, category_menu.
- `templates/404.liquid`: container `not-found` gồm block not-found, container `not-found-products` gồm `featured-collection`. Chưa chọn collection thì không render section nào (block có sẵn). Link "View All Products" trỏ `routes.all_products_collection_url`, đặt cạnh h2.
- `blocks/featured-collection.liquid`: thêm param `view_all_url` (có trong `{% doc %}`). Có param thì link dùng nhãn "View All Products" và trỏ URL đó. Không có param thì giữ nguyên hành vi cũ, nên trang chủ không đổi.
- `blocks/password-hero.liquid` (mới), dùng cho AC9–AC12. Thanh 80 chứa logo `settings.logo` (alt `shop.name`, không phải link) hoặc chữ `shop.name`. Sau đó: eyebrow (rỗng thì ẩn); h1 inline_richtext, phần `<em>` màu accent, rỗng thì dùng locale "Opening Soon"; `shop.password_message`; form newsletter `customer` với tag `newsletter,password-page`, label "Email", `autocomplete="email"`, ghi chú "No spam. Unsubscribe anytime.", lỗi định dạng hiện qua `:user-invalid` không cần JS. Tiếp theo là dải "Have a password?" và `<details>` "Enter Using Password". Details đóng sẵn, mở sẵn khi `form.errors` hoặc khi tắt newsletter. Bên trong: label Password, `autocomplete="current-password"`, câu lỗi "That password is incorrect…" kèm icon, `aria-invalid`, nút "Enter Store". Nút mắt có `hidden` cho BE (ES1-T443). Ảnh là thẻ bo 16, `alt=""`, eager. Không có ảnh thì từ 48rem hiện thẻ trắng 6%, dưới 48rem ẩn. Chân trang có "Are you the store owner? Log in here" (`/admin`) và `powered_by_link`.
- `templates/password.liquid` → container → password-hero. `layout/password.liquid`: `<body class="template-password">` cho nền dark + noise toàn trang.
- `templates/gift_card.liquid` (AC13–AC14, phần markup của AC15). Head thêm `meta robots noindex`; viewport vẫn lấy 1 lần từ meta-tags. Thanh tối có logo (link `routes.root_url`, cao 44). Intro gồm eyebrow, h1 "Your {shop} Gift Card" và câu dùng ở checkout. Thẻ dựng bằng CSS, không dùng ảnh card.svg: logo, pill Gift card/Expired, Balance và số dư, dòng "of $X initial value" khi số dư nhỏ hơn giá trị ban đầu. Panel gồm: mã `format_code` (group có nhãn), nút Copy (`hidden`, BE), khung QR 144 giữ nguyên hook ES1-T408 kèm chú thích "Pay in store", `dl` Initial value/Expires, nút Apple Wallet (asset Shopify), "Start Shopping", Print (`hidden`, BE). Thẻ hết hạn hoặc bị tắt: thẻ xám, số dư gạch ngang, `.alert` có icon và câu riêng cho từng trường hợp, ẩn QR/Wallet/Copy, có nút "Contact Us" (`pages['contact']`, không có thì mailto shop.email). `@media print` cho nền trắng, ẩn nút.
- `assets/base.css`: xoá CSS cũ ES1-T408 (`.template-gift-card main`, `.not-found__actions`, `.password-logo__*` cũ…), thay bằng CSS 3 trang. Chỉ dùng token: QR 144 = `calc(var(--space-7) * 3)`, vùng chạm 44 = `calc(var(--space-6) + var(--space-3))`, bo 16 = `--figma-radius-16`, trắng 6/12/40% = `color-mix` với `--color-background-dark-foreground`. Thuộc tính logical, mobile-first 48/64rem, transition chỉ trong `prefers-reduced-motion: no-preference` và dùng `--motion-fast`.
- `locales/en.default.json`: nhóm `404`, `password`, `gift_card` có thêm key theo spec. Bỏ `404.title`, `not_found`, `back_to_shopping`, `password.enter`, `gift_card.expires_on` vì không còn dùng. Thêm `blocks.not_found.categories_placeholder`, `blocks.featured_collection.view_all_products`. `en.default.schema.json`: thêm label/info vào nhóm có sẵn, block not-found dùng `general.404` có sẵn. Không trùng key.
- `tests/e2e/ES1-T384.spec.ts` (mới). `tests/e2e/ES1-T408.spec.ts`: test tĩnh 404/password đọc thêm file block, vì markup đã chuyển sang block. Assert giữ nguyên.

## Hook cho BE

- Gift card (ES1-T410, đã comment): `data-gift-card-copy`, `data-label-copied`, `data-label-status`, `[data-gift-card-status]` role=status, `data-gift-card-print`. Hook QR không đổi.
- Password (ES1-T443): `data-password-toggle` (`aria-pressed`, `aria-controls`, `data-label-show/hide`), `aria-busy` trên 2 nút submit.
- 404, gợi ý predictive khi gõ ≥ 2 ký tự (AC7, câu cuối): chưa gắn, vì cần asset predictive-search của ES1-T130. Hiện form GET vẫn chạy bình thường.

## Ngoài phạm vi, ghi nợ

- `featured-collection` dùng chung có Products to show 4–12 (SRS ghi 4–8), eyebrow/heading có default chữ Figma. Không sửa trong PR này vì đụng trang chủ; trên 404 section chỉ hiện khi merchant chọn collection.
- Câu placeholder ô tìm 404 là "Try a product name or category", không dùng câu tên sản phẩm Figma (ES1-T308 #1).

## Tự kiểm tra

- `shopify theme check`: 0 lỗi, 22 warning có sẵn (bundle-builder, featured-product, quiz-step, testimonial-item, index*.liquid), không file nào thuộc PR.
- `gzip -c assets/base.css | wc -c` = 46 012 (≤ 49 152); `wc -c assets/critical.css` = 10 067, không đổi.
- Quét TC-02 (hex, rgb, white/black, font-family, border-radius) trên assets/*.css: 0 dòng.
- Playwright @static (config tạm, không globalSetup): 13/13 pass, gồm ES1-T384 ×6, ES1-T408 ×4, ES1-T404 ×3.
- Không có file JS trong diff, không thẻ `<script>` mới, không z-index số, không handle `figma-*`.
- Store test ES1-T384, smoke, Lighthouse 404/password/gift card, ảnh 360/768/1280/1920: chờ CI. Skip do thiếu dữ liệu, không tính là đạt: 1 test gift card (`test.fixme`, chưa có TS_GIFT_CARD_URL, ES1-T298); 2 test password tự skip nếu store dev không bật mật khẩu.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
