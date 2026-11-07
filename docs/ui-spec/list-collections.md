KHÔNG CHẮC: Figma không có trang này, bố cục là ĐỀ XUẤT suy từ khối Browse Categories 1:395; store dev kẹt password nên chưa so với storefront.

# UI spec: danh sách collection (ES1-T240, TE-6 AC5)

Mockup: `drafts/designer/ES1-T240/list-collections.html`, PNG `list-collections-360/768/1280/1920.png`. Trang collection: `docs/ui-spec/collection.md`.

## Mục đích

Khách thấy mọi collection của shop và vào đúng collection. AC5: title + `collection.featured_image`, phân trang.

## Figma node

Không có frame riêng. Dùng lại card 1:404 (ảnh 336/220, bo 16), 1:405 (tiêu đề 700, 28/34, -0.56), header 1:362, footer 1:1104.

## Anatomy

1. Header, nền tối như trang chủ.
2. Band tối: breadcrumb (ĐỀ XUẤT), h1 `collections.title`.
3. Lưới card: ảnh + tiêu đề, cả card là một link.
4. Phân trang: `snippets/pagination`, chỉ khi trên 24 collection.
5. Footer.

## Settings merchant

Không có. Template không có setting, danh sách và ảnh đến từ Shopify. Không thêm số sản phẩm vì Figma 1:395 không có.

## Layout

| Breakpoint | Nội dung | Cột | Rộng card | Khoảng cách (cột, hàng) |
| --- | --- | --- | --- | --- |
| 360 | 320 | 2 | 152 | 16, 24 |
| 768 | 728 | 3 | 232 | 16, 24 |
| 1280 | 1240 | 4 | 292 | 24, 40 |
| 1920 | 1416 | 4 | 336 | 24, 40 |

Band tối: padding đáy 48, từ 80rem là 60. Vùng lưới: trên 24, dưới 48; từ 64rem trên 60, dưới 120. Ảnh cách tiêu đề 12.

## Trạng thái

Không có trong Figma, tất cả là ĐỀ XUẤT.

| Trạng thái | Hiển thị |
| --- | --- |
| Không có collection | Giữ band tiêu đề; text `collections.empty`, không nút |
| Có `item.image` | Ảnh merchant, `object-fit: cover`, focal point |
| Không có `item.image` | `featured_image` thường là ảnh sản phẩm: `object-fit: contain` trên `--figma-f5f5f1`, không cắt mất sản phẩm |
| Không có ảnh nào | Khung nền `--color-background-dark`, theo mục Images của DESIGN.md (code hiện dùng placeholder svg) |
| Loading | Không có: trang server render, chuyển trang bằng link thường, không có partial |
| Lỗi | Không có trạng thái riêng ở theme |
| Hover | Ảnh scale 1.04 với `--motion-slow`, tiêu đề gạch chân; trong `prefers-reduced-motion: no-preference` |
| Focus | Vòng 2px currentColor, offset 2px quanh cả card |

## Accessibility

- Tiêu đề #1A1A1A trên trắng 17.4:1. Breadcrumb #999999 trên #1A1A1A 6.1:1. Tính tay theo công thức WCAG.
- Cả card là link cao hơn 44. Ảnh `alt=""` vì tiêu đề đã đặt tên cho link, đúng như code hiện tại.
- Một h1; tiêu đề card h2. Breadcrumb `nav` có `aria-label`, mục cuối `aria-current="page"`.
- Ảnh đầu trang lazy theo code hiện tại. ĐỀ XUẤT: hàng card đầu eager vì trang không có banner, cần Dev FE kiểm LCP bằng lhci.

## Token dùng

`--figma-1a1a1a`, `--figma-e5e5e5`, `--figma-f4f4f5`, `--figma-f5f5f1`, `--figma-ffffff`, `--color-background-dark`, `--color-muted-on-dark`, `--figma-radius-8`, `--figma-radius-16`, `--font-size-display`, `--font-size-h3`, `--space-*`, `--motion-slow`, `--ease-out`. Không thêm token.

## Map sang block

| Phần | File | Việc | Phía |
| --- | --- | --- | --- |
| Band tiêu đề | `templates/list-collections.liquid`, CSS | Tách h1 sang container nền tối | FE |
| Breadcrumb | `snippets/breadcrumb` (mới, chung với trang collection) | ĐỀ XUẤT | FE |
| Card | `templates/list-collections.liquid`, CSS | Ảnh đổi 336/270 thành 336/220 và bo 16 đúng Figma 1:404; tiêu đề heading 28/34; quy tắc cover và contain | FE |
| Lưới | CSS `.list-collections__grid` | Giữ 2, 3, 4 cột; chỉnh gap | FE |
| Phân trang | `snippets/pagination` | Dùng chung style với trang collection | FE |

Giữ `list-collections`, `list-collections-card`, `list-collections-card-title`. Không có JS, không thêm block.

## Ghi chú dữ liệu mockup

6 tên collection lấy từ ticket. Ticket không có ảnh collection nên mockup mượn ảnh sản phẩm để mô phỏng `featured_image`; cặp ảnh và collection là ví dụ. Ảnh `efx-prod-P04.jpg` có sẵn vệt khung ở góc trong file ảnh, không phải lỗi card.

## 3 quyết định CTO cần chốt

1. Nền lưới: trắng hay tối như Browse Categories 1:395? Đề xuất trắng, band tối chỉ ở đầu trang: cùng nhịp với trang collection và tránh dính liền footer tối.
2. Ảnh card: 336/220 theo Figma 1:404 hay giữ 336/270 trong code và DESIGN.md? Đề xuất 336/220: Figma đo trực tiếp ảnh là 220, còn 270 là cả ảnh và tiêu đề; cần sửa dòng tương ứng ở DESIGN.md.
3. Có hiện collection All trong danh sách không? Đề xuất hiện nếu Shopify trả về, vì ticket liệt kê All là collection thật; muốn ẩn thì lọc theo handle trong template.
