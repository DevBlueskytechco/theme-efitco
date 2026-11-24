// <sale-countdown> ADR 0009 §3. Đếm theo data-end (R8), 1 interval cho mọi thẻ đang hiện, dừng khi tab ẩn.
const live = new Set();
let timer;
const tickAll = () => {
  for (const el of live) el.tick() || (live.delete(el), io.unobserve(el));
  live.size || clearInterval(timer);
};
const run = () => {
  clearInterval(timer);
  if (document.hidden || !live.size) return;
  tickAll();
  timer = setInterval(tickAll, 1e3);
};
const io = new IntersectionObserver((entries) => {
  for (const e of entries) live[e.isIntersecting ? "add" : "delete"](e.target);
  run();
});
document.addEventListener("visibilitychange", run);

class SaleCountdown extends HTMLElement {
  connectedCallback() {
    this.box = this.querySelector("[data-end]");
    if (this.box?.dataset.end > 0 && this.tick()) io.observe(this);
  }
  disconnectedCallback() {
    io.unobserve(this);
    live.delete(this) && run();
  }
  tick() {
    const box = this.box;
    const d = box.dataset;
    const s = (d.end - Date.now() / 1e3) | 0;
    if (d.state == "ended") return 0;
    if (s < 1) {
      // K3: chữ ended thay nhãn + ô, nhận id câu ẩn (tên role timer).
      const ended = Object.assign(document.createElement("span"), { className: "sale-countdown__ended", textContent: d.labelEnded || "" });
      const id = box.getAttribute("aria-labelledby");
      if (id) ended.id = id;
      box.replaceChildren(ended);
      return (d.state = "ended"), 0;
    }
    const n = { days: s / 86400, hours: (s % 86400) / 3600, minutes: (s % 3600) / 60, seconds: s % 60 };
    for (const cell of box.querySelectorAll("[data-countdown-unit]")) {
      const unit = cell.dataset.countdownUnit;
      const value = cell.querySelector("[data-countdown-value]");
      if (value) value.textContent = String(n[unit] | 0).padStart(2, "0");
      if (unit == "days") cell.hidden = s < 86400;
    }
    d.state = s < 3600 ? "ending" : "running";
    return 1;
  }
}
customElements.get("sale-countdown") || customElements.define("sale-countdown", SaleCountdown);
