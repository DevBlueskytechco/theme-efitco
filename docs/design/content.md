# Hướng dẫn nội dung Efitco (Content And Voice)

Quy tắc chữ dùng chung cho mọi chuỗi trong `locales/*.json`, settings mặc định (`default_*`, `info`) và mockup. Lập ở ES1-T535 lượt 2 (CTO 21/11, patterns-08, patterns-17); sửa ở ES1-T567 (CTO 21/11: nhãn nút sentence case, mockup là nguồn chuẩn). Bản design system 2.0.0 (đề xuất, chờ CTO duyệt).

- Màn mẫu: `drafts/designer/ES1-T251/foundation.html` section `h-content` ("34b. Content And Voice"). Chuỗi trong mockup là chuỗi chuẩn; file này giải thích quy tắc.
- Nguồn: `docs/design/decisions.md` (quyết định CTO), `docs/ui-spec/foundation.md` §6, §8, §17, §37, `DESIGN.md` mục "Calls to action". Chuẩn: Polaris cho nhãn nút, toast, badge, câu lỗi; M3, Ant, Fluent 2, Spectrum cho loại chuỗi Polaris không nêu (ghi rõ ở từng dòng). Polaris không nêu voice và tone tổng quát cho storefront: file này không tự đặt thêm.
- Chuỗi trong mockup và locale mặc định viết tiếng Anh. Tài liệu viết tiếng Việt.

## 1. Nguyên tắc

1. Nói thẳng điều người mua cần biết và việc làm tiếp theo.
2. Không xin lỗi thừa ("Sorry", "Oops"), không "Please" thừa, không thuật ngữ kỹ thuật ("invalid", "error 422").
3. Một từ cho một khái niệm (§4).
4. Không tạo khẩn cấp giả, không hứa giảm giá không có thật (Theme Store R8, DESIGN.md).
5. Chuỗi thương mại chuẩn (thêm giỏ, hết hàng, thanh toán) dùng chuỗi locale của theme, không viết riêng từng section.

## 2. Viết hoa và độ dài theo loại chuỗi

Sentence case = chỉ viết hoa chữ đầu chuỗi và tên riêng. Title Case = viết hoa chữ đầu mỗi từ.

| Loại chuỗi | Viết hoa | Chuẩn | Độ dài (bản tiếng Anh) | Ví dụ |
| --- | --- | --- | --- | --- |
| Nút, link dạng nút | Sentence case | Polaris Button (CTO 21/11, thay Title Case 07/11) | 2–4 từ, mở bằng động từ, không mạo từ, không dấu câu | Add to cart · Try again · Clear all |
| Link CTA, link đầu section, link "View all …" | Sentence case | Polaris Button; Spectrum "View all" | 2–5 từ, nói rõ đích; không áp giới hạn 15 ký tự | Read the full guide · View all articles |
| Toast, tiêu đề alert | Sentence case | Polaris (toast success ≤ 3 từ); Fluent 2 (thân toast ≤ 60 ký tự) | Tiêu đề toast ≤ 3 từ và ≤ 24 ký tự; mô tả ≤ 2 dòng, ≤ 60 ký tự | Added to cart · We couldn't load these products |
| Badge, dòng tồn kho | Sentence case | Polaris Badge (1–2 từ, thì quá khứ khi là trạng thái) | 1–2 từ | Sold out · New · Only 2 left |
| Label trường | Sentence case, không dấu chấm cuối | Ant (bỏ dấu chấm ở Label, Title) | 1–3 từ, danh từ | Email address · Order number |
| Thân bài, mô tả, gợi ý, câu lỗi | Sentence case, câu đầy đủ có dấu chấm | Polaris | Câu lỗi ≤ 2 câu | Enter an email like name@example.com. |
| Tiêu đề trang, section (h1–h4), dialog, drawer, empty state | GIỮ Title Case, chờ CTO | Thiết kế: giữ theo patterns-08, V71 / V75. Polaris không nêu; M3, Ant, Fluent 2, Spectrum dùng sentence case | Tối đa 2 dòng ở 360; không dấu chấm cuối | Training Tips & Inspiration · Your Cart Is Empty |
| Tab, link menu (header, mega, drawer, footer) | GIỮ Title Case, chờ CTO. Mục là tên collection / blog / trang: theo dữ liệu | Thiết kế; độ dài theo Ant (Tabs, Top Navigation dưới 15 ký tự) | 1–2 từ, dưới 15 ký tự cho nhãn tab và mục menu cấp 1 | Weight · Our Story |
| Breadcrumb | Theo tên trang | Ant (tốt nhất dưới 3, không quá 5 cấp) | Không quá 5 cấp | Home › Free Weights › Iron Core Kettlebell |
| Display, eyebrow, nhãn nhóm, tiêu đề popup marketing | Gõ thường, CSS đổi sang HOA | Thiết kế: kiểu chữ thương hiệu (CTO 21/11 giữ). Spectrum, Fluent 2 không khuyến nghị all-caps trong component nên không mở rộng ra chỗ khác | 1–3 từ (display, tiêu đề popup: tối đa 2 dòng) | Bestsellers → BESTSELLERS |
| Tên riêng, viết tắt, nút có thương hiệu | Giữ nguyên cách viết gốc | CTO 11/11 (nút do Shopify / Apple render) | — | View FlexFold Adjustable Bench · United States USD $ · Shop Pay · Follow on Shop · Add to Apple Wallet |

