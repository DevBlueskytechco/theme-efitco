KHÔNG CHẮC: (1) AC từ bản 0.2 trở về trước không có mã TC trong ma trận BA, cột TC ghi "TE-n TC cũ". QA đối chiếu số TC trong spec của story (vd TE-1 TC-47). (2) Mã TC-394-*, TC-395-*, TC-396-* và TC-H36..H38 là mã đề xuất, QA viết bước trong ticket QA. (3) Một số AC viết theo mặc định của câu hỏi còn mở: ES1-T436 (im lặng tới 14/11/2026 = nhận) và ES1-T440 (tới 15/11/2026). (4) Phiên BA không có shell nên chưa chạy `vague_words.py` và `traceability.py`. Đã đếm tay và grep tay. (5) Mã task R2 → ticket lấy từ danh sách ticket REQ-0002 ngày 13/11/2026. Cột Sprint lấy theo sprint trên ticket, không theo bảng §7 của task-split, vì ES1-T311 đã lùi TE-2-R2-FE1, TE-7-R2-FE1, TE-17-R2-FE1 sang Sprint 3.

# ES1-T397 — Ma trận truy vết SRS 0.5 (gộp toàn bộ): AC → ui-spec → mốc → TC → mã R → task R2 → sprint → trạng thái

Nguồn: `docs/srs.md` 0.5, `drafts/techlead/ES1-T307/task-split.md`, các ma trận trước (`drafts/ba/ES1-T294`, `ES1-T299`, `ES1-T394`, `ES1-T395`, `ES1-T396` `/traceability.md`), danh sách ticket REQ-0002, quyết định CTO ES1-T308, T311, T419, T422.

Quy ước:
- Mốc: "4 mốc" = 360, 768, 1280, 1920 (sổ 09/11). "dưới 80rem" = 360, 768. "nojs" = nhóm Playwright không JS. "repo" = kiểm mã nguồn, không theo viewport. "store dev" = hoa-qua-nhap-khau (efitco-ai-dev) đã áp fixture ES1-T331. "theme sạch" = theme mới cài, chưa áp fixture.
- Task R2: ghi theo dạng `<mã R2> ES1-Txxx`. Lần ghi sau trong cùng story chỉ ghi ES1-Txxx. "TS-*" là task tuân thủ tách từ ES1-T304. "xong" = ticket Closed.
- Sprint: S2 (16–27/11), S3 (30/11–11/12), S4 (14–25/12) là sprint của task cuối cùng (dev hoặc QA) cần xong để AC đạt. "cắt R1" = task Should mang nhãn `cat-r1`, chưa xếp sprint.
- Trạng thái: "giữ" = AC không đổi, TC cũ dùng được. "QA viết" = TC chưa có. "sửa" = TC cũ phải đổi kỳ vọng. "thiếu task" = AC chưa có task R2. "trỏ" = AC chuyển sang story khác. "không task R2" = AC đã có trong code hoặc làm tay, REQ-0002 không đổi.

## NFR

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-1 | L1 sổ 09/11, 10/11; ES1-T301; ES1-T419 | — | desktop + mobile, 14 template | TC-299-01, TC-299-02 | R6.1, R6.2, R11 | DevOps ES1-T416; TE-10-R2-FE3 ES1-T317 | S4 | QA viết |
| NFR-2 | theme check 0 lỗi | — | repo | TE-10 TC cũ | R2 | DoD mọi task FE/BE | S2–S4 | giữ |
| NFR-3 | AGENTS.md | — | repo | TE-10 TC cũ | R2, Canvas | DoD mọi task | S2–S4 | giữ |
| NFR-4 | fallback không JS | — | nojs | mọi TC nhóm nojs | R12 | DoD QA mọi task | S2–S4 | giữ |
| NFR-5 | trình duyệt | — | desktop + Pixel 7 | TE-10 TC cũ | R9 | DoD QA mọi task | S2–S4 | giữ |
| NFR-6 | không app, script Shopify CDN | — | repo | TE-10 TC cũ | R8 | DoD mọi task | S2–S4 | giữ |
| NFR-7 | sổ 10/11 2048 biến thể | variant-picker §1–§4 | 4 mốc | TC-294-18, TC-294-23 | R7.2 | TE-4-R2-FE1 ES1-T348, TE-4-R2-FE2 ES1-T349, TE-4-R2-BE2 ES1-T350; QA TE-4-R2-QA1 ES1-T362 | S3 | QA viết |

## TE-1 Khung theme

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-1 AC1 | token Figma | foundation §1 | 4 mốc | TE-1 TC cũ | R14, R16 | TE-10-R2-FE1 ES1-T312 (xong) | S2 | giữ |
| TE-1 AC2 | N1 10/11, M5 ES1-T306 | navigation §2, §5 | dưới 80rem + nojs (từ 80rem trỏ TE-22) | TC-294-01, TC-294-02, TC-396-41 | R4.8, R12, NFR-4 | TE-1-R2-FE3 ES1-T320, TE-1-R2-BE1 ES1-T323; QA TE-1-R2-QA1 ES1-T325 | S3 | giữ; phần desktop trỏ TE-22 AC1 |
| TE-1 AC3 | ES1-T269 | — | 360, 1280 + repo | TC-299-03 | R4.19 | ES1-T320; QA ES1-T325 | S3 | QA viết |
| TE-1 AC4 | AN1, AN2 sổ 11/11 | announcement-bar | 4 mốc | TC-299-04, TC-299-05 | R12, R14, R3.1 | TE-1-R2-FE1 ES1-T319; QA ES1-T325 | S3 | QA viết |
| TE-1 AC5 | 0.3 localization | localization §1 | 4 mốc | TC-294-03, TC-299-06 | R4.7 | TE-1-R2-FE5 ES1-T322; QA ES1-T325 | S3 | QA viết |
| TE-1 AC6 | footer 0.2 | foundation §4 | 4 mốc | TE-1 TC cũ | R4.9, R13 | TE-1-R2-FE4 ES1-T321, TS-FE2 ES1-T402; QA ES1-T325 | S3 | giữ; theme sạch theo AC12 |
| TE-1 AC7 | SEO 0.2 | — | repo | TE-1 TC cũ | R7.1, R11, R4.6 | — | — | không task R2; breadcrumb trỏ TE-22 |
| TE-1 AC8 | token font, màu chữ phụ | foundation §1 | 4 mốc | TE-1 TC cũ | R15, R12 | ES1-T312 (xong) | S2 | giữ |
| TE-1 AC9 | sổ 10/11 header tối | foundation §3 | 4 mốc | TC-294-04, TC-294-05, TC-294-06, TC-47 | R7.1, R12, R6.1 | ES1-T319; QA ES1-T325 | S3 | QA viết; TC-47 sửa (ES1-T439 hỏi spec cũ) |
| TE-1 AC10 | LC1–LC3 sổ 11/11 | localization §2–§6 | 4 mốc + nojs | TC-299-06, TC-299-07 | R4.7, R12, NFR-4 | ES1-T322, ES1-T320, ES1-T323, TE-1-R2-BE2 ES1-T324; QA ES1-T325 | S3 | QA viết |
| TE-1 AC11 | sổ 11/11 TUÂN THỦ (1), (2) | foundation §4, §27, §29 | 4 mốc | TC-395-01 | R4.18, R4.2, R12 | ES1-T321; QA ES1-T325 | S3 | QA viết |
| TE-1 AC12 | ES1-T308 #1, ES1-T422 #1 | foundation §4, §12 | 360, 1920; theme sạch | TC-395-02 | R4.9, R13, R8, R12 | ES1-T321, TS-FE1 ES1-T401 (xong), ES1-T402; QA ES1-T325, TS-QA1 ES1-T412 | S3 | QA viết |
| TE-1 AC13 | audit C9, C10 | — | repo + 1280 | TC-395-03 | R14 | ES1-T401 (xong); QA ES1-T412 | S3 | QA viết |
| TE-1 AC14 | skip link, focus header | foundation §3.2, §3.4 | 4 mốc | TC-395-04 | R12 | ES1-T319, ES1-T320; QA ES1-T325 | S3 | QA viết |
| TE-1 AC-H28 | ES1-T308 #1, ES1-T309 #3 | foundation §4 | 4 mốc; store dev 1920 | TC-H28 | R8, R4.9 | ES1-T321, ES1-T402; fixture ES1-T331 (xong); QA ES1-T325 | S3 | sửa |
| TE-1 AC-H29 | sổ 10/11 hero dưới header | index §1 | 4 mốc | TC-H29 | R3.1 | ES1-T319, TE-2-R2-FE1 ES1-T332; QA ES1-T325 | S3 | sửa |

