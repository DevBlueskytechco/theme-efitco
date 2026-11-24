/**
 * <predictive-search> (ES1-T130, ES1-T378; TE-8 AC1, NFR-4; ui-spec predictive-search §4, §6),
 * imported by search-loader.js after the dialog opens. Hooks: {% doc %} of the snippet.
 * API (ES1-T124 #1): GET {data-url}.json, resources.results. No event (#3), no partial (#2).
 * https://shopify.dev/docs/api/ajax/reference/predictive-search
 * Groups, tabs, footer link: predictive-search-results.js, imported on connect.
 */

const PARAMS = {
  'resources[type]': 'query,product,collection,article,page',
  'resources[limit]': 8,
  'resources[limit_scope]': 'each',
  'resources[options][unavailable_products]': 'last',
};

// this[key] = the element with that attribute
const HOOKS = {
  input: 'role=combobox',
  list: 'role=listbox',
  status: 'role=status',
  tabs: 'role=tablist',
  all: 'data-testid=predictive-search-all',
  hint: 'data-predictive-hint',
  sk: 'data-predictive-skeleton',
  spin: 'data-predictive-spinner',
  empty: 'data-predictive-empty',
  error: 'data-predictive-error',
  discover: 'data-predictive-discover',
};

const show = (el, on) => el && (el.hidden = !on);

class PredictiveSearch extends HTMLElement {
  connectedCallback() {
    for (const k in HOOKS) this[k] = this.querySelector(`[${HOOKS[k]}]`);
    const form = (this.form = this.input?.form);
    const dialog = this.closest('dialog');
    if (!form || !this.list || !this.all) return;
    const signal = (this.on = new AbortController()).signal;
    const on = (el, type, fn) => el?.addEventListener(type, fn, { signal });

    on(this.input, 'input', () => this.update());
    on(this.input, 'keydown', (e) => this.key(e));
    on(this.tabs, 'keydown', (e) => this.m?.arrow(this, e));
    on(this, 'click', (e) => this.click(e));
    // Clear (type="reset"): back to the field, no suggestions
    on(form, 'reset', () => (this.hide(), this.input.focus()));
    on(dialog, 'close', () => this.hide());
    on(this.closest('modal-dialog'), 'modal:open', () => this.update());

    // Same folder (assets/); on error the GET form still works
    this.ui = import(new URL('predictive-search-results.js', import.meta.url)).then((m) => (this.m = m), () => {});
    // ADR 0014 §8: one <link>, skeleton until load or error
    const href = this.dataset.stylesheet;
    const l =
      href &&
      (document.querySelector(`link[href="${href}"]`) ||
        document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'stylesheet', href })));
    if (l && !l.sheet) {
      show(this.sk, 1);
      this.css = new Promise((r) => (l.onload = l.onerror = r)).then(() => show(this.sk, (this.css = null) || this.ac));
    }
    if (dialog?.open) this.update();
  }

  disconnectedCallback() {
    this.on?.abort();
    this.hide();
  }

  // < 2 characters: hide (1: hint + discover); else wait 300ms (click: now)
  update(now) {
    this.stop();
    this.select();
    const q = this.input.value.trim();
    const one = q.length == 1;
    if (q.length < 2) this.hide();
    show(this.hint, one);
    show(this.discover, one || !this.discover?.hidden);
    one && this.hint ? this.input.setAttribute('aria-describedby', this.hint.id) : this.input.removeAttribute('aria-describedby');
    if (q.length > 1) this.timer = setTimeout(() => this.load(q), now ? 0 : 300);
  }

  stop() {
    clearTimeout(this.timer);
    this.ac?.abort();
    this.ac = null;
    this.list.removeAttribute('aria-busy');
    show(this.spin, 0);
  }

  async load(q) {
    const ac = (this.ac = new AbortController());
    // > 5 s is an error (§6): ac stays current, unlike an abort from stop()
    setTimeout(() => ac.abort(), 5000);
    this.list.setAttribute('aria-busy', 'true');
    show(this.spin, 1);
    // First load: skeleton, status, footer link; later ones keep the old results
    if (this.list.hidden) {
      [this.error, this.empty, this.discover].forEach((el) => show(el, 0));
      show(this.sk, 1);
      this.status.textContent = this.dataset.labelLoading || '';
      this.q = q;
      this.m?.foot(this, 1);
    }
    let results;
    try {
      const res = await fetch(`${this.dataset.url}.json?${new URLSearchParams({ q, ...PARAMS })}`, { signal: ac.signal });
      // 429 and other errors: no retry; Try again and submit still work
      if (!res.ok) throw res;
      results = (await res.json()).resources.results;
    } catch {}
    await this.css;
    await this.ui;
    // Aborted by typing, reset or close: that caller owns the state
    if (ac != this.ac) return;
    this.stop();
    this.q = q;
    for (const el of this.querySelectorAll('[data-predictive-terms]')) el.textContent = q;
    results && this.m ? this.m.render(this, results) : this.fail();
  }

  // Alert with Try again; the footer link still opens the results page
  fail() {
    this.hide();
    show(this.error, 1);
    this.m?.foot(this, 1);
  }

  // Tab; suggestion or chip: fill the field, suggest now; Try again
  click(e) {
    const t = e.target.closest('[data-predictive-tab],[data-predictive-query],[data-retry]');
    if (!t) return;
    e.preventDefault();
    if (t.dataset.predictiveTab) return this.m?.tab(this, t);
    if (t.dataset.predictiveQuery) this.input.value = t.dataset.predictiveQuery;
    this.input.focus();
    this.update(1);
  }

  // Focus stays on the input; active option: aria-activedescendant, hidden ones skipped
  key(e) {
    if (e.isComposing) return;
    const open = !this.list.hidden;
    const options = [...this.list.querySelectorAll('[role="option"]')].filter((o) => o.offsetParent);
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
    for (const el of [this.list, this.tabs, this.all, this.empty, this.error, this.discover]) show(el, 0);
    show(this.sk, this.css);
    this.input.setAttribute('aria-expanded', 'false');
    this.status.textContent = '';
  }
}

customElements.get('predictive-search') || customElements.define('predictive-search', PredictiveSearch);
