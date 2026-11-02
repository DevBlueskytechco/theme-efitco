KHÔNG CHẮC: (1) giọng chữ CTA và tỷ lệ ảnh chính thức không có trong SRS/Figma inventory/tokens.json → DESIGN.md dùng mặc định suy từ copy và kích thước Figma, hỏi PO + Designer ở ES1-T39; (2) AC3 chạy trên yum-dev — agent bị cấm (.claude/rules/no-production.md), nên AC3 là task người (DevOps upload zip, QA/CTO chạy Sidekick), không nằm trong point FE/BE; (3) "outline Shopify cho base theme Canvas" không có bản gốc trong repo → dùng đúng 7 mục liệt kê ở TE-14 AC1.

# ES1-T33 — Chia TE-14 Sẵn sàng cho Sidekick, Canvas và agent thành task FE/BE

Nguồn: docs/srs.md#TE-14 (AC1–AC4), AGENTS.md hiện tại (7532 byte, Skeleton + theme map dự án), CONVENTION.md (logical properties, storefront actions), docs/tokens.json, docs/token-compliance.md, docs/figma-inventory.md, docs/checklist-canvas.md, ADR 0001–0004, assets/base.css + assets/critical.css (đo ngày 2026-11-02 trên feature/ai-ES1-T33 = 3ca8291).
Phạm vi: chỉ TE-14. AC Editions ở TE-3/4/5/9/10 nằm trong story của chúng.
Ước lượng chốt TE-14: 6 point dev (FE 6, BE 0) + 1 task QA người không tính point dev. SRS sơ bộ 5 point; chênh 1 do AC4 mở rộng sang trục block (margin-top/top/bottom) theo CONVENTION.md "logical properties (inline/block, start/end)" và spec RTL E2E. Báo PO, không đổi phạm vi.

