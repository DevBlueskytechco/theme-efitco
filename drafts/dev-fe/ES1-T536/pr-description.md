KHÔNG CHẮC: (1) gzip base.css / file template chưa đo được trong sandbox (gzip, node bị chặn) — bytes thô giảm ở mọi file, chờ CI; (2) 12 spec QA stub TOKENS cũ (--space-1…8, 120px) sẽ thiếu tên mới — đã tạo ES1-T613 cho QA; (3) kích thước lẻ không có token (72, 88, 96, 120, 144…) viết rem theo quy ước `--dialog-s: 30rem` hiện có, chờ thang `--size-*` (kit 2.1.0, ĐỀ XUẤT) được CTO duyệt.

# ES1-T536: một hệ tên --space-050…7xl, --space-7xl 128, bỏ calc(var(--space-1) * N)

Nguồn: drafts/designer/_kit/kit.css :root (thang space, dẫn xuất, media 48/64/80rem); docs/ui-spec/foundation.md §1, §1.2, §2; drafts/designer/ES1-T567/notes.md mục 3 #3, #18; comment CTO 21/11 lượt 2 trong ticket (×13 → --row-height / --round-button-size, không phải --control-height).

## Thay đổi

snippets/css-variables.liquid
- Thêm 14 bậc theo `space_base` × 0.5…32: `--space-050` 2, `-2xs` 4, `-150` 6, `-xs` 8, `-sm` 12, `-md` 16, `-lg` 20, `-xl` 24, `-2xl` 32, `-3xl` 40, `-4xl` 48, `-5xl` 64, `-6xl` 80, `-7xl` 128 (px ở base 4).
- `--space-1…8` thành alias (DEPRECATED theo kit): 1→2xs, 2→xs, 3→sm, 4→md, 5→xl, 6→2xl, 7→4xl (48), 8→7xl (128; trước ×30 = 120).
- Dẫn xuất: `--section-gap` 48 → 128 từ 64rem; `--heading-gap` 24 → 40 từ 80rem; `--grid-gap` 12 / 16 (48rem) / 24 (80rem); `--band-side`, `--band-inset` = max(0, min(64, side − 64)); `--tab-padding-inline` = `--space-xl`. Chỉ khai báo, chưa áp vào component (ES1-T576).
- `--round-button-size: 52px` chuyển từ base.css :root sang đây (kit), xoá dòng `calc(var(--space-1) * 13)` ở base.css.

