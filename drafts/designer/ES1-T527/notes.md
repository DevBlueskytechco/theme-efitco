# ES1-T527 — Sửa Thiết kế theme Efitco theo DS check 20/11

Báo cáo: `ai-team/data/design-audit/efitco-ds-check-2026-11-20.md`. Quyết định token: `docs/design/decisions.md` mục "CTO 20/11 — ES1-T527 (DS check)".

## Phần Design System (agent DS)

Đã sửa: tokens.json, DESIGN.md, docs/ui-spec/foundation.md (mục "Thay đổi DS check", §1.1, §1.2, §30, §31), `_kit/kit.css` (token + mục 13b), `ES1-T251/foundation.html` (34 section, mỗi section `demo-block` id `h-*`).

Section mới trong foundation.html: `h-spacing-radius`, `h-elevation-layers`, `h-motion`, `h-collection-card`, `h-input-group`, `h-listbox`, `h-chip`, `h-facets`, `h-selectable-option`, `h-variant-picker`, `h-quantity`, `h-price-rating`, `h-data-table`, `h-progress`, `h-sticky-bar`, `h-rte`, `h-pagination`.

Ảnh hưởng tự động lên mọi trang (qua kit, page agent cần render lại): thang chữ mobile lớn hơn (h1 40, h2 32, h3 28 ở 360), body Inter 500 lh 26, section 56 dưới 1024, gutter 12 ở 360, dialog bo 20, accordion hết cam, breadcrumb 1 dòng, swatch card hết viền accent, thanh carousel cao 4.

Page agent cần làm (kit đã có, trang xoá bản riêng): `.rte` + `.reading-column` (article, page), `.pagination*` (search, article, blog), `.chip*` (search, collection, predictive, 404, quiz), `.empty-state--framed/--compact` (search S2/S6, predictive), `.input-group` + `.search-field` (search, 404, password), `.category-link` (search S1/S2, 404), `.no-results` bo 24 → `--radius-panel`, `.status-busy .spinner` 16 → bỏ override, `.nf-swatches` → snippet card kit.

## Cần FE/DevOps

- FE `config/settings_schema.json`: `badge_new_color` default #467A48 → #4B824D (V01); `background_alt_color` #F4F4F4 → #F4F4F5 (V18); `type_primary_font` default `inter_n4` → `inter_n5` (V05).
- FE `snippets/css-variables.liquid` + `assets/base.css`: thang chữ clamp mới, `--font-size-h4`, `--font-size-eyebrow`, `--line-height-heading` 1.2, `--line-height-body` 1.625; `--space-2xs…7xl`; `--radius-xs…xl`, `--radius-panel`, `--radius-dialog` 20; `--control-height-compact`; `--shadow-bar`; `--layer-*`; `--color-accent-on-sand` dùng foreground thay #000; `--panel-muted`, `--panel-saving` toàn cục (V02–V06, V15, V17).
- FE: `.accordion`/`.faq-item` icon `currentColor`, câu đóng muted (V37); breadcrumb 1 dòng (V20); component kit mục 13b khi dựng section tương ứng.
- DevOps (CI): check so `docs/tokens.json` ↔ `config/settings_schema.json` defaults ↔ `drafts/designer/_kit/kit.css :root` (V01, V03); grep chặn selector component của kit (`.rte`, `.pagination__`, `.chip`, `.empty-state`, `.search-field`, `.input-group`, `.quantity`, `.variant-pill`) định nghĩa trong `<style>` của file trang `drafts/designer/*/*.html` (V57).
- DevOps (ai-team `mcp/shot.js`, V19): `page.screenshot({ fullPage: true })` của Chromium trắng mọi pixel sau ~16 384 px (đo 20/11: foundation 360 cao 50 836, 768 36 756, 1280 31 134 đều trắng từ y≈16 350). Footer 360 trắng ở bản cũ là lỗi chụp này, không phải lỗi bố cục (document đo cao 50 623, footer đáy 50 623). Cần chụp theo đoạn rồi ghép, hoặc cắt ảnh DS theo element `section[aria-labelledby]`.

## Cần người duyệt

