ĐÃ THAY bởi index-mobile-a.md, index-mobile-b.md (10/11). Không dùng file này làm nguồn thiết kế; chỉ còn để đối chiếu hiện trạng code cũ (index-mobile-a.md §12). Mockup `drafts/designer/ES1-T252/` cũng đã thay bởi `drafts/designer/ES1-T278/` (ES1-T292).

KHÔNG CHẮC: (1) Ảnh live chụp theo khối, sau khi trang đã cuộn: header dính đè lên giữa ảnh của 9 khối, nên chỗ bị che không soát được. (2) Lúc chụp, một số ảnh lazy chưa tải (shop the look, testimonial, why choose, blog, featured product ở 360) và module JS chưa chạy (tổng bundle, shop the look ở 360; đồng hồ featured product). Những chỗ này đã soát bằng code (`assets/base.css`, `blocks/*.liquid`), không kết luận từ ảnh. (3) Ảnh sản phẩm lệch tên (ES1-T245) nên không tính là lỗi bố cục. (4) Hai file `index-1280.png` và `index-1920.png` còn lại từ lần 2, không thuộc lần 3 (desktop không làm lại); Designer không xoá được file, nhờ Orchestrator xoá.

# UI spec: Trang chủ 768 và 360 (ES1-T252, lần 3)

Mục tiêu: người mua trên tablet và điện thoại hiểu Efitco bán gì ở màn đầu và tới được danh mục, bestseller, quiz, combo, bài viết mà không phải mở menu. Story TE-17. Template `templates/index.liquid`; Figma 1:359 chỉ có bản desktop.

Gốc: trang live trên store dev (theme efitco-develop-7b0137a). Desktop 1280/1920 đã khớp Figma (CTO 10/11), lần này không chụp lại, không đổi.
Ảnh live theo khối: `drafts/designer/ES1-T252/live/<khối>-768.png`, `<khối>-360.png` (32 ảnh, selector `[data-testid=container-home-<khối>]`, `[data-testid=header]`, `[data-testid=footer]`).
Mockup: `drafts/designer/ES1-T252/index.html`, chỉ 5 khối có đề xuất, PNG `index-768.png`, `index-360.png`. Mỗi khối trong mockup có một dải vàng ghi khác live ở đâu.

Thứ tự nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma > bộ kiến thức (`NN §mục`).

## 1. Bảng 16 khối × 2 khổ

"Giữ như live" nghĩa là không có vấn đề đo được. Số đo lấy từ ảnh live (px CSS) hoặc từ `assets/base.css`.

