KHÔNG CHẮC: ghép trên `docs/srs.md` sau ES1-T396 (PR #181); ES1-T395 chạy sau, sửa TE-1, TE-5, TE-6, TE-8, TE-10, TE-11, TE-18 trên file này. TE-4 AC28 theo mặc định ES1-T432, TE-4 AC26 và TE-12 AC1 theo mặc định ES1-T433 (im lặng tới 14/11/2026 = nhận). Chưa chạy `vague_words.py`, `traceability.py` (phiên không có shell).

# ES1-T394 — Bảng thay đổi SRS 0.5 (phần trang chủ và sản phẩm)

| # | Vị trí | Thay đổi | Nguồn |
| --- | --- | --- | --- |
| 1 | Dòng KHÔNG CHẮC, dòng bản, đoạn nguồn | Thêm mục (4) ES1-T394; ngày bản 12/11; câu mô tả phần ES1-T394 | — |
| 2 | Mục 0 Thuật ngữ | Thêm định nghĩa "theme mới cài", "store dev đã cấu hình", mốc đo, hàng ngang (HD3) dùng chung mọi story | ES1-T308 #1, sổ 09/11, sổ 11/11 HD3 |
| 3 | TE-1 AC-H28 | Given đổi sang store dev đã cấu hình; thêm vế theme mới cài không "Get 15% Off" | ES1-T308 #1, ES1-T309 #3, M2 |
| 4 | TE-2 AC8 | Thêm: dưới 80rem không tự xoay dù bật autoplay | M7, index-mobile-a §2, §11 |
| 5 | TE-3 AC2, AC10, AC-H12 | Trỏ AC13 (số chỉ báo), AC14 (media), AC15 (unit price), AC18 (rỗng) | M3, VP2 |
| 6 | TE-3 AC13–AC18 (mới) | VP2 chỉ báo màu card; quickview rich media; vendor, gift card, unit price, không pickup/countdown; quickview theo mốc; bestseller 768 4/3 cột; trạng thái tab | VP2, sổ 11/11 (6), mini-cart-quickview §3, §5, §6; index-mobile-a §5 |
| 7 | TE-3 bảng setting | Thêm "Show vendor in quick view" | mini-cart-quickview §5, ES1-T309 #1 |
| 8 | TE-4 AC5 | Nhãn sticky bar hết hàng "Sold Out" | product.md §10, §11 A |
| 9 | TE-4 AC6 | Viết lại form người nhận gift card (trường, lỗi, bố cục) | product-shopify-features §6; ES1-T418 (Must, TE-4-R2-FE6) |
| 10 | TE-4 AC14 | "Show fewer" → "Show Fewer"; focus vào giá trị đầu vừa hiện, thu lại về "+N" | M4, variant-picker §1, §5 |
| 11 | TE-4 AC21–AC32 (mới) | VP3; thứ tự khối và lưới; gallery, lightbox; phần đầu buy box; form, stepper, hàng cam kết; accordion product-details; reviews chỉ metafield; complementary; related; trạng thái A–D; unit price; countdown < 1 giờ | VP3, product.md §1–§11, product-shopify-features §3.1, countdown §5 K2; ES1-T308 #3; ES1-T432; ES1-T433 |
| 12 | TE-4 bảng setting | Thêm 8 dòng: Show rating, Show quantity selector, Show assurance list, Assurance 1–3 text/link (rỗng), Specification 1–4 label (rỗng → locale), Open description by default, Show shipping and returns, product-reviews Heading (rỗng → locale) | product.md §12; ES1-T308 #1 (D10); ES1-T422 #1; ES1-T433 |
| 13 | TE-7 AC5 | Thay "hiện nội dung Figma khi merchant chưa nhập" bằng theme sạch, nội dung Figma chỉ trên store dev | ES1-T308 #1 |
| 14 | TE-7 AC6, AC7 (mới) | Testimonials kích thước 4 mốc (HD3); why, FAQ, make fitness dưới 80rem | HD3, index-mobile-a §8, index-mobile-b §4, §5, §7 |
| 15 | TE-7 AC-H25 | Given store dev đã cấu hình; Verified theo setting | ES1-T308 #1, E9 |
| 16 | TE-9 AC1, AC4 | AC1 theme mới cài không nội dung mẫu, store dev theo AC-H5; AC4 thêm câu handle `figma-*` chỉ ở store dev/fixture | ES1-T308 #1 |
| 17 | TE-10 AC3 | Bỏ ngoại lệ R8 cho nội dung mẫu và bậc giảm | ES1-T309 #2, ES1-T308 #1 |
| 18 | TE-12 AC1 | Mặc định 0 bậc; 0 bậc thì không dòng giảm, không thanh tiến độ | M1, ES1-T309 #2, ES1-T433 |
| 19 | TE-12 AC-H18, AC-H19 | Given store dev đã cấu hình + discount thật; bỏ KHÔNG CHẮC ES1-T199 #2 (gộp vào ES1-T308 #1) | ES1-T308 #1 |
| 20 | TE-12 AC6–AC9 (mới) | HB1 thanh dính bundle 360; HB2 toast, teaser nhấc theo thanh; bố cục bundle theo mốc + trạng thái; bố cục shop the look + trạng thái | HB1, HB2, index-mobile-b §1, §1.1, index-mobile-a §7, index-1280 khối 7, 9 |
| 21 | TE-12 bảng setting đổi default | `tier_*_percent` → 0 | ES1-T308 #1, ES1-T309 #2 |
| 22 | TE-13 AC1 | Trỏ thêm TE-4 AC32 | countdown §5 K2 |
| 23 | TE-13 AC2 | Gallery hiện đủ ảnh, video, YouTube/Vimeo, 3D | M3, sổ 11/11 (6) |
| 24 | TE-13 AC6–AC8 (mới) | Featured product theo mốc; thông báo editor countdown; video carousel theo mốc (HD3), play 52, tên không cắt | index-mobile-b §2, §3, index-1280 khối 10, 11, countdown §5, §6 |
| 25 | TE-13 AC-H21 | Given store dev đã cấu hình | ES1-T308 #1 |
| 26 | TE-15 AC1, AC2 (mới); AC-H9 | Hàng danh mục theo mốc (HD3); level card hàng "N Products" theo mốc; AC-H9 trỏ AC1 | HD3, index-mobile-a §3, §4, index-1280 khối 3, 4 |
| 27 | TE-16 AC1 (mới) | Blog posts theo mốc, 4 bài lưới tĩnh ở 1280/1920 | HD3, index-mobile-b §6, index-1280 khối 14 |
| 28 | TE-16 AC-H26 | Card 1920 300 × 448 → 336 × 448 | index-mobile-b §6, index-1280 khối 14 (Figma 1:1022) |
| 29 | TE-17 câu story, AC-H1, AC-H2, AC-H3, AC-H5 | Given store dev đã cấu hình (fixture ES1-T331) | ES1-T308 #1 |
| 30 | TE-17 AC-H36, AC-H37, AC-H38 (mới) | AC ngược theme mới cài; đo khối 1280; đo khối 768/360 lệch ≤ 2 px | ES1-T308 #1, ES1-T309 #4 |
| 31 | Mã R các story | Thêm mã R cho AC mới (R3.1, R4.4, R4.11, R4.12, R4.16, R8, R12, R17) | docs/checklist-theme-store.md |
| 32 | Mục 3 | Ghi chú 0.5 ở dòng chốt 06/11 và dòng "Không thêm AC trong 0.4"; thêm khối "Chốt CTO 11/11–12/11 đưa vào 0.5 (ES1-T394)" | ES1-T308, ES1-T309, ES1-T306 |

Không đổi trong lượt này: TE-4 AC1–AC4, AC7–AC13, AC15–AC20; TE-3 AC1, AC3–AC9, AC11, AC12; TE-13 AC3–AC5, AC-H22, AC-H23; TE-15 AC-H8, AC-H10; TE-17 AC-H4, AC-H6, AC-H7, AC-H35; TE-19..TE-22 (ES1-T396).

Bàn giao ES1-T395 (cùng file, không sửa ở đây vì thuộc TE-11, TE-5):
- TE-11 AC-H15 còn Given "theme mới cài" + copy Figma 1:506: trái ES1-T308 #1, cần đổi Given sang store dev đã cấu hình và thêm vế theme mới cài.
- Unit price trong mini cart, cart page (`product-shopify-features.md` §3.1), dòng gift card "To: … · Sends on …" trong giỏ (§6) thuộc TE-5.

TC bỏ (M6, ES1-T306): TE-3 TC-12, TC-33 (bấm swatch card) — swatch card là chỉ báo (TE-3 AC2 0.3, AC13 0.5).

Spec tự mâu thuẫn (Designer sửa, SRS theo sổ):
- `index-mobile-b.md` §3 thanh sản phẩm video "tên 1 dòng cắt …" trái sổ 11/11 (3): TE-13 AC8 ghi tên hiện đủ.
- `product.md` §12 default chữ hàng cam kết, nhãn thông số, heading reviews trái ES1-T308 #1 (D10): bảng setting TE-4 ghi rỗng.
- `index-mobile-b.md` §1 dòng 80 tier mặc định 2/10, 3/15 trái ES1-T309 #2: bảng setting TE-12 ghi 0.

Việc cho Tech Lead:
- TE-3 AC18 (skeleton, rỗng, ẩn tab không collection khi đổi tab) chưa có task BE trong task-split ES1-T307; TE-17-R2-FE1 (ES1-T336) chỉ có markup.
- TE-12 AC7 phần nút Big Offer phụ thuộc TE-18-R2-FE2/BE2 (Should, `cat-r1`); phần toast thuộc TE-10-R2-FE2 (ES1-T313).
