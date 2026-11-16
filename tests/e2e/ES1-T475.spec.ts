// Ticket ES1-T475 (TE-17, REQ-0002): giảm request tới store dev để Cloudflare không bật 429 giữa shard (chẩn đoán ES1-T470).
// Kiểm phần hạ tầng test: fixture trả giả 4 nguồn nhiễu (support/store-noise.ts, support/test.ts), readCartNoScript dùng document /cart giả,
// [req-tong-ket] cuối shard (support/report-429.ts) và quy ước tĩnh để không quay lui. Chỉ TC-10 gọi store thật (1 lần tải trang chủ, desktop).
// Chạy: npx playwright test tests/e2e/ES1-T475.spec.ts --project=desktop
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect } from './support/test';
import { CART } from './support/cart-api';
import { isCartDocument } from './support/product-data';
import { REQ_KINDS, emptyReqCounts, printSummary429, recordReq, summaryReq } from './support/report-429';
import { gotoStore, watchStore } from './support/store-guard';
import { noiseCounts, noiseKind, requestKind } from './support/store-noise';

const E2E = 'tests/e2e';
const STORE = 'hoa-qua-nhap-khau.myshopify.com';
const read = (file: string) => readFileSync(join(E2E, file), 'utf8');
const specs = () => readdirSync(E2E).filter((f) => f.endsWith('.spec.ts'));
const supports = () => readdirSync(join(E2E, 'support')).filter((f) => f.endsWith('.ts')).map((f) => `support/${f}`);
const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'tĩnh, chạy 1 lần ở desktop');

test.describe('ES1-T475 noiseKind (tĩnh)', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-01 khớp đúng 4 nguồn thật trên host store', () => {
    const cases: Array<[string, string]> = [
      [`https://${STORE}/services/login_with_shop/authorize?client_id=x&flow=account`, 'login_with_shop'],
      [`https://${STORE}/checkouts/internal/preloads.js?locale=en-US`, 'preloads'],
      [`https://${STORE}/.well-known/shopify/monorail/unstable/produce_batch`, 'monorail'],
      [`https://${STORE}/api/collect`, 'collect'],
    ];
    for (const [url, kind] of cases) expect(noiseKind(new URL(url), STORE), url).toBe(kind);
  });

  test('TC-02 không khớp request phục vụ test, Cloudflare, CDN, bên thứ ba, trang giả', () => {
    const keep = [
      `https://${STORE}/api/2025-07/graphql.json`,
      `https://${STORE}${CART.add}`,
      `https://${STORE}${CART.read}`,
      `https://${STORE}/cart`,
      `https://${STORE}/recommendations/products.json?product_id=1`,
      `https://${STORE}/cdn-cgi/challenge-platform/h/g/orchestrate/chl_page/v1`,
      'https://challenges.cloudflare.com/turnstile/v0/api.js',
      `https://${STORE}/cdn/shopifycloud/checkout-web/assets/c1/polyfills.js`,
      `https://${STORE}/cdn/shop/files/a.jpg`,
      'https://cdn.shopify.com/shopifycloud/shop-js/modules/v2/client.account.js',
      'https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js',
      'https://shop.app/pay/t171',
      'https://shop.app/services/login_with_shop/authorize',
      `https://${STORE}/services/login_with_shop`,
      `https://${STORE}/checkouts/internal/preloads.json`,
      `https://${STORE}/api/collect/x`,
      'https://store.test/services/login_with_shop/authorize',
      'https://store.test/checkouts/internal/preloads.js',
      'https://store.test/.well-known/shopify/monorail/unstable/produce_batch',
      'https://store.test/api/collect',
    ];
    for (const url of keep) expect(noiseKind(new URL(url), STORE), url).toBeNull();
  });

  test('TC-03 requestKind chia đúng nhóm cho [req-tong-ket]', () => {
    const req = (url: string, type = 'fetch') => ({ url: () => url, resourceType: () => type });
    expect(requestKind(req(`https://${STORE}/`, 'document'), STORE, true)).toBe('doc');
    expect(requestKind(req(`https://${STORE}${CART.read}`), STORE, true)).toBe('dyn');
    expect(requestKind(req(`https://${STORE}/cdn/shop/t/1/assets/base.css`, 'stylesheet'), STORE, true)).toBe('cdn');
    expect(requestKind(req(`https://${STORE}/cdn-cgi/challenge-platform/h/g/jsd/oneshot`), STORE, true)).toBe('challenge');
    expect(requestKind(req('https://challenges.cloudflare.com/turnstile/v0/api.js', 'script'), STORE, true)).toBe('challenge');
    expect(requestKind(req('https://cdn.shopify.com/s/x.js', 'script'), STORE, true)).toBe('3p');
    expect(requestKind(req(`https://${STORE}/api/collect`), STORE, true)).toBe('stubbed');
    // Tắt stub (stubNoise: false): request thật, tính theo loại thường.
    expect(requestKind(req(`https://${STORE}/services/login_with_shop/authorize`, 'document'), STORE, false)).toBe('doc');
    expect(requestKind(req('data:image/png;base64,AA=='), STORE, true)).toBeNull();
  });
});

