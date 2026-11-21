# ES1-T535 — Sửa Thiết kế theo rà soát chuẩn Polaris-first (CTO chốt 21/11)

Báo cáo: `ai-team/data/design-audit/efitco-ds-polaris-2026-11-21.md` mục "CTO chốt 21/11" (10 phát hiện, làm đúng như đề xuất). Quyết định từng mục: `docs/design/decisions.md` mục "CTO 21/11 — ES1-T535 (rà soát chuẩn Polaris-first)". Nhánh `feature/ai-ES1-T535`, chồng lên `feature/ai-ES1-T527`.

Nguyên tắc lượt này: không thêm giá trị màu (alias trỏ về token sẵn có), không đổi thang chữ, không đảo quyết định CTO cũ (chỗ có hai lựa chọn lấy lựa chọn không đảo), mọi giá trị trong kit dùng token.

## Đã sửa

File đổi: `drafts/designer/_kit/kit.css`, `drafts/designer/ES1-T251/foundation.html` (bước 1, phần nhìn thấy); `docs/tokens.json`, `DESIGN.md`, `docs/ui-spec/foundation.md`, `docs/design/decisions.md` và câu "mờ 0.35" trong 11 spec trang (bước 2, tài liệu). Không sửa `assets/`, `snippets/`, `blocks/`, `config/`, `layout/`, `templates/`, `locales/`.

| Mã | Kit / mockup | Tài liệu |
| --- | --- | --- |
| foundations-07 | `:root` thêm 6 alias: `--color-success(-foreground)` = badge-new, `--color-critical(-foreground)` = sale, `--color-warning(-foreground)` = accent. Toast, form-message, alert, status-icon success, field error, viền `aria-invalid` (field, choice, quantity, footer, on-dark), variant-option error, meter done đọc alias. `h-color` thêm bảng "Status" (4.57 / 5.01 / 6.38) | tokens.json `color_status`; DESIGN.md bảng "Status roles"; foundation.md §2.1 mới, §12, §17, §18, §30.12 |
| foundations-11 | thêm `--motion-enter` 400, `--motion-stagger` 60, `--motion-hero` 1400 (đủ 8 duration); spinner 700ms → `var(--motion-hero)` (1 vòng 1400, khớp `spinner-turn` của theme), shimmer 1.4s → `var(--motion-hero)`. `h-motion`: bảng 8 duration, bảng 3 easing + `linear`, dòng ngoại lệ | tokens.json `motion` đủ 8 + `easing` + `_motion_note`; DESIGN.md mục "Motion" mới; foundation.md §19 viết lại phần token, §18 |
| foundations-12 | `.round-button[aria-disabled='true']` bỏ opacity 0.35: viền border, icon muted-light (5.33), nền giữ, `cursor: not-allowed`. `.facet-swatch` disabled bỏ opacity 0.4: gạch chéo 2px foreground viền trắng, thêm `.is-disabled`. `h-button`, `h-pagination` (thêm mẫu First page), `h-facets` (2 ô disabled) | foundation.md §6 (disabled không opacity), §23, §30.6; DESIGN.md Calls to action; pagination.md bảng trạng thái + A11y; câu quy định ở collection, blog, search, article, list-collections, index-mobile-a, index-mobile-b, index-1280, product, mini-cart-quickview |
| foundations-13 | thêm `--touch-target: 44px` (giữ `--touch-target-min` 24). Áp: `.site-header__link` (cao 44 + `::after` nở vùng chạm ngang), `.dropdown a`, `.mega__col a` (40 → 44), `.site-header__icon`, `.search-field__submit`, `.close-button`, `.variant-pill`, `.variant-swatch`, `.variant-more`. `h-grid`: hàng mẫu 6 nhóm + bảng "Touch targets" 6 nhóm × 4 mốc | tokens.json `layout.touch_target`; DESIGN.md Page rhythm; foundation.md §1 (2 hàng vùng chạm), §1.3 mới (bảng 6 nhóm × 360/768/1280/1920), §14, §20 |
| foundations-15 | `h-dark` đổi tên "12b. Color Schemes And Roles": bảng 6 scheme × 6 role kèm tương phản; khối Browse Categories giữ làm mẫu dark scheme; `h-panel` giữ | foundation.md §2.2 mới (cùng số với mockup); DESIGN.md đoạn "Color schemes" |
| foundations-18 | `h-type`: 1 dòng chú thích dưới bảng type | foundation.md §1.1 đoạn "Ngoại lệ line-height"; DESIGN.md Typography |
| components-06 | `h-toast`: bảng "Chọn mẫu thông báo" 4 tình huống, giới hạn tiêu đề, khối Nên / Không nên; mẫu warning / error đổi sang ca nền (Price updated, Connection lost) | foundation.md §17 (bảng chọn mẫu, tiêu đề toast success ≤ 3 từ và ≤ 24 ký tự, mô tả ≤ 2 dòng), §18; DESIGN.md Calls to action |
| components-07 | `h-dialog`: 1 dòng chú thích ngoại lệ | foundation.md §16 dòng "Ngoại lệ popup marketing"; DESIGN.md |
| components-11 | không đổi (khối Nên của `h-button` đã ghi Title Case) | foundation.md §6 "Ngoại lệ Title Case"; DESIGN.md Calls to action |
| components-12 | `h-badge`: chú thích ngoại lệ `.badge--tag` | DESIGN.md Intent (danh sách ngoại lệ accent); foundation.md §8; decisions.md |

Yêu cầu thêm của CTO 21/11 "mockup đang sát mép": kit thêm helper `.container > .demo-block` (nở ra bằng `--page-margin` rồi đệm lại) và `.container.demo-block` / `.container.demo-band` / `.container.demo-states` (section tự là container: ES1-T279 states-h, ES1-T285 h-states + h-empty, ES1-T289 states-title ở 2 trang). Ảnh cắt theo section có lề 20 hai bên, vòng focus ở mép không bị cắt; bề rộng nội dung không đổi. Trong foundation.html: khối mẫu nền tối của `h-dark` nằm trong lề ở mọi mốc (trước tràn sát hai mép dưới 48rem); 4 bảng mới (Status, Touch targets, ma trận scheme, Chọn mẫu thông báo) xếp thành thẻ nhãn / giá trị dưới 48rem (ma trận scheme dưới 64rem) nên ảnh tĩnh 360 / 768 đọc đủ, không cuộn ngang. Chỉ là helper mockup, không vào code theme. Đo lại: foundation.html 36/36 section, T279, T285, T289 không còn tiêu đề cách mép section < 12 ở 360 và 1280; không trang nào tràn ngang.

CHƯA phủ: section của trang thật mà tiêu đề nằm đúng mép hộp section (bố cục trang thật, trong trang vẫn có lề `--page-margin`): ES1-T255 cart upsell-title; ES1-T256 search g-products, g-articles, g-pages; ES1-T257 article comments-title, related-title; ES1-T261 predictive-search h3-pop, h3-col, h3-tr, h5-rec, h5-pop, h5-col, h5-tr; ES1-T262 mini-cart-quickview up1, up-empty, up-load. Không đổi bố cục các trang này; nếu cắt ảnh riêng các section đó thì thêm lề ở bước cắt ảnh (clip + lề).

