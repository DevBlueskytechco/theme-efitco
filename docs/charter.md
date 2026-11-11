# Charter — theme-efitco · bản 0.2 · 11/11/2026 · Chủ: PO (bản 0.1: 22/10/2026)

Quyết định CTO 22/10/2026: (1) kiến trúc = Skeleton block-first, không sections/JSON template, `{% partial %}` cho vùng động; (2) dev store của team đã chạy chế độ Canvas, ADR 0002 giữ nguyên.
Quyết định CTO 27/10/2026 (từ kiểm kê Figma): giữ các block trang chủ như thiết kế, thêm TE-11..TE-13; Dev FE tự suy mobile; font heading Sofia Sans Condensed (có trong Shopify font library); xám chữ phụ nền sáng #6B6B6B đạt AA.
Bản 0.2 (CR phạm vi, ES1-T399, REQ-0002 BGĐ duyệt thiết kế 11/11): quyết định CTO 11/11 ở ES1-T301, ES1-T308, ES1-T309, ES1-T310, ES1-T311, ES1-T413 và comment CTO trên ES1-T304, ES1-T399. Đổi gì, vì sao: `drafts/po/ES1-T399/cr.md`.

## Mục tiêu đo được
1. R1: theme mở, sửa và publish được trong Shopify Canvas trên store thật tuần 11 (28/12/2026); 10 yêu cầu Sidekick mẫu đều cho ra theme check 0 lỗi; trang chủ giống Figma (TE-17 AC-H3, đo trên store dev đã cấu hình nội dung Figma).
2. Chỉ tiêu nghiệm thu NFR-1 (SRS 0.4), đo Lighthouse desktop và mobile trên demo store dev: Accessibility 100 và Best Practices 100 ở mọi trang đo (mặc định 14 template trong phạm vi, ES1-T419); SEO 100 ở home, collection, product, blog, article, page; Performance desktop ≥ 98, mobile ≥ 90. Best Practices ghi tách phần do theme và phần do nền tảng Shopify. Bug P1/P2 = 0 khi lên Canvas. Ngưỡng CI chặn merge (ES1-T301): perf desktop ≥ 0,96, mobile ≥ 0,9, accessibility 1,0; Best Practices warn 0,78; SEO warn 1.
3. Toàn bộ 9 vai trò có agent chạy nháp song song với người, tích ≥ 300 bản ghi eval đến tuần 12 (mục tiêu của chương trình team agent).

## Persona merchant
Chủ shop hàng thủ công / quà tặng, dưới 200 SKU, 1–3 người, tự sửa theme trong Canvas bằng Sidekick, không thuê dev. Khách mua trên mobile ≥ 70%.

