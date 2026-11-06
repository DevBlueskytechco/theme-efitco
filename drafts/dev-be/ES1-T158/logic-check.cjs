// ES1-T158: kiểm logic bằng DOM giả trong Node, không thay được E2E. Chạy: node drafts/dev-be/ES1-T158/logic-check.cjs
const fs = require('node:fs');
const assert = require('node:assert');

const defined = {};
globalThis.customElements = { get: (n) => defined[n], define: (n, c) => (defined[n] = c) };
globalThis.HTMLElement = class {};
globalThis.HTMLInputElement = class {};
let intervals = 0;
const live = new Set();
globalThis.setInterval = (fn) => {
  intervals += 1;
  const id = { fn };
  live.add(id);
  return id;
};
globalThis.clearInterval = (id) => live.delete(id);
const observers = [];
globalThis.IntersectionObserver = class {
  constructor(cb) {
    this.cb = cb;
    observers.push(this);
  }
  observe(el) {
    this.el = el;
  }
  disconnect() {}
  fire(on) {
    this.cb([{ isIntersecting: on }]);
  }
};
globalThis.matchMedia = () => ({ matches: false });
let now = 0;
Date.now = () => now;
const doc = { hidden: false, activeElement: null, addEventListener() {}, count: 1, querySelectorAll: () => ({ length: doc.count }) };
globalThis.document = doc;

const load = (file, patch = (s) => s) => new Function(patch(fs.readFileSync(file, 'utf8')))();

// ---------- countdown
load('assets/featured-product.js');
const F = defined['featured-product'];
const cell = () => ({ textContent: '', parentNode: { hidden: false } });

function featured(end) {
  observers.length = 0;
  const values = [cell(), cell(), cell(), cell()];
  const box = end == null ? null : { dataset: { end: String(end) }, hidden: false, querySelectorAll: () => values };
  const el = new F();
  el.dataset = {};
  el.addEventListener = () => {};
  el.querySelector = (s) => (s === '[data-end]' ? box : null);
  el.querySelectorAll = () => [];
  el.connectedCallback();
  return { el, box, values };
}
const shown = (values) => values.map((c) => c.textContent).join(':');

now = 1000e3;
let f = featured(1000 + 90061);
assert.equal(shown(f.values), '01:01:01:01');
assert.equal(f.values[0].parentNode.hidden, false);
assert.ok('enhanced' in f.el.dataset);
assert.equal(live.size, 0, 'chưa vào khung thì chưa có timer');
observers[0].fire(true);
assert.equal(live.size, 1);
now += 1000;
[...live][0].fn();
assert.equal(shown(f.values), '01:01:01:00', 'mỗi lần tính lại từ Date.now');
now += 5000e3;
f.el.run();
assert.equal(live.size, 1, 'run không nhân đôi timer');
observers[0].fire(false);
assert.equal(live.size, 0, 'ra khỏi khung dừng timer');
now = 1000e3 + 3700e3 * 0 + 86400e3 + 100e3;
observers[0].fire(true);
now = 1000e3;
doc.hidden = true;
f.el.run();
assert.equal(live.size, 0, 'tab ẩn dừng timer');
doc.hidden = false;
f.el.run();
assert.equal(shown(f.values), '01:01:01:01', 'quay lại tính lại ngay');
assert.equal(live.size, 1);

now += 90061e3;
[...live][0].fn();
assert.equal(f.box.hidden, true, 'hết hạn thì hidden');
assert.equal(live.size, 0, 'hết hạn dừng timer');
now -= 90061e3;
f.el.run();
observers[0].fire(true);
assert.equal(f.box.hidden, true, 'không hiện lại dù đồng hồ lùi');

// Dưới 1 ngày: ô days hidden. Quá hạn khi tải: hidden ngay, không observer, vẫn data-enhanced.
f = featured(now / 1000 + 3600);
assert.equal(f.values[0].parentNode.hidden, true);
assert.equal(shown(f.values), '00:01:00:00');
f = featured(now / 1000 - 5);
assert.equal(f.box.hidden, true);
assert.equal(observers.length, 0);
assert.ok('enhanced' in f.el.dataset);
// Không có khung countdown vẫn chạy.
f = featured(null);
assert.ok('enhanced' in f.el.dataset);
assert.equal(observers.length, 0);

