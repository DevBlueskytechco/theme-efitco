// TE-20 AC12 (ES1-T473): after the comment POST reload, focus the error summary
// or the status box (both tabindex=-1); "Post Comment" takes aria-busy while
// posting and a second submit is ignored. Without JS the form posts as usual.
// Delegated on document: the block can re-render in the editor.
const FORM = '[data-testid="comment-form"]';
const SUBMIT = '[data-testid="comment-submit"]';

const box = document.querySelector('#CommentFormErrors, [data-testid="comment-status"]');
if (box && !window.Shopify?.designMode && (!document.activeElement || document.activeElement === document.body)) {
  box.focus({ preventScroll: true });
}

document.addEventListener("submit", (e) => {
  const form = e.target;
  const button = form.matches?.(FORM) && form.querySelector(SUBMIT);
  if (!button) return;
  if (button.getAttribute("aria-busy") === "true") return e.preventDefault();
  // after other listeners (captcha) ran: only mark busy when the post really goes
  setTimeout(() => e.defaultPrevented || button.setAttribute("aria-busy", "true"));
});

// back/forward cache: the page comes back with the button still busy
addEventListener("pageshow", (e) => {
  if (e.persisted) for (const b of document.querySelectorAll(`${FORM} ${SUBMIT}[aria-busy]`)) b.removeAttribute("aria-busy");
});
