// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check, CI đang tắt e2e theo CTO 06/11); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T190.spec.ts.
// Ticket ES1-T190 TE-3-FE5: badge rating, badge New, mặc định 4 sản phẩm, vùng bấm swatch 44 px (D7, AC-H13, AC-H14, AC6).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T190.spec.ts
// Dữ liệu P01, P02, P04 từ ES1-T178: thiếu thì skip có lý do. T190_NEW_SALE_HANDLE: sản phẩm vừa tag new vừa sale, không có thì test thứ tự dùng DOM.
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { readFileSync } from 'node:fs';
import { watchShopPay403 } from './support/console-guard';

const FIGMA = '/?view=figma';
const RATED = 'figma-ativafit-lava-adjustable'; // P01: reviews.rating 5.0, sale
const NEW = 'figma-iron-core-kettlebell'; // P02: tag new, không sale, không rating
const PLAIN = 'figma-revllen-speed-rope'; // P04: không rating
const NEW_SALE = process.env.T190_NEW_SALE_HANDLE;
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const T = {
  block: 'featured-collection',
  grid: 'featured-collection-grid',
  card: 'product-card',
  rating: 'product-card-rating',
  ratingValue: 'product-card-rating-value',
  badgeNew: 'product-card-badge-new',
  badgeSale: 'product-card-badge-sale',
  swatch: 'product-card-swatch',
  swatches: 'product-card-swatches',
};

async function openFigma(page: Page) {
  const res = await page.goto(FIGMA);
  expect(res?.status(), `HTTP ${FIGMA}`).toBeLessThan(400);
  return page.getByTestId(T.block);
}

async function cardOf(page: Page, handle: string): Promise<Locator> {
  const block = await openFigma(page);
  const card = block.getByTestId(T.card).filter({ has: page.locator(`a[href*="/products/${handle}"]`) }).first();
  test.skip((await card.count()) === 0, `Không có ${handle} trong hàng 5: chờ dữ liệu ES1-T178`);
  return card;
}

test.describe('ES1-T190 tĩnh', () => {
  test('schema mặc định 4, min 4, không presets; token và locale đủ', async ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    const src = readFileSync('blocks/featured-collection.liquid', 'utf8');
    const schema = JSON.parse(src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/)![1]);
    expect(schema.presets).toBeUndefined();
    const setting = schema.settings.find((s: { id: string }) => s.id === 'products_to_show');
    expect(setting).toMatchObject({ min: 4, max: 12, default: 4 });

    const settings = readFileSync('config/settings_schema.json', 'utf8');
    expect(settings).toContain('"badge_new_color"');
    expect(settings).toContain('"badge_new_foreground_color"');
    const vars = readFileSync('snippets/css-variables.liquid', 'utf8');
    expect(vars).toContain('--color-badge-new: {{ settings.badge_new_color }}');
    expect(vars).toContain('--color-badge-new-foreground: {{ settings.badge_new_foreground_color }}');
    expect(readFileSync('DESIGN.md', 'utf8')).toContain('`--color-badge-new`');
    const tokens = JSON.parse(readFileSync('docs/tokens.json', 'utf8'));
    expect(tokens.color.badge_new).toBe('#4B824D');

    const locale = JSON.parse(readFileSync('locales/en.default.json', 'utf8'));
    expect(locale.products.card.new).toBe('New');
    expect(locale.products.card.rating_label).toContain('{{ rating }}');
  });

  test('thẻ New không có data-card-badge để product-swatch.js không đụng tới', async ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    const src = readFileSync('snippets/product-card.liquid', 'utf8');
    const el = src.match(/<span[^>]*product-card__badge--new[^>]*>/)![0];
    expect(el).not.toContain('data-card-badge');
    expect(src).toContain("product.tags contains 'new'");
    expect(src).toContain('metafields.reviews.rating.value');
  });
});

