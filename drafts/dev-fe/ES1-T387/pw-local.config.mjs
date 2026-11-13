// Chạy nhóm static + fixture của tests/e2e/ES1-T387.spec.ts không cần preview (bỏ globalSetup mật khẩu store).
// npx playwright test -c drafts/dev-fe/ES1-T387/pw-local.config.mjs -g "static|fixture"
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../../../tests/e2e',
  testMatch: 'ES1-T387.spec.ts',
  projects: [{ name: 'desktop', use: { viewport: { width: 1280, height: 900 } } }],
  reporter: 'line',
});
