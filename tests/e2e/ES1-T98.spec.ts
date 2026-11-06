// Ticket ES1-T98 TE-5-BE3: override Shopify.actions + CartLinesUpdateEvent khi đổi số lượng và xoá (docs/srs.md#TE-5 AC7; drafts/techlead/ES1-T89/task-split.md D9, D10; ES1-T91).
// ES1-T203: Cart API và partial mock trong bộ nhớ (support/cart-mock.ts), trang, JS và thư viện standard-events thật, 0 request Cart API tới store.
// getCart, updateCart ghi qua Storefront API (ES1-T164), mock Cart API không tới: các test đó nằm trong luồng thật ở ES1-T203.spec.ts.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [EXPECT_CART_TYPE=page] npx playwright test tests/e2e/ES1-T98.spec.ts -g "AC7"
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { readCartJson } from './support/product-data';
import { CART } from './support/cart-api';
import { expect, test, type AjaxCart, type MockCart } from './support/cart-mock';
import { lineKeys } from './support/cart-seed';

type Entry = {
  action?: string;
  context?: string;
  target?: string;
  lines?: { id?: string; merchandiseId?: string; quantity?: number }[];
  beforeChange?: boolean;
  settled?: boolean;
  hasCart?: boolean;
  userErrors?: { message: string }[];
  warnings?: unknown[];
  rejected?: string;
};
type Surface = { name: string; context: string; open: (page: Page, cart: MockCart) => Promise<void> };
type Win = { __t98: Entry[]; __t98Stay?: number; Shopify: { actions: Record<string, (...args: unknown[]) => Promise<unknown>> } };

const EVENT = 'shopify:cart:lines-update';
const CDN = 'https://cdn.shopify.com/storefront/standard-events.js';
const HANDLE = env('TE4_VARIANTS_HANDLE', 'TE4_SINGLE_HANDLE');
const PAGE_MODE = process.env.EXPECT_CART_TYPE === 'page';
const MOCK_422 = 'ES1-T98 mock: only 1 item available.';
const isCart = (url: URL) => /\/cart\/?$/.test(url.pathname);

const tid = (page: Page, id: string) => page.getByTestId(id);
const dialog = (page: Page) => tid(page, 'cart-drawer-dialog');
const quantityOf = (page: Page, key: string) => page.locator(`[data-line-key="${key}"] [data-testid="cart-line-quantity"]`);
const readCart = (page: Page) => readCartJson<AjaxCart>(page);
const stayed = (page: Page) => page.evaluate(() => (window as unknown as Win).__t98Stay === 1);
const entries = (page: Page) => page.evaluate(() => (window as unknown as Win).__t98.map((e) => ({ ...e })));
const idle = (page: Page) => expect(tid(page, 'cart-items')).not.toHaveAttribute('aria-busy', /.*/);

// Ghi nhận mọi event từ trước khi trang chạy; payload nằm trên event hoặc detail (như ES1-T85).
async function listen(page: Page) {
  await page.addInitScript(({ type, changePath }) => {
    const w = window as unknown as Win;
    w.__t98 = [];
    document.addEventListener(
      type,
      (e) => {
        const d = ((e as CustomEvent).detail?.lines ? (e as CustomEvent).detail : e) as Entry & { promise?: Promise<unknown> };
        const entry: Entry = {
          action: d.action,
          context: d.context,
          lines: d.lines,
          target: (e.target as Element)?.tagName?.toLowerCase(),
          beforeChange: !performance.getEntriesByType('resource').some((r) => r.name.includes(changePath)),
        };
        w.__t98.push(entry);
        Promise.resolve(d.promise).then(
          (r) => {
            const res = (r ?? {}) as { cart?: unknown; userErrors?: Entry['userErrors']; warnings?: unknown[] };
            Object.assign(entry, { settled: true, hasCart: res.cart != null, userErrors: res.userErrors, warnings: res.warnings });
          },
          (err) => (entry.rejected = String(err)),
        );
      },
      true,
    );
  }, { type: EVENT, changePath: CART.change });
}

// cart-drawer.js đặt data-actions sau khi configure xong. Thiếu thì Shopify.actions chưa có tới window load (ES1-T91 #1).
async function actionsReady(page: Page) {
  await expect(tid(page, 'cart-drawer'), 'Shopify.actions chưa được configure').toHaveAttribute('data-actions', '', { timeout: 15_000 });
  await page.evaluate(() => ((window as unknown as Win).__t98Stay = 1));
}

