KHÔNG CHẮC: mã TC-395-* là mã đề xuất, QA viết bước ở ticket QA của từng story. 4 dòng (TE-6 AC15, TE-8 AC4, AC5, TE-11 AC9, AC10, TE-18 AC7, AC10, TE-22 AC9) viết theo mặc định ES1-T436, im lặng tới 14/11/2026 = nhận. Chưa chạy `traceability.py` vì phiên không có shell, số dòng đếm tay. Bảng gộp SRS 0.5 có thêm cột ui-spec, mốc, trạng thái là việc của REQ2-BA4 (ES1-T397).

# ES1-T395: ma trận truy vết SRS 0.5, phần khung, giỏ, collection, tìm kiếm, lớp (yêu cầu → AC → TC → mã R → task R2 → dữ liệu)

Cột trạng thái: "QA viết" = TC chưa có; "sửa" = TC cũ đổi kỳ vọng; "thiếu task" = AC chưa có task dev trong task-split ES1-T307 hoặc chưa có trong body ticket.

| Yêu cầu (nguồn) | Story / AC | TC | Mã R | Task R2 | Dữ liệu store dev | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| foundation §4, §27, §29; audit A #31, T9 | TE-1 AC11 | TC-395-01 | R4.18, R4.2, R12 | TE-1-R2-FE4 (ES1-T321); QA ES1-T325 | shop bật Shop; payment types ≥ 3 | QA viết |
| foundation §4, §12; ES1-T308 #1; audit C4, C11 | TE-1 AC12 | TC-395-02 | R4.9, R13, R8, R12 | ES1-T321, TS-FE1 (ES1-T401), TS-FE2 (ES1-T402); QA ES1-T325, TS-QA1 (ES1-T412) | theme sạch (không áp fixture); store dev chữ newsletter | QA viết |
| audit C9, C10; R14 favicon, logo | TE-1 AC13 | TC-395-03 | R14 | TS-FE1 (ES1-T401); QA ES1-T412 | ảnh favicon 32 × 32; có/không logo | QA viết |
| foundation §3.2, §3.4 | TE-1 AC14 | TC-395-04 | R12 | TE-1-R2-FE1 (ES1-T319), TE-1-R2-FE3 (ES1-T320); QA ES1-T325 | — | QA viết |
| cart.md §3.4; mini-cart-quickview §1; audit C11 | TE-5 AC3 | TC-395-05 | R7.5, R12 | TE-5-R2-FE1 (ES1-T368); QA ES1-T99 | `free_shipping_threshold` 0 và 500 | sửa |
| G1 sổ 10/11; cart.md §3.2 | TE-5 AC11 | TC-395-06 | R7.5, R12 | ES1-T368, TE-5-R2-FE2 (ES1-T369), TE-5-R2-BE1 (ES1-T370); QA ES1-T99 | sản phẩm tồn 2 để gây 422 | QA viết |
| cart.md §3.1, §3.3; product-shopify-features §3.1, §6, §11 | TE-5 AC12 | TC-395-07 | R4.1, R4.4, R4.16, R7.5, R12 | ES1-T368, ES1-T369; QA ES1-T99 | gift card D5 có người nhận; unit price D6; compare_at; discount dòng | QA viết |
| cart.md §3.1 State 4; mini-cart §6 4c | TE-5 AC13 | TC-395-08 | R7.5 | ES1-T368, ES1-T369; QA ES1-T99 | sản phẩm hết hàng sau khi thêm (đổi tồn bằng admin) | QA viết |
| G3 sổ 10/11; cart.md §2, §3.6, §6 | TE-5 AC14 | TC-395-09 | R4.1, R7.5, R3.1, R12 | ES1-T369; QA ES1-T99 | discount cấp đơn `WELCOME15` | QA viết |
| M2 10/11; mini-cart-quickview §1, §2 | TE-5 AC15 | TC-395-10 | R7.5, R12 | ES1-T368, TE-5-BE3 (ES1-T98); QA ES1-T99 | giỏ 2 dòng, có/không discount | QA viết |
| sổ 11/11 TUÂN THỦ (1); foundation §27; product-shopify-features §3.2 | TE-5 AC16 | TC-395-11 | R4.2, R4.15 | ES1-T368, ES1-T369; QA ES1-T99 | Shop Pay, Installments bật trên store dev | QA viết |
| cart.md §3.7; layers §2.2 | TE-5 AC17 | TC-395-12 | R7.5, R12 | ES1-T369, ES1-T370; QA ES1-T99, ES1-T318 | giỏ 3 dòng ở 360, 768 | QA viết |
| cart.md §4; mini-cart §6 4b, 4d | TE-5 AC18 | TC-395-13 | R7.5, R12 | ES1-T368, ES1-T369, ES1-T370; QA ES1-T99 | chặn mạng `route.abort` /cart/change | QA viết |
| cart.md §3.9; mini-cart §6 4a | TE-5 AC19 | TC-395-14 | R7.5, R17 | ES1-T368, ES1-T369; QA ES1-T99 | giỏ rỗng; setting collection trống/đã chọn | QA viết |
| C1 10/11; collection.md §3, §5.1 | TE-6 AC8 | TC-395-15 | R7.3, R3.1 | TE-6-R2-FE2 (ES1-T365); QA ES1-T112 | collection có filter và không filter | QA viết |
| collection.md §5.2 | TE-6 AC9 | TC-395-16 | R4.3, R12 | TE-6-R2-FE3 (ES1-T366), TE-6-BE1 (ES1-T110); QA ES1-T112 | nhóm Color 10 giá trị; giá trị đếm 0 | QA viết |
| C2 10/11; collection.md §5.3 | TE-6 AC10 | TC-395-17 | R4.3, R12 | ES1-T366, ES1-T110; QA ES1-T112 | — | QA viết |
| collection.md §6 | TE-6 AC11 | TC-395-18 | R7.3, R12 | ES1-T365, ES1-T366; QA ES1-T112 | — | QA viết |
| collection.md §7 | TE-6 AC12 | TC-395-19 | R4.3, R12 | ES1-T365, ES1-T110; QA ES1-T112 | 2 filter + giá | QA viết |
| collection.md §4; foundation §3.3 | TE-6 AC13 | TC-395-20 | R7.3 | ES1-T365, TE-22-R2-FE1 (ES1-T326); QA ES1-T112 | collection có ảnh + mô tả 5 dòng; không ảnh | QA viết |
| collection.md §8, §9; foundation §18 | TE-6 AC14 | TC-395-21 | R7.3, R12 | ES1-T365, ES1-T110; QA ES1-T112 | collection rỗng; filter ra 0; trễ mạng 500 ms; lỗi mạng | QA viết |
| L1–L2 10/11; list-collections.md; ES1-T436 #1 | TE-6 AC15 | TC-395-22 | R7.4, R3.1, R12, R17 | TE-6-R2-FE4 (ES1-T367); QA ES1-T112 | 14 collection, 6 không ảnh | QA viết (mặc định ES1-T436) |
| FD2; foundation §24.1; ES1-T308 #1; ES1-T436 #2 | TE-8 AC4 | TC-395-23 | R4.13, R14 | TE-8-R2-FE1 (ES1-T377); QA ES1-T131 | theme sạch; store dev 5 cụm, thử 6 cụm | QA viết (mặc định ES1-T436) |
| S1 10/11; search.md §2, §3.1–§3.3 | TE-8 AC5 | TC-395-24 | R7.8, R12 | TE-8-FE1 (ES1-T128); QA ES1-T131 | q=`adjustable` | QA viết; breadcrumb thiếu task |
| search.md §3.4, §3.7–§3.9 | TE-8 AC6 | TC-395-25 | R7.8 | ES1-T128; QA ES1-T131 | q khớp sản phẩm + bài + page | QA viết |
| S2 10/11; search.md §3.5, §3.6 | TE-8 AC7 | TC-395-26 | R4.3 | ES1-T128, TE-8-R2-BE2 (ES1-T380), ES1-T110; QA ES1-T131 | q có filter Color | QA viết |
| search.md §6 S1, S2, S5, S6 | TE-8 AC8 | TC-395-27 | R7.8, R17 | ES1-T128, ES1-T380; QA ES1-T131 | không q; q=`treadmill`; lỗi mạng | QA viết |
| SR1 10/11; predictive-search §1, §3 | TE-8 AC9 | TC-395-28 | R4.13, R12 | TE-8-FE2 (ES1-T129), TE-8-BE1 (ES1-T130); QA ES1-T131 | Search style Popup, Drawer | QA viết |
| SR2 10/11; predictive-search §2–§4 | TE-8 AC10 | TC-395-29 | R4.13, R12 | ES1-T377, TE-8-R2-BE1 (ES1-T378); QA ES1-T131 | q=`ad`, q có ≥ 8 sản phẩm | QA viết |
| SR3 10/11; predictive-search §2.7, §5, §6 | TE-8 AC11 | TC-395-30 | R4.13 | ES1-T377, ES1-T378; QA ES1-T131 | 3 setting rỗng/đã cấu hình | QA viết |
| predictive-search §4, §6, §10 | TE-8 AC12 | TC-395-31 | R4.13, R12 | ES1-T377, ES1-T378, ES1-T130; QA ES1-T131 | trễ 300 ms, lỗi 500 bằng `route` | QA viết |
| predictive-search §4 recent (Should) | TE-8 AC13 | TC-395-32 | R4.13 | TE-8-R2-BE3 (ES1-T379, Should); QA ES1-T131 | — | QA viết khi BE3 không bị cắt |
| predictive-search §8, §10 | TE-8 AC14 | TC-395-33 | R4.13, R12, R17 | ES1-T129, ES1-T130, ES1-T378; QA ES1-T131 | — | QA viết |
| ES1-T306 mục writer | TE-10 AC5 | TC-395-34 | R21–22 | chưa có task writer R2 | — | sửa; thiếu task |
| layers §3; WCAG 2.4.11 | TE-10 AC9 | TC-395-35 | R12 | TE-10-R2-FE1 (ES1-T312); QA ES1-T318 | PDP, cart 3 dòng, bundle 6 sản phẩm ở 360 | QA viết |
| layers §2.2, §2.3, §4, §6, §8 | TE-10 AC10 | TC-395-36 | R12, R6.1 | ES1-T312, TE-10-R2-BE1 (ES1-T314); QA ES1-T318 | — | QA viết |
| layers §2.4; foundation §17 | TE-10 AC11 | TC-395-37 | R12 | TE-10-R2-FE2 (ES1-T313), ES1-T314; QA ES1-T318 | — | QA viết |
| foundation §15, §16; layers §1, §4 | TE-10 AC12 | TC-395-38 | R12 | ES1-T313, TE-10-R2-BE2 (ES1-T315), ES1-T312; QA ES1-T318 | — | QA viết |
| foundation §6, §18 | TE-10 AC13 | TC-395-39 | R12 | ES1-T313; QA ES1-T318 | — | QA viết |
| sổ 11/11 TUÂN THỦ (3); audit T5, A #42, #53 | TE-10 AC14 | TC-395-40 | R7.3, R7.7 | TS-FE5 (ES1-T403), ES1-T337, ES1-T368, ES1-T377, ES1-T327; QA ES1-T412 | sản phẩm, collection, bài tên 120 ký tự | QA viết |
| sổ 11/11 TUÂN THỦ (5); foundation §28; audit T7, C7, N18 | TE-10 AC15 | TC-395-41 | R8, R12 | ES1-T403; QA ES1-T412 | mô tả có h2–h6, bảng rộng, blockquote | QA viết |
| ES1-T308 #1; hàng 6 | TE-11 AC-H15 | TC-H15 | R8, R12 | TS-FE4 (ES1-T406), TE-17-R2-FE2 (ES1-T341); QA ES1-T345 | theme sạch; store dev fixture ES1-T331 | sửa |
| quiz-result §5 2a, §7; ES1-T436 #3 | TE-11 AC9 | TC-395-42 | R12 | TE-11-R2-FE1 (ES1-T387), TE-11-R2-BE1 (ES1-T388); QA ES1-T140 | trễ partial 1 s | QA viết (mặc định ES1-T436) |
| QZ3; quiz-result §6; ES1-T436 #1 | TE-11 AC10 | TC-395-43 | R7.3, R12, R17 | ES1-T387; QA ES1-T140 | URL 3 tag khớp 5 và 3 sản phẩm | QA viết; breadcrumb thiếu task |
| audit C8 | TE-11 AC11 | TC-395-44 | R12 | ES1-T403; QA ES1-T412 | — | QA viết |
| sổ 11/11 TUÂN THỦ (7); audit C5; ES1-T301 #2; ES1-T436 #4 | TE-18 AC7 | TC-395-45, TC-299-32 | R4.9, R8, R12 | TE-18-R2-FE1 (ES1-T389), TE-18-R2-BE2 (ES1-T392); QA ES1-T393 | Discount code rỗng và `WELCOME15`; email đã đăng ký | QA viết; TC-299-32 sửa (Should) |
| ES1-T308 #1, ES1-T422 #1; audit C5 | TE-18 AC10 | TC-395-46 | R8, R14 | ES1-T389, TE-18-R2-FE2 (ES1-T390); QA ES1-T393 | theme sạch; store dev cấu hình 3 popup | QA viết (Should) |
| marketing-popups §4 | TE-18 AC11 | TC-395-47 | R12 | ES1-T390, ES1-T392; QA ES1-T393 | sản phẩm big offer có giá gạch | QA viết (Should) |
| search.md §2, list-collections §1, quiz-result §6; ES1-T436 #1 | TE-22 AC9 | TC-395-48 | R11, R12 | TE-22-R2-FE1 (ES1-T326), ES1-T367, ES1-T128, ES1-T387; QA ES1-T330 | — | sửa; search, `?view=quiz` thiếu task |
| M5 ES1-T306 | TE-1 AC2 | (TE-22 TC) | R4.8 | TE-22-R2-FE2 (ES1-T327) | menu 3 cấp ES1-T298 | không TC mới, trỏ TE-22 AC4 |

Tổng: 49 AC mới hoặc sửa (TE-1 4, TE-5 10, TE-6 8, TE-8 11, TE-10 8, TE-11 4, TE-18 3, TE-22 1) + 1 dòng trỏ (TE-1 AC2). 49/49 có TC (48 TC-395 mới + TC-H15 sửa); 49/49 có mã R. Thiếu task: TE-10 AC5 (writer), breadcrumb search (TE-8 AC5), breadcrumb `?view=quiz` (TE-11 AC10).
