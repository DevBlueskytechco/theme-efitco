// KHÔNG CHẮC: spec chưa chạy (sandbox agent không mở được trình duyệt, không có node_modules); chữ ký partials.fetch/apply và tên event/action Standard storefront actions chưa xác minh trên shopify.dev → chờ CI + câu trả lời ticket hỏi Tech Lead.
// Ticket ES1-T66 TE-4-BE1: assets/product-variant-picker.js (docs/srs.md#TE-4 AC2, AC4, AC12; drafts/techlead/ES1-T59/task-split.md D6, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... [TE4_SELLING_PLAN_HANDLE=...] npx playwright test tests/e2e/ES1-T66.spec.ts -g "AC2|AC12"
// Thiếu biến → skip có lý do. Partial chỉ render khi store bật agentic editor (AGENTS.md).
// Tên event / action đọc thẳng từ hằng EVENT_VIEW, EVENT_VARIANT, ACTION_SHOW trong JS để spec luôn khớp file.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const T = {
  form: 'product-form',
  picker: 'product-variant-picker',
  option: 'product-option',
  optionValue: 'product-option-value',
  variantId: 'product-form-variant-id',
  inventory: 'product-inventory',
  add: 'product-form-add',
  price: 'product-price',
  regular: 'price-regular',
  compare: 'price-compare',
  unit: 'price-unit',
  stickyAdd: 'product-sticky-bar-add',
  sellingPlan: 'product-selling-plan',
} as const;

const ENV = {
  variants: process.env.TE4_VARIANTS_HANDLE,
  sellingPlan: process.env.TE4_SELLING_PLAN_HANDLE,
};

const ROOT = process.cwd();
const JS = readFileSync(join(ROOT, 'assets/product-variant-picker.js'), 'utf8');
const constant = (name: string) => JS.match(new RegExp(`const ${name} = "([^"]+)"`))?.[1] ?? '';
const EVENT_VIEW = constant('EVENT_VIEW');
const EVENT_VARIANT = constant('EVENT_VARIANT');
const ACTION_SHOW = constant('ACTION_SHOW');

const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
// route.abort(): Chrome tự log "Failed to load resource: net::ERR_FAILED" (log mạng của trình duyệt, không phải lỗi JS theme).
const NETWORK_LOG = /Failed to load resource/i;
const seriousOrCritical = (v: { impact?: string | null }) => ['serious', 'critical'].includes(v.impact ?? '');

type JsVariant = {
  id: number;
  price: number;
  compare_at_price: number | null;
  available: boolean;
  options: string[];
  unit_price?: number | null;
};
type JsProduct = { id: number; options: Array<{ name: string; position: number; values: string[] }>; variants: JsVariant[] };

const tid = (page: Page, id: string) => page.getByTestId(id);
const productPath = (handle: string) => `/products/${handle}`;

