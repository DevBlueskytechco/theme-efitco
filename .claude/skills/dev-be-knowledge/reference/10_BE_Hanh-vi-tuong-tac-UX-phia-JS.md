# Hành vi tương tác UX phía JavaScript

**Tiêu đề:** Hành vi tương tác UX phía JavaScript
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx nhóm "Trải nghiệm người dùng" mục 6.1–6.4; shopify.dev Performance best practices (JavaScript, Liquid); shopify.dev Accessibility best practices; shopify.dev Theme Store requirements (Pages – Cart, Product; Consistency and functionality); shopify.dev Test checklist

---

## Nội dung

### 1. Nguyên tắc

- UX là USP của theme, quyết định chuyển đổi (Dev.xlsx). Mọi hành vi phải "mượt, tối ưu khi tải, thống nhất toàn site".
- BE viết JS bật/tắt trạng thái; FE đã làm sẵn CSS và animation cho từng trạng thái. JS không viết style inline, không animate bằng JS khi CSS làm được.
- JS của component tải khi cần (dynamic `import()` khi tương tác); handler cuộn/resize dùng throttle, passive listener, `requestAnimationFrame` [Shopify – khuyến nghị].
- Mọi component hỗ trợ `shopify:section:load/unload/select/deselect` (file 05).
- Mọi component đáp ứng hành vi bàn phím/ARIA ở file 09.

### 2. Navigation (6.1, 6.3, 6.4)

- Setting cho merchant chọn mở submenu bằng hover hoặc click (đặt tên theo terminology, file 02).
- Chế độ click: click nút mở cập nhật `aria-expanded`; click ra ngoài hoặc Esc thì đóng.
- Chế độ hover: vẫn mở được bằng bàn phím (Enter/Space trên nút).
- Menu active khi click: cập nhật trạng thái active; trang hiện tại có `aria-current`.

### 3. Popup, modal, canvas không chồng nhau (6.3)

Quy tắc Dev.xlsx: popup, modal, canvas không xuất hiện cùng lúc. Ví dụ: đang mở quickview, bấm add to cart → đóng quickview trước, sau đó mở mini cart canvas.

Cách làm: một bộ quản lý overlay dùng chung, tại mọi thời điểm chỉ có một overlay mở. Mở overlay mới → đóng overlay hiện tại, chờ hết thời lượng animation đóng (biến CSS FE cung cấp), rồi mở overlay mới. Chuyển focus theo file 09.

### 4. Quickview (6.3)

- Dạng popup hoặc canvas (setting). Animation do FE làm; BE bật trạng thái.
- Nội dung quickview tải khi mở (Section Rendering API hoặc điều kiện Liquid), không render sẵn cho mọi sản phẩm trên trang [Shopify – khuyến nghị: defer dialog content, build DOM only when opened].
- Quickview phải có đủ tính năng sản phẩm như trang product: rich media, chọn variant, unit price, pickup, Shop Pay Installments, inventory (Dev.xlsx 5.4 ghi áp dụng cho Quickview và Featured product; Shopify yêu cầu rich media trong quick view).

### 5. Mini cart / cart (6.3, 6.4)

- Click icon cart trên header mở mini cart dạng canvas. Setting "Cart type" với option drawer/page/modal theo terminology Shopify.
- Nút action trong mini cart (tăng/giảm, xoá, checkout) có trạng thái loading khi đang xử lý; khoá thao tác trùng trong lúc chờ.
- Progress bar (ví dụ ngưỡng free shipping) chạy từ trái sang phải theo % mới khi update/remove item: BE tính % và cập nhật giá trị; FE animate.
- Bắt buộc [Shopify]: đổi số lượng thì refresh toàn bộ line item để tổng đúng; số lượng 0 thì xoá sản phẩm; thêm vượt tồn kho thì hiện lỗi; automatic discount cập nhật động; hiển thị selling plan, cart note.
- Cập nhật vùng cart bằng Section Rendering API thay vì reload trang [Shopify – khuyến nghị].

