#!/usr/bin/env node
// ES1-T177 (ADR 0006, ADR 0010): ngân sách JS theme theo URL trên theme preview, chặn merge qua check `lighthouse`.
// Mỗi URL × (desktop, Pixel 7) mở trong context mới (cache trống): chụp performance resource lúc tải xong (tải sẵn),
// cuộn hết trang, chờ hết JS mới, chụp lại (sau cuộn). Cộng transferSize file /t/<số>/assets/*.js. Không bấm gì:
// JS nạp theo tương tác (predictive search, quick view, quiz, featured product) không tính (ADR 0010).
// Trần: tải sẵn ≤ 40 960 B, sau cuộn ≤ 65 536 B. Env JS_BUDGET_PRELOAD_MAX / JS_BUDGET_SCROLL_MAX chỉ HẠ được trần (chứng minh đỏ).
// Dùng: STORE_ORIGIN=https://hoa-qua-nhap-khau.myshopify.com THEME_ID=<preview id> STORE_PASSWORD=... node scripts/js-budget.mjs
// Tuỳ chọn: JS_BUDGET_PRODUCT (mặc định BENCH_PRODUCT, rồi TE4_VARIANTS_HANDLE trong tests/e2e/store-data.json),
//   JS_BUDGET_CART_PRODUCT (mặc định TE4_SINGLE_HANDLE), JS_BUDGET_PROJECTS=desktop,mobile.
// Thoát: 0 đạt; 1 vượt trần / đo nhầm theme / lỗi trang (lỗi code); 3 chỉ có lỗi store (429, Cloudflare, 5xx) — vẫn đỏ, ghi rõ không phải lỗi code.
// Chỉ đọc storefront, ghi duy nhất 1 giỏ hàng tạm của phiên (POST /cart/add.js) để đo /cart có hàng. Không gọi Admin, không đổi theme.
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const PRELOAD_MAX = 40_960;
export const SCROLL_MAX = 65_536;
export const FILE_MAX = 8_192; // AGENTS.md, byte chưa nén: chỉ cảnh báo, DoD BE kiểm bằng wc -c
const THEME_JS = /\/t\/\d+\/assets\/[^/]+\.js$/;

