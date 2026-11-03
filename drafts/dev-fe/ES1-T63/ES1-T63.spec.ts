// KHÔNG CHẮC: spec chưa chạy (không preview, không node_modules trong phiên viết); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T63.spec.ts.
// Ticket ES1-T63 TE-4-FE2: product info + sticky bar + JSON-LD (docs/srs.md#TE-4 AC3, AC5 markup, AC9, AC10, AC11; drafts/techlead/ES1-T59/task-split.md D3, D5, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... TE4_DIGITAL_HANDLE=... TE4_SOLD_OUT_HANDLE=...
//   [TE4_TAX_INCLUDED_COUNTRY=XX] npx playwright test tests/e2e/ES1-T63.spec.ts -g "AC3|AC9|AC10|AC11|AC5-markup"
// Thiếu biến → skip có lý do. Partial chỉ render khi store bật agentic editor (AGENTS.md).
import { test, expect, type Page, type Browser } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const T = {
  info: 'product-info',
  title: 'product-title',
  vendor: 'product-vendor',
  price: 'product-price',
  notes: 'product-notes',
  noteTax: 'product-note-tax',
  noteShipping: 'product-note-shipping',
  description: 'product-description',
  structuredData: 'product-structured-data',
  stickyBar: 'product-sticky-bar',
  stickyTitle: 'product-sticky-bar-title',
  stickyPrice: 'product-sticky-bar-price',
  stickyAdd: 'product-sticky-bar-add',
} as const;

const ENV = {
  variants: process.env.TE4_VARIANTS_HANDLE,
  digital: process.env.TE4_DIGITAL_HANDLE,
  soldOut: process.env.TE4_SOLD_OUT_HANDLE,
  taxCountry: process.env.TE4_TAX_INCLUDED_COUNTRY,
};

// locales/en.default.json blocks.product_info
const TAX_NOTES = [
  'Taxes and duties included.',
  'Taxes included.',
  'Duties included. Taxes calculated at checkout.',
  'Taxes calculated at checkout.',
];

const tid = (page: Page, id: string) => page.getByTestId(id);
const productPath = (handle: string, query = '') => `/products/${handle}${query}`;

type JsVariant = { id: number; available: boolean; price: number; sku: string | null; requires_shipping: boolean };
type JsProduct = { id: number; title: string; vendor: string; description: string; variants: JsVariant[] };
type Offer = { '@type': string; price: number; priceCurrency: string; availability: string; url: string; sku?: string };
type LdProduct = { '@type': string; name: string; url: string; image?: string[]; description?: string; brand?: { name: string }; offers: Offer[] };