## TE-2 Slideshow, rich text

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-2 AC1 | Figma 1:422 | index §1 | 4 mốc | TE-2 TC cũ | R4.5, R17 | TE-2-R2-FE1 ES1-T332 | S3 | giữ |
| TE-2 AC2 | sổ 10/11 hero 360 | index-mobile-a §2 | 360, 768, 1280 | TC-294-07 | R3.1 | ES1-T332; QA TE-17-R2-QA2 ES1-T346 | S3 | QA viết |
| TE-2 AC3 | 0.2 nút | index §1 | 4 mốc | TE-2 TC cũ | R14 | ES1-T332 | S3 | giữ |
| TE-2 AC4 | placeholder editor | — | editor | TE-2 TC cũ | R14 | — | — | không task R2 |
| TE-2 AC5 | rich text | index-1280 khối 4 | 4 mốc | TE-2 TC cũ | R14 | TE-17-R2-FE1 ES1-T336 | S3 | giữ |
| TE-2 AC6 | 0.3 LCP slide 1 | index §1 | 4 mốc | TC-294-08 | R6.1, R17 | ES1-T332, TE-1-R2-FE1 ES1-T319 | S3 | QA viết |
| TE-2 AC7 | L2, HD2 | index-mobile-a §2, index-1280 khối 1 | 4 mốc + nojs | TC-299-08 | R12 | ES1-T332, TE-2-R2-BE1 ES1-T333; QA TE-17-R2-QA1 ES1-T345, ES1-T346 | S3 | QA viết |
| TE-2 AC8 | M7 ES1-T306 | index-mobile-a §2, §11 | 4 mốc | TC-394-01 | R12 | ES1-T333, ES1-T332; QA ES1-T346 | S3 | QA viết |
| TE-2 AC9 | a11y carousel | index §1 | 4 mốc | TE-2 TC cũ | R12 | ES1-T333 | S2 | giữ |
| TE-2 AC10 | HA1 sổ 11/11 | index-mobile-a §10 | 4 mốc | TC-299-09 | R6.1, R12 | ES1-T332, TE-10-R2-BE3 ES1-T316 (xong); QA ES1-T346 | S3 | QA viết |

