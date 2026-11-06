// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt và preview; CTO 06/11: e2e tắt tới khi trang chủ xong).
// Ticket ES1-T149 TE-12-BE1: assets/bundle-form.js (docs/srs.md#TE-12 AC1, AC2, AC3, AC5, AC-H18, AC-H19, AC-H20; drafts/techlead/ES1-T141/task-split.md D4–D8, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T149.spec.ts -g "AC1|AC2|AC3|AC5"
// 3 nhóm: tĩnh; panel và hotspot (không gọi Cart API); thêm giỏ bằng cart-mock (0 request Cart API tới store); 1 luồng thật cho mỗi project (add thật, 422 thật).
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { CART, themeAdd } from './support/cart-api';
import { test as mockTest, type MockCart } from './support/cart-mock';
import { productData, readCartJson } from './support/product-data';
import { env } from './support/store-data';
import { expectStoreAllowed, gotoStore, watchStore, expectNotChallenged } from './support/store-guard';

const TE12 = '/?view=te12';
const JS_FILE = 'assets/bundle-form.js';
const MODULE = /\/bundle-form\.js/;
const CDN = /storefront\/standard-events\.js/;
const SOLD_OUT_HANDLE = env('TE4_SOLD_OUT_HANDLE');
const MOCK_NAME = "The product 'ES1-T149 mock' is already sold out.";

const bundle = (page: Page, container = 'container-te12-bundle') => page.getByTestId(container).getByTestId('bundle-builder');
const look = (page: Page, container = 'container-te12-look') => page.getByTestId(container).getByTestId('shop-the-look');
const available = (root: Locator) => root.locator('[data-testid="bundle-builder-input"]:not([disabled])');
const part = (root: Locator, name: string) => root.locator(`[data-testid="bundle-builder-${name}"], [data-testid="shop-the-look-${name}"]`);

// Module nạp khi gần viewport.
async function ready(root: Locator) {
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute('data-enhanced', '');
}

// Tính độc lập với JS của theme, cùng công thức Intl (task-split D8).
const money = (root: Locator, cents: number) =>
  root.evaluate((el: HTMLElement, value) => new Intl.NumberFormat(el.dataset.locale, { style: 'currency', currency: el.dataset.currency }).format(value / 100), cents);

const price = async (input: Locator) => Number(await input.getAttribute('data-price'));
const sum = async (inputs: Locator[]) => (await Promise.all(inputs.map(price))).reduce((a, b) => a + b, 0);

// Số tiền panel theo số món và percent. percent 0: không có dòng giảm.
async function expectTotals(root: Locator, subtotal: number, percent: number) {
  const discount = Math.round((subtotal * percent) / 100);
  await expect(part(root, 'subtotal')).toHaveText(await money(root, subtotal));
  await expect(part(root, 'total')).toHaveText(await money(root, subtotal - discount));
  const row = part(root, 'discount-row');
  if (!percent) {
    if (await row.count()) await expect(row).toBeHidden();
    return;
  }
  await expect(row).toBeVisible();
  await expect(row).toContainText(`${percent}%`);
  await expect(part(root, 'discount')).toHaveText(await money(root, discount));
}

async function expectNoSeriousAxe(page: Page, root: Locator) {
  const selector = `[data-testid="${await root.getAttribute('data-testid')}"]`;
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).include(selector).analyze();
  expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

type Recorded = {
  events: Array<{ action?: string; context?: string; lines?: Array<{ merchandiseId: string; quantity: number }>; target?: string; addSentBefore?: boolean; settled?: boolean; hasCart?: boolean; userErrors?: unknown[]; rejected?: string }>;
  updated: Array<{ source?: string; opener?: string }>;
};

// Listener capture trên document, không phụ thuộc thời điểm module nạp.
const record = (page: Page) =>
  page.addInitScript((addPath) => {
    const log: Recorded = { events: [], updated: [] };
    (window as unknown as { __t149: Recorded }).__t149 = log;
    document.addEventListener(
      'shopify:cart:lines-update',
      (e) => {
        const d = ((e as CustomEvent).detail?.lines ? (e as CustomEvent).detail : e) as Recorded['events'][number] & { promise?: Promise<{ cart?: unknown; userErrors?: unknown[] }> };
        const entry: Recorded['events'][number] = {
          action: d.action,
          context: d.context,
          lines: d.lines,
          target: (e.target as Element).tagName.toLowerCase(),
          addSentBefore: performance.getEntriesByType('resource').some((r) => r.name.includes(addPath)),
        };
        log.events.push(entry);
        Promise.resolve(d.promise).then(
          (r) => Object.assign(entry, { settled: true, hasCart: r?.cart != null, userErrors: r?.userErrors }),
          (err) => (entry.rejected = String(err)),
        );
      },
      true,
    );
    document.addEventListener('theme:cart:updated', (e) => {
      const { source, opener } = (e as CustomEvent).detail ?? {};
      log.updated.push({ source, opener: opener?.dataset?.testid });
    });
  }, CART.add);

