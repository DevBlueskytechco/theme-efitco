# Hướng dẫn nội dung Efitco (Content And Voice)

Quy tắc chữ dùng chung cho mọi chuỗi trong `locales/*.json`, settings mặc định (`default_*`, `info`) và mockup. Lập ở ES1-T535 lượt 2 (CTO 21/11, patterns-08, patterns-17). Bản design system 1.3.0 (đề xuất, chờ CTO duyệt).

- Màn mẫu: `drafts/designer/ES1-T251/foundation.html` section `h-content` ("34b. Content And Voice").
- Nguồn: `docs/design/decisions.md` (sổ CTO thắng), `docs/ui-spec/foundation.md` §6, §8, §17, §37, `DESIGN.md` mục "Calls to action", chuẩn Polaris về câu lỗi và độ dài badge. Polaris không nêu voice và tone tổng quát cho storefront: file này không tự đặt thêm; chỉ gom quy tắc đã có.
- Chuỗi trong mockup và locale mặc định viết tiếng Anh. Tài liệu viết tiếng Việt.

## 1. Nguyên tắc

1. Nói thẳng điều người mua cần biết và việc làm tiếp theo.
2. Không xin lỗi thừa ("Sorry", "Oops"), không "Please" thừa, không thuật ngữ kỹ thuật ("invalid", "error 422").
3. Một từ cho một khái niệm (§4).
4. Không tạo khẩn cấp giả, không hứa giảm giá không có thật (Theme Store R8, DESIGN.md).
5. Chuỗi thương mại chuẩn (thêm giỏ, hết hàng, thanh toán) dùng chuỗi locale của theme, không viết riêng từng section.

## 2. Viết hoa và độ dài theo loại chuỗi

| Loại chuỗi | Viết hoa | Độ dài (bản tiếng Anh) | Ví dụ |
| --- | --- | --- | --- |
| Nút, link dạng nút | Title Case (ngoại lệ thương hiệu, CTO 07/11 và 21/11) | 2–4 từ, mở bằng động từ | Add To Cart · Try Again · Clear All |
| Tiêu đề trang, section, dialog | Title Case | Tối đa 2 dòng ở 360 | Training Tips & Inspiration |
| Display, eyebrow, nhãn nhóm | Gõ thường, CSS đổi sang HOA | 1–3 từ | Bestsellers → BESTSELLERS |
| Tab, link menu | Title Case | 1–2 từ | Weight · Our Story |
| Badge, dòng tồn kho | Sentence case | 1–2 từ | Sold out · New · Only 2 left |
| Toast | Sentence case (ĐỀ XUẤT, chờ CTO) | Tiêu đề ≤ 3 từ và ≤ 24 ký tự; mô tả ≤ 2 dòng | Added to cart |
| Thân bài, mô tả, gợi ý, lỗi, label trường | Sentence case | Câu lỗi ≤ 2 câu | Enter an email like name@example.com. |

- Title Case cho nút là ngoại lệ đã chốt so với sentence case của Polaris (sổ 07/11 "Add To Cart", ghi nhận 21/11 components-11). Không đổi. Áp cho mọi `<button>` và link dạng nút, kể cả nút đóng có chữ, nút "+N" / thu gọn, nút thử lại: "Keep Shopping", "Show Fewer", "Try Again", "Continue Shopping".
- Text link trong câu, link menu chính sách giữ chữ theo dữ liệu ("Shipping policy").
- Chữ HOA do CSS tạo (`text-transform: uppercase`), không gõ tay chữ HOA trong locale. Chỉ display, eyebrow, nhãn nhóm và tiêu đề popup marketing (Figma 1:1146) viết HOA.
- Không dấu chấm cuối ở nút, tab, badge, tiêu đề, tiêu đề toast. Câu lỗi, mô tả, gợi ý là câu đầy đủ, có dấu chấm.
- Độ dài trên là cho bản tiếng Anh; bố cục phải chịu được bản dịch dài hơn (§7).

## 3. Câu lỗi

Khuôn: chuyện gì sai + cách sửa. Đặt lỗi ngay cạnh chỗ cần sửa (chọn component: foundation.md §35).

| | Chuỗi |
| --- | --- |
| Nên | "Enter an email like name@example.com." · "Only 2 left. We changed the quantity to 2." · "We couldn't load these products. Check your connection, then try again." |
| Không nên | "Invalid email." · "Please enter a valid email address." · "Oops! Something went wrong." · "Error 422." · "Sorry, an unexpected error has occurred." |

- Lỗi trường: 1 câu nói cách sửa ("Enter your name."). Tối đa 2 câu.
- Tóm tắt lỗi đầu form: tiêu đề nêu số trường ("Check 2 fields"), danh sách mỗi dòng "Tên trường: cách sửa" là link tới trường ("Email: enter an email like name@example.com"). Không chỉ ghi "Check the form". Focus: foundation.md §12.
- Alert, toast lỗi: tiêu đề nói chuyện gì xảy ra ("We couldn't load these products", "Couldn't add to cart"), dòng dưới nói làm gì tiếp ("Check your connection, then try again."). Nút duy nhất: "Try Again".
- Thông báo tự chỉnh (warning): nói đã đổi gì và vì sao ("Only 3 left, so we set the quantity to 3.").

## 4. Thuật ngữ

