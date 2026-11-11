KHÔNG CHẮC: (1) B2B (TE-4 AC18, TE-5 AC9) phụ thuộc ES1-T298: store dev không bật được B2B thì AC giữ, QA kiểm bằng mockup (ES1-T297 #1); combined listing không có AC (ES1-T297 #6); (2) ngưỡng CI chặn merge sau khi đổi chỉ tiêu nghiệm thu (NFR-1) và cách nhận biết email đã đăng ký (TE-18 AC7) chờ Tech Lead ES1-T301, có mặc định; (3) file này thay `docs/srs.md` (hook chặn BA ghi docs/, Orchestrator chép).

# SRS — theme-efitco · bản 0.5 · BA · 11/11/2026 (bản 0.4: 11/11/2026, bản 0.3: 10/11/2026, bản 0.2: 06/11/2026, bản 0.1: 22/10/2026)

Nguồn: charter, PRD, Figma Efitco T10 (home), Skeleton AGENTS.md, Theme Store requirements (chuẩn nội bộ, mã R), Canvas requirements (22/10/2026). Bản 0.2: ES1-T173, theo ES1-T167, T168, T169 và CTO duyệt 06/11. AC-H* có mã TC-H* tương ứng; bảng nội dung theo node ở `drafts/ba/ES1-T173/home-content.md`. Bản 0.5: thêm story mới TE-19..TE-22 (ES1-T396, REQ-0002), tách mega menu khỏi TE-1 AC2, trang phụ và blog khỏi TE-9 AC2, AC3.

Bản 0.3: ES1-T294, khớp `docs/design/decisions.md` (sổ quyết định, CTO 09/11, 10/11, audit ES1-T283) và trả lời ES1-T272, ES1-T273 #1, ES1-T280 #1. Bảng thay đổi: `drafts/ba/ES1-T294/srs-changes.md`; ma trận truy vết: `drafts/ba/ES1-T294/traceability.md`; dữ liệu demo: `drafts/ba/ES1-T294/demo-data-b2b.md`.

Bản 0.4: ES1-T299, áp 7 lệch L1–L7 của bản 0.3 theo sổ (CTO chốt ES1-T297 #4) và các quyết định CTO 11/11 (sổ dòng 11/11, ES1-T269, ES1-T274, ES1-T276, ES1-T297). Bảng thay đổi: `drafts/ba/ES1-T299/srs-changes.md`; ma trận truy vết: `drafts/ba/ES1-T299/traceability.md`. SRS mâu thuẫn với sổ quyết định thì sổ thắng. AC đánh dấu "(0.4)" là sửa hoặc mới trong bản này; "(0.3)" là sửa hoặc mới ở bản 0.3, không đổi trong 0.4.

## 0. Thuật ngữ
Block = đơn vị giao diện trong `blocks/` của Skeleton (thay cho section). Template = `templates/*.liquid` compose block. Partial = vùng HTML refresh không reload. Canvas = nơi merchant sửa theme; Sidekick = agent sửa file theme.
Option value = một giá trị của một option sản phẩm (vd "45 lb" của option Weight). Bộ chọn biến thể chung = cùng một bộ chọn dùng ở trang sản phẩm và quickview (TE-4 AC13–AC15). Lớp = popup, drawer, dialog, menu đang mở trên trang (TE-18, `docs/ui-spec/layers.md` §4).
(0.4) Thanh đáy = sticky add to cart (trang sản phẩm), thanh checkout (cart dưới 64rem), thanh bundle (trang chủ 360), theo `layers.md` §2.2. Teaser Big Offer = nút nổi "Big Offer" (TE-18 AC6). Phân trang chung = snippet phân trang dùng ở collection, list-collections, search, blog, bình luận bài viết (TE-6 AC6, `docs/ui-spec/pagination.md`).

## 1. Yêu cầu phi chức năng
- NFR-1 (0.4, L1; sổ 09/11 "chỉ tiêu nghiệm thu", 10/11 BGĐ "phạm vi SEO 100", "Best Practices 100") Given demo trên store dev When đo Lighthouse desktop và mobile Then: Accessibility 100 và Best Practices 100 ở mọi trang đo; SEO 100 ở trang chủ, collection, sản phẩm, blog, bài viết, page (không tính SEO ở /cart, /search, /account, 404, password, gift card); Performance desktop ≥ 98, mobile ≥ 90. Best Practices: DevOps/QA ghi tách phần do theme và phần do nền tảng Shopify. Đây là chỉ tiêu nghiệm thu; ngưỡng CI chặn merge giữ theo `CLAUDE.md` (performance ≥ 96 desktop, ≥ 90 mobile, accessibility ≥ 98) tới khi Tech Lead/DevOps chốt (ES1-T301 #1).
- NFR-2 theme check 0 lỗi, không override; không console error.
- NFR-3 Kiến trúc đúng AGENTS.md; mọi thay đổi Sidekick làm vẫn giữ cấu trúc.
- NFR-4 Mọi tương tác có fallback không JS (form submit).
- NFR-5 Trình duyệt: Safari 2 bản, Chrome 3, Firefox 3, Edge 2; mobile Safari/Chrome/Samsung; webview IG/FB/Pinterest.
- NFR-6 Không phụ thuộc app; không script ngoài Shopify CDN.
- NFR-7 (0.3, sổ 10/11 "2048 biến thể") Mọi chỗ chọn biến thể (trang sản phẩm, quickview, card, sticky bar) chạy đúng với sản phẩm tới 2048 biến thể, tối đa 3 option: không dựng từ danh sách biến thể, không nhúng JSON toàn bộ biến thể vào HTML.

## 2. Module và story

### TE-1 — Khung theme và design token
Phía: FE · Ước lượng sơ bộ: 8 point (techlead chốt)

Là merchant, tôi muốn theme có header 2 cấp, footer, announcement bar và màu/chữ theo Efitco T10 để mọi trang nhất quán ngay khi cài.

- AC1 Given tokens.json từ Figma When render bất kỳ trang Then màu nền/chữ/accent, font chính, khoảng cách, bo góc lấy từ settings (css-variables), không hardcode trong CSS.
- AC2 (0.3, N1 CTO 10/11, `docs/ui-spec/navigation.md`) Từ 80rem: theo TE-22 AC1–AC3 (0.5). Given dưới 80rem, có JS When chạm mục có cấp 2 trong drawer Then panel cấp 2 trượt vào trong cùng drawer, có nút Back (tên truy cập "Back to menu", cao ≥ 44px) và nút đóng, focus chuyển vào Back; bấm Back Then về cấp 1, focus về mục vừa mở. Given không JS Then cấp 2 là accordion `<details>` tại chỗ, không trượt, không có Back.
- AC3 (0.4, ES1-T269, sổ 10/11 + 11/11 tài khoản khách) Given shop bật customer accounts When render header desktop và mobile Then có `<shopify-account>`, cart link có số lượng, search link. Given repo theme When kiểm Then không có thư mục `templates/customers/` và không template `customers/*`; đăng ký, đăng nhập, trang tài khoản do customer accounts mới của Shopify host.
- AC4 (0.4, AN1, AN2 sổ 11/11, `docs/ui-spec/announcement-bar.md`) Given setting announcement text rỗng (mặc định — Figma không có announcement bar) When render Then không có announcement bar. Given có text When render Then bar nằm trên header, nền `--color-background-dark` có noise liền header, cao ≥ 44px ở 360, 768, 1280, 1920; có link Then cả câu là link (vùng chạm cao 44px), không link Then chữ thường; bar không có nút đóng, không xoay nhiều câu, không setting màu. Given đã cuộn qua bar When header bật `sticky_header` Then bar cuộn đi (không dính), chỉ header 80px dính đỉnh. Given trang password hoặc gift card Then không có bar.
- AC5 (0.3) Given shop bán ≥ 2 nước hoặc ≥ 2 ngôn ngữ When render footer và drawer mobile Then có control localization gộp theo AC9, AC10, theo UX guideline Shopify; 1 nước và 1 ngôn ngữ Then không hiện control.
- AC6 Given footer When render Then có newsletter form (customer form, thông báo thành công/lỗi), menu footer default footer, social icons từ settings, payment icons từ shop.enabled_payment_types đủ màu.
- AC7 Given mọi trang When kiểm Then html lang = request.locale.iso_code, meta-tags snippet có title/description/canonical/og/twitter, page_image.
- AC8 Given token docs/tokens.json When render Then font heading Sofia Sans Condensed qua font_picker, body Inter; chữ phụ trên nền sáng dùng `--color-muted-light` #6B6B6B (≥ 4.5:1), #999999 chỉ trên nền tối.
- AC9 (0.3, sổ 10/11 "header trang chủ", "header trang con", "hero 768 và 360"; thay bản 30/10 của ES1-T8) Given mọi trang, kể cả trang chủ có hero và trang con có banner hoặc ảnh bìa When render header Then header là thanh tối riêng cao 80px, nền `--color-background-dark` có noise (Figma 1:362), chữ và icon dùng `--color-background-dark-foreground`; header không đè ảnh: đỉnh hero, banner nằm dưới đáy header. Given setting `sticky_header` bật (mặc định) When cuộn quá 80px Then header dính đỉnh, giữ nền tối, thêm bóng, chiều cao không đổi (CLS 0). Given hero có ảnh When render ở 768 và 360 Then lớp tối theo setting `overlay_opacity` mặc định 30%; từ 1280 hero giữ như Figma 1:361. Given localization hiện theo AC5 When render footer và drawer mobile Then đúng 1 control gộp (cờ + "USD / EN") mở 2 danh sách country và language; không có 2 nút tách Currency và Language (ES1-T289).
- AC10 (0.4, LC1–LC3 sổ 11/11, `docs/ui-spec/localization.md`) Given localization hiện theo AC5 When bấm nút gộp ở footer Then từ 48rem mở popover 2 cột "Country/region" và "Language", dưới 48rem mở bottom sheet có 2 tab; chỉ một trong hai danh sách có > 1 mục Then chỉ hiện danh sách đó, không tab. Given drawer menu dưới 80rem When chạm hàng localization ở chân drawer Then danh sách mở thành cấp 2 trong cùng drawer, có Back, không mở lớp thứ hai. Given > 10 nước Then có ô tìm nước, gõ thì lọc danh sách; ≤ 10 nước Then không có ô tìm; hàng nước không có cờ. Given bấm một nước hoặc một ngôn ngữ When chọn Then đổi ngay bằng form localization, không có nút Apply; mục hiện tại có dấu ✓ và `aria-current`. Given không JS Then form localization vẫn đổi được nước và ngôn ngữ.
- AC-H28 (TC-H28, hàng 16) Given footer mặc định When render 1920 Then đủ: logo, mô tả, ảnh newsletter nếu đã chọn, heading 2 màu đạt AA, nút "Get 15% Off" + icon, "No spam. Unsubscribe anytime.", đúng 1:1104.
- AC-H29 (0.3, TC-H29 viết lại, hàng 1, 2; story TE-1, TE-2) Given hero thật trên `/` When ở đầu trang và khi cuộn quá 80px Then header là thanh tối cao 80px, đáy header ≤ đỉnh hero (không chồng lên hero), nền header không đổi khi cuộn; TE-1 TC-42, TC-46 bỏ, TC-47 viết lại theo AC9 (lớp tối 30% chỉ ở 768, 360).

Mã R: R4.7 country/language (AC5, AC9, AC10); R4.8 menu đa cấp (drawer; mega xem TE-22); R4.9 newsletter; R4.18 Follow on Shop; R4.19 shopify-account (AC3); R7 layout; R11 SEO; R13 social; R14–R16 settings/font/màu; R12 (AC4, AC10)

### TE-2 — Block slideshow (hero) và rich text
Phía: FE + BE (JS slideshow) · Ước lượng sơ bộ: 8 point (techlead chốt) · Figma 1:422, 1:437, 1:453 · CTO 31/10: làm slideshow như thiết kế

Là merchant, tôi muốn block slideshow (mỗi slide: ảnh hoặc video, 2 nút, 3 bố cục) và block rich text để mở đầu trang chủ theo Figma.

- AC1 Given hero có ảnh When render Then ảnh có focal point từ image_picker, srcset, eager load ở vị trí đầu trang; có video Then dùng video setting, autoplay muted loop, có poster.
- AC2 (0.3, sổ 10/11 "hero 360", ES1-T280 #1) Given bố cục chọn trái/giữa/phải When render Then nội dung căn đúng ở 1280 và 768; ở 360 luôn căn trái, cùng mép 20px với các khối bên dưới (thay căn giữa của bản 07/11).
- AC3 Given 0, 1 hoặc 2 nút có label When render Then chỉ nút có label hiện; nút có href từ url setting; nút thứ hai kiểu secondary.
- AC4 Given chưa chọn ảnh/video When trong editor Then placeholder lifestyle image; ngoài editor Then nền màu từ setting.
- AC5 Given rich text When render Then heading, body richtext, nút tuỳ chọn, độ rộng tối đa setting; heading level chọn h1/h2.
- AC6 (0.3) Given slideshow có 1–5 slide (block con `slide`, mỗi slide theo AC1–AC4) When render Then chỉ slide đầu là LCP: ảnh slide 1 eager + fetchpriority high, slide sau lazy; 1 slide Then ẩn nút trái/phải và chấm. Hero nằm dưới header (TE-1 AC9): root slideshow không mang hook đè header `data-header-overlay`.
- AC7 (0.4, L2; sổ 07/11 hero, 10/11 H1, 11/11 HD2; `index-mobile-a.md` §2, `index-1280.md`) Given ≥ 2 slide When render Then điều khiển theo mốc: 360 có 2 chấm (vùng chạm 44 × 44) ở đáy trái, không mũi tên; 768 và 1280 có 2 nút tròn 52px ở góc dưới phải, không chấm; 1920 có 2 nút tròn 52px như Figma 1:361, không chấm. Ở 360 và 768 ảnh hero tràn màn, không bo góc. Given người dùng bấm nút trái/phải, bấm chấm (360) hoặc vuốt (cảm ứng) When chuyển Then slide đổi, chấm hiện slide đang xem (`aria-current`), slide ẩn có `inert`; không JS Then các slide cuộn ngang bằng scroll-snap, vẫn xem được hết.
- AC8 Given setting autoplay bật (mặc định tắt) When chạy Then đổi slide theo khoảng thời gian setting (3–10 s), có nút tạm dừng, dừng khi hover/focus và khi `prefers-reduced-motion: reduce`; không reset vòng lặp giả.
- AC9 Given trình đọc màn hình When vào slideshow Then root `role="region"` + `aria-roledescription="carousel"` + `aria-label`; mỗi slide `role="group"` + `aria-roledescription="slide"` + nhãn "n / tổng"; nút có tên truy cập.
- AC10 (0.4, HA1 sổ 11/11, `index-mobile-a.md` §10) Given trang chủ tải When hero render Then ảnh slide 1 và lớp tối hiện ngay, không có hiệu ứng vào (không opacity, clip-path, scale); chữ hero (eyebrow, H1, câu phụ, nút) hiện dần 400 ms ngay lúc tải, không chờ cuộn, xong trước 700 ms. Given `prefers-reduced-motion: reduce` Then chữ hero hiện ngay. Ngoại lệ dòng 09/11 chuyển động ("ảnh lớn mở dần") cho ảnh hero.

Mã R: R3 layout; R4.5 focal point; R12 a11y carousel; R14 settings; R17 ảnh responsive; R6 Lighthouse (LCP slide 1, AC10)

### TE-3 — Block featured collection, product card và quickview
Phía: FE+BE · Ước lượng sơ bộ: 8 point (techlead chốt; quickview AC9–AC12 là phần mới, techlead tách)

Là merchant, tôi muốn đặt block hiện sản phẩm của một collection trên trang chủ để khách thấy hàng nổi bật mà không vào trang collection.
Là khách (0.3, ES1-T272), tôi muốn chọn biến thể và thêm vào giỏ từ card qua quickview để không phải rời trang đang xem.

- AC1 Given chọn collection When render Then hiện tối đa N sản phẩm (4–12, mặc định 4 theo Figma, D7 của ES1-T169), lưới 2 cột ở 360, 3–5 cột ở 1280 theo setting.
- AC2 (0.3, foundation §9, ES1-T294) Given sản phẩm có option màu ≥ 2 giá trị có swatch When render card Then swatch là chỉ báo: `aria-hidden="true"`, không nhận focus, không bấm được; tên truy cập của link card có thêm số màu (vd ", 3 colors"); swatch lấy từ option value của option màu, không lặp danh sách biến thể (NFR-7). Chọn màu qua nút Quick View (AC9), mở bộ chọn chung với trang sản phẩm (TE-4 AC13).
- AC3 Given compare_at_price > price When render Then giá gạch + badge sale với % giảm làm tròn, tính đúng với giá nhỏ.
- AC4 Given product.price_varies When render Then hiện khoảng giá min–max; có unit_price Then hiện unit price.
- AC5 Given collection rỗng hoặc chưa chọn When trong editor Then placeholder hướng dẫn; ngoài editor Then không render block.
- AC6 (0.3) Given keyboard When tab qua card Then focus thấy được trên link card và nút Quick View, ảnh có alt từ sản phẩm; link card và nút Quick View có vùng chạm ≥ 44px; swatch giữ kích thước Figma 32 × 16 cách 4, không phải control nên không có yêu cầu vùng chạm (thay "vùng bấm swatch 44px" của D7, ES1-T169).
- AC7 Given bật nút Xem tất cả When render Then nút link tới collection.url, vị trí theo setting.
- AC8 (0.3, Editions Fall '26 #20) Given collection đa nguồn có phần tử là variant When render card Then ảnh, giá, link ?variant= theo đúng variant đó, swatch của variant đó hiện ở trạng thái đang chọn (chỉ báo, không bấm).
- AC9 (0.3, ES1-T272, M1 CTO 10/11) Given setting `Show quick view button` bật (mặc định) When render card Then có nút Quick View cho mọi sản phẩm, kể cả 1 biến thể và hết hàng: từ 64rem trên thiết bị có hover, nút hiện khi rê chuột hoặc focus vào card hay nút; dưới 64rem hoặc màn cảm ứng, nút tròn 44px luôn hiện trên ảnh; tên truy cập "Quick View" + tên sản phẩm; bấm nút không mở trang sản phẩm. Setting tắt Then card không có nút.
- AC10 (0.3, ES1-T272, M2) Given bấm Quick View When quickview mở Then từ 48rem là dialog giữa màn, dưới 48rem là bottom sheet; có tiêu đề là tên sản phẩm, ảnh, giá/giá gạch/badge %, rating khi có metafield (như AC-H13), bộ chọn biến thể chung (TE-4 AC13–AC15), tình trạng tồn, số lượng, Add To Cart, link "View Detail" tới trang sản phẩm; sản phẩm có quantity rule hoặc selling plan Then hiện như TE-4 AC18, AC19. Đang tải Then trạng thái tải trong dialog; tải lỗi Then thông báo lỗi, nút thử lại và link tới sản phẩm. Đóng bằng nút đóng, Esc, chạm scrim (sheet: vuốt xuống); đóng Then focus về nút Quick View.
- AC11 (0.3, ES1-T272) Given Add To Cart trong quickview thành công When `cart_type` = drawer Then quickview đóng, cart drawer mở có thông báo đã thêm (TE-5 AC1), số giỏ tăng đúng; `cart_type` = page Then chuyển tới cart page. Lỗi 422 Then câu lỗi Shopify trả về hiện dưới nút trong `role="alert"`, quickview không đóng. (0.4) Ngoại lệ: quickview mở trong popup kết quả quiz theo TE-11 AC7.
- AC12 (0.3) Given không JS When render card Then không có nút Quick View, card là link tới trang sản phẩm.
- AC-H11 (TC-H11, hàng 5) Given 4 tab gắn 4 collection When bấm hoặc dùng bàn phím đổi tab Then lưới đổi không reload, tab chọn có trạng thái chọn đọc được bởi trình đọc màn hình; không JS thì 4 tab là link tới collection.
- AC-H12 (TC-H12, hàng 5) Given tab có collection rỗng When chọn Then hiện thông báo rỗng, không còn card của tab trước.
- AC-H13 (TC-H13, hàng 5) Given sản phẩm có metafield rating When render card Then hiện sao + số; không có metafield thì không có badge.
- AC-H14 (TC-H14, hàng 5) Given sản phẩm thoả quy tắc New (CR-3) When render card Then badge New đạt 4.5:1; đang sale thì hiện badge % như Figma, quy tắc ưu tiên do CR-3 chốt.

Settings mới (0.3):

| Block / nhóm | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| Product cards (theme settings) | `show_quick_view` "Show quick view button" | checkbox | true | — | M1 CTO 10/11, mini-cart-quickview.md §5 |

Mã R: R7 collection (giá, unit price, ảnh); R7 product swatch; R12 a11y; R17

### TE-4 — Trang sản phẩm
Phía: FE+BE · Ước lượng sơ bộ: 13 point (techlead chốt; AC13–AC20 là phần mới, techlead tách)

Là khách, tôi muốn xem ảnh/video, chọn biến thể thấy giá và tồn cập nhật, thêm vào giỏ và thanh toán bằng accelerated checkout trên mobile mà không cuộn ngược lên nút mua.

- AC1 Given sản phẩm có media When render Then gallery hiện ảnh, video, 3D model (media filters), thumbnail, zoom ảnh; biến thể chọn đổi sang featured_media của biến thể.
- AC2 (0.4, L4: nhãn nút) Given chọn option When đổi Then giá, compare_at, unit price, trạng thái tồn, nút "Add To Cart" (disable khi hết/không tồn tại), URL ?variant= cập nhật không reload; first available variant load mặc định.
- AC3 Given render Then hiện product.title đầy đủ, description, vendor (tuỳ setting), option names/values, cart.taxes_included thông báo khi có, số lượng chọn được.
- AC4 (0.4) Given shop bật When render Then có accelerated checkout (payment_button, bật mặc định, màu không đổi), Shop Pay Installments banner, pickup availability (chi tiết AC20), selling plan selector nếu có (chi tiết AC19).
- AC5 (0.3, P2 CTO 10/11; thay "chỉ mobile") Given trang sản phẩm ở 360, 768, 1280, 1920 When nút Add To Cart chính ra khỏi màn Then thanh mua dính đáy hiện; nút chính vào lại màn Then thanh ẩn. Nội dung: 360 ảnh, tên, giá, nút Add To Cart; từ 768 thêm biến thể đang chọn và giá gạch; từ 64rem thêm ô số lượng đồng bộ với ô trong form. Thanh không có bộ chọn biến thể (NFR-7). Biến thể hết hàng Then nút disabled "Sold out"; lựa chọn là tổ hợp không tồn tại Then nút "Choose Options", bấm thì cuộn về bộ chọn và focus option đầu tiên chưa hợp lệ. Setting "Show on desktop" mặc định bật; tắt Then thanh không hiện từ 64rem. Cuộn hết trang Then thanh không che footer.
- AC6 Given gift card product When render Then form recipient (email, name, message, send_on).
- AC7 Given cuối trang When render Then block related products và complementary products từ Product Recommendations API.
- AC8 (0.4, QZ1) Given thêm giỏ thành công When Then cart drawer mở (TE-5) hoặc chuyển cart page theo setting. Ngoại lệ: Add To Cart trong popup kết quả quiz giữ popup mở, không mở drawer, không chuyển cart page (TE-11 AC6).
- AC9 (Editions #14) Given variant.requires_shipping = false (sản phẩm số, bán quyền truy cập) When render Then ẩn pickup availability và thông báo vận chuyển; sản phẩm 1 variant không hiện bộ chọn option.
- AC10 (Editions #16) Given market có giá đã gồm thuế/phí (cart.taxes_included, cart.duties_included) When render giá Then hiện ghi chú tương ứng qua locale, theo từng market.
- AC11 (Editions #28) Given trang sản phẩm When render Then có structured data Product (JSON-LD: name, image, offers theo variant, availability, price, priceCurrency, brand).
- AC12 (Editions #5, BE) Given trang sản phẩm load hoặc đổi variant When Then dispatch event chuẩn `shopify:product:view` / variant theo tài liệu Standard storefront actions; override action show variant để UI đổi đúng variant.
- AC13 (0.3, sổ 10/11 "2048 biến thể", NFR-7) Given sản phẩm có tới 2048 biến thể, tối đa 3 option When render trang sản phẩm hoặc quickview Then bộ chọn dựng từ option và option value; HTML không chứa danh sách biến thể dạng JSON và không có `<select>` liệt kê biến thể; mỗi giá trị hiện 1 trong 3 trạng thái theo lựa chọn hiện tại của các option khác: còn hàng; hết hàng (gạch chữ, tên đọc thêm ", sold out"); tổ hợp không tồn tại (viền nét đứt, tên đọc thêm ", unavailable"); mọi giá trị vẫn chọn được; hai trạng thái không mua được phân biệt bằng hình và chữ ẩn, không chỉ bằng màu.
- AC14 (0.3, M5 CTO 10/11) Given một option có > 10 giá trị When render Then hiện 7 giá trị + nút "+N" (N = tổng − 7), giá trị đang chọn luôn nằm trong các ô đang hiện; bấm "+N" Then mở hết tại chỗ, nút đổi thành "Show fewer", focus không mất; ở 360 không tràn ngang. Option ≤ 10 giá trị Then hiện hết. Ngưỡng 10 và số 7 là hằng chung trang sản phẩm và quickview, không có setting.
- AC15 (0.4, sổ 10/11, M4; VP1 sổ 11/11) Given đổi một giá trị option When chờ server trả biến thể theo option value Then giá trị vừa bấm chuyển trạng thái chọn ngay, vùng giá và tồn hiện trạng thái đang tải và có `aria-busy`; nút Add To Cart giữ màu chính, nhãn và bề rộng, có `aria-disabled="true"`, không spinner, bấm trong lúc chờ không thêm giỏ (spinner trên nút chỉ dùng khi đang thêm giỏ); xong Then giá, compare_at, badge %, ảnh biến thể, tồn, nút, countdown (AC17), sticky bar (AC5) và trạng thái giá trị của các option khác cập nhật theo biến thể; bấm liên tiếp Then chỉ kết quả của lần bấm cuối được áp dụng. Trang sản phẩm Then URL `?variant=` cập nhật bằng replace, không thêm mục lịch sử. Quickview Then URL trang nền không đổi, chỉ link "View Detail" đổi sang `?variant={id}`. Lỗi tải Then giữ biến thể cuối đã tải, thông báo lỗi `role="alert"` + nút thử lại.
- AC16 (0.3, ES1-T282) Given sản phẩm > 250 biến thể trên store dev (demo-data-b2b.md D3) When chọn tổ hợp nằm sau vị trí 250 theo thứ tự tạo Then giá, tồn, ảnh, nút đúng biến thể đó; thêm giỏ thành công đúng biến thể đó.
- AC17 (0.4, sổ 10/11 P3, P4, P5, CTO audit (2); sổ 11/11 CD2, ES1-T276; `docs/ui-spec/countdown.md`) Given sản phẩm có metafield `custom.sale_ends_at` (date_time) When render trang sản phẩm Then countdown "Sale ends in" hiện gần giá chỉ khi đủ 4 điều kiện: ngày còn trong tương lai lúc render, biến thể đang chọn có compare_at_price > price, biến thể còn hàng, setting "Show sale countdown" bật (mặc định); thiếu một điều kiện Then không in khối, không chừa chỗ. Còn ≥ 24 giờ Then 4 ô ngày, giờ, phút, giây; dưới 24 giờ Then 3 ô giờ, phút, giây. Given HTML vừa tải, JS chưa chạy Then ô số đã có giá trị do Liquid in theo thời điểm render, khung đủ kích thước (CLS 0); JS chạy sau chỉ cập nhật số. Số giảm mỗi giây, ô số `aria-hidden`, có chữ ẩn ngày giờ kết thúc đầy đủ theo giờ store, không `aria-live`, không chuyển động; tải lại trang không reset. Given hết giờ khi đang xem Then ngừng đếm, không đếm âm, không đếm lại; khung giữ kích thước, nhãn và ô số thay bằng "This sale has ended"; giá và nút giữ nguyên tới khi tải lại; trang không tự tải lại. Given không JS Then không hiện countdown, khối không chiếm chỗ. Countdown chỉ hiển thị, không đổi giá. Một component countdown chung với TE-13 và big offer (TE-18 AC6).
- AC18 (0.4, CTO audit (4), SF3 sổ 11/11, `product-shopify-features.md` §5) Given khách B2B đăng nhập và biến thể có quantity rule (min, max, bước) trong catalog When render trang sản phẩm và quickview Then hiện dòng quy tắc (chỉ phần áp dụng: min > 1, có max, bước > 1) dưới hàng số lượng; ô số lượng mặc định = min, nút +/− đổi theo bước, − khoá ở min, không vượt max. Given nhập tay số không hợp lệ (dưới min, không chia hết bước, hoặc quá max trừ số đã trong giỏ) When rời ô hoặc bấm Add To Cart Then câu lỗi hiện ngay dưới ô (ô `aria-invalid`, gắn `aria-describedby`), không thêm giỏ, bấm nút thì focus về ô số; nút Add To Cart vẫn bật. Given số trong giỏ đã bằng max Then stepper khoá, Add To Cart disabled, có câu đã đủ max + link "View cart". Biến thể có volume pricing Then hiện bảng bậc giá (số lượng từ, giá mỗi đơn vị), bậc đang áp có dấu và chữ ẩn "Current price"; quickview Then bảng nằm trong `<details>` đóng sẵn. Khách không B2B Then không hiện các phần này. Dữ liệu: ES1-T298 (D1); store dev không bật được B2B Then QA kiểm bằng mockup (ES1-T297 #1).
- AC19 (0.4, CTO audit (4), R4.14, SF1 sổ 11/11, `product-shopify-features.md` §4) Given sản phẩm có selling plan group When render trang sản phẩm và quickview Then fieldset "Purchase options" có thẻ radio "One-time purchase" và mỗi selling plan group 1 thẻ; nhóm có > 1 plan Then thẻ nhóm đang chọn có select "Delivery frequency"; nhóm 1 plan Then không select, in tên plan. Chọn plan Then giá chính (hàng giá và sticky bar) đổi theo plan: giá theo plan, giá một lần là giá gạch khi cao hơn, badge % tính lại; thêm giỏ kèm selling plan đã chọn; nhãn nút giữ "Add To Cart". Mặc định chọn `product.selected_selling_plan`, không có thì "One-time purchase". Given `product.requires_selling_plan` = true Then không có "One-time purchase", mặc định plan đầu của nhóm đầu, form luôn gửi kèm 1 plan. Không có selling plan Then không hiện khối. Không JS Then mọi plan là radio phẳng `name="selling_plan"`, vẫn thêm giỏ đúng plan.
- AC20 (0.4, R4.10, SF2 sổ 11/11, `product-shopify-features.md` §7) Given biến thể đang chọn cần giao hàng và có ≥ 1 địa điểm bật pickup When render trang sản phẩm Then dưới Buy It Now có dòng trạng thái pickup ở địa điểm đầu (còn hoặc không, có icon và chữ) và nút "Check availability at other stores" (≥ 2 địa điểm) hoặc "View store information" (1 địa điểm), cao 44px. Given bấm nút When có JS Then mở dialog danh sách địa điểm (tên, trạng thái, địa chỉ, điện thoại nếu có): từ 48rem là drawer phải, dưới 48rem là bottom sheet; đóng bằng ×, Esc, scrim, vuốt xuống (sheet) Then focus về nút mở. Given không JS Then danh sách mở tại chỗ bằng `<details>`. Given không địa điểm bật pickup, sản phẩm số hoặc gift card Then không in khối. Đổi biến thể Then khối cập nhật theo biến thể mới. Quickview không có khối pickup.

Settings mới hoặc đổi default (0.3):

| Block | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| product-sticky-bar | `show_on_desktop` "Show on desktop" | checkbox | true (trước: false) | tắt thì không hiện từ 64rem | P2 CTO 10/11; product.md §10 |
| product-info | `show_sale_countdown` "Show sale countdown" | checkbox | true | info: dùng metafield `custom.sale_ends_at`, không tự kết thúc giá gạch | P3 CTO 10/11; product.md §4.2 |

Không thêm setting cho selling plan, quantity rule, pickup (0.4, `product-shopify-features.md` §12: bật/tắt theo dữ liệu Shopify).

Mã R: R4.10 pickup (AC20); R4.12 rich media; R4.11 recommendations; R4.14 selling plans (AC19); R4.15 installments; R4.16 unit price; R4.17 variant images; R7.2 product page; R8 không fake urgency (AC17); R12 (AC13, AC14, AC18, AC20)

### TE-5 — Cart drawer và cart page
Phía: BE+FE · Ước lượng sơ bộ: 10 point (techlead chốt)

Là khách, tôi muốn sửa giỏ không reload, thấy giảm giá, ghi chú đơn và ngưỡng freeship để checkout tự tin.

- AC1 Given thêm giỏ When thành công Then drawer mở, có line items (title, ảnh, options_with_values, unit_price, final_price, quantity, discount), tổng, nút checkout, accelerated checkout bật mặc định.
- AC2 Given đổi số lượng hoặc xoá When Then partial cart-drawer + cart-count refresh, tổng đúng, giữ focus, aria-busy khi tải; lỗi 422 (quá tồn) hiện thông báo từ API trong live region và số lượng về giá trị server.
- AC3 Given setting ngưỡng freeship When tổng < ngưỡng Then thanh tiến độ + text còn thiếu; ≥ ngưỡng Then thông báo đạt.
- AC4 Given giỏ rỗng When Then thông báo + nút tiếp tục mua; cart.taxes_included thông báo khi có.
- AC5 Given cart page (templates/cart.liquid) When render Then đủ như drawer + cart note textarea + selling plan hiện + mã giảm giá tự động hiện; không JS vẫn update/checkout được bằng form.
- AC6 (0.4, QZ1) Given setting cart type page When thêm giỏ Then chuyển cart page thay vì mở drawer. Ngoại lệ: Add To Cart trong popup kết quả quiz không mở drawer, không chuyển cart page ở cả hai giá trị `cart_type` (TE-11 AC6).
- AC7 (Editions #4, #5, #18, BE) Given agent hoặc app gọi `Shopify.actions` (add to cart, update cart lines, openCart) When Then theme override: openCart mở cart drawer (không sang trang cart), cart drawer + cart-count refresh từ dữ liệu cart thật qua partial (không cache client), dispatch `shopify:cart:lines-update` sau mỗi thay đổi do theme gây ra.
- AC8 (0.3, ES1-T272 #2, M3 CTO 10/11) Given setting `Show order note` bật (mặc định) When render cart drawer Then có mục "Add order note" dạng `<details>` đóng sẵn; mở ra có label "Order note" và textarea; nội dung là cùng `cart.note` với cart page; rời ô Then ghi chú được lưu; refresh partial giỏ Then chữ đang gõ không mất. Setting tắt Then drawer không có mục ghi chú.
- AC9 (0.4, CTO audit (4), SF3 sổ 11/11) Given dòng giỏ có quantity rule (khách B2B) When render drawer và cart page Then dưới tên dòng có quy tắc rút gọn ("Min 6 · Increments of 6", bỏ phần không áp dụng); +/− theo bước, − khoá ở min, + khoá ở max. Given gõ số không hợp lệ rồi rời ô Then câu lỗi dưới dòng, ô `aria-invalid`, không gửi cập nhật. Server trả 422 Then thông báo lỗi từ server trong live region, số lượng về giá trị server. Dòng có volume pricing Then giá đơn vị hiện theo bậc đang áp, có dòng "Volume pricing applied". Dữ liệu: ES1-T298 (D1); store dev không bật được B2B Then QA kiểm bằng mockup (ES1-T297 #1).
- AC10 (0.3, CTO audit (4), R4.14) Given dòng giỏ mua theo selling plan When render drawer và cart page Then dòng hiện tên selling plan; giá dòng là giá theo plan.

Settings mới (0.3):

| Block | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| cart-drawer | `show_order_note` "Show order note" | checkbox | true | drawer và cart page cùng `cart.note` | M3 CTO 10/11; mini-cart-quickview.md §5 |

Mã R: R4.1 discounts; R4.2 accelerated checkout; R4.14 selling plans; R7.5 cart page

### TE-6 — Trang collection: lọc, sắp xếp, phân trang
Phía: FE+BE · Ước lượng sơ bộ: 10 point (techlead chốt)

Là khách, tôi muốn lọc theo tình trạng, giá, loại, hãng, option và sắp xếp để thu hẹp danh sách sản phẩm trong collection mà không mở từng trang.

- AC1 (0.4) Given collection When render Then title, description, image (focal), lưới 2/3/4 cột theo setting, mỗi card như TE-3; paginate 24, phân trang theo AC6; thông báo khi rỗng.
- AC2 Given collection.filters When render Then faceted filter: availability, price range, product type, vendor, variant options (swatch nếu có); áp dụng cập nhật URL + partial collection-products/collection-filters không reload; không JS vẫn submit form được.
- AC3 Given sort_options When chọn Then URL sort_by cập nhật, danh sách refresh; sort mặc định là sort của collection trong admin (collection.default_sort_by), không có theme setting (PO 06/11, ES1-T106).
- AC4 Given mobile 360 When Then filter trong drawer, nút Lọc có badge số filter đang áp; keyboard đóng/mở.
- AC5 (0.4) Given list-collections When render Then title + collection.featured_image, phân trang theo AC6.
- AC6 (0.4, L7; sổ 10/11 audit (5), C3, S3; PG1 sổ 11/11; `docs/ui-spec/pagination.md`) Given danh sách > 1 trang ở collection, list-collections, search, blog hoặc bình luận bài viết When render Then dùng 1 snippet phân trang chung trong `<nav>` có tên: Previous và Next là nút tròn 52px, tên truy cập "Previous page" / "Next page" ở mọi trang; từ 48rem hiện số trang (vùng chạm 44px, trang hiện tại có `aria-current="page"`, không là link); dưới 48rem ẩn số trang, hiện "Page X of Y". Given đang ở trang đầu hoặc trang cuối Then nút Previous hoặc Next tương ứng vẫn hiện ở cùng vị trí, mờ 0.35, `aria-disabled="true"`, không có `href`, không vào thứ tự Tab (giữ chỗ, CLS 0). Given chỉ 1 trang Then không render phân trang. Mọi trang con là `<a href>` thật, đổi trang được khi không JS. Bình luận bài viết Then tên `<nav>` là "Comment pages", nút vẫn "Previous page" / "Next page".
- AC7 (0.4, PG3 sổ 11/11) Given URL có `?page=` lớn hơn số trang của danh sách When mở Then hiện empty state của trang đó + link "Go to page 1" tới trang 1, không trang trắng.

Mã R: R4.3 faceted search filtering; R7.3 collection; R7.4 list collections; R7.7, R7.8 paginate (AC6); R12 (AC6)

### TE-7 — Block nội dung: testimonials, FAQ, image with text, multicolumn
Phía: FE · Ước lượng sơ bộ: 8 point (techlead chốt)

Là merchant, tôi muốn 4 block nội dung để kể chuyện thương hiệu đúng bố cục Figma.

- AC1 (0.4, L6; sổ 09/11 "hàng ngang", "nút next/back tròn 52"; sổ 11/11 HD3) Given testimonials có 1–6 mục When render Then mục xếp thành hàng ngang ở mọi mốc, không dùng thanh cuộn của trình duyệt; từ 768 có nút back/next tròn 52px ở đầu khối (mặc định trắng viền #E5E5E5, rê chuột thì cam) và thanh tiến trình mảnh; ở 360 ẩn nút, cuộn bằng vuốt, vẫn có thanh tiến trình. Ở 1280 card để lộ ≥ 25% card kế tiếp. Given hàng vừa khung, không còn mục để cuộn Then hiện lưới tĩnh, không nút, không thanh tiến trình. Mỗi mục có quote, tên, sao (0–5), ảnh tuỳ chọn.
- AC2 Given FAQ có 1–10 mục When render Then disclosure dùng được bằng bàn phím (Enter/Space mở), trình đọc màn hình đọc được trạng thái mở/đóng (details/summary, không JS — PO 06/11, ES1-T115), một hoặc nhiều mở theo setting.
- AC3 Given image with text When render Then ảnh trái/phải theo setting, ở 360 ảnh trên; heading, richtext, nút.
- AC4 Given multicolumn 2–4 cột When render Then icon/ảnh, heading, text, link mỗi cột; 360 xếp 1 cột.
- AC5 (CTO 06/11 11:14) Given mọi block When merchant chưa nhập nội dung Then hiện nội dung Figma theo bảng nội dung (AC-H5), không Lorem Ipsum; block Custom Liquid với setting type liquid vẫn có trong theme, không gọi trong `templates/index.liquid` (CR-5).
- AC-H24 (TC-H24, hàng 12) Given 4 card, viewport 1920 When render Then 4 card rộng 456px, card 4 tràn như Figma, cuộn bằng chuột và bàn phím tới hết card 4; khác biệt theo cỡ màn do Designer ghi (CR-8).
- AC-H25 (TC-H25, hàng 12) Given mặc định When render Then 4 review đúng 1:885 (card 2 là 4 sao), Verified tắt, ngoại lệ E9 có trong sổ.

Mã R: R3 consistency; R5 Custom Liquid; R12 a11y; R14 settings

### TE-8 — Tìm kiếm predictive và trang kết quả
Phía: BE+FE · Ước lượng sơ bộ: 8 point (techlead chốt)

Là khách, tôi muốn gõ và thấy gợi ý sản phẩm/collection/trang, rồi trang kết quả có lọc, để tới sản phẩm cần tìm mà không phải duyệt từng collection.

- AC1 Given gõ ≥ 2 ký tự When 300ms Then gợi ý product (ảnh, tên, giá), collection, page, article từ predictive_search_url; ↑↓ Enter Esc; role listbox; mobile full màn.
- AC2 (0.4, PG2 sổ 11/11) Given trang search When render Then kết quả theo object_type (product, article, page) phân nhóm, phân trang theo TE-6 AC6, filter như collection, thông báo khi 0 kết quả. Given > 1 trang kết quả Then dưới phân trang có dòng "Showing x–y of z results"; dòng này chỉ có ở search, không ở collection, list-collections, blog, bình luận.
- AC3 Given không JS When submit Then trang search hoạt động đầy đủ.

Mã R: R4.13 search + predictive; R7.8 search page

### TE-9 — Preset mặc định, trang phụ và nội dung demo
Phía: FE · Ước lượng sơ bộ: 5 point (techlead chốt)

Là merchant, tôi muốn cài theme là có trang chủ hoàn chỉnh và các trang phụ đúng chuẩn để không bắt đầu từ trống.

- AC1 (CTO 06/11 11:14) Given theme mới cài When mở `/` Then thứ tự block theo AC-H1, copy và số liệu mặc định theo AC-H5, không Lorem Ipsum, không resource default trỏ tới thứ không tồn tại.
- AC2 (0.5) Trang 404, password, page, contact, gift card: theo TE-21.
- AC3 (0.5) Blog và bài viết: theo TE-20.
- AC4 Given store hoa-qua-nhap-khau (efitco-ai-dev) When kiểm Then có dữ liệu Figma theo `drafts/ba/ES1-T173/home-content.md` mục 3: 24 sản phẩm, 12 collection handle `figma-*` cho hàng 3, 4b, 5, tag quiz, metafield rating và spec, discount tự động 10%, 15%, 5 bài blog, menu, tên shop Efitco; handle và dữ liệu trong `tests/e2e/store-data.json` không đổi; ảnh demo chỉ dùng trên store dev, quyền dùng ghi ở ES1-T174.
- AC5 (Editions #25) Given shop.policies When render footer/trang phụ Then link chính sách lấy từ shop.policies, không nhập tay URL.
- AC6 (Editions #27) Given chưa chọn logo/màu trong theme When render Then dùng shop.brand (logo, màu chính) làm mặc định nếu có.
- AC7 (0.4, CTO audit (4), ES1-T282, ES1-T288, ES1-T297 #1, #2, #6; thực hiện ở ES1-T298) Given store dev When kiểm Then có thêm dữ liệu theo `drafts/ba/ES1-T294/demo-data-b2b.md` mục D2–D8, D10: sản phẩm có selling plan và 1 sản phẩm `requires_selling_plan`, sản phẩm > 250 biến thể, metafield `custom.sale_ends_at`, gift card có form người nhận, unit price có số đo, sản phẩm số, 3 địa điểm pickup, mã giảm giá `WELCOME15` (15% đơn đầu, 1 lần mỗi khách). D1 (quantity rule + volume pricing, 1 khách B2B) và D9 (combined listing) chỉ có khi store bật được tính năng; không bật được Then `drafts/devops/ES1-T298/demo-data-log.md` ghi lý do. Key mới thêm vào `tests/e2e/store-data.json`, key cũ không đổi.

Mã R: R14 default; R18 preset cùng tên theme; R20 demo store (AC7)

### TE-10 — Chuẩn chất lượng và sẵn sàng Canvas
Phía: FE+BE+QA · Ước lượng sơ bộ: 8 point (techlead chốt)

Là CTO, tôi muốn theme đạt ngưỡng chất lượng đo được và chạy đúng trong Canvas trước khi lên store thật.

- AC1 (0.4, L1) Given home/product/collection với dữ liệu benchmark When chạy lhci Then CI chặn merge khi dưới ngưỡng CI (NFR-1: theo `CLAUDE.md` tới khi Tech Lead/DevOps chốt, ES1-T301 #1). Given demo trên store dev When đo nghiệm thu Then đạt chỉ tiêu NFR-1 (SEO 100 ở 6 loại trang, Accessibility 100, Best Practices 100, Performance desktop ≥ 98, mobile ≥ 90).
- AC2 Given toàn bộ repo When theme check Then 0 lỗi, .theme-check.yml không override; không console error trên 8 trang; không Sass, không minified, không robots.txt.liquid.
- AC3 (0.4, L3) Given checklist Theme Store nội bộ When chạy Then nhóm bắt buộc (R4, R6–R17) pass 100%; nhóm tham khảo ghi N/A. R8 với nội dung mẫu (CTO 06/11 11:14, 11:15): copy, số liệu, review, bậc giảm mặc định tính đạt khi có đủ AC-H33 và giảm thật do discount tự động của Shopify (TE-12 AC2); bundle và shop the look không có dòng ghi chú giảm giá (sổ 07/11); khi nộp Theme Store cần thêm demo store và ghi là nội dung mẫu.
- AC4 Given zip upload lên yum-dev (store người, đã có Canvas) When checklist Canvas Then 5 bước pass; 10 yêu cầu Sidekick mẫu cho ra theme check 0 lỗi và cấu trúc không đổi.
- AC5 Given tài liệu merchant When kiểm Then 16/16 block có docs/merchant, có hướng dẫn nâng cấp theme trong Canvas.
- AC6 (0.4, Editions #6, #17, #30, #40, QA; LY1 sổ 11/11, `layers.md` §2) Given Chrome có WebMCP và inspector của `shopify theme dev` When gọi add_to_cart, update_cart_lines, show_variant Then UI theme (drawer, cart-count, variant) cập nhật đúng, 0 console error; nút dynamic checkout không vỡ layout với Apple Pay QR trên Chrome/Edge/Firefox; header/account không dùng customer.has_account làm điều kiện hiển thị. Given trang có nút Shopify Inbox và một thanh đáy đang hiện When đo ở 360 và 1280 Then theme dịch nút Inbox lên trên thanh đáy, nút Inbox không che sticky add-to-cart, thanh checkout cart, thanh bundle, cart drawer; toast hiện trong làn chừa riêng, không chồng nút Inbox.
- AC7 (0.4, LY2 sổ 11/11, `layers.md` §5) Given banner consent của Shopify đang hiện When render trang Then thanh đáy và teaser Big Offer không hiện, popup tự mở (TE-18) không mở; khách chọn xong trên banner Then thanh đáy và teaser hiện lại nếu điều kiện riêng của chúng còn đúng, popup tự mở theo hàng đợi TE-18 AC2; toast vẫn hiện trong lúc banner hiện.
- AC8 (0.4, LY3 sổ 11/11, `layers.md` §2.5) Given viewport cao ≤ 30rem (điện thoại ngang, phóng 200%) When cuộn trang Then header không dính đỉnh, teaser Big Offer không hiện; thanh mua dính đáy trang sản phẩm vẫn hiện theo TE-4 AC5.
- AC-H30 (0.4, TC-H30) Given `/` hoặc URL đại diện có đủ 16 block và ảnh When chạy lhci desktop và mobile Then CI chặn merge khi dưới ngưỡng CI (NFR-1); đo nghiệm thu trên store dev Then đạt NFR-1.
- AC-H31 (TC-H31) Given `/` đủ 16 block When tải xong, rồi cuộn hết trang Then JS tải sẵn ≤ 40 960 B, tổng sau cuộn ≤ 65 536 B; vượt thì chặn merge. Tính cả tabs và block mới.
- AC-H32 (TC-H32) Given spec của story P0 trên store dev đủ dữ liệu When chạy E2E Then 0 test skip do 429 hoặc thiếu dữ liệu.
- AC-H33 (0.4, TC-H33, ES1-T297 #3) Given tài liệu merchant When kiểm Then có mục bắt buộc trước publish: thay nội dung mẫu, tạo discount thật khớp bậc giảm, gắn tag quiz, chỉ bật Verified khi đã xác thực; mỗi block có dòng info nhắc nội dung mẫu; có bước cấu hình Shopify Email gửi mã giảm giá cho người đăng ký newsletter (ngoài phạm vi theme) và bước điền setting "Discount code" của before you leave.
- AC-H34 (TC-H34) Given zip giao bằng `scripts/theme-zip.sh` When liệt kê file Then 0 file `templates/index.te*` (grep hiện chưa thấy loại trừ).

Mã R: R6.1, R6.2 Lighthouse (chỉ tiêu nghiệm thu NFR-1 cao hơn checklist); R8 nhất quán; R9 trình duyệt; R10 assets; R12 a11y (AC6–AC8); Canvas 5 bước

### TE-11 — Block product finder quiz
Phía: FE1 markup/CSS + BE1 JS · Ước lượng sơ bộ: 8 point (techlead chốt) · Figma 1:506 · Spec kết quả: `docs/ui-spec/quiz-result.md` (ES1-T285)

Là khách mua, tôi muốn trả lời 3 câu hỏi để nhận tối đa 4 sản phẩm khớp tag đã chọn, không cần đăng ký.

- AC1 Given block có 3 bước cấu hình bằng block con `quiz-step` (câu hỏi, 2–4 lựa chọn, mỗi lựa chọn gắn 1 tag sản phẩm) When render Then hiện bước 1, thanh tiến độ "Step 1 of 3"; không JS thì hiện cả 3 bước dạng form, nút Submit tới trang search với tag đã chọn.
- AC2 Given chọn lựa chọn ở bước n When bấm Then sang bước n+1, tiến độ cập nhật, nút Back quay lại giữ lựa chọn cũ; bàn phím Tab/Enter/Space chọn được, focus chuyển vào tiêu đề bước mới.
- AC3 (0.4, L5; sổ 09/11 "Quiz: kết quả mở popup") Given hoàn tất bước 3, có JS When bấm nút xem kết quả Then kết quả mở trong popup (từ 48rem dialog giữa màn, dưới 48rem bottom sheet), không chèn vào trang; popup mở ngay với tiêu đề, câu trả lời đã chọn, trạng thái đang tìm (skeleton lưới) và dòng đếm `role="status"`. Có ≥ 1 sản phẩm khớp đủ tag Then tối đa 4 product card (snippet product-card) lấy qua `{% partial %}`, sản phẩm còn hàng xếp trước; > 4 sản phẩm khớp Then nút "View All N Matches" tới collection lọc đủ 3 tag; ≤ 4 Then nút "Shop All Equipment" thay cho "View All". 0 sản phẩm Then text rỗng cấu hình được + link tới collection mặc định + nút đổi câu trả lời về bước 1. Tải lỗi Then thông báo `role="alert"`, nút thử lại và link mở kết quả dạng trang (`?view=quiz`).
- AC4 (ES1-T136 #6) Given màn hình < 48rem When render Then body map ẩn, chỉ còn danh sách lựa chọn, touch target ≥ 44px.
- AC5 (0.4, L5; sổ 09/11 A11y) Given popup kết quả mở When kiểm Then là dialog có tiêu đề (`aria-labelledby`), focus vào tiêu đề khi mở; đóng bằng nút đóng, Esc, chạm scrim, vuốt xuống (sheet) Then focus về nút mở kết quả, lựa chọn quiz giữ nguyên. Bấm "Retake Quiz" Then popup đóng, lựa chọn bị xoá, quiz về bước 1, focus vào tiêu đề bước 1. Trong lúc popup mở Then popup marketing không tự mở (TE-18 AC2).
- AC6 (0.4, QZ1 sổ 11/11) Given card kết quả của sản phẩm 1 biến thể còn hàng When bấm "Add To Cart" thành công Then popup giữ mở; nút đổi thành "Added" rồi về "Add To Cart" sau 3 s; trong popup có thông báo "Added to cart" `role="status"`; số giỏ ở header tăng đúng; cart drawer không mở và không chuyển cart page với cả hai giá trị `cart_type` (ngoại lệ TE-4 AC8, TE-5 AC6). Lỗi 422 Then câu lỗi Shopify trả về hiện dưới nút trong `role="alert"`. Sản phẩm hết hàng toàn bộ Then nút "Sold Out" disabled.
- AC7 (0.4, QZ2 sổ 11/11) Given card kết quả của sản phẩm nhiều biến thể When bấm "Choose Options" hoặc nút Quick View Then nội dung quickview (TE-3 AC10) thay vào trong cùng dialog, có nút "Back to shortlist", không mở lớp thứ hai; bấm Back Then về lưới kết quả, focus về nút đã bấm; thêm giỏ thành công Then về lưới với thông báo như AC6, popup giữ mở.
- AC8 (0.4, QZ3 sổ 11/11) Given mở URL kết quả dạng trang `?view=quiz` (link chia sẻ, link từ trạng thái lỗi của popup) When render Then có h1 "Your Gear Shortlist", pill câu trả lời hiện tên tag bỏ tiền tố `quiz-`, viết hoa chữ đầu, lưới tối đa 4 card, hành động như popup; 0 sản phẩm Then empty state "No Exact Match".
- AC-H15 (TC-H15, hàng 6) Given theme mới cài When mở `/` Then quiz theo Q1 (mục 3); copy bước 1 đúng 1:506 gồm "Our most-loved feature", "20 seconds".
- AC-H16 (TC-H16, hàng 6) Given store chưa gắn tag khớp quiz When hoàn tất 3 bước Then hiện text rỗng và link collection, 0 console error; tài liệu merchant nêu cần gắn tag.
- AC-H17 (TC-H17, hàng 6) Given CR-10 được duyệt, từ 48rem When bấm vùng trên body map Then chọn đúng lựa chọn Upper body, Core hoặc Lower body như bấm danh sách, dùng được bằng bàn phím.

Mã R: R12 a11y (AC5); R8 không app-like (logic gọn trong theme, không gọi dịch vụ ngoài)

### TE-12 — Block bundle builder và shop the look
Phía: FE1 markup/CSS + BE1 JS · Ước lượng sơ bộ: 13 point (techlead chốt) · Figma 1:636, 1:560

Là khách mua, tôi muốn chọn nhiều sản phẩm và thêm vào giỏ một lần, thấy tổng tiền và mức giảm theo số lượng.

- AC1 (0.4, L3; CTO 06/11 11:15, sổ 07/11) Given bundle builder nhận 1 collection (tối đa 9 sản phẩm) và bảng bậc giảm cấu hình bằng setting, mặc định 2 món 10%, 3 món 15% When chọn/bỏ sản phẩm Then panel "Your Bundle" cập nhật danh sách, tạm tính, mức giảm, tổng, thanh tiến độ theo AC-H18; không có dòng ghi chú giảm giá dưới bundle.
- AC2 Given giảm theo bậc When hiển thị Then chỉ là hiển thị — giảm thật áp ở checkout bằng Shopify automatic discount do merchant tạo; tài liệu merchant ghi rõ; không tự tính giá trong cart.
- AC3 Given bấm "Add Bundle To Cart" / "Add Setup To Cart" When thành công Then gọi `/cart/add.js` với `items[]` một lần, cart drawer (TE-5) mở và refresh qua partial; lỗi 422 (hết hàng) Then báo tên sản phẩm lỗi, không thêm phần còn lại.
- AC4 Given sản phẩm hết hàng When render Then thẻ disabled, có nhãn Sold out, không chọn được.
- AC5 (CR-6) Given shop the look (1:560) When render Then ảnh + tối đa 6 product row (block con), tổng tiền cộng giá variant mặc định, dòng giảm và hotspot theo AC-H19, AC-H20, dùng chung JS add nhiều sản phẩm với bundle builder.
- AC-H18 (0.4, TC-H18, hàng 9) Given mặc định chưa đổi và block có sản phẩm When chọn 1, 2, 3 món Then lần lượt: "còn 1 món để đạt 10%"; dòng giảm 10%; dòng giảm 15% và trạng thái đạt bậc cao nhất; không có dòng ghi chú giảm giá (sổ 07/11).
- AC-H19 (0.4, TC-H19, hàng 7) Given CR-6 được duyệt When render shop the look Then có thẻ "Fits", dòng giảm cùng quy tắc AC-H18, không có dòng ghi chú giảm giá, tổng trừ đúng số tiền giảm tính từ giá thật, row hết hàng không tính vào tổng. KHÔNG CHẮC: Figma 4 món ghi 10%, bậc AC-H18 ra 15%; mặc định theo Figma 10%, chờ ES1-T199 #2.
- AC-H20 (TC-H20, hàng 7) Given CR-6 được duyệt, 4 hotspot When hover, focus hoặc bấm hotspot Then row tương ứng có viền accent; bấm row thì hotspot tương ứng ở trạng thái chọn; dưới 64rem theo mặc định Designer ghi mới.

Mã R: R8 giảm giá thật do discount tự động (AC2), không ghi chú; R12 a11y

### TE-13 — Block featured product có countdown và video demo carousel
Phía: FE1 markup/CSS + BE1 JS · Ước lượng sơ bộ: 8 point (techlead chốt) · Figma 1:759, 1:817

Là merchant, tôi muốn làm nổi bật 1 sản phẩm đang khuyến mãi có thời hạn và cho khách xem video ngắn sản phẩm đang dùng.

- AC1 (0.3, CTO audit (2), sổ 10/11 P5) Given featured product chọn 1 sản phẩm When sản phẩm có metafield `custom.sale_ends_at` Then ngày kết thúc lấy từ metafield; không có metafield Then lấy từ setting ngày giờ kết thúc của block (giờ store). Countdown ngày/giờ/phút/giây hiện khi ngày còn hạn lúc render, biến thể đang chọn có giá gạch (compare at price > price) và còn hàng (PO 06/11, ES1-T155 #2); hết hạn, không có ngày ở cả 2 nguồn, hoặc biến thể không có giá gạch Then ẩn hẳn countdown (không reset, không đếm giả — R8). Hiển thị và hành vi theo component chung TE-4 AC17 (gồm số Liquid in sẵn và "This sale has ended" ở bản 0.4).
- AC2 (0.4, L4: nhãn nút) Given featured product When render Then gallery, giá/giá gạch/% giảm, rating (metafield reviews nếu có, không có thì ẩn), bảng spec 4 dòng từ metafield, "Add To Cart" + View detail; dùng chung logic variant TE-4 (AC13–AC15).
- AC3 Given video carousel nhận tối đa 8 block con `video-card` (Shopify video hoặc URL YouTube/Vimeo + 1 sản phẩm) When render Then video lazy (chỉ tải khi vào viewport), poster có sẵn, bấm mới chạy, không tự chạy kể cả tắt tiếng (ES1-T155 #4); 3 ô số liệu là text setting, mặc định trống và không hiện vì 1:827 ẩn trong Figma (Q5, mục 3).
- AC4 Given video lỗi tải When render Then hiện poster + link sản phẩm, không vỡ layout.
- AC5 (0.4, L1) Given Lighthouse trang chủ When có 2 block này Then vẫn đạt NFR-1 và ngưỡng CI của TE-10 AC1.
- AC-H21 (TC-H21, hàng 11) Given mặc định When render 1920 Then 6 thẻ 264 × 554, đúng copy 1:817, không có 3 ô số liệu, link, nhãn (theo Q5); poster hiển thị, bấm mới chạy.
- AC-H22 (0.4, TC-H22, hàng 10) Given featured product trên `/` có JS When đổi variant Then giá, nút, ảnh cập nhật không reload; "Add To Cart" mở drawer, số giỏ tăng đúng.
- AC-H23 (0.3, TC-H23 sửa) Given store dev, metafield `custom.sale_ends_at` của sản phẩm featured cách dưới 24 giờ When render `/` Then ô ngày ẩn, 3 ô giờ phút giây giảm mỗi giây, F5 không reset; quá hạn lúc render thì không có countdown. Given sản phẩm không có metafield và setting ngày còn hạn Then countdown theo setting.

Mã R: R8 không fake urgency; R6 Lighthouse; R12 a11y

### TE-14 — Sẵn sàng cho Sidekick, Canvas và agent (Editions Fall '26)
Phía: FE (docs + Liquid) · Ước lượng sơ bộ: 5 point (techlead chốt) · Nguồn: Báo cáo Editions Fall '26 checklist mục 1, 2, 10

Là CTO, tôi muốn theme có hướng dẫn máy đọc được và quy ước sẵn cho RTL để Sidekick trong Canvas và agent sửa theme không phá kiến trúc.

- AC1 Given gốc theme When kiểm Then có `AGENTS.md` (viết lại theo outline Shopify cho base theme Canvas: non-negotiables, composition model, block/snippet contracts, styling và tokens, JavaScript, translations, decision guide; mỗi quy tắc có lý do) ≤ 50 KB, đúng tên viết hoa; liệt kê đủ block hiện có.
- AC2 Given gốc theme When kiểm Then có `DESIGN.md` ghi ý đồ thiết kế Efitco: token (màu, font, khoảng cách, bo góc) lấy từ docs/tokens.json, nhịp trang, quy tắc ảnh, giọng chữ CTA, các quyết định CTO (accent #C8400E AA, xám #6B6B6B) ≤ 50 KB.
- AC3 Given 10 yêu cầu Sidekick mẫu của checklist Canvas When chạy trên yum-dev Then Sidekick đọc 2 file và kết quả qua theme check 0 lỗi, giữ cấu trúc block-first.
- AC4 Given mọi CSS trong assets/ When kiểm Then dùng logical properties (margin-inline, padding-inline-start, inset-inline-*, text-align: start/end) thay left/right, để bật RTL sau không phải viết lại; icon mũi tên/slider đảo bằng `:dir(rtl)`.

Mã R: Canvas 5 bước; R8 nhất quán; Editions Fall '26 #1, #2, #10

### TE-15 — Block collection list và shop by level
Phía: FE + BE (next/back) · Ước lượng: 10 point theo plan ES1-T169 (FE1 4, BE1 3, FE2 3) · Figma 1:395, 1:464 · CR-2

Là khách, tôi muốn thấy 5 danh mục và 3 trình độ tập ngay dưới hero để vào đúng collection từ trang chủ.

- AC-H8 (TC-H8, hàng 3) Given block có 5 collection When render 1920 Then 5 card 336 × 270 đúng tên; bấm next/back cuộn 1 card; card link tới đúng collection.
- AC-H9 (TC-H9, hàng 3) Given dưới 5 collection hoặc 0 collection When render Then chỉ hiện số card có, ẩn next/back khi không còn gì để cuộn; 0 collection thì storefront không render.
- AC-H10 (TC-H10, hàng 4b) Given 3 card trình độ gắn collection When render Then badge số sản phẩm bằng `products_count` của collection, số ít nhiều đúng locale; store dev có 24 sản phẩm để khớp "24 Products". KHÔNG CHẮC: Figma chỉ card Beginner có node số sản phẩm, xem ES1-T198 #2.

Mã R: R3, R14 (AC-H1, H2 áp chung); R12 a11y; R7 collection

### TE-16 — Block blog posts
Phía: FE · Ước lượng: 4 point theo plan ES1-T169 · Figma 1:1022 · CR-4

Là khách, tôi muốn thấy 5 bài blog trên trang chủ kèm nhãn và thời gian đọc để chọn bài từ trang chủ.

- AC-H26 (TC-H26, hàng 14) Given blog có từ 5 bài When render 1920 Then 5 card 300 × 448, ảnh, nhãn, tiêu đề, thời gian đọc; card link tới đúng bài; từ 5 card tràn thì cuộn được.
- AC-H27 (TC-H27, hàng 14) Given blog dưới 5 bài hoặc không có nguồn thời gian đọc When render Then hiện số bài có, ẩn dòng thời gian đọc; 0 bài thì storefront không render.

Thời gian đọc: tính trong Liquid từ số từ của bài, 200 từ/phút (D8 của ES1-T169).
Mã R: R3, R14 (AC-H1, H2 áp chung); R12 a11y; R7 blog

### TE-17 — Trang chủ giống Figma: nội dung mặc định, dữ liệu store dev, cổng đo
Phía: FE + QA + DevOps + Designer · Ước lượng: 25 point dev theo plan ES1-T169 (FE0 3, FE1a 6, FE1b 5, FE1c 6, FE2 5) · Figma 1:359 · CR-1

Là CTO, tôi muốn `/` trên store dev giống Figma và merchant mới cài thấy sẵn copy, số liệu Figma để đo được yêu cầu "giống 100% Figma" (CTO 06/11 11:12, 11:14).

- AC-H1 (TC-H1) Given `/` trên store dev đủ dữ liệu When đọc thứ tự block trong DOM Then đúng 16 hàng inventory theo y, 0 block ngoài danh sách.
- AC-H2 (TC-H2) Given bảng nội dung lấy từ node hiện trong Figma When so từng chuỗi với text block đã bỏ khoảng trắng thừa, so sau `text-transform` Then khớp 100%, trừ giá trị động đã che và ngoại lệ đã ký.
- AC-H3 (TC-H3) Given viewport 1920, cùng scale với ảnh export, vùng động đã che When so từng block với ảnh node Then kích thước block lệch tối đa 2 px, số pixel khác tối đa 1%, sổ chênh lệch 0 mục mở.
- AC-H4 (TC-H4) Given từng giá trị font, cỡ chữ, màu, bo góc, khoảng cách của node When đọc computed style Then bằng giá trị Figma, trừ ngoại lệ đã ký.
- AC-H5 (TC-H5) Given theme mới cài, chưa mở editor When mở `/` Then copy và số liệu Figma của các hàng đã có setting chữ hiển thị, gồm "360+" ở hàng 15 và "Trusted by 10,000+ athletes" ở hàng 2; 0 chữ "Add a", "Customer name" hướng dẫn.
- AC-H6 (TC-H6, tay trên editor) Given merchant sửa 1 setting chữ trong editor When lưu và mở `/` Then giá trị merchant hiển thị thay mặc định, ở cả block lặp (faq-item, testimonial-item, quiz-step, 2 image-with-text).
- AC-H7 (TC-H7) Given từng control tương tác trên `/` When focus bằng bàn phím và hover Then có focus ring theo DESIGN.md, đổi trạng thái hover nếu control có quy định; axe 0 serious, 0 console error.
- AC-H35 (TC-H35) Given `/` ở 360 và 768 When đo từng block Then không tràn ngang, control ≥ 44px, không chồng chữ, theo ES1-T116 #5, #6, ES1-T135 #4, ES1-T145 #1, #6, ES1-T154 #2, #8; TE-15, TE-16, CR-3 có mặc định Designer ghi trước khi làm.

Ngưỡng 2 px, 1% chờ hiệu chuẩn ở cổng G1; chỉ CTO nới được. Chỉ so node có bản thân và mọi node cha không `visible:false`; ảnh export thắng snapshot khi lệch.
Mã R: R3, R14 (AC-H1, H2); R8 (AC-H5, xem TE-10 AC3); R12 (AC-H7, H35)

### TE-18 — Popup marketing: newsletter, before you leave, big offer (0.3, mới)
Phía: FE1 markup/CSS + BE1 JS · Ước lượng: techlead chốt · Nguồn: sổ 09/11 (overlay cần có), 10/11 MK1–MK6, CTO audit (2), (3); `docs/ui-spec/marketing-popups.md` (ES1-T263); trả lời ES1-T273 #1; (0.4) ES1-T274, ES1-T297 #2, #3

Là merchant, tôi muốn 3 popup marketing bật sẵn khi cài theme để thu email và giữ khách sắp rời trang mà không làm giảm điểm Lighthouse và không chồng popup.

- AC1 (MK1, MK3, sổ 09/11 Performance) Given theme mới cài When kiểm settings Then newsletter popup, before you leave, nút Big Offer đều bật. Given trang vừa tải When chưa có tương tác Then không popup nào mở. Newsletter Then mở khi ở trang ≥ 10 s VÀ đã cuộn ≥ 50% (2 setting). Before you leave trên thiết bị có chuột Then mở khi con trỏ rời mép trên cửa sổ sau ≥ 15 s ở trang; trên màn cảm ứng Then mở khi cuộn ngược ≥ 30% chiều cao màn trong < 500 ms, sau khi đã cuộn ≥ 50% trang và ≥ 15 s; không dùng `history.pushState` chặn nút Back. Đang gõ trong ô nhập Then không popup nào tự mở.
- AC2 (MK3, MK4, MK5) Given có 1 lớp đang mở (popup, thẻ big offer, cart drawer, menu, search, quickview, dialog quiz) When popup khác đủ điều kiện Then không mở chồng: newsletter vào hàng đợi; before you leave chờ tín hiệu rời trang kế tiếp. Lớp đóng Then sau 3 s popup đang chờ có ưu tiên cao nhất mở nếu điều kiện còn đúng (ưu tiên: before you leave 1, newsletter 2). 2 popup đủ điều kiện cùng lúc Then before you leave mở, newsletter chờ. Nút Big Offer không phải popup, không vào hàng đợi; thẻ big offer khách tự mở chiếm lớp.
- AC3 (MK3) Given popup tự mở đã hiện trong phiên When điều kiện đúng lần nữa Then không mở lại trong phiên (≤ 2 popup tự mở mỗi phiên). Newsletter đóng không đăng ký Then ẩn 7 ngày (setting); đã đăng ký Then không hiện nữa. Before you leave Then ẩn 1 ngày (setting). Popup tính là đã hiện ngay khi mở.
- AC4 Given trang 404, cart, password, gift card When đủ điều kiện Then không popup tự mở nào hiện. Given khách đăng nhập có `customer.accepts_marketing` = true Then không render newsletter popup.
- AC5 (MK6) Given before you leave mở When giỏ có hàng Then nội dung giỏ: tối đa 2 dòng hàng (1 dòng dưới 48rem), Subtotal, nút "Check Out Now" tới checkout và nút tiếp tục mua. Giỏ rỗng, setting mã giảm giá không rỗng, khách chưa đăng ký newsletter trong phiên Then nội dung mã + nút copy mã. Giỏ rỗng và không có mã, hoặc giỏ rỗng và đã đăng ký newsletter trong phiên Then không mở.
- AC6 (MK2, CTO audit (2), (3)) Given sản phẩm của setting Big Offer còn hàng, có giá gạch, chưa hết giờ When khách cuộn ≥ 25% (setting) Then nút nổi "Big Offer" hiện góc dưới trái; thiếu một điều kiện Then không render nút. Trang sản phẩm ở mọi mốc và trang cart Then không có nút. Trang chủ ở 360 Then nút nằm trên thanh dính bundle, không chồng nhau. Rê chuột 150 ms, chạm, hoặc Enter/Space trên nút Then mở thẻ deal (dưới 48rem: bottom sheet có scrim); Esc Then đóng và trả focus về nút. Countdown trong thẻ theo component chung TE-4 AC17, ngày từ metafield `custom.sale_ends_at` của sản phẩm, không có metafield Then theo setting ngày của block; không có ngày hợp lệ Then thẻ không có countdown, vẫn có sản phẩm, giá, nút "Shop The Deal".
- AC7 (0.4, TE-1 AC6; ES1-T274 CTO 11/11) Given newsletter popup When gửi email Then dùng customer form của Shopify như footer; email sai Then lỗi gắn với ô (`aria-invalid`), focus về ô; đang gửi Then nút `aria-busy`, giữ bề rộng; sau khi gửi Then popup giữ mở để hiện kết quả. Thành công Then thay form bằng thông báo thành công trong `role="status"` và ghi nhận đã đăng ký. Email đã có trong danh sách Then thay form bằng trạng thái "You're Already Subscribed" trong `role="status"` (không phải lỗi), ghi nhận đã đăng ký. Lỗi gửi Then thông báo `role="alert"`, giữ email đã nhập. Cách nhận biết email đã đăng ký: Tech Lead chốt (ES1-T301 #2).
- AC8 (sổ 09/11 A11y) Given popup tự mở When mở Then là dialog có tiêu đề (`aria-labelledby`) và nút đóng có tên riêng; focus vào tiêu đề; đóng được bằng nút đóng, Esc, chạm scrim, vuốt xuống trên sheet; đóng Then focus về vị trí trước đó; dưới 48rem là bottom sheet cao ≤ 60% màn; vùng chạm control ≥ 44px; `prefers-reduced-motion: reduce` Then không trượt, không scale.
- AC9 (NFR-4, NFR-1) Given không JS When tải trang Then không popup nào, form newsletter footer vẫn gửi được. Given chạy lhci trên `/` When đo Then popup không là phần tử LCP, CLS do popup và nút Big Offer = 0, ảnh trong popup chỉ tải khi popup mở.

Settings (0.3, theo marketing-popups.md, default theo MK1, MK3; 0.4: Discount code theo ES1-T297 #2):

| Block | Setting | Kiểu | Default | Giới hạn |
| --- | --- | --- | --- | --- |
| newsletter-popup | Show newsletter popup | checkbox | true | — |
| newsletter-popup | Delay in seconds | range | 10 | 5–60, bước 5 |
| newsletter-popup | Scroll depth | range (%) | 50 | 0–90, bước 10 |
| newsletter-popup | Days before showing again | range | 7 | 1–30 |
| newsletter-popup | Show on mobile | checkbox | true | — |
| exit-popup | Show before you leave popup | checkbox | true | — |
| exit-popup | Minimum time on page | range (s) | 15 | 5–60 |
| exit-popup | Show on mobile | checkbox | true | — |
| exit-popup | Days before showing again | range | 1 | 1–30 |
| exit-popup | Discount code | text | rỗng | merchant tự điền; store dev dùng mã `WELCOME15` (ES1-T298), không đổi default |
| offer-popup | Show big offer button | checkbox | true | — |
| offer-popup | Product | product | sản phẩm demo truyền từ layout | phải có giá gạch |
| offer-popup | Sale end date | text | rỗng | YYYY-MM-DD HH:MM giờ store; chỉ dùng khi sản phẩm không có metafield `custom.sale_ends_at` |
| offer-popup | Scroll depth | range (%) | 25 | 0–90 |
| offer-popup | Days before showing again | range | 1 | 1–30, khi khách bấm × trên nút |

Setting còn lại (ảnh, heading, text, nhãn nút, consent, vị trí nút, mở bằng hover) theo marketing-popups.md §2–§4; label sentence case, không `&`. Gửi mã giảm giá qua Shopify Email là cấu hình của merchant, ngoài phạm vi theme (ES1-T297 #3, TE-10 AC-H33).

Mã R: R4.9 newsletter; R8 không fake urgency, không app-like; R12 a11y (dialog, focus, vùng chạm); R6 Lighthouse

Quy ước chung cho 4 story:
- AC đánh dấu "(0.5)" là mới trong bản này. Mã R theo `docs/checklist-theme-store.md`.
- Nội dung mẫu (ES1-T308 #1): AC "theme mới cài" kiểm theme sạch (setting chữ rỗng, không handle `figma-*`, không sản phẩm/collection chọn sẵn); AC "store dev đã cấu hình" kiểm nội dung theo spec do fixture TE-17-R2-QA0 (ES1-T331) đặt trên hoa-qua-nhap-khau (efitco-ai-dev).
- Mốc đo: 360, 768, 1280, 1920 (sổ 09/11). Lighthouse theo NFR-1; SEO chỉ tính ở blog, article, page (sổ 10/11).
- Không JS: mọi luồng chính (thêm giỏ, lọc tag, gửi bình luận, gửi liên hệ, mật khẩu, menu) chạy bằng link/form (NFR-4).

Ưu tiên (ES1-T308 #4, ES1-T310 #4, ES1-T311): TE-19 Should, cắt cuối trong nhóm Should (sau TE-18, mega ảnh/sản phẩm, B2B, recent searches). TE-20 Must; phần mở rộng (nav chủ đề, bài nổi bật, bài liên quan: AC1 phần bài nổi bật, AC3, AC13) cắt thứ 2 nếu thiếu giờ FE. TE-21 Must, cuối Sprint 4. TE-22 Must; AC5 (ảnh danh mục, sản phẩm nổi bật trong menu) là Should, TE-22-R2-FE3.


### TE-19 — Upsell giỏ hàng (0.5, mới)
Phía: FE1 markup/CSS (TE-19-R2-FE1, ES1-T371) + BE1 JS (TE-19-R2-BE1, ES1-T372) + QA1 (TE-19-R2-QA1, ES1-T376) · Ước lượng: techlead (task-split ES1-T307) · Ưu tiên: Should · Nguồn: ES1-T247, sổ 10/11 G2 (complementary, tối đa 4), `cart.md` §3.8, §5, §6; `mini-cart-quickview.md` §1, §2, §5 (drawer, chờ ES1-T422 #3)

Là khách đang xem giỏ, tôi muốn thấy tối đa 4 sản phẩm dùng kèm với hàng trong giỏ và thêm vào giỏ ngay tại trang giỏ, để không phải quay lại collection tìm phụ kiện.

- AC1 (0.5) Given cart page có ≥ 1 dòng hàng, setting "Show recommendations" bật, Product Recommendations API intent complementary trả ≥ 1 sản phẩm cho sản phẩm của dòng đầu When trang tải xong Then dưới khu giỏ (sau accelerated checkout, cách `--section-gap`: 48 ở 360 và 768, 120 ở 1280 và 1920) có khối upsell: eyebrow (chỉ khi setting eyebrow không rỗng), h2, tối đa N card (N = "Products to show", 2–4, mặc định 4); không card nào là sản phẩm đã có trong giỏ; card theo foundation §9 (như TE-3), tên sản phẩm hiện đủ, không cắt.
- AC2 (0.5) Given một trong các điều kiện: API trả 0 sản phẩm, API lỗi, giỏ rỗng, setting "Show recommendations" tắt When render Then không có khối upsell, không chừa chỗ cho khối (skeleton đã hiện thì gỡ sau khi tải xong). Given setting "Show recommendations on mobile" tắt When viewport dưới 48rem Then không có khối upsell.
- AC3 (0.5, `cart.md` §2, §3.8; sổ 09/11 hàng ngang) Given khối upsell có 4 card When đo Then 360: hàng vuốt, thấy 2 card và mép card 3, có thanh tiến trình, không chevron; 768: thấy 3 card và 25% card 4, có 2 chevron tròn 52px ở đầu khối và thanh tiến trình; 1280: lưới 4 card rộng 292px, không chevron, không thanh tiến trình; 1920: lưới 4 card rộng 336px. Hàng vừa khung, không còn card để cuộn Then không chevron, không thanh tiến trình (HD3).
- AC4 (0.5) Given card của sản phẩm 1 biến thể còn hàng When bấm "Add To Cart" (icon túi + chữ, cao 44px, tên truy cập "Add {tên sản phẩm} to cart") Then thêm 1 đơn vị biến thể đó vào giỏ. Có JS Then nút ở trạng thái đang thêm (`aria-busy`, giữ bề rộng), sau khi thêm: danh sách dòng hàng, tổng tiền và số giỏ ở header cập nhật không tải lại trang, có dòng mới, toast thành công (foundation §17), card vừa thêm rời khối upsell, sự kiện `shopify:cart:lines-update` được dispatch (TE-5 AC7). Không JS Then form gửi thêm giỏ, trang `/cart` tải lại có dòng mới. Lỗi 422 Then câu lỗi Shopify trả về hiện dưới nút trong `role="alert"`, giỏ không đổi.
- AC5 (0.5) Given card của sản phẩm nhiều biến thể When render Then nút là link "Choose Options" tới trang sản phẩm, cao 44px, tên truy cập có tên sản phẩm.
- AC6 (0.5, `cart.md` §3.8, §8) Given cart page có hàng When trang tải Then khối upsell nạp sau khi trang hiển thị, giữ chỗ bằng skeleton 4 card đúng kích thước card (CLS do khối = 0); ảnh card `loading="lazy"` có width/height; phần tử LCP của trang không thuộc khối upsell.
- AC7 (0.5, `cart.md` §6) Given trình đọc màn hình và bàn phím When duyệt cart page Then thứ tự heading: h1 "Cart" → h2 tóm tắt đơn → h2 khối upsell → h3 tên card; mỗi nút thêm giỏ và link "Choose Options" có tên riêng chứa tên sản phẩm; chevron có tên truy cập, ở đầu/cuối hàng `aria-disabled="true"`; vùng chạm nút 44px, chevron 52px; focus thấy được.
- AC8 (0.5, ES1-T308 #1, ES1-T422 #1) Given theme mới cài When mở cart page có hàng và API trả sản phẩm Then setting eyebrow và heading rỗng: không có eyebrow, h2 dùng chuỗi locale của theme. Given store dev đã cấu hình (eyebrow "Complete your setup", heading "You May Also Need") When mở cart page Then hiện đúng 2 chuỗi đó.
- AC9 (0.5, `mini-cart-quickview.md` §1.2.5, §2; chưa có task R2, sau R1 theo mặc định ES1-T422 #3) Given cart drawer mở, giỏ ≥ 1 dòng, setting "Show product recommendations" của drawer bật When API complementary của dòng đầu trả ≥ 1 sản phẩm chưa có trong giỏ Then sau mục ghi chú đơn có h3 (setting heading, rỗng dùng chuỗi locale) và tối đa 2 hàng sản phẩm (ảnh 64, tên, giá, nút 44px). Sản phẩm 1 biến thể: nút "Add" thêm 1, drawer và số giỏ cập nhật không tải lại. Sản phẩm nhiều biến thể: nút "Choose" đóng drawer rồi mở quickview (TE-3 AC10); thêm giỏ xong drawer mở lại; tại mỗi thời điểm chỉ 1 lớp mở. Đang tải Then 2 hàng skeleton đúng kích thước; 0 kết quả hoặc lỗi Then không có khối.

Settings (0.5; label sentence case, `t:` trong `locales/en.default.schema.json`):

| Block | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| cart-upsell (cart page) | Show recommendations | checkbox | true | tắt thì không render khối | `cart.md` §5, G2 |
| cart-upsell | Recommendations eyebrow | text | rỗng | rỗng thì ẩn; store dev "Complete your setup" | `cart.md` §5; ES1-T308 #1; ES1-T422 #1 |
| cart-upsell | Recommendations heading | text | rỗng | rỗng thì dùng chuỗi locale; store dev "You May Also Need" | như trên |
| cart-upsell | Products to show | range | 4 | 2–4, bước 1 | `cart.md` §5, G2 |
| cart-upsell | Show recommendations on mobile | checkbox | true | tắt thì không có khối dưới 48rem | `cart.md` §5 |
| cart-drawer | Show product recommendations | checkbox | true | 2 sản phẩm; AC9 sau R1 | `mini-cart-quickview.md` §5; ES1-T422 #3 |
| cart-drawer | Recommendations heading | text | rỗng | ≤ 30 ký tự; rỗng dùng chuỗi locale; store dev "Pairs Well With" | như trên; ES1-T422 #1 |

Không thêm setting chọn intent: intent complementary cố định (G2). Setting "Empty cart collection", "Show sticky checkout bar on mobile" của `cart.md` §5 thuộc TE-5 (ES1-T395).

Mã R: R4.11 complementary products; R7.5 cart; R12 (AC7); R17 (AC6); R6.1 Lighthouse (AC6)


### TE-20 — Blog và bài viết (0.5, mới; thay TE-9 AC3)
Phía: FE (TE-20-R2-FE1 ES1-T381, TE-20-R2-FE2 ES1-T382; phần tuân thủ TS-FE5 ES1-T403, TS-FE7 ES1-T407) + QA1 (TE-20-R2-QA1, ES1-T385) · Ước lượng: techlead · Ưu tiên: Must; AC3, phần bài nổi bật của AC1, AC13 cắt được theo ES1-T311 · Nguồn: `blog.md`, `article.md`, sổ 10/11 B1–B3, A1–A3, sổ 11/11 tuân thủ (3), (4), (5), PG1

Là khách, tôi muốn xem danh sách bài theo chủ đề, đọc trọn một bài, để lại bình luận và mở tiếp bài liên quan, để tìm được hướng dẫn tập luyện mà không rời store.

Trang blog (`templates/blog.liquid` → `container` → block `blog-articles`):

- AC1 (0.5, `blog.md` §1) Given blog có ≥ 2 bài, đang ở trang 1, không lọc tag, setting "Feature the newest article" bật When mở blog Then thứ tự: breadcrumb `Home / {blog.title}` (TE-22 AC9); eyebrow (chỉ khi setting không rỗng); h1 `{blog.title}`; dòng số bài ("N articles", số ít/nhiều theo locale); nav chủ đề (AC3); bài nổi bật là bài mới nhất: ảnh 4/3 bo 16, tag đầu, h2 tiêu đề là link duy nhất của khối, `excerpt_or_content` bỏ HTML tối đa 30 từ (setting "Show excerpt"), meta ngày · thời gian đọc; lưới card các bài còn lại; phân trang (AC5).
- AC2 (0.5, sổ 11/11 (3), (4); `blog.md` §1.6, §3) Given trang blog When render lưới card Then mỗi card: ảnh 3/4 bo 16 có gradient tối, tag đầu (không là link), tiêu đề h2 hiện đủ (không `line-clamp`, không "…"), `excerpt_or_content` bỏ HTML tối đa 20 từ, meta "{ngày} · {N} min read" (ngày theo "Show date", thời gian đọc theo "Show reading time", 200 từ/phút, D8); mỗi card đúng 1 link, tên link = tiêu đề bài. Lưới: 1 cột ở 360 (card 320 × 427), 2 cột ở 768, 3 cột từ 64rem tới dưới 80rem, 4 cột từ 80rem (292 × 389 ở 1280, 336 × 448 ở 1920). Bài không ảnh Then nền `--color-background-dark`, chữ 17.4:1. Bài không tag Then không pill. `article.content` rỗng Then chỉ còn ngày.
- AC3 (0.5, `blog.md` §1.4, §4) Given blog có ≥ 1 tag và setting "Show topic filter" bật When render Then `<nav aria-label="Blog topics">` chứa link "All" (tới `blog.url`) và mỗi tag 1 link `<a href>` tới trang tag; mục đang xem có `aria-current="page"`, không dùng `role="tab"`. Given bấm 1 tag When trang tag tải Then breadcrumb thêm tag, meta "N articles tagged {tag}", không có bài nổi bật, lưới bắt đầu ngay sau nav. Không JS Then lọc bằng link, kết quả như có JS. Blog không có tag Then không render nav. Ở 360 nav là 1 hàng cuộn ngang, trang không cuộn ngang kể cả zoom 200%.
- AC4 (0.5, `blog.md` §4) Given blog 0 bài When render Then không nav, không dòng số bài; khối rỗng: h2 "No Articles Yet", 1 câu gợi ý, nút primary "Explore Equipment" tới `routes.all_products_collection_url`, link "Back to homepage". Given trang tag không còn bài Then giữ nav, h2 "No Articles On This Topic", nút primary "View All Articles" tới `blog.url`. Given setting "Feature the newest article" tắt, hoặc trang ≥ 2 Then không có bài nổi bật.
- AC5 (0.5, TE-6 AC6, `blog.md` §5) Given số bài > "Articles per page" (6–24, bước 3, mặc định 9) When render Then phân trang theo TE-6 AC6 (snippet chung), link trang mang neo `#blog-grid`; 1 trang Then không render phân trang.
- AC6 (0.5, `blog.md` §7) Given trang blog When đo Lighthouse desktop và mobile Then đạt NFR-1 (SEO 100); có bài nổi bật Then ảnh bài nổi bật là ảnh duy nhất `loading="eager"` + `fetchpriority="high"`; trang tag, trang ≥ 2 hoặc tắt bài nổi bật Then ảnh card đầu eager + high; mọi ảnh khác lazy, có width/height; 0 file JS riêng của trang; ảnh và tiêu đề của phần tử LCP không có hiệu ứng hiện dần. `<title>` gồm `{blog.title}`, trang tag thêm "Tagged {tag}", trang ≥ 2 thêm "Page N".
- AC7 (0.5, `blog.md` §6) Given trình đọc màn hình When duyệt blog Then đúng 1 h1, bài nổi bật và card là h2 (snippet card nhận `heading_tag: 'h2'`); ngày trong `<time datetime>`; vùng chạm link chủ đề 44px dưới 80rem, 40px từ 80rem; chữ trên ảnh card ≥ 4.5:1 với ảnh nền trắng.
- AC8 (0.5, `blog.md` §2, §10 #2) Given block blog posts trang chủ (TE-16) When render sau thay đổi snippet card Then card trang chủ không đổi: không ngày, không excerpt, tiêu đề h3, đúng AC-H26, AC-H27.

Trang bài viết (`templates/article.liquid` → 3 `container`: `article-main`, `article-comments`, `related-articles`):

- AC9 (0.5, sổ 10/11 A1; `article.md` §1, §3) Given bài có ảnh, setting "Show cover image" bật When render Then ảnh bìa là thẻ bo 16 dưới header, không chữ và không lớp tối đè lên ảnh; khung 320 × 240 ở 360, 728 × 410 ở 768, 1240 × 570 ở 1280, 1416 × 651 ở 1920; ảnh `loading="eager"` + `fetchpriority="high"`, alt = alt ảnh trong Shopify. Given bài không ảnh hoặc setting tắt Then không khung ảnh, cột đọc bắt đầu ngay dưới header, không ảnh nào eager.
- AC10 (0.5, `article.md` §1.3, §4; sổ 11/11 (5)) Given bài viết When render Then cột đọc rộng tối đa 46rem (736px từ 1280) gồm: breadcrumb `Home / {blog.title} / {article.title}`; tag đầu là link tới trang tag (vùng chạm 44px); h1 tiêu đề; meta: ngày (`Show date`) · "By {article.author}" (`Show author`) · thời gian đọc (`Show reading time`, ẩn khi content rỗng); `article.content` trong `.rte` chung; cuối bài "Topics" + mọi tag dạng link (`Show topics`, bài không tag thì ẩn) và link "Back to {blog.title}" cao 44px.
- AC11 (0.5, `article.md` §1.4; TE-6 AC6, PG1) Given `blog.comments_enabled?` sai When render Then không có khu bình luận. Given bật When render Then h2 "{n} Comments" (0 bình luận: h2 "Comments" + câu chưa có bình luận); danh sách `<ol>` mỗi mục tên, ngày `<time>`, nội dung; > 10 bình luận Then phân trang 10 mục/trang theo TE-6 AC6, `<nav>` tên "Comment pages", link mang neo `#comments`.
- AC12 (0.5, sổ 10/11 A3, sổ 11/11 audit B #24; `article.md` §5) Given form bình luận (Name*, Email* gợi ý "Not published.", Comment*, nút "Post Comment") When gửi Then: thiếu hoặc sai trường → hộp tóm tắt `role="alert"` "Check {n} fields" nhận focus, câu lỗi dưới từng trường (`aria-invalid`, `aria-describedby`), giữ chữ đã nhập; thành công và `blog.moderated?` → hộp `role="status"` "Thanks, your comment is in review" nhận focus, ô nhập rỗng; thành công, blog không duyệt → hộp "Your comment is posted." và bình luận mới ở cuối danh sách. Blog có duyệt Then trên form có câu "Comments are reviewed before they appear.". Không JS Then form gửi và trang tải lại về `#comments` với cùng kết quả. Mọi trường có `<label for>`, `autocomplete` name/email.
- AC13 (0.5, sổ 09/11 hàng ngang, HD3; `article.md` §1.5, §3) Given blog có ≥ 2 bài When render bài viết Then khối bài liên quan: eyebrow (setting, rỗng thì ẩn), h2 (setting, rỗng dùng chuỗi locale), tối đa N card (setting "Articles to show" 2–8, mặc định 4), không gồm bài đang xem; chọn bài cùng tag đầu, thiếu thì bù bài mới nhất. 360: vuốt, thấy mép card kế, không chevron; 768: chevron 52px ở đầu khối + thanh tiến trình; hàng vừa khung Then lưới tĩnh, không chevron, không thanh tiến trình. Blog chỉ có 1 bài Then không render khối. Tiêu đề card hiện đủ, card là h3.
- AC14 (0.5, `article.md` §7; R11) Given bài viết When kiểm HTML Then `<title>` "{article.title}", meta description = `excerpt_or_content` bỏ HTML, tối đa 160 ký tự; đúng 1 khối JSON-LD `BlogPosting` (headline, image, datePublished, author) và đúng 1 khối `BreadcrumbList` (TE-22 AC12); Rich Results Test 0 lỗi. Given đo Lighthouse Then đạt NFR-1 (SEO 100); có ảnh bìa Then ảnh bìa là LCP; không ảnh bìa Then LCP là h1.
- AC15 (0.5, ES1-T308 #1, ES1-T422 #1) Given theme mới cài When mở blog và bài viết Then eyebrow blog, eyebrow và heading bài liên quan rỗng: không eyebrow, h2 bài liên quan dùng chuỗi locale; không chuỗi chứa tên thương hiệu cứng. Given store dev đã cấu hình When mở `/blogs/{blog demo}` và 1 bài Then eyebrow "From the Efitco blog", heading "More Training Tips" hiển thị đúng.

Settings (0.5):

| Block | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| blog-articles | Eyebrow | text | rỗng | rỗng thì ẩn; store dev "From the Efitco blog" | `blog.md` §2; ES1-T308 #1 |
| blog-articles | Show topic filter | checkbox | true | blog không tag thì tự ẩn | `blog.md` §2 |
| blog-articles | Feature the newest article | checkbox | true | chỉ trang 1, không lọc tag | `blog.md` §2, B1 |
| blog-articles | Articles per page | range | 9 | 6–24, bước 3 | `blog.md` §2 |
| blog-articles | Show excerpt | checkbox | true | chỉ bài nổi bật; card trang blog luôn có excerpt (sổ 11/11 (4)) | `blog.md` §1.6, §2 |
| blog-articles | Show date | checkbox | true | | `blog.md` §2, B2 |
| blog-articles | Show reading time | checkbox | true | content rỗng thì ẩn | `blog.md` §2 |
| article-main | Show cover image | checkbox | true | tắt thì LCP là h1 | `article.md` §2 |
| article-main | Show author | checkbox | true | | `article.md` §2 |
| article-main | Show date | checkbox | true | | `article.md` §2 |
| article-main | Show reading time | checkbox | true | content rỗng thì ẩn | `article.md` §2 |
| article-main | Show topics | checkbox | true | bài không tag thì ẩn | `article.md` §2 |
| related-articles | Eyebrow | text | rỗng | rỗng thì ẩn; store dev "From the Efitco blog" | `article.md` §2; ES1-T422 #1 |
| related-articles | Heading | text | rỗng | rỗng dùng chuỗi locale; store dev "More Training Tips" | như trên |
| related-articles | Articles to show | range | 4 | 2–8 | `article.md` §2 |

`article-comments` không có setting: bật/tắt, duyệt bình luận ở admin Shopify. Snippet `article-card` thêm 2 tham số (không phải setting): `heading_tag` (mặc định h3), `show_date` (mặc định false).

Mã R: R7.7 blog/article (title, image, excerpt_or_content, published_at, comments paginate); R8 RTE nhất quán (AC10); R11 SEO, rich snippets (AC6, AC14); R12 (AC3, AC7, AC12, AC13); R17 (AC6, AC9); R6.1, R6.2 (AC6, AC14)


### TE-21 — Trang phụ: page, contact, 404, password, gift card (0.5, mới; thay TE-9 AC2)
Phía: FE (TE-21-R2-FE1 ES1-T383, TE-21-R2-FE2 ES1-T384; phần tuân thủ TS-FE7 ES1-T407, TS-FE8 ES1-T408) + BE (TS-BE1 ES1-T410: QR, copy, print gift card) + QA1 (TE-21-R2-QA1, ES1-T386) · Ước lượng: techlead · Ưu tiên: Must, cuối Sprint 4 · Nguồn: `page.md`, `404.md`, `password.md`, `gift-card.md`, sổ 10/11 PG1–PG2 (page), E1, PW1–PW2, GC1; audit shopify-audit-1111 B #6, #32

Là khách, tôi muốn trang nội dung đọc được trên mọi màn, gửi được câu hỏi qua form liên hệ, đi tiếp được khi vào link hỏng, để lại email khi store đang khoá và dùng được gift card đã nhận.

Page và contact:

- AC1 (0.5, `page.md` §2, §4; PG2 10/11) Given page dùng template mặc định When render Then breadcrumb `Home / {page.title}` (TE-22 AC9), đúng 1 h1, `page.content` trong `.rte` chung; cột đọc rộng 720px căn giữa từ 768, đoạn văn ≤ 65ch, cỡ chữ 16 lh 1.7. Given `page.content` rỗng Then chỉ có h1, không khung `.rte` rỗng; trong theme editor có câu gợi ý cho merchant, storefront không có câu đó.
- AC2 (0.5, sổ 11/11 (5); `page.md` §5) Given nội dung page có bảng rộng, ảnh, link trong đoạn When xem ở 360 và zoom 200% Then trang không cuộn ngang (bảng cuộn ngang trong khung riêng); link trong đoạn có gạch chân; ảnh trong nội dung `loading="lazy"`.
- AC3 (0.5, PG1 10/11; audit B #6; `page.md` §1, §2, §4) Given page gán template `page.contact` When render Then thứ tự DOM: breadcrumb, h1, intro (`page.content` trong `.rte`), form, aside. Form: h2 + câu "* Required fields"; đúng 3 trường Name*, Email*, Message* (Message có gợi ý số đơn hàng), không phone, không subject; câu quyền riêng tư có link privacy policy (khi setting "Show privacy note" bật và shop có privacy policy); nút primary "Send Message". Aside (khi ≥ 1 `faq-item` có câu hỏi): eyebrow, h2, accordion `<details>` câu đầu mở sẵn, cho mở nhiều câu, link "Shipping policy", "Refund policy" từ `shop.policies` (TE-9 AC5). Bố cục: 1 cột ở 360 và 768 (Name, Email 2 cột từ 768); từ 1280 lưới 12 cột, form cột 1–7, aside cột 9–12 dính cách đỉnh 104px.
- AC4 (0.5, `page.md` §6 S2) Given form liên hệ When rời một trường sai hoặc bấm gửi Then trường sai có viền 2px màu lỗi, icon và câu sửa ("Enter your name.", "Enter an email like name@example.com.", "Enter a message."), `aria-invalid="true"`, `aria-describedby` trỏ câu lỗi. Bấm gửi khi có lỗi Then hộp tóm tắt `role="alert"` "Check {n} fields" có link tới từng trường, nhận focus. Không JS Then form gửi được, lỗi do Shopify trả hiện cùng vị trí.
- AC5 (0.5, `page.md` §6 S3–S6) Given gửi form hợp lệ When Shopify nhận Then hộp thành công "Thanks for contacting us" thay form, nhận focus, có nút secondary "Continue Shopping". Given Shopify trả lỗi chung Then `.alert` "Your message wasn't sent" + cách xử lý, giữ dữ liệu đã nhập. Có JS, đang gửi Then nút `aria-busy`, giữ bề rộng, trường `readonly`.
- AC6 (0.5, `page.md` §7, §9) Given page và contact When đo Lighthouse Then đạt NFR-1 kể cả SEO 100; mọi trường có `<label for>`, `autocomplete` name/email, `type="email"`; vùng chạm input và nút 48px dưới 64rem, 52px từ 64rem; summary accordion cao ≥ 56px; không JS bắt buộc trên 2 template.

404:

- AC7 (0.5, E1 10/11; audit B #32; `404.md` §2, §4) Given URL không tồn tại When mở Then Shopify trả HTTP 404; trang không có breadcrumb, không popup tự mở (TE-18 AC4); khối chính: eyebrow "Error 404", h1 (setting Heading, rỗng dùng chuỗi locale), câu mô tả (setting Text, rỗng dùng chuỗi locale), form tìm kiếm `role="search"` GET tới `routes.search_url` (label "Search the store", nút kính lúp tên "Search"), nút primary "Back To Homepage" tới `routes.root_url`; ô tìm không tự nhận focus. Ở 360 × 640 thấy không cuộn: eyebrow, h1, câu mô tả, ô tìm, nút về trang chủ. Gõ ≥ 2 ký tự vào ô Then gợi ý predictive như TE-8 AC1.
- AC8 (0.5, `404.md` §3, §5) Given setting "Category menu" (link_list) trống When render Then không có hàng link danh mục. Given đã chọn menu Then tối đa 6 link dạng tab cao 44px trong `<ul>` có nhãn; link tới collection kèm số sản phẩm. Given block `featured-collection` của 404 chưa chọn collection Then không có section sản phẩm, khối chính giữ đủ. Given đã chọn Then eyebrow, h2, link "View All Products" tới `routes.all_products_collection_url`, lưới N card (4–8, mặc định 4) theo TE-3; ảnh card lazy; LCP là h1.

Password:

- AC9 (0.5, PW2 10/11; `password.md` §1, §2) Given store bật mật khẩu storefront When khách mở bất kỳ URL Then layout password: nền `--color-background-dark` + noise toàn trang, không header, footer, announcement bar (TE-1 AC4); thanh trên cao 80px có logo (`settings.logo`, alt = `shop.name`, không là link) hoặc `shop.name` dạng chữ khi chưa có logo; eyebrow (setting, rỗng thì ẩn); h1 (setting Heading inline richtext, phần `<em>` màu accent, rỗng dùng chuỗi locale); `shop.password_message` (rỗng thì bỏ đoạn); chân trang có "Are you the store owner? Log in here" và "Powered by Shopify". Đúng 1 h1.
- AC10 (0.5, PW1 10/11; `password.md` §2, §5) Given setting "Show newsletter" bật When render Then form email (label "Email" hiển thị, nút "Notify Me", ghi chú "No spam. Unsubscribe anytime.") là hành động đầu; dưới là dải "Have a password?" và `<details>` "Enter Using Password" đóng sẵn chứa ô mật khẩu (label thật, `autocomplete="current-password"`) và nút "Enter Store". Given gửi email hợp lệ Then hộp `role="status"` "You're on the list" thay form, khách hàng được tạo trong admin có tag `newsletter`, `password-page`; email đã đăng ký Then cùng hộp thành công; email sai Then câu lỗi chữ trắng + icon dưới ô. Given setting tắt Then không form email, không dải "Have a password?", form mật khẩu mở sẵn. Không JS Then cả 2 form gửi được.
- AC11 (0.5, `password.md` §5) Given nhập sai mật khẩu When gửi Then trang tải lại với `<details>` mở sẵn, ô viền 2px màu lỗi, câu "That password is incorrect. Check the spelling and try again." chữ trắng + icon, focus vào ô. Nhập đúng Then vào storefront. Có JS Then nút mắt 44px "Show password" (`aria-pressed`) đổi sang "Hide password" và hiện chữ mật khẩu; không JS Then không có nút mắt.
- AC12 (0.5, `password.md` §4, §8) Given setting Image đã chọn When render Then ảnh là thẻ bo 16 dưới thanh 80px, `alt=""`; từ 64rem ảnh eager + `fetchpriority="high"`; dưới 64rem ảnh nằm sau nội dung, eager, không `fetchpriority`. Given chưa chọn ảnh Then từ 64rem là thẻ nền trắng 6% trên nền tối, dưới 48rem không có thẻ. Chữ phụ trên nền tối dùng `--color-muted-on-dark` (6.11:1), focus là outline trắng 2px.

Gift card (`templates/gift_card.liquid`, `{% layout none %}`):

- AC13 (0.5, GC1 10/11; R7.9; `gift-card.md` §1, §2) Given gift card còn hiệu lực When mở link gift card Then `<head>` có `meta viewport`, `meta robots noindex`; thanh trên 80px có logo (hoặc `shop.name` chữ) là link về shop, vùng chạm 44px; h1; thẻ dựng bằng CSS (không ảnh): số dư `gift_card.balance | money`, khi số dư < giá trị ban đầu thì thêm "of {giá trị ban đầu} initial value"; mã `gift_card.code | format_code`; QR ≥ 120 × 120px (thiết kế 144) có tên truy cập "QR code, scan to redeem gift card"; dòng Expires khi có hạn; nút Apple Wallet là asset Shopify `gift-card/add-to-apple-wallet.svg`, cao ≥ 44px, chỉ khi có `gift_card.pass_url`, không đổi màu; nút primary "Start Shopping" tới shop. Không announcement bar, không header, không footer theme.
- AC14 (0.5, `gift-card.md` §5) Given `gift_card.expired` hoặc `gift_card.enabled` = false When mở Then thẻ chuyển xám, số dư gạch, pill "Expired"; `.alert` có câu riêng cho hết hạn (kèm ngày hết hạn) và câu riêng cho bị tắt ("This gift card is no longer active"); không QR, không Apple Wallet, không Copy Code; có nút secondary "Contact Us"; mã vẫn hiện. Trạng thái báo bằng chữ + icon, không chỉ bằng màu xám.
- AC15 (0.5, GC1; `gift-card.md` §5) Given có JS When bấm "Copy Code" Then mã vào clipboard, nhãn nút đổi "Copied" + icon trong 2 s rồi về lại, `role="status"` đọc "Gift card code copied". Bấm "Print Gift Card" Then mở hộp in; bản in nền trắng, chữ đen, không nút, giữ mã và QR. Given không JS hoặc script QR tải lỗi Then không nút Copy, Print; khung QR 144px giữ chữ "Enter the code at checkout"; 0 lỗi console.

Chung:

- AC16 (0.5, NFR-1, sổ 10/11 phạm vi SEO) Given 404, password, gift card When đo Lighthouse Then Accessibility 100, Best Practices 100, Performance theo NFR-1; không tính SEO; vẫn có `<title>` và meta description qua `meta-tags`. LCP: 404 là h1; password từ 64rem là ảnh (nếu có), dưới 64rem là h1; gift card là số dư hoặc h1, không ảnh lớn.
- AC17 (0.5, ES1-T308 #1, ES1-T422 #1) Given theme mới cài When mở contact, 404, password Then: heading form liên hệ, heading và câu mô tả 404, heading password dùng chuỗi locale; eyebrow password rỗng (ẩn); `faq-item` của contact không có câu hỏi (không aside); "Category menu" và collection của 404 trống (không hàng link, không section sản phẩm); ảnh password trống; không handle `figma-*` trong 5 template. Given store dev đã cấu hình When mở lại Then: contact có heading "Send Us A Message" và 5 câu FAQ; 404 có 5 link `figma-cat-*` kèm số sản phẩm và lưới 4 sản phẩm; password có eyebrow "Opening Soon", heading "Level Up Your Fitness" (phần "Your Fitness" màu accent) và ảnh.

Settings (0.5):

| Block | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| contact-form | Heading | text | rỗng | rỗng dùng chuỗi locale; store dev "Send Us A Message" | `page.md` §3; ES1-T422 #1 |
| contact-form | Show privacy note | checkbox | true | shop không có privacy policy thì ẩn câu | `page.md` §3; TE-9 AC5 |
| faq-item (đã có, dùng trong aside contact) | Question, Answer | text, richtext | rỗng (TS-FE4 ES1-T406) | 0 câu hỏi thì không aside | `page.md` §3 |
| not-found | Heading | text | rỗng | rỗng dùng chuỗi locale | `404.md` §3 |
| not-found | Text | textarea | rỗng | rỗng dùng chuỗi locale; gợi ý ≤ 160 ký tự | `404.md` §3; ES1-T422 #1 |
| not-found | Show search | checkbox | true | | `404.md` §3 |
| not-found | Category menu | link_list | trống | tối đa 6 link; trống thì ẩn | `404.md` §3 |
| featured-collection (404) | Collection | collection | trống | trống thì không section | `404.md` §3, E1 |
| featured-collection (404) | Products to show | range | 4 | 4–8 | `404.md` §3 |
| password-hero | Eyebrow | text | rỗng | rỗng thì ẩn; store dev "Opening Soon" | `password.md` §3; ES1-T422 #1 |
| password-hero | Heading | inline_richtext | rỗng | `<em>` màu accent; rỗng dùng chuỗi locale; store dev "Level Up <em>Your Fitness</em>" | `password.md` §3 |
| password-hero | Image | image_picker | trống | ảnh ngang ≥ 1440px | `password.md` §3 |
| password-hero | Show newsletter | checkbox | true | tắt thì form mật khẩu mở sẵn | `password.md` §3, PW1 |

Page mặc định và gift card không có setting mới (gift card dùng `settings.logo`). Không thêm setting màu: nền password dùng `background_dark_color` có sẵn.

Mã R: R7.6 page + contact (AC1–AC6); R7.9 404, password, gift card QR ≥ 120 + Apple Wallet (AC7–AC15); R4.4 gift card template (AC13–AC15); R4.9 newsletter (AC10); R8 RTE nhất quán (AC2); R12 (AC3–AC6, AC9–AC11, AC13–AC15); R6.1, R6.2, R11 (AC6, AC16); R17 (AC8, AC12)


### TE-22 — Điều hướng mở rộng: menu 3 cấp, mega menu, breadcrumb (0.5, mới; tách từ TE-1 AC2 phần từ 80rem)
Phía: FE (TE-22-R2-FE1 ES1-T326 breadcrumb + tiêu đề trang + banner; TE-22-R2-FE2 ES1-T327 mega từ 80rem; TE-22-R2-FE3 ES1-T328 ảnh danh mục + sản phẩm nổi bật, Should) + BE1 (TE-22-R2-BE1, ES1-T329) + QA1 (TE-22-R2-QA1, ES1-T330) · Ước lượng: techlead · Ưu tiên: Must; AC5 Should · Nguồn: `navigation.md` (N1–N3 10/11), `foundation.md` §3.3, §5, §14; ES1-T310 #3

Là khách, tôi muốn mở một lần là thấy toàn bộ danh mục 3 cấp của store và luôn biết mình đang ở đâu trong cây trang, để đi thẳng tới collection hoặc quay lại cấp trên trong 1 thao tác.

Mega menu (từ 80rem) và cấp 3 trong drawer:

- AC1 (0.5, thay phần từ 80rem của TE-1 AC2; `navigation.md` §6) Given main-menu có mục cha có con When từ 80rem rê chuột lên mục cha 150 ms, hoặc bấm, Enter, Space trên trigger Then panel mở ngay dưới header (đỉnh panel = đáy header 80px), header giữ nền tối và chiều cao 80px; mục đang mở trắng 100% + chevron xoay 180°, `aria-expanded="true"`; scrim 50% phủ trang từ đáy header. Rê sang mục cha khác Then nội dung đổi, không chạy lại hiệu ứng mở; rê sang mục không có con Then panel đóng. Đóng bằng: rời header và panel 150 ms, Esc (focus về trigger), bấm scrim, bấm lại trigger, Tab ra khỏi panel; panel không bẫy focus. Màn cảm ứng từ 80rem Then chạm để mở/đóng. Không JS Then bấm trigger mở, bấm lại đóng.
- AC2 (0.5, N3 10/11; `navigation.md` §3) Given dữ liệu mục cha When mở panel từ 80rem Then kiểu panel chọn theo dữ liệu, không có setting từng mục: (A) có ≥ 1 con có cấp 3 → cột link: mỗi cột có tiêu đề (link cấp 2) và danh sách link cấp 3, link "View all …" đứng đầu cột 1, con không có cấp 3 đặt ngay sau "View all …" trong cột 1, tối đa 3 cột khi có card sản phẩm và 4 cột khi không có, cột thứ 5 trở đi xuống hàng; (B) mọi con là collection, không cấp 3, setting "Show collection images in menu" bật → tiêu đề panel, link "View all collections", ô collection (ảnh, tên, số sản phẩm) 5 ô mỗi hàng, 6–10 ô xuống hàng 2; (C) còn lại → dropdown nhỏ. Panel cao tối đa `100dvh − 80px`, nội dung dài hơn thì panel cuộn riêng. Theme không cắt bớt link.
- AC3 (0.5, sổ 09/11 SEO; `navigation.md` §3) Given panel hoặc cấp 2 drawer có link "View all …" When render Then nhãn theo loại link cha: catalog → "View all products"; danh sách collections → "View all collections"; collection và loại khác → "View all {tên mục}"; không có link nào chỉ ghi "View all".
- AC4 (0.5, N1 10/11; `navigation.md` §2, §5.3; cơ chế trượt + Back giữ ở TE-1 AC2) Given dưới 80rem, menu có cấp 3 When mở cấp 2 trong drawer Then cấp 2 có: tiêu đề cấp 2, hàng "View all …" cao 52px, mỗi con có cấp 3 là 1 nhóm (tiêu đề nhóm là link cao 44px, link cấp 3 cao 48px); kiểu B Then hàng collection cao 72px có ảnh 56px; card sản phẩm nổi bật (AC5) ở cuối cấp 2 tương ứng. Không JS Then accordion `<details>` tại chỗ hiện đủ link cấp 2 và cấp 3.
- AC5 (0.5, Should, N2 10/11, TE-22-R2-FE3) Given setting "Featured product in menu" đã chọn sản phẩm When mở panel kiểu A đầu tiên (từ 80rem) hoặc cấp 2 tương ứng trong drawer Then có 1 card: ảnh, badge giảm khi compare_at_price > price, eyebrow "Featured", tên hiện đủ, giá; sản phẩm hết hàng Then badge "Sold out", ảnh mờ 60%, giá giữ. Setting trống Then không card, cột giãn đủ bề rộng. Given "Show collection images in menu" tắt Then panel kiểu B thành kiểu C (từ 80rem) và hàng collection trong drawer không ảnh. Collection không ảnh Then ô nền cream + icon ảnh, không ẩn mục; collection 0 sản phẩm Then hiện "0 Products".
- AC6 (0.5, sổ 09/11 ảnh menu tải khi mở; `navigation.md` §9) Given trang bất kỳ When tải Then panel và drawer đóng; mọi ảnh trong menu `loading="lazy"`, có width/height, không tải trước khi panel hoặc cấp 2 mở, không ảnh nào eager; mọi link menu (cả cấp 3) là `<a href>` có trong HTML khi đóng; phần tử LCP của trang không thuộc menu; CLS do mở menu = 0.
- AC7 (0.5, `navigation.md` §8) Given bàn phím và trình đọc màn hình When duyệt menu Then `<nav aria-label="Main menu">` (desktop) và `<nav aria-label="Mobile menu">` (drawer) có tên khác nhau; tiêu đề cột và tiêu đề nhóm không dùng thẻ `<h*>`, danh sách link là `<ul>` có `aria-labelledby` trỏ tiêu đề; thứ tự Tab: trigger → link trong panel theo cột trái sang phải, trên xuống → card → mục cha kế tiếp; panel đóng thì link bên trong không nhận focus; trang hiện tại có `aria-current="page"` + gạch chân 2px; focus trên thanh tối là outline trắng 2px; vùng chạm mục menu 44px, link trong panel ≥ 40px; `prefers-reduced-motion: reduce` Then không translate, không scale.
- AC8 (0.5, `navigation.md` §7) Given menu main-menu trống When trong theme editor Then thanh header có chữ placeholder hướng dẫn. Given storefront Then không có menu, không có nút menu; logo bên trái, icon bên phải.

Breadcrumb và tiêu đề trang:

- AC9 (0.5, `foundation.md` §5; TE-1 AC7 SEO) Given trang collection, sản phẩm, blog, trang tag blog, bài viết, page When render Then dưới header có `<nav aria-label="Breadcrumb"><ol>`: collection `Home / Collections / {collection}`; sản phẩm mở trong collection `Home / {collection} / {product}`, sản phẩm mở qua `/products/` `Home / {product}` (ES1-T422 #4); blog `Home / {blog}`; trang tag `Home / {blog} / {tag}`; bài viết `Home / {blog} / {article}`; page `Home / {page}`. Mục cuối là `<span aria-current="page">`, không là link; các mục khác là link có URL dựng từ `routes.*` và URL của đối tượng; link cao 44px; chữ 14px, link `--color-muted` (8.45:1). Given trang chủ, cart, search, list-collections, 404, password, gift card Then không có breadcrumb.
- AC10 (0.5, `foundation.md` §5; ES1-T422 #2) Given mục cuối dài hơn 22 ký tự (dưới 48rem) hoặc 48 ký tự (từ 48rem) When render Then mục cuối cắt "…"; h1 của trang hiện đủ tên; JSON-LD (AC12) mang tên đầy đủ.
- AC11 (0.5, `foundation.md` §3.3; TE-22-R2-FE1) Given collection có ảnh banner When render Then banner là thẻ bo 16 dưới header (cách 16px, 24px từ 64rem), cao tối thiểu 280px (360px từ 64rem); breadcrumb, eyebrow, h1 chữ trắng ở đáy trái trên lớp tối gradient 75% ở đáy → 60% từ giữa lên; chữ trắng đạt ≥ 4.5:1 cả khi ảnh trắng; ảnh banner eager + `fetchpriority="high"`. Bài viết không áp lớp này (TE-20 AC9).
- AC12 (0.5, R11; `foundation.md` §5) Given trang có breadcrumb When kiểm HTML Then có đúng 1 khối JSON-LD `BreadcrumbList`, số mục, thứ tự, tên và URL khớp breadcrumb hiển thị (mục cuối có tên đầy đủ); Rich Results Test 0 lỗi; trang không có breadcrumb Then không có `BreadcrumbList`.
- AC13 (0.5, `foundation.md` §5) Given trang có tiêu đề (collection, blog, page, article) When render Then thứ tự eyebrow (nếu có) → h1 → meta; đúng 1 h1 mỗi trang.
- AC14 (0.5, ES1-T308 #1) Given theme mới cài When kiểm header Then setting "Featured product in menu" trống, không handle `figma-*` trong code header, menu mặc định là link_list `main-menu`. Given store dev đã cấu hình menu 3 cấp (ES1-T298: Shop > Categories, Training Level, Featured; Collection > 5 collection `figma-cat-*` có ảnh) và sản phẩm nổi bật When mở Shop và Collection từ 80rem Then Shop là kiểu A có card, Collection là kiểu B có 5 ô ảnh.

Settings (0.5):

| Block | Setting | Kiểu | Default | Giới hạn | Nguồn |
| --- | --- | --- | --- | --- | --- |
| header | `menu_collection_images` "Show collection images in menu" | checkbox | true | tắt: B thành C, drawer không ảnh | N2 10/11; `navigation.md` §4 |
| header | `menu_featured_product` "Featured product in menu" | product | trống | trống thì không card; store dev chọn sản phẩm demo | N2 10/11; `navigation.md` §4; ES1-T308 #1 |

Không đổi setting header hiện có (`logo`, `logo_width`, `menu`, `customer_account_menu`, `sticky_header`). Breadcrumb không có setting. Chữ cố định qua locale `blocks.header.*` (`navigation.md` §4).

Mã R: R4.8 menu đa cấp (AC1–AC4); R11 rich snippets (AC12); R12 (AC1, AC7, AC9, AC11); R14 link_list default (AC14); R17 (AC6); R6.1 (AC6, AC11)

## 3. Quyết định đã chốt (CTO 27/10/2026, trước là câu hỏi mở)
- Hết hàng: sản phẩm vẫn hiện trong featured collection, bundle, shop the look, collection, kèm badge "Sold out"; nút thêm vào giỏ disabled. Áp cho TE-3, TE-4, TE-6, TE-12.
- Cart: mặc định drawer (TE-5); setting `cart_type` cho đổi sang page.
- Collection mobile: mặc định 2 cột (TE-6); setting cho chọn 1 hoặc 2.
- Tên theme: Efitco (CTO 22/10).

Chốt CTO 06/11/2026 (ES1-T167, T168, T169):
- Trang chủ giống 100% Figma trên store dev là yêu cầu bắt buộc. Copy, số liệu, review mẫu, tên khách, sao, bậc giảm bundle 10%, 15% nằm trong mặc định của theme; Verified tắt. Thay ES1-T115 #2, T136 #8, T146 #2, T155 #8. (0.4: ghi chú giảm giá kèm bậc giảm bỏ theo sổ 07/11, L3.)
- Merchant mới cài không có sẵn ảnh, video, countdown. Cổng PR đo qua `?view=figma`, nghiệm thu trên `/`.
- Duyệt 10 CR của ES1-T167. Ngoại lệ so với Figma: E1–E9 của ES1-T167 mục 2.4, thêm E10 (số mẫu 1:560), mở rộng E7 (bậc giảm 5% của 1:636). (0.4: E11 "Add to cart" bỏ; nút giữ "Add To Cart" Title Case như Figma, sổ 07/11, AGENTS.md đã sửa theo ở PR #170, ES1-T297 #4, L4.)
- Mặc định Q1–Q6 của ES1-T168: Q1 bundle dùng collection `all`, quiz hiện đủ và kết quả rỗng khi chưa có tag, featured product và shop the look ẩn tới khi chọn sản phẩm. Q2 rating và 4 giá trị spec hàng 10 lấy từ metafield, nhãn spec là mặc định. Q3 giữ nguyên văn copy Figma kể cả lỗi, Designer sửa Figma thì đổi theo. Q4 wordmark, copyright dùng `shop.name`. Q5 hàng 11 không hiện 3 ô số liệu. Q6 thêm E10, mở rộng E7 (E11 bỏ ở 0.4).
- D7 của ES1-T169: mặc định `products_to_show` 4; vùng bấm swatch 44px (bỏ ở bản 0.3: swatch card là chỉ báo, TE-3 AC6).

Chốt CTO 09/11–10/11/2026 đưa vào bản 0.3 (nguồn đầy đủ: `docs/design/decisions.md`):
- Header mọi trang là thanh tối riêng cao 80px, không đè ảnh → TE-1 AC9, AC-H29, TE-2 AC6.
- Hero 360 căn trái mép 20; lớp tối 30% chỉ ở 768, 360 → TE-2 AC2, TE-1 AC9.
- Drawer menu cấp 2 trượt + Back, accordion chỉ khi không JS (N1) → TE-1 AC2.
- Localization 1 control gộp mở 2 danh sách (ES1-T289) → TE-1 AC5, AC9.
- Swatch card là chỉ báo; nút Quick View mở bộ chọn chung (M1, M2, M4, M5) → TE-3 AC2, AC6, AC8–AC12.
- 2048 biến thể → NFR-7, TE-4 AC13–AC16.
- Sticky ATC mọi mốc, "Show on desktop" mặc định bật (P2) → TE-4 AC5.
- Countdown: metafield `custom.sale_ends_at` là nguồn chính, setting ngày chỉ khi không có metafield, 1 component chung (P3–P5, audit (2)) → TE-4 AC17, TE-13 AC1, AC-H23, TE-18 AC6.
- Quantity rules, volume pricing, selling plan ở PDP, quickview, cart, mini cart (audit (4)) → TE-4 AC18, AC19, TE-5 AC9, AC10, TE-9 AC7.
- Ghi chú đơn trong drawer (M3) → TE-5 AC8.
- Popup marketing hàng đợi, mặc định bật, nút Big Offer ẩn ở PDP và cart (MK1–MK6, audit (3)) → TE-18.

Áp lệch L1–L7 trong bản 0.4 (ES1-T297 #4; bảng lệch mục 4 của bản 0.3 đã xoá):
- L1 chỉ tiêu nghiệm thu 09/11, phạm vi SEO 10/11 → NFR-1, TE-10 AC1, AC-H30, TE-13 AC5.
- L2 điều khiển hero theo mốc (07/11, H1 10/11, HD2 11/11) → TE-2 AC7.
- L3 bỏ dòng ghi chú giảm giá dưới bundle và shop the look (07/11) → TE-12 AC1, AC-H18, AC-H19, TE-10 AC3.
- L4 "Add To Cart" Title Case (07/11), E11 bỏ → TE-4 AC2, TE-13 AC2, AC-H22, mục 3.
- L5 kết quả quiz mở popup (09/11) → TE-11 AC3, AC5.
- L6 testimonials hàng ngang (09/11, HD3 11/11) → TE-7 AC1.
- L7 phân trang đầu/cuối giữ chỗ, 1 snippet chung (audit (5) 10/11) → TE-6 AC6.

Chốt CTO 11/11/2026 đưa vào bản 0.4 (nguồn: sổ dòng 11/11, spec ghi ở từng AC):
- QZ1–QZ3 popup quiz → TE-11 AC6–AC8, ngoại lệ TE-4 AC8, TE-5 AC6, TE-3 AC11.
- PG1–PG3 phân trang → TE-6 AC6, AC7, TE-8 AC2, TE-9 AC3.
- SF1–SF3 selling plan, pickup, quantity rule → TE-4 AC18–AC20, TE-5 AC9.
- AN1–AN2 announcement bar → TE-1 AC4.
- LC1–LC3 localization → TE-1 AC10.
- LY1–LY3 lớp và vùng đáy → TE-10 AC6–AC8.
- VP1 Add To Cart khi đang tải biến thể (sửa mâu thuẫn `aria-busy` của bản 0.3) → TE-4 AC15.
- CD2 hết giờ khi đang xem; ES1-T276 số Liquid in sẵn → TE-4 AC17 (áp cho TE-13, TE-18 qua component chung).
- HA1 chữ hero hiện dần 400 ms, ảnh hiện ngay → TE-2 AC10.
- ES1-T269 chỉ customer accounts mới → TE-1 AC3.
- ES1-T274 already subscribed, popup giữ mở sau khi gửi → TE-18 AC7.
- ES1-T297 #1, #2, #6 dữ liệu B2B, WELCOME15, combined listing (không AC) → TE-9 AC7, TE-4 AC18, TE-5 AC9, bảng setting TE-18; #3 Shopify Email ngoài phạm vi theme → AC-H33.
- Không thêm AC trong 0.4 (chi tiết thiết kế đã nằm trong spec, không đổi kết quả nghiệm thu của AC hiện có): VP2, VP3, HB1, HB2, FD1, FD2, CD1, HA2, HD1; HD2 và HD3 chỉ dùng cho TE-2 AC7 và TE-7 AC1.
- Chốt CTO 11/11 (ES1-T307, ES1-T308, ES1-T309 #1, ES1-T311) đưa vào 0.5: story TE-19 upsell giỏ hàng, TE-20 blog và bài viết, TE-21 trang phụ, TE-22 điều hướng mở rộng; ĐỀ XUẤT trong ui-spec là phạm vi; nội dung mẫu trống.
