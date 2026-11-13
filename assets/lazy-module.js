// Import data-lazy-module near viewport (ES1-T139); data-lazy-on="interaction":
// on first pointerenter/focusin/touchstart (ADR 0010).
const load = (el) => import(el.dataset.lazyModule).catch(() => {});
const io = new IntersectionObserver(
  (entries) => {
    for (const { isIntersecting: near, target: el } of entries) {
      if (near) io.unobserve(el), load(el);
    }
  },
  { rootMargin: "200px" }
);
for (const el of document.querySelectorAll("[data-lazy-module]")) {
  if (el.dataset.lazyOn !== "interaction") io.observe(el);
  else {
    const ac = new AbortController();
    const go = () => (ac.abort(), load(el));
    for (const on of ["pointerenter", "focusin", "touchstart"]) el.addEventListener(on, go, { passive: true, signal: ac.signal });
  }
}
