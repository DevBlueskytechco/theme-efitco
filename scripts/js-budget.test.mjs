#!/usr/bin/env node
// ES1-T177: tự kiểm logic ngân sách JS của scripts/js-budget.mjs, không cần store, không cần npm ci. Chạy: node scripts/js-budget.test.mjs
import assert from 'node:assert/strict';
import { budgetCap, evaluateBudget, formatReport, isThemeJs, PRELOAD_MAX, SCROLL_MAX } from './js-budget.mjs';

const O = 'https://hoa-qua-nhap-khau.myshopify.com';
const js = (file, transferSize, extra = {}) => ({
  name: `${O}/cdn/shop/t/42/assets/${file}?v=1`,
  transferSize,
  encodedBodySize: Math.max(0, transferSize - 300),
  decodedBodySize: transferSize * 3,
  ...extra,
});
const CAPS = { preload: PRELOAD_MAX, scroll: SCROLL_MAX };
let n = 0;
const ok = (name, fn) => { fn(); n++; console.log(`ok ${n} - ${name}`); };

ok('lọc: chỉ JS trong assets theme', () => {
  assert.equal(isThemeJs(`${O}/cdn/shop/t/42/assets/motion.js?v=9`), true);
  assert.equal(isThemeJs('https://cdn.shopify.com/s/files/1/0/t/3/assets/motion.js'), true);
  assert.equal(isThemeJs(`${O}/cdn/shop/t/42/assets/base.css`), false);
  assert.equal(isThemeJs(`${O}/cdn/shop/extensions/abc/assets/app.js`), false);
  assert.equal(isThemeJs(`${O}/cdn/shopifycloud/storefront/assets/x.js`), false);
  assert.equal(isThemeJs(`${O}/cdn/wpm/b123.js`), false);
  assert.equal(isThemeJs('không phải url'), false);
});

ok('trong trần: không lỗi, tách tải sẵn / sau cuộn, không đếm trùng, bỏ JS app', () => {
  const pre = [js('motion.js', 3000), js('header-menu.js', 2000)];
  const after = [...pre, js('bundle-form.js', 2500), { ...js('x.js', 9999), name: `${O}/cdn/shop/extensions/a/assets/x.js` }];
  const r = evaluateBudget(pre, after, CAPS);
  assert.deepEqual(r.errors, []);
  assert.equal(r.preloadTotal, 5000);
  assert.equal(r.scrollTotal, 7500);
  assert.deepEqual(r.rows.map((x) => `${x.phase}:${x.file}`), ['tải sẵn:motion.js', 'tải sẵn:header-menu.js', 'sau cuộn:bundle-form.js']);
});

ok('vượt trần tải sẵn và sau cuộn: đỏ', () => {
  const pre = [js('a.js', 30_000), js('b.js', 11_000)];
  const r = evaluateBudget(pre, [...pre, js('c.js', 25_000)], CAPS);
  assert.equal(r.preloadTotal, 41_000);
  assert.equal(r.scrollTotal, 66_000);
  assert.equal(r.errors.length, 2);
  assert.match(r.errors[0], /tải sẵn 41000 B > trần 40960/);
  assert.match(r.errors[1], /sau cuộn 66000 B > trần 65536/);
});

ok('đúng bằng trần: đạt', () => {
  const pre = [js('a.js', PRELOAD_MAX)];
  assert.deepEqual(evaluateBudget(pre, [...pre, js('b.js', SCROLL_MAX - PRELOAD_MAX)], CAPS).errors, []);
});

ok('trần giả thấp hơn số thật: đỏ, báo cáo ghi TRẦN GIẢ', () => {
  const caps = { preload: budgetCap('1000', PRELOAD_MAX), scroll: budgetCap('2000', SCROLL_MAX) };
  const pre = [js('motion.js', 3000)];
  const r = evaluateBudget(pre, [...pre, js('slideshow.js', 2500)], caps);
  assert.equal(r.errors.length, 2);
  const report = formatReport('desktop /?view=figma', r, caps);
  assert.match(report[0], /TRẦN GIẢ/);
  assert.ok(report.some((l) => /TỔNG tải sẵn 3000 \/ 1000 B VƯỢT/.test(l)));
  assert.ok(report.some((l) => /TỔNG sau cuộn 5500 \/ 2000 B VƯỢT/.test(l)));
});

ok('env chỉ hạ được trần, không nâng', () => {
  assert.equal(budgetCap('999999', SCROLL_MAX), SCROLL_MAX);
  assert.equal(budgetCap(String(SCROLL_MAX), SCROLL_MAX), SCROLL_MAX);
  assert.equal(budgetCap('', PRELOAD_MAX), PRELOAD_MAX);
  assert.equal(budgetCap(undefined, PRELOAD_MAX), PRELOAD_MAX);
  assert.equal(budgetCap('abc', PRELOAD_MAX), PRELOAD_MAX);
  assert.equal(budgetCap('-5', PRELOAD_MAX), PRELOAD_MAX);
  assert.equal(budgetCap('1234.7', PRELOAD_MAX), 1234);
});

ok('không đo được (transferSize = encodedBodySize = 0): đỏ, không cộng 0 cho qua', () => {
  const pre = [js('motion.js', 0, { encodedBodySize: 0 })];
  const r = evaluateBudget(pre, pre, CAPS);
  assert.equal(r.rows[0].source, 'không đo được');
  assert.match(r.errors.join('\n'), /không đo được motion\.js/);
});

