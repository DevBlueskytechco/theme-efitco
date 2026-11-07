KHÔNG CHẮC: phần so với store chưa chạy (RUN_STORE_TESTS tắt, phiên QA không vào được store, hỏi ở ES1-T228). ac_coverage.py cho 0%: công cụ không đọc mã AC-H, chỉ bắt được chữ "AC3" trong dòng "xem TE-10 AC3" của mục TE-17, không phải AC của ticket này. Không thêm dòng AC3 giả. Đối chiếu tay: AC-H1 đến H4 đều có case bên dưới.

# ES1-T176 — TE-17-QA2: cổng đo trang chủ so với Figma
Nguồn: docs/srs.md#TE-17 AC-H1 đến AC-H4, ticket ES1-T176, plan ES1-T169 D2, D3, bảng drafts/ba/ES1-T173/home-content.md, Figma node 1:362, 1:422, 1:437

Trạng thái: Tĩnh = đã pass local. Giả = đường đo đã kiểm trên trang giả, chưa chạy trên store. Fixme = test.fixme kèm key.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC-H1 | 2 file templates/index.liquid, index.figma.liquid | So cây block, background, tag của container | Giống hệt | E2E tĩnh | P1 | Tĩnh |
| TC-02 | AC-H1 | index.figma thêm 1 container và block | Chạy TC-01 | Đỏ, log nêu đúng block thừa | E2E tĩnh | P1 | Tĩnh, evidence/order-red.log |
| TC-03 | AC-H1 | Chuỗi mẫu có block thừa, đổi chỗ, background khác, block trong comment | Chạy bộ so | Nhận ra 3 ca lệch, bỏ qua block trong comment | E2E tĩnh | P2 | Tĩnh |
| TC-04 | AC-H2 | /?view=figma, các hàng render không cần dữ liệu Figma (2, 4a, 5–13, 15, 16) | So dòng loại copy với chữ hiện trong block, sau text-transform, bỏ khoảng trắng thừa | Khớp 100%, trừ E9, số sao, dòng không có node, "Sale ends in" | E2E | P1 | Giả |
| TC-05 | AC-H2 | Hàng 3, 4b, 14 cần collection, blog figma-* | So copy | Khớp 100% | E2E | P1 | Fixme ES1-T178 |
| TC-06 | AC-H2 | Dòng loại store của 17 hàng, menu hàng 1 | So copy | Khớp 100% | E2E | P1 | Fixme ES1-T178 |
| TC-07 | AC-H3 | 1920, deviceScaleFactor 2, che logo | So hàng 1 với 1-362.png ghép nền #1A1A1A | Vị trí lệch tối đa 2 px, pixel khác tối đa 1% vùng không che | E2E | P1 | Giả |
| TC-08 | AC-H3 | 1920, deviceScaleFactor 2, che vùng ảnh, dots, pause | So slide 1 với 1-422.png | Khung, CTA, Back, Next lệch tối đa 2 px, pixel khác tối đa 1% | E2E | P1 | Giả |
| TC-09 | AC-H3 | Như TC-08, bấm Next | So slide 2 với 1-437.png | Như TC-08 | E2E | P1 | Giả |
| TC-10 | AC-H3 | Hàng 3 đến 16 | So ảnh | Như TC-08, so đủ ảnh trên / | E2E | P1 | Fixme ES1-T196 |
| TC-11 | AC-H4 | Mục menu hàng 1 | Đọc computed style | Font, cỡ, line-height, letter-spacing, màu bằng node | E2E | P1 | Giả |
| TC-12 | AC-H4 | Eyebrow, heading, sub, CTA, khung, Back, Next hàng 2 | Đọc computed style và khoảng cách | Bằng node, màu sau E1; 3 khoảng cách lệch tối đa 0,5 px | E2E | P1 | Giả |
| TC-13 | AC-H4 | 11 ngoại lệ | Đọc figma-exceptions.json | Đủ E1 đến E11, mỗi mục có nguồn | E2E tĩnh | P2 | Tĩnh |

## Case biên (ngoài AC)

| ID | Tình huống | Kỳ vọng | Trạng thái |
| --- | --- | --- | --- |
| B-01 | Phần tử cần đo không có trên trang (nút pause khi không autoplay) | Không treo tới hết timeout; vùng che bỏ qua, phần đo báo "không có phần tử" | Giả. Lỗi này tìm thấy khi chạy trang giả, đã sửa |
| B-02 | Ảnh thật lệch 1, 2 px | Comparator đếm đúng, vượt ngưỡng thì đỏ | Giả, xem calibration.md mục 2 |
| B-03 | Sai cỡ chữ heading, thiếu 1 chuỗi copy | Đỏ, nêu đúng giá trị và chuỗi | Giả |
| B-04 | Store chặn hoặc trả 429 | Fail nêu rõ, không skip (support/store-guard.ts) | Dùng lại helper, chưa chạy |
| B-05 | Mobile, Pixel 7 | Skip có lý do: Figma chỉ có 1920. Mobile thuộc ES1-T196 | Giả |
| B-06 | Merchant chưa chọn resource | ?view=figma rơi về collections.all (ES1-T175). Hàng 3, 4b, 14 không render nên fixme | Chưa chạy |
| B-07 | Node ẩn trong Figma | Không so: spec kiểm mọi node so ảnh, style đang hiện | Tĩnh |
| B-08 | Mất mạng, keyboard, screen reader | Không thuộc ticket đo giống Figma. AC-H7, H35 ở ES1-T196 | Không áp dụng |

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))

Cần ES1-T178: menu main-menu 7 mục, collection figma-*, blog figma-blog. Chưa có thì hàng 1 có số đo nhưng vùng menu lệch, TC-05, TC-06 vẫn fixme.

## Kiểm tĩnh phụ

`tools/check_copy_static.py`: 99 dòng copy, 2 dòng không thấy nguyên chuỗi trong locales hoặc schema. Cả 2 không phải thiếu copy: 1:457 tách phần theo ảnh inline, 1:617 dùng biến `%p%` ("Setup Discount (%p%)"). Đây là kiểm chuỗi có mặt, không thay TC-04.

## KHÔNG CHẮC

- "Add to cart" hàng 10 trên collections.all: sản phẩm rơi về có thể hết hàng thì nút đổi chữ, TC-04 đỏ giả. Đối chiếu ở lần chạy đầu.
- Hàng 11 nền baseline: node không có fill, template dùng background alt. Xác nhận khi mở hàng này.
- Cột mở hàng: hàng 3 đến 16 ghi ES1-T196 vì đó là ticket so đủ ảnh trên /; mask, geometry, style của từng hàng viết khi mở.
