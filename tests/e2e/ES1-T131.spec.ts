// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có preview, trình duyệt, node). Kết quả thật lấy từ CI store-tests.
// Ticket ES1-T131 TE-8-QA1 (docs/srs.md#TE-8 AC1–AC4, AC7, AC8 S2/S6a/S6b, AC10–AC13; drafts/techlead/ES1-T307/task-split.md §3, §6.7).
// Test case: drafts/qa/ES1-T131/test-cases.md (TC-xx trong tên test). Tên file theo key ES1-T131 (ticket), không phải TE-8.spec.ts.
// Không trùng ES1-T130.spec.ts: debounce, huỷ request, ↑↓ Enter Esc, nút xoá, lỗi tải module đã ở đó (TC-03).
// Cổng theo repo: phần chưa merge (ES1-T128, ES1-T110/T380, ES1-T377/T378, ES1-T379) skip có lý do; TE8_STRICT=1 thì fail thay vì skip.
// Dữ liệu: TE8_QUERY_* (ES1-T125, env hoặc tests/e2e/store-data.json). Chưa có: NONE dùng 'zzqx-no-result-te8', FILTER/PAGED dùng 'a' (TE-1).
// Ticket ghi "route.abort partial thì tải cả trang"; SRS 0.5 AC8 S6b ghi alert + Try Again, lưới cũ giữ: theo SRS 0.5 (CTO 11/11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T131.spec.ts
import { existsSync, readFileSync } from 'node:fs';
import { test, expect, type Locator, type Page, type Request } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { env } from './support/store-data';
import { clickAndLoad, expectNotChallenged, gotoStore, isStoreRefresh, watchStore } from './support/store-guard';

// ---------- Cổng theo repo ----------
const read = (file: string) => (existsSync(file) ? readFileSync(file, 'utf8') : '');
const SNIPPET = read('snippets/predictive-search.liquid');
const PS_JS = read('assets/predictive-search.js');
const SEARCH_BLOCK = read('blocks/search-results.liquid');
const SETTINGS = read('config/settings_schema.json');
// ES1-T131-B01 (drafts/qa/ES1-T131/bugs/ES1-T131-B01.md): /search còn template skeleton, ô tìm size="50" tràn ngang ở 412px →
// Chromium mobile nới layout viewport 412 → 583 → view transition liên trang huỷ "Viewport size changed" (pageerror). Hết khi ES1-T128 thay template.
const SEARCH_OVERFLOW_B01 = /<input[^>]*\bsize="50"/.test(read('templates/search.liquid'));

const HAS = {
  searchPage: SEARCH_BLOCK !== '',
  searchJs: /collection-filters\.js/.test(SEARCH_BLOCK) && existsSync('assets/collection-filters.js'),
  tabs: SNIPPET.includes('predictive-search-tabs') && /predictive-?tab|predictiveTab/i.test(PS_JS),
  discover: SNIPPET.includes('data-predictive-discover'),
  states: SNIPPET.includes('predictive-search-error') && SNIPPET.includes('predictive-search-empty') && /predictive-search-(error|empty)|predictive-?(error|empty)/i.test(PS_JS),
  recent: /localStorage/.test(PS_JS),
  popularSetting: /"id"\s*:\s*"popular_searches"/.test(SETTINGS),
};
const WAIT = {
  searchPage: 'ES1-T128 (blocks/search-results) chưa merge',
  searchJs: 'ES1-T110 + ES1-T380 (collection-filters.js trên /search) chưa merge',
  tabs: 'ES1-T377 + ES1-T378 (tab predictive) chưa merge',
  discover: 'ES1-T377 (khối khám phá) chưa merge',
  states: 'ES1-T377 + ES1-T378 (hộp 0 kết quả, lỗi, loading) chưa merge',
  recent: 'TE-8-R2-BE3 ES1-T379 (Should, recent searches) chưa merge hoặc đã bị cắt',
  popularSetting: 'ES1-T377 (theme setting popular_searches) chưa merge',
} as const;

function need(...keys: Array<keyof typeof HAS>) {
  const missing = keys.filter((k) => !HAS[k]).map((k) => WAIT[k]);
  if (!missing.length) return;
  if (process.env.TE8_STRICT === '1') throw new Error(`TE8_STRICT: ${missing.join('; ')}`);
  test.skip(true, missing.join('; '));
}

