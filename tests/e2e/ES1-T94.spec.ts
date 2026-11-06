// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T94.spec.ts.
// Ticket ES1-T94 TE-5-FE1: cart page (docs/srs.md#TE-5 AC1, AC3, AC4, AC5, AC6; drafts/techlead/ES1-T89/task-split.md D3, D4, D5, D6, D11, D12).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [TE5_SHOP_COUNTRY=...] npx playwright test tests/e2e/ES1-T94.spec.ts -g "AC1|AC3|AC4|AC5|AC6|nojs"
// Thiếu dữ liệu → skip có lý do. Automatic discount chưa có trên store dev (ES1-T91 #7) nên chỉ kiểm khi cart.js có discount.
import { test, expect, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { clickAndLoad, expectNotChallenged, expectStoreAllowed, gotoStore } from './support/store-guard';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { pageJson, productData, productDataNoScript, readCartJson, readCartNoScript, requireJson } from './support/product-data';
import { CART, cartApi } from './support/cart-api';

type CartItem = {
  key: string;
  quantity: number;
  final_price: number;
  original_price: number;
  final_line_price: number;
  selling_plan_allocation?: { selling_plan: { name: string } };
  unit_price_measurement?: unknown;
  line_level_discount_allocations: unknown[];
  product_has_only_default_variant: boolean;
};
type Cart = { item_count: number; total_price: number; note: string | null; currency: string; items: CartItem[]; cart_level_discount_applications: unknown[] };
type Product = { id: number; variants: { id: number; available: boolean; price: number; selling_plan_allocations?: { selling_plan_id: number }[] }[] };

const ENV = {
  product: env('TE4_VARIANTS_HANDLE', 'TE4_SINGLE_HANDLE'),
  sellingPlan: env('TE4_SELLING_PLAN_HANDLE'),
  unitPrice: env('TE4_UNIT_PRICE_HANDLE'),
  shopCountry: env('TE5_SHOP_COUNTRY'),
};

const tid = (page: Page, id: string) => page.getByTestId(id);
const digits = (text: string | null) => (text ?? '').replace(/\D/g, '');

// ES1-T100: đọc từ trang sản phẩm đã mở (support/product-data.ts), không gọi .js bằng page.request (store dev trả 429, PR #81).
const readCart = (page: Page) => readCartJson<Cart>(page);

async function postLine(page: Page, handle: string, product: Product, quantity: number, usePlan: boolean) {
  const variant = product.variants.find((v) => v.available && (!usePlan || v.selling_plan_allocations?.length));
  test.skip(!variant, `${handle} không có variant bán được`);
  const data: Record<string, unknown> = { id: variant!.id, quantity };
  if (usePlan) data.selling_plan = variant!.selling_plan_allocations![0].selling_plan_id;
  const res = await cartApi(page, CART.add, { data });
  expectStoreAllowed(res);
  expect(res.ok(), `${CART.add} trả ${res.status()}`).toBeTruthy();
  return variant!;
}

async function addToCart(page: Page, handle: string, quantity = 1, usePlan = false) {
  await gotoStore(page, `/products/${handle}`);
  // selling plan không có trong JSON nhúng variant-json
  const product: Product = usePlan
    ? requireJson(await pageJson<Product>(page, `/products/${handle}.js`), `/products/${handle}.js`)
    : await productData(page, handle);
  return postLine(page, handle, product, quantity, usePlan);
}

// ES1-T229: tắt JS thì Chromium tải cả ảnh lazy, domcontentloaded để không hết giờ vì ảnh (ES1-T224).
const gotoNoScript = (page: Page, path: string) => gotoStore(page, path, { waitUntil: 'domcontentloaded' });

async function addToCartNoScript(page: Page, handle: string) {
  await gotoNoScript(page, `/products/${handle}`);
  return postLine(page, handle, await productDataNoScript(page, handle), 1, false);
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

async function expectNoSeriousAxe(page: Page) {
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

test.describe('ES1-T94 TE-5 cart page', () => {
  test('AC1 dòng hàng có đủ trường, số tiền khớp /cart.js', async ({ page }) => {
    test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
    await addToCart(page, ENV.product!, 2);
    const cart = await readCart(page);
    const item = cart.items[0];
    await gotoStore(page, '/cart');

    const line = tid(page, 'cart-line').first();
    await expect(line).toHaveAttribute('data-line-key', item.key);
    await expect(line.getByTestId('cart-line-title')).toHaveAttribute('href', /\/products\//);
    await expect(line.getByTestId('cart-line-image')).toHaveCount(1);
    await expect(line.getByTestId('cart-line-quantity')).toHaveValue(String(item.quantity));
    await expect(line.getByTestId('cart-line-quantity')).toHaveAttribute('name', 'updates[]');
    await expect(line.getByTestId('cart-line-quantity')).toHaveAttribute('min', '0');
    await expect(line.getByTestId('cart-line-remove')).toHaveAttribute('href', /\/cart\/change/);
    await expect(line.getByTestId('cart-line-options')).toHaveCount(item.product_has_only_default_variant ? 0 : 1);
    expect(digits(await line.getByTestId('cart-line-price').textContent())).toBe(String(item.final_price));
    expect(digits(await line.getByTestId('cart-line-total').textContent())).toBe(String(item.final_line_price));
    expect(digits(await tid(page, 'cart-total').textContent())).toBe(String(cart.total_price));
    await expect(tid(page, 'cart-checkout')).toHaveAttribute('name', 'checkout');
    await expect(tid(page, 'cart-checkout')).toHaveAttribute('form', 'cart-form-page');
    await expect(line.getByTestId('cart-line-original-price')).toHaveCount(item.original_price === item.final_price ? 0 : 1);
    await expect(line.getByTestId('cart-line-discount')).toHaveCount(item.line_level_discount_allocations.length);
    await expect(tid(page, 'cart-discount')).toHaveCount(cart.cart_level_discount_applications.length);
    await expectNoSeriousAxe(page);
  });

  test('AC1 selling plan hiện tên gói', async ({ page }) => {
    test.skip(!ENV.sellingPlan, 'Thiếu TE4_SELLING_PLAN_HANDLE');
    await addToCart(page, ENV.sellingPlan!, 1, true);
    const cart = await readCart(page);
    await gotoStore(page, '/cart');
    await expect(tid(page, 'cart-line-selling-plan').first()).toHaveText(cart.items[0].selling_plan_allocation!.selling_plan.name);
  });

  test('AC1 unit price hiện khi variant có đơn giá', async ({ page }) => {
    test.skip(!ENV.unitPrice, 'Thiếu TE4_UNIT_PRICE_HANDLE');
    await addToCart(page, ENV.unitPrice!);
    const cart = await readCart(page);
    test.skip(!cart.items[0].unit_price_measurement, `${ENV.unitPrice} không có unit_price_measurement`);
    await gotoStore(page, '/cart');
    await expect(tid(page, 'cart-line-unit-price').first()).toBeVisible();
  });

  test('AC3 dưới ngưỡng: progress + còn thiếu; từ ngưỡng: thông báo đạt', async ({ page }) => {
    test.skip(!ENV.shopCountry, 'Thiếu TE5_SHOP_COUNTRY (ES1-T91 #7)');
    test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
    const cartUrl = `/cart?country=${ENV.shopCountry}`;
    const variant = await addToCart(page, ENV.product!);
    await gotoStore(page, cartUrl);

    const bar = tid(page, 'cart-free-shipping-progress');
    test.skip((await bar.count()) === 0, 'Preview không có ngưỡng freeship (settings_data) hoặc tiền khác shop');
    const max = Number(await bar.getAttribute('max'));
    test.skip(variant.price >= max, 'Giá sản phẩm test đã vượt ngưỡng');
    const belowText = await tid(page, 'cart-free-shipping-text').textContent();
    expect(Number(await bar.getAttribute('value'))).toBeLessThan(max);

    await cartApi(page, CART.update, { data: { updates: { [variant.id]: Math.ceil(max / variant.price) } } });
    await gotoStore(page, cartUrl);
    await expect(bar).toHaveAttribute('value', String(max));
    expect(await tid(page, 'cart-free-shipping-text').textContent()).not.toBe(belowText);
  });

  test('AC3 market khác tiền shop: không có thanh', async ({ page }) => {
    test.skip(!ENV.shopCountry, 'Thiếu TE5_SHOP_COUNTRY (ES1-T91 #7)');
    test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
    await addToCart(page, ENV.product!);
    await gotoStore(page, `/cart?country=${ENV.shopCountry}`);
    const shopCurrency = (await readCart(page)).currency;
    await gotoStore(page, '/cart?country=DE');
    const currency = (await readCart(page)).currency;
    test.skip(currency === shopCurrency, 'Store không có market khác tiền shop');
    await expect(tid(page, 'cart-free-shipping')).toHaveCount(0);
  });

  test('AC4 giỏ rỗng: thông báo + CTA, không tóm tắt, note, accelerated', async ({ page }) => {
    await gotoStore(page, '/cart');
    await expect(tid(page, 'cart-empty')).toBeVisible();
    await expect(tid(page, 'cart-empty-cta')).toHaveAttribute('href', /\/collections\/all/);
    await expect(tid(page, 'cart-lines')).toHaveCount(0);
    await expect(tid(page, 'cart-checkout')).toHaveCount(0);
    await expect(tid(page, 'cart-page-note')).toBeHidden();
    await expect(tid(page, 'cart-page-accelerated')).toBeHidden();
    await expect(page.locator('h1')).toHaveCount(1);
    await expectNoSeriousAxe(page);
  });

  test('AC5 hook cho BE: cart-items, live region, note gắn form ngoài partial', async ({ page }) => {
    test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
    await addToCart(page, ENV.product!);
    await gotoStore(page, '/cart');
    const items = tid(page, 'cart-items');
    await expect(items).toHaveAttribute('data-partials', 'cart-page cart-count');
    for (const attr of ['data-cart-change-url', 'data-cart-url', 'data-label-updated', 'data-label-removed', 'data-label-error', 'data-label-quantity-adjusted']) {
      await expect(items).toHaveAttribute(attr, /.+/);
    }
    await expect(tid(page, 'cart-items-status')).toHaveAttribute('role', 'status');
    await expect(tid(page, 'cart-items-error')).toHaveAttribute('role', 'alert');
    await expect(tid(page, 'cart-page-body')).toHaveAttribute('data-item-count', '1');
    await expect(tid(page, 'cart-page-note')).toHaveAttribute('name', 'note');
    await expect(tid(page, 'cart-page-note')).toHaveAttribute('form', 'cart-form-page');
    await expect(tid(page, 'cart-form')).toHaveAttribute('id', 'cart-form-page');
    await expect(tid(page, 'cart-form').getByTestId('cart-page-note')).toHaveCount(0);
  });

  test('AC6 setting cart_type và free_shipping_threshold trong schema', () => {
    const schema = JSON.parse(readFileSync(join(process.cwd(), 'config/settings_schema.json'), 'utf8')) as { settings?: { id?: string; default?: unknown }[] }[];
    const settings = schema.flatMap((group) => group.settings ?? []);
    expect(settings.find((s) => s.id === 'cart_type')?.default).toBe('drawer');
    expect(settings.find((s) => s.id === 'free_shipping_threshold')?.default).toBe(0);
  });

  test('CSS cart: 0 literal màu, chỉ logical properties', () => {
    const css = readFileSync(join(process.cwd(), 'assets/base.css'), 'utf8');
    // ES1-T217: mục kế sau cart là Image with text; toàn file do ES1-T217.spec.ts kiểm.
    const part = css.slice(css.indexOf('/** Cart (TE-5'), css.indexOf('/** Image with text (TE-7'));
    expect(part.length).toBeGreaterThan(0);
    expect(part.match(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi)).toBeNull();
    expect(part.match(/^\s*(left|right|top|bottom|width|height|(margin|padding)-(left|right|top|bottom))\s*:/gm)).toBeNull();
  });

  test.describe('nojs', () => {
    test('nojs đổi số lượng + Update, note lưu vào /cart.js', async ({ browser }) => {
      test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
      const { context, page } = await noJsPage(browser);
      await addToCartNoScript(page, ENV.product!);
      await gotoNoScript(page, '/cart');
      await tid(page, 'cart-line-quantity').first().fill('2');
      await tid(page, 'cart-page-note').fill('ES1-T94 note');
      await clickAndLoad(page, () => tid(page, 'cart-update').click());
      const cart = await readCartNoScript<Cart>(page);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.note).toBe('ES1-T94 note');
      await expect(tid(page, 'cart-page-note')).toHaveValue('ES1-T94 note');
      await context.close();
    });

    test('nojs Remove về trạng thái rỗng', async ({ browser }) => {
      test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
      const { context, page } = await noJsPage(browser);
      await addToCartNoScript(page, ENV.product!);
      await gotoNoScript(page, '/cart');
      await clickAndLoad(page, () => tid(page, 'cart-line-remove').first().click());
      await expect(tid(page, 'cart-empty')).toBeVisible();
      expect((await readCartNoScript<Cart>(page)).item_count).toBe(0);
      await context.close();
    });

    test('nojs Checkout chuyển sang checkout', async ({ browser }) => {
      test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
      const { context, page } = await noJsPage(browser);
      await addToCartNoScript(page, ENV.product!);
      await gotoNoScript(page, '/cart');
      await tid(page, 'cart-page-note').fill('ES1-T94 checkout note');
      await clickAndLoad(page, () => tid(page, 'cart-checkout').click());
      await page.waitForURL(/checkout/);
      expect((await readCartNoScript<Cart>(page)).note).toBe('ES1-T94 checkout note');
      await context.close();
    });
  });
});
