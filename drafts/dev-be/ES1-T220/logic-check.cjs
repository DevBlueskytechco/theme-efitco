// ES1-T220: kiểm logic chuyển focus của assets/scroll-buttons.js trên DOM giả, không trình duyệt, không mạng.
// 2 giả định về thời điểm trình duyệt bỏ focus khi gán hidden:
//   ngay: activeElement thành body ngay lúc gán (khớp nhật ký R4b của QA: sau handler là BODY, không có focusin);
//   tre:  activeElement giữ nguyên tới lượt render (cách đọc focus fixup của HTML spec).
// Không chứng minh được Chrome thật theo giả định nào; phần đó chờ CI.
// Chạy: node drafts/dev-be/ES1-T220/logic-check.cjs            (file hiện tại)
//       node drafts/dev-be/ES1-T220/logic-check.cjs <file.js>  (vd bản cũ từ git show, phải đỏ ở giả định "ngay")
const fs = require("node:fs");
const assert = require("node:assert");

const source = fs.readFileSync(process.argv[2] || "assets/scroll-buttons.js", "utf8");

function setup(mode) {
  const body = { name: "body", hidden: false };
  const doc = { activeElement: body };

  function button(name) {
    let hidden = false;
    return {
      name,
      dataset: {},
      get hidden() {
        return hidden;
      },
      set hidden(value) {
        hidden = value;
        if (mode === "ngay" && value && doc.activeElement === this) doc.activeElement = body;
      },
      focus() {
        if (!hidden) doc.activeElement = this;
      },
    };
  }

  const prev = button("prev");
  const next = button("next");
  const track = {
    name: "track",
    hidden: false,
    scrollLeft: 0,
    scrollWidth: 2000,
    clientWidth: 1000,
    children: [{ offsetLeft: 0 }, { offsetLeft: 360 }],
    focus() {
      doc.activeElement = this;
    },
    scrollBy({ left }) {
      this.scrollLeft += left;
    },
  };
  const hooks = { "[data-scroll-track]": track, "[data-scroll-prev]": prev, "[data-scroll-next]": next };

  let Element;
  class HTMLElement {
    dataset = {};
    querySelector(selector) {
      return hooks[selector];
    }
  }
  const customElements = { get: () => undefined, define: (_, c) => (Element = c) };
  class ResizeObserver {
    observe() {}
    disconnect() {}
  }
  const matchMedia = () => ({ matches: true });
  new Function("customElements", "HTMLElement", "ResizeObserver", "document", "matchMedia", source)(customElements, HTMLElement, ResizeObserver, doc, matchMedia);

  const root = new Element();
  root.connectedCallback();
  const scrollTo = (left) => {
    track.scrollLeft = left;
    track.onscroll();
  };
  return { root, doc, body, prev, next, track, scrollTo };
}

const cases = {
  "prev tự ẩn khi đang focus: focus sang next": (d) => {
    d.scrollTo(360);
    d.prev.focus();
    d.prev.onclick();
    d.track.onscroll();
    assert.strictEqual(d.prev.hidden, true);
    assert.strictEqual(d.doc.activeElement.name, "next");
  },
  "next tự ẩn khi đang focus: focus sang prev": (d) => {
    d.scrollTo(640);
    d.next.focus();
    d.next.onclick();
    d.track.onscroll();
    assert.strictEqual(d.next.hidden, true);
    assert.strictEqual(d.doc.activeElement.name, "prev");
  },
  "nút còn hiện: giữ focus ở nút đang bấm": (d) => {
    d.next.focus();
    d.next.onclick();
    d.track.onscroll();
    assert.strictEqual(d.doc.activeElement.name, "next");
  },
  "focus ở track: nút ẩn không cướp focus": (d) => {
    d.scrollTo(360);
    d.track.focus();
    d.scrollTo(0);
    assert.strictEqual(d.prev.hidden, true);
    assert.strictEqual(d.doc.activeElement.name, "track");
  },
  "focus ở body: nút ẩn không cướp focus": (d) => {
    d.scrollTo(360);
    d.scrollTo(0);
    assert.strictEqual(d.doc.activeElement, d.body);
  },
  "không tràn, đang focus: cả 2 ẩn, không lỗi (đã chấp nhận ở ES1-T185)": (d) => {
    d.scrollTo(360);
    d.next.focus();
    d.track.scrollWidth = d.track.clientWidth;
    d.scrollTo(0);
    assert.strictEqual(d.prev.hidden && d.next.hidden, true);
  },
  "lần tính đầu: ẩn prev, đặt data-enhanced": (d) => {
    assert.strictEqual(d.prev.hidden, true);
    assert.strictEqual(d.next.hidden, false);
    assert.strictEqual(d.root.dataset.enhanced, "");
  },
};

let failed = 0;
for (const mode of ["ngay", "tre"]) {
  for (const [name, run] of Object.entries(cases)) {
    try {
      run(setup(mode));
      console.log(`ok   [${mode}] ${name}`);
    } catch (error) {
      failed += 1;
      console.log(`FAIL [${mode}] ${name}: ${error.message.split("\n")[0]}`);
    }
  }
}
console.log(failed ? `${failed} FAIL` : "tất cả ok");
process.exitCode = failed ? 1 : 0;
