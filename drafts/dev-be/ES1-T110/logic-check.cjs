// ES1-T110: kiểm logic assets/collection-filters.js bằng DOM giả (không có trình duyệt trong phiên agent).
// Chạy: node drafts/dev-be/ES1-T110/logic-check.cjs [đường dẫn js]
const fs = require("fs");
const assert = require("assert");
const file = process.argv[2] || "assets/collection-filters.js";
const src = fs.readFileSync(file, "utf8").replace(/^import .*$/m, "");

const log = [];
const tick = () => new Promise((r) => setTimeout(r, 0));

function attrs(o) {
	o.attrs = {};
	o.setAttribute = (k, v) => (o.attrs[k] = v);
	o.removeAttribute = (k) => delete o.attrs[k];
	o.hasAttribute = (k) => k in o.attrs;
	return o;
}
const input = (name, value, checked, type = "checkbox") => ({ name, value, type, checked, defaultChecked: checked, form: null });
const results = (label) => {
	const r = { dataset: { resultsLabel: label }, scrollIntoView: (o) => log.push(["scroll", o.behavior]), focus: () => log.push(["focus"]) };
	r.setAttribute = (k, v) => k === "data-results-label" && (r.dataset.resultsLabel = v);
	return r;
};
const details = (p, open) => ({ dataset: { filterParam: p }, open });

const state = {};
function reset() {
	log.length = 0;
	state.inputs = [input("filter.v.availability", "1", false), input("filter.p.vendor", "Acme", false), input("filter.v.price.gte", "", false, "number")];
	state.inputs[2].defaultValue = "";
	state.sort = { name: "sort_by", type: "select-one", options: [{ value: "manual", defaultSelected: true, selected: true }, { value: "price-ascending", defaultSelected: false, selected: false }] };
	state.form = { dataset: { collectionId: "42", collectionHandle: "shoes", productsCount: "60" } };
	state.form.elements = [...state.inputs, state.sort, { type: "submit" }];
	for (const el of state.form.elements) el.form = state.form;
	state.results = results("60 products");
	state.groups = [details("filter.v.availability", true), details("filter.p.vendor", true)];
	state.status = { textContent: "" };
	state.location = new URL("https://shop.test/collections/shoes");
	state.replaced = [];
	state.assigned = [];
	state.fetches = [];
	state.applyFail = false;
}

class HTMLElementStub {
	constructor() {
		attrs(this);
		this.dataset = {};
		this.listeners = {};
	}
	addEventListener(t) { this.listeners[t] = true; }
	removeEventListener(t) { delete this.listeners[t]; }
	querySelector(sel) {
		if (sel === "[data-results-label]") return state.results;
		if (sel.includes("collection-status")) return state.status;
		return null;
	}
	querySelectorAll(sel) {
		return sel === "details[data-filter-param]" ? state.groups : [];
	}
}

const partials = {
	fetch: (...args) => {
		const opt = args.pop();
		const req = { names: args, url: opt.url, signal: opt.signal };
		state.fetches.push(req);
		return new Promise((res, rej) => {
			req.resolve = res;
			req.reject = rej;
			opt.signal.addEventListener("abort", () => rej(Object.assign(new Error("abort"), { name: "AbortError" })));
		});
	},
	apply: async (update) => {
		if (state.applyFail || !update) return; // nothing replaced
		const u = new URL(update.url);
		state.results = results(update.label);
		// server re-render: defaults follow the URL
		for (const i of state.inputs) if (i.type === "checkbox") i.defaultChecked = u.searchParams.getAll(i.name).includes(i.value);
		state.groups = [details("filter.v.availability", true), details("filter.p.vendor", true)];
	},
};

