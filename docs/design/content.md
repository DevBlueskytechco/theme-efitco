# Hướng dẫn nội dung Efitco (Content and voice)

Quy tắc chữ dùng chung cho mọi chuỗi trong `locales/*.json`, settings mặc định (`default_*`, `info`) và mockup. Lập ở ES1-T535 lượt 2 (CTO 21/11, patterns-08, patterns-17); sửa ở ES1-T567 (CTO 21/11: nhãn nút sentence case, mockup là nguồn chuẩn; CTO 21/11 lượt 2: heading, tiêu đề dialog / drawer, empty state, tab, link menu cũng sentence case, "Checkout" giữ, "View offer", dấu trừ U+2212 cho phần trăm giảm). Bản design system 2.0.0 (CTO chốt số bản 21/11 lượt 2).

- Màn mẫu: `drafts/designer/ES1-T251/foundation.html` section `h-content` ("34b. Content and voice"). Chuỗi trong mockup là chuỗi chuẩn; file này giải thích quy tắc.
- Nguồn: `docs/design/decisions.md` (quyết định CTO), `docs/ui-spec/foundation.md` §6, §8, §17, §37, `DESIGN.md` mục "Calls to action". Chuẩn: Polaris cho nhãn nút, toast, badge, câu lỗi; M3, Ant, Fluent 2, Spectrum cho loại chuỗi Polaris không nêu (heading, tiêu đề dialog, tab, menu; ghi rõ ở từng dòng). Polaris không nêu voice và tone tổng quát cho storefront: file này không tự đặt thêm.
- Chuỗi trong mockup và locale mặc định viết tiếng Anh. Tài liệu viết tiếng Việt.

## 1. Nguyên tắc

1. Nói thẳng điều người mua cần biết và việc làm tiếp theo.
2. Không xin lỗi thừa ("Sorry", "Oops"), không "Please" thừa, không thuật ngữ kỹ thuật ("invalid", "error 422").
3. Một từ cho một khái niệm (§4).
4. Không tạo khẩn cấp giả, không hứa giảm giá không có thật (Theme Store R8, DESIGN.md).
5. Chuỗi thương mại chuẩn (thêm giỏ, hết hàng, thanh toán) dùng chuỗi locale của theme, không viết riêng từng section.

## 2. Viết hoa và độ dài theo loại chuỗi

Sentence case = chỉ viết hoa chữ đầu chuỗi và danh từ riêng. Title Case = viết hoa chữ đầu mỗi từ. Từ CTO 21/11 lượt 2, MỌI chữ giao diện của theme là sentence case; Title Case chỉ còn ở dữ liệu merchant và tên riêng (§2.2).