- Designer người: tạo variant trong Figma DS2 (CTA Button, Label, Tabs, Product, Price) theo ma trận trạng thái foundation.html; tạo effect style 4 bóng; ghi chú accent #C8400E trên Figma; gộp/xoá màu chỉ có ở Figma (V15, V18).
- Thanh tiến trình carousel 4 và meter 8 lệch DS2 "chỉ báo 8" có chủ đích (sổ 09/11 "mảnh", Figma 1:359 "Line" h 4).

## Vòng 2 — Kit + DS (review DS + kit_gaps các nhóm trang)

Đã sửa kit.css / foundation.html (render tự kiểm theo section 360/1280: `ES1-T251/_tmp/r2/h-*.png`):
- V12/V20: bỏ `overflow:hidden` ở `.breadcrumb ol` (vòng focus link hiện đủ); "…" do li cuối / mục giữa tự cắt.
- V02: `.overlay__title` lh `--line-height-heading` (1.2) + letter-spacing heading.
- V05: tokens.json `font.primary` ghi đích `inter_n5`; kit chú thích `--font-primary--weight` 400 chỉ cho giá trị ô nhập, `.field__input` đọc biến này.
- V18: DESIGN.md, tokens.json `_contrast` ghi "#F4F4F5". V01: cart.md (§3, bảng tương phản, câu hỏi), index-mobile-a.md số `--panel-saving` 5.82 / #A5C0A6; bảng foundation.md §25 đánh dấu lịch sử.
- Render: `.site-header--static` (helper mockup) áp cho header foundation.html để chụp theo section không bị header dính đè. Ảnh foundation.html bỏ `loading="lazy"`.
- Kit mới: `.button.is-pending`, `.alert__actions` (+ nút con trực tiếp `.alert__body` căn trái), `.dialog--s` 2 nút chia đều 1 hàng ≥ 768 (đệm 32 từ 1280), `.dpanel--lg` (32 / 40), `.dpanel__row--plain` + Total đứng đầu không gạch, `.facet-swatch`, `.data-table--fluid` (+ `--striped` không min-width), thụt đều ô đầu khi có `.data-table__row--current` (`:has` hoặc `.data-table--has-current`), `.article-card` lề 24 từ 768 + meta trắng có "·" + `.is-hover`, `.rte table` display table rộng hết cột (bảng nhiều cột bọc `.table-wrap`), `.field__input--on-dark`, `.search-field--on-dark`, `.search-field__submit` + spinner trong ô, `.form-message--warning`, `.drawer-loc` (V65/LC1: hàng cuối danh sách cấp 1, không viền khung), `a.product-row` không gạch chân, `.variant-pill`/`.variant-more` nowrap, `.badge` justify-self start, `.price--xl` (PDP 28/600), `.sale-countdown*` chuyển từ foundation.html vào kit (+ `.sale-countdown-host`, `.sale-countdown--compact`).

Page agent cần làm vòng sau (xoá bản riêng, dùng kit): T279/T293 `.countdown*` → `.sale-countdown`; T278/T279/T293 panel bundle / shop the look thêm `.dpanel--lg`; T285 quiz nomatch bỏ `column-reverse` ≥ 768 (kit lo); T253 `.pdp-price*` → `.price.price--xl`, bỏ `.button.is-pending` bản trang, bỏ `.spec-table` min-width; T254 `.facet-swatch` dùng `--swatch` thay `--sw`, xoá bản trang; T288 volume pricing bỏ thụt tay; T257 blog/article xoá override `.article-card__meta`/`__content`, meta tách `<span>`; T258 password `.dark-form__row` → `.input-group--attached` + `.field__input--on-dark`; T261 `.ps-field*` → `.search-field--on-dark` + `.search-field__submit`; T262 `.cd-line__msg--warning` → `.form-message--warning.form-message--inline`; T289 `.drawer-loc` bản riêng (khung viền ở chân) → kit `.drawer-loc` hàng cuối danh sách như navigation (V65); T260 `.nav-row__locale` → `.drawer-loc`. Mockup: bỏ `loading="lazy"`.

Cần FE (code theme): `.field__input` giá trị weight 400 literal (không đọc `--font-primary--weight` khi setting thành inter_n5); `.breadcrumb ol` bỏ overflow hidden; `.rte table` không display:block (bọc `.table-wrap` khi bảng nhiều cột); countdown snippet theo `.sale-countdown`; `.button.is-pending` cho VP1; `.facet-swatch`; `.drawer-loc`.

