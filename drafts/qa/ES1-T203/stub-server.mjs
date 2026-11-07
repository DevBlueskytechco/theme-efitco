// Storefront giả cho ES1-T203, chỉ để chạy thử spec khi phiên QA không vào được store, không thay CI.
// Asset thật: assets/*.js, base.css. Markup chép từ blocks/cart-page.liquid, cart-drawer.liquid, snippets/cart-lines.liquid, cart-summary.liquid, blocks/header.liquid.
// Giả: thư viện partial (định dạng response tự đặt), standard-events, Shopify.actions (ghi qua /cart/add.js, store thật ghi qua Storefront API).
// Có giỏ thật theo cookie để chạy được luồng thật. cdn.shopify.com giả nằm ở pw.local.config.ts.
// Chạy: node drafts/qa/ES1-T203/stub-server.mjs <cổng>
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';

const [port, mutation] = process.argv.slice(2);

// Kiểm spec có bắt được lỗi không (pw.mutant.config.ts): đổi code JS lúc phục vụ, file trong assets/ không đổi.
const MUTATIONS = {
  'no-abort': ['cart-items.js', 'this.ctl?.abort();', ''],
  'no-revert': ['cart-items.js', 'if (i) i.value = i.defaultValue;', ''],
  'no-debounce': ['cart-items.js', ', 300)', ', 0)'],
  'parallel-writes': ['cart-items.js', 'if (this.running) return;', ''],
  'no-resync': ['cart-items.js', 'this.sync(this.items);', ''],
  'no-remove-prevent': ['cart-items.js', 'e.preventDefault();\n      this.add(key, 0);', 'this.add(key, 0);'],
  'no-status': ['cart-items.js', 'this.say("status", this.note);', ''],
  'no-emit': ['cart-items.js', 'const settle = this.emit(key, quantity);', 'const settle = () => {};'],
  'open-no-modal': ['cart-drawer.js', 'this.dialog.showModal()', 'this.dialog.show()'],
  'no-restore': ['cart-drawer.js', 'if (type === "close") return this.restore();', ''],
  'no-link-prevent': ['cart-drawer.js', 'e.preventDefault();\n      return this.refresh(true, link);', 'return this.refresh(true, link);'],
  'no-fallback': ['cart-drawer.js', 'if (open && !signal.aborted) location.assign(this.dataset.cartUrl);', ''],
};
const mutate = (name, source) => {
  const m = MUTATIONS[mutation];
  if (!m || m[0] !== name) return source;
  const text = source.toString();
  if (!text.includes(m[1])) throw new Error(`Mutation ${mutation} không khớp code`);
  return text.replace(m[1], m[2]);
};
const carts = new Map();
const UNIT = 1000;

const money = (c) => (c / 100).toFixed(2);
const item = (l) => ({
  id: l.id, variant_id: l.id, key: l.key, quantity: l.quantity, properties: l.properties, title: 'Stub', product_title: 'Stub', price: UNIT, final_price: UNIT,
  final_line_price: l.quantity * UNIT, url: '/products/stub',
});
const cartJson = (lines) => ({
  token: 'stub', note: '', attributes: {}, item_count: lines.reduce((s, l) => s + l.quantity, 0), total_price: lines.reduce((s, l) => s + l.quantity * UNIT, 0),
  items_subtotal_price: lines.reduce((s, l) => s + l.quantity * UNIT, 0), items: lines.map(item), currency: 'USD', cart_level_discount_applications: [],
});

