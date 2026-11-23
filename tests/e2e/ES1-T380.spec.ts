// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên agent không có trình duyệt, không chạy node). Kết quả thật lấy từ CI e2e trên PR.
// Ticket ES1-T380 TE-8-R2-BE2: assets/collection-filters.js trên /search + thẻ script trong blocks/search-results.liquid (docs/srs.md#TE-8 AC2, AC3;
// docs/ui-spec/search.md §6 S5/S6b, §7, §10; drafts/techlead/ES1-T307/task-split.md TE-8-R2-BE2; ES1-T124 #3 shopify:search:update).
// 3 nhóm: contract (đọc repo), fixture (trang giả + partials giả, không cần store), store (/search thật, skip có lý do khi thiếu dữ liệu).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T380.spec.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page } from './support/test';
import { env } from './support/store-data';
import { expectNotChallenged, gotoStore, isStoreRefresh, watchStore } from './support/store-guard';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');
const JS = read('assets/collection-filters.js');
const BLOCK = read('blocks/search-results.liquid');
const TEMPLATE = read('templates/search.liquid');
const FILTERS = read('blocks/collection-filters.liquid');

const Q = env('TE8_QUERY_FILTER') ?? 'a';
const NO_FILTERS = `dữ liệu: /search?q=${Q} không có filter (Search and Discovery, ES1-T125 #3)`;
const searchUrl = (extra: Record<string, string> = {}) => `/search?${new URLSearchParams({ q: Q, ...extra })}`;
const tid = (page: Page, id: string) => page.getByTestId(id);

// ---------- Contract ----------
test.describe('ES1-T380 contract', () => {
  test('AC2 AC3: 1 thẻ script collection-filters.js trong search-results, ngoài partial; tên partial khớp; ≤ 8192 B', () => {
    const tags = BLOCK.match(/<script[^>]*>/g) ?? [];
    expect(tags).toEqual([`<script src="{{ 'collection-filters.js' | asset_url }}" type="module">`]);
    expect(BLOCK.indexOf("'collection-filters.js' | asset_url")).toBeGreaterThan(BLOCK.indexOf('{% endpartial %}'));
    // Tên partial kết quả: JS đọc data-results-partial (templates/search.liquid), Liquid khai báo {% partial 'search-products' %}
    const name = TEMPLATE.match(/data-results-partial="([^"]+)"/)?.[1];
    expect(name).toBe('search-products');
    expect(BLOCK).toContain(`{% partial '${name}' %}`);
    expect(FILTERS).toContain("{% partial 'collection-filters' %}");
    expect(JS).toContain('"collection-filters"');
    expect(JS).toContain('dataset.resultsPartial');
    expect(Buffer.byteLength(JS)).toBeLessThanOrEqual(8192);
    expect(JS).not.toMatch(/console\.|pushState/);
    expect(JS).toContain('"SearchUpdateEvent"');
    // Hook JS dùng đều có trong markup
    for (const hook of ['data-results-label', 'data-results-focus', 'template data-results-error']) expect(BLOCK).toContain(hook);
    expect(TEMPLATE).toContain('data-testid="search-status"');
    expect(TEMPLATE).toMatch(/<input type="hidden" name="q"/);
  });
});

// ---------- Fixture: trang giả, partials giả, thư viện event giả ----------
const EVENTS_STUB =
  'data:text/javascript,' +
  encodeURIComponent(
    ['SearchUpdateEvent:shopify:search:update', 'CollectionUpdateEvent:shopify:collection:update']
      .map((s) => {
        const [cls, ...type] = s.split(':');
        return `export class ${cls} extends Event{constructor(d){super(${JSON.stringify(type.join(':'))},{bubbles:true});Object.assign(this,d)}}`;
      })
      .join(';'),
  );
// Như thư viện thật (cdn.shopify.com/storefront/standard-events.js: ShopifyStandardEvent Object.assign(this, data)): dữ liệu nằm trên event, không ở detail.

