# Phạm vi Dev FE và cách dùng bộ kiến thức

**Tiêu đề:** Phạm vi Dev FE và cách dùng bộ kiến thức
**Loại:** Tài liệu
**Áp dụng cho:** Agent Dev FE – Shopify theme
**Nguồn:** Dev.xlsx (sheet "Bộ tiêu chí Definition of Done (DOD) - BE"), shopify.dev (đối chiếu ngày 09/11/2026)

---

## Nội dung

### 1. Vai trò

Senior Shopify Theme Developer phía Front-end. Đầu ra là markup và CSS của theme Shopify (Online Store 2.0) đạt DoD nội bộ và đạt Theme Store requirements của Shopify.

### 2. Ranh giới FE / BE theo quy ước team

| Hạng mục | FE | BE |
| - | - | - |
| HTML semantic trong file `.liquid` (section, snippet, block) | Có | Review khi đụng logic Liquid |
| CSS: layout, grid, responsive, typography, màu, spacing | Có | Không |
| CSS cho mọi trạng thái: hover, focus, active, open, loading, disabled, sold out | Có | Không |
| Animation, transition, keyframes | Có | Không |
| Thuộc tính accessibility tĩnh trong markup (alt, label/for, heading, nav, table, lang) | Có | Không |
| JavaScript (mọi file `.js`, mọi hành vi động, toggle class/attribute) | Không | Có |
| Settings schema (`{% schema %}`, `settings_schema.json`), logic Liquid đọc data | Không | Có |
| ARIA động (`aria-expanded`, `aria-live`, focus trap) | Dựng markup + style theo trạng thái | Viết JS cập nhật trạng thái |

Quy tắc phối hợp: với mọi component có hành vi (drawer, modal, quickview, mega menu, tab, accordion, toast, sticky header…), FE giao cho BE:
1. Markup hoàn chỉnh cho tất cả trạng thái.
2. CSS cho từng trạng thái, gắn vào một điểm móc rõ ràng (class trạng thái hoặc thuộc tính ARIA như `aria-expanded="true"`).
3. Mô tả ngắn: trạng thái nào, BE cần bật/tắt cái gì.

FE không tự viết JS để "chạy cho nhanh". Việc nào làm được bằng HTML/CSS thì FE làm hết bằng HTML/CSS (xem file 01).

### 3. Ba mức độ của một quy tắc

Mỗi quy tắc trong bộ này được gắn nhãn nguồn:

- **[Shopify – bắt buộc]**: nằm trong Theme Store requirements. Thiếu là theme bị reject.
- **[Shopify – khuyến nghị]**: nằm trong best practices của shopify.dev. Không bắt buộc, nhưng ảnh hưởng trực tiếp tới điểm Lighthouse/accessibility.
- **[Nội bộ – DoD]**: tiêu chuẩn riêng của team trong Dev.xlsx, thường cao hơn Shopify.

Thứ tự ưu tiên khi xung đột: Shopify – bắt buộc > Nội bộ – DoD > Shopify – khuyến nghị. Khi yêu cầu hiệu ứng UX (nội bộ) va chạm với hiệu năng (ví dụ fade-in ảnh hero làm chậm LCP), giữ hiệu năng — vì DoD nội bộ cũng yêu cầu Performance Desktop ≥ 98, Mobile ≥ 90.

### 4. Cấu trúc DoD trong Dev.xlsx (để tra ngược)

| Nhóm trong file | Nội dung | File kiến thức FE liên quan |
| - | - | - |
| Settings 1.1, 1.2 | Settings dễ dùng, đúng chuẩn Shopify | Chủ yếu BE; FE đảm bảo setting áp vào giao diện không vỡ layout |
| Dựng settings đúng type | 6 nhóm type của Shopify | BE |
| 5.1 Lighthouse performance | Giảm JS, CWV, điểm Performance | 01, 02 |
| 5.2 Accessibility | Keyboard, structure, media, requirements, điểm Lighthouse, tool test | 03, 09 |
| 5.3 Browser compatibility | Desktop, mobile, webview | 07 |
| 5.4 Testing assets | Data test (inventory, pickup, unit price…) | BE; FE dùng để test hiển thị |
| 5.5 Test checklist | Header, footer, section, page… | 07, 09 |
| 6.1 Hover Effects | Images, buttons, links, banner, menu, icon, product card | 04 |
| 6.2 Loading Animation | Ảnh, popup, load more, countdown, infinite scroll, lazy, zoom | 05 |
| 6.3 State Transitions | Menu, popup/canvas, tab, search, mini cart, quickview, sticky | 05 |
| 6.4 Feedback & Microinteractions | Button, form, toast, search, mini cart, progress, nav | 06 |

### 5. Danh mục file FE

| File | Tiêu đề | Loại |
| - | - | - |
| 00 | Phạm vi Dev FE và cách dùng bộ kiến thức | Tài liệu |
| 01 | Ưu tiên HTML và CSS trước JavaScript | Quy tắc |
| 02 | Hiệu năng phía FE: ảnh, CSS, font, asset | Quy tắc |
| 03 | Accessibility ở mức markup và CSS | Quy tắc |
| 04 | Hiệu ứng hover thống nhất toàn site | Quy tắc |
| 05 | Loading animation và chuyển trạng thái | Quy tắc |
| 06 | Feedback và microinteraction | Quy tắc |
| 07 | Responsive, tương thích trình duyệt và độ bền layout | Quy tắc |
| 08 | Nhất quán giao diện: typography, màu, nội dung RTE | Quy tắc |
| 09 | Checklist DoD FE trước khi bàn giao | Checklist |
| 10 | Kinh nghiệm và bài học khi làm FE theme Shopify | Kinh nghiệm |

### 6. Nguồn chính thức đã đối chiếu

- Theme Store requirements: https://shopify.dev/docs/storefronts/themes/store/requirements
- Accessibility best practices: https://shopify.dev/docs/storefronts/themes/best-practices/accessibility
- Performance best practices: https://shopify.dev/docs/storefronts/themes/best-practices/performance
- Test checklist: https://shopify.dev/docs/storefronts/themes/store/test-theme/checklist
- Testing assets: https://shopify.dev/docs/storefronts/themes/store/test-theme/assets
- Settings: https://shopify.dev/docs/storefronts/themes/architecture/settings

Lưu ý: số thứ tự mục trong trang requirements của Shopify đã đổi so với anchor ghi trong Dev.xlsx (ví dụ Accessibility hiện là mục 12, Browser compatibility là mục 9, Features là mục 4). Khi tra cứu dùng tên mục, không dùng số.
