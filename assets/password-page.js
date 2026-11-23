// ES1-T443 eye toggle, no resend; ES1-T555 aria-busy after delay.
const sel = "[data-password-toggle]";
const $$ = (s) => document.querySelectorAll(s);
const reveal = () => $$(sel).forEach((b) => (b.hidden = false));
let idle;
reveal();
addEventListener("shopify:section:load", reveal);
addEventListener("click", ({ target }) => {
  const b = target.closest(sel);
  const input = b && document.getElementById(b.getAttribute("aria-controls"));
  if (!input) return;
  const show = input.type == "password";
  const label = b.dataset[show ? "labelHide" : "labelShow"];
  input.type = show ? "text" : "password";
  b.setAttribute("aria-pressed", show);
  if (label) b.setAttribute("aria-label", label);
});
addEventListener("submit", (e) => {
  const b = e.submitter;
  if (!b || e.defaultPrevented) return;
  if (b.ariaDisabled) return e.preventDefault();
  b.ariaDisabled = "true";
  idle = window.busyLater?.(b);
});
addEventListener("pageshow", (e) => {
  if (e.persisted) idle = idle?.(), $$("[aria-busy],[aria-disabled]").forEach((b) => (b.ariaBusy = b.ariaDisabled = null));
});
