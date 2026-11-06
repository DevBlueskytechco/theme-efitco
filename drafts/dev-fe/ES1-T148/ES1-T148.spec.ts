// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T148.spec.ts.
// Ticket ES1-T148 TE-12-FE2: shop the look markup + CSS (docs/srs.md#TE-12 AC4, AC5, AC-H19, AC-H20; drafts/techlead/ES1-T141/task-split.md D1, D5, D9, D11, D12).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T148.spec.ts -g "AC5-markup|AC4|AC-H19|AC-H20|nojs"
// Handle sản phẩm viết cứng trong templates/index.te12.liquid, lấy từ tests/e2e/store-data.json.
// BE1 (ES1-T149) chạy lại spec này: phần chỉ đúng trước khi JS nâng cấp nằm trong nhóm nojs.
import { test, expect, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { watchShopPay403 } from './support/console-guard';
import { readCartNoScript } from './support/product-data';

const TE12 = '/?view=te12';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const LOOK = 'container-te12-look';
const SINGLE = 'container-te12-look-single';
const SOLD_OUT = 'container-te12-look-sold-out';
const PARTIAL = 'container-te12-look-partial';

const look = (page: Page, container = LOOK) => page.getByTestId(container).getByTestId('shop-the-look');

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

test.describe('ES1-T148 TE-12 shop the look', () => {
  test('AC5-markup copy mặc định theo Figma 1:560, form POST, root bundle-form', async ({ page }) => {
    await page.goto(TE12);
    const root = look(page);
    expect(await root.evaluate((el) => el.tagName)).toBe('BUNDLE-FORM');
    await expect(root.getByTestId('shop-the-look-eyebrow')).toHaveText('Shop this setup');
    await expect(root.getByTestId('shop-the-look-heading')).toHaveText('A Complete Corner Gym, Itemised');
    await expect(root.getByTestId('shop-the-look-link')).toHaveText('Browse All Setups');
    await expect(root.getByTestId('shop-the-look-submit')).toContainText('Add Setup To Cart');

    const form = root.locator('form');
    await expect(form).toHaveAttribute('method', /post/i);
    await expect(form).toHaveAttribute('action', /\/cart\/add$/);
    await expect(form.getByTestId('shop-the-look-rows')).toHaveCount(1);
    for (const attr of ['data-cart-add-url', 'data-cart-url', 'data-cart-type', 'data-currency', 'data-locale', 'data-label-count-one', 'data-label-count-other', 'data-label-discount', 'data-label-status', 'data-label-error']) {
      await expect(root, attr).toHaveAttribute(attr, /.+/);
    }
    await expect(root.getByTestId('shop-the-look-status')).toHaveAttribute('role', 'status');
    await expect(root.getByTestId('shop-the-look-error')).toHaveAttribute('role', 'alert');
  });

  test('AC5-markup bộ 6 row có đúng 6 row; input khớp tên và giá trên row', async ({ page }) => {
    await page.goto(TE12);
    const rows = look(page).getByTestId('shop-the-look-row');
    test.skip((await rows.count()) < 6, 'Store dev thiếu sản phẩm trong store-data.json');
    await expect(rows).toHaveCount(6);
    await expect(look(page).getByTestId('price-range')).toHaveCount(0);

    const currency = new RegExp(/\d/);
    for (const row of await rows.all()) {
      await expect(row.getByTestId('shop-the-look-row-title')).toHaveAttribute('href', /\/products\//);
      await expect(row.getByTestId('shop-the-look-row-price')).toContainText(currency);
      const input = row.getByTestId('shop-the-look-row-input');
      if ((await input.count()) === 0) continue;
      await expect(input).toHaveAttribute('type', 'hidden');
      await expect(input).toHaveAttribute('name', 'id[]');
      await expect(input).toHaveAttribute('value', /^\d+$/);
      await expect(input).toHaveAttribute('data-bundle-item', '');
      expect(await input.getAttribute('data-title')).toBe((await row.getByTestId('shop-the-look-row-title').innerText()).trim());

      // Giá hiện trên row là giá hiện tại của variant, data-price là cent của đúng giá đó
      const cents = await input.getAttribute('data-price');
      const shown = await row.locator('.price__current').innerText();
      expect(shown.replace(/[^\d]/g, '').replace(/^0+/, '')).toContain(String(Number(cents)).replace(/0+$/, ''));
    }
  });

  test('AC4 row hết hàng: vẫn hiện, có badge, không có input', async ({ page }) => {
    await page.goto(TE12);
    const row = look(page).locator('[data-testid="shop-the-look-row"][data-sold-out]');
    test.skip((await row.count()) === 0, 'Store dev thiếu sản phẩm TE4_SOLD_OUT_HANDLE');
    await expect(row).toHaveCount(1);
    await expect(row.getByTestId('shop-the-look-row-badge')).toHaveText('Sold out');
    await expect(row.getByTestId('shop-the-look-row-input')).toHaveCount(0);
    await expect(row.getByTestId('shop-the-look-row-title')).toBeVisible();
  });

  test('AC4 chỉ có row hết hàng: không có nút, không có panel', async ({ page }) => {
    await page.goto(TE12);
    const root = look(page, SOLD_OUT);
    test.skip((await root.count()) === 0, 'Store dev thiếu sản phẩm TE4_SOLD_OUT_HANDLE');
    await expect(root.getByTestId('shop-the-look-row')).toHaveCount(1);
    await expect(root.getByTestId('shop-the-look-submit')).toBeHidden();
    await expect(root.getByTestId('shop-the-look-panel')).toBeHidden();
  });

  test('AC5-markup ảnh trống: không khung trống, danh sách rộng hết, không hotspot', async ({ page }) => {
    await page.goto(TE12);
    const root = look(page, SINGLE);
    await expect(root.getByTestId('shop-the-look-image')).toHaveCount(0);
    await expect(root.getByTestId('shop-the-look-hotspot')).toHaveCount(0);
    await expect(root.getByTestId('shop-the-look-note')).toHaveCount(0);
    const body = await root.locator('.shop-the-look__body').boundingBox();
    const form = await root.locator('form').boundingBox();
    expect(Math.abs(body!.width - form!.width)).toBeLessThanOrEqual(1);
  });

  test('AC5-markup ảnh lazy, có width height; 2 cột từ 64rem, 1 cột ảnh trên dưới 64rem', async ({ page }) => {
    await page.goto(TE12);
    const root = look(page);
    const img = root.locator('[data-testid="shop-the-look-image"] img');
    await expect(img).toHaveAttribute('loading', 'lazy');
    await expect(img).toHaveAttribute('width', /\d+/);
    await expect(img).toHaveAttribute('height', /\d+/);
    expect(await img.getAttribute('alt')).not.toBeNull();

    await root.scrollIntoViewIfNeeded();
    const positions = async () =>
      root.evaluate((el) => {
        const media = el.querySelector('.shop-the-look__media')!.getBoundingClientRect();
        const form = el.querySelector('form')!.getBoundingClientRect();
        return { mediaBottom: media.bottom, formTop: form.top, mediaRight: media.right, formLeft: form.left };
      });

    await page.setViewportSize({ width: 1023, height: 800 });
    let box = await positions();
    expect(box.formTop).toBeGreaterThanOrEqual(box.mediaBottom);

    await page.setViewportSize({ width: 1024, height: 800 });
    box = await positions();
    expect(box.formLeft).toBeGreaterThanOrEqual(box.mediaRight);
  });

  test('AC-H19 thẻ Fits, dòng giảm, ghi chú theo bậc mặc định 4 món 10%', async ({ page }) => {
    await page.goto(TE12);
    const root = look(page);
    await expect(root.getByTestId('shop-the-look-note')).toContainText('Fits: 2.4×2.0 m');
    await expect(root.getByTestId('shop-the-look-note')).toContainText("Folds flat when you're done.");
    await expect(root).toHaveAttribute('data-tiers', '4:10');
    await expect(root.getByTestId('shop-the-look-discount-row')).toHaveCount(1);
    await expect(root.getByTestId('shop-the-look-discount-note')).toHaveText('Discount applies when an automatic discount is active.');
    await expect(root).toHaveAttribute('data-label-discount', 'Setup Discount (%p%)');
  });

  test('AC-H19 không bậc: không data-tiers, không dòng giảm, không ghi chú', async ({ page }) => {
    await page.goto(TE12);
    const root = look(page, PARTIAL);
    expect(await root.getAttribute('data-tiers')).toBeNull();
    await expect(root.getByTestId('shop-the-look-discount-row')).toHaveCount(0);
    await expect(root.getByTestId('shop-the-look-discount-note')).toHaveCount(0);
  });

  test('AC-H20 markup: 4 hotspot là nút, đủ tên, vùng bấm từ 44px, nối row bằng số', async ({ page }) => {
    await page.goto(TE12);
    const root = look(page);
    const hotspots = root.getByTestId('shop-the-look-hotspot');
    await expect(hotspots).toHaveCount(4);
    await root.getByTestId('shop-the-look-image').scrollIntoViewIfNeeded();
    for (const [index, hotspot] of (await hotspots.all()).entries()) {
      const number = String(index + 1);
      await expect(hotspot).toHaveAttribute('type', 'button');
      await expect(hotspot).toHaveAttribute('data-hotspot', number);
      await expect(hotspot).toHaveAttribute('aria-label', new RegExp(number));
      await expect(hotspot).toHaveAttribute('aria-pressed', number === '1' ? 'true' : 'false');
      await expect(root.locator(`[data-look-row="${number}"]`)).toHaveCount(1);
      const box = await hotspot.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('AC-H20 markup: row 1 viền accent, row khác viền thường; hotspot của row thiếu thì ẩn', async ({ page }) => {
    await page.goto(TE12);
    const root = look(page);
    const color = (selector: string) => root.locator(selector).evaluate((el) => getComputedStyle(el).borderBlockStartColor);
    const accent = await root.evaluate((el) => {
      const probe = document.createElement('div');
      probe.style.color = 'var(--color-accent)';
      el.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    });
    expect(await color('[data-look-row="1"]')).toBe(accent);
    expect(await color('[data-look-row="2"]')).not.toBe(accent);

    const partial = look(page, PARTIAL);
    await expect(partial.locator('[data-hotspot="1"]')).toBeVisible();
    await expect(partial.locator('[data-hotspot="2"]')).toBeVisible();
    await expect(partial.locator('[data-hotspot="3"]')).toBeHidden();
    await expect(partial.locator('[data-hotspot="4"]')).toBeHidden();
  });

  test('AC5-markup trang chủ chưa cấu hình: không có shop the look, không band rỗng', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(HOME);
    await expect(page.getByTestId('shop-the-look')).toHaveCount(0);
    await expect(page.getByTestId('container-home-shop-the-look')).toHaveCount(0);
    await expect(page.getByTestId('shop-the-look-placeholder')).toHaveCount(0);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC5-markup axe 0 serious và 0 console error trên ?view=te12', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE12);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC5-markup 360: trang không tràn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(TE12);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('nojs AC5 giá row còn; số liệu và hotspot ẩn; nút hiện; ghi chú còn', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    await page.goto(TE12);
    const root = look(page);
    await expect(root.getByTestId('shop-the-look-row-price').first()).toBeVisible();
    for (const id of ['count', 'subtotal', 'discount', 'total', 'hotspot']) {
      await expect(root.getByTestId(`shop-the-look-${id}`).first(), id).toBeHidden();
    }
    await expect(root.getByTestId('shop-the-look-submit')).toBeVisible();
    await expect(root.getByTestId('shop-the-look-discount-note')).toBeVisible();
    await context.close();
  });

  test('nojs AC5 submit: /cart.js có đúng các variant còn hàng, quantity 1', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    await page.goto(TE12);
    const root = look(page);
    const inputs = root.getByTestId('shop-the-look-row-input');
    const ids = await inputs.evaluateAll((els) => els.map((el) => Number(el.getAttribute('value'))));
    expect(ids.length).toBeGreaterThan(0);

    await root.getByTestId('shop-the-look-submit').click();
    await page.waitForURL(/\/cart(\?|$)/);

    type Cart = { item_count: number; items: { variant_id: number; quantity: number }[] };
    let cart: Cart = { item_count: 0, items: [] };
    await expect
      .poll(async () => (cart = await readCartNoScript<Cart>(page)).item_count, { message: 'form name=id[] không thêm món nào vào giỏ', timeout: 15_000, intervals: [1000, 2000, 4000] })
      .toBeGreaterThan(0);
    const lines = cart.items.map((i) => [i.variant_id, i.quantity]);
    expect(lines.sort()).toEqual(ids.map((id) => [id, 1]).sort());
    await context.close();
  });

  test('nojs AC4 hết hàng toàn bộ: không có nút', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    await page.goto(TE12);
    const root = look(page, SOLD_OUT);
    test.skip((await root.count()) === 0, 'Store dev thiếu sản phẩm TE4_SOLD_OUT_HANDLE');
    await expect(root.getByTestId('shop-the-look-submit')).toBeHidden();
    await context.close();
  });
});