### 6. Search (6.3, 6.4)

- Click icon search trên header mở popup hoặc canvas search.
- Predictive search [Shopify – bắt buộc]; hiện loader trong lúc tải kết quả; debounce input [Shopify – khuyến nghị].
- Không có kết quả: hiện thông báo.

### 7. Tab và accordion (6.3)

- Click tab: show nội dung tab tương ứng, hide các tab khác; FE làm hiệu ứng nội dung chạy từ dưới lên.
- Trong theme editor: `block:select` mở tab/mục chứa block.

### 8. Sticky header và sticky cart (6.3)

- Sticky header: cuộn lên thì hiện, cuộn xuống thì ẩn.
- Sticky cart: hiện khi đã cuộn qua khối sản phẩm (form mua hàng).
- Phát hiện vị trí/hướng cuộn bằng listener passive + `requestAnimationFrame` hoặc throttle; không đọc layout liên tục trong mỗi sự kiện scroll.
- Gỡ listener trong `shopify:section:unload`.

### 9. Button loading (6.4)

- Khi click nút thực hiện request (add to cart, submit form, load more): bật trạng thái loading, khoá nút tới khi xong, tắt loading khi thành công hoặc lỗi.

### 10. Notification và toast (6.4)

- Toast hiện góc phải, tự ẩn sau vài giây; có thể có thanh tiến trình theo thời gian hiển thị.
- Nội dung toast đưa vào vùng `aria-live`.
- Lỗi quan trọng (vượt tồn kho) không chỉ nằm trong toast; hiển thị cả tại chỗ.

### 11. Load more, infinite scroll, lazy images (6.2)

- Collection, search, blog phải có pagination hoặc lazy loading [Shopify – bắt buộc]. Test checklist: chỉ hiển thị số lượng giới hạn sản phẩm khi tải đầu; pagination rút gọn khi có từ 5 trang trở lên; test nút View more và infinite scroll nếu có.
- Load more / infinite scroll lấy trang tiếp theo qua Section Rendering API, chèn item vào cuối mà không đẩy nội dung phía trên.
- Giữ pagination dưới 25.000 object [Shopify – khuyến nghị].

### 12. Zoom ảnh, rich media (6.2)

- Ảnh zoom độ phân giải cao chỉ tải khi người dùng kích hoạt zoom.
- 3D model: xem và xoay được trên desktop và mobile; nút "View in your space" trên mobile; thao tác phức tạp có cách tương đương bằng một lần click.
- Video: điều khiển truy cập được, mute/unmute, play/pause; media của variant hiện khi chọn variant.

### 13. Countdown timer (6.2)

- Chỉ đếm tới mốc thời gian thật merchant cấu hình [Shopify – bắt buộc: cấm countdown giả].
- Hết hạn: ẩn hoặc hiện trạng thái kết thúc; không tự reset.
- Huỷ interval khi section unload.

### 14. Variant picker (bắt buộc – Product page)

- Callback cập nhật giá, compare-at, unit price, thông báo sold out, media, SKU, pickup banner, Shop Pay Installments banner, inventory theo variant.
- Disable Add to cart và nút accelerated checkout với variant hết hàng/không tồn tại; gạch chéo hoặc disable option hết hàng trong selector.
- Không cho thêm vượt số lượng tồn; hiện lỗi.
- Cập nhật vùng `aria-live`.

### 15. Nghiệm thu

- Mở quickview → add to cart: quickview đóng xong mới mở mini cart, chỉ một overlay tại một thời điểm.
- Mini cart: update/remove item → progress bar đổi đúng %, tổng đúng, nút có loading.
- Sticky header ẩn/hiện đúng hướng cuộn; Performance panel không có long task do scroll handler.
- Infinite scroll không gây CLS; countdown không reset khi reload.