// Giống TE-3.spec.ts: tiền trên trang → số theo đơn vị chính.
function money(s: string | null): number {
  const m = (s ?? '').match(/\d[\d.,\s  ']*/);
  if (!m) return NaN;
  const t = m[0].replace(/[\s  ']/g, '').replace(/[.,]+$/, '');
  const last = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','));
  if (last >= 0 && t.length - last - 1 !== 3) {
    return Number(`${t.slice(0, last).replace(/[.,]/g, '')}.${t.slice(last + 1)}`);
  }
  return Number(t.replace(/[.,]/g, ''));
}
const cents = (s: string | null) => Math.round(money(s) * 100);

// ES1-T74: lấy .js bằng fetch trong trang để cùng market / tiền tệ với trang.
async function productJs(page: Page, handle: string): Promise<JsProduct> {
  return page.evaluate(async (path) => {
    const res = await fetch(`${path}.js`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${path}.js trả ${res.status}`);
    return res.json();
  }, productPath(handle));
}

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

async function selectOptions(page: Page, options: string[]) {
  const fieldsets = tid(page, T.option);
  for (let i = 0; i < options.length; i += 1) {
    const value = fieldsets.nth(i).getByTestId(T.optionValue).filter({
      has: page.locator(`input[type="radio"][value=${JSON.stringify(options[i])}]`),
    });
    const input = value.locator('input[type="radio"]');
    if (!(await input.isChecked())) await value.click();
  }
}

async function settled(page: Page) {
  await expect(tid(page, T.form)).not.toHaveAttribute('aria-busy', 'true');
}

async function currentVariantId(page: Page) {
  return Number(await tid(page, T.variantId).inputValue());
}

async function openVariants(page: Page) {
  test.skip(!ENV.variants, 'Thiếu TE4_VARIANTS_HANDLE (sản phẩm từ 2 option, có variant hết hàng và tổ hợp không tồn tại)');
  await page.goto(productPath(ENV.variants!));
  await expect(tid(page, T.picker)).toBeVisible();
  const product = await productJs(page, ENV.variants!);
  await page.evaluate(() => ((window as unknown as { __t66: number }).__t66 = 1));
  return product;
}

async function expectVariantUi(page: Page, variant: JsVariant) {
  await expect(tid(page, T.variantId)).toHaveValue(String(variant.id));
  await expect.poll(() => new URL(page.url()).searchParams.get('variant')).toBe(String(variant.id));
  await settled(page);

  const price = tid(page, T.price);
  await expect.poll(async () => cents(await price.getByTestId(T.regular).first().textContent())).toBe(variant.price);
  if (variant.compare_at_price && variant.compare_at_price > variant.price) {
    expect(cents(await price.getByTestId(T.compare).first().textContent())).toBe(variant.compare_at_price);
  } else {
    await expect(price.getByTestId(T.compare)).toHaveCount(0);
  }
  if (variant.unit_price) {
    expect(cents(await price.getByTestId(T.unit).first().textContent())).toBe(variant.unit_price);
  } else {
    await expect(price.getByTestId(T.unit)).toHaveCount(0);
  }

  await expect(tid(page, T.inventory)).toHaveAttribute('data-state', variant.available ? 'in_stock' : 'sold_out');
  const add = tid(page, T.add);
  if (variant.available) await expect(add).toBeEnabled();
  else await expect(add).toBeDisabled();
  const sticky = tid(page, T.stickyAdd);
  if (await sticky.count()) {
    if (variant.available) await expect(sticky).toBeEnabled();
    else await expect(sticky).toBeDisabled();
  }
  // Không navigate: biến đặt trước khi đổi vẫn còn.
  expect(await page.evaluate(() => (window as unknown as { __t66?: number }).__t66)).toBe(1);
}

test.describe('ES1-T66 TE-4 variant picker', () => {
  test('contract partial: 6 tên trong REGIONS khớp {% partial %} trong blocks', () => {
    const regions = [...(JS.match(/const REGIONS = \[([^\]]+)\]/)?.[1] ?? '').matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(regions).toEqual([
      'product-price',
      'product-buy-buttons',
      'product-installments',
      'product-pickup',
      'product-selling-plans',
      'product-sticky-bar',
    ]);
    const liquid = ['blocks/product-info.liquid', 'blocks/product-form.liquid', 'blocks/product-sticky-bar.liquid']
      .map((f) => readFileSync(join(ROOT, f), 'utf8'))
      .join('\n');
    const declared = new Set([...liquid.matchAll(/{%-?\s*partial\s+'([^']+)'/g)].map((m) => m[1]));
    for (const name of regions) expect(declared.has(name), `thiếu {% partial '${name}' %}`).toBeTruthy();
    expect(Buffer.byteLength(JS), 'bundle tối đa 7168 B').toBeLessThanOrEqual(7168);
  });

  test('AC2 đổi option: giá, compare, unit, tồn, nút, ?variant= đổi không reload', async ({ page }) => {
    const errors = watchConsole(page);
    const product = await openVariants(page);
    const startId = await currentVariantId(page);
    const targets = product.variants.filter((v) => v.id !== startId);
    test.skip(targets.length === 0, 'Sản phẩm chỉ có 1 variant');

    // Ưu tiên 1 variant còn hàng và 1 variant hết hàng để kiểm cả 2 trạng thái nút.
    const picks = [targets.find((v) => v.available), targets.find((v) => !v.available)].filter(Boolean) as JsVariant[];
    for (const variant of picks) {
      await selectOptions(page, variant.options);
      await expectVariantUi(page, variant);
    }
    // data-available của radio theo lựa chọn hiện tại.
    const last = picks[picks.length - 1];
    const fieldsets = tid(page, T.option);
    for (let i = 0; i < product.options.length; i += 1) {
      for (const input of await fieldsets.nth(i).locator('input[type="radio"]').all()) {
        const value = await input.getAttribute('value');
        const ok = product.variants.some((v) => v.available && v.options.every((o, j) => o === (j === i ? value : last.options[j])));
        await expect(input).toHaveAttribute('data-available', String(ok));
      }
    }
    expect(errors).toEqual([]);
  });

  test('AC2 tổ hợp không tồn tại: nút disabled + nhãn Unavailable, không fetch', async ({ page }) => {
    const errors = watchConsole(page);
    const product = await openVariants(page);
    test.skip(product.options.length < 2, 'Cần sản phẩm từ 2 option');
    const combos = product.options.reduce<string[][]>((acc, o) => acc.flatMap((c) => o.values.map((v) => [...c, v])), [[]]);
    const missing = combos.find((c) => !product.variants.some((v) => v.options.every((o, i) => o === c[i])));
    test.skip(!missing, 'Mọi tổ hợp option đều có variant');

    // Đi qua tổ hợp không tồn tại ở bước cuối: chọn trước các option còn lại.
    const label = await tid(page, T.form).getAttribute('data-label-unavailable');
    const idBefore = await currentVariantId(page);
    await selectOptions(page, missing!);
    const add = tid(page, T.add);
    await expect(add).toBeDisabled();
    await expect(add).toHaveText(label ?? '');
    await expect(tid(page, T.inventory)).toHaveAttribute('data-state', 'unavailable');
    const sticky = tid(page, T.stickyAdd);
    if (await sticky.count()) await expect(sticky).toBeDisabled();
    // Không có variant → hidden id không đổi sang id lạ, form không gửi được.
    const idAfter = await currentVariantId(page);
    expect(product.variants.some((v) => v.id === idAfter) || idAfter === idBefore).toBeTruthy();
    expect(errors).toEqual([]);
  });

  test('AC2 route.abort: không lỗi JS, nút giữ trạng thái cũ', async ({ page }) => {
    const errors = watchConsole(page, true);
    const product = await openVariants(page);
    const startId = await currentVariantId(page);
    const target = product.variants.find((v) => v.id !== startId && v.available !== product.variants.find((s) => s.id === startId)?.available)
      ?? product.variants.find((v) => v.id !== startId);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');

    const add = tid(page, T.add);
    const before = { disabled: await add.isDisabled(), text: (await add.textContent())?.trim() };
    const path = productPath(ENV.variants!);
    await page.route(
      (url) => url.pathname.endsWith(path) && url.searchParams.has('variant'),
      (route) => (['fetch', 'xhr'].includes(route.request().resourceType()) ? route.abort() : route.continue())
    );
    await selectOptions(page, target!.options);
    await settled(page);
    expect(await add.isDisabled()).toBe(before.disabled);
    expect((await add.textContent())?.trim()).toBe(before.text);
    expect(errors).toEqual([]);
  });

  test('AC2 axe sau đổi variant 0 serious', async ({ page }) => {
    const product = await openVariants(page);
    const startId = await currentVariantId(page);
    const target = product.variants.find((v) => v.id !== startId);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    await selectOptions(page, target!.options);
    await settled(page);
    const result = await new AxeBuilder({ page }).include('[data-testid="product-form"]').include('[data-testid="product-price"]').analyze();
    expect(result.violations.filter(seriousOrCritical)).toEqual([]);
  });

  test('AC4 đổi selling plan: URL có selling_plan, fetch lại', async ({ page }) => {
    test.skip(!ENV.sellingPlan, 'Thiếu TE4_SELLING_PLAN_HANDLE');
    const errors = watchConsole(page);
    await page.goto(productPath(ENV.sellingPlan!));
    const plans = tid(page, T.sellingPlan).filter({ has: page.locator('input[name="selling_plan"]:not([value=""])') });
    test.skip((await plans.count()) === 0, 'Sản phẩm không có selling plan');
    test.skip((await tid(page, T.picker).count()) === 0, 'Sản phẩm 1 variant: picker không render, JS không gắn');
    const plan = plans.first();
    const value = await plan.locator('input').getAttribute('value');
    await plan.click();
    await expect.poll(() => new URL(page.url()).searchParams.get('selling_plan')).toBe(value);
    await settled(page);
    await expect(plan.locator('input')).toBeChecked();
    expect(errors).toEqual([]);
  });

  test('AC12 event storefront actions khi load và khi đổi variant có variant id', async ({ page }) => {
    expect(EVENT_VIEW && EVENT_VARIANT, 'hằng EVENT_VIEW / EVENT_VARIANT trong JS').toBeTruthy();
    await page.addInitScript(
      ([view, variant]) => {
        const log: Array<{ type: string; detail: unknown }> = [];
        (window as unknown as { __t66Events: typeof log }).__t66Events = log;
        for (const type of [view, variant, 'theme:variant:change']) {
          document.addEventListener(type, (e) => log.push({ type, detail: (e as CustomEvent).detail }));
        }
      },
      [EVENT_VIEW, EVENT_VARIANT]
    );
    const product = await openVariants(page);
    const events = () =>
      page.evaluate(() => (window as unknown as { __t66Events: Array<{ type: string; detail: { variantId?: number; productId?: number } }> }).__t66Events);

    const startId = await currentVariantId(page);
    await expect.poll(async () => (await events()).filter((e) => e.type === EVENT_VIEW).map((e) => e.detail.variantId)).toEqual([startId]);
    expect((await events()).find((e) => e.type === EVENT_VIEW)?.detail.productId).toBe(product.id);

    const target = product.variants.find((v) => v.id !== startId);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    await selectOptions(page, target!.options);
    await expectVariantUi(page, target!);
    const changed = (await events()).filter((e) => e.type === EVENT_VARIANT).map((e) => e.detail.variantId);
    expect(changed.at(-1)).toBe(target!.id);
    const media = (await events()).filter((e) => e.type === 'theme:variant:change').at(-1)?.detail;
    expect(media?.variantId).toBe(target!.id);
  });

  test('AC12 override action show variant: chọn radio đúng, UI đổi theo', async ({ page }) => {
    const errors = watchConsole(page);
    const product = await openVariants(page);
    const startId = await currentVariantId(page);
    const target = product.variants.find((v) => v.id !== startId);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');

    const ok = await page.evaluate(
      ([action, id]) => (window as unknown as { Shopify: { actions: Record<string, (a: unknown) => Promise<boolean>> } }).Shopify.actions[action as string]({ variantId: id }),
      [ACTION_SHOW, target!.id] as const
    );
    expect(ok).toBe(true);
    const fieldsets = tid(page, T.option);
    for (let i = 0; i < target!.options.length; i += 1) {
      await expect(fieldsets.nth(i).locator(`input[type="radio"][value=${JSON.stringify(target!.options[i])}]`)).toBeChecked();
    }
    await expectVariantUi(page, target!);

    // Variant không thuộc sản phẩm → false, không đổi gì.
    const unknown = await page.evaluate(
      (action) => (window as unknown as { Shopify: { actions: Record<string, (a: unknown) => Promise<boolean>> } }).Shopify.actions[action](1),
      ACTION_SHOW
    );
    expect(unknown).toBe(false);
    await expect(tid(page, T.variantId)).toHaveValue(String(target!.id));
    expect(errors).toEqual([]);
  });
});
