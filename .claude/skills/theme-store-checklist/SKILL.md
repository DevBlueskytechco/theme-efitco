---
name: theme-store-checklist
description: Checklist chất lượng theo Theme Store requirements (mã R) — chuẩn nội bộ, chạy cuối sprint. Dùng cho QA và gate-reviewer.
---
Chạy theo `docs/checklist-theme-store.md`; mỗi dòng mã R có cột Pass/Fail/N/A + bằng chứng (URL, ảnh, lệnh). Nhóm bắt buộc cho theme Canvas: R4 tính năng, R6 Lighthouse (ngưỡng nội bộ 96/90/98), R7 trang, R8 nhất quán, R9 trình duyệt, R10 assets, R11 SEO, R12 accessibility, R13 social, R14 settings, R15 font, R16 màu, R17 ảnh. Nhóm chỉ tham khảo (không chặn): R1, R2, R5 (JSON template/section — không áp dụng với Skeleton block-first), R18, R20, R21, R22.
Fail → bug theo `bug-report`, gắn mã R. Báo cáo `drafts/qa/<ticket>/theme-store-checklist.md` kèm tỷ lệ pass theo nhóm.