export function isThemeJs(url) {
  try {
    return THEME_JS.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

// Chỉ hạ được: rỗng, sai số, ≤ 0, ≥ mặc định thì giữ mặc định.
export function budgetCap(value, fallback) {
  const n = Number(value);
  return value && Number.isFinite(n) && n > 0 && n < fallback ? Math.floor(n) : fallback;
}

// transferSize 0 + encodedBodySize > 0: từ cache → dùng encodedBodySize. Cả hai 0: cross-origin thiếu Timing-Allow-Origin → không đo được, đỏ.
function measure(e) {
  if (e.transferSize > 0) return { bytes: e.transferSize, source: 'transferSize' };
  if (e.encodedBodySize > 0) return { bytes: e.encodedBodySize, source: 'encodedBodySize' };
  return { bytes: 0, source: 'không đo được' };
}

function toRows(entries, phase, seen) {
  const rows = [];
  for (const e of entries) {
    if (!isThemeJs(e.name) || seen.has(e.name)) continue;
    seen.add(e.name);
    rows.push({ file: new URL(e.name).pathname.split('/').pop(), url: e.name, decoded: e.decodedBodySize, phase, ...measure(e) });
  }
  return rows;
}

// preload: entry lúc tải xong chưa cuộn; afterScroll: mọi entry sau cuộn (gồm preload). Không đếm trùng URL.
export function evaluateBudget(preload, afterScroll, caps) {
  const seen = new Set();
  const rows = [...toRows(preload, 'tải sẵn', seen), ...toRows(afterScroll, 'sau cuộn', seen)];
  const sum = (list) => list.reduce((s, r) => s + r.bytes, 0);
  const preloadTotal = sum(rows.filter((r) => r.phase === 'tải sẵn'));
  const scrollTotal = sum(rows);
  const errors = [];
  const warnings = [];
  if (!rows.length) errors.push('0 file JS theme: bộ lọc /t/<số>/assets/*.js không khớp hoặc trang không phải theme, không đo được');
  for (const r of rows.filter((x) => x.source === 'không đo được')) errors.push(`không đo được ${r.file}: transferSize = encodedBodySize = 0 (cross-origin thiếu Timing-Allow-Origin?)`);
  if (preloadTotal > caps.preload) errors.push(`JS tải sẵn ${preloadTotal} B > trần ${caps.preload} B`);
  if (scrollTotal > caps.scroll) errors.push(`JS sau cuộn ${scrollTotal} B > trần ${caps.scroll} B`);
  for (const r of rows.filter((x) => x.decoded > FILE_MAX)) warnings.push(`${r.file} ${r.decoded} B chưa nén > ${FILE_MAX} B/file (AGENTS.md)`);
  return { rows, preloadTotal, scrollTotal, errors, warnings };
}

export function formatReport(label, result, caps) {
  const fake = caps.preload < PRELOAD_MAX || caps.scroll < SCROLL_MAX ? '  [TRẦN GIẢ, chỉ để chứng minh cổng đỏ]' : '';
  const lines = [`[js-budget] ${label}${fake}`, '[js-budget]   lúc        transfer(B)  chưa nén(B)  nguồn             file'];
  for (const r of result.rows) {
    lines.push(`[js-budget]   ${r.phase.padEnd(9)}  ${String(r.bytes).padStart(11)}  ${String(r.decoded).padStart(11)}  ${r.source.padEnd(16)}  ${r.file}`);
  }
  const mark = (v, cap) => (v > cap ? 'VƯỢT' : 'ok');
  lines.push(`[js-budget]   TỔNG tải sẵn ${result.preloadTotal} / ${caps.preload} B ${mark(result.preloadTotal, caps.preload)}`);
  lines.push(`[js-budget]   TỔNG sau cuộn ${result.scrollTotal} / ${caps.scroll} B ${mark(result.scrollTotal, caps.scroll)}`);
  for (const w of result.warnings) lines.push(`[js-budget]   cảnh báo: ${w}`);
  return lines;
}

// ---- Đo trên store (chỉ chạy khi gọi trực tiếp; test offline chỉ import phần trên) ----

class StoreError extends Error {} // lỗi môi trường store dev, không phải lỗi code
const CHALLENGE_TITLE = /just a moment|attention required|verify(ing)? you are human|connection needs to be verified/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let hits429 = 0;

function storeData(name) {
  try {
    const v = JSON.parse(readFileSync('tests/e2e/store-data.json', 'utf8'))[name];
    return typeof v === 'string' && v.trim() ? v.trim() : undefined;
  } catch {
    return undefined;
  }
}
const envOr = (...names) => names.map((n) => process.env[n]?.trim()).find(Boolean);

// 429: chờ 2, 4, 8 s (Retry-After nếu có, tối đa 10 s) rồi thử lại. Cloudflare challenge, 5xx: lỗi store. 4xx khác: lỗi code/cấu hình.
async function gotoStore(page, url) {
  for (let tries = 1; ; tries++) {
    const res = await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
    const status = res?.status() ?? 0;
    if (res?.headers()['cf-mitigated'] === 'challenge') throw new StoreError(`bị Cloudflare chặn (cf-mitigated, status ${status}) tại ${url}`);
    if (status === 429) {
      hits429++;
      if (tries > 3) throw new StoreError(`store trả 429 cho ${url} sau ${tries} lần thử`);
      const after = Number(res.headers()['retry-after']);
      await sleep(Number.isFinite(after) && after > 0 ? Math.min(after, 10) * 1000 : 2000 * 2 ** (tries - 1));
      continue;
    }
    if (status >= 500) throw new StoreError(`store trả ${status} cho ${url}`);
    if (status >= 400) throw new Error(`trang trả ${status}: ${url} (handle sai hoặc trang lỗi)`);
    if (CHALLENGE_TITLE.test(await page.title())) throw new StoreError(`bị Cloudflare chặn (title) tại ${url}`);
    return res;
  }
}

const resourceEntries = (page) =>
  page.evaluate(() => performance.getEntriesByType('resource').map((e) => ({ name: e.name, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, decodedBodySize: e.decodedBodySize })));

// Không dùng networkidle (video, Shop giữ kết nối: ES1-T224). Chờ số file JS theme đứng yên quietMs, tối đa maxMs.
async function settle(page, quietMs, maxMs = 15_000) {
  const count = async () => (await resourceEntries(page)).filter((e) => isThemeJs(e.name)).length;
  let last = await count();
  let stableSince = Date.now();
  for (const start = Date.now(); Date.now() - start < maxMs; ) {
    await sleep(250);
    const now = await count();
    if (now !== last) { last = now; stableSince = Date.now(); }
    else if (Date.now() - stableSince >= quietMs) return;
  }
}

// Cuộn từng 80% màn hình tới đáy; trang dài thêm khi cuộn thì cuộn tiếp. Tối đa 400 bước.
async function scrollToEnd(page) {
  const atEnd = () => page.evaluate(() => Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2);
  for (let i = 0; i < 400; i++) {
    await page.evaluate(() => window.scrollBy(0, Math.round(window.innerHeight * 0.8)));
    await sleep(200);
    if (await atEnd()) {
      await sleep(600);
      if (await atEnd()) return;
    }
  }
  throw new Error('cuộn 400 bước chưa tới đáy trang');
}

function withPreview(origin, path, themeId) {
  const u = new URL(path, origin);
  if (themeId) { u.searchParams.set('preview_theme_id', themeId); u.searchParams.set('pb', '0'); }
  return u.href;
}

async function unlock(browser, origin, themeId) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoStore(page, `${origin}/password`);
  if (await page.locator('form[action*="password"] input[type="password"]').count()) {
    await page.fill('form[action*="password"] input[type="password"]', process.env.STORE_PASSWORD || '');
    await Promise.all([
      page.waitForURL((u) => !u.pathname.startsWith('/password'), { timeout: 30_000 }),
      page.locator('form[action*="password"]').evaluate((f) => f.submit()),
    ]);
  }
  await gotoStore(page, withPreview(origin, '/', themeId));
  if (new URL(page.url()).pathname.startsWith('/password')) throw new Error('không mở khoá được store: kiểm STORE_PASSWORD');
  const state = await ctx.storageState();
  await ctx.close();
  return state;
}

// Giỏ có 1 dòng để /cart nạp cart-items.js như thật. Lấy variant id từ form sản phẩm (không gọi JSON /products/*.js).
// Context riêng: trang sản phẩm không làm ấm cache của context đo /cart.
async function seedCart(browser, device, state, origin, themeId, handle) {
  const ctx = await browser.newContext({ ...device, storageState: state });
  try {
    const page = await ctx.newPage();
    await gotoStore(page, withPreview(origin, `/products/${encodeURIComponent(handle)}`, themeId));
    const id = await page.locator('[data-testid="product-form-variant-id"], form[action*="/cart/add"] input[name="id"]').first().inputValue({ timeout: 10_000 });
    const res = await page.evaluate(async (variant) => {
      const r = await fetch(`${window.Shopify?.routes?.root ?? '/'}cart/add.js`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: [{ id: Number(variant), quantity: 1 }] }) });
      return { status: r.status, cf: r.headers.get('cf-mitigated') };
    }, id);
    if (res.status === 429) hits429++;
    if (res.status === 429 || res.cf === 'challenge' || res.status >= 500) throw new StoreError(`POST /cart/add.js trả ${res.status}${res.cf ? ' (Cloudflare)' : ''}`);
    if (res.status >= 400) throw new Error(`POST /cart/add.js trả ${res.status} (variant ${id} của ${handle})`);
    return await ctx.storageState();
  } finally {
    await ctx.close();
  }
}