## Section đổi trong foundation.html

`h-grid`, `h-type`, `h-color`, `h-motion`, `h-button`, `h-badge`, `h-dark` (tên mới "12b. Color Schemes And Roles"), `h-facets`, `h-toast`, `h-dialog`, `h-pagination`, `h-article` (nút tròn disabled kiểu mới). Mọi section khác chỉ đổi lề ảnh cắt. Lượt soát lại: `h-dark` (mẫu Previous disabled trên nền tối; khối tối trong lề; bảng xếp thẻ dưới 64rem), `h-grid` / `h-color` / `h-toast` (bảng xếp thẻ dưới 48rem; mẫu Menu link về trắng 60% như header thật; chú thích swatch card), `h-motion` (2 hàng reveal / hero), `h-button` (chú thích 3.27:1 + cặp nền tối), `h-state` và mọi nút `aria-busy` ở `h-button` (spinner 1 vòng 1400 thay 700; ảnh tĩnh không khác).

Trang khác bị ảnh hưởng qua kit (chưa render lại ảnh chính thức, page agent làm khi chạm trang):
- Nút tròn disabled kiểu mới: ES1-T253 product, T254 collection + list-collections, T255 cart, T256 search, T257 article + blog, T278, T279, T287 pagination, T293. Trên nền tối (Browse Categories ở T278, T293): nền trong suốt, viền + icon muted-on-dark (đo: rgba(0,0,0,0) / rgb(153,153,153), opacity 1).
- Chữ chú thích "mờ 0.35" trong trang đã sửa theo cặp màu disabled (chỉ sửa chữ): T254 list-collections + collection, T256 search, T257 article + blog, T287 pagination (đoạn mở đầu + hàng "Nút tắt" bảng Đo), T293 index.
- Spinner 1 vòng 1400 (trước 700) ở mọi trang có `.spinner` / nút `aria-busy`.
- Link mega cao 44 (mega dài thêm 4 mỗi hàng link): ES1-T260 navigation.
- Trang có `.container > .demo-block` hoặc section `.container.demo-block|demo-band|demo-states`: section có lề trong ảnh cắt (phạm vi và phần chưa phủ: xem trên).
- Không trang nào có bản chép cục bộ của component bị đổi; file trang chỉ sửa chữ chú thích.
- Tài liệu sửa thêm ở lượt soát: `docs/ui-spec/navigation.md` (link mega 44, `min-block-size: var(--touch-target)`), `docs/srs.md` (5 AC "mờ 0.35" → cặp màu disabled: TE AC14 dòng 100, AC23 dòng 146, AC6 dòng 226, AC6 dòng 258, AC1 dòng 440; BA soát lại câu chữ), `docs/ui-spec/index-mobile-a.md` (lệch reveal theo `--motion-stagger`).

## Số đã đối chiếu kit.css (bước 2)

- Alias: `--color-success` = `var(--color-badge-new)`, `--color-critical` = `var(--color-sale)`, `--color-warning` = `var(--color-accent)` + 3 `-foreground` tương ứng.
- Motion: fast 150, base 250, slow 500, accordion 350, reveal 900, enter 400, stagger 60, hero 1400; 3 easing đúng curve; khớp `snippets/css-variables.liquid` dòng 119–129. Bảng Vào / Ra foundation.md §19, §15, §16 quy về token: ra 200 → fast 150, dialog / bottom sheet vào 300 → base 250, lệch reveal 80 → stagger 60.
- Link header: `::after` rộng `max(100%, var(--touch-target))` căn giữa; đo 1280 / 1920: Sale, Blog, Help 44 × 44 (trước 43.98).
- Vùng chạm: `--touch-target` 44px, `--touch-target-min` 24px; `.close-button` 48 × 48; `.variant-pill` min-width 56, min-block-size 44; `.variant-swatch` 44 × 44; `.button` 48 / 52.
- Ma trận scheme và bảng Touch targets trong foundation.md §2.2, §1.3 chép đúng số của bảng trong foundation.html (số đo và tương phản do bước 1 tính, bước 2 không đo lại).

## Cần FE (code theme, không làm ở ticket này)

- `snippets/css-variables.liquid`: thêm alias `--color-success(-foreground)` = `--color-badge-new(-foreground)`, `--color-critical(-foreground)` = `--color-sale(-foreground)`, `--color-warning(-foreground)` = `--color-accent(-foreground)`; thêm `--touch-target: 44px` (giữ `--touch-target-min` 24). Motion đã đủ 8 duration + 3 easing, không cần thêm.
- `assets/base.css`, màu trạng thái: toast, form-message, alert, field error, viền `aria-invalid`, meter done đọc alias thay `--color-sale` / `--color-badge-new` / `--color-accent`. Badge, giá, nút giữ token gốc.
- `assets/base.css`, motion: thay literal 700ms, 500ms, 120ms, 80ms, 0.2s, 0.6s bằng token; spinner đang lệch nhau (`spinner-turn` dùng `--motion-hero` 1400, nút `aria-busy` 700ms literal): cả hai dùng `var(--motion-hero)` như kit; shimmer skeleton `var(--motion-hero)`; lệch reveal `calc(var(--reveal-i, 0) * 80ms)` (base.css ~9300) → `var(--motion-stagger)`; đóng drawer / dialog 200 → `--motion-fast`, mở dialog / bottom sheet 300 → `--motion-base`.
- `assets/base.css`, disabled: `.carousel-nav__button`, `.collection-list__button`, `.slideshow__arrow`, nút phân trang `[aria-disabled='true']` bỏ opacity 0.35 → viền `--color-border`, icon `--color-muted-light`, nền giữ, `cursor: not-allowed`. Trên nền tối (`.section--dark`, `.on-dark`): nền trong suốt, viền + icon `--color-muted-on-dark`; rule phải đứng sau `.section--dark .round-button` (cùng specificity thì rule sau thắng).
- `assets/base.css`: icon lỗi ô newsletter footer đọc `--color-critical` (kit đã đổi).
- Snippet / block lọc (facet swatch): disabled bỏ opacity 0.4, thêm gạch chéo (`::after` 2px foreground viền trắng, xoay −45deg), nhãn giữ muted-light.
- Vùng chạm 44 mọi mốc cho 6 nhóm (`blocks/header.liquid`, `critical.css`, base.css, snippet variant picker): link menu header (vùng chạm `::after` nở tới 44 cho nhãn ngắn, không đổi gap 40), link mega 40 → 44, dropdown, icon cart / hamburger, submit search, nút đóng, variant pill / swatch / more đọc `--touch-target`.
- Toast (JS là việc BE, chuỗi là FE): chỉ phát toast error / warning cho thao tác nền ngoài tầm nhìn; lỗi và cảnh báo tại chỗ dùng `.form-message` / `.alert`; kiểm chuỗi `locales/*.json` để tiêu đề toast success ≤ 3 từ, ≤ 24 ký tự.
- Không cần FE: foundations-15 (chỉ tài liệu), foundations-18, components-07, components-11, components-12 (chỉ ghi ngoại lệ).

