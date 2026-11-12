KHÔNG CHẮC: (1) Đường bấm tạo automatic discount trong Shopify admin chưa có trong nguồn được phép, nên mục "Tạo automatic discount" chỉ ghi thông số cần khớp, không ghi menu. Đã có ticket hỏi CTO: ES1-T429. (2) Mặc định bậc giảm: code hiện là bundle builder 2 món 10%, 3 món 15%, 5 món 0%; shop the look 4 món 10%, còn lại 0%. Kế hoạch REQ-0002 (ES1-T308 #1) nói theme mới cài trống, bậc giảm 0. Bảng settings dưới đây chép theo schema hiện tại; đổi mặc định thì sửa cột Mặc định cùng PR. (3) Locale có nhãn "Discount note" và câu ghi chú mặc định, nhưng `blocks/bundle-builder.liquid` và `blocks/shop-the-look.liquid` hiện chưa có setting này và chưa in ghi chú. Chưa tài liệu hóa; bổ sung sau khi hai block được viết lại (CTO 11/11). (4) Chưa chụp được ảnh preview: `mcp__store-dev__screenshot` báo thiếu STORE_PASSWORD trong môi trường Orchestrator.

# Bundle builder và Shop the look

Dùng để: cho khách chọn nhiều sản phẩm rồi thêm vào giỏ một lần (Bundle builder), hoặc mua trọn một bộ sản phẩm gắn với một ảnh (Shop the look).

## Đọc trước: bậc giảm chỉ là hiển thị

Theme không đổi giá trong giỏ. Các bậc giảm trong block chỉ để hiển thị dòng giảm, thanh tiến độ và tổng tạm tính cho khách xem. Giá khách trả ở giỏ và checkout đến từ Shopify automatic discount do merchant tạo trong admin.

Hệ quả:
- Chỉ có bậc giảm trong block mà không có automatic discount tương ứng: khách thấy giảm giá trên trang nhưng checkout không giảm. Đó là quảng cáo giảm giá sai (R8).
- Trước khi publish, làm một trong hai: tạo automatic discount thật khớp bậc giảm, hoặc đặt phần trăm bậc đó về 0 (bậc 0% bị tắt, block không hiện dòng giảm, thanh tiến độ cho bậc đó).
- Đổi một bên thì đổi bên kia. Đổi số món hoặc phần trăm trong block thì sửa automatic discount cho cùng số món, cùng phần trăm. Đổi collection nguồn thì sửa phạm vi collection của discount.

## Tạo automatic discount khớp bậc giảm

Discount phải khớp block ở ba thông số:

| Thông số | Lấy từ block | Ví dụ |
| --- | --- | --- |
| Ngưỡng số lượng | Tier n items needed | Tier 2 items needed = 3 → discount áp từ 3 món |
| Phần trăm | Tier n discount | Tier 2 discount = 15 → giảm 15% |
| Collection | Collection (Bundle builder) | Discount áp lên đúng collection mà block lấy sản phẩm |

Mỗi bậc đang lớn hơn 0% cần một automatic discount riêng. Khi có hai bậc (ví dụ 10% và 15%), bậc cao nhất phải thắng: 3 món ra 15%, không cộng 10% + 15%. Đo lại ở giỏ sau khi tạo.

Với Shop the look, collection của discount phải chứa các sản phẩm đặt trong các row, vì block này chọn sản phẩm theo từng row, không theo collection.

Các bước bấm trong admin: KHÔNG CHẮC, chưa có nguồn được phép. Chờ CTO trả lời ES1-T429.

Danh sách kiểm tra chung trước publish (nội dung mẫu, tag quiz, v.v.) nằm ở tài liệu của ES1-T193; file này không lặp lại.

## Thêm vào trang (Canvas)

Bundle builder: mở Canvas → nhờ Sidekick "thêm Bundle builder vào home page dưới hero" hoặc chọn block Bundle builder trên home page → chọn Collection → chỉnh chữ → đặt Discount tiers.

Shop the look: mở Canvas → nhờ Sidekick "thêm Shop the look vào home page" → chọn Image → thêm từng "Shop the look row" và chọn Product cho mỗi row → đặt vị trí Hotspots → đặt Discount tiers.

Block được đặt trong template, không thêm từ danh sách block của editor. Muốn thêm hoặc bớt row thì nhờ Sidekick sửa template.

## Settings: Bundle builder

| Tên | Ý nghĩa | Mặc định |
| --- | --- | --- |
| Eyebrow | Dòng chữ nhỏ phía trên tiêu đề | Build your bundle |
| Heading | Tiêu đề h2 | Pick Your Kit, Save As You Go |
| Link label | Chữ của link góc phải. Xóa trống thì ẩn link | View Preset Bundles |
| Link | Đích của link. Để trống thì đi tới trang mọi sản phẩm | Trống |
| Collection | Nguồn sản phẩm. Hiện 9 sản phẩm đầu của collection | Trống |
| Tier 1 items needed | Số món để đạt bậc 1 (2 đến 9) | 2 |
| Tier 1 discount | Phần trăm bậc 1 (0 đến 50). 0 là tắt | 10 |
| Tier 2 items needed | Số món để đạt bậc 2 (2 đến 9) | 3 |
| Tier 2 discount | Phần trăm bậc 2 (0 đến 50). 0 là tắt | 15 |
| Tier 3 items needed | Số món để đạt bậc 3 (2 đến 9) | 5 |
| Tier 3 discount | Phần trăm bậc 3 (0 đến 50). 0 là tắt | 0 |

Tên nhóm trong editor: "Discount tiers". Dòng info của nhóm: "Tiers are display only. Create an automatic discount in Shopify admin with the same quantities and percentages, or customers won't get this price at checkout. A tier at 0% is off."

### Sản phẩm trong Bundle builder

- Chọn Collection: block lấy tối đa 9 sản phẩm đầu của collection, theo thứ tự collection. Info trong editor: "Shows the first 9 products. On the home page, all products show when no collection is selected."
- Collection trống: trên home page, block lấy collection `all`. Ở trang khác, block không có nguồn nên ẩn trên storefront; trong editor hiện dòng hướng dẫn chọn collection.
- Chỉ dùng variant mặc định của sản phẩm (variant đầu tiên còn hàng). Không có ô chọn variant. Sản phẩm nhiều variant vẫn chỉ thêm được một variant.
- Sản phẩm hết hàng (sản phẩm hoặc variant mặc định hết): vẫn hiện trong lưới với nhãn "Sold out", không chọn được, không tính vào số món và tổng. Tên sản phẩm vẫn link tới trang sản phẩm.
- Khách chọn bằng ô tick trên thẻ. Nút "Add Bundle To Cart" chỉ hiện khi có ít nhất 1 món được chọn.
- Chưa bật JavaScript: form vẫn thêm các món đã tick vào giỏ. Panel tổng, dòng giảm và thanh tiến độ cần JavaScript.

## Settings: Shop the look

| Tên | Ý nghĩa | Mặc định |
| --- | --- | --- |
| Eyebrow | Dòng chữ nhỏ phía trên tiêu đề | Shop this setup |
| Heading | Tiêu đề h2 | A Complete Corner Gym, Itemised |
| Link label | Chữ của link góc phải. Xóa trống thì ẩn link | Browse All Setups |
| Link | Đích của link. Để trống thì đi tới trang mọi sản phẩm | Trống |
| Image | Ảnh lớn có hotspot. Để trống thì ẩn ảnh và hotspot, các row chiếm toàn chiều rộng | Trống |
| Note title | Tiêu đề ghi chú bên cạnh ảnh. Để trống cả title và text thì ẩn ghi chú | Fits: 2.4×2.0 m |
| Note text | Nội dung ghi chú | Folds flat when you're done. |
| Note icon | Icon trong vòng tròn cạnh ghi chú. Để trống thì dùng icon mặc định | Trống |
| Tier 1 items needed | Số món để đạt bậc 1 (2 đến 6) | 4 |
| Tier 1 discount | Phần trăm bậc 1 (0 đến 50). 0 là tắt | 10 |
| Tier 2 items needed | Số món để đạt bậc 2 (2 đến 6) | 5 |
| Tier 2 discount | Phần trăm bậc 2 (0 đến 50). 0 là tắt | 0 |
| Tier 3 items needed | Số món để đạt bậc 3 (2 đến 6) | 6 |
| Tier 3 discount | Phần trăm bậc 3 (0 đến 50). 0 là tắt | 0 |
| Hotspot 1 horizontal position | Vị trí ngang chấm 1, % từ mép trái ảnh | 85 |
| Hotspot 1 vertical position | Vị trí dọc chấm 1, % từ mép trên ảnh | 15 |
| Hotspot 2 horizontal position | Vị trí ngang chấm 2 | 27 |
| Hotspot 2 vertical position | Vị trí dọc chấm 2 | 68 |
| Hotspot 3 horizontal position | Vị trí ngang chấm 3 | 78 |
| Hotspot 3 vertical position | Vị trí dọc chấm 3 | 64 |
| Hotspot 4 horizontal position | Vị trí ngang chấm 4 | 46 |
| Hotspot 4 vertical position | Vị trí dọc chấm 4 | 58 |

Nhóm "Hotspots", info trong editor: "Dots on the image, measured from its top left corner. Each dot links to the row with the same number and hides when that row is empty. Rows 5 and 6 have no dot."

### Shop the look row

Mỗi row là một block con "Shop the look row".

| Tên | Ý nghĩa | Mặc định |
| --- | --- | --- |
| Product | Sản phẩm của row. Dùng variant đầu tiên còn hàng. Để trống thì ẩn row | Trống |

### Row và tổng trong Shop the look

- Tối đa 6 row. Template quyết định số row; muốn nhiều hơn 6 là không được.
- Mỗi row dùng variant mặc định, không có ô chọn variant. Khách không chọn từng row: nút "Add Setup To Cart" thêm mọi row còn hàng.
- Row hết hàng: vẫn hiện với nhãn "Sold out", không được thêm vào giỏ, không tính vào số món và tổng.
- Row 1 đến 4 có hotspot trên ảnh; row 5 và 6 không có. Hotspot ẩn khi row cùng số không có sản phẩm.
- Panel tổng: số món, tạm tính, dòng giảm (chỉ khi có bậc lớn hơn 0 và số món đạt ngưỡng), tổng. Dòng giảm là hiển thị, giống Bundle builder: giá thật ở checkout phụ thuộc automatic discount.
- Không row nào có sản phẩm: block ẩn trên storefront; trong editor hiện dòng hướng dẫn.

## Ảnh chụp

Chưa có. Cần 1 ảnh desktop, 1 ảnh mobile cho mỗi block, đặt trong `drafts/writer/ES1-T150/`. Chụp lại khi Orchestrator có STORE_PASSWORD.

## Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Bundle builder không hiện trên storefront | Collection trống hoặc collection không có sản phẩm, và block không ở home page | Chọn Collection có sản phẩm |
| Shop the look không hiện | Chưa row nào có Product | Chọn Product cho ít nhất 1 row |
| Một row không hiện | Product của row trống | Chọn Product |
| Khách thấy "giảm 10%" nhưng giỏ không giảm | Chưa có automatic discount khớp, hoặc ngưỡng, phần trăm, collection khác block | Tạo hoặc sửa discount cho khớp; hoặc đặt Tier n discount về 0 |
| Chọn đủ món nhưng không thấy dòng giảm | Bậc đó đang 0%, hoặc số món chưa tới "Tier n items needed" | Kiểm tra Tier n discount và Tier n items needed |
| Hotspot lệch khỏi sản phẩm | Vị trí tính theo % từ góc trên trái của ảnh | Chỉnh Hotspot n horizontal position và vertical position |
| Sản phẩm không chọn được | Sản phẩm hoặc variant mặc định hết hàng | Nhập kho hoặc chọn sản phẩm khác |
| Khách thấy báo lỗi khi thêm vào giỏ ("We couldn't add your bundle to the cart. Check your cart and try again.") | Yêu cầu thêm vào giỏ thất bại; nguyên nhân chưa có trong nguồn | Khách kiểm tra giỏ và thử lại; merchant kiểm tồn kho các món |

## Câu hỏi hay gặp

Theme có tự giảm giá không? Không. Theme chỉ hiển thị bậc giảm. Giá khách trả đến từ automatic discount trong admin.

Khách chọn variant khác (màu, size) được không? Không. Cả hai block chỉ dùng variant mặc định. Cần chọn variant thì khách vào trang sản phẩm qua link tên sản phẩm.

Hiển thị tối đa bao nhiêu sản phẩm? Bundle builder 9 sản phẩm đầu của collection. Shop the look 6 row.

Muốn tắt giảm giá thì làm sao? Đặt Tier n discount về 0 cho mọi bậc, và tắt hoặc xóa automatic discount tương ứng trong admin.

Nội dung mẫu (eyebrow, heading, ghi chú, phần trăm) là gì? Chữ mặc định để xem thử. Thay trước khi mở store cho khách thật. Phần trăm mẫu có thể sai so với chương trình của bạn.

Khi nào đổi automatic discount? Mỗi lần đổi Tier n items needed, Tier n discount hoặc Collection trong block.
