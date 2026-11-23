#!/usr/bin/env node
// ES1-T530 · ADR 0015 mục 4: so token 4 nơi, lấy kit.css làm chuẩn.
//   nơi 1  drafts/designer/_kit/kit.css      :root gốc + :root trong @media (min-width: 48|64|80rem)
//   nơi 3  docs/tokens.json                  lệch kit = FAIL, không ngoại lệ (luật 1, 2)
//   nơi 4  config/settings_schema.json       default màu + font_picker: lệch có khoá known_mismatches = WARN, không khoá = FAIL (luật 3–6)
//          snippets/css-variables.liquid     nhóm khác (space, line-height, radius, layout, bóng, layer, icon, kích thước): WARN, --strict = FAIL (luật 7)
//          assets/*.css                      biến kit khai trong :root ở assets: WARN, --strict = FAIL
// Không gọi Shopify, không mạng. Exit 0 = không FAIL, 1 = có FAIL, 2 = lỗi đầu vào.
// Dùng: node scripts/check-tokens.mjs [--strict] [--root <thư mục repo>] [--annotations|--no-annotations]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const USAGE = 'node scripts/check-tokens.mjs [--strict] [--root <dir>] [--annotations|--no-annotations]';
const opt = { root: process.cwd(), strict: false, annotations: process.env.GITHUB_ACTIONS === 'true' };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--strict') opt.strict = true;
  else if (a === '--root') opt.root = argv[++i];
  else if (a === '--annotations') opt.annotations = true;
  else if (a === '--no-annotations') opt.annotations = false;
  else if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0); }
  else { console.error(`tham số lạ: ${a}\n${USAGE}`); process.exit(2); }
}

const P = {
  kit: 'drafts/designer/_kit/kit.css',
  tokens: 'docs/tokens.json',
  schema: 'config/settings_schema.json',
  cssvars: 'snippets/css-variables.liquid',
  assets: 'assets',
};
const KIT_BPS = [0, 48, 64, 80];

function read(rel) {
  const f = join(opt.root, rel);
  if (!existsSync(f)) { console.error(`thiếu file: ${rel}`); process.exit(2); }
  return readFileSync(f, 'utf8');
}

// ---------- tiện ích văn bản ----------
const blank = (s) => s.replace(/[^\n]/g, ' ');
const stripCssComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, blank);
function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (idx) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= idx) lo = m; else hi = m - 1; } return lo + 1; };
}
const dash = (k) => k.replace(/_/g, '-');
const fmtNum = (n) => String(+(+n).toFixed(4));

// ---------- CSS: rule + khai báo custom property ----------
function parseCss(text) {
  const rules = [], stack = [];
  let seg = 0, quote = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '{') { stack.push({ prelude: text.slice(seg, i).trim(), start: i + 1 }); seg = i + 1; }
    else if (c === '}') {
      const n = stack.pop();
      seg = i + 1;
      if (!n) continue;
      n.end = i;
      n.parents = stack.map((s) => s.prelude);
      if (!n.prelude.startsWith('@')) rules.push(n);
    } else if (c === ';' && (stack.length === 0 || stack[stack.length - 1].prelude.startsWith('@'))) seg = i + 1;
  }
  return rules;
}
function declsOf(text, rule) {
  const out = [];
  let depth = 0, quote = null, start = rule.start;
  const flush = (end) => {
    const piece = text.slice(start, end);
    const m = /^(\s*)(--[\w-]+)\s*:\s*([\s\S]*?)\s*$/.exec(piece);
    if (m) out.push({ name: m[2], value: m[3].replace(/\s+/g, ' ').trim(), idx: start + m[1].length });
  };
  for (let i = rule.start; i < rule.end; i++) {
    const c = text[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ';' && depth === 0) { flush(i); start = i + 1; }
  }
  flush(rule.end);
  return out;
}
// 0 = không @media; số rem = @media (min-width: Nrem) duy nhất; null = @media khác (bỏ qua)
function mediaMin(parents) {
  if (parents.length === 0) return 0;
  if (parents.length > 1) return null;
  const m = /^@media\s*\(\s*min-width\s*:\s*([\d.]+)rem\s*\)$/.exec(parents[0].replace(/\s+/g, ' '));
  return m ? +m[1] : null;
}
// Biến :root của 1 file. firstOnly: chỉ khối :root gốc đầu tiên (kit).
function collectRoot(text, file, { firstOnly = false } = {}) {
  const lineOf = lineIndex(text);
  const base = new Map(), overrides = [], other = [];
  let seenFirst = false;
  for (const r of parseCss(text)) {
    const isRoot = r.prelude.replace(/\s+/g, '') === ':root';
    const bp = mediaMin(r.parents);
    for (const d of declsOf(text, r)) {
      const rec = { name: d.name, value: d.value, file, line: lineOf(d.idx) };
      if (!isRoot) { other.push(rec); continue; }
      if (bp === 0) {
        if (firstOnly && seenFirst) continue;
        if (!base.has(d.name)) base.set(d.name, rec);
      } else if (bp !== null) overrides.push({ ...rec, bp });
    }
    if (isRoot && bp === 0) seenFirst = true;
  }
  return { base, overrides, other };
}

