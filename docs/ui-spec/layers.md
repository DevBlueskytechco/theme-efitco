KHÔNG CHẮC: banner consent (Shopify Customer Privacy) và Shopify Inbox do Shopify vẽ, theme không chỉnh giao diện; id phần tử DOM, chiều cao, z-index của hai thành phần này chưa đo trên store dev (BE đo khi dựng, QA kiểm theo SRS TE-10 AC6). Số 72 cho làn Inbox là ước lượng (nút ~56–60 + 12), không phải số đo.

# UI spec: Quy tắc lớp và vùng đáy màn hình (ES1-T290, audit ES1-T283 A15, A16, A17, A22)

## Thay đổi audit

| # | Audit | Thiếu / lệch (ES1-T283) | Sửa trong spec này | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | A15 | Teaser Big Offer chỉ ẩn trên PDP < 48rem nhưng thanh mua dính mọi mốc; trang chủ 360 teaser đè thanh bundle; cart không nói | §2.3: teaser không render ở PDP (mọi mốc) và cart; trang chủ 360 teaser nằm trên thanh bundle (đáy = thanh + 16) | Sổ 10/11 audit (3); marketing-popups §4 |
| 2 | A16 | Danh sách lớp thiếu lightbox, drawer lọc, kết quả quiz, localization, consent | §4: danh sách lớp đủ 15 loại, mỗi loại ghi modal hay không, có chặn popup tự mở không | 15 §1 (một lớp một lúc); 22 §6 #5 |
| 3 | A17 | Không có `scroll-padding` cho header dính và thanh đáy (WCAG 2.2 SC 2.4.11) | §3: `scroll-padding-block-start/end` theo biến chiều cao, gồm cả khung cuộn trong drawer, sheet | WCAG 2.4.11, kỹ thuật C43; sổ 09/11 "focus nhìn thấy" |
| 4 | A22 | Chưa có quy tắc với banner consent | §5: banner là lớp, popup tự mở chờ; phần tử đáy của theme không đè banner | Sổ 09/11 (popup không mở lúc tải); 15 §1 |
| 5 | Câu CTO 3 | Big Offer ẩn PDP mọi mốc, cart; 360 trang chủ trên thanh bundle | §2.3, §6; marketing-popups §4 sửa theo | Sổ 10/11 audit (3) |

Mục đích: một chỗ duy nhất quy định phần tử nào nằm trên phần tử nào (trục z), phần tử nào ở đâu trong dải đáy màn hình (trục dọc), lớp nào chặn popup tự mở, và cách giữ focus bàn phím không bị che. Spec trang (product, cart, index-mobile-b, collection, search, navigation, mini-cart-quickview, marketing-popups) trỏ về đây thay vì tự đặt số.

Story: TE-9 (overlay toàn theme), TE-10 AC6 (Inbox không che sticky add-to-cart, cart drawer ở 360 và 1280). Figma: không có (Figma 1:359 chỉ có trang chủ desktop tĩnh). Mọi quy tắc dưới là `ĐỀ XUẤT:` theo nguồn ghi từng dòng, trừ phần đã chốt trong sổ quyết định.

Đầu ra:
- Spec này.
- Mockup: `drafts/designer/ES1-T263/marketing-popups.html` mục 5 "Bottom Of The Screen" + `marketing-popups-360|768|1280|1920.png` (ticket chỉ cho sửa thư mục ES1-T263; không có mockup riêng ES1-T290).

---

## 1. Trục z: thứ tự xếp lớp

Đọc từ trên xuống: hàng trên nằm trên hàng dưới. Số khớp code hiện có (header 10 `critical.css`, sticky bar 5 `base.css`) và kit (scrim 20, drawer/dialog 21, toast 30, teaser 15), không đổi số đã dựng.

