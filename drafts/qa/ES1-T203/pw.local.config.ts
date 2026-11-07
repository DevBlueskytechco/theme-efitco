// Chạy T96, T97, T98, ES1-T203 trên storefront giả khi phiên QA không vào được store. Không thay CI; thư viện partial, standard-events, Shopify.actions đều giả.
// cdn.shopify.com giả bằng context.route, gắn qua BrowserType.launch ngay trong config để spec không phải biết tới storefront giả.
// Chạy: npx playwright test --config=drafts/qa/ES1-T203/pw.local.config.ts
import { defineConfig, devices } from '@playwright/test';
import { chromium, type Browser, type BrowserContext } from 'playwright-core';
import { STANDARD_EVENTS } from './standard-events-stub.mjs';

const DIR = 'drafts/qa/ES1-T203';
process.env.PREVIEW_URL = 'http://127.0.0.1:9293/';

// Chỉ giả CDN, không đụng request khác. Route cấp page trong spec (ES1-T98 abort CDN) vẫn thắng route cấp context.
const proto = Object.getPrototypeOf(chromium) as { launch: (...args: unknown[]) => Promise<Browser> };
const launch = proto.launch;
proto.launch = async function patchedLaunch(this: unknown, ...args: unknown[]) {
  const browser = await launch.apply(this, args);
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...options: Parameters<Browser['newContext']>): Promise<BrowserContext> => {
    const context = await newContext(...options);
    await context.route('https://cdn.shopify.com/**', (route) => route.fulfill({ contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' }, body: route.request().url().includes('standard-events') ? STANDARD_EVENTS : '' }));
    return context;
  };
  return browser;
};

export default defineConfig({
  rootDir: '../../..',
  testDir: '../../../tests/e2e',
  testMatch: /ES1-T(96|97|98|201|203|163|171)\.spec\.ts/,
  outputDir: 'test-results',
  reporter: 'list',
  workers: 4,
  fullyParallel: true,
  globalSetup: '../../../tests/setup/password.ts',
  webServer: {
    command: `node ${DIR}/stub-server.mjs 9293 ${process.env.T203_MUTATION ?? ''}`,
    url: 'http://127.0.0.1:9293/',
    cwd: '../../..',
    reuseExistingServer: false,
  },
  use: { baseURL: 'http://127.0.0.1:9293', storageState: 'tests/setup/state.json' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