| Loại chuỗi | Viết hoa | Chuẩn | Độ dài (bản tiếng Anh) | Ví dụ |
| --- | --- | --- | --- | --- |
| Nút, link dạng nút | Sentence case | Polaris Button (CTO 21/11, thay Title Case 07/11) | 2–4 từ, mở bằng động từ, không mạo từ, không dấu câu | Add to cart · Try again · Clear all |
| Link CTA, link đầu section, link "View all …" | Sentence case | Polaris Button; Spectrum "View all" | 2–5 từ, nói rõ đích; không áp giới hạn 15 ký tự | Read the full guide · View all articles |
| Toast, tiêu đề alert | Sentence case | Polaris (toast success ≤ 3 từ); Fluent 2 (thân toast ≤ 60 ký tự) | Tiêu đề toast ≤ 3 từ và ≤ 24 ký tự; mô tả ≤ 2 dòng, ≤ 60 ký tự | Added to cart · We couldn't load these products |
| Badge, dòng tồn kho | Sentence case | Polaris Badge (1–2 từ, thì quá khứ khi là trạng thái) | 1–2 từ | Sold out · New · Only 2 left |
| Label trường | Sentence case, không dấu chấm cuối | Ant (bỏ dấu chấm ở Label, Title) | 1–3 từ, danh từ | Email address · Order number |
| Thân bài, mô tả, gợi ý, câu lỗi | Sentence case, câu đầy đủ có dấu chấm | Polaris | Câu lỗi ≤ 2 câu | Enter an email like name@example.com. |
| Tiêu đề trang, section (h1–h4), dialog, drawer, popup, empty state | Sentence case | CTO 21/11 lượt 2 (thay Title Case của patterns-08, V71 / V75). Chuẩn: M3, Ant, Fluent 2, Spectrum (Polaris không nêu) | Tối đa 2 dòng ở 360; không dấu chấm cuối | Browse categories · What people are buying? · Your cart is empty · Choose a color |
| Tab, link menu (header, mega, drawer, footer), nhãn chip lọc là chữ giao diện | Sentence case. Mục là tên collection / sản phẩm / bài viết: theo dữ liệu (§2.2) | CTO 21/11 lượt 2; độ dài theo Ant (Tabs, Top Navigation dưới 15 ký tự) | 1–2 từ, dưới 15 ký tự cho nhãn tab và mục menu cấp 1 | Weight · Our story · Contact us · In stock |
| Breadcrumb | Theo tên trang: tên collection / sản phẩm / bài viết theo dữ liệu; trang do theme đặt tên thì sentence case | Ant (tốt nhất dưới 3, không quá 5 cấp) | Không quá 5 cấp | Home › Free Weights › Iron Core Kettlebell · Home › Your gear shortlist |
| Display, eyebrow, nhãn nhóm, tiêu đề popup marketing | Gõ sentence case, CSS đổi sang HOA | Bản sắc thương hiệu (CTO 21/11 lượt 2 giữ). Spectrum, Fluent 2 không khuyến nghị all-caps trong component nên không mở rộng ra chỗ khác | 1–3 từ (display, tiêu đề popup: tối đa 2 dòng) | Bestsellers → BESTSELLERS · Train hard → TRAIN HARD |
| Tên riêng, viết tắt, nút có thương hiệu | Giữ nguyên cách viết gốc | CTO 11/11 (nút do Shopify / Apple render) | — | View FlexFold Adjustable Bench · United States USD $ · Shop Pay · Follow on Shop · Add to Apple Wallet |

- Nút và link dạng nút: áp cho mọi `<button>` và `<a class="button">`, kể cả nút đóng có chữ, nút "+N" / thu gọn, nút thử lại, nút trong empty state: "Keep shopping", "Show fewer", "Try again", "Continue shopping", "Shop bestsellers".
- Chỉ đổi hoa / thường, không đổi chữ. Hai chỗ đổi chữ: "View Detail" → "View details" (ngữ pháp), nút big offer "Shop the offer" → "View offer" (nút không mạo từ, CTO 21/11 lượt 2).
- Tên riêng trong nhãn giữ hoa: tên sản phẩm, tên collection, tên nước, ngôn ngữ, mã tiền (USD), tên thương hiệu thanh toán. Nhãn có phần trăm đổi hoa thường và dùng dấu trừ U+2212 ("Big Offer -24%" → "Big offer −24%", "Get 15% Off" → "Get 15% off").
- `aria-label` của nút chứa đúng chữ đang hiển thị (Polaris): nút hiện "Add to cart" thì tên truy cập là "Add to cart" hoặc "Add to cart: Iron Core Kettlebell".
- Text link trong câu, link chính sách giữ chữ theo dữ liệu ("Shipping policy").
- Chữ HOA do CSS tạo (`text-transform: uppercase`), không gõ tay chữ HOA trong locale: chữ nguồn luôn sentence case ("Get 15% off your first order" hiện HOA ở footer). Chỉ display, eyebrow, nhãn nhóm và tiêu đề popup marketing (`.dialog__title--caps`) viết HOA.
- `aria-label`, `alt`, `title` của heading, dialog, tab, menu theo cùng quy tắc ("Close cart", "Close menu", "Main menu").
- Không dấu chấm cuối ở nút, tab, badge, label, tiêu đề, tiêu đề toast. Câu lỗi, mô tả, gợi ý là câu đầy đủ, có dấu chấm.
- Độ dài trên là cho bản tiếng Anh; bố cục phải chịu được bản dịch dài hơn (§7).