// ---------- Dữ liệu ----------
const Q = {
  all: env('TE8_QUERY_ALL'),
  paged: env('TE8_QUERY_PAGED') ?? 'a',
  filter: env('TE8_QUERY_FILTER') ?? 'a',
  none: env('TE8_QUERY_NONE') ?? 'zzqx-no-result-te8',
};
const POPULAR = (env('TE8_POPULAR_SEARCHES') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const NO_POPULAR = 'store dev chưa khai báo TE8_POPULAR_SEARCHES (fixture TE-17-R2-QA0 chưa có popular_searches)';
const NO_FILTERS = (q: string) => `dữ liệu: /search?q=${q} không có filter (Search and Discovery, ES1-T125 #3)`;

// ---------- testid ----------
const P = {
  link: 'header-search-link',
  dialog: 'predictive-search-dialog',
  root: 'predictive-search',
  input: 'predictive-search-input',
  listbox: 'predictive-search-listbox',
  group: 'predictive-search-group',
  option: 'predictive-search-option',
  all: 'predictive-search-all',
  status: 'predictive-search-status',
  tabs: 'predictive-search-tabs',
  empty: 'predictive-search-empty',
  error: 'predictive-search-error',
  recent: 'predictive-search-recent',
  // Đề xuất (chưa có trong hợp đồng, hỏi dev-fe ở ES1-T484): khối khám phá, popular searches, câu nhắc 1 ký tự
  discover: 'predictive-search-discover',
  popular: 'predictive-search-popular',
  hint: 'predictive-search-hint',
};
const S = {
  form: 'search-form',
  status: 'search-status',
  products: 'search-products',
  grid: 'search-product-grid',
  articles: 'search-articles',
  pages: 'search-pages',
  activeFilters: 'search-active-filters',
  empty: 'search-empty',
  error: 'search-error',
  // Đề xuất (chưa có trong hợp đồng, ES1-T484)
  filterNote: 'search-filter-note',
  popular: 'search-popular',
};

const tid = (page: Page, id: string) => page.getByTestId(id);
// ui-spec search.md §10 và ES1-T128 đặt tên khác nhau: nhận cả hai
const toggleOf = (page: Page) => tid(page, 'search-filter-toggle').or(tid(page, 'collection-filter-open')).first();
const sortOf = (page: Page) => tid(page, 'search-sort').or(tid(page, 'collection-sort')).first();
const drawerOf = (page: Page) => tid(page, 'filter-drawer').or(tid(page, 'collection-filter-drawer')).first();
const isDesktop = () => test.info().project.name === 'desktop';
const WIDTHS = [360, 768, 1280, 1920] as const;

const searchUrl = (q: string, extra: Record<string, string> = {}) => `/search?${new URLSearchParams({ q, ...extra })}`;
const params = (page: Page) => new URL(page.url()).searchParams;
const filterKeys = (u: URLSearchParams) => [...u.keys()].filter((k) => k.startsWith('filter.'));
const note = (type: string, description: string) => test.info().annotations.push({ type, description });

// ---------- Mock /search/suggest.json ----------
const SUGGEST = /\/search\/suggest\.json/;
type Item = Record<string, unknown>;
type Results = Partial<Record<'queries' | 'products' | 'collections' | 'pages' | 'articles', Item[]>>;

const product = (i: number, extra: Item = {}): Item => ({ title: `Bench ${i}`, url: `/collections/all?_pos=${i}`, price: '10.00', image: null, available: true, ...extra });
const link = (kind: string, i: number): Item => ({ title: `Bench ${kind} ${i}`, url: kind === 'page' ? '/pages/contact' : kind === 'article' ? '/blogs/news' : '/collections/all' });
const query = (text: string): Item => ({ text, styled_text: `<mark>${text.slice(0, 3)}</mark>${text.slice(3)}`, url: `/search?q=${encodeURIComponent(text)}` });

function build(n: { queries?: number; products?: number; collections?: number; pages?: number; articles?: number }): Results {
  const range = (k = 0) => Array.from({ length: k }, (_, i) => i + 1);
  return {
    queries: range(n.queries).map((i) => query(`bench ${['press', 'pad', 'rack', 'set', 'pro'][i - 1] ?? i}`)),
    products: range(n.products).map((i) => product(i)),
    collections: range(n.collections).map((i) => link('collection', i)),
    pages: range(n.pages).map((i) => link('page', i)),
    articles: range(n.articles).map((i) => link('article', i)),
  };
}
const FULL = build({ queries: 4, products: 8, collections: 2, pages: 0, articles: 1 });
const NONE = build({});

type Reply = Results | { status: number } | 'abort';
async function mockSuggest(page: Page, reply: (q: string, n: number) => Reply = () => FULL, delay: (q: string, n: number) => number = () => 0) {
  const requests: Request[] = [];
  page.on('request', (r) => SUGGEST.test(r.url()) && requests.push(r));
  let n = 0;
  await page.route(SUGGEST, async (route) => {
    const q = new URL(route.request().url()).searchParams.get('q') ?? '';
    const i = n++;
    const wait = delay(q, i);
    if (wait) await new Promise((r) => setTimeout(r, wait));
    const r = reply(q, i);
    if (r === 'abort') return route.abort('failed').catch(() => {});
    if ('status' in r) return route.fulfill({ status: (r as { status: number }).status, body: 'error' }).catch(() => {});
    await route.fulfill({ json: { resources: { results: r } } }).catch(() => {});
  });
  return requests;
}

async function openOverlay(page: Page, path = '/') {
  await gotoStore(page, path);
  await tid(page, P.link).click();
  await expect(tid(page, P.dialog)).toBeVisible();
  await page.waitForFunction(() => !!customElements.get('predictive-search'));
}

async function typeAndWait(page: Page, text: string) {
  await tid(page, P.input).fill(text);
  await expect(tid(page, P.listbox)).toBeVisible();
}

const groupOf = (page: Page, key: string) => tid(page, P.group).and(page.locator(`[data-predictive-group="${key}"]`));
const tabsOf = (page: Page) => tid(page, P.tabs).getByRole('tab');
const visibleCount = (scope: Locator) =>
  scope.evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null || (e as HTMLElement).getClientRects().length > 0).length);

