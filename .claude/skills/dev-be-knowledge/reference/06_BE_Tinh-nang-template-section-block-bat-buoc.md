# Tính năng, template, section, block bắt buộc của Theme Store

**Tiêu đề:** Tính năng, template, section, block bắt buộc của Theme Store
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx mục 5.2 "Tính năng" (link requirements#features), nhóm "Đáp ứng Theme store requirements"; shopify.dev Theme Store requirements mục Uniqueness, Features, Templates/sections/blocks

---

## Nội dung

Dev.xlsx: đáp ứng Theme Store requirements là bắt buộc; không đạt thì theme không được chấp nhận. Mọi mục dưới đây là [Shopify – bắt buộc].

### 1. Codebase gốc

- Skeleton Theme của Shopify (https://github.com/shopify/skeleton-theme) là codebase duy nhất được chấp nhận làm nền. Ngoài ra phải là code gốc hoàn toàn.
- Theme mới xây trên hoặc dẫn xuất từ Dawn hay Horizon không đủ điều kiện lên Theme Store.
- Theme phải khác biệt căn bản với theme khác trên Theme Store, kể cả theme của chính mình; không đạt được bằng chỉnh settings, style bề mặt hay thêm vài section/option vào theme khác.

### 2. Danh sách tính năng phải có

| Tính năng | Yêu cầu | Trang bắt buộc |
| - | - | - |
| Sections Everywhere | Tương thích Online Store 2.0 (xem mục 3) | Mọi template |
| Discounts | Hiển thị số tiền giảm cho từng item và toàn đơn | Cart (bắt buộc), checkout, order |
| Accelerated checkout buttons | Có nút accelerated checkout; không sửa màu nút | Product, Cart; bật mặc định |
| Faceted search filtering | Lọc theo availability, price, type, vendor, variant option | Collection, Search |
| Gift cards | Có template `gift_card.liquid` | Gift card page |
| Image focal points | Tôn trọng focal point từ `image_picker` hoặc trang Files | Mọi nơi render ảnh |
| Images for social sharing | Dùng object `page_image` | `<head>` |
| Country selection | Chọn quốc gia/tiền tệ khi bán đa tiền tệ, theo UX guidelines | Storefront |
| Language selection | Chọn ngôn ngữ khi bán đa ngôn ngữ, theo UX guidelines | Storefront |
| Multi-level menus | Menu lồng nhiều cấp, dropdown | Header |
| Newsletter forms | Form đăng ký email | Section newsletter / footer |
| Pickup availability | Hiển thị có thể nhận tại cửa hàng mà không cần thêm vào giỏ | Product |
| Related product recommendations | Section gợi ý sản phẩm liên quan tự động | Product |
| Complementary product recommendations | Gợi ý sản phẩm đi kèm | Product |
| Rich product media | 3D model, video nhúng, YouTube, Vimeo | Product template, featured product, quick view |
| Search | Template search + predictive search | Header / search |
| Selling plans | Hiển thị selling plan đã chọn | Cart (bắt buộc) |
| Shop Pay Installments | Banner Shop Pay Installments | Product |
| Unit pricing | Hiển thị đơn giá theo đơn vị | Collection, Product, Cart |
| Variant images | Ảnh gắn với variant | Product |
| Follow on Shop | Nút qua filter `login_button`; không sửa màu nút | Theo vị trí theme chọn |
| Account component | `<shopify-account>` trong header | Header desktop và mobile |

Lưu ý Dev.xlsx 5.4 ghi "Áp dụng Quickview, Featured product": các tính năng sản phẩm (rich media, variant, unit price, pickup, installments, inventory) phải chạy cả trong quickview và section featured product, không chỉ trang product.

### 3. Template bắt buộc

Theme phải có đủ:
- `layout/theme.liquid`
- `templates/404.json`, `article.json`, `blog.json`, `cart.json`, `collection.json`, `index.json`, `list-collections.json`, `page.json`, `page.contact.json`, `password.json`, `product.json`, `search.json`
- `templates/gift_card.liquid`
- `config/settings_data.json`, `config/settings_schema.json`

Không đưa `config/markets.json` vào file nộp.

### 4. Section

- Mọi template hỗ trợ section (JSON template), trừ Customer Account, Gift Card, Checkout.
- Có section **Custom Liquid** với setting type `liquid`, dùng được trên mọi template hỗ trợ section (là điểm chèn cho một số loại app).
- Header và footer render trong **section groups** để merchant thêm, xoá, sắp xếp section ở vùng header/footer.

### 5. Block và app block

- Main product section hỗ trợ block cho tất cả hoặc phần lớn thành phần: giá, vendor, mô tả… mỗi thứ là một block riêng.
- Hỗ trợ app block (`"type": "@app"`) trong main product section và featured product section.
- Thêm block **Custom Liquid** (setting type `liquid`) ở những chỗ bạn sẽ cân nhắc đặt app block.

### 6. Preset theme và thư mục listings

- Nhiều preset theme: mỗi preset có bộ template riêng trong `/listings/<preset-name>/templates/*.json` (tuỳ chọn `/listings/<preset-name>/sections/*.json` cho section group riêng). Một preset thì không cần `/listings`.
- Khi cài, theme phải khớp demo store: layout, màu, typography khớp demo; nhiều preset thì mỗi preset khớp demo của nó. Ảnh demo không chuyển theo khi cài.

### 7. Không được làm

- Không có credit designer hay link affiliate trong file theme.
- Không có chức năng phụ thuộc app.
- Không làm tính năng giống app cần API để chạy đầy đủ (Shopify ví dụ: wishlist, đặt lịch hẹn, mã giảm giá cấp cart, Instagram feed). Tính năng làm dở kiểu app sẽ bị từ chối.
- Không dùng dữ liệu giả đánh lừa: countdown giả, tồn kho giả, số người đang xem giả.
- Không có `robots.txt.liquid`.

### 8. Nghiệm thu

- Đủ file template ở mục 3; không có `markets.json`, `robots.txt.liquid`.
- Mở editor: Custom Liquid section thêm được trên mọi template; header/footer là section group.
- Main product: mỗi thành phần là block; thêm được app block; có Custom Liquid block.
- Từng tính năng ở mục 2 chạy trên đúng trang bắt buộc, kể cả quickview và featured product.
