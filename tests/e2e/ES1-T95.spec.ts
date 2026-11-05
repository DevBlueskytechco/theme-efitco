// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T95.spec.ts.
// Ticket ES1-T95 TE-5-FE2: markup cart drawer (docs/srs.md#TE-5 AC1, AC4, AC6; drafts/techlead/ES1-T89/task-split.md D2, D6, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [EXPECT_CART_TYPE=page] npx playwright test tests/e2e/ES1-T95.spec.ts -g "AC1-markup|AC6-markup|nojs"
// Chưa có JS (ES1-T96): mở thử bằng thuộc tính open. EXPECT_CART_TYPE=page chỉ đặt khi preview có cart_type page (D12).
import { test, expect, type APIRequestContext, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { getJson } from './support/http';

type Product = { variants: { id: number; available: boolean }[] };

const ENV = {
  product: env('TE4_VARIANTS_HANDLE', 'TE4_SINGLE_HANDLE'),
  pageMode: process.env.EXPECT_CART_TYPE === 'page',
};

const tid = (page: Page, id: string) => page.getByTestId(id);

async function addToCart(request: APIRequestContext, handle: string) {
  const r = await getJson<Product>(request, `/products/${handle}.js`);
  test.skip(r.status === 429, `Shopify trả 429 cho ${handle}.js sau khi thử lại (giới hạn store dev)`);
  expect(r.ok, `/products/${handle}.js trả ${r.status}`).toBeTruthy();
  const variant = (r.body as Product).variants.find((v) => v.available);
  test.skip(!variant, `${handle} không có variant bán được`);
  const res = await request.post('/cart/add.js', { data: { id: variant!.id, quantity: 1 } });
  test.skip(res.status() === 429, 'Shopify trả 429 cho /cart/add.js (giới hạn store dev)');
  expect(res.ok(), `/cart/add.js trả ${res.status()}`).toBeTruthy();
}

// reduced motion: đo và chụp không dính animation trượt vào.
async function forceOpen(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await tid(page, 'cart-drawer-dialog').evaluate((el) => el.setAttribute('open', ''));
}

async function expectNoSeriousAxe(page: Page) {
  const { violations } = await new AxeBuilder({ page }).include('[data-testid="cart-drawer-dialog"]').analyze();
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

test.describe('ES1-T95 TE-5 cart drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('/cart/clear.js');
  });

  test('AC1-markup đúng 1 cart-drawer sau footer, ngoài container, mọi trang', async ({ page }) => {
    for (const path of ['/', '/collections/all', '/search?q=a', '/cart', ...(ENV.product ? [`/products/${ENV.product}`] : [])]) {
      await page.goto(path);
      await expect(tid(page, 'cart-drawer'), path).toHaveCount(1);
      const parent = await tid(page, 'cart-drawer').evaluate((el) => el.parentElement?.tagName);
      expect(parent, `${path}: cart-drawer nằm trực tiếp trong body`).toBe('BODY');
      await expect(tid(page, 'cart-drawer'), path).toHaveAttribute('data-cart-url', /\/cart$/);
      await expect(tid(page, 'cart-drawer'), path).toHaveAttribute('data-items-src', /cart-items\.js/);
    }
  });

  test('AC1-markup dialog đóng, đủ hook, tên từ h2', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    await page.goto('/');
    const dialog = tid(page, 'cart-drawer-dialog');
    await expect(tid(page, 'cart-drawer')).toHaveAttribute('data-mode', 'drawer');
    await expect(dialog).toHaveCount(1);
    await expect(dialog).toBeHidden();
    await expect(dialog).toHaveAttribute('scroll-lock', '');
    await expect(dialog).not.toHaveAttribute('open', /.*/);

    const headingId = await tid(page, 'cart-drawer-heading').getAttribute('id');
    await expect(dialog).toHaveAttribute('aria-labelledby', headingId!);
    await expect(page.locator('[data-testid="cart-drawer-dialog"] h2')).toHaveCount(1);

    const items = tid(page, 'cart-items');
    await expect(items).toHaveAttribute('data-partials', 'cart-drawer cart-count');
    for (const attr of ['data-cart-change-url', 'data-cart-url', 'data-label-updated', 'data-label-removed', 'data-label-error', 'data-label-quantity-adjusted']) {
      await expect(items).toHaveAttribute(attr, /.+/);
    }
    await expect(tid(page, 'cart-items-status')).toHaveAttribute('role', 'status');
    await expect(tid(page, 'cart-items-error')).toHaveAttribute('role', 'alert');
    await expect(tid(page, 'cart-form')).toHaveAttribute('id', 'cart-form-drawer');

    await expect(tid(page, 'cart-drawer-close')).toHaveAccessibleName(/\S/);
    const link = tid(page, 'header-cart-link');
    await expect(link).toHaveAttribute('data-cart-link', '');
    await expect(link).toHaveAttribute('aria-haspopup', 'dialog');
  });

  test('AC1-markup giỏ có hàng: dòng hàng, tóm tắt trong partial, accelerated ngoài partial, axe khi ép open', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
    await addToCart(page.request, ENV.product!);
    await page.goto('/');
    const body = tid(page, 'cart-drawer-body');
    await expect(body).toHaveAttribute('data-item-count', '1');
    await expect(body.getByTestId('cart-line')).toHaveCount(1);
    await expect(body.getByTestId('cart-checkout')).toHaveAttribute('form', 'cart-form-drawer');
    await expect(body.getByTestId('cart-drawer-accelerated')).toHaveCount(0);

    const accelerated = tid(page, 'cart-drawer-accelerated');
    if (await accelerated.count()) await expect(accelerated).toHaveAttribute('data-cart-accelerated', '');

    await forceOpen(page);
    await expect(tid(page, 'cart-drawer-dialog')).toBeVisible();
    await expect(tid(page, 'cart-checkout')).toBeVisible();
    await expectNoSeriousAxe(page);
  });

  test('AC1-markup giỏ rỗng: thông báo + CTA, không tóm tắt, accelerated ẩn, axe khi ép open', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    await page.goto('/');
    await forceOpen(page);
    await expect(tid(page, 'cart-empty')).toBeVisible();
    await expect(tid(page, 'cart-empty-cta')).toBeVisible();
    await expect(tid(page, 'cart-checkout')).toHaveCount(0);
    const accelerated = tid(page, 'cart-drawer-accelerated');
    if (await accelerated.count()) await expect(accelerated).toBeHidden();
    await expectNoSeriousAxe(page);
  });

  test('AC1-markup bố cục: dưới 48rem toàn màn, từ 48rem rộng 28rem bám cạnh cuối, thân cuộn, ảnh 360/768/1280', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
    await addToCart(page.request, ENV.product!);
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await forceOpen(page);
      const box = await tid(page, 'cart-drawer-dialog').boundingBox();
      expect(box, `${width}: dialog có kích thước`).not.toBeNull();
      expect(box!.height, `${width}: cao toàn màn`).toBe(800);
      expect(box!.x + box!.width, `${width}: bám cạnh cuối`).toBe(width);
      expect(box!.width, `${width}: chiều rộng`).toBe(width < 768 ? width : 448);
      const overflow = await page.locator('.cart-drawer__main').evaluate((el) => getComputedStyle(el).overflowY);
      expect(overflow).toBe('auto');
      await test.info().attach(`cart-drawer-${width}.png`, { body: await page.screenshot(), contentType: 'image/png' });
    }
  });

  test('AC1-markup /cart: không dialog, data-mode none, cart link không có hook drawer', async ({ page }) => {
    await page.goto('/cart');
    await expect(tid(page, 'cart-drawer')).toHaveAttribute('data-mode', 'none');
    await expect(page.locator('cart-drawer dialog')).toHaveCount(0);
    await expect(tid(page, 'cart-drawer-dialog')).toHaveCount(0);
    await expect(tid(page, 'cart-items')).toHaveAttribute('data-partials', 'cart-page cart-count');
    const link = tid(page, 'header-cart-link');
    await expect(link).not.toHaveAttribute('data-cart-link', /.*/);
    await expect(link).not.toHaveAttribute('aria-haspopup', /.*/);
  });

  test('AC6-markup cart_type page: mọi trang data-mode none, không dialog', async ({ page }) => {
    test.skip(!ENV.pageMode, 'Cần preview đặt cart_type page + EXPECT_CART_TYPE=page (D12)');
    await page.goto('/');
    await expect(tid(page, 'cart-drawer')).toHaveAttribute('data-mode', 'none');
    await expect(page.locator('cart-drawer dialog')).toHaveCount(0);
    await expect(tid(page, 'header-cart-link')).not.toHaveAttribute('data-cart-link', /.*/);
  });

  test('AC6-markup schema block không settings, không presets', () => {
    const source = readFileSync(join(process.cwd(), 'blocks/cart-drawer.liquid'), 'utf8');
    const schema = JSON.parse(source.split('{% schema %}')[1].split('{% endschema %}')[0]) as Record<string, unknown>;
    expect(schema.settings).toBeUndefined();
    expect(schema.presets).toBeUndefined();
  });

  test('CSS drawer: 0 literal màu, chỉ logical properties, có reduced-motion', () => {
    const css = readFileSync(join(process.cwd(), 'assets/base.css'), 'utf8');
    const part = css.slice(css.indexOf('/** Cart drawer (TE-5'), css.indexOf('/** Gift card template'));
    expect(part.length).toBeGreaterThan(0);
    expect(part.match(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi)).toBeNull();
    expect(part.match(/^\s*(left|right|top|bottom|width|height|(margin|padding)-(left|right|top|bottom))\s*:/gm)).toBeNull();
    expect(part).toContain('prefers-reduced-motion: no-preference');
  });

  test.describe('nojs', () => {
    test('nojs dialog đóng, cart link tới /cart', async ({ browser }) => {
      const { context, page } = await noJsPage(browser);
      await page.goto('/');
      const dialog = tid(page, 'cart-drawer-dialog');
      if (await dialog.count()) await expect(dialog).toBeHidden();
      const link = tid(page, 'header-cart-link');
      await expect(link).toHaveAttribute('href', /\/cart$/);
      await link.click();
      await expect(page).toHaveURL(/\/cart$/);
      await expect(tid(page, 'cart-page')).toBeVisible();
      await context.close();
    });
  });
});
