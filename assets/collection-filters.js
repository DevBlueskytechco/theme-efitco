// <collection-filters> TE-6 (ES1-T110), reused by /search (ES1-T123 D4).
import { partials } from "@shopify/partial-rendering";

const T = (id) => `[data-testid="${id}"]`;
const PAGES = T("pagination");
const LINK = `${PAGES} a[href],a${T("collection-filter-clear")},a${T("collection-empty-clear")}`;
const RESULTS = "[data-results-label]";
const GROUP = "details[data-filter-param]";
const events = import("https://cdn.shopify.com/storefront/standard-events.js").catch(() => null);

class CollectionFilters extends HTMLElement {
	connectedCallback() {
		this.dataset.enhanced = "";
		this.shown = location.href;
		this.on("addEventListener");
	}

	disconnectedCallback() {
		this.on("removeEventListener");
		this.ctrl?.abort();
	}

	on(m) {
		for (const t of ["change", "submit", "click"]) this[m](t, this);
		window[m]("pageshow", this);
	}

	get form() {
		return document.getElementById("collection-filter-form");
	}

	handleEvent(e) {
		const { type, target: t } = e;
		const f = this.form;
		if (type == "pageshow") {
			if (e.persisted && location.href != this.shown) this.go(location.href);
			else if (!this.hasAttribute("aria-busy")) this.sync();
		} else if (type == "change") {
			// Price inputs: BE2 (ES1-T111). Card swatches are in no form.
			if (f && t.form == f && t.type != "number") this.go(this.url(), 0, 1);
		} else if (type == "submit") {
			if (t != f) return;
			e.preventDefault();
			this.go(this.url(), 0, 1);
		} else {
			const a = t.closest?.(LINK);
			if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			e.preventDefault();
			const page = !!a.closest(PAGES);
			this.go(a.href, page, !page);
		}
	}

	url() {
		const u = new URL(location.pathname, location.href);
		for (let [k, v] of new FormData(this.form)) if ((v = `${v}`.trim())) u.searchParams.append(k, v);
		return u.href;
	}

	async go(url, page, emit) {
		this.ctrl?.abort();
		const c = (this.ctrl = new AbortController());
		const done = emit && this.emit(url);
		// The server always renders the label: still empty after apply = not applied.
		this.querySelector(RESULTS)?.setAttribute("data-results-label", "");
		this.setAttribute("aria-busy", "true");
		try {
			const update = await partials.fetch(this.dataset.resultsPartial || "collection-products", "collection-filters", "collection-filter-count", { url, signal: c.signal });
			if (c.signal.aborted) return;
			const open = new Map([...this.querySelectorAll(GROUP)].map((d) => [d.dataset.filterParam, d.open]));
			await partials.apply(update);
			if (c.signal.aborted) return;
			const r = this.querySelector(RESULTS);
			const label = r?.dataset.resultsLabel;
			if (!label) throw 0;
			history.replaceState(history.state, "", url);
			this.shown = location.href;
			this.sync();
			for (const d of this.querySelectorAll(GROUP)) d.open = open.get(d.dataset.filterParam) ?? d.open;
			const status = this.querySelector(T("collection-status"));
			if (status) status.textContent = label;
			if (page) {
				r.tabIndex = -1;
				r.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
				r.focus({ preventScroll: true });
			}
			if (done) done({ productsCount: +(r.dataset.resultsCount ?? label.replace(/\D/g, "")) });
		} catch {
			if (!c.signal.aborted) location.assign(url);
		} finally {
			if (this.ctrl == c) this.removeAttribute("aria-busy");
		}
	}

	// apply() keeps form values: reset every control to the server state.
	sync() {
		const q = new URLSearchParams(location.search);
		for (const el of this.form?.elements || []) {
			if (el.type == "checkbox" || el.type == "radio") el.checked = el.defaultChecked;
			else if (el.options) {
				const v = q.get(el.name);
				for (const o of el.options) o.selected = v == null ? o.defaultSelected : o.value == v;
			} else if ("defaultValue" in el) el.value = el.defaultValue;
		}
	}

	// shopify:collection:update, collection pages only (ES1-T123 D4 #3).
	emit(url) {
		const f = this.form;
		const d = f?.dataset;
		if (!d?.collectionHandle) return;
		let done;
		const result = new Promise((r) => (done = r));
		// productFilters is optional and left out: over the 5248 B budget.
		const s = new URL(url).searchParams.get("sort_by")?.split("-")[0];
		const sortKey = s == "best" ? "BEST_SELLING" : s?.toUpperCase();
		const collection = { id: d.collectionId ? `gid://shopify/Collection/${d.collectionId}` : null, handle: d.collectionHandle, productsCount: +d.productsCount || 0 };
		events.then((m) => {
			const E = m?.CollectionUpdateEvent;
			if (!E) return;
			try {
				const p = E.createPromise?.();
				if (p?.resolve) result.then(p.resolve);
				f.dispatchEvent(new E({ collection, promise: p?.promise || result, ...(sortKey && { sortKey }) }));
			} catch {}
		});
		return done;
	}
}

if (!customElements.get("collection-filters")) customElements.define("collection-filters", CollectionFilters);
