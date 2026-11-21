// <featured-product> ES1-T158, ES1-T350. No storage, R8. Gallery: product-media.js (ADR 0012).
class F extends HTMLElement {
$(s) {
return this.querySelector(s);
}
connectedCallback() {
this.box = this.$("[data-end]");
document.addEventListener("visibilitychange", this);
if (this.box && this.tick()) {
new IntersectionObserver((e) => {
this.seen = e.at(-1).isIntersecting;
this.run();
}).observe(this.box);
}
this.dataset.enhanced = "";
}
disconnectedCallback() {
clearInterval(this.t);
document.removeEventListener("visibilitychange", this);
}
handleEvent(e) {
if (e.type[0] == "v") return this.run();
}
run() {
clearInterval(this.t);
if (this.box && this.seen && !document.hidden && this.tick()) this.t = setInterval(() => this.tick(), 1e3);
}
tick() {
const s = (this.box.dataset.end - Date.now() / 1e3) | 0;
if (s < 1) {
this.box.hidden = true;
this.box = null;
return clearInterval(this.t);
}
const n = [s / 86400, (s % 86400) / 3600, (s % 3600) / 60, s % 60];
this.box.querySelectorAll("[data-countdown-value]").forEach((c, i) => {
c.textContent = String(n[i] | 0).padStart(2, "0");
if (!i) c.parentNode.hidden = n[0] < 1;
});
return 1;
}
// D4: 2+ bands
async swap(url, signal) {
const r = await fetch(url, { signal });
if (!r.ok) throw r.status;
const q = (e) => e.querySelectorAll("featured-product :is(fieldset,[data-variant-price],[data-selected-variant],[name=add])");
const n = q(new DOMParser().parseFromString(await r.text(), "text/html"));
const a = document.activeElement, f = this.contains(a) && a.value;
q(this).forEach((e, i) => e.replaceWith(n[i]));
f && this.$(`[value="${f}"]`)?.focus();
}
}
customElements.get("featured-product") || customElements.define("featured-product", F);
