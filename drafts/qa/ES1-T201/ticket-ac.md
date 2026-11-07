# ES1-T201 — AC quy đổi từ ticket
Ticket không đánh số AC, nên QA đánh số theo mục Việc và DoD để chạy ac_coverage.

- AC1 (Việc 1) Given state.json sau globalSetup When spec chạy Then không có cookie cart, không spec nào gọi clear giỏ ở beforeEach.
- AC2 (Việc 2) Given test cần giỏ có hàng When seed Then 1 request add với items[]; line key đọc từ DOM.
- AC3 (Việc 3) Given /cart/add.js trả 429 When helper thử lại Then chờ tăng dần, tổng ≤ 15 s; hết lượt mới skip có lý do và được nêu theo spec.
- AC4 (Việc 4) Given 1 shard chạy xong When kết thúc Then in tổng kết skip do 429 theo spec.
- AC5 (DoD) Given CI PR When store-tests chạy Then ES1-T96 ≥ 15/19, ES1-T97 ≥ 25/35, ES1-T98 ≥ 18/25 test chạy thật ở ít nhất 1 project, nêu số cả 2 project.
- AC6 (DoD) Given test chạy thật lộ lỗi code cart-drawer.js, cart-items.js When phát hiện Then tạo bug cho dev-be, test đánh dấu test.fixme kèm key bug, không sửa code.
- AC7 (DoD) Given repo When kiểm Then không đổi store-tests.yml, playwright test --list nạp đủ.
