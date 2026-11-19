---
title: Checklist Collection / Product List Page (PLP) – danh sách, thông tin card, thumbnail, tính năng, bộ lọc, sắp xếp (desktop + mobile)
type: Checklist
scope: Trang collection, trang kết quả tìm kiếm dạng list, product card, filter, sort trên desktop và mobile
source: Sheet "Collection", "Mobile" (phần PLP, Filtering & Sorting), "Hiểu và hành động đúng" mục filter (các file Excel); Baymard guidelines theo mã #xxxD / collections tz7qt0, ygjjor, vnxizq, jdzgoz, ry2piy, p8s4px, fpo214
---

# Checklist Collection / PLP

Ký hiệu: (Must/Rất cao, Cao, Trung bình, Thấp) = mức ưu tiên; AH/VH = tỷ lệ site lớn tuân thủ cao / vi phạm cao theo Baymard; "Audit" = trạng thái trên theme Purity khi đánh giá.

---

## 1. Collection list – cấu trúc danh sách

- [ ] #421D Gộp biến thể sản phẩm thành 1 item: sản phẩm nhiều màu/size/mùi chỉ hiển thị 1 lần, không lặp từng phiên bản (Cao; 47.4%). Giảm rối, tiết kiệm không gian.
- [ ] #2269D Dùng List View cho sản phẩm nhiều thông số kỹ thuật (laptop, điện tử) để hiển thị RAM, CPU, dung lượng (Trung bình).
- [ ] #2272D Dùng Grid View cho sản phẩm hình ảnh: 2–4 sản phẩm/row, ảnh lớn (Cao). Rất quan trọng với ngành visual.
- [ ] #533D Cho phép chuyển list ↔ grid nếu danh mục có sản phẩm hỗn hợp (Trung bình; 64.3%).
- [ ] #531D Hiển thị tổng số sản phẩm: "48 sản phẩm tìm thấy…" (Trung bình; 37.7% Low). Tăng cảm giác kiểm soát. Audit: đổi text "8 of 11 products" → "3 items found"; mobile đang ẩn phải show ra.
- [ ] #279D Không chèn banner quảng cáo bên thứ 3 giữa product card (Cao; 36.1%). Nếu có banner nội bộ: giao diện đồng bộ (màu, font, khoảng cách); không nhấp nháy/popup/che sản phẩm; không cản trở cuộn.
- [ ] #862D Không chia nhỏ danh sách theo nhóm con bên trong ("mới về", "sale" trong 1 danh mục) – để user tự lọc (Trung bình; 92.9%).
- [ ] #537D Breadcrumb phân cấp: Trang chủ > Danh mục > Sản phẩm (Trung bình; 78.5%).
- [ ] #536D Responsive upscaling: màn hình lớn tăng số cột/spacing thay vì giãn ảnh (Trung bình; 98.6%).
- [ ] #1024D Quay lại từ product page giữ đúng vị trí đang xem (đang trang 2, sản phẩm 17 → về đúng chỗ) (Cao; 80.4%).
- [ ] #2167D Tránh infinite scroll – không tự load khi scroll (Cao; chỉ 18.2% tuân thủ). Gây khó quay lại, SEO kém. Trang collection không nên setup dạng này.
- [ ] #501D Ưu tiên nút "Load More" / "Hiển thị thêm sản phẩm" (Cao; 48.9%). Giữ quyền kiểm soát cho user.
- [ ] #502D Số sản phẩm mỗi lần tải: Desktop 50–150 / Mobile 15–30 (Trung bình).
- [ ] #504D Pagination rõ ràng, dễ bấm trên mobile (Trung bình).
- [ ] Nên có sub collection trên collection page (tham khảo onilab ecommerce navigation).

## 2. Thông tin sản phẩm trên card

