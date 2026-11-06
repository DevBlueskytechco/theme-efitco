// Kiểm đường đi thật của tổng kết 429: globalSetup đặt env → worker ghi file → hàm trả về in cuối lượt chạy. Không gọi store.
// Chạy: npx playwright test --config=drafts/qa/ES1-T201/teardown-probe/pw.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  testMatch: 'probe.spec.ts',
  outputDir: 'test-results',
  reporter: 'list',
  workers: 1,
  globalSetup: './setup.ts',
});
