KHÔNG CHẮC: (1) `docs/design/decisions.md` dòng 12 liệt kê spec có câu CTO đã chốt nhưng không có foundation F1–F3; bản sổ CTO nạp cho Designer ghi "các câu khác vòng 3 chốt theo đề xuất trong spec", nên audit coi F1–F3 là đã chốt. (2) Repo không có văn bản yêu cầu Theme Store đầy đủ (01 chỉ có link shopify.dev): danh sách tính năng ở §2.3 lấy từ SRS TE-1, TE-3, TE-4, TE-5 (mã R4, R7) và 01 phần B; Tech Lead đối chiếu shopify.dev trước khi chia ticket. (3) Banner cookie/consent do Shopify vẽ (Customer Privacy), theme không chỉnh được giao diện; vị trí thật trên store dev chưa kiểm. (4) Audit đọc spec và HTML mockup, không mở từng PNG để so pixel (ticket cấm render).

# Audit thiết kế vòng 3 + 3b trước khi trình BGĐ (ES1-T283)

Phạm vi: 17 màn trên artifact BGĐ (foundation, trang chủ 768/360 + Figma 1:359, product, collection, list-collections, cart, search, blog, article, page + contact, 404, password, gift card, navigation, predictive search, mini cart + quickview, marketing popups) và `docs/design/decisions.md`.

Mức:
- CHẶN: trái quyết định đã chốt trong sổ và hiện trên PNG trình BGĐ, hoặc thiếu màn/overlay mà sổ yêu cầu đích danh.
- NÊN: yêu cầu SRS/Theme Store hoặc quy tắc nhất quán chưa có trong thiết kế; phải xong trước khi Dev làm phần đó.
- ĐỂ SAU: lệch P4, tài liệu, tối ưu.

## 1. Bảng tổng

