---
name: srs-template
description: Template SRS theo module cho theme. Dùng cho BA Agent.
---
`drafts/ba/<ticket>/srs.md` (hook chặn BA ghi `docs/`; Orchestrator chép sang `docs/srs.md`): Mục tiêu module; Yêu cầu chức năng (FR-<mod>-NN, mỗi cái 1 câu kiểm chứng được + mã R Theme Store nếu có); Yêu cầu phi chức năng (perf, a11y, Canvas); Bảng setting — mỗi story một bảng duy nhất gom mọi setting mới của các spec (block | setting id | label | kiểu | default | giới hạn | spec §); Bảng ui-spec → AC (bắt buộc): mỗi file `docs/ui-spec/*.md` một dòng (ui-spec | story | AC có | AC thiếu | ticket), không file ui-spec nào không có story; Luồng (merchant / khách); Ngoài phạm vi; Câu hỏi mở (KHÔNG CHẮC).