function linesHtml(cart, context) {
  const form = `cart-form-${context}`;
  if (!cart.item_count) return `<div class="cart-empty" data-testid="cart-empty"><p class="cart-empty__text">Your cart is empty.</p><a class="button" href="/collections/all" data-testid="cart-empty-cta">Continue shopping</a></div>`;
  const rows = cart.items.map((it, i) => `<li class="cart-line" data-line-key="${it.key}" data-testid="cart-line">
    <div class="cart-line__image cart-line__image--empty" data-testid="cart-line-image"></div>
    <div class="cart-line__details"><a class="cart-line__title" href="${it.url}" data-testid="cart-line-title">Stub</a><div class="price"><span class="price__current" data-testid="cart-line-price">${money(it.final_price)}</span></div></div>
    <div class="cart-line__controls"><label class="visually-hidden" for="q-${context}-${i}">Quantity for Stub</label>
      <input id="q-${context}-${i}" class="cart-line__quantity" type="number" name="updates[]" value="${it.quantity}" min="0" inputmode="numeric" form="${form}" data-testid="cart-line-quantity">
      <a class="cart-line__remove" href="/cart/change?id=${encodeURIComponent(it.key)}&amp;quantity=0" aria-label="Remove Stub" data-cart-remove data-testid="cart-line-remove">Remove</a></div>
    <p class="cart-line__total"><span class="visually-hidden">Line total</span><span data-testid="cart-line-total">${money(it.final_line_price)}</span></p></li>`).join('');
  return `<ul class="cart-lines" role="list" data-testid="cart-lines">${rows}</ul><button class="button button--secondary cart-update" type="submit" name="update" form="${form}" data-cart-update data-testid="cart-update">Update</button>`;
}

const summaryHtml = (cart, context) => (cart.item_count ? `<div class="cart-summary"><p class="cart-summary__row"><span>Subtotal</span><span data-testid="cart-subtotal">${money(cart.items_subtotal_price)}</span></p>
  <p class="cart-summary__row cart-summary__row--total"><span>Total</span><span data-testid="cart-total">${money(cart.total_price)}</span></p>
  <button class="button cart-summary__checkout" type="submit" name="checkout" form="cart-form-${context}" data-testid="cart-checkout">Checkout</button></div>` : '');

const bodyHtml = (cart, context) => `<div class="cart-${context}__body" data-item-count="${cart.item_count}" data-testid="cart-${context}-body" data-partial="cart-${context}">
  <form id="cart-form-${context}" class="cart-${context}__form" action="/cart" method="post" data-testid="cart-form"><div class="cart-${context}__main">${linesHtml(cart, context)}</div>${summaryHtml(cart, context)}</form></div>`;

const countHtml = (cart, active) => `<a class="site-header__icon" href="/cart" data-testid="header-cart-link" data-partial="cart-count" aria-label="Cart (${cart.item_count} items)" ${active ? 'data-cart-link aria-haspopup="dialog"' : ''}><span aria-hidden="true">C</span>${cart.item_count ? `<span class="site-header__cart-count" data-testid="header-cart-count" aria-hidden="true">${cart.item_count}</span>` : ''}</a>`;

const LABELS = 'data-cart-change-url="/cart/change" data-cart-url="/cart" data-label-updated="Cart updated." data-label-removed="Item removed from cart." data-label-error="Something went wrong." data-label-quantity-adjusted="Quantity changed to the amount available."';

const itemsWrap = (partials, inner, extra = '') => `<cart-items class="cart-items" ${LABELS} data-partials="${partials}" data-testid="cart-items">
  <div class="visually-hidden" role="status" aria-live="polite" data-testid="cart-items-status"></div><div class="cart-items__error" role="alert" data-testid="cart-items-error"></div>${inner}${extra}</cart-items>`;

function drawerHtml(cart, mode) {
  const dialog = mode === 'drawer' ? `<dialog id="CartDrawer" class="cart-drawer__dialog" aria-labelledby="H" data-testid="cart-drawer-dialog">
    <div class="cart-drawer__head"><h2 id="H" class="cart-drawer__heading" data-testid="cart-drawer-heading">Cart</h2><form method="dialog"><button class="cart-drawer__close" aria-label="Close" data-testid="cart-drawer-close">x</button></form></div>
    ${itemsWrap('cart-drawer cart-count', bodyHtml(cart, 'drawer'))}</dialog>` : '';
  return `<cart-drawer class="cart-drawer" data-mode="${mode}" data-cart-url="/cart" data-items-src="/assets/cart-items.js" data-testid="cart-drawer">${dialog}<script src="/assets/cart-drawer.js" type="module"></script></cart-drawer>`;
}

