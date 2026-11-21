// <collection-filters> TE-6 (ES1-T110), reused by /search (ES1-T123 D4).
import { partials } from "@shopify/partial-rendering";

const T = (id) => `[data-testid="${id}"]`;
const PAGES = T("pagination");
const LINK = `${PAGES} a[href],a${T("collection-filter-clear")},a${T("collection-empty-clear")}`;
const RESULTS = "[data-results-label]";
const GROUP = "details[data-filter-param]";
const OPEN = T("collection-filter-open");
// Search page only (search.md S6b): alert above the results, old grid kept. Without it (collection) a failed refresh loads the page.
const ERROR = "template[data-results-error]";
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

	get dlg() {
		return document.getElementById("collection-filter-drawer");
	}

	// Drawer via <modal-dialog> (ADR 0007): showModal throws on an open popover,
	// so drop the attribute. Without modal-dialog.js the popover stays.
	show(o) {
		const g = this.dlg;
		const m = g?.parentElement;
		if (!m?.open || g.hidden) return;
		g.removeAttribute("popover");
		m.open(o);
		return 1;
	}

	// Native close returns focus to collection-filter-open (focused by open()).
	hide() {
		const g = this.dlg;
		if (g?.open) g.close();
		else if (g?.matches(":popover-open")) g.hidePopover();
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
			// "Show N products": close once the filters are applied (collection-filters.liquid).
			const u = this.url();
			const p = this.hasAttribute("aria-busy") ? (u == this.want ? this.p : this.go(u, 0, 1)) : u == this.shown || this.go(u, 0, 1);
			Promise.resolve(p).then((ok) => ok && this.hide());
		} else {
			if (t.closest?.("[data-retry]") && this.err?.contains(t)) return this.go(...this.args);
			const o = t.closest?.(OPEN);
			if (o && !e.defaultPrevented && this.show(o)) return e.preventDefault();
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

	go(url, page, emit) {
		this.want = url;
		this.args = [url, page, emit];
		return (this.p = this.run(url, page, emit));
	}

	// Resolves 1 once applied; undefined when aborted or on the full-page fallback.
	async run(url, page, emit) {
		this.ctrl?.abort();
		const c = (this.ctrl = new AbortController());
		const done = emit && this.emit(url);
		// The server always renders the label: still empty after apply = not applied.
		this.querySelector(RESULTS)?.setAttribute("data-results-label", "");
		this.setAttribute("aria-busy", "true");
		this.err?.remove();
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
				// data-results-focus: the products group on /search; the label root on collections.
				const f = r.querySelector("[data-results-focus]") || r;
				f.tabIndex = -1;
				f.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
				f.focus({ preventScroll: true });
			}
			if (done) done({ productsCount: +(r.dataset.resultsCount ?? label.replace(/\D/g, "")) });
			return 1;
		} catch {
			if (c.signal.aborted) return;
			const t = this.querySelector(ERROR);
			if (!t) return location.assign(url);
			// Close the drawer so the alert and Try Again are reachable; the ticked filters stay in the form.
			this.hide();
			t.after((this.err = t.content.firstElementChild.cloneNode(true)));
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
		// productFilters is optional and left out (ES1-T249; add under TE-6 if needed).
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