### 2.1 Ví dụ đổi (Title Case → sentence case)

| Trước | Sau | Loại |
| --- | --- | --- |
| Add To Cart | Add to cart | Nút |
| Add Setup To Cart · Add Bundle To Cart | Add setup to cart · Add bundle to cart | Nút |
| View Detail | View details | Nút (sửa ngữ pháp) |
| Get 15% Off | Get 15% off | Nút newsletter (phần nhấn trong heading display giữ HOA do CSS) |
| Try Again · Clear All · Show Fewer | Try again · Clear all · Show fewer | Nút |
| Explore Equipment · Become A Member · Shop Bestsellers | Explore equipment · Become a member · Shop bestsellers | Nút CTA |
| Send Message · Notify Me · Copy Code · Print Gift Card | Send message · Notify me · Copy code · Print gift card | Nút icon + nhãn |
| Keep Shopping · Continue Shopping · No Thanks | Keep shopping · Continue shopping · No thanks | Nút / text link từ chối |
| Read The Full Guide · See Shipping Dates · Browse All Setups | Read the full guide · See shipping dates · Browse all setups | Link CTA |
| View All Articles · View All 12 Matches | View all articles · View all 12 matches | Link "View all …" |
| Sold Out (nút) | Sold out | Nút disabled, giống badge |
| Buy It Now · Check Out Now | Buy it now · Check out now | Nút |
| Big Offer -24% | Big offer −24% | Nút teaser (dấu trừ U+2212) |
| Shop The Deal · Shop the offer | View offer | Nút popover big offer (không mạo từ, CTO 21/11 lượt 2) |
| Browse Categories · Choose Your Training Level | Browse categories · Choose your training level | Tiêu đề section |
| What People Are Buying? · Training Tips & Inspiration | What people are buying? · Training tips & inspiration | Tiêu đề section |
| You May Also Like · Pairs Well With · Customer Reviews | You may also like · Pairs well with · Customer reviews | Tiêu đề section PDP |
| Your Cart · Order Summary · Your Bundle | Cart · Order summary · Your bundle | Tiêu đề drawer, panel (drawer mini cart rút còn "Cart", CTO 23/11) |
| Choose A Color · Your Gear Shortlist | Choose a color · Your gear shortlist | Tiêu đề dialog |
| Your Cart Is Empty · No Exact Match · No Articles Yet | Your cart is empty · No exact match · No articles yet | Empty state |
| Page Not Found · Search Results · Opening Soon | Page not found · Search results · Opening soon | h1, eyebrow |
| Our Story · Contact Us | Our story · Contact us | Link menu (header, drawer, footer) |
| 1 Year Warranty · Fast Shipping · 90 Day Money Back | 1 year warranty · Fast shipping · 90 day money back | Cam kết (footer, PDP) |
| 24 Products · 5 Items · 2 Comments | 24 products · 5 items · 2 comments | Số đếm trên card, badge, heading |
| Get 15% Off Your First Order | Get 15% off your first order | Heading newsletter (hiện HOA do CSS) |

Không đổi: "Shop Pay", "Apple Pay", "G Pay", "PayPal", "Follow on Shop", "Add to Apple Wallet" (nút có thương hiệu); "Tiếng Việt", "United States USD $" (tên riêng); "Checkout" (thuật ngữ, §4); "Shop free weights" (tiêu đề ô ảnh mega là link dạng nút, đã sentence case).

### 2.2 Giữ nguyên cách viết (ngoại lệ của sentence case)

