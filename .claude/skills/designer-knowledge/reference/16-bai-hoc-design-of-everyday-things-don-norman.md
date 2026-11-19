---
title: Bài học từ "The Design of Everyday Things" (Don Norman) áp dụng cho theme Shopify – 7 chương
type: Bài học
scope: Nền tảng tư duy thiết kế cho Designer: discoverability, understanding, 7 nguyên lý, 2 khoảng cách, 7 giai đoạn hành động, 3 cấp độ cảm xúc, tri thức trong đầu/ngoài thế giới, constraints, lỗi người dùng, design thinking, thiết kế trong kinh doanh
source: Sheet "The Design of Everyday Things", "Trang tính30", "Note task" (Designer - Nghiên cứu UX.xlsx)
---

# Bài học từ The Design of Everyday Things – Don Norman

Thông điệp cốt lõi: **"Nếu một sản phẩm gây khó khăn cho người dùng, thì lỗi nằm ở thiết kế – không phải ở người dùng."** Thiết kế tốt giúp người dùng biết nên làm gì, khi nào và tại sao; trách nhiệm thuộc về người thiết kế.

Lưu ý tư duy hiện tại trong team dev: kỹ sư thường cho rằng "chỉ cần mọi người đọc hướng dẫn sử dụng thì mọi thứ sẽ ổn" – đây là tư duy cần thay đổi. Người dùng không đọc hướng dẫn; thiết kế phải tự giải thích.

---

## Chương 1 – Tâm lý học của những vật dụng hàng ngày

### Hai đặc điểm quan trọng nhất của thiết kế tốt
- **Discoverability (khả năng phát hiện)**: người dùng nhận biết được hành động nào có thể thực hiện, thực hiện ở đâu và như thế nào. Trả lời: nó dùng để làm gì? hoạt động thế nào? hành động nào khả thi? thực hiện ở đâu? Ví dụ: nút Play có biểu tượng ▶.
- **Understanding (khả năng hiểu)**: người dùng hiểu sản phẩm dùng để làm gì; mọi điều khiển, tuỳ chọn đều có ý nghĩa. Ví dụ: icon thùng rác cho chức năng xoá.

Kết luận: thiết kế phải truyền tải rõ có thể làm gì, làm như thế nào, làm theo cách nào; Designer phải hiểu người dùng và ngữ cảnh thực tế, không ép người dùng hiểu cấu trúc máy móc; thiết kế tốt giúp làm đúng mà không cần nhớ nhiều.

### Thiết kế tương tác vs thiết kế trải nghiệm
- Interaction design: cách con người tương tác với công nghệ; giúp hiểu điều gì có thể làm, chuyện gì đang xảy ra, điều gì vừa xảy ra (feedback, dấu hiệu, tính khả thi).
- Experience design: chất lượng và sự thú vị của trải nghiệm tổng thể – thẩm mỹ, cảm giác, sự hài lòng, liền mạch từ lúc tiếp cận đến khi dùng xong.

### Các thành phần của Discoverability
| Thành phần | Định nghĩa | Ví dụ trên website |
|---|---|---|
| Affordance | Đặc tính của đối tượng gợi ý cách sử dụng mà không cần hướng dẫn | Icon, nút bấm, menu rõ ràng, dễ nhận diện |
| Signifier | Dấu hiệu chỉ dẫn biết thực hiện hành động ở đâu, như thế nào. Quan trọng hơn affordance. Có thể là từ ngữ, minh hoạ, thiết bị | Cursor zoom-in; icon x; button next/back |
| Mapping | Bố trí sao cho người dùng dự đoán được quan hệ thao tác → kết quả | Navigation (menu, breadcrumb, footer links, logo); tương tác (CTA, form input, toggle, pagination); hiển thị (card layout, tab → nội dung tương ứng, accordion mở → nội dung ẩn); phản hồi (loading khi action, message success/error) |
| Feedback | Cách biết hệ thống đang phản hồi hành động | Message "Sản phẩm đã được thêm vào giỏ", icon cart bay vào giỏ, số giỏ tăng |
| Constraints | Giới hạn hành động sai | Disable Add to Cart khi hết hàng |

