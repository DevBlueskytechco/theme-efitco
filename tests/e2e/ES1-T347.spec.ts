// KHÔNG CHẮC: spec chưa chạy (sandbox agent không gọi mạng) → chờ CI. Tên partial `product-options`, `product-option-error`,
// `product-option-retry`, `product-option-more`, `script[data-selected-variant]` là ĐỀ XUẤT của spike (drafts/dev-be/ES1-T347/spike.md mục 4), chờ ES1-T414.
// Ticket ES1-T347 TE-4-R2-BE1 spike: đổi biến thể theo option value (docs/srs.md TE-4 AC15, AC16, NFR-7; docs/ui-spec/variant-picker.md §6).
// Spec viết theo đích sau khi FE/BE2 chuyển bộ chọn sang `?option_values=`. Trang hoặc JS còn JSON danh sách biến thể
// (`script[data-product-variants]`, snippets/variant-json.liquid) → test.fixme có lý do, CI không đỏ trước khi chuyển xong.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [TE4_OPTIONS_HANDLE=...] [TE4_MANY_VARIANTS_HANDLE=demo-many-variants] npx playwright test tests/e2e/ES1-T347.spec.ts
import { test, expect, type Locator, type Page, type Request } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { watchShopPay403 } from './support/console-guard';
import { gotoStore } from './support/store-guard';
import { CART } from './support/cart-api';

const T = {
  form: 'product-form',
  picker: 'product-variant-picker',
  option: 'product-option',
  optionValue: 'product-option-value',
  optionError: 'product-option-error',
  optionRetry: 'product-option-retry',
  optionMore: 'product-option-more',
  variantId: 'product-form-variant-id',
  add: 'product-form-add',
  price: 'product-price',
  regular: 'price-regular',
} as const;

const ENV = {
  // Sản phẩm ≥ 2 option, ≥ 3 giá trị ở option đầu (ES1-T78).
  options: env('TE4_OPTIONS_HANDLE', 'TE4_VARIANTS_HANDLE'),
  // D3 demo-data-b2b.md: 304 biến thể, Weight 40 giá trị × Pack × Color; 190 lb / Pair / Blue sau vị trí 250.
  many: env('TE4_MANY_VARIANTS_HANDLE') ?? 'demo-many-variants',
};
const AFTER_250 = { values: ['190 lb', 'Pair', 'Blue'], title: '190 lb / Pair / Blue' };

const ROOT = process.cwd();
const JS = readFileSync(join(ROOT, 'assets/product-variant-picker.js'), 'utf8');
const LEGACY_JS = JS.includes('data-product-variants');
const LEGACY_REASON = 'Chờ FE/BE2 chuyển bộ chọn sang ?option_values= (NFR-7, spike ES1-T347): còn JSON danh sách biến thể';

const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const NETWORK_LOG = /Failed to load resource/i;

const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const isOptionRequest = (url: URL | string) => new URL(String(url)).searchParams.has('option_values');

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    const text = msg.text();
    if (IGNORE_CONSOLE.some((r) => r.test(text) || r.test(msg.location().url))) return;
    // route.abort() trong test lỗi: log mạng của Chrome, không phải lỗi JS theme.
    if (NETWORK_LOG.test(text)) return;
    errors.push(text);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function openProduct(page: Page, handle: string | undefined, reason: string) {
  test.skip(!handle, reason);
  await gotoStore(page, `/products/${handle}`);
  test.skip((await tid(page, T.picker).count()) === 0, `${reason}: trang /products/${handle} không có bộ chọn (thiếu dữ liệu store dev)`);
  test.fixme((await page.locator('script[data-product-variants]').count()) > 0, LEGACY_REASON);
}

const radio = (value: Locator) => value.locator('input[type="radio"]');

// Giá trị chưa chọn ở fieldset `index`, ưu tiên còn hàng (data-state FE cấp; thiếu thì lấy mọi giá trị).
async function pickValues(page: Page, index: number, count: number): Promise<Locator[]> {
  const values = tid(page, T.option).nth(index).getByTestId(T.optionValue);
  const free: Locator[] = [];
  const rest: Locator[] = [];
  for (let i = 0; i < (await values.count()); i += 1) {
    const v = values.nth(i);
    if (!(await v.isVisible()) || (await radio(v).isChecked())) continue;
    ((await radio(v).getAttribute('data-state')) === 'available' ? free : rest).push(v);
  }
  return [...free, ...rest].slice(0, count);
}

async function valueName(value: Locator) {
  return ((await value.textContent()) ?? '').split(',')[0].trim();
}

async function selectedVariant(page: Page): Promise<{ id: number; options: string[] } | null> {
  return page.locator('script[data-selected-variant]').first().evaluate((s) => JSON.parse(s.textContent || 'null'));
}

async function settled(page: Page) {
  await expect(tid(page, T.form)).not.toHaveAttribute('aria-busy', 'true');
}

