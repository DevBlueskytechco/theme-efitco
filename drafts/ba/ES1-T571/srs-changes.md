KHÔNG CHẮC: (1) TE-8 AC12 giữ 200 ms vì `docs/ui-spec/predictive-search.md` §6 chưa đổi, hỏi Designer ES1-T586 (im lặng tới 25/11/2026 = giữ). (2) Dòng dữ liệu store của bảng nội dung trang chủ lệch mockup, hỏi CTO ES1-T587 (im lặng tới 25/11/2026 = dòng lệch che khi so ở AC-H2). (3) Phiên BA không có shell, `../ai-team/checks/ba/` ngoài quyền đọc: chưa chạy `vague_words.py`, `traceability.py`; đã rà tay (mục C). (4) `drafts/ba/ES1-T571/srs.md` thay `docs/srs.md`, `requirements-map.md` thay `docs/requirements-map.md`: Orchestrator chép.

# ES1-T571 — SRS 0.5 → 0.6: số đo và chuỗi trong AC theo kit 2.0.0

Nguồn: ES1-T567 notes §2 (bảng giá trị), §9.2 (chuỗi), §10.1, §10.3; `docs/design/content.md` §2, §8; `drafts/designer/_kit/kit.css` (`--control-height` 48, `--space-7xl` 128, `--line-height-reading` 1.75 = 16/28); ui-spec đã cập nhật theo ES1-T567: `cart.md` §2 (Checkout 48), `product.md` §2 (nút 48), `page.md` §9 (input, nút 48), `collection.md` §6, `index-1280.md` §1, `index-mobile-a.md` §2–§7, `index-mobile-b.md` §2–§7, `list-collections.md` §3, `article.md` §3, `quiz-result.md` §6, `index-mobile-a.md` §7 (alert shop the look), `content.md` §2, §4.
Số AC: không đổi (không thêm, không bỏ AC). Mục 3 (lịch sử): không sửa chữ nào.

## A. Đầu file

| # | Chỗ | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| A1 | Dòng KHÔNG CHẮC | 5 ý (1)–(5) | thêm ý (6): ES1-T586, ES1-T587, chưa chạy script | ticket ES1-T571 |
| A2 | Tiêu đề | "bản 0.5 · BA · 12/11/2026 (bản 0.4: …)" | "bản 0.6 · BA · 23/11/2026 (bản 0.5: 12/11/2026, bản 0.4: …)" | AC1 ES1-T571 |
| A3 | Đoạn "Cập nhật CTO 21/11" | "mã [phần tử bản vẽ cũ] và tên file thiết kế cũ đã bỏ khỏi AC" | "mã phần tử và tên file của bản vẽ cũ đã bỏ khỏi AC" | AC6 ES1-T571 |
| A4 | Đoạn mới "Bản 0.6" | không có | tóm tắt 0.6, trỏ srs-changes, traceability, home-content của ES1-T571; id section = `data-testid` của mockup ES1-T293 | ticket ES1-T571 |
| A5 | Đoạn "Nguồn" | "bảng nội dung theo [mã phần tử bản vẽ cũ] ở `drafts/ba/ES1-T173/home-content.md`" | "bảng nội dung trang chủ (bản 0.6: theo section mockup) ở `drafts/ba/ES1-T571/home-content.md`" | ticket ES1-T571 "srs.md trỏ file mới" |

## B. Mục 2 — từng AC sửa

