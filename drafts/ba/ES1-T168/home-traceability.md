KHÔNG CHẮC: (1) chưa đọc được kết quả CI (run 42160292639, các PR): phiên này không có Bash/GitHub, cột Test chỉ nói spec có gì, không nói spec pass. (2) Chưa chạy được `vague_words.py`, `traceability.py`: không có Bash, đọc `../ai-team/` bị từ chối; đã kiểm tay (mục 6). (3) Chưa mở store dev, không biết dữ liệu và tên shop hiện tại. (4) Task-split ES1-T114, T132, T141, T142 không có trên working tree, chỉ đọc qua ticket. (5) Chỉ mở 7 ảnh export: 1:490, 1:560, 1:636, 1:817, 1:885, 1:1022, 1:1104; các node khác đối chiếu bằng snapshot. (6) Ngưỡng 2 px và 1% lấy từ ES1-T167, chưa hiệu chuẩn.

# ES1-T168 — Truy vết 16 block trang chủ Figma với AC, ticket và khoảng trống

BA, 06/11/2026. Chỉ phân tích và đề xuất: không sửa SRS, không tạo ticket, không đổi ticket khác.
Đã kiểm trên: `feature/ai-ES1-T168` = `develop` = `origin/develop` = `0d3619b` (đọc ref trong `.git`, chưa fetch). `origin/main` local = `a2c5045`, khác `0d3619b`, nên chưa xác nhận được câu "main = develop" trong ticket; có thể do ref local cũ.

## 0. Kết luận

- Cập nhật theo CTO 06/11 11:32 (đến cùng lúc nộp bài): duyệt cả 10 CR và 5 mặc định của ES1-T167 (giữ 9 ngoại lệ; merchant mới cài không có sẵn ảnh, video, countdown; `?view=` cho cổng PR, `/` để nghiệm thu), bỏ giới hạn "chưa chạy sprint". Vì vậy điều kiện "CR được duyệt" trong AC-H17, H19, H20 đã thoả. Câu Q1–Q6 mục 4 vẫn là điểm mới, CTO chưa trả lời. Dữ liệu store dev chưa giao agent.
- 0/17 dòng Đạt. 14 dòng Thiếu, 3 dòng Chưa kiểm (hàng 1, 2, 4a). Inventory có 16 hàng; hàng 4 tách 4a, 4b vì 2 phần có story khác nhau.
- 5 phần chưa có block và không được gọi trong `templates/index.liquid`: hàng 3, 4b, 7, 11, 14. Hàng 3, 4b, 14 chưa có AC và ticket. Hàng 7, 11 có AC và ticket (ES1-T148, T157), ticket chưa làm.
- Các block đã gọi đúng thứ tự y. Multicolumn, custom liquid (`index.liquid:59-69`) không thuộc Figma.
- Không có test so ảnh nào: grep `toHaveScreenshot`, `maxDiffPixel`, `ui_diff` trong `tests/`, `scripts/` đều 0. Hiện không có bằng chứng tự động nào cho "giống 100%".
- Sau chốt CTO 11:14, 11:15, code chưa đổi: mặc định các block còn là chữ hướng dẫn hoặc trống. 8 nhóm test đang khẳng định trạng thái cũ (mục 2.4).
- Bổ sung so với ES1-T167, cần CTO hoặc Tech Lead xử lý (mục 1.3): 3 ô số liệu ở hàng 11 đang ẩn trong Figma; quiz, bundle, featured product không hiện gì với merchant mới cài dù có mặc định chữ; bậc giảm chốt 10%, 15% không tái tạo được dòng 5% của Figma; footer thiếu 5 phần chưa có setting; Lighthouse CI đo `/` khi 3 block trên không render.

## 1. Ma trận

Quy ước:
- Trạng thái chung: Đạt = có bằng chứng đo được đúng Figma và chức năng; Thiếu = có ít nhất 1 chênh đọc được từ code, test hoặc Figma; Chưa kiểm = không thấy chênh khi đọc, chưa đo.
- Cột Test: spec:dòng và URL. `/` = chạy trên trang chủ thật. `?view=` = template kiểm thử, không chứng minh trang chủ. Không có kết quả CI.
- Cột index: dòng gọi trong `templates/index.liquid`. "Layout" = gọi ở `layout/theme.liquid`.
- Mọi hàng đều chưa có test so ảnh, không nhắc lại trong bảng.

### 1.1 Truy vết