async function productJs(page: Page, handle: string): Promise<JsProduct> {
  const res = await page.request.get(`/products/${handle}.js`);
  expect(res.ok(), `/products/${handle}.js trả ${res.status()}`).toBeTruthy();
  return (await res.json()) as JsProduct;
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

test.describe('ES1-T63 TE-4 product info, sticky bar, JSON-LD', () => {
  test('AC3 title đầy đủ trong h1, vendor (mặc định bật), giá, mô tả', async ({ page }) => {
    test.skip(!ENV.variants, 'Thiếu TE4_VARIANTS_HANDLE');
    const product = await productJs(page, ENV.variants!);
    await page.goto(productPath(ENV.variants!));

    await expect(tid(page, T.info)).toBeVisible();
    const title = tid(page, T.title);
    await expect(title).toHaveText(product.title);
    expect(await title.evaluate((el) => el.tagName)).toBe('H1');
    await expect(page.locator('h1')).toHaveCount(1);

    if (product.vendor) {
      await expect(tid(page, T.vendor)).toHaveText(product.vendor);
    }
    await expect(tid(page, T.price).getByTestId('price')).toBeVisible();
    if (product.description.trim()) {
      await expect(tid(page, T.description)).toBeVisible();
    } else {
      await expect(tid(page, T.description)).toHaveCount(0);
    }
  });

  test('AC3 ghi chú thuế luôn có, 1 trong 4 chuỗi locale', async ({ page }) => {
    test.skip(!ENV.variants, 'Thiếu TE4_VARIANTS_HANDLE');
    await page.goto(productPath(ENV.variants!));
    const text = (await tid(page, T.noteTax).innerText()).trim();
    expect(TAX_NOTES).toContain(text);
  });

  test('AC9 sản phẩm cần vận chuyển có product-note-shipping', async ({ page }) => {
    test.skip(!ENV.variants, 'Thiếu TE4_VARIANTS_HANDLE');
    const product = await productJs(page, ENV.variants!);
    await page.goto(productPath(ENV.variants!));
    const first = product.variants.find((v) => v.available) ?? product.variants[0];
    test.skip(!first.requires_shipping, 'Variant mặc định của TE4_VARIANTS_HANDLE không cần vận chuyển');
    await expect(tid(page, T.noteShipping)).toBeVisible();
    await expect(tid(page, T.noteShipping)).toContainText('calculated at checkout');
  });

  test('AC9 TE4_DIGITAL_HANDLE không có product-note-shipping', async ({ page }) => {
    test.skip(!ENV.digital, 'Thiếu TE4_DIGITAL_HANDLE (ES1-T60 #1)');
    await page.goto(productPath(ENV.digital!));
    await expect(tid(page, T.notes)).toBeVisible();
    await expect(tid(page, T.noteShipping)).toHaveCount(0);
  });

  test('AC10 market gồm thuế (?country=) hiện ghi chú included', async ({ page }) => {
    test.skip(!ENV.variants || !ENV.taxCountry, 'Thiếu TE4_TAX_INCLUDED_COUNTRY: store chưa có market gồm thuế → kiểm tay, ghi ảnh');
    await page.goto(productPath(ENV.variants!, `?country=${ENV.taxCountry}`));
    await expect(tid(page, T.noteTax)).toHaveText(/included\./);
  });

  test('AC11 JSON-LD Product duy nhất, parse được, offers đủ variant, availability + price đúng', async ({ page }) => {
    const handle = ENV.variants ?? ENV.soldOut;
    test.skip(!handle, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SOLD_OUT_HANDLE');
    const product = await productJs(page, handle!);
    await page.goto(productPath(handle!));

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const products = scripts.map((s) => JSON.parse(s)).filter((d) => d['@type'] === 'Product');
    expect(products, 'Đúng 1 Product (meta-tags không còn structured_data)').toHaveLength(1);

    const ld = JSON.parse(await tid(page, T.structuredData).textContent() ?? '') as LdProduct;
    expect(ld['@type']).toBe('Product');
    expect(ld.name).toBe(product.title);
    expect(ld.url).toMatch(/^https:\/\//);
    if (product.vendor) expect(ld.brand?.name).toBe(product.vendor);
    if (ld.image) {
      expect(ld.image.length).toBeLessThanOrEqual(5);
      for (const src of ld.image) expect(src).toMatch(/^https:\/\/.*width=1200/);
    }
    if (ld.description) expect(ld.description).not.toMatch(/<[a-z/]/i);

    expect(ld.offers).toHaveLength(product.variants.length);
    product.variants.forEach((variant, i) => {
      const offer = ld.offers[i];
      expect(offer['@type']).toBe('Offer');
      expect(offer.price).toBeCloseTo(variant.price / 100, 2);
      expect(offer.priceCurrency).toMatch(/^[A-Z]{3}$/);
      expect(offer.availability).toBe(variant.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock');
      expect(offer.url).toMatch(new RegExp(`^https://.*variant=${variant.id}`));
    });
  });

  test('AC5-markup sticky bar hidden mặc định, nút submit form chính', async ({ page }) => {
    test.skip(!ENV.variants, 'Thiếu TE4_VARIANTS_HANDLE');
    const product = await productJs(page, ENV.variants!);
    await page.goto(productPath(ENV.variants!));

    const bar = tid(page, T.stickyBar);
    await expect(bar).toHaveCount(1);
    expect(await bar.evaluate((el) => el.tagName.toLowerCase())).toBe('product-sticky-bar');
    await expect(tid(page, T.stickyTitle)).toHaveText(product.title);
    await expect(tid(page, T.stickyPrice).getByTestId('price')).toHaveCount(1);

    const add = tid(page, T.stickyAdd);
    await expect(add).toHaveAttribute('type', 'submit');
    await expect(add).toHaveAttribute('form', `product-form-${product.id}`);
    await expect(page.locator(`form#product-form-${product.id}`)).toHaveCount(1);
  });

  test('AC5-markup bỏ hidden: hiện dưới 48rem, ẩn từ 48rem', async ({ page }) => {
    test.skip(!ENV.variants, 'Thiếu TE4_VARIANTS_HANDLE');
    await page.goto(productPath(ENV.variants!));
    const bar = tid(page, T.stickyBar);
    await bar.evaluate((el) => el.removeAttribute('hidden'));
    const width = page.viewportSize()?.width ?? 0;
    if (width < 768) {
      await expect(bar).toBeVisible();
      expect(await bar.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
    } else {
      await expect(bar).toBeHidden();
    }
  });

  test('AC5-markup sold out → nút sticky disabled', async ({ page }) => {
    test.skip(!ENV.soldOut, 'Thiếu TE4_SOLD_OUT_HANDLE');
    await page.goto(productPath(ENV.soldOut!));
    await expect(tid(page, T.stickyAdd)).toBeDisabled();
    await expect(tid(page, T.stickyAdd)).toHaveText('Sold out');
  });

  test('AC5-markup nojs sticky bar không hiện', async ({ browser }) => {
    test.skip(!ENV.variants, 'Thiếu TE4_VARIANTS_HANDLE');
    const { context, page } = await noJsPage(browser);
    await page.goto(productPath(ENV.variants!));
    await page.mouse.wheel(0, 3000);
    await expect(tid(page, T.stickyBar)).toBeHidden();
    await expect(tid(page, T.info)).toBeVisible();
    await context.close();
  });

  test('AC3 axe 0 serious trên product-info', async ({ page }) => {
    test.skip(!ENV.variants, 'Thiếu TE4_VARIANTS_HANDLE');
    await page.goto(productPath(ENV.variants!));
    const results = await new AxeBuilder({ page }).include('[data-testid="product-info"]').analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toHaveLength(0);
  });
});
