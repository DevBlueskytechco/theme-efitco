KHÔNG CHẮC: (1) Font heading: ticket ghi Inter, DESIGN.md, SRS TE-1 AC8, settings_schema và ảnh Figma là Sofia Sans Condensed; spec theo DESIGN.md, hỏi ở ES1-T245 và quyết định 1. (2) Ticket và store-data không có dữ liệu biến thể của sản phẩm mẫu; option Color, Set trong mockup là ví dụ. (3) URL ảnh trong ticket không khớp tên sản phẩm, xem ES1-T245 #3.

# UI spec: Trang sản phẩm

Ticket ES1-T239, story TE-4. Mockup: `drafts/designer/ES1-T239/product.html`, trạng thái ở cuối file.

## Mục đích

Khách xem ảnh, video, 3D; chọn biến thể thấy giá và tồn cập nhật; thêm vào giỏ hoặc checkout nhanh; xem thêm sản phẩm liên quan. Giữ nguyên luồng và AC1–AC12 của TE-4.

## Figma node

Figma không có trang sản phẩm. Trang lấy ngôn ngữ từ trang chủ:

| Phần | Nguồn |
| --- | --- |
| Header, footer | 1:362, 1:1104; header nền trắng vì không có hero (TE-1 AC9) |
| Khung 2 cột, tiêu đề, giá, pill giảm, rating, mô tả, bảng spec, nút có icon | 1:759 |
| Card sản phẩm, heading band | 1:490, 1:502 |
| Pill option | Tab 1:496 |

Mọi thứ không nêu trong bảng trên là ĐỀ XUẤT, chờ Designer người duyệt.

## Anatomy

Thứ tự DOM, trên xuống:

1. Header, dùng lại block `header`.
2. Breadcrumb. ĐỀ XUẤT: Figma và theme chưa có, dù ticket coi là phần dùng lại.
3. Gallery: khung media, nút zoom, dải thumbnail, badge Sold out khi hết hàng.
4. Thông tin: vendor (eyebrow), h1, giá + giá gạch + pill -N%, rating, ghi chú thuế và vận chuyển.
5. Form: option (swatch, pill), tồn, số lượng, Add to cart, accelerated checkout, Shop Pay Installments, pickup. Khi có: selling plan, gift card.
6. Mô tả và bảng spec.
7. Band "You may also like" (related).
8. Band "Pairs well with" (complementary).
9. Footer, dùng lại block `footer`.
10. Sticky bar, chỉ dưới 48rem.

ĐỀ XUẤT: đưa form lên trước mô tả, khác 1:759 (mô tả, spec, rồi nút). Lý do: mô tả thật dài hơn mẫu sẽ đẩy nút mua khỏi màn hình đầu. Ở 1280 nút hiện nằm ở y ≈ 660.

## Settings merchant

| Tên | Block | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- | --- |
| Show vendor | product-info | checkbox | Bật | Có sẵn |
| Show dynamic checkout | product-form | checkbox | Bật | Có sẵn |
| Heading | product-recommendations | text | Trống, dùng locale | Có sẵn |
| Products to show | product-recommendations | range | 4 | 2–8, có sẵn |
| Columns desktop | product-recommendations | range | 4 | 2–5, có sẵn |
| Spec 1 label | product-description (mới) | text | Weight range | ĐỀ XUẤT, quyết định 2 |
| Spec 2 label | product-description (mới) | text | Footprint | ĐỀ XUẤT, quyết định 2 |
| Spec 3 label | product-description (mới) | text | Materials | ĐỀ XUẤT, quyết định 2 |
| Spec 4 label | product-description (mới) | text | Assembly | ĐỀ XUẤT, quyết định 2 |

Dữ liệu động: `product.*`, variant, `reviews.rating`, `reviews.rating_count`, `custom.spec_1..4` (cùng metafield với featured product), Product Recommendations API.

## Layout

Khung nội dung theo `--page-width` 91rem và `--page-margin` 20. Không dùng breakpoint mới: 48rem, 64rem, 80rem.