// prepare(ctx): chỉ cho scripts/js-budget.test.mjs gắn route giả, chạy thật thì bỏ trống.
export async function measureUrl(browser, device, state, origin, themeId, path, caps, prepare) {
  const ctx = await browser.newContext({ ...device, storageState: state });
  if (prepare) await prepare(ctx);
  // Mặc định Chromium giữ 250 entry resource: trang chủ cuộn hết có thể vượt, mất entry JS cuối.
  await ctx.addInitScript(() => performance.setResourceTimingBufferSize(5000));
  try {
    const page = await ctx.newPage();
    await gotoStore(page, withPreview(origin, path, themeId));
    if (themeId) {
      const got = await page.evaluate(() => window.Shopify?.theme?.id);
      if (String(got) !== String(themeId)) throw new Error(`đo nhầm theme: trang chạy theme ${got}, cần preview ${themeId}`);
    }
    await settle(page, 1_000);
    const preload = await resourceEntries(page);
    await scrollToEnd(page);
    await settle(page, 2_000);
    const afterScroll = await resourceEntries(page);
    return evaluateBudget(preload, afterScroll, caps);
  } finally {
    await ctx.close();
  }
}

function summaryMarkdown(results, caps) {
  const out = ['### Ngân sách JS theo URL (ES1-T177, ADR 0006)', '', `Trần: tải sẵn ${caps.preload} B, sau cuộn ${caps.scroll} B`, '', '| Máy | URL | Tải sẵn (B) | Sau cuộn (B) | Kết quả |', '| --- | --- | --- | --- | --- |'];
  for (const r of results) {
    const status = r.storeError ? `lỗi store: ${r.storeError}` : r.error ? `lỗi: ${r.error}` : r.result.errors.length ? `ĐỎ: ${r.result.errors.join('; ')}` : 'đạt';
    out.push(`| ${r.project} | \`${r.path}\` | ${r.result?.preloadTotal ?? '-'} | ${r.result?.scrollTotal ?? '-'} | ${status} |`);
  }
  return out.join('\n') + '\n';
}

