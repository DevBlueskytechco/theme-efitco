KHÔNG CHẮC: Figma không có trang này, toàn bộ bố cục là ĐỀ XUẤT suy từ trang chủ. assets/collection-filters.js không có trong working tree nên hành vi JS chưa kiểm được; store dev kẹt password nên chưa so với storefront. Hỏi ở ES1-T246.

# UI spec: trang collection (ES1-T240, TE-6)

Mockup: `drafts/designer/ES1-T240/collection.html`, PNG `collection-360/768/1280/1920.png`. Danh sách collection: `docs/ui-spec/list-collections.md`.

## Mục đích

Khách xem sản phẩm của một collection, lọc theo tình trạng, giá, loại, hãng, option, sắp xếp và chuyển trang (TE-6 AC1 đến AC4). Không đổi luồng nghiệp vụ, không thêm setting ngoài SRS.

## Figma node

Không có frame riêng. Dùng lại: 1:362 header, 1:422 khung hero, 1:496 tab, 1:502 product card, 1:405 kiểu tiêu đề 28/34, 1:1104 footer.

## Anatomy

1. Header: `blocks/header`, nền `--figma-1a1a1a` + `noise-dark.png` như trang chủ.
2. Band tối: breadcrumb (ĐỀ XUẤT), banner.
3. Banner: khung bo góc, ảnh `collection.image` (focal), scrim, h1, mô tả.
4. Cột filter (từ 64rem) hoặc drawer (dưới 64rem): tiêu đề, các nhóm `<details>`, Clear all, Apply.
5. Toolbar: nút Filter + badge số (dưới 64rem), số sản phẩm, Sort by.
6. Chip filter đang chọn + Clear all (ĐỀ XUẤT).
7. Lưới product card: `snippets/product-card`, không sửa. Card không có nút Add To Cart vì Figma 1:502 không có.
8. Phân trang: `snippets/pagination`.
9. Footer: `blocks/footer`.

## Settings merchant

Không thêm setting. Giữ 2 setting đang có trong `blocks/collection-products`:

| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Columns on desktop | select | 4 (ĐỀ XUẤT đổi 3, xem quyết định 1) | 2, 3, 4 |
| Columns on mobile | select | 2 | 1, 2 |

Tiêu đề, mô tả, ảnh banner sửa trong admin collection. Filter do Search and Discovery quyết định. Sort mặc định là `collection.default_sort_by`, không có setting (ES1-T106).

## Layout

| Breakpoint | Nội dung | Filter | Cột lưới | Rộng card | Khoảng cách lưới (cột, hàng) | Khung banner |
| --- | --- | --- | --- | --- | --- | --- |
| 360 | 320 | Drawer 100% | 2 | 152 | 16, 24 | min 320, lề 20, bo 16 |
| 768 | 728 | Drawer 28rem | 3 | 232 | 16, 24 | min 340, lề 20, bo 16 |
| 1024 | 984 | Cột trái 228 | 3 | 228 | 24, 24 | min 340, lề 20, bo 16 |
| 1280 | 1240 | Cột trái 292 | 3 | 292 | 24, 40 | min 420, lề 60, bo 24 |
| 1920 | 1416 | Cột trái 336 | 3 | 336 | 24, 40 | min 420, lề 60, bo 24 |

- ĐỀ XUẤT: từ 64rem dùng `repeat(4, minmax(0, 1fr))`, gap 24; cột filter chiếm 1 cột, kết quả chiếm 3. Ở 1920 ra đúng 336 + 24 + 1056 = 1416, card đúng cỡ Figma 1:502. Code đang là `3fr 9fr`, card chỉ còn khoảng 243 nếu giữ 4 cột.
- Toolbar dưới 48rem: Filter và Sort mỗi bên 1 cột, nhãn Sort by ẩn bằng visually-hidden, số sản phẩm xuống hàng dưới. Từ 48rem: Filter, số sản phẩm, Sort canh cuối. Từ 64rem nút Filter ẩn.
- Band tối cách vùng chính: padding đáy 24 dưới 80rem, 60 từ 80rem. Vùng chính: trên 24, dưới 48 dưới 64rem; trên 60, dưới 120 từ 64rem.
- Chữ banner ở 1920 thẳng mép 252 của lưới 1416: `padding-inline: max(40px, calc((100vw - 120px - 1416px) / 2))`.
- Phân trang dưới 48rem: số trang một hàng, Previous và Next xuống hàng dưới, mỗi nút chiếm nửa bề ngang. Từ 48rem cùng một hàng.
- H1 dùng `--font-size-display`, heading 800, uppercase, -0.04em, line-height 1. Tiêu đề Filters dùng `--font-size-h3`, heading 700. Không dùng font nào khác ngoài Sofia Sans Condensed và Inter.

## Trạng thái

Không có trong Figma, tất cả là ĐỀ XUẤT, trừ chuỗi đã có trong `locales/en.default.json`.