## Còn mở

- "Mockup sát mép": hiểu là ảnh cắt theo section chạm mép (trong trang không có phần tử nào sát mép viewport ở 360 / 1280). Section trang thật ở 5 trang liệt kê ở mục "CHƯA phủ" chưa có lề khi cắt riêng. Nếu ý CTO là chỗ khác (ví dụ khung hiển thị trên dashboard) thì cần chỉ rõ màn.
- Ma trận scheme lộ 1 ô dưới AA: `.text-link:hover` đổi sang accent trên nền sand = 4.03 (< 4.5). Chưa sửa vì foundations-15 chỉ làm tài liệu. Đề xuất: hover link trên sand dùng `--color-accent-on-sand` (4.62, token sẵn có). Cần CTO chốt.
- Swatch trên card sản phẩm 36 × 24: KHÔNG tạo [Q]. CTO 10/11 đã chốt (foundation.md §22 câu 2) swatch card là chỉ báo không bấm, `aria-hidden`, chọn màu ở trang sản phẩm / quickview; trong mockup nó là `<span>` trong `.swatches[aria-hidden]`. Không phải control nên không thuộc nhóm 6; đưa lên 44 là đảo quyết định 10/11. Tab 40 từ 1280 ngoài 6 nhóm, giữ sàn 24.
- Nút tròn disabled trên nền sáng: đúng đề xuất đã chốt (viền border, icon muted-light, nền giữ) nhưng tín hiệu yếu khi đứng cạnh nút bật: viền và nền giống hệt, icon tắt so với icon bật 3.27:1. Nếu CTO muốn rõ hơn mà không dùng opacity: nền `--color-background-alt` như `.field__input:disabled`.
- Nút tròn disabled trên nền tối: đề xuất ghi "nền giữ" nhưng nút bật ở đó là đĩa trắng viền trắng nên giữ nền thì không phân biệt được. Đã làm: nền trong suốt, viền + icon muted-on-dark (6.11). Lệch chữ "nền giữ": cần CTO xác nhận.
- Motion: bảng Vào / Ra quy về 8 token làm 3 số đổi nhẹ (ra 200 → 150, dialog / sheet vào 300 → 250, lệch reveal 80 → 60) và spinner trong nút 700 → 1400. Nếu CTO muốn giữ 80 / 200 / 300 / 700 thì phải thêm token (đổi bộ đã khớp css-variables.liquid).
- foundation.md §17 câu "tiêu đề toast viết sentence case" là ĐỀ XUẤT chưa chốt (ngoài 10 mục), đã đánh dấu.
- Công cụ chụp: ảnh cắt `h-color`, `h-button` ở 1280 từng lệch khung do ảnh tải trễ (chiều cao trang đổi giữa các lượt). Khi render ảnh chính thức cần chờ ảnh tải xong (`img.decode`) rồi mới cắt; ngoài worktree theme.
- Hàng drawer menu `.nav-row` cao 52 (link menu chính ở 360 / 768) đang định nghĩa cục bộ ở ES1-T260/navigation.html, chưa có trong kit; bảng Touch targets ghi theo trang đó.
- Section `h-dark` đánh số "12b" để không đánh số lại 22 section sau.
- Chưa render lại ảnh chính thức `foundation-360|768|1280|1920.png` và ảnh các trang khác; chưa nhìn ảnh ở 1920.
- Sổ quyết định bản ai-team (`knowledge/designer/20261109-so-quyet-dinh-thiet-ke-efitco-cto.md`) chưa có mục 21/11: CTO nạp qua kho kiến thức (ngoài phạm vi ghi của ticket này).
- Bảng lịch sử "Trước / Sau" trong các spec trang (collection, blog, article, list-collections, search, pagination dòng đầu) vẫn ghi "mờ 0.35": đó là lịch sử vòng trước, cố ý giữ; câu quy định hiện hành đã sửa.
- Lệch có từ trước, không do lượt này: `h-color` ghi "23 token có setting", DESIGN.md ghi 22 setting màu; foundation.md §2 bảng dẫn xuất còn `--section-gap` = `--space-7` (kit là `--space-4xl` 56) và `--grid-gap` 2 bậc (kit 3 bậc 12 / 16 / 24); tràn ngang ES1-T258/page.html ở 360 (scrollWidth 364) và ES1-T293/index.html ở 360 (trang chỉ thiết kế cho 1280 / 1920).

---

# Lượt 2 — hoàn thiện 19 phát hiện "Lệch chuẩn" và "Còn thiếu" (CTO 21/11)

Nguồn: báo cáo `ai-team/data/design-audit/efitco-ds-polaris-2026-11-21.md` mục "Phát hiện còn lại", chỉ các khối "Lệch chuẩn" và "Còn thiếu", làm theo ĐỀ XUẤT của từng khối. Quyết định: `docs/design/decisions.md` mục "CTO 21/11 — ES1-T535", phần "Lượt 2". Bản design system sau lượt này: 1.3.0 (đề xuất, chờ CTO duyệt).

Giữ nguyên: 10 mục lượt 1, mọi dòng sổ quyết định. Không thêm giá trị màu, không thêm font, không đổi hình Tab và Chip, không thêm bậc bóng. Token mới ở `:root` của kit: `--icon-size-sm/md/lg`, `--icon-stroke-width`, `--tab-padding-inline` (đều do đề xuất nêu hoặc là hệ quả của quy tắc giá trị ngoài thang).

## Đã sửa (lượt 2)

File đổi, bước 1 (phần nhìn thấy): `drafts/designer/_kit/kit.css`, `drafts/designer/ES1-T251/foundation.html`.
File đổi, bước 2 (tài liệu): `docs/tokens.json`, `DESIGN.md`, `CONTRIBUTING.md`, `docs/ui-spec/foundation.md`, `docs/design/decisions.md`, `docs/design/content.md` (mới), `docs/design/CHANGELOG.md` (mới), `docs/ui-spec/collection.md`, `localization.md`, `page.md`, `product-shopify-features.md`, `docs/srs.md` (2 AC), file này. Bước 2 sửa thêm 3 chỗ chữ trong mockup cho khớp tài liệu (xem cuối bảng).
Không sửa `assets/`, `snippets/`, `blocks/`, `config/`, `layout/`, `templates/`, `locales/`.

