// KHÔNG CHẮC: luồng thật (TC-20 trở đi) chưa chạy trên store: phiên QA bị từ chối store dev và CDN, chỉ chạy trên storefront giả drafts/qa/ES1-T203/stub-server.mjs. Chờ CI PR.
// Ticket ES1-T203 TE-10-QA4. Gồm 2 phần:
// - Kiểm helper (không gọi store): support/cart-mock.ts, support/store-guard.ts, quy ước spec T96, T97, T98.
// - 1 luồng mua thật cho mỗi project: 1 phiên, /cart.js thật, thư viện partial và Shopify.actions thật. Đây là nơi duy nhất kiểm những gì mock không kiểm được.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T203.spec.ts
import { test, expect, type BrowserContext, type Page, type TestInfo } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CART } from './support/cart-api';
import { installPartials, MOCK_HEADER, MockCart, test as mockTest } from './support/cart-mock';
import { isCloudflareLog } from './support/console-guard';
import { summary429 } from './support/report-429';
import { env } from './support/store-data';
import { challengeReason, CLOUDFLARE_BLOCKED, expectStoreAllowed, gotoStore, watchStore, type StoreWatch } from './support/store-guard';

const ROOT = process.cwd();
const E2E = join(ROOT, 'tests/e2e');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');
const MOCK_SPECS = ['ES1-T96.spec.ts', 'ES1-T97.spec.ts', 'ES1-T98.spec.ts'];
const HANDLE = env('TE4_VARIANTS_HANDLE', 'TE4_SINGLE_HANDLE');
const PAGE_MODE = process.env.EXPECT_CART_TYPE === 'page';
const ORIGIN = 'https://store.test';

// Trang thử thách giả trong phần kiểm helper không được tính vào [429-tong-ket].
function isolateReport() {
  let saved: string | undefined;
  test.beforeEach(() => {
    saved = process.env.E2E_429_LOG;
    delete process.env.E2E_429_LOG;
  });
  test.afterEach(() => {
    if (saved !== undefined) process.env.E2E_429_LOG = saved;
  });
}