- [ ] #2284D Hiển thị điểm đánh giá trung bình (sao) trên mỗi sản phẩm (Cao; 42.6% VH, 47.1% VL).
- [ ] #2281D Hiển thị thuộc tính đặc thù theo ngành: RAM cho laptop, SPF cho mỹ phẩm, kích cỡ màn với TV (Cao; 25.6% AH). Audit: cần review lại.
- [ ] #2369D Báo "Hết hàng" ngay trong list nếu không có ngày giao dự kiến (Cao; 45.8%).
- [ ] #528D Nếu có ETA, ghi rõ "dự kiến về ngày X" (Trung bình; 11.1% AH). Audit: cần review; gắn metafield ETA hiển thị trong card.
- [ ] #443D Đồng bộ thuộc tính hiển thị cho cùng loại sản phẩm (tất cả áo thun đều hiển thị chất liệu) – tránh A có info, B không (Cao; 32.2% AH).
- [ ] #446D Hiển thị đơn giá (giá/đơn vị) cho sản phẩm bán theo bộ hoặc định lượng: "₫50.000/chai x 6", "120.000đ / 100ml" (Trung bình; 12.6% AH).
- [ ] #441D Hiển thị số lượng người đánh giá, không chỉ điểm: "⭐ 4.8 (52 đánh giá)" (Cao; 87.6% AH).
- [ ] #444D Hiển thị thương hiệu rõ nếu brand ảnh hưởng hành vi mua (thời trang, làm đẹp, điện tử) (Trung bình; 35.6%).
- [ ] #448D Các info trong card tách bạch: giá, tên, nhãn sale, rating dễ nhìn, không overload (Cao; 47.2% AH).
- [ ] #452D Luôn hiển thị giá trong danh sách, kể cả hết hàng/đặt trước; không ẩn giá đến khi click (Rất cao).
- [ ] Mobile: tên sản phẩm đủ chi tiết để phân biệt – mô tả dòng sản phẩm, công dụng, dung tích, phân loại. Ví dụ: "Vitamin C Serum 15% – Sáng da – 30ml" (Cao; 64% vi phạm). Audit: Purity tên khá ngắn, cần thêm công dụng/loại da/dung tích.
- [ ] Mobile: giá nổi bật, gần tên, cỡ chữ đủ lớn; nếu khuyến mãi hiển thị cả giá cũ, mới và % giảm (Rất cao; 52% vi phạm).
- [ ] Mobile: bố cục card đồng nhất (ảnh, tên, giá, đánh giá) để so sánh nhanh khi cuộn (Rất cao; 71% vi phạm).
- [ ] Mobile: thumbnail đủ lớn để phân biệt hình dạng, bao bì mà không phải bấm vào (Cao; 58% vi phạm). Xem xét 2 item/row trên mobile.

## 3. List item thumbnails

- [ ] #455D Luôn có thumbnail cho mọi sản phẩm; cùng kích thước; có ảnh fallback khi lỗi (Rất cao; 86.5% AH). Không ảnh → giảm trust.
- [ ] #445D Thumbnail thể hiện rõ số lượng với sản phẩm bán theo bộ: 1 sản phẩm hay combo (3 lọ serum) (Cao; 52.8% AH, 26.8% VH). Mobile: dùng ảnh chứa đủ thành phần hoặc label "x2", "Pack of 4", "Set of 4" (overlay khi upload hoặc metafield + custom badge); bổ sung số lượng trong tiêu đề nếu cần ("Combo dưỡng da – Set 3 món").
- [ ] #482D Thay đổi thumbnail theo màu đã chọn trong bộ lọc: lọc "đầm đỏ" → ảnh phải là màu đỏ (Cao; 87.7% AH). Audit: Purity chưa hỗ trợ (82% site vi phạm).
- [ ] #457D Tránh ảnh gây hiểu lầm: đúng sản phẩm, không bị cắt, không ảnh mẫu khác (Cao; 62.8% VH). Audit: cần review lại ảnh sản phẩm.
- [ ] #456D Tối ưu ảnh cho sản phẩm visual: thể hiện rõ chất liệu, kiểu dáng với thời trang/mỹ phẩm (Cao; 51.8% AH).
- [ ] #2323D Minh hoạ phụ kiện đi kèm trong ảnh nếu phụ kiện là yếu tố mua (Thấp). Mobile: cập nhật ảnh đại diện gồm cả phụ kiện hoặc metafield label "+ Phụ kiện" (81% vi phạm).
- [ ] #2840D Nên có 3+ thumbnail: xem thêm ảnh khi hover hoặc swipe (Trung bình). Cách hiển thị desktop: (1) hover → hiện ảnh thứ 2 (phổ biến, chỉ 1 ảnh); (2) hover → mini-slider 3 ảnh trong card (Sephora, Zara, Uniqlo); (3) 3 ảnh nhỏ dạng thumbnail strip dưới ảnh chính (mỹ phẩm, nội thất). Nên áp dụng cho thời trang, mỹ phẩm, nội thất, sản phẩm nhiều chi tiết, cạnh tranh cao. Lưu ý: Sephora, Amazon chấp nhận hy sinh ảnh trong list để tăng tốc tải, giữ layout gọn, mobile-first → làm option bật/tắt. Audit: tích hợp slider trong product-card.
- [ ] Mobile: nếu có nhiều ảnh phải báo hiệu vuốt được (dot, mũi tên, label, hiệu ứng swipe nhẹ) (Cao; 91% vi phạm).
- [ ] Mobile: image gallery không loop.

