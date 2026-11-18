// ES1-T370 TE-5-R2-BE1: assets/cart-items.js — stepper debounce, quantity rule (−/+ khoá, ô sai aria-invalid không gửi),
// 422 về số server + live region, ghi chú drawer lưu khi rời ô và giữ chữ khi refresh, "Updating cart…" + Checkout aria-disabled,
// dòng đang ghi aria-busy + −/+/xoá aria-disabled; assets/cart-checkout-bar.js (<cart-checkout-bar>, ES1-T490 B): thanh checkout
// dính html[data-bottom-bar="cart"] (docs/srs.md#TE-5 AC2, AC5, AC8, AC9; AC11, AC17, AC18 phần JS; ADR 0007 #2, ADR 0010).
// Tĩnh: đọc file. Hành vi: origin giả https://t370.test, mọi request qua page.route, JS thật, thư viện partial giả qua
// importmap (apply thay danh sách dòng bằng HTML server: stepper lại hidden như Liquid). Không gọi store, không cần B2B
// (quantity rule dựng đúng hook snippets/cart-lines.liquid). Luồng store thật: ES1-T97 (mock), ES1-T99 (QA).
// Chạy: npx playwright test tests/e2e/ES1-T370.spec.ts
import { test, expect, type Page, type Route } from './support/test';
import { readFileSync } from 'node:fs';
import { CART } from './support/cart-api';
import { watchShopPay403 } from './support/console-guard';

const read = (path: string) => readFileSync(path, 'utf8');
const JS = read('assets/cart-items.js');
const BAR = read('assets/cart-checkout-bar.js');
const PAGE = read('blocks/cart-page.liquid');
const DRAWER = read('blocks/cart-drawer.liquid');
const LINES = read('snippets/cart-lines.liquid');
const SUMMARY = read('snippets/cart-summary.liquid');

const ORIGIN = 'https://t370.test';
const CDN = 'https://cdn.shopify.com/storefront/standard-events.js';
const UPDATING = 'Updating cart…';
const LABELS = {
  updated: 'Cart updated.',
  removed: 'Item removed from cart.',
  error: 'Something went wrong.',
  adjusted: 'Quantity changed to the amount available.',
};

type Line = { key: string; quantity: number; min?: number; max?: number; step?: number };
type Behaviour = { status: number; json: unknown } | { hold: Promise<void> };

// Dòng theo hook snippets/cart-lines.liquid: −/+ render hidden, − aria-disabled ở min, + ở max; rule → step/max, aria-describedby, data-quantity-*.
function lineHtml(line: Line, index: number) {
  const id = `q${index + 1}`;
  const rule = line.min !== undefined;
  const min = line.min ?? 1;
  const ruleAttrs = rule
    ? `step="${line.step}" ${line.max ? `max="${line.max}"` : ''} aria-describedby="${id}-rule" data-quantity-rule data-quantity-min="${min}" data-quantity-max="${line.max ?? ''}" data-quantity-step="${line.step}"`
    : '';
  return `<li class="cart-line" data-line-key="${line.key}" data-testid="cart-line">
    <a class="cart-line__title" href="/products/${line.key}" data-testid="cart-line-title">Product ${line.key}</a>
    ${rule ? `<p id="${id}-rule" data-testid="cart-line-quantity-rule"><span>Min ${min}</span><span>Increments of ${line.step}</span></p>` : ''}
    <label for="${id}">Quantity for Product ${line.key}</label>
    <button type="button" aria-label="Decrease quantity for Product ${line.key}" aria-controls="${id}" ${line.quantity <= min ? 'aria-disabled="true"' : ''} data-cart-step="-1" data-testid="cart-line-decrease" hidden>-</button>
    <input id="${id}" type="number" name="updates[]" value="${line.quantity}" min="0" ${ruleAttrs} inputmode="numeric" form="cart-form" data-testid="cart-line-quantity">
    <button type="button" aria-label="Increase quantity for Product ${line.key}" aria-controls="${id}" ${line.max && line.quantity >= line.max ? 'aria-disabled="true"' : ''} data-cart-step="1" data-testid="cart-line-increase" hidden>+</button>
    <a href="/cart/change?id=${line.key}&amp;quantity=0" aria-label="Remove Product ${line.key}" data-cart-remove data-testid="cart-line-remove">Remove</a>
    <p id="${id}-error" data-cart-line-error data-testid="cart-line-error" hidden><svg aria-hidden="true"></svg><span data-cart-line-error-text>${rule ? `Enter a multiple of ${line.step} from ${min}${line.max ? ` to ${line.max}` : ''}.` : ''}</span></p>
  </li>`;
}

