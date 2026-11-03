/**
 * <product-swatch>: root element of snippets/product-card.liquid (TE-3 AC2, AC8).
 *
 * Choosing a color swatch swaps the card image, every product link (?variant=)
 * and, when the price varies, the price markup. All data is rendered by Liquid
 * on data-* hooks, so there is no fetch and no partial. The page never reloads
 * and the page URL never changes.
 *
 * Hooks (contract with FE, ES1-T50):
 * - swatch radio: data-variant-id, data-variant-url, data-image-src,
 *   data-image-srcset, data-image-alt
 * - img[data-card-image], a[data-card-link], [data-card-price]
 * - template[data-price-for="<variant id>"]: price markup for that variant
 *
 * Keyboard is the native radio group (Tab in, arrows move, Space selects): no
 * roving tabindex, and nothing here moves focus. Without JS the radios still
 * toggle and the links keep the card's default variant.
 */

const SWATCH = 'input[type="radio"][data-variant-id]';

class ProductSwatch extends HTMLElement {
  connectedCallback() {
    // One delegated listener per card. Re-adding the same handler object is a
    // no-op, so moving the card in the DOM never doubles it.
    this.addEventListener('change', this);

    // Back/forward form restore can leave a non-default swatch checked: bring
    // the image, links and price in line with it.
    const checked = this.querySelector(`${SWATCH}:checked`);
    if (checked instanceof HTMLInputElement && !checked.defaultChecked) {
      this.select(checked);
    }
  }

  disconnectedCallback() {
    this.removeEventListener('change', this);
  }

  /** @param {Event} event */
  handleEvent(event) {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.checked && input.matches(SWATCH)) {
      this.select(input);
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
