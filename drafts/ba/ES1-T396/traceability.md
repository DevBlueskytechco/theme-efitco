KHÔNG CHẮC: TC-396-* là mã đề xuất, QA viết bước chi tiết ở ticket QA của từng story; mã task R2 lấy từ tiêu đề ticket (task-split ES1-T307 nằm ở nhánh khác, không đọc được); dữ liệu store dev chờ ES1-T298; 4 điểm chờ CTO ở ES1-T422 (AC theo mặc định). Bảng gộp 0.5 có cột ui-spec, mốc là việc của REQ2-BA4 (ES1-T397).

# ES1-T396 — Ma trận truy vết SRS 0.5, story TE-19..TE-22 (yêu cầu → AC → TC → mã R → task R2 → dữ liệu)

Trạng thái: "QA viết" = TC chưa có; "sửa" = TC cũ phải đổi kỳ vọng; "sau R1" = AC chưa có task R2.

| Yêu cầu (nguồn) | Story / AC | TC | Mã R | Task R2 | Dữ liệu store dev | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| G2 upsell complementary ≤ 4, cart.md §3.8 | TE-19 AC1 | TC-396-01 | R4.11, R7.5 | TE-19-R2-FE1 (ES1-T371), TE-19-R2-BE1 (ES1-T372) | giỏ chứa sản phẩm có complementary (Search & Discovery) | QA viết |
| cart.md §3.8 ẩn khi 0/lỗi/rỗng/tắt | TE-19 AC2 | TC-396-02 | R4.11, R3.1 | ES1-T371, ES1-T372 | sản phẩm không có complementary; setting tắt | QA viết |
| cart.md §2 bố cục theo mốc, HD3 | TE-19 AC3 | TC-396-03 | R3.1, R12 | ES1-T371 | như TC-396-01; 360, 768, 1280, 1920 | QA viết |
| cart.md §3.8 thêm giỏ, 422, không JS | TE-19 AC4 | TC-396-04 | R7.5, R12 | ES1-T371, ES1-T372 | sản phẩm 1 biến thể còn hàng; 1 sản phẩm tồn 0 để gây 422 | QA viết |
| cart.md §3.8 nhiều biến thể | TE-19 AC5 | TC-396-05 | R7.5 | ES1-T371 | sản phẩm nhiều biến thể có trong complementary | QA viết |
| cart.md §8 skeleton, lazy, CLS | TE-19 AC6 | TC-396-06 | R17, R6.1 | ES1-T371, ES1-T372 | như TC-396-01 | QA viết |
| cart.md §6 a11y | TE-19 AC7 | TC-396-07 | R12 | ES1-T371 | như TC-396-01 | QA viết |
| ES1-T308 #1, ES1-T422 #1 | TE-19 AC8 | TC-396-08 | R8, R14 | ES1-T371; fixture TE-17-R2-QA0 (ES1-T331) | theme sạch; store dev cấu hình chữ | QA viết |
| mini-cart-quickview.md §1, §2 upsell drawer | TE-19 AC9 | TC-396-09 | R4.11, R12 | chưa có (ES1-T422 #3) | như TC-396-01 | sau R1 |
| blog.md §1 bố cục trang 1 | TE-20 AC1 | TC-396-10 | R7.7 | TE-20-R2-FE1 (ES1-T381) | blog ≥ 10 bài, có excerpt (ES1-T298 #4) | QA viết |
| sổ 11/11 (3), (4) card có excerpt, không cắt tiêu đề | TE-20 AC2 | TC-396-11 | R7.7, R8 | ES1-T381, TS-FE5 (ES1-T403), TS-FE7 (ES1-T407) | bài tiêu đề > 3 dòng, bài không ảnh, không tag, content rỗng | QA viết |
| blog.md §1.4, §4 lọc tag | TE-20 AC3 | TC-396-12 | R7.7, R12, NFR-4 | ES1-T381 | ≥ 3 tag, 1 tag chỉ 1 bài | QA viết |
| blog.md §4 rỗng | TE-20 AC4 | TC-396-13 | R7.7 | ES1-T381 | blog 0 bài (blog phụ); URL tag không còn bài | QA viết |
| TE-6 AC6, blog.md §5 phân trang | TE-20 AC5 | TC-396-14, TC-299-17 | R7.7 | ES1-T381; TE-6-R2-FE1 (ES1-T364) | ≥ 10 bài | QA viết; TC-299-17 giữ |
| blog.md §7 Lighthouse, LCP, title | TE-20 AC6 | TC-396-15 | R6.1, R6.2, R11, R17 | ES1-T381 | `/blogs/{blog demo}`, trang tag, trang 2 | QA viết |
| blog.md §6 a11y | TE-20 AC7 | TC-396-16 | R12 | ES1-T381 | như TC-396-10 | QA viết |
| blog.md §10 #2 trang chủ không đổi | TE-20 AC8 | TC-H26, TC-H27 | R7.7 | ES1-T381 | `/` block blog posts | giữ |
| A1 ảnh bìa không đè | TE-20 AC9 | TC-396-17 | R17, R6.1 | TE-20-R2-FE2 (ES1-T382) | bài có ảnh, bài không ảnh | QA viết |
| article.md §1.3, sổ 11/11 (5) | TE-20 AC10 | TC-396-18 | R7.7, R8 | ES1-T382, ES1-T403 | bài có author, tag, content có bảng | QA viết |
| PG1, article.md §1.4 bình luận | TE-20 AC11 | TC-396-19, TC-299-18 | R7.7 | ES1-T382; ES1-T364 | bài > 10 bình luận; blog tắt bình luận | QA viết; TC-299-18 giữ |
| audit B #24, article.md §5 form | TE-20 AC12 | TC-396-20 | R7.7, R12, NFR-4 | ES1-T382, ES1-T407 | blog có duyệt và blog không duyệt | QA viết |
| sổ 09/11 hàng ngang, HD3 | TE-20 AC13 | TC-396-21 | R12 | ES1-T382 | bài cùng tag ≥ 4; blog 1 bài | QA viết |
| article.md §7 SEO, JSON-LD | TE-20 AC14 | TC-396-22 | R11, R6.1, R6.2 | ES1-T382; TE-22-R2-FE1 (ES1-T326) | 1 bài | QA viết |
| ES1-T308 #1 | TE-20 AC15 | TC-396-23 | R8, R14 | ES1-T381, ES1-T382; ES1-T331 | theme sạch; store dev cấu hình | QA viết |
| page.md §2, §4 page mặc định | TE-21 AC1 | TC-396-24 | R7.6 | TE-21-R2-FE1 (ES1-T383) | page Our Story; page rỗng | QA viết |
| sổ 11/11 (5) RTE | TE-21 AC2 | TC-396-25 | R8, R12 | ES1-T383, ES1-T403 | page có bảng rộng, ảnh, link | QA viết |
| PG1, audit B #6 contact | TE-21 AC3 | TC-396-26 | R7.6 | ES1-T383, ES1-T407 | page Contact Us gán `page.contact`; 3 policy | QA viết |
| page.md §6 S2 validation | TE-21 AC4 | TC-396-27 | R12, NFR-4 | ES1-T383 | như TC-396-26 | QA viết |
| page.md §6 S3–S6 gửi | TE-21 AC5 | TC-396-28 | R7.6 | ES1-T383 | như TC-396-26 (KHÔNG CHẮC: hCaptcha store dev) | QA viết |
| page.md §7, §9 Lighthouse, a11y | TE-21 AC6 | TC-396-29 | R6.1, R6.2, R11, R12 | ES1-T383 | như TC-396-24, 26 | QA viết |
| E1, audit B #32 404 | TE-21 AC7 | TC-396-30 | R7.9, R12 | TE-21-R2-FE2 (ES1-T384), TS-FE8 (ES1-T408) | URL `/pages/khong-co` | QA viết |
| 404.md §3, §5 danh mục, sản phẩm | TE-21 AC8 | TC-396-31 | R7.9, R17 | ES1-T384 | menu 5 `figma-cat-*`; collection bestseller | QA viết |
| PW2 password | TE-21 AC9 | TC-396-32 | R7.9 | ES1-T384, ES1-T408 | storefront bật mật khẩu (store dev có sẵn; KHÔNG CHẮC) | QA viết |
| PW1 newsletter + details | TE-21 AC10 | TC-396-33 | R7.9, R4.9, NFR-4 | ES1-T384 | như TC-396-32 | QA viết |
| password.md §5 sai mật khẩu | TE-21 AC11 | TC-396-34 | R7.9, R12 | ES1-T384 | như TC-396-32 | QA viết |
| password.md §4, §8 ảnh, LCP | TE-21 AC12 | TC-396-35 | R17, R6.1 | ES1-T384 | ảnh setting; không ảnh | QA viết |
| GC1, R7.9 gift card | TE-21 AC13 | TC-396-36 | R4.4, R7.9 | ES1-T384, ES1-T408, TS-BE1 (ES1-T410) | gift card đã phát hành, có pass_url, đã dùng một phần | QA viết |
| gift-card.md §5 hết hạn, bị tắt | TE-21 AC14 | TC-396-37 | R7.9, R12 | ES1-T384 | 1 gift card hết hạn, 1 bị tắt | QA viết |
| GC1 copy, print, không JS | TE-21 AC15 | TC-396-38 | R7.9, NFR-4 | ES1-T410 | như TC-396-36 | QA viết |
| sổ 10/11 phạm vi SEO | TE-21 AC16 | TC-396-39 | R6.1, R6.2 | ES1-T384 | 404, password, gift card | QA viết |
| ES1-T308 #1 | TE-21 AC17 | TC-396-40 | R8, R14 | ES1-T383, ES1-T384; ES1-T331 | theme sạch; store dev cấu hình | QA viết |
| N1–N3, TE-1 AC2 từ 80rem | TE-22 AC1 | TC-396-41 (thay phần desktop của TC TE-1 AC2) | R4.8, R12, NFR-4 | TE-22-R2-FE2 (ES1-T327), TE-22-R2-BE1 (ES1-T329) | main-menu 3 cấp (ES1-T298 #4) | QA viết; TC TE-1 AC2 sửa |
| N3 kiểu panel theo dữ liệu | TE-22 AC2 | TC-396-42 | R4.8 | ES1-T327 | Shop (A), Collection (B), Help (C) | QA viết |
| sổ 09/11 SEO nhãn View all | TE-22 AC3 | TC-396-43 | R11, R12 | ES1-T327 | như TC-396-42 | QA viết |
| N1 cấp 3 trong drawer | TE-22 AC4 | TC-396-44 | R4.8, NFR-4 | ES1-T327; TE-1-R2-FE3 (ES1-T320) | như TC-396-42 | QA viết |
| N2 ảnh, sản phẩm nổi bật | TE-22 AC5 | TC-396-45 | R4.8 | TE-22-R2-FE3 (ES1-T328, Should) | ảnh 5 collection; 1 sản phẩm sale, 1 hết hàng | QA viết (Should) |
| sổ 09/11 ảnh menu tải khi mở | TE-22 AC6 | TC-396-46 | R17, R6.1 | ES1-T327, ES1-T328 | như TC-396-42 | QA viết |
| navigation.md §8 a11y | TE-22 AC7 | TC-396-47 | R12 | ES1-T327, ES1-T329 | như TC-396-42 | QA viết |
| navigation.md §7 menu trống | TE-22 AC8 | TC-396-48 | R14 | ES1-T327 | theme sạch, menu không gán | QA viết |
| foundation §5 breadcrumb | TE-22 AC9 | TC-396-49 | R12, R7.3, R7.7 | TE-22-R2-FE1 (ES1-T326) | collection, sản phẩm trong/ngoài collection, blog, tag, bài, page | QA viết |
| foundation §5 cắt mục cuối (ES1-T422 #2) | TE-22 AC10 | TC-396-50 | R12 | ES1-T326 | sản phẩm tên > 48 ký tự | QA viết, chờ ES1-T422 #2 |
| foundation §3.3 banner | TE-22 AC11 | TC-396-51 | R12, R6.1 | ES1-T326 | collection có ảnh trắng | QA viết |
| R11 BreadcrumbList | TE-22 AC12 | TC-396-52 | R11 | ES1-T326 | như TC-396-49 | QA viết |
| foundation §5 tiêu đề trang | TE-22 AC13 | TC-396-53 | R12 | ES1-T326 | như TC-396-49 | QA viết |
| ES1-T308 #1 | TE-22 AC14 | TC-396-54 | R14, R8 | ES1-T327, ES1-T328; ES1-T331 | theme sạch; store dev menu 3 cấp | QA viết |

Kiểm đủ: TE-19 9/9 AC, TE-20 15/15, TE-21 17/17, TE-22 14/14 có TC; 55 AC → 54 TC mới + TC-H26, TC-H27 (giữ), TC-299-17, TC-299-18 (giữ). Mỗi AC có ≥ 1 mã R hoặc NFR. AC không có task R2: TE-19 AC9 (ES1-T422 #3).
