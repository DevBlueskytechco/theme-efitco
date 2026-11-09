---
title: Quy tắc Popup, Drawer, Overlay, Scroll animation, Drawer timing và Carousel
type: Quy tắc
scope: Mọi popup/drawer trên theme (newsletter, mini cart, menu, search, quick view, offer, pickup, ask a question, localization, filter & sort, password, before-you-leave, edit cart, shoppable video, bought-together, lightbox, popup link, zoom, size chart, discount, Instagram); animation khi cuộn; carousel/slideshow
source: Sheet "Popup" (benchmark 16 theme đối thủ + kết luận), "Scroll animation", "Carousel", "Note task" (Designer - Nghiên cứu UX.xlsx; Nextsky - Bộ tiêu chí UX.xlsx); NN/g Popups, Overlays, Exit-intent, Animation Duration, Scroll animations; Material Design Motion
---

# Quy tắc Popup, Drawer, Overlay, Motion & Carousel

## 1. Nguyên tắc chung cho popup / overlay

- Chỉ dùng popup khi thực sự cần: xác nhận hành động không hoàn tác, thu thập thông tin bắt buộc, cảnh báo quan trọng. Ưu tiên inline element (form cuối trang, section) hoặc non-modal (announcement bar, tooltip).
- **Không hiện ngay khi vào trang**: đợi ít nhất 5–10 giây hoặc khi người dùng scroll 50–60% (có nguồn ghi 60–70%); tốt nhất trigger theo hành vi (exit-intent, đã xem ≥ 3 sản phẩm, ở lại > 2 phút, không click 30 giây).
- **Dễ thoát**: nút đóng (×) rõ, dễ nhấn (≥ 48×48px trên mobile), đóng được trong 1 lần nhấn; hỗ trợ Escape; không bắt nhập email mới cho đóng; mobile hỗ trợ vuốt để đóng.
- **Một lớp popup** tại một thời điểm; không mở popup chồng popup; nhiều tương tác thì dùng wizard từng bước.
- **Không che nội dung chính**: kích thước tối thiểu cần thiết; giảm độ mờ nền hoặc dùng viền rõ; tránh popup full-screen trên điện thoại.
- **Nội dung liên quan ngữ cảnh**: cá nhân hoá theo hành vi (popup giảm giá khi xem sản phẩm; "Bạn muốn lưu giỏ hàng trước khi thoát?").
- **Không scroll hijacking để hiện popup**, không popup trên trang 404, không hỏi feedback quá sớm (chỉ sau khi hoàn thành tác vụ quan trọng như mua hàng).
- Popup phải có: tiêu đề rõ ("Đăng ký nhận ưu đãi" thay vì "Xin chào!"), nội dung ngắn (< 50 từ), CTA cụ thể ("Nhận ngay" thay vì "Bấm vào đây").
- Tránh "needy patterns": xin quyền quá sớm (chỉ hỏi vị trí khi bấm "Tìm cửa hàng gần nhất"); quảng cáo ngụy trang; nhắc đăng ký lặp lại (tối đa 1 lần/phiên, lưu trạng thái từ chối bằng cookie, nút "Tôi không quan tâm" rõ); confirmshaming ("Không, tôi không muốn tiết kiệm tiền" → dùng "Không, cảm ơn"); fake urgency (chỉ countdown khi thật, không đếm ngược vô hạn). Nguyên tắc: User Control, Transparency, Frequency Capping (không lặp quá 1 lần/ngày).
- Banner blindness: popup dù nội dung quan trọng vẫn bị người dùng bỏ qua → không đặt ở giữa trang mà ở dưới, hoặc dạng khác; nếu tắt màu sắc và animation mà nó không giống phần tự nhiên của trang thì nguy cơ cao bị "mù".
- Exit-intent popup: hiệu quả với desktop khi người dùng đã tương tác tích cực và có giá trị rõ (ưu đãi có điều kiện); tránh trên mobile/tablet (khó phát hiện intent) → có option ẩn trên mobile; tránh với người mới vào < 10 giây và trang nội dung dài. Kết hợp nhiều tín hiệu (thời gian, scroll depth 70%, inactive) thay vì chỉ chuyển động chuột. Demo không show newsletter popup mà chỉ show before-you-leave.

## 2. Chuẩn popup / drawer trên mobile của NextSky (kết luận sau benchmark 16 theme)

