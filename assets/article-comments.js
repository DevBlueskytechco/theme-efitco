// TE-20 AC12 (ES1-T473): after the comment POST reload, focus the error summary
// or the status box (both tabindex=-1); "Post Comment" takes aria-disabled while
// posting (aria-busy spinner after the loading delay, ES1-T555) and a second
// submit is ignored. Without JS the form posts as usual.
// Delegated on document: the block can re-render in the editor.
const FORM = '[data-testid="comment-form"]';
const SUBMIT = '[data-testid="comment-submit"]';
let idle;

const box = document.querySelector('#CommentFormErrors, [data-testid="comment-status"]');
if (box && !window.Shopify?.designMode && (!document.activeElement || document.activeElement === document.body)) {
  box.focus({ preventScroll: true });
}

document.addEventListener("submit", (e) => {
  const form = e.target;
  const button = form.matches?.(FORM) && form.querySelector(SUBMIT);
  if (!button) return;
  if (button.ariaDisabled === "true") return e.preventDefault();
  // after other listeners (captcha) ran: only lock when the post really goes
  setTimeout(() => {
    if (e.defaultPrevented) return;
    button.ariaDisabled = "true";
    idle = window.busyLater?.(button);
  });
});

// back/forward cache: the page comes back with the button still locked
addEventListener("pageshow", (e) => {
  if (!e.persisted) return;
  idle = idle?.();
  for (const b of document.querySelectorAll(`${FORM} ${SUBMIT}`)) b.ariaDisabled = b.ariaBusy = null;
});
