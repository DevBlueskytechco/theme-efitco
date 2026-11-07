// Kiểm spec có bắt được lỗi không: mỗi project là 1 mutation của cart-items.js hoặc cart-drawer.js (stub-server.mjs), chạy trên 1 cổng riêng. Mỗi mutation phải làm ít nhất 1 test đỏ.
// Chạy: npx playwright test --config=drafts/qa/ES1-T203/pw.mutant.config.ts --reporter=json
// JSON trong drafts/qa/ES1-T203/test-results/mutants.json. Đọc bằng: node drafts/qa/ES1-T203/mutants-report.mjs
import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
import base from './pw.local.config';

const DIR = 'drafts/qa/ES1-T203';
const source = readFileSync(`${DIR}/stub-server.mjs`, 'utf8');
const names = [...source.slice(source.indexOf('const MUTATIONS'), source.indexOf('const mutate')).matchAll(/'([\w-]+)': \[/g)].map((m) => m[1]);
const port = (i: number) => 9300 + i;

// Đường dẫn tính từ thư mục config.
process.env.PLAYWRIGHT_JSON_OUTPUT_NAME = 'test-results/mutants.json';

export default defineConfig({
  ...base,
  testMatch: /ES1-T(96|97|98)\.spec\.ts/,
  workers: 8,
  outputDir: 'test-results/mutants',
  webServer: names.map((name, i) => ({
    command: `node ${DIR}/stub-server.mjs ${port(i)} ${name}`,
    url: `http://127.0.0.1:${port(i)}/`,
    cwd: '../../..',
    reuseExistingServer: false,
  })),
  projects: names.map((name, i) => ({ name, use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${port(i)}` } })),
  globalSetup: undefined,
  use: { storageState: { cookies: [], origins: [] } },
});
