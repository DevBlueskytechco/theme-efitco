---
name: dev-fe-knowledge
description: Bộ kiến thức Dev FE của CTO (09/11/2026): HTML/CSS trước JS, hiệu năng ảnh/CSS/font, accessibility markup, hover thống nhất, loading và chuyển trạng thái, feedback, responsive và trình duyệt, typography/RTE, DoD trước bàn giao, bài học. Dùng khi làm block, snippet, template, CSS.
---
Bộ kiến thức do CTO soạn (thư mục Dev_FE_knowledge, 09/11/2026), bản có lịch sử ở `ai-team/knowledge/dev-fe/`. Tra cứu: mở đúng file cho việc đang làm, không đọc hết.

Efitco khác bộ kiến thức chung (AGENTS.md thắng):
- Block-first trên Shopify Skeleton: không `sections/`, không JSON template, không schema `presets`, không `{% stylesheet %}`/`{% javascript %}`. Bộ kiến thức nói "section" thì hiểu là block hoặc template Liquid.
- Dev FE làm Liquid, `{% schema %}` của block, `config/settings_schema.json`, `locales/`; quy tắc settings đọc ở bộ BE: `.claude/skills/dev-be-knowledge/reference/01_BE_*` đến `04_BE_*`.
- Dev FE không viết JS: giao markup đủ trạng thái + hook (class, aria-*, data-*) cho Dev BE (file 01).
- Quyết định thiết kế đã chốt: `docs/design/decisions.md`; ngoại lệ AA: `tests/e2e/support/figma-exceptions.json`.

Thứ tự ưu tiên khi mâu thuẫn: quyết định CTO trong ticket > AGENTS.md > DESIGN.md > docs/design/decisions.md > bộ kiến thức. Trong bộ: [Shopify – bắt buộc] > [Nội bộ – DoD] > [Shopify – khuyến nghị].

## Đọc gì theo việc
- Mọi ticket: 01, 09 (DoD), 10 (bài học).
- Ảnh, hero, font, CSS nặng: 02. Focus, contrast, label, vùng chạm: 03. Hover: 04. Loading, popup, drawer, tab, accordion, sticky: 05. Nút, form, toast, tiến trình: 06. Responsive, trình duyệt: 07. Typography, màu, RTE: 08.

## Danh sách file
| File | Loại | Tiêu đề |
|---|---|---|
| `reference/00_FE_Pham-vi-va-cach-dung-bo-kien-thuc.md` | Tài liệu | Phạm vi Dev FE và cách dùng bộ kiến thức |
| `reference/01_FE_Uu-tien-HTML-CSS-truoc-JavaScript.md` | Quy tắc | Ưu tiên HTML và CSS trước JavaScript |
| `reference/02_FE_Hieu-nang-anh-CSS-font-asset.md` | Quy tắc | Hiệu năng phía FE: ảnh, CSS, font, asset |
| `reference/03_FE_Accessibility-markup-va-CSS.md` | Quy tắc | Accessibility ở mức markup và CSS |
| `reference/04_FE_Hieu-ung-hover-thong-nhat-toan-site.md` | Quy tắc | Hiệu ứng hover thống nhất toàn site |
| `reference/05_FE_Loading-animation-va-chuyen-trang-thai.md` | Quy tắc | Loading animation và chuyển trạng thái |
| `reference/06_FE_Feedback-va-microinteraction.md` | Quy tắc | Feedback và microinteraction |
| `reference/07_FE_Responsive-browser-va-do-ben-layout.md` | Quy tắc | Responsive, tương thích trình duyệt và độ bền layout |
| `reference/08_FE_Nhat-quan-giao-dien-typography-mau-RTE.md` | Quy tắc | Nhất quán giao diện: typography, màu, nội dung RTE |
| `reference/09_FE_Checklist-DoD-truoc-khi-ban-giao.md` | Checklist | Checklist DoD FE trước khi bàn giao |
| `reference/10_FE_Kinh-nghiem-va-bai-hoc.md` | Kinh nghiệm | Kinh nghiệm và bài học khi làm FE theme Shopify |