| # | Vị trí / chức năng | Kiểu NextSky (Concept) | Chi tiết | Kết luận áp dụng |
|---|---|---|---|---|
| 1 | Newsletter popup | Popup chạy từ dưới lên | Icon vuốt xuống, header, button x | Popup từ dưới lên có icon x |
| 2 | Mini cart | Popup chạy từ dưới lên | Icon x + header + icon vuốt xuống | Popup từ dưới lên có icon x / Drawer (2 option) |
| 3 | Menu header | Drawer từ trái sang phải | max-width 90%, background đen, icon x | Drawer trái sang 90%, icon x |
| 4 | Search | Drawer từ phải sang trái | Icon x, max-width 90%, header, background đen | Drawer phải sang 90%, icon x |
| 5 | Quick view | Popup chạy từ dưới lên | Icon vuốt xuống, header, button x | Popup từ dưới lên có icon x |
| 6 | Offer | Drawer từ phải sang trái | Icon x, max-width 90%, header, background đen | Popup từ dưới lên có icon x |
| 7 | Pickup | Drawer từ phải sang trái | max-width 90%, background đen, icon x, header | Popup từ dưới lên có icon x |
| 8 | Ask a question | Popup chạy từ dưới lên | Icon x + header + icon vuốt xuống | Popup từ dưới lên có icon x |
| 9 | Localization | Popup chạy từ dưới lên | Icon x + header + icon vuốt xuống | Popup từ dưới lên có icon x |
| 10 | Filters and Sort (collection) | Drawer từ trái sang phải | max-width 90%, background đen, icon x, header | Drawer từ trái sang 90%, icon x, style dạng ngang như Fashion Nova |
| 11 | Page password | Popup chạy từ dưới lên | Icon x + header + icon vuốt xuống | – |
| 12 | Before-you-leave | Popup chạy từ dưới lên | Icon x + header + icon vuốt xuống | Popup từ dưới lên có icon x |
| 13 | Edit cart (page cart) | Popup chạy từ dưới lên | Icon x + header + icon vuốt xuống | Popup từ dưới lên có icon x |
| 14 | Shoppable video | Popup hiện rõ dần / từ dưới lên | Full width, icon x, không header, icon vuốt xuống | Popup từ dưới lên có icon x |
| 15 | Bought-together popup | Popup chạy từ dưới lên | Icon x + header + icon vuốt xuống | Popup từ dưới lên có icon x |
| 16 | Media lightbox | Popup hiện rõ dần | Full width, icon x, không header | – (đa số đối thủ cũng hiện rõ dần) |
| 17 | Popup link | Popup chạy từ dưới lên | Icon x, không header, icon vuốt xuống | Popup từ dưới lên có icon x |
| 18 | Zoom image | Popup hiện rõ dần | Icon x, full width | Popup từ dưới lên có icon x |
| 19 | Size chart | Popup chạy từ dưới lên | Icon x + header + icon vuốt xuống | Popup từ dưới lên có icon x |
| 20 | Discount popup | Popup chạy từ dưới lên | Icon x + header + icon vuốt xuống | Popup từ dưới lên có icon x |
| 21 | Instagram section | – | – | Tham khảo Eurus (popup dưới lên full màn, ảnh + list sản phẩm), Sahara (dưới lên 80%) |

Ưu điểm concept NextSky: vùng chạm để vuốt xuống bao gồm cả header, dễ vuốt xuống hơn.

**Quan sát đối thủ (để tham chiếu khi quyết định)**
- Wonder: tất cả full width, có icon x.
- Eurus: dùng nhiều popup từ dưới lên; nhiều content thì full, ít thì fit-content; menu drawer trái; search popup float không full width, full height; các tính năng order note, discount popup dưới lên chiều cao bằng content ~25%.
- Flow: đa dạng – drawer 90%, popup dưới lên, drawer trên xuống; đa số có icon x.
- Symmetry: chủ yếu drawer trái/phải 90%.
- Prestige: đa dạng drawer, popup; localization popup dưới lên 50%.
- Vortex: popup float, padding 2rem.
- Empire: không show minicart, chỉ message add to cart thành công, click icon dẫn page cart.
- Charm: hầu hết popup từ dưới lên height 85%, có title, icon x.
- Boost: không show minicart, chỉ thông báo khi add cart; search chỉ show input.
- Nhiều theme (Flow, Symmetry, Prestige, Be Yours, Baseline, Vortex) menu drawer trái 90% không title, có icon x.

## 3. Scroll animation – animation hợp lý, không gây mệt

