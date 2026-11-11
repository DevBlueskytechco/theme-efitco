KHÔNG CHẮC: demo-data không có menu (linklists) và mọi collection có `image` rỗng. Cấu trúc menu cấp 2, 3 và ảnh danh mục (efx-col-1..5.jpg của block Browse Categories 1:395) trong mockup là đề xuất, đã hỏi BA ở ES1-T271. Ảnh sản phẩm Home Starter Kit (P19) trên store dev là dây nhảy, lệch tên (ES1-T245).

# UI spec: Mega menu desktop và menu drawer mobile (ES1-T260, vòng 3)

## Thay đổi so với vòng 2

| # | Phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header khi đóng | trang chủ trong suốt đè hero, trang con trắng | mọi trang thanh tối `--color-background-dark` + noise, cao 80, không đè ảnh; hero / banner nằm dưới | Sổ 10/11, Figma 1:362, 1:361; foundation §3 |
| 2 | Header khi mega mở | chuyển nền trắng, chữ foreground | giữ tối; panel trắng ngay dưới đáy header, viền trên 1px border | foundation §3.2, §14; sổ 10/11 |
| 3 | Mục menu | trắng 60% chỉ trên hero; trên trắng chữ foreground; hover gạch 1px; đang mở gạch 2px | luôn trắng 60% (#A3A3A3, 6.93:1); hover và đang mở trắng 100%, đang mở thêm chevron lật; chỉ trang hiện tại gạch chân 2px offset 0.45em | Figma 1:365; kit `.site-header__link` |
| 4 | Focus mục menu, icon header | outline cam (trên hero trắng) | outline trắng 2px offset 2 (cam trên tối 3.48:1) | foundation §3.2 |
| 5 | Icon header | 3 icon 24 | search 20, account / cart 24, ô 44 cách 4 | Figma 1:373; foundation §3.1 |
| 6 | Logo | 100 (mockup override kit 140) | 100 × 30 mọi mốc, lấy từ kit | Figma 1:377 |
| 7 | Drawer | khung riêng `.nav-drawer` | dùng kit `.drawer--start` + `.overlay__header/__body/__footer`; nền trắng, phủ cả thanh tối | foundation §15 |
| 8 | Hàng cấp 1 drawer | 56 | 52 (kit `.drawer-menu`) | foundation, kit §11 |
| 9 | Trang phía sau trong mockup | hero tràn từ y 0 dưới header trong suốt | trang chủ: hero bắt đầu y 80, ≥ 80rem bo 16 lùi `--band-inset` (Figma 1:361 x 61, 1798 × 827); < 80rem tràn mép không bo (sổ 07/11). Trang con: breadcrumb + tiêu đề | Sổ 10/11 |
| 10 | Trạng thái header trong mockup | 2 dải (trên hero, trên trắng) | 1 dải tối: open, hover, focus, current, default | foundation §3.2 |
| 11 | Chevron tròn 52 | — | không dùng trong overlay điều hướng (không có hàng cuộn ngang; panel B xuống hàng khi > 5 ô) | foundation §6 |

Giữ nguyên: cấu trúc 3 biến thể panel, card sản phẩm nổi bật, drawer 2 cấp + Back, 2 setting đề xuất, mọi trạng thái, bàn phím, Lighthouse. Đối chiếu foundation §14: foundation lấy Collection làm ví dụ dropdown; spec này giữ quy tắc chọn theo dữ liệu (§3), Collection ra dropdown C khi tắt "Show collection images in menu".

Mục đích: người mua thấy toàn bộ danh mục trong 1 lần mở, đi thẳng tới collection hoặc sản phẩm nổi bật; trên mobile đi được 2 cấp mà không mất chỗ đang đứng. Story TE-17 (cha), TE-1 AC2 (menu 2 cấp, hover + bàn phím, drawer mobile).

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T260/navigation.html` (nhúng `../_kit/kit.css`) + `navigation-360|768|1280|1920.png`. Mỗi PNG là thiết kế của mốc đó: ≥ 1280 là mega menu, < 1280 là drawer. Trạng thái ở cuối file.

Nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:362 (header, chỉ trạng thái đóng, desktop 1920), 1:361 (hero dưới header) > `docs/ui-spec/foundation.md` vòng 3 §3, §6, §14, §15 > kiến thức 14, 15, 18, 22, 04, 05, 06, 03. Không dùng trang live hay ảnh chụp store làm gốc. Figma không có panel mở, drawer, trạng thái: mọi thứ ngoài header đóng là `ĐỀ XUẤT:` kèm nguồn.

Hành vi hiện tại (`blocks/header.liquid`, `assets/header-menu.js`, `assets/critical.css`): menu 2 cấp; ≥ 80rem mỗi mục cha mở dropdown nhỏ `.site-header__submenu` (hover 150ms, Esc, focusout đóng); < 80rem drawer `<details>` trái rộng `min(22rem, 100vw − 3.5rem)`, cấp 2 là accordion, nút đóng 44 không tiêu đề, focus trap bằng JS. Không đọc cấp 3. Mục §10 liệt kê phần đổi.

---

## 1. Figma và mốc

| Mốc | Hiển thị | Nguồn |
| --- | --- | --- |
| 1280, 1920 (≥ 80rem) | Menu ngang 7 mục giữa header, mục có cấp con mở mega menu hoặc dropdown | Figma 1:365; code `.site-header__nav` hiện từ 80rem |
| 1024, 768, 360 (< 80rem) | Nút menu trái mở drawer 2 cấp | code `.site-header__drawer` ẩn từ 80rem |

Figma 1:362 trên nền 1:360: thanh #1A1A1A có noise cao 80; 1:365: 7 mục Shop ▾, Collection ▾, Sale, Our Story, Blog, Contact, Help; Inter 16/500, cao chữ 24–26, khoảng cách 40, cả hàng opacity 0.6; chevron 9 × 5, cách chữ 4; logo 1:377 100 × 30 tại x = 252; icon 1:373: search 20, account 24, cart 24, cách 24. Hero 1:361 bắt đầu y 80, ngay dưới thanh tối.
Mega bắt đầu từ 80rem (menu ngang chỉ có từ 80rem, foundation §14 vòng 3); 1024 dùng drawer.

## 2. Anatomy

Mega menu (≥ 80rem):
1. Trigger: `<summary>` của mục cha (chữ + chevron), `aria-expanded`. Thanh header tối giữ nguyên khi mở.
2. Scrim: phủ trang từ đáy header xuống, `--overlay-scrim` (50%); header không bị phủ.
3. Panel: full bề ngang viewport, ngay dưới header (top 80), nền `--color-background`, viền trên 1px `--color-border`, bóng `--shadow-raised`; nội dung thẳng lưới container (1240 / 1416).
4. Biến thể A "Cột link": cột = link cấp 2 có cấp 3. Mỗi cột: tiêu đề cột (link tới URL cấp 2) + danh sách link cấp 3. Link "View all …" đứng đầu cột 1 (URL mục cha).
5. Card sản phẩm nổi bật (biến thể A, tuỳ chọn): ảnh, badge giảm giá, eyebrow "Featured", tên, giá.
6. Biến thể B "Ô ảnh danh mục": tiêu đề panel (= tên mục cha) + link "View all collections" + hàng ô collection (ảnh 336/220, tên, số sản phẩm).
7. Biến thể C "Dropdown nhỏ": giữ `.site-header__submenu` hiện có.

Menu drawer (< 80rem):
1. Nút menu trong thanh tối (`header-drawer-toggle`, ô 44, lùi −12), `aria-expanded`.
2. Scrim toàn màn (phủ cả thanh tối ở phần 10% bên phải).
3. Drawer trái nền trắng (kit `.drawer--start`; thanh tối không lặp vào drawer, foundation §15): `.overlay__header` (tiêu đề "Menu" + nút đóng 48) · `.overlay__body` cuộn riêng · `.overlay__footer` (Sign In, Currency, Language).
4. Cấp 1: hàng link; mục có con là nút có chevron ›.
5. Cấp 2 (trượt vào trong cùng drawer): nút Back + nút đóng · tiêu đề cấp 2 · "View all …" · nhóm (tiêu đề nhóm = link cấp 2 có cấp 3, dưới là link cấp 3) hoặc hàng collection có ảnh 56 · card sản phẩm nổi bật cuối danh sách (nếu có).

## 3. Quy tắc chọn biến thể (theo dữ liệu menu, không có setting từng mục)

ĐỀ XUẤT (nguồn: sổ quyết định 07/11 "dữ liệu luôn lấy động"; AGENTS "Keep settings flat"; 18 C2 mega menu nhóm có tiêu đề):

| Dữ liệu mục cha | ≥ 80rem | < 80rem (cấp 2 trong drawer) |
| --- | --- | --- |
| Không có con | link thường | hàng link |
| Có ít nhất 1 con có cấp 3 | A: cột link (+ card sản phẩm nếu đã chọn) | nhóm có tiêu đề + card |
| Mọi con là `collection_link`, không cấp 3, setting ảnh bật | B: ô ảnh | hàng có ảnh 56 |
| Còn lại (trang, link ngoài, ảnh tắt) | C: dropdown nhỏ hiện có | hàng link |

- Con không có cấp 3 nằm chung với con có cấp 3 (A): đặt ngay sau "View all …" trong cột 1, cùng kiểu link.
- Số cột A: tối đa 3 khi có card, 4 khi không có. Cột thứ 5 trở đi xuống hàng mới. Khuyên merchant ≤ 7 link mỗi cột (18 A3 chunking 7±2); theme không cắt link.
- B: 5 ô một hàng; 6–10 ô xuống hàng thứ 2. Panel cao tối đa `100dvh − 80`, quá thì panel cuộn riêng.
- Nhãn "View all …" theo loại link cha (SEO: chữ link mô tả đích, sổ quyết định 09/11): `catalog_link` → "View all products"; `collections_link` → "View all collections"; `collection_link` → "View all {{ title }}"; loại khác → "View all {{ title }}". Không có "View all" trần.

Menu đề xuất cho demo (chờ ES1-T271): Shop (/collections/all) > Categories (5 figma-cat-*), Training Level (3 figma-level-*), Featured (Bundle, Setup, Portable Fitness, Weight) → biến thể A; Collection (/collections) > 5 figma-cat-* → biến thể B; Sale, Our Story, Blog, Contact, Help không con.

## 4. Settings merchant

Không đổi setting hiện có (`logo`, `logo_width`, `menu`, `customer_account_menu`, `sticky_header`). ĐỀ XUẤT thêm 2 setting cho block `header` (xem câu CTO 2):

| Tên (label) | Id | Kiểu | Default | Giới hạn, ghi chú |
| --- | --- | --- | --- | --- |
| Show collection images in menu | `menu_collection_images` | checkbox | true | Tắt thì B thành C (desktop) và hàng không ảnh (drawer) |
| Featured product in menu | `menu_featured_product` | product | trống | Hiện card ở panel A đầu tiên và cuối cấp 2 tương ứng trong drawer. Trống thì không có card. Demo: `figma-home-starter-kit` |

Chữ cố định qua locale `blocks.header.*` (không setting): `menu_title` "Menu", `back` "Back", `back_label` "Back to menu", `featured` "Featured", `view_all_products`, `view_all_collections`, `view_all` ("View all {{ title }}"), `sign_in` "Sign In", `currency` "Currency", `language` "Language". Số sản phẩm dùng lại `blocks.level_card.products_count` ("7 Products").

## 5. Layout theo mốc

### 5.1 Desktop 1280 và 1920 (mega)

| Giá trị | 1280 | 1920 | Token / cách tính |
| --- | --- | --- | --- |
| Header | 80, nền `--color-background-dark` + noise mọi trang, kể cả khi panel mở | như 1280 | `--header-height`, `--dark-texture` |
| Menu ngang | chữ 16/500 ls −0.04em, gap 40, ô bấm cao 44 | như 1280 | Figma 1:365 itemSpacing 40; kit `.site-header__link` |
| Panel top | 80 | 80 | ngay đáy header |
| Panel padding-block | 40 / 48 | 40 / 48 | `--space-1 × 10` / `--space-7` |
| Bề rộng nội dung | 1240 | 1416 | `--content-width` |
| A: lưới | 3 cột × 266 + card 346, gap 32 | 3 × 307 + card 399 | `repeat(3, 1fr) 1.3fr`, gap `--space-6` |
| A: tiêu đề cột | 14/600 uppercase, tracking 0.04em, `--color-muted`, cao 40 | | kit `.mega__title` |
| A: link | Inter 16/400, cao 40, `--color-foreground` | | foundation §14 |
| A: "View all …" | 16/600, gạch chân, mũi tên 16 × 13 | | 14 §1, 18 C2 |
| Card sản phẩm | nền cream, bo 12, padding 16; ảnh 3/2 bo 8 nền trắng `contain`; eyebrow 14/800 accent; tên 18/600 hiện đủ, không cắt; giá 16 | ảnh 367 × 245 | `--radius-card`, `--color-background-cream` |
| B: tiêu đề + View all | heading 700 28 trái; text link phải; cách hàng ô 24 | | `--font-size-h3`, `--space-5` |
| B: ô | 5 cột × 229, gap 24; ảnh 229 × 150 bo 16 | 5 × 264, ảnh 264 × 173 | Figma 1:404 ảnh 336 × 220 bo 16 |
| B: chữ dưới ảnh | cách ảnh 12; tên 16/600; số 14 muted | | |
| Scrim | từ y = 80 tới đáy viewport | | `--overlay-scrim` |

Khi panel mở: header giữ tối (sổ 10/11; foundation §3.2, §14), không đổi chiều cao. Mục đang mở trắng 100% + chevron xoay 180°; mục khác vẫn trắng 60%; trang hiện tại vẫn gạch chân. Panel trắng tách khỏi thanh tối bằng viền trên 1px `--color-border` và bóng `--shadow-raised` phía dưới.

### 5.2 Tablet 768 (và 1024)

- Drawer trái rộng 420, cao toàn màn, phủ cả thanh tối; phần trang bên phải (thanh tối + hero / nội dung) lộ dưới scrim (chạm để đóng).
- Nội dung drawer giống 360; không tăng cỡ chữ (drawer cùng bề rộng 420 ở 768 và 1024).
- `.overlay__header` 72: padding 12 / 12 / 12 / 24; tiêu đề "Menu" heading 700 `--font-size-h3` (24 ở 768); nút đóng 48 cách mép phải 12.
- Thân: padding 8 / 24 / 24. Tiêu đề cấp 2 heading 800 uppercase `--font-size-h2` (32 ở 768).

### 5.3 Mobile 360

| Phần | Giá trị | Nguồn |
| --- | --- | --- |
| Drawer | rộng 90% (324), cao 100dvh | 15 §2 #3, foundation §15 |
| Header drawer | cao 72; "Menu" 22; × 48 cách mép 12 | 14 §3 (× cách mép ≥ 12), 15 §1 (× ≥ 48) |
| Hàng cấp 1 | cao 52, Inter 18/500, gạch dưới 1px border, chevron › 12 muted | kit `.drawer-menu`; 14 #1083M điều hướng ≥ 44 |
| Header cấp 2 | Back (chevron ‹ 12 + "Back" 14 muted, cao 44) trái; × 48 phải | 14 §3: back nhỏ và nhạt hơn × |
| Tiêu đề cấp 2 | heading 800 uppercase 28, cách trên 16 | foundation §1 h2 |
| "View all …" | hàng 52, 16/600 gạch chân, mũi tên phải | 14 §1, 18 C2 |
| Nhóm cấp 3 | tiêu đề nhóm 14/600 uppercase muted (link, cao 44), cách nhóm trên 24; link 16/400 cao 48 | 14 #1094M khoảng cách chạm |
| Hàng collection có ảnh | cao 72; ảnh 56 × 56 bo 8 `cover`; gap 16; tên 16/500; số 14 muted | |
| Card sản phẩm | ngang: ảnh 96 nền trắng + chữ; nền cream bo 12 padding 12; cách nhóm trên 32 | |
| Chân drawer | viền trên; Sign In (icon 24 + chữ 16/500, cao 44); 2 nút Currency / Language cao 44 viền `--color-muted-light`, xuống dòng khi hẹp | foundation §15 (account, localization); sổ quyết định 09/11 viền ô nhập |

## 6. Tương tác, bàn phím, chuyển động

Desktop:
- Mở: rê chuột lên mục cha 150ms (code `HOVER_DELAY`), hoặc bấm / Enter / Space trên trigger. Cảm ứng ≥ 80rem: chạm để mở/đóng (code chỉ hover với `pointerType mouse`).
- Đang mở mà rê sang mục cha khác: đổi nội dung ngay, không chạy lại hiệu ứng (05 §2, 15 §4). Rê sang mục không có con: đóng panel.
- Đóng: rời cả header và panel 150ms; Esc (focus về trigger); bấm scrim; bấm lại trigger; Tab ra khỏi panel (code focusout). Panel không bẫy focus (disclosure, không phải dialog).
- Thứ tự Tab: trigger → link trong panel theo cột (trái sang phải, trên xuống) → card → mục cha kế tiếp. Focus "không lọt": khi panel đóng, link bên trong không nhận focus (details đóng); khi mở, Tab không đi xuống trang dưới scrim trước khi qua hết panel.
- Không JS: bấm trigger mở panel, bấm lại đóng; scrim là phần của `<summary>` như drawer hiện tại nên bấm vào cũng đóng.

Drawer:
- Mở: chạm nút menu; focus vào nút đóng (code). Khoá cuộn trang (`scroll-lock`).
- Cấp 2: chạm hàng có ›; panel cấp 2 trượt vào, focus vào Back. Back: về cấp 1, focus về hàng vừa mở.
- Đóng: ×, chạm scrim, Esc (ở bất kỳ cấp nào đóng cả drawer), vuốt sang trái trên drawer (ĐỀ XUẤT, 15 §1 "mobile hỗ trợ vuốt", BE làm nếu còn ngân sách). Đóng thì focus về nút menu, lần mở sau về cấp 1.
- Tab bẫy trong drawer (code `#trapFocus`), chỉ tính phần tử của cấp đang hiện.
- Không JS: cấp 2 là accordion `<details>` tại chỗ (code hiện tại), không trượt, không Back.

Chuyển động (foundation §19; 15 §4; ux-motion; chỉ transform/opacity; tắt khi `prefers-reduced-motion`):

| Thành phần | Vào | Ra |
| --- | --- | --- |
| Panel mega | 250 `--ease-out`, opacity 0 → 1, translate −8 → 0 (`motion-drop` có sẵn) | 150 opacity |
| Đổi panel khi rê sang mục khác | không hiệu ứng | không |
| Scrim | 250 opacity | 150 |
| Mục menu 60% → 100%, chevron xoay | 150 màu, 250 rotate | 150 |
| Link trong panel hover | 150, chữ accent + dịch 4px (code `.site-header__submenu` đã có) | 150 |
| Ô ảnh hover | ảnh scale 1.04, 500 | 500 |
| Drawer | 250 translate −100% → 0 | 200 |
| Cấp 2 drawer | 250 translate 100% → 0; cấp 1 mờ về 0 | 200 |

## 7. Trạng thái

Figma không có trạng thái nào; tất cả ĐỀ XUẤT (05 §3, 05 §6–7, 14 #928M, foundation §18). Mockup: phần 3 (desktop) và "States" cuối file.

| Trạng thái | Desktop | Drawer |
| --- | --- | --- |
| Mục menu default | trắng 60% trên thanh tối, mọi trang (Figma 1:365) | hàng 18/500 foreground |
| Hover | trắng 100% | — |
| Đang mở (`aria-expanded="true"`) | trắng 100% + chevron xoay 180° | cấp 2 trượt vào (không có trạng thái hàng) |
| Pressed | — | nền `--color-background-alt` |
| Focus | outline trắng 2px offset 2 (foundation §3.2) | outline 2px accent inset |
| Trang hiện tại (`aria-current="page"`) | trắng 100% + gạch chân 2px offset 0.45em | 600 + gạch chân 2px |
| Header đã cuộn | giữ nền tối, thêm bóng (foundation §3.2); panel mở vẫn top 80 | — |
| Link trong panel: hover / focus / current | accent + dịch 4 / outline accent / 600 + gạch chân 2px | — |
| Đang tải ảnh danh mục | khung đúng tỉ lệ, shimmer `--color-background-alt` → background 1.4s; chữ có sẵn | như desktop, ảnh 56 |
| Collection không ảnh, ảnh lỗi | nền cream + icon ảnh `--color-muted-light`; không ẩn mục | như desktop |
| Collection 0 sản phẩm | vẫn hiện, "0 Products" | như desktop |
| Sản phẩm nổi bật không media (edge_cases "Sản phẩm không có media") | placeholder icon | như desktop |
| Sản phẩm nổi bật hết hàng ("Hết hàng toàn bộ") | badge "Sold out" (foreground/background), ảnh mờ 60%, giá giữ | như desktop |
| compare_at_price ≤ price ("Sản phẩm có màu sale và màu không sale") | không badge, không giá gạch | như desktop |
| Tên dài | hiện đủ, không cắt (card, Shopify §7); link menu xuống dòng tự nhiên | như desktop |
| Chưa chọn sản phẩm nổi bật | không card, cột giãn | không card |
| Menu trống, theme editor | chữ `blocks.header.menu_placeholder` giữa thanh tối, `--color-muted-on-dark` 14 | chữ xuống dòng dưới logo |
| Menu trống, storefront | không menu, không nút menu; logo trái, icon phải | như desktop |
| Không JS | bấm để mở, không hover | accordion tại chỗ |
| Lỗi | Menu render từ server nên không có lỗi tải chữ; ảnh lỗi = "không ảnh" | như desktop |

## 8. Accessibility

Tương phản (tính tay theo WCAG, L độ sáng tương đối; số chung lấy từ foundation §2):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| foreground / background | 17.4 | link, mục menu khi panel mở, hàng drawer |
| muted / background | 8.45 | tiêu đề cột, số sản phẩm, Back, nhãn Currency |
| accent / background | 5.01 | link hover, focus ring |
| foreground / background-alt | 15.8 | hàng drawer khi chạm |
| muted / cream (L 0.0742 / 0.913) | 7.75 | giá gạch trong card |
| sale / cream (L 0.1145 / 0.913) | 5.85 | giá sale trong card |
| accent / cream (L 0.1596 / 0.913) | 4.59 | eyebrow "Featured" 14/800 |
| sale-foreground / sale | 6.38 | badge −22% |
| muted-light / background | 5.33 | viền nút Currency, Language (sổ quyết định 09/11) |
| trắng 60% (#A3A3A3) / dark #1A1A1A | 6.93 | mục menu mặc định (foundation §2) |
| dark-foreground / dark | 17.4 | mục hover, đang mở, trang hiện tại; logo, icon; outline focus |
| muted-on-dark / dark | 6.11 | chữ menu trống trong theme editor |
| accent / dark | 3.48 | không dùng (focus trên thanh tối dùng trắng) |

Vùng chạm: mục menu desktop chữ cao 24–26 theo Figma, ô bấm 44 (kit `min-height: 44px`, không đổi bố cục thanh 80). Icon header ô 44. Link trong panel 40 (desktop ≥ 40, 06). Drawer: hàng 52 / 48 / 72, Back 44, × 48, Sign In 44, Currency / Language 44 (14 #1083M). Khoảng cách giữa các link chạm ≥ 0 nhưng vùng chạm không chồng nhau.

Ngữ nghĩa:
- `<nav aria-label="Main menu">` (desktop) và `<nav aria-label="Mobile menu">` (drawer): tên khác nhau (code có).
- Trigger là `<summary>` + `aria-expanded` (code đồng bộ), `aria-controls` trỏ panel.
- Tiêu đề cột, tiêu đề nhóm drawer là link hoặc `<p>`, không dùng `<h*>` (header đứng trước h1 của trang; tránh heading-order). Danh sách link là `<ul>` có `aria-labelledby` trỏ tiêu đề cột.
- Drawer: phần tử panel `role="dialog" aria-modal="true" aria-labelledby` trỏ tiêu đề "Menu" (aria-dialog-name); cấp 2 là vùng có `aria-labelledby` tiêu đề cấp 2.
- Nút Back có tên "Back to menu"; × "Close menu" (locale có); nút menu "Open menu".
- Ảnh danh mục và ảnh card `alt=""`: tên collection / sản phẩm đã là chữ trong cùng link, alt lặp sẽ đọc 2 lần (AGENTS: ảnh trang trí `alt=""`; Lighthouse image-alt đạt với alt rỗng).
- Card: một link duy nhất; giá có chữ ẩn "Sale price" / "Regular price"; badge là chữ, không chỉ màu (01).
- Không dùng màu đơn lẻ: mục đang mở và trang hiện tại có gạch chân, không chỉ đổi màu (06).

## 9. Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

- Phần tử LCP: không thuộc menu. Menu đóng khi tải trang nên LCP giữ nguyên của từng trang (trang chủ: ảnh slide 1 hero dưới thanh tối; collection: banner hoặc hàng card đầu). Noise của thanh tối là `background-image` nhỏ đã có (`assets/noise-dark.png`), không phải LCP.
- Ảnh lazy: mọi ảnh trong menu (ô danh mục, ảnh 56 trong drawer, ảnh card sản phẩm) `loading="lazy"`, có width/height, qua `snippets/image` (srcset). Ảnh nằm trong `<details>` đóng nên không tải tới khi mở (sổ quyết định 09/11 "ảnh trong menu tải khi mở"). Không ảnh nào eager, không `fetchpriority`. `sizes`: ô B `(min-width: 80rem) 20vw`; ảnh drawer 56px (yêu cầu bản 112 cho màn 2x); card 400px desktop, 96px drawer.
- Font: chỉ Inter (400, 500, 600) và Sofia Sans Condensed (700, 800) đã có; không thêm họ, không thêm weight mới.
- CSS: thanh header ở `critical.css` như hiện tại; panel, drawer mở, cấp 2, ô ảnh ở `base.css` (đóng khi tải nên không cần critical). Panel, scrim, drawer `position: absolute / fixed` nên 0 CLS; header không đổi chiều cao khi mở.
- JS: chỉ tăng cường trong `assets/header-menu.js` (giữ ≤ 8 KB, trang ≤ 40 KB); markup chạy khi chưa có JS. Chuyển động chỉ transform/opacity.
- Rủi ro A11y và cách tránh: tiêu đề cột dùng `<h*>` gây heading-order → dùng `<p>`/link; nút icon thiếu tên → mọi nút có `aria-label` locale; drawer không tên → `aria-labelledby`; link trùng tên "View all" → nhãn theo đích; trạng thái chỉ bằng màu → trang hiện tại gạch chân, mục đang mở có chevron lật + `aria-expanded`; chữ menu trắng 60% nay nằm trên nền tối đặc (6.93:1, Lighthouse đo được, đạt) thay vì trên ảnh; focus cam trên tối 3.48 → outline trắng.
- Rủi ro SEO: mọi link là `<a href>` render server, có trong HTML kể cả khi đóng (crawl được); chữ link mô tả đích; không "Read more"/"Shop now" trần; chữ ≥ 13 (nhỏ nhất: số sản phẩm 14, badge 13).
- Best Practices: ảnh `object-fit: cover` (ô, ảnh 56) và `contain` (card) không kéo méo; độ phân giải theo srcset; 0 lỗi console (mockup render 0 lỗi ở 4 mốc).

## 10. Map sang code (cho ticket FE / BE)

| Phần | Hiện có | Cần đổi | Phía |
| --- | --- | --- | --- |
| Đọc cấp 3 | `link.links` 2 cấp | lặp thêm `child.links` | FE |
| Panel A, B | `.site-header__submenu` absolute dưới từng mục | panel full bề ngang dưới header, giữ C cho dữ liệu đơn giản | FE |
| Header | nền tối chỉ khi `body:has(.slideshow)`, `[data-header-overlay]` | nền tối mọi trang, bỏ overlay (ticket foundation §21); khi mở mega không đổi màu, chỉ `aria-expanded` | FE |
| Scrim desktop | không có | scrim từ dưới header; bấm đóng | FE + BE |
| Drawer | `min(22rem, 100vw − 3.5rem)`, × 44 không tiêu đề | `min(90%, 420px)` nền trắng, header 72 có "Menu" + × 48, hàng 52, chân Sign In + localization (khung chung foundation §15) | FE |
| Cấp 2 drawer | accordion | trượt + Back khi có JS; accordion khi không JS | FE markup, BE JS |
| Card sản phẩm | không | setting `menu_featured_product`, dùng `snippets/price` | FE |
| Ảnh danh mục | không | setting `menu_collection_images`, `snippets/image` lazy | FE |
| Locale | `blocks.header.*` | thêm khoá §4 | FE |

`data-testid` mới (AGENTS): `header-mega-panel`, `header-mega-column`, `header-mega-tile`, `header-mega-promo`, `header-scrim`, `header-drawer-level`, `header-drawer-back`, `header-drawer-promo`. Giữ nguyên testid và hook hiện có trong `{% doc %}` của header.

Token dùng: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-background-cream`, `--color-accent`, `--color-sale(-foreground)`, `--color-background-dark-foreground`, `--font-heading--*`, `--font-primary--family`, `--font-size-sm/base/lg/h3/h2`, `--space-1..8`, `--radius-card`, `--radius-input`, `--header-height`, `--motion-fast/base/slow`, `--ease-out`; dẫn xuất foundation `--overlay-scrim`, `--shadow-raised`, `--shadow-overlay`, `--content-width`. Không token mới.

## 11. Quyết định CTO đã chốt (10/11)

CTO chốt cả các câu dưới đây theo đề xuất (docs/design/decisions.md, 10/11).
1. Drawer mobile dùng trượt cấp 2 + Back khi có JS, accordion chỉ là bản không JS (TE-1 AC2 đang ghi accordion)? Đề xuất: có, BA sửa AC2 (14 §1, foundation §15).
2. Thêm 2 setting header "Show collection images in menu" (bật) và "Featured product in menu" (product, trống)? Đề xuất: có, card lấy giá và badge thật nên không cần setting chữ.
3. Kiểu panel chọn theo dữ liệu menu (có cấp 3 → cột, toàn collection → ô ảnh, còn lại → dropdown) thay vì setting từng mục? Đề xuất: có, giữ settings phẳng (AGENTS); cần menu 3 cấp trên store dev (ES1-T271).