const recorded = (page: Page) => page.evaluate(() => (window as unknown as { __t149: Recorded }).__t149);
const markPage = (page: Page) => page.evaluate(() => ((window as unknown as { __stay: number }).__stay = 1));
const stayed = (page: Page) => page.evaluate(() => (window as unknown as { __stay?: number }).__stay === 1);

test.describe('ES1-T149 tĩnh', () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'desktop', 'tĩnh, chạy 1 lần');
  });

  const js = readFileSync(JS_FILE, 'utf8');
  const builder = readFileSync('blocks/bundle-builder.liquid', 'utf8');
  const shop = readFileSync('blocks/shop-the-look.liquid', 'utf8');
  const row = readFileSync('blocks/shop-the-look-row.liquid', 'utf8');

  test('AC3 AC5 trần 5504 B, 1 file, không static import, không gọi actions, chỉ resolve', () => {
    expect(Buffer.byteLength(js)).toBeLessThanOrEqual(5504);
    expect(js).not.toMatch(/^import /m);
    expect(js).not.toMatch(/Shopify\.actions|\.reject\(|innerHTML|\.submit\(\)|prototype\.submit/);
    expect(js).toContain('import("https://cdn.shopify.com/storefront/standard-events.js")');
    expect(js).toContain('customElements.define("bundle-form"');
    expect(js.indexOf('this.emit(items)')).toBeLessThan(js.indexOf('cartAddUrl'));
  });

  test('AC2 request không có properties, attributes, discount', () => {
    expect(js).not.toMatch(/properties|attributes|discount_code|discounts/);
    expect(js).toContain('JSON.stringify({ items })');
  });

  test('AC5 2 block: data-lazy-module và thẻ script lazy-module đúng 1, không nạp thẳng bundle-form.js', () => {
    for (const block of [builder, shop]) {
      expect(block.match(/data-lazy-module="\{\{ 'bundle-form\.js' \| asset_url \}\}"/g)).toHaveLength(1);
      expect(block.match(/<script src="\{\{ 'lazy-module\.js' \| asset_url \}\}" type="module"><\/script>/g)).toHaveLength(1);
      expect(block).not.toMatch(/<script[^>]*bundle-form/);
    }
  });

  test('AC1 AC5 hook JS khớp markup', () => {
    for (const hook of ['count', 'subtotal', 'total', 'discount-row', 'discount-label', 'discount', 'submit', 'status', 'error']) {
      expect(js).toContain(`("${hook}"`);
      for (const block of [builder, shop]) expect(block).toContain(`data-bundle-${hook}`);
    }
    for (const hook of ['lines', 'line-template', 'empty', 'progress', 'progress-text']) {
      expect(js).toContain(`("${hook}"`);
      expect(builder).toContain(`data-bundle-${hook}`);
    }
    for (const hook of ['line-title', 'line-price']) {
      expect(js).toContain(`("${hook}"`);
      expect(builder).toContain(`data-bundle-${hook}`);
    }
    for (const hook of ['data-hotspot', 'aria-pressed']) expect(shop).toContain(hook);
    for (const hook of ['data-look-row', 'data-look-active', 'data-bundle-item']) expect(row).toContain(hook);
  });
});

