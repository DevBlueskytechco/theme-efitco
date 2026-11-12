KHÔNG CHẮC: (1) chưa chạy đo JS, lhci trên store thật: phiên này không có STORE_PASSWORD/preview, Chromium bị sandbox chặn → phần trình duyệt của js-budget.test.mjs chỉ chạy trên CI (bắt buộc, JS_BUDGET_REQUIRE_BROWSER=1). (2) RUN_STORE_TESTS=false thì bước đo JS không chạy ở PR. (3) handle "PDP demo", nghĩa "mở search". Hỏi ở ES1-T431, đang theo MẶC ĐỊNH.

# ES1-T177 TE-17-DEVOPS1 — lhci /?view=figma, đo JS theo URL, zip bỏ index.*

Nguồn: ticket ES1-T177, ADR 0006 (+ bổ sung 06/11), ADR 0010, ES1-T310 #1 (CTO 11/11), docs/runbook.md mục 9.
scope-guard chặn devops ghi tests/ → bước đo là scripts/js-budget.mjs dùng thư viện @playwright/test đã có (không qua test runner, không thêm dependency), không phải tests/e2e/ES1-T177.spec.ts.

## File đổi
- .github/workflows/store-tests.yml
  - lhci: thêm `--collect.url=${STORE_ORIGIN}/?view=figma&preview_theme_id=..&pb=0`, giữ `/`. Không đổi lighthouserc*.json (96/90/98).
  - Bảng điểm: tên URL giữ `?view=...` để `/` và `/?view=figma` không trùng dòng (jq đã thử 5 URL mẫu).
  - Job lighthouse thêm 3 bước (`if: !cancelled()`, chạy cả khi lhci đỏ): cài Chromium → `node scripts/js-budget.test.mjs` (JS_BUDGET_REQUIRE_BROWSER=1) → `node scripts/js-budget.mjs`.
- .github/workflows/ci.yml (job theme-check): `node scripts/js-budget.test.mjs` (phần logic); cổng `gzip -c assets/base.css | wc -c` ≤ 49 152 (ES1-T310 #1, hiện 41 277).
- scripts/js-budget.mjs (mới): 6 URL × desktop + Pixel 7: `/?view=figma`, `/`, `/products/<PDP>`, `/collections/all`, `/cart` (1 dòng hàng), `/search?q=bench`. Mỗi URL context mới (cache trống). Tải sẵn = resource lúc `load` + 1 s không có JS mới; sau cuộn = cuộn 80% màn hình tới đáy + 2 s yên. Cộng transferSize file `/t/<số>/assets/*.js` (bỏ JS Shopify, app extension). Trần 40 960 / 65 536; env JS_BUDGET_*_MAX chỉ hạ được. In bảng từng file + tổng, ::error từng URL, bảng tóm tắt vào GITHUB_STEP_SUMMARY, `[js-budget] số_lần_429`.
  - Bảo vệ đo: kiểm `Shopify.theme.id` = THEME_ID (đo nhầm theme → đỏ); 0 file JS theme → đỏ; transferSize = encodedBodySize = 0 → "không đo được", đỏ; buffer resource 5 000.
  - Thoát: 0 đạt; 1 lỗi code (vượt trần, đo nhầm theme, trang 4xx); 3 chỉ lỗi store (429 sau 3 lần thử, Cloudflare, 5xx) — vẫn đỏ, annotation "Lỗi store dev, không phải lỗi code".
  - Chỉ STORE_ORIGIN = https://hoa-qua-nhap-khau.myshopify.com. Ghi duy nhất giỏ tạm của phiên (POST /cart/add.js). Không Admin, không push/xoá/publish theme.
  - File > 8 192 B chưa nén: chỉ ::warning (DoD BE dùng wc -c).
- scripts/js-budget.test.mjs (mới): 10 ca logic + ca trình duyệt route giả (motion tải sẵn, bundle-form sau cuộn qua IntersectionObserver, bỏ JS app, trần giả 1 B đỏ, theme id lệch lỗi). Không gọi mạng.
- scripts/theme-zip.sh: thêm `-x "templates/index.*.liquid"`.
- docs/runbook.md: mục 10 (tối đa 2 PR, D5), 11 (JS đỏ + cách chứng minh trần giả), 12 (base.css gzip).

## Ảnh hưởng cổng merge (required_checks)
- Không thêm/đổi tên check. `theme-check` thêm 2 bước chặn: test logic JS, base.css gzip. `lighthouse` giờ gồm cả ngân sách JS: JS vượt trần → lighthouse_result failure → check `lighthouse` đỏ.
- Concurrency không đổi (store-hoa-qua-e2e, 1 chạy + 1 chờ). Thời gian giữ store mỗi run tăng: +1 URL lhci × 3 lần × 2 máy, + đo JS 12 lượt tải trang + 1 lượt sản phẩm/máy để seed giỏ, + cài Chromium (~1 phút).
- RUN_STORE_TESTS=false (CTO 06/11): lhci và đo JS không chạy ở PR → check `lighthouse` pass có cảnh báo CHƯA CHẠY. Chạy tay: `gh workflow run CI --ref <nhánh>`. Hỏi ES1-T431 #1.
- Không secret mới; var tuỳ chọn mới: JS_BUDGET_PRODUCT, JS_BUDGET_PRELOAD_MAX, JS_BUDGET_SCROLL_MAX (trống = theo ADR).

## Tự kiểm (12/11/2026, máy local)
- `node scripts/js-budget.test.mjs`: 10 ok; phần trình duyệt bỏ qua local (Chromium bị sandbox chặn), bắt buộc trên CI.
- `scripts/theme-zip.sh efitco-test 0.0.0`: theme check 0 lỗi, 122 file; `unzip -l | grep -c templates/index` = 1 (index.liquid); `grep -cE "index\.(te|figma)"` = 0; 0 file drafts/docs/tests/scripts/.claude.
- `bash scripts/shopify-cli.test.sh` pass=47 fail=0; `bash scripts/preview-push.test.sh` pass=13 fail=0.
- YAML ci.yml, store-tests.yml parse được; jq bảng điểm thử 5 URL; `node --check` 2 file mjs.
- `gzip -c assets/base.css | wc -c` = 41 277 ≤ 49 152.
- Không đổi .theme-check.yml, lighthouserc*.json, playwright.config.ts; không chạy lệnh ghi store.
- Chưa có (cần CI của PR): điểm lhci /?view=figma desktop/mobile; tổng JS thật 6 URL; log đỏ với trần giả (runbook mục 11: đặt var JS_BUDGET_SCROLL_MAX=1000, chạy lại, chép log, xoá var).
- Không làm: z-index grep = 0 (chỉ sau TE-10-R2-FE1 merge; hiện base.css 11, critical.css 3).

## PR (Orchestrator dán)
ES1-T177 TE-17-DEVOPS1: lhci thêm /?view=figma; bước đo JS theo URL (tải sẵn ≤ 40 960 B, sau cuộn ≤ 65 536 B, 6 URL × desktop/Pixel 7) trong job lighthouse; cổng base.css gzip ≤ 49 152 B ở theme-check; theme-zip bỏ templates/index.*.liquid; runbook mục 10–12.
Required checks: không thêm/đổi tên; `lighthouse` gồm ngân sách JS; `theme-check` gồm base.css gzip + test logic JS. Concurrency không đổi. Khi RUN_STORE_TESTS=false bước JS không chạy ở PR.
Cần trong PR: log lhci /?view=figma, bảng [js-budget], log đỏ với trần giả (runbook mục 11).
