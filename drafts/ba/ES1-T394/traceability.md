KHÔNG CHẮC: TC-394-* và TC-H36..H38 là mã đề xuất, QA viết bước ở ticket QA của story; số đo AC-H37, AC-H38 chờ fixture TE-17-R2-QA0 (ES1-T331) và hiệu chuẩn ngưỡng; dữ liệu store dev chờ ES1-T298; chưa chạy `traceability.py` (phiên không có shell), đã đếm tay. Bảng gộp toàn SRS 0.5 có cột ui-spec, mốc, trạng thái là việc của REQ2-BA4 (ES1-T397).

# ES1-T394 — Ma trận truy vết SRS 0.5, phần trang chủ và sản phẩm (yêu cầu → AC → TC → mã R → task R2 → dữ liệu)

Trạng thái: "QA viết" = TC chưa có; "sửa" = TC cũ đổi kỳ vọng; "thiếu task" = AC chưa có task dev trong task-split ES1-T307.

| Yêu cầu (nguồn) | Story / AC | TC | Mã R | Task R2 | Dữ liệu store dev | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| M7, index-mobile-a §11 autoplay dưới 80rem | TE-2 AC8 | TC-394-01 | R12 | TE-2-R2-BE1 (ES1-T333), TE-2-R2-FE1 (ES1-T332); QA ES1-T346 | `/` 2 slide, setting autoplay bật | QA viết |
| VP2 chỉ báo màu card | TE-3 AC13, AC2 | TC-394-02 | R12, R7.3 | TE-3-R2-FE1 (ES1-T337), TS-FE6 (ES1-T404); QA ES1-T346 | sản phẩm 3 màu và 7 màu (edge "Apparel More Variants") | QA viết; bỏ TE-3 TC-12, TC-33 |
| M3, sổ 11/11 (6) quickview rich media | TE-3 AC14, AC10 | TC-394-03 | R4.12, R12 | TE-3-R2-FE2 (ES1-T373), TE-3-R2-BE1 (ES1-T374), TS-FE9 (ES1-T409); QA ES1-T375 | sản phẩm có ảnh + video + YouTube + 3D; sản phẩm 1 ảnh; không media | QA viết |
| mini-cart-quickview §3, §5 vendor, gift card, unit price | TE-3 AC15 | TC-394-04 | R4.16, R4.4 | ES1-T373, ES1-T374; QA ES1-T375 | gift card (D5), sản phẩm có unit price (D6) | QA viết |
| mini-cart-quickview §3 theo mốc | TE-3 AC16 | TC-394-05 | R12, R3.1 | ES1-T373, ES1-T374; QA ES1-T375 | sản phẩm 3 option, Weight 40 giá trị (ES1-T282) | QA viết |
| câu CTO 3 index-mobile-a bestseller 768 | TE-3 AC17 | TC-394-06 | R3.1 | TE-17-R2-FE1 (ES1-T336); QA ES1-T346 | `products_to_show` 4 và 6 | QA viết |
| index-mobile-a §5 trạng thái tab | TE-3 AC18, AC-H12 | TC-394-07, TC-H12 | R12 | ES1-T336 (markup); BE chưa có | tab collection rỗng; chặn mạng partial | thiếu task BE; TC-H12 sửa |
| product.md §10 nhãn "Sold Out" | TE-4 AC5 | TC-394-08 | R7.2 | TE-4-R2-FE8 (ES1-T356), TE-4-R2-BE4 (ES1-T358); QA ES1-T363 | biến thể hết hàng | QA viết |
| product-shopify-features §6 gift card | TE-4 AC6 | TC-394-09 | R4.4, R12 | TE-4-R2-FE6 (ES1-T354); QA ES1-T363 | gift card D5 | QA viết |
| M4, variant-picker §5 "Show Fewer" | TE-4 AC14 | TC-394-10 | R12, R7.2 | TE-4-R2-FE1 (ES1-T348), TE-4-R2-BE2 (ES1-T350); QA ES1-T362 | Weight 40 giá trị (ES1-T282) | QA viết |
| VP3 swatch thiếu → pill | TE-4 AC21 | TC-394-11 | R12, R7.2 | ES1-T348; QA ES1-T362 | 1 option màu đủ swatch, 1 option thiếu swatch 1 giá trị | QA viết |
| product.md §1, §2 thứ tự, lưới | TE-4 AC22 | TC-394-12 | R7.2, R3.1 | TE-4-R2-FE3 (ES1-T351), TE-4-R2-FE5 (ES1-T353); QA ES1-T363 | sản phẩm có complementary, related, rating | QA viết |
| product.md §3 gallery, lightbox | TE-4 AC23 | TC-394-13 | R4.12, R12, R17 | ES1-T351, TE-4-R2-BE3 (ES1-T357); QA ES1-T363 | sản phẩm có video, 3D; sản phẩm không media | QA viết |
| product.md §4 phần đầu buy box | TE-4 AC24 | TC-394-14 | R7.2, R12 | ES1-T351; QA ES1-T363 | metafield rating có/không | QA viết |
| product.md §5 form, stepper, cam kết | TE-4 AC25 | TC-394-15 | R7.2, R8, R12 | TE-4-R2-FE4 (ES1-T352), ES1-T358; QA ES1-T363 | theme sạch (0 mục cam kết); store dev 3 mục | QA viết |
| product.md §6 product-details | TE-4 AC26 | TC-394-16 | R7.2, R8 | ES1-T353; QA ES1-T363 | metafield `custom.spec_1..4` đủ/thiếu | QA viết (mặc định ES1-T433) |
| product.md §8, ES1-T308 #3 reviews | TE-4 AC27 | TC-394-17 | R7.2 | ES1-T353; QA ES1-T363 | metafield `reviews.rating`, `reviews.rating_count` có/không | QA viết |
| product.md §7 complementary | TE-4 AC28 | TC-394-18 | R4.11 | ES1-T353, TE-4-R2-BE5 (ES1-T359); QA ES1-T363 | complementary có sản phẩm 1 và nhiều biến thể, 1 hết hàng | QA viết (mặc định ES1-T432) |
| product.md §9 related, HD3 | TE-4 AC29 | TC-394-19 | R4.11, R3.1 | ES1-T353, ES1-T359, TE-7-R2-BE1 (ES1-T335); QA ES1-T363 | related ≥ 5 sản phẩm | QA viết |
| product.md §11 A–D | TE-4 AC30 | TC-394-20 | R7.2, R12 | TE-4-R2-FE2 (ES1-T349), ES1-T352, ES1-T358; QA ES1-T363 | hết hàng, tổ hợp không tồn tại, tồn 1 để gây 422 | QA viết |
| product-shopify-features §3.1 unit price | TE-4 AC31 | TC-394-21 | R4.16 | ES1-T351, ES1-T349; QA ES1-T363 | D6 unit price có số đo | QA viết |
| countdown §5 K2 | TE-4 AC32, TE-13 AC1 | TC-394-22 | R8, R12 | TE-13-R2-FE1 (ES1-T343), TE-13-R2-BE1 (ES1-T344); QA ES1-T363 | D4 `custom.sale_ends_at` cách < 1 giờ | QA viết |
| ES1-T308 #1 block nội dung không mẫu | TE-7 AC5 | TC-394-23 | R8, R14 | TS-FE4 (ES1-T406); QA TS-QA1 (ES1-T412) | theme sạch | QA viết |
| HD3, index-mobile-b §4 testimonials | TE-7 AC6 | TC-394-24 | R3.1, R12 | TE-7-R2-FE1 (ES1-T334), ES1-T335; QA ES1-T345, ES1-T346 | 4 review có ảnh, 1 không ảnh | QA viết |
| index-mobile-a §8, -b §5, §7 why, FAQ, make fitness | TE-7 AC7 | TC-394-25 | R3.1, R12, R17 | TE-17-R2-FE2 (ES1-T341), TE-17-R2-FE3 (ES1-T342); QA ES1-T346 | fixture ES1-T331 | QA viết |
| ES1-T308 #1 review mẫu | TE-7 AC-H25 | TC-H25 | R8 | ES1-T334; fixture ES1-T331; QA ES1-T345 | store dev 4 review, Verified bật | sửa |
| ES1-T308 #1 trang chủ theme sạch | TE-9 AC1 | TC-H36 | R8, R14 | TS-FE3 (ES1-T405), ES1-T406; QA ES1-T412 | theme sạch | QA viết |
| ES1-T308 #1 handle figma-* chỉ ở store dev | TE-9 AC4 | TC-394-26 | R20, R8 | ES1-T405; fixture ES1-T331; DevOps ES1-T298 | repo + store dev | QA viết |
| ES1-T309 #2 bỏ ngoại lệ R8 | TE-10 AC3 | TC-394-27 | R8 | ES1-T406; QA ES1-T412 | theme sạch; store dev có discount tự động | QA viết |
| M2, ES1-T309 #3 "Get 15% Off" | TE-1 AC-H28 | TC-H28 | R8, R4.9 | TE-1-R2-FE4 (ES1-T321), TS-FE2 (ES1-T402); QA ES1-T325 | theme sạch; store dev nút "Get 15% Off" | sửa |
| M1, ES1-T309 #2 bậc giảm 0 | TE-12 AC1 | TC-394-28 | R8 | TE-12-R2-FE1 (ES1-T339), ES1-T406; QA ES1-T346 | theme sạch | QA viết (mặc định ES1-T433) |
| ES1-T308 #1 bậc giảm store dev | TE-12 AC-H18 | TC-H18 | R8 | ES1-T339, TE-12-R2-BE1 (ES1-T340); fixture ES1-T331 | discount tự động 10%, 15% | sửa |
| ES1-T308 #1 shop the look store dev | TE-12 AC-H19 | TC-H19 | R8 | ES1-T341; fixture ES1-T331 | như trên | sửa |
| HB1 thanh dính bundle 360 | TE-12 AC6 | TC-394-29 | R12, R3.1 | ES1-T339, ES1-T340; QA ES1-T346 | bundle collection `all`; 0, 1, 5 món; tồn 0 để gây lỗi | QA viết |
| HB2 toast, teaser nhấc | TE-12 AC7 | TC-394-30 | R12 | ES1-T340, TE-10-R2-FE2 (ES1-T313), TE-18-R2-FE2 (ES1-T390, Should); QA ES1-T346 | như trên + sản phẩm Big Offer | QA viết (teaser chỉ khi TE-18 không cắt) |
| index-mobile-b §1, index-1280 khối 9 bundle | TE-12 AC8 | TC-394-31 | R3.1, R12 | ES1-T339, ES1-T340; QA ES1-T345, ES1-T346 | bundle 6 sản phẩm, 1 hết hàng | QA viết |
| index-mobile-a §7, index-1280 khối 7 shop the look | TE-12 AC9 | TC-394-32 | R3.1, R12 | ES1-T341, ES1-T340; QA ES1-T345, ES1-T346 | 4 row, 1 hết hàng; chặn mạng `/cart/add.js` | QA viết |
| M3 featured rich media | TE-13 AC2 | TC-394-33 | R4.12 | ES1-T342, TS-FE9 (ES1-T409), TS-BE1 (ES1-T410); QA ES1-T346 | sản phẩm featured có video + 3D | QA viết |
| ES1-T308 #1 video copy store dev | TE-13 AC-H21 | TC-H21 | R8 | ES1-T334; fixture ES1-T331; QA ES1-T345 | 6 video card | sửa |
| index-mobile-b §2 featured theo mốc | TE-13 AC6 | TC-394-34 | R3.1, R12 | ES1-T342, ES1-T343; QA ES1-T346 | featured còn hàng, hết hàng, không rating | QA viết |
| countdown §5, §6 editor | TE-13 AC7 | TC-394-35 | R8, R14 | ES1-T343; QA ES1-T346 (tay trên editor) | setting `countdown_end` sai; sản phẩm có cả metafield và setting | QA viết (tay) |
| HD3 video carousel | TE-13 AC8 | TC-394-36 | R3.1, R12, R17 | ES1-T334, ES1-T335, ES1-T344; QA ES1-T345, ES1-T346 | 6 video card; 1 nguồn hỏng | QA viết |
| HD3 danh mục | TE-15 AC1, AC-H9 | TC-394-37, TC-H9 | R3.1, R12, R17 | ES1-T334, ES1-T335; QA ES1-T345, ES1-T346 | 5 collection `figma-cat-*`, 1 không ảnh | QA viết; TC-H9 sửa |
| index-mobile-a §4, index-1280 §2.3 level card | TE-15 AC2 | TC-394-38 | R3.1, R12 | ES1-T336; QA ES1-T345, ES1-T346 | 3 collection trình độ, 1 rỗng | QA viết |
| HD3 blog posts | TE-16 AC1 | TC-394-39 | R3.1, R12, R17 | ES1-T334, ES1-T335; QA ES1-T345, ES1-T346 | blog 4 bài (ES1-T267), thêm bài thứ 5 để kiểm hàng ngang | QA viết |
| Figma 1:1022 card 336 × 448 | TE-16 AC-H26 | TC-H26 | R3.1 | ES1-T334 | blog ≥ 5 bài | sửa |
| ES1-T308 #1 Given store dev | TE-17 AC-H1, AC-H2, AC-H3 | TC-H1, TC-H2, TC-H3 | R3, R14 | fixture ES1-T331; QA ES1-T345 | store dev đã cấu hình | sửa |
| ES1-T308 #1, ES1-T309 #3 copy Figma store dev | TE-17 AC-H5 | TC-H5 | R8 | fixture ES1-T331; QA ES1-T345 | như trên | sửa |
| ES1-T308 #1 AC ngược theme mới cài | TE-17 AC-H36 | TC-H36 | R8, R14 | ES1-T405, ES1-T406, ES1-T402; QA ES1-T412, ES1-T345 | theme sạch, không fixture | QA viết |
| ES1-T309 #4 đo khối 1280 | TE-17 AC-H37 | TC-H37 | R3.1 | ES1-T332, ES1-T334, ES1-T336, ES1-T339, ES1-T341, ES1-T342; QA ES1-T345 | fixture ES1-T331 | QA viết |
| ES1-T309 #4 đo khối 768/360 | TE-17 AC-H38 | TC-H38 | R3.1 | như trên; QA ES1-T346 | fixture ES1-T331 | QA viết |

