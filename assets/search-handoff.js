// 404 search hand-off (ES1-T496, TE-21 AC7, docs/ui-spec/404.md §5 "typing"): 2+ trimmed
// characters in form[data-search-handoff] [name="q"] copy the value into #PredictiveSearchInput,
// open the header layer <modal-dialog data-layer="search"> with the 404 input as opener (focus
// comes back here on close), then import predictive-search.js from data-search-handoff
// (asset_url, ES1-T485). It reads the value on connect or modal:open.
// No layer, or modal-dialog.js not defined: nothing, the form stays a GET to the search page.
// Delegated on document: the block re-renders in the theme editor. Never focuses on load.
const handoff = (e) => {
  const input = e.target;
  const form = input.form;
  if (e.isComposing || input.name != "q" || !form?.dataset.searchHandoff) return;
  const value = input.value;
  const layer = document.querySelector('modal-dialog[data-layer="search"]');
  const field = layer?.querySelector("#PredictiveSearchInput");
  // Already open: Safari fires input again after compositionend
  if (value.trim().length < 2 || !field || typeof layer.open != "function" || field.closest("dialog")?.open) return;
  field.value = value;
  layer.open(input);
  field.setSelectionRange?.(value.length, value.length);
  import(form.dataset.searchHandoff).catch(() => {});
};

// IME (Vietnamese Telex, CJK): wait for the composed text
addEventListener("input", handoff);
addEventListener("compositionend", handoff);
