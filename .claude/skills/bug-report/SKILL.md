---
name: bug-report
description: Template bug report và bảng mức P1–P4 của team. Dùng khi tạo bug.
---
```
BUG <ticket>-NN  <một dòng>
Mức: P1 Critical / P2 High / P3 Medium / P4 Low (lý do theo bảng)
Môi trường: preview <URL>, theme_id, commit, thiết bị/breakpoint
Bước: 1. 2. 3.
Mong đợi: (trích AC)
Thực tế:
Ảnh/video:
Log/console/request:
Nghi ngờ nguyên nhân (file:dòng) — không bắt buộc
```
Mức: P1 sập, mất giỏ, không checkout, lỗ hổng; P2 chức năng chính không dùng được, không có cách vòng, Sidekick phá cấu trúc; P3 sai nhưng có cách vòng, lỗi UI thấy rõ; P4 lệch nhỏ. Không hạ mức; techlead có thể đổi kèm lý do. Thiếu bước tái hiện thì bug bị trả lại.
