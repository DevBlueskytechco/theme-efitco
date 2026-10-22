---
name: ui-diff
description: So ảnh preview với Figma, báo lệch theo mức. Dùng cho Designer Agent.
---
Chụp preview 3 breakpoint bằng mcp__store-dev__screenshot; lấy ảnh node Figma cùng breakpoint; so: bố cục (P2), khoảng cách/màu/chữ (P3), lệch ≤ 2px (P4). Báo `drafts/designer/<ticket>/ui-diff.md`: bảng Block | Breakpoint | Lệch | Mức | Ảnh. Không tự sửa code; P2/P3 → ticket cho dev-fe.
