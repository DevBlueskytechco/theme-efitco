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

// Số thống kê chạy từ 0 khi cuộn tới. Giữ chữ kèm theo ("360+"), giữ nguyên chữ không có số.
if (!calm && !auto) {
  const stats = new IntersectionObserver(
    (seen) => {
      for (const { isIntersecting, target } of seen) {
        if (!isIntersecting) continue;
        stats.unobserve(target);
        const { before, end, after, text } = target.motionCount;
        const start = performance.now();
        const step = (now) => {
          const t = Math.min((now - start) / 1400, 1);
          target.firstChild.data = t < 1 ? before + Math.round(end * (1 - (1 - t) ** 3)) + after : text;
          if (t < 1) requestAnimationFrame(step);
          else target.removeAttribute("aria-label");
        };
        requestAnimationFrame(step);
      }
    },
    { threshold: 0.6 },
  );
  for (const el of document.querySelectorAll(".faq__stat-value")) {
    const text = el.textContent.trim();
    const m = text.match(/^(\D*)(\d+)(\D*)$/);
    if (!m || !el.firstChild) continue;
    el.motionCount = { before: m[1], end: +m[2], after: m[3], text };
    el.setAttribute("aria-label", text);
    el.textContent = m[1] + 0 + m[3];
    stats.observe(el);
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

// Bản tin: dùng 1 thông báo của theme, không bubble trình duyệt. Không JS thì trình duyệt vẫn kiểm tra.
const news = document.querySelector("#footer-newsletter");
if (news) {
  news.noValidate = true;
  const input = news.querySelector('input[type="email"]');
  const mark = () => news.toggleAttribute("data-invalid", !input.validity.valid);
  news.addEventListener("submit", (e) => {
    if (input.validity.valid) return;
    e.preventDefault();
    mark();
    input.setAttribute("aria-invalid", "true");
    input.focus();
  });
  input.addEventListener("input", () => {
    if (!news.hasAttribute("data-invalid")) return;
    mark();
    if (input.validity.valid) input.removeAttribute("aria-invalid");
  });
}

// Chọn tiền tệ, ngôn ngữ: bấm ra ngoài hoặc Esc thì đóng.
const disclosure = document.querySelector(".site-footer__disclosure");
if (disclosure) {
  document.addEventListener("pointerdown", (e) => {
    if (disclosure.open && !disclosure.contains(e.target)) disclosure.open = false;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !disclosure.open) return;
    disclosure.open = false;
    disclosure.querySelector("summary")?.focus();
  });
}
