// <header-drawer>: TE-1 AC2, AC10, navigation.md §6. Lười từ header-menu.js (ADR 0010).
// Mở, Esc, scrim, focus: <modal-dialog> (ADR 0007). Không JS: <details>, cấp 2 accordion.
const BACK = '[data-testid="header-drawer-back"]';
const FOCUSABLE = "a[href], button, summary, input:not([type=hidden])";
const sync = (d) => d.querySelector(":scope > summary")?.setAttribute("aria-expanded", d.open);

class HeaderDrawer extends HTMLElement {
  connectedCallback() {
    const header = (this.header = this.closest('[data-testid="header"]'));
    const toggle = header?.querySelector('[data-testid="header-drawer-toggle"]');
    const root = (this.root = toggle?.closest("details"));
    const md = (this.md = root?.querySelector('modal-dialog[data-layer="menu"]'));
    if (!md) return;

    const { signal } = (this.ac = new AbortController());
    const on = (el, type, fn, opts) => el.addEventListener(type, fn, { signal, ...opts });
    this.locked = [];
    [root, ...root.querySelectorAll("details")].forEach(sync);
    // toggle không bubble
    on(root, "toggle", (e) => this.toggled(e.target), { capture: true });
    on(matchMedia("(min-width: 80rem)"), "change", (e) => e.matches && (this.g?.close(), this.reset()));

    customElements.whenDefined("modal-dialog").then(() => {
      if (signal.aborted) return;
      const g = (this.g = md.querySelector("dialog"));
      header.toggleAttribute("data-drawer-enhanced", true);
      on(toggle, "click", (e) => (e.preventDefault(), this.open()));
      on(md, "modal:close", () => this.closed());
      on(g, "click", (e) => this.back(e.target.closest(BACK)));
      on(g, "keydown", (e) => e.key == "Tab" && this.trap(e));
      on(g, "touchstart", (e) => ({ clientX: this.x, clientY: this.y } = e.touches[0]), { passive: true });
      on(g, "touchend", (e) => this.swipe(e.changedTouches[0]), { passive: true });
      // Đã mở trước khi tải xong
      if (root.open) this.reset(), this.open();
    });
  }

  disconnectedCallback() {
    this.ac?.abort();
    this.free();
    this.header?.removeAttribute("data-drawer-enhanced");
  }

  // details mở trước dialog
  open() {
    this.root.open = true;
    this.md.open(this.root.firstElementChild);
  }

  // Gập sau hiệu ứng đóng
  closed() {
    Promise.allSettled(this.g.getAnimations().map((a) => a.finished)).then(() => this.g.open || this.reset());
  }

  // Mở sau về cấp 1
  reset() {
    this.free();
    this.root.querySelectorAll("details[open]").forEach((d) => (d.open = false));
    this.root.open = false;
  }

  // Cấp 2 mở: anh em mọi tầng tới dialog inert
  toggled(d) {
    sync(d);
    if (d == this.root || !this.g?.open) return;
    if (!d.open) return this.free();
    for (let n = d.querySelector(":scope > [data-drawer-level]"); n && n != this.g; n = n.parentElement) {
      for (const s of n.parentElement.children) if (s != n && !s.inert) this.locked.push(s), (s.inert = true);
    }
    d.querySelector(BACK)?.focus();
  }

  free() {
    this.locked?.forEach((el) => (el.inert = false));
    this.locked = [];
  }

  // Focus trước khi gập
  back(button) {
    const d = button?.closest("details");
    if (!d) return;
    this.free();
    d.firstElementChild.focus();
    d.open = false;
  }

  // Tab vòng trong cấp đang hiện
  trap(e) {
    const list = [...this.g.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest("[inert]") && el.checkVisibility());
    const i = list.indexOf(document.activeElement);
    const to = e.shiftKey ? i < 1 && list.at(-1) : i == list.length - 1 && list[0];
    if (to) e.preventDefault(), to.focus();
  }

  // Vuốt về mép > 80px
  swipe({ clientX: x, clientY: y }) {
    const dx = (x - this.x) * (this.g.matches(":dir(rtl)") ? -1 : 1);
    if (dx < -80 && Math.abs(y - this.y) < -dx) this.g.close();
  }
}

if (!customElements.get("header-drawer")) customElements.define("header-drawer", HeaderDrawer);