const productMain = `<product-form data-product-id="1" data-cart-add-url="/cart/add" data-cart-url="/cart" data-cart-type="drawer" data-label-added="Added" data-testid="product-form">
  <form id="product-form-1" action="/cart/add" method="post"><input type="hidden" name="id" value="777" data-testid="product-form-variant-id"><button type="submit" name="add" class="button" data-testid="product-form-add">Add to cart</button></form>
  <p role="status" data-testid="product-form-status"></p><p role="alert" data-testid="product-form-error"></p></product-form><script src="/assets/product-form.js" type="module"></script>`;

const cartMain = (cart) => `<div class="cart-page" data-testid="cart-page"><h1 class="cart-page__heading" tabindex="-1" data-testid="cart-page-heading">Cart</h1>
  ${itemsWrap('cart-page cart-count', bodyHtml(cart, 'page'), `<div class="cart-page__note"><label for="n">Order note</label><textarea id="n" name="note" form="cart-form-page" data-testid="cart-page-note"></textarea></div>`)}
  <script src="/assets/cart-items.js" type="module"></script></div>`;

// updateCart ghi qua /cart/add.js ở đây; handler của theme chạy thật qua configure.
const ACTIONS = `<script>
(() => {
  const event = async (detail) => { const m = await import('https://cdn.shopify.com/storefront/standard-events.js'); const d = m.CartLinesUpdateEvent.createPromise(); document.dispatchEvent(new m.CartLinesUpdateEvent({ ...detail, context: 'standard-action', promise: d.promise })); return d; };
  const run = async ({ lines }) => {
    const line = lines[0];
    const d = await event({ action: line.id ? 'update' : 'add', lines });
    const res = line.id
      ? await fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: line.id, quantity: line.quantity }) })
      : await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: line.merchandiseId, quantity: line.quantity, properties: Object.fromEntries((line.attributes || []).map((a) => [a.key, a.value])) }) });
    const result = { cart: await res.json(), userErrors: [], warnings: [] };
    d.resolve(result);
    return result;
  };
  const make = (fallback) => {
    let handler;
    const action = (payload) => (handler ? handler(() => fallback(payload), payload) : fallback(payload));
    action.configure = (o) => { handler = o.handler; };
    return action;
  };
  window.Shopify = { actions: { openCart: make(async () => {}), updateCart: make(run), getCart: async () => { const c = await (await fetch('/cart.js')).json(); return { totalQuantity: c.item_count }; } } };
})();
</script>`;

