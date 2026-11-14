/**
 * <predictive-search> (ES1-T130, TE-8 AC1, NFR-4). Imported by search-loader.js after
 * the dialog opens, so it reads the value already typed on connect.
 * API (ES1-T124 #1): GET {data-url}.json, resources.results.{products, collections,
 * pages, articles}; price is a decimal string in the shop currency.
 * https://shopify.dev/docs/api/ajax/reference/predictive-search
 * No event: shopify:search:update is for submit, filter, sort only (ES1-T124 #3).
 * https://shopify.dev/docs/api/storefront-events-and-actions/events/search-update
 * No partial: predictive_search needs Section Rendering (ES1-T124 #2).
 */

const PARAMS = {
  'resources[type]': 'product,collection,page,article',
  'resources[limit]': 8,
  'resources[limit_scope]': 'each',
  'resources[options][unavailable_products]': 'last',
};

// Same as product-recommendations.js
const money = (cents, format) =>
  format.replace(/<[^>]*>/g, '').replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
    const sep = /comma/.test(key) ? '.' : ',';
    const [int, dec] = (cents / 100).toFixed(/no_dec/.test(key) ? 0 : 2).split('.');
    return int.replace(/\B(?=(\d{3})+$)/g, sep) + (dec ? (sep == ',' ? '.' : ',') + dec : '');
  });

class PredictiveSearch extends HTMLElement {
  connectedCallback() {
    const $ = (s) => this.querySelector(s);
    this.input = $('[role="combobox"]');
    this.list = $('[role="listbox"]');
    this.status = $('[role="status"]');
    this.all = $('[data-testid="predictive-search-all"]');
    const form = (this.form = this.input?.form);
    const dialog = this.closest('dialog');
    if (!form || !this.list) return;
    const signal = (this.on = new AbortController()).signal;
    const on = (el, type, fn) => el?.addEventListener(type, fn, { signal });

    on(this.input, 'input', () => this.update());
    on(this.input, 'keydown', (e) => this.key(e));
    // Clear (type="reset"): back to the field, no suggestions
    on(form, 'reset', () => (this.hide(), this.input.focus()));
    on(dialog, 'close', () => this.hide());
    on(this.closest('modal-dialog'), 'modal:open', () => this.update());
    if (dialog?.open) this.update();
  }

  disconnectedCallback() {
    this.on?.abort();
    this.hide();
  }

  // < 2 characters: cancel and hide; else wait 300ms. The old request stops now.
  update() {
    this.stop();
    this.select();
    const q = this.input.value.trim();
    if (q.length < 2) return this.hide();
    this.timer = setTimeout(() => this.load(q), 300);
  }

  stop() {
    clearTimeout(this.timer);
    this.ac?.abort();
    this.ac = null;
    this.list.removeAttribute('aria-busy');
  }

  async load(q) {
    const ac = (this.ac = new AbortController());
    this.list.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch(`${this.dataset.url}.json?${new URLSearchParams({ q, ...PARAMS })}`, {
        signal: ac.signal,
      });
      // 429 and other errors: no retry, the form still submits
      if (!res.ok) throw res;
      const { results } = (await res.json()).resources;
      if (ac == this.ac) this.render(q, results);
    } catch {
      // AbortError: whoever aborted owns the state
      if (!ac.signal.aborted) this.hide();
    } finally {
      if (ac == this.ac) this.list.removeAttribute('aria-busy');
    }
  }

  render(q, results) {
    const d = this.dataset;
    const terms = (label) => (label || '').replace('%s', () => q);
    let n = 0;
    for (const group of this.querySelectorAll('[data-predictive-group]')) {
      const key = group.dataset.predictiveGroup;
      const items = results[key] || [];
      const tpl = this.querySelector(`[data-predictive-template="${key == 'products' ? 'product' : 'link'}"]`);
      group.querySelector('[data-predictive-options]').replaceChildren(
        ...items.map((item) => this.option(tpl.content.cloneNode(true), item, ++n))
      );
      group.hidden = !items.length;
    }

    const url = new URL(this.form.action);
    url.search = new URLSearchParams(new FormData(this.form));
    this.all.href = url;
    this.all.id ||= `${this.list.id}-all`;
    this.all.textContent = terms(d.labelAll) || this.all.textContent;

    this.list.hidden = false;
    this.input.setAttribute('aria-expanded', 'true');
    this.select();
    this.status.textContent = n ? (d.labelCount || '').replace('%n', n) : terms(d.labelEmpty);
  }

  // Template clone, textContent only
  option(node, item, i) {
    const $ = (s) => node.querySelector(`[data-predictive-${s}]`);
    const a = node.firstElementChild;
    a.href = item.url;
    a.id = `${this.list.id}-${i}`;
    $('title').textContent = item.title;
    const price = $('price');
    if (price) price.textContent = money(Math.round(item.price * 100), this.dataset.moneyFormat || '');
    const img = $('image');
    const src = item.image || item.featured_image?.url;
    if (img && src) {
      const u = new URL(src, location.href);
      // src ends at width 64
      img.srcset = [128, 64].map((w) => (u.searchParams.set('width', w), `${u} ${w}w`)).join();
      img.src = u;
    } else img?.remove();
    return node;
  }

  // Focus stays on the input; the active option is aria-activedescendant
  key(e) {
    if (e.isComposing) return;
    const open = !this.list.hidden;
    const options = [...this.list.querySelectorAll('[role="option"]')];
    const i = options.indexOf(this.active);
    const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (step && open && options.length) {
      e.preventDefault();
      const len = options.length;
      this.select(options[i < 0 ? (step > 0 ? 0 : len - 1) : (i + step + len) % len]);
    } else if (e.key == 'Enter' && open && this.active) {
      e.preventDefault();
      this.active.click();
    } else if (e.key == 'Escape') {
      // Esc 1 closes the list, Esc 2 the dialog: on type=search Chrome would clear the field
      e.preventDefault();
      open ? this.hide() : this.closest('dialog')?.close();
    }
  }

  select(option) {
    this.active?.setAttribute('aria-selected', 'false');
    this.active = option;
    if (!option) return this.input?.removeAttribute('aria-activedescendant');
    option.setAttribute('aria-selected', 'true');
    this.input.setAttribute('aria-activedescendant', option.id);
    option.scrollIntoView({ block: 'nearest' });
  }

  hide() {
    if (!this.on) return;
    this.stop();
    this.select();
    this.list.hidden = true;
    this.input.setAttribute('aria-expanded', 'false');
    this.status.textContent = '';
  }
}

customElements.get('predictive-search') || customElements.define('predictive-search', PredictiveSearch);
