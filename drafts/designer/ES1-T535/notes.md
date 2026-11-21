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
