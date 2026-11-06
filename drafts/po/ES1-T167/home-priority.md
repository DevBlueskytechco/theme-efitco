KHÔNG CHẮC: (1) chưa đọc được kết quả CI develop run 42160292639, phiên này không có Bash/GitHub; (2) ngưỡng so ảnh ở mục 2 là đề xuất, chưa hiệu chuẩn; (3) point story mới chờ Tech Lead ở ES1-T169; (4) trạng thái "chênh Figma" từng block chờ BA ở ES1-T168; (5) cách đưa nội dung vào mặc định và cách gắn sản phẩm, ảnh trên `/` do Tech Lead chốt, chưa xác nhận được static block settings lưu ở đâu.

# ES1-T167 — Ưu tiên Story cho mục tiêu trang chủ giống 100% Figma

PO, 06/11/2026. Chỉ là đề xuất: không đổi ticket, không chạy sprint.
Bản sửa: bản nộp đầu khuyến nghị lớp demo, sai với chốt CTO 11:14 và 11:15. Bản này thay bản đầu.
Đã kiểm trên: `feature/ai-ES1-T167` = `develop` = `origin/develop` = `0d3619b` (đọc ref trong `.git`, repo local, chưa fetch).

## 0. Kết luận

- CTO đã chốt 3 điểm (comment 06/11 trên ES1-T167): (a) 11:12 "Tôi chốt yêu cầu cần giống 100% Figma" trên store dev; (b) 11:14 nội dung Figma nằm trong MẶC ĐỊNH của theme, merchant mới cài thấy ngay, kể cả "360+"; (c) 11:15 review mẫu, tên khách, sao có sẵn, Verified tắt; bậc giảm bundle có sẵn 2 món 10%, 3 món 15% kèm ghi chú. File này coi đó là yêu cầu bắt buộc.
- Hiện còn 5 phần trong 16 hàng chưa có block: hàng 3, 4b, 7, 11, 14. Trong đó hàng 3, 4b, 14 chưa có ticket và AC.
- Ticket ES1-T167 ghi "đã có code: collection list" là sai. Không có `blocks/collection-list*`, `templates/index.liquid` cũng không gọi block này. CTO đã yêu cầu tách story mới (ES1-T48 #4 ngày 03/11) nhưng SRS chưa có: việc này PO còn nợ, đề xuất ở CR-2.
- Mâu thuẫn R8 đã được CTO quyết. Phần còn lại: mặc định của theme không chứa được sản phẩm, collection, ảnh của store, nên merchant mới cài có copy và số liệu giống Figma nhưng chưa giống về ảnh và sản phẩm. 100% đầy đủ đạt trên store dev nhờ dữ liệu store (mục 3, Q2).
- Cần CTO duyệt 10 CR (mục 4), phần lớn là mở lại quyết định phạm vi cũ làm trang không thể giống 100%. Có 9 chênh lệch không nên hoặc không thể khử, cần CTO ký là ngoại lệ (mục 2.4).
- Trang collection, search: tạm hoãn phần JS và QA. Không cắt phạm vi đã ký.

## 1. Bảng Story

Cách xếp: nhóm P theo mức cần cho mục tiêu trang chủ; thứ tự chạy theo cột "Thứ tự"; điểm theo skill `backlog-prioritize` để so trong nhóm, không quyết định nhóm.
Điểm = (Merchant + Canvas + Giảm rủi ro) / Point. Point = point của task FE/BE còn mở (kể cả đang ai-review), lấy từ ticket; QA và Writer không có point. Quy ước: P0 = Must, P1 = Should, P2 = Could trong đợt này. Mục tiêu charter: M1 Canvas, M2 Lighthouse và bug P1/P2 = 0; "16 block" là phạm vi charter.

| Thứ tự | Story | M | C | R | Point còn | Điểm | Nhóm | Hàng inventory | Lý do giá trị | Charter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TE-10 phần gate (AC1, AC2, trần JS ES1-T160), ES1-T163 | 3 | 5 | 5 | 8 sơ bộ, cả story | 1,63 | P0 | Tất cả | Bản gộp chưa có kết quả e2e và lighthouse; test skip do 429 làm cổng xanh giả | M2 |
| 2 | TE-17 MỚI: nội dung mặc định theo Figma + cổng so ảnh (CR-1) | 5 | 3 | 5 | ? ES1-T169 | Chờ | P0 | Tất cả | Yêu cầu bắt buộc của CTO; không có cổng so ảnh thì không đo được "giống 100%" | 16 block, M2 |
| 3 | TE-1, TE-2: rà độ giống | 4 | 4 | 3 | 0 task mở | Chỉ rà | P0 | 1, 2, 4a, 16 | Đầu trang và footer đã có code, dùng làm khối thử để hiệu chuẩn ngưỡng | 16 block |
| 4 | TE-15 MỚI: collection list (CR-2) | 5 | 3 | 4 | ? ES1-T169 | Chờ | P0 | 3, 4b | Chưa có block, chưa có AC; là lối vào collection ngay dưới hero | 16 block |
| 5 | TE-3: rà + tabs, rating, New (CR-3) | 5 | 3 | 3 | 5–8 tabs (ES1-T48); rating, New chờ | Chờ | P0 | 5 | Block bán hàng đầu tiên; thiếu tabs thấy rõ khi so ảnh | 16 block |
| 6 | TE-7 | 4 | 4 | 3 | 6 | 1,83 | P0 | 8, 12, 13, 15 | Đã có code, ES1-T119, T120 đang review; chi phí thấp, đóng 4 hàng | 16 block |
| 7 | TE-11 | 4 | 3 | 4 | 5 | 2,20 | P0 | 6 | Chỉ có markup, chưa dùng được. ES1-T139 tạo `lazy-module.js` mà ES1-T149, T158 dùng lại | 16 block |
| 8 | TE-12 | 4 | 3 | 5 | 13 | 0,92 | P0 | 7, 9 | Hàng 7 chưa có block; hàng 9 không JS chưa có panel động. Đường thêm nhiều món vào giỏ | 16 block |
| 9 | TE-13 | 4 | 3 | 5 | 15 | 0,80 | P0 | 10, 11 | Hàng 11 chưa có block, countdown chưa chạy. Phải chốt ES1-T161 trước ES1-T158 | 16 block, M2 |
| 10 | TE-16 MỚI: blog posts (CR-4) | 3 | 3 | 2 | ? ES1-T169 | Chờ | P0 | 14 | Chưa có block, ticket, AC; TE-9 không có câu nào về block này | 16 block |
| 11 | TE-9 phần trang chủ: AC1 sửa câu chữ, AC4 | 5 | 4 | 5 | 5 sơ bộ, cả story, chưa chia task | 2,80 | P0 | Tất cả | Dữ liệu store dev là đầu vào của so ảnh; chạy song song từ đầu, không đợi tới thứ tự 11 | 16 block |
| — | TE-5 (ES1-T98 review, ES1-T99 QA) | 5 | 3 | 4 | 3 | 4,00 | P1 | Đích của 5, 7, 9, 10 | Không thuộc block Figma nhưng bấm thêm giỏ từ trang chủ phải mở được drawer. Cần xong trước cổng cuối | M2 |
| — | TE-4 (không còn task mở) | 5 | 3 | 2 | 0 | Chỉ hồi quy | P1 | Đích của card, hàng 10 | Chỉ kiểm hồi quy đường card sang trang sản phẩm; TE-13 dùng lại logic variant | M2 |
| — | TE-14: cập nhật Theme map | 1 | 5 | 2 | ? | Chờ | P1 | Không | `AGENTS.md` liệt kê 14 block, repo có 32. Sidekick đọc bản đồ thiếu | M1 |
| — | TE-6 (ES1-T110, T111, T112) | 4 | 2 | 1 | 8 | 0,88 | P2 | Không | Card trỏ tới trang collection vẫn chạy bằng form không JS (NFR-4). Vẫn là Must của PRD, chỉ làm sau | M2 |
| — | TE-8 (ES1-T128, T130, T131; T129 review) | 3 | 2 | 1 | 13 | 0,46 | P2 | Không | Figma chỉ có icon search; link tới trang search đủ cho trang chủ | M2 |
| — | TE-9 còn lại: AC2, AC3, AC5, AC6 | 3 | 3 | 2 | Nằm trong 5 sơ bộ | Theo TE-9 | P2 | Không | Trang phụ; riêng trang blog, article chỉ cần link từ hàng 14 không hỏng | M2 |
| — | TE-10 còn lại: AC3–AC6; ES1-T150 tài liệu TE-12 | 3 | 5 | 3 | Nằm trong 8 sơ bộ | Theo TE-10 | P2 | Không | Bắt buộc cho G5, không bắt buộc để trang đạt cổng. Riêng phần nhắc thay nội dung mẫu và tạo discount thật phải có trước khi giao merchant (chốt 11:14, 11:15) | M1 |

Không có story mồ côi. Thứ duy nhất không gắn mục tiêu là multicolumn và custom liquid trên trang chủ, xem CR-5.

Thay đổi so với hiện tại: mọi task đang cùng Sprint 1, priority "none". Đề xuất đẩy TE-6, TE-8 xuống sau TE-11, 12, 13; thêm 3 story mới và 1 phần mở rộng TE-3; TE-9 từ Should lên P0 một phần; PRD xếp TE-7 là Should nhưng đợt này là P0 vì chiếm 4 hàng Figma; PRD còn ghi countdown cùng lúc ở Must và Could, đợt này tính là P0.

Thứ tự ticket chi tiết, sprint và năng lực thuộc ES1-T169. Ràng buộc PO đặt ra cho kế hoạch đó:
- Tối đa 2 PR ở trạng thái chạy CI cùng lúc (1 chạy + 1 chờ, ES1-T165 phương án A còn chờ trả lời), và 1 PR FE tại một thời điểm sửa `base.css`, `locales`, `templates/index.liquid`.
- Làm theo từng lát block; block nào đạt cổng rồi mới mở PR block tiếp theo.
- Hồi quy trên develop đi trước tính năng mới.
- ES1-T98, T119, T120, T129, T147, T156, T163 đang ai-review nhưng file spec đã có trên develop. Cần chấm và đóng trước, không tính là xong khi chưa có kết quả CI thật.

Không làm trong đợt này: ES1-T110, T111, T112, T128, T130, T131, T150; câu hỏi dữ liệu ES1-T105, T125; TE-9 AC2, AC5, AC6; TE-10 AC3–AC6; mọi tính năng mới của trang sản phẩm, cart, collection, search. ES1-T129 chỉ chấm để không để lại lỗi hồi quy ở header.

## 2. Định nghĩa Xong

Xong khi cả 4 phần dưới đều đạt trên commit mới nhất của develop.

### 2.1 Phạm vi: 16 hàng inventory, đúng thứ tự y

"Đã kiểm" là có file và có lệnh gọi, chưa phải đã đúng Figma.

| # | Block, node | Story | Đã kiểm trên repo | Cần thêm về hình | Chức năng phải đúng |
| --- | --- | --- | --- | --- | --- |
| 1 | Header 1:362 | TE-1 | Có, trong layout | Menu 7 mục trên store | Menu hover và bàn phím; sticky 80px; link search, account, cart; số giỏ cập nhật |
| 2 | Slideshow 1:422, 1:437 | TE-2 | Có, `index.liquid:1-6` | Copy, ảnh 2 slide | Nút, chấm, vuốt; không JS vẫn cuộn; slide 1 là LCP |
| 3 | Collection list 1:395 | TE-15 mới | KHÔNG có block | Toàn bộ | Nút next/back; card tới đúng collection; rỗng dưới 5 card |
| 4a | Rich text 1:454 | TE-2 | Có, `index.liquid:8-10` | Ảnh inline, copy | CTA đúng link |
| 4b | Shop by level 1:464 | TE-15 mới | KHÔNG có block | Toàn bộ, badge "24 Products" | Card tới đúng collection; số sản phẩm là số thật |
| 5 | Featured collection 1:490 | TE-3, CR-3 | Có; không có tabs, rating, New | Tabs, 2 loại badge, 4 sản phẩm | Đổi tab không reload; swatch; giá, % giảm đúng |
| 6 | Quiz 1:506 | TE-11 | Markup; thiếu `quiz-finder.js` | Copy, body map | 3 bước, Back, kết quả tối đa 4 card, rỗng; không JS vẫn gửi được |
| 7 | Shop the look 1:560 | TE-12 | KHÔNG có block (ES1-T148) | Toàn bộ, CR-6 | Tổng đúng; thêm nhiều món 1 lần; 422 báo lỗi; drawer mở |
| 8 | Inspiration 1:625 | TE-7 | Có, `index.liquid:24-26` | 3 ảnh, copy, CR-7 chữ MAKE | CTA đúng link |
| 9 | Bundle builder 1:636 | TE-12 | Markup; thiếu `bundle-form.js` | 6 sản phẩm trên store dev | Panel, tạm tính, bậc giảm; giảm hiển thị khớp discount thật; 422; Sold out |
| 10 | Featured product 1:759 | TE-13 | Markup; thiếu `featured-product.js` | Dấu 1:761, rating, spec | Countdown đúng giờ store, tự ẩn; đổi variant; Add to cart |
| 11 | Video carousel 1:817 | TE-13 | KHÔNG có block (ES1-T157) | Toàn bộ | Lazy; bấm mới chạy; video lỗi vẫn có poster và link |
| 12 | Testimonials 1:885 | TE-7 | Có, `index.liquid:36-43` | 4 mục, CR-8 (Verified là ngoại lệ E9) | Cuộn được; bàn phím |
| 13 | Why choose 1:992 | TE-7 | Có, `index.liquid:45-47` | Ảnh, copy. 3 USP đang ẩn trong Figma nên không làm (ES1-T116 #1) | CTA đúng link |
| 14 | Blog posts 1:1022 | TE-16 mới | KHÔNG có block | Toàn bộ, 5 bài | Card tới đúng bài; rỗng dưới 5 bài; thời gian đọc chờ AC |
| 15 | FAQ + stats 1:1057 | TE-7 | Có, `index.liquid:49-57` | 5 câu, ảnh, 2 ô số liệu | Mở, đóng bằng bàn phím, không JS |
| 16 | Newsletter, footer, trust 1:1104 | TE-1 | Có, trong layout | Menu, social, copy | Form báo thành công, lỗi; localization |

Multicolumn và custom liquid: không thuộc 16 hàng, xem CR-5. Trên trang đo không được có block ngoài danh sách này.

### 2.2 Giống Figma: đo trên 1920

Đo từng block so với `docs/figma/img/<node>.png`, ở viewport 1920, cùng scale với ảnh export. Mỗi block đạt đủ:
1. Thứ tự: đúng 16 hàng theo y.
2. Copy: khớp 100% chuỗi với `docs/figma/snapshot-1-359.json`, trừ giá trị động đã che.
3. Kích thước block, vị trí phần tử con: lệch tối đa 2 px.
4. Font, cỡ chữ, màu, bo góc, khoảng cách: đúng giá trị Figma, trừ ngoại lệ đã ký ở 2.4.
5. So ảnh: khác biệt tối đa 1% số pixel sau khi che vùng động (giây countdown, video).
6. Sổ chênh lệch: 0 mục mở. Mỗi chênh lệch còn lại phải nằm trong 2.4 và có CTO ký.

KHÔNG CHẮC về ngưỡng 2 px và 1%: chênh do trình duyệt vẽ chữ khác Figma chưa đo. Hiệu chuẩn trên hàng 1, 2 ở bước 3. Ngưỡng chỉ được nới khi CTO ký, và tiêu chí 2, 4, 6 không nới.

Ai đo: QA viết và chạy so ảnh tự động trên Playwright trong CI; Designer chấm từng block bằng `ui_diff` và ký sổ chênh lệch; CTO ký cuối. Hiện `tests/` và `scripts/` chưa có so ảnh; grep `ui_diff`, `toHaveScreenshot`, `maxDiffPixel` chỉ thấy trong 3 file nháp `drafts/dev-fe`. Cần xác nhận `ui_diff` chạy ở đâu.

### 2.3 Mobile và trạng thái Figma không có

Không có Figma nên không so ảnh. Đo ở 360 và 768 theo mặc định đã chốt: ES1-T116 #5, #6, ES1-T135 #4, ES1-T145 #1, #6, ES1-T154 #2, #8. Điều kiện: không tràn ngang, touch target từ 44px, không chồng chữ. Trạng thái rỗng, lỗi, hết hàng theo các mặc định đó và AGENTS.md. Mỗi block mới của CR-2, CR-3, CR-4 cần Designer ghi mặc định mobile theo cùng cách.

### 2.4 Ngoại lệ đề xuất, cần CTO ký (Q1)

Đây là các quyết định và ràng buộc đã có, không phải phương án giảm mức giống.

| # | Figma | Theme | Vì sao không khử |
| --- | --- | --- | --- |
| E1 | Accent #D94610 | #C8400E | CTO 30/10, AGENTS.md: không đạt AA với chữ trắng |
| E2 | Xám #999999, #808080 trên nền sáng | #6B6B6B | CTO 27/10, AGENTS.md: AA |
| E3 | Eyebrow accent trên nền tối 3.33:1, trên sand 4.03:1 | Muted | ES1-T116 #4: AA |
| E4 | Dòng giảm #4B824D trên panel | Foreground + dấu trừ | ES1-T145 #4: 3.65:1 |
| E5 | Font lẻ Sofia Sans 800, Host Grotesk | Gộp về heading | Inventory: lỗi thiết kế; CTO 30/10 |
| E6 | Không có nút play trên thẻ video | Có nút play | ES1-T154 #7: bấm mới chạy (ES1-T155 #4), cần vùng bấm |
| E7 | Số mẫu 1:636 tự mâu thuẫn: badge 3 Items, 5 dòng, subtotal 380 trong khi 5 dòng cộng 484 | Số tính thật | ES1-T145 #5: tính đúng thì không ra số mẫu. Chức năng thắng |
| E8 | Countdown cố định 22:36:28 | Giá trị chạy, che giây khi so | Đồng hồ thật; store dev đặt hạn dưới 24 giờ để hiện đúng 3 ô (ES1-T154 #1) |
| E9 | Verified trên mọi card | Mặc định tắt | CTO chốt 11:15, đã ghi rõ là chênh. Trên store dev có bật để so ảnh hay không: xem Q1 |

### 2.5 Chức năng và chất lượng

Tất cả đo trên `/` của store dev, có đủ nội dung và dữ liệu:
- Cột chức năng ở 2.1 có test E2E chạy thật ở desktop và Pixel 7. Test skip do 429 hoặc thiếu dữ liệu: 0 ở các story P0. Đây là khoảng trống đã biết (ES1-T163).
- Đường mua: thêm giỏ từ hàng 5 (qua trang sản phẩm), 7, 9, 10 đều mở drawer, số giỏ và tổng đúng. Cần TE-5, ES1-T99.
- `shopify theme check` 0 lỗi, không override; 0 console error.
- Lighthouse: performance ≥ 96 desktop, ≥ 90 mobile, accessibility ≥ 98.
- JS: tải sẵn ≤ 40 960 B; sau khi cuộn hết trang ≤ 65 536 B (ES1-T160). Tabs ở CR-3 và block mới làm tăng ngân sách, ES1-T160 đã ước ~60 614 B trước khi có các phần này, nên Tech Lead cần tính lại.
- Bug P1, P2 của trang chủ = 0. AC mới đề xuất ở ES1-T168 đã vào SRS và có test.

## 3. "100% Figma" và R8: CTO đã quyết, còn phần sản phẩm và ảnh

Quyết định CTO 06/11 thay ES1-T115 #2, T136 #8, T155 #8, T146 #2: copy, số liệu, review mẫu, tên khách, sao, số đánh giá nằm trong mặc định; Verified tắt; bậc giảm bundle có sẵn 2 món 10%, 3 món 15% kèm ghi chú "giảm giá áp dụng khi có discount tự động". PO không đề xuất lại phần này.

Theme không tự chứa được mọi thứ trong Figma:

| Loại nội dung | Nơi đặt | Merchant mới cài thấy | Store dev |
| --- | --- | --- | --- |
| Copy, số liệu, review mẫu, sao, bậc giảm + ghi chú | Mặc định theme | Có, như Figma | Có |
| Sản phẩm, giá, collection, bài blog, menu, metafield, discount | Dữ liệu store, không nằm trong theme | Dữ liệu của họ | Người tạo theo Figma |
| Ảnh, video | Setting ảnh, video; chưa có đường mặc định | Trống theo AGENTS.md, xem Q2 | Người tải lên |
| Ngày kết thúc countdown | Setting; ngày cố định trong mặc định sẽ hết hạn | Ẩn tới khi nhập ngày (SRS TE-13 AC1), xem Q2 | Đặt ngày thật |

Cách gắn sản phẩm, ảnh, collection cho so ảnh (preview nhánh không có block settings, agent không ghi được admin):

| | A. Chọn trong theme editor trên live theme store dev | B. Template thay thế qua `?view=`, truyền tài nguyên bằng param | C. B cho cổng PR, A cho nghiệm thu |
| --- | --- | --- | --- |
| Đo trên từng PR | Không | Có: đã chạy thật ở `index.te7`, param nhận image, product (ES1-T117) | Có |
| `/` giống Figma | Có | Không, chỉ `?view=` | Có, ở bước cuối |
| Nhược điểm | Lỗi chỉ lộ sau merge; không có version | Lệch dần giữa 2 template; phải loại khỏi bản giao | Có cả hai việc, người phải nhập 1 lần |

Khuyến nghị: C. Cách làm cụ thể do Tech Lead chốt ở ES1-T169.

Kế hoạch phải gồm (theo chốt 11:14, 11:15; tất cả là đề xuất, chưa sửa):
1. Mặc định block: đưa nội dung Figma vào cả 16 hàng. Điều kiện của PO: merchant phải sửa được. Docs không nói param template hay giá trị merchant thắng (ES1-T117 #4), nên Tech Lead phải chọn cách không khoá nội dung.
2. Sửa tài liệu R8: `DESIGN.md:205-207` (bundle phải khớp discount thật); `docs/srs.md` TE-7 AC5, TE-11, TE-12 AC1 AC2, dòng 191, 204; `docs/checklist-theme-store.md:42`, `docs/requirements-map.md:12`; doc trong `blocks/featured-product.liquid:15`, `blocks/bundle-builder.liquid:11`. `AGENTS.md` không có chữ R8, phần liên quan là "Handle the empty state" (dòng 258). TE-10 AC3 đòi R8 pass 100%: phải ghi rõ cách tính nội dung mẫu, nếu không checklist không qua.
3. Sửa test đang kiểm mặc định trống: `ES1-T119.spec.ts:252-263` (chữ hướng dẫn, không có 360+, không có ô số liệu), `ES1-T121.spec.ts:201`, xem lại `ES1-T147.spec.ts:133`. QA rà toàn bộ: có 75 lệnh mở trang chủ trong 10 file spec.
4. Tài liệu merchant (ES1-T150, TE-10 AC5): nhắc thay nội dung mẫu, tạo discount thật, bật Verified khi đã xác thực.
5. Demo store và ghi chú "nội dung mẫu" nếu sau này nộp Theme Store (CTO 11:15). `CLAUDE.md` hiện ghi không nộp Theme Store.

Hệ quả cần CTO biết, không đổi quyết định:
- Merchant không thay nội dung thì khách thật thấy review, tên khách, "360+", "Trusted by 10,000+ athletes" không phải của shop. Giảm rủi ro: tài liệu, dòng info trong editor, mục kiểm tra trước khi publish. Tiêu chí G5 cần có mục này.
- Merchant chưa tạo discount: trang hiện giảm 10%, 15% nhưng checkout không giảm. Dòng ghi chú là biện pháp duy nhất đang có.
- Quiz hiện sẵn nhưng sản phẩm chưa gắn tag thì luôn ra kết quả rỗng. Cần thêm AC (ES1-T168).
- Copy Figma là thiết bị tập gym, persona charter là shop thủ công, quà tặng. Đề xuất ghi nhận trong charter ở lần sửa tới.
- `index.te*` phải loại khỏi bản giao (`index.te13` ghi "Remove before a real store release"); grep `index.te` trong `scripts/theme-zip.sh` không thấy loại trừ. Tech Lead kiểm, đưa vào TE-10.

Phân công đề xuất:
| Việc | Ai |
| --- | --- |
| Bảng nội dung theo từng node: copy, số liệu, ảnh, sản phẩm, giá | BA, từ snapshot (ES1-T168 hoặc task mới) |
| Đưa nội dung vào mặc định block | Dev FE, Tech Lead chốt cách |
| Xuất ảnh nguyên liệu từ Figma. PNG trong `docs/figma/img` là ảnh cả block, không dùng làm ảnh sản phẩm. Hạn mức API 20 request/tháng nên xuất tay | Designer hoặc CTO |
| Tạo sản phẩm, collection, tag, metafield, discount, bài blog, menu, tải ảnh trong admin store dev; chọn trong theme editor | Người, CTO theo ES1-T60 #1. Agent không ghi được admin |
| Cổng so ảnh trong CI | QA, DevOps |
| Chấm sổ chênh lệch | Designer, CTO ký |

Rủi ro dữ liệu: store dev đang dùng cho E2E, sản phẩm test có tên kiểu "sale-gia-nhỏ", `index.liquid:13` dùng collection `all` (ES1-T48 #5) nên hàng 5 sẽ hiện sản phẩm test. Dữ liệu Figma nên ở collection riêng, không đổi handle trong `tests/e2e/store-data.json`, và cần kiểm test đang đọc `/collections/all`. Trạng thái dữ liệu:
- Cần cho trang chủ: ES1-T134 (quiz), ES1-T144 (bundle, discount), ES1-T153 (featured product, video). Các ticket này đang mở, thiếu thì test skip; với mục tiêu này phải có trước cổng cuối.
- Tạm hoãn: ES1-T105 (collection), ES1-T125 (search).

## 4. Đề xuất Change Request cho CTO

Chưa có đánh giá tác động đầy đủ: Tech Lead (giờ, point) và QA, BA đánh giá trong ES1-T168, T169. Đề xuất nhận vào đợt trang chủ, không đẩy story đã ký ra khỏi phạm vi, chỉ xếp sau TE-6, TE-8 như mục 1. Thời điểm: quyết định 100% ngày 06/11 11:12 đến sau các quyết định dưới đây nên cần mở lại rõ ràng thay vì ngầm bỏ.

| CR | Nội dung | Mở lại | Điểm cần chú ý |
| --- | --- | --- | --- |
| CR-1 | Story TE-17: nội dung Figma trong mặc định, dữ liệu store dev, cổng so ảnh | CTO đã chốt nội dung (11:14, 11:15); còn cần duyệt cách ghi vào SRS. TE-9 AC1, AC4; ES1-T115 #2, T136 #8, T155 #8, T146 #2 | Việc đi kèm ở mục 3 |
| CR-2 | Story TE-15: collection list hàng 3, 4b | ES1-T48 #4, CTO đã duyệt tách story | PO bổ sung SRS sau khi CTO duyệt |
| CR-3 | TE-3: tabs 4 collection, badge rating, badge New | ES1-T48 #1, #2, #3; ES1-T60 #5 | Tabs 5–8 pt theo ES1-T48. Rating từ metafield, không có thì ẩn. New cần quy tắc (đề xuất tag) và màu #4B824D chưa có token, cần Designer kiểm AA |
| CR-4 | Story TE-16: blog posts hàng 14 | Inventory gán TE-9, không có AC | Thời gian đọc chưa có nguồn dữ liệu: BA, Tech Lead đề xuất |
| CR-5 | Bỏ multicolumn, custom liquid khỏi `templates/index.liquid:59-69` | ES1-T115 #4 | Giữ file block và `index.te7`. R5.1 chỉ yêu cầu có block nên vẫn đạt. Phải sửa `ES1-T121.spec.ts:201`, test này kiểm 3 cột trên trang chủ. Block khi đó chỉ thêm được bằng cách sửa template hoặc qua Sidekick |
| CR-6 | Shop the look: dòng Setup Discount (10%), 4 chấm hotspot, viền cam row đang chọn | ES1-T146 #3, #4 | Đề xuất dòng giảm theo cùng cách bundle ở chốt 11:15: có sẵn, kèm ghi chú. Chốt đó chỉ nêu bundle nên cần CTO duyệt. Hotspot cần AC tương tác |
| CR-7 | Chữ "MAKE" đậm riêng ở hàng 8; dấu tròn 1:761 ở hàng 10 | ES1-T116 #3, ES1-T154 #3 | Dấu tròn cần file SVG từ Designer |
| CR-8 | Testimonials ở 1920 đúng bố cục Figma: 4 card 456px tràn, cuộn được | ES1-T116 #5 | AC1 chỉ yêu cầu lưới ở 1280; giữ lưới ở 1280, khác biệt từ cỡ nào do Designer chốt |
| CR-9 | Nền panel #393942 (hàng 6, 7, 9): thêm token thay #1E1E1E | ES1-T135 #5, ES1-T145 #4 | Cần 1 token mới theo đúng quy trình AGENTS.md |
| CR-10 | Quiz: body map bấm được | ES1-T136 #3 | Khoảng 2 pt FE. Copy Figma "Tap the body map" phải đúng với chức năng. Copy "Two questions" mâu thuẫn với "Step 1 of 3" ngay trong Figma: đề xuất giữ nguyên văn Figma, mở lại ES1-T136 #2. Designer có thể sửa Figma thì đổi theo |

Không cần CR, chỉ là dữ liệu store dev: bundle đúng 6 sản phẩm (ES1-T145 #2), automatic discount thật khớp bậc giảm (ES1-T144).

Sửa tài liệu cần làm sau khi CTO duyệt, chưa sửa trong ticket này: SRS thêm TE-15, 16, 17; TE-9 AC1 còn nhắc `settings_data.json` và "preset" không đúng cách block-first; inventory hàng 13 vẫn ghi 3 USP (đang ẩn trong Figma).

## 5. Câu hỏi cho CTO

Không câu nào chặn ES1-T168, T169; không tạo ticket [Q] vì các câu nằm gọn ở đây và đều có mặc định.

1. 9 ngoại lệ ở 2.4 có được giữ không, nhất là màu AA (E1–E4), và trên store dev Verified để tắt hay bật khi so ảnh? Mặc định: giữ cả 9, Verified tắt cả trên store dev đúng chốt 11:15. Đổi E1–E4 về màu Figma thì phải sửa AGENTS.md và có nguy cơ không đạt accessibility ≥ 98.
2. Merchant mới cài có cần thấy sẵn ảnh, video và countdown như Figma không? Mặc định: không. Ảnh để trống theo AGENTS.md vì inventory ghi ảnh stock "không dùng làm asset theme", bản quyền chưa rõ, và đóng gói vào theme làm tăng dung lượng. Countdown ẩn tới khi merchant nhập ngày (TE-13 AC1). Nếu CTO muốn có ảnh: cần nguồn ảnh được phép dùng và Tech Lead tính ảnh hưởng Lighthouse.
3. Nghiệm thu trên `/` của store dev, cổng PR đo qua `?view=` (phương án C mục 3)? Mặc định: có.
4. Duyệt cả 10 CR ở mục 4 vào đợt này? Mặc định: duyệt tất cả, vì thiếu CR nào thì không đạt 100%; TE-6, TE-8 làm sau.
5. Ai nhập dữ liệu Figma trên store dev, và CTO kiểm giúp live theme (nghi là `ai-feature-ai-ES1-T147`, ES1-T162)? Mặc định: CTO nhập theo bảng BA như ES1-T60 #1, ES1-T134, T144, T153 làm trước; CTO tự publish lại theme đúng, agent không được publish. Thiếu dữ liệu thì block vẫn làm xong về code, cổng cuối chưa đóng.
