// ES1-T219: kiểm logic double click của assets/quiz-finder.js trên DOM giả, không trình duyệt, không mạng.
// DOM giả mô phỏng hành vi mặc định theo giả định: mousedown chuyển focus, click đổi checked; preventDefault chặn từng cái.
// Không chứng minh được trình duyệt thật làm đúng vậy; phần đó chờ CI.
// Chạy: node drafts/dev-be/ES1-T219/logic-check.cjs            (file hiện tại)
//       node drafts/dev-be/ES1-T219/logic-check.cjs <file.js>  (vd bản cũ từ git show, phải đỏ)
const fs = require("node:fs");
const assert = require("node:assert");

const file = process.argv[2] || "assets/quiz-finder.js";
const source = fs
  .readFileSync(file, "utf8")
  .replace(/^import .*$/m, "")
  .replace(/^if \(!customElements.*$/m, "globalThis.QuizFinder = QuizFinder;");

const body = { name: "body" };
let active = body;

function el(name, { focusable = false, matches = () => false, closest = () => null, extra = {} } = {}) {
  return {
    name,
    focusable,
    matches,
    closest,
    dataset: {},
    focus() {
      active = this;
    },
    ...extra,
  };
}

function option(name, tag) {
  const o = el(name, {
    focusable: true,
    matches: (s) => s === "input[data-tag-handle]",
    closest: (s) => (s === "label" ? {} : null),
    extra: { checked: false, dataset: { tagHandle: tag }, type: "checkbox" },
  });
  return o;
}

function build() {
  active = body;
  const steps = [0, 1, 2].map((n) => {
    const title = el(`title${n}`, { focusable: true });
    const count = { textContent: `Step ${n + 1} of 3` };
    const options = [option(`opt${n}a`, `t${n}a`), option(`opt${n}b`, `t${n}b`)];
    return {
      options,
      title,
      progress: el(`progress${n}`),
      active: false,
      toggleAttribute(_k, v) {
        this.active = v;
      },
      contains: () => false,
      querySelector(s) {
        if (s === "[data-quiz-title]") return title;
        if (s === ".quiz-step__count") return count;
        if (s.endsWith(":checked")) return options.find((o) => o.checked) || null;
        return null;
      },
      querySelectorAll: () => options,
    };
  });
  const listeners = {};
  const form = {
    addEventListener(type, h) {
      listeners[type] = h;
    },
    contains: () => false,
    querySelectorAll: () => steps.flatMap((s) => s.options).filter((o) => o.checked),
    submit() {},
  };
  const back = el("back", {
    focusable: true,
    closest: (s) => (s === "[data-quiz-back]" ? {} : null),
    extra: { hidden: true },
  });
  const status = { textContent: "" };
  const q = new globalThis.QuizFinder();
  const root = { replaceChildren() {}, setAttribute() {} };
  const panel = { hidden: true, querySelector: () => root };
  const empty = { hidden: true };
  q.querySelector = (s) =>
    ({ form, "[data-quiz-back]": back, "[data-quiz-status]": status, "[data-quiz-results-panel]": panel, "[data-quiz-empty]": empty })[s] || null;
  q.querySelectorAll = () => steps;
  q.setAttribute = () => {};
  q.dataset = {};
  q.finish = () => (q.finished = (q.finished || 0) + 1);
  q.connectedCallback();

  function dispatch(type, target, detail) {
    const e = { type, target, detail, prevented: false, preventDefault() { this.prevented = true; } };
    if (listeners[type]) q.handleEvent(e);
    return e.prevented;
  }
  // Một lần bấm chuột: focus xảy ra ở mousedown, checked đổi trước khi click chạy và hoàn lại nếu bị chặn.
  function press(target, detail = 1) {
    if (!dispatch("mousedown", target, detail)) active = target.focusable ? target : body;
    const was = target.checked;
    if (target.type) target.checked = true;
    if (dispatch("click", target, detail) && target.type) target.checked = was;
  }
  return { q, steps, back, press, status };
}

const results = [];
function check(name, fn) {
  try {
    fn();
    results.push(`ok   ${name}`);
  } catch (e) {
    results.push(`FAIL ${name}: ${e.message.split("\n")[0]}`);
  }
}

globalThis.HTMLElement = class {};
globalThis.location = { href: "https://x.test/", reload() {} };
globalThis.window = {};
globalThis.document = {
  get activeElement() {
    return active;
  },
};
new Function("partials", source)({});

check("R3 double click trúng input bước 2: focus tiêu đề, không chọn hộ", () => {
  const { q, steps, press } = build();
  press(steps[0].options[0], 1);
  press(steps[1].options[0], 2);
  assert.equal(q.index, 1);
  assert.equal(steps[0].options[0].checked, true);
  assert.equal(steps[1].options[0].checked, false);
  assert.equal(active.name, "title1");
});

check("Lần bấm 2 rơi ngoài lựa chọn: focus không về body", () => {
  const { q, steps, press } = build();
  press(steps[0].options[0], 1);
  press(steps[1].progress, 2);
  assert.equal(q.index, 1);
  assert.equal(active.name, "title1");
});

check("Bấm thường sau double click: chọn, sang bước, focus tiêu đề", () => {
  const { q, steps, press } = build();
  press(steps[0].options[0], 1);
  press(steps[1].options[0], 2);
  press(steps[1].options[1], 1);
  assert.equal(steps[1].options[1].checked, true);
  assert.equal(q.index, 2);
  assert.equal(active.name, "title2");
});

check("Bấm thường: mousedown không chạy logic click, chỉ sang 1 bước", () => {
  const { q, steps, press } = build();
  press(steps[0].options[0], 1);
  assert.equal(q.index, 1);
  assert.equal(active.name, "title1");
});

check("Bấm thường Back: chỉ lùi 1 bước", () => {
  const { q, steps, back, press } = build();
  press(steps[0].options[0], 1);
  press(steps[1].options[0], 1);
  press(back, 1);
  assert.equal(q.index, 1);
  assert.equal(active.name, "title1");
});

check("Double click bước cuối: finish 1 lần", () => {
  const { q, steps, press } = build();
  press(steps[0].options[0], 1);
  press(steps[1].options[0], 1);
  press(steps[2].options[0], 1);
  press(steps[2].options[0], 2);
  assert.equal(q.finished, 1);
});

console.log(results.join("\n"));
process.exitCode = results.some((r) => r.startsWith("FAIL")) ? 1 : 0;
