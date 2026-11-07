// Ticket ES1-T97 TE-5-BE2: assets/cart-items.js (docs/srs.md#TE-5 AC2, AC4; drafts/techlead/ES1-T89/task-split.md D8, D10, D11).
// ES1-T203: Cart API và partial mock trong bộ nhớ (support/cart-mock.ts), trang và JS thật, 0 request Cart API tới store. Luồng thật ở ES1-T203.spec.ts.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [EXPECT_CART_TYPE=page] npx playwright test tests/e2e/ES1-T97.spec.ts -g "AC2|AC4"
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type AjaxCart, type MockCart } from './support/cart-mock';
import { CART } from './support/cart-api';
import { lineKeys } from './support/cart-seed';
import { readCartJson } from './support/product-data';

type Surface = { name: string; open: (page: Page, cart: MockCart) => Promise<void> };

const PAGE_MODE = process.env.EXPECT_CART_TYPE === 'page';
const MOCK_422 = 'ES1-T97 mock: only 1 item available.';

const tid = (page: Page, id: string) => page.getByTestId(id);
const digits = (text: string | null) => (text ?? '').replace(/\D/g, '');
const readCart = (page: Page) => readCartJson<AjaxCart>(page);
const quantityOf = (page: Page, key: string) => page.locator(`[data-line-key="${key}"] [data-testid="cart-line-quantity"]`);
const stayed = (page: Page) => page.evaluate(() => (window as unknown as { __t97?: number }).__t97 === 1);

async function ready(page: Page) {
  await expect(tid(page, 'cart-items')).toHaveAttribute('data-enhanced', '', { timeout: 15_000 });
  await page.evaluate(() => {
    const w = window as unknown as { __t97: number; __t97Events: string[] };
    w.__t97 = 1;
    w.__t97Events = [];
    document.addEventListener('theme:cart:updated', (e) => w.__t97Events.push((e as CustomEvent).detail?.source));
  });
}

async function openPage(page: Page, cart: MockCart) {
  await cart.goto('/cart');
  await ready(page);
}

async function openDrawer(page: Page, cart: MockCart) {
  test.skip(PAGE_MODE, 'Preview đặt cart_type page: không có dialog');
  await cart.goto('/');
  await page.waitForFunction(() => !!customElements.get('cart-drawer'));
  await tid(page, 'header-cart-link').click();
  await expect(tid(page, 'cart-drawer-dialog')).toBeVisible();
  await expect(tid(page, 'cart-drawer-dialog')).not.toHaveAttribute('aria-busy', /.*/);
  await ready(page);
  // Refresh lúc mở drawer không tính vào phần test đếm.
  cart.calls.partial.length = 0;
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
  const state = await readCart(page);
  if (state.item_count > 0) expect(digits(await tid(page, 'cart-total').textContent())).toBe(String(state.total_price));
  if (state.item_count > 0) await expect(tid(page, 'header-cart-count')).toHaveText(String(state.item_count));
  else await expect(tid(page, 'header-cart-count')).toHaveCount(0);
  return state;
}

