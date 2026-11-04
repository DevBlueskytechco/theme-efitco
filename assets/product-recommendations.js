/**
 * <product-recommendations> (TE-4 AC7, ES1-T59 D7): near the viewport fetch
 * {data-url}.json, clone the template per product, unhide; else stay hidden.
 */

// money_format: amount[_no_decimals][_with_comma_separator]
const money = (cents, format) =>
  format.replace(/<[^>]*>/g, '').replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
    const sep = /comma/.test(key) ? '.' : ',';
    const [int, dec] = (cents / 100).toFixed(/no_dec/.test(key) ? 0 : 2).split('.');
    return int.replace(/\B(?=(\d{3})+$)/g, sep) + (dec ? (sep == ',' ? '.' : ',') + dec : '');
  });

class ProductRecommendations extends HTMLElement {
  connectedCallback() {
    // Editor placeholder: no fetch
    if (this.done || this.querySelector('[data-recommendations-placeholder]')) return;
    // Hidden root has no box: watch the container
    this.io = new IntersectionObserver(
      (e) => e.some((x) => x.isIntersecting) && (this.io.disconnect(), this.load()),
      { rootMargin: '200px' }
    );
    this.io.observe(this.parentElement);
  }

  disconnectedCallback() {
    this.io?.disconnect();
    this.ac?.abort();
  }

  async load() {
    const d = this.dataset;
    this.ac = new AbortController();
    try {
      const q = new URLSearchParams({ product_id: d.productId, limit: d.limit, intent: d.intent });
      const res = await fetch(`${d.url}.json?${q}`, { signal: this.ac.signal });
      const list = res.ok && (await res.json()).products;
      if (!list?.length) return;
      const tpl = this.querySelector('template').content;
      this.querySelector('[data-recommendations-list]').replaceChildren(
        ...list.map((p) => card(tpl.cloneNode(true), p, d.moneyFormat))
      );
      this.hidden = false;
      this.done = true;
    } catch {
      // abort, network, bad JSON: stay hidden
    }
  }
}

// Price: first available variant, as on the product page
function card(node, p, format) {
  const $ = (s) => node.querySelector(`[data-card-${s}]`);
  const v = p.variants.find((x) => x.available) || p.variants[0];
  const sale = v.compare_at_price > v.price;
  const img = $('image');
  const m = p.media?.find((x) => x.media_type == 'image');

  node.querySelectorAll('[data-card-link]').forEach((a) => (a.href = p.url));
  $('title').textContent = p.title;
  if (p.featured_image) {
    const u = new URL(p.featured_image, location.href);
    if (m) [img.width, img.height] = [m.width, m.height];
    img.srcset = [360, 720, 1080]
      .filter((w) => !m || w <= m.width)
      .map((w) => (u.searchParams.set('width', w), `${u} ${w}w`))
      .join();
    img.src = p.featured_image;
  } else img.remove();

  $('price').classList.toggle('price--on-sale', sale);
  const c = $('price-current');
  c.classList.toggle('price__current--sale', sale);
  c.textContent = money(v.price, format);
  $('price-compare').textContent = sale ? money(v.compare_at_price, format) : '';
  $('sold-out').hidden = p.available !== false;
  return node;
}

const TAG = 'product-recommendations';
customElements.get(TAG) || customElements.define(TAG, ProductRecommendations);
