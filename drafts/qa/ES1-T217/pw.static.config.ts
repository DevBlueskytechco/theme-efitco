// ES1-T217: chạy toàn bộ spec không cần store để lọc test tĩnh. Không globalSetup, baseURL chết: test cần trình duyệt/store fail ngay.
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '../../../tests/e2e',
  outputDir: './test-results',
  reporter: [['json', { outputFile: './static-result.json' }]],
  retries: 0,
  workers: 8,
  timeout: 6000,
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:9', trace: 'off', screenshot: 'off', video: 'off', actionTimeout: 1000, navigationTimeout: 1000 },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
});
