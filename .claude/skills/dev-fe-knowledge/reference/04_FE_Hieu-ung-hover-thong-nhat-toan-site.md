# Hiệu ứng hover thống nhất toàn site

**Tiêu đề:** Hiệu ứng hover thống nhất toàn site
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev FE
**Nguồn:** Dev.xlsx nhóm "Trải nghiệm người dùng" mục 6.1 Hover Effects; shopify.dev Theme Store requirements (Theme design and UX – Consistency); shopify.dev Accessibility best practices; shopify.dev Performance best practices

---

## Nội dung

### 1. Vì sao (Dev.xlsx)

Trải nghiệm người dùng là USP của theme và quyết định tỷ lệ chuyển đổi. Giao diện không trực quan hoặc lỗi khi dùng thì khách rời trang và không quay lại.

Shopify cũng yêu cầu [Shopify – bắt buộc]: phần tử tương tác (button, link, form) dùng style, kích thước, màu và hành vi nhất quán ở mọi nơi trong theme.

### 2. Yêu cầu từng đối tượng [Nội bộ – DoD]

| Đối tượng | Yêu cầu trong Dev.xlsx | Ghi chú triển khai FE |
| - | - | - |
| Images | Hover ảnh trên product item, banner, blog có hiệu ứng phù hợp, thống nhất toàn site | Một kiểu hover ảnh dùng chung cho 3 nơi, khai báo một lần |
| Buttons | Chọn hiệu ứng hover button phù hợp, thống nhất toàn site. Tham khảo: https://preview.themeforest.net/item/salient-responsive-multipurpose-theme/full_screen_preview/4363266 | Mọi biến thể button (primary, secondary, link-button) cùng một hệ hover |
| Links | Hover link có gạch chân hoặc đổi màu, thống nhất toàn site | Chọn một kiểu và áp cho mọi link text |
| Banners/Sliders | Có thể đổi con trỏ sang bàn tay, hoặc FE tìm hiệu ứng đẹp hơn, thống nhất toàn site | Con trỏ bàn tay chỉ khi banner thật sự là link/click được |
| Navigation Menus | Làm setting chọn click hoặc hover. Hiệu ứng khi hover/click vào các cấp menu phải mượt. Tham khảo: https://sleek-glossy.myshopify.com/ | FE style cả 2 chế độ; setting do BE thêm vào schema, JS click do BE |
| Icons | Hover icon có hiệu ứng thống nhất toàn site | Một kiểu hover cho mọi icon header/footer/social |
| Product Cards | Hover card hiện button nếu có; hover ảnh hiện ảnh thứ hai có hiệu ứng; hover tên sản phẩm giống link (gạch chân hoặc đổi màu) | Tên sản phẩm dùng chung kiểu hover với Links |

### 3. Quy tắc kỹ thuật

1. **Một nguồn sự thật.** Thời lượng, easing, màu hover khai báo thành biến CSS dùng chung (ví dụ biến cho duration và easing), không viết số cứng trong từng section. Đổi một chỗ, cả site đổi.
2. **Chỉ animate `transform` và `opacity`** cho hiệu ứng hover ảnh, icon, card [Shopify – khuyến nghị: animate layout property gây relayout mỗi frame, hại INP].
3. **Không phụ thuộc hover để truy cập nội dung** [Shopify – khuyến nghị accessibility]. Hệ quả:
   - Button hiện khi hover product card phải truy cập được bằng bàn phím (hiện khi card hoặc button nhận focus) và dùng được trên thiết bị cảm ứng (không có hover).
   - Menu chế độ hover vẫn phải mở được bằng bàn phím qua nút `button` có `aria-expanded`.
4. **Hover luôn đi kèm focus.** Trạng thái hover và trạng thái focus của cùng phần tử phải tương đương về mức nhận biết; focus phải nhìn thấy [Shopify – bắt buộc].
5. **Tương phản ở trạng thái hover** vẫn đạt 4.5:1 cho chữ thường, 3:1 cho chữ lớn và icon.
6. **Hover ảnh không áp lên ảnh LCP theo cách che ảnh lúc tải.** Hiệu ứng hover chỉ chạy khi có tương tác, không đặt ảnh hero ở trạng thái ẩn ban đầu.
7. **Ảnh thứ hai của product card** chỉ tải khi cần (lazy), không tăng số ảnh tải ban đầu [Shopify – bắt buộc: ảnh chỉ tải khi cần].
8. **Nút cảm ứng** trong card (nút add/quick view) đạt kích thước touch target tối thiểu 24×24 px, khuyến nghị 44×44 px.

### 4. Bàn giao cho BE

- Navigation: FE cung cấp CSS cho 2 chế độ (mở bằng hover, mở bằng click) dựa trên một hook chung (ví dụ class chế độ trên container menu + `aria-expanded` trên nút). BE thêm setting chọn chế độ và JS xử lý click/bàn phím.
- Product card: FE cung cấp markup có sẵn chỗ cho ảnh thứ hai; BE xuất ảnh thứ hai trong Liquid nếu sản phẩm có.

### 5. Lưu ý về tính độc nhất của theme

Shopify ghi rõ: chỉnh animation/transition, đổi spacing, đổi màu/typography là thay đổi bề ngoài, không đủ để coi là khác biệt khi đánh giá uniqueness. Hover đẹp là điều kiện cần cho UX, không phải điểm khác biệt khi submit.

### 6. Nghiệm thu

- Rà toàn site: mọi link text cùng một kiểu hover; mọi button cùng hệ hover; mọi icon cùng hệ hover.
- Tab bằng bàn phím qua product card: nút ẩn hiện ra và bấm được.
- Mở trên thiết bị cảm ứng: không có chức năng nào chỉ dùng được bằng hover.
- Performance panel không ghi nhận layout/reflow do hover.
