# Loading animation và chuyển trạng thái

**Tiêu đề:** Loading animation và chuyển trạng thái (State Transitions)
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev FE
**Nguồn:** Dev.xlsx mục 6.2 Loading Animation, 6.3 State Transitions; shopify.dev Performance best practices; shopify.dev Accessibility best practices; shopify.dev Theme Store requirements (Consistency and functionality, Collection page requirements)

---

## Nội dung

### 1. Yêu cầu chung [Nội bộ – DoD]

Trích Dev.xlsx: Loading animation "đồng bộ tất cả các trang, đặc biệt không được giật lag, tải nặng mang đến trải nghiệm kém cho người dùng". Mọi mục đều kèm điều kiện: "Smooth, mượt mà, tối ưu khi tải, phù hợp và thống nhất toàn site".

Diễn giải thành quy tắc kỹ thuật:
- Một bộ animation dùng chung (thời lượng, easing, kiểu xuất hiện) khai báo một lần bằng biến CSS.
- Chỉ animate `transform` và `opacity` [Shopify – khuyến nghị].
- Animation không được làm giảm điểm Performance dưới ngưỡng DoD (Desktop ≥ 98, Mobile ≥ 90).

### 2. Loading Animation (6.2)

| Đối tượng | Yêu cầu Dev.xlsx | Ràng buộc kỹ thuật |
| - | - | - |
| Hình ảnh sản phẩm | Mượt, tối ưu khi tải | Ảnh LCP không có fade-in/reveal, không lazy, có `fetchpriority="high"` [Shopify – khuyến nghị, High]. Hiệu ứng tải chỉ cho ảnh ngoài viewport đầu |
| Popup và Modal | Mượt khi tải | Popup không lớn hơn nội dung chính để không thành phần tử LCP; không bật interstitial toàn màn hình khi tải trang [Shopify – khuyến nghị] |
| Load More Button | Mượt khi tải | FE style trạng thái loading của nút; sản phẩm mới chèn vào không làm nhảy nội dung phía trên |
| Countdown timer | Mượt khi tải | Xem mục 4 – chỉ dùng cho hạn thật do merchant cấu hình |
| Infinite scroll | Mượt khi tải | Collection, search, blog bắt buộc dùng pagination hoặc lazy loading [Shopify – bắt buộc]; FE giữ chỗ cho item đang tải để không gây CLS |
| Lazy Images | Mượt khi tải | Có `width`/`height` (hoặc `image_tag`) để giữ đúng khung; `loading="lazy"` chỉ cho ảnh ngoài viewport đầu |
| Zoom ảnh trang chi tiết | Mượt khi tải | Ảnh zoom độ phân giải cao chỉ tải khi người dùng kích hoạt zoom |

### 3. State Transitions (6.3)

| Đối tượng | Yêu cầu Dev.xlsx | Phần FE làm |
| - | - | - |
| Show/Hide Navigation Menus | Thêm border hoặc đổi màu khi click active menu; mượt | Style trạng thái active + `aria-current`; transition mở/đóng submenu theo `aria-expanded` |
| Popup, Modal, Canvas | Không xuất hiện cùng lúc trên màn hình. Ví dụ: đang mở quickview, bấm add to cart thì đóng quickview trước rồi mới mở mini cart canvas | Animation đóng/mở cho từng loại; đảm bảo animation đóng hoàn tất trước animation mở (BE điều phối thứ tự bằng JS) |
| Tab và Accordion | Click tab thì show/hide content theo tab, nội dung chạy từ dưới lên | Keyframe trượt từ dưới lên bằng `transform` + `opacity` |
| Search Bar | Click icon search trên header mở popup hoặc canvas search | Style cả hai dạng; hướng mở canvas thống nhất với các canvas khác |
| Mini Cart | Click icon cart trên header mở mini cart dạng canvas | Canvas mở từ phải sang trái (cùng quy ước với quickview canvas) |
| Quickview dạng popup | Hiện: zoom in hoặc trái sang phải. Ẩn: zoom out hoặc phải sang trái | Chọn một cặp và dùng thống nhất |
| Quickview dạng canvas | Hiện: phải sang trái. Ẩn: trái sang phải | Như trên |
| Sticky cart | Cuộn qua khối sản phẩm thì hiện sticky cart | Style + transition hiện/ẩn; BE phát hiện vị trí cuộn |
| Sticky header | Cuộn lên hiện sticky, cuộn xuống ẩn | Transition bằng `transform` (trượt theo trục dọc), không đổi `top`/`height`; BE phát hiện hướng cuộn |

### 4. Countdown timer – lưu ý bắt buộc [Shopify – bắt buộc]

Theme không được đánh lừa merchant hoặc khách bằng dữ liệu giả: Shopify nêu ví dụ "fictitious countdown timers, stock levels, or viewer activity counts". Countdown chỉ hiển thị mốc thời gian thật do merchant nhập; không tự reset, không đếm giả. FE chỉ lo hiển thị mượt; logic thời gian là của BE.

### 5. Ràng buộc accessibility khi làm transition

- Drawer/modal: khi mở, focus chuyển tới phần tử đặt tên dialog; Esc đóng và trả focus về nút mở; focus bị giữ trong dialog [Shopify – khuyến nghị]. FE dựng markup có `role="dialog"` và phần tử tiêu đề; BE viết JS focus.
- Slideshow tự chạy phải dừng được [Shopify – khuyến nghị].
- Không đổi ngữ cảnh đột ngột khi phần tử nhận focus.

### 6. Hiệu năng của component ẩn

Filter panel, cart drawer, dialog có thể thêm hàng nghìn node DOM dù đang đóng. Shopify khuyến nghị chỉ dựng DOM khi mở lần đầu (impact Medium, phía JS) và dùng điều kiện trong Liquid để nội dung dialog đắt chỉ load khi mở. FE thiết kế markup canvas/modal sao cho phần khung (overlay, header, nút đóng) tách khỏi phần nội dung có thể nạp sau.

### 7. Bàn giao cho BE

Với mỗi component có transition, FE ghi rõ:
- Các trạng thái: đóng, đang mở, mở, đang đóng (nếu có).
- Hook để bật trạng thái (class hoặc thuộc tính ARIA).
- Thời lượng animation (biến CSS) để BE chờ đóng xong rồi mở component tiếp theo.

### 8. Nghiệm thu

- Mở quickview rồi add to cart: chỉ một lớp overlay trên màn hình tại mọi thời điểm.
- Hướng trượt của mọi canvas thống nhất.
- Ảnh hero không có animation khi tải; Lighthouse không báo LCP bị trễ do render.
- Infinite scroll/load more không gây CLS khi chèn item mới.
