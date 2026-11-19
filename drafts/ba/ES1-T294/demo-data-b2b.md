KHÔNG CHẮC: (1) B2B (company, catalog, quantity rules, volume pricing) và combined listing là tính năng Shopify Plus; chưa biết store dev hoa-qua-nhap-khau (efitco-ai-dev) bật được không → ES1-T297 #1. (2) Unit price chỉ hiện trong Admin khi quốc gia store hỗ trợ → DevOps kiểm ô "Unit price" ở D6 trước. (3) Tên menu Admin và cột CSV viết theo Admin tại thời điểm viết; Admin đổi nhãn thì làm theo nhãn mới, giữ đúng giá trị. (4) Giá volume pricing, giá biến thể D3, tên địa điểm D8, mã D10 là ĐỀ XUẤT của BA, CTO đổi được.

# ES1-T294 — Đề xuất dữ liệu demo: B2B, selling plan, > 250 biến thể, countdown, gift card, unit price, sản phẩm số, pickup

Người làm: DevOps (CTO duyệt), chỉ trên store `hoa-qua-nhap-khau` (efitco-ai-dev). Agent không tạo dữ liệu, không chạm yum-dev hay store khách (`.claude/rules/no-production.md`).
Nguồn: ES1-T294 mục 2, CTO audit (4) trong `docs/design/decisions.md`, ES1-T282, comment Designer ES1-T288 trên ES1-T294, `docs/design/demo-data.json` (xuất 09/11), `tests/e2e/store-data.json`.

Quy tắc chung:
- Sản phẩm MỚI: không gắn tag `figma`, `quiz-*`, `new`, không thêm vào collection `figma-*`. Lý do: `templates/index.liquid` đọc `figma-tab-all`, `figma-bundle`, `figma-setup`, `figma-ativafit-lava-featured`; thêm vào đó làm lệch trang chủ so với Figma (AC-H1, AC-H2).
- Sản phẩm `figma-*` CÓ SẴN chỉ được thêm thuộc tính không đổi giá bán lẻ và không đổi thứ tự (selling plan có mua một lần, quantity rule chỉ áp cho khách B2B, pickup, metafield).
- `tests/e2e/store-data.json`: key cũ không đổi (TE-9 AC4); key mới ở mục cuối. Email, mật khẩu khách test chỉ để ở biến môi trường/secret, không ghi vào repo.
- Làm xong mỗi mục: chạy lại `export_demo_data.py` để `docs/design/demo-data.json` có dữ liệu mới, comment kết quả "Kiểm xong" lên ticket DevOps.

## Bảng tổng

| # | Dữ liệu | Sản phẩm (handle) | Phục vụ AC | Cách tạo | Cần Plus |
| --- | --- | --- | --- | --- | --- |
| D1 | Quantity rule min 6 / max 120 / bước 6 + volume pricing 24+, 60+; 1 company + 1 khách B2B | Training Mat 12 mm (`figma-training-mat-12mm`) | TE-4 AC18, TE-5 AC9, TE-3 AC10 | Admin: Customers > Companies; Products > Catalogs | có |
| D2 | Selling plan "Subscribe and save" 3 plan 1/2/3 tháng −10%; 1 sản phẩm chỉ bán theo subscription | Resistance Band Set (`figma-resistance-band-set-pro`); MỚI `demo-subscription-only` | TE-4 AC19, TE-5 AC10, TE-3 AC10 | App Shopify Subscriptions (miễn phí, của Shopify) | không |
| D3 | Sản phẩm 304 biến thể, 3 option, 1 option 40 giá trị, có tổ hợp không tồn tại và giá trị hết hàng | MỚI `demo-many-variants` | NFR-7, TE-4 AC13–AC16, TE-3 AC10 | CSV import hoặc Admin GraphQL `productSet` | không |
| D4 | Metafield `custom.sale_ends_at` (date_time) | `figma-ativafit-lava-adjustable`, `figma-ativafit-lava-featured`, `sale-gia-nhỏ`, `figma-iron-core-kettlebell` | TE-4 AC17, TE-13 AC1, AC-H23, TE-18 AC6 | Admin: Settings > Metafields and metaobjects | không |
| D5 | Gift card có form người nhận | `gift-card-2` (có sẵn) | TE-4 AC6, R4.4 | kiểm cấu hình, không tạo mới | không |
| D6 | Unit price có số đo | `unit-price` (có sẵn) | TE-3 AC4, TE-4 AC2, TE-5 AC1, R4.16 | Admin: sửa biến thể, mục Unit price | không |
| D7 | Sản phẩm số (không cần giao hàng) | `sản-phẩm-số` (có sẵn) | TE-4 AC9 | kiểm cấu hình biến thể | không |
| D8 | 3 địa điểm local pickup, 1 địa điểm hết hàng | Iron Core Kettlebell 16 kg (`figma-iron-core-kettlebell`) | TE-4 AC4, R4.10 | Admin: Settings > Locations; Shipping and delivery > Local pickup | không |
| D9 | Combined listing: 1 sản phẩm cha, 3 sản phẩm con theo màu | MỚI `demo-combined-parent` + 3 con | ngoài AC 0.3 (comment Designer ES1-T288), ES1-T297 #6 | App Shopify Combined Listings | có |
| D10 | Mã giảm giá popup | mã `WELCOME15` | TE-18 AC5 | Admin: Discounts | không; chờ ES1-T297 #2 |

