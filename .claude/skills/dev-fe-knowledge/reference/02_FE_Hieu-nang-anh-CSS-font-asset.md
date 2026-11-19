# Hiệu năng phía FE: ảnh, CSS, font, asset

**Tiêu đề:** Hiệu năng phía FE: ảnh, CSS, font, asset
**Loại:** Quy tắc
**Áp dụng cho:** Agent Dev FE
**Nguồn:** Dev.xlsx mục 5.1 "Lighthouse performance" và "Performance Optimization"; shopify.dev Theme Store requirements (mục Lighthouse, Assets, Responsive images); shopify.dev Performance best practices

---

## Nội dung

### 1. Ngưỡng phải đạt

| Chỉ số | Nội bộ – DoD (Dev.xlsx) | Shopify – bắt buộc |
| - | - | - |
| Lighthouse Performance Desktop | ≥ 98 (tiêu đề nhóm trong file ghi ≥ 99) | Trung bình ≥ 60 trên home, product, collection, cả desktop và mobile |
| Lighthouse Performance Mobile | ≥ 90 | (như trên) |
| Lighthouse SEO / Accessibility / Best Practices | = 100 cả desktop và mobile | Accessibility trung bình ≥ 90 |

Đo bằng Lighthouse trong Chrome DevTools: https://developer.chrome.com/docs/lighthouse/overview?hl=vi#devtools

Khi đo, các section phải có ảnh và nội dung thật, không để trống [Shopify – bắt buộc].

### 2. Các chỉ số team theo dõi (Dev.xlsx) và ý nghĩa theo Shopify

| Chỉ số | Ý nghĩa | Phía FE tác động bằng |
| - | - | - |
| TTFB | Thời gian chờ byte đầu tiên; trên Shopify phần lớn là thời gian render Liquid | Ít (chủ yếu BE) |
| FCP | Lần vẽ text/ảnh đầu tiên; thường trễ vì stylesheet/script chặn render trong `<head>` | Số lượng và vị trí stylesheet |
| LCP | Phần tử lớn nhất trong viewport đầu render xong, thường là ảnh hero/ảnh sản phẩm | Cách khai báo ảnh LCP |
| CLS | Nội dung nhảy khi tải; nguyên nhân thường gặp: ảnh thiếu kích thước, font swap muộn, nội dung app chèn vào | Kích thước ảnh, font fallback, giữ chỗ |
| INP | Độ trễ phản hồi sau khi chạm/click; chủ yếu do JS trên main thread | Số stylesheet, animation thuộc tính layout, kích thước DOM |

LCP, CLS, INP là Core Web Vitals.

### 3. Ảnh

[Shopify – bắt buộc] Ảnh phải theo chiến lược responsive image (ngoại lệ: ảnh nhỏ như icon). Ảnh chỉ tải khi cần, giảm số ảnh tải ban đầu mỗi trang.

[Shopify – khuyến nghị, impact High]
- Không bao giờ lazy-load ảnh LCP. `loading="lazy"` chỉ dùng cho ảnh ngoài viewport đầu. Ảnh trong viewport đầu tải eager.
- Đặt `fetchpriority="high"` cho ảnh LCP.
- Không giấu ảnh LCP sau animation (fade-in, reveal). Animation làm trễ sự kiện LCP dù ảnh đã tải xong.
- Không dùng CSS `background-image` cho hero/LCP, dùng `<img>` để preload scanner phát hiện sớm.

[Shopify – khuyến nghị, impact Medium]
- Dùng filter `image_url` và `image_tag`, không tự ghép URL CDN. `image_tag` tự sinh `srcset`, tự thêm `width`/`height` chống layout shift.
- Khai báo `srcset` và `sizes` đúng để tải ảnh nhỏ nhất vẫn đẹp ở mỗi viewport.
- Luôn có `width` và `height` trên `<img>` (hoặc dùng `image_tag`).
- Ảnh khác nhau giữa mobile/desktop dùng `<picture>`.
- Dialog/popup không được lớn hơn nội dung chính, tránh trở thành phần tử LCP.

