// Chạy phần không cần store cục bộ: bỏ globalSetup mở password và storageState.
// Chạy: npx playwright test --config=drafts/qa/ES1-T171/pw.local.config.ts --project=desktop
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '../../..',
  testMatch: ['tests/e2e/ES1-T171.spec.ts', 'tests/e2e/ES1-T163.spec.ts', 'tests/e2e/TE-1.spec.ts', 'drafts/qa/ES1-T171/*.spec.ts'],
  outputDir: process.env.PW_OUT || 'test-results',
  reporter: 'list',
  workers: 2,
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
});