## D1. Quantity rules + volume pricing (B2B)

Dữ liệu (theo comment Designer ES1-T288 (4)):
- Company: "Efitco Demo Gym", 1 location "Efitco Demo Gym – Main", không điều khoản thanh toán, checkout không chuyển thành draft order.
- Khách B2B: 1 customer gán vào location trên; email là hộp thư QA đọc được (khách đăng nhập bằng mã một lần gửi về email, theo tài khoản mới của Shopify, sổ 10/11). Email do CTO cấp, lưu trong secret `TE4_B2B_CUSTOMER_EMAIL`.
- Catalog: "Efitco B2B Demo", gán location trên, điều chỉnh giá 0%, chỉ gồm Training Mat 12 mm ($69.00 bán lẻ).
- Quantity rule biến thể: Minimum 6, Maximum 120, Increment 6.
- Volume pricing (ĐỀ XUẤT giá): 24+ → $62.10 / cái (−10%), 60+ → $58.65 / cái (−15%).

Cách tạo:
1. Admin > Customers > Companies > Add company: nhập tên company, location, gán customer.
2. Admin > Products > Catalogs > Create catalog: gán location của company; Products: thêm Training Mat 12 mm.
3. Trong catalog, ở dòng biến thể: Quantity rules (Minimum 6, Maximum 120, Increment 6); Volume pricing: thêm bậc 24 → 62.10, 60 → 58.65.
4. Không bật được B2B (không có mục Companies): dừng, ghi lên ES1-T297.

Kiểm xong:
- Khách thường (không đăng nhập) mở `/products/figma-training-mat-12mm`: không có min/max/bước, không bảng bậc; thêm 1 cái được.
- Khách B2B đăng nhập: thêm 5 cái → lỗi; thêm 6 → thành công; thêm 126 → lỗi; giỏ 24 cái → giá dòng $62.10 / cái; 60 cái → $58.65 / cái.

## D2. Selling plan (subscription)

Dữ liệu (theo comment Designer ES1-T288 (3)):
- Plan group "Subscribe and save" gắn Resistance Band Set (`figma-resistance-band-set-pro`, $45.00): 3 plan "Deliver every 1 month", "Deliver every 2 months", "Deliver every 3 months", mỗi plan giảm 10% ($40.50). Vẫn bán mua một lần (không đổi trang chủ, bundle, quiz).
- Sản phẩm MỚI `demo-subscription-only`, tiêu đề "Resistance Band Set Subscription", $45.00, 1 biến thể, ảnh dùng lại ảnh Resistance Band Set, chỉ bán theo subscription (`requires_selling_plan` = true), cùng plan group trên.

Cách tạo:
1. Admin > Apps > cài "Shopify Subscriptions" (Shopify phát hành, miễn phí).
2. Trong app: Create subscription plan: tên "Subscribe and save", tần suất 1, 2, 3 tháng, giảm 10%; thêm 2 sản phẩm.
3. Sản phẩm mới: Admin > Products > Add product, rồi trong mục Purchase options chọn chỉ bán theo subscription. Admin không có tuỳ chọn này: dùng Admin GraphQL `productUpdate` với `requiresSellingPlan: true` (DevOps chạy, có xác nhận).

Kiểm xong:
- `/products/figma-resistance-band-set-pro.js`: `selling_plan_groups` có 1 nhóm, 3 plan; `requires_selling_plan` = false.
- `/products/demo-subscription-only.js`: `requires_selling_plan` = true.
- Thêm giỏ kèm plan 1 tháng: cart page hiện tên plan, giá $40.50.
- Key cũ `TE4_SELLING_PLAN_HANDLE` (`amazing-aluminum-bag-collection10`) giữ nguyên.

## D3. Sản phẩm > 250 biến thể (2048 biến thể, ES1-T282)

