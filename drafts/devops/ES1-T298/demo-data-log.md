# ES1-T298: log nhập dữ liệu demo store dev (12/11/2026)

Store: `hoa-qua-nhap-khau.myshopify.com` (Efitco, gói Basic, partner development, `shopifyPlus: false`, tiền USD, giờ store America/New_York). Gọi Admin API 2026-10 bằng `shopify store execute`. Script: `gql.py`, `b2b.py`, `many.py`, `content.py`, `articles.py`, `menu.py`, `customers.py` cùng thư mục. Danh sách id ở `created-ids.tsv`. Lượt 2 (cùng ngày, sau khi CTO cấp thêm scope): selling plan, location pickup, gift card, đơn hàng, policies; script `sp.py`, `loc.py`, `gc.py`, `orders.py`.
Không đụng theme, không xoá gì. Không sửa giá, tiêu đề, tag, thứ tự của sản phẩm hay collection `figma-*`, `te*`, edge case. Với đối tượng có sẵn chỉ thêm giá trị vào chỗ đang rỗng, ghi rõ dưới đây.

## 1. B2B (D1): KHÔNG bật được
- Đã tạo: company `Efitco Demo Gym` (`gid://shopify/Company/16119726177`) và location `Efitco Demo Gym – Main` (`gid://shopify/CompanyLocation/16956194913`, 500 Howard St, San Francisco CA, checkoutToDraft false), cùng price list `Efitco B2B Demo` (`gid://shopify/PriceList/30828429409`, 0%).
- Chặn ở `catalogCreate`, thử cả ACTIVE lẫn DRAFT, cùng lỗi: `UNPERMITTED_ENTITLEMENTS_DIRECT_CATALOG_ASSIGNMENT: "Catalogs assigned to company locations can't be set to active with your plan."`. Không có catalog thì không có quantity rule (min 6 / max 120 / bước 6) và volume pricing (24+ $62.10, 60+ $58.65). Dừng ở đây, không tìm cách vòng.
- Chưa gán khách B2B: email lấy từ secret `TE4_B2B_CUSTOMER_EMAIL` (CTO cấp), agent không có.
- Company và price list nằm im, không ảnh hưởng storefront. CTO muốn dọn thì xoá tay trong Admin.

## 2. Combined listing (D9): KHÔNG bật được
- `productCreate` có `combinedListingRole: PARENT` (`demo-combined-parent`) bị từ chối: `"Cannot specify 'combinedListingRole'. Combined listings are not included with your plan."` (BAD_REQUEST). Không tạo sản phẩm cha hay con nào.

## 3. Sản phẩm > 250 biến thể (D3): ĐÃ TẠO
- `demo-many-variants` "Adjustable Dumbbell Variant Test" (`gid://shopify/Product/9554445762657`), vendor Efitco, ACTIVE, đã publish Online Store, không tag, không vào collection nào.
- Options Weight (5–200 lb, 40 giá trị) × Pack (Single, Pair) × Color (Black, Gray, Red, Blue). Có **304 biến thể** (không có Pair ở 5, 10, 195, 200 lb). 24 biến thể hết hàng (25, 50, 150 lb: tồn 0, policy DENY), số còn lại tồn 10 ở "Shop location".
- Giá: Single = 20 + 1.5 × lb, Pair = 2 × Single − 10. 4 ảnh theo màu, mỗi biến thể có ảnh theo Color. Metafield `custom.swatch_colors` = `#3c3c3c,#9a9a9a,#c62828,#1e4fd8`.
- Đã kiểm: biến thể `190 lb / Pair / Blue` = `gid://shopify/ProductVariant/50344659714145`, ở vị trí 296 (sau 250), giá $600.00, còn hàng; `25 lb / Single / Black` hết hàng.
- Ghi chú: tiêu đề ticket nói "2048 biến thể", D3 chốt 304 (> 250, dưới giới hạn 2048). Làm theo D3.

