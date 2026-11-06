KHÔNG CHẮC: CHƯA CÓ SỐ ĐO THẬT TRÊN STORE. Phần so với store của spec chưa chạy lần nào: RUN_STORE_TESTS đang tắt (CTO 06/11, ES1-T175), phiên QA không vào được store. CTO chưa thể ký G1 từ file này. Hỏi cách chạy ở ES1-T228.

# ES1-T176: hiệu chuẩn ngưỡng so ảnh hàng 1, 2

## 1. Số đo thật trên `/?view=figma`

| Hàng | Node | Lệch kích thước lớn nhất (px) | Pixel khác, threshold 0,2 | Tỷ lệ trên vùng không che | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| 1 | 1:362 | CHƯA ĐO | CHƯA ĐO | CHƯA ĐO | Chờ CI |
| 2 slide 1 | 1:422 | CHƯA ĐO | CHƯA ĐO | CHƯA ĐO | Chờ CI |
| 2 slide 2 | 1:437 | CHƯA ĐO | CHƯA ĐO | CHƯA ĐO | Chờ CI |

Cách điền sau khi CI chạy: đọc dòng `[figma-calibration]` trong log, `kind` là `image`, `geometry`, `style`, `spacing`, `requests`. Đặt `FIGMA_PROBE_ALL=1` để có thêm threshold 0,1 và 0,3.

Điều kiện để số đo có nghĩa:
- Hàng 1 cần menu `main-menu` theo Figma, nhập ở ES1-T178. Trước đó vùng menu khác chữ, số đo cao không nói gì về ngưỡng.
- Hàng 1, 2 ghép baseline lên #1A1A1A (1:360). Band hero chưa nền tối thì 4 góc slide và nền header lệch; câu hỏi đang mở ở ES1-T208.
- Font thật phải tải được trên store (Sofia Sans Condensed, Inter).

## 2. Độ nhạy của ngưỡng, đo trên trang giả

Đây KHÔNG phải số đo theme. Trang giả đặt đúng ảnh Figma lên trang, chụp bằng đúng đường đo của spec. Nó chỉ trả lời: nếu chỉ lệch vị trí, không lệch cách vẽ chữ, thì ra bao nhiêu phần trăm. Chưa đo được chênh do Chromium vẽ chữ khác Figma, đây là phần chính của việc hiệu chuẩn.

Chạy ngày 06/11/2026, local, Playwright 1.64.1, 1920, deviceScaleFactor 2. Ô là pixel khác và tỷ lệ trên vùng không che, threshold 0,2.

| Kịch bản | Hàng 1 (157 920 px không che) | Slide 1 (2 193 460 px) | Slide 2 (2 494 600 px) |
| --- | --- | --- | --- |
| Khớp | 0 (0%) | 22 (0,001%) | 22 (0,001%) |
| Lệch ngang 1 px CSS | 2 410 (1,526%) ĐỎ | 16 036 (0,731%) | 17 530 (0,703%) |
| Lệch ngang 2 px CSS | 6 337 (4,013%) ĐỎ | 36 160 (1,649%) ĐỎ | 41 258 (1,654%) ĐỎ |

22 pixel ở kịch bản Khớp là mép bo góc của trang giả, nằm ngoài vùng che.

Threshold khác, cùng kịch bản (tỷ lệ trên vùng không che):

| Kịch bản | Hàng | 0,1 | 0,2 | 0,3 |
| --- | --- | --- | --- | --- |
| Lệch 1 px | 1 | 1,567% | 1,526% | 1,496% |
| Lệch 1 px | Slide 1 | 0,858% | 0,731% | 0,591% |
| Lệch 1 px | Slide 2 | 0,832% | 0,703% | 0,575% |
| Lệch 2 px | 1 | 4,030% | 4,013% | 4,001% |
| Lệch 2 px | Slide 1 | 1,750% | 1,649% | 1,512% |

Đọc số:
- 2 ngưỡng không độc lập. AC-H3 cho lệch kích thước tới 2 px, nhưng cả khối lệch 1 px đã qua 1% ở hàng 1, lệch 2 px đã qua 1% ở cả 3 ảnh. Ai đạt 2 px chưa chắc đạt 1%.
- Đổi threshold từ 0,1 sang 0,3 gần như không đổi kết quả. Nới threshold không cứu được lệch vị trí.

## 3. Đề xuất chờ CTO quyết sau khi có số thật

Chưa đề xuất nới. Không có số thật thì không có cơ sở.

| Điểm | Đang đặt trong `tests/e2e/support/figma-rows.json` | CTO cần chốt |
| --- | --- | --- |
| Kích thước | 2 px | Giữ hay đổi |
| Tỷ lệ pixel | 1% | Giữ hay đổi |
| Mẫu số của 1% | Vùng không che. QA tự chọn vì AC-H3 không nêu | Vùng không che (chặt hơn) hay cả ảnh. Slide 1 che 63% ảnh: 1% cả ảnh tương đương khoảng 2,7% vùng không che |
| Threshold từng pixel | 0,2, mặc định của Playwright | Giữ hay đổi |

Tiêu chí copy, style, sổ chênh lệch không nới, spec so đúng giá trị sau khi áp ngoại lệ E1, E5.

Ký trên ES1-T176 là điều kiện G1. Hiện chưa đủ điều kiện để ký.

## 4. Quyết định đo QA tự đặt, cần xác nhận

- Hàng 2 trên `?view=figma`: che vùng ảnh người mẫu ở cả 2 ảnh, ẩn ảnh và overlay trên trang, sơn nền slide bằng màu trung vị lấy từ ảnh Figma. Vì ảnh chiếm cả khung nên nếu chỉ che theo DOM thì che luôn cả chữ, không còn gì để so. Nền Figma là gradient, nền sơn là màu phẳng, phần chênh này chưa đo riêng.
- Hàng 1: che logo vì logo là ảnh chọn trong editor.
- Vùng che tính tay từ ảnh export, không lấy theo khung node: khung 1:426 phủ gần hết slide, trùm lên chữ.
- Baseline dựng lúc chạy, không commit, để repo không tăng khoảng 40 MB.

## 5. Dự đoán từ đọc CSS, chưa đo, chưa tạo bug

`assets/base.css`: `.slideshow__content` gap `--space-5` cộng `.slideshow__buttons` margin `--space-4`. Nếu `--space-1` là 4 px thì sub tới CTA là 24 + 16 = 40 px, Figma 60 px. Test "sub tới CTA" sẽ báo nếu đúng. Tạo bug khi có số đo.

## 6. Thời gian và request trên CI

| Mục | Kết quả |
| --- | --- |
| Thời gian chạy thêm trên CI | CHƯA ĐO. Trang giả local 6,2 s cho 10 test, không đại diện cho store |
| Số request store | CHƯA ĐO. Spec mở trang 6 lần, chỉ project desktop, ghi số thật ở dòng `kind: requests`. Chỉ đếm request cùng origin store, không đếm CDN |
| Test không gọi store | 4 test tĩnh, 19 fixme |
