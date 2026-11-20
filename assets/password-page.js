// ES1-T443 (TE-21 AC11): eye toggle, busy submit, no resend.
const sel = "[data-password-toggle]";
const $$ = (s) => document.querySelectorAll(s);
const reveal = () => $$(sel).forEach((b) => (b.hidden = false));
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
  if (b.hasAttribute("aria-busy")) return e.preventDefault();
  b.setAttribute("aria-busy", "true");
});
addEventListener("pageshow", (e) => e.persisted && $$("[aria-busy]").forEach((b) => b.removeAttribute("aria-busy")));
