// ES1-T313: chạy spec tĩnh không cần store (không globalSetup, không PREVIEW_URL).
// npx playwright test --config=drafts/dev-fe/ES1-T313/pw.static.config.ts tests/e2e/ES1-T313.spec.ts
import { defineConfig, devices } from '@playwright/test';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
export default defineConfig({
  testDir: '../../../tests/e2e',
  outputDir: join(tmpdir(), 'es1-t313-results'),
  reporter: 'line',
  retries: 0,
  timeout: 15000,
  use: { baseURL: 'http://127.0.0.1:9', trace: 'off', screenshot: 'off', video: 'off' },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
});