| Thành phần | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Nội dung | 320 | 728 | 1240 | 1416, lề 252 |
| Cột | 1 | 1 | 2: 579 / 581, cách 80 | 2: 667 / 669, cách 80 (Figma 668 / 670) |
| Khung media | 320 × 320 | 728 × 546 (4 / 3) | 579 × 566 (668 / 653) | 667 × 652 (668 / 653) |
| Thumbnail | 64, cách 8 | 64, cách 8 | 80, cách 8 | 80, cách 8 |
| Gallery sticky | Không | Không | Có | Có |
| h1 (`--font-size-h1`) | 33 | 43 | 48 | 48 |
| Header | Drawer | Drawer | Nav ngang | Nav ngang |
| Card liên quan | 2 cột, cách 16 | 4 cột, cách 16 | 4 cột, cách 24 | 4 cột, cách 24 |
| Padding đáy khu chính, band | 48 | 48 | 120 | 120 |
| Nút | 52, bo 4 | 52, bo 4 | 52, bo 8 | 52, bo 8 |

Từ 64rem đến dưới 80rem (1024): 2 cột, cách 48, nhưng header vẫn là drawer.

Nhịp cột thông tin theo 1:759: giữa các nhóm 24; eyebrow tới h1 12; giá, rating, ghi chú 8. Band complementary có padding đầu 0 để giữ 120 giữa 2 band. Band nào 0 kết quả thì ẩn, khoảng cách không đổi.

ĐỀ XUẤT: gallery 1 khung media cuộn ngang ở mọi cỡ, thay cách xếp dọc từ 64rem hiện có, xem quyết định 3. Gallery sticky thay cho cột chi tiết sticky, vì cột chi tiết giờ cao hơn.

ĐỀ XUẤT: 4 cột từ 48rem khi `columns_desktop` là 4, để không lẻ 1 card ở hàng 2 như cách giới hạn 3 cột hiện có.

## Trạng thái

Figma không có trạng thái nào dưới đây; tất cả là ĐỀ XUẤT trừ khi AC đã quy định.

| Tình huống | Hiển thị |
| --- | --- |
| Đổi option, đang tải | `aria-busy`; giá và tồn mờ 45%; nút Add to cart có spinner, chặn bấm để không thêm nhầm biến thể |
| Tổ hợp không tồn tại | Giá giữ nguyên, tồn và nút ghi "Unavailable", nút disabled (AC2) |
| Giá trị option hết hàng | Vẫn chọn được, chữ gạch ngang, màu muted; không chỉ dựa vào màu |
| Biến thể hết hàng | Badge Sold out trên gallery (SRS mục 3), tồn và nút "Sold out", nút disabled, Buy it now disabled, sticky bar disabled |
| Thêm giỏ, đang chạy | Nút spinner, `aria-busy`, giữ nguyên kích thước |
| Thêm giỏ thành công | Mở cart drawer hoặc sang cart theo `cart_type` (AC8); status đọc "Added to cart" |
| Thêm giỏ lỗi 422 | Câu lỗi từ API trong `product-form-error` (`role="alert"`), viền đầu 2px `--color-sale`, nền alt; nút bấm lại được |
| Video Shopify | Poster, controls, bấm mới chạy, `preload="none"` |
| YouTube, Vimeo | Poster + nút play 64 nền trắng, hover nền accent; không JS là link ra trang video |
| Model 3D | Poster + nút "View in 3D"; bấm mới tải tương tác |
| Không media | 1 ô cream với placeholder, không thumbnail, không nút zoom |
| 1 media | Không thumbnail |
| 1 biến thể | Không có bộ chọn option (AC9) |
| Không vendor, rating, mô tả, spec | Phần đó ẩn hẳn, không để khung trống; không có giá trị rating mặc định |
| Sản phẩm số | Ẩn pickup và ghi chú vận chuyển (AC9) |
| 0 sản phẩm liên quan | Storefront ẩn cả band; editor hiện gợi ý có sẵn |
| Tải trang | Khung media có tỉ lệ cố định và nền cream nên không có layout shift; không thêm skeleton |

Hover và focus:

| Phần tử | Hover | Focus-visible |
| --- | --- | --- |
| Nút | Nhấc 1px, bóng; active scale .98 | Viền 2px accent, cách 2 |
| Pill option | Viền trong 1px foreground | Viền 2px accent, cách 2 |
| Swatch | Giữ như product card | Viền 2px accent quanh vùng 44 |
| Thumbnail | Viền foreground; đang chọn viền 2px accent | Viền 2px current color |
| Input | Viền foreground | Viền 2px accent |
| Card | Phóng ảnh 1.04, gạch chân tiêu đề | Viền 2px trên link tiêu đề |
| Link | Gạch chân | Viền 2px current color |

