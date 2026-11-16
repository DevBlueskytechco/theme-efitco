// Chạy cục bộ test fixture của ES1-T315, không globalSetup (không cần preview/mật khẩu store).
// npx playwright test -c drafts/dev-be/ES1-T315/pw-local.config.ts --grep-invert storefront
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '../../../tests/e2e',
  testMatch: /ES1-T315\.spec\.ts/,
  reporter: 'list',
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
