// <header-menu>: mega, dropdown từ 80rem (TE-22, navigation.md §6). Drawer: header-drawer.js, lười
const T = (id) => `[data-testid="${id}"]`;
const sum = (d) => d.querySelector(":scope > summary");
const sync = (d) => sum(d)?.setAttribute("aria-expanded", d.open);
const close = (d) => {
  if (d.contains(document.activeElement)) sum(d)?.focus();
  d.open = false;
};
let drawer;

class HeaderMenu extends HTMLElement {
  connectedCallback() {
    const h = (this.h = this.closest(T("header")));
    const nav = h?.querySelector(T("header-menu"));
    const { signal } = (this.ac = new AbortController());
    const on = (el, t, fn, o) => el?.addEventListener(t, fn, { signal, ...o });
    const load = () => (drawer ||= import(new URL("header-drawer.js", import.meta.url)).catch(() => (drawer = null)));
    for (const t of ["pointerenter", "focusin", "touchstart"]) on(h?.querySelector(T("header-drawer-toggle")), t, load, { passive: true });
    // Cả drawer, trước khi nạp header-drawer.js
    h?.querySelectorAll("details").forEach(sync);
    if (!nav) return;

    this.menus = [...nav.querySelectorAll("details")];
    // Scrim nhận chuột: bấm đóng, rê lên = rời header
    h.toggleAttribute("data-mega-enhanced", true);
    on(nav, "toggle", (e) => this.toggled(e.target), { capture: true });
    on(nav, "focusout", (e) => this.focusOut(e));
    on(document, "keydown", (e) => e.key == "Escape" && (clearTimeout(this.t), this.opened().forEach(close)));
    on(h, "pointerover", ({ target, pointerType }) => {
      const item = target.closest(T("header-menu-item"));
      if (target.closest(T("header-scrim"))) this.hover(pointerType, null);
      else if (item && nav.contains(item)) this.hover(pointerType, item.querySelector("details"));
    });
    on(h, "pointerleave", (e) => this.hover(e.pointerType, null));
  }

  disconnectedCallback() {
    clearTimeout(this.t);
    this.ac?.abort();
  }

  opened(x) {
    return this.menus.filter((m) => m.open && m != x);
  }

  // Gỡ data-mega-instant khi đóng hết; gỡ sớm: animation chạy lại
  toggled(d) {
    sync(d);
    const rest = this.opened(d);
    if (d.open) rest.forEach(close);
    else if (!rest.length) this.h.removeAttribute("data-mega-instant");
  }

  // Chỉ chuột (cảm ứng: pointerover trước click). d null = rời, trừ khi đang Tab
  hover(type, d) {
    if (type != "mouse") return;
    clearTimeout(this.t);
    this.t = setTimeout(() => {
      if (!d) return this.opened().filter((m) => !m.querySelector(":focus-visible")).forEach(close);
      if (!d.open && this.opened().length) this.h.toggleAttribute("data-mega-instant", true);
      d.open = true;
    }, 150);
  }

  // Tab ra ngoài: đóng. r null: bấm chỗ không focus, Safari
  focusOut({ target, relatedTarget: r }) {
    const d = target.closest("details");
    if (d?.open && !d.contains(r) && document.hasFocus() && (r || !d.matches(":hover"))) d.open = false;
  }
}

if (!customElements.get("header-menu")) customElements.define("header-menu", HeaderMenu);
