// <localization-picker>: TE-1 AC10, localization.md §5; nạp lười (ADR 0010). Không JS: <details> + nút submit.
// Bàn phím, ô tìm, đang đổi, lỗi: localization-list.js (data-list-src), import khi nâng cấp.
const OPT = 'button[name$="_code"]';
const CUR = '[aria-current="true"]';
const A = (el, n) => el?.getAttribute(n);
const near = (el) => el?.scrollIntoView({ block: "nearest" });

class LocalizationPicker extends HTMLElement {
  connectedCallback() {
    const det = (this.det = this.querySelector("details"));
    const form = (this.form = det?.closest("form"));
    if (!form) return;
    const { signal } = (this.ac = new AbortController());
    const on = (el, t, f) => el.addEventListener(t, f, { signal });
    const md = (this.md = this.querySelector("modal-dialog"));
    const g = (this.g = md?.querySelector("dialog"));
    const sum = (this.sum = det.firstElementChild);
    const mq = matchMedia("(min-width: 48rem)");
    this.tabs = [...this.querySelectorAll('[role="tab"]')];
    on(det, "toggle", () => this.toggled());
    on(form, "click", (e) => this.click(e));
    if (this.dataset.listSrc) import(this.dataset.listSrc).then((m) => signal.aborted || m.default(this, on), () => {});
    if (!g) return this.tab(1);
    // Footer: popover ≥ 48rem, sheet < 48rem; aria-expanded + data-layer cho page-layers
    sum.dataset.layer = "localization";
    on(sum, "click", (e) => md.open && !mq.matches && (e.preventDefault(), this.sheet()));
    on(md, "modal:close", () => Promise.allSettled(g.getAnimations().map((a) => a.finished)).then(() => g.open || ((det.open = false), this.tab())));
    on(mq, "change", () => this.close());
    on(form, "focusout", (e) => g.open || det.contains(e.relatedTarget || det) || (det.open = false));
    // Đã mở trước khi nâng cấp
    det.open && md.open && !mq.matches ? this.sheet() : this.toggled();
  }

  disconnectedCallback() {
    this.ac?.abort();
  }

  sheet() {
    this.det.open = true;
    this.tab(1);
    this.md.open(this.sum);
  }

  close() {
    if (this.g?.open) return this.g.close();
    if (this.det.contains(document.activeElement)) this.sum.focus();
    this.det.open = false;
  }

  // Mở: xoá ô tìm, cuộn tới mục hiện tại; popover focus ô tìm, không thì mục hiện tại
  toggled() {
    const { det, g } = this;
    g && this.sum.setAttribute("aria-expanded", det.open);
    if (!det.open) return;
    this.reset?.();
    this.querySelectorAll(CUR).forEach(near);
    if (g && !g.open) this.querySelector(`[data-localization-search]:not([hidden]) input, ${OPT}${CUR}`)?.focus();
  }

  // Tab chỉ ở sheet và cấp 2 drawer
  tab(on) {
    if (!this.tabs[0]) return;
    this.toggleAttribute("data-tabs", !!on);
    for (const t of this.tabs) {
      const p = document.getElementById(A(t, "aria-controls"));
      p.hidden = on && A(t, "aria-selected") != "true";
      for (const [n, v] of [["role", "tabpanel"], ["aria-labelledby", t.id]]) on ? p.setAttribute(n, v) : p.removeAttribute(n);
    }
  }

  select(tab) {
    for (const t of this.tabs) t.setAttribute("aria-selected", t == tab), (t.tabIndex = t == tab ? 0 : -1);
    this.tab(1);
    tab.focus();
    near(document.getElementById(A(tab, "aria-controls")).querySelector(CUR));
  }

  // Mục hiện tại: không gửi, đóng bảng; mục bị khoá khi đang đổi: không gửi
  click(e) {
    const b = e.target.closest(`[role="tab"], ${OPT}`);
    if (A(b, "role")) return this.select(b);
    if (A(b, "aria-disabled")) e.preventDefault();
    else if (A(b, "aria-current")) e.preventDefault(), this.close();
  }
}

if (!customElements.get("localization-picker")) customElements.define("localization-picker", LocalizationPicker);
