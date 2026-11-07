# UI spec: page và page.contact (ES1-T244)

Mockup: `drafts/designer/ES1-T244/page.html`, PNG `page-360/768/1280/1920.png`.
Nguồn: SRS TE-9 AC2, AC5; DESIGN.md; Figma 1:362 header, 1:1104 footer, 1:490 (eyebrow, h1), 1:1057 (text phụ), 1:462 link CTA; `assets/base.css` mục Figma; skill ux-motion.
Figma chỉ có trang chủ (CTO 07/11): mọi bố cục dưới đây là ĐỀ XUẤT cùng ngôn ngữ trang chủ, chờ Designer người duyệt.

## Mục đích
- `page` mặc định: trang nội dung merchant (Our Story, chính sách, hướng dẫn). Hiện `page.title` + `page.content`.
- `page.contact`: trang liên hệ, form `contact` (name, email, message) có validation và thông báo (TE-9 AC2).

## Anatomy
Chung:
1. Header (block `header`, dùng lại). Trang không có hero: nền `background`, chữ nav `muted` lúc nghỉ, `foreground` khi hover/current, current có gạch 2px `accent` dưới chữ. ĐỀ XUẤT.
2. Breadcrumb: Home / `page.title`, 14/22, link `muted-light`, trang hiện tại `foreground`, `aria-current="page"`. ĐỀ XUẤT (Figma không có).
3. Tiêu đề: `h1` heading font 700, `--font-size-h1` (48 tại 1280+), letter-spacing -0.02em, Title Case theo nội dung merchant.
4. Footer (block `footer`, dùng lại nguyên Figma 1:1104).

Kiểu 1, page mặc định:
5. Prose (`page.content`, RTE), cột tối đa 760px, canh trái theo lưới 1416:
   - đoạn đầu (nếu merchant chọn) 18/28 500 `foreground`; đoạn thường 16/26 `muted`;
   - h2 `--font-size-h2` heading 700 `foreground`, cách trên 40; h3 `--font-size-h3`;
   - ảnh: bo `--figma-radius-16`, tỉ lệ theo ảnh (mockup 3/2), caption 14/22 `muted-light`;
   - link gạch chân `foreground`, offset 3px; danh sách thụt `--space-5`;
   - blockquote: viền đầu dòng 4px `accent`, chữ heading 700 `--font-size-h3`.

Kiểu 2, page.contact:
6. Cột giới thiệu: h1, `page.content` (đoạn giới thiệu + danh sách ý có icon do merchant nhập), link CTA "Read FAQs" (kiểu `.button--link` Figma 1:462, 28/34 + mũi tên 20 × 16).
7. Thẻ form: nền `background-cream`, bo `--figma-radius-16`, padding 24 (< 64rem) / 40 (≥ 64rem).
   - h2 "Send Us A Message", ghi chú "Fields marked * are required." 14/22 `muted`.
   - Name * (`contact[name]`, autocomplete name), Email * (`contact[email]`, type email, placeholder `name@example.com`), cùng hàng từ 48rem; Message * (`contact[body]`, textarea cao 160, resize dọc).
   - Label 14/22 600 `foreground`, luôn hiện (không dùng placeholder làm label).
   - Ô nhập: cao 52, padding 13 / 16, viền 1px `muted-light`, bo `--radius-input` 4, chữ 16 (tránh iOS zoom).
   - Nút submit `.button` "Send Message": 100% rộng < 48rem, auto từ 48rem; cao 44 (< 80rem) / 52 (≥ 80rem), bo `--figma-radius-8`.

## Settings merchant
Template không có setting riêng. Block mới đề xuất:

| Block | Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- | --- |
| contact-form | Heading | text | Send Us A Message | ≤ 60 ký tự |
| contact-form | Show phone field | checkbox | false | ĐỀ XUẤT, SRS chỉ có name/email/message |
| contact-form | Background | select: none, cream, alt | cream | màu lấy token, không nhập hex |

Chuỗi cố định (label, lỗi, thông báo) đi qua `locales/en.default.json`, không là setting.

## Layout
| Width | Bố cục |
| --- | --- |
| 360 | margin 20; header 64, nút menu + logo + 3 icon 44 × 44; breadcrumb cách header 24; h1 32; prose 1 cột; contact: giới thiệu trên, thẻ form dưới, cách 32; field xếp dọc; nút 100%; band dưới 48 |
| 768 | như 360; Name + Email cùng hàng (2 cột, gap 24); nút auto |
| 1280 | header 80, nav giữa (gap 40), h1 48; contact 2 cột 560fr / 696fr, gap 160 (từ 64rem: 5 / 7, gap 80); band dưới 120; thẻ form padding 40 |
| 1920 | nội dung 1416 canh giữa (page-width 91rem); prose 760; footer panel cách mép 60 như Figma |

Nhịp: tiêu đề cách breadcrumb 48 (< 64rem) / 60 (≥ 64rem); tiêu đề → nội dung 24 / 32; giữa field 24; band dưới 48 / 120.

