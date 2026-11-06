// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check, CI đang tắt e2e theo CTO 06/11); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T184.spec.ts.
// Ticket ES1-T184 TE-15-FE1: blocks/collection-list + collection-card, hàng 3 Figma 1:395 (AC-H8, AC-H9 phần markup). Next/back bấm được thuộc ES1-T185.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T184.spec.ts
// /?view=te15 không cần dữ liệu nhập (collection all). 5 tên thật trên /?view=figma cần figma-cat-* (ES1-T178): thiếu thì skip có lý do.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { watchShopPay403 } from './support/console-guard';

const FIGMA = '/?view=figma';
const TE15 = '/?view=te15';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const CATEGORIES = [
  { name: 'Free Weights', handle: 'figma-cat-free-weights' },
  { name: 'Functional Training', handle: 'figma-cat-functional-training' },
  { name: 'Benches & Racks', handle: 'figma-cat-benches-racks' },
  { name: 'Recovery & Mobility', handle: 'figma-cat-recovery-mobility' },
  { name: 'Accessories', handle: 'figma-cat-accessories' },
];

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);

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

async function noHorizontalOverflow(page: Page) {
  const [scrollWidth, clientWidth] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test.describe('ES1-T184 tĩnh', () => {
  test('block đứng ngay sau slideshow trong index và index.figma, không thẻ script', () => {
    for (const file of ['templates/index.liquid', 'templates/index.figma.liquid']) {
      const names = [...readFileSync(file, 'utf8').matchAll(/\{%-?\s*block\s+'([a-z-]+)'/g)].map((m) => m[1]).filter((name) => name !== 'container' && name !== 'slideshow-slide');
      expect(names.slice(0, 3), file).toEqual(['slideshow', 'collection-list', 'collection-card']);
    }
    expect(readFileSync('blocks/collection-list.liquid', 'utf8')).not.toContain('<script');
  });

  test('CSS block: 0 màu literal, 0 thuộc tính vật lý', () => {
    const css = readFileSync('assets/base.css', 'utf8');
    const start = css.indexOf('/** Collection list (TE-15');
    const section = css.slice(start, css.indexOf('/** Testimonials (TE-7', start));
    expect(section.length).toBeGreaterThan(0);
    expect(section).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
    expect(section).not.toMatch(/(^|\s)(left|right|top|bottom|margin-left|margin-right|padding-left|padding-right)\s*:/m);
  });
});

test.describe('ES1-T184 /?view=te15', () => {
  test('0 collection: không band, không list', async ({ page }) => {
    await page.goto(TE15);
    await expect(band(page, 'te15-empty')).toHaveCount(0);
    await expect(page.locator('[data-collection-list-id="te15-list-empty"]')).toHaveCount(0);
    await expect(page.getByTestId('collection-list-placeholder')).toHaveCount(0);
    await expect(page.getByTestId('collection-card-placeholder')).toHaveCount(0);
  });

  test('1 collection: 1 card, link tới collection, ảnh lazy', async ({ page }) => {
    await page.goto(TE15);
    const one = band(page, 'te15-one');
    await expect(one.getByTestId('collection-card')).toHaveCount(1);
    await expect(one.getByTestId('collection-card-link')).toHaveAttribute('href', /\/collections\/all$/);
    const img = one.locator('[data-testid="collection-card-image"] img');
    if (await img.count()) await expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('5 collection: đúng 5 card, heading mặc định', async ({ page }) => {
    await page.goto(TE15);
    const five = band(page, 'te15-five');
    await expect(five.getByTestId('collection-card')).toHaveCount(5);
    await expect(five.getByTestId('collection-list-heading')).toHaveText('Browse Categories');
    await expect(five.getByTestId('collection-list-track')).toHaveAttribute('tabindex', '0');
    await expect(five.getByTestId('collection-list-track')).toHaveAttribute('aria-label', /.+/);
  });

  test('hook cho ES1-T185 có sẵn; nút ẩn khi chưa có data-enhanced', async ({ page }) => {
    await page.goto(TE15);
    const root = band(page, 'te15-five').locator('scroll-buttons');
    await expect(root).toHaveCount(1);
    await expect(root.locator('[data-scroll-track]')).toHaveCount(1);
    await expect(root.locator('button[data-scroll-prev]')).toBeHidden();
    await expect(root.locator('button[data-scroll-next]')).toBeHidden();
  });

  test('0 console error, axe 0 serious', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE15);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T184 không JS', () => {
  test.use({ javaScriptEnabled: false });

  test('nút ẩn, vẫn cuộn được: danh sách tràn và là khung cuộn', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(TE15);
    const five = band(page, 'te15-five');
    await expect(five.getByTestId('collection-list-prev')).toBeHidden();
    await expect(five.getByTestId('collection-list-next')).toBeHidden();
    const track = five.getByTestId('collection-list-track');
    await expect(track).toHaveCSS('overflow-x', 'auto');
    await expect(track).toHaveCSS('scroll-snap-type', /x/);
    const box = await track.boundingBox();
    const lastCard = await five.getByTestId('collection-card').last().boundingBox();
    expect(lastCard!.x + lastCard!.width).toBeGreaterThan(box!.x + box!.width);
  });
});

test.describe('ES1-T184 cỡ card theo màn hình', () => {
  for (const [width, cardWidth, gap] of [
    [360, 252, 16],
    [768, 307.2, 16],
    [1280, 336, 24],
    [1920, 336, 24],
  ] as const) {
    test(`${width}: card rộng ${cardWidth}, gap ${gap}, không tràn trang`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(TE15);
      const five = band(page, 'te15-five');
      const cards = five.getByTestId('collection-card');
      const [a, b] = [await cards.nth(0).boundingBox(), await cards.nth(1).boundingBox()];
      expect(a!.width).toBeCloseTo(cardWidth, 0);
      expect(b!.x - a!.x - a!.width).toBeCloseTo(gap, 0);
      await noHorizontalOverflow(page);
    });
  }

  test('360: nút không hiện kể cả sau khi nâng cấp', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(TE15);
    const five = band(page, 'te15-five');
    await five.locator('scroll-buttons').evaluate((el) => el.setAttribute('data-enhanced', ''));
    await expect(five.getByTestId('collection-list-next')).toBeHidden();
  });

  test('1920: có data-enhanced thì 2 nút 52 x 52, card đầu thẳng hàng tiêu đề, card 5 tràn mép phải', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TE15);
    const five = band(page, 'te15-five');
    await five.locator('scroll-buttons').evaluate((el) => el.setAttribute('data-enhanced', ''));
    for (const id of ['collection-list-prev', 'collection-list-next']) {
      const box = await five.getByTestId(id).boundingBox();
      expect(box!.width).toBe(52);
      expect(box!.height).toBe(52);
    }
    const heading = await five.getByTestId('collection-list-heading').boundingBox();
    const cards = five.getByTestId('collection-card');
    expect((await cards.first().boundingBox())!.x).toBeCloseTo(heading!.x, 0);
    const last = await cards.last().boundingBox();
    expect(last!.x).toBeLessThan(1920);
    expect(last!.x + last!.width).toBeGreaterThan(1920);
  });

  test('hidden thắng display của nút', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TE15);
    const five = band(page, 'te15-five');
    await five.locator('scroll-buttons').evaluate((el) => el.setAttribute('data-enhanced', ''));
    await five.getByTestId('collection-list-prev').evaluate((el) => el.setAttribute('hidden', ''));
    await expect(five.getByTestId('collection-list-prev')).toBeHidden();
    await expect(five.getByTestId('collection-list-next')).toBeVisible();
  });
});

