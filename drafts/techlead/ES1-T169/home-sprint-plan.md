KHÔNG CHẮC: (1) CI develop chỉ đọc qua comment CTO 11:33 trên ticket này, `gh` và `git fetch` bị từ chối mạng; (2) thời gian 1 lần store-tests chưa đo được, số PR/ngày là giả định; (3) point của ticket CHƯA TẠO là ước lượng theo skill estimate, chưa có spec chi tiết; (4) ngưỡng 2 px và 1% chưa hiệu chuẩn; (5) API `images` ở D2 và thứ tự ưu tiên param/setting ở D1 chưa kiểm được vì không mở được shopify.dev; (6) nguyên nhân ES1-T120 AC3 và ES1-T147 nojs chưa chạy lại trên preview; (7) ngày Sprint 1, 2 lấy từ ticket, không đọc được dòng sprints trong `project.json`.

# ES1-T169: thứ tự ticket trang chủ, phụ thuộc và sprint

Tech Lead, 06/11/2026. Đã kiểm trên: `feature/ai-ES1-T169` = `develop` = `origin/develop` = `0d3619b` (ref local). `origin/main` local = `a2c5045`, khác `0d3619b`; có thể do ref cũ, chưa fetch được.
Giới hạn còn hiệu lực: file này không đổi ticket, không tạo ticket, không sửa code. CTO đã bỏ giới hạn "chưa chạy sprint" (11:32): kế hoạch này chạy được ngay sau bước 0. Merge vẫn cần CTO.

## 0. Kết luận

- Thứ tự: dựng lại CI xanh, dựng cổng đo, đưa nội dung vào block đã có, rồi làm block còn thiếu và JS, cuối cùng nghiệm thu trên `/`.
- Khối lượng còn lại: 81 point dev (FE 57, BE 24) + 1 point sửa ES1-T120, khoảng 30 PR, 13 ticket dev mới. QA, Writer không tính point.
- Nút thắt là cổng CI và lượt duyệt, không phải hạn mức. 30 PR chạy tuần tự: 4 PR/ngày xong 14/11; 3 PR/ngày tới 16/11, tràn Sprint 2 phần nghiệm thu.
- Chạy song song tối đa 2 PR trong CI; chỉ 1 PR được sửa `base.css`, `locales`, `templates/index.liquid` tại một thời điểm.
- "Giống 100%" trên `/` phụ thuộc dữ liệu store dev do người nhập (mục 7). Thiếu dữ liệu thì code vẫn xong, cổng cuối chưa đóng.
- Đổi so với PO: ES1-T139 lên trước TE-15, TE-3 vì `lazy-module.js` là phụ thuộc của 4 ticket BE sau đó.
- Bước 0 cần CTO: duyệt plan này, rồi Tech Lead tạo 25 ticket còn lại ở mục 6 và cập nhật body ticket cũ (TE-17-TL2).

## 1. Ổn định: trạng thái CI develop

Nguồn: comment CTO 11:33 về run 42160292639 (`0d3619b`). Theme check, preview, lighthouse xanh; e2e đỏ 31 test. Tôi không tự đọc được log run.

| Nhóm | Test | Kết luận | Xử lý |
| --- | --- | --- | --- |
| A | ES1-T30 autoplay, 7 test | Lỗi test: `route.fetch` tại `ES1-T30.spec.ts:20` nhận trang bot protection | TE-10-QA2: không gọi lại store trong route |
| B | ES1-T73 x3, ES1-T81 x2, TE-3 B-05, TC-12 | Lỗi test: 403 iframe Shop Pay. Grep xác nhận chỉ `TE-1`, `TE-4` có bộ lọc | TE-10-QA2: helper dùng chung trong `tests/e2e/support` |
| C | ES1-T45 TC-06, cartApi hết 3 lần | Giới hạn phía store, không chỉ do song song | TE-10-QA2: đưa TC-06 vào helper; xem Q2 về số test |
| D1 | TE-1 TC-02 | Đã tái lập bằng cách chép logic test: `base.css:497`, `:579` dùng `calc(var(--radius-card) + var(--space-1))`, đến từ bundle builder qua #101. Giá trị suy từ token, không phải hardcode | Sửa regex test cho phép `calc` trên `var`, không sửa CSS |
| D2 | ES1-T120 AC3 360 | Chưa rõ. Đọc CSS: dưới 64rem là 1 cột, media đứng trước panel, chưa thấy nguyên nhân. Đỏ cả 2 project | Trả ES1-T120 cho FE, chạy trên preview |
| D3 | ES1-T147 nojs AC1 | Chưa rõ. Test gọi thẳng `/cart/clear.js` (dòng 250) và đọc giỏ ngay sau `domcontentloaded`, nên có thể đỏ giả. Form dùng `name="id[]"` | QA2 kiểm trước. Nếu `id[]` lỗi thật: trả ES1-T147, và ES1-T148 đang dùng chung cách này |

