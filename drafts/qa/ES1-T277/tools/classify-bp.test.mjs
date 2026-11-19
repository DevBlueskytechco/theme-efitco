// ES1-T277: test bộ phân loại trên lhr GIẢ LẬP (không phải số đo thật). Dùng: node --test drafts/qa/ES1-T277/tools/
import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeLhr, classifyUrl, SOURCE, toMarkdown } from './classify-bp.mjs';

const ORIGIN = 'https://hoa-qua-nhap-khau.myshopify.com';
// Trọng số Lighthouse 12.1 (node_modules/lighthouse/core/config/default-config.js), category best-practices
const W = { 'is-on-https': 5, 'redirects-http': 1, 'geolocation-on-start': 1, 'notification-on-start': 1, 'csp-xss': 0,
  'paste-preventing-inputs': 3, 'image-aspect-ratio': 1, 'image-size-responsive': 1, viewport: 1, 'font-size': 1,
  doctype: 1, charset: 1, 'js-libraries': 0, deprecations: 5, 'third-party-cookies': 5, 'errors-in-console': 1,
  'valid-source-maps': 0, 'inspector-issues': 1 };

// Dựng lhr tối thiểu: notApplicable → weight 0 trong auditRefs (giống lhr thật sau scoring)
function makeLhr({ formFactor = 'mobile', path = '/', na = ['redirects-http'], fail = {} }) {
  const audits = {};
  const auditRefs = [];
  for (const [id, w] of Object.entries(W)) {
    const isNa = na.includes(id);
    audits[id] = isNa ? { id, score: null, scoreDisplayMode: 'notApplicable' }
      : fail[id] ? { id, title: id, score: 0, scoreDisplayMode: 'binary', details: { type: 'table', items: fail[id] } }
        : { id, score: 1, scoreDisplayMode: 'binary' };
    auditRefs.push({ id, weight: isNa ? 0 : w });
  }
  let sum = 0, tot = 0;
  for (const r of auditRefs) if (r.weight > 0) { tot += r.weight; sum += (audits[r.id].score ?? 0) * r.weight; }
  return {
    lighthouseVersion: '12.1.0', finalDisplayedUrl: `${ORIGIN}${path}`, configSettings: { formFactor },
    categories: { 'best-practices': { score: Math.round((sum / tot) * 100) / 100, auditRefs } }, audits,
  };
}

const shopAppCookie = [{ name: '_shop_app_essential', url: 'https://shop.app/pay/hop' }];
const shopAppIssue = [{ issueType: 'Cookie', subItems: { type: 'subitems', items: [{ url: 'https://shop.app/pay/hop' }] } }];

test('TC-07 giả thuyết H1: cookie shop.app làm trượt third-party-cookies + inspector-issues, mobile 22/28 = 0.79, sửa theme không đổi', () => {
  const r = analyzeLhr(makeLhr({ fail: { 'third-party-cookies': shopAppCookie, 'inspector-issues': shopAppIssue } }), 'h1');
  assert.equal(r.totalWeight, 28);
  assert.equal(r.reported, 0.79);
  assert.equal(r.recomputed, 0.79);
  assert.equal(r.maxIfThemeFixed, 0.79);
  assert.deepEqual(r.failing.map((f) => f.sources), [[SOURCE.PLATFORM], [SOURCE.PLATFORM]]);
});

test('TC-08 desktop: font-size N/A → tổng trọng số 27; lỗi theme + nền tảng tách đúng, điểm tối đa chỉ cộng phần theme', () => {
  const lhr = makeLhr({
    formFactor: 'desktop', path: '/products/x', na: ['redirects-http', 'font-size'],
    fail: {
      deprecations: [{ value: 'Unload event listeners are deprecated', source: { type: 'source-location', url: `${ORIGIN}/cdn/shop/t/12/assets/product-form.js?v=1`, line: 1, column: 1 } }],
      'errors-in-console': [{ source: 'network', description: 'Failed to load resource: 403', sourceLocation: { url: 'https://shop.app/pay/session' } }],
      'image-size-responsive': [{ url: `${ORIGIN}/cdn/shop/files/a.jpg?v=1&width=360`, displayedSize: '400 x 400', actualSize: '360 x 360', expectedSize: '700 x 700' }],
    },
  });
  const r = analyzeLhr(lhr, 'h2');
  assert.equal(r.totalWeight, 27);
  assert.equal(r.recomputed, Math.round((20 / 27) * 100) / 100); // mất 5 + 1 + 1
  assert.equal(r.maxIfThemeFixed, Math.round((26 / 27) * 100) / 100); // chỉ còn errors-in-console (shop.app)
  const src = Object.fromEntries(r.failing.map((f) => [f.id, f.sources[0]]));
  assert.deepEqual(src, { deprecations: SOURCE.THEME, 'image-size-responsive': SOURCE.THEME, 'errors-in-console': SOURCE.PLATFORM });
});

