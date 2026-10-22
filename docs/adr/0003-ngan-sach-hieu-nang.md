# 0003. Ngân sách hiệu năng cho Lighthouse 96/90/98
Ngày: 2026-10-22 | Trạng thái: Đề xuất (G3 chấp nhận)

## Bối cảnh
Ngưỡng nội bộ cao hơn Theme Store nhiều; ảnh hero lớn và font là rủi ro chính.

## Lựa chọn đã cân nhắc
- A. Chỉ đo cuối dự án — rủi ro phát hiện muộn. Loại.
- B. Ngân sách cứng trong CI từ sprint 1: LCP ≤ 2.0s mobile, critical CSS ≤ 10 KB inline, JS ≤ 40 KB, ảnh hero ≤ 200 KB webp, 1 font preload, còn lại lazy. Chọn.

## Quyết định
B, chặn merge khi dưới ngưỡng; lhci chạy desktop và mobile riêng với dữ liệu benchmark trên efitco-ai-dev.

## Hệ quả
Tốt: không nợ hiệu năng. Xấu: PR FE phải kèm Lighthouse. Đo: lhci trong CI.