Quyết định đã chọn theo quy tắc CTO 20/11 (decisions.md "Vòng 2", CTO có thể đảo): V06 gutter ≥ 80rem 24 và thanh carousel 4 GIỮ theo khung Figma Final trang chủ (1:490, 1:359; CTO 06/11 trang chủ 100% Figma); `--space-7` 48 dùng cho bố cục khi khung Figma Final đo đúng 48; `.dpanel--lg` 32/40; PDP giá `.price--xl` 28/600.

Còn mở: ES1-T252/index.html (bản so live, không dùng kit) chờ CTO giữ hay lưu trữ; V19 shot.js fullPage (DevOps); grep CI V57 cần bỏ qua dòng comment (DevOps).

## Trang nội dung (search, blog, article, page, 404, password, gift_card)

Đã sửa (V53–V64 + V20, V41, V54, V55, V57, V58 phần trang): xoá bản chép `.rte`, `.pagination*`, `.chip*`, `.category-links a`, `.search-form__*`, `.filter-group`, `.nf-swatches`, `.gc-card__tag` khỏi `<style>` trang; dùng kit `.rte` + `.reading-column` (article, page), `.pagination__list/__step/__status` (search, blog, article), `.chip-list/.chip/.chip--remove`, `.category-link`, `.empty-state` (+ `--framed`), `.input-group` + `.search-field` (search, 404), `.facet` (drawer lọc search), `.display`, `.badge--outline`, `.button__icon`, `.button--on-dark`, `.swatches`. Bo 16 = `--radius-panel`; khoảng cách lẻ → `--space-2xs…6xl`. Spec cập nhật: article.md, page.md, search.md, 404.md, gift-card.md. Ảnh tự kiểm `_tmp/` cạnh từng html (360/768/1280/1920).

Cần thêm vào kit (không sửa kit ở bước trang):
- `.article-card__content` padding 24 từ 48rem (Figma 1:1030) và `.article-card__meta` chữ trắng + dấu "·": blog.html, article.html đang giữ override cục bộ (scoped `.article-grid`, `.related`).
- `.article-card.is-hover .article-card__title` gạch chân (kit chỉ có `:hover`), mẫu hover blog đang dùng style inline.
- `.rte table { display: block }` làm bảng không full cột 720 khi ít chữ (page S1): đề xuất bọc overflow bằng wrapper do JS/Liquid hoặc `display: table` + wrapper `.rte .table-wrap`.
- Biến thể ô nhập nền tối cho `.input-group--attached` (password: `.site-footer__input` liền nút), hiện trang password tự bỏ bo góc trong `.dark-form__row`.

Vòng 2 (content, 20/11) — 4 mục kit ở trên đã có trong kit.css, trang đã chuyển:
- blog.html, article.html: bỏ override `.article-grid/.related .article-card__meta|__content`, bỏ style inline gạch chân ở mẫu hover (dùng kit `.article-card.is-hover`).
- page.html: bảng RTE S1 rộng hết cột 720 nhờ kit `.rte table` display:table (không cần sửa trang).
- password.html: email = kit `.input-group--attached` + `.field__input--on-dark`; ô password cũng `.field__input--on-dark`; bỏ `.dark-form__row` và `.site-footer__input` trong trang. (Vòng 3 đảo phần nút: xem dưới.)
- 404.html (review P3 V56/V62): nhãn slot danh mục 'POPULAR CATEGORIES' (group-label caps) → 'Shop by category' 16/600 chữ thường, cùng kiểu slot phụ search S1/S2.
- article.html: hàng 'More Training Tips' 1280+ 3 card chia đều khung (`flex: 1 1 0`), hết khoảng trống ~184px bên phải.
- Mọi trang nhóm content: bỏ `loading="lazy"` ở ảnh mockup (search S2 Popular Products hết trống ảnh).
- Comment trong `<style>` không còn nhắc tên selector kit có dấu chấm (pagination, chip, category-link, rte), grep V57 thô không báo nhầm.
- FE: snippet password dùng `field__input field__input--on-dark` trong `input-group input-group--attached input-group--stack-mobile` (vòng 3) thay `site-footer__input` + `.dark-form__row`; main-404 đổi nhãn slot danh mục cùng kiểu search (locale 'Shop by category').
- Còn mở: biến thể RTE 'testimonial quote' nền sand (cần Designer người/CTO chốt); V19 shot.js fullPage (DevOps).