## 4. List item features

- [ ] #2372D Cập nhật thumbnail khi chọn swatch màu trên card (Cao; 14.3% AH). Nếu ảnh không đổi, người dùng nghĩ màu không tồn tại. Audit mobile: Purity chưa hỗ trợ (82% vi phạm).
- [ ] #2366D Hiển thị tất cả swatch màu trên desktop (Cao; 81.8% AH). Mobile: đầy đủ swatch dưới ảnh, vuốt ngang nếu nhiều (88% vi phạm; Purity chưa có).
- [ ] #450D Luôn dùng swatch màu thay vì text "Đỏ" (Cao; 22.1% AH).
- [ ] #2375D Wishlist cho khách chưa đăng nhập: icon ❤ với guest, lưu tạm local hoặc login sau (Trung bình; 30.6% AH). Audit: chưa có.
- [ ] #447D Badge làm nổi bật ưu đãi: Best Seller, Sắp hết hàng, Mới về (Trung bình; 38.9% AH). Dùng chọn lọc. Audit: mới có sale %, Pre-order, Buy 1 get 1 → thêm New, Best seller.
- [ ] #529D Quick View: popup chi tiết khi click "Xem nhanh" (Trung bình; 60.5% AH). Mobile: Purity chưa có → dùng modal "slide up" hoặc full screen lightbox; tích hợp Swiper/GlideJS xem ảnh; metafield tuỳ chỉnh nội dung. Lưu ý lỗi audit: mở quick view sản phẩm sau bị lưu hành vi sản phẩm trước; sắp xếp lại layout quick view như product detail; khi scroll có sticky add to cart.
- [ ] #484D Đánh dấu sản phẩm đã có trong giỏ: badge hoặc đổi nút "Đã thêm vào giỏ" (Trung bình; 85% AH). Audit: chưa có; gợi ý đổi màu background icon Cart.
- [ ] #495D Cho phép so sánh sản phẩm kỹ thuật: tick chọn → bảng so sánh specs (Cao; 40.3% AH). Audit: thêm thuộc tính compare ngay trên product khi user bật compare.
- [ ] #2142D Bảng so sánh dễ đọc: zebra rows hoặc sticky header; check mobile (Trung bình).
- [ ] #2145D Dữ liệu so sánh đầy đủ, không để trống (Cao; 63% VH). Bảng trống gây mất tin tưởng.
- [ ] #2148D Giải thích thông số kỹ thuật bằng tooltip ("RAM ảnh hưởng đến tốc độ") (Trung bình).
- [ ] Mobile: nút "Thêm vào giỏ" ngay trong PLP cho sản phẩm mua lặp lại hoặc giá thấp, không biến thể phức tạp (Trung bình–Cao; 76% vi phạm).

