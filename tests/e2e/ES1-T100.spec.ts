// Ticket ES1-T100: helper tests/e2e/support/product-data.ts. Chạy với server HTTP cục bộ, không gọi store dev (không tốn hạn mức 429).
// Chạy: npx playwright test tests/e2e/ES1-T100.spec.ts
import { test, expect, type Browser } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { embeddedProduct, pageJson, productData, productDataNoScript, readCartJson, readCartNoScript, requireJson } from './support/product-data';

const HANDLE = `es1-t100-${Date.now()}`; // getJson cache file theo path: handle mới mỗi lượt chạy
const JS_PRODUCT = { id: 2, handle: HANDLE, variants: [{ id: 22, available: true, price: 200 }] };
const EMBEDDED = { product: { id: 1, title: 'A', handle: HANDLE }, options: ['Size'], currency: 'USD', variants: [{ id: 11, title: 'S', options: ['S'], available: true, price: 100, featured_media: null, requires_shipping: true }] };

let server: Server;
let origin: string;
let hits: Record<string, number>;
let fail429: Record<string, number>; // path → số lần trả 429 trước khi trả 200

function count(path: string) { hits[path] = (hits[path] ?? 0) + 1; return hits[path]; }

test.beforeAll(async () => {
  server = createServer((req, res) => {
    const path = new URL(req.url!, 'http://x').pathname;
    const n = count(path);
    if (n <= (fail429[path] ?? 0)) { res.writeHead(429, { 'retry-after': '1' }).end('{}'); return; }
    const html = (body: string) => res.writeHead(200, { 'content-type': 'text/html', 'set-cookie': 'cart=c1; Path=/' }).end(`<!doctype html><title>t</title>${body}`);
    if (path === `/products/${HANDLE}`) return html(`<script type="application/json" data-product-variants>${JSON.stringify(EMBEDDED)}</script>`);
    if (path === '/products/single') return html('<p>1 variant</p>');
    if (path === '/cart') return html('<p>cart</p>');
    if (path.endsWith('.js') && path.startsWith('/products/')) return void res.writeHead(200, { 'content-type': 'text/javascript' }).end(JSON.stringify(JS_PRODUCT));
    if (path === '/cart.js') {
      const hasCookie = /(^|; )cart=c1/.test(req.headers.cookie ?? '');
      return void res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ item_count: hasCookie ? 1 : 0 }));
    }
    res.writeHead(404).end('not found');
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
test.afterAll(() => new Promise((r) => server.close(r)));
test.beforeEach(() => { hits = {}; fail429 = {}; });

async function newPage(browser: Browser, javaScriptEnabled = true) {
  const context = await browser.newContext({ baseURL: origin, javaScriptEnabled });
  return { context, page: await context.newPage() };
}

test.describe('ES1-T100 product-data helper', () => {
  test('JSON nhúng: đọc được cả khi tắt JS, không gọi .js', async ({ browser }) => {
    const { context, page } = await newPage(browser, false);
    await page.goto(`/products/${HANDLE}`);
    const data = await productDataNoScript(page, HANDLE);
    expect(data).toEqual({ id: 1, handle: HANDLE, variants: EMBEDDED.variants });
    expect(hits[`/products/${HANDLE}.js`]).toBeUndefined();
    await context.close();
  });

  test('JSON nhúng khác handle → null', async ({ browser }) => {
    const { context, page } = await newPage(browser);
    await page.goto(`/products/${HANDLE}`);
    expect(await embeddedProduct(page, 'khac')).toBeNull();
    await context.close();
  });

  test('không có JSON nhúng (1 variant): fetch .js trong trang', async ({ browser }) => {
    const { context, page } = await newPage(browser);
    await page.goto('/products/single');
    const data = await productData(page, 'single');
    expect(data.id).toBe(2);
    expect(hits['/products/single.js']).toBe(1);
    await context.close();
  });

  test('trang chưa mở: fallback getJson', async ({ browser }) => {
    const { context, page } = await newPage(browser);
    const r = await pageJson<{ id: number }>(page, `/products/${HANDLE}-blank.js`);
    expect(r.ok).toBe(true);
    expect(r.body?.id).toBe(2);
    await context.close();
  });

  test('429 tạm thời: thử lại trong trang rồi trả dữ liệu, Retry-After có hiệu lực', async ({ browser }) => {
    fail429['/cart.js'] = 2;
    const { context, page } = await newPage(browser);
    await page.goto('/cart');
    const started = Date.now();
    const cart = await readCartJson<{ item_count: number }>(page);
    expect(cart.item_count).toBe(1);
    expect(hits['/cart.js']).toBe(3);
    expect(Date.now() - started).toBeGreaterThanOrEqual(1900);
    await context.close();
  });

  test('429 hết lượt thử: pageJson trả status 429, đúng 4 lần gọi', async ({ browser }) => {
    fail429['/cart.js'] = 99;
    const { context, page } = await newPage(browser);
    await page.goto('/cart');
    const r = await pageJson(page, '/cart.js');
    expect(r).toEqual({ ok: false, status: 429, body: null });
    expect(hits['/cart.js']).toBe(4);
    await context.close();
  });

  test('requireJson: lỗi khác 429 → fail, không skip', () => {
    expect(() => requireJson({ ok: false, status: 404, body: null }, '/x.js')).toThrow(/\/x\.js trả 404/);
  });

  test('cart không cache: 2 lần đọc liên tiếp đều tới server', async ({ browser }) => {
    const { context, page } = await newPage(browser);
    await page.goto('/cart');
    await readCartJson(page);
    await readCartJson(page);
    expect(hits['/cart.js']).toBe(2);
    await context.close();
  });

  test('tắt JS: đọc giỏ qua context phụ, chép được cookie cart', async ({ browser }) => {
    const { context, page } = await newPage(browser, false);
    await page.goto('/cart');
    expect((await readCartNoScript<{ item_count: number }>(page)).item_count).toBe(1);
    expect(browser.contexts()).toContain(context);
    await context.close();
  });

  test('DoD: không spec nào request.get thẳng /products', () => {
    const dir = join(process.cwd(), 'tests/e2e');
    const offenders = readdirSync(dir).filter((f) => f.endsWith('.spec.ts') && f !== 'ES1-T100.spec.ts')
      .filter((f) => readFileSync(join(dir, f), 'utf8').includes('request.get(`/products'));
    expect(offenders).toEqual([]);
  });
});