async function checkedOptionIds(page: Page) {
  return tid(page, T.picker).locator('input[type="radio"]:checked').evaluateAll((els) => els.map((e) => e.getAttribute('data-option-value-id')));
}

test.describe('ES1-T347 tĩnh', () => {
  test('JS ≤ 8 192 B, không console.*', () => {
    expect(Buffer.byteLength(JS)).toBeLessThanOrEqual(8192);
    expect(JS).not.toMatch(/console\./);
  });

  test('NFR-7: JS không dựa JSON danh sách biến thể, gửi option_values, huỷ request cũ', () => {
    test.fixme(LEGACY_JS, LEGACY_REASON);
    expect(JS).toContain('option_values');
    expect(JS).toContain('AbortController');
    expect(JS).toContain('partials.fetch');
    expect(JS).not.toMatch(/\/products\/[^'"`]*\.js|variants\.find/);
  });

  test('contract: mọi tên partial của picker có {% partial %}, gồm product-options', () => {
    test.fixme(LEGACY_JS, LEGACY_REASON);
    const m = JS.match(/const REGIONS = \[([^\]]*)\]/);
    expect(m, 'JS khai báo const REGIONS = [...]').not.toBeNull();
    const names = [...m![1].matchAll(/["']([\w-]+)["']/g)].map((x) => x[1]);
    expect(names).toContain('product-options');
    const liquid = ['blocks', 'snippets']
      .flatMap((d) => readdirSync(join(ROOT, d)).filter((f) => f.endsWith('.liquid')).map((f) => readFileSync(join(ROOT, d, f), 'utf8')))
      .join('\n');
    for (const n of names) expect(liquid, `{% partial '${n}' %}`).toMatch(new RegExp(`\\{%-?\\s*partial\\s+'${n}'`));
  });

  test('NFR-7: bộ chọn không render JSON biến thể, không noscript select lặp biến thể', () => {
    const picker = readFileSync(join(ROOT, 'snippets/product-variant-picker.liquid'), 'utf8');
    test.fixme(picker.includes("'variant-json'"), LEGACY_REASON);
    const form = readFileSync(join(ROOT, 'blocks/product-form.liquid'), 'utf8');
    expect(picker).not.toMatch(/for\s+variant\s+in\s+product\.variants/);
    expect(form).not.toContain("'product-variant-select'");
  });
});

test.describe('ES1-T347 AC15 đổi biến thể theo option value', () => {
  test('đang tải: chọn ngay, aria-busy, nút aria-disabled không spinner, bấm không thêm giỏ; xong: id + ?variant= replace', async ({ page }) => {
    const errors = watchConsole(page);
    await openProduct(page, ENV.options, 'Thiếu TE4_OPTIONS_HANDLE (sản phẩm ≥ 2 option)');
    const [value] = await pickValues(page, 0, 1);
    test.skip(!value, 'Option đầu chỉ có 1 giá trị');

    const oldId = await tid(page, T.variantId).inputValue();
    const historyLength = await page.evaluate(() => history.length);
    const adds: Request[] = [];
    page.on('request', (r) => r.url().includes(CART.add) && adds.push(r));
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    await page.route((u) => isOptionRequest(u), async (route) => {
      await gate;
      await route.continue();
    });

    await value.click();
    await expect(radio(value)).toBeChecked();
    await expect(tid(page, T.form)).toHaveAttribute('aria-busy', 'true');
    const add = tid(page, T.add);
    await expect(add).toHaveAttribute('aria-disabled', 'true');
    await expect(add).not.toHaveAttribute('aria-busy', 'true');
    await expect(add).toBeVisible();
    await add.click();
    await page.waitForTimeout(500);
    expect(adds, 'bấm Add To Cart lúc đang tải không gửi request thêm giỏ').toHaveLength(0);
    await expect(tid(page, T.variantId)).toHaveValue(oldId);

    release();
    await settled(page);
    await expect(add).not.toHaveAttribute('aria-disabled', 'true');
    const v = await selectedVariant(page);
    if (v) {
      await expect(tid(page, T.variantId)).toHaveValue(String(v.id));
      await expect.poll(() => new URL(page.url()).searchParams.get('variant')).toBe(String(v.id));
      expect(v.options).toContain(await valueName(value));
    }
    expect(await page.evaluate(() => history.length)).toBe(historyLength);
    expect(errors).toEqual([]);
  });

  test('bấm liên tiếp: chỉ kết quả lần bấm cuối được áp', async ({ page }) => {
    const errors = watchConsole(page);
    await openProduct(page, ENV.options, 'Thiếu TE4_OPTIONS_HANDLE (sản phẩm ≥ 2 option)');
    const [first, last] = await pickValues(page, 0, 2);
    test.skip(!last, 'Option đầu cần ≥ 3 giá trị');

    let n = 0;
    await page.route((u) => isOptionRequest(u), async (route) => {
      n += 1;
      // Request đầu về sau request cuối.
      if (n === 1) await new Promise((r) => setTimeout(r, 2000));
      await route.continue().catch(() => {});
    });

    await first.click();
    await last.click();
    await expect(radio(last)).toBeChecked();
    await settled(page);
    await page.waitForTimeout(2500);
    await expect(radio(last)).toBeChecked();
    const v = await selectedVariant(page);
    if (v) {
      expect(v.options).toContain(await valueName(last));
      await expect(tid(page, T.variantId)).toHaveValue(String(v.id));
    }
    expect(errors).toEqual([]);
  });

  test('lỗi tải: giữ biến thể cuối đã tải, role=alert + Try Again; thử lại thành công', async ({ page }) => {
    const errors = watchConsole(page);
    await openProduct(page, ENV.options, 'Thiếu TE4_OPTIONS_HANDLE (sản phẩm ≥ 2 option)');
    const [value] = await pickValues(page, 0, 1);
    test.skip(!value, 'Option đầu chỉ có 1 giá trị');

    const before = { ids: await checkedOptionIds(page), id: await tid(page, T.variantId).inputValue(), url: page.url() };
    const fail = (u: URL) => isOptionRequest(u);
    await page.route(fail, (route) => route.abort('failed'));

    await value.click();
    const fieldset = tid(page, T.option).first();
    const alert = tid(fieldset, T.optionError);
    await expect(alert).toHaveAttribute('role', 'alert');
    await expect(alert).not.toBeEmpty();
    const retry = tid(fieldset, T.optionRetry);
    await expect(retry).toBeVisible();
    await settled(page);
    expect(await checkedOptionIds(page)).toEqual(before.ids);
    await expect(tid(page, T.variantId)).toHaveValue(before.id);
    expect(page.url()).toBe(before.url);
    await expect(tid(page, T.add)).not.toHaveAttribute('aria-disabled', 'true');

    await page.unroute(fail);
    await retry.click();
    await settled(page);
    await expect(alert).toBeEmpty();
    await expect(radio(value)).toBeChecked();
    expect(errors).toEqual([]);
  });

  test('quickview: URL trang nền không đổi, chỉ View Detail đổi ?variant=', async () => {
    test.fixme(true, 'Chờ quickview TE-3 (AC10) và ES1-T414 #2 (partial trùng tên nhiều instance)');
  });
});

test.describe('ES1-T347 AC16 sản phẩm > 250 biến thể', () => {
  test('tổ hợp sau vị trí 250: giá, nút đúng; thêm giỏ đúng biến thể', async ({ page }) => {
    const errors = watchConsole(page);
    await openProduct(page, ENV.many, 'Thiếu dữ liệu D3 (TE4_MANY_VARIANTS_HANDLE, ES1-T282)');
    const html = await page.content();
    expect(html, 'không JSON danh sách biến thể').not.toContain('data-product-variants');
    await expect(page.locator(`#product-form-${await tid(page, T.form).getAttribute('data-product-id')}-variant`)).toHaveCount(0);

    const requests: string[] = [];
    page.on('request', (r) => isOptionRequest(r.url()) && requests.push(r.url()));
    const fieldsets = tid(page, T.option);
    for (const [i, name] of AFTER_250.values.entries()) {
      const fs = fieldsets.nth(i);
      const value = fs.getByTestId(T.optionValue).filter({ hasText: new RegExp(`^\\s*${name}(\\b|,)`) });
      if (!(await value.isVisible())) await tid(fs, T.optionMore).click();
      if (await radio(value).isChecked()) continue;
      await value.click();
      await settled(page);
    }
    expect(requests.length).toBeGreaterThan(0);
    expect(new URL(requests.at(-1)!).searchParams.get('option_values')!.split(',')).toEqual(await checkedOptionIds(page));

    const v = await selectedVariant(page);
    expect(v, 'server trả biến thể cho tổ hợp sau vị trí 250').not.toBeNull();
    expect(v!.options).toEqual(AFTER_250.values);
    await expect(tid(page, T.variantId)).toHaveValue(String(v!.id));
    const add = tid(page, T.add);
    await expect(add).toBeEnabled();
    const shown = await tid(page, T.price).getByTestId(T.regular).first().textContent();

    const added = page.waitForResponse((r) => r.url().includes(CART.add) && r.request().method() === 'POST');
    await add.click();
    expect((await added).ok()).toBe(true);
    const cart = await page.evaluate(async (path) => (await fetch(path, { headers: { Accept: 'application/json' } })).json(), CART.read);
    const line = (cart.items as Array<{ variant_id: number; variant_title: string; final_price: number }>).find((x) => x.variant_id === v!.id);
    expect(line, 'giỏ có đúng biến thể sau vị trí 250').toBeTruthy();
    expect(line!.variant_title).toBe(AFTER_250.title);
    // Store dev USD, dấu chấm thập phân (TE-4.spec cùng giả định).
    expect(Math.round(Number((shown ?? '').replace(/[^\d.]/g, '')) * 100)).toBe(line!.final_price);
    expect(errors).toEqual([]);
  });
});