async function main() {
  const origin = (process.env.STORE_ORIGIN || '').replace(/\/$/, '');
  if (!/^https:\/\/hoa-qua-nhap-khau\.myshopify\.com$/.test(origin)) {
    console.error(`::error::STORE_ORIGIN phải là https://hoa-qua-nhap-khau.myshopify.com, nhận '${origin}'`);
    process.exit(2);
  }
  const themeId = process.env.THEME_ID?.trim() || '';
  if (!themeId) console.log('::warning::THEME_ID trống: đo theme đang live của store dev, không kiểm id theme');
  const caps = { preload: budgetCap(process.env.JS_BUDGET_PRELOAD_MAX, PRELOAD_MAX), scroll: budgetCap(process.env.JS_BUDGET_SCROLL_MAX, SCROLL_MAX) };
  const product = envOr('JS_BUDGET_PRODUCT', 'BENCH_PRODUCT') ?? storeData('TE4_VARIANTS_HANDLE');
  const cartProduct = envOr('JS_BUDGET_CART_PRODUCT') ?? storeData('TE4_SINGLE_HANDLE');
  if (!product || !cartProduct) {
    console.error('::error::thiếu handle sản phẩm: JS_BUDGET_PRODUCT/BENCH_PRODUCT hoặc TE4_VARIANTS_HANDLE, TE4_SINGLE_HANDLE trong tests/e2e/store-data.json');
    process.exit(2);
  }
  const urls = ['/?view=figma', '/', `/products/${encodeURIComponent(product)}`, '/collections/all', '/cart', '/search?q=bench'];
  const projects = (process.env.JS_BUDGET_PROJECTS || 'desktop,mobile').split(',').map((s) => s.trim()).filter(Boolean);

  const pw = await import('@playwright/test');
  const { chromium, devices } = pw.default ?? pw;
  const DEVICES = { desktop: devices['Desktop Chrome'], mobile: devices['Pixel 7'] };
  const browser = await chromium.launch();
  const results = [];
  try {
    const state = await unlock(browser, origin, themeId);
    for (const project of projects) {
      const device = DEVICES[project];
      if (!device) throw new Error(`project lạ: ${project} (desktop, mobile)`);
      for (const path of urls) {
        const row = { project, path };
        try {
          let ctxState = state;
          if (path === '/cart') ctxState = await seedCart(browser, device, state, origin, themeId, cartProduct);
          row.result = await measureUrl(browser, device, ctxState, origin, themeId, path, caps);
          for (const line of formatReport(`${project} ${path}`, row.result, caps)) console.log(line);
          for (const e of row.result.errors) console.log(`::error title=Ngân sách JS ${project} ${path}::${e}`);
          for (const w of row.result.warnings) console.log(`::warning title=JS > 8 KB/file::${w}`);
        } catch (err) {
          if (err instanceof StoreError) {
            row.storeError = err.message;
            console.log(`::error title=Lỗi store dev, không phải lỗi code::${project} ${path}: ${err.message}. Chạy lại khi store hết chặn.`);
          } else {
            row.error = err?.message ?? String(err);
            console.log(`::error title=Ngân sách JS ${project} ${path}::${row.error}`);
          }
        }
        results.push(row);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`[js-budget] số_lần_429=${hits429}`);
  const md = summaryMarkdown(results, caps);
  console.log(md);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  const codeFail = results.some((r) => r.error || r.result?.errors.length);
  const storeFail = results.some((r) => r.storeError);
  process.exit(codeFail ? 1 : storeFail ? 3 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(`::error::js-budget: ${err?.stack ?? err}`);
    process.exit(err instanceof StoreError ? 3 : 1);
  });
}
