# ES1-T203 — AC quy đổi từ ticket
Ticket không đánh số AC, nên QA đánh số theo mục Việc và DoD để chạy ac_coverage.

- AC1 (Việc 1) Given T96, T97, T98 When chạy Then Cart API và partial do mock trong bộ nhớ theo 1 test trả (JSON, 422, 500, delay), JS thật chạy trên trang thật, trang tải 1 lần mỗi test, 0 request Cart API tới store; cách làm partial và giới hạn được ghi rõ.
- AC2 (Việc 2) Given mỗi project When chạy luồng thật (test.describe.serial, không retry) Then thêm giỏ từ trang sản phẩm, drawer mở, đổi số lượng, xoá, sang cart page trong 1 phiên với /cart.js thật.
- AC3 (Việc 3) Given store trả màn thử thách When test gặp Then test fail với thông báo 'bị Cloudflare chặn', không báo lỗi code, không skip im lặng; console guard bỏ qua log từ /cdn-cgi/challenge-platform và challenges.cloudflare.com.
- AC4 (Việc 4) Given ES1-T97 'đổi trong lúc refresh' When chạy trên mock Then kết luận lỗi thật hay không; lỗi thật thì tạo bug dev-be, không sửa code.
- AC5 (Ràng buộc) Given PR When kiểm Then chỉ đổi tests/, không có test.fixme thiếu ticket bug trong T96, T97, T98.
- AC6 (DoD) Given CI PR When store-tests chạy Then T96, T97, T98 chạy (không skip) ≥ 90%, 0 trang thử thách, 0 lần 429 ở các spec này; luồng thật pass desktop + mobile; `[429-tong-ket]` nêu số.
