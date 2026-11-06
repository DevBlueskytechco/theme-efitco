// Import data-lazy-module near the viewport (ES1-T139).
const io = new IntersectionObserver(
  (entries) => {
    for (const { isIntersecting: near, target: el } of entries) {
      if (near) io.unobserve(el), import(el.dataset.lazyModule).catch(() => {});
    }
  },
  { rootMargin: "200px" }
);
document.querySelectorAll("[data-lazy-module]").forEach((el) => io.observe(el));