| # | Khối (testid) | Khổ | Bố cục hiện tại (live) | Vấn đề (đo được, nguồn) | Đề xuất |
| --- | --- | --- | --- | --- | --- |
| 1 | Header (`header`) | 768 | Thanh tối noise cao 80: menu 44, logo, search, account, cart | Không | Giữ như live |
| | | 360 | Như 768, icon cách nhau 44 | Không | Giữ như live |
| 2 | Hero (`home-hero`) | 768 | Khung 728 × 546 bo 12, cách lề 20; chữ trái từ x 112; 2 nút 52 giữa cạnh; 2 dot đáy; lớp tối 0 | (a) Chữ trắng trên nền ảnh ~#8B8279: 3.76:1. Eyebrow 16/800 và câu phụ 16/500 không phải chữ lớn → dưới 4.5 (sổ quyết định 09/11, 19 §A4). (b) Dot vùng chạm 24 × 24, bước 24 (`.slideshow__dot` = `--space-5`); tablet là màn chạm, cần 44 (14 §3, §4) | ĐỀ XUẤT: `overlay_opacity: 30` cho 2 slide (setting có sẵn, DESIGN mặc định 30). Ở ≥ 80rem `.slideshow__overlay` đã `display: none` (base.css dòng 7505) nên desktop không đổi. Dot 44 × 44 như mobile. Mockup §2.1 |
| | | 360 | Ảnh tràn 360 × 450, không bo; chữ căn giữa; dot 44 | (a) Như 768. (b) Chữ căn giữa, trong khi sổ quyết định 09/11 ghi "nội dung hero thẳng mép trái container (cùng mép logo và khối dưới)"; mọi khối dưới căn trái ở x 20 | ĐỀ XUẤT: lớp tối 30% như 768; chữ căn trái mép 20 (chờ CTO câu 2, vì bản căn giữa đã được duyệt 07/11). Giữ ảnh tràn, không bo, dot 44 (07/11). Mockup §2.1 |
| 3 | Browse Categories (`home-collection-list`) | 768 | Hàng cuộn, card 307, lộ card thứ 3; nút 52 ở đầu khối; thanh tiến trình | Không | Giữ như live |
| | | 360 | Card 252, lộ 1/4 card kế; ẩn nút, vuốt; thanh tiến trình | Không | Giữ như live |
| 4 | Intro + Shop by level (`home-intro`) | 768 | Tiêu đề display 1 dòng có ảnh inline; level 3 cột 232 | Không | Giữ như live |
| | | 360 | Tiêu đề 3 dòng; level 1 cột 320 × 240, "N Products →" luôn hiện | Không | Giữ như live |
| 5 | Bestsellers (`home-featured-collection`) | 768 | Tab 1 hàng cao 40; lưới 4 cột | Không | Giữ như live |
| | | 360 | Tab cuộn ngang; lưới 2 cột; swatch nhìn 32 × 16, vùng chạm 44 (`::after`), bước 44 | Không | Giữ như live |
| 6 | Quiz (`home-quiz`) | 768 | Panel tối; thẻ trắng: body map trái, 3 lựa chọn phải cao 80 | Không | Giữ như live |
| | | 360 | Body map ẩn; lựa chọn cả hàng cao ≥ 72 | Không | Giữ như live |
| 7 | Shop the look (`home-shop-the-look`) | 768 | 1 cột: ảnh 728 × 635 → ô kích thước → 4 hàng → panel tổng | Nút "Add Setup To Cart" ở y ≈ 1546 tính từ đầu khối, tức 1.5 màn iPad dọc (1024), cách danh sách và ảnh hotspot; tablet có đủ bề ngang để đặt tổng cạnh danh sách (05 nhóm 4 §1.3 "CTA rất gần khi cuộn nhẹ"; 19 §D1 tablet tận dụng không gian) | ĐỀ XUẤT: dưới ảnh chia 2 cột `1fr 300px`, gap 16: trái ô kích thước + 4 hàng, phải panel tổng `position: sticky` trong khối. Nút còn ~ y 970. Mockup §2.2 |
| | | 360 | 1 cột như 768 | Không về bố cục. Panel tổng rỗng khi module JS chưa chạy: `data-bundle-subtotal`, `data-bundle-total` là span rỗng trong Liquid | Giữ bố cục live. ĐỀ XUẤT (FE + BE): Liquid in sẵn số lượng, tạm tính, giảm, tổng theo hàng đang chọn; JS chỉ cập nhật (05 nhóm 4 §6; 14 §2 #928M) |
| 8 | Inspiration (`home-inspiration`) | 768 | 3 ảnh 200 một hàng trên, tiêu đề display căn giữa, câu phụ, nút | Không | Giữ như live |
| | | 360 | 3 ảnh 96 một hàng trên, tiêu đề 4 dòng | Không | Giữ như live |
| 9 | Bundle builder (`home-bundle-builder`) | 768 | Lưới 3 cột; panel "Your Bundle" dưới | Không về bố cục | Giữ như live |
| | | 360 | Lưới 2 cột; panel dưới | Panel rỗng tới khi JS chạy (như khối 7) | Giữ bố cục live; ĐỀ XUẤT in tổng từ Liquid như khối 7 |
| 10 | Featured product (`home-featured-product`) | 768 | Ảnh 1/1 728 × 712; dưới là thông tin; 2 nút 1 hàng | (a) Ảnh vuông đẩy "Add To Cart" tới y ≈ 1362, 1.3 màn iPad dọc (05 nhóm 4 §1.3). (b) Đồng hồ `visibility: hidden` tới khi module chạy (base.css 6923) → ô trống ~100 px giữa tên và giá ở 768, ~150 ở 360 | ĐỀ XUẤT: ảnh 4/3 (728 × 546, ảnh `contain` trên cream, không cắt sản phẩm), dấu tròn 113 cách góc 24; đồng hồ hiện ngay số Liquid đã in (`hours_text`…), JS chỉ chạy tiếp. Nút còn ~ y 1160. Mockup §2.3 |
| | | 360 | Ảnh 1/1 320; 2 nút xếp dọc full | (b) như 768 | Giữ bố cục live; đồng hồ hiện ngay như 768 |
| 11 | Video demo (`home-video-carousel`) | 768 | Tiêu đề 2 dòng; nút 52 hàng riêng dưới tiêu đề; card 264, lộ card 3 | Không | Giữ như live |
| | | 360 | Card 252, lộ card kế; ẩn nút | Không | Giữ như live |
| 12 | Testimonials (`home-testimonials`) | 768 | Lưới 2 × 2, card 352, khối cao ~1320 | Sổ quyết định 09/11: testimonial là "hàng ngang", nút next/back đầu khối + thanh tiến trình. Lưới 2 × 2 lệch quyết định và khác blog/video cùng trang (06 nhóm 5 §1) | ĐỀ XUẤT: hàng cuộn card 307, gap 16 (cùng blog), lộ ~100 px card thứ 3 (15 §5.1); nút 52 trắng viền #E5E5E5 ở đầu khối; thanh tiến trình. Khối còn ~720. Mockup §2.4 |
| | | 360 | Hàng cuộn card 272, ẩn nút, thanh tiến trình | Không | Giữ như live |
| 13 | Why choose (`home-why-choose`) | 768 | Ảnh 768 × ~700 trên, gradient đáy; chữ dưới; eyebrow xám | Eyebrow "We are about" màu `--color-muted-on-dark` #999 (5.85:1, đạt AA) nhưng sổ quyết định 09/11 ghi eyebrow cam accent; accent #C8400E trên #1E1E1E chỉ 3.33–3.48:1 | Giữ như live; CTO câu 3 |
| | | 360 | Như 768, ảnh 360 × ~340 | Như 768 | Giữ như live |
| 14 | Blog (`home-blog-posts`) | 768 | Hàng cuộn card 307 × 410; nút 52 đầu khối; thanh tiến trình | Không | Giữ như live |
| | | 360 | Card 252 × 336, ẩn nút | Không | Giữ như live |
| 15 | FAQ (`home-faq`) | 768 | Accordion rộng hết; ảnh 728 × 775; 2 ô số cạnh nhau dưới ảnh | Ảnh trang trí cao 775 = 76% màn iPad dọc; khối cao ~1540 (19 §D6 "hình ảnh lớn trên màn nhỏ: thay đổi kích thước hoặc sắp xếp lại"; 03 nhịp khoảng trắng) | ĐỀ XUẤT: dưới accordion lưới `7fr 5fr`, gap 12: ảnh ~418 × 445 | 2 ô số xếp dọc cao bằng ảnh. Bớt ~480 px. Mockup §2.5 |
| | | 360 | Accordion; ảnh 320 × 340; 2 ô số xếp dọc | Câu 3 viết "do i" (chữ thường) trong locale | Giữ bố cục live. Sửa chuỗi "How much floor space do I actually need?" (P4, locale) |
| 16 | Footer (`footer`) | 768 | Newsletter ảnh trái, chữ phải; brand + social; 2 menu 2 cột; trust 2 × 2; wordmark; đáy | Menu Information không có link Shipping và Return/Refund policy (14 §1 #252D, Must) | Giữ bố cục live. ĐỀ XUẤT: thêm 2 link chính sách vào menu demo (dữ liệu, không đổi giao diện) |
| | | 360 | Newsletter xếp dọc; 2 menu 2 cột; trust 1 cột | Như 768 | Như 768 |

## 2. Năm khối đổi (mockup)

Ngoài phần ghi dưới đây, mọi màu, cỡ chữ, khoảng cách giữ như live.

### 2.1 Hero (768, 360)
- Lớp tối: `overlay_opacity: 30` cho slide 1 và 2 trong `templates/index.liquid` (đang 0). Không đổi CSS, không đổi desktop.
- 768: dot `.slideshow__dot` 44 × 44, chấm trong 12 (inset 16), bỏ gap; 2 nút 52 giữ giữa cạnh, cách mép khung 24; chữ giữ x 112 như live.
- 360: `.slideshow__content` căn trái (`align-items: flex-start; text-align: start`), padding-inline 20 = mép khối dưới. Chờ CTO câu 2; nếu giữ căn giữa thì chỉ đổi lớp tối.
- Trạng thái: không đổi (thiếu ảnh → nền `--color-background-dark`).

### 2.2 Shop the look (768)
- Từ 48rem tới < 64rem: `.shop-the-look__body` (ô kích thước + hàng + panel) thành lưới `minmax(0, 1fr) 300px`, gap 16, `align-items: start`; panel `position: sticky; top: header + 16`. Ảnh vẫn rộng hết.
- Hàng sản phẩm, hotspot (vùng 44), panel, chữ giữ như live. Từ 64rem theo bố cục 2 cột hiện có.

### 2.3 Featured product (768, 360)
- 768: `.featured-product__media` `aspect-ratio: 4 / 3`, ảnh `object-fit: contain`; dấu tròn 113 cách góc 24 (như từ 48rem hiện có). 360 giữ 1/1.
- Đồng hồ: bỏ `visibility: hidden` chờ `data-enhanced`; số do Liquid in lúc render (đã có `hours_text`, `minutes_text`…), JS chỉ đếm tiếp. Nếu hết giờ lúc render, Liquid không in khối (đã có `show_countdown`). Mockup vẽ kiểu Figma 1:776 (nền #1A1A1A, ô 44 viền #333) ở cả 768 và 360, một dòng, rộng theo nội dung.
- KHÔNG CHẮC: lý do code ẩn đồng hồ tới khi JS chạy có thể là tránh số đứng yên khi trang cache lâu (comment `featured-product.liquid` dòng 19: "numbers that do not move would be a fake countdown"). Nếu giữ ẩn thì ít nhất cần chừa đúng chiều cao 60 thay vì ô trống ~100–150. Đã hỏi Tech Lead ở ES1-T276.

### 2.4 Testimonials (768)
- Dưới 64rem và từ 48rem: hàng cuộn giống `blog-posts` (card 307, gap 16, scroll-snap, hàng tràn tới mép phải màn hình, mép trái thẳng container), `<ul aria-label="Customer reviews" tabindex="0">`, nút 52 "Previous reviews"/"Next reviews" ở đầu khối, thanh tiến trình 2 px cách 32.
- Card giữ nội dung live (ảnh 456/270, tên, Verified, sao, tiêu đề 18/700, quote, sản phẩm đính kèm).
- Desktop: không thuộc lần này; sổ quyết định 09/11 áp cho mọi mốc nên FE kiểm cả ≥ 64rem (ghi ở mục 5).

### 2.5 FAQ (768)
- Từ 48rem tới < 64rem: `.faq__aside` lưới `7fr 5fr`, gap 12; ảnh giữ tỉ lệ 509/542; 2 ô số xếp dọc, mỗi ô `1fr` (cao bằng nửa ảnh), padding 24, số 40.
- Accordion giữ như live (hàng ≥ 56, icon +/−, mở sẵn câu 1).

## 3. Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

### 3.1 Performance
- LCP: ảnh slide 1 hero (`efx-slide-2.jpg`) ở mọi mốc: 360 × 450, 728 × 546. `priority: true` đã có (eager, fetchpriority high). Lớp tối 30% là CSS, không thêm request.
- Lazy: mọi ảnh dưới màn đầu (slide 2, danh mục, level, sản phẩm, body map, ảnh shop the look, ảnh rải, poster video, ảnh review, why, blog, FAQ, newsletter). Đổi bố cục 768 của shop the look, featured product, FAQ, testimonial không đổi số ảnh; ảnh FAQ 768 nhỏ đi (~418 thay 728) nên `sizes` giảm.
- Font: 2 họ, Sofia Sans Condensed (700/800) và Inter (400/500/600/700), qua `font_picker`.
- CLS: in đồng hồ và tổng từ Liquid làm ô giữ đúng nội dung ngay từ đầu, bớt nhảy khi JS chạy. Panel shop the look sticky không ảnh hưởng CLS.
- Không video tự chạy ở màn đầu mobile (hero chỉ ảnh).

### 3.2 Accessibility
Tỉ lệ tính tay: L sRGB → tuyến tính, (L1 + 0.05) / (L2 + 0.05). Lớp tối trộn #1E1E1E theo α trong sRGB.

| Chỗ | Cặp | Tỉ lệ | Kết luận |
| --- | --- | --- | --- |
| Chữ hero, lớp 0 (live) | trắng / #8B8279 (L 0.228) | 3.76 | Eyebrow 16 và câu phụ 16 không đạt 4.5 |
| Chữ hero, lớp 30% (đề xuất) | trắng / #6A645E (L 0.130) | 5.83 | Đạt trên tông nền chính |
| Câu phụ đè dây áo sáng, lớp 30% | trắng / mix #C8D8B0 (L 0.333) | 2.74 | Còn rủi ro ở ~40 px chữ "made for" (360) và "every workout" (768). CTO câu 1 |
| Như trên, lớp 55% | trắng / L 0.159 | 5.02 (nền chính 8.65) | Đạt mọi điểm nhưng ảnh tối rõ |
| Eyebrow Why choose (live) | #999 / #1E1E1E | 5.85 | Đạt |
| Accent trên nền tối (nếu theo 09/11) | #C8400E / #1E1E1E | 3.33–3.48 | Không đạt chữ 16 → Lighthouse `color-contrast` fail (nền đặc, axe đo được) |

- Chữ trên ảnh: axe để "incomplete" nên Lighthouse không trừ điểm, nhưng sổ quyết định 09/11 đòi AA, nên vẫn tính.
- Vùng chạm: dot hero 768 lên 44 (live 24). Các control khác trong 32 ảnh đã đạt ≥ 44 ở 360 (icon header, tab, swatch `::after`, hotspot, lựa chọn quiz, hàng accordion, nút 48–52).
- Hàng cuộn testimonial 768: `<ul aria-label>` + `tabindex="0"`; nút có tên riêng; thanh tiến trình `aria-hidden`.
- Đồng hồ: `role="timer"`, nhãn đầy đủ, không đọc mỗi giây.
- Heading: 1 h1 (hero slide 1), h2 mỗi khối, h3 trong card; không đổi.

### 3.3 SEO
- Chữ link mô tả đích: giữ như live ("Explore Equipment", "Browse All Setups", "View Preset Bundles", "Get Started Now", "View About Us"); "View Detail" có phần ẩn " of {product}".
- Ảnh nội dung có alt; ảnh trang trí (review, FAQ, level) `alt=""`. Chữ nhỏ nhất 13 (badge) ≥ 12.

### 3.4 Best Practices
- Mockup 0 lỗi console ở 768 và 360; PNG đúng bề ngang viewport (không tràn ngang).
- Ảnh khung có `aspect-ratio` + `object-fit`; ảnh sản phẩm `contain`.

## 4. Settings merchant
Không thêm setting. Dùng setting có sẵn `overlay_opacity` (slideshow-slide) = 30 trong template trang chủ.

## 5. Việc FE/BE (lệch giữa live và spec)

| Khối | Đổi | Phía | Mức |
| --- | --- | --- | --- |
| Hero | `overlay_opacity: 30` (template); dot 44 ở 48–80rem; 360 căn trái nếu CTO duyệt | FE | P3 (A11y) |
| Testimonials | Hàng cuộn + nút + thanh tiến trình từ 48rem (kiểm cả ≥ 64rem theo 09/11) | FE (markup) + BE (nếu dùng chung module carousel thì không cần JS mới) | P2 (lệch sổ quyết định) |
| Shop the look | 768: lưới 2 cột dưới ảnh, panel sticky | FE | P2 |
| Featured product | 768: ảnh 4/3; đồng hồ hiện số Liquid ngay | FE (CSS) + BE (JS bỏ phụ thuộc `data-enhanced`) | P3 |
| FAQ | 768: ảnh 7fr \| ô số 5fr | FE | P3 |
| Bundle, shop the look | Tổng tính sẵn trong Liquid | FE + BE | P3 |
| FAQ locale | "do i" → "do I" | FE | P4 |
| Footer | Menu demo thêm Shipping, Refund policy | Dữ liệu store (DevOps/BA) | P3 |

## 6. Quyết định CTO cần chốt

1. Lớp tối hero ở 768/360: 30% (ảnh gần live, 5.83:1 trên nền chính, chỗ dây áo sáng còn 2.74:1) hay 55% (đạt mọi điểm ≥ 5.0:1, ảnh tối rõ)? Đề xuất: 30%, và nếu cần đạt hết thì merchant chọn ảnh có vùng nền trơn sau chữ (19 §A4), không tăng lớp tối.
2. Hero 360: căn trái mép 20 theo quyết định 09/11 ("thẳng mép trái container") hay giữ căn giữa đã duyệt 07/11? Đề xuất: căn trái, cho cùng mép với mọi khối dưới.
3. Eyebrow trên nền tối (Why choose): giữ xám #999 như live (5.85:1) hay cam theo 09/11? Accent hiện có chỉ 3.33–3.48:1 nên Lighthouse A11y < 100. Đề xuất: giữ xám như live; nếu muốn cam thì dùng màu dẫn xuất `color-mix(in srgb, var(--color-accent) 75%, #fff)` (≈ 4.98:1), cùng cách `--color-accent-on-sand`.