| Bậc | z | Thành phần | Ghi chú | Nguồn |
| --- | --- | --- | --- | --- |
| Top layer trình duyệt | — | mọi `<dialog>` mở bằng `showModal()`: drawer menu, search, cart, filter; quickview; lightbox PDP; kết quả quiz; newsletter, before you leave; sheet big offer < 48rem; sheet localization < 48rem | Nằm trên mọi z-index; phần còn lại inert. Scrim là `::backdrop` (`--overlay-scrim`) | foundation §15, §16 |
| Shopify | do Shopify | banner consent, Shopify Inbox (nút và cửa sổ chat) | Theme không vượt: không z-index ≥ 1000, không đưa phần tử không modal vào top layer (`popover`) | §5; KHÔNG CHẮC giá trị z của Shopify |
| Toast | 30 | `.toast-region` | Chỉ dùng khi không có lớp modal mở (§2.4) | foundation §17 |
| Lớp nổi không modal | 21 | thẻ big offer ≥ 48rem (`show()`), bảng localization ≥ 48rem | Trên teaser, dưới toast | marketing-popups §4 |
| Scrim dự phòng | 20 | `.scrim` khi lớp không dùng `showModal` (mega menu dùng scrim riêng trong header) | — | kit `.scrim` |
| Teaser | 15 | nút Big Offer | Trên thanh đáy | marketing-popups §4 |
| Header | 10 | header dính 80 + dropdown, mega menu và scrim 50% của mega (cùng ngữ cảnh xếp của header) | Mega mở thì scrim của nó phủ thanh đáy (5) | foundation §3, §14 |
| Thanh đáy | 5 | sticky add to cart, thanh checkout cart, thanh bundle 360 | Không bao giờ trùng vùng với "dính trong trang" (một ở trên, một ở đáy) | product §10; cart §3.7; index-mobile-b §1 |
| Dính trong trang | 4 | thanh công cụ collection/search (< 64rem, top 80), panel tóm tắt cart (≥ 64rem, top 96), gallery PDP (≥ 64rem, top 104) | Dưới header để dropdown header phủ lên | collection §5.1; cart §3; product §3 |
| Nội dung | 0–2 | badge, lớp gradient card, chữ trên ảnh | — | kit |

ĐỀ XUẤT viết số qua custom property trong `assets/base.css` (giá trị dẫn xuất như `--section-gap`, không phải token màu/chữ, không vào `settings_schema`): `--layer-content: 1`, `--layer-sticky: 4`, `--layer-bottom-bar: 5`, `--layer-header: 10`, `--layer-floating: 15`, `--layer-scrim: 20`, `--layer-overlay: 21`, `--layer-toast: 30`. Không z-index literal mới ngoài thang này. Nguồn: 06 §1 (nhất quán), foundation §2 (giá trị dẫn xuất).

## 2. Trục dọc: dải đáy màn hình

### 2.1 Biến dùng chung

| Biến (trên `<html>`) | Giá trị | Ai đặt |
| --- | --- | --- |
| `--edge` | 16 (< 48rem), 24 (≥ 48rem) | CSS |
| `--bottom-bar-height` | 0 khi không có thanh; xem bảng 2.2 | CSS theo `html[data-bottom-bar="product|cart|bundle"]`; JS (BE) chỉ bật/tắt thuộc tính, không đo |
| `--inbox-clearance` | 0; 72 khi trang có nút Shopify Inbox | BE gắn `html[data-inbox]` khi thấy nút Inbox (KHÔNG CHẮC: selector, câu CTO 1) |
| `--consent-height` | 0; chiều cao banner consent khi đang hiện | BE đo bằng `ResizeObserver` (§5) |

`--bottom-bar-height` gồm cả `env(safe-area-inset-bottom)`. Code PDP hiện gắn `data-sticky-bar-visible`: đổi thành `data-bottom-bar="product"` (hoặc giữ cả hai, FE chọn) để cart và bundle dùng chung một cơ chế.

### 2.2 Ba thanh đáy (mỗi trang tối đa 1)

| Thanh | Trang | Mốc | Cao (+ safe area) | Hiện khi | Spec |
| --- | --- | --- | --- | --- | --- |
| Sticky add to cart | product | 360 | 72 | nút Add To Cart chính ra khỏi màn | product §10 |
| | | 768, 1280, 1920 | 80 | như trên; "Show on desktop" mặc định BẬT | product §10; sổ 10/11 |
| Checkout bar | cart | < 64rem (360, 768) | 72 | panel tóm tắt ra khỏi màn, giỏ có hàng | cart §3.7 |
| Bundle bar | trang chủ | 360 | 72 | lưới bundle trong màn, panel chưa vào | index-mobile-b §1; sổ 10/11 (H, thanh dính bundle 360) |

Thanh hiện: `body { padding-block-end: var(--bottom-bar-height) }` để footer và nội dung cuối trang không bị che (đã có ở product §10, cart §3.7; gom về một quy tắc).

### 2.3 Vị trí từng phần tử nổi (mép dưới)

