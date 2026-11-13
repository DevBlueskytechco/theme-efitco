// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có preview); chờ CI.
// Ticket ES1-T338 TE-3-R2-BE2: gỡ assets/product-swatch.js khỏi featured-collection, collection-products, quiz; xoá file.
// AC: docs/srs.md TE-3 AC2 (swatch card là chỉ báo, không JS), ADR 0010 (product-swatch 0 B).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T338.spec.ts
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Browser, type Page } from '@playwright/test';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const ROOT = process.cwd();
const IGNORE_CONSOLE = [
  /shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i,
  // Lỗi thứ tự importmap có sẵn trên develop, sửa ở ES1-T415 (CTO 13/11 trên ES1-T337): ngoài phạm vi ticket này.
  /Failed to resolve module specifier "?@shopify\/partial-rendering/,
];
const PAGES = ['/', '/collections/all', '/?view=te11'];
const LAZY = `<script src="{{ 'lazy-module.js' | asset_url }}" type="module">`;
const QUIZ_DIALOG = `<script src="{{ 'quiz-dialog.js' | asset_url }}" type="module">`;

const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');
const scripts = (rel: string) => read(rel).match(/<script[^>]*>/g) ?? [];

function liquidFiles(dir: string): string[] {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).flatMap((name) => {
    const rel = join(dir, name);
    if (statSync(join(ROOT, rel)).isDirectory()) return liquidFiles(rel);
    return name.endsWith('.liquid') ? [rel] : [];
  });
}

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Mọi request tới product-swatch*.js trong vòng đời trang. */
function watchSwatchRequests(page: Page) {
  const hits: string[] = [];
  page.on('request', (req) => {
    if (/\/product-swatch[^/]*\.js/.test(new URL(req.url()).pathname)) hits.push(req.url());
  });
  return hits;
}

async function scrollToEnd(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, document.body.scrollHeight);
  });
}

async function noJsPage(browser: Browser) {
  const use = test.info().project.use;
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: 'tests/setup/state.json',
    baseURL: use.baseURL,
    ...(use.viewport ? { viewport: use.viewport } : {}),
    ...(use.userAgent ? { userAgent: use.userAgent } : {}),
    ...(use.isMobile !== undefined ? { isMobile: use.isMobile, hasTouch: use.hasTouch } : {}),
  });
  return { context, page: await context.newPage() };
}

test.describe('ES1-T338 tĩnh', () => {
  test('AC2 ADR 0010: assets/product-swatch.js đã xoá', ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    expect(existsSync(join(ROOT, 'assets', 'product-swatch.js'))).toBe(false);
  });

  test('DoD: 0 tham chiếu product-swatch trong blocks, snippets, layout, templates, assets', ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    const files = ['blocks', 'snippets', 'layout', 'templates'].flatMap(liquidFiles);
    expect(files.length).toBeGreaterThan(0);
    const offenders = files.filter((f) => read(f).includes('product-swatch'));
    const assets = readdirSync(join(ROOT, 'assets'))
      .filter((f) => /\.(js|css)$/.test(f))
      .filter((f) => read(join('assets', f)).includes('product-swatch'));
    expect([...offenders, ...assets.map((f) => `assets/${f}`)]).toEqual([]);
  });

  test('thẻ script còn lại của 3 block đúng như trước trừ product-swatch', ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    expect(scripts('blocks/featured-collection.liquid')).toEqual([LAZY]);
    expect(scripts('blocks/collection-products.liquid')).toEqual([]);
    expect(scripts('blocks/quiz.liquid').sort()).toEqual([LAZY, QUIZ_DIALOG].sort());
  });

  test('featured-collection không còn biến chỉ dùng cho thẻ script đã gỡ', ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    expect(read('blocks/featured-collection.liquid')).not.toContain('any_products');
  });

  test('ADR 0010: mọi file JS ≤ 8 192 B', ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    const over = readdirSync(join(ROOT, 'assets'))
      .filter((f) => f.endsWith('.js'))
      .map((f) => [f, statSync(join(ROOT, 'assets', f)).size] as const)
      .filter(([, size]) => size > 8192);
    expect(over).toEqual([]);
  });
});

test.describe('ES1-T338 storefront', () => {
  for (const path of PAGES) {
    test(`AC2 ${path}: không tải product-swatch.js, không <product-swatch>, 0 console error`, async ({ page }) => {
      const errors = watchConsole(page);
      const hits = watchSwatchRequests(page);
      const res = await page.goto(path);
      expect(res?.status(), `HTTP ${path}`).toBeLessThan(400);
      await expectNotChallenged(page);
      await scrollToEnd(page);
      await page.waitForLoadState('networkidle');

      expect(hits).toEqual([]);
      await expect(page.locator('script[src*="product-swatch"]')).toHaveCount(0);
      await expect(page.locator('product-swatch')).toHaveCount(0);
      expect(await page.evaluate(() => customElements.get('product-swatch') === undefined)).toBe(true);
      expect(errors).toEqual([]);
    });
  }

  test('AC2 /collections/all: card vẫn đủ link, ảnh; swatch là chỉ báo aria-hidden', async ({ page }) => {
    await page.goto('/collections/all');
    await expectNotChallenged(page);
    const cards = page.getByTestId('collection-grid').getByTestId('product-card');
    const n = await cards.count();
    test.skip(n === 0, '/collections/all không có sản phẩm');
    await expect(cards.first().getByTestId('product-card-title')).toHaveAttribute('href', /\/products\//);
    const swatches = page.getByTestId('collection-grid').getByTestId('product-card-swatches');
    if (await swatches.count()) {
      await expect(swatches.first()).toHaveAttribute('aria-hidden', 'true');
      await expect(swatches.first().locator('input, button, a')).toHaveCount(0);
    }
  });

  test('nojs AC2 /collections/all: card render đủ, link tiêu đề dùng được', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    try {
      await page.goto('/collections/all');
      const card = page.getByTestId('collection-grid').getByTestId('product-card').first();
      test.skip((await card.count()) === 0, '/collections/all không có sản phẩm');
      const href = await card.getByTestId('product-card-title').getAttribute('href');
      expect(href).toMatch(/\/products\//);
      const res = await page.goto(href!);
      expect(res?.status()).toBeLessThan(400);
    } finally {
      await context.close();
    }
  });
});
