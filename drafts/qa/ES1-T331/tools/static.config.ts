// ES1-T331: chạy riêng nhóm test tĩnh (không store, không globalSetup password) ở máy QA.
// Dùng: npx playwright test -c drafts/qa/ES1-T331/tools/static.config.ts -g "Fixture tĩnh"
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../../../../tests/e2e',
  testMatch: 'ES1-T331.spec.ts',
  reporter: 'list',
  projects: [{ name: 'desktop' }],
});
