// KHÔNG CHẮC: spec chưa chạy (sandbox agent không mở được trình duyệt, không có node_modules) → chờ CI.
// Ticket ES1-T67 TE-4-BE2: assets/product-form.js (docs/srs.md#TE-4 AC5, AC6, AC8; drafts/techlead/ES1-T59/task-split.md D5, D8, D9, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... [TE4_SINGLE_HANDLE=...] [TE4_GIFT_CARD_HANDLE=...]
//   npx playwright test tests/e2e/ES1-T67.spec.ts -g "AC5|AC6|AC8"
// Thiếu biến → skip có lý do. Viewport 390 / 1280 đặt trong test nên chạy được cả project desktop và mobile (Pixel 7).
// Có <cart-drawer> (TE-5) và cart type drawer → test chuyển /cart skip (drawer mở thuộc TE-5).
import { test, expect, type Page, type Request } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getJson } from './support/http';

const T = {
  form: 'product-form',
  add: 'product-form-add',
  status: 'product-form-status',
  error: 'product-form-error',
  variantId: 'product-form-variant-id',
  sticky: 'product-sticky-bar',
  stickyTitle: 'product-sticky-bar-title',
  stickyPrice: 'product-sticky-bar-price',
  stickyAdd: 'product-sticky-bar-add',
  giftToggle: 'product-gift-card-toggle',
  giftEmail: 'product-gift-card-email',
  giftName: 'product-gift-card-name',
  giftMessage: 'product-gift-card-message',
  giftSendOn: 'product-gift-card-send-on',
} as const;

const ENV = {
  product: process.env.TE4_VARIANTS_HANDLE || process.env.TE4_SINGLE_HANDLE,
  giftCard: process.env.TE4_GIFT_CARD_HANDLE,
};

const ROOT = process.cwd();
const JS = readFileSync(join(ROOT, 'assets/product-form.js'), 'utf8');
const FORM_LIQUID = readFileSync(join(ROOT, 'blocks/product-form.liquid'), 'utf8');
const STICKY_LIQUID = readFileSync(join(ROOT, 'blocks/product-sticky-bar.liquid'), 'utf8');

const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
// route.abort()/fulfill 422: Chrome tự log "Failed to load resource" (log mạng, không phải lỗi JS theme).
const NETWORK_LOG = /Failed to load resource/i;
const MOCK_422 = { status: 422, message: 'Cart Error', description: 'ES1-T67 mock: You can only add 0 of this item to your cart.' };

const tid = (page: Page, id: string) => page.getByTestId(id);
const productPath = (handle: string) => `/products/${handle}`;
const isCart = (url: URL) => /\/cart\/?$/.test(url.pathname);

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

async function open(page: Page, handle: string | undefined, reason: string) {
  test.skip(!handle, reason);
  await page.goto(productPath(handle!));
  await expect(tid(page, T.form)).toHaveCount(1);
  await page.waitForFunction(() => !!customElements.get('product-form') && !!customElements.get('product-sticky-bar'));
  // Cờ trong window: còn thì trang chưa navigate.
  await page.evaluate(() => ((window as unknown as { __t67: number }).__t67 = 1));
}

async function openProduct(page: Page) {
  await open(page, ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE (sản phẩm có variant còn hàng)');
  test.skip(await tid(page, T.add).isDisabled(), 'Variant mặc định hết hàng, không thêm giỏ được');
}

const stayed = (page: Page) => page.evaluate(() => (window as unknown as { __t67?: number }).__t67 === 1);

async function drawerMode(page: Page) {
  const type = await tid(page, T.form).getAttribute('data-cart-type');
  return type !== 'page' && (await page.locator('cart-drawer').count()) > 0;
}

// FormData → multipart; tên field nằm trong name="...".
function fields(req: Request) {
  const body = req.postData() ?? '';
  return [...body.matchAll(/name="([^"]+)"\r?\n\r?\n([^\r\n]*)/g)].reduce<Record<string, string>>((acc, m) => ((acc[m[1]] = m[2]), acc), {});
}

async function mockAdd(page: Page) {
  const requests: Request[] = [];
  await page.route('**/cart/add.js', async (route) => {
    requests.push(route.request());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, variant_id: 1, quantity: 1 }) });
  });
  return requests;
}