| Loại | Quy tắc | Ví dụ |
| --- | --- | --- |
| Tên thương hiệu | Giữ | Efitco · Why choose Efitco? |
| Tên sản phẩm, collection, bài viết, blog, trang (dữ liệu merchant) | In đúng như merchant nhập, ở card, breadcrumb, menu trỏ tới collection, tab là tên collection / tag | Free Weights · Benches & Racks · Recovery & Mobility · Iron Core Kettlebell 16 kg · Home Starter Kit |
| Tên riêng, tên nước, ngôn ngữ, phương thức thanh toán | Giữ | Shop Pay · Apple Pay · United States · Tiếng Việt |
| Từ viết tắt, mã tiền | Giữ HOA | FAQ · FAQs · USD · QR |
| Tên collection nằm trong chuỗi của theme | Chữ của theme sentence case, tên giữ | Nothing in Accessories yet · Featured product · Free Weights |

- Theme không đổi hoa thường dữ liệu merchant bằng Liquid (`capitalize`, `downcase`) hay CSS, trừ kiểu HOA của display / eyebrow / nhãn nhóm.
- Menu: mục do merchant đặt tên trong Navigation là dữ liệu merchant; chuỗi mẫu trong mockup, `default_*` và tài liệu merchant viết sentence case ("Our story", "Contact us"), mục trỏ tới collection lấy tên collection ("Free Weights").

## 3. Câu lỗi

Khuôn: chuyện gì sai + cách sửa. Đặt lỗi ngay cạnh chỗ cần sửa (chọn component: foundation.md §35).

| | Chuỗi |
| --- | --- |
| Nên | "Enter an email like name@example.com." · "Only 2 left. We changed the quantity to 2." · "We couldn't load these products. Check your connection, then try again." |
| Không nên | "Invalid email." · "Please enter a valid email address." · "Oops! Something went wrong." · "Error 422." · "Sorry, an unexpected error has occurred." |

- Lỗi trường: 1 câu nói cách sửa ("Enter your name."). Tối đa 2 câu.
- Tóm tắt lỗi đầu form: tiêu đề nêu số trường ("Check 2 fields"), danh sách mỗi dòng "Tên trường: cách sửa" là link tới trường ("Email: enter an email like name@example.com"). Không chỉ ghi "Check the form". Focus: foundation.md §12.
- Alert, toast lỗi: tiêu đề sentence case nói chuyện gì xảy ra ("We couldn't load these products", "Couldn't add to cart"), dòng dưới nói làm gì tiếp ("Check your connection, then try again."). Nút duy nhất: "Try again".
- Thông báo tự chỉnh (warning): nói đã đổi gì và vì sao ("Only 3 left, so we set the quantity to 3.").

## 4. Thuật ngữ

| Dùng | Không dùng | Ghi chú |
| --- | --- | --- |
| Cart | Bag, Basket, Shopping cart | Nút: "Add to cart", "View cart" |
| Checkout | Check Out, Pay now, Proceed | Thuật ngữ, ngoại lệ của quy tắc "mở bằng động từ" (CTO 21/11 lượt 2: giữ "Checkout"). Ngoại lệ: popup giữ chân (exit intent, SRS MK6) dùng cụm động từ "Check out now". Nút thanh toán nhanh do Shopify vẽ, không đổi chữ |
| Sold out | Out of stock, Unavailable (khi còn biến thể khác) | Badge và nút đều "Sold out"; "Unavailable" chỉ cho tổ hợp biến thể không tồn tại |
| View all | See all, Show all, More | Link đầu section: "View all articles" (Spectrum: "View all" thay "See all") |
| Sale · Save $120.00 | Discounted, Promo, Deal (nút thẻ big offer: "View offer") | Badge phần trăm và tiền giảm dùng dấu trừ − (U+2212): "−24%", "−$77.10"; không gõ dấu nối "-" (CTO 21/11 lượt 2) |
| Try again | Retry, Reload, Refresh | Nút duy nhất trong alert lỗi tải, kể cả lỗi giỏ (trang cart: link tải lại `routes.cart_url`) |
| Clear all | Reset, Remove all filters, Clear filters | Bộ lọc collection, search. Trong empty state (nút đứng xa hàng chip): "Clear all filters" |

