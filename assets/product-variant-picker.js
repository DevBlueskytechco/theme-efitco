// <product-variant-picker> TE-4, TE-13.
import { partials } from "@shopify/partial-rendering";

const REGIONS = ["product-price", "product-buy-buttons", "product-installments", "product-pickup", "product-selling-plans", "product-sticky-bar"];
const OPTION = 'input[type="radio"][name^="option-"]';
const PLAN = 'input[type="radio"][name="selling_plan"]';
const FIELDSET = "fieldset[data-option-position]";
const INVENTORY = ".product-form__inventory";
const events = import("https://cdn.shopify.com/storefront/standard-events.js").catch(() => null);

const gid = (type, id) => `gid://shopify/${type}/${id}`;

class ProductVariantPicker extends HTMLElement {
	connectedCallback() {
		try {
			this.data = JSON.parse(this.querySelector("script[data-product-variants]").textContent);
		} catch {
			this.data = {};
		}
		this.variants = this.data.variants || [];
		this.root = this.closest("product-form");
		this.form = document.getElementById(this.dataset.formId);
		this.idInput = this.form?.querySelector('input[type="hidden"][name="id"]');
		this.save();
		this.listen("addEventListener");
		// Lazy: radios may differ.
		if (this.dataset.fetchUrl && this.match(this.selection())?.id !== Number(this.idInput?.value)) this.select();
	}

	disconnectedCallback() {
		this.listen("removeEventListener");
		this.controller?.abort();
	}

	listen(m) {
		for (const t of [this, this.form]) t?.[m]("change", this);
		for (const e of ["popstate", "pageshow"]) window[m](e, this);
	}

	handleEvent({ type, target }) {
		if (type === "popstate") {
			const id = Number(new URLSearchParams(window.location.search).get("variant"));
			const v = this.variants.find((x) => x.id === id);
			if (v && id !== Number(this.idInput?.value)) this.show(v);
		} else if (type === "pageshow") {
			const v = this.match(this.selection());
			if (v && v.id !== Number(this.idInput?.value)) this.update(v);
		} else if (target instanceof HTMLInputElement && target.checked) {
			if (target.matches(OPTION) && this.contains(target)) this.select();
			else if (target.matches(PLAN) && target.form === this.form) this.update(this.match(this.selection()));
		}
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
		this.emitSelect(selected, v);
		if (v) this.update(v);
		else this.unavailable();
	}

	show(v) {
		this.querySelectorAll(FIELDSET).forEach((f, i) => {
			for (const input of f.querySelectorAll(OPTION)) if (input.value === v.options[i]) input.checked = true;
		});
		this.syncAvailable(v.options);
		this.emitSelect(v.options, v);
		this.update(v);
	}

	syncAvailable(selected) {
		this.querySelectorAll(FIELDSET).forEach((f, i) => {
			for (const input of f.querySelectorAll(OPTION)) {
				input.dataset.available = String(
					this.variants.some((v) => v.available && v.options.every((value, j) => value === (j === i ? input.value : selected[j])))
				);
			}
		});
	}

	emitSelect(selected, v) {
		const { product: p = {}, options: names = [], currency } = this.data;
		const selectedOptions = names.map((name, i) => ({ name, value: selected[i] })).filter((o) => o.value != null);
		const variant = v ? {
			id: gid("ProductVariant", v.id),
			title: v.title,
			availableForSale: v.available,
			price: { amount: (v.price / 100).toFixed(2), currencyCode: currency },
			selectedOptions: names.map((name, i) => ({ name, value: v.options[i] })),
		} : null;
		const product = { id: gid("Product", p.id), title: p.title, handle: p.handle };
		const target = this.root || this;
		events.then((m) => {
			const E = m?.ProductSelectEvent;
			if (!E || !selectedOptions.length) return;
			try {
				const d = E.createPromise?.();
				const ok = typeof d?.resolve === "function";
				target.dispatchEvent(new E({ product, selectedOptions, promise: ok ? d.promise : Promise.resolve({ variant }) }));
				if (ok) d.resolve({ variant });
			} catch {}
		});
	}

	announce(text) {
		const status = this.root?.querySelector('[role="status"]');
		if (status) status.textContent = text;
	}

	buttons() {
		return [...document.querySelectorAll('button[name="add"]')].filter((b) => b.form === this.form);
	}

	save() {
		const i = (this.inv = this.root?.querySelector(INVENTORY));
		this.saved = [...this.buttons(), i].filter(Boolean).map((el) => [el, el.disabled, el.dataset.state, el.innerHTML]);
	}

	restore() {
		for (const [el, d, s, html] of this.saved) {
			el.innerHTML = html;
			if (s) el.dataset.state = s;
			else el.disabled = d;
		}
	}

	unavailable() {
		this.controller?.abort();
		const label = this.root?.dataset.labelUnavailable || "";
		for (const b of this.buttons()) {
			b.disabled = true;
			(b.querySelector(".product-form__add-label") || b).textContent = label;
		}
		if (this.inv) {
			this.inv.dataset.state = "unavailable";
			this.inv.textContent = label;
		}
		this.announce(label);
	}

	async update(v) {
		if (!v) return;
		this.controller?.abort();
		const controller = (this.controller = new AbortController());
		if (this.idInput) this.idInput.value = v.id;

		const { fetchUrl, regions } = this.dataset;
		const url = new URL(fetchUrl || window.location.href, window.location.href);
		url.searchParams.set("variant", v.id);
		const plan = this.form?.querySelector(`${PLAN}:checked`)?.value;
		if (plan) url.searchParams.set("selling_plan", plan);
		else url.searchParams.delete("selling_plan");
		if (!fetchUrl) window.history.replaceState(window.history.state, "", url);

		this.dispatchEvent(new CustomEvent("theme:variant:change", { bubbles: true, detail: { variantId: v.id, featuredMediaId: v.featured_media } }));

		// Partial names repeat: featured-product.js renders JSON (ES1-T169 D4).
		if (document.querySelectorAll("featured-product").length > 1) return this.sayPrice(v);

		this.root?.setAttribute("aria-busy", "true");
		try {
			const names = regions ? regions.split(" ") : REGIONS;
			const update = await partials.fetch(...names, { url: url.toString(), signal: controller.signal });
			if (controller.signal.aborted) return;
			await partials.apply(update);
			if (plan) for (const input of this.form.querySelectorAll(PLAN)) input.checked = input.value === plan;
			this.save();
			if (this.inv) this.announce(this.inv.textContent.trim());
		} catch {
			if (!controller.signal.aborted) this.restore();
		} finally {
			if (this.controller === controller) this.root?.removeAttribute("aria-busy");
			if (!controller.signal.aborted) this.sayPrice(v);
		}
	}

	// Outside the product page: JSON, whatever the partial did (ES1-T223).
	sayPrice({ price_html: html, available }) {
		if (html == null) return;
		const t = document.createElement("template");
		t.innerHTML = html;
		const sold = available ? "" : this.root?.dataset.labelSoldOut;
		this.announce(`${t.content.textContent.trim()} ${sold}`.trim());
	}
}

if (!customElements.get("product-variant-picker")) customElements.define("product-variant-picker", ProductVariantPicker);
