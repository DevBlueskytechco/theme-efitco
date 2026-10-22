---
name: liquid-convention
description: Convention Liquid/CSS của team cho theme: đặt tên, token CSS, trạng thái rỗng/lỗi, placeholder editor, lazy image. Dùng cho mọi task Dev FE.
---
- Class BEM: `.block-name`, `.block-name__element`, `.block-name--modifier`.
- Màu/chữ/khoảng cách chỉ qua biến `--color-*`, `--font-*`, `--space-*`, `--radius-*` từ `snippets/css-variables.liquid`. Cần biến mới → thêm setting + biến, không hardcode.
- Ảnh: luôn `{% render 'image', ... %}` (srcset/sizes/lazy có sẵn); ảnh đầu trang `loading: 'eager'`; mọi ảnh có alt từ resource.
- Resource chưa chọn (collection/product rỗng): trong `request.design_mode` render placeholder có hướng dẫn `{{ 'blocks.<name>.placeholder' | t }}`; ngoài editor `{% return %}`-style: không render gì.
- Badge/giá: tính trong Liquid, `| times: 100.0 | divided_by:` tránh chia nguyên; `money` filter cho tiền.
- Phân trang `{% paginate %}`; sort/filter qua `collection.sort_options`, `collection.filters`.
- Không inline style trừ biến CSS động (`style="--cols: {{ block.settings.columns }}"`).
- Commit: `feat(blocks): add featured-collection` / `fix(css): ...`, mã ticket trong body.
