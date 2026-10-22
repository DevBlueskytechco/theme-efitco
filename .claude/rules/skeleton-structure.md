# Cấu trúc Skeleton (không được lệch)

Thư mục được phép: `assets/ blocks/ config/ layout/ locales/ snippets/ templates/`. Thêm cho dự án: `docs/ drafts/ tests/ scripts/ .claude/`.

Bắt buộc theo AGENTS.md:
- Không `sections/`, không `{% section %}`, không JSON template, không `presets` trong schema.
- Template là composition root: `templates/*.liquid` → `{% block 'container' %}` → block/snippet/markup.
- Mỗi block: `{% doc %}` có typed params; `{% schema %}` không presets; `{{ block.shopify_attributes }}` trên root element; `{{ content }}` nếu nhận body.
- Block con chỉ gọi từ `layout/` hoặc `templates/`, không gọi trong block/snippet.
- CSS/JS chỉ trong `assets/`; không `{% stylesheet %}` / `{% javascript %}`.
- Chuỗi người dùng thấy: `{{ 'key' | t }}`, khai báo trong `locales/en.default.json`; label settings: `t:` trong `locales/en.default.schema.json`.
- URL storefront: `routes.*`.
- Khoảng trắng giữa tag HTML và Liquid: `<li {% ... %}`.
- `.theme-check.yml` giữ `extends: theme-check:recommended`, 0 override.

Đặt tên: block `kebab-case.liquid` theo chức năng (`featured-collection`, `product-card` là snippet). Setting id `snake_case`. Label sentence case, American English, không dùng ký tự `&`.
