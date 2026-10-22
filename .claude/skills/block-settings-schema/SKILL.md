---
name: block-settings-schema
description: Viết settings cho block theo chuẩn Shopify (label, terminology, default, kiểu input). Dùng khi thêm hoặc sửa {% schema %}.
---
- Mọi setting có `label` (qua `t:`), sentence case, American English, không `&`, câu khẳng định, nút bắt đầu bằng động từ.
- Thuật ngữ: home page, heading, subheading, body text, button label, slideshow, main menu, cart type, favicon, show/use/enable đúng nghĩa.
- Kiểu: `collection`, `product`, `image_picker`, `richtext`, `select` (option có tên mô tả, không "Option 1"), `range` (có unit, step), `checkbox`, `color`, `font_picker` (default trong danh sách Shopify), `link_list` (header/footer default `main-menu`/`footer`), `liquid` cho Custom Liquid block.
- Default phải gợi cách dùng, không Lorem Ipsum; resource default phải tồn tại ở mọi store (tốt nhất không default).
- Kỹ thuật: `1200 x 600px .jpg recommended`, `3:2 aspect ratio recommended`, `32 words max`.
- Không nested quá 1 cấp; nhóm bằng `header`; tối đa ~12 setting/block, hơn thì tách block.