### Yêu cầu về Feedback
- Phải ngay lập tức – chậm 0.1 giây đã gây bối rối. Phản hồi quá chậm → người dùng từ bỏ hoặc chuyển việc khác; lãng phí tài nguyên vì khi hệ thống phản hồi thì họ đã rời đi.
- Có mục đích: xác nhận đã tiếp nhận hành động; cung cấp kết quả rõ ("Đơn hàng đã được thanh toán thành công", "Vui lòng kiểm tra email để xác nhận tài khoản").
- Không làm phiền: nhẹ nhàng, không gián đoạn; tránh màu đỏ sáng chói, âm thanh gây căng thẳng; thông báo giỏ hàng/giảm giá dùng màu nhẹ hoặc icon xác nhận thay popup phiền phức.
- Ưu tiên: thông tin thường nhật nhẹ nhàng; thông tin quan trọng làm nổi bật (ví dụ form sai định dạng password → highlight chữ password và mô tả lỗi).
- Feedback tốt: nút sáng lên khi nhấn; loading bar; âm "ting" xác nhận. Feedback tệ: mơ hồ, rối rắm, không mang giá trị thông tin – "làm cho có".

### Conceptual Model & System Image
- Conceptual model: cách người dùng hiểu và tưởng tượng hệ thống hoạt động (nút "Mua ngay" → đến thanh toán). Vai trò: dự đoán hành vi hệ thống, giảm sai sót, tăng tự tin, dễ học, không cần đọc hướng dẫn.
- Designer's Model (hệ thống thực sự hoạt động) – User's Mental Model (người dùng tưởng tượng) – System Image (giao diện: cầu nối). Designer không giao tiếp trực tiếp với người dùng → mọi thứ phải được truyền đạt qua system image: giao diện, bố cục, nút, thông báo, âm thanh, hình ảnh, hướng dẫn.

### Thách thức: xung đột giữa các phòng ban
Thiết kế: "phải dễ dùng, dễ hiểu"; Marketing: "phải đẹp, nổi bật"; Kỹ thuật: "phải bền, dễ sản xuất"; Sản xuất: "không làm được với dây chuyền hiện tại"; CSKH: "quá nhiều cuộc gọi phàn nàn"; Sếp: "gom hết mà vẫn rẻ". Việc khó là thuyết phục mọi người bỏ góc nhìn chuyên môn hạn hẹp, nghĩ theo người mua và người dùng – hai nhóm thường không giống nhau.

## Chương 2 – Tâm lý học của các hành động thường ngày

### Hai khoảng cách (Gulfs)
- **Gulf of Execution** (thực thi): người dùng không biết cách thao tác. Thu hẹp bằng signifiers, constraints, mappings, conceptual model. Ví dụ Add to Cart: nút màu rõ, có icon giỏ (signifier); hết hàng thì nút tắt (constraint); nút đặt gần lựa chọn màu/size (mapping); người dùng hiểu giỏ là nơi lưu sản phẩm đã chọn (conceptual model).
- **Gulf of Evaluation** (đánh giá): người dùng cần hiểu kết quả hành động. Thu hẹp bằng feedback + conceptual model. Ví dụ: sau khi bấm Add to Cart hiện thông báo xác nhận và số giỏ tăng ngay (dưới 0.1 giây), nếu không người dùng nghĩ thất bại và bấm lại.

### Bảy giai đoạn hành động và vai trò của thiết kế
| Giai đoạn | Câu hỏi người dùng | Vai trò của thiết kế |
|---|---|---|
| 1. Goal | Tôi muốn đạt được gì? | Giúp xác định mục tiêu rõ (banner "Giảm 50%") |
| 2. Plan | Có những cách nào? | Cung cấp lộ trình (thanh bước Giỏ hàng > Thanh toán > Hoàn tất) |
| 3. Specify | Thao tác cụ thể ra sao? | Signifiers rõ ("Swipe left để xoá") |
| 4. Perform | Tôi đang làm đúng chưa? | Affordances tự nhiên |
| 5. Perceive | Hệ thống phản hồi gì? | Feedback tức thì (nút chuyển xanh khi click) |
| 6. Interpret | Phản hồi này nghĩa là gì? | Conceptual model nhất quán (icon 🔄 luôn là "Làm mới") |
| 7. Compare | Kết quả khớp mục tiêu chưa? | Đối chiếu trực quan ("Bạn đã tiết kiệm 100k" sau khi áp mã) |

