# ES1-T187 — mục "Phải có" của ticket, đánh số để chạy ac_coverage.py
`ac_coverage.py` không đọc mã AC-H (xem ES1-T176), nên QA đánh số theo 6 mục "Phải có" và DoD của ticket, giống ES1-T171, ES1-T201. Nguồn gốc: docs/srs.md#TE-15 AC-H8, AC-H9, AC-H10 (bản AC-H có trong `ac-scope.md`).

- AC1 (= AC-H8) 5 card 336 x 270 đúng tên; next, back cuộn 1 card; card tới đúng collection.
- AC2 (= AC-H9) 0, 1, 5 card; ẩn next, back khi không còn gì để cuộn; 0 collection không render.
- AC3 (= AC-H10) 3 card; badge bằng products_count; số ít, số nhiều; store dev có 24 sản phẩm thì khớp 24 Products, thiếu dữ liệu ES1-T178 thì skip có lý do.
- AC4 Bàn phím: Tab vào danh sách, phím mũi tên cuộn, Enter trên nút, focus nhìn thấy.
- AC5 Không JS: cuộn tay được, card là link. Chặn scroll-buttons.js: nút ẩn, vẫn cuộn được.
- AC6 Đo 360, 768: không tràn ngang, control từ 44px, đúng mặc định ES1-T174.
- AC7 (DoD) axe 0 serious ở mỗi trạng thái; 0 console error.
