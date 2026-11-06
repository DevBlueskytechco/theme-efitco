// ES1-T229: chạy đúng test của ticket (T73 TC-1, TC-2, T94 nojs x3, T95 markup, nojs) với server giả cf-stub.mjs. Mỗi project là 1 điểm bị chặn.
// Chạy: npx playwright test --config=drafts/qa/ES1-T229/pw.repro.config.ts, rồi node drafts/qa/ES1-T229/repro-summary.mjs
import { defineConfig, devices } from '@playwright/test';

process.env.TE4_VARIANTS_HANDLE = 'stub-product';
delete process.env.EXPECT_CART_TYPE;

const TE5_NOJS = /ES1-T94 TE-5 cart page nojs/;
const T73 = /TC-1 |TC-2 /;
const MODES: [string, number, RegExp][] = [
  ['all', 4301, /TC-1 |TC-2 |ES1-T94 TE-5 cart page nojs|AC1-markup|ES1-T95 TE-5 cart drawer nojs/],
  ['product', 4302, /TC-1 |ES1-T94 TE-5 cart page nojs/],
  ['cart', 4303, /ES1-T94 TE-5 cart page nojs|ES1-T95 TE-5 cart drawer nojs/],
  ['post', 4304, TE5_NOJS],
  ['repeat', 4305, T73],
  ['ok', 4306, /TC-1 |TC-2 |ES1-T94 TE-5 cart page nojs|ES1-T95 TE-5 cart drawer nojs|bấm: không reload/],
  // ES1-T189 có fetch dữ liệu tab: test phải đỏ.
  ['tabfetch', 4307, /bấm: không reload/],
];

export default defineConfig({
  rootDir: '../../..',
  testDir: '../../../tests/e2e',
  testMatch: /ES1-T(73|94|95|189)\.spec\.ts/,
  outputDir: './test-results/repro',
  reporter: [['json', { outputFile: './repro-result.json' }]],
  retries: 0,
  workers: 1,
  timeout: 30000,
  use: { trace: 'off', screenshot: 'off', video: 'off' },
  webServer: MODES.map(([mode, port]) => ({ command: `node drafts/qa/ES1-T229/cf-stub.mjs ${port} ${mode}`, port, cwd: '../../..', reuseExistingServer: false })),
  projects: MODES.map(([mode, port, grep]) => ({ name: mode, grep, use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${port}`, storageState: 'tests/setup/state.json' } })),
});
