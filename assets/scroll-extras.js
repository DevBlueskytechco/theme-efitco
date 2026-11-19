// Phần thêm cho hàng cuộn ngang scroll-buttons (ES1-T250), motion.js nạp khi trang có hàng này.
// scroll-buttons.js (trần 1 536 B, ES1-T335) gắn data-static khi hàng vừa khung. File này thêm:
// thanh tiến trình [data-scroll-progress] (--scroll-size, --scroll-pos), kéo bằng chuột.
const rows = new WeakSet();

function progress(root, t) {
  const bar = root.querySelector("[data-scroll-progress]");
  const sync = () => {
    const m = t.scrollWidth - t.clientWidth;
    bar?.style.setProperty("--scroll-size", m > 1 ? t.clientWidth / t.scrollWidth : 1);
    bar?.style.setProperty("--scroll-pos", m > 1 ? Math.abs(t.scrollLeft) / m : 0);
  };
  t.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
  new ResizeObserver(sync).observe(t);
  sync();
}

function enhance(root) {
  const t = root.querySelector("[data-scroll-track]");
  if (!t || rows.has(root)) return;
  rows.add(root);
  progress(root, t);
  if (matchMedia("(pointer: fine)").matches) drag(t);
}

// Đợi scroll-buttons.js nâng cấp (data-enhanced) rồi mới thêm, để thứ tự giống nhau trên mọi hàng
for (const root of document.querySelectorAll("scroll-buttons")) {
  if (root.hasAttribute("data-enhanced")) enhance(root);
  else new MutationObserver((_, o) => root.hasAttribute("data-enhanced") && (o.disconnect(), enhance(root))).observe(root, { attributes: true, attributeFilter: ["data-enhanced"] });
}

// Kéo quá 6px thì chặn click kế tiếp để không mở link, không bật video.
// Snap tắt trong lúc kéo ([data-dragging] trong base.css), thả ra trượt về card gần nhất.
function drag(t) {
  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const step = () => {
    const [a, b] = t.children;
    return b ? b.offsetLeft - a.offsetLeft : t.clientWidth;
  };
  let x0, s0, moved, id;
  t.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || t.scrollWidth <= t.clientWidth) return;
    if (e.target.closest("input, select, textarea")) return;
    [x0, s0, moved, id] = [e.clientX, t.scrollLeft, false, e.pointerId];
  });
  t.addEventListener("pointermove", (e) => {
    if (e.pointerId !== id || x0 === undefined) return;
    const dx = e.clientX - x0;
    if (!moved && Math.abs(dx) < 6) return;
    if (!moved) {
      moved = true;
      t.setPointerCapture(id);
      t.dataset.dragging = "";
    }
    t.scrollLeft = s0 - dx;
  });
  const end = (e) => {
    if (e.pointerId !== id || x0 === undefined) return;
    x0 = undefined;
    if (!moved) return;
    t.addEventListener("click", (c) => (c.preventDefault(), c.stopPropagation()), { capture: true, once: true });
    const done = () => delete t.dataset.dragging;
    t.addEventListener("scrollend", done, { once: true });
    setTimeout(done, 700);
    const k = step();
    t.scrollTo({ left: Math.round(t.scrollLeft / k) * k, behavior: calm() ? "auto" : "smooth" });
  };
  t.addEventListener("pointerup", end);
  t.addEventListener("pointercancel", end);
  t.addEventListener("dragstart", (e) => e.preventDefault());
}