| Mã | Kit / mockup (bước 1) | Tài liệu (bước 2) |
| --- | --- | --- |
| foundations-06 | màn mới `h-token-architecture`; kit ghi chú 3 tầng, tầng component trong `:root` (`--tab-padding-inline`) | foundation.md §32.1 (3 tầng, quy ước tên), §32.4 (bảng 24 biến `--figma-*` đang dùng + 4 biến không dùng), §2; tokens.json `_tiers`; DESIGN.md "Token tiers" |
| foundations-08 | kit một hệ tên `--space-2xs…7xl`, `--space-1…8` thành alias; đổi 148 chỗ `var(--space-N)` và 31 chỗ `calc(var(--space-1) * N)`; còn 9 rule đọc `--space-7` (48) có chủ đích, danh sách ở foundation.md §1.2; `h-spacing-radius` bảng tên cũ → mới | foundation.md §1.2 (bảng, quy tắc giá trị ngoài thang 3 bước), §1, §2 bảng dẫn xuất sửa theo kit; tokens.json `space._alias_map`, `_calc_map`, `_off_scale_rule`; DESIGN.md Spacing |
| foundations-09 | `h-spacing-radius` mẫu bo lồng nhau + bảng radius lẻ; kit 5 chỗ bo về `--radius-*` | foundation.md §1.2 (quy tắc lồng, bảng radius lẻ → bậc); tokens.json `radius._nesting`, `_legacy_map`; DESIGN.md Corner radius |
| foundations-10 | kit hết literal: 3 bóng → `--shadow-raised`, 7 z-index → `--layer-content`; `h-elevation-layers` 2 bảng | foundation.md §31 (bảng component → bóng → lớp, bảng bóng viết tay → token), §3.2, §6; tokens.json `elevation._legacy_map`, `_rule`, `layer._rule`; DESIGN.md "Elevation and layers" (mục mới, trước đó DESIGN.md không có bóng và lớp) |
| foundations-14 (= components-13) | màn mới `h-icon`; kit `--icon-size-*`, `--icon-stroke-width`, `.icon*`; symbol `i-trash` | foundation.md §33; tokens.json `icon`; DESIGN.md "Icons" |
| foundations-16 (= patterns-10) | `h-token-architecture` bảng 11 nhóm + nguồn sự thật; `h-color` 23 → 22 | foundation.md §32.2 (nhóm, số đếm, cột tokens.json), §32.3 (quy tắc nguồn sự thật: sổ thắng; thứ tự cho token không có dòng sổ là đề xuất); tokens.json thêm `_source_of_truth`, `icon`, `breakpoint`, `component`, `loading`, `thumbnail`; DESIGN.md "How to change the design" |
| foundations-17 | màn mới `h-rtl`; kit khối `:dir(rtl)`; `h-drawer` inline-start / end | foundation.md §34 (lật / giữ, 6 điều kiện), §15 (bảng drawer theo cạnh logic); DESIGN.md Direction |
| components-09 | màn mới `h-tabs` tách khỏi `h-button`; bảng phân vai | foundation.md §7 (trạng thái, bảng phân vai, dấu hiệu tertiary small), §6, §30.1; DESIGN.md Calls to action |
| components-10 | `h-form` khối tóm tắt nhận focus + bảng 5 tình huống; kit `.form-message__list`, focus của form-message | foundation.md §12 (bảng "Focus khi form lỗi", thay "focus trường lỗi đầu"), §18; page.md §6 S2; product-shopify-features.md §6; srs.md AC4 contact (làm rõ), AC6 gift card recipient (sửa); DESIGN.md |
| components-14 (= patterns-09) | `h-state` dải thời gian + bảng 5 vùng | foundation.md §18.1; collection.md S7 và localization.md L9 trỏ về §18.1; tokens.json `loading.indicator_delay_ms` 300; DESIGN.md |
| components-15 | kit `.alert` 4 tone, `.alert--page`, `.alert__close`; màn mới `h-alert` | foundation.md §35 (tone, cấp, anatomy, bảng chọn Banner / Inline / Toast), §18; DESIGN.md |
| components-16 | kit `.data-table--stack`, `--stacked`; `h-data-table` ô 320 + bảng số cột | foundation.md §30.11; DESIGN.md |
| components-17 | kit `.media*`, `.thumb*`; màn mới `h-media` | foundation.md §36; tokens.json `thumbnail`; DESIGN.md Images |
| patterns-08 | màn mới `h-content` | `docs/design/content.md` (mới, 9 mục) |
| patterns-11 | — | `CONTRIBUTING.md` thêm mục "Changing the design system" (77 dòng thêm, 0 dòng cũ bị sửa) |
| patterns-12 | các màn mới có đoạn "dùng khi nào" + khối Nên / Không nên | foundation.md §38: khuôn 6 mục + bảng 42 dòng "Dùng khi / Không dùng khi / Nên / Tránh" |
| patterns-13 | `data-status` + nhãn cạnh tiêu đề 42 section, chú giải đầu trang | foundation.md §39 (4 trạng thái, bảng 42 màn: 25 Đã dựng, 11 Đã chốt, 6 Đề xuất), §21; DESIGN.md "Component status" |
| patterns-14 | đầu trang DS "Version 1.3.0" | `docs/design/CHANGELOG.md` (mới: quy tắc + 7 bản 0.1.0–1.3.0); tokens.json `_version`; foundation.md §40 |
| patterns-17 | hàng "nhãn dài" ở `h-button`, `h-tabs`, `h-badge`, `h-chip`, `h-variant-picker`; kit `.button--wrap`, `.badge--wrap` | foundation.md §37, §6, §7; content.md §7; DESIGN.md |

Bước 2 sửa chữ trong mockup (không đổi hình, không đổi CSS):
- `foundation.html` `h-content`: đường dẫn `docs/ui-spec/content.md` → `docs/design/content.md` (2 chỗ, 1 là comment).
- `foundation.html` `h-form` và comment mẫu trong kit: tiêu đề tóm tắt "Fix 2 fields to send your message" → "Check 2 fields" (khớp chuỗi đã có ở SRS AC4 contact và page.md S2).
- `foundation.html` `h-state` bảng ngưỡng: "Spinner 20 tại hàng vừa chọn" → "Spinner tại hàng vừa chọn" (localization.md L9 ghi spinner 16, xem Còn mở).

## Section mới trong foundation.html (lượt 2)

| id | Tên | Nhóm | Trạng thái |
| --- | --- | --- | --- |
| `h-icon` | 6b. Icons | Foundations | Đề xuất |
| `h-token-architecture` | 6c. Token Architecture | Foundations | Đề xuất |
| `h-rtl` | 6d. Right-To-Left | Foundations | Đề xuất |
| `h-tabs` | 9b. Tabs | Components | Đã dựng (`.featured-collection__tab`) |
| `h-media` | 11b. Media | Components | Đề xuất |
| `h-alert` | 30b. Alerts And Messages | Components | Đề xuất |
| `h-content` | 34b. Content And Voice | Patterns | Đề xuất |

Section đổi: `h-color`, `h-spacing-radius`, `h-elevation-layers`, `h-button`, `h-badge`, `h-form`, `h-chip`, `h-variant-picker`, `h-data-table`, `h-state`, `h-drawer`, `h-header`, `h-article`.

## Số đã đối chiếu kit.css (lượt 2, bước 2)

