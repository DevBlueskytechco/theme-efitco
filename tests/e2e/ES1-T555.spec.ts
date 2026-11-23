// KHÔNG CHẮC: spec chưa chạy trong phiên viết (không trình duyệt, không preview, không node_modules) → chờ CI.
// Nhóm "layout" đỏ tới khi FE/Orchestrator thêm thẻ script loading-delay.js vào layout/theme.liquid và
// layout/password.liquid (dev-be không ghi layout/, xem PR).
// ES1-T555: một ngưỡng LOADING_DELAY_MS = 500 (foundation.md §18.1, tokens.json loading.indicator_delay_ms).
// 0–500 ms: khoá lặp (cờ JS + aria-disabled), giữ nhãn/giá cũ, KHÔNG aria-busy; sau 500 ms: aria-busy (spinner nút,
// skeleton giá, spinner dòng tồn, spinner dòng giỏ); xong: gỡ.
// Nhóm "fixture": origin giả, markup tối thiểu theo hook FE + assets/*.js thật qua page.route, không gọi store.
// MutationObserver ghi mọi lần đổi aria-busy / aria-disabled kèm performance.now() → kiểm "không frame nào".
import { test, expect, type Page } from './support/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');
const size = (f: string) => statSync(`assets/${f}`).size;
const CONSUMERS = ['product-form.js', 'bundle-form.js', 'contact-form.js', 'article-comments.js', 'password-page.js', 'product-variant-picker.js', 'cart-items.js'];
const DELAY = 500;
// AC3: spinner từ ~500 ms (±100).
const EARLY = DELAY - 100;
const LATE = DELAY + 100;

