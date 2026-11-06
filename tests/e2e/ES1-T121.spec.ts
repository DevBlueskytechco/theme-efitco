// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T121.spec.ts.
// Ticket ES1-T121 TE-7-FE4: multicolumn, Custom Liquid (docs/srs.md#TE-7 AC4, AC5; drafts/techlead/ES1-T114/task-split.md D1, D2, D6, D7, D8).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T121.spec.ts -g "AC4|AC5"
// Biến thể chạy trên /?view=te7 (templates/index.te7.liquid), mặc định schema chạy trên /.
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { watchShopPay403 } from './support/console-guard';

const TE7 = '/?view=te7';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const column = (page: Page, id: string) => page.locator(`[data-multicolumn-column-id="${id}"]`);

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
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

/** Số hàng và số cột thật theo vị trí card, không dựa vào CSS. */
async function layout(scope: Locator) {
  const boxes = await tid(scope, 'multicolumn-column').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y) };
    }),
  );
  return { count: boxes.length, xs: new Set(boxes.map((b) => b.x)).size, ys: new Set(boxes.map((b) => b.y)).size };
}

async function expectNoPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('ES1-T121 TE-7 multicolumn, Custom Liquid', () => {
  test('AC4 1280: 2, 3, 4 cột cùng một hàng', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(TE7);
    for (const [id, count] of [
      ['te7-multicolumn-two', 2],
      ['te7-multicolumn-three', 3],
      ['te7-multicolumn-four', 4],
    ] as [string, number][]) {
      expect(await layout(band(page, id)), id).toEqual({ count, xs: count, ys: 1 });
    }
    await expectNoPageOverflow(page);
  });

  test('AC4 360: đúng 1 cột, không tràn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(TE7);
    for (const [id, count] of [
      ['te7-multicolumn-two', 2],
      ['te7-multicolumn-three', 3],
      ['te7-multicolumn-four', 4],
    ] as [string, number][]) {
      expect(await layout(band(page, id)), id).toEqual({ count, xs: 1, ys: count });
    }
    await expectNoPageOverflow(page);
  });

  test('AC4 768: 2 cột, 3 và 4 mục xuống hàng', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto(TE7);
    expect(await layout(band(page, 'te7-multicolumn-two'))).toEqual({ count: 2, xs: 2, ys: 1 });
    expect(await layout(band(page, 'te7-multicolumn-three'))).toEqual({ count: 3, xs: 2, ys: 2 });
    expect(await layout(band(page, 'te7-multicolumn-four'))).toEqual({ count: 4, xs: 2, ys: 2 });
    await expectNoPageOverflow(page);
  });

  test('AC4 mỗi cột có icon hoặc ảnh, heading, text, link', async ({ page }) => {
    await page.goto(TE7);
    const withIcon = column(page, 'te7-mc-two-1');
    await expect(tid(withIcon, 'multicolumn-column-heading')).toHaveText('Fast delivery');
    await expect(tid(withIcon, 'multicolumn-text')).toContainText('Link falls back');
    await expect(tid(withIcon, 'multicolumn-link')).toHaveText('Shop All Products');
    await expect(tid(withIcon, 'multicolumn-image')).toHaveCount(0);
    await expect(tid(band(page, 'te7-multicolumn-two'), 'multicolumn-heading')).toHaveText('Two columns with icons');

    const withImage = column(page, 'te7-mc-three-1');
    await expect(tid(withImage, 'multicolumn-icon')).toHaveCount(0);
    await expect(tid(withImage, 'multicolumn-column-heading')).toHaveText('Strength');
  });

  test('AC4 icon 40px, aria-hidden', async ({ page }) => {
    await page.goto(TE7);
    const svg = tid(column(page, 'te7-mc-two-1'), 'multicolumn-icon').locator('svg');
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    const box = await svg.boundingBox();
    expect(box!.width).toBe(40);
    expect(box!.height).toBe(40);
  });

  test('AC4 ảnh tỉ lệ 3 / 2, lazy, có width và height', async ({ page }) => {
    await page.goto(TE7);
    const img = tid(column(page, 'te7-mc-three-1'), 'multicolumn-image').locator('img');
    test.skip((await img.count()) === 0, 'param image không vào block.settings hoặc store không có ảnh: chuyển sang ảnh chụp editor');
    await expect(img).toHaveAttribute('loading', 'lazy');
    await expect(img).toHaveAttribute('width', /\d+/);
    await expect(img).toHaveAttribute('height', /\d+/);
    await expect(img).toHaveAttribute('srcset', /.+/);
    await img.scrollIntoViewIfNeeded();
    const box = await img.boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(3 / 2, 1);
  });

  test('AC4 có cả ảnh và icon thì ảnh thắng', async ({ page }) => {
    await page.goto(TE7);
    const both = column(page, 'te7-mc-mixed-1');
    test.skip((await tid(both, 'multicolumn-image').count()) === 0, 'store không có ảnh cho sản phẩm thứ 4');
    await expect(tid(both, 'multicolumn-icon')).toHaveCount(0);
  });

  test('AC4 link: mặc định routes.all_products_collection_url, đặt được, chạm từ 44px, có mũi tên', async ({ page }) => {
    await page.goto(TE7);
    const byDefault = tid(column(page, 'te7-mc-two-1'), 'multicolumn-link');
    await expect(byDefault).toHaveAttribute('href', /\/collections\/all\/?$/);
    await expect(byDefault.locator('svg.slideshow-icon--arrow')).toHaveAttribute('aria-hidden', 'true');
    const box = await byDefault.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await expect(tid(column(page, 'te7-mc-two-2'), 'multicolumn-link')).toHaveAttribute('href', /\/collections\/?$/);
  });

  test('AC4 không link thì không có thẻ a, không icon không ảnh thì bắt đầu từ heading', async ({ page }) => {
    await page.goto(TE7);
    const textOnly = column(page, 'te7-mc-mixed-2');
    await expect(tid(textOnly, 'multicolumn-link')).toHaveCount(0);
    await expect(tid(textOnly, 'multicolumn-icon')).toHaveCount(0);
    await expect(tid(textOnly, 'multicolumn-image')).toHaveCount(0);
    const columnBox = await textOnly.boundingBox();
    const headingBox = await tid(textOnly, 'multicolumn-column-heading').boundingBox();
    expect(Math.abs(headingBox!.y - columnBox!.y)).toBeLessThanOrEqual(1);
  });

  test('AC4 cột chỉ có icon coi là rỗng: không render, các cột còn lại cùng hàng ở 1280', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(TE7);
    await expect(column(page, 'te7-mc-mixed-3')).toHaveCount(0);
    expect(await layout(band(page, 'te7-multicolumn-mixed'))).toEqual({ count: 2, xs: 2, ys: 1 });
  });

  test('AC4 cột rỗng: storefront không render cột, list, band', async ({ page }) => {
    await page.goto(TE7);
    await expect(band(page, 'te7-multicolumn-empty')).toHaveCount(0);
    await expect(page.locator('[data-multicolumn-id="te7-mc-empty"]')).toHaveCount(0);
    await expect(tid(page, 'multicolumn-placeholder')).toHaveCount(0);
  });

  test('AC4 không JS: đủ cột và link đi được', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
      storageState: 'tests/setup/state.json',
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(TE7);
    expect(await layout(band(page, 'te7-multicolumn-four'))).toEqual({ count: 4, xs: 4, ys: 1 });
    await expect(tid(column(page, 'te7-mc-two-1'), 'multicolumn-link')).toHaveAttribute('href', /\/collections\/all\/?$/);
    await context.close();
  });

  test('AC4 axe 0 serious và 0 console error trên ?view=te7, gồm band dark và sand', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE7);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC5 Custom Liquid chạy: chữ cố định và đúng shop.name', async ({ page }) => {
    await page.goto(TE7);
    const shopName = (await page.locator('h1.visually-hidden').first().innerText()).trim();
    const block = tid(band(page, 'te7-custom-liquid'), 'custom-liquid');
    await expect(block).toHaveText(`Custom Liquid runs on ${shopName}`);
    await expect(block.locator('strong')).toHaveText(shopName);
    expect(await block.innerText()).not.toContain('{{');
  });

  test('AC5 Custom Liquid rỗng trên ?view=te7: không block, không band, không placeholder', async ({ page }) => {
    await page.goto(TE7);
    await expect(band(page, 'te7-custom-liquid-empty')).toHaveCount(0);
    await expect(page.locator('[data-custom-liquid-id="te7-cl-empty"]')).toHaveCount(0);
    await expect(tid(page, 'custom-liquid-placeholder')).toHaveCount(0);
  });

  test('AC5 trang chủ: 3 cột mặc định gợi cách dùng, Custom Liquid rỗng không có band', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(HOME);
    const home = band(page, 'home-multicolumn');
    await expect(tid(home, 'multicolumn-heading')).toHaveText('Add a heading for these columns');
    await expect(tid(home, 'multicolumn-column')).toHaveCount(3);
    await expect(tid(home, 'multicolumn-column-heading').first()).toHaveText('Add a short benefit');
    await expect(tid(home, 'multicolumn-icon')).toHaveCount(0);
    await expect(tid(home, 'multicolumn-image')).toHaveCount(0);
    await expect(tid(home, 'multicolumn-link').first()).toHaveAttribute('href', /\/collections\/all\/?$/);
    expect((await home.innerText()).toLowerCase()).not.toContain('lorem');

    await expect(band(page, 'home-custom-liquid')).toHaveCount(0);
    await expect(tid(page, 'custom-liquid')).toHaveCount(0);
    await expect(tid(page, 'custom-liquid-placeholder')).toHaveCount(0);

    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });
});
