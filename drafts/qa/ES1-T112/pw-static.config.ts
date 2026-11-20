// Config chạy riêng nhóm "contract" (tĩnh) của ES1-T112 khi không có preview: bỏ globalSetup password và storageState.
// Chạy: npx playwright test -c drafts/qa/ES1-T112/pw-static.config.ts -g contract
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '../../../tests/e2e',
  testMatch: /ES1-T112\.spec\.ts/,
  reporter: 'list',
  outputDir: '../../../test-results/ES1-T112-static',
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
