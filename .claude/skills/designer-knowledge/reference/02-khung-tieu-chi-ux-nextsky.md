---
title: Khung bộ tiêu chí UX NextSky – 13 nhóm tiêu chí, 7 nhóm ngữ cảnh UI và các framework nền
type: Tài liệu
scope: Khung tổng thể để Designer đánh giá và thiết kế theme Shopify; các file quy tắc/checklist khác đều bám theo khung này
source: Sheet "Tiêu chí tổng quan", "Tiêu chí nhỏ", "GĐ 1 Nghiên cứu chi tiết", "Trang tính11" (Designer - Nghiên cứu UX.xlsx; Nextsky - Bộ tiêu chí UX.xlsx); sheet "Bộ tiêu chí cải thiện UXUI", "Nội dung Bộ tiêu chí" (NGHIÊN CỨU UX_UI.xlsx)
---

# Khung bộ tiêu chí UX NextSky

## 1. Mục tiêu

Xây dựng bộ tiêu chí UX đảm bảo đáp ứng các tiêu chuẩn chung và tối ưu hoá trải nghiệm người dùng trên desktop, đặc biệt là mobile. Bộ tiêu chí dùng cho 2 việc:
- Thiết kế mới: biết phải làm gì ngay từ đầu.
- Đánh giá theme hiện có (audit): chấm từng tiêu chí Đạt / Cần cải tiến / Chưa có, kèm đề xuất.

## 2. 13 nhóm tiêu chí UX

| STT | Nhóm tiêu chí | Nội dung cốt lõi |
|---|---|---|
| 1 | Thiết kế giao diện (UI & Visual Design) | Giao diện trực quan, thẩm mỹ, gợi ý hành động |
| 2 | Điều hướng, cấu trúc thông tin | Navigation + cách sắp xếp thông tin trên demo |
| 3 | Hiệu suất | Tốc độ tải, phản hồi hệ thống |
| 4 | Tương tác, phản hồi | Hover, click, active, trạng thái hệ thống |
| 5 | Nội dung thông tin | Content clarity, scannability, hierarchy |
| 6 | Cá nhân hoá | Người dùng cảm thấy tiến triển, feedback loop |
| 7 | Hành trình mua hàng + chuyển đổi | UX trong tình huống đặc biệt + hậu mua hàng; Home → Collection → PDP → Cart → Checkout |
| 8 | Tương tác xã hội + xây dựng lòng tin | Social proof, countdown, chính sách gần CTA, ảnh thật đa dạng |
| 9 | Khả năng tiếp cận | Đạt WCAG, ADA |
| 10 | Responsive + mobile first | Ưu tiên nội dung thực sự cần trên mobile |
| 11 | Setting dễ tuỳ chỉnh cho merchant | Cách dễ cho người mới + cách hiệu quả cho người quen |
| 12 | UX phù hợp với ngành hàng | Fashion, cosmetic… có trải nghiệm khác nhau |
| 13 | Tương thích với app | Check với app phổ biến, không xung đột |

### Chi tiết từng nhóm

**Nhóm 2 – Điều hướng & cấu trúc thông tin**
1. Điều hướng phản ánh đúng mô hình tinh thần người dùng (Conceptual Model): menu, danh mục, breadcrumbs bám sát cách người dùng hình dung.
2. Cấu trúc thông tin phản ánh hành động rõ ràng (Mapping): từ trang chủ → sản phẩm → giỏ → thanh toán phải logic.
3. Hỗ trợ trí nhớ dài hạn bằng breadcrumbs & phân cấp menu.
4. Tối ưu tìm kiếm & lọc – dùng Information Scent: tiêu đề, nhãn, nội dung điều hướng phải có tín hiệu rõ.
5. Trang dài cần breadcrumbs, "Back to top", sticky nav.
6. Hiển thị rõ trạng thái hiện tại (highlight menu, breadcrumb).
7. Mọi page cần có điểm đến tiếp theo – không để người dùng bế tắc.
8. Mỗi lần click cần xác định rõ người dùng sẽ đi đâu.
9. Rule of thumb: 1 flow 3 click nhưng dễ hiểu > flow 1 click mà khó hiểu.

**Nhóm 3 – Hiệu suất**
1. Phản hồi hệ thống trong 0.1s để giữ cảm giác liên tục; chậm hơn người dùng nghĩ hệ thống lỗi.
2. Tối ưu cho thiết bị yếu và kết nối chậm: giảm animation nặng, nén ảnh, tối ưu CSS/JS.