## Trang chủ (ES1-T293 1280/1920, ES1-T278 + ES1-T279 768/360)

Đã sửa: V23, V24, V25, V26, V27, V28, V29, V30, V31, V32, V33, V34, V35; phần trang của V12/V14/V22/V37/V48 (collection card kit, swatch hết `is-selected`, accordion kit, meter kit). Bỏ bản chép cục bộ: `.cat-card`, `.quiz-opt` (tự vẽ radio), `.bcard`, `.bpanel*`, `.panel*`, `.stl-row img`, `.vcard__thumb`, `.tcard__product img`, `.stars`, `.text-cta`, `.stl__link`, `.button--muted`, `.muted-on-panel`, `--on-panel-*`, `--radius-band`, `.display`/`.on-dark`/`.section-header`/`.skeleton`/`.spinner`/`.alert`/`.empty`/`.sheet` định nghĩa lại, `.bundle-bar` màu riêng, `.offer-teaser`, `.home-section`.
ES1-T252 (bản so live, chép base.css, không dùng kit) không sửa: không sinh ảnh home-* của bộ thiết kế.

Cần FE (khi dựng section trang chủ):
- quiz, bundle builder, shop the look: markup `.option-card` (input visually-hidden + `.option-card__check`), không radio/checkbox tự vẽ; panel = `.dpanel` + dòng giảm giá `dpanel__row--saving` (icon tag, U+2212, nowrap).
- dòng sản phẩm gọn (video, testimonial, shop the look) = `.product-row`; rating = `.rating`.
- thanh dính bundle = `.buy-bar` (snippet dùng chung với sticky ATC), teaser = `.teaser` đọc `--bottom-bar-height`.
- Why choose: section thêm ngữ cảnh `.on-dark` (eyebrow xám, focus trắng).

### Trang chủ — vòng 2 (review + kit vòng 2)
Đã sửa (ES1-T293, ES1-T278, ES1-T279; ảnh tự kiểm `_tmp/r2/r2-{360,768,1280}.png`, không lỗi console):
- Countdown dùng kit `.sale-countdown` trong `.sale-countdown-host` (T293, T279); bỏ CSS `.countdown*` riêng. T293: host `justify-self: stretch` để container query đo cột (cột hẹp thì khung chứa 0).
- Bundle + Shop the look (T293) dùng `.dpanel--lg` (32, 40 từ 80rem) theo Figma 1:636/1:560.
- Shop the look: bỏ `.option-card__check` ở 4 dòng, viền accent chỉ là "đang xem" (hotspot), khớp tổng "4 items" (review vòng 2). `.stl-row` bỏ chỗ chừa cho vòng check.
- Big Offer (T279): bỏ `:root:has(.bundle-bar.is-visible)` trong mockup, đặt `--bottom-bar-height` theo từng khung `.phone` (khung 2 về 16 từ đáy). Trang thật vẫn đặt trên `:root`.
- Badge Sold out ô bundle: kit `.badge { justify-self: start }` đã đủ, không cần CSS trang.
- T278 768: "Hero: image missing" thành `state--wide` → lưới trạng thái không còn ô trống.
- V23 (T279 768): `.fp__actions .button` nowrap trong state-card, "View Detail" 1 dòng.
- V25: nhãn `dpanel__row--saving` nowrap (T278, T279), "Setup/Bundle discount (10%)" 1 dòng ở 360/768.
- Ảnh khớp tên: ô bundle đổi tên theo ảnh efx-prod (P09 Kettlebell 16 kg, P10 Battle rope, P11 Medicine ball 4 lb, P12 Weighted vest, P13 Sandbag 10 lb, P14 Speed rope; giá giữ nguyên). Shop the look đổi ảnh (FlexFold Bench P07, Compact Power Rack R3 P08, Training Mat P16). Video/testimonial: Ativafit Lava → P05, Compact Power Rack → P08, Resistance Band Set → P06, "Olympic Plate Set 100" → "Hex Dumbbell Set" (P17), "Recovery Roller Pro" → "Cast Iron Kettlebell" (P20).
- Thumb `.product-row`: bọc `<span class="product-row__media">` nền cream + `isolation`, nên ảnh nền trắng hoà vào cream qua `mix-blend-mode: darken` của kit. Ô thumb giờ đồng đều.
- Không có `loading="lazy"` trong 3 file.