// Rút gọn blocks/cart-page.liquid (page) hoặc blocks/cart-drawer.liquid (drawer: trong dialog, ghi chú data-note ngoài partial, không thanh dính).
function documentHtml(lines: Line[], drawer: boolean) {
  const body = `<cart-items data-cart-change-url="/cart/change" data-cart-url="/cart" data-partials="${drawer ? 'cart-drawer cart-drawer-count cart-drawer-footer cart-count' : 'cart-page cart-count'}"
    data-label-updated="${LABELS.updated}" data-label-removed="${LABELS.removed}" data-label-error="${LABELS.error}" data-label-quantity-adjusted="${LABELS.adjusted}"
    ${drawer ? '' : `data-label-updating="${UPDATING}"`} data-testid="cart-items">
    ${drawer ? '' : '<h1 tabindex="-1" data-testid="cart-page-heading">Cart</h1>'}
    <div role="status" aria-live="polite" data-testid="cart-items-status"></div>
    <div role="alert" data-testid="cart-items-error"></div>
    <div data-item-count="${lines.length}" data-testid="cart-body">
      <form id="cart-form" action="/cart" method="post">
        <ul class="cart-lines" role="list" data-testid="cart-lines">${lines.map(lineHtml).join('')}</ul>
        <button type="submit" name="update" form="cart-form" data-cart-update data-testid="cart-update">Update</button>
        ${drawer ? '' : '<div class="fx-spacer"></div>'}
        <div class="cart-summary${drawer ? '' : ' cart-summary--page'}" data-testid="cart-summary">
          <p class="cart-summary__note" data-testid="cart-tax-note">Taxes and shipping calculated at checkout.</p>
          <button type="submit" name="checkout" form="cart-form" data-testid="cart-checkout">Checkout</button>
        </div>
      </form>
      ${drawer ? '' : '<cart-checkout-bar data-testid="cart-checkout-bar"><aside class="cart-sticky-checkout" aria-label="Cart total and checkout" data-testid="cart-sticky-checkout" hidden><button type="submit" name="checkout" form="cart-form" data-testid="cart-sticky-checkout-button">Checkout</button></aside></cart-checkout-bar>'}
    </div>
    ${drawer ? '<details open data-testid="cart-drawer-note"><summary>Add order note</summary><label for="note">Order note</label><textarea id="note" name="note" form="cart-form" data-note data-testid="cart-drawer-note-input"></textarea></details>' : ''}
  </cart-items>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>cart</title><link rel="icon" href="data:,">
<script type="importmap">{"imports":{"@shopify/partial-rendering":"${ORIGIN}/library.js"}}</script>
<style>[hidden]{display:none!important}.fx-spacer{block-size:150vh}body{margin:0}</style></head>
<body>${drawer ? `<dialog open data-testid="cart-drawer-dialog">${body}</dialog>` : body}
<script type="module" src="${ORIGIN}/cart-items.js"></script>${drawer ? '' : `<script type="module" src="${ORIGIN}/cart-checkout-bar.js"></script>`}</body></html>`;
}

// apply() thay danh sách dòng: phần tử mới, stepper hidden như Liquid. fetch() đi qua /__partials để đếm, giữ, huỷ được.
const LIBRARY = `export const partials = {
  async fetch(...args) {
    const { signal } = args.pop();
    const res = await fetch("/__partials?names=" + encodeURIComponent(args.join(" ")), { signal });
    if (!res.ok) throw new Error("partial " + res.status);
    return res.json();
  },
  async apply(update) {
    document.querySelector('[data-testid="cart-lines"]').innerHTML = update.lines;
    document.querySelector("[data-item-count]").dataset.itemCount = String(update.count);
  },
};`;

