// KHÔNG CHẮC: spec chưa chạy (sandbox agent không mở được trình duyệt, không có node_modules) → chờ CI. Payload ProductSelectEvent có thể nằm trên event hoặc detail: spec đọc cả hai.
// Ticket ES1-T66 TE-4-BE1: assets/product-variant-picker.js (docs/srs.md#TE-4 AC2, AC4, AC12; drafts/techlead/ES1-T59/task-split.md D6, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... [TE4_SELLING_PLAN_HANDLE=...] npx playwright test tests/e2e/ES1-T66.spec.ts -g "AC2|AC12"
// Thiếu env → tests/e2e/store-data.json (ES1-T78: TE4_OPTIONS_HANDLE); vẫn thiếu → skip có lý do. Partial chỉ render khi store bật agentic editor (AGENTS.md).
// API theo ES1-T75: partials.fetch(...names, {url}) + apply; event shopify:product:select (ProductSelectEvent); product:view là <s-view-event> (ES1-T76), không thuộc spec này.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';

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
  // ES1-T78: cần sản phẩm 2 option có tổ hợp thiếu. TE4_OPTIONS_HANDLE trước, giữ TE4_VARIANTS_HANDLE cho env cũ; mọi env thắng store-data.json.
  variants: env('TE4_OPTIONS_HANDLE', 'TE4_VARIANTS_HANDLE'),
  sellingPlan: env('TE4_SELLING_PLAN_HANDLE'),
};

const ROOT = process.cwd();
const JS = readFileSync(join(ROOT, 'assets/product-variant-picker.js'), 'utf8');
// https://shopify.dev/docs/api/storefront-events-and-actions/events/product-select (ES1-T75)
const EVENT_SELECT = 'shopify:product:select';

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
type JsProduct = { id: number; handle: string; options: Array<{ name: string; position: number; values: string[] }>; variants: JsVariant[] };

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
  test.skip(!ENV.variants, 'Thiếu TE4_OPTIONS_HANDLE / TE4_VARIANTS_HANDLE (sản phẩm từ 2 option, có variant hết hàng và tổ hợp không tồn tại)');
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

  test('AC12 không còn override show variant: JS không gán Shopify.actions', () => {
    expect(JS).not.toMatch(/Shopify\.actions|showVariant|shopify:product:view/);
    // ES1-T81: không có import map → import thẳng URL CDN.
    expect(JS).toMatch(/import\(\s*"https:\/\/cdn\.shopify\.com\/storefront\/standard-events\.js"\s*\)/);
    expect(JS).not.toMatch(/["']@shopify\/standard-events["']/);
    expect(JS).toMatch(/partials\.fetch\(\.\.\.REGIONS,/);
  });
});