## Hiện trạng đo được
- AGENTS.md: 7532 byte, cấu trúc Skeleton (Non-negotiables, Page structure, block tag, partial tag, Blocks, Theme map). "Current blocks" ghi 5 block, theme map ghi 6 — thực tế 9 block (thiếu rich-text, slideshow, slideshow-slide), 7 snippet (thiếu header-icon, icon-social, icon-trust, slideshow-icon). Chưa có mục styling/tokens, JavaScript, translations, decision guide; chưa có lý do cho từng quy tắc.
- DESIGN.md: chưa có.
- CSS vật lý trong assets/*.css: 12 dòng — base.css 22, 33, 53, 164, 214, 219, 256 (margin-top), 332 (bottom), 333 (left), 425 (right), 426 (left); critical.css 403 (top). Lệnh ticket (chỉ left/right) ra 3 dòng.
- Icon cần đảo RTL: snippets/slideshow-icon.liquid `previous`, `next`, `arrow` (nút slideshow + mũi tên CTA slide). Chevron disclosure header (critical.css 274, xoay dọc) không đảo. `layout/theme.liquid` chưa có `dir`; `:dir(rtl)` hiện chưa có rule nào.

## Quyết định kỹ thuật

D1 Phạm vi AGENTS.md: dành cho mọi agent sửa theme, gồm Sidekick trên store merchant. Chứa quy tắc kiến trúc + quy tắc dự án đã chốt (ADR 0001–0003, logical properties, storefront actions). KHÔNG chứa quy trình team (FE/BE, nhánh, ticket, store, hook) — giữ ở CLAUDE.md, .claude/rules, CONVENTION.md. Lý do: Sidekick không có ngữ cảnh team; quy tắc team trong AGENTS.md làm Sidekick từ chối sửa JS hoặc đòi ticket. Tiếng Anh như Skeleton. Thứ tự nguồn sự thật trong CLAUDE.md không đổi (AGENTS.md vẫn số 1) → CTO duyệt cuối PR.

D2 Outline AGENTS.md: đúng 7 H2 theo AC1 — Non-negotiables, Composition model, Block and snippet contracts, Styling and tokens, JavaScript, Translations, Decision guide; Theme map nằm trong Composition model hoặc cuối file. Mỗi quy tắc 1 dòng + 1 câu Why. Mọi câu quy tắc Skeleton hiện có phải còn (chuyển mục được, không xoá); phần partial tag giữ đủ (agentic_editor_enabled, refresh/fetch/apply, AbortSignal, aria-busy, live region, routes). PR kèm bảng đối chiếu câu cũ → mục mới. Mục JavaScript cần 1 approve dev-be (nội dung ADR 0002 + storefront actions), task vẫn thuộc FE theo SRS "Phía: FE (docs + Liquid)".

D3 Danh sách block/snippet tự kiểm: mọi basename trong blocks/ và snippets/ phải xuất hiện trong AGENTS.md (lệnh vòng for trong DoD). Story sau thêm block/snippet phải thêm dòng vào AGENTS.md trong cùng PR — Tech Lead chặn ở review nếu thiếu (rubric mục 1).

D4 DESIGN.md: gốc theme, tiếng Anh. Nguồn duy nhất tokens.json + token-compliance.md + figma-inventory.md + ADR 0001/0003. Bảng token → setting id → biến CSS (khớp settings_schema/css-variables đã merge ở TE-1). Mục Contrast ghi quyết định CTO: accent #C8400E (Figma #D94610 4.34:1 không đạt), muted_light #6B6B6B, muted_on_dark #999999 chỉ nền tối. Nhịp trang: page_width 1416, page_margin, --space-*. Ảnh: tỷ lệ theo kích thước Figma, hero eager + fetchpriority high, còn lại lazy qua snippets/image.liquid. CTA: mặc định suy từ copy Figma (Title Case, 2–4 từ, động từ đầu) — chờ ES1-T39. Không token ngoài tokens.json.

D5 Logical properties (AC4): đổi cả 12 dòng (trục inline lẫn block) — CONVENTION.md yêu cầu inline/block, chi phí thêm ~9 dòng, tránh lần sửa thứ hai. Mapping: margin-top → margin-block-start; top/bottom → inset-block-start/end; left/right → inset-inline-start/end. Không còn thuộc tính vật lý → không cần ngoại lệ `:dir(rtl)` trong grep (chặt hơn lệnh gốc ticket). Shorthand 4 giá trị bất đối xứng (padding/margin a b c d với b khác d) kiểm tay trong review — hiện 0 trường hợp (base.css 581 là 3 giá trị, đối xứng).

D6 RTL icon: 1 rule `:dir(rtl)` trong base.css cho `.slideshow-icon--previous/--next/--arrow` → `scale: -1 1`. Không thêm `dir` vào layout/theme.liquid: chưa có locale RTL, AC4 chỉ yêu cầu "để bật sau". Kiểm bằng Playwright đặt `document.documentElement.dir = 'rtl'` qua page.evaluate.

D7 AC3: task QA người (ES1-T40), chạy sau khi ES1-T37 + ES1-T38 merge develop và DevOps người upload zip lên yum-dev. 10 yêu cầu = danh sách tuần 11 trong docs/checklist-canvas.md; thêm 1 câu kiểm Sidekick đã đọc 2 file. Sau mỗi yêu cầu: theme check 0, không sections/, không templates/*.json, không presets.

## Bảng task

| Mã | Ticket | Phía | Pt | Tên | Giải pháp | DoD | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TE-14-FE1 | ES1-T37 | FE | 3 | DESIGN.md mới + assets/base.css + assets/critical.css: 17 màu, 2 font, type scale 9, space 8, radius 4, nhịp trang, ảnh, CTA, contrast; 12 dòng CSS vật lý → logical; 3 icon đảo :dir(rtl) | D4, D5, D6. Không đụng assets/*.js, không thêm dir vào layout | `wc -c DESIGN.md` tối đa 51200; `grep -nE '(margin\|padding\|border\|scroll-margin\|scroll-padding)-(left\|right\|top\|bottom)\b\|\b(left\|right\|top\|bottom):\|(text-align\|float\|clear):[[:space:]]*(left\|right)' assets/*.css` 0 dòng; `grep -c 'dir(rtl)' assets/base.css` từ 1; hex trong DESIGN.md đều có trong tokens.json; `shopify theme check` 0; `npx playwright test tests/e2e/ES1-T37.spec.ts` pass (rtl: icon scale -1, panel localization bám inline-end ở 1280; ltr không đổi); `npx playwright test tests/e2e/ES1-T16.spec.ts tests/e2e/ES1-T30.spec.ts` pass; `npx lhci autorun` 96/90/98; ảnh 360/768/1280 ltr không đổi | — |
| TE-14-FE2 | ES1-T38 | FE | 3 | AGENTS.md viết lại: 7 mục outline Canvas, 9 block + 7 snippet, mỗi quy tắc 1 lý do, decision guide trỏ file mẫu | D1, D2, D3. Không sửa CLAUDE.md, .claude/rules; approve dev-be cho mục JavaScript; CTO duyệt cuối | `wc -c AGENTS.md DESIGN.md` mỗi file tối đa 51200; `grep '^## ' AGENTS.md` đủ 7 mục; `for f in blocks/*.liquid snippets/*.liquid; do n=$(basename $f .liquid); grep -q "$n" AGENTS.md \|\| echo MISSING $n; done` 0 dòng; grep từ khoá Skeleton (sections/, presets, stylesheet, javascript, routes., \| t, agentic_editor_enabled, shopify_attributes, theme-check:recommended) mỗi từ từ 1 dòng; `grep -n DESIGN.md AGENTS.md` từ 1 dòng; `shopify theme check` 0; bảng đối chiếu câu cũ → mục mới trong PR | FE1 (link DESIGN.md) |
| TE-14-QA1 | ES1-T40 | QA người | — | docs/checklist-canvas.md C3 + C4: 10 yêu cầu Sidekick trên yum-dev, câu kiểm đã đọc 2 file, theme check sau mỗi yêu cầu | D7. Agent QA chỉ soạn bảng ghi kết quả trong drafts/qa/ES1-T40/ và chấm từ bằng chứng người nộp | Bảng 10 dòng (thời gian, kết quả, số lỗi theme check, cấu trúc giữ, ảnh docs/evidence/); Sidekick nêu đúng 7 mục + accent #C8400E; 10/10 theme check 0; `test ! -d sections`; `ls templates/*.json` không có file; `grep -l presets blocks/*.liquid` 0; lỗi → bug P2 (C5); cột tuần 11 checklist điền | FE1, FE2 |

Ghi chú: `\|` trong bảng là `|` (escape markdown); lệnh nguyên văn xem body ticket con. lhci 96/90/98 = desktop từ 96, mobile từ 90 (lighthouserc.mobile.json), accessibility từ 98.

Ticket con: FE1 = ES1-T37 · FE2 = ES1-T38 · QA1 = ES1-T40. Câu hỏi PO + Designer: ES1-T39 (giọng chữ CTA, tỷ lệ ảnh).
Ánh xạ AC: AC1 FE2 · AC2 FE1 · AC3 QA1 · AC4 FE1. Thứ tự: FE1 → FE2 → (merge develop, DevOps người upload zip yum-dev) → QA1.
Gộp AC2 + AC4 vào 1 task: tách riêng thì AC4 chỉ ~1 pt, dưới ngưỡng 3 pt của ticket; cả hai thuộc mảng styling/tokens, DESIGN.md mô tả đúng quy tắc RTL mà task áp vào CSS.

## Nợ kỹ thuật ghi nhận (không thuộc TE-14)
- N1 assets/slideshow.js: cuộn bằng scrollLeft/hướng phím mặc định LTR; khi bật RTL cần xử lý scrollLeft âm và đảo phím trái/phải. Việc BE, mở ticket khi có story bật locale RTL.
- N2 Không có guard CI cho logical properties: grep D5 nên thành bước CI (.github/workflows/ci.yml — DevOps). Đề xuất sau khi ES1-T37 merge.
- N3 AGENTS.md lệch theo thời gian: D3 dựa vào review; guard CI cùng N2.
