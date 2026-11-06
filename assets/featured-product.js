// <featured-product> ES1-T158. No storage, R8.
const T = "a[data-featured-media-id]";
class F extends HTMLElement {
$(s) {
return this.querySelector(s);
}
connectedCallback() {
this.box = this.$("[data-end]");
for (const t of ["click", "theme:variant:change"]) this.addEventListener(t, this);
document.addEventListener("visibilitychange", this);
this.$(T)?.setAttribute("aria-current", "true");
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
}
handleEvent(e) {
if (e.type[0] == "v") return this.run();
if (e.type[0] == "t") return this.variant(e.detail);
const a = e.target.closest(T);
if (a) e.preventDefault(), this.show(a.dataset.featuredMediaId);
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
show(id) {
const l = this.$("ul");
const li = this.$(`li[data-featured-media-id="${id}"]`);
if (!li) return;
l.scrollTo({ left: li.offsetLeft - l.offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
for (const a of this.querySelectorAll(T)) a.ariaCurrent = a.dataset.featuredMediaId == id ? "true" : null;
}
// 2+ blocks: ES1-T169 D4.
variant(e) {
this.show(e.featuredMediaId);
if (document.querySelectorAll("featured-product").length < 2) return;
const v = JSON.parse(this.$("script").textContent).variants.find((x) => x.id == e.variantId);
const d = this.$("product-form").dataset;
const b = this.$('[name="add"]');
this.$(".featured-product__price").innerHTML = v.price_html;
b.disabled = !v.available;
b.querySelector("span").textContent = v.available ? d.labelAdd : d.labelSoldOut;
}
}
customElements.get("featured-product") || customElements.define("featured-product", F);