async function expectNoSeriousAxe(page: Page) {
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).include('[data-testid="cart-items"]').analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
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
    // Trần BE2 5120 B nâng lên 5632 B ở BE3 (ES1-T98, D10).
    expect(Buffer.byteLength(js), 'cart-items.js tối đa 5632 B').toBeLessThanOrEqual(5632);
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
      await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    test('AC2 đổi số lượng: tổng và cart-count theo /cart.js, không reload, giữ focus, aria-busy, status, event', async ({ page, cart }) => {
      cart.seed([1]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      await expect(tid(page, 'cart-update')).toBeHidden();
      await expect(tid(page, 'cart-items')).not.toHaveAttribute('aria-busy', /.*/);

      // Giữ POST để chắc chắn quan sát được trạng thái đang tải.
      const release = cart.hold('change');
      await setQuantity(page, key, '2');
      await expect(tid(page, 'cart-items')).toHaveAttribute('aria-busy', 'true');
      await expect(tid(page, 'cart-checkout')).toBeDisabled();
      release();
      await idle(page);

      const state = await expectTotals(page);
      expect(state.items[0].quantity).toBe(2);
      await expect(quantityOf(page, key)).toHaveValue('2');
      await expect(quantityOf(page, key)).toBeFocused();
      await expect(tid(page, 'cart-checkout')).toBeEnabled();
      expect(digits(await tid(page, 'cart-line-total').textContent())).toBe(String(state.items[0].final_line_price));
      await expect(tid(page, 'cart-items-status')).toHaveText((await label(page, 'updated'))!);
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
      expect(await stayed(page), 'không reload').toBe(true);
      expect(cart.calls.partial, '1 lần refresh partial').toHaveLength(1);
      expect(await events(page)).toEqual(['cart-items']);
      await expectNoSeriousAxe(page);
    });

    test('AC2 debounce: đổi liên tiếp trong 300 ms chỉ gửi 1 POST với số cuối', async ({ page, cart }) => {
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
      expect(cart.calls.change).toEqual([{ id: key, quantity: 2 }]);
      expect((await expectTotals(page)).items[0].quantity).toBe(2);
    });

    test('AC2 ghi tuần tự: 2 dòng đổi cùng lúc không chồng POST, đúng line key, 1 lần refresh', async ({ page, cart }) => {
      cart.seed([1, 1]);
      await surface.open(page, cart);
      const [a, b] = await lineKeys(page);
      const release = cart.hold('change');
      await setQuantity(page, a, '2');
      await setQuantity(page, b, '3');
      await expect.poll(() => cart.calls.change.length).toBe(1);
      // Quá debounce của dòng thứ 2 mà POST đầu chưa xong: không được có POST thứ 2.
      await page.waitForTimeout(500);
      expect(cart.calls.change).toHaveLength(1);
      release();
      await expect.poll(() => cart.calls.change.length).toBe(2);
      await idle(page);
      const state = await expectTotals(page);
      expect(state.items.find((i) => i.key === a)?.quantity).toBe(2);
      expect(state.items.find((i) => i.key === b)?.quantity).toBe(3);
      await expect(quantityOf(page, a)).toHaveValue('2');
      await expect(quantityOf(page, b)).toHaveValue('3');
      expect(cart.calls.partial, 'gộp 1 refresh cho cả hàng đợi').toHaveLength(1);
    });

    test('AC2 đổi trong lúc refresh: huỷ refresh cũ, kết quả theo lần đổi cuối, không lỗi', async ({ page, cart }) => {
      cart.seed([1]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      const release = cart.hold('partial');
      await setQuantity(page, key, '2');
      await expect.poll(() => cart.calls.partial.length).toBe(1);
      await changeAndWait(page, key, '3');
      release();
      expect(cart.calls.partial, 'refresh thứ 2 sau lần đổi cuối').toHaveLength(2);
      const state = await expectTotals(page);
      expect(state.items[0].quantity).toBe(3);
      await expect(quantityOf(page, key)).toHaveValue('3');
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
    });

    test('AC2 Enter trong ô số lượng không rời trang', async ({ page, cart }) => {
      cart.seed([1]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      const response = page.waitForResponse((r) => r.url().includes(CART.change));
      await quantityOf(page, key).fill('2');
      await quantityOf(page, key).press('Enter');
      await response;
      await idle(page);
      expect(await stayed(page), 'không submit form').toBe(true);
      expect((await expectTotals(page)).items[0].quantity).toBe(2);
    });

    test('AC2 ô để trống: về số cũ, không gửi POST', async ({ page, cart }) => {
      cart.seed([2]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      await setQuantity(page, key, '');
      await expect(quantityOf(page, key)).toHaveValue('2');
      await page.waitForTimeout(500);
      expect(cart.calls.change).toEqual([]);
    });

    test('AC2 xoá 1 trong 2 dòng: focus sang input dòng kế, tổng đúng, status', async ({ page, cart }) => {
      cart.seed([1, 1]);
      await surface.open(page, cart);
      const [a, b] = await lineKeys(page);
      const lines = tid(page, 'cart-line');
      const firstKey = await lines.first().getAttribute('data-line-key');
      const otherKey = firstKey === a ? b : a;
      await lines.first().getByTestId('cart-line-remove').click();
      await expect(lines).toHaveCount(1);
      await idle(page);
      await expect(quantityOf(page, otherKey)).toBeFocused();
      const state = await expectTotals(page);
      expect(state.items.map((i) => i.key)).toEqual([otherKey]);
      await expect(tid(page, 'cart-items-status')).toHaveText((await label(page, 'removed'))!);
      expect(await stayed(page), 'không điều hướng theo link Remove').toBe(true);
      await expectNoSeriousAxe(page);
    });

    test('AC2 xoá dòng cuối của danh sách khi còn dòng trước: focus về dòng trước', async ({ page, cart }) => {
      cart.seed([1, 1]);
      await surface.open(page, cart);
      const lines = tid(page, 'cart-line');
      const firstKey = await lines.first().getAttribute('data-line-key');
      await lines.last().getByTestId('cart-line-remove').click();
      await expect(lines).toHaveCount(1);
      await idle(page);
      await expect(quantityOf(page, firstKey!)).toBeFocused();
    });

    test('AC4 xoá dòng cuối: trạng thái rỗng, focus đúng, accelerated ẩn, cart-count mất', async ({ page, cart }) => {
      cart.seed([1]);
      await surface.open(page, cart);
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

    test('AC4 nhập 0 cũng xoá dòng, về trạng thái rỗng', async ({ page, cart }) => {
      cart.seed([1]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      await changeAndWait(page, key, '0');
      await expect(tid(page, 'cart-empty')).toBeVisible();
      expect((await expectTotals(page)).item_count).toBe(0);
    });

    test('AC2 mock 422: text API trong cart-items-error, input về số server, không refresh, không event', async ({ page, cart, guard }) => {
      guard.allowNetworkLog();
      cart.seed([1]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      cart.respond('change', { status: 422, json: { status: 422, message: 'Cart Error', description: MOCK_422 } });
      await changeAndWait(page, key, '99');
      await expect(tid(page, 'cart-items-error')).toHaveText(MOCK_422);
      await expect(quantityOf(page, key)).toHaveValue('1');
      await expect(quantityOf(page, key)).toBeFocused();
      await expect(tid(page, 'cart-items-status')).toBeEmpty();
      await expect(tid(page, 'cart-checkout')).toBeEnabled();
      expect(cart.calls.partial).toEqual([]);
      expect(await events(page)).toEqual([]);
      await expectNoSeriousAxe(page);
    });

    test('AC2 mock 200 giảm quantity: input theo server và có thông báo', async ({ page, cart }) => {
      cart.seed([2]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      // Giới hạn tồn trong giỏ mock: yêu cầu 5 nhưng server còn 2, partial và /cart.js đều theo số 2; apply giữ số 5 nên JS phải gán lại.
      cart.stock = 2;
      await changeAndWait(page, key, '5');
      await expect(quantityOf(page, key)).toHaveValue('2');
      await expect(tid(page, 'cart-items-status')).toHaveText((await label(page, 'quantity-adjusted'))!);
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
      await expect(quantityOf(page, key)).toBeFocused();
      expect((await expectTotals(page)).items[0].quantity).toBe(2);
    });

    test('AC2 route.abort: input về cũ, data-label-error, nút bật lại, đổi lại được', async ({ page, cart, guard }) => {
      guard.allowNetworkLog();
      cart.seed([1]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      cart.respond('change', { abort: true });
      await setQuantity(page, key, '2');
      await expect(tid(page, 'cart-items-error')).toHaveText((await label(page, 'error'))!);
      await idle(page);
      await expect(quantityOf(page, key)).toHaveValue('1');
      await expect(tid(page, 'cart-checkout')).toBeEnabled();
      expect(cart.calls.partial).toEqual([]);

      cart.reset('change');
      await changeAndWait(page, key, '2');
      await expect(tid(page, 'cart-items-error')).toBeEmpty();
      expect((await expectTotals(page)).items[0].quantity).toBe(2);
    });

    test('AC2 mock 500: input về cũ, data-label-error, Remove không đổi giỏ', async ({ page, cart, guard }) => {
      guard.allowNetworkLog();
      cart.seed([1]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      cart.respond('change', { status: 500, html: '<h1>500</h1>' });
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

    test('AC2 refresh partial lỗi: số lượng theo server, báo lỗi, hết busy', async ({ page, cart, guard }) => {
      guard.allowNetworkLog();
      cart.seed([1]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      cart.respond('partial', { abort: true });
      await changeAndWait(page, key, '2');
      await expect(tid(page, 'cart-items-error')).toHaveText((await label(page, 'error'))!);
      await expect(quantityOf(page, key)).toHaveValue('2');
      await expect(tid(page, 'cart-checkout')).toBeEnabled();
      expect((await readCart(page)).items[0].quantity).toBe(2);
    });

    test('AC2 POST chậm: vẫn busy trong lúc chờ, xong thì đúng số', async ({ page, cart }) => {
      cart.seed([1]);
      await surface.open(page, cart);
      const [key] = await lineKeys(page);
      cart.respond('change', { delayMs: 800, times: 1 });
      await setQuantity(page, key, '4');
      await expect(tid(page, 'cart-items')).toHaveAttribute('aria-busy', 'true');
      await idle(page);
      await expect(quantityOf(page, key)).toHaveValue('4');
      expect((await readCart(page)).items[0].quantity).toBe(4);
    });
  });
}

test.describe('ES1-T97 progressive enhancement', () => {
  test('AC2 script lỗi: không data-enhanced, nút Update còn, Remove vẫn là link', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    cart.seed([1]);
    await page.route('**/cart-items.js*', (route) => route.abort());
    await cart.goto('/cart');
    await expect(tid(page, 'cart-update')).toBeVisible();
    await expect(tid(page, 'cart-items')).not.toHaveAttribute('data-enhanced', /.*/);
    await expect(tid(page, 'cart-line-remove')).toHaveAttribute('href', /\/cart\/change/);
  });

  test('AC2 note ở /cart: đổi textarea không gửi POST và không bị hàng đợi đụng tới', async ({ page, cart }) => {
    cart.seed([1]);
    await openPage(page, cart);
    const [key] = await lineKeys(page);
    await tid(page, 'cart-page-note').fill('ES1-T97 note');
    await tid(page, 'cart-page-note').blur();
    await page.waitForTimeout(500);
    expect(cart.calls.change).toEqual([]);
    await changeAndWait(page, key, '2');
    await expect(tid(page, 'cart-page-note')).toHaveValue('ES1-T97 note');
  });
});
