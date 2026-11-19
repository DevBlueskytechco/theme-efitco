KHÔNG CHẮC: ngoài 2 template trong ticket còn sửa thêm templates/index.te11.liquid. Template này đang truyền eyebrow/heading/... như tham số, block bỏ qua chúng, nên trước giờ chữ hiện ra là nhờ schema default. Bỏ default mà không sửa te11 thì spec ES1-T137 AC1 đỏ.

# ES1-T465 · TE-11 FE: quiz, 5 setting chữ default rỗng

CTO 14/11 (ES1-T457 a), ES1-T308 #1.

## Thay đổi
- blocks/quiz.liquid
  - Bỏ `default` của eyebrow, heading, subheading, note_1, note_2. Block quiz thêm mới trong editor không có chữ intro; phần nào rỗng thì ẩn phần đó, rỗng cả 5 thì không render `.quiz__intro`, root không có `quiz--split` (logic `has_intro` có từ trước).
  - Thêm tham số `default_eyebrow`, `default_heading`, `default_subheading`, `default_note_1`, `default_note_2` (`{% doc %}` typed), làm giống quiz-step: `block.settings.x | default: default_x`. Giá trị merchant đã lưu được ưu tiên.
  - Xuất chữ intro bằng `escape_once` (chữ từ `| t` có thể đã escape, giống quiz-step).
  - info cho schema: eyebrow/heading/subheading dùng `t:info.quiz_intro_text` (mới); note_1/2 dùng `t:info.quiz_note`, đã sửa câu.
- templates/index.liquid, templates/index.figma.liquid: gán `quiz_*` từ `'blocks.quiz.default_*' | t` rồi truyền vào `{% block 'quiz' %}`. Trang chủ giữ chữ Figma 1:506.
- templates/index.te11.liquid: đổi `eyebrow:`…`note_2:` thành `default_*:`. Block không đọc các tham số cũ.
  - Hệ quả: subheading trên ?view=te11 thành "Three questions. One shortlist.", đúng với ES1-T137 AC1 (trước đây ra "Two…" vì lấy schema default).
- locales/en.default.json: thêm `blocks.quiz.default_eyebrow|default_heading|default_subheading|default_note_1|default_note_2`, gộp vào khoá `blocks.quiz` đã có, không trùng khoá.
- locales/en.default.schema.json: thêm `info.quiz_intro_text`, sửa `info.quiz_note`.
- Không sửa CSS, không có file JS trong diff.

## Lưu ý
- Store đã lưu setting quiz trước đây vẫn giữ giá trị cũ. Ở trang chủ, xoá trắng một trường thì chữ mẫu hiện lại (giống quiz-step). Muốn ẩn quiz thì dùng show_item của các step.
- tests/fixtures/home-figma.json còn `settings` quiz với chữ Figma. Fixture thuộc QA nên không sửa; template đã truyền đúng chữ đó nên không lệch.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 22 cảnh báo đều có từ trước (default_checked, preselect, hide_options, default_verified, discount_note); không có cảnh báo mới ở quiz.
- Locale JSON parse được qua theme check, không trùng khoá.
- Spec ES1-T182 (/ eyebrow, heading, subheading, 2 note), ES1-T183 (/ subheading), ES1-T137 (te11), ES1-T341: chờ CI.
- Block quiz mới trong editor rỗng intro: chờ kiểm trên preview.
- Lighthouse, ảnh 3 breakpoint, visual diff: chờ CI. Markup và CSS không đổi nên dự kiến không lệch.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
