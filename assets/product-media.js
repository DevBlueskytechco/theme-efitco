// <product-media-gallery> TE-4 AC1 (ES1-T69). Markup blocks/product-media.liquid works without JS.
const ITEM = "[data-media-id][data-media-type]";
const THUMB = '[data-testid="product-media-thumbnail"]';

class ProductMediaGallery extends HTMLElement {
  connectedCallback() {
    this.list = this.querySelector('[data-testid="product-media-list"]');
    this.dialog = this.querySelector("dialog");
    this.items = [...this.list.children].filter((li) => li.matches(ITEM));
    this.ratios = new Map();
    this.io = new IntersectionObserver((e) => this.seen(e), { threshold: [0, 0.25, 0.5, 0.75, 1] });
    for (const li of this.items) this.io.observe(li);
    this.addEventListener("click", this);
    this.dialog?.addEventListener("close", this);
    document.addEventListener("theme:variant:change", this);
  }

  disconnectedCallback() {
    this.io.disconnect();
    document.removeEventListener("theme:variant:change", this);
  }

  handleEvent(e) {
    if (e.type === "theme:variant:change") return this.show(e.detail?.featuredMediaId);
    if (e.type === "close") return this.opener?.focus({ preventScroll: true });
    // Modified click: browser opens a tab.
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.("a");
    const id = a?.dataset.testid;
    if (id === "product-media-zoom-link" && this.dialog) this.zoom(e, a);
    else if (id === "product-media-external-video") this.play(e, a);
    else if (id === "product-media-thumbnail") {
      e.preventDefault();
      this.show(a.dataset.mediaId);
    }
  }

  // Sideways list below 64rem, page when stacked. Focus stays.
  show(id) {
    const li = this.items.find((x) => x.dataset.mediaId === String(id));
    if (!li) return;
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const { list } = this;
    if (list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: list.scrollLeft + li.getBoundingClientRect().left - list.getBoundingClientRect().left, behavior });
    } else li.scrollIntoView({ block: "start", behavior });
    this.current(li);
  }

  current(li) {
    for (const t of this.querySelectorAll(THUMB)) {
      if (t.dataset.mediaId === li.dataset.mediaId) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    }
  }

  seen(entries) {
    for (const { target, intersectionRatio, isIntersecting } of entries) {
      this.ratios.set(target, isIntersecting ? intersectionRatio : 0);
      if (!isIntersecting) this.stop(target);
      else if (target.dataset.mediaType === "model") this.model(target);
    }
    let best;
    let max = 0;
    for (const [li, r] of this.ratios) if (r > max) [best, max] = [li, r];
    if (best) this.current(best);
  }

  // Off-screen: pause video and model, external poster back (stops the iframe).
  stop(li) {
    for (const v of li.querySelectorAll("video")) if (!v.paused) v.pause();
    li.ui?.pause?.();
    if (li.frame?.isConnected) li.frame.replaceWith(li.poster);
  }

  zoom(e, a) {
    e.preventDefault();
    const img = this.dialog.querySelector("img");
    const src = a.querySelector("img");
    const ratio = src?.getAttribute("height") / src?.getAttribute("width") || 1;
    if (img.getAttribute("src") !== a.href) img.src = a.href;
    img.alt = src?.alt || "";
    img.width = 2048;
    img.height = Math.round(2048 * ratio);
    img.hidden = false;
    this.opener = a;
    if (!this.dialog.open) this.dialog.showModal();
  }

  // NFR-6: iframe leaves the template only on click.
  play(e, a) {
    const li = a.closest(ITEM);
    const frame = li.frame || li.querySelector("template")?.content.firstElementChild?.cloneNode(true);
    if (!frame) return;
    e.preventDefault();
    li.poster = a;
    li.frame = frame;
    a.replaceWith(frame);
    frame.focus();
  }

  // model-viewer + UI from Shopify CDN (NFR-6), once per item.
  model(li) {
    const viewer = li.querySelector("model-viewer");
    const S = window.Shopify;
    if (li.ui !== undefined || !viewer || !S?.loadFeatures) return;
    li.ui = null;
    S.loadFeatures([{ name: "model-viewer-ui", version: "1.0", onLoad: (err) => {
      if (!err && S.ModelViewerUI) li.ui = new S.ModelViewerUI(viewer);
    } }]);
  }
}

if (!customElements.get("product-media-gallery")) customElements.define("product-media-gallery", ProductMediaGallery);