function page(url, cart) {
  const onCart = url.pathname === '/cart';
  const mode = onCart ? 'none' : 'drawer';
  const main = onCart ? cartMain(cart) : url.pathname.startsWith('/products/') ? productMain : '<p>home</p>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Stub store</title><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--page-margin:16px}</style>
  <link rel="stylesheet" href="/assets/base.css">
  <script type="importmap">{"imports":{"@shopify/partial-rendering":"/lib/partial.js"}}</script>${ACTIONS}</head>
  <body><header>${countHtml(cart, !onCart)}</header><main>${main}</main>${drawerHtml(cart, mode)}</body></html>`;
}

// Thư viện giả cho luồng thật: fetch cả trang, thay vùng theo data-partial, giữ focus và giá trị ô (AGENTS.md).
const PARTIAL_LIB = `export const partials = {
  async fetch(...args) {
    const options = typeof args.at(-1) === 'object' ? args.pop() : {};
    const res = await fetch(options.url || location.href, { signal: options.signal });
    if (!res.ok) throw new Error('partial ' + res.status);
    return { names: args, doc: new DOMParser().parseFromString(await res.text(), 'text/html') };
  },
  async apply({ names, doc }) {
    for (const name of names) {
      const now = document.querySelector('[data-partial="' + name + '"]');
      const next = doc.querySelector('[data-partial="' + name + '"]');
      if (!now || !next) continue;
      const active = document.activeElement;
      const key = active?.closest?.('[data-line-key]')?.dataset.lineKey;
      const isInput = active?.name === 'updates[]';
      const typed = new Map([...now.querySelectorAll('[data-line-key]')].map((l) => [l.dataset.lineKey, l.querySelector('input').value]));
      now.replaceWith(next);
      for (const l of next.querySelectorAll('[data-line-key]')) if (typed.has(l.dataset.lineKey)) l.querySelector('input').value = typed.get(l.dataset.lineKey);
      if (key && isInput) next.querySelector('[data-line-key="' + key + '"] input')?.focus();
    }
  },
  async refresh(...names) { return this.apply(await this.fetch(...names)); },
};`;

const TYPES = { css: 'text/css', js: 'text/javascript' };

const read = (req) => new Promise((resolve) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => resolve(Buffer.concat(chunks).toString()));
});

async function handle(req, res) {
  const url = new URL(req.url, 'http://stub');
  let id = /(?:^|; )cart=([^;]+)/.exec(req.headers.cookie ?? '')?.[1];
  const send = (status, type, body) => {
    const headers = { 'content-type': type };
    if (!id && /\/cart/.test(url.pathname) && req.method === 'POST') { id = randomUUID(); carts.set(id, []); headers['set-cookie'] = `cart=${id}; Path=/`; }
    res.writeHead(status, headers);
    res.end(body);
  };
  const lines = () => {
    if (!id) { id = randomUUID(); carts.set(id, []); res.setHeader('set-cookie', `cart=${id}; Path=/`); }
    if (!carts.has(id)) carts.set(id, []);
    return carts.get(id);
  };
  const json = (status, body) => send(status, 'application/json', JSON.stringify(body));

  if (url.pathname === '/cart.js') return json(200, cartJson(lines()));
  if (url.pathname === '/cart/add.js') {
    const raw = await read(req);
    let body;
    try { body = JSON.parse(raw); } catch { body = Object.fromEntries([...raw.matchAll(/name="([^"]+)"\r?\n\r?\n([^\r\n]*)/g)].map((m) => [m[1], m[2]])); }
    const list = lines();
    const properties = body.properties ?? {};
    const key = `${body.id}:${createHash('md5').update(JSON.stringify(properties)).digest('hex')}`;
    const line = list.find((l) => l.key === key);
    if (line) line.quantity += Number(body.quantity) || 1;
    else list.push({ key, id: Number(body.id), quantity: Number(body.quantity) || 1, properties });
    return json(200, item(list.find((l) => l.key === key)));
  }
  if (url.pathname === '/cart/change.js') {
    const body = JSON.parse(await read(req));
    const list = lines();
    const line = list.find((l) => l.key === body.id);
    if (!line) return json(400, { description: 'No valid id' });
    line.quantity = Number(body.quantity);
    if (line.quantity <= 0) list.splice(list.indexOf(line), 1);
    return json(200, cartJson(list));
  }
  if (url.pathname === '/lib/partial.js') return send(200, 'text/javascript', PARTIAL_LIB);
  const asset = /^\/assets\/([\w-]+\.(css|js))$/.exec(url.pathname);
  if (asset) return send(200, TYPES[asset[2]], mutate(asset[1], readFileSync(`assets/${asset[1]}`)));
  if (url.pathname === '/password') { res.writeHead(302, { location: '/' }); return res.end(); }
  if (url.pathname === '/' || url.pathname === '/cart' || url.pathname.startsWith('/products/')) return send(200, 'text/html; charset=utf-8', page(url, cartJson(lines())));
  res.writeHead(404).end();
}

createServer(handle).listen(Number(port), '127.0.0.1');
