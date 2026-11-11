---
name: task-split-fe-be
description: Chia story thành task FE/BE theo quy ước team, tên cụ thể, giải pháp là quyết định, DoD có lệnh. Dùng khi techlead chia task.
---
Quy tắc: mỗi task thuộc hẳn một phía; JS = BE; markup/CSS/schema/locale = FE. Không chia quá nhỏ: 1 block = 1 task FE (+1 BE nếu có JS). 3–5 point (≈ ≤ 1 ngày, 1 point ≈ 1,5 giờ, ES1-T310 #4); hơn thì tách theo block. Phần Should tách task riêng để cắt không đụng task Must; mỗi task ghi story, sprint, Should.
Tên: `<story>-FE1: <file(s)> + <số lượng> + <phạm vi>` — ví dụ `TE-3-FE1: blocks/featured-collection.liquid + snippets/product-card.liquid, 6 settings, grid 2–5 cột, badge sale, placeholder editor`.
Cột Giải pháp = quyết định kỹ thuật + đầu ra (không bước thao tác). Cột DoD = lệnh chạy + điều kiện pass (theme check 0, lhci ngưỡng, playwright file, visual diff). DoD task BE ghi trần byte từng file chạm và phép cộng theo trang theo ADR 0010; task FE ghi trần `critical.css` 10 240 B và base.css gzip 49 152 B.
Bảng hợp đồng FE/BE bắt buộc 6 cột: custom element (ai đặt thẻ host), hook `data-*`, `data-testid`, partial, lớp `data-layer`, thanh đáy `data-bottom-bar`. Thẻ `<script>` và `data-lazy-module`/`data-lazy-on` trong block thuộc task BE.
Thứ tự: FE trước (có testid + tên partial), BE sau. Tạo ticket con qua mcp__ticket__create với trường `side: fe|be`, `points`, `blocked_by`.