| # | Story / AC | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| B1 | TE-1 AC12 | không "Get 15% Off" | không "Get 15% off", so không phân biệt hoa thường | content.md §2 (phần trăm sentence case); mockup footer "Get 15% off" |
| B2 | TE-1 AC-H28 | theme mới cài: không có chữ "Get 15% Off" | không có chữ "Get 15% off" (so không phân biệt hoa thường) | như B1 |
| B3 | TE-3 AC3 | badge sale với % giảm làm tròn | badge sale "−N%" (dấu trừ U+2212, N là % giảm làm tròn) | notes §10.1; content.md §2, §5 (Badge "−24%") |
| B4 | TE-3 AC18 | tiêu đề "Nothing In {tên tab} Yet" | "Nothing in {tên tab} yet" | notes phụ lục ("Nothing In Accessories Yet → Nothing in Accessories yet"); content.md §2 |
| B5 | TE-4 AC25 | Add to cart cao 48px ở 360 và 768, 52px ở 1280 và 1920 | cao 48px ở 360, 768, 1280, 1920 | notes §10.1 control 48; kit `--control-height` 48; product.md (nút 48 mọi mốc) |
| B6 | TE-5 AC12 | discount dòng "-{số tiền}" | "−{số tiền}" (dấu trừ U+2212) | notes §3 #21; content.md §8 `cart.discount_value` |
| B7 | TE-5 AC14 | Checkout "cao 48 dưới 80rem, 52 từ 80rem"; discount cấp đơn "-{x}" | Checkout "cao 48 ở mọi mốc"; "−{x}" (U+2212) | notes §10.1; cart.md §2 (Checkout 48 × 4 mốc); content.md §8 |
| B8 | TE-5 AC15 | chân drawer "Checkout cao 52" | "Checkout cao 48" | notes §10.1; mini-cart-quickview.md §1 (Checkout cao 48) |
| B9 | TE-5 AC18 | nút: cart page "Reload cart" (link `routes.cart_url`), drawer "Try again"; câu `cart.error` | nút "Try again" (cart page: link tải lại `routes.cart_url`; drawer: nút gửi lại cập nhật); câu `cart.error` ("Check your connection, then try again.") | notes §9.2; content.md §4 dòng "Try again" |
| B10 | TE-6 AC11 | nút Filter "(cao 48, 52 từ 80rem)" | "(cao 48 ở mọi mốc)" | notes §10.1; ticket ES1-T571 |
| B11 | TE-6 AC14 | "server trả trong ≤ 300 ms … chờ > 300 ms"; nút primary "Clear filters" | "≤ 500 ms … > 500 ms"; "Clear all filters" | notes §10.1 (chỉ báo tải 500 ms); notes §9.2; content.md §4 |
| B12 | TE-6 AC15 | ảnh 152 × 100, 232 × 152, 292 × 191, 336 × 220; tỉ lệ 336:220; tên dưới 48rem 18px | ảnh 152 × 101, 232 × 155, 292 × 195, 336 × 224; tỉ lệ 3/2; tên dưới 48rem 20px | notes §2 (collection card 3/2); list-collections.md §3, "Tham chiếu" (tên 20/24 dưới 48rem) |
| B13 | TE-7 AC6 | ảnh 272 × 161 (360); card 307, ảnh 307 × 182 (768); ảnh 360 × 213 (1280); ảnh 456 × 270 (1920) | ảnh 272 × 153 (16/9); card 308, ảnh 308 × 173; ảnh 360 × 203; ảnh 456 × 257 | notes §2 (review 16/9); index-mobile-b.md §4; index-1280.md §1 khối 12 |
| B14 | TE-8 AC8 | h2 "Nothing Matches “{q}” Yet" | "Nothing matches “{q}” yet" | notes phụ lục; content.md §2 |
| B15 | TE-10 AC13 | "Nhãn nút và link dạng nút viết Title Case ("Try again", …)" | "… viết sentence case ("Try again", …)" | CTO 21/11 ES1-T567; content.md §2 |
| B16 | TE-10 AC15 | "đoạn 16px, line-height 1.7" | "đoạn 16/28 (cỡ chữ 16px, dòng 28px)" | notes §2 (`.rte` 16/28); kit `.rte` `--line-height-reading` |
| B17 | TE-11 AC10 | link "Retake the quiz" cao 44px | link "Retake quiz" cao 44px | notes §9.2; quiz-result.md §6 mục 4 |
| B18 | TE-12 AC9 | ảnh 320 × 279 (360), 728 × 635 (768), 819 × 714 (1280); alert "Setup Not Added" | ảnh 320 × 320 (1/1), 728 × 728, 819 × 819; "Setup not added" | notes §2 (shop the look 1/1); index-mobile-a.md §7; index-1280.md §1 khối 7; mockup ES1-T278 alert |
| B19 | TE-13 AC6 | 1280 ảnh 580 × 566 | 580 × 580 (1/1) | notes §2 (featured 1/1); index-1280.md §1 khối 10 |
| B20 | TE-15 AC1 | ảnh 252 × 165, 307 × 201, 271 × 177 | 252 × 168 (3/2), 307 × 205, 271 × 180 | notes §2; index-mobile-a.md §3; index-1280.md §1 khối 3 |
| B21 | TE-15 AC-H8 | "5 card 336 × 270" | "5 card rộng 336 (ảnh 336 × 224, tỉ lệ 3/2)" | index-1280.md §1 khối 3; index-mobile-a.md §3 (desktop) |
| B22 | TE-16 AC1 | 768 card 307 × 410 | 308 × 411 | index-mobile-b.md §6 |
| B23 | TE-17 AC-H1 | "đúng 16 hàng [bảng kê bản vẽ cũ] theo y" | "đúng 16 khối của mockup trang chủ theo thứ tự y (header, 14 section `container-home-*`, footer; bảng home-content ES1-T571 mục 2)" | CTO 21/11 mockup là nguồn chuẩn; mockup ES1-T293 |
| B24 | TE-17 AC-H2 | "bảng nội dung lấy từ [phần tử bản vẽ cũ] hiện trong mockup" | "bảng nội dung `drafts/ba/ES1-T571/home-content.md` (theo section mockup trang chủ)" | ticket ES1-T571 (home-content mới) |
| B25 | TE-17 AC-H3 | "cùng scale với ảnh export … so từng block với ảnh [phần tử bản vẽ cũ]" | "cùng scale với ảnh chụp mockup `drafts/designer/ES1-T293/index-1920.png` … so từng block với ảnh chụp mockup" | CTO 21/11; test-strategy (so với ảnh mockup); ES1-T582 |
| B26 | TE-17 AC-H36 | chuỗi "Get 15% Off" | "Get 15% off" (so không phân biệt hoa thường) | như B1 |
| B27 | TE-17 AC-H37 | hero 1280 × 589; danh mục ảnh 271 × 177; shop the look ảnh 819 × 714; featured ảnh 580 × 566; testimonial ảnh 360 × 213; why ảnh 600 × 571; FAQ ảnh 442 × 471 | hero 1280 × 640 (2/1); 271 × 180; 819 × 819; 580 × 580; 360 × 203; 600 × 600; 442 × 435 | notes §2; index-1280.md §1 khối 2, 3, 7, 10, 12, 13, 15 |
| B28 | TE-17 AC-H38 | 360: danh mục ảnh 252 × 165, shop the look 320 × 279, testimonial ảnh 272 × 161, FAQ ảnh 320 × 341. 768: danh mục ảnh 307 × 201, shop the look 728 × 635, testimonial card 307 (ảnh 307 × 182), blog card 307 × 410, FAQ ảnh 553 × 589 | 360: 252 × 168, 320 × 320, 272 × 153, 320 × 320. 768: 307 × 205, 728 × 728, card 308 (ảnh 308 × 173), 308 × 411, 553 × 553 | notes §2; index-mobile-a.md §3, §7; index-mobile-b.md §4, §6, §8 |
| B29 | TE-17 ghi chú dưới AC | "Chỉ so [phần tử bản vẽ cũ] có bản thân và mọi [phần tử] cha không `visible:false`; ảnh export thắng snapshot khi lệch." | "Chỉ so phần tử đang hiện trong mockup (bản thân và mọi phần tử cha không bị ẩn)." Bỏ câu ảnh export / snapshot (nguồn cũ không còn dùng) | CTO 21/11 ES1-T567 |
| B30 | TE-18 AC6 | nút "Shop the deal" | "View offer" | notes §10.1; content.md §2.1, §4 |
| B31 | TE-18 AC10 | không "15% Off" | không "15% off", so không phân biệt hoa thường | như B1 |
| B32 | TE-19 AC1 | `--section-gap`: 48 ở 360 và 768, 120 ở 1280 và 1920 | 48 ở 360 và 768, 128 ở 1280 và 1920 | notes §10.1; kit `--space-7xl` 128 |
| B33 | TE-19 AC4 | tên truy cập "Add {tên sản phẩm} to cart" | "Add to cart: {tên sản phẩm}" | notes §9.2 (cart.html card gợi ý); content.md §2; khớp TE-4 AC28 |
| B34 | TE-20 AC9 | khung 1240 × 570 ở 1280, 1416 × 651 ở 1920 | 1240 × 620, 1416 × 708 (tỉ lệ 2/1 từ 80rem) | notes §2 (bìa bài viết 2/1); article.md §1, §3 |
| B35 | TE-21 AC1 | "cỡ chữ 16 lh 1.7" | "chữ 16/28 (cỡ 16px, dòng 28px)" | notes §2 (`.rte`, page 16/28) |
| B36 | TE-21 AC6 | vùng chạm input và nút "48px dưới 64rem, 52px từ 64rem" | "48px ở mọi mốc (360, 768, 1280, 1920)" | notes §10.1; page.md §9 (input 48, nút 48) |
| B37 | TE-21 bảng Settings, password-hero Heading | store dev "Level Up <em>Your Fitness</em>" | "Level up <em>your fitness</em>" | notes phụ lục ("Level Up → Level up", "Your Fitness → your fitness"); khớp TE-21 AC17 |
| B38 | TE-9 AC4 | dữ liệu demo theo `drafts/ba/ES1-T173/home-content.md` mục 3 | theo `drafts/ba/ES1-T571/home-content.md` mục 3 | ticket ES1-T571 "srs.md trỏ file mới" |

