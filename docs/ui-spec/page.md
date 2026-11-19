KHÔNG CHẮC: demo-data không có pages, shop.email, shop policies (hỏi BA ở ES1-T268). Copy mẫu lấy từ Figma 1:992, 1:1057, 1:1104 và locale `blocks.faq_item.*`; nội dung thật do merchant soạn trong Pages.

# UI spec: Page nội dung và Contact (ES1-T258, vòng 3)

## Thay đổi so với vòng 2

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header | Header A nền trắng, viền dưới | thanh tối `--color-background-dark` + noise, cao 80, không đè nội dung; logo 100 × 30; menu trắng 60%, "Contact" `aria-current` trắng 100% + gạch chân 2px; search 20, account/cart 24 | Sổ 10/11, Figma 1:362, 1:377, foundation §3 |
| 2 | Footer | newsletter 2 cột, 3 social, wordmark tách hàng | footer Figma 1:1104: ảnh 98 × 123 + 2 thẻ sau, panel dải rộng bo 16 nền +2% trắng, 4 social (TikTok, Instagram, YouTube, Facebook) tên "Efitco on …", wordmark giữa hàng cuối với copyright và cờ + USD / EN + 5 icon thanh toán | Figma 1:1104–1:1192, foundation §4 |
| 3 | Aside Contact | bo 24 (`--radius-dialog`) | bo 16 (`--radius-card` + 4) như thẻ Figma 1:361, 1:1022, 1:1106 | Figma |
| 4 | Câu hỏi accordion aside | 16 mọi mốc | 18/600 từ 1280 như Figma 1:1057; 16 dưới 1280 | Figma 1:1057 |
| 5 | Breadcrumb, form, RTE, trạng thái S1–S6 | — | giữ nguyên; breadcrumb nằm trên nền trắng ngay dưới thanh tối | foundation §5 |

Mục đích: người mua đọc trang nội dung (Our Story, FAQs, chính sách) dễ đọc trên mọi màn; trên Contact Us gửi được câu hỏi trong 1 form 3 trường, và thấy câu trả lời nhanh trước khi viết. Story TE-9 AC2 (page.contact: form name/email/message có validation và thông báo), AC5 (link chính sách từ `shop.policies`).

Figma: không có (chỉ trang chủ 1:359). Ngôn ngữ lấy từ header 1:362, accordion FAQ 1:1057, footer 1:1104. Thành phần theo `docs/ui-spec/foundation.md` (ES1-T251) và `drafts/designer/_kit/kit.css`.

Mockup: `drafts/designer/ES1-T258/page.html` + `page-360|768|1280|1920.png`. Phần chính là Contact Us; cuối file: S1 page mặc định (Our Story, đủ phần tử RTE), S2 form lỗi, S3 đang gửi, S4 gửi thành công, S5 page rỗng, S6 gửi thất bại.

## 1. Template, block

| Template | Hiện có | Đề xuất |
| --- | --- | --- |
| `templates/page.liquid` | container → `<h1>` + `page.content` | container → snippet `breadcrumb` → `.page-title` (h1) → `<div class="rte">page.content</div>`; cột đọc căn giữa |
| `templates/page.contact.liquid` | chưa có | ĐỀ XUẤT (AGENTS.md "Add a page type": Liquid template, không JSON): container → breadcrumb → h1 → lưới `contact`: cột chính (`.rte` + block `contact-form`) và `<aside>` (5 block `faq-item` + link chính sách) |

Merchant gán template "contact" cho page Contact Us trong Admin. Không thêm JSON template.

## 2. Anatomy

Page mặc định (S1):
1. Header (foundation §3 vòng 3: thanh tối + noise, cao 80, không đè nội dung). Menu "Our Story" có `aria-current="page"` khi đúng trang (trắng 100% + gạch chân 2px).
2. Breadcrumb: Home / {page.title} (foundation §5).
3. Tiêu đề: h1 `--font-size-h1`.
4. RTE `.rte`: đoạn, h2–h4, link, danh sách, trích dẫn, ảnh + chú thích, bảng, đường kẻ.
5. Footer (foundation §4, Figma 1:1104).

Contact (phần chính mockup):
1. Header tối (menu "Contact" `aria-current`), breadcrumb Home / Contact Us, h1 "Contact Us".
2. `.rte` intro (page.content).
3. Form `contact-form`: h2 "Send Us A Message" + ghi chú "* Required fields" · Name* · Email* · Message* + gợi ý "Add your order number if your message is about an order." · câu quyền riêng tư có link Privacy policy (`shop.policies`) · nút primary "Send Message" (icon gửi).
4. Aside: eyebrow "Questions and Answers" (Figma 1:1057) · h2 "Quick Answers Before You Write" · accordion 5 câu (locale `faq_item`, câu đầu mở) · link "Shipping policy", "Refund policy" (`shop.policies`).

Trường đúng SRS TE-9 AC2 (name, email, message); không thêm phone, subject.

