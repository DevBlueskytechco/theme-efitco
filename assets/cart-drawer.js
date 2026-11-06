// <cart-drawer> TE-5 AC1 AC6 AC7, TE-4 AC8.
// No static import: ?v= duplicates modules (ES1-T81).
// https://shopify.dev/docs/api/storefront-events-and-actions/actions (ES1-T91 #1 #2):
// configure, no assignment; updateCart emits its own event (ES1-T83).
import { partials } from "@shopify/partial-rendering";

const LINK = "[data-cart-link]";
const events = import("https://cdn.shopify.com/storefront/standard-events.js").catch(() => null);

class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.dialog = this.querySelector("dialog");
    if (this.dataset.mode === "drawer") this.listen("addEventListener");
    // Load order undocumented.
    this.actions();
    events.then(this.actions);
    addEventListener("load", this.actions);
  }

  disconnectedCallback() {
    this.listen("removeEventListener");
    this.controller?.abort();
  }

  listen(m) {
    for (const t of ["theme:cart:updated", "click"]) document[m](t, this);
    for (const t of ["shopify:block:select", "shopify:block:deselect"]) this[m](t, this);
    window[m]("pageshow", this);
    this.dialog?.[m]("close", this);
  }

  handleEvent(e) {
    const { type, target, detail } = e;
    if (type === "pageshow") return e.persisted && this.refresh();
    if (type === "close") return this.restore();
    if (type.endsWith(":select")) return this.show();
    if (type.endsWith(":deselect")) return this.dialog.close();
    if (type === "click") {
      // Backdrop (CSS).
      if (target === this.dialog) return this.dialog.close();
      const link = target.closest(LINK);
      if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      return this.refresh(true, link);
    }
    if (detail?.source !== "cart-items") this.refresh(true, detail?.opener);
  }

  actions = () => {
    const a = window.Shopify?.actions;
    if (!a?.openCart?.configure || "actions" in this.dataset) return;
    a.getCart?.configure?.({ handler: () => this.cart() });
    a.openCart.configure({ handler: () => this.open() });
    a.updateCart.configure({
      handler: async (run) => {
        const result = await run();
        await this.refresh();
        return result;
      },
    });
    this.dataset.actions = "";
  };

  async cart() {
    const res = await fetch(`${this.dataset.cartUrl}.js`, { cache: "no-store" });
    const cart = await res.json();
    return (await events)?.CartLinesUpdateEvent.createCartFromAjaxResponse(cart) ?? cart;
  }

  async open() {
    if (this.dataset.mode === "drawer") return this.refresh(true, document.activeElement);
    const h1 = document.querySelector(".cart-page h1");
    h1 ? h1.focus() : location.assign(this.dataset.cartUrl);
  }

  async refresh(open, opener) {
    const d = this.dialog || {};
    if (open && !d.open) this.opener = opener;
    this.controller?.abort();
    const { signal } = (this.controller = new AbortController());
    d.ariaBusy = "true";
    try {
      const names = document.querySelector("cart-items")?.dataset.partials || "cart-count";
      const update = await partials.fetch(...names.split(" "), { url: location.href, signal });
      if (signal.aborted) return;
      await partials.apply(update);
      const wallet = document.querySelector("[data-cart-accelerated]");
      if (wallet) wallet.hidden = document.querySelector("[data-item-count]").dataset.itemCount === "0";
      // apply() keeps input values.
      for (const i of document.querySelectorAll("[name='updates[]']")) i.value = i.defaultValue;
      if (open) this.show();
    } catch {
      if (open && !signal.aborted) location.assign(this.dataset.cartUrl);
    } finally {
      if (!signal.aborted) d.ariaBusy = null;
    }
  }

  show() {
    if (!this.dialog.open) this.dialog.showModal();
    // No await.
    this.items ??= import(this.dataset.itemsSrc).catch(() => {});
  }

  restore() {
    const o = this.opener;
    (o?.matches("body *") && !o.disabled ? o : document.querySelector(LINK))?.focus();
  }
}

if (!customElements.get("cart-drawer")) customElements.define("cart-drawer", CartDrawer);
