KHÔNG CHẮC: SRS 0.2 không có story/AC cho 3 popup (chỉ newsletter footer TE-1 AC6), demo-data không có mã giảm giá (WELCOME15 là mã mẫu), "khu vực khuyến mãi" của offer hiểu là deal Figma 1:759 → hỏi BA ES1-T273. Hành vi customer form khi email đã đăng ký, mở lại popup sau POST không JS, ngân sách JS → hỏi Tech Lead ES1-T274.

# UI spec: Popup marketing — newsletter, before you leave, big offer (ES1-T263)

Mục đích: thu email và giữ người mua sắp rời đi mà không phá trải nghiệm và chỉ tiêu Lighthouse (sổ quyết định 09/11). Người mua phải: thấy ưu đãi khi đã quan tâm (không phải lúc vừa vào), đóng được bằng 1 chạm, nhận mã hoặc quay lại giỏ trong 1 bước.
Story: TE-9 (overlay toàn theme, sổ quyết định 09/11); newsletter liên quan TE-1 AC6. Chưa có AC riêng (ES1-T273).

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T263/marketing-popups.html` + `marketing-popups-360|768|1280|1920.png`. Nhúng `../_kit/kit.css`; CSS riêng ở `<style>` đầu file. Trạng thái ở mục 5 cuối file.

Nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 > bộ kiến thức (file `NN`). Figma không có popup nào. Copy newsletter lấy Figma 1:1146 (footer); deal lấy Figma 1:759 (featured product, đếm ngược). Mọi thứ khác là `ĐỀ XUẤT:` kèm nguồn. Thành phần nền: `docs/ui-spec/foundation.md` §6 nút, §12 form, §16 dialog/bottom sheet, §17 toast, §18 trạng thái, §19 motion.

---

## 1. Quy tắc chung cho cả 3 popup

| Quy tắc | Giá trị | Nguồn |
| --- | --- | --- |
| Không mở lúc tải trang | newsletter: ≥ 10 s VÀ cuộn ≥ 50%; before you leave: ý định rời trang sau ≥ 15 s; big offer: chỉ mở khi người mua rê/chạm nút | Sổ quyết định 09/11 (Performance); 15 §1; 22 §6 #1 |
| Một lớp | không mở khi drawer, dialog, mega menu, search đang mở; chờ đóng xong mới xét lại | 15 §1; foundation §16 |
| Tần suất | tối đa 1 popup **tự mở** mỗi phiên (newsletter hoặc before you leave, cái nào tới trước); đóng newsletter thì không hiện lại trong 7 ngày (setting); đã đăng ký thì không hiện nữa | 15 §1 (Frequency capping); 22 §7 |
| Không hiện ở | 404, cart, password, gift card, trang tài khoản; khách đăng nhập có `customer.accepts_marketing` thì không render newsletter | 15 §1 (không popup 404); 22 §6 #9 |
| Đóng | nút × (48 mobile, 40–48 desktop), Escape, chạm scrim, vuốt xuống trên sheet; "No, thanks" trung tính (không confirmshaming) | 15 §1, §2; 14 |
| Mobile | bottom sheet, cao ≤ 60% màn hình, thấy được nội dung phía sau; không full-screen | 15 §1–2; Google intrusive interstitial (ticket) |
| Nội dung | < 50 từ, tiêu đề nói rõ ưu đãi, 1 CTA chính, nhãn mở bằng động từ | 15 §1; 04 §1–2 |
| Không JS | không popup nào (trigger cần JS); form newsletter footer vẫn chạy (NFR-4) | SRS NFR-4 |

Thứ tự ưu tiên khi trùng thời điểm: before you leave > newsletter (người mua sắp rời đi). Big offer không tính vào giới hạn phiên vì người mua tự mở.

---

## 2. Newsletter popup

Figma: không có popup; copy và nút theo footer 1:1146 (heading "Get 15% Off Your First Order", "Get 15% Off" phần nhấn cam, mô tả, nút "Get 15% Off" + icon gửi, "No spam. Unsubscribe anytime."). Ảnh: `efx-news.jpg` (ảnh newsletter footer, `layout/theme.liquid`).

### Anatomy
1. Scrim `--overlay-scrim`.
2. Dialog (modal) M: ảnh trái (≥ 48rem) · thân phải.
3. Nút đóng × (`.close-button`, góc inline-end trên).
4. Tiêu đề h2 `aria-labelledby`: "Get 15% Off" màu `--color-accent`, phần còn lại `--color-foreground`; heading 700 uppercase, 28 → 36, lh 44/36, letter-spacing −0.02em (Figma 1:1148).
5. Mô tả 16/26 `--color-muted`, `aria-describedby` (ẩn dưới 48rem).
6. Form `customer`: label "Email" (14/600) · input email (`autocomplete="email"`, placeholder "name@example.com") · checkbox đồng ý · nút primary full "Get 15% Off" + icon gửi.
7. Hàng link: "No, thanks" (button, đóng + ghi nhớ) · "Privacy policy" (`shop.privacy_policy.url`).

ĐỀ XUẤT checkbox đồng ý (ticket: "đồng ý nhận tin"): bỏ trống mặc định, bắt buộc khi setting bật; nhãn "I agree to get emails from Efitco. No spam. Unsubscribe anytime." gộp câu ghi chú Figma 1:1155 vào nhãn để sheet mobile thấp hơn. Nguồn: 04 §5, 05 §5 (form thiếu dữ liệu bắt buộc thì không cho gửi).

### Layout

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Kiểu | bottom sheet, rộng 100%, bo 24 hai góc trên, thanh kéo 40 × 4 | dialog giữa màn, 720 (728 khả dụng) | dialog 720 | dialog 720 |
| Ảnh | không (giảm cao, không tải ảnh) | cột trái 264, `object-fit: cover`, phủ hết cao | cột trái 288 | 288 |
| Padding thân | 32 / 16 / 16 | 32 | 48 / 48 / 32 | 48 / 48 / 32 |
| Mô tả | ẩn | hiện | hiện | hiện |
| Tiêu đề | 28, 2 dòng | 32 | 36 | 36 |
| Khoảng cách | stack 16; tiêu đề → mô tả 12 | như 360 | như 360 | như 360 |
| Cao đo trên PNG | ~400 / 720 (56%) | ~520 | ~560 | ~560 |
| Nút | cao 48 | 48 | 52 | 52 |

Mobile chỉ còn tiêu đề + form vì 15 §1 "không che nội dung chính" và ticket "không che nội dung chính trên mobile": để cả mô tả thì sheet ~70% màn (đo trên bản nháp). Dialog dùng `--radius-dialog` (24), padding 0 để ảnh chạm mép, `overflow: hidden auto`.

### Settings merchant (block `newsletter-popup`, gọi từ `layout/theme.liquid`)

| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Show newsletter popup | checkbox | ĐỀ XUẤT false (câu CTO 3) | — |
| Image | image_picker | `efx-news.jpg` truyền từ layout như footer | ảnh dọc 3:4, ≥ 600 px rộng |
| Heading | inline_richtext | `<em>Get 15% Off</em> Your First Order` (`<em>` hiện màu accent, không nghiêng) | ≤ 8 từ |
| Text | inline_richtext | Figma 1:1149 | ≤ 30 từ |
| Button label | text | Get 15% Off | 2–4 từ |
| Show consent checkbox | checkbox | true | — |
| Consent text | text | I agree to get emails from Efitco. No spam. Unsubscribe anytime. | — |
| Show privacy policy link | checkbox | true | ẩn nếu shop chưa có policy |
| Delay in seconds | range | 10 | 5–60, bước 5 |
| Scroll depth | range (%) | 50 | 0–90, bước 10 |
| Days before showing again | range | 7 | 1–30 |
| Show on mobile | checkbox | true | — |

Nguồn delay/scroll: 15 §1 (5–10 s hoặc cuộn 50–60%). Mở khi **cả hai** điều kiện đạt (ĐỀ XUẤT, 22 §6 "trigger theo hành vi"; đồng thời Lighthouse không cuộn nên popup không bao giờ mở trong lần đo).

---

## 3. Before you leave (exit intent)

Figma: không có. ĐỀ XUẤT theo 15 §1, §2 #12; 22 §8.

### Trigger
- Desktop (con trỏ chuột): con trỏ ra khỏi cửa sổ qua mép trên (`clientY ≤ 0`, `relatedTarget` null) sau ≥ 15 s trên trang (setting). Không mở nếu người mua đang gõ trong ô nhập.
- Mobile/tablet cảm ứng: ticket ghi "quay lại trên mobile"; 15 §1 và 22 §8 khuyên tránh mobile. ĐỀ XUẤT setting "Show on mobile" mặc định tắt; khi bật, tín hiệu là cuộn ngược nhanh (≥ 30% chiều cao màn trong < 500 ms) sau khi đã cuộn ≥ 50%. Không dùng `history.pushState` chặn nút Back (người mua mất quyền điều khiển; 22 §7 User control). Câu CTO 1, câu Tech Lead ES1-T274 #4.

### Nội dung theo giỏ

| Biến thể | Khi nào | Nội dung |
| --- | --- | --- |
| A. Giỏ có hàng | `cart.item_count > 0` | eyebrow "Before You Go" · h2 "Your Cart Is Saved" · câu "Your {n} items are still in your cart. Check out in a few steps." · tối đa 2 dòng hàng (desktop), 1 dòng (mobile) + link "View {n} more item(s) in your cart" · Subtotal · "Keep shopping" (đóng) + primary "Check Out Now" |
| B. Giỏ rỗng, có mã | `cart.item_count == 0` và setting mã không rỗng | eyebrow · h2 "<em>Take 15% Off</em> Your First Order" · "Use this code at checkout on your first order." · ô mã + "Copy Code" · "No, thanks" + primary "Shop All Equipment" |
| Rỗng | giỏ rỗng, không có mã | không render, không mở |

Dữ liệu trên mockup (demo-data): Ativafit Lava 66 lb Adjustable (`figma-ativafit-lava-featured`, Black, $379.99 gạch $499.99, ảnh `efx-prod-P15.jpg`) + Iron Core Kettlebell 16 kg (`figma-iron-core-kettlebell`, Black, $119.00, ảnh `efx-prod-P02.jpg`), Subtotal $498.99. Trạng thái ≥ 3 dòng thêm Speed rope $34.00 → $532.99. KHÔNG CHẮC: ảnh P02 đúng kettlebell trên PNG, nhưng store dev nhiều ảnh lệch tên (ES1-T245).

"Check Out Now": form POST `routes.cart_url` với `name="checkout"` (đi thẳng checkout, dữ liệu giỏ thật). Đổi giỏ ở tab khác: nội dung lấy lại lúc mở (BE).

### Layout

| | 360 | 768 | 1280 / 1920 |
| --- | --- | --- | --- |
| Kiểu | bottom sheet | dialog S 480 giữa màn | dialog S 480 |
| Padding | 32 / 16 / 24 | 32 | 48 |
| Dòng hàng | 1 dòng, ảnh 64 | 2 dòng, ảnh 64 | 2 dòng |
| Câu mô tả | ẩn (A); hiện (B) | hiện | hiện |
| Hàng nút | dọc: primary full trên, "Keep shopping" link 44 dưới | ngang: link trái, primary phải | ngang |
| Cao đo | A ~420 / 720 (58%); B ~330 (46%) | A ~500 | A ~500 |

Dòng hàng: lưới `64px 1fr auto`, gap 16, padding-block 12, gạch 1px `--color-border`; ảnh nền cream, `contain` + `mix-blend-mode: darken` (như card); tên 16/500 là link sản phẩm; meta "Black · Qty 1" 14 muted; giá phải, sale đỏ + giá gạch 14 muted.

Ô mã: viền 1px dashed `--color-muted-light` (4.85 trên alt, đạt 1.4.11), nền `--color-background-alt`, bo 12, padding 12/12/12/16; nhãn "Your code" 14 muted; mã heading 800, cỡ h3, letter-spacing 0.06em; nút secondary 48 "Copy Code" + icon. `flex-wrap` để nút xuống dòng khi hẹp (state card 360 bị cắt mã nếu dùng lưới cố định; đã sửa).

### Settings merchant (block `exit-popup`)

| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Show before you leave popup | checkbox | true (câu CTO 3) | — |
| Minimum time on page | range (s) | 15 | 5–60 |
| Show on mobile | checkbox | false | — |
| Show cart items | checkbox | true | tắt thì giỏ có hàng dùng biến thể B |
| Discount code | text | rỗng | KHÔNG CHẮC: store dev chưa có mã (ES1-T273) |
| Offer heading | inline_richtext | `<em>Take 15% Off</em> Your First Order` | ≤ 8 từ |
| Offer text | text | Use this code at checkout on your first order. | ≤ 20 từ |
| Button label | text | Shop All Equipment | 2–4 từ, mô tả đích |
| Button link | url | `routes.all_products_collection_url` | — |

---

## 4. Big offer (offer popup, rê vào khu vực khuyến mãi)

Figma: không có popup. "Khu vực khuyến mãi" = nút nổi "Big Offer" (teaser); nội dung là deal của Figma 1:759 (sản phẩm giảm giá + "Sale ends in" đếm ngược). KHÔNG CHẮC, câu CTO 2 + ES1-T273 #3. Kiểu mobile theo 15 §2 #6 (offer: popup từ dưới lên có ×).

### Anatomy
1. Teaser (nút nổi, `position: fixed`, góc dưới inline-start): pill nền `--color-foreground`, chữ `--color-background` · nút mở (icon tag 20 + "Big Offer" 14/600 + badge sale "-24%") cao 48 · nút ẩn × 44 × 48 tách bằng gạch 1px trắng 24%.
2. Thẻ ưu đãi (`role="dialog"`, ≥ 48rem không modal; < 48rem modal sheet + scrim):
   - đầu: eyebrow "Big Offer" + nút đóng (40 desktop, 48 mobile)
   - sản phẩm: ảnh 1:1 nền cream (96 mobile, 120 từ 48rem) + badge "-24%" · h2 tên sản phẩm (heading 700, cỡ h3) · giá sale + giá gạch · "You save $120.00" 14 muted
   - thanh đếm ngược như Figma 1:759: nền foreground bo 8, "Sale ends in" 14/600 + 3 ô 36 × 32 (heading 800, 18), chỉ hiện khi có ngày kết thúc hợp lệ
   - (tuỳ chọn) ô mã như mục 3
   - primary full "Shop The Deal" → URL sản phẩm
3. Ảnh trong thẻ là trang trí (`alt=""`), không phải link; tên sản phẩm đọc từ h2.

Dữ liệu mockup: `figma-ativafit-lava-featured` $379.99 / $499.99 → −24% (120 / 499.99 = 24.0%), tiết kiệm $120.00, ảnh `efx-prod-P15.jpg` (đúng tạ đơn). Đếm ngược 22:36:28 lấy hình Figma 1:759; trên store là thời gian thật của khối featured product (`default_countdown_end`).

### Hành vi
- Teaser hiện sau khi cuộn ≥ 25% (setting), fade + trượt lên 8px 250 ms. Không có trên trang lúc tải (Lighthouse không cuộn → không đo).
- Desktop có chuột (`(hover: hover) and (pointer: fine)`): rê vào nút 150 ms thì mở thẻ; rời cả nút và thẻ 300 ms mới đóng; con trỏ đi từ nút lên thẻ không làm đóng; bấm nút ghim thẻ mở. WCAG 1.4.13: đóng được bằng Esc, rê lên thẻ được, không tự đóng khi còn focus bên trong.
- Bàn phím: Enter/Space trên nút mở/đóng (`aria-expanded`, `aria-controls`); mở bằng phím thì focus vào thẻ; Esc đóng và trả focus về nút.
- Cảm ứng ≥ 48rem: chạm mở thẻ (không modal), chạm ngoài đóng. < 48rem: chạm mở bottom sheet modal có scrim, vuốt xuống đóng.
- Nút × trên teaser: ẩn teaser trong phiên (setting số ngày).
- Không render teaser khi: sản phẩm hết hàng, không có giá gạch (không phải ưu đãi), đếm ngược đã hết giờ (DESIGN: không fake urgency, R8).
- Không đè: toast (góc dưới inline-end), Shopify Inbox (góc dưới phải), sticky add to cart trên trang sản phẩm mobile → trang sản phẩm < 48rem ẩn teaser (ĐỀ XUẤT, SRS TE-10 AC6 không che sticky ATC).

### Layout

| | 360 | 768 | 1280 / 1920 |
| --- | --- | --- | --- |
| Teaser | cách mép 16, ~212 × 48 | cách mép 24 | cách mép 24 |
| Thẻ | bottom sheet 100%, padding 32/16/24, ~330 / 720 (46%) | popover 400, cách teaser 12, bo 24, padding 24, bóng overlay | như 768 |
| Ảnh | 96 | 120 | 120 |
| Scrim | có | không | không |

### Settings merchant (block `offer-popup`)

| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Show big offer button | checkbox | true (câu CTO 3) | — |
| Product | product | `figma-ativafit-lava-featured` truyền từ layout | phải có giá gạch |
| Button text | text | Big Offer | ≤ 3 từ |
| Sale end date | text | rỗng; demo truyền như featured product | định dạng YYYY-MM-DD HH:MM, giờ store; sai định dạng thì ẩn đếm ngược (như `featured_product.countdown_invalid`) |
| Discount code | text | rỗng | — |
| Button label | text | Shop The Deal | 2–4 từ |
| Scroll depth | range (%) | 25 | 0–90 |
| Open on hover | checkbox | true | tắt thì chỉ mở khi bấm |
| Position | select | Left (Right) | Right nằm trên toast/Inbox: đẩy lên 72 |
| Days before showing again | range | 1 | 1–30, khi người mua bấm × trên teaser |

---

## 5. Trạng thái

Figma không có trạng thái nào (figma-inventory). Tất cả là ĐỀ XUẤT theo foundation §12, §17, §18; 05 §3–5. Mockup mục 5 cuối file.

| Trạng thái | Popup | Hiển thị | ARIA |
| --- | --- | --- | --- |
| Email sai | newsletter | viền ô sale 2px, dưới ô: icon ! + "Please enter a valid email, like name@example.com." (chuỗi `footer.newsletter_invalid` có sẵn); hiện khi rời ô hoặc khi gửi | `aria-invalid="true"`, `aria-describedby` → lỗi; gửi lỗi thì focus về ô |
| Chưa đồng ý | newsletter | ô checkbox viền sale + "Tick the box to agree to emails, then try again." | như trên trên checkbox |
| Đang gửi | newsletter | nút `aria-busy` spinner trắng, giữ bề rộng (0 CLS); ô email readonly | `role="status"` ẩn "Signing you up…" |
| Thành công | newsletter | thay form: icon check `--color-badge-new` trong tròn 56 nền alt · h2 "You're On The List" · "Thanks for subscribing. Your 15% code is on its way to {email}." · primary "Continue Shopping" (đóng); ghi cờ đã đăng ký, không hiện lại | vùng `role="status"`, focus về tiêu đề mới |
| Đã đăng ký | newsletter | như thành công, icon info muted · "You're Already Subscribed" · "This email is already on our list. Look for your 15% code in your inbox." Không phải lỗi. KHÔNG CHẮC: Shopify báo trường hợp này thế nào (ES1-T274 #1) | `role="status"` |
| Lỗi gửi | newsletter | hộp `.form-message--error` đầu form "We couldn't sign you up" + "Check your connection, then try again."; giữ email đã nhập | `role="alert"` |
| Đã copy mã | before you leave B, big offer | nút đổi "Copied" + icon tick `--color-badge-new`, viền badge-new; dòng dưới "Code copied. Paste it at checkout."; sau 3 s nút về "Copy Code", dòng chữ giữ nguyên (04 §6 không tắt sau 2 s) | dòng chữ trong `role="status"` có sẵn (rỗng lúc đầu, giữ chỗ 20px) |
| Copy bị chặn | như trên | chọn sẵn chữ mã (nền accent 16%, viền accent) + "We selected the code for you. Press Ctrl+C or Cmd+C to copy it." | `role="status"` |
| Giỏ ≥ 3 dòng | before you leave A | 2 dòng + "View 1 more item in your cart" | — |
| Sản phẩm không ảnh | big offer | placeholder icon ảnh `--color-muted-light` trên cream (edge case "Sản phẩm không có media", $34.00) | — |
| Ảnh đang tải | big offer, newsletter | skeleton cùng tỉ lệ (`.skeleton`), không đổi kích thước | `aria-hidden` |
| Rỗng | cả 3 | không render: giỏ rỗng không mã; sản phẩm hết hàng/không giá gạch/hết giờ; đã đăng ký, đóng trong N ngày, trang loại trừ | — |
| Hover/focus | mọi nút | theo foundation §6: primary đậm + nhấc 1px; × đảo nền foreground; link-button sang foreground; teaser nền sáng hơn 14%; focus outline 2px accent offset 2 (teaser thêm vòng trắng 2px để thấy trên ảnh tối) | — |
| Disabled | nút gửi | không disable trước khi nhập (lỗi chỉ hiện sau gửi, 05 §4); trong lúc gửi dùng busy | — |

Thứ tự focus khi popup tự mở: focus vào tiêu đề h2 (`tabindex="-1"`) để trình đọc màn hình đọc tên và nội dung; Tab tiếp theo là nút ×, rồi email. Không tự focus ô email (bàn phím ảo bật lên che sheet trên mobile).

---

## 6. Motion

| Thành phần | Vào | Ra | Thuộc tính | Nguồn |
| --- | --- | --- | --- | --- |
| Dialog newsletter, before you leave | 300 ms `--ease-expo`: fade + nhấc 24 + scale 0.97 | 200 ms | opacity, transform | foundation §16, §19; 15 §3 #7 |
| Bottom sheet | 300 ms trượt từ đáy | 200 ms | transform | 15 §2 |
| Scrim | 250 ms | 200 ms | opacity | |
| Teaser xuất hiện | 250 ms fade + 8px | 150 ms | opacity, transform | |
| Thẻ big offer (popover) | 250 ms fade + 8px lên | 150 ms | opacity, transform | foundation §19 dropdown |
| Nút "Copied" | đổi tức thì | — | màu | 05 §3 |

`prefers-reduced-motion: reduce`: chỉ đổi opacity 0 ms, nội dung hiện ngay. Không animate `height`, `top`.

---

## 7. Accessibility

- Dialog: `<dialog>` + `showModal()` cho newsletter, before you leave, sheet big offer (bẫy focus, nền inert); big offer ≥ 48rem là `<dialog>` mở bằng `show()` (không modal). Mỗi dialog có `aria-labelledby` (h2) và `aria-describedby` (câu mô tả khi có). Đóng: trả focus về phần tử đã focus trước (popup tự mở: về `<body>`/vị trí cũ, không nhảy trang).
- Tên nút: "Close newsletter popup", "Close and keep shopping", "Close discount popup", "Close big offer", "Hide big offer". Badge "-24%" có chữ ẩn " off".
- Vùng chạm: × 48 (mobile) / 40 (popover desktop); teaser 48 cao, × teaser 44 × 48; link-button 44 cao; checkbox cả nhãn bấm được, hàng ≥ 44; nút 48 / 52. Hai control gần nhất ("No, thanks" và "Privacy policy") cách nhau ≥ 16 (04 §1).
- Form: label thật cho email, `autocomplete="email"`, `type="email"`, không chặn dán; checkbox có nhãn; lỗi gắn `aria-describedby`.
- Đếm ngược: `role="timer"`, `aria-label` đầy đủ, không `aria-live` (không đọc mỗi giây); số trong ô `aria-hidden`.
- Màu không là tín hiệu duy nhất: lỗi có icon + chữ; "Copied" có icon + chữ; giá sale có chữ ẩn "Sale price" / "Regular price".

Tương phản (L tương đối, (L1 + 0.05) / (L2 + 0.05)):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| foreground / background | 17.4 | tiêu đề, chữ |
| accent / background | 5.01 | eyebrow, phần nhấn tiêu đề (chữ lớn chỉ cần 3) |
| muted / background | 8.45 | mô tả, nhãn checkbox, link-button, giá gạch |
| muted-light / background | 5.33 | placeholder, viền ô email |
| sale / background | 6.38 | giá sale, chữ lỗi |
| accent-foreground / accent | 5.01 | nút primary (hover đậm hơn → cao hơn) |
| background / foreground | 17.4 | teaser, chữ đếm ngược |
| background / mix(background 14%, foreground) ≈ #3B3B3B | 11.2 | teaser hover, ô số đếm ngược (L 0.044) |
| sale-foreground / sale | 6.38 | badge -24% (cả trên teaser tối) |
| muted / background-alt | 7.69 | nhãn "Your code" |
| foreground / background-alt | 15.8 | mã |
| muted-light / background-alt (viền dashed) | 4.85 | ranh giới ô mã (≥ 3, WCAG 1.4.11) |
| badge-new / background-alt (viền, icon "Copied") | 4.15 | đồ hoạ ≥ 3 |
| foreground / mix(accent 16%, background) ≈ #F6E0D8 | 13.7 | mã được chọn sẵn (L 0.778) |

---

## 8. Token dùng

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-background-cream`, `--color-background-dark` (scrim), `--color-accent`, `--color-accent-foreground`, `--color-sale`, `--color-sale-foreground`, `--color-badge-new`.
Chữ: `--font-heading--family/weight/weight-display`, `--font-primary--family`, `--font-size-sm/base/lg/h3/h2`, `--line-height-body`.
Khoảng cách: `--space-1..7`, `--page-margin`. Bo: `--radius-input`, `--radius-button`, `--radius-card`, `--radius-pill`, `--radius-dialog` (dẫn xuất 24). Bóng: `--shadow-raised` (teaser), `--shadow-overlay` (dialog, thẻ). Motion: `--motion-fast/base`, `--ease-out`, `--ease-expo`.
Không token mới. Giá trị lẻ (264, 288, 400, 720, 480, 96, 120) là kích thước thành phần, viết `calc(var(--space-1) * n)` trong theme.

