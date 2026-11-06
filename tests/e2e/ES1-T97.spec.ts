// KHÔNG CHẮC: spec chưa chạy (phiên agent không mở được trình duyệt) → chờ CI.
// Ticket ES1-T97 TE-5-BE2: assets/cart-items.js (docs/srs.md#TE-5 AC2, AC4; drafts/techlead/ES1-T89/task-split.md D8, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [TE5_LIMITED_HANDLE=...] [EXPECT_CART_TYPE=page] npx playwright test tests/e2e/ES1-T97.spec.ts -g "AC2|AC4"
// Drawer: có assets/cart-drawer.js (ES1-T96) thì mở bằng cart link; chưa có thì showModal + import data-items-src, để spec chạy được theo cả 2 thứ tự merge.
import { test as base, expect, type Page, type Route } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { CART, CART_GLOB, cartApi } from './support/cart-api';
import { productData, readCartJson } from './support/product-data';

type CartItem = { key: string; quantity: number; final_line_price: number };
type Cart = { item_count: number; total_price: number; items: CartItem[] };
type Guard = { allowNetworkLog: () => void };
type Surface = { name: string; open: (page: Page) => Promise<void> };

const HANDLE = env('TE4_VARIANTS_HANDLE', 'TE4_SINGLE_HANDLE');
const LIMITED = env('TE5_LIMITED_HANDLE');
const PAGE_MODE = process.env.EXPECT_CART_TYPE === 'page';
const CHANGE = CART_GLOB.change;
const IGNORE_CONSOLE = /shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)|status of 429/i;
const NETWORK_LOG = /Failed to load resource/i;
const MOCK_422 = 'ES1-T97 mock: only 1 item available.';

const test = base.extend<{ guard: Guard }>({
  guard: [
    async ({ page }, use, info) => {
      const errors: string[] = [];
      let allowNetwork = false;
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        const source = msg.location().url;
        if (IGNORE_CONSOLE.test(text) || IGNORE_CONSOLE.test(source)) return;
        if (allowNetwork && NETWORK_LOG.test(text)) return;
        errors.push(`${text} @ ${source}`);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      await use({ allowNetworkLog: () => (allowNetwork = true) });
      if (info.status !== 'skipped') expect(errors, `console error:\n${errors.join('\n')}`).toEqual([]);
    },
    { auto: true },
  ],
});

const tid = (page: Page, id: string) => page.getByTestId(id);
const digits = (text: string | null) => (text ?? '').replace(/\D/g, '');
const readCart = (page: Page) => readCartJson<Cart>(page);
const quantityOf = (page: Page, key: string) => page.locator(`[data-line-key="${key}"] [data-testid="cart-line-quantity"]`);
const stayed = (page: Page) => page.evaluate(() => (window as unknown as { __t97?: number }).__t97 === 1);

