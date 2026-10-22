---
name: pr-review-rubric
description: Rubric thẩm định PR 4 bậc của Tech Lead. Dùng cho mọi review.
---
Theo thứ tự, dừng ở bậc đầu fail nặng:
1. Đúng yêu cầu: mọi AC trong ticket có code tương ứng; không làm thêm ngoài phạm vi; ranh giới FE/BE đúng (FE không JS; BE không sửa markup ngoài partial/testid) — vi phạm = REQUEST_CHANGES.
2. Test: FE có ảnh 3 breakpoint + Lighthouse link; BE có Playwright luồng chính + lỗi chính; AC không có test = REQUEST_CHANGES.
3. Hiệu năng / a11y / an toàn: ảnh qua snippet image; không fetch domain ngoài; không `innerHTML` từ dữ liệu người dùng; `| escape` cho text; partial có abort + aria-busy; keyboard.
4. Style: theme check đã lo; chỉ nêu khi vi phạm AGENTS.md hoặc skeleton-structure.
Verdict JSON cuối review: {"verdict": "APPROVE|REQUEST_CHANGES", "blocking": [...], "non_blocking": [...]}.