---

## 9. Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

- LCP: không đổi, vẫn là phần tử LCP của trang đang xem (trang chủ: ảnh slide 1 `efx-slide-2.jpg` eager + `fetchpriority="high"`). Popup không bao giờ là LCP vì không hiện lúc tải.
- Ảnh lazy: tất cả ảnh trong popup. Newsletter (`efx-news.jpg`, `sizes` 288px, srcset 360/720), ảnh dòng giỏ (64 → srcset 128), ảnh sản phẩm big offer (120 → 240) nằm trong `<dialog>` đóng (không hiển thị nên trình duyệt chưa tải) + `loading="lazy"`; có `width`/`height`, `object-fit` (không méo, BP "image aspect ratio"). Mobile không render ảnh newsletter.
- Font: chỉ Sofia Sans Condensed + Inter có sẵn, không thêm weight mới (heading 700/800, body 400/500/600).
- CLS 0: popup, scrim, teaser đều `position: fixed`; nút giữ bề rộng khi busy; dòng trạng thái copy giữ chỗ 20px; skeleton cùng tỉ lệ.
- JS: 1 module chung cho 3 popup (trigger thời gian/cuộn/rời trang, cờ `localStorage`/`sessionStorage`, copy bằng `navigator.clipboard` chỉ khi người mua bấm), nạp lúc rảnh (`requestIdleCallback`) sau `load`, không chặn render. Ngân sách: ES1-T274 #3.
- A11y rủi ro và cách tránh: dialog không tên (có h2 + `aria-labelledby`); nút icon không tên (mọi × có `aria-label` riêng); placeholder nhạt (muted-light 5.33); chữ cam nhỏ (accent chỉ dùng cho eyebrow 16/800 và tiêu đề lớn, đều ≥ 4.5 trên nền trắng); chữ đỏ trên nền tối (không có, footer foundation §4 đã cảnh báo; popup nền trắng); vùng chạm < 24 (không có); focus mất khi đóng (trả focus); `aria-hidden` chứa phần tử focus được (ảnh big offer không phải link).
- SEO: link mô tả đích ("Check Out Now", "Shop All Equipment", "Shop The Deal", "View 1 more item in your cart", "Privacy policy"); không "Learn more" trần; chữ ≥ 14 (badge 13 theo DESIGN); ảnh có alt (ảnh trang trí `alt=""`). Nội dung popup ở cuối `<body>`, sau `<main>`, không đẩy nội dung chính xuống trong DOM.
- Best Practices: không xin quyền khi tải (clipboard chỉ khi bấm); không `history.pushState` chặn Back; 0 lỗi console (render mockup 4 mốc: 0 lỗi); không chặn dán vào ô email.
- Google intrusive interstitial: không mở khi vừa vào từ tìm kiếm (chờ thời gian + cuộn), sheet mobile ≤ 60% màn, đóng 1 chạm.