// Thư viện đã nạp thì cart-items.js mới dispatch được (không chờ khi ghi).
// Chuỗi, không truyền function: Playwright biên dịch import() trong spec thành require.
async function libraryReady(page: Page) {
  await expect(tid(page, 'cart-items')).toHaveAttribute('data-enhanced', '', { timeout: 15_000 });
  await page.evaluate(`import(${JSON.stringify(CDN)}).then(() => new Promise((r) => setTimeout(r, 0)))`);
}

// Test event không phụ thuộc Shopify.actions: chỉ chờ custom element và thư viện.
async function openPage(page: Page, cart: MockCart) {
  await cart.goto('/cart');
  await libraryReady(page);
}

async function openDrawer(page: Page, cart: MockCart) {
  test.skip(PAGE_MODE, 'Preview đặt cart_type page: không có dialog');
  await cart.goto('/');
  await page.waitForFunction(() => !!customElements.get('cart-drawer'));
  await tid(page, 'header-cart-link').click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).not.toHaveAttribute('aria-busy', /.*/);
  await libraryReady(page);
}

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

function callAction(page: Page, name: string, ...args: unknown[]) {
  return page.evaluate(
    async ({ name, args }) => {
      const res = await (window as unknown as Win).Shopify.actions[name](...args);
      return JSON.parse(JSON.stringify(res ?? null));
    },
    { name, args },
  );
}

async function settled(page: Page, count = 1) {
  await expect.poll(async () => (await entries(page)).filter((e) => e.settled || e.rejected).length, { timeout: 10_000 }).toBe(count);
  return entries(page);
}

function expectLineEvent(e: Entry, action: string, context: string, key: string, quantity: number) {
  expect(e.action).toBe(action);
  expect(e.context).toBe(context);
  expect(e.target).toBe('cart-items');
  expect(e.lines).toEqual([{ id: key, quantity }]);
  expect(e.beforeChange, 'dispatch trước request').toBe(true);
  expect(e.rejected, 'không reject').toBeUndefined();
  expect(e.warnings).toEqual([]);
}

