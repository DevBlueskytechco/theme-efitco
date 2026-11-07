# UI spec: gift_card (ES1-T244)

Mockup: `drafts/designer/ES1-T244/gift_card.html`, PNG `gift_card-360/768/1280/1920.png`.
Nguồn: SRS TE-9 AC2 (QR ≥ 120px, mã, Apple Wallet, logo); `templates/gift_card.liquid` hiện có; DESIGN.md; Figma 1:1104 (nền tối noise, wordmark), 1:490 (badge pill). Figma không có trang gift card: bố cục là ĐỀ XUẤT.

## Mục đích
Trang khách nhận qua email: xem số dư, hạn, chép mã dùng ở checkout, quét QR tại cửa hàng, thêm vào Apple Wallet, in.

## Anatomy
Template `{% layout none %}`, nền `background`.
1. Thanh trên: logo giữa (`settings.logo` hoặc `logo-efitco`), cao 64 / 80, viền dưới `border`. Không nav.
2. Thẻ quà (`aria-hidden`, chỉ hình): tỉ lệ 1.586 (thẻ ngân hàng), nền `background-dark` + noise, bo `--figma-radius-16`, padding 24 / 40.
   - trên: logo trắng + eyebrow "Gift card" heading 800 16/20 uppercase `muted-on-dark`;
   - dưới: "Balance" 14/22 `muted-on-dark`, `gift_card.balance | money` heading 800 48 → 80, "of {{ gift_card.initial_value | money }}" 14/22 `muted-on-dark` (chỉ khi balance ≠ initial);
   - wordmark EFITCO trang trí góc dưới, trắng 6% trên nền tối.
3. Cột thông tin:
   - h1 `'gift_card.title' | t: value` "Here's your $75.00 gift card for Efitco!" `--font-size-h1`;
   - "Expires on {{ date }}" 16/26 `muted` (chỉ khi `expires_on`);
   - Mã: label "Gift card code" 14/22 600; ô mã nền `background-cream`, viền 1px dashed `muted-light`, bo 4, cao 52, `gift_card.code | format_code` 18/28 600 letter-spacing 0.08em, tabular-nums; nút secondary "Copy Code" (icon copy); gợi ý `'gift_card.use_at_checkout' | t` 14/22 `muted`;
   - Khối đổi quà: viền 1px `border`, bo 12, padding 24: QR 120 × 120 vùng mã (khung 136 gồm 8 lề trắng, viền trong `border`) + câu 14/22 `muted` + nút Apple Wallet (asset `gift-card/add-to-apple-wallet.svg` của Shopify, cao 44);
   - Hành động: nút accent "Start Shopping" (`routes.root_url`), secondary "Print" (icon in).
4. In (`@media print`): ẩn thanh trên, hàng nút; thẻ giữ màu (`print-color-adjust: exact`).

Dữ liệu mockup: balance $75.00 / initial $100.00, mã `7KQ4 M9XD 2HPL 8W3C`, hạn November 7, 2027 — ví dụ, mọi giá trị từ object `gift_card`.

## Settings merchant
Không có setting riêng (template layout none). Logo lấy `settings.logo` của theme, rỗng thì `logo-efitco`; tên shop `shop.name`.

## Layout
| Width | Bố cục |
| --- | --- |
| 360 | margin 20; thẻ trên cùng 100% rộng; dưới là h1, mã, nút Copy xuống dòng; khối QR 2 cột (QR 136 + chữ); nút Start Shopping, Print 100% xếp dọc; padding dọc 48 |
| 768 | ô mã + Copy cùng hàng; nút auto cạnh nhau; thẻ padding 40 |
| 1280 | 2 cột 520 / 520, gap 80, khung tối đa 1120 canh giữa; padding dọc 120 |
| 1920 | như 1280 (khung 1120 giữ cho dễ đọc, không kéo theo 1416) |

