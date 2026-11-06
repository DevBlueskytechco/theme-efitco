// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T108.spec.ts.
// Ticket ES1-T108 TE-6-FE1: trang collection + list-collections (docs/srs.md#TE-6 AC1, AC5; drafts/techlead/ES1-T103/task-split.md D2, D3, D4, D11, D12).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T108.spec.ts -g "AC1|AC5|nojs"
// Dữ liệu (ES1-T105 chưa trả lời): thiếu TE6_* → dùng /collections/all, test cần dữ liệu riêng skip có lý do.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { watchShopPay403 } from './support/console-guard';

const ALL = '/collections/all';
const LIST = '/collections';
const PAGE_SIZE = 24;
const MAX_PAGES = 5;

const ENV = {
  collection: env('TE6_COLLECTION_HANDLE'),
  empty: env('TE6_EMPTY_COLLECTION_HANDLE'),
  image: env('TE6_IMAGE_COLLECTION_HANDLE'),
};
const MAIN = ENV.collection ? `/collections/${encodeURIComponent(ENV.collection)}` : ALL;

// Giống smoke.spec.ts: lỗi console không thuộc theme.
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (isShopPay403(m)) return;
    const text = `${m.text()} @ ${m.location().url}`;
    if (!IGNORE_CONSOLE.some((r) => r.test(text))) errors.push(text);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

