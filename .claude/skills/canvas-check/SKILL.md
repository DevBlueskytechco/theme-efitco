---
name: canvas-check
description: Checklist 5 bước kiểm chứng theme trong Shopify Canvas trên store ember-canvas (custom theme). Dùng cuối mỗi sprint và tuần 11.
---
Tiền đề: DevOps người đã upload zip (`scripts/upload-to-canvas.sh`) và đưa link theme trong Canvas vào ticket. Agent không có quyền trên ember-canvas; QA Agent viết kịch bản + chấm kết quả từ ảnh/ghi chú người thực hiện, hoặc tự thực hiện nếu được cấp browser.
1. Mở được trong Canvas; toàn bộ template hiện trong khung nhìn toàn trang; không template nào lỗi render.
2. 12 block trang chủ hiện đúng thứ tự Figma inventory; đổi text trực tiếp trong preview được; đổi setting trong panel được, phản ánh ngay.
3. Sidekick 3 yêu cầu mẫu (sprint) / 10 yêu cầu (tuần 11): đổi bố cục hero; thêm block testimonial; đổi màu nút; thêm block mới; đổi font; bỏ block; đổi ảnh; sửa text; đổi menu; tạo trang mới. Ghi thời gian từng yêu cầu và kết quả.
4. Sau mỗi yêu cầu Sidekick: duplicate theme → tải bằng CLI nếu được, hoặc đọc code trong Canvas; `shopify theme check` 0 lỗi; cấu trúc vẫn đúng `skeleton-structure` (không sections/, không JSON template).
5. Ghi `docs/checklist-canvas.md` kết quả; yêu cầu nào Sidekick làm sai/phá cấu trúc → bug P2 của theme, truy về block/story.