| Phần tử | Làn | Mép dưới | Ẩn khi | Nguồn |
| --- | --- | --- | --- | --- |
| Thanh đáy | cả bề ngang | 0 | lớp có scrim mở; banner consent đang hiện | product §10 ĐỀ XUẤT ẩn khi overlay mở; §5 |
| Teaser Big Offer | trái | `--edge + --bottom-bar-height` | trang product (mọi mốc), cart: không render; lớp có scrim mở; banner consent hiện; < 48rem khi toast đang hiện | Sổ 10/11 audit (3); 15 §1 (một lớp) |
| Thẻ big offer ≥ 48rem | trái, trên teaser | `--edge + 48 + 12` | — | marketing-popups §4 |
| Nút Shopify Inbox | phải | của Inbox + `--bottom-bar-height` (theme dịch lên, câu CTO 1) | do Inbox | SRS TE-10 AC6; 14 §1 #940D (chat góc dưới phải) |
| Toast < 48rem | cả bề ngang (lề 16) | `--edge + --bottom-bar-height + --inbox-clearance` | — | foundation §17; product §10 (toast trên thanh 72 + 16) |
| Toast ≥ 48rem | phải, rộng 400 | `--edge + --bottom-bar-height + --inbox-clearance` | — | foundation §17 |
| Banner consent | do Shopify | 0 | khách đã chọn | §5 |

Dịch vị trí bằng `translate` (không đổi `bottom`, không layout), 250 ms `--ease-out`; `prefers-reduced-motion` thì đổi ngay. Nguồn: sổ 09/11 (chỉ transform/opacity), foundation §19.

Hai phần tử chạm được gần nhất trong dải đáy cách nhau ≥ 16 (04 §1; 14 #1094M): teaser ↔ thanh 16, teaser ↔ toast không cùng lúc dưới 48rem, teaser (trái, ~212) ↔ toast ≥ 48rem (phải, 400) ở 768 cách ≥ 100.

### 2.4 Toast khi có lớp modal

Lớp modal (top layer) làm toast-region bên ngoài bị inert và nằm dưới. Quy tắc: phản hồi của thao tác trong lớp modal hiện trong vùng `role="status"`/`role="alert"` của chính lớp đó (cart drawer, quickview, form newsletter đã có); toast-region chỉ dùng khi không có lớp modal mở. Nguồn: foundation §17, 15 §1 (một lớp), 05 (phản hồi gần chỗ thao tác).

### 2.5 Màn thấp

`@media (max-height: 30rem)` (điện thoại ngang; 1280 × 900 phóng 200%): teaser không hiện; thanh đáy giữ (là CTA); ĐỀ XUẤT header thôi dính để header 80 + thanh 72–80 không chiếm > 1/3 màn (câu CTO 3). Nguồn: WCAG 1.4.10 Reflow; 03 (zoom 200% không vỡ); 14 #1096M.

### 2.6 Nút back-to-top

SRS TE-10 AC6 nhắc "back-to-top" nhưng không spec, Figma nào có. ĐỀ XUẤT không thêm: header dính 80 luôn có đường về đầu trang (logo, phím Home), mỗi phần tử đáy thêm là một rủi ro che (A15). Nếu CTO muốn thêm: làn phải, trên làn Inbox, `--edge + --bottom-bar-height + --inbox-clearance`, toast đẩy lên thêm 56.

## 3. Focus không bị che (WCAG 2.2 SC 2.4.11, kỹ thuật C43)

```css
html {
  scroll-padding-block-start: calc(var(--sticky-top, 0px) + var(--space-4));
  scroll-padding-block-end: calc(var(--bottom-bar-height, 0px) + var(--consent-height, 0px) + var(--space-4));
}
```

| Biến | Giá trị |
| --- | --- |
| `--sticky-top` | 0 khi `sticky_header` tắt; `--header-height` (80) khi bật; + chiều cao thanh công cụ dính collection/search dưới 64rem (đặt cố định theo bố cục collection §5.1, không đo) |

- Áp cho: Tab tuần tự, link neo (`#reviews`, skip link, link lỗi form → trường), `scrollIntoView` của BE (cuộn về bộ chọn khi "Choose Options", product §10). Trình duyệt cuộn phần tử nhận focus vào vùng trừ padding.
- Khung cuộn riêng có phần dính: `scroll-padding-block-end` bằng chiều cao phần dính đáy khung: drawer có chân dính (foundation §15, chân cao nút + 2 × 16), drawer lọc (chân "Clear all" + "Show N products"), quickview sheet (hàng mua 48 + 2 × 16, mini-cart-quickview §3.1), predictive search (chân dính). `scroll-padding-block-start` bằng header khung khi header khung dính (quickview sheet nút đóng dính).
- Thanh đáy và teaser tự thân không bao giờ che focus của chúng; focus ở nội dung dưới thanh thì scroll-padding đẩy lên.
- Kiểm (QA): Tab qua footer PDP 360 khi sticky bar hiện, Tab qua dòng giỏ cart 360 khi checkout bar hiện, Tab qua card bundle 360 khi bundle bar hiện: viền focus luôn thấy đủ. Phóng 200% ở 1280 lặp lại.

Nguồn: WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum), kỹ thuật C43 "Using CSS scroll-padding to un-obscure content"; 06 §1 (focus nhìn rõ); sổ 09/11.

