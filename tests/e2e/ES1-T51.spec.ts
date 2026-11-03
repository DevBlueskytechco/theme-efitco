// Ticket ES1-T51 (2727475000000140034): TE-3-FE2 blocks/featured-collection.liquid trên trang chủ.
// Đích: tests/e2e/ES1-T51.spec.ts (scope-guard chặn dev-fe ghi tests/, Orchestrator chép).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T51.spec.ts -g "AC1|AC7"
// Preview CI không có giá trị setting: block lấy collections['all'], products_to_show 8, columns_desktop 4, show_view_all false.
// EXPECT_VIEW_ALL=header|bottom khi store đã bật nút Xem tất cả; mặc định kiểm không có nút.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const LIMIT = Number(process.env.EXPECT_PRODUCTS_TO_SHOW ?? 8);
const DESKTOP_COLUMNS = Number(process.env.EXPECT_COLUMNS_DESKTOP ?? 4);
const VIEW_ALL = process.env.EXPECT_VIEW_ALL ?? '';

const viewports = [
  { width: 360, height: 800, columns: 2 },
  { width: 768, height: 1024, columns: 3 },
  { width: 1280, height: 900, columns: DESKTOP_COLUMNS },
];

async function openHome(page: Page) {
  await page.goto('/');
  const block = page.getByTestId('featured-collection');
  await expect(block, 'trang chủ có featured-collection (default_collection all)').toHaveCount(1);
  await block.scrollIntoViewIfNeeded();
  return block;
}

async function productCount(page: Page) {
  // /collections/all.json không có trên mọi store; đếm theo products.json, tối đa 250
  const res = await page.request.get('/products.json?limit=250');
  if (!res.ok()) return null;
  const body = await res.json();
  return (body.products as unknown[]).length;
}

test.describe('ES1-T51 featured collection', () => {
  for (const vp of viewports) {
    test(`AC1: ${vp.width}px lưới ${vp.columns} cột, số li = min(${LIMIT}, số sản phẩm)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const block = await openHome(page);
      await expect(block.getByTestId('featured-collection-placeholder'), 'storefront không có placeholder').toHaveCount(0);

      const grid = block.getByTestId('featured-collection-grid');
      expect(await grid.evaluate(el => el.tagName)).toBe('UL');
      const cols = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
      expect(cols).toBe(vp.columns);

      const items = grid.locator(':scope > li');
      const total = await productCount(page);
      if (total !== null) {
        await expect(items).toHaveCount(Math.min(LIMIT, total));
      } else {
        const n = await items.count();
        expect(n).toBeGreaterThan(0);
        expect(n).toBeLessThanOrEqual(LIMIT);
      }
      await expect(items.first().getByTestId('product-card')).toHaveCount(1);

      const heading = block.getByTestId('featured-collection-heading');
      if (await heading.count()) {
        expect(await heading.evaluate(el => el.tagName)).toBe('H2');
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'không tràn ngang').toBeLessThanOrEqual(0);

      const img = items.first().getByTestId('product-card-image');
      if (await img.count()) {
        await expect(img).toHaveAttribute('loading', 'lazy');
        await expect(img).toHaveAttribute('sizes', /\(min-width: 1280px\) calc\(1416px \/ \d\)/);
      }
    });
  }

  test('AC7: nút Xem tất cả theo setting (mặc định không có)', async ({ page }) => {
    const block = await openHome(page);
    const button = block.getByTestId('featured-collection-view-all');
    if (!VIEW_ALL) {
      await expect(button).toHaveCount(0);
      return;
    }
    await expect(button).toHaveCount(1);
    await expect(button).toHaveAttribute('href', /\/collections\//);
    await expect(button).toHaveAccessibleName(/^View all/);
    const inHeader = await button.evaluate(el => !!el.closest('.featured-collection__header'));
    expect(inHeader).toBe(VIEW_ALL === 'header');
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('a11y: axe trên / không có lỗi serious/critical trong block', async ({ page }) => {
    await openHome(page);
    const result = await new AxeBuilder({ page }).include('[data-testid="featured-collection"]').analyze();
    const bad = result.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});
