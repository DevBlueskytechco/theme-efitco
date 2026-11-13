KHÔNG CHẮC: (1) ADR 0011 (Chấp nhận 11/11) và ES1-T308 #1 quy định theme mới cài để trống, bậc giảm 0, không claim. Code ngày 12/11 chưa theo: `locales/en.default.json`, default trong schema, `config/settings_data.json` và `templates/index.liquid` còn nội dung mẫu và bậc giảm 10%, 15%. Tài liệu này mô tả đúng code hiện tại; khi TS-FE1..FE4 xong thì bảng mục 1 rút còn dòng "để trống = ẩn", mục 2 đổi "bậc mặc định" thành "mặc định 0". (2) Đường bấm trong Shopify admin (tạo automatic discount, bật filter Product tag, Shopify Email) chưa có trong nguồn được phép, mục 2, 3, 5 chỉ ghi phần đã xác nhận; câu hỏi ở ES1-T429. (3) Setting "Discount code" của before you leave (block `exit-popup`) chưa có trong `blocks/` và `locales/en.default.schema.json`; tên theo `docs/ui-spec/marketing-popups.md`, phải grep lại khi block có. (4) Setting lưu ở đâu khi merchant sửa static block trong template `.liquid` chưa rõ, spike ES1-T331 (ADR 0011).

# Việc bắt buộc trước khi publish

Dùng để: liệt kê 5 việc merchant phải làm trước khi mở store cho khách thật, vì theme cài mới mang nội dung mẫu và bậc giảm hiển thị mà checkout chưa giảm thật. Việc này không chặn trang chạy, nhưng bỏ qua thì store hiện thông tin có thể sai sự thật với khách.

Cấu hình bundle builder và shop the look chi tiết: xem `docs/merchant/bundle-builder.md` (ES1-T150, chưa có file ở thời điểm viết). Không lặp lại ở đây.

## Danh sách kiểm nhanh

1. Thay mọi nội dung mẫu (mục 1).
2. Tạo discount thật khớp bậc giảm, hoặc đặt bậc về 0% (mục 2).
3. Gắn tag quiz cho sản phẩm (mục 3).
4. Chỉ bật "Show Verified label" khi đã xác thực đơn (mục 4).
5. Điền "Discount code" của before you leave và cấu hình Shopify Email gửi mã (mục 5).
6. Chọn tài nguyên cho block đang ẩn (mục 6).

## Mở trong Canvas

Mở Canvas, chọn block cần sửa trong preview, hoặc nhờ Sidekick: "đổi eyebrow của slide đầu thành ...". Tên setting dưới đây chép từ `locales/en.default.schema.json`; tên hiện trong editor là tên đó.

## 1. Thay nội dung mẫu

Đây là nội dung mẫu. Mọi số liệu, review, tên khách, số sao, mức giảm, điều kiện giao hàng trong bảng đều có thể sai sự thật với store của bạn và với khách thật. Phải thay hoặc ẩn trước khi publish.

Cách thay (quy tắc chung của theme):
- Block có ô "Show this slide", "Show this review", "Show this question", "Show this step", "Show this block", "Show stat 1", "Show stat 2": ô để trống thì quay về nội dung mẫu, không phải ẩn. Muốn ẩn mục đó thì tắt ô "Show ..." của mục.
- Block khác (bundle builder, shop the look, quiz, rich text...): chữ mẫu là giá trị mặc định của ô. Xoá chữ thì phần tử đó ẩn. Muốn ẩn cả block thì xoá nguồn dữ liệu (collection, sản phẩm) hoặc bỏ block khỏi template.
- Chữ mẫu lấy từ language editor (cột "Chỗ sửa" ghi Locale): không có ô trong block, chỉ sửa được trong language editor của theme (khóa ghi ở cột "Chỗ sửa"). Đường bấm: KHÔNG CHẮC, chưa có trong nguồn.

