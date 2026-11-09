# Accessibility ở mức markup và CSS

**Tiêu đề:** Accessibility ở mức markup và CSS
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev FE
**Nguồn:** Dev.xlsx mục 5.2 (Keyboard and gesture controls, Structure, Accessibility requirements, Accessibility score, Tools testing); shopify.dev Theme Store requirements mục Accessibility; shopify.dev Accessibility best practices

---

## Nội dung

### 1. Ngưỡng và công cụ [Nội bộ – DoD]

- Lighthouse Accessibility = 100, SEO = 100, Best Practices = 100 trên cả desktop và mobile.
- Accessibility Insights for Web: pass, không lỗi — https://accessibilityinsights.io/
- WAVE: pass, không lỗi — https://wave.webaim.org/
- W3C HTML checker: pass — https://validator.w3.org/nu/#textarea

Shopify yêu cầu tối thiểu trung bình 90 điểm accessibility trên home, product, collection (desktop và mobile). Team đặt 100.

### 2. Accessibility requirements bắt buộc của Shopify [Shopify – bắt buộc]

Danh sách hiện hành trên shopify.dev (Dev.xlsx liệt kê 7 mục đầu; Shopify đã có thêm 2 mục tương phản màu và touch target — áp dụng đủ 9):

1. Mọi phần của trang truy cập được bằng bàn phím, kể cả dropdown navigation.
2. Khi điều hướng bằng bàn phím, phần tử focus được phải có focus state nhìn thấy.
3. Mọi ảnh có thuộc tính `alt`. Ảnh sản phẩm dùng `image.alt` hoặc `image_url | image_tag: alt: …`.
4. Input trong form có ID duy nhất, label có `for` khớp ID input.
5. Theme dùng HTML hợp lệ.
6. Tương phản màu chữ nội dung chính 4.5:1. Chữ lớn hơn 18pt và phần tử không phải chữ (border, icon) 3:1.
7. Thứ tự focus bàn phím khớp thứ tự DOM, đi từ trên xuống dưới, trái sang phải.
8. Touch target cho con trỏ tối thiểu 24×24 CSS px (không áp dụng cho text inline trong đoạn văn và các ngoại lệ WCAG 2.2).
9. Heading `h1`–`h6` phải khác nhau về mặt thị giác.

### 3. Cấu trúc trang [Shopify – khuyến nghị]

Global
- `<html>` có `lang` (Shopify bắt buộc ở mục Layout: `lang="{{ request.locale.iso_code }}"`).
- Không chặn zoom: không dùng `maximum-scale` và `user-scalable="no"` trong viewport.
- Có skip link, hiện ra khi được focus, nhảy tới nội dung chính. Container nội dung chính có `tabindex="-1"`.
- Không dùng `tabindex` khác `0` hoặc `-1`, không dùng `autofocus`.

Heading
- Dùng thẻ heading thật để thể hiện cấu trúc nội dung, theo đúng thứ tự cấp.
- Không dùng heading để tạo kiểu chữ; muốn chữ to thì dùng class.
- `h1` thể hiện chủ đề chính của trang.

Navigation
- Vùng điều hướng bọc trong `<nav>`.
- Trang hiện tại đánh dấu `aria-current`.
- Không dùng `role="menu"` hay `role="menuitem"` cho navigation.

Dropdown menu (phần markup FE)
- Nút mở dropdown là `button`, có `aria-expanded` và `aria-controls` trỏ tới container submenu.
- CSS hiển thị submenu bám theo `aria-expanded="true"` để BE chỉ cần đổi thuộc tính.

Thông tin sản phẩm
- Giá sale và giá gốc phân biệt cả về thị giác và markup: có text ẩn trực quan (visually hidden) cho screen reader phân biệt giá thường và giá khuyến mãi.
- Vùng giá/tình trạng thay đổi theo variant có sẵn container `aria-live` để BE cập nhật.

Controls
- `a` cho điều hướng / tải trang mới / chuyển focus tới phần tử khác. `button` cho hành động trên màn hình (mở modal, sắp xếp).
- Text link tự nói rõ đích đến.
- Link mở cửa sổ mới có icon cảnh báo kèm text thay thế.

Bảng
- `table` cho dữ liệu dạng bảng, có `caption`.
- Header dùng `th` với `scope="col"` cho cột, `scope="row"` cho hàng.

Form
- Mọi field có label (label hiển thị, floating label, `.visuallyhidden` hoặc `aria-label`). Tên field nói rõ mục đích.
- Label có `for`, kể cả form trong theme settings.
- Field bắt buộc có `required`.
- Field có `autocomplete`.
- Có sẵn container thông báo lỗi để `aria-describedby` của input trỏ tới.

### 4. Media

- Mọi `img` có `alt`. Ảnh nội dung/sản phẩm có alt mô tả. Ảnh trang trí dùng `alt=""`.
- Media không tự phát. Nếu bắt buộc autoplay (video trong slideshow) thì tắt tiếng.
- Control media dùng phần tử HTML native; nút có trạng thái toggle, thanh trượt dùng range input.
- Video có phụ đề và audio mô tả; video có tiếng không bị che.
- Audio có transcript; audio tự phát phải dừng được.

### 5. Màu và tương phản [Shopify – khuyến nghị]

- Chữ < 24px (thường) hoặc < 18.5px (đậm): 4.5:1 so với nền.
- Chữ ≥ 24px (thường) hoặc ≥ 18.5px (đậm): 3:1.
- Icon: 3:1. Border của input: 3:1.
- Không dùng màu làm dấu hiệu duy nhất để truyền thông tin.

Vì color scheme do merchant đổi được, FE kiểm tra tương phản trên mọi color scheme mặc định của theme và preset.

### 6. Focus state

- Focus indicator nhìn thấy và nhất quán trên mọi phần tử tương tác, cả khi dùng chuột lẫn bàn phím (best practice), bắt buộc nhìn thấy khi dùng bàn phím (requirement).
- Không `outline: none` mà không thay bằng kiểu focus khác.

### 7. Component động (markup FE, hành vi BE)

- Drawer/modal: container có `role="dialog"`, có phần tử đặt tên cho dialog (để BE chuyển focus vào), có nút đóng.
- Slideshow: có nút next/previous và nút dừng/phát nếu có autoplay.

### 8. Touch target [Shopify – khuyến nghị]

Primary touch target tối thiểu 44×44 px: link menu chính (mọi cấp), nút submit của form (contact, comment, search, add to cart), nút mở cart và hamburger, nút đóng modal, lựa chọn variant/option (màu, size, số lượng). Trang performance của Shopify khuyến nghị 48×48 px trên mobile. Tối thiểu bắt buộc là 24×24 px.

### 9. Gesture

- Pinch to zoom luôn dùng được.
- Thao tác cần nhiều ngón hoặc cử chỉ phức tạp (ví dụ xoay 3D model) phải có cách tương đương bằng một lần chạm/click.

### 10. Nghiệm thu FE

- W3C checker không lỗi trên các template chính.
- Tab qua toàn trang: focus luôn nhìn thấy, thứ tự đúng DOM.
- Lighthouse Accessibility 100; Accessibility Insights và WAVE không lỗi.
- Kiểm tương phản trên từng color scheme.