test.describe('ES1-T149 panel', () => {
  let finish: () => Promise<void>;

  test.beforeEach(async ({ page }) => {
    finish = watchStore(page).finish;
  });

  test.afterEach(async ({}, info) => {
    if (info.status !== 'skipped') await finish();
  });

  test('AC1 AC-H18 chọn 1, 2, 3 món rồi bỏ: danh sách, số món, tiền, dòng giảm, progress theo bậc 2:10, 3:15', async ({ page }) => {
    await gotoStore(page, TE12);
    const root = bundle(page);
    await ready(root);
    const inputs = await available(root).all();
    test.skip(inputs.length < 3, 'Collection cần ít nhất 3 sản phẩm còn hàng');
    const [a, b, c] = inputs;

    await expect(part(root, 'count')).toHaveText('0 Items');
    await expect(part(root, 'empty')).toBeVisible();
    await expect(part(root, 'line')).toHaveCount(0);
    await expect(part(root, 'progress-text')).toHaveText('Add 2 more items to unlock 10% off');
    await expectTotals(root, 0, 0);

    await a.check();
    await expect(part(root, 'count')).toHaveText('1 Item');
    await expect(part(root, 'empty')).toBeHidden();
    await expect(part(root, 'line')).toHaveCount(1);
    await expect(part(root, 'line').first()).toContainText((await a.getAttribute('data-title'))!);
    await expect(part(root, 'line').first()).toContainText(await money(root, await price(a)));
    await expect(part(root, 'progress-text')).toHaveText('Add 1 more item to unlock 10% off');
    await expectTotals(root, await sum([a]), 0);

    await b.check();
    await expect(part(root, 'count')).toHaveText('2 Items');
    await expect(part(root, 'line')).toHaveCount(2);
    await expect(part(root, 'progress-text')).toHaveText('Add 1 more item to unlock 15% off');
    await expectTotals(root, await sum([a, b]), 10);

    await c.check();
    await expect(part(root, 'count')).toHaveText('3 Items');
    await expect(part(root, 'progress-text')).toHaveText('You reached 15% off');
    await expectTotals(root, await sum([a, b, c]), 15);
    const progress = () => part(root, 'progress').evaluate((el: HTMLElement) => el.style.getPropertyValue('--bundle-progress'));
    expect(await progress()).toBe('100%');
    await expect(part(root, 'note')).toBeVisible();
    await expectNoSeriousAxe(page, root);

    await c.uncheck();
    await b.uncheck();
    await a.uncheck();
    await expect(part(root, 'empty')).toBeVisible();
    await expect(part(root, 'line')).toHaveCount(0);
    await expectTotals(root, 0, 0);
    expect(await progress()).toBe('0%');
  });

  test('AC1 bundle không bậc: không có dòng giảm, total bằng subtotal', async ({ page }) => {
    await gotoStore(page, TE12);
    const root = bundle(page, 'container-te12-bundle-no-tiers');
    await ready(root);
    const inputs = await available(root).all();
    test.skip(inputs.length < 2, 'Collection cần ít nhất 2 sản phẩm còn hàng');
    await inputs[0].check();
    await inputs[1].check();
    await expect(part(root, 'discount-row')).toHaveCount(0);
    await expect(part(root, 'progress')).toHaveCount(0);
    await expectTotals(root, await sum(inputs.slice(0, 2)), 0);
  });

  test('AC1 tick trước khi module nạp (chặn file rồi thả): panel vẫn đúng', async ({ page }) => {
    let release = () => {};
    const hold = new Promise<void>((resolve) => { release = resolve; });
    await page.route(MODULE, async (route) => {
      await hold;
      await route.continue();
    });
    await gotoStore(page, TE12);
    const root = bundle(page);
    await root.scrollIntoViewIfNeeded();
    const inputs = await available(root).all();
    test.skip(inputs.length < 2, 'Collection cần ít nhất 2 sản phẩm còn hàng');
    await inputs[0].check();
    await inputs[1].check();
    expect(await root.getAttribute('data-enhanced')).toBeNull();
    await expect(part(root, 'total')).toBeHidden();

    release();
    await ready(root);
    await expect(part(root, 'count')).toHaveText('2 Items');
    await expect(part(root, 'line')).toHaveCount(2);
    await expectTotals(root, await sum(inputs.slice(0, 2)), 10);
  });

  test('AC1 không tải bundle-form.js khi block còn xa viewport', async ({ page }) => {
    // Chèn style trước khi lazy-module chạy: module script chạy sau khi readyState thành interactive. Không dùng route.fetch (ES1-T171).
    await page.addInitScript(() => {
      document.addEventListener('readystatechange', () => {
        if (document.readyState !== 'interactive') return;
        const style = document.createElement('style');
        style.textContent = 'bundle-form{margin-block-start:400vh}';
        document.head.append(style);
      });
    });
    const requested: string[] = [];
    page.on('request', (r) => {
      if (MODULE.test(r.url())) requested.push(r.url());
    });
    await gotoStore(page, TE12);
    await page.waitForLoadState('load');
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
    expect(requested).toEqual([]);
    expect(await bundle(page).getAttribute('data-enhanced')).toBeNull();

    await ready(bundle(page));
    expect(requested).toHaveLength(1);
  });

  test('AC1 live region: báo 1 lần sau debounce, không cướp focus', async ({ page }) => {
    await gotoStore(page, TE12);
    const root = bundle(page);
    await ready(root);
    const inputs = await available(root).all();
    test.skip(inputs.length < 3, 'Collection cần ít nhất 3 sản phẩm còn hàng');
    await expect(part(root, 'status')).toBeEmpty();

    const writes = await root.evaluate(async (el) => {
      const status = el.querySelector('[data-bundle-status]')!;
      let count = 0;
      const mo = new MutationObserver(() => count++);
      mo.observe(status, { childList: true, characterData: true, subtree: true });
      const boxes = [...el.querySelectorAll<HTMLInputElement>('[data-bundle-item]:not([disabled])')].slice(0, 3);
      boxes[2].focus();
      for (const box of boxes) box.click();
      await new Promise((r) => setTimeout(r, 700));
      mo.disconnect();
      return { count, focused: document.activeElement === boxes[2] };
    });
    expect(writes).toEqual({ count: 1, focused: true });
    const subtotal = await sum(inputs.slice(0, 3));
    await expect(part(root, 'status')).toHaveText(`3 selected, total ${await money(root, subtotal - Math.round((subtotal * 15) / 100))}`);
  });

  test('AC5 AC-H19 shop the look: số món và tổng từ input còn hàng, bậc 4:10; row hết hàng không tính', async ({ page }) => {
    await gotoStore(page, TE12);
    const root = look(page);
    await ready(root);
    const inputs = await root.getByTestId('shop-the-look-row-input').all();
    test.skip(inputs.length === 0, 'Store dev thiếu sản phẩm trong store-data.json');
    await expect(part(root, 'count')).toHaveText(inputs.length === 1 ? '1 item' : `${inputs.length} items`);
    await expectTotals(root, await sum(inputs), inputs.length >= 4 ? 10 : 0);
    await expect(root.locator('[data-bundle-empty], [data-bundle-progress]')).toHaveCount(0);
    await expectNoSeriousAxe(page, root);
  });

  test('AC5 AC-H19 không bậc: không có dòng giảm; chỉ row hết hàng: tổng 0', async ({ page }) => {
    await gotoStore(page, TE12);
    const partial = look(page, 'container-te12-look-partial');
    await ready(partial);
    const inputs = await partial.getByTestId('shop-the-look-row-input').all();
    await expect(part(partial, 'discount-row')).toHaveCount(0);
    await expectTotals(partial, await sum(inputs), 0);

    const soldOut = look(page, 'container-te12-look-sold-out');
    test.skip((await soldOut.count()) === 0, 'Store dev thiếu sản phẩm TE4_SOLD_OUT_HANDLE');
    await expect(soldOut).toHaveAttribute('data-enhanced', '');
    await expect(part(soldOut, 'count')).toHaveText('0 items');
  });

  test('AC-H20 hover, focus, bấm hotspot đổi viền row; bấm row đổi hotspot', async ({ page }) => {
    await gotoStore(page, TE12);
    const root = look(page);
    await ready(root);
    const spot = (n: number) => root.locator(`[data-hotspot="${n}"]`);
    const row = (n: number) => root.locator(`[data-look-row="${n}"]`);
    const activeRows = () => root.locator('[data-look-row][data-look-active]').evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.lookRow));
    const pressed = () => root.locator('[data-hotspot][aria-pressed="true"]').evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.hotspot));
    test.skip((await spot(1).count()) === 0 || (await row(4).count()) === 0, 'Store dev thiếu ảnh hoặc row');

    expect(await activeRows()).toEqual(['1']);
    expect(await pressed()).toEqual(['1']);

    await spot(2).click();
    expect(await activeRows()).toEqual(['2']);
    expect(await pressed()).toEqual(['2']);

    // Hover, focus chỉ đổi viền row, không đổi hotspot đang chọn; rời đi viền giữ nguyên (lệch ghi trong PR: trần 5504 B).
    await spot(3).hover();
    expect(await activeRows()).toEqual(['3']);
    expect(await pressed()).toEqual(['2']);

    await spot(4).focus();
    expect(await activeRows()).toEqual(['4']);
    expect(await pressed()).toEqual(['2']);

    await row(3).locator('.shop-the-look-row__thumb').click();
    expect(await activeRows()).toEqual(['3']);
    expect(await pressed()).toEqual(['3']);
    await expectNoSeriousAxe(page, root);
  });
});