// partials giả: fetch ghi tên + URL; __mode 'fail' thì reject; apply làm như server: ghi nhãn mới (server luôn render nhãn)
// và checked mặc định theo URL đã fetch (sync() đặt lại ô theo defaultChecked sau apply, như ES1-T111 APPLY).
const body = JS.replace(
  /^import .*$/m,
  `const partials = {
    fetch: (...a) => { const o = a.pop(); (window.__calls ||= []).push({ names: a, url: o.url }); return window.__mode == "fail" ? Promise.reject(new TypeError("Failed to fetch")) : Promise.resolve({}); },
    apply: async () => {
      const q = new URL(window.__calls.at(-1).url).searchParams;
      document.querySelector("[data-results-label]").setAttribute("data-results-label", window.__next);
      for (const i of document.querySelectorAll("#collection-filter-form input[type=checkbox]")) i.toggleAttribute("checked", q.getAll(i.name).includes(i.value));
    },
  };`,
).replace(/https:\/\/cdn\.shopify\.com[^"]*/, EVENTS_STUB);

const OLD = '2 results for “66 lb”';
const SEARCH_FIX = 'http://fixture.test/search?q=66+lb';
const SEARCH_HTML = `<!doctype html><html lang="en"><body>
<p role="status" data-testid="search-status">${OLD}</p>
<collection-filters data-results-partial="search-products">
  <form id="collection-filter-form" novalidate data-testid="collection-filter-form">
    <input type="hidden" name="q" value="66 lb">
    <input type="checkbox" name="filter.v.a" value="1" data-testid="in" aria-label="A">
  </form>
  <div class="search-results">
    <template data-results-error><div class="alert" role="alert" data-testid="search-error"><button type="button" data-retry data-testid="search-error-button">Try Again</button></div></template>
    <div data-results-label="${OLD}">
      <section data-results-focus data-testid="search-products">
        <button type="button" data-testid="collection-filter-open">Filter</button>
        <label>Sort by <select name="sort_by" form="collection-filter-form" data-testid="collection-sort"><option value="relevance" selected>Relevance</option><option value="price-ascending">Price</option></select></label>
        <nav data-testid="pagination"><a href="/search?q=66+lb&page=2" data-testid="pagination-next">Next</a></nav>
      </section>
    </div>
  </div>
</collection-filters></body></html>`;

type Call = { names: string[]; url: string };
type Detail = { search?: { query: string; sortKey?: string }; collection?: unknown; promise: Promise<unknown> };

async function setupFixture(page: Page, url: string, html: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route(url.split('?')[0] + '*', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
  await page.addInitScript(() => {
    const w = window as unknown as { __ev: { type: string; detail: Detail }[]; __resolved: unknown[] };
    w.__ev = [];
    w.__resolved = [];
    for (const type of ['shopify:search:update', 'shopify:collection:update'])
      window.addEventListener(type, (e) => {
        const detail = e as unknown as Detail;
        w.__ev.push({ type, detail });
        detail?.promise?.then((v) => w.__resolved.push(v));
      });
  });
  await page.goto(url);
  await page.evaluate((next) => ((window as unknown as { __next: string }).__next = next), '1 result for “66 lb”');
  await page.addScriptTag({ content: body, type: 'module' });
  await expect(page.locator('collection-filters')).toHaveAttribute('data-enhanced', '');
  return errors;
}

const calls = (page: Page) => page.evaluate(() => (window as unknown as { __calls?: Call[] }).__calls ?? []);
const events = (page: Page) =>
  page.evaluate(() => (window as unknown as { __ev: { type: string; detail: Detail }[] }).__ev.map((e) => ({ type: e.type, search: e.detail.search, collection: !!e.detail.collection })));
const resolved = (page: Page) => page.evaluate(() => (window as unknown as { __resolved: unknown[] }).__resolved);

test.describe('ES1-T380 fixture /search', () => {
  test('AC2 tick filter: 2 partial (không collection-filter-count), replaceState giữ q, search-status = nhãn mới, shopify:search:update', async ({ page }) => {
    const errors = await setupFixture(page, SEARCH_FIX, SEARCH_HTML);
    await tid(page, 'in').check();
    await expect(page.locator('collection-filters')).not.toHaveAttribute('aria-busy', 'true');
    const [c] = await calls(page);
    expect(c.names).toEqual(['search-products', 'collection-filters']);
    expect(new URL(c.url).searchParams.get('q')).toBe('66 lb');
    expect(new URL(c.url).searchParams.get('filter.v.a')).toBe('1');
    expect(new URL(page.url()).searchParams.get('filter.v.a')).toBe('1');
    await expect(tid(page, 'search-status')).toHaveText('1 result for “66 lb”');
    // Đổi filter không dời focus vào vùng kết quả (search.md §7)
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-results-label]'))).toBe(false);
    // Sort select gắn form qua thuộc tính form: sort_by=relevance đi cùng → sortKey RELEVANCE
    await expect.poll(() => events(page)).toEqual([{ type: 'shopify:search:update', search: { query: '66 lb', sortKey: 'RELEVANCE' }, collection: false }]);
    // promise resolve số đầu nhãn, không lẫn số trong từ khoá (66)
    await expect.poll(() => resolved(page)).toEqual([{ productsCount: 1 }]);
    expect(errors).toEqual([]);
  });

  test('AC2 sort: sortKey PRICE trong search; sang trang: không event, focus vùng sản phẩm', async ({ page }) => {
    const errors = await setupFixture(page, SEARCH_FIX, SEARCH_HTML);
    await tid(page, 'collection-sort').selectOption('price-ascending');
    await expect.poll(() => events(page)).toEqual([{ type: 'shopify:search:update', search: { query: '66 lb', sortKey: 'PRICE' }, collection: false }]);
    await expect(page.locator('collection-filters')).not.toHaveAttribute('aria-busy', 'true');
    await tid(page, 'pagination-next').click();
    await expect.poll(async () => (await calls(page)).length).toBe(2);
    await expect(tid(page, 'search-products')).toBeFocused();
    expect(new URL(page.url()).searchParams.get('page')).toBe('2');
    expect((await events(page)).length).toBe(1);
    expect(errors).toEqual([]);
  });

  test('S6b lỗi: alert sau template, lưới + nhãn cũ giữ, status không đổi; Try Again tải lại, alert mất, focus không rơi về body', async ({ page }) => {
    const errors = await setupFixture(page, SEARCH_FIX, SEARCH_HTML);
    await page.evaluate(() => ((window as unknown as { __mode: string }).__mode = 'fail'));
    await tid(page, 'in').check();
    const alert = tid(page, 'search-error');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute('role', 'alert');
    expect(await alert.evaluate((el) => el.previousElementSibling?.matches('template[data-results-error]'))).toBe(true);
    await expect(page.locator('[data-results-label]')).toHaveAttribute('data-results-label', OLD);
    await expect(tid(page, 'search-status')).toHaveText(OLD);
    await expect(tid(page, 'in')).toBeChecked();
    await expect(page.locator('collection-filters')).not.toHaveAttribute('aria-busy', 'true');
    expect(new URL(page.url()).searchParams.has('filter.v.a')).toBe(false);

    await page.evaluate(() => ((window as unknown as { __mode: string }).__mode = 'ok'));
    await tid(page, 'search-error-button').click();
    await expect(alert).toHaveCount(0);
    await expect(tid(page, 'search-status')).toHaveText('1 result for “66 lb”');
    expect((await calls(page)).length).toBe(2);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(false);
    await expect(tid(page, 'collection-filter-open')).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('Collection không đổi: 3 partial, shopify:collection:update, không search:update', async ({ page }) => {
    const html = `<!doctype html><html lang="en"><body><collection-filters>
      <form id="collection-filter-form" novalidate data-collection-handle="x" data-collection-id="1" data-products-count="3"><input type="checkbox" name="filter.v.a" value="1" data-testid="in" aria-label="A"></form>
      <div data-results-label="3 products"></div><p role="status" data-testid="collection-status"></p></collection-filters></body></html>`;
    const errors = await setupFixture(page, 'http://fixture.test/collections/x', html);
    await tid(page, 'in').check();
    await expect.poll(async () => (await calls(page))[0]?.names).toEqual(['collection-products', 'collection-filters', 'collection-filter-count']);
    await expect(tid(page, 'collection-status')).toHaveText('1 result for “66 lb”');
    await expect.poll(async () => (await events(page)).map((e) => e.type)).toEqual(['shopify:collection:update']);
    expect(errors).toEqual([]);
  });
});

// ---------- Store: /search thật ----------
const drawer = (page: Page) => tid(page, 'collection-filter-drawer');
const freeInput = (page: Page) => drawer(page).locator('[data-testid="collection-filter-input"]:not(:checked):not(:disabled)').first();
const waitRefresh = (page: Page) =>
  page.waitForResponse((r) => ['fetch', 'xhr'].includes(r.request().resourceType()) && isStoreRefresh(r.url(), page.url()), { timeout: 20_000 });

async function openSearch(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __t380: string[] };
    w.__t380 = [];
    window.addEventListener('shopify:search:update', (e) => w.__t380.push(JSON.stringify((e as unknown as { search?: unknown }).search ?? null)), true);
  });
  await gotoStore(page, searchUrl({ type: 'product' }));
  await expectNotChallenged(page);
  test.skip((await drawer(page).locator('[data-testid="collection-filter-group"]').count()) === 0, NO_FILTERS);
  await expect(page.locator('collection-filters')).toHaveAttribute('data-enhanced', '');
}

async function tick(page: Page) {
  await tid(page, 'collection-filter-open').click();
  await expect(drawer(page)).toBeVisible();
  // Ghim đúng ô sẽ tick: freeInput có :not(:checked) nên sau khi tick sẽ trỏ sang ô chưa tick kế tiếp
  const all = drawer(page).locator('[data-testid="collection-filter-input"]');
  const i = await all.evaluateAll((els) => els.findIndex((el) => !(el as HTMLInputElement).checked && !(el as HTMLInputElement).disabled));
  test.skip(i < 0, 'dữ liệu: không còn giá trị filter tick được');
  const input = all.nth(i);
  return { input, label: input.locator('xpath=ancestor::label[1]') };
}

test.describe('ES1-T380 store /search', () => {
  test('AC2 tick filter: không tải lại, search-status = data-results-label mới, URL giữ q, event search:update', async ({ page }) => {
    const watch = watchStore(page);
    await openSearch(page);
    const before = await tid(page, 'search-status').textContent();
    let navigated = false;
    // Request document của khung chính (replaceState không sinh request)
    page.on('request', (r) => r.isNavigationRequest() && r.frame() === page.mainFrame() && (navigated = true));
    const { label } = await tick(page);
    await Promise.all([waitRefresh(page), label.click()]);
    await expect(page.locator('collection-filters')).not.toHaveAttribute('aria-busy', 'true', { timeout: 15_000 });
    const results = page.locator('[data-results-label]');
    const next = await results.getAttribute('data-results-label');
    expect(next).toBeTruthy();
    await expect(tid(page, 'search-status')).toHaveText(next!);
    expect(navigated, 'không tải lại trang').toBe(false);
    expect(new URL(page.url()).searchParams.get('q')).toBe(Q);
    test.info().annotations.push({ type: 'status', description: `${before} → ${next}` });
    const ev = await page.evaluate(() => (window as unknown as { __t380: string[] }).__t380);
    // KHÔNG CHẮC tên lớp SearchUpdateEvent trong thư viện CDN: ghi nhận, fixture kiểm logic dispatch
    test.info().annotations.push({ type: 'shopify:search:update', description: ev.length ? ev.join(' | ') : 'không dispatch (thư viện CDN không có SearchUpdateEvent?)' });
    if (ev.length) expect(JSON.parse(ev[0]).query).toBe(Q);
    await watch.finish();
  });

  test('S6b lỗi: nhãn data-results-label giữ nguyên, status không đổi; Try Again thành công cập nhật status', async ({ page }) => {
    const watch = watchStore(page);
    watch.allowNetworkLog();
    await openSearch(page);
    const old = await page.locator('[data-results-label]').getAttribute('data-results-label');
    let block = true;
    await page.route(
      (url) => url.pathname.endsWith('/search'),
      (route) => (block && ['fetch', 'xhr'].includes(route.request().resourceType()) ? route.abort('failed') : route.fallback()),
    );
    const { input, label } = await tick(page);
    await label.click();
    const error = tid(page, 'search-error');
    await expect(error).toBeVisible();
    await expect(page.locator('[data-results-label]')).toHaveAttribute('data-results-label', old!);
    await expect(tid(page, 'search-status')).toHaveText(old!);
    await expect(input).toBeChecked();
    block = false;
    await Promise.all([waitRefresh(page), error.getByRole('button', { name: 'Try Again' }).click()]);
    await expect(error).toHaveCount(0);
    const next = await page.locator('[data-results-label]').getAttribute('data-results-label');
    await expect(tid(page, 'search-status')).toHaveText(next!);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(false);
    await watch.finish();
  });
});

test.describe('ES1-T380 store nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('AC3 không JS: drawer popover, tick + Show N products gửi GET, trang mới giữ q và filter', async ({ page }) => {
    await gotoStore(page, searchUrl({ type: 'product' }));
    await expectNotChallenged(page);
    test.skip((await drawer(page).locator('[data-testid="collection-filter-group"]').count()) === 0, NO_FILTERS);
    await tid(page, 'collection-filter-open').click();
    await expect(drawer(page)).toBeVisible();
    const input = freeInput(page);
    test.skip((await input.count()) === 0, 'dữ liệu: không còn giá trị filter tick được');
    const [name, value] = [(await input.getAttribute('name'))!, (await input.getAttribute('value'))!];
    await input.check();
    await Promise.all([page.waitForURL((u) => u.searchParams.getAll(name).includes(value)), tid(page, 'collection-filter-apply').click()]);
    expect(new URL(page.url()).searchParams.get('q')).toBe(Q);
    await expect(tid(page, 'search-status')).not.toBeEmpty();
  });
});