test.describe('ES1-T555 tĩnh', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'));

  test('AC1: LOADING_DELAY_MS = 500 đúng 1 dòng trong assets, ở loading-delay.js', () => {
    const hits = readdirSync('assets')
      .filter((f) => f.endsWith('.js'))
      .flatMap((f) => read(`assets/${f}`).split('\n').filter((l) => l.includes('LOADING_DELAY_MS = 500')).map(() => f));
    expect(hits).toEqual(['loading-delay.js']);
    expect(read('assets/loading-delay.js')).toMatch(/^export const LOADING_DELAY_MS = 500;$/m);
  });

  test('AC1: 7 file gọi window.busyLater, không tự hẹn giờ chỉ báo, không import module theme (ES1-T81)', () => {
    for (const f of CONSUMERS) {
      const js = read(`assets/${f}`);
      expect(js, f).toContain('window.busyLater?.(');
      expect(js, f).not.toMatch(/LOADING_DELAY_MS|setTimeout\([^;]*aria-?[bB]usy/);
      expect(js, f).not.toMatch(/^\s*import\s[^(]*loading-delay|import\.meta|loading-delay\.js/m);
      expect(js, f).not.toMatch(/console\./);
    }
  });

  test('loading-delay.js: export hằng + busyLater, gắn window.busyLater, không console/fetch/import', () => {
    const js = read('assets/loading-delay.js');
    expect(js).toContain('export const busyLater = (...els) =>');
    expect(js).toContain('setTimeout(set, LOADING_DELAY_MS, "true")');
    expect(js).toContain('clearTimeout(t)');
    expect(js).toContain('window.busyLater ||= busyLater');
    expect(js).not.toMatch(/console\.|fetch\(|^\s*import\s|import\(/m);
  });

  test('AC5: trần byte', () => {
    expect(size('loading-delay.js')).toBeLessThanOrEqual(512);
    expect(size('product-variant-picker.js')).toBeLessThanOrEqual(7600);
    expect(size('cart-items.js')).toBeLessThanOrEqual(7600);
    for (const f of readdirSync('assets').filter((x) => x.endsWith('.js'))) expect(size(f), f).toBeLessThanOrEqual(8192);
  });

  test('debounce 300 giữ (predictive-search, cart-items); collection-filters không đổi', () => {
    expect(read('assets/cart-items.js')).toContain('setTimeout(() => this.commit(key), 300)');
    expect(read('assets/predictive-search.js')).toContain('setTimeout(() => this.load(q), 300)');
    expect(read('assets/collection-filters.js')).not.toContain('busyLater');
  });
});

test.describe('ES1-T555 layout', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'));

  for (const f of ['layout/theme.liquid', 'layout/password.liquid']) {
    test(`${f}: đúng 1 thẻ script module loading-delay.js (FE/Orchestrator thêm, xem PR)`, () => {
      const tags = read(f).match(/<script[^>]*'loading-delay\.js'\s*\|\s*asset_url[^>]*>/g) ?? [];
      expect(tags).toHaveLength(1);
      expect(tags[0]).toContain('type="module"');
    });
  }
});

// ---------- Fixture ----------
const ORIGIN = 'https://fixture.test';
type Rec = { t: number; id: string; attr: string; v: string | null };
type Win = Window & { __rec: Rec[]; __t0: number };

const PARTIALS = `export const partials = {
  async fetch(...args) {
    const { url, signal } = args.pop();
    const r = await fetch(url, { signal });
    if (!r.ok) throw Error(String(r.status));
    return {};
  },
  async apply() {},
};`;

const page0 = (body: string, map = false) => `<!doctype html><html lang="en"><head><title>fixture</title><link rel="icon" href="data:,">
${map ? `<script type="importmap">{"imports":{"@shopify/partial-rendering":"${ORIGIN}/fake-partials.js"}}</script>` : ''}
</head><body><main>${body}</main></body></html>`;

const PRODUCT = page0(`
<form id="product-form-1" method="post" action="${ORIGIN}/cart/add">
  <input type="hidden" name="id" value="11"><input type="hidden" name="quantity" value="1">
  <button type="submit" name="add" class="button" data-testid="product-add-button"><span>Add to cart</span></button>
</form>
<button type="submit" name="add" form="product-form-1" class="button" data-testid="product-sticky-bar-add"><span>Add to cart</span></button>
<product-form data-product-id="1" data-cart-add-url="${ORIGIN}/cart/add" data-cart-url="${ORIGIN}/cart" data-cart-type="drawer" data-label-added="Added" data-testid="product-form">
  <p role="status" data-testid="product-form-status"></p><p role="alert" data-testid="product-form-error"></p>
</product-form>
<cart-drawer><dialog></dialog></cart-drawer>
<script>customElements.define("cart-drawer", class extends HTMLElement {});</script>
<script src="${ORIGIN}/assets/product-form.js" type="module"></script>
<script src="${ORIGIN}/assets/loading-delay.js" type="module"></script>`);

const VARIANT = page0(`
<form id="product-form-1" method="post" action="${ORIGIN}/cart/add">
  <input type="hidden" name="id" value="11">
  <button type="submit" name="add" class="button" data-testid="product-add-button"><span>Add to cart</span></button>
</form>
<div class="product-info__price" data-variant-busy data-variant-price data-testid="product-price"><span class="price__current">$10.00</span></div>
<product-form data-product-id="1" data-testid="product-form">
  <p role="status"></p>
  <product-variant-picker data-form-id="product-form-1" data-product-url="${ORIGIN}/products/p" data-partials="product-price"
    data-label-loading="Loading [value]" data-label-loaded="[value], [price]" data-label-load-error="Could not load [value]">
    <fieldset data-option-position="1" data-option-name="Size">
      <legend>Size <span data-option-selected>S</span></legend>
      <label><input type="radio" name="o1" value="S" data-option-value-id="101" checked><span class="product-option__text">S</span></label>
      <label data-testid="option-m"><input type="radio" name="o1" value="M" data-option-value-id="102"><span class="product-option__text">M</span></label>
      <p role="alert"></p><button type="button" class="product-option__retry" hidden>Try again</button>
    </fieldset>
  </product-variant-picker>
  <div class="product-form__stock" data-variant-busy data-testid="product-stock"><p>In stock</p></div>
</product-form>
<script src="${ORIGIN}/assets/product-variant-picker.js" type="module"></script>
<script src="${ORIGIN}/assets/loading-delay.js" type="module"></script>`, true);

const CART = page0(`
<cart-items data-cart-url="${ORIGIN}/cart" data-cart-change-url="${ORIGIN}/cart/change" data-partials="cart-lines"
  data-label-updating="Updating cart…" data-label-updated="Cart updated" data-label-error="Error" data-label-removed="Removed"
  data-label-quantity-adjusted="Adjusted" data-testid="cart-items">
  <p role="status" data-testid="cart-items-status"></p><p role="alert" data-testid="cart-items-error"></p>
  <form id="cart-form-page" action="${ORIGIN}/cart" method="post">
    <ul><li class="cart-line" data-line-key="a" data-testid="cart-line">
      <div class="cart-line__stepper">
        <button type="button" class="cart-line__step" aria-label="Decrease" aria-controls="q-a" aria-disabled="true" data-cart-step="-1" data-testid="cart-line-decrease" hidden>−</button>
        <input id="q-a" class="cart-line__quantity" type="number" name="updates[]" value="1" min="0" form="cart-form-page" aria-label="Quantity" data-testid="cart-line-quantity">
        <button type="button" class="cart-line__step" aria-label="Increase" aria-controls="q-a" data-cart-step="1" data-testid="cart-line-increase" hidden>+</button>
      </div>
      <a href="${ORIGIN}/cart/change?id=a&amp;quantity=0" aria-label="Remove" data-cart-remove data-testid="cart-line-remove">Remove</a>
      <p id="q-a-error" data-cart-line-error hidden></p>
    </li></ul>
    <button type="submit" name="checkout" class="button" data-testid="cart-checkout">Checkout</button>
  </form>
</cart-items>
<script src="${ORIGIN}/assets/cart-items.js" type="module"></script>
<script src="${ORIGIN}/assets/loading-delay.js" type="module"></script>`, true);

const PAGES: Record<string, string> = { '/product': PRODUCT, '/variant': VARIANT, '/cart': CART };

type Hits = { add: number; change: number; variant: number };

/** Phục vụ trang giả; delay = độ trễ của request đang đo (cart/add.js, cart/change.js, ?option_values=). */
async function serve(page: Page, path: string, delay: number, opts: { addStatus?: number } = {}) {
  const hits: Hits = { add: 0, change: 0, variant: 0 };
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // 422 cố ý (ca lỗi): Chromium ghi "Failed to load resource ... 422" cho response lỗi, không phải lỗi theme.
  page.on('console', (m) => m.type() === 'error' && !/status of 422/.test(m.text()) && errors.push(m.text()));
  // Thư viện standard-events: module rỗng (không event), không lỗi mạng trong console.
  await page.route('https://cdn.shopify.com/**', (route) => route.fulfill({ contentType: 'text/javascript', body: 'export {};' }));
  await page.route(`${ORIGIN}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    // Request bị trang huỷ (AbortController) trong lúc chờ: fulfill ném lỗi, bỏ qua.
    const send = (o: Parameters<typeof route.fulfill>[0]) => route.fulfill(o).catch(() => {});
    const js = (body: string) => send({ contentType: 'text/javascript', body });
    const json = (body: unknown, status = 200) => send({ status, contentType: 'application/json', body: JSON.stringify(body) });
    const wait = () => new Promise((r) => setTimeout(r, delay));
    if (url.pathname.startsWith('/assets/')) return js(read(url.pathname.slice(1)));
    if (url.pathname === '/fake-partials.js') return js(PARTIALS);
    if (url.pathname === '/cart/add.js') {
      hits.add++;
      await wait();
      if (opts.addStatus) return json({ status: opts.addStatus, message: 'Cart Error', description: 'Sold out.' }, opts.addStatus);
      return json({ id: 11, quantity: 1 });
    }
    if (url.pathname === '/cart/change.js') {
      hits.change++;
      await wait();
      const { quantity } = JSON.parse(req.postData() || '{}');
      return json({ items: [{ key: 'a', quantity }] });
    }
    if (url.searchParams.has('option_values')) return hits.variant++, await wait(), send({ contentType: 'text/html', body: '' });
    if (req.resourceType() !== 'document') return send({ contentType: 'text/html', body: '' });
    return send({ contentType: 'text/html; charset=utf-8', body: PAGES[url.pathname] ?? page0('') });
  });
  await page.addInitScript(() => {
    const w = window as unknown as Win;
    w.__rec = [];
    w.__t0 = 0;
    new MutationObserver((list) => {
      for (const m of list) {
        const el = m.target as HTMLElement;
        w.__rec.push({ t: performance.now(), id: el.dataset.testid || el.localName, attr: m.attributeName!, v: el.getAttribute(m.attributeName!) });
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['aria-busy', 'aria-disabled'] });
    // Mốc 0: submit (nút gửi), change (variant). Dòng giỏ lấy mốc lúc khoá (aria-disabled) vì có debounce 300.
    for (const type of ['submit', 'change']) document.addEventListener(type, () => (w.__t0 ||= performance.now()), true);
  });
  await page.goto(`${ORIGIN}${path}`);
  await page.waitForFunction(() => typeof (window as unknown as { busyLater?: unknown }).busyLater === 'function');
  return { hits, errors };
}

const records = (page: Page) => page.evaluate(() => {
  const w = window as unknown as Win;
  return { t0: w.__t0, rec: w.__rec.map((r) => ({ ...r })) };
});
const busyOn = (rec: Rec[], id: string) => rec.filter((r) => r.id === id && r.attr === 'aria-busy');
const firstTrue = (rec: Rec[], id: string, attr = 'aria-busy') => rec.find((r) => r.id === id && r.attr === attr && r.v === 'true');

test.describe('ES1-T555 fixture: nút thêm giỏ PDP + sticky bar', () => {
  test('AC2 trễ 300 ms: không frame nào aria-busy; aria-disabled ngay; click lần 2 không gửi request thứ 2', async ({ page }) => {
    const { hits, errors } = await serve(page, '/product', 300);
    const add = page.getByTestId('product-add-button');
    // Bấm 3 lần trong cùng một tác vụ (nút chính 2 lần + sticky bar): lần 2, 3 chắc chắn rơi vào lúc request 1 đang chạy.
    // Nút aria-disabled vẫn gửi submit (không disabled), JS phải chặn bằng cờ.
    await page.evaluate(() => {
      const [main, sticky] = ['product-add-button', 'product-sticky-bar-add'].map((id) => document.querySelector<HTMLButtonElement>(`[data-testid="${id}"]`)!);
      main.click();
      main.click();
      sticky.click();
    });
    await expect(page.getByTestId('product-form-status')).toHaveText('Added');
    await expect(add).not.toHaveAttribute('aria-disabled', /.*/);
    await page.waitForTimeout(DELAY + 200);
    const { t0, rec } = await records(page);
    expect(busyOn(rec, 'product-add-button'), 'không spinner khi xong trước 500 ms').toEqual([]);
    expect(busyOn(rec, 'product-sticky-bar-add')).toEqual([]);
    for (const id of ['product-add-button', 'product-sticky-bar-add']) {
      expect(firstTrue(rec, id, 'aria-disabled')!.t - t0, `${id}: khoá ngay`).toBeLessThan(100);
    }
    expect(hits.add, 'không gửi request thứ 2').toBe(1);
    await expect(add).toHaveText('Add to cart');
    expect(errors).toEqual([]);
  });

  test('AC3 trễ 1 500 ms: spinner (aria-busy) từ ~500 ms ±100 trên cả 2 nút, hết khi xong', async ({ page }) => {
    const { hits, errors } = await serve(page, '/product', 1500);
    const add = page.getByTestId('product-add-button');
    await add.click();
    await expect(add).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByTestId('product-sticky-bar-add')).toHaveAttribute('aria-busy', 'true');
    await expect(add).not.toHaveAttribute('aria-busy', /.*/, { timeout: 5_000 });
    await expect(add).not.toHaveAttribute('aria-disabled', /.*/);
    const { t0, rec } = await records(page);
    for (const id of ['product-add-button', 'product-sticky-bar-add']) {
      const on = firstTrue(rec, id)!;
      expect(on.t - t0, `${id}: spinner sau ngưỡng`).toBeGreaterThanOrEqual(EARLY);
      expect(on.t - t0, `${id}: spinner không trễ quá`).toBeLessThanOrEqual(LATE);
      const off = busyOn(rec, id).at(-1)!;
      expect(off.v).toBeNull();
      expect(off.t - t0, `${id}: gỡ khi request xong`).toBeGreaterThanOrEqual(1400);
    }
    expect(hits.add).toBe(1);
    expect(errors).toEqual([]);
  });

  test('lỗi 422 sau 1 500 ms: lỗi inline, spinner gỡ, nút mở lại, nhãn còn, gửi lại được', async ({ page }) => {
    const { hits, errors } = await serve(page, '/product', 1500, { addStatus: 422 });
    const add = page.getByTestId('product-add-button');
    await add.click();
    await expect(add).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByTestId('product-form-error')).toHaveText('Sold out.', { timeout: 5_000 });
    await expect(add).not.toHaveAttribute('aria-busy', /.*/);
    await expect(add).not.toHaveAttribute('aria-disabled', /.*/);
    await expect(add).toHaveText('Add to cart');
    await add.click();
    await expect.poll(() => hits.add).toBe(2);
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T555 fixture: đổi biến thể', () => {
  test('AC4 trễ 1 500 ms: nút mua aria-disabled ngay, giá cũ giữ tới ~500 ms rồi skeleton (aria-busy giá + tồn), hết khi xong', async ({ page }) => {
    const { hits, errors } = await serve(page, '/variant', 1500);
    const price = page.getByTestId('product-price');
    await page.getByTestId('option-m').click();
    await expect(page.getByTestId('product-add-button')).toHaveAttribute('aria-disabled', 'true');
    await expect(price).toHaveText('$10.00');
    await expect(price).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByTestId('product-stock')).toHaveAttribute('aria-busy', 'true');
    await expect(price).not.toHaveAttribute('aria-busy', /.*/, { timeout: 5_000 });
    await expect(page.getByTestId('product-stock')).not.toHaveAttribute('aria-busy', /.*/);
    await expect(page.getByTestId('product-add-button')).not.toHaveAttribute('aria-disabled', /.*/);
    const { t0, rec } = await records(page);
    expect(firstTrue(rec, 'product-add-button', 'aria-disabled')!.t - t0).toBeLessThan(100);
    // Khung host product-form: aria-busy ngay (con trỏ progress, giữ hợp đồng ES1-T347), không phải chỉ báo hình.
    expect(firstTrue(rec, 'product-form')!.t - t0).toBeLessThan(100);
    for (const id of ['product-price', 'product-stock']) {
      const on = firstTrue(rec, id)!;
      expect(on.t - t0, `${id}: skeleton sau ngưỡng`).toBeGreaterThanOrEqual(EARLY);
      expect(on.t - t0).toBeLessThanOrEqual(LATE);
    }
    expect(hits.variant).toBe(1);
    expect(errors).toEqual([]);
  });

  test('AC4 trễ 200 ms: không skeleton, không spinner tồn; nút mua khoá rồi mở lại', async ({ page }) => {
    const { hits, errors } = await serve(page, '/variant', 200);
    await page.getByTestId('option-m').click();
    await expect.poll(() => hits.variant).toBe(1);
    await page.waitForTimeout(DELAY + 400);
    await expect(page.getByTestId('product-add-button')).not.toHaveAttribute('aria-disabled', /.*/);
    const { t0, rec } = await records(page);
    expect(firstTrue(rec, 'product-add-button', 'aria-disabled')!.t - t0, 'nút mua khoá ngay').toBeLessThan(100);
    expect(busyOn(rec, 'product-price')).toEqual([]);
    expect(busyOn(rec, 'product-stock')).toEqual([]);
    expect(hits.variant).toBe(1);
    expect(errors).toEqual([]);
  });

  test('đổi nhanh 2 lần (request 1 bị huỷ): một hẹn giờ, skeleton gỡ hết sau request cuối', async ({ page }) => {
    const { errors } = await serve(page, '/variant', 900);
    await page.getByTestId('option-m').click();
    await page.waitForTimeout(150);
    await page.locator('input[data-option-value-id="101"]').check({ force: true });
    await expect(page.getByTestId('product-price')).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByTestId('product-price')).not.toHaveAttribute('aria-busy', /.*/, { timeout: 5_000 });
    await page.waitForTimeout(DELAY + 200);
    const { rec } = await records(page);
    // Không hẹn giờ mồ côi: sau lần gỡ cuối không còn aria-busy="true" nào.
    expect(busyOn(rec, 'product-price').filter((r) => r.v === 'true')).toHaveLength(1);
    await expect(page.getByTestId('product-price')).not.toHaveAttribute('aria-busy', /.*/);
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T555 fixture: dòng giỏ đổi số lượng', () => {
  test('trễ 1 500 ms: −/+/xoá aria-disabled ngay khi ghi, dòng aria-busy (spinner stepper) sau ~500 ms, hết khi xong; debounce 300 giữ', async ({ page }) => {
    const { hits, errors } = await serve(page, '/cart', 1500);
    const line = page.getByTestId('cart-line');
    await expect(page.getByTestId('cart-line-increase')).toBeVisible();
    await page.getByTestId('cart-line-increase').click();
    await expect(page.getByTestId('cart-line-increase')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByTestId('cart-checkout')).toHaveAttribute('aria-disabled', 'true');
    await expect(line).toHaveAttribute('aria-busy', 'true');
    await expect(line).not.toHaveAttribute('aria-busy', /.*/, { timeout: 5_000 });
    await expect(page.getByTestId('cart-items-status')).toHaveText('Cart updated');
    await expect(page.getByTestId('cart-line-quantity')).toHaveValue('2');
    const { rec } = await records(page);
    const lock = firstTrue(rec, 'cart-line-increase', 'aria-disabled')!;
    const on = firstTrue(rec, 'cart-line')!;
    expect(on.t - lock.t, 'spinner dòng sau ngưỡng tính từ lúc khoá').toBeGreaterThanOrEqual(EARLY);
    expect(on.t - lock.t).toBeLessThanOrEqual(LATE);
    expect(hits.change).toBe(1);
    expect(errors).toEqual([]);
  });

  test('trễ 200 ms: dòng không aria-busy; khoá rồi mở lại', async ({ page }) => {
    const { hits, errors } = await serve(page, '/cart', 200);
    await expect(page.getByTestId('cart-line-increase')).toBeVisible();
    await page.getByTestId('cart-line-increase').click();
    await expect.poll(() => hits.change).toBe(1);
    await page.waitForTimeout(DELAY + 400);
    await expect(page.getByTestId('cart-items')).not.toHaveAttribute('aria-busy', /.*/);
    await expect(page.getByTestId('cart-line-increase')).not.toHaveAttribute('aria-disabled', /.*/);
    await expect(page.getByTestId('cart-checkout')).not.toHaveAttribute('aria-disabled', /.*/);
    const { rec } = await records(page);
    expect(firstTrue(rec, 'cart-line-increase', 'aria-disabled'), '−/+ khoá lúc ghi').toBeTruthy();
    expect(firstTrue(rec, 'cart-checkout', 'aria-disabled'), 'Checkout khoá lúc ghi').toBeTruthy();
    expect(busyOn(rec, 'cart-line')).toEqual([]);
    expect(hits.change).toBe(1);
    expect(errors).toEqual([]);
  });
});
