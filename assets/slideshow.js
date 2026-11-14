/*
 * Track scroll-snap; slide hiện lấy từ IntersectionObserver nên nút, chấm,
 * vuốt chung một đường. Hook: {% doc %} blocks/slideshow.liquid.
 * Autoplay chỉ từ 80rem (TE-2 AC8).
 */
const VISIBLE_RATIO = 0.6;
const ANNOUNCE_DELAY = 300;
const DEFAULT_SPEED = 5;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const wide = window.matchMedia("(min-width: 80rem)");

class SlideshowCarousel extends HTMLElement {
  #abort;
  #slideObserver;
  #viewportObserver;
  #timer = null;
  #announceTimer = null;

  #track;
  #live;
  #pauseButton;
  #slides = [];
  #dots = [];
  #videos = [];
  #active = 0;
  #hasAutoplay = false;

  #paused = false;
  #hovered = false;
  #focused = false;
  #inViewport = false;

  connectedCallback() {
    this.#track = this.#part("track");
    if (!this.#track) {
      return;
    }

    this.#abort = new AbortController();
    this.#live = this.#part("live");
    this.#pauseButton = this.#part("pause");
    this.#slides = [...this.querySelectorAll('[data-testid="slideshow-slide"]')];
    this.#videos = [...this.querySelectorAll("video")];

    const multiple = this.#slides.length > 1;
    this.#hasAutoplay = multiple && this.dataset.autoplay === "true";

    this.#slides.forEach((slide, index) => {
      slide.setAttribute("aria-label", this.#slideLabel(index));
    });
    if (multiple) {
      this.#renderDots();
    }
    this.#setActive(0);
    this.#listen();
    this.#observe();

