// <collection-filters> TE-6 + /search (ES1-T380).
import { partials } from "@shopify/partial-rendering";

const T = (id) => `[data-testid="${id}"]`;
const PAGES = T("pagination");
const LINK = [PAGES + " a[href]", ..."filter-clear empty-button chip chips-clear".split(" ").map((s) => "a" + T("collection-" + s))].join();
const RESULTS = "[data-results-label]";
const GROUP = "details[data-filter-param]";
const OPEN = T("collection-filter-open");
// S6b alert (/search); none: reload.
const ERROR = "template[data-results-error]";
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

	$(s) {
		return this.querySelector(s);
	}

	get form() {
		return document.getElementById("collection-filter-form");
	}

	get dlg() {
		return document.getElementById("collection-filter-drawer");
	}

	// ADR 0007; showModal throws on a popover.
	show(o) {
		const g = this.dlg;
		const m = g?.parentElement;
		if (!m?.open || g.hidden || !o?.getClientRects().length) return;
		g.removeAttribute("popover");
		m.open(o);
		return 1;
	}

	hide() {
		const g = this.dlg;
		g?.open ? g.close() : g?.matches(":popover-open") && g.hidePopover();
	}

	handleEvent(e) {
		const { type, target: t } = e;
		const f = this.form;
		const o = document.querySelector(OPEN);
		const own = f && t.form == f;
		const num = own && t.type == "number";
		if (t == this.mq) {
			if (t.matches && !o?.getClientRects().length) this.hide();
		} else if (type[7] == ":") {
			if (t.contains?.(this.dlg)) type.endsWith("deselect") ? this.hide() : this.show(o);
		} else if (type == "pageshow") {
			if (e.persisted && location.href != this.shown) this.go(location.href);
			else if (!this.ariaBusy) this.sync();
		} else if (type == "input") {
			if (!num) return;
			clearTimeout(this.tm);
			this.ctrl?.abort();
			this.bad();
			this.tm = setTimeout(() => this.price(), 400);
		} else if (type == "keydown") {
			if (num && e.key == "Enter" && !e.isComposing) e.preventDefault(), this.price(1);
		} else if (type == "focusout") {
			if (num) this.bad(1);
		} else if (type == "change") {
			if (own && !num && !this.bad(1)) this.go(this.url(), 0, 1);
		} else if (type == "submit") {
			if (t != f) return;
			e.preventDefault();
			clearTimeout(this.tm);
			if (this.bad(1)) return;
			const u = this.url();
			const p = this.ariaBusy ? (u == this.want ? this.p : this.go(u, 0, 1)) : u == this.shown || this.go(u, 0, 1);
			Promise.resolve(p).then((ok) => ok && this.hide());
		} else {
			if (t.closest?.("[data-retry]") && this.err?.contains(t)) return this.go(...this.args);
			const b = t.closest?.(OPEN);
			if (b && !e.defaultPrevented && this.show(b)) return e.preventDefault();
			const a = t.closest?.(LINK);
			if (!a || a.pathname != location.pathname || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			e.preventDefault();
			const page = !!a.closest(PAGES);
			this.go(a.href, page, !page);
		}
	}

	price(show) {
		clearTimeout(this.tm);
		if (this.bad(show)) return;
		const u = this.url();
		if (u != (this.ariaBusy ? this.want : this.shown)) this.go(u, 0, 1);
	}

	bad(show) {
		const [lo, hi, err] = ["min", "max", "error"].map((s) => this.$(T("collection-filter-price-" + s)));
		if (!lo || !hi) return;
		const no = lo.value && hi.value && +lo.value > +hi.value;
		if (err && (show || !no)) {
			err.hidden = !no;
			for (const i of [lo, hi]) {
				const d = (i.getAttribute("aria-describedby") || "").replace(err.id, "").trim();
				i.setAttribute("aria-describedby", no ? `${d} ${err.id}` : d);
				i.ariaInvalid = no ? "true" : null;
			}
		}
		return no;
	}

	// Server 500.00 → 500.
	url() {
		const f = this.form;
		const u = new URL(location.pathname, location.href);
		for (let [k, v] of new FormData(f)) if ((v = `${v}`.trim())) u.searchParams.append(k, f.elements[k]?.type == "number" ? v.replace(/\.0+$/, "") : v);
		return u.href;
	}

	go(url, page, emit) {
		this.want = url;
		this.args = [url, page, emit];
		return (this.p = this.run(url, page, emit));
	}

	async run(url, page, emit) {
		this.ctrl?.abort();
		const c = (this.ctrl = new AbortController());
		const s = c.signal;
		const done = emit && this.emit(url);
		// Empty after apply = not applied.
		const r0 = this.$(RESULTS)?.dataset;
		if (r0) (this.lbl = r0.resultsLabel || this.lbl), (r0.resultsLabel = "");
		this.ariaBusy = "true";
		if (this.err?.contains(document.activeElement)) this.$(OPEN)?.focus();
		this.err?.remove();
		const rp = this.dataset.resultsPartial;
		try {
			const update = await partials.fetch(...(rp ? [rp, "collection-filters"] : ["collection-products", "collection-filters", "collection-filter-count"]), { url, signal: s });
			if (s.aborted) return;
			const open = new Map([...this.querySelectorAll(GROUP)].map((d) => [d.dataset.filterParam, d.open]));
			const a = document.activeElement;
			await partials.apply(update);
			if (s.aborted) return;
			const r = this.$(RESULTS);
			const label = r?.dataset.resultsLabel;
			if (!label) throw 0;
			history.replaceState(history.state, "", url);
			this.shown = location.href;
			this.sync();
			if (a && !a.isConnected) (document.getElementById(a.id) || this.$(T("collection-filter-close")))?.focus();
			for (const d of this.querySelectorAll(GROUP)) d.open = open.get(d.dataset.filterParam) ?? d.open;
			document.querySelector(T("collection-status") + "," + T("search-status"))?.replaceChildren(label);
			if (page) {
				const f = r.querySelector("[data-results-focus]") || r;
				f.tabIndex = -1;
				f.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
				f.focus({ preventScroll: true });
			}
			if (done) done({ productsCount: +(r.dataset.resultsCount ?? (label.match(/^\d[\d,.]*/)?.[0].replace(/\D/g, "") || 0)) });
			return 1;
		} catch {
			if (s.aborted) return;
			const r = this.$(RESULTS)?.dataset;
			if (r && !r.resultsLabel) r.resultsLabel = this.lbl || "";
			const t = this.$(ERROR);
			if (!t) return location.assign(url);
			this.hide();
			t.after((this.err = t.content.firstElementChild.cloneNode(true)));
		} finally {
			if (this.ctrl == c) this.ariaBusy = null;
		}
	}

	// apply() keeps form values: reset.
	sync() {
		const q = new URLSearchParams(location.search);
		for (const el of this.form?.elements || []) {
			if (/^(checkbox|radio)$/.test(el.type)) el.checked = el.defaultChecked;
			else if (el.options) {
				const v = q.get(el.name);
				for (const o of el.options) o.selected = v == null ? o.defaultSelected : o.value == v;
			} else if ("defaultValue" in el) el.value = el.defaultValue;
		}
	}

	emit(url) {
		const f = this.form;
		const d = f?.dataset;
		const h = d?.collectionHandle;
		const query = f?.elements.q?.value;
		if (!h && query == null) return;
		let done;
		const result = new Promise((r) => (done = r));
		const s = new URL(url).searchParams.get("sort_by")?.split("-")[0];
		const sort = s && { sortKey: s == "best" ? "BEST_SELLING" : s.toUpperCase() };
		events.then((m) => {
			try {
				const E = m[h ? "CollectionUpdateEvent" : "SearchUpdateEvent"];
				const p = E.createPromise?.();
				p?.resolve && result.then(p.resolve);
				const promise = p?.promise || result;
				f.dispatchEvent(new E(h ? { collection: { id: d.collectionId ? `gid://shopify/Collection/${d.collectionId}` : null, handle: h, productsCount: +d.productsCount || 0 }, promise, ...sort } : { search: { query, ...sort }, promise }));
			} catch {}
		});
		return done;
	}
}

if (!customElements.get("collection-filters")) customElements.define("collection-filters", CollectionFilters);
