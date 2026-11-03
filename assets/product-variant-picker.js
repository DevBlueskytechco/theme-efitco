/**
 * <product-variant-picker> (TE-4 AC2, AC4, AC12; ES1-T66): blocks/product-form.liquid,
 * snippets/variant-json.liquid. Option change → JSON variant. None: Unavailable, no fetch.
 * Match: hidden id, replaceState ?variant=&selling_plan=, 1 request for REGIONS, aria-busy.
 * theme:variant:change {variantId, featuredMediaId} → product-media.js.
 * Storefront actions names NOT verified on shopify.dev (no network, not in project
 * sources; question ES1-T75). Edit only EVENT_ and ACTION_ constants. Event on document,
 * detail {productId, variantId}; Shopify.actions[ACTION_SHOW](id | {variantId}) → boolean.
 */
import { partials } from "@shopify/partial-rendering";

const REGIONS = ["product-price", "product-buy-buttons", "product-installments", "product-pickup", "product-selling-plans", "product-sticky-bar"];
const EVENT_VIEW = "shopify:product:view";
const EVENT_VARIANT = "shopify:product:variant-change";
const ACTION_SHOW = "showVariant";
const OPTION = 'input[type="radio"][name^="option-"]';
const PLAN = 'input[type="radio"][name="selling_plan"]';
const FIELDSET = "fieldset[data-option-position]";
const pickers = new Set();

// 123, "gid://shopify/ProductVariant/123", {variantId}, {id} → 123
const toId = (v) => Number(String((v && typeof v === "object" ? v.variantId ?? v.id : v) ?? "").match(/\d+$/)?.[0]);
const emit = (target, type, detail) => target.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));

class ProductVariantPicker extends HTMLElement {
  connectedCallback() {
    try {
      this.variants = JSON.parse(this.querySelector("script[data-product-variants]").textContent);
    } catch {
      this.variants = [];
    }
    this.root = this.closest("product-form");
    this.form = document.getElementById(this.dataset.formId);
    this.idInput = this.form?.querySelector('input[type="hidden"][name="id"]');
    for (const t of [this, this.form]) t?.addEventListener("change", this);
    for (const e of ["popstate", "pageshow"]) window.addEventListener(e, this);
    pickers.add(this);
  }

  disconnectedCallback() {
    for (const t of [this, this.form]) t?.removeEventListener("change", this);
    for (const e of ["popstate", "pageshow"]) window.removeEventListener(e, this);
    this.controller?.abort();
    pickers.delete(this);
  }

  handleEvent({ type, target }) {
    if (type === "popstate") {
      const id = toId(new URLSearchParams(window.location.search).get("variant"));
      if (id && id !== this.currentId()) this.show(id);
    } else if (type === "pageshow") {
      // Back/forward may restore radios that no longer match the hidden id.
      const v = this.match(this.selection());
      if (v && v.id !== this.currentId()) this.update(v);
    } else if (target instanceof HTMLInputElement && target.checked) {
      if (target.matches(OPTION) && this.contains(target)) this.select();
      else if (target.matches(PLAN) && target.form === this.form) this.update(this.match(this.selection()));
    }
  }

  currentId() {
    return Number(this.idInput?.value);
  }

  find(id) {
    return this.variants.find((v) => v.id === id);
  }

  selection() {
    return [...this.querySelectorAll(FIELDSET)].map((f) => f.querySelector(`${OPTION}:checked`)?.value);
  }

  match(selected) {
    return this.variants.find((v) => v.options.every((value, i) => value === selected[i]));
  }

  select() {
    const selected = this.selection();
    this.syncAvailable(selected);
    const v = this.match(selected);
    if (v) this.update(v);
    else this.unavailable();
  }

  show(id) {
    const v = this.find(id);
    if (!v) return Promise.resolve(false);
    this.querySelectorAll(FIELDSET).forEach((f, i) => {
      for (const input of f.querySelectorAll(OPTION)) if (input.value === v.options[i]) input.checked = true;
    });
    this.syncAvailable(v.options);
    return this.update(v).then(() => true);
  }

  // Value is buyable together with the other options as selected.
  syncAvailable(selected) {
    this.querySelectorAll(FIELDSET).forEach((f, i) => {
      for (const input of f.querySelectorAll(OPTION)) {
        input.dataset.available = String(
          this.variants.some((v) => v.available && v.options.every((value, j) => value === (j === i ? input.value : selected[j])))
        );
      }
    });
  }

  announce(text) {
    const status = this.root?.querySelector('[role="status"]');
    if (status) status.textContent = text;
  }

  unavailable() {
    this.controller?.abort();
    const label = this.root?.dataset.labelUnavailable || "";
    for (const b of document.querySelectorAll('button[name="add"]')) {
      if (b.form !== this.form) continue;
      b.disabled = true;
      (b.querySelector(".product-form__add-label") || b).textContent = label;
    }
    const inventory = this.root?.querySelector(".product-form__inventory");
    if (inventory) {
      inventory.dataset.state = "unavailable";
      inventory.textContent = label;
    }
    this.announce(label);
  }

  async update(v) {
    if (!v) return;
    this.controller?.abort();
    const controller = (this.controller = new AbortController());
    if (this.idInput) this.idInput.value = v.id;

    const url = new URL(window.location.href);
    url.searchParams.set("variant", v.id);
    const plan = this.form?.querySelector(`${PLAN}:checked`)?.value;
    if (plan) url.searchParams.set("selling_plan", plan);
    else url.searchParams.delete("selling_plan");
    window.history.replaceState(window.history.state, "", url);

    emit(this, "theme:variant:change", { variantId: v.id, featuredMediaId: v.featured_media });
    emit(document, EVENT_VARIANT, { productId: Number(this.root?.dataset.productId), variantId: v.id });

    this.root?.setAttribute("aria-busy", "true");
    try {
      const result = await partials.fetch(REGIONS, { url: url.href, signal: controller.signal });
      if (controller.signal.aborted) return;
      await partials.apply(result);
      if (plan) for (const input of this.form.querySelectorAll(PLAN)) input.checked = input.value === plan;
      const inventory = this.root?.querySelector(".product-form__inventory");
      if (inventory) this.announce(inventory.textContent.trim());
    } catch {
      // Aborted/offline: keep current state.
    } finally {
      if (this.controller === controller) this.root?.removeAttribute("aria-busy");
    }
  }
}

if (!customElements.get("product-variant-picker")) customElements.define("product-variant-picker", ProductVariantPicker);

const shopify = (window.Shopify = window.Shopify || {});
const actions = (shopify.actions = shopify.actions || {});
const fallback = actions[ACTION_SHOW];
actions[ACTION_SHOW] = (arg) => {
  const id = toId(arg);
  for (const p of pickers) if (p.find(id)) return p.show(id);
  return typeof fallback === "function" ? fallback.call(actions, arg) : Promise.resolve(false);
};

for (const root of document.querySelectorAll("product-form[data-product-id]")) {
  const input = root.querySelector('form input[type="hidden"][name="id"]');
  emit(document, EVENT_VIEW, { productId: Number(root.dataset.productId), variantId: Number(input?.value) });
}