| # | Màn | Thiếu / lệch | Mức | Đề xuất xử lý |
| --- | --- | --- | --- | --- |
| A1 | Product (T253) | Bộ chọn option nhiều giá trị: PDP "> 12 giá trị, hiện 11 + '+N'" và setting "Options with many values" (product.md §5.1, §12, §17; mockup khung J1 "+29"). Sổ 10/11 (M5): "> 10 giá trị hiện 7 + '+N', hằng chung PDP/quickview, không thành setting". Quickview (T262 §3.1) đúng sổ. | CHẶN | Sửa product.md §5.1/§12/§17 + product.html khung J, render lại PNG T253 (ticket T1) |
| A2 | Product ↔ quickview | Cùng "bộ chọn chung" nhưng khác hình: tổ hợp không tồn tại PDP viền đứt không gạch, QV gạch + viền đứt; gạch chéo swatch 2px vs 1px; nút "+N" PDP viền foreground, QV nền alt viền muted-light; sau khi mở PDP focus giữ ở nút, QV focus giá trị thứ 8; nhãn "Show Fewer" vs "Show fewer", "Try again" vs "Try Again"; đang tải PDP spinner legend + skeleton giá/tồn, QV "Checking availability…". Setting Dropdown chỉ có ở PDP nên QV lệch khi merchant chọn Dropdown. Nguồn: sổ 10/11 (2048, áp PDP/quickview/card), 06 §1. | CHẶN | Gộp vào T1: viết 1 mục "Bộ chọn biến thể" trong foundation.md, PDP và QV trỏ về; render lại T253, T262 nếu đổi hình |
| A3 | Blog (T257), comments article | Phân trang kiểu vòng 2: nút chữ "Newer/Older articles", ô vuông 44 bo `--radius-button`, trang hiện tại nền foreground, mũi tên 20 × 16 (blog.md §5, blog.html dòng 62–77). Sổ 10/11 S3, C3: một kiểu prev/next toàn theme, nút tròn 52 chevron, snippet `pagination` chung, trang hiện tại accent. | CHẶN | Sửa blog.md §5, article.md §1.4 (phân trang bình luận), blog.html; render lại PNG blog (ticket T2) |
| A4 | Collection / search / list-collections | Đầu/cuối phân trang khác nhau: collection §8 và list-collections §4 bỏ nút Previous ở trang 1; search §3.9 giữ nút `aria-disabled` mờ 0.35 (giữ chỗ, 0 CLS). Cùng snippet `pagination`. | NÊN | Gộp vào T2, chốt 1 hành vi (câu CTO 5), thêm mục "Phân trang" vào foundation |
| A5 | Trang chủ, quiz (Figma 1:506) | Thiếu popup kết quả quiz (có sản phẩm khớp) ở mọi khổ; T278 chỉ vẽ "No Exact Match" 768/360. Sổ 09/11: "Quiz: kết quả mở popup (mobile bottom sheet)". Template `collection.quiz` (trang kết quả xem trực tiếp / không JS) chưa có thiết kế. | CHẶN | Ticket T3: dialog L ≥ 768, bottom sheet < 768, 4 khổ + trang `?view=quiz` |
| A6 | Trang chủ 360, bundle (Figma 1:636) | Thanh dính đáy bundle 360 đã chốt 10/11 (index-mobile-b §12 câu 1) nhưng spec ghi "Mockup chưa vẽ, chờ CTO" (§1). | CHẶN | Ticket T4: vẽ vào T279 index.html + PNG 360, cập nhật §1 |
| A7 | Trang chủ 1280 | Không có thiết kế 1280: Figma chỉ 1920 (figma-inventory dòng 6), T278/T279 chỉ 768/360. Sổ 09/11: "desktop (1280, 1920) kể cả trang chủ". Ticket coi Figma là desktop. Khối lệch nhiều ở 1240 nội dung: hero 1798 dải rộng, display 100, shop the look 936 + 456, quiz panel 1416, bundle 3 × 2 + panel 576. | NÊN | Câu CTO 1; nếu giữ sổ 09/11 thì ticket T10 |
| A8 | Trang chủ 768/360 (T278) | §10 Motion: "ảnh hero hiện dần khi cuộn tới (900ms)". Ảnh slide 1 là LCP; reveal làm trễ LCP mobile (chỉ tiêu ≥ 90). Product §14, blog §7, article §7 đều cấm reveal ở màn đầu. Nguồn: sổ 09/11 Performance, foundation §20. | NÊN | Ticket T9: sửa index-mobile-a §10 |
| A9 | Trang chủ 360/768 hero | Chữ trên ảnh `efx-slide-2.jpg`: điểm sáng còn ~2.7:1 (index-mobile-a §9.1). Sổ 10/11: thiếu AA thì chọn ảnh nền trơn, không tăng lớp tối; ảnh demo chưa đổi. | NÊN | Ticket T9: chọn ảnh hero demo đạt 4.5:1 ở vùng chữ 360/768 |
| A10 | Trang chủ (tài liệu) | `docs/ui-spec/index.md` (ES1-T252, gốc live) và `drafts/designer/ES1-T252/` (index-360/768.png, `live/*`) vẫn còn cạnh T278/T279. Sổ 10/11: không dùng live làm gốc. Dễ lẫn khi dựng artifact BGĐ và khi Dev đọc. | NÊN | Ticket T9: ghi đầu index.md "đã thay bởi index-mobile-a/b", loại T252 khỏi artifact |
| A11 | Foundation (T251) | §16 còn "1 lần/phiên" trái sổ 10/11 MK3 (hàng đợi, mỗi popup 1 lần/phiên). §20 "SEO 100 bắt buộc ở trang index" trái sổ 10/11 (SEO đo 6 loại trang). §22 vẫn là "cần chốt". §13 "+ cam" trái Figma 1:1057 (icon theo màu chữ, index-mobile-b §7); page.md aside đang theo §13. | NÊN | Ticket T8 |
| A12 | Foundation §18 ↔ collection §9 | Collection S7 "card cũ mờ 40%" khi đang cập nhật; foundation §18, cart, search S5, mini cart đều "không làm mờ chữ" (Lighthouse tính opacity; sổ 09/11 AA ở mọi trạng thái). | NÊN | Ticket T8: collection S7 dùng skeleton/giữ card như search S5; sửa collection.md §9 + mockup S7 |
| A13 | Panel tối G3 (cart, mini cart, bundle, shop the look) | Sổ 10/11 G3: panel tóm tắt áp cả bundle và mini cart. Chữ phụ: cart/mini cart trắng 70% (6.56), bundle spec #B2B2B2 (5.39) nhưng mockup trắng 70%, shop the look trắng 60% (5.27). Xanh giảm giá: cart/mini cart `badge-new` 50% (5.81), bundle 55% (5.41), shop the look chữ trắng. | NÊN | Ticket T8: 1 cặp màu dẫn xuất trong foundation §2, index-mobile-a §7 + index-mobile-b §1 trỏ về |
| A14 | Countdown (featured product, PDP, big offer) | 3 bản khác nhau: trang chủ 360 ô 44 số 20/600 (index-mobile-b §2); PDP 360 ô 40 số 16, ≥ 768 ô 44 số 18 Inter 700, 4 ô khi ≥ 24 giờ (product §4.2); big offer ô 44 số 18/700, 3 ô (marketing §4). Nguồn ngày khác nhau: setting `countdown_end` (featured), metafield `custom.sale_ends_at` (PDP), setting text "Sale end date" (big offer); cùng sản phẩm Ativafit Lava có thể đếm 3 mốc khác nhau (trái DESIGN/R8 không đếm giả). | NÊN | Câu CTO 2; ticket T8: 1 component countdown trong foundation (kích thước theo mốc, 3/4 ô) |
| A15 | Marketing popups (T263) ↔ product (T253) | Teaser Big Offer góc dưới trái chỉ ẩn trên PDP < 48rem (§4 "sticky ATC chỉ mobile"), nhưng sổ 10/11 P2: sticky bar mọi mốc, "Show on desktop" BẬT → ≥ 768 teaser đè thanh mua. Trang chủ 360: teaser đè thanh dính bundle (A6). Cart < 64rem: thanh checkout dính đáy, §1 không nói teaser có hiện ở cart không. | NÊN | Câu CTO 3; ticket T7 |
| A16 | Marketing popups §1.2 | Danh sách "lớp" thiếu: lightbox PDP, drawer lọc (collection, search), popup kết quả quiz, bảng chọn quốc gia/ngôn ngữ, banner consent Shopify. Popup tự mở có thể bật trong lúc các lớp này đang mở. Nguồn 15 §1 (một lớp một lúc). | NÊN | Ticket T7 |
| A17 | Toàn theme: phần tử dính | Không spec nào có `scroll-padding` cho header dính 80 và các thanh dính đáy (sticky ATC mọi mốc, cart checkout bar, bundle bar): focus bàn phím có thể nằm dưới thanh (WCAG 2.2 SC 2.4.11 Focus Not Obscured). Nguồn 06 §1 (accessibility), sổ 09/11 "focus nhìn thấy". | NÊN | Ticket T7: foundation thêm `scroll-padding-block-start/end` theo chiều cao thanh |
| A18 | Toàn theme: announcement bar | Chưa có thiết kế. SRS TE-1 AC4 (mặc định rỗng, có chữ thì bar trên header, có link); 14 #284D (ưu đãi tĩnh thay overlay). Cần quyết định vị trí so với header tối 80 dính. | NÊN | Ticket T6 |
| A19 | Toàn theme: bảng chọn quốc gia / ngôn ngữ | Chỉ có nút kích hoạt: footer "cờ + USD / EN" (foundation §4) và drawer 2 nút Currency / Language (navigation §5.3). SRS TE-1 AC9: 1 nút gộp mở 2 danh sách; drawer đang tách 2 nút (lệch). Chưa vẽ danh sách (popover desktop, sheet mobile, ô tìm khi nhiều nước, trạng thái 1 nước thì ẩn AC5). 12 #560D (autocomplete bàn phím). | NÊN | Ticket T6 |
| A20 | Product: tính năng Shopify | Chưa có thiết kế: form người nhận gift card (SRS TE-4 AC6, 01 phần B "demo có gift card"; product.md §11 chỉ 1 câu, mockup không có), selling plan selector (TE-4 AC4), Shop Pay Installments banner (TE-4 AC4), pickup availability (TE-4 AC4: chỉ 1 dòng §5, chưa có drawer/dialog danh sách cửa hàng), unit price (§4 có 1 dòng, mockup không có trạng thái dù demo-data có edge case "Unit price"), quantity rules + volume pricing (B2B, không có ở spec nào), sản phẩm số ẩn ship/pickup (AC9, chỉ 1 câu). | NÊN | Ticket T5 |
| A21 | Card, quickview, mini cart, cart: unit price, selling plan | Card (foundation §9) không có unit price (SRS TE-3 AC4); quickview không có unit price, selling plan; mini cart chỉ "selling plan như code"; cart anatomy có unit price + selling plan nhưng mockup không có (KHÔNG CHẮC (3) của cart.md). Card không nói combined listing / card theo variant (TE-3 AC8). | NÊN | Ticket T5 |
| A22 | Banner cookie / consent | Theme không vẽ (Shopify), nhưng chưa có quy tắc: popup tự mở chờ banner đóng; thanh dính đáy, teaser, toast không đè banner. | NÊN | Ticket T7 (chỉ quy tắc) |
| A23 | Predictive search ↔ search page | 2 setting "Popular searches" khác chữ mặc định và giới hạn (predictive §5: 5 cụm, header; search §4: tối đa 6, block search-results). Nguồn 06 §1. | NÊN | Ticket T8: 1 setting chung (theme settings), 1 bộ chữ |
| A24 | Nhãn nút Title Case | Lệch quy ước foundation §6 (nút 2–4 từ Title Case, sổ 07/11): "Show fewer" (QV), "Try again" (PDP J3), "Keep shopping" (popup, nút dạng link). | NÊN | Gộp T1 (bộ chọn) + T8 (còn lại) |
| A25 | Search overlay (T261) | Trạng thái "không có sản phẩm, có nội dung khác" ghi "— (ĐỀ XUẤT)", không có khung mockup. Khung 3 (0 kết quả) đã phủ yêu cầu sổ 09/11 "không có sản phẩm". | ĐỂ SAU | Vẽ thêm khi sửa T261 lần sau |
| A26 | Header: tài khoản khách mới | SRS TE-1 AC3 `<shopify-account>`; sổ 10/11 dùng tài khoản mới. Chưa vẽ trạng thái đã đăng nhập (icon/avatar header, "Sign In" trong drawer khi đã đăng nhập). Follow on Shop (SRS R4) chưa có. | ĐỂ SAU | Ghi vào foundation §3 khi Dev header; giao diện popover do Shopify |
| A27 | Quickview media | Chỉ ảnh; video/3D trong quickview chưa nói (PDP có trạng thái E). | ĐỂ SAU | Ghi 1 câu ở mini-cart-quickview §3: video/3D hiện poster, bấm mở PDP |
| A28 | Foundation footer mockup | foundation.html thiếu "Our Efitco" trong menu Information (index-mobile-b §8). Social icon #B2B2B2 → muted-on-dark (P4). | ĐỂ SAU | Sửa khi chạm foundation.html |
| A29 | Sổ quyết định | Dòng 20 ghi #999 trên nền tối 5.85:1 (tính với #1E1E1E); nền đã chốt #1A1A1A cho 6.11:1 (foundation §2). | ĐỂ SAU | CTO sửa số trong sổ |
| A30 | SRS lệch sổ | TE-1 AC9, AC-H29 (header trong suốt đè hero), TE-1 AC2 (drawer accordion), TE-2 AC2 (360 căn giữa), TE-3 AC2/AC6 (swatch card bấm được, vùng bấm 44) trái sổ 10/11 và foundation §9; TE-4 AC5 (sticky chỉ mobile) trái P2. | ĐỂ SAU (không phải việc Designer) | BA cập nhật SRS; ES1-T280 đã hỏi phần TE-2 |
| A31 | Figma desktop trong artifact | Repo chỉ có `docs/figma/img/1-359.lowres.png` cho cả trang; ảnh nét có theo từng khối. | ĐỂ SAU | Orchestrator xuất 1:359 bản nét cho artifact BGĐ |
| A32 | Template phụ | `templates/product.featured-product.liquid` không có spec riêng (giả định giống product). | ĐỂ SAU | Tech Lead xác nhận mục đích template |

