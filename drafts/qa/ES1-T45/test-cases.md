KHÔNG CHẮC: (1) ticket xin 2 file tests/e2e/rich-text.spec.ts + rtl.spec.ts, Orchestrator yêu cầu tên theo key → gộp 1 file tests/e2e/ES1-T45.spec.ts, 2 describe "rich-text" và "RTL"; Orchestrator đổi tên/tách nếu cần, nội dung không phụ thuộc tên file. (2) Chưa chạy được: sandbox không có node_modules (npm bị chặn), không có PREVIEW_URL → kết quả chờ CI e2e trên PR. (3) TC-04 tự skip nếu merchant chưa chọn inline_image trên store dev (static block, không có ảnh mặc định); R-04/R-05 skip nếu store chỉ 1 nước + 1 ngôn ngữ.

# ES1-T45 — E2E rich-text (ES1-T44) + RTL logical properties (ES1-T37)
Nguồn: ticket ES1-T45 (2727475000000144006), docs/srs.md#TE-2 AC5, docs/srs.md#TE-14 AC4, docs/adr/0005-nen-sand-anh-inline-cta-link-rich-text.md, drafts/dev-fe/ES1-T44/pr-description.md, drafts/dev-fe/ES1-T37/pr-description.md + ES1-T37.spec.ts (bản tham khảo), Figma node 1:453 / 1:454 / 1:455 / 1:462.
AC đánh số theo drafts/qa/ES1-T45/story.md (tách từ body ticket). Spec: tests/e2e/ES1-T45.spec.ts. Project Playwright: desktop (Desktop Chrome) + mobile (Pixel 7, 412px).

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | Trang chủ, templates/index.liquid có container id home-intro background sand | Mở / | container-home-intro có class block-container--sand, background-color rgb(235, 230, 224), color rgb(26, 26, 26) | E2E | P2 |
| TC-13 | AC1 | Như TC-01 | Chạy axe giới hạn trong container-home-intro | 0 vi phạm color-contrast, 0 serious/critical | a11y | P2 |
| TC-15 | AC1 | Trình duyệt tắt JS | Mở / | Nền sand và heading vẫn render (block không phụ thuộc JS) | E2E | P3 |
| TC-02 | AC2 | Setting mặc định heading "Everything You Need" + heading_after_image "to Train." | Mở / | textContent heading chuẩn hoá khoảng trắng = "Everything You Need to Train."; thẻ H1 hoặc H2 | E2E | P2 |
| TC-03 | AC2 | Như TC-02, có hoặc không ảnh inline | Đọc tên truy cập heading (screen reader) | Accessible name = "Everything You Need to Train.", ảnh không chen chữ | a11y | P2 |
| TC-04 | AC3 | Merchant đã chọn inline_image | Mở / | img trong [data-testid=rich-text-inline-image] nằm trong heading, alt="", loading=lazy, wrapper SPAN, cao ≈ 0.94em cỡ chữ heading (±2px); chưa chọn ảnh → skip có ghi lý do | E2E | P3 |
| TC-05 | AC4 | button_label có giá trị | Mở / | rich-text-button hiển thị, class button--link, cao ≥ 44px; svg.slideshow-icon--arrow aria-hidden="true" focusable="false"; tên truy cập = nhãn | E2E/a11y | P2 |
| TC-06 | AC4 | button_url trống hoặc có giá trị | Đọc href rồi GET | href khác rỗng (mặc định routes.all_products_collection_url), đích trả < 400 | E2E | P2 |
| TC-07 | AC4 | Desktop, focus ở đầu trang | Nhấn Tab liên tiếp (tối đa 120) | Tới được rich-text-button; :focus-visible đúng, outline khác none, dày ≥ 2px | a11y | P2 |
| TC-14 | AC4 | Desktop | Hover CTA; sau đó bật prefers-reduced-motion: reduce và hover lại | Icon translate X > 0; reduced-motion → translate none | E2E | P4 |
| TC-08 | AC5 | Desktop viewport 1024 / 1280 / 1920 | Mở / | grid .rich-text có 2 track; heading scrollWidth ≤ clientWidth; mép phải heading ≤ mép trái cột nội dung | E2E | P2 |
| TC-09 | AC6 | Desktop viewport 360 / 768 / 1023 (dưới 64rem) | Mở / | grid 1 track; .rich-text__content nằm dưới heading, cùng mép trái; .rich-text và heading không tràn ngang | E2E | P2 |
| TC-10 | AC6 | Project mobile Pixel 7 (412px) | Mở / | 1 track, heading không tràn, CTA ≥ 44px | E2E | P2 |
| R-02 | AC7 | Trang chủ có icon previous/next (slideshow) và arrow (CTA rich-text) | page.evaluate đặt document.documentElement.dir='rtl' | body direction rtl; .slideshow-icon--previous/--next/--arrow scale "-1 1"; pause/play "none" | E2E | P3 |
| R-06 | AC7 | RTL | Đo CTA | Mép phải icon mũi tên ≤ mép trái nhãn (mũi tên bên trái) | E2E | P3 |
| R-08 | AC7 | Desktop, RTL | Hover CTA; rồi reduced-motion | translate X < 0 (dịch ngược chiều); reduced-motion → none | E2E | P4 |
| R-04 | AC8 | Desktop 1280, footer có localization | Mở panel (summary), đo theo offsetParent; đặt dir=rtl, đo lại | LTR mép phải panel = mép phải neo (0px); RTL mép trái = mép trái neo (0px); panel trong viewport cả 2 chiều | E2E | P3 |
| R-05 | AC8 | Mobile (dưới 48rem), footer có localization | Như R-04 | LTR mép trái = 0; RTL mép phải = 0 (inline-start) | E2E | P3 |
| R-07 | AC8 | Desktop 1280 | dir=rtl | Heading sang cột phải (mép trái heading ≥ mép phải nội dung), heading không tràn | E2E | P3 |
| R-09 | AC8 | Mọi .block-container trên trang chủ | Đọc style --text-align và computed text-align | --text-align ∈ start/center/end; text-align không phải left/right | E2E | P3 |
| R-01 | AC9 | Trang chủ không đặt dir | Mở / | body direction ltr; mọi .slideshow-icon--* có scale none | E2E | P3 |
| R-03 | AC9 | dir=rtl | Đặt lại dir=ltr | 3 icon chỉ hướng về scale none | E2E | P3 |
| R-00 | AC10 | Preview chưa có rule :dir(rtl) trong stylesheet theme | Mọi test R-xx (helper openRtlReady tải các link stylesheet /assets/ và tìm ":dir(rtl)") | test.skip kèm lý do "ES1-T37 chưa vào bản này"; có rule → chạy | E2E | P3 |
| TC-11 | AC11 | Desktop 1920 | Đọc --rich-text-max-width và bề rộng .rich-text | max ≥ 480 (min range); bề rộng ≤ max | E2E | P3 |
| TC-12 | AC11 | Body có giá trị | Mở / | rich-text-body hiển thị, text khác rỗng; trống → skip | E2E | P3 |
| TC-02b | AC11 | heading_level h1 hoặc h2 | Mở / | tagName ∈ H1/H2 (gộp trong TC-02) | E2E | P3 |