(Vòng 3: ĐÃ đưa `.product-row__media` vào kit.) Việc cho DS (kit): `.product-row__thumb` đặt nền cream lên chính ảnh. Darken trộn cả phần nền đó nên ảnh JPG nền trắng vẫn hiện trắng. Cần thêm wrapper `.product-row__media` vào kit (hiện định nghĩa tạm ở trang chủ), rồi các trang bỏ bản riêng.
Việc cho FE: snippet product-row bọc ảnh trong `.product-row__media`. Countdown featured product = `.sale-countdown`, khung chứa `.sale-countdown-host` rộng hết cột. Panel bundle/shop the look ≥ 64rem dùng `.dpanel--lg`.
Còn lại: ES1-T252 chờ CTO giữ/lưu trữ. Ảnh chính thức index-*.png chưa ghi đè, mới có ảnh trong `_tmp/r2/`.

## Phần Overlay (agent overlay)

File: ES1-T260/navigation.html, ES1-T261/predictive-search.html, ES1-T262/mini-cart-quickview.html, ES1-T285/quiz-result.html, ES1-T263/marketing-popups.html, ES1-T289/announcement-bar.html, ES1-T289/localization.html, ES1-T287/pagination.html; docs/ui-spec/navigation.md (V65). Ảnh tự kiểm ở `_tmp/` cạnh từng file (360/768/1280/1920).

- Đã xoá bản chép: `.pagination*` (pagination.html), `.stepper`, `.opt*`, `.stock`, `.ship__bar`, `.sum-row`, `.cd__foot`, `.button--sm/--muted`, `.badge--xs` (mini cart), `.ps-chip*`, `.ps-message` (predictive), `.loc__label/__search/__clear/__option` visual, `.loc__empty`, `.loc__spinner` (localization), `.menu-promo`, `.locale-btn`, ô collection ≥ 1280 (navigation), `.answer`, `.opt__item`, `.button--grey`, `.result-icon`, `.offer-teaser__*` (quiz, popups).
- Thay giá trị lẻ: bo `calc(card + space-1)` → `--radius-panel`, `var(--space-1/2)` làm bo → `--radius-xs/-sm/-swatch`; z-index số → `--layer-*`; bóng thanh đáy → `--shadow-bar`; letter-spacing/line-height heading → token.

## Cần FE/DevOps (overlay)

- FE: `.drawer-loc` / hàng localization gộp chưa có trong kit (đang ở localization.html, navigation dùng `.nav-row`); khi dựng snippet localization nên gom một class chung.
- FE: thanh dính PDP/bundle trong marketing-popups §5 (`.bz-bar`) vẫn là bản riêng, chưa chuyển `.buy-bar` (giữ vì là sơ đồ vùng đáy ES1-T290).
- FE: `.ps-field` (ô tìm trên thanh tối, có nút submit trong ô + spinner) chưa có trong kit `.search-field` (biến thể on-dark).

### Overlay — vòng 2 (review + kit vòng 2)

Ảnh tự kiểm 360/768/1280: `ES1-T26x/_tmp/r2/`, `ES1-T285/_tmp/r2/`, `ES1-T289/_tmp/r2/`, `ES1-T287/_tmp/r2/` (cả trang + theo khối, không lỗi console). Ảnh mockup bỏ `loading="lazy"` ở cả 8 file.

