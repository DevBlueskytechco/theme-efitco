// KHÔNG CHẮC: spec chưa chạy trên preview trong phiên viết (không có PREVIEW_URL, STORE_PASSWORD) → kết quả thật chờ CI store-tests của PR, chưa báo đạt.
// Ticket ES1-T99 TE-5-QA1 (viết lại theo drafts/techlead/ES1-T307/task-split.md §3): nghiệm thu cart drawer + cart page, docs/srs.md#TE-5 AC1–AC10
// và thanh checkout dưới 64rem (AC17). Test case: drafts/qa/ES1-T99/test-cases.md; tên test bắt đầu "AC<n> TC-<id>" (biên: "B-<id>"), nhóm không JS có chữ "nojs".
// Gộp (ticket: 1 file): hành vi nghiệm thu của spec dev ES1-T94 (cart page, nojs), ES1-T95 (markup drawer), ES1-T96 (mở drawer, cart_type), ES1-T97 (đổi/xoá, lỗi),
// ES1-T98 (Shopify.actions, event). Contract byte/hook, đo khung AC15 và JS trên origin giả giữ ở ES1-T95/T96/T97/T98, ES1-T369, ES1-T370 (không chép lại).
// Chưa xoá T94..T98: ES1-T203 TC-01/TC-02/TC-14 đọc nguồn T96..T98 (chờ Tech Lead).
// 3 cách dựng dữ liệu:
// - mockTest (support/cart-mock.ts): trang + JS thật, Cart API và partial giả trong bộ nhớ, 0 request Cart API tới store. Lỗi 422, 200 giảm số, route.abort, event, bàn phím.
// - test (thật): giỏ seed bằng 1 request CART.add items[] (support/cart-api.ts thử lại 429), HTML Liquid thật; số tiền so với /cart.js lấy bằng fetch trong trang (ES1-T74).
// - tĩnh: đọc file theme, chạy 1 lần ở project desktop.
// AC9 kiểm mockup: quy tắc Min/Increments/Max gắn vào dòng Liquid thật đúng hook snippets/cart-lines.liquid (store dev chưa có B2B, ES1-T298 D1, ES1-T297 #1).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [EXPECT_CART_TYPE=page] [EXPECT_ORDER_NOTE=off] npx playwright test tests/e2e/TE-5.spec.ts [-g "AC2 |nojs"]
// Dữ liệu (env thắng tests/e2e/store-data.json): TE4_VARIANTS_HANDLE | TE4_SINGLE_HANDLE, TE4_UNIT_PRICE_HANDLE, TE4_SELLING_PLAN_HANDLE, TE4_TAX_INCLUDED_COUNTRY,
// TE12_DISCOUNT_READY (collection te12-bundle), TE5_QUANTITY_RULE_HANDLE, TE5_VOLUME_HANDLE, TE5_VOLUME_QUANTITY. Thiếu → skip có lý do (bảng dữ liệu trong test-cases.md).
import { test as base, expect, type Browser, type Locator, type Page } from './support/test';
import { test as mockTest, type AjaxCart, type MockCart } from './support/cart-mock';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { pageJson, readCartJson, readCartNoScript, requireJson } from './support/product-data';
import { CART, cartApi } from './support/cart-api';
import { lineKeys } from './support/cart-seed';
import { newStoreContext } from './support/store-noise';
import { clickAndLoad, expectNotChallenged, expectStoreAllowed, gotoStore, watchStore } from './support/store-guard';

type Allocation = { amount: number; discount_application: { title: string } };
type Item = {
  key: string;
  variant_id: number;
  quantity: number;
  product_title: string;
  final_price: number;
  original_price: number;
  final_line_price: number;
  product_has_only_default_variant: boolean;
  options_with_values: { name: string; value: string }[];
  unit_price_measurement?: unknown;
  line_level_discount_allocations: Allocation[];
  selling_plan_allocation?: { price: number; selling_plan: { name: string } };
};
type Cart = {
  item_count: number;
  total_price: number;
  items_subtotal_price: number;
  note: string | null;
  currency: string;
  items: Item[];
  cart_level_discount_applications: { title: string }[];
};
type Line = { id: number; quantity: number; selling_plan?: number; properties?: Record<string, string> };
type Rule = { min: number; step: number; max: number };
type LineEvent = { action?: string; context?: string; target?: string; lines?: { id?: string; quantity?: number }[]; beforeChange?: boolean; settled?: boolean; hasCart?: boolean; userErrors?: { message: string }[]; rejected?: string };
type Surface = { name: 'drawer' | 'cart page'; context: 'dialog' | 'cart'; path: '/' | '/cart' };

const ROOT = process.cwd();
const DATA = {
  product: env('TE4_VARIANTS_HANDLE', 'TE4_SINGLE_HANDLE'),
  unitPrice: env('TE4_UNIT_PRICE_HANDLE'),
  sellingPlan: env('TE4_SELLING_PLAN_HANDLE'),
  taxCountry: env('TE4_TAX_INCLUDED_COUNTRY'),
  discountReady: env('TE12_DISCOUNT_READY') === 'true',
  quantityRule: env('TE5_QUANTITY_RULE_HANDLE'),
  volume: env('TE5_VOLUME_HANDLE'),
  volumeQuantity: Number(env('TE5_VOLUME_QUANTITY') ?? '10'),
};
const PAGE_MODE = process.env.EXPECT_CART_TYPE === 'page';
const NOTE_OFF = process.env.EXPECT_ORDER_NOTE === 'off';
const CDN = 'https://cdn.shopify.com/storefront/standard-events.js';
const EVENT = 'shopify:cart:lines-update';
const MOCK_422 = 'ES1-T99 mock: only 1 item available.';
const NO_PRODUCT = 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE';
const NO_DRAWER = 'Preview đặt cart_type page (EXPECT_CART_TYPE=page): không có drawer';
// docs/srs.md#TE-5 + locales/en.default.json.
const TEXT = {
  title: 'Cart',
  added: 'Added to cart',
  empty: 'Your Cart Is Empty',
  continueShopping: 'Continue Shopping',
  browse: 'Browse collections',
  bestsellers: 'Shop Bestsellers',
  noteToggle: 'Add order note',
  noteLabel: 'Order note',
  summary: 'Order Summary',
  sticky: 'Cart total and checkout',
  reached: 'Free shipping unlocked.',
  remaining: /^Spend .+ more to unlock free shipping$/,
  taxIncluded: /^Taxes( and duties)? included\.$/,
  taxAny: /^(Taxes included\.|Taxes and duties included\.|Duties included\. Taxes calculated at checkout\.|Taxes and shipping calculated at checkout\.)$/,
  volume: 'Volume pricing applied',
};

const SURFACES: Surface[] = [
  { name: 'drawer', context: 'dialog', path: '/' },
  { name: 'cart page', context: 'cart', path: '/cart' },
];

// ---------- chung ----------

const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');
const tid = (page: Page, id: string) => page.getByTestId(id);
const dialog = (page: Page) => tid(page, 'cart-drawer-dialog');
const lineOf = (page: Page, key: string) => page.locator(`[data-line-key="${key}"]`);
const quantityOf = (page: Page, key: string) => lineOf(page, key).getByTestId('cart-line-quantity');
const isCart = (url: URL) => /\/cart\/?$/.test(url.pathname);
const isDesktop = () => base.info().project.name === 'desktop';
const idle = (page: Page) => expect(tid(page, 'cart-items')).not.toHaveAttribute('aria-busy', /.*/);
const enhanced = (page: Page) => expect(tid(page, 'cart-items')).toHaveAttribute('data-enhanced', '', { timeout: 15_000 });
const label = (page: Page, name: string) => tid(page, 'cart-items').getAttribute(`data-label-${name}`);
const markStay = (page: Page) => page.evaluate(() => ((window as unknown as { __te5Stay: number }).__te5Stay = 1));
const stayed = (page: Page) => page.evaluate(() => (window as unknown as { __te5Stay?: number }).__te5Stay === 1);

