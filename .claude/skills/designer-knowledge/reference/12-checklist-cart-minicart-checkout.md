---
title: Checklist Cart, Mini cart & Checkout – giỏ hàng, tài khoản khi thanh toán, địa chỉ, quà tặng, vận chuyển, thanh toán (desktop + mobile)
type: Checklist
scope: Mini cart/drawer, cart page, overlay "Added to cart", checkout (phần theme có thể can thiệp và phần Shopify checkout đã làm sẵn), order confirmation
source: Sheet "Cart & Checkout", "Mobile" (phần Cart & Checkout mobile) (Nextsky - Bộ tiêu chí UX.xlsx); Baymard guidelines #600–#677, #731, #732, #2151, #2154, #2320, #544–#548, #631–#635, #2278, #2326, #2329, #2340, #2360, #2363, #2378, #2381, #582–#594, #721, #723, #2441; onilab.com shopping cart UX; simicart; justinmind
---

# Checklist Cart, Mini cart & Checkout

Ghi chú: Purity dùng checkout mặc định của Shopify nên đa số tiêu chí checkout đã đạt sẵn (được đánh dấu "Shopify checkout đã làm"). Theme can thiệp chủ yếu ở mini cart, cart page, overlay add to cart, và các khối thông tin trước checkout.

---

## 1. Shopping Cart (mini cart + cart page)

