KHÔNG CHẮC: ui_diff chưa chạy được trên storefront: store dev chặn bằng password và tool không có bước mở khoá. Chưa có kết quả so block thật. Ticket ES1-T200 #1.

# ES1-T174 — Chạy thử ui_diff (D3)

## Lệnh và kết quả

| # | Lệnh | Kết quả | Ảnh |
| --- | --- | --- | --- |
| 1 | `mcp__store-dev__screenshot` url `https://hoa-qua-nhap-khau.myshopify.com/`, width 1280 | Tool chạy, ảnh ra đúng rộng 1280. Nội dung là trang password "efitco-ai-dev" | `drafts/designer/ES1-T174/ui-diff-trial-1280.png` |
| 2 | Như trên, width 1920 | Tool chạy, ảnh ra đúng rộng 1920. Vẫn là trang password | `drafts/designer/ES1-T174/ui-diff-trial-1920.png` |
| 3 | `mcp__store-dev__screenshot` url `file:///.../drafts/designer/ES1-T174/seal-check.html`, width 1440 | Chạy được, so được ảnh Figma với SVG chồng lớp | `drafts/designer/ES1-T174/seal-check.png` |
| 4 | `mcp__figma__export_image` node 1:761 | Lỗi: chưa có `1-761.png`. Tool chỉ trả ảnh đã có trong `docs/figma/img/` | Không có |

## Kết luận

- Chụp ảnh: chạy được, kể cả 1920. Mô tả tool chỉ ghi 360/768/1280, thực tế nhận 1920 là cỡ cổng so Figma cần.
- Chụp storefront: KHÔNG. Tool nhận `url`, `width`, `out`, `full_page`, không mở khoá như `tests/setup/password.ts`. Không thử lấy mật khẩu và không có theme id thật để thử `preview_theme_id` (số 101 trong `scripts/shopify-cli.test.sh` là dữ liệu test).
- So ảnh: `skills/ui-diff` là so bằng mắt, không có bước đo pixel. Mức P2, P3 chấm được; P4 (≤ 2px) và ngưỡng 1% phải lấy từ ES1-T176.
- Ảnh tham chiếu: `1-395`, `1-1022` có nền trong suốt, mở ra nền đen (đã thấy, khớp ES1-T168 1.3 #4). Khi so phải ghép nền theo band. Figma không có `1-454.png`, `1-464.png`, phải cắt từ `1-453.png`.

## Bảng lệch (chỉ phần so được)

Đây là so SVG nháp với ảnh Figma trên máy, không phải so storefront.

| Block | Breakpoint | Lệch | Mức | Ảnh |
| --- | --- | --- | --- | --- |
| Dấu 1:761, icon | Phóng 4 lần | Không thấy lệch bằng mắt | Chưa đo số | `seal-check.png` |
| Dấu 1:761, chữ vòng | Phóng 4 lần | FEATURE khớp; EFITCO, PRODUCT lệch vài px. Máy đo không có Inter, dùng font thay thế | P3, đo lại trên store có Inter | `seal-check.png` |

## Việc tiếp

ES1-T197 chờ ES1-T200 #1. Mặc định: thêm mở khoá vào `../ai-team/mcp/store_dev_server.py`. Chưa có thì Designer chấm trên ảnh artifact của ES1-T176.
