KHÔNG CHẮC: Playwright, Lighthouse chưa chạy (không có preview/trình duyệt trong phiên); spec chưa type-check. Trường hợp đổi sang biến thể hết hàng: id đổi nên vẫn POST, server trả 422 "sold out" hiện ở alert (không còn byte để chặn ở client trong trần 6 900 B của ES1-T96).

# ES1-T602: featured product chờ picker khi radio đã đổi mà product-variant-picker.js chưa define

Theo review #331 (ES1-T344). TE-13 AC2, AC-H22. ADR 0008, ADR 0010.

## Vấn đề
Picker featured hiện sẵn trước khi module nạp (lười theo tương tác, ADR 0010). Mobile: chạm radio rồi chạm Add rất nhanh, product-form.js đã define nhưng product-variant-picker.js chưa → form gửi input hidden `id` cũ.

## Sửa (chỉ `assets/product-form.js`)
- `ready()` chạy trong `submit()` trước `new FormData(this.form)`:
  - `product-variant-picker:not(:defined)` trong `<product-form>` có radio `checked != defaultChecked` → `lock(true)` (disabled + aria-busy trên nút), chờ `customElements.whenDefined` (tối đa 9 s), rồi chờ `aria-busy` trên `<product-form>` gỡ (picker connectedCallback tự `load()` lựa chọn khác defaultChecked, `pending()` đặt/gỡ aria-busy trên root `product-form`, ghi `form.elements.id`).
  - Sau khi chờ: `id` đổi → gửi như cũ với id mới. `id` không đổi (lỗi tải: picker hiện alert + Try again; tổ hợp không tồn tại: nút Unavailable; 9 s không có picker) → không POST, mở khoá nút.
  - Không đổi radio hoặc picker đã define → trả ngay, không thêm độ trễ (PDP, quickview không đổi hành vi).
- Bấm lần 2 khi đang chờ: `busy` → bỏ qua (1 POST).
- Gọn để giữ trần ES1-T96 (6 900 B): rút comment, helper `wait(ms)`, `lock()` dùng `b.ariaBusy` (như picker), input offset gift card tạo 1 dòng, bỏ điều kiện thừa trước `say(status, labelAdded)`. Không đổi hành vi.
- Không đổi markup FE, featured-product.js, product-variant-picker.js, lazy-module.js.

## Hợp đồng dùng
- `blocks/featured-product.liquid`: `<product-variant-picker>` trong `<product-form>`, ngoài `<form>`; `<input type="hidden" name="id">`; picker `data-lazy-on="interaction"`.
- `assets/product-variant-picker.js`: `this.root = this.closest("product-form")`, `pending()` → `ariaBusy`, `this.form.elements.id.value = v.id`, connectedCallback load khi `ids() != defaultChecked`.

## Byte (wc -c)
| File | Trước | Sau | Trần |
| --- | --- | --- | --- |
| assets/product-form.js | 6 867 | 6 894 | 6 900 (ES1-T96), 7 168 (ADR 0010) |
| assets/featured-product.js | 973 | 973 | 1 024 |
| assets/product-variant-picker.js | 7 130 | 7 130 | 7 168 |

- PDP tải sẵn (D9 ES1-T69): header-menu 3 058 + header-sticky 1 680 + picker 7 130 + product-form 6 894 + product-media 4 405 + product-recommendations 3 069 = 26 236 ≤ 30 046 (+27).
- Trang chủ featured (lười theo tương tác, không tính trần sau cuộn): featured-product 973 + picker 7 130 + product-form 6 894 = 14 997.

## Test
`tests/e2e/ES1-T602.spec.ts`:
- Tĩnh: trần byte; `ready()` trước `new FormData`; contract markup + picker (root product-form, ariaBusy, ghi id, load khi khác defaultChecked).
- /?view=te13 (giữ request product-variant-picker.js, mock 422 /cart/add.js):
  - đổi radio, bấm Add → nút aria-busy + disabled, 0 POST; thả picker → 1 POST mang id biến thể mới.
  - bấm 2 lần khi chờ → 1 POST.
  - picker tải lỗi (route.abort ?view=featured-product) → 0 POST, Try again hiện, nút mở lại, id giữ.
  - không đổi radio → POST ngay id hiện tại, không chờ picker.
- Hồi quy: ES1-T158 "lựa chọn đổi trước khi module nạp", ES1-T67, ES1-T85, ES1-T96 (trần 6 900).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (9 warning có sẵn ở file khác).
- `wc -c` mọi file chạm ≤ 8 192; product-form.js 6 894 ≤ 6 900.
- Không console.*, không import tĩnh, không đổi locale/markup.
- Playwright, Lighthouse, preview: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
