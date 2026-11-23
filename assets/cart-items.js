// <cart-items> TE-5. Serial writes. defaultValue = server qty.
// https://shopify.dev/docs/api/storefront-events-and-actions/events/cart-lines-update (ES1-T91 #3)
import { partials } from "@shopify/partial-rendering";

const QTY = '[name="updates[]"]';
const LINE = "[data-line-key]";
const STEP = "[data-cart-step]";
const CTRL = STEP + ",[data-cart-remove]";
const keyOf = (el) => el.closest(LINE)?.dataset.lineKey;
const minOf = (i) => +i.dataset.quantityMin || 1;
const post = (url, body) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
let E;
import("https://cdn.shopify.com/storefront/standard-events.js").then((m) => (E = m.CartLinesUpdateEvent), () => {});

class CartItems extends HTMLElement {
  timers = new Map();
  queue = new Map();
  // Line being written → cancel of its aria-busy (ES1-T555: −/+/remove locked now, spinner after delay).
  held = new Map();
  // Refresh hides −/+.
  mo = new MutationObserver(() => this.enhance());

  connectedCallback() {
    for (const t of ["change", "click", "submit"]) this.addEventListener(t, this);
    this.mo.observe(this, { childList: true, subtree: true, attributeFilter: ["hidden"] });
    this.enhance();
    this.dataset.enhanced = "";
  }

  disconnectedCallback() {
    this.mo.disconnect();
  }

  $(s) {
    return this.querySelector(s);
  }

  enhance() {
    for (const b of this.querySelectorAll(STEP + "[hidden]")) b.hidden = false;
  }

  handleEvent(e) {
    const { type, target: t, submitter: s } = e;
    if (type == "submit") return (s?.matches("[data-cart-update]") || s?.ariaDisabled == "true") && e.preventDefault();
    if ("note" in t.dataset) return type == "change" && this.add("", t.value);
    const key = keyOf(t);
    const c = key && t.closest(type == "click" ? CTRL : QTY);
    if (!c || e.metaKey || e.ctrlKey) return;
    if (type == "click") e.preventDefault();
    if (c.ariaDisabled == "true") return;
    clearTimeout(this.timers.get(key));
    if (c.href) return this.add(key, 0);
    const i = this.input(key);
    if (c != i) {
      i[c.dataset.cartStep < 0 ? "stepDown" : "stepUp"]();
      i.value = Math.max(minOf(i), i.value);
    }
    this.paint(i);
    this.timers.set(key, setTimeout(() => this.commit(key), 300));
  }

  input(key) {
    return this.$(`[data-line-key="${key}"] ${QTY}`);
  }

  // −/+ off at min/max (AC9), busy line (AC18).
  paint(i, invalid) {
    const l = i.closest(LINE);
    const p = l.querySelector("[data-cart-line-error]");
    for (const b of l.querySelectorAll(CTRL)) {
      const s = b.dataset.cartStep;
      b.ariaDisabled = this.held.has(l) || (s < 0 ? +i.value <= minOf(i) : s > 0 && i.max && +i.value >= +i.max) || null;
    }
    // Rule inputs have step.
    if (invalid == null || !i.step) return;
    p.hidden = !invalid;
    i.ariaInvalid = invalid || null;
    i.setAttribute("aria-describedby", `${i.id}-rule${invalid ? " " + p.id : ""}`);
  }

  commit(key) {
    this.timers.delete(key);
    const i = this.input(key);
    if (!i) return;
    const q = +i.value;
    if (!i.value || q < 0 || q % 1) i.value = i.defaultValue;
    else if (q && (q < minOf(i) || !i.validity.valid)) return this.paint(i, true);
    else if (this.queue.has(key) || q != (this.f?.[key] ?? i.defaultValue)) this.add(key, q);
    this.paint(i, false);
  }

  // AC18
  hold(i, on) {
    for (const b of this.querySelectorAll('[name="checkout"]')) b.ariaDisabled = on;
    if (!i) return;
    const l = i.closest(LINE);
    if (on && !this.held.has(l)) this.held.set(l, window.busyLater?.(l));
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

  async run() {
    if (this.running) return;
    this.running = true;
    this.note = "";
    const d = this.dataset;
    this.ariaBusy = "true";
    this.say("status", d.labelUpdating);
    this.say("alert");
    try {
      for (const [key, q] of this.queue) {
        this.queue.delete(key);
        if (key) await this.write(key, q);
        else if (!(await post(`${d.cartUrl}/update.js`, { note: q }).catch(() => 0))?.ok) this.say("alert", d.labelError);
        if (this.changed && !this.queue.size) await this.refresh();
      }
    } catch {
      this.say("alert", d.labelError);
    } finally {
      for (const f of this.held.values()) f?.();
      this.held.clear();
      for (const i of this.querySelectorAll(QTY)) this.hold(i);
      this.say("status", this.note);
      this.ariaBusy = null;
      this.running = false;
    }
  }

  // No lib: no event (ES1-T85).
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
    const i = this.input(key);
    let res, data = {};
    this.hold(i, "true");
    this.f = { [key]: quantity };
    try {
      res = await post(`${d.cartChangeUrl}.js`, { id: key, quantity });
      data = await res.json();
    } catch {}
    this.f = 0;
    if (data.items) {
      this.changed = true;
      this.sync((this.items = data.items));
      this.removed = !quantity && key;
      this.note = !quantity ? d.labelRemoved : (data.items.find((i) => i.key === key)?.quantity ?? 0) < quantity ? d.labelQuantityAdjusted : d.labelUpdated;
      return settle(data);
    }
    const text = (res?.status < 500 && data.description) || d.labelError;
    this.say("alert", text);
    settle(0, text);
    if (i) i.value = i.defaultValue;
  }

  sync(items) {
    for (const { key, quantity } of items) {
      const i = this.input(key);
      if (!i) continue;
      i.defaultValue = quantity;
      if (!this.timers.has(key) && !this.queue.has(key)) i.value = quantity;
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
    if (w) w.hidden = this.$("[data-item-count]").dataset.itemCount == 0;
    if (key) {
      const n = keys.indexOf(key);
      const i = this.input(key);
      if (!i) (this.input(keys[n + 1]) || this.input(keys[n - 1]) || (this.closest("dialog") ? this.$(".cart-empty a") : document.querySelector("h1")))?.focus();
      else if (a.matches(QTY) || !a.isConnected) i.focus();
    }
    this.dispatchEvent(new CustomEvent("theme:cart:updated", { bubbles: true, detail: { source: "cart-items" } }));
  }
}

if (!customElements.get("cart-items")) customElements.define("cart-items", CartItems);