- Nút và link dạng nút: áp cho mọi `<button>` và `<a class="button">`, kể cả nút đóng có chữ, nút "+N" / thu gọn, nút thử lại, nút trong empty state: "Keep shopping", "Show fewer", "Try again", "Continue shopping", "Shop bestsellers".
- Chỉ đổi hoa / thường, không đổi chữ. Sửa ngữ pháp duy nhất: "View Detail" → "View details".
- Tên riêng trong nhãn giữ hoa: tên sản phẩm, tên collection, tên nước, ngôn ngữ, mã tiền (USD), tên thương hiệu thanh toán. Nhãn có phần trăm chỉ đổi hoa thường ("Big Offer -24%" → "Big offer -24%", "Get 15% Off" → "Get 15% off").
- `aria-label` của nút chứa đúng chữ đang hiển thị (Polaris): nút hiện "Add to cart" thì tên truy cập là "Add to cart" hoặc "Add to cart: Iron Core Kettlebell".
- Text link trong câu, link chính sách giữ chữ theo dữ liệu ("Shipping policy").
- Chữ HOA do CSS tạo (`text-transform: uppercase`), không gõ tay chữ HOA trong locale. Chỉ display, eyebrow, nhãn nhóm và tiêu đề popup marketing (`.dialog__title--caps`) viết HOA.
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
| Big Offer -24% | Big offer -24% | Nút teaser |

Không đổi: "Shop Pay", "Apple Pay", "G Pay", "PayPal", "Follow on Shop", "Add to Apple Wallet" (nút có thương hiệu); "Tiếng Việt", "United States USD $" (tên riêng); "Your Cart Is Empty", "Training Tips & Inspiration", "Weight", "Our Story" (tiêu đề, tab, menu: giữ Title Case lượt này).

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
| Checkout | Check Out, Pay now, Proceed | Thuật ngữ, ngoại lệ của quy tắc "mở bằng động từ" (chờ CTO: "Checkout" hay "Check out"). Ngoại lệ: popup giữ chân (exit intent, SRS MK6) dùng cụm động từ "Check out now". Nút thanh toán nhanh do Shopify vẽ, không đổi chữ |
| Sold out | Out of stock, Unavailable (khi còn biến thể khác) | Badge và nút đều "Sold out"; "Unavailable" chỉ cho tổ hợp biến thể không tồn tại |
| View all | See all, Show all, More | Link đầu section: "View all articles" (Spectrum: "View all" thay "See all") |
| Sale · Save $120.00 | Discounted, Promo, Deal (nút thẻ Big Offer: "Shop the offer") | Badge phần trăm viết "-24%"; tiền giảm dùng dấu − (U+2212) |
| Try again | Retry, Reload, Refresh | Nút duy nhất trong alert lỗi tải, kể cả lỗi giỏ (trang cart: link tải lại `routes.cart_url`) |
| Clear all | Reset, Remove all filters, Clear filters | Bộ lọc collection, search. Trong empty state (nút đứng xa hàng chip): "Clear all filters" |

## 5. Theo component

| Component | Quy tắc chữ | Ví dụ |
| --- | --- | --- |
| Button | 2–4 từ sentence case, mở bằng động từ, nói điều xảy ra tiếp; không mạo từ, không dấu câu, không "Submit" | Send message · Notify me · Copy code |
| Link CTA, link đầu section | Sentence case, 2–5 từ, nói rõ đích | Read the full guide · See shipping dates · Browse all setups |
| Ô ảnh trong mega menu (`.collection-card--menu`) | Tiêu đề mở bằng động từ là lời kêu gọi (link dạng nút): sentence case. Chỉ là tên collection (không động từ) thì theo dữ liệu, giữ Title Case | Shop free weights · Free Weights |
| Tab | 1–2 từ, danh từ, dưới 15 ký tự; giữ Title Case lượt này | All · Weight · Recovery |
| Chip | Giá trị lọc hoặc cụm tìm, theo dữ liệu; chip gỡ có tên ẩn chứa nguyên chữ đang hiện, khuôn locale `remove_filter`: "Remove filter Color: Black" | Kettlebell · Color: Black |
| Badge | 1–2 từ sentence case; giảm giá "-N%"; màu chỉ trạng thái, tag danh mục trung tính | New · Sold out · -24% |
| Toast | Sentence case; tiêu đề success ≤ 3 từ và ≤ 24 ký tự; chi tiết (tên sản phẩm, giá) ở dòng mô tả ≤ 60 ký tự | Added to cart · Link copied · Discount applied |
| Alert | Tiêu đề sentence case = chuyện gì; 1 dòng = làm gì tiếp; nút đóng tên "Dismiss: {tiêu đề}" | Holiday shipping dates |
| Empty state | Tiêu đề nói rõ trạng thái (giữ Title Case lượt này) + 1 câu gợi ý + nút primary sentence case | Your Cart Is Empty · Shop bestsellers |
| Label trường | Danh từ, sentence case, không dấu chấm; trường bắt buộc có `*`; không placeholder thay label | Email · Order number |
| Tên truy cập nút icon | Nói rõ đối tượng, kèm số khi có | Cart, 2 items · Close menu · Remove Iron Core Kettlebell |
| Dialog marketing | Dưới 50 từ; tiêu đề HOA do CSS; nút từ chối là text link trung tính, không confirmshaming | No thanks · Keep shopping |