- Predictive (T261): bỏ `.ps-field` → kit `.search-field` (+ `--on-dark` ở popup thanh tối; drawer dùng bản sáng): kính lúp trái, xoá + submit (mũi tên) trong ô, spinner thay nút xoá khi tải. V74: `.ps--popup` thêm `overflow: hidden` từ 48rem, chân trắng không còn đè 2 góc bo. "Try Again" = `.button--small` căn trái theo kit `.alert__body > .button`, cùng cỡ với mini cart 4D / quick view 5E.
- Navigation (T260) + Localization (T289), V65: một mẫu duy nhất = kit `.drawer-loc` là hàng CUỐI danh sách cấp 1, không khung, chân chỉ Sign In. localization.html bỏ bản `.drawer-loc` riêng (có viền) ở chân, thêm Contact / Help cho khớp navigation; navigation bỏ `.nav-row--locale` / `.nav-row__locale`.
- Navigation: hàng "Featured product" 2 cột (ảnh 56 + chữ), giá và badge -N% dưới tên → tên 1 dòng ở 360; gạch chân hết nhờ kit `a.product-row`. V72: ca biên sản phẩm ≥ 1280 là card dọc, < 1280 là `.product-row` (ảnh hết hàng 0.6 + badge), mô tả sửa theo.
- Localization: 2 tab trong drawer/sheet chia `minmax(0, 1fr)`, nhãn dài xuống dòng trong tab (không tràn 13px ở 360).
- Mini cart / quick view (T262): dòng "Quantity changed…" → kit `.form-message--warning --inline` (bỏ `.cd-line__msg--warning`); bỏ bản riêng `.button.is-pending` (dùng kit VP1); chân chỉ Total dùng kit `.dpanel__row--total:first-child` (không gạch). Sheet < 48rem: nút × nằm trong dải đầu sheet dính trên (sticky, nền trắng hết ngang), nội dung cuộn chạy dưới dải, hết đè pill "20 lb". "Show Fewer" trong lưới ô 72 chiếm 2 ô, rộng theo nhãn (kit nowrap làm chữ tràn pill).
- Quiz (T285), V66: 2b gắn kit `.dialog--s` (panel bỏ padding của kit), < 768 sheet primary trên (kit), ≥ 768 hộp 480 hai nút chia đều 1 hàng secondary rồi primary; dáng sheet (thanh kéo, không bo đáy) chỉ < 768. 2e: hàng nút trong panel hẹp `flex-wrap: wrap-reverse` → xuống dòng thì primary trên. V39: 2f Color = `.variant-swatch` như quick view T262.
- Marketing popups (T263), announcement bar (T289), pagination (T287): chỉ bỏ lazy + render lại, không có mục review.

Cần kit / FE (overlay vòng 2):
- Kit: `.variant-option__values--grid > .variant-more[aria-expanded='true']` nên chiếm 2 ô (hiện ở mini-cart-quickview.html).
- Kit/FE: nút × của dialog dạng sheet < 48rem nên sticky trong dải đầu sheet (hiện ở mini-cart-quickview.html `.qv .dialog__close`); áp cho mọi sheet cuộn dài.
- Còn bản riêng chờ người duyệt: `.bz-bar` (marketing-popups §5, sơ đồ vùng đáy ES1-T290).
- V19 (ảnh fullPage trắng sau 16 384px): popups 360 cao 14 731, mini cart 360 cao 14 491, chưa chạm ngưỡng.

## Phần Trang thương mại (agent thương mại)

File: ES1-T253/product.html, ES1-T288/shopify-features.html, ES1-T254/collection.html, ES1-T254/list-collections.html, ES1-T255/cart.html. Ảnh tự kiểm `_tmp/` cạnh từng file (360/768/1280/1920), không tràn ngang ở 360/768.

- Đã sửa: V36 (P1, tên SP F1–F6 = `.h1` kit, render Sofia 700), V37 (accordion PDP theo kit, không override), V38 (`.quantity` / `--compact` dòng giỏ), V39 (`.variant-option/-pill/-swatch/-more`, `.stock-line`), V40, V41, V42, V43, V44, V45, V46, V47, V48 (`.meter-box` cart), V50 (textarea 144), V51, V13/V25 (panel giỏ = `.dpanel`, `--panel-*` của kit, U+2212), V14 (list-collections = `.collection-card`), V20 (bỏ override breadcrumb PDP), V22 (card hết `is-selected`, "N colors" → 3 + "+N"), V23 (`.button--grey` → `--tertiary`), V34 (thanh dính = `.buy-bar`), V54 (lọc rỗng `--framed`), V57 (bỏ `.pagination*` chép ở collection, list-collections), V69 (quick view `.dialog--m-wide`).
- Bỏ bản chép cục bộ: `.opt*`, `.option*`, `.qty*`, `.stock*`, `.stars`, `.rating`, `.button--small` (PDP định nghĩa lại 40), `.spec`, `.vol`, `.sticky-bar*`, `.fgroup*`, `.fopt*`, `.chip*`, `.chips`, `.sort label` nổi, `.sort-options`, `.pagination*`, `.lc-card*`, `.ship*` (progress), `.panel*`, `.mc-badge`, `.button--grey`, `.line__alert`, `:root --panel-*` (cart), override breadcrumb.
- Thay giá trị lẻ: `calc(radius-card + space-1)` → `--radius-panel`; `var(--space-1/2)` làm bo → `--radius-xs/-sm`; z-index 5/15/21 → `--layer-*`; 11px → `--font-size-xs`; lh heading → `--line-height-heading`; khoảng cách → `--space-xs…7xl`.