// ---------- gallery + JSON
function gallery(count) {
  doc.count = count;
  const scroll = [];
  const thumb = { dataset: { featuredMediaId: '22' }, ariaCurrent: null };
  const other = { dataset: { featuredMediaId: '11' }, ariaCurrent: 'true' };
  const price = { innerHTML: 'old' };
  const label = { textContent: 'Add' };
  const add = { disabled: false, querySelector: () => label };
  const json = { textContent: JSON.stringify({ variants: [{ id: 5, available: false, price_html: '<b>new</b>' }] }) };
  const el = new F();
  el.dataset = {};
  el.addEventListener = () => {};
  el.querySelectorAll = () => [thumb, other];
  el.querySelector = (s) => {
    if (s === 'ul') return { offsetLeft: 10, scrollTo: (o) => scroll.push(o) };
    if (s.startsWith('li[')) return s.includes('"22"') ? { offsetLeft: 310 } : null;
    if (s === 'script') return json;
    if (s === 'product-form') return { dataset: { labelAdd: 'Add', labelSoldOut: 'Sold out' } };
    if (s === '[name="add"]') return add;
    if (s === '.featured-product__price') return price;
    return null;
  };
  return { el, scroll, thumb, other, price, label, add };
}
let g = gallery(1);
g.el.handleEvent({ type: 'theme:variant:change', detail: { variantId: 5, featuredMediaId: 22 } });
assert.deepEqual(g.scroll, [{ left: 300, behavior: 'smooth' }]);
assert.equal(g.thumb.ariaCurrent, 'true');
assert.equal(g.other.ariaCurrent, null);
assert.equal(g.price.innerHTML, 'old', '1 block: giữ partial');
g.el.handleEvent({ type: 'theme:variant:change', detail: { variantId: 5, featuredMediaId: null } });
assert.equal(g.scroll.length, 1, 'variant không có ảnh: không cuộn');
g = gallery(2);
g.el.handleEvent({ type: 'theme:variant:change', detail: { variantId: 5, featuredMediaId: 22 } });
assert.equal(g.price.innerHTML, '<b>new</b>', 'nhiều block: render từ JSON');
assert.equal(g.add.disabled, true);
assert.equal(g.label.textContent, 'Sold out');
let prevented = 0;
g = gallery(1);
g.el.handleEvent({ type: 'click', target: { closest: () => ({ dataset: { featuredMediaId: '22' } }) }, preventDefault: () => (prevented += 1) });
assert.equal(prevented, 1);
assert.equal(g.scroll.length, 1);
g.el.handleEvent({ type: 'click', target: { closest: () => null }, preventDefault: () => (prevented += 1) });
assert.equal(prevented, 1, 'click ngoài thumbnail: không chặn');
doc.count = 1;

// ---------- video
load('assets/video-carousel.js');
const V = defined['video-card'];
function card(kind, productUrl = '/products/a') {
  observers.length = 0;
  const media = { localName: kind === 'shopify' ? 'video' : 'iframe', plays: 0, paused: true, error: null, removed: false };
  media.cloneNode = () => media;
  media.play = () => ((media.plays += 1), (media.paused = false), Promise.resolve());
  media.pause = () => (media.paused = true);
  media.focus = () => (doc.activeElement = media);
  media.remove = () => (media.removed = true);
  media.replaceWith = () => (media.isConnected = false);
  const label = { textContent: 'Play' };
  const poster = {
    hidden: false,
    href: '/x',
    parentElement: {},
    placed: 0,
    after() {
      this.placed += 1;
    },
    replaceWith() {
      media.isConnected = true;
    },
    focus() {},
    querySelector: () => label,
  };
  const el = new V();
  el.dataset = { videoKind: kind, labelError: 'Err', ...(productUrl ? { productUrl } : {}) };
  el.addEventListener = () => {};
  el.hasAttribute = () => 'videoError' in el.dataset;
  el.querySelector = (s) => (s === '[data-video-poster]' ? poster : { content: { querySelector: (q) => (q === media.localName ? media : null) } });
  el.connectedCallback();
  return { el, media, poster, label, io: observers[0] };
}
const clickOn = (c, extra = {}) => {
  let stopped = false;
  c.el.handleEvent({ type: 'click', target: { closest: () => c.poster }, preventDefault: () => (stopped = true), ...extra });
  return stopped;
};

let a = card('shopify');
assert.equal(a.el.video, undefined, 'ngoài khung chưa có video');
a.io.fire(true);
a.io.fire(true);
assert.equal(a.poster.placed, 1, 'clone 1 lần');
assert.equal(a.media.plays, 0, 'không tự chạy');
assert.equal(clickOn(a, { ctrlKey: true }), false, 'phím bổ trợ để link chạy');
assert.equal(clickOn(a), true);
assert.equal(a.media.plays, 1);
assert.equal(a.poster.hidden, true);
a.io.fire(false);
assert.equal(a.media.paused, true, 'rời khung thì pause');

let b = card('shopify', null);
b.io.fire(true);
clickOn(a);
assert.equal(a.media.paused, false);
clickOn(b);
assert.equal(a.media.paused, true, 'chỉ 1 video chạy');
assert.equal(b.media.paused, false);

const ext = card('external');
ext.io.fire(true);
assert.equal(ext.el.frame, undefined, 'iframe chỉ khi bấm');
assert.equal(clickOn(ext), true);
assert.equal(ext.media.isConnected, true);
assert.equal(doc.activeElement, ext.media);
assert.equal(b.media.paused, true, 'iframe chạy thì video dừng');
ext.io.fire(false);
assert.equal(ext.media.isConnected, false, 'rời khung: iframe trả về poster');

