# Charter — theme-efitco · bản 0.1 · 22/10/2026 · Chủ: PO

Quyết định CTO 22/10/2026: (1) kiến trúc = Skeleton block-first, không sections/JSON template, `{% partial %}` cho vùng động; (2) dev store của team đã chạy chế độ Canvas, ADR 0002 giữ nguyên.
Quyết định CTO 27/10/2026 (từ kiểm kê Figma): giữ 16 block như thiết kế, thêm TE-11..TE-13; Dev FE tự suy mobile; font heading Sofia Sans Condensed (có trong Shopify font library); xám chữ phụ nền sáng #6B6B6B đạt AA.

## Mục tiêu đo được
1. Theme mở, sửa và publish được trong Shopify Canvas trên store thật ở tuần 11; 10 yêu cầu Sidekick mẫu đều cho ra theme check 0 lỗi.
2. Lighthouse trên home/product/collection: performance ≥ 96 desktop, ≥ 90 mobile; accessibility ≥ 98; bug P1/P2 = 0 khi lên Canvas.
3. Toàn bộ 9 vai trò có agent chạy nháp song song với người, tích ≥ 300 bản ghi eval đến tuần 12 (mục tiêu của chương trình team agent).

## Persona merchant
Chủ shop hàng thủ công / quà tặng, dưới 200 SKU, 1–3 người, tự sửa theme trong Canvas bằng Sidekick, không thuê dev. Khách mua trên mobile ≥ 70%.

## Phạm vi
Trong: 8 trang (home, collection, product, cart, search, blog, article, page/contact) từ Skeleton; 16 block trang chủ theo Figma Efitco T10 (CTO 27/10 giữ 4 block tương tác); 1 preset (settings_data mặc định); tài liệu merchant cho Canvas.
Ngoài: app/app block, multi-market tuỳ biến, blog nâng cao, Theme Store listing, metaobject tuỳ chỉnh.

## Mốc
Tuần 0–2 chuẩn bị (G1 cuối tuần 0, G2 cuối tuần 1, G3 cuối tuần 2) · sprint 1 tuần 3–4 · sprint 2 tuần 5–6 · sprint 3 tuần 7–8 · sprint 4 tuần 9–10 · lên Canvas store thật tuần 11 · eval tuần 13–14. Cuối mỗi sprint: zip lên yum-dev (store người, đã có Canvas), checklist Canvas.

## Ngân sách giờ (người) và token
PO 40 · BA 80 · Tech Lead 100 · Designer 80 · Dev FE 220 · Dev BE 160 · QA 160 · DevOps 80 · Writer 60 = 980 giờ / 12 tuần. Token agent 2.000 USD/tháng; cảnh báo 80%, dừng 100%; chỉ CTO được nới.

## Stakeholder
CTO: Tony Pham — ký G1/G5, quyết tranh chấp, review 30 phút thứ Sáu; kiêm mọi vai trò khi role owner vắng.
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
1. Quyết định CTO 22/10: pha 0–1 không dùng store thật; kiểm chứng Canvas trên dev store yum-dev (đã bật Canvas) bằng cách upload zip tay. Rủi ro: hành vi dev store có thể khác store trả phí khi lên merchant thật → ghi nhận, kiểm lại ở pha 2.
2. Skeleton đổi kiến trúc giữa chừng (đang là block-first, `{% partial %}` phụ thuộc `agentic_editor_enabled`). Xử lý: ghim commit, theo dõi repo hàng tuần, CR khi đổi.
3. Lighthouse 96 desktop khó với ảnh hero lớn. Xử lý: ngân sách hiệu năng ở ADR 0003, đo từ sprint 1.
4. Role owner không giữ 1 ngày/tuần. Xử lý: lịch cố định, CTO nhắc; kéo dài pha, không giảm số mẫu chấm.
5. Sidekick sửa phá cấu trúc. Xử lý: coi là bug P2 của theme (thiếu ràng buộc trong doc/schema), không coi là lỗi Sidekick.

## Tiêu chí thành công (G5)
Mục tiêu 1 và 2 đạt; tài liệu merchant đủ 16 block; CTO ký.
