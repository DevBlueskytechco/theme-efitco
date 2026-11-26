import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../../../tests/e2e',
  reporter: 'line',
  projects: [{ name: 'desktop', use: { viewport: { width: 1280, height: 900 } } }],
});