async function expectAxeClean(page: Page, include?: string) {
  await expectNotChallenged(page);
  let builder = new AxeBuilder({ page });
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(bad.map((v) => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`), `axe ${include ?? 'page'}`).toEqual([]);
}

/** Số cột: số vị trí x khác nhau của các phần tử nằm ở hàng đầu (cùng top với phần tử đầu, ±2). */
async function columns(items: Locator) {
  const boxes = await items.evaluateAll((els) =>
    els.map((e) => e.getBoundingClientRect()).filter((b) => b.width > 0).map((b) => ({ x: Math.round(b.left), y: Math.round(b.top) })),
  );
  if (!boxes.length) return 0;
  const top = boxes[0].y;
  return new Set(boxes.filter((b) => Math.abs(b.y - top) <= 2).map((b) => b.x)).size;
}

const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

// ---------- Trang search ----------
async function openSearchPage(page: Page, q: string, extra: Record<string, string> = {}) {
  need('searchPage');
  await gotoStore(page, searchUrl(q, extra));
  await expect(tid(page, S.form)).toBeVisible();
}

const filterInputs = (page: Page) => drawerOf(page).getByTestId('collection-filter-input');
const hasFilters = async (page: Page) => (await drawerOf(page).getByTestId('collection-filter-group').count()) > 0;

/** Chỉ số input chưa tick, không disabled; most = true thì lấy giá trị có số đếm lớn nhất. */
async function freeInputIndex(page: Page, most = false) {
  return filterInputs(page).evaluateAll((els, pickMost) => {
    let best = -1;
    let bestCount = -1;
    els.forEach((e, i) => {
      const input = e as HTMLInputElement;
      if (input.checked || input.disabled) return;
      const count = Number((input.closest('label')?.textContent ?? '').match(/(\d+)\s*$/)?.[1] ?? 0);
      if (best < 0 || (pickMost && count > bestCount)) {
        best = i;
        bestCount = count;
      }
    });
    return best;
  }, most);
}

async function openDrawer(page: Page) {
  await toggleOf(page).click();
  await expect(drawerOf(page)).toBeVisible();
}

const waitRefresh = (page: Page) =>
  page.waitForResponse((r) => ['fetch', 'xhr'].includes(r.request().resourceType()) && isStoreRefresh(r.url(), page.url()), { timeout: 20_000 });

/** Request document của khung chính sau thời điểm gọi: có JS thì lọc, sắp xếp, sang trang không được tải lại trang. */
function watchNavigations(page: Page) {
  const urls: string[] = [];
  page.on('request', (r) => {
    try {
      if (r.isNavigationRequest() && r.frame() === page.mainFrame()) urls.push(r.url());
    } catch {
      /* iframe chưa gắn: không phải khung chính */
    }
  });
  return urls;
}

async function tickFirstFilter(page: Page, most = false) {
  await openDrawer(page);
  const i = await freeInputIndex(page, most);
  test.skip(i < 0, 'dữ liệu: không còn giá trị filter tick được');
  const input = filterInputs(page).nth(i);
  const label = input.locator('xpath=ancestor::label[1]');
  return { input, label, name: (await input.getAttribute('name'))!, value: (await input.getAttribute('value'))! };
}

// =====================================================================
test.describe('ES1-T131 tĩnh', () => {
  test.beforeEach(() => test.skip(!isDesktop(), 'đọc repo, chạy 1 lần'));

  test('TC-12 AC4 popular_searches: theme setting text, default rỗng; header và search-results không có setting cùng id', () => {
    need('popularSetting');
    const groups = JSON.parse(SETTINGS) as Array<{ name?: string; settings?: Array<Record<string, unknown>> }>;
    const owner = groups.find((g) => g.settings?.some((s) => s.id === 'popular_searches'))!;
    const setting = owner.settings!.find((s) => s.id === 'popular_searches')!;
    expect(setting.type).toBe('text');
    expect(setting.default ?? '', 'theme mới cài: default rỗng (ES1-T308 #1)').toBe('');
    expect(String(owner.name), 'nhóm Search').toMatch(/search/i);
    const schemaOf = (file: string) => read(file).split('{% schema %}')[1] ?? '';
    for (const file of ['blocks/header.liquid', 'blocks/search-results.liquid']) {
      expect(schemaOf(file), file).not.toMatch(/"id"\s*:\s*"popular_searches"/);
    }
  });

  test('cổng: ghi trạng thái phần đã merge vào annotation', () => {
    for (const [k, v] of Object.entries(HAS)) note(`cổng ${k}`, v ? 'có' : WAIT[k as keyof typeof HAS]);
    note('dữ liệu', JSON.stringify({ ...Q, popular: POPULAR.length }));
  });
});

// =====================================================================
test.describe('ES1-T131 predictive (có JS)', () => {
  test('TC-01 AC1 dữ liệu thật: 4 nhóm, product có ảnh, tên, giá; ↓ Enter mở option', async ({ page }) => {
    test.skip(!Q.all, 'chưa có TE8_QUERY_ALL (ES1-T125 chưa ghi khoá vào store-data.json)');
    const watch = watchStore(page);
    await openOverlay(page);
    await typeAndWait(page, Q.all!);
    for (const key of ['products', 'collections', 'pages', 'articles']) await expect(groupOf(page, key), key).toBeVisible();
    const first = groupOf(page, 'products').getByTestId(P.option).first();
    await expect(first.locator('[data-predictive-title]')).toHaveText(/\S/);
    await expect(first.locator('[data-predictive-price]')).toHaveText(/\d/);
    await expect(first.locator('img')).toHaveAttribute('srcset', /width=64/);
    await watch.finish();
    const href = new URL((await tid(page, P.option).first().getAttribute('href'))!, page.url());
    await tid(page, P.input).press('ArrowDown');
    await clickAndLoad(page, () => tid(page, P.input).press('Enter'));
    expect(new URL(page.url()).pathname).toBe(href.pathname);
  });

  test('TC-02 AC1 AC2 Enter khi chưa chọn option sang /search, q giữ trong ô của trang kết quả', async ({ page }) => {
    test.fail(
      !isDesktop() && SEARCH_OVERFLOW_B01,
      'ES1-T131-B01: templates/search.liquid ô tìm size="50" tràn ngang ở 412px, view transition sang /search huỷ "Viewport size changed" (pageerror)',
    );
    const watch = watchStore(page);
    await openOverlay(page);
    const q = Q.all ?? Q.paged;
    await tid(page, P.input).fill(q);
    await clickAndLoad(page, () => tid(page, P.input).press('Enter'));
    expect(new URL(page.url()).pathname).toMatch(/\/search$/);
    expect(params(page).get('q')).toBe(q);
    if (HAS.searchPage) await expect(tid(page, S.form).getByRole('searchbox')).toHaveValue(q);
    else await expect(page.getByRole('main').getByRole('searchbox')).toHaveValue(q);
    await watch.finish();
  });

  test('TC-04 AC1 AC10 axe 0 serious khi list mở, có option active', async ({ page }) => {
    await mockSuggest(page);
    await openOverlay(page);
    await typeAndWait(page, 'bench');
    await tid(page, P.input).press('ArrowDown');
    await expectAxeClean(page, `[data-testid="${P.dialog}"]`);
  });

  test.describe('AC10 tab', () => {
    test.beforeEach(() => need('tabs'));

    test('TC-05 AC10 tablist: All + tab mỗi nhóm có kết quả kèm số, đủ 8 thì 8+, nhóm 0 không có tab', async ({ page }) => {
      const watch = watchStore(page);
      await mockSuggest(page);
      await openOverlay(page);
      await typeAndWait(page, 'bench');
      await expect(tid(page, P.tabs)).toHaveAttribute('role', 'tablist');
      const tabs = tabsOf(page);
      await expect(tabs).toHaveCount(4);
      await expect(tabs.nth(0)).toContainText(/All/);
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
      await expect(tabs.filter({ hasText: /Products/ })).toContainText('8+');
      await expect(tabs.filter({ hasText: /Collections/ })).toContainText('2');
      await expect(tabs.filter({ hasText: /Articles/ })).toContainText('1');
      await expect(tabs.filter({ hasText: /Pages/ })).toHaveCount(0);
      await watch.finish();
    });

    test('TC-06 AC10 đổi tab bằng bấm, ←/→, Enter, Space không gọi lại server; nút chân theo tab', async ({ page }) => {
      const requests = await mockSuggest(page);
      await openOverlay(page);
      await typeAndWait(page, 'bench');
      await expect.poll(() => requests.length).toBe(1);
      const tabs = tabsOf(page);
      const products = tabs.filter({ hasText: /Products/ });

      await products.click();
      await expect(products).toHaveAttribute('aria-selected', 'true');
      await expect(groupOf(page, 'products')).toBeVisible();
      for (const key of ['collections', 'articles', 'pages', 'queries']) await expect(groupOf(page, key), key).toBeHidden();
      expect(await visibleCount(groupOf(page, 'products').getByTestId(P.option))).toBe(8);
      const all = tid(page, P.all);
      await expect(all).toContainText('View all products for');
      const href = new URL((await all.getAttribute('href'))!, page.url());
      expect(href.searchParams.get('q')).toBe('bench');
      expect(href.searchParams.get('type')).toBe('product');

      await products.press('ArrowRight');
      await expect(tabs.filter({ hasText: /Collections/ })).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('ArrowLeft');
      await expect(products).toHaveAttribute('aria-selected', 'true');
      await tabs.nth(0).focus();
      await page.keyboard.press('Enter');
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
      await expect(all).toContainText('View all results for');
      await products.focus();
      await page.keyboard.press('Space');
      await expect(products).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(500);
      expect(requests, 'đổi tab không gọi server').toHaveLength(1);
    });

    test('TC-07 AC10 gõ tiếp giữ tab đang chọn; tab về 0 thì về All', async ({ page }) => {
      await mockSuggest(page, (q) => (q === 'benchxx' ? build({ products: 2 }) : FULL));
      await openOverlay(page);
      await typeAndWait(page, 'bench');
      const collections = tabsOf(page).filter({ hasText: /Collections/ });
      await collections.click();
      await tid(page, P.input).fill('benchx');
      await expect(tid(page, P.listbox)).toBeVisible();
      await page.waitForTimeout(600);
      await expect(collections).toHaveAttribute('aria-selected', 'true');
      await tid(page, P.input).fill('benchxx');
      await expect(tabsOf(page).filter({ hasText: /Collections/ })).toHaveCount(0);
      await expect(tabsOf(page).nth(0)).toHaveAttribute('aria-selected', 'true');
    });

    test('TC-08 AC10 tab All: ≤ 4 từ khoá, ≤ 4 sản phẩm, ≤ 3 mỗi nhóm khác; từ khoá tô phần thêm', async ({ page }) => {
      await mockSuggest(page, () => build({ queries: 6, products: 8, collections: 8, pages: 8, articles: 8 }));
      await openOverlay(page);
      await typeAndWait(page, 'bench');
      const limits: Record<string, number> = { queries: 4, products: 4, collections: 3, pages: 3, articles: 3 };
      for (const [key, max] of Object.entries(limits)) {
        const n = await visibleCount(groupOf(page, key).getByTestId(P.option));
        expect(n, key).toBeGreaterThan(0);
        expect(n, key).toBeLessThanOrEqual(max);
      }
      await expect(groupOf(page, 'queries').locator('mark, strong, b').first()).toBeVisible();
    });

    test('TC-09 AC10 chọn từ khoá gợi ý: điền ô, chạy gợi ý tại chỗ, không rời trang', async ({ page }) => {
      const requests = await mockSuggest(page);
      await openOverlay(page);
      await typeAndWait(page, 'bench');
      const before = page.url();
      const option = groupOf(page, 'queries').getByTestId(P.option).first();
      const text = (await option.innerText()).trim();
      await option.click();
      await expect(tid(page, P.input)).toHaveValue(text);
      await expect.poll(() => requests.map((r) => new URL(r.url()).searchParams.get('q'))).toContain(text);
      expect(page.url()).toBe(before);
      await expect(tid(page, P.dialog)).toBeVisible();
    });

    test('TC-10 AC10 hết hàng: request unavailable_products=last, option có chữ Sold out', async ({ page }) => {
      const requests = await mockSuggest(page, () => ({ products: [product(1), product(2, { available: false, title: 'Bench sold' })] }));
      await openOverlay(page);
      await typeAndWait(page, 'bench');
      expect(new URL(requests[0].url()).searchParams.get('resources[options][unavailable_products]')).toBe('last');
      await expect(groupOf(page, 'products').getByTestId(P.option).filter({ hasText: 'Bench sold' })).toContainText(/Sold out/i);
    });

    test('TC-11 AC10 tab Products: lưới 2/4/5/5 cột ở 360/768/1280/1920, không cuộn ngang', async ({ page }) => {
      test.skip(!isDesktop(), 'ma trận mốc chạy ở project desktop');
      await mockSuggest(page);
      const expected: Record<number, number> = { 360: 2, 768: 4, 1280: 5, 1920: 5 };
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await openOverlay(page);
        await typeAndWait(page, 'bench');
        await tabsOf(page).filter({ hasText: /Products/ }).click();
        expect(await columns(groupOf(page, 'products').getByTestId(P.option)), `${width}`).toBe(expected[width]);
        expect(await noHorizontalScroll(page), `${width} cuộn ngang`).toBe(true);
      }
    });
  });

  test.describe('AC4 popular searches (store dev đã cấu hình)', () => {
    test.beforeEach(() => {
      need('popularSetting', 'discover');
      test.skip(!POPULAR.length, NO_POPULAR);
    });

    test('TC-13 TC-16 AC4 overlay ô trống: chip đúng thứ tự, tối đa 5, link /search?q=, cao 44 (40 từ 80rem)', async ({ page }) => {
      await openOverlay(page);
      const chips = tid(page, P.popular).getByRole('link');
      const expected = POPULAR.slice(0, 5);
      await expect(chips).toHaveText(expected);
      for (const [i, phrase] of expected.entries()) {
        const href = new URL((await chips.nth(i).getAttribute('href'))!, page.url());
        expect(href.pathname).toMatch(/\/search$/);
        expect(href.searchParams.get('q')).toBe(phrase);
      }
      const h = (await chips.first().boundingBox())!.height;
      const wide = (page.viewportSize()?.width ?? 0) >= 1280;
      expect(Math.round(h)).toBeGreaterThanOrEqual(wide ? 40 : 44);
    });

    test('TC-14 AC4 bấm chip trong overlay: chữ vào ô, gợi ý chạy tại chỗ', async ({ page }) => {
      const requests = await mockSuggest(page);
      await openOverlay(page);
      const before = page.url();
      await tid(page, P.popular).getByRole('link').first().click();
      await expect(tid(page, P.input)).toHaveValue(POPULAR[0]);
      await expect.poll(() => requests.map((r) => new URL(r.url()).searchParams.get('q'))).toContain(POPULAR[0]);
      expect(page.url()).toBe(before);
    });

    test('TC-15 AC4 trang search S1 (chưa có q) và S2 (0 kết quả) có cùng chip', async ({ page }) => {
      need('searchPage');
      for (const path of ['/search', searchUrl(Q.none)]) {
        await gotoStore(page, path);
        await expect(tid(page, S.popular).getByRole('link'), path).toHaveText(POPULAR.slice(0, 5));
      }
    });
  });

  test.describe('AC11 khám phá', () => {
    test('TC-17 AC11 ô trống: khối khám phá, không tab, không nút chân, không khối rỗng', async ({ page }) => {
      need('discover');
      const watch = watchStore(page);
      await openOverlay(page);
      const discover = tid(page, P.discover);
      // Merchant chưa chọn nguồn nào và chưa có recent: khối không render cũng đúng (AC11 theme mới cài)
      if (await discover.isVisible()) {
        const empty = await discover.evaluate((root) =>
          [...root.querySelectorAll(':scope > *')]
            .filter((el) => (el as HTMLElement).offsetParent !== null)
            .filter((el) => !el.querySelector('a[href], button'))
            .map((el) => el.outerHTML.slice(0, 120)),
        );
        expect(empty, 'khối con hiện mà không có link').toEqual([]);
      } else note('AC11', 'khối khám phá không hiện: 3 nguồn rỗng, chưa có recent');
      await expect(tid(page, P.tabs)).toBeHidden();
      await expect(tid(page, P.all)).toBeHidden();
      await watch.finish();
    });

    test('TC-18 AC11 1 ký tự: câu nhắc nối aria-describedby, không request', async ({ page }) => {
      need('discover', 'states');
      const requests = await mockSuggest(page);
      await openOverlay(page);
      await tid(page, P.input).fill('b');
      const hint = tid(page, P.hint);
      await expect(hint).toHaveText('Type at least 2 characters to see suggestions.');
      const id = await hint.getAttribute('id');
      expect(id).toBeTruthy();
      expect((await tid(page, P.input).getAttribute('aria-describedby')) ?? '').toContain(id!);
      await page.waitForTimeout(600);
      expect(requests).toHaveLength(0);
    });

    test('TC-19 AC11 mọi nhóm 0: không tab, hộp No results, khám phá dưới, nút chân Shop All Products', async ({ page }) => {
      need('states', 'discover');
      await mockSuggest(page, () => NONE);
      await openOverlay(page);
      await tid(page, P.input).fill('zzqx');
      const empty = tid(page, P.empty);
      await expect(empty).toBeVisible();
      await expect(empty).toContainText('No results for');
      await expect(empty).toContainText('zzqx');
      await expect(tid(page, P.tabs)).toBeHidden();
      const all = tid(page, P.all);
      await expect(all).toContainText('Shop All Products');
      expect(new URL((await all.getAttribute('href'))!, page.url()).pathname).toMatch(/\/collections\/all$/);
      const discover = tid(page, P.discover);
      if (await discover.isVisible()) {
        const below = await empty.evaluate((a, b) => !!(a.compareDocumentPosition(b!) & Node.DOCUMENT_POSITION_FOLLOWING), await discover.elementHandle());
        expect(below, 'khám phá nằm sau hộp 0 kết quả').toBe(true);
      }
    });

    test('TC-20 AC11 0 sản phẩm có bài: không tab Products, dòng No products match', async ({ page }) => {
      need('states', 'tabs');
      await mockSuggest(page, () => build({ articles: 2 }));
      await openOverlay(page);
      await typeAndWait(page, 'bench');
      await expect(tabsOf(page).filter({ hasText: /Products/ })).toHaveCount(0);
      await expect(tid(page, P.root).getByText(/No products match/)).toBeVisible();
    });
  });

  test.describe('AC12 đang tải, lỗi', () => {
    test.beforeEach(() => need('states'));

    test('TC-21 AC12 lần đầu chậm: aria-busy, Loading suggestions…, nút chân bấm được', async ({ page }) => {
      await mockSuggest(page, () => FULL, () => 1500);
      await openOverlay(page);
      await tid(page, P.input).fill('bench');
      await page.waitForTimeout(300 + 250);
      await expect(tid(page, P.root).locator('[aria-busy="true"]').first()).toBeAttached();
      await expect(tid(page, P.status)).toHaveText(/Loading suggestions/);
      const all = tid(page, P.all);
      await expect(all).toBeVisible();
      await expect(all).toBeEnabled();
      expect(new URL((await all.getAttribute('href'))!, page.url()).searchParams.get('q')).toBe('bench');
      await expect(tid(page, P.listbox)).toBeVisible({ timeout: 5000 });
      await expect(tid(page, P.root).locator('[aria-busy="true"]')).toHaveCount(0);
    });

    test('TC-22 AC12 gõ tiếp khi đã có kết quả: giữ kết quả cũ tới khi có mới', async ({ page }) => {
      await mockSuggest(
        page,
        (q) => (q === 'bench' ? { products: [product(1, { title: 'OLD RESULT' })] } : { products: [product(2, { title: 'NEW RESULT' })] }),
        (q) => (q === 'bench' ? 0 : 1500),
      );
      await openOverlay(page);
      await typeAndWait(page, 'bench');
      await expect(tid(page, P.listbox)).toContainText('OLD RESULT');
      await tid(page, P.input).pressSequentially('e');
      await page.waitForTimeout(700);
      await expect(tid(page, P.listbox), 'kết quả cũ giữ khi đang tải').toContainText('OLD RESULT');
      await expect(tid(page, P.listbox)).toContainText('NEW RESULT', { timeout: 5000 });
      await expect(tid(page, P.listbox)).not.toContainText('OLD RESULT');
    });

    for (const mode of ['500', 'abort'] as const) {
      test(`TC-23 AC12 lỗi ${mode}: alert + Try Again gọi lại, lành thì hiện kết quả; 0 console error`, async ({ page }) => {
        const watch = watchStore(page);
        watch.allowNetworkLog();
        let broken = true;
        const requests = await mockSuggest(page, () => (broken ? (mode === '500' ? { status: 500 } : 'abort') : FULL));
        await openOverlay(page);
        await tid(page, P.input).fill('bench');
        const error = tid(page, P.error);
        await expect(error).toBeVisible();
        await expect(error).toHaveAttribute('role', 'alert');
        await expect(error).toContainText('Suggestions are unavailable right now');
        const sent = requests.length;
        broken = false;
        await error.getByRole('button', { name: 'Try Again' }).click();
        await expect.poll(() => requests.length).toBe(sent + 1);
        await expect(tid(page, P.listbox)).toBeVisible();
        await expect(error).toBeHidden();
        await watch.finish();
      });
    }

    test('TC-24 AC12 chờ quá 5 s: hộp lỗi; Enter vẫn mở trang kết quả', async ({ page }) => {
      test.setTimeout(60_000);
      await mockSuggest(page, () => FULL, () => 9000);
      await openOverlay(page);
      await tid(page, P.input).fill('bench');
      await expect(tid(page, P.error)).toBeVisible({ timeout: 5000 + 300 + 2000 });
      await clickAndLoad(page, () => tid(page, P.input).press('Enter'));
      expect(params(page).get('q')).toBe('bench');
    });
  });

  test.describe('AC13 recent searches (Should, chỉ khi TE-8-R2-BE3 không bị cắt)', () => {
    test.beforeEach(() => need('recent'));

    test('TC-25 AC13 tối đa 5, mới nhất đầu, không trùng; Clear xoá hết', async ({ page }) => {
      await mockSuggest(page);
      const terms = ['alpha', 'bravo', 'charlie', 'delta', 'bravo', 'echo', 'foxtrot'];
      await openOverlay(page);
      for (const term of terms) {
        if (!(await tid(page, P.dialog).isVisible())) await tid(page, P.link).click();
        await tid(page, P.input).fill(term);
        await clickAndLoad(page, () => tid(page, P.input).press('Enter'));
      }
      await tid(page, P.link).click();
      await tid(page, P.input).fill('');
      const recent = tid(page, P.recent);
      await expect(recent).toBeVisible();
      await expect(recent.getByRole('link')).toHaveText(['foxtrot', 'echo', 'bravo', 'delta', 'charlie']);
      await recent.getByRole('button', { name: 'Clear recent searches' }).click();
      await expect(recent).toBeHidden();
    });

    test('TC-26 AC13 localStorage bị chặn: không khối recent, 0 console error', async ({ page }) => {
      const watch = watchStore(page);
      await page.addInitScript(() => {
        const deny = () => {
          throw new DOMException('denied', 'SecurityError');
        };
        Object.defineProperty(window, 'localStorage', { get: deny, configurable: true });
      });
      await mockSuggest(page);
      await openOverlay(page);
      await tid(page, P.input).fill('bench');
      await clickAndLoad(page, () => tid(page, P.input).press('Enter'));
      await tid(page, P.link).click();
      await tid(page, P.input).fill('');
      await expect(tid(page, P.recent)).toBeHidden();
      await watch.finish();
    });
  });
});

// =====================================================================
test.describe('ES1-T131 trang search', () => {
  test('TC-27 AC2 nhóm theo object_type: Products → Articles → Pages, h2 mỗi nhóm, 1 h1', async ({ page }) => {
    test.skip(!Q.all, 'chưa có TE8_QUERY_ALL (ES1-T125)');
    const watch = watchStore(page);
    await openSearchPage(page, Q.all!);
    await expect(page.locator('h1')).toHaveCount(1);
    const order = [S.products, S.articles, S.pages];
    for (const id of order) {
      await expect(tid(page, id), id).toBeVisible();
      await expect(tid(page, id).getByRole('heading', { level: 2 }).first(), id).toBeVisible();
    }
    const positions = await Promise.all(order.map((id) => tid(page, id).evaluate((el) => el.getBoundingClientRect().top + window.scrollY)));
    // Từ 64rem Articles và Pages cạnh nhau: so DOM order thay vì toạ độ y
    const domOrder = await page.evaluate((ids) => {
      const els = ids.map((id) => document.querySelector(`[data-testid="${id}"]`)!);
      return els.every((el, i) => i === 0 || !!(els[i - 1].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING));
    }, order);
    expect(domOrder, `thứ tự ${positions.join(',')}`).toBe(true);
    await expect(tid(page, S.products).getByTestId('product-card').first()).toBeVisible();
    await watch.finish();
  });

  test('TC-28 AC2 > 1 trang: Showing x–y of z khớp số kết quả; trang 2 bắt đầu y + 1', async ({ page }) => {
    await openSearchPage(page, Q.paged);
    test.skip((await tid(page, 'pagination').count()) === 0, `dữ liệu: /search?q=${Q.paged} chỉ 1 trang (ES1-T125 #2)`);
    const summary = tid(page, 'pagination-summary');
    const parse = async () => {
      const m = (await summary.innerText()).replace(/,/g, '').match(/Showing\s+(\d+)\D+(\d+)\s+of\s+(\d+)\s+results/);
      expect(m, 'dạng "Showing x–y of z results"').toBeTruthy();
      return m!.slice(1).map(Number) as [number, number, number];
    };
    const items = async () =>
      (await tid(page, S.products).getByTestId('product-card').count()) +
      (await tid(page, S.articles).getByRole('listitem').count()) +
      (await tid(page, S.pages).getByRole('listitem').count());
    const [x1, y1, z1] = await parse();
    expect(x1).toBe(1);
    expect(y1).toBe(await items());
    const total = Number((await tid(page, S.status).innerText()).replace(/,/g, '').match(/\d+/)?.[0]);
    expect(z1, 'z khớp dòng trạng thái').toBe(total);
    await clickAndLoad(page, () => tid(page, 'pagination-next').click());
    const [x2, y2, z2] = await parse();
    expect(x2).toBe(y1 + 1);
    expect(y2 - x2 + 1).toBe(await items());
    expect(z2).toBe(z1);
    expect(params(page).get('q')).toBe(Q.paged);
  });

  test('TC-29 AC2 dòng Showing chỉ ở search: /collections/all không có', async ({ page }) => {
    await gotoStore(page, '/collections/all');
    test.skip((await tid(page, 'pagination').count()) === 0, 'dữ liệu: /collections/all chỉ 1 trang');
    await expect(tid(page, 'pagination-summary')).toHaveCount(0);
  });

  test('TC-30 AC2 0 kết quả: status No results, panel Nothing Matches + Shop All Products', async ({ page }) => {
    const watch = watchStore(page);
    await openSearchPage(page, Q.none);
    await expect(tid(page, S.status)).toContainText('No results for');
    await expect(tid(page, S.status)).toContainText(Q.none);
    const empty = tid(page, S.empty);
    await expect(empty.getByRole('heading', { level: 2 })).toContainText('Nothing Matches');
    const shopAll = empty.getByRole('link', { name: 'Shop All Products' });
    expect(new URL((await shopAll.getAttribute('href'))!, page.url()).pathname).toMatch(/\/collections\/all$/);
    await expect(tid(page, S.grid)).toHaveCount(0);
    await watch.finish();
  });

  test('TC-31 AC2 q chứa thẻ HTML hiện như chữ, không tạo phần tử, 0 pageerror', async ({ page }) => {
    const watch = watchStore(page);
    const q = '<img src=x onerror=alert(1) data-te131-xss>';
    await openSearchPage(page, q);
    await expect(page.locator('[data-te131-xss]')).toHaveCount(0);
    await expect(tid(page, S.status)).toContainText('<img');
    await watch.finish();
  });

  test('TC-32 AC2 axe 0 serious: có kết quả, 0 kết quả, drawer lọc mở', async ({ page }) => {
    const watch = watchStore(page);
    await openSearchPage(page, Q.filter);
    await expectAxeClean(page, 'main');
    if (await hasFilters(page)) {
      await openDrawer(page);
      await expectAxeClean(page, `[data-testid="${await drawerOf(page).getAttribute('data-testid')}"]`);
      await page.keyboard.press('Escape');
    } else note('TC-32', NO_FILTERS(Q.filter));
    await gotoStore(page, searchUrl(Q.none));
    await expectAxeClean(page, 'main');
    await watch.finish();
  });

  test('TC-33 AC2 lưới 2/3/4/4 cột ở 360/768/1280/1920, không cuộn ngang', async ({ page }) => {
    test.skip(!isDesktop(), 'ma trận mốc chạy ở project desktop');
    const expected: Record<number, number> = { 360: 2, 768: 3, 1280: 4, 1920: 4 };
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await openSearchPage(page, Q.paged, { type: 'product' });
      expect(await columns(tid(page, S.products).getByTestId('product-card')), `${width}`).toBe(expected[width]);
      expect(await noHorizontalScroll(page), `${width} cuộn ngang`).toBe(true);
    }
  });

  test('TC-37 AC2 href phân trang giữ filter, sort_by, q, type (ES1-T104 #5)', async ({ page }) => {
    await openSearchPage(page, Q.filter, { type: 'product' });
    test.skip(!(await hasFilters(page)), NO_FILTERS(Q.filter));
    // Áp filter có nhiều kết quả nhất + sort khác mặc định qua URL (không cần JS)
    await openDrawer(page);
    const i = await freeInputIndex(page, true);
    test.skip(i < 0, 'dữ liệu: không còn giá trị filter tick được');
    const input = filterInputs(page).nth(i);
    const [name, value] = [(await input.getAttribute('name'))!, (await input.getAttribute('value'))!];
    const sortValues = await sortOf(page).locator('option').evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
    const sort = sortValues.find((v) => v && v !== 'relevance') ?? sortValues[0];
    await gotoStore(page, `${searchUrl(Q.filter, { type: 'product', sort_by: sort })}&${new URLSearchParams({ [name]: value })}`);
    test.skip((await tid(page, 'pagination').count()) === 0, 'dữ liệu: filter đã áp chỉ 1 trang');
    const hrefs = await tid(page, 'pagination')
      .locator('a[href]')
      .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const u = new URL(href).searchParams;
      expect(u.get('q'), href).toBe(Q.filter);
      expect(u.get('type'), href).toBe('product');
      expect(u.get('sort_by'), href).toBe(sort);
      expect(u.getAll(name), href).toContain(value);
    }
  });

  test('TC-41 AC7 filter đang áp: dòng filter-note; ghi lại nhóm Articles/Pages (ES1-T124 #4)', async ({ page }) => {
    await openSearchPage(page, Q.filter);
    test.skip(!(await hasFilters(page)), NO_FILTERS(Q.filter));
    const before = { articles: await tid(page, S.articles).count(), pages: await tid(page, S.pages).count() };
    await openDrawer(page);
    const i = await freeInputIndex(page);
    test.skip(i < 0, 'dữ liệu: không còn giá trị filter tick được');
    const input = filterInputs(page).nth(i);
    const [name, value] = [(await input.getAttribute('name'))!, (await input.getAttribute('value'))!];
    await gotoStore(page, `${searchUrl(Q.filter)}&${new URLSearchParams({ [name]: value })}`);
    await expect(tid(page, S.filterNote)).toHaveText(/Filters apply to products only\. Clear them to see articles and pages\./);
    const after = { articles: await tid(page, S.articles).count(), pages: await tid(page, S.pages).count() };
    note('ES1-T124 #4 hành vi thật', `trước filter ${JSON.stringify(before)}, sau filter ${JSON.stringify(after)}`);
  });

  test('TC-42 AC7 drawer lọc mọi mốc: 90%/420, h2 Filters, Close filters, status; Esc trả focus nút Filter', async ({ page }) => {
    test.skip(!isDesktop(), 'ma trận mốc chạy ở project desktop');
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await openSearchPage(page, Q.filter);
      test.skip(!(await hasFilters(page)), NO_FILTERS(Q.filter));
      await openDrawer(page);
      const drawer = drawerOf(page);
      const box = (await drawer.boundingBox())!;
      expect(Math.abs(box.width - (width === 360 ? 324 : 420)), `${width} rộng ${box.width}`).toBeLessThanOrEqual(2);
      expect(box.x, `${width} drawer trái`).toBeLessThanOrEqual(1);
      await expect(drawer.getByRole('heading', { level: 2, name: 'Filters' })).toBeVisible();
      await expect(drawer.getByRole('button', { name: 'Close filters' })).toBeVisible();
      await expect(drawer.getByTestId('collection-filter-status')).toHaveAttribute('role', 'status');
      await page.keyboard.press('Escape');
      await expect(drawer).toBeHidden();
      await expect(toggleOf(page), `${width} focus về nút Filter`).toBeFocused();
    }
  });

  test('TC-43 AC8 S6a filter ra 0 sản phẩm: chip giữ, h3 No Products Match These Filters, Clear All Filters', async ({ page }) => {
    await openSearchPage(page, Q.filter, { type: 'product' });
    const hasPrice = (await drawerOf(page).getByTestId('collection-filter-price-min').count()) > 0;
    test.skip(!hasPrice, `${NO_FILTERS(Q.filter)}: cần filter giá`);
    // Giá tối thiểu vượt mọi sản phẩm: 0 kết quả không phụ thuộc tổ hợp dữ liệu
    await gotoStore(page, searchUrl(Q.filter, { type: 'product', 'filter.v.price.gte': '99999999' }));
    await expect(tid(page, S.activeFilters).getByRole('link').first()).toBeVisible();
    await expect(tid(page, S.products).getByRole('heading', { level: 3, name: 'No Products Match These Filters' })).toBeVisible();
    await expect(tid(page, S.products).getByRole('link', { name: 'Clear All Filters' }).or(tid(page, S.products).getByRole('button', { name: 'Clear All Filters' })).first()).toBeVisible();
  });

  test('TC-50 AC5 đổi từ khoá bỏ filter và sort_by; type-nav 4 link giữ q, 1 aria-current', async ({ page }) => {
    await openSearchPage(page, Q.filter, { type: 'product' });
    const sortValues = await sortOf(page).locator('option').evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
    const sort = sortValues.find((v) => v && v !== 'relevance') ?? sortValues[0];
    await gotoStore(page, searchUrl(Q.filter, { type: 'product', sort_by: sort, 'filter.v.price.gte': '1' }));
    const nav = tid(page, 'search-type-nav');
    const links = nav.getByRole('link');
    await expect(links).toHaveCount(4);
    for (const href of await links.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href))) {
      expect(new URL(href).searchParams.get('q'), href).toBe(Q.filter);
    }
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    const box = tid(page, S.form).getByRole('searchbox');
    await box.fill(Q.none);
    await clickAndLoad(page, () => box.press('Enter'));
    const u = params(page);
    expect(u.get('q')).toBe(Q.none);
    expect(filterKeys(u), 'đổi từ khoá không kèm filter').toEqual([]);
    expect(u.get('sort_by'), 'đổi từ khoá không kèm sort_by').toBeNull();
  });

  test('B-01 B-02 q dài 200 ký tự và q có dấu, & hiện đúng, không cuộn ngang ở 360', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    const long = 'bench '.repeat(34).slice(0, 200).trim();
    await openSearchPage(page, long);
    await expect(tid(page, S.form).getByRole('searchbox')).toHaveValue(long);
    expect(await noHorizontalScroll(page)).toBe(true);
    await openSearchPage(page, 'tạ & bench');
    await expect(tid(page, S.status)).toContainText('tạ & bench');
    await expect(tid(page, S.status)).not.toContainText('&amp;');
  });

  test('B-03 page vượt số trang: không trang trắng, có link về trang 1 hoặc empty state', async ({ page }) => {
    await openSearchPage(page, Q.paged, { page: '999' });
    const back = page.getByRole('main').getByRole('link', { name: /Go to page 1/ });
    await expect(back.or(tid(page, S.empty)).first()).toBeVisible();
  });
});