| Block (tên trong editor) | Setting (label) | Nội dung mẫu hiện tại | Chỗ sửa |
| --- | --- | --- | --- |
| Slide | Eyebrow | "Trusted by 10,000+ athletes" | Block; tắt: Show this slide |
| Slide | Heading, Subheading, Button label | "Level Up Your Fitness", "Upgrade your journey with Efitco gear made for every workout.", "Explore Equipment" | Block |
| Testimonial | Customer name | E. Johnson, S. Williams, M. Anderson, J. Miller | Block; tắt: Show this review |
| Testimonial | Star rating | 5 khi để trống | Block |
| Testimonial | Review title, Quote | 4 review mẫu (ví dụ "Versatile Gear For All Exercises") | Block |
| Testimonials | Eyebrow, Heading | "Testimonial", "What Our Customers Say?" | Block |
| FAQ | Stat 1 value, Stat 1 label, Stat 1 text | "360+", "Products", "Home gym gear in stock." | Block; tắt: Show stat 1 |
| FAQ | Stat 2 value, Stat 2 label, Stat 2 text | "12", "Warranty", "Months on every item." | Block; tắt: Show stat 2 |
| FAQ | Eyebrow, Heading | "Questions and Answers", "We're Proud To Be The Best At Training" | Block |
| FAQ question | Question, Answer (câu 1) | "How long does shipping take?" kèm "Standard delivery is 2-4 business days across the continental US, and shipping is free on orders over $99." | Block; tắt: Show this question |
| FAQ question | Answer (câu 5) | "Every item comes with a 12-month warranty, and you can return it within 90 days for your money back." | Block |
| FAQ question | Answer (câu 2, 3, 4) | Số liệu quả tạ chỉnh được 11 đến 66 lb, diện tích 0.18 m², 2.4 x 2.0 m, "arrive ready to use" | Block |
| Footer | Trust bar Text (4 ô) | "1 Year Warranty", "Fast Shipping", "Premium Quality", "90 Day Money Back" | Block; xoá chữ thì ẩn ô |
| Footer | Subheading | "...plus up to 15% off for subscribers." | Block |
| Footer | Description | "Efitco provides premium fitness accessories..." | Block |
| Footer | Tiêu đề và nút newsletter | "Get 15% Off Your First Order", nút "Get 15% Off" | Locale (`blocks.footer.newsletter_heading_html`, `newsletter_submit`) |
| Bundle builder | Eyebrow, Heading, Link label | "Build your bundle", "Pick Your Kit, Save As You Go", "View Preset Bundles" | Block; xoá chữ thì ẩn |
| Bundle builder | Tier 1 items needed, Tier 1 discount, Tier 2 items needed, Tier 2 discount | 2 món 10%, 3 món 15% | Block; xem mục 2 |
| Shop the look | Eyebrow, Heading, Link label | "Shop this setup", "A Complete Corner Gym, Itemised", "Browse All Setups" | Block |
| Shop the look | Note title, Note text | "Fits: 2.4×2.0 m", "Folds flat when you're done." | Block; xoá cả hai thì ẩn ghi chú |
| Shop the look | Tier 1 items needed, Tier 1 discount | 4 món 10% | Block; xem mục 2 |
| Product finder quiz | Eyebrow, Heading, Subheading | "Our most-loved feature", "Find Your Perfect Gear", "Two questions. One shortlist." | Block |
| Product finder quiz | First note, Second note | "20 seconds", "No sign-up required" | Block; xoá chữ thì ẩn |
| Product finder quiz | Text when nothing matches | "No products match all your answers. Browse the full collection instead." | Block |
| Quiz step | Question, Subheading, Label, Description | 3 câu hỏi mẫu (focus, training level, nơi tập) và các lựa chọn | Block; tắt: Show this step |
| Featured product | Eyebrow, Countdown label | "FEATURED PRODUCT · FREE WEIGHTS", "Sale ends in" | Block |
| Featured product | Spec row 1 label ... Spec row 4 label | "Weight range", "Footprint", "Materials", "Assembly" | Block |
| Image with text | Eyebrow, Heading, Text, Button label | "We aRE about", "Why Choose efitco?", đoạn "Affordable, high-quality fitness gear...", "View About Us"; banner "Get Started Now" | Block; tắt: Show this block |
| Rich text | Heading, Text, Button label | "Everything You Need", "Versatile equipment for home training...", "Become A Member" | Block |
| Featured collection | Eyebrow, Heading, tab labels | "Bestsellers", "What People Are Buying?", "All", "Weight", "Portable Fitness", "Accessories" | Block; tab trống thì ẩn |
| Shop by level | Eyebrow, Heading | "SHOP BY LEVEL", "Choose Your Training Level" | Block |
| Level card | Label | "Level  Fitness" | Block |
| Collection list | Heading | "Browse Categories" | Block |
| Blog posts | Eyebrow, Heading | "From the Efitco blog", "Training Tips & Inspiration" | Block |
| Video carousel | Eyebrow, Heading | "Video demo", "See Real Equipment In Action, Before You Buy" | Block |
| Multicolumn, Column | Eyebrow, Heading, Text, Link label | "Add a short label", "Add a heading for these columns", "Add a short benefit" | Block |