Hồi quy thật nhiều nhất là D2, D3. Không ticket tính năng nào chạy trước khi qua cổng G0.

## 2. Bảng ticket theo thứ tự chạy

Ký hiệu: MỚI = CHƯA TẠO, chỉ là đề xuất. Point của QA, Writer, người: `-`. Cột blocked_by chỉ ghi khi đổi hoặc khi là ticket mới.

### Giai đoạn 0: quyết định và ổn định

| # | Key | Tên | Phía | Point | Ưu tiên | blocked_by đề xuất | Lý do |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | ES1-T167, T168, T169 | Chấm PO, BA, Tech Lead | CTO | - | urgent | | Không đóng thì các ticket sau không có căn cứ |
| 1 | MỚI TE-17-TL2 | Tạo ticket mới, cập nhật body ticket cũ theo AC-H và D1–D8 | Tech Lead | - | urgent | ES1-T169 | Ticket này cấm tạo ticket nên phải có bước riêng |
| 2 | MỚI TE-10-QA2 | Sửa nhóm A, B, C, D1; ES1-T147, T156 dùng cartApi; kiểm D3 | QA | - | urgent | | Bắt đầu dựng lại CI xanh; chỉ sửa `tests/`, không conflict |
| 3 | ES1-T120 | Sửa AC3 360 trên ticket đang review (D2) | FE | 3 có sẵn, +1 | urgent | | Lỗi thật khả dĩ ở block hàng 8, 13 |
| 4 | ES1-T163 | Chấm helper 429, kiểm DoD ES1-T96 từ 15/19 | QA | - | urgent | TE-10-QA2 | Skip do 429 làm cổng xanh giả |
| 5 | ES1-T147 | Chấm, hoặc trả sửa theo D3 | FE | 5 có sẵn | high | TE-10-QA2 | ES1-T148, T149 phụ thuộc |
| 6 | ES1-T119 | Chấm | FE | 3 có sẵn | high | | Code đã trên develop |
| 7 | ES1-T156 | Chấm; đọc kết quả render trùng partial (D4) | FE | 5 có sẵn | high | | ES1-T157, T158 phụ thuộc |
| 8 | ES1-T98 | Chấm | BE | 3 có sẵn | high | ES1-T163 | Cần cho ES1-T99, đường thêm giỏ từ trang chủ |
| 9 | ES1-T129 | Chấm, chỉ để không để lại hồi quy header | FE | 3 có sẵn | medium | | Hàng 1 dùng chung header |

Cổng G0: 2 run e2e liên tiếp xanh trên develop; báo số skip do 429 theo spec; bug P1, P2 mở = 0.

### Giai đoạn 1: cổng đo và dữ liệu

| # | Key | Tên | Phía | Point | Ưu tiên | blocked_by đề xuất | Lý do |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | MỚI TE-17-BA1 | Bảng nội dung theo node đang hiện trong Figma; sửa SRS: TE-15, 16, 17 và AC-H | BA | - | high | ES1-T168 | Đầu vào của mặc định, dữ liệu store, so copy |
| 11 | MỚI TE-17-DES1 | Ảnh nguyên liệu, SVG dấu 1:761, copy quiz bước 2, 3, mobile cho TE-15, 16, CR-3, màu New, sửa inventory | Designer | - | high | | Chặn TE-15, TE-16, CR-3 |
| 12 | MỚI TE-17-FE0 | `templates/index.figma.liquid` + `templates/index.liquid` + `ES1-T121.spec.ts`: template cổng 10 hàng đã có trong `index`, truyền tài nguyên qua param; bỏ multicolumn, custom liquid khỏi `index` (CR-5) | FE | 3 | high | G0 | Đơn vị đo của mọi PR sau, xem D2 |
| 13 | MỚI TE-17-QA2 | So ảnh, so copy, đo style theo block trên `?view=figma`; tạo baseline từ `docs/figma/img`; test so thứ tự block giữa 2 template; hiệu chuẩn trên hàng 1, 2 | QA | - | high | TE-17-FE0 | Hiện không có test so ảnh nào (grep 0) |
| 14 | MỚI TE-17-DEVOPS1 | lhci thêm `?view=figma`; bước đo JS sau cuộn tối đa 65 536 B; zip loại `templates/index.*` trừ `index.liquid` | DevOps | - | high | TE-17-FE0 | `theme-zip.sh:13` hiện đóng cả `index.te*`; AC-H30, H31, H34 |
| 15 | ES1-T134, T144, T153 + MỚI TE-17-OPS1 | Nhập dữ liệu Figma trên store dev theo bảng BA | CTO | - | high | TE-17-BA1 | Song song, không chặn PR code; chặn cổng cuối |

Cổng G1: CTO ký ngưỡng sau hiệu chuẩn; `?view=figma` chạy được; so ảnh đo được hàng 1, 2 kèm số thật.

### Giai đoạn 2: nội dung block đã có

