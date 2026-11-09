# Phạm vi Dev BE và cách dùng bộ kiến thức

**Tiêu đề:** Phạm vi Dev BE và cách dùng bộ kiến thức
**Loại:** Tài liệu
**Áp dụng cho:** Agent Dev BE – Shopify theme
**Nguồn:** Dev.xlsx (sheet "Bộ tiêu chí Definition of Done (DOD) - BE"), shopify.dev (đối chiếu ngày 09/11/2026)

---

## Nội dung

### 1. Vai trò

Senior Full-stack Shopify Theme Developer phía Back-end của theme: settings schema, Liquid render dữ liệu, các tính năng Theme Store bắt buộc, JavaScript cho mọi hành vi động, tích hợp theme editor, hiệu năng Liquid/JS.

### 2. Ranh giới FE / BE theo quy ước team

Quy ước team: **JavaScript là việc của BE**, không phải FE.

| Hạng mục | BE | FE |
| - | - | - |
| `config/settings_schema.json`, `{% schema %}` của section/block, preset | Có | Không |
| Logic Liquid: đọc object, settings, metafield, điều kiện, vòng lặp, pagination | Có | Không |
| Template JSON, section group, app block, Custom Liquid section/block | Có | Không |
| Tính năng Theme Store (cart, discount, selling plan, unit price, pickup, predictive search, filter…) | Có | Style |
| JavaScript: AJAX cart, variant picker, drawer/modal, quickview, sticky, toast, infinite scroll, theme editor events | Có | Không |
| ARIA động: `aria-expanded`, `aria-live`, quản lý focus, focus trap, Esc | Có | Dựng markup + CSS theo trạng thái |
| HTML semantic, CSS, animation | Không | Có |

Phối hợp: FE bàn giao markup + CSS cho mọi trạng thái kèm hook (class hoặc thuộc tính ARIA) và biến thời lượng animation. BE chỉ bật/tắt hook, không viết CSS, không chèn style inline bằng JS.

### 3. Ba mức độ của một quy tắc

- **[Shopify – bắt buộc]**: Theme Store requirements; thiếu là reject.
- **[Shopify – khuyến nghị]**: best practices trên shopify.dev; ảnh hưởng điểm Lighthouse/accessibility.
- **[Nội bộ – DoD]**: tiêu chuẩn team trong Dev.xlsx.

Thứ tự ưu tiên khi xung đột: Shopify – bắt buộc > Nội bộ – DoD > Shopify – khuyến nghị.

### 4. Cấu trúc DoD trong Dev.xlsx (để tra ngược)

| Nhóm trong file | Ý chính | File kiến thức BE |
| - | - | - |
| Settings – 1.1 | Dễ dùng, trực quan, linh hoạt, đổi được mọi thứ không cần sửa code, đổi không gây lỗi | 01 |
| Settings – 1.2 | Basic requirements, theme editor event, style, terminology, section name, preset name | 01, 02, 05 |
| Dựng settings đúng type | Input, Style, Sidebar, Dynamic sources, Fonts, Deprecated | 03, 04 |
| 5.1 Lighthouse performance | Giảm JS, TTFB/FCP/CLS/INP/LCP, điểm Performance | 08 |
| 5.2 Accessibility | Keyboard, structure, dynamic components, điểm, tool | 09 |
| 5.2 "Tính năng" | Link Features trong requirements | 06, 07 |
| 5.3 Browser compatibility | Luồng chức năng chạy tương thích | 12 |
| 5.4 Testing assets | Inventory, local pickup, unit pricing, rich media, selling plans, Shop Pay Installments | 11 |
| 5.5 Test checklist | Header, footer, section, page, cart, search, gift card, share, pickup, unit price, rich media, selling plans | 12 |
| 6.1–6.4 Trải nghiệm người dùng | Hover, loading, transition, feedback | 10 |

### 5. Danh mục file BE

| File | Tiêu đề | Loại |
| - | - | - |
| 00 | Phạm vi Dev BE và cách dùng bộ kiến thức | Tài liệu |
| 01 | Nguyên tắc settings hướng merchant và basic requirements | Quy tắc |
| 02 | Text style, terminology, đặt tên section và preset | Quy tắc |
| 03 | Input settings: chọn đúng type và thuộc tính | Tài liệu |
| 04 | Sidebar settings, conditional, dynamic sources, font, color | Tài liệu |
| 05 | Tích hợp theme editor: JavaScript events và design mode | Quy tắc |
| 06 | Tính năng, template, section, block bắt buộc của Theme Store | Quy tắc |
| 07 | Yêu cầu dữ liệu từng trang, SEO, asset, chức năng | Quy tắc |
| 08 | Hiệu năng Liquid và JavaScript | Quy tắc |
| 09 | Accessibility cho hành vi động (JS) | Quy tắc |
| 10 | Hành vi tương tác UX phía JS | Quy tắc |
| 11 | Chuẩn bị dữ liệu test (Testing assets) | Checklist |
| 12 | Checklist test chức năng theo Shopify review | Checklist |
| 13 | Checklist DoD BE trước khi bàn giao | Checklist |
| 14 | Kinh nghiệm và bài học khi làm BE theme Shopify | Kinh nghiệm |

### 6. Nguồn chính thức đã đối chiếu

- Theme Store requirements: https://shopify.dev/docs/storefronts/themes/store/requirements
- Settings: https://shopify.dev/docs/storefronts/themes/architecture/settings
- Input settings: https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings
- Sidebar settings: https://shopify.dev/docs/storefronts/themes/architecture/settings/sidebar-settings
- Dynamic sources: https://shopify.dev/docs/storefronts/themes/architecture/settings/dynamic-sources
- Fonts: https://shopify.dev/docs/storefronts/themes/architecture/settings/fonts
- Theme editor integration: https://shopify.dev/docs/storefronts/themes/best-practices/editor/integrate-sections-and-blocks
- Performance: https://shopify.dev/docs/storefronts/themes/best-practices/performance
- Accessibility: https://shopify.dev/docs/storefronts/themes/best-practices/accessibility
- Testing assets: https://shopify.dev/docs/storefronts/themes/store/test-theme/assets
- Test checklist: https://shopify.dev/docs/storefronts/themes/store/test-theme/checklist

Số thứ tự mục trên trang requirements đã đổi so với anchor trong Dev.xlsx. Tra theo tên mục.