## 6. Chuỗi cấm và ký tự

- "Read more", "Learn more", "Click here" đứng một mình (CTO 09/11, SEO: chữ link mô tả đích).
- "Please", "Sorry", "Oops" thừa; từ kỹ thuật ("invalid", "error 422", "unexpected error").
- Chữ HOA gõ tay; "Submit" cho nút; nhãn nút Title Case ("Add To Cart", "Try Again"), có mạo từ ("Add a menu item") hay dấu câu.
- Cắt "…" cho nút, tab, badge, giá (breadcrumb là ngoại lệ duy nhất, foundation.md §5).
- Ký tự: dấu ba chấm "…" (U+2026), dấu trừ "−" (U+2212) cho tiền giảm, khoảng giá "$50–$200" (en dash). Badge phần trăm giữ ký tự đang dùng ("-24%"); chưa có quy tắc U+2212 cho badge. Số và tiền theo định dạng của Shopify (`money` filter), không tự nối ký hiệu tiền.

## 7. Chuỗi dịch dài

Giả định xấu nhất: bản dịch dài hơn tiếng Anh tới 50%; nhãn ngắn (nút, tab, badge) có thể dài gấp 3. Component xử lý thế nào: foundation.md §37.

- Không ghép câu từ nhiều chuỗi ("You have" + số + "items"): một chuỗi có biến (`{{ count }}`) và dạng số ít / số nhiều của locale (`one`, `other`).
- Không đặt biến ở vị trí buộc trật tự từ tiếng Anh khi tránh được; không cắt chuỗi bằng Liquid `truncate` cho nút, tab, badge.
- Mỗi mockup mới thử nhãn × 3 ở 360 trước khi trình.

## 8. Rà locale (Cần FE)

Chuỗi sentence case trong mockup và spec trang là ĐÚNG. Chuỗi Title Case của nút trong `locales/en.default.json` là chỗ lệch, FE sửa theo bảng (đối chiếu `origin/develop` 21/11; FE rà toàn file theo §2–§6, cùng đợt sửa `AGENTS.md` hai dòng nói về CTA Title Case).

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

- Đã đúng, không đổi: `view_cart` "View cart", `clear_all` "Clear all", `sold_out` "Sold out" (badge), `checkout` "Checkout", `continue_shopping_link` "Continue shopping", `gift_card.add_to_apple_wallet` "Add to Apple Wallet" (nút có thương hiệu).
- Giữ Title Case lượt này (tiêu đề, chờ CTO): `cart.empty_heading`, `cart.summary_title`, `404.heading`, `blocks.quiz.*_heading`, `blog.*_heading`, `blocks.bundle_builder.panel_title`, `gift_card.title`, `password.title`, `blocks.contact_form.heading`.
- Chuỗi mặc định trong settings của block (`default_*` trong schema) theo cùng quy tắc.

## 9. Còn mở

- Heading h1–h4, tiêu đề dialog / drawer, empty state, tab, link menu sang sentence case (M3, Ant, Fluent 2, Spectrum; Polaris không nêu): chờ CTO, làm lượt riêng. Danh sách chuỗi: `drafts/designer/ES1-T567/notes.md`.
- Heading đang sentence case từ trước (cùng chờ CTO chốt một hướng với nhóm Title Case; file:dòng ở `drafts/designer/ES1-T567/notes.md` mục 9.3): "Add a comment", "Country and language", "Popular searches", "Shop by category", "Popular collections", "Trending now", "Recent searches", "Pickup availability", "Cart 3 items"; tab "Country/region" (chuỗi locale theme) và tab tag blog "Diet plans" (theo dữ liệu).
- Mạo từ trong nhãn nút "Shop the offer" (quy tắc: không mạo từ): giữ, chờ CTO.
- "Checkout" hay "Check out" trên nút: chờ CTO.
- Ký tự dấu trừ trên badge phần trăm ("-24%" hay "−24%"): chưa có quy tắc.
- Voice và tone tổng quát của thương hiệu (tính cách, mức thân mật) chưa có nguồn: cần Product / CTO cung cấp nếu muốn ghi.
