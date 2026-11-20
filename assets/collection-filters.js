// <collection-filters> TE-6 (ES1-T110, ES1-T111), reused by /search (ES1-T123 D4).
import { partials } from "@shopify/partial-rendering";

const T = (id) => `[data-testid="${id}"]`;
const PAGES = T("pagination");
const LINK = `${PAGES} a[href],a${T("collection-filter-clear")},a${T("collection-empty-clear")}`;
const RESULTS = "[data-results-label]";
const GROUP = "details[data-filter-param]";
const OPEN = T("collection-filter-open");
const events = import("https://cdn.shopify.com/storefront/standard-events.js").catch(() => null);

class CollectionFilters extends HTMLElement {
	connectedCallback() {
		this.dataset.enhanced = "";
		this.shown = location.href;
		this.mq = matchMedia("(min-width: 64rem)");
		this.on("addEventListener");
	}

	disconnectedCallback() {
		this.on("removeEventListener");
		this.ctrl?.abort();
		clearTimeout(this.tm);
	}

	on(m) {
		for (const t of "change submit click input keydown focusout".split(" ")) this[m](t, this);
		window[m]("pageshow", this);
		this.mq[m]("change", this);
		for (const t of ["select", "deselect"]) document[m]("shopify:block:" + t, this);
	}

	get form() {
		return document.getElementById("collection-filter-form");
	}

	get dlg() {
		return document.getElementById("collection-filter-drawer");
	}

	// <modal-dialog> (ADR 0007) while the Filter button shows; showModal throws on a popover.
	show(o) {
		const g = this.dlg;
		const m = g?.parentElement;
		if (!m?.open || g.hidden || !o?.getClientRects().length) return;
		g.removeAttribute("popover");
		m.open(o);
		return 1;
	}

	// close() returns focus to the opener.
	hide() {
		const g = this.dlg;
		if (g?.open) g.close();
		else if (g?.matches(":popover-open")) g.hidePopover();
	}

	handleEvent(e) {
		const { type, target: t } = e;
		const f = this.form;
		const o = document.querySelector(OPEN);
		const own = f && t.form == f;
		const num = own && t.type == "number";
		if (t == this.mq) {
			// 64rem+: a column, not a modal.
			if (t.matches && !o?.getClientRects().length) this.hide();
		} else if (type[7] == ":") {
			// shopify:block:(de)select: open below 64rem, close.
			if (t.contains?.(this.dlg)) type.endsWith("deselect") ? this.hide() : this.show(o);
		} else if (type == "pageshow") {
			if (e.persisted && location.href != this.shown) this.go(location.href);
			else if (!this.hasAttribute("aria-busy")) this.sync();
		} else if (type == "input") {
			// Price: debounce 400 ms, drop the request in flight.
			if (!num) return;
			clearTimeout(this.tm);
			this.ctrl?.abort();
			this.bad();
			this.tm = setTimeout(() => this.price(), 400);
		} else if (type == "keydown") {
			// Enter: apply now, no implicit submit (submit closes the drawer).
			if (num && e.key == "Enter" && !e.isComposing) e.preventDefault(), this.price(1);
		} else if (type == "focusout") {
			if (num) this.bad(1);
		} else if (type == "change") {
			// Card swatches are in no form.
			if (own && !num && !this.bad(1)) this.go(this.url(), 0, 1);
		} else if (type == "submit") {
			if (t != f) return;
			e.preventDefault();
			clearTimeout(this.tm);
			if (this.bad(1)) return;
			// "Show N products": close once the filters are applied.
			const u = this.url();
			const p = this.hasAttribute("aria-busy") ? (u == this.want ? this.p : this.go(u, 0, 1)) : u == this.shown || this.go(u, 0, 1);
			Promise.resolve(p).then((ok) => ok && this.hide());
		} else {
			const b = t.closest?.(OPEN);
			if (b && !e.defaultPrevented && this.show(b)) return e.preventDefault();
			const a = t.closest?.(LINK);
			if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			e.preventDefault();
			const page = !!a.closest(PAGES);
			this.go(a.href, page, !page);
		}
	}

	price(show) {
		clearTimeout(this.tm);
		if (this.bad(show)) return;
		const u = this.url();
		if (u != (this.hasAttribute("aria-busy") ? this.want : this.shown)) this.go(u, 0, 1);
	}

	// min > max: no request; error on blur, Enter, submit (filter-group.liquid).
	bad(show) {
		const [lo, hi, err] = ["min", "max", "error"].map((s) => this.querySelector(T("collection-filter-price-" + s)));
		if (!lo || !hi) return;
		const no = lo.value && hi.value && +lo.value > +hi.value;
		if (err && (show || !no)) {
			err.hidden = !no;
			for (const i of [lo, hi]) {
				const d = (i.getAttribute("aria-describedby") || "").replace(err.id, "").trim();
				i.setAttribute("aria-describedby", no ? `${d} ${err.id}` : d);
				no ? i.setAttribute("aria-invalid", "true") : i.removeAttribute("aria-invalid");
			}
		}
		return no;
	}

	url() {
		const u = new URL(location.pathname, location.href);
		for (let [k, v] of new FormData(this.form)) if ((v = `${v}`.trim())) u.searchParams.append(k, v);
		return u.href;
	}

	go(url, page, emit) {
		this.want = url;
		return (this.p = this.run(url, page, emit));
	}

	// Resolves 1 once applied; undefined when aborted or on the full-page fallback.
	async run(url, page, emit) {
		this.ctrl?.abort();
		const c = (this.ctrl = new AbortController());
		const done = emit && this.emit(url);
		// Label still empty after apply = not applied.
		this.querySelector(RESULTS)?.setAttribute("data-results-label", "");
		this.setAttribute("aria-busy", "true");
		try {
			const update = await partials.fetch(this.dataset.resultsPartial || "collection-products", "collection-filters", "collection-filter-count", { url, signal: c.signal });
			if (c.signal.aborted) return;
			const open = new Map([...this.querySelectorAll(GROUP)].map((d) => [d.dataset.filterParam, d.open]));
			const a = document.activeElement;
			await partials.apply(update);
			if (c.signal.aborted) return;
			const r = this.querySelector(RESULTS);
			const label = r?.dataset.resultsLabel;
			if (!label) throw 0;
			history.replaceState(history.state, "", url);
			this.shown = location.href;
			this.sync();
			// Focused control replaced: its twin, else ×.
			if (a && !a.isConnected) (document.getElementById(a.id) || this.querySelector(T("collection-filter-close")))?.focus();
			for (const d of this.querySelectorAll(GROUP)) d.open = open.get(d.dataset.filterParam) ?? d.open;
			const status = this.querySelector(T("collection-status"));
			if (status) status.textContent = label;
			if (page) {
				r.tabIndex = -1;
				r.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
				r.focus({ preventScroll: true });
			}
			if (done) done({ productsCount: +(r.dataset.resultsCount ?? label.replace(/\D/g, "")) });
			return 1;
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
		// productFilters is optional and left out (ES1-T249).
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
