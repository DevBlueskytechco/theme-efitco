KHÔNG CHẮC: chưa xem được preview ?view=te7 ở 360 (agent không có preview, lệnh chạy Chromium cần phê duyệt nên không chạy, api.github.com bị từ chối nên không đọc được log CI). Kết luận "test đo sai" suy từ số CI và CSS, CI của PR này là bước xác nhận. Patch đỏ tiếp thì chữ đè ảnh là thật, trả lại ticket để sửa CSS.

# ES1-T172: TE-7-FE3-FIX: AC3 360 đỏ do test đo sai, không sửa CSS

## Việc Orchestrator cần làm
Scope-guard chặn dev-fe ghi tests/, nên chưa có diff code nào. Trước khi push:
git apply drafts/dev-fe/ES1-T172/ES1-T120.spec.ts.patch

## Nguyên nhân
Helper `box()` trong tests/e2e/ES1-T120.spec.ts gọi `scrollIntoViewIfNeeded()` rồi `boundingBox()`, mà giá trị này tính theo viewport. Test gọi `box(image)` rồi `box(content)`, trang cuộn giữa 2 lần đo nên hai giá trị y không cùng hệ quy chiếu.

Bằng chứng từ run 42160292639 (viewport 360x740):
- Ảnh cao 360 * 876 / 920 = 342.78, khớp phần lẻ của 541.78. Vậy image.y = 199, gần đúng (740 - 342.78) / 2 = 198.6: ảnh được cuộn vào giữa viewport.
- content.y = 225.78, cùng phần lẻ .78 với đáy ảnh 541.78. Hai số lệch nhau đúng 316.00, là số nguyên, khớp với một lần đổi scrollY: chữ nằm sát đáy ảnh rồi trang cuộn thêm 316 px.
- 740 - 225.78 = 514.22: đáy chữ chạm đáy viewport nếu khối chữ cao khoảng 514. Ước tính từ CSS: padding 96 + eyebrow 16 + 24 + heading 2 dòng 96 + 24 + body 6 dòng 168 + 40 + nút khoảng 50 = 514. Số dòng là giả định, chưa đo.

Đọc CSS dưới 64rem cũng không thấy đường nào gây đè:
- `.image-with-text--split` là grid 1 cột, hàng auto.
- `.image-with-text__media` có chiều cao từ `::before` ở luồng thường; chỉ img và `::after` là absolute, nằm trong media.
- `.image-with-text__panel` không có margin âm, không absolute.
- Accent ẩn dưới 80rem.

Nhận định "chữ cách đỉnh ảnh 26 px" trong ticket đến từ việc so 2 y này. Assert ở dòng 92 đúng ý nghĩa, chỉ helper sai.

## Thay đổi
- Patch `box()`: đo bằng `getBoundingClientRect()` trong 1 lần evaluate, y cộng `window.scrollY`. x giữ theo viewport vì test so với 1279 và 360.
- Assert không đổi, không nới ngưỡng: chữ đè ảnh thật vẫn đỏ.
- Sửa ở helper nên các so sánh y khác cùng spec (dòng 154, 167, 168, 171) cũng hết phụ thuộc cuộn trang.
- Không đổi blocks/image-with-text.liquid, assets/base.css, critical.css. Từ 64rem giữ nguyên 2 cột Figma 1:992.
- Helper bỏ `expect` not null: `scrollIntoViewIfNeeded()` đã timeout nếu phần tử không hiển thị.

Đã grep tests/e2e/TE-3, ES1-T45, ES1-T73, ES1-T121 (các spec khác có `scrollIntoViewIfNeeded`): không thấy so y qua các lần cuộn kiểu này, không sửa.

## Tự kiểm tra
- `shopify theme check`: 84 file, 0 lỗi; không đổi Liquid/CSS.
- `git apply --check` patch: đạt.
- `npx playwright test --list -g "AC3 360"`: 6 test trên desktop và mobile, trước patch. Chưa type-check (không có tsc).
- `playwright test tests/e2e/ES1-T120.spec.ts -g "AC3"` trên preview: chờ CI.
- Ảnh 360 và 1280: chờ CI, ticket yêu cầu đính kèm trong PR.
- Không file JS; không CSS mới nên không có literal màu hay thuộc tính vật lý mới.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