---

## 10. Map sang code

| Phần | Code hiện có | Thiếu |
| --- | --- | --- |
| Dialog, bottom sheet, nút đóng | `.quiz__dialog`, `.quiz__dialog-close` (base.css) | tách class dialog chung (foundation §21) |
| Form newsletter | `.site-footer__form`, chuỗi `footer.newsletter_*` | block `newsletter-popup`, chuỗi success/already/consent mới |
| Nút, link, badge, giá | `.button`, `.button--secondary`, `.product-card__badge`, `snippets/price` | `.link-button` (nút dạng link nhỏ) |
| Đếm ngược | `featured-product` (TE-13) | dùng lại snippet đếm ngược, bản nhỏ |
| Trigger, tần suất, copy | — | JS (BE), tách ticket FE1 markup / BE1 JS theo `fe-be-boundary.md`; `data-testid`: `newsletter-popup`, `exit-popup`, `offer-teaser`, `offer-card`, `offer-code-copy` |

---

## 11. Quyết định CTO cần chốt

1. Before you leave trên mobile: ticket ghi "quay lại trên mobile", file 15 §1 / 22 §8 khuyên tránh. Đề xuất: setting "Show on mobile" mặc định tắt; khi bật dùng tín hiệu cuộn ngược nhanh, không chặn nút Back bằng `history.pushState`.
2. Big offer: chốt "khu vực khuyến mãi" là nút nổi "Big Offer" góc dưới trái, rê chuột (desktop) / chạm (mobile) mở thẻ deal của sản phẩm giảm giá (mặc định Figma 1:759, Ativafit Lava −24% + đếm ngược)? Đề xuất: có; teaser chỉ hiện khi sản phẩm còn hàng, có giá gạch và chưa hết giờ.
3. Mặc định khi cài theme: newsletter popup tắt (footer đã có form; 15 §1 "demo chỉ show before-you-leave"), before you leave bật (desktop), big offer bật; tối đa 1 popup tự mở mỗi phiên. Đề xuất: có.