// =====================================================================
test.describe('ES1-T131 trang search: JS dùng chung TE-6', () => {
  test.beforeEach(async ({ page }) => {
    need('searchPage', 'searchJs');
    await page.addInitScript(() => {
      const w = window as unknown as { __te131: string[] };
      w.__te131 = [];
      for (const name of ['shopify:collection:update', 'shopify:search:update']) window.addEventListener(name, () => w.__te131.push(name), true);
    });
  });
  const events = (page: Page) => page.evaluate(() => (window as unknown as { __te131: string[] }).__te131);

  test('TC-34 TC-40 AC2 AC7 tick filter: không tải lại, URL giữ q và type, drawer 1 filter, badge 1; không collection:update', async ({ page }) => {
    const watch = watchStore(page);
    await openSearchPage(page, Q.filter, { type: 'product' });
    test.skip(!(await hasFilters(page)), NO_FILTERS(Q.filter));
    const nav = watchNavigations(page);
    const { label, name, value } = await tickFirstFilter(page);
    await Promise.all([waitRefresh(page), label.click()]);
    await expect.poll(() => params(page).getAll(name)).toContain(value);
    expect(params(page).get('q')).toBe(Q.filter);
    expect(params(page).get('type')).toBe('product');
    expect(nav, 'không tải lại trang').toEqual([]);
    await expect(drawerOf(page).getByTestId('collection-filter-status')).toContainText(/1 filter applied/);
    await expect(toggleOf(page)).toContainText('1');
    expect(await events(page)).not.toContain('shopify:collection:update');
    note('TC-40 shopify:search:update', (await events(page)).includes('shopify:search:update') ? 'có dispatch' : 'không dispatch');
    await watch.finish();
  });

  test('TC-35 TC-40 AC2 sort: URL sort_by, giữ q, không tải lại', async ({ page }) => {
    await openSearchPage(page, Q.filter, { type: 'product' });
    const sort = sortOf(page);
    const current = await sort.inputValue();
    const values = await sort.locator('option').evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
    const next = values.find((v) => v && v !== current);
    test.skip(!next, 'search.sort_options chỉ 1 lựa chọn');
    const nav = watchNavigations(page);
    await Promise.all([waitRefresh(page), sort.selectOption(next!)]);
    await expect.poll(() => params(page).get('sort_by')).toBe(next);
    expect(params(page).get('q')).toBe(Q.filter);
    expect(nav).toEqual([]);
    expect(await events(page)).not.toContain('shopify:collection:update');
  });

  test('TC-36 TC-40 AC2 trang 2 bằng JS giữ filter và q, focus về vùng kết quả', async ({ page }) => {
    await openSearchPage(page, Q.filter, { type: 'product' });
    test.skip(!(await hasFilters(page)), NO_FILTERS(Q.filter));
    const { label, name, value } = await tickFirstFilter(page, true);
    await Promise.all([waitRefresh(page), label.click()]);
    await page.keyboard.press('Escape');
    test.skip((await tid(page, 'pagination-next').count()) === 0, 'dữ liệu: filter có nhiều kết quả nhất vẫn chỉ 1 trang');
    const nav = watchNavigations(page);
    await Promise.all([waitRefresh(page), tid(page, 'pagination-next').click()]);
    await expect.poll(() => params(page).get('page')).toBe('2');
    expect(params(page).getAll(name)).toContain(value);
    expect(params(page).get('q')).toBe(Q.filter);
    expect(nav).toEqual([]);
    await expect(tid(page, 'pagination-current')).toHaveText('2');
    const focusInResults = await page.evaluate(() =>
      !!document.activeElement?.closest('[data-testid="search-products"],[data-testid="search-status"],[data-testid="collection-status"],[data-testid="search-product-grid"]'),
    );
    expect(focusInResults, 'focus về vùng kết quả').toBe(true);
    expect(await events(page)).not.toContain('shopify:collection:update');
  });

  test('TC-38 AC7 Clear all: bỏ tick, giữ q, không còn filter', async ({ page }) => {
    await openSearchPage(page, Q.filter, { type: 'product' });
    test.skip(!(await hasFilters(page)), NO_FILTERS(Q.filter));
    const { label } = await tickFirstFilter(page);
    await Promise.all([waitRefresh(page), label.click()]);
    const clear = drawerOf(page).getByTestId('collection-filter-clear');
    await expect(clear).toBeVisible();
    await clear.click();
    await expect.poll(() => filterKeys(params(page))).toEqual([]);
    expect(params(page).get('q')).toBe(Q.filter);
    const checked = await filterInputs(page).evaluateAll((els) => els.filter((e) => (e as HTMLInputElement).checked).length);
    expect(checked).toBe(0);
  });

  test('TC-39 AC8 S6b refresh lỗi: alert + Try Again, lưới cũ và filter đã chọn giữ', async ({ page }) => {
    const watch = watchStore(page);
    watch.allowNetworkLog();
    await openSearchPage(page, Q.filter, { type: 'product' });
    test.skip(!(await hasFilters(page)), NO_FILTERS(Q.filter));
    const cards = await tid(page, S.products).getByTestId('product-card').count();
    let block = true;
    await page.route(
      (url) => url.pathname.endsWith('/search'),
      (route) => (block && ['fetch', 'xhr'].includes(route.request().resourceType()) ? route.abort('failed') : route.fallback()),
    );
    const { input, label } = await tickFirstFilter(page);
    await label.click();
    const error = tid(page, S.error);
    await expect(error).toBeVisible();
    await expect(error).toHaveAttribute('role', 'alert');
    await expect(error).toContainText("We couldn't update the results");
    await expect(input).toBeChecked();
    expect(await tid(page, S.products).getByTestId('product-card').count()).toBe(cards);
    block = false;
    await Promise.all([waitRefresh(page), error.getByRole('button', { name: 'Try Again' }).click()]);
    await expect(error).toBeHidden();
    await watch.finish();
  });
});

