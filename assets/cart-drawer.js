// <cart-drawer> TE-5 AC1 AC6 AC7 AC15. Layer: <modal-dialog> (ADR 0007).
// https://shopify.dev/docs/api/storefront-events-and-actions/actions (ES1-T91, ES1-T164)
import { partials } from "@shopify/partial-rendering";

const LINK = "[data-cart-link]";
const d = document;

class CartDrawer extends HTMLElement {
  connectedCallback() {
    const o = { signal: (this.ac = new AbortController()).signal };
    this.modal = this.querySelector("modal-dialog");
    this.dialog = this.querySelector("dialog");
    if (this.dataset.mode == "drawer") {
      for (const t of ["theme:cart:updated", "click"]) d.addEventListener(t, this, o);
      for (const t of ["shopify:block:select", "shopify:block:deselect", "modal:close"]) this.addEventListener(t, this, o);
      addEventListener("pageshow", this, o);
    }
    this.actions();
    addEventListener("load", this.actions, o);
  }

  disconnectedCallback() {
    this.ac.abort();
    this.ctl?.abort();
  }

  handleEvent(e) {
    const { type, detail } = e;
    if (type == "pageshow") return e.persisted && this.refresh();
    if (type == "modal:close") return this.restore();
    if (type.endsWith(":select")) return this.show();
    if (type.endsWith("deselect")) return this.modal.close();
    if (type == "click") {
      const link = e.target.closest(LINK);
      if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      return this.refresh(1, link);
    }
    if (detail?.source == "cart-items") return this.added();
    this.refresh(1, detail?.opener, detail?.item);
  }

  // getCart isn't configurable; updateCart emits its own event.
  actions = () => {
    const a = window.Shopify?.actions;
    if (!a?.openCart?.configure || "actions" in this.dataset) return;
    a.openCart.configure({ handler: () => this.open() });
    a.updateCart.configure({ handler: (run) => run().then((r) => this.refresh().then(() => r)) });
    this.dataset.actions = "";
  };

  open() {
    if (this.dataset.mode == "drawer") return this.refresh(1, d.activeElement);
    const h1 = d.querySelector(".cart-page h1");
    h1 ? h1.focus() : location.assign(this.dataset.cartUrl);
  }

  async refresh(open, opener, item) {
    const g = this.dialog || {};
    this.ctl?.abort();
    const { signal } = (this.ctl = new AbortController());
    g.ariaBusy = true;
    try {
      const names = d.querySelector("cart-items")?.dataset.partials || "cart-count";
      await partials.apply(await partials.fetch(...names.split(" "), { url: location.href, signal }));
      const wallet = d.querySelector("[data-cart-accelerated]");
      if (wallet) wallet.hidden = d.querySelector("[data-item-count]").dataset.itemCount == "0";
      // apply() keeps input values.
      for (const i of d.querySelectorAll("[name='updates[]']")) i.value = i.defaultValue;
      if (open) this.show(opener, item);
    } catch {
      if (open && !signal.aborted) location.assign(this.dataset.cartUrl);
    }
    if (!signal.aborted) g.ariaBusy = null;
  }

  // item: /cart/add.js response, a line or { items }.
  show(opener, item) {
    if (!this.dialog.open) this.opener = opener;
    this.modal.open(opener);
    const lines = [].concat(item?.items || item || []);
    this.added(lines.map((i) => [i.product_title, i.variant_title].filter(Boolean).join(" · ")).join(", "));
    this.items ??= import(this.dataset.itemsSrc).catch(() => {});
  }

  // Hidden on close and on other cart actions.
  added(text = "") {
    const box = this.querySelector("[data-cart-added]");
    box.querySelector("[data-cart-added-item]").textContent = text;
    box.hidden = !text;
  }

  // Opener gone or disabled: cart link.
  restore() {
    const o = this.opener;
    this.added();
    (o?.matches("body *") && !o.disabled ? o : d.querySelector(LINK))?.focus();
  }
}

if (!customElements.get("cart-drawer")) customElements.define("cart-drawer", CartDrawer);