**Nhóm 4 – Tương tác & phản hồi**
1. Loading phải có báo hiệu rõ (skeleton, spinner, progress bar).
2. Trạng thái hệ thống rõ: đang xử lý / lỗi / thành công.
3. Feedback tinh tế: tránh popup lớn, flash đỏ, âm thanh giật mình.
4. Feedforward + Feedback: thông tin trước và sau hành động.
5. Có Undo hoặc xác nhận lại với hành động nguy hiểm (xoá, thanh toán).
6. Phản hồi đúng kỳ vọng (ví dụ nhảy số giỏ hàng).
7. Hạn chế chuyển động dư thừa làm gián đoạn flow.
8. Không gián đoạn flow do chờ lâu: placeholder, micro-feedback.
9. Hành động tiêu cực thường bị cảm nhận nặng hơn – xử lý đặc biệt.
10. Tiêu chuẩn về smooth scrolling.

**Nhóm 5 – Nội dung thông tin**
1. Yếu tố tạo niềm tin: rõ ràng, trung thực, chuyên nghiệp.
2. Thiết kế cho mọi đối tượng.
3. Ưu tiên hiển thị tính năng quan trọng – không show toàn bộ options cùng lúc.
4. Dùng pattern, icon quen thuộc.
5. Tương phản thị giác & nhóm nội dung hợp lý.
6. Phá nhịp hoặc lặp lại có kiểm soát để thu hút/nhấn mạnh.
7. Show một phần nội dung tiếp theo bên dưới thành phần chính (site còn tiếp tục).
8. Dùng ảnh để hướng sự chú ý.
9. Không ép cung cấp thông tin quá sớm.
10. Form tối giản, mỗi trường hỏi có lý do.
11. Thiết kế CTA theo 3 nhóm hành vi: browsing – searching – discovery.
12. Cấu trúc CTA: "Verb + Benefit + Urgent time/place".
13. Trang self-evident: nhìn là biết dùng.
14. Không sáng tạo vô lý – chỉ sáng tạo khi biết chắc hiệu quả hơn.
15. Phân cấp thị giác chặt chẽ.
16. Hướng dẫn đúng lúc, đúng nơi (tooltip theo ngữ cảnh).
17. Giảm 50% từ rồi giảm tiếp 50%.
18. Hạn chế lời mào đầu, khách sáo.
19. Navigation rõ ràng & đáng tin.
20. Homepage không nhồi nhét.

**Nhóm 6 – Cá nhân hoá**
1. Tạo trải nghiệm để người dùng cảm thấy đang tiến triển.
2. "Punish" khi không hành động, thưởng khi hành động.
3. Dùng feedback loop và các thử thách thăng tiến.

**Nhóm 7 – Hành trình mua hàng**: theo dõi trạng thái user liên tục, phản hồi đúng và kịp thời, không ngắt quãng quá trình duyệt.

**Nhóm 8 – Lòng tin**: social proof đúng lúc; countdown/ưu đãi giới hạn; chính sách đổi trả gần CTA; ảnh thật, đa dạng tone da/tạng người; review có ảnh, lọc được; trang no-result có gợi ý tiếp theo.

**Nhóm 10 – Responsive**: ưu tiên tính năng người dùng thực sự cần trên mobile; không show hết mà chọn lọc; tuỳ biến theo ngữ cảnh (có lúc mobile khác hẳn desktop nhưng giữ branding, terminology). Luôn đặt 3 câu hỏi: người dùng thực sự cần gì khi dùng mobile? Cái gì không cần? Cái gì đưa xuống sâu hơn hoặc ẩn đi?

## 3. 7 nhóm ngữ cảnh UI (lõi của nhóm 1 – dùng để chấm điểm giao diện)

