// ES1-T223: kiểm logic status của assets/product-variant-picker.js trên DOM giả, không trình duyệt, không mạng.
// Không chứng minh được partials thật hoạt động ra sao; phần đó chờ CI.
// Chạy: node drafts/dev-be/ES1-T223/logic-check.cjs            (file hiện tại)
//       node drafts/dev-be/ES1-T223/logic-check.cjs <file.js>  (vd bản cũ từ git show)
const fs = require("node:fs");
const assert = require("node:assert");

const file = process.argv[2] || "assets/product-variant-picker.js";
const source = fs
  .readFileSync(file, "utf8")
  .replace(/^import .*$/m, "")
  .replace(/^const events = .*$/m, "const events = Promise.resolve(null);")
  .replace(/^if \(!customElements.*$/m, "globalThis.Picker = ProductVariantPicker;");

globalThis.HTMLElement = class {};
globalThis.HTMLInputElement = class {};
globalThis.CustomEvent = class {
  constructor(type, init) {
    Object.assign(this, { type }, init);
  }
};
globalThis.window = { location: { href: "https://x.test/", search: "" }, history: { replaceState() {} } };

let blocks = 1;
globalThis.document = {
  querySelectorAll: () => Array(blocks),
  createElement: () => ({
    set innerHTML(html) {
      this.content = { textContent: html.replace(/<[^>]*>/g, "") };
    },
  }),
};

function setup(partials, { inv = null, html = "<b>$10</b>" } = {}) {
  new Function("partials", source)(partials);
  const status = { textContent: "" };
  const attrs = {};
  const root = {
    dataset: { labelSoldOut: "Sold out", labelUnavailable: "Unavailable" },
    querySelector: (s) => (s === '[role="status"]' ? status : s === ".product-form__inventory" ? inv : null),
    setAttribute: (k, v) => (attrs[k] = v),
    removeAttribute: (k) => delete attrs[k],
  };
  const p = new globalThis.Picker();
  p.root = root;
  p.dataset = { fetchUrl: "/products/x?view=featured-product", regions: "product-price product-buy-buttons" };
  p.form = { querySelector: () => null, querySelectorAll: () => [] };
  p.idInput = { value: "1" };
  p.dispatchEvent = () => {};
  p.saved = [];
  p.inv = inv;
  p.closest = () => ({ querySelector: () => ({ textContent: "ignored" }) });
  p.save = () => {};
  p.buttons = () => [];
  const v = { id: 2, available: true, price_html: html };
  return { p, status, attrs, v };
}

const ok = { fetch: async () => "u", apply: async () => {} };

const checks = {
  "apply thành công: status có giá": async () => {
    blocks = 1;
    const { p, status, attrs, v } = setup(ok);
    await p.update(v);
    assert.equal(status.textContent, "$10");
    assert.equal(attrs["aria-busy"], undefined);
  },
  "apply ném lỗi: status vẫn có giá": async () => {
    blocks = 1;
    const { p, status, v } = setup({ fetch: async () => "u", apply: async () => { throw new Error("x"); } });
    await p.update(v);
    assert.equal(status.textContent, "$10");
  },
  "fetch lỗi: status vẫn có giá": async () => {
    blocks = 1;
    const { p, status, v } = setup({ fetch: async () => { throw new Error("x"); }, apply: async () => {} });
    await p.update(v);
    assert.equal(status.textContent, "$10");
  },
  "hết hàng: có Sold out": async () => {
    blocks = 1;
    const { p, status, v } = setup(ok);
    await p.update({ ...v, available: false });
    assert.equal(status.textContent, "$10 Sold out");
  },
  "nhiều block: không fetch, status có giá": async () => {
    blocks = 2;
    let fetched = 0;
    const { p, status, v } = setup({ fetch: async () => { fetched += 1; return "u"; }, apply: async () => {} });
    await p.update(v);
    assert.equal(fetched, 0);
    assert.equal(status.textContent, "$10");
  },
  "trang sản phẩm (không price_html, có inventory): giữ chữ inventory": async () => {
    blocks = 0;
    const { p, status, v } = setup(ok, { inv: { textContent: " In stock " } });
    delete v.price_html;
    await p.update(v);
    assert.equal(status.textContent, "In stock");
  },
  "trang sản phẩm, partial lỗi: không báo giá": async () => {
    blocks = 0;
    const { p, status, v } = setup({ fetch: async () => { throw new Error("x"); }, apply: async () => {} }, { inv: { textContent: "In stock" } });
    delete v.price_html;
    await p.update(v);
    assert.equal(status.textContent, "");
  },
  "đang tải mà sang tổ hợp Unavailable: giữ chữ Unavailable": async () => {
    blocks = 1;
    let release;
    const gate = new Promise((r) => (release = r));
    const { p, status, v } = setup({ fetch: async () => { await gate; return "u"; }, apply: async () => {} });
    const running = p.update(v);
    p.unavailable();
    release();
    await running;
    assert.equal(status.textContent, "Unavailable");
  },
  "đổi nhanh 2 variant: chỉ giá variant cuối": async () => {
    blocks = 1;
    const gates = [];
    const { p, status, v } = setup({
      fetch: () => new Promise((r) => gates.push(r)),
      apply: async () => {},
    });
    const a = p.update(v);
    const b = p.update({ ...v, id: 3, price_html: "$20" });
    gates[1]("u");
    await b;
    gates[0]("u");
    await a;
    assert.equal(status.textContent, "$20");
  },
};

(async () => {
  let failed = 0;
  for (const [name, fn] of Object.entries(checks)) {
    try {
      await fn();
      console.log(`ok   ${name}`);
    } catch (e) {
      failed += 1;
      console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`);
    }
  }
  process.exitCode = failed ? 1 : 0;
})();
