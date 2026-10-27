# 0001. Design token từ Figma → settings_schema + css-variables
Ngày: 2026-10-22 | Trạng thái: Đề xuất (G3 chấp nhận)

## Bối cảnh
Figma Efitco T10 có token màu/chữ/khoảng cách. Theme Store R15/R16 yêu cầu font_picker, ≥ 4 màu có foreground. Sidekick cần đổi màu/chữ qua settings, không sửa CSS.

## Lựa chọn đã cân nhắc
- A. Hardcode token trong base.css — nhanh; merchant không đổi được, Sidekick phải sửa CSS. Loại.
- B. Mỗi token = 1 setting + 1 biến CSS trong css-variables.liquid — merchant/Sidekick đổi qua settings; CSS chỉ dùng biến. Chọn.
- C. Color scheme nhiều bộ như Dawn — linh hoạt nhưng nhiều setting, lệch Skeleton. Loại.

## Quyết định
B. tokens.json là nguồn; màu theo docs/tokens.json (sửa 27/10 sau kiểm kê Figma): background, foreground, background_alt, background_cream, background_dark (+ foreground của mỗi nền), accent, accent_foreground, sale, sale_foreground, rating, muted, muted_light (#6B6B6B, AA), muted_on_dark (#999999 chỉ trên nền tối), border; 2 font_picker (primary, heading), space scale 8 bậc từ 1 setting base, radius 3 setting.

## Hệ quả
Tốt: Sidekick đổi màu bằng setting. Xấu: thêm ~15 setting. Việc: Designer xuất tokens.json tuần 1; Dev FE TE-1 map. Đo: 0 màu hardcode trong CSS (grep #[0-9a-f]{3,6} ngoài css-variables).
