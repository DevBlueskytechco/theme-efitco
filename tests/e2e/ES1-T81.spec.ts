// KHÔNG CHẮC: spec chưa chạy (sandbox agent không mở được trình duyệt) → chờ CI. Thẻ script trong layout/theme.liquid chưa thêm (scope-guard chặn dev-be ghi layout/, hỏi ES1-T82): test "layout" fail tới khi có.
// Ticket ES1-T81 (bug TE-4, CI PR #67): @shopify/standard-events không resolve (không có import map) → import thẳng URL CDN.
// Luồng AC12 (event shopify:product:select, cả tổ hợp không tồn tại) nằm ở tests/e2e/ES1-T66.spec.ts.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... npx playwright test tests/e2e/ES1-T81.spec.ts tests/e2e/ES1-T66.spec.ts -g "AC12|ES1-T81"
import { test, expect, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const CDN = 'https://cdn.shopify.com/storefront/standard-events.js';
const HANDLE = process.env.TE4_VARIANTS_HANDLE;
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

const cdnLoaded = (page: Page) =>
  page.evaluate((url) => performance.getEntriesByType('resource').filter((e) => e.name.split('?')[0] === url).length, CDN);

test.describe('ES1-T81 tĩnh', () => {
  test('assets/standard-events.js ≤ 1 KB, import URL CDN, đăng ký s-view-event có guard', () => {
    const js = read('assets/standard-events.js');
    expect(Buffer.byteLength(js)).toBeLessThanOrEqual(1024);
    expect(js).toContain(`"${CDN}"`);
    expect(js).toMatch(/export const loadStandardEvents/);
    expect(js).toMatch(/customElements\.get\("s-view-event"\)/);
    expect(js).toMatch(/customElements\.define\("s-view-event", m\.createViewEventElement\(\)\)/);
  });

  test('không còn bare specifier @shopify/standard-events, không import map', () => {
    for (const f of readdirSync(join(ROOT, 'assets')).filter((n) => n.endsWith('.js'))) {
      expect(read(`assets/${f}`), f).not.toMatch(/["']@shopify\/standard-events["']/);
    }
    for (const f of ['layout/theme.liquid', 'layout/password.liquid']) expect(read(f), f).not.toMatch(/importmap/);
  });

  test('picker dùng ProductSelectEvent.createPromise() khi có', () => {
    const js = read('assets/product-variant-picker.js');
    expect(js).toContain(`import("${CDN}")`);
    expect(js).toMatch(/createPromise\?\.\(\)/);
  });

  test('layout nạp standard-events.js bằng 1 thẻ script type=module', () => {
    const tags = read('layout/theme.liquid').match(/<script[^>]*'standard-events\.js'\s*\|\s*asset_url[^>]*>/g) ?? [];
    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatch(/type="module"/);
  });
});

test.describe('ES1-T81 storefront', () => {
  test('trang chủ: thư viện CDN tải, s-view-event được định nghĩa, 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto('/');
    await expect.poll(() => cdnLoaded(page)).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('s-view-event')))).toBe(true);
    expect(errors).toEqual([]);
  });

  test('trang sản phẩm: thư viện CDN tải đúng 1 lần, ProductSelectEvent có, 0 console error', async ({ page }) => {
    test.skip(!HANDLE, 'Thiếu TE4_VARIANTS_HANDLE');
    const errors = watchConsole(page);
    await page.goto(`/products/${HANDLE}`);
    await expect(page.getByTestId('product-variant-picker')).toBeVisible();
    await expect.poll(() => cdnLoaded(page)).toBe(1);
    const hasEvent = await page.evaluate(async (url) => typeof (await import(url)).ProductSelectEvent === 'function', CDN);
    expect(hasEvent).toBe(true);
    expect(errors).toEqual([]);
  });
});
