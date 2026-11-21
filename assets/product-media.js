// <product-media-gallery> PDP, featured (ADR 0012). Scoped to this: many per page.
const ITEM = "[data-media-id][data-media-type]";
const THUMB = 'a[href^="#"][data-media-id]';
const SCOPE = "featured-product,dialog";

class ProductMediaGallery extends HTMLElement {
  connectedCallback() {
    this.list = this.querySelector("ul");
    this.dialog = this.querySelector("dialog");
    this.items = [...this.list.children].filter((li) => li.matches(ITEM));
    this.ratios = new Map();
    this.io = new IntersectionObserver((e) => this.seen(e), { threshold: [0, .25, .5, .75, 1] });
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
    if (e.type[0] === "t") return this.own(e) && this.show(e.detail.featuredMediaId);
    if (e.type === "close") return this.opener?.focus({ preventScroll: true });
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.("a");
    const id = a?.dataset.testid;
    if (id === "product-media-zoom-link" && this.dialog) this.zoom(e, a);
    else if (id === "product-media-external-video") this.play(e, a);
    else if (a?.matches(THUMB)) e.preventDefault(), this.show(a.dataset.mediaId);
  }

  // Same product; picker in same featured block/dialog, or neither.
  own({ target: t }) {
    const id = t.closest?.("[data-product-id]")?.dataset.productId;
    return id == this.dataset.productId && t.closest(SCOPE) == this.closest(SCOPE);
  }

  // Other media stop. Sideways list scrolls itself, stacked scrolls the page.
  show(id) {
    const li = this.items.find((x) => x.dataset.mediaId == id);
    if (!li) return;
    for (const x of this.items) x === li || this.stop(x);
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const l = this.list;
    if (l.scrollWidth > l.clientWidth) {
      l.scrollTo({ left: l.scrollLeft + li.getBoundingClientRect().left - l.getBoundingClientRect().left, behavior });
    } else li.scrollIntoView({ block: "start", behavior });
    this.current(li);
  }

  current(li) {
    for (const t of this.querySelectorAll(THUMB)) t.ariaCurrent = t.dataset.mediaId === li.dataset.mediaId ? "true" : null;
  }

  seen(entries) {
    for (const { target, intersectionRatio, isIntersecting } of entries) {
      this.ratios.set(target, intersectionRatio);
      if (!isIntersecting) this.stop(target);
      else if (target.dataset.mediaType === "model") this.model(target);
    }
    let best, max = 0;
    for (const [li, r] of this.ratios) if (r > max) [best, max] = [li, r];
    best && this.current(best);
  }

  // Pause video, model; poster replaces iframe.
  stop(li) {
    for (const v of li.querySelectorAll("video")) v.pause();
    li.ui?.pause?.();
    li.frame?.isConnected && li.frame.replaceWith(li.poster);
  }

  zoom(e, a) {
    e.preventDefault();
    const img = this.dialog.querySelector("img");
    const src = a.querySelector("img");
    if (img.src !== a.href) img.src = a.href;
    const ratio = src?.getAttribute("height") / src?.getAttribute("width") || 1;
    Object.assign(img, { alt: src?.alt || "", width: 2048, height: Math.round(2048 * ratio), hidden: false });
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

  // model-viewer UI (Shopify CDN, NFR-6), once per item.
  model(li) {
    const viewer = li.querySelector("model-viewer"), S = window.Shopify;
    if (li.ui !== undefined || !viewer || !S?.loadFeatures) return;
    li.ui = null;
    S.loadFeatures([{ name: "model-viewer-ui", version: "1.0", onLoad: (err) => {
      if (!err && S.ModelViewerUI) li.ui = new S.ModelViewerUI(viewer);
    } }]);
  }
}

customElements.get("product-media-gallery") || customElements.define("product-media-gallery", ProductMediaGallery);