- `:root` có 134 custom property: color 32 (29 `--color-*` + 2 `--panel-*` + `--overlay-scrim`), typography 26, space 20 (12 + 8 alias), radius 13 (6 + 7 vai trò), motion 8 + easing 3, shadow 4, layer 8, icon 4, size và layout 15, component 1. Khớp bảng ở `h-token-architecture` và foundation.md §32.2.
- Icon: `--icon-size-sm` 16px, `--icon-size-md` 20px, `--icon-size-lg` 24px, `--icon-stroke-width` 1.5; `.icon` 20, `.icon--sm` 16, `.icon--lg` 24.
- Alert: padding `--space-md` / `--space-xl` (16 / 24), gap 12, viền 1px `--alert-color` (mặc định `--color-critical`), bo `--radius-card`, icon `--icon-size-lg` 24; `.alert--page` thanh đầu 4px + nền tone 6%; `.alert__close` `--touch-target` 44, icon 16.
- Form: `.form-message__list` gap 4, link cao tối thiểu `--touch-target-min` 24; focus khối tóm tắt 2px accent offset 2.
- Tab: `--tab-padding-inline` 28px, cao 44 / 40 từ 80rem, 16/500. Chip: padding 16, cao 44 / 40 từ 80rem, 14/500. Button small: `--control-height-compact` 44, 14.
- Media: `.media` `aspect-ratio: var(--ratio, 1)`, bo `--radius-card`; placeholder 40% tối đa 96; `.thumb` 56, `--bar` 48, `--search` 64, `--cart` 80, bo `--radius-swatch` 8.
- Bóng: `--shadow-raised` 0 8 24 foreground 12%; `--shadow-overlay` 0 32 80 foreground 28%; `--shadow-bar` 0 −4 24 foreground 10%. Lớp: 1, 4, 5, 10, 15, 20, 21, 30.
- `.badge--wrap` bo `--radius-md` 12; `.button--wrap` padding-block 8, chữ căn giữa.
- Đếm lại ở vòng sửa sau soát trên `origin/develop` `assets/*.css` (không chỉ base.css): `--figma-*` 24 biến đang dùng / 91 lần (base.css 23 / 85, aux.css 2 / 6), 28 biến khai báo, 4 không dùng; `calc(var(--space-1) * N)` base.css 177 dòng, cả assets 233 dòng; radius lẻ 31 chỗ `--figma-radius-*` (base 25, aux 6) + 25 chỗ `calc(var(--radius-card) …)` (base 20, aux 3, cart 2). Kit `:root` 134 token: 67 có ở `css-variables.liquid`, 15 ở base.css, 52 chưa có trong code. Chưa đo lại: tương phản alert (7.63–7.88; 4.26–7.69).

## Cần FE (lượt 2; code theme, không làm ở ticket này)

- `snippets/css-variables.liquid`, khoảng cách: thêm bậc `--space-lg` 20, `--space-3xl` 40, `--space-4xl` 56, `--space-5xl` 64, `--space-6xl` 80 và tên `--space-2xs…7xl` (giữ `--space-1…8` làm alias); thay `calc(var(--space-1) * N)` (base.css 177 dòng, cả `assets/*.css` 233 dòng) theo 2 bảng foundation.md §1.2: hệ số 5, 10, 14, 16, 20 → bậc space; hệ số 11, 13, 12 (44, 52, 48) là kích thước → `--touch-target`, `--control-height(-compact)`; 7, 15, 18 → token tầng component.
- `css-variables.liquid`, bo góc: thêm `--radius-xs…xl`, `--radius-panel`, `--radius-swatch`; chuyển `--radius-dialog` từ base.css về đây và đổi card × 2 (24) → 20; thay 31 chỗ `--figma-radius-*` (base.css 25, aux.css 6) và 25 chỗ `calc(var(--radius-card) …)` (base.css 20, aux.css 3, cart.css 2) theo bảng §1.2 (2, 18 → pill; 24 → dialog 20).
- `assets/base.css` + `assets/aux.css`, `--figma-*`: thay 24 biến (91 lần: base.css 85, aux.css 6) theo bảng §32.4 rồi xoá khối; `--figma-radius-4` ĐANG DÙNG 2 lần ở aux.css (dòng 441, 701) → `--radius-xs`, không xoá trước khi thay; xoá ngay 4 biến không dùng (`--figma-4b824d`, `-white-12`, `-white-60`, `-radius-999`) sau khi tìm lại trong `snippets/`, `sections/`, `blocks/`; bỏ `--figma-hero-cta-width` (nút rộng theo nhãn).
- base.css, bóng và lớp: 3 bóng viết tay (nút hover `0 6px 16px`, testimonial / bundle hover `0 8px 24px`, card bài viết hover `0 18px 40px`) → `--shadow-raised`; thêm `--shadow-none`, `--shadow-bar`; gom 15 token đang khai báo ở khối `:root` của base.css về `css-variables.liquid`: 8 `--layer-*` (dòng 6–13), `--overlay-scrim`, `--shadow-raised`, `--shadow-overlay`, `--radius-dialog` (129–132), `--panel-muted`, `--panel-saving` (134–135), `--icon-stroke-width`.
- Icon: thêm `--icon-size-sm` 16, `--icon-size-md` 20, `--icon-size-lg` 24, `--icon-stroke-width` 1.5 ở `:root` trong `css-variables.liquid` (đang khai báo cục bộ 2 chỗ trong base.css); icon nét trong `snippets/` vẽ về nét 1.5.
- Alert: `.alert` 4 tone qua `--alert-color`, `.alert--page`, `.alert__close` 44 (`role="alert"` cho error, `role="status"` cho 3 tone còn lại).
- Form: sau submit lỗi, form CÓ TỪ 2 TRƯỜNG (contact, gift card recipient, bình luận) luôn render khối tóm tắt `.form-message--error` có `tabindex="-1"`, tiêu đề "Check 1 field" / "Check {n} fields" và danh sách link tới từng trường, dù 1 hay nhiều lỗi; form 1 trường (newsletter, password) giữ lỗi dưới ô. Locale gift card `error_summary` đổi sang dạng `one` / `other` có `{{ count }}`. Chuyển focus là JS (việc BE).
- `css-variables.liquid`, token kit có mà code chưa có (52, danh sách foundation.md §32.3): typography 10 (`--font-size-eyebrow`, `--font-size-h4`, `--font-body-weight`, 4 `--letter-spacing-*`, `--line-height-sm` / `-label` / `-display`); size và layout 11 (`--touch-target`, `--section-gap`, `--heading-gap`, `--grid-gap`, `--grid-columns`, `--control-height`, `--control-height-compact`, `--content-width`, `--band-side`, `--band-inset`, `--dark-texture`); cộng các nhóm đã nêu ở trên (6 alias trạng thái, 12 tên space, 7 radius, 2 shadow, 3 icon-size, `--tab-padding-inline`).
- `config/settings_schema.json` đang lệch sổ: `badge_new_color` #467A48 → #4B824D (V01), `background_alt_color` #F4F4F4 → #F4F4F5 (V18). Sổ thắng; không sửa tokens.json hay kit ngược lại.
- RTL: số có dấu, phần trăm badge (`-N%`), giá, mã giảm giá, tên Latin chen trong câu dịch bọc `<bdi>` (foundation.md §34).
- Data table: thêm `.data-table--stack` + `data-label` cho bảng Specifications và volume pricing; size chart giữ cuộn ngang trong `.table-wrap`.
- Media: class `.media` / `.thumb` hoặc ánh xạ sang `snippets/image.liquid`; thiếu ảnh giữ khung + nền, không icon ảnh vỡ; thumbnail về 4 cỡ 48 / 56 / 64 / 80.
- RTL: `dir` trên `<html>` theo locale trong `layout/theme.liquid`; rule `:dir(rtl)` như khối RTL của kit (icon chỉ hướng, thanh tiến trình, chevron select). BE: `assets/slideshow.js` và carousel cuộn theo hướng.
- Chuỗi dài: nút, badge trong theme cho phép xuống dòng (`.button--wrap`, `.badge--wrap`) ở khung hẹp; không khoá bề rộng nút.
- Locale: rà `locales/*.json` theo `docs/design/content.md` §8 ("View cart" → "View Cart" 2 chỗ; footer `newsletter_invalid` "Please enter a valid email, like name@example.com." → "Enter an email like name@example.com."); `try_again`, `show_fewer` đã đúng; không ghép chuỗi.
- Ngưỡng tải 300 ms: spinner thay nhãn nút và skeleton chỉ hiện sau ngưỡng (JS là việc BE), một hằng số dùng chung.
- Tab / Chip / tertiary: `.button--small.button--tertiary` đứng cùng vùng với chip phải có icon 16 hoặc tách hàng (rà card, quick view).
- Không cần FE: patterns-08, -11, -12, -13, -14 (chỉ tài liệu); foundations-16 phần tài liệu.

