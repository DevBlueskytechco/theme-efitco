// ES1-T345: chạy riêng nhóm @static (không store, không globalSetup password) ở máy QA.
// Dùng: npx playwright test -c drafts/qa/ES1-T345/static.config.ts -g "@static"
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../../../tests/e2e',
  testMatch: 'ES1-T345.spec.ts',
  reporter: 'list',
  projects: [{ name: 'desktop' }],
});
