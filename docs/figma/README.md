# Figma snapshot — nguồn Figma cho agent (không gọi API mỗi lần)

Lý do: file Efitco T10 (Copy) nằm ở plan Starter. Figma REST giới hạn endpoint Tier 1 (GET file, GET nodes, GET image)
cho seat View/Collab **tối đa 20 request/tháng** (developers.figma.com/docs/rest-api/rate-limits). Agent gọi trực tiếp sẽ hết hạn mức sau vài ticket.

Cách làm:
- `snapshot-1-359.json`: toàn bộ cây node frame Homepage 1:359 (lấy 30/10/2026, Figma lastModified 28/10). MCP `figma` đọc node từ file này — 0 request.
- `img/<node>.png`: ảnh tham chiếu từng block, CTO export tay từ Figma (chuột phải frame → Export, PNG 2x, tên file theo node id, dấu `:` thay bằng `-`, ví dụ `1-422.png`). Export tay không tính hạn mức API.
- `img/<node>.lowres.png`: bản cắt 0,25x từ ảnh render 22/10, chỉ dùng xem bố cục khi chưa có bản 2x.

Làm mới snapshot (tốn 1 request Tier 1, chỉ CTO chạy khi Designer sửa Figma):
`cd ../ai-team && source ops/env.sh && FIGMA_ALLOW_API=1 python3 ops/figma_snapshot.py`

Block → node: 1:362 header · 1:422, 1:437 slideshow · 1:395 categories · 1:453 rich text + level · 1:490 bestseller · 1:506 quiz · 1:560 shop the look · 1:625 inspiration · 1:636 bundle · 1:759 featured product · 1:817 video · 1:885 testimonial · 1:992 why choose · 1:1022 blog · 1:1057 FAQ · 1:1104 footer.
