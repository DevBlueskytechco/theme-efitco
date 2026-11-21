// KHÔNG CHẮC: spec chưa chạy (sandbox agent không mở được trình duyệt) → chờ CI.
// Ticket ES1-T87 Bug TE-4 (CI #70): partial fetch lỗi/abort thì nút Add To Cart kẹt disabled.
// Nguyên nhân: selectOptions đi qua tổ hợp không tồn tại → unavailable() đặt disabled + "Unavailable"; fetch của variant cuối lỗi → catch giữ nguyên.
// Sửa: assets/product-variant-picker.js lưu nút add + tồn kho đã render (lúc load, sau mỗi apply); fetch/apply lỗi mà không do chính picker huỷ → khôi phục.
// ES1-T350 (ADR 0008): JS không còn tự đặt disabled/nhãn Unavailable (server trả qua partial); lúc tải chỉ aria-disabled, gỡ trong finally;
// lỗi thì radio về biến thể cuối đã tải, id gửi giỏ chỉ đổi sau khi apply thành công. Luồng store ở TE-4.spec TC-209..TC-211.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_OPTIONS_HANDLE=... npx playwright test tests/e2e/ES1-T87.spec.ts
import { test, expect, type Page, type Route } from './support/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { watchShopPay403 } from './support/console-guard';
import { chooseOptions } from './support/variant-picker';

const T = {
  form: 'product-form',
  picker: 'product-variant-picker',
  option: 'product-option',
  optionValue: 'product-option-value',
  variantId: 'product-form-variant-id',
  inventory: 'product-inventory',
  add: 'product-form-add',
  stickyAdd: 'product-sticky-bar-add',
} as const;

const HANDLE = env('TE4_OPTIONS_HANDLE', 'TE4_VARIANTS_HANDLE');
const JS = readFileSync(join(process.cwd(), 'assets/product-variant-picker.js'), 'utf8');
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
// route.abort(): Chrome tự log "Failed to load resource" (log mạng, không phải lỗi JS theme).
const NETWORK_LOG = /Failed to load resource/i;

type JsVariant = { id: number; available: boolean; options: string[] };
type JsProduct = { options: Array<{ name: string; values: string[] }>; variants: JsVariant[] };

const tid = (page: Page, id: string) => page.getByTestId(id);
const productPath = (handle: string) => `/products/${handle}`;

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isShopPay403(msg)) return;
    const text = msg.text();
    if (IGNORE_CONSOLE.some((r) => r.test(text) || r.test(msg.location().url)) || NETWORK_LOG.test(text)) return;
    errors.push(text);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function open(page: Page) {
  test.skip(!HANDLE, 'Thiếu TE4_OPTIONS_HANDLE / TE4_VARIANTS_HANDLE (sản phẩm từ 2 option, có tổ hợp không tồn tại)');
  await page.goto(productPath(HANDLE!));
  await expect(tid(page, T.picker)).toBeVisible();
  return page.evaluate(async (path) => {
    const res = await fetch(`${path}.js`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${path}.js trả ${res.status}`);
    return res.json();
  }, productPath(HANDLE!)) as Promise<JsProduct>;
}

// Request partial: fetch/xhr tới trang sản phẩm có ?option_values= (handle có dấu → so sau decode, ES1-T78).
async function onPartial(page: Page, handler: (route: Route) => Promise<void> | void) {
  const path = productPath(HANDLE!);
  await page.route(
    (url) => decodeURIComponent(url.pathname).endsWith(path) && url.searchParams.has('option_values'),
    (route) => (['fetch', 'xhr'].includes(route.request().resourceType()) ? handler(route) : route.continue())
  );
}

async function selectOptions(page: Page, options: string[]) {
  await chooseOptions(tid(page, T.picker), options);
}

async function settled(page: Page) {
  await expect(tid(page, T.form)).not.toHaveAttribute('aria-busy', 'true');
}

// Nút add (chính + sticky nếu có) và dòng tồn kho.
async function snapshot(page: Page) {
  const add = tid(page, T.add);
  const inventory = tid(page, T.inventory);
  const sticky = tid(page, T.stickyAdd);
  return {
    disabled: await add.isDisabled(),
    text: (await add.textContent())?.trim(),
    state: await inventory.getAttribute('data-state'),
    inventory: (await inventory.textContent())?.trim(),
    sticky: (await sticky.count()) ? { disabled: await sticky.isDisabled(), text: (await sticky.textContent())?.trim() } : null,
  };
}

function missingCombo(product: JsProduct) {
  const combos = product.options.reduce<string[][]>((acc, o) => acc.flatMap((c) => o.values.map((v) => [...c, v])), [[]]);
  return combos.find((c) => !product.variants.some((v) => v.options.every((o, i) => o === c[i])));
}

test.describe('ES1-T87 variant picker: partial fetch lỗi không kẹt nút', () => {
  test('tĩnh: lỗi không do tự huỷ thì về biến thể đã tải, gỡ aria-disabled trong finally, id chỉ đổi sau apply, ≤ 7168 B', () => {
    expect(Buffer.byteLength(JS)).toBeLessThanOrEqual(7168);
    // Không còn tự khoá nút: disabled + nhãn do Liquid trả trong partial.
    expect(JS).not.toMatch(/\.disabled\s*=[^=]/);
    expect(JS).toMatch(/catch\s*{\s*if \(c\.signal\.aborted\) return;[\s\S]*?this\.check\(this\.loaded\);/);
    expect(JS).toMatch(/finally\s*{[\s\S]*?if \(this\.controller == c\) this\.controller = this\.pending\(\);/);
    const apply = JS.indexOf('await partials.apply(');
    const id = JS.indexOf('this.form.elements.id.value = v.id');
    expect(apply).toBeGreaterThan(0);
    expect(id, 'id gửi giỏ chỉ đặt sau khi apply xong').toBeGreaterThan(apply);
    expect(JS).toMatch(/connectedCallback\(\) {[\s\S]*?this\.listen\("addEventListener"\);[\s\S]*?this\.loaded = /);
  });

});
