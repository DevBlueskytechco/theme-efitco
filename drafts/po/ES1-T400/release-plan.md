KHÔNG CHẮC: (1) G3/G5 trong ticket chưa có định nghĩa cho pha REQ-0002 (charter 0.1 đặt G3 cuối tuần 2, đã qua). Mặc định ở §3, §4, hỏi CTO ở ES1-T420. (2) PO không đọc được drafts/techlead/ES1-T307/task-split.md vì file nằm trên nhánh feature/ai-ES1-T307, không có trong worktree này. Số liệu lấy từ ticket con ES1-T312…T417 (sprint, point, nhãn), comment Tech Lead và CTO trên ES1-T307, T304, T310, T311, T399. (3) 9 ticket QA, 2 writer, 2 DevOps cũ chưa có point hoặc có thể trùng task R2. Hỏi Tech Lead ở ES1-T421. (4) Charter 0.2 (ES1-T399) chưa ký; ES1-T419 (cách tính BP 100, danh sách trang đo) còn mở.

# Kế hoạch release R1 — theme-efitco · ES1-T400 · PO · 11/11/2026

Nguồn: REQ-0002; quyết định CTO ES1-T308, T309, T310, T311; comment CTO 14:37 trên ES1-T304 và ES1-T399; ES1-T418 (đã đóng); ticket con ES1-T312…T417.

## 1. Mốc

| Mốc | Ngày | Nội dung |
| --- | --- | --- |
| G3-R2 (cổng vào DEV) | T6 13/11 | CTO ký trong review 30 phút. Tiêu chí ở §3 |
| Sprint 2 | 16/11–27/11 | Nền chung, ES1-T304 CHẶN, header/footer/nav, card, bundle, SRS 0.5 |
| Sprint 3 | 30/11–11/12 | Trang chủ, PDP và bộ chọn biến thể, trang phụ ES1-T304 |
| Sprint 4 | 14/12–25/12 | Collection, cart, quickview, search, blog/article, trang phụ, quiz |
| Code freeze Must | T3 22/12 | Sau ngày này chỉ merge sửa bug P1/P2 |
| Hồi quy + lhci + checklist Canvas | 23–24/12 | Chạy trên store dev hoa-qua-nhap-khau (CTO ES1-T420), zip từ ES1-T411 |
| Hồ sơ G5 | T5 24/12 | PO nộp hồ sơ theo §4 |
| G5 ký | T6 25/12 | CTO ký |
| R1 lên Canvas store thật | T2 28/12 (tuần 11) | Giữ mốc theo ES1-T308 #2, #4 và ES1-T311 |

Cuối mỗi sprint (27/11, 11/12, 25/12): DevOps người upload zip lên yum-dev, QA chạy checklist Canvas C1–C5 (charter dòng 19, docs/checklist-canvas.md).

Điểm kiểm cắt (review thứ Sáu với CTO): 20/11, 27/11, 04/12, 11/12, 18/12. Luật kích hoạt cắt ở §6.

## 2. Sức chứa và tải (point, 1 point ≈ 1,5 giờ theo ES1-T310 #4)

Sức chứa FE: 220 giờ + 27 giờ (ES1-T311) + 53 giờ (CTO 14:37, ES1-T399) = 300 giờ ≈ 200 point. BE: 160 giờ ≈ 107 point. QA: 160 giờ ≈ 107 point.

| Phía | Sprint 2 | Sprint 3 | Sprint 4 | Tổng R1 | Sức chứa | Dư |
| --- | --- | --- | --- | --- | --- | --- |
| FE | 60 (15 task) | 72 (17) | 68 (16) | 200 | 200 | 0 |
| BE | 33 (11) | 30 (8) | 40 (9) | 103 | 107 | 4 |
| QA (có point) | 5 | 30 | 15 | 50 | 107 | 57 (chưa tính ticket QA cũ, ES1-T421) |
| BA | 18 | – | – | 18 | 80 giờ | – |
| DevOps | 2 | – | 2 | 4 | 80 giờ | – |

Cách đếm:
- BE Sprint 4 = 37 Must + ES1-T379 recent searches 3 (CTO giữ trong R1).
- ES1-T111 không tính riêng vì đã gộp vào ES1-T110.
- BE Sprint 2 có thêm ES1-T415 (bug, 3 point).
- FE 200 = 165 Must R2 + 35 của ES1-T304, khớp số Tech Lead báo ở ES1-T311.

