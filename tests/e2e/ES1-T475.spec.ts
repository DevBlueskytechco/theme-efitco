// Ticket ES1-T475 (TE-17, REQ-0002): giảm request tới store dev để Cloudflare không bật 429 giữa shard (chẩn đoán ES1-T470).
// Kiểm phần hạ tầng test: fixture trả giả 4 nguồn nhiễu (support/store-noise.ts, support/test.ts), readCartNoScript dùng document /cart giả,
// [req-tong-ket] cuối shard (support/report-429.ts) và quy ước tĩnh để không quay lui. Chỉ TC-10 gọi store thật (1 lần tải trang chủ, desktop).
// Chạy: npx playwright test tests/e2e/ES1-T475.spec.ts --project=desktop
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect } from './support/test';
import { CART } from './support/cart-api';
import { isCartDocument } from './support/product-data';
import { MAX_COOLDOWN_WAIT_MS, REQ_KINDS, STORE_COOLDOWN_MS, cooldownWaitMs, emptyReqCounts, first429At, markFirst429, printSummary429, record429, recordReq, summaryReq } from './support/report-429';
import { gotoStore, waitStoreCooldown, watchStore } from './support/store-guard';
import { noiseCounts, noiseKind, requestKind } from './support/store-noise';

const E2E = 'tests/e2e';
const STORE = 'hoa-qua-nhap-khau.myshopify.com';
const read = (file: string) => readFileSync(join(E2E, file), 'utf8');
const specs = () => readdirSync(E2E).filter((f) => f.endsWith('.spec.ts'));
const supports = () => readdirSync(join(E2E, 'support')).filter((f) => f.endsWith('.ts')).map((f) => `support/${f}`);
const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'tĩnh, chạy 1 lần ở desktop');