test.describe('ES1-T475 readCartNoScript (tĩnh)', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-04 luật của context phụ chỉ khớp document /cart của store, không khớp /cart.js', () => {
    const origin = `https://${STORE}`;
    expect(isCartDocument(new URL(`${origin}/cart`), origin)).toBe(true);
    expect(isCartDocument(new URL(`${origin}/cart?preview_theme_id=1`), origin)).toBe(true);
    for (const url of [`${origin}${CART.read}`, `${origin}${CART.add}`, `${origin}/cart/`, `${origin}/cart/c/x`, 'https://store.test/cart', `${origin}/`]) {
      expect(isCartDocument(new URL(url), origin), url).toBe(false);
    }
    const source = read('support/product-data.ts');
    const body = source.slice(source.indexOf('export async function readCartNoScript'));
    expect(body).toContain('sibling.route((url) => isCartDocument(url, store)');
    expect(body).toContain('readCartJson<T>(helper)');
    expect(body).toContain('newStoreContext(');
    expect(body).not.toContain('expectNotChallenged(helper)');
  });
});

test.describe('ES1-T475 quy ước spec (tĩnh)', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-05 không spec nào lấy test từ @playwright/test (chỉ import type); fixture trong support dựng từ support/test', () => {
    const valueImport = /^import\s+(?!type\s)[^;]*?from\s+'@playwright\/test'/m;
    expect(specs().filter((f) => valueImport.test(read(f)))).toEqual([]);
    const fixtures = supports().filter((f) => f !== 'support/test.ts' && /\.extend</.test(read(f)));
    expect(fixtures.length).toBeGreaterThan(0);
    expect(fixtures.filter((f) => valueImport.test(read(f)))).toEqual([]);
    expect(read('TE-4.spec.ts')).toContain("from './support/test'");
  });

  test('TC-06 không còn tạo context ngoài support/store-noise.ts', () => {
    const pattern = /(?<!request)\.newContext\(/;
    const hits = [...specs(), ...supports()]
      .filter((f) => f !== 'support/store-noise.ts')
      .flatMap((f) => read(f).split('\n').map((l, i) => [f, i + 1, l] as const))
      .filter(([, , l]) => pattern.test(l))
      .map(([f, i, l]) => `${f}:${i}: ${l.trim()}`);
    expect(hits).toEqual([]);
  });

  test('TC-07 [req-tong-ket]: không trùng regex scripts/e2e-429-count.sh, spec kiểm helper không tính, không có file không in', () => {
    const counts = { ...emptyReqCounts(), doc: 2, dyn: 9, cdn: 110, '3p': 4, stubbed: 3 };
    const lines = summaryReq(`ES1-T94.spec.ts\t1\t2\t3\t4\t0\t5\nES1-T94.spec.ts\t1\t0\t0\t0\t1\t0\nES1-T147.spec.ts\t${REQ_KINDS.map((k) => counts[k]).join('\t')}\n`);
    expect(lines).toEqual([
      '[req-tong-ket] ES1-T147.spec.ts doc=2 dyn=9 cdn=110 3p=4 challenge=0 stubbed=3',
      '[req-tong-ket] ES1-T94.spec.ts doc=2 dyn=2 cdn=3 3p=4 challenge=1 stubbed=5',
      '[req-tong-ket] tổng doc=4 dyn=11 cdn=113 3p=8 challenge=1 stubbed=8',
    ]);
    for (const line of lines) expect(line).not.toMatch(/\[cartApi\] 429 lần|trả 429|\[429-tong-ket\]/);
    expect(summaryReq('')).toEqual([]);

    const saved = process.env.E2E_429_LOG;
    const log = console.log;
    const out: string[] = [];
    console.log = (...args: unknown[]) => { out.push(args.join(' ')); };
    try {
      process.env.E2E_429_LOG = join(mkdtempSync(join(tmpdir(), 'efitco-t475-')), 'log');
      recordReq('ES1-T94.spec.ts', counts);
      recordReq('ES1-T100.spec.ts', counts);
      recordReq('ES1-T217.spec.ts', counts);
      recordReq('ES1-T95.spec.ts', emptyReqCounts());
      printSummary429();
      expect(out.filter((l) => l.startsWith('[req-tong-ket]'))).toEqual([
        '[req-tong-ket] ES1-T94.spec.ts doc=2 dyn=9 cdn=110 3p=4 challenge=0 stubbed=3',
        '[req-tong-ket] tổng doc=2 dyn=9 cdn=110 3p=4 challenge=0 stubbed=3',
      ]);
    } finally {
      console.log = log;
      if (saved === undefined) delete process.env.E2E_429_LOG;
      else process.env.E2E_429_LOG = saved;
    }
  });
});

