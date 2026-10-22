---
name: ci-theme
description: Pipeline CI của theme: theme check, Lighthouse CI, Playwright, preview per branch. Dùng khi sửa .github/workflows.
---
Job thứ tự: `theme-check` → `preview` (push unpublished, output preview_url, theme_id) → `lighthouse` (lhci với `lighthouserc.json`: urls home/product/collection × desktop/mobile, assert perf ≥ 0.96 desktop, ≥ 0.90 mobile, a11y ≥ 0.98) → `e2e` (playwright với PREVIEW_URL) → comment PR tổng hợp. Fail bất kỳ = check đỏ, chặn merge. Secrets: `SHOPIFY_CLI_THEME_TOKEN`, `STORE_PASSWORD`. Artifact: lighthouse html, playwright report, ảnh 3 breakpoint.