Cài đặt theme (Theme settings), cũng là nội dung mẫu:
- "Free shipping threshold": `settings_data.json` đang đặt 99. Đặt đúng ngưỡng freeship thật của store, hoặc 0 để ẩn thanh freeship trong giỏ. Thanh này cũng ẩn ở market dùng tiền khác tiền store.
- Link social: "Facebook link", "Instagram link", "TikTok link", "YouTube link" đang trỏ về trang chủ của từng mạng. Thay bằng trang của bạn; "X link", "Pinterest link" để trống. Xoá link thì ẩn icon.

Kiểm cuối mục 1: mở trang chủ, trang sản phẩm, giỏ, footer; đọc từng con số (360+, 12, 99 USD, 2-4 ngày, 90 ngày, 1 năm bảo hành, 10,000+ vận động viên, 15%) và xoá hoặc đổi nếu không đúng với store.

## 2. Tạo discount thật khớp bậc giảm

Theme chỉ hiển thị. Bundle builder và shop the look hiện dòng giảm 10%, 15% theo bảng "Discount tiers", nhưng theme không đổi giá trong giỏ và không tự giảm giá. Checkout chỉ giảm khi store có Shopify automatic discount khớp. Không có discount thì khách thấy "giảm" trên trang rồi trả giá gốc ở checkout: đó là quảng cáo giảm giá sai.

Phải làm một trong hai:
- Tạo automatic discount trong Shopify admin khớp bậc: cùng ngưỡng số món, cùng phần trăm, cùng collection với setting của block. Đổi một bên thì đổi bên kia.
- Hoặc đặt "Tier 1 discount", "Tier 2 discount", "Tier 3 discount" về 0%. Bậc 0% là tắt: block không hiện dòng giảm, thanh tiến độ.

Setting liên quan (bundle builder; header "Discount tiers"): "Tier 1 items needed" / "Tier 1 discount", "Tier 2 items needed" / "Tier 2 discount", "Tier 3 items needed" / "Tier 3 discount", "Collection". Mặc định hiện tại 2 món 10%, 3 món 15%, bậc 3 là 0%. Shop the look dùng cùng nhãn: mặc định 4 món 10%, bậc 2 và 3 là 0%.

Ví dụ cấu hình đã dùng trên store dev (tham khảo, không phải đường bấm):

| Tên | Điều kiện | Giảm | Phạm vi |
| --- | --- | --- | --- |
| figma-bundle-tier-2 | Từ 2 món | 10% | collection của bundle |
| figma-bundle-tier-3 | Từ 3 món | 15% | collection của bundle |
| figma-setup | Từ 4 món | 10% | collection của shop the look |

Trên store dev, 3 món cho ra 15% (bậc cao nhất thắng, không cộng 10% với 15%) và discount không áp lên sản phẩm ngoài collection. Cách cấu hình để đạt kết quả này ở store của bạn: KHÔNG CHẮC, hỏi ở ES1-T429.

