KHÔNG CHẮC: TC-299-* là mã đề xuất, QA viết bước chi tiết; TC B2B (TC-294-26, TC-299-13, TC-294-31) phụ thuộc ES1-T298 (store không bật được B2B thì kiểm bằng mockup); TC-299-02 và TC-299-32 có phần chờ ES1-T301. Chỉ gồm AC sửa hoặc mới ở SRS 0.4; AC không đổi giữ TC của ES1-T294 và trước đó.

# ES1-T299 — Ma trận truy vết SRS 0.4 (yêu cầu → AC → TC → mã R → dữ liệu)

Trạng thái: "QA viết" = TC chưa có; "sửa" = TC cũ phải đổi kỳ vọng; "giữ" = TC cũ dùng được.

| Yêu cầu (nguồn) | Story / AC | TC | Mã R | Dữ liệu demo | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| L1 chỉ tiêu nghiệm thu Lighthouse (sổ 09/11, 10/11 BGĐ) | NFR-1, TE-10 AC1, TE-13 AC5 | TC-299-01 | R6.1, R6.2, R11 | store dev: `/`, collection, product, blog, article, page; /cart, /search, 404, password, gift card (không SEO) | QA viết |
| L1 ngưỡng CI chặn merge | NFR-1, TE-10 AC1 | TC-299-02 | R6.1, R6.2 | lhci config | QA viết, chờ ES1-T301 #1 |
| L1 trang chủ 16 block | AC-H30 | TC-H30 | R6.1, R6.2 | `/` | sửa |
| ES1-T269 chỉ customer accounts mới | TE-1 AC3 | TC-299-03 | R4.19 | repo; header 360, 1280 | QA viết |
| AN1 bar nền tối, ≥ 44, không đóng/xoay | TE-1 AC4 | TC-299-04 | R12, R14 | setting text + link (ES1-T296) | QA viết |
| AN2 bar không dính; password, gift card không bar | TE-1 AC4 | TC-299-05 | R3.1 | như trên; /password, gift card | QA viết |
| LC1 nút gộp: popover, sheet, cấp 2 drawer | TE-1 AC10, AC5 | TC-299-06 | R4.7, R12 | ≥ 2 nước hoặc ≥ 2 ngôn ngữ (ES1-T296) | QA viết |
| LC2, LC3 ô tìm > 10 nước, đổi ngay, không JS | TE-1 AC10 | TC-299-07 | R4.7, NFR-4 | > 10 nước (ES1-T296) | QA viết |
| L2 điều khiển hero theo mốc | TE-2 AC7 | TC-299-08 | R12 | `/` 2 slide, 360, 768, 1280, 1920 | QA viết |
| HA1 chữ hero 400 ms, ảnh hiện ngay | TE-2 AC10 | TC-299-09 | R6.1, R12 | `/` | QA viết |
| L4 nhãn "Add To Cart" | TE-4 AC2, TE-13 AC2, AC-H22, mục 3 E11 | TC-299-10, TC-H22 | R7.2 | figma-ativafit-lava-adjustable, featured | QA viết; TC-H22 sửa |
| QZ1 ngoại lệ thêm giỏ | TE-4 AC8, TE-5 AC6, TE-3 AC11 | TC-299-29 | R7.5 | tag quiz (có) | QA viết |
| VP1 nút khi đang tải biến thể | TE-4 AC15 | TC-294-20 | R7.2, R12 | D3 | sửa |
| ES1-T276 số Liquid in sẵn, không JS | TE-4 AC17 | TC-299-11 | R8, R6.1 | D4 | QA viết |
| CD2 hết giờ khi đang xem | TE-4 AC17, TE-13 AC1 | TC-299-12, TC-294-25 | R8 | D4 (`sale-gia-nhỏ`, mốc vài phút) | QA viết; TC-294-25 sửa |
| SF3 vi phạm quantity rule, nút bật | TE-4 AC18 | TC-294-26 | R7.2, R12 | D1 | sửa, chờ ES1-T298 |
| SF3 đủ max, khoá + View cart | TE-4 AC18 | TC-299-13 | R7.2 | D1 | QA viết, chờ ES1-T298 |
| SF1 thẻ nhóm, select tần suất, giá theo plan | TE-4 AC19 | TC-294-28, TC-299-14 | R4.14 | D2 | TC-294-28 sửa; TC-299-14 QA viết |
| SF2 pickup dialog drawer / sheet | TE-4 AC20, AC4 | TC-299-15 | R4.10, R12 | D8 | QA viết |
| SF2 pickup không JS, không khối | TE-4 AC20 | TC-299-16 | R4.10, NFR-4 | D8; D7 (sản phẩm số); D5 (gift card) | QA viết |
| SF3 quantity rule trong giỏ | TE-5 AC9 | TC-294-31 | R7.5 | D1 | sửa, chờ ES1-T298 |
| L7 phân trang chung, đầu/cuối | TE-6 AC6, AC1, AC5 | TC-299-17 | R7.3, R7.4, R7.7, R7.8, R12 | collection > 24 sản phẩm; search nhiều trang; blog | QA viết |
| PG1 phân trang bình luận, blog | TE-6 AC6, TE-9 AC3 | TC-299-18 | R7.7 | bài có > 10 bình luận (ES1-T298 mục 4, T267) | QA viết |
| PG3 `?page=` vượt | TE-6 AC7 | TC-299-19 | R7.3 | collection bất kỳ `?page=99` | QA viết |
| PG2 dòng tóm tắt chỉ ở search | TE-8 AC2 | TC-299-20 | R7.8 | search nhiều trang | QA viết |
| L6 testimonials hàng ngang | TE-7 AC1 | TC-299-21, TC-H24 | R3.1, R12 | `/` 4 review | QA viết; TC-H24 giữ |
| L3 không ghi chú giảm giá | TE-12 AC1, AC-H18, AC-H19, TE-10 AC3 | TC-299-22, TC-H18, TC-H19 | R8 | `/` bundle, shop the look | QA viết; TC-H18, H19 sửa |
| LY1 Inbox dịch lên thanh đáy | TE-10 AC6 | TC-299-23 | R9, R12 | store dev bật Shopify Inbox; PDP, cart, `/` 360 | QA viết |
| LY2 banner consent | TE-10 AC7 | TC-299-24 | R12 | market cần consent (KHÔNG CHẮC: store dev) | QA viết |
| LY3 màn thấp | TE-10 AC8 | TC-299-25 | R12 | viewport 800 × 480; 1280 × 900 zoom 200% | QA viết |
| Shopify Email, Discount code trong tài liệu merchant | AC-H33 | TC-H33 | R8 | docs/merchant | sửa |
| L5 popup kết quả: mở, đang tìm, ≤ 4, > 4 | TE-11 AC3 | TC-299-26 | R12 | Lower · Intermediate · Gym (5 sản phẩm) | QA viết |
| L5 popup: 0 kết quả, lỗi tải | TE-11 AC3, AC-H16 | TC-299-27 | R12 | tổ hợp không gắn tag; chặn mạng partial | QA viết |
| L5 dialog a11y, Retake Quiz | TE-11 AC5 | TC-299-28 | R12 | như TC-299-26 | QA viết |
| QZ1 thêm giỏ giữ popup | TE-11 AC6 | TC-299-29 | R7.5, R12 | sản phẩm quiz 1 biến thể còn hàng; `cart_type` drawer và page | QA viết |
| QZ2 Choose Options trong cùng dialog | TE-11 AC7 | TC-299-30 | R12 | Revllen Pro Speed Rope (3 màu) | QA viết |
| QZ3 trang `?view=quiz` | TE-11 AC8 | TC-299-31 | R7.3, R12 | URL 3 tag `?view=quiz` | QA viết |
| ES1-T274 already subscribed, giữ popup | TE-18 AC7 | TC-299-32, TC-294-41 | R4.9 | email đã đăng ký trên store dev | QA viết, chờ ES1-T301 #2; TC-294-41 sửa |
| ES1-T297 #2 Discount code rỗng, WELCOME15 | TE-18 bảng setting, AC5 | TC-294-39 | R8 | D10 | giữ |
| ES1-T297 #1, #2, #6 dữ liệu demo | TE-9 AC7 | TC-294-33 | R20 | D2–D8, D10; D1, D9 theo ES1-T298 | sửa |

Kiểm mồ côi (đếm tay, không chạy được `traceability.py`: phiên BA không có shell):
- AC sửa/mới trong SRS 0.4: NFR-1; TE-1 AC3, AC4, AC5 (trỏ AC10), AC10; TE-2 AC7, AC10; TE-3 AC11; TE-4 AC2, AC4, AC8, AC15, AC17, AC18, AC19, AC20; TE-5 AC6, AC9; TE-6 AC1, AC5, AC6, AC7; TE-7 AC1; TE-8 AC2; TE-9 AC3, AC7; TE-10 AC1, AC3, AC6, AC7, AC8, AC-H30, AC-H33; TE-11 AC3, AC5, AC6, AC7, AC8; TE-12 AC1, AC-H18, AC-H19; TE-13 AC1 (trỏ AC17 0.4), AC2, AC5, AC-H22; TE-18 AC7, bảng setting = 47 mục, mỗi mục có ≥ 1 dòng trên.
- Mỗi dòng có nguồn yêu cầu và story; không TC nào không gắn AC. TC-299-01 … TC-299-32 dùng hết, không trùng số.
- TC cũ bỏ/sửa: `srs-changes.md` mục 6.
