// <product-variant-picker> TE-4, TE-13; ADR 0008.
import { partials } from "@shopify/partial-rendering";

const REGIONS = ["product-options", "product-price", "product-buy-buttons", "product-installments", "product-pickup", "product-selling-plans", "product-sticky-bar"];
const SET = "fieldset[data-option-position]";
const OPTION = `${SET} input`;
const PLAN = "input[name=selling_plan]";
const events = import("https://cdn.shopify.com/storefront/standard-events.js").catch(() => null);

const gid = (t, id) => `gid://shopify/${t}/${id}`;
const fill = (text = "", o) => text.replace(/\[(\w+)\]/g, (m, k) => o[k] ?? "").replace(/^[,\s]+|[,\s]+$|,\s*(?=,)/g, "");
const nameOf = (r) => r?.parentElement.querySelector(".product-option__text")?.firstChild?.data.trim();

class ProductVariantPicker extends HTMLElement {
	connectedCallback() {
		this.root = this.closest("product-form");
		this.scope = this.closest("featured-product") || document;
		this.form = document.getElementById(this.dataset.formId);
		this.open = new Set();
		this.listen("addEventListener");
		this.loaded = this.ids((r) => r.defaultChecked);
		if (this.ids() != `${this.loaded}`) this.load(this.ids());
	}

	disconnectedCallback() {
		this.listen("removeEventListener");
		this.controller?.abort();
	}

	listen(m) {
		this[m]("change", this);
		this[m]("click", this);
		this.form[m]("change", this);
		document[m]("submit", this, true);
	}

	handleEvent(e) {
		const t = e.target;
		const b = t.closest("button");
		if (e.type == "submit") this.controller && t == this.form && (e.preventDefault(), e.stopImmediatePropagation());
		else if (b?.matches("[data-option-more]")) this.more(b, 1);
		else if (b?.matches(".product-option__retry") && this.retry) this.load(...this.retry), b.closest(SET).querySelector(":checked").focus();
		else if (e.type != "change");
		else if (t.matches(PLAN)) this.load(this.loaded);
		else if (t.dataset.productUrl) location.assign(t.dataset.productUrl);
		else if (t.matches(OPTION)) this.load(this.ids(), t);
	}

	ids(test = (r) => r.checked) {
		return [...this.querySelectorAll(OPTION)].filter(test).map((r) => r.dataset.optionValueId);
	}

	check(ids) {
		for (const r of this.querySelectorAll(OPTION)) if ((r.checked = ids.includes(r.dataset.optionValueId))) r.closest(SET).querySelector("[data-option-selected]").textContent = nameOf(r);
	}

	more(b, focus) {
		const open = b.ariaExpanded != "true";
		const all = [...b.parentElement.querySelectorAll("label")];
		const sel = all.findIndex((l) => l.querySelector(":checked"));
		b.ariaExpanded = open;
		all.forEach((l, i) => (l.hidden = !open && (sel > 6 ? i > 5 && i != sel : i > 6)));
		this.open[open ? "add" : "delete"](b.closest(SET).dataset.optionPosition);
		if (focus) open ? all[sel > 6 ? 6 : 7]?.querySelector("input").focus() : b.scrollIntoView({ block: "nearest" });
	}

	say(text) {
		this.root.querySelector(":scope>[role=status]")?.replaceChildren(text);
	}

	adds() {
		return [...this.form.elements].filter((el) => el.name == "add");
	}

	// ES1-T555: buy aria-disabled now; skeleton, stock spinner after delay.
	pending(on) {
		for (const el of [this.root, ...this.adds()]) el[el.name == "add" ? "ariaDisabled" : "ariaBusy"] = on ? "true" : null;
		if (on) this.idle ||= window.busyLater?.(...this.scope.querySelectorAll("[data-variant-busy]"));
		else this.idle = this.idle?.();
	}

	fail(f, text = "") {
		f?.querySelector("[role=alert]")?.replaceChildren(text);
		f?.querySelector(".product-option__retry")?.toggleAttribute("hidden", !text);
	}

