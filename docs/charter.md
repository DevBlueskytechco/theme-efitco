# Charter — theme-ember (tên tạm) · bản 0.1 · 22/10/2026 · Chủ: PO

## Mục tiêu đo được
1. Theme mở, sửa và publish được trong Shopify Canvas trên store thật ở tuần 11; 10 yêu cầu Sidekick mẫu đều cho ra theme check 0 lỗi.
2. Lighthouse trên home/product/collection: performance ≥ 96 desktop, ≥ 90 mobile; accessibility ≥ 98; bug P1/P2 = 0 khi lên Canvas.
3. Toàn bộ 9 vai trò có agent chạy nháp song song với người, tích ≥ 300 bản ghi eval đến tuần 12 (mục tiêu của chương trình team agent).

## Persona merchant
Chủ shop hàng thủ công / quà tặng, dưới 200 SKU, 1–3 người, tự sửa theme trong Canvas bằng Sidekick, không thuê dev. Khách mua trên mobile ≥ 70%.

## Phạm vi
Trong: 8 trang (home, collection, product, cart, search, blog, article, page/contact) từ Skeleton; 12 block trang chủ theo Figma Efitco T10; 1 preset (settings_data mặc định); tài liệu merchant cho Canvas.
Ngoài: app/app block, multi-market tuỳ biến, blog nâng cao, Theme Store listing, metaobject tuỳ chỉnh.

## Mốc
Tuần 0–2 chuẩn bị (G1 cuối tuần 0, G2 cuối tuần 1, G3 cuối tuần 2) · sprint 1 tuần 3–4 · sprint 2 tuần 5–6 · sprint 3 tuần 7–8 · sprint 4 tuần 9–10 · lên Canvas store thật tuần 11 · eval tuần 13–14. Cuối mỗi sprint: zip lên ember-canvas, checklist Canvas.

## Ngân sách giờ (người)
PO 40 · BA 80 · Tech Lead 100 · Designer 80 · Dev FE 220 · Dev BE 160 · QA 160 · DevOps 80 · Writer 60 = 980 giờ / 12 tuần. Token agent 2.000 USD/tháng.

## Stakeholder
CTO (ký G1, G5, quyết tranh chấp) · 9 role owner · 2 kỹ sư AI · 2 merchant quen (phỏng vấn, UAT).

## Rủi ro
1. Store không được bật Canvas early access → mục 1.2 chỉ làm được bước kiến trúc. Xử lý: xin bật trước tuần 0; không có thì kéo dài, không bỏ tiêu chí.
2. Skeleton đổi kiến trúc giữa chừng (đang là block-first, `{% partial %}` phụ thuộc `agentic_editor_enabled`). Xử lý: ghim commit, theo dõi repo hàng tuần, CR khi đổi.
3. Lighthouse 96 desktop khó với ảnh hero lớn. Xử lý: ngân sách hiệu năng ở ADR 0003, đo từ sprint 1.
4. Role owner không giữ 1 ngày/tuần. Xử lý: lịch cố định, CTO nhắc; kéo dài pha, không giảm số mẫu chấm.
5. Sidekick sửa phá cấu trúc. Xử lý: coi là bug P2 của theme (thiếu ràng buộc trong doc/schema), không coi là lỗi Sidekick.

## Tiêu chí thành công (G5)
Mục tiêu 1 và 2 đạt; tài liệu merchant đủ 12 block; CTO ký.
