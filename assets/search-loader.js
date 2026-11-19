addEventListener("click", e => {
	const a = e.target.closest?.("[data-search-src]"), m = a?.nextElementSibling;
	if (!m?.open || e.ctrlKey || e.metaKey || e.shiftKey) return;
	e.preventDefault(); m.open(a);
	import(a.dataset.searchSrc).catch(() => {});
});