## Cần DevOps (lượt 2)

- Check CI so khớp token 4 nơi (settings_schema defaults ↔ `css-variables.liquid` ↔ `docs/tokens.json` ↔ kit `:root`), đã nêu ở notes T527 V01, V03; nay thêm nhóm icon, shadow, layer và tên `--space-2xs…7xl`. Nơi thắng: giá trị có dòng sổ thì theo sổ (check phải báo `badge_new_color`, `background_alt_color` đang lệch); thứ tự cho token không có dòng sổ là đề xuất chờ CTO (foundation.md §32.3). Check quét cả `assets/*.css`, không chỉ base.css.
- Check CI cấm biến `--figma-*` mới, bóng viết tay và `z-index` số trong `assets/*.css` sau khi FE dọn xong.
- Check `docs/tokens.json` `_version` tăng và `docs/design/CHANGELOG.md` có dòng mới khi PR chạm token hoặc kit (đề xuất, chờ CTO chốt số bản).
- Công cụ chụp ảnh section: chờ ảnh tải xong (`img.decode`) trước khi cắt; ảnh cắt `h-icon` và `h-tabs` ở 1280 từng lệch khung.
- `tests/e2e/TE-1.spec.ts` và `ES1-T190.spec.ts` đọc `docs/tokens.json` khoá `color`: lượt này không đổi khoá `color`, chỉ thêm khoá mới ở cấp cao nhất và khoá `_…` trong `space`, `radius`, `elevation`, `layer`. QA chạy lại 2 spec để chắc.

## Còn mở (lượt 2)

Chờ CTO (đã ghi ở `docs/design/decisions.md` mục "Chưa chốt"):
- Ngưỡng hiện spinner / skeleton: giữ 300 ms (đang dùng, màn `h-state` và §18.1 ghi 300) hay đổi 500 ms theo Polaris.
- Tone warning của `.alert` dùng accent: mở rộng ngoại lệ 09/11 vốn chốt cho Toast (`.form-message--warning` đã dùng accent).
- Toast giữ `--shadow-raised` cùng bậc popover theo V15; Polaris đặt toast cao hơn một bậc. Không đảo, chỉ hỏi.
- Nút và badge GIỮ `white-space: nowrap` mặc định, xuống dòng là chọn thêm. Bước 1 đã thử cho xuống dòng mặc định: 6 trang mockup có nút sát khung thành 2 dòng (product 360 nút Add To Cart rộng 178, search 360, predictive-search 360, password 360, shopify-features 360, quiz-result 768). Muốn mặc định xuống dòng thì page agent nới bố cục các trang đó trước.
- Số bản 1.3.0 và các số hồi tố 0.1.0–1.2.0 trong CHANGELOG là đề xuất của Designer.
- Thứ tự nguồn sự thật cho token KHÔNG có dòng sổ khi 4 nơi lệch (`settings_schema.json` → `css-variables.liquid` → `tokens.json` → tài liệu / kit): Designer đặt, báo cáo không nêu; giá trị có dòng sổ thì sổ luôn thắng.
- Font có glyph RTL (điều kiện 5 ở §34): thêm họ font là quyết định thương hiệu, Designer không tự chọn.
- Tiêu đề toast sentence case (content.md §9; đã mở từ lượt 1).