// Lỗi: source chưa phải cuối thì bỏ qua; nguồn cuối thì fail.
a = card('shopify');
a.io.fire(true);
a.el.handleEvent({ type: 'error', target: { localName: 'img' } });
a.el.handleEvent({ type: 'error', target: { localName: 'source', nextElementSibling: {} } });
assert.equal(a.media.removed, false);
a.el.handleEvent({ type: 'error', target: { localName: 'source', nextElementSibling: null } });
assert.equal(a.media.removed, true);
assert.ok('videoError' in a.el.dataset);
assert.equal(a.poster.href, '/products/a');
assert.equal(a.poster.hidden, false);
assert.equal(a.label.textContent, 'Err');
a.io.fire(true);
assert.equal(a.poster.placed, 1, 'lỗi rồi không clone lại');
assert.equal(clickOn(a), false, 'lỗi rồi để link chạy');

b = card('shopify', null);
b.io.fire(true);
b.el.handleEvent({ type: 'error', target: { localName: 'video', error: {} } });
assert.equal(b.poster.href, '/x', 'không product: giữ href');

// ---------- picker: bỏ import tĩnh, partials giả
const calls = [];
globalThis.partials = { fetch: async (...a) => (calls.push(a), {}), apply: async () => calls.push('apply') };
const replaced = [];
globalThis.window = { location: { href: 'https://s.test/', search: '' }, history: { state: null, replaceState: (...a) => replaced.push(a) }, addEventListener() {}, removeEventListener() {} };
globalThis.CustomEvent = class {
  constructor(t, o) {
    this.type = t;
    this.detail = o.detail;
  }
};
const noImport = (s) => s.replace(/^import .*$/m, '').replace(/import\("https[^"]+"\)/, 'Promise.resolve(null)');
load('assets/product-variant-picker.js', noImport);
const P = defined['product-variant-picker'];

function picker(dataset, checked, id) {
  const data = { variants: [{ id: 1, options: ['A'], available: true }, { id: 2, options: ['B'], available: true }], options: ['Size'], product: {} };
  const idInput = { value: String(id) };
  const fieldset = { querySelector: () => (checked ? { value: checked } : null), querySelectorAll: () => [] };
  const events = [];
  const el = new P();
  el.dataset = { formId: 'f', ...dataset };
  el.addEventListener = () => {};
  el.dispatchEvent = (e) => events.push(e);
  el.closest = () => null;
  el.contains = () => true;
  el.querySelector = () => ({ textContent: JSON.stringify(data) });
  el.querySelectorAll = () => [fieldset];
  doc.getElementById = () => ({ addEventListener() {}, querySelector: (q) => (q.includes('selling_plan') ? null : idInput) });
  doc.querySelectorAll = (s) => (s === 'featured-product' ? { length: doc.count } : []);
  el.connectedCallback();
  return { el, idInput, events, data };
}

(async () => {
  // Trang sản phẩm: không có 2 data mới, lệch cũng không tự chạy khi kết nối, vẫn replaceState và 6 region.
  calls.length = 0;
  let p = picker({}, 'B', 1);
  assert.equal(p.idInput.value, '1', 'trang sản phẩm: kết nối không đổi hành vi');
  await p.el.update(p.data.variants[1]);
  assert.equal(replaced.length, 1);
  assert.equal(calls[0].length, 7);
  assert.match(calls[0][6].url, /^https:\/\/s\.test\/\?variant=2$/);

  // Trang chủ 1 block: fetch URL riêng, 2 region, không replaceState.
  calls.length = 0;
  replaced.length = 0;
  p = picker({ fetchUrl: '/products/a?view=featured-product', regions: 'product-price product-buy-buttons' }, 'A', 1);
  assert.equal(calls.length, 0, 'khớp thì không fetch khi kết nối');
  await p.el.update(p.data.variants[1]);
  assert.equal(replaced.length, 0);
  assert.deepEqual(calls[0].slice(0, 2), ['product-price', 'product-buy-buttons']);
  assert.equal(calls[0][2].url, 'https://s.test/products/a?view=featured-product&variant=2');
  assert.equal(calls[1], 'apply');

  // Chọn trước khi module nạp: id theo radio.
  calls.length = 0;
  p = picker({ fetchUrl: '/products/a?view=featured-product', regions: 'product-price' }, 'B', 1);
  assert.equal(p.idInput.value, '2');
  assert.equal(p.events[0].type, 'theme:variant:change');

  await new Promise(setImmediate); // chờ apply của picker trước.
  // Nhiều block: có event, không fetch, không aria-busy.
  doc.count = 2;
  calls.length = 0;
  p = picker({ fetchUrl: '/products/a?view=featured-product', regions: 'product-price' }, 'A', 1);
  await p.el.update(p.data.variants[1]);
  assert.equal(p.idInput.value, '2');
  assert.equal(p.events.at(-1).detail.variantId, 2);
  assert.equal(calls.length, 0);
  console.log('logic-check: pass');
})();