Chuyển động dùng `--motion-*`, nằm trong `prefers-reduced-motion: no-preference` (skill ux-motion).

## Accessibility

Tương phản đo bằng `drafts/designer/ES1-T239/contrast-check.html`:

| Cặp | Tỉ lệ | Ngưỡng | Kết quả |
| --- | --- | --- | --- |
| Chữ chính trên trắng | 17.40 | 4.5 | Đạt |
| Mô tả, giá gạch, ghi chú #4D4D4D trên trắng | 8.45 | 4.5 | Đạt |
| Dấu breadcrumb #6B6B6B trên trắng | 5.33 | 4.5 | Đạt |
| Giá sale #BD1616 trên trắng | 6.38 | 4.5 | Đạt |
| Eyebrow accent trên trắng | 5.01 | 4.5 | Đạt |
| Chữ trắng trên accent | 5.01 | 4.5 | Đạt |
| Chữ trắng trên sale | 6.38 | 4.5 | Đạt |
| Pill option trên #F4F4F5 | 15.83 | 4.5 | Đạt |
| Option hết hàng trên #F4F4F5 | 7.69 | 4.5 | Đạt |
| Nút disabled trên #F4F4F4 | 7.69 | 4.5 | Đạt |
| Nhãn spec trên sand | 6.81 | 4.5 | Đạt |
| Chữ phụ footer #999999 trên #1A1A1A | 6.11 | 4.5 | Đạt |
| Chấm In stock #4B824D trên trắng | 4.57 | 3 | Đạt |
| Viền thumbnail đang chọn | 5.01 | 3 | Đạt |
| Viền input đề xuất #6B6B6B | 5.33 | 3 | Đạt |
| Viền input hiện có #E5E5E5 | 1.26 | 3 | Không đạt, nên đề xuất đổi |
| Sao rating #FFC107 | 1.63 | 3 | Không đạt; theo Figma, số điểm và câu ẩn mang thông tin |

- Vùng bấm từ 44 trên mobile: thumbnail 64, pill 44, swatch 44 (hình 32 × 16), nút 52, nút trong sticky bar 44, link breadcrumb 44.
- Bàn phím: option là radio theo fieldset và legend; thumbnail là link; nút zoom nằm trong link ảnh, không thêm điểm Tab.
- Một h1 là tên đầy đủ, không cắt. Breadcrumb và sticky bar cắt bằng dấu ba chấm chỉ về mặt hiển thị.
- Alt lấy từ media, không có thì dùng `product.title`; thumbnail và ảnh sticky bar `alt=""`.
- Live region giữ nguyên: `product-form-status`, `product-form-error`.
- Không JS: thumbnail cuộn tới media, zoom là link ảnh, select trong noscript chọn biến thể, form submit bình thường. Sticky bar không hiện.

## Token dùng

Không tạo màu mới, không sửa token.

