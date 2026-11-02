KHÔNG CHẮC: (1) 2 setting mới của rich-text (ảnh inline + phần heading sau ảnh) có trong Figma 1:455 nhưng chưa có trong TE-2 AC5 → PO xác nhận ở ES1-T42; (2) ảnh inline ở ≤ 768 và eyebrow accent trên nền sand (1:464, TE-3) chờ Designer người ở ES1-T43. Phần token, icon, CTA không phụ thuộc 2 câu này.

# 0005. Nền sand #EBE6E0, ảnh inline trong heading, CTA dạng link + icon cho rich-text
Ngày: 2026-11-02 | Trạng thái: Đề xuất (trả lời ES1-T41, nguồn drafts/designer/ES1-T34/ui-spec-rich-text.md nhánh feature/ai-ES1-T34)

## Bối cảnh
- Frame 1:453 (rich-text 1:454 + collection list 1:464) nền #EBE6E0. Snapshot docs/figma/snapshot-1-359.json có 12 node fill #EBE6E0 (1:453, 1:625 Inspiration 1920 × 960, 1:534, 1:536, 1:575, 1:799, 6 card Product 1:845–1:880) → màu lặp, không phải lẻ. docs/tokens.json và settings chưa có (17 màu, ADR 0001).
- Contrast trên #EBE6E0 (tính 02/11): #1A1A1A 14.03, #4D4D4D muted 6.81, #6B6B6B muted_light 4.30 (KHÔNG đạt AA), #C8400E accent 4.03 (KHÔNG đạt AA chữ thường).
- Heading 1:457 có ảnh 1:455 (165 × 94, radius 8) giữa "Need" và "to Train." ở dòng 2 (docs/figma/img/1-453.lowres.png). Figma chừa chỗ bằng 17 dấu cách. TE-2 AC5 chỉ nêu heading, body, nút, max width; story TE-2 ghi "theo Figma".
- Icon 1:463 là instance của component 1:126 `remote: true` (thư viện ngoài file) → làm mới snapshot cũng không có main component. Instance chứa 1 VECTOR 20 × 16 fill SOLID; ảnh 1-453.lowres.png cho thấy mũi tên phải. Đã có `slideshow-icon` name `arrow` (path M2 10h16M12 4l6 6-6 6, currentColor).
- CTA 1:462 là link chữ Sofia Sans Condensed 700 28/34, -0.02em, không nền/padding/radius + icon, gap 12. Hero CTA là component khác ("CTA Button" 1:90). `.button` hiện chỉ có biến thể `--secondary`.
- Ràng buộc: AGENTS.md (không `{% stylesheet %}`, chuỗi qua `t`, block-first), ADR 0001 (mọi màu qua setting + biến CSS, 0 hex trong assets/*.css), ADR 0004 (settings phẳng, Sidekick đọc được), SRS TE-14 AC4 (logical properties, mũi tên đảo `:dir(rtl)`), Lighthouse a11y ≥ 98.

## Lựa chọn đã cân nhắc
1. Nền #EBE6E0
- A. Thêm token `background_sand` + `background_sand_foreground` (setting màu + biến CSS như 17 màu hiện có) — đúng ADR 0001, merchant/Sidekick đổi 1 chỗ cho 12 nơi dùng; thêm 2 setting toàn cục.
- B. Dùng `background_cream` #F5F5F1 thay — 0 setting mới; lệch Figma rõ (ΔE thấy bằng mắt ở 1:453, 1:625). Loại.
- C. Hex trong base.css — vi phạm ADR 0001 / TE-1 AC1. Loại.
2. Gắn nền vào đâu
- A. Param `background` của container (`{% block 'container', background: 'sand' %}`), cùng kiểu param `tag` sẵn có — template (composition root) quyết định, Sidekick sửa 1 dòng template; 0 setting mới, merchant không đổi từ editor.
- B. Setting select `background` trên container — merchant đổi được; thêm setting chưa có trong SRS, và giá trị setting của static block trong template .liquid chưa có nơi đặt mặc định khác nhau cho 2 container trên index. Loại ở pha này.
- C. Nền trên rich-text — sai: nền bao cả 1:464 (block khác). Loại.
3. Ảnh inline
- A. `image_picker` `inline_image` + text `heading_after_image`; render heading = `heading` + ảnh + `heading_after_image` trong 1 thẻ h1/h2 — vị trí ảnh xác định, screen reader đọc liền câu, settings phẳng; thêm 2 setting.
- B. Ký hiệu chèn trong chuỗi heading (vd `[image]`) — 1 setting; dễ vỡ khi dịch/Sidekick sửa, chuỗi lộ ký hiệu khi không có ảnh. Loại.
- C. Bỏ ảnh — 0 setting; lệch Figma ở phần nhận diện chính của block. Loại.
4. Icon
- A. Dùng `slideshow-icon` name `arrow` — 0 file mới, đã currentColor + aria-hidden; tên snippet gắn với slideshow (nợ).
- B. Làm mới snapshot để lấy 1:126 — tốn 1/20 request Tier 1 tháng mà vẫn không ra main component (remote). Loại.
5. Kiểu CTA
- A. Modifier CSS `.button--link` trong base.css, rich-text luôn dùng — 0 setting, đúng 1 kiểu Figma có.
- B. Setting select kiểu nút (filled/link) — merchant linh hoạt; thêm setting không có trong SRS/Figma. Loại.

## Quyết định
1. Token: A. `docs/tokens.json` thêm `background_sand` #EBE6E0, `background_sand_foreground` #1A1A1A và `_contrast` cho sand. Setting theo tên đang có trong code (`<token>_color`, không phải `color_<token>` như ADR 0001 bổ sung 30/10 ghi): `background_sand_color`, `background_sand_foreground_color` trong nhóm Colors → `--color-background-sand`, `--color-background-sand-foreground` trong css-variables.liquid. Tổng 19 màu. Quy tắc dùng trên nền sand: chữ phụ dùng `--color-muted` (6.81), KHÔNG `--color-muted-light`; chữ accent chỉ cho chữ ≥ 24px hoặc ≥ 18.66px bold (WCAG large text ≥ 3:1), chữ nhỏ hơn chờ ES1-T43.
2. Nền: A. `blocks/container.liquid` thêm `@param {string} [background]` giá trị `alt` / `cream` / `sand` / `dark`, trống = không nền; render class `block-container--<giá trị>` set `background-color: var(--color-background-<giá trị>)` và `color: var(--color-background-<giá trị>-foreground)`. index.liquid: container bọc rich-text = `{% block 'container', id: 'home-intro', background: 'sand' %}` (có `id` để 2 static container cùng loại trên index không dùng chung settings). Collection list 1:464 (TE-3) vào CÙNG container này.
3. Ảnh inline: A, chờ PO ở ES1-T42 xác nhận phạm vi; PO từ chối thì bỏ 2 setting, phần còn lại không đổi. Thiết kế: setting `inline_image` (image_picker, label "Inline image"), `heading_after_image` (text, label "Heading after image", default "to Train."); `heading` default đổi thành "Everything You Need". Ảnh trống → in `heading` + dấu cách + `heading_after_image`. Có ảnh → `<img>` qua `snippets/image.liquid`, `alt=""` (trang trí, nhãn đã đủ trong chữ), `loading="lazy"`, width 330 (2x của 165), `display: inline-block`, `block-size: 0.94em`, `aspect-ratio: 165 / 94`, `object-fit: cover`, `border-radius: var(--radius-card)`, `vertical-align: middle`, `margin-inline: 0.2em`. Thu theo em ở mọi breakpoint (mặc định kỹ thuật; Designer người đổi ở ES1-T43 nếu muốn ẩn ≤ 768).
4. Icon: A. `{% render 'slideshow-icon', name: 'arrow' %}` trong CTA, CSS hộp 20 × 16 (`inline-size: 20px; block-size: 16px`), `:dir(rtl)` lật `scale: -1 1`. Không làm mới snapshot.
5. CTA: A. `.button--link` trong assets/base.css: không nền, không border, không padding, `min-height: 44px`, `gap: var(--space-3)`, font heading 700, `var(--text-h3)` (28), line-height 34/28, letter-spacing -0.02em, `color: currentcolor`, không uppercase; hover gạch chân chữ + icon dịch `var(--space-1)` theo chiều inline, tắt dịch trong `prefers-reduced-motion: reduce`; focus-visible dùng lại rule `.button:focus-visible`. rich-text dùng `class="button button--link"`; hero giữ `.button`.

## Hệ quả
- Tốt: 12 node sand dùng 1 token; nền/CTA/icon không thêm setting block; ảnh inline đọc liền câu cho screen reader, không chuỗi dấu cách.
- Xấu: +2 setting màu toàn cục (19); +2 setting rich-text (nếu PO đồng ý); merchant không đổi nền container từ editor (Sidekick sửa template). Rich-text phụ thuộc snippet tên `slideshow-icon`.
- Nợ kỹ thuật: đổi tên `slideshow-icon` → `icon` (docs/architecture.md đã liệt kê `snippets/icon`) khi TE-3 cần mũi tên card 1:464; cập nhật ADR 0001 dòng "17 màu" và tên setting `<token>_color`.
- Việc: task FE ES1-T44 (blocks/rich-text.liquid, blocks/container.liquid, templates/index.liquid, config/settings_schema.json, snippets/css-variables.liquid, assets/base.css, locales, docs/tokens.json), gồm cả bảng lệch code/Figma ở ui-spec ES1-T34 (2 cột, heading display 100, body default, max_width 1416, khoảng cách 120/40). QA cập nhật test case rich-text theo ADR này.
- Đo: `shopify theme check` 0 lỗi; `grep -nE '#[0-9a-fA-F]{3,8}\b' assets/*.css` 0 dòng; trên store dev `getComputedStyle` container home-intro `background-color` = rgb(235, 230, 224); Lighthouse home accessibility ≥ 98, 0 lỗi color-contrast trong vùng home-intro; ảnh inline `alt=""` và heading text đọc = "Everything You Need to Train.".
