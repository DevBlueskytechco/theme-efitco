---
name: task-split-fe-be
description: Chia story thành task FE/BE theo quy ước team, tên cụ thể, giải pháp là quyết định, DoD có lệnh. Dùng khi techlead chia task.
---
Quy tắc: mỗi task thuộc hẳn một phía; JS = BE; markup/CSS/schema/locale = FE. Không chia quá nhỏ: 1 block = 1 task FE (+1 BE nếu có JS). ≤ 8 point; hơn thì tách theo block.
Tên: `<story>-FE1: <file(s)> + <số lượng> + <phạm vi>` — ví dụ `TE-3-FE1: blocks/featured-collection.liquid + snippets/product-card.liquid, 6 settings, grid 2–5 cột, badge sale, placeholder editor`.
Cột Giải pháp = quyết định kỹ thuật + đầu ra (không bước thao tác). Cột DoD = lệnh chạy + điều kiện pass (theme check 0, lhci ngưỡng, playwright file, visual diff).
Thứ tự: FE trước (có testid + tên partial), BE sau. Tạo ticket con qua mcp__ticket__create với trường `side: fe|be`, `points`, `blocked_by`.