## 4. Danh sách lớp và hàng đợi popup tự mở

"Lớp" = thứ đang chiếm sự chú ý của người mua. Có lớp mở thì popup tự mở (newsletter, before you leave) không mở; quy tắc chờ, nghỉ 3 s, ưu tiên ở marketing-popups §1.2 (sổ 10/11 MK3–MK5).

| # | Lớp | Kiểu | Mở bởi | Chặn popup tự mở | Thanh đáy, teaser |
| --- | --- | --- | --- | --- | --- |
| 1 | Popup newsletter, before you leave | modal | tự mở | có (chính nó) | ẩn (dưới scrim) |
| 2 | Thẻ big offer | sheet modal < 48rem, popover ≥ 48rem | người mua | có (sổ 10/11 MK5) | < 48rem ẩn; ≥ 48rem giữ (teaser là nút điều khiển) |
| 3 | Drawer menu | modal | người mua | có | ẩn |
| 4 | Mega menu, dropdown header | không modal, scrim 50% (mega) | rê / bấm | có, khi đang mở | mega: dưới scrim header; dropdown: giữ |
| 5 | Search (drawer, predictive) | modal / dropdown | người mua | có | ẩn |
| 6 | Cart drawer, mini cart | modal | người mua, thêm giỏ | có | ẩn |
| 7 | Quickview | modal | người mua | có | ẩn |
| 8 | Lightbox ảnh PDP | modal | người mua | có | ẩn |
| 9 | Drawer lọc (collection, search) | modal | người mua | có | ẩn |
| 10 | Popup kết quả quiz | modal (sheet < 48rem) | người mua (xong quiz) | có | ẩn |
| 11 | Bảng localization (quốc gia, ngôn ngữ) | sheet modal < 48rem, popover ≥ 48rem | người mua | có | < 48rem ẩn |
| 12 | Banner consent Shopify | Shopify | Shopify, lúc tải | có, tới khi khách chọn (§5) | ẩn (§5) |
| 13 | Cửa sổ chat Shopify Inbox | iframe | người mua | có khi focus ở trong iframe (coi như đang gõ) | do Inbox |
| — | Toast | không phải lớp | thao tác | không | toast < 48rem ẩn teaser |
| — | Thanh đáy, teaser | không phải lớp | cuộn | không | — |
| — | Ô nhập đang focus (`input`, `textarea`, `select`, `[contenteditable]`, iframe) | không phải lớp | người mua | có, trong lúc focus | — |

Cách nhận biết (BE, một module): `dialog` sự kiện `toggle`/`close`; `details[open]` của header; thuộc tính `aria-expanded="true"` trên nút mở mega/localization/big offer; banner consent theo §5; `document.activeElement`. ĐỀ XUẤT markup mỗi lớp có `data-layer` để module đếm, không phải liệt kê class (FE gắn khi dựng block). Nguồn: 15 §1, §7 (chức năng giống nhau cùng cách mở/đóng); 22 §6 #5.

