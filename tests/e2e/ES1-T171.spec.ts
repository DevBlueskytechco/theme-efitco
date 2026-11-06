// Ticket ES1-T171 TE-10-QA2: kiểm chính các helper và quy ước dùng để dựng lại CI xanh. Không gọi store dev (không tốn hạn mức 429).
// Trình duyệt thật chỉ mở trang giả qua page.route.
// Chạy: npx playwright test tests/e2e/ES1-T171.spec.ts
import { test, expect, type APIRequestContext, type ConsoleMessage, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fetchRetry429 } from './support/cart-api';
import { watchShopPay403 } from './support/console-guard';
import { HARDCODED_RADIUS } from './support/css-lint';

const E2E = 'tests/e2e';
const specs = () => readdirSync(E2E).filter((f) => f.endsWith('.spec.ts'));
const read = (file: string) => readFileSync(join(E2E, file), 'utf8');

test.describe('ES1-T171 bộ lọc 403 Shop Pay (logic)', () => {
  type Handler = (r: { status: () => number; url: () => string }) => void;
  function fakePage() {
    let handler: Handler = () => {};
    const page = { on: (_: string, h: Handler) => { handler = h; } } as unknown as Pick<Page, 'on'>;
    return { page, respond: (status: number, url: string) => handler({ status: () => status, url: () => url }) };
  }
  const message = (text: string, url: string, type = 'error') =>
    ({ type: () => type, text: () => text, location: () => ({ url }) }) as unknown as ConsoleMessage;
  const LOG_403 = 'Failed to load resource: the server responded with a status of 403 ()';
  const CHROME_ERROR = 'chrome-error://chromewebdata/';

  test('TC-01 đã thấy 403 từ shop.app, log 403 @ chrome-error: bỏ qua', () => {
    const { page, respond } = fakePage();
    const ignore = watchShopPay403(page);
    respond(403, 'https://shop.app/pay/session');
    expect(ignore(message(LOG_403, CHROME_ERROR))).toBe(true);
  });

  test('TC-02 chưa thấy response shop.app: không bỏ qua', () => {
    const { page } = fakePage();
    expect(watchShopPay403(page)(message(LOG_403, CHROME_ERROR))).toBe(false);
  });

  test('TC-03 403 từ host khác hoặc shop.app status khác: không bỏ qua', () => {
    for (const [status, url] of [[403, 'https://hoa-qua-nhap-khau.myshopify.com/cart'], [403, 'https://evil.test/https://shop.app/'], [404, 'https://shop.app/pay'], [403, 'https://shop.app.evil.test/pay']] as const) {
      const { page, respond } = fakePage();
      const ignore = watchShopPay403(page);
      respond(status, url);
      expect(ignore(message(LOG_403, CHROME_ERROR)), `${status} ${url}`).toBe(false);
    }
  });

  test('TC-04 đã thấy 403 shop.app, lỗi khác vẫn giữ: 403 của theme, 500 chrome-error, warning, lỗi JS', () => {
    const { page, respond } = fakePage();
    const ignore = watchShopPay403(page);
    respond(403, 'https://shop.app/pay');
    expect(ignore(message(LOG_403, 'https://store.test/assets/x.js'))).toBe(false);
    expect(ignore(message('Failed to load resource: the server responded with a status of 500 ()', CHROME_ERROR))).toBe(false);
    expect(ignore(message(LOG_403, CHROME_ERROR, 'warning'))).toBe(false);
    expect(ignore(message('TypeError: x is not a function', 'https://store.test/'))).toBe(false);
  });
});

