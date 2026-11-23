// Chạy đo cục bộ: npx playwright test --config drafts/dev-fe/ES1-T566/measure.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '.', testMatch: 'measure.spec.ts', reporter: 'line' });
