// <cart-drawer> TE-5 AC1 AC6, TE-4 AC8 (ES1-T96).
// Dynamic import: asset_url ?v= duplicates static imports (ES1-T81).
import { partials } from "@shopify/partial-rendering";

const LINK = "[data-cart-link]";

class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.dialog = this.querySelector("dialog");
    if (this.dataset.mode === "drawer") this.listen("addEventListener");
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
      // Only the backdrop targets the dialog (CSS).
      if (target === this.dialog) return this.dialog.close();
      const link = target.closest(LINK);
      if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      return this.refresh(true, link);
    }
    if (detail?.source !== "cart-items") this.refresh(true, detail?.opener);
  }

  async refresh(open, opener) {
    const d = this.dialog;
    if (open && !d.open) this.opener = opener;
    this.controller?.abort();
    const { signal } = (this.controller = new AbortController());
    d.ariaBusy = "true";
    try {
      const update = await partials.fetch("cart-drawer", "cart-count", { url: location.href, signal });
      if (signal.aborted) return;
      await partials.apply(update);
      const body = this.querySelector("[data-item-count]");
      const wallet = this.querySelector("[data-cart-accelerated]");
      if (wallet) wallet.hidden = body.dataset.itemCount === "0";
      // apply() keeps input values: show the server quantity.
      for (const i of body.querySelectorAll("[name='updates[]']")) i.value = i.defaultValue;
      if (open) this.show();
    } catch {
      if (open && !signal.aborted) location.assign(this.dataset.cartUrl);
    } finally {
      if (!signal.aborted) d.ariaBusy = null;
    }
  }

  show() {
    if (!this.dialog.open) this.dialog.showModal();
    // No await: the no-JS form still works.
    this.items ??= import(this.dataset.itemsSrc).catch(() => {});
  }

  restore() {
    const o = this.opener;
    (o?.isConnected && !o.disabled ? o : document.querySelector(LINK))?.focus();
  }
}

if (!customElements.get("cart-drawer")) customElements.define("cart-drawer", CartDrawer);
