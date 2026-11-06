// ES1-T229: chạy tests/e2e/ES1-T229.spec.ts không cần store, không globalSetup.
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  rootDir: '../../..',
  testDir: '../../../tests/e2e',
  testMatch: /ES1-T229\.spec\.ts/,
  outputDir: './test-results/t229',
  reporter: 'line',
  retries: 0,
  workers: 4,
  timeout: 30000,
  fullyParallel: true,
  use: { trace: 'off', screenshot: 'off', video: 'off' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