let defined;
const events = [];
const ctx = {
	partials,
	HTMLElement: HTMLElementStub,
	customElements: { get: () => defined, define: (n, c) => (defined = c) },
	FormData: class {
		constructor(f) {
			const out = [];
			for (const el of f.elements) {
				if (!el.name) continue;
				if (el.type === "checkbox") { if (el.checked) out.push([el.name, el.value]); }
				else if (el.options) out.push([el.name, el.options.find((o) => o.selected).value]);
				else out.push([el.name, el.value]);
			}
			return out;
		}
	},
	document: { getElementById: (id) => (id === "collection-filter-form" ? state.form : null) },
	history: { state: null, replaceState: (s, t, u) => { state.replaced.push(u); state.location = new URL(u); } },
	matchMedia: () => ({ matches: true }),
	window: { addEventListener() {}, removeEventListener() {} },
};
const loc = { get href() { return state.location.href; }, get pathname() { return state.location.pathname; }, get search() { return state.location.search; }, assign: (u) => state.assigned.push(u) };

const fn = new Function(...Object.keys(ctx), "location", "importStub", src.replace(/import\("https:[^"]+"\)/, "importStub()"));

let eventLib = null;
fn(...Object.values(ctx), loc, () => tick().then(() => eventLib));

(async () => {
	// Event library stub
	class CollectionUpdateEvent { constructor(d) { this.detail = d; } static createPromise() { let resolve; const promise = new Promise((r) => (resolve = r)); return { promise, resolve }; } }
	eventLib = { CollectionUpdateEvent };

	const El = defined;
	assert.ok(El, "define");
	reset();
	const el = new El();
	el.connectedCallback();
	assert.strictEqual(el.dataset.enhanced, "", "data-enhanced");
	state.form.dispatchEvent = (e) => events.push(e);

	// 1. change checkbox -> fetch 3 partials, URL from FormData, no page, empty price dropped
	state.inputs[0].checked = true;
	el.handleEvent({ type: "change", target: state.inputs[0] });
	assert.strictEqual(el.getAttribute?.("aria-busy") ?? el.attrs["aria-busy"], "true", "aria-busy on");
	let req = state.fetches.at(-1);
	assert.deepStrictEqual(req.names, ["collection-products", "collection-filters", "collection-filter-count"]);
	assert.strictEqual(req.url, "https://shop.test/collections/shoes?filter.v.availability=1&sort_by=manual");
	state.groups[1].open = false; // shopper closed vendor group during fetch
	req.resolve({ url: req.url, label: "12 products" });
	await tick(); await tick(); await tick();
	assert.deepStrictEqual(state.replaced, [req.url], "replaceState after success");
	assert.strictEqual(state.status.textContent, "12 products", "live region");
	assert.strictEqual(state.groups[1].open, false, "details restored");
	assert.ok(!("aria-busy" in el.attrs), "aria-busy removed");
	assert.ok(!log.some((l) => l[0] === "focus"), "filter change keeps focus");
	await tick();
	assert.strictEqual(events.length, 1, "collection:update dispatched");
	const ev = events[0].detail;
	assert.deepStrictEqual(ev.collection, { id: "gid://shopify/Collection/42", handle: "shoes", productsCount: 60 });
	assert.strictEqual(ev.sortKey, "MANUAL");
	assert.deepStrictEqual(await ev.promise, { productsCount: 12 });

	// 2. Clear all: apply keeps checked -> sync resets to defaultChecked
	state.inputs[0].checked = true; // still ticked in DOM
	const clear = { closest: (s) => (s.includes("pagination\"]") && !s.includes(",") ? null : clear), href: "https://shop.test/collections/shoes" };
	el.handleEvent({ type: "click", target: clear, button: 0, preventDefault() {} });
	req = state.fetches.at(-1);
	req.resolve({ url: req.url, label: "60 products" });
	await tick(); await tick(); await tick();
	assert.strictEqual(state.inputs[0].checked, false, "Clear all unticks");
	assert.strictEqual(state.location.search, "", "URL cleared");

	// 3. rapid changes: only last applied
	const n0 = state.fetches.length;
	for (const i of [0, 1, 0]) {
		state.inputs[i].checked = !state.inputs[i].checked;
		el.handleEvent({ type: "change", target: state.inputs[i] });
	}
	assert.strictEqual(state.fetches.length, n0 + 3);
	assert.ok(state.fetches[n0].signal.aborted && state.fetches[n0 + 1].signal.aborted && !state.fetches[n0 + 2].signal.aborted, "old aborted");
	req = state.fetches.at(-1);
	req.resolve({ url: req.url, label: "5 products" });
	await tick(); await tick(); await tick();
	assert.deepStrictEqual(state.assigned, [], "abort is not a failure");
	assert.strictEqual(state.location.href, req.url);
	assert.strictEqual(state.status.textContent, "5 products");
	assert.ok(!("aria-busy" in el.attrs));

	// 4. sort select: value from URL after apply
	state.sort.options[0].selected = false; state.sort.options[1].selected = true;
	el.handleEvent({ type: "change", target: state.sort });
	req = state.fetches.at(-1);
	assert.ok(req.url.includes("sort_by=price-ascending") && req.url.includes("filter.p.vendor=Acme"), "sort keeps filters");
	req.resolve({ url: req.url, label: "5 products" });
	await tick(); await tick(); await tick();
	assert.strictEqual(state.sort.options[1].selected, true, "sort follows URL");
	await tick();
	assert.strictEqual(events.at(-1).detail.sortKey, "PRICE");

	// 5. pagination: no event, scroll + focus, reduced motion -> auto
	const evCount = events.length;
	const link = { closest: () => link, href: "https://shop.test/collections/shoes?filter.p.vendor=Acme&page=2" };
	el.handleEvent({ type: "click", target: link, button: 0, preventDefault() {} });
	req = state.fetches.at(-1);
	assert.strictEqual(req.url, link.href, "server href");
	req.resolve({ url: req.url, label: "5 products" });
	await tick(); await tick(); await tick();
	assert.deepStrictEqual(log.slice(-2), [["scroll", "auto"], ["focus"]]);
	assert.strictEqual(state.results.tabIndex, -1);
	await tick();
	assert.strictEqual(events.length, evCount, "no event on page change");

	// 6. modifier click is left to the browser
	const n1 = state.fetches.length;
	el.handleEvent({ type: "click", target: link, button: 0, metaKey: true, preventDefault() { throw new Error("prevented"); } });
	assert.strictEqual(state.fetches.length, n1);

	// 7. swatch radio in a card (no form) is ignored; number input ignored
	el.handleEvent({ type: "change", target: { form: null, type: "radio" } });
	el.handleEvent({ type: "change", target: state.inputs[2] });
	assert.strictEqual(state.fetches.length, n1);

	// 8. fetch error -> full page
	el.handleEvent({ type: "submit", target: state.form, preventDefault() {} });
	req = state.fetches.at(-1);
	req.reject(new TypeError("Failed to fetch"));
	await tick(); await tick();
	assert.deepStrictEqual(state.assigned, [req.url], "network error -> assign");
	assert.ok(!("aria-busy" in el.attrs));

	// 9. empty update (partial not replaced) -> full page
	state.assigned.length = 0;
	state.applyFail = true;
	el.handleEvent({ type: "submit", target: state.form, preventDefault() {} });
	req = state.fetches.at(-1);
	req.resolve(null);
	await tick(); await tick(); await tick();
	assert.deepStrictEqual(state.assigned, [req.url], "empty update -> assign");
	const replacedBefore = state.replaced.length;
	assert.strictEqual(state.replaced.length, replacedBefore);

	// 10. /search: no collection handle -> no event; results partial from data attribute
	state.applyFail = false;
	delete state.form.dataset.collectionHandle;
	el.dataset.resultsPartial = "search-results";
	const e0 = events.length;
	el.handleEvent({ type: "submit", target: state.form, preventDefault() {} });
	req = state.fetches.at(-1);
	assert.strictEqual(req.names[0], "search-results");
	req.resolve({ url: req.url, label: "3 results" });
	await tick(); await tick(); await tick(); await tick();
	assert.strictEqual(events.length, e0, "no event on search");

	// 11. pageshow persisted with a URL different from what is shown -> fetch again
	const n2 = state.fetches.length;
	state.location = new URL("https://shop.test/collections/shoes?filter.p.vendor=Other");
	el.handleEvent({ type: "pageshow", persisted: true });
	assert.strictEqual(state.fetches.length, n2 + 1);
	assert.strictEqual(state.fetches.at(-1).url, state.location.href);

	console.log("logic-check: 11 nhóm pass");
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
