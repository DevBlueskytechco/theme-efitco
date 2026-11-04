// KHÔNG CHẮC: spec chưa chạy (sandbox agent không mở được trình duyệt) → chờ CI. Shape `cart` của createCartFromAjaxResponse chưa thấy → chỉ kiểm cart khác null và chứa id variant.
// Ticket ES1-T85 TE-4-BE5 (làm lại theo review PR #72): assets/product-form.js dispatch shopify:cart:lines-update
// (CartLinesUpdateEvent) trước POST cart/add.js; promise luôn resolve CartLinesUpdateResult { cart, userErrors, warnings }.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... [TE4_SINGLE_HANDLE=...] npx playwright test tests/e2e/ES1-T85.spec.ts
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const EVENT = 'shopify:cart:lines-update';
const CDN = 'https://cdn.shopify.com/storefront/standard-events.js';
const HANDLE = process.env.TE4_VARIANTS_HANDLE || process.env.TE4_SINGLE_HANDLE;
const JS = readFileSync(join(process.cwd(), 'assets/product-form.js'), 'utf8');
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
// route.abort()/fulfill 422: Chrome tự log "Failed to load resource" (log mạng, không phải lỗi JS theme).
const NETWORK_LOG = /Failed to load resource/i;
const MOCK_422 = { status: 422, message: 'Cart Error', description: 'ES1-T85 mock: sold out.' };
const isCart = (url: URL) => /\/cart\/?$/.test(url.pathname);

type Entry = {
  action?: string;
  context?: string;
  lines?: Array<{ merchandiseId: string; quantity: number }>;
  target?: string;
  addSentBefore?: boolean;
  settled?: boolean;
  cart?: string | null;
  userErrors?: Array<{ message: string }>;
  warnings?: unknown[];
  rejected?: string;
};

function watchConsole(page: Page, ignoreNetwork = false) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (IGNORE_CONSOLE.some((r) => r.test(text) || r.test(msg.location().url))) return;
    if (ignoreNetwork && NETWORK_LOG.test(text)) return;
    errors.push(text);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

// Listener trên document (capture), ghi sessionStorage vì luồng thành công / lỗi mạng chuyển sang /cart.
async function listen(page: Page) {
  await page.addInitScript((type) => {
    document.addEventListener(
      type,
      (e) => {
        const d = ((e as CustomEvent).detail?.lines ? (e as CustomEvent).detail : e) as Entry & { promise?: Promise<unknown> };
        const entry: Entry = {
          action: d.action,
          context: d.context,
          lines: d.lines,
          target: (e.target as Element)?.tagName?.toLowerCase(),
          addSentBefore: performance.getEntriesByType('resource').some((r) => r.name.includes('/cart/add.js')),
        };
        const save = () => sessionStorage.setItem('__t85', JSON.stringify(entry));
        save();
        Promise.resolve(d.promise).then(
          (r) => {
            const res = (r ?? {}) as { cart?: unknown; userErrors?: Entry['userErrors']; warnings?: unknown[] };
            let cart: string | null = null;
            try {
              cart = res.cart == null ? null : JSON.stringify(res.cart);
            } catch {
              cart = '[unserializable]';
            }
            Object.assign(entry, { settled: true, cart, userErrors: res.userErrors, warnings: res.warnings });
            save();
          },
          (err) => ((entry.rejected = String(err)), save())
        );
      },
      true
    );
  }, EVENT);
}

// Đang chuyển trang thì evaluate có thể ném "context destroyed" → null để poll thử lại.
const read = async (page: Page) =>
  JSON.parse((await page.evaluate(() => sessionStorage.getItem('__t85')).catch(() => null)) ?? 'null') as Entry | null;

