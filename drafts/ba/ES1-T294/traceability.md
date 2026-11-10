KHÔNG CHẮC: TC-294-* là mã đề xuất, QA viết bước chi tiết; TC B2B (TC-294-26, 27, 31) phụ thuộc ES1-T297 #1. Chỉ gồm AC sửa hoặc mới ở SRS 0.3; AC không đổi giữ TC cũ.

# ES1-T294 — Ma trận truy vết SRS 0.3 (yêu cầu → AC → TC → mã R → dữ liệu)

Trạng thái: "QA viết" = TC chưa có; "sửa" = TC cũ phải đổi kỳ vọng; "giữ" = TC cũ dùng được.

| Yêu cầu (nguồn) | Story / AC | TC | Mã R | Dữ liệu demo | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| N1 drawer trượt + Back | TE-1 AC2 (có JS) | TC-294-01 | R4.8, R12 | main-menu 2 cấp (có) | QA viết |
| N1 accordion không JS | TE-1 AC2 (không JS) | TC-294-02 | R4.8, NFR-4 | như trên | QA viết |
| Localization ẩn khi 1 nước 1 ngôn ngữ | TE-1 AC5 | TC-294-03 | R4.7 | market hiện tại (1 nước) | QA viết |
| Header tối 80 mọi trang, không đè ảnh | TE-1 AC9 | TC-294-04 | R7.1, R12 | `/`, collection có ảnh, article có ảnh bìa | QA viết |
| Header dính: nền giữ, bóng, CLS 0 | TE-1 AC9 | TC-294-05 | R6 | `/` | QA viết |
| Lớp tối hero 30% chỉ 768, 360 | TE-1 AC9 | TC-47 | R12 | slide có ảnh | sửa |
| Localization 1 control gộp footer + drawer | TE-1 AC9 | TC-294-06 | R4.7 | ≥ 2 nước hoặc ≥ 2 ngôn ngữ (ES1-T296) | QA viết |
| Hero thật dưới header | AC-H29 | TC-H29 | R3 | `/` | sửa |
| Hero 360 căn trái mép 20 | TE-2 AC2 | TC-294-07 | R3 | `/` ở 360 | QA viết |
| Bỏ hook đè header | TE-2 AC6 | TC-294-08 | R3 | `/` | QA viết |
| Swatch card là chỉ báo | TE-3 AC2 | TC-294-09 | R12 | Iron Core Kettlebell 16 kg (3 màu) | QA viết |
| Vùng chạm link card, Quick View 44 | TE-3 AC6 | TC-294-10 | R12 | card bất kỳ | QA viết |
| Card variant: swatch chọn sẵn là chỉ báo | TE-3 AC8 | TC-70, TC-72 | R7.3 | collection đa nguồn (có) | sửa |
| Nút Quick View theo mốc + setting | TE-3 AC9 | TC-294-11 | R12 | card bất kỳ, 1 biến thể, hết hàng | QA viết |
| Quickview nội dung, tải, lỗi, đóng, focus | TE-3 AC10 | TC-294-12 | R12 | Iron Core Kettlebell 16 kg | QA viết |
| Quickview thêm giỏ → drawer / page / 422 | TE-3 AC11 | TC-294-13 | R7.5 | biến thể tồn 1 (D3) | QA viết |
| Không JS: không nút Quick View | TE-3 AC12 | TC-294-14 | NFR-4 | card bất kỳ | QA viết |
| Sticky ATC mọi mốc, nội dung theo mốc | TE-4 AC5 | TC-294-15 | R7.2 | figma-ativafit-lava-adjustable | QA viết |
| Sticky: Sold out, Choose Options | TE-4 AC5 | TC-294-16 | R7.2 | hết-hang-toan-bộ; 2-option-co-tổ-hợp-khong-tồn | QA viết |
| Sticky: setting tắt từ 64rem, không che footer | TE-4 AC5 | TC-294-17 | R14 | như TC-294-15 | QA viết |
| 2048: không JSON biến thể, 3 trạng thái giá trị | TE-4 AC13, NFR-7 | TC-294-18 | R7.2, R12 | D3 | QA viết |
| > 10 giá trị: 7 + "+N", Show fewer, 360 | TE-4 AC14 | TC-294-19 | R12 | D3 (Weight 40 giá trị) | QA viết |
| Đổi option: tải, cập nhật, lần bấm cuối, URL | TE-4 AC15 | TC-294-20 | R7.2 | D3 | QA viết |
| Đổi option: lỗi mạng giữ biến thể cũ | TE-4 AC15 | TC-294-21 | R12 | D3 | QA viết |
| Quickview không đổi URL nền, View Detail ?variant= | TE-4 AC15 (M4) | TC-294-22 | — | D3 trong collection | QA viết |
| Biến thể sau vị trí 250 | TE-4 AC16 | TC-294-23 | R7.2 | D3 (304 biến thể) | QA viết |
| Countdown PDP 4 điều kiện, ẩn | TE-4 AC17 | TC-294-24 | R8 | D4 | QA viết |
| Countdown ô ngày, < 24 giờ, F5, hết giờ | TE-4 AC17 | TC-294-25 | R8, R12 | D4 (sale-gia-nhỏ) | QA viết |
| Quantity rule PDP + quickview | TE-4 AC18 | TC-294-26 | — (CTO audit (4)) | D1 | QA viết, chờ ES1-T297 #1 |
| Volume pricing bảng bậc | TE-4 AC18 | TC-294-27 | — (CTO audit (4)) | D1 | QA viết, chờ ES1-T297 #1 |
| Selling plan PDP + quickview | TE-4 AC19 | TC-294-28 | R4.14 | D2 | QA viết |
| requires_selling_plan | TE-4 AC19 | TC-294-29 | R4.14 | D2 | QA viết |
| Ghi chú đơn trong drawer | TE-5 AC8 | TC-294-30 | R7.5 | giỏ có hàng | QA viết |
| Quantity rule trong giỏ | TE-5 AC9 | TC-294-31 | R7.5 | D1 | QA viết, chờ ES1-T297 #1 |
| Selling plan trên dòng giỏ | TE-5 AC10 | TC-294-32 | R4.14, R7.5 | D2 | QA viết |
| Dữ liệu demo mới có trên store dev | TE-9 AC7 | TC-294-33 | R20 | D1–D8 | QA viết |
| Countdown featured: metafield thắng setting | TE-13 AC1 | TC-294-34 | R8 | D4 (figma-ativafit-lava-featured) | QA viết |
| Countdown featured < 24 giờ, fallback setting | AC-H23 | TC-H23 | R8 | D4 | sửa |
| Popup: mặc định bật, trigger, không mở lúc tải | TE-18 AC1 | TC-294-35 | R6, R8 | `/` | QA viết |
| Popup: hàng đợi, nghỉ 3 s, ưu tiên | TE-18 AC2 | TC-294-36 | R8 | `/`, giỏ có hàng | QA viết |
| Popup: tần suất phiên, ngày | TE-18 AC3 | TC-294-37 | R8 | `/` | QA viết |
| Popup: trang loại trừ, accepts_marketing | TE-18 AC4 | TC-294-38 | R8 | 404, cart, password, gift card; khách đã đăng ký | QA viết |
| Before you leave theo giỏ, MK6 | TE-18 AC5 | TC-294-39 | R8 | giỏ có hàng; giỏ rỗng + mã (D10) | QA viết |
| Big Offer: điều kiện, vị trí, ẩn PDP/cart, 360 | TE-18 AC6 | TC-294-40 | R8, R12 | figma-ativafit-lava-featured (D4) | QA viết |
| Form newsletter popup: trạng thái | TE-18 AC7 | TC-294-41 | R4.9 | email test | QA viết |
| Popup a11y: dialog, focus, đóng, sheet ≤ 60% | TE-18 AC8 | TC-294-42 | R12 | `/` ở 360, 1280 | QA viết |
| Không JS, Lighthouse (LCP, CLS) | TE-18 AC9 | TC-294-43 | R6, NFR-4 | `/` | QA viết |

Kiểm mồ côi (đếm tay, không chạy được `traceability.py`):
- AC sửa/mới trong SRS 0.3: TE-1 AC2, AC5, AC9, AC-H29; TE-2 AC2, AC6; TE-3 AC2, AC6, AC8, AC9, AC10, AC11, AC12; TE-4 AC5, AC13–AC19; TE-5 AC8, AC9, AC10; TE-9 AC7; TE-13 AC1, AC-H23; TE-18 AC1–AC9; NFR-7 = 37 mục, mỗi mục ≥ 1 dòng trên.
- Mỗi dòng có story và nguồn yêu cầu; không TC nào không gắn AC.
- TC cũ bỏ/sửa: `srs-changes.md` mục 5.
