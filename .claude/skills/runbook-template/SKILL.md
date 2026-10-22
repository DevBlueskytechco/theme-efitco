---
name: runbook-template
description: Template runbook sự cố cho theme/preview. Dùng khi viết docs/runbook.md.
---
Mỗi sự cố: Triệu chứng → Cách xác nhận (lệnh/log) → Xử lý từng bước → Rollback nếu có → Phòng ngừa. Tối thiểu 5: push fail do theme check; preview trắng do settings_data; Lighthouse tụt; store dev hết slot theme; CLI mất auth. Thêm cho Canvas: nâng cấp theme đã sửa trong Canvas (upload zip mới, diff settings, chuyển theme).
