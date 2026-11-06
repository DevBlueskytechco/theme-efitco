// Bản giả của https://cdn.shopify.com/storefront/standard-events.js, chỉ có phần theme dùng. Shape cart tự đặt.
export const STANDARD_EVENTS = `export class CartLinesUpdateEvent extends Event {
  constructor({ action, context, lines, promise }) { super('shopify:cart:lines-update', { bubbles: true, composed: true }); Object.assign(this, { action, context, lines, promise }); }
  static createPromise() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
  static createCartFromAjaxResponse(cart) { return { totalQuantity: cart.item_count, lines: cart.items }; }
}
export const createViewEventElement = () => class extends HTMLElement {};`;