## Case biên (ngoài AC)
| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| M-01 | AC11 | Editor (design_mode), xoá heading, heading_after_image, ảnh, body, button_label | Xem preview editor | Placeholder "blocks.rich_text.placeholder" (p.rich-text--placeholder) | Thủ công | P3 |
| M-02 | AC11 | Như M-01 nhưng storefront | Mở / | Không có [data-testid=rich-text] trong container-home-intro | Thủ công | P3 |
| M-03 | AC2 | Xoá heading, giữ heading_after_image | Mở / | Heading chỉ còn "to Train.", không thừa dấu cách đầu | Thủ công | P4 |
| M-04 | AC2 | Có ảnh, xoá heading_after_image | Mở / | Heading = "Everything You Need" + ảnh, ảnh vẫn alt="" | Thủ công | P4 |
| M-05 | AC11 | max_width = 1416 (tối đa) và 480 (tối thiểu), viewport 1920 | Mở / | Bề rộng .rich-text = setting (hoặc bề rộng page nếu nhỏ hơn); 480 thì vẫn 2 cột không tràn | Thủ công | P3 |
| M-06 | AC4 | button_label trống | Mở / | Không render rich-text-button; body chiếm cột phải | Thủ công | P4 |
| M-07 | AC2 | heading dài (≥ 60 ký tự) ở 360 | Mở / | Heading xuống dòng, không tràn ngang (text-wrap balance) | Thủ công | P3 |
| M-08 | AC1 | Mất mạng sau khi tải trang | Hover/Tab CTA | Không có JS nên không lỗi console; điều hướng CTA báo lỗi mạng của trình duyệt (ngoài phạm vi theme) | Thủ công | P4 |
| M-09 | AC7 | VoiceOver/NVDA, RTL | Đọc CTA | Chỉ đọc nhãn, không đọc icon | Thủ công | P4 |
Đã tự động trong spec: 360px (TC-09), keyboard (TC-07), screen reader name (TC-03, TC-05), không JS (TC-15), merchant chưa chọn ảnh (TC-04 skip), reduced-motion (TC-14, R-08).

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- Theme preview từ CI (PREVIEW_URL ?preview_theme_id=...&pb=0), STORE_PASSWORD.
- Trang chủ: container home-intro + rich-text static block, setting mặc định (heading, heading_after_image, body, button_label "Become A Member", button_url trống → /collections/all).
- Cần merchant chọn 1 ảnh cho inline_image để TC-04 không skip.
- Footer cần ≥ 2 nước hoặc ≥ 2 ngôn ngữ để R-04/R-05 không skip.
- Settings màu background_sand_color #EBE6E0, background_sand_foreground_color #1A1A1A giữ mặc định.

## KHÔNG CHẮC
- Xem dòng đầu file.
- R-04 đo theo offsetParent của panel (form .site-footer__localization position: relative), không phải details; nếu FE đổi neo thì cập nhật helper.
- RTL bật bằng thuộc tính dir trên html (D6); chưa có locale RTL thật nên không kiểm chiều cuộn slideshow (nợ N1 của BE).