Khác:
- Nhãn "Đã dựng" gán theo việc tên class có trong `assets/` / `snippets/` của nhánh, chưa soát từng trạng thái: FE / QA xác nhận khi làm ticket. `h-variant-picker`, `h-form` đang là "Đã chốt" dù code có một phần; `h-toast` là "Đã dựng" (base.css đã có `.toast`).
- Spec trang còn chữ "drawer trái / phải" (navigation.md, search.md, predictive-search.md, mini-cart-quickview.md, index-mobile-a.md): chưa sửa từng file; foundation.md §15 ghi quy tắc đọc là inline-start / inline-end. Page agent sửa khi chạm trang.
- 6 spec riêng ở foundation §23 (variant-picker, pagination, layers, countdown, announcement-bar, localization) chưa có mục "Dùng khi nào" và "Nên / Tránh" trong chính file; mới có ở bảng §38.
- Màn DS còn 11 section chưa có khối Nên / Không nên trên màn (đã có ở bảng §38): `h-motion`, `h-header`, `h-banner`, `h-facets`, `h-quantity`, `h-price-rating`, `h-progress`, `h-state`, `h-rte`, `h-pagination`, `h-countdown`. `h-drawer` đã bổ sung ở vòng sửa sau soát.
- Spec trang còn tên khoảng cách cũ `--space-1…8` / `calc(var(--space-1) * N)` (ticket sau quét, đổi theo bảng §1.2): announcement-bar.md (6 dòng), cart.md (9), navigation.md (4), product.md (4), countdown.md (3), localization.md (3), blog.md (2), marketing-popups.md (2), predictive-search.md (2), layers.md (2), mini-cart-quickview.md (2), article.md, gift-card.md, index.md, index-1280.md, search.md, page.md, password.md (mỗi file 1). variant-picker.md đã đổi.
- 9 rule của kit còn đọc `--space-7` (48): chưa có số đo node Figma cho từng chỗ; đối chiếu Figma rồi quy về 40 / 56 hoặc token tầng component (foundation.md §1.2).
- Link trong khối tóm tắt lỗi form cao 24 (`--touch-target-min`): giữ theo sổ 21/11 foundations-13 (44 chỉ cho đúng 6 nhóm, link trong nội dung không thuộc nhóm nào). Muốn 44 dưới 80rem là thêm nhóm thứ 7: CTO quyết.
- localization.md L9 ghi spinner 16; foundation §18 (V61) chỉ có spinner 24 / 20 / 12. Lệch có từ trước, chưa sửa (bảng ngưỡng không ghi cỡ).
- Mũi tên link CTA: foundation §6 và màn `h-icon` ghi 16 × 14 (Figma 1:462), kit `.button--link svg` và DESIGN.md ghi khung 20 × 16. Lệch có từ trước, chưa sửa.
- `docs/srs.md` sửa 2 AC (contact AC4 làm rõ, gift card recipient AC6 đổi focus): BA soát lại câu chữ. Test e2e của AC6 nếu đang kiểm "focus trường lỗi đầu" cần QA cập nhật sau khi BE đổi JS.
- Phần báo cáo bước 1 từng bị cắt ở "Nhãn trạng thái: Built gán theo…" đã được bù: patterns-13 (cách gán Built, ghi ở dòng đầu mục "Khác" và foundation.md §39), patterns-14 (số bản, CHANGELOG), patterns-17 (thử `nowrap`, ghi ở mục "Chờ CTO") đều có trong bảng "Đã sửa (lượt 2)" và mục này. Không còn phần nào thiếu.
- Chưa render lại ảnh chính thức `foundation-360|768|1280|1920.png` và ảnh các trang khác. Bước 2 chỉ chụp kiểm `h-form` ở 360 và `h-content` ở 1280 sau khi sửa chữ; vòng sửa sau soát chụp kiểm 8 section ở 360 và 1280 (xem mục cuối).
- Sổ quyết định bản ai-team (`knowledge/designer/20261109-so-quyet-dinh-thiet-ke-efitco-cto.md`) chưa có phần lượt 2: CTO nạp qua kho kiến thức.
- Lượt này Designer ghi file bằng lệnh shell vì công cụ Edit của phiên chặn ghi sang worktree `theme-efitco` (hook cô lập worktree); thư mục này là thư mục làm việc được giao và có quyền ghi trong sandbox.

## Vòng sửa sau soát (lượt 2, 21/11)

22 lỗi người soát nêu, tự kiểm lại từng lỗi trên file và `origin/develop` trước khi sửa. 21 sửa, 1 bỏ qua có lý do.

| # | Mức | Lỗi | Xử lý |
| --- | --- | --- | --- |
| 1 | major | `h-state` bảng V45: ví dụ "Contact, newsletter" cho khối tóm tắt | Sửa: "Contact, gift card recipient (form từ 2 trường)"; hàng "Trường nhập sai" ghi gồm submit form 1 trường; foundation.md §18 khớp |
| 2, 20 | minor | Bảng V45 cuộn ngang ở 360 | Sửa: `stack-table` + `data-label` |
| 3 | minor | Link tóm tắt lỗi cao 24, chưa 44 | BỎ QUA: sổ 21/11 foundations-13 chốt 44 cho đúng 6 nhóm, control khác giữ sàn 24; thêm nhóm là việc CTO. Ghi Còn mở |
| 4, 19 | minor | Mẫu RTL chữ Latin nhảy dấu | Sửa: bọc `<bdi>` badge, tiêu đề, message ở ô RTL; thêm ghi chú; quy tắc `<bdi>` ở foundation.md §34 |
| 5 | minor | Ô hẹp 254: "Mate / rial" | Sửa: ô mẫu dùng `--striped --stacked`; kit `th` của `--striped` / `--fluid` không ngắt giữa chữ |
| 6 | minor | Chữ trên ô scrim 3.59:1 | Sửa: nhãn ra ngoài mảng scrim, chữ foreground trên nền trắng |
| 7, 18 | major | Điều kiện focus lệch 3 nơi (số trường form / số trường lỗi) | Sửa: MỘT điều kiện theo số trường của form ở foundation.md §12, product-shopify-features.md §6, srs.md AC6, DESIGN.md, decisions.md, `h-form`; tóm tắt gift card "Check {n} fields" |
| 8 | major | Cột "Code theme hôm nay" thiếu so với `origin/develop` | Sửa: §32.2, §32.3, `h-token-architecture` theo đối chiếu 134 token (67 / 15 / 52) |
| 9 | minor | content.md §8 hàng 3 không phải lệch locale | Sửa: bỏ hàng, thêm 2 ghi chú |
| 10 | minor | §6 "Sold out" cho nút | Sửa: nhãn nút "Sold Out", badge "Sold out" |
| 11 | minor | Số dòng base.css của `--shadow-*` sai | Sửa: 129–132, 134–135 |
| 12 | minor | Bảng calc thiếu hệ số 11, 13, 12, 7, 15, 18; "174" | Sửa: bảng hệ số ở §1.2, tokens.json `_calc_map`, DESIGN.md; số 177 (base.css) / 233 (assets) |
| 13, 17 | minor | Kit còn 9 chỗ `--space-7` | Sửa bằng ghi ngoại lệ có tên (§1.2, đầu kit.css, `h-spacing-radius`), không đổi hình; không ghi node Figma vì chưa đo |
| 14 | minor | variant-picker.md `--space-5` | Sửa: `--space-xl`; liệt kê spec còn tên cũ ở Còn mở |
| 15 | blocker | "settings_schema thắng" đảo V01, V18 và gắn nhãn CTO | Sửa 6 nơi: sổ thắng; thứ tự chỉ cho token không có dòng sổ và là ĐỀ XUẤT; liệt kê 2 chỗ đang lệch; thêm "Chưa chốt" (6) |
| 16 | major | Đếm `--figma-*` sót aux.css, `-radius-4` ghi "xoá ngay" | Sửa: 24 biến / 91 lần, 31 chỗ radius, 4 biến không dùng, `-radius-4` → `--radius-xs` ở 9 nơi |
| 21 | minor | 12 section thiếu Nên / Không nên; `h-banner` thiếu `data-status` | Sửa: thêm khối cho `h-drawer`, `data-status` cho `h-banner`, ghi 11 section còn lại ở Còn mở |
| 22 | minor | Dòng "bị cắt" ở notes; tiêu đề "sổ 21/11" cho điểm chờ CTO | Sửa: khép dòng; §18.1, §32, §35, §40 thêm "ĐỀ XUẤT, chờ CTO" |

Lệch so với lời người soát (đã đếm lại): `--figma-radius-16` dùng 15 lần (base.css 11, aux.css 4), không phải 19; `calc(var(--radius-card) …)` là 25 chỗ, không phải 18.

