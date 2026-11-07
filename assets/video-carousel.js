// <video-card> ES1-T158 TE-13 AC3, AC4. Video tag on real intersection; plays, iframe only on click.
let active;
class VideoCard extends HTMLElement {
connectedCallback() {
this.poster = this.querySelector("[data-video-poster]");
this.tpl = this.querySelector("[data-video-template]");
this.addEventListener("click", this);
// play, error do not bubble; error fires on source.
this.toggle = this.querySelector("[data-video-toggle]");
for (const t of ["play", "pause", "ended", "error"]) this.addEventListener(t, this, true);
this.io = new IntersectionObserver((e) => {
if (!e.at(-1).isIntersecting) this.stop();
else if (this.dataset.videoKind == "shopify") this.load();
});
this.io.observe(this.poster.parentElement);
}
disconnectedCallback() {
this.io.disconnect();
this.stop();
if (active == this) active = null;
}
handleEvent(e) {
const t = e.target;
if (e.type == "click") this.click(e);
else if (e.type == "play") {
this.take();
this.sync();
} else if (e.type == "pause" || e.type == "ended") this.sync();
else if (t.localName == "video" ? t.error : t.localName == "source" && !t.nextElementSibling) this.fail();
}
load() {
if (this.video || this.hasAttribute("data-video-error")) return;
const el = this.tpl?.content.querySelector("video");
if (el) this.poster.after((this.video = el.cloneNode(true)));
}
take() {
if (active != this) active?.stop();
active = this;
}
// No template or failed video: link runs. Modified click: new tab.
click(e) {
if (this.video && e.target.closest("video, [data-video-toggle]")) {
this.video.paused ? this.video.play().catch(() => {}) : this.video.pause();
return;
}
if (!e.target.closest("[data-video-poster]") || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
if (this.dataset.videoKind == "shopify") {
this.load();
if (!this.video) return;
e.preventDefault();
this.take();
this.poster.hidden = true;
this.toggle?.removeAttribute("hidden");
this.toggle?.focus({ preventScroll: true });
this.video.play().catch(() => {});
return;
}
this.frame ||= this.tpl?.content.querySelector("iframe")?.cloneNode(true);
if (!this.frame) return;
e.preventDefault();
this.take();
this.poster.replaceWith(this.frame);
this.frame.focus();
}
// Iframe back to poster stops it.
stop() {
this.video?.pause();
if (!this.frame?.isConnected) return;
const f = document.activeElement == this.frame;
this.frame.replaceWith(this.poster);
if (f) this.poster.focus({ preventScroll: true });
}
// Only control: icon play, pause over the video.
sync() {
const on = !this.video?.paused;
this.toggleAttribute("data-playing", on);
if (this.toggle) this.toggle.ariaLabel = on ? this.toggle.dataset.labelPause : this.toggle.dataset.labelPlay;
}
// Poster stays, links to the product; frame size is set by CSS.
fail() {
const { video, poster, dataset: d } = this;
if (!video) return;
const f = document.activeElement == video;
video.remove();
this.video = null;
this.toggle?.setAttribute("hidden", "");
d.videoError = "";
poster.hidden = false;
if (d.productUrl) poster.href = d.productUrl;
poster.querySelector("[data-video-label]").textContent = d.labelError;
if (f) poster.focus({ preventScroll: true });
}
}
if (!customElements.get("video-card")) customElements.define("video-card", VideoCard);