test.describe('ES1-T190 rating (AC-H13)', () => {
  test('có metafield: sao + số, sao và số aria-hidden, chữ ẩn đọc được', async ({ page }) => {
    const card = await cardOf(page, RATED);
    const rating = card.getByTestId(T.rating);
    await expect(rating).toBeVisible();
    await expect(rating.getByTestId(T.ratingValue)).toHaveText('5.0');
    await expect(rating.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    await expect(rating.getByTestId(T.ratingValue)).toHaveAttribute('aria-hidden', 'true');
    await expect(rating.locator('.visually-hidden')).toHaveText('Rated 5.0 out of 5');
  });

  test('không có metafield: 0 badge, không có giá trị mặc định', async ({ page }) => {
    const card = await cardOf(page, PLAIN);
    await expect(card.getByTestId(T.rating)).toHaveCount(0);
  });

  test('card bundle không hiện rating: góc đó là vòng chọn', async ({ page }) => {
    await openFigma(page);
    const inBundle = page.locator('.bundle-builder__item').getByTestId(T.rating);
    for (const el of await inBundle.all()) await expect(el).toBeHidden();
  });
});

test.describe('ES1-T190 New (AC-H14)', () => {
  test('tag new, không sale: hiện New, màu theo token', async ({ page }) => {
    const card = await cardOf(page, NEW);
    const badge = card.getByTestId(T.badgeNew);
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('New');
    await expect(badge).not.toHaveAttribute('data-card-badge', /.*/);
    const [bg, want] = await badge.evaluate((el) => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--color-badge-new)';
      document.body.append(probe);
      const value = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return [getComputedStyle(el).backgroundColor, value];
    });
    expect(bg).toBe(want);
  });

  test('sản phẩm không có tag new: 0 badge New', async ({ page }) => {
    const card = await cardOf(page, RATED);
    await expect(card.getByTestId(T.badgeNew)).toHaveCount(0);
    await expect(card.getByTestId(T.badgeSale)).toBeVisible();
  });

  test('vừa New vừa sale: chỉ hiện %', async ({ page }) => {
    test.skip(!NEW_SALE, 'Bảng ES1-T173 không có sản phẩm vừa tag new vừa sale; đặt T190_NEW_SALE_HANDLE. Test sau kiểm quy tắc bằng DOM');
    const card = await cardOf(page, NEW_SALE!);
    await expect(card.getByTestId(T.badgeSale)).toBeVisible();
    await expect(card.getByTestId(T.badgeNew)).toBeHidden();
  });

  test('thứ tự ưu tiên qua CSS: [data-card-badge] hiện thì New ẩn, ẩn thì New hiện lại', async ({ page }) => {
    const card = await cardOf(page, NEW);
    const main = card.locator('[data-card-badge]');
    const badge = card.getByTestId(T.badgeNew);
    for (const kind of ['sale', 'sold_out']) {
      await main.evaluate((el, k) => { el.removeAttribute('hidden'); el.setAttribute('data-badge', k); el.textContent = k; }, kind);
      await expect(badge, `${kind} thắng New`).toBeHidden();
    }
    await main.evaluate((el) => { el.setAttribute('hidden', ''); el.setAttribute('data-badge', 'none'); el.textContent = ''; });
    await expect(badge).toBeVisible();
  });

  test('đổi swatch sang variant không badge: New còn nguyên', async ({ page }) => {
    const card = await cardOf(page, NEW);
    const radios = card.locator('input[type="radio"][data-badge="none"]:not(:checked)');
    test.skip((await radios.count()) === 0, 'Không có swatch khác cùng data-badge none');
    await page.waitForFunction(() => customElements.get('product-swatch') !== undefined);
    const id = await radios.first().getAttribute('id');
    await card.locator(`label[for="${id}"]`).click();
    await expect(card.getByTestId(T.badgeNew)).toBeVisible();
  });
});

test.describe('ES1-T190 lưới mặc định 4 (D7)', () => {
  test('tab 1 hiện tối đa 4 card', async ({ page }) => {
    const block = await openFigma(page);
    const items = block.getByTestId(T.grid).first().locator(':scope > li');
    const n = await items.count();
    test.skip(n === 0, 'Tab 1 không có sản phẩm');
    expect(n).toBeLessThanOrEqual(4);
  });

  for (const width of [768, 1024, 1279, 1280]) {
    test(`${width}px: đúng 4 card thì 4 cột, không tràn ngang`, async ({ page }, ti) => {
      test.skip(ti.project.name !== 'desktop', 'Breakpoint đo ở project desktop');
      await page.setViewportSize({ width, height: 900 });
      const block = await openFigma(page);
      const grid = block.getByTestId(T.grid).first();
      test.skip((await grid.locator(':scope > li').count()) !== 4, 'Cần đúng 4 card');
      const cols = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
      expect(cols).toBe(4);
      const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(scroll).toBeLessThanOrEqual(client);
    });
  }
});