test.describe('ES1-T171 bộ lọc 403 Shop Pay (trình duyệt thật, trang giả)', () => {
  const ORIGIN = 'https://t171.invalid';
  const SHOP_APP_TEXT = /shop\.app/i; // như IGNORE_CONSOLE của spec: bỏ log "Refused to display 'https://shop.app/'", không khớp log 403

  // 403 có X-Frame-Options: Chrome chuyển iframe sang trang lỗi nên log "status of 403 ()" @ chrome-error://, đúng dạng trên CI.
  async function collect(page: Page, frame: string, script = '') {
    const errors: string[] = [];
    const isShopPay403 = watchShopPay403(page);
    page.on('console', (m) => {
      if (m.type() !== 'error' || isShopPay403(m)) return;
      const text = `${m.text()} @ ${m.location().url}`;
      if (!SHOP_APP_TEXT.test(text)) errors.push(text);
    });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    await page.route(`${ORIGIN}/`, (r) => r.fulfill({ contentType: 'text/html', body: `<!doctype html><iframe src="${frame}"></iframe><script>${script}</script>` }));
    await page.route(frame, (r) => r.fulfill({ status: 403, headers: { 'content-type': 'text/html', 'x-frame-options': 'DENY' }, body: '<h1>Forbidden</h1>' }));
    await page.goto(`${ORIGIN}/`);
    await page.waitForTimeout(500);
    return errors;
  }

  test('TC-05 iframe shop.app 403: 0 lỗi', async ({ page }) => {
    expect(await collect(page, 'https://shop.app/pay/t171')).toEqual([]);
  });

  test('TC-06 iframe 403 từ host khác: vẫn báo lỗi chrome-error', async ({ page }) => {
    const errors = await collect(page, 'https://other.invalid/pay');
    expect(errors.join('\n')).toMatch(/status of 403 .*@ chrome-error:\/\//);
  });

  test('TC-07 iframe shop.app 403 và lỗi JS của trang: lỗi JS vẫn còn', async ({ page }) => {
    const errors = await collect(page, 'https://shop.app/pay/t171', "throw new Error('t171-real')");
    expect(errors).toEqual(['pageerror: t171-real']);
  });
});

test.describe('ES1-T171 fetchRetry429', () => {
  function fakeRequest(statuses: number[]) {
    const calls: { url: string; method?: string }[] = [];
    const request = {
      fetch: async (url: string, init: { method?: string }) => {
        calls.push({ url, method: init.method });
        const status = statuses.shift() ?? 200;
        return { status: () => status, headers: () => ({ 'retry-after': '1' }) };
      },
    } as unknown as APIRequestContext;
    return { request, calls };
  }

  test('TC-08 URL đầy đủ, mặc định không ép method (GET), 429 rồi 200: thử lại', async () => {
    const { request, calls } = fakeRequest([429]);
    const res = await fetchRetry429(request, 'https://store.test/collections/all');
    expect(res.status()).toBe(200);
    expect(calls).toEqual([{ url: 'https://store.test/collections/all', method: undefined }, { url: 'https://store.test/collections/all', method: undefined }]);
  });

  test('TC-09 404 không thử lại, trả nguyên để test tự assert', async () => {
    const { request, calls } = fakeRequest([404]);
    expect((await fetchRetry429(request, 'https://store.test/x')).status()).toBe(404);
    expect(calls).toHaveLength(1);
  });
});

test.describe('ES1-T171 quy ước spec (tĩnh)', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('TC-10 regex bo góc: calc trên token qua, calc có giá trị cứng bị bắt', () => {
    const ok = ['calc(var(--radius-card) + var(--space-1))', 'calc(var(--a) - var(--b))', 'calc(var(--a) * 2)', 'calc(var(--a) / 1.5)', 'var(--radius-card)', '0', '50%', 'inherit'];
    for (const value of ok) expect(HARDCODED_RADIUS.test(`  border-radius: ${value};`), value).toBe(false);
    const bad = ['calc(var(--a) + 4px)', 'calc(4px + var(--a))', 'calc(1rem)', 'calc(var(--a) * 2px)', '8px', '1rem'];
    for (const value of bad) expect(HARDCODED_RADIUS.test(`  border-radius: ${value};`), value).toBe(true);
  });

  test('TC-11 base.css thật không có bo góc hardcode', () => {
    const lines = readFileSync('assets/base.css', 'utf8').split('\n').filter((l) => HARDCODED_RADIUS.test(l));
    expect(lines).toEqual([]);
  });

  test('TC-12 DoD: không còn đường dẫn Cart API ghi thẳng trong spec', () => {
    const pattern = /\/cart\/.*\.js/;
    const hits = specs().flatMap((f) => read(f).split('\n').filter((l) => pattern.test(l)).map((l) => `${f}: ${l.trim()}`));
    expect(hits).toEqual([]);
  });

  test('TC-13 mọi spec có console guard đếm mọi lỗi đều dùng watchShopPay403', () => {
    // ES1-T16, ES1-T30 chỉ đếm lỗi của đúng file JS nên không dính log chrome-error.
    const scoped = new Set(['ES1-T16.spec.ts', 'ES1-T30.spec.ts', 'ES1-T171.spec.ts']);
    const missing = specs().filter((f) => !scoped.has(f) && read(f).includes("on('console'") && !read(f).includes('watchShopPay403('));
    expect(missing).toEqual([]);
  });

  test('TC-14 ES1-T30 không gọi lại store trong route', () => {
    expect(read('ES1-T30.spec.ts')).not.toMatch(/route\.fetch\(/);
  });
});
