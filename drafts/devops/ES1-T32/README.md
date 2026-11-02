KHÔNG CHẮC: tên trường JSON CLI 5.0 lấy theo mô tả ticket, chưa đối chiếu doc migrate/5-0 (sandbox chặn shopify.dev) và chưa chạy CLI lên store từ máy agent (CLI bị chặn ghi ~/Library/Preferences). Parser chấp nhận nhiều biến thể; chốt khi có log cli5-canary — câu hỏi ES1-T36.

# ES1-T32 · Ghim Shopify CLI 4.9.5, đọc JSON CLI 5.0

## Thay đổi
- scripts/shopify-cli.sh (mới): `PINNED_CLI=4.9.5` là nguồn duy nhất; lệnh `pinned`, `assert-version`, `theme-id`, `push-result`, `check-report`.
  - theme list: mảng (4.x) hoặc `{themes:[...]}` (5.0); id số / chuỗi / gid → chuỗi số.
  - theme push: `{error:{...}}` → mã 1; `status` partial|failed|failure|error|aborted hoặc `issues[]` severity error → in `::error file=<path>::<message>`, mã 3; thiếu id → mã 1; OK in id. Đọc `theme.id`, `data.theme.id`, `theme_id`.
  - theme check: 4.x `[{path, offenses:[{severity 0|1|2, start_row, start_column từ 0}]}]` → +1; 5.0 `{issues:[...]}` hoặc mảng phẳng, `line/column` giữ nguyên (từ 1). In annotation GitHub, tổng `error= warning= info=`, mã 1 nếu error > 0.
- scripts/shopify-cli.test.sh (mới): 26 case fixture 4.9.5 + 5.0, không gọi store. CI chạy trong job theme-check.
- scripts/preview-push.sh (mới): logic push preview tách từ ci.yml, dùng chung cho job 4.9.5 và cli5-canary. Chặn store khác `hoa-qua-nhap-khau.myshopify.com`, chặn tên không `ai-*`. Partial (5.0 thoát != 0) dừng ngay, không thử lại; lỗi mạng thử 3 lần như cũ.
- scripts/theme-zip.sh: `assert-version` + theme check JSON qua `check-report`.
- .github/workflows/ci.yml:
  - theme-check, preview: `npm i -g "@shopify/cli@$(scripts/shopify-cli.sh pinned)"` + `assert-version`; theme check `--output json` → annotation.
  - preview: `scripts/preview-push.sh`, output `theme_id`, `url` giữ nguyên tên → lighthouse/e2e không đổi.
  - cli5-canary (mới): `@shopify/cli@5`, `continue-on-error: true`, `needs: [preview, lighthouse, e2e]` + `if: always() && needs.preview.result == 'success'` để không đẩy đè theme lúc đang đo. Push vào cùng theme `ai-<nhánh>` (không tốn slot), so theme_id với job 4.9.5.
- docs/runbook.md: mục 7 CLI lệch phiên bản / 5.x đổi JSON; mục 1 dùng check-report.
- Không có `--poll` trong scripts/ hay .github/ (trước đó cũng không có); `grep -rn 'poll' scripts .github` = 0 dòng.

## Tự kiểm tra
- `bash scripts/shopify-cli.test.sh` → pass=26 fail=0.
- `scripts/shopify-cli.sh assert-version` local → shopify cli 4.9.5.
- `shopify theme check --output json --fail-level error` (4.9.5 thật) → `[]`; `check-report` → error=0 warning=0 info=0. mcp theme_check → [].
- `bash -n` 4 script OK. YAML ci.yml soát tay (không có parser YAML trong sandbox).
- `grep -rn 'poll' scripts .github` → 0.

## Chưa làm được / cần người
- Chưa chạy CI thật: CI xanh 4.9.5 và cli5-canary preview trên hoa-qua-nhap-khau chỉ xác nhận được sau khi Orchestrator push nhánh, mở PR.
- cli5-canary không được đặt làm required check trong branch protection (người cấu hình repo kiểm).
- Skill `.claude/skills/shopify-cli-ops` ghi đọc `theme.id`, `theme.preview_url`; agent không ghi được thư mục skills — Tech Lead cập nhật nếu cần khi chốt 5.0.
- Canary dùng `@shopify/cli@5` (bản 5.x mới nhất) để biết thời điểm nâng; muốn khoá 5.0.x thì đổi thành `@5.0`.
