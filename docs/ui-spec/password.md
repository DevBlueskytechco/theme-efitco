KHÔNG CHẮC: demo-data không có `shop.password_message` (hỏi BA ES1-T268); mockup dùng câu phụ hero Figma 1:422 làm mẫu. Newsletter trên trang password là ĐỀ XUẤT, SRS chỉ nêu form mật khẩu (câu CTO 1).

# UI spec: Password (ES1-T258)

Mục đích: khi store khoá, khách thấy thương hiệu, biết store sắp mở và để lại email; người có mật khẩu (merchant, reviewer) vào store trong 2 thao tác. Story TE-9 AC2 (logo/shop.name, password_message, form).

Figma: không có. Ngôn ngữ: hero 1:422 (eyebrow cam, display uppercase, phần nhấn cam theo quyết định 09/11), footer newsletter 1:1104 (input + nút liền, ghi chú "No spam. Unsubscribe anytime."). Thành phần foundation §6, §12.

Mockup: `drafts/designer/ES1-T258/password.html` + `password-360|768|1280|1920.png`. Cuối file: S1 mật khẩu sai, S2 email sai, S3 đăng ký thành công, S4 đang gửi, S5 rỗng.

## 1. Template, layout

`layout/password.liquid` (đã có: `<main>` + `content_for_layout`, không header/footer) giữ nguyên. `templates/password.liquid` → container → block mới `password-hero`:
- Cột nội dung: logo · eyebrow · h1 · `shop.password_message` · form newsletter (`{% form 'customer' %}`, `contact[tags]` = `newsletter,password-page`) · dải "Have a password?" · `<details>` "Enter Using Password" chứa `{% form 'storefront_password' %}`.
- Ảnh (cột phải desktop, sau nội dung trên mobile).
- Chân: "Are you the store owner? Log in here" (`/admin`) · "Powered by Shopify" (`powered_by_link`).

Form mật khẩu trong `<details>`: chạy không JS, không popup; mở sẵn khi `form.errors` (Liquid in `open`). Không dùng dialog: 15 §2 #11 không chốt kiểu cho page password (cột kết luận "–"), `<details>` ít bước và 0 JS.

## 2. Anatomy

