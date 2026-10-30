# Token — chỗ phải đổi để hợp chuẩn Theme Store (chuẩn nội bộ)

Nguồn: docs/figma-inventory.md, docs/tokens.json (22/10/2026).

| # | Vấn đề | Trong Figma | Yêu cầu | Đề xuất | Quyết |
| --- | --- | --- | --- | --- | --- |
| 1 | Font heading | Sofia Sans Condensed 700/800 | phải có trong Shopify font library | ĐÃ GIẢI QUYẾT: có trong font library (18 biến thể, CTO kiểm 27/10) → font_picker mặc định Sofia Sans Condensed, không tự host. Dev FE xác nhận handle khi làm TE-1 | CTO 27/10 |
| 2 | 2 font lẻ dùng 1 lần | Sofia Sans 800, Host Grotesk 700 | 1 font heading + 1 font body | gộp vào heading | Designer |
| 3 | 3 xám chữ phụ, 2 màu không đạt AA | #4D4D4D, #999999 (2.85:1), #808080 (3.95:1) | contrast AA 4.5:1 cho chữ thường | ĐÃ GIẢI QUYẾT: `muted` #4D4D4D (8.45:1) giữ; `muted_light` đổi #999999 và #808080 → #6B6B6B (5.33 trắng / 4.85 #F4F4F4 / 4.88 #F5F5F1); `muted_on_dark` #999999 chỉ trên nền #1E1E1E (5.85:1). Designer cập nhật Figma theo | CTO 27/10 |
| 4 | 2 xám nền trùng | #F4F4F4, #F4F4F5 | 1 token | gộp → #F4F4F4 | Designer |
| 5 | Chữ trắng trên ảnh hero không có overlay cố định | overlay là ảnh | contrast AA | thêm setting overlay_opacity mặc định 30% | Dev FE |
| 6 | Không có Styles/Variables trong Figma | — | Dev không bám được thay đổi | Designer tạo Color styles + Text styles theo tokens.json, đặt tên trùng token | Designer |
| 7 | Không có mobile | chỉ 1920 | theme phải responsive | ĐÃ QUYẾT: Dev FE tự suy mobile theo skill responsive-a11y; không chờ Designer vẽ mobile. QA duyệt mobile theo convention | CTO 27/10 |

## Quyết định CTO 30/10/2026 về file Figma
- Figma giữ nguyên màu chữ #999999/#808080 và 2 font lẻ (node 1:888 Sofia Sans 800, node 1:1169 Sofia Sans Extra Condensed 800). Không sửa Figma thêm.
- Nguồn sự thật cho code là docs/tokens.json, không phải màu đọc từ Figma: chữ phụ trên nền sáng dùng `--color-muted-light` #6B6B6B (AA), #999999 chỉ trên nền tối. Theme cho 2 setting font (heading, body); 2 layer font lẻ render bằng font heading.
- ui-diff (Designer Agent) KHÔNG báo lệch cho 2 điểm này: màu chữ phụ #6B6B6B thay #999999/#808080, và font 2 layer trên.
- Figma đã có 16 Color styles + 5 Text styles theo tokens.json (CTO tạo 27–30/10).