Cần FE (trang thương mại):
- Snippet PDP/quick view: `.variant-*` + `.quantity` (default), dòng giỏ cart/mini cart `.quantity--compact`; lỗi 422 `.form-message--inline`; thanh dính `.buy-bar` (thêm dòng biến thể, giá gạch, số lượng ≥ 64rem); nút thanh toán nhanh cart `--shopify-accelerated-checkout-button-block-size: 48px`.
- Collection: facet = `.facet` + `.choice`, khoảng giá compact; sort nhãn trái; chip `.chip--remove`.

Cần thêm vào kit / DS chốt (không sửa kit ở bước trang):
- Giá PDP: kit `.price--lg` = 20/700, product.md = h3 28/600 (Figma 1:786). Trang giữ `.pdp-price` theo product.md; DS cần chốt một bậc rồi đổi `.price--lg` hoặc product.md.
- `.button.is-pending` (Add To Cart giữ màu khi đang tải biến thể, VP1) chưa có trong kit; product.html giữ modifier riêng.
- Ô màu trong bộ lọc (checkbox tròn 24, chọn = vòng foreground) chưa có trong kit; collection.html giữ `.facet-swatch`.
- `.data-table` `min-width: 20rem` làm bảng 2 cột (volume pricing) cuộn ngang trong khung hẹp 280 (shopify-features 360); đề xuất bỏ min-width cho bảng ≤ 2 cột.
- `.data-table__row--current` chỉ thụt ô đầu hàng hiện tại; các hàng khác lệch chữ 20 so với hàng có ✓ (trước đây có `.tier-pad`).
- `.brand-btn` (helper mock) cao 44 cố định; cart đặt 48 bằng ngữ cảnh `.accelerated .brand-btn`.

Còn mở (cần người):
- V52: ảnh demo có sẵn viền xám ("Adjustable dumbbell pair" efx-prod-P09, "Training mat" efx-prod-P14, "Speed rope" upsell cart): cần thay/cắt ảnh ở demo-data (store dev), mockup không sửa được.
- V49: "Sản phẩm số" ảnh không vuông nên `contain` lộ nền cream trên/dưới, góc ảnh vuông bên trong khung bo 12 (khung đúng DS); thêm ca "ảnh ngang / không nền" vào màn DS product card là việc DS.


### Trang thương mại — vòng 2 (review + kit vòng 2)

Ảnh tự kiểm: `ES1-T253/_tmp/r2/`, `ES1-T288/_tmp/r2/`, `ES1-T254/_tmp/r2/`, `ES1-T255/_tmp/r2/` (360/768/1280 toàn trang + ảnh theo khối), không lỗi console.

- Chuyển sang class kit, bỏ bản riêng: giá PDP `.pdp-price*` → `.price.price--xl` (product.html, shopify-features.html: hết lệch 20/700 vs 28/600); `.button.is-pending` (bỏ modifier ở product.html); `.facet-swatch` (bỏ CSS riêng ở collection.html, `--sw` → `--swatch`); bảng thông số `.data-table--fluid` (V46 360: hết cuộn/cắt chữ); bảng volume pricing `.data-table--fluid.data-table--has-current` (hết cuộn ngang ở QV 360, các hàng thụt đều với hàng ✓); countdown PDP `.countdown*` → `.sale-countdown*` của kit (`--soon` → `data-state="ending"`, ended → `.sale-countdown--ended` + `__ended`; `.buy__head` và ô demo K là `.sale-countdown-host`).
- V47 (collection 360): thanh công cụ < 48rem ẩn trực quan nhãn "Sort by" (vẫn `<label for>`), nút Filter đệm 16 → ô select đọc được "Price, low to…"; demo S4 < 48rem mỗi ô sort một hàng rộng hết khung.
- V44 (drawer lọc): chân drawer là flex `wrap-reverse`: đủ chỗ thì Clear All | Show N Products một hàng (768), hẹp thì Show N Products lên trên, Clear All dưới, không cắt chữ (360).
- V22 (PDP You May Also Like): card Kettlebell "3 colors" → 3 `.swatch` aria-hidden + tên có ", 3 colors" ẩn, cùng kiểu collection.
- list-collections: vòng focus card cách chữ/mép `--space-xs` (8) như `.product-card` (rule ngữ cảnh `.lc-grid`).
- Bỏ `loading="lazy"` mọi ảnh mockup ở 5 file (F8 quick view 360 hết trống ảnh).