## 4. Metafield `custom.sale_ends_at` (D4): ĐÃ TẠO
- Definition `gid://shopify/MetafieldDefinition/459802280033`, date_time, storefront PUBLIC_READ.
- Gán `2026-12-31T23:59:00-05:00` cho `figma-ativafit-lava-adjustable`, `figma-ativafit-lava-featured` (featured product / big offer), `figma-iron-core-kettlebell` (không có giá gạch, nên không được hiện countdown). Trước đó 3 sản phẩm này chưa có metafield này.
- `sale-gia-nhỏ` để trống theo D4 (QA tự đặt trước mỗi lượt chạy, rồi trả về rỗng).
- Ngày 31/12/2026 hết hạn thì phải đẩy sang năm sau.

## 5. Mã giảm giá WELCOME15 (D10): ĐÃ TẠO
- `gid://shopify/DiscountCodeNode/1322345758817`: giảm 15% cả đơn, mọi khách, không yêu cầu tối thiểu, mỗi khách dùng 1 lần, không cộng dồn, không hết hạn, bắt đầu 12/11.
- Mã giảm giá cơ bản của Shopify không có điều kiện "đơn đầu tiên". Bản này làm theo D10 (1 lần mỗi khách). Đơn #1004 của khách demo buyer đã dùng mã này. Muốn ép đúng "đơn đầu" thì phải dùng customer segment `number_of_orders = 0`, nhưng khi đó khách vãng lai không dùng được mã. Chưa làm, CTO quyết.
- Không đổi setting theme (Discount code của `exit-popup` vẫn rỗng).

## 6. Reviews metafield (T264): LÀM MỘT PHẦN
- Đã có từ trước: `figma-ativafit-lava-featured` và `te13-featured` có rating 4.9 / 341; `figma-ativafit-lava-adjustable` và `figma-flexfold-adjustable-bench` có rating 5.0, không có count. Không sửa mấy giá trị này.
- Mới: `demo-many-variants` có `reviews.rating` 4.6/5 và `reviews.rating_count` 27.
- Không thêm rating cho sản phẩm `figma-*` khác. Lý do: product card hiện sao khi có metafield (AC-H13), mà Figma trang chủ chỉ có rating trên những card đang có. Thêm nữa sẽ làm lệch trang chủ so với Figma.
- App review (danh sách review, form Write a review): xem mục "Cần CTO làm tay".

## 7. Ảnh collection (T265, T271): ĐÃ GÁN
- 8 collection trước đó chưa có ảnh: `figma-cat-free-weights` → efx-col-1, `figma-cat-functional-training` → efx-col-2, `figma-cat-benches-racks` → efx-col-3, `figma-cat-recovery-mobility` → efx-col-4, `figma-cat-accessories` → efx-col-5, `figma-level-beginner` → efx-lvl-1, `figma-level-intermediate` → efx-lvl-2, `figma-level-advanced` → efx-lvl-3. Gán giống ảnh mà `templates/index.liquid` đang truyền cho collection-card / level-card, nên trang chủ không đổi.
- Filter Search & Discovery: phải làm trong app, xem mục cần làm tay.

## 8. Pages (T266, T268): ĐÃ TẠO
- `our-story` (`gid://shopify/Page/139245355105`): copy Figma 1:1018–1:1020 và 1:1001–1:1007. Có đủ phần tử RTE: h2, h3, p, ảnh efx-why, ul, ol, blockquote, link.
- `our-efitco` (`gid://shopify/Page/139245420641`): có bảng và ảnh.
- `faqs` (`gid://shopify/Page/139245453409`): 5 câu hỏi lấy theo locale `faq_item`.
- `contact` có sẵn (`gid://shopify/Page/99575332961`), không sửa.
- `main-menu` hiện có Our Story và Help đang trỏ `/pages/contact`. KHÔNG sửa main-menu. Menu mới (mục 11) trỏ đúng trang.

