KHÔNG CHẮC: (1) popover 768 căn giữa nhóm commerce (nút + icon thanh toán), không căn đúng tâm nút như localization.md §4.2: neo theo nút thì panel 600 tràn mép khi nút lệch, test ES1-T45 R-05 cũng bám mép nhóm. (2) Chữ nút footer ≥ 80rem giữ màu muted-on-dark theo override Figma 1:1104, spec §4.1 ghi trắng. (3) gzip base.css chưa đo được (gzip/node bị chặn trong sandbox), chờ CI; diff CSS net dương vì thêm sheet, ô tìm, tab, trạng thái mới (đã xoá CSS footer/drawer cũ thay thế).

# ES1-T322 · TE-1-R2-FE5: bảng chọn quốc gia và ngôn ngữ (footer + cấp 2 drawer)

AC: SRS TE-1 AC5, AC10 (và AC9 phần 1 nút gộp). Spec: docs/ui-spec/localization.md §2, §4, §6, §7. Hợp đồng: task-split ES1-T307 §4 hàng TE-1-R2-FE5 / BE2 (ES1-T324).

## Thay đổi
snippets/localization-lists.liquid (mới), dùng chung footer và cấp 2 drawer
- Nhóm Country/region, Language: nhãn 14/600 uppercase muted, `<ul aria-labelledby>`, mỗi hàng `<button type="submit" name="country_code|language_code">` (đổi không JS, không nút Apply), tên + tiền tệ "CAD $" bên phải, không cờ trong hàng; mục hiện tại `aria-current="true"` + ✓ (mask `--icon-tick`) + 600 + nền alt; ngôn ngữ có `lang` + `dir="auto"`.
- Chỉ render phần có > 1 mục; tab chỉ khi cả 2 danh sách (`role="tablist"`, 2 `role="tab"`, ẩn bằng CSS tới khi host có `data-tabs`).
- > 10 nước: `<label for>` là nhãn cột, ô tìm `type="search"` trong wrapper `hidden` (không JS không có ô chết), × xoá `hidden`, status `role="status"`, khối không kết quả `hidden` (icon + câu + "Clear search").
- Lỗi: `.alert` `role="alert"` `hidden` + nút secondary "Try Again".
- testid theo tiền tố: `footer-*` (9 testid hợp đồng) và `header-drawer-*` (giữ `header-drawer-country-option`, `header-drawer-language-option`).

blocks/footer.liquid
- Nút gộp: chữ chỉ phần > 1 mục (`USD`, `EN`, `USD / EN`), tên đọc "Change country and language: USD / EN, United States, English" (chữ thấy nằm trong tên), `id="FooterLocalizationToggle"`, `aria-controls`.
- `<localization-picker>` bọc form; panel là `<modal-dialog data-layer="localization" data-sheet-below="48rem"><dialog class="dialog site-footer__panel" aria-labelledby="FooterLocalizationTitle">` trong `<details>`: tiêu đề "Country and language" + × 48 (chỉ hiện khi `:modal`), thân là snippet.
- Giữ `.site-footer__disclosure`, `.site-footer__panel`, `<summary>` (motion.js, ES1-T45 R-04/R-05, ES1-T235, TE-1 TC-28/30/31/45 bám vào).

blocks/header.liquid
- Cấp 2 localization trong drawer: danh sách thay bằng snippet, form bọc `<localization-picker>` cùng data-label. Phần đầu cấp 2, `header-drawer-localization`, `data-drawer-level` giữ nguyên (hợp đồng ES1-T323).

assets/base.css
- Thay toàn bộ CSS localization cũ: panel tối viền xám, `.site-footer__panel-heading/options/option`, `.site-header__drawer-option/currency`, focus `.site-header__drawer-option`.
- Popover (không JS, ≥ 48rem: `details[open] .site-footer__panel:not(:modal)`): nền trắng, viền border, bo card, bóng raised, padding 24, dưới 48rem rộng hết nhóm commerce (100vw − 40, §4.3 không JS; ES1-T45 R-05 bám inline-start), từ 48rem 320 một danh sách / 600 hai cột 1.4fr · 1fr (gap 24); 48–80rem căn giữa nhóm, ≥ 80rem căn mép inline-end của nút; danh sách cuộn riêng 320 (14rem dưới 48rem), `overscroll-behavior: contain`; vào bằng `motion-fade` (opacity + translate 8).
- Sheet (`:modal`, BE mở dưới 48rem): khung `.dialog` sẵn có (thanh kéo, bo trên, 88dvh tối đa, trượt từ đáy); > 10 nước cao cố định 88dvh; hàng 48, ô tìm 48.
- Hàng 44 (48 ở sheet, drawer), tên dài xuống dòng, tiền tệ căn trên; hover nền alt (`hover: hover`); focus trong panel outline accent 2px inset (không dùng outline trắng của footer); đang đổi `aria-busy` spinner 16 thay tiền tệ, hàng khác `aria-disabled` muted-light.
- Tab 44 chia đôi, đang chọn nền foreground chữ background; ô tìm viền muted-light, kính lúp 20, × 44.
- Nút gộp: gap 8, 500, gạch chân mã khi hover, chevron xoay 180° khi mở (transition trong `prefers-reduced-motion: no-preference`).
- 0 literal màu, 0 z-index số, thời gian qua `--motion-*`, chỉ logical properties.