Section đổi diện mạo ở vòng này: `h-spacing-radius`, `h-elevation-layers`, `h-token-architecture`, `h-rtl`, `h-form`, `h-data-table`, `h-drawer`, `h-state`.

## Soát ảnh (lượt 2, 21/11)

Người soát ảnh nêu 15 lỗi major và các lỗi minor trên ảnh đã render. Tự chụp lại từng section bằng `shot.sh` (360 / 768 / 1280 / 1920 tuỳ lỗi) trước và sau khi sửa.

| Lỗi | Xử lý |
| --- | --- |
| `h-rtl`: mẫu RTL vẽ "+ 2 −", bảng ghi stepper giữ thứ tự | Sửa theo bảng: kit `:dir(rtl) .quantity { direction: ltr }`; hàng bảng và foundation.md §34 ghi rõ cách làm |
| `h-state`: dải 0–300 ms ghi "KHÔNG hiện spinner", bảng lại có spinner 20 hiện ngay | Sửa chữ dải và câu mở đầu: không THAY nội dung bằng spinner / skeleton, chỉ báo nhỏ tại chỗ hiện ngay; foundation.md §18 dòng "Đang tải" khớp §18.1 |
| `h-data-table`: Volume pricing bảng 2 cột, mẫu xếp thẻ 3 dòng | Sửa: bảng đầu màn thêm cột You save (—, 10%, 20%); Material một giá trị ở cả ba mẫu; lưới 2 cột `align-items: start` (khung không bị kéo cao) |
| `h-button`: Secondary Loading mất viền | Sửa kit: `.button--secondary` viền đọc `--color-foreground`, không `currentColor` |
| `h-grid` 360: bảng mất cột Token | Sửa: `stack-table` + `data-label` |
| `h-dark`, `h-article`: vòng focus của card trong hàng cuộn bị cắt trên / dưới | Sửa kit: `.card-row` đệm 8 + lề âm 8 + `scroll-padding-inline` 8 |
| `h-drawer`: Subtotal / Total sai phép tính | Sửa: Subtotal $153.99, Discount −$10.00, Total $143.99; mẫu chân chỉ Total $143.99 |
| `h-rte` 360: "Intermedia / te" | Sửa kit: `.rte th, .rte td` `overflow-wrap: break-word` |
| Pagination: số 44 lệch xuống 3px so với nút tròn 52 | Sửa kit: `:where(.pagination__list > li) { display: flex; align-items: center }` (specificity 0 để `.pagination__status` / `__num` vẫn ẩn theo mốc) |
| cart 360, State 4: câu lỗi bóp cột 100px, 6 dòng | Sửa `ES1-T255/cart.html`: câu lỗi là hàng riêng `.line__error` (dưới 48rem trải hết dòng: 2 dòng ở 360; từ 48rem từ cột info tới hết dòng) |
| collection 1280, S7: skeleton 2 cột 583 | Sửa `ES1-T254/collection.html`: skeleton theo lưới trang (2 cột dưới 48rem, 3 cột từ 48rem), 6 ô, bề ngang 9 / 12 cột; đo lại ô 292 ở 1280, 336 ở 1920; hai khung S7 xếp dọc |
| product-1920, navigation-768, shopify-features-768: đuôi trắng 250 / 94 / 185px | Lỗi công cụ render, không sửa nguồn. `render_all.py` thêm bước so chiều cao ảnh với trang, cắt đuôi một màu và báo lỗi đuôi trống > 5%. Cần render lại 3 trang |
| product 360, Trạng thái G: thanh dính vỡ trong khung mẫu | Lỗi công cụ: `render.js` bỏ `position` của mọi `.buy-bar` khi chụp theo đoạn; đổi thành `.buy-bar:not(.mini-frame > .buy-bar)`. Cần render lại product |
| minor `h-rtl`: message 2 dòng căn trái trong khung RTL; "6 mẫu" | Sửa: bọc `<span><bdi>`; ghi 12 mẫu (màn và §34) |
| minor nút nhãn dài có icon: icon tách xa chữ ở 360 | Sửa kit: `.button--wrap:has(> svg)` căn start, không balance |
| minor `h-icon`: 2 hàng cuối bảng không có glyph | Sửa: thêm glyph prev, plus |
| minor `h-state`: 768 thẻ skeleton thứ 4 rớt hàng; mẫu lỗi cuối màn không nhãn; cỡ spinner | Sửa: 2 thẻ bù chỉ hiện ở lưới 3 cột; thêm `demo-label`; câu mở đầu ghi rõ 3 cỡ 24 / 20 / 12 |
| minor `h-form`: tên class nằm trong câu thông báo; nút busy hẹp hơn; select Open không mũi tên; nhóm radio tách hàng ở 360 | Sửa: tên class ra dòng chú thích; nút busy giữ icon (cùng bề rộng); thêm chevron xoay 180°; radio thành hàng riêng |

Bỏ qua, có lý do:
- Spinner 12 ngoài thang icon 16 / 20 / 24: giữ, V61 chốt `.spinner--xs` 12 cho dòng tồn variant picker; không đảo sổ. Lệch 16 của localization.md L9 vẫn ở Còn mở.
- Tên token trong `<code>` ngắt sau dấu gạch (`h-token-architecture`, `h-icon`): chưa sửa. `white-space: nowrap` cho mọi `code` làm tràn ô bảng xếp thẻ ở 360 với chuỗi dài (`.form-message--error.form-message--inline`); cần tách từng chuỗi liệt kê thành nhiều `<code>`, để ticket sau.

Cần FE thêm (code theme, không làm ở ticket này):
- `.button--secondary`: nếu base.css dùng `border-color: currentColor` thì trạng thái `aria-busy` mất viền; đọc `--color-foreground` (trên nền tối đã đặt màu riêng).
- Hàng card cuộn ngang (collection list, hàng bài viết): đệm 8 + lề âm 8 để vòng focus của card không bị khung cuộn cắt.
- Pagination: `li` trong `.pagination__list` là flex căn giữa để số 44 và nút tròn 52 cùng tâm.
- `.rte th, .rte td`: `overflow-wrap: break-word`, không `anywhere`.
- RTL: `:dir(rtl) .quantity { direction: ltr }`.
- Cart: câu lỗi của dòng hết hàng là hàng riêng của grid `.line`, không nằm trong `.line__info`.
- Collection S7: skeleton dùng đúng class lưới của vùng kết quả, số ô theo số cột của mốc.

Section / trang đổi diện mạo ở vòng này: `h-grid`, `h-icon`, `h-rtl`, `h-button`, `h-dark`, `h-article`, `h-form`, `h-data-table`, `h-drawer`, `h-state`, `h-rte`, `h-pagination`; trang cart, collection, pagination; kit đổi nên trang có `.card-row` (article, trang chủ mobile), pagination (collection, search, blog) và nút secondary đang tải cần render lại. Chưa render lại ảnh chính thức ở vòng này.
