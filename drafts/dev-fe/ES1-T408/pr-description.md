KHÔNG CHẮC: ticket yêu cầu thêm `<meta name="viewport">` vào head gift card, nhưng `templates/gift_card.liquid` đã render `snippets/meta-tags.liquid` (dòng 3: `width=device-width,initial-scale=1`). Thêm nữa sẽ in 2 thẻ viewport, nên giữ 1 thẻ qua meta-tags, ghi comment trong head và test đếm đúng 1 thẻ. gift-card.md §1 ghi "bản hiện tại THIẾU" là sai.

# ES1-T408 TS-FE8: 404, password, gift card (tuân thủ Shopify mục 7)

Kế hoạch: drafts/techlead/ES1-T304/task-split.md §3 TS-FE8, §2 hợp đồng gift card. Audit A#60, A#63, B#32. Markup tối thiểu; giao diện đầy đủ để ES1-T384 (TE-21-R2-FE2).

## Thay đổi
- `templates/404.liquid`: `<form action="{{ routes.search_url }}" method="get" role="search">` có label thật "Search the store" (`for` → `#NotFoundSearchInput`, `type="search" name="q"`) và nút submit có chữ; link primary "Back To Homepage" (`routes.root_url`, testid `not-found-home`); giữ link all products (secondary).
- `templates/password.liquid`: trên h1 có `<p class="password-logo" data-testid="password-logo">`: `settings.logo` (`image_tag`, alt `shop.name`, 100px, srcset 100/200) hoặc `shop.name` dạng chữ. Không phải link. Input password thêm `autocomplete="current-password"`; giữ `form 'storefront_password'` + `input[type=password]` cho `tests/setup/password.ts`.
- `templates/gift_card.liquid`: khung QR `div.gift-card__qr[data-gift-card-qr][data-identifier][data-label][data-testid=gift-card-qr]` 144 × 144, bên trong `p[data-testid=gift-card-qr-fallback]` "Enter the code at checkout"; không render khi `gift_card.expired` hoặc `gift_card.enabled == false`. Testid `gift-card-code` (mã), `gift-card-wallet` (link Apple Wallet, giữ asset Shopify). Không có thẻ `<script>`.
- `locales/en.default.json`: `404.search_label`, `404.home`, `gift_card.qr_alt`, `gift_card.qr_fallback` (gộp vào key có sẵn, không trùng). Placeholder và nút search dùng lại `search.placeholder`, `search.submit`.
- `assets/base.css`: thêm khoảng 90 dòng (`.gift-card__qr`, `.gift-card__code`, `.gift-card__wallet`, `.not-found*`, `.password-logo*`), chỉ dùng token và thuộc tính logical. Viền input/QR dùng `--color-muted` để đạt tỉ lệ 3:1.

## Hợp đồng cho BE (TS-BE1)
- Host: `[data-gift-card-qr]`, đọc `data-identifier` (`gift_card.qr_identifier`), `data-label` (alt ảnh QR).
- Vẽ xong thì ẩn `[data-testid=gift-card-qr-fallback]`. CSS sẵn có: `img`/`canvas` con trực tiếp của khung chiếm 100% chiều rộng khung 144.
- 2 thẻ script (`vendor/qrcode.js` defer + `gift-card-qr.js` module) đặt trong `templates/gift_card.liquid`. Khung không render khi thẻ hết hạn hoặc bị tắt → JS phải chịu được trường hợp không có host.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn ở bundle-builder, featured-product, quiz-step, testimonial-item, index*, không thuộc file của PR này).
- `gzip -c assets/base.css | wc -c` = 41 636 (≤ 49 152); `critical.css` không đổi, 9 921 (≤ 10 240). Không có file JS trong diff.
- `tests/e2e/ES1-T408.spec.ts`: nhóm `@static` (404 form/link, password logo/shop.name, hook gift card, không `<script>`, locale) + nhóm store (404 `/pages/khong-co` có form `/search` + `a[href="/"]` ≥ 44px, gõ Enter thì sang `/search?q=`; password context không cookie: logo/chữ nằm trên h1). Local không chạy được vì `globalSetup` cần `PREVIEW_URL`: chờ CI.
- Lượt 2 (CI run 43233116834 đỏ spec dòng 52): `getByLabel('Search the store')` khớp cả `form[role=search][aria-labelledby]` lẫn input → strict mode. Đổi sang `getByTestId('not-found-search').getByRole('searchbox', { name: 'Search the store' })`. Markup giữ nguyên, AC không nới.
- Gift card: `test.fixme` cho 2 test (QR ≥ 120 × 120 + 1 viewport; tắt JS vẫn thấy chữ dự phòng) vì store dev chưa có gift card phát hành (ES1-T298). Cần DevOps cấp URL qua biến `TS_GIFT_CARD_URL`. Hai test này chưa tính là đạt.
- Password: test tự skip nếu store dev không bật mật khẩu.
- Playwright smoke, Lighthouse 404 (≥ 96/90/98), ảnh 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