## Phạm vi
Trong (R1):
- Trang (14 template): home (`index`), collection, list-collections, product, cart, search, blog, article, page, page.contact, 404, password, gift card (`gift_card`), quiz result (`collection.quiz`, `?view=quiz`). Mỗi trang theo `docs/ui-spec/*.md` trên develop 11/11, kể cả dòng ĐỀ XUẤT (ES1-T309 #1).
- Trang chủ theo Figma Efitco T10: block và thứ tự theo `docs/ui-spec/index.md`, `index-1280.md`, `index-mobile-a/b.md`; không chốt số block trong charter.
- Thành phần dùng chung: header/footer/navigation (menu 3 cấp, breadcrumb; TE-22 trừ mega menu ảnh/sản phẩm), announcement bar, localization, phân trang chung, lớp/consent (`layers.md`), cart drawer + quickview, predictive search + recent searches (TE-8-R2-BE3), tính năng Shopify trên PDP (rating từ metafield).
- Tuân thủ chuẩn Theme Store nội bộ: mọi task CHẶN của ES1-T304 (ES1-T401..T412).
- 1 preset (settings_data mặc định); nội dung mặc định trống (ADR 0011, ES1-T308 #1): không bậc giảm, không claim/mã giảm, không handle `figma-*`; nội dung Figma chỉ cấu hình trên store dev.
- Tài liệu merchant cho Canvas.
Ngoài R1:
- Nhóm Should cắt (CTO 11/11, ES1-T399): TE-18 popup marketing, TE-19 upsell giỏ hàng, TE-22-R2-FE3 mega menu ảnh/sản phẩm, TE-4-R2-FE7/BE7 B2B quantity rule + volume.
- Nộp Theme Store và listing; ảnh logo bên thứ ba, tên theme, URL docs/support, preset mang tên theme (ES1-T308 #2, ES1-T413).
- App/app block (kể cả vùng app review PDP, ES1-T308 #3); template `customers/*` cũ (dùng customer accounts mới); JSON template/section groups; multi-market tuỳ biến; metaobject tuỳ chỉnh; tính năng blog ngoài `blog.md`, `article.md`.

## Mốc
Tuần 0–2 chuẩn bị (G1 ký 30/10) · Sprint 1 tuần 3–4 (02–13/11) · Sprint 2 tuần 5–6 (16–27/11) · Sprint 3 tuần 7–8 (30/11–11/12) · Sprint 4 tuần 9–10 (14–25/12) · R1 lên Canvas store thật tuần 11 (28/12) · eval tuần 13–14. Trang phụ (blog, article, page, 404) xếp cuối Sprint 4. Kế hoạch DEV: `drafts/techlead/ES1-T307/task-split.md`; TE-7-R2-FE1, TE-2-R2-FE1, TE-17-R2-FE1 lùi sang Sprint 3 (CTO duyệt trên ES1-T304). Cuối mỗi sprint: zip lên yum-dev (store người, đã có Canvas), checklist Canvas.

## Ngân sách giờ (người) và token
PO 40 · BA 80 · Tech Lead 100 · Designer 80 · Dev FE 300 · Dev BE 160 · QA 160 · DevOps 80 · Writer 60 = 1.060 giờ / 12 tuần.
Dev FE nới +80 giờ (CTO 11/11): +27 giờ (ES1-T311, FE Must REQ-0002 vượt sức chứa 18 point) + 53 giờ (35 point × 1,5, phần FE ES1-T304). Quy đổi 1 point ≈ 1,5 giờ (ES1-T310 #4). FE Must Sprint 2–4 = 200 point ≈ 300 giờ. BE Must 97 point ≈ 146 giờ ≤ 160, không nới.
Vượt ngân sách FE: không xin nới tiếp; cắt theo thứ tự ES1-T311: (1) popup kết quả quiz TE-11-R2-FE1/BE1 (trang `?view=quiz` giữ), (2) phần mở rộng TE-20, (3) TE-6-R2-FE4 (list-collections giữ bản hiện có). Không cắt trang chủ, trang phụ, task CHẶN ES1-T304.
Token agent 2.000 USD/tháng; cảnh báo 80%, dừng 100%; chỉ CTO được nới.

## Stakeholder
Ban giám đốc: duyệt thiết kế 11/11 (REQ-0002).
CTO: Tony Pham — ký G1/G5 và charter 0.2, quyết tranh chấp, review 30 phút thứ Sáu; kiêm mọi vai trò khi role owner vắng.
Kỹ sư AI lead: Mr Trưởng Lead · Kỹ sư AI: Mr Khiêm (toàn thời gian từ 26/10).

Ngày cố định = ngày role owner chấm đầu ra agent (1 ngày/tuần, cả ngày). Xếp theo nhịp: thứ Hai tạo ticket → agent chạy → thứ Ba–Năm chấm → thứ Năm kỹ sư AI gom sửa → thứ Sáu review với CTO.

| Vai trò | Role owner | Ngày cố định/tuần | Kiêm (khi vắng) |
| --- | --- | --- | --- |
| PO | Mr PO | Thứ Hai (planning + chấm backlog/CR) | CTO |
| BA | Mr BA | Thứ Ba | CTO |
| Tech Lead | Mr Tech Lead | Thứ Năm (duyệt chia task, thẩm định PR) | CTO |
| Designer | Mr Designer | Thứ Ba | CTO |
| Dev FE | Mr Dev FE | Thứ Tư | CTO |
| Dev BE | Mr Dev BE | Thứ Tư | CTO |
| QA | Mr QA | Thứ Năm | CTO |
| DevOps | Mr DevOps | Thứ Ba | CTO |
| Tech Writer / Support | Mr Writer | Thứ Tư | CTO |

Quy ước kiêm: QA không kiêm Dev FE/BE; CTO kiêm thì chấm đúng rubric của vai đó, không tự nới ngưỡng.
Merchant phỏng vấn/UAT: Merchant 1, Merchant 2 (chốt tuần 0).

## Rủi ro
1. FE Must 200 point dồn Sprint 2 (74 point, 6 task CHẶN T401–T406 chạy trước). Xử lý: lùi 3 task sang Sprint 3; theo dõi burn FE cuối mỗi sprint; vượt thì cắt theo thứ tự ở mục Ngân sách, giữ R1 28/12.
2. Best Practices 100 (NFR-1) đo thực tế tối đa 0,78–0,79 do nền tảng Shopify (ES1-T277, ES1-T301). Xử lý: CI warn 0,78; nghiệm thu ghi tách theme/nền tảng, cách tính chờ ES1-T419; ticket BE sửa thứ tự nạp module rồi nâng lên error.
3. Performance desktop ≥ 98: base.css 232 KB nạp chặn render mọi trang (ES1-T310 #1). Xử lý: trần gzip ≤ 49 152 B, task FE xoá CSS cũ, TE-10-R2-FE3 rà CSS chết; lhci desktop < 98 do CSS thì mở ADR tách CSS theo template; đo từ Sprint 2.
4. Hành vi Canvas trên dev store (yum-dev) có thể khác store trả phí khi lên store thật tuần 11 (CTO 22/10). Xử lý: kiểm checklist Canvas mỗi sprint; kiểm lại trên store thật trước 28/12.
5. Skeleton đổi kiến trúc giữa chừng hoặc Sidekick sửa phá cấu trúc. Xử lý: ghim commit, theo dõi repo hàng tuần, CR khi đổi; lỗi cấu trúc do Sidekick coi là bug P2 của theme.

## Tiêu chí thành công (G5)
Mục tiêu 1 và 2 đạt; checklist Canvas 10/10; bug P1/P2 = 0; tài liệu merchant đủ mọi block trang chủ theo `docs/ui-spec/index.md` và mọi template trong phạm vi; CTO ký.

G1 — CTO Tony Pham ký 30/10/2026. Pha 0 đóng; Sprint 1 bắt đầu T2 02/11/2026.
Charter 0.2 — CTO ký: ______ ngày ______.