Suy nghĩ con người chủ yếu là tiềm thức (nhanh, tự động, kiểm soát hành vi thành thạo) – ý thức (chậm, có kiểm soát, kích hoạt khi học, gặp nguy, gặp sự cố).

### Ba cấp độ nhận thức & cảm xúc
| Cấp độ | Đặc điểm | Chiến lược thiết kế | Ví dụ e-commerce |
|---|---|---|---|
| Visceral (bản năng) | Phản ứng tức thì, vô thức; thẩm mỹ: màu, hình khối, chuyển động mượt, chất liệu; không quan tâm chức năng, chỉ quan tâm hấp dẫn | Màu hài hoà, âm thanh êm, chất liệu cao cấp | Hình ảnh sắc nét, nút nhấn mượt |
| Behavioral (hành vi) | Hành động tự động dựa trên kinh nghiệm – phản xạ có điều kiện; mỗi hành vi gắn một kỳ vọng, kết quả khác đi gây bối rối | Thao tác nhất quán, feedback ngay, Fitts (dễ nhấn); mỗi hành động có mục tiêu rõ, phản hồi tức thì, cảm giác kiểm soát | Vuốt trái xoá sản phẩm trong giỏ |
| Reflective (phản tư) | Phân tích, đánh giá, ghi nhớ dài hạn; nơi tạo ý nghĩa lâu dài, trung thành, truyền miệng – quan trọng nhất với thiết kế | Kể chuyện thương hiệu, cảm giác thành tựu, khuyến khích chia sẻ | Badge "Khách hàng Vàng" sau 10 đơn; "sản phẩm này khiến tôi tự hào khi chia sẻ" |

Sản phẩm thành công đáp ứng cả 3: visceral (đẹp, sang), behavioral (mượt, ít lỗi), reflective (tự hào khi sở hữu).

### Đổ lỗi sai chỗ
Con người tìm nguyên nhân cho mọi việc: bấm nút không thấy gì xảy ra → nghĩ mình làm sai → lặp lại mạnh hơn. Thiết kế phải cung cấp đủ thông tin ở mỗi bước trong 7 giai đoạn.

### Bảy nguyên lý thiết kế cốt lõi
1. Discoverability – nhận biết hành động khả thi và trạng thái hiện tại.
2. Feedback – thông tin liên tục, đầy đủ về kết quả hành động.
3. Conceptual Model – hệ thống truyền tải đủ thông tin để hiểu cách vận hành; hình thành từ UI, phản hồi, hướng dẫn, kinh nghiệm trước.
4. Affordances – gợi ý trực tiếp hành động nhờ hình dạng, chất liệu.
5. Signifiers – tín hiệu chỉ dẫn rõ ràng, dễ hiểu.
6. Mappings – bố cục điều khiển tự nhiên, logic.
7. Constraints – giới hạn vật lý, logic, ngữ nghĩa, văn hoá định hướng hành động.

Checklist cho mỗi tính năng: Nó có thu hẹp Gulf of Execution và Evaluation không? Hỗ trợ giai đoạn nào trong 7 bước? Tác động đến cấp độ nhận thức nào?

