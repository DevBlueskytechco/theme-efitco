// ES1-T229: toàn bộ spec không cần store để lọc test tĩnh, cùng cách ES1-T217. Không globalSetup, baseURL chết: test cần store fail ngay.
// Chạy: npx playwright test --config=drafts/qa/ES1-T229/pw.static.config.ts, rồi node drafts/qa/ES1-T217/static-summary.mjs drafts/qa/ES1-T229/static-result.json
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '../../../tests/e2e',
  outputDir: './test-results/static',
  reporter: [['json', { outputFile: './static-result.json' }]],
  retries: 0,
  workers: 8,
  timeout: 6000,
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:9', trace: 'off', screenshot: 'off', video: 'off', actionTimeout: 1000, navigationTimeout: 1000 },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
});
