// ES1-T300: chạy repro không cần store (không globalSetup, không storageState).
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  testMatch: /\.repro\.spec\.ts$/,
  reporter: 'list',
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
});
