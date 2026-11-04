# Runbook · DevOps · khung, điền sprint 1

Mỗi sự cố: Triệu chứng → Xác nhận → Xử lý → Rollback → Phòng ngừa.
1. Push preview fail vì theme check — `shopify theme check --output json --fail-level error > check.json; scripts/shopify-cli.sh check-report check.json` local (in file:dòng:cột từ 1); sửa Liquid, không thêm override.
2. Preview trắng vì settings_data.json tham chiếu resource không có — kiểm `config/settings_data.json`, bỏ default resource.
3. Lighthouse tụt dưới ngưỡng — so report với sprint trước; thủ phạm thường: ảnh hero, font, JS mới; xem ADR 0003.
4. hoa-qua-nhap-khau (efitco-ai-dev) hết slot theme (20) — `shopify theme list --json`, liệt kê `ai-*` > 7 ngày, người xoá.
5. CLI mất auth trong CI — xoay `SHOPIFY_CLI_THEME_TOKEN` (Theme Access app), cập nhật secret.
6. Nâng cấp theme đã sửa trong Canvas — upload zip mới thành theme mới → `scripts/diff-settings.sh` → merchant chuyển theme trong Canvas; theme cũ giữ lại để rollback.
7. Shopify CLI lệch phiên bản / CLI 5.x đổi JSON (ES1-T32) — Triệu chứng: `assert-version` fail; `theme-id`/`push-result`/`check-report` báo "không phải JSON" hoặc thiếu id. Xác nhận: `scripts/shopify-cli.sh assert-version`, `bash scripts/shopify-cli.test.sh`, log job `cli5-canary`. Xử lý: cài bản ghim `npm i -g "@shopify/cli@$(scripts/shopify-cli.sh pinned)"`; schema mới thì thêm fixture vào `scripts/shopify-cli.test.sh` rồi sửa jq trong `scripts/shopify-cli.sh`. Push `status: partial` = lỗi nội dung theme: sửa file theo `::error file=` trong log, không thử lại. Rollback: revert `PINNED_CLI` về 4.9.5. Phòng ngừa: chỉ nâng khi `cli5-canary` xanh nhiều PR liên tiếp, đổi `PINNED_CLI` trong PR riêng; `cli5-canary` không phải required check.