class Store {
  changes: { id: string; quantity: number }[] = [];
  notes: string[] = [];
  partials = 0;
  checkoutPosts = 0;
  next: Behaviour[] = [];
  stock: number | undefined;
  // Asset trả 404 (lỗi tải). Xử lý trong handle: route đăng ký sau ở open() chạy trước route đăng ký trong test.
  missing = new Set<string>();

  constructor(private readonly page: Page, public lines: Line[], private readonly drawer = false) {}

  async open(path = '/cart') {
    await this.page.route(CDN, (route) => route.fulfill({ contentType: 'text/javascript', body: 'export class CartLinesUpdateEvent {}' }));
    await this.page.route(`${ORIGIN}/**`, (route) => this.handle(route));
    await this.page.goto(`${ORIGIN}${path}`);
    await expect(this.page.getByTestId('cart-items')).toHaveAttribute('data-enhanced', '');
  }

  hold() {
    let release = () => {};
    this.next.push({ hold: new Promise<void>((resolve) => (release = resolve)) });
    return () => release();
  }

  private json(route: Route, json: unknown, status = 200) {
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) });
  }

  private async handle(route: Route) {
    const request = route.request();
    const { pathname } = new URL(request.url());
    if (this.missing.has(pathname)) return route.fulfill({ status: 404, body: '' });
    if (pathname === '/library.js') return route.fulfill({ contentType: 'text/javascript', body: LIBRARY });
    if (pathname === '/cart-items.js') return route.fulfill({ contentType: 'text/javascript', body: JS });
    if (pathname === '/cart-checkout-bar.js') return route.fulfill({ contentType: 'text/javascript', body: BAR });
    if (pathname === '/__partials') {
      this.partials++;
      return this.json(route, { lines: this.lines.map(lineHtml).join(''), count: this.lines.length });
    }
    if (pathname === CART.update) {
      this.notes.push(JSON.parse(request.postData() ?? '{}').note);
      return this.json(route, { note: this.notes.at(-1), items: [] });
    }
    if (pathname === CART.change) {
      const body = JSON.parse(request.postData() ?? '{}') as { id: string; quantity: number };
      this.changes.push(body);
      const behaviour = this.next.shift();
      if (behaviour && 'hold' in behaviour) await behaviour.hold;
      if (behaviour && 'status' in behaviour) return this.json(route, behaviour.json, behaviour.status);
      const line = this.lines.find((l) => l.key === body.id)!;
      line.quantity = this.stock === undefined ? body.quantity : Math.min(body.quantity, this.stock);
      this.lines = this.lines.filter((l) => l.quantity > 0);
      return this.json(route, { items: this.lines.map((l) => ({ key: l.key, quantity: l.quantity })) }).catch(() => {});
    }
    if (pathname === '/cart' && request.method() === 'POST') {
      this.checkoutPosts++;
      return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>checkout</title>' });
    }
    if (pathname === '/cart') return route.fulfill({ contentType: 'text/html', body: documentHtml(this.lines, this.drawer) });
    return route.fulfill({ status: 404, body: '' });
  }
}

const tid = (page: Page, id: string) => page.getByTestId(id);
const lineOf = (page: Page, key: string) => page.locator(`[data-line-key="${key}"]`);
const idle = (page: Page) => expect(tid(page, 'cart-items')).not.toHaveAttribute('aria-busy', /.*/);

