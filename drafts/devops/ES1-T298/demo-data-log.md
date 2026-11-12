# ES1-T298: log nhập dữ liệu demo store dev (12/11/2026)

Store: `hoa-qua-nhap-khau.myshopify.com` (Efitco, gói Basic, partner development, `shopifyPlus: false`, tiền USD, giờ store America/New_York). Gọi Admin API 2026-10 bằng `shopify store execute`. Script: `gql.py`, `b2b.py`, `many.py`, `content.py`, `articles.py`, `menu.py`, `customers.py` cùng thư mục. Danh sách id ở `created-ids.tsv`.
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
- Mã giảm giá cơ bản của Shopify không có điều kiện "đơn đầu tiên". Bản này làm theo D10 (1 lần mỗi khách). Muốn ép đúng "đơn đầu" thì phải dùng customer segment `number_of_orders = 0`, nhưng khi đó khách vãng lai không dùng được mã. Chưa làm, CTO quyết.
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

## 12. Gift card (D5, T268)
- `gift-card-2` đã đúng: `isGiftCard: true`, 4 mệnh giá, đang trên Online Store. Store có `features.giftCards = true`. Không tạo mới.
- Phát hành gift card: `giftCardCreate` bị từ chối, `Access denied ... Required access: write_gift_cards access scope.` Xem mục cần làm tay.

## 13. Khách hàng, địa chỉ, đơn (T270)
- `<email demo, xem secret>` (Jamie Rivera, `gid://shopify/Customer/10262413738081`): 2 địa chỉ, mặc định 500 Howard St (San Francisco), địa chỉ còn lại 1 Market St (Oakland). Tag `demo-t298`.
- `<email demo, xem secret>` (Alex Nguyen, `gid://shopify/Customer/10262413901921`): 0 đơn, 0 địa chỉ.
- Email @example.com không nhận được mã đăng nhập một lần. Muốn đăng nhập xem /account thì CTO đổi sang hộp thư QA đọc được.
- Đơn hàng: KHÔNG tạo được. `orders` bị `Access denied for orders field.`, `orderCreate` cần scope `write_orders` (và token offline).

## 14. Unit price (D6): có sẵn, không sửa
- `unit-price` đã có unit price: Green 13 oz, Gold 34 oz, Brown 23 oz, đơn vị cơ sở 1 oz. Store (US) hỗ trợ unit price. Khác số đề xuất của BA (50 / 25 / 10 kg), nhưng là dữ liệu có sẵn nên giữ nguyên. Muốn đúng bảng D6 thì CTO sửa tay.

## 15. Sản phẩm số (D7): có sẵn, đúng
- `sản-phẩm-số`: cả 3 biến thể `requiresShipping: false`.

## 16. Selling plan "Subscribe and save" (D2): KHÔNG tạo được group
- `sellingPlanGroupCreate` bị từ chối: `Access denied ... Required access: write_products access scope as well as any of write_own_subscription_contracts, write_purchase_options access scopes. Also: The user must have manage_orders_information permissions.`
- Đã tạo trước sản phẩm `demo-subscription-only` "Resistance Band Set Subscription" (`gid://shopify/Product/9554614485089`): $45.00, 1 biến thể, ảnh Resistance Band Set, `requiresSellingPlan: true`, ACTIVE, đã publish Online Store. Chưa gắn plan nên đang **không mua được**, chờ CTO gắn trong app.
- `figma-resistance-band-set-pro`: không đổi gì.

## 17. Local pickup (D8): KHÔNG tạo được
- `locationAdd` bị từ chối: `Access denied for locationAdd field. Required access: write_locations access scope.`
- Location hiện có: Shop location (Rome, US, pickup bật 24h), My Custom Location (Toronto, pickup bật 24h), Pham ds (Independence, US, pickup tắt). Không sửa.
- `figma-iron-core-kettlebell` không theo dõi tồn. Muốn có tồn theo địa điểm (5 / 12 / 0) phải bật theo dõi tồn, tức là sửa sản phẩm `figma-*`. Để CTO làm cùng bước tạo location.

## 18. Markets + ngôn ngữ (comment CTO T296): ĐÃ BẬT
- Bật và publish tiếng Pháp `fr`. Thêm `fr` vào alternateLocales của web presence chính (`gid://shopify/MarketWebPresence/31425036385`). Storefront `/fr` đã có (đang redirect sang `/fr/password` vì store có mật khẩu).
- Market mới `international` "International" (`gid://shopify/Market/64159219809`), ACTIVE, 14 nước: GB, IE, FR, DE, IT, ES, NL, BE, SE, DK, AU, NZ, JP, SG. Market có sẵn: US, Canada, Pham (BY, BD, BB). Tổng 18 nước, đủ > 10 để hiện ô tìm nước.
- Chưa dịch nội dung sang tiếng Pháp (theme có locale fr thì chữ giao diện tự dịch). Vùng giao hàng vẫn chỉ US, CA (`shipsToCountries`), nên checkout tới nước mới chưa có phí ship. Thêm zone là việc của CTO nếu cần.
- Announcement bar: giữ RỖNG theo câu trả lời T296. Không tạo collection `sale` vì bar không dùng.

