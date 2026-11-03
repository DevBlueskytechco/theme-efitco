// KHÔNG CHẮC: spec chưa chạy (không preview, không node_modules trong phiên viết); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T64.spec.ts.
// Ticket ES1-T64 TE-4-FE3: product form (docs/srs.md#TE-4 AC2 markup, AC3, AC4, AC6, AC9; drafts/techlead/ES1-T59/task-split.md D4, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... TE4_SINGLE_HANDLE=... TE4_SOLD_OUT_HANDLE=... TE4_DIGITAL_HANDLE=...
//   TE4_GIFT_CARD_HANDLE=... TE4_SELLING_PLAN_HANDLE=... TE4_PICKUP_HANDLE=... npx playwright test tests/e2e/ES1-T64.spec.ts -g "AC2-markup|AC4|AC6|AC9|nojs"
// Thiếu biến → skip có lý do. Partial chỉ render khi store bật agentic editor (AGENTS.md).
import { test, expect, type Page, type Browser } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const T = {
  form: 'product-form',
  picker: 'product-variant-picker',
  option: 'product-option',
  optionValue: 'product-option-value',
  variantId: 'product-form-variant-id',
  variantSelect: 'product-variant-select',
  quantity: 'product-quantity',
  sellingPlans: 'product-selling-plans',
  sellingPlan: 'product-selling-plan',
  giftToggle: 'product-gift-card-toggle',
  giftEmail: 'product-gift-card-email',
  giftName: 'product-gift-card-name',
  giftMessage: 'product-gift-card-message',
  giftSendOn: 'product-gift-card-send-on',
  inventory: 'product-inventory',
  add: 'product-form-add',
  paymentButton: 'product-payment-button',
  installments: 'product-installments',
  pickup: 'product-pickup',
  pickupDetails: 'product-pickup-details',
  status: 'product-form-status',
  error: 'product-form-error',
} as const;

const ENV = {
  variants: process.env.TE4_VARIANTS_HANDLE,
  single: process.env.TE4_SINGLE_HANDLE,
  soldOut: process.env.TE4_SOLD_OUT_HANDLE,
  digital: process.env.TE4_DIGITAL_HANDLE,
  giftCard: process.env.TE4_GIFT_CARD_HANDLE,
  sellingPlan: process.env.TE4_SELLING_PLAN_HANDLE,
  pickup: process.env.TE4_PICKUP_HANDLE,
};

const tid = (page: Page, id: string) => page.getByTestId(id);
const productPath = (handle: string, query = '') => `/products/${handle}${query}`;

type JsVariant = { id: number; available: boolean; options: string[]; requires_shipping: boolean };
type JsProduct = { id: number; options: Array<{ name: string; position: number }>; variants: JsVariant[]; requires_selling_plan?: boolean };
type CartJs = { items: Array<{ variant_id: number; quantity: number; properties: Record<string, string> | null }> };

async function productJs(page: Page, handle: string): Promise<JsProduct> {
  const res = await page.request.get(`/products/${handle}.js`);
  expect(res.ok(), `/products/${handle}.js trả ${res.status()}`).toBeTruthy();
  return (await res.json()) as JsProduct;
}

async function clearCart(page: Page) {
  await page.request.post('/cart/clear.js');
}

