// <cart-items> TE-5 (ES1-T370). Serial writes; only the refresh aborts. defaultValue = server.
// https://shopify.dev/docs/api/storefront-events-and-actions/events/cart-lines-update (ES1-T91 #3)
import { partials } from "@shopify/partial-rendering";

const QTY = '[name="updates[]"]';
const LINE = "[data-line-key]";
const STEP = "[data-cart-step]";
const keyOf = (el) => el.closest(LINE)?.dataset.lineKey;
const post = (url, body) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const wide = matchMedia("(min-width: 64rem)");
let E;
import("https://cdn.shopify.com/storefront/standard-events.js").then((m) => (E = m.CartLinesUpdateEvent), () => {});

class CartItems extends HTMLElement {
  timers = new Map();
  queue = new Map();

  connectedCallback() {
    const o = { signal: (this.ac = new AbortController()).signal };
    for (const t of ["change", "click", "submit"]) this.addEventListener(t, this, o);
    // Refreshes re-hide steppers.
    (this.mo = new MutationObserver(() => this.enhance())).observe(this, { childList: true, subtree: true, attributeFilter: ["hidden"] });
    this.io = new IntersectionObserver((r) => this.bar(r.at(-1).isIntersecting));
    this.enhance();
    this.dataset.enhanced = "";
  }

  disconnectedCallback() {
    this.ac.abort();
    this.mo.disconnect();
    this.io.disconnect();
    this.panel = null;
    this.bar(1);
  }

  $(s) {
    return this.querySelector(s);
  }

  enhance() {
    for (const b of this.querySelectorAll(STEP + "[hidden]")) b.hidden = false;
    const p = this.$(".cart-summary");
    if (p == this.panel) return;
    this.io.disconnect();
    if ((this.panel = p)) this.io.observe(p);
    this.bar(1);
  }

  // ADR 0007 bar: < 64rem, summary out of view.
  bar(seen = this.seen) {
    const b = this.$(".cart-sticky-checkout");
    const h = document.documentElement.dataset;
    const on = !!b && !(this.seen = seen) && !wide.matches;
    if (b && b.hidden == on) b.hidden = !on;
    if (on) h.bottomBar = "cart";
    else if (h.bottomBar == "cart") delete h.bottomBar;
  }

  handleEvent(e) {
    const { type, target: t, submitter: s } = e;
    // Enter: change already ran.
    if (type == "submit") return (s?.matches("[data-cart-update]") || s?.ariaDisabled == "true") && e.preventDefault();
    if ("note" in t.dataset) return type == "change" && this.add("", t.value);
    const key = keyOf(t);
    const c = key && t.closest(type == "click" ? STEP + ",[data-cart-remove]" : QTY);
    if (!c || e.metaKey || e.ctrlKey) return;
    if (type == "click") e.preventDefault();
    if (c.ariaDisabled == "true") return;
    clearTimeout(this.timers.get(key));
    if (c.href) return this.add(key, 0);
    const i = this.input(key);
    const { min, max, step } = this.rule(i);
    if (c != i) i.value = Math.min(max, Math.max(min, Math.round(((+i.value || 0) + c.dataset.cartStep * step) / step) * step));
    this.paint(i);
    this.timers.set(key, setTimeout(() => this.commit(key), 300));
  }

  input(key) {
    return this.$(`[data-line-key="${key}"] ${QTY}`);
  }

  rule(i) {
    const d = i.dataset;
    return { min: +d.quantityMin || 1, max: +d.quantityMax || 1 / 0, step: +d.quantityStep || 1 };
  }

  // −/+ at min/max; invalid: rule error (AC9).
  paint(i, invalid) {
    const { min, max } = this.rule(i);
    const l = i.closest(LINE);
    const p = l.querySelector("[data-cart-line-error]");
    for (const b of l.querySelectorAll(STEP)) b.ariaDisabled = (b.dataset.cartStep < 0 ? i.value <= min : i.value >= max) || null;
    if (!p || !("quantityRule" in i.dataset)) return;
    p.hidden = !invalid;
    i.ariaInvalid = invalid || null;
    i.setAttribute("aria-describedby", i.id + "-rule" + (invalid ? " " + p.id : ""));
  }

