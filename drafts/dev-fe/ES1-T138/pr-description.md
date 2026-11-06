KHÔNG CHẮC: (1) chưa có preview: `?view=quiz` sau redirect bỏ tag, `current_tags` đọc trong block, `partial` trên template thứ 2 chưa chạy thật; Playwright, axe, lhci, ảnh 360/768/1280 chờ CI; spec chưa chạy, chưa type-check. (2) ES1-T134 còn Open, `store-data.json` chưa có `TE11_TAGS_READY`, `TE11_TAG_FILTER_READY`: test 4 card, 1 card, bộ rỗng, nojs search sẽ skip có lý do, chưa chứng minh được. (3) Đường không JS: ES1-T133 #2, #3 không có câu nguyên văn về `q=*` và `filter.p.tag` lặp (AND hay OR), chưa bật filter tag thì giả định bị bỏ qua; giữ mặc định D4, ES1-T140 ghi hành vi thật. (4) Spec ở drafts vì scope-guard chặn tests/.

# ES1-T138 TE-11-FE2: vùng kết quả quiz

Ticket: ES1-T138 · AC: docs/srs.md#TE-11 AC3 phần Liquid, AC1 phần kết quả không JS · Nguồn: drafts/techlead/ES1-T132/task-split.md D3, D4, D6, D9; ES1-T133, ES1-T135 #2, #3.

## Thay đổi
- `blocks/quiz.liquid`: partial `quiz-results` sau form, tối đa 4 `product-card` (`id_prefix: quiz`, `card_context: recommendation`, `heading_level: h4`), `data-quiz-count` là số card thật. Param `results_view`, `required_tags`. Text rỗng và link ngoài partial. Hook `data-results-url`, `data-results-view`, `data-label-results` trên root. `product-swatch.js` nạp ngoài partial.
- `templates/collection.quiz.liquid` (mới): container, h1 tiêu đề collection, block quiz `results_view: true`.
- `assets/base.css`: thẻ kết quả, lưới 2 cột và 4 cột từ 64rem, vùng rỗng. `critical.css` không đổi.
- `locales/en.default.json`: gộp vào `blocks.quiz`: `empty_cta`, `empty_text`, `results_count`, `results_heading`.
- 0 file JS.

## Chốt tham số form không JS (ES1-T133 #2, #3)
Giữ form FE1, không đổi markup: `q=*`, `type=product`, mỗi lựa chọn đã chọn 1 `filter.p.tag`. Store cần bật filter Product tag trong Search and Discovery. Docs nói `filter.p.tag` nhận danh sách phẩy; checkbox GET chỉ tạo được tham số lặp, không JS không ghép được, nên giữ dạng lặp. Doc block ghi lại.

## Quyết định cần soát
- Chặn kết quả sai (comment CTO trên ticket, ES1-T133 #1): `current_tags.size` nhỏ hơn số tag yêu cầu thì 0 card, hiện text rỗng. `current_tags` là nil khi không có tag, mà `nil < 3` trong Liquid là false, nên qua `default: 0` trước khi so; so bằng `>=` để nil không lọt.
- Lệch comment CTO: không hardcode 3 trong block mà truyền `required_tags: 3` từ template, cùng nơi quyết định số bước. Mặc định 3. Đổi số bước quiz phải sửa cả param này.
- Lệch ticket: `results_view` render root là `div`, không phải `quiz-finder`. Trang này không có form, nếu BE1 nạp script mà không chặn thì element nâng cấp trên root rỗng. Vẫn `data-testid="quiz"`, class `.quiz`.
- Lệch ticket: link rỗng thêm `collection.url` giữa setting và `routes.all_products_collection_url`. Vào `/collections/foo/...?view=quiz` thì link về foo, không về all. Trên trang chủ `collection` là nil nên giữ đúng chuỗi trong ticket.
- Thêm ngoài ticket: trong editor panel và text rỗng hiện sẵn (`request.design_mode`), vì JS không nạp ở đó và merchant không thấy được text đang sửa. Storefront vẫn ẩn sẵn.
- Partial trang chủ: root `quiz-results` có `data-quiz-count="0"`, không có con. Card của trang chủ luôn đến từ `collection.quiz`, nên `h4` cố định; `collection.quiz` vào thẳng là h1, h3, h4 (D6 chấp nhận).
- Tiêu đề kết quả dùng lại hook `data-quiz-title`, `tabindex="-1"` cho BE1 đặt focus (ES1-T139): `panel.querySelector('[data-quiz-title]')`. Không thêm hook mới.
- `@media (min-width: 80rem)`: `.quiz--split` đổi `row-gap` về `--space-6`, không thì thẻ kết quả cách hàng trên 80px. Bố cục 1 hàng trước đây không đổi.
- `.quiz__results-body:empty` ẩn gốc partial rỗng để không tạo thêm gap giữa tiêu đề và text rỗng.
- Đặt tên chuỗi: `results_count` là "Products in your shortlist: {{ count }}", không dùng dạng one/other vì `count` là chuỗi `%n`. Text heading, CTA không có trong Figma (ES1-T135 #2, #3).

## Hợp đồng
6 data-testid theo D9: `quiz-results`, `quiz-results-heading`, `quiz-results-grid`, `quiz-empty`, `quiz-empty-text`, `quiz-empty-cta`. Thêm `container-quiz-results` (tự sinh từ id container).
Hook cho BE1: partial `quiz-results`; `data-quiz-results-panel` (`hidden` trên trang chủ), `data-quiz-empty` (`hidden`), `data-quiz-count`, `data-results-url`, `data-results-view`, `data-label-results` (thay `%n`). Text rỗng cho `quiz-status`: đọc `[data-quiz-empty] p`.

## Chép file, việc cho Orchestrator
- `drafts/dev-fe/ES1-T138/ES1-T138.spec.ts` → `tests/e2e/ES1-T138.spec.ts`.
- Không thêm block hay snippet nên Theme map AGENTS.md không đổi ở PR này.
- `tests/e2e/support/store-data.ts` `env()` chỉ trả chuỗi: cờ `TE11_*` ghi JSON boolean sẽ thành undefined. Spec này tự đọc cả 2 dạng; ES1-T139, ES1-T140 cần làm tương tự.

## Tự kiểm tra
- `shopify theme check --path .`: 68 file, 0 lỗi. `.theme-check.yml` không đổi.
- Locale JSON parse được, gộp vào `blocks.quiz`, không group trùng.
- Diff không có file JS; `assets/*.js`, `critical.css` không đổi; đã đọc lại CSS mới: 0 màu literal, chỉ thuộc tính logic.
- Chờ CI, chưa đạt cho tới khi có kết quả: `npx playwright test tests/e2e/ES1-T138.spec.ts -g "AC3|nojs"` desktop + Pixel 7; ES1-T137.spec + TE-3.spec; axe 0 serious trên `collection.quiz`; 0 console error; `npx lhci autorun` từ 96 / 90 / 98; ảnh 360, 768, 1280.
- Chạy được ngay cả khi thiếu dữ liệu: URL tag không tồn tại (kiểm redirect giữ `?view=quiz`), URL không tag, trang chủ partial rỗng. Nếu redirect làm mất `?view=quiz` thì test đỏ, D3 phải đổi.
- Cần xem tay trong editor: panel và text rỗng hiện ở `data-design-mode`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
