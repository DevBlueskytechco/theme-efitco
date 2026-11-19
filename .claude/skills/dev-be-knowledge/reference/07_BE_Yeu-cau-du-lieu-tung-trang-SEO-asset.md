# Yêu cầu dữ liệu từng trang, SEO, asset, chức năng

**Tiêu đề:** Yêu cầu dữ liệu từng trang, SEO, asset, chức năng
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx nhóm "Đáp ứng Theme store requirements" và 5.5 Test checklist; shopify.dev Theme Store requirements mục Pages, Consistency and functionality, Assets, SEO, Social media, Responsive images

---

## Nội dung

Mọi mục là [Shopify – bắt buộc] trừ khi ghi khác.

### 1. Layout (`theme.liquid`)

- `<html lang="{{ request.locale.iso_code }}">`.
- Icon thanh toán: dùng `shop.enabled_payment_types` với filter `payment_type_img_url` hoặc `payment_type_svg_tag`; icon full color.
- URL động dùng object `routes` (ví dụ `{{ routes.root_url }}` thay vì `/`) để theo kịp thay đổi định dạng URL, kể cả đa ngôn ngữ.
- Không sửa hay parse `content_for_header`.

### 2. Product page

Phải output:
- `product.title` (không cắt), `variant.price`, `variant.unit_price`, giá compare-at của variant, `product.description`, tên option và giá trị option.

Phải có:
- Mọi ảnh sản phẩm hiển thị, xem được; ảnh khác tỉ lệ không vỡ layout.
- Ảnh variant hiện khi chọn variant đó.
- Dùng `cart.taxes_included` để báo giá đã gồm thuế khi store dùng giá gồm thuế.
- Variant tách thành từng option để chọn.
- Chọn số lượng.
- Nút Add to cart (disable hoặc thay thế khi tổ hợp không tồn tại hoặc hết hàng).
- Callback cập nhật giá, compare-at, thông báo sold out theo variant đang chọn.
- Trang tải với variant khả dụng đầu tiên (`product.selected_or_first_available_variant`).

Tính năng: product recommendations, rich media, accelerated checkout (bật mặc định), pickup availability, Shop Pay Installments.

Gift card product: cho phép gửi tới người nhận (`gift_card.recipient`), dùng `form.email`, `form.name`, `form.message` và `send_on`.

Swatch: option sản phẩm hỗ trợ swatch hiển thị màu hex hoặc ảnh qua `swatch.color`, `swatch.image`. Test checklist còn yêu cầu có tuỳ chọn tắt swatch và hướng dẫn rõ cách upload swatch tuỳ chỉnh.

### 3. Collection page

- Output `collection.title` (không cắt), `collection.description`, `collection.image`.
- Sản phẩm dạng grid hoặc list, mỗi item: `product.title` (không cắt, link tới `product.url`), `product.price`, `product.images`, `variant.unit_price`, ít nhất một media.
- Grid không vỡ với ảnh khác tỉ lệ.
- Hiện badge Sale hoặc `product.compare_at_price_max` khi phù hợp.
- Có sắp xếp sản phẩm.
- Thông báo khi collection rỗng.
- Giá khác nhau theo variant: dùng `product.price_varies`, hiển thị khoảng `product.price_min`–`product.price_max`.
- Pagination hoặc lazy loading.

### 4. Collection list page

- `collection.title` (không cắt).
- Dùng `collection.featured_image` (tự lấy ảnh sản phẩm đầu tiên khi collection không có ảnh).
- Pagination hoặc lazy loading.

### 5. Cart page

- Mỗi `line_item`: `title`, `unit_price`, `image`, `final_price`, `quantity`, `options_with_values`.
- `cart.total_price` hiển thị.
- `cart.taxes_included` khi giá gồm thuế.
- Nút checkout submit cart form.
- Cập nhật số lượng thì refresh toàn bộ line item để tổng đúng.
- Đổi được số lượng từng dòng.
- Thông báo khi cart rỗng.
- Hỗ trợ: cart note, selling plans, automatic discount, accelerated checkout (bật mặc định).

### 6. Các trang khác

| Trang | Yêu cầu |
| - | - |
| Page | `page.title`, `page.content`; có template thay thế cho contact form |
| Blog | `blog.title`; mỗi article: `article.title` (không cắt, link `article.url`), `article.image`, `article.excerpt_or_content` (không dùng `article.content`); pagination hoặc lazy loading |
| Article | `article.title` (không cắt), `article.comments`, `article.published_at` (không dùng `article.created_at`); comment phân trang; luồng comment chạy khi không bật kiểm duyệt; output đủ thông báo thành công/lỗi |
| Search | Thông báo khi không có kết quả; trả về nhiều loại object (product, blog, page), dùng `object_type` khi hiển thị; pagination hoặc lazy loading |
| 404 | Thông báo rõ không tìm thấy trang; có cách đi tiếp (ô search hoặc link về trang chủ) |
| Gift card | Hỗ trợ Apple Wallet; hiện mã gift card; QR code tối thiểu 120×120 px; có logo hoặc `shop.name` |
| Password | Logo hoặc `shop.name`; `shop.password_message`; form nhập storefront password |

### 7. Consistency and functionality

- Nội dung RTE (`h1`–`h6`, blockquote, ul, ol) nhất quán trên mọi template.
- Script trong theme phải host trên server Shopify, trừ thư viện bên thứ ba được duyệt.
- Không có JS can thiệp hoặc thay đổi tính năng native của Shopify trong theme editor hay admin.
- Mọi link trong code trỏ tới domain của Shopify phải có `rel="nofollow"`.
- Asset link bằng URL protocol-relative, không hard-code `http`/`https`.
- Có license phù hợp cho plugin và ảnh bên thứ ba.
- Không có chức năng phụ thuộc app; không có tính năng kiểu app cần API.
- Không dữ liệu giả (countdown, tồn kho, lượt xem).

### 8. Assets

- Không Sass, không `.scss`/`.scss.liquid`; chỉ `.css`/`.css.liquid`.
- Không đưa file `.css`/`.js` đã minify, trừ ES6 và thư viện bên thứ ba. Shopify tự minify CSS và JS dùng cú pháp ES5 trở xuống khi storefront request.

### 9. SEO

- Có snippet SEO metadata: title, meta description, canonical URL.
- Có Google rich product snippets (structured data).
- Không có template `robots.txt.liquid`.

DoD nội bộ: Lighthouse SEO = 100 desktop và mobile.

### 10. Social media

- Có bộ icon social media cho merchant chọn.
- Có thẻ Open Graph và Twitter card.
- Placeholder text của setting social media để trống.
- `page_image` cho ảnh chia sẻ (mục Features).

### 11. Responsive images

- Ảnh theo chiến lược responsive (trừ icon nhỏ).
- Ảnh chỉ tải khi cần.

BE xuất ảnh bằng `image_url` + `image_tag` để có `srcset`, `width`, `height`; truyền `section.index` để FE quyết định eager/lazy.

### 12. Demo store (liên quan dữ liệu BE cấu hình)

- `powered_by_link` không được sửa, chỉ chứa `powered_by_link`.
- Không link affiliate.
- File `.json` không chứa resource riêng của demo store (custom metafield, URL `shopify://`).

### 13. Nghiệm thu

- Rà từng trang theo bảng trên với dữ liệu CSV test của Shopify (file 11).
- Grep code: không còn `href="/"` cứng, không `http://`/`https://` cứng cho asset, link domain Shopify đều có `rel="nofollow"`, không dùng `article.created_at`, không dùng `article.content` ở trang blog.
