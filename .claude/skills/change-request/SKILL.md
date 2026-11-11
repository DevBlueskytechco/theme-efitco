---
name: change-request
description: Xử lý CR: gọi techlead/ba/qa đánh giá tác động rồi quyết. Dùng cho PO Agent.
---
`drafts/po/<ticket>/cr.md`: Mô tả CR + nguồn; Tác động kỹ thuật (subagent techlead: giờ, file, rủi ro); Tác động nghiệp vụ (ba: FR/story đổi); Tác động test (qa: TC đổi/thêm); Quyết định: Chấp nhận (sprint N, đẩy story X ra) / Từ chối / Hoãn + lý do; Việc phải cập nhật: SRS, backlog, kế hoạch. CR < 4 giờ và không đổi kiến trúc: quyết trực tiếp, vẫn ghi.
Khi CR là yêu cầu dự án (REQ-xxxx) đã có ticket phân tích riêng cho ba/techlead/qa: subagent chỉ trả tác động ngắn, không làm lại việc của ticket anh em; ghi mã ticket anh em vào cr.md. Bắt buộc thêm 2 mục: (1) Ticket đang mở lỗi thời — đề xuất đóng/sửa body/gộp, không tự đóng; (2) [Q] đang mở chặn — xếp thứ tự CTO cần chốt, ghi [Q] nào đã có đáp trong sổ quyết định. Đầu ra theo tiêu đề ticket yêu cầu (vd `impact.md`) thì cr.md chỉ tóm tắt quyết định và trỏ sang.
