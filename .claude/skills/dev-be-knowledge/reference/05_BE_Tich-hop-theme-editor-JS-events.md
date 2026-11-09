# Tích hợp theme editor: JavaScript events và design mode

**Tiêu đề:** Tích hợp theme editor: JavaScript events và design mode
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx mục 1.1 "Tính dễ dàng của việc thay đổi cài đặt mà không gặp lỗi", mục 1.2 "Theme editor event requirements"; shopify.dev Theme Store requirements (Theme editor event requirements); shopify.dev Integrate sections and blocks with the theme editor

---

## Nội dung

### 1. Yêu cầu

- [Nội bộ – DoD] Khi merchant đổi setting, không có lỗi; thay đổi áp dụng ngay, không gián đoạn trải nghiệm.
- [Shopify – bắt buộc] Thay đổi trong theme editor phải phản ánh trên preview. Dùng `request.design_mode` khi xử lý sự cố.

### 2. Vấn đề cần giải quyết

Khi merchant chỉnh section/block, HTML của nó được thêm, xoá hoặc render lại trực tiếp vào DOM, không reload trang. JavaScript chạy lúc tải trang sẽ không chạy lại. Hệ quả nếu không xử lý: slider không khởi tạo, drawer không mở, listener cũ còn treo gây rò bộ nhớ.

Ngoài ra, section/block đang được chọn phải hiện ra và giữ hiển thị trong lúc được chọn. Ví dụ Shopify nêu: slideshow phải cuộn vào khung khi section được chọn, chuyển tới slide là block được chọn, và dừng autoplay trong lúc block đó đang được chọn.

### 3. Điều kiện để editor nhận diện section/block

- Section được Shopify tự bọc phần tử có data attribute cần thiết.
- Block phải tự thêm bằng `{{ block.shopify_attributes }}` trên phần tử cha của block.
- Section và block muốn thêm được từ editor vào JSON template phải có `presets` trong schema.

### 4. Bảng sự kiện

Mọi sự kiện section/block đều bubble, không cancel được; `event.target` là phần tử section/block.

| Sự kiện | Khi nào | Việc phải làm |
| - | - | - |
| `shopify:section:load` | Section được thêm hoặc render lại | Chạy lại toàn bộ JS cần thiết cho section như khi trang vừa tải |
| `shopify:section:unload` | Section bị xoá hoặc sắp render lại | Gỡ listener, biến, timer, observer để không lỗi và không rò bộ nhớ |
| `shopify:section:select` | Merchant chọn section ở sidebar (detail: `sectionId`, `load`) | Editor tự cuộn tới section; đảm bảo section hiện và giữ hiện khi được chọn (mở drawer/popup nếu section là drawer/popup) |
| `shopify:section:deselect` | Bỏ chọn section | Trả về trạng thái bình thường (đóng popup mở tạm, chạy lại autoplay) |
| `shopify:section:reorder` | Section bị đổi thứ tự | Tính lại những gì phụ thuộc vị trí (ví dụ sticky) |
| `shopify:block:select` | Chọn block (detail: `blockId`, `sectionId`, `load`) | Đưa block vào khung và giữ hiện: chuyển slide, mở tab/accordion chứa block, dừng autoplay |
| `shopify:block:deselect` | Bỏ chọn block | Khôi phục trạng thái |
| `shopify:inspector:activate` | Bật preview inspector | — |
| `shopify:inspector:deactivate` | Tắt preview inspector | — |

`load` = `true` nếu sự kiện do render lại, `false` nếu do người dùng chọn.

Ví dụ tham chiếu chính thức: `assets/theme-editor.js` của Dawn — https://github.com/Shopify/dawn/blob/main/assets/theme-editor.js (chỉ tham khảo cách dùng sự kiện; theme nộp Theme Store không được xây trên Dawn).

### 5. Phát hiện môi trường editor

| Mục đích | Liquid | JavaScript |
| - | - | - |
| Đang trong theme editor | `request.design_mode` (true/false) | `Shopify.designMode` (true hoặc undefined) |
| Preview inspector đang bật | — | `Shopify.inspectMode` |
| Đang ở visual preview (xem preset khi thêm) | `request.visual_preview_mode` | `Shopify.visualPreviewMode` |

Cách dùng:
- Tắt hành vi gây khó chỉnh sửa trong editor: ví dụ popup tự bật khi tải trang, autoplay — chỉ chạy khi không ở design mode, còn trong editor thì mở theo `section:select` / `block:select`.
- Visual preview: mở sẵn trạng thái giúp merchant thấy nội dung (Shopify nêu ví dụ mở sẵn accordion).
- Theme không được chứa JS can thiệp hoặc thay đổi tính năng native của Shopify trong theme editor hoặc Shopify admin [Shopify – bắt buộc – Consistency and functionality].

### 6. Mẫu tổ chức code đề xuất

Mỗi component JS có 2 hàm `init(root)` và `destroy(root)`:
- Trang tải: gọi `init` cho mọi instance.
- `shopify:section:load`: gọi `init` cho phần tử trong `event.target`.
- `shopify:section:unload`: gọi `destroy` cho phần tử trong `event.target`.
- `select`/`deselect`: gọi method mở/đóng/dừng của component tương ứng.

(Đây là cách tổ chức đề xuất để đáp ứng bảng sự kiện ở mục 4, không phải API của Shopify.)

### 7. Áp dụng cho component UX trong Dev.xlsx

| Component | `select` | `deselect` / `unload` |
| - | - | - |
| Slideshow / banner slider | Cuộn tới, chuyển tới slide được chọn, dừng autoplay | Chạy lại autoplay / huỷ timer |
| Popup, modal, newsletter popup | Mở popup để merchant thấy | Đóng |
| Mini cart drawer, search canvas | Mở drawer nếu section là drawer | Đóng, gỡ focus trap |
| Mega menu | Mở submenu chứa block | Đóng |
| Tab / accordion | Mở tab/mục chứa block | — |
| Sticky header/cart | — | Gỡ scroll listener, observer |
| Countdown | — | Huỷ interval |

### 8. Nghiệm thu

- Trong editor: thêm, xoá, đổi thứ tự, đổi setting từng section — JS vẫn chạy, không lỗi console.
- Thêm/xoá section có slider 10 lần liên tiếp: không tăng listener/timer treo.
- Chọn từng block slide: slide chuyển đúng, autoplay dừng; bỏ chọn: autoplay chạy lại.
- Chọn section popup/drawer: popup/drawer mở ra trong preview.
