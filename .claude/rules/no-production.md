# Cấm production

- Không `shopify theme push --live`, `shopify theme publish`, `shopify theme delete`.
- Store duy nhất agent được push: store trong biến `SHOPIFY_FLAG_STORE` (= hoa-qua-nhap-khau (efitco-ai-dev)). Store khác là vi phạm.
- Không push lên `main`, `develop`. Chỉ `feature/ai-*`.
- Không đọc, không ghi store khách, store `yum-dev (store người, đã có Canvas)` (DevOps người làm bằng script có xác nhận).
- Hook `no-live-push.sh` chặn các lệnh trên; bị chặn là đúng.
