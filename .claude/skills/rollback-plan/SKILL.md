---
name: rollback-plan
description: Kế hoạch rollback version theme trên store dev/Canvas. Dùng khi chuẩn bị release.
---
Rollback = chuyển về theme version trước đã có trên store (không xoá): giữ ít nhất 2 version trước, đặt tên `<name>-<version>`; bước: xác nhận version đích → `shopify theme list` lấy id → người publish (agent không publish) → smoke 5 trang → ghi thời gian. Trên Canvas: theme đã sửa trong Canvas không rollback được bằng file; rollback = chuyển sang theme trước trong Canvas. Chạy thử mỗi sprint trên hoa-qua-nhap-khau (efitco-ai-dev), mục tiêu ≤ 15 phút.
