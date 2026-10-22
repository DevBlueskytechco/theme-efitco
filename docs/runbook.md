# Runbook · DevOps · khung, điền sprint 1

Mỗi sự cố: Triệu chứng → Xác nhận → Xử lý → Rollback → Phòng ngừa.
1. Push preview fail vì theme check — `shopify theme check --fail-level error` local; sửa Liquid, không thêm override.
2. Preview trắng vì settings_data.json tham chiếu resource không có — kiểm `config/settings_data.json`, bỏ default resource.
3. Lighthouse tụt dưới ngưỡng — so report với sprint trước; thủ phạm thường: ảnh hero, font, JS mới; xem ADR 0003.
4. ember-ai-dev hết slot theme (20) — `shopify theme list --json`, liệt kê `ai-*` > 7 ngày, người xoá.
5. CLI mất auth trong CI — xoay `SHOPIFY_CLI_THEME_TOKEN` (Theme Access app), cập nhật secret.
6. Nâng cấp theme đã sửa trong Canvas — upload zip mới thành theme mới → `scripts/diff-settings.sh` → merchant chuyển theme trong Canvas; theme cũ giữ lại để rollback.
