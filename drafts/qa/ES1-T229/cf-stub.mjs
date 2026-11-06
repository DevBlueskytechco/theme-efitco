// ES1-T229: storefront giả để chạy đúng spec T73, T94, T95 khi Cloudflare chặn ở từng bước, và đối chứng khi không chặn. Không gọi store.
// Chạy qua pw.repro.config.ts: node drafts/qa/ES1-T229/cf-stub.mjs <port> <mode>
// mode: all (chặn hết) | product (/products/*) | cart (GET /cart) | post (POST /cart, GET /cart/change) | repeat (GET lần 2 của /collections/all) | ok (không chặn).
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const [port, mode] = process.argv.slice(2);
const CHALLENGE = '<!doctype html><html><head><title>Just a moment...</title></head><body><div id="challenge-stage">Enable JavaScript and cookies to continue</div></body></html>';
const HANDLE = 'stub-product';
const VARIANT = 11;
const page = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head><body><a data-testid="header-cart-link" href="/cart">Cart</a>${body}</body></html>`;

const state = { quantity: 0, note: null };
let collectionGets = 0;

const radio = (n) => `<input type="radio" name="c" data-variant-id="${n}" data-variant-url="/products/${HANDLE}?variant=${n}" ${n === 1 ? 'checked' : ''}>`;
const card = `<div data-testid="collection-products"><product-swatch data-testid="product-card" data-product-id="1">
  <a data-card-link data-testid="product-card-title" href="/products/${HANDLE}?variant=1">Title</a>
  <label data-testid="product-card-swatch">${radio(1)}A</label><label data-testid="product-card-swatch">${radio(2)}B</label>
</product-swatch></div><script type="module" src="/product-swatch.js"></script>`;

const productJson = { product: { id: 1, handle: HANDLE }, variants: [{ id: VARIANT, available: true, price: 100 }] };
const cartPage = () => page('Cart', `<main data-testid="cart-page">${state.quantity === 0
  ? '<p data-testid="cart-empty">Empty</p>'
  : `<form id="cart-form-page" method="post" action="/cart" data-testid="cart-form">
      <input data-testid="cart-line-quantity" name="updates[]" value="${state.quantity}">
      <a data-testid="cart-line-remove" href="/cart/change?line=1&quantity=0">Remove</a>
      <button data-testid="cart-update" name="update" type="submit">Update</button>
      <button data-testid="cart-checkout" name="checkout" type="submit">Checkout</button>
    </form>
    <textarea data-testid="cart-page-note" name="note" form="cart-form-page">${state.note ?? ''}</textarea>`}</main>`);

// 4 tab với collection-tabs.js thật. Mỗi lần bấm phát nhiễu như store thật: host khác (localhost so với 127.0.0.1, không ra mạng), /api/collect, iframe login_with_shop.
// mode tabfetch thêm 1 fetch dữ liệu tab: đối chứng, test ES1-T189 phải đỏ.
const tabsPage = () => {
  const tabs = [1, 2, 3, 4].map((n) => `<a data-tab="${n}" data-testid="featured-collection-tab" href="/collections/figma-tab-${n}">Tab ${n}</a>`).join('');
  const panels = [1, 2, 3, 4].map((n) => `<div data-tab-panel="${n}" id="panel-${n}" data-testid="featured-collection-panel" ${n === 1 ? '' : 'hidden'}><template data-tab-panel-template="${n}"><p>Panel ${n}</p></template></div>`).join('');
  const noise = `document.addEventListener('click', () => {
    fetch('http://localhost:${port}/v1/traces', { method: 'POST', body: '{}' }).catch(() => {});
    fetch('/api/collect', { method: 'POST', body: '{}' }).catch(() => {});
    const frame = document.createElement('iframe'); frame.src = '/services/login_with_shop/authorize'; document.body.append(frame);
    ${mode === 'tabfetch' ? `fetch('/collections/figma-tab-2?section_id=card').catch(() => {});` : ''}
  });`;
  return `<div data-testid="featured-collection"><collection-tabs><div data-tab-list data-testid="featured-collection-tabs" role="group" aria-label="Tabs">${tabs}</div>${panels}</collection-tabs></div>
  <script type="module" src="/collection-tabs.js"></script><script>${noise}</script>`;
};

const blockedFor = (method, path) => {
  if (mode === 'all') return true;
  if (mode === 'product') return path.startsWith('/products/');
  if (mode === 'cart') return method === 'GET' && path === '/cart';
  if (mode === 'post') return (method === 'POST' && path === '/cart') || path === '/cart/change';
  if (mode === 'repeat') return method === 'GET' && path === '/collections/all' && collectionGets > 1;
  return false;
};

createServer((req, res) => {
  const url = new URL(req.url, 'http://stub');
  const path = url.pathname;
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString();
    const send = (status, type, text, headers = {}) => {
      res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', ...headers });
      res.end(text);
    };
    const html = (text) => send(200, 'text/html', text);
    const json = (data) => send(200, 'application/json', JSON.stringify(data));
    if (path === '/collections/all' && req.method === 'GET') collectionGets += 1;
    if (blockedFor(req.method, path)) return send(403, 'text/html', CHALLENGE, { 'cf-mitigated': 'challenge' });

    if (path === '/product-swatch.js') return send(200, 'text/javascript', readFileSync('assets/product-swatch.js'));
    if (path === '/collections/all') return html(page('All', card));
    if (path === `/products/${HANDLE}.js`) return json({ id: 1, handle: HANDLE, variants: productJson.variants });
    if (path === `/products/${HANDLE}`) return html(page('Product', `<script type="application/json" data-product-variants>${JSON.stringify(productJson)}</script>`));
    if (path === '/cart/add.js') { state.quantity = 1; state.note = null; return json({ id: VARIANT }); }
    if (path === '/cart.js') return json({ item_count: state.quantity, note: state.note, items: state.quantity ? [{ quantity: state.quantity }] : [] });
    if (path === '/cart/change') { state.quantity = 0; return send(302, 'text/plain', '', { location: '/cart' }); }
    if (path === '/cart' && req.method === 'POST') {
      const form = new URLSearchParams(body);
      state.quantity = Number(form.get('updates[]') ?? state.quantity);
      state.note = form.get('note');
      return send(302, 'text/plain', '', { location: form.has('checkout') ? '/checkouts/cn/1' : '/cart' });
    }
    if (path === '/cart') return html(cartPage());
    if (path.startsWith('/checkouts/')) return html('<!doctype html><title>Checkout</title><p>checkout</p>');
    if (path === '/v1/traces') return send(200, 'text/plain', '', { 'access-control-allow-origin': '*' });
    if (path === '/services/login_with_shop/authorize') return html('<!doctype html><title>login</title>');
    if (path === '/collection-tabs.js') return send(200, 'text/javascript', readFileSync('assets/collection-tabs.js'));
    if (path === '/' && url.searchParams.get('view') === 'figma') return html(page('Tabs', tabsPage()));
    if (path === '/') return html(page('Home', '<p>home</p>'));
    return send(404, 'text/plain', 'not found');
  });
}).listen(Number(port), '127.0.0.1');