test.describe('ES1-T190 vùng bấm swatch (D7, AC6)', () => {
  async function swatches(page: Page) {
    const block = await openFigma(page);
    const groups = block.getByTestId(T.swatches);
    test.skip((await groups.count()) === 0, 'Không có card có swatch trong hàng 5: chờ dữ liệu ES1-T178');
    return groups;
  }

  test('::after từ 44 x 44, hình swatch giữ 32 x 16', async ({ page }) => {
    const groups = await swatches(page);
    for (const label of await groups.getByTestId(T.swatch).all()) {
      const size = await label.evaluate((el) => {
        const hit = getComputedStyle(el, '::after');
        const pill = getComputedStyle(el, '::before');
        return { hitW: parseFloat(hit.width), hitH: parseFloat(hit.height), pillW: parseFloat(pill.width), pillH: parseFloat(pill.height) };
      });
      // Từ 1280: Figma cách nhau 4 px nên vùng bấm rộng 36 để không chồng (CTO 07/11: theo Figma)
      expect(size.hitW, 'vùng bấm rộng').toBeGreaterThanOrEqual((page.viewportSize()?.width ?? 0) >= 1280 ? 36 : 44);
      expect(size.hitH, 'vùng bấm cao').toBeGreaterThanOrEqual(44);
      expect(size.pillW, 'hình rộng').toBeCloseTo(32, 0);
      expect(size.pillH, 'hình cao').toBeCloseTo(16, 0);
    }
  });

  test('vùng bấm thật: điểm cách tâm 21 px vẫn trúng label', async ({ page }) => {
    const groups = await swatches(page);
    const label = groups.first().getByTestId(T.swatch).first();
    await label.scrollIntoViewIfNeeded();
    const hits = await label.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const reach = innerWidth >= 1280 ? 17 : 21;
      return [[-reach, 0], [reach, 0], [0, -21], [0, 21]].map(([dx, dy]) => el.contains(document.elementFromPoint(cx + dx, cy + dy)));
    });
    expect(hits).toEqual([true, true, true, true]);
  });

  test('không chồng vùng bấm của swatch cạnh, 2 cỡ màn hình', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'desktop', 'Đổi viewport ở project desktop; Pixel 7 đã có test đo ở trên');
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const groups = await swatches(page);
      for (const group of await groups.all()) {
        const overlaps = await group.evaluate((root) => {
          const rects = [...root.querySelectorAll('[data-testid="product-card-swatch"]')].map((el) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el, '::after');
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: parseFloat(s.width), h: parseFloat(s.height) };
          });
          let bad = 0;
          rects.forEach((a, i) => rects.slice(i + 1).forEach((b) => {
            const clearX = Math.abs(a.x - b.x) >= (a.w + b.w) / 2 - 0.5;
            const clearY = Math.abs(a.y - b.y) >= (a.h + b.h) / 2 - 0.5;
            if (!clearX && !clearY) bad += 1;
          }));
          return bad;
        });
        expect(overlaps, `${width}px`).toBe(0);
      }
    }
  });

  test('bấm mép vùng bấm chọn đúng swatch', async ({ page }) => {
    const groups = await swatches(page);
    const group = groups.first();
    const labels = group.getByTestId(T.swatch);
    test.skip((await labels.count()) < 2, 'Cần từ 2 swatch');
    const label = labels.nth(1);
    await label.scrollIntoViewIfNeeded();
    const box = (await label.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 + 21);
    const id = await label.getAttribute('for');
    await expect(page.locator(`[id="${id}"]`)).toBeChecked();
  });
});

test.describe('ES1-T190 card 152', () => {
  test('360px: cách mép 8, badge trái không chồng rating', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'desktop', 'Đổi viewport ở project desktop');
    await page.setViewportSize({ width: 360, height: 800 });
    const card = await cardOf(page, RATED);
    const media = (await card.locator('.product-card__media').boundingBox())!;
    const sale = (await card.getByTestId(T.badgeSale).boundingBox())!;
    const rating = (await card.getByTestId(T.rating).boundingBox())!;
    expect(sale.x - media.x).toBeCloseTo(8, 0);
    expect(media.x + media.width - (rating.x + rating.width)).toBeCloseTo(8, 0);
    expect(sale.x + sale.width, 'không chồng').toBeLessThanOrEqual(rating.x);
  });

  test('1280px: cách mép 16, rating cao 28', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'desktop', 'Đổi viewport ở project desktop');
    await page.setViewportSize({ width: 1280, height: 900 });
    const card = await cardOf(page, RATED);
    const media = (await card.locator('.product-card__media').boundingBox())!;
    const rating = (await card.getByTestId(T.rating).boundingBox())!;
    expect(media.x + media.width - (rating.x + rating.width)).toBeCloseTo(16, 0);
    expect(rating.height).toBeCloseTo(28, 0);
  });
});

test.describe('ES1-T190 chất lượng', () => {
  test('axe 0 serious trong hàng 5, 0 console error', async ({ page }) => {
    const errors: string[] = [];
    const isShopPay403 = watchShopPay403(page);
    page.on('console', (msg) => {
      if (msg.type() !== 'error' || isShopPay403(msg)) return;
      if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
      errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

    const block = await openFigma(page);
    test.skip((await block.count()) === 0, 'Không có hàng 5');
    await expectNotChallenged(page);
    const r = await new AxeBuilder({ page }).include('[data-testid="featured-collection"]').analyze();
    const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id);
    expect(bad).toEqual([]);
    expect(errors).toEqual([]);
  });
});
