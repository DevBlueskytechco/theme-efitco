// TE-7 AC1: data-static when the row fits; ends aria-disabled; RTL ok
customElements.get("scroll-buttons") || customElements.define("scroll-buttons", class extends HTMLElement {
  connectedCallback() {
    const [t, p, n] = ["track", "prev", "next"].map((h) => this.querySelector(`[data-scroll-${h}]`));
    if (!(t && p && n)) return;
    const signal = (this.ac = new AbortController()).signal;
    let f = 0;
    const sync = () => {
      f = 0;
      const a = document.activeElement, max = t.scrollWidth - t.clientWidth, x = Math.abs(t.scrollLeft);
      const [s, e] = [x < 1, x > max - 1];
      this.toggleAttribute("data-static", max < 1);
      p.ariaDisabled = s;
      n.ariaDisabled = e;
      // move focus off a dead button
      if ((a == p && s) || (a == n && e)) (max < 1 ? t : a == p ? n : p).focus();
    };
    const queue = () => (f ||= requestAnimationFrame(sync));
    const go = (d, b) => () => {
      const [c, k] = t.children;
      if (k && b.ariaDisabled != "true") t.scrollBy({
        left: d * (k.offsetLeft - c.offsetLeft),
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    };
    p.addEventListener("click", go(-1, p), { signal });
    n.addEventListener("click", go(1, n), { signal });
    t.addEventListener("scroll", queue, { signal, passive: true });
    (this.ro = new ResizeObserver(queue)).observe(t);
    sync();
    this.dataset.enhanced = "";
  }
  disconnectedCallback() {
    this.ac?.abort();
    this.ro?.disconnect();
  }
});
