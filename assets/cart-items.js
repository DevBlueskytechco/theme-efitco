// <cart-items> TE-5 AC2 AC4 (ES1-T97). Serial writes; only the refresh aborts.
// input.defaultValue = last known server quantity.
import { partials } from "@shopify/partial-rendering";

const QTY = '[name="updates[]"]';
const LINE = "[data-line-key]";
const keyOf = (el) => el.closest(LINE)?.dataset.lineKey;

class CartItems extends HTMLElement {
  timers = new Map();
  queue = new Map();

  connectedCallback() {
    for (const t of ["change", "click", "submit"]) this.addEventListener(t, this);
    this.dataset.enhanced = "";
  }

  handleEvent(e) {
    const { type, target } = e;
    // Enter in an input: change already ran.
    if (type === "submit") return e.submitter?.matches("[data-cart-update]") && e.preventDefault();
    const key = keyOf(target);
    const click = type === "click";
    if (!key || !target.closest(click ? "[data-cart-remove]" : QTY) || e.metaKey || e.ctrlKey) return;
    clearTimeout(this.timers.get(key));
    this.timers.delete(key);
    if (click) {
      e.preventDefault();
      this.add(key, 0);
    } else this.timers.set(key, setTimeout(() => this.commit(key), 300));
  }

  input(key) {
    return this.querySelector(`[data-line-key="${key}"] ${QTY}`);
  }

  commit(key) {
    this.timers.delete(key);
    const i = this.input(key);
    if (!i) return;
    const q = Number(i.value);
    if (!i.value || q < 0 || q % 1) i.value = i.defaultValue;
    else if (this.running || q != i.defaultValue) this.add(key, q);
  }

  add(key, q) {
    this.queue.set(key, q);
    this.ctl?.abort();
    this.run();
  }

  say(role, text = "") {
    this.querySelector(`[role="${role}"]`).textContent = text;
  }

  // Keep focus: skip the focused button.
  lock(on) {
    for (const b of this.querySelectorAll("button[form]")) b.disabled = on && b !== document.activeElement;
  }

  async run() {
    if (this.running) return;
    this.running = true;
    this.setAttribute("aria-busy", "true");
    this.say("status");
    this.say("alert");
    try {
      // Live iterator: sees lines queued meanwhile.
      for (const [key, q] of this.queue) {
        this.queue.delete(key);
        this.lock(true);
        await this.write(key, q);
        if (this.changed && !this.queue.size) await this.refresh();
      }
    } catch {
      this.say("alert", this.dataset.labelError);
    } finally {
      this.lock(false);
      this.removeAttribute("aria-busy");
      this.running = false;
    }
  }

  async write(key, quantity) {
    const d = this.dataset;
    let res, data = {};
    this.note = "";
    try {
      res = await fetch(`${d.cartChangeUrl}.js`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: key, quantity }) });
      data = (await res.json().catch(() => 0)) || {};
    } catch {}
    if (data.items) {
      this.changed = true;
      this.sync((this.items = data.items));
      this.removed = !quantity && key;
      this.note = !quantity ? d.labelRemoved : (data.items.find((i) => i.key === key)?.quantity ?? 0) < quantity ? d.labelQuantityAdjusted : d.labelUpdated;
      return;
    }
    const text = res?.status < 500 && data.description;
    this.say("alert", text || d.labelError);
    const i = this.input(key);
    if (i) i.value = i.defaultValue;
    if (text) {
      const cart = await fetch(`${d.cartUrl}.js`).catch(() => 0);
      if (cart?.ok) this.sync((await cart.json()).items);
    }
  }

  // apply() keeps input values: write server quantities back.
  sync(items) {
    for (const i of this.querySelectorAll(QTY)) {
      const k = keyOf(i);
      const item = items.find((x) => x.key === k);
      if (!item) continue;
      i.defaultValue = item.quantity;
      if (!this.timers.has(k) && !this.queue.has(k)) i.value = item.quantity;
    }
  }

  async refresh() {
    const { signal } = (this.ctl = new AbortController());
    const a = document.activeElement;
    const keys = [...this.querySelectorAll(LINE)].map((l) => l.dataset.lineKey);
    // Safari does not focus a clicked link.
    const key = this.contains(a) ? keyOf(a) : a === document.body && this.removed;
    const update = await partials.fetch(...this.dataset.partials.split(" "), { url: location.href, signal }).catch((err) => {
      if (!signal.aborted) throw err;
    });
    if (signal.aborted) return;
    await partials.apply(update);
    this.changed = false;
    this.sync(this.items);
    const w = this.querySelector("[data-cart-accelerated]");
    if (w) w.hidden = this.querySelector("[data-item-count]").dataset.itemCount === "0";
    if (key) {
      const n = keys.indexOf(key);
      const i = this.input(key);
      if (!i) (this.input(keys[n + 1]) || this.input(keys[n - 1]) || (this.closest("dialog") ? this.querySelector(".cart-empty a") : document.querySelector("h1")))?.focus();
      else if (a.matches(QTY) || !a.isConnected) i.focus();
    }
    this.say("status", this.note);
    this.dispatchEvent(new CustomEvent("theme:cart:updated", { bubbles: true, detail: { source: "cart-items" } }));
  }
}

if (!customElements.get("cart-items")) customElements.define("cart-items", CartItems);