## 3. Settings merchant

| Block | Tên (sentence case) | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- | --- |
| `contact-form` | Heading | text | Send Us A Message | trống thì ẩn h2 |
| `contact-form` | Show privacy note | checkbox | true | link lấy `shop.policies` privacy; không có policy thì ẩn câu |
| `faq-item` (đã có) | Question, Answer | text, richtext | locale `faq_item` | 0 item thì ẩn cả aside |

ĐỀ XUẤT: 2 setting `contact-form` (nguồn 04 §5 form, 06 §5; TE-9 AC5). Page mặc định không thêm setting.

## 4. Bố cục theo mốc

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Page: cột đọc | 320 (full) | 720 căn giữa | 720 căn giữa | 720 căn giữa |
| Page: đoạn văn | 16/27 (lh 1.7), ≤ 65ch | như 360 | như 360 | như 360 |
| Contact: lưới | 1 cột: intro → form → aside | 1 cột | 12 cột: form 1–7, aside 9–12 sticky (top 80+24) | như 1280, nội dung 1416 |
| Form trường | 1 cột, gap 24 | Name + Email 2 cột, Message cả hàng | như 768 | như 768 |
| Nút Send Message | full width, cao 48 | auto, min 200, căn trái | cao 52 | cao 52 |
| Aside | padding 32/24, bo 16, nền alt, câu hỏi 16 | padding 32 | padding 40, câu hỏi 18/600 | như 1280 |
| Breadcrumb → h1 → nội dung | 16 / 48 | 16 / 48 | 24 / 64 | 24 / 64 |
| Contact → footer | 48 | 48 | 120 | 120 |

Thứ tự DOM = thứ tự nhìn ở mọi mốc (intro → form → aside), focus không nhảy cột (06 §2).
ĐỀ XUẤT cột đọc 720 căn giữa cho page mặc định: dòng 50–75 ký tự (03 §4, foundation §1 `65ch`); 1416 mép trái sẽ để trống 2/3 màn 1920. Xem câu hỏi CTO 2.

## 5. RTE (`.rte`)

THAY (11/11, Shopify §8): dùng `.rte` chung foundation §28 (cũng cho mô tả sản phẩm, collection, bài viết).

ĐỀ XUẤT (foundation §1, 03 §4, 06 §7.3); toàn bộ đọc token:
- Đoạn 16, lh 1.7, `max-width: 65ch`; khoảng giữa khối 16.
- h2 `--font-size-h2`, h3 `--font-size-h3` (heading 700); h4 Inter 600 18. Khoảng trên heading 48, dưới 12.
- Link: gạch chân 1px offset 0.2em, 500; hover accent (5.01) — bắt buộc gạch chân vì Lighthouse `link-in-text-block`.
- ul/ol thụt 24, gap 8, marker `--color-muted`.
- Trích dẫn: nền sand, viền trái 4px foreground, bo phải 12, chữ heading 700 h3; nguồn 14/500 muted (6.81 trên sand).
- Ảnh: full cột, bo `--radius-card`, chú thích 14 muted; khoảng trên/dưới 32.
- Bảng: bọc `.table-wrap` cuộn ngang riêng (zoom 200% không tràn trang), viền border bo 12, th nền alt 600, ô padding 12/16, chữ 14, `min-width: 30rem`.
- `hr`: 1px border, cách 48.
Dev FE: bọc `<table>` bằng filter/regex không được trong Liquid an toàn → dùng `.rte table { display: block; overflow-x: auto; }` thay wrapper (ĐỀ XUẤT).

## 6. Trạng thái

| Trạng thái | Hiện thế nào | Nguồn |
| --- | --- | --- |
| Input default / hover / focus / disabled | foundation §12 (viền muted-light 5.33; hover foreground; focus viền + outline accent) | quyết định CTO 09/11 viền ô nhập |
| Lỗi trường (S2) | hiện khi rời trường và khi submit: viền sale 2px + icon ! + câu cách sửa ("Enter your name.", "Enter an email like name@example.com.", "Enter a message.") 14/500; `aria-invalid`, `aria-describedby` | 05 §4, foundation §12 |
| Lỗi submit (S2) | hộp tóm tắt `role="alert"` đầu form "Check 2 fields" + link nhảy tới từng trường; focus vào hộp | 05 §4.3, foundation §12 |
| Đang gửi (S3) | nút `aria-busy`, spinner, giữ bề rộng; trường `readonly`; status ẩn "Sending your message…" | foundation §6 loading |
| Thành công (S4) | `form.posted_successfully?`: hộp success (viền trái badge-new + icon check) "Thanks for contacting us" thay form, focus vào hộp, nút secondary "Continue Shopping" | 05 §6, foundation §12 |
| Gửi thất bại (S6) | `form.errors` chung (spam challenge thất bại, lỗi mạng): `.alert` "Your message wasn't sent" + cách xử lý; giữ dữ liệu đã nhập | 05 §5 không mất dữ liệu |
| Rỗng (S5) | `page.content` trống: chỉ h1 (+ form ở contact), không khung RTE rỗng; `request.design_mode` hiện gợi ý "This page has no content yet…" cho merchant | AGENTS empty state |
| Loading trang | không có (render server) | — |
| Accordion | foundation §13: + cam bên trái, câu đầu mở, cho mở nhiều; chạy không JS (`<details>`) | Figma 1:1057 |
| Hover link aside | chữ accent + gạch chân giữ nguyên | foundation §6 text link |

