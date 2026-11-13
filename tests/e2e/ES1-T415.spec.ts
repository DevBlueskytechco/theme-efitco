// KHÔNG CHẮC: chưa chạy (sandbox agent không mở trình duyệt, không gọi mạng) → chờ CI. Vị trí Shopify chèn import map (sau content_for_header,
// trước </head>) suy từ log CTO 11/11 (ES1-T277), không có nguồn tài liệu; spec storefront kiểm thứ tự thật trong DOM.
// Ticket ES1-T415: module nạp trước import map → "An import map is added after module script load was triggered" +
// "Failed to resolve module specifier @shopify/partial-rendering" (errors-in-console, Best Practices).
// Sửa: không thẻ script module nào trong <head> của layout; standard-events.js, motion.js dời xuống cuối <body>.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... npx playwright test tests/e2e/ES1-T415.spec.ts
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { watchShopPay403 } from './support/console-guard';

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const HANDLE = process.env.TE4_VARIANTS_HANDLE;
const IMPORT_MAP_ERROR = /import map is added after module script|Failed to resolve module specifier|Unable to resolve specifier|bare specifier/i;
const PLATFORM = /shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i;

// Asset theme: /cdn/shop/t/<id>/assets/ hoặc …/t/<id>/assets/; script Shopify chèn (/cdn/shopifycloud/…, vd webmcp) không phải module theme (CTO 12/11).
const isThemeAsset = (src: string) => /\/t\/\d+\/assets\//.test(src) && !/\/cdn\/shopifycloud\//.test(src);

const head = (liquid: string) => liquid.slice(0, liquid.indexOf('</head>'));
const moduleTags = (src: string) => src.match(/<script\b[^>]*type="module"[^>]*>/g) ?? [];

test.describe('ES1-T415 tĩnh', () => {
  for (const file of ['layout/theme.liquid', 'layout/password.liquid']) {
    test(`${file}: không thẻ script module trong <head>, không importmap`, () => {
      const liquid = read(file);
      expect(liquid.indexOf('</head>'), 'thiếu </head>').toBeGreaterThan(-1);
      expect(moduleTags(head(liquid)), 'script module trong head chạy trước import map Shopify').toEqual([]);
      expect(liquid, 'không thêm import map theme (AGENTS.md)').not.toMatch(/importmap/);
    });
  }

  test('theme.liquid: standard-events.js, motion.js, page-layers.js mỗi file 1 thẻ, nằm cuối body sau cart-drawer', () => {
    const liquid = read('layout/theme.liquid');
    const drawer = liquid.indexOf("block 'cart-drawer'");
    const end = liquid.indexOf('</body>');
    for (const name of ['standard-events', 'motion', 'page-layers']) {
      const re = new RegExp(`<script src="\\{\\{ '${name}\\.js' \\| asset_url \\}\\}" type="module"></script>`, 'g');
      const hits = [...liquid.matchAll(re)];
      expect(hits, `${name}.js`).toHaveLength(1);
      expect(hits[0].index!, `${name}.js sau cart-drawer`).toBeGreaterThan(drawer);
      expect(hits[0].index!, `${name}.js trước </body>`).toBeLessThan(end);
    }
    expect(moduleTags(liquid), 'layout chỉ có 3 thẻ module (thêm page-layers.js, ES1-T314)').toHaveLength(3);
  });
});

function watchImportMap(page: Page) {
  const errors: string[] = [];
  const ignore = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || ignore(msg)) return;
    if (PLATFORM.test(msg.location().url)) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

// Thứ tự thật trong DOM sau khi Shopify chèn: mọi script module phải đứng sau import map đầu tiên (nếu trang có import map).
const order = (page: Page) =>
  page.evaluate(() => {
    const all = [...document.querySelectorAll('script[type="importmap"], script[type="module"][src]')];
    const map = all.findIndex((s) => s.getAttribute('type') === 'importmap');
    const before = map < 0 ? [] : all.slice(0, map).map((s) => (s as HTMLScriptElement).src);
    const mapsPartials = map >= 0 && all.some((s) => s.getAttribute('type') === 'importmap' && s.textContent!.includes('@shopify/partial-rendering'));
    return { hasMap: map >= 0, mapsPartials, before, inHead: [...document.head.querySelectorAll('script[type="module"][src]')].map((s) => (s as HTMLScriptElement).src) };
  });

const PAGES: [string, () => string | undefined][] = [
  ['trang chủ', () => '/'],
  ['collection', () => '/collections/all'],
  ['giỏ hàng', () => '/cart'],
  ['sản phẩm', () => (HANDLE ? `/products/${HANDLE}` : undefined)],
];

test.describe('ES1-T415 storefront', () => {
  for (const [label, path] of PAGES) {
    test(`${label}: không module theme trước import map, 0 lỗi import map trên console`, async ({ page }) => {
      const url = path();
      test.skip(!url, 'Thiếu TE4_VARIANTS_HANDLE');
      const errors = watchImportMap(page);
      await page.goto(url!);
      await page.waitForLoadState('load');
      const o = await order(page);
      expect(o.inHead.filter(isThemeAsset), 'module theme trong <head>').toEqual([]);
      expect(o.before.filter(isThemeAsset), 'module theme đứng trước import map').toEqual([]);
      expect(errors.filter((e) => IMPORT_MAP_ERROR.test(e)), 'lỗi import map').toEqual([]);
    });
  }

  test('trang chủ: @shopify/partial-rendering resolve được, s-view-event vẫn được định nghĩa (không đổi hành vi)', async ({ page }) => {
    const errors = watchImportMap(page);
    await page.goto('/');
    const o = await order(page);
    test.skip(!o.mapsPartials, 'Store không cấp import map partial-rendering (agentic_editor_enabled tắt)');
    const ok = await page.evaluate(async () => {
      const m = await (0, eval)("import('@shopify/partial-rendering')");
      return typeof m.partials?.refresh === 'function';
    });
    expect(ok).toBe(true);
    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('s-view-event')))).toBe(true);
    expect(errors.filter((e) => IMPORT_MAP_ERROR.test(e))).toEqual([]);
  });

  test('giỏ hàng: cart-items.js (import partials tĩnh) chạy được', async ({ page }) => {
    const errors = watchImportMap(page);
    await page.goto('/cart');
    const o = await order(page);
    test.skip(!o.mapsPartials, 'Store không cấp import map partial-rendering');
    // Module có import tĩnh lỗi resolve thì không chạy: kiểm module đã nạp xong (performance entry) và không lỗi resolve.
    await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((e) => /\/assets\/cart-items\.js/.test(e.name)))).toBe(true);
    expect(errors.filter((e) => IMPORT_MAP_ERROR.test(e))).toEqual([]);
  });
});
