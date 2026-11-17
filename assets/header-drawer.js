// <header-drawer>: drawer mobile (data-testid="header-drawer"). Tách nguyên từ header-menu.js (ES1-T329, ADR 0010),
// nạp lười từ header-menu.js khi chạm nút menu lần đầu. Trượt cấp 2 + Back, <modal-dialog>: TE-1-R2-BE1 (ES1-T323).
// Markup <details scroll-lock> chạy khi không JS; file này thêm Esc, aria-expanded, focus trap, đóng khi lên 80rem.
const DESKTOP_QUERY = "(min-width: 80rem)";

const sync = (d) => d.querySelector(":scope > summary")?.setAttribute("aria-expanded", d.open);

class HeaderDrawer extends HTMLElement {
  connectedCallback() {
    const header = this.closest('[data-testid="header"]');
    this.toggle = header?.querySelector('[data-testid="header-drawer-toggle"]');
    this.panel = header?.querySelector('[data-testid="header-drawer"]');
    this.close = header?.querySelector('[data-testid="header-drawer-close"]');
    this.root = this.toggle?.closest("details");
    if (!this.root || !this.panel || !this.close) return;

    const { signal } = (this.ac = new AbortController());
    this.root.querySelectorAll("details").forEach(sync);
    sync(this.root);
    // Nạp lười: người dùng có thể đã mở drawer trước khi module tải xong.
    if (this.root.open && !this.panel.contains(document.activeElement)) this.close.focus();

    // Gồm cả accordion lồng; toggle không bubble, bắt ở pha capture.
    this.root.addEventListener("toggle", (e) => this.toggled(e.target), { capture: true, signal });
    this.close.addEventListener("click", () => this.dismiss(), { signal });
    document.addEventListener("keydown", (e) => this.keydown(e), { signal });
    matchMedia(DESKTOP_QUERY).addEventListener("change", (e) => e.matches && this.dismiss(), { signal });
  }

  disconnectedCallback() {
    this.ac?.abort();
  }

  dismiss() {
    this.root.open = false;
  }

  // Đóng bằng cách nào cũng trả focus về nút menu.
  toggled(d) {
    sync(d);
    if (d === this.root) (d.open ? this.close : this.toggle).focus();
  }

  keydown(e) {
    if (!this.root.open) return;
    if (e.key === "Escape") this.dismiss();
    else if (e.key === "Tab") this.trap(e);
  }

  trap(e) {
    const list = this.focusable();
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (active === (e.shiftKey ? first : last) || !this.panel.contains(active)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  }

  // Bỏ phần tử trong accordion đang đóng. Summary của accordion luôn hiện dù details của nó đóng,
  // nên xét từ phần tử ngoài details đó.
  focusable() {
    return [...this.panel.querySelectorAll("a[href], button, summary")].filter((el) => {
      const scope = el.matches("summary") ? el.parentElement.parentElement : el;
      return !scope.closest("details:not([open])");
    });
  }
}

if (!customElements.get("header-drawer")) customElements.define("header-drawer", HeaderDrawer);