## 9. Blog (T266, T267): ĐÃ TẠO 6 bài, bật bình luận có duyệt
- Blog `figma-blog`, tên hiện tại "Training Tips". Không đổi tên vì blog đang dùng cho trang chủ.
- Bài thứ 5 "How to choose the right adjustable dumbbell" (`figma-choose-adjustable-dumbbell`, tag Articles) đã có sẵn. Blog có 5 bài, tác giả "Efitco".
- Thêm 6 bài, blog lên **11 bài**, bài nào cũng có tag, excerpt (summary), body nhiều đoạn, ảnh, tác giả "Efitco Coach Team": `demo-kettlebell-basics` (Exercises), `demo-small-space-routine` (Featured), `demo-protein-timing` (Diet plans), `demo-mobility-mornings` (Exercises), `demo-choose-training-mat` (Articles), `demo-recovery-week` (Featured). Ngày đăng 21–31/10/2026, cũ hơn 5 bài Figma, nên block blog-posts trang chủ (mặc định 5 bài mới nhất) không đổi.
- 5 bài `figma-*` có sẵn: summary rỗng, KHÔNG thêm. Lý do: không sửa bài trang chủ đang dùng; theme tự cắt body khi thiếu excerpt.
- `figma-blog` commentPolicy: CLOSED → MODERATED (T267 đề xuất bật bình luận có duyệt). Đây là thay đổi duy nhất trên setting blog có sẵn. Muốn trả lại thì Admin > Content > Blogs > Training Tips > Comments.
- Bình luận mẫu: Admin API không có mutation tạo bình luận (chỉ có approve/spam/delete), nên chưa có bình luận nào. Xem mục cần làm tay.

## 10. Tồn kho (T266): chỉ đọc, không đổi
- 24 sản phẩm `figma-*` không theo dõi tồn (`tracked: false`), nên luôn còn hàng. Edge case có tồn thật, ví dụ `hết-hang-toan-bộ` = 0, `unit-price` = 19.
- `demo-many-variants` có tồn thật (10 / 0), dùng được để test filter Availability.

## 11. Menu 3 cấp (T271): ĐÃ TẠO menu mới
- `main-menu-3-level` (`gid://shopify/Menu/236762562657`):
  - Shop (catalog) > Categories > 5 `figma-cat-*`, Training Level > 3 `figma-level-*`, Featured > `figma-bundle`, `figma-setup`, `figma-tab-portable-fitness`, `figma-tab-weight`.
  - Collection (/collections) > 5 `figma-cat-*`.
  - Sale (/collections/figma-tab-all), Our Story (page our-story), Blog (figma-blog), Contact (page contact), Help (page faqs).
- `main-menu` (header dùng mặc định, đang dùng để đo trang chủ) giữ nguyên 2 cấp. Muốn xem mega menu 3 cấp: trong editor chọn menu `main-menu-3-level` cho header của theme test, không phải theme đo trang chủ.

## 12. Gift card (D5, T268): ĐÃ PHÁT HÀNH (lượt 2)
- `gift-card-2` đã đúng: `isGiftCard: true`, 4 mệnh giá, đang trên Online Store.
- Thẻ $50 `gid://shopify/GiftCard/516850024545` (4 ký tự cuối b6g8), hết hạn 2027-12-31, gán Jamie Rivera, đang bật.
- Thẻ $25 `gid://shopify/GiftCard/516850057313` (cuối 9aaf), hết hạn 2027-12-31, gán Jamie Rivera, đã deactivate.
- Mã đầy đủ để ở `out/giftcard-codes.txt` (scratchpad, không ghi vào log).
- Thẻ đã hết hạn: API không cho đặt ngày quá khứ, nên không tạo.

