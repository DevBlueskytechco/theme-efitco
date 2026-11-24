# ES1-T187 — AC trong phạm vi (trích docs/srs.md#TE-15 bản 0.5)
Dùng cho `ac_coverage.py`. Ticket nhận AC-H8, AC-H9, AC-H10. Tiêu chí 1, 2 của TE-15 chỉ dùng ở phần AC-H9 trỏ tới (hàng vừa khung) và phần ticket yêu cầu đo 360/768, không nằm trong phạm vi nghiệm thu.

- AC-H8 (TC-H8, hàng 3) Given block có 5 collection When render 1920 Then 5 card 336 × 270 đúng tên; bấm next/back cuộn 1 card; card link tới đúng collection.
- AC-H9 (TC-H9, hàng 3) Given dưới 5 collection hoặc 0 collection When render Then chỉ hiện số card có, ẩn next/back khi không còn gì để cuộn; 0 collection thì storefront không render. (0.5) Hàng vừa khung theo tiêu chí 1 của TE-15 (lưới tĩnh, không nút, không thanh tiến trình).
- AC-H10 (TC-H10, hàng 4b) Given 3 card trình độ gắn collection When render Then badge số sản phẩm bằng `products_count` của collection, số ít nhiều đúng locale; store dev có 24 sản phẩm để khớp "24 products".
