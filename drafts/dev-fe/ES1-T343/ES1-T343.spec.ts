// Chép từ drafts/dev-fe/ES1-T343 (scope-guard chặn dev-fe ghi tests/). Nhóm storefront cần PREVIEW_URL; nhóm tĩnh chạy không cần store.
// Sửa khi chép: test không JS dùng test.use({ javaScriptEnabled: false }) như ES1-T156 nojs, không tự tạo context (support/test.ts ES1-T475).
// Ticket ES1-T343 TE-13-R2-FE1: snippets/sale-countdown (ADR 0009 mục 1, 2, 5; docs/ui-spec/countdown.md §1–§7). AC TE-4 AC17, TE-13 AC1, AC-H23.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T343.spec.ts
// Đếm, K3 "This sale has ended" là JS của TE-13-R2-BE1 (assets/sale-countdown.js), không kiểm ở đây.
import { readFileSync } from 'node:fs';
import { test, expect, type Locator, type Page } from './support/test';

const STATES = '/?view=te13-states';
const COUNTDOWN = 'featured-product-countdown';
const band = (page: Page, id: string) => page.getByTestId(`container-te13-${id}`);
const read = (file: string) => readFileSync(file, 'utf8');

async function onSale(scope: Locator) {
  return (await scope.getByTestId('price-compare').count()) > 0;
}

