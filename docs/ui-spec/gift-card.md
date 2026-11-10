KHÔNG CHẮC: demo-data không có gift card đã phát hành (mã, số dư, hạn, pass_url; hỏi BA ES1-T268). Mockup dùng mã mẫu "7H3K 9QXF 2M8P 4LDW", $50.00 (mệnh giá có trong demo-data `gift-card-2`: $10/$25/$50/$100), hạn December 31, 2027. QR trong mockup là hình minh hoạ; nút Apple Wallet mockup vẽ tạm, theme dùng asset Shopify `gift-card/add-to-apple-wallet.svg`.

# UI spec: Gift card (ES1-T258, vòng 3)

## Thay đổi so với vòng 2

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Thanh trên | nền trắng, viền dưới, logo giữa | thanh tối `--color-background-dark` + noise cao 80 như header 1:362; logo trắng 100 × 30 thẳng mép trái container (link về shop) | Sổ 10/11, Figma 1:362, 1:377 |
| 2 | Thẻ gift card | nền dark trơn, bo 24 | nền dark + noise (như dải 1:360, panel 1:1106), bo 16 | Figma 1:360, 1:361 (bo 16) |
| 3 | Panel | bo 24 | bo 16, cùng hệ thẻ Figma | Figma 1:1022, 1:1106 |
| 4 | Tương phản trên thẻ | tính với #1E1E1E (16.7 / 5.85) | tính lại với #1A1A1A: trắng 17.4, muted-on-dark 6.11 | foundation §2 |
| 5 | Mã, QR, meta, hành động, trạng thái S1–S4, in | — | giữ nguyên; `@media print` bỏ noise (nền trắng) | — |

Mục đích: người nhận mở link gift card thấy ngay số dư, mã để dùng online, QR để dùng tại cửa hàng, hạn dùng; chép mã, thêm vào Apple Wallet, in thẻ. Story TE-9 AC2 (QR ≥ 120px, mã, Apple Wallet, logo); Theme Store yêu cầu demo có gift card (01).

Figma: không có trang này. Ngôn ngữ: thanh tối 1:362, nền dark + noise 1:360, chữ trắng như footer 1:1104, display heading 800, bo 16 như thẻ 1:361 và panel 1:1106. Thành phần foundation §3, §6, §8, §12, §18.

Mockup: `drafts/designer/ES1-T258/gift_card.html` + `gift_card-360|768|1280|1920.png`. Cuối file: S1 đã dùng một phần, S2 hết hạn / bị tắt, S3 đã chép mã, S4 không logo.

## 1. Template

`templates/gift_card.liquid` giữ `{% layout none %}` (AGENTS.md: trang in và chia sẻ ngoài layout). Không gọi được block header/footer theme; tự dựng:
- `<head>`: thêm `<meta name="viewport" content="width=device-width, initial-scale=1">` (bản hiện tại THIẾU, Lighthouse trượt viewport), `<meta name="robots" content="noindex">`, `css-variables`, critical.css, base.css, `meta-tags`, `content_for_header`; script QR `{{ 'vendor/qrcode.js' | shopify_asset_url | script_tag }}` defer (BE).
- `<body class="template-gift-card">`: thanh logo · `<main>`.

## 2. Anatomy

1. Thanh trên 80: nền `--color-background-dark` + noise; logo trắng 100 × 30 thẳng mép trái container (`settings.logo` hoặc shop.name), link về `shop.url`, `aria-label="Efitco home"`, ô bấm 44. Không menu (trang ngoài layout).
2. Intro căn giữa: eyebrow "Gift card" · h1 "Your Efitco Gift Card" (`shop.name`) · "Use this gift card at checkout." (locale `gift_card.use_at_checkout`).
3. Thẻ (chỉ CSS, không ảnh): tỉ lệ 1.586 (thẻ ngân hàng), nền `--color-background-dark` + noise, bo 16, vòng trang trí trắng 6% góc trên · logo trắng + nhãn pill "Gift card" · "Balance" 14 muted-on-dark · số dư `gift_card.balance | money` heading 800 40–64 · nếu balance < initial_value: "of $50.00 initial value".
4. Panel trắng bo 16:
   - "Gift card code" · mã `gift_card.code | format_code` 18/600 giãn chữ 0.08em trong ô viền đứt muted-light nền alt, `user-select: all` · nút secondary "Copy Code" (JS, BE).
   - QR 144 × 144 (≥ 120 theo SRS) viền border, nền trắng; tên "QR code, scan to redeem gift card"; chú thích "Pay in store" + "Show this QR code at the counter, or enter the code at online checkout."
   - Bảng meta: Initial value · Expires (`gift_card.expires_on | date: '%B %e, %Y'`; không có hạn thì bỏ dòng).
   - Hành động: Apple Wallet (asset Shopify, cao ≥ 44, chỉ khi `gift_card.pass_url`) · primary "Start Shopping" (`shop.url`) · secondary "Print Gift Card" (`window.print()`, BE).

## 3. Settings merchant

Không setting mới (template `layout none`, không block). Dùng `settings.logo` đã có. ĐỀ XUẤT locale mới: `gift_card.title` ("Your {{ shop }} Gift Card"), `gift_card.balance`, `gift_card.initial_value`, `gift_card.of_initial` ("of {{ value }} initial value"), `gift_card.code_label`, `gift_card.copy`, `gift_card.copied`, `gift_card.qr_alt`, `gift_card.qr_title`, `gift_card.qr_text`, `gift_card.expires_label`, `gift_card.start_shopping`, `gift_card.print`, `gift_card.disabled`, `gift_card.expired_text`, `gift_card.contact`.