| # | Nhóm ngữ cảnh | Ngữ cảnh | Mục tiêu UX | Tiêu chí UI cụ thể |
|---|---|---|---|---|
| 1 | Thẩm mỹ – ấn tượng đầu tiên | Mở trang lần đầu – homepage, landing | Tạo niềm tin, thu hút ngay | Grid/bố cục; hình ảnh đúng nội dung; màu sắc; font (dễ đọc, size, line-height); icon; thứ bậc thị giác, điểm nhấn, căn chỉnh; tương phản chữ–nền; khoảng trắng; 5-second test, squint test |
| 2 | Định hướng & nhận biết (Discoverability) | Người dùng cần biết làm gì, click đâu | Dẫn hướng tốt, giảm bối rối | CTA dễ nhận (tối đa 5 CTA chính); label dễ hiểu (signifiers); vị trí logo/menu/giỏ/search; navigation components (tabs, menus, breadcrumbs); forms; notifications/alerts/toasts; modal/dialog không gây khó chịu |
| 3 | Hiểu & hành động đúng (Understanding & Affordance) | Hiểu nhanh cách dùng, thao tác đúng | Hạn chế lỗi thao tác | Homepage cho biết bạn là ai trong 5 giây; chức năng rõ không cần giải thích; visual hierarchy; không quá nhiều lựa chọn; ưu tiên lựa chọn chính |
| 4 | Tương tác chính & thao tác mua hàng | Đang chọn sản phẩm, thêm giỏ | Tăng chuyển đổi | CTA rõ, không sát nhau (thumb zone); hình ảnh chất lượng cao; tooltip/hover rõ; trạng thái hover/active/disabled/selected (tránh hiệu ứng nặng); thông báo lỗi rõ + hướng khắc phục |
| 5 | Ghi nhớ & dùng lại (Consistency & Familiarity) | Quay lại site, dùng nhiều trang | Dễ nhớ, tạo thói quen | Layout nhất quán (button, form, menu, banner, label); mobile giống desktop; màu/typo/icon nhất quán; logo và brand ở vị trí dễ nhớ; auto-fill, lưu lịch sử |
| 6 | Khả năng tiếp cận (Accessibility) | Khuyết tật nhẹ, thiết bị cũ, mù màu | Dùng được cho mọi người | Tương phản WCAG AA (3:1 văn bản lớn, 4.5:1 văn bản nhỏ); không dùng màu đơn lẻ truyền ý nghĩa; alt text; body ≥16px desktop / ≥14px mobile; line-height ≥1.5; vùng chạm ≥44×44 mobile, ≥40×40 desktop; zoom 200% không vỡ; form có label; lỗi cụ thể; phần tử tương tác có chỉ dẫn trực quan; điều hướng bằng bàn phím |
| 7 | Hiệu ứng thị giác nâng cao (Aesthetic-Usability) | Làm đẹp nhưng không hy sinh usability | Tăng thiện cảm | Flat/Flat 2.0; dark mode tuỳ chọn, không ảnh hưởng đọc; visual rhythm; hình ảnh dễ nhớ (7 tips NN/g); tránh mỏi mắt khi dùng lâu |

Chi tiết yêu cầu từng tiêu chí: xem file 03–06 (quy tắc UI theo nhóm).

## 4. Phân cấp ưu tiên tiêu chí khi làm theme

**Cấp 1 – Cốt lõi, ảnh hưởng trực tiếp chuyển đổi**
1. Hành trình mua hàng & chuyển đổi: quick buy / add to cart mượt; checkout không bắt đăng ký; gợi ý sản phẩm trong giỏ / trang cảm ơn.
2. Responsive & mobile-first: tap target đủ lớn; sticky CTA hợp lý; menu dễ thao tác; ảnh swipe được. Mobile là traffic chính, ưu tiên trước desktop.
3. Giao diện & thiết kế: hierarchy rõ (h1, h2…); màu hài hoà không chói; font dễ đọc, hỗ trợ nhiều ngôn ngữ.
4. Tương tác & phản hồi: hover rõ, click có hiệu ứng; form validate real-time; loading state, trạng thái hệ thống rõ.
5. Tính tin cậy: badge bảo mật, đổi trả; review thật, ảnh thật; chính sách gần nút mua. Nhóm hay bị bỏ quên nhưng cực quan trọng.
6. Nội dung & thông tin: CTA rõ nghĩa; từ quen thuộc; mô tả chia đoạn, bullet.
7. App compatibility: merchant rất hay dùng app, không tương thích ảnh hưởng trực tiếp trải nghiệm & support.

**Cấp 2 – Khác biệt & nâng cao**
8. Tính năng UX cao cấp: quiz tư vấn sản phẩm; countdown, sold alert; product finder theo loại da/nhu cầu (điểm cạnh tranh với theme top như Impulse, Prestige).
9. Trang sản phẩm (PDP): biến thể dạng swatch + ảnh; section mô tả chia block; gợi ý liên quan/combo.
10. Dễ tuỳ chỉnh cho merchant: preset layout theo ngành; tooltip hướng dẫn trong Theme Editor; không lỗi khi thiếu ảnh/text. Merchant setup dễ = ít support.
11. UX tình huống đặc biệt: trang 404 có điều hướng; no-result có gợi ý; sản phẩm hết hàng vẫn có CTA khác. Ít theme làm tốt.
12. Hỗ trợ hành vi thương mại & tâm lý mua: sản phẩm đã xem; block "Tại sao chọn chúng tôi"; popup exit intent nhẹ, đúng lúc.
13. Personalization UX.

