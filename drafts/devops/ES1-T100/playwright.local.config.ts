// Chỉ để kiểm tra overlay offline: không globalSetup, không store.
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  reporter: 'list',
  testDir: '.',
  testMatch: ['**/ES1-T100.spec.ts', 'local-skip-check.spec.ts'],
  workers: 1,
  outputDir: process.env.PW_OUT,
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
});
