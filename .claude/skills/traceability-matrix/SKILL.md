---
name: traceability-matrix
description: Ma trận yêu cầu → story → test case. Dùng cho BA và QA.
---
`drafts/ba/<ticket>/traceability.md` (không ghi `docs/traceability.md`): bảng FR/AC | Story | ui-spec § | Mốc (360/768/1280/1920) | Trạng thái giao diện (mặc định/rỗng/lỗi/đang tải/không JS) | TC | Mã R | Trạng thái. AC giao diện phải điền Mốc và Trạng thái giao diện. Mã AC-H* và TC-H* (trang chủ) dùng bên cạnh FR-*. Không FR mồ côi (không story), không story mồ côi (không FR), không AC mồ côi (không TC) — `traceability.py` kiểm.