test.describe('ES1-T184 /?view=figma', () => {
  test('1920: 5 card 336 x 270 đúng tên, đúng link, nền tối', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(FIGMA);
    const row = band(page, 'figma-collection-list');
    const cards = row.getByTestId('collection-card');
    const count = await cards.count();
    test.skip(count < 5, `Store mới có ${count}/5 collection figma-cat-*: chờ ES1-T178`);

    for (const [index, { name, handle }] of CATEGORIES.entries()) {
      const card = cards.nth(index);
      await expect(card.getByTestId('collection-card-title')).toHaveText(name);
      await expect(card.getByTestId('collection-card-link')).toHaveAttribute('href', new RegExp(`/collections/${handle}$`));
      const box = await card.boundingBox();
      expect(box!.width).toBeCloseTo(336, 0);
      expect(box!.height).toBeCloseTo(270, 0);
    }
    await expect(row).toHaveClass(/block-container--dark/);
  });

  test('chữ, ảnh bo 16: cỡ theo Figma 1:397, 1:405', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(FIGMA);
    const row = band(page, 'figma-collection-list');
    test.skip((await row.count()) === 0, 'Store chưa có collection figma-cat-*: chờ ES1-T178');
    const heading = row.getByTestId('collection-list-heading');
    await expect(heading).toHaveCSS('font-size', '48px');
    await expect(heading).toHaveCSS('line-height', '58px');
    const title = row.getByTestId('collection-card-title').first();
    await expect(title).toHaveCSS('font-size', '28px');
    await expect(title).toHaveCSS('line-height', '34px');
    await expect(row.getByTestId('collection-card-image').first()).toHaveCSS('border-radius', '16px');
  });
});