## 5. Theo component

| Component | Quy tắc chữ | Ví dụ |
| --- | --- | --- |
| Button | 2–4 từ sentence case, mở bằng động từ, nói điều xảy ra tiếp; không mạo từ, không dấu câu, không "Submit" | Send message · Notify me · Copy code · View offer |
| Heading (h1–h4), tiêu đề section | Sentence case; không dấu chấm cuối; tối đa 2 dòng ở 360. Tên sản phẩm / collection / bài viết theo dữ liệu | Browse categories · What people are buying? · You may also like |
| Link CTA, link đầu section | Sentence case, 2–5 từ, nói rõ đích | Read the full guide · See shipping dates · Browse all setups |
| Ô ảnh trong mega menu (`.collection-card--menu`) | Tiêu đề mở bằng động từ là lời kêu gọi (link dạng nút): sentence case. Chỉ là tên collection (không động từ) thì theo dữ liệu, giữ cách merchant viết (CTO 21/11 lượt 2: "Shop free weights" giữ là link dạng nút) | Shop free weights · Free Weights |
| Tab | 1–2 từ, danh từ, dưới 15 ký tự; sentence case; tab là tên collection / tag blog theo dữ liệu | All · Weight · Recovery · Country/region |
| Link menu (header, mega, drawer, footer) | Sentence case; mục trỏ tới collection lấy tên collection | Our story · Contact us · Free Weights |
| Chip | Giá trị lọc hoặc cụm tìm, theo dữ liệu; chip gỡ có tên ẩn chứa nguyên chữ đang hiện, khuôn locale `remove_filter`: "Remove filter Color: Black" | Kettlebell · Color: Black |
| Badge | 1–2 từ sentence case; giảm giá "−N%" với dấu trừ U+2212; màu chỉ trạng thái, tag danh mục trung tính | New · Sold out · −24% |
| Toast | Sentence case; tiêu đề success ≤ 3 từ và ≤ 24 ký tự; chi tiết (tên sản phẩm, giá) ở dòng mô tả ≤ 60 ký tự | Added to cart · Link copied · Discount applied |
| Alert | Tiêu đề sentence case = chuyện gì; 1 dòng = làm gì tiếp; nút đóng tên "Dismiss: {tiêu đề}" | Holiday shipping dates |
| Empty state | Tiêu đề sentence case nói rõ trạng thái + 1 câu gợi ý + nút primary sentence case | Your cart is empty · Shop bestsellers |
| Label trường | Danh từ, sentence case, không dấu chấm; trường bắt buộc có `*`; không placeholder thay label | Email · Order number |
| Tên truy cập nút icon | Nói rõ đối tượng, kèm số khi có | Cart, 2 items · Close menu · Remove Iron Core Kettlebell |
| Dialog, drawer | Tiêu đề sentence case, nói đúng việc đang làm | Choose a color · Cart · Country and language |
| Dialog marketing | Dưới 50 từ; tiêu đề gõ sentence case, HOA do CSS (bản sắc thương hiệu); nút từ chối là text link trung tính, không confirmshaming | Before you go · No thanks · Keep shopping |

## 6. Chuỗi cấm và ký tự

