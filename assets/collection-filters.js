// <collection-filters> TE-6 (ES1-T110), reused by /search (ES1-T123 D4, ES1-T380).
import { partials } from "@shopify/partial-rendering";

const T = (id) => `[data-testid="${id}"]`;
// /search: the status line sits in the page head, outside this element (templates/search.liquid).
const STATUS = `${T("collection-status")},${T("search-status")}`;
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
		const r0 = this.querySelector(RESULTS);
		this.lbl = r0?.dataset.resultsLabel || this.lbl;
		r0?.setAttribute("data-results-label", "");
		this.setAttribute("aria-busy", "true");
		// Try Again is removed with the alert: keep focus on the page.
		if (this.err?.contains(document.activeElement)) this.querySelector(OPEN)?.focus();
		this.err?.remove();
		// /search: the filter badge renders inside the results partial, no collection-filter-count region.
		const rp = this.dataset.resultsPartial;
		try {
			const update = await partials.fetch(...(rp ? [rp, "collection-filters"] : ["collection-products", "collection-filters", "collection-filter-count"]), { url, signal: c.signal });
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
			const status = this.querySelector(STATUS) || document.querySelector(STATUS);
			if (status) status.textContent = label;
			if (page) {
				// data-results-focus: the products group on /search; the label root on collections.
				const f = r.querySelector("[data-results-focus]") || r;
				f.tabIndex = -1;
				f.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
				f.focus({ preventScroll: true });
			}
			// Leading number only: the search label also holds the terms ("3 results for “66 lb”").
			if (done) done({ productsCount: +(r.dataset.resultsCount ?? (label.match(/^\d[\d,.]*/)?.[0].replace(/\D/g, "") || 0)) });
			return 1;
		} catch {
			if (c.signal.aborted) return;
			// Old results stay: give them back their label (status line and the next "not applied" check read it).
			const r = this.querySelector(RESULTS);
			if (r && !r.dataset.resultsLabel) r.dataset.resultsLabel = this.lbl || "";
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

	// Filter or sort change, not a page change (ES1-T124 #3): shopify:collection:update when the form has
	// the collection hooks (ES1-T123 D4 #3), shopify:search:update when it has the q input (/search, ES1-T380).
	emit(url) {
		const f = this.form;
		const d = f?.dataset;
		const h = d?.collectionHandle;
		const query = f?.elements.namedItem("q")?.value;
		if (!h && query == null) return;
		let done;
		const result = new Promise((r) => (done = r));
		// productFilters is optional and left out (ES1-T249; add under TE-6 if needed).
		const s = new URL(url).searchParams.get("sort_by")?.split("-")[0];
		const sortKey = s == "best" ? "BEST_SELLING" : s?.toUpperCase();
		const sort = sortKey && { sortKey };
		events.then((m) => {
			const E = m?.[h ? "CollectionUpdateEvent" : "SearchUpdateEvent"];
			if (!E) return;
			try {
				const p = E.createPromise?.();
				if (p?.resolve) result.then(p.resolve);
				const promise = p?.promise || result;
				f.dispatchEvent(
					new E(
						h
							? { collection: { id: d.collectionId ? `gid://shopify/Collection/${d.collectionId}` : null, handle: h, productsCount: +d.productsCount || 0 }, promise, ...sort }
							: { search: { query, ...sort }, promise },
					),
				);
			} catch {}
		});
		return done;
	}
}

if (!customElements.get("collection-filters")) customElements.define("collection-filters", CollectionFilters);