Dữ liệu (mở rộng ma trận ES1-T282 để vượt 250, giữ nguyên phần Black, Gray mà mockup đang dùng):
- Handle `demo-many-variants`, tiêu đề "Adjustable Dumbbell Variant Test", vendor Efitco.
- Option 1 Weight: 5 lb → 200 lb, bước 5 (40 giá trị). Option 2 Pack: Single, Pair. Option 3 Color: Black, Gray, Red, Blue (4 giá trị có swatch màu).
- Tổ hợp: 40 × 2 × 4 = 320. Không tạo Pair ở 5, 10, 195, 200 lb (4 × 4 màu = 16 tổ hợp không tồn tại) → 304 biến thể.
- Hết hàng (tồn 0, không bán khi hết): mọi biến thể 25 lb, 50 lb, 150 lb (3 × 2 × 4 = 24 biến thể). Còn lại tồn 10.
- Giá (ĐỀ XUẤT): Single = $20 + $1.50 × lb (vd 45 lb = $87.50); Pair = 2 × Single − $10.
- Thứ tự tạo: Weight ngoài cùng, rồi Pack, rồi Color → tổ hợp 190 lb / Pair / Blue nằm sau vị trí 250 (dùng cho TE-4 AC16).
- Ảnh: 4 ảnh theo màu, gán ảnh biến thể theo Color.

Cách tạo (chọn 1):
1. CSV: Admin > Products > Export 1 sản phẩm mẫu để lấy đúng tên cột của store, rồi tạo file 304 dòng: Handle, Title (dòng đầu), Option1 Name/Value, Option2 Name/Value, Option3 Name/Value, Variant Price, Variant Inventory Tracker = shopify, tồn kho theo location, Variant Inventory Policy = deny, Variant Requires Shipping = TRUE. Admin > Products > Import.
2. Admin GraphQL `productSet` (chế độ bất đồng bộ khi nhiều biến thể), DevOps chạy, có xác nhận.
Không tạo tay từng biến thể trong Admin (304 dòng).

Kiểm xong:
- Admin hiện 304 biến thể.
- `/products/demo-many-variants?variant=<id 190 lb / Pair / Blue>`: giá $600.00 (Pair = 2 × (20 + 1.5 × 190) − 10 = 2 × 305 − 10), còn hàng.
- Chọn Pair khi Weight = 5 lb: giá trị Pair ở trạng thái không tồn tại; Weight 25 lb: hết hàng.

## D4. Metafield `custom.sale_ends_at` (countdown)

Định nghĩa: Admin > Settings > Metafields and metaobjects > Products > Add definition: Name "Sale ends at", Namespace and key `custom.sale_ends_at`, Type "Date and time", một giá trị. Bật truy cập Storefront nếu Admin có tuỳ chọn.

Gán giá trị (giờ store):

| Sản phẩm | Giá trị | Kiểm AC |
| --- | --- | --- |
| `figma-ativafit-lava-adjustable` ($379.99, gạch $499.99) | 2026-12-31 23:59 | TE-4 AC17: 4 ô (≥ 24 giờ) |
| `figma-ativafit-lava-featured` (featured product, Big Offer) | 2026-12-31 23:59 | TE-13 AC1, TE-18 AC6 |
| `sale-gia-nhỏ` ($0.99, gạch $1.99) | QA đặt trước mỗi lượt chạy: lúc chạy + 30 phút (ca < 24 giờ, < 1 giờ), rồi lúc chạy − 1 giờ (ca quá hạn); trả lại rỗng sau lượt | TE-4 AC17, AC-H23 |
| `figma-iron-core-kettlebell` ($119.00, không giá gạch) | 2026-12-31 23:59 | TE-4 AC17: có ngày nhưng không giá gạch → không có countdown |

Kiểm xong: trang sản phẩm của 4 handle hiện hoặc ẩn countdown đúng cột "Kiểm AC". Ngày 31/12/2026 hết hạn thì DevOps đẩy sang năm sau.

## D5. Gift card có form người nhận

Có sẵn `gift-card-2` (Denominations $10, $25, $50, $100). Form người nhận do theme render (TE-4 AC6), không cần app.
Kiểm: Admin > Settings > Gift cards đang bật; `gift-card-2` là sản phẩm gift card, đang hiện trên kênh Online Store. Không tạo mới.

## D6. Unit price

Sản phẩm có sẵn `unit-price` (Color: Green, Gold, Brown). Đặt cho từng biến thể (Admin > Products > `unit-price` > biến thể > Unit price, "Total amount" và "Base unit"):