Đề xuất kit (không sửa kit ở bước trang):
- `.data-table--striped/--fluid` để `overflow-wrap: anywhere` cả `th` → nhãn cột hẹp bị ngắt giữa từ ("Assembl|y" ở spec 360). product.html thêm `.spec-table th { overflow-wrap: break-word; }`; nên đổi trong kit cho `th` (hoặc cả bảng) sang `break-word`.
- `.collection-card` focus `outline-offset: 4px` sát chữ khi card không đệm; đề xuất kit dùng `--space-xs` như `.product-card`, rồi bỏ rule ngữ cảnh ở list-collections.

Cần FE (bổ sung): PDP countdown theo `.sale-countdown` + khung chứa `container-type: inline-size`; giá PDP theo `.price--xl`; bảng thông số/volume dùng biến thể fluid; toolbar collection < 48rem nhãn sort ẩn trực quan; chân drawer lọc xuống 2 hàng khi hẹp.

Còn mở (không đổi): V52 ảnh demo viền xám (demo-data store dev), V49 ca ảnh ngang ở màn DS product card, V19 fullPage trắng sau 16384px (product 360 cao 19 128 → kiểm theo khối).

### Vòng 3 (20/11, review vòng 2 còn 14 mục)

Ảnh tự kiểm `_tmp/r3/` cạnh từng file (360/768/1280 toàn trang).
- Kit: thêm `.product-row__media` (ô cream 56 bo 8 + isolation bọc thumb); bỏ định nghĩa tạm ở ES1-T278, ES1-T279, ES1-T293 index. Thêm `.input-group--stack-mobile` (< 48rem ô trên, nút dưới full có chữ; ≥ 48rem liền ô).
- Trang chủ 360/768 (ES1-T279): `.states`/`.phone-row`/`.phone-wrap`/`.bar-demo` cột `minmax(0,1fr)`; thanh mẫu < 48rem tràn mép như thanh thật (360) → hết cuộn ngang 6px. 768/1280: thanh lỗi chiếm cả hàng (không ô trống). 2 khung điện thoại thẳng đỉnh (nhãn đẩy xuống đáy ô).
- shopify-features F8: `.qv__actions` < 80rem 1 cột (Add To Cart cả hàng, View Detail dưới, như PDP), ≥ 80rem 2 nút 1 hàng → hết cắt chữ 360/768. < 48rem `.stage-qv` cao 940 + sheet `max-height` trong khung: nút đóng và hàng nút hiện đủ.
- password.html: đảo lại theo password.md §4 (newsletter 360 ô và nút xếp dọc, nút full) và footer Figma 1:1104: `.input-group--attached.input-group--stack-mobile`, nút `.button` có chữ "Notify Me" mọi mốc. S5 "Không ảnh": thẻ `.password__media--empty` ẩn < 48rem như chú thích.
- 404.md: mục 2.4–2.6 sửa theo mockup (Back To Homepage secondary, Search là primary duy nhất; slot "Shop by category" `.category-link`); locale dùng chung `search.shop_by_category`, bỏ `404.categories`.
- article.html: skeleton bài liên quan `.related-skeleton` chia đều từ 80rem như hàng thật (0 CLS); tiêu đề + chú thích mẫu trạng thái trong cột đọc có khoảng cách như `.demo-block > .demo-note`.
- localization.html: tab `overflow-wrap: anywhere` + `<wbr>` sau "/" ở "Country/region" → lề trong ≥ 12 ở drawer 360.
- quiz-result.html 2b: ô chiếm 2 cột từ 48rem (hộp đúng 480), thân theo padding kit `.dialog--s` (32 từ 80rem) → 2 nút 1 dòng; lưới `dense` lấp ô trống.
- marketing-popups §5: 3 thanh đáy (bundle trang chủ, PDP, cart) = kit `.buy-bar`, bỏ `.bz-bar*` và bản panel tối (decisions.md CTO 20/11).