async function expectAxeClean(page: Page, include: string) {
  const r = await new AxeBuilder({ page }).include(include).analyze();
  const bad = r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
  const report = bad.map((v) => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(report, `axe serious/critical trong ${include}`).toEqual([]);
}

const columnCount = (page: Page) =>
  page.getByTestId('collection-grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);

test.describe('ES1-T108 TE-6 trang collection', () => {
  test('AC1 banner: đúng 1 h1 là title, axe sạch, 0 console error', async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto(MAIN);
    expect(res?.status(), `HTTP ${MAIN}`).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByTestId('collection-banner').getByTestId('collection-banner-title')).toBeVisible();
    await expect(page.getByTestId('collection-banner-title')).not.toBeEmpty();
    expect(errors, errors.join('\n')).toEqual([]);
    await expectAxeClean(page, 'main');
  });

  test('AC1 ảnh banner: eager, fetchpriority high, object-position theo focal, card đều lazy', async ({ page }) => {
    test.skip(!ENV.image, 'Thiếu TE6_IMAGE_COLLECTION_HANDLE (ES1-T105 #5)');
    await page.goto(`/collections/${encodeURIComponent(ENV.image!)}`);
    const img = page.getByTestId('collection-banner-image').locator('img');
    await expect(img).toHaveAttribute('loading', 'eager');
    await expect(img).toHaveAttribute('fetchpriority', 'high');
    await expect(img).toHaveAttribute('style', /object-position/);
    expect(await img.evaluate((el) => getComputedStyle(el).objectFit)).toBe('cover');
    // Không crop server: URL ảnh không có tham số crop
    expect(await img.getAttribute('src')).not.toMatch(/crop=/);
    await expect(page.getByTestId('collection-banner-description')).toBeVisible();

    const eagerCards = page.getByTestId('product-card-image').and(page.locator('[loading="eager"]'));
    await expect(eagerCards).toHaveCount(0);
  });

  test('AC1 không banner: hàng đầu eager theo columns_desktop, còn lại lazy', async ({ page }) => {
    await page.goto(MAIN);
    test.skip((await page.getByTestId('collection-banner-image').count()) > 0, `${MAIN} có ảnh banner`);
    const items = page.getByTestId('collection-product');
    test.skip((await items.count()) === 0, `${MAIN} không có sản phẩm`);
    const columns = Number(await page.getByTestId('collection-products').evaluate((el) => (el as HTMLElement).style.getPropertyValue('--columns')));
    // Theo vị trí card, không theo số img: card thiếu ảnh không có img (null)
    const loading = await items.evaluateAll((els) =>
      els.map((li) => li.querySelector('[data-testid="product-card-image"]')?.getAttribute('loading') ?? null),
    );
    const label = loading.join(',');
    expect(loading.slice(0, columns).every((v) => v === 'eager' || v === null), label).toBe(true);
    expect(loading.slice(columns).every((v) => v === 'lazy' || v === null), label).toBe(true);
  });

  test('AC1 lưới: tối đa 24 card, số kết quả, data-results-label, 2 cột ở 360, 4 cột ở 1280', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(MAIN);
    const cards = page.getByTestId('collection-product');
    const count = await cards.count();
    test.skip(count === 0, `${MAIN} không có sản phẩm`);
    expect(count).toBeLessThanOrEqual(PAGE_SIZE);
    await expect(cards.first().getByTestId('product-card')).toHaveCount(1);
    await expect(page.getByTestId('collection-products').getByTestId('collection-count')).not.toBeEmpty();
    const label = await page.getByTestId('collection-results').getAttribute('data-results-label');
    expect(label, 'data-results-label').toBeTruthy();
    await expect(page.getByTestId('collection-count')).toHaveText(label!);
    // Tiêu đề card là h2 (trang không có h2 khác)
    await expect(cards.first().locator('h2')).toHaveCount(1);

    expect(await columnCount(page), '360').toBe(2);
    await page.setViewportSize({ width: 768, height: 800 });
    expect(await columnCount(page), '768').toBe(3);
    await page.setViewportSize({ width: 1280, height: 800 });
    expect(await columnCount(page), '1280').toBe(4);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      'không tràn ngang',
    ).toBe(true);
  });

  test('AC1 CSS cột: --columns 2/3 và --columns-mobile 1 có tác dụng', async ({ page }) => {
    // Preview chỉ có default (D12): đổi biến trên DOM để kiểm CSS, đổi setting thật là bằng chứng tay.
    await page.goto(MAIN);
    test.skip((await page.getByTestId('collection-grid').count()) === 0, `${MAIN} không có sản phẩm`);
    const setVar = (name: string, value: string) =>
      page.getByTestId('collection-products').evaluate((el, [n, v]) => (el as HTMLElement).style.setProperty(n, v), [name, value]);

    await page.setViewportSize({ width: 1280, height: 800 });
    await setVar('--columns', '2');
    expect(await columnCount(page)).toBe(2);
    await setVar('--columns', '3');
    expect(await columnCount(page)).toBe(3);

    await page.setViewportSize({ width: 360, height: 800 });
    await setVar('--columns-mobile', '1');
    expect(await columnCount(page)).toBe(1);
  });

  test('AC1 sold out: card có badge', async ({ page }) => {
    for (let n = 1; n <= MAX_PAGES; n++) {
      const res = await page.goto(n === 1 ? MAIN : `${MAIN}?page=${n}`);
      if (!res || res.status() >= 400) break;
      const cards = page.getByTestId('collection-product');
      const badge = cards.getByTestId('product-card-badge-sold-out').first();
      if (await badge.count()) {
        await expect(badge).toHaveText(/\S/);
        return;
      }
      if ((await cards.count()) < PAGE_SIZE) break;
    }
    test.skip(true, `Không có sản phẩm hết hàng trong ${MAX_PAGES} trang đầu ${MAIN}`);
  });

  test('AC1 phân trang: link page 2 đúng, aria-current, Previous ở trang 2', async ({ page }) => {
    await page.goto(MAIN);
    const nav = page.getByTestId('pagination');
    test.skip((await nav.count()) === 0, `${MAIN} không đủ 2 trang (ES1-T105 #1)`);
    await expect(nav).toHaveAttribute('aria-label', /\S/);
    await expect(page.getByTestId('pagination-previous')).toHaveCount(0);
    await expect(page.getByTestId('pagination-current')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('pagination-current')).toHaveText('1');
    await expect(page.getByTestId('pagination-next')).toHaveAttribute('href', /[?&]page=2\b/);

    await page.getByTestId('pagination-next').click();
    await expect(page).toHaveURL(/[?&]page=2\b/);
    await expect(page.getByTestId('pagination-current')).toHaveText('2');
    await expect(page.getByTestId('pagination-previous')).toBeVisible();
    await expect(page.getByTestId('collection-product').first()).toBeVisible();

    const target = await page.getByTestId('pagination-next').or(page.getByTestId('pagination-previous')).first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    expect(target.w).toBeGreaterThanOrEqual(44);
    expect(target.h).toBeGreaterThanOrEqual(44);
    await expectAxeClean(page, '[data-testid="pagination"]');
  });

  test('AC1 rỗng: có thông báo và link tất cả sản phẩm', async ({ page }) => {
    test.skip(!ENV.empty, 'Thiếu TE6_EMPTY_COLLECTION_HANDLE (ES1-T105 #4)');
    const errors = watchErrors(page);
    await page.goto(`/collections/${encodeURIComponent(ENV.empty!)}`);
    await expect(page.getByTestId('collection-empty')).toBeVisible();
    await expect(page.getByTestId('collection-empty-cta')).toHaveAttribute('href', /\/collections\/all$/);
    await expect(page.getByTestId('collection-grid')).toHaveCount(0);
    await expect(page.getByTestId('collection-count')).toHaveCount(0);
    await expect(page.getByTestId('pagination')).toHaveCount(0);
    expect(errors, errors.join('\n')).toEqual([]);
    await expectAxeClean(page, 'main');
  });

  test('AC1 mã nguồn: không JSON template, 2 setting cột, không presets', async () => {
    const root = process.cwd();
    expect(readdirSync(join(root, 'templates')).filter((f) => f.endsWith('.json'))).toEqual([]);
    const src = readFileSync(join(root, 'blocks', 'collection-products.liquid'), 'utf8');
    const schema = JSON.parse(src.match(/{% schema %}([\s\S]*?){% endschema %}/)![1]);
    expect(schema.presets).toBeUndefined();
    const ids = schema.settings.map((s: { id: string }) => s.id);
    expect(ids).toEqual(['columns_desktop', 'columns_mobile']);
    expect(existsSync(join(root, 'snippets', 'pagination.liquid'))).toBe(true);
  });
});

