---
name: design-token
description: Xuất design token từ Figma thành tokens.json và map sang settings_schema + css-variables. Dùng cho Designer và Dev FE TE-1.
---
`tokens.json`: `{color: {background, foreground, accent, accent_foreground, muted, border}, font: {primary, heading}, space: {1..8}, radius: {input, card, button}, container: {max, margin}}`. Ràng buộc: ≥ 4 màu, mỗi background có foreground; font trong danh sách Shopify (`font_picker`); contrast AA. Map: mỗi màu → setting `type: color` trong `settings_schema.json` + biến `--color-<name>` trong `css-variables.liquid`; font → `font_picker` + `font_face` 4 biến thể qua `font_modify`.