Các bước bấm trong admin: KHÔNG CHẮC, nguồn được phép chưa có (ES1-T429). Không làm theo trí nhớ; xem tài liệu Shopify về automatic discounts.

Kiểm sau khi tạo: thêm đúng số món vào giỏ, xem tổng ở giỏ và ở checkout có giảm đúng phần trăm trong block.

## 3. Gắn tag quiz

Block "Product finder quiz" chọn sản phẩm theo tag sản phẩm. Mỗi lựa chọn của "Quiz step" có ô "Product tag". Sản phẩm phải mang đủ tag của cả 3 câu trả lời mới vào kết quả. Không gắn tag thì kết quả luôn rỗng: khách thấy "Text when nothing matches" và link về collection.

Làm:
1. Xem mỗi "Quiz step" dùng "Product tag" nào. Tag mẫu hiện tại: `quiz-upper`, `quiz-core`, `quiz-lower` (bước 1); `quiz-beginner`, `quiz-intermediate`, `quiz-advanced` (bước 2); `quiz-home`, `quiz-gym`, `quiz-outdoor` (bước 3).
2. Gắn các tag này vào sản phẩm trong admin, mỗi sản phẩm một tag cho mỗi bước ("quiz-upper", "quiz-beginner", "quiz-home" cho sản phẩm hợp bộ này). Dùng chữ thường, nối bằng dấu gạch ngang, đúng như ô "Product tag"; kết quả so khớp theo dạng handle của tag.
3. Một tag chưa gắn cho sản phẩm nào cũng cho kết quả rỗng (theme coi là 0 kết quả).
4. Quiz không JavaScript gửi tag tới trang tìm kiếm và cần filter Product tag bật trong Search and Discovery. Đường bấm: KHÔNG CHẮC (ES1-T429).
5. Nếu đổi "Product tag" trong block thì đổi tag trên sản phẩm cùng lúc.
6. "Collection" của quiz: kết quả và link khi không khớp lấy từ collection này; để trống thì dùng toàn bộ sản phẩm.
7. Tắt "Show this step" của một bước vẫn làm kết quả rỗng nếu theme còn đòi đủ 3 tag (ES1-T207). Chưa có xác nhận cách xử lý: KHÔNG CHẮC. Giữ cả 3 bước bật.

Kiểm: làm quiz với một bộ tag đã gắn, phải ra tối đa 4 sản phẩm; làm với bộ chưa gắn, phải ra "Text when nothing matches".

## 4. Chỉ bật "Show Verified label" khi đã xác thực

Nhãn "Verified" cạnh tên khách trong Testimonial báo review từ đơn mua đã xác thực. Mặc định tắt. Info trong editor: "Turn on only when you have verified this purchase."

- Chỉ bật "Show Verified label" cho review mà bạn đã đối chiếu với đơn hàng thật của chính khách đó.
- Review mẫu (E. Johnson, S. Williams, M. Anderson, J. Miller) không xác thực được: giữ tắt, rồi thay bằng review thật hoặc tắt "Show this review".
- Khuyến nghị: không gắn "Verified" cho review sao chép từ nơi khác.
- Lưu ý với store có bộ ảnh demo của theme (file tên bắt đầu `efx-`): template trang chủ bật nhãn này theo mặc định cho 4 review mẫu và ô không tắt được từng review. Store của merchant không có các file này nên nhãn tắt. Thấy nhãn mà chưa xác thực đơn thì báo lại (KHÔNG CHẮC, ADR 0011 sẽ bỏ hành vi này).

## 5. Before you leave: "Discount code" và Shopify Email

Theme không gửi email và không tạo mã giảm giá.