## 19. Shop: email, phone, password message, policies (T268)
- Email shop: có sẵn. Policies: đọc bị từ chối (`read_legal_policies`), không kiểm được là đã điền chưa.
- Password message và phone không có trong scope API hiện tại. Xem mục cần làm tay.

## Cần CTO làm tay

| # | Việc | Đường bấm |
| --- | --- | --- |
| 1 | B2B (D1) | Gói Basic không cho catalog gán company location. Cần store Plus hoặc dev store có Plus features. CTO chỉ định store khác (T297 #1) hoặc giữ "chờ dữ liệu". Company `Efitco Demo Gym` đã có: Customers > Companies > Efitco Demo Gym > Add customer (email `TE4_B2B_CUSTOMER_EMAIL`). |
| 2 | Combined listing (D9) | Cần Plus + app Shopify Combined Listings. Gói hiện tại không làm được. |
| 3 | Selling plan (D2) | Apps > cài "Shopify Subscriptions" > Create subscription plan "Subscribe and save": 1/2/3 tháng, giảm 10%, thêm `figma-resistance-band-set-pro` và `demo-subscription-only`. `demo-subscription-only` đã để chỉ bán theo subscription. Nếu không định gắn plan thì chuyển nó sang Draft. |
| 4 | Local pickup (D8) | Settings > Locations > Add location: Efitco Studio Downtown (SF, 1 hour), Efitco Warehouse North (Oakland, 24 hours), Efitco Pop-up Store (San Jose, 2 hours), bật Fulfill online orders. Settings > Shipping and delivery > Local pickup: bật 3 điểm. Products > Iron Core Kettlebell 16 kg > bật Track quantity > tồn 5 / 12 / 0 mỗi màu. |
| 5 | Phát hành gift card (T268) | Products > Gift cards > Create gift card: $50, hết hạn 31/12/2027, gán Jamie Rivera. Thêm 1 thẻ rồi Deactivate (thẻ bị tắt). Thẻ hết hạn: Admin không cho đặt ngày quá khứ, cần thẻ cũ hoặc bỏ ca này. Apple Wallet pass_url do Shopify sinh. |
| 6 | Đơn hàng (T270) | Orders > Drafts > Create order cho Jamie Rivera, ≥ 4 đơn: (a) đã giao, Fulfill có tracking (carrier, số, URL); (b) chưa giao; (c) Cancel + refund có lý do; (d) dùng mã WELCOME15, có dòng `sản-phẩm-số` hoặc gift card. Mark as paid (Bogus gateway / test). Hoặc cấp scope `write_orders` cho CLI rồi agent làm. |
| 7 | Bình luận blog (T267) | Storefront `/blogs/figma-blog/figma-home-gym-15m2` (mở mật khẩu) gửi ≥ 11 bình luận để test phân trang. Admin > Content > Blog posts > bài > Comments > Approve. |
| 8 | Filter Search & Discovery (T265, T266) | Apps > Search & Discovery > Filters > Add filter: Availability, Price, Color (option, giá trị có swatch), Size, Vendor (Brand), theo thứ tự đó. Search dùng chung cấu hình filter. |
| 9 | Password page message (T268) | Online Store > Preferences > Password protection > Message: câu phụ hero Figma 1:422. |
| 10 | Phone, policies (T268) | Settings > Store details > Phone. Settings > Policies: điền Privacy, Shipping, Refund (hoặc cấp scope `write_legal_policies`). |
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
| `TE4_SELLING_PLAN_REQUIRED_HANDLE` | `demo-subscription-only` | chỉ dùng được sau khi CTO gắn plan (mục 3) |
| `TE4_SELLING_PLAN_GROUP_HANDLE` | `figma-resistance-band-set-pro` | sau khi CTO gắn plan |
| `TE4_B2B_QTY_HANDLE` | `figma-training-mat-12mm` | B2B chưa bật, test ghi "chờ dữ liệu" |
| `TE18_DISCOUNT_CODE` | `WELCOME15` | |
| `TE9_PAGE_HANDLES` | `our-story`, `our-efitco`, `faqs`, `contact` | |
| `TE9_BLOG_HANDLE` | `figma-blog` | 11 bài, bình luận có duyệt |
| `TE1_MENU_3_LEVEL_HANDLE` | `main-menu-3-level` | |
| `TE1_LOCALES` | `en`, `fr` | |
| `TE1_MARKET_INTL_HANDLE` | `international` | 14 nước |
| `ACCOUNT_EMPTY_CUSTOMER_EMAIL` | `<email demo, xem secret>` | nên để ở secret nếu theo quy tắc không ghi email vào repo |
| `TE4_COMBINED_PARENT_HANDLE` | không thêm | combined listing không làm được |
