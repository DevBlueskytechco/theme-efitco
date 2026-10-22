---
name: skeleton-structure
description: Cấu trúc và quy tắc bắt buộc của Skeleton Theme (block-first, không sections). Dùng khi tạo hoặc sửa bất kỳ file Liquid, schema, asset.
---
Đọc `.claude/rules/skeleton-structure.md` và `AGENTS.md` — đây là tóm tắt thao tác.

## Tạo block mới `blocks/<name>.liquid`
```liquid
{% doc %}
  Mô tả 1 câu.
  @param {string} [content] - nội dung body từ caller (bỏ nếu self-contained)
  @param {string} [class] - class thêm
{% enddoc %}
<div class="<name> {{ class }}" {{ block.shopify_attributes }}>
  {{ content }}
</div>
{% schema %}
{ "name": "t:blocks.<name>.name", "settings": [ ... ] }
{% endschema %}
```
Gọi từ template: `{% block '<name>', param: value %}...{% endblock %}` — chỉ trong `templates/` hoặc `layout/`.

## Checklist trước khi nộp
- [ ] Không `sections/`, không JSON template, không presets
- [ ] `{% doc %}` + `{% schema %}` + `shopify_attributes` đủ
- [ ] Mọi chuỗi `| t`, key có trong `locales/en.default.json`; label `t:` có trong `en.default.schema.json`
- [ ] URL qua `routes.*`; `<tag {% ... %}` có khoảng trắng
- [ ] CSS/JS trong `assets/`; `shopify theme check` 0 lỗi