## C. Rà, không đổi

| Chỗ | Giá trị | Lý do giữ |
| --- | --- | --- |
| TE-5 AC11 | ngừng bấm 300 ms (debounce số lượng) | notes §10.1: debounce 300 ms giữ (AC4 ES1-T571) |
| TE-8 AC1 | 300ms (debounce gợi ý) | như trên |
| TE-8 AC12 | request lần đầu chưa về sau 200 ms → spinner | `predictive-search.md` §6 vẫn "> 200ms"; hỏi ES1-T586 |
| TE-18 AC1 | cuộn ngược trong < 500 ms | ngưỡng cử chỉ, không phải chỉ báo tải |
| TE-1 AC11, TE-6 AC9, TE-22 AC4 | hàng tiêu đề / summary / "View all" cao 52px | hàng 52 giữ (`--row-height`, notes §10.1) |
| TE-2 AC7, TE-3 AC14, TE-4 AC23, AC29, TE-6 AC6, TE-7 AC1, AC-H24, TE-13 AC8, TE-15 AC1, TE-16 AC1, TE-19 AC3, AC7, TE-20 AC13 | nút tròn / chevron / play 52px | nút tròn 52 giữ (`--round-button-size`) |
| TE-6 AC12, TE-8 AC4, AC5, TE-20 AC7 | chip, tab, link 44px (40px từ 80rem) | control compact 44 / tab 40 không đổi (notes §2 dòng "Không đổi điểm ảnh") |
| TE-17 AC-H38 | khoảng giữa section 48 ở 360 | đã đúng kit (`--space-4xl` 48) |
| TE-13 AC6 | countdown Compact ô 40, Regular ô 44 | khớp notes §8.1 |
| TE-1 AC11 footer, header | không có số 98 × 123, số đếm giỏ 18, tab padding 28 trong AC | notes §2 dòng footer 96 × 120, số đếm 20, tab 24: không có AC nào ghi số cũ |
| TE-21 AC13, R7.9 | QR ≥ 120 × 120px | không phải `--section-gap` |
| TE-17 AC-H21 | 6 thẻ 264 × 554 | khớp index-mobile-b.md §3 desktop (264 × 469 + thanh 84) |
| TE-4 AC24 | badge "−N%" | đã dùng U+2212 |
| Mục 3 dòng "Lượt 2" | "Checkout cao 48 dưới 80rem, 52 từ 80rem", "52 từ 80rem", "120" | lịch sử, giữ nguyên chữ (ticket ES1-T571) |
| AC mang `#container-home-*` (TE-2, TE-7 AC-H25, TE-11, TE-12, TE-13, TE-15, TE-16) | giữ | đầu file 0.6 ghi đây là `data-testid` của section mockup |

## D. Tự kiểm tra

- AC1: tiêu đề "bản 0.6"; `requirements-map.md` "SRS 0.6".
- AC2: grep `52 từ\|52px từ\|Checkout cao 52` trong mục 2 = 0; `120 ở 1280` trong mục 2 = 0 (còn ở mục 3 dòng "Lượt 2", lịch sử).
- AC3: grep `Reload cart\|Retake the quiz\|Shop the deal\|"Clear filters"` trong mục 2 = 0.
- AC4: TE-6 AC14 "500 ms"; TE-5 AC11 "300 ms", TE-8 AC1 "300ms" giữ.
- AC5: grep `line-height 1.7\|lh 1.7` trong srs.md = 0.
- AC6: không phân biệt hoa thường, 2 từ cấm của ticket trong 5 file ES1-T571 = 0 (rà tay bằng Grep).
- AC7: 38 dòng B + 5 dòng A, mỗi dòng có trước → sau → nguồn.
- AC8: giữ "### TE-x — tên", "- ACn"; số AC mỗi story không đổi.