## 5. Filtering – các bộ lọc cần có

- [ ] #1167D Bắt buộc có lọc Giá, Đánh giá, Màu, Size, Brand trong hầu hết danh mục (Rất cao; 42.2% AH). Mobile: hỗ trợ chọn nhiều tuỳ chọn cho từng nhóm.
- [ ] #409D Bộ lọc đặc thù theo ngành: skincare → loại da, thành phần, loại sản phẩm, sở thích, size ml; thời trang → chất liệu, kiểu dáng (Cao; 43.6% AH). Audit: Purity dùng Shopify Search & Discovery nên filter mặc định cho mọi collection; merchant phải cấu hình per-collection → cần hướng dẫn chi tiết và preset theo ngành.
- [ ] #408D Bộ lọc theo triệu chứng/vấn đề: da khô, mụn, nám, rụng tóc (Trung bình; Rất cao với health/beauty; 90% vi phạm). Audit: chưa có; nên cung cấp preset.
- [ ] #417D Lọc theo trạng thái sản phẩm: Mới ra mắt, Sắp có hàng, Còn hàng, chỉ online (Trung bình; 78.5% AH). Audit: cần merchant cấu hình tag/metafield (in_stock, coming_soon) → cần hướng dẫn.
- [ ] #410D Lọc theo người nhận: quà cho mẹ, bạn gái, con nhỏ, đồng nghiệp (Trung bình; 74.3% AH). Audit: chưa có.
- [ ] #416D Lọc giá nhập tay min/max, không chỉ slider (Trung bình; 37.1% AH). Audit mobile: có ô "từ – đến" mặc định nhưng không nhập được.
- [ ] #415D Lọc "Mới về" (Trung bình; 21.4% AH). Dựa tag hoặc ngày đăng.
- [ ] #1191D Lọc sản phẩm khuyến mãi / combo deal (Trung bình). Mobile: filter riêng hiển thị SP có compare_at_price > price; hoặc thêm page Sale. Audit: chưa có, cần hướng dẫn merchant tạo filter bằng tag/metafield.

## 6. Filtering – scope & logic

- [ ] #427D Multi-select trong 1 filter: chọn Màu đỏ + Đen cùng lúc (Rất cao; 89.5% AH).
- [ ] #433D Giải thích filter chuyên ngành: tooltip/dấu hỏi cho SPF, DPI, non-comedogenic (Cao; 33.3% AH; 94% site vi phạm). Audit: chưa có.
- [ ] #428D Loại bỏ filter trùng với danh mục đã chọn: đang ở "Áo sơ mi" không cần filter "Loại: Áo sơ mi" (Trung bình; 66.1% AH). Audit: chưa có.
- [ ] #429D AND/OR logic chuẩn: AND giữa các loại filter, OR trong mỗi loại (Rất cao; 95.8% AH). Audit: cần review.
- [ ] #436D Tránh filter trùng (Nike/NiKE…): chuẩn hoá tên, không đồng nghĩa, không khác viết hoa (Cao; 75.8% AH). Audit: Purity dùng tag/metafield của merchant → cần cảnh báo và hướng dẫn quản lý filter từ dữ liệu gốc.
- [ ] #488D Hiển thị filter đang áp dụng: "Bạn đang lọc theo: Size M, Màu đỏ…" (Cao; 51% AH). Mobile: applied filters dễ thấy, xoá nhanh (Rất cao; 61% vi phạm). Audit: thêm số lượng filter đang áp dụng cạnh text "Filter"; thêm button Clear all dưới Apply.
- [ ] #492D Nút Back trình duyệt hoàn tác filter/sort gần nhất (Trung bình; 64.8% AH).
- [ ] #493D Không reset filter khi reload, back, phân trang, quay lại từ PDP (Rất cao; 96.8% AH). Audit mobile: Purity (Shopify mặc định) không giữ → lưu filter vào URL hoặc localStorage.
- [ ] #486D Cập nhật kết quả ngay khi chọn filter, không cần nút "Áp dụng" trên desktop (Cao).
- [ ] #517D Sort theo đánh giá phải tính cả số lượt đánh giá, hiển thị cả điểm và số lượng (Cao; 88% vi phạm). Audit: chưa có.

