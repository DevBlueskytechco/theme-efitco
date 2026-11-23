// <featured-product> ES1-T158, ES1-T350. Countdown: sale-countdown.js (ADR 0009). Gallery: product-media.js (ADR 0012).
// D4: 2+ band trùng tên partial, swap() thay bộ chọn, giá, JSON biến thể, nút, khung countdown của band này.
const PARTS = "featured-product :is(fieldset,[data-variant-price],[data-selected-variant],[name=add],[data-sale-countdown-slot])";

class F extends HTMLElement {
  connectedCallback() {
    this.dataset.enhanced = "";
  }
  async swap(url, signal) {
    const r = await fetch(url, { signal });
    if (!r.ok) throw r.status;
    const n = new DOMParser().parseFromString(await r.text(), "text/html").querySelectorAll(PARTS);
    const a = document.activeElement, f = this.contains(a) && a.value;
    this.querySelectorAll(PARTS).forEach((e, i) => n[i] && e.replaceWith(n[i]));
    f && this.querySelector(`[value="${f}"]`)?.focus();
  }
}
customElements.get("featured-product") || customElements.define("featured-product", F);
