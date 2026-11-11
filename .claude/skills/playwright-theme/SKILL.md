---
name: playwright-theme
description: Khung Playwright cho theme trên store dev: selector data-testid, preview URL, password page, case lỗi mạng. Dùng khi viết hoặc chạy E2E.
---
- Config `playwright.config.ts`: `baseURL = process.env.PREVIEW_URL`, project chromium + mobile (Pixel 7), `storageState` đã qua password page (`tests/setup/password.ts` nhập `STORE_PASSWORD`).
- Selector chỉ `getByTestId`; không CSS class. Thiếu testid → tạo ticket cho dev-fe, không tự thêm.
- Mỗi spec: 1 luồng chính + 1 lỗi chính; `test.describe('<ticket>')`; ảnh chụp khi fail.
- Mạng: `page.route('**/cart/add.js', r => r.abort())` cho case lỗi; `waitForResponse` cho partial.
- Đo JS: `performance.getEntriesByType('resource')` lọc `/assets/*.js`, cộng `transferSize` lúc tải và sau cuộn hết trang.
- Lớp: kiểm `html[data-layer-open]`, focus trả về nút mở, Esc, `::backdrop`.
- Countdown: `page.clock.install()` rồi `runFor`.
- AC nội dung Figma chỉ chạy khi store dev đã áp fixture (TE-17-R2-QA0), không thì `test.skip` có lý do. Không `request.get` JSON storefront (429, CONVENTION.md).
- A11y: `@axe-core/playwright` chạy trên trang story, 0 violation `serious/critical`.
- Chạy: `PREVIEW_URL=... npx playwright test tests/e2e/<ticket>.spec.ts`; kết quả vào ticket.