## 13. Khách hàng, địa chỉ, đơn (T270)
- Khách demo buyer, Jamie Rivera (`gid://shopify/Customer/10262413738081`): 2 địa chỉ, mặc định 500 Howard St (San Francisco), địa chỉ còn lại 1 Market St (Oakland). Tag `demo-t298`.
- Khách demo empty, Alex Nguyen (`gid://shopify/Customer/10262413901921`): 0 đơn, 0 địa chỉ.
- Email 2 khách là hộp thư giả, không nhận được mã đăng nhập. Muốn xem /account thì CTO đổi sang hộp thư QA đọc được.
- Đơn của Jamie (lượt 2: tạo draft order rồi complete, tag `es1-t298`, ship Standard $12.00, thuế $0):
  - #1001 `gid://shopify/Order/6920852930657`: Kettlebell Black + Training Mat 12 mm, $200.00, đã thanh toán (mark as paid). **Chưa giao được**: đọc `fulfillmentOrders` bị `Access denied for fulfillmentOrders field.` (thiếu scope `read/write_merchant_managed_fulfillment_orders`), nên không gọi được `fulfillmentCreate` có tracking. Đơn vẫn mang tag `demo-fulfilled`.
  - #1002 `gid://shopify/Order/6920853323873`: 2 × Resistance Band Set, $102.00, payment pending, chưa giao.
  - #1003 `gid://shopify/Order/6920853717089`: 2 × Training Mat, $150.00, đã thanh toán rồi huỷ (lý do CUSTOMER, staff note "khách đổi ý"), hoàn tiền về phương thức gốc. Trạng thái REFUNDED.
  - #1004 `gid://shopify/Order/6920854569057`: `sản-phẩm-số` (iOS) + Resistance Band Set, mã WELCOME15 giảm $58.20, tổng $341.80, đã thanh toán, chưa giao.
- Vì #1004, Jamie đã dùng WELCOME15 một lần. Test "lần 2 bị từ chối" dùng được với khách này. Test "lần đầu" phải dùng khách khác hoặc khách vãng lai.

## 14. Unit price (D6): có sẵn, không sửa
- `unit-price` đã có unit price: Green 13 oz, Gold 34 oz, Brown 23 oz, đơn vị cơ sở 1 oz. Store (US) hỗ trợ unit price. Khác số đề xuất của BA (50 / 25 / 10 kg), nhưng là dữ liệu có sẵn nên giữ nguyên. Muốn đúng bảng D6 thì CTO sửa tay.

## 15. Sản phẩm số (D7): có sẵn, đúng
- `sản-phẩm-số`: cả 3 biến thể `requiresShipping: false`.

## 16. Selling plan "Subscribe and save" (D2): ĐÃ TẠO (lượt 2)
- Group `gid://shopify/SellingPlanGroup/3729195105`, merchantCode `subscribe-and-save`, có 3 plan: Deliver every 1 month (`SellingPlan/8708620385`), 2 months (`8708653153`), 3 months (`8708685921`). Mỗi plan giảm 10%, lặp theo tháng.
- Đã gắn `figma-resistance-band-set-pro` (vẫn mua một lần được, `requiresSellingPlan` false) và `demo-subscription-only` (`requiresSellingPlan` true, giờ mua được qua plan).
- Group tạo qua Admin API nên `appId` = null, không thuộc app Shopify Subscriptions. KHÔNG CHẮC app có hiện và quản lý contract của group này không. Checkout subscription cũng cần cổng thanh toán hỗ trợ (Shopify Payments hoặc Bogus test). CTO kiểm bằng 1 đơn thử.

## 17. Local pickup (D8): ĐÃ TẠO location (lượt 2)
- `Efitco Studio Downtown` `gid://shopify/Location/88064163937`: 135 4th St, San Francisco CA. Pickup ONE_HOUR.
- `Efitco Warehouse North` `gid://shopify/Location/88064196705`: 1 Broadway, Oakland CA. Pickup TWENTY_FOUR_HOURS.
- `Efitco Pop-up Store` `gid://shopify/Location/88064229473`: 150 S 1st St, San Jose CA. Pickup TWO_HOURS.
- Cả 3 location bật fulfill online orders, local pickup bật qua `locationLocalPickupEnable`, instructions 1 câu.
- Location cũ không sửa.
- KHÔNG bật tồn theo địa điểm cho `figma-iron-core-kettlebell`, vì phải sửa sản phẩm figma (sản phẩm này đang `tracked: false`). Xem mục cần làm tay.

