KHÔNG CHẮC: SRS 0.2 không có story/AC cho 3 popup (chỉ newsletter footer TE-1 AC6), demo-data không có mã giảm giá (WELCOME15 là mã mẫu) → hỏi BA ES1-T273 #1, #2, #4. Hành vi customer form khi email đã đăng ký, mở lại popup sau POST không JS, ngân sách JS (thêm bộ quản lý hàng đợi) → hỏi Tech Lead ES1-T274 #1–#3. ES1-T273 #3 và ES1-T274 #4 đã có CTO chốt 10/11 (mục 11).

# UI spec: Popup marketing — newsletter, before you leave, big offer (ES1-T263, vòng 3b)

## Thay đổi vòng 3b (CTO chốt 10/11)

| # | Thành phần | Vòng 3 | Vòng 3b | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Before you leave trên mobile | setting "Show on mobile" mặc định tắt (câu CTO 1) | mặc định BẬT; tín hiệu cuộn ngược nhanh (≥ 30% chiều cao màn trong < 500 ms, sau khi đã cuộn ≥ 50% và ≥ 15 s); không `history.pushState` | CTO 10/11 MK1 |
| 2 | Mặc định khi cài theme | newsletter tắt, before you leave bật (desktop), big offer bật | cả 3 BẬT | CTO 10/11 MK3 |
| 3 | Tần suất | tối đa 1 popup tự mở mỗi phiên (cái nào tới trước) | mỗi lúc 1 popup, hàng đợi: đóng popup đang hiện thì popup kế mới được hiện; mỗi popup tự mở tối đa 1 lần mỗi phiên (≤ 2 popup tự mở mỗi phiên) + số ngày theo setting | CTO 10/11 MK3; mục 1.2 |
| 4 | Thứ tự, điều kiện, popup cùng đủ điều kiện, nút Big Offer có là popup | chỉ 1 câu "before you leave > newsletter" | bảng điều kiện + quy tắc hàng đợi 8 điều (mục 1.2); nút Big Offer không phải popup, thẻ big offer chiếm lớp | CTO 10/11 MK3; ĐỀ XUẤT 15 §1, 22 §6 #5, §7 |
| 5 | Big offer | "khu vực khuyến mãi" là KHÔNG CHẮC (câu CTO 2) | chốt: nút nổi góc dưới trái mở thẻ deal; nút chỉ hiện khi còn hàng, có giá gạch, chưa hết giờ | CTO 10/11 MK2 |
| 6 | Before you leave biến thể B | luôn dùng khi giỏ rỗng có mã | bỏ nếu người mua đã đăng ký newsletter trong phiên (đã nhận mã 15%) | ĐỀ XUẤT 22 §6 #7 (nội dung liên quan) |
| 7 | Settings | before you leave không có số ngày | thêm "Days before showing again" (mặc định 1) cho before you leave | 15 §1 (Frequency capping ≤ 1 lần/ngày) |
| 8 | Mockup | mục 1 newsletter, mục 2 before you leave riêng | mục 1 "One Popup At A Time": dòng thời gian 4 bước + 3 khung nối tiếp: bước 1 newsletter hiện → bước 2 đã đóng, nghỉ 3 s, chỉ còn nút Big Offer → bước 3 before you leave hiện; nút Big Offer vẽ dưới scrim ở bước 1, 3; sửa khung ngắn ở 1280/1920 (trước bị kéo cao 720) | CTO 10/11 MK3 |
| 9 | Trạng thái | — | thêm "Hàng đợi · popup đang chờ" | mục 5 |
| 10 | Mục 11 | "Quyết định CTO cần chốt" 3 câu | "Quyết định CTO đã chốt (10/11)" + 3 câu mới, mỗi câu 1 dòng | ticket vòng 3b |

Giữ nguyên từ vòng 3: giao diện 3 popup, copy, cỡ chữ, đếm ngược, badge, trạng thái cũ, motion, tương phản.

