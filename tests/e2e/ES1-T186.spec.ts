// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check, CI đang tắt e2e theo CTO 06/11); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T186.spec.ts.
// Ticket ES1-T186 TE-15-FE2: blocks/shop-by-level + level-card, hàng 4b Figma 1:464 (AC-H10).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T186.spec.ts
// /?view=te15 dùng collection all nên không cần dữ liệu nhập. 3 tên thật trên /?view=figma cần figma-level-* (ES1-T178): thiếu thì skip có lý do.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { readFileSync } from 'node:fs';
import { watchShopPay403 } from './support/console-guard';
import { fetchRetry429 } from './support/cart-api';

const FIGMA = '/?view=figma';
const TE15 = '/?view=te15';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const LEVELS = [
  { name: 'Beginner', handle: 'figma-level-beginner' },
  { name: 'Intermediate', handle: 'figma-level-intermediate' },
  { name: 'Advanced', handle: 'figma-level-advanced' },
];

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const badgeText = (count: number) => `${count} ${count === 1 ? 'Product' : 'Products'}`;

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

/** Số thật của collection, đọc từ storefront JSON; link lấy từ href để giữ tiền tố locale và chữ hoa thường của handle. */
async function productsCount(page: Page, collectionPath: string) {
  const res = await fetchRetry429(page, `${collectionPath}.json`);
  if (!res.ok()) return null;
  const body = await res.json();
  return typeof body?.collection?.products_count === 'number' ? (body.collection.products_count as number) : null;
}

test.describe('ES1-T186 tĩnh', () => {
  test('shop-by-level nằm ngay sau rich-text trong cùng 1 container, ở cả index và index.figma', () => {
    for (const [file, id] of [
      ['templates/index.liquid', 'home-intro'],
      ['templates/index.figma.liquid', 'figma-intro'],
    ]) {
      const source = readFileSync(file, 'utf8');
      const start = source.indexOf(`id: '${id}'`);
      expect(start, file).toBeGreaterThan(0);
      const next = source.indexOf("{% block 'container'", start);
      const names = [...source.slice(start, next).matchAll(/\{%-?\s*block\s+'([a-z-]+)'/g)].map((m) => m[1]);
      expect(names, file).toEqual(['rich-text', 'shop-by-level', 'level-card', 'level-card', 'level-card']);
    }
  });

  test('0 JS trong block; CSS: 0 màu literal, 0 thuộc tính vật lý', () => {
    for (const file of ['blocks/shop-by-level.liquid', 'blocks/level-card.liquid']) {
      const source = readFileSync(file, 'utf8');
      expect(source, file).not.toMatch(/<script|scroll-buttons/);
    }
    const css = readFileSync('assets/base.css', 'utf8');
    const start = css.indexOf('/** Shop by level (TE-15');
    expect(start).toBeGreaterThan(0);
    // ES1-T217: chỉ mục của block này, mục kế là Blog posts. Bỏ comment: ghi chú Figma có mã màu không phải giá trị CSS.
    const section = css.slice(start, css.indexOf('/** Blog posts (TE-16', start)).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(section.length).toBeGreaterThan(0);
    expect(section).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
    expect(section).not.toMatch(/(^|\s)(left|right|top|bottom|margin-left|margin-right|padding-left|padding-right)\s*:/m);
  });

  test('không có số 24 mặc định; khoá badge có one, other', () => {
    expect(readFileSync('blocks/level-card.liquid', 'utf8')).not.toMatch(/\b24\b/);
    const locale = JSON.parse(readFileSync('locales/en.default.json', 'utf8'));
    expect(locale.blocks.level_card.products_count).toEqual({ one: '{{ count }} Product', other: '{{ count }} Products' });
  });
});

test.describe('ES1-T186 /?view=te15', () => {
  test('0 collection: không band, không block, không placeholder', async ({ page }) => {
    await page.goto(TE15);
    await expect(band(page, 'te15-level-empty')).toHaveCount(0);
    await expect(page.locator('[data-shop-by-level-id="te15-level-list-empty"]')).toHaveCount(0);
    await expect(page.getByTestId('shop-by-level-placeholder')).toHaveCount(0);
    await expect(page.getByTestId('level-card-placeholder')).toHaveCount(0);
  });

  test('thiếu collection trong band có rich-text: rich-text còn, không có eyebrow, heading đứng một mình', async ({ page }) => {
    await page.goto(TE15);
    const intro = band(page, 'te15-level-intro-only');
    await expect(intro.getByTestId('rich-text')).toHaveCount(1);
    await expect(intro.getByTestId('shop-by-level')).toHaveCount(0);
    await expect(intro.getByTestId('shop-by-level-eyebrow')).toHaveCount(0);
  });

  test('1 collection: 1 card, không kéo giãn, ảnh lazy, link đúng', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TE15);
    const one = band(page, 'te15-level-one');
    const cards = one.getByTestId('level-card');
    await expect(cards).toHaveCount(1);
    expect((await cards.boundingBox())!.width).toBeCloseTo(456, 0);
    await expect(one.getByTestId('level-card-link')).toHaveAttribute('href', /\/collections\/all$/);
    const img = one.locator('[data-testid="level-card-image"] img');
    if (await img.count()) {
      await expect(img).toHaveAttribute('loading', 'lazy');
      await expect(img).toHaveAttribute('alt', '');
    }
  });

  test('3 collection: chữ mặc định từ schema và locale, số nhiều bằng products_count', async ({ page }) => {
    await page.goto(TE15);
    const three = band(page, 'te15-level-three');
    await expect(three.getByTestId('level-card')).toHaveCount(3);
    await expect(three.getByTestId('shop-by-level-eyebrow')).toHaveText(/shop by level/i);
    await expect(three.getByTestId('shop-by-level-heading')).toHaveText('Choose Your Training Level');
    await expect(three.getByTestId('level-card-label').first()).toHaveText(/level\s+fitness/i);

    const count = await productsCount(page, '/collections/all');
    test.skip(count === null || count === 1, `/collections/all.json không cho số nhiều để so (products_count = ${count})`);
    await expect(three.getByTestId('level-card-count').first()).toHaveText(badgeText(count!));
  });

  test('số ít: collection đúng 1 sản phẩm hiện 1 Product', async ({ page }) => {
    await page.goto(TE15);
    const singular = band(page, 'te15-level-singular');
    test.skip((await singular.count()) === 0, 'Store không có collection nào đúng 1 sản phẩm: không kiểm được số ít trên store này');
    await expect(singular.getByTestId('level-card-count')).toHaveText('1 Product');
    const href = await singular.getByTestId('level-card-link').getAttribute('href');
    expect(await productsCount(page, href!)).toBe(1);
  });

  test('0 console error, axe 0 serious', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE15);
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T186 không JS', () => {
  test.use({ javaScriptEnabled: false });

  test('card vẫn là link, badge có sẵn trong HTML', async ({ page }) => {
    await page.goto(TE15);
    const three = band(page, 'te15-level-three');
    await expect(three.getByTestId('level-card-link')).toHaveCount(3);
    await expect(three.getByTestId('level-card-count').first()).toHaveText(/^\d+ Products?$/);
  });
});

