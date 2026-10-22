# 0004. Giữ nguyên cấu trúc Skeleton để Sidekick sửa được
Ngày: 2026-10-22 | Trạng thái: Chấp nhận (CTO 22/10/2026: xây theo Skeleton block-first; Shopify đang cập nhật docs Theme Store cho kiến trúc này)

## Bối cảnh
Canvas/Sidekick làm việc trực tiếp trên file theme và được huấn luyện trên kiến trúc Skeleton (README: 'edited by coding agents'). Lệch cấu trúc = Sidekick sửa sai.

## Lựa chọn đã cân nhắc
- A. Tự thêm abstraction (helper snippet phức tạp, build step, SCSS) — team quen; Sidekick lạ. Loại.
- B. Tuân AGENTS.md 100%, mỗi block có {% doc %} đầy đủ, settings phẳng, không build step. Chọn.

## Quyết định
B. AGENTS.md là nguồn sự thật số 1; mọi PR vi phạm bị chặn ở review bậc 1; mỗi sprint kiểm chứng bằng 3 yêu cầu Sidekick mẫu.

## Hệ quả
Tốt: Sidekick sửa đúng. Xấu: mất một số tiện ích quen. Đo: checklist Canvas bước 4, theme check 0 lỗi sau Sidekick sửa.
