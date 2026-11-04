// KHÔNG CHẮC: spec chưa chạy (sandbox agent không mở được trình duyệt) → chờ CI. Tên property trên event (action/context/lines/promise ở event hay detail) lấy theo ticket, đọc cả 2 chỗ như ES1-T66.
// Ticket ES1-T85 TE-4-BE5: assets/product-form.js dispatch shopify:cart:lines-update (CartLinesUpdateEvent) trước POST cart/add.js.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... [TE4_SINGLE_HANDLE=...] npx playwright test tests/e2e/ES1-T85.spec.ts
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const EVENT = 'shopify:cart:lines-update';
const CDN = 'https://cdn.shopify.com/storefront/standard-events.js';
const HANDLE = process.env.TE4_VARIANTS_HANDLE || process.env.TE4_SINGLE_HANDLE;
const JS = readFileSync(join(process.cwd(), 'assets/product-form.js'), 'utf8');
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const NETWORK_LOG = /Failed to load resource/i;
const MOCK_422 = { status: 422, message: 'Cart Error', description: 'ES1-T85 mock: sold out.' };

type Entry = {
  action?: string;
  context?: string;
  lines?: Array<{ merchandiseId: string; quantity: number }>;
  target?: string;
  addSentBefore?: boolean;
  result?: { items?: Array<{ variant_id: number }> } | null;
  error?: string;
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

// Listener trên document (capture), ghi sessionStorage vì luồng thành công chuyển sang /cart.
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
          (r) => ((entry.result = r as Entry['result']), save()),
          (err) => ((entry.error = String(err)), save())
        );
      },
      true
    );
  }, EVENT);
}

// Đang chuyển sang /cart thì evaluate có thể ném "context destroyed" → null để poll thử lại.
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

test.describe('ES1-T85 tĩnh', () => {
  test('product-form.js ≤ 8192 B, import URL CDN, CartLinesUpdateEvent dispatch trước POST', () => {
    expect(Buffer.byteLength(JS)).toBeLessThanOrEqual(8192);
    expect(JS).toContain(`import("${CDN}")`);
    expect(JS).not.toMatch(/["']@shopify\/standard-events["']/);
    expect(JS).toMatch(/CartLinesUpdateEvent/);
    expect(JS).toMatch(/createPromise\(\)/);
    expect(JS).toContain('action: "add", context: "product"');
    expect(JS).toContain('gid://shopify/ProductVariant/');
    expect(JS).toContain('"theme:cart:updated"');
    // emit() chạy trước fetch cart/add.js trong submit()
    const submit = JS.slice(JS.indexOf('async submit('));
    expect(submit.indexOf('this.emit(body)')).toBeGreaterThan(0);
    expect(submit.indexOf('this.emit(body)')).toBeLessThan(submit.indexOf('cartAddUrl'));
  });
});

test.describe('ES1-T85 storefront', () => {
  test('thêm giỏ: document nhận event action add, context product, merchandiseId GID, promise → cart có variant', async ({ page }) => {
    await listen(page);
    const errors = watchConsole(page);
    await page.request.post('/cart/clear.js');
    const variantId = await open(page);
    const add = page.waitForResponse((r) => r.url().includes('/cart/add.js') && r.request().method() === 'POST');
    await page.getByTestId('product-form-add').click();
    expect((await add).status()).toBe(200);

    await expect.poll(async () => (await read(page))?.result ?? null, { timeout: 10_000 }).not.toBeNull();
    const e = (await read(page))!;
    expect(e.action).toBe('add');
    expect(e.context).toBe('product');
    expect(e.target).toBe('product-form');
    expect(e.addSentBefore).toBe(false);
    expect(e.lines?.[0]?.merchandiseId).toBe(`gid://shopify/ProductVariant/${variantId}`);
    expect(e.lines?.[0]?.quantity).toBeGreaterThanOrEqual(1);
    expect(e.error).toBeUndefined();
    expect(e.result?.items?.some((i) => i.variant_id === variantId)).toBe(true);
    expect(errors).toEqual([]);
    await page.request.post('/cart/clear.js');
  });

  test('lỗi 422: event vẫn dispatch, promise reject, lỗi hiện ở product-form-error, 0 console error', async ({ page }) => {
    await listen(page);
    const errors = watchConsole(page, true);
    const variantId = await open(page);
    await page.route('**/cart/add.js', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify(MOCK_422) }));
    await page.getByTestId('product-form-add').click();
    await expect(page.getByTestId('product-form-error')).toHaveText(MOCK_422.description);

    await expect.poll(async () => (await read(page))?.error ?? null).not.toBeNull();
    const e = (await read(page))!;
    expect(e.action).toBe('add');
    expect(e.lines?.[0]?.merchandiseId).toBe(`gid://shopify/ProductVariant/${variantId}`);
    expect(e.error).toContain(MOCK_422.description);
    expect(e.result).toBeUndefined();
    expect(errors).toEqual([]);
  });
});