test.describe('ES1-T67 TE-4 product form + sticky bar', () => {
  test('AC5 AC6 AC8 contract: bundle, 1 thẻ script, custom element và selector khớp markup', () => {
    // ES1-T85 thêm CartLinesUpdateEvent → vượt trần mềm 5120 B; trần cứng 8192 B/file (ADR 0006, CTO review PR #72).
    expect(Buffer.byteLength(JS), 'bundle tối đa 8192 B').toBeLessThanOrEqual(8192);
    const scripts = [...FORM_LIQUID.matchAll(/<script src="\{\{ 'product-form\.js' \| asset_url \}\}" type="module"><\/script>/g)];
    expect(scripts).toHaveLength(1);
    // sticky bar không có thẻ script riêng (doc comment được phép nhắc tên file)
    expect(STICKY_LIQUID.replace(/{%-?\s*doc\s*-?%}[\s\S]*?{%-?\s*enddoc\s*-?%}/g, '')).not.toMatch(/product-form\.js/);
    for (const name of ['product-form', 'product-sticky-bar']) {
      expect(JS).toContain(`"${name}"`);
      expect(FORM_LIQUID + STICKY_LIQUID).toMatch(new RegExp(`<${name}\\b`));
    }
    // Hook JS đọc từ markup FE.
    expect(FORM_LIQUID).toContain("assign form_id = 'product-form-' | append: product.id");
    expect(JS).toContain('`product-form-${this.dataset.productId}`');
    for (const hook of ['data-product-id=', 'data-cart-add-url=', 'data-cart-url=', 'data-cart-type=', 'role="status"', 'role="alert"', 'name="add"', 'class="product-gift-card"', 'name="properties[__shopify_send_gift_card_to_customer]"', 'class="product-gift-card__fields"']) {
      expect(FORM_LIQUID, `thiếu ${hook}`).toContain(hook);
    }
    expect(STICKY_LIQUID).toContain('data-form-id="{{ form_id }}"');
    expect(STICKY_LIQUID).toMatch(/<product-sticky-bar[\s\S]*?\bhidden\b/);
    expect(STICKY_LIQUID).toContain('form="{{ form_id }}"');
    // Ngưỡng media khớp base.css (sticky chỉ dưới 48rem).
    expect(readFileSync(join(ROOT, 'assets/base.css'), 'utf8')).toContain('@media (max-width: 47.99rem)');
    expect(JS).toContain('"(max-width: 47.99rem)"');
    expect(JS).not.toMatch(/addEventListener\(\s*"scroll"/);
  });

  test('AC8 thêm thành công: chưa có cart-drawer → chuyển /cart, có theme:cart:updated, cart có variant', async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener('theme:cart:updated', (e) => {
        sessionStorage.setItem('__t67Cart', JSON.stringify((e as CustomEvent).detail ?? null));
      });
    });
    const errors = watchConsole(page);
    await page.request.post('/cart/clear.js');
    await openProduct(page);
    test.skip(await drawerMode(page), 'Có cart-drawer + cart type drawer: mở drawer thuộc TE-5');
    const variantId = Number(await tid(page, T.variantId).inputValue());

    const add = page.waitForResponse((r) => r.url().includes('/cart/add.js') && r.request().method() === 'POST');
    await tid(page, T.add).click();
    expect((await add).status()).toBe(200);
    await page.waitForURL(isCart);

    const detail = JSON.parse((await page.evaluate(() => sessionStorage.getItem('__t67Cart'))) ?? 'null');
    expect(detail?.source).toBe('product-form');
    expect(detail?.item?.variant_id).toBe(variantId);
    const res = await getJson<{ items: Array<{ variant_id: number }> }>(page.request, '/cart.js');
    test.skip(res.status === 429, 'Shopify trả 429 cho /cart.js sau khi thử lại (giới hạn store dev)');
    const cart = res.body!;
    expect(cart.items.some((i) => i.variant_id === variantId)).toBeTruthy();
    expect(errors).toEqual([]);
    await page.request.post('/cart/clear.js');
  });

  test('AC8 lỗi 422: description API vào product-form-error, nút disabled + aria-busy khi gửi rồi trở lại, không chuyển trang', async ({ page }) => {
    const errors = watchConsole(page, true);
    await openProduct(page);
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    await page.route('**/cart/add.js', async (route) => {
      await gate;
      await route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify(MOCK_422) });
    });

    const add = tid(page, T.add);
    await add.click();
    await expect(add).toBeDisabled();
    await expect(add).toHaveAttribute('aria-busy', 'true');
    release();

    await expect(tid(page, T.error)).toHaveText(MOCK_422.description);
    await expect(tid(page, T.error)).toHaveAttribute('role', 'alert');
    await expect(add).toBeEnabled();
    await expect(add).not.toHaveAttribute('aria-busy');
    expect(await stayed(page)).toBe(true);
    expect(isCart(new URL(page.url()))).toBe(false);

    // Gửi lại: lỗi cũ bị xoá trước request mới.
    await page.unroute('**/cart/add.js');
    await page.route('**/cart/add.js', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ ...MOCK_422, description: 'second' }) }));
    await add.click();
    await expect(tid(page, T.error)).toHaveText('second');
    expect(errors).toEqual([]);
  });

  test('AC8 lỗi mạng (route.abort): không lỗi JS, rơi về submit form thường → /cart', async ({ page }) => {
    const errors = watchConsole(page, true);
    await page.request.post('/cart/clear.js');
    await openProduct(page);
    await page.route('**/cart/add.js', (route) => route.abort());
    await tid(page, T.add).click();
    await page.waitForURL(isCart);
    expect(errors).toEqual([]);
    await page.request.post('/cart/clear.js');
  });

  test('AC5 390px: cuộn qua nút chính → sticky hiện (tên, giá, nút) + data-sticky-bar-visible; cuộn về → ẩn', async ({ page }) => {
    const errors = watchConsole(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await openProduct(page);
    const sticky = tid(page, T.sticky);
    const html = page.locator('html');
    await expect(sticky).toBeHidden();
    await expect(html).not.toHaveAttribute('data-sticky-bar-visible');

    const passed = await tid(page, T.add).evaluate((b) => {
      window.scrollTo(0, b.getBoundingClientRect().bottom + window.scrollY + 40);
      return b.getBoundingClientRect().bottom <= 0;
    });
    test.skip(!passed, 'Trang không đủ dài để cuộn qua nút chính ở 390px');
    await expect(sticky).toBeVisible();
    await expect(html).toHaveAttribute('data-sticky-bar-visible');
    await expect(tid(page, T.stickyTitle)).toBeVisible();
    await expect(tid(page, T.stickyPrice)).toBeVisible();
    await expect(tid(page, T.stickyAdd)).toBeVisible();
    await expect(tid(page, T.stickyAdd)).toBeEnabled();

    await tid(page, T.add).evaluate((b) => b.scrollIntoView({ block: 'center' }));
    await expect(sticky).toBeHidden();
    await expect(html).not.toHaveAttribute('data-sticky-bar-visible');
    expect(errors).toEqual([]);
  });

  test('AC5 390px: nút sticky gửi form chính qua cart/add.js', async ({ page }) => {
    const errors = watchConsole(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await openProduct(page);
    test.skip(await drawerMode(page), 'Có cart-drawer + cart type drawer: thuộc TE-5');
    const passed = await tid(page, T.add).evaluate((b) => {
      window.scrollTo(0, b.getBoundingClientRect().bottom + window.scrollY + 40);
      return b.getBoundingClientRect().bottom <= 0;
    });
    test.skip(!passed, 'Trang không đủ dài để cuộn qua nút chính ở 390px');
    const variantId = await tid(page, T.variantId).inputValue();
    const requests = await mockAdd(page);
    await tid(page, T.stickyAdd).click();
    await page.waitForURL(isCart);
    expect(requests).toHaveLength(1);
    const sent = fields(requests[0]);
    expect(sent.id).toBe(variantId);
    expect(Number(sent.quantity)).toBeGreaterThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test('AC5 1280px: cuộn hết trang, sticky không hiện', async ({ page }) => {
    const errors = watchConsole(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await openProduct(page);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    await expect(tid(page, T.sticky)).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-sticky-bar-visible');
    expect(errors).toEqual([]);
  });

  test('AC6 gift card bỏ chọn: fieldset disabled, không gửi properties recipient / offset', async ({ page }) => {
    const errors = watchConsole(page);
    await open(page, ENV.giftCard, 'Thiếu TE4_GIFT_CARD_HANDLE');
    test.skip(await tid(page, T.add).isDisabled(), 'Gift card hết hàng');
    for (const id of [T.giftEmail, T.giftName, T.giftMessage, T.giftSendOn]) await expect(tid(page, id)).toBeDisabled();

    // Tick, nhập, rồi bỏ tick: giá trị đã nhập vẫn không được gửi.
    await tid(page, T.giftToggle).check();
    await tid(page, T.giftEmail).fill('es1-t67@example.com');
    await tid(page, T.giftName).fill('ES1-T67');
    await tid(page, T.giftToggle).uncheck();
    for (const id of [T.giftEmail, T.giftName, T.giftMessage, T.giftSendOn]) await expect(tid(page, id)).toBeDisabled();

    const requests = await mockAdd(page);
    await tid(page, T.add).click();
    await expect.poll(() => requests.length).toBe(1);
    const sent = fields(requests[0]);
    expect(Object.keys(sent).filter((k) => /Recipient|Message|Send on|__shopify_offset|__shopify_send_gift_card/.test(k))).toEqual([]);
    expect(sent.id).toBeTruthy();
    expect(errors).toEqual([]);
  });

  test('AC6 gift card tick: gửi 4 field + __shopify_offset = độ lệch múi giờ', async ({ page }) => {
    const errors = watchConsole(page);
    await open(page, ENV.giftCard, 'Thiếu TE4_GIFT_CARD_HANDLE');
    test.skip(await tid(page, T.add).isDisabled(), 'Gift card hết hàng');
    await tid(page, T.giftToggle).check();
    for (const id of [T.giftEmail, T.giftName, T.giftMessage, T.giftSendOn]) await expect(tid(page, id)).toBeEnabled();
    await tid(page, T.giftEmail).fill('es1-t67@example.com');
    await tid(page, T.giftName).fill('ES1-T67');
    await tid(page, T.giftMessage).fill('Hello');
    const min = await tid(page, T.giftSendOn).getAttribute('min');
    if (min) await tid(page, T.giftSendOn).fill(min);

    const requests = await mockAdd(page);
    await tid(page, T.add).click();
    await expect.poll(() => requests.length).toBe(1);
    const sent = fields(requests[0]);
    expect(sent['properties[__shopify_send_gift_card_to_customer]']).toBe('on');
    expect(sent['properties[Recipient email]']).toBe('es1-t67@example.com');
    expect(sent['properties[Recipient name]']).toBe('ES1-T67');
    expect(sent['properties[Message]']).toBe('Hello');
    if (min) expect(sent['properties[Send on]']).toBe(min);
    const offset = await page.evaluate(() => String(new Date().getTimezoneOffset()));
    expect(sent['properties[__shopify_offset]']).toBe(offset);
    expect(errors).toEqual([]);
  });
});