## Thay đổi so với vòng 2 (vòng 3, giữ để tra)

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Trang phía sau popup (mockup) | header trong suốt đè ảnh hero toàn khung | dải tối `--color-background-dark` + noise, header 80 riêng (logo 100 × 30, menu trắng 60%, icon 20/24), hero là thẻ bo 12 nằm dưới header (cách mép 16 từ 48rem); 360 hero tràn mép không bo; lớp tối 30% chỉ dưới 1280 | Sổ 10/11; Figma 1:361, 1:362; foundation §3 |
| 2 | Header đầu file mockup | không có | `header.site-header` tối như mọi trang + skip link | foundation §3 |
| 3 | Đếm ngược big offer | ô 36 × 32 nền xám, có dấu ":", nhãn 14/600, padding 8 | như Figma 1:773: thanh `--color-background-dark` cao 60, bo 8, padding 24, rộng theo nội dung; "Sale ends in" Inter 500 16/26; 3 ô 44 × 44 bo 8 viền 1px ≈ #333, số Inter 700 18/28, cách 12, không dấu ":" | Figma 1:773–1:780 |
| 4 | Badge −24% big offer | góc trên ảnh, cao 24 | cạnh giá như Figma 1:782: giá sale 16/500 · giá gạch 14/500 · badge pill 28, cách 8; ảnh không còn badge | Figma 1:783–1:785; foundation §8 |
| 5 | Dòng "You save $120.00" | có | bỏ (Figma không có; badge đã nói mức giảm; bớt chữ cho < 50 từ) | Figma 1:782; 15 §1 |
| 6 | Ảnh sản phẩm big offer | bo 12 | bo 16, nền cream (Figma 1:760) | Figma 1:760 |
| 7 | Mô tả newsletter | Inter 400, tiêu đề → mô tả 12 | Inter 500 16/26 ls −0.01em, tiêu đề → mô tả 8, form cách 12 | Figma 1:1147, 1:1149, 1:1150 |
| 8 | Teaser "Big Offer" | nền `--color-foreground` phẳng | nền `--color-background-dark` + noise như header, hover trắng 14% | foundation §2 (`--dark-texture`) |
| 9 | Trạng thái | — | thêm "thẻ tĩnh, đếm ngược ẩn" (ngày kết thúc sai định dạng) | §5 |

Giữ nguyên (vòng 3): nội dung, copy, trigger, tần suất, settings, mọi trạng thái vòng 2, 3 câu CTO. Tần suất, mặc định và trigger mobile đã đổi ở vòng 3b (bảng trên).

Lệch đã biết, không sửa trong ticket này (ticket cấm đổi token): Figma 1:1152/1:1154 bo input và nút 8, token `--radius-input`/`--radius-button` = 4 (P4, thuộc foundation); tiêu đề popup Sofia 700 theo Figma 1:1148, foundation §16 ghi 800 cho tiêu đề dialog — popup marketing theo Figma (Figma > bộ kiến thức).