test.describe('ES1-T203 quy ước spec (tĩnh)', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('TC-01 T96, T97, T98 không gọi Cart API thật: không cartApi, seedCart, themeAdd, skip429, page.request, route.continue', () => {
    for (const spec of MOCK_SPECS) {
      const source = readFileSync(join(E2E, spec), 'utf8');
      expect(source, spec).toContain("from './support/cart-mock'");
      for (const banned of [/\bcartApi\b/, /\bseedCart\b/, /\bthemeAdd\b/, /\bskip429\b/, /page\.request/, /route\.continue\(/, /route\.fetch\(/, /\bpage\.goto\(/, /CART\.clear/]) {
        expect(source, `${spec} còn ${banned}`).not.toMatch(banned);
      }
    }
  });

  test('TC-02 T96, T97, T98: test.fixme chỉ dùng kèm key bug', () => {
    const fixme = MOCK_SPECS.flatMap((f) => readFileSync(join(E2E, f), 'utf8').split('\n').filter((l) => /test\.fixme\(/.test(l)).map((l) => `${f}: ${l.trim()}`));
    expect(fixme.filter((l) => !/ES1-T\d+/.test(l))).toEqual([]);
  });

  test('TC-03 helper không route.fetch, không đổi config retry cho luồng thật', () => {
    for (const file of ['cart-mock.ts', 'store-guard.ts']) expect(read(`tests/e2e/support/${file}`)).not.toMatch(/route\.fetch\(/);
    const spec = readFileSync(join(E2E, 'ES1-T203.spec.ts'), 'utf8');
    expect(spec).toContain("test.describe.serial('ES1-T203 luồng mua thật'");
    expect(spec).toContain('test.describe.configure({ retries: 0 })');
  });

  test('TC-14 markup dựng tay của mock khớp liquid: mọi data-testid, class có trong snippet; đủ hook JS', () => {
    const source = installPartials.toString();
    const liquid = ['snippets/cart-lines.liquid', 'snippets/cart-summary.liquid', 'blocks/header.liquid', 'blocks/cart-page.liquid', 'blocks/cart-drawer.liquid'].map(read).join('\n');
    const testids = [...source.matchAll(/data-testid="([\w-]+)"/g)].map((m) => m[1]);
    expect(testids.length).toBeGreaterThan(10);
    for (const id of testids) expect(liquid, `thiếu data-testid ${id}`).toContain(`data-testid="${id}"`);
    const classes = [...source.matchAll(/class="([\w\s-]+)"/g)].flatMap((m) => m[1].split(/\s+/));
    for (const name of classes) expect(liquid, `thiếu class ${name}`).toMatch(new RegExp(`class="[^"]*\\b${name}(?![\\w-])`));
    for (const hook of ['data-line-key=', 'data-cart-remove', 'data-cart-update', 'name="updates[]"', 'data-testid="cart-total"']) {
      expect(source, `mock thiếu ${hook}`).toContain(hook);
    }
  });
});

// Trang giả mang đúng hook của trang giỏ rỗng; thư viện giả qua importmap để attach chạy như trên store.
const LIBRARY = "export const partials = { fetch() { throw new Error('thư viện thật không được gọi'); }, apply() { throw new Error('thư viện thật không được gọi'); } };";
const FROZEN_LIBRARY = 'export const partials = Object.freeze({ fetch() {}, apply() {} });';
const EMPTY = `<!doctype html><html lang="en"><title>cart</title>
  <script type="importmap">{"imports":{"@shopify/partial-rendering":"${ORIGIN}/library.js"}}</script>
  <a data-testid="header-cart-link" aria-label="Cart (0 items)" href="/cart">Cart</a>
  <div data-item-count="0" data-testid="cart-page-body"><form id="cart-form-page"><div class="cart-page__main">
    <div class="cart-empty" data-testid="cart-empty"><a href="/collections/all" data-testid="cart-empty-cta">Continue</a></div>
  </div></form></div></html>`;

async function fakeStore(page: Page, html = EMPTY, library = LIBRARY) {
  await page.route(`${ORIGIN}/library.js`, (route) => route.fulfill({ contentType: 'text/javascript', body: library }));
  await page.route(`${ORIGIN}/cart`, (route) => route.fulfill({ contentType: 'text/html', body: html }));
}

const inPage = <T,>(page: Page, path: string, init?: RequestInit) =>
  page.evaluate(async ({ path, init }) => {
    const res = await fetch(path, init);
    return { status: res.status, body: (await res.text()) as unknown as T, header: res.headers.get('x-e2e-cart-mock') };
  }, { path, init: init as Record<string, unknown> | undefined });

const postJson = (body: unknown): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

mockTest.describe('ES1-T203 cart-mock', () => {
  isolateReport();

  mockTest('TC-04 giỏ trong bộ nhớ: add, change, xoá, /cart.js trả JSON đủ trường, có header mock', async ({ page, cart }) => {
    await fakeStore(page);
    await cart.goto(`${ORIGIN}/cart`);
    const added = await inPage<string>(page, CART.add, postJson({ items: [{ id: 7, quantity: 2, properties: { _a: '1' } }, { id: 7, quantity: 1, properties: { _a: '2' } }] }));
    expect(added.status).toBe(200);
    expect(added.header).toBe('1');
    const key = (JSON.parse(added.body) as { items: { key: string }[] }).items[0].key;
    expect(key).toMatch(/^7:[0-9a-f]{32}$/);
    expect(cart.state().item_count).toBe(3);
    expect(cart.state().total_price).toBe(3000);

    const changed = JSON.parse((await inPage<string>(page, CART.change, postJson({ id: key, quantity: 5 }))).body) as { item_count: number };
    expect(changed.item_count).toBe(6);
    const removed = JSON.parse((await inPage<string>(page, CART.change, postJson({ id: key, quantity: 0 }))).body) as { items: unknown[] };
    expect(removed.items).toHaveLength(1);
    const state = JSON.parse((await inPage<string>(page, CART.read)).body) as Record<string, unknown>;
    for (const field of ['token', 'items', 'total_price', 'item_count', 'currency', 'items_subtotal_price', 'cart_level_discount_applications']) expect(state).toHaveProperty(field);
    expect(cart.leaks).toEqual([]);
  });

  mockTest('TC-05 thêm cùng variant cùng properties gộp dòng; multipart của product-form đọc được', async ({ page, cart }) => {
    await fakeStore(page);
    await cart.goto(`${ORIGIN}/cart`);
    await page.evaluate(async (path) => {
      for (let i = 0; i < 2; i++) {
        const body = new FormData();
        body.set('id', '9');
        body.set('quantity', '2');
        await fetch(path, { method: 'POST', body });
      }
    }, CART.add);
    expect(cart.state().items).toHaveLength(1);
    expect(cart.state().items[0].quantity).toBe(4);
  });

  mockTest('TC-06 respond: 422, 500, abort, times; giỏ không đổi, hết times về bình thường', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    await fakeStore(page);
    cart.seed([1]);
    await cart.goto(`${ORIGIN}/cart`);
    const { key } = cart.state().items[0];
    cart.respond('change', { status: 422, json: { description: 'hết' }, times: 1 });
    expect((await inPage<string>(page, CART.change, postJson({ id: key, quantity: 9 }))).status).toBe(422);
    cart.respond('change', { status: 500, html: '<h1>500</h1>', times: 1 });
    const failed = await inPage<string>(page, CART.change, postJson({ id: key, quantity: 9 }));
    expect(failed.status).toBe(500);
    expect(failed.body).toContain('<h1>');
    cart.respond('change', { abort: true, times: 1 });
    await expect(inPage(page, CART.change, postJson({ id: key, quantity: 9 }))).rejects.toThrow(/Failed to fetch/);
    expect(cart.state().items[0].quantity).toBe(1);
    expect((await inPage(page, CART.change, postJson({ id: key, quantity: 9 }))).status).toBe(200);
    expect(cart.state().items[0].quantity).toBe(9);
  });

  mockTest('TC-07 delay và hold: response về sau khi chờ, partial trả ảnh chụp lúc request tới', async ({ page, cart }) => {
    await fakeStore(page);
    cart.seed([1]);
    await cart.goto(`${ORIGIN}/cart`);
    cart.respond('read', { delayMs: 300, times: 1 });
    const started = Date.now();
    await inPage(page, CART.read);
    expect(Date.now() - started).toBeGreaterThanOrEqual(300);

    const release = cart.hold('partial');
    const pending = page.evaluate(async () => {
      const { partials } = await (0, eval)("import('@shopify/partial-rendering')");
      return partials.fetch('cart-page', { url: location.href });
    });
    await expect.poll(() => cart.calls.partial.length).toBe(1);
    cart.add(9, 1);
    release();
    expect((await pending).cart.item_count).toBe(1);
  });

  mockTest('TC-08 attach: dựng dòng hàng lên trang giỏ rỗng, partial đổi số, xoá hết về trạng thái rỗng thật', async ({ page, cart }) => {
    await fakeStore(page);
    cart.seed([2, 1]);
    await cart.goto(`${ORIGIN}/cart`);
    await expect(page.getByTestId('cart-line')).toHaveCount(2);
    await expect(page.getByTestId('cart-page-body')).toHaveAttribute('data-item-count', '3');
    await expect(page.getByTestId('cart-total')).toHaveText('30.00');
    await expect(page.getByTestId('header-cart-count')).toHaveText('3');
    await expect(page.getByTestId('cart-empty')).toHaveCount(0);

    const refresh = () => page.evaluate(async () => {
      const { partials } = await (0, eval)("import('@shopify/partial-rendering')");
      await partials.apply(await partials.fetch('cart-page', 'cart-count', { url: location.href }));
    });
    const [first, second] = cart.state().items;
    cart.add(first.id, 2, first.properties);
    await refresh();
    await expect(page.getByTestId('cart-line-quantity').first()).toHaveValue('4');
    await expect(page.getByTestId('header-cart-link')).toHaveAttribute('aria-label', 'Cart (5 items)');

    const url = `${ORIGIN}${CART.change}`;
    for (const { key } of [first, second]) await inPage(page, url, postJson({ id: key, quantity: 0 }));
    await refresh();
    await expect(page.getByTestId('cart-empty-cta')).toHaveAttribute('href', '/collections/all');
    await expect(page.getByTestId('cart-lines')).toHaveCount(0);
    await expect(page.getByTestId('cart-update')).toHaveCount(0);
    await expect(page.getByTestId('header-cart-count')).toHaveCount(0);
  });

  mockTest('TC-09 apply giữ focus và số đang nhập như mô tả AGENTS.md; thay đổi giữ nguyên phần tử dòng', async ({ page, cart }) => {
    await fakeStore(page);
    cart.seed([1]);
    await cart.goto(`${ORIGIN}/cart`);
    const input = page.getByTestId('cart-line-quantity');
    await input.fill('7');
    await input.evaluate((el) => { (el as HTMLElement & { __same?: boolean }).__same = true; });
    cart.add(cart.state().items[0].id, 1, cart.state().items[0].properties);
    await page.evaluate(async () => {
      const { partials } = await (0, eval)("import('@shopify/partial-rendering')");
      await partials.apply(await partials.fetch('cart-page', { url: location.href }));
    });
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('7');
    expect(await input.evaluate((el: HTMLInputElement) => el.defaultValue)).toBe('2');
    expect(await input.evaluate((el) => (el as HTMLElement & { __same?: boolean }).__same)).toBe(true);
  });

  mockTest('TC-10 thư viện bị khoá hoặc trang không rỗng: fail rõ lý do, không chạy tiếp trên mock hỏng', async ({ browser }) => {
    const frozen = await browser.newPage();
    await fakeStore(frozen, EMPTY, FROZEN_LIBRARY);
    const onFrozen = new MockCart(frozen);
    await expect(onFrozen.goto(`${ORIGIN}/cart`)).rejects.toThrow(/object is not extensible|read only|Không thay được/i);
    await frozen.close();

    const full = await browser.newPage();
    await fakeStore(full, EMPTY.replace(/<div class="cart-empty"[\s\S]*?<\/div>/, ''));
    await expect(new MockCart(full).goto(`${ORIGIN}/cart`)).rejects.toThrow(/không ở trạng thái giỏ rỗng/);
    await full.close();
  });

  mockTest('TC-11 request Cart API không qua mock bị ghi là lọt', async ({ page, cart }) => {
    await fakeStore(page);
    await cart.goto(`${ORIGIN}/cart`);
    await page.route(`${ORIGIN}${CART.read}`, (route) => route.fulfill({ json: {} }));
    await inPage(page, CART.read);
    await expect.poll(() => cart.leaks).toEqual([`GET ${ORIGIN}${CART.read} 200`]);
    expect(MOCK_HEADER).toBe('x-e2e-cart-mock');
    cart.leaks.length = 0;
  });
});

test.describe('ES1-T203 nhận biết Cloudflare', () => {
  isolateReport();

  const CHALLENGES: [string, string, RegExp][] = [
    ['title', '<!doctype html><title>Just a moment...</title><p>x', /title "Just a moment/],
    ['form', '<!doctype html><title>x</title><form id="challenge-form"></form>', /form#challenge-form/],
    ['turnstile', '<!doctype html><title>x</title><div class="cf-turnstile"></div>', /phần tử div/],
    ['iframe', '<!doctype html><title>x</title><iframe src="https://challenges.cloudflare.com/x"></iframe>', /phần tử iframe/],
    ['chl_page', '<!doctype html><title>x</title><script src="https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/orchestrate/chl_page/v1"></script>', /phần tử script/],
  ];

  for (const [name, html, reason] of CHALLENGES) {
    test(`TC-12 màn thử thách (${name}): gotoStore fail với thông báo rõ, không skip`, async ({ page }) => {
      await page.route('https://challenges.cloudflare.com/**', (route) => route.abort());
      await page.route(`${ORIGIN}/`, (route) => route.fulfill({ contentType: 'text/html', body: html }));
      const failure = gotoStore(page, `${ORIGIN}/`);
      await expect(failure).rejects.toThrow(CLOUDFLARE_BLOCKED);
      await expect(failure).rejects.toThrow(reason);
      await expect(failure).rejects.toThrow(/không phải lỗi code/);
      expect(test.info().expectedStatus).toBe('passed');
    });
  }

  test('TC-13 header cf-mitigated ở response trang: fail rõ; ở fetch trong trang: finish fail rõ', async ({ page }) => {
    await page.route(`${ORIGIN}/blocked`, (route) => route.fulfill({ status: 403, headers: { 'cf-mitigated': 'challenge' }, contentType: 'text/html', body: '<!doctype html><title>x</title>' }));
    await expect(gotoStore(page, `${ORIGIN}/blocked`)).rejects.toThrow(/bị Cloudflare chặn \(cf-mitigated, status 403\)/);

    const watch = watchStore(page);
    await page.route(`${ORIGIN}/`, (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>home</title>' }));
    await page.route(`${ORIGIN}${CART.change}`, (route) => route.fulfill({ status: 403, headers: { 'cf-mitigated': 'challenge' }, body: '' }));
    await gotoStore(page, `${ORIGIN}/`);
    await inPage(page, CART.change, { method: 'POST' });
    await expect(watch.finish()).rejects.toThrow(CLOUDFLARE_BLOCKED);
  });

  test('TC-15 trang thường có script bot management của Cloudflare: không coi là bị chặn', async ({ page }) => {
    await page.route(`${ORIGIN}/cdn-cgi/**`, (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await page.route(`${ORIGIN}/`, (route) => route.fulfill({ contentType: 'text/html', body: `<!doctype html><title>Shop</title><script src="/cdn-cgi/challenge-platform/scripts/jsd/main.js"></script><main>ok</main>` }));
    await gotoStore(page, `${ORIGIN}/`);
    expect(await challengeReason(page)).toBeNull();
  });

  test('TC-16 console guard: bỏ qua log từ /cdn-cgi/challenge-platform, challenges.cloudflare.com; lỗi theme vẫn fail', async ({ page }) => {
    const watch = watchStore(page);
    await page.route(`${ORIGIN}/cdn-cgi/challenge-platform/h.js`, (route) => route.fulfill({ contentType: 'text/javascript', body: "console.error('from challenge');" }));
    await page.route(`${ORIGIN}/theme.js`, (route) => route.fulfill({ contentType: 'text/javascript', body: "console.error('from theme');" }));
    await page.route(`${ORIGIN}/`, (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Shop</title><script src="/cdn-cgi/challenge-platform/h.js"></script><script src="/theme.js"></script>' }));
    await gotoStore(page, `${ORIGIN}/`);
    const failure = watch.finish();
    await expect(failure).rejects.toThrow(/from theme/);
    await expect(failure).rejects.not.toThrow(/from challenge/);

    const log = (url: string, text = 'x') => ({ text: () => text, location: () => ({ url, lineNumber: 0, columnNumber: 0 }) });
    expect(isCloudflareLog(log('https://challenges.cloudflare.com/turnstile/v0/api.js'))).toBe(true);
    expect(isCloudflareLog(log('https://store.test/cdn-cgi/challenge-platform/x'))).toBe(true);
    expect(isCloudflareLog(log('', 'Refused to frame https://challenges.cloudflare.com/'))).toBe(true);
    expect(isCloudflareLog(log('https://store.test/assets/cart-items.js'))).toBe(false);
  });

  test('TC-17 trang trả 429 rồi 200: chờ và mở lại; trang lỗi 429 mọi lần: fail nói rõ 429, không skip', async ({ page }) => {
    test.slow();
    const statuses = [429];
    let loads = 0;
    await page.route(`${ORIGIN}/`, (route) => {
      loads++;
      return route.fulfill({ status: statuses.shift() ?? 200, contentType: 'text/html', body: '<!doctype html><title>Shop</title>' });
    });
    await gotoStore(page, `${ORIGIN}/`);
    expect(loads).toBe(2);

    await page.route(`${ORIGIN}/limited`, (route) => route.fulfill({ status: 429, contentType: 'text/html', body: '<!doctype html><title>x</title>' }));
    await expect(gotoStore(page, `${ORIGIN}/limited`)).rejects.toThrow(/store trả 429 cho trang .*sau 4 lần thử/);
    expect(test.info().expectedStatus).toBe('passed');
  });

  test('TC-18 tổng kết: có cột trang thử thách khi khác 0, dòng cũ không đổi khi bằng 0', () => {
    expect(summary429('hit\tES1-T97.spec.ts\n')).toEqual(['[429-tong-ket] ES1-T97.spec.ts số_lần_429=1 test_skip=0', '[429-tong-ket] tổng số_lần_429=1 test_skip=0']);
    expect(summary429('challenge\tES1-T203.spec.ts\n')).toEqual([
      '[429-tong-ket] ES1-T203.spec.ts số_lần_429=0 test_skip=0 trang_thử_thách=1',
      '[429-tong-ket] tổng số_lần_429=0 test_skip=0 trang_thử_thách=1',
    ]);
  });

  test('TC-19 Response thật: 429 và cf-mitigated ném lỗi rõ, 200 không ném', () => {
    const res = (status: number, headers: Record<string, string> = {}) => ({ status: () => status, headers: () => headers, url: () => `${ORIGIN}${CART.change}` });
    expect(() => expectStoreAllowed(res(429))).toThrow(/store trả 429/);
    expect(() => expectStoreAllowed(res(403, { 'cf-mitigated': 'challenge' }))).toThrow(CLOUDFLARE_BLOCKED);
    expect(() => expectStoreAllowed(res(200))).not.toThrow();
  });
});

// Luồng thật. getCart, updateCart nằm ở đây vì ghi qua Storefront API, mock Cart API không tới (ES1-T164).
type Line = { key: string; quantity: number };
type RealCart = { item_count: number; total_price: number; items: Line[] };
type ActionCart = { totalQuantity?: number; item_count?: number } | null;
type Win = {
  __t203: { action?: string; context?: string }[];
  __t203Stay?: number;
  Shopify: { actions: Record<string, (...args: unknown[]) => Promise<unknown>> };
};

const digits = (text: string | null) => (text ?? '').replace(/\D/g, '');

test.describe.serial('ES1-T203 luồng mua thật', () => {
  test.describe.configure({ retries: 0 });

  let context: BrowserContext;
  let page: Page;
  let watch: StoreWatch;
  let variantId = 0;

  const tid = (id: string) => page.getByTestId(id);
  const dialog = () => tid('cart-drawer-dialog');
  const idle = () => expect(tid('cart-items')).not.toHaveAttribute('aria-busy', /.*/);
  const stayed = () => page.evaluate(() => (window as unknown as Win).__t203Stay === 1);
  const markStay = () => page.evaluate(() => { (window as unknown as Win).__t203Stay = 1; });
  const status = async (name: string) => expect(tid('cart-items-status')).toHaveText((await tid('cart-items').getAttribute(`data-label-${name}`))!);

  // Theme gửi POST thật. Bị chặn hoặc 429 thì nói rõ, không để thành assertion khó hiểu ở bước sau.
  async function cartWrite(path: string, action: () => Promise<unknown>) {
    const response = page.waitForResponse((r) => r.url().includes(path) && r.request().method() === 'POST');
    await action();
    const res = await response;
    expectStoreAllowed(res);
    expect(res.ok(), `${path} trả ${res.status()}`).toBeTruthy();
  }

  // Không dùng readCartJson: hàm đó skip khi 429, luồng thật không được skip.
  async function realCart(): Promise<RealCart> {
    const { status: code, text } = await page.evaluate(async () => {
      const res = await fetch('/cart.js', { cache: 'no-store', headers: { Accept: 'application/json' } });
      return { status: res.status, text: await res.text() };
    });
    expect([code, text.slice(0, 80)], '/cart.js phải trả 200 JSON').toEqual([200, expect.stringMatching(/^\{/)]);
    return JSON.parse(text) as RealCart;
  }

  // Refresh partial là request cùng pathname với trang. Không giả định định dạng của thư viện thật.
  function countRefreshes() {
    const path = new URL(page.url()).pathname;
    const seen: string[] = [];
    const listener = (r: { resourceType(): string; url(): string }) => {
      if (['fetch', 'xhr'].includes(r.resourceType()) && new URL(r.url()).pathname === path) seen.push(r.url());
    };
    page.on('request', listener);
    return { seen, stop: () => page.off('request', listener) };
  }

  async function setQuantity(key: string, value: string) {
    const input = page.locator(`[data-line-key="${key}"] [data-testid="cart-line-quantity"]`);
    await input.fill(value);
    await input.evaluate((el) => el.dispatchEvent(new Event('change', { bubbles: true })));
    return input;
  }

  const firstKey = async () => (await tid('cart-line').first().getAttribute('data-line-key'))!;

  async function callAction<T>(name: string, ...args: unknown[]): Promise<T> {
    return page.evaluate(async ({ name, args }) => {
      const res = await (window as unknown as Win).Shopify.actions[name](...args);
      return JSON.parse(JSON.stringify(res ?? null));
    }, { name, args }) as Promise<T>;
  }

  async function actionsReady() {
    await expect(tid('cart-drawer'), 'Shopify.actions chưa được configure').toHaveAttribute('data-actions', '', { timeout: 15_000 });
    await markStay();
  }

  // Giỏ chưa có trên Storefront API có thể trả null: tính là 0.
  const total = (cart: ActionCart) => cart?.totalQuantity ?? cart?.item_count ?? 0;

  test.beforeAll(async ({ browser }, info: TestInfo) => {
    test.skip(PAGE_MODE, 'Luồng mua thật đi qua drawer; preview cart_type page chạy test riêng bên dưới');
    expect(HANDLE, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE').toBeTruthy();
    const { baseURL, storageState, viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = info.project.use;
    context = await browser.newContext({ baseURL, storageState, viewport, userAgent, deviceScaleFactor, isMobile, hasTouch, reducedMotion: 'reduce' });
    page = await context.newPage();
    watch = watchStore(page);
    await page.addInitScript((type) => {
      (window as unknown as Win).__t203 = [];
      document.addEventListener(type, (e) => {
        const d = ((e as CustomEvent).detail?.lines ? (e as CustomEvent).detail : e) as { action?: string; context?: string };
        (window as unknown as Win).__t203.push({ action: d.action, context: d.context });
      }, true);
    }, 'shopify:cart:lines-update');
  });

  test.afterEach(async ({}, info) => {
    if (page && info.status !== info.expectedStatus) await info.attach('page', { body: await page.screenshot(), contentType: 'image/png' }).catch(() => {});
  });

  test.afterAll(async () => {
    if (!page) return;
    await watch.finish().finally(() => context.close());
  });

  test('TC-20 AC2 thêm giỏ từ trang sản phẩm: drawer mở, có dòng, cart-count, event add/product', async () => {
    await gotoStore(page, `/products/${HANDLE}`);
    await page.waitForFunction(() => ['product-form', 'cart-drawer'].every((n) => !!customElements.get(n)));
    await markStay();
    await expect(tid('product-form-add'), 'Variant mặc định phải còn hàng để chạy luồng thật').toBeEnabled();
    variantId = Number(await tid('product-form-variant-id').inputValue());
    await cartWrite(CART.add, () => tid('product-form-add').click());
    await expect(dialog()).toBeVisible();
    await expect(dialog()).not.toHaveAttribute('aria-busy', /.*/);
    expect(await dialog().evaluate((el) => el.matches(':modal'))).toBe(true);
    expect(await stayed()).toBe(true);
    await expect(tid('cart-line')).toHaveCount(1);
    await expect(tid('header-cart-count')).toHaveText('1');
    const cart = await realCart();
    expect(cart.item_count).toBe(1);
    await expect(tid('cart-line')).toHaveAttribute('data-line-key', cart.items[0].key);
    expect(await page.evaluate(() => (window as unknown as Win).__t203)).toEqual([{ action: 'add', context: 'product' }]);
  });

  test('TC-21 AC2 đổi số lượng trong drawer: /cart.js thật, dòng và tổng theo server, status', async () => {
    await expect(tid('cart-items')).toHaveAttribute('data-enhanced', '', { timeout: 15_000 });
    const key = await firstKey();
    const refreshes = countRefreshes();
    let input!: Awaited<ReturnType<typeof setQuantity>>;
    await cartWrite(CART.change, async () => { input = await setQuantity(key, '2'); });
    await idle();
    await expect(input).toHaveValue('2');
    await expect(tid('header-cart-count')).toHaveText('2');
    await status('updated');
    const cart = await realCart();
    expect(cart.items[0].quantity).toBe(2);
    expect(digits(await tid('cart-total').textContent())).toBe(String(cart.total_price));
    await expect(tid('cart-items-error')).toBeEmpty();
    expect(await stayed()).toBe(true);
    refreshes.stop();
    console.log(`[ES1-T203] refresh partial trong drawer: ${refreshes.seen.length} request`);
  });

  test('TC-22 AC2 Esc đóng, cart link mở lại sau khi partial thật đã áp', async () => {
    await page.keyboard.press('Escape');
    await expect(dialog()).toBeHidden();
    await expect(tid('product-form-add')).toBeFocused();
    await tid('header-cart-link').click();
    await expect(dialog()).toBeVisible();
    await expect(dialog()).not.toHaveAttribute('aria-busy', /.*/);
    await expect(tid('cart-line-quantity')).toHaveValue('2');
    expect(await stayed()).toBe(true);
  });

  test('TC-23 AC2 xoá trong drawer: trạng thái rỗng, cart-count mất, focus về CTA', async () => {
    await cartWrite(CART.change, () => tid('cart-line-remove').click());
    await expect(tid('cart-empty')).toBeVisible();
    await idle();
    await expect(tid('cart-empty-cta')).toBeFocused();
    await expect(tid('header-cart-count')).toHaveCount(0);
    await status('removed');
    expect((await realCart()).item_count).toBe(0);
    await page.keyboard.press('Escape');
    await expect(dialog()).toBeHidden();
  });

  test('TC-24 AC2 sang cart page: dòng do server render, đổi số, xoá về rỗng, focus h1', async () => {
    await cartWrite(CART.add, () => tid('product-form-add').click());
    await expect(dialog()).toBeVisible();
    await expect(dialog()).not.toHaveAttribute('aria-busy', /.*/);
    await gotoStore(page, '/cart');
    await expect(tid('cart-items')).toHaveAttribute('data-enhanced', '', { timeout: 15_000 });
    await markStay();
    await expect(tid('cart-drawer')).toHaveAttribute('data-mode', 'none');
    await expect(tid('cart-line')).toHaveCount(1);
    await expect(tid('cart-line-quantity')).toHaveValue('1');

    // ES1-T97 'đổi trong lúc refresh' từng thấy 0 request refresh trên cart page: số này cho biết thư viện thật có gửi cùng pathname không.
    const refreshes = countRefreshes();
    let input!: Awaited<ReturnType<typeof setQuantity>>;
    await cartWrite(CART.change, async () => { input = await setQuantity(await firstKey(), '3'); });
    await idle();
    await expect(input).toHaveValue('3');
    await expect(input).toBeFocused();
    await expect(tid('header-cart-count')).toHaveText('3');
    refreshes.stop();
    console.log(`[ES1-T203] refresh partial trên cart page: ${refreshes.seen.length} request`);
    const cart = await realCart();
    expect(digits(await tid('cart-total').textContent())).toBe(String(cart.total_price));

    await cartWrite(CART.change, () => tid('cart-line-remove').click());
    await expect(tid('cart-empty')).toBeVisible();
    await idle();
    await expect(tid('cart-page-heading')).toBeFocused();
    expect((await realCart()).item_count).toBe(0);
    expect(await stayed()).toBe(true);
  });

  test('TC-25 AC7 getCart, updateCart thật trên drawer: partial khớp /cart.js, 1 event standard-action, không mở, không reload', async () => {
    await gotoStore(page, '/');
    await actionsReady();
    expect(total(await callAction<ActionCart>('getCart'))).toBe(0);
    const refreshes = countRefreshes();
    const result = await callAction<{ userErrors?: unknown[] }>('updateCart', { lines: [{ merchandiseId: variantId, quantity: 2, attributes: [{ key: '_t203', value: 'action' }] }] });
    expect(result.userErrors ?? []).toEqual([]);
    const cart = await realCart();
    expect(cart.item_count).toBe(2);
    await expect(tid('cart-drawer-body')).toHaveAttribute('data-item-count', '2');
    await expect(tid('cart-line')).toHaveCount(cart.items.length);
    await expect(tid('header-cart-count')).toHaveText('2');
    await expect(dialog()).toBeHidden();
    expect(await stayed(), 'không reload').toBe(true);
    refreshes.stop();
    expect(refreshes.seen, 'không có refresh lặp').toHaveLength(1);
    expect((await page.evaluate(() => (window as unknown as Win).__t203)).map((e) => e.context), 'override không phát thêm event').toEqual(['standard-action']);
    expect(total(await callAction<ActionCart>('getCart')), 'getCart trả giỏ mới').toBe(2);
  });

  test('TC-26 AC7 updateCart ở /cart: refresh partial cart-page, ô số lượng theo server', async () => {
    await gotoStore(page, '/cart');
    await expect(tid('cart-items')).toHaveAttribute('data-enhanced', '', { timeout: 15_000 });
    await actionsReady();
    const key = await firstKey();
    const refreshes = countRefreshes();
    await callAction('updateCart', { lines: [{ id: key, quantity: 3 }] });
    const cart = await realCart();
    expect(cart.item_count).toBe(3);
    await expect(tid('cart-page-body')).toHaveAttribute('data-item-count', '3');
    await expect(tid('header-cart-count')).toHaveText('3');
    await expect(page.locator(`[data-line-key="${cart.items[0].key}"] [data-testid="cart-line-quantity"]`)).toHaveValue('3');
    refreshes.stop();
    expect(refreshes.seen).toHaveLength(1);
    expect(await stayed(), 'không reload').toBe(true);
  });

  test('TC-27 AC7 updateCart: refresh partial lỗi không ném, giỏ vẫn đổi', async () => {
    await gotoStore(page, '/');
    await actionsReady();
    watch.allowNetworkLog();
    const path = new URL(page.url()).pathname;
    const samePath = (url: URL) => url.pathname === path;
    await page.route(samePath, (route) => (route.request().resourceType() === 'document' ? route.fallback() : route.abort()));
    const result = await callAction<{ userErrors?: unknown[] }>('updateCart', { lines: [{ merchandiseId: variantId, quantity: 1, attributes: [{ key: '_t203', value: 'fail' }] }] });
    expect(result.userErrors ?? []).toEqual([]);
    await page.unroute(samePath);
    expect((await realCart()).item_count).toBe(4);
    expect(await stayed()).toBe(true);
    await expect(dialog()).not.toHaveAttribute('aria-busy', /.*/);
  });
});

test.describe('ES1-T203 cart_type page thật', () => {
  test('TC-28 AC7 updateCart chỉ làm mới cart-count', async ({ page }) => {
    test.skip(!PAGE_MODE, 'Cần preview đặt cart_type page + EXPECT_CART_TYPE=page (D12)');
    const watch = watchStore(page);
    await gotoStore(page, `/products/${HANDLE}`);
    const variant = Number(await page.getByTestId('product-form-variant-id').inputValue());
    await expect(page.getByTestId('cart-drawer'), 'Shopify.actions chưa được configure').toHaveAttribute('data-actions', '', { timeout: 15_000 });
    await expect(page.getByTestId('cart-drawer-dialog')).toHaveCount(0);
    await page.evaluate(async (id) => {
      await (window as unknown as Win).Shopify.actions.updateCart({ lines: [{ merchandiseId: id, quantity: 1 }] });
    }, variant);
    await expect(page.getByTestId('header-cart-count')).toHaveText('1');
    await watch.finish();
  });
});
