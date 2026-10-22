# PRD — theme-efitco · bản 0.1

## Vấn đề
Merchant nhỏ muốn tự dựng và sửa cửa hàng bằng Sidekick trong Canvas; theme bán sẵn chưa vào được Canvas (chỉ theme Shopify và custom theme). Cần một theme xây đúng kiến trúc Skeleton để Sidekick sửa tốt, đẹp theo thiết kế Efitco T10, nhanh và accessible.

## Người dùng
- Merchant: sửa theme trong Canvas (text trực tiếp, settings, nhờ Sidekick); không đọc code.
- Khách: mua trên mobile; cần tìm, lọc, xem biến thể, thêm giỏ, checkout không reload.

## Tính năng (MoSCoW → story)
Must: khung + token (TE-1); hero + rich text (TE-2); featured collection + card swatch (TE-3); product page biến thể/gallery/add to cart (TE-4); cart drawer partial (TE-5); collection filter/sort (TE-6); chuẩn chất lượng + Canvas (TE-10).
Should: testimonials/FAQ/image-with-text/multicolumn (TE-7); predictive search (TE-8); preset + trang phụ (TE-9).
Could: countdown (CR dự kiến sprint 3); blog nâng cao.
Won't: app blocks, wishlist, multi-market UI tuỳ chỉnh.

## Chỉ số thành công
Lighthouse 96/90/98; checklist Canvas 10/10 tuần 11; thời gian Sidekick hoàn thành mỗi yêu cầu mẫu ≤ 3 phút; bug P1/P2 = 0; tài liệu merchant 12/12 block.

## Ràng buộc
Skeleton block-first (AGENTS.md); không sections, không JSON template; Canvas early access; không phụ thuộc app; token Figma trong giới hạn Shopify (font_picker, ≥ 4 màu).

## Câu hỏi mở
Tên theme chính thức; cart drawer hay cart page mặc định (đề xuất drawer + page fallback); số cột collection mặc định mobile (đề xuất 2).
