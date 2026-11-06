// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T147.spec.ts.
// Ticket ES1-T147 TE-12-FE1: bundle builder markup + CSS (docs/srs.md#TE-12 AC1, AC2, AC4; drafts/techlead/ES1-T141/task-split.md D1–D4, D9, D11, D12).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T147.spec.ts -g "AC1-markup|AC4|nojs"
// Ca hết hàng cần sản phẩm hết hàng trong 9 món đầu của collection (te12-bundle, ES1-T144); không có thì skip có lý do.
// BE1 (ES1-T149) chạy lại spec này: phần chỉ đúng trước khi JS nâng cấp thì kiểm data-enhanced trước.
import { test, expect, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { watchShopPay403 } from './support/console-guard';
import { CART, cartApi } from './support/cart-api';
import { readCartNoScript } from './support/product-data';

const TE12 = '/?view=te12';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const TIERS = 'container-te12-bundle';
const NO_TIERS = 'container-te12-bundle-no-tiers';

const bundle = (page: Page, container = TIERS) => page.getByTestId(container).getByTestId('bundle-builder');
const available = (page: Page) => bundle(page).locator('[data-testid="bundle-builder-input"]:not([disabled])');
const soldOutItems = (page: Page) => bundle(page).locator('[data-testid="bundle-builder-item"][data-sold-out]');

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

async function noJsPage(browser: Browser, width?: number) {
  const use = test.info().project.use;
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: 'tests/setup/state.json',
    baseURL: use.baseURL,
    ...(width ? { viewport: { width, height: 740 } } : use.viewport ? { viewport: use.viewport } : {}),
    ...(use.userAgent ? { userAgent: use.userAgent } : {}),
    ...(use.isMobile !== undefined ? { isMobile: use.isMobile, hasTouch: use.hasTouch } : {}),
  });
  return { context, page: await context.newPage() };
}