### Áp dụng 7 nguyên lý thành tiêu chí UX website
| Nguyên lý | Tiêu chí UX | Ví dụ tốt |
|---|---|---|
| Discoverability | Ngay lập tức biết có thể làm gì; yếu tố nhấp được phân biệt với phần còn lại; trang chủ nói rõ đây là website gì, bắt đầu từ đâu | CTA "Mua ngay", "Đăng ký" nổi bật, màu riêng; cấu trúc rõ: nav, tiêu đề, breadcrumb |
| Feedback | Mỗi hành động có phản hồi tương ứng, ngay lập tức | Add to cart → sản phẩm bay vào icon giỏ; form báo "Số điện thoại không hợp lệ" |
| Conceptual Model | Thiết kế phù hợp kỳ vọng quen thuộc; cái nhìn thấy phản ánh cách hệ thống hoạt động | Filter theo brand, giá, màu như đi siêu thị; icon giỏ = mua, bánh răng = cài đặt, chuông = thông báo |
| Affordances | Thành phần tương tác gợi rõ có thể nhấp/kéo; tránh nút trông như text thường | Button màu nổi, đổ bóng, hover; slider có mũi tên, thumbnail |
| Signifiers | Icon, màu, nhãn, hiệu ứng cho biết hành động; hạn chế icon không chú thích | Icon thùng rác + "Xoá"; hover ảnh hiện overlay "Xem chi tiết" |
| Mappings | Sắp xếp theo logic không gian; điều khiển ở đâu, kết quả ở vị trí dễ đoán | Filter bên trái ảnh hưởng list bên phải; dropdown xổ ngay tại vị trí |
| Constraints | Ngăn hành động sai trước khi mắc lỗi; chỉ cho phép hành động khả thi tại thời điểm đó | Disable "Gửi" khi thiếu trường bắt buộc; chặn chữ cái vào ô số điện thoại |

## Chương 3 – Tri thức trong đầu và trong thế giới

- Con người kết hợp kiến thức trong đầu (trí nhớ) và kiến thức ngoài thế giới (giao diện, nhãn, cấu trúc) để hành động chính xác dù không nhớ rõ cách hệ thống vận hành. Thiết kế tốt giảm gánh nặng trí nhớ bằng cách đưa thông tin ra môi trường.
- **STM (ngắn hạn)**: chỉ giữ 3–5 mục, dễ quên, dễ gián đoạn → không bắt nhớ nhiều bước; giữ trạng thái tạm (giỏ không mất khi refresh); không làm biến mất thông báo lỗi quá nhanh; dùng nhiều kênh (màu, âm thanh, animation).
- **LTM (dài hạn)**: cần thời gian và lặp lại → thiết kế nhất quán tạo thói quen (nút "Mua ngay" luôn cùng vị trí; ánh xạ tự nhiên +/- tăng giảm số lượng); chức năng giống nhau phải hoạt động giống nhau.
- Phòng ngừa lỗi do quên: auto-save form; progress bar checkout; disable button không được phép (Add to Cart khi hết hàng; đang add thì disable tránh bấm lặp).

**Bảng chuyển "phải nhớ" → "hiển thị"**
| Kiến thức buộc phải nhớ | Chuyển sang hỗ trợ trực quan |
|---|---|
| Phí ship | Hiển thị rõ phí ship dưới tổng tiền giỏ |
| Mã giảm giá | Gợi ý "Mã FREESHIP cho đơn trên 500K" cạnh form nhập |
| Điều kiện đổi trả | Tooltip "Đổi trả trong 7 ngày miễn phí" cạnh nút mua |
| Thứ tự checkout | Progress bar: Giỏ hàng → Thanh toán → Xác nhận |

**Áp dụng vào theme Shopify**
1. Hiển thị đúng lúc, đúng nơi: tên, giá, sao, biến thể rõ ngay trên thẻ sản phẩm; mini cart hiển thị số lượng, tổng tiền, phí ship – "hiển thị để hiểu, không cần nhớ".
2. Icon, nhãn, cấu trúc quen thuộc: 🛒 giỏ, 🔍 tìm, ❤️ yêu thích, 🚚 giao hàng, ⭐ đánh giá, 🏠 trang chủ – "tận dụng những gì người dùng đã biết".
3. Hướng dẫn ngắn đúng nơi đúng lúc: "Không chắc chọn size nào? Xem hướng dẫn size →"; "Bạn có mã khuyến mãi? Nhập tại đây."
4. Trạng thái hệ thống rõ: Add to Cart → animation + xác nhận; form lỗi → highlight ô và ghi lý do.
5. Dùng visual phân cấp thay vì bắt suy nghĩ: ảnh nổi bật → tiêu đề rõ → giá & ưu đãi → CTA nổi bật.
6. Constraints: disable "Thanh toán" nếu chưa chọn vận chuyển. Auto-fill/auto-save: lưu địa chỉ sau lần mua đầu. Progress bar.

Bài học: "Đừng hỏi người dùng phải nhớ gì – hãy hỏi bạn có thể hiển thị gì để họ không cần nhớ." Áp dụng triệt để giúp giảm bỏ giỏ hàng.