**Cấp 3 – Hệ thống hỗ trợ & nền tảng**
14. Điều hướng + cấu trúc thông tin: menu < 7 mục; breadcrumbs; search có gợi ý & sửa lỗi.
15. Constraints – hạn chế lỗi: disable nút khi chưa chọn đủ; cảnh báo thiếu biến thể; giữ dữ liệu khi lỗi.
16. Hiệu suất: load < 2.5s; Core Web Vitals đạt chuẩn; lazy load ảnh, preload thông minh.
17. Accessibility: contrast đủ; điều hướng bàn phím; alt ảnh sản phẩm. Cần thiết nếu bán quốc tế hoặc nhắm Theme Store.
18. Hậu mua hàng: trang cảm ơn có upsell nhẹ; email xác nhận rõ; gợi ý mua tiếp / reorder nhanh. Tăng LTV.

## 5. Tiêu chí cụ thể cho merchant (Theme Editor)

- Có nhiều preset homepage layout – merchant không cần kéo tay từng section.
- Group setting logic theo section, không dồn vào một nhóm chung.
- Có gợi ý heading/mô tả demo trong từng section để merchant hiểu mục đích khối.
- Tự động fallback khi thiếu nội dung – thiếu ảnh/text layout vẫn đẹp.
- Có template collection / product / blog / contact đẹp sẵn.
- Cung cấp 1 cách làm dễ học cho người mới và 1 cách khó học hơn nhưng hiệu quả hơn cho người dùng quen.

## 6. UX trong tình huống đặc biệt

- Trạng thái "rỗng" đẹp và hướng dẫn rõ (ví dụ: "Chưa có sản phẩm yêu thích? Khám phá BST mới ngay!").
- Trang "Không tìm thấy kết quả" có gợi ý: sản phẩm phổ biến, đề xuất tìm kiếm khác.
- Trang 404 thân thiện, có CTA về trang chủ hoặc shop.
- Loading state đẹp & nhẹ – tránh white screen hoặc skeleton quá lâu.
- Error state rõ (mất mạng, lỗi server) kèm CTA thử lại / về trang chủ.

## 7. Hậu mua hàng (Post-purchase UX)

- Trang Thank-you có gợi ý / CTA tiếp theo (upsell, quay lại).
- Email xác nhận dễ đọc, có logo, có tracking.
- Cho phép gửi đánh giá sau mua (kết hợp app).
- Cho phép đăng ký nhận tin giảm giá cho lần sau.

## 8. Công thức trọng số đánh giá

Thẩm mỹ (30%) + Dễ sử dụng (40%) + Tín nhiệm (20%) + Hiệu suất (10%) = Trang web thành công.

Tỷ lệ linh hoạt theo ngành:
- Mỹ phẩm / thời trang (làm đẹp): Thẩm mỹ 40% + Dễ sử dụng 35% + Tín nhiệm 15% + Hiệu suất 10%.
- Ngân hàng, bảo hiểm, tài chính: Thẩm mỹ 25% + Dễ sử dụng 35% + Tín nhiệm 30% + Hiệu suất 10%.
- Tin tức, blog: Thẩm mỹ 25% + Dễ sử dụng 40% + Tín nhiệm 25% + Hiệu suất 10%.

Cơ sở: Thẩm mỹ – NN/g về vai trò visual design tạo ấn tượng ban đầu. Dễ sử dụng – Baymard nhấn mạnh điều hướng rõ, checkout đơn giản, thông tin dễ tìm là yếu tố giữ chân và chuyển đổi. Tín nhiệm – review, chứng nhận (cruelty-free, vegan), chính sách minh bạch; đặc biệt quan trọng ngành mỹ phẩm. Hiệu suất – Google đo bằng LCP, FID, CLS.

## 9. Các framework nền được áp dụng

**10 Heuristics của Nielsen Norman Group**
1. Visibility of system status. 2. Match between system and the real world. 3. User control and freedom. 4. Consistency and standards. 5. Error prevention. 6. Recognition rather than recall. 7. Flexibility and efficiency of use. 8. Aesthetic and minimalist design. 9. Help users recognize, diagnose, and recover from errors. 10. Help and documentation.

**Baymard Institute E-Commerce UX Checklist**: homepage design; navigation & search; product pages; checkout process; trust signals; performance.

**ISO 9241-11**: Effectiveness (hoàn thành nhiệm vụ không?), Efficiency (ít công sức không?), Satisfaction (thoải mái không?).