- "Read more", "Learn more", "Click here" đứng một mình (CTO 09/11, SEO: chữ link mô tả đích).
- "Please", "Sorry", "Oops" thừa; từ kỹ thuật ("invalid", "error 422", "unexpected error").
- Chữ HOA gõ tay; "Submit" cho nút; nhãn nút Title Case ("Add To Cart", "Try Again"), có mạo từ ("Add a menu item", "Shop the offer") hay dấu câu; heading, tiêu đề dialog, tab, link menu Title Case ("Your Cart Is Empty", "Our Story").
- Cắt "…" cho nút, tab, badge, giá (breadcrumb là ngoại lệ duy nhất, foundation.md §5).
- Ký tự: dấu ba chấm "…" (U+2026), dấu trừ "−" (U+2212) cho tiền giảm và phần trăm giảm ("−$77.10", "−24%"; không gõ dấu nối "-", CTO 21/11 lượt 2), khoảng giá "$50–$200" (en dash). Số và tiền theo định dạng của Shopify (`money` filter), không tự nối ký hiệu tiền.

## 7. Chuỗi dịch dài

Giả định xấu nhất: bản dịch dài hơn tiếng Anh tới 50%; nhãn ngắn (nút, tab, badge) có thể dài gấp 3. Component xử lý thế nào: foundation.md §37.

- Không ghép câu từ nhiều chuỗi ("You have" + số + "items"): một chuỗi có biến (`{{ count }}`) và dạng số ít / số nhiều của locale (`one`, `other`).
- Không đặt biến ở vị trí buộc trật tự từ tiếng Anh khi tránh được; không cắt chuỗi bằng Liquid `truncate` cho nút, tab, badge.
- Mỗi mockup mới thử nhãn × 3 ở 360 trước khi trình.

## 8. Rà locale (Cần FE)

Chuỗi sentence case trong mockup và spec trang là ĐÚNG. Chuỗi Title Case trong `locales/en.default.json` là chỗ lệch, FE sửa theo hai bảng (§8.1 nút, §8.2 heading / dialog / tab / menu / số đếm / ký tự) (đối chiếu `origin/develop` 21/11; FE rà toàn file theo §2–§6, cùng đợt sửa `AGENTS.md` hai dòng nói về CTA Title Case).

### 8.1 Nút, link dạng nút

| Khoá | Hiện tại | Sửa |
| --- | --- | --- |
| `blocks.product_form.add_to_cart` | "Add To Cart" | "Add to cart" |
| `blocks.quiz.card_add` | "Add To Cart: {{ title }}" | "Add to cart: {{ title }}" |
| `blocks.bundle_builder.submit` | "Add Bundle To Cart" | "Add bundle to cart" |
| `blocks.shop_the_look.submit` | "Add Setup To Cart" | "Add setup to cart" |
| `blocks.featured_product.view_detail` | "View Detail" | "View details" |
| `blocks.featured_collection.view_all_products` | "View All Products" | "View all products" |
| `blocks.collection_products.empty_cta`, `collections.empty_cta` | "Shop All Products" | "Shop all products" |
| `blocks.header.sign_in` | "Sign In" | "Sign in" |
| `blocks.image_with_text.banner_button_label` · `why_button_label` | "Get Started Now" · "View About Us" | "Get started now" · "View about us" |
| `blocks.slideshow_slide.default_button_label`, `blog.empty_button` | "Explore Equipment" | "Explore equipment" |
| `blocks.quiz.choose_options` · `card_choose` | "Choose Options" · "Choose Options for {{ title }}" | "Choose options" · "Choose options for {{ title }}" |
| `blocks.quiz.change_answers` · `restart` · `submit` · `shop_all` | "Change My Answers" · "Retake Quiz" · "See My Shortlist" · "Shop All Equipment" | "Change my answers" · "Retake quiz" · "See my shortlist" · "Shop all equipment" |
| `blocks.quiz.sold_out` | "Sold Out" | "Sold out" |
| `blocks.quiz.view_all` | "View All {{ total }} Matches" | "View all {{ total }} matches" |
| `404.home` | "Back To Homepage" | "Back to homepage" |
| `blog.comment_form_submit` · `blog.empty_tag_button` | "Post Comment" · "View All Articles" | "Post comment" · "View all articles" |
| `contact.submit` | "Send Message" | "Send message" |
| `contact.continue_shopping`, `cart.continue_shopping` | "Continue Shopping" | "Continue shopping" |
| `cart.empty_cta` | "Shop Bestsellers" | "Shop bestsellers" |
| `gift_card.copy` · `print` · `start_shopping` · `contact` | "Copy Code" · "Print Gift Card" · "Start Shopping" · "Contact Us" | "Copy code" · "Print gift card" · "Start shopping" · "Contact us" |
| `general.try_again` | "Try Again" | "Try again" |
| `password.notify` · `enter_using` · `enter_store` | "Notify Me" · "Enter Using Password" · "Enter Store" | "Notify me" · "Enter using password" · "Enter store" |
| footer `newsletter_invalid` | "Please enter a valid email, like name@example.com." | "Enter an email like name@example.com." |
| `search.clear_all_filters` | "Clear All Filters" | "Clear all filters" |
| `search.shop_all` | "Shop All Products" | "Shop all products" |
| `products.variant.show_fewer` | "Show Fewer" | "Show fewer" |
| Nút popover big offer (`default_*` của block big offer; code chưa có khoá locale riêng) | "Shop the offer" (bản mockup lượt 1) | "View offer" |

