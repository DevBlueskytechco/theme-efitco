// Lớp trải nghiệm trang (trai_nghiem.xlsx, ES1-T235). Không có file này trang vẫn đủ nội dung.
const auto = navigator.webdriver;
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!calm && !auto) {
  document.documentElement.dataset.motion = "on";
  reveal();
  scrub();
}

/**
 * Hiện dần khi cuộn tới (ES1-T250). 3 kiểu: text (tiêu đề, eyebrow, đoạn), card (phần tử trong hàng, lưới),
 * media (ảnh lớn mở dần bằng clip-path). Thứ tự --reveal-i đếm trong cùng 1 khối để chữ, card nối nhau.
 * Bỏ qua thứ đang ở màn đầu (tránh nháy) và hero (CSS lo).
 */
function reveal() {
  const kinds = {
    text: "main :is(h2, [class*='__eyebrow'], [class*='__subheading'], .image-with-text__body, .image-with-text__content > .button, .rich-text__content > *, .video-carousel__stats, .faq__stats, .featured-collection__tabs)",
    card: "main :is(.collection-list__track, .shop-by-level__list, .featured-collection__grid, .video-carousel__list, .testimonials__list, .blog-posts__list, .bundle-builder__list, .faq__list, .multicolumn__list) > *",
    media: "main :is(.featured-product__media, .shop-the-look__media, .faq__media, .image-with-text--split .image-with-text__media, .quiz__form, .bundle-builder__summary), .site-footer__newsletter-image",
  };
  const skip = ".slideshow, [data-quiz-dialog], .image-with-text--banner .image-with-text__accent";
  const seen = new Set();
  const items = [];
  for (const [kind, sel] of Object.entries(kinds)) {
    for (const e of document.querySelectorAll(sel)) {
      if (seen.has(e) || e.closest(skip) || e.getBoundingClientRect().top < innerHeight) continue;
      seen.add(e);
      items.push([e, kind]);
    }
  }
  // Card trong 1 hàng hiện theo hàng (cả card đang nằm ngoài mép phải), chữ và ảnh hiện theo chính nó
  const order = new Map();
  const groups = new Map();
  const show = (e) => {
    e.dataset.reveal = "in";
    // Bỏ thuộc tính sau khi xong để hover (translate, scale) của card không bị transition reveal giữ lại
    setTimeout(() => {
      e.removeAttribute("data-reveal");
      e.removeAttribute("data-reveal-kind");
    }, 1600 + 80 * +e.style.getPropertyValue("--reveal-i"));
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;
        io.unobserve(target);
        (groups.get(target) ?? [target]).forEach(show);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  for (const [e, kind] of items) {
    const group = kind === "card" ? e.parentElement : e.closest(".block-container, footer") ?? document.body;
    const i = order.get(group) ?? 0;
    order.set(group, i + 1);
    e.dataset.reveal = "wait";
    e.dataset.revealKind = kind;
    e.style.setProperty("--reveal-i", Math.min(i, 5));
    if (kind !== "card") io.observe(e);
    else if (!groups.has(group)) groups.set(group, []), io.observe(group);
    if (kind === "card") groups.get(group).push(e);
  }
}

/**
 * Cuộn gắn tiến trình (CTO 09/11 #6): khối Make fitness, chữ tiêu đề đậm dần từng từ, ảnh nhỏ trôi lên.
 * Chỉ chạy khi khối ở gần khung nhìn; mỗi khung hình 1 lần đọc vị trí.
 */
function scrub() {
  const blocks = [...document.querySelectorAll(".image-with-text--banner")];
  if (!blocks.length) return;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const jobs = blocks.map((block) => {
    const heading = block.querySelector(".image-with-text__heading");
    const words = heading ? split(heading) : [];
    if (heading) heading.dataset.scrub = "";
    const lifts = [...block.querySelectorAll(".image-with-text__accent")].map((el, i) => {
      el.dataset.lift = "";
      return [el, [90, 150, 120][i % 3]];
    });
    return () => {
      const vh = innerHeight;
      if (heading) {
        const top = heading.getBoundingClientRect().top;
        const p = clamp((vh * 0.85 - top) / (vh * 0.5));
        const n = words.length;
        const q = p * (1 + 2.5 / n);
        words.forEach((w, i) => w.style.setProperty("--w", clamp(((q - i / n) * n) / 2.5).toFixed(3)));
      }
      const r = block.getBoundingClientRect();
      const t = clamp((vh - r.top) / (vh + r.height));
      for (const [el, speed] of lifts) el.style.setProperty("--lift", `${((0.5 - t) * speed).toFixed(1)}px`);
    };
  });
  const live = new Set();
  let ticking = false;
  const frame = () => {
    ticking = false;
    for (const job of live) job();
  };
  const ask = () => {
    if (!ticking && live.size) (ticking = true), requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const { isIntersecting, target } of entries) {
        const job = jobs[blocks.indexOf(target)];
        isIntersecting ? live.add(job) : live.delete(job);
      }
      ask();
    },
    { rootMargin: "20% 0px" },
  );
  blocks.forEach((b) => io.observe(b));
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", ask, { passive: true });
  jobs.forEach((job) => job());
}

/** Bọc từng từ trong span, giữ nguyên strong, br; trình đọc màn hình vẫn đọc liền câu. */
function split(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const words = [];
  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    for (const part of node.data.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.append(part);
        continue;
      }
      const span = document.createElement("span");
      span.className = "motion-word";
      span.textContent = part;
      frag.append(span);
      words.push(span);
    }
    node.replaceWith(frag);
  }
  return words;
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

// Hàng cuộn ngang: thanh tiến trình, kéo chuột (không phụ thuộc chế độ chuyển động)
if (document.querySelector("scroll-buttons")) import(new URL("scroll-extras.js", import.meta.url));

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
