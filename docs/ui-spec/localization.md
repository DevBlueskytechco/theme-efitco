KHÔNG CHẮC: demo-data không có `localization` (nước, ngôn ngữ đang bán). Danh sách 18 nước, 5 ngôn ngữ trong mockup là ĐỀ XUẤT để vẽ trạng thái "nhiều mục"; đã hỏi BA ở ES1-T296. Figma chỉ có nút đóng ở footer (1:1104: cờ tròn 26 + "USD / EN" + chevron); danh sách, popover, sheet, trạng thái là ĐỀ XUẤT.

# UI spec: Bảng chọn quốc gia và ngôn ngữ (ES1-T289, audit A19)

## Thay đổi audit

| # | Phần | Trước (develop, vòng 3) | Sau (spec này) | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Nút ở footer | có (Figma 1:1104), panel tối viền xám, 2 nhóm chồng dọc | giữ nút; mở popover trắng 2 cột (≥ 768), bottom sheet 2 tab (< 768) | TE-1 AC9; foundation §14, §16; 15 §2 #9 |
| 2 | Nút ở drawer menu | 2 nút tách Currency, Language (navigation.md §2, §5.3) | 1 hàng gộp "cờ + USD / EN ›", mở cấp 2 "Country and language" trong drawer | TE-1 AC9 "1 nút gộp"; navigation.md cấp 2 + Back; 15 §1 một lớp |
| 3 | Danh sách | chưa vẽ | hàng 44 (48 mobile), mục hiện tại có dấu ✓ + 600 + nền alt, tiền tệ phải | 05 §3 selected rõ; 14 #1083M |
| 4 | Ô tìm | không có | hiện khi > 10 nước; lọc khi gõ; ↑ ↓ Enter Esc | 12 #560D; sổ M5 hằng 10 |
| 5 | 1 nước và 1 ngôn ngữ | code ẩn (`size > 1`) | giữ ẩn, chỉ còn icon thanh toán | TE-1 AC5 |
| 6 | Đang đổi, lỗi, không kết quả | chưa có | §6 | 05 §6–7, 14 #928M |

Giữ nguyên: `{% form 'localization' %}`, mỗi mục là `<button type="submit" name="country_code|language_code">` (chạy không JS), `aria-current` mục hiện tại, điều kiện hiện từng danh sách, testid hiện có.

