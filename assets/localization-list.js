// Danh sách của <localization-picker> (localization.md §5, §6 L5, L6, L9, L10): bàn phím, ô tìm (> 10 nước),
// đang đổi, lỗi. localization-picker.js import khi nâng cấp; p = host, on = addEventListener gắn signal của host.
const OPT = 'button[name$="_code"]';
const B = ["aria-busy", "aria-disabled"];
const norm = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
const shown = (ul) => [...ul.querySelectorAll(OPT)].filter((b) => !b.parentElement.hidden);
const SEARCH = "[data-localization-search]";

export default (p, on) => {
  const { form, tabs } = p;
  const $ = (s, el = p) => el.querySelector(s);
  const label = (n, k, v) => (p.dataset["label" + n] || "").replace(k, v);
  const box = $(SEARCH);
  const input = box?.querySelector("input");
  const ul = input && document.getElementById(input.getAttribute("aria-controls"));
  const items = ul ? [...ul.children] : [];
  const err = $("[data-localization-error]");
  let t, spin, last, n;

  // Lọc theo tên và tiền tệ, không phân biệt hoa thường, dấu; khớp đầu tên lên trước (L5, L6)
  const filter = () => {
    const q = norm(input.value);
    const rest = [];
    const head = items.filter((li) => {
      const i = norm(li.textContent).indexOf(q);
      li.hidden = i < 0;
      if (i > 0) rest.push(li);
      return !i;
    });
    ul.append(...head, ...rest, ...items.filter((li) => li.hidden));
    const n = head.length + rest.length;
    const empty = $("[data-localization-empty]", ul.parentElement);
    $("[data-localization-clear]", box).hidden = !q;
    if (empty) {
      empty.hidden = !q || n > 0;
      $("[data-localization-empty-text]", empty).textContent = label("NoResults", "[query]", input.value.trim());
    }
    clearTimeout(t);
    t = setTimeout(() => say(!q ? "" : n == 1 ? label("StatusOne") : label("Status", "[count]", n)), 300);
  };
  const say = (text) => {
    const s = $('[role="status"]');
    if (s) s.textContent = text;
  };
  const clear = () => ((input.value = ""), filter());

  if (input) {
    box.hidden = false;
    p.reset = clear;
    on(input, "input", filter);
    clear();
  }

  // Bàn phím: tab ← → Home End; ô tìm Enter, Esc, ↓; mục ↑ ↓ Home End, gõ chữ
  on(form, "keydown", (e) => {
    const { key: k, target: el } = e;
    if (el.getAttribute("role") == "tab") {
      const i = tabs.indexOf(el);
      const to = { ArrowLeft: i - 1, ArrowRight: (i + 1) % tabs.length, Home: 0, End: -1 }[k];
      if (to != null) e.preventDefault(), p.select(tabs.at(to));
      return;
    }
    if (el == input) {
      // Enter không gửi mục đầu; chỉ còn 1 kết quả thì chọn nó. Esc có chữ: xoá chữ, không đóng bảng
      if (k == "Enter") e.preventDefault(), (n = shown(ul)).length == 1 && n[0].click();
      if (k == "Escape" && input.value) e.preventDefault(), e.stopPropagation(), clear();
      if (k == "ArrowDown") e.preventDefault(), shown(ul)[0]?.focus();
      return;
    }
    const list = el.closest("ul");
    if (!list || !el.matches(OPT) || e.altKey || e.ctrlKey || e.metaKey) return;
    const opts = shown(list);
    const i = opts.indexOf(el);
    const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: opts.length - 1 }[k];
    if (to != null) return e.preventDefault(), (to < 0 && list == ul ? input : opts[to])?.focus();
    if (k.length > 1 || k == " ") return;
    // Có ô tìm: về ô tìm, ký tự rơi vào ô. Không có: nhảy tới mục kế tiếp bắt đầu bằng chữ đó
    if (list == ul) return input.focus();
    const c = norm(k);
    [...opts.slice(i + 1), ...opts].find((b) => norm(b.textContent).startsWith(c))?.focus();
  });

  on(form, "click", (e) => {
    const b = e.target.closest("[data-localization-clear], [data-localization-retry]");
    if (!b) return;
    if (b.matches("[data-localization-retry]")) return last && form.requestSubmit(last);
    clear(), input.focus();
  });

  // Gửi form thường, Shopify chuyển trang (L9). Mất mạng: chặn, báo lỗi tại chỗ, Try Again gửi lại (L10)
  const idle = () => {
    clearTimeout(spin);
    for (const o of [form, ...p.querySelectorAll(OPT)]) B.forEach((a) => o.removeAttribute(a));
  };
  on(window, "pageshow", idle);
  on(form, "submit", (e) => {
    const b = e.submitter;
    if (!b?.matches(OPT) || e.defaultPrevented) return;
    const name = b.firstElementChild.textContent.trim();
    last = b;
    idle();
    if (err) err.hidden = navigator.onLine;
    if (!navigator.onLine && err) {
      e.preventDefault();
      return ($("[data-localization-error-text]", err).textContent = label("Error", "[name]", name));
    }
    form.setAttribute(B[0], "true");
    for (const o of p.querySelectorAll(OPT)) o != b && o.setAttribute(B[1], "true");
    spin = setTimeout(() => b.setAttribute(B[0], "true"), 300);
    say(label("Updating", "[name]", name));
  });
};