| Biến thể | Tổng số đo | Đơn vị cơ sở | Unit price hiển thị (giá $234.00) |
| --- | --- | --- | --- |
| Green | 50 kg | 1 kg | $4.68 / kg |
| Gold | 25 kg | 1 kg | $9.36 / kg |
| Brown | 10 kg | 1 kg | $23.40 / kg |

Biến thể có giá khác $234.00 thì unit price = giá / số đo. Không thấy mục Unit price trong Admin: ghi lên ES1-T297 (quốc gia store không hỗ trợ).
Kiểm: card collection, trang sản phẩm, dòng giỏ hiện unit price đúng bảng.

## D7. Sản phẩm số

Có sẵn `sản-phẩm-số` (Operating system: iOS, Fire OS, FreeBSD). Kiểm mọi biến thể đã bỏ chọn "This is a physical product" (`requires_shipping` = false). Trang sản phẩm không có pickup, không có dòng vận chuyển (TE-4 AC9).

## D8. Local pickup (comment Designer ES1-T288 (1))

Dữ liệu (ĐỀ XUẤT tên, thời gian; địa chỉ US hợp lệ do DevOps chọn):

| Địa điểm | Thành phố | Usually ready in | Tồn Iron Core Kettlebell 16 kg (mỗi màu) |
| --- | --- | --- | --- |
| Efitco Studio Downtown | San Francisco, CA | 1 hour | 5 |
| Efitco Warehouse North | Oakland, CA | 24 hours | 12 |
| Efitco Pop-up Store | San Jose, CA | 2 hours | 0 (hết hàng) |

Cách tạo:
1. Admin > Settings > Locations > Add location (tên, địa chỉ, số điện thoại), bật "Fulfill online orders from this location".
2. Admin > Settings > Shipping and delivery > Local pickup: bật cho 3 địa điểm, chọn "Usually ready in" như bảng, thêm pickup instructions 1 câu.
3. Sản phẩm Iron Core Kettlebell 16 kg: nhập tồn theo bảng cho từng địa điểm.

Kiểm: `/products/figma-iron-core-kettlebell`: dòng pickup hiện địa điểm gần nhất còn hàng; danh sách địa điểm có 3 dòng, Pop-up Store ghi không có hàng. Key cũ `TE4_PICKUP_HANDLE` (`apparel`) giữ nguyên.

## D9. Combined listing (chỉ khi store có Plus, ES1-T297 #6)

Dữ liệu: sản phẩm cha `demo-combined-parent` "Training Mat Combined", 3 sản phẩm con MỚI theo màu (Black, Gray, Blue), mỗi con 1 biến thể $69.00. App Shopify Combined Listings: tạo listing, option Color trỏ tới 3 con.
Kiểm: trang cha chọn Blue → chuyển sang URL sản phẩm con Blue. Không có AC trong SRS 0.3; Designer dùng để vẽ ca `value.product_url` (product.md §17).

## D10. Mã giảm giá popup (chờ ES1-T297 #2; mặc định nếu im lặng tới 12/11)

Admin > Discounts > Create discount > Amount off order: mã `WELCOME15`, 15%, mọi khách, không yêu cầu tối thiểu, "Limit to one use per customer", không cộng dồn, không ngày hết hạn. Theme setting "Discount code" của `exit-popup` mặc định rỗng; chỉ trên store dev nhập `WELCOME15` trong editor để QA kiểm TE-18 AC5.
Kiểm: checkout đơn đầu với `WELCOME15` giảm 15%; lần 2 cùng khách bị từ chối.

## Key mới đề xuất cho `tests/e2e/store-data.json` (DevOps/QA thêm, không sửa key cũ)

| Key | Giá trị |
| --- | --- |
| `TE4_B2B_QTY_HANDLE` | `figma-training-mat-12mm` |
| `TE4_SELLING_PLAN_GROUP_HANDLE` | `figma-resistance-band-set-pro` |
| `TE4_SELLING_PLAN_REQUIRED_HANDLE` | `demo-subscription-only` |
| `TE4_MANY_VARIANTS_HANDLE` | `demo-many-variants` |
| `TE4_SALE_ENDS_HANDLE` | `figma-ativafit-lava-adjustable` |
| `TE4_SALE_ENDS_SHORT_HANDLE` | `sale-gia-nhỏ` |
| `TE4_SALE_ENDS_NO_COMPARE_HANDLE` | `figma-iron-core-kettlebell` |
| `TE4_PICKUP_MULTI_HANDLE` | `figma-iron-core-kettlebell` |
| `TE4_COMBINED_PARENT_HANDLE` | `demo-combined-parent` (chỉ khi D9 làm được) |

Secret (không vào repo): `TE4_B2B_CUSTOMER_EMAIL`.
