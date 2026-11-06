KHÔNG CHẮC: (1) Chưa đọc được Figma 1:454: mcp__figma__get_node trả 429 cả 4 lần, nên căn lề, cỡ chữ heading, khoảng cách và icon CTA là suy luận, đã hỏi Designer ở ES1-T34. (2) Chưa render lần nào: không có preview, mọi hành vi giao diện mới là suy từ code, chờ CI. (3) AGENTS.md chưa cập nhật, xem mục Còn thiếu.

# ES1-T29 TE-2-FE2: block rich-text

Spec: TE-2 AC5, `drafts/techlead/ES1-T24/task-split.md` D8 (trên nhánh feature/ai-ES1-T24, chưa có ở develop). Figma 1:454.

## Thay đổi
- `blocks/rich-text.liquid`: block tự chứa, 6 settings `heading`, `heading_level` (h1/h2, default h2), `body`, `button_label`, `button_url`, `max_width` (480–1416, step 24, default 960). Phần tử rỗng không render; nút chỉ hiện khi có label, href mặc định `routes.all_products_collection_url`. Dùng lại `.button`.
- Trạng thái rỗng: cả 3 phần trống thì editor hiện placeholder, storefront không render block. Container rỗng vẫn còn trên storefront.
- `templates/index.liquid`: container riêng ngay sau container slideshow, body gọi rỗng.
- `assets/base.css`: `.rich-text`, độ rộng qua biến inline `--rich-text-max-width`. Không đụng `critical.css`.
- `locales/`: gộp vào `blocks`, `general`, `info`, `labels`, `options`, không tạo key cha trùng. Label button dùng lại `info.slide_button_label`.

## Quyết định cần review
- Căn lề theo D8: không thêm setting, `justify-self: var(--text-align)` đưa cả khối theo alignment của container, `text-align` kế thừa. Mặc định container là trái. Nếu Figma căn giữa, truyền `alignment: 'center'` trong template có thể khoá setting của merchant (task-split KHÔNG CHẮC 4), cần Tech Lead chốt.
- Thêm `info` cho `button_url` để merchant biết link mặc định; `heading_level` có `info` theo D8.

## Giá trị tạm chờ ES1-T34
- Heading: `--font-size-h2` (36px ở 1280+), weight mặc định của heading.
- Padding block `--space-7`, heading tới CTA `--space-5`.
- CTA không icon, body rỗng, màu chữ kế thừa.

## Rủi ro cần xem trên preview
- Chưa kiểm editor: alignment của container, chọn placeholder khi xoá hết nội dung.
- Body richtext rỗng dựa vào `!= blank`, chưa kiểm trên store thật.
- Chọn h1 cho ra 2 h1 trên trang chủ: quyết định của merchant, có cảnh báo trong `info`. Default h2 giữ 1 h1.

## Tự kiểm tra
- Đạt: `shopify theme check --path .` 39 file, 0 offense, chạy sau lần sửa code cuối.
- Đạt: 0 file JS trong diff; 4 testid; 6 settings; locale JSON parse được; `critical.css` 9785 byte, không đổi.
- Chờ CI: preview, đúng 1 h1, xoá label thì mất nút, max_width đổi độ rộng, axe, lhci ≥ 96/90/98, ảnh 360/768/1280, ui-diff 1:454.
- Chưa có người làm: spec E2E, dev-fe không ghi được `tests/`.

## Còn thiếu
- `AGENTS.md`: ticket yêu cầu cập nhật danh sách block, nhưng scope-guard chặn dev-fe (đã thử, bị từ chối). Orchestrator thêm `announcement-bar`, `slideshow`, `slideshow-slide`, `rich-text` vào dòng Current blocks; `slideshow`, `slideshow-slide`, `rich-text` vào Theme map. Hai dòng này develop vẫn chưa có từ ES1-T28.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