async function cartJs(page: Page): Promise<CartJs> {
  const res = await page.request.get('/cart.js');
  return (await res.json()) as CartJs;
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

test.describe('ES1-T64 TE-4 product form', () => {
  test('AC2-markup root product-form có data hook, live region rỗng, form id product-form-{id}', async ({ page }) => {
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE');
    await page.goto(productPath(ENV.variants!));
    const js = await productJs(page, ENV.variants!);
    const root = tid(page, T.form);
    await expect(root).toHaveCount(1);
    expect(await root.evaluate(el => el.tagName.toLowerCase())).toBe('product-form');
    await expect(root).toHaveAttribute('data-product-id', String(js.id));
    await expect(root).toHaveAttribute('data-product-url', /\/products\//);
    await expect(root).toHaveAttribute('data-cart-add-url', /\/cart\/add$/);
    await expect(root).toHaveAttribute('data-cart-url', /\/cart$/);
    await expect(root).toHaveAttribute('data-cart-type', /^(drawer|page)$/);
    for (const attr of ['data-label-add', 'data-label-sold-out', 'data-label-unavailable']) {
      await expect(root).toHaveAttribute(attr, /.+/);
    }
    await expect(page.locator(`form#product-form-${js.id}`)).toHaveCount(1);
    await expect(tid(page, T.status)).toHaveAttribute('role', 'status');
    await expect(tid(page, T.status)).toHaveAttribute('aria-live', 'polite');
    await expect(tid(page, T.status)).toHaveText('');
    await expect(tid(page, T.error)).toHaveAttribute('role', 'alert');
    await expect(tid(page, T.error)).toHaveText('');
  });

  test('AC2-markup first available: radio checked và hidden id = variant đầu còn hàng', async ({ page }) => {
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE');
    await page.goto(productPath(ENV.variants!));
    const js = await productJs(page, ENV.variants!);
    const first = js.variants.find(v => v.available) ?? js.variants[0];
    await expect(tid(page, T.variantId)).toHaveAttribute('value', String(first.id));
    await expect(tid(page, T.variantId)).toHaveAttribute('name', 'id');

    const picker = tid(page, T.picker);
    await expect(picker).toHaveCount(1);
    expect(await picker.evaluate(el => el.tagName.toLowerCase())).toBe('product-variant-picker');
    // Picker ngoài form: radio không bị submit
    expect(await picker.evaluate(el => el.closest('form') === null)).toBe(true);

    const options = tid(page, T.option);
    await expect(options).toHaveCount(js.options.length);
    for (const [i, value] of first.options.entries()) {
      const fieldset = options.nth(i);
      await expect(fieldset.locator('legend')).toHaveText(js.options[i].name);
      await expect(fieldset.locator(`input[type="radio"][name="option-${i + 1}"]:checked`)).toHaveAttribute('value', value);
    }
    for (const input of await tid(page, T.optionValue).locator('input[type="radio"]').all()) {
      await expect(input).toHaveAttribute('data-available', /^(true|false)$/);
    }
  });

  test('AC2-markup ?variant= variant thứ 2: radio và hidden id khớp', async ({ page }) => {
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE');
    const js = await productJs(page, ENV.variants!);
    test.skip(js.variants.length < 2, 'TE4_VARIANTS_HANDLE cần từ 2 variant');
    const second = js.variants[1];
    await page.goto(productPath(ENV.variants!, `?variant=${second.id}`));
    await expect(tid(page, T.variantId)).toHaveAttribute('value', String(second.id));
    const options = tid(page, T.option);
    for (const [i, value] of second.options.entries()) {
      await expect(options.nth(i).locator('input[type="radio"]:checked')).toHaveAttribute('value', value);
    }
    if (!second.available) {
      await expect(tid(page, T.add)).toBeDisabled();
      await expect(tid(page, T.inventory)).toHaveAttribute('data-state', 'sold_out');
    }
  });

  test('AC2-markup quantity: input number name quantity min 1 value 1 có label', async ({ page }) => {
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE');
    await page.goto(productPath(ENV.variants!));
    const qty = tid(page, T.quantity);
    await expect(qty).toHaveAttribute('type', 'number');
    await expect(qty).toHaveAttribute('name', 'quantity');
    await expect(qty).toHaveAttribute('min', '1');
    await expect(qty).toHaveValue('1');
    await expect(qty).toHaveAccessibleName('Quantity');
    expect(await qty.evaluate(el => el.closest('form')?.id ?? '')).toMatch(/^product-form-\d+$/);
  });

  test('AC2-markup touch target option, nút từ 24px; axe 0 serious', async ({ page }) => {
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE');
    await page.goto(productPath(ENV.variants!));
    const targets = [
      ...(await tid(page, T.optionValue).all()),
      tid(page, T.add),
      tid(page, T.quantity),
    ];
    for (const el of targets) {
      const box = await el.boundingBox();
      expect(box, 'phần tử phải hiện').not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(24);
      expect(box!.height).toBeGreaterThanOrEqual(24);
    }
    const r = await new AxeBuilder({ page }).include(`[data-testid="${T.form}"]`).analyze();
    const bad = r.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''));
    expect(bad.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });

  test('AC4 payment_button bật mặc định, ngoài partial; installments có payment_terms', async ({ page }) => {
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE');
    await page.goto(productPath(ENV.variants!));
    const pay = tid(page, T.paymentButton);
    await expect(pay).toHaveCount(1);
    expect(await pay.evaluate(el => el.closest('form')?.id ?? '')).toMatch(/^product-form-\d+$/);
    await expect(tid(page, T.installments)).toHaveCount(1);
    // Không CSS theme đè màu nút Shopify
    expect(await pay.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  });

  test('AC4 selling plan: radio name selling_plan, có One-time purchase trừ khi requires_selling_plan', async ({ page }) => {
    test.skip(!ENV.sellingPlan, 'thiếu TE4_SELLING_PLAN_HANDLE');
    await page.goto(productPath(ENV.sellingPlan!));
    const js = await productJs(page, ENV.sellingPlan!);
    const group = tid(page, T.sellingPlans);
    await expect(group).toHaveCount(1);
    const radios = tid(page, T.sellingPlan).locator('input[type="radio"][name="selling_plan"]');
    expect(await radios.count()).toBeGreaterThan(0);
    await expect(group.locator('input[name="selling_plan"]:checked')).toHaveCount(1);
    const oneTime = group.locator('input[name="selling_plan"][value=""]');
    await expect(oneTime).toHaveCount(js.requires_selling_plan ? 0 : 1);
    for (const label of await tid(page, T.sellingPlan).all()) await expect(label).toContainText(/\d/);
  });

  test('AC4 pickup: có location pick_up_enabled → product-pickup', async ({ page }) => {
    test.skip(!ENV.pickup, 'thiếu TE4_PICKUP_HANDLE');
    await page.goto(productPath(ENV.pickup!));
    await expect(tid(page, T.pickup)).toHaveCount(1);
    await expect(tid(page, T.pickup)).toContainText(/Pickup/);
    const details = tid(page, T.pickupDetails);
    if (await details.count()) {
      expect(await details.evaluate(el => el.tagName.toLowerCase())).toBe('details');
      await details.locator('summary').click();
      await expect(details.locator('li').first()).toBeVisible();
    }
  });

  test('AC6 gift card: 4 field ẩn tới khi tick, đúng name và ràng buộc', async ({ page }) => {
    test.skip(!ENV.giftCard, 'thiếu TE4_GIFT_CARD_HANDLE');
    await page.goto(productPath(ENV.giftCard!));
    const toggle = tid(page, T.giftToggle);
    await expect(toggle).toHaveAttribute('name', 'properties[__shopify_send_gift_card_to_customer]');
    await expect(tid(page, T.giftEmail)).toBeHidden();
    await toggle.check();
    await expect(tid(page, T.giftEmail)).toBeVisible();
    await expect(tid(page, T.giftEmail)).toHaveAttribute('type', 'email');
    await expect(tid(page, T.giftEmail)).toHaveAttribute('name', 'properties[Recipient email]');
    await expect(tid(page, T.giftName)).toHaveAttribute('name', 'properties[Recipient name]');
    await expect(tid(page, T.giftMessage)).toHaveAttribute('name', 'properties[Message]');
    await expect(tid(page, T.giftMessage)).toHaveAttribute('maxlength', '200');
    const sendOn = tid(page, T.giftSendOn);
    await expect(sendOn).toHaveAttribute('type', 'date');
    await expect(sendOn).toHaveAttribute('name', 'properties[Send on]');
    const min = (await sendOn.getAttribute('min'))!;
    const max = (await sendOn.getAttribute('max'))!;
    const days = (Date.parse(max) - Date.parse(min)) / 86_400_000;
    expect(days).toBe(90);
    for (const id of [T.giftEmail, T.giftName, T.giftMessage, T.giftSendOn]) {
      await expect(tid(page, id)).toHaveAccessibleName(/.+/);
    }
  });

  test('AC9 1 variant: không có product-variant-picker, không noscript select', async ({ browser }) => {
    test.skip(!ENV.single, 'thiếu TE4_SINGLE_HANDLE');
    const { context, page } = await noJsPage(browser);
    await page.goto(productPath(ENV.single!));
    await expect(tid(page, T.picker)).toHaveCount(0);
    await expect(tid(page, T.variantSelect)).toHaveCount(0);
    await expect(tid(page, T.variantId)).toHaveCount(1);
    await context.close();
  });

  test('AC9 sản phẩm không vận chuyển: không có product-pickup', async ({ page }) => {
    test.skip(!ENV.digital, 'thiếu TE4_DIGITAL_HANDLE');
    await page.goto(productPath(ENV.digital!));
    await expect(tid(page, T.form)).toHaveCount(1);
    await expect(tid(page, T.pickup)).toHaveCount(0);
  });

  test('AC2-markup hết hàng: nút disabled, nhãn Sold out, tồn sold_out', async ({ page }) => {
    test.skip(!ENV.soldOut, 'thiếu TE4_SOLD_OUT_HANDLE');
    await page.goto(productPath(ENV.soldOut!));
    await expect(tid(page, T.add)).toBeDisabled();
    await expect(tid(page, T.add)).toHaveText('Sold out');
    await expect(tid(page, T.inventory)).toHaveAttribute('data-state', 'sold_out');
    await expect(tid(page, T.inventory)).toHaveText('Sold out');
  });

  test('nojs chọn variant thứ 2 trong select rồi submit → /cart.js đúng variant', async ({ browser }) => {
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE');
    const { context, page } = await noJsPage(browser);
    await clearCart(page);
    const js = await productJs(page, ENV.variants!);
    const target = js.variants.filter(v => v.available)[1];
    test.skip(!target, 'TE4_VARIANTS_HANDLE cần từ 2 variant còn hàng');
    await page.goto(productPath(ENV.variants!));
    await expect(tid(page, T.picker)).toBeHidden();
    const select = tid(page, T.variantSelect);
    await expect(select).toBeVisible();
    await expect(select).toHaveAttribute('name', 'id');
    for (const v of js.variants.filter(v => !v.available)) {
      await expect(select.locator(`option[value="${v.id}"]`)).toBeDisabled();
    }
    await select.selectOption(String(target.id));
    await tid(page, T.add).click();
    await page.waitForURL(/\/cart/);
    const cart = await cartJs(page);
    expect(cart.items.map(i => i.variant_id)).toEqual([target.id]);
    await clearCart(page);
    await context.close();
  });

  test('nojs gift card submit có 4 properties', async ({ browser }) => {
    test.skip(!ENV.giftCard, 'thiếu TE4_GIFT_CARD_HANDLE');
    const { context, page } = await noJsPage(browser);
    await clearCart(page);
    await page.goto(productPath(ENV.giftCard!));
    await tid(page, T.giftToggle).check();
    await tid(page, T.giftEmail).fill('recipient@example.com');
    await tid(page, T.giftName).fill('Recipient Test');
    await tid(page, T.giftMessage).fill('Happy birthday');
    const sendOn = (await tid(page, T.giftSendOn).getAttribute('min'))!;
    await tid(page, T.giftSendOn).fill(sendOn);
    await tid(page, T.add).click();
    await page.waitForURL(/\/cart/);
    const cart = await cartJs(page);
    const props = cart.items[0]?.properties ?? {};
    expect(props['Recipient email']).toBe('recipient@example.com');
    expect(props['Recipient name']).toBe('Recipient Test');
    expect(props['Message']).toBe('Happy birthday');
    expect(props['Send on']).toBeTruthy();
    await clearCart(page);
    await context.close();
  });

  test('nojs hết hàng: nút disabled', async ({ browser }) => {
    test.skip(!ENV.soldOut, 'thiếu TE4_SOLD_OUT_HANDLE');
    const { context, page } = await noJsPage(browser);
    await page.goto(productPath(ENV.soldOut!));
    await expect(tid(page, T.add)).toBeDisabled();
    await context.close();
  });
});