// Thêm dòng cùng variant, khác property ẩn: mỗi dòng 1 line key riêng, không cần sản phẩm thứ 2 (D8).
async function seed(page: Page, quantities: number[], handle = HANDLE) {
  test.skip(!handle, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
  await page.goto(`/products/${handle}`);
  const variant = (await productData(page, handle!)).variants.find((v) => v.available);
  test.skip(!variant, `${handle} không có variant bán được`);
  const items = quantities.map((quantity, i) => ({ id: variant!.id, quantity, properties: { _t97: String(i) } }));
  const res = await cartApi(page, CART.add, { data: { items } });
  expect(res.ok(), `${CART.add} trả ${res.status()}`).toBeTruthy();
}

async function ready(page: Page) {
  await expect(tid(page, 'cart-items')).toHaveAttribute('data-enhanced', '', { timeout: 15_000 });
  await page.evaluate(() => {
    const w = window as unknown as { __t97: number; __t97Events: string[] };
    w.__t97 = 1;
    w.__t97Events = [];
    document.addEventListener('theme:cart:updated', (e) => w.__t97Events.push((e as CustomEvent).detail?.source));
  });
}

async function openPage(page: Page) {
  await page.goto('/cart');
  await ready(page);
}

async function openDrawer(page: Page) {
  test.skip(PAGE_MODE, 'Preview đặt cart_type page: không có dialog');
  await page.goto('/');
  if (await page.locator('script[src*="cart-drawer.js"]').count()) {
    await page.waitForFunction(() => !!customElements.get('cart-drawer'));
    await tid(page, 'header-cart-link').click();
    await expect(tid(page, 'cart-drawer-dialog')).toBeVisible();
    await expect(tid(page, 'cart-drawer-dialog')).not.toHaveAttribute('aria-busy', /.*/);
  } else {
    await page.evaluate(async () => {
      const root = document.querySelector('cart-drawer') as HTMLElement;
      root.querySelector('dialog')!.showModal();
      await import(root.dataset.itemsSrc!);
    });
  }
  await ready(page);
}

// fill không phát change với input number cho tới khi blur; phát tay để focus nằm yên trong ô.
async function setQuantity(page: Page, key: string, value: string) {
  const input = quantityOf(page, key);
  await input.fill(value);
  await input.evaluate((el) => el.dispatchEvent(new Event('change', { bubbles: true })));
}

const idle = (page: Page) => expect(tid(page, 'cart-items')).not.toHaveAttribute('aria-busy', /.*/);

// Chờ POST trả về rồi hết busy.
async function changeAndWait(page: Page, key: string, value: string) {
  const response = page.waitForResponse((r) => r.url().includes(CART.change));
  await setQuantity(page, key, value);
  await response;
  await idle(page);
}

async function expectTotals(page: Page) {
  const cart = await readCart(page);
  if (cart.item_count > 0) expect(digits(await tid(page, 'cart-total').textContent())).toBe(String(cart.total_price));
  if (cart.item_count > 0) await expect(tid(page, 'header-cart-count')).toHaveText(String(cart.item_count));
  else await expect(tid(page, 'header-cart-count')).toHaveCount(0);
  return cart;
}

async function expectNoSeriousAxe(page: Page) {
  const { violations } = await new AxeBuilder({ page }).include('[data-testid="cart-items"]').analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

// Partial fetch cùng pathname với trang (url: location.href), /cart.js và cart/change.js khác pathname.
function countRefreshes(page: Page) {
  const path = new URL(page.url()).pathname;
  const seen: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'fetch' && new URL(r.url()).pathname === path) seen.push(r.url());
  });
  return seen;
}

function countWrites(page: Page) {
  const seen: { id: string; quantity: number }[] = [];
  page.on('request', (r) => {
    if (r.url().includes(CART.change)) seen.push(r.postDataJSON());
  });
  return seen;
}

const events = (page: Page) => page.evaluate(() => (window as unknown as { __t97Events: string[] }).__t97Events);
const label = (page: Page, name: string) => tid(page, 'cart-items').getAttribute(`data-label-${name}`);

test.describe('ES1-T97 contract', () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

  test('AC2 AC4 contract: bundle, thẻ script, partial, hook khớp markup', () => {
    const js = read('assets/cart-items.js');
    const page = read('blocks/cart-page.liquid');
    const drawer = read('blocks/cart-drawer.liquid');
    const lines = read('snippets/cart-lines.liquid');
    expect(Buffer.byteLength(js), 'cart-items.js tối đa 5120 B').toBeLessThanOrEqual(5120);
    expect([...page.matchAll(/<script src="\{\{ 'cart-items\.js' \| asset_url \}\}" type="module"><\/script>/g)]).toHaveLength(1);
    // Drawer nạp động qua data-items-src (ES1-T96), không có thẻ script; literal để theme check kiểm được asset (ES1-T102).
    expect(drawer).not.toMatch(/<script src="\{\{ 'cart-items\.js'/);
    expect(drawer).toContain(`data-items-src="{{ 'cart-items.js' | asset_url }}"`);
    expect(drawer).not.toContain('items_asset');
    expect(page).toContain('data-partials="cart-page cart-count"');
    expect(page).toContain("{% partial 'cart-page' %}");
    expect(drawer).toContain('data-partials="cart-drawer cart-count"');
    expect(drawer).toContain("{% partial 'cart-drawer' %}");
    expect(read('blocks/header.liquid')).toContain("{% partial 'cart-count' %}");
    expect(js).toContain('partials.fetch(...this.dataset.partials.split(" "), { url: location.href, signal })');
    expect(js).toContain('customElements.define("cart-items"');
    expect(js).not.toMatch(/^import .*(\.js|\.\/)/m);
    for (const hook of ['data-line-key=', 'data-cart-remove', 'data-cart-update', 'name="updates[]"', 'class="cart-empty"']) {
      expect(lines, `thiếu ${hook}`).toContain(hook);
    }
    for (const block of [page, drawer]) {
      for (const hook of ['data-cart-change-url=', 'data-cart-url=', 'data-label-updated=', 'data-label-removed=', 'data-label-error=', 'data-label-quantity-adjusted=', 'data-item-count=', 'data-cart-accelerated', 'role="status"', 'role="alert"']) {
        expect(block, `thiếu ${hook}`).toContain(hook);
      }
    }
  });
});