test.describe('ES1-T475 fixture trả giả trên trang giả (không gọi store)', () => {
  test.use({ baseURL: 'https://store.test' });
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  const PAGE = `<!doctype html><html lang="en"><head><title>stub</title><script src="/checkouts/internal/preloads.js?locale=en-US"></script></head>
<body><iframe title="account" src="/services/login_with_shop/authorize?flow=account"></iframe><script>
fetch('/api/collect', { method: 'POST', body: '{}' });
fetch('/.well-known/shopify/monorail/unstable/produce_batch', { method: 'POST', body: '{}' });
</script></body></html>`;

  test('TC-08 fixture page: 4 nguồn trả giả, không ra mạng, 0 console error, 0 pageerror', async ({ page }) => {
    // Spec chỉ trả document; 4 nguồn còn lại do fixture trả. Lọt ra mạng thì store.test không phân giải được → "Failed to load resource" → watch.finish đỏ.
    await page.route('https://store.test/', (route) => route.fulfill({ contentType: 'text/html', body: PAGE }));
    const watch = watchStore(page);
    await page.goto('/');
    await expect.poll(() => noiseCounts(page.context())).toEqual({ login_with_shop: 1, preloads: 1, monorail: 1, collect: 1 });
    await watch.finish();
  });
});

test.describe('ES1-T475 tắt stub', () => {
  test.use({ baseURL: 'https://store.test', stubNoise: false });
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-09 test.use({ stubNoise: false }): context không gắn stub', async ({ page }) => {
    expect(noiseCounts(page.context())).toBeUndefined();
  });
});

test.describe('ES1-T475 store thật', () => {
  // Bị chặn thì thử lại chỉ thêm lần tải trang vào store đang chặn.
  test.describe.configure({ retries: 0 });

  // Chặn trả giả đúng chỗ thì trang chủ phải có iframe login_with_shop của <shopify-account> (blocks/header.liquid) và preloads.js của content_for_header.
  // Theme làm mất 1 trong 2 thì test này đỏ: chưa test nào khác kiểm hai thứ này. watch.finish bắt pageerror của account.js khi nhận iframe giả.
  test('TC-10 trang chủ: login_with_shop và preloads.js đều đã được trả giả, 0 console error', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'desktop', 'chạy 1 lần ở desktop để bớt request lên store dev');
    const watch = watchStore(page);
    await gotoStore(page, '/');
    await expect
      .poll(() => noiseCounts(page.context())?.login_with_shop ?? 0, { message: 'không thấy iframe login_with_shop: <shopify-account> mất khỏi header?', timeout: 15_000 })
      .toBeGreaterThanOrEqual(1);
    expect(noiseCounts(page.context())?.preloads ?? 0, 'không thấy preloads.js: content_for_header mất khỏi layout?').toBeGreaterThanOrEqual(1);
    await watch.finish();
  });
});
