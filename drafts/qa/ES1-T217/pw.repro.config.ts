// ES1-T217: chạy repro.spec.ts. Không globalSetup, không store, mọi request giả bằng route.
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  rootDir: '../../..',
  testDir: '.',
  testMatch: /repro\.spec\.ts/,
  outputDir: './test-results',
  reporter: 'list',
  retries: 0,
  workers: 4,
  timeout: 20000,
  fullyParallel: true,
  use: { trace: 'off', screenshot: 'off', video: 'off' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