// Tiền trên trang → cents (chép TE-3.spec.ts): dấu cuối có đúng 3 chữ số sau là hàng nghìn (VND), ngược lại là thập phân.
function cents(text: string | null): number {
  const m = (text ?? '').match(/\d[\d.,\s  ']*/);
  if (!m) return NaN;
  const t = m[0].replace(/[\s  ']/g, '').replace(/[.,]+$/, '');
  const last = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','));
  const value = last >= 0 && t.length - last - 1 !== 3 ? Number(`${t.slice(0, last).replace(/[.,]/g, '')}.${t.slice(last + 1)}`) : Number(t.replace(/[.,]/g, ''));
  return Math.round(value * 100);
}
const centsOf = async (locator: Locator) => cents(await locator.textContent());

async function expectNoSeriousAxe(page: Page, include?: string) {
  await expectNotChallenged(page);
  const builder = new AxeBuilder({ page });
  if (include) builder.include(include);
  const { violations } = await builder.analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

// a nằm trước b trong DOM.
async function precedes(a: Locator, b: Locator) {
  const other = await b.elementHandle();
  return a.evaluate((x, y) => !!y && !!(x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING), other);
}

// ---------- luồng thật ----------

// Fixture riêng cho luồng thật: console error, pageerror, Cloudflare do store-guard báo (B-09). Không mock Cart API.
const test = base.extend<{ guard: { allowNetworkLog: () => void } }>({
  guard: [
    async ({ page }, use, info) => {
      const watch = watchStore(page);
      await use({ allowNetworkLog: watch.allowNetworkLog });
      if (info.status !== 'skipped') await watch.finish();
    },
    { auto: true },
  ],
});

const readCart = (page: Page) => readCartJson<Cart>(page);

// Variant id từ input id của product form (không đọc JSON biến thể: AC13 TE-4). Chạy được cả khi tắt JS.
async function pdpVariant(page: Page, handle: string, noScript = false): Promise<number> {
  await gotoStore(page, `/products/${handle}`, noScript ? { waitUntil: 'domcontentloaded' } : {});
  const add = tid(page, 'product-form-add');
  await expect(add, `${handle}: thiếu product-form-add`).toHaveCount(1);
  test.skip(await add.isDisabled(), `${handle}: variant mặc định hết hàng`);
  return Number(await tid(page, 'product-form-variant-id').inputValue());
}

// 1 request CART.add cho mọi dòng. Page dùng chung cookie giỏ với trang.
async function seed(page: Page, lines: Line[]) {
  const res = await cartApi(page, CART.add, { data: { items: lines } });
  expectStoreAllowed(res);
  expect(res.ok(), `${CART.add} trả ${res.status()}: ${(await res.text()).slice(0, 200)}`).toBeTruthy();
}

// Mỗi phần tử là 1 dòng riêng nhờ property ẩn (_ không hiện, AC12).
async function seedProduct(page: Page, quantities = [1], noScript = false): Promise<number> {
  test.skip(!DATA.product, NO_PRODUCT);
  const id = await pdpVariant(page, DATA.product!, noScript);
  await seed(page, quantities.map((quantity, i) => ({ id, quantity, properties: { _te5: String(i) } })));
  return id;
}

async function openDrawer(page: Page) {
  test.skip(PAGE_MODE, NO_DRAWER);
  await page.waitForFunction(() => ['cart-drawer', 'modal-dialog'].every((n) => !!customElements.get(n)));
  await tid(page, 'header-cart-link').click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).not.toHaveAttribute('aria-busy', /.*/);
}

// Mở bề mặt giỏ của luồng thật, chờ cart-items.js.
async function openSurface(page: Page, surface: Surface) {
  if (surface.name === 'drawer') test.skip(PAGE_MODE, NO_DRAWER);
  await gotoStore(page, surface.path);
  if (surface.name === 'drawer') await openDrawer(page);
  await enhanced(page);
}

async function actionsReady(page: Page) {
  await expect(tid(page, 'cart-drawer'), 'Shopify.actions chưa configure (data-actions)').toHaveAttribute('data-actions', '', { timeout: 15_000 });
  await markStay(page);
}

// AC1/AC5/AC12: trường của 1 dòng so với /cart.js.
async function expectLine(scope: Locator, item: Item) {
  const line = scope.locator(`[data-line-key="${item.key}"]`);
  await expect(line).toHaveCount(1);
  const title = line.getByTestId('cart-line-title');
  await expect(title).toHaveAttribute('href', /\/products\//);
  await expect(title).toHaveText(item.product_title);
  await expect(line.getByTestId('cart-line-image')).toHaveCount(1);
  const options = line.getByTestId('cart-line-options');
  if (item.product_has_only_default_variant) await expect(options).toHaveCount(0);
  else for (const option of item.options_with_values) await expect(options).toContainText(option.value);
  expect(await centsOf(line.getByTestId('cart-line-price')), 'giá đơn vị = final_price').toBe(item.final_price);
  await expect(line.getByTestId('cart-line-original-price')).toHaveCount(item.original_price !== item.final_price ? 1 : 0);
  await expect(line.getByTestId('cart-line-quantity')).toHaveValue(String(item.quantity));
  expect(await centsOf(line.getByTestId('cart-line-total')), 'thành tiền = final_line_price').toBe(item.final_line_price);
  await expect(line.getByTestId('cart-line-discount')).toHaveCount(item.line_level_discount_allocations.length);
}

// ES1-T229: tắt JS thì Chromium tải cả ảnh lazy → domcontentloaded.
const gotoNoScript = (page: Page, path: string) => gotoStore(page, path, { waitUntil: 'domcontentloaded' });

async function noJsPage(browser: Browser, viewport?: { width: number; height: number }) {
  const use = base.info().project.use;
  const context = await newStoreContext(browser, {
    javaScriptEnabled: false,
    storageState: 'tests/setup/state.json',
    baseURL: use.baseURL,
    ...((viewport ?? use.viewport) ? { viewport: viewport ?? use.viewport } : {}),
    ...(use.userAgent ? { userAgent: use.userAgent } : {}),
    ...(use.isMobile !== undefined ? { isMobile: use.isMobile, hasTouch: use.hasTouch } : {}),
  });
  const page = await context.newPage();
  return { context, page, watch: watchStore(page) };
}

// AC9 mockup: gắn quy tắc lên dòng Liquid thật đúng hook snippets/cart-lines.liquid (input step/max, data-quantity-*, dòng quy tắc, câu lỗi, − aria-disabled ở min).
async function injectRule(line: Locator, rule: Rule) {
  await line.evaluate((li, r) => {
    const input = li.querySelector('[name="updates[]"]') as HTMLInputElement;
    const p = document.createElement('p');
    p.id = `${input.id}-rule`;
    p.className = 'cart-line__rule';
    p.dataset.testid = 'cart-line-quantity-rule';
    p.innerHTML = `<span>Min ${r.min}</span><span>Max ${r.max}</span><span>Increments of ${r.step}</span>`;
    li.querySelector('.cart-line__details')!.append(p);
    input.step = String(r.step);
    input.max = String(r.max);
    input.setAttribute('aria-describedby', p.id);
    Object.assign(input.dataset, { quantityRule: '', quantityMin: String(r.min), quantityMax: String(r.max), quantityStep: String(r.step) });
    if (+input.value <= r.min) li.querySelector('[data-cart-step="-1"]')!.setAttribute('aria-disabled', 'true');
    li.querySelector('[data-cart-line-error-text]')!.textContent = `Enter a multiple of ${r.step} between ${r.min} and ${r.max}.`;
  }, rule);
}

// ---------- mock ----------

async function mockOpenPage(page: Page, cart: MockCart) {
  await cart.goto('/cart');
  await enhanced(page);
  await markStay(page);
}

async function mockOpenDrawer(page: Page, cart: MockCart) {
  test.skip(PAGE_MODE, NO_DRAWER);
  await cart.goto('/');
  await page.waitForFunction(() => ['cart-drawer', 'modal-dialog'].every((n) => !!customElements.get(n)));
  await tid(page, 'header-cart-link').click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).not.toHaveAttribute('aria-busy', /.*/);
  await enhanced(page);
  await markStay(page);
  // Refresh lúc mở drawer không tính vào phần test đếm.
  cart.calls.partial.length = 0;
}

const mockOpen = (surface: Surface, page: Page, cart: MockCart) => (surface.name === 'drawer' ? mockOpenDrawer(page, cart) : mockOpenPage(page, cart));

// fill không phát change với input number tới khi blur: phát tay để focus nằm yên trong ô.
async function setQuantity(page: Page, key: string, value: string) {
  const input = quantityOf(page, key);
  await input.fill(value);
  await input.evaluate((el) => el.dispatchEvent(new Event('change', { bubbles: true })));
}

async function changeAndWait(page: Page, key: string, value: string) {
  const response = page.waitForResponse((r) => r.url().includes(CART.change));
  await setQuantity(page, key, value);
  await response;
  await idle(page);
}

async function mockPdp(page: Page, cart: MockCart, elements = ['product-form', 'cart-drawer', 'modal-dialog']) {
  test.skip(!DATA.product, NO_PRODUCT);
  await cart.goto(`/products/${DATA.product}`);
  await page.waitForFunction((names) => names.every((n) => !!customElements.get(n)), elements);
  const add = tid(page, 'product-form-add');
  test.skip(await add.isDisabled(), 'Variant mặc định hết hàng');
  await markStay(page);
  return add;
}

// Ghi mọi shopify:cart:lines-update từ trước khi trang chạy (như ES1-T98).
async function listenLineEvents(page: Page) {
  await page.addInitScript(({ type, changePath }) => {
    const w = window as unknown as { __te5Events: LineEvent[] };
    w.__te5Events = [];
    document.addEventListener(
      type,
      (e) => {
        const d = ((e as CustomEvent).detail?.lines ? (e as CustomEvent).detail : e) as LineEvent & { promise?: Promise<unknown> };
        const entry: LineEvent = {
          action: d.action,
          context: d.context,
          lines: d.lines,
          target: (e.target as Element)?.tagName?.toLowerCase(),
          beforeChange: !performance.getEntriesByType('resource').some((r) => r.name.includes(changePath)),
        };
        w.__te5Events.push(entry);
        Promise.resolve(d.promise).then(
          (r) => {
            const res = (r ?? {}) as { cart?: unknown; userErrors?: LineEvent['userErrors'] };
            Object.assign(entry, { settled: true, hasCart: res.cart != null, userErrors: res.userErrors });
          },
          (err) => (entry.rejected = String(err)),
        );
      },
      true,
    );
  }, { type: EVENT, changePath: CART.change });
}

// Chuỗi, không truyền function: Playwright biên dịch import() trong spec thành require.
const libraryReady = (page: Page) => page.evaluate(`import(${JSON.stringify(CDN)}).then(() => new Promise((r) => setTimeout(r, 0)))`);

async function settledEvents(page: Page, count: number) {
  const list = () => page.evaluate(() => (window as unknown as { __te5Events: LineEvent[] }).__te5Events.map((e) => ({ ...e })));
  await expect.poll(async () => (await list()).filter((e) => e.settled || e.rejected).length, { timeout: 10_000 }).toBe(count);
  return list();
}

// =====================================================================
// AC1 — thêm giỏ mở drawer
// =====================================================================

mockTest.describe('ES1-T99 TE-5 AC1 mock', () => {
  mockTest.beforeEach(async ({ page }) => {
    mockTest.skip(PAGE_MODE, NO_DRAWER);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  mockTest('AC1 TC-01 thêm giỏ từ PDP: drawer modal, focus h2 Cart, dòng mới, cart-count, Added to cart role status, Checkout ở chân, axe', async ({ page, cart }) => {
    const add = await mockPdp(page, cart);
    const url = page.url();
    const variantId = Number(await tid(page, 'product-form-variant-id').inputValue());
    await add.click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page)).not.toHaveAttribute('aria-busy', /.*/);
    expect(await dialog(page).evaluate((el) => el.matches(':modal'))).toBe(true);
    expect(page.url(), 'không chuyển trang').toBe(url);
    expect(await stayed(page)).toBe(true);
    await expect(tid(page, 'cart-drawer-heading')).toHaveText(TEXT.title);
    await expect(tid(page, 'cart-drawer-heading'), 'AC15: focus vào h2 aria-labelledby').toBeFocused();

    const state = await readCartJson<AjaxCart>(page);
    expect(state.items.some((i) => i.variant_id === variantId), 'giỏ có variant vừa thêm').toBe(true);
    await expect(tid(page, 'cart-drawer-body').getByTestId('cart-line')).toHaveCount(state.items.length);
    await expect(tid(page, 'header-cart-count')).toHaveText(String(state.item_count));
    const added = tid(page, 'cart-drawer-added');
    await expect(added).toHaveAttribute('role', 'status');
    await expect(added.locator('[data-cart-added]')).toBeVisible();
    await expect(added).toContainText(TEXT.added);
    await expect(added.locator('[data-cart-added-item]')).toHaveText('Mock product');
    await expect(tid(page, 'cart-drawer-footer').getByTestId('cart-checkout')).toBeVisible();
    const wallet = tid(page, 'cart-drawer-accelerated');
    if (await wallet.count()) await expect(wallet, 'accelerated bật mặc định').not.toHaveAttribute('hidden', /.*/);
    await expectNoSeriousAxe(page, '[data-testid="cart-drawer-dialog"]');
  });

  mockTest('AC1 TC-05 CART.add 422: không mở drawer, câu lỗi API ở product-form-error, giỏ không đổi', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    const add = await mockPdp(page, cart);
    cart.respond('add', { status: 422, json: { status: 422, message: 'Cart Error', description: MOCK_422 } });
    await add.click();
    await expect(tid(page, 'product-form-error')).toHaveText(MOCK_422);
    await expect(dialog(page)).toBeHidden();
    expect(await stayed(page)).toBe(true);
    expect(cart.state().item_count).toBe(0);
  });

  mockTest('AC1 B-01 bàn phím: mở bằng Enter, focus h2, Tab 1 View cart, Tab 2 nút đóng, Tab/Shift+Tab không ra ngoài dialog, Esc đóng, focus về icon giỏ', async ({ page, cart }) => {
    cart.seed([1]);
    await cart.goto('/');
    await page.waitForFunction(() => ['cart-drawer', 'modal-dialog'].every((n) => !!customElements.get(n)));
    const link = tid(page, 'header-cart-link');
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page)).not.toHaveAttribute('aria-busy', /.*/);
    await expect(tid(page, 'cart-drawer-heading')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(tid(page, 'cart-drawer-view-cart')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(tid(page, 'cart-drawer-close')).toBeFocused();
    // body/null = focus ở chrome trình duyệt; phần tử ngoài dialog = thoát lớp.
    const outside = () =>
      page.evaluate(() => {
        const a = document.activeElement;
        const g = document.querySelector('[data-testid="cart-drawer-dialog"]');
        return a && a !== document.body && !g?.contains(a) ? `${a.tagName.toLowerCase()} ${a.getAttribute('data-testid') ?? a.className}` : null;
      });
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let i = 1; i <= 15; i++) {
        await page.keyboard.press(key);
        expect(await outside(), `${key} lần ${i}: focus ra ngoài dialog`).toBeNull();
      }
    }
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(link).toBeFocused();
  });

  mockTest('AC1 B-02 đóng bằng nút × sau khi thêm giỏ: focus về nút Add to cart', async ({ page, cart }) => {
    const add = await mockPdp(page, cart);
    await add.click();
    await expect(dialog(page)).toBeVisible();
    await expect(add).toBeEnabled();
    await tid(page, 'cart-drawer-close').click();
    await expect(dialog(page)).toBeHidden();
    await expect(add).toBeFocused();
  });

  mockTest('AC1 B-03 drawer ở 360/768/1280/1920: dòng và Checkout trong viewport, không cuộn ngang', async ({ page, cart }) => {
    mockTest.skip(!isDesktop(), 'Đổi viewport chỉ ở project desktop; Pixel 7 chạy các test khác ở kích thước gốc');
    cart.seed([1]);
    await mockOpenDrawer(page, cart);
    for (const width of [360, 768, 1280, 1920]) {
      await page.setViewportSize({ width, height: 800 });
      const checkout = tid(page, 'cart-drawer-footer').getByTestId('cart-checkout');
      await expect(checkout).toBeInViewport({ ratio: 1 });
      await expect(tid(page, 'cart-line').first()).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: không cuộn ngang`).toBe(true);
      await mockTest.info().attach(`te5-drawer-${width}.png`, { body: await page.screenshot(), contentType: 'image/png' });
    }
  });

  mockTest('AC1 B-04 cart-drawer.js route.abort: thêm giỏ vẫn chuyển /cart', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    await page.route(/\/cart-drawer\.js(\?|$)/, (route) => route.abort());
    await cart.stubCartDocument();
    const add = await mockPdp(page, cart, ['product-form']);
    await add.click();
    await page.waitForURL(isCart);
    expect((await readCartJson<AjaxCart>(page)).item_count).toBeGreaterThan(0);
  });

  mockTest('AC1 B-06 theme editor: shopify:block:select mở drawer, deselect đóng', async ({ page, cart }) => {
    await cart.goto('/');
    await page.waitForFunction(() => ['cart-drawer', 'modal-dialog'].every((n) => !!customElements.get(n)));
    const fire = (type: string) => tid(page, 'cart-drawer').evaluate((el, t) => el.dispatchEvent(new CustomEvent(t, { bubbles: true })), type);
    await fire('shopify:block:select');
    await expect(dialog(page)).toBeVisible();
    await fire('shopify:block:deselect');
    await expect(dialog(page)).toBeHidden();
  });
});

test.describe('ES1-T99 TE-5 AC1 thật', () => {
  test('AC1 TC-02 drawer: trường dòng hàng, Total, Checkout, Subtotal theo discount, accelerated khớp /cart.js', async ({ page }) => {
    await seedProduct(page, [2]);
    await gotoStore(page, '/');
    await openDrawer(page);
    const cart = await readCart(page);
    expect(cart.item_count).toBe(2);
    const body = tid(page, 'cart-drawer-body');
    await expect(body).toHaveAttribute('data-item-count', '2');
    await expectLine(body, cart.items[0]);
    const footer = tid(page, 'cart-drawer-footer');
    expect(await centsOf(footer.getByTestId('cart-total')), 'Total = total_price').toBe(cart.total_price);
    await expect(footer.getByTestId('cart-checkout')).toHaveAttribute('form', 'cart-form-drawer');
    await expect(footer.getByTestId('cart-checkout')).toBeVisible();
    await expect(footer.getByTestId('cart-subtotal'), 'AC15: Subtotal chỉ khi có discount cấp giỏ').toHaveCount(cart.cart_level_discount_applications.length ? 1 : 0);
    await expect(tid(page, 'header-cart-count')).toHaveText('2');
    const wallet = tid(page, 'cart-drawer-accelerated');
    if (await wallet.count()) await expect(wallet, 'accelerated bật mặc định').not.toHaveAttribute('hidden', /.*/);
  });

  test('AC1 TC-03 drawer: unit price hiện khi dòng có unit_price_measurement', async ({ page }) => {
    test.skip(!DATA.unitPrice, 'Thiếu TE4_UNIT_PRICE_HANDLE');
    const id = await pdpVariant(page, DATA.unitPrice!);
    await seed(page, [{ id, quantity: 1 }]);
    const cart = await readCart(page);
    test.skip(!cart.items[0]?.unit_price_measurement, `${DATA.unitPrice} không có unit_price_measurement`);
    await gotoStore(page, '/');
    await openDrawer(page);
    await expect(lineOf(page, cart.items[0].key).getByTestId('cart-line-unit-price')).toBeVisible();
  });

  test('AC1 TC-04 discount tự động (te12-bundle): dòng và đơn ở drawer và /cart khớp /cart.js (AC5)', async ({ page }) => {
    test.skip(!DATA.discountReady, 'TE12_DISCOUNT_READY chưa bật (ES1-T178)');
    await gotoStore(page, '/collections/te12-bundle');
    type Products = { products: { variants: { id: number; available: boolean }[] }[] };
    const list = requireJson(await pageJson<Products>(page, '/collections/te12-bundle/products.json?limit=10'), 'te12-bundle/products.json');
    const ids = list.products.map((p) => p.variants.find((v) => v.available)?.id).filter((id): id is number => !!id).slice(0, 3);
    test.skip(ids.length < 2, 'te12-bundle < 2 sản phẩm còn hàng');
    await seed(page, ids.map((id) => ({ id, quantity: 1 })));
    const cart = await readCart(page);
    const lineDiscounts = cart.items.reduce((n, i) => n + i.line_level_discount_allocations.length, 0);
    test.skip(!lineDiscounts && !cart.cart_level_discount_applications.length, 'Automatic discount te12 không áp vào giỏ (market hoặc hạn hiệu lực)');

    if (!PAGE_MODE) {
      await gotoStore(page, '/');
      await openDrawer(page);
      for (const item of cart.items) await expectLine(tid(page, 'cart-drawer-body'), item);
      const footer = tid(page, 'cart-drawer-footer');
      await expect(footer.getByTestId('cart-discount')).toHaveCount(cart.cart_level_discount_applications.length);
      await expect(footer.getByTestId('cart-subtotal')).toHaveCount(cart.cart_level_discount_applications.length ? 1 : 0);
      expect(await centsOf(footer.getByTestId('cart-total'))).toBe(cart.total_price);
    }

    await gotoStore(page, '/cart');
    for (const item of cart.items) await expectLine(tid(page, 'cart-lines'), item);
    await expect(tid(page, 'cart-discount')).toHaveCount(cart.cart_level_discount_applications.length);
    expect(await centsOf(tid(page, 'cart-subtotal'))).toBe(cart.items_subtotal_price);
    expect(await centsOf(tid(page, 'cart-total'))).toBe(cart.total_price);
  });
});

// =====================================================================
// AC2 — đổi số lượng, xoá; AC7 — event sau mỗi thay đổi
// =====================================================================

for (const surface of SURFACES) {
  mockTest.describe(`ES1-T99 TE-5 AC2 AC7 mock ${surface.name}`, () => {
    mockTest.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    mockTest(`AC2 TC-06 ${surface.name}: đổi số lượng → aria-busy, Checkout aria-disabled, rồi Total/cart-count theo /cart.js, giữ focus, 1 refresh, status, axe`, async ({ page, cart }) => {
      cart.seed([1]);
      await mockOpen(surface, page, cart);
      const [key] = await lineKeys(page);
      const release = cart.hold('change');
      await setQuantity(page, key, '2');
      await expect(tid(page, 'cart-items')).toHaveAttribute('aria-busy', 'true');
      await expect(tid(page, 'cart-checkout')).toHaveAttribute('aria-disabled', 'true');
      release();
      await idle(page);
      const state = await readCartJson<AjaxCart>(page);
      expect(state.items[0].quantity).toBe(2);
      await expect(quantityOf(page, key)).toHaveValue('2');
      await expect(quantityOf(page, key)).toBeFocused();
      await expect(tid(page, 'cart-checkout')).not.toHaveAttribute('aria-disabled', 'true');
      expect(await centsOf(tid(page, 'cart-total'))).toBe(state.total_price);
      await expect(tid(page, 'header-cart-count')).toHaveText(String(state.item_count));
      await expect(tid(page, 'cart-items-status')).toHaveText((await label(page, 'updated'))!);
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
      expect(cart.calls.partial, '1 lần refresh partial').toHaveLength(1);
      expect(await stayed(page), 'không reload').toBe(true);
      await expectNoSeriousAxe(page, '[data-testid="cart-items"]');
    });

    mockTest(`AC2 TC-07 ${surface.name}: xoá 1 trong 2 dòng → focus ô dòng còn lại, Total đúng, status removed, không điều hướng`, async ({ page, cart }) => {
      cart.seed([1, 1]);
      await mockOpen(surface, page, cart);
      const lines = tid(page, 'cart-line');
      const [a, b] = await lineKeys(page);
      await lines.first().getByTestId('cart-line-remove').click();
      await expect(lines).toHaveCount(1);
      await idle(page);
      await expect(quantityOf(page, b)).toBeFocused();
      const state = await readCartJson<AjaxCart>(page);
      expect(state.items.map((i) => i.key)).toEqual([b]);
      expect(state.items.some((i) => i.key === a)).toBe(false);
      expect(await centsOf(tid(page, 'cart-total'))).toBe(state.total_price);
      await expect(tid(page, 'cart-items-status')).toHaveText((await label(page, 'removed'))!);
      expect(await stayed(page)).toBe(true);
    });

    mockTest(`AC2 TC-08 ${surface.name}: mock 422 → câu API trong role alert, ô về số server, không refresh`, async ({ page, cart, guard }) => {
      guard.allowNetworkLog();
      cart.seed([1]);
      await mockOpen(surface, page, cart);
      const [key] = await lineKeys(page);
      cart.respond('change', { status: 422, json: { status: 422, message: 'Cart Error', description: MOCK_422 } });
      await changeAndWait(page, key, '99');
      await expect(tid(page, 'cart-items-error')).toHaveAttribute('role', 'alert');
      await expect(tid(page, 'cart-items-error')).toHaveText(MOCK_422);
      await expect(quantityOf(page, key)).toHaveValue('1');
      await expect(quantityOf(page, key)).toBeFocused();
      expect(cart.calls.partial).toEqual([]);
      expect(cart.state().items[0].quantity).toBe(1);
    });

    mockTest(`AC2 TC-09 ${surface.name}: mock 200 giảm số (tồn 2) → ô theo server, status quantity_adjusted`, async ({ page, cart }) => {
      cart.seed([1]);
      await mockOpen(surface, page, cart);
      const [key] = await lineKeys(page);
      cart.stock = 2;
      await changeAndWait(page, key, '5');
      await expect(quantityOf(page, key)).toHaveValue('2');
      await expect(tid(page, 'cart-items-status')).toHaveText((await label(page, 'quantity-adjusted'))!);
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
      expect((await readCartJson<AjaxCart>(page)).items[0].quantity).toBe(2);
    });

    mockTest(`AC2 TC-10 ${surface.name}: route.abort → alert data-label-error, ô về cũ, Checkout mở lại; mạng lại thì đổi được`, async ({ page, cart, guard }) => {
      guard.allowNetworkLog();
      cart.seed([1]);
      await mockOpen(surface, page, cart);
      const [key] = await lineKeys(page);
      cart.respond('change', { abort: true });
      await setQuantity(page, key, '2');
      await expect(tid(page, 'cart-items-error')).toHaveText((await label(page, 'error'))!);
      await idle(page);
      await expect(quantityOf(page, key)).toHaveValue('1');
      await expect(tid(page, 'cart-checkout')).not.toHaveAttribute('aria-disabled', 'true');
      expect(cart.calls.partial).toEqual([]);
      cart.reset('change');
      await changeAndWait(page, key, '2');
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
      expect((await readCartJson<AjaxCart>(page)).items[0].quantity).toBe(2);
    });

    mockTest(`AC7 TC-28 ${surface.name}: đổi số → 1 ${EVENT} action update context ${surface.context}, trước POST, promise có cart`, async ({ page, cart }) => {
      await listenLineEvents(page);
      cart.seed([1]);
      await mockOpen(surface, page, cart);
      await libraryReady(page);
      const [key] = await lineKeys(page);
      await changeAndWait(page, key, '2');
      const list = await settledEvents(page, 1);
      expect(list).toHaveLength(1);
      expect(list[0]).toMatchObject({ action: 'update', context: surface.context, target: 'cart-items', lines: [{ id: key, quantity: 2 }], beforeChange: true, hasCart: true, userErrors: [] });
      expect(list[0].rejected).toBeUndefined();
    });

    mockTest(`AC7 TC-29 ${surface.name}: xoá → 1 event action remove quantity 0, promise có cart`, async ({ page, cart }) => {
      await listenLineEvents(page);
      cart.seed([1, 1]);
      await mockOpen(surface, page, cart);
      await libraryReady(page);
      const line = tid(page, 'cart-line').first();
      const key = (await line.getAttribute('data-line-key'))!;
      await line.getByTestId('cart-line-remove').click();
      await expect(tid(page, 'cart-line')).toHaveCount(1);
      await idle(page);
      const list = await settledEvents(page, 1);
      expect(list).toHaveLength(1);
      expect(list[0]).toMatchObject({ action: 'remove', context: surface.context, lines: [{ id: key, quantity: 0 }], hasCart: true });
    });

    mockTest(`AC7 TC-30 ${surface.name}: mock 422 → 1 event, promise resolve cart null + userErrors câu API, không reject`, async ({ page, cart, guard }) => {
      guard.allowNetworkLog();
      await listenLineEvents(page);
      cart.seed([1]);
      await mockOpen(surface, page, cart);
      await libraryReady(page);
      const [key] = await lineKeys(page);
      cart.respond('change', { status: 422, json: { status: 422, message: 'Cart Error', description: MOCK_422 } });
      await changeAndWait(page, key, '99');
      const list = await settledEvents(page, 1);
      expect(list).toHaveLength(1);
      expect(list[0].rejected).toBeUndefined();
      expect(list[0]).toMatchObject({ action: 'update', hasCart: false, userErrors: [{ message: MOCK_422 }] });
    });
  });
}

mockTest.describe('ES1-T99 TE-5 AC2 mock biên', () => {
  mockTest('AC2 B-05 cart-items.js route.abort trên /cart: không data-enhanced, Update hiện, xoá vẫn là link', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    cart.seed([1]);
    await page.route(/\/cart-items\.js(\?|$)/, (route) => route.abort());
    await cart.goto('/cart');
    await expect(tid(page, 'cart-update')).toBeVisible();
    await expect(tid(page, 'cart-items')).not.toHaveAttribute('data-enhanced', /.*/);
    await expect(tid(page, 'cart-line-remove')).toHaveAttribute('href', /\/cart\/change/);
  });
});

for (const surface of SURFACES) {
  test.describe(`ES1-T99 TE-5 AC2 thật ${surface.name}`, () => {
    test(`AC2 TC-11 ${surface.name}: bấm + (stepper Liquid) → 1 POST quantity 2, thành tiền/Total/cart-count khớp /cart.js, focus trong dòng`, async ({ page }) => {
      await seedProduct(page, [1]);
      await openSurface(page, surface);
      const [key] = await lineKeys(page);
      const plus = lineOf(page, key).getByTestId('cart-line-increase');
      await expect(plus).toBeVisible();
      await expect(lineOf(page, key).getByTestId('cart-line-decrease'), '− khoá ở 1').toHaveAttribute('aria-disabled', 'true');
      const posts: string[] = [];
      page.on('request', (r) => {
        if (r.url().includes(CART.change) && r.method() === 'POST') posts.push(r.postData() ?? '');
      });
      const response = page.waitForResponse((r) => r.url().includes(CART.change) && r.request().method() === 'POST');
      await plus.click();
      expectStoreAllowed(await response);
      await idle(page);
      await expect(quantityOf(page, key)).toHaveValue('2');
      expect(posts).toHaveLength(1);
      expect(JSON.parse(posts[0])).toEqual({ id: key, quantity: 2 });
      const cart = await readCart(page);
      const item = cart.items.find((i) => i.key === key)!;
      expect(item.quantity).toBe(2);
      expect(await centsOf(lineOf(page, key).getByTestId('cart-line-total'))).toBe(item.final_line_price);
      expect(await centsOf(tid(page, 'cart-total'))).toBe(cart.total_price);
      await expect(tid(page, 'header-cart-count')).toHaveText('2');
      expect(await page.evaluate((k) => !!document.activeElement?.closest(`[data-line-key="${k}"]`), key), 'focus giữ trong dòng').toBe(true);
    });
  });
}

// =====================================================================
// AC3 — freeship
// =====================================================================

test.describe('ES1-T99 TE-5 AC3 freeship', () => {
  test('AC3 TC-12 theme mới cài: free_shipping_threshold number default 0, settings_data không ghi đè', () => {
    test.skip(!isDesktop(), 'Tĩnh, chạy 1 lần');
    const schema = JSON.parse(read('config/settings_schema.json')) as { settings?: { id?: string; type?: string; default?: unknown }[] }[];
    const setting = schema.flatMap((g) => g.settings ?? []).find((s) => s.id === 'free_shipping_threshold');
    expect(setting?.type).toBe('number');
    expect(setting?.default).toBe(0);
    expect(read('config/settings_data.json')).not.toMatch(/"free_shipping_threshold"\s*:\s*[1-9]/);
  });

  test('AC3 TC-13 dưới ngưỡng: progress có tên, "Spend {x} more…", x = ngưỡng − tổng; cart page trước dòng hàng, drawer sau Added to cart', async ({ page }) => {
    await seedProduct(page, [1]);
    await gotoStore(page, '/cart');
    const block = tid(page, 'cart-free-shipping');
    test.skip((await block.count()) === 0, 'Preview free_shipping_threshold = 0 hoặc tiền giỏ khác tiền shop (market runner): nhánh có ngưỡng không kiểm được; nhánh 0 ở TC-12, TC-15');
    const cart = await readCart(page);
    const bar = tid(page, 'cart-free-shipping-progress');
    const max = Number(await bar.getAttribute('max'));
    test.skip(cart.total_price >= max, 'Giá sản phẩm test đã ≥ ngưỡng: nhánh đạt ở TC-14');
    expect(await bar.evaluate((el) => el.tagName)).toBe('PROGRESS');
    const text = tid(page, 'cart-free-shipping-text');
    await expect(bar).toHaveAttribute('aria-labelledby', (await text.getAttribute('id'))!);
    await expect(bar).toHaveAccessibleName(TEXT.remaining);
    expect(Number(await bar.getAttribute('value'))).toBe(cart.total_price);
    await expect(text).toHaveText(TEXT.remaining);
    expect(await centsOf(text.locator('strong')), 'số tiền còn thiếu (đậm)').toBe(max - cart.total_price);
    await expect(block).not.toHaveClass(/cart-free-shipping--reached/);
    expect(await precedes(block, tid(page, 'cart-lines')), 'cart page: khối ở đầu danh sách dòng').toBe(true);

    if (PAGE_MODE) return;
    await gotoStore(page, '/');
    await openDrawer(page);
    const drawerBlock = tid(page, 'cart-drawer-dialog').getByTestId('cart-free-shipping');
    await expect(drawerBlock).toBeVisible();
    expect(await precedes(tid(page, 'cart-drawer-added'), drawerBlock), 'drawer: dưới vùng Added to cart').toBe(true);
  });

  test('AC3 TC-14 đạt ngưỡng: thanh đầy, "Free shipping unlocked.", class reached (icon đổi)', async ({ page }) => {
    await seedProduct(page, [1]);
    await gotoStore(page, '/cart');
    const block = tid(page, 'cart-free-shipping');
    test.skip((await block.count()) === 0, 'Preview free_shipping_threshold = 0 hoặc tiền giỏ khác tiền shop');
    const max = Number(await tid(page, 'cart-free-shipping-progress').getAttribute('max'));
    const item = (await readCart(page)).items[0];
    const quantity = Math.ceil(max / item.final_price);
    test.skip(quantity > 20, `Cần ${quantity} món để đạt ngưỡng (> 20)`);
    if (quantity > 1) {
      const res = await cartApi(page, CART.change, { data: { id: item.key, quantity } });
      expectStoreAllowed(res);
      expect(res.ok(), `${CART.change} trả ${res.status()}`).toBeTruthy();
      await gotoStore(page, '/cart');
    }
    test.skip((await readCart(page)).total_price < max, 'Tồn không đủ để đạt ngưỡng');
    await expect(block).toHaveClass(/cart-free-shipping--reached/);
    await expect(tid(page, 'cart-free-shipping-text')).toHaveText(TEXT.reached);
    await expect(tid(page, 'cart-free-shipping-progress')).toHaveAttribute('value', String(max));
  });
});

// =====================================================================
// AC4 — giỏ rỗng, thuế (AC3 TC-15, AC17 TC-46 gộp)
// =====================================================================

test.describe('ES1-T99 TE-5 AC4 giỏ rỗng, thuế', () => {
  test('AC4 TC-16 /cart rỗng: h1, khối rỗng + Continue Shopping + Browse collections, không summary/thuế/freeship (AC3 TC-15)/thanh checkout (AC17 TC-46), axe', async ({ page }) => {
    await gotoStore(page, '/cart');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(tid(page, 'cart-page-heading')).toHaveText(TEXT.title);
    await expect(tid(page, 'cart-empty-heading')).toHaveText(TEXT.empty);
    const cta = tid(page, 'cart-empty-cta');
    await expect(cta).toContainText(TEXT.continueShopping);
    await expect(cta).toHaveAttribute('href', /\/collections\/all(\?|$)/);
    await expect(tid(page, 'cart-empty-link')).toHaveText(TEXT.browse);
    await expect(tid(page, 'cart-empty-link')).toHaveAttribute('href', /\/collections$/);
    for (const id of ['cart-summary', 'cart-checkout', 'cart-tax-note', 'cart-free-shipping', 'cart-checkout-bar', 'cart-lines']) await expect(tid(page, id), id).toHaveCount(0);
    await expect(tid(page, 'cart-page-note')).toBeHidden();
    const wallet = tid(page, 'cart-page-accelerated');
    if (await wallet.count()) await expect(wallet).toBeHidden();
    // B-08: merchant chưa chọn empty_cart_collection thì không lưới; đã chọn thì ≤ 4.
    const grid = tid(page, 'cart-page-bestsellers');
    if (await grid.count()) expect(await grid.locator('li').count()).toBeLessThanOrEqual(4);
    await expectNoSeriousAxe(page);
  });

  test('AC4 TC-17 drawer rỗng: khối rỗng + Shop Bestsellers, không chân panel/pill/freeship (AC3 TC-15), gợi ý ≤ 2, axe', async ({ page }) => {
    await gotoStore(page, '/');
    await openDrawer(page);
    await expect(tid(page, 'cart-empty-heading')).toHaveText(TEXT.empty);
    await expect(tid(page, 'cart-empty-cta')).toContainText(TEXT.bestsellers);
    await expect(tid(page, 'cart-drawer-footer')).toBeHidden();
    await expect(tid(page, 'cart-drawer-count')).toBeHidden();
    await expect(tid(page, 'cart-free-shipping')).toHaveCount(0);
    await expect(tid(page, 'cart-checkout')).toHaveCount(0);
    const suggestions = tid(page, 'cart-drawer-bestsellers');
    if (await suggestions.count()) expect(await suggestions.locator('li').count()).toBeLessThanOrEqual(2);
    await expectNoSeriousAxe(page, '[data-testid="cart-drawer-dialog"]');
  });

  test('AC4 TC-18 câu thuế: market gồm thuế hiện "Taxes included."; market mặc định là 1 trong 4 câu locale', async ({ page }) => {
    await seedProduct(page, [1]);
    await gotoStore(page, '/cart');
    await expect(tid(page, 'cart-tax-note')).toHaveText(TEXT.taxAny);
    test.skip(!DATA.taxCountry, 'Thiếu TE4_TAX_INCLUDED_COUNTRY');
    await gotoStore(page, `/cart?country=${DATA.taxCountry}`);
    await expect(tid(page, 'cart-tax-note')).toHaveText(TEXT.taxIncluded);
  });
});

// =====================================================================
// AC5 — cart page
// =====================================================================

test.describe('ES1-T99 TE-5 AC5 cart page', () => {
  test('AC5 TC-19 /cart có hàng: dòng như drawer, stepper, summary, ghi chú có label + hint, Checkout, accelerated, axe', async ({ page }) => {
    await seedProduct(page, [1]);
    await gotoStore(page, '/cart');
    await enhanced(page);
    const cart = await readCart(page);
    await expectLine(tid(page, 'cart-lines'), cart.items[0]);
    await expect(tid(page, 'cart-line-decrease')).toBeVisible();
    await expect(tid(page, 'cart-line-increase')).toBeVisible();
    await expect(tid(page, 'cart-update'), 'có JS thì ẩn Update').toBeHidden();
    await expect(tid(page, 'cart-summary-heading')).toHaveText(TEXT.summary);
    expect(await centsOf(tid(page, 'cart-subtotal'))).toBe(cart.items_subtotal_price);
    expect(await centsOf(tid(page, 'cart-total'))).toBe(cart.total_price);
    await expect(tid(page, 'cart-tax-note')).toHaveText(TEXT.taxAny);
    await expect(tid(page, 'cart-checkout')).toHaveAttribute('form', 'cart-form-page');
    const note = tid(page, 'cart-page-note');
    await expect(note).toBeVisible();
    await expect(note).toHaveAttribute('name', 'note');
    await expect(note).toHaveAttribute('form', 'cart-form-page');
    await expect(page.locator(`label[for="${await note.getAttribute('id')}"]`)).toHaveText(TEXT.noteLabel);
    await expect(note).toHaveAttribute('aria-describedby', (await tid(page, 'cart-page-note-hint').getAttribute('id'))!);
    const wallet = tid(page, 'cart-page-accelerated');
    if (await wallet.count()) await expect(wallet).toBeVisible();
    await expectNoSeriousAxe(page);
  });

  test.describe('nojs', () => {
    test('AC5 TC-20 nojs: ô số + Update (không −/+), ghi chú lưu cùng form', async ({ browser }) => {
      const { context, page, watch } = await noJsPage(browser);
      try {
        await seedProduct(page, [1], true);
        await gotoNoScript(page, '/cart');
        await expect(tid(page, 'cart-line-decrease')).toBeHidden();
        await expect(tid(page, 'cart-line-increase')).toBeHidden();
        await expect(tid(page, 'cart-update')).toBeVisible();
        await tid(page, 'cart-line-quantity').first().fill('2');
        await tid(page, 'cart-page-note').fill('ES1-T99 nojs note');
        await clickAndLoad(page, () => tid(page, 'cart-update').click());
        const cart = await readCartNoScript<Cart>(page);
        expect(cart.items[0].quantity).toBe(2);
        expect(cart.note).toBe('ES1-T99 nojs note');
        await expect(tid(page, 'cart-line-quantity').first()).toHaveValue('2');
        await expect(tid(page, 'cart-page-note')).toHaveValue('ES1-T99 nojs note');
        await watch.finish();
      } finally {
        await context.close();
      }
    });

    test('AC5 TC-21 nojs: xoá bằng link url_to_remove → khối rỗng', async ({ browser }) => {
      const { context, page, watch } = await noJsPage(browser);
      try {
        await seedProduct(page, [1], true);
        await gotoNoScript(page, '/cart');
        await clickAndLoad(page, () => tid(page, 'cart-line-remove').first().click());
        await expect(tid(page, 'cart-empty')).toBeVisible();
        expect((await readCartNoScript<Cart>(page)).item_count).toBe(0);
        await watch.finish();
      } finally {
        await context.close();
      }
    });

    test('AC5 TC-22 nojs: Checkout sang checkout, ghi chú đã lưu', async ({ browser }) => {
      const { context, page } = await noJsPage(browser);
      try {
        await seedProduct(page, [1], true);
        await gotoNoScript(page, '/cart');
        await tid(page, 'cart-page-note').fill('ES1-T99 checkout note');
        await clickAndLoad(page, () => tid(page, 'cart-checkout').click());
        await page.waitForURL(/checkout/);
        // Trang checkout có thể khác domain: quay lại /cart của store để đọc giỏ.
        await gotoNoScript(page, '/cart');
        expect((await readCartNoScript<Cart>(page)).note).toBe('ES1-T99 checkout note');
        await expect(tid(page, 'cart-page-note')).toHaveValue('ES1-T99 checkout note');
      } finally {
        await context.close();
      }
    });
  });
});

// =====================================================================
// AC6 — cart_type page
// =====================================================================

mockTest.describe('ES1-T99 TE-5 AC6 mock', () => {
  mockTest('AC6 TC-23 flip data-cart-type page trên product-form: thêm giỏ chuyển /cart, không mở dialog', async ({ page, cart }) => {
    await cart.stubCartDocument();
    const add = await mockPdp(page, cart);
    await tid(page, 'product-form').evaluate((el) => el.setAttribute('data-cart-type', 'page'));
    await add.click();
    await page.waitForURL(isCart);
    expect((await readCartJson<AjaxCart>(page)).item_count).toBeGreaterThan(0);
  });

  mockTest('AC7 TC-31 data-mode none (flip): Shopify.actions.openCart chuyển /cart', async ({ page, cart }) => {
    mockTest.skip(PAGE_MODE, 'Nhánh thật ở TC-24');
    await cart.stubCartDocument();
    await cart.goto('/');
    await actionsReady(page);
    await tid(page, 'cart-drawer').evaluate((el) => el.setAttribute('data-mode', 'none'));
    const navigated = page.waitForURL(isCart);
    await page.evaluate(() => void (window as unknown as { Shopify: { actions: { openCart: () => Promise<unknown> } } }).Shopify.actions.openCart());
    await navigated;
  });
});

test.describe('ES1-T99 TE-5 AC6 thật', () => {
  test('AC6 TC-24 preview cart_type page: không dialog, data-mode none, thêm giỏ chuyển /cart', async ({ page }) => {
    test.skip(!PAGE_MODE, 'Cần preview đặt cart_type page + EXPECT_CART_TYPE=page; không có thì đính ảnh chụp tay vào ticket ES1-T99');
    test.skip(!DATA.product, NO_PRODUCT);
    await gotoStore(page, '/');
    await expect(tid(page, 'cart-drawer')).toHaveAttribute('data-mode', 'none');
    await expect(dialog(page)).toHaveCount(0);
    await pdpVariant(page, DATA.product!);
    await tid(page, 'product-form-add').click();
    await page.waitForURL(isCart, { timeout: 20_000 });
    await expectNotChallenged(page);
    expect((await readCart(page)).item_count).toBeGreaterThan(0);
  });
});

// =====================================================================
// AC7 — Shopify.actions thật
// =====================================================================

test.describe('ES1-T99 TE-5 AC7 Shopify.actions', () => {
  test.beforeEach(() => {
    test.skip(PAGE_MODE, NO_DRAWER);
    test.skip(!DATA.product, NO_PRODUCT);
  });

  test('AC7 TC-26 openCart sau khi giỏ đổi phía server: drawer mở tại chỗ, dòng + cart-count từ server, focus h2, Esc về icon giỏ', async ({ page }) => {
    const id = await pdpVariant(page, DATA.product!);
    await gotoStore(page, '/');
    await actionsReady(page);
    await expect(tid(page, 'header-cart-count')).toHaveCount(0);
    await seed(page, [{ id, quantity: 1 }]);
    const url = page.url();
    await page.evaluate(() => (window as unknown as { Shopify: { actions: { openCart: () => Promise<unknown> } } }).Shopify.actions.openCart().then(() => undefined));
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page)).not.toHaveAttribute('aria-busy', /.*/);
    expect(page.url(), 'không sang trang cart').toBe(url);
    expect(await stayed(page)).toBe(true);
    await expect(tid(page, 'cart-drawer-body').getByTestId('cart-line')).toHaveCount(1);
    await expect(tid(page, 'header-cart-count')).toHaveText('1');
    await expect(tid(page, 'cart-drawer-heading')).toBeFocused();
    await expect(tid(page, 'cart-drawer-added').locator('[data-cart-added]'), 'openCart không hiện Added to cart').toBeHidden();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(tid(page, 'header-cart-link')).toBeFocused();
  });

  test('AC7 TC-27 updateCart thêm dòng: cart-count + partial drawer theo server, drawer không tự mở, không reload', async ({ page }) => {
    const id = await pdpVariant(page, DATA.product!);
    await gotoStore(page, '/');
    await actionsReady(page);
    const result = await page.evaluate(async (merchandiseId) => {
      const actions = (window as unknown as { Shopify: { actions: { updateCart: (input: unknown) => Promise<unknown> } } }).Shopify.actions;
      return JSON.parse(JSON.stringify((await actions.updateCart({ lines: [{ merchandiseId, quantity: 1 }] })) ?? null)) as { userErrors?: unknown[] } | null;
    }, id);
    expect(result?.userErrors ?? []).toEqual([]);
    await expect(tid(page, 'header-cart-count')).toHaveText('1');
    await expect(tid(page, 'cart-drawer-body')).toHaveAttribute('data-item-count', '1');
    await expect(dialog(page)).toBeHidden();
    expect(await stayed(page), 'không reload').toBe(true);
    expect((await readCart(page)).item_count).toBe(1);
  });
});

// =====================================================================
// AC8 — ghi chú đơn trong drawer
// =====================================================================

test.describe('ES1-T99 TE-5 AC8 ghi chú drawer', () => {
  test('AC8 TC-35 schema show_order_note checkbox default true, details chỉ render khi bật; preview tắt thì không có mục ghi chú', async ({ page }) => {
    if (isDesktop()) {
      const source = read('blocks/cart-drawer.liquid');
      const schema = JSON.parse(source.split('{% schema %}')[1].split('{% endschema %}')[0]) as { settings: { id: string; type: string; default?: unknown }[] };
      const setting = schema.settings.find((s) => s.id === 'show_order_note');
      expect(setting?.type).toBe('checkbox');
      expect(setting?.default).toBe(true);
      expect(source).toMatch(/\{%-?\s*if block\.settings\.show_order_note\s*-?%\}\s*<details[^>]*data-testid="cart-drawer-note"/);
    }
    test.skip(!NOTE_OFF, 'Nhánh tắt chỉ chạy khi preview tắt show_order_note + EXPECT_ORDER_NOTE=off');
    test.skip(PAGE_MODE, NO_DRAWER);
    await gotoStore(page, '/');
    await expect(tid(page, 'cart-drawer-note')).toHaveCount(0);
  });

  test('AC8 TC-32 TC-33 details đóng sẵn, label Order note; rời ô thì lưu cart.note, /cart cùng chữ', async ({ page }) => {
    test.skip(NOTE_OFF, 'Preview tắt show_order_note');
    await seedProduct(page, [1]);
    await openSurface(page, SURFACES[0]);
    const note = tid(page, 'cart-drawer-note');
    await expect(note).toHaveCount(1);
    expect(await note.evaluate((el) => el.tagName)).toBe('DETAILS');
    await expect(note).not.toHaveAttribute('open', /.*/);
    await expect(note.locator('summary')).toContainText(TEXT.noteToggle);
    await note.locator('summary').click();
    await expect(note).toHaveAttribute('open', '');
    const input = tid(page, 'cart-drawer-note-input');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('name', 'note');
    await expect(input).toHaveAttribute('form', 'cart-form-drawer');
    await expect(page.locator(`label[for="${await input.getAttribute('id')}"]`)).toHaveText(TEXT.noteLabel);

    const text = `ES1-T99 drawer note ${Date.now()}`;
    const saved = page.waitForResponse((r) => r.url().includes(CART.update) && r.request().method() === 'POST');
    await input.fill(text);
    await input.blur();
    expectStoreAllowed(await saved);
    await idle(page);
    await expect(tid(page, 'cart-items-error')).toBeEmpty();
    expect((await readCart(page)).note).toBe(text);
    await gotoStore(page, '/cart');
    await expect(tid(page, 'cart-page-note'), 'cùng cart.note với cart page').toHaveValue(text);
  });

  test('AC8 TC-34 đang gõ ghi chú (chưa rời ô), giỏ refresh partial: chữ còn, details vẫn mở, focus vẫn ở ô', async ({ page }) => {
    test.skip(NOTE_OFF, 'Preview tắt show_order_note');
    await seedProduct(page, [1]);
    await openSurface(page, SURFACES[0]);
    const note = tid(page, 'cart-drawer-note');
    await note.locator('summary').click();
    const input = tid(page, 'cart-drawer-note-input');
    await input.click();
    await page.keyboard.type('ES1-T99 đang gõ');
    const [key] = await lineKeys(page);
    const changed = page.waitForResponse((r) => r.url().includes(CART.change) && r.request().method() === 'POST');
    // Đổi số mà focus vẫn ở textarea: phát change trên ô số. cart-items giữ aria-busy tới khi refresh partial xong.
    await quantityOf(page, key).evaluate((el: HTMLInputElement) => {
      el.value = '2';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expectStoreAllowed(await changed);
    await idle(page);
    expect((await readCart(page)).items[0].quantity, 'giỏ đã đổi và refresh').toBe(2);
    await expect(quantityOf(page, key)).toHaveValue('2');
    await expect(input).toHaveValue('ES1-T99 đang gõ');
    await expect(note).toHaveAttribute('open', '');
    await expect(input).toBeFocused();
  });
});

mockTest.describe('ES1-T99 TE-5 AC8 mock', () => {
  mockTest('AC8 B-07 lưu ghi chú lỗi mạng (route.abort CART.update): alert data-label-error, chữ giữ nguyên', async ({ page, cart, guard }) => {
    mockTest.skip(NOTE_OFF, 'Preview tắt show_order_note');
    guard.allowNetworkLog();
    cart.seed([1]);
    // Đăng ký sau fixture nên chạy trước route của MockCart (mock chưa hỗ trợ CART.update).
    const calls: string[] = [];
    await page.route(`**${CART.update}`, (route) => {
      calls.push(route.request().postData() ?? '');
      return route.abort();
    });
    await mockOpenDrawer(page, cart);
    await tid(page, 'cart-drawer-note').locator('summary').click();
    const input = tid(page, 'cart-drawer-note-input');
    await input.fill('ES1-T99 lỗi mạng');
    await input.blur();
    await expect(tid(page, 'cart-items-error')).toHaveText((await label(page, 'error'))!);
    await idle(page);
    await expect(input).toHaveValue('ES1-T99 lỗi mạng');
    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0])).toEqual({ note: 'ES1-T99 lỗi mạng' });
  });
});

// =====================================================================
// AC9 — quantity rule, volume (mockup khi store không B2B)
// =====================================================================

test.describe('ES1-T99 TE-5 AC9 quantity rule', () => {
  test('AC9 TC-36 snippet: quy tắc rút gọn Min/Max/Increments, input step + data-quantity-*, aria-describedby, − aria-disabled ở min', () => {
    test.skip(!isDesktop(), 'Tĩnh, chạy 1 lần');
    const lines = read('snippets/cart-lines.liquid');
    for (const key of ['cart.quantity_rule_min', 'cart.quantity_rule_max', 'cart.quantity_rule_increment', 'cart.volume_pricing_applied']) expect(lines, key).toContain(`'${key}'`);
    for (const hook of ['step="{{ rule_increment }}"', 'data-quantity-rule', 'data-quantity-min=', 'data-quantity-max=', 'data-quantity-step=', 'aria-describedby="{{ quantity_id }}-rule"', 'data-testid="cart-line-quantity-rule"', 'data-testid="cart-line-volume"']) {
      expect(lines, hook).toContain(hook);
    }
    expect(lines).toMatch(/\{% if item\.quantity <= rule_min %\}\s*aria-disabled="true"/);
    const locale = JSON.parse(read('locales/en.default.json')) as { cart: Record<string, string> };
    expect([locale.cart.quantity_rule_min, locale.cart.quantity_rule_increment]).toEqual(['Min {{ min }}', 'Increments of {{ increment }}']);
  });

  for (const surface of SURFACES) {
    test(`AC9 TC-37 ${surface.name} (mockup Min 6 · Increments of 6 · Max 18): − khoá ở min không gửi, + theo bước khoá ở max, 1 POST 18, 422 → câu server, ô về 6`, async ({ page, guard }) => {
      guard.allowNetworkLog();
      await seedProduct(page, [6]);
      await openSurface(page, surface);
      const [key] = await lineKeys(page);
      test.skip((await readCart(page)).items[0]?.quantity !== 6, 'Tồn variant < 6: không dựng được dòng × 6');
      const line = lineOf(page, key);
      await injectRule(line, { min: 6, step: 6, max: 18 });
      const posts: string[] = [];
      await page.route(`**${CART.change}`, (route) => {
        posts.push(route.request().postData() ?? '');
        return route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ status: 422, message: 'Cart Error', description: MOCK_422 }) });
      });
      const input = line.getByTestId('cart-line-quantity');
      const minus = line.getByTestId('cart-line-decrease');
      const plus = line.getByTestId('cart-line-increase');
      await expect(minus).toHaveAttribute('aria-disabled', 'true');
      await minus.click({ force: true });
      await page.waitForTimeout(500);
      expect(posts, '− ở min không gửi').toEqual([]);
      await expect(input).toHaveValue('6');
      await plus.click();
      await expect(input).toHaveValue('12');
      await plus.click();
      await expect(input).toHaveValue('18');
      await expect(plus, '+ khoá ở max').toHaveAttribute('aria-disabled', 'true');
      await expect.poll(() => posts.length).toBe(1);
      expect(JSON.parse(posts[0])).toEqual({ id: key, quantity: 18 });
      await expect(tid(page, 'cart-items-error')).toHaveText(MOCK_422);
      await idle(page);
      await expect(input, 'về số server').toHaveValue('6');
      await page.waitForTimeout(400);
      expect(posts).toHaveLength(1);
    });

    test(`AC9 TC-38 ${surface.name} (mockup): gõ 7 rời ô → câu lỗi dưới dòng, aria-invalid, aria-describedby gồm câu lỗi, 0 POST`, async ({ page }) => {
      await seedProduct(page, [6]);
      await openSurface(page, surface);
      const [key] = await lineKeys(page);
      test.skip((await readCart(page)).items[0]?.quantity !== 6, 'Tồn variant < 6: không dựng được dòng × 6');
      const line = lineOf(page, key);
      await injectRule(line, { min: 6, step: 6, max: 18 });
      const posts: string[] = [];
      page.on('request', (r) => {
        if (r.url().includes(CART.change) && r.method() === 'POST') posts.push(r.postData() ?? '');
      });
      const input = line.getByTestId('cart-line-quantity');
      await input.fill('7');
      await input.blur();
      const error = line.getByTestId('cart-line-error');
      await expect(error).toBeVisible();
      await expect(error).toContainText('Enter a multiple of 6');
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveAttribute('aria-describedby', new RegExp(`\\b${(await error.getAttribute('id'))!}\\b`));
      await page.waitForTimeout(500);
      expect(posts, 'không gửi cập nhật').toEqual([]);
    });
  }

  test('AC9 TC-39 B2B thật: dòng quy tắc ở /cart và drawer, ô có step', async ({ page }) => {
    test.skip(!DATA.quantityRule, 'Thiếu TE5_QUANTITY_RULE_HANDLE: store dev chưa bật B2B (ES1-T298 D1), AC9 đạt bằng mockup TC-37, TC-38 (ES1-T297 #1)');
    const id = await pdpVariant(page, DATA.quantityRule!);
    const min = Number((await page.locator('input[name="quantity"]').first().getAttribute('min')) ?? '1') || 1;
    await seed(page, [{ id, quantity: min }]);
    for (const surface of SURFACES) {
      if (surface.name === 'drawer' && PAGE_MODE) continue;
      await openSurface(page, surface);
      const rule = tid(page, 'cart-line-quantity-rule').first();
      await expect(rule, surface.name).toBeVisible();
      await expect(rule).toHaveText(/(Min \d+|Max \d+|Increments of \d+)/);
      await expect(tid(page, 'cart-line-quantity').first()).toHaveAttribute('step', /\d+/);
    }
  });

  test('AC9 TC-40 volume pricing thật: "Volume pricing applied" khi đạt bậc', async ({ page }) => {
    test.skip(!DATA.volume, 'Thiếu TE5_VOLUME_HANDLE (ES1-T298 D1); markup kiểm ở ES1-T369');
    const id = await pdpVariant(page, DATA.volume!);
    await seed(page, [{ id, quantity: DATA.volumeQuantity }]);
    await gotoStore(page, '/cart');
    await expect(tid(page, 'cart-line-volume').first()).toHaveText(TEXT.volume);
  });
});

// =====================================================================
// AC10 — selling plan
// =====================================================================

test.describe('ES1-T99 TE-5 AC10 selling plan', () => {
  test('AC10 TC-41 drawer và /cart: tên selling plan, giá dòng = giá theo plan', async ({ page }) => {
    test.skip(!DATA.sellingPlan, 'Thiếu TE4_SELLING_PLAN_HANDLE');
    await gotoStore(page, `/products/${DATA.sellingPlan}`);
    type Product = { variants: { id: number; available: boolean; selling_plan_allocations?: { selling_plan_id: number }[] }[] };
    const product = requireJson(await pageJson<Product>(page, `/products/${DATA.sellingPlan}.js`), `/products/${DATA.sellingPlan}.js`);
    const variant = product.variants.find((v) => v.available && v.selling_plan_allocations?.length);
    test.skip(!variant, `${DATA.sellingPlan}: không variant còn hàng có selling plan`);
    await seed(page, [{ id: variant!.id, quantity: 1, selling_plan: variant!.selling_plan_allocations![0].selling_plan_id }]);
    const item = (await readCart(page)).items[0];
    expect(item.selling_plan_allocation, 'dòng có selling_plan_allocation').toBeTruthy();
    expect(item.final_price).toBe(item.selling_plan_allocation!.price);
    for (const surface of SURFACES) {
      if (surface.name === 'drawer' && PAGE_MODE) continue;
      await openSurface(page, surface);
      const line = lineOf(page, item.key);
      await expect(line.getByTestId('cart-line-selling-plan'), surface.name).toHaveText(item.selling_plan_allocation!.selling_plan.name);
      expect(await centsOf(line.getByTestId('cart-line-price')), `${surface.name}: giá theo plan`).toBe(item.selling_plan_allocation!.price);
    }
  });
});

// =====================================================================
// AC17 — thanh checkout dính dưới 64rem
// =====================================================================

test.describe('ES1-T99 TE-5 AC17 thanh checkout', () => {
  const bar = (page: Page) => tid(page, 'cart-sticky-checkout');
  const html = (page: Page) => page.locator('html');
  const toBottom = (page: Page) => page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const panelOut = (page: Page) => tid(page, 'cart-summary').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom <= 0 || r.top >= innerHeight;
  });

  test('AC17 TC-42 TC-43 dưới 64rem: panel ngoài màn → aside Total + Checkout 48, data-bottom-bar, footer không bị che; panel vào màn → ẩn', async ({ page }) => {
    await seedProduct(page, [1, 1, 1]);
    const widths = isDesktop() ? [360, 768] : [0];
    for (const width of widths) {
      if (width) await page.setViewportSize({ width, height: 800 });
      const name = width ? `${width}px` : 'Pixel 7';
      await gotoStore(page, '/cart');
      await enhanced(page);
      await page.waitForFunction(() => !!customElements.get('cart-checkout-bar'));
      const cart = await readCart(page);
      await toBottom(page);
      test.skip(!(await panelOut(page)), `${name}: cuộn hết trang panel vẫn trong màn (trang ngắn)`);
      await expect(bar(page), name).toBeVisible();
      expect(await bar(page).evaluate((el) => el.tagName)).toBe('ASIDE');
      await expect(bar(page)).toHaveAttribute('aria-label', TEXT.sticky);
      await expect(html(page)).toHaveAttribute('data-bottom-bar', 'cart');
      expect(await centsOf(tid(page, 'cart-sticky-checkout-total')), `${name}: Total`).toBe(cart.total_price);
      const button = (await tid(page, 'cart-sticky-checkout-button').boundingBox())!;
      expect(Math.abs(button.height - 48), `${name}: Checkout cao 48`).toBeLessThanOrEqual(1);
      const barBox = (await bar(page).boundingBox())!;
      expect(barBox.height, `${name}: thanh cao ≥ 72`).toBeGreaterThanOrEqual(71.5);
      const footer = await tid(page, 'footer').last().boundingBox();
      if (footer) expect(footer.y + footer.height, `${name}: cuối trang không bị thanh che`).toBeLessThanOrEqual(barBox.y + 1);
      await base.info().attach(`te5-sticky-${name}.png`, { body: await page.screenshot(), contentType: 'image/png' });

      await tid(page, 'cart-summary').scrollIntoViewIfNeeded();
      await expect(bar(page), `${name}: panel vào màn thì ẩn`).toBeHidden();
      await expect(html(page)).not.toHaveAttribute('data-bottom-bar', /.*/);
    }
  });

  test('AC17 TC-44 1280 và 1920: không thanh, không data-bottom-bar', async ({ page }) => {
    test.skip(!isDesktop(), 'Chỉ project desktop');
    await seedProduct(page, [1, 1, 1]);
    for (const width of [1280, 1920]) {
      await page.setViewportSize({ width, height: 800 });
      await gotoStore(page, '/cart');
      await enhanced(page);
      await toBottom(page);
      await page.waitForTimeout(300);
      await expect(bar(page), `${width}`).toBeHidden();
      await expect(html(page)).not.toHaveAttribute('data-bottom-bar', /.*/);
    }
  });

  test.describe('nojs', () => {
    test('AC17 TC-45 nojs 360: thanh giữ hidden khi cuộn', async ({ browser }) => {
      const { context, page, watch } = await noJsPage(browser, isDesktop() ? { width: 360, height: 800 } : undefined);
      try {
        await seedProduct(page, [1, 1, 1], true);
        await gotoNoScript(page, '/cart');
        await page.mouse.wheel(0, 20_000);
        await page.waitForTimeout(300);
        if (await bar(page).count()) await expect(bar(page)).toBeHidden();
        await watch.finish();
      } finally {
        await context.close();
      }
    });
  });
});