test.describe('ES1-T475 noiseKind (tĩnh)', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-01 khớp đúng 5 nguồn thật (4 trên host store, hop trên shop.app)', () => {
    const cases: Array<[string, string]> = [
      [`https://${STORE}/services/login_with_shop/authorize?client_id=x&flow=account`, 'login_with_shop'],
      [`https://${STORE}/checkouts/internal/preloads.js?locale=en-US`, 'preloads'],
      [`https://${STORE}/.well-known/shopify/monorail/unstable/produce_batch`, 'monorail'],
      [`https://${STORE}/api/collect`, 'collect'],
      // ES1-T477: iframe hop của Shop Pay; 302 của nó về /services/login_with_shop/buyer/callback không qua route.
      ['https://shop.app/pay/hop?analytics_trace_id=x&target_origin=https%3A%2F%2Fstore', 'shop_hop'],
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
      'https://shop.app/pay/session',
      'https://shop.app/pay/hop/x',
      `https://${STORE}/pay/hop`,
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
    expect(requestKind(req('https://shop.app/pay/hop?x=1', 'document'), STORE, true)).toBe('stubbed');
    expect(requestKind(req('https://shop.app/pay/hop?x=1', 'document'), STORE, false)).toBe('3p');
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
<body><iframe title="account" src="/services/login_with_shop/authorize?flow=account"></iframe><iframe title="hop" src="https://shop.app/pay/hop?target_origin=x"></iframe><script>
fetch('/api/collect', { method: 'POST', body: '{}' });
fetch('/.well-known/shopify/monorail/unstable/produce_batch', { method: 'POST', body: '{}' });
</script></body></html>`;

  test('TC-08 fixture page: 5 nguồn trả giả, không ra mạng, 0 console error, 0 pageerror', async ({ page }) => {
    // Spec chỉ trả document; 5 nguồn còn lại do fixture trả. Lọt ra mạng thì store.test không phân giải được → "Failed to load resource" → watch.finish đỏ.
    await page.route('https://store.test/', (route) => route.fulfill({ contentType: 'text/html', body: PAGE }));
    const watch = watchStore(page);
    await page.goto('/');
    await expect.poll(() => noiseCounts(page.context())).toEqual({ login_with_shop: 1, preloads: 1, monorail: 1, collect: 1, shop_hop: 1 });
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

// ES1-T477 (a): cổng chờ Cloudflare trước ES1-T203 TC-20 (support/report-429.ts, support/store-guard.ts).
test.describe('ES1-T477 cổng chờ Cloudflare (tĩnh)', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  // Đổi E2E_429_LOG sang file tạm trong lúc chạy fn, trả lại như cũ: không ghi mốc vào tổng kết thật của shard.
  async function withLog<T>(fn: (file: string) => Promise<T> | T): Promise<T> {
    const saved = process.env.E2E_429_LOG;
    try {
      process.env.E2E_429_LOG = join(mkdtempSync(join(tmpdir(), 'efitco-t477-')), 'log');
      return await fn(process.env.E2E_429_LOG);
    } finally {
      if (saved === undefined) delete process.env.E2E_429_LOG;
      else process.env.E2E_429_LOG = saved;
    }
  }

  test('TC-11 cooldownWaitMs: chờ tới đủ 10,5 phút sau lần 429 đầu, tối đa 5,5 phút, không có 429 thì 0', () => {
    const min = 60_000;
    const t0 = 1_800_000_000_000;
    expect(STORE_COOLDOWN_MS).toBe(10.5 * min);
    expect(MAX_COOLDOWN_WAIT_MS).toBe(5.5 * min);
    expect(cooldownWaitMs(undefined, t0)).toBe(0);
    // Mốc ES1-T475: TC-20 chạy 7,1–9,6 phút sau mốc thì đỏ → chờ thêm 3,4 và 0,9 phút.
    expect(cooldownWaitMs(t0, t0 + 7.1 * min)).toBe(3.4 * min);
    expect(cooldownWaitMs(t0, t0 + 9.6 * min)).toBe(0.9 * min);
    expect(cooldownWaitMs(t0, t0 + 10.5 * min)).toBe(0);
    expect(cooldownWaitMs(t0, t0 + 30 * min)).toBe(0);
    // 429 vừa xảy ra: chờ tối đa 5,5 phút, không chờ đủ 10,5.
    expect(cooldownWaitMs(t0, t0)).toBe(MAX_COOLDOWN_WAIT_MS);
    expect(cooldownWaitMs(t0, t0 + 4 * min)).toBe(MAX_COOLDOWN_WAIT_MS);
    expect(cooldownWaitMs(t0, t0 + 6 * min)).toBe(4.5 * min);
  });

  test('TC-12 mốc lần 429 đầu: record429 ghi 1 lần mỗi đợt chặn, chung qua file của shard; spec kiểm helper và không có E2E_429_LOG thì không ghi', async () => {
    await withLog((file) => {
      expect(first429At()).toBeUndefined();
      record429('hit', 'ES1-T100.spec.ts');
      record429('challenge', 'ES1-T217.spec.ts');
      expect(first429At(), 'spec kiểm helper không được ghi mốc').toBeUndefined();

      const before = Date.now();
      record429('skip', 'ES1-T149.spec.ts');
      const first = first429At()!;
      expect(first).toBeGreaterThanOrEqual(before);
      expect(first).toBeLessThanOrEqual(Date.now());
      expect(readFileSync(`${file}.first`, 'utf8')).toBe(String(first));

      // Trong đợt: 429 sau không dời mốc.
      record429('challenge', 'ES1-T156.spec.ts');
      markFirst429(first + STORE_COOLDOWN_MS - 1);
      expect(first429At()).toBe(first);
      // Hết đợt mà vẫn 429: đợt mới, mốc mới.
      markFirst429(first + STORE_COOLDOWN_MS);
      expect(first429At()).toBe(first + STORE_COOLDOWN_MS);

      writeFileSync(`${file}.first`, '');
      expect(first429At(), 'file rỗng (startLog429) là chưa có 429').toBeUndefined();
    });
    const saved = process.env.E2E_429_LOG;
    delete process.env.E2E_429_LOG;
    try {
      record429('hit', 'ES1-T149.spec.ts');
      markFirst429();
      expect(first429At()).toBeUndefined();
    } finally {
      if (saved !== undefined) process.env.E2E_429_LOG = saved;
    }
  });

  test('TC-13 waitStoreCooldown: có mốc thì log [429-cho], cộng thời gian chờ vào timeout; không có mốc thì không chờ, không log', async ({}, ti) => {
    const log = console.log;
    const out: string[] = [];
    console.log = (...args: unknown[]) => { out.push(args.join(' ')); };
    try {
      await withLog(async () => {
        expect(await waitStoreCooldown('TC-20')).toBe(0);
        expect(out).toEqual([]);

        const timeout = ti.timeout;
        writeFileSync(`${process.env.E2E_429_LOG}.first`, String(Date.now() - STORE_COOLDOWN_MS + 400));
        const started = Date.now();
        const waited = await waitStoreCooldown('TC-20');
        expect(waited).toBeGreaterThan(0);
        expect(waited).toBeLessThanOrEqual(400);
        expect(Date.now() - started).toBeGreaterThanOrEqual(waited - 20);
        expect(ti.timeout).toBe(timeout + waited);
        expect(out).toHaveLength(1);
        expect(out[0]).toMatch(/^\[429-cho\] chờ 1s trước TC-20 \(lần 429 đầu của shard cách 630s, ES1-T477 a\)$/);
        // Không bị scripts/e2e-429-count.sh đếm.
        expect(out[0]).not.toMatch(/\[cartApi\] 429 lần|trả 429|\[429-tong-ket\]/);
      });
    } finally {
      console.log = log;
    }
  });

  test('TC-14 ES1-T203 luồng mua thật: cổng chờ ở đầu beforeAll, trước khi mở phiên store; không nới assertion', () => {
    const source = read('ES1-T203.spec.ts');
    const body = source.slice(source.indexOf("test.describe.serial('ES1-T203 luồng mua thật'"));
    const hook = body.slice(body.indexOf('test.beforeAll('), body.indexOf('test.afterEach('));
    expect(hook).toContain("await waitStoreCooldown('TC-20');");
    expect(hook.indexOf("waitStoreCooldown('TC-20')")).toBeLessThan(hook.indexOf('newStoreContext('));
    expect(hook.indexOf('test.skip(PAGE_MODE')).toBeLessThan(hook.indexOf("waitStoreCooldown('TC-20')"));
    expect(body).toContain('test.describe.configure({ retries: 0 })');
    expect(body).toContain('expectStoreAllowed(res);');
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
