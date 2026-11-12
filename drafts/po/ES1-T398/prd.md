KHÔNG CHẮC: (1) ticket ghi "TE-14..TE-21" theo đánh số đề xuất ES1-T305; PRD này dùng đánh số đã thống nhất ở task-split ES1-T307 lượt 2 (TE-19 upsell, TE-20 blog và bài viết, TE-21 trang phụ, TE-22 điều hướng mở rộng), nên thêm TE-14..TE-22; (2) TE-19..TE-22 chưa có AC (SRS 0.5, REQ2-BA*), point lấy từ task-split ES1-T307; (3) FE Must Sprint 2–4 = 200 point (gồm ES1-T401..T409) > sức chứa ~147; CTO chốt nới giờ FE (ES1-T311), số giờ ghi ở charter 0.2 ES1-T399, PRD chỉ ghi thứ tự cắt; (4) file thay `docs/prd.md` (PO ghi drafts/, Orchestrator chép).

# PRD — theme-efitco · bản 0.2 · PO · 11/11/2026 (bản 0.1: 22/10/2026)

Nguồn 0.2: REQ-0002 (BGĐ duyệt thiết kế 11/11), đề xuất PO ES1-T305 (bảng ưu tiên), quyết định CTO ES1-T308, T309, T310, T311, T301; kế hoạch DEV `drafts/techlead/ES1-T307/task-split.md`; SRS 0.4 (`docs/srs.md`).

## Vấn đề
Merchant nhỏ muốn tự dựng và sửa cửa hàng bằng Sidekick trong Canvas; theme bán sẵn chưa vào được Canvas (chỉ theme Shopify và custom theme). Cần một theme xây đúng kiến trúc Skeleton để Sidekick sửa tốt, đẹp theo thiết kế Efitco T10 đã duyệt, nhanh và accessible.

## Người dùng
- Merchant: sửa theme trong Canvas (text trực tiếp, settings, nhờ Sidekick); không đọc code.
- Khách: mua trên mobile; cần tìm, lọc, xem biến thể, thêm giỏ, checkout không reload.

