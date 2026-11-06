// <quiz-finder> TE-11 (ES1-T139). No module or failed request: the GET form goes to search.
import { partials } from "@shopify/partial-rendering";

const OPTION = "input[data-tag-handle]";
const CHECKED = `${OPTION}:checked`;
const TITLE = "[data-quiz-title]";

class QuizFinder extends HTMLElement {
  connectedCallback() {
    const $ = (s) => this.querySelector(s);
    this.form = $("form");
    this.steps = [...this.querySelectorAll("[data-quiz-step]")];
    if (!this.steps[0]) return;
    this.back = $("[data-quiz-back]");
    this.status = $("[data-quiz-status]");
    this.panel = $("[data-quiz-results-panel]");
    this.empty = $("[data-quiz-empty]");
    this.steps.forEach((s, i) => {
      for (const o of s.querySelectorAll(OPTION)) {
        o.dataset.name ??= o.name;
        // Name first: same-name radios uncheck each other.
        o.name = `quiz-step-${i}`;
        o.type = "radio";
      }
    });
    const open = this.steps.findIndex((s) => !s.querySelector(CHECKED));
    const i = open < 0 ? this.steps.length - 1 : open;
    const f = document.activeElement;
    this.show(i, this.form.contains(f) && !this.steps[i].contains(f));
    this.setAttribute("data-enhanced", "");
    for (const type of ["click", "keydown"]) this.form.addEventListener(type, this);
  }

  handleEvent(e) {
    const t = e.target;
    const isOption = t.matches(OPTION);
    if (e.type === "keydown") {
      if (!isOption) return;
      if (/^Arrow/.test(e.key)) this.arrow = true;
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // Enter would submit.
        if (e.repeat) return;
        t.checked = true;
        this.next();
      }
    } else if (t.closest("[data-quiz-back]")) {
      this.ac?.abort();
      this.clear();
      this.show(this.index - 1);
    } else if (e.detail > 1 && t.closest("label")) {
      e.preventDefault(); // Double click: 2nd hits the next step.
    } else if (isOption) {
      // Label click detail varies by browser; only arrow keys stay (WCAG 3.2.2).
      if (!this.arrow) this.next();
      this.arrow = false;
    }
  }

  next() {
    if (this.steps[this.index + 1]) this.show(this.index + 1);
    else this.finish();
  }

  show(index, focus = true) {
    this.index = index;
    this.steps.forEach((s, i) => s.toggleAttribute("data-active", i === index));
    this.back.hidden = !index;
    if (!focus) return;
    const s = this.steps[index];
    s.querySelector(TITLE).focus();
    this.status.textContent = s.querySelector(".quiz-step__count").textContent;
  }

  root() {
    return this.panel.querySelector("[data-quiz-count]");
  }

  clear() {
    this.panel.hidden = this.empty.hidden = true;
    this.root().replaceChildren();
    this.root().setAttribute("data-quiz-count", 0);
  }

  async finish() {
    this.ac?.abort();
    const ac = (this.ac = new AbortController());
    const { resultsUrl, resultsView, labelResults } = this.dataset;
    const tags = [...this.form.querySelectorAll(CHECKED)].map((o) => o.dataset.tagHandle);
    const url = new URL(`${resultsUrl}/${tags.join("+")}`, location.href);
    url.searchParams.set("view", resultsView);

    this.panel.setAttribute("aria-busy", "true");
    // Blank (root() needs it) after apply: error, not 0.
    this.root().dataset.quizCount = "";
    let n;
    try {
      const update = await partials.fetch("quiz-results", { url: url.href, signal: ac.signal });
      if (ac.signal.aborted) return;
      await partials.apply(update);
      n = parseInt(this.root().dataset.quizCount);
    } catch {
    } finally {
      if (this.ac === ac) this.panel.removeAttribute("aria-busy");
    }

    if (ac.signal.aborted) {
      if (this.ac === ac) this.clear(); // Back during apply.
    } else if (n >= 0) {
      this.empty.hidden = n > 0;
      this.panel.hidden = false;
      this.status.textContent = n ? labelResults.replace("%n", n) : this.empty.querySelector("p").textContent;
      this.panel.querySelector(TITLE).focus();
    } else {
      for (const o of this.form.querySelectorAll(OPTION)) {
        o.type = "checkbox"; // Before the name.
        o.name = o.dataset.name;
      }
      window.onpageshow = (ev) => ev.persisted && location.reload();
      this.form.submit();
    }
  }
}

if (!customElements.get("quiz-finder")) customElements.define("quiz-finder", QuizFinder);