Mục đích: thu email và giữ người mua sắp rời đi mà không phá trải nghiệm và chỉ tiêu Lighthouse (sổ quyết định 09/11). Người mua phải: thấy ưu đãi khi đã quan tâm (không phải lúc vừa vào), đóng được bằng 1 chạm, nhận mã hoặc quay lại giỏ trong 1 bước.
Story: TE-9 (overlay toàn theme, sổ quyết định 09/11); newsletter liên quan TE-1 AC6. Chưa có AC riêng (ES1-T273).

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T263/marketing-popups.html` + `marketing-popups-360|768|1280|1920.png`. Nhúng `../_kit/kit.css` (foundation vòng 3); CSS riêng ở `<style>` đầu file. Đầu file là header tối như mọi trang; mỗi khung popup vẽ trang chủ vòng 3 phía sau (dải tối noise, header 80, hero thẻ bo góc dưới header). Mục 1 là chuỗi hàng đợi (newsletter → đóng → before you leave), mục 2 before you leave có mã, mục 3 big offer, trạng thái ở mục 4 cuối file.

Nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:359 (gốc duy nhất, sổ 10/11; không dùng trang live hay ảnh chụp store) > bộ kiến thức (file `NN`). Figma không có popup nào. Copy và cỡ chữ newsletter lấy Figma 1:1146 (footer); deal, hàng giá, đếm ngược lấy Figma 1:759 (featured product: 1:772, 1:773, 1:782). Mọi thứ khác là `ĐỀ XUẤT:` kèm nguồn. Thành phần nền: `docs/ui-spec/foundation.md` §6 nút, §12 form, §16 dialog/bottom sheet, §17 toast, §18 trạng thái, §19 motion.

---

## 1. Quy tắc chung cho cả 3 popup

| Quy tắc | Giá trị | Nguồn |
| --- | --- | --- |
| Không mở lúc tải trang | newsletter: ≥ 10 s VÀ cuộn ≥ 50%; before you leave: ý định rời trang sau ≥ 15 s; big offer: chỉ mở khi người mua rê/chạm nút | Sổ quyết định 09/11 (Performance); 15 §1; 22 §6 #1 |
| Một lớp, hàng đợi | mỗi lúc 1 popup; đóng popup đang hiện thì popup kế mới được hiện; chi tiết mục 1.2 | CTO 10/11 MK3; 15 §1; 22 §6 #5; foundation §16 |
| Tần suất | mỗi popup tự mở tối đa 1 lần mỗi phiên (≤ 2 popup tự mở mỗi phiên); newsletter đóng mà không đăng ký: ẩn 7 ngày (setting); đã đăng ký: không hiện nữa; before you leave: ẩn 1 ngày (setting) | CTO 10/11 MK3; 15 §1 (Frequency capping); 22 §7 |
| Mặc định | cả 3 BẬT (newsletter, before you leave cả mobile, big offer) | CTO 10/11 MK1, MK3 |
| Không hiện ở | 404, cart, password, gift card, trang tài khoản; khách đăng nhập có `customer.accepts_marketing` thì không render newsletter | 15 §1 (không popup 404); 22 §6 #9 |
| Đóng | nút × (48 mobile, 40–48 desktop), Escape, chạm scrim, vuốt xuống trên sheet; "No, thanks" trung tính (không confirmshaming) | 15 §1, §2; 14 |
| Mobile | bottom sheet, cao ≤ 60% màn hình, thấy được nội dung phía sau; không full-screen | 15 §1–2; Google intrusive interstitial (ticket) |
| Nội dung | < 50 từ, tiêu đề nói rõ ưu đãi, 1 CTA chính, nhãn mở bằng động từ | 15 §1; 04 §1–2 |
| Không JS | không popup nào (trigger cần JS); form newsletter footer vẫn chạy (NFR-4) | SRS NFR-4 |

### 1.1 Điều kiện kích hoạt và thứ tự ưu tiên

Không popup nào mở lúc tải trang (sổ 09/11). Thời gian tính trên từng trang, chỉ khi tab đang hiển thị.

| Popup | Kiểu | Mở khi (sớm nhất) | Ưu tiên | Sau khi đã hiện |
| --- | --- | --- | --- | --- |
| Before you leave | tự mở, modal | desktop có chuột: con trỏ rời mép trên cửa sổ sau ≥ 15 s trên trang; cảm ứng (mobile, tablet): cuộn ngược ≥ 30% chiều cao màn trong < 500 ms, sau khi đã cuộn ≥ 50% trang và ≥ 15 s; có nội dung (giỏ có hàng, hoặc giỏ rỗng có mã) | 1 | không hiện lại trong phiên; thêm 1 ngày (setting) |
| Newsletter | tự mở, modal | ≥ 10 s trên trang VÀ cuộn ≥ 50% (setting) | 2 | không hiện lại trong phiên; đóng không đăng ký: 7 ngày; đã đăng ký: không hiện nữa |
| Thẻ big offer | người mua mở (rê 150 ms / chạm / Enter trên nút Big Offer); sheet modal < 48rem, popover ≥ 48rem | không tự mở | — | mở lại được, không tính giới hạn phiên (người mua chủ động) |
| Nút Big Offer (teaser) | **không phải popup**: nút nổi, không che nội dung, không tự mở thẻ | cuộn ≥ 25%, sản phẩm còn hàng, có giá gạch, chưa hết giờ | — | × trên nút: ẩn trong phiên + 1 ngày (setting) |

Lý do before you leave đứng trước newsletter: tín hiệu rời trang là cơ hội cuối, nội dung cá nhân hoá theo giỏ (22 §8 "Bạn muốn lưu giỏ hàng trước khi thoát?"); newsletter là điều kiện trạng thái nên chờ được.

### 1.2 Quy tắc hàng đợi (CTO 10/11 MK3; chi tiết là ĐỀ XUẤT, nguồn 15 §1, 22 §6 #5, §7)

1. **Lớp** = popup tự mở, thẻ big offer, drawer giỏ, menu, search, quickview, mega menu, dialog quiz. Có lớp đang mở thì popup tự mở không mở.
2. **Đủ điều kiện khi đang có lớp:** newsletter (điều kiện trạng thái) vào trạng thái chờ. Before you leave (tín hiệu tức thời) không giữ chỗ, chờ tín hiệu rời trang kế tiếp sau khi lớp đóng: mở ngay sau khi người mua vừa đóng lớp khác là chồng popup trá hình (22 §6 #5).
3. **Lớp đóng** (×, Esc, chạm scrim, vuốt xuống, "No, thanks", "Keep shopping", "Continue Shopping", rời thẻ big offer) → nghỉ 3 s → mở popup đang chờ có ưu tiên cao nhất nếu điều kiện vẫn đúng (còn ở trang, không lớp nào mở, không đang gõ trong ô nhập). Tín hiệu rời trang trong 3 s nghỉ bị bỏ qua.
4. **Hai popup cùng đủ điều kiện cùng lúc** (vd rời trang đúng lúc newsletter vừa đủ 10 s + 50%): before you leave mở, newsletter chờ; đóng before you leave → nghỉ 3 s → newsletter mở nếu người mua còn ở trang.
5. **Đánh dấu "đã hiện"** ngay khi popup mở (không đợi đóng), dù đóng bằng cách nào. Cờ phiên trong `sessionStorage`, cờ số ngày trong `localStorage` có hạn. Bấm CTA rời trang cũng tính đã hiện.
6. **Chuyển trang:** hàng đợi không mang sang trang mới; thời gian, độ cuộn tính lại; cờ phiên giữ nguyên.
7. **Đã đăng ký newsletter trong phiên** (popup hoặc footer): before you leave không dùng biến thể B (mã 15% trùng), chỉ biến thể A khi giỏ có hàng; giỏ rỗng thì không mở.
8. **Nút Big Offer** không vào hàng đợi, không chặn popup tự mở, hiện độc lập theo điều kiện riêng. Khi popup modal mở, nút nằm dưới scrim (`inert`), không bấm được. Khi thẻ big offer đang mở (người mua chủ động), popup tự mở chờ theo điều 2.

Chuỗi mẫu trong mockup mục 1: giỏ 2 món, t = 12 s, cuộn 55% → newsletter hiện (bước 1) → người mua bấm "No, thanks" (newsletter ghi đã hiện, ẩn 7 ngày) → nghỉ 3 s, chỉ còn nút Big Offer (bước 2) → lần rời trang kế tiếp (chuột lên thanh tab / cuộn ngược nhanh) → before you leave biến thể A hiện (bước 3) → đóng → hết popup tự mở trong phiên.

---

## 2. Newsletter popup

Figma: không có popup; copy và nút theo footer 1:1146 (heading "Get 15% Off Your First Order", "Get 15% Off" phần nhấn cam, mô tả, nút "Get 15% Off" + icon gửi, "No spam. Unsubscribe anytime."). Ảnh: `efx-news.jpg` (ảnh newsletter footer, `layout/theme.liquid`).

### Anatomy
1. Scrim `--overlay-scrim`.
2. Dialog (modal) M: ảnh trái (≥ 48rem) · thân phải.
3. Nút đóng × (`.close-button`, góc inline-end trên).
4. Tiêu đề h2 `aria-labelledby`: "Get 15% Off" màu `--color-accent`, phần còn lại `--color-foreground`; heading 700 uppercase, 28 → 36, lh 44/36, letter-spacing −0.02em (Figma 1:1148).
5. Mô tả Inter 500 16/26 `--color-muted`, cách tiêu đề 8 (Figma 1:1147), `aria-describedby` (ẩn dưới 48rem).
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
| Show newsletter popup | checkbox | true (CTO 10/11 MK3) | — |
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
- Mobile/tablet cảm ứng (CTO 10/11 MK1): setting "Show on mobile" mặc định BẬT. Tín hiệu: cuộn ngược nhanh (≥ 30% chiều cao màn trong < 500 ms) sau khi đã cuộn ≥ 50% trang và ≥ 15 s trên trang. Không dùng `history.pushState` chặn nút Back (người mua mất quyền điều khiển; 22 §7 User control). Kết hợp nhiều tín hiệu (thời gian + độ cuộn) để giảm mở nhầm khi người mua chỉ cuộn lên đọc lại (15 §1 exit-intent, 22 §8 Rủi ro).
- Cả hai: chỉ mở khi hàng đợi trống (mục 1.2); không mở khi đang gõ trong ô nhập.

### Nội dung theo giỏ

| Biến thể | Khi nào | Nội dung |
| --- | --- | --- |
| A. Giỏ có hàng | `cart.item_count > 0` | eyebrow "Before You Go" · h2 "Your Cart Is Saved" · câu "Your {n} items are still in your cart. Check out in a few steps." · tối đa 2 dòng hàng (desktop), 1 dòng (mobile) + link "View {n} more item(s) in your cart" · Subtotal · "Keep shopping" (đóng) + primary "Check Out Now" |
| B. Giỏ rỗng, có mã | `cart.item_count == 0`, setting mã không rỗng, người mua chưa đăng ký newsletter trong phiên (mục 1.2 điều 7) | eyebrow · h2 "<em>Take 15% Off</em> Your First Order" · "Use this code at checkout on your first order." · ô mã + "Copy Code" · "No, thanks" + primary "Shop All Equipment" |
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
| Show before you leave popup | checkbox | true (CTO 10/11 MK3) | — |
| Minimum time on page | range (s) | 15 | 5–60 |
| Show on mobile | checkbox | true (CTO 10/11 MK1) | tín hiệu cuộn ngược nhanh |
| Days before showing again | range | 1 | 1–30 (15 §1 ≤ 1 lần/ngày) |
| Show cart items | checkbox | true | tắt thì giỏ có hàng dùng biến thể B |
| Discount code | text | rỗng | KHÔNG CHẮC: store dev chưa có mã (ES1-T273) |
| Offer heading | inline_richtext | `<em>Take 15% Off</em> Your First Order` | ≤ 8 từ |
| Offer text | text | Use this code at checkout on your first order. | ≤ 20 từ |
| Button label | text | Shop All Equipment | 2–4 từ, mô tả đích |
| Button link | url | `routes.all_products_collection_url` | — |

---

## 4. Big offer (offer popup, rê vào khu vực khuyến mãi)

Figma: không có popup. CTO chốt 10/11 (MK2): "khu vực khuyến mãi" = nút nổi "Big Offer" (teaser) góc dưới trái, mở thẻ deal của sản phẩm giảm giá (Figma 1:759: sản phẩm + "Sale ends in" đếm ngược); teaser chỉ hiện khi còn hàng, có giá gạch, chưa hết giờ. Mặc định BẬT (MK3). Teaser không phải popup; thẻ đang mở chiếm lớp trong hàng đợi (mục 1.2 điều 1, 8). Kiểu mobile theo 15 §2 #6 (offer: popup từ dưới lên có ×).

### Anatomy
1. Teaser (nút nổi, `position: fixed`, góc dưới inline-start): pill nền `--color-background-dark` + noise (như header vòng 3), chữ `--color-background-dark-foreground` · nút mở (icon tag 20 + "Big Offer" 14/600 + badge sale "-24%" pill 28) cao 48 · nút ẩn × 44 × 48 tách bằng gạch 1px trắng 24%.
2. Thẻ ưu đãi (`role="dialog"`, ≥ 48rem không modal; < 48rem modal sheet + scrim), stack cách 24:
   - đầu: eyebrow "Big Offer" (cam trên nền trắng) + nút đóng (40 desktop, 48 mobile)
   - sản phẩm: ảnh 1:1 nền cream bo 16 (96 mobile, 120 từ 48rem; Figma 1:760) · h2 tên sản phẩm (Sofia 700, cỡ h3, ls −0.02em; Figma 1:772 thu nhỏ) · hàng giá như Figma 1:783: giá sale 16/500 `--color-sale` + giá gạch 14/500 `--color-muted` + badge "-24%" pill 28, cách 8
   - thanh đếm ngược như Figma 1:773: nền `--color-background-dark`, cao 60, bo 8, padding-inline 24, rộng theo nội dung (310); "Sale ends in" Inter 500 16/26 trắng; 3 ô 44 × 44 bo 8 viền 1px `color-mix(dark-foreground 11%, dark)` (≈ #333 Figma), số Inter 700 18/28, ô cách 12, nhãn → ô 16 (Figma 15, P4); không dấu ":"; chỉ hiện khi có ngày kết thúc hợp lệ
   - (tuỳ chọn) ô mã như mục 3
   - primary full "Shop The Deal" → URL sản phẩm
3. Ảnh trong thẻ là trang trí (`alt=""`), không phải link; tên sản phẩm đọc từ h2.

Dữ liệu mockup: `figma-ativafit-lava-featured` $379.99 / $499.99 → −24% (120 / 499.99 = 24.0%, khớp nhãn Figma 1:785), ảnh `efx-prod-P15.jpg` (đúng tạ đơn). Đếm ngược 22:36:28 lấy hình Figma 1:759; trên store là thời gian thật của khối featured product (`default_countdown_end`).

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
| Thẻ | bottom sheet 100%, padding 32/16/24, ~370 / 720 (≈ 52%; đếm ngược 60 theo Figma, bỏ dòng "You save") | popover 400, cách teaser 12, bo 24, padding 24, bóng overlay | như 768 |
| Ảnh | 96 | 120 | 120 |
| Scrim | có | không | không |

### Settings merchant (block `offer-popup`)

| Tên | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- |
| Show big offer button | checkbox | true (CTO 10/11 MK3) | — |
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

Figma không có trạng thái nào (figma-inventory). Tất cả là ĐỀ XUẤT theo foundation §12, §17, §18; 05 §3–5. Mockup mục 4 cuối file.

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
| Đếm ngược ẩn | big offer | ngày kết thúc rỗng hoặc sai định dạng: thẻ bỏ thanh đếm ngược, giữ sản phẩm + giá + "Shop The Deal" (như `featured_product.countdown_invalid`) | — |
| Hàng đợi · đang chờ | newsletter | không hiện gì; mở 3 s sau khi lớp đang mở (thẻ big offer, drawer, menu, search) đóng, nếu còn ở trang; before you leave không chờ (mục 1.2) | — |
| Rỗng | cả 3 | không render: giỏ rỗng không mã (hoặc đã đăng ký trong phiên); sản phẩm hết hàng/không giá gạch/hết giờ; đã đăng ký, đã hiện trong phiên, đóng trong N ngày, trang loại trừ | — |
| Hover/focus | mọi nút | theo foundation §6: primary đậm + nhấc 1px; × đảo nền foreground; link-button sang foreground; teaser phủ trắng 14%; focus outline 2px accent offset 2 (teaser thêm vòng trắng 2px để thấy trên ảnh tối) | — |
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
| dark-foreground / background-dark (#1A1A1A) | 17.4 | teaser, chữ và số đếm ngược |
| dark-foreground / dark + trắng 14% ≈ #3A3A3A | 11.4 | teaser hover (L 0.042) |
| viền ô đếm ngược ≈ #333 / dark | 1.3 | trang trí như Figma; số trong ô vẫn 17.4, không cần viền để nhận biết |
| sale-foreground / sale | 6.38 | badge -24% (cả trên teaser tối) |
| sale / background | 6.38 | giá sale cạnh badge |
| muted / background-alt | 7.69 | nhãn "Your code" |
| foreground / background-alt | 15.8 | mã |
| muted-light / background-alt (viền dashed) | 4.85 | ranh giới ô mã (≥ 3, WCAG 1.4.11) |
| badge-new / background-alt (viền, icon "Copied") | 4.15 | đồ hoạ ≥ 3 |
| foreground / mix(accent 16%, background) ≈ #F6E0D8 | 13.7 | mã được chọn sẵn (L 0.778) |

---

## 8. Token dùng

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-background-cream`, `--color-background-dark(-foreground)` (scrim, teaser, đếm ngược) + `--dark-texture` (noise teaser), `--color-accent`, `--color-accent-foreground`, `--color-sale`, `--color-sale-foreground`, `--color-badge-new`.
Chữ: `--font-heading--family/weight/weight-display`, `--font-primary--family`, `--font-size-sm/base/lg/h3/h2`, `--line-height-body`.
Khoảng cách: `--space-1..7`, `--page-margin`. Bo: `--radius-input`, `--radius-button`, `--radius-card`, `--radius-pill`, `--radius-dialog` (dẫn xuất 24). Bóng: `--shadow-raised` (teaser), `--shadow-overlay` (dialog, thẻ). Motion: `--motion-fast/base`, `--ease-out`, `--ease-expo`.
Không token mới. Giá trị lẻ (264, 288, 400, 720, 480, 96, 120) là kích thước thành phần, viết `calc(var(--space-1) * n)` trong theme.