## Trạng thái
- Rỗng: `page.content` trống → chỉ breadcrumb + h1, giữ khoảng dưới 48 / 120 (mockup Trạng thái 4).
- Lỗi form (`form.errors`): tóm tắt đầu form (`role="alert"`, `tabindex="-1"`, nhận focus sau reload), nền trắng, viền đầu dòng 4px `sale`, icon `sale`, liệt kê lỗi là link tới field; từng field `aria-invalid="true"`, viền 2px `sale`, thông báo 14/22 500 `sale` + icon, nối `aria-describedby`. Câu lỗi cụ thể: "Enter an email like name@example.com", "Message can't be blank" (Trạng thái 1).
- Kiểm tra khi nhập: ĐỀ XUẤT dùng `:user-invalid` CSS cho viền đỏ, không cần JS; câu lỗi cụ thể chỉ khi server trả về.
- Thành công (`form.posted_successfully?`): banner nền `badge-new` chữ trắng, icon check, "Thanks for contacting us. We'll get back to you as soon as possible." (`role="status"`), form ẩn, nút secondary "Continue Shopping" (Trạng thái 2).
- Loading: form POST thường, không JS. ĐỀ XUẤT: sau submit nút `aria-busy`, spinner `accent-foreground`, chữ "Sending", chặn bấm lặp → cần JS, giao BE (Trạng thái 3).
- Hover: nút accent pha 12% `background-dark`; secondary nền `foreground` 6%; ô nhập viền `foreground`; link CTA gạch chân + mũi tên dịch `--space-1`; nav đổi màu. Transition `--motion-fast` `--ease-out`, active scale 0.98; tắt khi `prefers-reduced-motion`.
- Focus-visible: outline 2px `currentColor`, offset 2 trên mọi phần tử tương tác; ô nhập outline 2px `foreground`.
- Disabled: opacity 0.5, `cursor: not-allowed`.

## Accessibility
Tương phản (WCAG, tính theo độ chói tương đối, (L1 + 0.05) / (L2 + 0.05)):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| #1A1A1A / #FFFFFF | 17.4 | h1, label, chữ thân |
| #1A1A1A / #F5F5F1 | 16.0 | chữ trong thẻ form |
| #4D4D4D / #FFFFFF | 8.45 | đoạn prose, ghi chú |
| #4D4D4D / #F5F5F1 | 7.75 | ghi chú trong thẻ |
| #6B6B6B / #FFFFFF | 5.33 | breadcrumb, caption, placeholder |
| #6B6B6B / #F5F5F1 | 4.88 | placeholder trong thẻ |
| #FFFFFF / #C8400E | 5.01 | nút |
| #BD1616 / #FFFFFF | 6.38 | lỗi field |
| #FFFFFF / #4B824D | 4.57 | banner thành công |
| #999999 / #1A1A1A | 6.11 | chữ phụ footer |
| viền ô #6B6B6B / #FFFFFF | 5.33 | ≥ 3:1 thành phần UI (1.4.11) |

- Vùng chạm: nút, icon header, link footer, social ≥ 44 × 44; link breadcrumb ≥ 24 cao.
- Bàn phím: thứ tự Tab theo DOM; lỗi đưa focus vào tóm tắt; link tóm tắt nhảy tới field.
- Form: label `for`, `autocomplete`, `required`, dấu * kèm câu giải thích.
- Ảnh trong page.content: alt từ Shopify; ảnh trang trí `alt=""`.
- Breadcrumb `nav aria-label="Breadcrumb"` + `ol`.

## Token
`--color-background/foreground/muted/muted-light/border/background-cream/background-dark/background-dark-foreground/muted-on-dark/accent/accent-foreground/sale/badge-new/badge-new-foreground`, `--font-heading--family`, `--font-primary--family`, `--font-size-sm/base/lg/h3/h2/h1/wordmark`, `--space-1…8`, `--radius-input`, `--figma-radius-8/16`, `--radius-pill`, `--motion-fast/base`, `--ease-out`. Không màu mới.

## Map block
| Phần | Hiện có | Cần thêm |
| --- | --- | --- |
| Header, footer | `blocks/header.liquid`, `blocks/footer.liquid` | trạng thái nền trắng khi không có `.slideshow` + gạch current (CSS) |
| Breadcrumb | — | `snippets/breadcrumb.liquid` (FE), dùng cho page, 404 không cần |
| page | `templates/page.liquid` (h1 + content) | bọc prose class `.rte` + CSS prose trong `assets/base.css` |
| page.contact | — | `templates/page.contact.liquid` (Liquid, không JSON) + `blocks/contact-form.liquid` (FE, `{% form 'contact' %}`, `data-testid="contact-form"`) |
| Loading nút submit | — | BE: JS `aria-busy` (tách ticket BE1) |

## Quyết định CTO cần chốt
1. Viền ô nhập trên nền sáng dùng `muted-light` #6B6B6B (5.33:1) thay `border` #E5E5E5 (1.26:1, trượt WCAG 1.4.11)? Đề xuất: dùng #6B6B6B cho mọi input nền sáng, `border` chỉ cho divider/card.
2. Header trang không hero: nền trắng, chữ `muted`, current gạch `accent` 2px? Đề xuất: đồng ý, giữ kiểu overlay trắng-trên-tối chỉ cho trang có slideshow.
3. Form liên hệ chỉ name/email/message như SRS, phone là checkbox mặc định tắt? Đề xuất: đồng ý, không thêm field bắt buộc ngoài SRS.
