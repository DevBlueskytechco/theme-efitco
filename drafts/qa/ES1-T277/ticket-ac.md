KHÔNG CHẮC: phiên QA không vào được store dev (sandbox chặn mạng, thiếu STORE_PASSWORD, không có quyền gh); AC1 và phần số đo của AC2–AC4 chờ ES1-T281.

# ES1-T277 — AC quy đổi từ ticket
Ticket không đánh số AC, QA đánh số theo 4 mục việc và dòng ràng buộc để chạy ac_coverage.

- AC1 (Mục 1) Given store dev hoa-qua-nhap-khau, theme live và preview develop When chạy Lighthouse desktop, mobile cho trang chủ, collection, sản phẩm, blog, bài viết, page Then có lhr JSON từng lần đo trong drafts/qa/ES1-T277/lhr/.
- AC2 (Mục 2) Given lhr When đọc category best-practices Then liệt kê mọi audit bị trừ điểm: tên, trọng số, điểm, phần tử hoặc URL gây lỗi.
- AC3 (Mục 3) Given danh sách audit trượt When phân loại từng item Then mỗi item thuộc đúng 1 nhóm: theme (file nào), nền tảng Shopify, store dev; mục do theme có cách sửa.
- AC4 (Mục 4) Given phân loại When tính lại điểm Then nêu điểm BP tối đa nếu sửa hết phần theme, trả lời có đạt 100 không; không sửa code theme.
- AC5 (Ràng buộc) Given CI store-tests dùng chung store When QA đo Then đo tuần tự, không song song với CI; đầu ra là best-practices.md và lhr JSON.
