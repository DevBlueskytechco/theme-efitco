# UI spec: password (ES1-T244)

Mockup: `drafts/designer/ES1-T244/password.html`, PNG `password-360/768/1280/1920.png`.
Nguồn: SRS TE-9 AC2 (logo/shop.name, password_message, form); DESIGN.md; Figma 1:1104 (nền tối noise, wordmark, ô nhập + nút dính), 1:422 (display heading); figma-exceptions E3. Figma không có trang password: bố cục là ĐỀ XUẤT.

## Mục đích
Trang khoá store trước khi mở bán: cho khách biết shop sắp mở, cho chủ shop/khách được mời nhập mật khẩu.

## Anatomy
Layout `layout/password.liquid`, toàn trang nền `background-dark` + `noise-dark.png` (như footer, hero).
1. Thanh trên: logo (`settings.logo`, không có thì `logo-efitco` / `shop.name`) màu `background-dark-foreground`, cao vùng bấm 44; bên phải "Are you the store owner? Log in here" 14/22 (`muted-on-dark` + link trắng gạch chân) → link admin Shopify chuẩn. Dưới 48rem phần câu hỏi ẩn trực quan, vẫn đọc bằng screen reader.
2. Eyebrow `shop.name` heading 800 16/20 uppercase `muted-on-dark` (không dùng accent trên nền tối, E3).
3. h1 `'password.title' | t` "Opening Soon": display heading 800, `--font-size-display` (48 → 100), uppercase, letter-spacing -0.04em, line-height 1.
4. `shop.password_message`: 18/28 500 trắng, tối đa 640. Trống thì không render.
5. Form `storefront_password`: label hiện "Enter store password" 14/22 600; ô `type=password`, `autocomplete=current-password`, cao 52, viền 1px `muted-on-dark`, nền trong suốt; nút accent icon khoá + "Enter", dính phải ô từ 48rem (như form newsletter footer Figma 1:1104).
6. Ảnh (ĐỀ XUẤT setting): bo `--figma-radius-24`, tỉ lệ 4/5 (≥ 64rem), 16/10 (48rem), 4/5 (< 48rem), `object-fit: cover`, `alt=""` (trang trí). Không chọn ảnh → 1 cột.
7. Chân: wordmark EFITCO (heading 800 `--font-size-wordmark`, `aria-hidden`) + "© 2026 Efitco, Powered by Shopify" 14 `muted-on-dark` (`powered_by_link`).

## Settings merchant
| Block | Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- | --- |
| password-hero (mới) | Image | image_picker | trống | trống → 1 cột |
| password-hero | Show wordmark | checkbox | true | wordmark lấy `shop.name` |

`shop.password_message` sửa trong Shopify admin (Preferences), không phải setting theme. Không thêm newsletter (SRS không có) — xem quyết định 3.

## Layout
| Width | Bố cục |
| --- | --- |
| 360 | thanh trên 64; nội dung 1 cột, padding 48; display 48; ô + nút xếp dọc, nút 100%; ảnh dưới form 4/5; wordmark 64, chân canh giữa |
| 768 | ô + nút cùng hàng; ảnh 16/10 |
| 1280 | thanh trên 80; 2 cột nội dung / ảnh 696fr / 600fr, gap 120 (từ 64rem 1fr / 1fr, gap 80); padding 60; display ≈ 90 |
| 1920 | nội dung 1416; display 100; ảnh 600 × 750; chân 3 cột: copyright trái, wordmark giữa (như footer Figma) |

## Trạng thái
- Password sai (`form.errors`): banner nền `sale` chữ trắng + icon trên label, `role="alert"`; ô nhập `aria-invalid="true"`, viền 2px trắng, `aria-describedby` tới banner; focus về ô nhập. Câu: "Incorrect password. Try again." (locale, thay `default_errors`) (mockup Trạng thái 1).
- Rỗng: không có `password_message`, không có ảnh → 1 cột, chỉ display + form (Trạng thái 2).
- Loading: POST thường, không JS; không thêm trạng thái.
- Hover: nút tối 12%, active scale 0.98; ô nhập viền trắng; link owner đổi gạch chân.
- Focus-visible: outline 2px trắng offset 2 (Trạng thái 2).

## Accessibility
| Cặp | Tỉ lệ |
| --- | --- |
| #FFFFFF / #1A1A1A (display, message, label) | 17.4 |
| #999999 / #1A1A1A (eyebrow, owner, copyright) | 6.11 |
| #FFFFFF / #C8400E (nút) | 5.01 |
| #FFFFFF / #BD1616 (banner lỗi) | 6.38 |
| viền ô #999999 / #1A1A1A | 6.11 (≥ 3) |
| Không dùng: #C8400E / #1A1A1A = 3.48 (eyebrow 16px trượt), #BD1616 / #1A1A1A = 2.73 (chữ lỗi đỏ trên nền tối trượt) |

- Label hiện, không chỉ placeholder; `autocomplete="current-password"`.
- `lang` theo `request.locale.iso_code` (layout hiện có).
- Vùng chạm: nút 52, link owner 44 cao, logo 44.
- Ảnh trang trí `alt=""`; wordmark `aria-hidden`.

## Token
`--color-background-dark`, `--color-background-dark-foreground`, `--color-muted-on-dark`, `--color-accent`, `--color-accent-foreground`, `--color-sale`, `--color-sale-foreground`, `--font-heading--family`, `--font-heading--weight-display`, `--font-primary--family`, `--font-size-sm/base/lg/display/wordmark`, `--space-*`, `--radius-input`, `--figma-radius-8/24`, `--motion-fast`, `--ease-out`.

## Map block
| Phần | Hiện có | Cần thêm |
| --- | --- | --- |
| Layout | `layout/password.liquid` (css-variables, base.css, main) | class body `template-password` cho nền tối |
| Template | `templates/password.liquid` (h1, message, form, default_errors) | eyebrow, cấu trúc 2 cột, banner lỗi tuỳ biến, chân |
| Ảnh + wordmark | — | `blocks/password-hero.liquid` (FE) gọi từ template |
| Logo | `snippets/logo-efitco.liquid`, `settings.logo` | không |

## Quyết định CTO cần chốt
1. Trang password nền tối noise toàn trang, display "OPENING SOON" + wordmark như footer? Đề xuất: đồng ý, đúng ngôn ngữ hero/footer Figma.
2. Thêm block `password-hero` với setting ảnh (mặc định trống)? Đề xuất: thêm, trống thì 1 cột nên không cần dữ liệu demo.
3. Không có form đăng ký newsletter trên trang password (SRS AC2 không yêu cầu)? Đề xuất: không thêm trong Sprint 1; nếu cần thì dùng lại form newsletter footer.
