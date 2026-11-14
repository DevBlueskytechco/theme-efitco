// <modal-dialog>: ADR 0007 #5
const d = document;

class ModalDialog extends HTMLElement {
  connectedCallback() {
    const g = (this.g = this.querySelector("dialog"));
    const o = { signal: (this.ac = new AbortController()).signal, passive: true };
    const on = (t, f, el = g) => el.addEventListener(t, f, o);
    if (!g) return;
    g.setAttribute("scroll-lock", "");
    on("close", () => this.emit("close"));
    on("click", (e) => {
      const r = g.getBoundingClientRect();
      const { clientX: x, clientY: y, target: t } = e;
      const out = t == g && (x < r.left || x > r.right || y < r.top || y > r.bottom);
      if (out || t.closest("[data-modal-close],.close-button")) g.close();
    });
    // Sheet: vuốt xuống
    on("touchstart", (e) => {
      const b = this.dataset.sheetBelow;
      this.y = NaN;
      if (!b || matchMedia(`(min-width:${b})`).matches) return;
      for (let n = e.target; n != g; n = n.parentElement) if (n.scrollTop > 0) return;
      ({ clientX: this.x, clientY: this.y } = e.touches[0]);
    });
    on("touchend", (e) => {
      const { clientX: x, clientY: y } = e.changedTouches[0];
      if (y - this.y > 80 && Math.abs(x - this.x) < y - this.y) g.close();
    });
    for (const [t, f] of [["select", "open"], ["deselect", "close"]])
      on("shopify:block:" + t, (e) => this.contains(e.target) && this[f](), d);
  }

  disconnectedCallback() {
    this.ac.abort();
  }

  open(opener) {
    const g = this.g;
    if (!g || g.open) return;
    (opener || d.getElementById(this.dataset.returnFocus))?.focus();
    d.querySelector("modal-dialog > dialog[open]")?.close();
    g.showModal();
    const h = !g.querySelector("[autofocus]") && d.getElementById(g.getAttribute("aria-labelledby"));
    if (h) (h.tabIndex = -1), h.focus();
    this.emit("open");
  }

  close() {
    this.g?.close();
  }

  emit(t) {
    this.dispatchEvent(new Event("modal:" + t, { bubbles: true }));
  }
}

if (!customElements.get("modal-dialog")) customElements.define("modal-dialog", ModalDialog);
