---
name: dev-be-knowledge
description: Bộ kiến thức Dev BE của CTO (09/11/2026): settings hướng merchant, input type, theme editor events, tính năng Theme Store bắt buộc, dữ liệu trang và SEO, hiệu năng Liquid/JS, accessibility hành vi động, UX phía JS, dữ liệu test, checklist test, DoD, bài học. Dùng khi viết JS và hook hành vi.
---
Bộ kiến thức do CTO soạn (thư mục Dev_BE_knowledge, 09/11/2026), bản có lịch sử ở `ai-team/knowledge/dev-be/`. Tra cứu: mở đúng file cho việc đang làm, không đọc hết.

Efitco khác bộ kiến thức chung (AGENTS.md thắng):
- Dev BE chỉ viết JavaScript (`assets/*.js`) và hook hành vi. `{% schema %}`, `config/settings_schema.json`, `locales/`, logic Liquid là việc của Dev FE; file 01–04 dùng khi đọc setting từ JS hoặc review.
- Block-first trên Shopify Skeleton: không `sections/`, không section group, không JSON template, không schema `presets`. Bộ kiến thức nói "section" thì hiểu là block.
- JS nạp qua `data-lazy-module` + `assets/lazy-module.js`; thẻ host custom element do FE viết trong markup, JS chỉ define và nâng cấp; dùng partials (`@shopify/partial-rendering`) thay fetch tự viết.
- Có test tĩnh: trần byte (scroll-buttons.js 768 B, quiz-finder.js 4.352 B), số thẻ script mỗi block. Gần trần thì tách file mới, nạp bằng import().

Thứ tự ưu tiên khi mâu thuẫn: quyết định CTO trong ticket > AGENTS.md > ADR > bộ kiến thức. Trong bộ: [Shopify – bắt buộc] > [Nội bộ – DoD] > [Shopify – khuyến nghị].

## Đọc gì theo việc
- Mọi ticket: 08 (hiệu năng), 13 (DoD), 14 (bài học).
- Theme editor, design mode, shopify:block: 05. Cart, discount, selling plan, unit price, pickup, gift card, search, filter: 06, 07, 12. SEO, JSON-LD: 07. aria, focus, Esc, drawer, modal: 09. Hành vi JS (drawer, carousel, toast, sticky, load more): 10. Dữ liệu và kiểm thử: 11, 12.

## Danh sách file
| File | Loại | Tiêu đề |
|---|---|---|
| `reference/00_BE_Pham-vi-va-cach-dung-bo-kien-thuc.md` | Tài liệu | Phạm vi Dev BE và cách dùng bộ kiến thức |
| `reference/01_BE_Nguyen-tac-settings-huong-merchant.md` | Quy tắc | Nguyên tắc settings hướng merchant và basic requirements |
| `reference/02_BE_Text-style-terminology-ten-section-preset.md` | Quy tắc | Text style, terminology, đặt tên section và preset |
| `reference/03_BE_Input-settings-chon-dung-type.md` | Tài liệu | Input settings: chọn đúng type và thuộc tính |
| `reference/04_BE_Sidebar-conditional-dynamic-sources-font-color.md` | Tài liệu | Sidebar settings, conditional settings, dynamic sources, font, color |
| `reference/05_BE_Tich-hop-theme-editor-JS-events.md` | Quy tắc | Tích hợp theme editor: JavaScript events và design mode |
| `reference/06_BE_Tinh-nang-template-section-block-bat-buoc.md` | Quy tắc | Tính năng, template, section, block bắt buộc của Theme Store |
| `reference/07_BE_Yeu-cau-du-lieu-tung-trang-SEO-asset.md` | Quy tắc | Yêu cầu dữ liệu từng trang, SEO, asset, chức năng |
| `reference/08_BE_Hieu-nang-Liquid-va-JavaScript.md` | Quy tắc | Hiệu năng Liquid và JavaScript |
| `reference/09_BE_Accessibility-cho-hanh-vi-dong.md` | Quy tắc | Accessibility cho hành vi động (JavaScript) |
| `reference/10_BE_Hanh-vi-tuong-tac-UX-phia-JS.md` | Quy tắc | Hành vi tương tác UX phía JavaScript |
| `reference/11_BE_Chuan-bi-du-lieu-test-Testing-assets.md` | Checklist | Chuẩn bị dữ liệu test (Testing assets) |
| `reference/12_BE_Checklist-test-chuc-nang-theo-Shopify-review.md` | Checklist | Checklist test chức năng theo Shopify review |
| `reference/13_BE_Checklist-DoD-truoc-khi-ban-giao.md` | Checklist | Checklist DoD BE trước khi bàn giao |
| `reference/14_BE_Kinh-nghiem-va-bai-hoc.md` | Kinh nghiệm | Kinh nghiệm và bài học khi làm BE theme Shopify |
