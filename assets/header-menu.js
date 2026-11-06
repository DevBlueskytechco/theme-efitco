/*
 * Tăng cường menu header. Markup là <details> nên chạy đủ khi không có JS;
 * file này chỉ thêm hover, Esc, focusout, aria-expanded và focus trap drawer.
 *
 * - <header-menu>: dropdown desktop (data-testid="header-menu").
 * - <header-drawer>: drawer mobile (data-testid="header-drawer").
 *
 * Markup header không có thẻ custom element, nên mount() gắn 2 phần tử ẩn vào
 * header làm bộ điều khiển. Không bọc lại DOM để giữ selector
 * .block-container:has(> .site-header) trong critical.css.
 */
const HOVER_DELAY = 150;
const DESKTOP_QUERY = "(min-width: 80rem)";

const summaryOf = (details) => details.querySelector(":scope > summary");

function syncExpanded(details) {
  summaryOf(details)?.setAttribute("aria-expanded", String(details.open));
}

/* Trả focus về summary trước khi đóng để focus không rơi về body. */
function closeDetails(details) {
  if (details.contains(document.activeElement)) {
    summaryOf(details)?.focus();
  }
  details.open = false;
}

class HeaderMenu extends HTMLElement {
  #abort;
  #menus = [];
  #timer;

  connectedCallback() {
    this.hidden = true;
    const header = this.closest('[data-testid="header"]');
    const nav = header?.querySelector('[data-testid="header-menu"]');
    if (!nav) {
      return;
    }

    this.#abort = new AbortController();
    const { signal } = this.#abort;
    this.#menus = [...nav.querySelectorAll("details")];
    this.#menus.forEach(syncExpanded);

    /* toggle không bubble, phải bắt ở pha capture. */
    nav.addEventListener("toggle", (event) => this.#onToggle(event.target), {
      capture: true,
      signal,
    });
    nav.addEventListener("focusout", (event) => this.#onFocusOut(event), { signal });
    document.addEventListener("keydown", (event) => this.#onKeydown(event), { signal });

    for (const item of nav.querySelectorAll('[data-testid="header-menu-item"]')) {
      item.addEventListener(
        "pointerenter",
        (event) => this.#onHover(event, item.querySelector("details")),
        { signal },
      );
    }
    header.addEventListener("pointerleave", (event) => this.#onHover(event, null), { signal });
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
    this.#abort?.abort();
  }

  #onToggle(details) {
    syncExpanded(details);
    if (details.open) {
      this.#menus.filter((menu) => menu !== details && menu.open).forEach(closeDetails);
    }
  }

  /*
   * Chỉ chuột: trên cảm ứng pointerenter chạy ngay trước click, nếu mở ở đây
   * thì click sẽ đóng lại. target null là rời mục có dropdown.
   */
  #onHover(event, target) {
    if (event.pointerType !== "mouse") {
      return;
    }
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      if (target) {
        target.open = true;
      } else {
        this.#closeUnlessKeyboard();
      }
    }, HOVER_DELAY);
  }

  /* Người dùng bàn phím đang ở trong dropdown thì rê chuột không đóng. */
  #closeUnlessKeyboard() {
    this.#menus
      .filter((menu) => menu.open && !menu.querySelector(":focus-visible"))
      .forEach(closeDetails);
  }

  #onFocusOut({ target, relatedTarget }) {
    const details = target.closest("details");
    if (!details?.open || details.contains(relatedTarget) || !document.hasFocus()) {
      return;
    }
    /*
     * relatedTarget null khi bấm vào vùng không focus được trong dropdown,
     * hoặc khi Safari không focus link/summary lúc click.
     */
    if (!relatedTarget && details.matches(":hover")) {
      return;
    }
    details.open = false;
  }

  #onKeydown(event) {
    if (event.key !== "Escape") {
      return;
    }
    clearTimeout(this.#timer);
    this.#menus.filter((menu) => menu.open).forEach(closeDetails);
  }
}

class HeaderDrawer extends HTMLElement {
  #abort;
  #close;
  #panel;
  #root;
  #toggle;

  connectedCallback() {
    this.hidden = true;
    const header = this.closest('[data-testid="header"]');
    this.#toggle = header?.querySelector('[data-testid="header-drawer-toggle"]');
    this.#panel = header?.querySelector('[data-testid="header-drawer"]');
    this.#close = header?.querySelector('[data-testid="header-drawer-close"]');
    this.#root = this.#toggle?.closest("details");
    if (!this.#root || !this.#panel || !this.#close) {
      return;
    }

    this.#abort = new AbortController();
    const { signal } = this.#abort;
    this.#root.querySelectorAll("details").forEach(syncExpanded);
    syncExpanded(this.#root);

    this.#root.addEventListener("toggle", (event) => this.#onToggle(event.target), {
      capture: true,
      signal,
    });
    this.#close.addEventListener("click", () => this.#dismiss(), { signal });
    document.addEventListener("keydown", (event) => this.#onKeydown(event), { signal });

    const desktop = window.matchMedia(DESKTOP_QUERY);
    desktop.addEventListener(
      "change",
      (event) => {
        if (event.matches) {
          this.#dismiss();
        }
      },
      { signal },
    );
  }

  disconnectedCallback() {
    this.#abort?.abort();
  }

  #dismiss() {
    this.#root.open = false;
  }

  /* Gồm cả accordion lồng; đóng bằng cách nào cũng trả focus về toggle ở đây. */
  #onToggle(details) {
    syncExpanded(details);
    if (details === this.#root) {
      (details.open ? this.#close : this.#toggle).focus();
    }
  }

  #onKeydown(event) {
    if (!this.#root.open) {
      return;
    }
    if (event.key === "Escape") {
      this.#dismiss();
    } else if (event.key === "Tab") {
      this.#trapFocus(event);
    }
  }

  #trapFocus(event) {
    const focusable = this.#focusable();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    const edge = event.shiftKey ? first : last;

    if (active === edge || !this.#panel.contains(active)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }

  /*
   * Bỏ phần tử trong accordion đang đóng. Summary của accordion luôn hiện dù
   * details cha của nó đóng, nên xét từ phần tử ngoài details đó.
   */
  #focusable() {
    return [...this.#panel.querySelectorAll("a[href], button, summary")].filter((element) => {
      const scope = element.matches("summary") ? element.parentElement.parentElement : element;
      return !scope.closest("details:not([open])");
    });
  }
}

function mount(tag, element) {
  if (!customElements.get(tag)) {
    customElements.define(tag, element);
  }
  const header = document.querySelector('[data-testid="header"]');
  if (header && !header.querySelector(tag)) {
    header.append(document.createElement(tag));
  }
}

mount("header-menu", HeaderMenu);
mount("header-drawer", HeaderDrawer);