    this.#track.removeAttribute("tabindex");
    this.toggleAttribute("data-multiple", multiple);
    this.toggleAttribute("data-enhanced", true);
    this.#setPaused(reducedMotion.matches);
  }

  disconnectedCallback() {
    this.#abort?.abort();
    this.#slideObserver?.disconnect();
    this.#viewportObserver?.disconnect();
    this.#stopTimer();
    clearTimeout(this.#announceTimer);

    this.#track?.setAttribute("tabindex", "0");
    this.#pauseButton?.removeAttribute("disabled");
    this.#dots.forEach((dot) => dot.remove());
    this.#dots = [];
    this.#slides.forEach((slide) => {
      slide.inert = false;
    });
    this.#active = 0;
    this.#hovered = this.#focused = this.#inViewport = false;
    ["data-enhanced", "data-multiple", "data-playing"].forEach((name) => this.removeAttribute(name));
  }

  #part(name) {
    return this.querySelector(`[data-testid="slideshow-${name}"]`);
  }

  #slideLabel(index) {
    return (this.dataset.labelSlide ?? "")
      .replace("[index]", index + 1)
      .replace("[total]", this.#slides.length);
  }

  #renderDots() {
    const root = this.#part("dots");
    const dot = root.querySelector("template").content.firstElementChild;
    this.#dots = this.#slides.map((_, index) => {
      const clone = dot.cloneNode(true);
      clone.setAttribute("aria-label", (this.dataset.labelDot ?? "").replace("[index]", index + 1));
      clone.addEventListener("click", () => this.#goTo(index), { signal: this.#abort.signal });
      return clone;
    });
    root.append(...this.#dots);
  }

  #listen() {
    const on = (target, type, handler) =>
      target?.addEventListener(type, handler, { signal: this.#abort.signal });

    on(this.#part("prev"), "click", () => this.#goTo(this.#active - 1));
    on(this.#part("next"), "click", () => this.#goTo(this.#active + 1));
    on(this.#pauseButton, "click", () => this.#setPaused(!this.#paused));

    // Chạm sinh enter giả không có leave
    const hover = (hovered) => (event) => {
      if (event.pointerType === "mouse") {
        this.#hovered = hovered;
        this.#syncAutoplay();
      }
    };
    on(this, "pointerenter", hover(true));
    on(this, "pointerleave", hover(false));

    // Click chuột để lại focus trên nút
    on(this, "focusin", (event) => {
      this.#focused = event.target.matches(":focus-visible");
      this.#syncAutoplay();
    });
    on(this, "focusout", (event) => {
      if (!this.contains(event.relatedTarget)) {
        this.#focused = false;
        this.#syncAutoplay();
      }
    });

    on(document, "visibilitychange", () => this.#syncAutoplay());
    on(wide, "change", () => this.#setPaused(this.#paused));
    on(reducedMotion, "change", () => {
      if (reducedMotion.matches) {
        this.#setPaused(true);
      }
    });
    on(this, "shopify:block:select", (event) => {
      const index = this.#slides.findIndex((slide) => slide.contains(event.target));
      if (index !== -1) {
        this.#goTo(index);
      }
    });
  }

  #observe() {
    this.#slideObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries.find(({ intersectionRatio }) => intersectionRatio >= VISIBLE_RATIO);
        const index = entry ? this.#slides.indexOf(entry.target) : this.#active;
        if (index !== this.#active) {
          this.#setActive(index);
          this.#announce();
          this.#stopTimer(); // vừa vuốt xong không bị tick đẩy đi tiếp
          this.#syncAutoplay();
        }
      },
      { root: this.#track, threshold: VISIBLE_RATIO },
    );
    this.#slides.forEach((slide) => this.#slideObserver.observe(slide));

    this.#viewportObserver = new IntersectionObserver(([entry]) => {
      this.#inViewport = entry.isIntersecting;
      this.#syncAutoplay();
    });
    this.#viewportObserver.observe(this);
  }

  #setActive(index) {
    this.#active = index;
    this.#slides.forEach((slide, i) => {
      slide.inert = i !== index;
    });
    this.#dots.forEach((dot, i) => {
      if (i === index) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  #goTo(index) {
    const total = this.#slides.length;
    const slide = this.#slides[(index + total) % total];
    // Theo rect để đúng cả RTL, nơi scrollLeft âm
    const offset = slide.getBoundingClientRect().left - this.#track.getBoundingClientRect().left;
    this.#track.scrollTo({
      left: this.#track.scrollLeft + offset,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  }

  #announce() {
    clearTimeout(this.#announceTimer);
    this.#announceTimer = setTimeout(() => {
      if (this.#live) {
        this.#live.textContent = this.#slideLabel(this.#active);
      }
    }, ANNOUNCE_DELAY);
  }

  #canAutoplay() {
    return this.#hasAutoplay && wide.matches;
  }

  // Dưới 80rem không video: nút không điều khiển gì nên disabled
  #setPaused(paused) {
    this.#paused = paused;
    const active = this.#canAutoplay() || this.#videos.length > 0;
    if (active) {
      this.dataset.playing = String(!paused);
    } else {
      this.removeAttribute("data-playing");
    }
    const label = paused || !active ? this.dataset.labelPlay : this.dataset.labelPause;
    this.#pauseButton?.setAttribute("aria-label", label ?? "");
    this.#pauseButton?.toggleAttribute("disabled", !active);
    this.#videos.forEach((video) => {
      if (paused) {
        video.pause();
      } else {
        // Tiết kiệm pin có thể từ chối play(); poster vẫn hiện
        video.play()?.catch(() => {});
      }
    });
    this.#syncAutoplay();
  }

  #syncAutoplay() {
    const running =
      this.#canAutoplay() &&
      !this.#paused &&
      !this.#hovered &&
      !this.#focused &&
      this.#inViewport &&
      !document.hidden &&
      !window.Shopify?.designMode;

    if (!running) {
      this.#stopTimer();
    } else if (this.#timer === null) {
      const seconds = Number(this.dataset.autoplaySpeed) || DEFAULT_SPEED;
      this.#timer = setInterval(() => this.#goTo(this.#active + 1), seconds * 1000);
    }
    this.#live?.setAttribute("aria-live", running ? "off" : "polite");
  }

  #stopTimer() {
    clearInterval(this.#timer);
    this.#timer = null;
  }
}

if (!customElements.get("slideshow-carousel")) {
  customElements.define("slideshow-carousel", SlideshowCarousel);
}
