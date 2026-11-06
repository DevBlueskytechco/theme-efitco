// ES1-T218: kiểm logic assets/quiz-finder.js trên DOM giả, không trình duyệt, không mạng.
// Chạy: node drafts/dev-be/ES1-T218/logic-check.cjs            (file hiện tại)
//       node drafts/dev-be/ES1-T218/logic-check.cjs <file.js>  (vd bản cũ từ git show, phải đỏ)
const fs = require("node:fs");
const assert = require("node:assert");

const file = process.argv[2] || "assets/quiz-finder.js";
const source = fs
  .readFileSync(file, "utf8")
  .replace(/^import .*$/m, "")
  .replace(/^if \(!customElements.*$/m, "globalThis.QuizFinder = QuizFinder;");

// Thuộc tính: chỉ phần cần cho selector [data-quiz-count] và dataset.quizCount.
class Root {
  constructor(count) {
    this.attrs = new Map([["data-quiz-count", String(count)]]);
    this.children = 1;
  }
  get dataset() {
    const attrs = this.attrs;
    return {
      get quizCount() {
        return attrs.get("data-quiz-count");
      },
      set quizCount(v) {
        attrs.set("data-quiz-count", String(v));
      },
    };
  }
  setAttribute(k, v) {
    this.attrs.set(k, String(v));
  }
  removeAttribute(k) {
    this.attrs.delete(k);
  }
  replaceChildren() {
    this.children = 0;
  }
}

function harness() {
  const root = new Root(0);
  const panelAttrs = new Map();
  const events = { focus: [], submits: 0 };
  const title = { focus: () => events.focus.push("results") };
  const panel = {
    hidden: true,
    setAttribute: (k, v) => panelAttrs.set(k, v),
    removeAttribute: (k) => panelAttrs.delete(k),
    querySelector: (s) => {
      if (s === "[data-quiz-count]") return root.attrs.has("data-quiz-count") ? root : null;
      return title;
    },
  };
  const q = new globalThis.QuizFinder();
  q.dataset = { resultsUrl: "/collections/all", resultsView: "quiz", labelResults: "%n products" };
  q.form = {
    querySelectorAll: () => [{ dataset: { tagHandle: "a" } }, { dataset: { tagHandle: "b" } }, { dataset: { tagHandle: "c" } }],
    submit: () => events.submits++,
  };
  q.steps = [0, 1, 2].map((n) => ({
    toggleAttribute: () => {},
    querySelector: (s) => (s === "[data-quiz-title]" ? { focus: () => events.focus.push(`step${n}`) } : { textContent: `Step ${n + 1} of 3` }),
  }));
  q.back = { hidden: false };
  q.status = { textContent: "" };
  q.panel = panel;
  q.empty = { hidden: true, querySelector: () => ({ textContent: "No match" }) };
  q.index = 2;
  return { q, root, panel, panelAttrs, events };
}

// partials giả: mỗi fetch là 1 deferred có nghe signal như fetch thật.
function fakePartials(calls, root) {
  return {
    fetch: (_name, { url, signal }) =>
      new Promise((resolve, reject) => {
        const call = { url, resolve, reject };
        calls.push(call);
        signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
      }),
    apply: async (update) => {
      if (update.count !== undefined) root.setAttribute("data-quiz-count", update.count);
    },
  };
}

const tick = () => new Promise((r) => setImmediate(r));

function load(calls, getRoot) {
  globalThis.HTMLElement = class {};
  globalThis.location = { href: "https://x.test/", reload() {} };
  globalThis.window = {};
  const partials = { fetch: (...a) => fakePartials(calls, getRoot()).fetch(...a), apply: (...a) => fakePartials(calls, getRoot()).apply(...a) };
  new Function("partials", `${source}`)(partials);
}

async function main() {
  let current;
  const calls = [];
  load(calls, () => current);
  const fresh = () => {
    calls.length = 0;
    const h = harness();
    current = h.root;
    return h;
  };
  const results = [];
  const check = async (name, fn) => {
    try {
      await fn();
      results.push(`ok   ${name}`);
    } catch (e) {
      results.push(`FAIL ${name}: ${e.message.split("\n")[0]}`);
    }
  };
  // finish() bắt đầu đồng bộ; lỗi đồng bộ của nó thành promise reject, phải chờ để không lọt thành unhandled.
  const start = (q) => {
    const p = q.finish();
    p.catch(() => {});
    return p;
  };

  // Đi đúng đường handleEvent của nút Back, không gọi tắt clear/show.
  const back = (q) => q.handleEvent({ type: "click", target: { matches: () => false, closest: (s) => (s === "[data-quiz-back]" ? {} : null) } });

  await check("R1 Back khi đang tải: về bước 2, panel ẩn, hết aria-busy", async () => {
    const { q, panel, panelAttrs, events, root } = fresh();
    const p = start(q);
    assert.equal(panelAttrs.get("aria-busy"), "true");
    back(q);
    await p;
    assert.equal(q.index, 1);
    assert.equal(panel.hidden, true);
    assert.equal(panelAttrs.has("aria-busy"), false);
    assert.equal(root.dataset.quizCount, "0");
    assert.equal(events.submits, 0);
  });

  await check("R2 đổi đáp án khi đang tải: request mới, kết quả mới, hết aria-busy", async () => {
    const { q, panel, panelAttrs, events } = fresh();
    const first = start(q);
    const second = start(q);
    assert.equal(calls.length, 2);
    await first;
    assert.equal(panelAttrs.get("aria-busy"), "true", "request cũ không được gỡ busy của request mới");
    calls[1].resolve({ count: 3 });
    await second;
    assert.equal(panel.hidden, false);
    assert.equal(panelAttrs.has("aria-busy"), false);
    assert.equal(q.status.textContent, "3 products");
    assert.equal(events.submits, 0);
  });

  await check("Back rồi trả lời lại: request mới chạy, ra kết quả", async () => {
    const { q, panel, panelAttrs } = fresh();
    const first = start(q);
    back(q);
    await first;
    q.show(2);
    const second = start(q);
    assert.equal(calls.length, 2);
    calls[1].resolve({ count: 0 });
    await second;
    assert.equal(panel.hidden, false);
    assert.equal(q.empty.hidden, false);
    assert.equal(panelAttrs.has("aria-busy"), false);
  });

  await check("Có kết quả: đếm đúng, không submit", async () => {
    const { q, events, panel } = fresh();
    const p = start(q);
    calls[0].resolve({ count: 4 });
    await p;
    assert.equal(panel.hidden, false);
    assert.equal(q.empty.hidden, true);
    assert.equal(events.submits, 0);
    assert.deepEqual(events.focus, ["results"]);
  });

  await check("0 sản phẩm: empty, không submit", async () => {
    const { q, events } = fresh();
    const p = start(q);
    calls[0].resolve({ count: 0 });
    await p;
    assert.equal(q.empty.hidden, false);
    assert.equal(q.status.textContent, "No match");
    assert.equal(events.submits, 0);
  });

  await check("Apply không có partial: rỗng là lỗi, sang search, không nhầm 0", async () => {
    const { q, events } = fresh();
    const p = start(q);
    calls[0].resolve({});
    await p;
    assert.equal(events.submits, 1);
    assert.equal(q.empty.hidden, true);
  });

  await check("Fetch lỗi mạng: sang search", async () => {
    const { q, events, panelAttrs } = fresh();
    const p = start(q);
    calls[0].reject(new Error("http 500"));
    await p;
    assert.equal(events.submits, 1);
    assert.equal(panelAttrs.has("aria-busy"), false);
  });

  await tick();
  console.log(results.join("\n"));
  process.exitCode = results.some((r) => r.startsWith("FAIL")) ? 1 : 0;
}

main();
