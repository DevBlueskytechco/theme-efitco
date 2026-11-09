# Chuẩn bị dữ liệu test (Testing assets)

**Tiêu đề:** Chuẩn bị dữ liệu test (Testing assets)
**Loại:** Checklist
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx mục 5.4 Testing assets (Áp dụng Quickview, Featured product); shopify.dev Testing assets

---

## Nội dung

Theo Dev.xlsx, các trường hợp test dữ liệu áp dụng cho cả trang product, **Quickview** và **Featured product**.

### 1. Import CSV của Shopify

- [ ] CSV sản phẩm mà team review Theme Store dùng để test: https://shopify.dev/csv/theme-store-testing-shop-product-data.csv
- [ ] CSV performance test (đủ khối lượng sản phẩm và collection, dùng khi chạy Lighthouse): https://shopify.dev/csv/theme-performance-shop-product-data.csv

CSV không import được một số dữ liệu, phải cấu hình tay các mục dưới đây.

### 2. Inventory quantities

Store có nhiều location thì CSV không import số lượng tồn, mọi sản phẩm về 0.

- [ ] Đặt số lượng tồn cho mọi sản phẩm, trừ **Bowtie (Rich Product Media)** — để sold out. Các variant có số lượng khác nhau.
- [ ] Sửa một sản phẩm 2 option (ví dụ **Socks (two options)**) để có variant sold out và variant không tồn tại. Bảng tham chiếu của Shopify:

| | S/M | M/L | Kids |
| - | - | - | - |
| Geometric | 0 | N/A | N/A |
| Hotdog | 4 | N/A | N/A |
| Dog | 3 | 10 | N/A |
| Cat | 5 | 0 | N/A |
| Plain white | N/A | 6 | N/A |
| Paw | N/A | N/A | 6 |

### 3. Local pickup

- [ ] Bật locations trong store.
- [ ] Thêm từ 5 location trở lên.
- [ ] Bật local pickup.
- [ ] Tắt local pickup ở một location.
- [ ] Tạo sản phẩm 5 variant (hoặc dùng **Enamel pin (1 option)**):
  - Variant 1: còn hàng ở mọi location
  - Variant 2: còn hàng ở một location
  - Variant 3: có ở hai location, hết hàng ở một trong hai
  - Variant 4: chỉ còn ở location không hỗ trợ pickup
  - Variant 5: hết hàng ở mọi location

### 4. Unit pricing

- [ ] Bật unit pricing bằng cách đặt địa chỉ store ở EU hoặc Thuỵ Sĩ (đổi trong Store details nếu dùng store sẵn có).
- [ ] Sản phẩm nhiều variant, mỗi variant một unit price khác nhau.

### 5. Rich media

CSV không hỗ trợ rich media.
- [ ] Sản phẩm **Bowtie (product rich media)** thêm: 2 model 3D (dùng sample model của Shopify: https://help.shopify.com/zip/SampleModels.zip), 1 video YouTube, 1 video Vimeo, 1 video MP4.
- [ ] Đặt mọi variant của sản phẩm này về 0 để card trên collection hiển thị rich media (có số lượng thì card mặc định hiện ảnh variant).

### 6. Selling plans

- [ ] Selling plan chỉ tạo được qua app: cài một subscription app để kiểm tra selling plan hiển thị đúng.

### 7. Shop Pay Installments

- [ ] Đặt địa chỉ store ở Mỹ.
- [ ] Sản phẩm nhiều variant, giá khác nhau (hoặc dùng **Socks (2 options)**).

### 8. Follow on Shop

- [ ] Cài Shop sales channel và bật Shopify Payments test mode.

### 9. Bổ sung theo yêu cầu demo/review

- [ ] Sản phẩm sale, sản phẩm/variant sold out, sản phẩm nhiều variant, gift card product (Shopify khuyến nghị cho demo store).
- [ ] Sản phẩm 100 variant, sản phẩm không có ảnh, sản phẩm 3 option (Test checklist – Product configurations).
- [ ] Collection không có ảnh; collection rỗng; blog nhiều bài để test pagination.

### 10. Nghiệm thu

Store test có đủ dữ liệu mục 1–9 trước khi chạy file 12 (Checklist test chức năng) và trước khi đo Lighthouse.