Mục đích: người mua quốc tế đổi nước (tiền tệ, giá, phí ship) và ngôn ngữ trong 1 chỗ, 1 nút, tối đa 2 chạm. Story TE-1 AC5 (≥ 2 nước hoặc ngôn ngữ thì có, 1 thì không), AC9 (1 nút gộp "USD / EN" mở 2 danh sách); mã R4.

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T289/localization.html` (nhúng `../_kit/kit.css`) + `localization-360|768|1280|1920.png`. Phần đầu mỗi PNG là thiết kế của mốc đó: ≥ 768 popover mở trên nút footer, 360 bottom sheet. Trạng thái ở cuối file.

Nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:1104 (nút) > foundation.md §2, §4, §7, §12, §15, §16, §18 > navigation.md > kiến thức 15, 14, 12, 04, 05, 06.

---

## 1. Nơi xuất hiện

| Nơi | Mốc | Trigger | Mở ra |
| --- | --- | --- | --- |
| Footer hàng cuối (Figma 1:1104) | mọi mốc | nút "cờ 26 + USD / EN + chevron 9 × 5" | ≥ 768 popover; < 768 bottom sheet |
| Chân drawer menu (navigation.md §5.3) | < 1280 | hàng 52 "cờ 20 + USD / EN + ›" | cấp 2 trong drawer (trượt, Back), cùng nội dung sheet |
| Header desktop | ≥ 1280 | không có | Figma 1:362 chỉ 7 mục + 3 icon; không thêm |

Một nút gộp ở mỗi nơi (AC9). Không mở sheet chồng lên drawer (15 §1 một lớp popup).

## 2. Anatomy

Trigger:
1. Cờ nước hiện tại (tròn 26 ở footer, 20 ở drawer), `alt=""`.
2. Chữ: có > 1 nước thì mã tiền tệ (`USD`); có > 1 ngôn ngữ thì mã ngôn ngữ in hoa (`EN`); cả hai thì `USD / EN`.
3. Chevron 9 × 5 (footer, xoay 180° khi mở) hoặc › 12 (drawer).
4. Tên đọc: "Change country and language: USD / EN, United States, English" (chữ hiện nằm trong tên, WCAG 2.5.3).

Bảng (popover / sheet / cấp 2 drawer):
1. Tiêu đề "Country and language" (sheet, drawer; popover không có tiêu đề riêng, cột tự có nhãn).
2. Nút đóng × 48 (sheet), Back + × (drawer cấp 2). Popover không có × (disclosure, đóng bằng Esc, bấm ngoài, bấm lại nút).
3. Nhóm "Country/region": nhãn 14/600 uppercase muted · ô tìm (nếu > 10 nước) · danh sách nước: tên + tiền tệ "CAD $" bên phải · trạng thái kết quả (vùng `role="status"` ẩn).
4. Nhóm "Language": nhãn · danh sách endonym ("English", "Français", "Tiếng Việt"), mỗi mục `lang`.
5. Dấu ✓ 16 + chữ 600 + nền `--color-background-alt` ở mục hiện tại.

Không có cờ trong từng hàng: thêm tới 200 ảnh khi mở danh sách, lợi ít vì danh sách đã xếp chữ cái + có ô tìm (Performance sổ 09/11).

## 3. Settings merchant

Không có setting. Hiện / ẩn theo dữ liệu Shopify Markets (AC5): `localization.available_countries.size > 1`, `localization.available_languages.size > 1` (code có). Ngưỡng ô tìm 10 là hằng trong code, không setting (như M5).

Chữ qua locale `blocks.footer.*` (FE thêm, sentence case, American English):

| Khoá | Chữ | Ghi chú |
| --- | --- | --- |
| `localization_label` | "Change country and language:" | có sẵn |
| `country_label` | "Country/region" | có sẵn |
| `language_label` | "Language" | có sẵn |
| `localization_title` | "Country and language" | mới: tiêu đề sheet, cấp 2 drawer |
| `country_search` | "Search countries" | mới: placeholder ô tìm |
| `country_results` | "{{ count }} countries found" | mới: `role="status"` |
| `country_no_results` | "No countries match “{{ query }}”. Check the spelling or clear the search." | mới |
| `clear_search` | "Clear search" | mới: nút × trong ô tìm |
| `close` | "Close country and language" | mới |
| `updating` | "Switching to {{ name }}" | mới: chữ ẩn khi đang đổi |
| `error` | "We couldn't switch to {{ name }}. Check your connection and try again." | mới |
| `try_again` | "Try Again" | mới: nút Title Case (DESIGN CTA) |

Tên nước, tiền tệ, endonym lấy từ Shopify (`country.name`, `country.currency.iso_code`, `country.currency.symbol`, `language.endonym_name`), không dịch tay.

## 4. Layout theo mốc

### 4.1 Trigger

| | 360 | 768 | 1280 | 1920 | Token / nguồn |
| --- | --- | --- | --- | --- | --- |
| Vị trí footer | hàng giữa, cùng hàng icon thanh toán, trên copyright | như 360 | cột phải hàng cuối, trái icon thanh toán | như 1280 | foundation §4 |
| Kích thước | cao 44, cờ 26, gap 8, chữ 14/500 trắng, chevron 9 × 5 | | | | Figma 1:1104; `.site-footer__summary` |
| Drawer (< 1280) | hàng 52 trong `.overlay__footer`, cờ 20 tròn, chữ 16/500, › 12 muted, viền `--color-muted-light` bo 4 | như 360 (drawer 420) | — | — | navigation.md §5.3; sổ 09/11 viền ô nhập |

### 4.2 Popover (≥ 768)

| Giá trị | 768 | 1280 | 1920 | Token |
| --- | --- | --- | --- | --- |
| Neo | trên nút (`inset-block-end: 100%` + 8), căn giữa nút, không tràn `--content-width` | căn mép inline-end của nút | như 1280 | code `.site-footer__panel` mở lên |
| Rộng 2 danh sách / 1 danh sách | 600 / 320 | 600 / 320 | 600 / 320 | `calc(var(--space-1) * 150)` / `* 80` |
| Cột | nước 1.4fr · ngôn ngữ 1fr, gap 24 | | | `--space-5` |
| Khung | nền `--color-background`, viền 1px `--color-border`, bo 12, bóng raised, padding 24 | | | foundation §14 dropdown |
| Nhãn cột | 14/600 uppercase ls 0.04em `--color-muted`, cách nội dung 12 | | | kit `.mega__title` |
| Ô tìm | cao 44, padding 12 / 44, icon kính lúp 20 đầu ô, × 44 cuối ô khi có chữ; viền `--color-muted-light` bo 4 | | | foundation §12; sổ 09/11 |
| Danh sách | cao tối đa 320 (7 hàng), cuộn riêng `overscroll-behavior: contain`, cách ô tìm 8 | | | 14 #1096M |
| Hàng | cao 44, padding 0 12, bo 4, tên 16/400 trái, tiền tệ 14 muted phải, ✓ 16 trước tên mục hiện tại | | | foundation §1 |

### 4.3 Bottom sheet (< 768)

| Giá trị | 360 | Token / nguồn |
| --- | --- | --- |
| Khung | kit `.dialog` < 48rem: rộng 100%, bo trên 24, thanh kéo 40 × 4, padding 32 / 16 / 24 | foundation §16 |
| Chiều cao | > 10 nước: cố định 88dvh (không nhảy khi lọc, khi đổi tab); còn lại vừa nội dung, ≤ 88dvh | 15 §1 không full-screen |
| Tiêu đề | "Country and language", heading 800 28, chừa chỗ × | `--font-size-h2` |
| × | 48, cách góc 12 | 15 §1, 14 §3 |
| Tab (khi có cả 2 danh sách) | 2 tab chia đôi, cao 44, kiểu tab foundation §7; nhãn "Country/region", "Language"; cách tiêu đề 16 | 04 §4 tab ≤ 5, phía trên nội dung |
| Ô tìm | cao 48, như popover | `--control-height` |
| Hàng | cao 48, tên 16, tiền tệ 14 muted | 14 #1094M |
| Chỉ 1 danh sách | không tab, nhãn nhóm như popover | |

### 4.4 Cấp 2 trong drawer menu (< 1280)

Như sheet nhưng nằm trong drawer (navigation.md §2 cấp 2): Back "Back" 14 muted trái + × 48 phải · tiêu đề "Country and language" heading 800 28 · tab · ô tìm · danh sách hàng 48. Không JS: hàng gộp là `<details>` mở 2 danh sách xếp dọc tại chỗ.

## 5. Tương tác và bàn phím

Mở / đóng:
- Footer ≥ 768: `<details>` + `<summary>` (code có). Mở: bấm, Enter, Space; focus vào ô tìm nếu có, không thì vào mục hiện tại. Đóng: Esc (focus về nút), bấm ngoài, bấm lại nút, Tab ra khỏi bảng (focusout, như mega navigation.md §6). Không bẫy focus (disclosure).
- Footer < 768: có JS thì `<dialog>` `showModal()`, bẫy focus, khoá cuộn, đóng bằng ×, Esc, chạm scrim, vuốt xuống trên thanh kéo + tiêu đề (15 §2). Trả focus về nút. Không JS: popover như ≥ 768 (panel rộng `100vw − 40`).
- Drawer: chạm hàng gộp → cấp 2 trượt vào, focus vào Back; Back về cấp 1, focus về hàng gộp.
- Mỗi lần mở: danh sách cuộn tới mục hiện tại (`block: nearest`); ô tìm rỗng.

Chọn:
- Bấm một mục = gửi form ngay (code: nút submit), Shopify chuyển trang theo market/locale mới. Không có nút "Apply": chọn nước rồi chọn ngôn ngữ là 2 lần tải trang, chấp nhận vì đa số chỉ đổi 1 thứ (Câu CTO 3).
- Mục hiện tại vẫn bấm được nhưng không gửi (JS chặn, đóng bảng).

Ô tìm (> 10 nước), 12 #560D "autocomplete bằng bàn phím":
- Gõ lọc theo tên nước và mã tiền tệ, không phân biệt hoa thường và dấu ("cote" khớp "Côte d’Ivoire"); tên bắt đầu bằng chuỗi gõ xếp trước, chứa chuỗi xếp sau; phần khớp in đậm 600.
- `role="status"` đọc "3 countries found" sau 300 ms ngừng gõ.
- ↓ từ ô tìm: focus mục đầu; ↑ ↓ giữa các mục; Home / End; ↑ ở mục đầu về ô tìm; gõ ký tự khi đang ở danh sách: về ô tìm và thêm ký tự. Enter / Space trên mục: chọn. Enter trong ô tìm khi chỉ còn 1 kết quả: chọn kết quả đó.
- Esc trong ô tìm có chữ: xoá chữ; ô rỗng: đóng bảng.
- ≤ 10 nước (không ô tìm): gõ chữ cái khi focus trong danh sách nhảy tới nước đầu tiên bắt đầu bằng chữ đó (type-ahead).
- Không JS: không lọc, danh sách đủ, cuộn tay; ô tìm không render (thêm bằng JS, `hidden` mặc định) để không có ô chết.

Chuyển động (foundation §19; chỉ transform / opacity; tắt khi `prefers-reduced-motion`):

| Thành phần | Vào | Ra |
| --- | --- | --- |
| Popover | 250 `--ease-out`, opacity 0 → 1, translate 8 → 0 (mở lên) | 150 opacity |
| Sheet | 300 trượt từ đáy + scrim | 200 |
| Cấp 2 drawer | 250 translate 100% → 0 | 200 |
| Đổi tab | không hiệu ứng | — |
| Chevron nút | 250 xoay 180° | 250 |
| Hàng hover | 150 nền | 150 |

## 6. Trạng thái

Figma không có; tất cả ĐỀ XUẤT (05 §3, §6–7; 14 #928M; foundation §18). Mockup "States" L1–L10.

| # | Trạng thái | Hiển thị |
| --- | --- | --- |
| L1 | Rỗng: 1 nước + 1 ngôn ngữ (AC5) | không nút, không form; footer chỉ còn icon thanh toán; drawer không có hàng gộp |
| L2 | Chỉ > 1 nước, ≤ 10 | nút "cờ USD"; popover 320 một cột, không ô tìm |
| L3 | Chỉ > 1 ngôn ngữ | nút "cờ EN" (cờ nước hiện tại vẫn đúng); popover 320 chỉ Language |
| L4 | Nhiều mục: > 10 nước + nhiều ngôn ngữ | ô tìm, danh sách cuộn 320, ngôn ngữ cột phải (main view) |
| L5 | Đang lọc | "land" → Ireland, Netherlands, New Zealand; phần khớp đậm; status "3 countries found" |
| L6 | Không kết quả | icon tìm 24 muted-light + câu `country_no_results` 14 muted + text link "Clear search"; danh sách giữ chiều cao (0 nhảy) |
| L7 | Trigger: default / hover / focus / mở | trắng; hover gạch chân chữ; focus outline trắng 2px offset 2; mở chevron xoay 180° |
| L8 | Hàng: default / hover / focus / hiện tại / disabled | nền trong / nền alt / outline accent 2px inset −2 / ✓ + 600 + nền alt / chữ muted-light (khi đang đổi) |
| L9 | Đang đổi | sau khi bấm: hàng được chọn thay tiền tệ bằng spinner 16 + chữ ẩn "Switching to Canada"; các hàng khác `aria-disabled`, chữ muted-light; bảng `aria-busy`; chỉ hiện spinner nếu > 300 ms (tránh chớp). Shopify chuyển trang xong là hết |
| L10 | Lỗi | chỉ khi BE gửi bằng fetch và lỗi mạng: hộp `.alert` trên danh sách, viền sale, icon ! sale, câu `error` 14 muted, nút secondary "Try Again" (gửi lại mục vừa chọn); `role="alert"`; hàng trở lại bấm được. Gửi form thường (không JS) thì lỗi mạng là trang lỗi của trình duyệt |
| L11 | Tên dài ("Saint Vincent & Grenadines") | xuống 2 dòng, hàng cao lên, tiền tệ căn trên |
| L12 | Ngôn ngữ viết phải sang trái (العربية) | `lang="ar" dir="auto"` trên mục, căn theo hướng chữ |
| L13 | Theme editor | như storefront; không placeholder (đây là cấu hình Markets, không phải setting block) |

## 7. Accessibility

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| foreground / background | 17.4 | tên nước, ngôn ngữ, tiêu đề |
| foreground / background-alt | 15.8 | hàng hover, hàng hiện tại, tab chưa chọn |
| background / foreground | 17.4 | tab đang chọn |
| muted / background | 8.45 | nhãn cột, tiền tệ, Back, câu không kết quả |
| muted / background-alt | 7.69 | tiền tệ trên hàng hiện tại |
| muted-light / background | 5.33 | placeholder, viền ô tìm, hàng disabled (sổ 09/11) |
| accent / background | 5.01 | focus ring trong bảng |
| sale / background | 6.38 | viền, icon lỗi |
| dark-foreground / dark | 17.4 | nút footer, focus trên footer |

Ngữ nghĩa:
- Form giữ `{% form 'localization' %}`; mỗi danh sách `<ul aria-labelledby>` trỏ nhãn cột; mục là `<button type="submit">` (tên = tên nước + tiền tệ), mục hiện tại `aria-current="true"` (code có) + ✓ `aria-hidden`.
- Ô tìm: `<label for>` là nhãn cột "Country/region" (nhãn thật, nhìn thấy, foundation §12); `type="search"`, `autocomplete="off"`, `aria-controls` trỏ danh sách, `aria-describedby` trỏ status.
- Sheet: `<dialog aria-labelledby>` tiêu đề (aria-dialog-name); × tên "Close country and language".
- Tab sheet: `role="tablist"`, `tab`, `tabpanel`, `aria-selected`, ← → (foundation §7). Không JS không có tab.
- Popover: không `<h*>` (footer sau h1 của trang, tránh heading-order, foundation §4); nhãn cột là `<p>` hoặc `<label>`.
- Không dùng màu đơn lẻ: mục hiện tại có ✓ + đậm; disabled có `aria-disabled`.
- Vùng chạm: nút footer 44; hàng 44 (popover) / 48 (sheet, drawer); × 48; × trong ô tìm 44; tab 44.
- `lang` trên từng ngôn ngữ để trình đọc màn hình đọc đúng endonym.

## 8. Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

- LCP, CLS: bảng nằm ở footer, đóng khi tải; popover `absolute`, sheet `fixed` nên 0 CLS. Cờ trigger 26 (`image_url: width: 52`) lazy, có width / height (code có). Không cờ trong hàng.
- DOM: 200+ nước là 200+ `<li>` trong `<details>` đóng; chấp nhận (Lighthouse cảnh báo DOM > 1 400 node, footer thêm ~3 node mỗi nước). Không tải danh sách bằng JS sau (mất chạy không JS).
- JS: ĐỀ XUẤT file mới `assets/localization-picker.js` (custom element `localization-picker`): đóng mở, sheet, tab, lọc, bàn phím, đang đổi; ước ≤ 4 KB, trang ≤ 40 KB. Tải `type="module"` từ footer. BE quyết.
- CSS: footer ở `base.css`, không vào `critical.css`.
- A11y: nút có tên gồm chữ hiện; ô tìm có label; dialog có tên; mục là nút thật; không ARIA thừa trên `<li>`.
- SEO: không link mới; bảng là form POST, không ảnh hưởng crawl. `routes.*` không cần (form Shopify tự có action).
- BP: 0 lỗi console; không xin vị trí (14 #931D: không tự dò IP / định vị để chọn sẵn).

## 9. Map sang code

| Phần | Hiện có | Cần đổi | Phía |
| --- | --- | --- | --- |
| Điều kiện hiện | `show_countries`, `show_languages` | giữ | — |
| Trigger | `summary` cờ + "USD / EN" + chevron; label ẩn | chữ theo §2 (chỉ phần có > 1); tên đầy đủ §2.4; hover gạch chân, chevron xoay | FE `blocks/footer.liquid` |
| Panel | `.site-footer__panel` tối, viền xám, 2 nhóm dọc, cao 14rem | trắng, 2 cột / 1 cột, rộng 600 / 320, neo §4.2 | FE `base.css` |
| Hàng | `.site-footer__option` 44, gạch chân khi hover / hiện tại | §4.2, L8; thêm tiền tệ `<span>` phải, ✓ | FE |
| Ô tìm, status, không kết quả, lỗi | không | markup `hidden` + locale §3 | FE markup, BE JS |
| Sheet < 768 | không | `<dialog>` dùng chung khung foundation §16 | FE markup, BE JS |
| Drawer menu | 2 nút Currency / Language | 1 hàng gộp + cấp 2 (đề xuất trỏ navigation.md §10) | FE `blocks/header.liquid`, BE `assets/header-menu.js` |

`data-testid` giữ: `footer-localization-toggle`, `footer-country-selector`, `footer-country-option`, `footer-language-selector`, `footer-language-option`. Mới: `footer-localization-panel`, `footer-country-search`, `footer-country-status`, `footer-localization-error`, `header-drawer-localization`.
Token: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt`, `--color-accent`, `--color-sale`, `--color-background-dark(-foreground)`, `--font-heading--*`, `--font-primary--family`, `--font-size-sm/base/h2`, `--space-1..7`, `--radius-card`, `--radius-input`, `--motion-*`, `--ease-out`; dẫn xuất `--shadow-raised`, `--overlay-scrim`, `--radius-dialog`, `--control-height`. Không token mới.

