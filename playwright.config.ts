import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  testDir: 'tests/e2e',
  globalSetup: './tests/setup/password.ts',
  use: { baseURL: process.env.STORE_ORIGIN || (process.env.PREVIEW_URL ? new URL(process.env.PREVIEW_URL).origin : undefined), storageState: 'tests/setup/state.json', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
