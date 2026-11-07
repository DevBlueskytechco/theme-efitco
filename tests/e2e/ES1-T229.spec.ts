// Ticket ES1-T229 TE-17-QA7. Không gọi store, không gọi Cart API thật: kiểm helper trên trang giả và mã nguồn spec.
// Luồng thật của T73, T94, T95, T189, T203 chỉ chạy trên CI. Repro với server giả, gồm các spec đó: drafts/qa/ES1-T229/pw.repro.config.ts.
// Chạy: npx playwright test tests/e2e/ES1-T229.spec.ts
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import { actionCartCount } from './support/cart-api';
import { getJson } from './support/http';
import { requireJson } from './support/product-data';
import { CLOUDFLARE_BLOCKED, clickAndLoad, expectJsonAllowed, expectLoaded, isTabDataRequest, watchTabDataRequests } from './support/store-guard';

const ORIGIN = 'https://stub.test';
const E2E = join(process.cwd(), 'tests/e2e');
const spec = (name: string) => readFileSync(join(E2E, name), 'utf8');
const CHALLENGE = '<!doctype html><html><head><title>Just a moment...</title></head><body><div id="challenge-stage">Enable JavaScript and cookies to continue</div></body></html>';
const BLOCKED = { status: 403, headers: { 'cf-mitigated': 'challenge' }, body: CHALLENGE };
const html = (body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>stub</title></head><body>${body}</body></html>`;

type Fake = { status?: number; headers?: Record<string, string>; body: string };

// Mọi path khác trả 404. Host ngoài trả rỗng để đếm được request mà không ra mạng.
async function fakeStore(page: Page, pages: Record<string, Fake | ((method: string) => Fake)>) {
  await page.route(() => true, async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, body: '' });
    const made = pages[url.pathname];
    if (!made) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ contentType: 'text/html', ...(typeof made === 'function' ? made(route.request().method()) : made) });
  });
}

const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'kiểm mã nguồn, logic thuần: chạy 1 lần ở desktop');

test.describe('ES1-T229 getCart đọc đúng shape', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-01 AC1 shape thật và giỏ chưa có', () => {
    expect(actionCartCount({ cart: { totalQuantity: 2, lines: [], id: 'x' } })).toBe(2);
    expect(actionCartCount({ cart: { totalQuantity: 0 } })).toBe(0);
    expect(actionCartCount({ cart: null })).toBe(0);
    expect(actionCartCount(null)).toBe(0);
    expect(actionCartCount({ totalQuantity: 3 })).toBe(3);
    expect(actionCartCount({ item_count: 1 })).toBe(1);
  });

  for (const [name, value] of Object.entries({
    'object rỗng': {},
    'cart rỗng': { cart: {} },
    'cart không có số': { cart: { lines: [] } },
    'số dạng chuỗi': { cart: { totalQuantity: '2' } },
    'số âm': { cart: { totalQuantity: -1 } },
    'tên trường khác': { total: 2 },
    'cart là mảng': { cart: [] },
    'mảng': [],
    'chuỗi': 'x',
    'số': 5,
    undefined: undefined,
  })) {
    test(`TC-02 AC1 shape lạ vẫn fail: ${name}`, () => {
      expect(() => actionCartCount(value)).toThrow(/getCart không có totalQuantity, item_count/);
    });
  }

  test('TC-03 AC1 lỗi shape không in dữ liệu giỏ, chỉ in key', () => {
    expect(() => actionCartCount({ cart: { id: 'gid-secret' } })).toThrow(/key id$/);
  });

  test('TC-04 AC1 TC-25 của ES1-T203 dùng helper, giữ nguyên 2 assert', () => {
    const source = spec('ES1-T203.spec.ts');
    expect(source).not.toMatch(/const total\b|\btotal\(|ActionCart\b/);
    expect(source).toContain(`expect(actionCartCount(await callAction<unknown>('getCart'))).toBe(0);`);
    expect(source).toContain(`expect(actionCartCount(await callAction<unknown>('getCart')), 'getCart trả giỏ mới').toBe(2);`);
  });
});

test.describe('ES1-T229 gỡ spec thăm dò', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-05 AC2 không còn file thăm dò, không spec nào import', () => {
    expect(existsSync(join(E2E, 'ES1-T227.spec.ts'))).toBe(false);
    expect(existsSync(join(E2E, 'support/action-probe.ts'))).toBe(false);
    for (const name of ['ES1-T203.spec.ts', 'ES1-T189.spec.ts', 'ES1-T73.spec.ts', 'ES1-T94.spec.ts', 'ES1-T95.spec.ts']) {
      expect(spec(name), name).not.toContain('support/action-probe');
    }
  });
});

test.describe('ES1-T229 lọc request đổi tab', () => {
  const PAGE = `${ORIGIN}/?view=figma`;

  for (const url of [
    `${ORIGIN}/collections/figma-tab-weight`,
    `${ORIGIN}/collections/figma-tab-weight?section_id=x`,
    `${ORIGIN}/collections/all/products.json`,
    `${ORIGIN}/collections.json`,
    `${ORIGIN}/en-ca/collections/all`,
    `${ORIGIN}/products/a.js`,
    `${ORIGIN}/?view=figma&section_id=tab`,
    `${ORIGIN}/?view=figma`,
    `${ORIGIN}/search?q=a&sections=card`,
  ]) {
    test(`TC-06 AC3 tính: ${url}`, ({}, ti) => {
      desktopOnly(ti.project.name);
      expect(isTabDataRequest(url, PAGE)).toBe(true);
    });
  }

  for (const url of [
    'https://otlp-http-production.shopifysvc.com/v1/traces',
    'https://error-analytics-sessions-production.shopifysvc.com/',
    'https://shop.app/services/login_with_shop/authorize',
    'https://challenges.cloudflare.com/turnstile/v0/api.js',
    'https://cdn.shopify.com/collections/x',
    'https://monorail-edge.shopifysvc.com/v1/produce',
    'https://other.test/collections/all',
    `${ORIGIN}/services/login_with_shop/authorize`,
    `${ORIGIN}/api/collect`,
    `${ORIGIN}/.well-known/shopify/monorail/v1/produce`,
    `${ORIGIN}/cdn-cgi/challenge-platform/h/g/jsd/oneshot`,
    `${ORIGIN}/cdn/shop/products/a.jpg`,
    `${ORIGIN}/web-pixels-manager@1/products`,
  ]) {
    test(`TC-07 AC3 bỏ: ${url}`, ({}, ti) => {
      desktopOnly(ti.project.name);
      expect(isTabDataRequest(url, PAGE)).toBe(false);
    });
  }

  test('TC-08 AC3 trang thật: request ngoài theme, iframe không tính; fetch dữ liệu tab, tải lại có tính', async ({ page }) => {
    await fakeStore(page, { '/': { body: html('<p>stub</p>') } });
    await page.goto(PAGE);
    const requests = watchTabDataRequests(page);

    await page.evaluate(async () => {
      const send = (url: string, init?: RequestInit) => fetch(url, { mode: 'cors', ...init }).catch(() => null);
      await send('https://otlp-http-production.shopifysvc.com/v1/traces', { method: 'POST', body: '{}' });
      await send('https://challenges.cloudflare.com/cdn-cgi/flow');
      await send('/api/collect', { method: 'POST', body: '{}' });
      for (const src of ['/services/login_with_shop/authorize', 'https://challenges.cloudflare.com/x', 'https://shop.app/pay']) {
        await new Promise((done) => {
          const frame = document.createElement('iframe');
          frame.onload = done;
          frame.src = src;
          document.body.append(frame);
        });
      }
    });
    expect(requests).toEqual([]);

    // Đối chứng: lỗi thật vẫn bắt được, cả fetch lẫn XHR.
    await page.evaluate(async () => {
      await fetch('/collections/figma-tab-weight?section_id=x').catch(() => null);
      await new Promise((done) => {
        const xhr = new XMLHttpRequest();
        xhr.onloadend = done;
        xhr.open('GET', '/?view=figma&section_id=tab');
        xhr.send();
      });
    });
    await page.reload();
    expect(requests).toEqual([`${ORIGIN}/collections/figma-tab-weight?section_id=x`, `${ORIGIN}/?view=figma&section_id=tab`, `document: ${PAGE}`]);
  });

  test('TC-09 AC3 test bấm của ES1-T189 dùng bộ lọc mới, vẫn assert requests rỗng', ({}, ti) => {
    desktopOnly(ti.project.name);
    const source = spec('ES1-T189.spec.ts');
    expect(source).not.toContain('IGNORE_REQUEST');
    const body = source.slice(source.indexOf(`test('bấm: không reload`), source.indexOf(`test('mỗi tab clone 1 lần`));
    expect(body).toContain('const requests = watchTabDataRequests(page);');
    expect(body).toContain('expect(requests).toEqual([]);');
    expect(body).not.toContain(`page.on('request'`);
  });
});

test.describe('ES1-T229 nhận diện Cloudflare', () => {
  // Màn thử thách giả không được tính vào [429-tong-ket].
  let saved: string | undefined;
  test.beforeEach(() => {
    saved = process.env.E2E_429_LOG;
    delete process.env.E2E_429_LOG;
  });
  test.afterEach(() => {
    if (saved !== undefined) process.env.E2E_429_LOG = saved;
  });

  test('TC-10 AC4 T73, T94, T95 không còn điều hướng thiếu guard, T73 không skip khi store trả 403', ({}, ti) => {
    desktopOnly(ti.project.name);
    for (const name of ['ES1-T73.spec.ts', 'ES1-T94.spec.ts', 'ES1-T95.spec.ts']) {
      const source = spec(name);
      expect(source, name).not.toMatch(/\bpage\.goto\(/);
      expect(source, name).not.toMatch(/^\s*await page\.(reload|goBack|waitForLoadState)\(\);?$/m);
      expect(source, name).toContain('./support/store-guard');
    }
    expect(spec('ES1-T73.spec.ts')).not.toContain('res.status() >= 400');
    const nojs = spec('ES1-T94.spec.ts').split(`test.describe('nojs'`)[1];
    expect(nojs.match(/clickAndLoad\(/g)).toHaveLength(3);
    expect(nojs.match(/gotoNoScript\(page, '\/cart'\)/g)).toHaveLength(3);
    expect(spec('ES1-T95.spec.ts').split(`test.describe('nojs'`)[1]).toContain('await clickAndLoad(page, () => link.click());');
  });

  for (const javaScriptEnabled of [true, false]) {
    test.describe(javaScriptEnabled ? 'bật JS' : 'tắt JS', () => {
      test.use({ javaScriptEnabled });

      const form = html('<form method="post" action="/cart"><button data-testid="go">Update</button></form><a data-testid="link" href="/next">next</a><a data-testid="soft" href="/soft">soft</a><a data-testid="checkout" href="/checkouts/cn/1">co</a>');
      const open = async (page: Page, pages: Record<string, Fake | ((method: string) => Fake)> = {}) => {
        await fakeStore(page, { '/start': { body: form }, ...pages });
        await page.goto(`${ORIGIN}/start`);
      };

      test('TC-11 AC4 POST bị thử thách: nêu Cloudflare, không chờ tới timeout', async ({ page }) => {
        await open(page, { '/cart': BLOCKED });
        const started = Date.now();
        await expect(clickAndLoad(page, () => page.getByTestId('go').click())).rejects.toThrow(`${CLOUDFLARE_BLOCKED} (cf-mitigated, status 403)`);
        expect(Date.now() - started).toBeLessThan(10_000);
      });

      test('TC-12 AC4 link bị thử thách: có header, hoặc chỉ có title', async ({ page }) => {
        await open(page, { '/next': BLOCKED, '/soft': { body: CHALLENGE } });
        await expect(clickAndLoad(page, () => page.getByTestId('link').click())).rejects.toThrow(CLOUDFLARE_BLOCKED);
        await page.goto(`${ORIGIN}/start`);
        await expect(clickAndLoad(page, () => page.getByTestId('soft').click())).rejects.toThrow(/bị Cloudflare chặn \(title "Just a moment/);
      });

      test('TC-13 AC4 đối chứng: trang thường không báo chặn, kể cả có script jsd của Cloudflare; checkout có Turnstile thường', async ({ page }) => {
        const normal = html('<script src="/cdn-cgi/challenge-platform/scripts/jsd/main.js"></script><p data-testid="ready">ok</p>');
        const checkout = html('<script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script><p data-testid="ready">checkout</p>');
        await open(page, { '/next': { body: normal }, '/cart': { body: normal }, '/checkouts/cn/1': { body: checkout } });
        await clickAndLoad(page, () => page.getByTestId('link').click());
        await expect(page.getByTestId('ready')).toHaveText('ok');
        await page.goto(`${ORIGIN}/start`);
        await clickAndLoad(page, () => page.getByTestId('go').click());
        await expect(page.getByTestId('ready')).toHaveText('ok');
        await page.goto(`${ORIGIN}/start`);
        await clickAndLoad(page, () => page.getByTestId('checkout').click());
        await expect(page.getByTestId('ready')).toHaveText('checkout');
      });

      test('TC-14 AC4 checkout bị chặn bằng header vẫn báo', async ({ page }) => {
        await open(page, { '/checkouts/cn/1': BLOCKED });
        await expect(clickAndLoad(page, () => page.getByTestId('checkout').click())).rejects.toThrow(CLOUDFLARE_BLOCKED);
      });

      test('TC-15 AC4 lỗi 429 trên trang mới: nói rõ 429, không thành Cloudflare', async ({ page }) => {
        await open(page, { '/next': { status: 429, body: html('rate') } });
        await expect(clickAndLoad(page, () => page.getByTestId('link').click())).rejects.toThrow(/store trả 429/);
      });

      test('TC-16 AC4 reload bị chặn: nêu Cloudflare; response null (Back từ bfcache) không ném', async ({ page }) => {
        let blocked = false;
        await open(page, { '/next': () => (blocked ? BLOCKED : { body: html('<p>next</p>') }) });
        await page.goto(`${ORIGIN}/next`);
        await expectLoaded(page, null);
        blocked = true;
        await expect(expectLoaded(page, await page.reload())).rejects.toThrow(CLOUDFLARE_BLOCKED);
      });

      test('TC-17 AC4 lỗi không phải chặn giữ nguyên: nút không điều hướng thì hết giờ, không nêu Cloudflare', async ({ page }) => {
        test.setTimeout(40_000);
        await fakeStore(page, { '/start': { body: html('<button data-testid="noop" type="button">x</button>') } });
        await page.goto(`${ORIGIN}/start`);
        const error = await clickAndLoad(page, () => page.getByTestId('noop').click()).catch((e: Error) => e);
        expect(String(error)).toMatch(/Timeout 20000ms exceeded/);
        expect(String(error)).not.toContain(CLOUDFLARE_BLOCKED);
      });
    });
  }

  test('TC-18 AC4 JSON qua APIRequestContext bị chặn: nêu Cloudflare thay vì trả 403', async ({}, ti) => {
    desktopOnly(ti.project.name);
    const response = (status: number, headers: Record<string, string>, text = '') => ({ status: () => status, ok: () => status < 400, headers: () => headers, text: async () => text });
    const request = (res: ReturnType<typeof response>) => ({ get: async () => res }) as unknown as APIRequestContext;

    const blocked = await getJson(request(response(403, { 'cf-mitigated': 'challenge' })), '/cart.js', 1);
    expect(blocked.challenged).toBe(true);
    expect(() => expectJsonAllowed(blocked, '/cart.js')).toThrow(CLOUDFLARE_BLOCKED);
    expect(() => requireJson(blocked, '/cart.js')).toThrow(CLOUDFLARE_BLOCKED);

    const forbidden = await getJson(request(response(403, {})), '/cart.js', 1);
    expect(forbidden.challenged).toBe(false);
    expect(() => expectJsonAllowed(forbidden, '/cart.js')).not.toThrow();

    const ok = await getJson<{ a: number }>(request(response(200, {}, '{"a":1}')), '/cart.js', 1);
    expect(ok.body).toEqual({ a: 1 });
    expect(requireJson(ok, '/cart.js')).toEqual({ a: 1 });
  });
});
