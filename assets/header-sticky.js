/*
 * Theo dõi sentinel 80px đầu trang: cuộn quá 80px thì gắn data-scrolled lên
 * header, quay lại thì bỏ. Transition do CSS, đã tôn trọng prefers-reduced-motion.
 *
 * data-header-enhanced bật sticky cho header trong suốt trên hero. Không có
 * file này thì header đó không sticky, nên không có chữ trắng trên nền trắng.
 *
 * Sentinel luôn có trong layout/theme.liquid, nên phải xét data-sticky để
 * không chạy khi setting sticky_header tắt. Không có thẻ <sticky-header> trong
 * markup, mount cuối file gắn phần tử ẩn vào header.
 */
class StickyHeader extends HTMLElement {
  #header;
  #observer;

  connectedCallback() {
    this.hidden = true;
    const header = this.closest('[data-testid="header"]');
    const sentinel = document.querySelector('[data-testid="header-sticky-sentinel"]');
    if (!header?.hasAttribute("data-sticky") || !sentinel) {
      return;
    }

    this.#header = header;
    header.setAttribute("data-header-enhanced", "");
    this.#observer = new IntersectionObserver(([entry]) => {
      header.toggleAttribute("data-scrolled", !entry.isIntersecting);
    });
    this.#observer.observe(sentinel);
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#header?.removeAttribute("data-header-enhanced");
    this.#header?.removeAttribute("data-scrolled");
  }
}

if (!customElements.get("sticky-header")) {
  customElements.define("sticky-header", StickyHeader);
}

const header = document.querySelector('[data-testid="header"]');
if (header && !header.querySelector("sticky-header")) {
  header.append(document.createElement("sticky-header"));
}