const SURFACES: Surface[] = [
  { name: 'cart page', open: openPage },
  { name: 'drawer', open: openDrawer },
];

for (const surface of SURFACES) {
  test.describe(`ES1-T97 TE-5 ${surface.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await cartApi(page, CART.clear);
      await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    test('AC2 đổi số lượng: tổng và cart-count theo /cart.js, không reload, giữ focus, aria-busy, status, event', async ({ page }) => {
      await seed(page, [1]);
      await surface.open(page);
      const { items } = await readCart(page);
      const key = items[0].key;
      await expect(tid(page, 'cart-update')).toBeHidden();
      await expect(tid(page, 'cart-items')).not.toHaveAttribute('aria-busy', /.*/);
      const refreshes = countRefreshes(page);

      // Giữ POST để chắc chắn quan sát được trạng thái đang tải.
      let release = () => {};
      const held = new Promise<void>((r) => (release = r));
      await page.route(CHANGE, async (route: Route) => {
        await held;
        await route.continue();
      });
      await setQuantity(page, key, '2');
      await expect(tid(page, 'cart-items')).toHaveAttribute('aria-busy', 'true');
      await expect(tid(page, 'cart-checkout')).toBeDisabled();
      release();
      await idle(page);
      await page.unroute(CHANGE);

      const cart = await expectTotals(page);
      expect(cart.items[0].quantity).toBe(2);
      await expect(quantityOf(page, key)).toHaveValue('2');
      await expect(quantityOf(page, key)).toBeFocused();
      await expect(tid(page, 'cart-checkout')).toBeEnabled();
      expect(digits(await tid(page, 'cart-line-total').textContent())).toBe(String(cart.items[0].final_line_price));
      await expect(tid(page, 'cart-items-status')).toHaveText((await label(page, 'updated'))!);
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
      expect(await stayed(page), 'không reload').toBe(true);
      expect(refreshes, '1 lần refresh partial').toHaveLength(1);
      expect(await events(page)).toEqual(['cart-items']);
      await expectNoSeriousAxe(page);
    });

    test('AC2 debounce: đổi liên tiếp trong 300 ms chỉ gửi 1 POST với số cuối', async ({ page }) => {
      await seed(page, [1]);
      await surface.open(page);
      const key = (await readCart(page)).items[0].key;
      const writes = countWrites(page);
      const response = page.waitForResponse((r) => r.url().includes(CART.change));
      await quantityOf(page, key).evaluate((el: HTMLInputElement) => {
        for (const value of ['2', '3', '2']) {
          el.value = value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await response;
      await idle(page);
      expect(writes).toEqual([{ id: key, quantity: 2 }]);
      expect((await expectTotals(page)).items[0].quantity).toBe(2);
    });

    test('AC2 ghi tuần tự: 2 dòng đổi cùng lúc không chồng POST, đúng line key, 1 lần refresh', async ({ page }) => {
      await seed(page, [1, 1]);
      await surface.open(page);
      const [a, b] = (await readCart(page)).items.map((i) => i.key);
      const refreshes = countRefreshes(page);
      const writes = countWrites(page);
      let release = () => {};
      const held = new Promise<void>((r) => (release = r));
      let first = true;
      await page.route(CHANGE, async (route: Route) => {
        if (first) {
          first = false;
          await held;
        }
        await route.continue();
      });
      await setQuantity(page, a, '2');
      await setQuantity(page, b, '3');
      await expect.poll(() => writes.length).toBe(1);
      // Quá debounce của dòng thứ 2 mà POST đầu chưa xong: không được có POST thứ 2.
      await page.waitForTimeout(500);
      expect(writes).toHaveLength(1);
      release();
      await expect.poll(() => writes.length).toBe(2);
      await idle(page);
      await page.unroute(CHANGE);
      const cart = await expectTotals(page);
      expect(cart.items.find((i) => i.key === a)?.quantity).toBe(2);
      expect(cart.items.find((i) => i.key === b)?.quantity).toBe(3);
      await expect(quantityOf(page, a)).toHaveValue('2');
      await expect(quantityOf(page, b)).toHaveValue('3');
      expect(refreshes, 'gộp 1 refresh cho cả hàng đợi').toHaveLength(1);
    });

    test('AC2 đổi trong lúc refresh: huỷ refresh cũ, kết quả theo lần đổi cuối, không lỗi', async ({ page }) => {
      await seed(page, [1]);
      await surface.open(page);
      const key = (await readCart(page)).items[0].key;
      const path = new URL(page.url()).pathname;
      let release = () => {};
      const held = new Promise<void>((r) => (release = r));
      let count = 0;
      await page.route(
        (url) => url.pathname === path,
        async (route: Route) => {
          if (route.request().resourceType() !== 'fetch') return route.fallback();
          if (++count === 1) await held;
          await route.continue().catch(() => {});
        },
      );
      await setQuantity(page, key, '2');
      await expect.poll(() => count).toBe(1);
      await changeAndWait(page, key, '3');
      release();
      expect(count, 'refresh thứ 2 sau lần đổi cuối').toBe(2);
      const cart = await expectTotals(page);
      expect(cart.items[0].quantity).toBe(3);
      await expect(quantityOf(page, key)).toHaveValue('3');
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
    });

    test('AC2 Enter trong ô số lượng không rời trang', async ({ page }) => {
      await seed(page, [1]);
      await surface.open(page);
      const key = (await readCart(page)).items[0].key;
      const response = page.waitForResponse((r) => r.url().includes(CART.change));
      await quantityOf(page, key).fill('2');
      await quantityOf(page, key).press('Enter');
      await response;
      await idle(page);
      expect(await stayed(page), 'không submit form').toBe(true);
      expect((await expectTotals(page)).items[0].quantity).toBe(2);
    });

    test('AC2 ô để trống: về số cũ, không gửi POST', async ({ page }) => {
      await seed(page, [2]);
      await surface.open(page);
      const key = (await readCart(page)).items[0].key;
      const writes = countWrites(page);
      await setQuantity(page, key, '');
      await expect(quantityOf(page, key)).toHaveValue('2');
      expect(writes).toEqual([]);
    });

    test('AC2 xoá 1 trong 2 dòng: focus sang input dòng kế, tổng đúng, status', async ({ page }) => {
      await seed(page, [1, 1]);
      await surface.open(page);
      const [a, b] = (await readCart(page)).items.map((i) => i.key);
      const lines = tid(page, 'cart-line');
      const firstKey = await lines.first().getAttribute('data-line-key');
      const otherKey = firstKey === a ? b : a;
      await lines.first().getByTestId('cart-line-remove').click();
      await expect(lines).toHaveCount(1);
      await idle(page);
      await expect(quantityOf(page, otherKey)).toBeFocused();
      const cart = await expectTotals(page);
      expect(cart.items.map((i) => i.key)).toEqual([otherKey]);
      await expect(tid(page, 'cart-items-status')).toHaveText((await label(page, 'removed'))!);
      expect(await stayed(page), 'không điều hướng theo link Remove').toBe(true);
      await expectNoSeriousAxe(page);
    });

    test('AC2 xoá dòng cuối của danh sách khi còn dòng trước: focus về dòng trước', async ({ page }) => {
      await seed(page, [1, 1]);
      await surface.open(page);
      const lines = tid(page, 'cart-line');
      const firstKey = await lines.first().getAttribute('data-line-key');
      await lines.last().getByTestId('cart-line-remove').click();
      await expect(lines).toHaveCount(1);
      await idle(page);
      await expect(quantityOf(page, firstKey!)).toBeFocused();
    });

    test('AC4 xoá dòng cuối: trạng thái rỗng, focus đúng, accelerated ẩn, cart-count mất', async ({ page }) => {
      await seed(page, [1]);
      await surface.open(page);
      await tid(page, 'cart-line-remove').click();
      await expect(tid(page, 'cart-empty')).toBeVisible();
      await idle(page);
      await expect(tid(page, 'cart-empty-cta')).toBeVisible();
      await expect(tid(page, 'cart-checkout')).toHaveCount(0);
      await expect(surface.name === 'drawer' ? tid(page, 'cart-empty-cta') : tid(page, 'cart-page-heading')).toBeFocused();
      const accelerated = page.locator('[data-cart-accelerated]');
      if (await accelerated.count()) await expect(accelerated).toBeHidden();
      expect((await expectTotals(page)).item_count).toBe(0);
      await expect(tid(page, 'cart-items-status')).toHaveText((await label(page, 'removed'))!);
      expect(await stayed(page)).toBe(true);
      await expectNoSeriousAxe(page);
    });

    test('AC4 nhập 0 cũng xoá dòng, về trạng thái rỗng', async ({ page }) => {
      await seed(page, [1]);
      await surface.open(page);
      const key = (await readCart(page)).items[0].key;
      await changeAndWait(page, key, '0');
      await expect(tid(page, 'cart-empty')).toBeVisible();
      expect((await expectTotals(page)).item_count).toBe(0);
    });

    test('AC2 mock 422: text API trong cart-items-error, input về số server, không refresh, không event', async ({ page }) => {
      await seed(page, [1]);
      await surface.open(page);
      const key = (await readCart(page)).items[0].key;
      const refreshes = countRefreshes(page);
      await page.route(CHANGE, (route: Route) => route.fulfill({ status: 422, json: { status: 422, message: 'Cart Error', description: MOCK_422 } }));
      await changeAndWait(page, key, '99');
      await expect(tid(page, 'cart-items-error')).toHaveText(MOCK_422);
      await expect(quantityOf(page, key)).toHaveValue('1');
      await expect(quantityOf(page, key)).toBeFocused();
      await expect(tid(page, 'cart-items-status')).toBeEmpty();
      await expect(tid(page, 'cart-checkout')).toBeEnabled();
      expect(refreshes).toEqual([]);
      expect(await events(page)).toEqual([]);
      await expectNoSeriousAxe(page);
    });

    test('AC2 mock 200 giảm quantity: input theo server và có thông báo', async ({ page }) => {
      await seed(page, [2]);
      await surface.open(page);
      const cart = await readCart(page);
      const key = cart.items[0].key;
      // Response đúng bằng giỏ thật (số 2) dù yêu cầu 5: partial và /cart.js vẫn khớp, apply giữ số 5 nên JS phải gán lại.
      await page.route(CHANGE, (route: Route) => route.fulfill({ status: 200, json: cart }));
      await changeAndWait(page, key, '5');
      await expect(quantityOf(page, key)).toHaveValue('2');
      await expect(tid(page, 'cart-items-status')).toHaveText((await label(page, 'quantity-adjusted'))!);
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
      await expect(quantityOf(page, key)).toBeFocused();
    });

    test('AC2 route.abort: input về cũ, data-label-error, nút bật lại, đổi lại được', async ({ page, guard }) => {
      guard.allowNetworkLog();
      await seed(page, [1]);
      await surface.open(page);
      const key = (await readCart(page)).items[0].key;
      const refreshes = countRefreshes(page);
      await page.route(CHANGE, (route: Route) => route.abort());
      await setQuantity(page, key, '2');
      await expect(tid(page, 'cart-items-error')).toHaveText((await label(page, 'error'))!);
      await idle(page);
      await expect(quantityOf(page, key)).toHaveValue('1');
      await expect(tid(page, 'cart-checkout')).toBeEnabled();
      expect(refreshes).toEqual([]);

      await page.unroute(CHANGE);
      await changeAndWait(page, key, '2');
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
      expect((await expectTotals(page)).items[0].quantity).toBe(2);
    });

    test('AC2 mock 500: input về cũ, data-label-error, Remove không đổi giỏ', async ({ page, guard }) => {
      guard.allowNetworkLog();
      await seed(page, [1]);
      await surface.open(page);
      const key = (await readCart(page)).items[0].key;
      await page.route(CHANGE, (route: Route) => route.fulfill({ status: 500, contentType: 'text/html', body: '<h1>500</h1>' }));
      await changeAndWait(page, key, '2');
      await expect(tid(page, 'cart-items-error')).toHaveText((await label(page, 'error'))!);
      await expect(quantityOf(page, key)).toHaveValue('1');

      const response = page.waitForResponse((r) => r.url().includes(CART.change));
      await tid(page, 'cart-line-remove').click();
      await response;
      await idle(page);
      await expect(tid(page, 'cart-line')).toHaveCount(1);
      await expect(tid(page, 'cart-items-error')).toHaveText((await label(page, 'error'))!);
      expect(await stayed(page)).toBe(true);
      expect((await readCart(page)).item_count).toBe(1);
    });

    test('AC2 refresh partial lỗi: số lượng theo server, báo lỗi, hết busy', async ({ page, guard }) => {
      guard.allowNetworkLog();
      await seed(page, [1]);
      await surface.open(page);
      const key = (await readCart(page)).items[0].key;
      const path = new URL(page.url()).pathname;
      await page.route(
        (url) => url.pathname === path,
        (route: Route) => (route.request().resourceType() === 'fetch' ? route.abort() : route.fallback()),
      );
      await changeAndWait(page, key, '2');
      await expect(tid(page, 'cart-items-error')).toHaveText((await label(page, 'error'))!);
      await expect(quantityOf(page, key)).toHaveValue('2');
      await expect(tid(page, 'cart-checkout')).toBeEnabled();
      expect((await readCart(page)).items[0].quantity).toBe(2);
    });

    test('AC2 quá tồn thật trên store: input về số server, có thông báo', async ({ page }) => {
      test.skip(!LIMITED, 'Thiếu TE5_LIMITED_HANDLE (ES1-T91 #7): store dev chưa có sản phẩm giới hạn tồn; nhánh 422 và 200 giảm đã có test mock');
      await seed(page, [1], LIMITED);
      await surface.open(page);
      const key = (await readCart(page)).items[0].key;
      await changeAndWait(page, key, '9999');
      const cart = await expectTotals(page);
      const quantity = cart.items[0].quantity;
      expect(quantity).toBeLessThan(9999);
      await expect(quantityOf(page, key)).toHaveValue(String(quantity));
      const message = `${await tid(page, 'cart-items-error').textContent()}${await tid(page, 'cart-items-status').textContent()}`;
      expect(message.trim()).not.toBe('');
    });
  });
}

test.describe('ES1-T97 progressive enhancement', () => {
  test('AC2 script lỗi: không data-enhanced, nút Update còn, Remove vẫn là link', async ({ page, guard }) => {
    guard.allowNetworkLog();
    await seed(page, [1]);
    await page.route('**/cart-items.js*', (route: Route) => route.abort());
    await page.goto('/cart');
    await expect(tid(page, 'cart-update')).toBeVisible();
    await expect(tid(page, 'cart-items')).not.toHaveAttribute('data-enhanced', /.*/);
    await expect(tid(page, 'cart-line-remove')).toHaveAttribute('href', /\/cart\/change/);
  });

  test('AC2 note ở /cart: đổi textarea không gửi POST và không bị hàng đợi đụng tới', async ({ page }) => {
    await seed(page, [1]);
    await openPage(page);
    const key = (await readCart(page)).items[0].key;
    const writes = countWrites(page);
    await tid(page, 'cart-page-note').fill('ES1-T97 note');
    await tid(page, 'cart-page-note').blur();
    await page.waitForTimeout(500);
    expect(writes).toEqual([]);
    await changeAndWait(page, key, '2');
    await expect(tid(page, 'cart-page-note')).toHaveValue('ES1-T97 note');
  });
});
