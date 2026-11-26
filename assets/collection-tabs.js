// Links become a tablist, each template clones once, no fetch (ES1-T189).
customElements.define("collection-tabs", class extends HTMLElement {
	connectedCallback() {
		const list = this.querySelector("[data-tab-list]");
		list.role = "tablist";
		this.tabs = [...list.children];
		for (const t of this.tabs) {
			const p = this.panel(t);
			t.id = p.id + "-tab";
			t.role = "tab";
			t.ariaCurrent = null;
			t.setAttribute("aria-controls", p.id);
			p.role = "tabpanel";
			p.setAttribute("aria-labelledby", t.id);
		}
		this.select(this.tabs[0]);
		list.onclick = list.onkeydown = e => this.on(e);
	}

	panel(t) {
		return this.querySelector(`[data-tab-panel="${t.dataset.tab}"]`);
	}

	select(tab) {
		const p = this.panel(tab);
		const c = p.querySelector("[data-tab-panel-template]");
		c?.replaceWith(c.content.cloneNode(true));
		if (p.querySelector("[data-tab-empty]")) p.tabIndex = 0;
		for (const t of this.tabs) {
			t.ariaSelected = t === tab;
			t.tabIndex = t === tab ? 0 : -1;
			this.panel(t).hidden = t !== tab;
		}
	}

	on(e) {
		const t = e.target.closest("[data-tab]");
		// Modifier: native link, browser keys.
		if (!t || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
		if (e.type == "click") return e.preventDefault(), this.select(t);
		// Arrows follow text direction: RTL ArrowLeft = next tab (ES1-T557)
		const a = this.tabs, i = a.indexOf(t), d = this.matches(":dir(rtl)") ? -1 : 1;
		const to = { ArrowRight: i + d, ArrowLeft: i - d, Home: 0, End: -1, " ": i }[e.key];
		if (to == null) return;
		e.preventDefault();
		const next = a.at(to % a.length);
		this.select(next);
		next.focus();
	}
});
