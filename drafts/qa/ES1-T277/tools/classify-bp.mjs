// ES1-T277 mục 2–4: đọc lhr JSON, liệt kê audit Best Practices bị trừ điểm, phân loại từng item theo nguồn
// (theme / nền tảng Shopify / store dev / cần xác minh), tính điểm BP tối đa nếu sửa hết phần do theme.
// Dùng: node drafts/qa/ES1-T277/tools/classify-bp.mjs <thư mục lhr | file lhr...> [--md out.md] [--json out.json]
// Không gọi mạng, không cần store.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';

export const SOURCE = { THEME: 'theme', PLATFORM: 'nen-tang-shopify', STORE: 'store-dev', VERIFY: 'can-xac-minh' };

// Thứ tự quan trọng: luật đầu tiên khớp thắng. Mỗi luật có ghi chú để báo cáo dẫn lại.
const URL_RULES = [
  // Store dev / hạ tầng trước Shopify: Cloudflare bot management, password, app, preview bar
  [/challenges\.cloudflare\.com|\/cdn-cgi\//, SOURCE.STORE, 'Cloudflare bot management trước storefront (IP CI, store dev)'],
  [/\/password(\?|$|\/)/, SOURCE.STORE, 'trang password store dev'],
  [/cdn\.shopify\.com\/extensions\/|\/cdn\/shop\/extensions\/|\/apps\//, SOURCE.STORE, 'app / theme app extension cài trên store'],
  [/preview_bar|\/admin\//, SOURCE.STORE, 'thanh preview / admin'],
  // Nền tảng Shopify
  [/shop\.app\//, SOURCE.PLATFORM, 'Shop Pay / Shop (shop.app)'],
  [/pay\.shopify\.com|\/portable-wallets|accelerated-checkout|shopify-pay/, SOURCE.PLATFORM, 'Shop Pay / accelerated checkout'],
  [/monorail|shopifysvc\.com/, SOURCE.PLATFORM, 'monorail analytics'],
  [/trekkie/, SOURCE.PLATFORM, 'trekkie analytics'],
  [/\/wpm@|\/web-pixels|web-pixel|\/cdn\/wpm\//, SOURCE.PLATFORM, 'web-pixels manager'],
  [/otlp|\/api\/collect|perf-kit/, SOURCE.PLATFORM, 'telemetry (otlp, perf-kit)'],
  [/\/checkouts\/internal\/preloads|consent-tracking|privacy-banner|customer-privacy/, SOURCE.PLATFORM, 'checkout preload / consent'],
  [/\/cdn\/shopifycloud\/|cdn\.shopify\.com\/shopifycloud\/|shop-js|login_with_shop|shop_follow|storefront-renderer/, SOURCE.PLATFORM, 'shopifycloud (script nền tảng)'],
  // Theme: asset của theme (cùng origin hoặc CDN)
  [/\/cdn\/shop\/t\/\d+\/assets\/|cdn\.shopify\.com\/s\/files\/.+\/t\/\d+\/assets\//, SOURCE.THEME, 'asset theme (assets/*)'],
];

// Audit chấm trên DOM do Liquid của theme dựng: mặc định theme, trừ khi node/ảnh khớp luật app/nền tảng.
const DOM_AUDITS = new Set(['paste-preventing-inputs', 'image-aspect-ratio', 'image-size-responsive', 'viewport', 'font-size', 'doctype', 'charset']);
// Audit giao thức / trình duyệt: trang https của Shopify, theme không đổi được.
const PROTOCOL_AUDITS = new Set(['is-on-https', 'redirects-http']);

export function classifyUrl(url, { documentUrl } = {}) {
  if (!url) return { source: SOURCE.VERIFY, why: 'không có URL nguồn' };
  for (const [re, source, why] of URL_RULES) if (re.test(url)) return { source, why };
  if (/^https:\/\/cdn\.shopify\.com\/s\/files\/|\/cdn\/shop\/(files|products|articles|collections)\//.test(url)) {
    return { source: SOURCE.THEME, why: 'ảnh store do block theme render (sizes/srcset/CSS của theme)' };
  }
  if (documentUrl && stripQuery(url) === stripQuery(documentUrl)) {
    // Inline trong HTML: có thể từ Liquid theme hoặc từ content_for_header. Không đoán.
    return { source: SOURCE.VERIFY, why: 'script inline trong HTML (theme hoặc content_for_header)' };
  }
  return { source: SOURCE.VERIFY, why: 'URL chưa có luật' };
}

const stripQuery = (u) => String(u).split('#')[0].split('?')[0];

// Lấy URL nguồn của 1 item tuỳ audit.
export function itemUrls(auditId, item) {
  const urls = [];
  const push = (u) => u && urls.push(u);
  if (auditId === 'deprecations') push(item.source?.url);
  else if (auditId === 'errors-in-console') {
    push(item.sourceLocation?.url);
    // Lỗi mạng: URL nằm trong description ("Failed to load resource ..." không có URL thì dùng sourceLocation)
    const m = /https?:\/\/[^\s'")]+/.exec(item.description || '');
    if (!urls.length && m) push(m[0]);
  } else if (auditId === 'third-party-cookies') push(item.url);
  else if (auditId === 'inspector-issues') for (const s of item.subItems?.items || []) push(s.url);
  else if (auditId === 'image-aspect-ratio' || auditId === 'image-size-responsive') push(item.url);
  else push(item.url || item.source?.url || item.sourceLocation?.url);
  return urls;
}

export function describeItem(auditId, item) {
  switch (auditId) {
    case 'deprecations': return item.value;
    case 'errors-in-console': return `[${item.source}] ${item.description}`;
    case 'third-party-cookies': return `cookie ${item.name}`;
    case 'inspector-issues': return `issue ${item.issueType}`;
    case 'image-aspect-ratio': return `hiển thị ${item.displayedAspectRatio}, thực ${item.actualAspectRatio}`;
    case 'image-size-responsive': return `hiển thị ${item.displayedSize}, thực ${item.actualSize}, cần ${item.expectedSize}`;
    default: return item.node?.snippet || item.description || item.value || JSON.stringify(item).slice(0, 160);
  }
}

// Phân loại 1 item → danh sách {url, source, why}. Item không có URL: DOM audit → theme, còn lại → cần xác minh.
export function classifyItem(auditId, item, documentUrl) {
  if (PROTOCOL_AUDITS.has(auditId)) return [{ url: documentUrl, source: SOURCE.PLATFORM, why: 'giao thức do Shopify phục vụ' }];
  // Biến thể -isolated của run-bp.mjs chặn script nền tảng; Chrome log ERR_BLOCKED_BY_CLIENT cho mỗi request bị chặn
  if (auditId === 'errors-in-console' && /ERR_BLOCKED_BY_CLIENT/.test(item.description || '')) {
    return [{ url: item.sourceLocation?.url || null, source: SOURCE.PLATFORM, why: 'request nền tảng bị chặn khi đo cô lập (BP_ISOLATE)' }];
  }
  const urls = itemUrls(auditId, item);
  if (!urls.length) {
    if (DOM_AUDITS.has(auditId)) return [{ url: null, source: SOURCE.THEME, why: 'DOM/markup do Liquid theme dựng' }];
    return [{ url: null, source: SOURCE.VERIFY, why: 'item không có URL' }];
  }
  return urls.map((url) => {
    const c = classifyUrl(url, { documentUrl });
    if (c.source === SOURCE.VERIFY && DOM_AUDITS.has(auditId)) return { url, source: SOURCE.THEME, why: 'DOM/markup do Liquid theme dựng' };
    return { url, ...c };
  });
}

// Nguồn của cả item: theme chỉ khi mọi URL là theme; có URL ngoài theme thì lấy nguồn ngoài theme đầu tiên.
export function itemSource(parts) {
  const nonTheme = parts.find((p) => p.source !== SOURCE.THEME);
  return nonTheme ? nonTheme.source : SOURCE.THEME;
}

export function analyzeLhr(lhr, name = '') {
  const cat = lhr.categories?.['best-practices'];
  if (!cat) return { name, error: 'lhr không có category best-practices' };
  const documentUrl = lhr.finalDisplayedUrl || lhr.finalUrl || lhr.requestedUrl;
  const refs = cat.auditRefs.filter((r) => r.weight > 0);
  const totalWeight = refs.reduce((s, r) => s + r.weight, 0);
  const failing = [];
  let sum = 0, sumIfThemeFixed = 0, sumIfThemeAndVerifyFixed = 0;
  for (const ref of refs) {
    const a = lhr.audits[ref.id];
    const score = a?.score ?? 0;
    sum += score * ref.weight;
    if (score >= 1) { sumIfThemeFixed += ref.weight; sumIfThemeAndVerifyFixed += ref.weight; continue; }
    const items = (a?.details?.items || []).map((it) => {
      const parts = classifyItem(ref.id, it, documentUrl);
      return { text: describeItem(ref.id, it), parts, source: itemSource(parts) };
    });
    // Audit không có item mà vẫn trượt (viewport, doctype, charset...) → 1 item tổng quát
    if (!items.length) {
      const parts = classifyItem(ref.id, {}, documentUrl);
      items.push({ text: a?.displayValue || a?.explanation || a?.title || ref.id, parts, source: itemSource(parts) });
    }
    const sources = new Set(items.map((i) => i.source));
    const themeOnly = sources.size === 1 && sources.has(SOURCE.THEME);
    const themeOrVerify = [...sources].every((s) => s === SOURCE.THEME || s === SOURCE.VERIFY);
    if (themeOnly) sumIfThemeFixed += ref.weight;
    else sumIfThemeFixed += score * ref.weight;
    if (themeOrVerify) sumIfThemeAndVerifyFixed += ref.weight;
    else sumIfThemeAndVerifyFixed += score * ref.weight;
    failing.push({ id: ref.id, title: a?.title, weight: ref.weight, score, sources: [...sources], items });
  }
  const round = (v) => Math.round(v * 100) / 100;
  return {
    name,
    url: documentUrl,
    formFactor: lhr.configSettings?.formFactor,
    lighthouseVersion: lhr.lighthouseVersion,
    runtimeError: lhr.runtimeError?.code || null,
    reported: cat.score,
    recomputed: totalWeight ? round(sum / totalWeight) : null,
    totalWeight,
    maxIfThemeFixed: totalWeight ? round(sumIfThemeFixed / totalWeight) : null,
    maxIfThemeAndVerifyFixed: totalWeight ? round(sumIfThemeAndVerifyFixed / totalWeight) : null,
    failing,
  };
}

function listFiles(args) {
  const out = [];
  for (const a of args) {
    if (statSync(a).isDirectory()) for (const f of readdirSync(a).sort()) { if (f.endsWith('.json')) out.push(join(a, f)); }
    else out.push(a);
  }
  return out;
}

export function toMarkdown(results) {
  const L = [];
  L.push('| lhr | form factor | URL | BP báo | BP tính lại | tổng trọng số | tối đa nếu sửa phần theme | tối đa nếu sửa cả mục cần xác minh |');
  L.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of results) {
    if (r.error) { L.push(`| ${r.name} | | | lỗi: ${r.error} | | | | |`); continue; }
    L.push(`| ${r.name} | ${r.formFactor} | ${String(r.url).split('?')[0]} | ${r.reported} | ${r.recomputed} | ${r.totalWeight} | ${r.maxIfThemeFixed} | ${r.maxIfThemeAndVerifyFixed} |`);
  }
  L.push('');
  L.push('| lhr | audit | trọng số | nguồn | item | URL | lý do phân loại |');
  L.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const r of results) for (const f of r.failing || []) for (const it of f.items) for (const p of it.parts) {
    const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 200);
    L.push(`| ${r.name} | ${f.id} | ${f.weight} | ${p.source} | ${cell(it.text)} | ${cell(p.url)} | ${cell(p.why)} |`);
  }
  return L.join('\n') + '\n';
}

const isMain = process.argv[1] && basename(process.argv[1]) === 'classify-bp.mjs';
if (isMain) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
  const mdOut = opt('--md'), jsonOut = opt('--json');
  if (!args.length) { console.error('Dùng: classify-bp.mjs <thư mục lhr | file lhr...> [--md out.md] [--json out.json]'); process.exit(2); }
  const results = listFiles(args).map((f) => analyzeLhr(JSON.parse(readFileSync(f, 'utf8')), basename(f, '.json')));
  const md = toMarkdown(results);
  if (mdOut) writeFileSync(mdOut, md); else process.stdout.write(md);
  if (jsonOut) writeFileSync(jsonOut, JSON.stringify(results, null, 2));
}
