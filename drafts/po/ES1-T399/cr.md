KHÔNG CHẮC: TE-4-R2-FE7 gồm form người nhận gift card PDP (ES1-T310); cắt cả task có cắt form đó không → ES1-T418 (Tech Lead), mặc định cắt nguyên task. Giờ FE Sprint 1 đã dùng chưa đo (ES1-T308 #4). Cách tính BP 100 và danh sách "trang đo" → ES1-T419 (CTO), mặc định ghi trong charter.

# CR ES1-T399 — charter 0.2 (phạm vi R1)

## Mô tả CR + nguồn
REQ-0002 (BGĐ duyệt thiết kế 11/11) → đề xuất PO ES1-T305 impact.md → CTO chốt ES1-T308, T309, T310, T311, T301, T413 và comment CTO trên ES1-T304, ES1-T399 (11/11 14:10, 14:37).
Đổi so với charter 0.1:
| # | Mục | 0.1 | 0.2 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Trang | 8 trang (home, collection, product, cart, search, blog, article, page/contact) | 14 template: thêm list-collections, page.contact (tách khỏi page), 404, password, gift card, quiz result (`collection.quiz`) | ticket; ui-spec develop 11/11; ES1-T309 #1 |
| 2 | Mục tiêu 2 | Lighthouse 96/90/98 home/product/collection | NFR-1: A11y 100, BP 100 mọi trang đo; SEO 100 ở 6 loại trang; perf ≥ 98/90; CI theo ES1-T301 | SRS 0.4 NFR-1; ES1-T301 |
| 3 | Số block | "16 block" ở phạm vi, G5 | bỏ số; block trang chủ theo `docs/ui-spec/index.md` | ticket |
| 4 | Mốc | lên Canvas tuần 11 | R1 = tuần 11, 28/12; sprint có ngày; 3 task FE lùi Sprint 3 | ES1-T308 #2, #4; ES1-T304 |
| 5 | Ngân sách | FE 220, tổng 980 giờ | FE 300 (+27 +53), tổng 1.060 giờ; thứ tự cắt khi vượt | ES1-T308 #4, T311, comment CTO ES1-T399 |
| 6 | Ngoài phạm vi | app, multi-market, blog nâng cao, Theme Store listing, metaobject | + Should cắt (TE-18, TE-19, TE-22-R2-FE3, TE-4-R2-FE7/BE7), nộp Theme Store, app review PDP, `customers/*` cũ, JSON template | comment CTO ES1-T399; ES1-T308 #2, #3; decisions 11/11 |
| 7 | Nội dung mặc định | — | theme cài trống, Figma chỉ trên store dev | ES1-T308 #1; ADR 0011 |

## Tác động kỹ thuật (Tech Lead, đã có ở ES1-T307, T310, T311, T304)
- Point: FE Must Sprint 2–4 = 165 (REQ-0002) + 35 (ES1-T304, T401–T409) = 200 point ≈ 300 giờ; sức chứa cũ ~147 point. BE 92 + 5 = 97 ≤ 107. QA REQ-0002 37 + T412 5. DevOps T411 2.
- Sprint 2 FE 74 point; lùi TE-7-R2-FE1, TE-2-R2-FE1, TE-17-R2-FE1 (~12 point) sang Sprint 3 vì chờ T401–T406.
- Rủi ro: base.css 232 KB vs perf desktop 98 (ES1-T310 #1); BP do nền tảng (ES1-T301).
- Không đổi kiến trúc: giữ Skeleton block-first (decisions 11/11), ADR 0007–0012 Chấp nhận.

## Tác động nghiệp vụ (BA, đã có ở ES1-T306, T309)
- Story mới: TE-19 upsell (ngoài R1), TE-20 blog/bài viết, TE-21 trang phụ (page, contact, 404, password, gift card), TE-22 điều hướng mở rộng (trừ FE3).
- SRS 0.5: đổi Given "theme mới cài" → "store dev đã cấu hình" cho AC-H1, H5, H18, H19, H28; thêm AC cho dòng ĐỀ XUẤT ui-spec, so khối 1280/768/360, VP2, VP3, HB1, HB2, FD2, HD3.
- Chỗ còn "16 block": SRS TE-10 AC5, AC-H30, AC-H31; PRD (chỉ số thành công); checklist-canvas C2; architecture.md; figma-inventory.md.

## Tác động test (QA)
Subagent QA đánh giá 11/11, chỉ đọc repo/ticket:
- lighthouserc.json, lighthouserc.mobile.json: a11y 0,98 → 1,0; thêm BP warn 0,78, SEO warn 1 (ES1-T301, DevOps sửa).
- `.github/workflows/store-tests.yml` lhci đo 3 URL; thêm blog, article, page (SEO 6 loại trang) và list-collections, `?view=quiz`, 404, password, gift card, contact (A11y/BP). Cart, search: chờ danh sách "trang đo" ES1-T419.
- `docs/test-strategy.md` (A11y ≥ 98, perf chỉ 3 trang) và `docs/checklist-theme-store.md` R6.x, R11: theo NFR-1, tách ngưỡng CI và nghiệm thu.
- checklist-canvas C2, TC TE-10 AC5, AC-H30, AC-H31, skill canvas-check bước 2 còn "16 block".
- E2E: axe 0 serious/critical cho 6 trang phụ; gom vào ES1-T412 (đã có 404, password, gift card fixme, contact, quiz).
- Should cắt: không có spec/TC nào cho TE-18, TE-19, TE-22-R2-FE3, TE-4-R2-FE7/BE7 → không phải đánh dấu. TC chạm popup TE-18 (TE-10 AC7, TE-18 AC9, TE-14 AC5) để `test.fixme` "ngoài R1"; TE-4 AC18 BA gắn ngoài R1.
- Giờ QA thêm (thô): ~6 point ≈ 9 giờ (checklist/TC 1, lhci 14 trang × 2 thiết bị 3, axe 6 trang 2), ngoài T412 5 point; nằm trong QA 160 giờ, không nới.
- Rủi ro: BP 100 không đạt do nền tảng (ES1-T277) → hỏi CTO ES1-T419; gift card chưa có demo (ES1-T298) → fixme; `/password` cần phiên chưa đăng nhập (scripts/lhci-auth.js); 404 Lighthouse có thể chấm theo mã HTTP; page.contact chưa có file, hCaptcha chạy tay; thêm ~11 URL tăng nguy cơ 429 (AC-H32); a11y error 1,0 làm CI đỏ nhiều lúc đầu.

## Quyết định
Chấp nhận, áp từ Sprint 2 (16/11). CTO đã chốt nội dung ở các ticket trên; PO chỉ ghi vào charter, CTO ký charter 0.2.
- Đẩy ra khỏi R1: TE-18, TE-19, TE-22-R2-FE3, TE-4-R2-FE7/BE7.
- Giữ: trang chủ, trang phụ (cuối Sprint 4), mọi task CHẶN ES1-T304, recent searches TE-8-R2-BE3.
- Vượt 300 giờ FE: cắt popup quiz TE-11-R2-FE1/BE1 → mở rộng TE-20 → TE-6-R2-FE4; không dời R1.

## Việc phải cập nhật
- Orchestrator: chép `drafts/po/ES1-T399/charter.md` (bỏ dòng KHÔNG CHẮC khi ES1-T418 trả lời) → `docs/charter.md` sau khi CTO ký.
- PO: PRD 0.2 — Should/Won't, chỉ số thành công theo NFR-1, bỏ "16/16 block" (ticket riêng).
- BA: SRS 0.5 sửa TE-10 AC5 "16/16 block", AC-H30/H31 "đủ 16 block" → theo index.md; requirements-map R7 thêm page.contact, quiz result.
- Tech Lead: `docs/architecture.md` dòng 8 bỏ "16 block"; task-split ES1-T307 đánh dấu task Should ngoài R1.
- QA/DevOps: checklist-canvas C2 bỏ "16"; test-strategy, checklist-theme-store R6.x theo NFR-1; lighthouserc theo ES1-T301 (DevOps); URL lhci thêm trang mới sau ES1-T419 (xem Tác động test).
- CTO: skill canvas-check bước 2 bỏ "16 block" (agent không sửa .claude/).
- Backlog: task Should cắt chuyển nhãn sau-R1, không xoá; 3 task FE sang Sprint 3.
