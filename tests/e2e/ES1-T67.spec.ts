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
import { CART_GLOB } from './support/cart-api';

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

const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
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
  await page.route(CART_GLOB.add, async (route) => {
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

});