| Trạng thái | Hiển thị | Nguồn |
| --- | --- | --- |
| Banner có ảnh | Khung bo góc, chữ trắng trên scrim | AC1 |
| Banner không ảnh | H1 và mô tả thẳng trên band tối, không khung. Lấy `collection.image`, không fallback `featured_image` | `blocks/collection-banner` |
| Không có mô tả | Chỉ h1 | `blocks/collection-banner` |
| Collection rỗng | Giữ banner; bỏ cột filter và toolbar; text `empty` + nút secondary `empty_cta` | AC1, locale có sẵn |
| Lọc không ra kết quả | Giữ filter, toolbar, chip; text `empty_filtered` + nút `empty_clear` | locale có sẵn |
| Đang tải (có JS) | Skeleton card trong partial `collection-products`, `aria-busy="true"`; toolbar và filter vẫn thao tác được. ĐỀ XUẤT chỉ hiện skeleton nếu chờ quá 300ms để không nháy | `ux-motion` |
| Không JS | Form GET tải lại trang, không skeleton; nút Apply luôn hiện | AC2 |
| Lỗi giá | Viền 2 ô `--color-sale`, `aria-invalid`, text `price_invalid`, `role="alert"` | locale có sẵn |
| Lỗi mạng khi lọc | ĐỀ XUẤT: fallback submit form tải cả trang, không thêm chuỗi mới | AGENTS.md, JavaScript |
| Option count 0 | Disabled, chữ `--color-muted-light` | `snippets/filter-group` |
| Không có filter | Lưới full ngang, ẩn nút Filter | `blocks/collection-filters` |
| 1 trang | Không hiện phân trang | `snippets/pagination` |
| Hover | Card: ảnh scale 1.04 với `--motion-slow`, tiêu đề gạch chân. Nút secondary: đảo nền `--figma-1a1a1a`. Số trang: nền `--figma-e5e5e5`. Chip: đảo nền. Link breadcrumb: trắng, gạch chân | `ux-motion` |
| Focus | Vòng 2px currentColor, offset 2px trên mọi phần tử tương tác | DESIGN.md |
| Đã chọn | Checkbox `accent-color`, chữ đậm 600 (không chỉ dựa vào màu). Swatch: vòng accent. Trang hiện tại: nền `--figma-1a1a1a` như tab đang chọn 1:496 | ĐỀ XUẤT |

Chuyển động: drawer trượt từ cạnh inline-start và overlay fade với `--motion-base`; chevron xoay với `--motion-base`; nội dung nhóm dùng `::details-content`. Chỉ animate transform, opacity, trong `prefers-reduced-motion: no-preference`. Skeleton pulse dùng `--motion-slow`.

## Accessibility

Tương phản tính tay theo công thức WCAG; không có file tự kiểm vì ticket chỉ nhận file đầu ra.

| Cặp | Tỉ lệ | Ghi chú |
| --- | --- | --- |
| Trắng trên scrim banner, ảnh trắng tuyệt đối | 7.4:1 | Overlay 30% + scrim tối thiểu 65% cho ra nền #555555 |
| `--color-muted-on-dark` #999999 trên #1A1A1A | 6.1:1 | Breadcrumb, footer |
| Nav trắng 60% trên #1A1A1A (ra #A3A3A3) | 6.9:1 | Header |
| #1A1A1A trên `--figma-f4f4f5` | 15.8:1 | Chip, số trang |
| Trắng trên #1A1A1A | 17.4:1 | Trang hiện tại |
| Trắng trên accent #C8400E | 5.01:1 | DESIGN.md |
| `--color-sale` #BD1616 trên trắng | 6.4:1 | Giá sale, lỗi; cùng số với chữ trắng trên badge sale |
| #4D4D4D trên trắng | 8.5:1 | Số sản phẩm, giá gạch |
| #6B6B6B trên trắng | 5.33:1 | DESIGN.md; số đếm option, viền input |
| Trắng trên badge New #4B824D | 4.57:1 | DESIGN.md |

- ĐỀ XUẤT: viền input và select dùng `--color-muted-light` (5.33:1) thay `--color-border` #E5E5E5 (khoảng 1.26:1, không đạt 3:1 của WCAG 1.4.11). Không thêm màu mới.
- Vùng chạm 44 cho mọi control, kể cả chip (36 + `::before` trên dưới 4) và option filter; checkbox 20 nằm trong hàng 44.
- Bàn phím: `showModal` giữ focus trong drawer, Esc đóng, focus trả về nút Filter; không JS thì popover native. Sort là `<select>` native.
- Một h1 mỗi trang; tiêu đề card h2 như code hiện tại. Breadcrumb là `nav` có `aria-label`, mục cuối `aria-current="page"`. Chip có `aria-label` "Remove filter ...".
- `collection-status` đọc số kết quả sau khi lọc. Alt ảnh lấy từ Shopify; ảnh banner là LCP, eager và `fetchpriority="high"`.

## Token dùng