## Chương 4 – Biết phải làm gì: Constraints, Discoverability, Feedback

Ba yếu tố để người dùng biết phải làm gì dù chưa từng dùng: Constraints (giới hạn lựa chọn sai), Discoverability (nhìn là biết làm gì), Feedback (làm xong biết chuyện gì xảy ra).

| Loại ràng buộc | Giải thích | Ví dụ web |
|---|---|---|
| Vật lý | Hình dạng/kích thước chỉ cho phép thao tác đúng | Ô CVV chỉ cho 3 chữ số |
| Văn hoá | Học từ xã hội | Nút "X" để đóng; màu đỏ là cảnh báo |
| Ngữ nghĩa | Ý nghĩa gắn ngữ cảnh | Nút "Tiếp theo" cuối form → sang bước mới |
| Logic | Suy luận hợp lý từ cấu trúc | Chọn "Việt Nam" → tỉnh/thành tự hiện theo |

Forcing functions: Interlock (xe chỉ chuyển số khi đạp phanh), Lock-in (không thoát khi chưa lưu), Lockout (chắn cầu thang xuống hầm khi cháy).

Feedback tốt vs tệ: bấm nút – đổi màu, hiển thị trạng thái / không phản hồi gì; gửi form – "Gửi thành công!" / trở về trang trắng. Âm thanh làm tín hiệu phải dễ nghe, có ý nghĩa, không phiền.

| Tình huống | Giải pháp |
|---|---|
| Không biết nên làm gì | Tăng khám phá: label rõ, icon dễ hiểu |
| Thực hiện sai thao tác | Ràng buộc vật lý/logic, disable nút khi chưa hợp lệ |
| Không biết đã thành công chưa | Feedback rõ: popup, màu, animation |
| Quên bước trong quy trình nhiều bước | Progress bar, giữ trạng thái |

Áp dụng thành phần: nút Thêm vào giỏ – màu nổi (signifier) + animation sau khi bấm; form địa chỉ – chặn sai định dạng (constraint) + lỗi tức thì; bộ lọc – layout theo vị trí logic (mapping); checkout nhiều bước – progress indicator + giữ thông tin đã nhập.

## Chương 5 – Lỗi của con người? Không, do thiết kế tồi

| Loại lỗi | Khi nào | Nguyên nhân | Ví dụ |
|---|---|---|---|
| Slip (trượt tay) | Mục tiêu đúng, thao tác sai | Vô thức, nhầm thao tác | Nhấn nhầm "Xoá" thay vì "Chỉnh sửa" giỏ |
| Mistake (sai lầm) | Mục tiêu/kế hoạch sai từ đầu | Hiểu sai, thiếu mô hình, thiếu thông tin | Nhập sai địa chỉ vì nghĩ sẽ tự điền |
| Memory lapse | Quên một bước | Gián đoạn, quá tải trí nhớ | Bỏ qua bước chọn vận chuyển |
| Mode error | Hành động sai vì hệ thống ở "chế độ" khác | Không nhận biết chế độ | Nhấn "Huỷ đơn" thay "Lưu nháp" vì UI không rõ mode |

Nguyên nhân phổ biến: gián đoạn; áp lực xã hội/thời gian; giao diện nghèo nàn thiếu phản hồi; tự động hoá thất bại (người bị loại khỏi vòng lặp); khác biệt skill-based vs knowledge-based.

8 chiến lược chống lỗi: Thiết kế tha thứ (khôi phục sản phẩm đã xoá); Undo (hoàn tác sau khi xoá đánh giá); Feedback + Feedforward (preview ảnh trước khi upload); Kiểm tra hợp lý ("Bạn đang chuyển 100 triệu – xác nhận?"); Checklist (đã chọn size/màu/chính sách trước khi thanh toán); Poka-yoke (ô CVV 3 số); Hiển thị chế độ rõ (nền khác màu khi "Đang chỉnh sửa"); Resilience Engineering (tự lưu nháp đơn mỗi 2 phút).

Áp dụng e-commerce: phòng Slip – nút "Xoá" cần xác nhận hoặc đặt xa "Chỉnh sửa"; khắc phục Mistake – gợi ý "Bạn muốn dùng địa chỉ cũ?"; chống Memory lapse – progress bar checkout.