---

## 9. Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

- LCP: không đổi, vẫn là phần tử LCP của trang đang xem (trang chủ: ảnh slide 1 `efx-slide-2.jpg` eager + `fetchpriority="high"`). Popup không bao giờ là LCP vì không hiện lúc tải.
- Ảnh lazy: tất cả ảnh trong popup. Newsletter (`efx-news.jpg`, `sizes` 288px, srcset 360/720), ảnh dòng giỏ (64 → srcset 128), ảnh sản phẩm big offer (120 → 240) nằm trong `<dialog>` đóng (không hiển thị nên trình duyệt chưa tải) + `loading="lazy"`; có `width`/`height`, `object-fit` (không méo, BP "image aspect ratio"). Mobile không render ảnh newsletter.
- Font: chỉ Sofia Sans Condensed + Inter có sẵn, không thêm weight mới (heading 700/800, body 400/500/600/700; Inter 700 cho số đếm ngược đã có ở featured product Figma 1:777).
- CLS 0: popup, scrim, teaser đều `position: fixed`; nút giữ bề rộng khi busy; dòng trạng thái copy giữ chỗ 20px; skeleton cùng tỉ lệ.
- JS: 1 module chung cho 3 popup (trigger thời gian/cuộn/rời trang/cuộn ngược nhanh, hàng đợi 1 lớp mục 1.2, cờ `localStorage`/`sessionStorage`, copy bằng `navigator.clipboard` chỉ khi người mua bấm), nạp lúc rảnh (`requestIdleCallback`) sau `load`, không chặn render. Bắt cuộn bằng listener `passive` (không ảnh hưởng INP/cuộn). Ngân sách: ES1-T274 #3.
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
| Trigger, hàng đợi, tần suất, copy | — | JS (BE), tách ticket FE1 markup / BE1 JS theo `fe-be-boundary.md`; `data-testid`: `newsletter-popup`, `exit-popup`, `offer-teaser`, `offer-card`, `offer-code-copy`; markup popup tự mở có `data-popup-priority` (exit-popup 1, newsletter-popup 2) và `data-popup-days` từ setting để JS xếp hàng đợi |

---

## 11. Quyết định CTO đã chốt (10/11)

- MK1: before you leave BẬT cả trên mobile ("Show on mobile" mặc định bật); mobile dùng tín hiệu cuộn ngược nhanh, không chặn Back bằng `history.pushState` (mục 3).
- MK2: nút nổi "Big Offer" góc dưới trái mở thẻ deal sản phẩm giảm giá; teaser chỉ hiện khi còn hàng, có giá gạch, chưa hết giờ (mục 4).
- MK3: newsletter, before you leave, big offer mặc định BẬT; mỗi lúc 1 popup, đóng popup đang hiện thì popup kế mới hiện (hàng đợi, mục 1.2).

Câu mới:
1. Khoảng nghỉ giữa hai popup tự mở: đề xuất 3 s, newsletter chờ được, before you leave cần tín hiệu rời trang mới (mục 1.2 điều 2–3).
2. Thẻ big offer người mua mở có chặn popup tự mở: đề xuất có (chiếm lớp, popup tự mở chờ); nút Big Offer không phải popup (điều 1, 8).
3. Đã đăng ký newsletter trong phiên thì bỏ before you leave biến thể B (mã 15% trùng): đề xuất có (điều 7).