## Bản phát hành
R1 = lên Canvas store thật tuần 11 (28/12/2026), đạt chuẩn Theme Store nội bộ, KHÔNG nộp Theme Store (ES1-T308 #2). Sprint 2 (16–27/11), Sprint 3 (30/11–11/12), Sprint 4 (14–25/12). Trễ thì cắt Should trước, giữ mốc (ES1-T308 #4).

## Story (TE-1 → TE-22)
- TE-1 khung theme, header, footer, announcement, localization, token
- TE-2 slideshow (hero) và rich text
- TE-3 featured collection, product card, quickview
- TE-4 trang sản phẩm (2048 biến thể, sticky, countdown, B2B, selling plan, pickup)
- TE-5 cart drawer và cart page
- TE-6 collection: lọc, sắp xếp, phân trang chung, list-collections
- TE-7 testimonials, FAQ, image with text, multicolumn
- TE-8 predictive search và trang kết quả
- TE-9 preset, trang phụ, demo — 0.2: phạm vi trang phụ chuyển sang TE-20, TE-21; nội dung mẫu theo ES1-T308 #1 (task-split không còn task TE-9)
- TE-10 chuẩn chất lượng, lớp/vùng đáy, sẵn sàng Canvas
- TE-11 product finder quiz (popup kết quả, trang `?view=quiz`)
- TE-12 bundle builder và shop the look
- TE-13 featured product có countdown, video demo carousel
- TE-14 sẵn sàng cho Sidekick, Canvas, agent (AGENTS.md, DESIGN.md, logical properties) — 0.2 thêm
- TE-15 collection list và shop by level — 0.2 thêm
- TE-16 blog posts (trang chủ) — 0.2 thêm
- TE-17 trang chủ giống Figma, dữ liệu store dev, cổng đo — 0.2 thêm
- TE-18 popup marketing: newsletter, before you leave, big offer — 0.2 thêm
- TE-19 upsell giỏ hàng (cart.md §3.8, sổ 10/11 G2) — 0.2 thêm, chờ AC SRS 0.5
- TE-20 blog và bài viết, gồm mở rộng (blog.md B1–B3, article.md A1–A3, thông báo bình luận) — 0.2 thêm, chờ AC SRS 0.5
- TE-21 trang phụ: page, contact, 404, password, gift card — 0.2 thêm (tách từ TE-9), chờ AC SRS 0.5
- TE-22 điều hướng mở rộng: menu 3 cấp, mega menu, breadcrumb — 0.2 thêm, chờ AC SRS 0.5
- ES1-T304 tuân thủ Theme Store (ES1-T401..T412) — không phải story, xếp cùng Must vì có mục CHẶN

## MoSCoW R1 (thứ tự theo bảng ưu tiên ES1-T305, cập nhật theo ES1-T308, T310, T311)
Mục tiêu charter: M1 = Canvas (charter mục tiêu 1), M2 = chất lượng NFR-1 + bug (charter mục tiêu 2). Giá trị M/C/R = merchant / Canvas / giảm rủi ro (1–5). Point = FE/BE/QA task R2 mới theo task-split ES1-T307 (ticket viết lại ghi riêng).

| Thứ tự | Story | M/C/R | Point FE/BE/QA | Nhóm | Lý do 1 dòng | Mục tiêu |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | TE-17 trang chủ giống Figma | 5/4/5 | 13/0/13 | Must | mục tiêu số 1 CTO 06/11; cổng đo cuối | M1, M2 |
| 2 | TE-13 featured/video | 4/3/5 | 4/3/0 | Must | trang chủ; countdown chung theo metafield | M2 |
| 3 | TE-7 nội dung | 3/4/3 | 5/3/0 | Must | trang chủ, rẻ | M1 |
| 4 | TE-2 slideshow | 4/4/4 | 5/3/0 | Must | trang chủ, LCP | M2 |
| 5 | TE-12 bundle/STL | 4/3/5 | 4/3/0 | Must | trang chủ; bậc giảm mặc định 0 (R8) | M2 |
| 6 | ES1-T304 tuân thủ | 4/4/5 | 35/5/5 (+DevOps 2) | Must | mục CHẶN R4/R7/R8 xong trước nghiệm thu | M2 |
| 7 | TE-21 trang phụ | 4/3/5 | 8/0/3 | Must | TS R7 404/password/gift card; CTO giữ, cuối Sprint 4 | M2 |
| 8 | TE-14 Sidekick/Canvas | 2/5/3 | 0/0/0 | Must | điều kiện Canvas; không có task R2, kiểm ở TE-10 | M1 |
| 9 | TE-3 card + quickview | 5/4/4 | 8/8/4 | Must | trang chủ; nền cho TE-11 | M1, M2 |
| 10 | TE-4 PDP (trừ B2B quantity rule + volume) | 5/3/5 | 31/22/9 | Must | TS R4.10, R4.14, R7.2; NFR-7 | M2 |
| 11 | TE-5 cart (không upsell) | 5/3/4 | 10/5/0 (+BE T98 3) | Must | TS R4.1, R4.2, R7.5 | M2 |
| 12 | TE-6 collection + phân trang chung | 4/3/4 | 15/0/0 (+BE T110 8) | Must | TS R4.3, R7.3, R7.4; phân trang dùng ở 5 trang | M2 |
| 13 | TE-1 khung | 5/4/4 | 17/6/4 | Must | TS R4.7, R4.8, R4.18, R4.19 | M1, M2 |
| 14 | TE-22 menu 3 cấp + breadcrumb | 3/3/3 | 7/3/3 | Must | audit NÊN, breadcrumb SEO; task-split xếp Sprint 2 | M2 |
| 15 | TE-11 quiz | 3/3/3 | 5/5/0 | Must | trang chủ hàng 6, CTO 27/10 giữ; popup kết quả là mục cắt sau Should (ES1-T311) | M1 |
| 16 | TE-8 search (trừ recent searches) | 4/3/4 | 4/6/0 (+FE T128 5, T129 3; BE T130 5) | Must | TS R4.13, R7.8 | M2 |
| 17 | TE-10 chất lượng + đo NFR-1 | 3/5/5 | 11/9/4 | Must | cổng G5; lớp/consent/Inbox | M1, M2 |
| 18 | TE-20 blog và bài viết | 2/2/2 | 10/0/3 | Must | CTO giữ trang phụ (ES1-T310 #4, T311); phần mở rộng là mục cắt sau Should | M2 |
| 19 | TE-15, TE-16 | — | 0/0/0 | Must | code xong, còn QA ES1-T187, T192 | M1 |
| 20 | TE-18 popup marketing | 4/2/2 | 9/10/4 | Should, cắt 1 | không thuộc R bắt buộc (newsletter footer đủ R4.9); JS tăng rủi ro ngân sách | M2 |
| 21 | TE-22 mega ảnh/sản phẩm (TE-22-R2-FE3) | 3/3/3 | 3/0/0 | Should, cắt 2 | ngoài R bắt buộc | M2 |
| 22 | TE-4 B2B quantity rule + volume (TE-4-R2-FE7, BE7) | 3/2/2 | 3/3/0 | Should, cắt 3 | cần Plus/B2B, có thể chỉ kiểm mockup | M2 |
| 23 | TE-8 recent searches (TE-8-R2-BE3) | 3/2/2 | 0/3/0 | Should, cắt 4 | ngoài R bắt buộc | M2 |
| 24 | TE-19 upsell giỏ hàng | 4/2/2 | 3/3/3 | Should, cắt 5 | sổ 10/11 G2; ngoài R bắt buộc | M2 |

Đổi so với bảng ES1-T305: TE-9 thay bằng TE-21 (cùng giá trị); TE-20 lên Must (CTO giữ trang phụ, trước là Could); menu 3 cấp + breadcrumb lên Must theo task-split, chỉ mega ảnh/sản phẩm còn Should; Should xếp theo thứ tự cắt CTO 11/11.

Cắt khi vượt sức chứa (ES1-T308 #4, T310 #4, T311): Should theo thứ tự 20 → 24; vẫn vượt và không nới được giờ FE thì cắt tiếp (1) popup kết quả quiz TE-11-R2-FE1/BE1, (2) phần mở rộng TE-20, (3) TE-6-R2-FE4 list-collections giữ bản hiện có. Không cắt task CHẶN của ES1-T304. Trang phụ TE-20, TE-21 giữ.

Could: không có cho R1.

Won't R1:
- App block, gồm vùng app block review trên PDP; R1 chỉ hiện rating từ metafield (ES1-T308 #3).
- Wishlist.
- Multi-market UI tuỳ chỉnh (localization chỉ theo TE-1 AC5, AC9, AC10).
- Nộp Theme Store; ảnh logo bên thứ ba và tên theme listing để sau R1 (ES1-T308 #2).
- Nội dung Figma trong mặc định theme (ES1-T308 #1): theme mới cài để trống, nội dung Figma chỉ cấu hình trên store dev.

## Chỉ số thành công
- NFR-1 (chỉ tiêu nghiệm thu, đo trên demo store dev): Accessibility 100 và Best Practices 100 ở mọi trang đo; SEO 100 ở trang chủ, collection, sản phẩm, blog, bài viết, page; Performance desktop ≥ 98, mobile ≥ 90. Best Practices ghi tách phần theme và phần nền tảng Shopify.
- Ngưỡng CI chặn merge (ES1-T301, CTO 11/11): performance desktop ≥ 0.96, mobile ≥ 0.9; accessibility 1.0; Best Practices warn 0.78 (lên error sau ticket BE thứ tự nạp module); SEO warn 1.
- Checklist Canvas 10/10 khi lên Canvas 28/12; 10 yêu cầu Sidekick mẫu theme check 0 lỗi; thời gian Sidekick mỗi yêu cầu mẫu ≤ 3 phút.
- Bug P1/P2 = 0 khi lên Canvas.
- Trang chủ giống Figma theo TE-17 trên store dev đã cấu hình (sổ chênh lệch 0 mục mở).
- Tài liệu merchant đủ mọi block trong theme (số block theo charter 0.2 ES1-T399).

## Ràng buộc
- Skeleton block-first (AGENTS.md); không sections, không JSON template, không section groups (CTO 11/11); code tự viết, không dựa Dawn/Horizon.
- ADR 0006 ngân sách JS; ADR 0007–0010 Chấp nhận, áp mọi task REQ-0002.
- Theme mới cài để trống: setting chữ, claim, mã giảm mặc định rỗng, bậc giảm 0, không handle `figma-*` (ES1-T308 #1, T309 #2, #3).
- Mọi nội dung `docs/ui-spec` trên develop 11/11, kể cả dòng ĐỀ XUẤT, là phạm vi Dev (ES1-T309 #1).
- Canvas early access; không phụ thuộc app; token Figma trong giới hạn Shopify (font_picker, ≥ 4 màu).
- Check chặn merge: theme-check, preview, e2e, lighthouse.

## Câu hỏi mở
Không còn câu mở ở PRD. 3 câu bản 0.1 đã chốt (SRS §3, CTO 22/10 và 27/10): tên theme Efitco; cart mặc định drawer, setting `cart_type` đổi sang page; collection mobile mặc định 2 cột, setting chọn 1 hoặc 2.