- [ ] **Không đóng mini cart quá sớm**; thiết kế tương tác cẩn thận: dropdown cart không tự đóng khi người dùng chưa tương tác xong (Should; 86% AH; #601). Audit: theme không dùng dropdown hover, có thể thêm option show popup.
- [ ] **Cross-sell trong overlay "Đã thêm vào giỏ" là nội dung phụ** (Should; 43.8% AH; #600): không lấn át thông báo chính, không gây hiểu nhầm đã chuyển trang; sản phẩm cross-sell thiết kế như sản phẩm thứ cấp, không nổi bật ngang item cart; nhiều popup phải đóng mỗi lần làm giảm trải nghiệm. Audit: move "You may also like" vào trong minicart ngay dưới sản phẩm; khi đã add sản phẩm upsell thì remove, không hiện lại.
- [ ] **Không dùng trang trung gian khi thêm vào giỏ** – không điều hướng sang trang khác chỉ để xác nhận (Should; 91.5% AH).
- [ ] **Luôn có đường dẫn tới giỏ hàng trong overlay xác nhận** (Should; 62.3% AH). Audit: add to cart mở drawer hoặc go to cart page.
- [ ] **Hiển thị đầy đủ ảnh và thông tin sản phẩm trong overlay "Added to Cart"**: thumbnail, tên, thuộc tính (Should; 16.2% AH).
- [ ] **Luôn lưu nội dung giỏ hàng và thông báo nếu có thay đổi** khi quay lại (hết hàng, đổi giá) (Should; 90.6% AH). Mobile: giỏ giữ sản phẩm sau vài giờ/ngày dù không đăng nhập (Rất cao; 84% site vi phạm).
- [ ] #624D Sản phẩm trùng thêm nhầm hiển thị thành item riêng + cảnh báo đã thêm nhiều lần (Could; 17% AH). Audit: cân nhắc vì làm vậy cart không gọn.
- [ ] #732D **Luôn hiển thị tổng chi phí đơn hàng hoặc ước tính trong giỏ** (Should; 23.6% AH). Audit: thiết kế highlight phần giảm giá như Concept; làm option cho phép show discount coupon ở minicart; xem xét bỏ sản phẩm gift wrap khỏi minicart, để ở cart page và sửa logic như Sephora. Mobile: tổng rõ, gần nút Checkout, phân biệt tạm tính/ship/giảm giá/tổng cuối (Rất cao; 49% vi phạm).
- [ ] #2320D **Tích hợp thông tin "Free Shipping" trong tóm tắt chi phí giỏ** (Should; 30.4% AH). Audit: thu gọn free shipping, không sticky để tối ưu không gian minicart.
- [ ] #620D **Thumbnail lớn và thông tin sản phẩm chính trong cart** (Should; 9% AH).
- [ ] #622D **"Save for Later" trong cart** (Should; 25.3% AH): khi thanh toán có thể xem lại sản phẩm đã lưu để add lại. Audit: chưa có, xem xét requirement Shopify; Concept dùng recent view. Rất nhiều bài viết recommend.
- [ ] #2151D **Button +/- (hoặc + ô nhập) để đổi số lượng** (Should; <10% AH). Mobile: nút tăng/giảm rõ, phản hồi nhanh, không chuyển trang/popup phức tạp (Rất cao; 56% vi phạm).
- [ ] #2154D **Saved Items đặt cuối cart page** (Should; 27.4% AH). Audit: thêm khối recent view dưới cart page.
- [ ] **Tên sản phẩm trong cart là link tới PDP** (Should; 64.2% AH).
- [ ] **Tránh quảng cáo quá nổi bật trong cart** (Should; 72.6% AH; #2139D).
- [ ] **Cá nhân hoá cross-sell trong giỏ theo ngữ cảnh** (Should; 47.6% AH; #578D). Audit: tối đa 4 sản phẩm, cá nhân hoá; thêm setting chọn product to show ở recommendation; setting ẩn trên mobile.
- [ ] **Tối ưu không gian** (Must). Audit:
  - Minicart: ảnh cho bé lại giống cart page – đồng bộ và tiết kiệm không gian.
  - Cart page: tối ưu khoảng cách title và freeshipping; move item cart lên đầu, thông tin khác xuống dưới; nút remove chuyển lên đầu, thay bằng icon thùng rác (quen thuộc); chỉ show đơn giá không show subtotal, design lại giá đã giảm dễ nhận biết; khối sản phẩm dạng list, xuống dòng, 2 item/row trên mobile tương tự product page.
- [ ] **Hiển thị thanh toán được bảo mật** (Must): thêm icon khoá trước button checkout; đảm bảo biện pháp bảo mật hiện đại và trấn an người dùng bằng hình ảnh. Audit: Concept có làm.
- [ ] **Đơn giản hoá tiêu đề trang giỏ** (Must): header chỉ còn nút back và title để giảm phân tâm, tăng hoàn tất giao dịch. Audit: nếu làm thì tính toán thêm setting ở page cart.
- [ ] **Tự động update giỏ hàng** (đạt).
- [ ] **Bỏ nút "Tiếp tục mua sắm" khỏi cart page** (Must – tập trung checkout) – nhưng lưu ý mobile Baymard yêu cầu có lối quay lại PLP/PDP (xem mục 8). Cần cân đối: desktop tối giản, mobile có link nhỏ "← Tiếp tục mua sắm".
- [ ] **Chi phí vận chuyển ước tính trước thanh toán** (Must): Shopify không tự hiện phí ship trước khi nhập thông tin → đổi "Estimate shipping rates" thành "Estimate your delivery cost"; thêm icon ô tô tải; thêm icon gói quà chỗ gift wrap.
- [ ] **Hiển thị phản hồi khi add cart** (Should): nhiều popup gây phiền → option: add cart lần 1 show popup, lần 2 show message nhỏ; nếu dùng message cần animation khi add và hiệu ứng tăng số lượng trong giỏ (zoom icon cart); chú ý vị trí message trên mobile.
- [ ] **Giữ nút thanh toán luôn hiển thị** (Must): cart page có thanh/footer cố định hiển thị tổng tiền hiện tại (số tiền được giảm, giảm giá nếu có) và nút "Thanh toán" cố định cuối màn hình – đặc biệt mobile khi giỏ nhiều mặt hàng.
- [ ] **Đóng được bằng một tay**: ngoài nút x, hỗ trợ vuốt để đóng (nhanh hơn nút) (Should). Audit: xem xét update vuốt trái tắt popup.
- [ ] **Chỉnh sửa item ngay trong cart** (Should; mobile Cao, 78% vi phạm): nút "Chỉnh sửa"/icon bút cạnh sản phẩm → popup tổng quan nhanh như mini product page để đổi size, màu; tốt hơn đi đến PDP vì nhanh, không chuyển trang. Tham khảo vans.com/en-us/cart, Shopee. Audit: Purity chưa có, người dùng phải xoá rồi thêm lại.
- [ ] **Tóm tắt đơn hàng trên desktop** bên phải danh sách sản phẩm, above the fold (Must; đạt).
- [ ] **Liệt kê hình thức thanh toán được chấp nhận** – huy hiệu gần nút thanh toán (trên/dưới) hoặc footer (Must; đạt).
- [ ] **Động lực mua hàng cho giỏ trống** (Must): CTA để điền giỏ; sản phẩm liên quan được xem/mua thường xuyên hoặc gần đây; cá nhân hoá. Audit: cần update.
- [ ] **Bỏ các nút/phần không cần thiết** mà người dùng dễ tìm ở trang khác (chính sách hoàn trả, FAQ) – đặt link ở footer, mở popup trên mobile (Must). Audit: làm option ẩn thông tin không cần thiết trên mobile.
- [ ] **Sản phẩm hết hàng sau khi để lâu trong giỏ**: không cho đến checkout cho đến khi tự xoá; đề nghị chọn sản phẩm tương tự (Could). Audit: cần xem xét.

## 2. Account Selection & Creation

- [ ] #637D Luôn có "Guest Checkout" (Should; 74.5% AH) – đạt.
- [ ] #652D Guest Checkout là lựa chọn nổi bật nhất (Should; 39.5% AH) – đạt.
- [ ] #677D Tránh yêu cầu mật khẩu quá phức tạp (Should; 22.4% AH) – đạt.
- [ ] #638D Để việc tạo tài khoản sang bước xác nhận (Should; 18.6% AH) – đạt.
- [ ] #676D Hiển thị toàn bộ yêu cầu mật khẩu ngay từ đầu, dưới trường mật khẩu (Should; 35.2% AH) – không sửa.
- [ ] #665D Luôn cho phép "Show Password" (Should; 66.7% AH) – đạt.
- [ ] #640D Luôn nêu lợi ích khi tạo tài khoản (Should; 35.2% AH). Audit: hiện chỉ text đơn giản → thêm "Create account to get 15% off first order…".

## 3. User Information & Address

- [ ] #731D Giải thích vì sao trường số điện thoại bắt buộc (Should; 49% AH) – đạt.
- [ ] #566D Mặc định dùng Shipping Address làm Billing Address (Should; 64.2% AH) – đạt; mobile có checkbox "Dùng địa chỉ này cho thanh toán" tích sẵn (Cao; 59% vi phạm).
- [ ] #565D Cập nhật trường địa chỉ theo quốc gia với đơn quốc tế (Should; 51.5% AH) – không sửa.
- [ ] #558D Một trường số điện thoại, không tách mã vùng (Should; 90.3% AH) – đạt.
- [ ] #557D Một trường "Full Name", không tách first/last (Should; 9% AH) – xem xét sau.
- [ ] #560D Country selector có autocomplete bằng bàn phím (Should) – đạt.
- [ ] #573D IP geotargeting chọn sẵn quốc gia (Should; 20.3% AH) – xem xét sau.
- [ ] #562D Ẩn "Address Line 2" sau link (Should; 29.9% AH).
- [ ] #564D Tránh hoặc làm rõ "Address Type" (Should; 70% AH) – đạt.
- [ ] #2263D Tuỳ chọn nhận thông báo đơn qua SMS (Should; 85.7% AH) – merchant thao tác trên admin.
- [ ] #2266D Tự động tìm địa chỉ toàn diện: gõ một phần → gợi ý và điền phường, quận, mã bưu chính (Should; 40% AH) – đạt.
- [ ] #561D Tự nhận diện thành phố/bang ngay khi nhập ZIP (Should; 76.3% AH) – xem xét sau.
- [ ] #663D Vô hiệu paste ở ô xác thực email thứ hai hoặc bỏ hẳn (Should; 98.9% AH) – đạt.
- [ ] #625D Có address validator đúng định dạng (Should; 42.1% AH). Audit: cần code review lại toàn bộ input.
- [ ] #626D Cho phép ghi đè validator nhưng làm rõ hậu quả (vùng nông thôn không lấy được địa chỉ) (Should; 66.7% AH) – đạt.
- [ ] #627D Làm nổi bật thay đổi do validator đề xuất (Should; 74.5% AH) – đạt.
- [ ] #629D Tự sửa lỗi nhỏ ("strett" → "street") (Should; 74.5% AH) – đạt.
- [ ] Mobile: label form luôn hiển thị, không dùng placeholder thay label, label không biến mất khi gõ (Rất cao; 74% vi phạm).
- [ ] Mobile: hỗ trợ autofill và autocapitalization hợp lý (không in hoa email, in hoa tên riêng) (Cao; 69% vi phạm).
- [ ] Mobile: input cao tối thiểu 44px, padding đủ, xếp dọc rõ ràng (Rất cao; 73% vi phạm).
- [ ] Mobile: không chia Address Line 1 thành nhiều ô (số nhà, tên đường, phường) (Cao; 76% vi phạm).

## 4. Gifting Flow & Features

(Gift product chỉ là add thêm gift wrap, vẫn mua và order như sản phẩm bình thường.)

- [ ] #650D Cho phép đặt đơn quà tặng gửi thẳng người nhận (Should; 46.5% AH). Audit: theme chỉ có checkbox gói quà → cụ thể hơn: "sản phẩm này mua để tặng" → option show name, email… tham khảo Sephora.
- [ ] #646D Luôn giải thích chi tiết các tính năng quà tặng (Should; 31.8% AH) – đạt.
- [ ] #649D Làm rõ Phone/Email là của người gửi hay người nhận (Should; 11.8% AH) – không làm vì checkout lấy mặc định Shopify.
- [ ] #647D Luồng checkout riêng cho đơn quà tặng (Should; <5% AH) – không làm.
- [ ] #645D Cho đánh dấu "quà tặng" ở bước giỏ hàng và sau đó trong checkout (Should; 30% AH) – đạt.

## 5. Shipping & Fulfilment

- [ ] #544D Chi phí & thời gian giao rõ cho mọi lựa chọn: phí cơ bản, phí phát sinh, thời gian dự kiến, so sánh phương thức (Should; 84.8% AH) – đạt (có estimate shipping).
- [ ] #547D Tất cả tuỳ chọn vận chuyển hiển thị trực tiếp trên trang (Should; 67.4% AH) – đạt.
- [ ] #543D Dùng "Delivery Date" thay "Delivery Speed" (Should; 51.8% AH) – chưa kiểm tra được.
- [ ] #548D Hiển thị order cutoff time dạng countdown ở cart (Should; <3% AH). Audit: update ở cart page, tham khảo ASOS; Glozin đã làm.
- [ ] #632D, #631D, #634D, #635D, #2278D: Tất cả tuỳ chọn fulfillment (shipping + pickup in store) trong giao diện chọn vận chuyển; mô tả đầy đủ lựa chọn thay thế; IP geotargeting gợi ý cửa hàng gần; luồng checkout riêng cho Store Pickup; liên kết rõ mỗi tuỳ chọn với chi phí/chi tiết – Shopify checkout đã làm.
- [ ] #2326D Store locator hiển thị tình trạng còn hàng của mặt hàng chọn pickup (Should; 61.7% AH) – cần thảo luận với BE.
- [ ] #2329D Luôn có bản đồ trong store locator (Should; 39% AH). Audit: thêm page find store.

## 6. Payment Flow & Credit Card Form

- [ ] #2360D Chọn mặc định phương thức thanh toán phổ biến nhất (100% AH) – Shopify đã làm.
- [ ] #671D Có một hoặc nhiều phương thức thanh toán bên thứ ba (49% AH) – Shopify đã làm.
- [ ] #2363D Không tự động đưa người dùng vào luồng thanh toán bên thứ ba – đạt.
- [ ] #2340D Tự áp dụng discount và promo code khi có thể (100% AH) – đạt.
- [ ] #615D Ẩn trường coupon sau một link ("Bạn có mã giảm giá? Bấm vào đây") để không phân tâm đi tìm mã (47.7% AH) – đạt; hiện chỉ cho nhập mã ở checkout page.
- [ ] #672D Cập nhật động nút Thanh toán theo phương thức bên thứ ba (31.5% AH) – Shopify có các nút checkout bên thứ ba trong PDP.
- [ ] #586D Microcopy nút chính rõ ràng – người dùng biết click có bị trừ tiền ngay không (37.1% AH) – đạt.
- [ ] #589D Mặc định tiền tệ địa phương của người dùng quốc tế – chưa làm.
- [ ] #2378D, #2381D Thông tin trả góp: lịch thanh toán, lãi suất, điểm tín dụng; bản tóm tắt dễ quét – cần thảo luận tính năng Shopify.
- [ ] #582D Luhn validate số thẻ; #594D tự thêm dấu cách XXXX XXXX XXXX XXXX; #2441D hỗ trợ nhập từ thẻ vật lý; #583D lưu thông tin thẻ của guest trong cả phiên; #721D kiểm tra tính hợp lệ khi submit; #723D giữ dữ liệu thẻ khi nhập sai nhưng che chỉ còn xxxx xxxx xxxx 1234 – Shopify checkout đã làm.

## 7. Order Review, Form Design, Checkout Layout

- [ ] Order Review & Confirmation – Shopify checkout không có bước này riêng.
- [ ] #606D Enclosed checkout – không gây sao nhãng; #730D nút chính style độc nhất, vị trí nhất quán; #674D chọn đúng kiểu input cho optional inputs; #660D label nằm trong hit area của checkbox/radio – Shopify checkout đã làm.
- [ ] Mobile: quy trình thanh toán tuyến tính, dễ theo dõi – mỗi bước (giao hàng, vận chuyển, thanh toán) tách riêng, có tiêu đề, hiển thị vị trí (Bước 2/3, thanh tiến trình) (Rất cao; 55–70% vi phạm). Không dồn toàn bộ vào 1 trang dài (66% vi phạm).
- [ ] Mobile: hiển thị rõ toàn bộ chi tiết đơn ở bước cuối – sản phẩm, số lượng, giá, biến thể, giao hàng, voucher (Rất cao; 66% vi phạm); các khoản phí tách dòng (giá SP, ship, thuế, giảm giá, tổng) gần nút thanh toán (69% vi phạm).
- [ ] Mobile: nút "Đặt hàng" bị khoá cho đến khi điền đủ thông tin hợp lệ (Rất cao; 71% vi phạm); nhãn mô tả rõ, không mơ hồ, nổi bật (56% vi phạm).
- [ ] Mobile: thông báo lỗi lịch sự, gợi ý sửa cụ thể, nằm cạnh ô lỗi (Rất cao; 65% vi phạm).
- [ ] Mobile: tín hiệu bảo mật – icon ổ khoá, "Thanh toán an toàn", logo Visa/Mastercard/Shop Pay (Rất cao; 67% vi phạm).
- [ ] Mobile: chỉnh sửa được địa chỉ, giao hàng, thanh toán, mã giảm giá ngay trong flow mà không bị đẩy ra (Rất cao; 74% vi phạm).
- [ ] Mobile: trang xác nhận đơn hiển thị mã đơn, sản phẩm, tổng tiền, giao hàng; CTA: theo dõi đơn, tiếp tục mua, mời tạo tài khoản (Cao; 71% vi phạm).

## 8. Cart trên mobile – bổ sung

- [ ] Phản hồi rõ sau "Add to Cart": thông báo, badge cập nhật, mini cart hoặc hiệu ứng (Rất cao; 52% vi phạm).
- [ ] Nút chính trong giỏ ("Tiến hành thanh toán") nổi bật, nhãn rõ, gần nội dung chính (Rất cao; 42% vi phạm).
- [ ] Lối quay lại PLP/PDP: link nhỏ "← Tiếp tục mua sắm" ở đầu hoặc cuối giỏ, có thể dẫn về danh mục gần nhất; không buộc dùng back trình duyệt (Cao; 74% vi phạm). Audit: Purity chưa có.
- [ ] Vị trí icon đóng theo pattern: cart slide-in từ phải → đóng ở góc phải; chi tiết xem file popup & drawer.