test.describe('ES1-T108 TE-6 list-collections', () => {
  test('AC5 h1, card có ảnh hoặc placeholder, title, link, lưới', async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto(LIST);
    expect(res?.status(), `HTTP ${LIST}`).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const cards = page.getByTestId('list-collections').getByTestId('list-collections-card');
    const count = await cards.count();
    test.skip(count === 0, 'Store không có collection');
    expect(count).toBeLessThanOrEqual(PAGE_SIZE);

    const first = cards.first();
    await expect(first.getByTestId('list-collections-card-title')).not.toBeEmpty();
    expect(await first.getAttribute('href')).toMatch(/\/collections\//);
    await expect(first.locator('img, svg')).toHaveCount(1);
    const ratio = await first.locator('img, svg').evaluate((el) => {
      const r = el.parentElement!.getBoundingClientRect();
      return r.width / r.height;
    });
    expect(ratio).toBeCloseTo(336 / 270, 1);

    expect(errors, errors.join('\n')).toEqual([]);
    await expectAxeClean(page, 'main');
  });

  test('AC5 lưới 2 / 3 / 4 cột', async ({ page }) => {
    await page.goto(LIST);
    const grid = page.getByTestId('list-collections').locator('ul').first();
    test.skip((await grid.count()) === 0, 'Store không có collection');
    const cols = () => grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    await page.setViewportSize({ width: 360, height: 800 });
    expect(await cols()).toBe(2);
    await page.setViewportSize({ width: 768, height: 800 });
    expect(await cols()).toBe(3);
    await page.setViewportSize({ width: 1280, height: 800 });
    expect(await cols()).toBe(4);
  });

  test('AC5 mã nguồn: không còn style --grid-gap', async () => {
    const src = readFileSync(join(process.cwd(), 'templates', 'list-collections.liquid'), 'utf8');
    expect(src).not.toContain('style="--grid-gap');
  });

  test('AC5 phân trang chỉ hiện khi trên 24 collection', async ({ page }) => {
    await page.goto(LIST);
    const cards = await page.getByTestId('list-collections-card').count();
    const nav = page.getByTestId('pagination');
    if (cards < PAGE_SIZE) {
      await expect(nav).toHaveCount(0);
      return;
    }
    test.skip((await nav.count()) === 0, 'Đúng 24 collection, không có trang 2');
    await expect(page.getByTestId('pagination-next')).toHaveAttribute('href', /[?&]page=2\b/);
  });
});

test.describe('ES1-T108 nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('nojs phân trang bằng link thường, lưới và banner vẫn hiện', async ({ page }) => {
    await page.goto(MAIN);
    await expect(page.getByTestId('collection-banner-title')).toBeVisible();
    await expect(page.getByTestId('collection-products')).toBeVisible();
    const next = page.getByTestId('pagination-next');
    test.skip((await next.count()) === 0, `${MAIN} không đủ 2 trang (ES1-T105 #1)`);
    await next.click();
    await expect(page).toHaveURL(/[?&]page=2\b/);
    await expect(page.getByTestId('pagination-current')).toHaveText('2');
    await expect(page.getByTestId('collection-product').first()).toBeVisible();
  });

  test('nojs list-collections hiện và link card chạy', async ({ page }) => {
    await page.goto(LIST);
    const card = page.getByTestId('list-collections-card').first();
    test.skip((await card.count()) === 0, 'Store không có collection');
    await expect(card).toBeVisible();
    await card.click();
    await expect(page.getByTestId('collection-banner-title')).toBeVisible();
  });
});
