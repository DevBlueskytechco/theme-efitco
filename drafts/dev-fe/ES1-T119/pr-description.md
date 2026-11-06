KHÔNG CHẮC: (1) chưa có preview: `replace` trên `content` (ES1-T117 #5, CTO giao FE2 kiểm), `block.id` khác nhau giữa các static block, param `allow_multiple: true` vào `block.settings` đều chưa chạy thật; Playwright, snapshot accessibility tree, axe, lhci, ảnh 360/768/1280 chờ CI; spec chưa chạy, chưa type-check. (2) Trong editor chưa kiểm: nếu sửa setting 1 câu mà editor chỉ render lại câu đó thì thẻ có thể mất `name` tới khi tải lại trang. (3) Thuộc tính `name` của details theo hiểu biết của Tech Lead (Chrome 120, Safari 17.2, Firefox 130), chưa tra nguồn; trình duyệt cũ vẫn mở đóng được, chỉ mất tính độc quyền. (4) Bo góc dùng `--radius-card` (default 12), Figma ảnh 16, ô stat 8. (5) Diff 630 dòng, không tính spec, vượt mức 400 của CONVENTION. (6) Spec ở drafts vì scope-guard chặn tests/.

# ES1-T119 TE-7-FE2: FAQ

Ticket: ES1-T119 · AC: docs/srs.md#TE-7 AC2, AC5 phần FAQ · Figma 1:1057 · Nguồn: drafts/techlead/ES1-T114/task-split.md D1, D2, D4, D7, D8; ES1-T115, ES1-T116, ES1-T117.

## Thay đổi
- `blocks/faq-item.liquid` (mới): `details` + `summary` + `h3`, 2 settings question, answer; param template `open`. Question trống: storefront không render, editor hiện placeholder. Answer trống: không có vùng trả lời.
- `blocks/faq.liquid` (mới): 10 settings theo ticket. Khi `allow_multiple` tắt, `replace` trên `content` để thêm `name="faq-{block.id}"` vào mọi thẻ details. Body rỗng: storefront không render, editor hiện placeholder.
- `templates/index.liquid`: container `home-faq`, cream, 5 câu `faq-1`..`faq-5`, `faq-1` có `open`.
- `templates/index.te7.liquid`: 5 band mới: `te7-faq` (Figma, ảnh + 2 stat), `te7-faq-multiple` (allow_multiple bật, không ảnh, không stat, câu 3 không answer), `te7-faq-one` (1 câu, chỉ ảnh), `te7-faq-ten` (10 câu, chỉ stat 1), `te7-faq-empty`.
- `assets/base.css`: mục FAQ, tăng 5 404 B (70 631 → 76 035). `critical.css` không đổi.
- `locales/`: `blocks.faq`, `general`, `labels`, `info`.
- 0 JS.

## Quyết định cần soát
- Câu chữ AC2: CTO chấp nhận details + summary ở ES1-T115 #1, BA sửa câu AC. Vì vậy không có `aria-expanded`, `aria-controls` trong markup.
- Trong `{% doc %}` không ghi chuỗi `<details ...`: theme check báo `UnclosedHTMLElement` ở thẻ đóng của file, đổi lời thì hết. Chuỗi thay thế chỉ nằm trong code: `blocks/faq-item.liquid` dòng 22, `blocks/faq.liquid` dòng 33-34. Đổi thẻ mở của con thì phải đổi cả cha, nếu không `allow_multiple` tắt sẽ mất tác dụng mà không báo lỗi; test `AC2 tắt allow_multiple` bắt lỗi này.
- Question đã `escape`, answer là richtext không cho thẻ details, nên `replace` chỉ trúng thẻ của `faq-item`.
- Ô stat render khi 1 trong 3 setting có chữ. Trong editor default để trống theo D7.
- Hai ô đè ảnh tính theo % cột (ảnh 509/668, hàng ô 532/668), không cố định 260 px: ở 1024 cột chỉ khoảng 452 px, ô cố định sẽ tràn. Ở 1920 đúng số Figma. Xem ảnh CI 1280.
- Dưới 64rem mỗi ô `flex: 1 1 10rem`: ở 360 xếp dọc, từ khoảng 390 cùng hàng.
- Icon vẽ bằng border `currentcolor`, không dùng background, vì forced-colors xoá background.
- Màu theo CTO, không theo Figma: nền ô 1 `--color-accent` (#C8400E, Figma #D94610), answer `--color-muted-light` (#6B6B6B, Figma #808080). Câu hỏi đóng `--color-muted`, mở theo màu chữ của band.
- Màu chữ tính cho nền cream: band dark không đạt contrast, sand thì `muted_light` không đạt. Template hiện chỉ dùng cream.
- Bản Figma chỉ có 1 câu trả lời, 4 câu còn lại trong `te7-faq` dùng chữ test.
- Trang chủ chưa giống Figma tới khi merchant nhập nội dung (D7, ES1-T115 #2); visual diff chạy trên `/?view=te7`.

## Hợp đồng
11 data-testid theo D8: `faq`, `faq-heading`, `faq-list`, `faq-placeholder`, `faq-item`, `faq-question` (đặt trên `summary`), `faq-answer`, `faq-item-placeholder`, `faq-image`, `faq-stat-1`, `faq-stat-2`. Thêm `container-home-faq`. Hook phụ cho test: `data-faq-id`, `data-faq-item-id`.

## Theme map AGENTS.md (scope-guard chặn, nhờ CTO hoặc Orchestrator áp)
Bảng Blocks:
```
| `faq` | Questions, optional image and two stat tiles; one or several open through the details name attribute, no JavaScript. |
| `faq-item` | One question of `faq`: details disclosure with question and rich text answer. |
```

## Chép file
`drafts/dev-fe/ES1-T119/ES1-T119.spec.ts` → `tests/e2e/ES1-T119.spec.ts`.

## Tự kiểm tra
- `shopify theme check --path .`: 65 file, 0 lỗi, 0 warning. `.theme-check.yml` không đổi.
- Locale JSON parse được, không thêm group trùng.
- `git diff develop -- 'assets/*.js'` rỗng, không có file JS mới; 0 hex, rgb, hsl mới, 0 thuộc tính vật lý trong CSS mới. CI cần chạy thêm `wc -c assets/*.js` so với develop.
- Chờ CI, chưa đạt cho tới khi có kết quả:
  - `npx playwright test tests/e2e/ES1-T119.spec.ts -g "AC2|AC5"` desktop + Pixel 7, gồm nhóm `javaScriptEnabled: false`: Enter và Space, một và nhiều mở, không dấu vết `name`, 1 và 10 câu, ảnh và stat ẩn khi trống, chạm từ 44px.
  - Accessibility tree Chromium: test `AC2 accessibility tree` đọc qua CDP, in dòng `faq-ax-tree` ra log và đính kèm report. Cần chép kết quả vào PR.
  - axe 0 serious khi đóng và khi mở; 0 console error.
  - `npx lhci autorun` từ 96 / 90 / 98 trên trang chủ; ảnh 360, 768, 1280.
- Nếu `replace` không chạy trên preview: comment ES1-T117, báo Tech Lead. CTO đã nêu phương án dự phòng: đặt setting ở từng block con hoặc bỏ tính độc quyền.
- Kiểm tay trong editor khi có store: sửa 1 câu rồi xem các thẻ details còn `name` không.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