Lớp đóng → thanh đáy, teaser hiện lại nếu điều kiện riêng của chúng còn đúng (thanh: nút chính/panel vẫn ngoài màn; teaser: đã cuộn ≥ 25%). Ẩn/hiện: opacity + translate 200/250 ms (15 §3 #7).

## 5. Banner consent (Shopify Customer Privacy)

Theme không vẽ, không đổi chữ, không đổi vị trí banner (Shopify admin quản lý; chỉ hiện ở thị trường cần consent). Theme chỉ cư xử đúng quanh nó.

1. **Là lớp:** đang hiện thì popup tự mở không mở; thời gian, độ cuộn vẫn tính. Khách chọn (sự kiện `visitorConsentCollected` trên `document`) → nghỉ 3 s → hàng đợi chạy như marketing-popups §1.2 điều 3. Trang tải mà `Shopify.customerPrivacy.shouldShowBanner()` là `false` thì bỏ qua. KHÔNG CHẮC: tên API theo Customer Privacy API của Shopify, BE xác nhận trên store dev.
2. **Phần tử đáy không đè banner:** khi banner hiện, thanh đáy và teaser không hiện (thuộc tính `data-bottom-bar` không gắn, teaser chờ); khách chọn xong thì hiện nếu điều kiện còn đúng. Lý do: banner đáy trên 360 cao tới ~40% màn, thêm thanh 72 + teaser là che quá nửa (15 §1 "không che nội dung chính"); banner cần được trả lời trước (câu CTO 2).
3. **Toast** vẫn hiện (phản hồi thao tác, 05), đẩy lên trên banner: `--edge + --consent-height`. Không đo được banner thì toast giữ chỗ cũ và nằm dưới banner (banner thắng); số giỏ trong header + vùng `role="status"` vẫn báo kết quả.
4. **z:** theme không vượt banner (§1). Lớp modal người mua tự mở (drawer, quickview) vẫn lên top layer, phủ banner trong lúc mở: chấp nhận vì người mua chủ động; đóng lớp thì banner còn nguyên.
5. **Focus:** `--consent-height` vào `scroll-padding-block-end` (§3) để Tab trong trang không nằm dưới banner.
6. **Không JS:** không popup, không teaser, không thanh đáy JS; banner do Shopify.

Nguồn: sổ 09/11 (popup không mở lúc tải; A11y focus nhìn thấy); 15 §1 (một lớp, không che nội dung chính); 22 §7 (permission begging: không xin thêm khi đang hỏi); WCAG 2.4.11.

## 6. Ma trận trang × mốc (phần tử đáy)

| Trang | 360 | 768 | 1280 / 1920 |
| --- | --- | --- | --- |
| Trang chủ | bundle bar 72 khi lưới bundle trong màn; teaser trái, đáy 16 → 88 khi bundle bar hiện | teaser trái đáy 24; không thanh | teaser trái đáy 24; không thanh |
| Product | sticky ATC 72; KHÔNG teaser; toast trên thanh (88) | sticky ATC 80; KHÔNG teaser; toast phải đáy 104 | như 768 |
| Cart | checkout bar 72; KHÔNG teaser | checkout bar 72; KHÔNG teaser | panel dính trong trang, không thanh đáy; KHÔNG teaser |
| Collection, search | không thanh đáy (toolbar dính trên, top 80); teaser đáy 16 | teaser đáy 24 | teaser đáy 24 |
| Blog, article, page, list-collections | teaser đáy 16 | teaser đáy 24 | teaser đáy 24 |
| 404, password, gift card | không teaser, không popup (marketing-popups §1) | | |

Số mép dưới chưa cộng `--inbox-clearance` (toast) và safe area. Teaser chỉ khi sản phẩm còn hàng, có giá gạch, chưa hết giờ, đã cuộn ≥ 25% (marketing-popups §4).

## 7. Trạng thái

Figma không có. ĐỀ XUẤT, mockup ES1-T263 mục 5.

| Trạng thái | Hiển thị |
| --- | --- |
| Trang chủ 360, bundle bar hiện | teaser trượt lên 72, đáy 88; bundle bar "5 Items · $436.90" + "Add Bundle To Cart" (dữ liệu index-mobile-b §1) |
| Trang chủ 360, toast | teaser ẩn; toast full width trên thanh |
| PDP mọi mốc | sticky ATC "Ativafit Lava 66 lb Adjustable" $379.99 / $499.99; không teaser |
| Cart < 64rem | checkout bar "Total $461.99" + "Checkout →" (cart §3.7); không teaser |
| Banner consent hiện | thanh đáy và teaser không hiện; popup tự mở chờ; toast trên banner |
| Lớp modal mở | thanh đáy, teaser ẩn dưới scrim; phản hồi trong lớp |
| Màn thấp | teaser không hiện |

Mockup: ảnh card bundle P09/P10 (kettlebell, dây thừng) lệch tên "Adjustable dumbbell pair", "Foldable bench" như mockup trang chủ ES1-T279 (ảnh store dev lệch tên, ES1-T245); banner consent vẽ khung giả nét đứt, không phải giao diện Shopify.

## 8. Accessibility

- SC 2.4.11: §3. SC 2.5.8 Target Size: mọi control dải đáy ≥ 44 (teaser 48, × teaser 44 × 48, nút thanh 48, toast × 44); cách nhau ≥ 16 (§2.3).
- Thứ tự DOM: thanh đáy nằm ngay sau phần tử nó lặp lại (sticky ATC sau form, checkout bar sau panel, bundle bar sau panel bundle) hoặc cuối `<main>`; teaser, toast-region cuối `<body>` sau `<main>` (marketing-popups §9). Ẩn thanh, teaser thì `visibility: hidden` + `inert` (không để control vô hình nhận Tab).
- Ẩn vì lớp modal: không cần `aria-hidden` thêm (top layer đã inert phần còn lại).
- Thanh đáy là `<aside aria-label="…">` riêng tên: "Quick add to cart", "Cart total and checkout", "Bundle total"; không `role="dialog"`.
- Màu: dùng màu của từng spec (thanh panel #393942 chữ trắng 11.4:1, sticky ATC nền trắng). Không thêm cặp màu mới.

## 9. Lighthouse

- CLS 0: mọi phần tử đáy `position: fixed`, đổi vị trí bằng `translate`; `padding-block-end` của body chỉ đổi khi thanh hiện sau tương tác cuộn (không trong lần đo tải trang, thanh ẩn lúc tải).
- Không phần tử đáy nào hiện lúc tải (thanh theo IntersectionObserver sau cuộn; teaser sau cuộn 25%; popup sau thời gian/cuộn/rời trang) → không là LCP, không ảnh hưởng TBT.
- JS: module lớp gộp vào module popup (marketing-popups §9), nạp lúc rảnh; listener cuộn `passive`.
- A11y: không control ẩn nhận focus (`inert`); không `aria-hidden` chứa phần tử focus được.

## 10. Map sang code

| Phần | Code hiện có | Thiếu |
| --- | --- | --- |
| Thang z | header 10 (`critical.css` `.block-container:has(> .site-header)`), `.product-sticky-bar` 5 | custom property `--layer-*` (§1), FE |
| Biến đáy | `.product-sticky-bar` padding `env(safe-area-inset-bottom)`, `data-sticky-bar-visible` | `html[data-bottom-bar]` → `--bottom-bar-height`, body padding chung; cart bar, bundle bar dùng chung (FE CSS, BE bật thuộc tính) |
| scroll-padding | chỉ `scroll-padding-inline` cho hàng cuộn ngang | `html` block-start/end (§3), khung cuộn drawer, sheet (FE) |
| Teaser | — | không render ở `template.name == 'product'` và `'cart'` (Liquid, FE); dịch theo `--bottom-bar-height` (CSS) |
| Lớp, consent, Inbox | — | BE: module đếm `data-layer`, sự kiện consent, `data-inbox`, `--consent-height` |

## 11. Đề xuất cho file ngoài phạm vi ticket (không sửa ở đây)

- `docs/ui-spec/foundation.md` §16, §17: thêm dòng trỏ `layers.md` (hàng đợi, vị trí toast theo biến, toast trong lớp modal); §21 thêm thang z.
- `docs/ui-spec/product.md` §10: thay "ĐỀ XUẤT ẩn thanh khi drawer…" bằng trỏ `layers.md` §4; ghi "trang sản phẩm không có teaser Big Offer (sổ 10/11)".
- `docs/ui-spec/cart.md` §3.7: trỏ `layers.md` §2 (biến chung, không teaser).
- `docs/ui-spec/index-mobile-b.md` §1: bundle bar dùng `data-bottom-bar="bundle"`, cao 72; teaser nằm trên (layers §2.3).
- `docs/ui-spec/navigation.md`: header thôi dính khi `max-height: 30rem` nếu CTO duyệt câu 3.
- `docs/ui-spec/collection.md` §5, `search.md`, `mini-cart-quickview.md` §3.1, `predictive-search.md`: `scroll-padding` trong khung cuộn (layers §3); gắn `data-layer`.

## Quyết định CTO cần chốt

1. Shopify Inbox: theme tự dịch nút Inbox lên trên thanh đáy bằng CSS (`--bottom-bar-height`) và chừa làn 72 cho toast, hay chỉ hướng dẫn merchant chỉnh Inbox? Đề xuất: theme dịch + chừa làn, QA đo TE-10 AC6 ở 360 và 1280.
2. Banner consent đang hiện: ẩn thanh dính đáy và teaser tới khi khách chọn? Đề xuất: có, toast vẫn hiện trên banner.
3. Màn thấp (`max-height: 30rem`, điện thoại ngang, zoom 200%): header thôi dính, teaser ẩn? Đề xuất: có cả hai, thanh mua giữ.
