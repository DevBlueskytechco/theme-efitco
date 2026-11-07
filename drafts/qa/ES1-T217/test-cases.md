KHÔNG CHẮC: chưa chạy trên store, không đọc được log CI (api.github.com và store bị từ chối). Bảng dưới là kết quả local. Câu hỏi: xem triage.md.

# ES1-T217 — phân loại test đỏ sau đợt code trang chủ
Nguồn: ticket ES1-T217, AC quy đổi ở ticket-ac.md. Spec: tests/e2e/ES1-T217.spec.ts, repro: drafts/qa/ES1-T217/repro.spec.ts. Không có Figma.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | log Chrome "status of 429" | qua bộ lọc console | bị bỏ qua | [E2E] tĩnh | P1 | Đạt |
| TC-02 | AC1 | log 500, 404, 4290, lỗi JS nhắc 429, warning 429 | qua bộ lọc | vẫn tính là lỗi | [E2E] tĩnh | P1 | Đạt |
| TC-03 | AC1 | mọi spec có AxeBuilder | quét mã nguồn | có expectNotChallenged ngay trước khi quét | [E2E] tĩnh | P1 | Đạt |
| TC-04 | AC2 | toàn assets/base.css, bỏ comment | tìm màu literal | 0 kết quả, bù cho việc 4 spec chỉ quét mục của mình | [E2E] tĩnh | P1 | Đạt |
| TC-05 | AC2 | toàn assets/base.css, bỏ comment | tìm margin, padding vật lý | 0 kết quả | [E2E] tĩnh | P2 | Đạt |
| TC-06 | AC2 | mốc cắt của T94, T95, T184, T186 | tìm trong base.css | có đủ, đúng thứ tự | [E2E] tĩnh | P2 | Đạt |
| TC-07 | AC1 | trang thường có meta refresh | expectNotChallenged, rồi axe | không bị coi là thử thách, axe báo meta-refresh | [E2E] trang giả | P1 | Đạt |
| TC-08 | AC1 | màn thử thách có meta refresh | expectNotChallenged | fail với "bị Cloudflare chặn" | [E2E] trang giả | P1 | Đạt |
| TC-09 | AC3 | quiz đang tải kết quả | bấm Back (R1) | về bước 2, 0 pageerror | repro | P1 | Không đạt, ES1-T218 |
| TC-10 | AC3 | quiz đang tải kết quả | đổi đáp án bước 3 (R2) | request mới chạy, hết aria-busy | repro | P1 | Không đạt, ES1-T218 |
| TC-11 | AC3 | quiz bước 1 | double click lựa chọn (R3) | sang 1 bước, 0 chọn hộ, focus tiêu đề | repro | P3 | Không đạt, ES1-T219 |
| TC-12 | AC3 | hàng Browse Categories đã cuộn | Enter trên nút prev tới khi nút tự ẩn (R4, R4b) | focus sang nút next | repro | P2 | Không đạt, ES1-T220 |
| TC-13 | AC3 | schema, token của ES1-T190 | chạy test tĩnh | DESIGN.md, docs/tokens.json có badge_new | [E2E] tĩnh | P3 | Không đạt, ES1-T221 |
| TC-14 | AC4 | 32 dòng test trong ticket | đọc triage.md | mỗi dòng có nhóm, nguyên nhân, xử lý, trạng thái bằng chứng | review | P1 | Đạt |
| TC-15 | AC5 | toàn bộ spec | playwright --list | nạp đủ 1870 test trong 56 file | lệnh | P1 | Đạt |
| TC-16 | AC5 | toàn bộ spec, 1 project desktop | chạy không có store | 1 test tĩnh đỏ, là ES1-T190 đã có bug | lệnh | P1 | Đạt |

## Case biên (ngoài AC)
- Thư viện partial giả: R1, R2 không phụ thuộc thư viện, vì lỗi xảy ra trước khi gọi fetch hoặc do root() trả null.
- Lỗi video có và không có product (R7): đạt trên trang giả, cả 2 project.
- Testimonials 1920 và 1280 bằng CSS thật (R5, R6): đạt trên trang giả, cả 2 project.
- evaluateAll khi tắt JS (R8): chạy được, nên giả thuyết này không giải thích lỗi nojs của ES1-T156.
- Mất mạng, mobile 360, screen reader, merchant chưa chọn resource: không thuộc ticket này, không có test mới.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
Không dùng: phiên QA không vào được store.

## KHÔNG CHẮC
- Sửa nhóm A mới được kiểm ở mức đơn vị. Số test thật sự hết đỏ phải chờ CI đủ.
- ES1-T180 thêm chờ document.fonts.ready dựa trên giả thuyết font, chưa có bằng chứng từ log.