test.describe('ES1-T147 TE-12 bundle builder', () => {
  test('AC1-markup ?view=te12 trả template kiểm thử, copy Figma đúng', async ({ page }) => {
    const response = await page.goto(TE12);
    expect(response?.ok()).toBeTruthy();
    const root = bundle(page);
    await expect(root.getByTestId('bundle-builder-eyebrow')).toHaveText('Build your bundle');
    await expect(root.getByTestId('bundle-builder-heading')).toHaveText('Pick Your Kit, Save As You Go');
    await expect(root.getByTestId('bundle-builder-link')).toHaveText('View Preset Bundles');
    await expect(page.getByTestId('bundle-builder-placeholder')).toHaveCount(0);
    await expect(page.getByTestId('container-home-bundle-builder')).toHaveCount(0);
  });

  test('AC1-markup tối đa 9 mục, mỗi mục 1 card không swatch, checkbox ngoài card', async ({ page }) => {
    await page.goto(TE12);
    const items = bundle(page).getByTestId('bundle-builder-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(9);
    await expect(bundle(page).getByTestId('product-card')).toHaveCount(count);
    await expect(bundle(page).getByTestId('product-card-swatches')).toHaveCount(0);
    await expect(bundle(page).locator('[data-testid="product-card"] [data-testid="bundle-builder-input"]')).toHaveCount(0);
    await expect(bundle(page).getByTestId('price-range')).toHaveCount(0);
  });

  test('AC1-markup input đủ hook, label chứa tên sản phẩm', async ({ page }) => {
    await page.goto(TE12);
    const inputs = await bundle(page).getByTestId('bundle-builder-input').all();
    expect(inputs.length).toBeGreaterThan(0);
    for (const input of inputs) {
      await expect(input).toHaveAttribute('type', 'checkbox');
      await expect(input).toHaveAttribute('name', 'id[]');
      await expect(input).toHaveAttribute('value', /^\d+$/);
      await expect(input).toHaveAttribute('data-bundle-item', '');
      await expect(input).toHaveAttribute('data-price', /^\d+$/);
      const title = await input.getAttribute('data-title');
      expect(title).toBeTruthy();
      const id = await input.getAttribute('id');
      await expect(page.locator(`label[for="${id}"]`)).toContainText(title!);
    }
  });

  test('AC1-markup form POST tới cart add, root có hook chuỗi và tiền', async ({ page }) => {
    await page.goto(TE12);
    const root = bundle(page);
    const form = root.locator('form');
    await expect(form).toHaveAttribute('method', /post/i);
    await expect(form).toHaveAttribute('action', /\/cart\/add$/);
    expect(await root.evaluate((el) => el.tagName)).toBe('BUNDLE-FORM');
    for (const attr of [
      'data-cart-add-url',
      'data-cart-url',
      'data-cart-type',
      'data-currency',
      'data-locale',
      'data-label-count-one',
      'data-label-count-other',
      'data-label-progress',
      'data-label-progress-done',
      'data-label-discount',
      'data-label-status',
      'data-label-error',
    ]) {
      await expect(root, attr).toHaveAttribute(attr, /.+/);
    }
    await expect(root).toHaveAttribute('data-label-progress', /%n.*%p/);
    await expect(root).toHaveAttribute('data-currency', /^[A-Z]{3}$/);
  });

  test('AC1-markup data-tiers khớp param; có đủ dòng giảm, tiến độ, ghi chú', async ({ page }) => {
    await page.goto(TE12);
    const root = bundle(page);
    await expect(root).toHaveAttribute('data-tiers', '2:10,3:15');
    await expect(root.getByTestId('bundle-builder-discount-row')).toHaveCount(1);
    await expect(root.getByTestId('bundle-builder-progress')).toHaveCount(1);
    await expect(root.getByTestId('bundle-builder-progress-text')).toHaveCount(1);
    await expect(root.getByTestId('bundle-builder-note')).toBeVisible();
    await expect(root.getByTestId('bundle-builder-subtotal')).toHaveCount(1);
    await expect(root.getByTestId('bundle-builder-total')).toHaveCount(1);
    await expect(root.locator('template[data-bundle-line-template]')).toHaveCount(1);
    await expect(root.getByTestId('bundle-builder-status')).toHaveAttribute('role', 'status');
    await expect(root.getByTestId('bundle-builder-error')).toHaveAttribute('role', 'alert');
  });

  test('AC1-markup bundle không bậc: không data-tiers, dòng giảm, thanh tiến độ, ghi chú', async ({ page }) => {
    await page.goto(TE12);
    const root = bundle(page, NO_TIERS);
    await expect(root.getByTestId('bundle-builder-heading')).toHaveText('Bundle Without Tiers');
    expect(await root.getAttribute('data-tiers')).toBeNull();
    await expect(root.getByTestId('bundle-builder-discount-row')).toHaveCount(0);
    await expect(root.getByTestId('bundle-builder-progress')).toHaveCount(0);
    await expect(root.getByTestId('bundle-builder-note')).toHaveCount(0);
    await expect(root.getByTestId('bundle-builder-link')).toHaveCount(0);
  });

  test('AC1-markup chưa chọn gì thì nút không hiện, chọn 1 thì hiện, bỏ chọn thì ẩn lại', async ({ page }) => {
    await page.goto(TE12);
    const submit = bundle(page).getByTestId('bundle-builder-submit');
    await expect(submit).toBeHidden();
    await expect(submit).toHaveAttribute('type', 'submit');
    expect(await submit.getAttribute('disabled')).toBeNull();

    const first = available(page).first();
    await first.check();
    await expect(submit).toBeVisible();
    await first.uncheck();
    await expect(submit).toBeHidden();
  });

  test('AC1-markup tên card vẫn dẫn tới trang sản phẩm, không bị vùng chọn che', async ({ page }) => {
    await page.goto(TE12);
    const title = bundle(page).getByTestId('product-card-title').first();
    await expect(title).toHaveAttribute('href', /\/products\//);
    await title.click();
    await page.waitForURL(/\/products\//);
  });

  test('AC1-markup bấm ảnh thì chọn, bấm lại thì bỏ', async ({ page }) => {
    await page.goto(TE12);
    const item = bundle(page).locator('[data-testid="bundle-builder-item"]:not([data-sold-out])').first();
    const input = item.getByTestId('bundle-builder-input');
    // Label phủ ảnh: bấm giữa label chính là bấm giữa ảnh
    const area = item.locator('.bundle-builder__select');
    await area.click();
    await expect(input).toBeChecked();
    await expect(page).toHaveURL(/view=te12/);
    await area.click();
    await expect(input).not.toBeChecked();
  });

  test('AC1-markup trang chủ chưa cấu hình: không có bundle builder', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(HOME);
    await expect(page.getByTestId('bundle-builder')).toHaveCount(0);
    await expect(page.getByTestId('bundle-builder-placeholder')).toHaveCount(0);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC1-markup axe 0 serious và 0 console error trên ?view=te12', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE12);
    await expectNoSeriousAxe(page);
    await available(page).first().check();
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC4 mục hết hàng: input disabled, badge Sold out, bấm không chọn được, không có vòng', async ({ page }) => {
    await page.goto(TE12);
    const count = await soldOutItems(page).count();
    test.skip(count === 0, 'Không có sản phẩm hết hàng trong 9 món đầu: chờ collection te12-bundle (ES1-T144)');
    const item = soldOutItems(page).first();
    const input = item.getByTestId('bundle-builder-input');
    await expect(input).toBeDisabled();
    await expect(input).not.toBeChecked();
    await expect(item.getByTestId('product-card-badge-sold-out')).toBeVisible();

    // force: label vẫn nhận con trỏ nhưng input disabled nên không đổi gì, và không rời trang
    await item.locator('.bundle-builder__select').click({ force: true });
    await expect(input).not.toBeChecked();
    await expect(page).toHaveURL(/view=te12/);
    await expect(bundle(page).getByTestId('bundle-builder-submit')).toBeHidden();

    const ring = await item.locator('.bundle-builder__select').evaluate((el) => getComputedStyle(el, '::before').display);
    expect(ring).toBe('none');
    await expect(item.getByTestId('product-card-title')).toHaveAttribute('href', /\/products\//);
  });

  test('AC4 360: mỗi vùng bấm từ 44px, trang không tràn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(TE12);
    const labels = await bundle(page).locator('.bundle-builder__select').all();
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      const box = await label.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('nojs AC1 panel còn tiêu đề, ghi chú; số liệu ẩn; nút hiện khi chọn món', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    await page.goto(TE12);
    const root = bundle(page);
    await expect(root.getByTestId('bundle-builder-panel')).toContainText('Your Bundle');
    await expect(root.getByTestId('bundle-builder-note')).toBeVisible();
    for (const id of ['count', 'subtotal', 'discount', 'total', 'progress', 'empty']) {
      await expect(root.getByTestId(`bundle-builder-${id}`), id).toBeHidden();
    }
    const submit = root.getByTestId('bundle-builder-submit');
    await expect(submit).toBeHidden();
    await available(page).first().check();
    await expect(submit).toBeVisible();
    await context.close();
  });

  test('nojs AC1 chọn 2 món, submit, /cart.js có đúng 2 món quantity 1', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    const cleared = await cartApi(page, CART.clear);
    expect(cleared.ok(), `${CART.clear} trả ${cleared.status()}`).toBeTruthy();
    await page.goto(TE12);

    const inputs = available(page);
    test.skip((await inputs.count()) < 2, 'Collection cần ít nhất 2 sản phẩm còn hàng');
    const ids = [await inputs.nth(0).getAttribute('value'), await inputs.nth(1).getAttribute('value')].map(Number);
    await inputs.nth(0).check();
    await inputs.nth(1).check();
    await bundle(page).getByTestId('bundle-builder-submit').click();
    // ES1-T171 D3: domcontentloaded trả về ngay khi trang cũ đã tải xong, nên phải chờ form POST chuyển tới /cart rồi mới đọc giỏ.
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

  test('nojs AC4 360: mọi vùng bấm từ 44px', async ({ browser }) => {
    const { context, page } = await noJsPage(browser, 360);
    await page.goto(TE12);
    const labels = await bundle(page).locator('.bundle-builder__select').all();
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      const box = await label.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await context.close();
  });
});