test.describe('ES1-T186 cỡ card theo màn hình (ES1-T174)', () => {
  // Rộng và cao theo ES1-T174; 768 ra 232 x 232 khi --page-margin 20.
  for (const [width, cardWidth, cardHeight, gap, columns] of [
    [360, 320, 240, 16, 1],
    [768, 232, 232, 16, 3],
    [1920, 456, 456, 24, 3],
  ] as const) {
    test(`${width}: ${columns} cột, card ${cardWidth} x ${cardHeight}, gap ${gap}, không tràn trang`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(TE15);
      const cards = band(page, 'te15-level-three').getByTestId('level-card');
      const [a, b, c] = [await cards.nth(0).boundingBox(), await cards.nth(1).boundingBox(), await cards.nth(2).boundingBox()];
      expect(a!.width).toBeCloseTo(cardWidth, 0);
      expect(a!.height).toBeCloseTo(cardHeight, 0);
      if (columns === 3) {
        expect(b!.x - a!.x - a!.width).toBeCloseTo(gap, 0);
        expect(c!.y).toBeCloseTo(a!.y, 0);
      } else {
        expect(b!.y - a!.y - a!.height).toBeCloseTo(gap, 0);
        expect(b!.x).toBeCloseTo(a!.x, 0);
      }
      await noHorizontalOverflow(page);
    });
  }

  test('1920: chữ theo Figma 1:466, 1:467, 1:472, 1:473, 1:476', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TE15);
    const three = band(page, 'te15-level-three');
    for (const [id, size, height] of [
      ['shop-by-level-eyebrow', '16px', '20px'],
      ['shop-by-level-heading', '48px', '58px'],
      ['level-card-label', '14px', '16px'],
      ['level-card-title', '36px', '44px'],
      ['level-card-count', '14px', '22px'],
    ]) {
      const el = three.getByTestId(id).first();
      await expect(el, id).toHaveCSS('font-size', size);
      await expect(el, id).toHaveCSS('line-height', height);
    }
    await expect(three.getByTestId('level-card-link').first()).toHaveCSS('border-radius', '16px');
  });
});

test.describe('ES1-T186 /?view=figma', () => {
  test('1920: cùng band sand với rich-text; 3 card 456 x 456 đúng tên, link, badge', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(FIGMA);
    const intro = band(page, 'figma-intro');
    await expect(intro).toHaveClass(/block-container--sand/);
    await expect(intro.getByTestId('rich-text')).toHaveCount(1);

    const cards = intro.getByTestId('level-card');
    const count = await cards.count();
    test.skip(count < 3, `Store mới có ${count}/3 collection figma-level-*: chờ ES1-T178`);

    for (const [index, { name, handle }] of LEVELS.entries()) {
      const card = cards.nth(index);
      await expect(card.getByTestId('level-card-title')).toHaveText(name);
      const link = card.getByTestId('level-card-link');
      await expect(link).toHaveAttribute('href', new RegExp(`/collections/${handle}$`));
      const box = await card.boundingBox();
      expect(box!.width).toBeCloseTo(456, 0);
      expect(box!.height).toBeCloseTo(456, 0);
      const real = await productsCount(page, (await link.getAttribute('href'))!);
      expect(real, handle).not.toBeNull();
      await expect(card.getByTestId('level-card-count')).toHaveText(badgeText(real!));
    }
  });
});