| Dùng | Không dùng | Ghi chú |
| --- | --- | --- |
| Cart | Bag, Basket, Shopping cart | Nút: "Add To Cart", "View Cart" (không "View cart") |
| Checkout | Check Out, Pay now, Proceed | Nút thanh toán nhanh do Shopify vẽ, không đổi chữ |
| Sold out | Out of stock, Unavailable (khi còn biến thể khác) | Badge "Sold out"; nút "Sold Out"; "Unavailable" chỉ cho tổ hợp biến thể không tồn tại |
| Sale · Save $120.00 | Discounted, Promo, Deal | Badge phần trăm viết "-24%"; tiền giảm dùng dấu − (U+2212) |
| Try Again | Retry, Reload, Refresh | Nút duy nhất trong alert lỗi tải |
| Clear All | Reset, Remove all filters | Bộ lọc collection, search |

## 5. Theo component

| Component | Quy tắc chữ | Ví dụ |
| --- | --- | --- |
| Button | 2–4 từ Title Case, mở bằng động từ, nói điều xảy ra tiếp; không "Submit" | Send Message · Notify Me · Copy Code |
| Link CTA, link đầu section | Nói rõ đích | Read The Full Guide · See Shipping Dates · Browse All Setups |
| Tab | 1–2 từ Title Case, danh từ | All · Weight · Recovery |
| Chip | Giá trị lọc hoặc cụm tìm, theo dữ liệu; chip gỡ có tên ẩn "Remove filter: Color Black" | Kettlebell · Color: Black |
| Badge | 1–2 từ sentence case; giảm giá "-N%" | New · Sold out · -24% |
| Toast | Tiêu đề success ≤ 3 từ và ≤ 24 ký tự; chi tiết (tên sản phẩm, giá) ở dòng mô tả | Added to cart · Link copied · Discount applied |
| Alert | Tiêu đề = chuyện gì; 1 dòng = làm gì tiếp; nút đóng tên "Dismiss: {tiêu đề}" | Holiday shipping dates |
| Empty state | Tiêu đề Title Case nói rõ trạng thái + 1 câu gợi ý + primary cụ thể | Your Cart Is Empty · Shop Bestsellers |
| Label trường | Danh từ, sentence case; trường bắt buộc có `*`; không placeholder thay label | Email · Order number |
| Tên truy cập nút icon | Nói rõ đối tượng, kèm số khi có | Cart, 2 items · Close menu · Remove Iron Core Kettlebell |
| Dialog marketing | Dưới 50 từ; nút từ chối là text link trung tính, không confirmshaming | No Thanks · Keep Shopping |

## 6. Chuỗi cấm và ký tự

- "Read more", "Learn more", "Click here" đứng một mình (sổ 09/11, SEO: chữ link mô tả đích).
- "Please", "Sorry", "Oops" thừa; từ kỹ thuật ("invalid", "error 422", "unexpected error").
- Chữ HOA gõ tay; "Submit" cho nút.
- Cắt "…" cho nút, tab, badge, giá (breadcrumb là ngoại lệ duy nhất, foundation.md §5).
- Ký tự: dấu ba chấm "…" (U+2026), dấu trừ "−" (U+2212) cho tiền giảm, khoảng giá "$50–$200" (en dash). Số và tiền theo định dạng của Shopify (`money` filter), không tự nối ký hiệu tiền.

## 7. Chuỗi dịch dài

Giả định xấu nhất: bản dịch dài hơn tiếng Anh tới 50%; nhãn ngắn (nút, tab, badge) có thể dài gấp 3. Component xử lý thế nào: foundation.md §37.

- Không ghép câu từ nhiều chuỗi ("You have" + số + "items"): một chuỗi có biến (`{{ count }}`) và dạng số ít / số nhiều của locale (`one`, `other`).
- Không đặt biến ở vị trí buộc trật tự từ tiếng Anh khi tránh được; không cắt chuỗi bằng Liquid `truncate` cho nút, tab, badge.
- Mỗi mockup mới thử nhãn × 3 ở 360 trước khi trình.

## 8. Rà locale (Cần FE)

Chuỗi đang lệch trong `locales/en.default.json` (ví dụ đã thấy; FE rà toàn file theo bảng §2–§6):

| Khoá | Hiện tại | Sửa |
| --- | --- | --- |
| footer `newsletter_invalid` | "Please enter a valid email, like name@example.com." | "Enter an email like name@example.com." |
| `view_cart` (2 chỗ) | "View cart" | "View Cart" |

- `try_again` "Try Again" và `show_fewer` "Show Fewer" trong locale đã đúng Title Case. "Keep shopping", "Show fewer", "Try again" viết thường là lệch trong spec trang (marketing-popups, mini-cart-quickview, product), không ở locale: sửa khi chạm spec (foundation.md §6).
- `continue_shopping_link` "Continue shopping" là text link trong câu: giữ sentence case (§2).

## 9. Còn mở

- Tiêu đề toast viết sentence case ("Added to cart") là ĐỀ XUẤT, chờ CTO (foundation.md §17). Lý do: toast là câu trạng thái, không phải nhãn nút.
- Voice và tone tổng quát của thương hiệu (tính cách, mức thân mật) chưa có nguồn: cần Product / CTO cung cấp nếu muốn ghi.
