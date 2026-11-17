// Cuộn gắn tiến trình (CTO 09/11 #6, ES1-T316): khối Make fitness, chữ tiêu đề đậm dần từng từ, ảnh nhỏ trôi lên.
// motion.js nạp file này khi khối .image-with-text--banner cách khung nhìn 1 màn hình, chỉ khi bật chuyển động.
// Chỉ chạy khi khối gần khung nhìn; mỗi khung hình đọc vị trí 1 lần.
const blocks = [...document.querySelectorAll(".image-with-text--banner")];
const clamp = (v) => Math.min(1, Math.max(0, v));
const jobs = new Map();
const live = new Set();
let ticking = false;

/** Bọc từng từ trong span, giữ strong, br; trình đọc màn hình vẫn đọc liền câu. */
const split = (el) => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const words = [];
  for (const node of nodes) {
    const parts = node.data.split(/(\s+)/).filter(Boolean);
    node.replaceWith(
      ...parts.map((part) => {
        if (/^\s/.test(part)) return part;
        const span = document.createElement("span");
        span.className = "motion-word";
        span.textContent = part;
        words.push(span);
        return span;
      }),
    );
  }
  return words;
};

for (const block of blocks) {
  const heading = block.querySelector(".image-with-text__heading");
  const words = heading ? split(heading) : [];
  if (heading) heading.dataset.scrub = "";
  const lifts = [...block.querySelectorAll(".image-with-text__accent")];
  lifts.forEach((el) => (el.dataset.lift = ""));
  jobs.set(block, () => {
    const vh = innerHeight;
    if (heading) {
      // p: tiến trình 0..1 của tiêu đề; mỗi từ đậm dần trong 2,5 bước từ
      const p = clamp((vh * 0.85 - heading.getBoundingClientRect().top) / (vh * 0.5));
      const n = words.length;
      words.forEach((w, i) => w.style.setProperty("--w", clamp((p * (n + 2.5) - i) / 2.5).toFixed(3)));
    }
    const r = block.getBoundingClientRect();
    const t = 0.5 - clamp((vh - r.top) / (vh + r.height));
    lifts.forEach((el, i) => el.style.setProperty("--lift", `${(t * [90, 150, 120][i % 3]).toFixed(1)}px`));
  });
}

const ask = () => {
  if (ticking || !live.size) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    live.forEach((job) => job());
  });
};

const io = new IntersectionObserver(
  (entries) => {
    for (const { isIntersecting, target } of entries) {
      if (isIntersecting) live.add(jobs.get(target));
      else live.delete(jobs.get(target));
    }
    ask();
  },
  { rootMargin: "20% 0px" },
);
blocks.forEach((b) => io.observe(b));
addEventListener("scroll", ask, { passive: true });
addEventListener("resize", ask, { passive: true });
jobs.forEach((job) => job());
