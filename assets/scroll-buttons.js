customElements.get("scroll-buttons") || customElements.define("scroll-buttons", class extends HTMLElement {
connectedCallback() {
const [t, p, n] = ["track", "prev", "next"].map(h => this.querySelector(`[data-scroll-${h}]`))
const s = () => {
const a = document.activeElement, x = t.scrollLeft;
[p.hidden, n.hidden] = [x < 1, x > t.scrollWidth - t.clientWidth - 1]
if (a.hidden) (n.hidden ? p : n).focus()
};
const g = d => () => t.scrollBy({
left: d * (t.children[1].offsetLeft - t.children[0].offsetLeft),
behavior: matchMedia("(prefers-reduced-motion)").matches ? "auto" : "smooth"
});
p.onclick = g(-1)
n.onclick = g(1)
t.onscroll = s;
(this.r = new ResizeObserver(s)).observe(t)
s()
this.dataset.enhanced = ""
}
disconnectedCallback() {
this.r.disconnect()
}
});