## TE-3 Featured collection, product card, quickview

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-3 AC1 | D7 ES1-T169 | index-1280 khối 5 | 360, 1280 | TE-3 TC cũ | R3.1 | TE-17-R2-FE1 ES1-T336 | S3 | giữ |
| TE-3 AC2 | foundation §9, VP2 | foundation §9, variant-picker §9 | 4 mốc | TC-294-09, TC-394-02 | R12, R7.3, NFR-7 | TE-3-R2-FE1 ES1-T337, TE-3-R2-BE2 ES1-T338, TS-FE6 ES1-T404 (xong); QA ES1-T346 | S3 | QA viết; bỏ TE-3 TC-12, TC-33 |
| TE-3 AC3 | giá gạch, badge | foundation §9 | 4 mốc | TE-3 TC cũ | R7.3 | ES1-T404 (xong) | S2 | giữ |
| TE-3 AC4 | price_varies, unit price | — | 4 mốc | TE-3 TC cũ | R4.16, R7.3 | — | — | không task R2 |
| TE-3 AC5 | collection rỗng | — | editor | TE-3 TC cũ | R14 | — | — | không task R2 |
| TE-3 AC6 | 0.3 focus, vùng chạm | foundation §9 | 4 mốc | TC-294-10 | R12 | ES1-T337; QA TE-3-R2-QA1 ES1-T375 | S4 | QA viết |
| TE-3 AC7 | nút Xem tất cả | — | 4 mốc | TE-3 TC cũ | R3.1 | — | — | không task R2 |
| TE-3 AC8 | Editions #20 | — | 1280 | TC-70, TC-72 | R7.3 | ES1-T337 | S2 | sửa |
| TE-3 AC9 | M1 10/11 | mini-cart-quickview §3 | 4 mốc | TC-294-11 | R12 | TE-3-R2-FE2 ES1-T373; QA ES1-T375 | S4 | QA viết |
| TE-3 AC10 | M2 10/11 | mini-cart-quickview §3 | 4 mốc | TC-294-12, TC-394-03 | R12, R4.12 | ES1-T373, TE-3-R2-BE1 ES1-T374, TE-10-R2-BE2 ES1-T315; QA ES1-T375 | S4 | QA viết |
| TE-3 AC11 | ES1-T272, QZ1 | mini-cart-quickview §3 | 360, 1280 | TC-294-13, TC-299-29 | R7.5 | ES1-T374; QA ES1-T375 | S4 | QA viết |
| TE-3 AC12 | không JS | — | nojs | TC-294-14 | NFR-4 | ES1-T373; QA ES1-T375 | S4 | QA viết |
| TE-3 AC13 | VP2 sổ 11/11 | variant-picker §9 | 4 mốc | TC-394-02 | R12, R7.3 | ES1-T337, ES1-T404 (xong); QA ES1-T346 | S3 | QA viết |
| TE-3 AC14 | M3, sổ 11/11 TUÂN THỦ (6) | mini-cart-quickview §3, §6 | 360, 768, 1280 | TC-394-03 | R4.12, R12 | ES1-T373, ES1-T374, TS-FE9 ES1-T409; QA ES1-T375 | S4 | QA viết |
| TE-3 AC15 | vendor, unit price, gift card | mini-cart-quickview §3, §5; product-shopify-features §3.1, §10 | 768, 1280 | TC-394-04 | R4.16, R4.4 | ES1-T373, ES1-T374; QA ES1-T375 | S4 | QA viết |
| TE-3 AC16 | quickview theo mốc | mini-cart-quickview §3, §3.1 | 4 mốc | TC-394-05 | R12, R3.1 | ES1-T373, ES1-T374; QA ES1-T375 | S4 | QA viết |
| TE-3 AC17 | câu CTO 3 | index-mobile-a §5, index-1280 khối 5 | 4 mốc | TC-394-06 | R3.1 | ES1-T336; QA ES1-T346 | S3 | QA viết |
| TE-3 AC18 | trạng thái tab | index-mobile-a §5, foundation §18 | 4 mốc | TC-394-07 | R12 | ES1-T336 (markup); BE chưa có | S3 | thiếu task BE (ES1-T440 #3) |
| TE-3 AC-H11 | hàng 5 | index §1 | 1920 + nojs | TC-H11 | R12, NFR-4 | ES1-T336 | S3 | giữ |
| TE-3 AC-H12 | hàng 5 | index-mobile-a §5 | 1920 | TC-H12, TC-394-07 | R12 | ES1-T336; BE chưa có | S3 | sửa; thiếu task BE (ES1-T440 #3) |
| TE-3 AC-H13 | hàng 5 rating | — | 1920 | TC-H13 | R7.3 | ES1-T337 | S2 | giữ |
| TE-3 AC-H14 | CR-3 badge New | — | 1920 | TC-H14 | R12 | ES1-T404 (xong) | S2 | giữ |

## TE-4 Trang sản phẩm

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-4 AC1 | gallery, variant image | product §3 | 4 mốc | TE-4 TC cũ | R4.12, R4.17 | TE-4-R2-FE3 ES1-T351, TE-4-R2-BE3 ES1-T357; QA TE-4-R2-QA2 ES1-T363 | S4 | giữ |
| TE-4 AC2 | L4 nhãn nút | product §4, variant-picker §2 | 4 mốc | TC-299-10 | R7.2 | TE-4-R2-FE2 ES1-T349, TE-4-R2-FE4 ES1-T352, TE-4-R2-BE2 ES1-T350; QA ES1-T363 | S4 | QA viết |
| TE-4 AC3 | buy box 0.2 | product §4, §6 | 4 mốc | TE-4 TC cũ | R7.2 | ES1-T351, ES1-T352, TE-4-R2-FE5 ES1-T353; QA ES1-T363 | S4 | giữ |
| TE-4 AC4 | 0.4 accelerated checkout | product §5, product-shopify-features §3.2 | 4 mốc | TE-4 TC cũ, TC-299-15 | R4.2, R4.15 | ES1-T352, TE-4-R2-FE6 ES1-T354; QA ES1-T363 | S4 | QA viết |
| TE-4 AC5 | P2 10/11, "Sold Out" | product §10 | 4 mốc | TC-294-15, TC-294-16, TC-294-17, TC-394-08 | R7.2, R14 | TE-4-R2-FE8 ES1-T356, TE-4-R2-BE4 ES1-T358; QA ES1-T363 | S4 | QA viết |
| TE-4 AC6 | gift card recipient | product-shopify-features §6 | 768, 1280 | TC-394-09 | R4.4, R12 | ES1-T354; QA ES1-T363 | S4 | QA viết |
| TE-4 AC7 | related, complementary | product §7, §9 | 4 mốc | TE-4 TC cũ | R4.11 | ES1-T353, TE-4-R2-BE5 ES1-T359; QA ES1-T363 | S4 | giữ |
| TE-4 AC8 | QZ1 | — | 360, 1280 | TC-299-29 | R7.5 | ES1-T358; QA ES1-T363 | S4 | QA viết |
| TE-4 AC9 | Editions #14 | product-shopify-features §7 | 1280 | TE-4 TC cũ | R4.10 | ES1-T354; QA ES1-T363 | S4 | giữ |
| TE-4 AC10 | Editions #16 thuế/phí | — | 1280 | TE-4 TC cũ | R7.2 | — | S4 (QA ES1-T363) | không task R2 |
| TE-4 AC11 | Editions #28 JSON-LD | — | repo | TE-4 TC cũ | R11 | ES1-T349; QA ES1-T363 | S4 | giữ |
| TE-4 AC12 | Editions #5 event | — | 1280 | TE-4 TC cũ | R7.2 | ES1-T350; QA ES1-T363 | S4 | giữ |
| TE-4 AC13 | sổ 10/11 2048 biến thể | variant-picker §1–§4 | 4 mốc | TC-294-18 | R7.2, R12, NFR-7 | TE-4-R2-FE1 ES1-T348, ES1-T350; QA TE-4-R2-QA1 ES1-T362 | S3 | QA viết |
| TE-4 AC14 | M4, M5 | variant-picker §1, §5 | 360, 1280 | TC-294-19, TC-394-10 | R12, R7.2 | ES1-T348, ES1-T350; QA ES1-T362 | S3 | QA viết |
| TE-4 AC15 | M4, VP1 | variant-picker §2 | 4 mốc | TC-294-20, TC-294-21, TC-294-22 | R7.2, R12 | TE-4-R2-BE1 ES1-T347, ES1-T349, ES1-T350, ES1-T358; QA ES1-T362 | S3 | QA viết; TC-294-20 sửa |
| TE-4 AC16 | ES1-T282 > 250 biến thể | variant-picker §2 | 1280 | TC-294-23 | R7.2, NFR-7 | ES1-T347, ES1-T349, ES1-T350; QA ES1-T362 | S3 | QA viết |
| TE-4 AC17 | P3–P5, CD2 | countdown §1–§4 | 4 mốc | TC-294-24, TC-294-25, TC-299-11, TC-299-12 | R8, R12 | ES1-T351, TE-13-R2-FE1 ES1-T343, TE-13-R2-BE1 ES1-T344; QA ES1-T363 | S4 | QA viết |
| TE-4 AC18 | CTO audit (4), SF3 | product-shopify-features §8, §9 | 360, 1280 | TC-294-26, TC-294-27, TC-299-13 | R7.2, R12 | TE-4-R2-FE7 ES1-T355, TE-4-R2-BE7 ES1-T361 | cắt R1 | Should, cắt R1; dữ liệu B2B chờ ES1-T298 |
| TE-4 AC19 | SF1 | product-shopify-features §4 | 4 mốc | TC-294-28, TC-294-29, TC-299-14 | R4.14 | ES1-T354, TE-4-R2-BE6 ES1-T360; QA ES1-T363 | S4 | QA viết; TC-294-28 sửa |
| TE-4 AC20 | SF2 | product-shopify-features §7 | 4 mốc + nojs | TC-299-15, TC-299-16 | R4.10, R12, NFR-4 | ES1-T354, ES1-T359; QA ES1-T363 | S4 | QA viết |
| TE-4 AC21 | VP3 | variant-picker §3.2 | 4 mốc | TC-394-11 | R12, R7.2 | ES1-T348; QA ES1-T362 | S3 | QA viết |
| TE-4 AC22 | thứ tự, lưới | product §1, §2 | 4 mốc | TC-394-12 | R7.2, R3.1 | ES1-T351, ES1-T353; QA ES1-T363 | S4 | QA viết |
| TE-4 AC23 | gallery, lightbox | product §3 | 4 mốc | TC-394-13 | R4.12, R12, R17 | ES1-T351, ES1-T357; QA ES1-T363 | S4 | QA viết |
| TE-4 AC24 | đầu buy box | product §4 | 4 mốc | TC-394-14 | R7.2, R12 | ES1-T351; QA ES1-T363 | S4 | QA viết |
| TE-4 AC25 | form, stepper, D10 | product §5 | 4 mốc; theme sạch | TC-394-15 | R7.2, R8, R12 | ES1-T352, ES1-T358; QA ES1-T363 | S4 | QA viết |
| TE-4 AC26 | product-details, ES1-T433 | product §6 | 4 mốc | TC-394-16 | R7.2, R8 | ES1-T353; QA ES1-T363 | S4 | QA viết |
| TE-4 AC27 | ES1-T308 #3 review metafield | product §8 | 4 mốc | TC-394-17 | R7.2, R5 | ES1-T353; QA ES1-T363 | S4 | QA viết |
| TE-4 AC28 | complementary, ES1-T432 | product §7 | 4 mốc | TC-394-18 | R4.11 | ES1-T353, ES1-T359; QA ES1-T363 | S4 | QA viết |
| TE-4 AC29 | related, HD3 | product §9 | 4 mốc | TC-394-19 | R4.11, R3.1 | ES1-T353, ES1-T359, TE-7-R2-BE1 ES1-T335; QA ES1-T363 | S4 | QA viết |
| TE-4 AC30 | trạng thái A–D | product §11 | 4 mốc | TC-394-20 | R7.2, R12 | ES1-T349, ES1-T352, ES1-T358; QA ES1-T363 | S4 | QA viết |
| TE-4 AC31 | unit price | product-shopify-features §3.1 | 1280 | TC-394-21 | R4.16 | ES1-T351, ES1-T349; QA ES1-T363 | S4 | QA viết |
| TE-4 AC32 | K2 | countdown §5 | 4 mốc | TC-394-22 | R8, R12 | ES1-T343, ES1-T344; QA ES1-T363 | S4 | QA viết |

## TE-5 Cart drawer, cart page

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-5 AC1 | drawer khi thêm giỏ | mini-cart-quickview §1 | 4 mốc | TE-5 TC cũ | R7.5, R4.16 | TE-5-R2-FE1 ES1-T368, TE-5-BE3 ES1-T98; QA TE-5-QA1 ES1-T99 | S4 | giữ |
| TE-5 AC2 | đổi số lượng, xoá | cart §3.2 | 4 mốc | TE-5 TC cũ | R7.5, R12 | ES1-T368, TE-5-R2-BE1 ES1-T370; QA ES1-T99 | S4 | giữ |
| TE-5 AC3 | freeship | cart §3.4, mini-cart-quickview §1 | 4 mốc | TE-5 TC cũ, TC-395-05 | R7.5, R12 | ES1-T368; QA ES1-T99 | S4 | sửa |
| TE-5 AC4 | giỏ rỗng | cart §3.9 | 4 mốc | TE-5 TC cũ | R7.5 | ES1-T368; QA ES1-T99 | S4 | giữ; chi tiết ở AC19 |
| TE-5 AC5 | cart page | cart §2 | 4 mốc | TE-5 TC cũ | R7.5 | TE-5-R2-FE2 ES1-T369, ES1-T370; QA ES1-T99 | S4 | giữ |
| TE-5 AC6 | QZ1 | quiz-result §4 | 360, 1280 | TC-299-29 | R7.5 | TE-11-R2-BE1 ES1-T388; QA ES1-T99 | S4 | QA viết |
| TE-5 AC7 | Editions #4, #5, #18 | — | 1280 | TE-5 TC cũ | R7.5 | ES1-T98; QA ES1-T99 | S4 | giữ |
| TE-5 AC8 | M3 ghi chú drawer | mini-cart-quickview §1 | 4 mốc | TC-294-30 | R7.5 | ES1-T368, ES1-T370; QA ES1-T99 | S4 | QA viết |
| TE-5 AC9 | CTO audit (4) quantity rule | cart §3.1 | 360, 1280 | TC-294-31 | R7.5 | ES1-T369, ES1-T370 | S4 | QA viết; dữ liệu B2B chờ ES1-T298, phần "Volume pricing" bỏ nếu cắt TE-4-R2-FE7 |
| TE-5 AC10 | selling plan trên dòng | cart §3.1 | 4 mốc | TC-294-32 | R4.14, R7.5 | ES1-T368, ES1-T369; QA ES1-T99 | S4 | QA viết |
| TE-5 AC11 | G1 sổ 10/11 | cart §3.2, §6; mini-cart-quickview §2 | 4 mốc | TC-395-06 | R7.5, R12 | ES1-T368, ES1-T369, ES1-T370; QA ES1-T99 | S4 | QA viết |
| TE-5 AC12 | discount, gift card, unit price | cart §3.1, §3.3; product-shopify-features §3.1, §6, §11 | 4 mốc | TC-395-07 | R4.1, R4.4, R4.16, R7.5, R12 | ES1-T368, ES1-T369; QA ES1-T99 | S4 | QA viết |
| TE-5 AC13 | dòng hết hàng | cart §3.1; mini-cart-quickview §6 | 4 mốc | TC-395-08 | R7.5 | ES1-T368, ES1-T369; QA ES1-T99 | S4 | QA viết |
| TE-5 AC14 | G3 sổ 10/11 | cart §2, §3.6, §6 | 4 mốc | TC-395-09 | R4.1, R7.5, R3.1, R12 | ES1-T369; QA ES1-T99 | S4 | QA viết |
| TE-5 AC15 | M2 10/11 | mini-cart-quickview §1, §2; foundation §15 | 4 mốc | TC-395-10 | R7.5, R12 | ES1-T368, ES1-T98; QA ES1-T99 | S4 | QA viết |
| TE-5 AC16 | sổ 11/11 TUÂN THỦ (1) | foundation §27; product-shopify-features §3.2 | 4 mốc | TC-395-11 | R4.2, R4.15 | ES1-T368, ES1-T369; QA ES1-T99 | S4 | QA viết |
| TE-5 AC17 | thanh checkout | cart §3.7; layers §2.2, §8 | 360, 768 | TC-395-12 | R7.5, R12 | ES1-T369, ES1-T370; QA ES1-T99, TE-10-R2-QA1 ES1-T318 | S4 | QA viết |
| TE-5 AC18 | lỗi cập nhật | cart §4; mini-cart-quickview §6; foundation §18 | 4 mốc | TC-395-13 | R7.5, R12 | ES1-T368, ES1-T369, ES1-T370; QA ES1-T99 | S4 | QA viết |
| TE-5 AC19 | empty state | cart §3.9; mini-cart-quickview §6; foundation §18 | 4 mốc | TC-395-14 | R7.5, R17 | ES1-T368, ES1-T369; QA ES1-T99 | S4 | QA viết |

## TE-6 Collection, list-collections, phân trang

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-6 AC1 | 0.4 collection | collection §3 | 4 mốc | TE-6 TC cũ, TC-299-17 | R7.3 | TE-6-R2-FE2 ES1-T365; QA TE-6-QA1 ES1-T112 | S4 | QA viết |
| TE-6 AC2 | faceted filter | collection §5.2 | 4 mốc | TE-6 TC cũ | R4.3 | TE-6-R2-FE3 ES1-T366, TE-6-BE1 ES1-T110; QA ES1-T112 | S4 | giữ |
| TE-6 AC3 | sort | collection §7 | 4 mốc | TE-6 TC cũ | R7.3 | ES1-T365, ES1-T110; QA ES1-T112 | S4 | giữ |
| TE-6 AC4 | drawer lọc 360 | collection §5 | 360, 768 | TE-6 TC cũ | R4.3, R12 | ES1-T366, ES1-T110; QA ES1-T112 | S4 | giữ |
| TE-6 AC5 | 0.4 list-collections | list-collections §1 | 4 mốc | TC-299-17 | R7.4 | TE-6-R2-FE4 ES1-T367; QA ES1-T112 | S4 | QA viết; ứng viên cắt thứ 3 (ES1-T311) |
| TE-6 AC6 | L7, PG1 phân trang chung | pagination §1–§10 | 4 mốc | TC-299-17, TC-299-18 | R7.3, R7.4, R7.7, R7.8, R12 | TE-6-R2-FE1 ES1-T364, ES1-T110; QA ES1-T112 | S4 | QA viết |
| TE-6 AC7 | PG3 `?page=` vượt | pagination §8 | 1280 | TC-299-19 | R7.3 | ES1-T365; QA ES1-T112 | S4 | QA viết |
| TE-6 AC8 | C1 10/11 | collection §3, §5.1 | 4 mốc | TC-395-15 | R7.3, R3.1 | ES1-T365; QA ES1-T112 | S4 | QA viết |
| TE-6 AC9 | nhóm lọc | collection §5.2; search §3.6 | 4 mốc | TC-395-16 | R4.3, R12 | ES1-T366, ES1-T110; QA ES1-T112 | S4 | QA viết |
| TE-6 AC10 | C2 10/11 | collection §5.3 | 4 mốc | TC-395-17 | R4.3, R12 | ES1-T366, ES1-T110; QA ES1-T112 | S4 | QA viết |
| TE-6 AC11 | toolbar | collection §6 | 4 mốc | TC-395-18 | R7.3, R12 | ES1-T365, ES1-T366; QA ES1-T112 | S4 | QA viết |
| TE-6 AC12 | chip | collection §7 | 4 mốc | TC-395-19 | R4.3, R12 | ES1-T365, ES1-T110; QA ES1-T112 | S4 | QA viết |
| TE-6 AC13 | banner, mô tả | collection §4; foundation §3.3 | 4 mốc | TC-395-20 | R7.3 | ES1-T365, TE-22-R2-FE1 ES1-T326; QA ES1-T112 | S4 | QA viết |
| TE-6 AC14 | rỗng, tải, lỗi | collection §8, §9; foundation §18 | 4 mốc | TC-395-21 | R7.3, R12 | ES1-T365, ES1-T110; QA ES1-T112 | S4 | QA viết |
| TE-6 AC15 | L1–L2 10/11; ES1-T436 #1 | list-collections §1, §3, §4, §6 | 4 mốc | TC-395-22 | R7.4, R3.1, R12, R17 | ES1-T367; QA ES1-T112 | S4 | QA viết (mặc định ES1-T436) |

## TE-7 Block nội dung

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-7 AC1 | L6, HD3 hàng ngang | index-mobile-b §4, index-1280 khối 12 | 4 mốc | TC-299-21 | R3.1, R12 | TE-7-R2-FE1 ES1-T334, TE-7-R2-BE1 ES1-T335; QA ES1-T345, ES1-T346 | S3 | QA viết |
| TE-7 AC2 | FAQ bàn phím | index-mobile-b §7 | 4 mốc | TE-7 TC cũ | R12 | TE-17-R2-FE3 ES1-T342 | S3 | giữ |
| TE-7 AC3 | image with text | index-mobile-b §5 | 360, 1280 | TE-7 TC cũ | R3.1 | ES1-T342, TE-17-R2-FE2 ES1-T341 | S3 | giữ |
| TE-7 AC4 | multicolumn | — | 360, 1280 | TE-7 TC cũ | R3.1 | — | — | không task R2 |
| TE-7 AC5 | ES1-T308 #1 | — | theme sạch | TC-394-23 | R8, R14 | TS-FE4 ES1-T406; QA ES1-T412 | S3 | QA viết |
| TE-7 AC6 | HD3 testimonials | index-mobile-b §4, index-1280 khối 12 | 4 mốc | TC-394-24 | R3.1, R12 | ES1-T334, ES1-T335; QA ES1-T345, ES1-T346 | S3 | QA viết |
| TE-7 AC7 | why, FAQ, make fitness | index-mobile-a §8, index-mobile-b §5, §7 | 4 mốc; store dev | TC-394-25 | R3.1, R12, R17 | ES1-T341, ES1-T342; QA ES1-T346 | S3 | QA viết |
| TE-7 AC-H24 | hàng 12 | index-1280 khối 12 | 1920 | TC-H24 | R3.1 | ES1-T334 | S3 | giữ |
| TE-7 AC-H25 | ES1-T308 #1 review mẫu | index §12 | 1920; store dev | TC-H25 | R8 | ES1-T334; fixture ES1-T331 (xong); QA ES1-T345 | S3 | sửa |

## TE-8 Tìm kiếm

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-8 AC1 | predictive 0.2 | predictive-search §1–§4 | 4 mốc | TE-8 TC cũ | R4.13 | TE-8-R2-FE1 ES1-T377, TE-8-R2-BE1 ES1-T378, TE-8-FE2 ES1-T129, TE-8-BE1 ES1-T130; QA TE-8-QA1 ES1-T131 | S4 | giữ |
| TE-8 AC2 | PG2 | search §3; pagination §6 | 4 mốc | TC-299-20 | R7.8 | TE-8-FE1 ES1-T128, TE-8-R2-BE2 ES1-T380; QA ES1-T131 | S4 | QA viết |
| TE-8 AC3 | không JS | search §6 | nojs | TE-8 TC cũ | R7.8, NFR-4 | ES1-T128, ES1-T380; QA ES1-T131 | S4 | giữ |
| TE-8 AC4 | FD2, ES1-T436 #2 | foundation §24.1 | 4 mốc; theme sạch | TC-395-23 | R4.13, R14 | ES1-T377; QA ES1-T131 | S4 | QA viết (mặc định ES1-T436) |
| TE-8 AC5 | S1 10/11 | search §2, §3.1–§3.3 | 4 mốc | TC-395-24 | R7.8, R12 | ES1-T128; QA ES1-T131 | S4 | QA viết; breadcrumb search thiếu task (ES1-T436 #1) |
| TE-8 AC6 | nhóm kết quả | search §3.4, §3.7–§3.9 | 4 mốc | TC-395-25 | R7.8 | ES1-T128; QA ES1-T131 | S4 | QA viết |
| TE-8 AC7 | S2 10/11 lọc | search §3.5, §3.6 | 4 mốc | TC-395-26 | R4.3 | ES1-T128, ES1-T380, ES1-T110; QA ES1-T131 | S4 | QA viết |
| TE-8 AC8 | trạng thái | search §6 | 4 mốc | TC-395-27 | R7.8, R17 | ES1-T128, ES1-T380; QA ES1-T131 | S4 | QA viết |
| TE-8 AC9 | SR1 10/11 | predictive-search §1, §3 | 4 mốc | TC-395-28 | R4.13, R12 | ES1-T129, ES1-T130; QA ES1-T131 | S4 | QA viết |
| TE-8 AC10 | SR2 10/11 | predictive-search §2–§4 | 4 mốc | TC-395-29 | R4.13, R12 | ES1-T377, ES1-T378; QA ES1-T131 | S4 | QA viết |
| TE-8 AC11 | SR3 10/11 | predictive-search §2.7, §5, §6 | 4 mốc | TC-395-30 | R4.13 | ES1-T377, ES1-T378; QA ES1-T131 | S4 | QA viết |
| TE-8 AC12 | tải, lỗi | predictive-search §4, §6, §10 | 4 mốc | TC-395-31 | R4.13, R12 | ES1-T377, ES1-T378, ES1-T130; QA ES1-T131 | S4 | QA viết |
| TE-8 AC13 | recent searches (Should) | predictive-search §4 | 4 mốc | TC-395-32 | R4.13 | TE-8-R2-BE3 ES1-T379 | S4 | Should, cắt thứ 4; QA viết khi không cắt |
| TE-8 AC14 | a11y, ảnh | predictive-search §8, §10 | 4 mốc | TC-395-33 | R4.13, R12, R17 | ES1-T129, ES1-T130, ES1-T378; QA ES1-T131 | S4 | QA viết |

## TE-9 Preset, nội dung demo

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-9 AC1 | ES1-T308 #1 | index | repo + 1920; theme sạch | TC-H36 | R8, R14 | TS-FE3 ES1-T405, TS-FE4 ES1-T406; QA ES1-T412 | S3 | QA viết |
| TE-9 AC2 | 0.5 tách | page, 404, password, gift-card | 4 mốc | xem TE-21 | R7.6, R7.9 | xem TE-21 | S4 | trỏ TE-21 |
| TE-9 AC3 | 0.5 tách | blog, article | 4 mốc | xem TE-20 | R7.7 | xem TE-20 | S4 | trỏ TE-20 |
| TE-9 AC4 | ES1-T308 #1 handle figma-* | — | repo + store dev | TC-394-26 | R20, R8 | ES1-T405; fixture ES1-T331 (xong); DevOps ES1-T298 | S2 | QA viết |
| TE-9 AC5 | Editions #25 policies | — | 1280 | TE-9 TC cũ | R7.6 | — | — | không task R2 |
| TE-9 AC6 | Editions #27 shop.brand | — | 1280 | TE-9 TC cũ | R14 | — | — | không task R2 |
| TE-9 AC7 | CTO audit (4) dữ liệu demo | — | store dev | TC-294-33 | R20 | DevOps ES1-T298 | S2 | sửa |

## TE-10 Chất lượng, Canvas, lớp

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-10 AC1 | L1, NFR-1, ES1-T301 | — | desktop + mobile, 14 template | TC-299-01, TC-299-02 | R6.1, R6.2, R11 | DevOps ES1-T416, TE-10-R2-FE3 ES1-T317 | S4 | QA viết |
| TE-10 AC2 | theme check, console | — | repo | TE-10 TC cũ | NFR-2 | DoD mọi task | S2–S4 | giữ |
| TE-10 AC3 | ES1-T308 #1, ES1-T309 #2 | — | repo + 4 mốc; theme sạch | TC-394-27 | R8 | ES1-T406; QA ES1-T412 | S3 | QA viết |
| TE-10 AC4 | Canvas 5 bước | — (checklist-canvas) | yum-dev (người làm) | TE-10 TC cũ (tay) | Canvas C1–C5 | — | cuối mỗi sprint | không task R2; người làm |
| TE-10 AC5 | ES1-T306 mục writer | — | repo docs/merchant | TC-395-34 | R21–22 | chưa có task writer | — | thiếu task (ES1-T440 #2) |
| TE-10 AC6 | LY1 sổ 11/11 | layers §2 | dưới 80rem | TC-299-23 | R9, R12 | TE-10-R2-FE1 ES1-T312 (xong), TE-10-R2-BE1 ES1-T314; QA TE-10-R2-QA1 ES1-T318 | S3 | QA viết |
| TE-10 AC7 | LY2 consent | layers §5 | 360, 1280 | TC-299-24 | R12 | ES1-T314, TE-18-R2-BE1 ES1-T391 (cắt R1); QA ES1-T318 | S3 | QA viết; phần popup cắt R1 |
| TE-10 AC8 | LY3 màn thấp | layers §2.5 | 800 × 480; 1280 zoom 200% | TC-299-25 | R12 | ES1-T312 (xong); QA ES1-T318 | S3 | QA viết |
| TE-10 AC9 | focus không bị che | layers §3 | 360 | TC-395-35 | R12 | ES1-T312 (xong); QA ES1-T318 | S3 | QA viết |
| TE-10 AC10 | thanh đáy, lớp | layers §2.2, §2.3, §4, §6, §8 | dưới 80rem | TC-395-36 | R12, R6.1 | ES1-T312 (xong), ES1-T314; QA ES1-T318 | S3 | QA viết |
| TE-10 AC11 | toast | layers §2.4; foundation §17 | 4 mốc | TC-395-37 | R12 | TE-10-R2-FE2 ES1-T313, ES1-T314; QA ES1-T318 | S3 | QA viết |
| TE-10 AC12 | dialog, sheet | foundation §15, §16; layers §1, §4 | 360, 1280 | TC-395-38 | R12 | ES1-T313, TE-10-R2-BE2 ES1-T315, ES1-T312 (xong); QA ES1-T318 | S3 | QA viết |
| TE-10 AC13 | empty state, skeleton | foundation §6, §18 | 4 mốc | TC-395-39 | R12 | ES1-T313; QA ES1-T318 | S3 | QA viết |
| TE-10 AC14 | sổ 11/11 TUÂN THỦ (3) không cắt tên | — | 360, 1280 | TC-395-40 | R7.3, R7.7 | TS-FE5 ES1-T403 (xong), TE-3-R2-FE1 ES1-T337, ES1-T368, ES1-T377, TE-22-R2-FE2 ES1-T327; QA ES1-T412 | S4 | QA viết |
| TE-10 AC15 | sổ 11/11 TUÂN THỦ (5) `.rte` | foundation §28 | 360, 1280 | TC-395-41 | R8, R12 | ES1-T403 (xong); QA ES1-T412 | S3 | QA viết |
| TE-10 AC-H30 | L1 trang chủ 16 block | index | desktop + mobile | TC-H30 | R6.1, R6.2 | ES1-T416; QA ES1-T345 | S3 | sửa |
| TE-10 AC-H31 | ngân sách JS ADR 0006, 0010 | index | 360 | TC-H31 | R6.1 | ES1-T316 (xong), ES1-T344; QA ES1-T346 | S3 | giữ |
| TE-10 AC-H32 | 0 skip do 429 | — | desktop + Pixel 7 | TC-H32 | R9 | DoD QA mọi task | S2–S4 | giữ |
| TE-10 AC-H33 | ES1-T297 #3 tài liệu merchant | — | repo | TC-H33 | R8 | TE-10-DOC1 ES1-T193 (xong), bug ES1-T430 | — | sửa |
| TE-10 AC-H34 | zip không index.te* | — | repo | TC-H34 | R10 | TS-OPS1 ES1-T411 | S4 | giữ |

## TE-11 Quiz

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-11 AC1 | 3 bước quiz-step | quiz-result §1 | 4 mốc | TE-11 TC cũ | R12 | — | — | không task R2 |
| TE-11 AC2 | chuyển bước, Back | quiz-result §1 | 4 mốc | TE-11 TC cũ | R12 | — | — | không task R2 |
| TE-11 AC3 | L5 popup kết quả | quiz-result §2–§5 | 360, 1280 | TC-299-26, TC-299-27 | R12 | TE-11-R2-FE1 ES1-T387, TE-11-R2-BE1 ES1-T388; QA TE-11-QA1 ES1-T140 | S4 | QA viết; ứng viên cắt thứ 1 (ES1-T311) |
| TE-11 AC4 | ES1-T136 #6 | index-mobile-a §6 | dưới 80rem | TE-11 TC cũ | R12 | TE-17-R2-FE2 ES1-T341 | S3 | giữ |
| TE-11 AC5 | L5 a11y dialog | quiz-result §8 | 360, 1280 | TC-299-28 | R12 | ES1-T387, ES1-T388, ES1-T315; QA ES1-T140 | S4 | QA viết |
| TE-11 AC6 | QZ1 | quiz-result §4 | 360, 1280 | TC-299-29 | R7.5, R12 | ES1-T388; QA ES1-T140 | S4 | QA viết |
| TE-11 AC7 | QZ2 | quiz-result §4 | 360, 1280 | TC-299-30 | R12 | ES1-T388, TE-3-R2-BE1 ES1-T374; QA ES1-T140 | S4 | QA viết |
| TE-11 AC8 | QZ3 `?view=quiz` | quiz-result §6 | 4 mốc | TC-299-31 | R7.3, R12 | ES1-T387; QA ES1-T140 | S4 | QA viết |
| TE-11 AC9 | trạng thái 2a, ES1-T436 #3 | quiz-result §5, §7 | 360, 1280 | TC-395-42 | R12 | ES1-T387, ES1-T388; QA ES1-T140 | S4 | QA viết (mặc định ES1-T436) |
| TE-11 AC10 | QZ3, ES1-T436 #1 | quiz-result §6 | 4 mốc | TC-395-43 | R7.3, R12, R17 | ES1-T387; QA ES1-T140 | S4 | QA viết; breadcrumb `?view=quiz` thiếu task (ES1-T436 #1) |
| TE-11 AC11 | audit C8 viền radio | — | 360, 1280 | TC-395-44 | R12 | ES1-T403 (xong); QA ES1-T412 | S3 | QA viết |
| TE-11 AC-H15 | ES1-T308 #1 | index §6 | 1920; theme sạch + store dev | TC-H15 | R8, R12 | ES1-T406, ES1-T341; QA ES1-T345 | S3 | sửa |
| TE-11 AC-H16 | 0 kết quả | quiz-result §5 | 1920 | TC-H16 | R12 | ES1-T387; QA ES1-T140 | S4 | giữ |
| TE-11 AC-H17 | CR-10 body map | — | từ 48rem | TC-H17 | R12 | — | — | không task R2; chờ CR-10 duyệt |

## TE-12 Bundle builder, shop the look

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-12 AC1 | M1, ES1-T309 #2 bậc giảm 0 | index-mobile-b §1 | 4 mốc; theme sạch | TC-394-28, TC-299-22 | R8 | TE-12-R2-FE1 ES1-T339, ES1-T406; QA ES1-T346 | S3 | QA viết |
| TE-12 AC2 | giảm thật ở checkout | — | 1280 | TE-12 TC cũ | R8, R4.1 | — (tài liệu ES1-T150 xong) | — | không task R2 |
| TE-12 AC3 | `items[]` một lần | — | 4 mốc | TE-12 TC cũ | R7.5 | TE-12-R2-BE1 ES1-T340 | S2 | giữ |
| TE-12 AC4 | hết hàng disabled | — | 4 mốc | TE-12 TC cũ | R12 | ES1-T339 | S2 | giữ |
| TE-12 AC5 | CR-6 shop the look | index-mobile-a §7 | 4 mốc | TE-12 TC cũ | R3.1 | TE-17-R2-FE2 ES1-T341 | S3 | giữ |
| TE-12 AC6 | HB1 thanh dính 360 | index-mobile-b §1.1 | 360 | TC-394-29 | R12, R3.1 | ES1-T339, ES1-T340; QA ES1-T346 | S3 | QA viết |
| TE-12 AC7 | HB2 toast, teaser | index-mobile-b §1.1; layers §2.2 | 360 | TC-394-30 | R12 | ES1-T340, ES1-T313, TE-18-R2-FE2 ES1-T390 (cắt R1); QA ES1-T346 | S3 | QA viết; phần teaser cắt R1 |
| TE-12 AC8 | bundle theo mốc | index-mobile-b §1, index-1280 khối 9 | 4 mốc | TC-394-31 | R3.1, R12 | ES1-T339, ES1-T340; QA ES1-T345, ES1-T346 | S3 | QA viết |
| TE-12 AC9 | shop the look theo mốc | index-mobile-a §7, index-1280 khối 7, §2.4 | 4 mốc | TC-394-32 | R3.1, R12 | ES1-T341, ES1-T340; QA ES1-T345, ES1-T346 | S3 | QA viết |
| TE-12 AC-H18 | ES1-T308 #1 bậc giảm store dev | index-1280 khối 9 | 1920; store dev | TC-H18 | R8 | ES1-T339, ES1-T340; fixture ES1-T331 (xong) | S3 | sửa |
| TE-12 AC-H19 | ES1-T308 #1 | index-1280 khối 7 | 1920; store dev | TC-H19 | R8 | ES1-T341; fixture ES1-T331 (xong) | S3 | sửa |
| TE-12 AC-H20 | CR-6 hotspot | index-1280 khối 7 | 1920 | TC-H20 | R12 | ES1-T341 | S3 | giữ |

## TE-13 Featured product, video carousel

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-13 AC1 | CTO audit (2), CD2 | countdown §1–§5 | 4 mốc | TC-294-34, TC-299-12, TC-394-22 | R8 | TE-13-R2-FE1 ES1-T343, TE-13-R2-BE1 ES1-T344; QA ES1-T346 | S3 | QA viết |
| TE-13 AC2 | M3, sổ 11/11 TUÂN THỦ (6) | index-mobile-b §2 | 4 mốc | TC-299-10, TC-394-33 | R4.12 | TE-17-R2-FE3 ES1-T342, TS-FE9 ES1-T409, TS-BE1 ES1-T410; QA ES1-T346 | S3 | QA viết |
| TE-13 AC3 | video carousel ≤ 8 | index-mobile-b §3 | 4 mốc | TE-13 TC cũ | R4.12, R17 | TE-7-R2-FE1 ES1-T334 | S3 | giữ |
| TE-13 AC4 | video lỗi | index-mobile-b §3 | 1280 | TE-13 TC cũ | R12 | ES1-T334 | S3 | giữ |
| TE-13 AC5 | L1 Lighthouse | index | desktop + mobile | TC-299-01 | R6.1, R6.2 | ES1-T416; QA ES1-T345 | S3 | QA viết |
| TE-13 AC6 | featured theo mốc | index-mobile-b §2, index-1280 khối 10, countdown §2 | 4 mốc | TC-394-34 | R3.1, R12 | ES1-T342, ES1-T343; QA ES1-T346 | S3 | QA viết |
| TE-13 AC7 | countdown editor | countdown §5, §6 | editor | TC-394-35 | R8, R14 | ES1-T343; QA ES1-T346 (tay) | S3 | QA viết (tay) |
| TE-13 AC8 | HD3 video | index-mobile-b §3, index-1280 khối 11 | 4 mốc | TC-394-36 | R3.1, R12, R17 | ES1-T334, ES1-T335, ES1-T344; QA ES1-T345, ES1-T346 | S3 | QA viết |
| TE-13 AC-H21 | ES1-T308 #1 video copy | index-1280 khối 11 | 1920; store dev | TC-H21 | R8 | ES1-T334; fixture ES1-T331 (xong); QA ES1-T345 | S3 | sửa |
| TE-13 AC-H22 | L4 nhãn nút featured | index-1280 khối 10 | 1920 | TC-H22 | R7.2 | ES1-T342, ES1-T350, ES1-T344 | S3 | sửa |
| TE-13 AC-H23 | countdown < 24 giờ | countdown §3 | 1920 | TC-H23 | R8 | ES1-T343, ES1-T344 | S3 | sửa |

## TE-14 Sidekick, Canvas

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-14 AC1 | Editions #1 AGENTS.md | — | repo | TE-14 TC cũ | Canvas, R2 | — (CTO sửa AGENTS.md cùng PR ES1-T349, ES1-T310 #2) | S3 | không task R2 |
| TE-14 AC2 | Editions #2 DESIGN.md | — | repo | TE-14 TC cũ | Canvas | — | — | không task R2 |
| TE-14 AC3 | 10 yêu cầu Sidekick | — (checklist-canvas) | yum-dev (người làm) | TE-14 TC cũ (tay) | Canvas C4 | — | cuối mỗi sprint | không task R2; người làm |
| TE-14 AC4 | logical properties | — | repo | TE-14 TC cũ | R12 | TE-10-R2-FE3 ES1-T317 | S4 | giữ |

## TE-15 Collection list, shop by level

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-15 AC1 | HD3 danh mục | index-mobile-a §3, index-1280 khối 3, §2.2 | 4 mốc | TC-394-37 | R3.1, R12, R17 | TE-7-R2-FE1 ES1-T334, TE-7-R2-BE1 ES1-T335; QA ES1-T345, ES1-T346 | S3 | QA viết |
| TE-15 AC2 | level card | index-mobile-a §4, index-1280 khối 4, §2.3 | 4 mốc | TC-394-38 | R3.1, R12 | TE-17-R2-FE1 ES1-T336; QA ES1-T345, ES1-T346 | S3 | QA viết |
| TE-15 AC-H8 | hàng 3 | index-1280 khối 3 | 1920 | TC-H8 | R3.1 | ES1-T334, ES1-T335 | S3 | giữ |
| TE-15 AC-H9 | hàng 3 dưới 5 collection | index-1280 khối 3 | 1920 | TC-H9, TC-394-37 | R3.1 | ES1-T334 | S3 | sửa |
| TE-15 AC-H10 | hàng 4b products_count | index-1280 khối 4 | 1920 | TC-H10 | R7.3 | ES1-T336 | S3 | giữ |

## TE-16 Blog posts trang chủ

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-16 AC1 | HD3 blog posts | index-mobile-b §6, index-1280 khối 14 | 4 mốc | TC-394-39 | R3.1, R12, R17 | TE-7-R2-FE1 ES1-T334, TE-7-R2-BE1 ES1-T335; QA ES1-T345, ES1-T346 | S3 | QA viết |
| TE-16 AC-H26 | card 336 × 448 | index-mobile-b §6, index-1280 khối 14 | 4 mốc | TC-H26 | R3.1 | ES1-T334 | S3 | sửa |
| TE-16 AC-H27 | dưới 5 bài | index-1280 khối 14 | 1920 | TC-H27 | R3.1 | ES1-T334 | S3 | giữ |

## TE-17 Trang chủ giống Figma

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-17 AC-H1 | ES1-T308 #1 Given store dev | index | 1920; store dev | TC-H1 | R3, R14 | fixture TE-17-R2-QA0 ES1-T331 (xong); QA TE-17-R2-QA1 ES1-T345 | S3 | sửa |
| TE-17 AC-H2 | ES1-T308 #1 | index | 1920; store dev | TC-H2 | R3, R14 | ES1-T331 (xong); QA ES1-T345 | S3 | sửa |
| TE-17 AC-H3 | ES1-T308 #1 | index | 1920; store dev | TC-H3 | R3, R14 | ES1-T331 (xong); QA ES1-T345 | S3 | sửa |
| TE-17 AC-H4 | token theo node | index | 1920 | TC-H4 | R3, R16 | QA ES1-T345 | S3 | giữ |
| TE-17 AC-H5 | ES1-T308 #1, ES1-T309 #3 | index | 1920; store dev | TC-H5 | R8 | ES1-T331 (xong); QA ES1-T345 | S3 | sửa |
| TE-17 AC-H6 | sửa setting trong editor | — | editor store dev | TC-H6 (tay) | R14, Canvas | ES1-T331 (xong), spike ES1-T428 (chưa xếp sprint) | — | giữ; chờ ES1-T428 (ES1-T440 #4) |
| TE-17 AC-H7 | focus, hover | index; foundation §2 | 1920 | TC-H7 | R12 | TE-10-R2-FE2 ES1-T313; QA ES1-T345 | S3 | giữ |
| TE-17 AC-H35 | 360, 768 không tràn | index-mobile-a, index-mobile-b | dưới 80rem | TC-H35 | R12, R3.1 | ES1-T336, ES1-T341; QA TE-17-R2-QA2 ES1-T346 | S3 | giữ |
| TE-17 AC-H36 | ES1-T308 #1 AC ngược | index | 4 mốc; theme sạch | TC-H36 | R8, R14 | ES1-T405, ES1-T406, ES1-T402; QA ES1-T412, ES1-T345 | S3 | QA viết |
| TE-17 AC-H37 | ES1-T309 #4 đo khối 1280 | index-1280 §0, §1 | 1280; store dev | TC-H37 | R3.1 | ES1-T332, ES1-T334, ES1-T336, ES1-T339, ES1-T341, ES1-T342; QA ES1-T345 | S3 | QA viết |
| TE-17 AC-H38 | ES1-T309 #4 đo khối 768/360 | index-mobile-a §0–§8, index-mobile-b §0–§7 | dưới 80rem; store dev | TC-H38 | R3.1 | như AC-H37; QA ES1-T346 | S3 | QA viết |

## TE-18 Popup marketing (Should, cắt R1)

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-18 AC1 | MK1, MK3 | marketing-popups §2, §3 | 360, 1280 | TC-294-35 | R6.1, R8 | TE-18-R2-FE1 ES1-T389, TE-18-R2-BE1 ES1-T391; QA TE-18-R2-QA1 ES1-T393 | cắt R1 | Should, cắt R1 |
| TE-18 AC2 | MK3–MK5 hàng đợi | marketing-popups §1; layers §4 | 360, 1280 | TC-294-36 | R8 | ES1-T391; QA ES1-T393 | cắt R1 | Should, cắt R1 |
| TE-18 AC3 | MK3 tần suất | marketing-popups §1 | 360, 1280 | TC-294-37 | R8 | ES1-T391; QA ES1-T393 | cắt R1 | Should, cắt R1 |
| TE-18 AC4 | trang loại trừ | marketing-popups §1 | 360, 1280 | TC-294-38 | R8 | ES1-T389; QA ES1-T393 | cắt R1 | Should, cắt R1 |
| TE-18 AC5 | MK6 before you leave | marketing-popups §3 | 360, 1280 | TC-294-39 | R8 | ES1-T389; QA ES1-T393 | cắt R1 | Should, cắt R1 |
| TE-18 AC6 | MK2 Big Offer | marketing-popups §4 | 360, 1280 | TC-294-40 | R8, R12 | TE-18-R2-FE2 ES1-T390, TE-18-R2-BE2 ES1-T392; QA ES1-T393 | cắt R1 | Should, cắt R1 |
| TE-18 AC7 | sổ 11/11 TUÂN THỦ (7), ES1-T436 #4 | marketing-popups §2 | 360, 1280 | TC-395-45, TC-299-32, TC-294-41 | R4.9, R8, R12 | ES1-T389, ES1-T392; QA ES1-T393 | cắt R1 | Should, cắt R1; mặc định ES1-T436 |
| TE-18 AC8 | A11y popup | marketing-popups §2–§4; foundation §15 | 360, 1280 | TC-294-42 | R12 | ES1-T389, TE-10-R2-BE2 ES1-T315; QA ES1-T393 | cắt R1 | Should, cắt R1 |
| TE-18 AC9 | NFR-4, NFR-1 | marketing-popups §5 | nojs; desktop + mobile | TC-294-43 | R6.1, NFR-4 | ES1-T389; QA ES1-T393 | cắt R1 | Should, cắt R1 |
| TE-18 AC10 | ES1-T308 #1, ES1-T422 #1 | marketing-popups §2–§4 | theme sạch + store dev | TC-395-46 | R8, R14 | ES1-T389, ES1-T390; QA ES1-T393 | cắt R1 | Should, cắt R1 |
| TE-18 AC11 | teaser, thẻ | marketing-popups §4 | 360, 1280 | TC-395-47 | R12 | ES1-T390, ES1-T392; QA ES1-T393 | cắt R1 | Should, cắt R1 |

## TE-19 Upsell giỏ hàng (Should, cắt R1 theo CTO 12/11 ES1-T422 #3)

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-19 AC1 | G2 complementary ≤ 4 | cart §3.8 | 4 mốc | TC-396-01 | R4.11, R7.5 | TE-19-R2-FE1 ES1-T371, TE-19-R2-BE1 ES1-T372; QA TE-19-R2-QA1 ES1-T376 | cắt R1 | Should, cắt R1 |
| TE-19 AC2 | ẩn khi 0, lỗi, rỗng, tắt | cart §3.8 | 4 mốc | TC-396-02 | R4.11, R3.1 | ES1-T371, ES1-T372; QA ES1-T376 | cắt R1 | Should, cắt R1 |
| TE-19 AC3 | bố cục theo mốc, HD3 | cart §2, §3.8 | 4 mốc | TC-396-03 | R3.1, R12 | ES1-T371; QA ES1-T376 | cắt R1 | Should, cắt R1 |
| TE-19 AC4 | thêm giỏ, 422, không JS | cart §3.8 | 4 mốc + nojs | TC-396-04 | R7.5, R12 | ES1-T371, ES1-T372; QA ES1-T376 | cắt R1 | Should, cắt R1 |
| TE-19 AC5 | nhiều biến thể | cart §3.8 | 4 mốc | TC-396-05 | R7.5 | ES1-T371; QA ES1-T376 | cắt R1 | Should, cắt R1 |
| TE-19 AC6 | skeleton, lazy, CLS | cart §3.8, §8 | 4 mốc | TC-396-06 | R17, R6.1 | ES1-T371, ES1-T372; QA ES1-T376 | cắt R1 | Should, cắt R1 |
| TE-19 AC7 | a11y | cart §6 | 4 mốc | TC-396-07 | R12 | ES1-T371; QA ES1-T376 | cắt R1 | Should, cắt R1 |
| TE-19 AC8 | ES1-T308 #1, ES1-T422 #1 | cart §5 | theme sạch + store dev | TC-396-08 | R8, R14 | ES1-T371; fixture ES1-T331 (xong); QA ES1-T376 | cắt R1 | Should, cắt R1 |
| TE-19 AC9 | upsell drawer | mini-cart-quickview §1.2.5, §2 | 4 mốc | TC-396-09 | R4.11, R12 | chưa có (ES1-T422 #3) | sau R1 | sau R1 |

## TE-20 Blog và bài viết

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-20 AC1 | bố cục trang 1 | blog §1 | 4 mốc | TC-396-10 | R7.7 | TE-20-R2-FE1 ES1-T381; QA TE-20-R2-QA1 ES1-T385 | S4 | QA viết; nav chủ đề và bài nổi bật là ứng viên cắt thứ 2 (ES1-T311) |
| TE-20 AC2 | sổ 11/11 (3), (4) excerpt, không cắt tiêu đề | blog §3 | 4 mốc | TC-396-11 | R7.7, R8 | ES1-T381, TS-FE5 ES1-T403 (xong), TS-FE7 ES1-T407; QA ES1-T385 | S4 | QA viết |
| TE-20 AC3 | lọc tag | blog §1.4, §4 | 4 mốc + nojs | TC-396-12 | R7.7, R12, NFR-4 | ES1-T381; QA ES1-T385 | S4 | QA viết |
| TE-20 AC4 | rỗng | blog §4 | 4 mốc | TC-396-13 | R7.7 | ES1-T381; QA ES1-T385 | S4 | QA viết |
| TE-20 AC5 | phân trang chung | blog §5; pagination | 4 mốc | TC-396-14, TC-299-17 | R7.7 | ES1-T381, TE-6-R2-FE1 ES1-T364; QA ES1-T385 | S4 | QA viết; TC-299-17 giữ |
| TE-20 AC6 | Lighthouse, LCP, title | blog §7 | desktop + mobile | TC-396-15 | R6.1, R6.2, R11, R17 | ES1-T381; QA ES1-T385 | S4 | QA viết |
| TE-20 AC7 | a11y | blog §6 | 4 mốc | TC-396-16 | R12 | ES1-T381; QA ES1-T385 | S4 | QA viết |
| TE-20 AC8 | trang chủ không đổi | blog §2, §10 | 1920 | TC-H26, TC-H27 | R7.7 | ES1-T381 | S4 | giữ |
| TE-20 AC9 | A1 ảnh bìa không đè | article §1, §3 | 4 mốc | TC-396-17 | R17, R6.1 | TE-20-R2-FE2 ES1-T382; QA ES1-T385 | S4 | QA viết |
| TE-20 AC10 | `.rte`, sổ 11/11 (5) | article §1.3, §4 | 4 mốc | TC-396-18 | R7.7, R8 | ES1-T382, ES1-T403 (xong); QA ES1-T385 | S4 | QA viết |
| TE-20 AC11 | PG1 bình luận | article §1.4; pagination | 4 mốc | TC-396-19, TC-299-18 | R7.7 | ES1-T382, ES1-T364; QA ES1-T385 | S4 | QA viết; TC-299-18 giữ |
| TE-20 AC12 | A3, audit B #24 form | article §5 | 4 mốc + nojs | TC-396-20 | R7.7, R12, NFR-4 | ES1-T382, ES1-T407; QA ES1-T385 | S4 | QA viết |
| TE-20 AC13 | bài liên quan, HD3 | article §1.5, §3 | 4 mốc | TC-396-21 | R12 | ES1-T382, TE-7-R2-FE1 ES1-T334; QA ES1-T385 | S4 | QA viết; ứng viên cắt thứ 2 (ES1-T311) |
| TE-20 AC14 | SEO, JSON-LD | article §7 | desktop + mobile | TC-396-22 | R11, R6.1, R6.2 | ES1-T382, TE-22-R2-FE1 ES1-T326; QA ES1-T385 | S4 | QA viết |
| TE-20 AC15 | ES1-T308 #1, ES1-T422 #1 | blog §2; article §2 | theme sạch + store dev | TC-396-23 | R8, R14 | ES1-T381, ES1-T382; fixture ES1-T331 (xong); QA ES1-T385 | S4 | QA viết |

## TE-21 Trang phụ

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-21 AC1 | PG2 10/11 page | page §2, §4 | 4 mốc | TC-396-24 | R7.6 | TE-21-R2-FE1 ES1-T383; QA TE-21-R2-QA1 ES1-T386 | S4 | QA viết |
| TE-21 AC2 | sổ 11/11 (5) `.rte` | page §4 | 4 mốc | TC-396-25 | R8, R12 | ES1-T383, ES1-T403 (xong); QA ES1-T386 | S4 | QA viết |
| TE-21 AC3 | PG1 10/11 contact | page §1, §2, §4 | 4 mốc | TC-396-26 | R7.6 | ES1-T383, TS-FE7 ES1-T407; QA ES1-T386 | S4 | QA viết |
| TE-21 AC4 | validation | page §6 | 4 mốc + nojs | TC-396-27 | R12, NFR-4 | ES1-T383; QA ES1-T386 | S4 | QA viết |
| TE-21 AC5 | gửi form | page §6 | 4 mốc | TC-396-28 | R7.6 | ES1-T383; QA ES1-T386 | S4 | QA viết |
| TE-21 AC6 | Lighthouse, a11y | page §7, §9 | desktop + mobile; 4 mốc | TC-396-29 | R6.1, R6.2, R11, R12 | ES1-T383; QA ES1-T386 | S4 | QA viết |
| TE-21 AC7 | E1 10/11 404 | 404 §2, §4 | 4 mốc | TC-396-30 | R7.9, R12 | TE-21-R2-FE2 ES1-T384, TS-FE8 ES1-T408 (xong); QA ES1-T386 | S4 | QA viết |
| TE-21 AC8 | 404 danh mục, sản phẩm | 404 §3, §5 | 4 mốc | TC-396-31 | R7.9, R17 | ES1-T384; QA ES1-T386 | S4 | QA viết |
| TE-21 AC9 | PW2 password | password §1, §2 | 4 mốc | TC-396-32 | R7.9 | ES1-T384, ES1-T408 (xong); QA ES1-T386 | S4 | QA viết |
| TE-21 AC10 | PW1 newsletter | password §2, §5 | 4 mốc + nojs | TC-396-33 | R7.9, R4.9, NFR-4 | ES1-T384; QA ES1-T386 | S4 | QA viết |
| TE-21 AC11 | sai mật khẩu | password §5 | 4 mốc | TC-396-34 | R7.9, R12 | ES1-T384; QA ES1-T386 | S4 | QA viết |
| TE-21 AC12 | ảnh, LCP | password §4, §8 | 4 mốc | TC-396-35 | R17, R6.1 | ES1-T384; QA ES1-T386 | S4 | QA viết |
| TE-21 AC13 | GC1 gift card | gift-card §1, §2 | 4 mốc | TC-396-36 | R4.4, R7.9 | ES1-T384, ES1-T408 (xong), TS-BE1 ES1-T410; QA ES1-T386 | S4 | QA viết |
| TE-21 AC14 | hết hạn, bị tắt | gift-card §5 | 4 mốc | TC-396-37 | R7.9, R12 | ES1-T384; QA ES1-T386 | S4 | QA viết |
| TE-21 AC15 | copy, print, không JS | gift-card §5 | 4 mốc + nojs | TC-396-38 | R7.9, NFR-4 | ES1-T410; QA ES1-T386 | S4 | QA viết |
| TE-21 AC16 | phạm vi SEO 10/11 | 404, password, gift-card | desktop + mobile | TC-396-39 | R6.1, R6.2 | ES1-T384; QA ES1-T386 | S4 | QA viết |
| TE-21 AC17 | ES1-T308 #1, ES1-T422 #1 | page §3; 404 §3; password §3 | theme sạch + store dev | TC-396-40 | R8, R14 | ES1-T383, ES1-T384; fixture ES1-T331 (xong); QA ES1-T386 | S4 | QA viết |

## TE-22 Điều hướng mở rộng

| AC | Yêu cầu nguồn | ui-spec | Mốc | TC | Mã R | Task R2 | Sprint | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-22 AC1 | N1–N3, TE-1 AC2 từ 80rem | navigation §6 | 1280, 1920 + nojs | TC-396-41 | R4.8, R12, NFR-4 | TE-22-R2-FE2 ES1-T327, TE-22-R2-BE1 ES1-T329; QA TE-22-R2-QA1 ES1-T330 | S3 | QA viết; TC TE-1 AC2 sửa |
| TE-22 AC2 | N3 kiểu panel | navigation §3 | 1280, 1920 | TC-396-42 | R4.8 | ES1-T327; QA ES1-T330 | S3 | QA viết |
| TE-22 AC3 | sổ 09/11 nhãn View all | navigation §3 | 1280, 1920 | TC-396-43 | R11, R12 | ES1-T327; QA ES1-T330 | S3 | QA viết |
| TE-22 AC4 | N1 cấp 3 drawer | navigation §2, §5.3 | dưới 80rem + nojs | TC-396-44 | R4.8, NFR-4 | ES1-T327, TE-1-R2-FE3 ES1-T320; QA ES1-T330 | S3 | QA viết |
| TE-22 AC5 | N2 ảnh, sản phẩm (Should) | navigation §4 | 4 mốc | TC-396-45 | R4.8 | TE-22-R2-FE3 ES1-T328 | cắt R1 | Should, cắt R1 |
| TE-22 AC6 | ảnh menu tải khi mở | navigation §9 | 1280, 1920 | TC-396-46 | R17, R6.1 | ES1-T327, ES1-T328 (cắt R1); QA ES1-T330 | S3 | QA viết; phần ảnh mega theo ES1-T328 |
| TE-22 AC7 | a11y menu | navigation §8 | 4 mốc | TC-396-47 | R12 | ES1-T327, ES1-T329; QA ES1-T330 | S3 | QA viết |
| TE-22 AC8 | menu trống | navigation §7 | 4 mốc; theme sạch | TC-396-48 | R14 | ES1-T327; QA ES1-T330 | S3 | QA viết |
| TE-22 AC9 | breadcrumb, ES1-T436 #1 | foundation §5; search §2; list-collections §1; quiz-result §6 | 4 mốc | TC-396-49, TC-395-48 | R12, R7.3, R7.7, R11 | TE-22-R2-FE1 ES1-T326, ES1-T367, ES1-T128, ES1-T387; QA ES1-T330 | S4 | QA viết; TC-395-48 sửa; search, `?view=quiz` thiếu task (ES1-T436 #1) |
| TE-22 AC10 | ES1-T422 #2 không cắt tên | foundation §5 | 360, 1280 | TC-396-50 | R12 | ES1-T326; QA ES1-T330 | S3 | QA viết |
| TE-22 AC11 | banner | foundation §3.3 | 4 mốc | TC-396-51 | R12, R6.1 | ES1-T326; QA ES1-T330 | S3 | QA viết |
| TE-22 AC12 | BreadcrumbList | foundation §5 | repo + 1280 | TC-396-52 | R11 | ES1-T326; QA ES1-T330 | S3 | QA viết |
| TE-22 AC13 | tiêu đề trang | foundation §5 | 4 mốc | TC-396-53 | R12 | ES1-T326; QA ES1-T330 | S3 | QA viết |
| TE-22 AC14 | ES1-T308 #1 | navigation §7 | theme sạch + store dev | TC-396-54 | R14, R8 | ES1-T327, ES1-T328; fixture ES1-T331 (xong); QA ES1-T330 | S3 | QA viết |

## Kiểm đủ (đếm tay)

- Số dòng AC theo story, khớp số AC trong `docs/srs.md` 0.5: NFR 7; TE-1 16; TE-2 10; TE-3 22; TE-4 32; TE-5 19; TE-6 15; TE-7 9; TE-8 14; TE-9 7; TE-10 20; TE-11 14; TE-12 12; TE-13 11; TE-14 4; TE-15 5; TE-16 3; TE-17 11; TE-18 11; TE-19 9; TE-20 15; TE-21 17; TE-22 14. Tổng 297 dòng = 7 NFR + 290 AC.
- Mọi dòng có ≥ 1 TC (2 dòng trỏ TE-9 AC2, AC3 dùng TC của TE-21, TE-20) và ≥ 1 mã R hoặc NFR. Không có TC nào đứng một mình không gắn AC.
- Phân bố trạng thái: dòng "Should, cắt R1" gồm TE-18 (11), TE-19 AC1–AC8 (8), TE-4 AC18, TE-22 AC5 = 21. "sau R1" có 1 dòng (TE-19 AC9). Should nhưng vẫn ở Sprint 4: TE-8 AC13.
- AC thiếu task R2 (5 mục):
  - TE-3 AC18 và AC-H12, phần BE (ES1-T440 #3).
  - TE-10 AC5 docs/merchant (ES1-T440 #2).
  - R19 release notes, không có AC (ES1-T440 #1).
  - Breadcrumb search, thuộc TE-8 AC5 và TE-22 AC9 (ES1-T436 #1).
  - Breadcrumb `?view=quiz`, thuộc TE-11 AC10 và TE-22 AC9 (ES1-T436 #1).
- AC không có task R2 vì đã có trong code hoặc người làm tay (REQ-0002 không đổi): TE-1 AC7; TE-2 AC4; TE-3 AC4, AC5, AC7; TE-4 AC10; TE-7 AC4; TE-9 AC5, AC6; TE-10 AC4; TE-11 AC1, AC2, AC-H17; TE-12 AC2; TE-14 AC1–AC3. QA vẫn kiểm các AC này theo TC cũ.
- Ứng viên cắt khi không nới giờ FE (ES1-T311), theo thứ tự: (1) TE-11 AC3, AC5–AC7, AC9 (popup kết quả quiz), (2) TE-20 AC1 phần nav chủ đề và bài nổi bật, TE-20 AC13, (3) TE-6 AC5, AC15.
- Task R2/TS đã đóng tới 13/11: ES1-T312, ES1-T316, ES1-T331, ES1-T401, ES1-T403, ES1-T404, ES1-T408. Task Sprint 2 mà nhiều dòng AC ở Sprint 3 phụ thuộc, còn mở: ES1-T313, ES1-T314, ES1-T315, ES1-T402, ES1-T405, ES1-T406.
