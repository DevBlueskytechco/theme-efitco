KHÔNG CHẮC: (1) DESIGN.md ở gốc theme bị scope-guard chặn với dev-fe → bản nháp nằm ở drafts/dev-fe/ES1-T37/DESIGN.md, Orchestrator chép ra gốc; (2) ticket ghi 17 màu, docs/tokens.json hiện 19 (ADR 0005 thêm sand 2 màu, comment CTO đã xác nhận) → DESIGN.md ghi 19; (3) tỷ lệ ảnh block chưa làm và giọng chữ CTA là tạm theo copy/kích thước Figma, chờ ES1-T39; (4) mcp__ticket__get trả HTTP 400 → spec lấy từ docs/srs.md TE-14 + drafts/techlead/ES1-T33/task-split.md (commit 1153aee), đối chiếu lại body ticket sau khi set_label.

# ES1-T37 — TE-14-FE1: DESIGN.md + CSS logical properties + icon RTL

SRS TE-14 AC2, AC4 · task split ES1-T33 D4, D5, D6.

## Thay đổi
- `assets/base.css`: 12 dòng vật lý → logical. `margin-top` × 7 → `margin-block-start`; `.site-footer__panel` `bottom`/`left` → `inset-block-end`/`inset-inline-start`, ở 48rem `right`/`left` → `inset-inline-end`/`inset-inline-start`; `.rich-text` `justify-self: var(--text-align, left)` → `start`.
- `assets/critical.css`: 2 dòng. Sticky header `top: 0` → `inset-block-start: 0`; `.block-container` `text-align: var(--text-align, left)` → `start`. Thêm override `:dir(rtl)` cho `object-position` của logo (thuộc tính này không có từ khoá logical). critical.css 9 921 byte, dưới mức 10 KB của ADR 0003.
- Tổng 14 dòng vật lý → logical. Grep DoD bắt được 12 dòng (đúng như comment của Tech Lead); 2 dòng còn lại là fallback `left` trong `var()`, grep không bắt nhưng vẫn là giá trị vật lý.
- Icon RTL: 1 rule `.slideshow-icon--previous|--next|--arrow:dir(rtl) { scale: -1 1 }`. Rule cũ `.button--link:dir(rtl) .slideshow-icon` bị bỏ vì rule mới đã bao. Mũi tên CTA trong slide hero (`.button` thường) giờ cũng lật. Pause/play và chevron dọc của header giữ nguyên. Rule translate khi hover ở RTL giữ như cũ.
- `blocks/container.liquid`: setting `alignment` vẫn lưu `left/center/right` (không làm hỏng dữ liệu đã lưu), CSS nhận `--text-align: start|center|end`. Không có thay đổi này thì 2 fallback ở trên vẫn nhận `left`/`right` từ setting và RTL không đổi chiều.
- `DESIGN.md` (nháp: drafts/dev-fe/ES1-T37/DESIGN.md, 13 044 byte): intent, cách đổi thiết kế, 19 màu (token → setting id → biến CSS → nơi dùng), quyết định contrast của CTO (#C8400E, #6B6B6B, #999999 chỉ trên nền tối, quy tắc nền sand), 2 font, type scale 9 bậc, space 8 bậc, radius 4, nhịp trang (91rem, margin 20, 48/120, breakpoint 48/64/80rem, header 80), ảnh (snippet image, hero eager/fetchpriority, ≤ 200 KB, alt, tỷ lệ theo Figma), CTA (giọng chữ, 3 kiểu nút, không tạo cảm giác gấp giả theo R8), mục Direction (RTL).
- E2E: theo comment CTO, spec RTL chuyển sang ES1-T45 (QA). Bản tham khảo cho QA ở drafts/dev-fe/ES1-T37/ES1-T37.spec.ts: LTR không lật; RTL lật 3 icon, pause/play không đổi; container chỉ xuất start/center/end; panel localization ở 1280 bám inline-end và đổi phía khi RTL (skip nếu store chỉ có 1 nước/ngôn ngữ); logo object-position; sticky top 0.

Không đụng assets/*.js, không thêm `dir` vào layout (D6). Không thêm token/setting.

## Việc cho Orchestrator
- `cp drafts/dev-fe/ES1-T37/DESIGN.md DESIGN.md`
- Spec nháp: chuyển cho ES1-T45 (QA), không chép vào tests/ trong PR này.

## Tự kiểm tra
- `shopify theme check --path .`: 40 file, 0 offense.
- Grep DoD `(margin|padding|border|scroll-margin|scroll-padding)-(left|right|top|bottom)\b|\b(left|right|top|bottom):|(text-align|float|clear):\s*(left|right)` trên assets/*.css: 0 dòng. `var(--text-align, left|right)`: 0 dòng.
- `grep -c 'dir(rtl)' assets/base.css`: 5 (≥ 1).
- 15 mã hex trong DESIGN.md đều có trong docs/tokens.json; `wc -c` 13 044 ≤ 51 200.
- 0 mã hex mới trong assets/*.css; 0 file JS trong diff.
- Hồi quy Playwright ES1-T16/ES1-T30, Lighthouse 96/90/98, ảnh 360/768/1280 LTR: chờ CI. Spec RTL: ES1-T45.

## Nợ ghi nhận
- N1 (task split): assets/slideshow.js cuộn theo LTR, việc của BE khi bật locale RTL.
- `overflow-x/y`, `scroll-snap-type: x` giữ trục vật lý: `overflow-inline/block` chưa được hỗ trợ rộng, và trục ngang/dọc không đổi khi chuyển RTL.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