- "Discount code" (block before you leave, `exit-popup`): ô text, mặc định để trống. Điền mã bạn đã tạo thật trong admin (ví dụ mã giảm đơn đầu). Để trống thì popup không hiện mã. Mã phải tồn tại và còn hạn trong admin, nếu không khách nhập mã báo lỗi ở checkout. Block này chưa có trong repo (KHÔNG CHẮC, xem đầu file).
- Popup newsletter: sau khi khách đăng ký, popup hiện "Use code {code} at checkout." chỉ khi "Discount code" có mã. Theme chỉ hiển thị mã bạn nhập.
- Gửi mã cho người đăng ký newsletter: cấu hình trong Shopify Email, ngoài phạm vi theme. Đường bấm: KHÔNG CHẮC (ES1-T429). Không hứa với khách "nhận mã qua email" nếu chưa cấu hình xong.
- Mã `WELCOME15` chỉ dùng trên store dev để kiểm thử. Không dùng cho store thật nếu bạn chưa tạo mã đó.

## 6. Block ẩn tới khi chọn tài nguyên

Các block dưới đây không hiện ngoài storefront cho tới khi chọn tài nguyên. Trong Canvas chúng hiện khung hướng dẫn. Nếu để vậy khi publish, trang thiếu phần đó.

| Block | Chọn gì | Label | Khi chưa chọn |
| --- | --- | --- | --- |
| Shop the look row | Sản phẩm | "Product" (mỗi row; tối đa 6 row) | Row ẩn. Không row nào có sản phẩm thì cả Shop the look ẩn |
| Shop the look | Ảnh, vị trí hotspot | "Image" | Không ảnh thì ẩn ảnh và hotspot, danh sách rộng hết cỡ |
| Featured product | Sản phẩm | "Product" | Block ẩn |
| Video carousel, Video card | Video hoặc URL YouTube/Vimeo | "Video", "YouTube or Vimeo URL" | Card ẩn; không card nào có video thì carousel ẩn |
| Bundle builder | Collection có sản phẩm | "Collection" | Ẩn (trên trang chủ dùng tất cả sản phẩm khi chưa chọn) |
| Featured collection | Collection có sản phẩm | "Collection" | Ẩn (trang chủ dùng tất cả sản phẩm khi chưa chọn) |
| Level card, Collection card | Collection | "Collection" | Card ẩn |
| Blog posts | Blog có ít nhất 1 bài | "Blog" | Ẩn |
| Product finder quiz | Quiz step có câu hỏi và ít nhất 2 lựa chọn có "Product tag" | xem mục 3 | Ẩn |

Nếu muốn chắc: mở từng block trong Canvas, nếu thấy khung "... is hidden on your store" thì chọn tài nguyên hoặc bỏ block.

## Lỗi thường gặp

- Trang vẫn hiện chữ mẫu sau khi xoá ô: block có "Show ..." quay về mẫu khi để trống. Tắt "Show ..." để ẩn.
- Khách thấy "10% off" nhưng checkout không giảm: chưa có automatic discount khớp, hoặc ngưỡng/phần trăm/collection lệch với block (mục 2).
- Quiz luôn ra "Text when nothing matches": chưa gắn đủ 3 tag cho cùng một sản phẩm, hoặc tag trong block khác tag trên sản phẩm (mục 3).
- Nhãn Verified hiện trên review chưa xác thực (mục 4).
- Popup không hiện mã: "Discount code" để trống (mục 5).

## Câu hỏi hay gặp

- Theme có tự giảm giá không? Không. Dòng giảm trên trang chỉ là hiển thị; giá thật do discount của Shopify áp ở checkout.
- Có cần làm hết 6 mục trước khi publish không? Mục 1, 2, 3, 4 bắt buộc. Mục 5 và 6 bắt buộc nếu store dùng popup before you leave, newsletter có mã, hoặc các block ở mục 6.
- Muốn ẩn một review hoặc câu hỏi mẫu mà không thay? Tắt "Show this review" hoặc "Show this question".
- Đổi chữ footer "Get 15% Off" ở đâu? Language editor (khóa `blocks.footer.newsletter_heading_html`, `newsletter_submit`); không có ô trong block.
- Hạn chế: tài liệu từng block (`docs/merchant/<block>.md`) chưa có đủ; ES1-T193 chỉ phủ việc trước publish.
