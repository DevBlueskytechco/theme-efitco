# ES1-T229 — AC quy đổi từ ticket
Ticket không đánh số AC, nên QA đánh số theo 5 mục và DoD để chạy ac_coverage.

- AC1 (Mục 1) Given getCart thật trả { cart: { totalQuantity: 2 } } When TC-25 của ES1-T203 đọc Then đọc đúng cấp .cart, shape lạ vẫn fail.
- AC2 (Mục 2) Given getCart đã có kết luận When gỡ spec thăm dò Then xoá ES1-T227.spec.ts, support/action-probe.ts, kết luận 2 dòng ở note.md.
- AC3 (Mục 3) Given đổi tab trong ES1-T189 When đếm request Then chỉ tính request cùng origin store tới dữ liệu tab (collections, products, partial, section), bỏ analytics.
- AC4 (Mục 4) Given Cloudflare chặn cùng shard When chạy T73 TC-1, TC-2, T94 nojs x3, T95 markup, nojs Then báo 'bị Cloudflare chặn' thay vì timeout, không skip.
- AC5 (Mục 5) Given sửa xong When đọc diff Then không thêm test mới gọi /cart thật, giữ 1 luồng thật mỗi project.
- AC6 (DoD) Given sửa xong When chạy local Then test tĩnh và logic xanh, nêu rõ test không chạy được local.
