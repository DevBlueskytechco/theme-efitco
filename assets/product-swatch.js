/**
 * <product-swatch>: root element of snippets/product-card.liquid (TE-3 AC2, AC8).
 *
 * Choosing a color swatch swaps the card image, every product link (?variant=)
 * the sale / sold out badge and, when the price varies, the price markup. All data is rendered by Liquid
 * on data-* hooks, so there is no fetch and no partial. The page never reloads
 * and the page URL never changes.
 *
 * Hooks (contract with FE, ES1-T50):
 * - swatch radio: data-variant-id, data-variant-url, data-image-src,
 *   data-image-srcset, data-image-alt
 * - img[data-card-image], a[data-card-link], [data-card-price]
 * - template[data-price-for="<variant id>"]: price markup for that variant
 * - swatch radio data-badge (sale | sold_out | none), data-badge-label;
 *   [data-card-badge] gets data-badge, text, hidden and data-testid (ES1-T56)
 *
 * Keyboard is the native radio group (Tab in, arrows move, Space selects): no
 * roving tabindex, and nothing here moves focus. Without JS the radios still
 * toggle and the links keep the card's default variant.
 */

const SWATCH = 'input[type="radio"][data-variant-id]';
const BADGE_TESTID = { sale: 'product-card-badge-sale', sold_out: 'product-card-badge-sold-out' };

class ProductSwatch extends HTMLElement {
  connectedCallback() {
    // One delegated listener per card. Re-adding the same handler object is a
    // no-op, so moving the card in the DOM never doubles it.
    this.addEventListener('change', this);
    this.addEventListener('pointerover', this);
    this.addEventListener('pointerout', this);

    // Back/forward and reload restore form state without a change event, and
    // the browser may do it after this callback runs (ES1-T73). pageshow fires
    // after that restore on a fresh load (after load) and on a bfcache
    // restore (persisted), so sync again there.
    window.addEventListener('pageshow', this);
    this.sync();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this);
    window.removeEventListener('pageshow', this);
  }

  /** @param {Event} event */
  handleEvent(event) {
    if (event.type === 'pageshow') {
      this.sync();
      return;
    }
    if (event.type === 'pointerover' || event.type === 'pointerout') {
      this.preview(event);
      return;
    }
    const input = event.target;
    if (input instanceof HTMLInputElement && input.checked && input.matches(SWATCH)) {
      this.select(input);
    }
  }

  /** Mouse over a swatch shows its image; leaving goes back to the checked swatch. */
  preview(event) {
    if (event.pointerType !== 'mouse') return;
    const label = event.target.closest?.('.product-card__swatch');
    if (!label) return;
    const hovered = this.querySelector(`#${CSS.escape(label.htmlFor)}`);
    const input = event.type === 'pointerover' ? hovered : this.querySelector(`${SWATCH}:checked`);
    const image = this.querySelector('img[data-card-image]');
    if (!image || !input?.dataset.imageSrc) return;
    image.srcset = input.dataset.imageSrcset ?? '';
    image.src = input.dataset.imageSrc;
  }

  /**
   * A restored form can leave a non-default swatch checked: bring the image,
   * links, price and badge in line with it. The default swatch already
   * matches the Liquid output, so nothing to do then.
   */
  sync() {
    const checked = this.querySelector(`${SWATCH}:checked`);
    if (checked instanceof HTMLInputElement && !checked.defaultChecked) {
      this.select(checked);
    }
  }

  /** @param {HTMLInputElement} input */
  select(input) {
    const { variantId, variantUrl, imageSrc, imageSrcset, imageAlt } = input.dataset;

    this.swapImage(imageSrc, imageSrcset, imageAlt);

    if (variantUrl) {
      for (const link of this.querySelectorAll('a[data-card-link]')) {
        link.setAttribute('href', variantUrl);
      }
    }

    this.swapPrice(variantId);
    this.swapBadge(input.dataset.badge, input.dataset.badgeLabel);
  }

  /**
   * Badge follows the chosen variant (ES1-T57). CSS styles from data-badge,
   * so no class change. A radio without data-badge keeps the current badge.
   * @param {string | undefined} badge sale | sold_out | none
   * @param {string | undefined} label translated text, empty for none
   */
  swapBadge(badge, label) {
    const el = this.querySelector('[data-card-badge]');
    if (!(el instanceof HTMLElement) || !badge) return;

    const none = badge !== 'sale' && badge !== 'sold_out';
    el.dataset.badge = none ? 'none' : badge;
    el.dataset.testid = none ? 'product-card-badge' : BADGE_TESTID[badge];
    el.textContent = none ? '' : label || '';
    el.hidden = none;
  }

  /**
   * Empty src keeps the current image. srcset goes first so the browser does
   * not fetch the 1080w src before it can pick a smaller candidate. width and
   * height stay untouched: the box keeps its size, no layout shift.
   * @param {string | undefined} src
   * @param {string | undefined} srcset
   * @param {string | undefined} alt
   */
  swapImage(src, srcset, alt) {
    const image = this.querySelector('img[data-card-image]');
    if (!(image instanceof HTMLImageElement) || !src) return;
    if (image.getAttribute('src') === src) return;

    if (srcset) {
      image.srcset = srcset;
    } else {
      image.removeAttribute('srcset');
    }
    image.src = src;
    if (alt !== undefined) image.alt = alt;
  }

  /** @param {string | undefined} variantId */
  swapPrice(variantId) {
    if (!variantId) return;

    const price = this.querySelector('[data-card-price]');
    const template = this.querySelector(`template[data-price-for="${CSS.escape(variantId)}"]`);
    if (!price || !(template instanceof HTMLTemplateElement)) return;

    price.replaceChildren(template.content.cloneNode(true));
  }
}

if (!customElements.get('product-swatch')) {
  customElements.define('product-swatch', ProductSwatch);
}