## Chương 6 – Design Thinking

- Tìm đúng vấn đề trước khi tìm giải pháp; vấn đề được giao thường là triệu chứng, không phải gốc rễ.
- Double Diamond: Discover (mở rộng vấn đề) → Define (thu hẹp) → Develop (mở rộng giải pháp) → Deliver (thu hẹp, triển khai).
- Human-Centered Design: dễ hiểu, dễ dùng, dễ học; đạt mục tiêu người dùng, cảm xúc tích cực. 5 hoạt động: Observation (theo dõi khách dùng search filter); Idea generation (workshop "làm sao giảm bỏ giỏ hàng?"); Prototyping (mockup flow thanh toán trên Figma); Testing (mời 5 khách dùng bản beta); Iteration (sửa form sau khi phân tích heatmap).
- Không thiết kế cho "người trung bình" – đó là số liệu, không phải con người thật; linh hoạt cỡ chữ, tương phản, kích thước, tuỳ chỉnh.
- Complexity is good – Confusion is bad: rối rắm do thiếu conceptual model; cung cấp mental map.
- Inclusive Design: OXO peeler thiết kế cho người viêm khớp trở thành dao gọt tốt nhất – dễ cho người khuyết tật thì tốt cho tất cả.
- Tác nhân khiến thiết kế rối: nhiều phòng ban; người mua ≠ người dùng; sales/marketing đẩy đặc tính; dev đẩy tính năng; PM đẩy deadline → cần multidisciplinary team.
- Chuẩn hoá là dao hai lưỡi: quá sớm chặn sáng tạo, quá muộn lỗi thời (HDTV từ 1970s đến 1996).
- Thiết kế phải đơn giản nhưng không đơn điệu, phức tạp nhưng không rối rắm, chấp nhận thay đổi nhưng giữ nhất quán.

## Chương 7 – Thiết kế trong kinh doanh

| Ý chính | Giải thích | Ví dụ |
|---|---|---|
| Ý tưởng ra đời quá sớm | Thất bại vì công nghệ chưa đủ, giá cao, thị trường chưa sẵn | Apple QuickTake |
| Đổi mới không nhanh | Công nghệ mới mất nhiều năm phổ biến | HDTV mất nhiều thập kỷ |
| Công nghệ mới chưa đủ | Thành công khi công nghệ tốt + thị trường sẵn + người dùng chấp nhận | Máy ảnh số |
| Hai loại đổi mới | Đột phá (rủi ro cao) – Tiệm tiến (cải tiến từng bước, phổ biến) | Ô tô vs Internet, smartphone |
| Con người thay đổi chậm | Văn hoá, thói quen ổn định dù công nghệ nhanh | Nhu cầu giao tiếp, học, giải trí |
| Cộng tác người – máy | Kết hợp tính toán của máy và sáng tạo của người | Đội cờ vua người + máy |
| Trách nhiệm đạo đức | Cân bằng kinh tế, công nghệ, môi trường | Sản phẩm bền vững |

Áp dụng: không vội theo ý tưởng đầu tiên – nghiên cứu nhu cầu và thị trường; chuẩn bị cho đổi mới tiệm tiến; hiểu nhu cầu thực tế bằng quan sát trực tiếp; trải nghiệm đơn giản, linh hoạt cho nhiều nhóm; tránh nhồi tính năng; tận dụng công nghệ mới nhưng giữ thói quen và giới hạn con người; nhóm đa ngành thiết kế – kỹ thuật – marketing – bán hàng; chuẩn hoá khi cần để dễ tiếp cận và duy trì.

## Tổng kết nguyên tắc thiết kế tốt
Dễ hiểu, dễ học; không đòi hỏi trí nhớ nhiều; hỗ trợ hành vi tự nhiên; phản hồi tức thời; giảm nhầm lẫn. Thiết kế là quá trình thử–sai: luôn test với người thật, hiểu ngữ cảnh sử dụng. Một thiết kế tuyệt vời không cần người dùng đọc hướng dẫn. Sản phẩm tốt = tính năng tốt + tâm lý tốt + thiết kế rõ ràng + trải nghiệm nhất quán.
