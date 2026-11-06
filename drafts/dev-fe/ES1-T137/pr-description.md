KHÔNG CHẮC: (1) chưa có preview: `?view=te11`, `@media (scripting: enabled)` + `:has`, param ảnh vào `block.settings` chưa chạy thật; Playwright, axe, lhci, ảnh 360/768/1280 chờ CI; spec chưa chạy, chưa type-check. (2) DoD "không có band rỗng" CHƯA ĐẠT trên nhánh này: `blocks/container` bỏ band rỗng nằm ở ES1-T118 (PR #85, chưa merge); trang chủ còn 1 `div` rỗng `container-home-quiz` cao 0 tới khi rebase. (3) Thêm file ngoài ticket: `snippets/quiz-icon.liquid`, xem Quyết định. (4) Mặc định theo ES1-T135, ES1-T136 đang chờ Designer, PO; copy bước 2, 3 trong `index.te11` là chữ giữ chỗ (ES1-T135 #8). (5) Spec ở drafts vì scope-guard chặn tests/.

# ES1-T137 TE-11-FE1: quiz markup + CSS

Ticket: ES1-T137 · AC: docs/srs.md#TE-11 AC1, AC4 · Figma 1:506 · Nguồn: drafts/techlead/ES1-T132/task-split.md D1, D2, D4, D5, D7, D9.

## Thay đổi
- `blocks/quiz.liquid` (mới): 7 settings. Root `quiz-finder.quiz` là panel `background_dark`, 2 cột từ 64rem; form GET tới `routes.search_url` với `q=*`, `type=product`; nút Back (`hidden`), Submit, vùng `role="status"`. Thân rỗng: storefront không render, editor hiện placeholder. `collection`, `empty_text` khai báo sẵn, FE2 đọc.
- `blocks/quiz-step.liquid` (mới): 19 settings, nhóm bằng header. `fieldset` > `legend` chứa Step n of 3, thanh tiến độ, `h3 tabindex="-1"`. Checkbox `filter.p.tag`, `data-tag-handle`. Body map qua `snippets/image`, lazy, `alt=""`, ẩn dưới 48rem.
- `snippets/quiz-icon.liquid` (mới): clock, badge, check; `aria-hidden`, `currentColor`.
- `templates/index.liquid`: container `home-quiz` sau featured collection, không đặt setting qua param.
- `templates/index.te11.liquid` (mới): `?view=te11`, copy Figma, tag ES1-T134, ca 3 / 2 / 4 lựa chọn, 1 quiz không đủ lựa chọn để kiểm không render. Gỡ trước khi lên store thật.
- `assets/base.css`: mục quiz, tăng 7 944 B (57 499 → 65 443). `critical.css` không đổi.
- `locales/`: `blocks.quiz`, `blocks.quiz_step`, `general`, `info`, `labels`.
- 0 JS, không thẻ `script`. `quiz-finder` chưa có định nghĩa.

## Quyết định cần soát
- Ẩn bước dùng `.quiz-step:not(:has(:checked)) ~ .quiz-step` thay cho `.quiz-step:has(:checked) + .quiz-step` trong ticket: ẩn mọi thứ sau bước chưa trả lời. Lý do: dạng `+` để bước 3 còn hiện khi khách bỏ chọn bước 1, và cần thêm rule cho submit. Kết quả các ca trong DoD giữ nguyên. Hàng nút ẩn bằng cùng selector vì `:has` lồng `:has` không hợp lệ, nên `.quiz__actions` phải là con trực tiếp của form, cùng cấp với các bước.
- Bước thiếu câu hỏi cũng coi như không hợp lệ, thêm vào điều kiện dưới 2 lựa chọn của ticket: `legend` rỗng làm fieldset mất tên và `h3` rỗng, BE không có chỗ đặt focus.
- Tiến độ nằm trong `legend` để trình đọc màn hình đọc "Step 1 of 3" cùng câu hỏi. Thanh tiến độ `aria-hidden`, thông tin nằm ở chữ.
- `role="status"` là `div`, không phải `p`: `p:empty { display: none }` trong critical.css sẽ làm live region mất tác dụng.
- `quiz-icon` là snippet mới vì Figma có icon đồng hồ, huy hiệu, tick. Không thêm vào `icon-trust`: ES1-T118 đang sửa đúng chỗ đó, và đây không phải trust bar.
- Input phủ cả hàng, `opacity: 0`, nên bấm đâu cũng chọn; viền focus đặt trên hàng bằng `:has(:focus-visible)`. Viền focus của Submit đổi sang `--color-foreground` vì `currentcolor` là trắng trên thẻ trắng.
- 64rem–80rem chia cột 2 / 3 thay 1 / 1: thẻ 1 / 2 ở 1024 chỉ còn khoảng 188px cho hàng lựa chọn khi có body map. Từ 80rem đúng Figma.
- Lệch Figma theo D7 và ES1-T135, ES1-T136: nền panel `background_dark`, bo góc `--radius-hero`, `--radius-card` (Figma 24, 16, 8), subheading "Three questions", câu phụ không nhắc Tap. Default không có eyebrow, `20 seconds`; `index.te11` có để khớp Figma.
- `index.te11` có thêm tag `quiz-outdoor`, `quiz-travel` ngoài ES1-T134, chỉ để đủ ca 4 lựa chọn. Chọn 2 tag này sẽ chưa có sản phẩm trên store; test FE2 không nên dùng.
- Trên `/?view=te11` hiện `container-te11-quiz-hidden` rỗng cho tới khi rebase PR #85, spec không assert band này.

## Hợp đồng
17 data-testid theo D9: `quiz`, `quiz-eyebrow`, `quiz-heading`, `quiz-subheading`, `quiz-note`, `quiz-form`, `quiz-submit`, `quiz-back`, `quiz-status`, `quiz-placeholder`, `quiz-step`, `quiz-step-title`, `quiz-step-progress`, `quiz-step-progress-bar`, `quiz-body-map`, `quiz-option`, `quiz-option-input`. Thêm `container-home-quiz`.

Hook cho BE1: custom element `quiz-finder` chính là root (`.quiz`); `data-enhanced`, `data-design-mode` đặt trên root; `data-active` đặt trên bước; `data-quiz-step`, `data-quiz-title`, `data-quiz-submit`, `data-quiz-back`, `data-quiz-status`, `data-tag-handle`. BE1 thêm thẻ script, `data-lazy-module`.

FE2: partial `quiz-results` đặt sau `</form>`, trong `quiz-finder`. `.quiz--split` đang là lưới 2 cột, kết quả cần `grid-column: 1 / -1`.

## Theme map AGENTS.md (scope-guard chặn, nhờ CTO hoặc Orchestrator áp)
Bảng Blocks:
```
| `quiz` | Product finder quiz: dark panel, intro text, GET form of `quiz-step` blocks; works without JavaScript. |
| `quiz-step` | One step of `quiz`: progress, question, optional body map, 2 to 4 tagged options. |
```
Bảng Snippets:
```
| `quiz-icon` | Decorative quiz icons (clock, badge, check). |
```

## Chép file
`drafts/dev-fe/ES1-T137/ES1-T137.spec.ts` → `tests/e2e/ES1-T137.spec.ts`.

## Tự kiểm tra
- `shopify theme check --path .`: 0 lỗi. `.theme-check.yml` không đổi.
- Locale JSON parse được, không thêm group trùng. 7 + 19 settings, 17 data-testid đếm trong file.
- `git diff develop -- 'assets/*.js' assets/critical.css` rỗng; 0 hex, rgb, hsl, 0 thuộc tính vật lý trong CSS mới.
- Chờ CI, chưa đạt cho tới khi có kết quả: `npx playwright test tests/e2e/ES1-T137.spec.ts -g "AC1|AC4|nojs"` desktop + Pixel 7; TE-1.spec + TE-3.spec; axe 0 serious trên `/?view=te11` và `/`; 0 console error; `npx lhci autorun` từ 96 / 90 / 98; ảnh 360, 768, 1280.
- Chưa đạt: "không có band rỗng", chờ rebase PR #85.
- Không kiểm được qua CI, cần xem tay trong editor: placeholder quiz và quiz-step, `data-design-mode` hiện đủ bước.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
