KHÔNG CHẮC: (1) G0 chưa xác nhận được: gh bị từ chối mạng, không đọc được run develop sau 01bd3c9; số skip 429 chưa có; ES1-T172 còn Open. Ticket cấm chạy khi G0 chưa đạt, nên chỉ push sau khi Orchestrator xác nhận G0. (2) Tên 4 handle figma-* do Dev FE đặt, nguồn chỉ ghi figma-*. Cả 2 đã hỏi ở ticket question. (3) Chưa render trên store: mọi kết quả playwright, axe, lhci chờ CI.

# ES1-T175 TE-17-FE0: template cổng /?view=figma, bỏ multicolumn và custom liquid khỏi trang chủ (CR-5)

## Thay đổi
- `templates/index.figma.liquid` (mới): 10 band, cùng thứ tự block với `templates/index.liquid`.
- `templates/index.liquid`: bỏ container `home-multicolumn`, `home-custom-liquid`. Giữ file block và `index.te7`.
- `drafts/dev-fe/ES1-T175/ES1-T175.spec.ts`: spec mới.
- `drafts/dev-fe/ES1-T175/ES1-T121.spec.ts.patch`: sửa test trang chủ của ES1-T121. Ticket ghi dòng 201, test thực tế ở dòng 204.

## Orchestrator cần làm trước khi push
scope-guard chặn dev-fe ghi `tests/`:
- `git apply drafts/dev-fe/ES1-T175/ES1-T121.spec.ts.patch`
- Chép `drafts/dev-fe/ES1-T175/ES1-T175.spec.ts` sang `tests/e2e/ES1-T175.spec.ts`

## Quyết định
- Tài nguyên: `figma-images`, `figma-featured-collection`, `figma-bundle`, `figma-featured-product`. Thiếu hoặc rỗng thì dùng `collections.all`. Không đổi `store-data.json`.
- Ảnh: `featured_image` của sản phẩm trong collection trên, không dùng object `images` (Q3 chưa trả lời). Cần ảnh để vùng che khi so ảnh có đúng kích thước.
- Id band đổi `home-*` thành `figma-*`, để test phân biệt được template nào đang phục vụ. Band đầu trên `index` không có id, ở đây đặt `figma-hero` để đo thứ tự.
- `rich-text`, `slideshow` không có `@param id` nên không truyền id. `testimonials`, `faq` giữ như `index`.
- `<div hidden data-testid="figma-meta">` ghi handle đang dùng, để spec biết nguồn tài nguyên mà không gọi thêm request.

## Cần người chấm lưu ý
- Quiz có chữ viết thẳng trong template, không qua `| t`: bước quiz thiếu câu hỏi và 2 lựa chọn thì không render, trong khi ticket cấm sửa block và locales. Giá trị lấy từ `index.te11`; bước 2, 3 là chữ giữ chỗ (ES1-T135 #8). Bỏ khi TE-17-FE1c đưa nội dung vào mặc định.
- Các block còn lại dùng chữ mặc định hiện tại, chưa phải copy Figma (giai đoạn 2). Trên `?view=figma` hiện chưa so được copy.
- SRS TE-7 AC4, AC5 vẫn thỏa: block còn và test trên `?view=te7`, chỉ không nằm trên trang chủ.
- `scripts/theme-zip.sh` đang đóng cả `templates/`, nên file này vào zip tới khi có TE-17-DEVOPS1.
- lhci chưa đo `?view=figma`: cấu hình thuộc TE-17-DEVOPS1. DoD Lighthouse trên template này chưa có số cho tới lúc đó.

## Tự kiểm tra
- `shopify theme check --path .`: 85 file, 0 lỗi.
- `grep -c "multicolumn\|custom-liquid" templates/index.liquid`: 0.
- `git apply --check` patch ES1-T121: đạt.
- Diff không có file JS, không đổi `critical.css`, `base.css`, `locales`, `blocks/`.
- Chưa type-check spec.
- Playwright ES1-T175, ES1-T121 (desktop + Pixel 7), axe, lhci, ảnh 3 breakpoint: chờ CI.
- G0: chưa xác nhận.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
