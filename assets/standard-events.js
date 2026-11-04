/**
 * ES1-T81: Standard storefront events library, loaded once from layout.
 * https://shopify.dev/docs/api/storefront-events-and-actions/events (Loading the library):
 * no theme import map (would shadow Shopify's map for @shopify/partial-rendering),
 * so import the CDN URL directly. Same URL in every module = one library instance.
 * Registers <s-view-event> (shopify:product:view, FE ES1-T76).
 */
export const STANDARD_EVENTS_URL = "https://cdn.shopify.com/storefront/standard-events.js";

let lib;
export const loadStandardEvents = () => (lib ||= import(STANDARD_EVENTS_URL).catch(() => null));

loadStandardEvents().then((m) => {
  if (typeof m?.createViewEventElement !== "function" || customElements.get("s-view-event")) return;
  try {
    customElements.define("s-view-event", m.createViewEventElement());
  } catch {
    // Defined meanwhile by the library itself.
  }
});