## 18. Markets + ngôn ngữ (comment CTO T296): ĐÃ BẬT
- Bật và publish tiếng Pháp `fr`. Thêm `fr` vào alternateLocales của web presence chính (`gid://shopify/MarketWebPresence/31425036385`). Storefront `/fr` đã có (đang redirect sang `/fr/password` vì store có mật khẩu).
- Market mới `international` "International" (`gid://shopify/Market/64159219809`), ACTIVE, 14 nước: GB, IE, FR, DE, IT, ES, NL, BE, SE, DK, AU, NZ, JP, SG. Market có sẵn: US, Canada, Pham (BY, BD, BB). Tổng 18 nước, đủ > 10 để hiện ô tìm nước.
- Chưa dịch nội dung sang tiếng Pháp (theme có locale fr thì chữ giao diện tự dịch). Vùng giao hàng vẫn chỉ US, CA (`shipsToCountries`), nên checkout tới nước mới chưa có phí ship. Thêm zone là việc của CTO nếu cần.
- Announcement bar: giữ RỖNG theo câu trả lời T296. Không tạo collection `sale` vì bar không dùng.

## 19. Shop: policies, password message, phone (T268)
- Lượt 2: tạo `SHIPPING_POLICY` (`gid://shopify/ShopPolicy/42441932897`), `REFUND_POLICY` (`42441965665`), `TERMS_OF_SERVICE` (`42441998433`), văn bản mẫu ngắn. Trước đó 3 policy này rỗng.
- `PRIVACY_POLICY` có sẵn (17.994 ký tự), không sửa.
- Nội dung mẫu nói "free shipping over $99, flat $12, đổi trả 90 ngày, bảo hành 12 tháng", lấy theo FAQ theme. Phí ship thật của store chưa chắc khớp. CTO chỉnh nếu cần (quy tắc không claim giả, sổ 11/11 mục 7).
- Password message và phone vẫn không có API. Xem mục cần làm tay.

## Cần CTO làm tay