	async load(ids, input) {
		this.controller?.abort();
		const c = (this.controller = new AbortController());
		const { fetchUrl, partials: names, labelLoading, labelLoaded, labelLoadError } = this.dataset;
		const value = nameOf(input);
		const done = input ? this.emit() : () => {};
		const plan = this.form.querySelector(`${PLAN}:checked`)?.value;
		const url = new URL(fetchUrl || location.href, location.href);
		this.check(ids);
		const page = new URL(location.href);
		for (const p of [url.searchParams, page.searchParams]) p.delete("variant"), p.delete("selling_plan"), plan && p.set("selling_plan", plan);
		url.searchParams.set("option_values", ids);
		this.pending(1);
		this.say(fill(labelLoading, { value }));
		let v = null;
		try {
			if (fetchUrl && document.querySelectorAll("featured-product").length > 1) await this.scope.swap(url, c.signal);
			else await partials.apply(await partials.fetch(...(names ? names.split(" ") : REGIONS), { url: url.href, signal: c.signal }));
			if (c.signal.aborted) return;
			this.loaded = ids;
			for (const f of this.querySelectorAll(SET)) {
				const b = f.querySelector("[data-option-more]");
				this.fail(f);
				if (b?.ariaExpanded == "false" && this.open.has(f.dataset.optionPosition)) this.more(b);
			}
			if (plan) for (const r of this.form.querySelectorAll(PLAN)) r.checked = r.value == plan;
			v = JSON.parse(this.root.querySelector("[data-selected-variant]")?.textContent || null);
			if (v) {
				this.form.elements.id.value = v.id;
				page.searchParams.set("variant", v.id);
				if (!fetchUrl) history.replaceState(history.state, "", page);
				this.dispatchEvent(new CustomEvent("theme:variant:change", { bubbles: true, detail: { variantId: v.id, featuredMediaId: v.featured_media } }));
			}
			const [add] = this.adds();
			const price = v && this.scope.querySelector("[data-variant-price] .price__current")?.textContent.trim();
			const availability = (this.root.querySelector(".product-form__inventory") || (add?.disabled ? add : null))?.textContent.trim();
			this.say(fill(labelLoaded, { value, price, availability }));
		} catch {
			if (c.signal.aborted) return;
			const f = input?.closest(SET) || this.querySelector(SET);
			this.check(this.loaded);
			this.fail(this.retry?.[2]);
			this.retry = [ids, input, f];
			this.fail(f, fill(labelLoadError, { value }));
			this.say("");
			if (this.contains(document.activeElement)) f.querySelector(":checked")?.focus();
		} finally {
			done(v);
			if (this.controller == c) this.controller = this.pending();
		}
	}

	emit() {
		const selectedOptions = [...this.querySelectorAll(SET)].map((f) => ({ name: f.dataset.optionName, value: nameOf(f.querySelector(":checked")) }));
		const product = {
			id: gid("Product", this.root.dataset.productId),
			title: this.scope.querySelector("[data-testid$=product-title]")?.textContent.trim(),
			handle: decodeURIComponent(this.dataset.productUrl.split("?")[0].split("/").pop()),
		};
		let done;
		const result = new Promise((r) => (done = r)).then((v) => ({
			variant: v && {
				id: gid("ProductVariant", v.id),
				title: v.title,
				availableForSale: v.available,
				price: { amount: (v.price / 100).toFixed(2), currencyCode: window.Shopify?.currency?.active },
				selectedOptions: v.options.map((value, i) => ({ ...selectedOptions[i], value })),
			},
		}));
		events.then((m) => {
			try {
				const E = m.ProductSelectEvent;
				const d = E.createPromise?.();
				this.root.dispatchEvent(new E({ product, selectedOptions, promise: d?.resolve ? d.promise : result }));
				result.then((r) => d?.resolve(r));
			} catch {}
		});
		return done;
	}
}

if (!customElements.get("product-variant-picker")) customElements.define("product-variant-picker", ProductVariantPicker);
