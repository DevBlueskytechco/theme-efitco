// Lớp trải nghiệm trang (trai_nghiem.xlsx, ES1-T235). Không có file này trang vẫn đủ nội dung.
const auto = navigator.webdriver;
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!calm && !auto) {
  document.documentElement.dataset.motion = "on";
  const items = [...document.querySelectorAll("main > .block-container > *, .shop-by-level__list > *, .featured-collection__grid > *")].filter(
    (e) => !e.matches(".slideshow") && !e.querySelector("[data-reveal]") && e.getBoundingClientRect().top > innerHeight,
  );
  const io = new IntersectionObserver(
    (seen) => {
      for (const { isIntersecting, target } of seen) {
        if (!isIntersecting) continue;
        io.unobserve(target);
        target.dataset.reveal = "in";
        target.addEventListener("transitionend", () => target.removeAttribute("data-reveal"), { once: true });
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const e of items) {
    e.dataset.reveal = "wait";
    e.style.setProperty("--reveal-i", Math.min([...e.parentElement.children].indexOf(e), 3));
    io.observe(e);
  }
}

// Số giỏ đổi: icon nhún. Partial thay cả link nên so số trước và sau.
const count = () => document.querySelector('[data-testid="header-cart-count"]')?.textContent.trim() ?? "0";
const icons = document.querySelector(".site-header__icons");
if (icons && !calm) {
  let last = count();
  new MutationObserver(() => {
    const now = count();
    if (now === last) return;
    last = now;
    document.querySelector('[data-testid="header-cart-link"]')?.setAttribute("data-bump", "");
  }).observe(icons, { childList: true, subtree: true });
}
