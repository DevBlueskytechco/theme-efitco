// Config tạm chạy phần tĩnh + fixture không cần store (không globalSetup/storageState). Xoá trước khi nộp.
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '../../../tests/e2e',
  reporter: 'line',
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
});
