---
name: rubric-scoring
description: Cách chấm rubric YAML 0/1/2 có bằng chứng, trả JSON. Dùng cho gate-reviewer.
---
Đọc rubric: `criteria[].id/text/scale{0,1,2}`, `pass_threshold`. Với mỗi tiêu chí: tìm bằng chứng trong artifact (trích ≤ 20 từ hoặc số dòng); chọn mức khớp mô tả thang; không có bằng chứng = 0. total/max ≥ pass_threshold → pass. Có đáp án tham chiếu: so nội dung, không so câu chữ. Trả JSON đúng schema, không chữ ngoài JSON.