Mỗi PR tự sửa test đang khẳng định trạng thái cũ, cùng commit với thay đổi mặc định. Vì vậy TE-17-QA1 của BA gộp vào đây, phần rà còn lại vào TE-17-QA2. Tách riêng thì giữa 2 PR develop sẽ đỏ.

| # | Key | Tên | Phía | Point | Ưu tiên | blocked_by đề xuất | Lý do |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | MỚI TE-17-FE1a | `blocks/faq-item`, `testimonial-item`, `testimonials` + `index` + `base.css` + locales: 5 câu FAQ, 2 ô stat có "360+", 4 review, cơ chế D1, CR-8; sửa `ES1-T118.spec:197-213`, `ES1-T119.spec:247-264` | FE | 6 | high | G1, TE-17-BA1 | Làm thử D1 trên block lặp; có yêu cầu bắt buộc của CTO |
| 17 | MỚI TE-17-FE1b | `slideshow-slide`, `rich-text`, `image-with-text` + `index` + locales: hàng 2, 4a, 8, 13, CR-7 chữ MAKE; sửa `ES1-T120.spec:240-272` | FE | 5 | high | TE-17-FE1a | Cùng cơ chế, 2 block lặp |
| 18 | MỚI TE-17-FE2 | `blocks/footer` + `base.css` + locales: logo, mô tả, ảnh newsletter, heading 2 màu, nút + icon, "No spam" | FE | 5 | high | TE-17-FE1b | Hàng 16 thiếu 5 phần (ES1-T168 1.3 #8) |
| 19 | ES1-T122 | TE-7-QA1, cập nhật theo chốt mới: so copy trên trang chủ | QA | - | high | thêm TE-17-FE1b | Đóng hàng 8, 12, 13, 15. Gộp spec dev để giảm số request |
| 20 | MỚI TE-17-FE1c | `quiz`, `quiz-step`, `bundle-builder`, `featured-product` + `index`: hàng 6, 9, 10, bậc 10%, 15% + ghi chú, dấu 1:761; sửa `ES1-T137:124-132`, `T147:133,179-186`, `T156:201-206` | FE | 6 | high | TE-17-FE2, TE-17-DES1 | ES1-T148, T149 kế thừa bậc giảm |

### Giai đoạn 3: block còn thiếu và JS

| # | Key | Tên | Phía | Point | Ưu tiên | blocked_by đề xuất | Lý do |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | MỚI TE-11-FE3 | `quiz-step`, `quiz` + `base.css` + `settings_schema` + `tokens.json`: body map bấm được, CR-9 token panel, Two questions | FE | 3 | high | TE-17-FE1c | Markup đi trước T139; token dùng cho hàng 6, 7, 9. Gộp TE-1-FE6 của BA |
| 22 | ES1-T139 | TE-11-BE1 + TE-11-BE2 của BA: `lazy-module.js`, `quiz-finder.js`, body map, trần 4352 B. Point 5 → 6 | BE | 6 | high | thêm TE-11-FE3 | Chặn T149, T158, TE-15-BE1, TE-3-BE3 |
| 23 | ES1-T140 | TE-11-QA1, thêm AC-H15, H16, H17 | QA | - | high | không đổi | Đóng hàng 6 |
| 24 | ES1-T99 | TE-5-QA1 | QA | - | high | không đổi | Đường mua cần drawer; phải xong trước T149 |
| 25 | MỚI TE-15-FE1 | `blocks/collection-list` + `collection-card` + `index`, `index.figma`: 5 card, cuộn ngang không JS, rỗng, mobile | FE | 4 | high | ES1-T139, TE-17-DES1 | Hàng 3, ngay dưới hero |
| 26 | MỚI TE-15-BE1 | `assets/scroll-buttons.js` + thẻ script: next/back qua lazy-module, trần 768 B | BE | 3 | high | TE-15-FE1, ES1-T139 | AC-H8 |
| 27 | MỚI TE-15-FE2 | `blocks/shop-by-level` + `level-card` + `index`, `index.figma`: 3 card, badge `products_count`, ghép band với 4a | FE | 3 | high | TE-15-BE1 | Hàng 4b |
| 28 | MỚI TE-15-QA1 | AC-H8, H9, H10 | QA | - | high | TE-15-FE2 | Đóng hàng 3, 4b |
| 29 | MỚI TE-3-FE4 | `blocks/featured-collection` + `base.css` + locales: 4 tab, 4 panel trong thẻ template, không JS là link (D6) | FE | 4 | high | TE-15-QA1 | Hàng 5 |
| 30 | MỚI TE-3-BE3 | `assets/collection-tabs.js`: đổi tab, bàn phím, tab rỗng, trần 1536 B, 0 fetch | BE | 3 | high | TE-3-FE4, ES1-T139 | AC-H11, H12 |
| 31 | MỚI TE-3-FE5 | `product-card` + `featured-collection` + `TE-3.spec`: rating, New, mặc định 4 sản phẩm, vùng bấm swatch 44 px (D7) | FE | 3 | high | TE-3-BE3, TE-17-DES1 | AC-H13, H14. Test TE-3 sửa cùng PR |
| 32 | ES1-T148 | TE-12-FE2 + TE-12-FE3 của BA: thêm dòng giảm, 4 hotspot, viền chọn (CR-6). Point 3 → 6 | FE | 6 | high | thêm TE-17-FE1c, TE-3-FE5 | Gộp vì cùng file; tránh 2 PR liên tiếp cùng block |
| 33 | ES1-T149 | TE-12-BE1 + TE-12-BE2 của BA: hotspot, viền, trần 5504 B. Point 5 → 6 | BE | 6 | high | thêm ES1-T99 | Hàng 7, 9 |
| 34 | ES1-T151 | TE-12-QA1, thêm AC-H18, H19, H20 | QA | - | high | không đổi | Đóng hàng 7, 9. Bỏ khẳng định "trang chủ không có % giảm" |
| 35 | ES1-T157 | TE-13-FE2: 3 ô số liệu để trống mặc định; tách `index.te13` và `index.te13-states` (D4) | FE | 5 | high | thêm ES1-T149 | Hàng 11 |
| 36 | ES1-T158 | TE-13-BE1: thêm xử lý trùng partial D4, trần featured-product 2304 B. Point 5 → 6 | BE | 6 | high | không đổi | Hàng 10, 11. Countdown |
| 37 | ES1-T159 | TE-13-QA1, thêm AC-H21, H22, H23 | QA | - | high | không đổi | Đóng hàng 10, 11 |
| 38 | MỚI TE-16-FE1 | `blocks/blog-posts` + `article-card` + `index`, `index.figma`: 5 card, thời gian đọc (D8), rỗng | FE | 4 | high | ES1-T159, TE-17-DES1 | Hàng 14, hàng cuối chưa có |
| 39 | MỚI TE-16-QA1 | AC-H26, H27 | QA | - | high | TE-16-FE1 | Đóng hàng 14 |

### Giai đoạn 4: nghiệm thu trang chủ

| # | Key | Tên | Phía | Point | Ưu tiên | blocked_by đề xuất | Lý do |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 40 | ES1-T150 + MỚI TE-10-DOC1 | Tài liệu merchant: thay nội dung mẫu, discount thật, tag quiz, Verified | Writer | - | medium | ES1-T149 | Bắt buộc trước khi giao merchant, không chặn cổng trang |
| 41 | TE-14 Theme map, `AGENTS.md:258` | Sửa AGENTS.md: 32+ block, ngoại lệ empty state (D1) | Người | - | medium | TE-16-FE1 | scope-guard chặn mọi agent ghi AGENTS.md |
| 42 | MỚI TE-17-OPS2 | Publish theme develop trên store dev, chọn sản phẩm, ảnh trong editor | CTO | - | high | TE-16-QA1, TE-17-OPS1 | Agent không được publish, không ghi admin |
| 43 | MỚI TE-17-QA3 | Chạy trọn cổng trên `/`: so ảnh, copy, 360, 768, Lighthouse, JS, đường mua | QA | - | high | TE-17-OPS2 | AC-H1 đến H7, H30–H32, H35 |
| 44 | MỚI TE-17-DES2 | `ui_diff` 16 hàng, sổ chênh lệch; CTO ký cuối | Designer | - | high | TE-17-QA3 | Cổng G3 |

### Không phục vụ trang chủ: để cuối, không làm trong đợt này

| Key | Tên | Phía | Point | Ưu tiên | Lý do |
| --- | --- | --- | --- | --- | --- |
| ES1-T110, T111, T112 | TE-6 BE1, BE2, QA1 | BE, QA | 5, 3, - | low | Trang collection vẫn chạy bằng form không JS |
| ES1-T128, T130, T131 | TE-8 FE1, BE1, QA1 | FE, BE, QA | 5, 5, - | low | Figma trang chủ chỉ có icon search. Ngân sách JS đã giữ chỗ T130 (D5) |
| ES1-T105, T125 | [Q] dữ liệu collection, search | CTO | - | low | Theo sau TE-6, TE-8 |
| TE-9 AC2, AC3, AC5, AC6; TE-10 AC3–AC6 | Trang phụ, Canvas | - | - | low | Bắt buộc cho G5, chưa tách task |

## 3. Quyết định kỹ thuật

D1. Mặc định theo Figma mà merchant vẫn sửa được (đáp ES1-T168 1.3 #9, gộp TE-17-TL1).
- Block 1 lần trên trang (rich-text, featured-collection, quiz, bundle-builder, featured-product): đổi `default` trong schema. Không phụ thuộc điều chưa rõ.
- Block lặp (faq-item, testimonial-item, quiz-step, image-with-text, slideshow-slide, video-card): schema bỏ `default` ở setting chữ. Template gán `{% assign %}` từ `| t`, truyền param tên `default_<id>`, block đọc `block.settings.<id> | default: default_<id>`.
- Vì sao: `default_collection` tại `featured-collection.liquid:36` đã dùng đúng mẫu này. Param khác tên setting chỉ là biến (`AGENTS.md:105`), nên merchant luôn thắng, không cần biết kết quả ES1-T117 #4. Mọi chuỗi vẫn qua locale; khoá chứa HTML có đuôi `_html`.
- Nhược điểm 1: merchant xoá chữ thì trang quay về nội dung mẫu, không ẩn được mục đó. Xử lý: mục lặp có 1 checkbox `show_item`, mặc định bật, kèm dòng info.
- Nhược điểm 2: `range` luôn có giá trị. `testimonial-item.rating` đổi sang `number`, chặn 0–5 trong Liquid, để card 2 có 4 sao.
- Nếu CTO thử được merchant thắng param trùng tên (Q1): bỏ `default_*`, `show_item`, block không đổi, FE1a, FE1b giảm khoảng 2 point.
- Block cần tài nguyên, dùng mặc định Q1 của ES1-T168: bundle lấy collection `all`, quiz hiện đủ và kết quả rỗng khi chưa có tag, featured product và shop the look ẩn tới khi chọn sản phẩm. Quiz, bundle khác dòng empty state `AGENTS.md:258`: cần CTO ghi ngoại lệ vì agent không ghi được file này.

D2. Cổng PR dùng `templates/index.figma.liquid`, nghiệm thu dùng `/` (CTO đã chọn phương án C).
- Cùng thứ tự block với `index.liquid`; 1 test tĩnh so 2 danh sách để không lệch dần. Test này thay cho việc tin vào kỷ luật.
- Tài nguyên truyền param theo handle `figma-*`, thiếu thì rơi về `collections.all`. Sản phẩm Figma nằm ở collection riêng, không đổi `store-data.json`.
- Ảnh: đề xuất tải vào Files, template đọc qua object `images[...]`. KHÔNG CHẮC object này còn đúng, cần CTO tra (Q3). Mặc định khi chưa có: che vùng ảnh khi so trên `?view=figma`, so đủ ảnh trên `/`.
- Loại template này và `index.te*` khỏi zip giao (TE-17-DEVOPS1). Xoá `index.te*` sau khi cổng cuối đóng.

D3. Cách đo "giống 100%".
- Ảnh tham chiếu rộng 3840 nên chụp 1920 với `deviceScaleFactor: 2`.
- Đã đo alpha: 1-560, 1-817, 1-1022, 1-490, 1-362 có 53–85% pixel trong suốt; 1-453, 1-422 thì 0%. BA nghi đúng. Baseline phải ghép với màu nền band rồi mới so, do script `scripts/` tạo.
- Không có `1-454.png`, `1-464.png`: cắt từ `1-453.png`.
- So qua `toMatchSnapshot` của Playwright, không thêm dependency. Chỉ chạy Chromium.
- Chỉ so node không có `visible:false` ở bản thân và cha. Ảnh export thắng snapshot khi lệch (ES1-T168 1.3 #2, #3).
- Vai trò: QA test tự động trong CI, Designer `ui_diff` và sổ chênh lệch, CTO ký. Skill `ui-diff` dùng `mcp__store-dev__screenshot`: Designer xác nhận công cụ này chạy được ở TE-17-DES1.
- Hiệu chuẩn ở G1, chỉ CTO nới được ngưỡng. Thêm E10, E11, mở rộng E7 theo mặc định Q6 của ES1-T168.

D4. Đáp ES1-T161: trùng tên partial.
- Docs không nói gì (CTO đã tra). Kết quả CI 11:33 không nêu ES1-T156 lỗi render, nhưng nhiều test của spec này skip nên chưa kết luận được.
- ES1-T157 tách `index.te13` (1 block nhiều variant) và `index.te13-states` (ca countdown, hết hàng).
- ES1-T158: nếu trang có hơn 1 `featured-product`, picker bỏ `partials.apply`; `featured-product.js` nghe `theme:variant:change`, cập nhật giá và nút từ JSON variant trong block. Trang có 1 block giữ partial như spec.

D5. Đáp ES1-T165: phương án A, tối đa 2 PR ở trạng thái CI, không thêm phụ thuộc. Lý do: B thêm token và phụ thuộc, C chưa xác minh được. Kế hoạch này vốn chỉ cần 2 luồng.

D6. Ngân sách JS trang chủ (wc -c hiện tại, trần với file chưa có). Tabs không fetch: 4 panel nằm trong thẻ template, clone khi bấm. Không phát sinh request store, không có 429, ảnh tab ẩn không tải.

| Nhóm | File | B |
| --- | --- | --- |
| Tải sẵn | standard-events 888, header-menu 6 862, header-sticky 1 680, slideshow 8 057, cart-drawer 3 868, product-swatch 5 010 | 26 365 |
| Tải sẵn mới | lazy-module 384, search-loader 256 | 640 |
| Tổng tải sẵn | Trần 40 960 B, còn 13 955 B | 27 005 |
| Sau cuộn | quiz-finder 4 352, bundle-form 5 504, featured-product 2 304, video-carousel 2 560, product-form 6 857, picker 7 168, collection-tabs 1 536, scroll-buttons 768 | 31 049 |
| Mở search | predictive-search (TE-8, chưa làm) | 6 656 |
| Tổng | Trần 65 536 B, còn 826 B | 64 710 |

Trần ADR 0006 đo `transferSize` nên số thực thấp hơn nhiều; wc -c là cách tính thận trọng cho DoD. Mở drawer thêm cart-items 5 625 B, ngoài phép đo của ADR. Tôi cũng nhận thấy `critical.css` đang 9 921 B, sát trần 10 KB của ADR 0003: FE không thêm vào file này.

D7. TE-3 AC6 (24 px) và `AGENTS.md:298` (44 px): AGENTS.md là nguồn cao hơn. Vùng bấm swatch 44 px bằng pseudo-element, hình swatch giữ nguyên; `TE-3.spec.ts:918` đổi theo. Mặc định `products_to_show` đổi thành 4 trong schema; `TE-3.spec.ts:426,769` đổi theo.

D8. Thời gian đọc hàng 14: tính trong Liquid từ số từ của bài, 200 từ/phút, qua `| t`. Không thêm setting, không cần metafield. Không ra đúng số Figma thì che số khi so, ghi ngoại lệ.

Đề xuất ADR: 0007 cho D1, D2 sau khi CTO duyệt, vì đây là quy ước cho mọi block sau này. Ticket này không viết ADR.

## 4. Ước lượng theo block

Giả định: Figma desktop đã có; mobile theo mặc định Designer; đã có D1–D8; không tính lượt sửa sau CI. Ticket nhiều hàng được chia point theo phần việc.

| Hàng | Block | Ticket | Point còn |
| --- | --- | --- | --- |
| 1 | Header | Chỉ rà, chưa thấy việc | 0 |
| 2 | Slideshow | TE-17-FE1b | 2 |
| 3 | Collection list | TE-15-FE1, BE1 | 7 |
| 4a | Rich text | TE-17-FE1b, copy đã khớp | 0 |
| 4b | Shop by level | TE-15-FE2 | 3 |
| 5 | Featured collection | TE-3-FE4, BE3, FE5 | 10 |
| 6 | Quiz | TE-17-FE1c 2, TE-11-FE3 3, T139 6 | 11 |
| 7 | Shop the look | T148 6, T149 3 | 9 |
| 8 | Inspiration | TE-17-FE1b | 2 |
| 9 | Bundle builder | TE-17-FE1c 2, T149 3 | 5 |
| 10 | Featured product | TE-17-FE1c 2, T158 4 | 6 |
| 11 | Video carousel | T157 5, T158 2 | 7 |
| 12 | Testimonials | TE-17-FE1a | 3 |
| 13 | Why choose | TE-17-FE1b | 1 |
| 14 | Blog posts | TE-16-FE1 | 4 |
| 15 | FAQ + stats | TE-17-FE1a | 3 |
| 16 | Footer | TE-17-FE2 | 5 |
| Chung | Template cổng, CR-5 | TE-17-FE0 | 3 |
| | Tổng | | 81 |

Đường găng: TE-10-QA2 → G0 → TE-17-BA1 → TE-17-FE0 → TE-17-QA2 → G1 → FE1a → FE1b → FE2 → FE1c → TE-11-FE3 → T139 → TE-15 → TE-3 → T148 → T149 → T157 → T158 → TE-16 → TE-17-OPS2 → TE-17-QA3 → TE-17-DES2.
Mọi PR FE đều nằm trên đường găng vì chạy tuần tự để tránh conflict. Song song được: QA chỉ sửa `tests/`, DevOps, BA, Designer, dữ liệu store.

## 5. Đề xuất sprint

Tên: Sprint 1, phần còn lại 06–15/11. Phần tràn sang Sprint 2 từ 16/11.
Mục tiêu: `/` trên store dev giống Figma theo tiêu chí ES1-T167 mục 2, mọi chức năng chạy và có test, CI xanh trên develop.
Phạm vi: giai đoạn 0–4. Ngoài phạm vi: bảng "Không phục vụ trang chủ".

Năng lực thực tế:
- Hạn mức tuần: 66% lúc 11:32 ngày 06/11, reset 10/11 06:00, overage tắt. Log có 0 lần `limit_hit`. Đọc `_plan_usage.json`: không có số, báo lỗi.
- Tốc độ dùng: mỗi lượt agent ghi nhận 0,4–1,0% tuần, tuỳ đoạn đo, đã gồm cả phiên ngoài log. Lấy 0,7%.
- Tới 10/11 dùng được tới 90%, tức 24% còn lại, khoảng 34 lượt. Tuần sau khoảng 110 lượt, đủ.
- Nhu cầu: khoảng 36 ticket × 1,5 lượt = 54 lượt, khoảng 38% tuần. Hạn mức đủ nếu giữ thứ tự, không chạy song song thừa.
- Một lượt dev mất 6–10 phút, 2–4 USD, nên agent không phải nút thắt.
- Merge lên develop theo ngày, 02–06/11: 12, 15, 11, 3, 12 commit first-parent. Ngày 06/11 có #101 gộp 8 PR bằng `--admin` và kết quả là e2e đỏ. Các số này có từ trước khi có khoá 1 PR dùng store, nên không dùng được làm năng lực từ nay.
- Giả định cần CTO xác nhận: 1 lượt store-tests khoảng 45 phút, được 3–4 PR/ngày, CTO duyệt cả cuối tuần.

Tổng so với năng lực: 81 point dev, 30 PR. 4 PR/ngày xong 14/11, còn 1 ngày đệm. 3 PR/ngày xong 16/11. Không có ticket trang chủ nào để cắt, vì cắt là không đạt 100%: nếu trễ thì nới ngày, không bỏ phạm vi. Chỉ giảm được bằng Q2 hoặc Q1.

Luật chạy:
- Tối đa 2 PR trong CI: 1 PR có sửa `base.css`, `locales`, `templates/index*`, cộng 1 PR chỉ sửa `tests/` hoặc `.github`, `scripts`.
- PR tiếp theo chỉ mở sau khi PR trước đã merge, rồi rebase từ develop. Làm vậy thì không có conflict dây chuyền.
- Thứ tự merge theo cột # ở mục 2. Không gộp nhiều PR một lần, không dùng `--admin` khi check đỏ, vì đó là cách develop vừa đỏ.
- PR mới có block mới phải thêm block vào cả `index.liquid` và `index.figma.liquid`.

Cổng dừng:
- G0: mục 2. Chưa qua thì không chạy ticket tính năng.
- G1: mục 2. Chưa qua thì không merge thay đổi mặc định, vì chưa đo được.
- Mỗi block: so ảnh đạt ngưỡng, theme check 0, e2e xanh, lighthouse đạt, wc -c trong trần, 0 test skip do 429 ở spec của block.
- Dừng toàn bộ khi: develop đỏ sau merge (revert hoặc sửa trước khi mở PR mới); hạn mức từ 90% trước 10/11 (chỉ giữ ticket urgent); vượt trần JS 65 536 B.
- G3: TE-17-QA3 và sổ chênh lệch 0 mục mở, CTO ký.

Rủi ro:

| Rủi ro | Ảnh hưởng | Giảm thiểu | Ai |
| --- | --- | --- | --- |
| 429 do store, không phải do song song; số test tăng thêm | Skip, cổng xanh giả hoặc đỏ ngẫu nhiên | Q2; QA gộp spec dev khi viết spec story | QA, DevOps |
| 1% không đạt do chữ Chromium vẽ khác Figma | So ảnh đỏ hết | Hiệu chuẩn ở G1 trước khi FE làm hàng loạt | QA, CTO |
| Trang đủ 16 block, nhiều ảnh, tụt Lighthouse | Không đạt 96/90/98. Hiện CI chỉ đo `/` khi 3 block không render | TE-17-DEVOPS1 đo sớm trên `?view=figma`; lazy ngoài LCP; `base.css` đang 124 KB, 21 KB gzip, cần theo dõi | DevOps, FE |
| Live theme store dev sai (nghi `ai-feature-ai-ES1-T147`) | Nghiệm thu `/` đo nhầm theme; preview-push của nhánh trùng tên bị chặn | CTO kiểm ngay, xem mục 7 | CTO |
| Dữ liệu store đến muộn | Cổng cuối không đóng | Bắt đầu song song từ giai đoạn 1; code không chờ | CTO |
| Sản phẩm Figma lẫn dữ liệu test ở `/collections/all` | Test đang đọc `all` đổi kết quả | Không đổi handle test; QA kiểm spec dùng `all` trước khi CTO nhập | QA, CTO |
| Nội dung mẫu tới khách thật: review, freeship $99 | Sai sự thật nếu merchant không thay | TE-10-DOC1, dòng info; CTO đã chấp nhận hệ quả | Writer |
| Mẫu `default_*` khiến field trong editor trống dù trang có chữ | Merchant bối rối | Dòng info "để trống sẽ dùng nội dung mẫu" | FE |

## 6. Ticket mới, chưa tạo

13 ticket dev (tên và point ở mục 2): TE-17-FE0, FE1a, FE1b, FE1c, FE2, TE-3-FE4, BE3, FE5, TE-15-FE1, FE2, BE1, TE-16-FE1, TE-11-FE3.
Không có point: TE-17-TL2, BA1, DES1, QA2, QA3, DES2, DEVOPS1, OPS1, OPS2, TE-10-QA2, TE-15-QA1, TE-16-QA1, TE-10-DOC1.

Khác danh sách BA: TE-17-TL1 giải quyết tại D1. TE-17-QA1 gộp vào PR FE và QA2. TE-7-FE5 gộp FE1a, FE1b. TE-13-FE3 gộp FE1c. TE-1-FE6 gộp TE-11-FE3. TE-12-FE3, BE2 gộp T148, T149. TE-11-BE2 gộp T139. Lý do: cùng file, dưới 3 point.

Body ticket cũ phải cập nhật ở TE-17-TL2:
- ES1-T148, T157, T147 test, T156 test: bỏ khẳng định "trang chủ chưa cấu hình không có block" nếu trái D1.
- ES1-T157: bỏ "3 ô số liệu đúng text" ở trang chủ, giữ trên template test.
- ES1-T122, T140, T151, T159: thêm AC-H tương ứng; bỏ "Không so copy Figma trên trang chủ", "trang chủ không có % giảm".
- ES1-T139, T149, T158: trần mới theo D6.

## 7. Việc cần người

CTO:
1. Chấm ES1-T167, T168, T169; duyệt thứ tự này.
2. Kiểm và publish lại live theme store dev: agent không được làm. Làm ngay vì ảnh hưởng preview-push; bản đo cuối là TE-17-OPS2.
3. Nhập dữ liệu store dev theo bảng BA: 24 sản phẩm, 12 collection cho hàng 3, 4b, 5, tag quiz, metafield, discount 10%, 15%, 5 bài blog, menu, tên shop "Efitco", ảnh, video. Gộp ES1-T134, T144, T153. Nếu muốn Claude Code làm thì xác nhận ghi store.
4. Duyệt, merge từng PR; ký ngưỡng G1 và sổ chênh lệch G3.
5. Sửa `AGENTS.md`: Theme map, dòng 258. Agent bị scope-guard chặn.
6. Trả lời 4 câu dưới đây.

Designer: TE-17-DES1, TE-17-DES2. Nguyên liệu ảnh xuất tay vì hạn mức Figma API 20 request/tháng.

Câu hỏi cho CTO. Không tạo [Q], không câu nào chặn:
- Q1. Thử 2 phút trong editor: đặt setting trong block có param trùng tên, ví dụ `image` ở `index.te7`, xem giá trị merchant hay param thắng? Mặc định: chưa cần biết, dùng `default_*` theo D1.
- Q2. Trên PR chỉ chạy spec của ticket + `smoke` + `TE-1`, chạy đủ 724+ test trên develop sau merge? Giảm 429 và thời gian chờ, nhưng lỗi hồi quy có thể tới develop rồi mới lộ. Mặc định: giữ chạy đủ như hiện tại vì đây là nới cổng, chỉ CTO quyết. Hệ quả: dễ trễ tới 16/11.
- Q3. Tra giúp `images` global trên shopify.dev: còn dùng được không, truyền vào `image_url` được không? Mặc định: che vùng ảnh trên `?view=figma`, so ảnh đủ trên `/`.
- Q4. Xác nhận thời gian 1 lượt store-tests và có duyệt cuối tuần không? Mặc định: 45 phút, có.

Các câu Q1–Q6 của ES1-T168: kế hoạch dùng mặc định BA đã ghi. CTO đổi câu nào thì cập nhật bảng.

## 8. Tự kiểm tra

- Đọc đủ: ticket + 7 comment, đầu ra ES1-T167, T168 (dán trong ticket), AGENTS.md phần liên quan, ADR 0003, 0006, `index.liquid`, `theme-zip.sh`, `store-tests.yml`, ảnh Figma, 34 ticket đang mở (tên qua danh sách; body đầy đủ 13 ticket: T99, T122, T139, T140, T148, T149, T151, T157, T158, T159, T161, T163, T165).
- Mọi ticket trong danh sách Open có dòng trong kế hoạch, trừ ES1-T161, T165 (đáp tại D4, D5) và ES1-T169.
- Cộng lại: FE 57 + BE 24 = 81; bảng block = 81; 3 + 22 + 56 theo giai đoạn = 81.
- Task mới 3–6 point, không task dưới 3, không quá 8. Mỗi task 1 phía. Giá trị ưu tiên đúng tập của hệ thống.
- 0 sửa ngoài `drafts/techlead/ES1-T169/`; 0 ticket tạo; 0 ticket khác bị đổi; không chạy theme check, playwright, lhci vì không có code đổi. TC-02 tái lập bằng script tạm đã xoá.
- Đọc `_runs.jsonl`, `_plan_usage.json`, `project.json` ở `../ai-team/` bằng Bash, theo ticket cho phép "nếu có quyền". Về sau công cụ Read báo chưa được cấp quyền đường dẫn đó nên tôi dừng, không đọc thêm: dòng sprints chưa đọc, ngày lấy theo ticket.