1. **Chuyển động mượt, tốc độ hợp lý**: dùng easing (ease-in-out, cubic); thời gian chuyển đoạn 100–500ms; 100ms là mức thấp nhất của chuyển động có thể nhận biết. Material: "Motion should be swift but clear. Avoid sluggish or overly fast transitions"; dùng natural easing, tránh elastic quá mức.
2. **Chuyển động có mục đích (meaningful motion)**: mỗi animation khi cuộn phải phản ánh logic thông tin.
3. **Không animate mọi thứ** – "When everything moves, nothing stands out" (NN/g); "Use motion sparingly and purposefully" (Apple HIG). Animation fatigue xảy ra khi mọi thứ đều di chuyển.

| Ưu tiên animate | Tránh animate |
|---|---|
| Tiêu đề section | Icon nhỏ hoặc label phụ |
| CTA khi vừa vào viewport | Các đoạn văn dài |
| Hình ảnh key visual | Đồ hoạ phụ / không cần thiết |

4. **Ổn định trên mọi thiết bị**: mobile tránh animation mạnh/lặp lại gây lag, tụt FPS; dùng thuộc tính CSS hiệu suất cao (transform, opacity; tránh top, left, width); desktop có thể thêm layer chuyển nhẹ tạo chiều sâu. Scroll-trigger dùng threshold khoảng 20–30% viewport.
5. **Cho phép ngắt (interruptibility)**: người dùng cuộn nhanh → animation không "gây kẹt", giữ trạng thái kết thúc.
6. **Không trigger lại khi cuộn lên–xuống**: một section không animate lại liên tục; trigger 1 lần duy nhất hoặc chỉ khi element từ ẩn → hiện. "Repetitive animation is not only distracting, it becomes an obstacle to flow" (NN/g).
7. Đối tượng xuất hiện/đi vào màn hình cần thời lượng dài hơn chút so với đối tượng biến mất: popup có thể mất 300ms để xuất hiện nhưng chỉ 200–250ms để biến mất (NN/g Animation Duration).
8. Scroll fading: chỉ dùng cho yếu tố quan trọng (tiêu đề, ảnh, CTA); kết thúc < 0.5 giây; dự đoán được; fallback cho trình duyệt cũ (@supports); vô hiệu hoá khi prefers-reduced-motion. Tránh với trang nội dung dài, người dùng lớn tuổi, thiết bị yếu. Công cụ: AOS, ScrollMagic, @keyframes + scroll-snap, IntersectionObserver API.
9. Scrolljacking: hầu hết website nên tránh; chỉ chấp nhận với landing sản phẩm cao cấp, storytelling tuyến tính, portfolio sáng tạo, VR/AR preview. Nếu dùng: có opt-out ("Skip Animation"), giữ scrollbar, tối đa 3 giây/hiệu ứng, không delay input, Page Up/Down vẫn hoạt động, hiệu ứng nhẹ (< 2MB) ổn định FPS trên mobile. Thay thế: progressive disclosure, anchor links, hover-triggered animation.

**Gợi ý kiểu hoạt ảnh scroll**

| Kiểu animation | Dùng cho |
|---|---|
| Fade in + translate Y nhẹ | Title, section heading (classic, tinh tế) |
| Zoom in nhẹ | Hình ảnh sản phẩm, key visual |
| Parallax | Backdrop trang chủ, banner hero |
| Slide-in từ cạnh | Content thẻ, text block |
| Opacity transition only | Văn bản phụ, số liệu |

Áp dụng trên theme: Icon box – fade in; Media with text – fade in.

## 4. Hiệu ứng mở/đóng drawer

- Mở nên vừa phải, đóng nhanh hơn vì không cần sự chú ý. Ví dụ: ngăn điều hướng mở ra sau 250ms nhưng đóng lại sau 200ms (Material Design – Motion speed/duration).
- Hover submenu: khi hover liên tục thì show submenu ra luôn, không chạy lại hiệu ứng.

## 5. Carousel / slideshow

1. **Hiển thị nhiều hơn 1 phần tử cùng lúc**: nhiều carousel chỉ hiển thị 1 item → người dùng không nhận ra có thể vuốt. Hiển thị ít nhất 1.2–1.5 item ("lấp ló" phần tiếp theo) để tạo information scent cho việc vuốt. Mobile: card kế tiếp lấp ló (ví dụ card 80% width).
2. **Dấu hiệu điều hướng rõ**: mũi tên ← → trên desktop; dot pagination hoặc thanh tiến trình thể hiện vị trí; mobile cho phép vuốt và phản hồi rõ (snap, active effect); mobile auto show dot.
3. **Đủ thời gian đọc**: auto-play mỗi slide ít nhất 5–7 giây; có văn bản thì lâu hơn; tốt nhất để người dùng tự điều khiển.

