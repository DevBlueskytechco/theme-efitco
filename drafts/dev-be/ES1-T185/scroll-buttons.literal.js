// Bản so sánh cho ES1-T209, KHÔNG nạp lên store: đúng chữ ticket, có thụt lề, có RTL, vượt trần 768 B.
// Next, back scroll data-scroll-track by 1 item, hide at the ends (ES1-T185).
customElements.get("scroll-buttons") || customElements.define("scroll-buttons", class extends HTMLElement {
  connectedCallback() {
    const [t, p, n] = ["track", "prev", "next"].map((h) => this.querySelector(`[data-scroll-${h}]`));
    const c = (this.c = new AbortController());
    const o = { signal: c.signal, passive: true };
    const s = () => {
      const x = Math.abs(t.scrollLeft);
      [p.hidden, n.hidden] = [x < 1, x > t.scrollWidth - t.clientWidth - 1];
      // Hiding the focused button must not drop focus to body.
      if (document.activeElement.hidden) [n, p, t].find((e) => !e.hidden).focus();
    };
    const g = (d) => () => {
      const css = getComputedStyle(t);
      t.scrollBy({
        left: d * (css.direction == "rtl" ? -1 : 1) * (t.children[0].getBoundingClientRect().width + parseFloat(css.columnGap)),
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    };
    p.addEventListener("click", g(-1), o);
    n.addEventListener("click", g(1), o);
    t.addEventListener("scroll", s, o);
    (this.r = new ResizeObserver(s)).observe(t);
    s();
    this.dataset.enhanced = "";
  }
  disconnectedCallback() {
    this.c.abort();
    this.r.disconnect();
  }
});
