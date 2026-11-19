# Checklist test chức năng theo Shopify review

**Tiêu đề:** Checklist test chức năng theo Shopify review
**Loại:** Checklist
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx mục 5.5 Test checklist và 5.3 Browser compatibility; shopify.dev Test checklist; shopify.dev Theme Store requirements mục Browser compatibility

---

## Nội dung

Chạy mọi mục **cả trong theme editor và trên storefront** (Shopify yêu cầu). Dữ liệu chuẩn bị theo file 11. Phần hiển thị (text dài, tỉ lệ ảnh) FE đã kiểm; file này tập trung chức năng.

### 1. Home page

- [ ] Thêm: 3 slideshow, 5 featured product (3 cái cùng sản phẩm), 3 featured collection, 1 collection list, 3 image with text, 1 newsletter, 1 rich text, 1 blog posts, 2 video; thêm tới đủ 25 section. Mọi section chạy đúng.

### 2. Header

- [ ] Logo/tên store hiển thị, truy cập được; icon/link header hoạt động.
- [ ] Menu 1, 2, 3 cấp và mega menu (nếu có) mở/đóng bằng chuột và bàn phím; menu 10+ mục.

### 3. Footer

- [ ] Tối đa block/cột; nhiều menu; đủ social link hoạt động.
- [ ] Newsletter trong footer (nếu có): nhập, submit, phát hiện lỗi, thông báo thành công.

### 4. Section

- [ ] Announcement bar: link nội bộ, link ngoài, mở cùng tab, mở tab mới.
- [ ] Slideshow: 3 section; tối đa slide (không giới hạn thì 10); video nếu có; button link nội bộ/ngoài, cùng tab/tab mới; nhiều slideshow cùng autoplay chạy đúng; control chạy khi đang autoplay.
- [ ] Featured product: 5 section (3 trùng sản phẩm); chọn variant khác nhau ở sản phẩm trùng; add to cart từng section đúng sản phẩm; chạy toàn bộ test product page.
- [ ] Featured collection: 3 section, collection nhiều kích cỡ; chạy test collection page.
- [ ] Collection list: tối đa collection (không giới hạn thì 10); collection không ảnh hiện ảnh sản phẩm đầu hoặc tiêu đề.
- [ ] Image with text: 3 section; link các kiểu.
- [ ] Newsletter: nhập, submit, lỗi, thành công.
- [ ] Rich text: link các kiểu.
- [ ] Blog posts: nhiều tỉ lệ ảnh.
- [ ] Video: YouTube, Vimeo, MP4 (nếu có); control hiện và hoạt động; nhiều section video không vỡ.
- [ ] Section riêng của theme: 2–3 instance cùng lúc không vỡ.

### 5. Password page

- [ ] Vào được store bằng password; form email: nhập, submit, lỗi, thành công.

### 6. Collection page

- [ ] Truy cập được mọi sản phẩm; sort và filter chạy; kết hợp nhiều filter không vỡ trang.
- [ ] Group filtering (nếu có); 20+ tag.
- [ ] Tải đầu chỉ hiện số lượng giới hạn; pagination rút gọn khi ≥ 5 trang; View more / infinite scroll (nếu có).
- [ ] Nút Add to cart trên card (nếu có) disable/thay thế khi variant sold out/không tồn tại; badge sold out hiện đúng.

### 7. Product page

Cấu hình cần test: sản phẩm không variant; sản phẩm sale; 1 option; nhiều option với tồn kho khác nhau (variant hết hàng, variant không tồn tại); 3 option; 100 variant; không ảnh; media hỗn hợp (ảnh, video, 3D, AR, MP4); có unit price.

- [ ] Thêm variant đang chọn vào giỏ.
- [ ] Đổi variant cập nhật: giá, media, SKU, nút action (disable Add to cart và accelerated checkout khi sold out/không tồn tại), selector (gạch/disable option hết hàng), unit price, Shop Pay Installments banner, local pickup banner, inventory (nếu có).
- [ ] Không cho thêm vượt tồn kho; hiện lỗi.
- [ ] Image zoom (nếu có); swatch (nếu có), tắt được swatch, có hướng dẫn upload swatch.
- [ ] Mô tả: link các kiểu; ảnh hiển thị như trong RTE.

### 8. Blog, article

- [ ] Blog: mọi bài truy cập được; filter tag (nếu có) không vỡ khi kết hợp; pagination/View more/infinite scroll.
- [ ] Hiển thị title, excerpt, author, date, comment count.
- [ ] Article: comment nhập, submit, lỗi, thành công; comment quá giới hạn được phân trang.

### 9. Cart (page, modal hoặc drawer)

- [ ] Đủ sản phẩm để phải cuộn; mọi sản phẩm hiển thị đủ.
- [ ] Đổi số lượng; số lượng 0 xoá sản phẩm.
- [ ] Vượt tồn kho hiện lỗi.
- [ ] Automatic discount cập nhật động; cart note.

### 10. Search

- [ ] Tải đầu giới hạn số kết quả; pagination rút gọn khi ≥ 5 trang; View more / infinite scroll; filter; list/grid (nếu có).
- [ ] Không có kết quả: hiện thông báo.

### 11. Page, contact, gift card

- [ ] Page thường: link các kiểu; ảnh như RTE; lặp lại với mọi product template đang có.
- [ ] Contact: field bắt buộc, submit, lỗi, thành công; merchant nhận được email.
- [ ] Gift card: mã và tên/logo store hiển thị đủ.

### 12. Link sharing

- [ ] Chia sẻ link store lên mạng xã hội: ảnh chia sẻ hiện (Facebook sharing debugger, Twitter card validator).

### 13. Local pickup (dữ liệu 5 variant ở file 11)

- [ ] Variant 1 (5 location): banner hiện; "Check availability at other stores" mở danh sách đủ location, cuộn được.
- [ ] Variant 2 (1 location): banner hiện; link đổi thành "View store information".
- [ ] Variant 3 (2 location, hết ở 1): banner báo có/không ở một location; link hiện; mở ra chỉ 2 location.
- [ ] Variant 4 (chỉ ở location không pickup): banner bị ẩn.
- [ ] Variant 5 (hết ở mọi nơi): banner ẩn; nút Add to cart thành Sold out.
- [ ] Banner đổi động khi chọn variant khác.

### 14. Unit pricing

- [ ] Đổi động khi đổi variant.
- [ ] Hiện ở: product page, card trên collection page, cart (drawer/page/popup), trang đơn hàng của khách.

### 15. Rich media

- [ ] 3D xem và xoay được trên desktop và mobile; nút "View in your space" trên mobile; xem được AR trên mobile.
- [ ] Video YouTube, Vimeo, MP4: control truy cập được, mute/unmute, play/pause.
- [ ] Media của variant hiện khi chọn variant.
- [ ] Rich media không làm vỡ product card trên collection page.

### 16. Selling plans

- [ ] Selling plan đã áp dụng hiện ở cart page và trang đơn hàng của khách.

### 17. Trình duyệt (Dev.xlsx 5.3 – luồng chức năng chạy tương thích)

- [ ] Duyệt và mua hàng chạy trên: Safari (2 bản mới nhất, Mac), Chrome (3, Mac/PC), Firefox (3, Mac/PC), Edge (2, PC); Mobile Safari (2, iOS), Chrome Mobile (3, Android/iOS), Samsung Internet (2, Android); webview Instagram, Facebook, Pinterest bản mới nhất Android/iOS.

### 18. Áp dụng cho Quickview và Featured product (Dev.xlsx 5.4)

- [ ] Lặp lại mục 7, 13, 14, 15 trong quickview và featured product section.
