# Nguyên tắc settings hướng merchant và basic requirements

**Tiêu đề:** Nguyên tắc settings hướng merchant và basic requirements
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx nhóm "Settings" mục 1.1 và 1.2; shopify.dev Theme Store requirements (Theme design and UX – Consistency; Settings – Basic requirements, Theme editor event requirements; Supporting your theme); shopify.dev Settings

---

## Nội dung

### 1. Mục tiêu (Dev.xlsx)

Settings dễ cấu hình để merchant thay đổi, điều chỉnh theme mà không sửa mã nguồn. Tăng tính linh hoạt, giúp merchant quản lý giao diện và trải nghiệm dễ hơn.
- Settings cho phép tuỳ chỉnh tính năng mà không cần kiến thức kỹ thuật.
- Mọi option cấu hình được qua Shopify Admin (theme editor).

Quy trình nội bộ (Dev.xlsx ô B2): nghiên cứu settings đáp ứng các tiêu chí và đưa lên file theo định dạng đã quy định (Google Sheet nội bộ, link trong ô B2).

### 2. Bốn tiêu chí 1.1 [Nội bộ – DoD]

| Tiêu chí | Yêu cầu | Cách BE đáp ứng |
| - | - | - |
| Tính trực quan | Hiểu và thao tác được trong Shopify Admin mà không cần đọc tài liệu Shopify hay biết lập trình. Không rối mắt | Nhóm setting bằng `header`; giải thích bằng `info`/`paragraph`; ẩn setting không liên quan bằng `visible_if`; nhãn theo text style và terminology của Shopify (file 02) |
| Tính linh hoạt | Thích ứng nhiều nhu cầu mà không cần dev can thiệp | Section/block cho phép thêm, xoá, sắp xếp; Custom Liquid section/block; app block; dynamic sources cho setting section/block |
| Đổi được mà không sửa mã nguồn | Mọi thay đổi cần thiết làm được qua Admin, không đụng Liquid/CSS/JS | Không hard-code text, màu, font, ảnh, link, số lượng hiển thị trong code; tất cả đi qua setting hoặc locale |
| Đổi không gây lỗi | Thay đổi áp dụng ngay, không gián đoạn trải nghiệm | Kiểm tra giá trị rỗng trước khi output; JS xử lý theme editor events (file 05); preview cập nhật ngay |

Shopify cũng yêu cầu tương tự [Shopify – bắt buộc – Theme design and UX]:
- Settings dùng ngôn ngữ đơn giản, thân thiện với merchant, nhóm hợp lý để tác vụ thường dùng tìm được mà không phải lục tìm.
- Đánh giá theo hướng merchant-first: tuỳ chỉnh trực quan, nhất quán; cân bằng giữa linh hoạt và opinionated.
- Tránh lồng block sâu không cần thiết hoặc cấu trúc cấu hình phức tạp khiến khó tìm control chính (mục Settings).

### 3. Basic requirements [Shopify – bắt buộc]

1. Mọi theme setting tuân thủ text style và terminology requirements (file 02).
2. Label và text thông tin đúng ngữ pháp, không lỗi chính tả.
3. Giá trị mặc định của setting nội dung section/block cho biết cách dùng setting đó. Không dùng Lorem Ipsum hay nội dung demo store làm placeholder.
4. Có setting favicon.
5. Upload logo hoạt động với ảnh nhiều tỉ lệ (ngang, dọc).
6. Mọi setting có `label`.
7. Mọi setting `link_list` trong Header/Footer có `default` là `main-menu` (header) hoặc `footer` (footer).
8. Giá trị mặc định của setting dạng resource (ví dụ `product`) phải trỏ tới resource có tồn tại.
9. Setting `metaobject` và `metaobject_list` chỉ dùng standard definition làm `metaobject_type`; không dùng custom hoặc app-owned definition.
10. Có section `theme_info` trong `settings_schema.json`.

Bổ sung từ mục Supporting your theme: file `.json` không chứa resource riêng của admin demo store (ví dụ custom metafield, URL bắt đầu bằng `shopify://`).

### 4. Theme editor event requirement [Shopify – bắt buộc]

Thay đổi trong theme editor phải phản ánh ngay trên preview. Dùng `request.design_mode` để xử lý riêng khi chạy trong editor. Chi tiết JS events ở file 05.

### 5. Đọc giá trị setting an toàn [Shopify – Settings]

- Truy cập: `settings.<id>` (global), `section.settings.<id>`, `block.settings.<id>`. Object `settings` dùng được trong Liquid asset.
- Setting không có default tự động có thể rỗng → chuỗi rỗng. Luôn kiểm tra trước khi output:

```liquid
{% unless section.settings.heading == blank %}
  <h2>{{ section.settings.heading }}</h2>
{% endunless %}
```

- Setting resource (product, collection, page, blog, article…) có thể rỗng do merchant chưa chọn, resource bị xoá hoặc bị ẩn:

```liquid
{% if section.settings.page != blank %}
  {{ section.settings.page.title }}
{% endif %}
```

### 6. Setting do platform quản lý [Shopify – Settings]

Theme editor có sẵn setting Custom CSS ở cấp theme và section. Theme không được thêm, ẩn, hay sửa giá trị setting này. Tuỳ biến CSS của theme đưa qua asset CSS, thẻ `{% stylesheet %}` và theme settings riêng.

### 7. Dịch settings [Shopify – Settings]

- Thuộc tính schema (`label`, `info`, text của option) dịch qua schema locale file.
- Giá trị merchant nhập ở setting text-bearing (`text`, `textarea`, `richtext`, `inline_richtext`, `html`) dịch bằng Translate & Adapt. Giá trị `liquid` không dịch được theo cách này.

Hệ quả: label/info trong schema đưa vào schema locale file để dịch được theo ngôn ngữ của store (cú pháp xem https://shopify.dev/docs/storefronts/themes/architecture/locales/schema-locale-files).

### 8. Nghiệm thu

- Merchant không biết code đổi được toàn bộ nội dung, màu, font, ảnh, link của từng section mà không mở code editor.
- Xoá giá trị từng setting về rỗng: không có lỗi Liquid, không có thẻ HTML rỗng.
- Đổi từng setting trong editor: preview cập nhật ngay, không phải reload.
- Có favicon, `theme_info`, `link_list` header/footer default đúng.
