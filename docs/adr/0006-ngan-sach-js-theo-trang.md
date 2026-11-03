KHÔNG CHẮC: làm rõ cách đo ngân sách JS của ADR 0002/0003, chờ CTO chấp nhận ở ES1-T60 #4.

# 0006. Ngân sách JS 40 KB đo theo trang, không theo tổng assets/*.js
Ngày: 2026-11-03 | Trạng thái: Đề xuất (bổ sung ADR 0002, 0003; nguồn ES1-T59)

## Bối cảnh
- ADR 0002 ghi "tổng JS ≤ 40 KB", ADR 0003 ghi "JS ≤ 40 KB", không nói đo theo trang hay toàn theme. DoD TE-3 (ES1-T52) kiểm `assets/*.js` tổng tối đa 40 960 B.
- Hiện có 5 file 22 207 B (header-menu 6 862, header-sticky 1 680, liquid-tips 1 170, product-swatch 4 438, slideshow 8 057). TE-4 cần 4 file tối đa 21 504 B → tổng 43 711 B, vượt; còn TE-5 cart drawer, TE-6 filter, TE-8 predictive search, TE-11..13 chưa tính.
- Lighthouse (NFR-1, ngưỡng 96/90/98) đo theo trang; mỗi file JS chỉ nạp trong block dùng nó (ADR 0002, `type="module"`).

## Lựa chọn đã cân nhắc
- A. Giữ tổng assets/*.js tối đa 40 KB — dễ đo bằng 1 lệnh; buộc gộp/cắt tính năng của TE-4..TE-13, mâu thuẫn "1 tính năng 1 file". Loại.
- B. 40 KB = JS do theme nạp trên 1 trang (trang chủ, sản phẩm, collection, cart, search), mỗi file vẫn tối đa 8 KB — khớp cách Lighthouse đo, theme mở rộng được; cần script đo theo trang. Chọn.
- C. Bỏ trần tổng, chỉ giữ 8 KB/file — đơn giản; không chặn được trang nạp quá nhiều file. Loại.

## Quyết định
B. Ngân sách 40 960 B cho tổng `assets/*.js` mà HTML 1 trang tham chiếu (thẻ script `type="module"` + import tĩnh), không tính script của Shopify (content_for_header, payment_button, model-viewer qua Shopify.loadFeatures). Mỗi file tối đa 8 192 B. Chia task ghi bảng ngân sách theo trang (TE-4: docs trong drafts/techlead/ES1-T59/task-split.md D9).

## Hệ quả
Tốt: TE-4..TE-13 giữ 1 tính năng 1 file; Lighthouse vẫn là cổng chặn. Xấu: lệnh `wc -c assets/*.js` không còn đủ; trang nạp nhiều block (trang chủ) phải cộng theo block. Việc: DevOps thêm bước CI đo JS theo URL (tải trang preview, cộng `transferSize` các script từ `assets/`), tới khi có thì DoD ghi phép cộng tay theo file. Đo: CI theo URL; lhci performance từ 96/90.
