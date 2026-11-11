KHÔNG CHẮC: (1) B2B (TE-4 AC18, TE-5 AC9) phụ thuộc ES1-T298: store dev không bật được B2B thì AC giữ, QA kiểm bằng mockup (ES1-T297 #1); combined listing không có AC (ES1-T297 #6); (2) ngưỡng CI chặn merge sau khi đổi chỉ tiêu nghiệm thu (NFR-1) và cách nhận biết email đã đăng ký (TE-18 AC7) chờ Tech Lead ES1-T301, có mặc định; (3) file này thay `docs/srs.md` (hook chặn BA ghi docs/, Orchestrator chép).

# SRS — theme-efitco · bản 0.4 · BA · 11/11/2026 (bản 0.3: 10/11/2026, bản 0.2: 06/11/2026, bản 0.1: 22/10/2026)

Nguồn: charter, PRD, Figma Efitco T10 (home), Skeleton AGENTS.md, Theme Store requirements (chuẩn nội bộ, mã R), Canvas requirements (22/10/2026). Bản 0.2: ES1-T173, theo ES1-T167, T168, T169 và CTO duyệt 06/11. AC-H* có mã TC-H* tương ứng; bảng nội dung theo node ở `drafts/ba/ES1-T173/home-content.md`.

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
- AC2 (0.3, N1 CTO 10/11, `docs/ui-spec/navigation.md`) Given menu main-menu có 2 cấp When mở header từ 80rem Then cấp 2 mở bằng hover và keyboard (Enter/Space mở, Esc đóng) theo navigation.md. Given dưới 80rem, có JS When chạm mục có cấp 2 trong drawer Then panel cấp 2 trượt vào trong cùng drawer, có nút Back (tên truy cập "Back to menu", cao ≥ 44px) và nút đóng, focus chuyển vào Back; bấm Back Then về cấp 1, focus về mục vừa mở. Given không JS Then cấp 2 là accordion `<details>` tại chỗ, không trượt, không có Back.
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

Mã R: R4.7 country/language (AC5, AC9, AC10); R4.8 menu đa cấp; R4.9 newsletter; R4.18 Follow on Shop; R4.19 shopify-account (AC3); R7 layout; R11 SEO; R13 social; R14–R16 settings/font/màu; R12 (AC4, AC10)

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
- AC2 Given 404 When Then thông báo rõ + search + link home; password Then logo/shop.name, password_message, form; page.contact Then form name/email/message có validation và thông báo; gift_card Then QR ≥ 120px, mã, Apple Wallet, logo.
- AC3 (0.4) Given blog/article When Then title, image, excerpt_or_content, published_at, comments phân trang theo TE-6 AC6 (nav "Comment pages"), form comment hoạt động; danh sách bài của blog phân trang theo TE-6 AC6.
- AC4 Given store hoa-qua-nhap-khau (efitco-ai-dev) When kiểm Then có dữ liệu Figma theo `drafts/ba/ES1-T173/home-content.md` mục 3: 24 sản phẩm, 12 collection handle `figma-*` cho hàng 3, 4b, 5, tag quiz, metafield rating và spec, discount tự động 10%, 15%, 5 bài blog, menu, tên shop Efitco; handle và dữ liệu trong `tests/e2e/store-data.json` không đổi; ảnh demo chỉ dùng trên store dev, quyền dùng ghi ở ES1-T174.
- AC5 (Editions #25) Given shop.policies When render footer/trang phụ Then link chính sách lấy từ shop.policies, không nhập tay URL.
- AC6 (Editions #27) Given chưa chọn logo/màu trong theme When render Then dùng shop.brand (logo, màu chính) làm mặc định nếu có.
- AC7 (0.4, CTO audit (4), ES1-T282, ES1-T288, ES1-T297 #1, #2, #6; thực hiện ở ES1-T298) Given store dev When kiểm Then có thêm dữ liệu theo `drafts/ba/ES1-T294/demo-data-b2b.md` mục D2–D8, D10: sản phẩm có selling plan và 1 sản phẩm `requires_selling_plan`, sản phẩm > 250 biến thể, metafield `custom.sale_ends_at`, gift card có form người nhận, unit price có số đo, sản phẩm số, 3 địa điểm pickup, mã giảm giá `WELCOME15` (15% đơn đầu, 1 lần mỗi khách). D1 (quantity rule + volume pricing, 1 khách B2B) và D9 (combined listing) chỉ có khi store bật được tính năng; không bật được Then `drafts/devops/ES1-T298/demo-data-log.md` ghi lý do. Key mới thêm vào `tests/e2e/store-data.json`, key cũ không đổi.

Mã R: R4.4 gift card; R7.6 page; R7.7 blog/article; R7.9 404/password/gift card; R14 default; R18 preset cùng tên theme; R20 demo store (AC7)

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
