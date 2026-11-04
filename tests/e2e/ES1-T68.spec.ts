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

  test('AC7 related có card, giá card khớp giá trang sản phẩm đích, 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    const reach = await open(page);
    const root = rootIn(page, T.related);
    const limit = Number(await root.getAttribute('data-limit'));
    const productId = await root.getAttribute('data-product-id');

    const res = await (await reach(T.related, 'related')).response();
    expect(res, 'request recommendations related không có response').not.toBeNull();
    const url = new URL(res!.url());
    expect(url.searchParams.get('product_id')).toBe(productId);
    expect(url.searchParams.get('limit')).toBe(String(limit));
    const body = (await res!.json()) as { products: Product[] };
    test.skip(!body.products?.length, 'Store chưa có related cho sản phẩm này (API trả 0)');

    await expect(root).toBeVisible();
    const cards = root.getByTestId(T.list).getByTestId(T.card);
    await expect(cards).toHaveCount(Math.min(body.products.length, limit));

    const first = cards.first();
    const p = body.products[0];
    await expect(first.getByTestId(T.cardTitle)).toHaveText(p.title);
    const href = await first.getByTestId(T.cardTitle).getAttribute('href');
    expect(href).toBeTruthy();
    expect(new URL(href!, page.url()).pathname).toContain(`/products/${p.handle}`);
    const img = first.locator('img[data-card-image]');
    if (p.featured_image) {
      await expect(img).toHaveAttribute('src', /.+/);
      expect(Number(await img.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(await img.getAttribute('height'))).toBeGreaterThan(0);
    } else await expect(img).toHaveCount(0);
    await expect(first.getByTestId(T.cardSoldOut)).toBeVisible({ visible: p.available === false });

    const cardPrice = ((await first.locator('[data-card-price-current]').textContent()) ?? '').trim();
    expect(cardPrice).not.toBe('');
    expect(errors, errors.join('\n')).toEqual([]);

    await page.goto(href!);
    const pagePrice = await text(page, `[data-testid="${T.productPrice}"] [data-testid="${T.priceRegular}"]`);
    expect(cardPrice).toBe(pagePrice);
  });

  test('AC7 complementary thật: 0 kết quả thì hidden, có thì hiện card; 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    const reach = await open(page);
    const root = rootIn(page, T.complementary);
    const res = await (await reach(T.complementary, 'complementary')).response();
    const ok = !!res && res.ok();
    const products = ok ? (((await res!.json()) as { products?: Product[] }).products ?? []) : [];
    if (products.length) {
      await expect(root).toBeVisible();
      await expect(root.getByTestId(T.card).first()).toBeVisible();
    } else {
      await page.waitForTimeout(500);
      await expect(root).toBeHidden();
      await expect(root).toHaveAttribute('hidden', '');
      expect(await root.getByTestId(T.list).evaluate((el) => el.children.length)).toBe(0);
    }
    expect(errors, errors.join('\n')).toEqual([]);
  });

  for (const [name, handler] of [
    ['route.abort', (r: Route) => r.abort()],
    ['0 kết quả', (r: Route) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"products":[]}' })],
    ['HTTP 500', (r: Route) => r.fulfill({ status: 500, contentType: 'application/json', body: '{}' })],
    ['JSON hỏng', (r: Route) => r.fulfill({ status: 200, contentType: 'application/json', body: '<html>' })],
  ] as const) {
    test(`AC7 ${name} → cả 2 khối giữ hidden, 0 console error`, async ({ page }) => {
      const errors = watchConsole(page, true);
      await page.route(REC_GLOB, handler);
      const reach = await open(page);
      for (const [container, intent] of [[T.related, 'related'], [T.complementary, 'complementary']] as const) {
        await reach(container, intent);
        await page.waitForTimeout(500);
        const root = rootIn(page, container);
        await expect(root).toBeHidden();
        await expect(root).toHaveAttribute('hidden', '');
        expect(await root.getByTestId(T.list).evaluate((el) => el.children.length)).toBe(0);
      }
      expect(errors, errors.join('\n')).toEqual([]);
    });
  }

  test('AC7 mock: giá sale + giá gạch theo money_format khớp Liquid, badge Sold out, ảnh width/height từ JSON', async ({ page }) => {
    test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE');
    const r = await getJson<Product>(page.request, `/products/${ENV.product}.js`);
    expect(r.ok, `/products/${ENV.product}.js trả ${r.status}`).toBeTruthy();
    const src = r.body!;
    const variants = src.variants.map((v) => ({ ...v, compare_at_price: v.price + 12345 }));
    const mock: Product = { ...src, url: `/products/${src.handle}`, available: false, variants };
    const media = src.media?.find((m) => m.media_type === 'image');

    const errors = watchConsole(page);
    await page.route(REC_GLOB, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [mock] }) }));
    const reach = await open(page);
    // Liquid: giá variant mặc định trên chính trang này (selected_or_first_available_variant)
    const liquidPrice = await text(page, `[data-testid="${T.productPrice}"] [data-testid="${T.priceRegular}"]`);
    const root = rootIn(page, T.related);
    await reach(T.related, 'related');
    await expect(root).toBeVisible();

    const card = root.getByTestId(T.card);
    await expect(card).toHaveCount(1);
    await expect(card.locator('[data-card-price]')).toHaveClass(/price--on-sale/);
    // JS lấy variant còn hàng đầu tiên = selected_or_first_available_variant khi URL không có ?variant=
    await expect(card.locator('[data-card-price-current]')).toHaveText(liquidPrice);
    const compare = ((await card.locator('[data-card-price-compare]').textContent()) ?? '').trim();
    expect(compare).not.toBe('');
    // cùng định dạng: bỏ chữ số thì phần còn lại (ký hiệu, dấu) giống giá Liquid
    const shape = (s: string) => s.replace(/\d/g, '').replace(/[.,\s]/g, '');
    expect(shape(compare)).toBe(shape(liquidPrice));
    await expect(card.getByTestId(T.cardSoldOut)).toBeVisible();
    await expect(card.getByTestId(T.cardTitle)).toHaveText(src.title);
    const img = card.locator('img[data-card-image]');
    if (src.featured_image && media) {
      await expect(img).toHaveAttribute('width', String(media.width));
      await expect(img).toHaveAttribute('height', String(media.height));
      await expect(img).toHaveAttribute('loading', 'lazy');
    }
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC7 không request recommendations trước LCP', async ({ page }) => {
    await open(page);
    await page.waitForLoadState('load');
    const timing = await page.evaluate(
      () =>
        new Promise<{ lcp: number; recs: number[] }>((resolve) => {
          let lcp = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) lcp = Math.max(lcp, e.startTime);
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          setTimeout(() => {
            const recs = performance
              .getEntriesByType('resource')
              .filter((e) => /\/recommendations\/products\.json/.test(e.name))
              .map((e) => e.startTime);
            resolve({ lcp, recs });
          }, 1000);
        })
    );
    expect(timing.lcp).toBeGreaterThan(0);
    for (const start of timing.recs) expect(start, 'request recommendations bắt đầu trước LCP').toBeGreaterThanOrEqual(timing.lcp);
  });
});