Rủi ro tải:
- FE không còn dư. Sprint 3 có 72 point, cao hơn mức trung bình 66,7. Trễ 1 task FE là phải cắt theo §6.
- BE còn dư 4 point. Nếu cắt ES1-T379 thì dư 7.

## 3. Cổng G3-R2 — vào DEV REQ-0002 (mặc định, chờ ES1-T420)

| # | Tiêu chí | Bằng chứng | Trạng thái 11/11 |
| --- | --- | --- | --- |
| 1 | ADR 0007–0010 Chấp nhận | comment CTO ES1-T310 | Đạt |
| 2 | ADR 0011, 0012 Chấp nhận | comment CTO 14:37 ES1-T304 | Đạt |
| 3 | Task-split CTO duyệt, ticket con đã tạo, mỗi task có sprint, point, phía | ES1-T307, T304; ES1-T312…T417 | Đạt (trừ ticket cũ ở ES1-T421) |
| 4 | Charter 0.2 ký (phạm vi, ngân sách FE 300 giờ, mốc R1) | ES1-T399 | Chờ CTO ký |
| 5 | PRD 0.2 (MoSCoW R1, Won't app block) | ES1-T398 | Chờ chấm |
| 6 | [Q] chặn Sprint 2 đóng hoặc nhận mặc định | ES1-T414 (TE-4, chặn T347 rồi tới Sprint 3), T419, T420, T421 | Mở, hạn mặc định 13/11 |
| 7 | Dữ liệu store dev cho fixture | ES1-T298 (DevOps), T331 (QA0) | ES1-T298 chưa point, cần xong trước 20/11 |
| 8 | Ngưỡng lhci CI theo ES1-T301 | ES1-T416 | Sprint 2, phải xong trước PR FE đầu tiên |

SRS 0.5 (ES1-T394…T397) không phải điều kiện G3:
- BA làm SRS 0.5 trong Sprint 2. Task FE Sprint 2 bám AC 0.4 (ví dụ T326, T327 ghi "TE-1 AC7 (0.4) → TE-22 (0.5)").
- Điều kiện thay thế: ES1-T396 (story TE-19…TE-22) xong trước 20/11 để QA TE-22 (T330, Sprint 3) có AC 0.5.

Không đạt tiêu chí 4 hoặc 6 vào 13/11 thì Sprint 2 vẫn chạy wave 1 (§5.1, task không phụ thuộc). Wave 2 chờ.

## 4. Cổng G5 — nghiệm thu R1 (hồ sơ PO, CTO ký 25/12)

| # | Tiêu chí | Nguồn | Bằng chứng trong hồ sơ |
| --- | --- | --- | --- |
| 1 | Mục tiêu 1: mở, sửa, publish được trong Canvas; 10 yêu cầu Sidekick mẫu cho ra theme check 0 lỗi | charter dòng 7; checklist-canvas 10 yêu cầu | Checklist Canvas cột Tuần 11, chạy trước trên yum-dev 23–24/12 |
| 2 | Mục tiêu 2: Lighthouse perf ≥ 96 desktop, ≥ 90 mobile; a11y, BP theo charter 0.2 / NFR-1 / ES1-T301 | charter 0.2 (ES1-T399), ES1-T419 | Báo cáo lhci các trang đo (danh sách theo ES1-T419). BP do nền tảng ghi riêng |
| 3 | Bug P1/P2 mở = 0 | charter dòng 8 | Danh sách bug theo mức |
| 4 | Ngân sách JS theo trang (ADR 0006/0010), base.css gzip ≤ 49 152 B | ES1-T310 #1 | Số đo CI theo URL; ES1-T317 rà CSS chết |
| 5 | E2E Must xanh trên store dev, desktop + Pixel 7 | test-strategy | Kết quả Playwright các task QA §5 |
| 6 | Theme mới cài trống: không handle figma-*, bậc giảm 0, claim/mã giảm rỗng | ES1-T308 #1, ADR 0011 | ES1-T412 nhóm @static |
| 7 | Tuân thủ Theme Store nội bộ: đủ mục CHẶN của ES1-T304 | ES1-T308 #2 | ES1-T412 pass, T401–T410 merge |
| 8 | Trang chủ giống Figma (đo trên store dev đã cấu hình fixture) | REQ-0002, AC-H1..H5, ES1-T309 #4 | ES1-T345, T346 |
| 9 | Gói zip R1 sạch (không template test, hello-world, liquid-tips) | ES1-T411 | Danh sách file trong zip |
| 10 | Tài liệu merchant cho block/template trong phạm vi | charter G5, ES1-T420 #3 | docs/merchant/* (hiện chỉ có ES1-T150, T193 — thiếu, §7) |
| 11 | Should đã cắt ghi rõ trong release note (ngoài R1) | §6 | Danh sách §6.1 |

Không đạt 1, 2, 3, 6 hoặc 7 thì không ký, R1 lùi. Lùi mốc do CTO quyết, PO không tự lùi.

## 5. Gắn ticket con theo sprint

Thứ tự trong sprint:
- Task CHẶN của ES1-T304 chạy trước các task đang chờ nó (blocked_by Tech Lead đổi ngày 11/11 14:23).
- Trang chủ đi trước (ràng buộc số 1 của REQ-0002).

### 5.1 Sprint 2 (16–27/11) — FE 60, BE 33, QA 5, BA 18, DevOps 2

Wave 1 (không chờ ai, bắt đầu 16/11):

| Ticket | Mã | Phía | Pt | Story |
| --- | --- | --- | --- | --- |
| ES1-T401 | TS-FE1 logo, favicon, social | FE | 4 | TS (ES1-T304) |
| ES1-T402 | TS-FE2 footer bỏ figma_pay | FE | 3 | TS |
| ES1-T403 | TS-FE5 .rte, h6, không cắt tên | FE | 5 | TS |
| ES1-T404 | TS-FE6 swatch, Sale badge, nhãn | FE | 4 | TS |
| ES1-T405 | TS-FE3 index.liquid bỏ demo | FE | 5 | TS |
| ES1-T406 | TS-FE4 default trống, tier 0 | FE | 4 | TS |
| ES1-T312 | TE-10-R2-FE1 critical/base CSS | FE | 4 | TE-10 |
| ES1-T313 | TE-10-R2-FE2 empty-state | FE | 4 | TE-10 |
| ES1-T314 | TE-10-R2-BE1 page-layers.js | BE | 3 | TE-10 |
| ES1-T315 | TE-10-R2-BE2 modal-dialog.js | BE | 3 | TE-10 |
| ES1-T316 | TE-10-R2-BE3 motion.js ≤ 6 144 B | BE | 3 | TE-10 |
| ES1-T415 | bug thứ tự nạp module (BP) | BE | 3 | TE-10 |
| ES1-T347 | TE-4-R2-BE1 spike (chờ ES1-T414) | BE | 3 | TE-4 |
| ES1-T331 | TE-17-R2-QA0 fixture store dev | QA | 3 | TE-17 |
| ES1-T417 | QA sort cố định, spec quiz | QA | 2 | TE-10 |
| ES1-T416 | lhci ngưỡng ES1-T301 | DevOps | 2 | TE-10 |
| ES1-T394…T397 | REQ2-BA1…BA4 SRS 0.5, requirements-map (T396 trước 20/11) | BA | 18 | – |

Wave 2 (sau khi blocker merge):

| Ticket | Mã | Phía | Pt | Story | Chờ |
| --- | --- | --- | --- | --- | --- |
| ES1-T319 | TE-1-R2-FE1 header, announcement | FE | 4 | TE-1 | T401 |
| ES1-T320 | TE-1-R2-FE3 header dưới 80rem | FE | 5 | TE-1 | – |
| ES1-T321 | TE-1-R2-FE4 footer | FE | 4 | TE-1 | T402 |
| ES1-T326 | TE-22-R2-FE1 breadcrumb, page-title | FE | 3 | TE-22 | – |
| ES1-T327 | TE-22-R2-FE2 mega menu cấp 3 | FE | 4 | TE-22 | – |
| ES1-T337 | TE-3-R2-FE1 product-card | FE | 3 | TE-3 | T403, T404 |
| ES1-T339 | TE-12-R2-FE1 bundle-builder | FE | 4 | TE-12 | T406 |
| ES1-T323 | TE-1-R2-BE1 header-drawer.js | BE | 3 | TE-1 | – |
| ES1-T329 | TE-22-R2-BE1 header-menu.js | BE | 3 | TE-22 | – |
| ES1-T333 | TE-2-R2-BE1 slideshow.js | BE | 3 | TE-2 | – |
| ES1-T335 | TE-7-R2-BE1 scroll-buttons.js | BE | 3 | TE-7 | – |
| ES1-T338 | TE-3-R2-BE2 gỡ product-swatch.js | BE | 3 | TE-3 | – |
| ES1-T340 | TE-12-R2-BE1 bundle-form.js | BE | 3 | TE-12 | – |

### 5.2 Sprint 3 (30/11–11/12) — FE 72, BE 30, QA 30

| Ticket | Mã | Phía | Pt | Story |
| --- | --- | --- | --- | --- |
| ES1-T332 | TE-2-R2-FE1 slideshow (lùi từ S2, CTO 14:37) | FE | 5 | TE-2 |
| ES1-T334 | TE-7-R2-FE1 collection-list, testimonials, video, blog-posts (lùi từ S2) | FE | 5 | TE-7 |
| ES1-T336 | TE-17-R2-FE1 rich-text, level, featured-collection (lùi từ S2; chờ T406) | FE | 4 | TE-17 |
| ES1-T341 | TE-17-R2-FE2 quiz, shop the look, image-with-text | FE | 5 | TE-17 |
| ES1-T342 | TE-17-R2-FE3 featured-product, faq (chờ T409) | FE | 4 | TE-17 |
| ES1-T343 | TE-13-R2-FE1 sale-countdown (chờ T405, T409) | FE | 4 | TE-13 |
| ES1-T322 | TE-1-R2-FE5 footer, header | FE | 4 | TE-1 |
| ES1-T348 | TE-4-R2-FE1 variant picker | FE | 5 | TE-4 |
| ES1-T349 | TE-4-R2-FE2 bỏ variant-json | FE | 4 | TE-4 |
| ES1-T351 | TE-4-R2-FE3 product, media | FE | 5 | TE-4 |
| ES1-T352 | TE-4-R2-FE4 product-form | FE | 4 | TE-4 |
| ES1-T353 | TE-4-R2-FE5 details, reviews metafield (chờ T403) | FE | 5 | TE-4 |
| ES1-T354 | TE-4-R2-FE6 form, gift card người nhận (ES1-T418) | FE | 5 | TE-4 |
| ES1-T356 | TE-4-R2-FE8 sticky bar | FE | 3 | TE-4 |
| ES1-T407 | TS-FE7 blog/article/page.contact | FE | 3 | TS |
| ES1-T408 | TS-FE8 404, password, gift_card | FE | 3 | TS |
| ES1-T409 | TS-FE9 rich media featured | FE | 4 | TS |
| ES1-T344 | TE-13-R2-BE1 sale-countdown.js (chờ T410) | BE | 3 | TE-13 |
| ES1-T324 | TE-1-R2-BE2 localization-picker.js | BE | 3 | TE-1 |
| ES1-T350 | TE-4-R2-BE2 variant-picker.js | BE | 5 | TE-4 |
| ES1-T357 | TE-4-R2-BE3 product-media, lightbox (chờ T410) | BE | 3 | TE-4 |
| ES1-T358 | TE-4-R2-BE4 product-form.js | BE | 4 | TE-4 |
| ES1-T359 | TE-4-R2-BE5 pickup, recommendations | BE | 4 | TE-4 |
| ES1-T360 | TE-4-R2-BE6 product-form.js AC19 | BE | 3 | TE-4 |
| ES1-T410 | TS-BE1 gift-card-qr, product-media nhiều instance | BE | 5 | TS |
| ES1-T318 | TE-10-R2-QA1 ma trận lớp | QA | 4 | TE-10 |
| ES1-T325 | TE-1-R2-QA1 | QA | 4 | TE-1 |
| ES1-T330 | TE-22-R2-QA1 | QA | 3 | TE-22 |
| ES1-T345 | TE-17-R2-QA1 trang chủ 1280 | QA | 5 | TE-17 |
| ES1-T346 | TE-17-R2-QA2 trang chủ 768/360 | QA | 5 | TE-17 |
| ES1-T362 | TE-4-R2-QA1 bộ chọn > 250 biến thể | QA | 4 | TE-4 |
| ES1-T412 | TS-QA1 tuân thủ Theme Store | QA | 5 | TS |
| ES1-T122, T151, T159, T187, T192 | QA cũ, chưa point | QA | ? | ES1-T421 |

### 5.3 Sprint 4 (14–25/12) — FE 68, BE 40, QA 15

Trang phụ (TE-20, TE-21) xếp cuối Sprint 4 theo CTO.

| Ticket | Mã | Phía | Pt | Story |
| --- | --- | --- | --- | --- |
| ES1-T364 | TE-6-R2-FE1 pagination | FE | 3 | TE-6 |
| ES1-T365 | TE-6-R2-FE2 collection | FE | 5 | TE-6 |
| ES1-T366 | TE-6-R2-FE3 filters | FE | 4 | TE-6 |
| ES1-T367 | TE-6-R2-FE4 list-collections | FE | 3 | TE-6 |
| ES1-T368 | TE-5-R2-FE1 cart drawer | FE | 5 | TE-5 |
| ES1-T369 | TE-5-R2-FE2 cart page | FE | 5 | TE-5 |
| ES1-T373 | TE-3-R2-FE2 quickview | FE | 5 | TE-3 |
| ES1-T128 | TE-8-FE1 trang search | FE | 5 | TE-8 |
| ES1-T129 | TE-8-FE2 predictive markup | FE | 3 | TE-8 |
| ES1-T377 | TE-8-R2-FE1 predictive, settings Search | FE | 4 | TE-8 |
| ES1-T387 | TE-11-R2-FE1 quiz result | FE | 5 | TE-11 |
| ES1-T317 | TE-10-R2-FE3 rà CSS chết | FE | 3 | TE-10 |
| ES1-T381 | TE-20-R2-FE1 blog | FE | 5 | TE-20 |
| ES1-T382 | TE-20-R2-FE2 article | FE | 5 | TE-20 |
| ES1-T383 | TE-21-R2-FE1 page, contact | FE | 3 | TE-21 |
| ES1-T384 | TE-21-R2-FE2 404, password, gift card | FE | 5 | TE-21 |
| ES1-T110 | TE-6-BE1 collection-filters.js (gộp T111) | BE | 8 | TE-6 |
| ES1-T98 | TE-5-BE3 cart override Shopify.actions | BE | 3 | TE-5 |
| ES1-T370 | TE-5-R2-BE1 cart-items.js | BE | 5 | TE-5 |
| ES1-T374 | TE-3-R2-BE1 quick-view.js | BE | 5 | TE-3 |
| ES1-T130 | TE-8-BE1 predictive-search.js | BE | 5 | TE-8 |
| ES1-T378 | TE-8-R2-BE1 predictive | BE | 3 | TE-8 |
| ES1-T380 | TE-8-R2-BE2 filters trang search | BE | 3 | TE-8 |
| ES1-T388 | TE-11-R2-BE1 quiz JS | BE | 5 | TE-11 |
| ES1-T379 | TE-8-R2-BE3 recent searches (Should, CTO giữ) | BE | 3 | TE-8 |
| ES1-T363 | TE-4-R2-QA2 PDP còn lại (bỏ AC18 vì BE7 cắt) | QA | 5 | TE-4 |
| ES1-T375 | TE-3-R2-QA1 quickview | QA | 4 | TE-3 |
| ES1-T385 | TE-20-R2-QA1 | QA | 3 | TE-20 |
| ES1-T386 | TE-21-R2-QA1 | QA | 3 | TE-21 |
| ES1-T99, T112, T131, T140 | QA cũ TE-5, TE-6, TE-8, TE-11, chưa point | QA | ? | ES1-T421 |
| ES1-T411 | TS-OPS1 zip R1 | DevOps | 2 | TS |
| ES1-T150 | TE-12-DOC1 tài liệu bundle | Writer | ? | TE-12 |

### 5.4 Ngoài R1 (Should, CTO 14:37 cắt)

Các ticket này giữ nhãn `should`, `cat-r1` và không có sprint.

| Ticket | Mã | Phía | Pt |
| --- | --- | --- | --- |
| ES1-T389, T390 | TE-18-R2-FE1, FE2 popup | FE | 9 |
| ES1-T391, T392 | TE-18-R2-BE1, BE2 | BE | 10 |
| ES1-T393 | TE-18-R2-QA1 | QA | 4 |
| ES1-T328 | TE-22-R2-FE3 mega ảnh/sản phẩm | FE | 3 |
| ES1-T355 | TE-4-R2-FE7 B2B quantity rule + volume | FE | 3 |
| ES1-T361 | TE-4-R2-BE7 | BE | 3 |
| ES1-T371 | TE-19-R2-FE1 upsell | FE | 3 |
| ES1-T372 | TE-19-R2-BE1 | BE | 3 |
| ES1-T376 | TE-19-R2-QA1 | QA | 3 |

Tổng phần cắt: FE 18, BE 16, QA 7.

## 6. Danh sách cắt khi trễ

### 6.1 Tầng 0 — đã cắt

Bảng §5.4. CTO 14:37 lấy Should ra khỏi R1 trước khi trễ. Lệnh này mới hơn và thay thứ tự cắt từng bước trong kiến thức CTO (TE-18 → mega → B2B → recent → TE-19). Recent searches (ES1-T379) vẫn giữ trong R1.

### 6.2 Luật kích hoạt

Kiểm tại mỗi review thứ Sáu.
- FE: point Must chưa merge của sprint lớn hơn sức chứa còn lại của sprint (≈ 6,7 point mỗi ngày làm việc). Khi đó PO đề xuất tầng kế tiếp. CTO duyệt trong cùng buổi review.
- BE: tương tự, ≈ 3,5 point mỗi ngày.
- Task nằm trên đường găng: blocker ES1-T304 (T401–T406) trễ quá 20/11 thì kích hoạt tầng 1 ngay, không chờ 27/11.

### 6.3 Thứ tự cắt

Theo ES1-T311, CTO chốt. Riêng BE là đề xuất PO.

| Tầng | Cắt | Phía/pt | Hệ quả, ticket phải sửa theo |
| --- | --- | --- | --- |
| 1 | Popup kết quả quiz: ES1-T387, T388 | FE 5, BE 5 | Trang `?view=quiz` vẫn chạy, quiz submit sang trang kết quả. ES1-T140 bỏ AC popup. Charter 0.2 giữ template collection.quiz |
| 2 | Phần mở rộng TE-20: nav chủ đề, bài nổi bật blog, bài liên quan article (~3 FE nằm trong T381, T382) | FE ~3 | Tech Lead tách phần này khỏi T381/T382 trước 14/12. ES1-T385 bỏ AC tương ứng |
| 3 | ES1-T367 TE-6-R2-FE4 list-collections: giữ bản hiện có | FE 3 | ES1-T112 test list-collections theo bản cũ |
| BE-1 (đề xuất PO, chờ CTO) | ES1-T379 recent searches | BE 3 | Chỉ khi BE trễ. ES1-T131 bỏ AC recent |

Không cắt:
- Task CHẶN ES1-T304: T401–T410, T412.
- Trang chủ: TE-17, TE-2, TE-7, TE-12, TE-13.
- Trang phụ TE-21 và lõi TE-20.
- Task nền TE-10.

Cắt hết 3 tầng FE mà vẫn trễ thì PO mở CR lùi mốc. Chỉ CTO quyết.

## 7. Ưu tiên theo story (backlog-prioritize)

Điểm = (merchant + Canvas + giảm rủi ro) / point R1 (FE+BE+QA có point). Mục tiêu charter:
- M1: Canvas tuần 11, Sidekick.
- M2: Lighthouse/NFR-1, P1/P2 = 0.
- REQ-0002 #1: trang chủ giống Figma.
- TS: chuẩn Theme Store nội bộ (ES1-T308 #2).

| Story | Merchant | Canvas | Rủi ro | Point | Điểm | Nhóm | Lý do | Mục tiêu |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TE-2 hero | 5 | 4 | 3 | 8 | 1,50 | Must | Khối đầu trang chủ, LCP | REQ #1, M2 |
| TE-12 bundle | 4 | 3 | 3 | 7 | 1,43 | Must | Khối trang chủ, tier 0 theo ADR 0011 | REQ #1 |
| TE-13 countdown/featured | 4 | 3 | 3 | 7 | 1,43 | Must | Countdown chung ADR 0009 | REQ #1 |
| TE-7 nội dung | 4 | 4 | 2 | 8 | 1,25 | Must | Khối trang chủ Sidekick hay sửa | REQ #1, M1 |
| TE-21 trang phụ | 3 | 4 | 4 | 11 | 1,00 | Must | 404/password/gift card là chuẩn Theme Store | TS, M1 |
| TE-22 nav (lõi) | 4 | 3 | 3 | 13 | 0,77 | Must | Menu cấp 3, breadcrumb; yêu cầu Sidekick #9 | M1 |
| TE-5 cart | 5 | 3 | 4 | 18 | 0,67 | Must | Luồng mua, override Shopify.actions | M2 |
| TE-20 blog/article | 3 | 3 | 2 | 13 | 0,62 | Must | CTO giữ; phần mở rộng ở tầng cắt 2 | M1 |
| TE-11 quiz result | 3 | 2 | 1 | 10 | 0,60 | Must | CTO giữ; ở tầng cắt 1 | REQ #1 |
| TE-3 card + quickview | 5 | 3 | 3 | 20 | 0,55 | Must | Card dùng mọi trang | M2 |
| TE-10 nền chung (gồm T415, T416, T417) | 3 | 5 | 5 | 31 | 0,42 | Must | Lớp, modal, JS budget, ngưỡng lhci; mọi task khác dựa vào | M2 |
| TE-1 khung | 5 | 4 | 4 | 27 | 0,48 | Must | Header/footer mọi trang | M1, M2 |
| TE-6 collection | 5 | 3 | 3 | 23 | 0,48 | Must | Lọc/sort; T367 ở tầng cắt 3 | M2 |
| TE-17 đo trang chủ | 5 | 3 | 4 | 26 | 0,46 | Must | Mục tiêu số 1; fixture store dev | REQ #1 |
| REQ2-BA SRS 0.5 | 1 | 2 | 5 | 18 | 0,44 | Must | AC cho QA và nghiệm thu | M2 |
| TE-8 search | 4 | 2 | 2 | 26 | 0,31 | Must | Trang search trong phạm vi; T379 Should giữ | M1 |
| TS ES1-T304 | 4 | 4 | 5 | 47 | 0,28 | Must | Mục CHẶN Theme Store, không cắt | TS |
| TE-4 PDP | 5 | 3 | 5 | 62 | 0,21 | Must | NFR-7 2048 biến thể, ngân sách JS PDP vượt (ES1-T414) | M2 |
| TE-22 mega ảnh | 2 | 2 | 1 | 3 | 1,67 | Should, cắt | CTO 14:37. Điểm cao chỉ do ít point | – |
| B2B FE7/BE7 | 2 | 1 | 1 | 6 | 0,67 | Should, cắt | CTO 14:37 | – |
| TE-19 upsell | 3 | 2 | 1 | 9 | 0,67 | Should, cắt | CTO 14:37 | – |
| TE-18 popup | 3 | 2 | 1 | 23 | 0,26 | Should, cắt | CTO 14:37 | – |

Story mồ côi: không có. Mọi task R2 gắn story TE-1…TE-22, TS hoặc REQ2-BA.

Lỗ hổng:
- Tài liệu merchant (G5 tiêu chí 10) chưa có ticket ngoài ES1-T150 và T193.
- Đề xuất CTO tạo ticket writer Sprint 4 cho docs/merchant theo block/template của charter 0.2 (ES1-T420 #3).
- Merchant docs gắn M1.

## 8. Thay đổi so với thứ tự hiện tại

1. ES1-T332, T334, T336 nằm ở Sprint 3 (CTO 14:37 đã duyệt lùi). Không đổi thêm.
2. ES1-T379 (Should) giữ trong Sprint 4 theo CTO. PO đề xuất xếp nó vào tầng cắt BE-1, chờ CTO.
3. ES1-T111 không tính point (đã gộp T110). Tổng BE còn 103, không phải 106.
4. Sprint 2 chia wave 1/wave 2 theo blocked_by của ES1-T304. ES1-T396 phải xong trước 20/11.
5. ES1-T363 bỏ AC18 vì BE7 đã cắt.
6. Ticket QA/DevOps/writer cũ chưa point: chờ ES1-T421. ES1-T298 (dữ liệu store dev) đưa vào điều kiện G3 #7.
7. Thêm code freeze 22/12 và lịch G5 23–25/12 (chờ ES1-T420).

## 9. Câu hỏi đang mở ảnh hưởng kế hoạch

Im lặng tới 13/11 thì nhận mặc định của từng ticket.

| Ticket | Hỏi | Chặn |
| --- | --- | --- |
| ES1-T420 | CTO: định nghĩa G3-R2, G5, ngày ký, tài liệu merchant | §3, §4 |
| ES1-T421 | Tech Lead: ticket QA/DevOps/writer cũ giữ, gộp hay đóng | §2 QA, §5 |
| ES1-T419 | CTO: cách tính BP 100, trang đo | G5 #2 |
| ES1-T414 | Tech Lead: partial bộ chọn, ngân sách JS PDP | TE-4 Sprint 3 |