- Đã đúng, không đổi: `view_cart` "View cart", `clear_all` "Clear all", `sold_out` "Sold out" (badge), `checkout` "Checkout" (thuật ngữ, CTO 21/11 lượt 2), `continue_shopping_link` "Continue shopping", `gift_card.add_to_apple_wallet` "Add to Apple Wallet" (nút có thương hiệu).

### 8.2 Heading, tiêu đề dialog / drawer, empty state, tab, menu, số đếm, ký tự (CTO 21/11 lượt 2)

Đối chiếu `locales/en.default.json` của nhánh 21/11. Cột Loại: H = heading / tiêu đề section, D = tiêu đề dialog / drawer / panel, E = empty state hoặc lỗi, M = menu / tab / eyebrow, N = số đếm, K = ký tự.

| Khoá | Loại | Hiện tại | Sửa |
| --- | --- | --- | --- |
| `404.heading` | H | "Page Not Found" | "Page not found" |
| `search.results_title` | H | "Search Results" | "Search results" |
| `password.title` | M | "Opening Soon" | "Opening soon" |
| `gift_card.title` | H | "Your {{ shop }} Gift Card" | "Your {{ shop }} gift card" |
| `blocks.quiz.default_heading` | H | "Find Your Perfect Gear" | "Find your perfect gear" |
| `blocks.quiz.results_heading` | D | "Your Gear Shortlist" | "Your gear shortlist" |
| `blocks.quiz.empty_heading` | E | "No Exact Match" | "No exact match" |
| `blocks.quiz.error_heading` | E | "We Couldn't Load Your Matches" | "We couldn't load your matches" |
| `blocks.testimonials.default_heading` | H | "What Our Customers Say?" | "What our customers say?" |
| `blocks.slideshow_slide.default_heading_html` | H | "Level Up<br> Your Fitness" | "Level up<br> your fitness" (display, HOA do CSS) |
| `blocks.image_with_text.why_heading_html` | H | "Why Choose<br> efitco?" | "Why choose<br> Efitco?" (tên thương hiệu viết hoa chữ đầu; display HOA do CSS) |
| `blocks.contact_form.heading` | H | "Send Us A Message" | "Send us a message" |
| `blocks.contact_aside.heading` | H | "Quick Answers Before You Write" | "Quick answers before you write" |
| `blocks.contact_aside.eyebrow` | M | "Questions and Answers" | "Questions and answers" |
| `blocks.bundle_builder.panel_title` | D | "Your Bundle" | "Your bundle" |
| `cart.summary_title` | D | "Order Summary" | "Order summary" |
| `cart.empty_heading` | E | "Your Cart Is Empty" | "Your cart is empty" |
| `collections.empty_heading` | E | "No Collections Yet" | "No collections yet" |
| `blocks.collection_products.empty_heading` · `empty_filtered_heading` · `page_empty_heading` | E | "No Products Here Yet" · "No Matching Products" · "No Products on This Page" | "No products here yet" · "No matching products" · "No products on this page" |
| `search.no_results_title_html` · `filtered_empty_title` · `page_empty_title` | E | "Nothing Matches “{{ terms }}” Yet" · "No Products Match These Filters" · "This Page Has No Results" | "Nothing matches “{{ terms }}” yet" · "No products match these filters" · "This page has no results" |
| `blog.empty_heading` · `empty_tag_heading` · `related_heading` | E, H | "No Articles Yet" · "No Articles On This Topic" · "More Articles" | "No articles yet" · "No articles on this topic" · "More articles" |
| `blog.comments_count.one` · `other` | N | "{{ count }} Comment" · "{{ count }} Comments" | "{{ count }} comment" · "{{ count }} comments" |
| `blocks.level_card.products_count.one` · `other` | N | "{{ count }} Product" · "{{ count }} Products" | "{{ count }} product" · "{{ count }} products" |
| `blocks.bundle_builder.count_one` · `count_other` | N | "%n Item" · "%n Items" | "%n item" · "%n items" |
| `cart.item_count_badge.one` · `other` | N | "{{ count }} Item" · "{{ count }} Items" | "{{ count }} item" · "{{ count }} items" |
| `blocks.featured_product.seal_label` | M | "Feature Product" | "Feature product" |
| `blocks.shop_the_look.discount` | M | "Setup Discount (%p%)" | "Setup discount (%p%)" |
| `blocks.level_card.default_label` | M | "Level  Fitness" (2 dấu cách) | "Level fitness" |
| `products.card.sale_percent` | K | "-{{ percent }}%" (dấu nối) | "−{{ percent }}%" (U+2212) |
| `cart.discount_value` | K | "-{{ amount }}" (dấu nối) | "−{{ amount }}" (U+2212) |

