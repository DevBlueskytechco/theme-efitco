# ES1-T193 tự kiểm tra

Đầu ra: `docs/merchant/pre-publish.md`.

KHÔNG CHẮC: block `exit-popup` và label "Discount code" chưa có trong repo; đường bấm admin chưa có trong nguồn (ES1-T429); code ngày 12/11 chưa theo ADR 0011.

Kiểm:
- AC-H33 đủ 4 mục bắt buộc: thay nội dung mẫu (mục 1), discount thật khớp bậc (mục 2), tag quiz (mục 3), Verified (mục 4); thêm Shopify Email và "Discount code" (mục 5), block ẩn tới khi chọn tài nguyên (mục 6).
- Label: đọc toàn bộ `locales/en.default.schema.json`, mọi label trong tài liệu có trong file, trừ "Discount code" (đã gắn KHÔNG CHẮC).
- Đối chiếu `blocks/*.liquid`: block thiếu info nhắc nội dung mẫu ghi ở bug ES1-T430 (FE). Block đạt: faq, faq-item, testimonials, testimonial-item, slideshow-slide, image-with-text, quiz-step, level-card.
- Không hứa theme tự giảm giá: mục 2 nói rõ theme chỉ hiển thị; mục "Câu hỏi hay gặp" nói "Không".
- Không lặp ES1-T150: trỏ `docs/merchant/bundle-builder.md`.
- Không có ảnh chụp: tài liệu việc trước publish, không phải một block (skill yêu cầu cho tài liệu block).
- Chưa làm: PO đọc xác nhận câu chữ về giảm giá (DoD).

Câu hỏi mở: ES1-T429 (CTO). Bug: ES1-T430 (FE); bổ sung: collection-list "Heading" mặc định "Browse Categories" cũng thiếu info.