test('TC-09 audit trộn nguồn: còn 1 item ngoài theme thì audit vẫn trượt khi tính tối đa', () => {
  const lhr = makeLhr({ fail: { deprecations: [
    { value: 'a', source: { url: `${ORIGIN}/cdn/shop/t/12/assets/motion.js` } },
    { value: 'b', source: { url: `${ORIGIN}/cdn/shopifycloud/portable-wallets/latest/x.js` } },
  ] } });
  const r = analyzeLhr(lhr, 'mix');
  assert.equal(r.maxIfThemeFixed, r.recomputed);
  assert.deepEqual(r.failing[0].sources.sort(), [SOURCE.PLATFORM, SOURCE.THEME].sort());
});

test('TC-10 luật URL: store dev, nền tảng, inline cần xác minh', () => {
  assert.equal(classifyUrl(`${ORIGIN}/cdn-cgi/challenge-platform/h/b/orchestrate/jsch/v1`).source, SOURCE.STORE);
  assert.equal(classifyUrl('https://challenges.cloudflare.com/turnstile/v0/api.js').source, SOURCE.STORE);
  assert.equal(classifyUrl('https://cdn.shopify.com/extensions/abc/app.js').source, SOURCE.STORE);
  assert.equal(classifyUrl('https://monorail-edge.shopifysvc.com/v1/produce').source, SOURCE.PLATFORM);
  assert.equal(classifyUrl(`${ORIGIN}/cdn/s/trekkie.storefront.abc.min.js`).source, SOURCE.PLATFORM);
  assert.equal(classifyUrl(`${ORIGIN}/wpm@abc/custom/web-pixel-1@1/sandbox/modern/`).source, SOURCE.PLATFORM);
  assert.equal(classifyUrl(`${ORIGIN}/api/collect`).source, SOURCE.PLATFORM);
  assert.equal(classifyUrl(`${ORIGIN}/cdn/shopifycloud/shop-js/modules/v2/client.login-button.js`).source, SOURCE.PLATFORM);
  assert.equal(classifyUrl(`${ORIGIN}/cdn/shop/t/12/assets/cart-drawer.js?v=9`).source, SOURCE.THEME);
  assert.equal(classifyUrl(`${ORIGIN}/products/x?preview_theme_id=1`, { documentUrl: `${ORIGIN}/products/x` }).source, SOURCE.VERIFY);
  assert.equal(classifyUrl(undefined).source, SOURCE.VERIFY);
});

test('TC-11 audit DOM không có item (doctype) → theme; is-on-https → nền tảng', () => {
  const lhr = makeLhr({ fail: { doctype: [], 'is-on-https': [] } });
  lhr.audits.doctype.details.items = [];
  const r = analyzeLhr(lhr, 'dom');
  const src = Object.fromEntries(r.failing.map((f) => [f.id, f.sources[0]]));
  assert.equal(src.doctype, SOURCE.THEME);
  assert.equal(src['is-on-https'], SOURCE.PLATFORM);
});

test('TC-13 giả thuyết H1 desktop: cùng mất 6 → 21/27 = 0.78, khớp CI', () => {
  const r = analyzeLhr(makeLhr({ formFactor: 'desktop', na: ['redirects-http', 'font-size'], fail: { 'third-party-cookies': shopAppCookie, 'inspector-issues': shopAppIssue } }), 'h1d');
  assert.equal(r.totalWeight, 27);
  assert.equal(r.recomputed, 0.78);
  assert.equal(r.maxIfThemeFixed, 0.78);
});

test('TC-14 biến thể cô lập: log ERR_BLOCKED_BY_CLIENT xếp nền tảng, không tính là lỗi theme', () => {
  const r = analyzeLhr(makeLhr({ fail: { 'errors-in-console': [
    { source: 'network', description: 'Failed to load resource: net::ERR_BLOCKED_BY_CLIENT', sourceLocation: { url: `${ORIGIN}/products/x` } },
  ] } }), 'iso');
  assert.deepEqual(r.failing[0].sources, [SOURCE.PLATFORM]);
});

test('TC-12 lhr thiếu category best-practices (runtime error) không làm sập, báo lỗi trong bảng', () => {
  const r = analyzeLhr({ categories: {}, audits: {} }, 'err');
  assert.match(r.error, /best-practices/);
  assert.match(toMarkdown([r]), /lỗi: lhr không có category/);
});
