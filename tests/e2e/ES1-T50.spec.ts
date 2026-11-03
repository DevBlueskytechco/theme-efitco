// Ticket ES1-T50 (2727475000000144029): TE-3-FE1 product card + price snippet trên /collections/all.
// Đích: tests/e2e/ES1-T50.spec.ts (scope-guard chặn dev-fe ghi tests/, Orchestrator chép).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T50.spec.ts -g "AC3|AC4|AC6|AC2-markup|sold-out"
// Dữ liệu demo (TE-9 AC4) thiếu loại sản phẩm nào thì test đó skip có lý do, không fail.
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const money = (s: string | null) => Number((s ?? '').replace(/[^0-9.,]/g, '').replace(/,/g, ''));

async function openAll(page: Page) {
  await page.goto('/collections/all');
  const cards = page.getByTestId('product-card');
  await expect(cards.first(), '/collections/all có ít nhất 1 card').toBeVisible();
  return cards;
}

async function firstWith(cards: Locator, testid: string) {
  const card = cards.filter({ has: cards.page().getByTestId(testid) }).first();
  return (await card.count()) ? card : null;
}

test.describe('ES1-T50 product card', () => {
  test('AC2-markup: swatch là radio trong fieldset, 1 radio checked, tối đa 5, hook cho BE', async ({ page }) => {
    const cards = await openAll(page);
    const card = await firstWith(cards, 'product-card-swatches');
    test.skip(!card, 'Không có sản phẩm ≥ 2 màu có swatch trên /collections/all');
    const group = card!.getByTestId('product-card-swatches');
    expect(await group.evaluate(el => el.tagName)).toBe('FIELDSET');
    await expect(group.locator('legend')).toHaveCount(1);
    const radios = group.locator('input[type="radio"]');
    const n = await radios.count();
    expect(n).toBeGreaterThanOrEqual(2);
    expect(n).toBeLessThanOrEqual(5);
    await expect(group.getByTestId('product-card-swatch')).toHaveCount(n);
    await expect(group.locator('input[type="radio"]:checked')).toHaveCount(1);
    const names = await radios.evaluateAll(els => new Set(els.map(e => (e as HTMLInputElement).name)).size);
    expect(names, 'mọi radio cùng name').toBe(1);
    for (const attr of ['data-variant-id', 'data-variant-url', 'data-image-src', 'data-image-srcset', 'data-image-alt']) {
      await expect(radios.first()).toHaveAttribute(attr, /.+/);
    }
    await expect(card!.locator('img[data-card-image]')).toHaveCount(1);
    await expect(card!.locator('[data-card-price]')).toHaveCount(1);
    expect(await card!.locator('a[data-card-link]').count()).toBeGreaterThanOrEqual(2);
    const dupIds = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    });
    expect(dupIds, 'id không trùng trên trang').toEqual([]);
  });

  test('AC3: giá gạch + badge sale với % làm tròn đúng', async ({ page }) => {
    const cards = await openAll(page);
    const card = await firstWith(cards, 'product-card-badge-sale');
    test.skip(!card, 'Không có sản phẩm sale trên /collections/all');
    const price = money(await card!.getByTestId('price-regular').textContent());
    const compare = money(await card!.getByTestId('price-compare').textContent());
    expect(compare).toBeGreaterThan(price);
    expect(await card!.getByTestId('price-compare').evaluate(el => el.tagName)).toBe('S');
    const badge = (await card!.getByTestId('product-card-badge-sale').textContent())!.trim();
    const expected = Math.round(((compare - price) * 100) / compare);
    expect(badge).toBe(expected > 0 ? `-${expected}%` : 'Sale');
  });

  test('AC4: price_varies hiện khoảng giá, unit price khi có', async ({ page }) => {
    const cards = await openAll(page);
    const range = await firstWith(cards, 'price-range');
    const unit = await firstWith(cards, 'price-unit');
    test.skip(!range && !unit, 'Không có sản phẩm giá thay đổi hoặc unit price');
    if (range) {
      const [min, max] = (await range.getByTestId('price-range').textContent())!.split('–').map(money);
      expect(max).toBeGreaterThan(min);
    }
    if (unit) await expect(unit.getByTestId('price-unit')).toHaveText(/\/\s*\d*\s*\S+/);
  });

  test('sold-out: product.available false có badge Sold out, không có badge sale', async ({ page }) => {
    const cards = await openAll(page);
    const card = await firstWith(cards, 'product-card-badge-sold-out');
    test.skip(!card, 'Không có sản phẩm hết hàng trên /collections/all');
    await expect(card!.getByTestId('product-card-badge-sold-out')).toHaveText('Sold out');
    await expect(card!.getByTestId('product-card-badge-sale')).toHaveCount(0);
  });

  test('AC6: tab qua card = tiêu đề + nhóm swatch, focus thấy được, alt, vùng bấm swatch ≥ 24px, axe 0 serious', async ({ page }) => {
    const cards = await openAll(page);
    for (const alt of await page.getByTestId('product-card-image').evaluateAll(els => els.map(e => e.getAttribute('alt') ?? ''))) {
      expect(alt.trim().length).toBeGreaterThan(0);
    }
    for (const tabindex of await cards.locator('a[aria-hidden="true"]').evaluateAll(els => els.map(e => e.getAttribute('tabindex')))) {
      expect(tabindex, 'link trùng (ảnh, +N) ra khỏi tab order').toBe('-1');
    }
    const card = (await firstWith(cards, 'product-card-swatches')) ?? cards.first();
    const title = card.getByTestId('product-card-title');
    await title.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(title).toBeFocused();
    expect(await title.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
    if (await card.getByTestId('product-card-swatches').count()) {
      await page.keyboard.press('Tab');
      const inGroup = await page.evaluate(() => !!document.activeElement?.closest('[data-testid="product-card-swatches"]'));
      expect(inGroup, 'Tab sau tiêu đề vào nhóm swatch').toBe(true);
      const ring = await card.locator('input:focus-visible + [data-testid="product-card-swatch"]')
        .evaluate(el => getComputedStyle(el).outlineStyle);
      expect(ring).not.toBe('none');
      for (const sw of await card.getByTestId('product-card-swatch').all()) {
        const b = (await sw.boundingBox())!;
        expect(b.width).toBeGreaterThanOrEqual(24);
        expect(b.height).toBeGreaterThanOrEqual(24);
      }
    }
    const axe = await new AxeBuilder({ page }).include('[data-testid="collection-products"]').analyze();
    const bad = axe.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map(v => v.id)).toEqual([]);
  });
});