1. Logo: `settings.logo` (ảnh, alt = shop.name) hoặc shop.name chữ heading 700 28; không là link (mọi URL đều về trang này).
2. Eyebrow "Opening Soon" (accent).
3. h1 display uppercase "Level Up Your Fitness", phần nhấn "Your Fitness" màu accent (chữ lớn, 5.01).
4. `shop.password_message` muted (merchant sửa ở Admin > Preferences).
5. Newsletter: label "Email" (hiện) · input placeholder "name@example.com" · nút primary "Notify Me" (icon gửi) · ghi chú "No spam. Unsubscribe anytime."
6. Dải phân cách chữ "Have a password?".
7. `<details>`: summary dạng nút secondary full width "Enter Using Password" (icon khoá + chevron) → label "Password" · input `type="password"` + nút mắt 44 "Show password" (12 #665D) · nút primary full "Enter Store".
8. Ảnh `efx-slide-1` (setting), `alt=""` (trang trí).
9. Chân 14 muted, link foreground gạch chân.

## 3. Settings merchant (block `password-hero`)

| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Eyebrow | text | Opening Soon | trống thì ẩn |
| Heading | inline_richtext | Level Up `<em>`Your Fitness`</em>` | `<em>` hiện màu accent; trống dùng locale `password.title` |
| Image | image_picker | trống → nền `--color-background-dark` | ảnh ngang ≥ 1440 |
| Show newsletter | checkbox | true | tắt thì form mật khẩu mở sẵn, bỏ dải "Have a password?" |

Copy heading lấy Figma 1:422. ĐỀ XUẤT setting: 02 §5 (fallback khi thiếu nội dung), 15 §1 (newsletter không popup).
Locale mới: `password.eyebrow`, `password.newsletter_label`, `password.notify`, `password.newsletter_note`, `password.newsletter_success`, `password.have_password`, `password.enter_using`, `password.show_password`, `password.hide_password`, `password.enter_store`, `password.error`, `password.owner`, `password.owner_link`.

## 4. Bố cục theo mốc

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Lưới | 1 cột: nội dung → ảnh → chân | 1 cột, padding ngang 24 | 2 cột 1:1, gap 32; ảnh cao 100dvh − 40, bo 12 | như 1280 |
| Cột nội dung | 320 | 680 (nội dung ≤ 520) | padding 60, nội dung ≤ 520, căn giữa dọc | như 1280 |
| h1 | 48 | 70 | 80 (display × 0.8) | 80 |
| Newsletter | input và nút xếp dọc, nút full | input + nút liền | liền | liền |
| Ảnh | 4/3, bo 12 | 16/9 | cao theo màn, cover | như 1280 |
| Chân | dưới ảnh, xuống dòng | dưới ảnh | dưới cột nội dung | như 1280 |

Màn đầu 360 thấy logo, eyebrow, h1, message, ô email, nút Notify Me.

## 5. Trạng thái

| Trạng thái | Hiện thế nào | Nguồn |
| --- | --- | --- |
| Mật khẩu sai (S1) | trang tải lại với `form.errors`: `<details open>`, ô viền sale, lỗi dưới ô "That password is incorrect. Check the spelling and try again." + icon, focus vào ô | 05 §4, 16 (highlight trường password) |
| Hiện mật khẩu | nút mắt `aria-pressed`, đổi nhãn "Hide password"; JS (BE), không JS thì ẩn nút | 12 #665D |
| Email sai (S2) | inline khi rời ô / submit: "Enter an email like name@example.com." | foundation §12 |
| Đăng ký thành công (S3) | `form.posted_successfully?`: hộp success "You're on the list" thay form | foundation §12 |
| Email đã đăng ký | Shopify trả lỗi: dùng hộp success như S3 (không báo lỗi cho email đã có) | ĐỀ XUẤT, 05 §4.5 ngôn ngữ thân thiện |
| Đang gửi (S4) | nút `aria-busy` + spinner | foundation §6 |
| Rỗng (S5) | không logo → shop.name chữ; không message → bỏ đoạn; không ảnh → nền dark | AGENTS empty state, DESIGN Images |
| Summary hover / focus / mở | như nút secondary; chevron xoay 180° (250ms) | foundation §6, §19 |

## 6. Accessibility

- Tương phản: h1 foreground 17.4, phần nhấn accent 5.01 (chữ lớn chỉ cần 3); message, chân muted 8.45; nút primary 5.01; viền ô muted-light 5.33; lỗi sale 6.38; icon mắt muted 8.45.
- `<main>` duy nhất, 1 h1; logo `<img alt="{{ shop.name }}">`.
- Label thật cho email và password; `autocomplete="email"`, `autocomplete="current-password"`; không chặn dán.
- Summary là control có tên "Enter Using Password", cao 48/52.
- Ảnh trang trí `alt=""`.
- Vùng chạm: nút 48/52, nút mắt 44, link chân 44.

## 7. Token dùng

`--color-background|foreground|muted|muted-light|border|accent|sale|badge-new|background-dark`, `--font-size-display|base|lg|sm`, `--font-heading--weight-display`, `--space-*`, `--radius-input|button|hero`, `--control-height`, `--page-margin`, `--motion-base`. Không token mới.

## 8. Lighthouse

- LCP: desktop 1280/1920 = ảnh cột phải: `loading="eager"`, `fetchpriority="high"`, `sizes="(min-width: 64rem) 50vw, 100vw"`, srcset 720/1080/1440, ≤ 200 KB WebP (DESIGN Images). Mobile 360/768 = h1 (ảnh nằm dưới màn đầu, không phải LCP).
- Ảnh lazy: không có ảnh nào khác. Logo có width/height.
- Font: Sofia Sans Condensed 800 (h1, eyebrow), Inter 400/500/600.
- A11y: label, button-name (mắt), color-contrast, heading-order (1 h1, không h2), target-size.
- SEO: Shopify trả HTTP 401 cho trang password → audit `http-status-code` trượt, SEO < 100 (câu CTO 1 ở `docs/ui-spec/404.md`). Title "Opening Soon – Efitco", meta description có sẵn qua `meta-tags`.
- Best Practices: 0 lỗi console; layout password không tải JS theme ngoài nút mắt (≤ 1 KB, BE).
- Performance: critical.css + base.css như hiện có; không header/footer nên trang nhẹ.

## 9. Quyết định CTO cần chốt

1. Trang password có form newsletter làm hành động chính và form mật khẩu thu trong `<details>` "Enter Using Password" (mở sẵn khi sai mật khẩu; setting tắt newsletter)? Đề xuất: có; khách ghé lúc store khoá chỉ làm được việc để lại email, form `<details>` chạy không JS, không popup.
