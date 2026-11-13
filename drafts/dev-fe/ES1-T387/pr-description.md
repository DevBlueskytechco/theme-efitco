KHÔNG CHẮC: (1) setting eyebrow/heading/subheading/note_1/note_2 của blocks/quiz.liquid vẫn giữ default chữ Figma có từ trước, trái ES1-T308 #1 (default rỗng); ngoài phạm vi AC3/AC5/AC8 nên chưa đổi, cần Tech Lead xếp ticket. (2) Breadcrumb trang `?view=quiz` viết tại template, chưa dùng snippet breadcrumb chung của TE-22 (chưa có). (3) Viền radio quiz để ES1-T403 làm, PR này không đụng `.quiz-option`.

# ES1-T387 TE-11-R2-FE1: popup kết quả quiz, trang `?view=quiz`

AC: TE-11 AC3, AC5, AC8 (SRS 0.4), docs/ui-spec/quiz-result.md, task-split ES1-T307 §6.9.

## Thay đổi
- `blocks/quiz.liquid`
  - Popup `<modal-dialog data-layer="quiz" data-sheet-below="48rem">` → `<dialog class="dialog dialog--l">` có `aria-labelledby` (tiêu đề) + `aria-describedby` (dòng đếm `role="status"`). `results_popup` default đổi thành `true`; tắt trong theme editor.
  - Trong popup: nút đóng, tiêu đề "Your Gear Shortlist", pill câu trả lời (template cho JS), spinner "Matching your gear…" khi `aria-busy`, skeleton 4 card, vùng "Added to cart" (`role="status"` + template), empty "No Exact Match" + "Change My Answers" + "Shop All Equipment", lỗi tải + link mở `?view=quiz`, khung quick view nhúng + "Back to shortlist", chân "Retake Quiz" + partial actions.
  - Partial `quiz-results`: ≤ 4 card (còn hàng trước, hết hàng chỉ để lấp), tiêu đề card h2, ảnh đầu eager. Nút dưới card: 1 biến thể còn hàng → form POST `routes.cart_add_url` (chạy không JS); nhiều biến thể → link "Choose Options"; hết hàng → "Sold Out" disabled. Dùng `variants_count`, không lặp `product.variants` (ADR 0008).
  - Partial `quiz-results-actions`: tổng > số card → "View All N Matches" tới `/collections/<handle>/<tag+tag>` (bỏ `?view=quiz`); ngược lại "Shop All Equipment".
  - `results_view` (trang `?view=quiz`): eyebrow, 1 h1 "Your Gear Shortlist", câu đếm (pluralize), pill bỏ tiền tố `quiz-`, link "Retake the quiz" về `#quiz` trang chủ, empty có 2 đích.
  - `empty_text` bỏ default (ES1-T308 #1), rỗng → locale.
- `templates/collection.quiz.liquid`: bỏ h1 tên collection; breadcrumb `nav` + `aria-current`; truyền `retake_anchor: 'quiz'`.
- `templates/index.te11.liquid`: truyền `collection: collections['te11-quiz']` (CTO 11/11, ES1-T178 M-A), `results_popup: false` để ES1-T139 giữ test panel dưới bước.
- `assets/base.css`: CSS popup/kết quả/trang `?view=quiz`; xoá CSS popup cũ (literal figma, px) cùng PR. Chỉ token, logical properties, `var(--layer-*)`, motion trong `prefers-reduced-motion: no-preference`.
- `locales/en.default.json`: gộp vào `blocks.quiz` (không key trùng); `en.default.schema.json`: sửa info `quiz_collection`, `quiz_empty_text`.
- `tests/e2e/ES1-T387.spec.ts`: nhóm static, fixture (CSS thật), store.

## Hook cho BE (TE-11-R2-BE1, TE-3-R2-BE1)
Đủ trong `{% doc %}` của block. Chính: `quiz-finder` (root, `data-results-url`, `data-results-view="quiz"`, `data-label-*`), `[data-quiz-dialog]`, `[data-quiz-results-panel]` (aria-busy), `[data-quiz-title]` (tabindex -1), `[data-quiz-answers]` + `template[data-quiz-answer-template]`, `[data-quiz-results-status-text]`, `[data-quiz-error]` (`[data-retry]`), `[data-quiz-notice-region]` + `template[data-quiz-notice-template]`, `[data-quiz-quick-view]` (`[data-quiz-shortlist-back]`, `[data-quiz-quick-view-body]`), card `[data-quiz-add-form]`, `[data-quiz-add]`, `[data-quiz-add-error]`, `[data-quiz-choose]`; partial `quiz-results` + `quiz-results-actions` (fetch 1 lần). Không thêm/sửa file JS, không thêm thẻ script mới.

## Việc cho Orchestrator
- Xoá `drafts/dev-fe/ES1-T387/pw-local.config.mjs` (config chạy test cục bộ của lượt 1; agent bị chặn `rm`). Sau khi xoá, diff không còn file JS.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi.
- `gzip -c assets/base.css | wc -c` = 48 579 ≤ 49 152; `wc -c assets/critical.css` = 9 917 ≤ 10 240.
- Quét CSS thêm mới: 0 literal màu, 0 `z-index` số, 0 left/right/top/bottom, 0 thời gian rời, 0 `outline: none`.
- Playwright `ES1-T387 static`: 6/6 đạt cục bộ. Nhóm fixture (4 test): Chromium bị SIGTRAP trong sandbox agent, chờ CI. Nhóm store: chờ CI, cần collection `te11-quiz` (TE11_QUIZ_COLLECTION); thiếu dữ liệu thì skip, không tính đạt.
- Preview, Lighthouse (trang chủ, `/collections/te11-quiz/...?view=quiz`), ảnh 360/768/1280, axe: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