async function open(page: Page) {
  test.skip(!HANDLE, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
  await page.goto(`/products/${HANDLE}`);
  await expect(page.getByTestId('product-form')).toHaveCount(1);
  await page.waitForFunction(() => !!customElements.get('product-form'));
  test.skip(await page.getByTestId('product-form-add').isDisabled(), 'Variant mặc định hết hàng');
  await page.evaluate(() => sessionStorage.removeItem('__t85'));
  return Number(await page.getByTestId('product-form-variant-id').inputValue());
}

async function settled(page: Page) {
  await expect.poll(async () => (await read(page))?.settled || !!(await read(page))?.rejected, { timeout: 10_000 }).toBe(true);
  return (await read(page))!;
}

function expectEvent(e: Entry, variantId: number) {
  expect(e.action).toBe('add');
  expect(e.context).toBe('product');
  expect(e.target).toBe('product-form');
  expect(e.addSentBefore).toBe(false);
  expect(e.lines?.[0]?.merchandiseId).toBe(`gid://shopify/ProductVariant/${variantId}`);
  expect(e.lines?.[0]?.quantity).toBeGreaterThanOrEqual(1);
  expect(e.rejected).toBeUndefined();
  expect(e.warnings).toEqual([]);
}

test.describe('ES1-T85 tĩnh', () => {
  test('product-form.js ≤ 8192 B, import URL CDN, dispatch trước POST, chỉ resolve (không reject)', () => {
    expect(Buffer.byteLength(JS)).toBeLessThanOrEqual(8192);
    expect(JS).toContain(`import("${CDN}")`);
    expect(JS).not.toMatch(/["']@shopify\/standard-events["']/);
    expect(JS).toMatch(/CartLinesUpdateEvent/);
    expect(JS).toMatch(/createPromise\(\)/);
    expect(JS).toMatch(/createCartFromAjaxResponse\(/);
    expect(JS).toContain('action: "add", context: "product"');
    expect(JS).toContain('gid://shopify/ProductVariant/');
    expect(JS).toContain('userErrors');
    expect(JS).toContain('warnings: []');
    expect(JS).not.toMatch(/\.reject\(/);
    expect(JS).toContain('"theme:cart:updated"');
    const submit = JS.slice(JS.indexOf('async submit('));
    expect(submit.indexOf('this.emit(body)')).toBeGreaterThan(0);
    expect(submit.indexOf('this.emit(body)')).toBeLessThan(submit.indexOf('cartAddUrl'));
    // Lỗi mạng vẫn rơi về submit form thường (ES1-T67 AC8).
    expect(submit).toContain('HTMLFormElement.prototype.submit.call(this.form)');
  });
});

test.describe('ES1-T85 storefront', () => {
  test('thêm giỏ: event action add, context product, GID đúng, resolve { cart chứa variant, userErrors [], warnings [] }', async ({ page }) => {
    await listen(page);
    const errors = watchConsole(page);
    await page.request.post('/cart/clear.js');
    const variantId = await open(page);
    const add = page.waitForResponse((r) => r.url().includes('/cart/add.js') && r.request().method() === 'POST');
    await page.getByTestId('product-form-add').click();
    expect((await add).status()).toBe(200);

    const e = await settled(page);
    expectEvent(e, variantId);
    expect(e.userErrors).toEqual([]);
    expect(e.cart).not.toBeNull();
    expect(e.cart).toContain(String(variantId));
    expect(errors).toEqual([]);
    await page.request.post('/cart/clear.js');
  });

  test('lỗi 422: resolve { cart giỏ hiện tại | null, userErrors [description] }, lỗi ở product-form-error, 0 pageerror', async ({ page }) => {
    await listen(page);
    const errors = watchConsole(page, true);
    const variantId = await open(page);
    await page.route('**/cart/add.js', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify(MOCK_422) }));
    await page.getByTestId('product-form-add').click();
    await expect(page.getByTestId('product-form-error')).toHaveText(MOCK_422.description);

    const e = await settled(page);
    expectEvent(e, variantId);
    expect(e.userErrors).toEqual([{ message: MOCK_422.description }]);
    expect(isCart(new URL(page.url()))).toBe(false);
    expect(errors).toEqual([]);
  });

  test('lỗi mạng (route.abort): resolve { cart null, userErrors 1 mục }, rơi về submit form thường → /cart, 0 pageerror', async ({ page }) => {
    await listen(page);
    const errors = watchConsole(page, true);
    await page.request.post('/cart/clear.js');
    const variantId = await open(page);
    await page.route('**/cart/add.js', (route) => route.abort());
    await page.getByTestId('product-form-add').click();
    await page.waitForURL(isCart);

    const e = await settled(page);
    expectEvent(e, variantId);
    expect(e.cart).toBeNull();
    expect(e.userErrors).toHaveLength(1);
    expect(e.userErrors?.[0]?.message).toBeTruthy();
    expect(errors).toEqual([]);
    await page.request.post('/cart/clear.js');
  });
});
