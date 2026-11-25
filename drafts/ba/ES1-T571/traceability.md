KHÔNG CHẮC: (1) Chưa chạy `traceability.py` (phiên không có shell, `../ai-team/checks/ba/` ngoài quyền đọc); số dòng đếm tay. (2) TC giữ mã cũ của bản 0.5 (ES1-T394, ES1-T395, ES1-T396, ES1-T294, TC-H*); kỳ vọng đổi theo cột "Sau", QA sửa assert ở ticket ghi cột "Kiểm". (3) Chỉ báo tải 500 ms phía JS (notes ES1-T567 §3 #22) chưa thấy mã ticket BE trong nguồn đã đọc; ES1-T582 AC4 kiểm sau khi BE merge. (4) TE-8 AC12 chờ ES1-T586, dòng store của AC-H2 chờ ES1-T587.

# ES1-T571: ma trận truy vết SRS 0.6 (yêu cầu → AC → TC → mã R → ticket làm → ticket kiểm)

Chỉ gồm AC đổi ở bản 0.6. AC không đổi giữ dòng ở `drafts/ba/ES1-T397/traceability.md` (bảng gộp 0.5). Trạng thái: "sửa" = TC có sẵn, kỳ vọng đổi.

| Yêu cầu (nguồn) | Story / AC | Sau (tóm tắt) | TC | Mã R | Ticket làm | Ticket kiểm | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| content.md §2 phần trăm sentence case | TE-1 AC12 | không "Get 15% off" (không phân biệt hoa thường) | TC-395-02 | R4.9, R13, R8, R12 | ES1-T578 | ES1-T578 (assert chuỗi) | sửa |
| như trên | TE-1 AC-H28 | như trên | TC-H28 | R8, R4.9 | ES1-T578 | ES1-T578 | sửa |
| notes §10.1; content.md §5 Badge | TE-3 AC3 | badge "−N%" U+2212 | TE-3 TC cũ (TE-3.spec.ts:128) | R7.3 | ES1-T579 | ES1-T579 AC6 | sửa |
| notes phụ lục; content.md §2 | TE-3 AC18 | "Nothing in {tên tab} yet" | TC-394-07 | R12 | ES1-T578 | ES1-T578 | sửa |
| notes §10.1 control 48; product.md | TE-4 AC25 | Add to cart cao 48 ở 4 mốc | TC-394-15 | R7.2, R8, R12 | ES1-T576 | ES1-T582 | sửa |
| notes §3 #21; content.md §8 | TE-5 AC12 | discount dòng "−{số tiền}" | TC-395-07 | R4.1, R4.4, R4.16, R7.5, R12 | ES1-T579 | ES1-T579 | sửa |
| notes §10.1; cart.md §2; content.md §8 | TE-5 AC14 | Checkout 48 mọi mốc; "−{x}" | TC-395-09 | R4.1, R7.5, R3.1, R12 | ES1-T576, ES1-T579 | ES1-T582, ES1-T579 | sửa |
| notes §10.1; mini-cart-quickview.md §1 | TE-5 AC15 | Checkout drawer 48 | TC-395-10, TC-480-01–03 | R7.5, R12 | ES1-T576 | ES1-T582 | sửa |
| notes §9.2; content.md §4 | TE-5 AC18 | nút "Try again" ở cart page và drawer; `cart.error` "Check your connection, then try again." | TC-395-13 | R7.5, R12 | ES1-T578 (chuỗi); alert JS: BE (ES1-T578 ngoài phạm vi) | ES1-T578 | sửa |
| notes §10.1 | TE-6 AC11 | nút Filter 48 mọi mốc | TC-395-18 | R7.3, R12 | ES1-T576 | ES1-T582 | sửa |
| notes §10.1, §9.2 | TE-6 AC14 | ngưỡng tải 500 ms; "Clear all filters" | TC-395-21 | R7.3, R12 | BE (notes §3 #22); ES1-T578 | ES1-T582 (450 / 550 ms) | sửa |
| notes §2 collection card 3/2; list-collections.md §3 | TE-6 AC15 | ảnh 3/2: 152 × 101 … 336 × 224; tên 20px dưới 48rem | TC-395-22 | R7.4, R3.1, R12, R17 | ES1-T580 | ES1-T580 AC2, ES1-T582 | sửa |
| notes §2 review 16/9; index-mobile-b.md §4 | TE-7 AC6 | ảnh 272 × 153, 308 × 173, 360 × 203, 456 × 257 | TC-394-24 | R3.1, R12 | ES1-T580 | ES1-T582 | sửa |
| notes phụ lục | TE-8 AC8 | "Nothing matches “{q}” yet" | TC-395-27 | R7.8, R17 | ES1-T578 | ES1-T578 | sửa |
| CTO 21/11 sentence case | TE-10 AC13 | nhãn nút sentence case | TC-395-39 | R12 | ES1-T578 | ES1-T578 | sửa |
| notes §2 `.rte` 16/28 | TE-10 AC15 | `.rte` 16/28 | TC-395-41 | R8, R12 | ES1-T577 | ES1-T577 AC2 | sửa |
| notes §9.2; quiz-result.md §6 | TE-11 AC10 | link "Retake quiz" | TC-395-43 | R7.3, R12, R17 | ES1-T578 | ES1-T578 | sửa |
| notes §2 shop the look 1/1; mockup ES1-T278 | TE-12 AC9 | ảnh 320 × 320, 728 × 728, 819 × 819; "Setup not added" | TC-394-32 | R3.1, R12 | ES1-T580, ES1-T578 | ES1-T582 | sửa |
| notes §2 featured 1/1 | TE-13 AC6 | 1280 ảnh 580 × 580 | TC-394-34 | R3.1, R12 | ES1-T580 | ES1-T582 | sửa |
| notes §2 danh mục 3/2 | TE-15 AC1 | ảnh 252 × 168, 307 × 205, 271 × 180 | TC-394-37 | R3.1, R12, R17 | ES1-T580 | ES1-T582 | sửa |
| index-1280.md §1 khối 3 | TE-15 AC-H8 | card rộng 336, ảnh 336 × 224 | TC-H8 | R3.1 | ES1-T580 | ES1-T582 | sửa |
| index-mobile-b.md §6 | TE-16 AC1 | 768 card 308 × 411 | TC-394-39 | R3.1, R12, R17 | ES1-T580 | ES1-T582 | sửa |
| CTO 21/11 mockup nguồn chuẩn | TE-17 AC-H1 | 16 khối mockup (home-content ES1-T571 mục 1) | TC-H1 | R3, R14 | fixture ES1-T331 | ES1-T582 | sửa |
| như trên | TE-17 AC-H2 | bảng home-content ES1-T571 | TC-H2 | R3, R14 | fixture ES1-T331; DevOps ES1-T574 | ES1-T582; dòng store chờ ES1-T587 | sửa |
| như trên; ES1-T582 | TE-17 AC-H3 | so ảnh chụp mockup `index-1920.png` | TC-H3 | R3, R14 | — | ES1-T582 AC3 | sửa |
| content.md §2 | TE-17 AC-H36 | "Get 15% off" không phân biệt hoa thường | TC-H36 | R8, R14 | ES1-T578 | ES1-T578 | sửa |
| notes §2; index-1280.md §1 | TE-17 AC-H37 | hero 1280 × 640; 271 × 180; 819 × 819; 580 × 580; 360 × 203; 600 × 600; 442 × 435 | TC-H37 | R3.1 | ES1-T580 | ES1-T582 | sửa |
| notes §2; index-mobile-a.md, index-mobile-b.md | TE-17 AC-H38 | 360: 252 × 168, 320 × 320, 272 × 153, 320 × 320; 768: 307 × 205, 728 × 728, 308 (308 × 173), 308 × 411, 553 × 553 | TC-H38 | R3.1 | ES1-T580 | ES1-T582 | sửa |
| notes §10.1; content.md §4 | TE-18 AC6 | nút "View offer" | TC-294-40 | R8, R12 | ES1-T578 (khi block big offer có) | ES1-T582 (khi block có) | sửa; Should |
| content.md §2 | TE-18 AC10 | không "15% off" (không phân biệt hoa thường) | TC-395-46 | R8, R14 | ES1-T578 | ES1-T578 | sửa; Should |
| notes §10.1; kit `--space-7xl` | TE-19 AC1 | `--section-gap` 128 từ 1280 | TC-396-01 | R4.11, R7.5 | ES1-T576 (token 128) | ES1-T582 | sửa; Should |
| notes §9.2; content.md §2 | TE-19 AC4 | tên truy cập "Add to cart: {tên}" | TC-396-04 | R7.5, R12 | ES1-T578 | ES1-T578 | sửa; Should |
| notes §2 bìa 2/1; article.md §3 | TE-20 AC9 | 1240 × 620, 1416 × 708 | TC-396-17 | R17, R6.1 | ES1-T580 | ES1-T580 AC3 | sửa |
| notes §2 `.rte` 16/28 | TE-21 AC1 | page 16/28 | TC-396-24 | R7.6 | ES1-T577 | ES1-T577 AC2 | sửa |
| notes §10.1; page.md §9 | TE-21 AC6 | input, nút 48 mọi mốc | TC-396-29 | R6.1, R6.2, R11, R12 | ES1-T576 | ES1-T582 | sửa |
| notes phụ lục | TE-21 AC17 (bảng setting password-hero) | store dev "Level up <em>your fitness</em>" | TC-396-40 | R8, R14 | fixture ES1-T331; DevOps ES1-T574 | ES1-T582 | sửa |
| ticket ES1-T571 | TE-9 AC4 | dữ liệu demo theo home-content ES1-T571 mục 3 | TC-394-26 | R20, R8 | DevOps ES1-T574 | QA ES1-T582 | sửa |

Tổng: 37 dòng = 38 dòng sửa ở `srs-changes.md` mục B (TE-17 ghi chú dưới AC, B29, không phải AC nên không có dòng TC). 37/37 có TC, 37/37 có mã R, 37/37 có ticket kiểm. Thiếu: mã ticket BE cho ngưỡng tải 500 ms (TE-6 AC14).
