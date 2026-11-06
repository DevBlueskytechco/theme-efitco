KHÔNG CHẮC: (1) index.liquid không truyền handle figma-tab-*, lệch comment Tech Lead trên ticket, vì trái với "không cấu hình tab thì giống develop"; hỏi ở ES1-T210, có mặc định, không chặn. (2) 4 nhãn nằm ở default schema, không có param riêng; template vẫn đặt được bằng tab_N_label. (3) Chưa render trên preview: chỉ theme check và đọc code; dữ liệu figma-tab-* do ES1-T178 nhập.

# ES1-T188 TE-3-FE4: featured-collection 4 tab, hàng 5 (Figma 1:490)

## Thay đổi
- `blocks/featured-collection.liquid`: thêm 3 collection, 4 nhãn; panel 2-4 render trong thẻ template; tab không JS là link tới `collection.url`; tab rỗng hiện thông báo từ locale.
- `assets/base.css`: hàng tab, bố cục heading + tab. Không đụng `critical.css`.
- `locales/en.default.json`: `tab_empty`, `tabs_label`. `locales/en.default.schema.json`: 7 label, 2 info.
- `templates/index.figma.liquid`: truyền `default_tab_2/3/4_collection`.
- Không có JS, không có token mới, 0 màu literal, logical properties.

## Quy tắc
- Tab hiện khi có collection, kể cả collection rỗng. Dưới 2 tab: không có thanh tab, không `collection-tabs`, không panel; lưới vẫn là con trực tiếp của section như develop.
- Tab 1 không có nguồn thì tab đầu tiên có collection lên thay, `data-tab` đánh số theo tab đang hiện.
- Nhãn rỗng dùng tên collection.
- Id input theo `block.id-tab-N`: cùng sản phẩm ở 2 tab không trùng id sau khi clone.
- Trình duyệt không tải ảnh trong thẻ template, nên tab ẩn 0 request ảnh, không cần JS.
- Hiện cả block khi có từ 2 tab dù mọi tab rỗng: thông báo rỗng là nội dung (AGENTS.md, ngoại lệ trang rỗng). Dưới 2 tab rỗng: như cũ, placeholder trong editor, storefront không render.

## Hook cho ES1-T189
`data-collection-tabs` (root), `collection-tabs` (bọc nội dung), `data-tab-list`, `data-tab="N"`, `data-tab-panel="N"`, `data-tab-panel-template="N"`, `data-tab-empty`. Testid: `featured-collection-tabs`, `-tab`, `-panel`, `-tab-empty`. Chi tiết đã comment trên ES1-T189. `data-tab-list`, `data-tab-panel`, `collection-tabs` thêm ngoài danh sách ticket: BE cần chỗ gắn role, `aria-controls` và custom element, còn T189 chỉ cho sửa Liquid ở script và `data-lazy-module`.

## Số đo Figma 1:496
Tab cao 40, padding ngang 28, gap 8, bo 8, Inter 600 16/26, letter-spacing -0.16. Chọn #1A1A1A chữ trắng, chưa chọn #F4F4F5 chữ #1A1A1A: dùng `--color-foreground`, `--color-background-alt` (#F4F4F4, lệch 1 mức xanh, không thêm token theo ticket). Bo 8 = `--radius-button` x 2. Vùng bấm 44 bằng `::before` (ES1-T174).
Mobile theo ES1-T174: 360 cuộn ngang tới mép, không snap; 768 một hàng dưới heading; từ 64rem heading trái, tab phải.
Lưới 4 cột từ 48rem khi đúng 4 sản phẩm: spec ES1-T174 ghi thuộc ES1-T190, chưa làm ở đây.

## Tests
- `drafts/dev-fe/ES1-T188/ES1-T188.spec.ts`: Orchestrator chép sang `tests/e2e/ES1-T188.spec.ts` (scope-guard chặn tests/). Chưa chạy, chưa type-check.
- `tests/e2e/TE-3.spec.ts`: không sửa. Đã đọc các assert liên quan (schema TC-04, lưới, view all): `/` không cấu hình tab nên vẫn đúng cấu trúc cũ. Phần ES1-T175 `toHaveCount(1)` cho lưới trên `/?view=figma`: nội dung template không nằm trong DOM nên vẫn 1.
- `drafts/dev-fe/ES1-T188/AGENTS.md.patch`: sửa dòng featured-collection trong Theme map, scope-guard chặn AGENTS.md; `git apply --check` đạt, Orchestrator apply.

## Tự kiểm tra
| Mục | Kết quả |
| --- | --- |
| `shopify theme check` | 92 file, 0 offense |
| JSON 2 file locale | parse được, gộp vào nhóm có sẵn |
| `wc -c assets/critical.css` | 9921, không đổi |
| `assets/*.js` | không có trong diff |
| Playwright desktop + Pixel 7 | chưa chạy: e2e tắt trên CI (`RUN_STORE_TESTS=false`, CTO 06/11) |
| axe, console, tràn ngang 360, 768 | chưa chạy, cùng lý do |
| Lighthouse | chưa chạy, cùng lý do |
| Ảnh 360, 768, 1280, 1920 | chờ preview; không tự chụp được trong phiên này |
| Visual diff với 1:490 | chưa chạy |

🤖 Generated with [Claude Code](https://claude.com/claude-code)