| Trường hợp | Thời gian mỗi slide |
|---|---|
| Slide chỉ có hình ảnh | 5–6 giây |
| Slide có tiêu đề ngắn + CTA | 6–7 giây |
| Slide có văn bản nhiều hơn | 7–10 giây |

4. **Nội dung không nhảy bất ngờ**: tránh auto-transition gấp; pause khi hover (desktop) hoặc khi chạm/swipe (mobile).
5. **Tối ưu chuyển động**: easing tự nhiên (ease-in-out); tránh bounce hoặc hiệu ứng phức tạp; mobile cần phản hồi vật lý (touch → swipe → snap).
6. **Nội dung quan trọng ở slide đầu tiên**: người dùng thường chỉ thấy slide đầu; slide sau bổ sung, không thay thế.
7. Mobile: người dùng phải tiếp cận được mục cuối trong carousel trong 3–4 bước (chạm/vuốt) → giới hạn số item hoặc hiển thị nhiều item mỗi trang; cung cấp chỉ báo rõ (dot, mũi tên, hiệu ứng liên tục).
8. Có tuỳ chọn tắt auto-play nếu carousel quan trọng hoặc dài.
9. NN/g: cân nhắc hero image tĩnh thay carousel khi cần tập trung thông điệp; người dùng thường bỏ qua slide sau; A/B test carousel vs ảnh tĩnh. Trên mobile homepage, Baymard khuyến nghị không dùng carousel tự xoay (xem checklist Homepage).
10. Promotion banner / thanh cuộn ngang: mỗi item không vượt quá 80% viewport width; hiển thị một phần item tiếp theo; có mũi tên hoặc dot; mobile ưu tiên swipe + snap-to, touch target ≥ 48px.

## 6. Accordion & Tabs (tóm tắt quy tắc triển khai)

- Accordion: luôn mở sẵn 1–2 mục mặc định (giúp hiểu cách hoạt động); icon ►/▼ hoặc +/- (không dùng ⋯, hình vuông/circle đơn thuần, icon quá sáng tạo); tiêu đề viết như câu hỏi/tóm tắt ("Miễn phí vận chuyển khi mua từ 500K?" thay vì "Thông tin vận chuyển"); nội dung ẩn > 300 từ nên tách trang riêng; cho mở nhiều accordion cùng lúc; icon ≥ 24×24px (mobile ≥ 32×32 tính cả khoảng trống), desktop ≥ 24×24; animation xoay 90° hoặc fade 0.2–0.3s; icon luôn bên phải tiêu đề; tap target ≥ 48×48 trên mobile; không ẩn thông tin quan trọng (giá ship, điều kiện khuyến mãi); hoạt động khi JS tắt. Không dùng khi < 5 mục, khi cần đọc liên tiếp, hoặc cần so sánh.
- Tabs: dùng cho 2–5 nhóm nội dung dài, liên quan chặt; chỉ rõ tab đang chọn (màu, gạch chân, icon); tab chưa chọn vẫn dễ đọc; tab đặt phía trên và gần nội dung; một hàng tab; nội dung dùng nhiều nhất ở tab đầu và chọn mặc định; không trộn navigation tabs với in-page tabs; hỗ trợ bàn phím (Enter/Space) và ARIA roles. Tabs vs Accordion: tabs cho ít nhóm nội dung dài cần so sánh/chuyển nhanh; accordion cho nhiều nhóm ngắn, tiết kiệm không gian mobile; không kết hợp cả hai trong cùng khu vực.
- Bảng so sánh: 3–5 mục; chỉ thuộc tính quan trọng; nhất quán định dạng/đơn vị; làm nổi bật khác biệt; ngôn ngữ đơn giản; mobile khoá tiêu đề hoặc cho chọn xem một phần.

## 7. Lưu ý từ quá trình thiết kế Purity

- Các chức năng tương tự (video shoppable, lightbox video, popup quick view, shoppable) phải có cùng logic mở/đóng.
- Quick view: mở sản phẩm sau bị lưu hành vi sản phẩm trước – lỗi cần sửa.
- Menu, cart, filter, search trên mobile nên để full page (tham khảo Magento PWA examples).
- Sort trên mobile làm dạng popup.
- Mobile menu: hiệu ứng đóng khi mở submenu đang lỗi; icon menu back nhỏ hơn icon x.