Kiểm đủ (đếm tay):
- AC sửa/mới trong ES1-T394: TE-1 AC-H28; TE-2 AC8; TE-3 AC2, AC10, AC13–AC18, AC-H12; TE-4 AC5, AC6, AC14, AC21–AC32; TE-7 AC5, AC6, AC7, AC-H25; TE-9 AC1, AC4; TE-10 AC3; TE-12 AC1, AC6–AC9, AC-H18, AC-H19; TE-13 AC1, AC2, AC6–AC8, AC-H21; TE-15 AC1, AC2, AC-H9; TE-16 AC1, AC-H26; TE-17 AC-H1, AC-H2, AC-H3, AC-H5, AC-H36, AC-H37, AC-H38 = 58 mục, mỗi mục có ≥ 1 dòng trên, ≥ 1 TC, ≥ 1 mã R.
- TC mới: TC-394-01 … TC-394-39 (39 mã, không trùng), TC-H36, TC-H37, TC-H38. TC sửa: TC-H1, TC-H2, TC-H3, TC-H5, TC-H9, TC-H12, TC-H18, TC-H19, TC-H21, TC-H25, TC-H26, TC-H28. TC bỏ: TE-3 TC-12, TC-33.
- AC thiếu task dev: TE-3 AC18 (phần BE). AC phụ thuộc Should có thể cắt: TE-12 AC7 (phần teaser, TE-18).
- Không TC nào không gắn AC.