Không JS: form submit thường (Shopify tải lại trang), lỗi do server trả; validation inline là JS tăng cường (BE).
Spam: Shopify có thể chuyển sang trang hCaptcha `/challenge` sau submit; không thuộc theme.

## 7. Accessibility

- Tương phản (tính tay WCAG, foundation §2): chữ foreground/background 17.4; muted/background 8.45 (gợi ý, ghi chú); muted/alt 7.68 (L 0.0743 / 0.905); accent eyebrow/alt 4.55; label lỗi sale/background 6.38; nút accent 5.01; viền ô muted-light 5.33 (≥ 3, WCAG 1.4.11).
- Mọi trường `<label for>`; `autocomplete` name, email; `type="email"`, `spellcheck="false"`; `required` + `aria-required`; dấu * `aria-hidden` và có câu "* Required fields".
- Không dùng placeholder thay label (04 §5); không chặn dán.
- Một h1; RTE bắt đầu từ h2. Aside là `<aside aria-labelledby>`.
- Vùng chạm: input 48/52, nút 48/52, summary accordion ≥ 56, link aside 44, breadcrumb 44.
- Focus: outline 2px accent offset 2 mọi control.
- Lỗi không chỉ bằng màu: icon + chữ (01, 06).

## 8. Token dùng

`--color-background|foreground|muted|muted-light|border|background-alt|background-sand|accent|sale|badge-new`, `--font-heading--*`, `--font-primary--family`, `--font-size-sm|base|lg|h1|h2|h3`, `--space-1..8`, `--radius-input|button|card` (bo 16 = `--radius-card` + `--space-1`), `--color-background-dark(-foreground)`, `--color-muted-on-dark` (header, footer), `--control-height`, `--section-gap`, `--grid-gap`, `--header-height`, `--motion-accordion`. Không token mới.

## 9. Lighthouse

- LCP: Contact = h1 "Contact Us" (không ảnh trên màn đầu). Page mặc định = h1 hoặc ảnh đầu tiên trong RTE nếu nằm trên màn đầu.
- Header tối: noise là `background-image` nhỏ có sẵn (`assets/noise-dark.png`) trong critical.css, không phải ảnh LCP; ảnh footer 98 × 123 lazy.
- SEO: page nằm trong phạm vi SEO 100 (sổ 10/11).
- Ảnh lazy: mọi ảnh trong RTE. Liquid: `page.content | replace: '<img ', '<img loading="lazy" decoding="async" '` (ĐỀ XUẤT; ảnh RTE Shopify không có width/height → rủi ro CLS, CSS `height: auto` + bo góc giữ tỉ lệ khi ảnh đã tải).
- Font: 2 họ qua font_picker (Sofia Sans Condensed 700/800, Inter 400/500/600); preload 1 font body.
- Rủi ro A11y và cách tránh: `link-in-text-block` → link RTE gạch chân; `heading-order` → merchant gõ h1 trong nội dung: CSS không sửa được, thêm hướng dẫn trong gợi ý editor; `label` → label thật; `target-size` → control ≥ 44; bảng thiếu `<th>` do merchant → không sửa được, ghi chú QA.
- Rủi ro SEO: `<title>` và meta description từ `page.seo`/`page.title` qua snippet `meta-tags`; link mô tả đích ("Shipping policy", "Contact our team", không "Click here"); breadcrumb JSON-LD.
- Best Practices: 0 lỗi console; hCaptcha chỉ tải ở bước challenge sau submit, không tải lúc vào trang.
- Performance: không JS bắt buộc; CSS `.rte`, `.contact` vào base.css (critical chỉ header, breadcrumb, page-title).

## 10. Quyết định CTO đã chốt (10/11)

CTO chốt cả các câu dưới đây theo đề xuất (docs/design/decisions.md, 10/11).
1. Contact dùng template Liquid `templates/page.contact.liquid` (form 3 trường + aside 5 câu FAQ dùng lại `faq-item`)? Đề xuất: có; giảm câu hỏi lặp (02 §4 mục 11), 0 JS bắt buộc.
2. Page mặc định đặt cột đọc 720 căn giữa (khác quy tắc "thẳng mép trái container" của hero 09/11)? Đề xuất: có; quy tắc mép trái áp cho hero và khối trang chủ, trang đọc dài cần dòng 50–75 ký tự (03 §4).
