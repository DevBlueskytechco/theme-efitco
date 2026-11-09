# Hiệu năng Liquid và JavaScript

**Tiêu đề:** Hiệu năng Liquid và JavaScript
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev BE
**Nguồn:** Dev.xlsx mục 5.1 Lighthouse performance (Giảm thiểu JavaScript, Performance Optimization, ngưỡng điểm); shopify.dev Performance best practices; shopify.dev Theme Store requirements mục Lighthouse

---

## Nội dung

### 1. Ngưỡng

| Chỉ số | Nội bộ – DoD | Shopify – bắt buộc |
| - | - | - |
| Performance Desktop | ≥ 98 (tiêu đề nhóm ghi ≥ 99) | Trung bình ≥ 60 trên home, product, collection, desktop và mobile, đo trên benchmark dataset |
| Performance Mobile | ≥ 90 | như trên |

Đo bằng Lighthouse trong Chrome DevTools. Section phải có ảnh và nội dung thật khi đo.

### 2. Quy tắc gốc về JavaScript [Nội bộ – DoD]

Ưu tiên HTML và CSS; JS chỉ là progressive enhancement khi không có giải pháp HTML/CSS. Với BE: trước khi viết JS cho một hành vi, hỏi FE đã giải quyết được bằng HTML/CSS chưa. Nội dung chính (giá, tiêu đề, mô tả, menu) luôn render bằng Liquid, không chèn bằng JS.

### 3. Chỉ số và nguyên nhân phía BE

| Chỉ số | Phía BE tác động |
| - | - |
| TTFB | Phần lớn là thời gian render Liquid. Khi Shopify stream response, TTFB của tool chỉ phản ánh phần `<head>`; phần Liquid còn lại nằm trong thời gian tải document |
| FCP | Script chặn render trong `<head>` |
| LCP | Nội dung chính render bằng JS; script app chặn render |
| INP | JS trên main thread: handler nặng, DOM lớn |

Đọc chênh lệch: server chậm → xem Liquid; server nhanh mà LCP chậm → xem phần việc phía trình duyệt.

### 4. Liquid [Shopify – khuyến nghị]

| Việc | Impact |
| - | - |
| Tránh vòng lặp Liquid lồng sâu (products × variants × options); đây là nguyên nhân phổ biến nhất của TTFB cao | High |
| Đưa truy cập metafield ra ngoài vòng lặp; tránh check metafield cấp variant trong loop; dữ liệu tĩnh dùng theme setting thay metafield | High |
| Không iterate toàn bộ variant khi chỉ cần dữ liệu render ban đầu | High |
| Giới hạn số item mảng fetch: `limit` của `for` giảm fetch cho `collection.products` và `collections`; mảng khác dùng `paginate` | High |
| Giới hạn độ sâu pagination dưới 25.000 object | Medium |
| Giảm lồng `render`/`include`, nhất là trong loop | Medium |
| Nội dung đắt trong dialog/drawer bọc điều kiện để chỉ load khi mở | Medium |
| Combined listing: dùng `product.options_with_values`, dữ liệu sản phẩm con lấy sau qua Section Rendering API | Medium |
| Lọc collection trước khi vào loop, tránh điều kiện trong loop | Medium |
| Đưa `assign` và filter lặp lại ra ngoài loop | Medium |
| Dùng `section.index` và `section.location` để phân biệt section trên/dưới màn hình đầu | Medium |
| Cập nhật động bằng Section Rendering API thay vì reload trang | Medium |
| Cache kết quả filter bằng `assign` | Low |
| Gán `block.settings` vào biến | Low |
| Dùng `echo` / `{{ }}` thay `append`, `prepend` | Low |

Công cụ: Shopify Theme Inspector for Chrome để tìm dòng Liquid chậm nhất trước khi tối ưu.

### 5. JavaScript [Shopify – khuyến nghị]

| Việc | Metric | Impact |
| - | - | - |
| Gỡ hoặc defer script app chặn render | LCP | High |
| Render nội dung thiết yếu bằng Liquid/HTML, không bằng JS | LCP | High |
| Nếu JS phải render nội dung trên màn hình đầu từ API ngoài: gửi request ngay khi script chạy, chỉ chờ DOM để render; load bundle `async` từ `<head>`, đặt trên `{{ content_for_header }}` nếu không đọc `Shopify.*` | LCP | High |
| Audit và gỡ script không dùng (app, pixel, code theme) | INP | High |
| `defer` cho script không quan trọng; `async` chỉ cho script bên thứ ba độc lập | LCP | High |
| Load JS khi người dùng tương tác: `import()` động trong event listener | INP | High |
| Gỡ anti-flicker snippet A/B test khi không chạy test | LCP | High |
| Defer CSS/JS chặn render không cần cho lần render đầu | LCP | Medium |
| Debounce, throttle, passive listener, `requestAnimationFrame` trong handler | INP | Medium |
| Huỷ view transition đang chạy khi người dùng tương tác | INP | Medium |
| Chỉ dựng DOM của component ẩn (filter panel, cart drawer, dialog) khi mở lần đầu | INP | Medium |
| Dùng import map với bare specifier thay bundler; Shopify tự include `es-module-shims`, không tự load bản khác | FCP | Low |

Ràng buộc Theme Store: không đưa file `.js` đã minify (trừ ES6 và thư viện bên thứ ba); script host trên server Shopify (trừ thư viện bên thứ ba được duyệt).

### 6. Thứ tự trong `<head>` [Shopify – khuyến nghị, High]

Stylesheet nền, font preload và import map đặt phía trên `{{ content_for_header }}` để trình duyệt tải trong lúc Shopify render section. Trước khi dời, kiểm tra script inline đọc `Shopify.*` và thứ tự cascade.

### 7. Resource hints và CDN [Shopify – khuyến nghị]

- Asset trong `/assets` để đi qua Shopify CDN.
- `preload` chỉ cho 1–2 tài nguyên phát hiện muộn.
- `preconnect` tới domain bên thứ ba quan trọng.
- Có thể dùng Speculation Rules API cho prefetch/prerender trang tiếp theo.
- Không đặt storefront sau reverse proxy.

### 8. Đo và giữ hiệu năng

- Chạy cùng benchmark Lighthouse mà Shopify dùng; import CSV performance test (https://shopify.dev/csv/theme-performance-shop-product-data.csv).
- Lighthouse CI GitHub action của Shopify để chặn regression điểm.
- Theme Check để bắt lỗi hiệu năng (bundle quá lớn, script chặn parser, asset remote) trước khi deploy.

### 9. Nghiệm thu

- Lighthouse Desktop ≥ 98, Mobile ≥ 90 trên home, product, collection với dữ liệu performance CSV.
- Theme Inspector: không có vòng lặp lồng products × variants trong template chính.
- Mọi `<script>` không quan trọng có `defer`; JS của component chỉ load khi cần.
- Không có file `.js` tự minify.