## 10. Đề xuất trỏ sang file khác (không sửa trong ticket này)

- `docs/ui-spec/navigation.md` §2 mục 3, §4 (khoá `currency`, `language`), §5.3 "Chân drawer", §8 vùng chạm: thay 2 nút Currency / Language bằng 1 hàng gộp + cấp 2 theo §4.4 spec này (TE-1 AC9).
- `docs/ui-spec/foundation.md` §4 (footer, hàng cuối) và §15 (drawer menu "localization"): trỏ spec này.
- SRS TE-1 AC5 "country selector và language selector": BA ghi rõ đã thay bằng AC9 (1 nút gộp).

## 11. Quyết định CTO cần chốt

1. 1 nút gộp ở footer và chân drawer menu (bỏ 2 nút Currency / Language của navigation.md); ≥ 768 popover 2 cột, < 768 bottom sheet 2 tab, trong drawer là cấp 2? Đề xuất: có (TE-1 AC9, 15 §2 #9, 15 §1 một lớp).
2. Ô tìm nước chỉ hiện khi > 10 nước (cùng hằng 10 của M5), không cờ trong từng hàng? Đề xuất: có (12 #560D, Performance sổ 09/11).
3. Bấm mục là đổi ngay (2 lần tải trang nếu đổi cả nước và ngôn ngữ), không nút Apply? Đề xuất: có, giữ form chạy không JS (AGENTS Works without JavaScript).
