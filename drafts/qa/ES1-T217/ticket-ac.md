# ES1-T217 — AC quy đổi từ ticket
Ticket không đánh số AC, nên QA đánh số theo mục Việc và DoD để chạy ac_coverage.

- AC1 (Nhóm A) Given log 429 tài nguyên và màn thử thách When test axe, console chạy Then log 429 được bỏ qua, màn thử thách được nhận biết bằng support/store-guard.ts, vi phạm axe thật vẫn bị báo.
- AC2 (Nhóm C, test đo sai) Given spec khẳng định cũ hoặc đo sai When sửa Then không nới assert để qua.
- AC3 (Lỗi code) Given lỗi code thật When phát hiện Then tạo 1 ticket bug cho mỗi bug, không sửa code, test giữ đỏ hoặc fixme kèm key bug.
- AC4 (Bảng) Given 30 test When phân loại Then triage.md có A/B/C/D, nguyên nhân, xử lý và danh sách bug.
- AC5 (DoD) Given spec đã sửa When chạy Then playwright --list nạp đủ, test tĩnh chạy local xanh trừ cái có bug.
