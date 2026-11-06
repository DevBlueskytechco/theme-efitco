// ES1-T224: chạy tests/e2e/ES1-T224.spec.ts không cần store, không globalSetup; test axe gộp gọi store nên bị loại bằng grepInvert.
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  rootDir: '../../..',
  testDir: '../../../tests/e2e',
  testMatch: /ES1-T224\.spec\.ts/,
  grepInvert: /axe 0 serious/,
  outputDir: './test-results/t224',
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