- Heading, tiêu đề dialog, tab, menu không có khoá locale mà nằm ở `default_*` của schema block, preset trong `templates/*.json` hoặc dữ liệu store dev: cùng quy tắc. Chuỗi mockup cần khớp: "Browse categories", "Choose your training level", "What people are buying?", "Training tips & inspiration", "Pick your kit, save as you go", "See real equipment in action, before you buy", "You may also like", "You may also need", "Pairs well with", "Customer reviews", "More training tips", "Popular products", "Get 15% off your first order", "Take 15% off your first order", "Before you go", "Your cart is saved", "You're on the list", "You're already subscribed", "Cart" (tiêu đề cart drawer), "Choose a color"; cam kết "1 year warranty", "Fast shipping", "Premium quality", "90 day money back".
- Menu của store dev (Navigation): "Our story", "Contact us" (DevOps đổi tên mục menu và tiêu đề trang nếu muốn khớp mockup); mục trỏ tới collection giữ tên collection.
- Đã sentence case từ trước, không đổi: "Add a comment", "Country and language", "Popular searches", "Shop by category", "Popular collections", "Trending now", "Recent searches", "Pickup availability", tab "Country/region".
- Chuỗi mặc định trong settings của block (`default_*` trong schema) theo cùng quy tắc.
- Sau khi FE đổi: `docs/merchant/*.md` in giá trị mặc định của code (bundle-builder.md, pre-publish.md) sửa theo; QA đổi assert chuỗi trong e2e.

## 9. Còn mở

Đã đóng ở CTO 21/11 lượt 2: heading, tiêu đề dialog / drawer, empty state, tab, link menu sentence case; "Checkout" giữ; "View offer"; dấu trừ U+2212 cho phần trăm giảm.

- Voice và tone tổng quát của thương hiệu (tính cách, mức thân mật) chưa có nguồn: cần Product / CTO cung cấp nếu muốn ghi.
