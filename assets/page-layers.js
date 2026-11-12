// <page-layers>: ADR 0007 #6, layers.md §4–§5.
const LAYER = ':modal, [data-layer]:is([open], [aria-expanded="true"]), [data-layer] > dialog[open]';
const TYPING = "input, textarea, select, iframe, [contenteditable]";
const d = document;
const html = d.documentElement;

class PageLayers extends HTMLElement {
  connectedCallback() {
    const signal = (this.ac = new AbortController()).signal;
    this.q = () => (cancelAnimationFrame(this.raf), (this.raf = requestAnimationFrame(() => this.update())));
    this.mo = new MutationObserver(this.q);
    this.mo.observe(d.body, { childList: true, subtree: true, attributeFilter: ["open", "aria-expanded"] });
    this.ro = new ResizeObserver(this.q);
    for (const t of ["focusin", "focusout"]) d.addEventListener(t, this.q, { signal });
    addEventListener("blur", this.q, { signal }); // iframe focus
    d.addEventListener("visitorConsentCollected", () => ((this.collected = true), this.q()), { signal });
    this.update();
  }

  disconnectedCallback() {
    this.ac.abort();
    this.mo.disconnect();
    this.ro.disconnect();
  }

  update() {
    html.toggleAttribute("data-inbox", d.querySelector(this.dataset.inboxSelector || null));
    const banner = this.collected ? null : d.querySelector("#shopify-pc__banner");
    if (banner !== this.banner) {
      this.ro.disconnect();
      if ((this.banner = banner)) this.ro.observe(banner);
    }
    const r = banner?.getBoundingClientRect();
    const h = r?.bottom >= innerHeight - 1 ? Math.max(0, Math.ceil(innerHeight - r.top)) : 0;
    html.toggleAttribute("data-consent", r?.height > 0);
    html.style.setProperty("--consent-height", `${h}px`);
    html.toggleAttribute("data-layer-open", d.querySelector(LAYER));
    const busy = html.matches("[data-layer-open], [data-consent]") || !!d.activeElement?.matches(TYPING);
    if (this.busy && !busy) d.dispatchEvent(new Event("layers:idle"));
    this.busy = busy;
  }
}

if (!customElements.get("page-layers")) customElements.define("page-layers", PageLayers);
