KHÔNG CHẮC: chưa đo lhci trên develop (agent không chạy được shopify CLI/gh trong sandbox) nên chưa biết PR mở nào sẽ đỏ; docs/checklist-theme-store.md bị scope-guard chặn với devops, patch R6.x để ở mục 2 chờ áp (hỏi ES1-T427).

# ES1-T416 — ngưỡng lhci theo ES1-T301 (CTO 11/11, ý a–d)

## 1. Đã sửa
| File | Thay đổi |
| --- | --- |
| lighthouserc.json (desktop) | performance error 0.96 (giữ); accessibility error 0.98 → 1; thêm best-practices warn 0.78; thêm seo warn 1 |
| lighthouserc.mobile.json | performance error 0.9 (giữ); accessibility error 0.98 → 1; thêm best-practices warn 0.78; thêm seo warn 1 |
| .github/workflows/store-tests.yml | chỉ sửa comment dòng 53 (a11y = 1); không đổi lệnh, job, concurrency |

CI đọc ngưỡng: store-tests.yml dòng 40, 42 gọi `npx lhci autorun --config=lighthouserc.json` / `--config=lighthouserc.mobile.json` → ngưỡng mới có hiệu lực ngay, không cần sửa workflow. `npm run lhci` (package.json) dùng cùng 2 file.

## 2. Patch docs/checklist-theme-store.md (chưa áp — scope-guard chặn devops)
Thay dòng 31–32 bằng:

```
| R6.1 | Lighthouse perf ≥ 96 desktop / 90 mobile (Shopify 60); CI chặn merge. Nghiệm thu NFR-1: desktop ≥ 98, mobile ≥ 90, đo riêng (ES1-T301 a) | Bắt buộc |  |  |
| R6.2 | Lighthouse a11y = 100 desktop + mobile (Shopify 90); CI chặn merge (ES1-T301 b) | Bắt buộc |  |  |
| R6.3 | Lighthouse best-practices ≥ 78; CI chỉ cảnh báo (warn) do nền tảng Shopify (ES1-T277); nâng error sau ticket BE sửa thứ tự nạp module. Nghiệm thu NFR-1: 100 (ES1-T301 c) | Bắt buộc |  |  |
| R6.4 | Lighthouse SEO = 100; CI chỉ cảnh báo (warn) vì store dev có password. Nghiệm thu NFR-1 đo trên demo: home, collection, product, blog, article, page (ES1-T301 d) | Bắt buộc |  |  |
```

Còn lệch, không thuộc DevOps: docs/test-strategy.md dòng 7 "lhci accessibility ≥ 98" (QA); ai-team/CLAUDE.md mục check (CTO).

## 3. Chạy trên develop trước khi bật (Orchestrator / DevOps người)
Store duy nhất: hoa-qua-nhap-khau. Không --live, không publish.

```
THEME_ID=<id theme ai-develop>   # shopify theme list --json, tên ai-develop
Q="preview_theme_id=${THEME_ID}&pb=0"; O=https://hoa-qua-nhap-khau.myshopify.com
URLS=(--collect.url="$O/?$Q" --collect.url="$O/products/$BENCH_PRODUCT?$Q" --collect.url="$O/collections/$BENCH_COLLECTION?$Q")
STORE_PASSWORD=... npx lhci autorun --config=lighthouserc.json "${URLS[@]}"
STORE_PASSWORD=... npx lhci autorun --config=lighthouserc.mobile.json "${URLS[@]}"
```
Hoặc: workflow_dispatch ci.yml trên develop (chạy cả khi RUN_STORE_TESTS=false), đọc bước "Bảng điểm" + dòng "A11Y FAIL".

Ghi vào ES1-T416: bảng formFactor/URL/perf/a11y/bp/seo; a11y < 1 ở trang nào, audit nào. PR mở đang rebase trên develop có a11y < 1 sẽ đỏ check `lighthouse` khi rebase lên commit này → liệt kê bằng `gh pr list --state open` đối chiếu artifact lighthouse run gần nhất của từng PR.

## 4. Ảnh hưởng cổng merge (required_checks)
- Check `lighthouse` (ci.yml) vẫn là required; điều kiện fail chỉ siết a11y 0.98 → 1 (error). Perf giữ nguyên.
- best-practices, seo mức warn: lhci in cảnh báo, exit 0 → không làm đỏ cổng.
- Không đổi concurrency `store-hoa-qua-e2e`, không đổi e2e.
- Nếu `vars.RUN_STORE_TESTS=false` (CTO 06/11) thì check lighthouse vẫn pass không đo — ngưỡng mới chỉ có hiệu lực khi bật lại hoặc workflow_dispatch.
- Lỗi môi trường (429/502) vẫn phân loại riêng như runbook mục 9.

## 5. Rollback
Revert commit PR này (2 file lighthouserc + comment workflow). Không có trạng thái store cần khôi phục.

## Tự kiểm tra
- `node -e require(...)` 2 file parse OK; assertions: perf 0.96/0.9 error, a11y 1 error, bp 0.78 warn, seo 1 warn.
- Không đụng theme, store, ai-team/, CLAUDE.md.