assets/*.css (base, aux, collection, cart, quiz, shop-the-look, image-with-text, bundle-builder, predictive-search, critical, product, featured-product, multicolumn): thay 263 chỗ `var(--space-1) * N` theo §1.2:
- Khoảng cách (padding, gap, margin, inset, translate, outline-offset): ×0.5/1/1.5/2/3/4/5/6/8/10/12/16/20 → `--space-050/2xs/150/xs/sm/md/lg/xl/2xl/3xl/4xl/5xl/6xl`; số âm → `calc(var(--space-…) * -1)`. Hệ số lẻ quy bậc gần nhất (hoà thì bậc dưới).
- Kích thước: ×11 → `--touch-target` (vùng chạm) hoặc `--control-height-compact` (tab, chip, stepper, ô tìm popover, nút accelerated drawer); ×12 → `--control-height` (nút, ô nhập, close button 48); ×13 → `--row-height` (hàng, control 52 từ 64/80rem — ES1-T576 đổi sang 48) hoặc `--round-button-size` (mũi tên slideshow, nút play video, đĩa icon shop the look); tab / chip từ 80rem ×10 → `--tab-height-desktop`; ×5 không phải svg (cờ, spinner, checkbox, chấm hotspot) → `--icon-size-md`; line-height 20 cạnh chữ 14 → `--line-height-sm`.
- Kích thước không có token (thumb, panel, textarea, cột lưới, font số FAQ): rem đúng giá trị cũ (72 → 4.5rem, 88 → 5.5rem, 96 → 6rem, 112 → 7rem, 120 → 7.5rem, 144 → 9rem, 320 → 20rem, 528 → 33rem, 600 → 37.5rem, 736 → 46rem, 28 → 1.75rem, 56 → 3.5rem, 60 → 3.75rem…).

## AC

AC1 `grep -n "var(--space-1) \* " assets/*.css` còn 37 dòng, đều thuộc 3 nhóm giữ:
- Khối pixel 80rem (ES1-T576): base.css:6806 (`.level-card__link --level-card-pad`).
- min-block-size link mega header (ES1-T544): base.css:1619 (`.site-header__mega-view-all`), 1664 (`.site-header__mega-tile`).
- Rộng/cao svg, .icon (ES1-T549): base.css:183, 184 (.close-button svg), 514, 515 (.toast__icon svg), 949, 950 (.product-card__rating-star svg), 1926, 1927 (.site-footer__submit .slideshow-icon), 2093 (.site-footer__chevron), 2163, 2164 (.icon-social), 2283, 2284 (.icon-trust), 2819 (.button--link .slideshow-icon), 4548, 4549 (svg cart), 6619, 6620 (.video-card__play .slideshow-icon), 6734 (.status-icon); aux.css:1221 (.article-main__back .slideshow-icon), 1372, 1373 (.contact-form__submit .slideshow-icon); bundle-builder.css:361 (.slideshow-icon), 425, 426 (.status-icon); collection.css:110, 111 (.status-icon), 1039, 1040 (.search-results__entry-media > svg); shop-the-look.css:387 (.slideshow-icon); quiz.css:424, 425 (.quiz__card-button svg), 476, 477 (.quiz__notice-icon svg).

AC2 css-variables có đủ 14 tên `--space-050…7xl`; `--space-7` = var(--space-4xl) = 48; `--space-8` = var(--space-7xl) = 128.

AC3 `.featured-collection` padding-block = `--space-7` (48) dưới 64rem, `--space-8` (128) từ 64rem → 1280: 128; 360, 768: 48. Computed: chờ CI.

AC4 Bảng trước / sau (space_base 4). Chỗ không ghi dưới đây giữ nguyên giá trị.

| Chỗ | Trước | Sau | Lý do |
| --- | --- | --- | --- |
| Mọi khối dùng `--space-8` từ 64rem (featured collection, hàng ngang, faq, shop by level, contact, blog, bundle, multicolumn, cart, rich text…) | 120 | 128 | §1.2 --space-7xl (CTO 21/11 lượt 2) |
| `.featured-collection__tab`, `.blog-articles__topic`, `.search-type-nav__link` (≥ 48rem) padding-inline | 28 | 24 | `--tab-padding-inline` |
| Footer: `.site-footer__submit` gap; `.site-footer__list` gap (48rem); `.site-footer__logo` margin-block | 10 / 10 / −10 | 8 / 8 / −8 | ×2.5 → `--space-xs` |
| `.localization__option` padding-block; `.slideshow__buttons .button` gap (80rem) | 10 | 8 | như trên |
| `.site-footer__newsletter-media::before/::after` inset-block | 11 | 12 | `--space-sm` |
| `.site-footer__follow-group` margin-block-start | 34 | 32 | `--space-2xl` |
| `.site-footer__copyright`, `__commerce-group` margin-block-end | 30 | 32 | `--space-2xl` |
| `.site-footer__column-heading` margin-block-end; `.quiz__notes` margin-block-start (80rem) | 28 | 24 | `--space-xl` |
| `--site-footer-inset` trần (panel footer 1920: 1800 → 1792) | 60 | 64 | `--space-5xl` (= `--band-inset` kit) |
| Hero: `.slideshow__content` padding đáy; trần mũi tên prev/next; trần `--hero-round` (bo 1920 lệch +0.13px); trần margin nút (vw thắng tới 1920) | 60 | 64 | `--space-5xl` |
| `.quiz` padding trần 80rem (vw thắng tới 1920) | 60 | 64 | `--space-5xl` |
| `--inbox-clearance` (toast khi có Shopify Inbox) | 72 | 80 | `--space-6xl` |
| `.image-with-text--split` accent inset trần (vw 4.06 thắng tới ~1970) | 78 | 80 | `--space-6xl` |
| `.image-with-text--banner` nút margin-block-start | 36 | 32 | `--space-2xl` |
| `.article-card__tag` padding-block (< 80rem; cao 28 không đổi), `.blog-articles__featured-tag` padding-block | 3 | 2 | `--space-050` |
| `.shop-the-look-row__title` padding / margin âm | 9 / −9 | 12 / −12 | vùng chạm 44 → 50 (AC-H35 cần ≥ 44, bậc 8 rơi xuống 42); chiều cao hàng không đổi |

Không đổi giá trị: control 52 từ 64/80rem (ô tìm, nút search, Checkout, ô footer, form contact, collection control) giữ 52 qua `--row-height`; ES1-T576 đổi sang `--control-height` 48.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 8 warning có sẵn ở blocks/quiz-step.liquid, templates/index.liquid, templates/index.figma.liquid (không thuộc diff).
- Không file JS trong diff; không thêm override `.theme-check.yml`.
- Byte thô giảm: base.css 200 555 → 199 415, critical.css 9 931 → 9 928 (≤ 10 240), aux 38 157 → 37 935, collection 31 181 → 31 051, cart 6 285 → 6 152. Gzip base.css ≤ 49 152, file template ≤ 16 384: chờ CI (sandbox chặn gzip/node).
- Theme check literal (TE-1 TC-02): rem kích thước không thuộc màu / font / radius.
- Computed AC3, ảnh 4 khổ trang chủ / product / collection / cart, Lighthouse: chờ CI.
- Spec bị ảnh hưởng: 12 spec có TOKENS stub cũ → ES1-T613 (QA).

Diff lớn (14 file, ~300 dòng): nếu Orchestrator tách 2 PR thì nhóm 1 = css-variables + base.css + critical.css, nhóm 2 = file template (aux, collection, cart, product, quiz, shop-the-look, image-with-text, bundle-builder, featured-product, predictive-search, multicolumn). Nhóm 2 phụ thuộc nhóm 1 (tên token).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