mockTest.describe('ES1-T149 thêm giỏ (mock)', () => {
  mockTest.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await record(page);
  });

  const skipDrawerAbsent = async (page: Page) => {
    mockTest.skip((await page.getByTestId('cart-drawer-dialog').count()) === 0, 'Preview đặt cart_type page: không có dialog');
  };

  async function open(page: Page, cart: MockCart, picks = 2) {
    await cart.goto(TE12);
    const root = bundle(page);
    await ready(root);
    const inputs = await available(root).all();
    mockTest.skip(inputs.length < picks, `Collection cần ít nhất ${picks} sản phẩm còn hàng`);
    const chosen = inputs.slice(0, picks);
    for (const input of chosen) await input.check();
    await markPage(page);
    const ids = await Promise.all(chosen.map(async (input) => Number(await input.getAttribute('value'))));
    return { root, submit: part(root, 'submit'), ids, chosen };
  }

  mockTest('AC3 AC2 đúng 1 POST, body chỉ có items id và quantity; drawer mở; đúng 1 event đủ lines; giữ lựa chọn', async ({ page, cart }) => {
    const { root, submit, ids, chosen } = await open(page, cart);
    await skipDrawerAbsent(page);
    await submit.click();

    const dialog = page.getByTestId('cart-drawer-dialog');
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((el) => el.matches(':modal'))).toBe(true);
    expect(cart.calls.add).toEqual([{ items: ids.map((id) => ({ id, quantity: 1 })) }]);
    await expect(page.getByTestId('header-cart-count')).toHaveText(String(ids.length));
    expect(await stayed(page)).toBe(true);

    const log = await recorded(page);
    expect(log.events).toHaveLength(1);
    expect(log.events[0]).toMatchObject({ action: 'add', context: 'product', target: 'bundle-form', addSentBefore: false });
    expect(log.events[0].lines).toEqual(ids.map((id) => ({ merchandiseId: `gid://shopify/ProductVariant/${id}`, quantity: 1 })));
    expect(log.updated).toEqual([{ source: 'bundle-form', opener: 'bundle-builder-submit' }]);
    await expect.poll(async () => (await recorded(page)).events[0].settled).toBe(true);
    expect((await recorded(page)).events[0].rejected).toBeUndefined();

    for (const input of chosen) await expect(input).toBeChecked();
    await expect(submit).toBeEnabled();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(root).toHaveAttribute('data-enhanced', '');
  });

  mockTest('AC5 shop the look: gửi mọi input còn hàng, id trùng gộp quantity, event cùng số lượng', async ({ page, cart }) => {
    await cart.goto(TE12);
    const root = look(page);
    await ready(root);
    await skipDrawerAbsent(page);
    const inputs = root.getByTestId('shop-the-look-row-input');
    mockTest.skip((await inputs.count()) < 2, 'Store dev thiếu sản phẩm trong store-data.json');
    await inputs.evaluateAll((els) => {
      (els[1] as HTMLInputElement).value = (els[0] as HTMLInputElement).value;
    });
    const values = await inputs.evaluateAll((els) => els.map((el) => Number((el as HTMLInputElement).value)));
    const counted = new Map<number, number>();
    for (const value of values) counted.set(value, (counted.get(value) ?? 0) + 1);
    const items = [...counted].map(([id, quantity]) => ({ id, quantity }));

    await part(root, 'submit').click();
    await expect(page.getByTestId('cart-drawer-dialog')).toBeVisible();
    expect(cart.calls.add).toEqual([{ items }]);
    const log = await recorded(page);
    expect(log.events[0].lines).toEqual(items.map(({ id, quantity }) => ({ merchandiseId: `gid://shopify/ProductVariant/${id}`, quantity })));
    expect(log.events[0].target).toBe('bundle-form');
  });

  mockTest('AC3 flip data-cart-type page thì sang trang giỏ', async ({ page, cart }) => {
    await cart.stubCartDocument();
    const { root, submit } = await open(page, cart, 1);
    await root.evaluate((el: HTMLElement) => (el.dataset.cartType = 'page'));
    await submit.click();
    await page.waitForURL(/\/cart\/?$/);
    expect(cart.calls.add).toHaveLength(1);
  });

  mockTest('AC3 không có thư viện event: bỏ event, vẫn thêm giỏ', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    await page.route(CDN, (route) => route.abort());
    const { submit, ids } = await open(page, cart, 1);
    await skipDrawerAbsent(page);
    await submit.click();
    await expect(page.getByTestId('cart-drawer-dialog')).toBeVisible();
    expect(cart.calls.add).toEqual([{ items: [{ id: ids[0], quantity: 1 }] }]);
    expect((await recorded(page)).events).toHaveLength(0);
  });

  mockTest('AC3 mock 422 có tên: hiện nguyên description, drawer không mở, nút bật lại, event resolve với userErrors', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    const { root, submit } = await open(page, cart);
    cart.respond('add', { status: 422, json: { status: 422, message: 'Cart Error', description: MOCK_NAME }, times: 1 });
    await submit.click();
    await expect(part(root, 'error')).toHaveText(MOCK_NAME);
    await expect(part(root, 'error')).toHaveAttribute('role', 'alert');
    await expect(page.getByTestId('cart-drawer-dialog')).toBeHidden();
    await expect(submit).toBeEnabled();
    await expect(submit).not.toHaveAttribute('aria-busy', /.*/);
    expect(await stayed(page)).toBe(true);
    const log = await recorded(page);
    expect(log.updated).toEqual([]);
    await expect.poll(async () => (await recorded(page)).events[0].userErrors).toEqual([{ message: MOCK_NAME }]);
    expect((await recorded(page)).events[0].rejected).toBeUndefined();
    await expectNoSeriousAxe(page, root);
  });

  for (const [name, behaviour] of [
    ['route.abort', { abort: true, times: 1 }],
    ['500 không JSON', { status: 500, html: '<h1>Server error</h1>', times: 1 }],
    ['503 có description', { status: 503, json: { description: 'Không hiện chuỗi này' }, times: 1 }],
    ['4xx không có description', { status: 400, json: { status: 400 }, times: 1 }],
  ] as const) {
    mockTest(`AC3 ${name}: alert data-label-error, không reload, không có request thứ 2`, async ({ page, cart, guard }) => {
      guard.allowNetworkLog();
      const { root, submit } = await open(page, cart);
      cart.respond('add', behaviour);
      await submit.click();
      await expect(part(root, 'error')).toHaveText((await root.getAttribute('data-label-error'))!);
      await expect(submit).toBeEnabled();
      await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
      expect(cart.calls.add).toHaveLength(1);
      expect(await stayed(page)).toBe(true);
      await expect(page.getByTestId('cart-drawer-dialog')).toBeHidden();
      expect((await recorded(page)).updated).toEqual([]);
      expect((await recorded(page)).events[0]?.rejected).toBeUndefined();
    });
  }

  mockTest('AC3 đang gửi: nút disabled, aria-busy, gửi lại không thêm request; lỗi lần trước bị xoá', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    const { root, submit } = await open(page, cart);
    cart.respond('add', { status: 422, json: { description: MOCK_NAME }, times: 1 });
    await submit.click();
    await expect(part(root, 'error')).toHaveText(MOCK_NAME);
    await expect.poll(async () => (await recorded(page)).events[0]?.settled).toBe(true);

    const release = cart.hold('add');
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await expect(part(root, 'error')).toBeEmpty();
    await root.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit());
    await expect.poll(() => cart.calls.add.length).toBe(2);
    release();
    await expect(submit).toBeEnabled();
    await expect(submit).not.toHaveAttribute('aria-busy', /.*/);
    expect(cart.calls.add).toHaveLength(2);
  });

  mockTest('AC3 chưa chọn món: Enter trong form không gửi, không rời trang', async ({ page, cart }) => {
    await cart.goto(TE12);
    const root = bundle(page);
    await ready(root);
    await markPage(page);
    await root.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit());
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    expect(cart.calls.add).toHaveLength(0);
    expect(await stayed(page)).toBe(true);
    expect((await recorded(page)).events).toHaveLength(0);
  });
});

