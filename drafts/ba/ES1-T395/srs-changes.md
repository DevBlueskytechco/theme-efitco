KHÔNG CHẮC: bản này ghép trên `docs/srs.md` sau ES1-T394 (PR #193). Các điểm sau viết theo mặc định ES1-T436, im lặng tới 14/11/2026 thì coi là nhận: breadcrumb của search, list-collections và `?view=quiz`; default rỗng cho `popular_searches` và quiz `empty_text`; setting "Discount code" của newsletter popup. Chưa chạy `vague_words.py` và `traceability.py` vì phiên không có shell, đã grep tay 9 từ mơ hồ.

# ES1-T395: bảng thay đổi SRS 0.5 (phần khung, giỏ, collection, tìm kiếm, lớp)

| # | Vị trí | Thay đổi | Nguồn |
| --- | --- | --- | --- |
| 1 | Dòng KHÔNG CHẮC, đoạn nguồn | Thêm mục (5) ES1-T395 và câu mô tả phần ES1-T395 | — |
| 2 | Mục 0 Thuật ngữ | Thêm "lớp có scrim", "hiện đủ tên", `.rte`, "chuỗi locale" | layers §4; sổ 11/11 TUÂN THỦ (3), (5); ES1-T422 #1 |
| 3 | TE-1 AC2 | Thêm câu menu tới 3 cấp, cấp 3 trong drawer theo TE-22 AC4 | M5 ES1-T306 |
| 4 | TE-1 AC6 | Trỏ AC11, AC12 | — |
| 5 | TE-1 AC11–AC14 (mới) | Footer 3 tầng theo mốc, Follow on Shop, icon thanh toán full color; form newsletter và theme sạch footer; favicon và logo dự phòng `shop.name`; skip link, focus, tên icon cart | foundation §3, §4, §12, §27, §29; audit C4, C9, C10, C11, A #31; R4.18, R14 |
| 6 | TE-1 bảng setting (mới) | `logo`, `favicon`, `newsletter_button_label`, chữ footer rỗng, link social rỗng | audit C4, C9, C10, C11; ES1-T401, ES1-T402 |
| 7 | TE-5 AC1, AC2, AC4 | Trỏ AC12, AC15, AC18, AC19 | — |
| 8 | TE-5 AC3 | Ngưỡng 0 thì ẩn, chữ còn thiếu/đạt, `<progress>`, vị trí | cart.md §3.4; audit C11 |
| 9 | TE-5 AC11–AC19 (mới) | Stepper; dòng hàng (unit price, gift card "To: … · Sends on …", compare_at, xoá icon); hết hàng sau khi thêm; panel tóm tắt cart page; khung mini cart; nút thương hiệu + installments; thanh checkout dưới 64rem; đang cập nhật, lỗi mạng; giỏ rỗng | cart.md; mini-cart-quickview §1, §2, §6; product-shopify-features §3.1, §3.2, §6, §11; G1, G3, M2 |
| 10 | TE-5 bảng setting | Thêm "Empty cart products" (drawer), "Empty cart collection", "Show sticky checkout bar on mobile" (cart page), ghi rõ `free_shipping_threshold` = 0 | cart.md §5; mini-cart-quickview §5; audit C11 |
| 11 | TE-6 AC1, AC2, AC4, AC5 | Trỏ AC8–AC15 | — |
| 12 | TE-6 AC8–AC15 (mới) | Lưới 12 cột 3/9, 3 cột mặc định; nhóm lọc; drawer lọc; toolbar; chip; đầu trang; trạng thái rỗng, đang tải, lỗi; list-collections | collection.md §3–§9; list-collections.md; C1–C3, L1–L2 |
| 13 | TE-6 bảng setting (mới) | "Columns on desktop" 4 → 3 | C1 10/11 |
| 14 | TE-8 AC1, AC2 | Trỏ AC5–AC14 | — |
| 15 | TE-8 AC4–AC14 (mới) | Popular searches theme setting (FD2); đầu trang search, type-nav; nhóm kết quả; lọc ở search; S1, S2, S5, S6; overlay Popup/Drawer; tab; khám phá; đang tải, lỗi; recent searches (Should); a11y, hiệu năng overlay | foundation §24.1; search.md; predictive-search.md; S1–S3, SR1–SR3; ES1-T309 #5 |
| 16 | TE-8 bảng setting (mới) | `popular_searches` (rỗng), 3 setting header, 7 setting `search-results`; bỏ "Popular searches" ở header và search-results | foundation §24.1; search.md §4; predictive-search.md §5; ES1-T436 #2 |
| 17 | TE-10 AC5 | "16/16 block" → "mọi block trong Theme map AGENTS.md" | ES1-T306 mục writer |
| 18 | TE-10 AC9–AC15 (mới) | Focus không bị che (layers §3); dải đáy, tối đa 1 thanh; toast và phản hồi trong lớp modal; khung lớp chung + thang `--layer-*`; trạng thái chung; không cắt tên; `.rte` chung | layers §1–§4, §6, §8; foundation §6, §15–§18, §28; sổ 11/11 TUÂN THỦ (3), (5); audit T5, T7, C7 |
| 19 | TE-11 AC8 | Trỏ AC10 | — |
| 20 | TE-11 AC9–AC11 (mới) | `results_popup` true, `empty_text` rỗng → locale, nút xem kết quả `aria-busy`; trang `?view=quiz` theo mốc + breadcrumb; viền radio ≥ 3:1 | quiz-result §5–§7; audit C8; ES1-T436 #1, #3 |
| 21 | TE-11 AC-H15 | Given store dev đã cấu hình; thêm vế theme mới cài (bàn giao từ ES1-T394) | ES1-T308 #1 |
| 22 | TE-11 bảng setting (mới) | `results_popup` true, `empty_text` rỗng | quiz-result §7; ES1-T422 #1 |
| 23 | TE-18 dòng nguồn, AC7 | Không hứa gửi mã; thành công "You're On The List" + "Thanks for subscribing."; câu mã + Copy Code chỉ khi Discount code không rỗng; không đoán email đã đăng ký | sổ 11/11 TUÂN THỦ (7); audit C5, T10; ES1-T301 #2; ES1-T436 #4 |
| 24 | TE-18 AC10, AC11 (mới) | Theme sạch 3 popup, store dev cấu hình; nút × trên Big Offer ẩn theo số ngày | ES1-T308 #1, ES1-T422 #1; marketing-popups §4 |
| 25 | TE-18 bảng setting | Product big offer default trống; thêm 17 dòng (Image, Heading, Text, Button label, Consent, Discount code newsletter, Show cart items, Offer heading/text, Button label/link, Button text, Open on hover…) default chữ rỗng; thay câu "Setting còn lại theo marketing-popups §2–§4" | marketing-popups §2–§4; ES1-T308 #1; ES1-T436 #4 |
| 26 | TE-22 AC9 | Thêm breadcrumb search, list-collections, `?view=quiz`; bỏ search, list-collections khỏi danh sách "không có breadcrumb" | search.md §2; list-collections §1; quiz-result §6; ES1-T436 #1 |
| 27 | Mục 3 | Dòng sổ 11/11 "không thêm AC trong 0.4": FD2 → TE-8 AC4; thêm khối "Chốt … đưa vào bản 0.5 phần khung, giỏ, collection, tìm kiếm, lớp (ES1-T395)" | — |

Các phần không đổi trong lượt này: TE-1 AC1, AC3–AC5, AC7–AC10, AC-H28, AC-H29; TE-5 AC5–AC10; TE-6 AC3, AC6, AC7; TE-8 AC3; TE-10 AC1–AC4, AC6–AC8, AC-H30..AC-H34; TE-11 AC1–AC7, AC-H16, AC-H17; TE-18 AC1–AC6, AC8, AC9. TE-2, TE-3, TE-4, TE-7, TE-9, TE-12..TE-17, TE-19..TE-21 giữ nguyên như bản ES1-T394 và ES1-T396.

Đã nhận phần bàn giao từ ES1-T394:
- TE-11 AC-H15: đã đổi Given và thêm vế theme mới cài (#21).
- Unit price trong mini cart và cart page, dòng gift card "To: … · Sends on …": đã thêm ở TE-5 AC12.

M5, M8 (ES1-T306):
- M5: TE-1 AC2 thêm câu trỏ TE-22 AC4, phần menu 3 cấp đã có ở TE-22 (ES1-T396).
- M8: đã xử lý ở TE-20 AC2 và AC8 (ES1-T396), lượt này không sửa gì.

Spec mâu thuẫn với quyết định (SRS theo quyết định, Designer sửa spec):
- foundation §24.1 và predictive-search §5 ghi default `popular_searches` có 5 cụm chữ. ES1-T308 #1, ES1-T422 #1 và ES1-T377 yêu cầu rỗng. SRS ghi rỗng (ES1-T436 #2).
- marketing-popups §2–§4 có default chữ "Get 15% Off", "Take 15% Off", ảnh `efx-news.jpg`, sản phẩm `figma-ativafit-lava-featured`. Các default này trái ES1-T308 #1. SRS ghi rỗng hoặc trống.
- quiz-result §7 có default chữ cho `empty_text`. SRS ghi rỗng và dùng chuỗi locale (ES1-T436 #3).
- cart.md §5 có default chữ cho eyebrow và heading upsell. Phần này đã xử lý ở TE-19 (ES1-T396).
- collection.md §8 ghi "> 3 màu: 3 swatch + N colors", trái VP2. SRS theo TE-3 AC13 (đã có từ ES1-T306).

Việc cho Tech Lead:
- Breadcrumb search (TE-8 AC5) chưa có trong body ES1-T128. Breadcrumb `?view=quiz` (TE-11 AC10) chưa có trong body ES1-T387.
- TE-10 AC5 (tài liệu merchant cho mọi block) chưa có task writer R2.
- Hai ticket cũ ES1-T99 và ES1-T112 có tiêu đề AC1–AC7 / AC1–AC5, cần mở rộng tới TE-5 AC19 và TE-6 AC15.
