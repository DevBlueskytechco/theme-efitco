// Chạy tests/e2e/ES1-T163.spec.ts cục bộ, không cần store: bỏ globalSetup mở password và storageState.
// Chạy: npx playwright test --config=drafts/qa/ES1-T163/pw.local.config.ts --project=desktop
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '../../../tests/e2e',
  testMatch: 'ES1-T163.spec.ts',
  outputDir: process.env.PW_OUT || 'test-results',
  reporter: 'list',
  workers: 2,
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
});