Focal point [Shopify – bắt buộc ở mục Features]: theme phải tôn trọng focal point merchant chọn. Cách làm theo Shopify: render bằng `image_tag` (tự thêm `object-position` theo focal point) và đặt ảnh trong container với `object-fit: cover`.

Phân biệt ảnh trên/dưới màn hình đầu: BE cung cấp `section.index` / `section.location` để FE quyết định `loading` và `fetchpriority` (Shopify – "Load above-the-fold and below-the-fold sections differently with section.index").

### 4. CSS

[Shopify – bắt buộc – mục Assets]
- Không dùng Sass, không có file `.scss` hoặc `.scss.liquid`. Chỉ CSS native trong `.css` hoặc `.css.liquid`.
- Không đưa file `.css` đã minify vào theme (trừ thư viện bên thứ ba). Shopify tự minify CSS khi storefront request.

[Shopify – khuyến nghị]
- Giảm số stylesheet: mỗi thẻ `<link>` stylesheet thêm một lần style recalculation, chặn INP (High).
- CSS cho nội dung trong viewport đầu tải đồng bộ; chỉ dùng pattern async CSS cho section ngoài viewport đầu khi đo thấy có lợi (High).
- Đặt stylesheet nền, font preload phía trên `{{ content_for_header }}` để trình duyệt tải trong lúc Shopify render section (High). Kiểm tra thứ tự cascade trước khi dời.
- Animate bằng `transform` và `opacity` (Medium).
- Tương thích stylesheet subsetting: Shopify tự cắt CSS trong thẻ `{% stylesheet %}` theo render tree của từng trang. Class của file nào chỉ dùng trong file đó hoặc file nó trực tiếp render (Medium).
- Giữ chỗ cho nội dung app chèn vào bằng App Block có `min-height` để tránh CLS (Medium).

### 5. Font

[Shopify – bắt buộc – mục Font picker] (phần setting do BE làm, FE phải load đúng):
- Mọi font dùng setting type `font_picker`, không nhận custom font.
- File CSS load đủ biến thể bold, italic, bold-italic cho mỗi font bằng filter `font_modify`.

Cách load font từ thư viện Shopify: `font_face` để in `@font-face` mặc định; `font_url` để lấy URL CDN tự viết `@font-face`; `font_modify` để lấy biến thể cùng họ.

[Shopify – khuyến nghị]
- Giảm CLS do font swap: dùng `size-adjust` và các descriptor override trên font fallback để khớp metric web font (High).
- System font giúp bỏ bước tải font trước khi render text (Medium). Merchant chọn được qua nhóm System fonts trong font picker.

### 6. Asset và đường dẫn

- Asset đặt trong thư mục `/assets` để phục vụ qua Shopify CDN [Shopify – khuyến nghị].
- Link asset bằng URL protocol-relative, không hard-code `http`/`https` [Shopify – bắt buộc – mục Consistency and functionality].
- Dùng `preload` tối đa 1–2 tài nguyên trình duyệt phát hiện muộn; lạm dụng làm trang chậm hơn [Shopify – khuyến nghị].

### 7. Mobile

[Shopify – khuyến nghị]
- Không có nội dung rộng hơn viewport, không cuộn ngang.
- Không dùng interstitial toàn màn hình che nội dung chính khi tải trang.
- Nội dung ẩn trên mobile bằng CSS vẫn bị index mobile-first, cần giữ content parity.

### 8. Nghiệm thu FE

- Lighthouse Performance Desktop ≥ 98, Mobile ≥ 90 trên home, collection, product với dữ liệu thật.
- Ảnh LCP: không có `loading="lazy"`, có `fetchpriority="high"`, không nằm trong animation, không phải background-image.
- Mọi `<img>` có `width`/`height`.
- Không có `.scss`, không có `.css` minify do team tự viết.
