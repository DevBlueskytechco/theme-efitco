---
name: playwright-theme
description: Khung Playwright cho theme trên store dev: selector data-testid, preview URL, password page, case lỗi mạng. Dùng khi viết hoặc chạy E2E.
---
- Config `playwright.config.ts`: `baseURL = process.env.PREVIEW_URL`, project chromium + mobile (Pixel 7), `storageState` đã qua password page (`tests/setup/password.ts` nhập `STORE_PASSWORD`).
- Selector chỉ `getByTestId`; không CSS class. Thiếu testid → tạo ticket cho dev-fe, không tự thêm.
- Mỗi spec: 1 luồng chính + 1 lỗi chính; `test.describe('<ticket>')`; ảnh chụp khi fail.
- Mạng: `page.route('**/cart/add.js', r => r.abort())` cho case lỗi; `waitForResponse` cho partial.
- A11y: `@axe-core/playwright` chạy trên trang story, 0 violation `serious/critical`.
- Chạy: `PREVIEW_URL=... npx playwright test tests/e2e/<ticket>.spec.ts`; kết quả vào ticket.
