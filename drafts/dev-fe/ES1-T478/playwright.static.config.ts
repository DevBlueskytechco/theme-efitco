// Chạy spec tĩnh tại máy dev không cần store (bỏ globalSetup mở khoá password). Chỉ dùng cho tự kiểm ES1-T478; CI dùng playwright.config.ts.
// npx playwright test -c drafts/dev-fe/ES1-T478/playwright.static.config.ts <spec>
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '../../../tests/e2e',
  reporter: 'list',
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
});
