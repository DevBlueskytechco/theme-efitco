/*
 * Tăng cường menu header. Markup là <details> nên chạy đủ khi không có JS;
 * file này chỉ thêm hover, Esc, focusout, aria-expanded.
 *
 * - <header-menu>: dropdown desktop (data-testid="header-menu").
 * - <header-drawer>: drawer mobile (data-testid="header-drawer") ở assets/header-drawer.js,
 *   nạp lười lần đầu chạm/focus nút menu (ADR 0010, TE-1-R2-BE1); không thêm thẻ script.
 *
 * Host <header-menu>, <header-drawer> có sẵn trong markup (ES1-T22); mount() chỉ gắn khi thiếu.
 * Không bọc lại DOM để giữ selector .block-container:has(> .site-header) trong critical.css.
 */
const HOVER_DELAY = 150;

const summaryOf = (details) => details.querySelector(":scope > summary");

/* Lỗi mạng: bỏ promise để lần chạm sau thử lại; drawer vẫn mở bằng <details>. */
let drawerModule;
const loadDrawer = () => {
  drawerModule ||= import(new URL("header-drawer.js", import.meta.url)).catch(() => (drawerModule = null));
};

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
    this.#abort = new AbortController();
    const { signal } = this.#abort;

    /* Drawer: aria-expanded có ngay lúc tải, trước khi header-drawer.js về. */
    const toggle = header?.querySelector('[data-testid="header-drawer-toggle"]');
    const drawer = toggle?.closest("details");
    if (drawer) {
      [drawer, ...drawer.querySelectorAll("details")].forEach(syncExpanded);
      for (const type of ["pointerenter", "focusin", "touchstart"]) {
        toggle.addEventListener(type, loadDrawer, { passive: true, signal });
      }
    }
    if (!nav) {
      return;
    }

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