| # | Block, node, y | Story + AC | Ticket FE / BE / QA | Markup | JS | Test thật | index | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Header 1:362, y 24 | TE-1 AC2, AC3, AC9 | FE ES1-T14, T17 đóng / BE ES1-T16, T18 đóng / QA ES1-T23 đóng; search ES1-T129 ai-review, T130 mở | Có `blocks/header.liquid` | Có `header-menu.js`, `header-sticky.js` (`header.liquid:252,255`) | `TE-1.spec.ts:234-395`, `ES1-T16.spec.ts:37-207`. `test.fixme`: `TE-1.spec.ts:696,705` (hero thật) | Layout `theme.liquid:41` | Chưa kiểm |
| 2 | Slideshow 1:422, 1:437, y 80 | TE-2 AC1–AC4, AC6–AC9 | FE ES1-T28 đóng / BE ES1-T30 đóng / QA: không có task QA riêng, spec theo BE | Có `slideshow.liquid`, `slideshow-slide.liquid` | Có `slideshow.js` (`slideshow.liquid:95`) | `ES1-T30.spec.ts:48-234` trên `/`. Không có test copy, bố cục | `1-6`, đúng | Chưa kiểm |
| 3 | Collection list 1:395, y 1027 | KHÔNG có AC. Inventory ghi TE-3, ES1-T48 đã tách story mới, SRS chưa có. Đề xuất TE-15 | Không có | KHÔNG | KHÔNG | Không | KHÔNG gọi | Thiếu |
| 4a | Rich text 1:454, y 1515 | TE-2 AC5 | FE ES1-T29, T44 đóng / QA ES1-T45 đóng | Có `rich-text.liquid` | Không cần | `ES1-T45.spec.ts:70-230` trên `/` | `8-10`, đúng | Chưa kiểm |
| 4b | Shop by level 1:464, y 1515 + phần 1:453 | KHÔNG có AC. Đề xuất TE-15 | Không có | KHÔNG | Không rõ | Không | KHÔNG gọi | Thiếu |
| 5 | Featured collection 1:490, y 2663 | TE-3 AC1–AC8. Tabs, rating, New ngoài AC (ES1-T48) | FE ES1-T50, T51, T56 / BE ES1-T52, T57 / QA ES1-T53: đều đóng | Có `featured-collection.liquid`; thiếu tabs, rating, New | Có `product-swatch.js`; tabs không có | `TE-3.spec.ts:395-1105`, phần lớn trên `/` và `/collections/all` | `12-14`, đúng | Thiếu |
| 6 | Quiz 1:506, y 3457 | TE-11 AC1–AC4 | FE ES1-T137, T138 đóng / BE ES1-T139 mở / QA ES1-T140 mở | Có `quiz.liquid`, `quiz-step.liquid` | KHÔNG: không có `quiz-finder.js`, `lazy-module.js`; `quiz-finder` chưa định nghĩa | `ES1-T137.spec.ts:48-208`, `ES1-T138.spec.ts:67-178` trên `?view=te11`, `collection.quiz`. Skip `TE11_TAGS_READY`: `ES1-T138:87,98,105,152`. AC2 chưa có test | `16-22`, đúng; storefront không render (`quiz-step.liquid:52`) | Thiếu |
| 7 | Shop the look 1:560, y 4027 | TE-12 AC3, AC5. Dòng giảm, hotspot ngoài AC (ES1-T146 #3, #4) | FE ES1-T148 mở / BE ES1-T149 mở / QA ES1-T151 mở | KHÔNG | KHÔNG | Không | KHÔNG gọi | Thiếu |
| 8 | Image with text 1:625, y 5125 | TE-7 AC3, AC5 | FE ES1-T120 ai-review / QA ES1-T122 mở | Có `image-with-text.liquid` `layout: 'banner'` | Không cần | `ES1-T120.spec.ts:136-175` `?view=te7`; `:240,274` trên `/` | `24-26`, đúng | Thiếu |
| 9 | Bundle builder 1:636, y 6173 | TE-12 AC1–AC4 | FE ES1-T147 ai-review / BE ES1-T149 mở / Writer ES1-T150 mở / QA ES1-T151 mở | Có `bundle-builder.liquid` | KHÔNG: không có `bundle-form.js`; panel chỉ hiện sau `data-enhanced` | `ES1-T147.spec.ts:51-268` trên `?view=te12`. Skip thiếu dữ liệu: `:200,254`. AC1 động, AC3 chưa có test | `28-30`, đúng; storefront không render (`bundle-builder.liquid:100`) | Thiếu |
| 10 | Featured product 1:759, y 7201 | TE-13 AC1, AC2 | FE ES1-T156 ai-review / BE ES1-T158 mở / QA ES1-T159 mở | Có `featured-product.liquid` | KHÔNG: block không có thẻ script nào; `featured-product`, `product-form`, `product-variant-picker` không được nạp trên `/` | `ES1-T156.spec.ts:37-252` trên `?view=te13`. Skip: `:41,75,168,191,210,240,252`. Countdown chạy chưa có test | `32-34`, đúng; storefront không render (`featured-product.liquid:66`) | Thiếu |
| 11 | Video carousel 1:817, y 7974 | TE-13 AC3–AC5 | FE ES1-T157 mở / BE ES1-T158 mở / QA ES1-T159 mở | KHÔNG | KHÔNG | Không | KHÔNG gọi | Thiếu |
| 12 | Testimonials 1:885, y 8898 | TE-7 AC1, AC5 | FE ES1-T118 đóng / QA ES1-T122 mở | Có `testimonials.liquid`, `testimonial-item.liquid` | Không cần | `ES1-T118.spec.ts:37-190` `?view=te7`; `:197` trên `/` | `36-43`, đúng | Thiếu |
| 13 | Image with text 1:992, y 9814 | TE-7 AC3, AC5 | FE ES1-T120 ai-review / QA ES1-T122 mở | Có `image-with-text.liquid` | Không cần | `ES1-T120.spec.ts:50-115` `?view=te7`; `:240` trên `/` | `45-47`, đúng | Thiếu |
| 14 | Blog posts 1:1022, y 10690 | KHÔNG có AC. Inventory ghi TE-9, TE-9 AC3 chỉ nói trang blog, article. Đề xuất TE-16 | Không có | KHÔNG | Không rõ | Không | KHÔNG gọi | Thiếu |
| 15 | FAQ + stats 1:1057, y 11508 | TE-7 AC2, AC5 | FE ES1-T119 ai-review / QA ES1-T122 mở | Có `faq.liquid`, `faq-item.liquid` | Không cần (details) | `ES1-T119.spec.ts:49-237` `?view=te7`; `:247` trên `/` | `49-57`, đúng | Thiếu |
| 16 | Newsletter, footer, trust 1:1104, y 12290 | TE-1 AC5, AC6, AC9 | FE ES1-T15, T26 / QA ES1-T23: đều đóng | Có `footer.liquid`; thiếu 5 phần (mục 1.3 #8) | Không cần | `TE-1.spec.ts:439-535,682,870` | Layout `theme.liquid:49` | Thiếu |

Ngoài 16 hàng: `index.liquid:59-65` multicolumn, `:67-69` custom liquid, CR-5 của ES1-T167.

### 1.2 Ca thiếu và chênh Figma theo từng hàng

Chênh mặc định so với snapshot, đọc từ schema. Dữ liệu store (sản phẩm, ảnh) không tính là chênh của theme.

| # | Ca thiếu (chưa có AC hoặc test) | Chênh Figma đã biết |
| --- | --- | --- |
| 1 | Hover, mega menu, focus, search mở chưa so; hero thật còn `test.fixme`; dữ liệu 7 mục menu | Logo 1:377 cần tải lên, chưa có đường mặc định |
| 2 | Chấm, nút hover; test copy; ảnh, video | H1 Figma 2 dòng "Level Up\nYour Fitness", default 1 dòng `slideshow-slide.liquid:152`; xuống dòng phụ thuộc độ rộng, chưa đo |
| 3 | Toàn bộ: rỗng dưới 5 card, hover, next/back, mobile | Toàn bộ |
| 4a | Ảnh inline chưa có | Copy khớp: `rich-text.liquid:97,110,133,140` |
| 4b | Toàn bộ: rỗng, badge số sản phẩm, mobile | Toàn bộ, gồm "SHOP BY LEVEL", "Choose Your Training Level", "24 Products" |
| 5 | Tab rỗng, đổi tab, hover card | Không có tabs. Rating, New chưa có. Mặc định 8 sản phẩm (`featured-collection.liquid:168`), Figma 4. Nguồn `all` (`index.liquid:13`) hiện sản phẩm test |
| 6 | Bước 2, 3 chưa có copy (ES1-T135 #8); điều hướng, kết quả qua JS | Eyebrow, note_1 trống (`quiz.liquid:260,277`). "Three questions" (`:272`) so với "Two questions". Câu hỏi và lựa chọn trống (`quiz-step.liquid:154-185`). Bỏ "Tap the body map" theo ES1-T136 #3 |
| 7 | Toàn bộ | Toàn bộ. Dòng giảm, 4 hotspot, viền cam, thẻ "Fits: 2.4×2.0 m". Số mẫu tự mâu thuẫn (1.3 #6) |
| 8 | Chữ hướng dẫn hiện cho khách khi chưa nhập | Heading, body, nút sai (`image-with-text.liquid:207-226`). Eyebrow "Add a short label" không có trong Figma. Chữ MAKE đậm chưa có (ES1-T116 #3) |
| 9 | Panel động, 422, sold out kèm JS | Heading "Pick Your Kit" (`bundle-builder.liquid:320`). Link trống (`:325`). Bậc giảm 0 (`:361,380,399`), chốt mới 10%, 15%. Ghi chú chưa theo chốt (`:406`). Copy tiến độ `locales:64` khác "Add 1 more item to unlock 15% off", thiếu icon khoá. Figma 6 thẻ, code tối đa 9 |
| 10 | Countdown chạy, đổi variant, Add to cart qua JS trên `/` | Eyebrow, 4 nhãn spec trống (`featured-product.liquid:451,468-487`). Con dấu 1:761 bỏ (ES1-T154 #3). "Add to cart" khác "Add To Cart" (1.3 #7) |
| 11 | Toàn bộ | Toàn bộ. 3 ô số liệu, link, nhãn đều ẩn trong Figma (1.3 #1) |
| 12 | Mặc định 4 mục khác nhau; cuộn ở 1920 | Heading, eyebrow, tên, tiêu đề, quote là chữ hướng dẫn (`testimonials.liquid:81,87`, `testimonial-item.liquid:120,142,149`). Sao mặc định 5, card 2 Figma 4 sao. Figma 4 card 456px tràn, code theo ES1-T116 #5 dồn 4 cột. Verified tắt là ngoại lệ E9 |
| 13 | Như hàng 8 | Eyebrow, heading, body, nút sai (`image-with-text.liquid:207-226`). Heading Figma 2 dòng. Cùng 1 schema với hàng 8 nên không thể có 2 default khác nhau (1.3 #9) |
| 14 | Toàn bộ: rỗng dưới 5 bài, nguồn thời gian đọc, mobile | Toàn bộ |
| 15 | Mặc định 5 câu khác nhau | Eyebrow khác hoa thường (`faq.liquid:149`). Heading sai (`:155`). Stat trống (`:171-199`). Câu hỏi, trả lời là chữ hướng dẫn (`faq-item.liquid:57,63`) |
| 16 | Hiện chưa có AC cho 5 phần thiếu | 1.3 #8. Copy newsletter, trust khớp (`footer.liquid:332,338,362-434`) |

### 1.3 Phát hiện bổ sung so với ES1-T167

| # | Phát hiện | Bằng chứng | Hệ quả | Mặc định đề xuất |
| --- | --- | --- | --- | --- |
| 1 | 3 ô số liệu hàng 11 không hiện trong Figma | Frame 1:827 chứa 1:830 "360+", 1:833 "1:15", 1:836 "4K" có `visible:false`; ảnh `1-817.png` không có 3 ô. Link 1:826 và nhãn 1:844 cũng ẩn | Sai: inventory hàng 11, TE-13 AC3, tiêu đề ES1-T157, ES1-T155 #8. "360+" hiện trong Figma nằm ở hàng 15 (1:1057) | Theo ảnh export: hàng 11 không hiện 3 ô ở mặc định; hàng 15 có sẵn "360+". Ghi ở Q5 |
| 2 | Tiêu chí copy "khớp 100% snapshot" của ES1-T167 mục 2.2 đo sai nếu không lọc | Snapshot chứa text ẩn: "Equip" 1:1169, "Catalog" 1:888, 3 USP 1:999–1:1005, "(5.0)" 1:912, `-25%` trên thẻ bundle 1:650 | Test đòi cả chữ không hiện | Chỉ so node hiện: bản thân và mọi node cha không có `visible:false` |
| 3 | Snapshot và ảnh export khác nhau | Snapshot "Freatured", `1-1022.png` "Featured" | Không biết nguồn nào thắng | Ảnh export thắng khi lệch; Designer xác nhận |
| 4 | Ảnh tham chiếu chưa dùng so pixel trực tiếp được | `1-560`, `1-817`, `1-1022` mở ra nền đen và heading gần như chìm: nghi nền trong suốt, chưa đọc kênh alpha. Không có `1-454.png`, `1-464.png`, chỉ có `1-453.png`. Ảnh cả block chứa ảnh stock (inventory) | So pixel báo lệch giả. Ảnh store dev khác ảnh Figma thì không đạt 1% | QA ghép nền theo band, cắt 1-453. Ảnh store dev phải là đúng ảnh Figma (ES1-T167 mục 3 phân công xuất ảnh) |
| 5 | Bậc giảm chốt không tái tạo được panel Figma | Figma "Bundle discount (5%)", "Add 1 more item to unlock 15% off". Chốt 11:15: 2 món 10%, 3 món 15%. Bậc 5% không tồn tại, 3 món đã đạt bậc cao nhất | E7 của ES1-T167 chỉ nêu số món và subtotal, chưa nêu phần này | Giữ chốt CTO, mở rộng E7 |
| 6 | Số mẫu 1:560 tự mâu thuẫn | 4 hàng cộng 1 187,98, Figma 1,186.99. 1,186.99 − 118.70 = 1,068.29, Figma 1,086.29 | Chức năng tính đúng thì không ra số mẫu | Thêm ngoại lệ E10, che vùng số khi so |
| 7 | "Add To Cart" (Figma) mâu thuẫn AGENTS.md | `AGENTS.md:476-478` giữ chữ Shopify "Add to cart"; `locales:149` | Copy không thể khớp 100% nếu giữ AGENTS.md | Thêm ngoại lệ E11. AGENTS.md là nguồn cao nhất |
| 8 | Footer thiếu phần có trong 1:1104 | `footer.liquid` không có logo, không có mô tả "Efitco provides…", không có ảnh newsletter, không có "No spam. Unsubscribe anytime."; nút "Subscribe" (`locales:101`) khác "Get 15% Off" + icon; heading 2 màu chưa có. Grep `No spam`, `provides premium`, `logo`, `image_picker` trong file = 0 | ES1-T167 ghi hàng 16 chỉ cần "Menu, social, copy": chưa đủ | Thêm AC-H28, ticket FE |
| 9 | Một schema chỉ có 1 default | Hàng 8 và 13 cùng `image-with-text`; 5 `faq-item`, 4 `testimonial-item`, 3 `quiz-step` khác nội dung nhau. Param trùng setting: docs không nói ai thắng (ES1-T117 #4) | Sửa `default` trong schema không đủ cho các block lặp | Tech Lead chốt (ES1-T169), điều kiện đo ở AC-H6 |
| 10 | Mặc định chữ chưa đủ để merchant mới cài thấy block | Quiz cần lựa chọn có tag (`quiz-step.liquid:46,52`). Bundle cần collection (`bundle-builder.liquid:100`). Featured product cần product (`featured-product.liquid:66`). `AGENTS.md:258` quy định storefront không render khi thiếu tài nguyên | Chốt "bậc 10%, 15% hiện sẵn" không nhìn thấy được khi chưa có collection | Q1 |
| 11 | Rating, spec hàng 10 lấy từ metafield | `featured-product.liquid:137,158`. Chốt 11:15 nêu review, sao, số đánh giá, chưa rõ có gồm "(4.9) 341 reviews" và 4 giá trị spec không | Merchant mới không có metafield | Q2 |
| 12 | Hàng 10 trên `/` chưa dùng được khi bật JS | Không có script nạp `product-variant-picker`, `product-form`. Theo ES1-T59 D4, select thay thế chỉ có trong `noscript` | Đổi variant không có tác dụng tới khi có ES1-T158. Không phải lỗi mới, chỉ là việc chưa làm | AC-H22 |
| 13 | Lighthouse CI đo `/` trên preview | `store-tests.yml:36`. Preview không có block settings, nên quiz, bundle, featured product không render, hero không ảnh | Điểm hiện tại không đại diện trang đủ 16 block. TE-13 AC5 chưa đo được | AC-H30 |
| 14 | Trần JS 65 536 B chưa có bước đo | ADR 0006:24-25 quy định; grep `transferSize`, `65536` trong `tests/`, `.github/` = 0 | Chưa chặn merge như chốt ES1-T160 | AC-H31 |
| 15 | Copy Figma chứa lỗi và nội dung mẫu | 5 câu FAQ cùng 1 câu trả lời về shipping; "We aRE about"; "everyday life !"; "do i actually". FAQ mẫu còn nêu "free on orders over $99", "2-4 business days" | Giữ nguyên văn thì khách đọc câu trả lời không khớp câu hỏi và cam kết giao hàng không phải của shop | Q3 |
| 16 | Wordmark, copyright là `shop.name` | ES1-T19 #1; `footer.liquid:290,296` | Store dev chỉ giống Figma khi tên shop là "Efitco" | Q4 |
| 17 | Khác inventory | Hàng 9 "add 2 more to get 15%" và "lưới 9"; snapshot "Add 1 more item to unlock", ảnh 6 thẻ. Hàng 11 heading thiếu ", Before You Buy". Hàng 15 "12 Warranty months"; snapshot "Warranty / 12 / Months on every item." | Đo theo inventory sẽ sai | Designer sửa inventory |

## 2. Khoảng trống AC

### 2.1 Cách đạt "giống 100%" mà không tạo số liệu giả trên store thật

Giữ nguyên ES1-T167 mục 2, 3 (phương án C), không đề xuất trang chủ khác Figma. Phần BA thêm:
- Theo chốt 11:14, 11:15, copy, số liệu, review mẫu là mặc định của theme và CTO đã chấp nhận. Việc tránh nội dung mẫu trên store thật dựa vào tài liệu merchant và mục kiểm tra trước publish (AC-H33).
- Giá trị không tính được từ dữ liệu thật thì không ép khớp: E7, E8, E10.
- Đo: QA chạy so ảnh Playwright trong CI. Designer chấm từng block và ghi sổ chênh lệch. CTO ký cuối.

### 2.2 AC mới đề xuất (chưa sửa `docs/srs.md`)

TE-15, TE-16, TE-17 là story ở CR-1, CR-2, CR-4, CTO đã duyệt 06/11 11:32, chưa ghi vào SRS. Ngưỡng 2 px và 1% chờ hiệu chuẩn.

| Mã | Story | Hàng | Given / When / Then | TC đề xuất | Người đo |
| --- | --- | --- | --- | --- | --- |
| AC-H1 | TE-17 | Tất cả | Given `/` trên store dev đủ dữ liệu When đọc thứ tự block trong DOM Then đúng 16 hàng inventory theo y, 0 block ngoài danh sách | TC-H1 | QA |
| AC-H2 | TE-17 | Tất cả | Given bảng nội dung lấy từ node hiện trong Figma When so từng chuỗi với text block đã bỏ khoảng trắng thừa, so sau `text-transform` Then khớp 100%, trừ giá trị động đã che và ngoại lệ đã ký | TC-H2 | QA |
| AC-H3 | TE-17 | Tất cả | Given viewport 1920, cùng scale với ảnh export, vùng động đã che When so từng block với ảnh node Then kích thước block lệch tối đa 2 px, số pixel khác tối đa 1%, sổ chênh lệch 0 mục mở | TC-H3 | QA, Designer |
| AC-H4 | TE-17 | Tất cả | Given từng giá trị font, cỡ chữ, màu, bo góc, khoảng cách của node When đọc computed style Then bằng giá trị Figma, trừ ngoại lệ đã ký | TC-H4 | Designer |
| AC-H5 | TE-17 | Tất cả | Given theme mới cài, chưa mở editor When mở `/` Then copy và số liệu Figma của các hàng đã có setting chữ hiển thị, gồm "360+" ở hàng 15 và "Trusted by 10,000+ athletes" ở hàng 2; 0 chữ "Add a", "Customer name" hướng dẫn | TC-H5 | QA |
| AC-H6 | TE-17 | Tất cả | Given merchant sửa 1 setting chữ trong editor When lưu và mở `/` Then giá trị merchant hiển thị thay mặc định, ở cả block lặp (faq-item, testimonial-item, quiz-step, 2 image-with-text) | TC-H6, tay trên editor | QA |
| AC-H7 | TE-17 | Tất cả | Given từng control tương tác trên `/` When focus bằng bàn phím và hover Then có focus ring theo DESIGN.md, đổi trạng thái hover nếu control có quy định; axe 0 serious, 0 console error | TC-H7 | QA |
| AC-H8 | TE-15 | 3 | Given block có 5 collection When render 1920 Then 5 card 336 × 270 đúng tên; bấm next/back cuộn 1 card; card link tới đúng collection | TC-H8 | QA |
| AC-H9 | TE-15 | 3 | Given dưới 5 collection hoặc 0 collection When render Then chỉ hiện số card có, ẩn next/back khi không còn gì để cuộn; 0 collection thì storefront không render | TC-H9 | QA |
| AC-H10 | TE-15 | 4b | Given 3 card trình độ gắn collection When render Then badge số sản phẩm bằng `products_count` của collection, số ít nhiều đúng locale; store dev có 24 sản phẩm để khớp "24 Products" | TC-H10 | QA |
| AC-H11 | TE-3 | 5 | Given 4 tab gắn 4 collection When bấm hoặc dùng bàn phím đổi tab Then lưới đổi không reload, tab chọn có trạng thái chọn đọc được bởi trình đọc màn hình; không JS thì 4 tab là link tới collection | TC-H11 | QA |
| AC-H12 | TE-3 | 5 | Given tab có collection rỗng When chọn Then hiện thông báo rỗng, không còn card của tab trước | TC-H12 | QA |
| AC-H13 | TE-3 | 5 | Given sản phẩm có metafield rating When render card Then hiện sao + số; không có metafield thì không có badge | TC-H13 | QA |
| AC-H14 | TE-3 | 5 | Given sản phẩm thoả quy tắc New (CR-3) When render card Then badge New đạt 4.5:1; đang sale thì hiện badge % như Figma, quy tắc ưu tiên do CR-3 chốt | TC-H14 | QA, Designer |
| AC-H15 | TE-11 | 6 | Given theme mới cài When mở `/` Then quiz theo Q1; copy bước 1 đúng 1:506 gồm "Our most-loved feature", "20 seconds" | TC-H15 | QA |
| AC-H16 | TE-11 | 6 | Given store chưa gắn tag khớp quiz When hoàn tất 3 bước Then hiện text rỗng và link collection, 0 console error; tài liệu merchant nêu cần gắn tag | TC-H16 | QA |
| AC-H17 | TE-11 | 6 | Given CR-10 được duyệt, từ 48rem When bấm vùng trên body map Then chọn đúng lựa chọn Upper body, Core hoặc Lower body như bấm danh sách, dùng được bằng bàn phím | TC-H17 | QA |
| AC-H18 | TE-12 | 9 | Given mặc định chưa đổi và block có sản phẩm When chọn 1, 2, 3 món Then lần lượt: "còn 1 món để đạt 10%"; dòng giảm 10%; dòng giảm 15% và trạng thái đạt bậc cao nhất; luôn có ghi chú giảm giá chỉ áp dụng khi có discount tự động | TC-H18 | QA |
| AC-H19 | TE-12 | 7 | Given CR-6 được duyệt When render shop the look Then có thẻ "Fits", dòng giảm và ghi chú cùng quy tắc AC-H18, tổng trừ đúng số tiền giảm tính từ giá thật, row hết hàng không tính vào tổng | TC-H19 | QA |
| AC-H20 | TE-12 | 7 | Given CR-6 được duyệt, 4 hotspot When hover, focus hoặc bấm hotspot Then row tương ứng có viền accent; bấm row thì hotspot tương ứng ở trạng thái chọn; dưới 64rem theo mặc định Designer ghi mới | TC-H20 | QA |
| AC-H21 | TE-13 | 11 | Given mặc định When render 1920 Then 6 thẻ 264 × 554, đúng copy 1:817, không có 3 ô số liệu, link, nhãn (theo Q5); poster hiển thị, bấm mới chạy | TC-H21 | QA |
| AC-H22 | TE-13 | 10 | Given featured product trên `/` có JS When đổi variant Then giá, nút, ảnh cập nhật không reload; Add to cart mở drawer, số giỏ tăng đúng | TC-H22 | QA |
| AC-H23 | TE-13 | 10 | Given store dev, ngày kết thúc dưới 24 giờ When render `/` Then ô ngày ẩn, 3 ô giờ phút giây giảm mỗi giây, F5 không reset; quá hạn thì ẩn countdown | TC-H23 | QA |
| AC-H24 | TE-7 | 12 | Given 4 card, viewport 1920 When render Then 4 card rộng 456px, card 4 tràn như Figma, cuộn bằng chuột và bàn phím tới hết card 4; khác biệt theo cỡ màn do Designer ghi (CR-8) | TC-H24 | QA, Designer |
| AC-H25 | TE-7 | 12 | Given mặc định When render Then 4 review đúng 1:885 (card 2 là 4 sao), Verified tắt, ngoại lệ E9 có trong sổ | TC-H25 | QA |
| AC-H26 | TE-16 | 14 | Given blog có từ 5 bài When render 1920 Then 5 card 300 × 448, ảnh, nhãn, tiêu đề, thời gian đọc; card link tới đúng bài; từ 5 card tràn thì cuộn được | TC-H26 | QA |
| AC-H27 | TE-16 | 14 | Given blog dưới 5 bài hoặc không có nguồn thời gian đọc When render Then hiện số bài có, ẩn dòng thời gian đọc; 0 bài thì storefront không render | TC-H27 | QA |
| AC-H28 | TE-1 | 16 | Given footer mặc định When render 1920 Then đủ: logo, mô tả, ảnh newsletter nếu đã chọn, heading 2 màu đạt AA, nút "Get 15% Off" + icon, "No spam. Unsubscribe anytime.", đúng 1:1104 | TC-H28 | QA, Designer |
| AC-H29 | TE-1, TE-2 | 1, 2 | Given hero thật trên `/` When ở đầu trang và cuộn quá 80px Then header trong suốt chữ trắng, rồi nền trắng chữ foreground; bật lại TE-1 TC-46, TC-47 | TC-H29 | QA |
| AC-H30 | TE-10 | Tất cả | Given `/` hoặc URL đại diện có đủ 16 block và ảnh When chạy lhci desktop và mobile Then performance ≥ 96 và ≥ 90, accessibility ≥ 98; CI chặn merge khi dưới ngưỡng | TC-H30 | DevOps, QA |
| AC-H31 | TE-10 | Tất cả | Given `/` đủ 16 block When tải xong, rồi cuộn hết trang Then JS tải sẵn ≤ 40 960 B, tổng sau cuộn ≤ 65 536 B; vượt thì chặn merge. Tính cả tabs và block mới | TC-H31 | QA, DevOps |
| AC-H32 | TE-10 | Tất cả | Given spec của story P0 trên store dev đủ dữ liệu When chạy E2E Then 0 test skip do 429 hoặc thiếu dữ liệu | TC-H32 | QA |
| AC-H33 | TE-10 | Tất cả | Given tài liệu merchant When kiểm Then có mục bắt buộc trước publish: thay nội dung mẫu, tạo discount thật khớp bậc giảm, gắn tag quiz, chỉ bật Verified khi đã xác thực; mỗi block có dòng info nhắc nội dung mẫu | TC-H33 | Writer, QA |
| AC-H34 | TE-10 | Không | Given zip giao bằng `scripts/theme-zip.sh` When liệt kê file Then 0 file `templates/index.te*` (grep hiện chưa thấy loại trừ) | TC-H34 | DevOps |
| AC-H35 | TE-17 | Tất cả | Given `/` ở 360 và 768 When đo từng block Then không tràn ngang, control ≥ 44px, không chồng chữ, theo ES1-T116 #5, #6, ES1-T135 #4, ES1-T145 #1, #6, ES1-T154 #2, #8; TE-15, TE-16, CR-3 có mặc định Designer ghi trước khi làm | TC-H35 | QA, Designer |

Mã R: AC-H5, H18, H19, H25, H33 liên quan R8 (xem 2.3); AC-H7, H11, H17, H20, H24, H35 R12; AC-H30, H31 R6; AC-H1, H2 R3, R14.

### 2.3 AC và tài liệu lệch quyết định CTO

| Nơi | Đang ghi | Lệch | Đề xuất sửa |
| --- | --- | --- | --- |
| TE-7 AC5 | Default text gợi cách dùng | Chốt 11:14 | Mặc định là nội dung Figma; giữ không Lorem Ipsum, giữ Custom Liquid |
| TE-9 AC1 | `settings_data.json`, resource default | Không đúng block-first; chốt 11:14 | Thay bằng AC-H1, AC-H5, giữ câu không trỏ resource không tồn tại |
| TE-9 AC4 | 24 sản phẩm, 4 collection, 3 bài blog, ảnh tự do | Figma cần 5 bài, 3 + 5 + 4 collection và ảnh Figma | Bảng nội dung theo node; ảnh demo chờ xác nhận quyền dùng |
| TE-10 AC3 | R nhóm bắt buộc pass 100% | Nội dung mẫu có thể rơi vào R8 | Ghi rõ nội dung mẫu là mặc định phải thay trước publish và có demo store khi nộp (chốt 11:15) |
| TE-11 AC4 | "< 750px" | ES1-T136 #6: 48rem | Sửa thành 48rem |
| TE-12 AC1 | "vd 2 món 10%, 3 món 15%", tối đa 9 | Chốt 11:15; store dev cần 6 thẻ | Mặc định 2 món 10%, 3 món 15%, ghi chú bắt buộc; tối đa 9 giữ nguyên |
| TE-12 AC5, mã R | Không có dòng giảm; "R8 không fake giảm giá" | CR-6, chốt 11:15 | Theo AC-H19 sau khi duyệt; R8 đổi thành: giảm thật do discount, có ghi chú |
| TE-13 AC3 | "không autoplay có tiếng"; "3 ô số liệu là text setting" | ES1-T155 #4 không tự chạy; 1:827 ẩn | "Bấm mới chạy, không tự chạy kể cả tắt tiếng"; 3 ô theo Q5 |
| TE-3 AC1 | Mặc định 8 | Figma 4 | Theo CR-3: mặc định 4 hoặc giữ 8 và trang chủ đặt 4, Tech Lead chốt |
| TE-3 AC6 | Touch target ≥ 24px | `AGENTS.md:298` 44px với control; `TE-3.spec.ts:918` đo 24px | Tech Lead chốt theo thứ tự nguồn sự thật. Chưa có quyết định trong nguồn đã đọc |
| `DESIGN.md:205-207`, `docs/checklist-theme-store.md:42`, `docs/requirements-map.md:12`, doc `bundle-builder.liquid:11`, `featured-product.liquid:15` | R8 | ES1-T167 mục 3 đã liệt kê | Giữ danh sách đó |
| ES1-T135 #5, ES1-T145 #4 | Không thêm token panel | Figma #393942 | CR-9 của ES1-T167 mở lại |
| ES1-T136 #2, #3 | "Three questions", không nhắc Tap | Chốt 11:12 | CR-10 của ES1-T167 mở lại |

### 2.4 Test đang khẳng định trạng thái cũ, phải đổi khi sửa mặc định

| Test | Khẳng định hiện tại |
| --- | --- |
| `ES1-T118.spec.ts:197-213` | Heading hướng dẫn, "Customer name", không có "johnson" |
| `ES1-T119.spec.ts:247-264` | Heading hướng dẫn, 0 ô stat, không có "360+" |
| `ES1-T120.spec.ts:240-272` | Heading "Add a heading" cho 2 block, không có chữ "efitco" |
| `ES1-T121.spec.ts:201` | Trang chủ có 3 cột multicolumn (CR-5) |
| `ES1-T137.spec.ts:124-132` | Trang chủ không có quiz |
| `ES1-T147.spec.ts:179-186` | Trang chủ không có bundle builder (đổi nếu Q1 đổi) |
| `ES1-T156.spec.ts:201-206` | Trang chủ không có featured product (đổi nếu Q1 đổi) |
| `TE-3.spec.ts:426,769` | Mặc định `products_to_show` 8; sản phẩm hết hàng trong 8 sản phẩm đầu (đổi nếu mặc định thành 4) |

Đây là các test đã đọc từng dòng. `ES1-T147.spec.ts:133` (ES1-T167 yêu cầu xem lại) chạy trên `?view=te12` nên chưa xếp vào bảng; QA kiểm lại khi đổi mặc định bậc giảm. Chưa rà hết các spec khác, QA rà nốt.

## 3. Ticket nên thêm (chưa tạo, không ước lượng)

| Tên | Phía | Lý do |
| --- | --- | --- |
| TE-17-BA1: bảng nội dung theo node hiện trong Figma + sửa SRS sau khi CR duyệt | BA | Đầu vào của mặc định, dữ liệu store, AC-H2 |
| TE-17-TL1: chốt cách đặt mặc định cho block lặp, merchant vẫn sửa được | Tech Lead | 1.3 #9, AC-H6; có thể gộp ES1-T169 |
| TE-17-FE1: mặc định Figma cho hàng 2, 5, 6, 8, 9, 10, 12, 13, 15 | FE | AC-H5 |
| TE-17-FE2: footer 1:1104 còn thiếu 5 phần | FE | 1.3 #8, AC-H28 |
| TE-17-QA1: sửa các test mặc định trống ở mục 2.4, rà toàn bộ spec | QA | Mục 2.4 |
| TE-17-QA2: so ảnh, so copy, đo style theo block | QA | AC-H1–H4, chưa có test nào |
| TE-17-DEVOPS1: Lighthouse trên trang đủ 16 block, đo JS sau cuộn, loại `index.te*` khỏi zip | DevOps | 1.3 #13, #14, AC-H30, H31, H34 |
| TE-17-DES1: ảnh nguyên liệu, SVG con dấu 1:761, copy quiz bước 2, 3, sửa inventory, xác nhận lỗi copy | Designer | 1.3 #3, #15, #17; ES1-T135 #8 |
| TE-17-OPS1: nhập sản phẩm, collection, tag, metafield, discount, bài blog, menu, tên shop, ảnh trên store dev | Người (CTO) | Agent không ghi được admin; gộp ES1-T134, T144, T153 |
| TE-15-FE1, TE-15-FE2: collection list 1:395; shop by level 1:464 | FE | Hàng 3, 4b |
| TE-15-BE1: next/back nếu Tech Lead chọn JS | BE | AC-H8; bỏ nếu không cần JS |
| TE-15-QA1 | QA | AC-H8–H10 |
| TE-3-FE4, TE-3-BE3: tabs markup; tabs đổi không reload | FE, BE | CR-3, AC-H11, H12 |
| TE-3-FE5: rating, New | FE | CR-3, AC-H13, H14 |
| TE-16-FE1, TE-16-QA1: blog posts 1:1022 | FE, QA | CR-4, AC-H26, H27 |
| TE-12-FE3, TE-12-BE2: shop the look dòng giảm, hotspot, viền chọn | FE, BE | CR-6, AC-H19, H20 |
| TE-7-FE5: testimonials 1920, chữ MAKE | FE | CR-7, CR-8, AC-H24 |
| TE-13-FE3: con dấu 1:761 | FE | CR-7; chờ SVG |
| TE-11-FE3, TE-11-BE2: body map bấm được | FE, BE | CR-10, AC-H17 |
| TE-1-FE6: token panel #393942 | FE | CR-9 |
| TE-10-DOC1: tài liệu nội dung mẫu, mở rộng ES1-T150 | Writer | AC-H33 |

Không cần thêm ticket: ES1-T148, T149, T157, T158, T139, T122, T140, T151, T159, T99 đã có, chỉ cần cập nhật theo AC mới.

Giảm conflict: các ticket FE trên đều đụng `base.css`, `locales`, `templates/index.liquid` nên không mở song song. Thứ tự do ES1-T169 chốt.

## 4. Câu hỏi cho CTO (không tạo ticket [Q], không chặn)

1. Block cần tài nguyên, merchant mới cài chưa có quiz tag, collection bundle, product: có hiện không? Mặc định: bundle dùng collection `all` như `index.liquid:13` (ES1-T48 #3) nên bậc giảm hiện sẵn; quiz hiện đủ, kết quả rỗng theo AC-H16; featured product và shop the look ẩn tới khi chọn sản phẩm. Hệ quả: phải sửa dòng empty state `AGENTS.md:258` cho quiz, bundle.
2. Rating "(4.9) 341 reviews" và 4 giá trị spec hàng 10 có thành mặc định không? Mặc định: không. Giữ metafield, store dev nhập đúng số Figma, merchant không có thì ẩn (TE-13 AC2). Nhãn spec vẫn là mặc định.
3. Copy lỗi và 5 câu trả lời FAQ giống nhau của Figma: giữ nguyên văn? Mặc định: giữ nguyên văn theo chốt 11:12; Designer sửa Figma thì đổi theo. Hệ quả: cam kết giao hàng, freeship $99 hiện cho khách nếu merchant không thay.
4. Wordmark và copyright dùng `shop.name` (ES1-T19): giữ? Mặc định: giữ; đổi tên shop store dev thành "Efitco" khi nghiệm thu. Merchant mới thấy tên shop của họ, ghi là khác biệt dữ liệu, không phải chênh theme.
5. Hàng 11: 3 ô số liệu ẩn trong Figma nên không hiện? Mặc định: không hiện theo ảnh export. "360+" bắt buộc của CTO vẫn hiện ở hàng 15. Nếu CTO muốn hiện cả ở hàng 11 thì trang sẽ khác Figma, cần ghi thành ngoại lệ.
6. Thêm E10, E11 và mở rộng E7 vào danh sách ngoại lệ ES1-T167 mục 2.4? Mặc định: có.

## 5. Tác động lên ES1-T167 và ES1-T169

- ES1-T167 mục 2.1 hàng 11: bỏ 3 ô số liệu khỏi phần phải có, nếu CTO giữ mặc định Q5.
- ES1-T167 mục 2.1 hàng 16: thêm 5 phần ở 1.3 #8.
- ES1-T167 mục 2.2 tiêu chí 2: chỉ so node hiện; tiêu chí 5: xử lý nền trong suốt nếu xác nhận, cắt 1-453.
- ES1-T169: tính TE-17-TL1 và Q1 trước khi FE làm mặc định.

## 6. Tự kiểm tra

- `vague_words.py`, `traceability.py`: CHƯA CHẠY được (không có Bash, `../ai-team/` bị từ chối). Orchestrator chạy lại giúp.
- Kiểm tay: 17/17 dòng ma trận có node, AC hoặc ghi rõ KHÔNG có AC, ticket hoặc ghi rõ không có; 35/35 AC mới có Story và TC.
- 0 sửa ngoài `drafts/ba/ES1-T168/`; 0 ticket tạo; 0 ticket khác bị đổi.
