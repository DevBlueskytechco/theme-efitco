---
name: shopify-cli-ops
description: Lệnh Shopify CLI dùng trong CI/preview cho store dev, có json output. Dùng cho DevOps.
---
- Auth CI: `SHOPIFY_CLI_THEME_TOKEN` + `SHOPIFY_FLAG_STORE` (không login tương tác).
- Preview: `shopify theme push --unpublished --json --theme "ai-<branch>" --path .` → đọc `theme.id`, `theme.preview_url`.
- Cập nhật cùng theme: `shopify theme push --theme <id> --json`.
- Liệt kê để dọn: `shopify theme list --json`; theme `ai-*` quá 7 ngày → ghi danh sách vào ticket, người xoá.
- Check: `shopify theme check --fail-level error`; dev local: `shopify theme dev --store hoa-qua-nhap-khau (efitco-ai-dev)`.
- Không có lệnh nào tới `yum-dev (store người, đã có Canvas)` hay `--live`.