test.describe('ES1-T343 tĩnh', () => {
  test('ADR 0009 đo: 0 class featured-product__countdown, featured gọi snippet với testid cũ', () => {
    for (const file of ['assets/base.css', 'assets/featured-product.css', 'blocks/featured-product.liquid', 'snippets/sale-countdown.liquid']) {
      expect(read(file), file).not.toMatch(/featured-product__countdown/);
    }
    const featured = read('blocks/featured-product.liquid');
    expect(featured).toMatch(/render 'sale-countdown',[\s\S]*?testid: 'featured-product-countdown'/);
    expect(featured).toMatch(/size: 'regular'/);
    expect(featured).toMatch(/fallback_end: block\.settings\.countdown_end/);
    expect(featured).not.toMatch(/data-end=|role="timer"/);
  });

  test('snippet: metafield trước, 4 điều kiện, hook BE, không script', () => {
    const snippet = read('snippets/sale-countdown.liquid');
    expect(snippet).toContain('product.metafields.custom.sale_ends_at.value');
    expect(snippet).toMatch(/sc_end > sc_now and sc_variant != blank and sc_variant\.available and sc_variant\.compare_at_price > sc_variant\.price/);
    for (const hook of ['<sale-countdown', 'data-sale-countdown', 'data-end=', 'data-state=', 'data-size=', 'data-label-ended=', 'data-countdown-unit="days"', 'data-countdown-value', 'role="timer"']) {
      expect(snippet, hook).toContain(hook);
    }
    expect(snippet).not.toMatch(/<script|data-lazy-module|aria-live/);
  });

  test('CSS chung ở base.css: scripting none, container 23rem, K2, K3, 0 literal màu', () => {
    const css = read('assets/base.css');
    const start = css.indexOf('/** Sale countdown');
    const block = css.slice(start, css.indexOf('/** Rich text chung', start));
    expect(start).toBeGreaterThan(-1);
    expect(block).toMatch(/@media \(scripting: none\)\s*{\s*sale-countdown\s*{\s*display: none;/);
    expect(block).toMatch(/@container \(min-width: 23rem\)/);
    expect(block).toContain(".sale-countdown[data-state='ending']");
    expect(block).toContain(".sale-countdown[data-state='ended']");
    expect(block).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|visibility: hidden|z-index|\b(left|right|top|bottom):/i);
  });

  test('locale: blocks.sale_countdown đủ key, featured bỏ key countdown cũ', () => {
    const locale = JSON.parse(read('locales/en.default.json'));
    expect(Object.keys(locale.blocks.sale_countdown).sort()).toEqual(
      ['days', 'ended', 'ends_on', 'hours', 'invalid_date', 'label', 'metafield_overrides', 'minutes', 'seconds'],
    );
    expect(locale.blocks.sale_countdown.ended).toBe('This sale has ended');
    expect(Object.keys(locale.blocks.featured_product).filter((k) => k.startsWith('countdown'))).toEqual([]);
  });
});

test.describe('ES1-T343 storefront', () => {
  test('TE-13 AC1 band A: khung số in sẵn, hiện trước JS, tên đọc là câu ngày giờ', async ({ page }) => {
    await page.route(/\/(featured-product|sale-countdown)\.js/, (route) => route.abort());
    await page.goto(STATES);
    const a = band(page, 'a');
    test.skip(!(await onSale(a)), 'Band A không có giá gạch (te13-featured, ES1-T153)');
    const box = a.getByTestId(COUNTDOWN);
    await expect(box).toHaveCount(1);
    await expect(box).toBeVisible(); // ES1-T276: số Liquid hiện ngay, không chờ data-enhanced
    await expect(box).toHaveAttribute('role', 'timer');
    await expect(box).toHaveAttribute('data-sale-countdown', '');
    await expect(box).toHaveAttribute('data-size', 'regular');
    await expect(box).toHaveAttribute('data-state', 'running');
    await expect(box).toHaveAttribute('data-label-ended', 'This sale has ended');
    await expect(box).not.toHaveAttribute('aria-live', /.*/);
    const name = a.getByTestId(`${COUNTDOWN}-ends-on`);
    await expect(box).toHaveAttribute('aria-labelledby', (await name.getAttribute('id'))!);
    await expect(name.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{4}$/);
    await expect(name).toContainText('Sale ends on');
    await expect(a.getByTestId(`${COUNTDOWN}-label`)).toHaveAttribute('aria-hidden', 'true');
    // 48 giờ: 4 ô, số 2 chữ số trở lên
    for (const unit of ['days', 'hours', 'minutes', 'seconds']) {
      const cell = a.getByTestId(`${COUNTDOWN}-${unit}`);
      await expect(cell).toBeVisible();
      await expect(cell.locator('[data-countdown-value]')).toHaveText(/^\d{2,3}$/);
    }
  });

  test('TE-4 AC17 K4: quá hạn, hết hàng, sai định dạng, không ngày → 0 khung', async ({ page }) => {
    await page.goto(STATES);
    for (const id of ['b', 'c', 'd', 'e']) {
      await expect(band(page, id).getByTestId('featured-product')).toBeAttached();
      await expect(band(page, id).locator('[data-sale-countdown]'), `band ${id}`).toHaveCount(0);
      await expect(band(page, id).getByTestId(`${COUNTDOWN}-notice`), `band ${id} notice ngoài editor`).toHaveCount(0);
    }
  });

  test('AC-H23 Regular ≥ 23rem, Compact < 23rem: ô 44 / 40, cao khung ≥ 60', async ({ page }) => {
    await page.goto(STATES);
    const a = band(page, 'a');
    test.skip(!(await onSale(a)), 'Band A không sale');
    const box = a.getByTestId(COUNTDOWN);
    const host = box.locator('xpath=..');
    const hostWidth = (await host.boundingBox())!.width;
    const cell = (await a.getByTestId(`${COUNTDOWN}-hours`).boundingBox())!;
    expect(cell.height).toBeCloseTo(hostWidth >= 368 ? 44 : 40, 0);
    expect((await box.boundingBox())!.height).toBeGreaterThanOrEqual(60);
    // Không tràn ngang khung chứa
    expect((await box.boundingBox())!.width).toBeLessThanOrEqual(hostWidth + 0.5);
  });
});

test.describe('ES1-T343 không JS', () => {
  test.use({ javaScriptEnabled: false });

  test('không JS: khung không hiện, không chiếm chỗ', async ({ page }) => {
    await page.goto(STATES);
    const a = band(page, 'a');
    if (await a.getByTestId(COUNTDOWN).count()) {
      await expect(a.getByTestId(COUNTDOWN)).toBeHidden();
      expect(await a.locator('sale-countdown').boundingBox()).toBeNull();
    }
  });
});