## 2. Chi tiết theo 6 nhóm

### 2.1 Danh mục màn và overlay

Template (Theme Store, 01; customers/* bỏ theo sổ 10/11):

| Template | Spec | Mockup | Ghi chú |
| --- | --- | --- | --- |
| index | index-mobile-a, index-mobile-b (+ index.md cũ) | Figma 1:359 + T278, T279 | 1280 thiếu (A7) |
| product | product.md | T253 | thiếu tính năng A20 |
| collection | collection.md | T254 | |
| list-collections | list-collections.md | T254 | |
| cart | cart.md | T255 | |
| search | search.md | T256 | |
| blog | blog.md | T257 | phân trang lệch (A3) |
| article | article.md | T257 | |
| page | page.md | T258 page (S1) | |
| page.contact | page.md | T258 page (màn chính) | file template chưa có trong repo (Dev) |
| 404 | 404.md | T258 | |
| password | password.md | T258 | |
| gift_card | gift-card.md | T258 | |
| collection.quiz | — | — | thiếu (A5) |

Overlay theo sổ 09/11:

| Overlay | Có ở | Trạng thái |
| --- | --- | --- |
| Popup newsletter | T263 | có |
| Popup before you leave | T263 | có (A, B, hàng đợi) |
| Mega menu | T260 | có (A, B, C + drawer) |
| Search popup khi gõ | T261 khung 1 | có |
| Search popup không có sản phẩm | T261 khung 3 | có (A25 ca phụ) |
| Search tab canvas (drawer) | T261 khung 4 | có |
| Search tab | T261 khung 2 | có |
| Popup mini cart | T262 | có |
| Quickview | T262 | có |
| Popup offer (big offer) | T263 | có |
| Popup kết quả quiz (sổ 09/11) | — | THIẾU (A5) |

Overlay / thành phần ngoài danh sách sổ nhưng SRS hoặc Shopify cần:

| Thành phần | Tình trạng | Mục |
| --- | --- | --- |
| Drawer lọc | có (collection S3, search S4) | — |
| Lightbox ảnh | có (product F) | — |
| Toast | có (foundation §17) | — |
| Announcement bar | thiếu | A18 |
| Chọn quốc gia / ngôn ngữ | thiếu danh sách, chỉ có nút | A19 |
| Pickup availability (danh sách cửa hàng) | thiếu | A20 |
| Banner cookie / consent (Shopify vẽ) | thiếu quy tắc lớp, vùng đáy | A22 |
| Age / region gate | không có trong SRS, Shopify không có sẵn | không làm |

### 2.2 Đủ khổ (PNG)

| Màn | 360 | 768 | 1280 | 1920 | Thư mục |
| --- | --- | --- | --- | --- | --- |
| Foundation | có | có | có | có | ES1-T251 |
| Trang chủ | có (T278 + T279) | có (T278 + T279) | THIẾU | Figma 1:359 (repo chỉ bản lowres cả trang) | ES1-T278, ES1-T279 |
| Product | có | có | có | có | ES1-T253 |
| Collection | có | có | có | có | ES1-T254 |
| List-collections | có | có | có | có | ES1-T254 |
| Cart | có | có | có | có | ES1-T255 |
| Search | có | có | có | có | ES1-T256 |
| Blog | có | có | có | có | ES1-T257 |
| Article | có | có | có | có | ES1-T257 |
| Page + contact | có | có | có | có | ES1-T258 (`page-*`) |
| 404 | có | có | có | có | ES1-T258 |
| Password | có | có | có | có | ES1-T258 |
| Gift card | có | có | có | có | ES1-T258 (`gift_card-*`) |
| Navigation | có | có | có | có | ES1-T260 |
| Predictive search | có | có | có | có | ES1-T261 |
| Mini cart + quickview | có | có | có | có | ES1-T262 |
| Marketing popups | có | có | có | có | ES1-T263 |
| Popup kết quả quiz | THIẾU | THIẾU (chỉ "no match") | THIẾU | THIẾU | — |

File thiếu: `index-1280.png` (trang chủ, A7); `quiz-result-360|768|1280|1920.png` (A5). Thừa / dễ lẫn: `ES1-T252/index-360.png`, `index-768.png`, `ES1-T252/live/*` (A10).

### 2.3 Tính năng Shopify (SRS R4, R7; 01 phần B)

| Tính năng | Đã có ở | Thiếu |
| --- | --- | --- |
| Bộ chọn 2048 biến thể theo option value | product §5.1, §17; mini-cart-quickview §3.1 | ngưỡng thu gọn PDP lệch sổ, hình khác QV (A1, A2) |
| Swatch chuẩn Shopify (`value.swatch`) | product §5.1, QV §3.1, filter collection §5.2 | card: chỉ báo `aria-hidden` (foundation §9, trái SRS TE-3 AC2, A30) |
| Combined listing | product §17 (`value.product_url`) | card theo variant (TE-3 AC8), QV (A21) |
| Unit price | product §4 (1 dòng), cart §1 anatomy | card, QV, mini cart; không mockup nào có (A20, A21) |
| Quantity rules (min, max, bước) + volume pricing | — | PDP, QV, cart, mini cart (A20) |
| Selling plan / subscription | cart, mini cart hiển thị dòng | bộ chọn trên PDP, QV (A20) |
| Pickup availability | product §5 (1 dòng + link) | drawer/dialog cửa hàng, trạng thái không có pickup (A20) |
| Form người nhận gift card | product §11 (1 câu), QV §3 (link về PDP) | anatomy, lỗi, mockup (A20) |
| Dynamic checkout | product §5 (Buy It Now), cart §3.6, mini cart §1 | QV cố ý không có (M, 04 §1) |
| Shop Pay Installments | — | PDP (TE-4 AC4), cart nếu bật (A20) |
| Giảm giá trong giỏ | cart §3.1, §3.6; mini cart §1, 4e | ô nhập mã: không bắt buộc, không làm |
| Ghi chú đơn | cart §3.5, mini cart (M3) | — |
| Bộ lọc + sắp xếp (Search & Discovery) | collection §5–§7, search §3.5–§3.6 | — |
| Recommendations (related, complementary) | product §7, §9; cart §3.8; mini cart | — |
| Localization | nút ở footer, drawer | danh sách chọn (A19) |
| Tài khoản khách mới | icon header, "Sign In" drawer | trạng thái đã đăng nhập, `<shopify-account>` (A26) |
| Media video / 3D | product §3, trạng thái E | QV (A27) |
| Thuế / duties theo market | product §4 (ghi chú thuế) | — |
| Blog comments, contact form | article §1, page §2 | — |
| Gift card page (QR, Apple Wallet) | gift-card.md | — |
| Password page | password.md | — |
| Product JSON-LD, breadcrumb JSON-LD | product §14, §17; foundation §5 | — |

### 2.4 Trạng thái và ca biên

Ký hiệu: có / thiếu / — (không áp dụng).

| Màn | Đang tải | Rỗng | Lỗi | Hết hàng | Giảm giá | Tên dài | Không ảnh | Nhiều biến thể |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Trang chủ 768/360 | có (tab) | có (tab, blog) | có (setup, video) | có | có | có (card) | có (hero) | — |
| Popup kết quả quiz | thiếu | có (no match) | thiếu | thiếu | thiếu | thiếu | thiếu | — |
| Bundle 360 thanh dính | — | thiếu | — | — | — | — | — | — |
| Product | có (J2, H) | — | có (D, J3) | có (A) | có (K) | có (h1 không cắt) | có (I) | có (J) |
| Product: gift card, unit price, pickup, selling plan, B2B | thiếu | — | thiếu | — | — | — | — | — |
| Collection | có (S7, lệch A12) | có (S6) | có (S7) | có (S5) | có | có | có | có (> 3 màu) |
| List-collections | — | có (L2) | — | — | — | không nói | có | — |
| Cart | có (State 2) | có (State 1) | có (State 3) | có (State 4) | có (State 6) | không cắt | có | có (State 5) |
| Search | có (S5) | có (S1, S2, S6a) | có (S6b) | có | có | có | có | — |
| Blog / article | có | có | có | — | — | có (3 dòng) | có | — |
| Page / contact | — | có (S5) | có (S2, S6) | — | — | — | — | — |
| 404 / password / gift card | có | có | có | có (card) | có | — | có | — |
| Navigation | có | có | có | có | có | có | có | — |
| Predictive search | có | có | có | có | có | có | có | — |
| Mini cart / quickview | có | có | có | có | có | có | có | có |
| Marketing popups | có | có | có | — | có | — | có | — |

Ghi chú ca biên demo-data (`edge_cases`): "Unit price" chưa dùng ở mockup nào; "Gift card" (gift-card-2 mệnh giá) mới dùng ở cart State 5 và QV, PDP chưa có form người nhận; "Sản phẩm số" chỉ là 1 câu ở product §11.

### 2.5 Nhất quán với foundation và sổ

| Mục | Kết quả |
| --- | --- |
| Header tối 80 mọi trang (sổ 10/11) | Đạt ở mọi spec; popup search thay chỗ header cùng nền; password, gift card thanh 80 chỉ logo (layout riêng, hợp lý) |
| Nút tròn 52 | Đạt ở carousel, gallery, quickview, phân trang collection/search; lệch ở phân trang blog (A3) |
| Eyebrow (cam nền sáng, accent-on-sand, xám nền tối) | Đạt (why, password xám; sand dùng accent-on-sand; banner trang con trắng theo foundation §3.3) |
| Chữ nút Title Case | Lệch nhỏ (A24) |
| Panel tối G3 | Lệch màu dẫn xuất ở bundle, shop the look (A13) |
| Phân trang chung | Lệch (A3, A4) |
| Bộ chọn biến thể chung PDP / QV / card | Lệch (A1, A2); card đúng hướng (chỉ báo, Quick View mở bộ chọn chung) |
| Hàng đợi popup (MK3) | marketing-popups đúng; foundation §16 còn câu cũ (A11); danh sách lớp thiếu (A16) |
| Countdown | 3 bản, 3 nguồn ngày (A14) |
| Loading không làm mờ chữ | Lệch ở collection (A12) |
| Accordion | foundation §13 "+ cam" vs Figma 1:1057 (A11) |
| Bo nút 4 (token) vs Figma 8 | Mọi spec ghi P4 và giữ token: nhất quán, chỉ cần CTO biết khi so Figma |

### 2.6 Lighthouse và A11y

Mục Lighthouse: 19/19 file trong `docs/ui-spec/` có (LCP, lazy, font, CLS, SEO, BP). Không thiếu spec nào.

Rủi ro còn sót:
- LCP mobile trang chủ: reveal ảnh hero (A8).
- AA chữ trên ảnh hero demo 360/768 ~2.7:1 ở điểm sáng (A9); card level trên gradient phụ thuộc ảnh (index-mobile-a §9.1, đã ghi).
- AA khi đang cập nhật collection (A12).
- Focus bị che bởi header dính và thanh dính đáy (A17).
- Phần tử fixed đáy chồng nhau: sticky ATC, teaser, bundle bar, cart bar, toast, banner consent (A15, A22): rủi ro target-size và nút bị che.
- Popup dialog: mọi popup có tên và nút đóng; lightbox dùng `aria-label` (đạt `aria-dialog-name`); teaser không phải dialog (đúng).
- Tên link: không còn "Read more"/"Learn more" trần trong các spec; phân trang blog dùng "Newer/Older articles" (mô tả được) nhưng sẽ đổi theo T2: giữ `aria-label` "Previous page"/"Next page" như collection.
- Vùng chạm: đạt ≥ 44 mobile, ≥ 24 desktop ở mọi spec; popover big offer × 40 desktop đạt.
- SEO: phạm vi 6 loại trang đúng sổ ở từng spec trừ foundation §20 (A11).

## 3. Ticket đề xuất (Designer)

| # | Mức | Tiêu đề | Phạm vi |
| --- | --- | --- | --- |
| T1 | CHẶN | DES-FIX: Bộ chọn biến thể chung PDP/quickview theo sổ M5 | foundation.md thêm mục "Bộ chọn biến thể" (3 trạng thái giá trị, > 10 hiện 7 + "+N", nút "+N", "Show Fewer", đang tải, lỗi "Try Again"); product.md §5.1, §12 (bỏ hoặc áp chung setting Dropdown), §17 (`minus: 7`); product.html khung J + PNG T253; mini-cart-quickview.md §3.1 trỏ về foundation, sửa nhãn; PNG T262 nếu hình đổi (A1, A2, A24) |
| T2 | CHẶN | DES-FIX: Phân trang chung toàn theme | foundation.md thêm mục "Phân trang" (tròn 52, số pill 44, accent, "Page X of Y" < 48rem, 1 hành vi đầu/cuối theo câu CTO 5); blog.md §5 + blog.html + PNG blog; article.md phân trang bình luận; collection §8, search §3.9, list-collections §4 trỏ về (A3, A4) |
| T3 | CHẶN | DES-NEW: Popup kết quả quiz + trang `collection.quiz` | spec `docs/ui-spec/quiz-result.md`; mockup 4 khổ: dialog L ≥ 768, bottom sheet < 768; trạng thái đang tìm, có kết quả (card foundation §9, Add To Cart / Quick View), không khớp (gộp bản T278), lỗi, sản phẩm hết hàng; trang `?view=quiz` không JS (A5) |
| T4 | CHẶN | DES-FIX: Thanh dính bundle 360 trang chủ | index-mobile-b §1 bỏ "chờ CTO"; T279 index.html + `index-360.png`: thanh hiện/ẩn, 0 món, đang thêm (A6) |
| T5 | NÊN | DES-SPEC: Tính năng Shopify trên PDP, card, quickview, giỏ | product.md + mockup khung mới: form người nhận gift card (checkbox, email, tên, lời nhắn, ngày gửi, lỗi), selling plan selector, Shop Pay Installments, pickup (dòng + drawer cửa hàng), unit price, quantity rules + volume pricing, sản phẩm số; foundation §9 card: unit price, card theo variant; QV, mini cart, cart: unit price, selling plan, thông báo quantity rule (A20, A21) |
| T6 | NÊN | DES-SPEC: Announcement bar và bảng chọn quốc gia/ngôn ngữ | spec + mockup 4 khổ: bar trên header tối 80 (dính hay không, link, đóng), nút gộp "USD / EN" ở footer và drawer, popover desktop / sheet mobile, ô tìm khi nhiều nước, ẩn khi 1 nước/ngôn ngữ (A18, A19) |
| T7 | NÊN | DES-SPEC: Quy tắc lớp và vùng đáy màn hình | foundation thêm mục: thứ tự xếp phần tử fixed đáy (sticky ATC, cart bar, bundle bar, teaser, toast, Inbox, banner consent), `scroll-padding` cho header và thanh đáy; marketing-popups §1.2 bổ sung lớp (lightbox, drawer lọc, kết quả quiz, localization, consent), §4 teaser theo câu CTO 3 (A15, A16, A17, A22) |
| T8 | NÊN | DES-FIX: Đồng bộ foundation và các spec lệch nhỏ | foundation §13 (icon accordion theo Figma 1:1057), §16 (bỏ "1 lần/phiên"), §20 (phạm vi SEO), §22 → "đã chốt"; §2 cặp màu panel tối dùng chung (bundle, shop the look); 1 component countdown (kích thước theo mốc, nguồn ngày theo câu CTO 2); collection §9 S7 bỏ mờ 40% + mockup S7; 1 setting "Popular searches" chung; nhãn "Keep Shopping" (A11–A14, A23, A24) |
| T9 | NÊN | DES-FIX: Trang chủ 768/360 Lighthouse và tài liệu cũ | index-mobile-a §10 bỏ reveal ảnh hero màn đầu; chọn ảnh hero demo đạt AA vùng chữ 360/768 (ghi tên file, focal point); index.md ghi "đã thay bởi index-mobile-a/b"; loại `ES1-T252/*` khỏi artifact (A8, A9, A10) |
| T10 | NÊN (theo câu CTO 1) | DES-NEW: Trang chủ 1280 | mockup HTML từ Figma 1:359 ở 1280 (hero dải rộng, intro display, shop the look, quiz, bundle, footer), PNG 1280, ghi lệch so với 1920 (A7) |

## 4. Quyết định CTO cần chốt

1. Trang chủ 1280: ticket coi Figma 1920 là desktop, sổ 09/11 đòi 1280 riêng; đề xuất trình BGĐ với Figma 1920, làm T10 trước Dev (không chặn BGĐ).
2. Nguồn ngày hết sale chung cho featured product, PDP, big offer: đề xuất metafield `custom.sale_ends_at` là nguồn chính cả 3, setting ngày chỉ dùng khi sản phẩm không có metafield.
3. Teaser Big Offer khi thanh mua PDP hiện mọi mốc: đề xuất ẩn teaser trên PDP ở mọi mốc và trên cart, trang chủ 360 đẩy teaser lên trên thanh dính bundle.
4. Quantity rules, volume pricing (B2B) và subscription: đề xuất thiết kế đủ ở PDP, quickview, giỏ, drawer theo chuẩn Theme Store nội bộ (T5); BA bổ sung dữ liệu demo.
5. Phân trang ở trang đầu/cuối: đề xuất giữ nút Previous/Next mờ 0.35 + `aria-disabled` (giữ chỗ, 0 CLS, như carousel), bỏ cách ẩn nút của collection.

## 5. Kết luận

Chưa đủ trình BGĐ: còn 4 mục CHẶN (A1–A2 bộ chọn biến thể PDP lệch sổ M5, A3 phân trang blog lệch sổ, A5 thiếu popup kết quả quiz, A6 thanh dính bundle 360 chưa vẽ); xong T1–T4 thì trình được, T5–T10 làm trước Dev.