// ---------- giá trị: var() → giá trị cuối, calc đơn giản, chuẩn hoá ----------
function scopeAt(base, overrides, w) {
  const m = new Map([...base].map(([k, v]) => [k, v.value]));
  for (const o of overrides) if (o.bp <= w) m.set(o.name, o.value);
  return m;
}
function resolveVars(v, scope, seen = new Set()) {
  const re = /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/;
  let out = v;
  for (let guard = 0; guard < 200; guard++) {
    const m = re.exec(out);
    if (!m) break;
    let rep;
    if (!seen.has(m[1]) && scope.has(m[1])) rep = resolveVars(scope.get(m[1]), scope, new Set([...seen, m[1]]));
    else if (m[2] !== undefined) rep = m[2].trim();
    else rep = `⟨${m[1]}⟩`;
    out = out.slice(0, m.index) + rep + out.slice(m.index + m[0].length);
  }
  return out;
}
// calc(<số><đơn vị> <op> <số><đơn vị>) tính được thì thay bằng kết quả; khác đơn vị thì giữ nguyên.
function evalCalc(v) {
  const re = /calc\(\s*(-?\d*\.?\d+)([a-z%]*)\s*([*/+-])\s*(-?\d*\.?\d+)([a-z%]*)\s*\)/gi;
  let out = v, prev;
  do {
    prev = out;
    out = out.replace(re, (all, a, ua, op, b, ub) => {
      if (op === '*' && (!ua || !ub)) return fmtNum(+a * +b) + (ua || ub);
      if (op === '/' && !ub && +b !== 0) return fmtNum(+a / +b) + ua;
      if ((op === '+' || op === '-') && ua === ub) return fmtNum(op === '+' ? +a + +b : +a - +b) + ua;
      return all;
    });
  } while (out !== prev);
  return out;
}
function expandHex(h) {
  h = h.toUpperCase();
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  return h;
}
function norm(v) {
  let s = String(v).trim().toLowerCase().replace(/\s+/g, ' ');
  s = s.replace(/\s*([(),])\s*/g, '$1');
  s = s.replace(/#([0-9a-f]{3,8})\b/g, (_, h) => '#' + expandHex(h));
  s = s.replace(/(?<![#\w.])-?\d*\.?\d+/g, (n) => fmtNum(n));
  return s;
}
function hexRgb(h) { h = expandHex(h.replace('#', '')); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function rgbHex(c) { return '#' + c.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase(); }
// color-mix(in srgb,#A p%,#B[ q%]) → hex (sau norm). transparent: giữ nguyên.
function mixColors(s) {
  const re = /color-mix\(in srgb,(#[0-9A-F]{6})(?: (\d*\.?\d+)%)?,(#[0-9A-F]{6})(?: (\d*\.?\d+)%)?\)/;
  let out = s;
  for (let g = 0; g < 20; g++) {
    const m = re.exec(out);
    if (!m) break;
    let p = m[2] !== undefined ? +m[2] / 100 : m[4] !== undefined ? 1 - +m[4] / 100 : 0.5;
    const a = hexRgb(m[1]), b = hexRgb(m[3]);
    out = out.slice(0, m.index) + rgbHex(a.map((x, i) => x * p + b[i] * (1 - p))) + out.slice(m.index + m[0].length);
  }
  return out;
}
const finalValue = (raw, scope) => norm(evalCalc(norm(resolveVars(raw, scope))));
function sameValue(a, b) {
  if (a === b) return true;
  const ma = mixColors(a), mb = mixColors(b);
  if (ma === mb) return true;
  const ha = /^#[0-9A-F]{6}$/.test(ma) && hexRgb(ma), hb = /^#[0-9A-F]{6}$/.test(mb) && hexRgb(mb);
  return !!(ha && hb && ha.every((x, i) => Math.abs(x - hb[i]) <= 1));
}
function toPx(s) {
  const m = /^(-?\d*\.?\d+)(px|rem)?$/.exec(s);
  if (!m) return null;
  return m[2] === 'rem' ? +m[1] * 16 : +m[1];
}
function bpWidth(k) {
  let m;
  if ((m = /^<(\d+)rem$/.exec(k))) return +m[1] - 0.001;
  if ((m = /^>=(\d+)rem$/.exec(k))) return +m[1];
  if ((m = /^(\d+)[–-]\d+rem$/.exec(k))) return +m[1];
  return null;
}
const isHex = (raw) => /^#[0-9a-f]{3,8}$/i.test(raw.trim());

// ---------- báo cáo ----------
const results = [];
const counters = { tokensDiff: 0, otherWarn: 0 };
function esc(s) { return String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A'); }
function report(level, place, key, lower, kit, file, line, note = '') {
  const msg = `${level} ${place} ${key} ${lower} ≠ ${kit} (${file}:${line})${note ? ' · ' + note : ''}`;
  results.push({ level, msg });
  console.log(msg);
  if (opt.annotations) console.log(`::${level === 'FAIL' ? 'error' : 'warning'} file=${file},line=${line}::${esc(msg)}`);
}
function annotateOnly(level, file, line, msg) {
  if (opt.annotations) console.log(`::${level === 'FAIL' ? 'error' : 'warning'} file=${file},line=${line}::${esc(msg)}`);
}

// ---------- đọc nguồn ----------
const kitText = stripCssComments(read(P.kit));
const kit = collectRoot(kitText, P.kit, { firstOnly: true });
const kitAt = (w) => scopeAt(kit.base, kit.overrides, w);
const kitScopes = Object.fromEntries(KIT_BPS.map((w) => [w, kitAt(w)]));
const kitVal = (name, w = 0) => {
  const sc = kitScopes[w] ?? kitAt(w);
  return sc.has(name) ? finalValue(sc.get(name), sc) : undefined;
};
const kitLine = (name) => kit.base.get(name)?.line ?? 1;

const tokensText = read(P.tokens);
let tokens;
try { tokens = JSON.parse(tokensText); } catch (e) { console.error(`${P.tokens}: JSON lỗi: ${e.message}`); process.exit(2); }
const sot = tokens._source_of_truth ?? {};
const km = sot.known_mismatches ?? {};
const tokensLineOf = lineIndex(tokensText);
const reEsc = (s) => String(s).replace(/[.*+?^$|()[\]{}\\]/g, '\\$&');
// Dòng của khoá theo đường dẫn: khoá đầu ở cấp cao nhất (thụt 2), khoá sau tìm tuần tự phía dưới.
function jsonLine(path) {
  let pos = 0;
  for (const [i, seg] of path.entries()) {
    const re = new RegExp(i === 0 ? `^ {2}"${reEsc(seg)}"\\s*:` : `"${reEsc(seg)}"\\s*:`, i === 0 ? 'gm' : 'g');
    re.lastIndex = pos;
    const m = re.exec(tokensText);
    if (!m) break;
    pos = m.index + 1;
  }
  return tokensLineOf(pos);
}

const schemaText = read(P.schema);
let schema;
try { schema = JSON.parse(schemaText.replace(/^\s*\/\*[\s\S]*?\*\//, '')); } catch (e) { console.error(`${P.schema}: JSON lỗi: ${e.message}`); process.exit(2); }
const settings = new Map();
const schemaLineOf = lineIndex(schemaText);
for (const g of schema) for (const s of g.settings ?? []) if (s.id) {
  const i = schemaText.search(new RegExp(`"id"\\s*:\\s*"${s.id}"`));
  settings.set(s.id, { ...s, line: i >= 0 ? schemaLineOf(i) : 1 });
}

// css-variables.liquid → CSS: giải Liquid bằng default settings, space_base, handle font
function handleParts(h) {
  const m = /^([a-z0-9_]+)_([ni])([1-9])$/.exec(h ?? '');
  return m ? { family: m[1].replace(/_/g, ' '), style: m[2] === 'i' ? 'italic' : 'normal', weight: +m[3] * 100 } : null;
}
function liquidToCss(src) {
  const fonts = {};
  for (const m of src.matchAll(/assign\s+(\w+)\s*=\s*settings\.(\w+)\s*$/gm)) fonts[m[1]] = handleParts(settings.get(m[2])?.default);
  const spaceVar = /assign\s+(\w+)\s*=\s*settings\.space_base\b/.exec(src)?.[1] ?? 'space';
  const spaceBase = +(settings.get('space_base')?.default ?? 4);
  const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
  const output = (expr) => {
    const e = expr.trim();
    let m;
    if ((m = /^settings\.(\w+)$/.exec(e))) return String(settings.get(m[1])?.default ?? `⟨settings.${m[1]}⟩`);
    if (e === spaceVar) return String(spaceBase);
    if ((m = new RegExp(`^${spaceVar}\\s*\\|\\s*times:\\s*(\\d*\\.?\\d+)$`).exec(e))) return fmtNum(spaceBase * +m[1]);
    if ((m = /^(\w+)\.(family|weight|style|fallback_families)$/.exec(e)) && fonts[m[1]]) {
      const f = fonts[m[1]];
      return m[2] === 'family' ? titleCase(f.family) : m[2] === 'fallback_families' ? 'sans-serif' : String(f[m[2]]);
    }
    return '';
  };
  let s = src;
  s = s.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, blank);
  s = s.replace(/\{%-?\s*doc\s*-?%\}[\s\S]*?\{%-?\s*enddoc\s*-?%\}/g, blank);
  // Chỉ cần giữ số dòng, không cần giữ cột. if/else: lấy nhánh if (nhánh mặc định khi font có biến thể).
  const nl = (x) => (x.match(/\n/g) || []).length;
  s = s.replace(/\{%-?\s*if\b[^%]*-?%\}([\s\S]*?)(?:\{%-?\s*else\s*-?%\}[\s\S]*?)?\{%-?\s*endif\s*-?%\}/g, (all, a) => a + '\n'.repeat(nl(all) - nl(a)));
  s = s.replace(/\{\{-?([\s\S]*?)-?\}\}/g, (all, e) => output(e) + '\n'.repeat(nl(all)));
  s = s.replace(/\{%-?[\s\S]*?-?%\}/g, blank);
  return s;
}
const cssvarsText = stripCssComments(liquidToCss(read(P.cssvars)));
const cv = collectRoot(cssvarsText, P.cssvars);

const assetFiles = readdirSync(join(opt.root, P.assets)).filter((f) => f.endsWith('.css')).sort();
const assets = assetFiles.map((f) => ({ file: `${P.assets}/${f}`, ...collectRoot(stripCssComments(read(`${P.assets}/${f}`)), `${P.assets}/${f}`) }));

// ======================================================================
// Luật 1: số biến kit :root gốc = kit_root_count
const kitCount = kit.base.size;
if (sot.kit_root_count !== kitCount) {
  report('FAIL', 'tokens.json', '_source_of_truth.kit_root_count', String(sot.kit_root_count), String(kitCount), P.tokens, jsonLine(['_source_of_truth', 'kit_root_count']), 'luật 1: nơi 3 chưa chép theo kit');
  counters.tokensDiff++;
}

// Luật 2: tokens.json ↔ kit. Màu (bắt buộc) + mọi khoá có biến CSS tương ứng.
const kitHexColors = [...kit.base.values()].filter((d) => d.name.startsWith('--color-') && isHex(d.value)).map((d) => d.name);
function tokFail(path, tokShown, kitShown, note = '') {
  counters.tokensDiff++;
  report('FAIL', 'tokens.json', path.join('.'), tokShown, kitShown, P.tokens, jsonLine(path), note);
}
function tokCheck(path, tokValue, kitName, kind, w = 0) {
  const kv = kitVal(kitName, w);
  if (kv === undefined) return tokFail(path, String(tokValue), `(thiếu ${kitName} trong kit)`);
  const raw = norm((w ? kitScopes[w] ?? kitAt(w) : kitScopes[0]).get(kitName));
  let ok, tokShown = String(tokValue), kitShown = `${kitName} ${kv}`;
  switch (kind) {
    case 'hex': ok = norm(tokValue) === kv; break;
    case 'px': { const p = toPx(kv); ok = p !== null && Math.abs(p - +tokValue) < 0.01; break; }
    case 'ms': ok = kv === `${fmtNum(tokValue)}ms`; break;
    case 'num': ok = kv === fmtNum(tokValue); break;
    case 'str': ok = kv === norm(tokValue); break;
    case 'alias': ok = raw === norm(`var(${tokValue})`); kitShown = `${kitName} ${raw}`; break;
    case 'mix': ok = sameValue(norm(tokValue), kv); kitShown = `${kitName} ${mixColors(kv)}`; break;
    default: throw new Error(kind);
  }
  if (!ok) tokFail(path, tokShown, kitShown, w ? `mốc ${w}rem` : '');
}
const tj = tokens;
for (const [k, v] of Object.entries(tj.color ?? {})) if (!k.startsWith('_')) tokCheck(['color', k], v, `--color-${dash(k)}`, 'hex');
for (const n of kitHexColors) {
  const k = n.slice('--color-'.length).replace(/-/g, '_');
  if (!(tj.color && k in tj.color)) { counters.tokensDiff++; report('FAIL', 'tokens.json', `color.${k}`, '(thiếu)', `${n} ${kitVal(n)}`, P.kit, kitLine(n), 'luật 2: màu kit không có khoá tokens.json'); }
}
for (const [k, v] of Object.entries(tj.color_status ?? {})) if (!k.startsWith('_') && v.css) tokCheck(['color_status', k], `--color-${dash(v.alias_of)}`, v.css, 'alias');
for (const [k, v] of Object.entries(tj.color_derived ?? {})) {
  const name = kit.base.has(`--color-${dash(k)}`) ? `--color-${dash(k)}` : `--${dash(k)}`;
  tokCheck(['color_derived', k, 'default'], v.default, name, 'mix');
}
// font: family (handle hoặc chữ trước " — ") ↔ kit; body_weight
const firstFamily = (s) => (s ?? '').split(',')[0].trim().replace(/^['"]|['"]$/g, '').toLowerCase();
for (const role of ['primary', 'heading']) {
  const txt = tj.font?.[role];
  if (typeof txt !== 'string') continue;
  const h = /\b([a-z0-9_]+_[ni][1-9])\b/.exec(txt)?.[1];
  const fam = h ? handleParts(h).family : txt.split(/\s+[—-]\s+/)[0].trim().toLowerCase();
  const kf = firstFamily(kit.base.get(`--font-${role}--family`)?.value);
  if (fam !== kf) tokFail(['font', role], fam, `--font-${role}--family ${kf}`);
}
if (tj.font?.body_weight !== undefined) tokCheck(['font', 'body_weight'], tj.font.body_weight, '--font-body-weight', 'num');
for (const [k, v] of Object.entries(tj.type_scale ?? {})) {
  if (k.startsWith('_') || !v.css || v.size === undefined) continue;
  const kv = kitVal(v.css);
  if (kv === undefined) { tokFail(['type_scale', k, 'size'], JSON.stringify(v.size), `(thiếu ${v.css} trong kit)`); continue; }
  const c = /^clamp\(([^,]+),.*,([^,]+)\)$/.exec(kv);
  const got = c ? [toPx(c[1]), toPx(c[2])] : [toPx(kv), toPx(kv)];
  const want = Array.isArray(v.size) ? v.size : [v.size, v.size];
  if (got[0] !== want[0] || got[1] !== want[1]) tokFail(['type_scale', k, 'size'], JSON.stringify(want), `${v.css} ${kv} = [${got}]`);
}
for (const grp of ['line_height', 'letter_spacing']) {
  for (const [k, v] of Object.entries(tj[grp] ?? {})) {
    if (k.startsWith('_')) continue;
    const name = `--${dash(grp)}-${dash(k)}`;
    if (v && typeof v === 'object') for (const [bk, bv] of Object.entries(v)) tokCheck([grp, k, bk], bv, name, typeof bv === 'number' ? 'num' : 'str', bpWidth(bk) ?? 0);
    else tokCheck([grp, k], v, name, typeof v === 'number' ? 'num' : 'str');
  }
}
for (const [k, v] of Object.entries(tj.space ?? {})) if (/^\d+$/.test(k)) tokCheck(['space', k], v, `--space-${k}`, 'px');
for (const [k, v] of Object.entries(tj.space?.named ?? {})) tokCheck(['space', 'named', k], v, `--space-${k}`, 'px');
for (const [k, v] of Object.entries(tj.radius ?? {})) if (typeof v === 'number') tokCheck(['radius', k], v, `--radius-${k}`, 'px');
for (const [k, v] of Object.entries(tj.radius?.roles ?? {})) tokCheck(['radius', 'roles', k], `--radius-${v}`, `--radius-${k}`, 'alias');
if (tj.container?.page_margin !== undefined) tokCheck(['container', 'page_margin'], tj.container.page_margin, '--page-margin', 'px');
if (typeof tj.container?.page_width_setting === 'string') tokCheck(['container', 'page_width_setting'], tj.container.page_width_setting.split(/\s/)[0], '--page-width', 'str');
const L = tj.layout ?? {};
for (const [k, name] of [['grid_columns', '--grid-columns'], ['grid_gap', '--grid-gap'], ['section_gap', '--section-gap'], ['heading_gap', '--heading-gap']]) {
  for (const [bk, bv] of Object.entries(L[k] ?? {})) { const w = bpWidth(bk); if (w !== null) tokCheck(['layout', k, bk], bv, name, k === 'grid_columns' ? 'num' : 'px', w); }
}
for (const [bk, bv] of Object.entries(L.control_height ?? {})) {
  if (bk === 'compact') tokCheck(['layout', 'control_height', bk], bv, '--control-height-compact', 'px');
  else { const w = bpWidth(bk); if (w !== null) tokCheck(['layout', 'control_height', bk], bv, '--control-height', 'px', w); }
}
for (const [k, name] of [['header_height', '--header-height'], ['carousel_progress_height', '--progress-height'], ['meter_height', '--meter-height']]) if (L[k] !== undefined) tokCheck(['layout', k], L[k], name, 'px');
if (L.touch_target?.min !== undefined) tokCheck(['layout', 'touch_target', 'min'], L.touch_target.min, '--touch-target-min', 'px');
if (L.touch_target?.key_groups !== undefined) tokCheck(['layout', 'touch_target', 'key_groups'], L.touch_target.key_groups, '--touch-target', 'px');
// bóng: dạng ngữ nghĩa "0 8 24 foreground 12%" như tokens.json
function semShadow(raw, scope) {
  let s = raw.replace(/var\(\s*--color-([\w-]+)\s*\)/g, (_, n) => n.replace(/-/g, '_'));
  s = norm(evalCalc(norm(resolveVars(s, scope))));
  return s.replace(/color-mix\(in srgb,([\w#]+) (\d*\.?\d+%),transparent\)/g, '$1 $2').replace(/(-?\d*\.?\d+)px\b/g, '$1');
}
for (const [k, v] of Object.entries(tj.elevation ?? {})) {
  if (k.startsWith('_') || typeof v !== 'string') continue;
  const name = k === 'scrim' ? '--overlay-scrim' : `--shadow-${k}`;
  if (!kit.base.has(name)) { tokFail(['elevation', k], v, `(thiếu ${name} trong kit)`); continue; }
  const got = semShadow(kit.base.get(name).value, kitScopes[0]);
  if (got !== norm(v)) tokFail(['elevation', k], v, `${name} ${got}`);
}
for (const [k, v] of Object.entries(tj.layer ?? {})) if (typeof v === 'number') tokCheck(['layer', k], v, `--layer-${dash(k)}`, 'num');
for (const [k, v] of Object.entries(tj.motion ?? {})) if (typeof v === 'number') tokCheck(['motion', k], v, `--motion-${k}`, 'ms');
for (const [k, v] of Object.entries(tj.easing ?? {})) if (!k.startsWith('_') && v.css) tokCheck(['easing', k, 'curve'], v.curve, v.css, 'str');
for (const [k, v] of Object.entries(tj.icon?.size ?? {})) tokCheck(['icon', 'size', k], v, `--icon-size-${k}`, 'px');
if (tj.icon?.stroke_width !== undefined) tokCheck(['icon', 'stroke_width'], tj.icon.stroke_width, '--icon-stroke-width', 'num');
for (const [k, v] of Object.entries(tj.component ?? {})) if (!k.startsWith('_') && v.css && v.value !== undefined) tokCheck(['component', k, 'value'], v.value, v.css, 'px');

// Luật 3–6: settings_schema default màu + font_picker ↔ kit
const colorSettings = [...settings.values()].filter((s) => s.type === 'color');
let colorMatch = 0, colorTemp = 0, fontMatch = 0, fontTemp = 0;
const settingMatched = new Map();
function settingDiff(id, lower, kitShown, line) {
  if (id in km) { report('WARN', 'settings_schema', id, lower, kitShown, P.schema, line, `lệch tạm (known_mismatches: ${km[id]})`); return 'temp'; }
  report('FAIL', 'settings_schema', id, lower, kitShown, P.schema, line, 'lệch không có khoá known_mismatches');
  return 'fail';
}
for (const s of colorSettings) {
  const t = s.id.replace(/_color$/, '');
  const name = `--color-${dash(t)}`;
  if (!kitHexColors.includes(name)) {
    if (!(s.id in km)) report('FAIL', 'settings_schema', s.id, String(s.default), `(kit không có ${name} dạng hex)`, P.schema, s.line, 'luật 5');
    continue;
  }
  const kv = kitVal(name), sv = norm(s.default ?? '');
  if (sv === kv) { colorMatch++; settingMatched.set(s.id, true); }
  else if (settingDiff(s.id, s.default, `${name} ${kv}`, s.line) === 'temp') colorTemp++;
}
for (const n of kitHexColors) {
  const id = `${n.slice('--color-'.length).replace(/-/g, '_')}_color`;
  if (!settings.has(id) && !(id in km)) report('FAIL', 'settings_schema', id, '(thiếu setting)', `${n} ${kitVal(n)}`, P.kit, kitLine(n), 'luật 5');
}
const fontSettings = [...settings.values()].filter((s) => s.type === 'font_picker');
for (const s of fontSettings) {
  const role = /^type_(\w+)_font$/.exec(s.id)?.[1];
  const sp = handleParts(s.default);
  if (!role || !kit.base.has(`--font-${role}--family`) || !sp) {
    if (!(s.id in km)) report('FAIL', 'settings_schema', s.id, String(s.default), `(không ánh xạ được --font-${role}--*)`, P.schema, s.line, 'luật 5');
    continue;
  }
  const kf = firstFamily(kit.base.get(`--font-${role}--family`).value);
  const tokHandle = /\b([a-z0-9_]+_[ni][1-9])\b/.exec(tj.font?.[role] ?? '')?.[1];
  const target = tokHandle ? handleParts(tokHandle).weight : +kitVal(`--font-${role}--weight`);
  const targetSrc = tokHandle ? `tokens.json ${tokHandle}` : `--font-${role}--weight`;
  if (sp.family === kf && sp.weight === target) { fontMatch++; settingMatched.set(s.id, true); continue; }
  if (settingDiff(s.id, `${s.default} (${sp.family} ${sp.weight})`, `${kf} ${target} (${targetSrc})`, s.line) === 'temp') fontTemp++;
}

// Luật 7: css-variables.liquid (+ :root ở assets) ↔ kit, nhóm khác
function groupOf(n) {
  if (/^--(color-|panel-)/.test(n) || n === '--overlay-scrim') return 'color';
  if (/^--(font-|letter-spacing-|line-height-)/.test(n)) return 'typography';
  if (/^--space-/.test(n)) return 'space';
  if (/^--radius-/.test(n)) return 'radius';
  if (/^--(motion-|ease-)/.test(n)) return 'motion';
  if (/^--shadow-/.test(n)) return 'shadow';
  if (/^--layer-/.test(n)) return 'layer';
  if (/^--icon-/.test(n)) return 'icon';
  return 'size/layout/component';
}
function kmGroupKey(n) {
  if (/^--space-/.test(n)) return 'space';
  if (/^--line-height-/.test(n)) return 'line_height';
  if (n === '--band-inset') return 'band_inset';
  if (n === '--tab-padding-inline') return 'tab_padding_inline';
  if (n === '--section-gap') return 'section_gap_mobile';
  return null;
}
const GROUP_KM_KEYS = ['space', 'line_height', 'band_inset', 'tab_padding_inline', 'section_gap_mobile'];
const lvl7 = opt.strict ? 'FAIL' : 'WARN';
const codeBase = new Map(cv.base);
const codeOverrides = [...cv.overrides];
for (const a of assets) {
  for (const [k, v] of a.base) if (!codeBase.has(k)) codeBase.set(k, v);
  codeOverrides.push(...a.overrides);
}
const codeScopes = Object.fromEntries(KIT_BPS.map((w) => [w, scopeAt(codeBase, codeOverrides, w)]));
const SKIP7 = new Set(['--font-primary--family', '--font-primary--weight', '--font-heading--family', '--font-heading--weight']);
const groupDiffs = new Map(GROUP_KM_KEYS.map((k) => [k, 0]));
const notBuilt = new Map();
const bpLabel = (w) => (w === 0 ? '' : `từ ${w}rem`);
for (const [name, rec] of kit.base) {
  if (kitHexColors.includes(name) || SKIP7.has(name)) continue;
  const gk = kmGroupKey(name);
  const code = codeBase.get(name);
  if (!code) {
    counters.otherWarn += opt.strict ? 0 : 1;
    if (gk) groupDiffs.set(gk, groupDiffs.get(gk) + 1);
    const g = groupOf(name);
    if (!notBuilt.has(g)) notBuilt.set(g, []);
    notBuilt.get(g).push(name);
    results.push({ level: lvl7, msg: '' });
    console.log(`${lvl7} css-variables ${name} chưa dựng ≠ ${kitVal(name)} (${P.kit}:${rec.line})${gk ? ` · lệch tạm (known_mismatches: ${gk})` : ''}`);
    continue;
  }
  for (const w of KIT_BPS) {
    const kv = kitVal(name, w);
    const cvv = codeScopes[w].has(name) ? finalValue(codeScopes[w].get(name), codeScopes[w]) : undefined;
    if (cvv !== undefined && sameValue(cvv, kv)) continue;
    const at = w ? codeOverrides.filter((o) => o.name === name && o.bp <= w).pop() ?? code : code;
    if (!opt.strict) counters.otherWarn++;
    if (gk) groupDiffs.set(gk, groupDiffs.get(gk) + 1);
    report(lvl7, at.file === P.cssvars ? 'css-variables' : 'assets', name, cvv, kv, at.file, at.line,
      [bpLabel(w), gk ? `lệch tạm (known_mismatches: ${gk})` : ''].filter(Boolean).join(' · '));
    break;
  }
}
for (const [g, names] of notBuilt) annotateOnly(lvl7, P.kit, kitLine(names[0]), `${lvl7} css-variables nhóm ${g}: ${names.length} biến kit chưa dựng: ${names.join(' ')}`);

// Biến kit khai ở assets/*.css (ADR 0015 mục 2: mọi biến :root ở css-variables.liquid)
const coverage = [];
for (const a of assets) {
  const rootNames = new Set([...a.base.keys(), ...a.overrides.map((o) => o.name)].filter((n) => kit.base.has(n)));
  const otherNames = new Set(a.other.map((o) => o.name).filter((n) => kit.base.has(n) && !rootNames.has(n)));
  if (rootNames.size + otherNames.size) coverage.push(`${a.file.replace(`${P.assets}/`, '')} ${rootNames.size + otherNames.size} (${rootNames.size} trong :root)`);
  for (const n of rootNames) {
    const rec = a.base.get(n) ?? a.overrides.find((o) => o.name === n);
    if (!opt.strict) counters.otherWarn++;
    report(lvl7, 'assets', n, 'khai trong :root', 'chỉ khai ở snippets/css-variables.liquid', a.file, rec.line, 'ADR 0015 mục 2');
  }
}

// Luật 6: khoá known_mismatches thừa
const settingIds = new Set([...colorSettings, ...fontSettings].map((s) => s.id));
for (const k of Object.keys(km)) {
  const line = jsonLine(['_source_of_truth', 'known_mismatches', k]);
  if (settingIds.has(k)) {
    if (settingMatched.get(k)) { counters.otherWarn++; report('WARN', 'tokens.json', `known_mismatches.${k}`, 'đã khớp kit', 'khoá thừa, xoá trong PR đóng lệch', P.tokens, line, 'luật 6'); }
  } else if (GROUP_KM_KEYS.includes(k)) {
    if (groupDiffs.get(k) === 0) { counters.otherWarn++; report('WARN', 'tokens.json', `known_mismatches.${k}`, 'nhóm đã khớp kit', 'khoá thừa, xoá trong PR đóng lệch', P.tokens, line, 'luật 6'); }
  } else if (!settings.has(k)) {
    counters.otherWarn++;
    report('WARN', 'tokens.json', `known_mismatches.${k}`, 'khoá không ánh xạ', 'setting id màu/font hoặc ' + GROUP_KM_KEYS.join('/'), P.tokens, line);
  }
}

// ---------- tổng kết ----------
const fails = results.filter((r) => r.level === 'FAIL').length;
const cvCount = [...kit.base.keys()].filter((n) => cv.base.has(n) || cv.overrides.some((o) => o.name === n)).length;
console.log(`phủ code: css-variables.liquid ${cvCount}/${kitCount} · assets ${coverage.length ? coverage.join(', ') : '0'}`);
console.log(`kit ${kitCount} · tokens.json lệch ${counters.tokensDiff} · màu ${colorMatch}/${kitHexColors.length}, lệch tạm ${colorTemp} · font ${fontMatch}/${fontSettings.length}, lệch tạm ${fontTemp} · nhóm khác WARN ${counters.otherWarn} · FAIL ${fails}${opt.strict ? ' · --strict' : ''}`);
process.exit(fails ? 1 : 0);
