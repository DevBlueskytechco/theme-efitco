// ES1-T149: kiểm logic assets/bundle-form.js bằng DOM giả trong Node. Không thay được E2E: không có layout, selector thật, thư viện event thật.
// Chạy: node drafts/dev-be/ES1-T149/logic-check.cjs
const fs = require('fs'), assert = require('assert');
const src = fs.readFileSync('assets/bundle-form.js', 'utf8').replace('import("https://cdn.shopify.com/storefront/standard-events.js")', 'Promise.resolve(globalThis.__lib)');
class Base {
  constructor(attrs = {}) { this.attrs = { ...attrs }; this.kids = []; this.dataset = {}; this.textContent = ''; this.style = { p: {}, setProperty: (k, v) => (this.style.p[k] = v) }; }
  hooks(a) { const o = []; const w = (e) => { for (const k of e.kids) { if (a in k.attrs) o.push(k); w(k); } }; w(this); return o; }
  querySelector(sel) { return this.hooks(sel.slice(1, -1))[0] || null; }
  querySelectorAll(sel) { return sel.includes(':is(') ? this.hooks('data-bundle-item').filter((i) => i.type == 'hidden' || (i.checked && !i.disabled)) : this.hooks(sel.slice(1, -1)); }
  toggleAttribute(n, on) { if (on) this.attrs[n] = ''; else delete this.attrs[n]; }
  setAttribute(n, v) { this.attrs[n] = String(v); }
  addEventListener() {}
  dispatchEvent(e) { globalThis.__events.push(e); return true; }
  closest(sel) { return sel.slice(1, -1) in this.attrs ? this : null; }
  replaceChildren(...k) { this.kids = k; }
  focus() {}
}
globalThis.HTMLElement = Base;
let Cls;
globalThis.customElements = { define: (n, c) => (Cls = c), get: () => true };
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; Object.assign(this, init); } };
globalThis.document = { querySelector: () => ({}), activeElement: null, body: {} };
globalThis.location = { assign: (u) => (globalThis.__went = u) };
globalThis.addEventListener = () => {};
globalThis.__events = [];
class Evt {
  constructor(i) { Object.assign(this, i); this.type = 'shopify:cart:lines-update'; }
  static createPromise() { const d = {}; d.promise = new Promise((r) => (d.resolve = r)); return d; }
  static createCartFromAjaxResponse(c) { return { wrapped: c }; }
}
globalThis.__lib = { CartLinesUpdateEvent: Evt };
(0, eval)(src);

const box = (id, price, extra = {}) => { const e = new Base({ 'data-bundle-item': '' }); Object.assign(e, { type: 'checkbox', value: id, checked: false, disabled: false }, extra); e.dataset = { price: String(price), title: 'P' + id }; return e; };
const hook = (n) => new Base({ ['data-bundle-' + n]: '' });
function build() {
  const r = new Cls();
  r.dataset = { locale: 'en', currency: 'USD', tiers: '3:15,2:10,2:5', labelCountOne: '%n Item', labelCountOther: '%n Items', labelDiscount: 'Off (%p%)', labelProgressOne: 'Add %n more item to unlock %p% off', labelProgress: 'Add %n more items to unlock %p% off', labelProgressDone: 'You reached %p% off', labelStatus: '%n selected, total %t', labelError: 'ERR', cartAddUrl: '/cart/add', cartUrl: '/cart', cartType: 'drawer' };
  const h = {};
  for (const n of ['count', 'subtotal', 'total', 'discount-row', 'discount-label', 'discount', 'empty', 'lines', 'progress', 'progress-text', 'status', 'error', 'submit']) h[n] = hook(n);
  const tpl = hook('line-template');
  tpl.content = { cloneNode: () => { const li = new Base(); li.kids = [hook('line-title'), hook('line-price')]; return li; } };
  r.items = [box(1, 1000), box(2, 2000), box(3, 3333), box(4, 500, { disabled: true, checked: true })];
  r.kids = [...r.items, ...Object.values(h), tpl];
  r.h = h;
  return r;
}
const without = (r, ...names) => { r.kids = r.kids.filter((k) => !names.some((n) => 'data-bundle-' + n in k.attrs)); };
const submit = (r) => r.add({ preventDefault() {} });

