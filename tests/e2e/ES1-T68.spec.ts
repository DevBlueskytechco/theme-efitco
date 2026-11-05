// KHÔNG CHẮC: spec chưa chạy (sandbox agent không mở được trình duyệt, không có node_modules) → chờ CI. Shape JSON /recommendations/products.json giả định giống /products/<handle>.js (price cents, variants, media, featured_image).
// Ticket ES1-T68 TE-4-BE4: assets/product-recommendations.js (docs/srs.md#TE-4 AC7; drafts/techlead/ES1-T59/task-split.md D7, D9, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... npx playwright test tests/e2e/ES1-T68.spec.ts -g "AC7"
// Thiếu env → tests/e2e/store-data.json (ES1-T78); vẫn thiếu → skip có lý do.
import { test, expect, type Page, type Request, type Route } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { getJson } from './support/http';

const T = {
  root: 'product-recommendations',
  list: 'product-recommendations-list',
  card: 'product-recommendations-card',
  cardTitle: 'product-recommendations-card-title',
  cardPrice: 'product-recommendations-card-price',
  cardSoldOut: 'product-recommendations-card-sold-out',
  related: 'container-product-related',
  complementary: 'container-product-complementary',
  productPrice: 'product-price',
  priceRegular: 'price-regular',
} as const;

const ENV = { product: env('TE4_VARIANTS_HANDLE') };

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const JS = read('assets/product-recommendations.js');
const BLOCK = read('blocks/product-recommendations.liquid');

const REC = /\/recommendations\/products\.json/;
const REC_GLOB = '**/recommendations/products.json*';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
// route.abort()/fulfill 500: Chrome tự log "Failed to load resource" (log mạng, không phải lỗi JS theme).
const NETWORK_LOG = /Failed to load resource/i;

type Variant = { id: number; price: number; compare_at_price: number | null; available: boolean };
type Product = { id: number; title: string; url?: string; handle: string; available: boolean; variants: Variant[]; featured_image: string | null; media?: Array<{ media_type: string; width: number; height: number }> };

const tid = (page: Page, id: string) => page.getByTestId(id);
const productPath = (handle: string) => `/products/${handle}`;
const rootIn = (page: Page, container: string) => tid(page, container).getByTestId(T.root);

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

/**
 * Mở trang sản phẩm, ghi request recommendations theo intent từ trước goto (trang ngắn: container
 * có thể đã trong rootMargin lúc tải). Trả hàm reach: cuộn tới container (root hidden không có box)
 * rồi chờ request của intent đó.
 */
async function open(page: Page) {
  test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE');
  const seen = new Map<string, Request>();
  page.on('request', (r) => {
    if (REC.test(r.url())) seen.set(new URL(r.url()).searchParams.get('intent') ?? '', r);
  });
  await page.goto(productPath(ENV.product!));
  await expect(tid(page, T.root)).toHaveCount(2);
  await page.waitForFunction(() => !!customElements.get('product-recommendations'));
  return async (container: string, intent: string) => {
    await tid(page, container).evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect.poll(() => seen.has(intent), { timeout: 15_000, message: `không có request intent=${intent}` }).toBe(true);
    return seen.get(intent)!;
  };
}

const text = async (page: Page, sel: string) => ((await page.locator(sel).first().textContent()) ?? '').replace(/\s+/g, ' ').trim();

test.describe('ES1-T68 TE-4 product recommendations JS', () => {
  test('AC7 contract: ≤ 3072 B, 1 thẻ script module, hook JS có trong markup FE', () => {
    expect(Buffer.byteLength(JS)).toBeLessThanOrEqual(3072);
    const scripts = BLOCK.match(/<script\b[^>]*>/g) ?? [];
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toContain("'product-recommendations.js' | asset_url");
    expect(scripts[0]).toContain('type="module"');
    expect(JS).toContain("customElements.define(TAG");
    expect(JS).toContain("'product-recommendations'");
    for (const hook of ['data-recommendations-placeholder', 'data-recommendations-list', '<template data-recommendations-template']) expect(BLOCK).toContain(hook);
    for (const s of ['link', 'image', 'title', 'price', 'price-current', 'price-compare', 'sold-out']) expect(BLOCK).toContain(`data-card-${s}`);
    for (const k of ['productId', 'limit', 'intent', 'url', 'moneyFormat']) expect(JS).toContain(`d.${k}`);
    expect(JS).toContain("rootMargin: '200px'");
    expect(JS).not.toMatch(/console\.(log|error|warn)/);
  });

  for (const [name, handler] of [
    ['route.abort', (r: Route) => r.abort()],
    ['0 kết quả', (r: Route) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"products":[]}' })],
    ['HTTP 500', (r: Route) => r.fulfill({ status: 500, contentType: 'application/json', body: '{}' })],
    ['JSON hỏng', (r: Route) => r.fulfill({ status: 200, contentType: 'application/json', body: '<html>' })],
  ] as const) {
  }

});