## Trạng thái
- Hết hạn hoặc vô hiệu (`gift_card.expired` hoặc `gift_card.enabled == false`): badge "Expired" pill `sale` chữ trắng ở góc thẻ thay eyebrow; số dư màu `muted-on-dark`; thông báo đầu cột phải (nền `background-cream`, viền đầu dòng 4px `sale`, icon `sale`, chữ `foreground`): "This gift card has expired." + ngày hết hạn; ô mã chữ `muted`, ẩn Copy Code; giữ Start Shopping (mockup Trạng thái 1). Logic hiển thị QR/Wallet giữ như template hiện có (pass_url có thì hiện) — xem quyết định 3.
- Rỗng: không `pass_url` → ẩn Apple Wallet; không `expires_on` → ẩn dòng hạn; balance = initial → ẩn "of …".
- Loading: QR vẽ bằng JS sau khi tải; ô QR giữ đúng 136 × 136 nền trắng nên không layout shift; không JS thì ô trống, mã chữ vẫn dùng được.
- Copy Code: bấm → nút đổi "Copied" + icon check, nền `badge-new` chữ trắng, 2 giây rồi về, thông báo qua `aria-live="polite"` (Trạng thái 2). Cần JS (BE). Không JS → ẩn nút (`hidden` tới khi JS gỡ).
- Hover/active/focus: như `page.md` (tối 12%, scale 0.98, outline 2px offset 2).

## Accessibility
| Cặp | Tỉ lệ |
| --- | --- |
| #1A1A1A / #FFFFFF (h1, label) | 17.4 |
| #1A1A1A / #F5F5F1 (mã) | 16.0 |
| #4D4D4D / #FFFFFF (hạn, gợi ý) | 8.45 |
| #4D4D4D / #F5F5F1 (mã hết hạn) | 7.75 |
| #FFFFFF / #1A1A1A (số dư) | 17.4 |
| #999999 / #1A1A1A (nhãn trên thẻ, số dư hết hạn) | 6.11 |
| #FFFFFF / #BD1616 (badge Expired 13px) | 6.38 |
| #BD1616 / #F5F5F1 (icon thông báo) | 5.85 |
| #FFFFFF / #4B824D (Copied) | 4.57 |
| #FFFFFF / #C8400E (nút) | 5.01 |

- Thẻ là hình `aria-hidden`; mọi thông tin đọc được nằm ở h1, dòng hạn, ô mã (nội dung lặp lại có chủ đích).
- QR: `role="img"`, `aria-label` "QR code for gift card {{ code }}"; đủ tương phản đen/trắng, lề trắng 8px.
- Mã không bị cắt dòng giữa nhóm 4 ký tự; người dùng chọn và chép tay được (không `user-select: none`).
- Vùng chạm ≥ 44: Copy Code, Wallet, Start Shopping, Print, logo.

## Token
`--color-background/foreground/muted/muted-light/border/background-cream/background-dark/background-dark-foreground/muted-on-dark/accent/accent-foreground/sale/sale-foreground/badge-new/badge-new-foreground`, `--font-heading--family`, `--font-primary--family`, `--font-size-xs/sm/base/lg/h1`, `--space-*`, `--radius-input`, `--radius-card`, `--figma-radius-8/16`, `--radius-pill`, `--motion-fast`, `--ease-out`.

## Map block
| Phần | Hiện có | Cần thêm |
| --- | --- | --- |
| Template | `templates/gift_card.liquid` (balance, expired, expires_on, logo, code, Apple Wallet) | cấu trúc thẻ + cột, nút Copy/Print, ô QR `data-testid="gift-card-qr"` (FE) |
| CSS | `.template-gift-card` trong `assets/base.css` | thay bằng `.gift-card*` theo spec |
| QR, Copy, Print | — | BE: tải `{{ 'vendor/qrcode.js' \| shopify_asset_url \| script_tag }}`, vẽ QR từ `gift_card.qr_identifier`, copy bằng Clipboard API, print `window.print()` (tách ticket BE1) |
| Locale | `gift_card.*` của Skeleton | `gift_card.title`, `copy_code`, `copied`, `print`, `qr_hint`, `balance`, `of_initial` |

## Quyết định CTO cần chốt
1. QR, Copy Code, Print cần JS: tách ticket BE theo `fe-be-boundary`, FE làm markup trước? Đề xuất: đồng ý; không JS vẫn còn mã chữ, AC "QR ≥ 120px" chỉ đạt sau ticket BE.
2. Thẻ quà nền tối noise + wordmark mờ, khung 1120 thay 1416? Đề xuất: đồng ý, trang ngắn, đọc tốt hơn trên màn rộng.
3. Gift card hết hạn: vẫn hiện QR và Apple Wallet như template hiện tại, hay ẩn? Đề xuất: giữ hiện (không đổi logic), chỉ thêm thông báo và ẩn Copy Code.