locales/en.default.json (gộp vào `blocks.footer`): `clear_search`, `close`, `country_no_results`, `country_result_one`, `country_results`, `country_search`, `error`, `try_again`, `updating`.

## Hợp đồng cho BE (ES1-T324 TE-1-R2-BE2, `assets/localization-picker.js`, chưa có thẻ script — BE đặt theo ADR 0010)
- Host `<localization-picker>` (CSS `display: contents`): `data-country-count`, `data-label-status` ("[count] countries found"), `data-label-status-one`, `data-label-no-results` ("[query]"), `data-label-error` ("[name]"), `data-label-updating` ("[name]").
- `data-tabs` trên host: BE gắn khi mở sheet / cấp 2 drawer có 2 danh sách → tab hiện; BE gắn `role="tabpanel"` + `aria-labelledby` lên `[data-localization-group]`, `hidden` lên nhóm không chọn, đồng bộ `aria-selected`/`tabindex`; gỡ khi về popover.
- Footer < 48rem: `details.open = true` rồi `modal-dialog.open(summary)`; đóng (`modal:close`) thì `details.open = false`. ≥ 48rem: giữ `<details>` popover, đồng bộ `aria-expanded` trên summary, Esc/bấm ngoài/focusout đóng (hiện motion.js làm phần Esc + bấm ngoài).
- Ô tìm: bỏ `hidden` trên `[data-localization-search]`; lọc bằng `hidden` trên `<li>`; chặn Enter trong ô (không thì gửi hàng đầu tiên); × `[data-localization-clear]` bỏ `hidden` khi có chữ; status `#<Id>CountryStatus`; không kết quả: bỏ `hidden` `[data-localization-empty]`, chữ vào `[data-localization-empty-text]`.
- Đang đổi: `aria-busy="true"` hàng chọn (sau 300 ms), `aria-disabled="true"` hàng khác. Lỗi: bỏ `hidden` `[data-localization-error]`, chữ vào `[data-localization-error-text]`, thử lại `[data-localization-retry]`.
- testid: `footer-localization-toggle`, `footer-localization-panel`, `footer-country-selector`, `footer-country-option`, `footer-country-search`, `footer-country-status`, `footer-language-selector`, `footer-language-option`, `footer-localization-error`; drawer cùng tên tiền tố `header-drawer-`.

## Trạng thái
- L1 1 nước + 1 ngôn ngữ: không form, không nút (footer, drawer) — giữ.
- L2/L3 một danh sách: popover 320 một cột, không tab, chữ nút `USD` hoặc `EN`.
- L4 > 10 nước: ô tìm (sau JS), danh sách cuộn 320.
- L5/L6/L9/L10: markup + CSS sẵn, kích hoạt bởi BE.
- L13 editor: như storefront, không placeholder (dữ liệu Markets, không phải setting).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 9 warning có sẵn ở quiz-step, index*.liquid, 0 ở file của PR.
- Không file JS trong diff; không setting mới; locale gộp vào `blocks.footer`, không trùng khoá.
- Class cũ (`site-footer__option`, `site-footer__panel-heading`, `site-header__drawer-option`, `site-header__drawer-currency`) không còn tham chiếu trong assets/blocks/snippets/layout/templates.
- `wc -c assets/critical.css` = 10 082 (không đổi). gzip base.css: chờ CI.
- Preview, Playwright (TE-1 TC-28/30/31/45, ES1-T45 R-04/R-05, ES1-T235, ES1-T323), axe, Lighthouse desktop/mobile, ảnh 360/768/1280/1920: chờ CI. TC-28/31 cần store dev bán > 1 nước (biến TE1_COUNTRY_TARGET), skip nếu thiếu.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