ok('cache (transferSize 0, encodedBodySize > 0): dùng encodedBodySize', () => {
  const pre = [js('motion.js', 0, { encodedBodySize: 4000 })];
  const r = evaluateBudget(pre, pre, CAPS);
  assert.equal(r.preloadTotal, 4000);
  assert.equal(r.rows[0].source, 'encodedBodySize');
  assert.deepEqual(r.errors, []);
});

ok('0 file JS theme: đỏ (bộ lọc hỏng hoặc đo nhầm trang)', () => {
  assert.match(evaluateBudget([], [], CAPS).errors[0], /0 file JS theme/);
});

ok('file > 8 192 B chưa nén: chỉ cảnh báo', () => {
  const pre = [js('motion.js', 3000, { decodedBodySize: 9161 })];
  const r = evaluateBudget(pre, pre, CAPS);
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings[0], /motion\.js 9161 B/);
});

// Phần trình duyệt: chỉ chạy khi có node_modules + Chromium (job lighthouse sau npm ci). Không gọi mạng: mọi request trả bằng route giả.
// Trang giả: 1 module tải sẵn, 1 module nạp khi phần tử cuối vào viewport (giống lazy-module.js), 1 script app không tính.
// JS_BUDGET_REQUIRE_BROWSER=1 (job lighthouse): thiếu trình duyệt là lỗi, không bỏ qua im lặng.
async function browserChecks() {
  const skip = (why) => {
    if (process.env.JS_BUDGET_REQUIRE_BROWSER === '1') throw new Error(`phần trình duyệt bắt buộc nhưng ${why}`);
    console.log(`bỏ qua phần trình duyệt: ${why}`);
  };
  let pw;
  try {
    pw = await import('@playwright/test');
  } catch {
    return skip('chưa npm ci');
  }
  const { chromium, devices } = pw.default ?? pw;
  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    return skip(`không mở được Chromium (${String(err.message).split('\n')[0]})`);
  }
  const html = `<!doctype html><html><head><title>t</title>
<script>window.Shopify={theme:{id:42}}</script>
<script type="module" src="/cdn/shop/t/42/assets/motion.js"></script>
<script src="/cdn/shop/extensions/app/assets/app.js"></script></head>
<body><div style="height:6000px">dài</div><div id="lazy">cuối</div>
<script>new IntersectionObserver((es,o)=>{if(es.some(e=>e.isIntersecting)){o.disconnect();import('/cdn/shop/t/42/assets/bundle-form.js')}}).observe(document.getElementById('lazy'))</script>
</body></html>`;
  const body = { 'motion.js': 'export const a=1;'.repeat(200), 'bundle-form.js': 'export const b=2;'.repeat(300), 'app.js': 'var c=3;'.repeat(500) };
  const prepare = (ctx) => ctx.route('**/*', (route) => {
    const p = new URL(route.request().url()).pathname;
    const file = p.split('/').pop();
    if (p === '/' || p === '') return route.fulfill({ status: 200, contentType: 'text/html', body: html, headers: { 'Timing-Allow-Origin': '*' } });
    if (body[file]) return route.fulfill({ status: 200, contentType: 'text/javascript', body: body[file], headers: { 'Timing-Allow-Origin': '*' } });
    return route.fulfill({ status: 404, body: '' });
  });
  try {
    for (const name of ['Desktop Chrome', 'Pixel 7']) {
      const r = await measureUrl(browser, devices[name], undefined, O, '42', '/', CAPS, prepare);
      ok(`trình duyệt ${name}: motion tải sẵn, bundle-form sau cuộn, bỏ JS app`, () => {
        assert.deepEqual(r.rows.map((x) => `${x.phase}:${x.file}`), ['tải sẵn:motion.js', 'sau cuộn:bundle-form.js']);
      });
      // Response từ route giả có thể không mang byte mạng (transferSize 0): khi đó chỉ kiểm phân loại, byte thật kiểm trên store.
      const measured = r.rows.every((x) => x.source !== 'không đo được');
      if (measured) {
        ok(`trình duyệt ${name}: có byte, sau cuộn > tải sẵn, trong trần`, () => {
          assert.ok(r.preloadTotal > 0 && r.scrollTotal > r.preloadTotal, JSON.stringify(r));
          assert.deepEqual(r.errors, []);
        });
      } else console.log(`route giả không có transferSize/encodedBodySize trên ${name}: bỏ kiểm byte`);
      const low = await measureUrl(browser, devices[name], undefined, O, '42', '/', { preload: 1, scroll: 1 }, prepare);
      for (const line of formatReport(`${name} / (trang giả, trần giả)`, low, { preload: 1, scroll: 1 })) console.log(line);
      ok(`trình duyệt ${name}: trần giả 1 B thì đỏ`, () => assert.ok(low.errors.length >= (measured ? 2 : 1), low.errors.join('; ')));
    }
    await assert.rejects(measureUrl(browser, devices['Desktop Chrome'], undefined, O, '99', '/', CAPS, prepare), /đo nhầm theme/);
    ok('trình duyệt: theme id khác preview thì lỗi đo nhầm theme', () => {});
  } finally {
    await browser.close();
  }
}

await browserChecks();
console.log(`js-budget.test: ${n} ok`);
