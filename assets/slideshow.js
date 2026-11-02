/*
 * Carousel trên track scroll-snap: chuyển slide bằng track.scrollTo, vuốt để
 * trình duyệt lo. Slide đang hiện lấy từ IntersectionObserver nên nút, chấm,
 * vuốt đi chung một đường, không cần touch listener hay scroll listener.
 * Hook: xem {% doc %} của blocks/slideshow.liquid.
 */
const VISIBLE_RATIO = 0.6;
const ANNOUNCE_DELAY = 300; // chấm 1 → 5 chỉ báo slide cuối, không báo slide lướt qua
const DEFAULT_SPEED = 5;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
  #hasPauseButton = false;

  // Pause là ý người dùng; các cờ còn lại chỉ tạm giữ, không đổi icon nút
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
    this.#hasPauseButton = this.#hasAutoplay || this.#videos.length > 0;

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

  // Gỡ hết để connect lại (editor render lại block) không nhân đôi chấm
  disconnectedCallback() {
    this.#abort?.abort();
    this.#slideObserver?.disconnect();
    this.#viewportObserver?.disconnect();
    this.#stopTimer();
    clearTimeout(this.#announceTimer);

    this.#track?.setAttribute("tabindex", "0");
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

    // Chỉ chuột: chạm sinh mouseenter giả, không có leave nên autoplay kẹt
    const hover = (hovered) => (event) => {
      if (event.pointerType === "mouse") {
        this.#hovered = hovered;
        this.#syncAutoplay();
      }
    };
    on(this, "pointerenter", hover(true));
    on(this, "pointerleave", hover(false));

    // :focus-visible: click chuột để lại focus trên nút, autoplay sẽ không chạy lại
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
          this.#stopTimer(); // tính lại từ đầu: vừa vuốt xong không bị tick đẩy đi tiếp
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
    // Tính theo rect để đúng cả RTL, nơi scrollLeft âm
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

  #setPaused(paused) {
    this.#paused = paused;
    if (this.#hasPauseButton) {
      this.dataset.playing = String(!paused);
      const label = paused ? this.dataset.labelPlay : this.dataset.labelPause;
      this.#pauseButton?.setAttribute("aria-label", label ?? "");
    }
    this.#videos.forEach((video) => {
      if (paused) {
        video.pause();
      } else {
        // Tiết kiệm pin có thể từ chối play(); poster vẫn hiện, không cần báo lỗi
        video.play()?.catch(() => {});
      }
    });
    this.#syncAutoplay();
  }

  #syncAutoplay() {
    const running =
      this.#hasAutoplay &&
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
