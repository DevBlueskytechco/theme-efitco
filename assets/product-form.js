// TE-4 AC5 AC6 AC8 (ES1-T67, ES1-T85). Submit → cart/add.js; page type or no <cart-drawer> → cart URL.
// 4xx → API description in role=alert; network/5xx without JSON → native submit.
// shopify:cart:lines-update dispatched before the POST; promise → /cart.js, rejects on error.
const ADD = 'button[name="add"]';
const OFFSET = "properties[__shopify_offset]";
const HEADERS = { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" };
const events = import("https://cdn.shopify.com/storefront/standard-events.js").catch(() => null);

class ProductForm extends HTMLElement {
  connectedCallback() {
    const form = (this.form = document.getElementById(`product-form-${this.dataset.productId}`));
    if (!form) return;
    this.status = this.querySelector('[role="status"]');
    this.error = this.querySelector('[role="alert"]');
    this.gift = form.querySelector('input[name="properties[__shopify_send_gift_card_to_customer]"]');
    const f = (this.fields = this.gift?.closest(".product-gift-card")?.querySelector("fieldset"));
    if (f && !f.querySelector(`[name="${OFFSET}"]`)) {
      const input = Object.assign(document.createElement("input"), { type: "hidden", name: OFFSET });
      input.value = String(new Date().getTimezoneOffset());
      f.append(input);
    }
    this.syncGift();
    this.listen("addEventListener");
  }

  disconnectedCallback() {
    this.listen("removeEventListener");
    this.controller?.abort();
  }

  listen(m) {
    for (const t of ["submit", "change"]) this.form?.[m](t, this);
    window[m]("pageshow", this);
  }

  handleEvent(e) {
    if (e.type === "submit") return this.submit(e);
    // bfcache back from cart: unlock.
    if (e.persisted && this.busy) this.lock(false);
    this.syncGift();
  }

  // Unchecked: disabled fieldset, recipient + offset not sent.
  syncGift() {
    if (this.fields) this.fields.disabled = !this.gift.checked;
  }

  lock(on) {
    this.busy = on;
    if (on) this.locked = [...document.querySelectorAll(ADD)].filter((b) => b.form === this.form).map((b) => [b, b.disabled]);
    for (const [b, was] of this.locked || []) {
      b.disabled = on || was;
      if (on) b.setAttribute("aria-busy", "true");
      else b.removeAttribute("aria-busy");
    }
  }

  say(el, text = "") {
    if (el) el.textContent = text;
  }

  // CartLinesUpdateEvent; library missing, slower than 500 ms or other shape → no event, add still works.
  async emit(body) {
    const E = (await Promise.race([events, new Promise((r) => setTimeout(r, 500))]))?.CartLinesUpdateEvent;
    try {
      const d = E.createPromise();
      d.promise.catch(() => {}); // no listener: no unhandled rejection
      const lines = [{ merchandiseId: `gid://shopify/ProductVariant/${body.get("id")}`, quantity: Number(body.get("quantity")) || 1 }];
      this.dispatchEvent(new E({ action: "add", context: "product", lines, promise: d.promise }));
      return d;
    } catch {
      // Skip the event.
    }
  }

  async submit(e) {
    e.preventDefault();
    if (this.busy) return;
    const { submitter } = e;
    const body = new FormData(this.form);
    if (!body.get("selling_plan")) body.delete("selling_plan");
    const controller = (this.controller = new AbortController());
    const { signal } = controller;
    this.say(this.error);
    this.say(this.status);
    this.lock(true);
    let leaving = false;
    let ev;
    try {
      ev = await this.emit(body);
      const res = await fetch(`${this.dataset.cartAddUrl}.js`, { method: "POST", body, headers: HEADERS, signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const text = [data.description, data.message].find((t) => typeof t == "string");
        if (!text) throw Error(res.status);
        ev?.reject(Error(text));
        return this.say(this.error, text);
      }
      this.dispatchEvent(new CustomEvent("theme:cart:updated", { bubbles: true, detail: { source: "product-form", item: data } }));
      // Item is in the cart: /cart.js failure only rejects the event, never resubmits.
      if (ev) {
        const cart = fetch(`${this.dataset.cartUrl}.js`, { headers: HEADERS, signal }).then((r) => (r.ok ? r.json() : Promise.reject(Error(r.status))));
        await cart.then((c) => ev.resolve(c), (x) => ev.reject(x));
      }
      if (this.dataset.labelAdded) this.say(this.status, this.dataset.labelAdded);
      leaving = this.dataset.cartType === "page" || !document.querySelector("cart-drawer");
      if (leaving) window.location.assign(this.dataset.cartUrl);
    } catch (err) {
      ev?.reject(err);
      if (err?.name === "AbortError") return;
      leaving = true;
      HTMLFormElement.prototype.submit.call(this.form);
    } finally {
      if (!leaving && this.controller === controller) {
        this.lock(false);
        if (document.activeElement === document.body) submitter?.focus();
      }
    }
  }
}

// Below 48rem, add button above viewport (rootMargin: jumps fire).
class ProductStickyBar extends HTMLElement {
  connectedCallback() {
    this.mq = matchMedia("(max-width: 47.99rem)");
    this.mq.addEventListener("change", this);
    this.handleEvent();
  }

  disconnectedCallback() {
    this.mq?.removeEventListener("change", this);
    this.stop();
  }

  handleEvent() {
    this.stop();
    this.form = document.getElementById(this.dataset.formId);
    if (!this.mq.matches || !this.form) return;
    this.io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.target === this.target) this.show(!e.isIntersecting && e.boundingClientRect.bottom <= 0);
    }, { rootMargin: "0px 0px 99999px" });
    // Partial apply may swap the button.
    this.mo = new MutationObserver(() => this.watch());
    this.mo.observe(this.form, { childList: true, subtree: true });
    this.watch();
  }

  watch() {
    const t = this.form.querySelector(ADD);
    if (t === this.target) return;
    if (this.target) this.io.unobserve(this.target);
    if ((this.target = t)) this.io.observe(t);
  }

  stop() {
    this.io?.disconnect();
    this.mo?.disconnect();
    this.target = null;
    this.show(false);
  }

  show(on) {
    this.hidden = !on;
    document.documentElement.toggleAttribute("data-sticky-bar-visible", on);
  }
}

for (const [n, c] of [["product-form", ProductForm], ["product-sticky-bar", ProductStickyBar]]) {
  if (!customElements.get(n)) customElements.define(n, c);
}
