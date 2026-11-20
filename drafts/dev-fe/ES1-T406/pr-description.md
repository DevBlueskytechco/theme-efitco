KHÔNG CHẮC: (1) Slide giữ heading, subheading, nhãn nút mẫu trung tính ("Level Up Your Fitness", "Explore Equipment") để trang chủ cài mới vẫn có h1 và ES1-T30 (≥ 2 slide) không đỏ; chỉ bỏ eyebrow có claim. Subheading còn chữ "Efitco", why heading còn "efitco", bundle heading "Save As You Go", note shop-the-look "Fits: 2.4×2.0 m", rating rỗng → 5 sao: ngoài danh sách ticket, đã hỏi ES1-T522. (2) Spec cũ trên `/` khẳng định copy mẫu (ES1-T118 AC5, ES1-T119 AC5, ES1-T179 HOME, ES1-T180 HOME) sẽ đỏ khi store chưa áp fixture, đúng theo DoD "testimonials không in card mẫu"; đã tạo ES1-T521 cho QA.

# ES1-T406 TS-FE4: tier default 0, bỏ claim/số liệu/review mẫu làm default, sửa chính tả N13

Kế hoạch: drafts/techlead/ES1-T304/task-split.md §3 (TS-FE4), ADR 0011 mục 3, ES1-T308 #1. Audit C3, N1, N2, N13. Theme Store mục 8, 14, 20/3e.

## Thay đổi
- `blocks/bundle-builder.liquid`, `blocks/shop-the-look.liquid`: mọi `tier_*_percent` `"default": 0` (trước 10/15 và 10). Không tier > 0 thì không `data-tiers`, không dòng discount, tổng = tạm tính; info tier giữ nguyên. Cập nhật `{% doc %}`.
- `locales/en.default.json`:
  - Xoá `blocks.slideshow_slide.default_eyebrow` ("Trusted by 10,000+ athletes").
  - Xoá `blocks.faq.default_*` (eyebrow, heading "Proud To Be The Best", stat "360+" / "Warranty" "12").
  - Xoá `blocks.faq_item.*` (5 câu hỏi, 5 câu trả lời có "$99", "12-month warranty", "90 days", số liệu sản phẩm).
  - Xoá `blocks.testimonial_item.*` (4 tên người, tiêu đề, quote).
  - N13: `why_eyebrow` "We aRE about" → "We are about"; `why_text_html` bỏ 4 `&nbsp;` và khoảng trắng đôi. "do i" nằm trong q3 đã xoá khỏi locale.
- `templates/index.liquid`: không còn truyền `default_*` lấy từ locale cho eyebrow slide, FAQ (eyebrow, heading, stat, câu hỏi, trả lời), 4 testimonial-item (tên, sao, tiêu đề, quote). Cấu trúc block, id, background giữ nguyên (blockTree ES1-T176 khớp index.figma).
- `blocks/slideshow-slide.liquid`, `faq.liquid`, `faq-item.liquid`, `testimonials.liquid`, `testimonial-item.liquid`: cập nhật `{% doc %}` (param default_* chỉ cho template test; index.liquid không truyền), ví dụ không còn dùng key đã xoá; info eyebrow slide, eyebrow/heading FAQ → `t:info.empty_hides`.
- `locales/en.default.schema.json`: thêm `info.empty_hides` ("Leave empty to hide."); bỏ "Empty fields use the sample content" ở `faq_show_item`, `faq_show_stat`, `slide_show_item`, `testimonial_show_item`; `testimonial_rating` mô tả đúng hành vi hiện tại.
- `templates/index.figma.liquid` (template gate, loại khỏi gói release theo ADR 0011 mục 6): copy Figma của các key đã xoá thành chuỗi literal (giống cách index.te7/te11 đang làm), giữ đúng chữ Figma ("We aRE about", "do i") để gate ES1-T176 không đổi. Bật tier bằng param trùng tên setting: bundle 2:10, 3:15; setup 4:10.
- `templates/index.te12.liquid`: `te12-shop-the-look` truyền `tier_1_quantity: 4, tier_1_percent: 10` (trước dựa default schema) để ES1-T148/ES1-T149 giữ nguyên.

## Hành vi
- Store chưa cấu hình: slide không eyebrow; band FAQ và testimonials không render (item rỗng → container ẩn); bundle builder / shop the look không dòng discount, không progress, tổng = tạm tính. Trong editor: placeholder hướng dẫn như cũ (faq-item-placeholder, testimonial-placeholder).
- Store dev có fixture ES1-T331: giá trị lấy từ setting, không phụ thuộc locale đã xoá.
- /?view=figma: copy và tier như trước.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 9 warning `UnrecognizedBlockArguments`/`UndefinedObject` có sẵn trên develop (quiz-step, index.figma default_verified/default_countdown_end, index.te12 discount_note), không thêm mới.
- `grep -nE "10,000|360\+|Warranty|Money Back|\$99|90 [Dd]ay|aRE|&nbsp;" locales/en.default.json` = 0 (thêm `15%` theo ADR 0011: cũng 0).
- 6 `tier_*_percent` trong 2 schema: `"default": 0`.
- Không còn tham chiếu tới key đã xoá trong blocks/snippets/templates/layout/tests.
- Không file JS trong diff; không CSS mới.
- Playwright `smoke.spec.ts`, `ES1-T176.spec.ts`, Lighthouse (≥ 96/90/98), ảnh 3 breakpoint: chờ CI sau khi Orchestrator push.
- Spec dự kiến đỏ khi store chưa áp fixture (kỳ vọng cũ trái ADR 0011): ES1-T118 "AC5 trang chủ: 4 review Figma", ES1-T119 "AC5 trang chủ: 5 câu Figma", ES1-T179 test HOME, ES1-T180 `expectSlides`/WHY eyebrow trên HOME → ES1-T521 (QA).

## Ticket liên quan
- ES1-T521 (QA): cập nhật spec cũ trên `/`.
- ES1-T522 (question Tech Lead): default còn mang thương hiệu/claim ngoài phạm vi.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
