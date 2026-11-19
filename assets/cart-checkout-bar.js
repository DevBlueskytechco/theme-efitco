// <cart-checkout-bar> TE-5 AC17, ADR 0007 #2: < 64rem, summary out of view. One per page.
const wide = matchMedia("(min-width: 64rem)");
const root = document.documentElement.dataset;

class CartCheckoutBar extends HTMLElement {
  update = () => {
    const on = !this.seen && !wide.matches;
    this.querySelector("aside").hidden = !on;
    if (on) root.bottomBar = "cart";
    else if (root.bottomBar == "cart") delete root.bottomBar;
  };

  connectedCallback() {
    const panel = this.parentElement.querySelector(".cart-summary--page");
    this.seen = !panel;
    this.io = new IntersectionObserver((e) => {
      this.seen = e.at(-1).isIntersecting;
      this.update();
    });
    if (panel) this.io.observe(panel);
    wide.onchange = this.update;
  }

  disconnectedCallback() {
    this.io.disconnect();
    wide.onchange = null;
    this.seen = true;
    this.update();
  }
}

if (!customElements.get("cart-checkout-bar")) customElements.define("cart-checkout-bar", CartCheckoutBar);
