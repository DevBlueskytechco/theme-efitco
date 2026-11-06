# ES1-T224 — AC quy đổi từ ticket
Ticket không đánh số AC, nên QA đánh số theo 7 mục và DoD để chạy ac_coverage.

- AC1 (Mục 1) Given request tới dịch vụ ngoài có pathname `/` When đếm refresh TC-25 Then chỉ tính request refresh của store.
- AC2 (Mục 2) Given trang có video, Shop giữ kết nối When ES1-T188:125 chờ Then dùng điều kiện cụ thể, không networkidle.
- AC3 (Mục 3) Given ES1-T180:158 hàng 8 When trang không tải được hoặc thiếu block Then dùng store-guard nêu lý do; block thiếu thật thì tạo bug dev-fe.
- AC4 (Mục 4) Given ES1-T156:250 nojs When timeout Then tìm nguyên nhân; Cloudflare báo rõ, lỗi code tạo bug dev-fe.
- AC5 (Mục 5) Given ES1-T179:205 AC-H24 1920 When End không cuộn Then test đúng thì tạo bug dev-fe, không nới test.
- AC6 (Mục 6) Given test axe T179, T180, T182 When bị chặn Then giữ báo chặn, không skip, gộp trang nếu được.
- AC7 (Mục 7) Given ES1-T191 thứ tự bài blog When xử lý Then không đổi test.
- AC8 (DoD) Given sửa xong When chạy local Then test tĩnh xanh, có triage.md, bug đúng task_type, parent TE-17.
