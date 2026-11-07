// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T175.spec.ts.
// Ticket ES1-T175 TE-17-FE0: template cổng /?view=figma, bỏ multicolumn và custom liquid khỏi trang chủ (plan ES1-T169 D2, CR-5).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T175.spec.ts
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { readFileSync } from 'node:fs';
import { watchShopPay403 } from './support/console-guard';

const FIGMA = '/?view=figma';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

// [container, block gốc] theo đúng thứ tự templates/index.liquid.
const ROWS = [
  ['figma-hero', 'slideshow'],
  ['figma-intro', 'rich-text'],
  ['figma-featured-collection', 'featured-collection'],
  ['figma-quiz', 'quiz'],
  ['figma-shop-the-look', 'shop-the-look'],
  ['figma-inspiration', 'image-with-text'],
  ['figma-bundle-builder', 'bundle-builder'],
  ['figma-featured-product', 'featured-product'],
  ['figma-video-carousel', 'video-carousel'],
  ['figma-testimonials', 'testimonials'],
  ['figma-why-choose', 'image-with-text'],
  ['figma-faq', 'faq'],
] as const;

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

async function expectNoSeriousAxe(page: Page) {
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

/** Tên block theo thứ tự trong file, bỏ container. Không gọi store. */
function blockNames(file: string) {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(/\{%-?\s*block\s+'([a-z-]+)'/g)].map((m) => m[1]).filter((name) => name !== 'container');
}

test.describe('ES1-T175 template cổng /?view=figma', () => {
  test('tĩnh: index.figma cùng danh sách và thứ tự block với index', () => {
    const figma = blockNames('templates/index.figma.liquid');
    expect(figma).toEqual(blockNames('templates/index.liquid'));
    expect(figma).not.toContain('multicolumn');
    expect(figma).not.toContain('custom-liquid');
  });

  test('12 band đúng thứ tự, mỗi band có block gốc, 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    const response = await page.goto(FIGMA);
    expect(response?.ok()).toBeTruthy();

    const bands = await page
      .locator('[data-testid^="container-figma-"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-testid')));
    // ES1-T184: hàng 3 đứng ngay sau hero; store chưa có figma-cat-* (ES1-T178) thì band không render.
    const row3 = 'container-figma-collection-list';
    if (bands.includes(row3)) expect(bands.indexOf(row3)).toBe(1);
    // ES1-T191: hàng 14 đứng ngay trước FAQ; store chưa có blog figma-blog (ES1-T178) thì band không render.
    const row14 = 'container-figma-blog-posts';
    if (bands.includes(row14)) expect(bands.indexOf(row14)).toBe(bands.indexOf('container-figma-faq') - 1);
    expect(bands.filter((id) => id !== row3 && id !== row14)).toEqual(ROWS.map(([id]) => `container-${id}`));

    for (const [id, root] of ROWS) {
      await expect(page.getByTestId(`container-${id}`).getByTestId(root), id).toHaveCount(1);
    }
    await expect(page.getByTestId('container-home-faq')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('tài nguyên: collection figma-* hoặc rơi về collections.all, block vẫn có sản phẩm', async ({ page }) => {
    await page.goto(FIGMA);
    const meta = page.getByTestId('figma-meta');
    for (const [attribute, handle] of [
      ['data-featured-collection', 'figma-tab-all'],
      ['data-bundle', 'figma-bundle'],
      ['data-featured-product', 'figma-ativafit-lava-featured'],
    ]) {
      const value = await meta.getAttribute(attribute);
      expect([handle, 'all'], attribute).toContain(value);
      test.info().annotations.push({ type: 'nguồn tài nguyên', description: `${handle}: ${value}` });
    }
    await expect(page.getByTestId('featured-collection-grid')).toHaveCount(1);
    await expect(page.getByTestId('featured-collection-placeholder')).toHaveCount(0);
    await expect(page.getByTestId('featured-product-title')).toHaveCount(1);
    await expect(page.getByTestId('bundle-builder')).toHaveCount(1);
  });

  test('chỉ 1 ảnh LCP, 1 h1', async ({ page }) => {
    await page.goto(FIGMA);
    expect(await page.locator('img[fetchpriority="high"]').count()).toBeLessThanOrEqual(1);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('axe 0 serious trên /?view=figma', async ({ page }) => {
    await page.goto(FIGMA);
    await expectNoSeriousAxe(page);
  });
});

test.describe('ES1-T175 trang chủ sau CR-5', () => {
  test('/ không có multicolumn, custom liquid; 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(HOME);
    for (const id of ['container-home-multicolumn', 'container-home-custom-liquid', 'multicolumn-column', 'custom-liquid', 'custom-liquid-placeholder']) {
      await expect(page.getByTestId(id), id).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });

  test('tĩnh: index.liquid không gọi multicolumn, custom-liquid; block vẫn còn ở index.te7', () => {
    expect(readFileSync('templates/index.liquid', 'utf8')).not.toMatch(/multicolumn|custom-liquid/);
    const te7 = readFileSync('templates/index.te7.liquid', 'utf8');
    expect(te7).toContain("block 'multicolumn'");
    expect(te7).toContain("block 'custom-liquid'");
  });
});