// Lỗi console, lỗi trang trong suốt test: phải 0.
function watchErrors(page: Page) {
  const errors: string[] = [];
  const ignore = watchShopPay403(page);
  page.on('console', (m) => m.type() === 'error' && !ignore(m) && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function typeQuantity(page: Page, key: string, value: string) {
  const input = lineOf(page, key).getByTestId('cart-line-quantity');
  await input.fill(value);
  await input.evaluate((el) => el.dispatchEvent(new Event('change', { bubbles: true })));
}

test.describe('ES1-T370 hợp đồng tĩnh', () => {
  test('trần byte, partial, không import tĩnh module theme, không console, guard define', () => {
    // ADR 0010 / task-split ES1-T307: cart-items.js ≤ 7 168 B; cart-checkout-bar.js ≤ 1 024 B (CTO ES1-T490 B).
    expect(Buffer.byteLength(JS), 'cart-items.js tối đa 7168 B').toBeLessThanOrEqual(7168);
    expect(Buffer.byteLength(BAR), 'cart-checkout-bar.js tối đa 1024 B').toBeLessThanOrEqual(1024);
    expect(JS).toContain('partials.fetch(...this.dataset.partials.split(" "), { url: location.href, signal })');
    expect(JS).toContain('import { partials } from "@shopify/partial-rendering"');
    for (const src of [JS, BAR]) {
      expect(src).not.toMatch(/^import .*(\.js|\.\/)/m);
      expect(src).not.toMatch(/console\.|import\.meta\.url/);
      expect(src).not.toMatch(/offsetHeight|getBoundingClientRect|style\./);
    }
    expect(JS).toContain('if (!customElements.get("cart-items")) customElements.define("cart-items", CartItems)');
    expect(BAR).toContain('if (!customElements.get("cart-checkout-bar")) customElements.define("cart-checkout-bar", CartCheckoutBar)');
    // Đổi số chạy qua 1 hàng đợi, debounce 300 ms; ghi chú qua CART.update (routes.cart_url + /update.js).
    expect(JS).toContain('setTimeout(() => this.commit(key), 300)');
    expect(JS).toContain('/update.js`, { note: q }');
    // Chỉ module sở hữu thanh gắn/gỡ đúng giá trị "cart" (ADR 0007 #2): cart-checkout-bar.js, không phải cart-items.js.
    expect(BAR).toContain('root.bottomBar = "cart"');
    expect(JS).not.toMatch(/bottomBar|bottom-bar|IntersectionObserver/);
  });

  test('hook JS có trong markup FE: stepper, rule, lỗi dòng, ghi chú, nhãn, thanh dính, Checkout', () => {
    for (const hook of ['data-cart-step="-1"', 'data-cart-step="1"', 'data-quantity-rule', 'data-quantity-min=', 'data-quantity-max=', 'data-quantity-step=', 'data-cart-line-error', 'data-cart-line-error-text', "aria-describedby=\"{{ quantity_id }}-rule\"", 'id="{{ quantity_id }}-error"', 'data-cart-remove', 'name="updates[]"']) {
      expect(LINES, `snippets/cart-lines thiếu ${hook}`).toContain(hook);
    }
    // −/+ hidden khi không JS (AC11), lỗi dòng hidden.
    expect(LINES).toMatch(/data-testid="cart-line-decrease"\s+hidden/);
    expect(LINES).toMatch(/data-testid="cart-line-increase"\s+hidden/);
    expect(LINES).toMatch(/data-testid="cart-line-error" hidden/);
    expect(SUMMARY).toContain('class="cart-summary');
    expect(SUMMARY).toContain('name="checkout"');
    expect(PAGE).toContain('data-label-updating=');
    expect(PAGE).toMatch(/<aside\s+class="cart-sticky-checkout"[\s\S]*?hidden\s*>/);
    expect(PAGE).toContain('name="checkout"');
    // Host <cart-checkout-bar> (FE ES1-T498) bọc aside, nằm trong partial cart-page cùng panel .cart-summary--page.
    const pagePartial = PAGE.slice(PAGE.indexOf("{% partial 'cart-page' %}"), PAGE.indexOf('{% endpartial %}'));
    expect(pagePartial).toMatch(/<cart-checkout-bar[^>]*>\s*<aside\s+class="cart-sticky-checkout"/);
    expect(SUMMARY).toContain("cart-summary--page");
    // Thẻ script cart-checkout-bar.js: 1 thẻ, cạnh cart-items.js, ngoài partial (ES1-T500 C).
    const barScript = /<script src="\{\{ 'cart-checkout-bar\.js' \| asset_url \}\}" type="module" defer><\/script>/g;
    expect([...PAGE.matchAll(barScript)]).toHaveLength(1);
    expect(pagePartial).not.toContain('cart-checkout-bar.js');
    // Ghi chú drawer: data-note, ngoài partial cart-drawer (giữ chữ khi refresh).
    expect(DRAWER).toContain('data-note');
    const drawerPartial = DRAWER.slice(DRAWER.indexOf("{% partial 'cart-drawer' %}"), DRAWER.indexOf('{% endpartial %}', DRAWER.indexOf("{% partial 'cart-drawer' %}")));
    expect(drawerPartial).not.toContain('data-note');
    // Ghi chú cart page lưu khi submit (cart.md §3.5): không data-note.
    expect(PAGE).not.toContain('data-note');
    // 1 thẻ script cart-items.js ở cart page; drawer nạp qua data-items-src.
    expect([...PAGE.matchAll(/<script src="\{\{ 'cart-items\.js' \| asset_url \}\}" type="module"><\/script>/g)]).toHaveLength(1);
    expect(DRAWER).toContain(`data-items-src="{{ 'cart-items.js' | asset_url }}"`);
  });
});

test.describe('ES1-T370 hành vi (fixture, cart-items.js thật)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('AC11 có JS: −/+ bỏ hidden, data-enhanced; − aria-disabled ở 1 thì bấm không gửi', async ({ page }) => {
    const errors = watchErrors(page);
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    await store.open();
    await expect(tid(page, 'cart-line-decrease')).toBeVisible();
    await expect(tid(page, 'cart-line-increase')).toBeVisible();
    await expect(tid(page, 'cart-line-decrease')).toHaveAttribute('aria-disabled', 'true');
    // force: Playwright coi aria-disabled là disabled, bỏ kiểm actionability để bấm thật.
    await tid(page, 'cart-line-decrease').click({ force: true });
    await page.waitForTimeout(500);
    expect(store.changes, '− khoá ở 1: không gửi').toEqual([]);
    expect(errors).toEqual([]);
  });

  test('AC11 debounce: bấm + 3 lần liên tiếp → 1 POST với số cuối, status, focus giữ trên dòng', async ({ page }) => {
    const errors = watchErrors(page);
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    await store.open();
    const plus = tid(page, 'cart-line-increase');
    await plus.click();
    await plus.click();
    await plus.click();
    await expect(tid(page, 'cart-line-quantity')).toHaveValue('4');
    await expect.poll(() => store.changes.length).toBe(1);
    await idle(page);
    expect(store.changes).toEqual([{ id: 'a', quantity: 4 }]);
    expect(store.partials, '1 lần refresh').toBe(1);
    await expect(tid(page, 'cart-items-status')).toHaveText(LABELS.updated);
    await expect(tid(page, 'cart-line-quantity')).toHaveValue('4');
    // Refresh thay dòng (stepper lại hidden trong HTML server): JS hiện lại.
    await expect(tid(page, 'cart-line-increase')).toBeVisible();
    await expect(tid(page, 'cart-line-decrease')).not.toHaveAttribute('aria-disabled', /.*/);
    await expect(lineOf(page, 'a').locator(':focus')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('AC9 quantity rule: +/− theo bước, − khoá ở min, + khoá ở max', async ({ page }) => {
    const store = new Store(page, [{ key: 'r', quantity: 6, min: 6, max: 18, step: 6 }]);
    await store.open();
    const minus = tid(page, 'cart-line-decrease');
    const plus = tid(page, 'cart-line-increase');
    await expect(minus).toHaveAttribute('aria-disabled', 'true');
    await plus.click();
    await expect(tid(page, 'cart-line-quantity')).toHaveValue('12');
    await expect(minus).not.toHaveAttribute('aria-disabled', /.*/);
    await plus.click();
    await expect(tid(page, 'cart-line-quantity')).toHaveValue('18');
    await expect(plus).toHaveAttribute('aria-disabled', 'true');
    await plus.click({ force: true });
    await expect(tid(page, 'cart-line-quantity')).toHaveValue('18');
    await expect.poll(() => store.changes.length).toBe(1);
    await idle(page);
    expect(store.changes).toEqual([{ id: 'r', quantity: 18 }]);
    await expect(tid(page, 'cart-line-increase')).toHaveAttribute('aria-disabled', 'true');
  });

  test('AC9 gõ số sai rule rồi rời ô: câu lỗi dưới dòng, aria-invalid, aria-describedby, không gửi; sửa đúng thì gửi', async ({ page }) => {
    const errors = watchErrors(page);
    const store = new Store(page, [{ key: 'r', quantity: 6, min: 6, max: 18, step: 6 }]);
    await store.open();
    const input = tid(page, 'cart-line-quantity');
    for (const wrong of ['7', '3', '24']) {
      await typeQuantity(page, 'r', wrong);
      await expect(tid(page, 'cart-line-error')).toBeVisible();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveAttribute('aria-describedby', 'q1-rule q1-error');
      await expect(input).toHaveValue(wrong);
    }
    await page.waitForTimeout(400);
    expect(store.changes, 'ô sai không gửi').toEqual([]);

    await typeQuantity(page, 'r', '12');
    await expect.poll(() => store.changes.length).toBe(1);
    await idle(page);
    expect(store.changes).toEqual([{ id: 'r', quantity: 12 }]);
    await expect(tid(page, 'cart-line-error')).toBeHidden();
    await expect(input).not.toHaveAttribute('aria-invalid', /.*/);
    expect(errors).toEqual([]);
  });

  test('AC9 gõ 0 vẫn xoá dòng dù có rule', async ({ page }) => {
    const store = new Store(page, [{ key: 'r', quantity: 6, min: 6, step: 6 }, { key: 'b', quantity: 1 }]);
    await store.open();
    await typeQuantity(page, 'r', '0');
    await expect.poll(() => store.changes.length).toBe(1);
    await idle(page);
    expect(store.changes).toEqual([{ id: 'r', quantity: 0 }]);
    await expect(tid(page, 'cart-line')).toHaveCount(1);
    await expect(tid(page, 'cart-items-status')).toHaveText(LABELS.removed);
  });

  test('AC2 AC9 422: câu Shopify trong role alert, ô về số server, không refresh, Checkout bật lại, status rỗng', async ({ page }) => {
    const message = 'You can only add 2 of Product a to your cart.';
    const store = new Store(page, [{ key: 'a', quantity: 2 }]);
    await store.open();
    store.next.push({ status: 422, json: { status: 422, message: 'Cart Error', description: message } });
    await tid(page, 'cart-line-increase').click();
    await expect.poll(() => store.changes.length).toBe(1);
    await idle(page);
    await expect(tid(page, 'cart-items-error')).toHaveText(message);
    await expect(tid(page, 'cart-line-quantity')).toHaveValue('2');
    await expect(tid(page, 'cart-items-status')).toBeEmpty();
    await expect(tid(page, 'cart-checkout')).not.toHaveAttribute('aria-disabled', /.*/);
    expect(store.partials).toBe(0);
  });

  test('AC2 200 nhưng server giảm số: ô theo server, status quantity_adjusted', async ({ page }) => {
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    await store.open();
    store.stock = 2;
    await typeQuantity(page, 'a', '5');
    await expect.poll(() => store.changes.length).toBe(1);
    await idle(page);
    await expect(tid(page, 'cart-line-quantity')).toHaveValue('2');
    await expect(tid(page, 'cart-items-status')).toHaveText(LABELS.adjusted);
    await expect(tid(page, 'cart-items-error')).toBeEmpty();
  });

  test('AC18 đang cập nhật: aria-busy, "Updating cart…" trong role status, Checkout aria-disabled, bấm Checkout không gửi', async ({ page }) => {
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    await store.open();
    const release = store.hold();
    await typeQuantity(page, 'a', '3');
    await expect(tid(page, 'cart-items')).toHaveAttribute('aria-busy', 'true');
    await expect(tid(page, 'cart-items-status')).toHaveText(UPDATING);
    await expect(tid(page, 'cart-checkout')).toHaveAttribute('aria-disabled', 'true');
    // Dòng đang ghi: aria-busy, −/+ và xoá aria-disabled (CTO ES1-T370 18/11).
    const line = lineOf(page, 'a');
    await expect(line).toHaveAttribute('aria-busy', 'true');
    for (const id of ['cart-line-decrease', 'cart-line-increase', 'cart-line-remove']) await expect(line.getByTestId(id)).toHaveAttribute('aria-disabled', 'true');
    await line.getByTestId('cart-line-increase').click({ force: true });
    await line.getByTestId('cart-line-remove').click({ force: true });
    // aria-disabled giữ focus được; submit bị chặn.
    await tid(page, 'cart-checkout').click({ force: true });
    await page.waitForTimeout(400);
    expect(store.checkoutPosts, 'không checkout với tổng cũ').toBe(0);
    expect(store.changes, 'bấm +/xoá lúc dòng bận: không gửi thêm').toEqual([{ id: 'a', quantity: 3 }]);
    expect(new URL(page.url()).pathname).toBe('/cart');
    release();
    await idle(page);
    await expect(tid(page, 'cart-checkout')).not.toHaveAttribute('aria-disabled', /.*/);
    await expect(tid(page, 'cart-items-status')).toHaveText(LABELS.updated);
    await expect(line).not.toHaveAttribute('aria-busy', /.*/);
    for (const id of ['cart-line-decrease', 'cart-line-increase', 'cart-line-remove']) await expect(line.getByTestId(id)).not.toHaveAttribute('aria-disabled', /.*/);
    expect(store.changes).toHaveLength(1);
  });

  test('AC18 422: dòng hết bận, −/+ theo số server, xoá bấm được', async ({ page }) => {
    const store = new Store(page, [{ key: 'a', quantity: 2 }]);
    await store.open();
    store.next.push({ status: 422, json: { status: 422, message: 'Cart Error', description: 'Sold out.' } });
    await tid(page, 'cart-line-increase').click();
    await idle(page);
    await expect(tid(page, 'cart-line')).not.toHaveAttribute('aria-busy', /.*/);
    await expect(tid(page, 'cart-line-remove')).not.toHaveAttribute('aria-disabled', /.*/);
    await expect(tid(page, 'cart-line-decrease')).not.toHaveAttribute('aria-disabled', /.*/);
    await expect(tid(page, 'cart-line-increase')).not.toHaveAttribute('aria-disabled', /.*/);
  });

  test('AC18 lỗi mạng: role alert data-label-error, ô về số server, hết busy', async ({ page }) => {
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    await store.open();
    await page.route(`${ORIGIN}${CART.change}`, (route) => route.abort());
    await tid(page, 'cart-line-increase').click();
    await expect(tid(page, 'cart-items-error')).toHaveText(LABELS.error);
    await idle(page);
    await expect(tid(page, 'cart-line-quantity')).toHaveValue('1');
    await expect(tid(page, 'cart-items-status')).toBeEmpty();
  });

  test('xoá có JS: link Remove không điều hướng, status removed', async ({ page }) => {
    const store = new Store(page, [{ key: 'a', quantity: 1 }, { key: 'b', quantity: 1 }]);
    await store.open();
    await lineOf(page, 'a').getByTestId('cart-line-remove').click();
    await expect(tid(page, 'cart-line')).toHaveCount(1);
    await idle(page);
    expect(store.changes).toEqual([{ id: 'a', quantity: 0 }]);
    await expect(tid(page, 'cart-items-status')).toHaveText(LABELS.removed);
    expect(new URL(page.url()).pathname).toBe('/cart');
  });
});

test.describe('ES1-T370 AC8 ghi chú drawer', () => {
  test('rời ô: POST CART.update với note; refresh giỏ không mất chữ; không chặn Checkout', async ({ page }) => {
    const errors = watchErrors(page);
    const store = new Store(page, [{ key: 'a', quantity: 1 }], true);
    await store.open();
    const note = tid(page, 'cart-drawer-note-input');
    await note.fill('Leave at the door');
    await note.blur();
    await expect.poll(() => store.notes).toEqual(['Leave at the door']);
    await idle(page);
    await expect(tid(page, 'cart-checkout')).not.toHaveAttribute('aria-disabled', /.*/);

    // Đang gõ tiếp (focus còn trong ô) thì refresh partial do đổi số lượng: chữ giữ nguyên, chưa rời ô thì chưa lưu.
    await note.fill('Leave at the door, ring twice');
    await tid(page, 'cart-line-quantity').evaluate((el: HTMLInputElement) => {
      el.value = '2';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect.poll(() => store.partials).toBe(1);
    await expect(note).toBeFocused();
    await idle(page);
    await expect(note).toHaveValue('Leave at the door, ring twice');
    expect(store.notes).toHaveLength(1);
    expect(errors).toEqual([]);
  });

  test('lưu ghi chú lỗi: role alert data-label-error, chữ giữ nguyên', async ({ page }) => {
    const store = new Store(page, [{ key: 'a', quantity: 1 }], true);
    await store.open();
    await page.route(`${ORIGIN}${CART.update}`, (route) => route.fulfill({ status: 500, body: '' }));
    const note = tid(page, 'cart-drawer-note-input');
    await note.fill('Gift wrap');
    await note.blur();
    await expect(tid(page, 'cart-items-error')).toHaveText(LABELS.error);
    await expect(note).toHaveValue('Gift wrap');
  });

  test('drawer không gắn data-bottom-bar', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const store = new Store(page, [{ key: 'a', quantity: 1 }], true);
    await store.open();
    await page.waitForTimeout(300);
    await expect(page.locator('html')).not.toHaveAttribute('data-bottom-bar', /.*/);
  });
});

test.describe('ES1-T370 AC17 thanh checkout dính, cart-checkout-bar.js (ADR 0007)', () => {
  test('360: panel ngoài màn → thanh hiện + html[data-bottom-bar="cart"]; panel vào màn → ẩn, gỡ thuộc tính', async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 360, height: 640 });
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    await store.open();
    const bar = tid(page, 'cart-sticky-checkout');
    await expect(bar).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-bottom-bar', 'cart');
    await tid(page, 'cart-summary').scrollIntoViewIfNeeded();
    await expect(bar).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-bottom-bar', /.*/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(bar).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('360: partial thay host + panel thì theo dõi panel mới; partial không còn host (giỏ rỗng) thì gỡ thuộc tính', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    await store.open();
    await expect(page.locator('html')).toHaveAttribute('data-bottom-bar', 'cart');
    // Như partials.apply thay cả vùng cart-page: phần tử host và panel mới.
    await page.evaluate(() => {
      const body = document.querySelector('[data-item-count]')!;
      body.replaceWith(body.cloneNode(true));
    });
    await expect(tid(page, 'cart-sticky-checkout')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-bottom-bar', 'cart');
    await tid(page, 'cart-summary').scrollIntoViewIfNeeded();
    await expect(tid(page, 'cart-sticky-checkout')).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-bottom-bar', /.*/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('html')).toHaveAttribute('data-bottom-bar', 'cart');
    await page.evaluate(() => document.querySelector('cart-checkout-bar')!.remove());
    await expect(page.locator('html')).not.toHaveAttribute('data-bottom-bar', /.*/);
  });

  test('360 → 1280 khi thanh đang hiện: ẩn thanh, gỡ thuộc tính; về 360 thì hiện lại', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    await store.open();
    await expect(page.locator('html')).toHaveAttribute('data-bottom-bar', 'cart');
    await page.setViewportSize({ width: 1280, height: 640 });
    await expect(page.locator('html')).not.toHaveAttribute('data-bottom-bar', /.*/);
    await expect(tid(page, 'cart-sticky-checkout')).toBeHidden();
    await page.setViewportSize({ width: 360, height: 640 });
    await expect(page.locator('html')).toHaveAttribute('data-bottom-bar', 'cart');
  });

  test('1280: không thanh, không data-bottom-bar; thuộc tính của module khác không bị gỡ', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    await store.open();
    await page.waitForTimeout(300);
    await expect(tid(page, 'cart-sticky-checkout')).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-bottom-bar', /.*/);
    await page.evaluate(() => (document.documentElement.dataset.bottomBar = 'product'));
    await tid(page, 'cart-line-increase').click();
    await idle(page);
    await expect(page.locator('html')).toHaveAttribute('data-bottom-bar', 'product');
  });

  test('gỡ block khỏi DOM (editor render lại): gỡ data-bottom-bar="cart"', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    await store.open();
    await expect(page.locator('html')).toHaveAttribute('data-bottom-bar', 'cart');
    await page.evaluate(() => document.querySelector('cart-items')!.remove());
    await expect(page.locator('html')).not.toHaveAttribute('data-bottom-bar', /.*/);
  });

  test('không cart-checkout-bar.js (lỗi tải): thanh giữ hidden, không data-bottom-bar, cart-items vẫn chạy', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const store = new Store(page, [{ key: 'a', quantity: 1 }]);
    store.missing.add('/cart-checkout-bar.js');
    await store.open();
    await page.waitForTimeout(300);
    await expect(tid(page, 'cart-sticky-checkout')).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-bottom-bar', /.*/);
    await tid(page, 'cart-line-increase').click();
    await expect.poll(() => store.changes.length).toBe(1);
  });
});