## 4. Bố cục theo mốc

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Thanh trên | 80, logo 100 × 30 trái, lề 20 | như 360 | như 360 | logo tại x 252 (container 1416) |
| Nền trang | alt | alt | alt | alt |
| Khối | 1 cột 320: intro → thẻ → panel | 1 cột ≤ 560 giữa | 2 cột 1:1 rộng ≤ 1080 giữa: thẻ trái (sticky), panel phải | như 1280 |
| Thẻ padding | 24 | 32 | 32 | 32 |
| Panel padding | 24 | 32 | 40 | 40 |
| Mã + Copy | xếp dọc, nút full | xếp dọc, nút auto trái | như 768 | như 768 |
| QR + chú thích | 2 cột (144 + chữ) | như 360 | như 360 | như 360 |
| Hành động | dọc, full width: Wallet → Start Shopping → Print | Wallet hàng riêng; Start + Print 2 cột | như 768 | như 768 |
| Khoảng trên / dưới main | 48 / 48 | 48 / 48 | 48 / 120 | 48 / 120 |

## 5. Trạng thái

| Trạng thái | Hiện thế nào | Nguồn |
| --- | --- | --- |
| Đã dùng một phần (S1) | số dư + dòng "of $50.00 initial value" | Dawn/Shopify gift card mặc định |
| Hết hạn (S2) | `gift_card.expired`: thẻ xám (`filter: grayscale`), số dư gạch, nhãn pill "Expired"; `.alert` "This gift card has expired" + ngày hết hạn + cách xử lý; ẩn QR, Wallet, Copy; nút secondary "Contact Us"; vẫn hiện mã | 05 §4, 01 (không chỉ màu) |
| Bị tắt | `gift_card.enabled == false`: như S2, tiêu đề "This gift card is no longer active" (code hiện gộp chung chuỗi expired, cần tách) | ĐỀ XUẤT 05 §4.1 lỗi cụ thể |
| Đã chép (S3) | nhãn nút "Copied" + icon check 2s, `role="status"` "Gift card code copied" | 05 §6 phản hồi |
| Không JS | ẩn nút Copy, Print; QR không vẽ → giữ khung 144 với chữ "Enter the code at checkout" (không khung trống) | AGENTS progressive enhancement |
| Không logo (S4) | shop.name chữ heading 700 trên thẻ và thanh trên | DESIGN Images |
| Không pass_url | bỏ nút Wallet | |
| In | `@media print`: ẩn nút, thẻ viền đen nền trắng, chữ đen, giữ mã + QR | AGENTS (trang in) |
| Nút hover / focus | foundation §6 | |

## 6. Accessibility

- Tương phản (dark #1A1A1A): số dư trắng/dark 17.4; "Balance", "of … initial value" muted-on-dark/dark 6.11; nhãn pill trắng/dark 17.4; focus trên thanh tối outline trắng (viền 40% trang trí); mã foreground/alt 15.8; viền ô mã muted-light/alt 4.85; chú thích QR muted 8.45; nút primary 5.01; Wallet là asset Apple (trắng/đen).
- Một h1; "Balance" và số dư trong cùng `<p>` để đọc liền.
- Mã: `aria-labelledby` nhãn "Gift card code"; screen reader đọc từng ký tự nhờ khoảng trắng của `format_code`.
- QR: `<img>`/`<canvas>` có tên "QR code, scan to redeem gift card".
- Vùng chạm: nút 48/52, Wallet ≥ 44, logo link 44.
- Hết hạn báo bằng chữ + icon, không chỉ xám.

## 7. Token dùng

`--color-background|foreground|muted|muted-light|border|background-alt|background-dark|background-dark-foreground|muted-on-dark|accent|sale`, `--font-heading--weight-display`, `--font-size-xs|sm|base|lg|h1`, `--space-*`, `--radius-input|button|pill|card` (bo 16 = `--radius-card` + `--space-1`), `--header-height`, `--control-height`, `--section-gap`. Asset `noise-dark.png` có sẵn. Không token mới.

## 8. Lighthouse

- LCP: số dư trên thẻ (chữ) hoặc h1; không ảnh lớn (thẻ là CSS). Logo là ảnh nhỏ duy nhất, eager, có width/height.
- Ảnh lazy: không có (Wallet SVG nhỏ, có width/height 200 × 60 hiển thị cao 44–48).
- Font: Sofia Sans Condensed 700/800, Inter 400/600.
- A11y: `meta-viewport` (phải thêm), `html lang` (đã có), color-contrast, button-name (Copy, Print có chữ), image-alt (QR, logo, Wallet).
- SEO: ngoài phạm vi SEO 100 (sổ 10/11; trang riêng tư `noindex`). Vẫn có `<title>`, meta description qua `meta-tags`.
- Noise thanh trên và thẻ là `background-image` nhỏ có sẵn, không chặn LCP; không in (print nền trắng).
- Best Practices: 0 lỗi console khi `vendor/qrcode.js` lỗi mạng (bọc kiểm tra `window.QRCode`); ảnh Wallet đúng tỉ lệ.
- Performance: JS chỉ QR (Shopify CDN, defer) + copy/print (≤ 1 KB); 0 ảnh lớn.

## 9. Quyết định CTO cần chốt

1. Thẻ gift card dựng bằng CSS (nền dark, logo, số dư) thay ảnh `gift-card/card.svg` của Shopify khi chưa có logo, và thêm nút Copy Code + Print Gift Card (2 ticket con BE nhỏ)? Đề xuất: có; 0 ảnh lớn, in được, đúng ngôn ngữ nền tối Figma 1:360 và footer 1:1104.