test.describe.serial('ES1-T149 luồng thật', () => {
  test.describe.configure({ retries: 0 });

  type RealCart = { item_count: number; items: Array<{ variant_id: number; quantity: number; original_price: number; final_price: number; discounts: unknown[]; properties: unknown }> };

  test('AC3 AC2 add thật: /cart.js đủ món, giá gốc, drawer, cart-count, event resolve có cart', async ({ page }) => {
    const watch = watchStore(page);
    await record(page);
    const reopen = async () => {
      await gotoStore(page, TE12);
      await ready(bundle(page));
    };
    await reopen();
    const root = bundle(page);
    const count = await available(root).count();
    test.skip(count < 2, 'Collection cần ít nhất 2 sản phẩm còn hàng');
    test.skip((await page.getByTestId('cart-drawer-dialog').count()) === 0, 'Preview đặt cart_type page: không có dialog');
    const pick = async () => {
      await available(root).nth(0).check();
      await available(root).nth(1).check();
    };
    await pick();
    const inputs = [available(root).nth(0), available(root).nth(1)];
    const ids = await Promise.all(inputs.map(async (i) => Number(await i.getAttribute('value'))));
    const prices = await Promise.all(inputs.map(price));

    await themeAdd(page, () => part(root, 'submit').click(), async () => {
      await reopen();
      await pick();
    });

    await expect(page.getByTestId('cart-drawer-dialog')).toBeVisible();
    const cart = await readCartJson<RealCart>(page);
    expect(cart.item_count).toBe(2);
    await expect(page.getByTestId('header-cart-count')).toHaveText('2');
    for (const [index, id] of ids.entries()) {
      const line = cart.items.find((i) => i.variant_id === id);
      expect(line, `giỏ có variant ${id}`).toBeTruthy();
      expect(line!.quantity).toBe(1);
      expect(line!.original_price, 'theme không đổi giá').toBe(prices[index]);
      expect(Object.keys((line!.properties ?? {}) as object)).toEqual([]);
      if (!line!.discounts.length) expect(line!.final_price, 'store chưa có discount: theme không tự trừ').toBe(prices[index]);
    }
    await expect.poll(async () => (await recorded(page)).events[0]?.settled).toBe(true);
    const log = await recorded(page);
    expect(log.events).toHaveLength(1);
    expect(log.events[0].hasCart, 'promise resolve có cart').toBe(true);
    expect(log.events[0].rejected).toBeUndefined();
    await watch.finish();
  });

  test('AC3 422 thật: kèm variant hết hàng, /cart.js không đổi, alert hiện description', async ({ page }) => {
    test.skip(!SOLD_OUT_HANDLE, 'Thiếu TE4_SOLD_OUT_HANDLE');
    const watch = watchStore(page);
    watch.allowNetworkLog();
    await record(page);
    await gotoStore(page, TE12);
    const root = bundle(page);
    await ready(root);
    test.skip((await available(root).count()) < 2, 'Collection cần ít nhất 2 sản phẩm còn hàng');
    const soldOut = (await productData(page, SOLD_OUT_HANDLE!)).variants[0].id;
    await available(root).nth(0).check();
    await available(root).nth(1).check();
    // DoD ES1-T149: giả lập món hết hàng lọt qua UI. Không chắc collection có sản phẩm hết hàng nên đổi value, kết quả với API như nhau.
    await available(root).nth(1).evaluate((el: HTMLInputElement, id) => (el.value = String(id)), soldOut);
    const before = await readCartJson<RealCart>(page);

    const response = page.waitForResponse((r) => r.url().includes(CART.add) && r.request().method() === 'POST');
    await part(root, 'submit').click();
    const res = await response;
    expectStoreAllowed(res);
    expect(res.status()).toBe(422);
    const { description } = (await res.json()) as { description: string };
    expect(description).toBeTruthy();
    await expect(part(root, 'error')).toHaveText(description);

    const after = await readCartJson<RealCart>(page);
    expect(after.item_count, 'giỏ có thêm món: AC3 không đạt bằng API này, dừng và báo Tech Lead (D7)').toBe(before.item_count);
    await expect(page.getByTestId('cart-drawer-dialog')).toBeHidden();
    expect((await recorded(page)).updated).toEqual([]);
    await expectNoSeriousAxe(page, root);
    await watch.finish();
  });
});