test.describe('ES1-T98 contract', () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

  test('AC7 contract: trần byte, configure 3 action, không gán đè, event trong cart-items, link doc', () => {
    const drawer = read('assets/cart-drawer.js');
    const items = read('assets/cart-items.js');
    expect(Buffer.byteLength(drawer), 'cart-drawer.js tối đa 4096 B').toBeLessThanOrEqual(4096);
    expect(Buffer.byteLength(items), 'cart-items.js tối đa 5632 B').toBeLessThanOrEqual(5632);
    for (const action of ['openCart', 'updateCart']) expect(drawer).toMatch(new RegExp(`\\.${action}\\??\\.configure`));
    expect([...drawer.matchAll(/\ba\.(\w+)\??\.configure\b/g)].map((m) => m[1]).sort()).toEqual(['openCart', 'updateCart']);
    // getCart không configure được: gọi configure là TypeError (docs, ES1-T164).
    expect(drawer).not.toMatch(/getCart\??\.configure/);
    // Không gán Shopify.actions.x = fn; không tự phát event trong override (ES1-T83).
    expect(drawer).not.toMatch(/actions\.\w+\s*=[^=]/);
    expect(drawer).not.toMatch(/dispatchEvent\(new E|new CartLinesUpdateEvent/);
    for (const js of [drawer, items]) {
      expect(js).toContain(`import("${CDN}")`);
      expect(js).not.toMatch(/["']@shopify\/standard-events["']/);
      expect(js).not.toMatch(/\.reject\(/);
      expect(js).not.toMatch(/^import .*(\.js|\.\/)/m);
      expect(js).toContain('https://shopify.dev/docs/api/storefront-events-and-actions/');
      expect(js).toContain('ES1-T91');
    }
    expect(items).toContain('action: quantity ? "update" : "remove"');
    expect(items).toContain('context: this.closest("dialog") ? "dialog" : "cart"');
    expect(items).toContain('createCartFromAjaxResponse');
    const write = items.slice(items.indexOf('async write('));
    expect(write.indexOf('this.emit(key, quantity)')).toBeGreaterThan(0);
    expect(write.indexOf('this.emit(key, quantity)')).toBeLessThan(write.indexOf('cartChangeUrl'));
    // Hook openCart ở /cart: h1 trong .cart-page có tabindex -1.
    expect(read('blocks/cart-page.liquid')).toMatch(/class="cart-page"[\s\S]*<h1[^>]*tabindex="-1"/);
  });
});

test.describe('ES1-T98 TE-5 AC7', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await listen(page);
  });

  test('AC7 openCart ở chế độ drawer: dialog mở, URL không đổi, giỏ theo server, Esc trả focus', async ({ page, cart }) => {
    test.skip(PAGE_MODE, 'Preview đặt cart_type page: không có dialog');
    cart.seed([1]);
    await cart.goto('/');
    await actionsReady(page);
    const url = page.url();
    expect(await callAction(page, 'openCart')).toBeNull();
    await expect(dialog(page)).toBeVisible();
    expect(await dialog(page).evaluate((el) => el.matches(':modal'))).toBe(true);
    expect(page.url()).toBe(url);
    expect(await stayed(page)).toBe(true);
    expect(cart.calls.partial).toHaveLength(1);
    await expect(tid(page, 'cart-drawer-body')).toHaveAttribute('data-item-count', String((await readCart(page)).item_count));
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(tid(page, 'header-cart-link')).toBeFocused();
  });

  test('AC7 openCart ở /cart: focus h1, không điều hướng', async ({ page, cart }) => {
    cart.seed([1]);
    await cart.goto('/cart');
    await actionsReady(page);
    const url = page.url();
    await callAction(page, 'openCart');
    await expect(tid(page, 'cart-page-heading')).toBeFocused();
    expect(page.url()).toBe(url);
    expect(await stayed(page)).toBe(true);
  });

  test('AC7 chế độ page: openCart chuyển /cart (flip data-mode trên DOM)', async ({ page, cart }) => {
    test.skip(PAGE_MODE, 'Nhánh thật ở test cart_type page');
    await cart.stubCartDocument();
    await cart.goto('/');
    await actionsReady(page);
    await tid(page, 'cart-drawer').evaluate((el) => el.setAttribute('data-mode', 'none'));
    const navigated = page.waitForURL(isCart);
    await page.evaluate(() => void (window as unknown as Win).Shopify.actions.openCart());
    await navigated;
    await expect(tid(page, 'cart-page')).toBeVisible();
  });

  test('AC7 cart_type page thật: openCart chuyển /cart', async ({ page, cart }) => {
    test.skip(!PAGE_MODE, 'Cần preview đặt cart_type page + EXPECT_CART_TYPE=page (D12)');
    await cart.stubCartDocument();
    await cart.goto('/');
    await actionsReady(page);
    await expect(dialog(page)).toHaveCount(0);
    const navigated = page.waitForURL(isCart);
    await page.evaluate(() => void (window as unknown as Win).Shopify.actions.openCart());
    await navigated;
  });

  test('AC7 thêm giỏ từ trang sản phẩm: đúng 1 event context product, không dispatch lần 2', async ({ page, cart }) => {
    test.skip(PAGE_MODE, 'Preview đặt cart_type page: thêm giỏ rời trang');
    test.skip(!HANDLE, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
    await cart.goto(`/products/${HANDLE}`);
    await actionsReady(page);
    const add = tid(page, 'product-form-add');
    test.skip(await add.isDisabled(), 'Variant mặc định hết hàng');
    await add.click();
    await expect(dialog(page)).toBeVisible();
    const list = await settled(page);
    expect(list.map((e) => `${e.action}/${e.context}`)).toEqual(['add/product']);
  });

  const SURFACES: Surface[] = [
    { name: 'cart page', context: 'cart', open: openPage },
    { name: 'drawer', context: 'dialog', open: openDrawer },
  ];

  for (const surface of SURFACES) {
    test.describe(surface.name, () => {
      test(`AC7 đổi số lượng: 1 event update context ${surface.context}, promise có cart`, async ({ page, cart }) => {
        cart.seed([1]);
        await surface.open(page, cart);
        const [key] = await lineKeys(page);
        await changeAndWait(page, key, '2');
        const list = await settled(page);
        expect(list).toHaveLength(1);
        expectLineEvent(list[0], 'update', surface.context, key, 2);
        expect(list[0].hasCart).toBe(true);
        expect(list[0].userErrors).toEqual([]);
      });

      test('AC7 xoá bằng Remove: 1 event remove, quantity 0, promise có cart', async ({ page, cart }) => {
        cart.seed([1, 1]);
        await surface.open(page, cart);
        const line = tid(page, 'cart-line').first();
        const key = (await line.getAttribute('data-line-key'))!;
        await line.getByTestId('cart-line-remove').click();
        await expect(tid(page, 'cart-line')).toHaveCount(1);
        await idle(page);
        const list = await settled(page);
        expect(list).toHaveLength(1);
        expectLineEvent(list[0], 'remove', surface.context, key, 0);
        expect(list[0].hasCart).toBe(true);
      });

      test('AC7 nhập 0: event remove', async ({ page, cart }) => {
        cart.seed([1]);
        await surface.open(page, cart);
        const [key] = await lineKeys(page);
        await changeAndWait(page, key, '0');
        const list = await settled(page);
        expect(list).toHaveLength(1);
        expectLineEvent(list[0], 'remove', surface.context, key, 0);
      });

      test('AC7 debounce: 3 lần đổi trong 300 ms chỉ 1 event, 1 POST', async ({ page, cart }) => {
        cart.seed([1]);
        await surface.open(page, cart);
        const [key] = await lineKeys(page);
        const response = page.waitForResponse((r) => r.url().includes(CART.change));
        await quantityOf(page, key).evaluate((el: HTMLInputElement) => {
          for (const value of ['2', '3', '2']) {
            el.value = value;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        await response;
        await idle(page);
        const list = await settled(page);
        expect(list).toHaveLength(1);
        expect(list[0].lines).toEqual([{ id: key, quantity: 2 }]);
        expect(cart.calls.change).toHaveLength(1);
      });

      test('AC7 ô trống: không event', async ({ page, cart }) => {
        cart.seed([2]);
        await surface.open(page, cart);
        const [key] = await lineKeys(page);
        await setQuantity(page, key, '');
        await expect(quantityOf(page, key)).toHaveValue('2');
        await page.waitForTimeout(500);
        expect(await entries(page)).toEqual([]);
      });

      test('AC7 mock 422: resolve cart null + userErrors, không reject', async ({ page, cart, guard }) => {
        guard.allowNetworkLog();
        cart.seed([1]);
        await surface.open(page, cart);
        const [key] = await lineKeys(page);
        cart.respond('change', { status: 422, json: { status: 422, message: 'Cart Error', description: MOCK_422 } });
        await changeAndWait(page, key, '99');
        await expect(tid(page, 'cart-items-error')).toHaveText(MOCK_422);
        const list = await settled(page);
        expect(list).toHaveLength(1);
        expectLineEvent(list[0], 'update', surface.context, key, 99);
        expect(list[0].hasCart).toBe(false);
        expect(list[0].userErrors).toEqual([{ message: MOCK_422 }]);
      });

      test('AC7 route.abort: resolve cart null + userErrors là data-label-error, 0 pageerror', async ({ page, cart, guard }) => {
        guard.allowNetworkLog();
        cart.seed([1]);
        await surface.open(page, cart);
        const [key] = await lineKeys(page);
        const message = await tid(page, 'cart-items').getAttribute('data-label-error');
        cart.respond('change', { abort: true });
        await setQuantity(page, key, '2');
        await expect(tid(page, 'cart-items-error')).toHaveText(message!);
        const list = await settled(page);
        expect(list).toHaveLength(1);
        expect(list[0].rejected).toBeUndefined();
        expect(list[0].hasCart).toBe(false);
        expect(list[0].userErrors).toEqual([{ message }]);
      });
    });
  }

  test('AC7 thư viện CDN lỗi: không event, đổi số lượng vẫn chạy', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    cart.seed([1]);
    await page.route(CDN, (route) => route.abort());
    await cart.goto('/cart');
    await expect(tid(page, 'cart-items')).toHaveAttribute('data-enhanced', '', { timeout: 15_000 });
    const [key] = await lineKeys(page);
    await changeAndWait(page, key, '2');
    expect(await entries(page)).toEqual([]);
    expect((await readCart(page)).items[0].quantity).toBe(2);
  });
});
