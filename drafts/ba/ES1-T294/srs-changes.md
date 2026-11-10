KHÔNG CHẮC: B2B cần store bật được B2B (ES1-T297 #1); spec ES1-T288, ES1-T289 ở nhánh khác chưa đọc được, AC chỉ ghi phần CTO đã chốt. Hook chặn BA ghi `docs/srs.md`: bản đầy đủ ở `drafts/ba/ES1-T294/srs.md`, Orchestrator chép đè `docs/srs.md`.

# ES1-T294 — Thay đổi SRS 0.2 → 0.3

Nguồn: `docs/design/decisions.md` (sổ, mới nhất 10/11), audit ES1-T283 (A30, câu CTO 4), ES1-T272, ES1-T273, ES1-T280, ES1-T282, ES1-T289, spec `docs/ui-spec/navigation.md`, `mini-cart-quickview.md`, `marketing-popups.md`, `product.md`, `foundation.md`.

## 1. Mục 1 của ticket: AC sửa theo sổ

| # | AC | Bản 0.2 | Bản 0.3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | TE-1 AC9 | header trong suốt đè hero chữ trắng; cuộn > 80px nền trắng; lớp phủ 30% mọi mốc | header thanh tối riêng 80px mọi trang, không đè ảnh; cuộn giữ nền tối + bóng, cao không đổi; lớp tối 30% chỉ 768, 360; localization 1 control gộp ở footer và drawer mobile | sổ 10/11 (header trang chủ, trang con, hero 768/360), ES1-T289 |
| 2 | TE-1 AC5 | country selector và language selector | 1 control gộp theo AC9, áp cả drawer mobile; luật ẩn khi 1 nước 1 ngôn ngữ giữ nguyên | ES1-T289, ES1-T283 A19 |
| 3 | AC-H29 | header trong suốt rồi nền trắng; bật lại TC-46, TC-47 | header tối 80 không chồng hero; bỏ TC-42, TC-46; viết lại TC-47 | sổ 10/11 |
| 4 | TE-1 AC2 | mobile drawer có accordion | dưới 80rem có JS: cấp 2 trượt + Back ("Back to menu", 44px), focus vào Back, Back trả focus; không JS: accordion `<details>` | N1, navigation.md §câu 1 |
| 5 | TE-2 AC2 | 360 luôn căn giữa | 360 căn trái, mép 20 cùng khối dưới | sổ 10/11 hero 360, ES1-T280 #1 |
| 6 | TE-2 AC6 | root slideshow mang `data-header-overlay` | không mang hook đè header | sổ 10/11, foundation §21 |
| 7 | TE-3 AC2 | chọn swatch đổi ảnh card và link, keyboard chọn được | swatch là chỉ báo `aria-hidden`, không focus, không bấm; tên link có số màu; lấy từ option value; chọn màu qua Quick View | ticket ES1-T294, foundation §9 |
| 8 | TE-3 AC6 | vùng bấm swatch ≥ 44px (D7) | vùng chạm 44px cho link card và nút Quick View; swatch 32 × 16 không phải control | foundation §9, ES1-T294 |
| 9 | TE-3 AC8 | swatch chọn sẵn variant | swatch của variant hiện trạng thái chọn (chỉ báo) | hệ quả của #7 |
| 10 | TE-4 AC5 | sticky bar chỉ mobile | mọi mốc; "Show on desktop" mặc định bật; không bộ chọn biến thể trong thanh; "Choose Options" khi tổ hợp không tồn tại | P2 sổ 10/11, product.md §10 |
| 11 | TE-13 AC1 | ngày từ setting block | metafield `custom.sale_ends_at` chính, setting chỉ khi sản phẩm không có metafield; component chung TE-4 AC17 | audit (2), P5 |
| 12 | AC-H23 | ngày kết thúc trên store dev | metafield < 24 giờ; thêm ca fallback setting | audit (2) |
| 13 | Story TE-4, TE-6, TE-8 | câu giá trị dùng từ chỉ tốc độ không đo được | thay bằng điều kiện quan sát được (danh sách cấm của skill user-story-ac) | skill user-story-ac |

## 2. Mục 1 của ticket: AC mới

| AC mới | Nội dung | Nguồn |
| --- | --- | --- |
| NFR-7 | mọi chỗ chọn biến thể chạy với 2048 biến thể, không danh sách biến thể, không JSON biến thể | sổ 10/11 2048 |
| TE-3 AC9–AC12 | nút Quick View (setting, hiển thị theo mốc), nội dung dialog/sheet, thêm giỏ → drawer/cart page/422, không JS | ES1-T272 #1, M1, M2 |
| TE-4 AC13 | bộ chọn từ option value, 3 trạng thái giá trị | sổ 10/11 2048, mini-cart-quickview.md §3.1 |
| TE-4 AC14 | > 10 giá trị: 7 + "+N", "Show fewer", hằng chung, không setting | M5 |
| TE-4 AC15 | đổi giá trị: trạng thái tải, cập nhật, chỉ lần bấm cuối, URL PDP replace, quickview không đổi URL nền (M4), lỗi giữ biến thể cũ | sổ 10/11 2048, M4 |
| TE-4 AC16 | sản phẩm > 250 biến thể chọn đúng biến thể sau vị trí 250 | ES1-T282 |
| TE-4 AC17 | countdown PDP: 4 điều kiện, ô ngày ≥ 24 giờ, a11y, không reset, component chung | P3, P4, P5, audit (2) |
| TE-4 AC18 | quantity rules + volume pricing ở PDP, quickview | audit (4) |
| TE-4 AC19 | selling plan ở PDP, quickview; `requires_selling_plan` | audit (4), R4.14 |
| TE-5 AC8 | ghi chú đơn trong drawer, setting `show_order_note` | ES1-T272 #2, M3 |
| TE-5 AC9 | quantity rules + volume pricing trong drawer và cart page | audit (4) |
| TE-5 AC10 | tên selling plan trên dòng giỏ drawer và cart page | audit (4), R4.14 |
| TE-9 AC7 | dữ liệu demo mới theo demo-data-b2b.md | ES1-T294 mục 2 |
| TE-18 AC1–AC9 | popup marketing: mặc định bật, trigger, hàng đợi 3 s, tần suất, trang loại trừ, before you leave theo giỏ (MK6), Big Offer (ẩn PDP, cart; 360 trên thanh bundle), form newsletter, a11y, không JS, Lighthouse | MK1–MK6, audit (2), (3), ES1-T273 #1 |

Settings mới hoặc đổi default: `show_quick_view` (true), `show_on_desktop` (false → true), `show_sale_countdown` (true), `show_order_note` (true), 15 setting TE-18 (bảng trong SRS). Không thêm setting ngoài spec đã có nguồn.

## 3. Trả lời ticket hỏi BA

| Ticket | Câu | Trả lời trong SRS 0.3 |
| --- | --- | --- |
| ES1-T272 | #1 quickview chưa có AC | có: TE-3 AC9–AC12 |
| ES1-T272 | #2 ghi chú đơn trong drawer | có: TE-5 AC8; upsell drawer vẫn chờ ES1-T247, không thêm AC |
| ES1-T273 | #1 popup chưa có story | có: story mới TE-18 |
| ES1-T273 | #2 mã giảm giá, #4 email gửi mã | chuyển CTO ES1-T297 #2, #3 (có mặc định) |
| ES1-T280 | #1 TE-2 AC2 căn giữa 360 | sửa: TE-2 AC2 căn trái mép 20 |
| ES1-T280 | #2 export reviews.rating | ngoài vai BA (script export), không đổi |
| ES1-T282 | sản phẩm > 250 biến thể, `custom.sale_ends_at` | demo-data-b2b.md D3, D4 |

## 4. Không làm trong bản này
- Lệch SRS khác với sổ (L1–L7, mục 4 SRS 0.3): chờ ES1-T297 #4.
- Upsell trong drawer (ES1-T247), combined listing (không có trong thân ticket, ES1-T297 #6), setting "Options with many values" (ES1-T297 #5).
- Không ước lượng point (techlead), không sửa code theme.

## 5. TC cũ bị ảnh hưởng (QA xử lý)

| TC | File | AC | Việc |
| --- | --- | --- | --- |
| TC-42 | drafts/qa/ES1-T23, tests/e2e/TE-1.spec.ts | TE-1 AC9 | bỏ (hook đè header không còn) |
| TC-46 | như trên | TE-1 AC9 | bỏ |
| TC-47 | như trên | TE-1 AC9 | viết lại: lớp tối 30% chỉ ở 768, 360 |
| TC-10–TC-17, B-01, B-02 | drafts/qa/ES1-T53, tests/e2e/TE-3.spec.ts | TE-3 AC2 | bỏ phần click/radio swatch; thay bằng TC-294-09 |
| TC-70, TC-72 | như trên | TE-3 AC8 | sửa: swatch là chỉ báo, không bấm |
| ES1-T16.spec.ts (giả lập `data-header-overlay`) | tests/e2e | TE-1 AC9 | bỏ phần giả lập |
| TC sticky bar chỉ mobile (nếu có) | tests/e2e/TE-4.spec.ts | TE-4 AC5 | viết lại theo mọi mốc |