## 7. Filtering – interface & layout

- [ ] #474D Đẩy filter quan trọng (Giá, Màu, Size, Brand, Đánh giá) lên đầu (Trung bình; 86.1% AH). Audit: cần review.
- [ ] #470D Rút gọn filter dài > 4–8 giá trị: hiển thị 4–8 tuỳ chọn + "Xem thêm" (Cao; 68.9% AH). Audit: cần sửa.
- [ ] #467D Hiển thị số lượng sản phẩm cho từng lựa chọn, cập nhật động theo điều kiện lọc; nếu = 0 làm mờ hoặc ẩn (Rất cao; 60.1% AH).
- [ ] #479D Luôn dùng checkbox cho tuỳ chọn filter, không link/nút đơn (Rất cao).
- [ ] Mobile: nút "Lọc" dễ thấy, có icon, đặt đầu trang hoặc sticky; không ẩn (Cao; 48% vi phạm).
- [ ] Mobile: nút "Áp dụng" sticky trong panel filter, không ẩn khi cuộn (Rất cao; 78% vi phạm).
- [ ] Mobile: đường dẫn đến Lọc và Sắp xếp rõ, icon rõ (Rất cao; 59% vi phạm).
- [ ] Mobile: ô tìm kiếm trong bộ lọc dài (Rất cao; 67% vi phạm). Audit: Purity chưa có.
- [ ] Mobile: filter làm sticky như Shopee; sort làm dạng popup; menu, cart, filter, search nên full page; filter drawer trái 90% có icon x, style ngang như Fashion Nova (kết luận benchmark).
- [ ] Giới hạn value để người dùng có cái nhìn tổng quan: danh sách filter ≤ 7 options.

## 8. Sorting

- [ ] #510D Sắp xếp mặc định theo đa dạng: pha trộn giá rẻ, mới, bán chạy, đánh giá tốt; tránh toàn sản phẩm giống nhau (Cao; 73.3% AH). Audit: Shopify mặc định Best-selling, không có thuật toán đa dạng → đặt mặc định pha trộn hoặc merchant điều chỉnh thủ công.
- [ ] #511D Bắt buộc 4 lựa chọn sort: Giá, Mới nhất, Đánh giá, Bán chạy (Rất cao; 54.6% VH). Audit: Shopify mặc định chỉ Giá, Best-selling, Alphabetical → thiếu Newest/Rating, cần bổ sung hướng dẫn hoặc tích hợp nâng cao.
- [ ] #513D Dùng "Price: Low to High" thay thuật ngữ khó hiểu (Cao; 82.9% AH).
- [ ] #521D Dropdown phản ánh sort hiện tại sau khi chọn (Trung bình; 47.5% AH). Audit: cần sửa.

## 9. Lưu ý bổ sung từ NN/g cho PLP

- Danh mục có cả bộ lọc, tìm kiếm, sản phẩm liên quan (trang danh mục kết hợp) linh hoạt hơn nhưng cần test kỹ.
- Filter đặt tên theo cách người dùng nghĩ ("dành cho da dầu", "chất liệu cotton"), không theo admin; không thuật ngữ chuyên ngành; sắp theo mức phổ biến.
- Không reload trang quá sớm hoặc đổi vị trí khi lọc; phản hồi ngay khi chọn/bỏ filter.
- Mỗi sản phẩm khác biệt (áo sơ mi vs áo phông) có trang riêng; biến thể (màu, size) cùng một trang; ảnh riêng cho từng biến thể; tồn kho theo biến thể.
- Phương án thay thế phân trang: Load More (ưu tiên e-commerce); infinite scroll chỉ cho "sản phẩm bạn có thể thích"; phân trang tích hợp trong cuộn dài.
