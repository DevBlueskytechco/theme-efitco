// <bundle-form> ES1-T149 TE-12
const TYPE = "application/json";
const HEADERS = { Accept: TYPE, "Content-Type": TYPE, "X-Requested-With": "XMLHttpRequest" };
const events = import("https://cdn.shopify.com/storefront/standard-events.js").catch(() => {});
customElements.define("bundle-form", class extends HTMLElement {
connectedCallback() {
const d = this.dataset;
const { format } = new Intl.NumberFormat(d.locale, { style: "currency", currency: d.currency });
this.money = (c) => format(c / 100);
this.tiers = [...new Map(d.tiers?.split(",").map((t) => t.split(":").map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]))];
this.btn = this.$("submit");
const { signal } = (this.off = new AbortController());
for (const t of ["submit", "change", "click", "focusin", "pointerover"]) this.addEventListener(t, this, { signal });
addEventListener("pageshow", this, { signal });
this.update();
this.toggleAttribute("data-enhanced", true);
}
disconnectedCallback() {
this.off.abort();
this.ctrl?.abort();
}
handleEvent(e) {
const t = e.type;
if (t == "submit") return this.add(e);
if (t == "change") return this.update(1);
if (t != "pageshow") return this.look(e);
if (e.persisted) this.lock();
this.update();
}
$(name, root = this) {
return root.querySelector(`[data-bundle-${name}]`);
}
set(name, text, root) {
const el = this.$(name, root);
if (el) el.textContent = text;
}
picked() {
return [...this.querySelectorAll("[data-bundle-item]:is([type=hidden],:checked:enabled)")];
}
update(announce) {
const d = this.dataset;
const { tiers, money } = this;
const items = this.picked();
const n = items.length;
const sub = items.reduce((s, i) => s + +i.dataset.price, 0);
const p = tiers.findLast(([q]) => q <= n)?.[1] || 0;
const off = Math.round((sub * p) / 100);
const total = money(sub - off);
this.set("count", (n == 1 ? d.labelCountOne : d.labelCountOther).replace("%n", n));
this.set("subtotal", money(sub));
this.set("total", total);
this.set("discount-label", d.labelDiscount.replace("%p", p));
this.set("discount", money(off));
this.$("discount-row")?.toggleAttribute("hidden", !p);
this.$("empty")?.toggleAttribute("hidden", n > 0);
const tpl = this.$("line-template");
if (tpl) this.$("lines").replaceChildren(...items.map((i) => {
const li = tpl.content.cloneNode(true);
this.set("line-title", i.dataset.title, li);
this.set("line-price", money(i.dataset.price), li);
return li;
}));
const bar = this.$("progress");
if (bar) {
const next = tiers.find(([q]) => q > n);
const left = next?.[0] - n;
const label = next ? (left == 1 && d.labelProgressOne) || d.labelProgress : d.labelProgressDone;
bar.style.setProperty("--bundle-progress", `${Math.min(100, n * 100 / tiers.at(-1)[0])}%`);
this.set("progress-text", label.replace("%n", left).replace("%p", next ? next[1] : p));
}
if (!announce) return;
clearTimeout(this.timer);
this.timer = setTimeout(() => this.set("status", d.labelStatus.replace("%n", n).replace("%t", total)), 300);
}
look({ type, target }) {
const spot = target.closest("[data-hotspot]")?.dataset.hotspot;
const click = type == "click";
const n = spot || (click && target.closest("[data-look-row]")?.dataset.lookRow);
if (!n) return;
if (click) for (const h of this.querySelectorAll("[data-hotspot]")) h.setAttribute("aria-pressed", h.dataset.hotspot == n);
for (const r of this.querySelectorAll("[data-look-row]")) r.toggleAttribute("data-look-active", r.dataset.lookRow == n);
}
lock(on) {
this.btn.disabled = on;
this.btn.ariaBusy = on ? "true" : null;
}
async emit(items) {
const E = (await Promise.race([events, new Promise((r) => setTimeout(r, 500))]))?.CartLinesUpdateEvent;
try {
const deferred = E.createPromise();
const lines = items.map(({ id, quantity }) => ({ merchandiseId: `gid://shopify/ProductVariant/${id}`, quantity }));
this.dispatchEvent(new E({ action: "add", context: "product", lines, promise: deferred.promise }));
return async (message, signal) => {
let cart = null;
try {
const r = signal && (await fetch(`${this.dataset.cartUrl}.js`, { signal }));
if (r?.ok) cart = E.createCartFromAjaxResponse(await r.json());
} catch {}
deferred.resolve({ cart, userErrors: message ? [{ message }] : [], warnings: [] });
};
} catch {}
}
async add(e) {
e.preventDefault();
const d = this.dataset;
const qty = new Map();
for (const { value } of this.picked()) qty.set(value, (qty.get(value) || 0) + 1);
if (this.btn.disabled || !qty.size) return;
const items = [...qty].map(([id, quantity]) => ({ id: +id, quantity }));
const { signal } = (this.ctrl = new AbortController());
this.set("error", "");
this.lock(true);
let leaving, done;
try {
done = await this.emit(items);
const res = await fetch(`${d.cartAddUrl}.js`, { method: "POST", headers: HEADERS, body: JSON.stringify({ items }), signal });
const data = await res.json().catch(() => ({}));
if (!res.ok) {
if (res.status > 499 || !data.description) throw Error(res.status);
done?.(data.description, signal);
return this.set("error", data.description);
}
this.dispatchEvent(new CustomEvent("theme:cart:updated", { bubbles: true, detail: { source: "bundle-form", item: data, opener: this.btn } }));
await done?.("", signal);
leaving = d.cartType == "page" || !document.querySelector("cart-drawer dialog") || !customElements.get("cart-drawer");
if (leaving) location.assign(d.cartUrl);
} catch (err) {
done?.(err.message);
if (err.name != "AbortError") this.set("error", d.labelError);
} finally {
if (!leaving) {
this.lock();
if (document.activeElement == document.body) this.btn.focus();
}
}
}
});