// =====================================================================
test.describe('ES1-T131 nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('TC-44 AC3 icon search là link /search; submit form ra kết quả có q', async ({ page }) => {
    await gotoStore(page, '/');
    const link = tid(page, P.link);
    await expect(link).toHaveAttribute('href', /\/search$/);
    await clickAndLoad(page, () => link.click());
    expect(new URL(page.url()).pathname).toMatch(/\/search$/);
    need('searchPage');
    const box = tid(page, S.form).getByRole('searchbox');
    await box.fill(Q.paged);
    await clickAndLoad(page, () => box.press('Enter'));
    expect(params(page).get('q')).toBe(Q.paged);
    await expect(tid(page, S.status)).toContainText(Q.paged);
  });

  test('TC-45 AC3 lọc không JS: drawer popover, tick, Show N products submit GET', async ({ page }) => {
    await openSearchPage(page, Q.filter, { type: 'product' });
    test.skip(!(await hasFilters(page)), NO_FILTERS(Q.filter));
    const { label, name, value } = await tickFirstFilter(page);
    await label.click();
    await clickAndLoad(page, () => drawerOf(page).getByTestId('collection-filter-apply').click());
    expect(params(page).getAll(name)).toContain(value);
    expect(params(page).get('q')).toBe(Q.filter);
    await openDrawer(page);
    await expect(drawerOf(page).getByTestId('collection-filter-status')).toContainText(/1 filter applied/);
  });

  test('TC-46 AC3 sort không JS: chọn rồi Apply, URL sort_by, giữ q', async ({ page }) => {
    await openSearchPage(page, Q.filter, { type: 'product' });
    const sort = sortOf(page);
    const current = await sort.inputValue();
    const values = await sort.locator('option').evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
    const next = values.find((v) => v && v !== current);
    test.skip(!next, 'search.sort_options chỉ 1 lựa chọn');
    await sort.selectOption(next!);
    await clickAndLoad(page, () => tid(page, 'collection-sort-apply').click());
    expect(params(page).get('sort_by')).toBe(next);
    expect(params(page).get('q')).toBe(Q.filter);
  });

  test('TC-47 AC3 phân trang không JS: Next sang page=2, giữ q', async ({ page }) => {
    await openSearchPage(page, Q.paged);
    test.skip((await tid(page, 'pagination-next').count()) === 0, `dữ liệu: /search?q=${Q.paged} chỉ 1 trang`);
    await clickAndLoad(page, () => tid(page, 'pagination-next').click());
    expect(params(page).get('page')).toBe('2');
    expect(params(page).get('q')).toBe(Q.paged);
    await expect(tid(page, 'pagination-current')).toHaveText('2');
  });

  test('TC-48 AC3 0 kết quả không JS: panel rỗng + Shop All Products', async ({ page }) => {
    await openSearchPage(page, Q.none);
    await expect(tid(page, S.empty)).toBeVisible();
    await expect(tid(page, S.empty).getByRole('link', { name: 'Shop All Products' })).toBeVisible();
  });

  test('TC-49 AC3 AC4 AC13 không JS: chip popular là link chạy được, không khối recent', async ({ page }) => {
    need('searchPage');
    await gotoStore(page, '/search');
    await expect(tid(page, P.recent)).toBeHidden();
    test.skip(!POPULAR.length, NO_POPULAR);
    const chip = tid(page, S.popular).getByRole('link').first();
    await clickAndLoad(page, () => chip.click());
    expect(params(page).get('q')).toBe(POPULAR[0]);
  });
});
