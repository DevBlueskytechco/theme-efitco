// Contact form enhancement (ES1-T474, TE-21 AC4, AC5; docs/ui-spec/page.md §6 S2–S4).
// Hooks of blocks/contact-form.liquid (ES1-T383): form[data-contact-form] data-label-sending,
// [data-contact-live], [data-contact-summary] (data-label-1..3, [data-contact-summary-title],
// li[data-contact-summary-for]), sentence #<field id>Error under each required field.
// Without it the browser checks required fields and Shopify answers after the reload.
// Delegated on document: the block re-renders in the theme editor, nothing to clean up.
const FORM = "form[data-contact-form]";
const SUMMARY = "[data-contact-summary]";
const ITEM = "[data-contact-summary-for]";
const required = (form) => form.querySelectorAll("input[required], textarea[required]");
// Spaces pass `required` but Shopify wants text
const bad = (el) => !el.value.trim() || !el.validity.valid;

// Error sentence, aria-invalid, aria-describedby (other ids stay, e.g. #ContactBodyHint first)
const mark = (el, on) => {
  const id = el.id + "Error";
  const error = el.id && document.getElementById(id);
  if (!error) return;
  error.hidden = !on;
  const ids = (el.getAttribute("aria-describedby") || "").split(" ").filter((x) => x && x != id);
  if (on) ids.push(id), el.setAttribute("aria-invalid", "true");
  else el.removeAttribute("aria-invalid");
  if (ids.length) el.setAttribute("aria-describedby", ids.join(" "));
  else el.removeAttribute("aria-describedby");
};

// "Check {n} field(s)" from the visible items; no item left closes the box
const count = (box) => {
  const n = box.querySelectorAll(ITEM + ":not([hidden])").length;
  const title = box.querySelector("[data-contact-summary-title]");
  const label = box.getAttribute("data-label-" + n);
  if (title && label && title.textContent != label) title.textContent = label;
  box.hidden = !n;
};

// One field (blur, fixed while typing): its sentence, and its item when the summary is open
const check = (el) => {
  const on = bad(el);
  mark(el, on);
  const box = el.form.querySelector(SUMMARY);
  const item = box?.querySelector(`${ITEM}[data-contact-summary-for="${CSS.escape(el.id)}"]`);
  if (item && !box.hidden && item.hidden == on) (item.hidden = !on), count(box);
};

// Submit: every field, the whole summary, focus on it; false when all fields are fine
const report = (form) => {
  let first;
  for (const el of required(form)) {
    const on = bad(el);
    mark(el, on);
    first ||= on && el;
  }
  if (!first) return false;
  const box = form.querySelector(SUMMARY);
  if (box) {
    for (const item of box.querySelectorAll(ITEM)) {
      const el = document.getElementById(item.dataset.contactSummaryFor);
      item.hidden = !(el && bad(el));
    }
    count(box);
  }
  (box && !box.hidden ? box : first).focus();
  return true;
};

// Sending: button aria-disabled at once (label, width kept), spinner (.button[aria-busy='true'])
// only after the loading delay (ES1-T555); fields readonly (still posted, unlike disabled), hidden status line
const idle = new WeakMap();
const busy = (form, on) => {
  const button = form.querySelector('[type="submit"]');
  if (button) button.ariaDisabled = on || null;
  idle.get(form)?.();
  idle.set(form, on ? window.busyLater?.(button) : null);
  for (const el of form.querySelectorAll('input:not([type="hidden"]), textarea')) el.readOnly = on;
  const live = form.querySelector("[data-contact-live]");
  if (live) live.textContent = on ? form.dataset.labelSending || "" : "";
};

// Browser check on submit: no native bubble, our sentences and summary instead (once per attempt)
addEventListener(
  "invalid",
  (e) => {
    const form = e.target.form;
    if (!form?.matches(FORM)) return;
    e.preventDefault();
    if (e.target == form.querySelector(":invalid")) report(form);
  },
  true
);

addEventListener("submit", (e) => {
  const form = e.target;
  if (!form.matches?.(FORM)) return;
  if (form.querySelector('[type="submit"][aria-disabled="true"]')) {
    // Second click or Enter while sending: one message; requestSubmit() without submitter goes on
    if (e.submitter) e.preventDefault();
    return;
  }
  // novalidate on the form: Shopify checks, as without JavaScript
  if (!form.noValidate && report(form)) return e.preventDefault();
  busy(form, true);
});

// Press on submit: an error sentence shown on blur moves the button, the click is lost; check after
let pressed, left;
addEventListener("pointerdown", (e) => (pressed = e.target.closest?.(`${FORM} [type="submit"]`)), true);
for (const type of ["pointerup", "pointercancel"]) {
  addEventListener(
    type,
    () => {
      const el = left;
      pressed = left = null;
      if (el) setTimeout(() => el != document.activeElement && !el.readOnly && check(el));
    },
    true
  );
}

addEventListener("focusout", (e) => {
  const el = e.target;
  if (!el.form?.matches(FORM) || !el.required || el.readOnly) return;
  if (pressed?.form == el.form) left = el;
  else check(el);
});

// Fixed while typing: the error goes at once; a new error waits for blur
addEventListener("input", (e) => {
  const el = e.target;
  if (el.form?.matches(FORM) && el.getAttribute("aria-invalid") == "true" && !bad(el)) check(el);
});

// Back from the next page (bfcache): the form is usable again
addEventListener("pageshow", (e) => {
  if (e.persisted) for (const form of document.querySelectorAll(FORM)) busy(form, false);
});

// Loaded on the first interaction: a field already left with a wrong value shows its error now
for (const form of document.querySelectorAll(FORM)) {
  for (const el of required(form)) if (el != document.activeElement && el.value && bad(el)) check(el);
}

// After the reload of a submit (loaded at once then): focus the success box or the error summary,
// never over a focus the visitor already moved; not in the theme editor
const target = document.querySelector(`${FORM} .contact-form__status, ${FORM} ${SUMMARY}:not([hidden])`);
const idle = !document.activeElement || document.activeElement == document.body;
if (target && idle && !window.Shopify?.designMode) target.focus();
