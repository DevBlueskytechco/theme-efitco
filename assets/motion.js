// Lớp trải nghiệm trang (ES1-T235, ES1-T316). Không có file này trang vẫn đủ nội dung.
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const moving = !calm && !navigator.webdriver;

// Gọi fn(el) 1 lần khi el vào khung nhìn
const once = (options, fn) => {
  const io = new IntersectionObserver((entries) => {
    for (const { isIntersecting, target } of entries) if (isIntersecting) io.unobserve(target), fn(target);
  }, options);
  return (el) => io.observe(el);
};

if (moving) {
  document.documentElement.dataset.motion = "on";
  reveal();
  countUp();
  // Chữ đậm dần, ảnh trôi của khối banner: nạp khi khối cách khung nhìn 1 màn
  const scrub = once({ rootMargin: "100% 0px" }, () => import(new URL("motion-scrub.js", import.meta.url)).catch(() => {}));
  document.querySelectorAll(".image-with-text--banner").forEach(scrub);
}

/**
 * Hiện dần khi cuộn tới (ES1-T250): text, card (cả hàng), media (clip-path); --reveal-i là thứ tự trong khối.
 * Bỏ qua màn đầu và hero: chữ hero do CSS, ảnh hero hiện ngay (TE-2 AC10).
 */
function reveal() {
  const kinds = {
    text: "main :is(h2, [class*='__eyebrow'], [class*='__subheading'], .image-with-text__body, .image-with-text__content > .button, .rich-text__content > *, .video-carousel__stats, .faq__stats, .featured-collection__tabs)",
    card: "main :is(.collection-list__track, .shop-by-level__list, .featured-collection__grid, .video-carousel__list, .testimonials__list, .blog-posts__list, .bundle-builder__list, .faq__list, .multicolumn__list) > *",
    media: "main :is(.featured-product__media, .shop-the-look__media, .faq__media, .image-with-text--split .image-with-text__media, .quiz__form, .bundle-builder__summary), .site-footer__newsletter-image",
  };
  const skip = ".slideshow, [data-quiz-dialog], .image-with-text--banner .image-with-text__accent";
  // Đọc hết vị trí rồi mới ghi, tránh layout lại từng phần tử
  const items = new Map();
  for (const [kind, sel] of Object.entries(kinds)) {
    for (const e of document.querySelectorAll(sel)) {
      if (!items.has(e) && !e.closest(skip) && e.getBoundingClientRect().top >= innerHeight) items.set(e, kind);
    }
  }
  const show = (e) => {
    e.dataset.reveal = "in";
    // Gỡ khi xong để hover của card không dính transition reveal
    setTimeout(() => {
      e.removeAttribute("data-reveal");
      e.removeAttribute("data-reveal-kind");
    }, 1600 + 80 * e.style.getPropertyValue("--reveal-i"));
  };
  const groups = new Map();
  const order = new Map();
  const watch = once({ rootMargin: "0px 0px -10% 0px" }, (el) => groups.get(el).forEach(show));
  for (const [e, kind] of items) {
    const box = kind === "card" ? e.parentElement : e.closest(".block-container, footer") ?? document.body;
    const i = order.get(box) ?? 0;
    order.set(box, i + 1);
    e.dataset.reveal = "wait";
    e.dataset.revealKind = kind;
    e.style.setProperty("--reveal-i", Math.min(i, 5));
    const key = kind === "card" ? box : e;
    if (!groups.has(key)) groups.set(key, []), watch(key);
    groups.get(key).push(e);
  }
}

// Số thống kê chạy từ 0 khi cuộn tới, giữ chữ kèm ("360+"); không có số thì giữ nguyên
function countUp() {
  const run = once({ threshold: 0.6 }, (el) => {
    const [text, before, end, after] = el.motionCount;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 1400, 1);
      el.firstChild.data = t < 1 ? before + Math.round(end * (1 - (1 - t) ** 3)) + after : text;
      if (t < 1) requestAnimationFrame(step);
      else el.removeAttribute("aria-label");
    };
    requestAnimationFrame(step);
  });
  for (const el of document.querySelectorAll(".faq__stat-value")) {
    const m = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
    if (!m || !el.firstChild) continue;
    el.motionCount = m;
    el.setAttribute("aria-label", m[0]);
    el.textContent = m[1] + 0 + m[3];
    run(el);
  }
}

// Hàng cuộn ngang: tiến trình, kéo chuột (mọi chế độ), nạp khi hàng đầu gần khung nhìn
const extras = once({ rootMargin: "200px" }, () => import(new URL("scroll-extras.js", import.meta.url)).catch(() => {}));
document.querySelectorAll("scroll-buttons").forEach(extras);

// Số giỏ đổi thì icon nhún. Partial thay cả link nên so số trước và sau.
const icons = document.querySelector(".site-header__icons");
if (icons && !calm) {
  const count = () => icons.querySelector('[data-testid="header-cart-count"]')?.textContent.trim() ?? "0";
  let last = count();
  new MutationObserver(() => {
    const now = count();
    if (now === last) return;
    last = now;
    icons.querySelector('[data-testid="header-cart-link"]')?.setAttribute("data-bump", "");
  }).observe(icons, { childList: true, subtree: true });
}

// Bản tin: thông báo của theme thay bubble trình duyệt; không JS thì trình duyệt tự kiểm
const news = document.querySelector("#footer-newsletter");
const email = news?.querySelector('input[type="email"]');
if (email) {
  news.noValidate = true;
  const mark = () => {
    const bad = !email.validity.valid;
    news.toggleAttribute("data-invalid", bad);
    bad ? email.setAttribute("aria-invalid", "true") : email.removeAttribute("aria-invalid");
  };
  news.addEventListener("submit", (e) => {
    if (email.validity.valid) return;
    e.preventDefault();
    mark();
    email.focus();
  });
  email.addEventListener("input", () => news.hasAttribute("data-invalid") && mark());
}

// Chọn nước, ngôn ngữ ở footer: bấm ra ngoài hoặc Esc thì đóng.
const disclosure = document.querySelector(".site-footer__disclosure");
if (disclosure) {
  addEventListener("pointerdown", (e) => {
    if (disclosure.open && !disclosure.contains(e.target)) disclosure.open = false;
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !disclosure.open) return;
    disclosure.open = false;
    disclosure.querySelector("summary")?.focus();
  });
}