- Màu: `--color-foreground`, `--color-background`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-background-cream`, `--color-background-sand`, `--color-accent`, `--color-accent-foreground`, `--color-sale`, `--color-sale-foreground`, `--color-rating`, `--figma-1a1a1a`, `--figma-f4f4f5`, `--figma-ebe6e0`.
- Bo góc: `--radius-input`, `--radius-button`, `--radius-card`, `--radius-pill`, `--figma-radius-8`, `--figma-radius-12`, `--figma-radius-16`.
- Chữ: `--font-heading--*`, `--font-primary--family`, `--font-size-xs` tới `--font-size-h1`.
- Khoảng cách: `--space-1` tới `--space-8`, `--page-width`, `--page-margin`, `--header-height`.
- Chuyển động: `--motion-fast`, `--motion-base`, `--ease-out`.

Dùng token ngoài mục đích đang ghi, cần duyệt:

- ĐỀ XUẤT: chấm In stock dùng `--color-badge-new`. DESIGN.md ghi token này chỉ làm nền badge New. Hiện chấm dùng accent, trái quy tắc accent chỉ dành cho hành động.
- ĐỀ XUẤT: viền input dùng `--color-muted-light`, 5.33:1, thay `--color-border` 1.26:1.

## Map sang block

| Phần | Block, snippet | Việc FE | Việc BE |
| --- | --- | --- | --- |
| Khung trang | `templates/product.liquid` | Thêm breadcrumb, `product-description`; cột 668fr / 670fr, cách 48 và 80; sticky chuyển sang gallery | Không |
| Gallery | `product-media` (có) | Khung 1 media theo Layout; thumbnail 80 từ 64rem, chọn viền accent; nút zoom; badge 3D, badge Sold out; chuỗi `view_3d` | `assets/product-media.js`: cuộn ngang theo thumbnail, `aria-current`, đổi media theo biến thể (AC1), bật tắt badge Sold out |
| Thông tin | `product-info` (có) | Vendor thành eyebrow accent; h1 theo `--font-size-h1`; thêm pill -N% trong partial `product-price`; thêm rating; bỏ mô tả | Không, nếu pill nằm trong partial |
| Form | `product-form`, `product-variant-picker` (có) | Pill theo tab 1:496; swatch theo card; hàng số lượng + nút; icon bag; input cao 52 | Legend hiện giá trị đang chọn; giá trị thuộc `product-variant-picker.js` |
| Mô tả, spec | `product-description` (mới) | Block mới, giữ hook `product-description`, thêm hook `product-specs` | Không |
| Liên quan | `product-recommendations` (có) | Thêm badge sale vào template card; 4 cột từ 48rem | `product-recommendations.js`: điền -N% theo quy tắc của card |
| Sticky bar | `product-sticky-bar` (có) | CSS 2 dòng, xem dưới | Không |
| Breadcrumb | `breadcrumb` (snippet mới) | Home, collection, tên sản phẩm; `collection` hiện tại, không có thì `product.collections.first`, không có nữa thì bỏ cấp giữa | Không |
| Header, footer, card | `header`, `footer`, `product-card` | Không đổi | Không |

Thêm block hoặc snippet phải cập nhật bảng Theme map trong AGENTS.md. Mọi chuỗi mới qua `| t`; giữ các `data-testid` và partial name hiện có.

Sticky bar: bố cục hiện tại xếp ảnh, tên, giá, nút trên 1 hàng; ở 360 tên gần như mất, trái AC5. Đề xuất grid `48px minmax(0, 1fr) auto`, `.product-sticky-bar__buy { display: contents; }`, không đổi markup: dòng 1 tên, dòng 2 giá, ảnh và nút chiếm cả 2 dòng. Giá gạch xuống dòng nếu giá dài. Bar cao 73 (48 + 2 × 12 + viền 1), trong khi padding đáy body hiện là `calc(44px + var(--space-3) * 2)` = 68, cần đổi theo. Chỉ hiện dưới 48rem theo AC5.

Card liên quan khác trang chủ ở 2 điểm: không swatch, không rating, vì block lấy dữ liệu từ JSON của Recommendations API.

## Việc ngoài trang này

Xem ES1-T245: `blocks.product_form.add_to_cart` đang là "Add To Cart", trái AGENTS.md và E11; `figma-exceptions.json` chưa có E11. Mockup dùng "Add to cart". Key này dùng chung với featured product nên đổi sẽ ảnh hưởng trang chủ.

## 3 quyết định CTO cần chốt

1. Font heading trang sản phẩm dùng gì? Đề xuất: Sofia Sans Condensed cho heading, Inter cho body, giống trang chủ và `settings_schema.json`. Chỉ dùng Inter thì trang này lệch trang chủ, trừ khi đổi cả theme.
2. Trang sản phẩm có hiện rating và bảng spec không? SRS TE-4 không yêu cầu; 1:759 có. Đề xuất: có, dùng lại metafield của featured product, không có dữ liệu thì ẩn. Cần thêm block `product-description` và 4 setting nhãn.
3. Gallery từ 64rem là 1 khung + thumbnail hay xếp dọc như hiện tại? Đề xuất: 1 khung + thumbnail, khớp khung 668 × 653 của 1:759 và đưa thumbnail lên gần ảnh. Xếp dọc thì không cần sửa gallery nhiều, nhưng thumbnail nằm dưới mọi ảnh, phải cuộn xa mới tới.
