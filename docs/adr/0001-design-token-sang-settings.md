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

## Bổ sung 2026-10-30 (Tech Lead, ES1-T11 — trả lời ES1-T7)
- Radius 4 setting theo tokens.json (input, button, card, hero), thay cho "3 setting".
- Tên: setting `color_<token>` → `--color-<token>` (gạch dưới thành gạch ngang); `type_primary_font` (body) → `--font-primary--*`, `type_heading_font` → `--font-heading--*`; `space_base` → `--space-base`, `--space-1..8` = base × 1/2/3/4/6/8/12/30; `radius_*` → `--radius-*`; `page_width`, `page_margin` → `--page-width`, `--page-margin`.
- Type scale (13…200) là hằng `--text-*` trong css-variables.liquid, không thành setting.
- Đo bổ sung: 0 `rgb()/rgba()/hsl()` literal trong assets/*.css; bóng đổ dùng `color-mix()` với biến.
- Chi tiết: drafts/techlead/ES1-T11/task-split.md mục D1.

## Hệ quả
Tốt: Sidekick đổi màu bằng setting. Xấu: 26 setting toàn cục (17 màu, 2 font, 1 space, 4 radius, 2 layout). Việc: Designer xuất tokens.json tuần 1; Dev FE TE-1 map. Đo: 0 màu hardcode trong CSS (grep #[0-9a-f]{3,6} ngoài css-variables).
