KHÔNG CHẮC: (1) mặc định nội dung mẫu (bậc giảm 10/15%, claim "Trusted by 10,000+ athletes", "Get 15% Off", handle figma-* trong index.liquid) đang mâu thuẫn giữa SRS 0.4 và Theme Store §8 + sổ 11/11 (7); (2) REQ-0002 ghi "nộp Theme Store" trong khi CLAUDE.md và charter loại trừ; (3) review PDP "app block" (P1) trái PRD Won't; (4) năng lực sprint 2–4 so với ~166 point còn lại chưa đo. Hỏi CTO ở ES1-T308, mặc định ghi trong ticket đó; kế hoạch dưới đây chạy theo mặc định. Point lấy từ ước lượng thô của Tech Lead (subagent, chưa qua chia task ES1-T307).

# ES1-T305 — REQ-0002 phân tích tác động (PO)

Nguồn: ticket ES1-T305; docs/srs.md 0.4; docs/prd.md 0.1; docs/charter.md 0.1; docs/design/decisions.md (đến 11/11); docs/design/shopify-audit-1111/; docs/ui-spec/*.md; docs/adr/0006; danh sách ticket Open 11/11; đánh giá subagent techlead, ba, qa (11/11). Quyết định CR: `drafts/po/ES1-T305/cr.md`.

## Tóm tắt

Yêu cầu: BGĐ duyệt thiết kế 11/11/2026 (vòng 3 + audit fix ES1-T284→T294 + PR #173 tuân thủ Theme Store), chuyển sang giai đoạn DEV hoàn thiện theme. Mọi màn đã duyệt phải có ticket FE/BE/QA sẵn sàng chạy, CTO duyệt rồi triển khai.

Áp dụng từ: 11/11/2026 (sổ 10/11 BGĐ "duyệt xong mới sang Dev" đã thoả). Sprint 2 bắt đầu T2 16/11/2026 là sprint DEV đầu tiên theo kế hoạch mới; phần còn lại sprint 1 (12–13/11) dùng cho chia task, sửa SRS/PRD, đóng ticket lỗi thời.

Mâu thuẫn:
- AGENTS.md / ADR 0004: không mâu thuẫn. Sổ 11/11 giữ Skeleton block-first; mục 5 Theme Store (JSON template, section groups) không áp dụng.
- ADR 0006: không mâu thuẫn về nguyên tắc, nhưng rủi ro vượt trần. Tech Lead cộng tay PDP ~49,5 KB thô > 40 960 B; motion.js 9 161 B > 8 192 B/file; ADR đo transferSize còn DoD ticket dùng `wc -c` → cần chốt cách đo (đề xuất ADR 0007, xem Kiến thức techlead).
- SRS 0.4 vs sổ 11/11 (7) + audit 11/11 (Shopify thắng sổ cũ): TE-12 AC1/AC-H18 bậc giảm mặc định 10/15%; TE-17 AC-H5 claim mặc định; AC-H28 "Get 15% Off"; TE-9 AC4 + AC-H1..H5 dựa handle demo trong index.liquid. Hỏi ES1-T308 #1.
- CLAUDE.md "Không nộp Theme Store" + charter "Ngoài: Theme Store listing" vs REQ-0002 "bản phát hành (nộp Theme Store)". Hỏi ES1-T308 #2. Kế hoạch dưới coi R1 = Canvas store thật tuần 11, chuẩn Theme Store nội bộ, không nộp.
- Sổ 10/11 P1 (review PDP qua app block) vs PRD Won't "app blocks", charter Ngoài "app block". Hỏi ES1-T308 #3.
- SRS 0.4 vs sổ: SRS còn thiếu AC cho quyết định đã chốt (liệt kê ở mục Ảnh hưởng). Không đổi kiến trúc.
- PRD 0.1 và charter 0.1 lỗi thời so với SRS 0.4 (thiếu TE-14..TE-18; countdown ở Could; chỉ tiêu 96/90/98; "8 trang", "16 block"). PO sửa, xem Ticket cần tạo.
- NFR-1 Best Practices 100: QA ES1-T277 đo nếu bỏ phần nền tảng thì theme tối đa 0.78 → chỉ tiêu không đạt được như đang viết; CTO chốt cách tính ở ES1-T301 #1 (đề xuất: BP 100 tính trên mục do theme gây ra).

## Ảnh hưởng

Story (đối chiếu thiết kế đã duyệt với PRD/SRS):

| Story | Thay đổi phạm vi so với PRD 0.1 | Point còn lại FE/BE (thô) | Ghi chú |
| --- | --- | --- | --- |
| TE-1 khung | tăng: drawer cấp 2 + Back, announcement AN1–AN2, localization gộp LC1–LC3, Follow on Shop, header tối mọi trang | 9/5 | Follow on Shop, favicon, menu 3 cấp + mega menu (N2, N3) chưa có AC |
| TE-2 slideshow | tăng nhẹ: điều khiển theo mốc AC7, chữ hiện dần AC10 | 3/2 | |
| TE-3 card + quickview | tăng lớn: swatch thành chỉ báo, Quick View dialog/sheet, bộ chọn chung | 6/6 | rich media quickview (T8) chưa có AC |
| TE-4 PDP | tăng lớn: 2048 biến thể (dựng lại bộ chọn, bỏ variant-json), sticky mọi mốc, countdown, B2B AC18, selling plan AC19, pickup AC20 | 17/18 | review PDP P1 chờ ES1-T308 #3 |
| TE-5 cart | tăng: ghi chú drawer, quantity rule, selling plan, panel tối | 7/5 | upsell G2 chưa có AC (ES1-T247) |
| TE-6 collection | tăng: phân trang chung AC6–AC7 (5 loại trang), C1–C3 | 7/3 | |
| TE-7 nội dung | tăng nhẹ: testimonials hàng ngang HD3 | 2/1 | |
| TE-8 search | tăng: S1–S3, SR1–SR3, "Showing x–y" | 7/6 | Popular searches FD2 chưa có AC |
| TE-9 trang phụ | tăng: blog/article/page/404/password/gift card theo spec | 3/0 | blog B1–B3, article A1–A3, contact aside chưa có AC; R7 không cắt tên, .rte chung chưa có AC |
| TE-10 chất lượng | tăng: NFR-1 mới, lớp/vùng đáy AC6–AC8 (LY1–LY3) | 3/4 | |
| TE-11 quiz | tăng: kết quả popup, QZ1–QZ3, trang `?view=quiz` | 7/8 | |
| TE-12 bundle/STL | đổi: bỏ ghi chú giảm, thanh bundle 360; mặc định bậc giảm chờ ES1-T308 #1 | 3/2 | |
| TE-13 featured/video | đổi: countdown chung theo metafield, rich media | 2/1 | |
| TE-14 Sidekick/Canvas | không đổi (chưa có trong PRD) | 3/0 | |
| TE-15, TE-16 | không đổi (chưa có trong PRD) | 0/0 | đã xong code, còn QA |
| TE-17 trang chủ giống Figma | tăng: 1280, 768, 360 (H1–H6, HD1–HD3); điều kiện "theme mới cài" chờ ES1-T308 #1 | 7/0 | |
| TE-18 popup marketing | mới so với PRD | 8/11 | chưa có code |
| ES1-T304 tuân thủ Theme Store | mới (Tech Lead tách) | chưa ước | không tạo trùng |

Story thiếu (ticket hỏi "quiz-result, localization, announcement bar, pagination chung, layers/consent, tính năng Shopify trên PDP"): KHÔNG thiếu story — SRS 0.4 đã đưa vào AC: quiz-result → TE-11 AC3, AC5–AC8; localization → TE-1 AC5, AC9, AC10; announcement → TE-1 AC4; phân trang → TE-6 AC6–AC7; layers/consent → TE-10 AC6–AC8, TE-18 AC2; tính năng Shopify PDP → TE-4 AC18–AC20, TE-5 AC9–AC10. Thiếu thật (đã chốt thiết kế, chưa có AC): upsell cart (G2), blog/article mở rộng (B1–B3, A1–A3, thông báo bình luận), điều hướng mở rộng (menu 3 cấp + mega N2/N3, breadcrumb + BreadcrumbList, Popular searches FD2), Follow on Shop (§29), favicon, rich media featured product/quickview (T8), không cắt tên (T5), .rte chung (T7), contact aside FAQ. Đề xuất: 3 story mới TE-19 upsell cart, TE-20 blog/article mở rộng, TE-21 điều hướng mở rộng; phần còn lại thêm AC vào story có sẵn (TE-1, TE-3, TE-9, TE-10, TE-13).

Ưu tiên lại (skill backlog-prioritize; Điểm = (merchant + Canvas + giảm rủi ro) / point còn lại; mục tiêu charter: M1 Canvas, M2 chất lượng Lighthouse/bug; "TS" = R bắt buộc trong requirements-map):

| Thứ tự | Story | Giá trị M/C/R | Point | Điểm | Nhóm | Lý do 1 dòng | Mục tiêu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TE-17 trang chủ giống Figma | 5/4/5 | 7 | 2.0 | Must | mục tiêu số 1 CTO 06/11; đo cổng cuối | M1, M2 |
| 2 | TE-13 featured/video | 4/3/5 | 3 | 4.0 | Must | trang chủ; countdown giả là CHẶN §8 | M2 |
| 3 | TE-7 nội dung | 3/4/3 | 3 | 3.3 | Must | trang chủ, rẻ | M1 |
| 4 | TE-2 slideshow | 4/4/4 | 5 | 2.4 | Must | trang chủ, LCP | M2 |
| 5 | TE-12 bundle/STL | 4/3/5 | 5 | 2.4 | Must | trang chủ; R8 giảm giá | M2 |
| 6 | ES1-T304 tuân thủ (CHẶN) | 4/4/5 | ? | — | Must | CHẶN R4/R7/R8 phải xong trước nghiệm thu | M2 |
| 7 | TE-9 trang phụ | 4/3/5 | 3 | 4.0 | Must | TS R7 404/password/gift card | M2 |
| 8 | TE-14 Sidekick/Canvas | 2/5/3 | 3 | 3.3 | Must | điều kiện Canvas C1–C5 | M1 |
| 9 | TE-3 card + quickview | 5/4/4 | 12 | 1.1 | Must | trang chủ hàng 5; nền cho TE-11 AC7 | M1, M2 |
| 10 | TE-4 PDP core AC1–AC17, AC19, AC20 | 5/3/5 | ~31 | 0.4 | Must | TS R4.10, R4.14, R7.2; NFR-7 | M2 |
| 11 | TE-5 cart (không upsell) | 5/3/4 | 12 | 1.0 | Must | TS R4.1, R4.2, R7.5 | M2 |
| 12 | TE-6 collection + phân trang chung | 4/3/4 | 10 | 1.1 | Must | TS R4.3, R7.3, R7.4; snippet dùng ở 5 trang | M2 |
| 13 | TE-1 khung | 5/4/4 | 14 | 0.9 | Must | TS R4.7, R4.8, R4.18, R4.19 | M1, M2 |
| 14 | TE-11 quiz popup | 3/3/3 | 15 | 0.6 | Must | trang chủ hàng 6, CTO 27/10 giữ; phụ thuộc TE-3 | M1 |
| 15 | TE-8 search | 4/3/4 | 13 | 0.9 | Must | TS R4.13, R7.8 | M2 |
| 16 | TE-10 chất lượng AC6–AC8 + đo NFR-1 | 3/5/5 | 7 | 1.9 | Must | cổng G5; Inbox/consent | M1, M2 |
| 17 | TE-18 popup marketing | 4/2/2 | 19 | 0.4 | Should | sổ 10/11 bật mặc định, nhưng không thuộc R bắt buộc (newsletter footer đủ R4.9); JS tăng rủi ro ngân sách | M2 |
| 18 | TE-4 AC18 B2B quantity rule/volume | 3/2/2 | ~4 | 1.8 | Should | cần Plus/B2B, có thể chỉ kiểm mockup | M2 |
| 19 | TE-21 điều hướng mở rộng (đề xuất) | 3/3/3 | chờ TL | — | Should | menu 3 cấp (audit NÊN), breadcrumb SEO | M2 |
| 20 | TE-19 upsell cart (đề xuất) | 4/2/2 | chờ TL | — | Should | G2 10/11; không thuộc R | M2 |
| 21 | TE-20 blog/article mở rộng (đề xuất) | 2/2/2 | chờ TL | — | Could | charter loại "blog nâng cao"; trừ thông báo bình luận (CHẶN, thuộc ES1-T304) | M2 |
| — | TE-15, TE-16 | — | 0 | — | Must | còn QA ES1-T187, T192 | M1 |
| — | Review PDP app block (P1) | — | — | — | Won't R1 | chờ ES1-T308 #3 | — |

Không có story mồ côi: mọi story gắn M1 hoặc M2. Thay đổi so với thứ tự ES1-T167: trang chủ vẫn đứng đầu; TE-18 mới vào ở Should; TE-4 tách AC18 xuống Should; ES1-T304 chen vào nhóm đầu vì CHẶN.

Mốc đề xuất (theo charter; sprint 2 tuần):
- 12–13/11 (cuối sprint 1): CTO trả ES1-T308, T301; Tech Lead chia task (ES1-T304, T307) + ADR 0007; BA SRS 0.5; PO PRD 0.2, charter 0.2; đóng ticket lỗi thời.
- Sprint 2 (16–27/11): nền chung (layer manager, bộ chọn biến thể theo option value, countdown chung, snippet phân trang); trang chủ thứ tự 1–5; ES1-T304 CHẶN; TE-9; TE-14. Cổng: G3 trang chủ desktop 1920/1280 (ES1-T197 sổ chênh lệch 0 mục mở).
- Sprint 3 (30/11–11/12): TE-3 quickview, TE-4 core, TE-5, TE-6, TE-1, TE-11. Cổng: trang chủ 768/360 (TE-17 AC-H35), PDP/collection/cart Lighthouse CI.
- Sprint 4 (14–25/12): TE-8, TE-10 AC6–AC8, nhóm Should (TE-18, TE-4 AC18, TE-21, TE-19) theo năng lực còn; đo nghiệm thu NFR-1; hồ sơ G5. Should chưa xong thì đẩy sau R1, không lùi mốc.
- Tuần 11 (28/12/2026–01/01/2027): lên Canvas store thật (charter M1). Eval tuần 13–14 không đổi.

Ticket đang mở lỗi thời (đề xuất, PO KHÔNG tự đóng; CTO/role owner quyết):
- Đóng vì code đã merge: ES1-T98 (#101), T119 (#94), T120 (#95), T129, T147, T156, T250 (#152), T275 (#162). Phần còn thiếu theo thiết kế mới tạo ticket mới qua Tech Lead (ES1-T307), không mở lại.
- Đóng thay thế: ES1-T248 (trùng T303); ES1-T303 (TE-3 AC2 swatch chỉ báo bỏ hover/click; giữ tới khi bản sửa TE-3 vào develop, TC `test.fixme` gắn key); ES1-T163 (thay bởi T201); ES1-T302 (gộp vào T140).
- Sửa body (giữ ticket): ES1-T110, T111, T128, T130 (Tech Lead); ES1-T99, T112, T122, T131, T140, T151, T159, T196 (QA, phạm vi theo SRS 0.4); ES1-T150, T193 (writer: AC-H33 bản 0.4); ES1-T177 (DevOps: bước đo JS theo ADR 0006/0007).
- Đóng vì kế hoạch cũ đã thay bởi REQ-0002: ES1-T167, T168, T169, T170 (sau khi CTO chấm ES1-T305, T306, T307).
- Thiết kế: ES1-T239–T244 trùng T253–T258 → đóng trùng; ES1-T259 bỏ (sổ 10/11 customer accounts mới); T251–T263, T278–T294 → CTO chấm đạt/đóng theo BGĐ duyệt 11/11.
- Dữ liệu: ES1-T105, T125, T134, T144, T153 → gộp vào ES1-T298 (sổ 11/11 "dữ liệu demo gom 1 ticket DevOps"); ES1-T178 → kiểm phần đã làm, phần còn lại gộp T298.

[Q] đang mở chặn DEV — CTO chốt trước (thứ tự):
1. ES1-T308 #1 nội dung mẫu vs §8 (gộp ES1-T199 #1, #2, ES1-T210) — chặn TE-12, TE-17, ES1-T304; phải chốt trước khi chia task trang chủ.
2. ES1-T301 #1 ngưỡng CI và cách tính BP 100 (kèm kết quả ES1-T277) — chặn DoD mọi ticket; #2 chặn TE-18 AC7.
3. ES1-T308 #2 mục tiêu nộp Theme Store; kéo theo audit §3 #2 ảnh logo bên thứ ba + ES1-T200 #3 quyền ảnh, #3 tên theme.
4. ES1-T308 #4 năng lực/mốc.
5. ES1-T200 #1 mở khoá store cho ui_diff — chặn ES1-T197 (cổng G3 trang chủ).
6. ES1-T295 (Tech Lead) installments cart, trường B2B, combined listing — chặn chia task TE-4 AC18–AC19, TE-5 AC9.
7. ES1-T296 (BA) Markets đa nước + chữ announcement demo — chặn test TE-1 AC4, AC10 (dev không chặn).
8. ES1-T308 #3 app block review.
Đề xuất đóng vì đã có câu trả lời trong sổ: ES1-T234 (sổ 07/11 dòng "giữ ngoại lệ AA E1, E2"); ES1-T247 (sổ 10/11 G2 upsell complementary tối đa 4 → BA thêm AC, story TE-19); ES1-T214 (sổ 10/11 P5, TE-4 AC17); ES1-T280 (SRS 0.3 TE-2 AC2 đã sửa); ES1-T208 (sổ 10/11 header tối); ES1-T204 (HD3 11/11, index-1280.md). ES1-T206 (giao PO): PO trả lời trong comment ticket đó ở lượt này.
Không chặn, giữ: ES1-T161, T165, T198, T205, T207, T209, T211, T212, T213, T215, T228, T245, T246, T249.

Block bị ảnh hưởng (repo hiện tại): header, footer, announcement-bar, slideshow, slideshow-slide, featured-collection (product-card snippet), product-info, product-form, product-media, product-sticky-bar, product-recommendations, cart-drawer, cart-page, collection-filters, collection-products, featured-product, quiz, quiz-step, bundle-builder, shop-the-look, testimonials, blog-posts; templates search, blog, article, page, 404, password, gift_card, collection.quiz, index. Block mới (Tech Lead đặt tên): popup newsletter/exit/offer, quickview, localization, pickup, upsell, not-found, breadcrumb snippet, pagination snippet, countdown snippet, page.contact. Snippet `variant-json.liquid` phải bỏ (NFR-7).

Agent: po (PRD/charter/kế hoạch), ba (SRS 0.5, requirements-map), techlead (ES1-T307 chia task, ADR 0007), dev-fe, dev-be, qa (viết lại spec cũ, ~200 TC mới), devops (ES1-T298 dữ liệu, CI đo JS), writer (tài liệu merchant theo số block mới), designer (ES1-T197, T216).

Skill: backlog-prioritize, change-request (sửa đề xuất bên dưới); task-split-fe-be, playwright-theme (kiến thức bên dưới, không sửa skill).

## Kiến thức cho _chung: Thứ tự nguồn khi DEV sau 11/11

- Sổ `docs/design/decisions.md` thắng SRS và Figma; dòng 11/11 "TUÂN THỦ SHOPIFY THEME STORE" thắng các dòng cũ hơn của sổ. SRS 0.4 có chỗ chưa theo kịp (bậc giảm mặc định, claim mặc định) — gặp mâu thuẫn thì ghi `KHÔNG CHẮC`, trỏ ES1-T308, không tự chọn.
- `docs/ui-spec/<màn>.md` là nguồn chi tiết UI; mục "ĐỀ XUẤT" trong spec chỉ thành bắt buộc khi sổ có dòng chốt tương ứng (vd upsell cart: G2 10/11).
- Mã quyết định trùng tiền tố giữa các spec (PG của page.md và pagination.md, L của list-collections và lệch L1–L7, A của article và announcement) — khi trích ghi kèm tên file: `pagination PG1`, `page PG1`.
- Không đọc snapshot store dev làm gốc thiết kế (BGĐ 10/11); gốc là Figma 1:359 + ui-spec.

## Kiến thức cho po: Kế hoạch R1 sau BGĐ duyệt thiết kế

- R1 = lên Canvas store thật tuần 11 (28/12/2026), đạt chuẩn Theme Store nội bộ, không nộp (mặc định ES1-T308 #2).
- Thứ tự backlog và mốc: bảng "Ưu tiên lại" trong file này. Nhóm cắt đầu tiên khi trễ: TE-18, TE-4 AC18, TE-21, TE-19, TE-20.
- Story đã thực hiện SRS hơn PRD: PRD 0.2 phải liệt kê TE-1..TE-21; countdown không còn ở Could.

## Kiến thức cho ba: AC còn thiếu sau BGĐ duyệt

- Thêm AC (SRS 0.5): TE-1 Follow on Shop (foundation §29), favicon, menu 3 cấp + mega N2/N3 (thay "2 cấp" ở AC2); TE-3 AC10 và TE-13 AC2 rich media (video, YouTube/Vimeo, 3D — sổ 11/11 (6)); TE-5 AC1 accelerated checkout giữ màu thương hiệu ở cart; TE-9 contact aside FAQ, Apple Wallet huy hiệu chính thức; TE-10 không cắt tên sản phẩm/collection/bài (T5) và `.rte` chung (T7); TE-18 AC7 không hứa gửi mã (T10).
- Story mới đề xuất: TE-19 upsell cart (G2, cart.md §3.8), TE-20 blog/article mở rộng (blog.md §4, article.md §5, thông báo bình luận), TE-21 điều hướng mở rộng (breadcrumb + BreadcrumbList foundation §5, Popular searches foundation §24.1).
- Không sửa AC liên quan nội dung mẫu (AC-H5, AC-H18, AC-H28, TE-9 AC4) tới khi CTO trả ES1-T308 #1.
- requirements-map: R6 sửa theo NFR-1; thêm TE-11..TE-21 vào cột Story; R19 gắn writer mỗi sprint; R5 ghi trạng thái theo ES1-T308 #3.

## Kiến thức cho techlead: Nền chung trước tính năng

- Làm 5 nền trước, mỗi nền 1 cặp ticket FE/BE: (a) layer manager (dialog/sheet chung, hàng đợi popup, `--bottom-bar-height`, consent) — phục vụ TE-18, TE-10 AC6–AC8, quickview, quiz, pickup, localization; (b) bộ chọn biến thể theo option value, bỏ `snippets/variant-json.liquid` (NFR-7) — trước TE-3 quickview, TE-13, TE-11 AC7; (c) countdown chung (số in bằng Liquid, ES1-T276) — TE-4 AC17, TE-13, TE-18 AC6; (d) snippet phân trang chung — trước ES1-T110, T128, TE-9 AC3; (e) panel quickview tái dùng — trước TE-11 AC7.
- Ngân sách JS: PDP hiện ~49,5 KB thô, motion.js > 8 192 B. Chốt cách đo (transferSize theo ADR 0006, không `wc -c`) trong ADR 0007 trước khi chia task; layer manager + localization nạp mọi trang nên ≤ ~3 KB; nội dung popup/quiz/pickup nạp động.
- Không tạo trùng ES1-T304. Ticket code của REQ-0002 gắn nhãn REQ-0002.

## Kiến thức cho dev-fe: Thay đổi bắt buộc khi sửa block cũ

- Swatch card là chỉ báo (`aria-hidden`, không focus, không bấm); tên link card thêm ", N colors"; ≤ 4 màu hiện hết, > 4 hiện 3 + "+N" (VP2).
- Không cắt tên sản phẩm/collection/bài viết bằng line-clamp/ellipsis (sổ 11/11 (3); base.css đã có chỗ cắt, xem audit).
- Nút thương hiệu (Shop Pay, Apple Pay, G Pay, PayPal, Follow on Shop, Apple Wallet) không đổi màu; chỉ biến CSS chính thức (foundation §27). Icon thanh toán full color.
- Header là thanh tối 80px mọi trang, không đè ảnh; announcement bar không dính.
- Mọi danh sách nhiều trang dùng 1 snippet phân trang chung (TE-6 AC6); nút đầu/cuối giữ chỗ, mờ 0.35, không `href`.

## Kiến thức cho dev-be: Hành vi chung sau 11/11

- Đổi biến thể: tải theo option value qua Section Rendering, chỉ áp kết quả lần bấm cuối (AbortController), URL `replaceState`; Add To Cart lúc đang tải giữ màu + `aria-disabled`, không spinner (VP1).
- Mọi lớp (popup, drawer, quickview, quiz, pickup, localization) đăng ký qua layer manager; không mở chồng; popup tự mở chờ 3 s sau khi lớp đóng (MK4).
- Countdown: không reset, không đếm âm, hết giờ thì "This sale has ended", không tự tải lại (CD2).
- Ngoại lệ quiz: Add To Cart trong popup quiz không mở drawer, không chuyển cart page (QZ1).

## Kiến thức cho qa: Spec cũ lỗi thời theo SRS 0.4

- Viết lại: TE-1 TC-13, TC-22, TC-23, TC-28–TC-30, TC-45 (drawer trượt + Back, announcement, localization); bỏ TE-1 TC-42; ES1-T30 test chấm ở desktop (từ 768 không còn chấm); TE-3 TC-10–TC-17, TC-33, TC-51, TC-52, TC-54, TC-56, TC-72, B-01–B-03 (swatch radio → chỉ báo); ES1-T190 "vùng bấm swatch" và ES1-T73 bỏ; TE-4 nhóm nojs đọc `variant-json` (trái AC13); ES1-T108:159 (Previous phải hiện, `aria-disabled`); ES1-T118 testimonials; ES1-T138/T139/T183/T218 (kết quả quiz là dialog).
- Dữ liệu chưa có (B2B D1, Markets > 10 nước, pickup 3 địa điểm): kiểm bằng fixture + `page.route`, ghi rõ "kiểm mockup" trong test case; > 250 biến thể (AC16) và selling plan cần dữ liệu thật (ES1-T298).
- Countdown dùng `page.clock`, không chờ thời gian thật.

## Kiến thức cho devops: Dữ liệu và CI cho giai đoạn DEV

- ES1-T298 là ticket dữ liệu duy nhất; thêm Markets ≥ 2 ngôn ngữ và > 10 nước (ES1-T296) và pickup 3 địa điểm, 1 hết hàng (D8).
- CI đo JS theo URL (tải sẵn ≤ 40 960 B, sau cuộn ≤ 65 536 B) là cổng chặn merge; ngưỡng lhci theo ES1-T301 #1.

## Kiến thức cho writer: Tài liệu merchant theo phạm vi mới

- "16/16 block" không còn đúng: danh sách block theo AGENTS.md Theme map sau sprint 4 (thêm popup, quickview, localization, pickup...). Mỗi block có dòng nhắc nội dung mẫu (AC-H33).
- Hướng dẫn trước publish gồm: discount thật khớp bậc giảm (nếu ES1-T308 #1 giữ bậc mặc định), tag quiz, Shopify Email gửi mã, setting "Discount code".

## Sửa skill backlog-prioritize: thêm point còn lại, nhóm Theme Store và mốc

Đề xuất thay đoạn hiện tại bằng: "Điểm = (giá trị merchant 1–5 + giá trị Canvas 1–5 + giảm rủi ro 1–5) / point còn lại (phần chưa có code, Tech Lead ước). Bảng: Thứ tự | Story | 3 điểm giá trị | Point còn lại | Điểm | Nhóm | Lý do 1 dòng | Mục tiêu charter. Story chứa mã R bắt buộc trong requirements-map mặc định Must (chỉ tách AC phụ thuộc dữ liệu/tính năng store chưa bật xuống Should). Nền chung (component dùng nhiều story) xếp trước story dùng nó, dù điểm thấp. Ghi mốc sprint đề xuất và nhóm cắt đầu tiên khi trễ. Story không gắn mục tiêu → đề xuất bỏ. Ghi thay đổi so với thứ tự hiện tại."
Lý do: chia điểm cho point tổng làm story lớn (TE-4) luôn đứng cuối dù bắt buộc Theme Store; thiếu mốc nên không lập được kế hoạch release.

## Sửa skill change-request: CR dạng REQ có ticket anh em và ticket lỗi thời

Đề xuất thêm vào cuối skill: "Khi CR là yêu cầu dự án (REQ-xxxx) đã có ticket phân tích riêng cho ba/techlead/qa: subagent chỉ trả tác động ngắn, không làm lại việc của ticket anh em; ghi mã ticket anh em vào cr.md. Bắt buộc thêm 2 mục: (1) ticket đang mở lỗi thời — đề xuất đóng/sửa body/gộp, không tự đóng; (2) [Q] đang mở chặn — xếp thứ tự CTO cần chốt, ghi [Q] nào đã có đáp trong sổ quyết định. Đầu ra theo tiêu đề ticket yêu cầu (vd impact.md) thì cr.md chỉ tóm tắt quyết định và trỏ sang."
Lý do: REQ-0002 có 3 ticket phân tích song song (T305, T306, T307); không có quy tắc thì trùng việc và bỏ sót ticket lỗi thời.

## Ticket cần tạo

- PO: PRD 0.2 — thêm TE-14..TE-21, MoSCoW R1 theo bảng ưu tiên ES1-T305, chỉ tiêu NFR-1, Won't theo ES1-T308 #3, xoá 3 câu hỏi mở đã chốt, phía PO, 2 point
- PO: charter 0.2 (CR phạm vi) — trang trong phạm vi (thêm list-collections, 404, password, gift card, quiz result, contact), mục tiêu 2 theo NFR-1, bỏ "16 block", mốc R1 tuần 11, ngân sách theo ES1-T308 #4; CTO ký, phía PO, 2 point
- PO: kế hoạch release R1 — sprint 2–4, cổng G3/G5, danh sách cắt khi trễ, gắn ticket con sau khi ES1-T307 chia task, phía PO, 2 point
- BA: SRS 0.5 — thêm AC thiếu (TE-1 Follow on Shop, favicon, menu 3 cấp/mega; TE-3, TE-13 rich media; TE-5 nút thương hiệu ở cart; TE-9 contact aside, Apple Wallet; TE-10 không cắt tên, .rte chung; TE-18 AC7 không hứa gửi mã) và đổi tiền tố mã quyết định trùng, phía BA, 3 point
- BA: SRS 0.5 — sửa AC nội dung mẫu (TE-12 AC1, AC-H18, AC-H19, TE-17 AC-H1, AC-H5, AC-H28, TE-9 AC4) theo trả lời ES1-T308 #1, phía BA, 2 point
- BA: story mới TE-19 upsell cart (G2, cart.md §3.8) — user story + AC GWT + bảng setting, phía BA, 1 point
- BA: story mới TE-20 blog/article mở rộng (blog.md B1–B3, article.md A1–A3, thông báo bình luận) — user story + AC + setting, phía BA, 2 point
- BA: story mới TE-21 điều hướng mở rộng (menu 3 cấp + mega N2/N3, breadcrumb + BreadcrumbList, Popular searches FD2) — user story + AC + setting, phía BA, 2 point
- BA: docs/requirements-map.md — R6 theo NFR-1, cột Story thêm TE-11..TE-21, R19 writer, R5 theo ES1-T308 #3, phía BA, 1 point