  commit(key) {
    this.timers.delete(key);
    const i = this.input(key);
    if (!i) return;
    const { min, max, step } = this.rule(i);
    const q = +i.value;
    if (!i.value || q < 0 || q % 1) i.value = i.defaultValue;
    else if (q && (q < min || q > max || q % step)) return this.paint(i, true);
    else if (this.running || q != i.defaultValue) this.add(key, q);
    this.paint(i);
  }

  add(key, q) {
    this.queue.set(key, q);
    this.ctl?.abort();
    this.run();
  }

  say(role, text = "") {
    this.$(`[role="${role}"]`).textContent = text;
  }

  lock(on) {
    for (const b of this.querySelectorAll('[name="checkout"]')) b.ariaDisabled = on;
  }

  async run() {
    if (this.running) return;
    this.running = true;
    const d = this.dataset;
    const u = d.labelUpdating;
    this.ariaBusy = "true";
    this.say("status", u);
    this.say("alert");
    try {
      for (const [key, q] of this.queue) {
        this.queue.delete(key);
        // "": drawer note (AC8).
        if (key) {
          this.lock("true");
          await this.write(key, q);
        } else if (!(await post(`${d.cartUrl}/update.js`, { note: q }).catch(() => 0))?.ok) this.say("alert", d.labelError);
        if (this.changed && !this.queue.size) await this.refresh();
      }
    } catch {
      this.say("alert", d.labelError);
    } finally {
      this.lock();
      if (u && this.$("[role=status]").textContent == u) this.say("status");
      this.ariaBusy = null;
      this.running = false;
    }
  }

  // Library not loaded: no event. Resolve only (ES1-T85).
  emit(id, quantity) {
    let d;
    try {
      d = E.createPromise();
      this.dispatchEvent(new E({ action: quantity ? "update" : "remove", context: this.closest("dialog") ? "dialog" : "cart", lines: [{ id, quantity }], promise: d.promise }));
    } catch {}
    return (cart, message) => d?.resolve({ cart: message ? null : E.createCartFromAjaxResponse(cart), userErrors: message ? [{ message }] : [], warnings: [] });
  }

  async write(key, quantity) {
    const d = this.dataset;
    const settle = this.emit(key, quantity);
    let res, data = {};
    this.note = "";
    try {
      res = await post(`${d.cartChangeUrl}.js`, { id: key, quantity });
      data = await res.json();
    } catch {}
    if (data.items) {
      this.changed = true;
      this.sync((this.items = data.items));
      this.removed = !quantity && key;
      this.note = !quantity ? d.labelRemoved : (data.items.find((i) => i.key === key)?.quantity ?? 0) < quantity ? d.labelQuantityAdjusted : d.labelUpdated;
      return settle(data);
    }
    const text = res?.status < 500 && data.description;
    this.say("alert", text || d.labelError);
    settle(0, text || d.labelError);
    const i = this.input(key);
    if (i) i.value = i.defaultValue;
  }

  sync(items) {
    for (const i of this.querySelectorAll(QTY)) {
      const k = keyOf(i);
      const item = items.find((x) => x.key === k);
      if (!item) continue;
      i.defaultValue = item.quantity;
      if (!this.timers.has(k) && !this.queue.has(k)) i.value = item.quantity;
      this.paint(i);
    }
  }

  async refresh() {
    const { signal } = (this.ctl = new AbortController());
    const a = document.activeElement;
    const keys = [...this.querySelectorAll(LINE)].map(keyOf);
    // Safari: no focus on click.
    const key = this.contains(a) ? keyOf(a) : a === document.body && this.removed;
    const update = await partials.fetch(...this.dataset.partials.split(" "), { url: location.href, signal }).catch((err) => {
      if (!signal.aborted) throw err;
    });
    if (signal.aborted) return;
    await partials.apply(update);
    this.changed = false;
    this.sync(this.items);
    const w = this.$("[data-cart-accelerated]");
    if (w) w.hidden = this.$("[data-item-count]").dataset.itemCount === "0";
    if (key) {
      const n = keys.indexOf(key);
      const i = this.input(key);
      if (!i) (this.input(keys[n + 1]) || this.input(keys[n - 1]) || (this.closest("dialog") ? this.$(".cart-empty a") : document.querySelector("h1")))?.focus();
      else if (a.matches(QTY) || !a.isConnected) i.focus();
    }
    this.say("status", this.note);
    this.dispatchEvent(new CustomEvent("theme:cart:updated", { bubbles: true, detail: { source: "cart-items" } }));
  }
}

if (!customElements.get("cart-items")) customElements.define("cart-items", CartItems);
