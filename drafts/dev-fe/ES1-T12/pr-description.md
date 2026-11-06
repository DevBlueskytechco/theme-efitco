KHÔNG CHẮC: (1) không đọc được ticket 2727475000000128007 — mcp__ticket__get/create/set_label không có trong phiên này; phạm vi lấy theo tiêu đề ticket + docs/srs.md TE-1 AC1/AC4/AC8 + docs/tokens.json + ADR 0001. (2) handle font_picker `sofia_sans_condensed_n7` chưa xác minh (mạng tới shopify.dev bị chặn, theme check không kiểm handle) — sai handle thì upload theme lỗi; cần push preview để chắc. (3) `--color-accent` #D94610 với chữ trắng = 4.35:1, dưới AA 4.5:1 cho chữ thường (đạt 3:1 cho chữ ≥ 18.66px bold) — CTA 16px theo Figma sẽ không đạt AA; cần Designer/Tech Lead quyết. (4) type scale để cố định trong css-variables (không setting) vì SRS/ADR không nêu setting cho cỡ chữ; cỡ mobile (clamp min) do Dev FE suy theo quyết định CTO 27/10. (5) diff 549 dòng > 400 (chủ yếu JSON schema/locale) — đề xuất tách 2 PR: token / announcement-bar.

# feat(theme): design token từ tokens.json + block announcement-bar [ES1-T12]

## Làm gì
- `config/settings_schema.json`: 17 màu (docs/tokens.json, nhóm Base / Alternate backgrounds / Accent and status), 2 font_picker (`type_heading_font` mặc định Sofia Sans Condensed 700, `type_primary_font` mặc định `inter_n4`), `space_base` (range 2–8px, mặc định 4), 4 radius (`input_corner_radius` 4, `button_corner_radius` 4, `card_corner_radius` 8, `hero_corner_radius` 12).
- `snippets/css-variables.liquid`: sinh `--color-*` (17), `--font-primary--*`, `--font-heading--*`, `--font-size-xs|sm|base|lg|h3|h2|h1|display|wordmark` (13/14/16/18/28/36/48/100/200 ở ≥1280, clamp xuống mobile), `--line-height-body|heading`, `--space-1..8` (4/8/12/16/24/32/48/120 = base × 1/2/3/4/6/8/12/30), `--radius-input|button|card|hero`. @font-face body 400/500/600/700/italic/bold italic (biến thể thiếu thì bỏ qua), heading 1 biến thể; tất cả `font-display: swap`.
- `assets/critical.css`: body/heading dùng token font + type scale, `:focus-visible` outline 2px, style announcement bar; `--style-border-radius-inputs` → `--radius-input`.
- `assets/base.css`: bỏ toàn bộ màu/bo góc/khoảng cách hardcode của Skeleton (hello-world, liquid-tips, text, header, footer) → token; media query hello-world chuyển mobile-first `min-width: 80rem`; thêm `prefers-reduced-motion` cho flash; nút ≥ 44px.
- `blocks/announcement-bar.liquid` (mới): 2 setting `text` (text, không default) + `link` (url). Text rỗng/chỉ khoảng trắng → ngoài editor không render gì; trong editor (`request.design_mode`) placeholder hướng dẫn. Có link → cả text là `<a>`. Root `<aside aria-label>`, nền `--color-background-dark` / chữ `--color-background-dark-foreground` (16.7:1).
- `layout/theme.liquid`: announcement-bar trong container riêng (tag div) trước container header; preconnect font CDN khi 1 trong 2 font không phải system; vẫn preload 1 font (body) theo ADR 0003.
- Locale: `blocks.announcement_bar.label|placeholder` (storefront); label/info/group mới trong `en.default.schema.json`.

## Vì sao
ES1-T12 (TE-1-FE1). SRS TE-1 AC1 (token từ settings, không hardcode), AC4 (announcement bar mặc định ẩn, có link tuỳ chọn), AC8 (Sofia Sans Condensed qua font_picker, body Inter, `--color-muted-light` #6B6B6B trên nền sáng, #999999 chỉ nền tối). ADR 0001 phương án B. figma-inventory quyết định CTO #5 (Figma không có announcement bar → mặc định rỗng).

## Hợp đồng cho QA/BE
- data-testid: `announcement-bar` (root khi có text), `announcement-bar-link` (khi có link), `announcement-bar-placeholder` (chỉ trong editor, không trùng `announcement-bar` → TC-21 vẫn pass khi chạy trong editor).
- Không JS, không partial (block tĩnh).
- Tên biến CSS theo trên; QA TC-01/TC-02/TC-05 (drafts/qa/ES1-T4) khớp.

## Cách test
- `shopify theme check` → 31 file, 0 offense.
- Preview: chưa có (`PREVIEW_URL` chưa set; Dev FE không push). Sau khi Orchestrator push `feature/ai-ES1-T12` lên hoa-qua-nhap-khau:
  - Theme settings → Colors / Typography / Layout: đổi màu nền, accent, font, spacing unit, radius → `:root` đổi theo.
  - Announcement bar: để trống → DOM không có `[data-testid=announcement-bar]`; nhập "Free shipping over $50" → bar hiện trên header; thêm link `/collections/all` → bấm điều hướng đúng.
  - `PREVIEW_URL=... EXPECT_ANNOUNCEMENT=off npx playwright test tests/e2e/ES1-T4.spec.ts -g "TC-0[125]|TC-21"` (spec QA nhánh feature/ai-ES1-T4).
  - `npx lhci autorun` desktop + mobile.

## Ảnh (360 / 768 / 1280)
Chưa có — cần preview. Mặc định không thay đổi UI ngoài màu/font của trang hello-world Skeleton.

## Checklist
- [x] theme check 0 lỗi, `.theme-check.yml` không đổi
- [ ] Lighthouse: perf ≥ 96 desktop / ≥ 90 mobile, a11y ≥ 98 — chưa chạy (chưa có preview)
- [x] Không file ngoài phía FE (0 file .js trong diff)
- [x] Chuỗi qua `| t`; label `t:`; không URL storefront hardcode
- [x] 0 màu hex/rgb, 0 font-family literal, 0 border-radius literal trong assets/*.css (grep)
- [x] KHÔNG CHẮC: xem dòng đầu

## Tự kiểm tra
- theme check: 0 offense (31 file).
- JSON settings_schema + 2 locale parse OK; mọi `t:` trong schema có key.
- grep `#hex|rgb(|hsl(|white|black|font-family literal|border-radius số` trong assets/*.css: 0.
- critical.css 4.0 KB, base.css 4.1 KB (ngân sách critical ≤ 10 KB).
- Contrast: muted-light/nền sáng ≥ 4.85, muted-on-dark/#1E1E1E 5.85, sale/trắng 6.36, bar trắng/#1E1E1E 16.7, accent/trắng 4.35 (xem KHÔNG CHẮC 3).

## Việc chưa làm / cần người khác
- Tạo ticket question (không có mcp__ticket__create): Designer/Tech Lead — accent #D94610 chữ trắng 4.35:1; Tech Lead — xác nhận handle `sofia_sans_condensed_n7`, type scale có cần setting không, tách PR.
- AGENTS.md "Current blocks"/sơ đồ layout chưa liệt kê `announcement-bar` và container thứ 3 trong theme.liquid — file của Tech Lead, không sửa.
- `container` token (max 1416, margin 252) chưa map vào `max_page_width` — ngoài phạm vi ticket.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