Màu: `--figma-1a1a1a`, `--figma-4d4d4d`, `--figma-e5e5e5`, `--figma-f4f4f5`, `--figma-f5f5f1`, `--figma-ffffff`, `--figma-white-12`, `--figma-white-60`, `--color-background-dark`, `--color-muted-light`, `--color-muted-on-dark`, `--color-accent`, `--color-sale`, `--color-badge-new`. Không thêm màu.
Bo góc: `--figma-radius-4/8/12/16/24/999`. Khoảng cách: `--space-1..8`, số giữa bậc viết `calc(var(--space-1) * n)`. Chuyển động: `--motion-fast/base/slow`, `--ease-out`.
Mockup có 2 giá trị riêng: `rgb(0 0 0 / 0.1)`, `rgb(0 0 0 / 0.2)` ở viền swatch; theme giữ `color-mix` với `--color-foreground` như code hiện có. Nền `.footer-main` và màu hover nút chính trong mockup chỉ là mô phỏng; theme giữ đúng style đang có của `blocks/footer` và `.button`.

## Map sang block

| Phần | File | Việc | Phía |
| --- | --- | --- | --- |
| Header và footer tối | `assets/base.css` | Mở rộng selector `body:has(.slideshow)` để trang này dùng nền tối | FE |
| Banner | `blocks/collection-banner`, CSS | Khung, scrim gắn hộp chữ, biến thể không ảnh, band tối | FE |
| Breadcrumb | `snippets/breadcrumb` mới, `locales` | ĐỀ XUẤT, dùng `routes.*`, thêm dòng vào Theme map | FE |
| Lưới | CSS `.collection-layout`, `.collection-products__grid` | 4 cột, kết quả chiếm 3 | FE |
| Toolbar | `blocks/collection-products` | Đưa số sản phẩm lên toolbar bằng partial mới `collection-count`; giữ `data-results-label` | FE1, BE1 |
| Chip | `snippets/active-filters` mới, partial mới `collection-active-filters` | Link `url_to_remove`, không JS vẫn chạy; thêm key `blocks.collection_products.remove_filter` | FE1, BE1 |
| Filter | `snippets/filter-group`, CSS | Style option, swatch pill 32 x 16 | FE |
| Drawer | `blocks/collection-filters`, `assets/collection-filters.js` | ĐỀ XUẤT giữ nút Apply khi có JS để đóng drawer, hiện `data-enhanced` đang ẩn nút này nên mobile chỉ còn nút X | FE1, BE1 |
| Skeleton | `blocks/collection-products`, JS | Markup skeleton, bật `aria-busy` | FE1, BE1 |
| Phân trang | `snippets/pagination`, CSS | Trang hiện tại đổi từ accent sang nền tối như tab; layout mobile | FE |
| Product card | `snippets/product-card` | Không sửa | Không |

Giữ nguyên mọi `data-testid`, partial `collection-products`, `collection-filters`, `collection-filter-count`. Không thêm block mới.

## Ghi chú dữ liệu mockup

- Thành viên collection Weight, số 48, số đếm facet, giá trị Product type, Vendor, Color, mô tả collection đều là ví dụ. Trang thật render từ Shopify, 24 sản phẩm mỗi trang; mockup chỉ vẽ 9 card từ 768, 10 card ở 360.
- Tên, giá, ảnh sản phẩm lấy đúng URL ticket. Ảnh không khớp tên (vd P18, P07, P08, P01) đã ghi ở ES1-T245.
- Ảnh banner `efx-blog-3.jpg` là ảnh bài viết, mượn làm ví dụ vì ticket không cấp ảnh collection. Viết rõ để không nhầm là dữ liệu thật.
- Swatch chỉ vẽ cho 3 sản phẩm trùng tên với Figma 1:490, màu đọc bằng mắt từ ảnh. Không có badge rating vì ticket không có dữ liệu.
- Icon, ảnh, payment ở footer mockup cắt từ ảnh `docs/figma/img/1-1104.png`, theme dùng asset thật của `blocks/footer`. Footer và header dưới 80rem trong mockup là suy luận, theme giữ hành vi của block đang có.

## 3 quyết định CTO cần chốt

1. Lưới có cột filter: 3 cột hay 4 cột mặc định? Đề xuất 3 cột, card 336 đúng Figma ở 1920; 4 cột thì card khoảng 243, tên sản phẩm dễ xuống dòng. Merchant vẫn đổi được qua setting.
2. Banner: khung bo góc tối thiểu 420 trên band tối, chữ đè ảnh, hay giữ kiểu ảnh rồi chữ bên dưới như code? Đề xuất khung bo góc vì cùng ngôn ngữ hero 1:422, thấp hơn hero để sản phẩm vào màn hình đầu sớm.
3. Thêm 2 thành phần ngoài Figma và SRS: breadcrumb và chip filter đang chọn? Đề xuất thêm cả hai, không cần JS và không đổi luồng; ticket có nhắc breadcrumb nhưng trang chủ chưa có để dùng lại (ES1-T246).