**Laws of UX**
- Jakob's Law: người dùng dành phần lớn thời gian ở site khác, mong site của bạn hoạt động giống những site họ đã biết → mô hình điều hướng, tìm kiếm, tương tác theo chuẩn chung của ngành (ví dụ ngành mỹ phẩm).
- Fitts's Law: thời gian nhắm mục tiêu phụ thuộc khoảng cách và kích thước → nút lớn dễ bấm; tăng kích thước CTA, đặc biệt mobile.
- Hick's Law: thời gian quyết định tăng theo số lựa chọn → giới hạn lựa chọn ở các vùng sản phẩm, bundle.
- Von Restorff: mục nổi bật dễ nhớ → màu tương phản, kiểu chữ nổi bật cho yếu tố quan trọng.
- Miller's Law: trung bình nhớ 7 mục trong trí nhớ ngắn hạn → giới hạn số tuỳ chọn hiển thị.
- Proximity (Gestalt): mục gần nhau được nhóm trong suy nghĩ → nhóm nội dung liên quan gần nhau.

**Nguyên tắc bổ sung**: Color Psychology (màu hover/active rõ); Feedback rõ (chuẩn bị đủ trạng thái loading/hover/active/notification ngay từ bản thiết kế); Micro-interaction (icon chuyển động nhẹ, hiệu ứng add to cart, đánh dấu yêu thích); Mental Models (hiểu cách người dùng mong đợi một trang mỹ phẩm hoạt động); "Less is More" (đơn giản hoá tối đa homepage).

**5 thuộc tính đánh giá UX (NN/g)**: Accessibility, Usability, Credibility, Satisfaction, Usefulness.

## 10. Ký hiệu đọc số liệu benchmark Baymard

- VH – Violated High: vi phạm nghiêm trọng.
- VL – Violated Low: vi phạm nhẹ, ảnh hưởng UX.
- AL – Adhered Low: tuân thủ một phần / mức tối thiểu.
- AH – Adhered High: tuân thủ tốt.
- Mức ưu tiên: Must / Should / Could / Low (hoặc Rất cao / Cao / Trung bình / Thấp).

## 11. Danh sách nhóm tiêu chí UI/UX mở rộng (66 tiêu chí – dùng khi cần audit sâu)

Nhóm 1 Nguyên tắc thị giác: Scale & Proportion; Visual Hierarchy; Balance & Symmetry; Contrast; Whitespace; Continuity & Flow (Gestalt: proximity, similarity, continuity); Emphasis & Visual Rhythm; Alignment.
Nhóm 2 Yếu tố cơ bản: Color system; Typography; Imagery; Iconography; Shapes & Graphics; Grid & Layout.
Nhóm 3 Typography kỹ thuật: font dễ đọc; size phù hợp; độ dài dòng 50–75 ký tự desktop, 30–40 mobile; line-height; type hierarchy; tương phản chữ–nền.
Nhóm 4 Responsive: adaptive layout; breakpoint hợp lý; tối ưu cảm ứng; tap target 44–48px; hiệu suất responsive (lazy load); mobile-first.
Nhóm 5 Motion: chuyển động mượt; animation 200–500ms; animation hỗ trợ hiểu; trạng thái tương tác; tránh hiệu ứng gây phiền.
Nhóm 6 Components: buttons & states; navigation; forms; cards & tables; notifications; modals.
Nhóm 7 Accessibility: WCAG AA; screen reader; keyboard; alt text; hỗ trợ khiếm thính (phụ đề); chỉ báo không phụ thuộc màu; typography dễ đọc.
Nhóm 8 Trạng thái & phản hồi: visibility of system status; thông báo lỗi thân thiện; skeleton/progress; phản hồi tức thì.
Nhóm 9 Thương hiệu: brand alignment; nhất quán; UI độc đáo dễ nhớ (yếu tố đồ hoạ đặc trưng, micro-interaction riêng, tone & voice); tối ưu theo hệ điều hành.
Nhóm 10 Tương thích: cross-browser; cross-platform.
Nhóm 11 Kiểm thử: 5-second; first-click; preference; visual hierarchy testing; phân tích phản hồi.
Nhóm 12 Trải nghiệm lâu dài: eye comfort; dark mode; giảm tải nhận thức; dễ điều hướng & tái sử dụng.
Nhóm 13 Bền vững: tối ưu ảnh & assets; giao diện tiết kiệm năng lượng; dùng system fonts để giảm dung lượng.

Cách kiểm tra nhóm 1 (gợi ý từ audit): kiểm tra tỷ lệ button/text/ảnh và tỷ lệ phần tử chính so với phụ; kiểm tra khi resize; dùng blur test trên Figma/Photoshop (làm mờ giao diện xem yếu tố nào còn nổi bật, áp dụng cho từng section); 5-second test xem người dùng nhận ra nội dung chính ngay không.