(async () => {
  const r = build();
  r.items[0].checked = true; // tick trước khi nâng cấp; món disabled + checked không tính
  r.connectedCallback();
  assert.equal(r.h.count.textContent, '1 Item');
  assert('data-enhanced' in r.attrs);
  assert('hidden' in r.h['discount-row'].attrs);
  assert('hidden' in r.h.empty.attrs);
  assert.equal(r.h.lines.kids.length, 1);
  assert.equal(r.h.lines.kids[0].kids[0].textContent, 'P1');
  assert.equal(r.h['progress-text'].textContent, 'Add 1 more item to unlock 10% off');
  assert.equal(r.h.total.textContent, '$10.00');

  r.items[1].checked = true;
  r.handleEvent({ type: 'change' });
  assert.equal(r.h.discount.textContent, '$3.00');
  assert.equal(r.h.total.textContent, '$27.00');
  assert.equal(r.h['discount-label'].textContent, 'Off (10%)'); // trùng ngưỡng 2: lấy percent cao hơn
  assert(!('hidden' in r.h['discount-row'].attrs));
  assert.equal(r.h['progress-text'].textContent, 'Add 1 more item to unlock 15% off');
  assert.equal(r.h.status.textContent, ''); // debounce

  r.items[2].checked = true;
  r.handleEvent({ type: 'change' });
  assert.equal(r.h.subtotal.textContent, '$63.33');
  assert.equal(r.h.discount.textContent, '$9.50');
  assert.equal(r.h.total.textContent, '$53.83');
  assert.equal(r.h['progress-text'].textContent, 'You reached 15% off');
  assert.equal(r.h.progress.style.p['--bundle-progress'], '100%');
  await new Promise((s) => setTimeout(s, 350));
  assert.equal(r.h.status.textContent, '3 selected, total $53.83');

  for (const i of r.items) i.checked = false;
  r.handleEvent({ type: 'change' });
  assert.equal(r.h.count.textContent, '0 Items');
  assert(!('hidden' in r.h.empty.attrs));
  assert.equal(r.h['progress-text'].textContent, 'Add 2 more items to unlock 10% off');
  assert.equal(r.h.progress.style.p['--bundle-progress'], '0%');

  // Không có món: chặn submit, không request.
  let calls = [];
  let prevented = 0;
  globalThis.fetch = async (u, o) => { calls.push([u, o]); return { ok: true, status: 200, json: async () => ({ items: [] }) }; };
  await r.add({ preventDefault: () => prevented++ });
  assert.equal(prevented, 1);
  assert.equal(calls.length, 0);

  // Thành công, id trùng gộp quantity, bấm lại trong lúc gửi không thêm request.
  r.items[0].checked = r.items[1].checked = true;
  r.items[0].value = r.items[1].value = 1;
  globalThis.__events = [];
  const first = submit(r);
  assert.equal(r.h.submit.disabled, true);
  assert.equal(r.h.submit.ariaBusy, 'true');
  await submit(r);
  await first;
  const posts = calls.filter((c) => c[1].method == 'POST');
  assert.equal(posts.length, 1);
  assert.equal(posts[0][0], '/cart/add.js');
  assert.deepEqual(JSON.parse(posts[0][1].body), { items: [{ id: 1, quantity: 2 }] });
  assert.equal(calls[1][0], '/cart.js');
  assert.deepEqual(__events.map((e) => e.type), ['shopify:cart:lines-update', 'theme:cart:updated']);
  assert.deepEqual(__events[0].lines, [{ merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 2 }]);
  assert.equal(__events[0].context, 'product');
  const done = await __events[0].promise;
  assert.deepEqual(done.cart, { wrapped: { items: [] } });
  assert.deepEqual(done.userErrors, []);
  assert.equal(__events[1].detail.source, 'bundle-form');
  assert.equal(__events[1].detail.opener, r.h.submit);
  assert(!r.h.submit.disabled); // DOM thật ép undefined thành false
  assert.equal(r.h.submit.ariaBusy, null);
  assert.equal(globalThis.__went, undefined);
  assert.equal(r.items[0].checked, true); // giữ lựa chọn

  // cart type page: rời trang, giữ khoá; bfcache mở khoá.
  r.dataset.cartType = 'page';
  await submit(r);
  assert.equal(__went, '/cart');
  assert.equal(r.h.submit.disabled, true);
  r.handleEvent({ type: 'pageshow', persisted: true });
  assert(!r.h.submit.disabled); // DOM thật ép undefined thành false
  r.dataset.cartType = 'drawer';
  globalThis.__went = undefined;

  // 422: nguyên description, không theme:cart:updated, resolve userErrors.
  const name = "The product 'X' is already sold out.";
  globalThis.__events = [];
  globalThis.fetch = async (u, o) => (o.method ? { ok: false, status: 422, json: async () => ({ description: name }) } : { ok: true, json: async () => ({}) });
  await submit(r);
  assert.equal(r.h.error.textContent, name);
  assert.deepEqual(__events.map((e) => e.type), ['shopify:cart:lines-update']);
  assert.deepEqual((await __events[0].promise).userErrors, [{ message: name }]);
  assert(!r.h.submit.disabled); // DOM thật ép undefined thành false

  // Mạng, 5xx, 5xx có description, 4xx không description: label, 1 request, không rời trang.
  for (const reply of [
    async () => { throw new TypeError('net'); },
    async () => ({ ok: false, status: 500, json: async () => { throw new Error('html'); } }),
    async () => ({ ok: false, status: 503, json: async () => ({ description: 'x' }) }),
    async () => ({ ok: false, status: 400, json: async () => ({}) }),
  ]) {
    globalThis.__events = [];
    let n = 0;
    globalThis.fetch = () => { n++; return reply(); };
    await submit(r);
    assert.equal(r.h.error.textContent, 'ERR');
    assert.equal(n, 1);
    assert.equal((await __events[0].promise).cart, null);
    assert.equal(__events.length, 1);
    assert.equal(globalThis.__went, undefined);
    assert(!r.h.submit.disabled); // DOM thật ép undefined thành false
  }

  // AbortError: không báo lỗi.
  globalThis.__events = [];
  r.h.error.textContent = '';
  globalThis.fetch = async () => { const e = new Error('a'); e.name = 'AbortError'; throw e; };
  await submit(r);
  assert.equal(r.h.error.textContent, '');

  // Không có thư viện: không event, vẫn gửi.
  globalThis.__events = [];
  const saved = globalThis.__lib;
  delete saved.CartLinesUpdateEvent;
  let sent = 0;
  globalThis.fetch = async () => { sent++; return { ok: true, status: 200, json: async () => ({}) }; };
  await submit(r);
  assert.equal(sent, 1);
  assert.deepEqual(__events.map((e) => e.type), ['theme:cart:updated']);
  saved.CartLinesUpdateEvent = Evt;

  // Không bậc: không tính giảm, không có progress, không có dòng giảm.
  const plain = build();
  delete plain.dataset.tiers;
  without(plain, 'progress', 'progress-text', 'discount-row', 'discount', 'discount-label');
  plain.items[0].checked = plain.items[1].checked = true;
  plain.connectedCallback();
  assert.equal(plain.h.total.textContent, '$30.00');

  // Shop the look: hidden luôn tính, thiếu hook bỏ qua; hotspot và row.
  const look = build();
  look.dataset.tiers = '2:10';
  without(look, 'progress', 'progress-text', 'line-template', 'lines', 'empty');
  look.items = look.items.slice(0, 2);
  for (const i of look.items) i.type = 'hidden';
  look.kids = look.kids.filter((k) => !k.attrs['data-bundle-item'] === false ? look.items.includes(k) : true);
  const add = (attr, v, key) => { const e = new Base({ [attr]: '' }); e.dataset[key] = v; look.kids.push(e); return e; };
  const spots = [1, 2, 3, 4].map((n) => add('data-hotspot', String(n), 'hotspot'));
  const rows = [1, 2, 3, 4, 5].map((n) => add('data-look-row', String(n), 'lookRow'));
  look.connectedCallback();
  assert.equal(look.h.count.textContent, '2 Items');
  assert.equal(look.h.total.textContent, '$27.00');
  const active = () => rows.filter((x) => 'data-look-active' in x.attrs).map((x) => x.dataset.lookRow);
  const pressed = () => spots.filter((x) => x.attrs['aria-pressed'] == 'true').map((x) => x.dataset.hotspot);
  look.handleEvent({ type: 'pointerover', target: spots[2] });
  assert.deepEqual(active(), ['3']);
  assert.deepEqual(pressed(), []);
  look.handleEvent({ type: 'focusin', target: spots[3] });
  assert.deepEqual(active(), ['4']);
  look.handleEvent({ type: 'click', target: spots[1] });
  assert.deepEqual(active(), ['2']);
  assert.deepEqual(pressed(), ['2']);
  look.handleEvent({ type: 'click', target: rows[2] });
  assert.deepEqual(active(), ['3']);
  assert.deepEqual(pressed(), ['3']);
  look.handleEvent({ type: 'click', target: rows[4] });
  assert.deepEqual(active(), ['5']);
  assert.deepEqual(pressed(), []);
  look.handleEvent({ type: 'pointerover', target: rows[0] }); // hover row không đổi gì
  assert.deepEqual(active(), ['5']);
  look.handleEvent({ type: 'click', target: new Base() }); // bấm ngoài row, hotspot
  assert.deepEqual(active(), ['5']);

  console.log('logic-check: pass');
})().catch((e) => { console.error(e); process.exit(1); });