| # | Việc | Đường bấm |
| --- | --- | --- |
| 1 | B2B (D1) | Gói Basic không cho catalog gán company location. Cần store Plus hoặc dev store có Plus features. CTO chỉ định store khác (T297 #1) hoặc giữ "chờ dữ liệu". Company `Efitco Demo Gym` đã có: Customers > Companies > Efitco Demo Gym > Add customer (email `TE4_B2B_CUSTOMER_EMAIL`). |
| 2 | Combined listing (D9) | Cần Plus + app Shopify Combined Listings. Gói hiện tại không làm được. |
| 3 | Selling plan (D2) | ĐÃ TẠO ở lượt 2. Chỉ cần kiểm 1 đơn thử có plan 1 tháng ($40.50), và xem app Subscriptions có quản lý group (appId null) không. |
| 4 | Tồn pickup (D8) | 3 location đã có. Còn lại: Products > Iron Core Kettlebell 16 kg > bật Track quantity > tồn Studio Downtown 5, Warehouse North 12, Pop-up 0, mỗi màu. Đây là sửa sản phẩm figma, CTO quyết. |
| 5 | Gift card hết hạn (T268) | Thẻ $50 và thẻ đã tắt có rồi. Thẻ hết hạn: không tạo được ngày quá khứ, bỏ ca này hoặc chờ thẻ thật hết hạn. |
| 6 | Giao đơn #1001 có tracking (T270) | Orders > #1001 > Fulfill items > Tracking number 1Z999AA10123456784, carrier UPS > Fulfill. Hoặc cấp scope `write_merchant_managed_fulfillment_orders` rồi agent làm. |
| 7 | Bình luận blog (T267) | Storefront `/blogs/figma-blog/figma-home-gym-15m2` (mở mật khẩu) gửi ≥ 11 bình luận để test phân trang. Admin > Content > Blog posts > bài > Comments > Approve. |
| 8 | Filter Search & Discovery (T265, T266) | Apps > Search & Discovery > Filters > Add filter: Availability, Price, Color (option, giá trị có swatch), Size, Vendor (Brand), theo thứ tự đó. Search dùng chung cấu hình filter. |
| 9 | Password page message (T268) | Online Store > Preferences > Password protection > Message: câu phụ hero Figma 1:422. |
| 10 | Phone (T268) | Settings > Store details > Phone. Policies đã tạo ở lượt 2. |
| 11 | App review (T264) | Cài app review có theme app block (vd Judge.me), nếu muốn test vùng nhận app block. Metafield `reviews.*` đã có trên 4 sản phẩm figma + 2 sản phẩm demo/test. |
| 12 | Popular searches (T266, comment Designer) | Analytics > Reports > Top online store searches: chỉ đọc trong Admin. |
| 13 | Unit price theo D6 (tuỳ chọn) | Products > `unit-price` > từng biến thể > Unit price: 50 / 25 / 10 kg, base 1 kg. Hiện đang là oz, có sẵn. |
| 14 | Theme store dev | Editor (chỉ theme test): exit-popup Discount code = `WELCOME15` để QA kiểm TE-18 AC5; header menu = `main-menu-3-level` nếu cần xem mega menu 3 cấp. |
| 15 | Export | Chạy lại `ops/export_demo_data.py` để `docs/design/demo-data.json` có dữ liệu mới (agent không sửa repo). |

## Key đề xuất thêm vào `tests/e2e/store-data.json` (không tự sửa)

| Key | Giá trị | Ghi chú |
| --- | --- | --- |
| `TE4_MANY_VARIANTS_HANDLE` | `demo-many-variants` | 304 biến thể |
| `TE4_MANY_VARIANTS_LATE_VARIANT_ID` | `50344659714145` | 190 lb / Pair / Blue, vị trí 296, $600.00 |
| `TE4_SALE_ENDS_HANDLE` | `figma-ativafit-lava-adjustable` | 2026-12-31 23:59 |
| `TE4_SALE_ENDS_SHORT_HANDLE` | `sale-gia-nhỏ` | QA tự đặt giá trị mỗi lượt |
| `TE4_SALE_ENDS_NO_COMPARE_HANDLE` | `figma-iron-core-kettlebell` | có ngày, không có giá gạch |
| `TE4_SELLING_PLAN_REQUIRED_HANDLE` | `demo-subscription-only` | đã gắn plan |
| `TE4_SELLING_PLAN_GROUP_HANDLE` | `figma-resistance-band-set-pro` | đã gắn plan |
| `TE4_B2B_QTY_HANDLE` | `figma-training-mat-12mm` | B2B chưa bật, test ghi "chờ dữ liệu" |
| `TE18_DISCOUNT_CODE` | `WELCOME15` | |
| `TE9_PAGE_HANDLES` | `our-story`, `our-efitco`, `faqs`, `contact` | |
| `TE9_BLOG_HANDLE` | `figma-blog` | 11 bài, bình luận có duyệt |
| `TE1_MENU_3_LEVEL_HANDLE` | `main-menu-3-level` | |
| `TE1_LOCALES` | `en`, `fr` | |
| `TE1_MARKET_INTL_HANDLE` | `international` | 14 nước |
| `ACCOUNT_EMPTY_CUSTOMER_EMAIL` | (email khách demo empty, để ở secret) | không ghi email vào repo |
| `TE4_SELLING_PLAN_GROUP_NAME` | `Subscribe and save` | 3 plan, −10% |
| `TE4_PICKUP_MULTI_LOCATIONS` | `Efitco Studio Downtown`, `Efitco Warehouse North`, `Efitco Pop-up Store` | tồn chưa bật |
| `ACCOUNT_ORDER_NAMES` | `#1001` (paid, chưa giao), `#1002` (pending), `#1003` (huỷ + hoàn), `#1004` (WELCOME15 + sản phẩm số) | khách demo buyer |
| `TE4_COMBINED_PARENT_HANDLE` | không thêm | combined listing không làm được |
