---
name: test-case-gwt
description: Viết test case Given/When/Then từ AC, kèm case biên, theo template team. Dùng cho mọi ticket QA loại test_case_from_story.
---
Template `drafts/qa/<ticket>/test-cases.md`:
```
# <ticket> — <tên story>
Nguồn: docs/srs.md#<mục>, ticket <id>, Figma node <id>
| ID | AC | Given | When | Then | Loại | Ưu tiên |
| TC-01 | AC1 | ... | ... | ... | UI/E2E/a11y/perf | P1–P3 |
## Case biên (ngoài AC)
## Dữ liệu test (sản phẩm, collection trên hoa-qua-nhap-khau (efitco-ai-dev))
## KHÔNG CHẮC
```
Quy tắc: mỗi AC ≥ 1 TC; tách TC khi AC có 2 điều kiện; luôn có nhóm biên: rỗng, tối đa, mất mạng, 360px, keyboard, screen reader, editor (`design_mode`) vs storefront, merchant chưa chọn resource. Then phải quan sát được (text, trạng thái, URL, request). Chạy `ac_coverage.py` trước khi nộp.
