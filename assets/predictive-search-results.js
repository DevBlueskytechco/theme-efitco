/**
 * Results of <predictive-search> (ES1-T378, TE-8 AC1; docs/ui-spec/predictive-search.md §2, §4, §6):
 * data-predictive-group from the JSON by cloning data-predictive-template (textContent only),
 * tabs (filter locally, no new request), footer link predictive-search-all.
 * Imported by predictive-search.js; every export takes the element (el).
 */

// Tab All shows 4 suggestions, 4 products, 3 of each other group
const ALL = { queries: 4, products: 4 };

const show = (el, on) => el && (el.hidden = !on);

// Same as product-recommendations.js
const money = (cents, format) =>
  format.replace(/<[^>]*>/g, '').replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
    const sep = /comma/.test(key) ? '.' : ',';
    const [int, dec] = (cents / 100).toFixed(/no_dec/.test(key) ? 0 : 2).split('.');
    return int.replace(/\B(?=(\d{3})+$)/g, sep) + (dec ? (sep == ',' ? '.' : ',') + dec : '');
  });

export function render(el, results) {
  const d = el.dataset;
  const count = {};
  let n = 0;
  for (const group of el.querySelectorAll('[data-predictive-group]')) {
    const key = group.dataset.predictiveGroup;
    const items = results[key] || [];
    const name = { queries: 'query', products: 'product' }[key] || 'link';
    const tpl = el.querySelector(`[data-predictive-template="${name}"]`);
    group
      .querySelector('[data-predictive-options]')
      .replaceChildren(...items.map((item) => option(el, tpl.content.cloneNode(true), item, ++n, key)));
    count[key] = items.length;
  }

  let selected;
  for (const t of el.querySelectorAll('[data-predictive-tab]')) {
    const c = count[t.dataset.predictiveTab];
    if (c != null) {
      t.hidden = !c;
      // The API returns no total: 8 is resources[limit] (§13 #2)
      const badge = t.querySelector('[data-predictive-count]');
      if (badge) badge.textContent = c < 8 ? c : '8+';
    }
    if (t.getAttribute('aria-selected') == 'true' && !t.hidden) selected = t;
  }

  el.n = n;
  const products = count.products;
  show(el.list, 1);
  show(el.tabs, n);
  show(el.empty, !n);
  // 0 products: discover (Trending) with the "No products match" line when other groups have results
  show(el.discover, !products);
  show(el.querySelector('[data-predictive-no-products]'), n && !products);
  show(el.sk, 0);
  show(el.error, 0);
  el.input.setAttribute('aria-expanded', 'true');
  // Keep the tab while typing; back to All when it has no results
  tab(el, selected);
  el.status.textContent = n ? (d.labelCount || '').replace('%n', n) : (d.labelEmpty || '').replace('%s', () => el.q);
}

function option(el, node, item, i, key) {
  const d = el.dataset;
  const $ = (s) => node.querySelector(`[data-predictive-${s}]`);
  const a = node.firstElementChild;
  a.href = item.url;
  a.id = `${el.list.id}-${i}`;

  // Suggestion: the typed part in <mark>; a click puts the text in the field
  const text = item.text || item.title || '';
  const title = $('title');
  const at = item.text ? text.toLowerCase().indexOf(el.q.toLowerCase()) : -1;
  if (at < 0) title.textContent = text;
  else {
    const mark = document.createElement('mark');
    mark.textContent = text.slice(at, at + el.q.length);
    title.append(text.slice(0, at), mark, text.slice(at + el.q.length));
  }
  if (item.text) a.dataset.predictiveQuery = text;

  const price = $('price');
  if (price) {
    const format = (v) => money(Math.round(v * 100), d.moneyFormat || '');
    const p = Number(item.price);
    const c = Number(item.compare_at_price_max) || 0;
    price.textContent = format(p);
    if (c > p) {
      a.dataset.onSale = '';
      const label = $('price-label');
      if (label && d.labelSalePrice) label.textContent = d.labelSalePrice;
      const compare = $('compare');
      if (compare) compare.textContent = format(c);
      show($('compare-group'), 1);
      const badge = $('badge');
      if (badge) badge.textContent = `-${Math.round((1 - p / c) * 100)}%`;
      show(badge, 1);
    }
    if (item.available === false) {
      a.dataset.unavailable = '';
      show($('sold-out'), 1);
    }
  }

  const meta = $('meta');
  const date = key == 'articles' && item.published_at && new Date(item.published_at);
  if (meta && date) meta.textContent = date.toLocaleDateString(document.documentElement.lang || undefined, { dateStyle: 'medium' });
  else meta?.remove();

  const img = $('image');
  const src = item.featured_image?.url || item.image;
  if (img && src) {
    const u = new URL(src, location.href);
    // Row 64, card 250 (popup tab All from 80rem, tab Products); src ends at width 64
    img.srcset = [480, 250, 128, 64].map((w) => (u.searchParams.set('width', w), `${u} ${w}w`)).join();
    img.src = u;
  } else img?.remove();
  return node;
}

// Selects tab t (All when empty): aria-selected, roving tabindex, panel name, data-tab for CSS
export function tab(el, t) {
  const tabs = [...el.querySelectorAll('[data-predictive-tab]')];
  t ||= tabs[0];
  if (!t) return;
  for (const b of tabs) {
    b.setAttribute('aria-selected', b == t);
    b.tabIndex = b == t ? 0 : -1;
  }
  const key = (el.dataset.tab = t.dataset.predictiveTab);
  el.querySelector('[role="tabpanel"]')?.setAttribute('aria-labelledby', t.id);
  for (const group of el.querySelectorAll('[data-predictive-group]')) {
    const k = group.dataset.predictiveGroup;
    const options = [...group.querySelector('[data-predictive-options]').children];
    options.forEach((o, i) => (o.hidden = key == 'all' && i >= (ALL[k] || 3)));
    group.hidden = !options.length || (key != 'all' && key != k);
  }
  el.select();
  foot(el);
  return t;
}

// Footer link: all results, products only (tab Products), Shop all at 0 results (§4)
export function foot(el, n = el.n) {
  const d = el.dataset;
  const products = d.tab == 'products';
  const data = new FormData(el.form);
  if (products) data.set('type', 'product');
  const url = new URL(el.form.action);
  url.search = new URLSearchParams(data);
  const label = n ? (products ? d.labelProducts : d.labelAll) : d.labelShopAll;
  el.all.href = n || !d.shopAllUrl ? url : d.shopAllUrl;
  // The span keeps the arrow icon next to it
  const text = el.all.querySelector('[data-predictive-all-label]') || el.all;
  if (label) text.textContent = label.replace('%s', () => el.q);
  show(el.all, 1);
}

// Tablist: Left / Right move focus and select, wrapping (Right is "previous" in RTL)
export function arrow(el, e) {
  const rtl = getComputedStyle(el).direction == 'rtl';
  const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key] * (rtl ? -1 : 1);
  const tabs = [...el.tabs.querySelectorAll('[role="tab"]:not([hidden])')];
  if (!step || !tabs.length) return;
  e.preventDefault();
  const i = tabs.indexOf(e.target) + step;
  tab(el, tabs[(i + tabs.length) % tabs.length]).focus();
}
