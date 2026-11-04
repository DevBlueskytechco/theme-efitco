import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  testDir: 'tests/e2e',
  // Shopify giới hạn tần suất (429/403) khi nhiều test gọi storefront cùng lúc: thử lại 1 lần trên CI, report ghi 'flaky'.
  retries: process.env.CI ? 1 : 0,
  // 1 worker trên CI: nhiều worker + nhiều PR cùng lúc làm Shopify chặn store dev (403).
  workers: process.env.CI ? 1 : undefined,
  globalSetup: './tests/setup/password.ts',
  use: { baseURL: process.env.STORE_ORIGIN || (process.env.PREVIEW_URL ? new URL(process.env.PREVIEW_URL).origin : undefined), storageState: 'tests/setup/state.json', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
