// Chạy tests/e2e/ES1-T30.spec.ts trên trang giả cục bộ (stub-server.mjs), không gọi store.
// Chạy: npx playwright test --config=drafts/qa/ES1-T171/pw.t30.config.ts
import { defineConfig, devices } from '@playwright/test';

const PORT = 47171;
export default defineConfig({
  testDir: '../../..',
  testMatch: 'tests/e2e/ES1-T30.spec.ts',
  outputDir: 'test-results',
  reporter: 'list',
  workers: 4,
  fullyParallel: true,
  webServer: { command: `node drafts/qa/ES1-T171/stub-server.mjs ${PORT}`, cwd: '../../..', url: `http://127.0.0.1:${PORT}/`, reuseExistingServer: false },
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
