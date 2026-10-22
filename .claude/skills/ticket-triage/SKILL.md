---
name: ticket-triage
description: Phân loại ticket hỗ trợ thành bug / câu hỏi / yêu cầu mới và chuyển đúng agent. Dùng cho Writer/Support.
---
- bug: có hành vi khác mong đợi, có thể tái hiện → gắn `type=bug`, assignee qa, trích bước tái hiện từ ticket; thiếu bước → hỏi lại merchant bằng template 3 câu.
- câu hỏi: hỏi cách dùng/cấu hình → trả lời từ `docs/merchant/`, trích link mục; không có trong tài liệu → đánh dấu `doc-gap`, trả lời sau khi writer viết.
- yêu cầu mới: muốn tính năng/setting chưa có → `type=feature`, assignee po, tóm tắt 1 dòng + giá trị merchant nêu.
Không hứa thời hạn; mẫu trả lời: xác nhận đã nhận, loại ticket, bước tiếp theo.
