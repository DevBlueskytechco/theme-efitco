KHÔNG CHẮC: demo-data không có `shop.password_message` (hỏi BA ES1-T268); mockup dùng câu phụ hero Figma 1:422 làm mẫu. Newsletter trên trang password là ĐỀ XUẤT, SRS chỉ nêu form mật khẩu (câu CTO 1).

# UI spec: Password (ES1-T258, vòng 3)

## Thay đổi so với vòng 2

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Nền trang | trắng, ảnh cột phải | nền `--color-background-dark` + noise toàn trang, như dải đầu trang chủ (header + hero + Browse Categories nằm trên 1 dải tối) | Figma 1:360 (#1A1A1A, NOISE), sổ 10/11 |
| 2 | Thanh trên | logo nằm trong cột nội dung, 100 → 140 từ 1280 | thanh 80 riêng hàng đầu, logo trắng 100 × 30 mọi mốc, không là link | Figma 1:362, 1:377; foundation §3 |
| 3 | Ảnh | bo 12, cao 100dvh − 40 | thẻ bo 16 nằm dưới thanh 80 (không đè chữ), cao 100dvh − 80 − 20; 1920 lùi 60 như hero dải rộng 1798 | Figma 1:361 (x 61, w 1798, bo 16) |
| 4 | Chữ | foreground, message muted | h1 trắng (17.4), "Your Fitness" cam (chữ lớn 3.48 ≥ 3), eyebrow xám `--color-muted-on-dark` (6.11), message, ghi chú, chân muted-on-dark | Sổ 10/11 (eyebrow nền tối xám), sổ 09/11 (chữ lớn nhấn cam) |
| 5 | Ô nhập | viền muted-light trên trắng | ô nhập footer: nền trong suốt, viền 100% muted-on-dark, focus outline trắng | Sổ 09/11, Figma 1:1104, foundation §4 |
| 6 | Lỗi, thành công | chữ lỗi đỏ; hộp success nền trắng | chữ lỗi trắng + icon đỏ, viền ô đỏ 2px; hộp success viền trắng 12% + thanh badge-new, chữ trắng | foundation §4 (sale trên dark 2.73) |
| 7 | Nút "Enter Using Password" | secondary viền đen | secondary trên nền tối: chữ, viền trắng; hover nền trắng chữ dark | kit `.section--dark .button--secondary` |
| 8 | Rỗng không ảnh | cột phải nền dark | thẻ nền trắng 6% trên dark (dark trên dark không thấy) | — |

Mục đích: khi store khoá, khách thấy thương hiệu, biết store sắp mở và để lại email; người có mật khẩu (merchant, reviewer) vào store trong 2 thao tác. Story TE-9 AC2 (logo/shop.name, password_message, form).

Figma: không có trang này. Ngôn ngữ: dải tối đầu trang chủ 1:360 + thanh 1:362 + thẻ ảnh 1:361, hero 1:422 (display uppercase, phần nhấn cam), form newsletter footer 1:1104 (input + nút liền, "No spam. Unsubscribe anytime."). Thành phần foundation §3, §4, §6, §12.

Mockup: `drafts/designer/ES1-T258/password.html` + `password-360|768|1280|1920.png`. Cuối file (nền tối): S1 mật khẩu sai, S2 email sai, S3 đăng ký thành công, S4 đang gửi, S5 rỗng.

## 1. Template, layout

`layout/password.liquid` (đã có: `<main>` + `content_for_layout`, không header/footer) thêm class nền tối cho `<body>` (nền `--color-background-dark` + `assets/noise-dark.png`, chữ `--color-background-dark-foreground`). `templates/password.liquid` → container → block mới `password-hero`:
- Thanh 80: logo.
- Cột nội dung: eyebrow · h1 · `shop.password_message` · form newsletter (`{% form 'customer' %}`, `contact[tags]` = `newsletter,password-page`) · dải "Have a password?" · `<details>` "Enter Using Password" chứa `{% form 'storefront_password' %}`.
- Thẻ ảnh (cột phải desktop, sau nội dung trên mobile).
- Chân: "Are you the store owner? Log in here" (`/admin`) · "Powered by Shopify" (`powered_by_link`).

Form mật khẩu trong `<details>`: chạy không JS, không popup; mở sẵn khi `form.errors` (Liquid in `open`). Không dùng dialog: 15 §2 #11 không chốt kiểu cho page password, `<details>` ít bước và 0 JS.

## 2. Anatomy

1. Thanh 80: `settings.logo` (ảnh, alt = shop.name, hiển thị 100 × 30) hoặc shop.name chữ heading 700 28 trắng; không là link (mọi URL đều về trang này).
2. Eyebrow "Opening Soon" (`--color-muted-on-dark`).
3. h1 display uppercase "Level Up Your Fitness", phần nhấn "Your Fitness" `--color-accent`.
4. `shop.password_message` muted-on-dark (merchant sửa ở Admin > Preferences).
5. Newsletter: label "Email" (hiện, trắng 14/600) · input placeholder "name@example.com" · nút primary "Notify Me" (icon gửi) · ghi chú "No spam. Unsubscribe anytime."
6. Dải "Have a password?" (gạch trắng 12%).
7. `<details>`: summary dạng nút secondary full width "Enter Using Password" (icon khoá + chevron) → label "Password" · input `type="password"` + nút mắt 44 "Show password" (12 #665D) · nút primary full "Enter Store".
8. Thẻ ảnh `efx-slide-1` (setting), bo 16, `alt=""` (trang trí).
9. Chân 14 muted-on-dark, link trắng gạch chân.

## 3. Settings merchant (block `password-hero`)

| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Eyebrow | text | Opening Soon | trống thì ẩn |
| Heading | inline_richtext | Level Up `<em>`Your Fitness`</em>` | `<em>` hiện màu accent; trống dùng locale `password.title` |
| Image | image_picker | trống → thẻ nền trắng 6% (mobile ẩn) | ảnh ngang ≥ 1440 |
| Show newsletter | checkbox | true | tắt thì form mật khẩu mở sẵn, bỏ dải "Have a password?" |

Nền dùng `background_dark_color` có sẵn (không thêm setting màu). Copy heading lấy Figma 1:422. ĐỀ XUẤT setting: 02 §5 (fallback khi thiếu nội dung), 15 §1 (newsletter không popup).
Locale mới: `password.eyebrow`, `password.newsletter_label`, `password.notify`, `password.newsletter_note`, `password.newsletter_success`, `password.have_password`, `password.enter_using`, `password.show_password`, `password.hide_password`, `password.enter_store`, `password.error`, `password.owner`, `password.owner_link`.

## 4. Bố cục theo mốc

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Lề | 20 | 20 | 20 | 60 (dải 1798, Figma 1:361) |
| Thanh | 80, logo 100 × 30 | như 360 | logo thẳng mép cột nội dung (lề + 60) | như 1280 |
| Lưới | 1 cột: thanh → nội dung → ảnh → chân | 1 cột | 2 cột 1:1, gap 32; ảnh hàng 2–3 cột phải | như 1280 |
| Cột nội dung | 320 | 728 (nội dung ≤ 520) | padding trái 60, nội dung ≤ 520, căn giữa dọc | như 1280 |
| h1 | 48 | 70 | 80 (display × 0.8) | 80 |
| Newsletter | input và nút xếp dọc, nút full | input + nút liền | liền | liền |
| Ảnh | 4/3, bo 16 | 16/9, bo 16 | cao 100dvh − 80 − 20, cover, bo 16 | như 1280 |
| Chân | dưới ảnh, xuống dòng | dưới ảnh | dưới cột nội dung | như 1280 |

Màn đầu 360 thấy logo, eyebrow, h1, message, ô email, nút Notify Me.

## 5. Trạng thái

| Trạng thái | Hiện thế nào | Nguồn |
| --- | --- | --- |
| Mật khẩu sai (S1) | trang tải lại với `form.errors`: `<details open>`, ô viền sale 2px, câu lỗi trắng + icon đỏ "That password is incorrect. Check the spelling and try again.", focus vào ô | 05 §4, foundation §4 lỗi trên nền tối |
| Hiện mật khẩu | nút mắt `aria-pressed`, đổi nhãn "Hide password"; icon muted-on-dark, hover trắng; JS (BE), không JS thì ẩn nút | 12 #665D |
| Email sai (S2) | inline khi rời ô / submit: "Enter an email like name@example.com." chữ trắng + icon đỏ | foundation §4 |
| Đăng ký thành công (S3) | `form.posted_successfully?`: hộp success "You're on the list" thay form (viền trắng 12%, thanh badge-new, chữ trắng) | foundation §12 |
| Email đã đăng ký | Shopify trả lỗi: dùng hộp success như S3 | ĐỀ XUẤT, 05 §4.5 ngôn ngữ thân thiện |
| Đang gửi (S4) | nút `aria-busy` + spinner | foundation §6 |
| Rỗng (S5) | không logo → shop.name chữ; không message → bỏ đoạn; không ảnh → thẻ trắng 6% (mobile ẩn) | AGENTS empty state, DESIGN Images |
| Ô nhập hover / focus | viền trắng / outline trắng 2px | foundation §4 |
| Summary hover / focus / mở | nền trắng chữ dark / outline trắng / chevron xoay 180° (250ms) | foundation §6, §19 |

## 6. Accessibility

- Tương phản (dark #1A1A1A, foundation §2): h1 trắng 17.4; phần nhấn accent/dark 3.48 (chữ lớn 80/48 px, ≥ 3, sổ 09/11); eyebrow, message, ghi chú, chân muted-on-dark 6.11; label, link chân trắng 17.4; nút primary 5.01; viền ô muted-on-dark 6.11; icon mắt 6.11; chữ lỗi trắng 17.4 (không dùng đỏ cho chữ: 2.73).
- `<main>` duy nhất, 1 h1; logo `<img alt="{{ shop.name }}">`.
- Label thật cho email và password; `autocomplete="email"`, `autocomplete="current-password"`; không chặn dán.
- Summary là control có tên "Enter Using Password", cao 48/52.
- Ảnh trang trí `alt=""`.
- Vùng chạm: nút 48/52, nút mắt 44, link chân 44.
- Focus trên nền tối: outline trắng 2px (accent trên dark 3.48 kém rõ, foundation §3.2).

## 7. Token dùng

`--color-background-dark|background-dark-foreground|muted-on-dark|accent|accent-foreground|sale|badge-new`, `--font-size-display|base|lg|sm`, `--font-heading--weight-display`, `--space-*`, `--radius-input|button|card` (bo 16 = `--radius-card` + `--space-1`), `--control-height`, `--page-margin`, `--header-height`, `--motion-base`. Asset `noise-dark.png` có sẵn. Không token mới.

## 8. Lighthouse

- LCP: desktop 1280/1920 = ảnh thẻ phải: `loading="eager"`, `fetchpriority="high"`, `sizes="(min-width: 64rem) 50vw, 100vw"`, srcset 720/1080/1440, ≤ 200 KB WebP (DESIGN Images). Mobile 360/768 = h1 (ảnh dưới màn đầu); ảnh vẫn eager nhưng không `fetchpriority` dưới 64rem (ĐỀ XUẤT: `<picture>` không cần, chỉ đổi `sizes`).
- Ảnh lazy: không có ảnh nào khác. Noise là `background-image` nhỏ, không chặn LCP. Logo có width/height.
- Font: Sofia Sans Condensed 800 (h1, eyebrow), Inter 400/500/600.
- A11y: label, button-name (mắt), color-contrast (đã tính §6), heading-order (1 h1, không h2), target-size.
- SEO: ngoài phạm vi SEO 100 (sổ 10/11, Shopify trả HTTP 401). Vẫn có title "Opening Soon – Efitco", meta description qua `meta-tags`.
- Best Practices: 0 lỗi console; layout password không tải JS theme ngoài nút mắt (≤ 1 KB, BE).
- Performance: critical.css + base.css như hiện có; không header/footer nên trang nhẹ.

## 9. Quyết định CTO cần chốt

1. Trang password có form newsletter làm hành động chính và form mật khẩu thu trong `<details>` "Enter Using Password" (mở sẵn khi sai mật khẩu; setting tắt newsletter)? Đề xuất: có; khách ghé lúc store khoá chỉ làm được việc để lại email, `<details>` chạy không JS, không popup.
2. Trang password dùng nền tối + noise toàn trang (như dải đầu trang chủ 1:360), ảnh là thẻ bo 16 dưới thanh 80? Đề xuất: có; trang không có header theme, nền tối giữ nhận diện như trang chủ.
