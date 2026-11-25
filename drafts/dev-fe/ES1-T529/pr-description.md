KHÔNG CHẮC: tests/e2e/ES1-T385.spec.ts B-08 assert breadcrumb "không cắt" ở 360, trái V20; đã tạo ES1-T612 cho QA sửa spec. B-08 có thể đỏ tới khi ES1-T612 xong.

# ES1-T529 FE: 3 settings lệch kit, thân chữ 500 / ô nhập 400, breadcrumb 1 dòng, accent-on-sand

Nguồn: drafts/designer/_kit/kit.css (:root, body, .breadcrumb, .field__input), decisions.md V01, V05, V17, V18, V20.

## Thay đổi
config/settings_schema.json
- `type_primary_font` inter_n4 → inter_n5 (V05)
- `background_alt_color` #F4F4F4 → #F4F4F5 (V18)
- `badge_new_color` #467A48 → #4B824D (V01)

snippets/css-variables.liquid
- Nạp thêm `font_face` body 400 (`font_modify: 'weight', '400'`) cho giá trị ô nhập.
- Bản 400 và 500 chỉ in khi khác weight đang chọn ở picker: mặc định inter_n5 → không lặp @font-face 500. Merchant đổi về n4 thì vẫn có đủ 400 + 500.
- `--color-accent-on-sand`: `color-mix(accent 90%, var(--color-foreground))` thay `#000` (V17, #B73C0F, 4.62:1 trên sand).

assets/critical.css
- `body` font-weight `var(--font-body-weight)` (500, token ES1-T540) thay `--font-primary--weight`.
- `input, textarea, select, .field__input { font-weight: 400 }` literal (V05, iOS).

assets/base.css
- Bỏ `font: inherit` lặp ở `.localization__search-input`, `.cart-line__quantity`, `.cart-page__note-input`, `.cart-drawer__note-input` (đã có ở rule type trong critical.css; giữ lại thì đè 400 thành 500). `.collection-toolbar__select` giữ 500 riêng như cũ, không đụng.
- `.breadcrumb*` theo kit V20: `.breadcrumb`/`__list` min 0, max 100%, `nowrap`; li `flex: none`, li cuối `flex: 0 1 auto`; `__current` block + ellipsis, từ 64rem max 48ch; dưới 48rem link giữa cắt 10ch (mobile-first: mặc định cắt, `min-width: 48rem` gỡ); link cao `--touch-target`; line-height `--line-height-sm` thay `calc(space-1 * 5)`; ol không `overflow: hidden` (focus không bị cắt).

Không file JS trong diff. Không đổi markup snippets/breadcrumb.liquid (aria-current, testid giữ).

## Ảnh hưởng
- Mọi chữ thân chuyển 400 → 500 (chủ đích V05). Ô nhập, select, textarea 400.
- Nền alt, badge "New" đổi 1 bậc màu theo sổ.
- Store dev có settings_data đã lưu giá trị cũ thì vẫn giữ giá trị cũ tới khi đổi trong editor (default chỉ áp theme mới cài).
- `.quiz-page__breadcrumb` (collection.css) là breadcrumb riêng của trang quiz, chưa theo V20 — ngoài phạm vi file ticket.
- docs/tokens.json còn ghi "chờ FE" ở 3 dòng (badge_new, background_alt, inter_n5) — tài liệu Designer, không sửa ở PR này.

## Tự kiểm tra
- theme check: 0 lỗi, 8 warning có sẵn (quiz-step, index, index.figma), không thuộc file sửa.
- AC1 grep settings_schema: #4B824D / #F4F4F5 / inter_n5 = 3; #467A48 / #F4F4F4 / inter_n4 = 0.
- critical.css 9 931 → 10 045 B (≤ 10 240). base.css raw 200 555 → 201 439 B; gzip chưa đo được (sandbox chặn pipe), trước 37 029, dự kiến < 38 000 ≤ 49 152 — chờ CI.
- AC2 computed (body 500, .form-field__input, .site-footer__input 400), AC3 Network Inter 400 + 500 woff2, AC4 breadcrumb 80 ký tự 360 / 1280, AC5 ảnh 4 khổ product/article: chờ CI.
- Lighthouse desktop / mobile (thêm 1 file woff2 400 trên trang có ô nhập), Playwright: chờ CI.
- Spec E2E: ES1-T612 (QA) sửa ES1-T385 B-08 + viết tests/e2e/ES1-T529.spec.ts.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
