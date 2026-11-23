#!/usr/bin/env node
// ES1-T530 (notes ES1-T527 V57, kit.css dòng 7): trang mockup KHÔNG định nghĩa lại component của kit.
// Quét <style> của drafts/designer/*/*.html (trừ ES1-T251 trang kit, ES1-T252 và ES1-T174 bản so cũ), bỏ comment.
// FAIL khi một selector chỉ gồm class kit (kèm :hover, ::before, [attr], class trạng thái is-*/has-*).
// Selector ngữ cảnh được phép: có tổ tiên / anh em (.hero .chip, .x > .badge) hoặc thêm class trang (.chip.hero-chip).
// Exit 0 = sạch, 1 = có FAIL, 2 = lỗi đầu vào.
// Dùng: node scripts/check-mockup-kit.mjs [--root <thư mục repo>] [--annotations|--no-annotations]
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const opt = { root: process.cwd(), annotations: process.env.GITHUB_ACTIONS === 'true' };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--root') opt.root = argv[++i];
  else if (a === '--annotations') opt.annotations = true;
  else if (a === '--no-annotations') opt.annotations = false;
  else { console.error(`tham số lạ: ${a}`); process.exit(2); }
}

const DESIGNER = 'drafts/designer';
const KIT = `${DESIGNER}/_kit/kit.css`;
const EXCLUDE = new Set(['_kit', 'ES1-T251', 'ES1-T252', 'ES1-T174']);
// Danh sách component kit của ticket ES1-T530. pagination: mọi phần tử pagination__*.
const KIT_BLOCKS = ['rte', 'chip', 'empty-state', 'search-field', 'input-group', 'quantity', 'variant-pill', 'collection-card',
  'option-card', 'product-row', 'dpanel', 'meter', 'section-link', 'badge', 'alert', 'skeleton', 'spinner', 'dialog'];

if (!existsSync(join(opt.root, KIT))) { console.error(`thiếu file: ${KIT}`); process.exit(2); }
// Biến thể BEM (block__el, block--mod) chỉ tính là class kit khi kit.css có định nghĩa class đó.
const kitClasses = new Set([...readFileSync(join(opt.root, KIT), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]));
function isKitClass(c) {
  if (/^pagination__[\w-]+$/.test(c)) return true;
  if (KIT_BLOCKS.includes(c)) return true;
  const m = /^([a-z][\w-]*?)(?:__|--)[\w-]+$/.exec(c);
  return !!(m && KIT_BLOCKS.includes(m[1]) && kitClasses.has(c));
}
const isStateClass = (c) => /^(is|has)-[\w-]+$/.test(c);

const blank = (s) => s.replace(/[^\n]/g, ' ');
function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (idx) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= idx) lo = m; else hi = m - 1; } return lo + 1; };
}
// Prelude của mọi style rule (kể cả trong @media/@supports/@container), bỏ @keyframes, @font-face.
function preludes(css) {
  const out = [], stack = [];
  let seg = 0, quote = null;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '{') {
      const raw = css.slice(seg, i);
      const lead = raw.length - raw.trimStart().length;
      const prelude = raw.trim();
      const inKeyframes = stack.some((s) => /^@(-\w+-)?keyframes\b/.test(s));
      if (prelude && !prelude.startsWith('@') && !inKeyframes) out.push({ prelude, idx: seg + lead });
      stack.push(prelude);
      seg = i + 1;
    } else if (c === '}') { stack.pop(); seg = i + 1; }
    else if (c === ';') seg = i + 1;
  }
  return out;
}
function splitTop(s, sep) {
  const parts = [];
  let depth = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === sep && depth === 0) { parts.push(s.slice(start, i)); start = i + 1; }
  }
  parts.push(s.slice(start));
  return parts;
}
// true khi selector là 1 compound, không tổ hợp, chỉ có class kit (+ trạng thái).
function kitOnly(sel) {
  let s = sel.trim();
  // bỏ nội dung () và [] để tìm tổ hợp ở mức ngoài cùng
  let flat = '', depth = 0;
  for (const c of s) {
    if (c === '(' || c === '[') { depth++; continue; }
    if (c === ')' || c === ']') { depth--; continue; }
    if (depth === 0) flat += c;
  }
  if (/[\s>+~]/.test(flat.trim())) return null;
  s = flat.trim().replace(/::?[\w-]+/g, '');
  if (!s.startsWith('.')) return null;           // có type selector, id, * hoặc &
  const classes = s.split('.').slice(1);
  if (classes.some((c) => !/^-?[_a-zA-Z][\w-]*$/.test(c))) return null;
  const kits = classes.filter(isKitClass);
  if (!kits.length) return null;
  return classes.every((c) => isKitClass(c) || isStateClass(c)) ? kits : null;
}

const pages = [];
for (const d of readdirSync(join(opt.root, DESIGNER)).sort()) {
  if (EXCLUDE.has(d) || !statSync(join(opt.root, DESIGNER, d)).isDirectory()) continue;
  for (const f of readdirSync(join(opt.root, DESIGNER, d)).sort()) if (f.endsWith('.html')) pages.push(`${DESIGNER}/${d}/${f}`);
}

let fails = 0, styles = 0, rules = 0;
for (const file of pages) {
  const html = readFileSync(join(opt.root, file), 'utf8');
  const lineOf = lineIndex(html);
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    styles++;
    const base = m.index + m[0].indexOf('>') + 1;
    const css = m[1].replace(/\/\*[\s\S]*?\*\//g, blank);
    for (const p of preludes(css)) {
      rules++;
      let off = 0;
      for (const sel of splitTop(p.prelude, ',')) {
        const kits = kitOnly(sel);
        if (kits) {
          const at = base + p.idx + off + (sel.length - sel.trimStart().length);
          const line = lineOf(at);
          fails++;
          const msg = `FAIL ${file}:${line} selector "${sel.trim()}" định nghĩa lại component kit (${kits.map((k) => '.' + k).join(' ')}); dùng class kit nguyên trạng hoặc selector ngữ cảnh`;
          console.log(msg);
          if (opt.annotations) console.log(`::error file=${file},line=${line}::${msg.replace(/%/g, '%25')}`);
        }
        off += sel.length + 1;
      }
    }
  }
}
console.log(`mockup ${pages.length} trang · ${styles} <style> · ${rules} rule · FAIL ${fails} (bỏ qua ${[...EXCLUDE].filter((e) => e !== '_kit').join(', ')})`);
process.exit(fails ? 1 : 0);
