# ES1-T171 — AC quy đổi từ ticket
Ticket không đánh số AC và không thuộc AC nào của TE-10 trong docs/srs.md, nên QA đánh số theo mục A, B, C, D1, D3 và DoD để chạy ac_coverage.

- AC1 (A) Given ES1-T30 cần bật autoplay When enableAutoplay chạy Then không gọi lại store trong route, 7 test autoplay chạy thật.
- AC2 (B) Given iframe Shop Pay trả 403 When console guard của spec chạy Then helper dùng chung trong tests/e2e/support bỏ qua "403 @ chrome-error://" chỉ khi đã thấy response 403 từ https://shop.app/; áp cho ES1-T73, ES1-T81, TE-3 B-05, TC-12 và mọi spec có console guard chạm trang sản phẩm.
- AC3 (C) Given ES1-T45 TC-06, ES1-T147, ES1-T156 When store trả 429 Then thử lại qua helper; ES1-T147, ES1-T156 gọi Cart API bằng cartApi.
- AC4 (D1) Given TE-1 TC-02 When đọc assets/base.css Then cho phép calc() trên var(), không sửa CSS, giá trị cứng trong calc vẫn bị bắt.
- AC5 (D3) Given ES1-T147 nojs AC1 When submit form name=id[] Then gọi Cart API qua helper, chờ có giỏ rồi mới đọc; vẫn sai thì báo lỗi thật kèm bằng chứng, không che test.
- AC6 (Giới hạn) Given ES1-T120 AC3 360 When làm ticket này Then không sửa, chỉ sửa tests/.
- AC7 (DoD) Given repo When playwright test --list Then nạp đủ.
- AC8 (DoD) Given tests/e2e/*.spec.ts When grep "/cart/.*\.js" Then không còn dòng nào ngoài helper hoặc route mock.
- AC9 (DoD) Given PR của ticket When CI chạy Then e2e xanh.
- AC10 (DoD) Given log CI When đọc Then báo được số skip do 429 theo spec.
